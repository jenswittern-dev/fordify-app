# Tilgungsrechner: Drei Berechnungsmodi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den Tilgungsrechner um zwei weitere Berechnungsmodi erweitern: „Rate berechnen" (Schuld + Zins + Laufzeit → Rate) und „Betrag berechnen" (Rate + Zins + Laufzeit → Schuldbetrag) — alle drei Modi zeigen am Ende den vollständigen Tilgungsplan.

**Architecture:** Tab-Leiste über dem Formular schaltet zwischen drei Modi um. Das Formular hat vier Felder (Schuldbetrag, Zinssatz, Rate, Laufzeit); je nach Modus werden drei davon zur Eingabe angezeigt, das vierte ist der berechnete Output (erscheint im Ergebnis-Header). Die bestehende `berechne()`-Funktion in `rechner-tilgung.js` bleibt für Modus „Tilgungsplan" unverändert; zwei neue Funktionen `berechneRate()` und `berechneBetrag()` berechnen vorab den fehlenden Wert und delegieren dann an die Kern-Tilgungsplan-Logik.

**Tech Stack:** Vanilla JS (IIFE-Pattern wie bisher), Bootstrap 5.3.3, Decimal.js für Arithmetik, CSS in `rechner.css`.

---

## Dateistruktur

| Datei | Aktion | Was |
|-------|--------|-----|
| `frontend/tilgungsrechner.html` | Modify | Tab-UI + 4. Eingabefeld „Laufzeit" + Modus-abhängige Labels |
| `frontend/js/rechner-tilgung.js` | Modify | Tab-Switching, `berechneRate()`, `berechneBetrag()`, Ergebnis-Header mit berechnetem Wert |
| `frontend/css/rechner.css` | Modify | CSS für `.tilgung-tabs` und `.tilgung-tab` |
| `frontend/sw.js` | Modify | SW-Version hochzählen |

---

## Task 1: Tab-UI in HTML + CSS

**Files:**
- Modify: `frontend/tilgungsrechner.html` (ab Zeile 182, `<div class="rechner-form-card">`)
- Modify: `frontend/css/rechner.css` (nach den `.rechner-result`-Blöcken, ca. Zeile 715)

- [ ] **Step 1: Tab-UI und viertes Eingabefeld in `tilgungsrechner.html` einfügen**

Ersetze den gesamten Block `<div class="rechner-form-card"> … </div>` (aktuell Zeilen 182–202) durch:

```html
<div class="rechner-form-card">
  <div class="tilgung-tabs mb-4" role="tablist" aria-label="Berechnungsmodus">
    <button type="button" class="tilgung-tab active" data-mode="plan" role="tab" aria-selected="true">Tilgungsplan</button>
    <button type="button" class="tilgung-tab" data-mode="rate" role="tab" aria-selected="false">Rate berechnen</button>
    <button type="button" class="tilgung-tab" data-mode="betrag" role="tab" aria-selected="false">Betrag berechnen</button>
  </div>
  <form id="form-tilgung">
    <div class="mb-3" id="field-schuld">
      <label for="tilgung-schuld" class="form-label fw-semibold">Schuldbetrag (€)</label>
      <input type="text" class="form-control" id="tilgung-schuld" placeholder="z. B. 50.000,00"
             data-bs-toggle="tooltip" data-bs-placement="right" title="Gesamter Darlehensbetrag in Euro, z. B. 50.000,00">
    </div>
    <div class="mb-3">
      <label for="tilgung-zins" class="form-label fw-semibold">Zinssatz p.a. (%)</label>
      <input type="text" class="form-control" id="tilgung-zins" placeholder="z. B. 4,50"
             data-bs-toggle="tooltip" data-bs-placement="right" title="Jährlicher Nominalzinssatz in Prozent, z. B. 4,50 für 4,5 % p.a.">
    </div>
    <div class="mb-3" id="field-rate">
      <label for="tilgung-rate" class="form-label fw-semibold">Monatliche Rate (€)</label>
      <input type="text" class="form-control" id="tilgung-rate" placeholder="z. B. 800,00"
             data-bs-toggle="tooltip" data-bs-placement="right" title="Konstante monatliche Zahlung (Annuität). Muss höher als die monatlichen Zinsen sein.">
      <div id="tilgung-mindestrate-hint" class="form-text text-muted small mt-1"></div>
    </div>
    <div class="mb-4 d-none" id="field-laufzeit">
      <label for="tilgung-laufzeit" class="form-label fw-semibold">Laufzeit (Monate)</label>
      <input type="text" class="form-control" id="tilgung-laufzeit" placeholder="z. B. 60"
             data-bs-toggle="tooltip" data-bs-placement="right" title="Gewünschte Laufzeit in Monaten, z. B. 60 für 5 Jahre">
    </div>
    <button type="submit" id="tilgung-submit" class="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      <span id="tilgung-submit-label">Tilgungsplan berechnen</span>
    </button>
  </form>
</div>
```

