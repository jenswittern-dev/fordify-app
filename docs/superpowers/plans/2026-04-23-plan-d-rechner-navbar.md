# Plan D: Tilgungsrechner, Zinsmethoden, Navbar-Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement ROADMAP items 3.5 (Tilgungsrechner), 3.6 (Zinsmethoden 30/360) und Navbar-Redesign mit "Rechner"-Dropdown.

**Architecture:**
- Task 1: Neues Tilgungsrechner-HTML + JS (eigenständige SEO-Unterseite, Muster von zinsrechner.html)
- Task 2: `zinsen.js` um `tage30360()` + `methode`-Parameter erweitern; `app.js` Modal + `baueSummaryTabelle` anpassen (per-HF zinsmethode)
- Task 3: "Rechner"-Dropdown in 6 bestehenden Seiten + 1 neuen Seite; CSS in `app.css`; SW-Version bumpen; Footer-Links aktualisieren

**Tech Stack:** Vanilla JS, Bootstrap 5.3.3, decimal.js, Service Worker

---

## Dateistruktur

| Datei | Aktion |
|---|---|
| `frontend/tilgungsrechner.html` | NEU – Tilgungsrechner-Seite |
| `frontend/js/rechner-tilgung.js` | NEU – Tilgungsrechner-Logik |
| `frontend/js/zinsen.js` | ÄNDERN – tage30360(), methode-Parameter in berechneVerzugszinsen() |
| `frontend/js/app.js` | ÄNDERN – zinsmethode in HF-Modal + baueSummaryTabelle/calcZinsen |
| `frontend/css/app.css` | ÄNDERN – .nav-rechner-dropdown CSS |
| `frontend/index.html` | ÄNDERN – Navbar: individuelle Rechner-Links → Dropdown |
| `frontend/preise.html` | ÄNDERN – Navbar: individuelle Rechner-Links → Dropdown |
| `frontend/zinsrechner.html` | ÄNDERN – Navbar: individuelle Links → Dropdown |
| `frontend/rvg-rechner.html` | ÄNDERN – Navbar: individuelle Links → Dropdown |
| `frontend/gerichtskostenrechner.html` | ÄNDERN – Navbar: individuelle Links → Dropdown |
| `frontend/changelog.html` | ÄNDERN – Navbar: individuelle Links → Dropdown |
| `frontend/sw.js` | ÄNDERN – tilgungsrechner.html + rechner-tilgung.js in ASSETS; Version bumpen |
| `docs/ROADMAP.md` | ÄNDERN – 3.5, 3.6 als ✅ markieren |
| `CLAUDE.md` | ÄNDERN – SW-Version aktualisieren |

---

## Task 1: Tilgungsrechner

**Files:**
- Create: `frontend/tilgungsrechner.html`
- Create: `frontend/js/rechner-tilgung.js`

**Kontext:**
- Muster: `frontend/zinsrechner.html` (vollständig lesen vor Implementierung)
- Pattern: Muster von `frontend/js/rechner-zins.js`
- CSS: `frontend/css/rechner.css` + `frontend/css/app.css` (bereits vorhanden, keine Änderungen nötig)
- Die Seite hat NOCH keine navbar-fa Rechner-Dropdown-Änderung (das kommt in Task 3)
- In der Navbar: Statt individuelle Rechner-Links → diese Seite hat schon das Dropdown (wird in Task 3 definiert). Für Task 1: verwende erstmal das gleiche Navbar-Muster wie zinsrechner.html (mit individuellen Links + Tilgungsrechner als active), damit die Seite funktioniert. Task 3 aktualisiert alle Navbars auf Dropdown.

**Tilgungsrechner-Logik:**
```
Inputs:
- Schuldbetrag (€) – z. B. 50000,00
- Zinssatz p.a. (%) – z. B. 4,5
- Monatliche Rate (€) – z. B. 800,00

Berechnung (annuitätische Tilgung):
- Monatlicher Zinssatz: p_m = zinssatzPa / 12 / 100
- Pro Monat:
    Zinsen[n] = Restschuld[n] * p_m  (gerundet auf 2 Dezimalstellen)
    Tilgung[n] = Rate - Zinsen[n]
    Restschuld[n+1] = Restschuld[n] - Tilgung[n]
- Wenn Tilgung[n] <= 0: Fehler (Rate zu niedrig – Schulden wachsen)
- Wenn Restschuld[n+1] <= 0: letzter Monat, Rate = Restschuld[n] + Zinsen[n]
- Max. 600 Monate (50 Jahre) – Sicherheitsbremse

Ausgabe-Tabelle (Monat, Schuld am Anfang, Zinsen, Tilgung, Rate, Restschuld):
- Monat 1, 2, 3, ...
- Letzte Zeile: vollständige Tilgung

Zusammenfassung:
- Gesamtzahlungen (€)
- davon Zinsen gesamt (€)
- Laufzeit (Monate / Jahre und Monate)
```

- [ ] **Schritt 1: Erstelle `frontend/js/rechner-tilgung.js`**

