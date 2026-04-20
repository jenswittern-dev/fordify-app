# SEO-Fundament & Einzelrechner-Seiten – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Homepage als SEO-Hub auf `fordify.de/`, App auf `/forderungsaufstellung`, drei Rechner-Seiten auf `/zinsrechner`, `/rvg-rechner`, `/gerichtskostenrechner` — alle als statische HTML-Seiten, deployed auf Staging.

**Architecture:** Separate statische HTML-Dateien, kein Build-Schritt. `.htaccess` für saubere URLs ohne `.html`-Extension. Shared `rechner.css` für Homepage + Rechner-Seiten. Rechner-Seiten laden nur die benötigten JS-Module (`config.js`, `decimal.min.js`, `data.js` + jeweilige Logik-Datei + einen Page-Controller `rechner-*.js`).

**Tech Stack:** Bootstrap 5.3.3, Vanilla JS, `decimal.min.js`, bestehende `zinsen.js` / `rvg.js` / `data.js`, Apache `.htaccess` mod_rewrite

---

## File Structure

| Datei | Aktion | Zweck |
|---|---|---|
| `frontend/.htaccess` | NEU | Saubere URLs ohne .html-Extension |
| `frontend/css/rechner.css` | NEU | Styles für Homepage + alle Rechner-Seiten |
| `frontend/index.html` | ERSETZEN | Neue Homepage (bisherige App wird umgezogen) |
| `frontend/forderungsaufstellung.html` | NEU | Bisherige App (aus index.html verschoben) |
| `frontend/zinsrechner.html` | NEU | Verzugszinsrechner-Seite |
| `frontend/rvg-rechner.html` | NEU | RVG-Rechner-Seite |
| `frontend/gerichtskostenrechner.html` | NEU | GKG-Rechner-Seite |
| `frontend/js/rechner-zins.js` | NEU | Page-Controller Zinsrechner |
| `frontend/js/rechner-rvg.js` | NEU | Page-Controller RVG-Rechner |
| `frontend/js/rechner-gkg.js` | NEU | Page-Controller GKG-Rechner |
| `frontend/sitemap.xml` | ÄNDERN | Neue URLs ergänzen |
| `frontend/sw.js` | ÄNDERN | Neue Seiten cachen, Version → fordify-v47 |

---

### Task 1: .htaccess für saubere URLs

**Files:**
- Erstellen: `frontend/.htaccess`

- [ ] **Schritt 1: .htaccess erstellen**

`frontend/.htaccess`:
```apache
Options -Indexes
RewriteEngine On

# Existierende Dateien und Verzeichnisse unverändert lassen
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# /forderungsaufstellung → forderungsaufstellung.html etc.
RewriteRule ^([^.]+)$ $1.html [L]
```

- [ ] **Schritt 2: Commit**

```bash
git add frontend/.htaccess
git commit -m "feat: .htaccess für saubere URLs (ohne .html-Extension)"
```

---

### Task 2: rechner.css

**Files:**
- Erstellen: `frontend/css/rechner.css`

- [ ] **Schritt 1: rechner.css erstellen**

`frontend/css/rechner.css`:
```css
/* ============================================================
   rechner.css – Styles für Homepage + Rechner-Seiten
   Setzt app.css (CSS Custom Properties) voraus
   ============================================================ */

/* ---- Hero ---- */
.fordify-hero {
  padding: 4rem 0 3rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%);
  color: #fff;
}
.fordify-hero h1 {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}
.fordify-hero .lead {
  font-size: 1.05rem;
  opacity: 0.88;
  max-width: 600px;
}

/* ---- Tool-Grid ---- */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin: 2.5rem 0;
}
.tool-card {
  background: var(--color-card);
  border: 1.5px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  display: flex;
  flex-direction: column;
}
.tool-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(30,58,138,.12);
  transform: translateY(-2px);
  color: inherit;
}
.tool-card.tool-card--primary {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.tool-card__icon {
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
}
.tool-card__title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.4rem;
  color: var(--color-primary);
}
.tool-card__desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  flex-grow: 1;
  margin-bottom: 1rem;
}
.tool-card__cta {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
}

/* ---- Vorteile ---- */
.vorteil-item {
  text-align: center;
  padding: 1.5rem 1rem;
}
.vorteil-item__icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: block;
}
.vorteil-item__title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

/* ---- SEO-Textblock ---- */
.seo-text-block {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 3rem 0;
}
.seo-text-block h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}
.seo-text-block h2:first-child { margin-top: 0; }
.seo-text-block p {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: 1.7;
}

/* ---- Rechner-Seiten ---- */
.rechner-header {
  padding: 2.5rem 0 2rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
}
.rechner-header h1 {
  font-size: clamp(1.3rem, 3vw, 1.9rem);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}
.rechner-header .intro {
  color: var(--color-text-muted);
  max-width: 680px;
  line-height: 1.65;
}
.rechner-form-card {
  background: var(--color-card);
  border: 1.5px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.75rem;
}
.rechner-result {
  margin-top: 1.5rem;
}
.rechner-cta-box {
  background: var(--color-primary-light);
  border: 1.5px solid var(--color-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
}
.rechner-cta-box__title {
  font-weight: 700;
  margin-bottom: 0.4rem;
}
.rechner-cta-box__sub {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

/* ---- FAQ ---- */
.faq-section { margin-top: 3rem; }
.faq-section h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}
.faq-section details {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
}
.faq-section details[open] { border-color: var(--color-primary); }
.faq-section summary {
  font-weight: 600;
  cursor: pointer;
  font-size: var(--text-sm);
  list-style: none;
}
.faq-section summary::before { content: '+ '; color: var(--color-primary); }
.faq-section details[open] summary::before { content: '− '; }
.faq-section details p {
  margin-top: 0.75rem;
  margin-bottom: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.65;
}

/* ---- Shared Footer ---- */
.fordify-footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 2rem 0;
  margin-top: 4rem;
}
.fordify-footer a { color: var(--color-text-muted); text-decoration: none; font-size: var(--text-sm); }
.fordify-footer a:hover { color: var(--color-primary); }

/* ---- Utility ---- */
.font-mono { font-family: var(--font-mono); }
```

- [ ] **Schritt 2: Commit**

```bash
git add frontend/css/rechner.css
git commit -m "feat: rechner.css – Styles für Homepage und Rechner-Seiten"
```

---

### Task 3: App umbenennen zu forderungsaufstellung.html

**Files:**
- Umbenennen: `frontend/index.html` → `frontend/forderungsaufstellung.html`
- Ändern: Zeilen mit `og:url` und Canonical in der umbenannten Datei

- [ ] **Schritt 1: Datei umbenennen**

```bash
git mv frontend/index.html frontend/forderungsaufstellung.html
```

- [ ] **Schritt 2: og:url und Canonical aktualisieren**