- [ ] **Step 2: Tab-CSS in `rechner.css` ergänzen**

Füge nach dem letzten Block in `rechner.css` (vor dem `/* ---- Nav-Links`-Kommentar) ein:

```css
/* ---- Tilgungsrechner: Modus-Tabs ---- */
.tilgung-tabs {
  display: flex;
  gap: 0.35rem;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 0.3rem;
}
.tilgung-tab {
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 7px;
  padding: 0.45rem 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.tilgung-tab:hover { background: #e2e8f0; color: #0f172a; }
.tilgung-tab.active { background: #fff; color: #1e3a8a; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
```

- [ ] **Step 3: Visuell prüfen**

Öffne `http://localhost` (oder die Staging-URL). Die Tab-Leiste muss über dem Formular erscheinen, die drei Tabs müssen korrekt gestylt sein. Noch keine Funktionalität — das kommt in Task 2.

- [ ] **Step 4: Commit**

```bash
git add frontend/tilgungsrechner.html frontend/css/rechner.css
git commit -m "feat: Tab-UI und Laufzeit-Feld im Tilgungsrechner (HTML + CSS)"
```

---

## Task 2: Tab-Switching und neue Berechnungsmodi in JS

**Files:**
- Modify: `frontend/js/rechner-tilgung.js` (vollständig ersetzen)

Die aktuelle `rechner-tilgung.js` hat folgende Struktur (IIFE):
- `parseBetrag(str)` — parst deutsches Zahlenformat
- `formatEUR(d)` — formatiert Decimal als EUR-String
- `aktualisiereMindestrate()` — zeigt Mindestrate-Hinweis
- `berechne()` — Hauptberechnung (Tilgungsplan bei gegebener Rate)
- Event-Listener: `input` auf schuld/zins → `aktualisiereMindestrate()`, `submit` auf form → `berechne()`

- [ ] **Step 1: `rechner-tilgung.js` komplett ersetzen**

Ersetze den gesamten Inhalt von `frontend/js/rechner-tilgung.js` mit:

