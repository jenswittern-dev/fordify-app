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
| Datenpersistenz | `sessionStorage` (Free/Gast) + `localStorage` + Supabase Cloud-Sync (Pro/Business) |
| Auth | Supabase Magic Link (`frontend/js/auth.js`, `auth-ui.js`) |
| Zahlungen | Paddle (Merchant of Record, `frontend/js/config.js` → `PRICE_MAP`) |
| E-Mail | Resend (via Supabase SMTP / N8N) |
| Analytics | GoatCounter (self-hosted, cookielos, DSGVO-konform) |
| PWA | Service Worker (`frontend/sw.js`) + Manifest (`frontend/manifest.json`) |
| Hosting | All-Inkl (fordify.de); Staging: staging.fordify.de |
| Deployment | Push auf `main` → GitHub Actions → fordify.de; `staging`-Branch → staging.fordify.de |

---

## Dateistruktur

```
fordify-app/
├── CLAUDE.md                   ← diese Datei
├── LIESMICH.txt                ← Nutzerdoku (offline)
├── .github/workflows/
│   ├── deploy.yml              ← main → fordify.de
│   └── deploy-staging.yml      ← staging → staging.fordify.de
├── frontend/
│   ├── index.html              ← Landing Page / Homepage
│   ├── forderungsaufstellung.html ← Haupt-App (SPA)
│   ├── konto.html                 ← Kundenbereich (eingeloggte Nutzer: Fälle, Firmendaten, Abo)
│   ├── preise.html             ← Pricing-Seite (Paddle-Checkout)
│   ├── zinsrechner.html        ← SEO-Unterseite
│   ├── rvg-rechner.html        ← SEO-Unterseite
│   ├── gerichtskostenrechner.html ← SEO-Unterseite
│   ├── impressum.html
│   ├── datenschutz.html
│   ├── agb.html
│   ├── sw.js                   ← Service Worker (aktuell fordify-v118 / staging-v72)
│   ├── manifest.json           ← PWA-Manifest
│   ├── css/
│   │   ├── app.css             ← Styling, Print-CSS, Preisseite, Feature-Gates
│   │   ├── rechner.css         ← Rechner-Seiten, Footer, Prefooter
│   │   └── themes.css          ← Theme-Overrides (brand/dark/clean via [data-theme])
│   ├── js/
│   │   ├── app.js              ← Haupt-App (~2100 Zeilen)
│   │   ├── konto.js               ← Kundenbereich-Logik (konto.html)
│   │   ├── config.js           ← Supabase-URL/Key, Paddle-Token, PRICE_MAP, trackEvent()
│   │   ├── auth.js             ← Supabase Auth (Magic Link, Session, Cloud-Laden)
│   │   ├── auth-ui.js          ← Auth-UI-Steuerung (data-auth-show, Avatar, Plan-Badge)
│   │   ├── gates.js            ← Feature-Gates (requiresPaid, Upgrade-Modal)
│   │   ├── storage.js          ← Storage-Abstraktion (sessionStorage ↔ localStorage ↔ Supabase)
│   │   ├── data.js             ← Datentabellen (BASISZINSSAETZE, RVG_TABELLE, GKG_TABELLE)
│   │   ├── zinsen.js           ← Verzugszinsberechnung
│   │   ├── rvg.js              ← RVG-Berechnung
│   │   ├── verrechnung.js      ← § 367 BGB Verrechnungslogik
│   │   ├── rechner-zins.js     ← Zinsrechner-Logik (zinsrechner.html)
│   │   ├── rechner-rvg.js      ← RVG-Rechner-Logik (rvg-rechner.html)
│   │   ├── rechner-gkg.js      ← GKG-Rechner-Logik (gerichtskostenrechner.html)
│   │   └── zusammenfassung.js  ← (deprecated, nicht mehr direkt genutzt)
│   ├── data/
│   │   ├── basiszinssaetze.json ← aktualisierbar (nächste Fälligkeit 01.07.2026)
│   │   └── rvg_tabelle.json    ← BGBl. 2025 I Nr. 109
│   └── fonts/                  ← selbst gehostete Schriftarten
├── supabase/
│   ├── schema.sql              ← DB-Schema (profiles, subscriptions, cases, settings, contacts)
│   └── functions/
│       └── paddle-webhook/     ← Edge Function (Task 7 – in Umsetzung)
├── docs/
│   ├── ROADMAP.md              ← Feature-Roadmap (Phase 0–6) mit Status + Datum
│   ├── SYSTEM.md               ← Technisches Whitepaper
│   ├── freemium-launch-organisationsplan.md ← Manuelle Schritte für Jens (Accounts, Rechtliches)
│   ├── archive/                ← historische Dokumente (nicht löschen, nicht bearbeiten)
│   └── superpowers/
│       ├── specs/              ← Design-Specs (Brainstorming-Ergebnisse)
│       │   └── done/           ← abgeschlossene Specs
│       └── plans/              ← Implementierungspläne
│           └── done/           ← abgeschlossene Pläne
└── tests/                      ← Python-Tests für Berechnungslogik
```