```js
(function () {
  'use strict';

  document.getElementById('form-tilgung').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  document.getElementById('tilgung-schuld').addEventListener('input', aktualisiereMindestrate);
  document.getElementById('tilgung-zins').addEventListener('input', aktualisiereMindestrate);

  function parseBetrag(str) {
    return parseFloat(String(str).replace(/\./g, '').replace(',', '.'));
  }

  function formatEUR(val) {
    return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  }

  function formatNum(val, dez) {
    return val.toFixed(dez ?? 2).replace('.', ',');
  }

  function aktualisiereMindestrate() {
    const schuld = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins   = parseBetrag(document.getElementById('tilgung-zins').value);
    const el     = document.getElementById('tilgung-mindestrate-hint');
    if (!el) return;
    if (isNaN(schuld) || isNaN(zins) || schuld <= 0 || zins <= 0) {
      el.textContent = '';
      return;
    }
    const mindest = (schuld * zins / 12 / 100);
    el.textContent = 'Mindestrate (Zinsdeckung): ' + formatEUR(mindest) + ' – Ihre Rate muss höher sein.';
  }

  function berechne() {
    const ergebnisEl = document.getElementById('tilgung-ergebnis');
    const schuld  = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zinsPA  = parseBetrag(document.getElementById('tilgung-zins').value);
    const rate    = parseBetrag(document.getElementById('tilgung-rate').value);

    if (isNaN(schuld) || schuld <= 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Bitte einen gültigen Schuldbetrag eingeben.</div>';
      return;
    }
    if (isNaN(zinsPA) || zinsPA < 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Bitte einen gültigen Zinssatz eingeben (≥ 0 %).</div>';
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Bitte eine gültige monatliche Rate eingeben.</div>';
      return;
    }

    const pm = zinsPA / 12 / 100;
    const mindestrate = schuld * pm;
    if (pm > 0 && rate <= mindestrate) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Die monatliche Rate (' + formatEUR(rate) + ') deckt nicht einmal die Zinsen (' + formatEUR(mindestrate) + '). Bitte erhöhen Sie die Rate.</div>';
      return;
    }

    const plan = [];
    let rest = schuld;
    let gesamtZinsen = 0;
    let gesamtZahlungen = 0;
    const MAX_MONATE = 600;

    for (let monat = 1; monat <= MAX_MONATE; monat++) {
      const zinsen  = Math.round(rest * pm * 100) / 100;
      let aktRate   = rate;
      let tilgung   = Math.round((aktRate - zinsen) * 100) / 100;
      const restAlt = rest;

      if (rest - tilgung <= 0) {
        // Letzter Monat
        tilgung  = rest;
        aktRate  = zinsen + tilgung;
        rest     = 0;
      } else {
        rest     = Math.round((rest - tilgung) * 100) / 100;
      }

      gesamtZinsen    += zinsen;
      gesamtZahlungen += aktRate;

      plan.push({ monat, schuld: restAlt, zinsen, tilgung, rate: aktRate, rest });

      if (rest <= 0) break;
    }

    if (rest > 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Der Kredit ist innerhalb von 50 Jahren nicht getilgt. Bitte erhöhen Sie die Rate.</div>';
      return;
    }

    const laufzeitMonate = plan.length;
    const jahre  = Math.floor(laufzeitMonate / 12);
    const monate = laufzeitMonate % 12;
    const laufzeitStr = jahre > 0
      ? jahre + ' Jahr' + (jahre !== 1 ? 'e' : '') + (monate > 0 ? ' und ' + monate + ' Monat' + (monate !== 1 ? 'e' : '') : '')
      : monate + ' Monat' + (monate !== 1 ? 'e' : '');

    let rows = '';
    for (const p of plan) {
      rows += `<tr>
        <td class="text-end">${p.monat}</td>
        <td class="text-end font-mono">${formatEUR(p.schuld)}</td>
        <td class="text-end font-mono">${formatEUR(p.zinsen)}</td>
        <td class="text-end font-mono">${formatEUR(p.tilgung)}</td>
        <td class="text-end font-mono">${formatEUR(p.rate)}</td>
        <td class="text-end font-mono">${p.rest <= 0 ? '0,00 €' : formatEUR(p.rest)}</td>
      </tr>`;
    }

    ergebnisEl.innerHTML = `
      <div class="rechner-result">
        <div class="rechner-result__header">
          <div class="rechner-result__header-title">Tilgungsplan · ${laufzeitStr}</div>
          <div class="rechner-result__total-badge">${formatEUR(gesamtZahlungen)}</div>
        </div>
        <div class="rechner-result__summary mb-3 px-3 pt-3">
          <div class="row g-2">
            <div class="col-6 col-md-4">
              <div class="rechner-stat-mini">
                <div class="rechner-stat-mini__val">${formatEUR(schuld)}</div>
                <div class="rechner-stat-mini__label">Schuldbetrag</div>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="rechner-stat-mini">
                <div class="rechner-stat-mini__val">${formatEUR(gesamtZinsen)}</div>
                <div class="rechner-stat-mini__label">Zinsen gesamt</div>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="rechner-stat-mini">
                <div class="rechner-stat-mini__val">${laufzeitStr}</div>
                <div class="rechner-stat-mini__label">Laufzeit</div>
              </div>
            </div>
          </div>
        </div>
        <div class="rechner-result__body" style="max-height:400px;overflow-y:auto;">
          <table class="table table-sm table-striped mb-0">
            <thead class="sticky-top bg-white">
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
      </div>
      <a href="/forderungsaufstellung" class="rechner-cta-box mt-3">
        <div>
          <div class="rechner-cta-box__title">Vollständige Forderungsaufstellung nach § 367 BGB →</div>
          <div class="rechner-cta-box__sub">Zinsen, RVG-Gebühren, Zahlungsverrechnung – alles in einem professionellen Dokument.</div>
        </div>
      </a>`;
  }
})();
```

