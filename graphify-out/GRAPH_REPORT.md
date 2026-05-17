# Graph Report - .  (2026-05-17)

## Corpus Check
- 138 files · ~320,735 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 405 nodes · 640 edges · 61 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `fallWechseln()` - 12 edges
2. `neuenFallAnlegen()` - 12 edges
3. `kontoLadeRegistry()` - 11 edges
4. `datumFeld()` - 10 edges
5. `speichern()` - 9 edges
6. `betragFeld()` - 9 edges
7. `tituliertFeld()` - 8 edges
8. `za()` - 8 edges
9. `Priorisierte Aktionsliste A/B/C` - 8 edges
10. `ladeRegistry()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `CLAUDE.md Hub` --semantically_similar_to--> `AGENTS.md Mirror`  [EXTRACTED] [semantically similar]
  CLAUDE.md → AGENTS.md
- `Graphify-Pflicht (CLAUDE.md)` --rationale_for--> `Holistic Code-Review Spec 2026-05-17`  [INFERRED]
  CLAUDE.md → docs/superpowers/specs/done/2026-05-17-holistic-code-review.md
- `Hook-Trade-off (Windows)` --conceptually_related_to--> `Holistic Code-Review Spec 2026-05-17`  [INFERRED]
  AGENTS.md → docs/superpowers/specs/done/2026-05-17-holistic-code-review.md
- `CLAUDE.md Hub` --references--> `Tech Stack (SYSTEM §0)`  [EXTRACTED]
  CLAUDE.md → docs/SYSTEM.md
- `CLAUDE.md Hub` --references--> `Datenmodell (§3)`  [EXTRACTED]
  CLAUDE.md → docs/SYSTEM.md

## Hyperedges (group relationships)
- **Holistic Code-Review 2026-05-17 Pfade** — holistic_spec, holistic_pfad_a_launch, holistic_pfad_b_aufraeumen, holistic_pfad_c_split_etappen12, holistic_pfad_d_split_etappe3, appjs_split_analyse, codequality_review, docs_hygiene_audit, launch_readiness [EXTRACTED 1.00]
- **App.js-Modularisierung 2026-05-17** — claudemd_app_js_modularisierung_note, appjs_split_analyse, appjs_17_subcluster, appjs_split_option2_moderat, appjs_etappen_plan, appjs_baue_summary_tabelle_monolith, holistic_pfad_c_split_etappen12, holistic_pfad_d_split_etappe3, system_architektur [EXTRACTED 0.95]
- **Verhaltens-Regelwerk Fordify** — claudemd_verhalten_pflicht, claudemd_tool_auswahl_pflicht, claudemd_graphify_pflicht, claudemd_datei_verwaltung, agentsmd_verhalten, agentsmd_graphify_pflicht, agentsmd_agents_skills_section, agentsmd_anti_patterns [EXTRACTED 1.00]
- **Public-Launch-Vorbereitung** — launch_readiness, launch_robots_txt, launch_sitemap, launch_noindex_7_seiten, launch_jsonld_gap, launch_geo_bots, launch_aktionsliste, launch_85_percent_ready, freemium_section_11_public_seo, freemium_blocker_robots, freemium_marketing_voraussetzungen, holistic_pfad_a_launch [EXTRACTED 1.00]
- **Docs-Hygiene & Code-Cleanup (Pfad B)** — docs_hygiene_audit, docs_hygiene_17_plaene, docs_hygiene_bulk_aktion, docs_hygiene_mailbox_automation, docs_hygiene_legal_review_dir, codequality_review, codequality_zusammenfassung_dead, codequality_parsedate_dup, codequality_eschtml_review, codequality_top5_quickfixes, holistic_pfad_b_aufraeumen [EXTRACTED 1.00]
- **Technische Wahrheitsquelle SYSTEM.md** — system_tech_stack, system_architektur, system_freemium, system_datenmodell, system_db_schema, system_email, system_credentials, system_sw_version_206 [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (52): aktualisiereNaechsteFallListe(), aktualisiereNavContext(), aktualisierUndoBtn(), aktuellenFallInRegistry(), badgeKlasse(), egbgbHinweisToggle(), exportBasisname(), exportReminderDismiss() (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (36): _csvBetragsNormalisieren(), _csvDetectDelimiter(), _csvSplitLine(), _csvZeileZuFall(), _kontoActivateTabFromUrl(), _kontoAktualisiereFussVorschau(), _kontoAktualisiereLogoVorschau(), kontoEinstellungenExportieren() (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (28): Anti-Patterns (NICHT nutzen), Graphify-Pflicht (AGENTS.md), Hook-Trade-off (Windows), AGENTS.md Mirror, 17 Sub-Cluster A–Q, baueSummaryTabelle 430-LoC-Monolith, 3-Etappen-Plan (Empfehlung), app.js-Split-Analyse (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.32
Nodes (11): aktualisiereFussVorschau(), aktualisiereLogoVorschau(), einstellungenExportieren(), einstellungenImportieren(), einstellungenSpeichern(), generiereImpressumFooterHtml(), ladeEinstellungen(), leseImpFelder() (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.46
Nodes (12): betragFeld(), datumFeld(), tituliertFeld(), tplAnwalt(), tplEinfacheKosten(), tplGerichtskosten(), tplHauptforderung(), tplInkassopauschale() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (11): _e(), Et(), Gr(), jt(), Kr(), qt(), r(), Ut() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (11): as(), cs(), hs(), is(), js(), Ms(), ns(), os() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (11): Datei-Verwaltung (max. 5 aktive Pläne), escHtml/escAttr-Review, parseDate 3x Duplikation, Top-5 Low-Hanging-Fruit Refactorings, zusammenfassung.js – Dead Code, 17 aktive Pläne (Verstoß max. 5), Empfohlene Bulk-Aktion, docs/legal-review/ Strukturverstoß (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.27
Nodes (11): robots.txt Blocker Schalter, Marketing-Voraussetzungen vor Launch, §11 Public-SEO-Launch (auf Marketing wartend), Pfad A – Public Launch (geparkt), ~85% launchbereit (1h-Job), Priorisierte Aktionsliste A/B/C, GEO-Crawler Status, JSON-LD Gap-Analyse (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (10): ae(), he(), le(), ne(), qe(), re(), se(), ue() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (10): ci(), di(), fi(), gi(), hi(), i(), li(), Ni() (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (9): a(), Ma(), Na(), Pa(), qa(), Ra(), Ta(), Va() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.39
Nodes (8): Bt(), Dt(), Ht(), It(), Kt(), Nt(), Ot(), Wt()

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
Nodes (6): Da(), Ea(), Ia(), ja(), ls(), Oa()

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (6): ai(), bi(), ii(), mi(), wi(), yi()

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (6): de(), ee(), fe(), ge(), pe(), $t()

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
Cohesion: 0.67
Nodes (2): berechneVerrechnung(), verrechneZahlung()

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (2): drucken(), getFordifyBranding()

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (2): themeLaden(), themeWechseln()

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): § Agents & Skills, Tool-Auswahl-Pflicht

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (2): AGENTS.md Verhalten, Verhalten (Pflicht)

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (2): Häufige Aufgaben Tabelle, Agents & Skills Quick-Picks

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (2): Fordify-Spezialisten Tabelle, Freemium-Architektur (§2)

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (2): Wichtige Architekturentscheidungen, SW-Version fordify-v206 / staging-v174

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (1): js/auth-ui.js

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (1): frontend/js/auth.js

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (1): js/auth.js

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): js/config.js

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): js/contacts.js

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): js/data.js

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): js/gates.js

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): js/rechner-gkg.js

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): js/rechner-pkh.js

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): js/rechner-rvg.js

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): js/rechner-tilgung.js

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (1): js/rechner-zins.js

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (1): js/rvg.js

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (1): js/storage.js

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (1): paddle-webhook Edge Function

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): supabase/functions/paddle-webhook/index.ts

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): supabase/functions/verify-and-login/index.ts

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (1): Tool-Vergleiche bei Überlappung

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): Supabase-DB-Schema (§3.6)

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): Freemium-Launch-Organisationsplan

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Globale Variablen-Pollution moderat

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): Specs-Audit

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): Entscheidungen am 2026-05-17

## Knowledge Gaps
- **47 isolated node(s):** `js/auth-ui.js`, `frontend/js/auth.js`, `js/auth.js`, `js/config.js`, `js/contacts.js` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 26`** (2 nodes): `fordify-confirm.js`, `fordifyConfirm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `gkg.js`, `gkgGebuehr()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `§ Agents & Skills`, `Tool-Auswahl-Pflicht`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `AGENTS.md Verhalten`, `Verhalten (Pflicht)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `Häufige Aufgaben Tabelle`, `Agents & Skills Quick-Picks`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `Fordify-Spezialisten Tabelle`, `Freemium-Architektur (§2)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `Wichtige Architekturentscheidungen`, `SW-Version fordify-v206 / staging-v174`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `js/auth-ui.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `frontend/js/auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `js/auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `bootstrap.bundle.min.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `js/config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `js/contacts.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `js/data.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `decimal.min.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `js/gates.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `js/rechner-gkg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `js/rechner-pkh.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `js/rechner-rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `rechner-rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `js/rechner-tilgung.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `js/rechner-zins.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `rechner-zins.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `js/rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `js/storage.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `paddle-webhook Edge Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `supabase/functions/paddle-webhook/index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `supabase/functions/verify-and-login/index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `Tool-Vergleiche bei Überlappung`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Supabase-DB-Schema (§3.6)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `Freemium-Launch-Organisationsplan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `Globale Variablen-Pollution moderat`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `Specs-Audit`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `Entscheidungen am 2026-05-17`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Doku-Hygiene-Audit` connect `Community 3` to `Community 8`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `js/auth-ui.js`, `frontend/js/auth.js`, `js/auth.js` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._