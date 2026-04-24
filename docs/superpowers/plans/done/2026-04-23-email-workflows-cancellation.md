# E-Mail-Workflows: Zahlungsbestätigung, Offboarding & Retention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Branded payment confirmation emails, cancellation offboarding with 30-day grace period, retention/win-back emails before cancellation takes effect, and GDPR-compliant data deletion.

**Architecture:** The `paddle-webhook` Edge Function validates Paddle events and fires N8N webhooks for email delivery (via Resend). Two N8N cron workflows run daily: one for retention emails, one for data deletion. Case data is deleted 30 days after billing period end; billing records (profiles + subscriptions) are retained 10 years per § 147 AO.

**Tech Stack:** Deno Edge Functions (Supabase), N8N (Hostinger VPS), Resend (email), Paddle (payment events), Supabase PostgreSQL (storage), PostgREST (REST API for N8N queries)

---

## Context

- **N8N:** `https://n8n.srv1063720.hstgr.cloud` — API key in `.env` as `N8N_API_KEY`
- **Supabase project:** `dswhllvtewtqpiqnpbsu`
- **Supabase URL:** `https://dswhllvtewtqpiqnpbsu.supabase.co`
- **Resend API key:** in `.env` as `RESEND_API_KEY` (also visible in existing N8N workflows)
- **Supabase anon key / service role key:** in `.env` as `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (also in existing N8N onboarding workflow JSON)
- **Existing N8N onboarding workflow ID:** `elcsjZCxDmtCw2BI` — use as reference for node format
- **Edge Functions:** `supabase/functions/paddle-webhook/index.ts` and `supabase/functions/verify-and-login/index.ts`
- **Auth logic:** `frontend/js/auth.js` — `ladeSubscriptionStatus()` at line 25

## File Structure

| File | Action |
|---|---|
| `supabase/schema.sql` | Add 3 new columns to subscriptions |
| `supabase/functions/paddle-webhook/index.ts` | Handle `transaction.completed`, extend `subscription.updated`, extend `subscription.canceled` |
| `supabase/functions/verify-and-login/index.ts` | Allow grace period users to log in |
| `frontend/js/auth.js` | Update `ladeSubscriptionStatus()` for grace period |
| N8N (via API) | Create 4 new workflows |

---

## Task 1: Schema Migration

**Files:**
- Modify: `supabase/schema.sql`
- Run SQL in Supabase Dashboard

- [ ] **Step 1: Run migration SQL in Supabase Dashboard**

Go to: Supabase Dashboard → SQL Editor → New Query, then run:

```sql
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS scheduled_cancel_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS retention_email_sent_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN subscriptions.grace_period_end IS '30 days after subscription.canceled fires (end of billing period). Case data deleted when expired.';
COMMENT ON COLUMN subscriptions.scheduled_cancel_at IS 'When scheduled_change.action=cancel: the effective_at date. Used by retention email cron.';
COMMENT ON COLUMN subscriptions.retention_email_sent_at IS 'Set when retention email sent, prevents duplicate sends.';
```

Expected: `ALTER TABLE` success, no errors.

- [ ] **Step 2: Update schema.sql to reflect migration**

Add after the existing `accepted_avv_at` migration block in `supabase/schema.sql`:

```sql
-- Migration 2026-04-23: Offboarding + Retention Felder
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS scheduled_cancel_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS retention_email_sent_at TIMESTAMPTZ DEFAULT NULL;
```

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: DB-Migration – grace_period_end, scheduled_cancel_at, retention_email_sent_at in subscriptions"
```

---

## Task 2: paddle-webhook Edge Function erweitern

**Files:**
- Modify: `supabase/functions/paddle-webhook/index.ts`

The current Edge Function handles `subscription.created/updated/activated` and `subscription.canceled` (only sets status). This task extends it to:

1. On `transaction.completed` → fire N8N payment confirmation webhook
2. On `subscription.updated` with `scheduled_change.action === 'cancel'` → store `scheduled_cancel_at`, fire N8N retention webhook
3. On `subscription.canceled` → set `grace_period_end = now() + 30 days`, set `plan = 'free'`, fire N8N offboarding webhook
4. On `subscription.activated` or status back to `active` → clear `grace_period_end`, `scheduled_cancel_at`, `retention_email_sent_at` (re-subscription)

The N8N webhook URLs are:
- Payment confirmation: `https://n8n.srv1063720.hstgr.cloud/webhook/fordify-payment-confirmed`
- Offboarding: `https://n8n.srv1063720.hstgr.cloud/webhook/fordify-offboarding`
- Retention email: `https://n8n.srv1063720.hstgr.cloud/webhook/fordify-retention` (fired as early warning, N8N workflow delays sending)

- [ ] **Step 1: Replace the full `supabase/functions/paddle-webhook/index.ts` with the extended version**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PADDLE_WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET')!
const PADDLE_API_KEY        = Deno.env.get('PADDLE_API_KEY')!
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY        = Deno.env.get('RESEND_API_KEY')!
const PADDLE_API_BASE       = 'https://api.paddle.com'
const N8N_BASE              = 'https://n8n.srv1063720.hstgr.cloud/webhook'

