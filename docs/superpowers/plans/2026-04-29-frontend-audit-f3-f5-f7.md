# Frontend-Audit Fixes (F3+F5+F7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drei verifizierte Befunde aus dem zweiten Codex-Frontend-Audit beheben: Spreadsheet-Formula-Injection in CSV-Exporten, fehlende Accessibility-Attribute in Modals und Formularen, und horizontal überlaufende Inhalte auf mobilen Screens.

**Architecture:** Pure Static SPA (Vanilla JS, Bootstrap 5, kein Build-Schritt). Alle Fixes direkt in Quelldateien. CLAUDE.md-Regel: SW-Version bei jedem Commit mit geänderten Frontend-Dateien um 1 erhöhen. Reihenfolge: F5 → F7 → F3 (F3 zuletzt, da es Playwright-Investigation erfordert).

**Tech Stack:** Vanilla JS, Bootstrap 5, HTML, CSS, Playwright MCP (für F3-Verifikation)

---

## Betroffene Dateien

| Datei | Task | Änderung |
|---|---|---|
| `frontend/js/app.js` | 1 (F5) | `_csvFmla()` Helfer + Anwendung in fallExportierenAlsCSV |
| `frontend/js/konto.js` | 1 (F5) | `_csvQuote()` um Formula-Sanitization erweitern |
| `frontend/sw.js` | 1, 2, 3 | SW-Version erhöhen nach jedem Frontend-Commit |
| `frontend/forderungsaufstellung.html` | 2 (F7) | 3× btn-close + 3× ZV-GV-Input aria-label |
| `frontend/konto.html` | 2 (F7) | 1× btn-close + 12× Contact-Form-Input aria-label |
| `frontend/preise.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/index.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/changelog.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/avv.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/agb.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/gerichtskostenrechner.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/zinsrechner.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/rvg-rechner.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/datenschutz.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/tilgungsrechner.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/impressum.html` | 2 (F7) | 1× btn-close aria-label |
| `frontend/css/app.css` | 3 (F3) | Mobile-Overflow-Fixes (nach Playwright-Investigation) |
| `frontend/css/rechner.css` | 3 (F3) | Mobile-Overflow-Fixes (nach Playwright-Investigation) |

---

## Task 1: F5 – Spreadsheet Formula Injection in CSV-Exporten verhindern

**Dateien:**
- Modify: `frontend/js/app.js` (Zeile ~316–318, Funktion `fallExportierenAlsCSV`)
- Modify: `frontend/js/konto.js` (Zeile ~1147–1153, Funktion `_csvQuote`)
- Modify: `frontend/sw.js` (SW-Version erhöhen)

**Hintergrund:** CSV-Exporte quoten Zellen (alle Werte werden in `"` eingeschlossen in app.js, oder nur wenn nötig in konto.js), neutralisieren aber keine Werte, die mit `=`, `+`, `-`, `@` oder Tab beginnen. Excel und LibreOffice interpretieren solche Werte beim Öffnen als Formeln. Namen, Aktenzeichen und Beschreibungen aus Nutzereingaben können so als Formeln ausgeführt werden.

**Lösung:** Werte, die mit einem der genannten Zeichen beginnen, mit einem führenden `'` (Apostroph) präfixen. Das ist die OWASP-empfohlene Schutzfunktion — die meisten Tabellenkalkulationen verbergen den Apostroph und zeigen den restlichen Wert korrekt an.

- [ ] **Schritt 1:** Lies `frontend/js/app.js` Zeilen 280–325 um die Funktion `fallExportierenAlsCSV()` und den CSV-Export-Block zu sehen.

- [ ] **Schritt 2:** Füge in `frontend/js/app.js` DIREKT VOR der `fallExportierenAlsCSV()`-Funktion (ca. Zeile 280) eine neue Hilfsfunktion ein:

```javascript
function _csvFmla(s) {
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
```

