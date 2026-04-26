# Implementierungsplan: ZV-Formulare (5.7) + PKH-Kalkulator (3.8) + Konto v2 (5.5)

**Erstellt:** 2026-04-26  
**Status:** 📋 In Planung  
**Reihenfolge:** 5.7 → 3.8 → 5.5 (nach Impact, absteigend; jedes Feature unabhängig deploybar)

---

## Statusübersicht

| # | Feature | Status |
|---|---|---|
| 5.7.1 | ZV: PDF-Recherche + Feldmapping | 📋 |
| 5.7.2 | ZV: Dateneingabe-UI + neue Pflichtfelder | 📋 |
| 5.7.3 | ZV: PDF-Generierung (pdf-lib) | 📋 |
| 5.7.4 | ZV: Gate + Integration + Rollout | 📋 |
| 3.8.1 | PKH: §49-Tabelle recherchieren + in data.js | 📋 |
| 3.8.2 | PKH: Berechnungslogik in rvg.js | 📋 |
| 3.8.3 | PKH: UI-Toggle im RVG-Rechner | 📋 |
| 5.5.1 | Konto: DB-Schema (status, notes, pinned) | 📋 |
| 5.5.2 | Konto: Storage-Sync für neue Felder | 📋 |
| 5.5.3 | Konto: Fälle-Tab (Suche, Filter, Status-Badge, Pinned) | 📋 |
| 5.5.4 | Konto: Fall-Detail (Status-Selektor + Notiz in app.js) | 📋 |

---

## Abo-Zuordnung

| Feature | Free | Pro | Business | Begründung |
|---|:---:|:---:|:---:|---|
| **5.7 ZV-Auftrag-Generierung** | — | ✅ | ✅ | Kernnutzen für professionelle Vollstreckungspraxis; erhöht Pro-Wert signifikant. Gate via `requiresPaid('ZV-Auftrag')`. |
| **3.8 PKH-Kalkulator** | ✅ | ✅ | ✅ | Analog zum bestehenden RVG-Rechner: SEO-wirksamer Kalkulator ohne Datenspeicherung. Kein Gate. |
| **5.5 Konto-Bereich v2** (Status, Notizen, Pinned) | — | ✅ | ✅ | Status/Notizen nur sinnvoll mit Cloud-Sync (Supabase). Free-Nutzer nutzen sessionStorage ohne persistente Fallverwaltung. |

**Konsequenzen für die Implementierung:**
- **5.7**: Button in `forderungsaufstellung.html` wird mit `data-auth-show="user"` und `requiresPaid()` in `gates.js` abgesichert. Free-Nutzer sehen den Button nicht; eingeloggter Free-Nutzer (ohne Abo) sieht Upgrade-Modal.
- **3.8**: Kein Gate, kein `data-auth-show`. Identische Verfügbarkeit wie die bestehenden Rechner-Seiten.
- **5.5**: Status-Dropdown und Notizfeld in `forderungsaufstellung.html` nur rendern wenn `fordifyAuth.isAuthenticated && fordifyAuth.hasSubscription`. Im Konto-Tab (`konto.html`) sowieso nur für eingeloggte Nutzer erreichbar.

---

## Feature 5.7 – ZV-Auftrag-Generierung

### Ziel
Nach Abschluss einer Forderungsaufstellung kann der Nutzer mit einem Klick den offiziellen
Vollstreckungsauftrag an den Gerichtsvollzieher (ZwVollstrFormV 2024) als befülltes PDF
herunterladen. Alle bekannten Felder (Schuldner, Gläubiger/Kanzlei, Forderungshöhe,
Aktenzeichen) werden automatisch vorausgefüllt.

### Rechtsgrundlage
§ 753 ZPO i.V.m. ZwVollstrFormV – bundeseinheitliche Formulare seit 2013 verpflichtend.
Das Formular muss das **offizielle** Formular sein (kein eigenes Layout).

### Technischer Ansatz
**pdf-lib.js** (MIT-Lizenz, ~650 KB, browser-native, kein Server nötig) füllt AcroForm-Felder
des offiziellen PDFs im Browser aus. Das befüllte PDF wird ohne Server-Roundtrip
heruntergeladen.

Fallback: Falls das offizielle PDF keine AcroForm-Felder hat (flat PDF), Koordinaten-Overlay
via pdf-lib (`drawText` auf festen x/y-Positionen). Risiko: höhere Wartungsaufwand bei
Formular-Updates.