In `frontend/forderungsaufstellung.html` Zeile 12 ändern:
```html
<meta property="og:url" content="https://fordify.de/forderungsaufstellung">
```

Direkt nach Zeile 12 einfügen:
```html
<link rel="canonical" href="https://fordify.de/forderungsaufstellung">
```

- [ ] **Schritt 3: Titel anpassen**

Zeile 6 (title-Tag):
```html
<title>fordify – Forderungsaufstellung erstellen | § 367 BGB</title>
```

- [ ] **Schritt 4: Commit**

```bash
git add frontend/forderungsaufstellung.html
git commit -m "feat: App zu /forderungsaufstellung umgezogen (index.html → forderungsaufstellung.html)"
```

---

### Task 4: Homepage erstellen

**Files:**
- Erstellen: `frontend/index.html`

- [ ] **Schritt 1: Homepage erstellen**

`frontend/index.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>fordify – Forderungsaufstellung & Rechner für Anwaltskanzleien</title>
  <meta name="description" content="Professionelle Forderungsaufstellungen nach § 367 BGB, Verzugszinsrechner, RVG-Rechner und Gerichtskostenrechner – kostenlos, browserbasiert, DSGVO-konform.">
  <link rel="canonical" href="https://fordify.de/">
  <meta property="og:title" content="fordify – Forderungsaufstellung & Rechner für Anwaltskanzleien">
  <meta property="og:description" content="Professionelle Forderungsaufstellungen nach § 367 BGB, Verzugszinsrechner, RVG-Rechner und Gerichtskostenrechner – kostenlos, browserbasiert, DSGVO-konform.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fordify.de/">
  <meta property="og:image" content="https://fordify.de/img/og-image.png">
  <meta name="theme-color" content="#1e3a8a">
  <link rel="icon" type="image/svg+xml" href="img/logo.svg">
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" href="css/rechner.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "fordify",
    "url": "https://fordify.de",
    "description": "Professionelle Forderungsaufstellungen und Rechner für Anwaltskanzleien",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fordify.de/forderungsaufstellung"
    }
  }
  </script>
</head>
<body>

<nav class="navbar navbar-expand-md" style="background:var(--color-nav-bg)">
  <div class="container">
    <a class="navbar-brand fw-bold" style="color:var(--color-nav-text)" href="/">fordify</a>
    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Navigation öffnen">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav me-auto gap-1">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" style="color:var(--color-nav-text-muted)" href="#" data-bs-toggle="dropdown" aria-expanded="false">Rechner</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/zinsrechner">Verzugszinsrechner</a></li>
            <li><a class="dropdown-item" href="/rvg-rechner">RVG-Rechner</a></li>
            <li><a class="dropdown-item" href="/gerichtskostenrechner">Gerichtskostenrechner</a></li>
          </ul>
        </li>
      </ul>
      <a href="/forderungsaufstellung" class="btn btn-sm btn-light fw-semibold">
        Forderungsaufstellung <span class="badge bg-warning text-dark ms-1 fw-normal">Beta</span>
      </a>
    </div>
  </div>
</nav>

<section class="fordify-hero">
  <div class="container">
    <h1>Forderungsaufstellungen &amp; Rechner<br>für Anwaltskanzleien</h1>
    <p class="lead mb-4">Rechtssichere Forderungsaufstellungen nach § 367 BGB, Verzugszinsberechnung, RVG-Gebühren und Gerichtskosten – kostenlos, direkt im Browser, DSGVO-konform.</p>
    <a href="/forderungsaufstellung" class="btn btn-light btn-lg fw-semibold">
      Zur Forderungsaufstellung <span class="badge bg-warning text-dark ms-2 fw-normal">Beta</span>
    </a>
  </div>
</section>

<main class="container">
  <div class="tool-grid">
    <a href="/forderungsaufstellung" class="tool-card tool-card--primary">
      <div class="tool-card__icon">§</div>
      <div class="tool-card__title">Forderungsaufstellung</div>
      <p class="tool-card__desc">Vollständige Forderungsaufstellung nach § 367 BGB mit Zinsen, RVG-Gebühren, Zahlungsverrechnung und PDF-Export.</p>
      <span class="tool-card__cta">Jetzt erstellen →</span>
    </a>
    <a href="/zinsrechner" class="tool-card">
      <div class="tool-card__icon">%</div>
      <div class="tool-card__title">Verzugszinsrechner</div>
      <p class="tool-card__desc">Verzugszinsen nach § 288 BGB berechnen – aktueller Basiszinssatz, B2B und B2C, tagesgenaue Periodenaufstellung.</p>
      <span class="tool-card__cta">Zinsen berechnen →</span>
    </a>
    <a href="/rvg-rechner" class="tool-card">
      <div class="tool-card__icon">⚖</div>
      <div class="tool-card__title">RVG-Rechner</div>
      <p class="tool-card__desc">Anwaltsgebühren nach RVG 2025 berechnen – Geschäftsgebühr, Verfahrensgebühr, Auslagenpauschale und Umsatzsteuer.</p>
      <span class="tool-card__cta">Gebühren berechnen →</span>
    </a>
    <a href="/gerichtskostenrechner" class="tool-card">
      <div class="tool-card__icon">🏛</div>
      <div class="tool-card__title">Gerichtskostenrechner</div>
      <p class="tool-card__desc">Gerichtsgebühren nach GKG berechnen – Amtsgericht, Landgericht, OLG und BGH, alle Instanzen.</p>
      <span class="tool-card__cta">Kosten berechnen →</span>
    </a>
  </div>

  <div class="row g-0 my-4 py-4 border-top border-bottom">
    <div class="col-md-4 vorteil-item">
      <span class="vorteil-item__icon">🌐</span>
      <div class="vorteil-item__title">Browserbasiert</div>
      <p class="text-muted small">Keine Installation, keine App – läuft auf jedem Gerät direkt im Browser.</p>
    </div>
    <div class="col-md-4 vorteil-item">
      <span class="vorteil-item__icon">📅</span>
      <div class="vorteil-item__title">Immer aktuell</div>
      <p class="text-muted small">RVG 2025, aktuelle Basiszinssätze (bis 07/2026), GKG Anlage 2.</p>
    </div>
    <div class="col-md-4 vorteil-item">
      <span class="vorteil-item__icon">🔒</span>
      <div class="vorteil-item__title">DSGVO-konform</div>
      <p class="text-muted small">Alle Daten bleiben im Browser – kein Server, keine Cloud, keine Weitergabe.</p>
    </div>
  </div>
</main>

<section class="seo-text-block">
  <div class="container">
    <div class="row">
      <div class="col-lg-8">
        <h2>Forderungsaufstellung nach § 367 BGB</h2>
        <p>Eine rechtssichere Forderungsaufstellung zeigt, wie Zahlungseingänge auf eine offene Forderung verrechnet werden. § 367 BGB schreibt die Reihenfolge zwingend vor: zuerst die Kosten, dann die Zinsen, zuletzt die Hauptforderung. fordify berechnet diese Verrechnung automatisch und erstellt ein druckfertiges, professionelles Dokument für Anwaltskanzleien und Unternehmen.</p>

        <h2>Verzugszinsen nach § 288 BGB berechnen</h2>
        <p>Gerät ein Schuldner in Verzug, entstehen automatisch Verzugszinsen. Der gesetzliche Zinssatz beträgt bei Forderungen zwischen Unternehmen (B2B) Basiszinssatz + 9 Prozentpunkte, bei Verbraucher-Forderungen (B2C) Basiszinssatz + 5 Prozentpunkte. Der Basiszinssatz wird von der Deutschen Bundesbank halbjährlich zum 1. Januar und 1. Juli festgesetzt. Der Verzugszinsrechner von fordify verwendet stets den aktuellen Basiszinssatz und berechnet tagesgenaue Zinsen für jeden Abrechnungszeitraum.</p>

        <h2>Anwaltskosten nach RVG berechnen</h2>
        <p>Anwaltsgebühren richten sich nach dem Rechtsanwaltsvergütungsgesetz (RVG). Grundlage ist der Gegenstandswert (Streitwert), aus dem die einfache Gebühr nach der RVG-Gebührentabelle (Anlage 2 zu § 13 RVG) ermittelt wird. Der RVG-Rechner von fordify verwendet die aktuelle Tabelle aus dem BGBl. 2025 I Nr. 109 und berechnet Geschäftsgebühr (VV 2300), Verfahrensgebühr (VV 3100, VV 3309) und Auslagenpauschale (VV 7002) inklusive Umsatzsteuer.</p>

        <h2>Gerichtskosten nach GKG berechnen</h2>
        <p>Die Gerichtsgebühren in Zivilsachen richten sich nach dem Gerichtskostengesetz (GKG). Ausgehend vom Streitwert und der Instanz – Amtsgericht (3 Gebühren), Landgericht (3 Gebühren), Oberlandesgericht (4 Gebühren), Bundesgerichtshof (5 Gebühren) – berechnet der Gerichtskostenrechner die anfallenden Gerichtsgebühren auf Basis der GKG Anlage 2.</p>

        <h2>fordify – Das Tool für Anwaltskanzleien</h2>
        <p>fordify kombiniert alle Berechnungen in einem einzigen, professionellen Workflow. Die Anwendung läuft vollständig im Browser: keine Installation, keine Registrierung, keine Datenweitergabe. Alle eingegebenen Daten bleiben ausschließlich auf dem Gerät des Nutzers. fordify ist DSGVO-konform konzipiert und richtet sich an Anwaltskanzleien, Inkassounternehmen und Unternehmen mit aktivem Forderungsmanagement.</p>
      </div>
    </div>
  </div>
</section>

<footer class="fordify-footer">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-4 mb-2 mb-md-0">
        <span class="fw-bold" style="color:var(--color-primary)">fordify</span>
        <span class="text-muted ms-2" style="font-size:var(--text-sm)">Professionelle Forderungsberechnungen</span>
      </div>
      <div class="col-md-4 text-md-center mb-2 mb-md-0">
        <a href="/zinsrechner" class="me-3">Zinsrechner</a>
        <a href="/rvg-rechner" class="me-3">RVG-Rechner</a>
        <a href="/gerichtskostenrechner">Gerichtskostenrechner</a>
      </div>
      <div class="col-md-4 text-md-end">
        <a href="/impressum.html" class="me-3">Impressum</a>
        <a href="/datenschutz.html">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>

<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

- [ ] **Schritt 2: Im Browser prüfen**

`staging.fordify.de` öffnen (nach Deploy). Prüfen:
- Tool-Grid zeigt 4 Karten
- Navbar-Dropdown "Rechner" klappt auf
- Button "Forderungsaufstellung" führt zu `/forderungsaufstellung`
- Seite lädt ohne JS-Fehler

- [ ] **Schritt 3: Commit**

```bash
git add frontend/index.html
git commit -m "feat: Homepage als SEO-Hub mit Tool-Grid, Vorteile und SEO-Textblock"
```

---

### Task 5: rechner-zins.js + zinsrechner.html

**Files:**
- Erstellen: `frontend/js/rechner-zins.js`
- Erstellen: `frontend/zinsrechner.html`

- [ ] **Schritt 1: rechner-zins.js erstellen**

`frontend/js/rechner-zins.js`:
```javascript
(function () {
  'use strict';

  // Heutiges Datum als Standard für "Bis"
  const heute = new Date();
  const heuteStr = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
  document.getElementById('zins-bis').value = heuteStr;

  document.getElementById('form-zins').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  function berechne() {
    const betrag = document.getElementById('zins-betrag').value.replace(',', '.');
    const von    = parseDate(document.getElementById('zins-von').value);
    const bis    = parseDate(document.getElementById('zins-bis').value);
    const typ    = document.getElementById('zins-typ').value; // 'b2b' | 'b2c'
    const aufschlagPP = typ === 'b2b' ? 9 : 5;

    const ergebnisEl = document.getElementById('zins-ergebnis');
    try {
      const perioden = berechneVerzugszinsen(betrag, von, bis, aufschlagPP, BASISZINSSAETZE);
      ergebnisEl.innerHTML = renderPerioden(perioden);
    } catch (err) {
      ergebnisEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  }

  function renderPerioden(perioden) {
    if (perioden.length === 0) {
      return '<div class="alert alert-info">Kein Zinszeitraum – Enddatum liegt vor oder am Beginndatum.</div>';
    }
    let gesamt = new Decimal(0);
    let rows = '';
    for (const p of perioden) {
      gesamt = gesamt.plus(p.zinsbetrag);
      rows += `<tr>
        <td>${formatDate(p.von)} – ${formatDate(p.bis)}</td>
        <td class="text-end">${p.tage}</td>
        <td class="text-end">${p.basiszinssatz.toFixed(2)} % + ${p.aufschlag} PP = ${p.zinssatz.toFixed(2)} %</td>
        <td class="text-end font-mono">${p.zinsbetrag.toFixed(2)} €</td>
      </tr>`;
    }
    return `
      <div class="rechner-result">
        <table class="table table-sm table-bordered mb-0">
          <thead class="table-primary">
            <tr>
              <th>Zeitraum</th>
              <th class="text-end">Tage</th>
              <th class="text-end">Zinssatz</th>
              <th class="text-end">Zinsbetrag</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot class="fw-bold">
            <tr>
              <td colspan="3">Gesamte Verzugszinsen</td>
              <td class="text-end font-mono">${gesamt.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="rechner-cta-box mt-3">
        <div class="rechner-cta-box__title">Vollständige Forderungsaufstellung nach § 367 BGB</div>
        <div class="rechner-cta-box__sub">Zinsen, RVG-Gebühren, Zahlungsverrechnung – alles in einem professionellen Dokument.</div>
        <a href="/forderungsaufstellung" class="btn btn-primary btn-sm">Zur Forderungsaufstellung →</a>
      </div>`;
  }
})();
```

- [ ] **Schritt 2: zinsrechner.html erstellen**

`frontend/zinsrechner.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verzugszinsrechner kostenlos – § 288 BGB | fordify</title>
  <meta name="description" content="Verzugszinsen nach § 288 BGB kostenlos berechnen. Aktueller Basiszinssatz, B2B (9 PP) und B2C (5 PP), tagesgenaue Periodenaufstellung. Kein Login erforderlich.">
  <link rel="canonical" href="https://fordify.de/zinsrechner">
  <meta property="og:title" content="Verzugszinsrechner kostenlos – § 288 BGB | fordify">
  <meta property="og:description" content="Verzugszinsen nach § 288 BGB kostenlos berechnen. Aktueller Basiszinssatz, B2B und B2C.">
  <meta property="og:url" content="https://fordify.de/zinsrechner">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#1e3a8a">
  <link rel="icon" type="image/svg+xml" href="img/logo.svg">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" href="css/rechner.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Verzugszinsrechner",
    "url": "https://fordify.de/zinsrechner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "description": "Verzugszinsen nach § 288 BGB kostenlos berechnen"
  }
  </script>
