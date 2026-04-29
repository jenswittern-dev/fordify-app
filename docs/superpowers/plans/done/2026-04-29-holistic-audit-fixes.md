# Holistic Audit Fixes – Security, Mobile, Routing, Parsing, CSV, ZV, Utils

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all confirmed security, mobile, routing, parsing, CSV, and ZV issues from the Codex and Antigravity holistic audits (2026-04-29), then consolidate utility functions into a shared `utils.js`.

**Architecture:** Pure Static SPA (no build step). Every task that touches any file under `frontend/` MUST bump the SW cache version in `frontend/sw.js` line 5 — increment both `fordify-vN` and `fordify-staging-vN` by 1 in the same commit. No frameworks, no test runner — verification is by code inspection and manual browser check.

**Tech Stack:** Vanilla JS (ES2017+), Bootstrap 5.3.3, no bundler. Files run directly in the browser.

---

## File Structure

| File | Tasks |
|---|---|
| `frontend/js/app.js` | 1, 2, 5 |
| `frontend/js/konto.js` | 6, 9 |
| `frontend/js/rechner-zins.js` | 5 |
| `frontend/js/rechner-rvg.js` | 5 |
| `frontend/js/zv.js` | 7 |
| `frontend/sw.js` | 4 + version bump each task |
| `frontend/css/rechner.css` | 3 |
| `frontend/css/app.css` | 3 |
| `AGENTS.md` | 8 |
| `docs/SYSTEM.md` | 8 |
| `frontend/js/utils.js` (NEW) | 10 |

---

## Task 1: DOM-XSS – vollständige Absicherung unescapter User-Felder (P1)

**Context:** `app.js` enthält mehrere Stellen, an denen user-kontrollierter Text (`pos.beschreibung`, `alloc.beschreibung`, `z.beschreibung`, `bezeichnung`) direkt via `innerHTML`-Template-Literal gerendert wird, ohne `escHtml()` zu durchlaufen. Das ermöglicht DOM-XSS wenn ein Angreifer manipulierte Daten in den LocalStorage schreibt (z. B. via JSON-Import).

Zusätzlich fehlt `escAttr()` — Value-Attribute wie `value="${pos?.beschreibung || ''}"` sind anfällig für Attribut-Injection (ein `"` im Wert bricht das Attribut auf).

**Files:**
- Modify: `frontend/js/app.js`
- Modify: `frontend/sw.js` (SW-Version bump)

- [ ] **Step 1: `escAttr()` direkt nach `escHtml()` hinzufügen (app.js:15)**

  Aktuelle Datei beginnt mit:
  ```js
  function escHtml(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  ```

  Füge danach ein (nach Zeile 15, vor dem `// ---- State ----`-Kommentar):
  ```js
  function escAttr(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;');
  }
  ```

- [ ] **Step 2: beschrStr in der Positionsliste escapen (app.js:780)**

  Finde:
  ```js
  const beschrStr = positionKurzbeschreibung(pos);
  ```
  Ändere auf:
  ```js
  const beschrStr = escHtml(positionKurzbeschreibung(pos));
  ```
  (Zeile ~780, innerhalb der `.map()` in `renderePositionsliste()`)

- [ ] **Step 3: Value-Attribute in tplHauptforderung() escapen (app.js:1272)**

  Finde:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung" value="${pos?.beschreibung || ""}" placeholder="z.B. Rechnung Nr. 1234 vom …">
  ```
  Ändere auf:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung" value="${escAttr(pos?.beschreibung || '')}" placeholder="z.B. Rechnung Nr. 1234 vom …">
  ```

- [ ] **Step 4: Value-Attribute in tplEinfacheKosten() escapen (app.js:1514)**

  Finde:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung" value="${pos?.beschreibung || label}" placeholder="${label}">
  ```
  Ändere auf:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung" value="${escAttr(pos?.beschreibung || label)}" placeholder="${label}">
  ```

- [ ] **Step 5: Value-Attribut in tplGerichtskosten() escapen (app.js:1560)**

  Finde:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung"
               value="${pos?.beschreibung || "Gerichtskosten"}" placeholder="Gerichtskosten">
  ```
  Ändere auf:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung"
               value="${escAttr(pos?.beschreibung || 'Gerichtskosten')}" placeholder="Gerichtskosten">
  ```

