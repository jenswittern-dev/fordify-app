# Adressbücher + Gate-System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Schuldner-Adressbuch (Pro) und Mandanten-Adressbuch (Business) in Supabase speichern, mit CRUD-UI im Kundenbereich und Autocomplete in der Forderungsaufstellung, plus plan-aware Upgrade-Modal und Export-Label-Umbenennung.

**Architecture:** Alle Kontakte (Schuldner + Mandanten) landen in der bestehenden Supabase-Tabelle `contacts`, erweitert um eine `type`-Spalte (`'schuldner'` | `'mandant'`). Ein neues `contacts.js` verwaltet den globalen In-Memory-Cache und das Supabase-CRUD; es wird in `forderungsaufstellung.html` (Autocomplete) und `konto.html` (Verwaltungs-UI) eingebunden. Business-exklusive Features (Mandanten-Adressbuch) werden durch eine neue `requiresBusiness()`-Funktion in `gates.js` geschützt. CSV-Import ist ein separater Plan.

**Tech Stack:** Vanilla JS (kein Build-Schritt), Bootstrap 5.3.3, Supabase JS v2 (RLS), Supabase PostgreSQL

---

## Dateistruktur

| Datei | Aktion | Verantwortung |
|---|---|---|
| `frontend/js/contacts.js` | Neu anlegen | Globaler Cache `fordifyContacts` + Supabase CRUD (`ladeKontakte`, `speichereKontakt`, `loescheKontakt`) |
| `frontend/js/gates.js` | Ändern | `requiresBusiness()` hinzufügen, Upgrade-Modal plan-aware machen |
| `frontend/forderungsaufstellung.html` | Ändern | Upgrade-Modal IDs, `<datalist>`-Elemente, `contacts.js` einbinden |
| `frontend/js/auth.js` | Ändern | `ladeKontakte()` nach Login aufrufen |
| `frontend/konto.html` | Ändern | Neuer "Adressen"-Tab (HTML-Struktur), `contacts.js` einbinden |
| `frontend/js/konto.js` | Ändern | Tab-Routing + CRUD-Funktionen für Adressbuch |
| `frontend/preise.html` | Ändern | "Excel / CSV-Export" → "CSV & JSON-Export", Mandanten-Adressbuch-Zeile |
| `supabase/schema.sql` | Ändern | `type`-Spalte + RLS-Policy für `contacts` |
| `frontend/sw.js` | Ändern | `contacts.js` in ASSETS + Version bumpen (letzter Task) |
| `CLAUDE.md` | Ändern | SW-Version aktualisieren |

---

## Task 1: Gate-System – requiresBusiness() + Upgrade-Modal plan-aware

**Files:**
- Modify: `frontend/js/gates.js`
- Modify: `frontend/forderungsaufstellung.html` (Zeilen ~675–677)

- [ ] **Step 1: gates.js vollständig ersetzen**

