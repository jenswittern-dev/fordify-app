# Graph Report - .  (2026-05-17)

## Corpus Check
- 126 files · ~320,558 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1081 nodes · 1924 edges · 51 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `cs` - 38 edges
2. `On` - 33 edges
3. `xt` - 28 edges
4. `Forderungsaufstellung SPA (forderungsaufstellung.html)` - 25 edges
5. `qi` - 22 edges
6. `Landing Page (index.html)` - 20 edges
7. `Ks` - 18 edges
8. `ii()` - 17 edges
9. `Es` - 16 edges
10. `Fordify Project (Forderungsaufstellung SaaS)` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Datenschutz Page (datenschutz.html)` --references--> `Resend DPA (signed) - Data Processing Agreement`  [INFERRED]
  frontend/datenschutz.html → legal/resend/resend-dpa-signed.pdf
- `Datenschutz Page (datenschutz.html)` --references--> `Supabase User DPA (March 12, 2026)`  [INFERRED]
  frontend/datenschutz.html → legal/supabase/Supabase User DPA (March 12, 2026).pdf
- `Forderungsaufstellung Beispiel (Print-Output Example PDF)` --rationale_for--> `Forderungsaufstellung SPA (forderungsaufstellung.html)`  [INFERRED]
  docs/archive/cases/forderungsaufstellung_beispiel.pdf → frontend/forderungsaufstellung.html
- `App SPA Mobile (390px) – Welcome Modal` --references--> `app.js (main SPA logic)`  [INFERRED]
  screenshot-app-390.png → frontend/js/app.js
- `Finding N1: Unvollständiger DOM-XSS-Fix (dezentralisierte escHtml)` --semantically_similar_to--> `Holistic Finding 1: DOM-XSS Fix unvollständig (Positionsdaten)`  [INFERRED] [semantically similar]
  antigravity/website-audit-report-2026-04-29.md → Codex/holistic-website-app-audit-2026-04-29.md

## Hyperedges (group relationships)
- **Freemium Three-Tier Architecture (Storage × Auth × Gates)** — system_freemium_model, agents_arch_storage_backend, system_feature_gates, agents_tech_stack_supabase, agents_tech_stack_paddle [EXTRACTED 0.95]
- **§ 367 BGB Allocation Workflow (Audit → System → Feedback)** — system_calc_verrechnung, codex_p1_367_reversed, transcript_anwalt, feedback_runde5, roadmap_phase4 [EXTRACTED 0.90]
- **DOM-XSS Remediation Across Audits** — antigravity_n1_dom_xss, codex_holistic_f1_dom_xss, antigravity_n2_logo_injection, roadmap_phase8 [EXTRACTED 0.92]
- **Fordify Freemium-Tier-Architektur** — tier_free, tier_pro, tier_business, paddle_mor, rationale_free_tier [EXTRACTED 0.90]
- **DSGVO-Unterauftragsverarbeiter-Kette** — fordify_avv, subprocessor_supabase, subprocessor_resend, subprocessor_hostinger, citation_art28_dsgvo [EXTRACTED 0.95]
- **Marktplatz Drei-Modell-Strategie (A/B/C)** — marketplace_modell_a, marketplace_modell_b, marketplace_modell_c, citation_kwg_zag, citation_rdg [EXTRACTED 0.90]
- **Frontend Audit F3+F5+F7 als koordinierte Fix-Trio** — frontend_audit_f5_csv_injection, frontend_audit_f7_accessibility, frontend_audit_f3_mobile_overflow [EXTRACTED 1.00]
- **Paddle Event Chain: webhook → grace_period → email workflows** — email_workflows_paddle_events, email_workflows_task2_paddle_webhook, email_workflows_grace_period_30d, email_workflows_task6_offboarding [EXTRACTED 1.00]
- **N8N + Resend + Supabase PostgREST als E-Mail-Workflow-Stack** — email_workflows_n8n_hostinger, email_workflows_resend_email, email_workflows_supabase_postgrest [EXTRACTED 1.00]
- **Common Auth Bootstrap (every page loads supabase + config + auth)** — vendor_supabase_js, js_config, js_auth, js_auth_ui, js_storage [EXTRACTED 0.95]
- **Forderungsaufstellung SPA Stack** — forderungsaufstellung_page, js_app, js_zinsen, js_rvg, js_verrechnung, js_data, vendor_decimaljs [EXTRACTED 0.95]
- **DSGVO Legal Compliance Bundle** — pdf_resend_dpa, pdf_supabase_dpa, datenschutz_page, agb_page, concept_dpa [INFERRED 0.80]
- **RVG-Rechner UI States (Mobile 390px)** — screenshot_rvg_390, screenshot_rvg_390_fixed, screenshot_rvg_390_verify, screenshot_rvg_390_full [EXTRACTED 1.00]
- **Mobile 390px Production Screenshots** — screenshot_app_390, screenshot_index_390, screenshot_preise_390, screenshot_rvg_390, screenshot_rvg_390_fixed, screenshot_rvg_390_verify, screenshot_rvg_390_full, screenshot_zinsrechner_390 [EXTRACTED 1.00]
- **SEO Calculator Pages (Zins + RVG)** — screenshot_zinsrechner_390, screenshot_rvg_390, ui_rvg_hero, ui_zins_hero, ui_breadcrumb [INFERRED 0.80]
- **Marketing Funnel (Landing -> Pricing -> App)** — screenshot_index_390, screenshot_preise_390, screenshot_app_390, ui_landing_cta, ui_pricing_free_card [INFERRED 0.75]
- **Feedback Runde 1 (April 2026, Andreas)** — feedback_r1_01_gerichtskosten, feedback_r1_02_rvg_netto, feedback_r1_03_zusammenfassung [EXTRACTED 1.00]
- **Feedback Runde 2 (April 2026, Andreas)** — feedback_r2_01_verrechnung_anzeige, feedback_r2_02_impressum_links, feedback_r2_03_druckansicht [EXTRACTED 1.00]
- **Feedback Runde 3 (Berechnungsfehler)** — feedback_r3_berechnungsfehler [EXTRACTED 1.00]
- **Cluster: Verrechnungs-Transparenz und -Korrektheit** — feedback_r1_03_zusammenfassung, feedback_r2_01_verrechnung_anzeige, feedback_r3_berechnungsfehler, component_verrechnung_logic, component_summary_table [INFERRED 0.85]
- **Cluster: Druckansicht-Verbesserungen** — feedback_r2_02_impressum_links, feedback_r2_03_druckansicht, component_print_view [INFERRED 0.75]
- **Fordify Brand Identity** — logo_svg_primary, logo_dark_svg, logo_clean_svg, logo_wordmark_svg, og_image_png, static_logo_png, brand_color_primary_blue, brand_color_cyan_accent, brand_color_light_blue [INFERRED 0.90]
- **Logo Variants (Theme-Adaptive)** — logo_svg_primary, logo_dark_svg, logo_clean_svg, logo_wordmark_svg [EXTRACTED 1.00]
- **Fordify Brand Color Palette** — brand_color_primary_blue, brand_color_cyan_accent, brand_color_light_blue [EXTRACTED 1.00]

## Communities

### Community 0 - "pdf-lib (PDF Library)"
Cohesion: 0.03
Nodes (84): a(), ae(), ai(), as(), bi(), Bt(), ci(), cs() (+76 more)

### Community 1 - "app.js Main SPA Logic"
Cohesion: 0.05
Nodes (90): aktualisiereFussVorschau(), aktualisiereLogoVorschau(), aktualisiereNaechsteFallListe(), aktualisiereNavContext(), aktualisierUndoBtn(), aktuellenFallInRegistry(), badgeKlasse(), baueSummaryTabelle() (+82 more)

### Community 2 - "Bootstrap Tooltip/Popover"
Cohesion: 0.04
Nodes (9): b(), Bt, c(), cs, qi, r(), us, W (+1 more)

### Community 3 - "Architektur & Projekt-Doku"
Cohesion: 0.03
Nodes (77): Architekturentscheidung: Free-Nutzer = sessionStorage, Architekturentscheidung: Kein Build-Schritt, Architekturentscheidung: Print via Popup-Window, StorageBackend Abstraktion (sessionStorage/localStorage/Supabase), Theme-System (brand/dark/clean), E-Mail-Architektur (hallo@/legal@/datenschutz@/support@), Fordify Project (Forderungsaufstellung SaaS), AGENTS.md – Fordify Project Context (+69 more)

### Community 4 - "Bootstrap Modal/Toast"
Cohesion: 0.05
Nodes (5): ao, On, Q, qn, sn

### Community 5 - "Kundenbereich konto.js"
Cohesion: 0.06
Nodes (39): _csvBetragsNormalisieren(), _csvDetectDelimiter(), _csvSplitLine(), _csvZeileZuFall(), fordifyConfirm(), _kontoActivateTabFromUrl(), _kontoAktualisiereFussVorschau(), _kontoAktualisiereLogoVorschau() (+31 more)

### Community 6 - "Bootstrap Core Utilities"
Cohesion: 0.1
Nodes (41): a(), Ae(), be(), Ce(), d(), De(), di(), $e() (+33 more)

### Community 7 - "Recht & DSGVO Recherche"
Cohesion: 0.04
Nodes (56): Art. 28 DSGVO Auftragsverarbeitung, Art. 32 DSGVO TOMs, EU-U.S. Data Privacy Framework (EU) 2023/1795, KWG / ZAG / BaFin Regulierung, § 147 AO Aufbewahrungspflicht 10 Jahre, § 19 UStG Kleinunternehmer, § 203 StGB / § 43e BRAO Berufsgeheimnis, § 367 BGB Verrechnungsreihenfolge (+48 more)

### Community 8 - "decimal.js (Arithmetik)"
Cohesion: 0.08
Nodes (29): A(), an(), B(), C(), D(), F(), fn(), G() (+21 more)

### Community 9 - "Verrechnung & ZV & Styling"
Cohesion: 0.08
Nodes (46): AGB Page (agb.html), DSGVO Data Processing Agreement (DPA / AVV), § 367 BGB Verrechnungslogik, Zwangsvollstreckung (ZV), css/app.css, css/bootstrap.min.css, css/fonts.css, css/rechner.css (+38 more)

### Community 10 - "Bootstrap Config Helpers"
Cohesion: 0.06
Nodes (5): g(), h(), Jn, st, Xn()

### Community 11 - "Seitenstruktur & Screenshots"
Cohesion: 0.05
Nodes (32): app.js (main SPA logic), App SPA Mobile (390px) – Welcome Modal, Landing Page Mobile (390px), Pricing Page Mobile (390px), RVG-Rechner Mobile (390px) – Baseline, RVG-Rechner Mobile (390px) – Fixed State, RVG-Rechner Mobile (390px) – Full Page, RVG-Rechner Mobile (390px) – Verification (+24 more)

### Community 12 - "Bootstrap Scrollspy"
Cohesion: 0.1
Nodes (2): Es, xt

### Community 13 - "E-Mail Workflows & Grace Period"
Cohesion: 0.07
Nodes (34): E-Mail-Workflows: Zahlungsbestätigung, Offboarding & Retention Plan, 30-Tage Grace Period nach Kündigung, N8N auf Hostinger VPS (n8n.srv1063720.hstgr.cloud), Paddle Events: transaction.completed, subscription.canceled, subscription.updated, Resend Email API, § 147 AO Retention Policy (profiles+subscriptions 10y), Supabase PostgREST API für N8N, Task 1: Schema Migration (grace_period_end, scheduled_cancel_at, retention_email_sent_at) (+26 more)

### Community 14 - "Bootstrap Tab Component"
Cohesion: 0.22
Nodes (2): Ks, n()

### Community 15 - "Brand Identity & Logos"
Cohesion: 0.22
Nodes (13): Brand Cyan Accent (#0891b2), Brand Light Blue (#93c5fd), Brand Primary Blue (#1e3a8a), Fordify Logo Clean/Monochrome Variant (SVG), Fordify Logo Dark Variant (SVG), Fordify Primary Logo (SVG), Fordify Wordmark Logo (SVG), Fordify Open Graph Preview Image (+5 more)

### Community 16 - "Bootstrap Backdrop Manager"
Cohesion: 0.35
Nodes (1): cn

### Community 17 - "Tilgungsplan-Rechner"
Cohesion: 0.49
Nodes (9): aktualisiereMindestrate(), berechne(), berechneBetrag(), berechneRate(), formatEUR(), formatNum(), parseBetrag(), setModus() (+1 more)

### Community 18 - "Verzugszinsen-Berechnung"
Cohesion: 0.38
Nodes (9): aktuellerBasiszinssatz(), berechneVerzugszinsen(), formatDate(), parseDate(), periodenGrenzen(), tage30360(), tageDiff(), tageszins() (+1 more)

### Community 19 - "Supabase Edge Functions"
Cohesion: 0.22
Nodes (2): corsHeaders(), _noSubscriptionResponse()

### Community 20 - "Feedback: Verrechnung"
Cohesion: 0.27
Nodes (10): Komponente: Zusammenfassung (baueSummaryTabelle), Komponente: § 367 BGB Verrechnungslogik (verrechnung.js), Feedback R1-03: Zusammenfassung erweitern (HF, Zinsen bis Zahlung, Kostenverzinsung), Feedback R2-01: Verrechnungsbeträge & Zwischenberechnung pro Zahlung anzeigen, Feedback R3: Berechnungsfehler in Zusammenfassung (Verrechnung/Restforderung), Pain Point: Berechnungsfehler in Verrechnungs-Logik (offene Forderung), Pain Point: Buchungs-/Verzugsdatum als Spalte fehlt, Pain Point: Verzinsung von Kosten (z.B. Gerichtskosten ab Zustellung Titel) (+2 more)

### Community 21 - "Auth (Magic Link / Supabase)"
Cohesion: 0.31
Nodes (4): _emailRedirectTo(), loginMitEmail(), _loginStatus(), _loginStatusMitLink()

### Community 22 - "Auth UI Controls"
Cohesion: 0.38
Nodes (4): aktualisiereUIFuerAuth(), checkAutoCheckout(), _getInitials(), _zeigeCheckoutToast()

### Community 23 - "Zusammenfassung (deprecated)"
Cohesion: 0.48
Nodes (6): berechneTagesZins(), erstelleZusammenfassung(), formatEUR(), formatTageszins(), kategorieVonTyp(), resolvePositionen()

### Community 24 - "Kontakte/CRM"
Cohesion: 0.6
Nodes (5): aktualisiereKontakt(), _aktualisiereKontaktAutocomplete(), ladeKontakte(), loescheKontakt(), speichereKontakt()

### Community 25 - "RVG-Berechnung (Core)"
Cohesion: 0.6
Nodes (5): berechneRVGGesamt(), berechneRVGGesamtPKH(), berechneRVGPosition(), berechneRVGPositionPKH(), gebuehrAusTabelle()

### Community 26 - "Legal-Review MD Converter"
Cohesion: 0.5
Nodes (2): convert(), decode()

### Community 27 - "GKG-Rechner"
Cohesion: 0.7
Nodes (4): berechne(), fmt(), gebuehrAusGKGTabelle(), renderErgebnis()

### Community 28 - "§367 BGB Verrechnungslogik"
Cohesion: 0.5
Nodes (2): berechneVerrechnung(), verrechneZahlung()

### Community 29 - "Zwangsvollstreckungs-Auftrag"
Cohesion: 0.7
Nodes (4): erstelleZVAuftrag(), _formatDatum(), _heuteDatum(), _zvForderungsbetraege()

### Community 30 - "Hosting & Datenschutz"
Cohesion: 0.4
Nodes (5): All-Inkl (Hosting Anbieter), fordify Datenschutzerklärung, Rationale: EU-Hosting zwingend (Anwälte, § 43a BRAO), Rationale: Kein Tracking, kein Cookie-Banner, Webapp-Transformation Analyse

### Community 31 - "Feedback: Druckansicht"
Cohesion: 0.4
Nodes (5): Komponente: Druckansicht (drucken()), Feedback R2-03: Druckansicht – Gläubiger/Schuldner, keine Umbrüche, Restforderung-Text, Pain Point: Gläubiger/Schuldner-Block fehlt in Druckansicht, Pain Point: Druck-Zeilenumbrüche in Zusammenfassung verschieben auf Seite 2, Pain Point: 'auf [Restforderung]' Text in Zinserklärung fehlt im Druck

### Community 32 - "Feature Gates"
Cohesion: 0.5
Nodes (0): 

### Community 33 - "Utilities (esc, parse)"
Cohesion: 0.5
Nodes (0): 

### Community 34 - "Feedback: Gerichtskosten"
Cohesion: 0.5
Nodes (4): Komponente: Forderungsaufstellung (Haupt-App), Feedback R1-01: Gerichtskosten / ZV-Kosten Umbenennung, Pain Point: Position 'Gerichtskosten' fehlt im Menü, Pain Point: Terminologie 'Gerichtsvollzieherkosten' zu eng (ZV-Kosten)

### Community 35 - "PKH-Rechner"
Cohesion: 1.0
Nodes (2): berechne(), renderErgebnis()

### Community 36 - "RVG-Rechner Seite"
Cohesion: 1.0
Nodes (2): berechne(), renderErgebnis()

### Community 37 - "Zinsrechner Seite"
Cohesion: 1.0
Nodes (2): berechne(), renderPerioden()

### Community 38 - "Feedback: Impressum-Links"
Cohesion: 0.67
Nodes (3): Komponente: Impressum/Kontaktdaten-Einstellungen, Feedback R2-02: Impressum-Text verlinkbar (Datenschutz-Links), Pain Point: Impressum-Textfeld erlaubt keine Hyperlinks

### Community 39 - "Feedback: RVG netto/brutto"
Cohesion: 0.67
Nodes (3): Komponente: RVG/Anwaltsvergütung Modal, Feedback R1-02: RVG netto/brutto Auswahl (Vorsteuerabzug), Pain Point: RVG-Gebühren netto/brutto-Auswahl fehlt

### Community 40 - "Config & Tracking"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Inkassopauschale §288 V BGB"
Cohesion: 1.0
Nodes (2): § 288 Abs. 5 BGB 40-€-Pauschale, P1.1 40-€-Inkassopauschale § 288 Abs. 5 BGB

### Community 42 - "NPL-Markt (Debitos)"
Cohesion: 1.0
Nodes (2): Debitos NPL-Marktplatz, Rationale: Kleinforderungssegment <25k EUR unversorgt

### Community 43 - "Impressum (§5 DDG)"
Cohesion: 1.0
Nodes (2): § 5 DDG Impressumspflicht, fordify Impressum § 5 DDG

### Community 44 - "Service Worker (PWA)"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Datentabellen (Basiszins/RVG/GKG)"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Storage-Abstraktion"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Feature: Verjährungswarnung"
Cohesion: 1.0
Nodes (1): P1.2 Verjährungswarnung Zinsen § 197 BGB

### Community 48 - "Feature: Wiederkehrende Buchungen"
Cohesion: 1.0
Nodes (1): P2.1 Wiederkehrende Buchungen

### Community 49 - "Feature: Zukunfts-Zahlungsplan"
Cohesion: 1.0
Nodes (1): P2.2 Zukunfts-Zahlungsplan

### Community 50 - "Feature: Zinsmethoden"
Cohesion: 1.0
Nodes (1): P2.5 Mehrere Zinsmethoden (30/360, act/365)

## Knowledge Gaps
- **160 isolated node(s):** `AGENTS.md – Fordify Project Context`, `Bootstrap 5.3.3 UI Framework`, `decimal.js (exakte Dezimalrechnung)`, `Progressive Web App (Service Worker + Manifest)`, `Theme-System (brand/dark/clean)` (+155 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Config & Tracking`** (2 nodes): `config.js`, `trackEvent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Inkassopauschale §288 V BGB`** (2 nodes): `§ 288 Abs. 5 BGB 40-€-Pauschale`, `P1.1 40-€-Inkassopauschale § 288 Abs. 5 BGB`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `NPL-Markt (Debitos)`** (2 nodes): `Debitos NPL-Marktplatz`, `Rationale: Kleinforderungssegment <25k EUR unversorgt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Impressum (§5 DDG)`** (2 nodes): `§ 5 DDG Impressumspflicht`, `fordify Impressum § 5 DDG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Service Worker (PWA)`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Datentabellen (Basiszins/RVG/GKG)`** (1 nodes): `data.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Storage-Abstraktion`** (1 nodes): `storage.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feature: Verjährungswarnung`** (1 nodes): `P1.2 Verjährungswarnung Zinsen § 197 BGB`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feature: Wiederkehrende Buchungen`** (1 nodes): `P2.1 Wiederkehrende Buchungen`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feature: Zukunfts-Zahlungsplan`** (1 nodes): `P2.2 Zukunfts-Zahlungsplan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feature: Zinsmethoden`** (1 nodes): `P2.5 Mehrere Zinsmethoden (30/360, act/365)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cs` connect `Bootstrap Tooltip/Popover` to `Bootstrap Config Helpers`, `Bootstrap Core Utilities`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `On` connect `Bootstrap Modal/Toast` to `Bootstrap Tooltip/Popover`, `Bootstrap Core Utilities`, `Bootstrap Config Helpers`, `Bootstrap Scrollspy`, `Bootstrap Tab Component`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `xt` connect `Bootstrap Scrollspy` to `Bootstrap Config Helpers`, `Bootstrap Tooltip/Popover`, `Bootstrap Modal/Toast`, `Bootstrap Core Utilities`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Forderungsaufstellung SPA (forderungsaufstellung.html)` (e.g. with `Forderungsaufstellung Beispiel (Print-Output Example PDF)` and `Zinsrechner (zinsrechner.html)`) actually correct?**
  _`Forderungsaufstellung SPA (forderungsaufstellung.html)` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AGENTS.md – Fordify Project Context`, `Bootstrap 5.3.3 UI Framework`, `decimal.js (exakte Dezimalrechnung)` to the rest of the system?**
  _160 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `pdf-lib (PDF Library)` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `app.js Main SPA Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._