# Codex Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle 7 verifizierten Befunde aus dem Codex-Audit vom 2026-04-28 beheben — 2× P0, 3× P1, 2× P2.

**Architecture:** Reine Frontend-SPA (Vanilla JS, kein Build-Schritt). Fixes direkt in Quelldateien, Supabase-Migration als SQL-Statement. Kein Testframework vorhanden — Verifikation via `node --check` (Syntax), manuelle Browser-Tests und gezielte Assertions.

**Tech Stack:** Vanilla JS, Bootstrap 5.3, Supabase (PostgREST), GitHub Actions (FTP-Deploy)

---

## Reihenfolge & Abhängigkeiten

```
Task 1 (Syntax P0)          → unabhängig, sofort
Task 2 (CI Syntaxcheck)     → nach Task 1
Task 3 (§ 367 BGB)          → unabhängig
Task 4 (Grace auth.js)      → vor Task 5
Task 5 (Grace konto.js)     → nach Task 4
Task 6 (Escaping)           → unabhängig
Task 7 (Supabase UNIQUE)    → unabhängig, Deploy-Schritt nötig
Task 8 (Docs tests/)        → unabhängig
```

---

## Betroffene Dateien

| Datei | Tasks | Änderung |
|---|---|---|
| `frontend/js/app.js` | 1, 3, 6 | Stray `}` entfernen; baueSummaryTabelle Reihenfolge + Kommentar; escaping `e()` + safeHref() |
| `frontend/js/verrechnung.js` | 3 | VERRECHNUNG_REIHENFOLGE + Kommentar-Header |
| `frontend/js/auth.js` | 4 | fordifyAuth + ladeSubscriptionStatus() Grace-Period-Zweig |
| `frontend/js/konto.js` | 5 | _pruefeAbo() SELECT + Grace-Period-Zweig + Banner |
| `supabase/schema.sql` | 7 | UNIQUE-Constraint + Migration-Block |
| `.github/workflows/deploy.yml` | 2 | node --check Schritt |
| `.github/workflows/deploy-staging.yml` | 2 | node --check Schritt |
| `AGENTS.md` | 8 | tests/-Zeile entfernen |
| `CLAUDE.md` | 8 | tests/-Zeile entfernen |

---

## Task 1: P0 – Stray `}` in app.js entfernen

**Datei:** `frontend/js/app.js:2808`

**Problem:** Zeile 2808 enthält eine überzählige schließende Klammer direkt nach `fallNotizenSpeichern()`. Das verhindert das Parsen der gesamten Datei — die Haupt-SPA startet nicht.

```
2802: function fallNotizenSpeichern() {
2803:   const el = document.getElementById('inp-fall-notes');
2804:   if (!el) return;
2805:   state.fall.notes = el.value;
2806:   speichern();
2807: }
2808: }   ← diese Zeile löschen
```

- [ ] **Schritt 1:** Zeile 2808 (`}`) in `frontend/js/app.js` löschen.

- [ ] **Schritt 2:** Syntax prüfen:
```bash
node --check frontend/js/app.js && echo "OK"
```
Erwartetes Ergebnis: `OK`

- [ ] **Schritt 3:** Commit & Push:
```bash
git add frontend/js/app.js
git commit -m "fix: überzählige schließende Klammer in app.js:2808 entfernt (SyntaxError)"
git push origin staging && git push origin staging:main
```

---

## Task 2: P0-Prävention – node --check in CI

**Dateien:** `.github/workflows/deploy.yml`, `.github/workflows/deploy-staging.yml`

Verhindert, dass ein Syntax-Fehler wie Task 1 unbemerkt auf Prod landet.

- [ ] **Schritt 1:** In **beiden** Workflow-Dateien einen `node --check`-Schritt **vor** dem Deploy einfügen.

`deploy.yml` — nach dem `Checkout`-Step, vor dem FTP-Step:
```yaml
      - name: JS Syntax Check
        run: |
          node --check frontend/js/app.js
          node --check frontend/js/auth.js
          node --check frontend/js/konto.js
          node --check frontend/js/storage.js
          node --check frontend/js/gates.js
          node --check frontend/js/verrechnung.js
          node --check frontend/js/zinsen.js
          node --check frontend/js/rvg.js
```

