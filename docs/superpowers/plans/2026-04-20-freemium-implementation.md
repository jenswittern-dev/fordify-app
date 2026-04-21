# Freemium-Implementierung – Technischer Umsetzungsplan

## Aktueller Stand (2026-04-21)
| Task | Status | Notiz |
|---|---|---|
| 1 – Supabase Schema + RLS | ✅ | `supabase/schema.sql` mit profiles, subscriptions, cases, settings, contacts + RLS |
| 2 – GoatCounter Analytics | ✅ | Script-Tag in allen HTML-Seiten, `trackEvent()` in config.js |
| 3 – Storage-Abstraktionsschicht | ✅ | `frontend/js/storage.js` mit sessionStorage (Free) / Supabase (Paid) |
| 4 – Auth – Magic Link Login | ✅ | `frontend/js/auth.js` komplett implementiert |
| 5 – Cloud-Laden beim Login | ✅ | `ladeCloudDaten()`, `migrateSessionToCloud()` in auth.js |
| 6 – Feature-Gates | ✅ | `frontend/js/gates.js` mit `requiresPaid()` und Upgrade-Modal |
| 7 – Paddle-Webhook Edge Function | ⏳ | Supabase + Paddle eingerichtet – prüfen ob jetzt deploybar |
| 8 – Pricing-Seite | ✅ | `frontend/preise.html` mit Paddle-Checkout + 3-Schritt-Modal |
| 9 – N8N-Workflows | ⏳ | Wartet auf N8N-Server-Setup |
| 10 – Launch-Vorbereitung (AGB etc.) | ✅ | `agb.html`, `impressum.html`, `datenschutz.html` vorhanden |
| 11 – Gestuftes PDF-Branding | ⏳ | `getFordifyBranding()` noch nicht implementiert |
| 12 – Excel/CSV-Export | ✅ | `fallExportierenAlsExcel()` in app.js implementiert |

**Blockierungen:** Task 7 (klären ob Paddle-Webhook deploybar), Task 9 (N8N fehlt), Task 11 (Code-Änderung nötig).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fordify von einer reinen localStorage-SPA zu einem Freemium-SaaS transformieren: Free-Nutzer arbeiten mit sessionStorage (Daten weg beim Tab-Schließen), Paid-Nutzer haben Cloud-Speicherung via Supabase, dauerhaftes Kanzlei-Profil und Excel-Export. Zahlungsabwicklung über Paddle (Merchant of Record).

**Architecture:** Storage-Abstraktionsschicht (`storage.js`) entkoppelt App-Code von konkretem Storage-Backend. Auth via Supabase Magic Link. Feature-Gates via `requiresPaid()`. Paddle-Webhooks landen auf Supabase Edge Function, die die `subscriptions`-Tabelle befüllt.

**Tech Stack:** Vanilla JS (kein Build-Step), Bootstrap 5, Supabase JS SDK via CDN, Paddle.js via CDN, Resend (via N8N), GoatCounter (self-hosted auf Hostinger)

**Voraussetzungen (durch Jens erledigt, bevor Implementierung beginnt):**
- Supabase-Projekt angelegt (Region: EU Frankfurt), URL + anon Key verfügbar
- Resend-Account, Domain verifiziert, `noreply@fordify.de` aktiv
- Paddle-Account aktiv (Sandbox-Credentials verfügbar)
- GoatCounter auf Hostinger installiert und erreichbar

---

## Task 1: Supabase-Datenbankschema deployen

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/rls.sql`

- [ ] **Schritt 1: Schema-Datei erstellen**

```sql
-- supabase/schema.sql

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
  status TEXT DEFAULT 'inactive',  -- 'active', 'trialing', 'canceled', 'past_due', 'suspended'
  plan TEXT DEFAULT 'pro',         -- 'pro', 'team'
  billing_cycle TEXT DEFAULT 'monthly',  -- 'monthly', 'yearly'
  trial_ends_at TIMESTAMPTZ,
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

-- Kontakte / Schuldner-Adressbuch (nur Team-Tier)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strasse TEXT, plz TEXT, ort TEXT,
  email TEXT, telefon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

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
```

- [ ] **Schritt 2: RLS-Datei erstellen**

```sql
-- supabase/rls.sql

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Subscriptions: nur lesen (schreiben nur via Service Role / Edge Function)
CREATE POLICY "subscriptions_own_read" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Cases
CREATE POLICY "cases_own" ON cases FOR ALL USING (auth.uid() = user_id);

-- Settings
CREATE POLICY "settings_own" ON settings FOR ALL USING (auth.uid() = user_id);