### Phase 5.7.1 – Vorbereitung (Recherche)
**Ziel:** Offizielles Formular beschaffen, AcroForm-Status prüfen, Feldnamen dokumentieren.

Schritte:
1. Offizielles ZwVollstrFormV-Formular laden von BMJV / justizonline.de
2. Mit pdf-lib oder Adobe Acrobat: alle Feldnamen + Koordinaten extrahieren
3. Mapping-Tabelle erstellen:

| fordify-Quelle | ZV-Formular-Feld |
|---|---|
| kanzlei.name + adresse | Gläubigervertreter |
| fall.schuldner.name/adresse | Schuldner |
| berechnungsErgebnis.gesamt | Forderungsbetrag gesamt |
| berechnungsErgebnis.hauptforderung | davon Hauptforderung |
| berechnungsErgebnis.zinsen | davon Zinsen |
| berechnungsErgebnis.kosten | davon Kosten |
| fall.aktenzeichen | Aktenzeichen Kanzlei |
| [neue Felder, s.u.] | Vollstreckungstitel-Details |

4. Entscheidung: AcroForm-Fill vs. Koordinaten-Overlay → im Plan dokumentieren

**Neue Pflichtfelder** (nicht in fordify vorhanden, müssen eingegeben werden):
- `zvTitelArt` – Dropdown: Urteil / Beschluss / Vollstreckungsbescheid / notarielles Schuldanerkenntnis / vollstreckbarer Vergleich / sonstiger Titel
- `zvTitelDatum` – Datum des Titels
- `zvTitelGericht` – Ausstellendes Gericht / Behörde
- `zvTitelAktenzeichen` – Aktenzeichen des Titels (≠ Kanzlei-AZ)
- `zvZustellungsDatum` – Datum der Zustellung der vollstreckbaren Ausfertigung
- `zvMassnahmen` – Checkboxen: Pfändung Mobilien / Vermögensauskunft / Wegnahme-Herausgabe / GBA-Abfrage / sonstige
- `zvHinweise` – Freitextfeld für besondere Anweisungen

Diese Felder werden **nicht persistent gespeichert** (sie gelten pro PDF-Erstellung).

### Phase 5.7.2 – Dateneingabe-UI
**Datei:** `frontend/forderungsaufstellung.html`

- Neuer Button „ZV-Auftrag erstellen →" in der Toolbar (nur sichtbar für eingeloggte Pro/Business-Nutzer, gated via `requiresPaid()`)
- Öffnet ein Modal mit zwei Bereichen:
  - **Vorausgefüllte Felder** (read-only, aus Fall-Daten): Schuldner, Gläubiger, Forderung
  - **Neue Pflichtfelder** (Eingabe): Titel-Details, Maßnahmen, Hinweise
- „PDF herunterladen"-Button löst Generierung aus

### Phase 5.7.3 – PDF-Generierung
**Neue Datei:** `frontend/js/zv.js`

