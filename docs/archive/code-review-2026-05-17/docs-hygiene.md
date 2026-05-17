# Doku-Hygiene-Audit – Fordify

> Audit-Datum: 2026-05-17
> Basis: CLAUDE.md (Datei-Verwaltungs-Regeln), docs/ROADMAP.md (Soll-Status), Stichprobenanalyse aller aktiven Pläne, Specs und Archive-Dokumente.
> Regelverstoß: **17 aktive Pläne** statt max. 5 erlaubt. Großteil ist längst erledigt und gehört nach `done/`.

---

## 1. Aktive Pläne (`docs/superpowers/plans/*.md`)

| # | Datei | Verdict | Begründung | Empfohlene Aktion |
|---|---|---|---|---|
| 1 | `2026-04-20-audit-fixes.md` | **STALE** | Status-Header sagt 3 Tasks ⏳ (BUG-02 confirm, A11y outline:none, skip-nav). Aber: alle Phase-0-bis-5-Roadmap-Items dazu sind ✅ markiert; spätere Audit-Pläne (Codex-Audit, Holistic-Audit-Fixes in `done/`) haben diese Themen erneut abgearbeitet. Effektiv überholt. | Nach `done/` verschieben (oder ins Archiv, da von Codex-/Holistic-Audit ersetzt). |
| 2 | `2026-04-20-auth-ux.md` | **DONE** | 7 von 8 Tasks ✅, nur Task 7 (Webhook-Email-Fallback) als ⏳ gekennzeichnet — laut Plan `2026-04-22-checkout-auth-flow.md` und ROADMAP 5.5 ist genau dieser Webhook längst durch `paddle-webhook` + `verify-and-login` Edge Functions abgelöst. | Nach `done/` verschieben. |
| 3 | `2026-04-20-freemium-implementation.md` | **DONE** | Status-Tabelle: 11 von 12 Tasks ✅, nur Task 9 (N8N) als ⏳. CLAUDE.md Zeile zur Freemium-Tabelle sagt aber: "alle Tasks abgeschlossen und verifiziert (2026-04-23)". N8N-Workflows existieren (IDs in CLAUDE.md gelistet). | Status-Block updaten auf 12/12 ✅ und nach `done/` verschieben. |
| 4 | `2026-04-20-staging-environment.md` | **DONE** | 6 von 8 Tasks ✅, Staging-Branch + Workflow + SW-Cache-Trennung sind live (CLAUDE.md erwähnt `staging-v167`). Task 2 (Staging-Supabase-Credentials) + Task 6 (eigene Subdomain statt /staging) sind manuelle Aufgaben für Jens, kein offenes Code-Work. | Nach `done/` verschieben; offene manuelle Punkte in `freemium-launch-organisationsplan.md` festhalten falls nicht schon dort. |
| 5 | `2026-04-21-email-onboarding.md` | **DONE** | Onboarding-Mail-Workflow `elcsjZCxDmtCw2BI` aktiv seit 2026-04-21 (CLAUDE.md). Digest-Workflow `hJpXXeIuvGQY60iQ` aktiv. ROADMAP Phase 6.7 = ✅. | Nach `done/` verschieben. |
| 6 | `2026-04-22-checkout-auth-flow.md` | **DONE** | Edge Functions `paddle-webhook` + `verify-and-login` sind in CLAUDE.md gelistet und in Produktion. Webhook in Paddle eingetragen (verifiziert 2026-04-23). | Nach `done/` verschieben. |
| 7 | `2026-04-23-adressbuecher.md` | **DONE** | ROADMAP 6.0a, 6.0b, 6.0c alle ✅ (2026-04-23). `contacts.js` + `type`-Spalte in `contacts`-Tabelle existieren. | Nach `done/` verschieben. |
| 8 | `2026-04-23-avv.md` | **DONE** | ROADMAP 5.9 ✅ (2026-04-23). `avv.html`, `accepted_avv_at`-Spalte, Banner-Flag in konto.js existieren. Recent Commit „fix(avv): Sauberer Druckausdruck" bestätigt die Datei ist live. | Nach `done/` verschieben. |
| 9 | `2026-04-23-csv-import.md` | **DONE** | ROADMAP 6.0d ✅ (2026-04-23). `kontoCSVImportOeffnen` / `kontoCSVImportDatei` in `konto.js` existieren. | Nach `done/` verschieben. |
| 10 | `2026-04-23-kundenbereich-datenverwaltung.md` | **DONE** | ROADMAP 6.1, 6.2, 6.3, 6.4, 6.5 alle ✅ (2026-04-23). | Nach `done/` verschieben. |
| 11 | `2026-04-23-legal-ux-quick-wins.md` | **DONE** | ROADMAP 5.1 (Haftungsausschluss), 5.2 (Datenschutz-Link), 5.3 (Changelog), 5.8 (Free-Export-Sperre) alle ✅ (2026-04-23). | Nach `done/` verschieben. |
| 12 | `2026-04-23-plan-d-rechner-navbar.md` | **DONE** | ROADMAP 3.5 (Tilgungsrechner), 3.6 (30/360), 3.7 (Rechner-Dropdown) alle ✅ (2026-04-23). | Nach `done/` verschieben. |
| 13 | `2026-04-23-tilgungsrechner-modi.md` | **DONE** | Drei-Modi-Tilgungsrechner ist Folge-Plan zu Plan-D. ROADMAP 3.5 ✅. Auch in CLAUDE.md/SYSTEM.md als Standard dokumentiert. | Nach `done/` verschieben. |
| 14 | `2026-04-24-mailbox-automation.md` | **STALE / UNCLEAR** | Telegram-Bot-Variante. CLAUDE.md erwähnt jedoch nur N8N-Workflows mit Resend; ROADMAP 5.11 ("E-Mail-Eingang → Slack") ist 📋 mit explizitem Hinweis "bestehenden Telegram-Benachrichtigungs-Workflow auf Slack portieren". → Telegram ist Legacy, Slack ist Sollzustand. Spec dazu (`2026-04-24-mailbox-automation-design.md`) ist ebenfalls Telegram-basiert. | Entscheidung Jens: (a) Plan + Spec ins `done/` falls Telegram-Workflows tatsächlich laufen — oder (b) nach `docs/archive/` falls nie deployed. Neuen Plan für Slack-Migration (ROADMAP 5.11) erst bei tatsächlichem Start schreiben. |
| 15 | `2026-04-29-codex-audit-fixes.md` | **DONE** | 35 unerledigte Checkboxen aber: Alle adressierten Punkte sind Phase-8-Roadmap-Items (8.1 DOM-XSS, 8.4 PWA-Offline, 8.5 Tausendertrennzeichen, etc.) und in ROADMAP ✅ (2026-04-29). Auch in `done/2026-04-29-holistic-audit-fixes.md` zusammengeführt. | Nach `done/` verschieben — Checkboxen sind nur nicht abgehakt worden, faktisch erledigt. |
| 16 | `2026-04-29-frontend-audit-fixes.md` | **DONE** | F1 (UNIQUE Constraint), F2 (XSS escHtml), F4 (SW-Cache), F6 (Doku-Hygiene) — alles wurde im Codex/Holistic-Audit ✅ umgesetzt. Identische Themen wie Phase 8.1, 8.4 Roadmap. | Nach `done/` verschieben. |
| 17 | `2026-04-29-frontend-audit-f3-f5-f7.md` | **DONE** | Plan-Ende (Zeilen 422–425) selbst dokumentiert: F5, F7, F3 alle "✅". ROADMAP 8.3 (F3), 8.6 (N6/CSV), 8.7 (N7/ZV) alle ✅. Checkboxen wurden nicht händisch abgehakt, der Plan ist aber inhaltlich abgeschlossen. | Nach `done/` verschieben. |

