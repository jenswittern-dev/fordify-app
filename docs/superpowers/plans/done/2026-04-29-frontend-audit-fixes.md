# Frontend-Audit Fixes (F1+F2+F4+F6+F8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fünf verifizierte Befunde aus dem zweiten Codex-Frontend-Audit beheben: Paddle-Upsert-Constraint, XSS in PDF-Vorschau, CSV-Delimiter, SW-Cache-Lücken und Doku-Hygiene.

**Architecture:** Pure Static SPA (Vanilla JS, kein Build-Schritt). Fixes direkt in Quelldateien. Supabase-Migration muss manuell im Dashboard ausgeführt werden. CLAUDE.md-Regel: SW-Version bei jedem Commit mit geänderten Frontend-Dateien um 1 erhöhen.

**Tech Stack:** Vanilla JS, Bootstrap 5, Supabase PostgREST, Service Worker (Cache-First)

---

## Betroffene Dateien

| Datei | Task | Änderung |
|---|---|---|
| `supabase/schema.sql` | 1 | Partial-Index droppen, echter UNIQUE Constraint |
| `frontend/js/app.js` | 2, 5 | `escHtml()` + Anwendung auf PDF-Felder; Kommentar:1736 |
| `frontend/js/konto.js` | 3 | `_csvDetectDelimiter()` + Delimiter-Param in `_csvSplitLine()` + `_parseCSV()` |
| `frontend/sw.js` | 4 | 2 Assets ergänzen + SW-Version erhöhen |
| `docs/SYSTEM.md` | 5 | SW-Versionsangaben aktualisieren |

---

## Task 1: F1 – Paddle UNIQUE Constraint (echter Constraint statt partial Index)

**Datei:** `supabase/schema.sql`

**Hintergrund:** PostgREST übersetzt `onConflict: 'paddle_subscription_id'` zu `ON CONFLICT (paddle_subscription_id) DO UPDATE`. PostgreSQL kann dabei nur einen vollwertigen UNIQUE Constraint inferieren, keinen partiellen Index (der eine `WHERE`-Klausel erfordert, die PostgREST nicht mitliefert). Der in der Vorgänger-Migration angelegte partial index ist daher für den Upsert nicht nutzbar. PostgreSQL erlaubt mehrere NULL-Werte auch in echten UNIQUE Constraints (NULL != NULL), sodass Nutzer ohne Paddle-ID kein Problem darstellen.

- [ ] **Schritt 1:** Neuen Migration-Block an das Ende von `supabase/schema.sql` anhängen:

```sql
-- Migration 2026-04-29b: Echter UNIQUE Constraint für paddle_subscription_id
-- Ersetzt den partiellen Unique Index aus Migration 2026-04-29.
-- PostgREST ON CONFLICT (col) braucht einen vollwertigen UNIQUE Constraint.
-- PostgreSQL erlaubt mehrere NULL-Werte in UNIQUE Constraints (NULL ≠ NULL).
-- Ausführen im Supabase Dashboard: SQL Editor → New Query → Run

DROP INDEX IF EXISTS idx_subscriptions_paddle_subscription_id_unique;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_paddle_subscription_id_key
  UNIQUE (paddle_subscription_id);
```

- [ ] **Schritt 2:** SQL im Supabase Dashboard ausführen:
  - URL: `https://supabase.com/dashboard/project/dswhllvtewtqpiqnpbsu/sql`
  - Beide Statements einfügen → Run
  - Erwartete Ausgabe: `Success. No rows returned.`

- [ ] **Schritt 3:** Constraint verifizieren:
```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'subscriptions'
  AND constraint_name = 'subscriptions_paddle_subscription_id_key';
```
Erwartung: 1 Zeile mit `UNIQUE`.

- [ ] **Schritt 4:** Commit & Push (keine Frontend-Dateien → kein SW-Bump):
```bash
git add supabase/schema.sql
git commit -m "fix: UNIQUE Constraint auf paddle_subscription_id (ersetzt partial index, PostgREST-kompatibel)"
git push origin staging && git push origin staging:main
```

---

## Task 2: F2 – XSS in PDF-/Print-Vorschau absichern

**Datei:** `frontend/js/app.js`

**Hintergrund:** In `rendereVorschau()` (ab ca. Zeile 1640) werden Nutzerfelder wie `fall.mandant`, `fall.gegner`, `fall.aktenzeichen`, `fall.titelArt`, `fall.titelGericht` und `fall.titelAz` ohne HTML-Escaping direkt in Template-Strings interpoliert. `drucken()` übernimmt dieses HTML in ein Popup-Window. Importierte Falldaten mit `<script>`-Tags würden in der App-Origin ausgeführt.

Es gibt in app.js keine globale Escape-Funktion — `e()` ist lokal in `generiereImpressumFooterHtml()`.

- [ ] **Schritt 1:** Globale `escHtml()`-Hilfsfunktion an geeigneter Stelle in `app.js` einfügen. Suche in der Datei nach dem Beginn des Utility-Bereichs (ca. Zeilen 1–50, wo `"use strict"` oder erste Konstanten stehen) und füge die Funktion dort ein:

```javascript
function escHtml(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

- [ ] **Schritt 2:** Lies `app.js` ab Zeile 1640 um die genauen Zeilen zu finden. Die folgenden Template-Stellen müssen auf `escHtml()` umgestellt werden:

**Forderungsgrund-Block** (ca. Zeile 1653–1658):
```javascript
// ALT:
<tr><th>Grundlage:</th><td>${fgKat}</td></tr>
${fall.titelArt ? `<tr><th>Art:</th><td>${fall.titelArt}</td></tr>` : ""}
${hatTitel && fall.titelGericht ? `<tr><th>Gericht / Behörde:</th><td>${fall.titelGericht}</td></tr>` : ""}
${hatTitel && fall.titelAz ? `<tr><th>Aktenzeichen:</th><td>${fall.titelAz}</td></tr>` : ""}

// NEU:
<tr><th>Grundlage:</th><td>${escHtml(fgKat)}</td></tr>
${fall.titelArt ? `<tr><th>Art:</th><td>${escHtml(fall.titelArt)}</td></tr>` : ""}
${hatTitel && fall.titelGericht ? `<tr><th>Gericht / Behörde:</th><td>${escHtml(fall.titelGericht)}</td></tr>` : ""}
${hatTitel && fall.titelAz ? `<tr><th>Aktenzeichen:</th><td>${escHtml(fall.titelAz)}</td></tr>` : ""}
```

**Parteien-Block** (ca. Zeile 1689–1696):
```javascript
// ALT:
<span class="pdf-party__name">${fall.mandant || "—"}</span>
<span class="pdf-party__name">${fall.gegner || "—"}</span>
${fall.aktenzeichen ? `<div class="pdf-party__az">GZ.: ${fall.aktenzeichen}</div>` : ""}

// NEU:
<span class="pdf-party__name">${escHtml(fall.mandant) || "—"}</span>
<span class="pdf-party__name">${escHtml(fall.gegner) || "—"}</span>
${fall.aktenzeichen ? `<div class="pdf-party__az">GZ.: ${escHtml(fall.aktenzeichen)}</div>` : ""}
```

- [ ] **Schritt 3:** Syntaxcheck:
```bash
node --check frontend/js/app.js && echo OK
```

- [ ] **Schritt 4:** SW-Version in `frontend/sw.js` um 1 erhöhen (CLAUDE.md-Pflicht bei Frontend-Änderungen). Lies die aktuelle Version in `sw.js` Zeile 5 und erhöhe beide Zähler.

- [ ] **Schritt 5:** Commit & Push:
```bash
git add frontend/js/app.js frontend/sw.js
git commit -m "fix: XSS-Schutz in PDF-/Print-Vorschau – Nutzerfelder via escHtml() absichern"
git push origin staging && git push origin staging:main
```

---

## Task 3: F4 – CSV-Delimiter Auto-Erkennung in konto.js

**Datei:** `frontend/js/konto.js`

**Hintergrund:** `_csvSplitLine()` (Zeile 1032) unterstützt nur Komma als Trennzeichen. Die bereitgestellte Beispiel-Datei `frontend/data/beispiel-schuldner.csv` ist semikolongetrennt. Damit schlägt ein Import der Beispiel-CSV fehl. `_parseCSV()` (Zeile 1016) ruft `_csvSplitLine()` ohne Delimiter-Parameter auf.

- [ ] **Schritt 1:** `_csvDetectDelimiter()` vor `_csvSplitLine()` einfügen (ca. ab Zeile 1032):

```javascript
function _csvDetectDelimiter(firstLine) {
  const semis  = (firstLine.match(/;/g)  || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semis > commas ? ';' : ',';
}
```

- [ ] **Schritt 2:** `_csvSplitLine()` um optionalen `delimiter`-Parameter erweitern:

```javascript
function _csvSplitLine(line, delimiter = ',') {
  const values = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === delimiter && !inQuotes) {
      values.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  values.push(cur);
  return values;
}
```

- [ ] **Schritt 3:** `_parseCSV()` auf Delimiter-Erkennung umstellen:

```javascript
function _parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const delimiter = _csvDetectDelimiter(lines[0]);
  const headers = _csvSplitLine(lines[0], delimiter).map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = _csvSplitLine(line, delimiter);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}
