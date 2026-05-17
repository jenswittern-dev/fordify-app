# Fordify Frontend – Cross-Cutting Code-Quality-Review

**Scope:** 18 eigene JS-Module in `frontend/js/` (gesamt 6.397 LoC, ohne Vendor-Libs)
**Datum:** 2026-05-17
**Methodik:** Vollständig gelesen wurden 16 kleine/mittlere Module; `app.js` (2829 LoC) und `konto.js` (1224 LoC) per Top-200 + gezielter Grep-Suche.

---

## 1. Globale Variablen-Pollution

### Befund: **Sehr moderat — kein "window.X = ..."-Wildwuchs**
Es gibt nur **drei** echte `window.*`-Assignments in eigenem Code:

| File:Line | Assignment | Zweck |
|---|---|---|
| `frontend/js/rechner-rvg.js:6` | `window.setPKHModus = function (active) {…}` | Wird vom inline-onclick im HTML aufgerufen |
| `frontend/js/app.js:2557` | `<script>window.onload=function(){…}</script>` (in injiziertem Print-Popup) | OK, ist String für neues Popup-Window |
| `frontend/js/config.js:24` | `if (typeof window.goatcounter === 'undefined')` | Read-only Check, kein Assignment |

**Implizite Globals via `const`/`let` im Script-Scope** (kein Modul-System):
- `CONFIG`, `BASISZINSSAETZE`, `RVG_TABELLE`, `GKG_TABELLE`, `VV_DEFINITIONEN`, `STANDARDKOSTEN`, `KATEGORIEN`, `AKTIONSTYPEN` (data.js)
- `fordifyAuth`, `supabaseClient` (auth.js)
- `fordifyContacts` (contacts.js)
- `VALID_CHECKOUT_PARAMS`, `PRICE_MAP` (auth-ui.js)
- `STORAGE_KEY_*` (app.js, mit `KONTO_*` Duplikat in konto.js)
- `state`, `UNDO_MAX`, `ICON` (app.js)
- `STATUS_CONFIG`, `KONTO_IMP_FIELDS` (konto.js)
- `StorageBackend`, `CloudSync` (storage.js, IIFE-Closures — sauber)
- `VERRECHNUNG_REIHENFOLGE` (verrechnung.js)

**Risiko:** Niedrig. `const` verhindert Reassignments, und IIFE-Pattern wird in den `rechner-*.js`-Modulen konsequent benutzt. Keine echte Pollution durch versehentliche Lecks. **Aufwand für Modulisierung: hoch (>8h), Nutzen: gering** — die Codebasis ist klein genug, dass Sichtbarkeit kein Problem ist.

---

## 2. Inline-Event-Handler vs. addEventListener

### Befund: **Inkonsistenter Mix mit klarem Muster**

- **109 `onclick=` / `onchange=` / etc. in HTML-Dateien** (über 14 Templates verteilt)
  - `forderungsaufstellung.html` allein: 41 inline-Handler
  - `konto.html`: 22 inline-Handler
  - `preise.html`: 10 inline-Handler
- **29 `addEventListener`-Calls in JS** — fast ausschließlich in den `rechner-*.js` (IIFE-Pattern) und für `submit`/`input`-Events
- **20 weitere inline-`onclick=`** in JS-Template-Strings (z.B. `konto.js:351,394,408–411`, `app.js:786–793`)

**Muster:**
- Statische HTML-Buttons → inline `onclick="funktion()"` (App-weit)
- Dynamisch gerendertes HTML (z.B. Fall-Liste, Positionen) → inline `onclick` in Template-String
- Formulare → `addEventListener('submit', ...)` (rechner-*.js)
- Tooltip-Init → `addEventListener` über `querySelectorAll`

**Risiko:** Niedrig–Mittel. Inline-Handler funktionieren, aber:
1. Erzwingen globale Funktionsnamen (kein Module-Scope möglich)
2. Bei CSP-Härtung (`script-src 'self'`) blockiert: Es gibt aktuell keinen CSP-Header, also kein akutes Problem.
3. Template-Strings mit `${c.id}` in onclick (z.B. `konto.js:408`) wären XSS-Vektor — aktuell sicher, weil `c.id` immer als `'f' + Date.now()` (Hex-Stamps) generiert wird und nie User-Input ist.

