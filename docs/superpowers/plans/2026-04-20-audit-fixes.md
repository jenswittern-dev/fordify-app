# Audit-Fixes Implementation Plan

## Aktueller Stand (2026-04-21)
| Task | Status | Notiz |
|---|---|---|
| 1 – BUG-01 InsO-Datum in Vorschau | ⏳ | Nicht verifiziert, muss geprüft werden |
| 2 – BUG-02 confirm() → Bootstrap-Modal | ⏳ | 3 `confirm()`-Instanzen noch in app.js vorhanden |
| 3 – Security: Supabase aus SW-Cache | ✅ | Supabase-CDN nicht in ASSETS, zusammenfassung.js entfernt |
| 4 – Performance: Cache-Control + Preload | ✅ | .htaccess mit Cache-Control, preconnect + preload in index.html |
| 5 – A11y WCAG F-01 bis F-06 | ⏳ | `outline:none` (2×) noch in app.css; skip-nav nur auf index.html |
| 6 – A11y Warnungen W-04/W-09/W-10 | ⏳ | skip-nav fehlt auf 5 Seiten (rechner, preise, FA) |
| 7 – SEO: Sitemap, OG-Tags, H1 | ✅ | Alle Rechner-Seiten mit Meta-Tags, sitemap.xml aktuell |
| 8 – Content: Sie/Du, Subheadline | ⏳ | Teilweise erledigt (preise.html), FAQ-Ton nicht vollständig geprüft |

**Nächste offene Punkte:** BUG-02 (confirm), A11y skip-nav auf allen Seiten, outline:none fixen.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle Findings aus dem 12-Agenten-Multiview-Audit vom 20.04.2026 beheben (Bugs, Security, Performance, Accessibility, SEO, Content/Design).

**Architecture:** Pure Static SPA – HTML/CSS/Vanilla JS, kein Build-Schritt. Alle Änderungen direkt in Frontend-Dateien, SW-Version nach jeder Gruppe von Änderungen erhöhen.

**Tech Stack:** Bootstrap 5.3, Vanilla JS, Apache `.htaccess`, Service Worker, WCAG 2.2 AA

---

## File Map

| Datei | Änderungen |
|---|---|
| `frontend/js/app.js` | BUG-01 (bisDate-Anzeige), BUG-02 (confirm→Modal) |
| `frontend/sw.js` | Supabase aus Cache entfernen, zusammenfassung.js entfernen, Version bump |
| `frontend/forderungsaufstellung.html` | zusammenfassung.js entfernen, WCAG F-02/F-03/F-05/F-06, aria-current |
| `frontend/css/app.css` | WCAG F-01 (outline:none entfernen) |
| `frontend/preise.html` | WCAG F-04/W-04, skip-nav, OG-Tags, Sie/Du fix, comparison table |
| `frontend/index.html` | skip-nav, NEU-Badge entfernen, Subheadline kürzen, Unternehmen ergänzen, aria-current |
| `frontend/zinsrechner.html` | WCAG W-09 (aria-live), skip-nav |
| `frontend/rvg-rechner.html` | skip-nav |
| `frontend/gerichtskostenrechner.html` | skip-nav |
| `frontend/.htaccess` | Cache-Control headers, font preload |
| `frontend/sitemap.xml` | /preise ergänzen |

---

### Task 1: BUG-01 – InsO-Datum in Vorschau korrekt anzeigen

**Problem:** `datumRangeCell()` zeigt `heute` als Enddatum für Zinszeitraum, obwohl die Berechnung korrekt an `insoDatum` kappt. Visuell irreführend.

**Files:**
- Modify: `frontend/js/app.js` (Zeilen 1754–1764 und 1891–1897)

- [ ] **Step 1: Effektive bisDate beim Speichern in zinsenEntries kappen**

Ändere Zeile 1754 (phase0End-Berechnung):
```js
// vorher:
const phase0End = zahlungen.length > 0 ? parseDate(zahlungen[0].datum) : heute;
// nachher:
let phase0End = zahlungen.length > 0 ? parseDate(zahlungen[0].datum) : heute;
if (insoDatum && phase0End > insoDatum) phase0End = insoDatum;
```

