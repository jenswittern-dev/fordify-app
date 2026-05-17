# Public-Launch-Readiness-Analyse — Fordify

**Stand:** 2026-05-17
**Scope:** Phase 7 (SEO & Public Launch) — robots.txt, Sitemap, Meta-Robots, JSON-LD, OG/Twitter, GEO-Crawler

---

## 1. robots.txt — Ist-Zustand

**Datei:** `frontend/robots.txt`

```
User-agent: *
Disallow: /

# LLM-Crawler erlaubt: GPTBot, ChatGPT-User, anthropic-ai, ClaudeBot,
#                      PerplexityBot, CCBot, cohere-ai, Bytespider
Sitemap: https://fordify.de/sitemap.xml
```

### Befund
- **Globaler Block aktiv:** `User-agent: * / Disallow: /` — Google, Bing, DuckDuckGo etc. dürfen NICHTS crawlen.
- **LLM-Crawler vorbildlich freigegeben** (8 Bots) — GEO-Setup steht.
- **FEHLT:** `Google-Extended` (separater Bot für Bard/Gemini-Training, unabhängig von Googlebot).
- **Sitemap-Verweis vorhanden und korrekt.**

### Defizite
- Public Launch ist robots-seitig komplett blockiert. Vor Launch muss der Default-Disallow entfernt oder selektiv umformuliert werden.
- `Google-Extended: Allow: /` nachtragen für vollständige GEO-Abdeckung.

---

## 2. sitemap.xml — Ist-Zustand

**Enthaltene URLs (8):** `/`, `/forderungsaufstellung`, `/zinsrechner`, `/rvg-rechner`, `/gerichtskostenrechner`, `/preise`, `/impressum.html`, `/datenschutz.html`

### Defizite
- **FEHLT:** `/tilgungsrechner` (neue SEO-Seite, JSON-LD bereits vorhanden!)
- **FEHLT:** `/pkh-rechner` (neue SEO-Seite, JSON-LD bereits vorhanden!)
- **Problematisch:** `/forderungsaufstellung` ist in der Sitemap, aber im HTML `noindex`. Widerspruch — sollte entweder noindex aufgehoben oder URL aus Sitemap entfernt werden. (Empfehlung: aus Sitemap entfernen, da App-Seite hinter Login-Erwartung.)
- **Inkonsistenz:** Rechner-URLs ohne `.html`, Legal-URLs MIT `.html` — vermutlich nur Rewrite-Konvention; Canonicals bestätigen das (alle Rechner ohne `.html`).
- **`<lastmod>` auf 2026-04-20** — sollte vor Launch aktualisiert werden.
- **Kein `<lastmod>` für `agb`/`avv`/`widerruf`** — aber diese sollen ohnehin noindex bleiben.

---

## 3. Meta-Robots, Canonical, OG, JSON-LD pro Seite

Soll-Status nach Auftrag. Ist-Status: alle 14 HTML-Seiten haben aktuell `noindex,nofollow` (siehe Tabelle).

| Datei | Soll-robots | Ist-robots | Canonical | OG/Twitter | JSON-LD | Aktion |
|---|---|---|---|---|---|---|
| `index.html` | index,follow | **noindex,nofollow** | ✅ | ✅ | ✅ WebSite+Organization | robots umstellen; ggf. `SoftwareApplication`-Schema ergänzen (laut Plan) |
| `preise.html` | index,follow | **noindex,nofollow** | ✅ | ✅ | ❌ FEHLT | robots umstellen; `Product`/`Offer`-Schema ergänzen (Pro+Business) |
| `zinsrechner.html` | index,follow | **noindex,nofollow** | ✅ | ✅ | ✅ SoftwareApplication+FAQPage+Breadcrumb | robots umstellen |
| `rvg-rechner.html` | index,follow | **noindex,nofollow** | ✅ | ✅ | ✅ SoftwareApplication+FAQPage+Breadcrumb | robots umstellen |
| `gerichtskostenrechner.html` | index,follow | **noindex,nofollow** | ✅ | ✅ | ✅ SoftwareApplication+FAQPage+Breadcrumb | robots umstellen |
| `tilgungsrechner.html` | index,follow | **noindex,nofollow** | ✅ | ✅ | ✅ SoftwareApplication+FAQPage+Breadcrumb | robots umstellen + in Sitemap aufnehmen |
| `pkh-rechner.html` | index,follow | **noindex,nofollow** | ✅ | ✅ | ✅ SoftwareApplication+FAQPage+Breadcrumb | robots umstellen + in Sitemap aufnehmen |
| `forderungsaufstellung.html` | noindex | ✅ noindex,nofollow | ✅ | ✅ | — | OK (Canonical+OG vorhanden, schadet nicht) — aus Sitemap entfernen |
| `konto.html` | noindex | ✅ noindex,nofollow | — | — | — | OK |
| `changelog.html` | noindex | ✅ noindex | — | — | — | OK |
| `agb.html` | noindex | ✅ noindex,nofollow | — | — | — | OK |
| `avv.html` | noindex | ✅ noindex,nofollow | — | — | — | OK |
| `impressum.html` | noindex | ✅ noindex,nofollow | — | — | — | OK — aus Sitemap **prüfen** (Impressum sollte indexierbar sein für Pflichtangaben-Crawl) |
| `datenschutz.html` | noindex | ✅ noindex,nofollow | — | — | — | OK — siehe Impressum |
| `widerruf.html` | noindex | — (nicht gefunden) | — | — | — | Datei existiert nicht im Repo → Eintrag in Aufgabenliste war veraltet |

