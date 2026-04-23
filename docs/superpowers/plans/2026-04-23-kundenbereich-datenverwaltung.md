# Kundenbereich Datenverwaltung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ROADMAP 6.1–6.4 umsetzen: JSON-Bulk-Import, CSV-Export von Fällen, Schuldner-CSV-Import und Duplizieren-Funktion im Fälle-Tab des Kundenbereichs.

**Architecture:** Alle Änderungen in `frontend/js/konto.js` (Logik) und `frontend/konto.html` (UI). Kein neues JS-Modul. Die Gates nutzen das bestehende `requiresPaid()` / `requiresBusiness()` System aus `gates.js` — das upgradeModal fehlt noch in `konto.html` und wird in Task 1 hinzugefügt. Schuldner-CSV-Import nutzt die bestehende `speichereKontakt()` Funktion aus `contacts.js`.

**Tech Stack:** Vanilla JS, Bootstrap 5.3.3, Supabase (über vorhandene `speichereKontakt()`), FileReader API, Blob/URL-Download-Pattern.

---

## Kontext & Architektur

### Was bereits existiert (nicht anfassen):
- `kontoFaelleExportierenAlle()` — exportiert `{ fordify_cases: { cases: {…}, currentCaseId: … } }` als JSON
- `kontoFallExportieren(id)` — exportiert einzelnen Fall als `{ fall: …, naechsteId: …, exportDatum: … }`
- `kontoFallImportieren(input)` — importiert Einzel-Fall-JSON (erkennt `data.fall`)
- `kontoCSVImportOeffnen()` / `kontoCSVImportDatei(input)` — CSV-Import für neue Fälle (Business-gated)
- `speichereKontakt(type, kontakt)` — speichert Kontakt in Supabase via contacts.js

### Was fehlt:
- **upgradeModal** fehlt in `konto.html` → gates.js-Aufrufe funktionieren zwar (blocken), aber Modal zeigt nicht → muss in Task 1 ergänzt werden
- **Bulk JSON Import**: `kontoFallImportieren` erkennt nur `data.fall`, nicht das `fordify_cases` Bulk-Format
- **Gates in konto.html-Funktionen**: `kontoFaelleExportierenAlle()` und `kontoFallImportieren()` haben keine `requiresPaid`-Prüfung
- **CSV-Export**: fehlt komplett
- **Schuldner CSV-Import**: fehlt komplett
- **Duplizieren**: fehlt in der Fallübersicht

### Datenformate:

**Einzel-Fall JSON** (von `kontoFallExportieren`):
```json
{
  "fall": { "mandant": "...", "gegner": "...", "positionen": [...] },
  "naechsteId": 5,
  "exportDatum": "2026-04-23T..."
}
```

**Bulk JSON** (von `kontoFaelleExportierenAlle`):
```json
{
  "fordify_cases": {
    "cases": { "f1234": { "id": "f1234", "name": "...", "fall": {...}, "naechsteId": 3, "updatedAt": "..." } },
    "currentCaseId": "f1234"
  }
}
```

**Betrag in positionen**: Deutsch-Komma-Format, z.B. `"1.234,56"` → für Summenberechnung:
```js
function _parseBetrag(s) {
  const v = parseFloat((s || '0').replace(/\./g, '').replace(',', '.'));
  return isNaN(v) ? 0 : v;
}
```

**CSV-Import Schuldner** (Semikolon-separiert, UTF-8):
```csv
name;strasse;plz;ort;email;telefon
Mustermann GmbH;Musterstr. 1;12345;Berlin;info@example.com;030 123456
```