```javascript
// fordify Feature-Gates
// Setzt voraus: fordifyAuth aus auth.js, trackEvent aus config.js

function requiresPaid(featureName) {
  if (typeof fordifyAuth !== 'undefined' && fordifyAuth.hasSubscription) return false;
  _zeigeUpgradeModal(featureName, 'pro');
  trackEvent('upgrade-modal-' + featureName);
  return true;
}

function requiresBusiness(featureName) {
  if (typeof fordifyAuth !== 'undefined' && fordifyAuth.plan === 'business') return false;
  _zeigeUpgradeModal(featureName, 'business');
  trackEvent('upgrade-modal-business-' + featureName);
  return true;
}

// Rückwärtskompatibel – intern auf _zeigeUpgradeModal delegieren
function zeigeUpgradeModal(featureName) {
  _zeigeUpgradeModal(featureName, 'pro');
}

function _zeigeUpgradeModal(featureName, plan) {
  const featureLabels = {
    'excel':                'CSV & JSON-Export',
    'json':                 'JSON-Export',
    'json-import':          'JSON-Import',
    'einstellungen':        'Profil dauerhaft speichern',
    'schuldner-adressbuch': 'Schuldner-Adressbuch',
    'mandanten-adressbuch': 'Mandanten-Adressbuch',
    'csv-import':           'CSV-Import',
  };
  const label = featureLabels[featureName] || featureName;
  const isBusiness = plan === 'business';

  const featureEl = document.getElementById('upgrade-modal-feature');
  if (featureEl) featureEl.textContent = label;

  const titleEl = document.getElementById('upgradeModalLabel');
  if (titleEl) titleEl.textContent = isBusiness ? 'Business-Funktion' : 'Pro-Funktion';

  const descEl = document.getElementById('upgrade-modal-desc');
  if (descEl) descEl.textContent = isBusiness
    ? 'Diese Funktion ist ab dem Business-Plan verfügbar.'
    : 'Diese Funktion ist ab dem Pro-Plan verfügbar.';

  const ctaEl = document.getElementById('upgrade-modal-cta');
  if (ctaEl) {
    ctaEl.textContent = isBusiness ? 'Business abonnieren →' : 'Pro abonnieren →';
    ctaEl.href = '/preise';
  }

  const modal = new bootstrap.Modal(document.getElementById('upgradeModal'));
  modal.show();
}
```

- [ ] **Step 2: Upgrade-Modal in forderungsaufstellung.html – IDs ergänzen**

In `frontend/forderungsaufstellung.html` den Block (ca. Zeile 675) suchen und anpassen.

Von:
```html
        <p class="fw-semibold mb-1"><span id="upgrade-modal-feature"></span></p>
        <p class="text-muted small mb-4">Diese Funktion ist ab dem Pro-Plan verfügbar.</p>
        <a href="/preise" class="btn btn-primary">Pro abonnieren →</a>
```

Zu:
```html
        <p class="fw-semibold mb-1"><span id="upgrade-modal-feature"></span></p>
        <p class="text-muted small mb-4" id="upgrade-modal-desc">Diese Funktion ist ab dem Pro-Plan verfügbar.</p>
        <a href="/preise" class="btn btn-primary" id="upgrade-modal-cta">Pro abonnieren →</a>
```

- [ ] **Step 3: Manuell testen**

1. `forderungsaufstellung.html` im Browser öffnen (als Free-User oder ausgeloggt)
2. Excel-Export-Button klicken → Modal erscheint mit Titel "Pro-Funktion" und CTA "Pro abonnieren →"
3. In Browser-Konsole ausführen: `_zeigeUpgradeModal('csv-import', 'business')` → Modal zeigt "Business-Funktion", Text "ab dem Business-Plan", CTA "Business abonnieren →"

- [ ] **Step 4: Commit**

```bash
git add frontend/js/gates.js frontend/forderungsaufstellung.html
git commit -m "feat: requiresBusiness() Gate + Upgrade-Modal plan-aware (Pro/Business)"
```

---

## Task 2: Supabase Schema – contacts Tabelle erweitern + RLS

**Files:**
- Modify: `supabase/schema.sql`
- Ausführen: Supabase Dashboard → SQL Editor

- [ ] **Step 1: schema.sql – contacts-Block ersetzen**

In `supabase/schema.sql` den gesamten contacts-Block (ca. Zeile 43–51) ersetzen:

Von:
```sql
-- Kontakte / Schuldner-Adressbuch (Business-Tier)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strasse TEXT, plz TEXT, ort TEXT,
  email TEXT, telefon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Zu:
```sql
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
```

- [ ] **Step 2: Migration im Supabase Dashboard ausführen**

Im Supabase Dashboard → SQL Editor → New Query, folgendes SQL ausführen:

```sql
-- contacts: type-Spalte hinzufügen (idempotent)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'schuldner'
  CHECK (type IN ('schuldner', 'mandant'));

-- RLS aktivieren und Policy setzen
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts: eigene Zeilen" ON contacts;
CREATE POLICY "contacts: eigene Zeilen"
  ON contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 3: Verifizieren**

