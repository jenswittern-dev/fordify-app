# SYSTEM.md – Technisches Whitepaper Fordify

> Stand: 2026-04-01
> Zielgruppe: Entwickler, Claude Code (Kontext für neue Features)

---

## 1. Architekturüberblick

Fordify ist eine **reine Client-Side-SPA** ohne Build-Schritt:

```
Browser
  └── index.html
        ├── css/app.css          (gesamtes Styling + Print-CSS)
        ├── js/decimal.min.js    (externe Lib, exakte Dezimalarithmetik)
        ├── js/bootstrap.bundle.min.js
        ├── js/data.js           (statische Datentabellen)
        ├── js/zinsen.js         (Verzugszinsberechnung)
        ├── js/rvg.js            (RVG-Gebührenberechnung)
        ├── js/verrechnung.js    (§ 367 BGB Verrechnung)
        ├── js/zusammenfassung.js (deprecated – nicht mehr direkt genutzt)
        └── js/app.js            (State, UI, Event-Handling – ~2100 Zeilen)
```

**Service Worker** (`sw.js`, aktuell `fordify-v10`) cached alle Assets für Offline-Nutzung.
Bei Frontend-Änderungen: Cache-Name inkrementieren.

---

## 2. Datenmodell

### 2.1 localStorage-Keys

| Key | Inhalt |
|---|---|
| `fordify_cases` | Registry aller Fälle (JSON) |
| `fordify_settings` | Kanzlei-Einstellungen + Impressum (JSON) |
| `fordify_last_export` | ISO-Timestamp des letzten Exports |
| `fordify_theme` | Aktives Theme: `"brand"` (default) / `"dark"` / `"clean"` |
| `fordify_onboarded` | `"1"` wenn Onboarding-Modal bestätigt |
| `forderungsaufstellung_state` | Legacy-Key (Migration auf fordify_cases) |

### 2.2 Registry-Struktur (`fordify_cases`)

```json
{
  "currentCaseId": "c-abc123",
  "cases": {
    "c-abc123": {
      "id": "c-abc123",
      "name": "Müller ./. Schmidt – AZ 1/25",
      "updatedAt": "2026-04-01T10:00:00.000Z",
      "fall": { ...Fall-Objekt... },
      "naechsteId": 42
    }
  }
}
```

### 2.3 Fall-Objekt

```json
{
  "mandant": "Max Mustermann",
  "gegner": "Erika Musterfrau",
  "aktenzeichen": "1 C 123/25",
  "aufschlagPP": 9,
  "insoDatum": null,
  "forderungsgrundKat": "Titel",
  "titelArt": "Vollstreckungsbescheid",
  "titelDatum": "2024-01-15",
  "titelRechtskraft": "2024-02-01",
  "titelGericht": "AG Musterhausen",
  "titelAz": "12-1234567-0-5",
  "positionen": [ ...Positions-Array... ]
}
```

### 2.4 Positions-Objekt (alle Typen)

Gemeinsame Felder aller Typen:

```json
{
  "id": 7,
  "typ": "hauptforderung",
  "datum": "2024-03-01",
  "beschreibung": "Rechnung Nr. 2024-042",
  "betrag": "1500.00",
  "tituliert": false
}
```

Typ-spezifische Zusatzfelder:

| Typ | Zusatzfelder |
|---|---|
| `hauptforderung` | `gruppeId` ("g7") |
| `zinsperiode` | `gruppeId`, `hauptbetrag`, `zinsVon`, `zinsBis`, `aufschlag`, `perioden[]`, `tage` |
| `zinsforderung_titel` | `zinsBis`, `aufschlag` |
| `anwaltsverguetung` | `streitwert`, `vvNummern[]`, `faktoren{}`, `ustSatz`, `ohneUst`, `netto`, `ust` |
| `gerichtskosten` | `gkgStreitwert`, `gkgVerfahren` (Faktor als String, z.B. "3.0") |
| `zahlung` | _(nur Basisfelder)_ |
| `inkassopauschale` | _(nur Basisfelder)_ |
| `gv_kosten`, `zahlungsverbot`, `auskunftskosten`, `mahnkosten`, `sonstige_kosten` | _(nur Basisfelder)_ |

### 2.5 Einstellungen-Objekt (`fordify_settings`)