---

## Aktiver Implementierungsplan: Freemium

`docs/superpowers/plans/2026-04-20-freemium-implementation.md`

| Task | Status | Notiz |
|---|---|---|
| 1 – Supabase Schema + RLS | ✅ | |
| 2 – GoatCounter Analytics | ✅ | |
| 3 – Storage-Abstraktionsschicht | ✅ | |
| 4 – Auth – Magic Link Login | ✅ | |
| 5 – Cloud-Laden beim Login | ✅ | |
| 6 – Feature-Gates | ✅ | |
| 7 – Paddle-Webhook Edge Function | ✅ | Deployed + Secrets gesetzt; Webhook-URL in Paddle manuell eintragen |
| 8 – Pricing-Seite | ✅ | |
| 9 – N8N-Workflows | ✅ | Onboarding-Mail (ID: elcsjZCxDmtCw2BI, inaktiv bis Supabase-Webhook) + Digest (ID: hJpXXeIuvGQY60iQ, aktiv, montags 08:00) |
| 10 – Launch-Vorbereitung (AGB etc.) | ✅ | agb.html vorhanden |
| 11 – Gestuftes PDF-Branding | ✅ | getFordifyBranding() in app.js: free=prominent, pro=dezent, business=keins |
| 12 – Excel/CSV-Export | ✅ | fallExportierenAlsExcel() in app.js |

**Blockierungen:** keine — alle Tasks abgeschlossen. Onboarding-Workflow wartet noch auf Supabase-Webhook-Aktivierung (manuell im Supabase Dashboard).

---

## Kerndatenmodell

Siehe `docs/SYSTEM.md` für vollständiges Schema. Kurzübersicht:

- `sessionStorage` / `localStorage["fordify_cases"]` — Registry aller Fälle (je nach Plan)
- `localStorage["fordify_settings"]` — Kanzlei-Einstellungen + Impressum
- `localStorage["fordify_theme"]` — aktives Theme (`"brand"` / `"dark"` / `"clean"`)
- `state.fall.positionen[]` — Array von Positions-Objekten (typ, id, datum, betrag, ...)
- `gruppeId` — verknüpft Hauptforderung mit zugehöriger Zinsperiode
- `fordifyAuth` — globales Auth-Objekt: `isAuthenticated`, `hasSubscription`, `user`, `plan`

---

## Wichtige Architekturentscheidungen