- [ ] **Schritt 2: Erstelle `frontend/tilgungsrechner.html`**

Volle Datei, Muster exakt wie `frontend/zinsrechner.html`. Unterschiede:

Meta/SEO:
```html
<title>Tilgungsrechner kostenlos – Tilgungsplan berechnen | fordify</title>
<meta name="description" content="Tilgungsplan kostenlos berechnen: Monatliche Rate, Zinsen, Restschuld – als übersichtliche Tabelle. Für Annuitätendarlehen und Ratenkredite.">
<link rel="canonical" href="https://fordify.de/tilgungsrechner">
<!-- og: und twitter: card entsprechend anpassen -->
```

ld+json Schema:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tilgungsrechner",
  "url": "https://fordify.de/tilgungsrechner",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "inLanguage": "de",
  "author": { "@type": "Organization", "name": "fordify", "url": "https://fordify.de" },
  "dateModified": "2026-04-23",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
  "description": "Tilgungsplan kostenlos berechnen"
}
```

BreadcrumbList:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "fordify", "item": "https://fordify.de/" },
    { "@type": "ListItem", "position": 2, "name": "Tilgungsrechner", "item": "https://fordify.de/tilgungsrechner" }
  ]
}
```

Navbar: Genau wie in `zinsrechner.html`, aber `Tilgungsrechner` als aktiver Link (vor Anmelden-Button), und die anderen Rechner als normale Links. Wichtig: `navMenu` als ID verwenden (konsistent mit anderen Seiten).

Navbar-Links für diese Seite (wird in Task 3 auf Dropdown umgestellt):
```html
<li class="nav-item"><a class="nav-link" href="/">Startseite</a></li>
<li class="nav-item"><a class="nav-link" href="/forderungsaufstellung">Forderungsaufstellung</a></li>
<li class="nav-item"><a class="nav-link" href="/zinsrechner">Zinsrechner</a></li>
<li class="nav-item"><a class="nav-link" href="/rvg-rechner">RVG-Rechner</a></li>
<li class="nav-item"><a class="nav-link" href="/gerichtskostenrechner">Gerichtskostenrechner</a></li>
<li class="nav-item"><a class="nav-link fw-semibold" href="/tilgungsrechner" aria-current="page">Tilgungsrechner</a></li>
<li class="nav-item"><a class="nav-link" href="/preise">Preise</a></li>
```

Hero-Band:
```html
<div class="rechner-hero-band">
  <div class="container">
  <nav aria-label="Breadcrumb" class="fordify-breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="/">fordify</a></li>
      <li class="breadcrumb-item active" aria-current="page">Tilgungsrechner</li>
    </ol>
  </nav>
  <div class="rechner-hero-inner">
    <div class="rechner-hero-left">
      <div class="rechner-hero-tag"><span class="rechner-hero-tag-dot"></span>Annuitätendarlehen</div>
      <h1>Tilgungsrechner – kostenlos &amp; tabellarisch</h1>
      <p class="intro">Berechnen Sie Ihren Tilgungsplan monatsgenau. Geben Sie Schuldbetrag, Zinssatz und monatliche Rate ein – fordify zeigt Ihnen die vollständige Tilgungstabelle mit Restschuld, Zins- und Tilgungsanteil.</p>
    </div>
  </div>
  </div>
</div>
```

Formular (col-lg-5):
```html
<div class="rechner-form-card">
  <form id="form-tilgung">
    <div class="mb-3">
      <label for="tilgung-schuld" class="form-label fw-semibold">Schuldbetrag (€)</label>
      <input type="text" class="form-control" id="tilgung-schuld" placeholder="z. B. 50.000,00" required>
    </div>
    <div class="mb-3">
      <label for="tilgung-zins" class="form-label fw-semibold">Zinssatz p.a. (%)</label>
      <input type="text" class="form-control" id="tilgung-zins" placeholder="z. B. 4,50" required>
    </div>
    <div class="mb-3">
      <label for="tilgung-rate" class="form-label fw-semibold">Monatliche Rate (€)</label>
      <input type="text" class="form-control" id="tilgung-rate" placeholder="z. B. 800,00" required>
      <div id="tilgung-mindestrate-hint" class="form-text text-muted small mt-1"></div>
    </div>
    <button type="submit" class="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      Tilgungsplan berechnen
    </button>
  </form>
</div>
```