-- Contacts
CREATE POLICY "contacts_own" ON contacts FOR ALL USING (auth.uid() = user_id);
```

- [ ] **Schritt 3: Schema im Supabase SQL Editor ausführen**

Im Supabase Dashboard: SQL Editor → beide Dateien nacheinander ausführen.

- [ ] **Schritt 4: RLS testen**

Zwei Test-Accounts anlegen (Magic Link mit zwei E-Mail-Adressen). Prüfen:
- Account A kann Daten von Account B nicht lesen (SQL direkt im Dashboard testen)
- `SELECT * FROM cases WHERE user_id = '<uuid-von-b>'` als Account A → leeres Ergebnis

- [ ] **Schritt 5: Commit**

```bash
git add supabase/
git commit -m "feat: Supabase-Schema + RLS für Freemium-MVP"
```

---

## Task 2: GoatCounter-Tracking in alle Seiten einbinden

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/zinsrechner.html`
- Modify: `frontend/rvg-rechner.html`
- Modify: `frontend/gerichtskostenrechner.html`
- Modify: `frontend/forderungsaufstellung.html`
- Modify: `frontend/impressum.html`
- Modify: `frontend/datenschutz.html`

**Voraussetzung:** GoatCounter-URL von Jens erhalten (z.B. `https://stats.fordify.de`)

- [ ] **Schritt 1: Tracking-Script vor `</body>` in jede HTML-Datei einfügen**

```html
<!-- GoatCounter – kein Cookie-Banner nötig, DSGVO-konform -->
<script data-goatcounter="https://stats.fordify.de/count"
        async src="//stats.fordify.de/count.js"></script>
```

- [ ] **Schritt 2: Custom Events für Conversion-Tracking vorbereiten**

In `frontend/js/config.js` Hilfsfunktion ergänzen:

```javascript
// Conversion-Event an GoatCounter senden
function trackEvent(name) {
  if (typeof window.goatcounter === 'undefined') return;
  window.goatcounter.count({ path: name, title: name, event: true });
}
// Verwendung: trackEvent('registrierung'), trackEvent('upgrade-modal'), trackEvent('trial-start')
```

- [ ] **Schritt 3: SW-Version erhöhen, Commit**

```bash
# sw.js: fordify-v54 / fordify-staging-v8
git add frontend/ && git commit -m "feat: GoatCounter-Analytics + trackEvent-Hilfsfunktion"
```

---

## Task 3: Storage-Abstraktionsschicht

**Files:**
- Create: `frontend/js/storage.js`
- Modify: `frontend/js/app.js` (localStorage-Calls ersetzen)
- Modify: `frontend/forderungsaufstellung.html` (script-Tag ergänzen)

- [ ] **Schritt 1: `storage.js` erstellen**

```javascript
// frontend/js/storage.js
// Storage-Abstraktion: sessionStorage (Free) vs. localStorage + Supabase (Paid)

const STORAGE_KEY_CASES    = 'fordify_cases';
const STORAGE_KEY_SETTINGS = 'fordify_settings';
const STORAGE_KEY_THEME    = 'fordify_theme';    // immer localStorage
const STORAGE_KEY_ONBOARD  = 'fordify_onboarded'; // immer localStorage

const StorageBackend = (() => {
  let _backend = sessionStorage;
  let _cloudSync = null;

  function init(authState) {
    if (authState && authState.isAuthenticated && authState.hasSubscription) {
      _backend = localStorage;
      _cloudSync = CloudSync;
    } else {
      _backend = sessionStorage;
      _cloudSync = null;
    }
  }

  function getItem(key) {
    return _backend.getItem(key);
  }

  function setItem(key, value) {
    _backend.setItem(key, value);
    if (_cloudSync) _cloudSync.enqueue(key, value);
  }

  function removeItem(key) {
    _backend.removeItem(key);
    if (_cloudSync) _cloudSync.enqueueDelete(key);
  }

  return { init, getItem, setItem, removeItem };
})();

// Cloud-Sync (Debounced, 2 Sekunden)
const CloudSync = (() => {
  let _queue = [];
  let _timer = null;

  function enqueue(key, value) {
    _queue = _queue.filter(i => i.key !== key);
    _queue.push({ key, value, deleted: false });
    clearTimeout(_timer);
    _timer = setTimeout(_sync, 2000);
  }

  function enqueueDelete(key) {
    _queue = _queue.filter(i => i.key !== key);
    _queue.push({ key, deleted: true });
    clearTimeout(_timer);
    _timer = setTimeout(_sync, 2000);
  }

  async function _sync() {
    const items = [..._queue];
    _queue = [];
    for (const item of items) {
      try {
        if (item.key === STORAGE_KEY_CASES)    await _syncCases(item);
        if (item.key === STORAGE_KEY_SETTINGS) await _syncSettings(item);
      } catch (e) {
        console.warn('CloudSync Fehler:', e);
        // Kein Re-Queue – localStorage bleibt als Fallback
      }
    }
  }

  async function _syncCases(item) {
    if (item.deleted) {
      await supabaseClient.from('cases').delete().eq('user_id', fordifyAuth.user.id);
      return;
    }
    const reg = JSON.parse(item.value);
    for (const c of Object.values(reg.cases || {})) {
      await supabaseClient.from('cases').upsert({
        id: c.id,
        user_id: fordifyAuth.user.id,
        name: c.name,
        data: c.fall,
        naechste_id: c.naechsteId,
        updated_at: new Date().toISOString()
      });
    }
  }

  async function _syncSettings(item) {
    if (item.deleted) {
      await supabaseClient.from('settings').delete().eq('user_id', fordifyAuth.user.id);
      return;
    }
    await supabaseClient.from('settings').upsert({
      user_id: fordifyAuth.user.id,
      data: JSON.parse(item.value),
      updated_at: new Date().toISOString()
    });
  }

  return { enqueue, enqueueDelete };
})();
```