Und beim finalen Zinslauf (Zeile 1891):
```js
// vorher:
const z = calcZinsen(hfEntry.rest, lastPayDatum, heute);
// nachher:
const effektivBis = (insoDatum && insoDatum < heute) ? insoDatum : heute;
const z = calcZinsen(hfEntry.rest, lastPayDatum, effektivBis);
```

Und Zeile 1897 (bisDate im Entry):
```js
// vorher:
bisDate: heute,
// nachher:
bisDate: effektivBis,
```

- [ ] **Step 2: Commit**
```bash
git add frontend/js/app.js
git commit -m "fix: InsO-Datum als Enddatum in Zinszeitraum-Anzeige korrekt kappen"
```

---

### Task 2: BUG-02 – confirm() durch Bootstrap-Modal ersetzen

**Problem:** `fallZuruecksetzen()` verwendet `window.confirm()` (app.js:2478), das in manchen Browser-Umgebungen die App einfriert.

**Files:**
- Modify: `frontend/js/app.js` (Zeile 2478–2481)
- Modify: `frontend/forderungsaufstellung.html` (Confirmation-Modal ergänzen)

- [ ] **Step 1: Confirmation-Modal in forderungsaufstellung.html ergänzen** (vor dem closing `</body>` Tag, nach dem upgradeModal)

```html
<!-- Confirm-Modal: Neuer Fall -->
<div class="modal fade" id="confirmNeuModal" tabindex="-1" aria-labelledby="confirmNeuModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content modal-content--app">
      <div class="modal-header modal-header--app">
        <h5 class="modal-title" id="confirmNeuModalLabel">Neuen Fall anlegen?</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
      </div>
      <div class="modal-body modal-body--app">
        <p class="mb-0">Alle nicht gespeicherten Daten des aktuellen Falls gehen verloren.</p>
      </div>
      <div class="modal-footer modal-footer--app">
        <button type="button" class="btn-secondary-app" data-bs-dismiss="modal">Abbrechen</button>
        <button type="button" class="btn-primary-app" id="confirmNeuBtn">Neuer Fall</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: fallZuruecksetzen() in app.js ersetzen**
```js
// vorher:
function fallZuruecksetzen() {
  if (!confirm("Neuen leeren Fall anlegen?")) return;
  neuenFallAnlegen();
}

// nachher:
function fallZuruecksetzen() {
  const modal = new bootstrap.Modal(document.getElementById("confirmNeuModal"));
  document.getElementById("confirmNeuBtn").onclick = () => {
    modal.hide();
    neuenFallAnlegen();
  };
  modal.show();
}
```

- [ ] **Step 3: Commit**
```bash
git add frontend/js/app.js frontend/forderungsaufstellung.html
git commit -m "fix: confirm()-Dialog durch Bootstrap-Modal ersetzen (BUG-02)"
```

---

### Task 3: Security – Supabase aus SW-Cache + zusammenfassung.js entfernen

**Files:**
- Modify: `frontend/sw.js`
- Modify: `frontend/forderungsaufstellung.html`

- [ ] **Step 1: Supabase CDN aus ASSETS entfernen** (sw.js – keinen externen CDN-Script cachen)

Die ASSETS-Liste enthält kein `supabase.min.js`. Das Script wird per CDN geladen und soll NICHT gecacht werden (Sicherheitsupdates würden sonst eingefroren). Falls noch drin: entfernen.

Außerdem `zusammenfassung.js` aus ASSETS entfernen (deprecated).

- [ ] **Step 2: `<script src="js/zusammenfassung.js">` aus forderungsaufstellung.html entfernen** (Zeile 738)

- [ ] **Step 3: SW-Version erhöhen** (fordify-v70 → fordify-v71)

- [ ] **Step 4: Commit**
```bash
git add frontend/sw.js frontend/forderungsaufstellung.html
git commit -m "fix: zusammenfassung.js aus SW-Cache und HTML entfernen, SW v71"
```

---

### Task 4: Performance – Cache-Control + Preload + Preconnect

**Files:**
- Modify: `frontend/.htaccess`
- Modify: `frontend/index.html` (preload + preconnect)
- Modify: `frontend/forderungsaufstellung.html` (preconnect)

- [ ] **Step 1: Cache-Control-Header in .htaccess ergänzen**

```apache
Options -Indexes
RewriteEngine On