- [ ] **Step 6: Value-Attribut in tplWiederkehrend() escapen (app.js:1586)**

  Finde:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung"
               value="${pos?.beschreibung || ""}" placeholder="z. B. Monatliche Mahnkosten">
  ```
  Ändere auf:
  ```js
  <input type="text" class="form-control" id="mf-beschreibung"
               value="${escAttr(pos?.beschreibung || '')}" placeholder="z. B. Monatliche Mahnkosten">
  ```

- [ ] **Step 7: verrechnungsanweisung in Textarea escapen (app.js:1485)**

  Finde:
  ```js
  <textarea class="form-control form-control-sm" id="mf-verrechnungsanweisung" rows="2"
    placeholder="z.B. genauen Wortlaut der Tilgungsbestimmung aus dem Verwendungszweck eintragen">${pos?.verrechnungsanweisung || ""}</textarea>
  ```
  Ändere auf:
  ```js
  <textarea class="form-control form-control-sm" id="mf-verrechnungsanweisung" rows="2"
    placeholder="z.B. genauen Wortlaut der Tilgungsbestimmung aus dem Verwendungszweck eintragen">${escHtml(pos?.verrechnungsanweisung || '')}</textarea>
  ```

- [ ] **Step 8: alloc.beschreibung in payAllocRow() escapen (app.js:2033)**

  Finde:
  ```js
  const base = alloc.beschreibung
    ? `└ ${formatDate(parseDate(alloc.datum))} ${alloc.beschreibung}`
    : `└ ${formatDate(parseDate(alloc.datum))} Zahlung`;
  ```
  Ändere auf:
  ```js
  const base = alloc.beschreibung
    ? `└ ${formatDate(parseDate(alloc.datum))} ${escHtml(alloc.beschreibung)}`
    : `└ ${formatDate(parseDate(alloc.datum))} Zahlung`;
  ```

- [ ] **Step 9: bezeichnung in claimRow() escapen (app.js:2083)**

  Finde:
  ```js
  return `<tr${hasAllocs ? ' class="summary-row--has-allocs"' : ''}>
    ${datumSpalte}
    <td>${bezeichnung}</td>
  ```
  Ändere auf:
  ```js
  return `<tr${hasAllocs ? ' class="summary-row--has-allocs"' : ''}>
    ${datumSpalte}
    <td>${escHtml(bezeichnung)}</td>
  ```

- [ ] **Step 10: bezeichnung in zinsenNeuRow() escapen (app.js:2060)**

  Finde:
  ```js
  return `<tr class="summary-row--zinsen-neu${hasAllocs ? " summary-row--has-allocs" : ""}">
    ${datumRangeCell(e.vonStr, e.bisDate)}
    <td>${e.bezeichnung}</td>
  ```
  Ändere auf:
  ```js
  return `<tr class="summary-row--zinsen-neu${hasAllocs ? " summary-row--has-allocs" : ""}">
    ${datumRangeCell(e.vonStr, e.bisDate)}
    <td>${escHtml(e.bezeichnung)}</td>
  ```

- [ ] **Step 11: z.beschreibung in der Zahlungszeile escapen (app.js:2141)**

  Finde:
  ```js
  rowsHtml.push(`<tr class="summary-row--zahlung-explicit">
    ${datumCell(z.datum)}
    <td>${z.beschreibung || "Zahlung"}${tilgBadge}</td>
  ```
  Ändere auf:
  ```js
  rowsHtml.push(`<tr class="summary-row--zahlung-explicit">
    ${datumCell(z.datum)}
    <td>${escHtml(z.beschreibung || "Zahlung")}${tilgBadge}</td>
  ```

- [ ] **Step 12: SW-Version in sw.js um 1 erhöhen**

  Datei: `frontend/sw.js`, Zeile 5.
  Aktuell: `const CACHE = IS_STAGING_SW ? "fordify-staging-v135" : "fordify-v180";`
  Erhöhe beide Nummern um 1 (fordify-v181, fordify-staging-v136).

- [ ] **Step 13: Commit**

  ```bash
  git add frontend/js/app.js frontend/sw.js
  git commit -m "fix(security): escAttr() hinzufügen, alle user-Felder in innerHTML/value-Attrs escapen"
  ```

- [ ] **Step 14: Prüfung**

  Öffne `forderungsaufstellung.html`. Erstelle eine Hauptforderung mit `Beschreibung` = `<img src=x onerror=alert(1)>`. Prüfe:
  - Das `<img>`-Tag erscheint als Rohtext in der Positionsliste (nicht als Bild)
  - Das Bearbeitungs-Modal zeigt den Text korrekt im Input-Feld (kein Alert)
  - Die Zusammenfassung zeigt den Text escaped

---

## Task 2: Logo-Injection + Settings-JSON-Validierung (P1)

**Context:** `einst.logo` wird direkt als `src`-Attribut gerendert ohne Validierung (`src="${einst.logo}"`). Beim JSON-Import können beliebige Werte in `logo` und `logoPosition` geschrieben werden, was zur Attribut-Injection und (über Supabase-Sync) zu Stored XSS führen kann.

**Files:**
- Modify: `frontend/js/app.js` (Zeilen ~1647-1652 und ~2477-2484)
- Modify: `frontend/sw.js` (SW-Version bump)

- [ ] **Step 1: Logo-Rendering-Stelle absichern (app.js:1647-1652)**

  Finde:
  ```js
  const einst = ladeEinstellungen();
  const logoPos = einst.logoPosition || "links";
  const logoHtml = einst.logo
    ? `<div class="pdf-logo-wrap pdf-logo-wrap--${logoPos}"><img class="pdf-logo" src="${einst.logo}" alt="Kanzlei-Logo"></div>`
    : "";
  ```
  Ersetze durch:
  ```js
  const einst = ladeEinstellungen();
  const VALID_LOGO_POS = ["links", "mitte", "rechts"];
  const logoPos = VALID_LOGO_POS.includes(einst.logoPosition) ? einst.logoPosition : "links";
  const logoSafe = (typeof einst.logo === "string" && /^data:image\/[a-z+]+;base64,/.test(einst.logo))
    ? einst.logo : null;
  const logoHtml = logoSafe
    ? `<div class="pdf-logo-wrap pdf-logo-wrap--${logoPos}"><img class="pdf-logo" src="${logoSafe}" alt="Kanzlei-Logo"></div>`
    : "";
  ```

- [ ] **Step 2: Settings-JSON-Import validieren (app.js:~2483)**

  Finde in `einstellungenImportieren()`:
  ```js
  const einst = parsed.fordify_settings;
  speichereEinstellungen(einst);
  ```
  Ersetze durch:
  ```js
  const einst = parsed.fordify_settings;
  // Sicherheitsvalidierung: Logo nur als data:image/-URI erlaubt
  if (einst.logo && !/^data:image\/[a-z+]+;base64,/.test(einst.logo)) {
    einst.logo = null;
  }
  // Sicherheitsvalidierung: logoPosition auf Whitelist prüfen
  if (einst.logoPosition && !["links", "mitte", "rechts"].includes(einst.logoPosition)) {
    einst.logoPosition = "links";
  }
  speichereEinstellungen(einst);
  ```

- [ ] **Step 3: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 1.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/js/app.js frontend/sw.js
  git commit -m "fix(security): Logo-Src-Injection verhindern, Settings-JSON-Import auf data:image/ whitlisten"
  ```

- [ ] **Step 5: Prüfung**

  Exportiere die Einstellungen. Ändere im JSON das `logo`-Feld auf `" onerror="alert(1)"` und importiere die Datei. Prüfe, dass:
  - Kein Alert erscheint
  - `ladeEinstellungen().logo` null ist
  - Ein `logoPosition: "evil"` wird auf `"links"` zurückgesetzt

---

## Task 3: Mobile Overflow – Tilgungsrechner 360px + Navbar 768px (P2)

**Context:** Playwright-Tests zeigen:
- `tilgungsrechner.html` bei 360px: +22px Overflow — vermutlich `.tilgung-tabs` mit `white-space: nowrap` bei 3 Tabs
- `changelog.html` bei 768px: +77px Overflow — Desktop-Navbar überläuft bei exakt md-Breakpoint
- `index.html` bei 768px: +3px Overflow — gleiche Navbar-Ursache

**Files:**
- Modify: `frontend/css/rechner.css`
- Modify: `frontend/css/app.css`
- Modify: `frontend/sw.js` (SW-Version bump)

- [ ] **Step 1: Tilgungsrechner-Tabs wrappbar machen (rechner.css)**

  Finde am Ende von `rechner.css` die bestehende `@media (max-width: 575px)`-Sektion (aktuell ca. Zeile 854-883). Füge innerhalb dieser Sektion hinzu:
  ```css
  /* Tilgung-Tabs: Wrap auf kleinen Screens (3 Buttons sonst Overflow) */
  .tilgung-tabs {
    flex-wrap: wrap;
  }
  .tilgung-tab {
    white-space: normal;
    flex: 1 0 auto;
  }
  ```

- [ ] **Step 2: Navbar bei 768-959px kompakter machen (app.css)**

  Füge nach der bestehenden `@media (min-width: 768px)` Sektion (ca. Zeile 203-227) eine neue Regel ein:
  ```css
  /* Navbar-Overflow-Prävention: md-Breakpoint (768px) → kompaktere Nav-Links */
  @media (min-width: 768px) and (max-width: 959px) {
    .navbar-fa .navbar-nav .nav-link {
      font-size: 0.8rem;
      padding-left: 0.35rem;
      padding-right: 0.35rem;
      letter-spacing: 0;
    }
    .navbar-fa .navbar-collapse .btn-sm {
      font-size: 0.78rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }
  ```

- [ ] **Step 3: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 2.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/css/rechner.css frontend/css/app.css frontend/sw.js
  git commit -m "fix(mobile): Tilgungsrechner-Tabs wrappbar, Navbar-Overflow bei 768px beheben"
  ```

- [ ] **Step 5: Prüfung**

  Öffne im Browser-DevTools (Toggle Device Toolbar):
  1. `tilgungsrechner.html` bei 360px Breite: Prüfe, dass kein horizontaler Scrollbalken erscheint und alle 3 Tabs sichtbar sind (ggf. umgebrochen)
  2. `changelog.html` bei 768px Breite: Kein horizontaler Overflow
  3. `index.html` bei 768px Breite: Kein horizontaler Overflow (kein horizontaler Scrollbalken)

  Falls nach den CSS-Änderungen noch Overflow sichtbar ist: Nutze Browser-Devtools „Inspect", um das übergelaufene Element zu identifizieren, und passe die CSS-Regel entsprechend an.

---

## Task 4: Service Worker – Extensionless Routes offline abfangen (P2)

**Context:** Der Service Worker cached `.html`-Dateien (z. B. `/forderungsaufstellung.html`), aber app-interne Navigation und `auth.js`-Redirects verwenden extensionlose URLs (`/forderungsaufstellung`, `/konto`, `/preise`). Im Offline-Modus liefert `caches.match(request)` für `/forderungsaufstellung` kein Ergebnis, da der Key `/forderungsaufstellung.html` ist — der Browser zeigt 404.

Fix: Im `fetch`-Handler prüfen, ob ein navigation-Request ohne Dateiendung vorliegt, und dann den Cache mit `.html` angefragt werden.

**Files:**
- Modify: `frontend/sw.js`

- [ ] **Step 1: Fetch-Handler erweitern (sw.js:75-89)**

  Finde:
  ```js
  self.addEventListener("fetch", e => {
    if (e.request.method !== "GET") return;
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  });
  ```

  Ersetze durch:
  ```js
  self.addEventListener("fetch", e => {
    if (e.request.method !== "GET") return;
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        // Extensionless navigation requests → cached .html-Version versuchen
        if (e.request.mode === "navigate") {
          const url = new URL(e.request.url);
          if (!url.pathname.includes(".")) {
            return caches.match(url.pathname + ".html").then(htmlCached => {
              if (htmlCached) return htmlCached;
              return fetch(e.request).then(res => {
                if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
                return res;
              });
            });
          }
        }
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
  });
  ```

- [ ] **Step 2: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 3. (Dieser Task ändert nur sw.js — einmaliger Bump genügt.)

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/sw.js
  git commit -m "fix(pwa): Service Worker cached extensionless Navigation-URLs auf .html mappen"
  ```

- [ ] **Step 4: Prüfung**

  Installiere den neuen SW (Dev-Tools → Application → Service Workers → Update). Gehe in den Chrome DevTools-Network-Tab auf „Offline". Navigiere zu `localhost/forderungsaufstellung` (ohne `.html`). Erwartet: Die App lädt aus dem Cache, kein 404-Fehler.

---

## Task 5: parseGermanDecimal() – Tausendertrennzeichen-Parsing (P2)

**Context:** `rechner-zins.js:15` und `rechner-rvg.js:28` verwenden `.replace(',', '.')` ohne zuvor Tausenderpunkte zu entfernen. Eingabe `5.000,00` wird als `5.000` geparst (Dezimalpunkt nach 5) statt `5000`. Gleiche Fehler in `app.js:1203` (`streitwertRaw`) und `app.js:1524` (`gkgStreitwert`). `rechner-tilgung.js` ist bereits korrekt: `.replace(/\./g, '').replace(',', '.')`.

**Files:**
- Modify: `frontend/js/rechner-zins.js`
- Modify: `frontend/js/rechner-rvg.js`
- Modify: `frontend/js/app.js`
- Modify: `frontend/sw.js` (SW-Version bump)

- [ ] **Step 1: rechner-zins.js – parseGermanDecimal als lokale Funktion + verwenden**

  Füge am Anfang der IIFE (nach `'use strict';`, vor `const heute = new Date();`) ein:
  ```js
  function parseGermanDecimal(str) {
    return parseFloat(String(str || '').replace(/\./g, '').replace(',', '.')) || 0;
  }
  ```

  Finde Zeile 15:
  ```js
  const betrag = document.getElementById('zins-betrag').value.replace(',', '.');
  ```
  Ändere auf:
  ```js
  const betragRaw = document.getElementById('zins-betrag').value;
  const betrag = String(parseGermanDecimal(betragRaw) || '');
  ```

  Anpassen der Validierung Zeile 20:
  ```js
  if (!betrag || betrag === '.') {
  ```
  Ändere auf:
  ```js
  if (!betragRaw.trim() || parseFloat(betrag) === 0 && betragRaw.trim() !== '0') {
  ```

  **Wichtig:** Prüfe, dass die `new Decimal(betrag)`-Zeile (ca. Zeile 35) weiterhin funktioniert — `betrag` ist jetzt ein String wie `"5000"` oder `"5000.5"`, was Decimal korrekt akzeptiert.

  Alternativ (einfacher): Ändere nur die eine Replace-Zeile ohne Refactoring der Validierung:
  ```js
  const betrag = document.getElementById('zins-betrag').value.replace(/\./g, '').replace(',', '.');
  ```
  Diese Variante ist sicherer, da der Rest unverändert bleibt.

- [ ] **Step 2: rechner-rvg.js – Zeile 28 analog anpassen**

  Finde:
  ```js
  const streitwert = document.getElementById('rvg-streitwert').value.replace(',', '.');
  ```
  Ändere auf:
  ```js
  const streitwert = document.getElementById('rvg-streitwert').value.replace(/\./g, '').replace(',', '.');
  ```

- [ ] **Step 3: app.js – streitwertRaw Zeile 1203 anpassen**

  Finde:
  ```js
  const sw = parseFloat(streitwertRaw.replace(",", "."));
  ```
  Ändere auf:
  ```js
  const sw = parseFloat(streitwertRaw.replace(/\./g, '').replace(',', '.'));
  ```

- [ ] **Step 4: app.js – gkgStreitwert Zeile 1524 anpassen**

  Finde:
  ```js
  const gebuehr = streitwert ? gkgGebuehr(parseFloat(streitwert.replace(",", "."))) : 0;
  ```
  Ändere auf:
  ```js
  const gebuehr = streitwert ? gkgGebuehr(parseFloat(streitwert.replace(/\./g, '').replace(',', '.'))) : 0;
  ```

- [ ] **Step 5: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 4.

- [ ] **Step 6: Commit**

  ```bash
  git add frontend/js/rechner-zins.js frontend/js/rechner-rvg.js frontend/js/app.js frontend/sw.js
  git commit -m "fix(parsing): Tausendertrennzeichen-Entfernung in rechner-zins, rechner-rvg und app.js"
  ```

- [ ] **Step 7: Prüfung**

  Öffne `zinsrechner.html`. Gib Betrag `5.000,00` ein und berechne. Erwartet: Berechnung auf Basis von 5000 EUR, kein NaN/0-Fehler. Öffne `rvg-rechner.html`. Gib Streitwert `10.000` ein. Erwartet: Korrekte RVG-Berechnung für 10000 EUR. Öffne `forderungsaufstellung.html` → Gerichtskosten-Position → Streitwert `50.000` → Erwartet: Korrekte GKG-Berechnung.

---

## Task 6: CSV-Export – FallID, Restforderung, Status (Option B) (P2)

**Context:** `kontoFaelleExportierenAlsCSV()` in `konto.js` (Zeile 1108-1134) exportiert nur 5 Spalten. ROADMAP.md verspricht FallID, Restforderung, Status. Restforderung wird vereinfacht als `max(0, HF-Summe − Zahlungen-Summe)` berechnet.

**Files:**
- Modify: `frontend/js/konto.js`
- Modify: `frontend/sw.js` (SW-Version bump)

- [ ] **Step 1: Hilfsfunktion `_zahlungenSumme()` nach `_hfSumme()` hinzufügen (konto.js nach Zeile 1145)**

  Finde die bestehende `_hfSumme()`-Funktion (Zeile 1138-1145). Füge danach ein:
  ```js
  function _zahlungenSumme(positionen) {
    return (positionen || [])
      .filter(p => p.typ === 'zahlung')
      .reduce((s, p) => {
        const val = parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.'));
        return s + (isNaN(val) ? 0 : val);
      }, 0);
  }
  ```

- [ ] **Step 2: `kontoFaelleExportierenAlsCSV()` erweitern (konto.js:1108-1134)**

  Finde:
  ```js
  const header = ['Aktenzeichen', 'Name', 'Mandant', 'Geändert', 'Gesamtforderung_EUR'];
  const rows = cases.map(c => {
    const az = c.fall?.aktenzeichen || '';
    const gegner = c.fall?.gegner || '';
    const mandant = c.fall?.mandant || '';
    const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('de-DE') : '';
    const summe = _hfSumme(c.fall?.positionen).toFixed(2).replace('.', ',');
    return [az, gegner, mandant, datum, summe].map(_csvQuote).join(';');
  });
  ```
  Ersetze durch:
  ```js
  const header = ['FallID', 'Aktenzeichen', 'Name', 'Mandant', 'Geändert', 'Gesamtforderung_EUR', 'Restforderung_EUR', 'Status'];
  const rows = cases.map(c => {
    const fallId = c.id || '';
    const az = c.fall?.aktenzeichen || '';
    const gegner = c.fall?.gegner || '';
    const mandant = c.fall?.mandant || '';
    const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('de-DE') : '';
    const gesamtHF = _hfSumme(c.fall?.positionen);
    const gezahlt = _zahlungenSumme(c.fall?.positionen);
    const rest = Math.max(0, gesamtHF - gezahlt);
    const statusKey = c.fall_status || 'offen';
    const statusLabel = STATUS_CONFIG[statusKey]?.label || 'Offen';
    return [
      fallId, az, gegner, mandant, datum,
      gesamtHF.toFixed(2).replace('.', ','),
      rest.toFixed(2).replace('.', ','),
      statusLabel
    ].map(_csvQuote).join(';');
  });
  ```

- [ ] **Step 3: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 5.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/js/konto.js frontend/sw.js
  git commit -m "feat(csv): Fälle-Export um FallID, Restforderung und Status erweitern"
  ```

- [ ] **Step 5: Prüfung**

  Melde dich als Pro/Business-Nutzer an. Lege mehrere Fälle mit Zahlungen an und setze verschiedene Status. Klicke „CSV exportieren". Öffne die CSV in Excel/LibreOffice: Prüfe, dass FallID, Restforderung (korrekt minus Zahlungen) und Status vorhanden sind. Formelzeichen (`=SUMME(`)  in der FallID-Spalte müssen mit `'` geprefixed sein.

---

## Task 7: ZV-Formular – Forderungssummen ausfüllen (Option B) (P2)

**Context:** `zv.js` füllt aktuell nur Basisdaten aus (Gerichtsvollzieher, Auftraggeber, Titel, Maßnahmen). Option B: Auch Hauptforderung und Kosten in die entsprechenden PDF-AcroForm-Felder schreiben.

**Wichtig:** Die genauen Feldnamen des PDF-Formulars sind nicht im Code dokumentiert. Der Implementer MUSS zunächst die Feldnamen durch Inspektion des PDFs ermitteln.

**Files:**
- Modify: `frontend/js/zv.js`
- Modify: `frontend/sw.js` (SW-Version bump)

- [ ] **Step 1: PDF-Formular-Feldnamen ermitteln**

  Füge temporär am Ende von `erstelleZVAuftrag()`, direkt nach `const form = pdfDoc.getForm();`, folgendes ein:
  ```js
  // TEMPORÄR: Alle Feldnamen im Browser-Konsole ausgeben
  console.log('ZV-Formular Felder:', form.getFields().map(f => ({ name: f.getName(), type: f.constructor.name })));
  ```
  Führe die ZV-Auftrag-Funktion einmal aus und kopiere die Konsolen-Ausgabe. Suche nach Feldern, die Bezeichnungen wie „Hauptforderung", „Kosten", „Gesamtforderung", „Zinsen", „EUR" oder ähnliche enthalten.

  Entferne den temporären `console.log`-Code nach der Analyse.

- [ ] **Step 2: Hilfsfunktion `_zvForderungsbetraege()` hinzufügen (zv.js)**

  Füge am Ende von `zv.js` (nach `_formatDatum`) ein:
  ```js
  function _zvForderungsbetraege(positionen) {
    const pos = positionen || [];
    const hf = pos
      .filter(p => p.typ === 'hauptforderung')
      .reduce((s, p) => s + parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.')), 0);
    const kosten = pos
      .filter(p => ['anwaltsverguetung', 'mahnkosten', 'gv_kosten', 'sonstige_kosten', 'gerichtskosten'].includes(p.typ))
      .reduce((s, p) => s + parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.')), 0);
    const fmt = n => n.toFixed(2).replace('.', ',') + ' EUR';
    return { hf: fmt(hf), kosten: fmt(kosten) };
  }
  ```

- [ ] **Step 3: Forderungsbeträge in `erstelleZVAuftrag()` eintragen**

  Nach dem ermittelten Feldnamen aus Step 1: Füge im `erstelleZVAuftrag()`-Block nach dem Titel-Block (nach Zeile ca. 46) ein:
  ```js
  // Forderungsbeträge (Page 2/3 des Formulars)
  const betraege = _zvForderungsbetraege(fallDaten.positionen || []);
  set('FELD_HAUPTFORDERUNG', betraege.hf);   // ← Feldnamen aus Step 1 einsetzen
  set('FELD_KOSTEN', betraege.kosten);        // ← Feldnamen aus Step 1 einsetzen
  ```
  Ersetze `FELD_HAUPTFORDERUNG` und `FELD_KOSTEN` durch die tatsächlichen Feldnamen aus der Konsolen-Ausgabe.

  Falls das Formular keine separaten Felder für HF und Kosten hat, sondern nur ein „Gesamtbetrag"-Feld:
  ```js
  const gesamt = (betraege.hf_num + betraege.kosten_num).toFixed(2).replace('.', ',') + ' EUR';
  set('FELD_GESAMTBETRAG', gesamt);
  ```
  Passe `_zvForderungsbetraege()` entsprechend an, um auch numerische Werte zurückzugeben.

- [ ] **Step 4: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 6.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/js/zv.js frontend/sw.js
  git commit -m "feat(zv): Forderungssummen (Hauptforderung + Kosten) in ZV-Auftrag-PDF eintragen"
  ```

- [ ] **Step 6: Prüfung**

  Erstelle einen Fall mit einer Hauptforderung (z. B. 5000,00 EUR) und Anwaltsvergütung (z. B. 487,50 EUR). Generiere den ZV-Auftrag. Öffne das heruntergeladene PDF: Prüfe, dass Hauptforderung und Kosten-Feld mit den korrekten Beträgen befüllt sind.

---

## Task 8: Docs-Sync – AGENTS.md + SYSTEM.md auf aktuelle SW-Version bringen (P2)

**Context:** `AGENTS.md:70` zeigt `fordify-v169 / staging-v124` (stale). `docs/SYSTEM.md:48+360` zeigt `fordify-v176 / fordify-staging-v131` (stale). Beide müssen auf die aktuelle SW-Version synchronisiert werden (die nach Tasks 1-7 um 7 gegenüber v180/v135 gestiegen ist: v187/v142).

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/SYSTEM.md`

- [ ] **Step 1: Aktuelle SW-Version aus sw.js lesen**

  Lies `frontend/sw.js` Zeile 5. Notiere die aktuellen CACHE-Strings (nach Tasks 1-7). Diese sind die Zielversionen für die Docs.

- [ ] **Step 2: AGENTS.md:70 aktualisieren**

  Finde in `AGENTS.md` die Zeile:
  ```
  │   ├── sw.js                   ← Service Worker (aktuell fordify-v169 / staging-v124)
  ```
  Ändere die Version auf die aktuellen CACHE-Strings aus Step 1 (z. B. `fordify-v187 / staging-v142`).

- [ ] **Step 3: docs/SYSTEM.md aktualisieren**

  Finde in `docs/SYSTEM.md` die Zeile (ca. Zeile 48):
  ```
  **Service Worker** (`sw.js`, aktuell `fordify-v176` / Staging `fordify-staging-v131`) cached...
  ```
  Ändere die Version auf die aktuellen CACHE-Strings aus Step 1.

  Finde außerdem (ca. Zeile 360):
  ```
  - Cache-Name: `fordify-v176` (Prod) / `fordify-staging-v131` (Staging)
  ```
  Ändere die Version ebenfalls.

- [ ] **Step 4: Commit (kein SW-Bump nötig — keine Frontend-Dateien geändert)**

  ```bash
  git add AGENTS.md docs/SYSTEM.md
  git commit -m "docs: SW-Version in AGENTS.md und SYSTEM.md auf aktuellen Stand synchronisieren"
  ```

---

## Task 9: target="_blank" ohne rel="noopener noreferrer" in konto.js (P3)

**Context:** `konto.js:772` und `konto.js:778` öffnen `/agb` und `/avv` mit `target="_blank"` aber ohne `rel="noopener noreferrer"`. Das lässt `window.opener` zugänglich — potenzielle Tab-Hijacking-Schwachstelle.

**Files:**
- Modify: `frontend/js/konto.js`
- Modify: `frontend/sw.js` (SW-Version bump)

- [ ] **Step 1: rel-Attribute hinzufügen (konto.js:772 und 778)**

  Finde (Zeile ~772):
  ```js
  &nbsp;<a href="/agb" target="_blank" class="text-muted">lesen ↗</a>
  ```
  Ändere auf:
  ```js
  &nbsp;<a href="/agb" target="_blank" rel="noopener noreferrer" class="text-muted">lesen ↗</a>
  ```

  Finde (Zeile ~778):
  ```js
  &nbsp;<a href="/avv" target="_blank" class="text-muted">lesen ↗</a>
  ```
  Ändere auf:
  ```js
  &nbsp;<a href="/avv" target="_blank" rel="noopener noreferrer" class="text-muted">lesen ↗</a>
  ```

- [ ] **Step 2: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 7.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/js/konto.js frontend/sw.js
  git commit -m "fix(security): rel=\"noopener noreferrer\" für target=\"_blank\"-Links in konto.js"
  ```

---

## Task 10: utils.js – Zentrale Utility-Funktionen (Antigravity-Empfehlung)

**Context:** `escHtml` existiert in 5 Dateien unter verschiedenen Namen (`escHtml` in app.js, `_escHtml` in konto.js, `_escKontakt` in contacts.js, `escapeHtml` in rechner-gkg.js und rechner-rvg.js). `parseGermanDecimal` wurde in Task 5 lokal gepatcht. Alle sollen aus einem zentralen `utils.js` kommen.

**Strategie:** Neue Datei `frontend/js/utils.js` erstellen, alle Implementierungen dort konsolidieren, dann in allen Dateien die lokalen Implementierungen entfernen und die globalen aus utils.js nutzen. `utils.js` muss in alle HTML-Seiten **vor** den anderen JS-Dateien eingebunden werden.

**Files:**
- Create: `frontend/js/utils.js`
- Modify: `frontend/js/app.js` (lokales escHtml/escAttr entfernen, auf global aus utils.js umstellen)
- Modify: `frontend/js/konto.js` (_escHtml-Aufrufe → escHtml)
- Modify: `frontend/js/contacts.js` (_escKontakt-Aufrufe → escAttr)
- Modify: `frontend/js/rechner-gkg.js` (lokales escapeHtml entfernen → escHtml)
- Modify: `frontend/js/rechner-rvg.js` (lokales escapeHtml entfernen → escHtml)
- Modify: `frontend/forderungsaufstellung.html` (utils.js einbinden)
- Modify: `frontend/konto.html` (utils.js einbinden)
- Modify: `frontend/zinsrechner.html` (utils.js einbinden)
- Modify: `frontend/rvg-rechner.html` (utils.js einbinden)
- Modify: `frontend/gerichtskostenrechner.html` (utils.js einbinden)
- Modify: `frontend/tilgungsrechner.html` (utils.js einbinden)
- Modify: `frontend/sw.js` (utils.js zu ASSETS hinzufügen + SW-Version bump)

- [ ] **Step 1: `frontend/js/utils.js` erstellen**

  ```js
  // fordify – Gemeinsame Utility-Funktionen
  "use strict";

  function escHtml(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;');
  }

  function parseGermanDecimal(str) {
    return parseFloat(String(str || '').replace(/\./g, '').replace(',', '.')) || 0;
  }
  ```

- [ ] **Step 2: utils.js zu ASSETS in sw.js hinzufügen**

  Finde in `frontend/sw.js` die ASSETS-Liste. Füge nach `/js/app.js` ein:
  ```js
  "/js/utils.js",
  ```

- [ ] **Step 3: Lokales escHtml + escAttr aus app.js entfernen**

  Finde und entferne die Funktionen `escHtml()` und `escAttr()` am Anfang von `app.js` (Zeilen 8-22). Die Funktionen kommen jetzt aus utils.js, das vor app.js geladen wird. Alle bestehenden `escHtml()`- und `escAttr()`-Aufrufe in app.js bleiben unverändert.

- [ ] **Step 4: Lokales `_escHtml` aus konto.js entfernen + Aufrufe umbenennen**

  Finde und entferne die `_escHtml()`-Funktion in `konto.js` (ca. Zeile 421-428):
  ```js
  function _escHtml(s) {
    ...
  }
  ```

  Ersetze alle `_escHtml(`-Aufrufe in konto.js durch `escHtml(` (globale Suche und Ersetze). Es gibt ca. 20 Stellen.

- [ ] **Step 5: Lokales `_escKontakt` aus contacts.js entfernen + Aufrufe umbenennen**

  Finde und entferne die `_escKontakt()`-Funktion in `contacts.js` (ca. Zeile 76-81).
  Ersetze alle `_escKontakt(`-Aufrufe durch `escAttr(` (contacts.js ist für Attribute-Kontext korrekt).

- [ ] **Step 6: Lokale `escapeHtml` aus rechner-gkg.js entfernen**

  Finde und entferne die `escapeHtml()`-Funktion innerhalb der IIFE in `rechner-gkg.js` (ca. Zeile 9-15).
  Ersetze alle `escapeHtml(`-Aufrufe durch `escHtml(` — da utils.js global geladen wird, ist `escHtml` in der IIFE zugänglich.

- [ ] **Step 7: Lokale `escapeHtml` aus rechner-rvg.js entfernen**

  Finde und entferne die `escapeHtml()`-Funktion innerhalb der IIFE in `rechner-rvg.js` (ca. Zeile 85-91).
  Ersetze alle `escapeHtml(`-Aufrufe durch `escHtml(`.

- [ ] **Step 8: Lokale `parseGermanDecimal` aus rechner-zins.js entfernen (falls in Task 5 als lokale Funktion definiert)**

  Falls in Task 5 eine lokale `parseGermanDecimal`-Funktion in rechner-zins.js hinzugefügt wurde: entferne sie. Die globale aus utils.js wird stattdessen verwendet.
  Falls Task 5 nur die replace-Chain geändert hat (kein separates function-Statement): keine Aktion nötig.

- [ ] **Step 9: utils.js in alle HTML-Seiten einbinden**

  In **jeder** der folgenden HTML-Dateien: `forderungsaufstellung.html`, `konto.html`, `zinsrechner.html`, `rvg-rechner.html`, `gerichtskostenrechner.html`, `tilgungsrechner.html` — füge **als erste JS-Include** (vor allen anderen `<script src=...>`-Tags) ein:
  ```html
  <script src="/js/utils.js"></script>
  ```

- [ ] **Step 10: SW-Version um 1 erhöhen (sw.js:5)**

  Erhöhe die CACHE-Nummern um jeweils 1 gegenüber Task 9.

- [ ] **Step 11: Prüfung**

  Öffne alle 6 Seiten in der Browser-Konsole und prüfe:
  - `typeof escHtml` === `"function"` (global verfügbar)
  - `typeof escAttr` === `"function"` (global verfügbar)
  - `typeof parseGermanDecimal` === `"function"` (global verfügbar)
  - Kein `ReferenceError` in der Konsole
  - Positionsliste in forderungsaufstellung.html rendert korrekt
  - Adressbuch in konto.html zeigt Schuldner-Namen korrekt

- [ ] **Step 12: Commit**

  ```bash
  git add frontend/js/utils.js frontend/js/app.js frontend/js/konto.js frontend/js/contacts.js \
    frontend/js/rechner-gkg.js frontend/js/rechner-rvg.js frontend/js/rechner-zins.js \
    frontend/forderungsaufstellung.html frontend/konto.html frontend/zinsrechner.html \
    frontend/rvg-rechner.html frontend/gerichtskostenrechner.html frontend/tilgungsrechner.html \
    frontend/sw.js
  git commit -m "refactor: utils.js – escHtml, escAttr, parseGermanDecimal zentralisieren; lokale Duplikate entfernen"
  ```

- [ ] **Step 13: Plan abschließen**

  Verschiebe diesen Plan nach `docs/superpowers/plans/done/2026-04-29-holistic-audit-fixes.md`.

  Aktualisiere `docs/ROADMAP.md` — setze alle umgesetzten Punkte auf ✅ mit Datum 2026-04-29:
  - N1: DOM-XSS vollständige Absicherung ✅
  - N2: Logo-Injection + Settings-JSON-Validierung ✅
  - N4: PWA-Offline-Navigation extensionless Routes ✅
  - N5: Tausendertrennzeichen-Parsing systemweit ✅
  - N6: CSV-Export Fälle erweitert (FallID, Restforderung, Status) ✅
  - N7: ZV-Formular Forderungssummen ✅

  Aktualisiere `docs/SYSTEM.md` mit der neuen `utils.js`-Sektion und der finalen SW-Version.
  Aktualisiere `CLAUDE.md` mit der finalen SW-Version.

---

## Self-Review

**Spec-Abdeckung:**
- [x] N1 DOM-XSS: Tasks 1 — escAttr + escHtml auf alle beschreibung/value/innerHTML-Stellen
- [x] N2 Logo-Injection: Task 2 — src-Validation + JSON-Import-Whitelist
- [x] N4 PWA-Routing: Task 4 — SW extensionless routes
- [x] N5 Parsing: Task 5 — parseGermanDecimal in rechner-zins, rechner-rvg, app.js
- [x] N6 CSV: Task 6 — FallID, Restforderung, Status
- [x] N7 ZV: Task 7 — Forderungssummen
- [x] Mobile: Task 3 — tilgungsrechner 360px + navbar 768px
- [x] Docs: Task 8 — AGENTS.md + SYSTEM.md SW-Version
- [x] Security: Task 9 — rel="noopener noreferrer"
- [x] Refactoring: Task 10 — utils.js

**Placeholders:** Keine — alle Code-Schnipsel vollständig (Ausnahme Task 7 Step 3: Feldnamen müssen aus PDF-Inspektion ermittelt werden, dieses ist dokumentiert)

**Konsistenz:** `escHtml`, `escAttr`, `parseGermanDecimal` nach Task 10 durchgehend. SW-Bump in jedem Task explizit ausgewiesen.