</head>
<body>

<nav class="navbar navbar-expand-md" style="background:var(--color-nav-bg)">
  <div class="container">
    <a class="navbar-brand fw-bold" style="color:var(--color-nav-text)" href="/">fordify</a>
    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Navigation öffnen">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav me-auto gap-1">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" style="color:var(--color-nav-text-muted)" href="#" data-bs-toggle="dropdown">Rechner</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item fw-semibold" href="/zinsrechner">Verzugszinsrechner</a></li>
            <li><a class="dropdown-item" href="/rvg-rechner">RVG-Rechner</a></li>
            <li><a class="dropdown-item" href="/gerichtskostenrechner">Gerichtskostenrechner</a></li>
          </ul>
        </li>
      </ul>
      <a href="/forderungsaufstellung" class="btn btn-sm btn-light fw-semibold">
        Forderungsaufstellung <span class="badge bg-warning text-dark ms-1 fw-normal">Beta</span>
      </a>
    </div>
  </div>
</nav>

<main class="container">
  <header class="rechner-header">
    <h1>Verzugszinsrechner – kostenlos &amp; aktuell (§ 288 BGB)</h1>
    <p class="intro">Berechnen Sie Verzugszinsen nach § 288 BGB tagesgenau – mit aktuellem Basiszinssatz der Deutschen Bundesbank. Für B2B-Forderungen gilt Basiszinssatz + 9 Prozentpunkte, für Verbraucherforderungen Basiszinssatz + 5 Prozentpunkte. Das Ergebnis wird nach Basiszinssatz-Perioden (01.01. und 01.07.) aufgeteilt.</p>
  </header>

  <div class="row g-4">
    <div class="col-lg-5">
      <div class="rechner-form-card">
        <form id="form-zins" novalidate>
          <div class="mb-3">
            <label for="zins-betrag" class="form-label fw-semibold">Hauptforderung (€)</label>
            <input type="text" class="form-control" id="zins-betrag" placeholder="z. B. 5000,00" required>
          </div>
          <div class="mb-3">
            <label for="zins-von" class="form-label fw-semibold">Zinsbeginn</label>
            <input type="date" class="form-control" id="zins-von" required>
          </div>
          <div class="mb-3">
            <label for="zins-bis" class="form-label fw-semibold">Zinsende</label>
            <input type="date" class="form-control" id="zins-bis" required>
          </div>
          <div class="mb-4">
            <label for="zins-typ" class="form-label fw-semibold">Schuldner-Typ</label>
            <select class="form-select" id="zins-typ">
              <option value="b2b">Unternehmen (B2B) – Basiszinssatz + 9 PP</option>
              <option value="b2c">Verbraucher (B2C) – Basiszinssatz + 5 PP</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary w-100">Zinsen berechnen</button>
        </form>
      </div>
    </div>
    <div class="col-lg-7">
      <div id="zins-ergebnis"></div>
    </div>
  </div>

  <section class="faq-section">
    <h2>Häufige Fragen zum Verzugszinsrechner</h2>
    <details>
      <summary>Wie werden Verzugszinsen nach § 288 BGB berechnet?</summary>
      <p>Verzugszinsen berechnen sich als Jahresprozentsatz auf den offenen Forderungsbetrag: Betrag × Zinssatz × Tage ÷ 365. Der Zinssatz setzt sich zusammen aus dem Basiszinssatz nach § 247 BGB zuzüglich des gesetzlichen Aufschlags (9 PP bei B2B, 5 PP bei B2C). Da der Basiszinssatz halbjährlich wechselt, wird der Zeitraum an den Wechselgrenzen (01.01. und 01.07.) aufgeteilt.</p>
    </details>
    <details>
      <summary>Was ist der aktuelle Basiszinssatz?</summary>
      <p>Der Basiszinssatz wird von der Deutschen Bundesbank gemäß § 247 BGB zum 1. Januar und 1. Juli eines jeden Jahres neu festgesetzt. Seit dem 01.01.2026 beträgt er 1,27 %. fordify verwendet stets den aktuellen Basiszinssatz und ist bis zum 01.07.2026 aktuell gepflegt.</p>
    </details>
    <details>
      <summary>Ab wann laufen Verzugszinsen?</summary>
      <p>Verzugszinsen entstehen ab dem Zeitpunkt des Verzugseintritts. Bei einer Rechnung mit Fälligkeitsdatum tritt Verzug am nächsten Tag nach Ablauf der Zahlungsfrist ein. Bei Mahnungen tritt Verzug mit Zugang der Mahnung ein. Ohne Fälligkeitsvereinbarung beginnt der Verzug bei Verbrauchern erst nach einer Mahnung, bei Unternehmern ggf. bereits 30 Tage nach Fälligkeit und Zugang der Rechnung (§ 286 Abs. 3 BGB).</p>
    </details>
    <details>
      <summary>Was ist der Unterschied zwischen B2B und B2C?</summary>
      <p>Bei Forderungen zwischen Unternehmern (B2B) beträgt der Aufschlag auf den Basiszinssatz 9 Prozentpunkte (§ 288 Abs. 2 BGB). Bei Forderungen gegen Verbraucher (B2C) beträgt der Aufschlag nur 5 Prozentpunkte (§ 288 Abs. 1 BGB). Unternehmer im Sinne des BGB ist, wer in Ausübung einer gewerblichen oder selbständigen beruflichen Tätigkeit handelt.</p>
    </details>
    <details>
      <summary>Wann verjähren Zinsansprüche?</summary>
      <p>Zinsansprüche verjähren gemäß § 197 Abs. 2 BGB in der regelmäßigen Verjährungsfrist von 3 Jahren (§ 195 BGB), beginnend am Ende des Jahres, in dem der Anspruch entstanden ist. Bei titulierten Zinsen gilt die 30-jährige Verjährungsfrist des § 197 Abs. 1 Nr. 3 BGB. fordify weist in der Forderungsaufstellung auf drohende Verjährung hin.</p>
    </details>
  </section>
