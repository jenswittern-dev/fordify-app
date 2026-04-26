# ROADMAP – Fordify

> Lebendiges Dokument. Jeder abgehakte Punkt enthält das Commit-Datum.
> Basis: Konkurrenzanalyse (April 2026), Nutzerfeedback (Runde 1+2), webapp-transformation.md

---

## Legende

| Symbol | Bedeutung |
|---|---|
| ✅ | Umgesetzt |
| 🔄 | In Arbeit |
| 📋 | Geplant |
| 💡 | Idee / optional |

---

## Phase 0 – Infrastruktur & Go-Live

| # | Feature | Status | Datum |
|---|---|---|---|
| 0.1 | Static Hosting + Domain fordify.de | ✅ | 2026-03 |
| 0.2 | HTTPS | ✅ | 2026-03 |
| 0.3 | PWA: Service Worker + Offline-Modus | ✅ | 2026-03 |
| 0.4 | PWA: Web App Manifest (installierbar) | ✅ | 2026-03 |
| 0.5 | Impressum (impressum.html) | ✅ | 2026-03 |
| 0.6 | Datenschutzerklärung (datenschutz.html) | ✅ | 2026-03 |
| 0.7 | robots.txt + sitemap.xml | ✅ | 2026-03 |
| 0.8 | OpenGraph / Twitter Card Meta-Tags + OG-Image | ✅ | 2026-03 |

---

## Phase 1 – Kern-Features & Rechtliche Vollständigkeit

| # | Feature | Status | Datum |
|---|---|---|---|
| 1.1 | § 367 BGB Verrechnungslogik | ✅ | 2026-03 |
| 1.2 | RVG-Berechnung (BGBl. 2025 I Nr. 109) | ✅ | 2026-03 |
| 1.3 | Basiszinssätze (bis 01.07.2026) | ✅ | 2026-03 |
| 1.4 | Mehrfall-Verwaltung (mehrere Fälle in localStorage) | ✅ | 2026-03 |
| 1.5 | Forderungsgrund-Klassifikation (3 Ebenen: Vertrag / Titel / Gesetz) | ✅ | 2026-03 |
| 1.6 | InsO-Datum / Zinslauf-Kappung | ✅ | 2026-03 |
| 1.7 | Negativer Basiszinssatz korrekt behandeln (Clamping auf 0) | ✅ | 2026-03 |
| 1.8 | Inkassopauschale § 288 Abs. 5 BGB (40 €, B2B) | ✅ | 2026-03 |
| 1.9 | Verjährungswarnung § 197 BGB (Zinsansprüche > 3 Jahre) | ✅ | 2026-03 |
| 1.10 | Art. 229 § 34 EGBGB Übergangshinweis (Forderungen vor 29.07.2014) | ✅ | 2026-03 |
| 1.11 | USt-Satz wählbar bei RVG (0 % / 7 % / 19 %) | ✅ | 2026-03 |
| 1.12 | ZV-Kosten (vormals: Gerichtsvollzieherkosten) | ✅ | 2026-03 |
| 1.13 | Gerichtskosten-Position | ✅ | 2026-03 |

---

## Phase 2 – UX, Kanzlei-Individualisierung & Export

| # | Feature | Status | Datum |
|---|---|---|---|
| 2.1 | Kanzlei-Impressum konfigurierbar (19 Felder inkl. Logo) | ✅ | 2026-03 |
| 2.2 | Logo-Upload + Positionierung (links/rechts/zentriert) | ✅ | 2026-03 |
| 2.3 | Impressum + Datenschutz als Links im PDF-Footer | ✅ | 2026-03 |
| 2.4 | Einstellungen Export / Import (JSON) | ✅ | 2026-03 |
| 2.5 | Drucken via Popup-Window (kein Bitmap-PDF) | ✅ | 2026-03 |
| 2.6 | Teilen / Export (Web Share API + Download-Fallback) | ✅ | 2026-03 |
| 2.7 | Fall-Import aus JSON-Datei | ✅ | 2026-03 |
| 2.8 | Onboarding-Modal beim ersten Start | ✅ | 2026-03 |
| 2.9 | Undo-Stack (bis 20 Schritte, Strg+Z) | ✅ | 2026-03 |
| 2.10 | Navbar-Redesign (Mobile + Desktop) | ✅ | 2026-03 |
| 2.11 | Accessibility-Fixes (ARIA, Skip-Nav) | ✅ | 2026-03 |
| 2.12 | Theme-System: Professionell / Dark / Clean (CSS Custom Properties, localStorage) | ✅ | 2026-04-01 |

