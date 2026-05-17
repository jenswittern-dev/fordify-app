# Graph Report - .  (2026-05-17)

## Corpus Check
- 138 files · ~329,802 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 590 nodes · 819 edges · 92 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `fallWechseln()` - 12 edges
2. `neuenFallAnlegen()` - 12 edges
3. `Konkurrenzanalyse Fordify` - 11 edges
4. `kontoLadeRegistry()` - 11 edges
5. `Cross-Cutting Code-Quality-Review` - 11 edges
6. `datumFeld()` - 10 edges
7. `Fordify ROADMAP` - 9 edges
8. `Fordify Feature-Analyse & Entscheidungsgrundlage` - 9 edges
9. `speichern()` - 9 edges
10. `betragFeld()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Finding N1: Unvollständiger DOM-XSS-Fix (dezentralisierte escHtml)` --semantically_similar_to--> `Holistic Finding 1: DOM-XSS Fix unvollständig (Positionsdaten)`  [INFERRED] [semantically similar]
  antigravity/website-audit-report-2026-04-29.md → Codex/holistic-website-app-audit-2026-04-29.md
- `Finding N5: Deutsches Tausenderformat bricht Kern-App` --semantically_similar_to--> `Holistic Finding 5: Zins/RVG Tausenderformat-Parsing`  [INFERRED] [semantically similar]
  antigravity/website-audit-report-2026-04-29.md → Codex/holistic-website-app-audit-2026-04-29.md
- `RVG-Rechner Mobile (390px) – Baseline` --semantically_similar_to--> `Zinsrechner Mobile (390px)`  [INFERRED] [semantically similar]
  screenshot-rvg-390.png → screenshot-zinsrechner-390.png
- `RVG-Rechner Mobile (390px) – Fixed State` --semantically_similar_to--> `RVG-Rechner Mobile (390px) – Baseline`  [EXTRACTED] [semantically similar]
  screenshot-rvg-390-fixed.png → screenshot-rvg-390.png
- `RVG-Rechner Mobile (390px) – Verification` --semantically_similar_to--> `RVG-Rechner Mobile (390px) – Baseline`  [EXTRACTED] [semantically similar]
  screenshot-rvg-390-verify.png → screenshot-rvg-390.png

