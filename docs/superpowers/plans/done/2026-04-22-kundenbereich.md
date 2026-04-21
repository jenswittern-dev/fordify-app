# Kundenbereich (konto.html) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Neue Seite `konto.html` mit Tabs Fälle / Firmendaten / Abo für eingeloggte Nutzer (Pro/Business); App-Navbar vereinfacht für Gäste und eingeloggte Nutzer getrennt.

**Architecture:** `konto.html` folgt dem Layout der bestehenden Unterseiten (Standard-Navbar, blauer Hero, Bootstrap-Container). `konto.js` enthält alle seitenspezifische Logik. Auth-Check per `supabaseClient.auth.getSession()` beim Laden — nicht authentifizierte Nutzer werden zu `/forderungsaufstellung` weitergeleitet. Der Firmendaten-Tab übernimmt die Logik des bisherigen Einstellungen-Modals direkt.

**Tech Stack:** Vanilla JS, Bootstrap 5.3, Supabase JS SDK (bereits geladen via CDN), `StorageBackend` (storage.js), `fordifyAuth` (auth.js), `aktualisiereUIFuerAuth` (auth-ui.js)

---

## Dateiübersicht

| Datei | Aktion | Verantwortung |
|---|---|---|
| `frontend/forderungsaufstellung.html` | Modify | Nav-Buttons anpassen, Avatar-Dropdown erweitern |
| `frontend/konto.html` | Create | Seitenstruktur: Navbar, Hero, Tabs, Content-Gerüst |
| `frontend/js/konto.js` | Create | Tab-Switching, Fälle-Liste, Firmendaten-Formular, Abo-Anzeige, Auth-Guard |
| `frontend/sw.js` | Modify | konto.html + konto.js zu ASSETS hinzufügen, Version erhöhen |

---

## Task 1: Nav-Änderungen in forderungsaufstellung.html

**Files:**
- Modify: `frontend/forderungsaufstellung.html` (Zeilen ~51–77)

### Kontext

Die Navbar in `forderungsaufstellung.html` hat aktuell (Zeile ~51–78):

```html
<div class="navbar-nav-buttons">
  <a href="/" class="btn btn-sm btn-outline-light">← Website</a>
  <button class="btn btn-sm btn-outline-light" onclick="zeigeFallModal()">Fälle</button>
  <button class="btn btn-sm btn-outline-light" onclick="zeigeEinstellungenModal()">Einstellungen</button>
  <button class="btn btn-sm btn-outline-light" onclick="fallZuruecksetzen()">Neu</button>
  <button class="btn btn-sm btn-nav-primary" onclick="drucken()">Drucken / PDF</button>
  <button class="btn btn-sm btn-nav-ghost" data-auth-show="guest"
          data-bs-toggle="modal" data-bs-target="#loginModal">Anmelden</button>
  <div class="dropdown d-none" data-auth-show="user">
    <button class="nav-avatar dropdown-toggle" ...>
      <span class="nav-avatar-initials">?</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end nav-account-dropdown">
      <li><div class="dropdown-header-info">
        <div class="nav-user-email-display dropdown-email"></div>
        <div class="nav-plan-badge"></div>
      </div></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="/preise">Pläne &amp; Preise</a></li>
      <li><a class="dropdown-item" href="#"
             onclick="openCustomerPortal(); return false;">
        Abo verwalten ↗</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item text-danger" href="#"
             onclick="logout(); return false;">Abmelden</a></li>
    </ul>
  </div>
</div>
```

`data-auth-show="guest"` → nur sichtbar wenn NICHT eingeloggt (auth-ui.js setzt `d-none` wenn eingeloggt).  
`data-auth-show="user"` → nur sichtbar wenn eingeloggt.

- [ ] **Schritt 1: „Fälle"-Button entfernen**

Lösche diese Zeile komplett:
```html
<button class="btn btn-sm btn-outline-light" onclick="zeigeFallModal()">Fälle</button>
```

- [ ] **Schritt 2: „Einstellungen" → „Firmendaten", nur für Gäste sichtbar**

Ersetze:
```html
<button class="btn btn-sm btn-outline-light" onclick="zeigeEinstellungenModal()">Einstellungen</button>
```
durch:
```html
<button class="btn btn-sm btn-outline-light" data-auth-show="guest" onclick="zeigeEinstellungenModal()">Firmendaten</button>
```

- [ ] **Schritt 3: „Mein Konto →" als ersten Eintrag in Avatar-Dropdown einfügen**

Ersetze im Avatar-Dropdown den Block nach dem ersten `<hr>`:
```html
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="/preise">Pläne &amp; Preise</a></li>
```
durch:
```html
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item fw-semibold" href="/konto">Mein Konto →</a></li>
      <li><a class="dropdown-item" href="/preise">Pläne &amp; Preise</a></li>
```

- [ ] **Schritt 4: Manuell testen**

  - Browser öffnen → `forderungsaufstellung.html` (nicht eingeloggt): Nav zeigt `Firmendaten`-Button, kein `Fälle`-Button, `Anmelden`-Button sichtbar
  - Als Pro-Nutzer einloggen: `Firmendaten`-Button verschwindet, Avatar-Dropdown zeigt „Mein Konto →" als ersten Link

- [ ] **Schritt 5: Commit**

