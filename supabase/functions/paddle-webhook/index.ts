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

      try {
        userId = await _findOrCreateUser(supabase, email)
      } catch (e) {
        console.error('_findOrCreateUser failed:', e)
        return new Response('User resolution failed', { status: 500 })
      }

      // 2. Send magic link so new user can access their account
      if (event_type === 'subscription.created' || event_type === 'subscription.activated') {
        await _sendMagicLink(supabase, email)
      }
    }

    // 3. Derive plan from Paddle price custom_data (set in Paddle dashboard) or fallback
    const plan = data.items?.[0]?.price?.custom_data?.plan || 'pro'

    const { error: upsertError } = await supabase.from('subscriptions').upsert({
      user_id:                userId,
      paddle_subscription_id: data.id,
      paddle_customer_id:     data.customer_id,
      status:                 data.status,
      plan,
      billing_cycle:          data.billing_cycle?.interval || 'month',
      current_period_end:     data.current_billing_period?.ends_at || null,
      updated_at:             new Date().toISOString()
    }, { onConflict: 'paddle_subscription_id' })
    if (upsertError) {
      console.error('subscriptions upsert failed:', upsertError)
      return new Response('DB upsert failed', { status: 500 })
    }
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
  const existing = searchData?.users?.find(
    (u: { email: string; id: string }) => u.email === email
  )
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
            fordify · <a href="https://fordify.de/impressum.html" style="color:#9ca3af">Impressum</a> ·
            <a href="https://fordify.de/datenschutz.html" style="color:#9ca3af">Datenschutz</a>
          </p>
        </div>
      `
    })
  })
  if (!sendResp.ok) {
    const errBody = await sendResp.text()
    console.error('Resend send failed:', sendResp.status, errBody)
    // Do not throw — subscription upsert already happened, Paddle needs 200
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