## Hyperedges (group relationships)
- **Holistic Code-Review 2026-05-17 – Pfade A/B/C/D mit Spec als Entscheidungsvorlage** — holistic_review_spec, holistic_review_path_a, holistic_review_path_b, holistic_review_path_c, holistic_review_path_d [EXTRACTED 1.00]
- **Vier fokussierte Tiefenanalysen die Spec speisen** — review_app_js_analysis, review_code_quality, review_docs_hygiene, review_launch_readiness [EXTRACTED 1.00]
- **App.js-Modularisierung 2026-05-17 (7 extrahierte Module)** — module_theme_js, module_gkg_js, module_fordify_confirm_js, module_print_js, module_einstellungen_js, module_modal_templates_js, module_summary_js, outcome_app_js_50_percent_reduction [EXTRACTED 1.00]
- **Public-Launch-Blocker Kette (Analyse → geparkte Checklist → Pfad A)** — launch_robots_blocker, launch_meta_robots_7_pages, launch_sitemap_gaps, freemium_org_block_a_blocker, holistic_review_path_a [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (77): a(), ae(), ai(), as(), bi(), Bt(), ci(), cs() (+69 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (52): aktualisiereNaechsteFallListe(), aktualisiereNavContext(), aktualisierUndoBtn(), aktuellenFallInRegistry(), badgeKlasse(), egbgbHinweisToggle(), exportBasisname(), exportReminderDismiss() (+44 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (36): _csvBetragsNormalisieren(), _csvDetectDelimiter(), _csvSplitLine(), _csvZeileZuFall(), _kontoActivateTabFromUrl(), _kontoAktualisiereFussVorschau(), _kontoAktualisiereLogoVorschau(), kontoEinstellungenExportieren() (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (36): Datei-Verwaltung (max. 5 aktive Pläne, verbotene .md-Files), Pointer-Tabelle 'Wo finde ich was?', Top-5 Low-Hanging-Fruit-Refactorings (<2h gesamt), Empfohlene Bulk-Aktion: 13-16 Pläne nach done/, 1 Spec nach done/, Strukturverstoß: docs/legal-review/_convert.js außerhalb erlaubter docs-Struktur, Mailbox-Automation Telegram – Plan + Spec, Sollzustand Slack (Q2), Verstoß: 17 aktive Pläne, faktisch 0 echt aktive, Befund: 4 e.message-XSS-Stellen (app.js + konto.js) (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (28): Antigravity Holistic Frontend & Security Audit (2026-04-29), Finding N1: Unvollständiger DOM-XSS-Fix (dezentralisierte escHtml), Finding N2: Logo-HTML Injection via Settings-Import (Stored XSS), Finding N4: PWA-Bruch bei extensionless Routes (Offline-Navigation), Finding N5: Deutsches Tausenderformat bricht Kern-App, Codex Code Audit Report (2026-04-28), Codex Frontend-Audit (2026-04-29), Codex Holistic Website & App Audit (2026-04-29) (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (27): KWG / ZAG / BaFin Regulierung, §§ 398 ff. BGB Forderungsabtretung, Rechtsdienstleistungsgesetz (RDG), 60tools Forderungsaufstellung, AnNoText FoMa (Wolters Kluwer), Forderungsaufstellung 367 Professional, LawFirm Kanzleirechner, LAWgistic Forderungsberechner (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (23): AGENTS.md – Schwesterdatei zu CLAUDE.md, Verhalten (Pflicht): Commit/Push/SW-Bump/Doku im gleichen Commit, CLAUDE.md – schlanker Pointer-Hub, Entscheidungen 2026-05-17 (Pfad A geparkt, B/C/D erledigt), Pfad C – app.js Split Etappe 1+2 (4 h), Pfad D – app.js Split Etappe 3 (5 h), Extrahiertes Modul: frontend/js/einstellungen.js, Extrahiertes Modul: frontend/js/fordify-confirm.js (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (17): E-Mail-Workflows: Zahlungsbestätigung, Offboarding & Retention Plan, 30-Tage Grace Period nach Kündigung, N8N auf Hostinger VPS (n8n.srv1063720.hstgr.cloud), Paddle Events: transaction.completed, subscription.canceled, subscription.updated, Resend Email API, § 147 AO Retention Policy (profiles+subscriptions 10y), Supabase PostgREST API für N8N, Task 1: Schema Migration (grace_period_end, scheduled_cancel_at, retention_email_sent_at) (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.32
Nodes (11): aktualisiereFussVorschau(), aktualisiereLogoVorschau(), einstellungenExportieren(), einstellungenImportieren(), einstellungenSpeichern(), generiereImpressumFooterHtml(), ladeEinstellungen(), leseImpFelder() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.46
Nodes (12): betragFeld(), datumFeld(), tituliertFeld(), tplAnwalt(), tplEinfacheKosten(), tplGerichtskosten(), tplHauptforderung(), tplInkassopauschale() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (11): RVG-Rechner Mobile (390px) – Baseline, RVG-Rechner Mobile (390px) – Fixed State, RVG-Rechner Mobile (390px) – Verification, Zinsrechner Mobile (390px), Breadcrumb Navigation (fordify / RVG-Rechner), RVG Hero: RVG-Rechner 2025/2026 (BGBl. 2025 I Nr. 109), RVG Input Form: Gegenstandswert, Verfahrensart, Umsatzsteuer, RVG Result Preview: 847,60 € / 1,3-fach (VV 2300) (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (11): Landing Page Mobile (390px), Pricing Page Mobile (390px), Landing CTA: Jetzt kostenlos starten, Landing Hero: In Minuten zur rechtssicheren Forderungsaufstellung nach § 367 BGB, Kernfeature: Forderungsaufstellung § 367 BGB, Trustbar: RVG 2025, Basiszins, Anwälte, kostenlos, Mobile Hamburger Navigation (390px), Feature-Liste: Zinsrechner, RVG, GKG, Tilgung, PKH (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.27
Nodes (10): Komponente: Zusammenfassung (baueSummaryTabelle), Komponente: § 367 BGB Verrechnungslogik (verrechnung.js), Feedback R1-03: Zusammenfassung erweitern (HF, Zinsen bis Zahlung, Kostenverzinsung), Feedback R2-01: Verrechnungsbeträge & Zwischenberechnung pro Zahlung anzeigen, Feedback R3: Berechnungsfehler in Zusammenfassung (Verrechnung/Restforderung), Pain Point: Berechnungsfehler in Verrechnungs-Logik (offene Forderung), Pain Point: Buchungs-/Verzugsdatum als Spalte fehlt, Pain Point: Verzinsung von Kosten (z.B. Gerichtskosten ab Zustellung Titel) (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (9): Brand Cyan Accent (#0891b2), Brand Light Blue (#93c5fd), Brand Primary Blue (#1e3a8a), Fordify Logo Clean/Monochrome Variant (SVG), Fordify Logo Dark Variant (SVG), Fordify Primary Logo (SVG), Fordify Wordmark Logo (SVG), Fordify Open Graph Preview Image (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.46
Nodes (7): aktuellerBasiszinssatz(), berechneVerzugszinsen(), periodenGrenzen(), tage30360(), tageDiff(), tageszins(), zusammenfuehren()

### Community 15 - "Community 15"
Cohesion: 0.52
Nodes (7): Hr(), Ir(), jr(), Lr(), Mr(), Ur(), Zr()

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (6): Multiview-Audit (2026-04-20, 5 Agents + 7 Personas), BUG-01: InsO-Kappung falscher Betrag in Zusammenfassung, Datenpersistenz im Free-Tier als größtes Hindernis (alle 7 Personas), Persona Katharina Brandt (Einzelanwältin, Mietrecht), Persona Thomas Weidemann (Sozietät, gewerbliches Mietrecht), Customer Personas Dokument

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (5): App SPA Mobile (390px) – Welcome Modal, Datenschutz-Callout (localStorage, DSGVO-konform), EGBGB Art. 229 § 34 Hinweis (Altverträge), Verzugszins-Aufschlag Dropdown (9% Unternehmer), Welcome Modal: Willkommen bei fordify

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (5): Komponente: Druckansicht (drucken()), Feedback R2-03: Druckansicht – Gläubiger/Schuldner, keine Umbrüche, Restforderung-Text, Pain Point: Gläubiger/Schuldner-Block fehlt in Druckansicht, Pain Point: Druck-Zeilenumbrüche in Zusammenfassung verschieben auf Seite 2, Pain Point: 'auf [Restforderung]' Text in Zinserklärung fehlt im Druck

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (2): convert(), decode()

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (2): baueSummaryTabelle(), rendereVorschau()

### Community 22 - "Community 22"
Cohesion: 0.7
Nodes (4): erstelleZVAuftrag(), _formatDatum(), _heuteDatum(), _zvForderungsbetraege()

### Community 23 - "Community 23"
Cohesion: 0.5
Nodes (4): RVG-Rechner Mobile (390px) – Full Page, Footer (dark theme, navigation links), RVG Cross-Promo: Forderungsaufstellung erstellen, RVG FAQ Section: Häufige Fragen zum RVG-Rechner

### Community 24 - "Community 24"
Cohesion: 0.5
Nodes (4): Komponente: Forderungsaufstellung (Haupt-App), Feedback R1-01: Gerichtskosten / ZV-Kosten Umbenennung, Pain Point: Position 'Gerichtskosten' fehlt im Menü, Pain Point: Terminologie 'Gerichtsvollzieherkosten' zu eng (ZV-Kosten)

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (2): berechneVerrechnung(), verrechneZahlung()

### Community 26 - "Community 26"
Cohesion: 0.5
Nodes (4): Architektur-Invariant: app.js-Modularisierung 2026-05-17, Ergebnis: app.js 2810 → 1414 LoC (-50%) am 2026-05-17, SW-Cache-Bumps: v202 (zusammenfassung weg), v203 (utils-Zentralisierung), Cluster A – State + Storage-Layer

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (3): Rationale: EU-Hosting zwingend (Anwälte, § 43a BRAO), Rationale: Kein Tracking, kein Cookie-Banner, Webapp-Transformation Analyse

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (3): Komponente: RVG/Anwaltsvergütung Modal, Feedback R1-02: RVG netto/brutto Auswahl (Vorsteuerabzug), Pain Point: RVG-Gebühren netto/brutto-Auswahl fehlt

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): Komponente: Impressum/Kontaktdaten-Einstellungen, Feedback R2-02: Impressum-Text verlinkbar (Datenschutz-Links), Pain Point: Impressum-Textfeld erlaubt keine Hyperlinks

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (2): drucken(), getFordifyBranding()

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (2): themeLaden(), themeWechseln()

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (2): LIESMICH.txt Nutzerdoku, PDF erstellen Workflow (Drucken via Browser)

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (2): § 288 Abs. 5 BGB 40-€-Pauschale, P1.1 40-€-Inkassopauschale § 288 Abs. 5 BGB

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): Debitos NPL-Marktplatz, Rationale: Kleinforderungssegment <25k EUR unversorgt

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (2): E-Mail-Workflows Implementation Plan (Cancellation), 30-Tage Grace Period nach Kündigung

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (2): Zwangsvollstreckung (ZV), ZV-Formular PDF (Zwangsvollstreckungsantrag template)

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (2): Was NICHT angegangen werden sollte (Option 3, CSP, Cluster G/A), Split-Option 3 – Aggressiv (komplette Modularisierung, 20-25 h)

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): Auftrag Folgeauftrag (Monetarisierungskonzept Brainstorm)

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): Auftrag Weiterentwicklung (Forderungsmarktplatz Konzept)

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Anwaltsgespräch Transcript (§367 BGB Layout)

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Feedback Runde 5 (Tilgungsbestimmung Konzept)

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): P1.2 Verjährungswarnung Zinsen § 197 BGB

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): P2.1 Wiederkehrende Buchungen

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): P2.2 Zukunfts-Zahlungsplan

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): P2.5 Mehrere Zinsmethoden (30/360, act/365)

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (1): Rationale: Free Tier = kein Speichern + kein Export

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (1): Rationale: PDF-Export bleibt kostenlos (Marketing-Kanal)

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (1): Rationale: Paddle als Merchant of Record statt Stripe

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (1): Rationale: Supabase RLS vor Launch korrekt

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (1): Lexware Office AGB (Referenz)

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): sevDesk AGB (Referenz)

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): HubSpot AVV (DPA Referenz)

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (1): Lexware Office AVV (Referenz)

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): Forderungsaufstellung Beispiel (Print-Output Example PDF)

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): Resend DPA (signed) - Data Processing Agreement

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Supabase User DPA (March 12, 2026)

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): js/auth-ui.js

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): frontend/js/auth.js

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (1): js/auth.js

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): js/config.js

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): js/contacts.js

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (1): js/data.js

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (1): js/gates.js

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (1): js/rechner-gkg.js

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (1): js/rechner-pkh.js

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (1): js/rechner-rvg.js

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): js/rechner-tilgung.js

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): js/rechner-zins.js

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (1): js/rvg.js

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): js/storage.js

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): paddle-webhook Edge Function

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): supabase/functions/paddle-webhook/index.ts

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): supabase/functions/verify-and-login/index.ts

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): Graphify-Section: Wann/Wie nutzen, Update-Routine

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): Cluster B – Fallverwaltung (CRUD + Modal)

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): Cluster C – Import/Export (JSON, CSV/Excel, Share)

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): Cluster D – Navigation + Stepper

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): Cluster E – Stammdaten-Formular

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): Cluster F – Positionsliste + Undo

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (1): Cluster G – Modal-Dispatcher + Datenleser (395 LoC)

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (1): Cluster N – Onboarding-Modal

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (1): Cluster P – ZV-Auftrag (§ 753 ZPO) Bridge

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (1): Cluster Q – Init/DOMContentLoaded-Bootstrap

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (1): Split-Option 1 – Minimal (1 Modul, 2.5 h)

