# Fordify Frontend-Audit vom 29.04.2026

## Ziel und Umfang

Ganzheitlicher Review des aktuellen Stands auf Branch `staging` mit Fokus auf:

- HTML, CSS und Vanilla-JS der öffentlichen Seiten und Haupt-SPA
- Security-Hardening im Browserkontext
- Accessibility und Tastatur-/Screenreader-Basics
- Responsivität per Desktop- und Mobile-Screenshots
- PDF-Export der Forderungsaufstellung und ZV-Formular-Export
- Plan-/Feature-Gates im Kundenbereich
- Abgleich zu Dokumentation und Produktversprechen

Nicht live geprüft wurden echte Supabase-, Paddle- und N8N-Flows gegen Produktionsdaten. Die Bewertung dieser Pfade basiert auf statischer Codeanalyse und den vorhandenen Schema-/Function-Dateien.

## Methodik

- `node --check` über alle nicht-minifizierten Dateien in `frontend/js/`
- Lokaler HTTP-Server für `frontend/` und Statusprüfung aller wichtigen `.html`-Seiten
- Headless-Chrome-Screenshots für Desktop `1440x1200` und Mobile `390x1200`
- Statische HTML-Prüfung auf fehlende Assets, doppelte IDs, fehlende Labels und fehlende Alt-Texte
- Manuelle Codeprüfung von Auth, Gates, Konto, Storage, Export, Print/PDF, ZV und Service Worker

Artefakte: Screenshots liegen lokal unter `.playwright-mcp/frontend-audit-2026-04-29/` und sind absichtlich nicht versioniert.

## Nachprüfung der bisherigen Review-Findings

| Finding | Status | Bewertung |
|---|---|---|
| Extra `}` in `frontend/js/app.js` | Behoben | `node --check frontend/js/app.js` ist wieder erfolgreich. |
| Paddle-Upsert ohne Unique Constraint | Teilweise behoben, Risiko bleibt | Es gibt jetzt einen partiellen Unique Index, aber PostgREST-`upsert(..., { onConflict: 'paddle_subscription_id' })` kann dafür weiterhin einen vollwertigen Unique/Exclusion-Constraint benötigen. Siehe Finding 1. |
| §367-Reihenfolge | Funktional behoben | Standardpfad verrechnet jetzt Kosten, Zinsen, HF. Kommentare sind teils noch veraltet. |
| Grace Period verliert Cloud-Zugriff | Behoben | `auth.js` setzt für aktive Grace Period wieder `hasSubscription=true`. |
| Konto lehnt Grace Period ab | Behoben | `konto.js` akzeptiert gekündigte Nutzer innerhalb `grace_period_end`. |
| Stale `tests/`-Doku | Offen | `AGENTS.md` und `CLAUDE.md` listen `tests/` weiterhin als aktive Struktur. |

## Findings

### Finding 1 - P0: Paddle-Upsert ist mit partiellem Unique Index wahrscheinlich weiter nicht robust

`supabase/functions/paddle-webhook/index.ts:54-64` nutzt `upsert(..., { onConflict: 'paddle_subscription_id' })`. In `supabase/schema.sql:121-127` wurde dafür ein partieller Unique Index `WHERE paddle_subscription_id IS NOT NULL` ergänzt. PostgreSQL kann partielle Unique Indexes für `ON CONFLICT (col)` nur dann sicher inferieren, wenn das Conflict Target die passende Predicate ausdrückt. PostgRESTs `on_conflict=paddle_subscription_id` bildet diese Predicate nicht ab. Ergebnis: Webhooks können je nach Supabase/PostgREST-SQL weiterhin mit "no unique or exclusion constraint matching" scheitern.

Empfehlung: Vollwertigen Unique Constraint/Index auf `paddle_subscription_id` verwenden oder die Upsert-Logik auf explizites Select/Update/Insert beziehungsweise RPC umstellen.

### Finding 2 - P1: User-Daten werden in der PDF-/Print-Vorschau ungeescaped per `innerHTML` gerendert

`frontend/js/app.js:1653-1696` interpoliert `fall.forderungsgrundKat`, `fall.titelArt`, `fall.titelGericht`, `fall.titelAz`, `fall.mandant`, `fall.gegner` und `fall.aktenzeichen` direkt in HTML. `drucken()` übernimmt später `vorschauEl.innerHTML` in ein Popup. Damit können importierte oder eingegebene Falldaten HTML/Script in der App-Origin ausführen.

Empfehlung: Alle Nutzerfelder vor HTML-Interpolation zentral escapen oder DOM-Nodes mit `textContent` bauen. Danach PDF-/Print- und Importpfade testen.

### Finding 3 - P1: Mobile Layouts clippen zentrale Inhalte horizontal

Die Headless-Chrome-Screenshots bei `390x1200` zeigen auf mehreren Seiten rechts abgeschnittenen Inhalt:

- `index.html`: Hero-Headline, Feature-Card und CTA-Bereich
- `preise.html`: Hero-Headline und Pricing-Cards
- `forderungsaufstellung.html`: Banner, Selects und Profil-/Logo-Bereiche
- `zinsrechner.html`, `rvg-rechner.html`: Hero-Texte, Stats und CTA-Boxen

Relevante CSS-Stellen sind unter anderem die Mobile-Gutter-Regeln in `frontend/css/app.css:2020-2034` und `frontend/css/rechner.css:854-871` sowie mehrere `white-space: nowrap`/Mindestbreiten in Hero- und Chip-Komponenten.