</main>

<footer class="fordify-footer">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-4 mb-2 mb-md-0">
        <span class="fw-bold" style="color:var(--color-primary)">fordify</span>
        <span class="text-muted ms-2" style="font-size:var(--text-sm)">Professionelle Forderungsberechnungen</span>
      </div>
      <div class="col-md-4 text-md-center mb-2 mb-md-0">
        <a href="/zinsrechner" class="me-3">Zinsrechner</a>
        <a href="/rvg-rechner" class="me-3">RVG-Rechner</a>
        <a href="/gerichtskostenrechner">Gerichtskostenrechner</a>
      </div>
      <div class="col-md-4 text-md-end">
        <a href="/impressum.html" class="me-3">Impressum</a>
        <a href="/datenschutz.html">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>

<script src="js/decimal.min.js"></script>
<script src="js/config.js"></script>
<script src="js/data.js"></script>
<script src="js/zinsen.js"></script>
<script src="js/rechner-zins.js"></script>
</body>
</html>
```

- [ ] **Schritt 3: Commit**

```bash
git add frontend/zinsrechner.html frontend/js/rechner-zins.js
git commit -m "feat: Verzugszinsrechner (/zinsrechner) mit § 288 BGB Berechnung und FAQ"
```

---

### Task 6: rechner-rvg.js + rvg-rechner.html

**Files:**
- Erstellen: `frontend/js/rechner-rvg.js`
- Erstellen: `frontend/rvg-rechner.html`

- [ ] **Schritt 1: rechner-rvg.js erstellen**

`frontend/js/rechner-rvg.js`:
```javascript
(function () {
  'use strict';

  document.getElementById('form-rvg').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  const VV_MAP = {
    'aussergerichtlich': ['2300', '7002'],
    'mahnverfahren':     ['3309', '7002'],
    'klage':             ['3100', '7002'],
  };

  function berechne() {
    const streitwert = document.getElementById('rvg-streitwert').value.replace(',', '.');
    const verfahren  = document.getElementById('rvg-verfahren').value;
    const ustSatz    = parseFloat(document.getElementById('rvg-ust').value) / 100;
    const vvNummern  = VV_MAP[verfahren] || ['2300', '7002'];
    const ergebnisEl = document.getElementById('rvg-ergebnis');

    try {
      const { positionen, netto } = berechneRVGGesamt(
        streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN
      );
      const nettoD  = new Decimal(netto);
      const ustD    = nettoD.times(ustSatz).toDecimalPlaces(2);
      const gesamtD = nettoD.plus(ustD);
      ergebnisEl.innerHTML = renderErgebnis(positionen, nettoD, ustD, gesamtD, Math.round(ustSatz * 100));
    } catch (err) {
      ergebnisEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  }

  function renderErgebnis(positionen, netto, ust, gesamt, ustProzent) {
    let rows = '';
    for (const p of positionen) {
      rows += `<tr>
        <td>VV ${p.vvNummer}</td>
        <td>${p.beschreibung}</td>
        <td class="text-end">${p.faktor !== null ? p.faktor.toFixed(1) : '–'}</td>
        <td class="text-end font-mono">${p.gebuehrGesamt.toFixed(2)} €</td>
      </tr>`;
    }
    return `
      <div class="rechner-result">
        <table class="table table-sm table-bordered mb-0">
          <thead class="table-primary">
            <tr><th>VV-Nr.</th><th>Position</th><th class="text-end">Faktor</th><th class="text-end">Betrag</th></tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr><td colspan="3">Netto</td><td class="text-end font-mono">${netto.toFixed(2)} €</td></tr>
            <tr><td colspan="3">Umsatzsteuer (${ustProzent} %)</td><td class="text-end font-mono">${ust.toFixed(2)} €</td></tr>
            <tr class="fw-bold table-primary"><td colspan="3">Gesamt</td><td class="text-end font-mono">${gesamt.toFixed(2)} €</td></tr>
          </tfoot>
        </table>
      </div>
      <div class="rechner-cta-box mt-3">
        <div class="rechner-cta-box__title">RVG-Gebühren direkt in die Forderungsaufstellung übernehmen</div>
        <div class="rechner-cta-box__sub">In der Forderungsaufstellung werden RVG-Positionen nach § 367 BGB verrechnet.</div>
        <a href="/forderungsaufstellung" class="btn btn-primary btn-sm">Zur Forderungsaufstellung →</a>
      </div>`;
  }
})();
```

- [ ] **Schritt 2: rvg-rechner.html erstellen**

`frontend/rvg-rechner.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RVG-Rechner kostenlos – Anwaltskosten berechnen 2025 | fordify</title>
  <meta name="description" content="Anwaltsgebühren nach RVG 2025 kostenlos berechnen. Geschäftsgebühr, Verfahrensgebühr, Auslagenpauschale und Umsatzsteuer – aktuell nach BGBl. 2025 I Nr. 109.">
  <link rel="canonical" href="https://fordify.de/rvg-rechner">
  <meta property="og:title" content="RVG-Rechner kostenlos – Anwaltskosten berechnen 2025 | fordify">
  <meta property="og:description" content="Anwaltsgebühren nach RVG 2025 kostenlos berechnen. Geschäftsgebühr, Verfahrensgebühr, Auslagenpauschale.">
  <meta property="og:url" content="https://fordify.de/rvg-rechner">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#1e3a8a">
  <link rel="icon" type="image/svg+xml" href="img/logo.svg">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" href="css/rechner.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RVG-Rechner",
    "url": "https://fordify.de/rvg-rechner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "description": "Anwaltsgebühren nach RVG 2025 kostenlos berechnen"
  }
  </script>