Ergebnis-Container (col-lg-7):
```html
<div id="tilgung-ergebnis" aria-live="polite" aria-atomic="true"></div>
<a href="/forderungsaufstellung" class="rechner-cta-box mt-4">
  <div>
    <div class="rechner-cta-box__title">Vollständige Forderungsaufstellung erstellen →</div>
    <p class="rechner-cta-box__sub">Zinsen, RVG-Kosten und Zahlungen automatisch nach § 367 BGB verrechnen – als professionelles PDF exportierbar.</p>
  </div>
</a>
```

FAQ-Sektion (nach dem row, vor prefooter):
```html
<section class="faq-section">
  <p class="section-overline mb-1">FAQ</p>
  <h2>Häufige Fragen zum Tilgungsrechner</h2>
  <details>
    <summary>Was ist ein Tilgungsplan?</summary>
    <p>Ein Tilgungsplan ist eine tabellarische Übersicht aller Zahlungen eines Kredits über die gesamte Laufzeit. Er zeigt für jeden Monat den Zinsanteil, den Tilgungsanteil, die Ratenhöhe und die verbleibende Restschuld.</p>
  </details>
  <details>
    <summary>Was ist eine Annuität?</summary>
    <p>Bei einem Annuitätendarlehen bleibt die monatliche Rate (Annuität) konstant. Der Zinsanteil sinkt mit jeder Zahlung, weil die Restschuld kleiner wird – der Tilgungsanteil steigt entsprechend. Am Ende ist der Kredit vollständig getilgt.</p>
  </details>
  <details>
    <summary>Wie berechnet man den Zinsanteil?</summary>
    <p>Zinsanteil = Restschuld × Zinssatz p.a. ÷ 12 ÷ 100. Beispiel: 50.000 € × 4,5 % ÷ 12 = 187,50 €. Die Tilgung ergibt sich dann aus Rate − Zinsen, z. B. 800 € − 187,50 € = 612,50 €.</p>
  </details>
  <details>
    <summary>Was passiert, wenn meine Rate zu niedrig ist?</summary>
    <p>Wenn Ihre monatliche Rate kleiner oder gleich den monatlichen Zinsen ist, wird die Schuld nie getilgt – sie wächst sogar. fordify weist Sie auf die Mindestrate hin und verhindert eine fehlerhafte Berechnung.</p>
  </details>
  <details>
    <summary>Wie lange dauert die Tilgung?</summary>
    <p>Die Laufzeit hängt von Schuldbetrag, Zinssatz und Rate ab. Je höher die Rate über den Mindeszinsen liegt, desto schneller ist der Kredit getilgt. fordify berechnet die genaue Laufzeit automatisch.</p>
  </details>
</section>
```

Footer: Exakt wie in `zinsrechner.html`, aber mit Tilgungsrechner als zusätzlichem Eintrag in der Tools-Liste:
```html
<li><a href="/tilgungsrechner" aria-current="page">Tilgungsrechner</a></li>
```

Skript-Tags am Ende (vor GoatCounter, nach Bootstrap):
```html
<script src="js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="js/decimal.min.js"></script>
<script src="js/config.js"></script>
<script src="js/data.js"></script>
<script src="js/storage.js"></script>
<script src="js/auth-ui.js"></script>
<script src="js/auth.js"></script>
<script src="js/rechner-tilgung.js"></script>
<script data-goatcounter="https://fordify.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
```

- [ ] **Schritt 3: `sw.js` aktualisieren – tilgungsrechner.html + rechner-tilgung.js zu ASSETS hinzufügen, SW-Version bumpen**

In `frontend/sw.js`:
- Staging-Version: `fordify-staging-v85` → `fordify-staging-v86`
- Prod-Version: `fordify-v131` → `fordify-v132`
- ASSETS-Array: `/tilgungsrechner.html` und `/js/rechner-tilgung.js` einfügen (alphabetisch/logisch)

- [ ] **Schritt 4: ROADMAP.md aktualisieren**

In `docs/ROADMAP.md`: ROADMAP 3.5 (Tilgungsrechner) → ✅ 2026-04-23

- [ ] **Schritt 5: Committen und pushen**

```bash
git add frontend/tilgungsrechner.html frontend/js/rechner-tilgung.js frontend/sw.js docs/ROADMAP.md
git commit -m "feat: Tilgungsrechner (ROADMAP 3.5) – tilgungsrechner.html + rechner-tilgung.js"
git push origin staging
git push origin main
```

---

## Task 2: Zinsmethoden (act/365 vs. 30/360) pro Hauptforderung

**Files:**
- Modify: `frontend/js/zinsen.js`
- Modify: `frontend/js/app.js`

**Kontext:**
- `zinsen.js` vollständig lesen (83 Zeilen, überschaubar)
- `app.js`: Relevante Stellen lesen:
  - `leerFall()` (Zeile 16–23) — Position-Datenmodell
  - Hauptforderung-Modal HTML (Zeilen ca. 1245–1315) — `mf-aufschlag`-Felder
  - Position-Aufbau beim Speichern (Zeilen ca. 944–970) — return-Statement mit `aufschlag`
  - `baueSummaryTabelle` (Zeile 1679–1925) — `calcZinsen`-Hilfsfunktion
  - Vorschau-Berechnung (Zeilen ca. 1162–1180) — zweiter `berechneVerzugszinsen`-Aufruf

