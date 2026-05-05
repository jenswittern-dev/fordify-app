# Landing Page P1-Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle Design-P1 und Content-P1 Befunde aus dem Landing-Page-Audit umsetzen — nur auf `staging` deployen.

**Architecture:** Pure static HTML/CSS, kein Build-Schritt. Alle Änderungen in `frontend/`. SW-Version in `frontend/sw.js` nach Abschluss um 1 erhöhen (aktuell staging-v145 → v146). Kein Push auf `main`.

**Tech Stack:** HTML5, CSS3 (Bootstrap 5.3.3), Vanilla JS — keine Tests, Verifikation visuell im Browser / per `grep`.

**Scope:** Ausschließlich P1-Befunde beider Audits. P2/P3 folgen separat.

**Branch:** `staging` (nur staging.fordify.de deployen)

---

## Betroffene Dateien

| Datei | Änderungen |
|---|---|
| `frontend/index.html` | `data-theme`, H1, Lead-Text, Hero-CTA-Klasse, Vorteil-Sektion, Copyright |
| `frontend/preise.html` | `data-theme`, Free-Plan-Desc Einschränkung, Copyright |
| `frontend/css/rechner.css` | Trust-Items Opacity+Size, Hero-Gradient, neue `.btn-hero-cta`-Klasse, `hero-mockup__verrechnung` Opacity |
| `frontend/sw.js` | SW-Version staging-v145 → staging-v146 |

---

## Task 1: CSS-Fixes in `rechner.css`

**Files:**
- Modify: `frontend/css/rechner.css`

- [ ] **Schritt 1.1: Trust-Items — Opacity und Font-Size erhöhen**

In `rechner.css`, Zeile 62–64, ersetze:
```css
  font-size: 0.68rem;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
```
mit:
```css
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
```

- [ ] **Schritt 1.2: Hero-Gradient Startfarbe angleichen**

In `rechner.css`, Zeile 9, ersetze:
```css
  background: linear-gradient(135deg, #0f1d5c 0%, #1e3a8a 60%, #1c439a 100%);
```
mit:
```css
  background: linear-gradient(135deg, #1a3480 0%, #1e3a8a 60%, #1c439a 100%);
```

- [ ] **Schritt 1.3: `.btn-hero-cta` Klasse hinzufügen**

Direkt nach dem Block `.fordify-hero .lead { ... }` (ca. Zeile 27) folgendes ergänzen:
```css
.btn-hero-cta {
  background: #fff;
  color: #0f1d5c;
  font-weight: 700;
  padding: 0.65rem 1.75rem;
  border-radius: 10px;
  border: none;
  text-decoration: none;
  display: inline-block;
  transition: background 0.15s, box-shadow 0.15s;
}
.btn-hero-cta:hover,
.btn-hero-cta:focus-visible {
  background: #f0f4ff;
  color: #0f1d5c;
  box-shadow: 0 4px 16px rgba(15,29,92,0.18);
}
```

- [ ] **Schritt 1.4: `hero-mockup__verrechnung` Opacity auf sichtbaren Wert setzen**

In `rechner.css`, ca. Zeile 142–145 (`.hero-mockup__verrechnung`), ersetze:
```css
  color: rgba(255,255,255,0.38);
```
mit:
```css
  color: #34d399;
```

- [ ] **Schritt 1.5: Prüfen**

```bash
grep -n "rgba(255,255,255,0.5)\|0f1d5c 0%\|btn-hero-cta\|rgba(255,255,255,0.38)" frontend/css/rechner.css
```
Erwartete Ausgabe: keine Treffer (alle alten Werte ersetzt).

---

## Task 2: HTML-Fixes in `index.html`

**Files:**
- Modify: `frontend/index.html`

- [ ] **Schritt 2.1: `data-theme="brand"` auf `<html>` setzen**

Zeile 2, ersetze:
```html
<html lang="de">
```
mit:
```html
<html lang="de" data-theme="brand">
```

- [ ] **Schritt 2.2: Hero-CTA-Klasse ändern**

Zeile 153, ersetze:
```html
        <a href="/forderungsaufstellung" class="btn btn-light fw-semibold">
          Jetzt kostenlos starten
        </a>
```
mit:
```html
        <a href="/forderungsaufstellung" class="btn btn-hero-cta">
          Jetzt kostenlos starten
        </a>
```

- [ ] **Schritt 2.3: H1-Text auf Schmerzpunkt fokussieren**

Zeile 151, ersetze:
```html
        <h1>In Minuten zur rechtssicheren Forderungsaufstellung <span class="hero-gradient-text">nach § 367 BGB</span></h1>
```
mit:
```html
        <h1>§ 367 BGB korrekt abrechnen — <span class="hero-gradient-text">ohne Excel, ohne Rechenfehler</span></h1>
```

- [ ] **Schritt 2.4: Lead-Text auf Kanzleien fokussieren**

Zeile 152, ersetze:
```html
        <p class="lead mb-4">Verzugszinsen, RVG-Gebühren und § 367-Verrechnung automatisch berechnen – für Kanzleien, Inkassobüros und Unternehmen. Kostenlos, ohne Registrierung, DSGVO-konform.</p>
```
mit:
```html
        <p class="lead mb-4">Verzugszinsen, RVG-Gebühren und § 367-Verrechnung automatisch berechnen – für Anwaltskanzleien und Kanzleiteams. Kostenlos, ohne Registrierung, DSGVO-konform.</p>
```

