-- fordify Row Level Security
-- Ausführen NACH schema.sql im Supabase Dashboard: SQL Editor → New Query → Run

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Profiles: Nutzer sieht nur seine eigene Zeile
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Subscriptions: nur lesen (schreiben nur via Service Role in Edge Function)
CREATE POLICY "subscriptions_own_read" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Cases: Nutzer sieht und verwaltet nur seine eigenen Fälle
CREATE POLICY "cases_own" ON cases FOR ALL USING (auth.uid() = user_id);

-- Settings: Nutzer sieht und verwaltet nur seine eigenen Einstellungen
CREATE POLICY "settings_own" ON settings FOR ALL USING (auth.uid() = user_id);

-- Contacts: Nutzer sieht und verwaltet nur seine eigenen Kontakte
CREATE POLICY "contacts_own" ON contacts FOR ALL USING (auth.uid() = user_id);
