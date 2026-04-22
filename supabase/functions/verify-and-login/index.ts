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

  // 1. Look up user by email via GoTrue admin API
  const searchResp = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  )
  const searchData = await searchResp.json()
  const user = searchData?.users?.find(
    (u: { email: string; id: string }) => u.email === email
  )

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