- [ ] **Schritt 3:** Ersetze in `fallExportierenAlsCSV()` den bestehenden CSV-Zeilen-Builder (ca. Zeile 316–318):

ALT:
```javascript
  const csv = rows.map(r =>
    r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(";")
  ).join("\r\n");
```

NEU:
```javascript
  const csv = rows.map(r =>
    r.map(cell => { const s = _csvFmla(String(cell)); return '"' + s.replace(/"/g, '""') + '"'; }).join(";")
  ).join("\r\n");
```

- [ ] **Schritt 4:** Lies `frontend/js/konto.js` Zeilen 1147–1155. Ersetze die bestehende `_csvQuote()`-Funktion:

ALT:
```javascript
function _csvQuote(val) {
  const s = String(val == null ? '' : val);
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
```

NEU:
```javascript
function _csvQuote(val) {
  let s = String(val == null ? '' : val);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
```

- [ ] **Schritt 5:** Syntaxcheck beider Dateien:
```bash
node --check frontend/js/app.js && node --check frontend/js/konto.js && echo OK
```

- [ ] **Schritt 6:** SW-Version in `frontend/sw.js` Zeile 5 um 1 erhöhen (aktuelle Version nach letztem Commit aus sw.js lesen).

- [ ] **Schritt 7:** Commit & Push:
```bash
git add frontend/js/app.js frontend/js/konto.js frontend/sw.js
git commit -m "fix: CSV-Exporte gegen Spreadsheet Formula Injection absichern"
git push origin staging && git push origin staging:main
```

---

## Task 2: F7 – Accessibility: aria-label für Close-Buttons und Formularfelder

**Dateien:** Alle unten aufgeführten HTML-Dateien + `frontend/sw.js` (SW-Version)

**Hintergrund:** Screenreader können Bootstrap-Close-Buttons ohne `aria-label` nicht sinnvoll ankündigen — sie lesen nur "button". Formularfelder, die ausschließlich über `placeholder` beschriftet sind, sind für Nutzer ohne visuelle Wahrnehmung unzugänglich (placeholder verschwindet beim Tippen).

### Schritt 1: btn-close aria-label in forderungsaufstellung.html (3 Stellen)

Lies `frontend/forderungsaufstellung.html` Zeilen 705–825. Ergänze an drei Stellen `aria-label="Schließen"`:

**Zeile 709** (ZV-Modal):
```html
<!-- ALT: -->
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
<!-- NEU: -->
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
```

**Zeile 790** (Login-Modal):
```html
<!-- ALT: -->
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
<!-- NEU: -->
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
```

**Zeile 818** (Upgrade-Modal):
```html
<!-- ALT: -->
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
<!-- NEU: -->
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
```

### Schritt 2: ZV-Modal-Felder ohne Label in forderungsaufstellung.html (3 Stellen)

Lies `frontend/forderungsaufstellung.html` Zeilen 740–754. Die drei Inputs unter der Gruppen-Label "Gerichtsvollzieher / Verteilerstelle" haben kein Input-spezifisches Label:

**Zeile 742** (zv-gv-name):
```html
<!-- ALT: -->
<input type="text" class="form-control mb-2" id="zv-gv-name"
       placeholder="Name des Gerichtsvollziehers oder Bezeichnung der Verteilerstelle">
<!-- NEU: -->
<input type="text" class="form-control mb-2" id="zv-gv-name"
       aria-label="Name des Gerichtsvollziehers oder Verteilerstelle"
       placeholder="Name des Gerichtsvollziehers oder Bezeichnung der Verteilerstelle">
```

**Zeile 746** (zv-gv-strasse):
```html
<!-- ALT: -->
<input type="text" class="form-control" id="zv-gv-strasse"
       placeholder="Straße und Hausnummer oder Postfach">
<!-- NEU: -->
<input type="text" class="form-control" id="zv-gv-strasse"
       aria-label="Straße und Hausnummer oder Postfach"
       placeholder="Straße und Hausnummer oder Postfach">
```