**Änderungen `zinsen.js`:**

```js
// 1. Neue Hilfsfunktion tage30360 nach tageDiff einfügen:
/**
 * Tageszählung nach 30E/360-Konvention (beide Grenzen inklusiv).
 */
function tage30360(von, bis) {
  let d1 = von.getDate();   const m1 = von.getMonth() + 1;   const y1 = von.getFullYear();
  let d2 = bis.getDate();   const m2 = bis.getMonth() + 1;   const y2 = bis.getFullYear();
  if (d1 > 30) d1 = 30;
  if (d2 > 30) d2 = 30;
  return (y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1) + 1;
}
```

```js
// 2. berechneVerzugszinsen-Signatur: methode-Parameter hinzufügen (default 'act/365')
function berechneVerzugszinsen(betrag, von, bis, aufschlagPP, basiszinssaetze, insoDatum = null, methode = 'act/365') {
  // ...
  for (const p of perioden) {
    const basisSatz = aktuellerBasiszinssatz(p.von, basiszinssaetze);
    const zinssatz = Decimal.max(basisSatz.plus(new Decimal(aufschlagPP)), new Decimal(0));
    const tage = methode === '30/360' ? tage30360(p.von, p.bis) : tageDiff(p.von, p.bis);
    const divisor = methode === '30/360' ? 360 : 365;
    const zinsbetrag = betrag.times(zinssatz).dividedBy(100).times(tage).dividedBy(divisor).toDecimalPlaces(2);
    ergebnis.push({
      von: p.von, bis: p.bis, tage, basiszinssatz: basisSatz,
      aufschlag: new Decimal(aufschlagPP), zinssatz, betrag, zinsbetrag, methode,
    });
  }
  return zusammenfuehren(ergebnis);
}
```

```js
// 3. zusammenfuehren: methode beim Zusammenführen beachten
// Im if-Block für gleichartige Perioden: zusätzlich prev.methode === curr.methode prüfen
// Und beim Neuberechnen des zinsbetrag: divisor aus prev.methode ableiten
if (prev.zinssatz.equals(curr.zinssatz) && prev.betrag.equals(curr.betrag) && prev.methode === curr.methode) {
  const neuTage = prev.tage + curr.tage;
  const divisor = prev.methode === '30/360' ? 360 : 365;
  const neuZinsbetrag = prev.betrag
    .times(prev.zinssatz).dividedBy(100).times(neuTage).dividedBy(divisor).toDecimalPlaces(2);
  result[result.length - 1] = {
    von: prev.von, bis: curr.bis, tage: neuTage,
    basiszinssatz: prev.basiszinssatz, aufschlag: prev.aufschlag,
    zinssatz: prev.zinssatz, betrag: prev.betrag, zinsbetrag: neuZinsbetrag, methode: prev.methode,
  };
}
```

**Änderungen `app.js`:**

1. **Position-Datenmodell** (Zeile ~949–954, Hauptforderung-Position): `zinsmethode` hinzufügen:
```js
return {
  ...basis,
  zinsBis: v("mf-zins-bis"),
  aufschlag: parseInt(v("mf-aufschlag"), 10) || state.fall.aufschlagPP,
  zinsmethode: v("mf-zinsmethode") || 'act/365',  // NEU
  betrag: v("mf-betrag"),
};
```

2. **Zweiter Position-Pfad** (Zeile ~957–970, Hauptforderung-Berechnung):
```js
const zinsmethode = v("mf-zinsmethode") || 'act/365';  // NEU
// ...
const perioden = berechneVerzugszinsen(
  betrag, parseDate(von), parseDate(bis), aufschlag, BASISZINSSAETZE, insoDatum, zinsmethode  // NEU
);
```

3. **Modal HTML** – Zinsmethode-Select nach dem Aufschlag-Feld einfügen (beide Stellen: geschlossene HF ~Zeile 1271 UND offene HF ~Zeile 1309):

Genau nach der `mf-aufschlag`-Input-Gruppe jeweils einfügen:
```html
<div class="mb-3">
  <label class="form-label">Zinsmethode</label>
  <select class="form-select" id="mf-zinsmethode">
    <option value="act/365" ${(!pos?.zinsmethode || pos?.zinsmethode === 'act/365') ? 'selected' : ''}>act/365 – Taggenau (§ 288 BGB Standard)</option>
    <option value="30/360" ${pos?.zinsmethode === '30/360' ? 'selected' : ''}>30/360 – Kaufmännisch (vertragliche Zinsen)</option>
  </select>
</div>
```

Für die offene HF mit `data-onchange="1"`:
```html
<select class="form-select" id="mf-zinsmethode" data-onchange="1">
```

4. **Vorschau-Berechnung** (~Zeile 1162–1180):
```js
const methode = document.getElementById("mf-zinsmethode")?.value || 'act/365';
// ...
const perioden = berechneVerzugszinsen(
  betrag, parseDate(von), parseDate(bis), aufschlag, BASISZINSSAETZE, insoDatum, methode
);
```

5. **`baueSummaryTabelle` – `calcZinsen`** (~Zeile 1712–1723):