```

- [ ] **Schritt 4:** Syntaxcheck:
```bash
node --check frontend/js/konto.js && echo OK
```

- [ ] **Schritt 5:** SW-Version in `frontend/sw.js` um 1 erhöhen.

- [ ] **Schritt 6:** Commit & Push:
```bash
git add frontend/js/konto.js frontend/sw.js
git commit -m "fix: CSV-Import unterstützt jetzt Semikolon- und Komma-Delimiter (Auto-Erkennung)"
git push origin staging && git push origin staging:main
```

---

## Task 4: F6 – Service Worker Cache vervollständigen

**Datei:** `frontend/sw.js`

**Hintergrund:** Der ZV-Formular-Export lädt `pdf-lib.min.js` lazy per `document.createElement('script')` (app.js:2756). Diese Datei fehlt in der `ASSETS`-Liste des Service Workers. Ebenfalls fehlt `css/fonts.css`, das auf allen Seiten geladen wird. Offline-/Cache-Only-Situationen würden daher den ZV-Export und die Schriftarten-Stile brechen.

- [ ] **Schritt 1:** Lies `frontend/sw.js` Zeilen 1–57 um die aktuelle ASSETS-Liste zu sehen.

- [ ] **Schritt 2:** Zwei Einträge in die `ASSETS`-Array einfügen. Füge sie sinnvoll ein — `/js/pdf-lib.min.js` nach den anderen JS-Dateien, `/css/fonts.css` nach den anderen CSS-Dateien:

```javascript
// Nach "/js/rechner-gkg.js" (oder letzter JS-Eintrag):
  "/js/pdf-lib.min.js",

// Nach "/css/rechner.css" (oder letzter CSS-Eintrag):
  "/css/fonts.css",
```

- [ ] **Schritt 3:** SW-Version in Zeile 5 um 1 erhöhen (Prod und Staging):
```javascript
// Beispiel — tatsächliche Nummer aus Zeile 5 lesen und +1:
const CACHE = IS_STAGING_SW ? "fordify-staging-vXXX" : "fordify-vXXX";
```

- [ ] **Schritt 4:** Prüfen ob `frontend/js/pdf-lib.min.js` und `frontend/css/fonts.css` tatsächlich im Filesystem existieren:
```bash
ls frontend/js/pdf-lib.min.js && ls frontend/css/fonts.css && echo "Beide vorhanden"
```
Wenn eine Datei fehlt: Schritt überspringen und als DONE_WITH_CONCERNS melden.

- [ ] **Schritt 5:** Commit & Push:
```bash
git add frontend/sw.js
git commit -m "fix: pdf-lib.min.js und fonts.css in Service-Worker-Cache aufgenommen"
git push origin staging && git push origin staging:main
```

---

## Task 5: F8 – Veralteter Kommentar + SYSTEM.md Versions-Hygiene

**Dateien:** `frontend/js/app.js`, `docs/SYSTEM.md`

**Hintergrund:**
1. `app.js:1736` enthält noch den Kommentar `§367 BGB Verrechnungsreihenfolge: Zinsen → Kosten → HF` — die Reihenfolge wurde aber in einem früheren Audit-Fix auf `Kosten → Zinsen → HF` korrigiert. Der Kommentar ist jetzt falsch und irreführend.
2. `docs/SYSTEM.md` nennt an zwei Stellen noch alte SW-Versionen (`fordify-v90`/`fordify-v169` je nach Stelle). Die tatsächliche Version ist höher und steht in `frontend/sw.js` Zeile 5.

- [ ] **Schritt 1:** Lies `frontend/sw.js` Zeile 5 — notiere die aktuellen Versionsnummern (Prod + Staging).

- [ ] **Schritt 2:** Korrigiere Kommentar in `app.js:1736`:

```javascript
// ALT:
 * – §367 BGB Verrechnungsreihenfolge: Zinsen → Kosten → HF

// NEU:
 * – §367 BGB Verrechnungsreihenfolge: Kosten → Zinsen → HF
```

- [ ] **Schritt 3:** Aktualisiere in `docs/SYSTEM.md` beide Vorkommen der SW-Version (suche nach `fordify-v` in der Datei) auf die aktuellen Werte aus Schritt 1.

- [ ] **Schritt 4:** Syntaxcheck app.js:
```bash
node --check frontend/js/app.js && echo OK
```

- [ ] **Schritt 5:** Commit & Push (app.js ist eine Frontend-Datei → SW-Version erhöhen):
```bash
git add frontend/js/app.js docs/SYSTEM.md frontend/sw.js
git commit -m "docs: veralteten §367-Kommentar in app.js + SW-Versionen in SYSTEM.md korrigiert"
git push origin staging && git push origin staging:main
```

---

## Self-Review

**Spec-Abdeckung:**
- F1 Paddle UNIQUE Constraint → Task 1 ✅
- F2 XSS PDF-Vorschau → Task 2 ✅ (`escHtml()` global, alle 6 Felder)
- F4 CSV-Delimiter → Task 3 ✅ (`_csvDetectDelimiter` + Param in `_csvSplitLine` + `_parseCSV`)
- F6 SW-Cache → Task 4 ✅ (pdf-lib.min.js + fonts.css)
- F8 Kommentar + SYSTEM.md → Task 5 ✅

**Placeholder-Scan:** Alle Schritte haben vollständigen Code. Keine TBD/TODO-Marker.

**Typ-Konsistenz:** `escHtml()` in Task 2 definiert und direkt angewendet. `_csvDetectDelimiter()` in Task 3 definiert, `_csvSplitLine(line, delimiter)` konsistent — `_parseCSV()` übergibt `delimiter` korrekt.

**Reihenfolge-Abhängigkeiten:**
- Task 5 liest SW-Version aus sw.js → muss nach Task 4 laufen
- Tasks 1–4 sind voneinander unabhängig
