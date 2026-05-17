# Design-Spec: Kundenbereich (konto.html)

**Datum:** 2026-04-22  
**Status:** Genehmigt  
**Betrifft:** `frontend/forderungsaufstellung.html`, `frontend/konto.html` (neu)

---

## Ziel

Eingeloggte Nutzer (= immer Pro oder Business) erhalten einen dedizierten Kundenbereich auf einer eigenen Seite (`konto.html`), der Fälle, Firmendaten und Abo-Informationen bündelt. Die App-Navbar wird plan-abhängig vereinfacht.

---

## Auth-Modell (wichtig)

- **Nicht eingeloggt = Gast = Free** — sessionStorage, Daten weg beim Tab-Schließen
- **Eingeloggt = immer Pro oder Business** — localStorage + Supabase-Sync

Es gibt keine „Free eingeloggt"-Kombination.

---

## 1. Neue Seite: `konto.html`

### Zugriffsschutz

- Nur für eingeloggte Nutzer — nicht eingeloggte Nutzer werden zu `/forderungsaufstellung` weitergeleitet
- Redirect-Check erfolgt clientseitig nach Auth-Init (analog zu gates.js)

### Layout

Orientiert sich am bestehenden Unterseiten-Design (Zinsrechner, RVG-Rechner):

- **Navbar:** Standard-Website-Navbar (gleiche wie alle Unterseiten) mit Avatar-Dropdown
- **Hero-Band:** Volle Seitenbreite, blauer Gradient (`rechner-hero-band`-Stil), aber kompakter (kein Stats-Block)
  - Inhalt: Avatar-Initialen-Kreis, „Mein Konto" als H1, E-Mail + Plan-Badge darunter
  - Breadcrumb: fordify › Mein Konto
- **Tab-Leiste:** Volle Seitenbreite (weißer Hintergrund, Border-Bottom), Inhalt im Bootstrap-Container
- **Tab-Content:** Bootstrap-Container (`max-width` wie andere Seiten), `background: #f8fafc`

### Tabs

#### Tab 1: Fälle

- Toolbar oben rechts: „Import JSON", „Export alle", „+ Neuer Fall" (primär)
- Hinweis-Text oben links: „N gespeicherte Fälle"
- Tabelle mit Spalten:
  - Fallname (fett) + Kurzinfo darunter (Anzahl Positionen · Gesamtbetrag)
  - Geändert (Datum)
  - Aktionen: **Laden** (→ navigiert zu `/forderungsaufstellung`, Fall wird geladen), **Export** (JSON), **Löschen** (mit Bestätigung)
- Leerzustand: freundlicher Hinweis + „Ersten Fall anlegen"-Button

#### Tab 2: Firmendaten

- Inhalt: identisch mit dem bisherigen Einstellungen-Modal
  - Logo hochladen
  - Kanzleidaten (Name, Adresse, Telefon etc.)
  - Theme-Auswahl (Brand / Dark / Clean)
  - Einstellungen exportieren / importieren
- Daten werden direkt gespeichert (kein Modal-Overlay mehr nötig)

#### Tab 3: Abo

- Aktueller Plan (PRO / BUSINESS Badge)
- Laufzeit: „Aktiv bis TT.MM.JJJJ"
- Button: „Abo verwalten →" (öffnet Paddle Customer Portal in neuem Tab)
- Link: „Pläne & Preise ansehen"

---

## 2. Änderungen in `forderungsaufstellung.html`

### Nav-Zustand: Nicht eingeloggt (Gast / Free)

Buttons: `← Website` · `Firmendaten` · `Neu` · `Drucken / PDF` · `Anmelden`

- **„Fälle"-Button entfällt** (Gast hat sessionStorage, kein persistentes Fallmanagement)
- **„Einstellungen" → „Firmendaten"** (gleiche Funktion `zeigeEinstellungenModal()`, nur Label geändert)

### Nav-Zustand: Eingeloggt (Pro / Business)

Buttons: `← Website` · `Neu` · `Drucken / PDF` · Avatar-Dropdown

- **Kein „Fälle"-Button** (→ konto.html)
- **Kein „Firmendaten"-Button** (→ konto.html)
- **Avatar-Dropdown** erhält neuen ersten Eintrag: **„Mein Konto →"** (Link zu `/konto`)

### Avatar-Dropdown (eingeloggt) — neue Reihenfolge

1. E-Mail + Plan-Badge (Header, nicht klickbar)
2. Trennlinie
3. **Mein Konto →** (neu, Link zu `/konto`)
4. Pläne & Preise
5. Abo verwalten ↗
6. Trennlinie
7. Abmelden

---

## 3. Einstellungen-Modal bleibt erhalten

Das Modal `#modal-einstellungen` bleibt im DOM von `forderungsaufstellung.html` — es wird nur bei Gast-Nutzern per „Firmendaten"-Button aufgerufen. Kein Code-Löschen.

---

## 4. Nicht in Scope

- Keine eigene Seite für Gäste (kein `/konto` für nicht eingeloggte)
- Kein Inline-Editing von Fällen auf konto.html (nur Laden, Export, Löschen)
- Keine Nutzungsstatistiken / Rechnungshistorie in diesem Release
- Keine Änderung an gates.js oder der Upgrade-Modal-Logik

---

## 5. Technische Umsetzung

- `konto.html` verwendet dieselben JS-Dateien wie die Unterseiten: `config.js`, `auth.js`, `auth-ui.js`, `storage.js`, `gates.js`
- Tab-Switching: reines JavaScript (Bootstrap Tab-Komponente oder eigene Logik), kein Seitenneuladen
- Firmendaten-Tab: vorhandene Funktionen aus `app.js` extrahieren oder per `konto.js` neu verdrahten
- Fälle laden: setzt `activeCase` in localStorage + navigiert zu `/forderungsaufstellung`
- URL-Parameter `?tab=faelle|firmendaten|abo` für Deep-Links (z.B. vom Avatar-Dropdown direkt in einen Tab)
- `konto.html` zur SW-Cache-Liste in `sw.js` hinzufügen