## Knowledge Gaps
- **168 isolated node(s):** `LIESMICH.txt Nutzerdoku`, `PDF erstellen Workflow (Drucken via Browser)`, `Finding N2: Logo-HTML Injection via Settings-Import (Stored XSS)`, `P0: Extra brace breaks app.js bundle`, `P0: Paddle subscription upsert no unique constraint` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 32`** (2 nodes): `LIESMICH.txt Nutzerdoku`, `PDF erstellen Workflow (Drucken via Browser)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `§ 288 Abs. 5 BGB 40-€-Pauschale`, `P1.1 40-€-Inkassopauschale § 288 Abs. 5 BGB`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `Debitos NPL-Marktplatz`, `Rationale: Kleinforderungssegment <25k EUR unversorgt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `E-Mail-Workflows Implementation Plan (Cancellation)`, `30-Tage Grace Period nach Kündigung`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `Zwangsvollstreckung (ZV)`, `ZV-Formular PDF (Zwangsvollstreckungsantrag template)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `fordify-confirm.js`, `fordifyConfirm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `gkg.js`, `gkgGebuehr()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `Was NICHT angegangen werden sollte (Option 3, CSP, Cluster G/A)`, `Split-Option 3 – Aggressiv (komplette Modularisierung, 20-25 h)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `Auftrag Folgeauftrag (Monetarisierungskonzept Brainstorm)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `Auftrag Weiterentwicklung (Forderungsmarktplatz Konzept)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Anwaltsgespräch Transcript (§367 BGB Layout)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Feedback Runde 5 (Tilgungsbestimmung Konzept)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `P1.2 Verjährungswarnung Zinsen § 197 BGB`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `P2.1 Wiederkehrende Buchungen`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `P2.2 Zukunfts-Zahlungsplan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `P2.5 Mehrere Zinsmethoden (30/360, act/365)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `Rationale: Free Tier = kein Speichern + kein Export`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `Rationale: PDF-Export bleibt kostenlos (Marketing-Kanal)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `Rationale: Paddle als Merchant of Record statt Stripe`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `Rationale: Supabase RLS vor Launch korrekt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `Lexware Office AGB (Referenz)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `sevDesk AGB (Referenz)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `HubSpot AVV (DPA Referenz)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `Lexware Office AVV (Referenz)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Forderungsaufstellung Beispiel (Print-Output Example PDF)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `Resend DPA (signed) - Data Processing Agreement`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `Supabase User DPA (March 12, 2026)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `js/auth-ui.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `frontend/js/auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `js/auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `bootstrap.bundle.min.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `js/config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `js/contacts.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `js/data.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `decimal.min.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `js/gates.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (1 nodes): `js/rechner-gkg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `js/rechner-pkh.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `js/rechner-rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `rechner-rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `js/rechner-tilgung.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `js/rechner-zins.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `rechner-zins.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `js/rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `js/storage.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `paddle-webhook Edge Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `supabase/functions/paddle-webhook/index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `supabase/functions/verify-and-login/index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `Graphify-Section: Wann/Wie nutzen, Update-Routine`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `Cluster B – Fallverwaltung (CRUD + Modal)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `Cluster C – Import/Export (JSON, CSV/Excel, Share)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `Cluster D – Navigation + Stepper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `Cluster E – Stammdaten-Formular`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `Cluster F – Positionsliste + Undo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `Cluster G – Modal-Dispatcher + Datenleser (395 LoC)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (1 nodes): `Cluster N – Onboarding-Modal`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (1 nodes): `Cluster P – ZV-Auftrag (§ 753 ZPO) Bridge`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (1 nodes): `Cluster Q – Init/DOMContentLoaded-Bootstrap`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (1 nodes): `Split-Option 1 – Minimal (1 Modul, 2.5 h)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Entscheidungen 2026-05-17 (Pfad A geparkt, B/C/D erledigt)` connect `Community 6` to `Community 3`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `Holistic Code-Review 2026-05-17 – Entscheidungsvorlage` connect `Community 3` to `Community 6`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `LIESMICH.txt Nutzerdoku`, `PDF erstellen Workflow (Drucken via Browser)`, `Finding N2: Logo-HTML Injection via Settings-Import (Stored XSS)` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._