# CSV-Import (Business) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Business-only CSV-Import: eine CSV-Datei mit mehreren Fällen hochladen, jede Zeile wird als eigener Fall mit einer Hauptforderung in der Registry gespeichert.

**Architecture:** Zwei neue JS-Funktionen in `konto.js` (`kontoCSVImportOeffnen` als Gate-Wrapper, `kontoCSVImportDatei` als FileReader-Handler) plus drei private Hilfsfunktionen (`_parseCSV`, `_csvSplitLine`, `_csvBetragsNormalisieren`, `_csvZeileZuFall`). Das HTML fügt einen "Import CSV"-Button in den Fälle-Tab-Header ein, gated via `kontoCSVImportOeffnen`. Ein Beispiel-CSV liegt unter `frontend/data/beispiel-import.csv`.

**Tech Stack:** Vanilla JS, FileReader API, `StorageBackend` (konto.js-intern via `kontoLadeRegistry`/`kontoSpeichereRegistry`), gates.js (`requiresBusiness`), Bootstrap 5.3.3.

---

## CSV-Format

| Spalte | Pflicht | Beschreibung |
|--------|---------|--------------|
| `gegner` | ✅ | Schuldner (Name) |
| `betrag` | ✅ | Hauptforderung in € (Punkt oder Komma als Dezimaltrennzeichen, z.B. `1234.56` oder `1.234,56`) |
| `aktenzeichen` | optional | Aktenzeichen der Kanzlei |
| `faelligkeitsdatum` | optional | ISO-Format `2024-01-15` oder deutsches Format `15.01.2024` |
| `aufschlag_pp` | optional | Verzugszins-Aufschlag in Prozentpunkten (Standard: 9) |
| `mandant` | optional | Mandantenname (Business-Funktion) |

---

## Dateistruktur

| Datei | Aktion | Verantwortlichkeit |
|-------|--------|-------------------|
| `frontend/js/konto.js` | Modify | CSV-Import-Logik: Gate-Wrapper + FileReader-Handler + Parser |
| `frontend/konto.html` | Modify | "Import CSV"-Button im Fälle-Tab + verstecktes `<input type="file">` |
| `frontend/data/beispiel-import.csv` | Create | Beispiel-Datei für Nutzer |
| `frontend/sw.js` | Modify | SW-Version erhöhen + `beispiel-import.csv` in ASSETS aufnehmen |
| `CLAUDE.md` | Modify | SW-Version aktualisieren |

---

## Kontext: Bestehende Datenstrukturen

**Registry-Eintrag** (aus `kontoNeuenFallAnlegen` in konto.js:336-349):
```js
{
  id: 'f' + Date.now(),
  name: 'Mandant ./. Gegner',
  updatedAt: new Date().toISOString(),
  naechsteId: 2,
  fall: {
    mandant: '', gegner: '', aktenzeichen: '', aufschlagPP: 9,
    insoDatum: null, forderungsgrundKat: '', titelArt: '', titelDatum: '',
    titelRechtskraft: '', titelGericht: '', titelAz: '',
    positionen: [{
      typ: 'hauptforderung', id: 1, gruppeId: 'g1',
      datum: '', betrag: '1234,56', bezeichnung: 'Hauptforderung'
    }]
  }
}
```

`betrag` in Positionen ist ein String im deutschen Format (`"1234,56"`).

**Gate-System** (gates.js): `requiresBusiness('csv-import')` gibt `true` zurück und zeigt Modal, wenn der Nutzer kein Business-Abo hat. Der Aufrufer soll dann `return` ausführen. `'csv-import'` ist bereits in `featureLabels` eingetragen.

---

## Task 1: CSV-Import-Logik in konto.js

**Files:**
- Modify: `frontend/js/konto.js` (am Ende der Datei anhängen, nach `kontoKontaktLoeschen`)

- [ ] **Step 1: Neuen Code am Ende von konto.js einfügen**

Hänge folgenden Block **nach** dem letzten `}` der Datei (Zeile 646) an:

```js
// ---- CSV-Import (Business) ----

function kontoCSVImportOeffnen() {
  if (requiresBusiness('csv-import')) return;
  document.getElementById('csv-import-input').click();
}

function kontoCSVImportDatei(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const rows = _parseCSV(ev.target.result);
    if (rows.length === 0) {
      alert('Die CSV-Datei enthält keine gültigen Zeilen.\nPflichtfelder: gegner, betrag');
      input.value = '';
      return;
    }

    const reg = kontoLadeRegistry();
    const baseTime = Date.now();
    let importiert = 0;
    let fehler = 0;

    for (let i = 0; i < rows.length; i++) {
      const eintrag = _csvZeileZuFall(rows[i], baseTime, i);
      if (!eintrag) { fehler++; continue; }
      reg.cases[eintrag.id] = eintrag;
      importiert++;
    }

    if (importiert === 0) {
      alert('Kein Fall konnte importiert werden.\nBitte prüfen Sie, ob „gegner" und „betrag" in der CSV vorhanden sind.');
      input.value = '';
      return;
    }

    kontoSpeichereRegistry(reg);
    kontoRendereFaelleTab();

    const msg = importiert === 1
      ? '1 Fall erfolgreich importiert.'
      : importiert + ' Fälle erfolgreich importiert.';
    alert(fehler > 0
      ? msg + '\n' + fehler + ' Zeile(n) übersprungen (fehlende Pflichtfelder).'
      : msg);
    input.value = '';
  };
  reader.onerror = () => {
    alert('Datei konnte nicht gelesen werden.');
    input.value = '';
  };
  reader.readAsText(file, 'UTF-8');
}

function _parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = _csvSplitLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = _csvSplitLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

function _csvSplitLine(line) {
  const values = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      values.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  values.push(cur);
  return values;
}

function _csvBetragsNormalisieren(raw) {
  if (!raw) return '';
  let s = raw.replace(/[€$£\s]/g, '');
  if (s.includes('.') && s.includes(',')) {
    // German "1.234,56": Tausenderpunkt + Dezimalkomma → Punkte entfernen
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '');
    } else {
      // English "1,234.56": Komma entfernen, Punkt → Komma
      s = s.replace(/,/g, '').replace('.', ',');
    }
  } else if (s.includes('.') && !s.includes(',')) {
    // English "1234.56" → "1234,56"
    s = s.replace('.', ',');
  }
  return s;
}

function _csvZeileZuFall(row, baseTime, index) {
  const gegner = (row.gegner || '').trim();
  if (!gegner) return null;
  const betrag = _csvBetragsNormalisieren(row.betrag || '');
  if (!betrag) return null;

  const mandant      = (row.mandant || '').trim();
  const aktenzeichen = (row.aktenzeichen || '').trim();
  const datum        = (row.faelligkeitsdatum || '').trim();
  const aufschlagPP  = parseInt(row.aufschlag_pp, 10) || 9;
  const id           = 'f' + baseTime + '_' + index;
  const name         = mandant && gegner ? mandant + ' ./. ' + gegner : gegner;

  return {
    id,
    name,
    updatedAt: new Date().toISOString(),
    naechsteId: 2,
    fall: {
      mandant, gegner, aktenzeichen, aufschlagPP,
      insoDatum: null, forderungsgrundKat: '', titelArt: '', titelDatum: '',
      titelRechtskraft: '', titelGericht: '', titelAz: '',
      positionen: [{
        typ: 'hauptforderung', id: 1, gruppeId: 'g1',
        datum, betrag, bezeichnung: 'Hauptforderung'
      }]
    }
  };
}
```

- [ ] **Step 2: Manuell im Browser verifizieren (Konsole)**

Öffne `http://localhost:8080/konto.html` (oder Staging). Führe in der Browser-Konsole aus:

```js
// CSV-Parser direkt testen (kein eingeloggter Nutzer nötig)
const testCsv = `gegner,betrag,aktenzeichen,faelligkeitsdatum,aufschlag_pp,mandant
Mustermann GmbH,1234.56,AZ-2024-001,2024-03-15,9,Anwaltskanzlei Müller
Schulze & Co KG,"2.345,67",AZ-2024-002,,5,
Leerzeile folgt

