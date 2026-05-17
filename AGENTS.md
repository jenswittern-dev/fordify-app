# AGENTS.md – fordify-app (Fordify)

> Schwesterdatei zu `CLAUDE.md` für OpenAI/Codex-Style-Agents.
> Inhalt identisch — bei Updates beide synchron halten.

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
- **Tool-Auswahl-Pflicht:** Vor jeder nicht-trivialen Aufgabe (Reviews, Audits, neue Features, Refactors, Domain-Spezial-Themen wie Auth/DSGVO/Supabase/SEO/Accessibility/Security) die Sektion **§Agents & Skills** (unten in dieser Datei) konsultieren und prüfen, ob ein spezialisierter Agent oder Skill für die Aufgabe existiert. Wenn ja: diesen statt `general-purpose` nutzen.
- **Doku-Pflege im gleichen Commit:**
  - `docs/ROADMAP.md` — Feature-Status ✅ + Datum setzen
  - `docs/SYSTEM.md` — neue Datenstrukturen, Funktionen, Architekturentscheidungen ergänzen
  - `CLAUDE.md` / `AGENTS.md` — nur wenn sich Verhalten/Invarianten/Governance ändern

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

---

## Code-Graph (Graphify)

Persistenter Knowledge-Graph des Projekts in `graphify-out/`:
- `graph.html` — interaktive Browser-Visualisierung
- `GRAPH_REPORT.md` — God-Nodes, Communities, Surprising Connections
- `graph.json` — strukturierte Nodes + Edges für Queries

**Wann nutzen?** Architektur-Fragen, Cross-Cutting-Reviews, Onboarding, Orphan-Detection, Tech-Debt-Cluster-Analyse.

**Wie nutzen?**

```
/graphify query "wie hängt der Modal-Dispatcher mit der RVG-Berechnung zusammen?"
/graphify explain "baueSummaryTabelle"
/graphify path "auth.js" "konto.js"
```

**Aktualisieren via `/graphify . --update`** (incremental):
- **Pflicht:** Nach jedem abgeschlossenen Feature-Sprint
- **Pflicht:** Vor jedem Graph-basierten Final-Code-Review
- **Empfohlen:** Mindestens monatlich bei aktiver Entwicklung
- **Full re-run (`/graphify .`):** Nach größeren Architektur-Umbauten

Nach jedem Update: `graph.json` + `GRAPH_REPORT.md` committen. `graphify-out/cache/` ist gitignored.

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
- **app.js-Modularisierung 2026-05-17** — Cluster theme/gkg/fordify-confirm/print/einstellungen/modal-templates/summary in eigene Files extrahiert

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

## Agents & Skills — Wann welches Tool?

Fordify hat zwei AI-Tool-Plugins installiert: **`superpowers`** und **`everything-claude-code`**. Plus weitere (`accessibility-auditor`, `seo-auditor`, `legal-advisor`, `code-review`, `claude-md-management`, `supabase`, …). Beide Plugins überlappen funktional — diese Sektion ist die kuratierte Wahl-Tabelle für Fordify.

### Grundregel: Skill vs. Agent

- **Skills** werden in die laufende Konversation geladen — Methodik die direkt im Hauptkontext angewendet wird. Gut für iterative/interaktive Prozesse (Brainstorming, Planung, Verifikation).
- **Agents** sind separate Sub-Konversationen mit eigenem Context — gut für tiefe isolierte Untersuchungen, parallele Arbeit, Kontextschutz (große Datei-Reads landen nicht im Hauptkontext).

### Häufige Aufgaben