**Zeile 750** (zv-gv-plzort):
```html
<!-- ALT: -->
<input type="text" class="form-control" id="zv-gv-plzort"
       placeholder="12345 Musterstadt">
<!-- NEU: -->
<input type="text" class="form-control" id="zv-gv-plzort"
       aria-label="PLZ und Ort"
       placeholder="12345 Musterstadt">
```

### Schritt 3: konto.html – btn-close + alle Contact-Form-Inputs (1+12 Stellen)

Lies `frontend/konto.html` Zeilen 247–320 und 378–395.

**Zeile 384** (Upgrade-Modal Close-Button):
```html
<!-- ALT: -->
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
<!-- NEU: -->
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
```

**Zeilen 253–269** (Schuldner-Adressbuch-Form — 6 Inputs):
```html
<!-- ALT: -->
<input type="text" class="form-control form-control-sm" id="schuldner-inp-name" placeholder="Name *">
<input type="text" class="form-control form-control-sm" id="schuldner-inp-strasse" placeholder="Straße">
<input type="text" class="form-control form-control-sm" id="schuldner-inp-plz" placeholder="PLZ">
<input type="text" class="form-control form-control-sm" id="schuldner-inp-ort" placeholder="Ort">
<input type="email" class="form-control form-control-sm" id="schuldner-inp-email" placeholder="E-Mail">
<input type="tel" class="form-control form-control-sm" id="schuldner-inp-telefon" placeholder="Telefon">

<!-- NEU (aria-label zu jedem Input hinzufügen): -->
<input type="text" class="form-control form-control-sm" id="schuldner-inp-name" aria-label="Name des Schuldners" placeholder="Name *">
<input type="text" class="form-control form-control-sm" id="schuldner-inp-strasse" aria-label="Straße des Schuldners" placeholder="Straße">
<input type="text" class="form-control form-control-sm" id="schuldner-inp-plz" aria-label="PLZ des Schuldners" placeholder="PLZ">
<input type="text" class="form-control form-control-sm" id="schuldner-inp-ort" aria-label="Ort des Schuldners" placeholder="Ort">
<input type="email" class="form-control form-control-sm" id="schuldner-inp-email" aria-label="E-Mail-Adresse des Schuldners" placeholder="E-Mail">
<input type="tel" class="form-control form-control-sm" id="schuldner-inp-telefon" aria-label="Telefonnummer des Schuldners" placeholder="Telefon">
```

**Zeilen 303–319** (Mandanten-Adressbuch-Form — 6 Inputs, gleiches Muster):

Lies die genauen Zeilen und ergänze analog:
```html
<input type="text" class="form-control form-control-sm" id="mandant-inp-name" aria-label="Name des Mandanten" placeholder="Name *">
<input type="text" class="form-control form-control-sm" id="mandant-inp-strasse" aria-label="Straße des Mandanten" placeholder="Straße">
<input type="text" class="form-control form-control-sm" id="mandant-inp-plz" aria-label="PLZ des Mandanten" placeholder="PLZ">
<input type="text" class="form-control form-control-sm" id="mandant-inp-ort" aria-label="Ort des Mandanten" placeholder="Ort">
<input type="email" class="form-control form-control-sm" id="mandant-inp-email" aria-label="E-Mail-Adresse des Mandanten" placeholder="E-Mail">
<input type="tel" class="form-control form-control-sm" id="mandant-inp-telefon" aria-label="Telefonnummer des Mandanten" placeholder="Telefon">
```

### Schritt 4: preise.html – btn-close Zeile 389

Lies `frontend/preise.html` Zeilen 385–395:
```html
<!-- ALT: -->
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
<!-- NEU: -->
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
```

### Schritt 5: Restliche HTML-Dateien – je 1× btn-close

In jeder der folgenden Dateien: `<button type="button" class="btn-close" data-bs-dismiss="modal"></button>` → `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>` ergänzen:

- `frontend/index.html` Zeile 365
- `frontend/changelog.html` Zeile 222
- `frontend/avv.html` Zeile 203
- `frontend/agb.html` Zeile 263
- `frontend/gerichtskostenrechner.html` Zeile 343
- `frontend/zinsrechner.html` Zeile 357
- `frontend/rvg-rechner.html` Zeile 359
- `frontend/datenschutz.html` Zeile 488
- `frontend/tilgungsrechner.html` Zeile 324
- `frontend/impressum.html` Zeile 163

Für jede Datei: Lies die entsprechende Zeile um sicherzustellen dass die Zeile korrekt ist (Zeilennummern können leicht verschoben sein). Greife nach `btn-close` ohne `aria-label` in der jeweiligen Datei.

### Schritt 6: Verifizieren

```bash
grep -rn "btn-close" frontend/*.html | grep -v 'aria-label'
```

Erwartung: 0 Ergebnisse (alle btn-close-Buttons haben aria-label).

### Schritt 7: SW-Version erhöhen

Lies `frontend/sw.js` Zeile 5 und erhöhe beide Versionen um 1.

### Schritt 8: Commit & Push

```bash
git add frontend/forderungsaufstellung.html frontend/konto.html frontend/preise.html \
        frontend/index.html frontend/changelog.html frontend/avv.html frontend/agb.html \
        frontend/gerichtskostenrechner.html frontend/zinsrechner.html frontend/rvg-rechner.html \
        frontend/datenschutz.html frontend/tilgungsrechner.html frontend/impressum.html \
        frontend/sw.js
git commit -m "fix: aria-label für alle Close-Buttons und Formularfelder ergänzt (Accessibility)"
git push origin staging && git push origin staging:main
```

---

## Task 3: F3 – Mobile Layout Overflow untersuchen und beheben

**Dateien:**
- Modify: `frontend/css/app.css` (Mobile Media Queries, ggf. Hero/Card/CTA-Klassen)
- Modify: `frontend/css/rechner.css` (Mobile Media Queries Rechner-Seiten)
- Modify: `frontend/sw.js` (SW-Version)

**Hintergrund:** Headless-Chrome-Screenshots bei 390×1200px zeigen auf mehreren Seiten horizontal abgeschnittenen Inhalt. Betroffen laut Audit: `index.html` (Hero, Feature-Cards, CTA), `preise.html` (Hero, Pricing-Cards), `forderungsaufstellung.html` (Banner, Selects, Logo-Bereich), `zinsrechner.html` und `rvg-rechner.html` (Hero-Texte, Stats, CTA-Boxen).

### Schritt 1: Playwright – Screenshots aller betroffenen Seiten bei 390px

Starte einen lokalen HTTP-Server (Python oder Node) für `frontend/` und verwende den Playwright-MCP-Browser:

```bash
cd C:\Users\Jens\Documents\GitHub\fordify-app
python -m http.server 8080 --directory frontend
```

Navigiere dann mit dem Playwright-Browser zu folgenden URLs bei Viewport 390×844 (iPhone SE) und mache je einen Screenshot:

- `http://localhost:8080/index.html`
- `http://localhost:8080/preise.html`
- `http://localhost:8080/forderungsaufstellung.html`
- `http://localhost:8080/zinsrechner.html`
- `http://localhost:8080/rvg-rechner.html`

Speichere Screenshots lokal (temporär, nicht committen).

### Schritt 2: Overflow-Erkennung via JavaScript

Führe für jede Seite diesen Playwright-evaluate-Befehl aus um überlaufende Elemente zu identifizieren:

```javascript
() => {
  const overflow = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.getBoundingClientRect().width > window.innerWidth + 1) {
      const info = el.tagName.toLowerCase();
      const cls = [...el.classList].slice(0, 3).join('.');
      const id = el.id ? '#' + el.id : '';
      overflow.push(`${info}${id}.${cls}: ${Math.round(el.getBoundingClientRect().width)}px`);
    }
  });
  return [...new Set(overflow)];
}
```