- **Kein Build-Schritt** — direkt aus Quellcode auslieferbar
- **Externe API-Calls** — Supabase (Auth + DB), Paddle (Checkout), GoatCounter (Analytics) — alle DSGVO-konform
- **Print via Popup-Window** (`drucken()`) — kein html2canvas/jsPDF (wäre Bitmap-PDF, nicht durchsuchbar)
- **GKG_TABELLE in data.js** (nicht als JSON) — kein zusätzlicher Netzwerkaufruf nötig
- **`baueSummaryTabelle()`** ist die aktive Zusammenfassungs-Funktion (in app.js, NICHT `erstelleZusammenfassung()` in zusammenfassung.js — deprecated)
- **`migratePositionen()`** — lazy Migration: alte Positionen ohne `gruppeId` erhalten "g0"
- **Theme-System** — `[data-theme]` auf `<html>`, CSS Custom Properties in `themes.css`, drei Themes: `brand` (default, kein Attribut), `dark`, `clean`
- **Free-Nutzer = sessionStorage** — Daten weg beim Tab-Schließen ist Absicht (kein Bug)
- **StorageBackend** (`storage.js`) — Abstraktion über sessionStorage/localStorage/Supabase-Sync

---

## Credentials & Secrets

Alle API-Keys und Credentials stehen in `.env` (nicht im Repo — gitignored):

| Variable | Zweck |
|---|---|
| `SUPABASE_URL` | Supabase Projekt-URL (Project-Ref: `dswhllvtewtqpiqnpbsu`) |
| `SUPABASE_ANON_KEY` | Supabase anon/public Key (für Frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (nur Edge Functions, nie Frontend!) |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI Login-Token |
| `PADDLE_API_KEY` | Paddle Backend API Key |
| `PADDLE_CLIENT_TOKEN` | Paddle Frontend Token (live) |
| `PADDLE_WEBHOOK_SECRET` | Paddle Webhook-Signatur-Secret |
| `PADDLE_PRICE_ID_PRO_MONTHLY` | Paddle Price-ID für Pro monatlich |
| `PADDLE_PRICE_ID_PRO_YEARLY` | Paddle Price-ID für Pro jährlich |
| `PADDLE_PRICE_ID_BUSINESS_MONTHLY` | Paddle Price-ID für Business monatlich |
| `PADDLE_PRICE_ID_BUSINESS_YEARLY` | Paddle Price-ID für Business jährlich |
| `RESEND_API_KEY` | Resend E-Mail API Key |
| `GOATCOUNTER_URL` | GoatCounter Analytics URL (`https://fordify.goatcounter.com/`) |
| `GOATCOUNTER_API_KEY` | GoatCounter API Token (für N8N Digest-Abfragen) |
| `HOSTINGER_API_KEY` | Hostinger API Token (MCP-Server in `.mcp.json`) |
| `N8N_API_KEY` | N8N REST API Key (`https://n8n.srv1063720.hstgr.cloud/api/v1/`) |

Bei CLI-Befehlen (z.B. `supabase functions deploy`) `.env` sourcen oder Werte direkt übergeben.

---

## Dokumentation lesen + pflegen

**Vor neuen Features immer prüfen:**
1. `docs/ROADMAP.md` — ist das Feature schon geplant/erledigt?
2. `docs/SYSTEM.md` — welche Datenstrukturen und Funktionen sind betroffen?
3. Aktive Implementierungspläne in `docs/superpowers/plans/` (Statusübersicht oben)
4. `docs/freemium-launch-organisationsplan.md` — manuelle Schritte + offene Punkte für Jens
5. Aktuelle SW-Cache-Version in `frontend/sw.js` prüfen und nach Änderungen erhöhen

**Nach jeder Entscheidung und Umsetzung zwingend aktualisieren:**
- `docs/ROADMAP.md` — Status ✅ + Datum setzen
- `docs/SYSTEM.md` — neue Strukturen, Funktionen, Architekturdetails ergänzen
- `CLAUDE.md` (diese Datei) — SW-Version, Statusübersicht Freemium-Plan, Architekturentscheidungen
- Immer im gleichen Commit wie die eigentlichen Änderungen

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
2. Statusübersicht in CLAUDE.md aktualisieren
3. Plan nach `docs/superpowers/plans/done/` verschieben
4. `docs/ROADMAP.md` mit ✅ + Datum aktualisieren