serve(async (req) => {
  const body      = await req.text()
  const signature = req.headers.get('paddle-signature') || ''

  const isValid = await verifyPaddleSignature(body, signature, PADDLE_WEBHOOK_SECRET)
  if (!isValid) return new Response('Unauthorized', { status: 401 })

  const event   = JSON.parse(body)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { event_type, data } = event

  // ── Subscription created / updated / activated ──────────────────────────
  if (['subscription.created', 'subscription.updated', 'subscription.activated'].includes(event_type)) {
    let userId = data.custom_data?.user_id || null

    if (!userId) {
      const email = await _getPaddleCustomerEmail(data.customer_id)
      if (!email) {
        console.error('Could not resolve customer email for customer_id:', data.customer_id)
        return new Response('Could not resolve customer email', { status: 500 })
      }
      try {
        userId = await _findOrCreateUser(supabase, email)
      } catch (e) {
        console.error('_findOrCreateUser failed:', e)
        return new Response('User resolution failed', { status: 500 })
      }
      if (event_type === 'subscription.created' || event_type === 'subscription.activated') {
        await _sendMagicLink(supabase, email)
      }
    }

    const plan = data.items?.[0]?.price?.custom_data?.plan || 'pro'

    // Clear grace/retention fields if subscription is reactivated
    const clearFields = (data.status === 'active') ? {
      grace_period_end: null,
      scheduled_cancel_at: null,
      retention_email_sent_at: null
    } : {}

    const { error: upsertError } = await supabase.from('subscriptions').upsert({
      user_id:                userId,
      paddle_subscription_id: data.id,
      paddle_customer_id:     data.customer_id,
      status:                 data.status,
      plan,
      billing_cycle:          data.billing_cycle?.interval || 'month',
      current_period_end:     data.current_billing_period?.ends_at || null,
      updated_at:             new Date().toISOString(),
      ...clearFields
    }, { onConflict: 'paddle_subscription_id' })

    if (upsertError) {
      console.error('subscriptions upsert failed:', upsertError)
      return new Response('DB upsert failed', { status: 500 })
    }

    // Detect cancellation scheduled → store scheduled_cancel_at + fire retention webhook
    if (event_type === 'subscription.updated' &&
        data.scheduled_change?.action === 'cancel' &&
        data.scheduled_change?.effective_at) {
      const scheduledCancelAt = data.scheduled_change.effective_at

      await supabase.from('subscriptions')
        .update({ scheduled_cancel_at: scheduledCancelAt })
        .eq('paddle_subscription_id', data.id)

      // Fetch email for retention webhook payload
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .maybeSingle()

      if (profile?.email) {
        await _fireN8NWebhook(`${N8N_BASE}/fordify-retention`, {
          email:              profile.email,
          plan:               plan,
          billing_cycle:      data.billing_cycle?.interval || 'month',
          scheduled_cancel_at: scheduledCancelAt
        })
      }
    }
  }

  // ── Subscription canceled (billing period ended) ─────────────────────────
  if (event_type === 'subscription.canceled') {
    const gracePeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: updatedSub } = await supabase.from('subscriptions')
      .update({
        status:          'canceled',
        plan:            'free',
        grace_period_end: gracePeriodEnd,
        updated_at:      new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id)
      .select('user_id, billing_cycle')
      .maybeSingle()

    if (updatedSub?.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', updatedSub.user_id)
        .maybeSingle()

      if (profile?.email) {
        await _fireN8NWebhook(`${N8N_BASE}/fordify-offboarding`, {
          email:            profile.email,
          grace_period_end: gracePeriodEnd,
          billing_cycle:    updatedSub.billing_cycle
        })
      }
    }
  }

  // ── Transaction completed (payment received) ─────────────────────────────
  if (event_type === 'transaction.completed') {
    const customerId = data.customer_id
    const email = await _getPaddleCustomerEmail(customerId)
    if (email) {
      const totals = data.details?.totals
      const amountRaw = totals?.total ? parseInt(totals.total, 10) : null
      const currency  = totals?.currency_code || 'EUR'
      const amount    = amountRaw !== null
        ? (amountRaw / 100).toLocaleString('de-DE', { style: 'currency', currency })
        : null

      const plan = data.items?.[0]?.price?.custom_data?.plan || null

      await _fireN8NWebhook(`${N8N_BASE}/fordify-payment-confirmed`, {
        email,
        plan,
        amount,
        currency,
        transaction_id:   data.id,
        transaction_date: data.created_at
          ? new Date(data.created_at).toLocaleDateString('de-DE')
          : new Date().toLocaleDateString('de-DE')
      })
    }
  }

  return new Response('OK', { status: 200 })
})

async function _fireN8NWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })
  } catch (e) {
    console.error('N8N webhook call failed:', url, e)
  }
}

async function _getPaddleCustomerEmail(customerId: string): Promise<string | null> {
  const resp = await fetch(`${PADDLE_API_BASE}/customers/${customerId}`, {
    headers: { 'Authorization': `Bearer ${PADDLE_API_KEY}` }
  })
  if (!resp.ok) return null
  const json = await resp.json()
  return json?.data?.email || null
}

async function _findOrCreateUser(supabase: ReturnType<typeof createClient>, email: string): Promise<string> {
  const searchResp = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  )
  const searchData = await searchResp.json()
  const existing = searchData?.users?.find(
    (u: { email: string; id: string }) => u.email === email
  )
  if (existing?.id) return existing.id

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true
  })
  if (error || !data.user?.id) throw new Error(`createUser failed: ${error?.message}`)
  return data.user.id
}