### upgradeModal-Markup (in konto.html einfügen, identisch zu forderungsaufstellung.html):
```html
<div class="modal fade" id="upgradeModal" tabindex="-1" aria-labelledby="upgradeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold" id="upgradeModalLabel">Pro-Funktion</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body text-center py-4">
        <div class="mb-3" style="font-size:2rem">🔒</div>
        <p class="fw-semibold mb-1"><span id="upgrade-modal-feature"></span></p>
        <p class="text-muted small mb-4" id="upgrade-modal-desc">Diese Funktion ist ab dem Pro-Plan verfügbar.</p>
        <a href="/preise" class="btn btn-primary" id="upgrade-modal-cta">Pro abonnieren →</a>
      </div>
    </div>
  </div>
</div>
```

---

## Dateien

| Datei | Aktion |
|---|---|
| `frontend/konto.html` | Modify: upgradeModal ergänzen, Buttons hinzufügen |
| `frontend/js/konto.js` | Modify: Gates + neue Funktionen |
| `frontend/js/gates.js` | Modify: featureLabel für 'json-bulk-import' ergänzen |
| `frontend/data/beispiel-schuldner.csv` | Create: Beispiel-CSV für Schuldner-Import |
| `frontend/sw.js` | Modify: Version erhöhen, neue CSV in ASSETS |

---

## Task 1: upgradeModal + Pro-Gates für bestehende Export/Import-Buttons

**Scope:** upgradeModal zu konto.html hinzufügen, `kontoFaelleExportierenAlle()` und `kontoFallImportieren()` mit `requiresPaid`-Guard versehen, `featureLabel`-Eintrag für neue Keys in gates.js ergänzen.

**Files:**
- Modify: `frontend/konto.html`
- Modify: `frontend/js/konto.js`
- Modify: `frontend/js/gates.js`

- [ ] **Step 1: upgradeModal in konto.html einfügen**

In `frontend/konto.html` das upgradeModal direkt vor `</main>` (Zeile 339) einfügen:

