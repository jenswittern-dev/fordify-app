# Fordify Code Audit Report

Datum: 2026-04-28
Branch: `staging`
Pruefung: Read-only Code Review nach Claude-Cleanup

## Kurzfazit

Der Audit hat mehrere produktionsrelevante Punkte gefunden. Zwei Befunde sind P0, weil sie entweder die Haupt-App komplett am Parsen hindern oder den Paddle-Webhook fuer Subscription-Aktivierungen blockieren koennen. Drei weitere Befunde betreffen fachlich/rechtlich kritische Zahlungslogik und den Grace-Period-Offboarding-Flow.

## Findings

### P0 - Extra brace breaks the whole app bundle

Datei: `frontend/js/app.js:2808`

`node --check frontend/js/app.js` schlaegt mit `SyntaxError: Unexpected token '}'` fehl. Da `app.js` von `forderungsaufstellung.html` geladen wird, verhindert dieser Syntaxfehler, dass die Haupt-SPA korrekt initialisiert. Betroffen sind u.a. Init-Handler, Rendering, Storage, Exportfunktionen und ZV-Funktionen.

Empfehlung: Ueberzaehlige schliessende Klammer entfernen und anschliessend alle nicht-minifizierten JS-Dateien per `node --check` pruefen.

### P0 - Paddle subscription upsert has no matching unique constraint

Datei: `supabase/functions/paddle-webhook/index.ts:54`

Der Webhook nutzt:

```ts
upsert(..., { onConflict: 'paddle_subscription_id' })
```

In `supabase/schema.sql` ist `paddle_subscription_id` aber nur als `TEXT` definiert, ohne `UNIQUE`-Constraint. Supabase/PostgREST benoetigt fuer `onConflict` einen passenden Unique- oder Exclusion-Constraint. Andernfalls koennen `subscription.created` oder `subscription.updated` beim Upsert fehlschlagen, wodurch zahlende Nutzer ggf. nicht aktiviert werden.

Empfehlung: Migration/Schema um einen Unique-Constraint oder Unique-Index auf `subscriptions.paddle_subscription_id` erweitern. Dabei Null-Werte beachten, z.B. partial unique index, falls mehrere Alt-/Testzeilen ohne Paddle-ID existieren koennen.

### P1 - Section 367 allocation order is reversed

Datei: `frontend/js/app.js:1853`

Die aktive Zusammenfassung verrechnet Zahlungen zuerst auf Zinsen, dann Kosten, dann Hauptforderung. `SYSTEM.md` dokumentiert fuer die Projektlogik aber: Kosten, Zinsen, Hauptforderung. Bei Faellen mit offenen Kosten und Zinsen kann dadurch ein rechtlich/fachlich falscher Restbetrag in Vorschau/PDF entstehen.

Empfehlung: Aktive Verrechnungslogik in `baueSummaryTabelle()` auf Kosten vor Zinsen umstellen oder, falls die fachliche Entscheidung bewusst anders lautet, Dokumentation und UI-Texte konsistent korrigieren. Aufgrund des Produkts sollte die fachliche Reihenfolge vor der Umsetzung nochmals explizit gegen Paragraph 367 BGB validiert werden.

### P1 - Grace-period users can log in but lose cloud access

Datei: `frontend/js/auth.js:38`

`verify-and-login` erlaubt Nutzern mit `status='canceled'` und aktiver `grace_period_end` den Login. Das Frontend setzt dieselben Nutzer danach aber auf `hasSubscription=false` und `plan='free'`. `StorageBackend` nutzt dadurch `sessionStorage` statt `localStorage`/Cloud-Sync, sodass Grace-Period-Nutzer ihre Cloud-Daten nicht zuverlaessig laden/exportieren koennen.

Empfehlung: Grace Period als eigene berechtigte Zugriffsstufe behandeln, z.B. `hasSubscription=true` plus `plan` beibehalten oder ein explizites `hasCloudAccess` einfuehren. Storage/Gates muessen danach klar unterscheiden zwischen "darf Daten exportieren" und "hat aktives bezahltes Abo".