| Aufgabe | Tool | Typ | Begründung |
|---|---|---|---|
| Feature/Idee brainstormen (**vor** Planung) | `superpowers:brainstorming` | Skill | Pflicht-Trigger vor kreativer Arbeit — klärt Intent + Requirements iterativ |
| Multi-Step-Plan schreiben | `superpowers:writing-plans` | Skill | Spec-driven, passt zur Konvention `docs/superpowers/plans/` |
| Plan ausführen (mehrere unabh. Tasks) | `superpowers:subagent-driven-development` | Skill | Dispatcht parallele Agents pro Task (haben wir in Pfad B/Holistic-Review effektiv genutzt) |
| Vor Branch-Abschluss: Verifikation | `superpowers:verification-before-completion` | Skill | Checkliste vor "fertig" — verhindert False-Positives |
| Branch-Integration entscheiden (merge/PR/cleanup) | `superpowers:finishing-a-development-branch` | Skill | Strukturierte Optionen |
| Systematisches Debugging | `superpowers:systematic-debugging` | Skill | Hypothesen-getrieben statt Trial-and-Error |
| Code-Review nach Änderung (interner Check) | `everything-claude-code:code-reviewer` | Agent | Quality + Security + Maintainability — laut Tool-Definition MUST-USE |
| PR-Review (komplette Branch-Diff) | `code-review:code-review` | Skill | Strukturierter PR-Review nach Best Practices |
| Code vereinfachen / Konsistenz-Pass | `simplify` oder `code-simplifier` | Skill / Agent | Clarity-Review über kürzlich geänderten Code |
| Dead Code / Duplikate finden | `everything-claude-code:refactor-cleaner` | Agent | Automatische Analyse (Pfad B `zusammenfassung.js`-Finding wäre damit schneller gewesen) |
| Doku / Codemaps aktualisieren | `everything-claude-code:doc-updater` | Agent | Generiert/aktualisiert SYSTEM.md-Style nach Refactors |
| CLAUDE.md mit Session-Learnings update | `claude-md-management:revise-claude-md` | Skill | Strukturierter Improvements-Prozess |
| Multi-Step-Recherche / offene Frage | `general-purpose` | Agent | Catch-all (4× in Pfad B des Holistic-Reviews genutzt) |
| Schnelle Datei-/Symbol-Suche | `Explore` | Agent | Read-only, schnell — statt manueller Grep-Schleifen |
| Holistischer Knowledge-Graph für Codebase | `graphify` (Skill) | Skill | Wir nutzen das für Architektur-Visualisierung, siehe Sektion oben |

### Fordify-Spezialisten (Sprint-spezifisch)

| Aufgabe | Tool | Wann |
|---|---|---|
| Architektur-Entscheidung / Refactor-Bewertung | `everything-claude-code:architect` (Agent) | Bei neuen Features, größeren Refactors, Stack-Fragen |
| Supabase-Schema / RLS / Query-Review | `everything-claude-code:database-reviewer` (Agent) + `supabase:supabase-postgres-best-practices` (Skill) | **Pflicht bei jedem `supabase/schema.sql`-Edit oder Edge-Function-Change** |
| Security-Audit (XSS, Auth, API, Secrets) | `everything-claude-code:security-reviewer` (Agent) | **Pflicht bei jeder Auth-/Form-/User-Input-Änderung.** OWASP-fokussiert |
| Accessibility-Audit (WCAG 2.2 AA) | `accessibility-auditor` (Agent) | **Pflicht nach UI-Änderungen** — ARIA, Kontraste, Fokus, Tastatur, Touch-Targets |
| Design-Qualität (CI-Tokens, Typo, Grid) | `design-reviewer` (Agent) | Nach UI-Änderungen, vor Sprint-Abschluss |
| SEO-Check (Meta, JSON-LD, Sitemap) | `seo-auditor` (Agent) | **Pflicht vor Pfad A (Public Launch)** |
| Performance-Audit (Lighthouse, Core Web Vitals) | `performance-auditor` (Agent) | Vor Public Launch sinnvoll, danach periodisch |
| DSGVO- / Rechts-Beratung | `legal-advisor` (Agent) | Bei AGB/AVV/Datenschutz-Änderungen, Impressums-Pflege |
| SEO-Content schreiben (Landingpages, FAQs) | `content-strategist` (Agent) | Für ROADMAP Phase 7.3 (SEO-Landingpages) |
| Fakten prüfen (§, Beträge, Daten, Namen) | `fact-checker` (Agent) | **Pflicht vor Veröffentlichung von Inhalten** mit Rechtsangaben oder Berechnungs-Beispielen |
| E2E-Test schreiben/ausführen | `everything-claude-code:e2e-runner` (Agent) + `superpowers:test-driven-development` (Skill) | Wenn Test-Setup eingeführt wird — aktuell nicht vorhanden |

### Tool-Vergleiche bei Überlappung

#### Planung (4 konkurrierende Tools)

