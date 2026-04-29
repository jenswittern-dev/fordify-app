# Fordify Holistic Website- und App-Audit vom 29.04.2026

## Kontext

Dieser Audit wurde nach den Claude-Code-Fixes auf Branch `staging` durchgeführt. Ziel war nicht nur die Regression der bisherigen Findings, sondern ein breiter Website- und App-Review mit Blick auf kleinste technische, visuelle, fachliche und UX-Details.

## Prüfplan

1. Fix-Regression der bisherigen P0/P1/P2-Findings
2. Statische Prüfung von JavaScript, HTML, CSS, Service Worker und Dokumentation
3. Security-Review für DOM-XSS, Attribut-Injection, CSV-Injection, externe Links, Importpfade und Cloud-/Webhook-Logik
4. Accessibility-Basics: Labels, Close-Buttons, Tastatur-/Screenreader-Namen, sichtbare Semantik
5. Responsiver Visual-Pass mit Headless-Chrome-Screenshots auf Desktop, Tablet, Mobile und Narrow Mobile
6. Kernflows: Haupt-App, Konto, Plan-Gates, Grace Period, Exporte, PDF/Print, ZV-Formular
7. Fachliche Plausibilität: §367-Reihenfolge, Rechner-Parsing, Produktversprechen gegen Implementierung
8. Dokumentations- und Release-Abgleich

## Ausgeführte Prüfungen

- `node --check` über alle nicht-minifizierten Dateien in `frontend/js/`: erfolgreich
- HTTP-Statusprüfung aller 13 HTML-Seiten über lokalen Server: alle expliziten `.html`-Seiten liefern 200
- Browser-Smoke über In-App-Browser: öffentliche Seiten ohne Console-Errors
- Headless-Chrome-Screenshots unter `.playwright-mcp/holistic-audit-2026-04-29/`
- Statische Suche nach `innerHTML`, Import-/Exportpfaden, Feature-Gates, SW-Assets, Doku-Versionen und externen Links

Hinweis: `konto.html` leitet unauthentifiziert nach `/forderungsaufstellung` weiter. Der lokale Python-Server kann diese extensionless Route nicht rewriten und zeigt dort 404. Produktion kann das über Hosting-Rewrites lösen; für lokale QA bleibt es aber ein Signal für die Route-/PWA-Thematik unten.

## Zusatzprüfungen nach den Findings

Aus den ersten Findings ergaben sich mehrere Folgeprüfungen, die im ursprünglichen Auditplan noch nicht explizit genug waren. Diese Nachprüfung zielte auf Beweisbarkeit und Regressionstauglichkeit, nicht nur auf Sichtprüfung.

| Zusatzprüfung | Ergebnis |
|---|---|
| DOM-XSS-Sink-Trace für nutzernahe Daten in `app.js` | Weitere ungeescapte Interpolationen bestätigt: Positionstabelle, Edit-Modale, Summary, explizite Zahlungszeilen und Fehler-/Preview-Bereiche. |
| Headless-Chrome-XSS-PoC mit manipulierten Positionsdaten und importierten Einstellungen | Bestätigt: Payloads in Positions-/Zahlungsbeschreibung feuerten im echten Browser (`xssCount=10`); Logo-Attribut-Payload feuerte ebenfalls (`logoCount=2`). |
| Service-Worker-/Routing-Matrix | Alle 12 gefundenen extensionless Routes fehlen im statischen SW-Asset-Cache. Zusätzlich fehlen `/datenschutz.html` und `/impressum.html` im Cache, obwohl die Seiten existieren. |
| Parser-Edge-Cases für deutsche Zahlenformate | `5.000,00`, `10.000,00` und `1.234.567,89` sind bei Zins/RVG invalid; GKG/Tilgung parsen dieselben Werte korrekt. |
| Roadmap-vs-CSV-Matrix | Roadmap fordert `FallID`, `Name`, `Datum`, `Gesamtforderung`, `Restforderung`, `Status`; Implementierung liefert `Aktenzeichen`, `Name`, `Mandant`, `Geändert`, `Gesamtforderung_EUR`. |
| Globaler Responsive-ScrollWidth-Test per Chrome DevTools | Messbarer Body-Overflow: `tilgungsrechner` bei 360px (+22px), `changelog` bei 768px (+77px), `index` bei 768px (+3px). Andere visuelle Clipping-Hinweise sind nicht immer Body-Overflow. |
| Element-Level-Clipping-Heuristik | Keine generischen `overflow:hidden/clip`-Treffer gefunden; die betroffenen Layouts brauchen daher visuelle/perzeptive Checks und gezielte Komponentenregeln. |