### P1 - Konto page rejects grace-period users

Datei: `frontend/js/konto.js:88`

`konto.html` prueft eigenstaendig den Subscription-Status und akzeptiert nur `status === 'active'`. Nutzer in aktiver Grace Period werden nach `/preise` umgeleitet. Das widerspricht dem Offboarding-Flow, in dem gekuendigte Nutzer sich waehrend der Grace Period anmelden und Daten exportieren koennen sollen.

Empfehlung: `_pruefeAbo()` um `grace_period_end` erweitern und aktive Grace-Period-Nutzer in den Kundenbereich lassen. UI sollte dabei klar anzeigen, dass das Abo beendet ist und Datenexport nur bis zum Grace-Period-Ende moeglich ist.

### P2 - User-controlled URLs are not attribute-escaped

Datei: `frontend/js/app.js:2308`

Die Funktion `e()` escaped `&`, `<` und `>`, aber keine Anfuehrungszeichen. Die Werte werden anschliessend in `href="..."` eingesetzt. Importierte Einstellungen oder gespeicherte Profilwerte koennen dadurch HTML-Attribute aufbrechen.

Empfehlung: Fuer Attribute zusaetzlich `"` und `'` escapen oder Links per DOM API bauen. URL-Schemata sollten auf `https:`, `http:` und `mailto:` begrenzt werden.

### P2 - Cleanup left stale project structure docs

Datei: `AGENTS.md:111`, `CLAUDE.md:111`

Claude hat das tote `tests/`-Verzeichnis entfernt, aber `AGENTS.md` und `CLAUDE.md` dokumentieren es weiterhin als aktive Projektstruktur. Das fuehrt kuenftige Agents und Entwickler in die Irre.

Empfehlung: Projektstruktur in beiden Dateien aktualisieren und die Teststrategie neu dokumentieren, z.B. als offene Luecke oder als geplante JS-basierte Tests.

## Verifikation

Durchgefuehrt:

- `git status --short --branch`
- gezielte `rg`-Suchen nach Doku-/Schema-/Workflow-Inkonsistenzen
- Review von `app.js`, `zinsen.js`, `verrechnung.js`, `rvg.js`, `auth.js`, `storage.js`, `konto.js`, `gates.js`
- Review von `supabase/schema.sql`, `supabase/rls.sql`, `paddle-webhook`, `verify-and-login`
- `node --check` fuer zentrale JavaScript-Dateien

Ergebnis:

- `frontend/js/app.js` parst nicht.
- `frontend/js/konto.js`, `frontend/js/auth.js`, `frontend/js/zinsen.js`, `frontend/js/rvg.js` und `frontend/js/verrechnung.js` parsen.

## Weitere Beobachtungen

- SEO ist aktuell bewusst blockiert: `frontend/robots.txt` enthaelt `Disallow: /`, und oeffentliche Seiten haben `noindex`. Das passt zur offenen Roadmap-Phase 7 und wurde nicht als Defekt gewertet.
- Nach Entfernung der Python-Tests gibt es derzeit keine aktive automatisierte Testabdeckung fuer die rechtlich kritische Berechnungslogik.

## Empfohlene Fix-Reihenfolge

1. P0 Syntaxfehler in `app.js` beheben und JS-Syntaxchecks in Deployment/CI aufnehmen.
2. P0 Supabase-Constraint fuer `paddle_subscription_id` ergaenzen.
3. P1 Grace-Period-Flow in `auth.js`, `konto.js`, Storage/Gates sauber modellieren.
4. P1 Verrechnungsreihenfolge fachlich bestaetigen und korrigieren.
5. P2 Escaping/URL-Validierung in Impressum-/Footer-Links haerten.
6. P2 AGENTS/CLAUDE-Doku und Teststrategie aktualisieren.