Gleicher Block in `deploy-staging.yml`.

- [ ] **Schritt 2:** Prüfen ob `node` in `ubuntu-latest` verfügbar ist (es ist standardmäßig vorinstalliert – kein Setup-Schritt nötig).

- [ ] **Schritt 3:** Commit & Push:
```bash
git add .github/workflows/deploy.yml .github/workflows/deploy-staging.yml
git commit -m "ci: JS-Syntaxcheck vor jedem Deploy (node --check)"
git push origin staging && git push origin staging:main
```

---

## Task 3: P1 – § 367 BGB Verrechnungsreihenfolge korrigieren

**Dateien:** `frontend/js/verrechnung.js`, `frontend/js/app.js`

**Problem:** Beide Dateien verrechnen Zahlungen in der Reihenfolge Zinsen → Kosten → HF. Korrekt nach § 367 Abs. 1 BGB ist: **Kosten → Zinsen → Hauptforderung**.

Pikant: Der UI-Hilfstext in `app.js:1490` erklärt dem Nutzer bereits die korrekte Reihenfolge — die Berechnung widerspricht ihr.

### 3a: verrechnung.js

- [ ] **Schritt 1:** `VERRECHNUNG_REIHENFOLGE` und Kommentar-Header in `frontend/js/verrechnung.js` korrigieren.

Alter Kommentar-Header (Zeile 3):
```javascript
// Reihenfolge: Zinsen → unverzinsliche Kosten → Hauptforderung
```
Neu:
```javascript
// Reihenfolge nach § 367 Abs. 1 BGB: Kosten → Zinsen → Hauptforderung
```

Alte `VERRECHNUNG_REIHENFOLGE` (Zeilen 9–15):
```javascript
const VERRECHNUNG_REIHENFOLGE = [
  "zinsen_hauptsache",
  "zinsen_kosten",
  "unverzinsliche_kosten",
  "verzinsliche_kosten",
  "hauptforderung",
];
```
Neu:
```javascript
const VERRECHNUNG_REIHENFOLGE = [
  "unverzinsliche_kosten",   // § 367 Abs. 1 BGB: zunächst Kosten
  "verzinsliche_kosten",
  "zinsen_hauptsache",       // dann Zinsen
  "zinsen_kosten",
  "hauptforderung",          // zuletzt Hauptforderung
];
```

- [ ] **Schritt 2:** Syntaxcheck:
```bash
node --check frontend/js/verrechnung.js && echo "OK"
```

### 3b: app.js – baueSummaryTabelle

`baueSummaryTabelle()` in app.js hat eine eigene Verrechnungslogik (unabhängig von verrechnung.js). Sie enthält **zwei** Stellen mit falscher Reihenfolge:

**Stelle A (Zeilen 1930–1935)** — Restbetrag nach Tilgungsbestimmung:
```javascript
// ALT:
verrechneAufEntry(zinsenGeordnet, zahlLabel);
verrechneAufEntry(kostenEntries, zahlLabel);
verrechneAufEntry(hfEntries, zahlLabel);

// NEU:
verrechneAufEntry(kostenEntries, zahlLabel);
verrechneAufEntry(zinsenGeordnet, zahlLabel);
verrechneAufEntry(hfEntries, zahlLabel);
```

**Stelle B (Zeilen 1937–1940)** — Standard § 367 BGB:
```javascript
// ALT:
// Standard § 367 BGB: Zinsen → Kosten → HF (älteste zuerst)
verrechneAufEntry(zinsenGeordnet, zahlLabel);
verrechneAufEntry(kostenEntries, zahlLabel);
verrechneAufEntry(hfEntries, zahlLabel);

// NEU:
// Standard § 367 BGB: Kosten → Zinsen → HF (älteste zuerst)
verrechneAufEntry(kostenEntries, zahlLabel);
verrechneAufEntry(zinsenGeordnet, zahlLabel);
verrechneAufEntry(hfEntries, zahlLabel);
```

- [ ] **Schritt 3:** Beide Stellen in `frontend/js/app.js` korrigieren (Zeilen 1933–1935 und 1937–1940).

- [ ] **Schritt 4:** Syntaxcheck:
```bash
node --check frontend/js/app.js && echo "OK"
```

