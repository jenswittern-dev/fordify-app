# CLAUDE.md – fordify-app (Fordify)

> Bei jedem Gesprächsstart automatisch geladen.
> Schlanker Hub für Verhalten, Architektur-Invarianten, Code-Graph-Zugang und Pointer zur Detail-Doku.
> Detail-Inhalte (Tech-Stack, Datenmodell, E-Mail-Setup, Credentials) leben in `docs/SYSTEM.md`.

---

## Projekt

**Name:** Fordify | **URL:** https://fordify.de | **Repo:** https://github.com/jenswittern-dev/fordify-app
**Typ:** Pure Static SPA (HTML/CSS/Vanilla JS) – kein Backend, kein Build-Schritt
**Zweck:** Professionelle Forderungsaufstellungen nach § 367 BGB für Anwaltskanzleien

---

## Verhalten (Pflicht)

- **Nach jeder Änderung sofort committen und pushen** – ohne zu fragen
- Commit-Message auf Deutsch, präzise (feat/fix/style/docs/refactor)
- **SW-Version** (`fordify-vN` in `frontend/sw.js`) bei jedem Commit mit geänderten Frontend-Dateien um 1 erhöhen
- Keine Rückfragen zu offensichtlichen Standardoperationen
- **Doku-Pflege im gleichen Commit:**
  - `docs/ROADMAP.md` — Feature-Status ✅ + Datum setzen
  - `docs/SYSTEM.md` — neue Datenstrukturen, Funktionen, Architekturentscheidungen ergänzen
  - `CLAUDE.md` — nur wenn sich Verhalten/Invarianten/Governance ändern

---

## Wo finde ich was?

| Suche | Quelle |
|---|---|
| Code-Architektur, Datenmodell, Tech-Stack, DB-Schema, E-Mail-Setup, Credentials | `docs/SYSTEM.md` |
| Feature-Roadmap mit Status + Datum | `docs/ROADMAP.md` |
| Manuelle Schritte für Jens (Accounts, Rechtliches, Public Launch) | `docs/freemium-launch-organisationsplan.md` |
| Aktive Pläne (max. 5 erlaubt) | `docs/superpowers/plans/` |
| Specs in Brainstorming-Phase | `docs/superpowers/specs/` |
| Interaktiver Code-Knowledge-Graph | `graphify-out/graph.html` |
| **Agent/Skill-Auswahl pro Aufgabe (vollständig)** | `AGENTS.md` → §Agents & Skills |

---

## Code-Graph (Graphify)

Persistenter Knowledge-Graph des Projekts in `graphify-out/`:
- `graph.html` — interaktive Browser-Visualisierung (51 Communities, 1000+ Nodes)
- `GRAPH_REPORT.md` — God-Nodes, Communities, Surprising Connections
- `graph.json` — strukturierte Nodes + Edges für Queries

### Wann nutzen?

