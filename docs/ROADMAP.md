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
| 3.5 | Zahlungsplan (Zukunft): Tilgungsrechner | 📋 | — |
| 3.6 | Mehrere Zinsmethoden (act/365 Standard + 30/360 für Verträge) | 📋 | — |
| 3.7 | PKH-Abrechnung (Prozesskostenhilfe) | 💡 | — |

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

> Quelle: Anwaltsgespräch (transcript.md, feedback-4) – Zinsperioden-Enddatum, Tilgungsbestimmung

---

## Phase 5 – Infrastruktur, Sicherheit & Skalierung

| # | Feature | Status | Datum |
|---|---|---|---|
| 5.1 | Haftungsausschluss im Footer der App | 📋 | — |
| 5.2 | Datenschutz-Link im App-Footer | 📋 | — |
| 5.3 | Changelog / Versionshistorie | 📋 | — |
| 5.4 | Matomo self-hosted Analytics (datenschutzkonform) | 💡 | — |
| 5.5 | Nutzerkonten / Cloud-Sync (Stufe 2) | 💡 | — |
| 5.6 | URL-basierter Fall-Import (komprimiertes JSON im Hash) | 💡 | — |
| 5.7 | ZV-Auftrag-Generierung (ZwVollstrFormV 2024) | 💡 | — |

---

## Bekannte offene Punkte aus Nutzerfeedback

| Quelle | Beschreibung | Status |
|---|---|---|
| feedback-2/01 | Restsaldo und Verrechnungsdatum in Zusammenfassung (→ Phase 4.1/4.2) | ✅ |
| feedback-2/02 | Impressum-Links im PDF klickbar — ist umgesetzt (`<a>`-Tags bleiben in Print-to-PDF erhalten), visuell bewusst neutral (kein Underline, Grauton) | ✅ |
| feedback-2/03 | Print: „Gläubiger"/„Schuldner"-Labels, Seitenumbruch Zusammenfassung, Schriftgröße | ✅ |