# Existierende Dateien und Verzeichnisse unverändert lassen
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# /forderungsaufstellung → forderungsaufstellung.html etc.
RewriteRule ^([^./]+)$ $1.html [L]

# Cache-Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType application/json "access plus 1 week"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(css|js|woff2|svg|png)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
  <FilesMatch "\.json$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
</IfModule>
```

- [ ] **Step 2: Font-Preload und CDN-Preconnect in index.html und forderungsaufstellung.html `<head>` ergänzen**

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
```

- [ ] **Step 3: Commit**
```bash
git add frontend/.htaccess frontend/index.html frontend/forderungsaufstellung.html
git commit -m "perf: Cache-Control-Header, Font-Preload, CDN-Preconnect"
```

---

### Task 5: Accessibility – WCAG-Fehler (F-01 bis F-06)

**Files:**
- Modify: `frontend/css/app.css` (F-01)
- Modify: `frontend/forderungsaufstellung.html` (F-02, F-03, F-05, F-06)
- Modify: `frontend/preise.html` (F-04)

- [ ] **Step 1: F-01 – outline:none auf .nav-avatar:focus entfernen** (app.css:1737)
```css
/* vorher: */
.nav-avatar:hover, .nav-avatar:focus { background: rgba(255,255,255,0.35); outline: none; }
/* nachher: */
.nav-avatar:hover, .nav-avatar:focus { background: rgba(255,255,255,0.35); }
.nav-avatar:focus-visible { outline: 2px solid rgba(255,255,255,0.8); outline-offset: 2px; }
```

- [ ] **Step 2: F-02 – Label für Login-E-Mail-Feld** (forderungsaufstellung.html – im loginModal)

Suche das E-Mail-Input-Feld im loginModal und füge `<label for="login-email">E-Mail-Adresse</label>` hinzu (oder `aria-label` wenn kein sichtbares Label passend).

- [ ] **Step 3: F-03 – Schließen-Button für Onboarding-Modal** (forderungsaufstellung.html:644-646)
```html
<!-- vorher: -->
<div class="modal-header modal-header--app">
  <h5 class="modal-title" id="modal-onboarding-titel">Willkommen bei fordify</h5>
</div>
<!-- nachher: -->
<div class="modal-header modal-header--app">
  <h5 class="modal-title" id="modal-onboarding-titel">Willkommen bei fordify</h5>
  <button type="button" class="btn-close ms-auto" data-bs-dismiss="modal" aria-label="Schließen"></button>
</div>
```

- [ ] **Step 4: F-05 – aria-labelledby auf upgradeModal** (forderungsaufstellung.html:702)
```html
<!-- vorher: -->
<div class="modal fade" id="upgradeModal" tabindex="-1" aria-hidden="true">
  ...
  <h5 class="modal-title fw-bold">Pro-Funktion</h5>
<!-- nachher: -->
<div class="modal fade" id="upgradeModal" tabindex="-1" aria-labelledby="upgradeModalLabel" aria-hidden="true">
  ...
  <h5 class="modal-title fw-bold" id="upgradeModalLabel">Pro-Funktion</h5>
```

- [ ] **Step 5: F-06 – Stepper `<a>` → `<button>`** (forderungsaufstellung.html:100-114)
```html
<!-- vorher: -->
<a href="javascript:void(0)" class="stepper-step" data-ansicht="stammdaten">
  ...
</a>
<!-- nachher: -->
<button type="button" class="stepper-step" data-ansicht="stammdaten">
  ...
</button>
```
(alle 3 Stepper-Links)

- [ ] **Step 6: F-04 – scope="col" und caption auf Vergleichstabelle** (preise.html)

```html
<!-- Im comparison-section <table>: -->
<table class="comparison-table" aria-label="Vergleich Free, Pro und Business">
  <caption class="visually-hidden">Funktionsvergleich Free, Pro und Business</caption>
  <thead>
    <tr>
      <th scope="col">Funktion</th>
      <th scope="col">Free</th>
      <th scope="col">Pro</th>
      <th scope="col">Business</th>
    </tr>
  </thead>
```

- [ ] **Step 7: Commit**
```bash
git add frontend/css/app.css frontend/forderungsaufstellung.html frontend/preise.html
git commit -m "a11y: WCAG 2.2 AA Fehler F-01 bis F-06 beheben"
```