- [ ] **Schritt 5:** Manuell verifizieren im Browser (staging.fordify.de):
  - Fall mit Hauptforderung + Zinsen + Kosten (z.B. Anwaltsvergütung) anlegen
  - Teilzahlung hinzufügen, die Zinsen + Kosten deckt, aber nicht die HF
  - In der Zusammenfassung prüfen: Kosten werden zuerst verrechnet, dann Zinsen

- [ ] **Schritt 6:** Commit & Push:
```bash
git add frontend/js/verrechnung.js frontend/js/app.js
git commit -m "fix: § 367 BGB Verrechnungsreihenfolge korrigiert – Kosten vor Zinsen"
git push origin staging && git push origin staging:main
```

---

## Task 4: P1 – Grace Period in auth.js korrekt modellieren

**Datei:** `frontend/js/auth.js`

**Problem:** `ladeSubscriptionStatus()` setzt für Grace-Period-Nutzer `hasSubscription=false` und `plan='free'`. StorageBackend fällt dadurch auf sessionStorage zurück — Cloud-Daten nicht abrufbar.

**Fix:** Grace-Period-Nutzer behalten `hasSubscription=true` und ihren Plan, bekommen zusätzlich `isGracePeriod=true`.

- [ ] **Schritt 1:** `fordifyAuth`-Objekt um `isGracePeriod` erweitern (Zeilen 9–15):

```javascript
const fordifyAuth = {
  isAuthenticated: false,
  hasSubscription: false,
  user: null,
  plan: 'free',
  gracePeriodEnd: null,
  isGracePeriod: false,
};
```

- [ ] **Schritt 2:** Grace-Period-Zweig in `ladeSubscriptionStatus()` (Zeilen 38–42) korrigieren:

```javascript
// ALT:
} else if (data && data.status === 'canceled' && data.grace_period_end &&
           new Date(data.grace_period_end) > new Date()) {
  fordifyAuth.hasSubscription = false;
  fordifyAuth.plan = 'free';
  fordifyAuth.gracePeriodEnd = new Date(data.grace_period_end);
}

// NEU:
} else if (data && data.status === 'canceled' && data.grace_period_end &&
           new Date(data.grace_period_end) > new Date()) {
  fordifyAuth.hasSubscription = true;          // Cloud-Zugriff für Datenexport
  fordifyAuth.plan = data.plan;                // Plan beibehalten (pro/business)
  fordifyAuth.gracePeriodEnd = new Date(data.grace_period_end);
  fordifyAuth.isGracePeriod = true;
}
```

- [ ] **Schritt 3:** Sicherstellen, dass `isGracePeriod` im `else`-Zweig (kein Abo) auf `false` bleibt — der bestehende `else`-Block setzt nur `hasSubscription`, `plan` und `gracePeriodEnd`, der neue Default `isGracePeriod: false` auf dem Objekt reicht.

- [ ] **Schritt 4:** Syntaxcheck:
```bash
node --check frontend/js/auth.js && echo "OK"
```

- [ ] **Schritt 5:** Commit (noch kein Push — Task 5 folgt im gleichen Bereich):
```bash
git add frontend/js/auth.js
git commit -m "fix: Grace-Period-Nutzer behalten Cloud-Zugriff (hasSubscription=true, isGracePeriod=true)"
```

---

## Task 5: P1 – Grace Period in konto.js + Banner

**Datei:** `frontend/js/konto.js`

**Problem:** `_pruefeAbo()` prüft nur `status === 'active'`. Grace-Period-Nutzer (`status='canceled'` + aktives `grace_period_end`) werden nicht erkannt → Redirect nach `/preise`. Außerdem fehlt `grace_period_end` im SELECT.

### 5a: _pruefeAbo() reparieren

- [ ] **Schritt 1:** `_pruefeAbo()` (Zeilen 88–100) anpassen — SELECT erweitern und Grace-Period-Zweig hinzufügen:

```javascript
async function _pruefeAbo(userId, accessToken) {
  const res = await fetch(
    `${CONFIG.supabase.url}/rest/v1/subscriptions?user_id=eq.${userId}&select=status,plan,grace_period_end`,
    { headers: { 'apikey': CONFIG.supabase.anonKey, 'Authorization': `Bearer ${accessToken}` } }
  );
  if (!res.ok) return;
  const rows = await res.json();
  const row = rows?.[0];
  if (row?.status === 'active') {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = row.plan;
  } else if (row?.status === 'canceled' && row?.grace_period_end &&
             new Date(row.grace_period_end) > new Date()) {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = row.plan;
    fordifyAuth.isGracePeriod = true;
    fordifyAuth.gracePeriodEnd = new Date(row.grace_period_end);
  }
}
```

### 5b: Grace-Period-Banner

- [ ] **Schritt 2:** Neue Funktion `_zeigGracePeriodBanner()` in `konto.js` hinzufügen (nach `_kontoUpdateHero`-Definition, ca. Zeile 159):

```javascript
function _zeigGracePeriodBanner() {
  if (!fordifyAuth.isGracePeriod || !fordifyAuth.gracePeriodEnd) return;
  const bis = fordifyAuth.gracePeriodEnd.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const banner = document.createElement('div');
  banner.className = 'alert alert-warning alert-dismissible fade show mx-3 mt-3';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <strong>Abo gekündigt.</strong> Du hast noch bis zum <strong>${bis}</strong> Zugriff auf deine Daten.
    Jetzt <a href="/preise" class="alert-link">erneut abonnieren</a> oder Daten exportieren.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Schließen"></button>`;
  const content = document.getElementById('konto-content');
  if (content) content.prepend(banner);
}
```

- [ ] **Schritt 3:** `_zeigGracePeriodBanner()` im DOMContentLoaded-Handler aufrufen — direkt nach `aktualisiereUIFuerAuth()` (Zeile 138):

```javascript
    aktualisiereUIFuerAuth();
    _zeigGracePeriodBanner();   // ← neue Zeile
    _kontoUpdateHero();
```

- [ ] **Schritt 4:** Syntaxcheck:
```bash
node --check frontend/js/konto.js && echo "OK"
```

- [ ] **Schritt 5:** Manuell verifizieren: Mit einem Test-Account der sich im Grace-Period-Status befindet (oder Status manuell in Supabase auf `canceled` + `grace_period_end` in der Zukunft setzen) konto.html aufrufen → kein Redirect, Banner sichtbar, Daten ladbar.

- [ ] **Schritt 6:** Commit & Push:
```bash
git add frontend/js/konto.js
git commit -m "fix: Grace-Period-Nutzer können Konto-Seite nutzen und Daten exportieren"
git push origin staging && git push origin staging:main
```

---

## Task 6: P2 – HTML-Attribut-Escaping in app.js härten

**Datei:** `frontend/js/app.js:2308`

**Problem:** `e()` escaped `"` und `'` nicht. URL-Werte aus Nutzer-Einstellungen werden direkt in `href="..."` eingesetzt. Kein URL-Schema-Check.

- [ ] **Schritt 1:** `e()` um Anführungszeichen erweitern und neue `safeHref()`-Funktion hinzufügen (ab Zeile 2308):

```javascript
// ALT:
function e(s) { return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// NEU:
function e(s) {
  return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function safeHref(url) {
  const u = (url || "").trim();
  if (!/^(https?:|mailto:)/i.test(u)) return "#";
  return u.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
}
```

- [ ] **Schritt 2:** `href`-Nutzungen auf `safeHref()` umstellen.

