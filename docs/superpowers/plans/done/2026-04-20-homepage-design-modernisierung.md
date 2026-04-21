# Homepage Design Modernisierung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die fordify Startseite von einem generischen Bootstrap-Layout zu einem modernen B2B Legal-Tech Webauftritt aufwerten – mit Hero-Visual, Trust-Bar, stärkerer visueller Hierarchie und professionellen SVG-Icons.

**Architecture:** Rein kosmetische Änderungen an zwei Dateien (index.html + rechner.css). Kein JS, keine externen Abhängigkeiten. Alle SVG-Icons inline eingebettet. Alle Design-Tokens aus app.css werden korrekt verwendet (keine neuen Hex-Werte).

**Tech Stack:** HTML5, CSS3 (Custom Properties aus app.css), Bootstrap 5.3.3, inline SVG

---

## Betroffene Dateien

| Datei | Änderung |
|---|---|
| `frontend/index.html` | Hero-Layout, Trust-Bar, Tool-Card-Icons, Vorteile-Sektion, Nav-CTA |
| `frontend/css/rechner.css` | Hero-Inner, Hero-Mockup, Trust-Bar, Tool-Card-Erweiterungen, Vorteile-Sektion, Footer-Token |
| `frontend/sw.js` | Version-Bump nach Abschluss |

---

## Task 1: Hero – Zweispaltig, neues Wertversprechen, UI-Mockup

**Files:**
- Modify: `frontend/index.html` – `<section class="fordify-hero">` (Zeilen 60–68)
- Modify: `frontend/css/rechner.css` – `.fordify-hero` Block (Zeilen 7–24)

**Ziel:** Hero bekommt links einen starken Hook-H1 + Lead, rechts auf Desktop ein glassmorphism UI-Mockup der Forderungsaufstellung. Auf Mobile wird das Mockup ausgeblendet.

- [ ] **Step 1: Hero HTML ersetzen**

Ersetze in `frontend/index.html` den kompletten `<section class="fordify-hero">` Block:

```html
<section class="fordify-hero">
  <div class="container">
    <div class="hero-inner">
      <div class="hero-text">
        <h1>In Minuten zur rechtssicheren<br>Forderungsaufstellung nach § 367 BGB</h1>
        <p class="lead mb-4">fordify berechnet Verzugszinsen, RVG-Gebühren und die gesetzliche Tilgungsreihenfolge – vollständig im Browser, ohne Registrierung, DSGVO-konform.</p>
        <a href="/forderungsaufstellung" class="btn btn-light btn-lg fw-semibold">
          Jetzt kostenlos starten <span class="badge ms-2 fw-normal" style="background:rgba(255,255,255,0.2);color:#fff;font-size:0.65rem;letter-spacing:.04em">NEU</span>
        </a>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="hero-mockup__card">
          <div class="hero-mockup__header">Forderungsaufstellung</div>
          <div class="hero-mockup__row">
            <span>Hauptforderung</span><span>15.000,00 €</span>
          </div>
          <div class="hero-mockup__row">
            <span>Verzugszinsen (B2B)</span><span>892,47 €</span>
          </div>
          <div class="hero-mockup__row">
            <span>Anwaltskosten (RVG)</span><span>1.029,35 €</span>
          </div>
          <div class="hero-mockup__divider"></div>
          <div class="hero-mockup__row hero-mockup__row--total">
            <span>Gesamtforderung</span><span>16.921,82 €</span>
          </div>
          <div class="hero-mockup__badge">§ 367 BGB · automatisch verrechnet</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Hero CSS ergänzen**

Füge in `frontend/css/rechner.css` nach `.fordify-hero .lead { ... }` (nach Zeile 24) ein:

```css
/* Hero – zweispaltig mit Visual */
.hero-inner {
  display: flex;
  align-items: center;
  gap: 3rem;
}
.hero-text {
  flex: 1;
  max-width: 560px;
}
@media (max-width: 767px) {
  .hero-visual { display: none; }
}

/* Hero Mockup Card */
.hero-mockup__card {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  min-width: 280px;
  backdrop-filter: blur(8px);
}
.hero-mockup__header {
  font-weight: 700;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.hero-mockup__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.85);
  gap: 1.5rem;
}
.hero-mockup__divider {
  height: 1px;
  background: rgba(255,255,255,0.25);
  margin: 0.25rem 0;
}
.hero-mockup__row--total {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #fff;
  border-bottom: none;
  padding-top: 0.75rem;
}
.hero-mockup__badge {
  margin-top: 1rem;
  display: inline-block;
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.85);
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
```

- [ ] **Step 3: Visuell prüfen**

Öffne `frontend/index.html` im Browser. Prüfe:
- Desktop (≥768px): Hero zweispaltig – links Text, rechts Glassmorphism-Karte
- Mobile (<768px): Nur Text, kein Mockup
- H1 lautet: "In Minuten zur rechtssicheren Forderungsaufstellung nach § 367 BGB"
- CTA-Button: "Jetzt kostenlos starten" mit "NEU" Badge (nicht mehr "BETA")

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/css/rechner.css
git commit -m "feat: Hero zweispaltig – UI-Mockup, neues Wertversprechen, NEU statt BETA"
```