**Statistik:** 13 DONE · 2 STALE · 1 UNCLEAR (Mailbox-Automation) · 1 (audit-fixes) StaleOverlap → effektiv **0 echte aktive Pläne**.

---

## 2. Specs (`docs/superpowers/specs/*.md`)

| Datei | Verdict | Begründung | Empfohlene Aktion |
|---|---|---|---|
| `2026-04-22-kundenbereich-design.md` | **DONE** | Spec-Header: "Status: Genehmigt". Konto-Bereich ist live, ROADMAP 6.0 ✅ (2026-04-22). Implementierungsplan `2026-04-22-kundenbereich.md` ist bereits in `done/`. | Nach `specs/done/` verschieben. |
| `2026-04-24-mailbox-automation-design.md` | **STALE / UNCLEAR** | Telegram-Bot-Konzept. Wie Plan #14: Sollzustand laut ROADMAP 5.11 ist Slack, nicht Telegram. | Mit Plan #14 zusammen Entscheidung treffen: `specs/done/` falls Telegram-Variante eingesetzt wird/wurde, sonst nach `docs/archive/superpowers/` als historisches Konzept. |

---

## 3. Archive-Dokumente mit fragwürdigem Wert (`docs/archive/research/`)

Stichprobe:

| Datei | Wert | Begründung |
|---|---|---|
| `audit-2026-04-20.md` | **historisch wertvoll** | Multiview-Audit (5 Spezialisten + 7 Personas), Basis für Phase-5/6-Roadmap. Sollte als historischer Anker bleiben. |
| `customer-personas.md` | **wertvoll** | Wird aktiv referenziert (Plan/Roadmap-Quelle: "feedback-2/01"). 7 Personas inklusive Note + Kernkritik — sinnvoll für künftige Feature-Priorisierung. |
| `feature-analyse.md` | **wertvoll** | Quellen-Crosswalk (Konkurrenzanalyse + Machbarkeitsstudie → ROADMAP). Liefert das "warum" hinter den Features. |
| `konkurrenzanalyse.md` | **wertvoll** | Stand April 2026, gelistet als Quelle in ROADMAP-Header. |
| `machbarkeitsstudie.md` | **wertvoll** | Strategiedokument für 6-Monats-Ziel (Forderungsmarktplatz). Direkt referenziert. |
| `webapp-transformation.md` | **wertvoll** | Beschreibt Transformations-Rationale (file:// → Subdomain). Heute Realität, aber als historisches Dokument behalten. |
| `machbarkeitsstudie-review-2026-04-20.md` | **wertvoll** | Review der Machbarkeitsstudie — kürzeres Dokument mit Bewertung. |
| `agb-saas/lexware-office-agb.md`, `sevdesk-agb.md` | **fragwürdig** | Reine Vergleichs-AGBs anderer SaaS-Anbieter. Vermutlich Vorlagen-Research für `frontend/agb.html`. Da diese fertig ist, sind die Vergleichsdokumente jetzt totes Material — kein Code referenziert sie. Könnten weg, aber als Beleg/Referenz okay. |
| `avv-saas/hubspot-avv.md`, `lexware-avv.md` | **fragwürdig** | Wie oben: AVV-Vorlagen anderer Anbieter. ROADMAP 5.9 (AVV) ist ✅, das Material wurde benutzt. Kann archiviert bleiben. |

**Empfehlung:** Alle Research-Dokumente im `archive/research/`-Ordner sind sinnvoll abgelegt (das ist genau der Zweck von `archive/`). Keine Aktion nötig — Graphify-Isolation kommt daher, dass sie keinen Code referenzieren, nicht aus mangelnder Aktualität.

---

## 4. Top-Level `docs/` Verstöße gegen CLAUDE.md

CLAUDE.md erlaubt im docs-Root genau diese Dateien: `ROADMAP.md`, `SYSTEM.md`, `freemium-launch-organisationsplan.md`.

**Ist-Stand:**

| Datei | Erlaubt? |
|---|---|
| `docs/ROADMAP.md` | ✅ |
| `docs/SYSTEM.md` | ✅ |
| `docs/freemium-launch-organisationsplan.md` | ✅ |

→ **Keine Verstöße im docs-Root.** Sauber.

**Hinweis zu `docs/legal-review/_convert.js`** (im git status als modifiziert): Liegt unter `docs/legal-review/` — ein Ordner, der in CLAUDE.md gar nicht definiert ist. Das ist ein **Strukturverstoß** (CLAUDE.md erlaubt unter `docs/` nur `archive/` und `superpowers/`). Empfehlung: Inhalt prüfen — entweder nach `docs/archive/legal-review/` oder in geeignete Repo-Struktur außerhalb `docs/` verschieben (z.B. `scripts/` falls es ein Konvertierungs-Helfer ist).

---

## 5. Doppelungen / Konflikte

| Befund | Erläuterung |
|---|---|
| **Audit-Plan-Trio überlappt** | `2026-04-20-audit-fixes.md` (aktiv) ↔ `2026-04-29-codex-audit-fixes.md` (aktiv) ↔ `2026-04-29-frontend-audit-fixes.md` (aktiv) ↔ `2026-04-29-frontend-audit-f3-f5-f7.md` (aktiv) ↔ `done/2026-04-29-holistic-audit-fixes.md` (done). Inhaltlich konsolidiert in ROADMAP Phase 8 (8.1–8.8) als ✅. Vier Plan-Dateien für faktisch ein-und-dieselbe Audit-Welle. |
| **Freemium-Implementierung doppelt dokumentiert** | `2026-04-20-freemium-implementation.md` (aktiv, Status ⏳ N8N) widerspricht CLAUDE.md Tabelle ("alle ✅, verifiziert 2026-04-23"). Plan ist nicht synchron mit der aktuellen Wahrheitsquelle. |
| **Email-Workflows: 1 done + 1 aktiv** | `done/2026-04-23-email-workflows-cancellation.md` ist abgeschlossen, aber `2026-04-21-email-onboarding.md` ist noch aktiv obwohl die Onboarding-Workflows seit 2026-04-21 in Produktion sind (CLAUDE.md). |
| **Mailbox-Automation: 1 Plan + 1 Spec, beide Telegram** | Telegram-Variante wurde laut ROADMAP 5.11 durch Slack-Sollzustand abgelöst. Beide Files repräsentieren denselben (überholten?) Stand. |
| **Specs vs. Pläne Asymmetrie** | 2 aktive Specs, 4 done-Specs, 17 aktive Pläne, 8 done-Pläne. Pläne werden seltener nach done verschoben als Specs. |

---

## 6. Empfohlene Bulk-Aktion

**Quick Win (1 Commit, kein Code-Risiko):**

1. Verschiebe folgende **13 Pläne** nach `docs/superpowers/plans/done/`:
   - `2026-04-20-auth-ux.md`
   - `2026-04-20-freemium-implementation.md` (Status-Tabelle vorher auf 12/12 ✅ aktualisieren)
   - `2026-04-20-staging-environment.md`
   - `2026-04-21-email-onboarding.md`
   - `2026-04-22-checkout-auth-flow.md`
   - `2026-04-23-adressbuecher.md`
   - `2026-04-23-avv.md`
   - `2026-04-23-csv-import.md`
   - `2026-04-23-kundenbereich-datenverwaltung.md`
   - `2026-04-23-legal-ux-quick-wins.md`
   - `2026-04-23-plan-d-rechner-navbar.md`
   - `2026-04-23-tilgungsrechner-modi.md`
   - `2026-04-29-codex-audit-fixes.md`
   - `2026-04-29-frontend-audit-fixes.md`
   - `2026-04-29-frontend-audit-f3-f5-f7.md`
   - `2026-04-20-audit-fixes.md` (von Holistic-Audit ersetzt)
   *(= 16 Stück)*

2. Verschiebe **1 Spec** nach `docs/superpowers/specs/done/`:
   - `2026-04-22-kundenbereich-design.md`

3. **Jens-Entscheidung** zu Mailbox-Automation (1 Plan + 1 Spec):
   - Falls Telegram-Bot je produktiv lief → beide nach `done/`.
   - Falls nie deployed/durch Slack-Ziel ersetzt → beide nach `docs/archive/superpowers/`.

4. **`docs/legal-review/_convert.js` verschieben** (CLAUDE.md erlaubt diesen Ordner nicht). Vorschlag: nach `scripts/legal-review/` oder ins Archiv.

**Ergebnis:** Von 17 aktiven Plänen → **0 echte aktive Pläne** (oder 0–2 falls Mailbox-Automation als ACTIVE deklariert wird). Wieder im Rahmen der CLAUDE.md-Regel "max. 5 aktive Pläne".

**Mittelfristig:** Neue Pläne für aktuell offene Roadmap-Items erst dann anlegen, wenn die Arbeit beginnt — nicht prophylaktisch. Aktuell offen laut ROADMAP:
- Phase 5.11 (E-Mail → Slack)
- Phase 7.1 (robots.txt + noindex für Public Launch)
- Phase 7.2 (GEO/LLM-Crawler + JSON-LD)
- Phase 7.3 (SEO-Landingpages-Recherche)
- Phase 5.6 (URL-basierter Fall-Import, 💡 nice-to-have)

→ Hier ist Platz für 4 echte aktive Pläne, sobald sie tatsächlich anstehen.