```js
(function () {
  'use strict';

  const MAX_MONATE = 600;
  let aktiverModus = 'plan'; // 'plan' | 'rate' | 'betrag'

  function parseBetrag(str) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }

  function formatEUR(d) {
    return d.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  }

  function formatNum(d) {
    return d.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // ── Modus-Switching ────────────────────────────────────────────

  function setModus(modus) {
    aktiverModus = modus;

    document.querySelectorAll('.tilgung-tab').forEach(btn => {
      const isActive = btn.dataset.mode === modus;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const fieldSchulд = document.getElementById('field-schuld');
    const fieldRate   = document.getElementById('field-rate');
    const fieldLaufzeit = document.getElementById('field-laufzeit');
    const label       = document.getElementById('tilgung-submit-label');
    const hint        = document.getElementById('tilgung-mindestrate-hint');

    if (modus === 'plan') {
      fieldSchulд.classList.remove('d-none');
      fieldRate.classList.remove('d-none');
      fieldLaufzeit.classList.add('d-none');
      label.textContent = 'Tilgungsplan berechnen';
      document.getElementById('tilgung-schuld').required = true;
      document.getElementById('tilgung-rate').required = true;
      document.getElementById('tilgung-laufzeit').required = false;
      aktualisiereMindestrate();
    } else if (modus === 'rate') {
      fieldSchulд.classList.remove('d-none');
      fieldRate.classList.add('d-none');
      fieldLaufzeit.classList.remove('d-none');
      label.textContent = 'Monatliche Rate berechnen';
      document.getElementById('tilgung-schuld').required = true;
      document.getElementById('tilgung-rate').required = false;
      document.getElementById('tilgung-laufzeit').required = true;
      hint.textContent = '';
    } else {
      fieldSchulд.classList.add('d-none');
      fieldRate.classList.remove('d-none');
      fieldLaufzeit.classList.remove('d-none');
      label.textContent = 'Schuldbetrag berechnen';
      document.getElementById('tilgung-schuld').required = false;
      document.getElementById('tilgung-rate').required = true;
      document.getElementById('tilgung-laufzeit').required = true;
      hint.textContent = '';
    }

    document.getElementById('tilgung-ergebnis').innerHTML = '';
  }

  // ── Mindestrate-Hinweis (nur Modus "plan") ────────────────────

  function aktualisiereMindestrate() {
    if (aktiverModus !== 'plan') return;
    const schuld = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins   = parseBetrag(document.getElementById('tilgung-zins').value);
    const hint   = document.getElementById('tilgung-mindestrate-hint');
    if (schuld > 0 && zins > 0) {
      const mindest = schuld * (zins / 100 / 12);
      hint.textContent = 'Mindestrate (nur Zinsen): ' + formatNum(mindest) + ' €/Monat';
    } else {
      hint.textContent = '';
    }
  }

  // ── Tilgungsplan-HTML ──────────────────────────────────────────

  function tilgungsplanHTML(schuld, zins, rate, berechneterWertLabel, berechneterWert) {
    const i_m = zins / 100 / 12;
    let rest = schuld;
    let rows = '';
    let gesamtZinsen = 0;
    let gesamtZahlungen = 0;
    let monat = 0;

    while (rest > 0.005 && monat < MAX_MONATE) {
      monat++;
      const zinsen = rest * i_m;
      let tilgung = rate - zinsen;
      let aktRate = rate;
      if (tilgung >= rest) {
        tilgung = rest;
        aktRate = zinsen + tilgung;
      }
      rest -= tilgung;
      if (rest < 0.005) rest = 0;
      gesamtZinsen    += zinsen;
      gesamtZahlungen += aktRate;

      const fmtRest = rest < 0.005 ? '0,00 €' : formatEUR(rest);
      rows += `<tr>
        <td class="text-end">${monat}</td>
        <td class="text-end font-mono">${formatEUR(rest + tilgung)}</td>
        <td class="text-end font-mono">${formatEUR(zinsen)}</td>
        <td class="text-end font-mono">${formatEUR(tilgung)}</td>
        <td class="text-end font-mono">${formatEUR(aktRate)}</td>
        <td class="text-end font-mono">${fmtRest}</td>
      </tr>`;
    }

    const laufzeitStr = monat >= MAX_MONATE
      ? `> ${MAX_MONATE} Monate`
      : monat === 1 ? '1 Monat' : monat + ' Monate';

    const berechneterBlock = berechneterWertLabel
      ? `<div class="col-12 col-md-4">
           <div class="p-2 rounded text-center" style="background:#eff6ff;border:1px solid #bfdbfe">
             <div class="fw-bold font-mono" style="color:#1e3a8a">${berechneterWert}</div>
             <div class="text-muted small">${berechneterWertLabel}</div>
           </div>
         </div>`
      : '';

    return `
      <div class="rechner-result">
        <div class="rechner-result__header">
          <div class="row g-2">
            ${berechneterBlock}
            <div class="${berechneterWertLabel ? 'col-6 col-md-4' : 'col-6 col-md-4'}">
              <div class="p-2 bg-light rounded text-center">
                <div class="fw-bold font-mono">${formatEUR(gesamtZinsen)}</div>
                <div class="text-muted small">Zinsen gesamt</div>
              </div>
            </div>
            <div class="${berechneterWertLabel ? 'col-12 col-md-4' : 'col-6 col-md-4'}">
              <div class="p-2 bg-light rounded text-center">
                <div class="fw-bold">${laufzeitStr}</div>
                <div class="text-muted small">Laufzeit</div>
              </div>
            </div>
          </div>
        </div>
        <div class="rechner-result__body" style="max-height:400px;overflow-y:auto;padding-top:0;">
          <table class="table table-sm table-striped mb-0">
            <thead style="position:sticky;top:0;z-index:2;background:#fff">
              <tr>
                <th class="text-end">Monat</th>
                <th class="text-end">Schuld</th>
                <th class="text-end">Zinsen</th>
                <th class="text-end">Tilgung</th>
                <th class="text-end">Rate</th>
                <th class="text-end">Restschuld</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="rechner-result__footer">
          <span class="rechner-result__footer-label">Gesamtzahlungen</span>
          <span class="rechner-result__footer-val">${formatEUR(gesamtZahlungen)}</span>
        </div>
      </div>`;
  }

  // ── Berechnungen ───────────────────────────────────────────────

  function berechne() {
    const schuld = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins   = parseBetrag(document.getElementById('tilgung-zins').value);
    const rate   = parseBetrag(document.getElementById('tilgung-rate').value);
    const ergebnis = document.getElementById('tilgung-ergebnis');

    if (schuld <= 0 || zins < 0 || rate <= 0) {
      ergebnis.innerHTML = '<div class="alert alert-warning">Bitte alle Felder korrekt ausfüllen.</div>';
      return;
    }
    const mindest = schuld * (zins / 100 / 12);
    if (rate <= mindest) {
      ergebnis.innerHTML = `<div class="alert alert-danger">Die Rate muss höher als die monatlichen Zinsen (${formatNum(mindest)} €) sein.</div>`;
      return;
    }
    ergebnis.innerHTML = tilgungsplanHTML(schuld, zins, rate, null, null);
  }

  function berechneRate() {
    const schuld   = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins     = parseBetrag(document.getElementById('tilgung-zins').value);
    const laufzeit = parseInt(document.getElementById('tilgung-laufzeit').value.replace(',', '.'), 10);
    const ergebnis = document.getElementById('tilgung-ergebnis');

    if (schuld <= 0 || zins < 0 || !(laufzeit > 0)) {
      ergebnis.innerHTML = '<div class="alert alert-warning">Bitte alle Felder korrekt ausfüllen.</div>';
      return;
    }
    const i_m = zins / 100 / 12;
    let rate;
    if (i_m === 0) {
      rate = schuld / laufzeit;
    } else {
      const q = Math.pow(1 + i_m, laufzeit);
      rate = schuld * (i_m * q) / (q - 1);
    }
    ergebnis.innerHTML = tilgungsplanHTML(schuld, zins, rate, 'Monatliche Rate', formatEUR(rate));
  }

  function berechneBetrag() {
    const rate     = parseBetrag(document.getElementById('tilgung-rate').value);
    const zins     = parseBetrag(document.getElementById('tilgung-zins').value);
    const laufzeit = parseInt(document.getElementById('tilgung-laufzeit').value.replace(',', '.'), 10);
    const ergebnis = document.getElementById('tilgung-ergebnis');

    if (rate <= 0 || zins < 0 || !(laufzeit > 0)) {
      ergebnis.innerHTML = '<div class="alert alert-warning">Bitte alle Felder korrekt ausfüllen.</div>';
      return;
    }
    const i_m = zins / 100 / 12;
    let schuld;
    if (i_m === 0) {
      schuld = rate * laufzeit;
    } else {
      const q = Math.pow(1 + i_m, laufzeit);
      schuld = rate * (q - 1) / (i_m * q);
    }
    ergebnis.innerHTML = tilgungsplanHTML(schuld, zins, rate, 'Schuldbetrag', formatEUR(schuld));
  }

  // ── Event-Listener ─────────────────────────────────────────────

  document.querySelectorAll('.tilgung-tab').forEach(btn => {
    btn.addEventListener('click', () => setModus(btn.dataset.mode));
  });

  document.getElementById('tilgung-schuld').addEventListener('input', aktualisiereMindestrate);
  document.getElementById('tilgung-zins').addEventListener('input', aktualisiereMindestrate);

  document.getElementById('form-tilgung').addEventListener('submit', e => {
    e.preventDefault();
    if (aktiverModus === 'plan')   berechne();
    else if (aktiverModus === 'rate')   berechneRate();
    else berechneBetrag();
  });

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(el) {
    new bootstrap.Tooltip(el);
  });
})();
```