**Aufwand für vollständige Konvertierung:** sehr hoch (>16h). **Nicht empfohlen** ohne CSP-Anforderung.

---

## 3. escHtml / escAttr-Verwendung

### Befund: **Phase 8.1 hat den Bulk gemacht — aber 3 echte Regressionen verbleiben**

- **49 `escHtml(`/`escAttr(`-Calls** in 7 Modulen — die Helper sind etabliert.
- **47 `innerHTML =`-Assignments** in 11 Modulen — viele davon mit reinem statischem String oder mit `${escHtml(...)}` ordentlich eskapiert.

**Echte Regressionen / Risiken:**

| File:Line | Problem | Risiko |
|---|---|---|
| `frontend/js/app.js:1179` | `container.innerHTML = …${e.message}…` | Niedrig (e ist eigener Throw, User-Input kommt nur indirekt durch Decimal-Parse-Fehler rein) |
| `frontend/js/app.js:1229` | `container.innerHTML = …${e.message}…` | Niedrig (gleicher Pfad) |
| `frontend/js/app.js:1732` | `el.innerHTML = …${err.message}…` | Niedrig–Mittel (Vorschau-Render-Fehler) |
| `frontend/js/konto.js:155` | `loadingEl.innerHTML = …${e?.message || String(e)}…` | Niedrig (Init-Fehler) |
| `frontend/js/konto.js:385` | `title="${escHtml(c.notes.slice(0,120))}"` in `<span>` Attribute — sollte `escAttr` sein | Niedrig (Notes sind User-Input, aber Quotes werden in escHtml ebenfalls escaped, ist also sicher — nur stilistisch inkonsistent) |
| `frontend/js/zinsen.js:78` (rechner-zins.js): `${err.message}` direkt — | Niedrig (createElement + textContent verwendet, also sicher) |

**Fazit:** Die `e.message`-Stellen sind alle aus selbst geworfenen Errors (Decimal-Konstruktor, eigene Throws). XSS via Error-Message ist nur theoretisch möglich. **Eine Refactor-Runde mit `escHtml(e.message)` wäre 10min Arbeit und schließt die Lücke vollständig.**

**Kein Problem:** Die UpgradeModal-`zeigeUpgradeModal()` (gates.js:42–53) verwendet `textContent`/`href`-Setzungen statt `innerHTML` — vorbildlich.

---

## 4. Error-Handling

### Befund: **Heterogen, aber pragmatisch**

- **81 try/catch-Blöcke** in 9 eigenen Modulen
- **17 console.warn / console.error** (`contacts.js: 4`, `konto.js: 6`, `app.js: 3`, `storage.js: 1`, `zusammenfassung.js: 1`)
- **44 `await`-Calls** — fast immer in try/catch eingebettet

**Muster:**
1. **Storage-Reads** mit `try { … } catch (e) { /* ignore */ }` — bewusst silent (z.B. `app.js:93, 159`, `konto.js:33`). OK für nicht-kritische Reads.
2. **Supabase-Calls** mit `if (error) { console.warn(…); return null; }` — sauber, kein Rethrow. (contacts.js durchgängig)
3. **Promise.then ohne `.catch()`** — nicht vorhanden, alles `async/await`. ✓
4. **Top-Level async ohne Wrapper:** `auth.js:159` `supabaseClient.auth.onAuthStateChange(async (event, session) => {…})` — kein try/catch um die Body. Wenn eine der `await`-Operationen wirft, bleibt es eine unhandled rejection.

**Problemstellen:**
- `auth.js:88` `logout()` ohne try/catch — wenn signOut fehlt, gibt's einen unhandled error
- `auth.js:94–119` `migrateSessionToCloud()` — wirft potentiell bei `supabaseClient.from(...).upsert()`, kein Schutz
- `zv.js:8` `fetch(...)` ohne explicit catch (wird aber durch das `await` des Aufrufers behandelt — der existiert allerdings nicht überall im Code)