```json
{
  "logo": "data:image/png;base64,...",
  "logoPosition": "links",
  "imp": {
    "kanzlei": "",
    "rechtsform": "",
    "strasse": "",
    "plz": "",
    "ort": "",
    "telefon": "",
    "fax": "",
    "email": "",
    "website": "",
    "steuerNr": "",
    "ustIdNr": "",
    "vertreter": "",
    "berufsbezeichnung": "",
    "berufsrecht": "",
    "berufsrechtsUrl": "",
    "kammer": "",
    "haftpflicht": "",
    "freitext": "",
    "impressumUrl": "",
    "datenschutzUrl": ""
  }
}
```

---

## 3. Berechnungslogik

### 3.1 Verzugszinsen (`js/zinsen.js`)

**Formel:** `Zinsen = Betrag × (Basiszinssatz + Aufschlag) / 100 × Tage / 365`

- Basiszinssatz: aus `BASISZINSSAETZE[]` in `data.js` (aktuell bis 01.07.2026)
- Aufschlag: 5 PP (Verbraucher, § 288 Abs. 1 BGB) oder 9 PP (Unternehmer, § 288 Abs. 2 BGB)
- Zinssatz wird auf 0 geclampt (`Decimal.max(...)`) — kein negativer Zinssatz
- Perioden werden an Basiszinssatz-Wechselgrenzen (01.01 / 01.07) aufgeteilt
- Benachbarte Perioden mit identischem Zinssatz werden zusammengeführt

**InsO-Kappung:** Wenn `insoDatum` gesetzt, wird `zinsBis` auf `insoDatum - 1 Tag` gekappt.

### 3.2 RVG-Berechnung (`js/rvg.js`)

- Tabelle: `RVG_TABELLE[]` in `data.js` (BGBl. 2025 I Nr. 109, gültig ab 01.06.2025)
- VV-Nummern: `VV_DEFINITIONEN{}` in `data.js`
- Funktion: `berechneRVGGesamt(streitwert, vvNummern, tabelle, definitionen, faktoren)`
- USt-Satz wählbar: 0 % / 7 % / 19 % (default 19 %)

### 3.3 GKG-Gebühren (`js/app.js: gkgGebuehr()`)

- Tabelle: `GKG_TABELLE[]` in `data.js` (Anlage 2 GKG, KostBRÄG 2021)
- Über 500.000 €: 2.201 € + 108 € je angefangene weitere 30.000 €
- Verfahrensarten: Mahnbescheid (×0,5), Vollstreckungsbescheid (×1,5), Klage (×3,0), Berufung (×4,0)
- **Hinweis:** Tabelle vor Produktivnutzung mit aktueller amtlicher Fassung abgleichen

### 3.4 § 367 BGB Verrechnung (`js/verrechnung.js`)

**Reihenfolge der Anrechnung** bei Teilzahlung:
1. Kosten (unverzinslich)
2. Zinsen
3. Hauptforderung

Funktion: `berechneVerrechnung(positionen, stichtag, basiszinssaetze, aufschlagPP, insoDatum)`
- Sortiert Zahlungen chronologisch
- Berechnet für jede Zahlung die akkumulierten Zinsen zum Zahlungszeitpunkt
- Gibt Restsaldo, aufgeschlüsselt nach Kategorien, zurück

### 3.5 Zusammenfassung (`js/app.js: baueSummaryTabelle()`)

- Aktive Funktion ist `baueSummaryTabelle()` in `app.js` (NICHT `erstelleZusammenfassung()` in `zusammenfassung.js` — deprecated)
- Spalten: Hauptforderung / Zinsen / Kosten / Summe
- Ordnet Zinsperioden per `gruppeId` der jeweiligen Hauptforderung zu
- Fallback-Heuristik: Betragsvergleich für Legacy-Daten ohne `gruppeId`

---

## 4. Gruppen-System (mehrere Hauptforderungen)

Jede `hauptforderung`-Position hat eine `gruppeId` (z.B. `"g7"`).
Zugehörige `zinsperiode`-Positionen teilen dieselbe `gruppeId`.

- `neuGruppeId()` → `"g" + neuId()`
- `migratePositionen()`: Alte Positionen ohne `gruppeId` → `"g0"` (lazy migration, idempotent)
- `holeGruppen()`: gibt deduplizierte Hauptforderungen zurück (eine pro gruppeId)
- `neueRechnungsgruppe()`: erstellt neue gruppeId, öffnet Hauptforderungs-Modal

**Wichtig:** `berechneVerrechnung()` sortiert nach Datum — implizite Reihenfolge wäre zerstört. Deshalb `gruppeId` als explizite Zuordnung.

---

## 5. UI-Architektur

### 5.1 Ansichten (Views)