- [ ] **Schritt 2: In `app.js` alle `localStorage.getItem/setItem/removeItem` ersetzen**

Suche in `app.js` nach allen Vorkommen von:
- `localStorage.getItem(STORAGE_KEY_CASES)` → `StorageBackend.getItem(STORAGE_KEY_CASES)`
- `localStorage.setItem(STORAGE_KEY_CASES` → `StorageBackend.setItem(STORAGE_KEY_CASES`
- `localStorage.getItem(STORAGE_KEY_SETTINGS)` → `StorageBackend.getItem(STORAGE_KEY_SETTINGS)`
- `localStorage.setItem(STORAGE_KEY_SETTINGS` → `StorageBackend.setItem(STORAGE_KEY_SETTINGS`

**Ausnahmen – diese bleiben auf `localStorage` direkt:**
- `localStorage.getItem(STORAGE_KEY_THEME)` → nicht anfassen
- `localStorage.getItem(STORAGE_KEY_ONBOARD)` → nicht anfassen
- `localStorage.removeItem(STORAGE_KEY_LAST_EXPORT)` → nicht anfassen

- [ ] **Schritt 3: `storage.js` in `forderungsaufstellung.html` einbinden**

```html
<!-- Vor app.js, nach config.js -->
<script src="js/storage.js"></script>
```

- [ ] **Schritt 4: Manuell testen**

Ohne Login: Tab schließen, neu öffnen → Daten weg (sessionStorage).  
Erwartetes Verhalten: App startet leer, kein Fehler in der Konsole.

- [ ] **Schritt 5: Commit**

```bash
git add frontend/js/storage.js frontend/js/app.js frontend/forderungsaufstellung.html
git commit -m "feat: Storage-Abstraktionsschicht (sessionStorage für Free)"
```

---

## Task 4: Supabase Auth – Magic Link Login

**Files:**
- Create: `frontend/js/auth.js`
- Modify: `frontend/forderungsaufstellung.html` (Login-Modal + script-Tag)
- Modify: `frontend/js/app.js` (Auth-State-Abhängigkeiten)
- Modify: `frontend/css/app.css` (Login-Modal-Styles)

- [ ] **Schritt 1: `auth.js` erstellen**

```javascript
// frontend/js/auth.js
// Supabase-URL und anon Key aus config.js (dort als Konstanten definieren)

const supabaseClient = window.supabase.createClient(
  FORDIFY_SUPABASE_URL,
  FORDIFY_SUPABASE_ANON_KEY
);

const fordifyAuth = {
  isAuthenticated: false,
  hasSubscription: false,
  user: null,
  plan: null
};

async function ladeSubscriptionStatus() {
  if (!fordifyAuth.user) return;
  const { data } = await supabaseClient
    .from('subscriptions')
    .select('status, plan, trial_ends_at, current_period_end')
    .eq('user_id', fordifyAuth.user.id)
    .single();

  if (data && (data.status === 'active' || data.status === 'trialing')) {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = data.plan;
  } else {
    fordifyAuth.hasSubscription = false;
  }
}

async function loginMitEmail(email) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/forderungsaufstellung.html' }
  });
  if (error) {
    zeigeFehlermeldung('Login fehlgeschlagen: ' + error.message);
  } else {
    zeigeLoginHinweis('Link gesendet – prüfe dein Postfach.');
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
}

async function migrateSessionToCloud() {
  const legacyData = localStorage.getItem(STORAGE_KEY_CASES);
  if (!legacyData) return;
  const reg = JSON.parse(legacyData);
  const count = Object.keys(reg.cases || {}).length;
  if (count === 0) return;

  const confirmed = confirm(
    `${count} lokal gespeicherte(r) Fall/Fälle gefunden.\nIn die Cloud übernehmen?`
  );
  if (!confirmed) return;

  for (const c of Object.values(reg.cases || {})) {
    await supabaseClient.from('cases').upsert({
      id: c.id, user_id: fordifyAuth.user.id,
      name: c.name, data: c.fall,
      naechste_id: c.naechsteId,
      updated_at: new Date().toISOString()
    });
  }
  localStorage.removeItem(STORAGE_KEY_CASES);
  localStorage.removeItem(STORAGE_KEY_SETTINGS);
  zeigeErfolg('Daten erfolgreich in die Cloud übertragen.');
}

// Auth-State-Listener (einmal beim Start aufrufen)
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    await ladeSubscriptionStatus();
    StorageBackend.init(fordifyAuth);
    await migrateSessionToCloud();
    aktualisiereUIFuerAuth();
    trackEvent('login');
  }
  if (event === 'SIGNED_OUT') {
    fordifyAuth.isAuthenticated = false;
    fordifyAuth.hasSubscription = false;
    fordifyAuth.user = null;
    fordifyAuth.plan = null;
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
  }
});

function aktualisiereUIFuerAuth() {
  const isAuth = fordifyAuth.isAuthenticated;
  const isPaid = fordifyAuth.hasSubscription;

  // Login-Button / User-Menü umschalten
  document.querySelectorAll('[data-auth-show="guest"]').forEach(el =>
    el.classList.toggle('d-none', isAuth));
  document.querySelectorAll('[data-auth-show="user"]').forEach(el =>
    el.classList.toggle('d-none', !isAuth));

  // Feature-Gates aktualisieren
  document.querySelectorAll('[data-requires-paid]').forEach(el => {
    el.classList.toggle('feature-locked', !isPaid);
  });

  // Free-Tier-Banner
  const banner = document.getElementById('free-tier-banner');
  if (banner) banner.classList.toggle('d-none', isPaid);
}
```