async function _sendMagicLink(supabase: ReturnType<typeof createClient>, email: string): Promise<void> {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: 'https://fordify.de/konto' }
  })
  if (error || !data?.properties?.action_link) {
    console.error('generateLink failed:', error)
    return
  }
  const magicLink = data.properties.action_link

  const sendResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from:    'fordify <hallo@fordify.de>',
      to:      [email],
      subject: 'Dein fordify-Zugang ist aktiv – hier anmelden',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
          <h2 style="color:#1e3a8a;margin-bottom:0.5rem">Willkommen bei fordify!</h2>
          <p style="color:#374151">Dein Abo ist aktiv. Klicke auf den Button, um dich anzumelden und deinen Kundenbereich zu öffnen.</p>
          <a href="${magicLink}"
             style="display:inline-block;margin:1.5rem 0;padding:0.75rem 1.5rem;background:#2563eb;color:white;border-radius:6px;text-decoration:none;font-weight:600">
            Bei fordify anmelden →
          </a>
          <p style="color:#6b7280;font-size:0.85rem">
            Der Link ist 24 Stunden gültig und kann nur einmal verwendet werden.<br>
            Bitte öffne ihn in dem Browser, in dem du fordify nutzen möchtest.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0">
          <p style="color:#9ca3af;font-size:0.8rem">
            fordify · <a href="https://fordify.de/impressum" style="color:#9ca3af">Impressum</a> ·
            <a href="https://fordify.de/datenschutz" style="color:#9ca3af">Datenschutz</a>
          </p>
        </div>
      `
    })
  })
  if (!sendResp.ok) {
    const errBody = await sendResp.text()
    console.error('Resend send failed:', sendResp.status, errBody)
  }
}

async function verifyPaddleSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(signature.split(';').map(p => p.split('=')))
  const ts = parts['ts']
  const h1 = parts['h1']
  if (!ts || !h1) return false
  const tsNum = parseInt(ts, 10)
  if (isNaN(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) return false
  const signedPayload = `${ts}:${body}`
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const mac      = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === h1
}
```

- [ ] **Step 2: Verify the file was written correctly**