---

### Task 6: Accessibility – Warnungen (W-04, W-09, W-10)

**Files:**
- Modify: `frontend/preise.html` (W-04)
- Modify: `frontend/zinsrechner.html` (W-09)
- Modify: `frontend/index.html`, `frontend/zinsrechner.html`, `frontend/preise.html`, `frontend/rvg-rechner.html`, `frontend/gerichtskostenrechner.html` (W-10)

- [ ] **Step 1: W-04 – Billing-Toggle mit Label** (preise.html:122)
```html
<!-- vorher: -->
<input class="form-check-input" type="checkbox" id="billing-toggle" ...>
<!-- nachher: -->
<label class="visually-hidden" for="billing-toggle">Jährliche Abrechnung aktivieren</label>
<input class="form-check-input" type="checkbox" id="billing-toggle" ...>
```

- [ ] **Step 2: W-09 – aria-live auf Zinsrechner-Ergebnis** (zinsrechner.html:178)
```html
<!-- vorher: -->
<div id="zins-ergebnis"></div>
<!-- nachher: -->
<div id="zins-ergebnis" aria-live="polite" aria-atomic="true"></div>
```

- [ ] **Step 3: W-10 – Skip-Nav auf allen Seiten ohne sie** (index.html, zinsrechner.html, preise.html, rvg-rechner.html, gerichtskostenrechner.html)

Direkt nach `<body>` einfügen:
```html
<a href="#main-content" class="skip-nav">Zum Hauptinhalt springen</a>
```

Und `id="main-content"` auf `<main>` setzen.

- [ ] **Step 4: Commit**
```bash
git add frontend/preise.html frontend/zinsrechner.html frontend/index.html frontend/rvg-rechner.html frontend/gerichtskostenrechner.html
git commit -m "a11y: WCAG Warnungen W-04/W-09/W-10 beheben (aria-live, skip-nav, label)"
```

---

### Task 7: SEO – Sitemap, OG-Tags, Meta-Descriptions, H1

**Files:**
- Modify: `frontend/sitemap.xml`
- Modify: `frontend/preise.html`
- Modify: `frontend/forderungsaufstellung.html`

