# fordify Redesign – Design Spec

**Datum:** 2026-04-21  
**Status:** Approved – ready for implementation  
**Design-Richtung:** B — Modern SaaS (evolved Indigo Gradient)

---

## Design Tokens

| Token | Wert |
|---|---|
| Primary Navy | `#0f1d5c` |
| Primary Blue | `#1e3a8a` |
| Accent Blue | `#2563eb` |
| Dark BG | `#0f172a` |
| Light BG | `#f8fafc` |
| Border | `#e2e8f0` |
| Text | `#0f172a` |
| Text Muted | `#64748b` |
| Trust Green | `#34d399` |
| Font | Inter, system-ui |
| Mono Font | JetBrains Mono, monospace |

---

## 1. Header / Navigation

**Gewählt:** Variante A (Sleek & Symmetric) + dunkleres Navy von Variante B

- Hintergrund: `#0f1d5c` (dunkleres Navy, nicht `#1e3a8a`)
- Navigation zentriert zwischen Logo und CTA-Buttons
- Aktiver Link: blaue Unterstreichung (`#60a5fa`, 2px)
- Dual CTA: Ghost-Login (Border) + Solid-Weiß "Kostenlos starten →"
- Trust-Bar direkt unter Nav: dunkel (`#0f172a`), 4 Trust-Items mit grünen Dots
  - RVG 2025 (BGBl. I Nr. 109)
  - Basiszinssatz aktuell bis 07/2026
  - Von Anwälten entwickelt
  - Kein Login · 100 % kostenlos

---

## 2. Homepage Hero

**Gewählt:** Variante A — zentriert (nicht linksbündig)

- Gradient: `linear-gradient(135deg, #0f1d5c 0%, #1e3a8a 60%, #1c439a 100%)`
- Inhalt zentriert (`text-align: center`)
- Großes Gradient-Headline (900 weight, letter-spacing -0.04em)
- Subtext in gedämpftem Weiß
- Dual CTA: Primary weiß + Ghost transparent
- Glas-Mockup-Card darunter: `backdrop-filter: blur`, dezente Border, zeigt Forderungsaufstellungs-Output

---

## 3. Tool Cards (Homepage)

**Gewählt:** Variante B — Spotlight Primary

- Forderungsaufstellung als breite Feature-Card (volle Breite, Navy-Gradient)
  - Tag "★ Kernfeature"
  - Titel + Beschreibung links, Doc-Mockup rechts
  - Weißer CTA-Button
- Drei sekundäre Cards darunter in gleichem Grid (3-spaltig)
  - Violette Icon-Hintergründe (`#ede9fe`)
  - Hover: leichte Shadow-Elevation

---

## 4. Warum fordify

**Gewählt:** Variante C — Dunkel nummeriert

- Hintergrund: `#0f172a` (tiefstes Dunkel)
- Overline in Trust-Green
- Headline: weiß, 900 weight
- 3 Feature-Felder nebeneinander mit 1px-Trennern
- Nummerierung: 01 / 02 / 03 (Navy-Blau, groß, opacity 0.6)
- Items: Browserbasiert · Immer aktuell · DSGVO-konform

---

## 5. SEO-Text

**Gewählt:** Variante B — Zweispaltig

- Hintergrund: weiß
- 2-Spalten-Grid, max-width 780px, zentriert
- Linke Spalte: § 367 BGB + RVG 2025
- Rechte Spalte: § 288 BGB + GKG
- H2 mit blauer Bottom-Border (`#e0e7ff`)
- Text in `#64748b`, 0.78rem

---

## 6. Footer

**Gewählt:** Variante A — CTA-Band + dunkel + 4 Spalten

### Pre-Footer CTA-Band
- Gradient `#0f1d5c → #1e3a8a → #1c439a`
- Pill-Tag "Kostenlos · Kein Login"
- H2 "Jetzt fordify nutzen"
- Weißer CTA-Button

### Footer Main
- Hintergrund: `#0f172a`
- 4 Spalten: Brand (2fr) + Tools (1fr) + Produkt (1fr) + Rechtliches (1fr)
- Brand-Spalte: Logo-Text + Beschreibung + 4 Badges (RVG 2025, § 367 BGB, DSGVO, Basiszins 07/2026)
- Link-Farbe: `rgba(255,255,255,0.45)`, hover: weiß
- Highlight-Links (Forderungsaufstellung, Preise): `#60a5fa`
- Bottom-Strip: © + "Von Anwälten entwickelt · DSGVO-konform"

---

## 7. Hero der Unterseiten

**Gewählt:** Variante A — Gradient-Band + Breadcrumb + Stats rechts

- Gleicher Gradient wie Homepage-Hero
- Breadcrumb oben (fordify › Seitenname)
- Tag mit grünem Dot + Paragraph-Referenz (§ 288 BGB etc.)
- H1 links, Stats rechts (aktuelle Zinssätze / RVG-Tabelle etc.)
- Gilt für: Verzugszinsrechner, RVG-Rechner, Gerichtskostenrechner, Preisseite

---

## 8. Rechner-Layout

**Gewählt:** Variante A — Zwei weiße Cards

- Hintergrund: `#f8fafc`
- Grid: 5fr (Form) + 7fr (Ergebnis)
- **Form-Card:**
  - Fact-Bar oben mit Chips (Basiszins, B2B, B2C)
  - Labels + Inputs auf weißem Grund
  - CTA-Button: Gradient `#1e3a8a → #2563eb`
- **Ergebnis-Card:**
  - Header: `#0f1d5c` Navy, weiß "Ergebnis · [Rechner-Name]" + Gesamtbetrag-Badge
  - Zeilen alternierend weiß / `#f8fafc`
  - Footer-Zeile: "Zinsen gesamt" + Betrag in Navy fett
- **CTA-Box** darunter: Blau-Gradient-Background, "Vollständige Forderungsaufstellung erstellen"
- **FAQ:** vertikale Cards, aufklappbar (`<details>`)

---

## Implementierungs-Scope

| Datei | Änderungen |
|---|---|
| `frontend/css/app.css` | Neue Klassen für alle Sektionen |
| `frontend/index.html` | Hero, Tool-Cards, Warum, SEO-Text, Footer |
| `frontend/zinsrechner.html` | Hero-Band, Rechner-Layout |
| `frontend/rvg-rechner.html` | Hero-Band, Rechner-Layout |
| `frontend/gerichtskostenrechner.html` | Hero-Band, Rechner-Layout |
| `frontend/preise.html` | Hero-Band |
| `frontend/sw.js` | Version bumpen |
