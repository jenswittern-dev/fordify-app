# Secure Checkout & Auth Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken checkout/auth flow with a subscription-first flow: Paddle opens without login, the webhook finds/creates the Supabase user by email and sends a magic link, and the "Anmelden" button rejects non-subscribers with a link to `/preise`.

**Architecture:** Paddle checkout requires no prior login — the edge function resolves the user identity post-payment via the Paddle customer API. A new `verify-and-login` edge function gates OTP sending behind an active-subscription check. The frontend login flow now calls the edge function instead of Supabase directly.

**Tech Stack:** Deno/TypeScript Edge Functions (Supabase), Paddle REST API v2, Resend email API, Vanilla JS frontend

---

## File Structure

| Action | File |
|--------|------|
| Modify | `supabase/functions/paddle-webhook/index.ts` |
| Create | `supabase/functions/verify-and-login/index.ts` |
| Modify | `frontend/js/auth.js` |
| Modify | `frontend/preise.html` |
| Modify | `frontend/sw.js` (version bump) |

---

### Task 1: Update Paddle Webhook — User Lookup by Email + Magic Link

The current webhook fails when `custom_data.user_id` is absent (new users who haven't logged in before paying). Replace with: fetch customer email from Paddle API → find or create Supabase user → upsert subscription → send magic link via Resend.

**Files:**
- Modify: `supabase/functions/paddle-webhook/index.ts`

**Required secrets** (set before deploying):
```bash
source .env && supabase secrets set \
  PADDLE_API_KEY=$PADDLE_API_KEY \
  RESEND_API_KEY=$RESEND_API_KEY \
  --project-ref dswhllvtewtqpiqnpbsu
```

- [ ] **Step 1: Rewrite `supabase/functions/paddle-webhook/index.ts`**

Replace the entire file with:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PADDLE_WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET')!
const PADDLE_API_KEY        = Deno.env.get('PADDLE_API_KEY')!
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY        = Deno.env.get('RESEND_API_KEY')!
const PADDLE_API_BASE       = 'https://api.paddle.com'

serve(async (req) => {
  const body      = await req.text()
  const signature = req.headers.get('paddle-signature') || ''

  const isValid = await verifyPaddleSignature(body, signature, PADDLE_WEBHOOK_SECRET)
  if (!isValid) return new Response('Unauthorized', { status: 401 })

  const event   = JSON.parse(body)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { event_type, data } = event

  if (['subscription.created', 'subscription.updated', 'subscription.activated'].includes(event_type)) {
    // 1. Resolve user_id — prefer explicit customData, else look up by Paddle customer email
    let userId = data.custom_data?.user_id || null

    if (!userId) {
      const email = await _getPaddleCustomerEmail(data.customer_id)
      if (!email) {
        console.error('Could not resolve customer email for customer_id:', data.customer_id)
        return new Response('Could not resolve customer email', { status: 500 })
      }

      userId = await _findOrCreateUser(supabase, email)

      // 2. Send magic link so new user can access their account
      if (event_type === 'subscription.created' || event_type === 'subscription.activated') {
        await _sendMagicLink(supabase, email)
      }
    }

    // 3. Derive plan from Paddle price custom_data (set in Paddle dashboard) or fallback
    const plan = data.items?.[0]?.price?.custom_data?.plan || 'pro'

    await supabase.from('subscriptions').upsert({
      user_id:                userId,
      paddle_subscription_id: data.id,
      paddle_customer_id:     data.customer_id,
      status:                 data.status,
      plan,
      billing_cycle:          data.billing_cycle?.interval || 'month',
      current_period_end:     data.current_billing_period?.ends_at || null,
      updated_at:             new Date().toISOString()
    }, { onConflict: 'paddle_subscription_id' })
  }

  if (event_type === 'subscription.canceled') {
    await supabase.from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('paddle_subscription_id', data.id)
  }

  return new Response('OK', { status: 200 })
})

async function _getPaddleCustomerEmail(customerId: string): Promise<string | null> {
  const resp = await fetch(`${PADDLE_API_BASE}/customers/${customerId}`, {
    headers: { 'Authorization': `Bearer ${PADDLE_API_KEY}` }
  })
  if (!resp.ok) return null
  const json = await resp.json()
  return json?.data?.email || null
}

async function _findOrCreateUser(supabase: ReturnType<typeof createClient>, email: string): Promise<string> {
  // Search existing user by email via GoTrue admin API
  const searchResp = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  )
  const searchData = await searchResp.json()
  const existing   = searchData?.users?.[0]
  if (existing?.id) return existing.id

  // Create new user
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

  await fetch('https://api.resend.com/emails', {
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
            fordify · <a href="https://fordify.de/impressum.html" style="color:#9ca3af">Impressum</a> ·
            <a href="https://fordify.de/datenschutz.html" style="color:#9ca3af">Datenschutz</a>
          </p>
        </div>
      `
    })
  })
}

async function verifyPaddleSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(signature.split(';').map(p => p.split('=')))
  const ts = parts['ts']
  const h1 = parts['h1']
  if (!ts || !h1) return false
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

- [ ] **Step 2: Set required secrets**

```bash
source .env && supabase secrets set \
  PADDLE_API_KEY=$PADDLE_API_KEY \
  RESEND_API_KEY=$RESEND_API_KEY \
  --project-ref dswhllvtewtqpiqnpbsu
```

Expected output: `Finished supabase secrets set.`

- [ ] **Step 3: Deploy the updated webhook**

```bash
source .env && supabase functions deploy paddle-webhook --project-ref dswhllvtewtqpiqnpbsu
```

Expected output: `Deployed Functions paddle-webhook`

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/paddle-webhook/index.ts
git commit -m "feat: Paddle-Webhook – User per E-Mail suchen/anlegen + Magic Link senden"
```

---

### Task 2: Create `verify-and-login` Edge Function

This function replaces `supabase.auth.signInWithOtp()` on the client. It checks for an active subscription before sending a magic link. Non-subscribers get a 403 with a link to `/preise`.

**Files:**
- Create: `supabase/functions/verify-and-login/index.ts`

- [ ] **Step 1: Create the function directory and file**

```bash
mkdir -p supabase/functions/verify-and-login
```

- [ ] **Step 2: Write `supabase/functions/verify-and-login/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS })
  }

  let email: string
  let redirectTo: string | undefined
  try {
    const body = await req.json()
    email      = (body.email || '').trim().toLowerCase()
    redirectTo = body.redirectTo
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid_request' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  if (!email || !email.includes('@')) {
    return new Response(
      JSON.stringify({ error: 'invalid_email' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1. Look up user by email
  const searchResp = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  )
  const searchData = await searchResp.json()
  const user       = searchData?.users?.[0]

  if (!user?.id) {
    return _noSubscriptionResponse()
  }

  // 2. Check for active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!sub) {
    return _noSubscriptionResponse()
  }

  // 3. Generate magic link and send via Resend
  const finalRedirect = redirectTo || 'https://fordify.de/konto'
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: finalRedirect }
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error('generateLink error:', linkError)
    return new Response(
      JSON.stringify({ error: 'link_generation_failed' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  const magicLink = linkData.properties.action_link

  const sendResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from:    'fordify <hallo@fordify.de>',
      to:      [email],
      subject: 'Dein Anmelde-Link für fordify',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
          <h2 style="color:#1e3a8a;margin-bottom:0.5rem">Anmelden bei fordify</h2>
          <p style="color:#374151">Klicke auf den Button, um dich sicher anzumelden – kein Passwort nötig.</p>
          <a href="${magicLink}"
             style="display:inline-block;margin:1.5rem 0;padding:0.75rem 1.5rem;background:#2563eb;color:white;border-radius:6px;text-decoration:none;font-weight:600">
            Jetzt anmelden →
          </a>
          <p style="color:#6b7280;font-size:0.85rem">
            Der Link ist 24 Stunden gültig und kann nur einmal verwendet werden.<br>
            Bitte öffne ihn in dem Browser, in dem du fordify nutzen möchtest.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0">
          <p style="color:#9ca3af;font-size:0.8rem">
            fordify · <a href="https://fordify.de/impressum.html" style="color:#9ca3af">Impressum</a> ·
            <a href="https://fordify.de/datenschutz.html" style="color:#9ca3af">Datenschutz</a>
          </p>
        </div>
      `
    })
  })

  if (!sendResp.ok) {
    const sendErr = await sendResp.text()
    console.error('Resend error:', sendErr)
    return new Response(
      JSON.stringify({ error: 'email_send_failed' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  )
})

function _noSubscriptionResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'kein_abo', preiseUrl: 'https://fordify.de/preise' }),
    { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  )
}
```

- [ ] **Step 3: Deploy the new function**

```bash
source .env && supabase functions deploy verify-and-login --project-ref dswhllvtewtqpiqnpbsu
```

Expected output: `Deployed Functions verify-and-login`

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/verify-and-login/index.ts
git commit -m "feat: verify-and-login Edge Function – Abo-Check vor Magic-Link"
```

