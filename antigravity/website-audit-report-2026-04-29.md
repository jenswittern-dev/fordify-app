# Fordify App – Ganzheitlicher Frontend & Security Audit Report

**Datum:** 29.04.2026
**Umfang:** Security, UX, Architektur & Mobile Layouts (Holistischer Review)
**Zustand:** Final verifiziert (Teil 1), Neue Findings validiert (Teil 2) & Vertiefte Eigene Prüfungen (Teil 3)

---

## 1. Executive Summary

Im Rahmen eines holistischen Website-Audits der Fordify-App wurden die Architektur, Datensicherheit, Code-Qualität sowie die Benutzeroberfläche systematisch überprüft. Das grundlegende Design (Pure Static SPA ohne Build-Schritt) ist äußerst robust und schnell. Identifizierte Schwachstellen und Bugs aus vorangegangenen Zwischenberichten (F1 bis F8) wurden mittlerweile im Codebase integriert und auf Branch `staging` vollständig verifiziert.

Ein heute parallel durchgeführter, noch tiefergehender Review (Codex-Audit Teil 2) hat jedoch offengelegt, dass an einigen Stellen im Frontend noch Restrisiken sowie Optimierungspotenziale bei der Barrierefreiheit und Usability bestehen. **Durch eine eigene vertiefte Prüfung** haben sich einige dieser Befunde als noch weitreichender herausgestellt als im Codex-Audit beschrieben.

---

## 2. Verifikation der abgeschlossenen Audit-Befunde (Teil 1)

Die ursprünglich identifizierten Audit-Punkte (F1-F8) wurden systematisch validiert. Die Umsetzung ist erfolgreich abgeschlossen:

| ID | Bereich | Befund & Behebung | Status |
| :-- | :-- | :-- | :-- |
| **F1** | **Datenbank** | **Paddle Upsert Constraint:** Ein vollwertiger `UNIQUE Constraint` auf `paddle_subscription_id` wurde etabliert. | ✅ Verifiziert |
| **F2** | **Security** | **XSS in PDF-/Print-Vorschau (Teil-Fix):** Eine globale `escHtml()`-Funktion wurde auf Basis-Nutzerfelder angewendet. *(Siehe aber Neu-Finding N1)* | ✅ Verifiziert |
| **F3** | **UX / Mobile** | **Mobile Layout Overflow:** Automatisiertes Playwright-Testing auf 390x844 px bestätigt, dass die Layouts nun ohne Overflow skalieren. | ✅ Verifiziert |
| **F4** | **Import / UX** | **CSV-Delimiter Erkennung:** Die Kontakt-Import-Funktion erkennt zuverlässig `;` und `,` als Trennzeichen. | ✅ Verifiziert |
| **F5** | **Security** | **Spreadsheet Formula Injection:** Formelzeichen (`=`, `+`, etc.) in Exporten werden neutralisiert (`_csvFmla`, `_csvQuote`). | ✅ Verifiziert |
| **F6** | **PWA** | **Service Worker Assets:** Offline-Exports per ZV-Formular funktionieren nun dank gecachtem `pdf-lib.min.js`. | ✅ Verifiziert |
| **F7** | **A11y** | **Barrierefreiheit (Accessibility):** Alle Modal-Close-Buttons und die Formularfelder verfügen über `aria-label`-Attribute. | ✅ Verifiziert |
| **F8** | **Dokumentation**| **Stale Documentation:** Veraltete Kommentare zu § 367 BGB und obsolete Referenzen wurden bereinigt. | ✅ Verifiziert |

---

## 3. Neu identifizierte Findings & Eigene Vertiefung (Teil 2 & 3)

Auf Basis der Codex-Befunde habe ich **eigene, vertiefende Tests** durchgeführt und dabei blinde Flecken identifiziert, die über den ursprünglichen Report hinausgehen. Die tatsächliche Tragweite ist wie folgt:

| ID | Prio | Bereich | Beschreibung, Eigene Prüfung & Empfehlung |
| :-- | :-- | :-- | :-- |
| **N1** | **P1** | **Security** | **Unvollständiger DOM-XSS-Fix & Fehlende Zentralisierung:** <br>• *Befund:* Positionsbeschreibungen (`pos.beschreibung`) werden unescaped in HTML gerendert.<br>• **Eigene Prüfung:** Der Codebase leidet unter dezentralisierten Escaping-Funktionen (`escHtml` in app.js, `_escHtml` in konto.js, `_escKontakt` in contacts.js, `escapeHtml` in rechner-gkg.js). Das Risiko, dass neue Features ungesichert bleiben, ist massiv.<br>• *Empfehlung:* Konsequentes, globales `escHtml` / `escAttr` Modul einführen und auf **alle** Text-Knoten/Attribute anwenden. |
| **N2** | **P1** | **Security** | **Logo-HTML Injection & Stored XSS via Settings-Import:** <br>• *Befund:* Importiertes JSON schreibt `einst.logo` direkt ins PDF-DOM.<br>• **Eigene Prüfung:** Der JSON-Upload für Settings überschreibt unvalidiert alle Settings-Felder. Dies ist nicht nur in der App ein XSS-Vektor, sondern bei Synchronisierung per Supabase auch ein persistentes Risiko (Stored XSS).<br>• *Empfehlung:* Strenge Typvalidierung beim JSON-Import (`data:image/...` Whitelist). |
| **N4** | **P1** | **Routing/PWA** | **PWA-Bruch bei Offline-Navigation:** <br>• *Befund:* Service Worker cached nur `.html`-Seiten.<br>• **Eigene Prüfung:** Interne App-Links (z.B. Redirects in `auth.js`) leiten den Browser auf `fordify.de/forderungsaufstellung` um. Befindet sich der Nutzer im Offline-Modus, bricht der Service Worker mit Fehler 404 ab, da der Cache-Match strikt nach Suffix `.html` verlangt. Die PWA ist somit inkonsistent.<br>• *Empfehlung:* SW-Fetch-Intercept muss alle extensionless Navigation-Requests auf die zugehörigen `.html`-Assets mappen. |
| **N5** | **P2** | **UX / Parsing** | **Deutsches Tausenderformat bricht Kern-App:** <br>• *Befund:* Zins-/RVG-Rechner brechen bei Eingaben wie `5.000,00` ab.<br>• **Eigene Prüfung:** Dieser Bug ist nicht nur auf die SEO-Rechner beschränkt! Auch die Haupt-App (`app.js:1203` und `app.js:1524` bei `streitwertRaw`) verwendet ausschließlich `replace(",", ".")`. Die Eingabe von Anwaltsgebühren mit Tausenderpunkt führt in der Haupt-App zu kaputter Mathematik.<br>• *Empfehlung:* Zentrale `parseGermanDecimal()` Funktion für alle Eingaben systemweit (Haupt-App & Rechner) verwenden. (Siehe Positivbeispiel in `rechner-tilgung.js`). |
| **N6** | **P2** | **Fachlichkeit** | **CSV-Fall-Export Unvollständig:** Export-Spalten entsprechen nicht der Roadmap (es fehlen Restforderung, Status).<br>• *Empfehlung:* Export-Scope in `konto.js` erweitern oder Doku angleichen. |
| **N7** | **P2** | **Fachlichkeit** | **ZV-Auftrag Mantel-Ausfüllung:** Das ZV-Formular füllt nur Basisdaten, nicht aber die Forderungssummen.<br>• *Empfehlung:* Kommunikation anpassen ("Basisausfüllung") oder Mapping in `zv.js` ausbauen. |

---

## 4. Fazit & Empfehlung für den nächsten Sprint

Die Basis der App ist solide, jedoch zeigen meine eigenen Code-Prüfungen auf Basis des Codex-Audits, dass **einzelne Bugfixes oft nicht systemweit angewendet wurden** (z.B. Tausenderpunkt-Parsing in `rechner-tilgung.js` behoben, in `app.js` aber übersehen; Escaping-Funktionen wurden pro Datei dupliziert statt zentralisiert). 

**Nächste notwendige Schritte:**
1. **Refactoring Utility-Funktionen:** Auslagerung von `escHtml()`, `escAttr()` und `parseGermanDecimal()` in eine globale Utility-Ebene (z.B. `utils.js`), um Redundanzen und Sicherheitslücken zu vermeiden.
2. **Härtung JSON-Import:** Komplette Validierung / Sanitization jeglicher via CSV/JSON importierten Daten, bevor diese in den Storage geschrieben werden.
3. **Service Worker Routing Fix:** Anpassung des `fetch`-Events im `sw.js`, um extensionless Request-URLs auf gecachte HTML-Dateien umzubiegen, sodass die PWA auch nach Redirects offline lauffähig bleibt.