```js
// Kernfunktion (Pseudocode)
async function erstelleZVAuftrag(fallDaten, kanzleiDaten, zvFelder) {
  const pdfBytes = await fetch('/data/zv_formular.pdf').then(r => r.arrayBuffer());
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Mapping: form.getTextField('FeldName').setText(wert)
  // ...alle Felder befüllen...

  const ausgabe = await pdfDoc.save();
  // Download triggern
  const blob = new Blob([ausgabe], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ZV-Auftrag_${fallDaten.aktenzeichen || 'export'}.pdf`;
  a.click();
}
```

**Neue Datei:** `frontend/data/zv_formular.pdf` – offizielles Formular (gebundelt)

**sw.js:** pdf-lib + zv_formular.pdf + zv.js in ASSETS ergänzen

### Phase 5.7.4 – Integration & Gate
- `gates.js`: ZV-Button wird über `requiresPaid('ZV-Auftrag')` gesteuert → Free-Nutzer sehen Upgrade-Modal
- `app.js`: ZV-Modal-Logik einbinden, Fallzustand an `erstelleZVAuftrag()` übergeben
- Roadmap-Eintrag 5.7 auf ✅ setzen

### Geänderte / neue Dateien
| Datei | Änderung |
|---|---|
| `frontend/js/zv.js` | **neu** – PDF-Fill-Logik |
| `frontend/data/zv_formular.pdf` | **neu** – offizielles Formular |
| `frontend/forderungsaufstellung.html` | ZV-Button + Modal |
| `frontend/js/app.js` | ZV-Modal-Aufruf + Datenweitergabe |
| `frontend/sw.js` | ASSETS: pdf-lib, zv.js, zv_formular.pdf |
| `docs/ROADMAP.md` | 5.7 auf ✅ |

---

## Feature 3.8 – PKH-Kalkulator (§ 49 RVG)

### Ziel
Neuer Modus „PKH / Staatskasse" im bestehenden RVG-Rechner. Eingabe wie bisher
(Streitwert + VV-Nummern), Ausgabe sind die reduzierten PKH-Vergütungen nach § 49 RVG
(Abrechnung gegenüber Staatskasse), plus Vergleich zur normalen RVG-Vergütung.

### Abgrenzung
**Kein Festsetzungsformular** (§ 55 RVG) – die Formulare variieren je Bundesland/Gericht
und wären zu fehleranfällig. fordify liefert die **berechneten Beträge**; der Anwalt trägt
diese in das Formular seines Gerichts ein.

### Phase 3.8.1 – Datentabelle
**Datei:** `frontend/js/data.js`

§ 49 RVG definiert Höchstbeträge für PKH-Vergütung in Abhängigkeit von Streitwert und
Gebührentatbestand. Die Tabelle entspricht strukturell der `RVG_TABELLE`, aber mit
PKH-spezifischen Beträgen (BGBl. 2025 I Nr. 109 prüfen – gilt dieselbe Reform).

```js
const PKH_TABELLE = [
  // { bis: number, gebuehr: "x.xx" }  — analog RVG_TABELLE
  // Werte aus § 49 RVG recherchieren und eintragen
];
```

Hinweis: § 49 RVG setzt keine einfachen Prozentwerte der Normgebühr, sondern eigene
Betragsrahmen. Die genauen Werte sind im Rahmen von Phase 3.8.1 aus dem aktuellen
Gesetzestext zu übernehmen.

### Phase 3.8.2 – Berechnungslogik
**Datei:** `frontend/js/rvg.js`

Neue Funktion analog `berechneRVGPosition`:
```js
function berechneRVGPositionPKH(streitwert, vvNummer, pkh_tabelle, vvDef) {
  // Wie berechneRVGPosition, aber:
  // - Tabelle = PKH_TABELLE (§49 RVG)
  // - Höchstbetrag-Logik (PKH kappt bei Tabellenmaximum)
  // - Gibt zusätzlich normalerBetrag zurück für Vergleich
}
```

### Phase 3.8.3 – UI
**Datei:** `frontend/rvg-rechner.html` + `frontend/js/rechner-rvg.js`

- Toggle-Button oberhalb der Ergebnistabelle: `[ Normal RVG ]  [ PKH / Staatskasse ]`
- Bei PKH-Modus:
  - Ergebnistabelle zeigt PKH-Beträge (§ 49 RVG)
  - Zusätzliche Spalte: „Normalbetrag (RVG)" zum Vergleich
  - Hinweistext: „Vergütung aus der Staatskasse nach § 49 RVG – kein Ersatz für anwaltliche Prüfung"
- Kein Gate (Free-Nutzer können PKH-Rechner nutzen wie den normalen RVG-Rechner)

### Geänderte Dateien
| Datei | Änderung |
|---|---|
| `frontend/js/data.js` | `PKH_TABELLE` ergänzen |
| `frontend/js/rvg.js` | `berechneRVGPositionPKH()` |
| `frontend/js/rechner-rvg.js` | PKH-Modus-Logik |
| `frontend/rvg-rechner.html` | Toggle + Ausgabe-Erweiterung |
| `docs/ROADMAP.md` | 3.8 auf ✅ |

---

## Feature 5.5 – Konto-Bereich v2

### Ziel
Bessere Fallverwaltung für Pro/Business-Nutzer mit größerem Fallvolumen:
Status-Workflow, Volltextsuche, Notizen pro Fall, Favoriten (angeheftete Fälle).

### Phase 5.5.1 – DB-Schema
**Datei:** `supabase/schema.sql`

Neue Spalten in der `cases`-Tabelle:
```sql
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS fall_status TEXT DEFAULT 'offen'
    CHECK (fall_status IN ('offen','in_vollstreckung','erledigt','abgeschrieben')),
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
```

Hinweis: Spaltenname `fall_status` statt `status` um Konflikt mit Supabase-Systemspalten
zu vermeiden. Migration muss über Supabase-CLI deployed werden.

RLS: bestehende Policy „cases: eigene Zeilen" deckt neue Spalten automatisch ab – kein
separater Handlungsbedarf.

### Phase 5.5.2 – Storage-Sync
**Datei:** `frontend/js/storage.js`

Die neue Felder `fall_status`, `notes`, `pinned` werden beim Cloud-Sync mitgeschrieben.
Da die Felder **nicht** im `data`-JSONB-Feld, sondern als eigene Spalten liegen, muss
`speichereCase()` und `ladeCase()` angepasst werden:
- `speichereCase()`: neue Felder als Top-Level-Spalten übergeben
- `ladeFaelle()`: neue Felder in das zurückgegebene Case-Objekt aufnehmen

Im localStorage wird `fall_status`, `notes`, `pinned` im Fall-Objekt direkt mitgespeichert
(kein separates Handling nötig).

### Phase 5.5.3 – Konto-Seite: Fälle-Tab
**Datei:** `frontend/konto.html` + `frontend/js/konto.js`

Neue UI-Elemente im Fälle-Tab:

**Toolbar (oberhalb der Fallliste):**
- Suchfeld: Freitext-Suche nach Schuldnername, Aktenzeichen (client-seitig, kein DB-Call)
- Filter-Dropdown: Alle Fälle / Offen / In Vollstreckung / Erledigt / Abgeschrieben
- Sortierung: Zuletzt geändert (default) / Betrag ↓ / Name A–Z

**Fallliste:**
- Angeheftete Fälle erscheinen immer oben (Pin-Icon zum Umschalten)
- Status-Badge pro Fall (farbkodiert: offen=blau, in_vollstreckung=orange, erledigt=grün, abgeschrieben=grau)
- Notiz-Icon (💬) wenn `notes` vorhanden, Tooltip zeigt ersten 80 Zeichen

### Phase 5.5.4 – Fall-Detail in der App
**Datei:** `frontend/forderungsaufstellung.html` + `frontend/js/app.js`

Im Fall-Header (unterhalb von Aktenzeichen/Schuldner):
- Status-Dropdown (Offen / In Vollstreckung / Erledigt / Abgeschrieben) — nur für eingeloggte Nutzer sichtbar
- Notizfeld (Textarea, max 500 Zeichen, Placeholder: „Interne Notiz zu diesem Fall…") — nur für eingeloggte Nutzer
- Auto-Save bei `blur` (kein extra Speichern-Button)

### Geänderte Dateien
| Datei | Änderung |
|---|---|
| `supabase/schema.sql` | ALTER TABLE cases + neue Spalten |
| `frontend/js/storage.js` | Sync für fall_status, notes, pinned |
| `frontend/js/app.js` | Status-Dropdown + Notizfeld |
| `frontend/forderungsaufstellung.html` | Status/Notiz-UI im Fall-Header |
| `frontend/konto.html` | Fälle-Tab: Suche, Filter, Sort, Badges |
| `frontend/js/konto.js` | Neue Fälle-Tab-Logik |
| `docs/ROADMAP.md` | 5.5 auf ✅ |

---

## Reihenfolge & Abhängigkeiten

```
5.7.1 (PDF-Recherche)
  └── 5.7.2 (UI)
        └── 5.7.3 (PDF-Generierung)
              └── 5.7.4 (Gate + Integration)