```bash
git add frontend/forderungsaufstellung.html
git commit -m "feat: Nav vereinfacht – Fälle entfernt, Einstellungen→Firmendaten, Mein Konto Link"
```

---

## Task 2: konto.html – Seitenstruktur

**Files:**
- Create: `frontend/konto.html`

### Kontext

Orientiert sich an `frontend/zinsrechner.html`. Volle Seitenbreite für Hero-Band und Tab-Leiste; Inhalt im Bootstrap-Container. Skripte laden in dieser Reihenfolge: `config.js` → `supabase-js` (CDN) → `auth.js` → `auth-ui.js` → `storage.js` → `konto.js`.

Kopiere den `<head>` und `<nav>` aus `zinsrechner.html` als Basis und passe title/meta/scripts an.

- [ ] **Schritt 1: konto.html anlegen**

Erstelle `frontend/konto.html` mit folgendem Inhalt:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mein Konto | fordify</title>
  <meta name="theme-color" content="#1e3a8a">
  <link rel="icon" type="image/svg+xml" href="img/logo.svg">
  <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" href="css/rechner.css">
</head>
<body>

<!-- Navbar (identisch mit Unterseiten) -->
<nav class="navbar navbar-expand-md navbar-dark" style="background:#1e3a8a;">
  <div class="container-fluid px-3">
    <a class="navbar-brand" href="/" title="fordify – Startseite">ford<span class="logo-ify">ify</span></a>
    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#navbar-menu-konto"
            aria-controls="navbar-menu-konto" aria-expanded="false" aria-label="Navigation öffnen">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbar-menu-konto">
      <ul class="navbar-nav mx-auto gap-1">
        <li class="nav-item"><a class="nav-link" href="/">Startseite</a></li>
        <li class="nav-item"><a class="nav-link" href="/forderungsaufstellung">Forderungsaufstellung</a></li>
        <li class="nav-item"><a class="nav-link" href="/zinsrechner">Zinsrechner</a></li>
        <li class="nav-item"><a class="nav-link" href="/rvg-rechner">RVG-Rechner</a></li>
        <li class="nav-item"><a class="nav-link" href="/gerichtskostenrechner">GKG-Rechner</a></li>
        <li class="nav-item"><a class="nav-link" href="/preise">Preise</a></li>
      </ul>
      <div class="d-flex align-items-center gap-2">
        <div class="dropdown d-none" data-auth-show="user">
          <button class="nav-avatar dropdown-toggle" data-bs-toggle="dropdown"
                  aria-expanded="false" title="Mein Konto" aria-label="Konto-Menü">
            <span class="nav-avatar-initials">?</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end nav-account-dropdown">
            <li><div class="dropdown-header-info">
              <div class="nav-user-email-display dropdown-email"></div>
              <div class="nav-plan-badge"></div>
            </div></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item fw-semibold" href="/konto">Mein Konto →</a></li>
            <li><a class="dropdown-item" href="/preise">Pläne &amp; Preise</a></li>
            <li><a class="dropdown-item" href="#"
                   onclick="openCustomerPortal(); return false;">Abo verwalten ↗</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#"
                   onclick="logout(); return false;">Abmelden</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</nav>