| Tool | Wann nehmen? |
|---|---|
| **`superpowers:writing-plans`** (Skill) | **Default für Fordify** — Multi-Step, Phasen, Checkpoints, integriert mit `docs/superpowers/plans/`-Konvention |
| `Plan` (built-in Agent) | Quick implementation-strategy ohne formellen Plan |
| `everything-claude-code:planner` (Agent) | Tiefere Architektur-Sicht bei komplexen Refactors mit isoliertem Sub-Context |
| `everything-claude-code:plan` (Skill) | Stil "wait for user CONFIRM" — wenn explizite Approval-Gates gewünscht |

#### Code-Review (4 konkurrierende Tools)

| Tool | Wann nehmen? |
|---|---|
| **`everything-claude-code:code-reviewer`** (Agent) | **Default** — nach jeder Code-Änderung als interner Quality-Check |
| `code-review:code-review` (Skill) | Pre-PR-Merge — strukturierter PR-Review |
| `superpowers:requesting-code-review` (Skill) | Wenn du um externes Review bittest |
| `superpowers:receiving-code-review` (Skill) | Wenn du Review-Feedback umsetzt |

#### TDD (3 konkurrierende Tools)

| Tool | Wann nehmen? |
|---|---|
| `superpowers:test-driven-development` (Skill) | Default sobald Test-Setup steht — in-context Iteration |
| `everything-claude-code:tdd-guide` (Agent) | Strikter Enforcement-Modus mit Coverage-Gates |
| `everything-claude-code:tdd` (Skill) | Vergleichbar mit superpowers-Variante — eine wählen |

→ **Default sobald Tests existieren: `superpowers:test-driven-development`** (Skill — bessere Iteration im Hauptkontext)

### Bewusste NICHT-Nutzung (Anti-Patterns für Fordify)

| Tool | Warum nicht |
|---|---|
| `everything-claude-code:python-reviewer`, `python-testing`, `python-patterns` | Fordify hat kein Python im aktiven Stack (nur graphify-Hilfsskripte, die als Black-Box gelten) |
| `everything-claude-code:go-*`, `kotlin-*`, `cpp-*`, `swift-*` | Fremde Stacks |
| `everything-claude-code:springboot-*`, `django-*`, `jpa-*`, `clickhouse-*` | Backend-Stacks die Fordify nicht nutzt |
| `frontend-design:frontend-design` | React/Next.js-Konventionen — Fordify ist Vanilla JS ohne Build, würde falsches Pattern erzwingen |
| `pr-manager` | Politische Pressemitteilungen — nicht Fordify-Kontext |
| `chief-of-staff` | Multi-Channel-Email-Triage — nicht akut für Fordify |
| `everything-claude-code:claude-api` | Fordify ruft Claude API nicht direkt auf |
| `Sales-CLI-/-Stats-/-Crosspost-Skills` | Marketing-Distribution — kommt frühestens nach Public Launch (Pfad A) als Folge-Option |

### Zukünftige Investitionen

Sobald die jeweilige Voraussetzung steht:

- **Test-Setup eingeführt** → `superpowers:test-driven-development`, `everything-claude-code:e2e-runner`, `everything-claude-code:tdd-guide`
- **Public Launch erfolgt (Pfad A)** → `content-strategist` für Phase 7.3 (SEO-Landingpages), `performance-auditor` periodisch, `everything-claude-code:crosspost` für Multi-Channel-Outreach
- **API-Integration mit Claude geplant** → `everything-claude-code:claude-api`

### Kombinationen (mehrere Tools gemeinsam)

Manche Aufgaben profitieren von Skill + Agent zusammen:

- **Neues Feature:** `superpowers:brainstorming` (Skill) → `superpowers:writing-plans` (Skill) → `superpowers:subagent-driven-development` (Skill, dispatcht Agents) → `everything-claude-code:code-reviewer` (Agent) → `superpowers:verification-before-completion` (Skill) → `superpowers:finishing-a-development-branch` (Skill)
- **Großer Refactor:** `everything-claude-code:architect` (Agent für Architektur-Bewertung) → `everything-claude-code:refactor-cleaner` (Agent für Dead-Code-Suche) → manuelles Refactor → `everything-claude-code:code-reviewer` (Agent) → `everything-claude-code:doc-updater` (Agent für SYSTEM.md)
- **Pre-Public-Launch:** `seo-auditor` + `accessibility-auditor` + `performance-auditor` + `everything-claude-code:security-reviewer` parallel dispatcht → Sammel-Report → Fixes
