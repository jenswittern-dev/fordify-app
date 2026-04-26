# Implementierungsplan: ZV-Formulare (5.7) + PKH-Kalkulator (3.8) + Konto v2 (5.5)

**Erstellt:** 2026-04-26  
**Status:** ✅ Abgeschlossen (2026-04-26)  
**Reihenfolge:** 5.7 → 3.8 → 5.5 (nach Impact, absteigend; jedes Feature unabhängig deploybar)

---

## Statusübersicht

| # | Feature | Status |
|---|---|---|
| 5.7.1 | ZV: PDF-Recherche + Feldmapping | ✅ |
| 5.7.2 | ZV: Dateneingabe-UI + neue Pflichtfelder | ✅ |
| 5.7.3 | ZV: PDF-Generierung (pdf-lib) | ✅ |
| 5.7.4 | ZV: Gate + Integration + Rollout | ✅ |
| 5.7.5 | ZV: AGB + Preise + Startseite + Changelog | ✅ |
| 3.8.1 | PKH: §49-Tabelle recherchieren + in data.js | ✅ |
| 3.8.2 | PKH: Berechnungslogik in rvg.js | ✅ |
| 3.8.3 | PKH: UI-Toggle im RVG-Rechner | ✅ |
| 3.8.4 | PKH: AGB + Preise + Changelog | ✅ |
| 5.5.1 | Konto: DB-Schema (status, notes, pinned) | ✅ |
| 5.5.2 | Konto: Storage-Sync für neue Felder | ✅ |
| 5.5.3 | Konto: Fälle-Tab (Suche, Filter, Status-Badge, Pinned) | ✅ |
| 5.5.4 | Konto: Fall-Detail (Status-Selektor + Notiz in app.js) | ✅ |
| 5.5.5 | Konto: Datenschutz + AVV + Preise + Changelog | ✅ |
| Q.1 | Querschnitt: Startseite (index.html) – ZV-Auftrag bewerben | ✅ |
| Q.2 | Querschnitt: Preisseite (preise.html) – alle 3 Features | ✅ |
| Q.3 | Querschnitt: Changelog – alle 3 Features | ✅ |

---

## Abo-Zuordnung

| Feature | Free | Pro | Business | Begründung |
|---|:---:|:---:|:---:|---|
| **5.7 ZV-Auftrag-Generierung** | — | ✅ | ✅ | Kernnutzen für professionelle Vollstreckungspraxis; erhöht Pro-Wert signifikant. Gate via `requiresPaid('ZV-Auftrag')`. |
| **3.8 PKH-Kalkulator** | ✅ | ✅ | ✅ | Analog zum bestehenden RVG-Rechner: SEO-wirksamer Kalkulator ohne Datenspeicherung. Kein Gate. |
| **5.5 Konto-Bereich v2** (Status, Notizen, Pinned, Suche, Filter) | — | — | ✅ | Vollständige Fallverwaltung als Business-Differenziator. Stärkt das Business-Wertversprechen (+30€/Monat) und positioniert Business klar als „Kanzlei-Management"-Tier. |

**Konsequenzen für die Implementierung:**
- **5.7**: Button in `forderungsaufstellung.html` mit `data-auth-show="user"` und `requiresPaid()` absichern. Free-Nutzer sehen den Button nicht; eingeloggter Free/Pro-Nutzer ohne Business-Abo sieht Upgrade-Modal.
- **3.8**: Kein Gate, kein `data-auth-show`. Identische Verfügbarkeit wie die bestehenden Rechner-Seiten.
- **5.5**: Status-Dropdown und Notizfeld in `forderungsaufstellung.html` nur rendern wenn `fordifyAuth.plan === 'business'`. Im Konto-Tab (`konto.html`) Suche/Filter/Badges ebenfalls nur für Business. `gates.js` benötigt ggf. ein neues `requiresBusiness()`-Gate analog zu `requiresPaid()`, das explizit auf Business-Plan prüft.

---

## Querschnittsaufgaben

### Navigation Header & Footer

Alle HTML-Seiten enthalten **kopiertes (nicht komponentisiertes) Nav- und Footer-HTML**. Änderungen müssen deshalb in jeder betroffenen `.html`-Datei synchron erfolgen.

