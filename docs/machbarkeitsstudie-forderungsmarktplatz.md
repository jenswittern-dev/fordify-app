# Machbarkeitsstudie: Forderungsabtretungs-Marktplatz & Weiterentwicklung Fordify

**Erstellt:** April 2026  
**Projektleitung:** Claude Sonnet 4.6 (Synthesebericht)  
**Subagenten:** Legal Advisor · Market Research · Software Architect · Product Planner  
**Status:** Interne Entscheidungsgrundlage — ersetzt keine anwaltliche Beratung

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [Das Konzept: Forderungsabtretungs-Marktplatz](#2-das-konzept-forderungsabtretungs-marktplatz)
3. [Rechtsanalyse](#3-rechtsanalyse)
4. [Markt- und Wettbewerbsanalyse](#4-markt--und-wettbewerbsanalyse)
5. [Technische Machbarkeit](#5-technische-machbarkeit)
6. [Feature-Expansion-Strategie](#6-feature-expansion-strategie)
7. [Gesamtbewertung & Empfehlung](#7-gesamtbewertung--empfehlung)
8. [Roadmap](#8-roadmap)
9. [Offene Fragen & nächste Schritte](#9-offene-fragen--nächste-schritte)

---

## 1. Executive Summary

Fordify besitzt einen einzigartigen strategischen Vorteil: Als einziges Browser-Tool erstellt es rechtssichere Forderungsaufstellungen nach § 367 BGB direkt an der Quelle — in der Anwaltskanzlei. Ein Forderungsabtretungs-Marktplatz wäre die natürliche Verlängerung dieses Workflows: **Forderung berechnen → Forderung verkaufen.**

**Die Kernbotschaft dieser Studie in vier Sätzen:**

Der deutsche NPL-Markt wächst auf bis zu 60 Mrd. EUR (2026) und das Kleinforderungssegment (< 25.000 EUR) ist von keiner Plattform adressiert. Der Marktplatz ist rechtlich grundsätzlich machbar, aber regulatorisch komplex — ein direkter Launch ohne Rechtsberatung wäre fahrlässig. Technisch erfordert der Marktplatz eine vollständige Infrastruktur-Neubauphase (Backend, Auth, DSGVO-Konzept). Der smarteste Weg ist ein dreistufiger Ansatz: **Werkzeug → Produkt → Plattform** — wobei jede Stufe wirtschaftlich eigenständig tragfähig sein muss.

**Sofort-Empfehlung:**
1. Den Marktplatz **nicht sofort** bauen — regulatorische Klärung zuerst
2. In den nächsten 6 Monaten Fordify zur funktional vollständigsten Web-Forderungssoftware ausbauen
3. Freemium-Modell einführen und zahlende Nutzerbasis aufbauen
4. Parallel: Anwaltliche Prüfung des Marktplatz-Konzepts (RDG, KWG, DSGVO)

---

## 2. Das Konzept: Forderungsabtretungs-Marktplatz

### 2.1 Die Idee

Nutzer, die in Fordify eine Forderungsaufstellung erstellt haben, sollen die Möglichkeit erhalten, ihre Forderung auf einem integrierten Marktplatz abzutreten. Professionelle Käufer (Inkassounternehmen, spezialisierte Fonds) können die Forderungen erwerben und dann auf eigene Rechnung durchsetzen.

**Die rechtliche Grundlage:** Forderungsabtretung nach §§ 398 ff. BGB — formlos möglich, der Schuldner muss nicht zustimmen.

### 2.2 Der strategische Vorteil von Fordify

| Dimension | Wettbewerb | Fordify |
|---|---|---|
| Workflow-Integration | Forderungsverkauf losgelöst von Berechnung | Nahtlos: Berechnen → Verkaufen in einem Tool |
| Datenqualität | Käufer müssen Qualität selbst prüfen | § 367 BGB-konforme Strukturdaten bereits vorhanden |
| Zielgruppe | Banken, Großunternehmen, institutionell | Anwaltskanzleien und KMU — bisher unversorgt |
| Forderungsgröße | Portfolios (> 1 Mio. EUR) | Einzelforderungen (100 – 25.000 EUR) |

### 2.3 Die drei Modellvarianten

**Modell A — Schwarzes Brett / Vermittlung (niedrigstes Risiko)**  
Fordify stellt Kontaktmöglichkeiten bereit. Vertrag kommt direkt zwischen Parteien zustande. Keine Zahlungsabwicklung durch Fordify. Regulatorisch: unbedenklich.

**Modell B — Strukturierter Marktplatz mit Standardvertrag (mittleres Risiko)**  
Fordify stellt Musterabtretungsvertrag, digitale Signatur und standardisierten Ablauf bereit. Zahlung über Payment-Provider (nie durch Fordify). Regulatorisch: mit Vorbereitung beherrschbar.

**Modell C — Aktiver Marktplatz mit Scoring und Matching (höchstes Risiko)**  
Fordify bewertet Forderungsqualität, algorithmisches Matching, Treuhandrolle. Regulatorisch: BaFin-Konsultation zwingend vor Launch.

**Empfehlung: Mit Modell A starten, Modell B mittelfristig, Modell C erst nach BaFin-Abstimmung.**

---

## 3. Rechtsanalyse

> *Basierend auf der Analyse des Legal Advisor Agents. Alle Einschätzungen sind Orientierungshilfen — keine verbindliche Rechtsauskunft.*

### 3.1 BGB-Grundlagen (§§ 398 ff. BGB)

- **Formfreiheit:** Eine Forderungsabtretung nach § 398 BGB ist formlos gültig. Für den Plattformbetrieb wird Textform (§ 126b BGB) dringend empfohlen.
- **Bestimmtheitsgrundsatz:** Die Forderung muss hinreichend bestimmt sein. Fordify-Daten (Hauptforderung, Zinsen, Kosten, Datum) erfüllen dieses Erfordernis.
- **Abtretungsverbote (§ 399 BGB):** Wenn der Schuldner im Vertrag ein pactum de non cedendo vereinbart hat, ist die Abtretung unwirksam. Nutzer müssen dies in AGB zwingend offenbaren.
- **Schuldnerbenachrichtigung (§ 409 BGB):** Keine gesetzliche Pflicht, aber ohne Benachrichtigung kann der Schuldner befreiend an den alten Gläubiger leisten (§ 407 BGB). Fordify sollte einen Benachrichtigungsworkflow integrieren.

### 3.2 Rechtsdienstleistungsgesetz (RDG)

**Kernfrage:** Ist die Vermittlung einer Forderungsabtretung eine erlaubnispflichtige Rechtsdienstleistung nach § 2 RDG?

**Ergebnis:** Nein — solange Fordify:
- nur eine technische Plattform bereitstellt,
- keine Einschätzung zur Werthaltigkeit oder Durchsetzbarkeit abgibt,
- keine Empfehlung zum Kauf ausspricht,
- keine Vertretung der Parteien übernimmt.

Eine RDG-Registrierung ist für Fordify als Plattform nicht erforderlich. **Käufer**, die als Inkassounternehmen agieren und erworbene Forderungen einziehen, benötigen jedoch eine Registrierung nach § 10 RDG.

### 3.3 Datenschutz (DSGVO) — Kritischster Punkt

**Aktueller Stand (kein Backend):** Fordify verarbeitet keine Daten auf Servern → kein Verantwortlicher i.S.v. Art. 4 Nr. 7 DSGVO. Dieser Vorteil entfällt mit dem Marktplatz vollständig.

**Mit Marktplatz wird Fordify zum Verantwortlichen.** Das bedeutet zwingend:
- Vollständige Datenschutzerklärung (Art. 13/14 DSGVO)
- Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)
- **Datenschutz-Folgenabschätzung (Art. 35 DSGVO)** — bei Schuldnerdaten vorgeschrieben
- Auftragsverarbeitungsvertrag mit Infrastrukturdienstleister (Art. 28 DSGVO)

**Schuldnerdaten sind das Kernproblem:** Der Schuldner ist kein Vertragspartner der Plattform. Seine Daten (Name, Adresse, Forderungsdetails) können nicht auf Art. 6 Abs. 1 lit. b gestützt werden. Ein berechtigtes Interesse (lit. f) ist argumentierbar, muss aber sorgfältig dokumentiert werden.

**Designprinzip:** Schuldnerdaten dürfen den Browser nie verlassen. Das Listing enthält nur anonymisierte Metadaten (z.B. "Titulierte Forderung, 12.500 EUR, gewerblicher Schuldner, AG-Bezirk Köln"). Schuldneridentität wird erst nach beidseitiger Freigabe außerhalb der Plattform offengelegt.

### 3.4 Regulierung: KWG und BaFin

| Regulierungsbereich | Risiko | Bewertung |
|---|---|---|
| § 32 KWG (Bankgeschäft) | Gering | Nur wenn Fordify selbst Forderungen kauft oder hält |
| § 1 Abs. 1a Nr. 2 KWG (Abschlussvermittlung) | **Mittel-Hoch** | Wenn Fordify aktiv in Vertragsschluss eingebunden ist |
| § 10 ZAG (Zahlungsdienste) | **Kritisch** | Wenn Fordify Gelder zwischen Parteien transferiert |
| Kreditzweitmarktgesetz (KrZwMG) | Gering | Gilt nur für Bankkredite, nicht private Forderungen |

**Wichtigste Maßnahme:** Zahlungsabwicklung vollständig an zugelassenen Payment-Provider auslagern (Stripe Connect, Mangopay o.ä.). Fordify darf zu keinem Zeitpunkt Zahlungsmittel auf eigenem Konto halten.

**BaFin-Anfrage:** Für Modell B/C ist eine informelle BaFin-Anfrage nach § 4 FinDAG vor dem Launch ausdrücklich empfohlen. Kostengünstig, schafft Rechtssicherheit.

### 3.5 Geldwäsche (GwG) und KYC

Fordify selbst ist bei reinem Vermittlungsmodell nicht GwG-verpflichtet. Dennoch sind Mindest-KYC-Maßnahmen dringend empfohlen:
- Verifikation der Unternehmensidentität (Handelsregister)
- Sanktionslisten-Screening (EU-Sanktionsliste, OFAC)
- Ablehnung anonym agierender Nutzer

Payment-Provider (Stripe, Mangopay) verlangen ohnehin KYC-Prüfung ihrer Plattformnutzer.

### 3.6 Risikomatrix Rechtsanalyse

| Rechtsgebiet | Modell A | Modell B | Modell C |
|---|---|---|---|
| RDG | Niedrig | Niedrig-Mittel | Hoch |
| KWG / BaFin | Niedrig | Mittel | Hoch |
| ZAG (Zahlungsdienste) | Keins | Keins (Payment-Provider) | Hoch |
| DSGVO / Schuldnerdaten | Mittel | Hoch | Sehr hoch |
| GwG / Geldwäsche | Niedrig | Niedrig | Mittel |
| AGB / Haftung | Niedrig | Mittel | Hoch |
| **Gesamt** | **Beherrschbar** | **Beherrschbar mit Vorbereitung** | **Signifikant, externe Prüfung zwingend** |

### 3.7 Mindestvoraussetzungen für legalen Betrieb

| Anforderung | Maßnahme | Priorität |
|---|---|---|
| Kein Zahlungsverkehr auf eigenem Konto | Payment-Provider (Stripe Connect o.ä.) | Kritisch |
| Vertragsschluss direkt zwischen Parteien | Offer/Accept-Mechanismus, Fordify nur Facilitator | Kritisch |
| Keine Rechtsberatung | Disclaimer, keine Forderungsbewertung durch Fordify | Kritisch |
| Datenschutz für Schuldnerdaten | DSFA, Datenschutzerklärung, Art.-14-Information | Hoch |
| Anwaltlich geprüfte AGB | Für Zedenten und Zessionare | Hoch |
| Mindest-KYC | Unternehmensidentität, Sanktionslisten | Hoch |
| Abtretungsvertrag in Textform | Standardvertrag auf der Plattform | Mittel |
| Schuldnerbenachrichtigung | Workflow oder Empfehlung integrieren | Mittel |

---

## 4. Markt- und Wettbewerbsanalyse

> *Basierend auf Web-Recherche des Market Research Agents.*

### 4.1 Marktgröße

| Marktsegment | Volumen 2024 | Trend |
|---|---|---|
| Deutschen NPL-Markt (Banken) | **46,6 Mrd. EUR** | +23 % ggü. 2023 |
| Prognose NPL 2026 | bis **60 Mrd. EUR** | Steigend |
| Factoring-Markt Deutschland | **398,8 Mrd. EUR** | +3,7 % |
| Inkasso: verwaltetes Forderungsvolumen | **> 24 Mrd. EUR/Jahr** | Stabil |
| Inkasso-Branchenumsatz | ~2,4 Mrd. EUR | Stabil |

**Fazit:** Der Markt ist groß und wächst. Das Kleinforderungssegment (Einzelforderungen < 25.000 EUR aus dem Rechtsbereich) ist weitgehend unerschlossen.

### 4.2 Wettbewerber

#### Debitos (Frankfurt — Platzhirsch)
- **Marktführer** im deutschen NPL-Marktplatz
- > 10 Mrd. EUR Transaktionsvolumen in 16 Ländern
- > 400 Servicer, > 2.000 registrierte Investoren
- **Gebührenstruktur:** 15 EUR Fixgebühr + 1 % (laufende Forderungen) / 6 % (gemahnte) / 9 % (titulierte)
- **Schwäche:** Fokus auf Portfolios und institutionelle Akteure. Kleinforderungen aus Anwaltskanzleien werden nicht adressiert.

#### Debexpert (International)
- Online-Auktionsplattform für NPL-Portfolios
- Primär anglophone Märkte, schwache Deutschland-Präsenz

#### Creditreform
- Kein offener Marktplatz — direkter Forderungsankauf durch Creditreform
- Stark im KMU-Segment, aber keine Preiswettbewerb zwischen Käufern

#### Coface / Direkte Ankäufer (Inkasso 24, Dr. Duve, Collectia)
- Kaufen Einzelforderungen zu Festpreisen (10–40 % des Nominalwerts)
- Kein Wettbewerb zwischen Käufern = schlechtere Preise für Verkäufer

#### Dominante Käufer (kein Marktplatz, aber potenzielle Partner)
- **EOS Group** (Hamburg, Otto-Gruppe) — einer der größten deutschen Forderungskäufer
- **Intrum** (Schweden) — europäischer Marktführer
- **Lowell** (übernimmt Hoist Finance 2025) — zunehmende Konsolidierung
- **Cerberus, Blackstone, Apollo** — institutionelle Distressed-Debt-Fonds

### 4.3 Die identifizierte Marktlücke

**Niemand bedient Anwaltskanzleien mit Einzelforderungen.** Debitos ist ab ~100.000 EUR interessant; darunter ist der Markt nicht organisiert. Fordify sitzt genau an dieser Quelle.

| Lücke | Details |
|---|---|
| Forderungsgröße | < 25.000 EUR Einzelforderungen — von allen Plattformen ignoriert |
| Zielgruppe | Anwaltskanzleien als Verkäufer — keine Plattform spricht sie direkt an |
| Workflow | Niemand bietet Berechnen + Verkaufen in einem Tool |
| Datenqualität | § 367 BGB-konforme Strukturdaten als Vertrauenssignal für Käufer |

### 4.4 Betroffene Branchen (höchste Nachfrage Verkäuferseite)

1. **Baugewerbe** — Hohe NPL-Quote, gestiegene Kosten
2. **Verarbeitendes Gewerbe** — +21,5 % Insolvenzen 2024
3. **Dienstleistungen** — +35 % Insolvenzen 2024
4. **Gewerbeimmobilien** — NPL-Quote 5,9 % (höchste Stresssignale)
5. **KMU-Segment allgemein** — NPL-Quote 3,9 %

### 4.5 Zielgruppen

**Verkäuferseite (Angebotsseite):**
- Primär: Anwaltskanzleien, die Forderungen für Mandanten eintreiben (bereits Fordify-Nutzer)
- Sekundär: KMU mit titulierten Kleinforderungen, Insolvenzverwalter

**Käuferseite (Nachfrageseite):**
- Spezialisierte Inkassounternehmen (kaufen bereits aktiv Einzelforderungen)
- Regionale Forderungsfonds im Kleinsegment
- Family Offices als renditestarke Nischenanlage

**Engpass:** Die Käuferseite ist der kritische Erfolgsfaktor. Professionelle Forderungskäufer sind begrenzt und nutzen etablierte Kanäle. Ohne attraktive Käuferbasis bleibt das Feature ungenutzt.

### 4.6 Empfohlener dreistufiger Marktansatz

**Stufe 1 (sofort, kein Regulierungsrisiko): Vermittlungsmodell**
- "Forderung verkaufen"-Button in der Zusammenfassungsansicht
- Weiterleitung an 2–3 kuratierte Forderungskäufer (Inkasso 24, Dr. Duve, Collectia)
- Affiliate/CPA-Modell — Fordify erhält Provision pro Transaktion
- Technisch: vorausgefülltes Formular mit Fordify-Metadaten

**Stufe 2 (6–12 Monate): White-Label-Anbindung**
- Partnerschaft mit Debitos oder etabliertem Ankäufer
- Revenue-Share auf abgeschlossene Transaktionen
- Keine eigene Käuferbasis nötig

**Stufe 3 (langfristig): Eigener Mikro-Marktplatz**
- Auktionsmechanismus für titulierte Kleinforderungen (100 – 25.000 EUR)
- Nur bei ausreichendem Wachstum und nach BaFin-Abstimmung

---

## 5. Technische Machbarkeit

> *Basierend auf der Architekturanalyse des Architect Agents.*

### 5.1 Was dem aktuellen Stack fehlt

| Anforderung | Aktueller Stand | Lücke |
|---|---|---|
| Authentifizierung | Keine | Komplett neu aufzubauen |
| Persistente Server-Daten | Nur localStorage | Datenbank erforderlich |
| Multi-User-Zugriff | Single-Browser | Server-seitige API nötig |
| Transaktionsverwaltung | Keine | Zustandsmaschine für Kaufprozesse |
| Kommunikation zwischen Nutzern | Keine | Messaging oder Kontaktanfragen |
| Zahlungsabwicklung | Keine | Payment-Integration |

**Kernproblem:** Der bisherige DSGVO-Vorteil ("keine Daten verlassen den Browser") wird durch den Marktplatz vollständig aufgehoben. Das ist eine strategische Kehrtwende — keine reine Feature-Ergänzung.

### 5.2 Empfohlener MVP-Stack: Supabase

| Komponente | Lösung | Begründung |
|---|---|---|
| Datenbank | Supabase PostgreSQL | Relationale Daten, RLS, EU-Region (Frankfurt) |
| Auth | Supabase Auth (Magic Link) | Integriert, E-Mail + OTP, kein Build-Step nötig |
| API | Supabase Auto-generated REST | Kein eigenes Backend erforderlich |
| Storage | Supabase Storage | Für Dokument-Uploads (Abtretungsverträge) |
| Client | `@supabase/supabase-js` via CDN | Keine Build-Pipeline, kompatibel mit aktuellem Stack |
| Kosten | Kostenlos bis 500 MB / 50.000 MAU | MVP praktisch kostenlos |

**Alternative: PocketBase** (Self-Hosted auf Hetzner) für maximale DSGVO-Kontrolle — aber höchster Betriebsaufwand.

**Ausgeschlossen:** Firebase (Google/USA), kein akzeptabler Datenschutz für deutsches LegalTech.

### 5.3 Datenmodell (Server-seitig)

```
users           → Identität, KYC-Status, Unternehmensdaten
listings        → Anonymisierte Forderungsmetadaten (KEIN Schuldnername)
listing_docs    → Hochgeladene Dokumente (Titel, Vertrag) — zugangsgeschützt
inquiries       → Interessensbekundungen von Käufern
transactions    → Kaufprozess-Zustandsmaschine
```

**Kritisches Designprinzip:** Schuldnerdaten verbleiben ausschließlich in localStorage. Das Listing enthält nur Metadaten: Nennwert, Forderungstyp, Titulierungsstatus, Region. Schuldneridentität wird erst nach beidseitiger Freigabe außerhalb der Plattform kommuniziert.

### 5.4 Integrationsstrategie

Der Marktplatz wird als **separate Seite** (`marktplatz.html`) realisiert, nicht in die bestehende SPA integriert. Die Kern-App bleibt vollständig unverändert und offline-fähig.

```
index.html  ←── bestehend, keine Änderungen, offline-fähig
    ↓ "Forderung verkaufen"-Button exportiert anonymisierte Metadaten
marktplatz.html  ←── NEU, Supabase-abhängig, separate Seite
```

**Wichtig:** Der Service Worker (`sw.js`) muss angepasst werden, damit Supabase-API-URLs (*.supabase.co) nicht gecacht werden.

### 5.5 Row-Level Security (Datenschutz in der Datenbank)

```sql
-- Listings: Jeder sieht aktive Listings; nur eigener Seller darf ändern
CREATE POLICY "listings_select" ON listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Dokumente: Nur nach akzeptierter Inquiry sichtbar
CREATE POLICY "documents_select" ON listing_documents
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.listing_id = listing_documents.listing_id
        AND inquiries.buyer_id = auth.uid()
        AND inquiries.status = 'accepted'
    )
  );
```

### 5.6 Aufwandsschätzung

| Phase | Inhalt | Entwicklungsdauer | Kosten (800 €/Tag) |
|---|---|---|---|
| **MVP** | Supabase-Setup, Auth, Listing erstellen/browsen, Inquiry | 20–26 Arbeitstage | 16.000–21.000 € |
| **Beta** | Transaktionsmanagement, Dokument-Upload, Messaging, Dashboard | 23–31 Arbeitstage | 18.000–25.000 € |
| **Launch** | Payment-Integration, KYC, Admin-Panel, Monitoring | 26–42 Arbeitstage | 21.000–34.000 € |
| **Juristische Prüfung** | RDG, GwG, AGB — parallel | 4–8 Wochen extern | 5.000–15.000 € |
| **Infrastruktur/Monat** | Supabase Pro | — | 25–200 €/Monat |

**Gesamtinvestition MVP bis Launch: ca. 60.000–95.000 € + Rechtskosten**

### 5.7 Sofort umsetzbare Alternative (ohne Backend)

**"Anonymisierter Export + E-Mail-Vermittlung"** — realisierbar in 1–2 Tagen:
- "Forderung verkaufen"-Button generiert anonymisierte Zusammenfassung (ohne Schuldnerdaten)
- Weiterleitung an mailto: bei kuratiertem Käufernetzwerk
- Kein Backend, keine DSGVO-Serverproblematik, sofort live

Dies validiert die Marktnachfrage bevor in Infrastruktur investiert wird.

---

## 6. Feature-Expansion-Strategie

> *Basierend auf der Produktstrategie des Planner Agents.*

### 6.1 Kernthese

Vor dem Marktplatz muss Fordify drei Voraussetzungen erfüllen:
1. **Funktionale Parität** mit Desktop-Konkurrenz (XForderung, LAWgistic)
2. **Zahlende Nutzerbasis** durch Freemium-Modell
3. **Cloud-Infrastruktur** als technisches Fundament

### 6.2 Kurzfristige Features (0–6 Monate, Prio A)

Diese Features bauen direkt auf dem bestehenden Berechnungskern auf und erhöhen die rechtliche Vollständigkeit.

| # | Feature | Aufwand | Revenue-Impact | Strategische Relevanz |
|---|---|---|---|---|
| **1** | Excel/CSV-Export (SheetJS) | Gering | Hoch | Erster Pro-Feature-Kandidat |
| **2** | Mehrere Zinsmethoden (act/365, 30/360, act/360) | Gering | Mittel | Schließt Lücke zu 60tools |
| **3** | Vorlagen-System | Sehr gering | Mittel | Enorme Zeitersparnis für Kanzleien |
| **4** | Zahlungsplan-Generator (§ 367 BGB iterativ) | Mittel | Mittel | Alleinstellungsmerkmal im Web-Segment |
| **5** | Mahnschreiben-Generator | Mittel | Hoch | Natürlicher Workflow-Schritt |
| **6** | Fristenmanagement / Verjährungskalender | Mittel | Hoch | Haftungsrelevant — Anwälte lieben das |
| **7** | Vollstreckungstitel-Verwaltung (erweitert) | Sehr gering | Gering | Vervollständigt Stammdaten |

### 6.3 Mittelfristige Features (6–18 Monate, Prio B)

| # | Feature | Aufwand | Strategische Relevanz |
|---|---|---|---|
| **8** | Passwortschutz / AES-256 Verschlüsselung (Web Crypto API) | Mittel | Berufsrechtlich relevant (§ 43a BRAO) |
| **9** | PKH-Abrechnung (§ 49 RVG) | Mittel-Hoch | Erweiterung auf ~15–20 % aller Zivilverfahren |
| **10** | § 497 BGB Verbraucherdarlehen (abweichende Verrechnungsreihenfolge) | Mittel | Bankrecht-Segment erschließen |
| **11** | SEPA-Lastschrift-Vorlagen / Überweisungsträger | Gering | Workflow-Abrundung |
| **12** | Generischer CSV-Import (RA-MICRO, DATEV) | Hoch | Kanzleisoftware-Integration |
| **13** | ZV-Auftrag-Generierung (ZwVollstrFormV 2024) | Sehr hoch | Starkes Differenzierungsmerkmal |
| **14** | Inkasso-Beauftragung (Partner-Netzwerk, Provision) | Mittel (tech), Hoch (BD) | Erste externe Revenue-Quelle |

### 6.4 Plattform-Features (18–36 Monate, Prio C/D)

| # | Feature | Voraussetzung | Strategische Relevanz |
|---|---|---|---|
| **15** | Cloud-Sync + Nutzerkonten (E2E-verschlüsselt) | Backend-Entscheidung | Voraussetzung für alles Weitere |
| **16** | Multi-User / Kanzlei-Workspace (RBAC) | Cloud-Sync | Ermöglicht Kanzlei-Preistier |
| **17** | Mandanten-Portal (Read-Only-Link) | Cloud-Sync | Reduziert Kommunikationsaufwand |
| **18** | API v1 (Berechnung-as-a-Service) | Backend | B2B-Revenue-Quelle |
| **19** | Forderungsabtretungs-Marktplatz | Cloud-Sync + Rechtsklärung | Langfristiger Plattform-Peak |

### 6.5 Monetarisierungsstrategie

#### Empfehlung: Freemium-Modell

| Tier | Preis | Umfang |
|---|---|---|
| **Free** | 0 € | 3 aktive Fälle, alle Berechnungen, PDF-Export, localStorage |
| **Pro** | 14,90 €/Monat oder 149 €/Jahr | Unbegrenzte Fälle, XLSX/CSV-Export, Mahnschreiben, Vorlagen, Passwortschutz |
| **Kanzlei** | 49,90 €/Monat oder 499 €/Jahr | Pro + Cloud-Sync, Multi-User (bis 5), ZV-Auftrag, Priority-Support |

**Begründung:** Kernberechnung kostenlos als stärkstes Marketingargument. Monetarisierung über Produktivitätsfeatures, die für Vielnutzer relevant sind.

**Vergleich:** LAWgistic 34,90 € einmalig, XForderung 116 €/Jahr. Fordify Pro bei 149 €/Jahr ist wettbewerbsfähig mit Vorteil Browser-Zugang und automatische Updates.

#### Weitere Revenue-Quellen
- **Inkasso-Provision:** 5–15 % der realisierten Forderung (vom Inkassounternehmen bezahlt) — kein Kostenaufwand für Kanzlei-Nutzer
- **Marktplatz-Fee (langfristig):** 3–5 % Success-Fee auf Transaktionsvolumen
- **White-Label / API:** ab 99 €/Monat für Kanzleisoftware-Integration

### 6.6 Priorisierungsmatrix (Top-Features)

| Rang | Feature | Impact Nutzer | Impact Revenue | Aufwand | Score |
|---|---|---|---|---|---|
| 1 | Excel/CSV-Export | 4 | 4 | 2 | **+6** |
| 2 | Vorlagen-System | 4 | 3 | 1 | **+6** |
| 3 | Fristenmanagement | 4 | 3 | 2 | **+5** |
| 4 | Zahlungsplan-Generator | 4 | 3 | 3 | **+4** |
| 5 | Mahnschreiben-Generator | 4 | 4 | 3 | **+5** |
| 6 | Mehrere Zinsmethoden | 4 | 2 | 2 | **+4** |
| 7 | Cloud-Sync | 4 | 5 | 5 | **+4** (strategisch unverzichtbar) |
| 8 | ZV-Auftrag-Generierung | 4 | 3 | 5 | **+2** (wegen Aufwand zurückgestellt) |
| 9 | Marktplatz | 2 | 5 | 5 | **+2** (wegen Risiko/Aufwand) |

---

## 7. Gesamtbewertung & Empfehlung

### 7.1 Ist der Marktplatz eine gute Idee?

**Ja — aber nicht jetzt.**

Die strategische Logik ist überzeugend: Der Markt ist groß, die Lücke real, und Fordify sitzt an der richtigen Quelle. Kein anderer Anbieter hat Zugang zu qualifizierten Forderungsaufstellungen direkt aus Anwaltskanzleien.

Aber drei Voraussetzungen fehlen heute:
1. **Regulatorische Klarheit** — BaFin-Abstimmung fehlt
2. **Technische Infrastruktur** — Backend existiert noch nicht  
3. **Nutzerbasis** — ohne kritische Masse an Verkäufern gibt es kein Angebot für Käufer

### 7.2 Die Ein-Satz-Strategie

> Fordify wird in drei Stufen wachsen: **Werkzeug** (beste kostenlose Forderungsaufstellung) → **Produkt** (Freemium-SaaS für Kanzleien) → **Plattform** (Marktplatz für Forderungen) — wobei jede Stufe wirtschaftlich eigenständig tragfähig sein muss.

### 7.3 Was Fordify zu verlieren hat — und zu gewinnen

**Risiko bei zu schnellem Marktplatz-Launch:**
- BaFin-Einschreitung (Betrieb ohne Erlaubnis nach KWG)
- DSGVO-Datenschutzverletzung (Schuldnerdaten ohne DSFA)
- Reputationsschaden im Anwaltsmarkt (Vertrauen ist alles)

**Potenzial bei richtigem Timing:**
- Europas erste integrierte Lösung: Forderung berechnen + verkaufen
- Skalierbare Revenue-Quelle neben Abo-Einnahmen
- Netzwerkeffekte: mehr Verkäufer → mehr Käufer → bessere Preise → mehr Verkäufer

### 7.4 Kritische Erfolgsfaktoren

| Faktor | Bedeutung | Handlungsempfehlung |
|---|---|---|
| **Käuferliquidität** | Ohne Käufer kein Marktplatz | Käufernetzwerk vor MVP-Launch aufbauen (Partnerverträge) |
| **Regulatorische Klarheit** | BaFin-Risiko ist existenziell | Anwaltliche Prüfung Q2/Q3 2026 |
| **Vertrauen der Kanzleien** | Fehler bei Berechnung zerstören Fundament | Öffentliche Testmatrix, Berechnungs-Audit |
| **Cloud-Infrastruktur** | Voraussetzung für Marktplatz | 2026/2027 aufbauen |
| **Freemium-Conversion** | Finanziert weitere Entwicklung | Pro-Features müssen echten Pain lösen |

---

## 8. Roadmap

### Phase A: Werkzeug (Monate 1–6, 2026)
**Ziel:** Fordify wird die vollständigste Web-Forderungssoftware. Freemium-Launch.

| Monat | Feature |
|---|---|
| 1 | Mehrere Zinsmethoden (act/365, 30/360) |
| 1–2 | Excel/CSV-Export (SheetJS via CDN) |
| 2 | Vorlagen-System |
| 2–3 | Vollstreckungstitel-Verwaltung (erweitert) |
| 3–4 | Zahlungsplan-Generator |
| 4–5 | Mahnschreiben-Generator |
| 5–6 | Fristenmanagement / Verjährungskalender |
| **6** | **Freemium-Launch: Free (3 Fälle) / Pro (149 €/Jahr)** |

### Phase B: Produkt (Monate 7–18, 2026/2027)
**Ziel:** Kanzlei-Alltags-Integration, erste externe Revenue-Quelle.

| Zeitraum | Feature |
|---|---|
| M7 | Passwortschutz (Web Crypto API) |
| M7–8 | SEPA-Vorlagen |
| M8–9 | PKH-Abrechnung (§ 49 RVG) |
| M9–10 | CSV-Import (RA-MICRO, DATEV) |
| M10–12 | Inkasso-Partnerschaft (Vermittlungsmodell, CPA) |
| M12–14 | Stufe 1 Marktplatz: "Forderung verkaufen" → kuratierte Käufer |
| **M14** | **Kanzlei-Tier Launch: Cloud-Sync MVP + Multi-User** |

### Phase C: Plattform (Monate 19–36, 2027/2028)
**Ziel:** Vollständiger Marktplatz nach regulatorischer Klärung.

| Zeitraum | Feature |
|---|---|
| M19–22 | ZV-Auftrag-Generierung |
| M22–24 | **Juristische Prüfung Marktplatz** (RDG, KWG, GwG, AGB) + BaFin-Anfrage |
| M24–28 | Marktplatz MVP: Listing-Only, manuelle Kontaktvermittlung |
| M28–32 | Marktplatz v2: Transaktionsmanagement, Dokument-Upload, Payment-Provider |
| M32–36 | Marktplatz v3: Vollauktionsmechanismus, offene API, Käufer-Onboarding |

### Gantt-Übersicht

```
2026        Q2  Q3  Q4
Werkzeug    ████████
Freemium         ██
B-Features          ████

2027        Q1  Q2  Q3  Q4
B-Features  ████
Infrastruktur    ████
Rechts-Prüfung    ██
Marktplatz MVP        ████

2028        Q1  Q2
Marktplatz v2  ████
v3                 ██
```

---

## 9. Offene Fragen & nächste Schritte

### Sofortiger Handlungsbedarf

| Priorität | Aktion | Verantwortlich | Deadline |
|---|---|---|---|
| **Kritisch** | Anwaltliche Erstberatung: Ist Vermittlungsmodell (Stufe 1) ohne BaFin-Lizenz zulässig? | Jens / Andreas | Q2 2026 |
| **Hoch** | Entscheidung: Startet Fordify mit Freemium? Was sind die Pro-Features? | Jens | Q2 2026 |
| **Hoch** | Implementierung Excel/CSV-Export (ersten Pro-Feature-Kandidat) | Entwicklung | Q2 2026 |
| **Mittel** | Erstkontakt mit 2–3 potenziellen Inkasso-Partnern für Stufe-1-Vermittlung | Andreas | Q2/Q3 2026 |
| **Mittel** | Datenschutz-Folgenabschätzung beauftragen (für Zeitpunkt der Cloud-Einführung vorbereiten) | Jens / Andreas | Q3 2026 |

### Offene Rechtsfragen (für anwaltliche Klärung)

1. Fällt Fordifys Vermittlungsmodell (Stufe 1) unter § 32 KWG oder § 1 Abs. 1a Nr. 2 KWG?
2. Genügt "berechtigtes Interesse" nach Art. 6 Abs. 1 lit. f DSGVO für die Verarbeitung anonymisierter Listing-Metadaten?
3. Welche AGB-Mindestanforderungen gelten für das Vermittlungsmodell B2B?
4. Greift das GwG bei reiner Vermittlung (ohne eigene Zahlungsabwicklung)?

### Strategische Entscheidungspunkte

- **Wann beginnt der Freemium-Launch?** (Empfehlung: nach 5–6 Pro-Features, ca. Q4 2026)
- **Supabase vs. PocketBase** — DSGVO-Kontrolle vs. Betriebsaufwand?
- **Debitos-Partnerschaft prüfen:** Wäre White-Label-Anbindung möglich?
- **Wer baut die Backend-Infrastruktur?** (Fordify ist aktuell ein 2-Personen-Projekt)

---

## Anhang: Quellenverweise

- Debitos German NPL Outlook 2025 — debitos.com
- BKS NPL-Barometer 2025 — bks-ev.de
- Deutscher Factoring Verband: Markt 2024 — factoring.de
- BDIU: Inkasso und Forderungsmanagement — inkasso.de
- BaFin: Kreditzweitmarktgesetz 2024 — bafin.de
- Debexpert: NPL Trading Platforms Comparison 2025 — debexpert.com
- Creditreform: Forderungsverkauf — creditreform.de
- Inkasso 24 AG: Forderungsankauf — inkasso-24.de

---

*Erstellt April 2026 | Fordify Machbarkeitsstudie | Vertraulich*  
*Subagenten: Legal Advisor · Market Research (mit Web-Recherche) · Software Architect · Product Planner*