Empfehlung: Systematisch gegen horizontales Overflow testen (`document.documentElement.scrollWidth <= innerWidth`) und die Mobile-Container, Chips, CTA-Buttons und Pricing-Cards auf flexible Breiten/Umbruch korrigieren.

### Finding 4 - P1: Schuldner-Beispiel-CSV ist semikolonbasiert, Parser akzeptiert aber nur Kommas

`frontend/data/beispiel-schuldner.csv` ist semikolongetrennt. Der gemeinsame CSV-Splitter in `frontend/js/konto.js:1032-1041` trennt ausschließlich bei `,`. Der Schuldnerimport in `frontend/js/konto.js:1155-1176` nutzt genau diesen Splitter. Damit schlägt der naheliegende Import der bereitgestellten Beispiel-CSV fehl oder erkennt die Header nicht korrekt.

Empfehlung: Delimiter auto-erkennen oder explizit `;` und `,` unterstützen. Danach Beispiel-CSV als Regressionstest verwenden.

### Finding 5 - P2: CSV-/Excel-Exports sind anfällig für Spreadsheet Formula Injection

`frontend/js/app.js:307-308` und `frontend/js/konto.js:1140-1147` quoten CSV-Zellen, neutralisieren aber keine Werte, die mit `=`, `+`, `-`, `@` oder Tab beginnen. Namen, Aktenzeichen und Beschreibungen können so beim Öffnen in Excel/LibreOffice als Formeln interpretiert werden.

Empfehlung: Exportwerte vor dem Quoting mit einem führenden Apostroph oder einer vergleichbaren CSV-Schutzfunktion neutralisieren.

### Finding 6 - P2: Offline-PWA-Cache enthält ZV-PDF, aber nicht `pdf-lib.min.js`

`frontend/sw.js:38` cached `/data/zv_formular.pdf`. Der ZV-Export lädt aber in `frontend/js/app.js:2749-2756` zusätzlich `/js/pdf-lib.min.js` lazy nach. Diese Datei fehlt in der `ASSETS`-Liste. Offline oder nach Cache-Only-Situationen kann das ZV-Formular daher trotz gecachtem PDF nicht erzeugt werden. Zusätzlich wird `css/fonts.css` auf allen Seiten geladen, aber ebenfalls nicht im Service Worker gecached.

Empfehlung: `pdf-lib.min.js` und `css/fonts.css` in den Service-Worker-Asset-Cache aufnehmen und die SW-Version konsistent dokumentieren.

### Finding 7 - P2: Accessibility-Basics fehlen bei Modals und mehreren Formularfeldern

Viele Bootstrap-Close-Buttons haben keinen zugänglichen Namen, z.B. `frontend/forderungsaufstellung.html:709`, `:790`, `:818`, `frontend/konto.html:384`, `frontend/preise.html:389` und entsprechende Login-Modals auf weiteren Seiten. Zusätzlich sind wichtige Eingabefelder nur über Placeholder beschriftet, z.B. `frontend/konto.html:253`, `:303` und ZV-Vorschau-/GV-Felder in `frontend/forderungsaufstellung.html:719-742`.

Empfehlung: Close-Buttons mit `aria-label="Schließen"` versehen und Formularfelder mit sichtbaren Labels oder `aria-label`/`aria-labelledby` ausstatten.

### Finding 8 - P2: Dokumentation und Kommentare sind nach den Fixes wieder inkonsistent

- `AGENTS.md:111` und `CLAUDE.md:111` dokumentieren weiterhin `tests/`, obwohl der Ordner entfernt wurde.
- `AGENTS.md:70` und `docs/SYSTEM.md:48/360` nennen `fordify-v169`/`staging-v124`, während `frontend/sw.js:5` bereits `fordify-v171`/`fordify-staging-v126` enthält.
- `frontend/js/app.js:1736` und der Kommentarblock um die Zahlungsverarbeitung beschreiben noch die alte §367-Reihenfolge, obwohl der Standardpfad inzwischen korrekt Kosten, Zinsen, HF nutzt.

Empfehlung: Doku und Kommentare in einem kleinen Hygiene-Commit synchronisieren, damit spätere Agenten nicht wieder falsche Annahmen übernehmen.

## Weitere Beobachtungen

- Alle explizit geprüften HTML-Seiten liefern lokal mit `.html` den Status 200.
- Keine fehlenden lokalen Assets in der statischen HTML-Prüfung gefunden.
- Keine doppelten IDs innerhalb der geprüften Einzelseiten gefunden.
- Plantrennung wirkt nach den Grace-Period-Fixes grundsätzlich plausibel: Pro-/Business-Gates laufen über `requiresPaid()` und `requiresBusiness()`. Kritisch bleibt, dass Produkttexte, Roadmap und tatsächliche CSV-Exportspalten nicht vollständig deckungsgleich sind.
- `kontoFaelleExportierenAlsCSV()` exportiert aktuell `Aktenzeichen`, `Name`, `Mandant`, `Geändert`, `Gesamtforderung_EUR`; die Roadmap beschreibt andere Spalten inklusive Restforderung/Status. Das ist eher Produkt-/Doku-Abgleich als Laufzeitfehler.

## Empfohlene Reihenfolge

1. Paddle-Upsert final absichern.
2. XSS/HTML-Escaping in PDF-/Print-Vorschau korrigieren.
3. Mobile Overflow auf allen Hauptseiten beheben und per Screenshot/ScrollWidth-Test verifizieren.
4. CSV-Import/Export härten: Delimiter, Beispiel-CSV, Formula-Injection.
5. ZV/PWA-Cache vervollständigen.
6. Accessibility-Basics nachziehen.
7. Doku, Kommentare und Produktversprechen synchronisieren.