## Regression der bisherigen Findings

| Bereich | Ergebnis |
|---|---|
| JS-Syntaxbruch in `app.js` | Behoben, alle geprüften JS-Dateien bestehen `node --check`. |
| Paddle-Upsert Unique Constraint | Im Schema jetzt mit echtem Unique Constraint ergänzt (`subscriptions_paddle_subscription_id_key`). |
| §367-Reihenfolge | Standardpfad und Kommentare stehen jetzt auf Kosten, Zinsen, Hauptforderung. |
| Grace-Period Cloud-Zugriff | `auth.js` setzt für aktive Grace Period `hasSubscription=true`. |
| Konto Grace Period | `konto.js` akzeptiert gekündigte Nutzer innerhalb `grace_period_end`. |
| Stale `tests/`-Doku | In den letzten Commits offenbar entfernt; kein aktiver `tests/`-Eintrag mehr gefunden. |
| CSV-Semikolon und Formula Injection | Schuldner-CSV erkennt Delimiter; CSV-Export prefixiert Formelwerte. |
| ZV/PWA-Cache | `pdf-lib.min.js` und `css/fonts.css` sind jetzt im SW-Cache. |
| Close-Buttons/Formular-A11y | Close-Buttons haben keine offensichtlichen fehlenden `aria-label`s mehr. |

## Findings

### Finding 1 - P1: DOM-XSS-Fix ist unvollständig; Positionsdaten bleiben in Liste, Modalen und Summary ungeescaped

Claude hat Parteidaten und Forderungsgrund in der PDF-Vorschau escaped, aber nicht alle Nutzerfelder. Positionsbeschreibungen und Zahlungsbeschreibungen fließen weiterhin direkt in `innerHTML`:

- `frontend/js/app.js:780-790`: `positionKurzbeschreibung(pos)` wird als `${beschrStr}` in die Positionstabelle geschrieben.
- `frontend/js/app.js:1272`, `:1514`, `:1560`, `:1586`, `:1617`: bestehende `pos.beschreibung` landet ungeescaped in `value="..."` von Modal-Inputs.
- `frontend/js/app.js:1485`: `pos.verrechnungsanweisung` landet ungeescaped in einer Textarea.
- `frontend/js/app.js:2031-2046`: Zahlungsbeschreibungen aus `alloc.beschreibung` landen in `pay-alloc-label`.
- `frontend/js/app.js:2078-2083`: `bezeichnung` wird direkt in Summary-Zellen geschrieben.
- `frontend/js/app.js:2139-2141`: `z.beschreibung` wird direkt in der expliziten Zahlungszeile gerendert.

Auswirkung: Ein per Eingabe oder JSON-Import gesetzter Wert wie eine manipulierte Beschreibung kann in der Haupt-App und in der Print-/PDF-Vorschau als HTML ausgeführt werden.

Nachprüfung: Ein Headless-Chrome-PoC mit zwei manipulierten Positionen hat die Ausführung im echten Browser bestätigt. Die Payloads wurden in der Positionstabelle und in der Vorschau als `<img onerror=...>` gerendert; der Zähler `window.__fordifyXss` stieg auf `10`.

Empfehlung: Nicht nur einzelne Felder patchen, sondern eine Rendering-Regel einführen: alle Nutzerdaten durch `escHtml()` für Textknoten und eine eigene `escAttr()` für Attribute; alternativ DOM-Nodes mit `textContent` bauen. Anschließend gezielt mit importierten Payloads testen.