**Risiko:** Niedrig. Die fehlenden Wrapper sind Edge-Cases (Netzwerkausfall bei Cloud-Sync). **Aufwand 1h für komplette Härtung.**

---

## 5. zusammenfassung.js (deprecated)

### Befund: **Tatsächlich tote Datei — NICHTS lädt sie mehr**

- **Keine HTML-Datei** lädt `zusammenfassung.js` (Grep nach `zusammenfassung\.js` in `frontend/`: 0 Treffer)
- **Nicht in `sw.js`** gecacht (kein Eintrag in ASSETS)
- **Keine externe Aufruferseite** für `erstelleZusammenfassung(` oder `resolvePositionen(` — nur Selbstreferenz innerhalb der Datei (Z. 19, 55)
- Funktionen `formatEUR`, `formatTageszins`, `berechneTagesZins`, `kategorieVonTyp` in der Datei sind alle dead code
- `formatEUR` hier (Z.204) konkurriert nicht praktisch mit der aktiven Version in `app.js:54`, weil die Datei nirgendwo geladen wird — aber wenn sie geladen würde, würde sie die aktive `formatEUR` aus `app.js` überschreiben (Load-Reihenfolge!).

**Empfehlung:** **Sofort löschen.** Risikofrei. Spart 221 LoC und ein "deprecated"-Warning aus 3 Doku-Dateien (`CLAUDE.md`, `AGENTS.md`, `SYSTEM.md`).

```
git rm frontend/js/zusammenfassung.js
```

---

## 6. Code-Duplikation

### Befund: **Mehrfach-Definitionen mit subtil unterschiedlicher Semantik**

| Funktion | Definitionen | Files |
|---|---|---|
| `parseDate` | **3** | `app.js:41` (returns `null` for empty), `zinsen.js:129` (throws), `verrechnung.js:128` (returns `new Date(0)`) |
| `formatDate` | **2** | `app.js:47`, `zinsen.js:137` (identische Implementierung) |
| `formatEUR` | **3** | `app.js:54` (mit ` `), `rechner-tilgung.js:11` (IIFE-local, normaler Space), `zusammenfassung.js:204` (dead) |
| `formatNum` | **1** | `rechner-tilgung.js:15` (IIFE-local) |
| `parseBetrag` | **1** | `rechner-tilgung.js:7` |
| `parseGermanDecimal` | **1** | `utils.js:22` — **wird nirgends in eigenem JS aufgerufen** (Grep: 0 Treffer außerhalb von utils.js) |

**Inline-Reimplementierung von `parseGermanDecimal`:**
- `app.js`, `konto.js`, `rechner-zins.js:15`, `rechner-rvg.js:28`, `rechner-pkh.js:16`, `rechner-gkg.js:23–24`, `zv.js:86,89`, `konto.js:1148,1157`
- Inline-Pattern: `.replace(/\./g, '').replace(',', '.')` + `parseFloat`

**Konkrete Risiken aus den 3 `parseDate`-Varianten:**
- `zinsen.js:129` wirft bei `""` einen TypeError (split auf undefined)
- `verrechnung.js:128` returnt Epoch
- `app.js:41` returnt `null`

Wenn ein Caller die falsche Variante über die Load-Reihenfolge bekommt, gibt's subtile Bugs. Da `zinsen.js` und `verrechnung.js` beide global zuletzt geladen werden, ist aktuell `verrechnung.js`-Version aktiv — was bei leerem Datum still einen Epoch-Wert produziert und die Sortierung in `berechneVerrechnung()` korrumpieren kann.

**Empfehlung:**
- Eine kanonische `parseDate`-Variante in `utils.js` (mit Null-Behandlung).
- `parseGermanDecimal` aus utils.js entweder überall benutzen oder löschen.

**Aufwand:** 1h. **Nutzen: hoch** (verhindert latente Date-Sortier-Bugs).

---

## Smoke-Test-Ergebnisse