---

## Phase 3 – Erweiterte Berechnungen & Positionen

| # | Feature | Status | Datum |
|---|---|---|---|
| 3.1 | Mehrere Hauptforderungen mit gruppeId-Zuordnung | ✅ | 2026-04-01 |
| 3.2 | GKG-Streitwertrechner (Anlage 2 KostBRÄG 2021) | ✅ | 2026-04-01 |
| 3.3 | Wiederkehrende Buchungen (n Positionen, konfigurierbares Intervall) | ✅ | 2026-04-01 |
| 3.4 | Export-Reminder (Banner nach >7 Tagen ohne Export) | ✅ | 2026-04-01 |
| 3.5 | Zahlungsplan (Zukunft): Tilgungsrechner | ✅ | 2026-04-23 |
| 3.6 | Mehrere Zinsmethoden (act/365 Standard + 30/360 für Verträge) | ✅ | 2026-04-23 |
| 3.7 | Navbar Rechner-Dropdown (alle 7 Seiten, Tilgungsrechner ergänzt) | ✅ | 2026-04-23 |
| 3.8 | PKH-Abrechnung (Prozesskostenhilfe) | 💡 | — |

---

## Phase 4 – Zusammenfassung & Verrechnung (Detaildarstellung)

| # | Feature | Status | Datum |
|---|---|---|---|
| 4.1 | Zusammenfassung: Restsaldo-HF nach jeder Zahlung sichtbar | ✅ | 2026-04-01 |
| 4.2 | Buchungsdatum / Verrechnungsdatum in Zusammenfassung links | ✅ | 2026-04-01 |
| 4.3 | Zusammenfassung: Positionsbezogene Zahlungs-Sub-Rows (§367 BGB, direkt unter jeweiliger Position) | ✅ | 2026-04-02 |
| 4.4 | Spaltenkopf „(Teil-)Zahlung" statt „Verrechnung" | ✅ | 2026-04-02 |
| 4.5 | Neue Zinsen nach Zahlung direkt unter der HF (nicht am Ende) | ✅ | 2026-04-02 |
| 4.6 | Verrechnungsanweisung-Feld bei Zahlungs-Position | ✅ | 2026-04-02 |
| 4.7 | RVG-Vorschau im Modal (Einzelpositionen mit Faktor und Auslagenpauschale-Berechnungsbasis) | ✅ | 2026-04-02 |
| 4.8 | Zinsperioden-Enddatum in Datumsspalte der Zusammenfassung (VON – BIS statt nur VON) | ✅ | 2026-04-13 |
| 4.9 | Tilgungsbestimmung bei Zahlungen: strukturiertes UI + gruppeId-spezifische Verrechnung | ✅ | 2026-04-13 |
| 4.10 | Tilgungsbestimmung: Fix auf id-basierte Zuordnung (tilgungsHFId statt tilgungsGruppeId) | ✅ | 2026-04-16 |
| 4.11 | Zusammenfassungstabelle: neue Spalte „Teilzahlung" + Umbenennung „Anrechnung" (§ 367 BGB) | ✅ | 2026-04-16 |
| 4.12 | payAllocRow zeigt Restforderung nach Anrechnung immer explizit (auch 0,00 €) | ✅ | 2026-04-16 |
| 4.13 | Tilgungsbestimmung: Zinsen als Ziel wählbar (Zinsen HF n + titulierte Zinsforderungen) | ✅ | 2026-04-17 |
| 4.14 | Zahlungszeile in Chronologie erhält Badge „Tilgungsbestimmung" wenn gesetzt | ✅ | 2026-04-17 |
| 4.15 | Bezeichnung Zahlung: maxlength=80 | ✅ | 2026-04-17 |
| 4.16 | Gegenderung: Schuldner*in / Gläubiger*in in UI und PDF | ✅ | 2026-04-17 |

