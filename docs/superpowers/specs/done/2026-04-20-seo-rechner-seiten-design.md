# SEO-Fundament & Einzelrechner-Seiten – Design

**Erstellt:** 2026-04-20  
**Status:** Approved

---

## Ziel

Fordify erhält eine textreiche Homepage als SEO-Hub sowie drei standalone Rechner-Seiten. Die App zieht von `/` auf `/forderungsaufstellung`. Zielgruppe: Anwaltskanzleien + Unternehmen (CFOs, Buchhalter).

---

## Seitenarchitektur

```
fordify.de/                        ← NEU: Homepage (SEO-Hub)
fordify.de/forderungsaufstellung   ← bisherige App (index.html → forderungsaufstellung.html)
fordify.de/zinsrechner             ← NEU: Verzugszinsrechner
fordify.de/rvg-rechner             ← NEU: Anwaltskostenrechner
fordify.de/gerichtskostenrechner   ← NEU: GKG-Rechner
fordify.de/impressum.html          ← unverändert
fordify.de/datenschutz.html        ← unverändert
```

**Technologie:** Separate statische HTML-Dateien, kein Build-Schritt. Bestehender Stack (Bootstrap 5.3.3, Vanilla JS, Inter-Schrift). Rechner-Seiten laden nur die jeweils benötigten JS-Module aus `js/`.

---

## Homepage (`fordify.de/`)

### Sektionen (von oben nach unten)

**Navbar**
- Logo (links) → verlinkt auf `/`
- Dropdown "Rechner": Zinsrechner | RVG-Rechner | Gerichtskostenrechner
- CTA-Button: "Forderungsaufstellung" → `/forderungsaufstellung`
- Badge "Beta" am CTA

**Hero**
- H1: "Forderungsaufstellungen & Rechner für Anwaltskanzleien"
- Subtext (2–3 Sätze): Fordify als browserbasiertes Tool für professionelle Forderungsaufstellungen nach § 367 BGB — kostenlos, DSGVO-konform, ohne Installation
- Primary CTA: "→ Zur Forderungsaufstellung" (`/forderungsaufstellung`)

**Tool-Grid (4 Karten)**
- Forderungsaufstellung (Haupttool, visuell hervorgehoben)
- Verzugszinsrechner → `/zinsrechner`
- RVG-Rechner → `/rvg-rechner`
- Gerichtskostenrechner → `/gerichtskostenrechner`

**Vorteile (3 Spalten)**
- Browserbasiert – keine Installation
- Immer aktuell – RVG 2025, Basiszinssätze bis 07/2026
- DSGVO-konform – Daten verlassen den Browser nicht

**SEO-Textblock (300–400 Wörter)**
- Erklärt § 367 BGB Verrechnungsreihenfolge
- Erklärt Verzugszinsen nach § 288 BGB
- Erklärt RVG-Grundgebühren
- Natürliche Keyword-Dichte, keine Keyword-Stuffing
- Sichtbar für Nutzer (nicht versteckt)

**Footer**
- Links: Impressum | Datenschutz
- Kurzlinks zu allen Rechnern

---

## Rechner-Seiten (gemeinsames Template)

### Struktur jeder Rechner-Seite

1. **Navbar** (identisch Homepage)
2. **H1** mit Primary Keyword
3. **Intro-Text** (100–150 Wörter, Keywords eingearbeitet, erklärt wofür der Rechner gut ist)
4. **Rechner** (funktional, sofortiges Ergebnis, bestehende JS-Logik)
5. **CTA-Box**: "Vollständige Forderungsaufstellung erstellen → `/forderungsaufstellung`"
6. **FAQ** (5–7 Fragen, keyword-reich, als `<details>`-Accordion)
7. **Footer** (Impressum | Datenschutz | Links zu anderen Rechnern)

### Zinsrechner (`/zinsrechner`)

**H1:** "Verzugszinsrechner – kostenlos & aktuell (§ 288 BGB)"  
**Primary Keyword:** Verzugszinsrechner  
**Secondary:** Mahnzinsen berechnen, Verzugszinsen § 288 BGB, Basiszinssatz aktuell  
**JS-Module:** `config.js`, `decimal.min.js`, `data.js`, `zinsen.js`  
**Eingaben:** Hauptforderungsbetrag, Fälligkeitsdatum, Zinsenddatum, Schuldner-Typ (B2B/B2C)  
**Ausgabe:** Verzugszinssatz, berechnete Zinsen, Übersichtstabelle mit Zinsperioden  
**FAQ-Themen:** Wie werden Verzugszinsen berechnet | Aktueller Basiszinssatz | Unterschied B2B/B2C | Ab wann laufen Verzugszinsen | Verjährung Zinsansprüche