</head>
<body>

<nav class="navbar navbar-expand-md" style="background:var(--color-nav-bg)">
  <div class="container">
    <a class="navbar-brand fw-bold" style="color:var(--color-nav-text)" href="/">fordify</a>
    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Navigation öffnen">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav me-auto gap-1">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" style="color:var(--color-nav-text-muted)" href="#" data-bs-toggle="dropdown">Rechner</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/zinsrechner">Verzugszinsrechner</a></li>
            <li><a class="dropdown-item fw-semibold" href="/rvg-rechner">RVG-Rechner</a></li>
            <li><a class="dropdown-item" href="/gerichtskostenrechner">Gerichtskostenrechner</a></li>
          </ul>
        </li>
      </ul>
      <a href="/forderungsaufstellung" class="btn btn-sm btn-light fw-semibold">
        Forderungsaufstellung <span class="badge bg-warning text-dark ms-1 fw-normal">Beta</span>
      </a>
    </div>
  </div>
</nav>

<main class="container">
  <header class="rechner-header">
    <h1>RVG-Rechner – Anwaltskosten berechnen (Rechtsanwaltsvergütungsgesetz 2025)</h1>
    <p class="intro">Berechnen Sie Anwaltsgebühren nach dem aktuellen RVG (BGBl. 2025 I Nr. 109) kostenlos und ohne Registrierung. Wählen Sie Streitwert, Verfahrensart und Umsatzsteuersatz – das Ergebnis zeigt alle Positionen einzeln.</p>
  </header>

  <div class="row g-4">
    <div class="col-lg-5">
      <div class="rechner-form-card">
        <form id="form-rvg" novalidate>
          <div class="mb-3">
            <label for="rvg-streitwert" class="form-label fw-semibold">Gegenstandswert / Streitwert (€)</label>
            <input type="text" class="form-control" id="rvg-streitwert" placeholder="z. B. 10000" required>
          </div>
          <div class="mb-3">
            <label for="rvg-verfahren" class="form-label fw-semibold">Verfahrensart</label>
            <select class="form-select" id="rvg-verfahren">
              <option value="aussergerichtlich">Außergerichtlich (VV 2300)</option>
              <option value="mahnverfahren">Mahnverfahren (VV 3309)</option>
              <option value="klage">Klageverfahren (VV 3100)</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="rvg-ust" class="form-label fw-semibold">Umsatzsteuer</label>
            <select class="form-select" id="rvg-ust">
              <option value="19">19 % (Regelsteuersatz)</option>
              <option value="0">0 % (steuerbefreit)</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary w-100">Gebühren berechnen</button>
        </form>
      </div>
    </div>
    <div class="col-lg-7">
      <div id="rvg-ergebnis"></div>
    </div>
  </div>

  <section class="faq-section">
    <h2>Häufige Fragen zum RVG-Rechner</h2>
    <details>
      <summary>Wie werden Anwaltsgebühren nach RVG berechnet?</summary>
      <p>Grundlage ist der Gegenstandswert (Streitwert). Aus der RVG-Gebührentabelle (Anlage 2 zu § 13 RVG) wird die einfache Gebühr ermittelt. Diese wird mit dem jeweiligen Gebührenfaktor multipliziert: Bei der Geschäftsgebühr (VV 2300) beträgt der Regelgebührensatz 1,3. Hinzu kommen Auslagen (VV 7002: 20 % der Nettogebühren, max. 20 €) und Umsatzsteuer.</p>
    </details>
    <details>
      <summary>Was ist der Unterschied zwischen VV 2300, VV 3309 und VV 3100?</summary>
      <p>VV 2300 ist die Geschäftsgebühr für außergerichtliche Tätigkeiten (z. B. Mahnung, Verhandlung ohne Klage). VV 3309 ist die Verfahrensgebühr im Mahnverfahren (Faktor 0,5). VV 3100 ist die Verfahrensgebühr im gerichtlichen Klageverfahren (Faktor 1,3). Im Klageverfahren entstehen zusätzlich Termins- und ggf. Einigungsgebühren, die dieser Rechner der Einfachheit halber nicht automatisch hinzufügt.</p>
    </details>
    <details>
      <summary>Wer zahlt die Anwaltskosten?</summary>
      <p>Im gerichtlichen Verfahren trägt grundsätzlich die unterlegene Partei die Kosten (§ 91 ZPO). Bei außergerichtlichen Tätigkeiten trägt jede Partei zunächst ihre eigenen Kosten; der Schuldner kann bei Verzug zur Übernahme der Anwaltskosten des Gläubigers verpflichtet sein (§ 280 Abs. 1, 2 BGB i.V.m. § 286 BGB).</p>
    </details>
    <details>
      <summary>Was ist der Gegenstandswert (Streitwert)?</summary>
      <p>Der Gegenstandswert entspricht dem wirtschaftlichen Wert der Angelegenheit – in der Regel dem Betrag der geltend gemachten Forderung ohne Zinsen und Kosten. Bei Klagen wird er vom Gericht festgesetzt (§ 3 ZPO). Der Gegenstandswert für die außergerichtliche Tätigkeit kann davon abweichen.</p>
    </details>
    <details>
      <summary>Gilt dieses RVG für 2025?</summary>
      <p>Ja. fordify verwendet die aktuelle RVG-Gebührentabelle aus dem Bundesgesetzblatt 2025 I Nr. 109, gültig seit der letzten RVG-Reform. Die Tabellenwerte wurden zum 31.03.2026 verifiziert.</p>
    </details>
  </section>