```
stammdaten  → Mandant, Gegner, AZ, Aufschlag, InsO, Forderungsgrund
eingabe     → Positions-Tabelle + Modal-Workflow
vorschau    → Druckvorschau (rendereVorschau()) + PDF-Export
```

Navigation via `zeigeAnsicht(name)` — schaltet `d-none` um.

### 5.2 Modal-Workflow

```
positionHinzufuegen(typ) / positionBearbeiten(id)
  → modalOeffnen(typ, pos)
    → renderModalInhalt(typ, pos)  [Template-Funktion je Typ]
  → modalDynamischAktualisieren(typ)  [Live-Vorschau bei input/change]
  → modalSpeichern()
    → modalDatenLesen()  [liest Formularfelder, gibt Positions-Objekt zurück]
    → state.fall.positionen.push/splice
    → speichernMitFeedback() + renderePositionsliste()
```

### 5.3 Undo-Stack

- `pushUndo()` vor jeder Mutation aufrufen
- Max. 20 Einträge (LIFO)
- `undo()` stellt letzten State wieder her
- Tastatur: Strg+Z (außerhalb von Eingabefeldern)

### 5.4 Theme-System

Drei Themes, umschaltbar im Einstellungen-Modal unter „Erscheinungsbild":

| Theme-Key | Name | Beschreibung |
|---|---|---|
| `brand` (default) | Professionell | Gradient-Navbar (Blau), Shimmer-Animation, Card-Hover-Lift |
| `dark` | Dark | Vollständiges Dark Mode – alle Bootstrap-Komponenten überschrieben |
| `clean` | Clean | Notion-Stil: weiße Navbar, flache Cards mit 1px-Border, kein Schatten, Blau #2383e2 |

**Logo-Varianten:**
- `img/logo.svg` — Standard (blauer Hintergrund, weißes F)
- `img/logo-dark.svg` — freigestellt, kein Hintergrund, weißes F (für Dark-Navbar)
- `img/logo-clean.svg` — freigestellt, kein Hintergrund, blaues F (für weiße Navbar)
- Logo-Tausch erfolgt per JS in `themeWechseln()` via `.navbar-brand img` src-Swap

**Technisch:**
- `[data-theme]`-Attribut auf `<html>` — CSS Custom Properties werden überschrieben
- `brand` = kein Attribut (Base-Styles gelten)
- `css/themes.css` wird nach `css/app.css` geladen (gezieltes Überschreiben)
- Persistenz: `localStorage["fordify_theme"]`
- Funktionen: `themeWechseln(name)`, `themeLaden()`, `aktualisierThemeSwitcher(name)` in `app.js`
- UI: `.theme-card` / `.theme-switcher` Komponenten im Einstellungen-Modal

### 5.5 Print-Popup

`drucken()` öffnet `window.open()` mit vollständigem HTML (CSS inline injiziert),
ruft `window.print()` nach 400ms auf. Popup-Blocker-Fallback: Alert mit Hinweis.
Kein html2canvas / jsPDF — native Druckengine des Browsers erzeugt text-searchable PDF.

---

## 6. Service Worker & Caching

- Cache-Name: `fordify-vN` (aktuell `fordify-v10`)
- Strategie: Cache-First, dann Network
- **Regel:** Bei jedem Commit mit geänderten Frontend-Dateien → N um 1 erhöhen
- Asset-Liste in `sw.js` muss neue Dateien enthalten

---

## 7. Datentabellen – Pflegeanforderungen

| Tabelle | Quelle | Nächste Fälligkeit |
|---|---|---|
| `BASISZINSSAETZE` in `data.js` + `data/basiszinssaetze.json` | Deutsche Bundesbank | 01.07.2026 |
| `RVG_TABELLE` in `data.js` | BGBl. 2025 I Nr. 109 | bei nächster RVG-Reform |
| `GKG_TABELLE` in `data.js` | KostBRÄG 2021 | bei nächster GKG-Reform (→ abgleichen) |

---

## 8. Bekannte Besonderheiten & Fallstricke

- **Typografische Anführungszeichen** (`„"`) in JS-Strings verursachen SyntaxError → immer `\u201e` / `\u201c` verwenden
- `href="#"` in Navigationslinks schreibt `#` in die URL → immer `href="javascript:void(0)"` oder `onclick="return false;"`
- `zusammenfassung.js: erstelleZusammenfassung()` ist deprecated — nicht wieder aktivieren
- `berechneVerrechnung()` sortiert intern nach Datum — Positionsreihenfolge im Array ist für Verrechnung irrelevant
- `localStorage` ist domain-scoped: Entwicklung auf `localhost` vs. Produktion `fordify.de` haben getrennte Stores