### RVG-Rechner (`/rvg-rechner`)

**H1:** "RVG-Rechner – Anwaltskosten berechnen (Rechtsanwaltsvergütungsgesetz 2025)"  
**Primary Keyword:** RVG Rechner  
**Secondary:** Anwaltskostenrechner, Anwaltsgebühren berechnen, Rechtsanwaltsgebühren  
**JS-Module:** `config.js`, `decimal.min.js`, `data.js`, `rvg.js`  
**Eingaben:** Streitwert, Verfahrensart, USt-Satz (0%/7%/19%)  
**Ausgabe:** Gebührentabelle (Geschäftsgebühr, Verfahrensgebühr, Terminsgebühr, Einigungsgebühr), Gesamtbetrag  
**FAQ-Themen:** Was ist das RVG | Wie werden Anwaltsgebühren berechnet | Wer zahlt Anwaltskosten | Streitwert Erklärung | RVG 2025 Änderungen

### Gerichtskostenrechner (`/gerichtskostenrechner`)

**H1:** "Gerichtskostenrechner – Prozesskosten berechnen (GKG 2025)"  
**Primary Keyword:** Gerichtskostenrechner  
**Secondary:** Prozesskostenrechner, GKG Rechner, Gerichtskosten berechnen  
**JS-Module:** `config.js`, `decimal.min.js`, `data.js`  
**Eingaben:** Streitwert, Instanz (AG/LG/OLG/BGH), Verfahrensart  
**Ausgabe:** Gerichtsgebühr, Gesamtkosten inkl. Anwaltskosten beider Parteien  
**FAQ-Themen:** Wie berechnen sich Gerichtskosten | Was kostet ein Prozess | Wer zahlt bei Niederlage | Streitwert bestimmen | Kostenrisiko kalkulieren

---

## SEO-Keyword-Strategie

| Seite | Primary Keyword | Secondary Keywords |
|---|---|---|
| `/` | Forderungsaufstellung online | § 367 BGB Rechner, Anwaltssoftware Forderung |
| `/forderungsaufstellung` | Forderungsaufstellung erstellen | Forderungsaufstellung § 367 BGB, Forderungsmanagement |
| `/zinsrechner` | Verzugszinsrechner | Mahnzinsen berechnen, § 288 BGB Zinsen |
| `/rvg-rechner` | RVG Rechner | Anwaltskostenrechner, Anwaltsgebühren berechnen |
| `/gerichtskostenrechner` | Gerichtskostenrechner | Prozesskostenrechner, GKG Rechner |

---

## Interne Verlinkung

- **Homepage → alle 4 Tools** (Tool-Grid + Navbar-Dropdown)
- **Jeder Rechner → Homepage** (Navbar-Logo), **→ App** (CTA-Box), **→ andere 2 Rechner** (Footer)
- **App → Homepage** (Navbar-Logo)
- **Alle Seiten → Impressum + Datenschutz** (Footer)

---

## Technische Details

- **Keine shared Template-Engine** — Nav und Footer werden in jede HTML-Datei direkt eingefügt (copy-paste). Besser für SEO als JS-injizierte Navigation. Bei 5 Seiten vertretbar.
- **Canonical Tags** auf jeder Seite um Duplicate Content zu vermeiden
- **Structured Data (JSON-LD)** auf jeder Rechner-Seite: `SoftwareApplication`-Schema
- **sitemap.xml** um alle neuen URLs erweitern
- **`index.html` → `forderungsaufstellung.html`** + Redirect von `/` auf `/` (Homepage) und alter `/index.html` auf `/forderungsaufstellung`
- **SW-Cache** um neue Seiten und JS-Module erweitern
- **SW-Version:** `fordify-v47` nach Abschluss aller Änderungen

---

## Deployment

Alle Änderungen zunächst auf `staging`-Branch → `staging.fordify.de` testen → nach Freigabe auf `main` mergen.