</main>

<footer class="fordify-footer">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-4 mb-2 mb-md-0">
        <span class="fw-bold" style="color:var(--color-primary)">fordify</span>
        <span class="text-muted ms-2" style="font-size:var(--text-sm)">Professionelle Forderungsberechnungen</span>
      </div>
      <div class="col-md-4 text-md-center mb-2 mb-md-0">
        <a href="/zinsrechner" class="me-3">Zinsrechner</a>
        <a href="/rvg-rechner" class="me-3">RVG-Rechner</a>
        <a href="/gerichtskostenrechner">Gerichtskostenrechner</a>
      </div>
      <div class="col-md-4 text-md-end">
        <a href="/impressum.html" class="me-3">Impressum</a>
        <a href="/datenschutz.html">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>

<script src="js/decimal.min.js"></script>
<script src="js/config.js"></script>
<script src="js/data.js"></script>
<script src="js/rvg.js"></script>
<script src="js/rechner-rvg.js"></script>
</body>
</html>
```

- [ ] **Schritt 3: Commit**

```bash
git add frontend/rvg-rechner.html frontend/js/rechner-rvg.js
git commit -m "feat: RVG-Rechner (/rvg-rechner) mit Gebührentabelle 2025 und FAQ"
```

---

### Task 7: rechner-gkg.js + gerichtskostenrechner.html

**Files:**
- Erstellen: `frontend/js/rechner-gkg.js`
- Erstellen: `frontend/gerichtskostenrechner.html`

- [ ] **Schritt 1: rechner-gkg.js erstellen**

`frontend/js/rechner-gkg.js`:
```javascript
(function () {
  'use strict';

  document.getElementById('form-gkg').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  function gebuehrAusGKGTabelle(streitwert) {
    for (const zeile of GKG_TABELLE) {
      if (streitwert <= zeile.bis) return zeile.gebuehr;
    }
    const letzte = GKG_TABELLE[GKG_TABELLE.length - 1];
    const stufen = Math.ceil((streitwert - letzte.bis) / 10000);
    return letzte.gebuehr + stufen * 10;
  }

  const MULTIPLIKATOREN = { ag: 3.0, lg: 3.0, olg: 4.0, bgh: 5.0 };
  const INSTANZ_LABEL   = { ag: 'Amtsgericht', lg: 'Landgericht', olg: 'Oberlandesgericht', bgh: 'Bundesgerichtshof' };

  function berechne() {
    const streitwert  = parseFloat(document.getElementById('gkg-streitwert').value.replace(',', '.'));
    const instanz     = document.getElementById('gkg-instanz').value;
    const mult        = MULTIPLIKATOREN[instanz];
    const einfach     = gebuehrAusGKGTabelle(streitwert);
    const gerichtskosten = einfach * mult;
    const ergebnisEl  = document.getElementById('gkg-ergebnis');
    ergebnisEl.innerHTML = renderErgebnis(streitwert, instanz, einfach, mult, gerichtskosten);
  }

  function fmt(n) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderErgebnis(streitwert, instanz, einfach, mult, gesamt) {
    return `
      <div class="rechner-result">
        <table class="table table-sm table-bordered mb-0">
          <tbody>
            <tr><td>Streitwert</td><td class="text-end font-mono">${fmt(streitwert)} €</td></tr>
            <tr><td>Instanz</td><td class="text-end">${INSTANZ_LABEL[instanz]}</td></tr>
            <tr><td>Einfache Gebühr (§ 34 GKG, Anlage 2)</td><td class="text-end font-mono">${fmt(einfach)} €</td></tr>
            <tr><td>Gebührenanzahl</td><td class="text-end">${mult.toFixed(1)}</td></tr>
            <tr class="fw-bold table-primary"><td>Gerichtskosten gesamt</td><td class="text-end font-mono">${fmt(gesamt)} €</td></tr>
          </tbody>
        </table>
        <div class="alert alert-info small mt-2 mb-0">
          <strong>Hinweis:</strong> Dies sind nur die Gerichtsgebühren. Anwaltskosten beider Parteien und sonstige Auslagen (Zeugenentschädigung, Sachverständigengebühren) sind nicht enthalten.
        </div>
      </div>
      <div class="rechner-cta-box mt-3">
        <div class="rechner-cta-box__title">Gerichtskosten in die Forderungsaufstellung aufnehmen</div>
        <div class="rechner-cta-box__sub">In der Forderungsaufstellung können titulierte Gerichtskosten und RVG-Positionen nach § 367 BGB verrechnet werden.</div>
        <a href="/forderungsaufstellung" class="btn btn-primary btn-sm">Zur Forderungsaufstellung →</a>
      </div>`;
  }
})();
```

- [ ] **Schritt 2: gerichtskostenrechner.html erstellen**

`frontend/gerichtskostenrechner.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerichtskostenrechner kostenlos – Prozesskosten berechnen (GKG) | fordify</title>
  <meta name="description" content="Gerichtskosten und Prozesskosten kostenlos berechnen. Alle Instanzen (AG, LG, OLG, BGH), aktuell nach GKG Anlage 2. Kein Login erforderlich.">
  <link rel="canonical" href="https://fordify.de/gerichtskostenrechner">
  <meta property="og:title" content="Gerichtskostenrechner kostenlos – Prozesskosten berechnen | fordify">
  <meta property="og:description" content="Gerichtskosten kostenlos berechnen. AG, LG, OLG, BGH – aktuell nach GKG.">
  <meta property="og:url" content="https://fordify.de/gerichtskostenrechner">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#1e3a8a">
  <link rel="icon" type="image/svg+xml" href="img/logo.svg">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" href="css/rechner.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Gerichtskostenrechner",
    "url": "https://fordify.de/gerichtskostenrechner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "description": "Gerichtskosten nach GKG kostenlos berechnen"
  }
  </script>
