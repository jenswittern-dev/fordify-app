import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PADDLE_WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const body = await req.text()
  const signature = req.headers.get('paddle-signature') || ''

  const isValid = await verifyPaddleSignature(body, signature, PADDLE_WEBHOOK_SECRET)
  if (!isValid) return new Response('Unauthorized', { status: 401 })

  const event = JSON.parse(body)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { event_type, data } = event

  if (['subscription.created', 'subscription.updated', 'subscription.activated'].includes(event_type)) {
    const userId = data.custom_data?.user_id
    if (!userId) return new Response('Missing user_id', { status: 400 })

    const plan = data.items?.[0]?.price?.custom_data?.plan || 'pro'

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      paddle_subscription_id: data.id,
      paddle_customer_id: data.customer_id,
      status: data.status,
      plan,
      billing_cycle: data.billing_cycle?.interval || 'month',
      current_period_end: data.current_billing_period?.ends_at || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'paddle_subscription_id' })
  }

  if (event_type === 'subscription.canceled') {
    await supabase.from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('paddle_subscription_id', data.id)
  }

  return new Response('OK', { status: 200 })
})

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
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === h1
}