> Quelle: Anwaltsgespräch (transcript.md, feedback-4, feedback-6) – Zinsperioden-Enddatum, Tilgungsbestimmung, Spaltenstruktur

---

## Phase 5 – Infrastruktur, Sicherheit & Skalierung

| # | Feature | Status | Datum |
|---|---|---|---|
| 5.1 | Haftungsausschluss im Footer der App | ✅ | 2026-04-23 |
| 5.2 | Datenschutz-Link im App-Footer | ✅ | 2026-04-23 |
| 5.3 | Changelog / Versionshistorie | ✅ | 2026-04-23 |
| 5.4 | ~~Matomo Analytics~~ – entfernt, GoatCounter wird genutzt | — | — |
| 5.5 | Nutzerkonten / Cloud-Sync (Stufe 2) | 💡 | — |
| 5.6 | URL-basierter Fall-Import (komprimiertes JSON im Hash) | 💡 | — |
| 5.7 | ZV-Auftrag-Generierung (ZwVollstrFormV 2024) | 💡 | — |
| 5.8 | **Free-Version: Export/Import vollständig sperren** – JSON-Import, JSON-Export und CSV-Export der Fälle aus der FA nur für eingeloggte Paid-Nutzer (Pro/Business). Menüpunkte für Gäste ausblenden oder deaktivieren (nicht nur Modal zeigen). | ✅ | 2026-04-23 |
| 5.9 | **AVV (Auftragsverarbeitungsvertrag)** – avv.html (ENTWURF), Supabase-Spalte `accepted_avv_at`, Akzeptieren-Flow in konto.html, persistenter Non-Blocking-Banner (`AVV_BANNER_AKTIV=false` bis Andreas freigibt) | ✅ | 2026-04-23 |
| 5.10 | **N8N Retention Email Cron** – täglicher Cron (09:00), sendet Win-Back-Mail 7 Tage vor Kündigung (monthly) bzw. 30 Tage (yearly), Guard via `retention_email_sent_at IS NULL`, Workflow-ID `HDZV78j89uLYdPTB` | ✅ | 2026-04-23 |

---

## Phase 6 – Pro/Business: Kundenbereich & Datenverwaltung

> Voraussetzung: Freemium-Infrastruktur (Phase 5.5 / Freemium-Launch-Plan) ist live.