---

## Task 2: Trust-Bar zwischen Hero und Tool-Grid

**Files:**
- Modify: `frontend/index.html` – nach `</section>` (Hero), vor `<main class="container">` (Zeile 70)
- Modify: `frontend/css/rechner.css` – neuer `.trust-bar` Block

**Ziel:** Ein schmaler horizontaler Streifen mit vier Vertrauenssignalen direkt unter dem Hero, mit Checkmarks.

- [ ] **Step 1: Trust-Bar HTML einfügen**

Füge in `frontend/index.html` zwischen `</section>` (Ende Hero) und `<main class="container">` ein:

```html
<div class="trust-bar">
  <div class="container">
    <ul class="trust-bar__list">
      <li class="trust-bar__item">
        <svg class="trust-bar__icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
        RVG 2025 (BGBl. I Nr. 109)
      </li>
      <li class="trust-bar__item">
        <svg class="trust-bar__icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
        Basiszinssatz aktuell bis 07/2026
      </li>
      <li class="trust-bar__item">
        <svg class="trust-bar__icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
        Von Anwälten entwickelt
      </li>
      <li class="trust-bar__item">
        <svg class="trust-bar__icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
        Kein Login · 100 % kostenlos
      </li>
    </ul>
  </div>
</div>
```

- [ ] **Step 2: Trust-Bar CSS**

Füge in `frontend/css/rechner.css` vor `/* ---- Tool-Grid ---- */` ein:

```css
/* ---- Trust-Bar ---- */
.trust-bar {
  background: var(--color-primary-light);
  border-bottom: 1px solid #bfdbfe;
  padding: 0.6rem 0;
}
.trust-bar__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem 1.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.trust-bar__item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-primary);
  white-space: nowrap;
}
.trust-bar__icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  color: var(--color-accent);
}
```

- [ ] **Step 3: Visuell prüfen**

Trust-Bar erscheint als schmaler blauer Streifen direkt unter dem Hero mit vier Einträgen nebeneinander (auf Mobile umgebrochen). Checkmarks in Cyan, Text in Dunkelblau.

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/css/rechner.css
git commit -m "feat: Trust-Bar mit Vertrauenssignalen unter Hero"
```

---

## Task 3: Tool-Cards – SVG-Icons, Primary-Card vollblau, Pfeil-Animation

**Files:**
- Modify: `frontend/index.html` – `.tool-grid` Bereich (Zeilen 71–96)
- Modify: `frontend/css/rechner.css` – `.tool-card` Blöcke (Zeilen 35–91)

**Ziel:** Professionelle SVG-Icons statt Textzeichen, Primary-Card mit vollem Primärblau-Hintergrund + weißem Text, Pfeil-Animation bei Card-Hover.

- [ ] **Step 1: Tool-Grid HTML mit SVG-Icons ersetzen**

Ersetze in `frontend/index.html` den `<div class="tool-grid">` Block vollständig:

```html
<div class="tool-grid">
  <a href="/forderungsaufstellung" class="tool-card tool-card--primary">
    <div class="tool-card__icon">
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>
    </div>
    <div class="tool-card__title">Forderungsaufstellung</div>
    <p class="tool-card__desc">Vollständige Forderungsaufstellung nach § 367 BGB mit Zinsen, RVG-Gebühren, Zahlungsverrechnung und PDF-Export.</p>
    <span class="tool-card__cta">Jetzt erstellen →</span>
  </a>
  <a href="/zinsrechner" class="tool-card">
    <div class="tool-card__icon">
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.442 2.558a.625.625 0 0 1 0 .884l-10 10a.625.625 0 1 1-.884-.884l10-10a.625.625 0 0 1 .884 0zM4.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm7 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>
    </div>
    <div class="tool-card__title">Verzugszinsrechner</div>
    <p class="tool-card__desc">Verzugszinsen nach § 288 BGB berechnen – aktueller Basiszinssatz, B2B und B2C, tagesgenaue Periodenaufstellung.</p>
    <span class="tool-card__cta">Zinsen berechnen →</span>
  </a>
  <a href="/rvg-rechner" class="tool-card">
    <div class="tool-card__icon">
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/></svg>
    </div>
    <div class="tool-card__title">RVG-Rechner</div>
    <p class="tool-card__desc">Anwaltsgebühren nach RVG 2025 berechnen – Geschäftsgebühr, Verfahrensgebühr, Auslagenpauschale und Umsatzsteuer.</p>
    <span class="tool-card__cta">Gebühren berechnen →</span>
  </a>
  <a href="/gerichtskostenrechner" class="tool-card">
    <div class="tool-card__icon">
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 15a1 1 0 0 1-1-1V3.5a.5.5 0 0 1 .5-.5H4V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h2.5a.5.5 0 0 1 .5.5V14a1 1 0 0 1-1 1H2zm6-12H5v1h6V3H8zM3 4v10h10V4H3zm2 2h6v1H5V6zm0 2h6v1H5V8zm0 2h4v1H5v-1z"/></svg>
    </div>
    <div class="tool-card__title">Gerichtskostenrechner</div>
    <p class="tool-card__desc">Gerichtsgebühren nach GKG berechnen – Amtsgericht, Landgericht, OLG und BGH, alle Instanzen.</p>
    <span class="tool-card__cta">Kosten berechnen →</span>
  </a>