- [ ] **Step 1: /preise zur Sitemap hinzufügen**
```xml
<url>
  <loc>https://fordify.de/preise</loc>
  <lastmod>2026-04-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

- [ ] **Step 2: OG/Twitter-Tags für preise.html ergänzen** (nach `<meta name="robots">`)
```html
<meta property="og:title" content="Preise – fordify Pro für Anwälte und Unternehmen">
<meta property="og:description" content="fordify Pro: Cloud-Speicherung, Excel-Export und dauerhaftes Kanzlei-Profil. 19 €/Monat oder 149 €/Jahr.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://fordify.de/preise">
<meta property="og:image" content="https://fordify.de/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Preise – fordify Pro für Anwälte und Unternehmen">
<meta name="twitter:description" content="fordify Pro: Cloud-Speicherung, Excel-Export und dauerhaftes Kanzlei-Profil. 19 €/Monat oder 149 €/Jahr.">
<meta name="twitter:image" content="https://fordify.de/img/og-image.png">
```

- [ ] **Step 3: H1 auf forderungsaufstellung.html keyword-optimieren**
```html
<!-- vorher: -->
<title>fordify – Forderungsaufstellung erstellen | § 367 BGB</title>
<meta name="description" content="Professionelle Forderungsaufstellungen für Anwaltskanzleien – kostenlos, direkt im Browser, DSGVO-konform.">
<!-- nachher: -->
<title>Forderungsaufstellung nach § 367 BGB erstellen – fordify</title>
<meta name="description" content="Kostenlose Forderungsaufstellung nach § 367 BGB: Verzugszinsen, RVG-Kosten und § 367-Verrechnungslogik automatisch berechnen – direkt im Browser, ohne Anmeldung.">
```

- [ ] **Step 4: Meta-Description für preise.html auf 155 Zeichen kürzen**

Die aktuelle ist gut – nur prüfen ob sie ≤155 Zeichen hat.

- [ ] **Step 5: Commit**
```bash
git add frontend/sitemap.xml frontend/preise.html frontend/forderungsaufstellung.html
git commit -m "seo: /preise in Sitemap, OG-Tags, H1 und Meta-Description optimiert"
```

---

### Task 8: Content – Sie/Du, Subheadline, NEU-Badge, Zielgruppe

**Files:**
- Modify: `frontend/preise.html`
- Modify: `frontend/index.html`

- [ ] **Step 1: Sie/Du in preise.html FAQ korrigieren** (Zeilen 241, 245)

Alle "Du/du/deine/dich" → "Sie/Ihre/Ihnen/Sie"

- [ ] **Step 2: Subheadline auf index.html kürzen und Unternehmen ergänzen** (Zeile 106)
```html
<!-- vorher: -->
<p class="lead mb-4">fordify berechnet Verzugszinsen nach § 288 BGB, RVG-Gebühren (BGBl. 2025 I Nr. 109) und die gesetzliche Tilgungsreihenfolge – für Anwaltskanzleien, Syndikusanwälte und Inkassobüros. Vollständig im Browser, ohne Registrierung, DSGVO-konform.</p>
<!-- nachher: -->
<p class="lead mb-4">Verzugszinsen, RVG-Gebühren und § 367-Verrechnung automatisch berechnen – für Kanzleien, Inkassobüros und Unternehmen. Kostenlos, ohne Registrierung, DSGVO-konform.</p>
```

- [ ] **Step 3: NEU-Badge im Hero-CTA entfernen** (index.html:108)
```html
<!-- vorher: -->
Jetzt kostenlos starten <span class="pill-badge ms-2">NEU</span>
<!-- nachher: -->
Jetzt kostenlos starten
```

- [ ] **Step 4: AVV-FAQ in preise.html ergänzen** (nach der letzten `<details>`)
```html
<details>
  <summary>Stellen Sie einen Auftragsverarbeitungsvertrag (AVV) bereit?</summary>
  <p>Ja. Für Kanzleien, die personenbezogene Mandantendaten eingeben, stellen wir auf Anfrage einen AVV gemäß Art. 28 DSGVO bereit. Bitte schreiben Sie uns an <a href="mailto:hallo@fordify.de">hallo@fordify.de</a>.</p>
</details>
```

- [ ] **Step 5: Commit**
```bash
git add frontend/preise.html frontend/index.html
git commit -m "content: Sie/Du korrigiert, Subheadline gekürzt, NEU-Badge entfernt, AVV-FAQ"
```

---

### Task 9: Design – aria-current, Comparison-Table Mobile

**Files:**
- Modify: `frontend/index.html`, `frontend/forderungsaufstellung.html`, `frontend/preise.html`, `frontend/zinsrechner.html`, `frontend/rvg-rechner.html`, `frontend/gerichtskostenrechner.html`
- Modify: `frontend/preise.html` (comparison table overflow)

- [ ] **Step 1: aria-current="page" auf aktivem Nav-Link** (jede Seite markiert ihren eigenen Link)

Auf index.html:
```html
<a class="nav-link fw-semibold" href="/" aria-current="page">Startseite</a>
```
Auf forderungsaufstellung.html, preise.html, zinsrechner.html etc. entsprechend den richtigen Link markieren.

- [ ] **Step 2: Comparison-Table mit overflow-x:auto wrappen** (preise.html)
```html
<!-- vorher: -->
<div class="comparison-section">
  <h2>...</h2>
  <table class="comparison-table">
<!-- nachher: -->
<div class="comparison-section">
  <h2>...</h2>
  <div style="overflow-x:auto">
  <table class="comparison-table">
  ...
  </table>
  </div>
```

- [ ] **Step 3: Commit**
```bash
git add frontend/index.html frontend/forderungsaufstellung.html frontend/preise.html frontend/zinsrechner.html frontend/rvg-rechner.html frontend/gerichtskostenrechner.html
git commit -m "design: aria-current auf Nav-Links, comparison-table overflow-x mobile"
```

---

### Task 10: SW-Version bump + Push

- [ ] **Step 1: SW-Version auf fordify-v71 setzen** (oder höher falls mehrere Bumps nötig)

- [ ] **Step 2: Push auf staging + main**
```bash
git push origin main
```

---

*Plan erstellt: 20. April 2026 | Basis: 12-Agenten-Multiview-Audit*