Notiere die überlaufenden Selektoren für jede Seite.

### Schritt 3: CSS-Fixes in app.css und rechner.css

Basierend auf den Overflow-Findings aus Schritt 2, wende folgende Fixes an. Die typischen Ursachen und Fixes sind:

**Bekannte Muster:**

**Hero-Headline mit white-space: nowrap oder min-width:**
```css
/* In @media (max-width: 575px) in app.css oder rechner.css: */
.hero-headline, .fordify-hero h1, .rechner-hero-band h1 {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  white-space: normal;
}
```

**Feature-Cards oder Pricing-Cards mit fester Breite:**
```css
@media (max-width: 575px) {
  .feature-card, .pricing-card {
    min-width: 0;
    width: 100%;
  }
}
```

**CTA-Buttons oder -Bereiche:**
```css
@media (max-width: 575px) {
  .cta-band, .prefooter-cta {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .cta-band .btn, .prefooter-cta .btn {
    white-space: normal;
    word-break: break-word;
  }
}
```

**Stat-Chips mit nowrap:**
```css
@media (max-width: 575px) {
  .rechner-hero-stat, .hero-stat {
    min-width: 0;
    flex-shrink: 1;
  }
}
```

**Allgemeine Overflow-Prävention (falls kein spezifischer Selector greift):**
```css
/* Am Ende des jeweiligen Mobile-Media-Query-Blocks: */
.container, .container-fluid {
  overflow-x: hidden;
}
```

Füge AUSSCHLIESSLICH die Fixes ein, die für die tatsächlich überlaufenden Elemente aus Schritt 2 nötig sind. Keine spekulativen Fixes.

### Schritt 4: Re-Verifikation mit Playwright

Wiederhole Schritt 1 und 2 nach den CSS-Fixes. Das Overflow-Array muss für alle 5 Seiten leer sein (oder zumindest alle identifizierten Elemente aus Schritt 2 behoben sein).

### Schritt 5: SW-Version erhöhen

Lies `frontend/sw.js` Zeile 5 und erhöhe beide Versionen um 1.

### Schritt 6: Commit & Push

```bash
git add frontend/css/app.css frontend/css/rechner.css frontend/sw.js
git commit -m "fix: Mobile-Overflow auf Index, Preise, App und Rechner-Seiten behoben"
git push origin staging && git push origin staging:main
```

---

## Reihenfolge-Abhängigkeiten

- Tasks 1, 2 und 3 sind voneinander unabhängig — Task 1 und 2 können in beliebiger Reihenfolge ausgeführt werden
- Task 3 erfordert Playwright MCP (Playwright-Browser muss verfügbar sein)
- Task 3 muss zuletzt ausgeführt werden, da es am komplexesten ist und von Task 1+2 nicht abhängt

---

## Self-Review

**Spec-Abdeckung:**
- F5 Spreadsheet Formula Injection → Task 1 ✅ (app.js _csvFmla + konto.js _csvQuote)
- F7 Accessibility Close-Buttons → Task 2 ✅ (15 HTML-Dateien, alle btn-close)
- F7 Accessibility Form-Labels → Task 2 ✅ (konto.html 12 Inputs + forderungsaufstellung.html 3 ZV-Inputs)
- F3 Mobile Overflow → Task 3 ✅ (Playwright-Investigation + CSS-Fixes)

**Placeholder-Scan:**
- Task 3 enthält adaptive Fixes (basierend auf Playwright-Findings) — das ist kein Placeholder, sondern eine notwendige Anpassung da die genauen Overflow-Ursachen nur zur Laufzeit mit Playwright bekannt sind. Die CSS-Patterns sind vollständig und produktionsbereit.

**Typ-Konsistenz:**
- `_csvFmla()` in Task 1 definiert und direkt angewendet
- `_csvQuote()` in Task 1 erweitert — kein Namenskonflikt
- `aria-label="Schließen"` konsistent in Task 2 — alle 15 Buttons