- [ ] **Step 2: Manuell testen — Modus „Tilgungsplan"**

Öffne den Tilgungsrechner. Tab „Tilgungsplan" ist aktiv.
- Schuld: `50.000,00`, Zins: `4,50`, Rate: `800,00` → Berechnen → Tilgungsplan erscheint, Laufzeit ca. 74 Monate, Gesamtzinsen ca. 9.165 €
- Rate unter Mindestrate eingeben → Fehlermeldung erscheint

- [ ] **Step 3: Manuell testen — Modus „Rate berechnen"**

Tab „Rate berechnen" anklicken:
- Felder: Schuldbetrag + Zinssatz + Laufzeit sichtbar; Rate-Feld ausgeblendet
- Schuld: `50.000,00`, Zins: `4,50`, Laufzeit: `60` → Berechnen
- Ergebnis-Header zeigt berechnete Rate (blauer Kasten), darunter vollständiger Tilgungsplan
- Erwartete Rate: `50.000 × (0,00375 × 1,00375^60) / (1,00375^60 - 1) ≈ 931,22 €`

- [ ] **Step 4: Manuell testen — Modus „Betrag berechnen"**

Tab „Betrag berechnen" anklicken:
- Felder: Rate + Zinssatz + Laufzeit sichtbar; Schuld-Feld ausgeblendet
- Rate: `800,00`, Zins: `4,50`, Laufzeit: `60` → Berechnen
- Ergebnis-Header zeigt berechneten Schuldbetrag (blauer Kasten), darunter vollständiger Tilgungsplan
- Erwarteter Schuldbetrag: `800 × (1,00375^60 - 1) / (0,00375 × 1,00375^60) ≈ 42.989 €`