### Finding 2 - P1: Importierte Einstellungen können Logo-HTML in der PDF-Vorschau injizieren

`frontend/js/app.js:2471-2498` importiert `fordify_settings` aus JSON und speichert sie ohne Schema-/Typvalidierung. Danach wird `einst.logo` in `frontend/js/app.js:1650-1651` direkt in ein `src`-Attribut interpoliert:

```html
<img class="pdf-logo" src="${einst.logo}" alt="Kanzlei-Logo">
```

Auch `logoPos` wird in eine CSS-Klasse interpoliert. Der reguläre Upload nutzt zwar `FileReader.readAsDataURL()`, aber der JSON-Import kann beliebige Strings setzen.

Nachprüfung: Der gleiche Browser-PoC setzte `fordify_settings.logo` auf einen attributbrechenden String (`x" onerror="...`). Die PDF-Vorschau erzeugte daraus ein ausführbares `<img class="pdf-logo" ... onerror=...>`; `window.__fordifyLogoXss` wurde im echten Browser gesetzt.

Empfehlung: Einstellungen beim Import validieren. `logo` nur als erwartete `data:image/...;base64,...`-URL akzeptieren, `logoPosition` auf `links|mitte|rechts` whitelisten und Attribute getrennt escapen.

### Finding 3 - P1: Mobile/Narrow Layout clippt weiterhin zentrale Inhalte

Der visuelle Pass zeigt weiterhin horizontales Clipping bei `360px` und teils `390px`:

- `index-narrow.png`: Hero-Headline und primäre Feature-Card laufen rechts aus dem Viewport.
- `preise-narrow.png`: Hero-Headline, Hero-Copy und Billing-Badge werden rechts abgeschnitten.
- `forderungsaufstellung-narrow.png`: Selects, Hilfetext, Hinweisbox und Buttons/Formularflächen laufen rechts aus dem Viewport.
- `zinsrechner-narrow.png` und `rvg-rechner-narrow.png`: Hero-Copy, Stats und CTA-Boxen werden abgeschnitten.
- `tilgungsrechner-mobile.png`: Tabs und CTA-Box schneiden Text rechts ab.

Relevante CSS-Stellen:

- `frontend/css/app.css:1955-1959`: Pricing-Grid/Card/Badge mit festen Mindestbreiten und `white-space: nowrap`.
- `frontend/css/app.css:2020-2034`: Mobile-Preise-Regeln lösen Hero-/Card-Overflow nicht.
- `frontend/css/rechner.css:52-66`, `:554-562`, `:830-848`: Trust/Stats/Tabs mit `nowrap`.
- `frontend/css/rechner.css:854-883`: Mobile-Regeln erlauben zwar Umbruch für Teile, aber nicht für alle betroffenen Komponenten.

Nachprüfung: Der zusätzliche DevTools-Test trennt messbaren Body-Overflow von rein visueller Trunkierung. Eindeutig messbar waren `tilgungsrechner` bei 360px (+22px), `changelog` bei 768px (+77px) und `index` bei 768px (+3px). Ein generischer Element-Scan auf `overflow:hidden/clip` fand keine Treffer; die übrigen Screenshot-Hinweise sollten daher mit visuellen Regressionen und komponentenspezifischen Checks abgesichert werden.

Empfehlung: Einen automatisierten Responsive-Test ergänzen, der pro Seite `scrollWidth <= clientWidth` verifiziert und zusätzlich Screenshot-/Layout-Diffs für Hero, CTA-Boxen, Tabs, Badges und App-Formulare enthält. CSS-seitig Tabs/Badges/Buttons/CTA-Boxen mit `min-width:0`, `max-width:100%`, `flex-wrap`, `overflow-wrap:anywhere` und horizontal scrollbaren Segmentcontrols entschärfen.

### Finding 4 - P2: Service Worker cached `.html`-Seiten, Navigation nutzt aber überwiegend extensionless Routes