---

### Task 3: Update `loginMitEmail()` in auth.js

Replace `supabaseClient.auth.signInWithOtp()` with a `fetch` call to the `verify-and-login` edge function. On `kein_abo` error, show a message with a link to the pricing page.

**Files:**
- Modify: `frontend/js/auth.js` (lines 42–59: the `loginMitEmail` function)

- [ ] **Step 1: Replace `loginMitEmail()` in `frontend/js/auth.js`**

Old code (lines 42–59):
```javascript
async function loginMitEmail(email) {
  if (!supabaseClient) { _loginStatus('Auth nicht konfiguriert.', 'danger'); return; }
  email = (email || '').trim();
  if (!email) { _loginStatus('Bitte E-Mail eingeben.', 'danger'); return; }

  _loginStatus('Link wird gesendet…', 'info');
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: _emailRedirectTo() }
  });

  if (error) {
    _loginStatus('Fehler: ' + error.message, 'danger');
  } else {
    _loginStatus('Link gesendet – bitte E-Mail prüfen und Link in diesem Browser öffnen.', 'success');
    trackEvent('login-link-gesendet');
  }
}
```

New code:
```javascript
async function loginMitEmail(email) {
  email = (email || '').trim();
  if (!email) { _loginStatus('Bitte E-Mail eingeben.', 'danger'); return; }

  _loginStatus('Link wird gesendet…', 'info');
  try {
    const resp = await fetch(CONFIG.supabase.url + '/functions/v1/verify-and-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': CONFIG.supabase.anonKey },
      body: JSON.stringify({ email, redirectTo: _emailRedirectTo() })
    });
    const json = await resp.json();

    if (resp.status === 403 && json.error === 'kein_abo') {
      _loginStatusMitLink(
        'Kein aktives Abo gefunden. Bitte zuerst ',
        'abonnieren',
        json.preiseUrl || '/preise',
        '.'
      );
      return;
    }
    if (!resp.ok) {
      _loginStatus('Fehler beim Senden. Bitte erneut versuchen.', 'danger');
      return;
    }
    _loginStatus('Link gesendet – bitte E-Mail prüfen und Link in diesem Browser öffnen.', 'success');
    trackEvent('login-link-gesendet');
  } catch (e) {
    _loginStatus('Netzwerkfehler. Bitte erneut versuchen.', 'danger');
  }
}
```