</head>
<body>

<nav class="navbar navbar-expand-md" style="background:var(--color-nav-bg)">
  <div class="container">
    <a class="navbar-brand fw-bold" style="color:var(--color-nav-text)" href="/">fordify</a>
    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Navigation öffnen">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav me-auto gap-1">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" style="color:var(--color-nav-text-muted)" href="#" data-bs-toggle="dropdown">Rechner</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/zinsrechner">Verzugszinsrechner</a></li>
            <li><a class="dropdown-item" href="/rvg-rechner">RVG-Rechner</a></li>
            <li><a class="dropdown-item fw-semibold" href="/gerichtskostenrechner">Gerichtskostenrechner</a></li>
          </ul>
        </li>
      </ul>
      <a href="/forderungsaufstellung" class="btn btn-sm btn-light fw-semibold">
        Forderungsaufstellung <span class="badge bg-warning text-dark ms-1 fw-normal">Beta</span>
      </a>
    </div>
  </div>
</nav>

<main class="container">
  <header class="rechner-header">
    <h1>Gerichtskostenrechner – Prozesskosten berechnen (GKG 2025)</h1>
    <p class="intro">Berechnen Sie Gerichtsgebühren in Zivilsachen kostenlos nach dem Gerichtskostengesetz (GKG, Anlage 2). Wählen Sie Streitwert und Instanz – der Rechner ermittelt die anfallenden Gerichtsgebühren für Amtsgericht, Landgericht, OLG und BGH.</p>
  </header>

  <div class="row g-4">
    <div class="col-lg-5">
      <div class="rechner-form-card">
        <form id="form-gkg" novalidate>
          <div class="mb-3">
            <label for="gkg-streitwert" class="form-label fw-semibold">Streitwert (€)</label>
            <input type="text" class="form-control" id="gkg-streitwert" placeholder="z. B. 15000" required>
          </div>
          <div class="mb-4">
            <label for="gkg-instanz" class="form-label fw-semibold">Instanz</label>
            <select class="form-select" id="gkg-instanz">
              <option value="ag">Amtsgericht (bis 5.000 € Streitwert)</option>
              <option value="lg" selected>Landgericht (ab 5.001 € Streitwert)</option>
              <option value="olg">Oberlandesgericht (Berufung)</option>
              <option value="bgh">Bundesgerichtshof (Revision)</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary w-100">Gerichtskosten berechnen</button>
        </form>
      </div>
    </div>
    <div class="col-lg-7">
      <div id="gkg-ergebnis"></div>
    </div>
  </div>

  <section class="faq-section">
    <h2>Häufige Fragen zum Gerichtskostenrechner</h2>
    <details>
      <summary>Wie berechnen sich Gerichtskosten in Zivilsachen?</summary>
      <p>Gerichtskosten setzen sich aus der einfachen Gebühr nach GKG Anlage 2 (abhängig vom Streitwert) multipliziert mit der Gebührenanzahl je nach Instanz zusammen. Im erstinstanzlichen Verfahren vor AG und LG entstehen 3,0 Gebühren, vor dem OLG (Berufung) 4,0 Gebühren, vor dem BGH (Revision) 5,0 Gebühren. Die einfache Gebühr steigt stufenweise mit dem Streitwert.</p>
    </details>
    <details>
      <summary>Wer zahlt die Gerichtskosten?</summary>
      <p>Die Gerichtskosten werden vom Kläger vorgeschossen und am Ende des Verfahrens von der unterlegenen Partei getragen (§ 91 ZPO). Bei teilweisem Obsiegen werden die Kosten gequotelt. Bei Vergleich trägt jede Partei die Hälfte (§ 98 ZPO), sofern nichts anderes vereinbart wird. Die Gerichtsgebühren ermäßigen sich bei frühzeitiger Einigung auf 1,0 Gebühr.</p>
    </details>
    <details>
      <summary>Welches Gericht ist für meine Klage zuständig?</summary>
      <p>Das Amtsgericht ist bei einem Streitwert bis 5.000 € zuständig sowie für Familiensachen. Das Landgericht ist bei einem Streitwert über 5.000 € zuständig. Ausnahmen gelten für bestimmte Rechtsmaterien (z. B. Mietsachen immer AG unabhängig vom Streitwert). Das OLG ist die Berufungsinstanz des LG, der BGH ist Revisionsinstanz.</p>
    </details>
    <details>
      <summary>Was kostet ein Prozess insgesamt?</summary>
      <p>Die Gesamtprozesskosten umfassen Gerichtsgebühren (dieser Rechner), Anwaltskosten beider Seiten (siehe RVG-Rechner), sowie sonstige Auslagen wie Zeugenentschädigung, Sachverständigengebühren und Reisekosten. Als Faustformel: Gesamtprozesskosten = ca. 2–3× die Gerichtsgebühren (inklusive Anwaltskosten beider Parteien).</p>
    </details>
    <details>
      <summary>Kann ich das Kostenrisiko vorab abschätzen?</summary>
      <p>Ja. Addieren Sie die Gerichtsgebühren aus diesem Rechner mit den Anwaltsgebühren beider Parteien aus dem RVG-Rechner. Bei einem Streitwert von 10.000 € liegen die Gesamtkosten im erstinstanzlichen Verfahren typischerweise zwischen 3.000 € und 5.000 €. fordify bietet beide Rechner kostenlos an.</p>
    </details>
  </section>