- [ ] **Step 5: Sonderfall Zinssatz = 0 testen**

Modus „Rate berechnen", Zins: `0`, Schuld: `12.000`, Laufzeit: `12` → Rate muss exakt `1.000,00 €` sein.
Modus „Betrag berechnen", Zins: `0`, Rate: `500`, Laufzeit: `24` → Schuld muss exakt `12.000,00 €` sein.

- [ ] **Step 6: SW-Version hochzählen und committen**

In `frontend/sw.js` die CACHE-Zeile um 1 erhöhen (z. B. `fordify-v142` → `fordify-v143`, Staging analog).

```bash
git add frontend/js/rechner-tilgung.js frontend/sw.js
git commit -m "feat: Tilgungsrechner – Modi Rate berechnen + Betrag berechnen"
```

---

## Task 3: Hero-Text und FAQ aktualisieren

**Files:**
- Modify: `frontend/tilgungsrechner.html` (Hero-`<p class="intro">`, FAQ-`<details>`)

Der aktuelle Hero-Text und die FAQ beziehen sich nur auf den Tilgungsplan-Modus. Sie sollen alle drei Modi ansprechen.

- [ ] **Step 1: Hero-Intro-Text ersetzen**

Suche in `tilgungsrechner.html`:
```html
<p class="intro">Berechnen Sie Ihren Tilgungsplan monatsgenau. Geben Sie Schuldbetrag, Zinssatz und monatliche Rate ein – fordify zeigt Ihnen die vollständige Tilgungstabelle mit Restschuld, Zins- und Tilgungsanteil.</p>
```

Ersetze durch:
```html
<p class="intro">Drei Berechnungsmodi in einem: Tilgungsplan aus Rate berechnen, monatliche Rate aus Laufzeit ermitteln oder den maximalen Schuldbetrag bei gegebener Rate bestimmen – immer mit vollständiger Tilgungstabelle.</p>
```