Im Supabase Dashboard → Table Editor → contacts:
- Spalte `type` sichtbar mit DEFAULT `schuldner`
- Bei Authentication → Policies: Policy "contacts: eigene Zeilen" für contacts vorhanden

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: contacts-Tabelle – type-Spalte + RLS-Policy"
```

---

## Task 3: contacts.js – Globaler Cache + Supabase CRUD

**Files:**
- Create: `frontend/js/contacts.js`
- Modify: `frontend/sw.js` (ASSETS-Eintrag, KEIN Version-Bump noch)

- [ ] **Step 1: contacts.js erstellen**

Neue Datei `frontend/js/contacts.js`:

```javascript
// fordify Contacts – Schuldner- und Mandanten-Adressbuch
// Setzt voraus: supabaseClient aus auth.js, fordifyAuth aus auth.js

const fordifyContacts = {
  schuldner: [],
  mandanten: []
};

async function ladeKontakte() {
  if (!supabaseClient || !fordifyAuth.user || !fordifyAuth.hasSubscription) return;
  const { data, error } = await supabaseClient
    .from('contacts')
    .select('id, type, name, strasse, plz, ort, email, telefon')
    .eq('user_id', fordifyAuth.user.id)
    .order('name');
  if (error) { console.warn('Kontakte laden fehlgeschlagen:', error.message); return; }
  fordifyContacts.schuldner = (data || []).filter(c => c.type === 'schuldner');
  fordifyContacts.mandanten = (data || []).filter(c => c.type === 'mandant');
  _aktualisiereKontaktAutocomplete();
}

async function speichereKontakt(type, kontakt) {
  if (!supabaseClient || !fordifyAuth.user) return null;
  const { data, error } = await supabaseClient
    .from('contacts')
    .insert({ type, user_id: fordifyAuth.user.id, ...kontakt })
    .select('id, type, name, strasse, plz, ort, email, telefon')
    .single();
  if (error) { console.warn('Kontakt speichern fehlgeschlagen:', error.message); return null; }
  await ladeKontakte();
  return data;
}

async function loescheKontakt(id) {
  if (!supabaseClient || !fordifyAuth.user) return;
  const { error } = await supabaseClient
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', fordifyAuth.user.id);
  if (error) console.warn('Kontakt löschen fehlgeschlagen:', error.message);
  await ladeKontakte();
}

function _aktualisiereKontaktAutocomplete() {
  const schuldnerList = document.getElementById('schuldner-datalist');
  if (schuldnerList) {
    schuldnerList.innerHTML = fordifyContacts.schuldner
      .map(c => `<option value="${_escKontakt(c.name)}">`)
      .join('');
  }
  if (fordifyAuth.plan === 'business') {
    const mandantenList = document.getElementById('mandanten-datalist');
    if (mandantenList) {
      mandantenList.innerHTML = fordifyContacts.mandanten
        .map(c => `<option value="${_escKontakt(c.name)}">`)
        .join('');
    }
  }
}