<main id="main-content">

  <!-- Lade-Overlay (sichtbar bis Auth-Check abgeschlossen) -->
  <div id="konto-loading" style="min-height:60vh;display:flex;align-items:center;justify-content:center;">
    <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lädt…</span></div>
  </div>

  <!-- Seiteninhalt (initial versteckt) -->
  <div id="konto-content" class="d-none">

    <!-- Hero Band -->
    <div class="rechner-hero-band" style="padding:1.25rem 0 1.5rem;">
      <div class="container">
        <nav aria-label="Breadcrumb" class="fordify-breadcrumb" style="margin-bottom:0.5rem;">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/" style="color:rgba(255,255,255,.6);">fordify</a></li>
            <li class="breadcrumb-item active" aria-current="page">Mein Konto</li>
          </ol>
        </nav>
        <div style="display:flex;align-items:center;gap:1rem;">
          <div id="konto-hero-avatar"
               style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);
                      border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;
                      justify-content:center;font-size:1rem;font-weight:700;color:white;flex-shrink:0;">?</div>
          <div>
            <h1 style="font-size:1.2rem;font-weight:800;margin:0 0 0.2rem;color:white;">Mein Konto</h1>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span id="konto-hero-email" style="font-size:0.82rem;color:rgba(255,255,255,.7);"></span>
              <span id="konto-hero-badge" class="plan-badge"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab-Leiste (volle Breite) -->
    <div style="background:white;border-bottom:1px solid #e2e8f0;">
      <div class="container">
        <div class="d-flex gap-0" id="konto-tabs" role="tablist">
          <button class="konto-tab active" data-tab="faelle" role="tab" aria-selected="true">Fälle</button>
          <button class="konto-tab" data-tab="firmendaten" role="tab" aria-selected="false">Firmendaten</button>
          <button class="konto-tab" data-tab="abo" role="tab" aria-selected="false">Abo</button>
        </div>
      </div>
    </div>

    <!-- Tab-Inhalt -->
    <div class="container py-4">

      <!-- Tab: Fälle -->
      <div id="tab-faelle" class="konto-tab-panel">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <span id="faelle-anzahl" class="text-muted small"></span>
          <div class="d-flex gap-2">
            <label class="btn btn-sm btn-outline-primary mb-0" role="button" tabindex="0"
                   onkeydown="if(event.key==='Enter'||event.key===' ')this.click()">
              Import JSON
              <input type="file" accept=".json" id="faelle-import-input" style="display:none"
                     onchange="kontoFallImportieren(this)">
            </label>
            <button class="btn btn-sm btn-outline-primary" onclick="kontoFaelleExportierenAlle()">Export alle</button>
            <button class="btn btn-sm btn-primary" onclick="kontoNeuenFallAnlegen()">+ Neuer Fall</button>
          </div>
        </div>
        <div id="faelle-liste"></div>
      </div>

      <!-- Tab: Firmendaten -->
      <div id="tab-firmendaten" class="konto-tab-panel d-none">
        <div class="row">
          <div class="col-lg-8">

            <!-- Logo -->
            <div class="content-card mb-3">
              <h6 class="fw-semibold mb-3">Kanzleilogo</h6>
              <div class="d-flex align-items-start gap-3 mb-2">
                <img id="konto-logo-vorschau" src="" alt="Logo-Vorschau"
                     style="max-height:60px;max-width:180px;object-fit:contain;display:none;border:1px solid #e2e8f0;border-radius:4px;padding:4px;">
                <div>
                  <label class="btn btn-sm btn-outline-primary mb-1" role="button">
                    Logo hochladen
                    <input type="file" accept="image/*" id="konto-logo-input" style="display:none"
                           onchange="kontoLogoBildLaden(this)">
                  </label>
                  <button class="btn btn-sm btn-outline-danger ms-1" onclick="kontoLogoEntfernen()">Entfernen</button>
                  <div class="text-muted" style="font-size:var(--text-xs);">PNG, JPG, SVG · empfohlen max. 400×100 px</div>
                </div>
              </div>
              <div class="mt-2">
                <label class="form-label small fw-semibold">Position im PDF</label>
                <select id="konto-logo-position" class="form-select form-select-sm" style="max-width:200px;">
                  <option value="links">Links</option>
                  <option value="mitte">Mitte</option>
                  <option value="rechts">Rechts</option>
                </select>
              </div>
            </div>

            <!-- Kanzleidaten -->
            <div class="content-card mb-3">
              <h6 class="fw-semibold mb-3">Kanzleidaten &amp; Impressum</h6>
              <div class="row g-2">
                <div class="col-12"><label class="form-label small">Kanzleiname / Rechtsanwalt</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-name" placeholder="Kanzlei Mustermann"></div>
                <div class="col-12"><label class="form-label small">Straße &amp; Hausnummer</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-strasse" placeholder="Musterstraße 1"></div>
                <div class="col-3"><label class="form-label small">PLZ</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-plz" placeholder="12345"></div>
                <div class="col-9"><label class="form-label small">Ort</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-ort" placeholder="Musterstadt"></div>
                <div class="col-6"><label class="form-label small">Telefon</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-tel" placeholder="+49 30 123456"></div>
                <div class="col-6"><label class="form-label small">Fax</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-fax"></div>
                <div class="col-6"><label class="form-label small">E-Mail</label><input type="email" class="form-control form-control-sm" id="konto-einst-imp-email"></div>
                <div class="col-6"><label class="form-label small">Website</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-website"></div>
                <div class="col-6"><label class="form-label small">Rechtsanwaltskammer</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-kammer"></div>
                <div class="col-6"><label class="form-label small">Handels-/Vereinsregister</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-register"></div>
                <div class="col-12"><label class="form-label small">Vertreten durch</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-vertreten"></div>
                <div class="col-6"><label class="form-label small">USt-IdNr.</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-ustid"></div>
                <div class="col-6"><label class="form-label small">Berufshaftpflichtversicherung</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-bhv"></div>
                <div class="col-6"><label class="form-label small">IBAN</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-iban"></div>
                <div class="col-3"><label class="form-label small">BIC</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-bic"></div>
                <div class="col-3"><label class="form-label small">Bank</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-bank"></div>
                <div class="col-6"><label class="form-label small">Impressum-URL</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-impressum-url"></div>
                <div class="col-6"><label class="form-label small">Datenschutz-URL</label><input type="text" class="form-control form-control-sm" id="konto-einst-imp-datenschutz-url"></div>
              </div>

              <!-- Vorschau -->
              <div class="mt-3 p-2 rounded" style="background:var(--color-surface);border:1px solid var(--color-border)">
                <p class="mb-1" style="font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Vorschau PDF-Footer</p>
                <div id="konto-imp-vorschau" style="font-size:var(--text-xs);color:var(--color-text-muted);">
                  <em>Vorschau erscheint hier…</em>
                </div>
              </div>
            </div>

            <!-- Theme -->
            <div class="content-card mb-3">
              <h6 class="fw-semibold mb-2">Design-Theme</h6>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-secondary" onclick="kontoThemeWechseln('brand')">Brand (Standard)</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="kontoThemeWechseln('dark')">Dark</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="kontoThemeWechseln('clean')">Clean</button>
              </div>
              <p class="text-muted mt-2 mb-0" style="font-size:var(--text-xs);">Das Theme wird sofort auf der Forderungsaufstellungs-Seite aktiv.</p>
            </div>

            <!-- Export/Import -->
            <div class="content-card mb-3">
              <h6 class="fw-semibold mb-2">Einstellungen sichern / übertragen</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" onclick="kontoEinstellungenExportieren()">Einstellungen exportieren</button>
                <label class="btn btn-sm btn-outline-secondary mb-0" role="button" tabindex="0"
                       onkeydown="if(event.key==='Enter'||event.key===' ')this.click()">
                  Einstellungen importieren
                  <input type="file" accept=".json" id="konto-einst-import-input" style="display:none"
                         onchange="kontoEinstellungenImportieren(this)">
                </label>
              </div>
            </div>

            <button class="btn btn-primary" onclick="kontoEinstellungenSpeichern()">Firmendaten speichern</button>
          </div>
        </div>
      </div>

      <!-- Tab: Abo -->
      <div id="tab-abo" class="konto-tab-panel d-none">
        <div class="row">
          <div class="col-lg-6">
            <div class="content-card">
              <h6 class="fw-semibold mb-3">Mein Abonnement</h6>
              <div class="mb-3">
                <div class="text-muted small mb-1">Aktueller Plan</div>
                <div id="konto-abo-plan-badge" class="plan-badge" style="font-size:1rem;padding:4px 12px;"></div>
              </div>
              <div class="mb-3" id="konto-abo-laufzeit-block">
                <div class="text-muted small mb-1">Aktiv bis</div>
                <div id="konto-abo-laufzeit" class="fw-semibold"></div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" onclick="openCustomerPortal()">Abo verwalten ↗</button>
                <a href="/preise" class="btn btn-outline-secondary">Pläne &amp; Preise ansehen</a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /container -->
  </div><!-- /konto-content -->