`calcZinsen` bekommt optionalen `methode`-Parameter:
```js
function calcZinsen(betrag, vonStr, bisDate, methode) {
  if (!vonStr || !betrag || new Decimal(betrag).lte(0)) return ZERO;
  const vonDate = parseDate(vonStr);
  if (vonDate >= bisDate) return ZERO;
  try {
    const per = berechneVerzugszinsen(
      new Decimal(betrag).toFixed(2), vonDate, bisDate,
      aufschlagPP, basiszinssaetze, insoDatum, methode || 'act/365'
    );
    return per.reduce((s, p) => s.plus(new Decimal(p.zinsbetrag)), ZERO);
  } catch(e) { return ZERO; }
}
```

Alle Aufrufe von `calcZinsen` innerhalb `baueSummaryTabelle` (initiale HF-Zinsen + Post-Zahlung-Zinsen) mit `hf.zinsmethode` ergänzen:
```js
const z = calcZinsen(hf.betrag, zp.zinsVon, phase0End, hf.zinsmethode);
```
(Ähnlich für alle weiteren calcZinsen-Aufrufe in der Funktion – alle lesen, anpassen.)

6. **Positionsbezeichnung** (~Zeile 2150–2152): Zinsmethode in der Bezeichnung anzeigen, wenn 30/360:
```js
case "zinsforderung_titel":
  return `Laufende Zinsen ab ${formatDate(parseDate(pos.zinsBis))}, ${pos.aufschlag || state.fall.aufschlagPP} PP${pos.zinsmethode === '30/360' ? ', 30/360' : ''}`;
case "zinsperiode":
  return `Zinsen ${formatDate(parseDate(pos.zinsVon))} – ${formatDate(parseDate(pos.zinsBis))} (${pos.tage || "?"} Tage, ${pos.aufschlag || state.fall.aufschlagPP} PP${pos.zinsmethode === '30/360' ? ', 30/360' : ''})`;
```

- [ ] **Schritt 1: `zinsen.js` anpassen**

Lese die komplette `zinsen.js` (83 Zeilen). Füge `tage30360()` nach `tageDiff()` ein. Passe `berechneVerzugszinsen()` um `methode`-Parameter an (siebter Parameter, default `'act/365'`). Passe `zusammenfuehren()` an (Methoden-Check + korrekter Divisor beim Merge). Bestehende Funktionssignatur ist kompatibel (neuer Parameter optional am Ende, bestehende Aufrufe ohne `methode` bleiben gültig und nutzen `'act/365'`).

- [ ] **Schritt 2: Alle relevanten Stellen in `app.js` lokalisieren und anpassen**

Lese `app.js` vollständig (2100+ Zeilen) mit Fokus auf:
- `leerFall()` — Anmerkung: `zinsmethode` ist per-Position, nicht per-Fall
- Beide Stellen mit `mf-aufschlag` (~1271, ~1309) → Modal-HTML ergänzen
- Beide Stellen mit `v("mf-aufschlag")` im Position-Speicher-Code (~949, ~960) → `zinsmethode` mitspeichern
- `baueSummaryTabelle` → `calcZinsen` + alle Aufrufe
- Vorschau-Berechnung (~1165)
- Positionsbezeichnungen (~2150)

Dabei exakt die Zeilennummern per grep/read verifizieren bevor bearbeiten. Die erste der beiden Modal-Stellen dient einer "geschlossenen" Hauptforderung (mit fix gesetztem Betrag), die zweite dient der "aktiven" Hauptforderung mit Live-Vorschau (`data-onchange="1"`).

- [ ] **Schritt 3: SW-Version bumpen**

Staging: `v86` → `v87`, Prod: `v132` → `v133`

- [ ] **Schritt 4: ROADMAP.md aktualisieren**

ROADMAP 3.6 (Zinsmethoden) → ✅ 2026-04-23

- [ ] **Schritt 5: Committen und pushen**

```bash
git add frontend/js/zinsen.js frontend/js/app.js frontend/sw.js docs/ROADMAP.md
git commit -m "feat: Zinsmethoden act/365 + 30/360 pro Hauptforderung (ROADMAP 3.6)"
git push origin staging
git push origin main
```

---

## Task 3: Navbar Rechner-Dropdown

**Files:**
- Modify: `frontend/css/app.css`
- Modify: `frontend/index.html`
- Modify: `frontend/preise.html`
- Modify: `frontend/zinsrechner.html`
- Modify: `frontend/rvg-rechner.html`
- Modify: `frontend/gerichtskostenrechner.html`
- Modify: `frontend/changelog.html`
- Modify: `frontend/tilgungsrechner.html` (erstellt in Task 1, jetzt anpassen)
- Modify: `frontend/sw.js` (SW-Version bumpen)
- Modify: `docs/ROADMAP.md`
- Modify: `CLAUDE.md`

**Kontext:**
- Aktuelle Navbar-Styles: `app.css` Zeilen 76–289 (navbar-fa, nav-link, nav-account-dropdown)
- `.nav-account-dropdown` (Zeile 1799–1802) als Referenz für Custom-Dropdown-Styling
- Betroffene Seiten: 7 Seiten, die **alle** individuelle Rechner-Links in der Navbar haben (index, preise, zinsrechner, rvg-rechner, gerichtskostenrechner, changelog, tilgungsrechner)
- Nicht betroffene Seiten (haben eigene simple Navbar ohne Rechner-Links): agb, avv, datenschutz, impressum, konto, forderungsaufstellung