function _escKontakt(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

- [ ] **Step 2: contacts.js zu sw.js ASSETS hinzufügen**

In `frontend/sw.js`, in der ASSETS-Liste nach `"/js/gates.js"` eintragen:
```javascript
  "/js/contacts.js",
```

Version NOCH NICHT bumpen — das kommt im letzten Task.

- [ ] **Step 3: Commit**

```bash
git add frontend/js/contacts.js frontend/sw.js
git commit -m "feat: contacts.js – In-Memory-Cache + Supabase CRUD"
```

---

## Task 4: auth.js + konto.js – Kontakte nach Login laden

**Files:**
- Modify: `frontend/js/auth.js`
- Modify: `frontend/js/konto.js`

- [ ] **Step 1: auth.js – ladeKontakte() in SIGNED_IN-Handler**

In `auth.js` im `SIGNED_IN`-Block (nach `await ladeSubscriptionStatus()`, vor `migrateSessionToCloud`):

```javascript
  if (event === 'SIGNED_IN') {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    aktualisiereUIFuerAuth();
    await ladeSubscriptionStatus();
    await ladeKontakte();            // ← NEU
    await migrateSessionToCloud();
    StorageBackend.init(fordifyAuth);
    await ladeCloudDaten();
    aktualisiereUIFuerAuth();
    checkAutoCheckout();
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (modal) modal.hide();
    trackEvent('login');
  }
```

- [ ] **Step 2: auth.js – ladeKontakte() in INITIAL_SESSION-Handler**

Im `INITIAL_SESSION`-Block (nach `await ladeSubscriptionStatus()`):

```javascript
  if (event === 'INITIAL_SESSION' && session) {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    aktualisiereUIFuerAuth();
    await ladeSubscriptionStatus();
    await ladeKontakte();            // ← NEU
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
    checkAutoCheckout();
    if (fordifyAuth.hasSubscription && typeof laden === 'function') laden();
  }
```

- [ ] **Step 3: konto.js – ladeKontakte() nach _pruefeAbo()**

Im DOMContentLoaded-Handler in `konto.js`, nach `await _pruefeAbo(...)` und der Redirect-Prüfung:

```javascript
    await _pruefeAbo(session.user.id, session.access_token);
    if (!fordifyAuth.hasSubscription) {
      window.location.href = '/preise';
      return;
    }
    await ladeKontakte();    // ← NEU
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
    // ... rest unverändert
```

- [ ] **Step 4: Commit**

```bash
git add frontend/js/auth.js frontend/js/konto.js
git commit -m "feat: ladeKontakte() nach Login (auth.js + konto.js)"
```

---

## Task 5: forderungsaufstellung.html – contacts.js + Autocomplete-Datalists

**Files:**
- Modify: `frontend/forderungsaufstellung.html`

- [ ] **Step 1: contacts.js Script-Tag einbinden**

In `forderungsaufstellung.html` die Script-Includes finden (vor `</body>`). `contacts.js` muss VOR `auth.js` stehen, da `auth.js` `ladeKontakte()` aufruft.

Den Tag einfügen direkt vor `<script src="/js/auth.js">`:
```html
<script src="/js/contacts.js"></script>
```

- [ ] **Step 2: Datalist für Schuldner-Autocomplete**

In `forderungsaufstellung.html`, beim Feld `inp-gegner` (ca. Zeile 132):

Von:
```html
              <input type="text" class="form-control" id="inp-gegner" placeholder="Name der Schuldnerin / des Schuldners">
```

Zu:
```html
              <input type="text" class="form-control" id="inp-gegner"
                     placeholder="Name der Schuldnerin / des Schuldners"
                     list="schuldner-datalist" autocomplete="off">
              <datalist id="schuldner-datalist"></datalist>
```

- [ ] **Step 3: Datalist für Gläubiger-Autocomplete (Business)**

Beim Feld `inp-mandant` (ca. Zeile 129):

Von:
```html
              <input type="text" class="form-control" id="inp-mandant" placeholder="Name der Gläubigerin / des Gläubigers">
```

Zu:
```html
              <input type="text" class="form-control" id="inp-mandant"
                     placeholder="Name der Gläubigerin / des Gläubigers"
                     list="mandanten-datalist" autocomplete="off">
              <datalist id="mandanten-datalist"></datalist>
```

- [ ] **Step 4: Manuell testen**

1. Als Pro-User einloggen und `forderungsaufstellung.html` öffnen
2. Im Schuldner-Feld tippen: Browser zeigt Vorschläge aus gespeicherten Schuldnern (aktuell noch leer — wird nach Task 7 getestet)
3. Browser-Konsole: `fordifyContacts.schuldner` → Array (leer oder mit vorhandenen Kontakten)

- [ ] **Step 5: Commit**

```bash
git add frontend/forderungsaufstellung.html
git commit -m "feat: Autocomplete-Datalists für Schuldner + Gläubiger in Forderungsaufstellung"
```

---

## Task 6: konto.html – Adressbuch-Tab HTML + contacts.js einbinden

**Files:**
- Modify: `frontend/konto.html`

- [ ] **Step 1: contacts.js in konto.html einbinden**

In `konto.html` vor dem `konto.js`-Script-Tag einzufügen:
```html
<script src="/js/contacts.js"></script>
```

- [ ] **Step 2: "Adressen"-Tab-Button hinzufügen**

Die bestehenden Tab-Buttons finden (z.B. `<button class="konto-tab" data-tab="firmendaten"...>`). Dahinter einfügen:
```html
<button class="konto-tab" data-tab="adressen" role="tab" aria-selected="false">Adressen</button>
```

- [ ] **Step 3: "Adressen"-Tab-Panel einfügen**

Nach dem bestehenden `<div id="tab-firmendaten">` Panel einfügen:

```html
<div class="konto-tab-panel d-none" id="tab-adressen">

  <!-- Schuldner-Adressbuch (Pro+) -->
  <div class="content-card mb-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h3 class="h6 mb-0 fw-semibold">Schuldner-Adressbuch</h3>
      <button class="btn btn-sm btn-primary" onclick="kontoAdressbuchFormToggle('schuldner')">+ Neu</button>
    </div>

    <div class="d-none mb-4 p-3 border rounded bg-light" id="schuldner-form-wrap">
      <div class="row g-2">
        <div class="col-12">
          <input type="text" class="form-control form-control-sm" id="schuldner-inp-name" placeholder="Name *">
        </div>
        <div class="col-12">
          <input type="text" class="form-control form-control-sm" id="schuldner-inp-strasse" placeholder="Straße">
        </div>
        <div class="col-4">
          <input type="text" class="form-control form-control-sm" id="schuldner-inp-plz" placeholder="PLZ">
        </div>
        <div class="col-8">
          <input type="text" class="form-control form-control-sm" id="schuldner-inp-ort" placeholder="Ort">
        </div>
        <div class="col-sm-6">
          <input type="email" class="form-control form-control-sm" id="schuldner-inp-email" placeholder="E-Mail">
        </div>
        <div class="col-sm-6">
          <input type="tel" class="form-control form-control-sm" id="schuldner-inp-telefon" placeholder="Telefon">
        </div>
      </div>
      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-sm btn-primary" onclick="kontoKontaktSpeichern('schuldner')">Speichern</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="kontoAdressbuchFormToggle('schuldner')">Abbrechen</button>
      </div>
    </div>

    <div id="schuldner-liste"></div>
  </div>

  <!-- Mandanten-Adressbuch (Business only) -->
  <div class="content-card">
    <div class="d-flex align-items-center justify-content-between mb-1">
      <div>
        <h3 class="h6 mb-0 fw-semibold">Mandanten-Adressbuch</h3>
        <p class="text-muted small mb-0">Gläubiger-Profile für verschiedene Mandanten speichern</p>
      </div>
      <button class="btn btn-sm btn-primary" id="mandant-neu-btn"
              onclick="kontoAdressbuchFormToggle('mandant')">+ Neu</button>
    </div>

    <!-- Business-Gate (sichtbar wenn NICHT Business) -->
    <div class="d-none mt-3" id="mandanten-gate-hinweis">
      <div class="alert alert-light border text-center py-4 mb-0">
        <p class="mb-2 fw-semibold">Business-Funktion</p>
        <p class="text-muted small mb-3">Das Mandanten-Adressbuch ist ab dem Business-Plan verfügbar.</p>
        <a href="/preise" class="btn btn-sm btn-primary">Business abonnieren →</a>
      </div>
    </div>

    <div class="d-none mb-4 mt-3 p-3 border rounded bg-light" id="mandant-form-wrap">
      <div class="row g-2">
        <div class="col-12">
          <input type="text" class="form-control form-control-sm" id="mandant-inp-name" placeholder="Name *">
        </div>
        <div class="col-12">
          <input type="text" class="form-control form-control-sm" id="mandant-inp-strasse" placeholder="Straße">
        </div>
        <div class="col-4">
          <input type="text" class="form-control form-control-sm" id="mandant-inp-plz" placeholder="PLZ">
        </div>
        <div class="col-8">
          <input type="text" class="form-control form-control-sm" id="mandant-inp-ort" placeholder="Ort">
        </div>
        <div class="col-sm-6">
          <input type="email" class="form-control form-control-sm" id="mandant-inp-email" placeholder="E-Mail">
        </div>
        <div class="col-sm-6">
          <input type="tel" class="form-control form-control-sm" id="mandant-inp-telefon" placeholder="Telefon">
        </div>
      </div>
      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-sm btn-primary" onclick="kontoKontaktSpeichern('mandant')">Speichern</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="kontoAdressbuchFormToggle('mandant')">Abbrechen</button>
      </div>
    </div>

    <div id="mandanten-liste"></div>
  </div>

</div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/konto.html
git commit -m "feat: Adressbuch-Tab HTML in konto.html"
```

---

## Task 7: konto.js – Tab-Routing + Adressbuch CRUD

**Files:**
- Modify: `frontend/js/konto.js`

- [ ] **Step 1: Tab-Routing erweitern**

In `_kontoActivateTabFromUrl()` (Zeile ~170) – `'adressen'` in die gültige Tab-Liste aufnehmen:

```javascript
function _kontoActivateTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && ['faelle', 'firmendaten', 'abo', 'adressen'].includes(tab)) {
    _kontoZeigeTab(tab);
  }
}
```

In `_kontoRendererFuerTab()` (Zeile ~187):

```javascript
function _kontoRendererFuerTab(name) {
  if (name === 'faelle')      kontoRendereFaelleTab();
  if (name === 'firmendaten') kontoRendereFirmendatenTab();
  if (name === 'abo')         kontoRendereAboTab();
  if (name === 'adressen')    kontoRendereAdressbuchTab();
}
```

- [ ] **Step 2: Adressbuch-Render + CRUD-Funktionen am Ende von konto.js einfügen**

```javascript
// ---- Tab: Adressen ----

function kontoRendereAdressbuchTab() {
  _kontoRendereKontaktListe('schuldner');

  const isBusiness = fordifyAuth.plan === 'business';
  const gateEl  = document.getElementById('mandanten-gate-hinweis');
  const neuBtn  = document.getElementById('mandant-neu-btn');
  const formEl  = document.getElementById('mandant-form-wrap');

  if (gateEl)  gateEl.classList.toggle('d-none', isBusiness);
  if (neuBtn)  neuBtn.style.display = isBusiness ? '' : 'none';
  if (formEl && !isBusiness) formEl.classList.add('d-none');

  if (isBusiness) _kontoRendereKontaktListe('mandant');
}

function _kontoRendereKontaktListe(type) {
  const listeEl = document.getElementById(type === 'schuldner' ? 'schuldner-liste' : 'mandanten-liste');
  if (!listeEl) return;
  const eintraege = fordifyContacts[type === 'schuldner' ? 'schuldner' : 'mandanten'];

  if (eintraege.length === 0) {
    listeEl.innerHTML = '<p class="text-muted small mt-3 mb-0">Noch keine Einträge vorhanden.</p>';
    return;
  }

  listeEl.innerHTML = `
    <div class="list-group list-group-flush mt-3">
      ${eintraege.map(k => {
        const adresse = [k.strasse, k.plz && k.ort ? k.plz + ' ' + k.ort : (k.plz || k.ort)].filter(Boolean);
        return `<div class="list-group-item px-0 d-flex align-items-start justify-content-between gap-2">
          <div>
            <div class="fw-medium">${_escHtml(k.name)}</div>
            ${adresse.length ? `<div class="text-muted small">${adresse.map(_escHtml).join(', ')}</div>` : ''}
            ${k.email ? `<div class="text-muted small">${_escHtml(k.email)}</div>` : ''}
            ${k.telefon ? `<div class="text-muted small">${_escHtml(k.telefon)}</div>` : ''}
          </div>
          <button class="btn btn-sm flex-shrink-0" style="background:#fef2f2;color:#ef4444;border:none;"
                  onclick="kontoKontaktLoeschen('${_escHtml(k.id)}')">Löschen</button>
        </div>`;
      }).join('')}
    </div>`;
}

function kontoAdressbuchFormToggle(type) {
  const el = document.getElementById(type + '-form-wrap');
  if (!el) return;
  el.classList.toggle('d-none');
  if (!el.classList.contains('d-none')) {
    const first = el.querySelector('input');
    if (first) first.focus();
  }
}

function kontoKontaktSpeichern(type) {
  const name = (document.getElementById(type + '-inp-name')?.value || '').trim();
  if (!name) { alert('Name ist erforderlich.'); return; }

  const kontakt = {
    name,
    strasse: (document.getElementById(type + '-inp-strasse')?.value || '').trim() || null,
    plz:     (document.getElementById(type + '-inp-plz')?.value || '').trim() || null,
    ort:     (document.getElementById(type + '-inp-ort')?.value || '').trim() || null,
    email:   (document.getElementById(type + '-inp-email')?.value || '').trim() || null,
    telefon: (document.getElementById(type + '-inp-telefon')?.value || '').trim() || null,
  };

  speichereKontakt(type, kontakt).then(result => {
    if (!result) { alert('Speichern fehlgeschlagen. Bitte erneut versuchen.'); return; }
    ['name', 'strasse', 'plz', 'ort', 'email', 'telefon'].forEach(f => {
      const el = document.getElementById(type + '-inp-' + f);
      if (el) el.value = '';
    });
    document.getElementById(type + '-form-wrap')?.classList.add('d-none');
    kontoRendereAdressbuchTab();
  });
}

async function kontoKontaktLoeschen(id) {
  if (!confirm('Diesen Eintrag wirklich löschen?')) return;
  await loescheKontakt(id);
  kontoRendereAdressbuchTab();
}
```

- [ ] **Step 3: Manuell testen (vollständiger E2E-Test)**

**Als Pro-User:**
1. `konto.html` öffnen → "Adressen"-Tab klicken
2. Schuldner-Adressbuch: "+ Neu" → Formular öffnet sich
3. Name "Max Mustermann", Straße "Musterstr. 1", PLZ "12345", Ort "Berlin" eingeben → "Speichern"
4. Eintrag erscheint in der Liste mit Name und Adresse
5. Mandanten-Adressbuch: Gate-Hinweis sichtbar, "+ Neu" nicht sichtbar
6. `forderungsaufstellung.html` öffnen → Im Schuldner-Feld tippen "Max" → Browser-Vorschlag "Max Mustermann" erscheint
7. Vorschlag auswählen → Feld füllt sich mit "Max Mustermann"
8. Zurück zu konto.html → Schuldner löschen → Bestätigung → Eintrag weg

**Als Business-User:**
1. Beide Sektionen im "Adressen"-Tab vollständig bedienbar (kein Gate-Hinweis)
2. Mandanten-Eintrag anlegen → erscheint in Liste
3. In forderungsaufstellung.html: Im Gläubiger-Feld "Mandant" tippen → Vorschlag aus Mandanten-Liste

- [ ] **Step 4: Commit**

```bash
git add frontend/js/konto.js
git commit -m "feat: Adressbuch-Tab – Routing + CRUD in konto.js"
```

---

## Task 8: Preisseite + sw.js + CLAUDE.md finalisieren

**Files:**
- Modify: `frontend/preise.html`
- Modify: `frontend/sw.js`
- Modify: `CLAUDE.md`

- [ ] **Step 1: "Excel / CSV-Export" → "CSV & JSON-Export" in preise.html**

In `frontend/preise.html` suchen nach `"Excel / CSV-Export"`:
```bash
grep -n "Excel" frontend/preise.html
```

Alle Treffer ändern: `Excel / CSV-Export` → `CSV & JSON-Export`

Betrifft: Pro-Card Feature-Liste (Zeile ~121) und Vergleichstabelle (Zeile ~175).

- [ ] **Step 2: Mandanten-Adressbuch-Zeile in Vergleichstabelle einfügen**

In der Vergleichstabelle nach der Zeile mit "Schuldner-Adressbuch":
```html
        <tr><td>Mandanten-Adressbuch</td><td class="cross">–</td><td class="cross col-pro">–</td><td class="check">✓</td></tr>
```

(Die Schuldner-Adressbuch-Zeile hat `✓` für Pro und Business — Mandanten-Adressbuch hat `–` für Free und Pro, `✓` für Business.)

- [ ] **Step 3: sw.js Version bumpen**

In `frontend/sw.js` aktuelle Version prüfen:
```bash
grep "fordify-v" frontend/sw.js
```

Beide Versionen um 1 erhöhen (z.B. von `staging-v70` / `v116` auf `staging-v71` / `v117`):
```javascript
const CACHE = IS_STAGING_SW ? "fordify-staging-v71" : "fordify-v117";
```

- [ ] **Step 4: CLAUDE.md – SW-Version und Feature-Status aktualisieren**

In `CLAUDE.md`:
- SW-Version-Kommentar in der Dateistruktur-Tabelle auf aktuellen Stand bringen
- Feature-Status für Adressbücher falls relevant im Freemium-Plan ergänzen

- [ ] **Step 5: Alles committen und pushen**

```bash
git add frontend/preise.html frontend/sw.js CLAUDE.md
git commit -m "feat: Adressbücher vollständig – Preisseite, Mandanten-Zeile, SW-Version"
git push origin staging
git push origin main
```

---

## Self-Review

**Spec Coverage:**
- ✅ `requiresBusiness()` Gate — Task 1
- ✅ Upgrade-Modal zeigt "Pro-Funktion" vs "Business-Funktion" dynamisch — Task 1
- ✅ contacts Tabelle: `type`-Spalte + RLS-Policy — Task 2
- ✅ contacts.js: globaler Cache + Supabase CRUD — Task 3
- ✅ Kontakte nach Login geladen (auth.js SIGNED_IN + INITIAL_SESSION) — Task 4
- ✅ Kontakte nach konto.html-Init geladen (konto.js) — Task 4
- ✅ Autocomplete Schuldner (Pro) + Gläubiger (Business) in forderungsaufstellung.html — Task 5
- ✅ contacts.js in forderungsaufstellung.html eingebunden — Task 5
- ✅ contacts.js in konto.html eingebunden — Task 6
- ✅ Schuldner-Adressbuch CRUD-UI (Pro) — Tasks 6 + 7
- ✅ Mandanten-Adressbuch CRUD-UI (Business), Gate-Hinweis für Pro-User — Tasks 6 + 7
- ✅ Tab-Routing für "adressen" — Task 7
- ✅ "Excel / CSV-Export" → "CSV & JSON-Export" — Task 8
- ✅ Mandanten-Adressbuch-Zeile in Vergleichstabelle — Task 8
- ✅ sw.js ASSETS + Version-Bump — Tasks 3 + 8

**Placeholder Scan:** Keine "TBD" oder "TODO". Alle Schritte enthalten vollständigen Code.

**Type Consistency:**
- `type`: durchgängig `'schuldner'` | `'mandant'` (string literal, nie `'mandanten'`)
- `fordifyContacts.schuldner` / `fordifyContacts.mandanten` (Array): konsistent in contacts.js + konto.js
- `speichereKontakt(type, kontakt)` / `loescheKontakt(id)` / `ladeKontakte()`: konsistente Signaturen in contacts.js und allen Aufrufern
- `kontoKontaktSpeichern(type)` / `kontoKontaktLoeschen(id)` / `kontoAdressbuchFormToggle(type)`: konsistente Benennung in konto.js und HTML `onclick`-Attributen
- `_escHtml()` (aus konto.js) vs `_escKontakt()` (aus contacts.js): unterschiedliche Namen wegen unterschiedlicher Scope — konto.js läuft nur auf konto.html, contacts.js auf beiden Seiten