Max Meier,500,,,, `;

const rows = _parseCSV(testCsv);
console.assert(rows.length === 3, 'Erwartet 3 Zeilen (Leerzeile ignoriert)');
console.assert(rows[0].gegner === 'Mustermann GmbH', 'Gegner Zeile 1');
console.assert(rows[0].betrag === '1234.56', 'Betrag Zeile 1 roh');
console.assert(_csvBetragsNormalisieren('1234.56') === '1234,56', 'Punkt→Komma');
console.assert(_csvBetragsNormalisieren('1.234,56') === '1.234,56'.replace(/\./g,''), 'Tausenderpunkt entfernt'); // '1234,56'
console.assert(_csvBetragsNormalisieren('2.345,67') === '2345,67', 'Quoted Betrag');

const fall0 = _csvZeileZuFall(rows[0], Date.now(), 0);
console.assert(fall0 !== null, 'Fall 0 gültig');
console.assert(fall0.fall.positionen[0].betrag === '1234,56', 'Betrag normalisiert');
console.assert(fall0.fall.aufschlagPP === 9, 'aufschlagPP aus CSV');
console.assert(fall0.name === 'Anwaltskanzlei Müller ./. Mustermann GmbH', 'Name mit Mandant');

const fall1 = _csvZeileZuFall(rows[1], Date.now(), 1);
console.assert(fall1 !== null, 'Fall 1 gültig');
console.assert(fall1.fall.aufschlagPP === 5, 'aufschlagPP=5');
console.assert(fall1.name === 'Schulze & Co KG', 'Name ohne Mandant');

const emptyRow = { gegner: '', betrag: '100' };
console.assert(_csvZeileZuFall(emptyRow, Date.now(), 99) === null, 'Leerer Gegner → null');

console.log('Alle Tests bestanden ✓');
```

Erwartete Ausgabe: `Alle Tests bestanden ✓` ohne Assertion-Fehler.

- [ ] **Step 3: Committen**

```bash
git add frontend/js/konto.js
git commit -m "feat: CSV-Import-Logik in konto.js (_parseCSV, _csvZeileZuFall, kontoCSVImportDatei)"
```

---

## Task 2: UI in konto.html

**Files:**
- Modify: `frontend/konto.html` (Fälle-Tab-Header, ca. Zeile 120-130)

- [ ] **Step 1: "Import CSV"-Button und verstecktes File-Input in den Fälle-Tab-Header einfügen**

Aktuelle Zeilen 121-128 in `konto.html` (der `<div class="d-flex gap-2">`-Block):
```html
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
```

Ersetze diesen Block durch:
```html
            <div class="d-flex gap-2">
              <label class="btn btn-sm btn-outline-primary mb-0" role="button" tabindex="0"
                     onkeydown="if(event.key==='Enter'||event.key===' ')this.click()">
                Import JSON
                <input type="file" accept=".json" id="faelle-import-input" style="display:none"
                       onchange="kontoFallImportieren(this)">
              </label>
              <button class="btn btn-sm btn-outline-primary" onclick="kontoCSVImportOeffnen()">Import CSV</button>
              <input type="file" accept=".csv" id="csv-import-input" style="display:none"
                     onchange="kontoCSVImportDatei(this)">
              <button class="btn btn-sm btn-outline-primary" onclick="kontoFaelleExportierenAlle()">Export alle</button>
              <button class="btn btn-sm btn-primary" onclick="kontoNeuenFallAnlegen()">+ Neuer Fall</button>
            </div>
```

- [ ] **Step 2: Manuell im Browser verifizieren**

1. Als Pro-Nutzer einloggen → Fälle-Tab → "Import CSV" klicken → Upgrade-Modal erscheint mit Titel "Business-Funktion", Text "Diese Funktion ist ab dem Business-Plan verfügbar.", CTA "Business abonnieren →"
2. Als Business-Nutzer einloggen → "Import CSV" klicken → Datei-Dialog öffnet sich
3. Eine CSV-Datei mit gültigen Zeilen hochladen → Fälle werden in der Liste angezeigt
4. Einen importierten Fall laden → Forderungsaufstellung öffnet sich mit Hauptforderung vorbelegt

- [ ] **Step 3: Committen**

```bash
git add frontend/konto.html
git commit -m "feat: Import-CSV-Button im Fälle-Tab (Business-gated)"
```

---

## Task 3: Beispiel-CSV + SW-Version + CLAUDE.md