```html
<!-- Upgrade-Modal -->
<div class="modal fade" id="upgradeModal" tabindex="-1" aria-labelledby="upgradeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold" id="upgradeModalLabel">Pro-Funktion</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body text-center py-4">
        <div class="mb-3" style="font-size:2rem">🔒</div>
        <p class="fw-semibold mb-1"><span id="upgrade-modal-feature"></span></p>
        <p class="text-muted small mb-4" id="upgrade-modal-desc">Diese Funktion ist ab dem Pro-Plan verfügbar.</p>
        <a href="/preise" class="btn btn-primary" id="upgrade-modal-cta">Pro abonnieren →</a>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Gate zu `kontoFaelleExportierenAlle()` in konto.js hinzufügen**

In `frontend/js/konto.js`, Funktion `kontoFaelleExportierenAlle()` (aktuell Zeile 287):

```js
// Vorher:
function kontoFaelleExportierenAlle() {
  const reg = kontoLadeRegistry();

// Nachher:
function kontoFaelleExportierenAlle() {
  if (requiresPaid('json')) return;
  const reg = kontoLadeRegistry();
```

- [ ] **Step 3: Gate zu `kontoFallImportieren()` in konto.js hinzufügen**

In `frontend/js/konto.js`, Funktion `kontoFallImportieren()` (aktuell Zeile 298):

```js
// Vorher:
function kontoFallImportieren(input) {
  const file = input.files[0];

// Nachher:
function kontoFallImportieren(input) {
  if (requiresPaid('json-import')) return;
  const file = input.files[0];
```

- [ ] **Step 4: Feature-Label für Bulk-Import in gates.js ergänzen**

In `frontend/js/gates.js`, `featureLabels`-Objekt in `_zeigeUpgradeModal()` um einen Eintrag ergänzen:

```js
// Vor:
'csv-import': 'CSV-Import',

// Nach:
'csv-import':          'CSV-Import',
'csv-export':          'CSV-Export',
```

- [ ] **Step 5: Commit**

```bash
git add frontend/konto.html frontend/js/konto.js frontend/js/gates.js
git commit -m "feat: upgradeModal + Pro-Gates für Fälle-Export/Import in konto.html"
```

- [ ] **Step 6: SW-Version erhöhen und pushen**

In `frontend/sw.js` Version erhöhen (z.B. v120 → v121 / staging-v74 → staging-v75), dann:

```bash
git add frontend/sw.js
git commit -m "chore: SW v121"
git push origin staging && git push origin staging:main
```

---

## Task 2: 6.1 Bulk JSON Import (alle Fälle importieren)

**Scope:** `kontoFallImportieren()` um Erkennung des Bulk-Formats `{ fordify_cases: ... }` erweitern; bei Bulk-Import alle Fälle in die Registry einlesen (bestehende Fälle mit gleicher ID überschreiben). Button "Import alle" in konto.html hinzufügen.

**Files:**
- Modify: `frontend/js/konto.js`
- Modify: `frontend/konto.html`

- [ ] **Step 1: Fehlerfall testen (manuell)**

Aktuell: wenn man eine Bulk-JSON-Datei (von "Export alle") in "Import JSON" lädt, erscheint: "Ungültige Datei. Bitte verwenden Sie eine von fordify exportierte Fall-JSON-Datei." — das ist der zu lösende Fehler.

- [ ] **Step 2: `kontoFallImportieren()` um Bulk-Format erweitern**

In `frontend/js/konto.js`, `kontoFallImportieren()` erweitern. Die komplette Funktion sieht nach dem Edit so aus:

```js
function kontoFallImportieren(input) {
  if (requiresPaid('json-import')) return;
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      const reg = kontoLadeRegistry();

      if (data.fordify_cases && data.fordify_cases.cases) {
        // Bulk-Import: alle Fälle aus exportierter Gesamt-JSON
        const imported = Object.values(data.fordify_cases.cases);
        if (imported.length === 0) {
          alert('Die Datei enthält keine Fälle.');
          input.value = '';
          return;
        }
        let count = 0;
        for (const eintrag of imported) {
          if (!eintrag.id || !eintrag.fall) continue;
          reg.cases[eintrag.id] = { ...eintrag, updatedAt: eintrag.updatedAt || new Date().toISOString() };
          count++;
        }
        kontoSpeichereRegistry(reg);
        kontoRendereFaelleTab();
        alert(count + ' Fall' + (count !== 1 ? 'fälle' : '') + ' importiert.');
      } else if (data.fall) {
        // Einzel-Fall-Import
        const id = 'f' + Date.now();
        const mandant = data.fall.mandant || '';
        const gegner  = data.fall.gegner  || '';
        const name = mandant && gegner ? mandant + ' ./. ' + gegner : mandant || gegner || 'Importierter Fall';
        reg.cases[id] = { id, name, updatedAt: new Date().toISOString(), fall: data.fall, naechsteId: data.naechsteId || 1 };
        kontoSpeichereRegistry(reg);
        kontoRendereFaelleTab();
      } else {
        alert('Ungültige Datei. Bitte verwenden Sie eine von fordify exportierte Fall-JSON-Datei.');
      }
    } catch (e) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
    input.value = '';
  };
  reader.onerror = () => {
    alert('Datei konnte nicht gelesen werden.');
    input.value = '';
  };
  reader.readAsText(file);
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/js/konto.js
git commit -m "feat: 6.1 Bulk JSON Import in kontoFallImportieren (fordify_cases Format)"
```

- [ ] **Step 4: Manuell testen**

1. Fälle anlegen → "Export alle" → JSON-Datei speichern
2. Einige Fälle löschen
3. "Import JSON" → die Bulk-JSON-Datei auswählen
4. Erwartung: alle Fälle werden wiederhergestellt, Meldung „N Fallfälle importiert"
5. Testen mit Einzel-Fall-JSON: Erwartung: Fall wird wie bisher importiert

- [ ] **Step 5: Pushen**

```bash
git push origin staging && git push origin staging:main
```

---

## Task 3: 6.2 CSV-Export der Fälle

**Scope:** Neue Funktion `kontoFaelleExportierenAlsCSV()` in konto.js, die alle Fälle als semikolon-separiertes CSV herunterlädt. Spalten: Aktenzeichen, Name (Gegner), Mandant, Geändert (Datum), Gesamtforderung (Summe HF-Beträge). "Export CSV" Button im Fälle-Tab. Gate: Pro+.

**Files:**
- Modify: `frontend/js/konto.js`
- Modify: `frontend/konto.html`

- [ ] **Step 1: Hilfsfunktion `_hfSumme()` + `_csvQuote()` am Ende von konto.js ergänzen**

Nach der letzten Funktion in `frontend/js/konto.js` hinzufügen (genau NACH `_csvZeileZuFall`, d.h. am Ende der Datei):

```js
// ---- CSV-Export Hilfsfunktionen ----

function _hfSumme(positionen) {
  return (positionen || [])
    .filter(p => p.typ === 'hauptforderung')
    .reduce((s, p) => {
      const val = parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.'));
      return s + (isNaN(val) ? 0 : val);
    }, 0);
}

function _csvQuote(val) {
  const s = String(val == null ? '' : val);
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
```

- [ ] **Step 2: `kontoFaelleExportierenAlsCSV()` in konto.js einfügen**

Direkt vor den Hilfsfunktionen aus Step 1 einfügen (d.h. vor `_hfSumme`):

```js
// ---- CSV-Export (6.2) ----

function kontoFaelleExportierenAlsCSV() {
  if (requiresPaid('csv-export')) return;
  const reg = kontoLadeRegistry();
  const cases = Object.values(reg.cases || {}).sort(
    (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')
  );

  const header = ['Aktenzeichen', 'Name', 'Mandant', 'Geändert', 'Gesamtforderung_EUR'];
  const rows = cases.map(c => {
    const az = c.fall?.aktenzeichen || '';
    const gegner = c.fall?.gegner || '';
    const mandant = c.fall?.mandant || '';
    const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('de-DE') : '';
    const summe = _hfSumme(c.fall?.positionen).toFixed(2).replace('.', ',');
    return [az, gegner, mandant, datum, summe].map(_csvQuote).join(';');
  });

  const bom = '﻿';
  const csv = bom + header.map(_csvQuote).join(';') + '\r\n' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Fordify_Faelle_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 3: "Export CSV" Button in konto.html einfügen**

In `frontend/konto.html`, im Fälle-Tab (Zeile ~130), den "Export alle" Button suchen:

```html
<button class="btn btn-sm btn-outline-primary" onclick="kontoFaelleExportierenAlle()">Export alle</button>
```

Danach einen neuen Button einfügen:

```html
<button class="btn btn-sm btn-outline-primary" onclick="kontoFaelleExportierenAlle()">Export JSON</button>
<button class="btn btn-sm btn-outline-primary" onclick="kontoFaelleExportierenAlsCSV()">Export CSV</button>
```

(Den alten "Export alle" Button durch "Export JSON" ersetzen — die Funktion bleibt gleich, nur der Label ändert sich.)

- [ ] **Step 4: Commit**

```bash
git add frontend/js/konto.js frontend/konto.html
git commit -m "feat: 6.2 CSV-Export der Fälle in konto.js + Export-CSV-Button in konto.html"
```

- [ ] **Step 5: Manuell testen**

1. Mehrere Fälle mit HF-Beträgen anlegen (z.B. `"1.500,00"`, `"2.345,67"`)
2. "Export CSV" klicken → Pro-Gate erscheint wenn nicht eingeloggt/paid ✓
3. Als paid Nutzer: CSV-Datei wird heruntergeladen
4. CSV in Excel/LibreOffice öffnen: Spalten korrekt, Gesamtforderung korrekt (BOM sorgt für Sonderzeichen-Anzeige)
5. Sonderzeichen in Namen (Umlaute, `;` im Namen) korrekt escaped

- [ ] **Step 6: Pushen**

```bash
git push origin staging && git push origin staging:main
```

---

## Task 4: 6.3 Schuldner-Adressbuch CSV-Import

**Scope:** Neue Funktion `kontoSchuldnerCSVImportDatei(input)` die eine CSV-Datei liest und Schuldner-Einträge über `speichereKontakt()` in Supabase speichert. Button "Import CSV" im Schuldner-Adressbuch. Beispiel-CSV unter `/data/beispiel-schuldner.csv`. Gate: Pro+ (über `requiresPaid` auf Schuldner-Adressbuch).

**CSV-Format** (Semikolon, UTF-8, Pflichtfeld: `name`):
```
name;strasse;plz;ort;email;telefon
Mustermann GmbH;Musterstraße 1;12345;Berlin;info@mustermann.de;030 123456
Max Schulze;;10117;Berlin;;
```

**Files:**
- Modify: `frontend/js/konto.js`
- Modify: `frontend/konto.html`
- Create: `frontend/data/beispiel-schuldner.csv`
- Modify: `frontend/sw.js` (neue CSV in ASSETS, Version erhöhen)

- [ ] **Step 1: `/data/beispiel-schuldner.csv` erstellen**

```csv
name;strasse;plz;ort;email;telefon
Mustermann GmbH;Musterstraße 1;12345;Berlin;info@mustermann.de;030 123456
Schulze & Partner;Hauptstraße 5;80331;München;;089 654321
Max Meier;;;Hamburg;m.meier@example.com;
```

- [ ] **Step 2: CSV-Import-Funktionen in konto.js ergänzen**

Am Ende von `frontend/js/konto.js` hinzufügen (nach allen anderen Funktionen):

```js
// ---- Schuldner-CSV-Import (6.3) ----

function kontoSchuldnerCSVImportOeffnen() {
  if (requiresPaid('schuldner-adressbuch')) return;
  document.getElementById('schuldner-csv-import-input').click();
}

function kontoSchuldnerCSVImportDatei(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const text = ev.target.result.replace(/^﻿/, ''); // BOM entfernen
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { alert('CSV leer oder kein Header gefunden.'); input.value = ''; return; }

    const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
    const nameIdx    = headers.indexOf('name');
    const strasseIdx = headers.indexOf('strasse');
    const plzIdx     = headers.indexOf('plz');
    const ortIdx     = headers.indexOf('ort');
    const emailIdx   = headers.indexOf('email');
    const telefonIdx = headers.indexOf('telefon');

    if (nameIdx === -1) { alert('Spalte "name" fehlt in der CSV-Datei.'); input.value = ''; return; }

    let ok = 0, skip = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';');
      const name = (cols[nameIdx] || '').trim();
      if (!name) { skip++; continue; }
      const kontakt = {
        name,
        strasse: strasseIdx >= 0 ? (cols[strasseIdx] || '').trim() || null : null,
        plz:     plzIdx     >= 0 ? (cols[plzIdx]     || '').trim() || null : null,
        ort:     ortIdx     >= 0 ? (cols[ortIdx]      || '').trim() || null : null,
        email:   emailIdx   >= 0 ? (cols[emailIdx]    || '').trim() || null : null,
        telefon: telefonIdx >= 0 ? (cols[telefonIdx]  || '').trim() || null : null,
      };
      const result = await speichereKontakt('schuldner', kontakt);
      if (result) ok++; else skip++;
    }
    input.value = '';
    alert(ok + ' Einträge importiert' + (skip ? ', ' + skip + ' übersprungen.' : '.'));
    kontoRendereAdressbuchTab();
  };
  reader.onerror = () => { alert('Datei konnte nicht gelesen werden.'); input.value = ''; };
  reader.readAsText(file, 'UTF-8');
}
```

- [ ] **Step 3: Button + hidden Input in konto.html (Schuldner-Adressbuch-Sektion)**

In `frontend/konto.html`, den Header des Schuldner-Adressbuchs finden (Zeile ~225):

```html
<div class="d-flex align-items-center justify-content-between mb-3">
  <h3 class="h6 mb-0 fw-semibold">Schuldner-Adressbuch</h3>
  <button class="btn btn-sm btn-primary" onclick="kontoAdressbuchFormToggle('schuldner')">+ Neu</button>
</div>
```

Ersetzen durch:

```html
<div class="d-flex align-items-center justify-content-between mb-3">
  <h3 class="h6 mb-0 fw-semibold">Schuldner-Adressbuch</h3>
  <div class="d-flex gap-2">
    <label class="btn btn-sm btn-outline-primary mb-0" role="button" tabindex="0"
           onclick="kontoSchuldnerCSVImportOeffnen(); return false;">
      Import CSV
      <input type="file" accept=".csv" id="schuldner-csv-import-input" style="display:none"
             onchange="kontoSchuldnerCSVImportDatei(this)">
    </label>
    <a href="/data/beispiel-schuldner.csv" class="btn btn-sm btn-outline-secondary" download>Beispiel-CSV</a>
    <button class="btn btn-sm btn-primary" onclick="kontoAdressbuchFormToggle('schuldner')">+ Neu</button>
  </div>
</div>
```

**Hinweis:** Der `onclick` auf dem `<label>` verhindert den Standard-Click (der das file-input öffnen würde), ruft stattdessen `kontoSchuldnerCSVImportOeffnen()` auf, welche die Gate-Prüfung macht und dann `document.getElementById('schuldner-csv-import-input').click()` programmatisch aufruft.

- [ ] **Step 4: `/data/beispiel-schuldner.csv` zu sw.js ASSETS hinzufügen und Version erhöhen**

In `frontend/sw.js`:

```js
// Version erhöhen (z.B. v121 → v122 / staging-v75 → staging-v76)
const CACHE = IS_STAGING_SW ? "fordify-staging-v76" : "fordify-v122";

// In ASSETS-Array ergänzen (nach beispiel-import.csv):
"/data/beispiel-schuldner.csv",
```

- [ ] **Step 5: Commit**

```bash
git add frontend/js/konto.js frontend/konto.html frontend/data/beispiel-schuldner.csv frontend/sw.js
git commit -m "feat: 6.3 Schuldner-Adressbuch CSV-Import + Beispiel-CSV"
```

- [ ] **Step 6: Manuell testen**

1. Als Pro-Nutzer → Tab Adressen → „Import CSV" klicken
2. `beispiel-schuldner.csv` auswählen
3. Erwartung: 3 Einträge importiert, Adressliste aktualisiert sich
4. Als Gast → Upgrade-Modal erscheint
5. „Beispiel-CSV" Download-Link funktioniert

- [ ] **Step 7: Pushen**

```bash
git push origin staging && git push origin staging:main
```

---

## Task 5: 6.4 Fallübersicht – Duplizieren + Gesamtforderung

**Scope:** Jede Zeile in der Fallübersicht erhält einen „Duplizieren"-Button. Der duplizierte Fall bekommt einen neuen ID + Name mit „(Kopie)" Suffix. Die Tabelle zeigt eine neue Spalte „Forderung" mit der Summe der Hauptforderungen.

**Files:**
- Modify: `frontend/js/konto.js`

- [ ] **Step 1: `kontoFallDuplizieren()` in konto.js einfügen**

Direkt nach `kontoFallLoeschen()` (Zeile ~271) in `frontend/js/konto.js` einfügen:

```js
function kontoFallDuplizieren(id) {
  const reg = kontoLadeRegistry();
  const original = reg.cases[id];
  if (!original) return;
  const neueId = 'f' + Date.now();
  const kopie = JSON.parse(JSON.stringify(original)); // deep clone
  kopie.id = neueId;
  kopie.name = (kopie.name || 'Fall') + ' (Kopie)';
  kopie.updatedAt = new Date().toISOString();
  reg.cases[neueId] = kopie;
  kontoSpeichereRegistry(reg);
  kontoRendereFaelleTab();
}
```

- [ ] **Step 2: Tabelle in `kontoRendereFaelleTab()` um Forderung-Spalte + Duplizieren-Button erweitern**

In `frontend/js/konto.js`, die `kontoRendereFaelleTab()` Funktion aufsuchen. Im `listeEl.innerHTML`-Template:

**Header** — vorher:
```html
<tr>
  <th class="ps-3">Fall</th>
  <th>Geändert</th>
  <th style="width:1%;white-space:nowrap;"></th>
</tr>
```

**Header** — nachher:
```html
<tr>
  <th class="ps-3">Fall</th>
  <th>Geändert</th>
  <th class="text-end pe-2">Forderung</th>
  <th style="width:1%;white-space:nowrap;"></th>
</tr>
```

**Row** — vorher (im `cases.map(c => ...)`):
```html
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
```

**Row** — nachher:
```js
// Vor der map-Zeile, `_hfSumme` ist bereits als Hilfsfunktion vorhanden (Task 3)
// Innerhalb der map:
const summe = _hfSumme(c.fall?.positionen);
const summeFormatiert = summe > 0
  ? summe.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  : '—';
```

```html
<td class="ps-3">
  <div class="fw-medium">${_escHtml(c.name || 'Unbenannter Fall')}</div>
  <div class="text-muted" style="font-size:0.75rem;">${positionen} Position${positionen !== 1 ? 'en' : ''}</div>
</td>
<td class="text-muted small">${datum}</td>
<td class="text-end pe-2 small text-muted" style="white-space:nowrap;">${summeFormatiert}</td>
<td>
  <div class="d-flex gap-1 justify-content-end">
    <button class="btn btn-sm" style="background:#eff6ff;color:#1e3a8a;border:none;" onclick="kontoFallLaden('${c.id}')">Laden</button>
    <button class="btn btn-sm" style="background:#f1f5f9;color:#475569;border:none;" onclick="kontoFallDuplizieren('${c.id}')">Kopieren</button>
    <button class="btn btn-sm" style="background:#f1f5f9;color:#475569;border:none;" onclick="kontoFallExportieren('${c.id}')">Export</button>
    <button class="btn btn-sm" style="background:#fef2f2;color:#ef4444;border:none;" onclick="kontoFallLoeschen('${c.id}')">Löschen</button>
  </div>
</td>
```

**Achtung:** Da `_hfSumme` erst in Task 3 hinzugefügt wird, muss Task 3 vor Task 5 abgeschlossen sein. Falls Task 5 zuerst kommt, `_hfSumme` direkt in konto.js als Hilfsfunktion definieren (identischer Code wie in Task 3 beschrieben).

- [ ] **Step 3: Commit**

```bash
git add frontend/js/konto.js
git commit -m "feat: 6.4 Fallübersicht – Duplizieren-Button + Gesamtforderung-Spalte"
```

- [ ] **Step 4: Manuell testen**

1. Fälle mit HF-Beträgen anlegen → Forderungs-Spalte zeigt korrekte Summe
2. Fall ohne HF → zeigt „—"
3. „Kopieren" klicken → neuer Fall mit „(Kopie)" Suffix erscheint oben in der Liste
4. Kopierten Fall laden → identische Positionen wie Original

- [ ] **Step 5: ROADMAP aktualisieren**

In `docs/ROADMAP.md` die Einträge 6.1–6.4 auf ✅ setzen + Datum 2026-04-23 eintragen.

- [ ] **Step 6: Commit + Pushen**

```bash
git add docs/ROADMAP.md
git commit -m "docs: ROADMAP 6.1–6.4 ✅ 2026-04-23"
git push origin staging && git push origin staging:main
```