**Design-Spec Rechner-Dropdown:**
- Label: "Rechner" mit Dropdown-Toggle
- Breite: `min-width: 280px`
- Stil: weißer Hintergrund, `border-radius: 10px`, `box-shadow: 0 8px 24px rgba(0,0,0,0.15)`
- Items: `display: flex`, Icon-Badge links + Text rechts
- Icon-Badge: 32×32px, `#eff6ff` Hintergrund, `border-radius: 6px`, SVG-Icon
- Item-Name: `font-weight: 600`, `font-size: 0.85rem`
- Item-Beschreibung: `font-size: 0.72rem`, `color: #64748b`
- Hover: `background: #eff6ff`, Text `color: #1e3a8a`
- Text-Farbe in Dropdown: `color: #1e293b` (dunkel, da Dropdown weißer Hintergrund)

**SVG-Icons für Dropdown-Items:**
- Zinsrechner: `%`-Symbol als Text im Badge
- RVG-Rechner: `§`-Symbol als Text im Badge
- GKG-Rechner: Waage-SVG oder `⚖`
- Tilgungsrechner: Kalender/Tabellen-SVG

Für konsistente Rendering: Verwende styled `<span>` mit Text statt Emoji:
```html
<!-- Zinsrechner -->
<span class="nav-rechner-icon" aria-hidden="true" style="font-size:0.9rem;font-weight:700;color:#1e3a8a;">%</span>
<!-- RVG-Rechner -->
<span class="nav-rechner-icon" aria-hidden="true" style="font-size:0.9rem;font-weight:700;color:#1e3a8a;">§</span>
<!-- GKG-Rechner -->
<span class="nav-rechner-icon" aria-hidden="true" style="font-size:1rem;color:#1e3a8a;">⚖</span>
<!-- Tilgungsrechner -->
<span class="nav-rechner-icon" aria-hidden="true" style="font-size:0.9rem;font-weight:700;color:#1e3a8a;">↓</span>
```

**Dropdown HTML (Muster – auf jeder Seite einfügen, `aria-current` nur auf dem aktiven Item):**
```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" id="navRechnerDropdown" role="button"
     data-bs-toggle="dropdown" aria-expanded="false">Rechner</a>
  <ul class="dropdown-menu nav-rechner-dropdown" aria-labelledby="navRechnerDropdown">
    <li>
      <a class="dropdown-item nav-rechner-item" href="/zinsrechner">
        <span class="nav-rechner-icon" aria-hidden="true">%</span>
        <span class="nav-rechner-text">
          <span class="nav-rechner-name">Zinsrechner</span>
          <span class="nav-rechner-desc">Verzugszinsen nach § 288 BGB</span>
        </span>
      </a>
    </li>
    <li>
      <a class="dropdown-item nav-rechner-item" href="/rvg-rechner">
        <span class="nav-rechner-icon" aria-hidden="true">§</span>
        <span class="nav-rechner-text">
          <span class="nav-rechner-name">RVG-Rechner</span>
          <span class="nav-rechner-desc">Anwaltsgebühren nach RVG</span>
        </span>
      </a>
    </li>
    <li>
      <a class="dropdown-item nav-rechner-item" href="/gerichtskostenrechner">
        <span class="nav-rechner-icon" aria-hidden="true">⚖</span>
        <span class="nav-rechner-text">
          <span class="nav-rechner-name">GKG-Rechner</span>
          <span class="nav-rechner-desc">Gerichtskosten nach Streitwert</span>
        </span>
      </a>
    </li>
    <li>
      <a class="dropdown-item nav-rechner-item" href="/tilgungsrechner">
        <span class="nav-rechner-icon" aria-hidden="true">↓</span>
        <span class="nav-rechner-text">
          <span class="nav-rechner-name">Tilgungsrechner</span>
          <span class="nav-rechner-desc">Tilgungsplan & Annuitäten</span>
        </span>
      </a>
    </li>
  </ul>
</li>
```

Auf der **aktiven** Rechner-Seite:
- Dropdown-Toggle bekommt `class="nav-link dropdown-toggle active"` (blaue Unterlinie = aktiv)
- Das aktive Item im Dropdown bekommt `aria-current="page"` und `class="dropdown-item nav-rechner-item active-item"` mit leicht hervorgehobenem Style

**CSS-Ergänzungen in `frontend/css/app.css`** (nach `.nav-account-dropdown`-Block einfügen, ca. Zeile 1803):