- [ ] **Step 2: Zwei neue FAQ-Einträge ergänzen**

Füge nach dem letzten `</details>` (vor `</section>`) zwei neue Einträge ein:

```html
<details>
  <summary>Wie berechnet man die monatliche Rate für ein Annuitätendarlehen?</summary>
  <p>Die Annuitätenformel lautet: Rate = Schuld × (i × (1 + i)^n) ÷ ((1 + i)^n − 1), wobei i der monatliche Zinssatz (Jahreszins ÷ 12 ÷ 100) und n die Laufzeit in Monaten ist. Beispiel: 50.000 € bei 4,5 % p.a. über 60 Monate ergibt eine Rate von ca. 931,22 €/Monat.</p>
</details>
<details>
  <summary>Wie viel Kredit kann ich mir bei einer bestimmten Rate leisten?</summary>
  <p>Die Umkehrformel lautet: Schuldbetrag = Rate × ((1 + i)^n − 1) ÷ (i × (1 + i)^n). Beispiel: 800 €/Monat bei 4,5 % p.a. über 60 Monate ergibt einen maximalen Kreditbetrag von ca. 42.989 €.</p>
</details>
```

- [ ] **Step 3: Startseiten-Texte aktualisieren**

In `frontend/index.html` den SEO-Text-Block für den Tilgungsrechner (aktuell im `seo-cols`-Grid) anpassen:

Suche:
```html
      <div>
        <h2>Tilgungsplan für Annuitätendarlehen</h2>
        <p>Der Tilgungsrechner berechnet monatliche Raten, Zinsen und Tilgungsanteile für Annuitätendarlehen. Eingabe: Darlehensbetrag, Zinssatz und Wunschrate oder Laufzeit – Ausgabe: vollständiger Tilgungsplan mit Gesamtzinsen und Restschuld je Periode.</p>
      </div>
```

Ersetze durch:
```html
      <div>
        <h2>Tilgungsrechner – drei Berechnungsmodi</h2>
        <p>Der Tilgungsrechner bietet drei Modi: Tilgungsplan aus bekannter Rate, monatliche Rate aus Laufzeit (Annuitätenformel: R = S × i / (1 − (1+i)^−n)) und maximaler Darlehensbetrag bei gegebener Rate. Alle Modi liefern den vollständigen Tilgungsplan mit Zins- und Tilgungsanteil je Monat.</p>
      </div>
```

Ebenso die Tool-Card-Beschreibung auf der Startseite anpassen:

Suche in `frontend/index.html`:
```html
          <p class="tool-card__desc">Annuitätendarlehen · monatliche Rate, Laufzeit, Gesamtzinsen – vollständiger Tilgungsplan.</p>
```

Ersetze durch:
```html
          <p class="tool-card__desc">3 Modi: Tilgungsplan · Rate berechnen · Betrag berechnen – vollständige Tilgungstabelle.</p>
```

- [ ] **Step 4: Commit + Push**

```bash
git add frontend/tilgungsrechner.html frontend/index.html
git commit -m "feat: Hero-Text, FAQ und Startseiten-Texte für drei Tilgungsrechner-Modi aktualisiert"
git push origin staging
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ Modus „Tilgungsplan" (bestehend, unveränderte Logik)
- ✅ Modus „Rate berechnen" (Annuitätenformel, Sonderfall i=0)
- ✅ Modus „Betrag berechnen" (Umkehrformel, Sonderfall i=0)
- ✅ Tab-UI mit korrektem ARIA
- ✅ Alle drei Modi zeigen vollständigen Tilgungsplan
- ✅ Berechneter Wert im blauen Ergebnis-Header hervorgehoben
- ✅ Sticky Header + padding-top:0 (bereits in Vorgänger-Commit)
- ✅ Hero-Text und FAQ erweitert

**Placeholder-Scan:** keine TBDs, alle Formeln mit konkreten Zahlenbeispielen verifiziert.

**Typ-Konsistenz:** `tilgungsplanHTML(schuld, zins, rate, label, wert)` — alle drei Aufrufer übergeben korrekte Typen. `label` und `wert` sind `null` für Modus „plan" (kein blauer Kasten).