- [ ] **Step 2: Add `_loginStatusMitLink()` helper at the bottom of `frontend/js/auth.js`**

After the existing `_loginStatus()` function (after line 173), add:
```javascript
function _loginStatusMitLink(before, linkText, href, after) {
  const el = document.getElementById('login-status');
  if (!el) return;
  el.className = 'alert alert-danger py-2 small mb-0 mt-2';
  el.innerHTML = '';
  el.appendChild(document.createTextNode(before));
  const a = document.createElement('a');
  a.href = href;
  a.textContent = linkText;
  el.appendChild(a);
  el.appendChild(document.createTextNode(after));
  el.classList.remove('d-none');
}
```

- [ ] **Step 3: Bump SW cache version in `frontend/sw.js`**

Change `fordify-staging-v61` → `fordify-staging-v62` and `fordify-v107` → `fordify-v108`.

- [ ] **Step 4: Commit**

```bash
git add frontend/js/auth.js frontend/sw.js
git commit -m "feat: loginMitEmail via verify-and-login – Abo-Check + Fehlermeldung mit Preise-Link"
```

---

### Task 4: Update `preise.html` — Checkout Without Prior Login + Subscriber UI

Remove the login-before-checkout requirement from `startCheckout()`. For logged-in subscribers, show "Abo verwalten" state on the pricing cards instead of checkout buttons.

**Files:**
- Modify: `frontend/preise.html` (inline `<script>` block starting at line 345)

- [ ] **Step 1: Replace `startCheckout()` in `frontend/preise.html`**

Old code (lines 408–430):
```javascript
function startCheckout(interval) {
  if (!VALID_CHECKOUT_PARAMS.includes(interval)) return;
  if (!paddleReady) {
    alert('Checkout ist auf dieser Umgebung nicht verfügbar (Staging/Test).');
    return;
  }
  const userId = (typeof fordifyAuth !== 'undefined' && fordifyAuth.user?.id) || null;
  if (!userId) {
    const url = new URL(window.location.href);
    url.searchParams.set('checkout', interval);
    history.replaceState({}, '', url);
    _setLoginModalCheckoutMode(interval);
    new bootstrap.Modal(document.getElementById('loginModal')).show();
    return;
  }
  const priceId = PRICE_MAP[interval]?.();
  if (!priceId) return;
  Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: { user_id: userId },
    locale: 'de'
  });
}
```