Für die drei Features sind **keine neuen Navigationspunkte** erforderlich:

| Feature | Begründung |
|---|---|
| 5.7 ZV-Auftrag | Kein eigener URL – Button erscheint innerhalb von `forderungsaufstellung.html` (Modal). Kein Navbar- oder Footer-Eintrag nötig. |
| 3.8 PKH-Kalkulator | Toggle innerhalb von `rvg-rechner.html`. Die RVG-Rechner-Karte im Navbar-Dropdown bleibt unverändert (`Anwaltsgebühren nach RVG`). Optional könnte die Beschriftung erweitert werden – wenn gewünscht, **alle** HTML-Dateien in einem Commit. |
| 5.5 Konto v2 | `konto.html` bereits im User-Dropdown erreichbar. Kein neuer Punkt. |

Footer-Tools-Liste verlinkt auf `forderungsaufstellung` (wo ZV erreichbar ist) und auf `rvg-rechner` (wo PKH erreichbar ist) – **keine Footer-Änderungen nötig**.

### Q.1 – Startseite (index.html)

Die Forderungsaufstellung-Karte auf der Startseite beschreibt den aktuellen Funktionsumfang. Nach Fertigstellung von 5.7 muss sie den ZV-Auftrag als Pro-Feature erwähnen, damit der Mehrwert des Upgrades auf der Einstiegsseite sichtbar ist.

**Betroffene Datei:** `frontend/index.html`

Änderungen:
- Beschreibungstext der primären Tool-Karte (`tool-card--primary`) um ZV-Hinweis ergänzen:  
  *Aktuell:* „Vollständige Forderungsaufstellung mit Verzugszinsen, RVG-Gebühren und automatischer § 367-Verrechnung. Druckfertig als PDF exportierbar."  
  *Neu:* „… Druckfertig als PDF exportierbar. Pro: ZV-Auftrag an den Gerichtsvollzieher (§ 753 ZPO) direkt aus dem Fall generieren."
- Optional: Hero-Mockup-Footer um Badge „ZV ✓" ergänzen (low priority, nice-to-have)

Layout-Hinweis: Kein strukturelles Eingriff – nur Text innerhalb des bestehenden `tool-card__desc` und `tool-card__footer`. Keine CSS-Änderungen nötig.

### Q.2 – Preisseite (preise.html)

Alle drei Plan-Karten und die Vergleichstabelle müssen die neuen Features aufführen, damit Nutzer vor dem Kauf wissen, was sie bekommen.

**Betroffene Datei:** `frontend/preise.html`

**Free-Plan** – ergänzen:
```html
<li>✓ PKH-Kalkulator (§ 49 RVG – Vergütung aus Staatskasse)</li>
```