- [ ] **Schritt 2: SUPABASE-Credentials in `config.js` eintragen**

```javascript
// frontend/js/config.js – ergänzen (nie den service_role Key!)
const FORDIFY_SUPABASE_URL      = 'https://xxxx.supabase.co';
const FORDIFY_SUPABASE_ANON_KEY = 'eyJhbGc...';
```

- [ ] **Schritt 3: Login-Modal in `forderungsaufstellung.html` einfügen**

```html
<!-- Login-Modal -->
<div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold" id="loginModalLabel">Bei fordify anmelden</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body pt-2">
        <p class="text-muted small mb-3">Gib deine E-Mail ein – wir senden dir einen Link.</p>
        <div class="mb-3">
          <input type="email" class="form-control" id="login-email"
                 placeholder="deine@kanzlei.de" autocomplete="email">
        </div>
        <button class="btn btn-primary w-100" onclick="loginMitEmail(document.getElementById('login-email').value)">
          Link senden
        </button>
        <p class="text-muted text-center mt-3 mb-0" style="font-size:0.75rem">
          Kein Passwort – kein Risiko.
        </p>
      </div>
    </div>
  </div>
</div>

<!-- Free-Tier-Banner -->
<div id="free-tier-banner" class="alert alert-info border-0 rounded-0 mb-0 py-2 text-center small">
  <strong>Testversion</strong> – Daten werden beim Schließen des Tabs gelöscht.
  <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" class="alert-link ms-1">Kostenloses Konto erstellen</a>
  oder
  <a href="/preise.html" class="alert-link">14 Tage Pro testen</a>
</div>
```

- [ ] **Schritt 4: Supabase JS SDK in `forderungsaufstellung.html` laden**

```html
<!-- Vor allen anderen JS-Dateien -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="js/config.js"></script>
<script src="js/storage.js"></script>
<script src="js/auth.js"></script>
```

- [ ] **Schritt 5: Magic Link testen**

E-Mail eingeben → Link prüfen → klicken → `SIGNED_IN` Event feuert → UI wechselt.

- [ ] **Schritt 6: Commit**

```bash
git add frontend/js/auth.js frontend/js/config.js frontend/forderungsaufstellung.html
git commit -m "feat: Supabase Magic Link Auth + Login-Modal + Free-Tier-Banner"
```

---

## Task 5: Cloud-Laden beim Login

**Files:**
- Modify: `frontend/js/auth.js`
- Modify: `frontend/js/app.js`

- [ ] **Schritt 1: Cloud-Daten nach Login laden**

In `auth.js`, in `SIGNED_IN`-Handler nach `StorageBackend.init()`:

```javascript
async function ladeCloudDaten() {
  // Fälle laden
  const { data: cases } = await supabaseClient
    .from('cases')
    .select('*')
    .eq('user_id', fordifyAuth.user.id);

  if (cases && cases.length > 0) {
    const reg = { cases: {}, naechsteId: 1 };
    cases.forEach(c => {
      reg.cases[c.id] = {
        id: c.id, name: c.name,
        fall: c.data, naechsteId: c.naechste_id,
        updatedAt: c.updated_at
      };
    });
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(reg));
  }

  // Einstellungen laden
  const { data: settings } = await supabaseClient
    .from('settings')
    .select('data')
    .eq('user_id', fordifyAuth.user.id)
    .single();

  if (settings) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings.data));
  }

  // App neu initialisieren mit geladenen Daten
  if (typeof ladeEinstellungen === 'function') ladeEinstellungen();
  if (typeof ladeFaelleAusStorage === 'function') ladeFaelleAusStorage();
}
```

