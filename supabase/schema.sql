-- fordify Supabase Schema
-- Ausführen im Supabase Dashboard: SQL Editor → New Query → Run

-- Profiles (erweitert auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  firma TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions (via Paddle-Webhook befüllt)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT,
  paddle_customer_id TEXT,
  status TEXT DEFAULT 'inactive',  -- 'active', 'canceled', 'past_due', 'suspended'
  plan TEXT DEFAULT 'pro',         -- 'pro', 'business'
  billing_cycle TEXT DEFAULT 'monthly',  -- 'monthly', 'yearly'
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fälle (JSONB – Fall-Objekt komplett, keine Normalisierung)
CREATE TABLE cases (
  id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  data JSONB NOT NULL,
  naechste_id INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

-- Einstellungen (Kanzlei-Profil, Logo-URL)
CREATE TABLE settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Kontakte: Schuldner-Adressbuch (Pro) + Mandanten-Adressbuch (Business)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'schuldner' CHECK (type IN ('schuldner', 'mandant')),
  name TEXT NOT NULL,
  strasse TEXT, plz TEXT, ort TEXT,
  email TEXT, telefon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts: eigene Zeilen"
  ON contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: neues auth.user → Profile anlegen
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Migration 2026-04-23: AVV-Akzeptanz in profiles
-- Ausführen im Supabase Dashboard: SQL Editor → New Query → Run
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS accepted_avv_at TIMESTAMPTZ DEFAULT NULL;

-- Migration 2026-04-24: AGB-Akzeptanz in profiles
-- Ausführen im Supabase Dashboard: SQL Editor → New Query → Run
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS accepted_agb_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN profiles.accepted_agb_at IS 'Zeitpunkt der AGB-Akzeptanz (via Checkbox im Checkout). Gesetzt durch paddle-webhook bei subscription.created/activated.';
COMMENT ON COLUMN profiles.accepted_avv_at IS 'Zeitpunkt der AVV-Akzeptanz (via Checkbox im Checkout). Gesetzt durch paddle-webhook bei subscription.created/activated.';

-- Migration 2026-04-23: Offboarding + Retention Felder in subscriptions
-- Ausführen im Supabase Dashboard: SQL Editor → New Query → Run
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS scheduled_cancel_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS retention_email_sent_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN subscriptions.grace_period_end IS '30 days after subscription.canceled fires (end of billing period). Case data deleted when expired.';
COMMENT ON COLUMN subscriptions.scheduled_cancel_at IS 'When scheduled_change.action=cancel: the effective_at date. Used by retention email cron.';
COMMENT ON COLUMN subscriptions.retention_email_sent_at IS 'Set when retention email sent, prevents duplicate sends.';

-- Migration 2026-04-23: Partial indexes for retention email cron performance
-- idx_subscriptions_scheduled_cancel_at: Only rows with pending cancellations + unsent retention email
CREATE INDEX IF NOT EXISTS idx_subscriptions_scheduled_cancel_at
  ON subscriptions (scheduled_cancel_at)
  WHERE scheduled_cancel_at IS NOT NULL AND retention_email_sent_at IS NULL;

-- idx_subscriptions_grace_period_end: Only canceled subscriptions with active grace period
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period_end
  ON subscriptions (grace_period_end)
  WHERE status = 'canceled' AND grace_period_end IS NOT NULL;