- [ ] **Schritt 2.5: Vorteil-Sektion — Features in Resultate umformulieren**

Zeilen 258–273, ersetze den gesamten `<div class="vorteil-feats">...</div>`-Block:
```html
    <div class="vorteil-feats">
      <div class="vorteil-item">
        <div class="vorteil-item__num" aria-hidden="true">01</div>
        <div class="vorteil-item__title">Sofort einsatzbereit</div>
        <p>Kein Download, keine IT-Abteilung, kein Onboarding. Browser öffnen, loslegen – auf jedem Gerät, ohne Account.</p>
      </div>
      <div class="vorteil-item">
        <div class="vorteil-item__num" aria-hidden="true">02</div>
        <div class="vorteil-item__title">Immer auf dem aktuellen Stand</div>
        <p>RVG 2025, Basiszinssätze bis 07/2026, GKG Anlage 2 – kein manuelles Nachpflegen von Tabellen.</p>
      </div>
      <div class="vorteil-item">
        <div class="vorteil-item__num" aria-hidden="true">03</div>
        <div class="vorteil-item__title">Mandantendaten bleiben bei Ihnen</div>
        <p>Im Free-Tarif verlassen keine Daten Ihren Rechner. Kein Server, kein Cookie-Banner. DSGVO ohne Aufwand.</p>
      </div>
    </div>
```

- [ ] **Schritt 2.6: Copyright aktualisieren**

Zeile 353, ersetze:
```html
      <div class="fordify-footer__copy">© 2025 fordify · Alle Rechte vorbehalten</div>
```
mit:
```html
      <div class="fordify-footer__copy">© 2025–2026 fordify · Alle Rechte vorbehalten</div>
```

- [ ] **Schritt 2.7: Prüfen**

```bash
grep -n "data-theme\|btn-hero-cta\|ohne Excel\|Kanzleiteams\|Sofort einsatzbereit\|2025–2026" frontend/index.html
```
Erwartete Ausgabe: 6 Treffer (einer je geänderte Stelle).

---

## Task 3: HTML-Fixes in `preise.html`

**Files:**
- Modify: `frontend/preise.html`

- [ ] **Schritt 3.1: `data-theme="brand"` auf `<html>` setzen**

Zeile 2 in `preise.html`, ersetze:
```html
<html lang="de">
```
mit:
```html
<html lang="de" data-theme="brand">
```

- [ ] **Schritt 3.2: Free-Plan-Desc — Session-Einschränkung ehrlich kommunizieren**

Ca. Zeile 138, ersetze:
```html
    <div class="plan-desc">Alle Rechner kostenlos. Forderungsaufstellungen erstellen und als PDF exportieren – ohne Login.</div>
```
mit:
```html
    <div class="plan-desc">Alle Rechner kostenlos. Forderungsaufstellungen erstellen und als PDF exportieren – ohne Login. Daten nur für die aktuelle Sitzung (kein Cloud-Speicher).</div>
```

- [ ] **Schritt 3.3: Copyright aktualisieren**

Ca. Zeile 333, ersetze:
```html
      <div class="fordify-footer__copy">© 2025 fordify · Alle Rechte vorbehalten</div>
```
mit:
```html
      <div class="fordify-footer__copy">© 2025–2026 fordify · Alle Rechte vorbehalten</div>
```

- [ ] **Schritt 3.4: Prüfen**

```bash
grep -n "data-theme\|aktuelle Sitzung\|2025–2026" frontend/preise.html
```
Erwartete Ausgabe: 3 Treffer.

---

## Task 4: SW-Version erhöhen + committen

**Files:**
- Modify: `frontend/sw.js`

- [ ] **Schritt 4.1: SW-Version von staging-v145 auf staging-v146 erhöhen**

In `frontend/sw.js`, ersetze:
```js
const CACHE_NAME = 'fordify-staging-v145';
```
mit:
```js
const CACHE_NAME = 'fordify-staging-v146';
```

- [ ] **Schritt 4.2: Commit erstellen (nur staging)**

```bash
git add frontend/index.html frontend/preise.html frontend/css/rechner.css frontend/sw.js
git commit -m "fix(landing): Design- und Content-P1-Audit umsetzen (data-theme, Hero-CTA, Trust-Signals, H1, Vorteil-Texte, Free-Hinweis, Copyright)"
```

- [ ] **Schritt 4.3: Nur auf staging pushen**

```bash
git push origin staging
```
Nicht auf `main` pushen. Änderungen sind ausschließlich für staging.fordify.de bestimmt.

- [ ] **Schritt 4.4: CLAUDE.md SW-Version aktualisieren**

In `CLAUDE.md`, ersetze:
```
| `sw.js`                   ← Service Worker (aktuell fordify-v190 / staging-v145)
```
mit:
```
| `sw.js`                   ← Service Worker (aktuell fordify-v190 / staging-v146)
```

Dann in den gleichen Commit aufnehmen oder separaten Commit:
```bash
git add CLAUDE.md
git commit -m "docs(claude): SW-Version auf staging-v146 aktualisieren"
git push origin staging
```