- [ ] **Schritt 2: Testen**

Login → Cloud-Daten werden geladen → Fälle erscheinen in der Liste → kein Datenverlust.

- [ ] **Schritt 3: Commit**

```bash
git commit -am "feat: Cloud-Daten nach Login laden (Cases + Settings)"
```

---

## Task 6: Feature-Gates (Export, Excel, Impressum-Speicherung)

**Files:**
- Create: `frontend/js/gates.js`
- Modify: `frontend/js/app.js`
- Modify: `frontend/css/app.css`

- [ ] **Schritt 1: `gates.js` erstellen**

```javascript
// frontend/js/gates.js

function requiresPaid(featureName) {
  if (fordifyAuth.hasSubscription) return false;
  zeigeUpgradeModal(featureName);
  trackEvent('upgrade-modal-' + featureName);
  return true;
}

function zeigeUpgradeModal(featureName) {
  const featureLabels = {
    'speichern':  'Fälle dauerhaft speichern',
    'excel':      'Excel/CSV-Export',
    'json':       'JSON-Export',
    'vorlagen':   'Fallvorlagen',
    'einstellungen': 'Kanzlei-Profil dauerhaft speichern'
  };
  const label = featureLabels[featureName] || featureName;
  document.getElementById('upgrade-modal-feature').textContent = label;
  const modal = new bootstrap.Modal(document.getElementById('upgradeModal'));
  modal.show();
}
```

- [ ] **Schritt 2: Upgrade-Modal in `forderungsaufstellung.html`**

```html
<div class="modal fade" id="upgradeModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold">PRO-Funktion</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body text-center py-4">
        <div class="mb-3" style="font-size:2rem">🔒</div>
        <p class="fw-semibold mb-1"><span id="upgrade-modal-feature"></span></p>
        <p class="text-muted small mb-4">
          Diese Funktion ist im Pro-Plan verfügbar.<br>
          14 Tage kostenlos testen – keine Kreditkarte nötig.
        </p>
        <a href="/preise.html" class="btn btn-primary">
          14 Tage Pro testen →
        </a>
        <p class="text-muted mt-3 mb-0 small">
          Bereits Konto?
          <a href="#" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#loginModal">Anmelden</a>
        </p>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Schritt 3: Gates in `app.js` einklinken**

```javascript
// In app.js – diese Funktionen mit Gate versehen:
function drucken() {
  // PDF-Export bleibt kostenlos – kein Gate
  // ... bestehender Code ...
}

function fallExportierenAlsExcel() {
  if (requiresPaid('excel')) return;
  // ... bestehender Code ...
}

function fallExportierenAlsJson() {
  if (requiresPaid('json')) return;
  // ... bestehender Code ...
}

function einstellungenSpeichern() {
  if (requiresPaid('einstellungen')) return;
  // ... bestehender Code ...
}
```

- [ ] **Schritt 4: PRO-Badge CSS in `app.css`**

```css
/* Feature-Gate: PRO-Badge auf gesperrten Buttons */
[data-requires-paid].feature-locked {
  opacity: 0.7;
  position: relative;
}
[data-requires-paid].feature-locked::after {
  content: "PRO";
  font-size: 0.55rem;
  font-weight: 700;
  background: #f59e0b;
  color: #000;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  position: absolute;
  top: -6px;
  right: -6px;
  pointer-events: none;
}
```

- [ ] **Schritt 5: Testen**

Als Free-Nutzer: Excel-Export → Upgrade-Modal erscheint. PDF-Export → funktioniert. Einstellungen speichern → Upgrade-Modal.

- [ ] **Schritt 6: Commit**

```bash
git add frontend/js/gates.js frontend/css/app.css frontend/forderungsaufstellung.html
git commit -m "feat: Feature-Gates + Upgrade-Modal (Excel, JSON, Einstellungen)"
```

---

## Task 7: Paddle-Webhook – Supabase Edge Function

**Files:**
- Create: `supabase/functions/paddle-webhook/index.ts`

- [ ] **Schritt 1: Edge Function erstellen**

```typescript
// supabase/functions/paddle-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PADDLE_WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const body = await req.text()
  const signature = req.headers.get('paddle-signature') || ''

  // Signatur prüfen
  const isValid = await verifyPaddleSignature(body, signature, PADDLE_WEBHOOK_SECRET)
  if (!isValid) return new Response('Unauthorized', { status: 401 })

  const event = JSON.parse(body)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { event_type, data } = event

  if (['subscription.created', 'subscription.updated', 'subscription.activated'].includes(event_type)) {
    const userId = data.custom_data?.user_id
    if (!userId) return new Response('Missing user_id', { status: 400 })

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      paddle_subscription_id: data.id,
      paddle_customer_id: data.customer_id,
      status: data.status,
      plan: data.items?.[0]?.price?.custom_data?.plan || 'pro',
      billing_cycle: data.billing_cycle?.interval || 'month',
      trial_ends_at: data.trial_dates?.ends_at || null,
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
  // Paddle v2 HMAC-SHA256 Signatur-Verifikation
  const parts = Object.fromEntries(signature.split(';').map(p => p.split('=')))
  const ts = parts['ts']
  const h1 = parts['h1']
  const signedPayload = `${ts}:${body}`
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === h1
}
```

- [ ] **Schritt 2: Edge Function deployen**

```bash
npx supabase functions deploy paddle-webhook --project-ref <project-ref>
```

- [ ] **Schritt 3: Secrets in Supabase setzen**

Im Supabase Dashboard → Settings → Edge Functions → Secrets:
- `PADDLE_WEBHOOK_SECRET` → aus Paddle-Dashboard
- `SUPABASE_SERVICE_ROLE_KEY` → aus Supabase-Dashboard (niemals im Frontend!)

- [ ] **Schritt 4: Webhook-URL in Paddle eintragen**

Format: `https://<project-ref>.supabase.co/functions/v1/paddle-webhook`