Check that `_fireN8NWebhook`, the `transaction.completed` block, and the `subscription.canceled` grace period logic are all present in the file.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/paddle-webhook/index.ts
git commit -m "feat: paddle-webhook – transaction.completed, grace period, retention trigger, re-subscription clear"
```

---

## Task 3: verify-and-login – Grace Period Login erlauben

**Files:**
- Modify: `supabase/functions/verify-and-login/index.ts`

Currently the function blocks login for users without `status = 'active'`. During the 30-day grace period (status='canceled' but grace_period_end in the future), users must be able to log in to export their data.

- [ ] **Step 1: Replace the subscription check block (lines 76–93) in `verify-and-login/index.ts`**

Current code (lines 76–93):
```typescript
  // 2. Check for active subscription (Issue 3 fix: handle DB errors)
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (subError) {
    console.error('subscription lookup failed:', subError)
    return new Response(
      JSON.stringify({ error: 'server_error' }),
      { status: 503, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }

  if (!sub) {
    return _noSubscriptionResponse(req)
  }
```

Replace with:
```typescript
  // 2. Check for active subscription OR active grace period
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('status, grace_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    console.error('subscription lookup failed:', subError)
    return new Response(
      JSON.stringify({ error: 'server_error' }),
      { status: 503, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }

  const isActive = sub?.status === 'active'
  const isInGracePeriod = sub?.status === 'canceled' &&
    sub?.grace_period_end != null &&
    new Date(sub.grace_period_end) > new Date()

  if (!isActive && !isInGracePeriod) {
    return _noSubscriptionResponse(req)
  }
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/verify-and-login/index.ts
git commit -m "feat: verify-and-login – Grace-Period-Nutzer dürfen sich einloggen"
```

---

## Task 4: auth.js – Grace Period im Frontend

**Files:**
- Modify: `frontend/js/auth.js` (lines 25–40)
- Modify: `frontend/sw.js` (bump version)

Currently `ladeSubscriptionStatus()` sets `plan = 'free'` for any non-active subscription. During the grace period, we need to:
1. Set `plan = 'free'` (no Pro/Business features)
2. Store `grace_period_end` on `fordifyAuth` so UI can show a warning banner

- [ ] **Step 1: Update `ladeSubscriptionStatus()` in `frontend/js/auth.js`**

Replace lines 25–40:
```javascript
async function ladeSubscriptionStatus() {
  if (!fordifyAuth.user) return;
  const { data } = await supabaseClient
    .from('subscriptions')
    .select('status, plan, current_period_end')
    .eq('user_id', fordifyAuth.user.id)
    .maybeSingle();

  if (data && data.status === 'active') {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = data.plan; // 'pro' oder 'business'
  } else {
    fordifyAuth.hasSubscription = false;
    fordifyAuth.plan = 'free';
  }
}
```

With:
```javascript
async function ladeSubscriptionStatus() {
  if (!fordifyAuth.user) return;
  const { data } = await supabaseClient
    .from('subscriptions')
    .select('status, plan, current_period_end, grace_period_end')
    .eq('user_id', fordifyAuth.user.id)
    .maybeSingle();

  if (data && data.status === 'active') {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = data.plan; // 'pro' oder 'business'
    fordifyAuth.gracePeriodEnd = null;
  } else if (data && data.status === 'canceled' && data.grace_period_end &&
             new Date(data.grace_period_end) > new Date()) {
    fordifyAuth.hasSubscription = false;
    fordifyAuth.plan = 'free';
    fordifyAuth.gracePeriodEnd = new Date(data.grace_period_end);
  } else {
    fordifyAuth.hasSubscription = false;
    fordifyAuth.plan = 'free';
    fordifyAuth.gracePeriodEnd = null;
  }
}
```

- [ ] **Step 2: Add `gracePeriodEnd: null` to the `fordifyAuth` initial state object (line 9–14)**

Replace:
```javascript
const fordifyAuth = {
  isAuthenticated: false,
  hasSubscription: false,
  user: null,
  plan: 'free'
};
```

With:
```javascript
const fordifyAuth = {
  isAuthenticated: false,
  hasSubscription: false,
  user: null,
  plan: 'free',
  gracePeriodEnd: null
};
```

- [ ] **Step 3: Bump SW version in `frontend/sw.js`**

Increase both `fordify-staging-vN` and `fordify-vN` by 1.

- [ ] **Step 4: Commit**

```bash
git add frontend/js/auth.js frontend/sw.js
git commit -m "feat: auth.js – Grace-Period-Status in fordifyAuth, gracePeriodEnd gesetzt"
```

---

## Task 5: N8N – Zahlungsbestätigung Workflow

**Action:** Create via N8N API. No files in repo — N8N stores the workflow.

The workflow is triggered by the Edge Function posting to `/webhook/fordify-payment-confirmed` with payload:
```json
{
  "email": "user@example.de",
  "plan": "pro",
  "amount": "9,99 €",
  "transaction_id": "txn_abc123",
  "transaction_date": "23.04.2026"
}
```

- [ ] **Step 1: Create the workflow via N8N API**

Source `.env` first, then run:

```bash
source /c/Users/Jens/Documents/GitHub/fordify-app/.env

# Get the credentials from the existing onboarding workflow
SUPABASE_ANON=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI" | \
  node -e "const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{ const w=JSON.parse(Buffer.concat(c)); const n=w.nodes.find(n=>n.name==='E-Mail aus Supabase holen'); console.log(n.parameters.headerParameters.parameters.find(p=>p.name==='apikey').value); })")

SUPABASE_SERVICE=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI" | \
  node -e "const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{ const w=JSON.parse(Buffer.concat(c)); const n=w.nodes.find(n=>n.name==='E-Mail aus Supabase holen'); console.log(n.parameters.headerParameters.parameters.find(p=>p.name==='Authorization').value.replace('Bearer ','')); })")

RESEND_KEY=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI" | \
  node -e "const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{ const w=JSON.parse(Buffer.concat(c)); const n=w.nodes.find(n=>n.name==='Onboarding-Mail senden'); const k=n.parameters.headerParameters.parameters.find(p=>p.name==='Authorization').value; console.log(k.replace('Bearer ','')); })")

node -e "
const workflow = {
  name: 'Fordify – Zahlungsbestätigung',
  nodes: [
    {
      id: 'wh-node',
      name: 'Payment Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'fordify-payment-confirmed',
        options: {}
      },
      webhookId: 'fordify-payment-confirmed-hook'
    },
    {
      id: 'email-node',
      name: 'Zahlungsbestätigung senden',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [480, 300],
      parameters: {
        method: 'POST',
        url: 'https://api.resend.com/emails',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Authorization', value: 'Bearer ${RESEND_KEY}' },
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        contentType: 'raw',
        body: JSON.stringify({
          from: 'Fordify <noreply@fordify.de>',
          to: ['={{ \$json.body.email }}'],
          subject: 'Zahlungsbestätigung für dein fordify-Abo',
          html: \`<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;\"><tr><td align=\"center\"><table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;\"><tr><td style=\"background:#1e3a8a;padding:20px 32px;border-radius:8px 8px 0 0;\"><span style=\"color:#ffffff;font-size:22px;font-weight:700;\">fordify</span></td></tr><tr><td style=\"background:#ffffff;padding:36px 32px;font-size:15px;line-height:1.7;color:#1e293b;\"><h2 style=\"margin:0 0 8px;font-size:20px;font-weight:700;\">Zahlungsbestätigung</h2><p style=\"margin:0 0 20px;color:#475569;\">Vielen Dank für deine Zahlung. Dein Abo ist aktiv.</p><table style=\"width:100%;border-collapse:collapse;margin:0 0 24px;\"><tr style=\"border-bottom:1px solid #e2e8f0;\"><td style=\"padding:10px 0;color:#64748b;font-size:13px;\">Plan</td><td style=\"padding:10px 0;font-weight:600;\">={{ \$json.body.plan ? \$json.body.plan.charAt(0).toUpperCase() + \$json.body.plan.slice(1) : 'fordify Pro' }}</td></tr><tr style=\"border-bottom:1px solid #e2e8f0;\"><td style=\"padding:10px 0;color:#64748b;font-size:13px;\">Betrag</td><td style=\"padding:10px 0;font-weight:600;\">={{ \$json.body.amount || '–' }}</td></tr><tr><td style=\"padding:10px 0;color:#64748b;font-size:13px;\">Datum</td><td style=\"padding:10px 0;font-weight:600;\">={{ \$json.body.transaction_date }}</td></tr></table><p style=\"margin:0 0 8px;font-size:13px;color:#64748b;\">Die offizielle Rechnung erhältst du separat von Paddle (unserem Zahlungsdienstleister).</p><p style=\"margin:0;font-size:13px;color:#64748b;\">Fragen? <a href=\"mailto:hallo@fordify.de\" style=\"color:#1e3a8a;\">hallo@fordify.de</a></p></td></tr><tr><td style=\"background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;\"><p style=\"margin:0;font-size:12px;color:#64748b;line-height:1.6;\">fordify – Professionelle Forderungsaufstellungen · <a href=\"https://fordify.de/impressum\" style=\"color:#64748b;\">Impressum</a> · <a href=\"https://fordify.de/datenschutz\" style=\"color:#64748b;\">Datenschutz</a></p></td></tr></table></td></tr></table>\`
        })
      }
    }
  ],
  connections: {
    'Payment Webhook': {
      main: [[{ node: 'Zahlungsbestätigung senden', type: 'main', index: 0 }]]
    }
  },
  settings: { executionOrder: 'v1' },
  staticData: null
};
console.log(JSON.stringify(workflow));
" | curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows"
```

**Note:** The node JSON for `body` must be a raw JSON string with N8N expression syntax (`={{ }}`) for dynamic fields. The `body` field of the httpRequest node uses `contentType: 'raw'` and contains the JSON as a string with embedded N8N expressions.

Expected response: JSON with `id` field (the new workflow ID). Save this ID.

- [ ] **Step 2: Activate the workflow**

```bash
source /c/Users/Jens/Documents/GitHub/fordify-app/.env
WORKFLOW_ID="<id from step 1>"
curl -s -X PATCH \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"active": true}' \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/$WORKFLOW_ID"
```

Expected: `{"active":true,...}` in response.

- [ ] **Step 3: Test by calling the webhook directly**

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"body":{"email":"jenswittern@gmail.com","plan":"pro","amount":"9,99 €","transaction_id":"test_001","transaction_date":"23.04.2026"}}' \
  "https://n8n.srv1063720.hstgr.cloud/webhook/fordify-payment-confirmed"
```

Expected: 200 response from N8N. Check jenswittern@gmail.com inbox for the payment confirmation email.

---

## Task 6: N8N – Offboarding Workflow

**Action:** Create via N8N API.

Triggered by Edge Function when `subscription.canceled` fires (billing period end, NOT cancellation request). Payload:
```json
{
  "email": "user@example.de",
  "grace_period_end": "2026-05-23T10:00:00Z",
  "billing_cycle": "month"
}
```

- [ ] **Step 1: Create the workflow via N8N API**

```bash
source /c/Users/Jens/Documents/GitHub/fordify-app/.env

# Get RESEND_KEY from existing onboarding workflow (same as Task 5)
RESEND_KEY=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI" | \
  node -e "const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{ const w=JSON.parse(Buffer.concat(c)); const n=w.nodes.find(n=>n.name==='Onboarding-Mail senden'); const k=n.parameters.headerParameters.parameters.find(p=>p.name==='Authorization').value; console.log(k.replace('Bearer ','')); })")

node -e "
const workflow = {
  name: 'Fordify – Offboarding bei Kündigung',
  nodes: [
    {
      id: 'wh-off',
      name: 'Offboarding Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'fordify-offboarding',
        options: {}
      },
      webhookId: 'fordify-offboarding-hook'
    },
    {
      id: 'email-off',
      name: 'Offboarding-Mail senden',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [480, 300],
      parameters: {
        method: 'POST',
        url: 'https://api.resend.com/emails',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Authorization', value: 'Bearer ${RESEND_KEY}' },
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        contentType: 'raw',
        body: JSON.stringify({
          from: 'Fordify <noreply@fordify.de>',
          to: ['={{ \$json.body.email }}'],
          subject: 'Dein fordify-Abo wurde beendet – bitte Daten exportieren',
          html: \`<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;\"><tr><td align=\"center\"><table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;\"><tr><td style=\"background:#1e3a8a;padding:20px 32px;border-radius:8px 8px 0 0;\"><span style=\"color:#ffffff;font-size:22px;font-weight:700;\">fordify</span></td></tr><tr><td style=\"background:#ffffff;padding:36px 32px;font-size:15px;line-height:1.7;color:#1e293b;\"><h2 style=\"margin:0 0 8px;font-size:20px;font-weight:700;\">Dein Abo wurde beendet.</h2><p style=\"margin:0 0 20px;color:#475569;\">Dein Abrechnungszeitraum ist abgelaufen und dein Abo wurde beendet. Wir möchten dir einen reibungslosen Abschluss ermöglichen.</p><div style=\"background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px 20px;margin:0 0 24px;\"><p style=\"margin:0 0 6px;font-weight:700;color:#92400e;\">&#128190; Bitte exportiere deine Daten</p><p style=\"margin:0;font-size:13px;color:#92400e;\">Du hast bis zum <strong>={{ new Date(\$json.body.grace_period_end).toLocaleDateString('de-DE', {day:'2-digit',month:'2-digit',year:'numeric'}) }}</strong> Zeit, dich einzuloggen und deine Fälle als JSON oder CSV herunterzuladen. Danach werden deine Daten automatisch gelöscht.</p></div><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 24px;\"><tr><td style=\"background:#1e3a8a;border-radius:6px;\"><a href=\"https://fordify.de/konto\" style=\"display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;\">Jetzt anmelden und Daten exportieren &rarr;</a></td></tr></table><p style=\"margin:0 0 8px;font-size:13px;color:#64748b;\">Möchtest du fordify erneut nutzen? Du kannst jederzeit ein neues Abo abschließen.</p><p style=\"margin:0;font-size:13px;color:#64748b;\">Fragen? <a href=\"mailto:hallo@fordify.de\" style=\"color:#1e3a8a;\">hallo@fordify.de</a></p></td></tr><tr><td style=\"background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;\"><p style=\"margin:0;font-size:12px;color:#64748b;line-height:1.6;\">fordify – Professionelle Forderungsaufstellungen · <a href=\"https://fordify.de/impressum\" style=\"color:#64748b;\">Impressum</a> · <a href=\"https://fordify.de/datenschutz\" style=\"color:#64748b;\">Datenschutz</a></p></td></tr></table></td></tr></table>\`
        })
      }
    }
  ],
  connections: {
    'Offboarding Webhook': {
      main: [[{ node: 'Offboarding-Mail senden', type: 'main', index: 0 }]]
    }
  },
  settings: { executionOrder: 'v1' },
  staticData: null
};
console.log(JSON.stringify(workflow));
" | curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows"
```

- [ ] **Step 2: Activate the workflow**

```bash
source /c/Users/Jens/Documents/GitHub/fordify-app/.env
WORKFLOW_ID="<id from step 1>"
curl -s -X PATCH \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"active": true}' \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/$WORKFLOW_ID"
```

- [ ] **Step 3: Test by calling the webhook directly**

```bash
# Use a grace period end 30 days from today
GRACE=$(node -e "console.log(new Date(Date.now()+30*86400000).toISOString())")
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"body\":{\"email\":\"jenswittern@gmail.com\",\"grace_period_end\":\"$GRACE\",\"billing_cycle\":\"month\"}}" \
  "https://n8n.srv1063720.hstgr.cloud/webhook/fordify-offboarding"
```

Expected: 200 response. Check jenswittern@gmail.com inbox for offboarding email with correct deletion date.

---

## Task 7: N8N – Retention Email Cron

**Action:** Create via N8N API.

This workflow runs daily at 09:00. It queries Supabase for subscriptions where a cancellation is scheduled and the retention email window has been reached:
- Monthly: `scheduled_cancel_at` is 6–8 days from now (sends 7 days before)
- Yearly: `scheduled_cancel_at` is 29–31 days from now (sends 30 days before)

It then sends a retention email and sets `retention_email_sent_at` to prevent duplicates.

This is triggered by the Edge Function's `subscription.updated` handler (which stores `scheduled_cancel_at`), NOT by the early-warning webhook — that webhook fires immediately but the cron does the timing logic.

- [ ] **Step 1: Create the workflow via N8N API**

```bash
source /c/Users/Jens/Documents/GitHub/fordify-app/.env

RESEND_KEY=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI" | \
  node -e "const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{ const w=JSON.parse(Buffer.concat(c)); const n=w.nodes.find(n=>n.name==='Onboarding-Mail senden'); const k=n.parameters.headerParameters.parameters.find(p=>p.name==='Authorization').value; console.log(k.replace('Bearer ','')); })")

SUPABASE_ANON=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI" | \
  node -e "const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{ const w=JSON.parse(Buffer.concat(c)); const n=w.nodes.find(n=>n.name==='E-Mail aus Supabase holen'); console.log(n.parameters.headerParameters.parameters.find(p=>p.name==='apikey').value); })")

SUPABASE_SERVICE=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI" | \
  node -e "const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{ const w=JSON.parse(Buffer.concat(c)); const n=w.nodes.find(n=>n.name==='E-Mail aus Supabase holen'); const v=n.parameters.headerParameters.parameters.find(p=>p.name==='Authorization').value; console.log(v.replace('Bearer ','')); })")

cat << 'WORKFLOW_EOF' | curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- \
  "https://n8n.srv1063720.hstgr.cloud/api/v1/workflows"
WORKFLOW_EOF
```

**Note:** The retention workflow is complex (schedule → query Supabase → split per result → IF monthly/yearly → send email → update sent_at). Create it in N8N UI instead of via API if the API approach is too cumbersome. Here is the complete workflow structure to recreate in the N8N UI:

**Node 1: Schedule Trigger**
- Type: `n8n-nodes-base.scheduleTrigger`
- Name: `Täglich 09:00`  
- Parameters: `rule.interval[0].field: "hours"`, `rule.interval[0].hoursInterval: 24`, `triggerAtHour: 9`

**Node 2: HTTP Request – Supabase Query**
- Type: `n8n-nodes-base.httpRequest`
- Name: `Retention-Subscriptions holen`
- URL: `https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?select=user_id,billing_cycle,scheduled_cancel_at,plan,profiles!subscriptions_user_id_fkey(email)&scheduled_cancel_at=not.is.null&retention_email_sent_at=is.null`
- Headers: `apikey: <SUPABASE_ANON>`, `Authorization: Bearer <SUPABASE_SERVICE>`

**Node 3: IF – Hat Ergebnisse?**
- Type: `n8n-nodes-base.if`
- Condition: `{{ $json.length > 0 }}` (or use a splitInBatches and let it handle empty arrays)

**Node 4: Split in Batches**
- Type: `n8n-nodes-base.splitInBatches`
- Batch size: 1

**Node 5: Code – Zeitfenster prüfen**
- Type: `n8n-nodes-base.code`
- Code (JavaScript):
```javascript
const now = new Date();
const item = $input.first().json;
const billingCycle = item.billing_cycle; // 'month' or 'year'
const cancelAt = new Date(item.scheduled_cancel_at);
const diffDays = Math.round((cancelAt - now) / (1000 * 60 * 60 * 24));

// Monthly: send 7 days before (window: 6-8 days)
// Yearly: send 30 days before (window: 29-31 days)
const shouldSendMonthly = billingCycle === 'month' && diffDays >= 6 && diffDays <= 8;
const shouldSendYearly  = billingCycle === 'year'  && diffDays >= 29 && diffDays <= 31;

return [{
  json: {
    ...item,
    email: item.profiles?.email,
    shouldSend: shouldSendMonthly || shouldSendYearly,
    diffDays
  }
}];
```

**Node 6: IF – Soll senden?**
- Condition: `{{ $json.shouldSend === true }}`

**Node 7: HTTP Request – Retention-Mail senden** (only on true branch)
- POST to `https://api.resend.com/emails`
- Headers: `Authorization: Bearer <RESEND_KEY>`, `Content-Type: application/json`
- Body (raw JSON string):
```json
{
  "from": "Fordify <noreply@fordify.de>",
  "to": ["={{ $json.email }}"],
  "subject": "Möchtest du dein fordify-Abo wirklich kündigen?",
  "html": "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;\"><tr><td align=\"center\"><table width=\"600\" style=\"max-width:600px;width:100%;\"><tr><td style=\"background:#1e3a8a;padding:20px 32px;border-radius:8px 8px 0 0;\"><span style=\"color:#fff;font-size:22px;font-weight:700;\">fordify</span></td></tr><tr><td style=\"background:#fff;padding:36px 32px;font-size:15px;line-height:1.7;color:#1e293b;\"><h2 style=\"margin:0 0 8px;font-size:20px;font-weight:700;\">Deine Kündigung wird in {{ $json.diffDays }} Tagen wirksam.</h2><p style=\"margin:0 0 20px;color:#475569;\">Du hast dein fordify-Abo gekündigt. Falls das ein Versehen war oder du es dir anders überlegt hast, kannst du die Kündigung jederzeit rückgängig machen.</p><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 24px;\"><tr><td style=\"background:#1e3a8a;border-radius:6px;\"><a href=\"https://fordify.de/konto\" style=\"display:inline-block;padding:13px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;\">Kündigung rückgängig machen &rarr;</a></td></tr></table><p style=\"margin:0 0 8px;font-size:13px;color:#64748b;\">Du musst nichts unternehmen, wenn du die Kündigung beibehalten möchtest. Dein Zugang läuft dann am <strong>={{ new Date($json.scheduled_cancel_at).toLocaleDateString('de-DE') }}</strong> aus.</p><p style=\"margin:0;font-size:13px;color:#64748b;\">Fragen? <a href=\"mailto:hallo@fordify.de\" style=\"color:#1e3a8a;\">hallo@fordify.de</a></p></td></tr><tr><td style=\"background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;\"><p style=\"margin:0;font-size:12px;color:#64748b;\">fordify · <a href=\"https://fordify.de/impressum\" style=\"color:#64748b;\">Impressum</a> · <a href=\"https://fordify.de/datenschutz\" style=\"color:#64748b;\">Datenschutz</a></p></td></tr></table></td></tr></table>"
}
```

**Node 8: HTTP Request – retention_email_sent_at setzen** (after Node 7)
- PATCH to `https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?user_id=eq.={{ $json.user_id }}`
- Headers: `apikey: <SUPABASE_ANON>`, `Authorization: Bearer <SUPABASE_SERVICE>`, `Content-Type: application/json`, `Prefer: return=minimal`
- Body: `{"retention_email_sent_at": "={{ new Date().toISOString() }}"}`

**Connections:** Schedule → Query → Split → Code → IF(shouldSend) → [true] Email → Update sent_at

- [ ] **Step 2: Activate the workflow in N8N UI**

Navigate to `https://n8n.srv1063720.hstgr.cloud` → find "Fordify – Retention E-Mail Cron" → toggle Active.

- [ ] **Step 3: Test manually**

Set a test subscription's `scheduled_cancel_at` to 7 days from now in Supabase SQL Editor:
```sql
UPDATE subscriptions
SET scheduled_cancel_at = now() + interval '7 days',
    retention_email_sent_at = NULL
WHERE user_id = (SELECT id FROM profiles WHERE email = 'jenswittern@gmail.com')
LIMIT 1;
```

Then trigger the workflow manually in N8N (Execute Workflow button). Check inbox for retention email. Then reset:
```sql
UPDATE subscriptions
SET scheduled_cancel_at = NULL, retention_email_sent_at = NULL
WHERE user_id = (SELECT id FROM profiles WHERE email = 'jenswittern@gmail.com');
```

---

## Task 8: N8N – Datenlöschungs-Cron

**Action:** Create via N8N API / N8N UI.

Runs daily at 02:00. Deletes expired grace period data per the following retention policy:

**Was wird gelöscht (nach grace_period_end):**
- `cases` — Forderungsaufstellungen (Nutzer-Daten, kein Aufbewahrungsgebot für fordify)
- `contacts` — Adressbuch (Nutzer-Daten)
- `settings` — Kanzlei-Einstellungen

**Was wird aufbewahrt (10 Jahre per § 147 AO):**
- `profiles` — E-Mail, Firmenname (Billing-Identifikation)
- `subscriptions` — Abo-History, Plan, Zeitraum (Buchungsbeleg)

- [ ] **Step 1: Create workflow in N8N UI**

**Node 1: Schedule Trigger**
- Name: `Täglich 02:00`
- Trigger at: 02:00 every day

**Node 2: HTTP Request – Abgelaufene Grace Periods holen**
- Name: `Abgelaufene Grace Periods`
- GET `https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?select=user_id&status=eq.canceled&grace_period_end=lt.{{ new Date().toISOString() }}&grace_period_end=not.is.null`
- Headers: `apikey: <SUPABASE_ANON>`, `Authorization: Bearer <SUPABASE_SERVICE>`

**Node 3: IF – Hat abgelaufene Einträge?**
- Condition: `{{ $json.length > 0 }}`

**Node 4: Split in Batches**
- Batch size: 1

**Node 5: HTTP Request – cases löschen**
- DELETE `https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/cases?user_id=eq.={{ $json.user_id }}`
- Headers: same + `Prefer: return=minimal`

**Node 6: HTTP Request – contacts löschen**
- DELETE `https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/contacts?user_id=eq.={{ $json.user_id }}`

**Node 7: HTTP Request – settings löschen**
- DELETE `https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/settings?user_id=eq.={{ $json.user_id }}`

**Node 8: HTTP Request – grace_period_end auf NULL setzen** (marks as cleaned)
- PATCH `https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?user_id=eq.={{ $json.user_id }}`
- Body: `{"grace_period_end": null}`

**Connections:** Schedule → Query → IF(length>0) → [true] Split → cases del → contacts del → settings del → clear grace_period_end

**Note on profiles/subscriptions retention:**
`profiles` and `subscriptions` are NOT deleted by this cron. They are retained for 10 years (§ 147 AO). A separate manual process (or second cron with `created_at < now() - interval '10 years'`) would handle those — out of scope for this plan.

- [ ] **Step 2: Activate the workflow in N8N UI**

- [ ] **Step 3: Test manually**

In Supabase SQL Editor, set a test user's grace_period_end to the past:
```sql
-- Use a test user that has NO real cases
UPDATE subscriptions
SET grace_period_end = now() - interval '1 day'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'jenswittern@gmail.com')
AND status = 'canceled';
```

**Only do this if the test account has no real data.** Then trigger the workflow manually in N8N. Verify cases/contacts/settings are deleted. Restore test state afterward.

---

## Task 9: Edge Functions deployen + Paddle Events erweitern

**Files:**
- No file changes — deploy existing files

- [ ] **Step 1: Deploy both Edge Functions**

```bash
source /c/Users/Jens/Documents/GitHub/fordify-app/.env

# Deploy paddle-webhook
supabase functions deploy paddle-webhook \
  --project-ref dswhllvtewtqpiqnpbsu

# Deploy verify-and-login
supabase functions deploy verify-and-login \
  --project-ref dswhllvtewtqpiqnpbsu
```

Expected: `Deployed Function paddle-webhook` and `Deployed Function verify-and-login` for each.

- [ ] **Step 2: Add `transaction.completed` to Paddle webhook subscription (Manual)**

1. Go to Paddle Dashboard → Developer Tools → Notifications
2. Find the fordify webhook (URL: Edge Function URL)
3. Add `transaction.completed` to the subscribed events
4. Save

**Note:** `subscription.updated` and `subscription.canceled` should already be subscribed. If not, add them too.

- [ ] **Step 3: Verify all events in Paddle Notification log**

After adding `transaction.completed`, check the Notifications → Event log to confirm Paddle is sending the event.

---

## Task 10: Dokumentation aktualisieren

**Files:**
- Modify: `docs/ROADMAP.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update ROADMAP.md**

Add to Phase 6 (or new Phase 7):
```markdown
| 6.7 | **E-Mail-Workflows: Zahlungsbestätigung + Offboarding + Retention** – Branded payment confirmation (transaction.completed), Cancellation offboarding with 30-day grace period, Retention emails (monthly 7d / yearly 30d before cancellation), Data deletion cron (cases/contacts/settings after grace period, profiles/subscriptions kept 10y per § 147 AO) | ✅ | 2026-04-23 |
```

- [ ] **Step 2: Update CLAUDE.md**

Add to the Aktiver Implementierungsplan table:
```
| E-Mail-Workflows | ✅ | Zahlungsbestätigung, Offboarding (Grace Period 30d), Retention (monthly 7d / yearly 30d), Datenlöschungs-Cron |
```

- [ ] **Step 3: Final commit**

```bash
git add docs/ROADMAP.md CLAUDE.md
git commit -m "docs: E-Mail-Workflows – Zahlungsbestätigung, Offboarding, Retention, Datenlöschung ✅"
```