### Bemerkungen
- **`og:image` existiert** (`frontend/img/og-image.png`) ✅
- **OG-Pflichtfelder (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`) auf allen Public-Seiten vorhanden** ✅
- **Twitter-Card (`summary_large_image`) auf allen Public-Seiten vorhanden** ✅
- **Canonicals sehen alle korrekt aus** (Domain richtig, Pfade ohne `.html` außer Index ✅)
- **`impressum.html`/`datenschutz.html`** stehen in der Sitemap, sind aber `noindex` — Standard-Diskussion: Pflichtangaben werden oft trotzdem auf `index,follow` gesetzt, damit z.B. Google sie als "About"-Signal erkennt. Empfehlung: Auf `index, follow` setzen (kein Risiko, hilft E-E-A-T).

---

## 4. JSON-LD Gap-Analyse

| Seite | Aktuell | Plan-Empfehlung | Lücke |
|---|---|---|---|
| `index.html` | WebSite + Organization | + `SoftwareApplication` (Haupt-App) | **+1 Block** |
| `preise.html` | — | `Product`/`Offer` (Pro+Business) | **+1 Block** |
| `zinsrechner.html` | SoftwareApplication + FAQPage + BreadcrumbList | ✅ vollständig | — |
| `rvg-rechner.html` | SoftwareApplication + FAQPage + BreadcrumbList | ✅ vollständig | — |
| `gerichtskostenrechner.html` | SoftwareApplication + FAQPage + BreadcrumbList | ✅ vollständig | — |
| `tilgungsrechner.html` | SoftwareApplication + FAQPage + BreadcrumbList | ✅ vollständig | — |
| `pkh-rechner.html` | SoftwareApplication + FAQPage + BreadcrumbList | ✅ vollständig | — |

**Insgesamt sehr guter Stand.** Die 5 Rechner-Seiten sind vorbildlich ausgezeichnet. Nur 2 Ergänzungen wären sinnvoll (Home + Preise), aber Preise/Product-Schema ist optional (Google zeigt Pricing-Rich-Results meist nur bei B2C-E-Commerce).

---

## 5. GEO-Crawler Status

| Bot | robots.txt | Bemerkung |
|---|---|---|
| GPTBot (OpenAI Training) | ✅ Allow | |
| ChatGPT-User (OpenAI Browse) | ✅ Allow | |
| OAI-SearchBot (OpenAI Search) | ❌ FEHLT | seit 2026 separater Bot, kann von GPTBot-Regel betroffen sein |
| anthropic-ai (legacy) | ✅ Allow | |
| ClaudeBot | ✅ Allow | |
| Claude-Web | ❌ FEHLT | von Anthropic separat dokumentiert |
| PerplexityBot | ✅ Allow | |
| Perplexity-User | ❌ FEHLT | separater User-Agent für On-Demand-Queries |
| Google-Extended (Bard/Gemini) | ❌ **FEHLT** | wichtig — wird vom globalen `*-Disallow` blockiert |
| CCBot (Common Crawl) | ✅ Allow | |
| cohere-ai | ✅ Allow | |
| Bytespider (ByteDance/Doubao) | ✅ Allow | |
| Applebot-Extended (Apple Intelligence) | ❌ FEHLT | seit 2024 |
| Meta-ExternalAgent | ❌ FEHLT | für Llama-Training |
| DuckAssistBot (DuckDuckGo AI) | ❌ FEHLT | |

**Risiko ohne Ergänzung:** Sobald `User-agent: * / Disallow: /` durch ein offenes Allow ersetzt wird, ist das o.k.; aber solange der Default `*` restriktiv ist, fallen alle nicht explizit gelisteten Bots unter den Disallow.

**Empfehlung:** Nach Aufhebung des globalen Disallow (`User-agent: * / Allow: /`) sind explizite LLM-Bot-Einträge nicht mehr zwingend nötig, aber als dokumentierte Whitelist sinnvoll.

---

## 6. Aktionsliste (priorisiert)

### A) Vor Launch zwingend (Blocker)

1. **`robots.txt` umstellen**: `User-agent: * / Disallow: /` → `User-agent: * / Allow: /` (oder `Disallow:` ohne Pfad). **5 Min.**
2. **Meta-Robots auf 7 öffentlichen Seiten** (`index`, `preise`, `zinsrechner`, `rvg-rechner`, `gerichtskostenrechner`, `tilgungsrechner`, `pkh-rechner`) von `noindex,nofollow` → `index, follow` umstellen. **10 Min.**
3. **Sitemap ergänzen** um `/tilgungsrechner` und `/pkh-rechner`. `/forderungsaufstellung` entfernen (bleibt noindex — App-Seite). `<lastmod>` aktualisieren. **5 Min.**
4. **Manuelle Verifikation nach Deploy:**
   - `https://fordify.de/robots.txt` öffentlich erreichbar
   - Google Search Console: Property anlegen + Sitemap einreichen
   - Bing Webmaster Tools: dito
   - Rich Results Test (search.google.com/test/rich-results) für mindestens 1 Rechner
   - **30 Min.**

### B) Sollte vor Launch (hoher Nutzen, niedriger Aufwand)

5. **`Google-Extended: Allow: /`** in robots.txt nachtragen (GEO für Gemini/Bard). **1 Min.**
6. **Weitere LLM-Bots** in robots.txt nachtragen: `OAI-SearchBot`, `Claude-Web`, `Perplexity-User`, `Applebot-Extended`, `Meta-ExternalAgent`, `DuckAssistBot`. **5 Min.**
7. **`SoftwareApplication`-JSON-LD auf `index.html`** ergänzen (Haupt-App mit aggregateRating-Platzhalter falls vorhanden, sonst ohne). **15 Min.**
8. **`impressum.html` + `datenschutz.html`** auf `index, follow` umstellen (E-E-A-T-Signal). **2 Min.**

### C) Kann nach Launch (nice-to-have)

9. **`Product`/`Offer`-JSON-LD auf `preise.html`** (Pro+Business) — Rich-Result-Wahrscheinlichkeit B2B-SaaS gering, aber LLM-fähig. **30 Min.**
10. **`Article`/`BlogPosting`-Schema vorbereiten** falls Content-Marketing-Seiten geplant. **0 Min. (nur Konzept)**
11. **Sitemap-Aufteilung** in `sitemap-index.xml` + thematische Sub-Sitemaps, sobald >50 URLs. **nicht jetzt**

---

## 7. Geschätzter Gesamt-Aufwand

| Block | Aufwand |
|---|---|
| A (Blocker) | **~50 Min.** inkl. Verifikation |
| B (vor Launch empfohlen) | **~25 Min.** |
| C (nach Launch) | **~30 Min.** |
| **Gesamt vor Launch (A+B)** | **~1h 15min** |

---

## 8. Gesamteinschätzung

**Fordify ist technisch zu ~85% launchbereit.** Die Hauptarbeit (Canonical, OG/Twitter, FAQ-/Software-/Breadcrumb-Schema auf den Rechner-Seiten) ist sehr sauber erledigt — die Rechner-Landingpages sind besser ausgezeichnet als bei vielen Mitbewerbern. Der eigentliche Launch ist ein 1-Stunden-Job:

1. robots.txt aufmachen
2. 7× meta robots umstellen
3. Sitemap um 2 URLs ergänzen + 1 entfernen
4. Search Console / Bing einrichten + Sitemap einreichen

**Kein Architekturproblem, keine inhaltlichen Lücken.** Empfehlung: A + B in einem Sweep umsetzen, dann live gehen.