| # | Feature | Status | Datum |
|---|---|---|---|
| 6.0 | **Kundenbereich: konto.html** – Tab-basierte Seite für eingeloggte Nutzer (Fallübersicht, Firmendaten, Abo-Verwaltung) | ✅ | 2026-04-22 |
| 6.0a | **Gate-System: requiresBusiness + plan-aware Upgrade-Modal** – `requiresBusiness(featureName)` in gates.js; Modal zeigt kontextabhängig Pro- oder Business-Titel/-Text/-CTA; JSON-Import in FA auf Pro gesperrt | ✅ | 2026-04-23 |
| 6.0b | **Schuldner-Adressbuch (Pro)** – CRUD-Verwaltung in konto.html (Tab „Adressen"), Supabase `contacts`-Tabelle (`type='schuldner'`), Autocomplete-Datalist in Forderungsaufstellung (Gegner-Feld) | ✅ | 2026-04-23 |
| 6.0c | **Mandanten-Adressbuch (Business)** – CRUD-Verwaltung in konto.html (gleicher Tab, Business-gated), `type='mandant'`, Autocomplete-Datalist in Forderungsaufstellung (Mandant-Feld) | ✅ | 2026-04-23 |
| 6.0d | **Fälle aus CSV anlegen (Business)** – CSV-Import im Fälle-Tab: jede Zeile → neuer Fall mit einer Hauptforderung; Pflichtfelder `gegner`+`betrag`, optional `aktenzeichen`, `faelligkeitsdatum`, `aufschlag_pp`, `mandant`; Beispiel-CSV unter `/data/beispiel-import.csv` | ✅ | 2026-04-23 |
| 6.1 | **Fälle: JSON-Export und JSON-Import** (Pro + Business) – alle Fälle als einzelne JSON-Datei oder als ZIP-Archiv exportieren; JSON-Datei wieder importieren und bestehende Fälle ergänzen/überschreiben. | ✅ | 2026-04-23 |
| 6.2 | **Fälle: CSV-Export** (Pro + Business) – Fälle als CSV exportieren (Spalten: FallID, Name, Datum, Gesamtforderung, Restforderung, Status). Hinweis: CSV-Import (neue Fälle aus CSV) → 6.0d ✅. | ✅ | 2026-04-23 |
| 6.3 | **Schuldner-/Kundendaten: CSV-Import** (Pro + Business) – Schuldner-Adressbuch per CSV befüllen. Pflichtfelder: Name, Anschrift; optional: IBAN, E-Mail, Aktenzeichen. Im Kundenbereich bereitgestellt: Beispiel-CSV-Datei zum Download + schriftliche Formatierungsanleitung (welche Spalten, Zeichensatz UTF-8, Trennzeichen Semikolon). | ✅ | 2026-04-23 |
| 6.4 | **Kundenbereich: Fallübersicht + Direktbearbeitung** (Pro + Business) – alle Cloud-Fälle in einer Listenansicht (Kundenbereich/Dashboard); von dort direkt öffnen, duplizieren, löschen, exportieren (JSON/CSV). | ✅ | 2026-04-23 |
| 6.5 | **Kundenbereich: Schuldner-Datenbank** (Pro + Business) – zentrale Verwaltung aller Schuldner-Adressen; Schuldner einem neuen Fall zuweisen; Import via CSV (→ 6.3). Hinweis: CRUD-Grundlage → 6.0b ✅. | ✅ | 2026-04-23 |
| 6.6 | **Preisseite: Pro vs. Business klarer differenzieren** – Tilgungsrechner in Featureliste, JSON-Import bei Pro ergänzen, Mandanten-Adressbuch bei Business-Karte hinzufügen, Business-Beschreibung überarbeiten, Meta/OG-Tags auf Business ausweiten, Vergleichstabelle vervollständigen. | ✅ | 2026-04-23 |
| 6.7 | **E-Mail-Workflows: Zahlungsbestätigung + Offboarding + Retention + Datenlöschung** – Branded payment confirmation (transaction.completed via N8N `PexOk66BNT8uDntc`), Cancellation offboarding mit 30-Tage Grace Period (N8N `mYQAOS7oacoKW5Rq`), Retention Mails (monatlich 7d / jährlich 30d vor Kündigung, N8N `HDZV78j89uLYdPTB`), Datenlöschungs-Cron (cases/contacts/settings nach Grace Period, N8N `fdfPAUVG4rvMoPcS`; profiles/subscriptions 10 Jahre gem. § 147 AO). Absender: `@mail.fordify.de`. | ✅ | 2026-04-23 |

---

## Phase 7 – SEO & Public Launch-Vorbereitung

| # | Feature | Status | Datum |
|---|---|---|---|
| 7.1 | **robots / noindex entfernen** – Vor Public Launch noindex auf folgenden Seiten entfernen und auf `index, follow` setzen: `index.html`, `preise.html`, `zinsrechner.html`, `rvg-rechner.html`, `gerichtskostenrechner.html`, `tilgungsrechner.html`. Dauerhaft noindex bleiben: `forderungsaufstellung.html`, `konto.html`, `changelog.html`, `agb.html`, `avv.html`, `impressum.html`, `datenschutz.html`. | 📋 | — |

---

## Bekannte offene Punkte aus Nutzerfeedback

| Quelle | Beschreibung | Status |
|---|---|---|
| feedback-2/01 | Restsaldo und Verrechnungsdatum in Zusammenfassung (→ Phase 4.1/4.2) | ✅ |
| feedback-2/02 | Impressum-Links im PDF klickbar — ist umgesetzt (`<a>`-Tags bleiben in Print-to-PDF erhalten), visuell bewusst neutral (kein Underline, Grauton) | ✅ |
| feedback-2/03 | Print: „Gläubiger"/„Schuldner"-Labels, Seitenumbruch Zusammenfassung, Schriftgröße | ✅ |