```css
/* ── Rechner-Dropdown ─────────────────────────────────────── */
.nav-rechner-dropdown {
  min-width: 280px;
  padding: 0.5rem 0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border: 1px solid rgba(0,0,0,0.08);
}
.nav-rechner-item {
  display: flex !important;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem !important;
  color: #1e293b !important;
  text-decoration: none;
}
.nav-rechner-item:hover,
.nav-rechner-item:focus {
  background: #eff6ff !important;
  color: #1e3a8a !important;
}
.nav-rechner-item.active-item {
  background: #eff6ff;
}
.nav-rechner-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 6px;
  flex-shrink: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e3a8a;
}
.nav-rechner-item:hover .nav-rechner-icon,
.nav-rechner-item:focus .nav-rechner-icon {
  background: #dbeafe;
}
.nav-rechner-text {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}
.nav-rechner-name {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
  color: inherit;
}
.nav-rechner-desc {
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1.3;
}
.nav-rechner-item:hover .nav-rechner-desc,
.nav-rechner-item:focus .nav-rechner-desc {
  color: #3b82f6;
}
/* Dropdown-Toggle im Dark-Navbar: aktiver State */
.navbar-fa .nav-item.dropdown .nav-link.dropdown-toggle.active {
  color: #fff;
  font-weight: 600;
  border-bottom-color: #60a5fa;
}
```

**Footer-Aktualisierung:** In allen 7 betroffenen Seiten den Footer-"Tools"-Abschnitt um Tilgungsrechner ergänzen:
```html
<li><a href="/tilgungsrechner">Tilgungsrechner</a></li>
```
(nach Gerichtskostenrechner, vor dem Ende der Liste)

**Reihenfolge der navbar-nav auf allen 7 Seiten nach dem Umbau:**
```html
<li class="nav-item"><a class="nav-link" href="/">Startseite</a></li>
<li class="nav-item"><a class="nav-link" href="/forderungsaufstellung">Forderungsaufstellung</a></li>
<li class="nav-item dropdown"><!-- Rechner-Dropdown hier --></li>
<li class="nav-item"><a class="nav-link" href="/preise">Preise</a></li>
```
(Die individuelle Rechner-Linkliste ersetzt durch ein Dropdown-Element.)

- [ ] **Schritt 1: CSS in `app.css` einfügen**

Lese `app.css` – finde den Block nach `.nav-account-dropdown` (ca. Zeile 1803). Füge den Rechner-Dropdown-CSS-Block unmittelbar danach ein.

- [ ] **Schritt 2: `index.html` Navbar aktualisieren**

Lese `index.html` (Navbar-Zeilen ~61–90). Ersetze die drei einzelnen `<li>`-Elemente für Zinsrechner, RVG-Rechner, Gerichtskostenrechner durch den Rechner-Dropdown. Füge Tilgungsrechner im Footer-Tools-Abschnitt hinzu. Auf dieser Seite: kein Rechner aktiv, kein `active` auf dem Dropdown-Toggle, kein `aria-current` auf Dropdown-Items.

- [ ] **Schritt 3: `preise.html` Navbar aktualisieren**

Wie Schritt 2 – kein aktiver Rechner.

- [ ] **Schritt 4: `zinsrechner.html` Navbar aktualisieren**

Dropdown-Toggle: `class="nav-link dropdown-toggle active"`. Zinsrechner-Item im Dropdown: `aria-current="page"` + `class="dropdown-item nav-rechner-item active-item"`.

- [ ] **Schritt 5: `rvg-rechner.html` Navbar aktualisieren**

Wie Schritt 4, aber RVG-Rechner-Item aktiv.

- [ ] **Schritt 6: `gerichtskostenrechner.html` Navbar aktualisieren**

Wie Schritt 4, aber GKG-Rechner-Item aktiv.

- [ ] **Schritt 7: `changelog.html` Navbar aktualisieren**

`changelog.html` hatte nur Zinsrechner + RVG-Rechner individuell (kein GKG-Rechner). Jetzt alle 4 im Dropdown. Kein aktiver Rechner. Tilgungsrechner in Footer-Tools hinzufügen.

- [ ] **Schritt 8: `tilgungsrechner.html` Navbar aktualisieren**

Die in Task 1 erstellte Seite hatte noch individuelle Links. Jetzt auf Dropdown umstellen. Tilgungsrechner-Item aktiv. Footer ist schon korrekt (mit `aria-current="page"` auf eigenem Link).

- [ ] **Schritt 9: SW-Version bumpen**

Staging: `v87` → `v88`, Prod: `v133` → `v134`

(Hinweis: Die SW-Version nach Task 2 war v87/v133. Dieser Task ändert nur HTML/CSS, SW-Assets-Liste ändert sich nicht, aber HTML ändert sich → Version trotzdem bumpen.)

- [ ] **Schritt 10: ROADMAP.md + CLAUDE.md aktualisieren**

`ROADMAP.md`: Navbar-Redesign → ✅ 2026-04-23
`CLAUDE.md`: SW-Version `fordify-v134` / `fordify-staging-v88` aktualisieren

- [ ] **Schritt 11: Committen und pushen**

```bash
git add frontend/css/app.css frontend/index.html frontend/preise.html \
        frontend/zinsrechner.html frontend/rvg-rechner.html \
        frontend/gerichtskostenrechner.html frontend/changelog.html \
        frontend/tilgungsrechner.html frontend/sw.js \
        docs/ROADMAP.md CLAUDE.md
git commit -m "feat: Navbar Rechner-Dropdown mit Tilgungsrechner (ROADMAP 3.5/3.6 Navbar)"
git push origin staging
git push origin main
```
