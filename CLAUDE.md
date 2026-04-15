# CLAUDE.md – fordify-app (Fordify)

> Diese Datei wird bei jedem Gesprächsstart automatisch geladen.
> Sie ist die einzige Quelle der Wahrheit für Kontext, Verhalten und Architektur.

---

## Projekt

**Name:** Fordify
**URL:** https://fordify.de
**Repo:** https://github.com/jenswittern-dev/fordify-app
**Typ:** Pure Static SPA (HTML/CSS/Vanilla JS) – kein Backend, kein Build-Schritt
**Zweck:** Professionelle Forderungsaufstellungen nach § 367 BGB für Anwaltskanzleien

---

## Verhalten (Pflicht)

- **Nach jeder Änderung sofort committen und pushen** – ohne zu fragen
- Commit-Message auf Deutsch, präzise (feat/fix/style/docs/refactor)
- SW-Version (`fordify-vN` in `frontend/sw.js`) bei jedem Commit mit geänderten Frontend-Dateien um 1 erhöhen
- Keine Rückfragen zu offensichtlichen Standardoperationen
- **Dokumentation immer aktuell halten** – nach jeder Entscheidung und nach jeder Umsetzung:
  - `docs/ROADMAP.md` — Status auf ✅ setzen + Datum eintragen
  - `docs/SYSTEM.md` — neue/geänderte Datenstrukturen, Funktionen, Architekturentscheidungen eintragen
  - `CLAUDE.md` — SW-Version, Kerndatenmodell, Architekturentscheidungen aktuell halten
  - Diese Aktualisierungen im gleichen Commit wie die Implementierung mitliefern

---

## Tech Stack

| Komponente | Detail |
|---|---|
| UI | Bootstrap 5.3.3 |
| Arithmetik | decimal.js (exakte Dezimalrechnung) |
| Schriften | Inter (UI), JetBrains Mono (Beträge) – selbst gehostet |
| Datenpersistenz | `localStorage` (kein Server, kein Cloud) |
| PWA | Service Worker (`frontend/sw.js`) + Manifest (`frontend/manifest.json`) |
| Hosting | Static (GitHub Pages / Hetzner o.ä.) |
| Deployment | Push auf `main` → automatisch live |

---

## Dateistruktur

```
fordify-app/
├── CLAUDE.md               ← diese Datei
├── LIESMICH.txt            ← Nutzerdoku (offline)
├── docs/
│   ├── ROADMAP.md          ← Feature-Roadmap mit Status + Datum
│   ├── SYSTEM.md           ← Technisches Whitepaper
│   ├── konkurrenzanalyse.md
│   ├── webapp-transformation.md
│   ├── feedback/           ← abgearbeitetes Nutzerfeedback (Runde 1)
│   └── feedback-2/         ← abgearbeitetes Nutzerfeedback (Runde 2)
├── frontend/
│   ├── index.html          ← einzige HTML-Seite (SPA)
│   ├── impressum.html      ← statische Impressumsseite
│   ├── datenschutz.html    ← statische Datenschutzerklärung
│   ├── sw.js               ← Service Worker (aktuell fordify-v22)
│   ├── manifest.json       ← PWA-Manifest
│   ├── css/app.css         ← gesamtes Styling inkl. Print-CSS (@media print)
  ├── css/themes.css      ← Theme-Overrides (brand/dark/clean via [data-theme])
│   ├── js/
│   │   ├── app.js          ← Haupt-App (~2100 Zeilen)
│   │   ├── data.js         ← Datentabellen (BASISZINSSAETZE, RVG_TABELLE, GKG_TABELLE)
│   │   ├── zinsen.js       ← Verzugszinsberechnung
│   │   ├── rvg.js          ← RVG-Berechnung
│   │   ├── verrechnung.js  ← § 367 BGB Verrechnungslogik
│   │   └── zusammenfassung.js ← (deprecated, nicht mehr direkt genutzt)
│   ├── data/
│   │   ├── basiszinssaetze.json ← aktualisierbar (bis 01.07.2026)
│   │   └── rvg_tabelle.json     ← BGBl. 2025 I Nr. 109
│   └── fonts/              ← selbst gehostete Schriftarten
├── tests/                  ← Python-Tests für Berechnungslogik
└── static/                 ← (legacy)
```

---

## Kerndatenmodell

Siehe `docs/SYSTEM.md` für vollständiges Schema. Kurzübersicht:

- `localStorage["fordify_cases"]` — Registry aller Fälle
- `localStorage["fordify_settings"]` — Kanzlei-Einstellungen + Impressum
- `localStorage["fordify_last_export"]` — Timestamp letzter Export
- `localStorage["fordify_theme"]` — aktives Theme (`"brand"` / `"dark"` / `"clean"`)
- `state.fall.positionen[]` — Array von Positions-Objekten (typ, id, datum, betrag, ...)
- `gruppeId` — verknüpft Hauptforderung mit zugehöriger Zinsperiode

---

## Wichtige Architekturentscheidungen

- **Kein Build-Schritt** — direkt aus Quellcode auslieferbar
- **Keine externen API-Calls** — alle Daten lokal
- **Print via Popup-Window** (`drucken()`) — kein html2canvas/jsPDF (wäre Bitmap-PDF, nicht durchsuchbar)
- **GKG_TABELLE in data.js** (nicht als JSON) — kein zusätzlicher Netzwerkaufruf nötig
- **`baueSummaryTabelle()`** ist die aktive Zusammenfassungs-Funktion (in app.js, NICHT `erstelleZusammenfassung()` in zusammenfassung.js — deprecated)
- **`migratePositionen()`** — lazy Migration: alte Positionen ohne `gruppeId` erhalten "g0"
- **Theme-System** — `[data-theme]` auf `<html>`, CSS Custom Properties in `themes.css`, drei Themes: `brand` (default, kein Attribut), `dark`, `clean`

---

## Dokumentation lesen + pflegen

**Vor neuen Features immer prüfen:**
1. `docs/ROADMAP.md` — ist das Feature schon geplant/erledigt?
2. `docs/SYSTEM.md` — welche Datenstrukturen und Funktionen sind betroffen?
3. Aktuelle SW-Cache-Version in `frontend/sw.js` prüfen und nach Änderungen erhöhen

**Nach jeder Entscheidung und Umsetzung zwingend aktualisieren:**
- `docs/ROADMAP.md` — Status ✅ + Datum setzen
- `docs/SYSTEM.md` — neue Strukturen, Funktionen, Architekturdetails ergänzen
- `CLAUDE.md` (diese Datei) — SW-Version, Kerndatenmodell, Architekturentscheidungen nachziehen
- Immer im gleichen Commit wie die eigentliche Änderung
