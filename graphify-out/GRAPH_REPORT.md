# Graph Report - .  (2026-05-17)

## Corpus Check
- 33 files · ~319,055 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 339 nodes · 573 edges · 47 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
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
9. `ladeRegistry()` - 7 edges
10. `speichernMitFeedback()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ae()` --calls--> `jt()`  [EXTRACTED]
  frontend\js\pdf-lib.min.js → frontend\js\pdf-lib.min.js  _Bridges community 6 → community 7_
- `_e()` --calls--> `Ht()`  [EXTRACTED]
  frontend\js\pdf-lib.min.js → frontend\js\pdf-lib.min.js  _Bridges community 10 → community 6_
- `hs()` --calls--> `za()`  [EXTRACTED]
  frontend\js\pdf-lib.min.js → frontend\js\pdf-lib.min.js  _Bridges community 9 → community 5_
- `us()` --calls--> `ja()`  [EXTRACTED]
  frontend\js\pdf-lib.min.js → frontend\js\pdf-lib.min.js  _Bridges community 15 → community 5_

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
Cohesion: 0.32
Nodes (11): aktualisiereFussVorschau(), aktualisiereLogoVorschau(), einstellungenExportieren(), einstellungenImportieren(), einstellungenSpeichern(), generiereImpressumFooterHtml(), ladeEinstellungen(), leseImpFelder() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.46
Nodes (12): betragFeld(), datumFeld(), tituliertFeld(), tplAnwalt(), tplEinfacheKosten(), tplGerichtskosten(), tplHauptforderung(), tplInkassopauschale() (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (11): as(), cs(), hs(), is(), js(), Ms(), ns(), os() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (11): _e(), Et(), Gr(), jt(), Kr(), qt(), r(), Ut() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (10): ae(), he(), le(), ne(), qe(), re(), se(), ue() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (10): ci(), di(), fi(), gi(), hi(), i(), li(), Ni() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (9): a(), Ma(), Na(), Pa(), qa(), Ra(), Ta(), Va() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.39
Nodes (8): Bt(), Dt(), Ht(), It(), Kt(), Nt(), Ot(), Wt()

### Community 11 - "Community 11"
Cohesion: 0.46
Nodes (7): aktuellerBasiszinssatz(), berechneVerzugszinsen(), periodenGrenzen(), tage30360(), tageDiff(), tageszins(), zusammenfuehren()

### Community 12 - "Community 12"
Cohesion: 0.52
Nodes (7): Hr(), Ir(), jr(), Lr(), Mr(), Ur(), Zr()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (6): ai(), bi(), ii(), mi(), wi(), yi()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (6): Da(), Ea(), Ia(), ja(), ls(), Oa()

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (6): de(), ee(), fe(), ge(), pe(), $t()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (2): convert(), decode()

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (2): baueSummaryTabelle(), rendereVorschau()

### Community 19 - "Community 19"
Cohesion: 0.7
Nodes (4): erstelleZVAuftrag(), _formatDatum(), _heuteDatum(), _zvForderungsbetraege()

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (2): berechneVerrechnung(), verrechneZahlung()

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (2): drucken(), getFordifyBranding()

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (2): themeLaden(), themeWechseln()

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): js/auth-ui.js

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): frontend/js/auth.js

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): js/auth.js

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (1): js/config.js

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (1): js/contacts.js

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (1): js/data.js

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (1): js/gates.js

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (1): js/rechner-gkg.js

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (1): js/rechner-pkh.js

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (1): js/rechner-rvg.js

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): js/rechner-tilgung.js

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): js/rechner-zins.js

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): js/rvg.js

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): js/storage.js

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): paddle-webhook Edge Function

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): supabase/functions/paddle-webhook/index.ts

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): supabase/functions/verify-and-login/index.ts

## Knowledge Gaps
- **17 isolated node(s):** `js/auth-ui.js`, `frontend/js/auth.js`, `js/auth.js`, `js/config.js`, `js/contacts.js` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (2 nodes): `fordify-confirm.js`, `fordifyConfirm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `gkg.js`, `gkgGebuehr()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `js/auth-ui.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `frontend/js/auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `js/auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `bootstrap.bundle.min.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `js/config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `js/contacts.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `js/data.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `decimal.min.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `js/gates.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `js/rechner-gkg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `js/rechner-pkh.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `js/rechner-rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `rechner-rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `js/rechner-tilgung.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `js/rechner-zins.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `rechner-zins.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `js/rvg.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `js/storage.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `paddle-webhook Edge Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `supabase/functions/paddle-webhook/index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `supabase/functions/verify-and-login/index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `js/auth-ui.js`, `frontend/js/auth.js`, `js/auth.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._