**Files:**
- Create: `frontend/data/beispiel-import.csv`
- Modify: `frontend/sw.js` (ASSETS-Array + Version `fordify-v117` → `fordify-v118`, staging `fordify-staging-v71` → `fordify-staging-v72`)
- Modify: `CLAUDE.md` (SW-Version in der Dateistruktur-Tabelle)

- [ ] **Step 1: Beispiel-CSV erstellen**

Erstelle `frontend/data/beispiel-import.csv`:
```csv
gegner,betrag,aktenzeichen,faelligkeitsdatum,aufschlag_pp,mandant
Mustermann GmbH,1234.56,AZ-2024-001,2024-03-15,9,Anwaltskanzlei Müller
Schulze & Co KG,2345.67,AZ-2024-002,2024-06-01,,Anwaltskanzlei Müller
Max Meier,500.00,AZ-2024-003,,,
```

- [ ] **Step 2: SW-Version erhöhen und beispiel-import.csv in ASSETS aufnehmen**

In `frontend/sw.js`, Zeile 5:
```js
const CACHE = IS_STAGING_SW ? "fordify-staging-v71" : "fordify-v117";
```
→ ersetzen durch:
```js
const CACHE = IS_STAGING_SW ? "fordify-staging-v72" : "fordify-v118";
```

In `frontend/sw.js`, nach Zeile 43 (`"/data/rvg_tabelle.json",`):
```js
  "/data/beispiel-import.csv",
```
einfügen.

- [ ] **Step 3: CLAUDE.md aktualisieren**

In `CLAUDE.md`, den Verweis auf die SW-Version in der `sw.js`-Zeile der Dateistruktur aktualisieren:
```
│   ├── sw.js                   ← Service Worker (aktuell fordify-v118 / staging-v72)
```

- [ ] **Step 4: Manuell prüfen: sw.js ist korrekt**

```bash
grep "fordify-v" frontend/sw.js
# Erwartete Ausgabe:
# const CACHE = IS_STAGING_SW ? "fordify-staging-v72" : "fordify-v118";

grep "beispiel-import" frontend/sw.js
# Erwartete Ausgabe:
#   "/data/beispiel-import.csv",
```

- [ ] **Step 5: Committen und pushen**

```bash
git add frontend/data/beispiel-import.csv frontend/sw.js CLAUDE.md
git commit -m "feat: Beispiel-CSV + SW v118 (CSV-Import Business vollständig)"
git push origin staging
git push origin main
```

---

## Self-Review

**Spec-Abdeckung:**
- ✅ Business-only Gate: `kontoCSVImportOeffnen()` ruft `requiresBusiness('csv-import')` auf
- ✅ CSV-Pflichtfelder `gegner` + `betrag`: `_csvZeileZuFall` gibt `null` zurück wenn fehlend
- ✅ Optionale Felder: `aktenzeichen`, `faelligkeitsdatum`, `aufschlag_pp`, `mandant` alle implementiert
- ✅ Betrag-Normalisierung: Punkt/Komma-Varianten abgedeckt in `_csvBetragsNormalisieren`
- ✅ Jede Zeile → eigener Fall mit einer Hauptforderung-Position
- ✅ Fall-Name: "Mandant ./. Gegner" oder nur "Gegner" wenn kein Mandant
- ✅ `naechsteId: 2` (da id:1 bereits vergeben)
- ✅ Fehlerbehandlung: Zeilen ohne Pflichtfelder werden übersprungen, Nutzer wird informiert
- ✅ Beispiel-CSV unter `frontend/data/beispiel-import.csv`
- ✅ SW-Version erhöht, Datei in ASSETS
- ✅ CLAUDE.md aktualisiert

**Placeholder-Scan:** Keine TBDs oder offenen Punkte.

**Typ-Konsistenz:**
- `_parseCSV(text)` → `object[]` (header-basiert) — konsistent mit `_csvZeileZuFall(row, baseTime, index)` und `kontoCSVImportDatei`
- `_csvZeileZuFall` signatur: `(row, baseTime, index)` — so auch im Loop aufgerufen
- `betrag` im Fall ist String im Format `"1234,56"` — konsistent mit `kontoNeuenFallAnlegen`-Struktur