</div>
```

- [ ] **Step 2: Tool-Card CSS modernisieren**

Ersetze in `frontend/css/rechner.css` den Block `.tool-card__icon { ... }` bis `.tool-card__cta { ... }` (Zeilen 56–91) mit:

```css
.tool-card__icon {
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: 0.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-bottom: 0.75rem;
}
.tool-card__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}
.tool-card--primary .tool-card__icon {
  background: rgba(255,255,255,0.18);
  color: #fff;
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
  display: inline-block;
  transition: transform 0.15s ease;
}
.tool-card:hover .tool-card__cta {
  transform: translateX(3px);
}
```

- [ ] **Step 3: Primary-Card vollblau**

Ersetze in `frontend/css/rechner.css` den Block `.tool-card.tool-card--primary { ... }` (aktuell Zeilen 52–55) mit:

```css
.tool-card.tool-card--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.tool-card--primary .tool-card__title,
.tool-card--primary .tool-card__desc,
.tool-card--primary .tool-card__cta {
  color: #fff;
}
.tool-card--primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  color: #fff;
}
```

- [ ] **Step 4: Visuell prüfen**

- Forderungsaufstellung-Karte: vollblau mit weißem Text + weißem SVG-Icon
- Alle vier Karten: professionelle SVG-Icons (kein §, %, RVG, GKG Text mehr)
- Hover: Pfeil bewegt sich um 3px nach rechts
- Primary-Card Hover: etwas dunkleres Blau

- [ ] **Step 5: Commit**

```bash
git add frontend/index.html frontend/css/rechner.css
git commit -m "style: Tool-Cards – SVG-Icons, Primary-Card vollblau, Pfeil-Hover-Animation"
```

---

## Task 4: Vorteile-Sektion – Overline, SVG-Icons, Card-Hintergrund

**Files:**
- Modify: `frontend/index.html` – `.row.g-0.my-4...` Vorteile-Block (Zeilen 98–114)
- Modify: `frontend/css/rechner.css` – `.vorteil-item` Blöcke (Zeilen 93–108)

**Ziel:** Emoji-Icons durch professionelle SVG-Icons ersetzen. Bootstrap `border-top border-bottom` durch Card-Hintergrund ersetzen. Overline "Warum fordify?" hinzufügen.

- [ ] **Step 1: Vorteile HTML ersetzen**

Ersetze in `frontend/index.html` den Block `<div class="row g-0 my-4 py-4 border-top border-bottom">` vollständig:

```html
<div class="vorteil-section">
  <p class="section-overline text-center mb-3">Warum fordify?</p>
  <div class="row g-0">
    <div class="col-md-4 vorteil-item">
      <div class="vorteil-item__icon">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/></svg>
      </div>
      <div class="vorteil-item__title">Browserbasiert</div>
      <p class="text-muted small">Keine Installation, keine App – läuft auf jedem Gerät direkt im Browser.</p>
    </div>
    <div class="col-md-4 vorteil-item">
      <div class="vorteil-item__icon">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
      </div>
      <div class="vorteil-item__title">Immer aktuell</div>
      <p class="text-muted small">RVG 2025, aktuelle Basiszinssätze (bis 07/2026), GKG Anlage 2.</p>
    </div>
    <div class="col-md-4 vorteil-item">
      <div class="vorteil-item__icon">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
      </div>
      <div class="vorteil-item__title">DSGVO-konform</div>
      <p class="text-muted small">Alle Daten bleiben im Browser – kein Server, keine Cloud, keine Weitergabe.</p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Vorteile CSS modernisieren**