`frontend/sw.js:6-52` cached unter anderem `/preise.html`, `/forderungsaufstellung.html`, `/konto.html`, aber die Navigation und Redirects verwenden häufig `/preise`, `/forderungsaufstellung`, `/konto` usw. Beispiele:

- `frontend/js/auth.js:24`: Magic-Link-Redirect zu `/forderungsaufstellung`
- `frontend/js/konto.js:67`, `:123`, `:139`, `:159`: Redirects zu extensionless Routen
- Viele HTML-Navigationslinks zeigen auf `/forderungsaufstellung`

Auswirkung: Offline-/PWA-Verhalten und lokale QA sind abhängig davon, ob die extensionless Route vorher dynamisch gecached wurde und ob das Hosting Rewrite-Regeln ausführt. Das erklärt auch den lokalen 404 nach Konto-Redirect.

Nachprüfung: Die Route-Matrix fand 12 extensionless Routes (`/preise`, `/konto`, `/forderungsaufstellung`, Rechner-, Legal- und Changelog-Routen), die nicht in `ASSETS` stehen. Zusätzlich sind `/datenschutz.html` und `/impressum.html` selbst als `.html`-Assets nicht im Service-Worker-Cache enthalten.

Empfehlung: Entweder extensionless Routen zusätzlich in `ASSETS` aufnehmen oder im Service Worker Navigationsrequests konsistent auf die passenden `.html`-Assets mappen.

### Finding 5 - P2: Zins- und RVG-Rechner parsen deutsche Tausenderformate nicht

Die Haupt-App und der Tilgungsrechner entfernen Tausenderpunkte, aber zwei SEO-Rechner nicht:

- `frontend/js/rechner-zins.js:15`: nur `.replace(',', '.')`
- `frontend/js/rechner-rvg.js:28`: nur `.replace(',', '.')`
- Positivbeispiel: `frontend/js/rechner-gkg.js:30-32` entfernt Punkte und ersetzt Komma; `frontend/js/rechner-tilgung.js:7-8` ebenfalls.

Auswirkung: Eingaben wie `5.000,00` oder `10.000,00` werden abgelehnt bzw. falsch interpretiert, obwohl diese Schreibweise für deutsche Nutzer naheliegt.

Nachprüfung: Die Parser-Emulation bestätigte die Inkonsistenz: `5.000,00`, `10.000,00` und `1.234.567,89` sind mit der Zins-/RVG-Logik invalid, während GKG/Tilgung dieselben Werte als `5000`, `10000` und `1234567.89` interpretieren.

Empfehlung: Eine gemeinsame `parseGermanDecimal()`-Hilfsfunktion für Rechner und Haupt-App verwenden.

### Finding 6 - P2: Fall-CSV-Export erfüllt die dokumentierte Spaltenzusage nicht

`docs/ROADMAP.md:143` beschreibt für den Fälle-CSV-Export die Spalten `FallID`, `Name`, `Datum`, `Gesamtforderung`, `Restforderung`, `Status`. Die Implementierung in `frontend/js/konto.js:1108-1126` exportiert nur:

- `Aktenzeichen`
- `Name`
- `Mandant`
- `Geändert`
- `Gesamtforderung_EUR`

Außerdem ist `Gesamtforderung_EUR` nur die Summe der Hauptforderungen (`_hfSumme`), nicht der fachliche Rest inklusive Kosten/Zinsen/Zahlungen.

Nachprüfung: Die Roadmap-Matrix bestätigt die Lücke maschinell: `FallID`, `Restforderung` und `Status` kommen im aktuellen Export-Header nicht vor.

Empfehlung: Entweder Roadmap/Produkttext korrigieren oder CSV-Export fachlich erweitern. Für Kanzlei-Workflows wäre `Restforderung`, `Status`, `FallID` und optional `Notizen/Favorit` sinnvoll.

### Finding 7 - P2: ZV-Auftrag füllt nur Basisfelder, nicht die eigentliche Forderungsaufstellung