Zeile ~2320 (Website-Link):
```javascript
// ALT:
if (imp.website) zeile1.push(`<a href="${e(imp.website)}" target="_blank" rel="noopener noreferrer" class="imp-link">${e(imp.website.replace(/^https?:\/\//, ""))}</a>`);

// NEU:
if (imp.website) zeile1.push(`<a href="${safeHref(imp.website)}" target="_blank" rel="noopener noreferrer" class="imp-link">${e(imp.website.replace(/^https?:\/\//, ""))}</a>`);
```

Zeile ~2320 (E-Mail-Link):
```javascript
// ALT:
if (imp.email) zeile1.push(`E-Mail: <a href="mailto:${e(imp.email)}" class="imp-link">${e(imp.email)}</a>`);

// NEU:
if (imp.email) zeile1.push(`E-Mail: <a href="${safeHref("mailto:" + imp.email)}" class="imp-link">${e(imp.email)}</a>`);
```

- [ ] **Schritt 3:** Syntaxcheck:
```bash
node --check frontend/js/app.js && echo "OK"
```

- [ ] **Schritt 4:** Commit & Push:
```bash
git add frontend/js/app.js
git commit -m "fix: href-Attribut-Escaping gehärtet, URL-Schema-Validierung in safeHref()"
git push origin staging && git push origin staging:main
```

---

## Task 7: P0 – Supabase UNIQUE Constraint für paddle_subscription_id

**Datei:** `supabase/schema.sql`

**Problem:** `paddle_subscription_id` in der `subscriptions`-Tabelle hat keinen UNIQUE-Constraint. Der Paddle-Webhook nutzt `upsert(..., { onConflict: 'paddle_subscription_id' })` — ohne Constraint kann PostgREST den Upsert nicht auflösen, neue Abonnements werden ggf. nicht aktiviert.

**Achtung:** Migration muss manuell im Supabase Dashboard ausgeführt werden (kein automatisches DB-Deployment).

- [ ] **Schritt 1:** Migration-Block in `supabase/schema.sql` anhängen:

```sql
-- Migration 2026-04-29: UNIQUE-Constraint für paddle_subscription_id
-- Supabase Dashboard → SQL Editor → New Query → Run
-- Partial unique index: erlaubt mehrere NULL-Werte (Nutzer ohne Paddle-Sub),
-- erzwingt aber Eindeutigkeit bei vorhandenen IDs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id_unique
  ON subscriptions (paddle_subscription_id)
  WHERE paddle_subscription_id IS NOT NULL;
```

- [ ] **Schritt 2:** SQL im Supabase Dashboard ausführen:
  - URL: `https://supabase.com/dashboard/project/dswhllvtewtqpiqnpbsu/sql`
  - Obiges SQL einfügen → Run
  - Erwartete Ausgabe: `Success. No rows returned.`

- [ ] **Schritt 3:** Index verifizieren:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'subscriptions'
  AND indexname = 'idx_subscriptions_paddle_subscription_id_unique';
```
Erwartung: 1 Zeile mit dem Indexnamen.

- [ ] **Schritt 4:** schema.sql committen & pushen:
```bash
git add supabase/schema.sql
git commit -m "fix: UNIQUE partial index auf subscriptions.paddle_subscription_id (Webhook-Upsert)"
git push origin staging && git push origin staging:main
```

---

## Task 8: P2 – tests/-Referenzen aus Projektdokumenten entfernen

**Dateien:** `AGENTS.md`, `CLAUDE.md`

Beide Dateien enthalten in ihrer Projektstruktur-Sektion die Zeile:
```
└── tests/                      ← Python-Tests für Berechnungslogik
```
Das Verzeichnis wurde in Commit b4535c9 gelöscht. Die Referenz ist stale und irreführend.

- [ ] **Schritt 1:** In `AGENTS.md` die Zeile `└── tests/ ...` entfernen.

- [ ] **Schritt 2:** In `CLAUDE.md` die Zeile `└── tests/ ...` entfernen.

- [ ] **Schritt 3:** Commit & Push:
```bash
git add AGENTS.md CLAUDE.md
git commit -m "docs: tests/-Referenz aus AGENTS.md und CLAUDE.md entfernt (Verzeichnis gelöscht)"
git push origin staging && git push origin staging:main
```

---

## Self-Review

**Spec-Abdeckung:**
- P0 Syntax app.js → Task 1 ✅
- P0 CI-Prevention → Task 2 ✅
- P0 Supabase UNIQUE → Task 7 ✅
- P1 § 367 BGB → Task 3 ✅
- P1 Grace auth.js → Task 4 ✅
- P1 Grace konto.js → Task 5 ✅
- P2 Escaping → Task 6 ✅
- P2 Docs tests/ → Task 8 ✅

**Placeholder-Scan:** Kein TBD, kein "implement later", kein "add validation" ohne Code. Alle Code-Blöcke vollständig.

**Typ-Konsistenz:** `fordifyAuth.isGracePeriod` in Task 4 eingeführt, in Task 5 genutzt — konsistent. `safeHref()` in Task 6 definiert und direkt genutzt — konsistent.