- [ ] **Schritt 5: End-to-End testen (Sandbox)**

Paddle Sandbox → Test-Kauf → subscriptions-Tabelle prüfen → Feature-Unlock prüfen.

- [ ] **Schritt 6: Commit**

```bash
git add supabase/functions/
git commit -m "feat: Paddle-Webhook Edge Function mit Signatur-Validierung"
```

---

## Task 8: Pricing-Seite

**Files:**
- Create: `frontend/preise.html`

- [ ] **Schritt 1: `preise.html` erstellen**

Struktur: Navbar (gleich wie andere Seiten), Preis-Toggle (Monatlich/Jährlich), drei Spalten (Free / Pro / Kanzlei), Feature-Vergleichstabelle, Trust-Signale, FAQ, Footer.

Paddle-Integration:
```html
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>
  // Sandbox: Paddle.Environment.set('sandbox');
  Paddle.Setup({ token: 'live_xxxx' }); // Token aus config.js
</script>

<button class="btn btn-primary btn-lg w-100" onclick="Paddle.Checkout.open({
  items: [{ priceId: document.getElementById('toggle-yearly').checked
    ? 'pri_fordify_pro_yearly'   // 149 €/Jahr
    : 'pri_fordify_pro_monthly', // 19 €/Monat
    quantity: 1 }],
  customData: { user_id: fordifyAuth.user?.id || null }
})">Pro starten</button>
```

`customData.user_id` ist wichtig – so weiß die Edge Function, welchem Nutzer die Subscription zuzuordnen ist.

- [ ] **Schritt 2: Jährlich/Monatlich-Toggle**

```javascript
const toggle = document.getElementById('billing-toggle');
toggle.addEventListener('change', () => {
  document.querySelectorAll('.price-monthly').forEach(el =>
    el.classList.toggle('d-none', toggle.checked));
  document.querySelectorAll('.price-yearly').forEach(el =>
    el.classList.toggle('d-none', !toggle.checked));
});
```

- [ ] **Schritt 3: in Sitemap + SW ergänzen, Commit**

```bash
# sw.js: fordify-v55 / fordify-staging-v9
git add frontend/preise.html frontend/sw.js frontend/sitemap.xml
git commit -m "feat: Pricing-Seite mit Paddle-Checkout"
```

---

## Task 9: N8N-Workflows (auf bestehendem Hostinger-Server)

**Kein Code-Commit – Konfiguration in N8N-UI**

- [ ] **Workflow 1: Neuer Supabase-User → Willkommens-E-Mail**

Trigger: Supabase Webhook (INSERT auf `auth.users`)
→ HTTP Request an Resend API:
```json
{
  "from": "noreply@fordify.de",
  "to": ["{{$json.email}}"],
  "subject": "Willkommen bei fordify",
  "html": "<p>Hallo,<br>danke für deine Registrierung...</p>"
}
```

- [ ] **Workflow 2: Trial-Management (Cron täglich 08:00)**

Supabase Query:
```sql
SELECT u.email, s.trial_ends_at
FROM subscriptions s JOIN profiles u ON s.user_id = u.id
WHERE s.status = 'trialing'
  AND s.trial_ends_at::date = (CURRENT_DATE + INTERVAL '3 days')::date
```
→ Resend: Trial-Erinnerung senden

- [ ] **Workflow 3: Paddle → E-Mail-Bestätigung**

Trigger: Webhook von Supabase Edge Function (nach Subscription-Update)
→ Resend: Zahlungsbestätigung

- [ ] **Workflow 4: Wöchentlicher interner Digest (Montag 08:00)**

Supabase Query: neue Accounts + neue Paid letzte 7 Tage
→ Resend: Zusammenfassung an hallo@fordify.de

---