`frontend/js/zv.js:23-50` befüllt Gerichtsvollzieher, Ort/Datum, Schuldner, Auftraggeber, Aktenzeichen, Titel und Maßnahmen. Es gibt aber keine Befüllung der Forderungsbeträge, Kosten, Zinsen, Zahlungen oder Restforderung.

Das Produktversprechen spricht von ZV-Auftrag-Generierung aus Falldaten; faktisch ist es derzeit eher ein partiell vorausgefüllter Mantel. Das kann fachlich okay sein, sollte aber klar kommuniziert oder erweitert werden.

Empfehlung: Entweder Featuretext präzisieren oder das Formularmapping um Forderungssumme, Zinsen, Kosten und Anlagen-/Forderungsaufstellungshinweise erweitern. Zusätzlich einen PDF-Regressionstest mit bekannten Feldern anlegen.

### Finding 8 - P2: Dokumentation driftet bei Service-Worker-Versionen auseinander

Aktuelle Werte:

- `frontend/sw.js:5`: `fordify-v180` / `fordify-staging-v135`
- `CLAUDE.md:70`: `fordify-v180` / `staging-v135`
- `AGENTS.md:70`: noch `fordify-v169` / `staging-v124`
- `docs/SYSTEM.md:48` und `:360`: noch `fordify-v176` / `fordify-staging-v131`

Auswirkung: Agenten und Menschen erhalten je nach Quelle unterschiedliche Release-Informationen.

Empfehlung: `AGENTS.md` und `docs/SYSTEM.md` synchronisieren. Langfristig die SW-Version aus einer einzigen Quelle ableiten oder in Docs weniger hart codieren.

### Finding 9 - P3: Externe Links in Konto-HTML brauchen `rel`, wenn sie in neuen Tabs öffnen

In `frontend/js/konto.js:772` und `:778` werden `/agb` und `/avv` mit `target="_blank"` gerendert, aber ohne `rel="noopener noreferrer"`. Bei internen Links ist das Risiko geringer als bei externen, aber die Regel sollte konsistent sein.

Empfehlung: `rel="noopener noreferrer"` ergänzen oder interne Links im selben Tab öffnen.

## Positive Ergebnisse

- Alle expliziten `.html`-Seiten waren erreichbar.
- Keine JavaScript-Syntaxfehler in den geprüften App-Dateien.
- Keine offensichtlichen fehlenden `aria-label`s bei Bootstrap-Close-Buttons mehr.
- Grace-Period-Zugriff ist im Frontend und im Konto jetzt konsistenter.
- `pdf-lib.min.js` und `fonts.css` sind jetzt im Service-Worker-Asset-Cache.
- `schema.sql` enthält jetzt einen echten Unique Constraint für `paddle_subscription_id`.
- CSV-Delimiter-Erkennung und Formula-Injection-Schutz wurden erkennbar nachgezogen.

## Empfohlene Fix-Reihenfolge

1. DOM-XSS/Attribut-Injection vollständig schließen: Positionsdaten, Summary, Modalwerte, importierte Einstellungen.
2. Mobile Overflow systematisch beheben und mit ScrollWidth-Test absichern.
3. PWA-/Routing-Strategie für extensionless URLs vereinheitlichen.
4. Rechner-Parsing für deutsche Zahlenformate vereinheitlichen.
5. Fall-CSV-Export und ZV-Featureumfang mit Produktversprechen synchronisieren.
6. Dokumentation/SW-Versionen angleichen.
7. Kleine Link-Hygiene im Konto ergänzen.

## Nächster sinnvoller Prüfschritt

Nach den Fixes sollte ein kleiner automatisierter Smoke-Test entstehen:

- JS-Syntaxcheck
- statischer HTML-Link-/Assetcheck
- responsive `scrollWidth`-Check für Hauptseiten
- XSS-Regressionsfälle über JSON-Import und Positionsbeschreibungen
- CSV-Import/-Export-Test mit Semikolon, Komma und Formelwerten
- fachlicher §367-Beispielfall mit Kosten, Zinsen, Hauptforderung und Teilzahlung