</main>

<style>
.konto-tab {
  padding: 0.7rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.konto-tab:hover { color: #1e3a8a; }
.konto-tab.active { color: #1e3a8a; font-weight: 600; border-bottom-color: #1e3a8a; }
</style>

<script src="js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="js/storage.js"></script>
<script src="js/auth.js"></script>
<script src="js/auth-ui.js"></script>
<script src="js/konto.js"></script>
<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

- [ ] **Schritt 2: Manuell prüfen (nur Struktur)**

Browser → `konto.html` direkt öffnen (ohne eingeloggt zu sein): Lade-Spinner sollte kurz erscheinen, dann Weiterleitung zu `/forderungsaufstellung`. (konto.js existiert noch nicht — das kommt in Task 3.)

- [ ] **Schritt 3: Commit**

```bash
git add frontend/konto.html
git commit -m "feat: konto.html Seitenstruktur – Navbar, Hero, Tabs, Content-Gerüst"
```

---

## Task 3: konto.js – Auth-Guard, Tab-Switching und Tab Fälle

**Files:**
- Create: `frontend/js/konto.js`

### Kontext

`konto.js` wird als letztes Script geladen. Es hat Zugriff auf:
- `supabaseClient` (aus auth.js, `let`-Variable, global im Script-Scope)
- `fordifyAuth` (aus auth.js, `const`-Variable, global im Script-Scope)
- `ladeSubscriptionStatus()` (aus auth.js)
- `StorageBackend` (aus storage.js)
- `aktualisiereUIFuerAuth()` (aus auth-ui.js)
- `openCustomerPortal()`, `logout()` (aus auth-ui.js)

Registry-Datenstruktur (aus app.js, STORAGE_KEY_CASES = `"fordify_cases"`):
```json
{
  "cases": {
    "f1234567890": {
      "id": "f1234567890",
      "name": "Müller ./. Schmidt",
      "updatedAt": "2026-04-12T10:00:00.000Z",
      "fall": { "mandant": "Müller", "gegner": "Schmidt", "positionen": [], ... },
      "naechsteId": 3
    }
  },
  "currentCaseId": "f1234567890"
}
```

Settings-Datenstruktur (STORAGE_KEY_SETTINGS = `"fordify_settings"`):
```json
{
  "logo": "data:image/png;base64,...",
  "logoPosition": "links",
  "imp": {
    "name": "Kanzlei Mustermann",
    "strasse": "...",
    "plz": "...", "ort": "...", "tel": "...", "fax": "...", "email": "...",
    "website": "...", "kammer": "...", "register": "...", "vertreten": "...",
    "ustid": "...", "bhv": "...", "iban": "...", "bic": "...", "bank": "...",
    "impressumUrl": "...", "datenschutzUrl": "..."
  }
}
```

IMP_FIELDS (Mapping HTML-ID-Suffix → Settings-Key):
```
name, strasse, plz, ort, tel, fax, email, website, kammer, register,
vertreten, ustid, bhv, iban, bic, bank, impressum-url (→ impressumUrl), datenschutz-url (→ datenschutzUrl)
```

- [ ] **Schritt 1: konto.js anlegen mit Auth-Guard, Tab-Switching, Tab Fälle**

Erstelle `frontend/js/konto.js`:

```javascript
'use strict';

const KONTO_STORAGE_KEY_CASES    = 'fordify_cases';
const KONTO_STORAGE_KEY_SETTINGS = 'fordify_settings';
const KONTO_STORAGE_KEY_THEME    = 'fordify_theme';

// ---- Storage-Hilfsfunktionen ----

function kontoLadeRegistry() {
  try {
    const raw = StorageBackend.getItem(KONTO_STORAGE_KEY_CASES);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { cases: {}, currentCaseId: null };
}

function kontoSpeichereRegistry(reg) {
  try {
    StorageBackend.setItem(KONTO_STORAGE_KEY_CASES, JSON.stringify(reg));
  } catch (e) { console.warn('Registry speichern fehlgeschlagen:', e); }
}

function kontoLadeEinstellungen() {
  try {
    const raw = StorageBackend.getItem(KONTO_STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { logo: null, logoPosition: 'links', imp: {} };
}

function kontoSpeichereEinstellungen(einst) {
  StorageBackend.setItem(KONTO_STORAGE_KEY_SETTINGS, JSON.stringify(einst));
}

// ---- Auth-Guard und Init ----

document.addEventListener('DOMContentLoaded', async () => {
  if (!supabaseClient) {
    window.location.href = '/forderungsaufstellung';
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = '/forderungsaufstellung';
    return;
  }

  fordifyAuth.isAuthenticated = true;
  fordifyAuth.user = session.user;
  await ladeSubscriptionStatus();
  StorageBackend.init(fordifyAuth);
  aktualisiereUIFuerAuth();

  _kontoUpdateHero();
  _kontoInitTabs();
  _kontoActivateTabFromUrl();

  document.getElementById('konto-loading').style.display = 'none';
  document.getElementById('konto-content').classList.remove('d-none');
});

// ---- Hero aktualisieren ----

function _kontoUpdateHero() {
  const user = fordifyAuth.user;
  if (!user) return;

  const email = user.email || '';
  const local = email.split('@')[0];
  const parts = local.split(/[._-]/);
  let initials;
  if (parts.length >= 2 && parts[0] && parts[1]) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else {
    initials = local.slice(0, 2).toUpperCase();
  }

  const avatarEl = document.getElementById('konto-hero-avatar');
  if (avatarEl) avatarEl.textContent = initials;

  const emailEl = document.getElementById('konto-hero-email');
  if (emailEl) emailEl.textContent = email;

  const badgeEl = document.getElementById('konto-hero-badge');
  if (badgeEl) {
    const configs = {
      pro:      { label: 'PRO',      bg: '#fef3c7', color: '#92400e' },
      business: { label: 'BUSINESS', bg: '#dbeafe', color: '#1e40af' },
    };
    const c = configs[fordifyAuth.plan];
    if (c) badgeEl.innerHTML = `<span class="plan-badge" style="background:${c.bg};color:${c.color}">${c.label}</span>`;
  }
}

// ---- Tab-Switching ----

function _kontoInitTabs() {
  document.querySelectorAll('.konto-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      _kontoZeigeTab(tab);
      history.replaceState({}, '', '?tab=' + tab);
    });
  });
  _kontoRendererFuerTab('faelle');
}

function _kontoActivateTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && ['faelle', 'firmendaten', 'abo'].includes(tab)) {
    _kontoZeigeTab(tab);
  }
}

function _kontoZeigeTab(name) {
  document.querySelectorAll('.konto-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === name);
    btn.setAttribute('aria-selected', btn.dataset.tab === name ? 'true' : 'false');
  });
  document.querySelectorAll('.konto-tab-panel').forEach(panel => {
    panel.classList.toggle('d-none', panel.id !== 'tab-' + name);
  });
  _kontoRendererFuerTab(name);
}

function _kontoRendererFuerTab(name) {
  if (name === 'faelle')      kontoRendereFaelleTab();
  if (name === 'firmendaten') kontoRendereFirmendatenTab();
  if (name === 'abo')         kontoRendereAboTab();
}

// ---- Tab: Fälle ----

function kontoRendereFaelleTab() {
  const reg = kontoLadeRegistry();
  const cases = Object.values(reg.cases).sort((a, b) =>
    (b.updatedAt || '').localeCompare(a.updatedAt || '')
  );

  const anzahlEl = document.getElementById('faelle-anzahl');
  if (anzahlEl) anzahlEl.textContent = cases.length === 1 ? '1 gespeicherter Fall' : cases.length + ' gespeicherte Fälle';

  const listeEl = document.getElementById('faelle-liste');
  if (!listeEl) return;

  if (cases.length === 0) {
    listeEl.innerHTML = `
      <div class="text-center py-5 text-muted">
        <p class="mb-3">Noch keine gespeicherten Fälle.</p>
        <button class="btn btn-primary" onclick="kontoNeuenFallAnlegen()">Ersten Fall anlegen</button>
      </div>`;
    return;
  }

  listeEl.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0" style="background:white;border-radius:8px;overflow:hidden;">
        <thead style="background:#f1f5f9;font-size:0.75rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;">
          <tr>
            <th class="ps-3">Fall</th>
            <th>Geändert</th>
            <th style="width:1%;white-space:nowrap;"></th>
          </tr>
        </thead>
        <tbody>
          ${cases.map(c => {
            const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('de-DE') : '';
            const positionen = (c.fall?.positionen || []).length;
            return `<tr>
              <td class="ps-3">
                <div class="fw-medium">${_escHtml(c.name || 'Unbenannter Fall')}</div>
                <div class="text-muted" style="font-size:0.75rem;">${positionen} Position${positionen !== 1 ? 'en' : ''}</div>
              </td>
              <td class="text-muted small">${datum}</td>
              <td>
                <div class="d-flex gap-1 justify-content-end">
                  <button class="btn btn-sm" style="background:#eff6ff;color:#1e3a8a;border:none;" onclick="kontoFallLaden('${c.id}')">Laden</button>
                  <button class="btn btn-sm" style="background:#f1f5f9;color:#475569;border:none;" onclick="kontoFallExportieren('${c.id}')">Export</button>
                  <button class="btn btn-sm" style="background:#fef2f2;color:#ef4444;border:none;" onclick="kontoFallLoeschen('${c.id}')">Löschen</button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function kontoFallLaden(id) {
  const reg = kontoLadeRegistry();
  if (!reg.cases[id]) return;
  reg.currentCaseId = id;
  kontoSpeichereRegistry(reg);
  window.location.href = '/forderungsaufstellung';
}

function kontoFallLoeschen(id) {
  if (!confirm('Diesen Fall wirklich löschen?')) return;
  const reg = kontoLadeRegistry();
  delete reg.cases[id];
  if (reg.currentCaseId === id) reg.currentCaseId = null;
  kontoSpeichereRegistry(reg);
  kontoRendereFaelleTab();
}

function kontoFallExportieren(id) {
  const reg = kontoLadeRegistry();
  const eintrag = reg.cases[id];
  if (!eintrag) return;
  const data = { fall: eintrag.fall, naechsteId: eintrag.naechsteId, exportDatum: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Fordify_Fall_' + (eintrag.name || id).replace(/[/\\:*?"<>|]/g, '').replace(/\s+/g, '_').slice(0, 50) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function kontoFaelleExportierenAlle() {
  const reg = kontoLadeRegistry();
  const blob = new Blob([JSON.stringify({ fordify_cases: reg }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Fordify_Alle_Faelle_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function kontoFallImportieren(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.fall) {
        alert('Ungültige Datei. Bitte verwenden Sie eine von fordify exportierte Fall-JSON-Datei.');
        input.value = '';
        return;
      }
      const reg = kontoLadeRegistry();
      const id = 'f' + Date.now();
      const mandant = data.fall.mandant || '';
      const gegner  = data.fall.gegner  || '';
      const name = mandant && gegner ? mandant + ' ./. ' + gegner : mandant || gegner || 'Importierter Fall';
      reg.cases[id] = {
        id,
        name,
        updatedAt: new Date().toISOString(),
        fall: data.fall,
        naechsteId: data.naechsteId || 1,
      };
      kontoSpeichereRegistry(reg);
      kontoRendereFaelleTab();
    } catch (e) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
    input.value = '';
  };
  reader.readAsText(file);
}

function kontoNeuenFallAnlegen() {
  const reg = kontoLadeRegistry();
  const id = 'f' + Date.now();
  reg.cases[id] = {
    id,
    name: 'Neuer Fall',
    updatedAt: new Date().toISOString(),
    fall: { mandant: '', gegner: '', aktenzeichen: '', aufschlagPP: 9, insoDatum: null, forderungsgrundKat: '', titelArt: '', titelDatum: '', titelRechtskraft: '', titelGericht: '', titelAz: '', positionen: [] },
    naechsteId: 1,
  };
  reg.currentCaseId = id;
  kontoSpeichereRegistry(reg);
  window.location.href = '/forderungsaufstellung';
}
```

- [ ] **Schritt 2: Manuell testen (Tab Fälle)**

  - Als Pro-Nutzer auf `konto.html` navigieren: Seite lädt, Hero zeigt Initialen + E-Mail + PRO-Badge
  - Tab „Fälle" ist aktiv, Fälle-Liste zeigt gespeicherte Fälle
  - „Laden" navigiert zu `/forderungsaufstellung` und öffnet den richtigen Fall
  - „Löschen" entfernt Fall nach Bestätigung, Liste aktualisiert sich
  - „+ Neuer Fall" navigiert zu `/forderungsaufstellung` mit leerem Fall
  - Nicht eingeloggt: direkte Weiterleitung zu `/forderungsaufstellung`

- [ ] **Schritt 3: Commit**

```bash
git add frontend/js/konto.js
git commit -m "feat: konto.js – Auth-Guard, Tab-Switching, Tab Fälle vollständig"
```

---

## Task 4: konto.js – Tab Firmendaten und Tab Abo

**Files:**
- Modify: `frontend/js/konto.js`

### Kontext

IMP_FIELDS-Suffix zu Settings-Key-Mapping:
```
name → name, strasse → strasse, plz → plz, ort → ort, tel → tel, fax → fax,
email → email, website → website, kammer → kammer, register → register,
vertreten → vertreten, ustid → ustid, bhv → bhv, iban → iban, bic → bic,
bank → bank, impressum-url → impressumUrl, datenschutz-url → datenschutzUrl
```

HTML-Input-IDs folgen dem Muster `konto-einst-imp-{suffix}`.

`_pendingLogoData` ist eine modulare Variable in konto.js, die das ausgewählte Logo-DataURL zwischenspeichert bis „Speichern" gedrückt wird.

- [ ] **Schritt 1: Tab Firmendaten und Tab Abo an konto.js anhängen**

Füge folgenden Code am Ende von `frontend/js/konto.js` hinzu:

```javascript
// ---- Tab: Firmendaten ----

const KONTO_IMP_FIELDS = [
  'name','strasse','plz','ort','tel','fax','email',
  'website','kammer','register','vertreten','ustid','bhv','iban','bic','bank',
  'impressum-url','datenschutz-url'
];

let _pendingLogoData = undefined; // undefined = keine Änderung; null = entfernen; string = neues DataURL

function kontoRendereFirmendatenTab() {
  const einst = kontoLadeEinstellungen();
  _pendingLogoData = undefined;

  const posEl = document.getElementById('konto-logo-position');
  if (posEl) posEl.value = einst.logoPosition || 'links';

  const imp = einst.imp || {};
  for (const suffix of KONTO_IMP_FIELDS) {
    const key = suffix.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const el = document.getElementById('konto-einst-imp-' + suffix);
    if (el) el.value = imp[key] || '';
  }

  _kontoAktualisiereLogoVorschau(einst.logo || null);
  _kontoAktualisiereFussVorschau();

  // Live-Vorschau bei Eingabe
  const col = document.getElementById('tab-firmendaten');
  if (col) {
    col.removeEventListener('input', _kontoAktualisiereFussVorschau);
    col.addEventListener('input', _kontoAktualisiereFussVorschau);
  }
}

function _kontoAktualisiereLogoVorschau(src) {
  const img = document.getElementById('konto-logo-vorschau');
  if (!img) return;
  if (src) {
    img.src = src;
    img.style.display = '';
  } else {
    img.src = '';
    img.style.display = 'none';
  }
}

function kontoLogoBildLaden(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('Logo-Datei ist zu groß (max. 2 MB).');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    _pendingLogoData = ev.target.result;
    _kontoAktualisiereLogoVorschau(_pendingLogoData);
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function kontoLogoEntfernen() {
  _pendingLogoData = null;
  _kontoAktualisiereLogoVorschau(null);
}

function _kontoLeseImpFelder() {
  const imp = {};
  for (const suffix of KONTO_IMP_FIELDS) {
    const key = suffix.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const el = document.getElementById('konto-einst-imp-' + suffix);
    imp[key] = el ? el.value.trim() : '';
  }
  return imp;
}

function _kontoGeneriereImpressumFooterHtml(imp) {
  if (!imp) return '';
  const parts = [];
  if (imp.name)     parts.push(`<strong>${_escHtml(imp.name)}</strong>`);
  const adresse = [imp.strasse, (imp.plz && imp.ort ? imp.plz + ' ' + imp.ort : imp.plz || imp.ort)].filter(Boolean);
  if (adresse.length) parts.push(adresse.map(_escHtml).join(', '));
  if (imp.tel)      parts.push('Tel: ' + _escHtml(imp.tel));
  if (imp.fax)      parts.push('Fax: ' + _escHtml(imp.fax));
  if (imp.email)    parts.push('E-Mail: ' + _escHtml(imp.email));
  if (imp.website)  parts.push(_escHtml(imp.website));
  if (imp.kammer)   parts.push(_escHtml(imp.kammer));
  if (imp.ustid)    parts.push('USt-IdNr.: ' + _escHtml(imp.ustid));
  return parts.join(' &middot; ');
}

function _kontoAktualisiereFussVorschau() {
  const el = document.getElementById('konto-imp-vorschau');
  if (!el) return;
  const html = _kontoGeneriereImpressumFooterHtml(_kontoLeseImpFelder());
  el.innerHTML = html || '<em style="color:#94a3b8;">Vorschau erscheint hier…</em>';
}

function kontoEinstellungenSpeichern() {
  const einst = kontoLadeEinstellungen();

  if (_pendingLogoData !== undefined) {
    einst.logo = _pendingLogoData; // null = entfernen, string = neues Logo
  }

  einst.logoPosition = document.getElementById('konto-logo-position')?.value || 'links';
  einst.imp = _kontoLeseImpFelder();

  kontoSpeichereEinstellungen(einst);
  _pendingLogoData = undefined;

  // Kurzfeedback
  const btn = document.querySelector('[onclick="kontoEinstellungenSpeichern()"]');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Gespeichert ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
  }
}

function kontoEinstellungenExportieren() {
  const einst = kontoLadeEinstellungen();
  const blob = new Blob([JSON.stringify({ fordify_settings: einst }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const firma = ((einst.imp || {}).name || '').replace(/[/\\:*?"<>|]/g, '').replace(/\s+/g, '_').slice(0, 50);
  a.download = 'Fordify_Einstellungen' + (firma ? '_' + firma : '') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function kontoEinstellungenImportieren(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed.fordify_settings) {
        alert('Import fehlgeschlagen: Dies ist keine fordify-Einstellungsdatei.');
        input.value = '';
        return;
      }
      kontoSpeichereEinstellungen(parsed.fordify_settings);
      kontoRendereFirmendatenTab();
    } catch (e) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
    input.value = '';
  };
  reader.readAsText(file);
}

function kontoThemeWechseln(name) {
  const valid = ['brand', 'dark', 'clean'];
  if (!valid.includes(name)) name = 'brand';
  localStorage.setItem(KONTO_STORAGE_KEY_THEME, name);
  alert('Theme "' + name + '" gespeichert. Es wird aktiv, sobald Sie die Forderungsaufstellungs-Seite öffnen.');
}

// ---- Tab: Abo ----

function kontoRendereAboTab() {
  const plan = fordifyAuth.plan || 'free';
  const configs = {
    pro:      { label: 'PRO',      bg: '#fef3c7', color: '#92400e' },
    business: { label: 'BUSINESS', bg: '#dbeafe', color: '#1e40af' },
  };
  const c = configs[plan];

  const badgeEl = document.getElementById('konto-abo-plan-badge');
  if (badgeEl && c) {
    badgeEl.innerHTML = `<span class="plan-badge" style="background:${c.bg};color:${c.color};font-size:1rem;padding:4px 14px;">${c.label}</span>`;
  }

  // Laufzeit aus Supabase laden
  if (supabaseClient && fordifyAuth.user) {
    supabaseClient
      .from('subscriptions')
      .select('current_period_end')
      .eq('user_id', fordifyAuth.user.id)
      .single()
      .then(({ data }) => {
        const laufzeitEl = document.getElementById('konto-abo-laufzeit');
        if (laufzeitEl && data?.current_period_end) {
          laufzeitEl.textContent = new Date(data.current_period_end).toLocaleDateString('de-DE');
        }
      });
  }
}
```

- [ ] **Schritt 2: Manuell testen (Tab Firmendaten)**

  - Tab „Firmendaten" öffnen: Formular füllt sich mit gespeicherten Daten
  - Felder ändern: Vorschau im Footer-Preview aktualisiert sich live
  - Logo hochladen: Vorschau erscheint
  - „Speichern": Bestätigungs-Feedback am Button, Daten in localStorage
  - Export/Import: JSON-Datei runterladen und wieder einlesen

- [ ] **Schritt 3: Manuell testen (Tab Abo)**

  - Tab „Abo" öffnen: Plan-Badge (PRO/BUSINESS) korrekt
  - Laufzeit-Datum aus Supabase geladen und angezeigt
  - „Abo verwalten →" öffnet Paddle-Portal in neuem Tab

- [ ] **Schritt 4: Commit**

```bash
git add frontend/js/konto.js
git commit -m "feat: konto.js – Tab Firmendaten und Tab Abo vollständig"
```

---

## Task 5: SW-Cache aktualisieren + Abschluss

**Files:**
- Modify: `frontend/sw.js`
- Modify: `CLAUDE.md` (Status-Übersicht + SW-Version)

- [ ] **Schritt 1: konto.html und konto.js zur ASSETS-Liste in sw.js hinzufügen**

In `frontend/sw.js`, nach `/forderungsaufstellung.html` die Zeile einfügen:
```javascript
  "/konto.html",
```

Nach `/js/app.js`:
```javascript
  "/js/konto.js",
```

- [ ] **Schritt 2: SW-Version erhöhen**

In `frontend/sw.js`:
```javascript
const CACHE = IS_STAGING_SW ? "fordify-staging-vX" : "fordify-vY";
```
Erhöhe beide Versionsnummern um 1.

- [ ] **Schritt 3: CLAUDE.md aktualisieren**

  - SW-Version im Kommentar in sw.js-Zeile aktualisieren
  - Dateistruktur: `konto.html` und `js/konto.js` eintragen
  - Keine aktiven Implementierungspläne mehr für dieses Feature (Plan nach done/ verschieben nach Abschluss)

- [ ] **Schritt 4: Plan nach done/ verschieben**

```bash
mv docs/superpowers/plans/2026-04-22-kundenbereich.md docs/superpowers/plans/done/
```

- [ ] **Schritt 5: Abschluss-Commit**

```bash
git add frontend/sw.js CLAUDE.md docs/superpowers/plans/
git commit -m "feat: Kundenbereich vollständig – konto.html live, SW-Cache + Doku aktualisiert"
```

- [ ] **Schritt 6: Push auf staging**

```bash
git push origin staging
```

---

## Selbst-Review

**Spec-Coverage:**
- ✅ konto.html mit Hero, Tab-Leiste, Bootstrap-Container
- ✅ Zugriffsschutz (Redirect wenn nicht eingeloggt)
- ✅ Tab Fälle: Laden, Löschen, Export Einzelfall, Export alle, Import, Neuer Fall, Leerzustand
- ✅ Tab Firmendaten: Logo, Kanzleidaten, Theme, Export/Import, Speichern
- ✅ Tab Abo: Plan-Badge, Laufzeit, Abo verwalten, Pläne & Preise
- ✅ URL-Parameter ?tab=faelle|firmendaten|abo
- ✅ forderungsaufstellung.html: Fälle-Button entfernt, Einstellungen→Firmendaten (Guest only), Mein Konto im Avatar-Dropdown
- ✅ konto.html + konto.js in SW-Cache

**Typ-Konsistenz:**
- `kontoLadeRegistry()` / `kontoSpeichereRegistry()` — konsistent verwendet in Task 3 und 4
- `kontoLadeEinstellungen()` / `kontoSpeichereEinstellungen()` — konsistent
- `_escHtml()` — in Task 3 definiert, in Task 4 wiederverwendet ✅
- `KONTO_IMP_FIELDS` — in Task 4 definiert, in `_kontoLeseImpFelder()` und `kontoRendereFirmendatenTab()` konsistent verwendet ✅
