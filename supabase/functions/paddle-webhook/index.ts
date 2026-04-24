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

    // Fix 5: express reactivation condition explicitly
    const isReactivation = event_type === 'subscription.activated' || data.status === 'active'
    const clearFields = isReactivation ? {
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

      // Fix 4: add error check for scheduled_cancel_at update
      const { error: schedCancelError } = await supabase.from('subscriptions')
        .update({ scheduled_cancel_at: scheduledCancelAt })
        .eq('paddle_subscription_id', data.id)

      if (schedCancelError) {
        console.error('scheduled_cancel_at update failed:', schedCancelError)
      } else {
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
  }

  // ── Subscription canceled (billing period ended) ─────────────────────────
  if (event_type === 'subscription.canceled') {
    // Fix 3: anchor grace period to billing period end, fall back to now
    const periodEnd = data.current_billing_period?.ends_at
      ? new Date(data.current_billing_period.ends_at)
      : new Date()
    if (!data.current_billing_period?.ends_at) {
      console.warn('subscription.canceled: current_billing_period.ends_at missing, grace period anchored to now()')
    }
    const gracePeriodEnd = new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Fix 1: destructure error and log it
    const { data: updatedSub, error: cancelError } = await supabase.from('subscriptions')
      .update({
        status:          'canceled',
        plan:            'free',
        grace_period_end: gracePeriodEnd,
        updated_at:      new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id)
      .select('user_id, billing_cycle')
      .maybeSingle()

    if (cancelError) {
      console.error('subscription.canceled update failed:', cancelError)
    }

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
    // Fix 7: log origin for observability
    console.log('transaction.completed origin:', data.origin)
    const customerId = data.customer_id
    const email = await _getPaddleCustomerEmail(customerId)
    if (email) {
      const totals = data.details?.totals
      const amountRaw = totals?.total ? parseInt(totals.total, 10) : null
      // Fix 2: currency_code is a top-level field on the Paddle transaction object
      const currency  = data.currency_code || 'EUR'
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
    // Fix 6: check HTTP response status and log non-OK responses
    const resp = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })
    if (!resp.ok) {
      const errBody = await resp.text()
      console.error('N8N webhook returned non-OK:', resp.status, url, errBody)
    }
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
      from:     'fordify <hallo@mail.fordify.de>',
      reply_to: ['hallo@fordify.de'],
      to:       [email],
      subject:  'Dein fordify-Zugang ist aktiv – hier anmelden',
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