**Pro-Plan** – ergänzen (nach „Schuldner-Adressbuch"):
```html
<li>✓ ZV-Auftrag-Generierung (§ 753 ZPO, amtliches Formular)</li>
```

**Business-Plan** – ergänzen (nach „CSV-Import"):
```html
<li>✓ Fall-Status & Workflow-Verwaltung</li>
<li>✓ Fall-Notizen (Freitext, cloud-synchronisiert)</li>
<li>✓ Favoritenmarkierung & Suche/Filter über alle Fälle</li>
```

**Vergleichstabelle** – neue Zeilen ergänzen (nach bestehenden Rechner-Zeilen):
```html
<tr><td>PKH-Kalkulator (§ 49 RVG)</td><td class="check">✓</td><td class="check col-pro">✓</td><td class="check">✓</td></tr>
<tr><td>ZV-Auftrag-Generierung (§ 753 ZPO)</td><td class="cross">–</td><td class="check col-pro">✓</td><td class="check">✓</td></tr>
<tr><td>Fall-Status &amp; Workflow</td><td class="cross">–</td><td class="cross col-pro">–</td><td class="check">✓</td></tr>
<tr><td>Fall-Notizen &amp; Favoriten</td><td class="cross">–</td><td class="cross col-pro">–</td><td class="check">✓</td></tr>
<tr><td>Fallsuche &amp; Filter</td><td class="cross">–</td><td class="cross col-pro">–</td><td class="check">✓</td></tr>
```

**Meta-Description** aktualisieren: Business-Kurzbeschreibung im `<head>` ergänzen um Fallverwaltung/Status/Notizen.

### Q.3 – Changelog (changelog.html)

Nach Abschluss aller Features einen gebündelten Changelog-Eintrag anlegen. Inhalt: ZV-Auftrag-Generierung (Pro/Business), PKH-Kalkulator (Free), Konto-Verbesserungen für Business (Status, Notizen, Suche, Filter, Favoriten).

### Q.4 – N8N Onboarding-Mail (Workflow `elcsjZCxDmtCw2BI`)

Nach allen drei Features live: Onboarding-E-Mail aktualisieren, damit neue Abonnenten sofort auf neue Features hingewiesen werden.

- **Pro-Onboarding**: ZV-Auftrag erwähnen – „Erstellen Sie mit einem Klick den offiziellen Vollstreckungsauftrag direkt aus Ihrer Forderungsaufstellung"
- **Business-Onboarding**: Konto-Features erwähnen – „Verwalten Sie Ihre Fälle mit Status-Workflow, Notizen und Volltextsuche direkt im Konto-Bereich"

Update via N8N API: `PUT https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/elcsjZCxDmtCw2BI`

Hinweis für andere Workflows: Die Datenlöschungs-Cron und Digest-Workflows greifen auf `cases`-Zeilen zu, nicht auf Spalten – `fall_status`, `notes`, `pinned` sind transparent für bestehende Workflows, kein Update nötig.

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

**Layout-Hinweis:** Das Modal folgt dem Bootstrap-`modal`-Pattern der bestehenden Modals (Login-Modal, Upgrade-Modal in `gates.js`). Kein neues CSS nötig – `modal-dialog modal-lg modal-dialog-centered` mit zwei `row`-Spalten für vorausgefüllte vs. neue Felder. Icon-Stil und Button-Klassen aus `app.css` übernehmen.

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

### Phase 5.7.5 – Rechtsdoks + Marketing-Seiten + Changelog

**AGB – §2 Leistungsumfang:**
Neuer Spiegelstrich unter „kostenpflichtige Abonnements" (Pro/Business):
> „Automatisiertes Ausfüllen des amtlichen Vollstreckungsauftrags an den Gerichtsvollzieher (§ 753 ZPO i.V.m. ZwVollstrFormV 2024) auf Basis der Forderungsaufstellungsdaten"

Layout-Hinweis: Die AGB-Seite (`agb.html`) hat keinen eigenen Stylesheet-Override – Standardformatierung mit `<li>` im bestehenden Abschnitt §2.

**Startseite + Preisseite:** Wie in Q.1 und Q.2 beschrieben (im selben Commit).

**Changelog:** Eintrag vorbereiten (kann gebündelt mit 3.8 und 5.5 erfolgen, s. Q.3).

### Geänderte / neue Dateien
| Datei | Änderung |
|---|---|
| `frontend/js/zv.js` | **neu** – PDF-Fill-Logik |
| `frontend/data/zv_formular.pdf` | **neu** – offizielles Formular |
| `frontend/forderungsaufstellung.html` | ZV-Button + Modal |
| `frontend/js/app.js` | ZV-Modal-Aufruf + Datenweitergabe |
| `frontend/sw.js` | ASSETS: pdf-lib, zv.js, zv_formular.pdf |
| `frontend/agb.html` | §2: ZV-Auftrag in Leistungsumfang |
| `frontend/index.html` | Tool-Karte: ZV-Hinweis ergänzen |
| `frontend/preise.html` | Pro/Business: ZV-Auftrag; Tabelle; Meta |
| `frontend/changelog.html` | Neuer Eintrag (gebündelt mit 3.8 + 5.5) |
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

**Layout-Hinweis:** `rvg-rechner.html` verwendet das bestehende Rechner-Layout aus `rechner.css` (`.rechner-card`, `.rechner-result-table`). Der Toggle kann als `btn-group` mit zwei `.btn-outline-primary`-Buttons oberhalb des Ergebnisblocks gesetzt werden – identisches Muster wie es andere Seitenfilter in der App nutzen. Keine neuen CSS-Regeln nötig.

### Phase 3.8.4 – Rechtsdoks + Preise + Changelog

**AGB – §2 Leistungsumfang:**
PKH-Kalkulator gehört zu den kostenlosen Tools. Ergänzung unter §2 (Gratisleistungen):
> „PKH-Kalkulator: Berechnung der Anwaltsvergütung aus der Staatskasse nach § 49 RVG (Prozesskostenhilfe) inkl. Vergleich zur Normalvergütung"

**Preisseite:** Wie in Q.2 beschrieben – PKH-Kalkulator in Free-Plan und Vergleichstabelle ergänzen.

**Changelog:** Gebündelt mit 5.7 und 5.5.

### Geänderte Dateien
| Datei | Änderung |
|---|---|
| `frontend/js/data.js` | `PKH_TABELLE` ergänzen |
| `frontend/js/rvg.js` | `berechneRVGPositionPKH()` |
| `frontend/js/rechner-rvg.js` | PKH-Modus-Logik |
| `frontend/rvg-rechner.html` | Toggle + Ausgabe-Erweiterung |
| `frontend/agb.html` | §2: PKH-Kalkulator ergänzen |
| `frontend/preise.html` | Free-Plan + Tabelle: PKH-Zeile |
| `frontend/changelog.html` | Neuer Eintrag (gebündelt) |
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

**Layout-Hinweis:** Beide Elemente kommen unterhalb des Fall-Headers in einem Container, der nur gerendert wird wenn `fordifyAuth.plan === 'business'`. Bootstrap-`form-select` für das Dropdown, `form-control form-control-sm` für die Textarea. Kein separater CSS-Block nötig. Farbkodierung für Status-Badges (`badge bg-...`) im Konto-Tab: `bg-primary` (offen), `bg-warning text-dark` (in Vollstreckung), `bg-success` (erledigt), `bg-secondary` (abgeschrieben). Pro-Nutzer sehen an dieser Stelle einen Hinweis „Verfügbar ab Business" mit Upgrade-Link.

### Phase 5.5.5 – Rechtsdoks + Preise + Changelog

**Datenschutzerklärung (`frontend/datenschutz.html`):**

Im Abschnitt „Cloud-Synchronisierung (Pro/Business)" die Auflistung gespeicherter Daten um die neuen Felder ergänzen:
> Neu: `fall_status` (Fallstatus: offen/in Vollstreckung/erledigt/abgeschrieben) und `notes` (optionale Freitext-Notiz zu einem Fall)

Hinweis zu `notes`: Das Feld kann personenbezogene Daten über den Schuldner enthalten (z. B. Namen, Sachverhaltsbeschreibungen). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) – Nutzer speichern diese Daten zur Durchführung ihrer eigenen Forderungsverwaltung.

**AVV (`frontend/avv.html`) – Anhang: Verarbeitungsgegenstand:**

Tabelle der verarbeiteten Datenkategorien um zwei Zeilen ergänzen:
| Datenkategorie | Beschreibung |
|---|---|
| Fallstatus | Bearbeitungsstatus eines Falls (Textkonstante, kein Personenbezug) |
| Fallnotizen | Freitextnotizen des Nutzers zu einem Fall (kann personenbezogene Daten Dritter enthalten) |

**Preisseite:** Wie in Q.2 beschrieben – Fall-Status, Notizen, Suche/Filter als Business-exklusive Features ergänzen.

**Changelog:** Gebündelt mit 5.7 und 3.8.

### Geänderte Dateien
| Datei | Änderung |
|---|---|
| `supabase/schema.sql` | ALTER TABLE cases + neue Spalten |
| `frontend/js/storage.js` | Sync für fall_status, notes, pinned |
| `frontend/js/app.js` | Status-Dropdown + Notizfeld |
| `frontend/forderungsaufstellung.html` | Status/Notiz-UI im Fall-Header |
| `frontend/konto.html` | Fälle-Tab: Suche, Filter, Sort, Badges |
| `frontend/js/konto.js` | Neue Fälle-Tab-Logik |
| `frontend/datenschutz.html` | Cloud-Daten: fall_status + notes ergänzen |
| `frontend/avv.html` | Anhang: neue Datenkategorien |
| `frontend/preise.html` | Pro/Business: Fall-Status & Notizen |
| `frontend/changelog.html` | Neuer Eintrag (gebündelt) |
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