Ersetze in `frontend/css/rechner.css` den Block `/* ---- Vorteile ---- */` bis `vorteil-item__title { ... }` (Zeilen 93–108) mit:

```css
/* ---- Vorteile ---- */
.vorteil-section {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 2rem 1rem;
  margin: 0 0 2rem;
}
.section-overline {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  margin-bottom: 0;
}
.vorteil-item { text-align: center; padding: 1.5rem 1.5rem; }
.vorteil-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--color-primary-light);
  border-radius: 0.625rem;
  margin: 0 auto 0.875rem;
  color: var(--color-primary);
}
.vorteil-item__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}
.vorteil-item__title { font-weight: 700; margin-bottom: 0.25rem; }
```

- [ ] **Step 3: Visuell prüfen**

- Überline "Warum fordify?" erscheint in Cyan / Großbuchstaben
- Drei Vorteile in einer Card (weißer Hintergrund, Border, Radius)
- SVG-Icons (Monitor, Uhr, Schloss) statt Emojis – einheitliche quadratische Badges
- Kein Bootstrap border-top/border-bottom mehr

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/css/rechner.css
git commit -m "style: Vorteile-Sektion – SVG-Icons, Card-Hintergrund, Overline"
```

---

## Task 5: Nav-CTA BETA→NEU + Footer Token-Fix + SW-Bump

**Files:**
- Modify: `frontend/index.html` – Nav-CTA Badge-Text (Zeile 53–55)
- Modify: `frontend/css/rechner.css` – `.fordify-footer` (Zeile 209)
- Modify: `frontend/sw.js` – CACHE-Version

**Ziel:** BETA-Badge im primären CTA durch "NEU" ersetzen (Conversion-freundlicher). Footer-Hintergrundfarbe durch Design-Token ersetzen. SW-Version bumpen.

- [ ] **Step 1: Nav-CTA Badge ändern** (in allen 5 HTML-Seiten)

In `frontend/index.html`, `frontend/zinsrechner.html`, `frontend/rvg-rechner.html`, `frontend/gerichtskostenrechner.html` und `frontend/forderungsaufstellung.html`:

Ersetze überall:
```html
Forderungsaufstellung <span class="badge ms-1 fw-normal" style="background:rgba(255,255,255,0.2);color:inherit;font-size:0.65rem;letter-spacing:.04em;vertical-align:middle">BETA</span>
```
mit:
```html
Forderungsaufstellung <span class="badge ms-1 fw-normal" style="background:rgba(255,255,255,0.2);color:inherit;font-size:0.65rem;letter-spacing:.04em;vertical-align:middle">NEU</span>
```

- [ ] **Step 2: Footer-Hintergrund auf Token umstellen**

In `frontend/css/rechner.css`, ändere `.fordify-footer { background: #eff6ff; ... }`:

```css
.fordify-footer {
  background: var(--color-primary-light);
  border-top: 1px solid #bfdbfe;
  padding: 2.5rem 0;
  margin-top: 4rem;
}
```

- [ ] **Step 3: SW-Version bumpen**

In `frontend/sw.js` ändere die CACHE-Zeile:
```js
const CACHE = IS_STAGING_SW ? "fordify-staging-v3" : "fordify-v49";
```

- [ ] **Step 4: Visuell prüfen**

- Alle Navbar-CTAs zeigen "Forderungsaufstellung NEU" (nicht BETA)
- Footer-Hintergrund identisch zu Trust-Bar (beide `--color-primary-light`)

- [ ] **Step 5: Commit**

```bash
git add frontend/index.html frontend/zinsrechner.html frontend/rvg-rechner.html frontend/gerichtskostenrechner.html frontend/css/rechner.css frontend/sw.js
git commit -m "style: BETA→NEU in Nav-CTAs, Footer Design-Token, SW v49"
```

---

## Selbst-Review

**Spec Coverage:**
- [x] Hero-Visual / Produkt-Mockup → Task 1
- [x] Differenziertes Wertversprechen → Task 1
- [x] Trust-Bar → Task 2
- [x] SVG-Icons Tool-Cards → Task 3
- [x] Primary-Card vollblau → Task 3
- [x] Pfeil-Animation Hover → Task 3
- [x] Vorteile Overline → Task 4
- [x] SVG-Icons Vorteile → Task 4
- [x] BETA→NEU CTA → Task 5
- [x] Footer Token-Fix → Task 5
- [x] SW-Version-Bump → Task 5

**Nicht in diesem Plan (bewusst ausgelassen):**
- Hero-Padding Mobile-Anpassung: bereits gut durch `clamp()` geregelt
- Aktiver Nav-State per JS: würde JS-Änderungen auf mehreren Seiten erfordern, geringes SEO/UX-Gewicht
- Testimonials: keine Daten vorhanden