New code:
```javascript
function startCheckout(interval) {
  if (!VALID_CHECKOUT_PARAMS.includes(interval)) return;
  if (!paddleReady) {
    alert('Checkout ist auf dieser Umgebung nicht verfügbar (Staging/Test).');
    return;
  }
  const priceId = PRICE_MAP[interval]?.();
  if (!priceId) return;
  // Pass user_id if already logged in (webhook uses it as optimisation; still works without it)
  const userId = (typeof fordifyAuth !== 'undefined' && fordifyAuth.user?.id) || undefined;
  Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: userId ? { user_id: userId } : undefined,
    locale: 'de'
  });
}
```

- [ ] **Step 2: Add subscriber state rendering to `frontend/preise.html`**

After the `startCheckout()` function definition, add a new function + call it on auth state:

```javascript
function _aktualisierePreisseiteNachAuth() {
  if (typeof fordifyAuth === 'undefined' || !fordifyAuth.hasSubscription) return;
  // Hide all checkout buttons
  document.querySelectorAll('.pricing-card button[onclick^="startCheckout"]').forEach(btn => {
    btn.classList.add('d-none');
  });
  // Show "Abo verwalten" on the featured card
  const featured = document.querySelector('.pricing-card.featured');
  if (featured && !featured.querySelector('.abo-verwalten-btn')) {
    const btn = document.createElement('a');
    btn.href = '/konto';
    btn.className = 'btn btn-outline-primary w-100 abo-verwalten-btn';
    btn.textContent = 'Kundenbereich öffnen →';
    featured.appendChild(btn);
  }
}

// Hook into auth-ui: aktualisiereUIFuerAuth is called by auth.js on INITIAL_SESSION/SIGNED_IN.
// Override it to also update the pricing page.
const _origAktualisiereUI = typeof aktualisiereUIFuerAuth === 'function'
  ? aktualisiereUIFuerAuth : null;
// Overriding happens after scripts load — listen for DOM mutations on the avatar which
// changes when auth is set. Simpler: poll once with a short delay.
document.addEventListener('DOMContentLoaded', () => {
  // Check immediately (already-logged-in users hit INITIAL_SESSION in ~200ms)
  setTimeout(_aktualisierePreisseiteNachAuth, 1500);
});
```

- [ ] **Step 3: Remove the `checkAutoCheckout()` trigger from the login flow on preise.html**

The `?checkout=...` URL param mechanism is no longer needed (users go directly to Paddle). The `checkAutoCheckout()` function in auth-ui.js is still called by auth.js but will be a no-op on preise.html because there will be no `?checkout` param in the URL. No code change needed — but verify the old `history.replaceState` call is gone from `startCheckout()` (done in Step 1 above).

- [ ] **Step 4: Bump SW cache version**

Change `fordify-staging-v62` → `fordify-staging-v63` and `fordify-v108` → `fordify-v109`.

- [ ] **Step 5: Push to staging and main**

```bash
git add frontend/preise.html frontend/sw.js
git commit -m "feat: Checkout ohne Login – Paddle öffnet direkt, Abonnenten sehen Kundenbereich-Link"
git push origin staging
git push origin main
```

- [ ] **Step 6: Manual smoke test**

1. Open `https://staging.fordify.de/preise` as guest
2. Click "Pro abonnieren" → Paddle checkout opens directly (no login modal)
3. Complete a test checkout in Paddle sandbox
4. Check edge function logs in Supabase dashboard → should show user created + magic link sent
5. Check email inbox → magic link email from `hallo@fordify.de`
6. Click magic link → lands on `/konto` → Pro badge visible
7. Open `https://staging.fordify.de/preise` as logged-in Pro user → "Kundenbereich öffnen" button visible instead of checkout buttons
8. Click "Anmelden" in nav as guest → type known Pro user email → magic link sent
9. Click "Anmelden" in nav as guest → type unknown email → error "Kein aktives Abo gefunden. Bitte zuerst [abonnieren](link)."

---

## Self-Review

**Spec coverage:**
- ✅ Paddle opens without login → Task 4 Step 1
- ✅ Webhook resolves user by Paddle customer email → Task 1
- ✅ Webhook creates new Supabase user if none exists → Task 1 `_findOrCreateUser()`
- ✅ Webhook sends magic link post-purchase via Resend → Task 1 `_sendMagicLink()`
- ✅ "Anmelden" rejects non-subscribers with preise link → Task 2 + Task 3
- ✅ Magic link routes to `/konto` → Task 1 + Task 2 (redirectTo)
- ✅ Logged-in subscribers see "Kundenbereich öffnen" on preise.html → Task 4 Step 2
- ✅ Existing `user_id` in customData still works as optimisation → Task 4 Step 1

**No placeholders:** All code blocks are complete. All commands include expected output.

**Type consistency:** `_findOrCreateUser` returns `string` (userId), `_getPaddleCustomerEmail` returns `string | null` — checked consistently in caller.