</main>

<footer class="fordify-footer">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-4 mb-2 mb-md-0">
        <span class="fw-bold" style="color:var(--color-primary)">fordify</span>
        <span class="text-muted ms-2" style="font-size:var(--text-sm)">Professionelle Forderungsberechnungen</span>
      </div>
      <div class="col-md-4 text-md-center mb-2 mb-md-0">
        <a href="/zinsrechner" class="me-3">Zinsrechner</a>
        <a href="/rvg-rechner" class="me-3">RVG-Rechner</a>
        <a href="/gerichtskostenrechner">Gerichtskostenrechner</a>
      </div>
      <div class="col-md-4 text-md-end">
        <a href="/impressum.html" class="me-3">Impressum</a>
        <a href="/datenschutz.html">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>

<script src="js/decimal.min.js"></script>
<script src="js/config.js"></script>
<script src="js/data.js"></script>
<script src="js/rechner-gkg.js"></script>
</body>
</html>
```

- [ ] **Schritt 3: Commit**

```bash
git add frontend/gerichtskostenrechner.html frontend/js/rechner-gkg.js
git commit -m "feat: Gerichtskostenrechner (/gerichtskostenrechner) mit GKG-Tabelle und FAQ"
```

---

### Task 8: Sitemap + Service Worker aktualisieren

**Files:**
- Ändern: `frontend/sitemap.xml`
- Ändern: `frontend/sw.js`

- [ ] **Schritt 1: sitemap.xml aktualisieren**

`frontend/sitemap.xml` komplett ersetzen:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fordify.de/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fordify.de/forderungsaufstellung</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://fordify.de/zinsrechner</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fordify.de/rvg-rechner</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fordify.de/gerichtskostenrechner</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fordify.de/impressum.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://fordify.de/datenschutz.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

- [ ] **Schritt 2: sw.js – neue Seiten cachen und Version erhöhen**

In `frontend/sw.js` die `CACHE`-Zeile und `ASSETS`-Array anpassen. Die `IS_STAGING_SW`-Logik bleibt erhalten, nur `fordify-v46` → `fordify-v47`:

```javascript
const CACHE = IS_STAGING_SW ? "fordify-staging-v1" : "fordify-v47";
```

Im `ASSETS`-Array folgende Einträge ergänzen (nach `/index.html`):
```javascript
  "/forderungsaufstellung",
  "/zinsrechner",
  "/rvg-rechner",
  "/gerichtskostenrechner",
  "/css/rechner.css",
  "/js/rechner-zins.js",
  "/js/rechner-rvg.js",
  "/js/rechner-gkg.js",
```

- [ ] **Schritt 3: Commit**

```bash
git add frontend/sitemap.xml frontend/sw.js
git commit -m "feat: Sitemap + SW (fordify-v47) um alle neuen Seiten erweitert"
```

---

### Task 9: Auf Staging deployen und verifizieren

**Files:** keine

- [ ] **Schritt 1: Auf staging pushen**

```bash
git push origin staging
```

- [ ] **Schritt 2: GitHub Actions prüfen**

GitHub → Actions → "Deploy to Staging" → grüner Haken abwarten (~1 Minute).

- [ ] **Schritt 3: Alle Seiten im Browser prüfen**

| URL | Erwartetes Ergebnis |
|---|---|
| `staging.fordify.de` | Homepage mit 4 Tool-Karten |
| `staging.fordify.de/forderungsaufstellung` | Bisherige App, vollständig funktionsfähig |
| `staging.fordify.de/zinsrechner` | Rechner-Formular, Berechnung liefert Ergebnis |
| `staging.fordify.de/rvg-rechner` | Rechner-Formular, Gebührentabelle erscheint |
| `staging.fordify.de/gerichtskostenrechner` | Rechner-Formular, Kostentabelle erscheint |

- [ ] **Schritt 4: Funktionstest Zinsrechner**

Eingabe: Betrag 5000, Von 01.01.2024, Bis 31.12.2024, B2B  
Erwartetes Ergebnis: Zwei Perioden (Jan–Jun 2024 mit 3,62 %+9=12,62 %, Jul–Dez 2024 mit 3,37 %+9=12,37 %), Gesamtzinsen ca. 630 €.

- [ ] **Schritt 5: Funktionstest RVG-Rechner**

Eingabe: Streitwert 10.000, Außergerichtlich, 19 % USt  
Erwartetes Ergebnis: VV 2300 = 847,60 € (652,00 × 1,3), VV 7002 = 20,00 €, Netto 867,60 €, USt 164,84 €, Gesamt 1.032,44 €.

- [ ] **Schritt 6: Funktionstest GKG-Rechner**

Eingabe: Streitwert 10.000, Landgericht  
Erwartetes Ergebnis: Einfache Gebühr 241 €, × 3,0 = 723,00 € Gerichtskosten gesamt.