| Test | Ergebnis |
|---|---|
| `frontend/js/rechner-pkh.js` existiert? | **Ja** (110 LoC) |
| `frontend/pkh-rechner.html` existiert? | **Ja** |
| `rechner-pkh.js` in sw.js gecacht? | **Ja** (sw.js:45) |
| `pkh-rechner.html` in sw.js gecacht? | **Ja** (sw.js:44) |
| `requiresPaid` konsistent vor allen Pro-Features? | **Ja**: 8 aktive Stellen (`app.js:246, 262, 326, 2428, 2749`, `konto.js:468, 480, 1105, 1174`) |
| `requiresBusiness` konsistent vor allen Business-Features? | **Eingeschränkt**: nur **1** Stelle (`konto.js:960` für `csv-import`). Andere Business-Features (Status, Pinned, Notes, Mandanten-Adressbuch) werden nicht über Gate geschützt, sondern über UI-Hide (`data-auth-show="business"`). Bei Direkt-DOM-Manipulation also umgehbar — aber das ist State, der bei Cloud-Sync ohnehin per RLS in Supabase abgesichert sein muss. **Akzeptabel als Defense-in-Depth-Lücke, nicht als Security-Bug.** |
| `escHtml`-Verwendung bei dynamischen `innerHTML`-Writes? | **Größtenteils ja**. 3 dokumentierte `e.message`-Stellen ohne escHtml (Z. 1179, 1229, 1732 in app.js + konto.js:155). |
| Inline-onclick mit User-Input-IDs? | **Sicher**: `c.id` ist immer `'f' + Date.now()` oder Supabase-UUID, kein User-Input. |

---

## Top-5 Low-Hanging-Fruit-Refactorings (alle <2h)

### 1. **`zusammenfassung.js` löschen** (10 min, Nutzen: hoch)
- Datei + die 3 Doku-Erwähnungen entfernen.
- 221 LoC weniger, kein Risiko (Datei wird nicht geladen).
- **Aktionsschritt:** `git rm frontend/js/zusammenfassung.js`, dann Refs in `CLAUDE.md:187`, `AGENTS.md:186`, `docs/SYSTEM.md:253,416` entfernen.

### 2. **`parseDate` konsolidieren** (30 min, Nutzen: hoch)
- Eine kanonische Version in `utils.js` mit `if (!str) return null`-Guard.
- `parseDate` aus `app.js:41`, `zinsen.js:129`, `verrechnung.js:128` entfernen.
- **Aktionsschritt:** In utils.js definieren, drei Duplikate entfernen, dann `npm`/Browser-Smoke-Test der drei Rechner + Forderungsaufstellung.

### 3. **`e.message`-XSS-Lücken schließen** (15 min, Nutzen: mittel)
- Drei Stellen in `app.js` (1179, 1229, 1732) + eine in `konto.js:155` → `${escHtml(e?.message || '')}`.
- **Aktionsschritt:** Direkter Edit, fertig.

### 4. **`formatEUR` konsolidieren** (30 min, Nutzen: mittel)
- Kanonische Version in `utils.js` (entscheiden: ` ` oder normales Space — die `app.js`-Version mit nbsp ist semantisch korrekt für Beträge).
- `rechner-tilgung.js:11` darf seine lokale IIFE-Variante behalten (Closure-OK), oder zentralisiert werden.
- **Aktionsschritt:** utils.js erweitern, IIFE-Version aus rechner-tilgung.js entfernen.

### 5. **`parseGermanDecimal` aus utils.js durchsetzen oder löschen** (45 min, Nutzen: mittel)
- Aktuell **0 Aufrufer** außerhalb der Definition.
- Inline-Pattern `.replace(/\./g, '').replace(',', '.')` ~10× im Code wiederholt.
- **Aktionsschritt:** Entweder die ~10 inline-Stellen ersetzen oder die Funktion löschen — keine Halbheiten.

---

## Gesamteinschätzung

**Solide Vanilla-JS-Codebase mit pragmatischem Pro-Code-Stil — die größten Schwachstellen sind tote/doppelte Funktionsdefinitionen (`parseDate`, `formatEUR`, `zusammenfassung.js`) mit latentem Bugs-Risiko, nicht XSS oder strukturelle Probleme; alle Top-5-Refactorings zusammen sind in einem Halbtag erledigt und bringen die Code-Qualität von B+ auf A−.**