## Task 10: Launch-Vorbereitung

**Files:**
- Modify: `frontend/impressum.html`
- Modify: `frontend/datenschutz.html`
- Create: `frontend/agb.html`

- [ ] **Schritt 1: Impressum aktualisieren**

Gewerbeanmeldungs-Daten eintragen: Name, Adresse, E-Mail, Steuernummer, USt-ID (falls vorhanden), Plattform-Link (EU-Streitschlichtung).

- [ ] **Schritt 2: Datenschutzerklärung aktualisieren**

Neue Abschnitte ergänzen:
- Supabase als Auftragsverarbeiter (EU Frankfurt)
- Paddle als Merchant of Record
- Resend als E-Mail-Dienstleister
- GoatCounter Analytics (cookielos, kein Cookie-Banner nötig)
- Account-Daten: Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO

- [ ] **Schritt 3: AGB/Nutzungsbedingungen anlegen**

Pflichtinhalt: Leistungsbeschreibung, Free vs. Paid, Kündigung, Haftungsausschluss (keine Rechtsberatung), AVV-Klauseln für Schuldnerdaten.

- [ ] **Schritt 4: End-to-End-Test**

```
Free:  App öffnen → Fall anlegen → PDF exportieren ✅ → Tab schließen → Daten weg ✅
       Excel-Export → Upgrade-Modal ✅ → Einstellungen speichern → Upgrade-Modal ✅

Trial: Registrieren → Login → 14-Tage-Trial → alle Features entsperrt ✅
       Excel-Export → funktioniert ✅ → Einstellungen speichern → gespeichert ✅

Paid:  Paddle-Kauf → Webhook → subscriptions ✅ → Feature-Unlock ✅
       Tab schließen → Login → Daten noch da ✅

Kündigung: Paddle-Kündigung → Webhook → status = 'canceled' → Gates wieder aktiv ✅
```

- [ ] **Schritt 5: SW-Version, finaler Commit**

```bash
# sw.js: fordify-v56 / fordify-staging-v10
git add . && git commit -m "feat: Launch-Vorbereitung – Impressum, Datenschutz, AGB, E2E-Tests"
git push
```

---

## Task 11: Gestuftes PDF-Branding (nach Task 4 + 6)

> **Voraussetzung:** Task 4 (Auth) und Task 6 (Feature-Gates) müssen abgeschlossen sein, damit `fordifyAuth.plan` verfügbar ist.

**Files:**
- Modify: `frontend/js/app.js` (Funktion `drucken()`)

**Hintergrund:**
- Step 1 (bereits erledigt): fordify-Branding-Footer prominent im PDF für alle Nutzer
- Step 2 (dieser Task): Branding abhängig vom Plan-Level machen

**Plan-Level-Logik:**
- `free` → Prominenter Banner (aktueller Stand, bleibt so)
- `pro` → Dezenter Einzeiler unten (kleiner, weniger auffällig)
- `kanzlei` → Kein Branding (white-label)

- [ ] **Schritt 1: `drucken()` in `app.js` anpassen**

Aktuell gibt es eine einzige `fordifyBranding`-Variable. Diese durch eine Funktion ersetzen, die je nach Plan unterschiedliches HTML zurückgibt:

```javascript
function getFordifyBranding() {
  const plan = (window.fordifyAuth && window.fordifyAuth.plan) || 'free';
  if (plan === 'kanzlei') return '';
  if (plan === 'pro') {
    return `<div style="margin-top:2rem;text-align:center;font-family:sans-serif;">
      <p style="margin:0;font-size:0.72rem;color:#94a3b8;">
        Erstellt mit <a href="https://fordify.de" style="color:#94a3b8;">fordify.de</a>
      </p>
    </div>`;
  }
  // free: prominenter Banner (bestehender Code)
  return `<div style="margin-top:2.5rem;padding-top:1.25rem;border-top:2px solid #1e3a8a;text-align:center;font-family:sans-serif;">
    <p style="margin:0 0 0.3rem;font-size:0.9rem;font-weight:700;color:#1e3a8a;letter-spacing:0.01em;">Erstellt mit fordify</p>
    <p style="margin:0;font-size:0.8rem;color:#64748b;">
      Professionelle Forderungsaufstellungen nach § 367 BGB kostenlos erstellen und als PDF exportieren
      &nbsp;·&nbsp; <strong style="color:#1e3a8a;">fordify.de</strong>
    </p>
  </div>`;
}
```

In `drucken()` ersetzen:
```javascript
// Alt:
const fordifyBranding = `...`;
// Neu:
const fordifyBranding = getFordifyBranding();
```

- [ ] **Schritt 2: SW-Version bumpen + committen**

```bash
# sw.js: fordify-vN (um 1 erhöhen)
git add frontend/js/app.js frontend/sw.js
git commit -m "feat: gestuftes PDF-Branding – Pro dezent, Kanzlei kein Branding"
git push
```