3.8.1 (PKH-Tabelle)
  └── 3.8.2 (Logik)
        └── 3.8.3 (UI)

5.5.1 (DB-Migration) ← deploy erforderlich, bevor 5.5.2 entwickelt wird
  └── 5.5.2 (Storage)
        └── 5.5.3 + 5.5.4 (UI, parallel entwickelbar)
```

5.7 und 3.8 haben keine gegenseitigen Abhängigkeiten und können parallel bearbeitet werden.
5.5.1 muss vor 5.5.2 deployed sein.

---

## Offene Fragen / Risiken

| # | Frage | Betrifft | Konsequenz wenn unklar |
|---|---|---|---|
| R1 | Haben die offiziellen ZwVollstrFormV-PDFs AcroForm-Felder? | 5.7 | Fallback auf Koordinaten-Overlay (mehr Wartungsaufwand) |
| R2 | Sind die offiziellen Formulare frei redistribuierbar (Bundle im Repo)? | 5.7 | Alternativ: Nutzer lädt Formular selbst hoch (file input) |
| R3 | Wurden §49-RVG-Beträge in BGBl. 2025 I Nr. 109 angepasst? | 3.8 | Falsche PKH-Beträge → unbedingt vor Launch prüfen |
| R4 | Supabase-Migration: Downtime-Risiko bei ALTER TABLE auf aktiver Prod-DB? | 5.5 | Migration in Nebenzeit deployen; ADD COLUMN ist online-safe |