- **Bei Architektur-Fragen** („wie hängt X mit Y zusammen?")
- **Bei großen Cross-Cutting-Reviews** (statt File-by-File)
- **Bei Onboarding neuer Sessions** — Big Picture schneller als Dateibaum-Exploration
- **Bei Orphan-Detection** (ungenutzte Module, Dead Code)
- **Bei Tech-Debt-Cluster-Analyse** (Code-Duplikation, schwache Cohesion)

### Wie nutzen?

```
/graphify query "wie hängt der Modal-Dispatcher mit der RVG-Berechnung zusammen?"
/graphify explain "baueSummaryTabelle"
/graphify path "auth.js" "konto.js"
```

Diese Commands greifen auf den existierenden Graph zu — reine BFS/DFS-Traversierung, **keine LLM-Tokens**.

### Aktualisierungs-Routine

Der Graph muss aktuell gehalten werden, sonst nimmt sein Wert ab.
**Aktualisieren via `/graphify . --update`** (incremental, nur geänderte Files):

- **Pflicht:** Nach jedem abgeschlossenen Feature-Sprint (vor dem nächsten Plan/Discovery)
- **Pflicht:** Vor jedem Graph-basierten Final-Code-Review
- **Empfohlen:** Mindestens monatlich bei aktiver Entwicklung
- **Full re-run (`/graphify .`):** Nach größeren Architektur-Umbauten (z.B. neue Top-Level-Verzeichnisse, große Refactorings)

Nach jedem Update: `graph.json` + `GRAPH_REPORT.md` committen, damit nachfolgende Sessions den aktuellen Stand sehen. Der `graphify-out/cache/`-Ordner ist gitignored — nur die nutzbaren Artefakte werden versioniert.

---

## Wichtige Architekturentscheidungen

- **Kein Build-Schritt** — direkt aus Quellcode auslieferbar
- **Externe API-Calls** — Supabase (Auth + DB), Paddle (Checkout), GoatCounter (Analytics) — alle DSGVO-konform
- **Print via Popup-Window** (`drucken()` in `print.js`) — kein html2canvas/jsPDF (wäre Bitmap-PDF, nicht durchsuchbar)
- **GKG_TABELLE in data.js** (nicht als JSON) — kein zusätzlicher Netzwerkaufruf nötig
- **`baueSummaryTabelle()`** ist die aktive Zusammenfassungs-Funktion (in `summary.js`)
- **`migratePositionen()`** — lazy Migration: alte Positionen ohne `gruppeId` erhalten "g0"
- **Theme-System** — `[data-theme]` auf `<html>`, CSS Custom Properties in `themes.css`, drei Themes: `brand` (default, kein Attribut), `dark`, `clean`
- **Free-Nutzer = sessionStorage** — Daten weg beim Tab-Schließen ist Absicht (kein Bug)
- **StorageBackend** (`storage.js`) — Abstraktion über sessionStorage/localStorage/Supabase-Sync
- **app.js-Modularisierung 2026-05-17** — Cluster theme/gkg/fordify-confirm/print/einstellungen/modal-templates/summary in eigene Files extrahiert; app.js enthält nur noch State, Fallverwaltung, Positionen-Rendering, Modal-Dispatcher, Init

---

## Datei-Verwaltung (PFLICHT – keine Ausnahmen)

### Erlaubte Dateien in `docs/`

```
docs/
├── ROADMAP.md                        ← einzige Feature-Wahrheitsquelle
├── SYSTEM.md                         ← einzige technische Wahrheitsquelle
├── freemium-launch-organisationsplan.md ← aktiver Launch-Plan (Jens)
├── archive/                          ← historische Dokumente (nicht löschen)
└── superpowers/
    ├── plans/                        ← max. 5 aktive Pläne gleichzeitig
    │   └── done/                     ← abgeschlossene Pläne
    └── specs/
        └── done/                     ← abgeschlossene Specs
```

### Verboten

- **Keine neuen `.md`-Dateien** außerhalb dieser Struktur ohne explizite Anweisung von Jens
- **Keine Research-Dokumente** in `docs/` root (→ `docs/archive/research/`)
- **Keine Transkripte, Aufträge, Rohdaten** in `docs/` root (→ `docs/archive/`)
- **Keine doppelten Formate** (kein .pdf + .md + .html vom gleichen Inhalt)
- **Keine Spec-Dateien** für bereits implementierte Features (→ `docs/superpowers/specs/done/`)

### Nach Implementierung eines Plans (Pflicht)

1. Statusübersicht im Plan auf ✅ aktualisieren
2. `docs/ROADMAP.md` mit ✅ + Datum aktualisieren
3. Plan nach `docs/superpowers/plans/done/` verschieben
4. Wenn Architektur betroffen: `docs/SYSTEM.md` ergänzen

---

## Dokumentation lesen + pflegen

**Vor neuen Features prüfen:** ROADMAP (geplant/erledigt?), SYSTEM.md (betroffene Strukturen?), aktive Pläne, SW-Cache-Version.
**Nach Umsetzung aktualisieren:** ROADMAP-Status, SYSTEM.md-Details, Plan nach done/ — alles im gleichen Commit wie die Implementierung.

---

## Agents & Skills — Quick Picks

Fordify hat `superpowers` und `everything-claude-code` Plugins. **Vollständige Auswahltabelle inkl. Anti-Patterns: `AGENTS.md` → §Agents & Skills.**

Top-Picks für häufige Aufgaben:

| Aufgabe | Tool | Typ |
|---|---|---|
| **Vor** kreativer Arbeit / Features brainstormen | `superpowers:brainstorming` | Skill |
| Multi-Step-Plan schreiben | `superpowers:writing-plans` | Skill |
| Plan ausführen (mehrere parallele Tasks) | `superpowers:subagent-driven-development` | Skill |
| Code-Review nach Änderung | `everything-claude-code:code-reviewer` | Agent |
| Security-Audit (Auth, Forms, Input) | `everything-claude-code:security-reviewer` | Agent |
| Supabase-Schema-/Query-Review | `everything-claude-code:database-reviewer` + `supabase:supabase-postgres-best-practices` | Agent + Skill |
| Accessibility-Check nach UI-Änderung | `accessibility-auditor` | Agent |
| SEO-Check vor Public-Launch (Pfad A) | `seo-auditor` | Agent |
| Dead-Code / Duplikate finden | `everything-claude-code:refactor-cleaner` | Agent |
| DSGVO-/Rechts-Beratung | `legal-advisor` | Agent |
| Fakten/§/Beträge prüfen (vor Veröffentlichung) | `fact-checker` | Agent |
| Multi-Step-Recherche / offene Frage | `general-purpose` | Agent |
| Vor "fertig"-Erklärung | `superpowers:verification-before-completion` | Skill |

**Anti-Patterns** (NICHT nutzen): `frontend-design:frontend-design` (React-Konvention), `python-/go-/kotlin-/django-/springboot-Tools` (Stack-Mismatch), `pr-manager` (politische PMs).