---

## Task 12: Excel / CSV-Export implementieren (vor Task 6)

> **Voraussetzung:** Muss vor Task 6 erledigt sein, da Task 6 (Feature-Gates) `fallExportierenAlsExcel()` mit einem Gate versieht — die Funktion muss also vorher existieren.

**Files:**
- Modify: `frontend/js/app.js`
- Modify: `frontend/forderungsaufstellung.html` (Button für Excel-Export hinzufügen)

**Hintergrund:** Aktuell gibt es nur JSON-Export (`fallExportieren()`) und PDF-Export (`drucken()`). Excel/CSV ist auf der Preisseite versprochen und muss als Pro-Feature implementiert werden.

**Was exportiert werden soll:** Eine Zeile pro Position — Typ, Datum, Bezeichnung, Betrag, Zinsen (falls vorhanden), Gesamtbetrag.

- [ ] **Schritt 1: `fallExportierenAlsExcel()` in `app.js` implementieren**

Da kein Build-Schritt existiert und keine externe Bibliothek geladen werden soll, wird ein CSV-Export mit `.xls`-Endung erzeugt (Excel öffnet diese direkt). Alternativ: reines `.csv`.

```javascript
function fallExportierenAlsExcel() {
  // Gate wird in Task 6 vorgelagert — hier noch nicht
  const fall = state.fall;
  const rows = [
    ['Typ', 'Datum', 'Bezeichnung', 'Betrag (€)', 'Zinsen (€)', 'Gesamt (€)']
  ];

  for (const pos of fall.positionen) {
    const typ = pos.typ || '';
    const datum = pos.datum || '';
    const bezeichnung = pos.bezeichnung || pos.typ || '';
    const betrag = pos.betrag != null ? String(pos.betrag).replace('.', ',') : '';
    // Zinsen: wenn verfügbar, aus berechneten Zinsperioden-Positionen
    const zinsen = (pos.typ === 'zinsperiode' && pos.zinsGesamtEur != null)
      ? String(pos.zinsGesamtEur).replace('.', ',')
      : '';
    const gesamt = ''; // leer – Gesamtsumme steht in Zusammenfassung, nicht je Zeile
    rows.push([typ, datum, bezeichnung, betrag, zinsen, gesamt]);
  }

  // Zusammenfassung anhängen
  rows.push([]);
  rows.push(['', '', 'Gesamtforderung', '', '', String(berechneGesamtforderung()).replace('.', ',')]);

  const csv = rows.map(r =>
    r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(';')
  ).join('\r\n');

  const bom = '\uFEFF'; // UTF-8 BOM für Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportBasisname(fall) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

> **Hinweis zu `berechneGesamtforderung()`:** Prüfen, ob diese Funktion in app.js existiert oder wie die Gesamtsumme aktuell berechnet wird (ggf. aus `baueSummaryTabelle()` ableiten). Entsprechend anpassen.

- [ ] **Schritt 2: Export-Button in `forderungsaufstellung.html` einfügen**

Den bestehenden JSON-Export-Button suchen und daneben einen Excel-Button setzen:

```html
<button type="button" class="btn btn-outline-success btn-sm" onclick="fallExportierenAlsExcel()">
  Excel / CSV
</button>
```

- [ ] **Schritt 3: Testen**

```
Fall mit mind. 3 Positionen anlegen → Excel-Button klicken → .csv öffnet sich in Excel
→ Umlaute korrekt (UTF-8 BOM) ✓
→ Semikolon-Trenner (DE-Excel-Standard) ✓
→ Gesamtsumme in letzter Zeile ✓
```

- [ ] **Schritt 4: Commit**

```bash
git add frontend/js/app.js frontend/forderungsaufstellung.html frontend/sw.js
git commit -m "feat: Excel/CSV-Export als neue Funktion (wird in Task 6 als Pro-Gate versehen)"
git push
```

---

## Übersicht Zeitplan

| Task | Inhalt | Dauer |
|---|---|---|
| 1 | Supabase Schema + RLS | 0,5 Tage |
| 2 | GoatCounter einbinden | 0,5 Tage |
| 3 | Storage-Abstraktion | 1–2 Tage |
| 4 | Auth + Login-Modal | 1–2 Tage |
| 5 | Cloud-Laden beim Login | 1 Tag |
| **12** | **Excel/CSV-Export implementieren** | **0,5 Tage** |
| 6 | Feature-Gates (Excel, JSON, Einstellungen) | 1 Tag |
| 7 | Paddle Edge Function | 1–2 Tage |
| 8 | Pricing-Seite | 1–2 Tage |
| 9 | N8N-Workflows | 1 Tag |
| 10 | Launch-Vorbereitung | 1 Tag |
| 11 | Gestuftes PDF-Branding | 0,5 Tage |
| **Gesamt** | | **~10–14 Tage** |

---

*Technischer Plan – Stand 2026-04-20 – für Claude Code*
