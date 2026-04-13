# Machbarkeitsstudie: Fordify – Forderungsmarktplatz, Monetarisierung & Weiterentwicklung

**Version:** 2.0 (zusammengeführter Gesamtbericht)  
**Erstellt:** April 2026  
**Projektleitung:** Claude Sonnet 4.6 (Synthesebericht)  
**Subagenten:** Legal Advisor · Market Research · Software Architect · Product Planner · Pricing Research · DSGVO-Analyse  
**Status:** Interne Entscheidungsgrundlage — ersetzt keine anwaltliche Beratung

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [Das Konzept: Forderungsabtretungs-Marktplatz](#2-das-konzept-forderungsabtretungs-marktplatz)
3. [Rechtsanalyse](#3-rechtsanalyse)
4. [Markt- und Wettbewerbsanalyse](#4-markt--und-wettbewerbsanalyse)
5. [Monetarisierungskonzept: Free vs. Paid](#5-monetarisierungskonzept-free-vs-paid)
6. [Preisstruktur und Psychologie](#6-preisstruktur-und-psychologie)
7. [Payment Provider](#7-payment-provider)
8. [Technische Architektur](#8-technische-architektur)
9. [DSGVO und Datenschutz](#9-dsgvo-und-datenschutz)
10. [Feature-Expansion-Strategie](#10-feature-expansion-strategie)
11. [Marktplatz Modell A: Konkretisierung](#11-marktplatz-modell-a-konkretisierung)
12. [Umsatzpotenzial und Wachstumspfad](#12-umsatzpotenzial-und-wachstumspfad)
13. [Gesamtbewertung & Entscheidungsmatrix](#13-gesamtbewertung--entscheidungsmatrix)
14. [Roadmap](#14-roadmap)
15. [Launch-Checkliste](#15-launch-checkliste)
16. [Offene Fragen & nächste Schritte](#16-offene-fragen--nächste-schritte)
17. [Anhang: Quellenverweise](#17-anhang-quellenverweise)

---

## 1. Executive Summary

Fordify besitzt einen einzigartigen strategischen Vorteil: Als einziges Browser-Tool erstellt es rechtssichere Forderungsaufstellungen nach § 367 BGB direkt an der Quelle — in der Anwaltskanzlei. Ein Forderungsabtretungs-Marktplatz wäre die natürliche Verlängerung dieses Workflows: **Forderung berechnen → Forderung verkaufen.**

**Die zehn wichtigsten Erkenntnisse dieser Studie:**

1. **Der Markt ist groß und die Lücke ist real.** Der deutsche NPL-Markt wächst auf bis zu 60 Mrd. EUR (2026). Das Kleinforderungssegment (< 25.000 EUR) ist von keiner bestehenden Plattform adressiert.

2. **Das richtige Free Tier ist "kein Speichern + kein Export"** — nicht ein Limit auf N Fälle. Diese Kombination erzeugt den stärksten Upgrade-Druck genau im Moment des höchsten Nutzens.

3. **Paddle statt Stripe** — als Merchant of Record übernimmt Paddle alle USt-Compliance-Pflichten. Für ein 1–2-Personen-Startup spart das 10–20 Stunden/Monat an Steueradministration.

4. **Der Free/Paid-Architektur-Umbau ist in 2–3 Wochen umsetzbar** — dank einer sauber abgesteckten Storage-Abstraktionsschicht. Nur ~4 Funktionen müssen mit Feature-Gates gesichert werden.

5. **Der Marktplatz ist rechtlich grundsätzlich machbar, aber regulatorisch komplex.** Ein direkter Launch ohne Rechtsberatung wäre fahrlässig.

6. **Fordify wird mit dem Account-Modell zum DSGVO-Verantwortlichen** — mit klaren Pflichten. Kritischster Punkt: Supabase RLS vor Launch korrekt konfigurieren, AVV mit Kanzleien ist Pflicht.

7. **Der Marktplatz startet als reines "Schwarzes Brett"** (Modell A) — kein algorithmisches Matching, keine Zahlungsabwicklung auf der Plattform, minimales regulatorisches Risiko.

8. **Preise:** Solo 29 €/Monat (249 €/Jahr), Kanzlei 79 €/Monat (669 €/Jahr) — wettbewerbsfähig, unter der psychologischen B2B-Schwelle.

9. **5.000 € MRR-Ziel** ist bei 4 % Conversion und ~3.500 Free-Nutzern erreichbar — realistische 18-Monats-Perspektive.

10. **Drei-Stufen-Strategie:** Werkzeug → Produkt → Plattform — jede Stufe muss wirtschaftlich eigenständig tragfähig sein.

**Sofort-Empfehlungen:**
1. Den vollständigen Marktplatz **nicht sofort** bauen — regulatorische Klärung zuerst
2. In den nächsten 6 Monaten Fordify zur funktional vollständigsten Web-Forderungssoftware ausbauen
3. Freemium-Modell einführen und zahlende Nutzerbasis aufbauen (Free = kein Speichern, kein Export)
4. Payment Provider: Paddle integrieren, Supabase als Backend
5. Parallel: Anwaltliche Prüfung des Marktplatz-Konzepts (RDG, KWG, DSGVO)

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

**Entscheidung: Modell A starten, Modell B mittelfristig, Modell C erst nach BaFin-Abstimmung.**

---

## 3. Rechtsanalyse

> *Alle Einschätzungen sind Orientierungshilfen — keine verbindliche Rechtsauskunft.*

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

### 3.3 Regulierung: KWG und BaFin

| Regulierungsbereich | Risiko | Bewertung |
|---|---|---|
| § 32 KWG (Bankgeschäft) | Gering | Nur wenn Fordify selbst Forderungen kauft oder hält |
| § 1 Abs. 1a Nr. 2 KWG (Abschlussvermittlung) | **Mittel-Hoch** | Wenn Fordify aktiv in Vertragsschluss eingebunden ist |
| § 10 ZAG (Zahlungsdienste) | **Kritisch** | Wenn Fordify Gelder zwischen Parteien transferiert |
| Kreditzweitmarktgesetz (KrZwMG) | Gering | Gilt nur für Bankkredite, nicht private Forderungen |

**Wichtigste Maßnahme:** Zahlungsabwicklung vollständig an zugelassenen Payment-Provider auslagern (Stripe Connect, Mangopay o.ä.). Fordify darf zu keinem Zeitpunkt Zahlungsmittel auf eigenem Konto halten.

**BaFin-Anfrage:** Für Modell B/C ist eine informelle BaFin-Anfrage nach § 4 FinDAG vor dem Launch ausdrücklich empfohlen. Kostengünstig, schafft Rechtssicherheit.

### 3.4 Geldwäsche (GwG) und KYC

Fordify selbst ist bei reinem Vermittlungsmodell nicht GwG-verpflichtet. Dennoch sind Mindest-KYC-Maßnahmen dringend empfohlen:
- Verifikation der Unternehmensidentität (Handelsregister)
- Sanktionslisten-Screening (EU-Sanktionsliste, OFAC)
- Ablehnung anonym agierender Nutzer

Payment-Provider (Stripe, Mangopay) verlangen ohnehin KYC-Prüfung ihrer Plattformnutzer.

### 3.5 Datenschutz (DSGVO) — Marktplatz-spezifisch

**Schuldnerdaten sind das Kernproblem:** Der Schuldner ist kein Vertragspartner der Plattform. Seine Daten können nicht auf Art. 6 Abs. 1 lit. b gestützt werden. Ein berechtigtes Interesse (lit. f) ist argumentierbar, muss aber sorgfältig dokumentiert werden.

**Designprinzip:** Schuldnerdaten dürfen den Browser nie verlassen. Das Listing enthält nur anonymisierte Metadaten (z.B. "Titulierte Forderung, 12.500 EUR, gewerblicher Schuldner, AG-Bezirk Köln"). Schuldneridentität wird erst nach beidseitiger Freigabe außerhalb der Plattform offengelegt.

> Für das vollständige Account-Modell-DSGVO-Konzept: siehe [Kapitel 9](#9-dsgvo-und-datenschutz).

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

### 3.7 Mindestvoraussetzungen für legalen Betrieb des Marktplatzes

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
- Stark im KMU-Segment, aber kein Preiswettbewerb zwischen Käufern

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

## 5. Monetarisierungskonzept: Free vs. Paid

### 5.1 Das Design-Prinzip

Das Free Tier soll nützlich genug sein, dass Anwälte das Tool kennenlernen und die Qualität verstehen — aber unbequem genug, dass regelmäßige Nutzer upgraden. Die entscheidende Frage: **An welchem Punkt im Workflow entsteht der größte Schmerz?**

**Antwort:** Beim Export. Der Anwalt hat 20 Minuten an einer Forderungsaufstellung gearbeitet, sieht das perfekte Ergebnis in der Vorschau — und dann blockiert ein Gate. Das ist der "Aha-Moment" in umgekehrter Richtung: vollständige Arbeit, kein Zugang zum Ergebnis.

### 5.2 Free Tier — Ausgestaltung

| Aspekt | Ausgestaltung | Begründung |
|---|---|---|
| **Speicherung** | Nein — sessionStorage (geht beim Tab-Schließen verloren) | Stärkster emotionaler Trigger: aktiver Datenverlust |
| **Export: PDF/Drucken** | Nein — Gate mit Upgrade-Modal | Blockiert im Moment des höchsten Nutzens |
| **Export: Excel/JSON** | Nein | Gleiches Gate |
| **Kanzlei-Profil/Impressum** | Nur session-temporär | Kein Logo, kein Kanzlei-Header ohne Account |
| **Forderungsaufstellung selbst** | Vollständig nutzbar | Kompetenz und Qualität demonstrieren |
| **RVG, GKG, Zinsen** | Vollständig nutzbar | Kein Wasserzeichen im Ergebnis |
| **Anzahl Fälle** | Unbegrenzt (pro Session) | Komplexitätsbarrieren erzeugen unnötige Frustration |

**Was Free-Nutzer sehen:** Die vollständige Vorschau ihrer Forderungsaufstellung — mit korrekten Zahlen, korrektem § 367 BGB-Layout, funktionierender Zusammenfassung. Sie sehen, was Fordify kann. Dann das Gate.

**Was Free-Nutzer NICHT sehen:** Wasserzeichen. Das ist essentiell — im professionellen B2B-Kontext ist ein Wasserzeichen auf einem Rechtsdokument inakzeptabel und beschädigt die Marke.

**Wichtige Kommunikation:** Beim App-Start ein dezenter, dauerhafter Banner: *"Testversion — Daten werden nicht gespeichert. Erstelle einen kostenlosen Account oder teste 14 Tage Pro."* Keine versteckte Friction.

### 5.3 Paid Tiers — Ausgestaltung

**Solo / Pro** (Einzelanwalt oder kleinste Kanzlei):
- Unbegrenzte Fälle, dauerhaft gespeichert (Cloud)
- PDF-Export, Excel-Export, JSON-Import/Export
- Kanzlei-Profil, Logo, Impressum dauerhaft gespeichert
- 1 Nutzer
- Zugang zum Marktplatz (Listings einstellen)

**Kanzlei / Team** (ab 2 Anwälten):
- Alles aus Solo
- Bis zu 5 Nutzer
- Kontaktverwaltung (Schuldner-Adressbuch)
- Fallvorlagen (teamweit geteilt)
- Prioritäts-Support

### 5.4 Feature-Tabelle (Vollständig)

| Feature | Free | Solo (Pro) | Kanzlei (Team) |
|---|---|---|---|
| Forderungsaufstellung § 367 BGB | ✅ | ✅ | ✅ |
| Zinsenberechnung, RVG, GKG | ✅ | ✅ | ✅ |
| Mehrere Hauptforderungen | ✅ | ✅ | ✅ |
| Tilgungsbestimmung | ✅ | ✅ | ✅ |
| Zahlungsplan-Generator (geplant) | ✅ | ✅ | ✅ |
| Forderungsvorschau | ✅ | ✅ | ✅ |
| **Speicherung** | ❌ (Session) | ✅ Cloud | ✅ Cloud |
| **PDF / Drucken** | ❌ | ✅ | ✅ |
| **Excel- / CSV-Export** | ❌ | ✅ | ✅ |
| **JSON-Export** | ❌ | ✅ | ✅ |
| **Kanzlei-Profil dauerhaft** | ❌ | ✅ | ✅ |
| **Logo dauerhaft** | ❌ | ✅ | ✅ |
| **Mehrere Nutzer** | ❌ | ❌ | ✅ (bis 5) |
| **Kontaktverwaltung** | ❌ | ❌ | ✅ |
| **Fallvorlagen (teamweit)** | ❌ | ❌ | ✅ |
| **Marktplatz: Listing einstellen** | ❌ | ✅ | ✅ |
| Support | Community | E-Mail | Priority |

---

## 6. Preisstruktur und Psychologie

### 6.1 Marktkontext

| Wettbewerber | Preis | Modell |
|---|---|---|
| LAWgistic (Forderungsmanagement) | 29,90 €/Monat/Modul | Abo |
| Smartlaw Business (Wolters Kluwer) | 49,90 €/Monat | Abo |
| KanzLaw (Cloud-Kanzleisoftware) | ab 24,90 €/Monat | Abo |
| RA-MICRO Essentials | ab 25 €/Monat/AP | Abo |
| XForderung | ~116 €/Jahr | Jahresabo |

**Positionierung:** Fordify soll zwischen XForderung (zu günstig, einmalig, Desktop) und LAWgistic (zu komplex, teuer) liegen — fokussiert, browserbasiert, fair bepreist.

### 6.2 Empfohlene Preistabelle

| Tier | Monatlich | Jährlich | Effektiv/Monat | Ersparnis |
|---|---|---|---|---|
| **Free** | 0 € | — | — | — |
| **Solo / Pro** | 29 €/Monat | **249 €/Jahr** | 20,75 €/Monat | spart 99 €/Jahr |
| **Kanzlei / Team** | 79 €/Monat | **669 €/Jahr** | 55,75 €/Monat | spart 279 €/Jahr |

### 6.3 Psychologische Begründung der Preispunkte

**29 € monatlich:**
- "Weniger als eine einzige Stunde Anwaltshonorar"
- Unter der 30 €-Schwelle (psychologisch gängige B2B-Kaufschwelle)
- Jahres-Kommunikation: "Spart 99 € gegenüber monatlich" — konkrete Euro-Zahl, keine %-Angabe (Anwälte denken in Beträgen, nicht Prozenten)

**79 € monatlich / Team:**
- Bei 5 Nutzern: 15,80 €/Nutzer — billiger als Solo-Einzellizenz
- Jahresrabatt 29 % ist aggressiv, aber gerechtfertigt: Fordify braucht Jahres-Cashflow, Kanzleien schätzen Planungssicherheit

**Jahresabo als Standard kommunizieren:**
- Preisseite zeigt Jahrespreise prominent, monatlich als Option dahinter
- Paddle ermöglicht einfaches Umschalten

### 6.4 Freemium-Conversion-Benchmarks

| Modell | B2B-Benchmark | Für Fordify |
|---|---|---|
| Freemium B2B allgemein | 2–5 % | 3–5 % realistisch |
| Top-Performer Freemium | 6–8 % | Mittelfristig mit gutem Onboarding |
| Free Trial (14 Tage, zeitlich begrenzt) | 15–25 % | Bei "14 Tage Pro kostenlos" |

**Empfehlung:** Free Tier + optionaler 14-Tage-Pro-Trial ohne Kreditkarte. Der Trial senkt die Einstiegshürde erheblich und erzeugt die stärkste Conversion.

### 6.5 Einmalig vs. Abo — Entscheidung

**Entscheidung: Abo.** Kein Einmalkauf.

Begründung:
- Fordify erfordert laufende Updates (Basiszinssätze, RVG-Tabelle, GKG-Tabelle)
- Anwälte sind Abo-gewohnt (beA, Juris, Beck Online, RA-MICRO)
- Planbarkeit des MRR ermöglicht Weiterentwicklung
- Ein Einmalkauf würde "Was bekomme ich für den Preis?" aufwerfen — beim Abo ist die Antwort: "Immer aktuelle Berechnungsbasis"

---

## 7. Payment Provider

### 7.1 Vergleich der Kandidaten

| Anbieter | Typ | Gebühren | USt-Pflicht | SEPA | B2B-Rechnung | Empfehlung |
|---|---|---|---|---|---|---|
| **Paddle** | Merchant of Record | 5 % + 0,50 $ | Paddle übernimmt komplett | ✅ | ✅ inkl. Reverse Charge | **Empfohlen** |
| **Stripe** | Payment Processor | 1,4 % + 0,25 € + 0,7 % Billing | Fordify verantwortlich | ✅ | ✅ (mit Steuerberater) | Alternative ab ~50K MRR |
| **FastSpring** | Merchant of Record | ~5–9 % | FastSpring übernimmt | Eingeschränkt | ✅ | Zu komplex für MVP |
| **Digistore24** | Platform | 7,9 % + 1 € | Eingeschränkt | Eingeschränkt | Nein | Nicht geeignet |
| **Copecart** | Platform | 4,9 % + 1 € | Eingeschränkt | Eingeschränkt | Nein | Nicht geeignet |

### 7.2 Paddle — Detailanalyse (Empfehlung)

**Warum Paddle für Fordify:**

- **Merchant of Record:** Paddle kauft das Produkt von Fordify und verkauft es weiter an den Endkunden. Damit ist Paddle der rechtliche Verkäufer — alle USt-Pflichten (EU-weite USt, MOSS-Verfahren, Reverse Charge für B2B) liegen bei Paddle. Fordify stellt nur eine Rechnung an Paddle.
- **Kein Backend erforderlich:** Paddle bietet gehostete Checkout-Links und ein Customer Self-Service-Portal — Fordify muss keine Zahlungslogik selbst implementieren.
- **B2B-optimiert:** Rechnungen mit ausgewiesener MwSt. und Reverse Charge für EU-Unternehmenskunden werden automatisch erstellt.
- **SEPA-Lastschrift verfügbar:** Für deutsche Kanzleien mit Präferenz für Bankeinzug.

**Kostenkalkulation Paddle vs. Stripe bei 5.000 € MRR:**

| Anbieter | Transaktionsgebühren/Monat | Steuerberater/Monat (Schätzung) | Gesamt |
|---|---|---|---|
| Paddle (5 % + 0,50$/Tx) | ~275 € | 0 € | ~275 € |
| Stripe (2,1 % + 0,7 % Billing) | ~140 € | ~200–400 € | ~340–540 € |

**Fazit:** Paddle ist bei kleinem MRR trotz höherer Transaktionsgebühr günstiger, weil es Steuer-Compliance-Aufwand eliminiert.

**Ab wann Stripe sinnvoll?** Ab ~50.000 € MRR, wenn ein dedizierter Steuerberater ohnehin vorhanden ist und mehr Checkout-Flexibilität gewünscht wird.

### 7.3 Checkout-Integration (technisch)

Paddle funktioniert komplett ohne Backend:

```html
<!-- Paddle.js via CDN, nur auf Pricing-Seite laden -->
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>
  Paddle.Setup({ token: "live_xxxx" });
</script>

<!-- Checkout-Button -->
<button onclick="Paddle.Checkout.open({
  items: [{ priceId: 'pri_solo_monthly', quantity: 1 }],
  customer: { email: fordifyAuth.user?.email }
})">Jetzt upgraden</button>
```

Paddle sendet Webhook an eine Supabase Edge Function → schreibt Subscription-Status in die `subscriptions`-Tabelle → App liest Status beim nächsten Login.

---

## 8. Technische Architektur

### 8.1 Was dem aktuellen Stack fehlt (Marktplatz-Anforderungen)

| Anforderung | Aktueller Stand | Lücke |
|---|---|---|
| Authentifizierung | Keine | Komplett neu aufzubauen |
| Persistente Server-Daten | Nur localStorage | Datenbank erforderlich |
| Multi-User-Zugriff | Single-Browser | Server-seitige API nötig |
| Transaktionsverwaltung | Keine | Zustandsmaschine für Kaufprozesse |
| Kommunikation zwischen Nutzern | Keine | Messaging oder Kontaktanfragen |
| Zahlungsabwicklung | Keine | Payment-Integration |

**Kernproblem:** Der bisherige DSGVO-Vorteil ("keine Daten verlassen den Browser") wird durch den Marktplatz vollständig aufgehoben. Das ist eine strategische Kehrtwende — keine reine Feature-Ergänzung.

### 8.2 Empfohlener Backend-Stack: Supabase

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

### 8.3 Free/Paid-Umbau der bestehenden SPA: Storage-Abstraktionsschicht

Die bestehende App verwendet localStorage direkt an ~12 Stellen in `app.js`. Der Umbau führt eine **Storage-Abstraktionsschicht** ein:

```
Free (kein Account)  →  sessionStorage  (geht beim Tab-Schließen verloren)
Paid (eingeloggt)    →  localStorage    (als Cache) + Supabase Cloud
```

**Warum sessionStorage statt In-Memory?**
- Überlebt Page-Refreshes im gleichen Tab → kein Datenverlust bei versehentlichem F5
- Wird beim Tab-Schließen automatisch gelöscht → gewünschtes Free-Tier-Verhalten
- Identische API zu localStorage → minimaler Umbauaufwand

#### Neue Dateistruktur

```
frontend/js/
├── app.js              ← angepasst (Storage-Calls → StorageBackend)
├── auth.js             ← NEU: Supabase Auth, Session-Management
├── storage.js          ← NEU: StorageBackend-Abstraktion + CloudSync
├── zinsen.js           ← unverändert
├── rvg.js              ← unverändert
├── verrechnung.js      ← unverändert
└── data.js             ← unverändert
```

#### Storage-Abstraktionsschicht (Kern)

```javascript
// storage.js
const StorageBackend = {
  _backend: null,
  _cloudSync: null,

  init(authState) {
    if (authState.isAuthenticated && authState.hasSubscription) {
      this._backend = localStorage;       // Paid: localStorage als Cache
      this._cloudSync = new CloudSync();   // + Supabase-Sync
    } else {
      this._backend = sessionStorage;      // Free: Session-only
      this._cloudSync = null;
    }
  },

  getItem(key) { return this._backend.getItem(key); },
  setItem(key, value) {
    this._backend.setItem(key, value);
    if (this._cloudSync) this._cloudSync.enqueue(key, value);
  },
  removeItem(key) {
    this._backend.removeItem(key);
    if (this._cloudSync) this._cloudSync.enqueueDelete(key);
  }
};

// Ausnahmen: immer localStorage (nie sicherheitsrelevant)
// fordify_theme, fordify_onboarded → direkt localStorage, nicht über Backend
```

### 8.4 Feature-Gates (Export-Sperre)

Nur **4 Funktionen** müssen gesperrt werden:

```javascript
function requiresPaid(featureName) {
  if (fordifyAuth.hasSubscription) return false;
  zeigeUpgradeModal(featureName);
  return true;
}

function drucken()              { if (requiresPaid("drucken")) return; /* … */ }
function fallExportieren()      { if (requiresPaid("export"))  return; /* … */ }
function falTeilen()            { if (requiresPaid("teilen"))  return; /* … */ }
function einstellungenExport()  { if (requiresPaid("export"))  return; /* … */ }
```

**Soft-Gate (empfohlen):** Buttons bleiben sichtbar, aber mit "PRO"-Badge. Nutzer sieht, was er nicht hat — stärkerer Upgrade-Anreiz als ausgeblendete Buttons.

```css
[data-requires-paid].feature-locked {
  opacity: 0.65;
  position: relative;
}
[data-requires-paid].feature-locked::after {
  content: "PRO";
  font-size: 0.6rem;
  background: #f59e0b;
  color: #000;
  padding: 1px 4px;
  border-radius: 3px;
  position: absolute;
  top: -6px;
  right: -6px;
  font-weight: 700;
}
```

### 8.5 Supabase Auth (Magic Link)

Kein Passwort — Magic Link ist ideal für Anwälte (professionell, kein Passwort-Management):

```javascript
// auth.js
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loginMitEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (!error) zeigeInfoModal("Link gesendet", "Prüfe dein Postfach.");
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    ladeSubscriptionStatus().then(() => {
      StorageBackend.init(fordifyAuth);
      migrateSessionToCloud();   // Bestehende Session-Daten retten
      aktualisiereUIFuerAuth();
    });
  }
  if (event === "SIGNED_OUT") {
    fordifyAuth.isAuthenticated = false;
    fordifyAuth.hasSubscription = false;
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
  }
});
```

### 8.6 Supabase-Datenmodell

```sql
-- Profiles (erweitert auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  firma TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions (via Paddle-Webhook befüllt)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT,
  status TEXT DEFAULT 'inactive',  -- 'active', 'trialing', 'canceled'
  plan TEXT DEFAULT 'pro',         -- 'pro', 'team'
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fälle (JSONB — Fall-Objekt komplett gespeichert, keine Normalisierung)
CREATE TABLE cases (
  id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  data JSONB NOT NULL,
  naechste_id INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

-- Einstellungen (Kanzlei-Profil, Logo)
CREATE TABLE settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts (Schuldner-Adressbuch — Team-Tier)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strasse TEXT, plz TEXT, ort TEXT,
  email TEXT, telefon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS für alle Tabellen
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Nutzer sehen nur eigene Daten
CREATE POLICY "own_data" ON cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sub" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
```

**Warum JSONB für Fälle?** Das Fall-Objekt ist ein komplexes, variabel typisiertes JSON. Normalisierung würde enormen Umbauaufwand erzeugen ohne Mehrwert — es gibt keine Cross-Case-Queries.

### 8.7 Cloud-Sync (Debounced)

```javascript
class CloudSync {
  enqueue(key, value) {
    this._queue = this._queue.filter(i => i.key !== key);  // Deduplizieren
    this._queue.push({ key, value });
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._sync(), 2000);    // 2s Debounce
  }

  async _sync() {
    for (const item of this._queue) {
      if (item.key === STORAGE_KEY_CASES)    await this._syncCases(item.value);
      if (item.key === STORAGE_KEY_SETTINGS) await this._syncSettings(item.value);
    }
    this._queue = [];
  }
}
```

**Cloud-Primary mit localStorage als Cache** — kein Offline-First (zu komplex für MVP). Wenn Supabase-Call fehlschlägt, funktioniert die App mit lokalem Cache weiter.

### 8.8 Bestandsnutzer-Migration (kritisch)

Bestandsnutzer haben Daten in localStorage aus der Zeit vor dem Umbau. Beim ersten Login:

```javascript
async function migrateSessionToCloud() {
  const legacyData = localStorage.getItem(STORAGE_KEY_CASES);
  if (!legacyData) return;

  const reg = JSON.parse(legacyData);
  const count = Object.keys(reg.cases || {}).length;
  if (count === 0) return;

  if (!confirm(`${count} lokale(r) Fall/Fälle gefunden. In die Cloud übernehmen?`)) return;

  for (const c of Object.values(reg.cases)) {
    await supabase.from("cases").upsert({
      id: c.id, user_id: fordifyAuth.user.id,
      name: c.name, data: c.fall,
      naechste_id: c.naechsteId,
      updated_at: c.updatedAt
    });
  }

  localStorage.removeItem(STORAGE_KEY_CASES);
  localStorage.removeItem(STORAGE_KEY_SETTINGS);
}
```

**Wichtig:** Vor dem Freemium-Launch müssen Bestandsnutzer kommuniziert werden, dass das Modell sich ändert. Keine abrupte Umstellung ohne Vorwarnung (mind. 4 Wochen).

### 8.9 Marktplatz-Infrastruktur (Modell B/C, langfristig)

```
index.html  ←── bestehend, keine Änderungen, offline-fähig
    ↓ "Forderung verkaufen"-Button exportiert anonymisierte Metadaten
marktplatz.html  ←── NEU, Supabase-abhängig, separate Seite
```

```sql
-- Marktplatz-Erweiterung (zusätzlich zu obigem Schema)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  betrag_klasse TEXT,   -- '0-10k', '10k-50k', '50k-250k', '250k+'
  forderungstyp TEXT,   -- 'kaufpreis', 'darlehen', 'miete', ...
  region TEXT,          -- Bundesland
  tituliert BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '90 days'
);

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security Marktplatz
CREATE POLICY "listings_public" ON listings
  FOR SELECT USING (status = 'active');
CREATE POLICY "listings_own" ON listings
  FOR ALL USING (seller_id = auth.uid());

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

### 8.10 Implementierungsaufwand

#### Free/Paid SPA-Umbau

| Phase | Inhalt | Aufwand |
|---|---|---|
| 1 | StorageBackend + sessionStorage für Free | 2–3 Tage |
| 2 | Supabase Auth + Login-Modal | 2–3 Tage |
| 3 | Cloud-Speicherung Cases + Settings | 3–4 Tage |
| 4 | Feature-Gates (Export/Drucken) + Upgrade-Modal | 1–2 Tage |
| 5 | Paddle-Webhook → Supabase Edge Function | 2–3 Tage |
| 6 | Migration Bestandsnutzer + Edge Cases | 2–3 Tage |
| **Gesamt** | **MVP Free/Paid** | **~2–3 Wochen** |

#### Vollständiger Marktplatz (Modell B/C, langfristig)

| Phase | Inhalt | Entwicklungsdauer | Kosten (800 €/Tag) |
|---|---|---|---|
| **MVP** | Supabase-Setup, Auth, Listing erstellen/browsen, Inquiry | 20–26 Arbeitstage | 16.000–21.000 € |
| **Beta** | Transaktionsmanagement, Dokument-Upload, Messaging, Dashboard | 23–31 Arbeitstage | 18.000–25.000 € |
| **Launch** | Payment-Integration, KYC, Admin-Panel, Monitoring | 26–42 Arbeitstage | 21.000–34.000 € |
| **Juristische Prüfung** | RDG, GwG, AGB — parallel | 4–8 Wochen extern | 5.000–15.000 € |
| **Infrastruktur/Monat** | Supabase Pro | — | 25–200 €/Monat |

**Gesamtinvestition vollständiger Marktplatz: ca. 60.000–95.000 € + Rechtskosten**

---

## 9. DSGVO und Datenschutz

> *Alle Einschätzungen sind Orientierungshilfen — keine verbindliche Rechtsberatung.*

### 9.1 Was sich ändert: Fordify wird Verantwortlicher

**Aktuell:** Keine Daten verlassen den Browser. Fordify ist kein DSGVO-Verantwortlicher.  
**Mit Account-Modell:** Daten werden auf Supabase-Servern (AWS Frankfurt) gespeichert. Fordify wird zum Verantwortlichen nach Art. 4 Nr. 7 DSGVO.

Das ist eine fundamentale Statusänderung mit konkreten Pflichten.

### 9.2 Rechtsgrundlagen

| Verarbeitungszweck | Rechtsgrundlage | Anmerkung |
|---|---|---|
| Account-Erstellung (E-Mail) | Art. 6 Abs. 1 lit. b DSGVO | Vertragsdurchführung |
| Kanzlei-Profil, Logo | Art. 6 Abs. 1 lit. b DSGVO | Kernfunktion |
| Falldaten des Nutzers selbst | Art. 6 Abs. 1 lit. b DSGVO | Kernfunktion |
| Schuldnerdaten im Fall | **Fordify als Auftragsverarbeiter** | Anwalt ist Verantwortlicher — AVV erforderlich |
| Kontaktverwaltung (Schuldner-Adressbuch) | Art. 6 Abs. 1 lit. f DSGVO | Berechtigtes Interesse |

### 9.3 Schuldnerdaten — Das Kernproblem

Schuldner-Namen und -Adressen werden in Falldaten gespeichert. Der Schuldner ist kein Vertragspartner von Fordify.

**Empfohlene Konstruktion: Fordify als Auftragsverarbeiter**

```
Schuldner ← betroffen von →  Anwalt (Verantwortlicher)
                                   ↓ erteilt Weisungen
                              Fordify (Auftragsverarbeiter)
                                   ↓ nutzt
                              Supabase (Sub-Auftragsverarbeiter)
```

Der Anwalt trägt die Verantwortung für die Rechtmäßigkeit der Schuldnerdaten-Verarbeitung. Fordify stellt nur die technische Infrastruktur bereit.

**Konsequenz:** Fordify muss einen **AVV mit den Kanzleien/Anwälten** abschließen (Art. 28 DSGVO). Fordify darf Schuldnerdaten ausschließlich weisungsgebunden, nur für den Vertragszweck verwenden — nicht für eigene Zwecke (kein KI-Training, keine Marktplatz-Weitergabe ohne explizite Freigabe).

### 9.4 AVV mit Supabase

Supabase bietet eine Standard-DPA an, die Art. 28 DSGVO abdeckt. Da der Hosting-Standort AWS Frankfurt (eu-central-1) ist, findet keine Drittstaaten-Übermittlung statt.

**Aktionsschritte:**
1. Supabase DPA im Dashboard explizit akzeptieren und Bestätigung dokumentieren
2. Supabase-Projekteinstellungen: EU-Region Frankfurt verifizieren und screenshotten
3. Supabase's Subauftragsverarbeiter-Liste im VVT dokumentieren

### 9.5 DSFA (Art. 35 DSGVO)

Eine DSFA ist für das Account-Modell in seiner Grundform **nicht zwingend erforderlich** (keine Pflichtfälle des Art. 35 Abs. 3 DSGVO). Eine freiwillige, dokumentierte Risikoabschätzung ist jedoch empfohlen und dient als Nachweis der Rechenschaftspflicht.

### 9.6 Technisch-Organisatorische Maßnahmen (TOM, Art. 32 DSGVO)

| Maßnahme | Konkret |
|---|---|
| **RLS in Supabase** | Kritischste Maßnahme — Nutzer sehen nur eigene Daten. Vor Launch mit zwei Test-Accounts testen. |
| Verschlüsselung Transit | TLS 1.2+ (Supabase Standard) |
| Verschlüsselung at Rest | AES-256 (AWS S3/EBS, Supabase Standard) |
| Passwort-Hashing | bcrypt (Supabase Auth Standard) |
| Kein service_role Key im Frontend | Nur anon Key, RLS schützt Daten |
| Session-Timeout | JWT-Expiry konfigurieren (z.B. 8h Inaktivität) |
| Löschfunktion | Account-Löschung löscht alle verbundenen Datensätze kaskadierend |

### 9.7 Cookies und Tracking bei Paddle

- Paddle-JS nur auf der expliziten Checkout-/Upgrade-Seite laden (nicht auf der Haupt-App)
- Da Checkout nur für eingeloggte Paid-Nutzer relevant ist: Minimal-Exposure
- Datenschutzerklärung muss Paddle als Drittanbieter nennen

### 9.8 Löschkonzept

| Datentyp | Löschfrist nach Kündigung |
|---|---|
| Falldaten, Einstellungen, Kontakte | Unverzüglich (max. 30 Tage) |
| Account-E-Mail | Unverzüglich |
| Zahlungsbelege (Rechnungen an Nutzer) | 10 Jahre (§ 147 AO) |
| Backup-Daten in Supabase | Backup-Retention ≤ 30 Tage konfigurieren |

---

## 10. Feature-Expansion-Strategie

### 10.1 Kernthese

Vor dem Marktplatz muss Fordify drei Voraussetzungen erfüllen:
1. **Funktionale Parität** mit Desktop-Konkurrenz (XForderung, LAWgistic)
2. **Zahlende Nutzerbasis** durch Freemium-Modell
3. **Cloud-Infrastruktur** als technisches Fundament

### 10.2 Kurzfristige Features (0–6 Monate, Prio A)

| # | Feature | Aufwand | Revenue-Impact | Strategische Relevanz |
|---|---|---|---|---|
| **1** | Excel/CSV-Export (SheetJS) | Gering | Hoch | Erster Pro-Feature-Kandidat |
| **2** | Mehrere Zinsmethoden (act/365, 30/360, act/360) | Gering | Mittel | Schließt Lücke zu 60tools |
| **3** | Vorlagen-System | Sehr gering | Mittel | Enorme Zeitersparnis für Kanzleien |
| **4** | Zahlungsplan-Generator (§ 367 BGB iterativ) | Mittel | Mittel | Alleinstellungsmerkmal im Web-Segment |
| **5** | Mahnschreiben-Generator | Mittel | Hoch | Natürlicher Workflow-Schritt |
| **6** | Fristenmanagement / Verjährungskalender | Mittel | Hoch | Haftungsrelevant — Anwälte lieben das |
| **7** | Vollstreckungstitel-Verwaltung (erweitert) | Sehr gering | Gering | Vervollständigt Stammdaten |

### 10.3 Mittelfristige Features (6–18 Monate, Prio B)

| # | Feature | Aufwand | Strategische Relevanz |
|---|---|---|---|
| **8** | Passwortschutz / AES-256 (Web Crypto API) | Mittel | Berufsrechtlich relevant (§ 43a BRAO) |
| **9** | PKH-Abrechnung (§ 49 RVG) | Mittel-Hoch | Erweiterung auf ~15–20 % aller Zivilverfahren |
| **10** | § 497 BGB Verbraucherdarlehen (abweichende Verrechnungsreihenfolge) | Mittel | Bankrecht-Segment erschließen |
| **11** | SEPA-Lastschrift-Vorlagen / Überweisungsträger | Gering | Workflow-Abrundung |
| **12** | Generischer CSV-Import (RA-MICRO, DATEV) | Hoch | Kanzleisoftware-Integration |
| **13** | ZV-Auftrag-Generierung (ZwVollstrFormV 2024) | Sehr hoch | Starkes Differenzierungsmerkmal |
| **14** | Inkasso-Beauftragung (Partner-Netzwerk, Provision) | Mittel (tech), Hoch (BD) | Erste externe Revenue-Quelle |

### 10.4 Plattform-Features (18–36 Monate, Prio C/D)

| # | Feature | Voraussetzung | Strategische Relevanz |
|---|---|---|---|
| **15** | Multi-User / Kanzlei-Workspace (RBAC) | Cloud-Sync | Ermöglicht Kanzlei-Preistier |
| **16** | Mandanten-Portal (Read-Only-Link) | Cloud-Sync | Reduziert Kommunikationsaufwand |
| **17** | API v1 (Berechnung-as-a-Service) | Backend | B2B-Revenue-Quelle |
| **18** | Forderungsabtretungs-Marktplatz | Cloud-Sync + Rechtsklärung | Langfristiger Plattform-Peak |

### 10.5 Weitere Revenue-Quellen

- **Inkasso-Provision:** 5–15 % der realisierten Forderung (vom Inkassounternehmen bezahlt) — kein Kostenaufwand für Kanzlei-Nutzer
- **Marktplatz-Fee (langfristig):** 3–5 % Success-Fee auf Transaktionsvolumen
- **White-Label / API:** ab 99 €/Monat für Kanzleisoftware-Integration

### 10.6 Priorisierungsmatrix (Top-Features)

| Rang | Feature | Impact Nutzer | Impact Revenue | Aufwand | Score |
|---|---|---|---|---|---|
| 1 | Excel/CSV-Export | 4 | 4 | 2 | **+6** |
| 2 | Vorlagen-System | 4 | 3 | 1 | **+6** |
| 3 | Fristenmanagement | 4 | 3 | 2 | **+5** |
| 4 | Mahnschreiben-Generator | 4 | 4 | 3 | **+5** |
| 5 | Zahlungsplan-Generator | 4 | 3 | 3 | **+4** |
| 6 | Mehrere Zinsmethoden | 4 | 2 | 2 | **+4** |
| 7 | Cloud-Sync | 4 | 5 | 5 | **+4** (strategisch unverzichtbar) |
| 8 | ZV-Auftrag-Generierung | 4 | 3 | 5 | **+2** (wegen Aufwand zurückgestellt) |
| 9 | Marktplatz | 2 | 5 | 5 | **+2** (wegen Risiko/Aufwand) |

---

## 11. Marktplatz Modell A: Konkretisierung

### 11.1 Das Flohmarkt-Prinzip

Modell A ist bewusst minimalistisch:

- Anbieter (Anwälte) stellen **anonymisierte** Forderungsmetadaten als Listing ein
- Interessenten können browsen und **Kontaktanfrage** stellen
- Fordify übermittelt E-Mail des Anbieters an Interessenten nach Anfrage
- Vertrag kommt **direkt zwischen Parteien** zustande — Fordify ist nur Vermittlungsplattform
- **Keine Zahlungsabwicklung durch Fordify**

### 11.2 Anonymisierungsregeln (DSGVO-konform)

| Datenelement | Erlaubt im Listing | Begründung |
|---|---|---|
| Nennwert | Als Betragsklasse (z.B. 10.000–50.000 €) | Keine exakte Zahl |
| Region | Bundesland / Landkreis | Nicht PLZ-genau |
| Forderungstyp | Kategorie (Kaufpreisforderung, Darlehensforderung) | Dropdown, kein Freitext |
| Titulierungsstatus | Ja / Nein | Binär |
| Schuldner-Name | ❌ | Niemals |
| Aktenzeichen | ❌ | Niemals |
| Genaue Adresse | ❌ | Niemals |

**Technische Erzwingung:** Das Listing-Formular hat keine Freitextfelder — nur Dropdowns und Schieberegler. Das macht DSGVO-Compliance by Design.

### 11.3 Technische Umsetzung Modell A

**Option 1 (sofort, 1–2 Tage): Kontaktanfrage via E-Mail**
- "Forderung anbieten"-Button generiert anonymisiertes Zusammenfassungs-PDF ohne Schuldnerdaten
- `mailto:`-Link an kuratierten Käufer-Verteiler (Inkasso 24, Dr. Duve o.ä.)
- Kein Server, keine Datenbank, keine Auth nötig

**Option 2 (4–6 Wochen): Supabase-Listings (bei ohnehin vorhandenem Backend)**
Wenn das Account-Modell bereits implementiert ist, ergänzt das Marktplatz-Modul die `listings`- und `inquiries`-Tabellen (Datenbankschema siehe [Kapitel 8.9](#89-marktplatz-infrastruktur-modell-bc-langfristig)).

### 11.4 Monetarisierung Modell A

| Modell | Gebühr | Regulatorisches Risiko | Empfehlung |
|---|---|---|---|
| **CPA (Cost per Acquisition)** | 100–300 € pro vermitteltem Kontakt | Sehr niedrig | ✅ Für Phase 1 |
| **Listing-Gebühr** | 9,90 € pro Listing | Sehr niedrig | ✅ Einfach |
| **Success-Fee** | 3–5 % des Transaktionsvolumens | Mittel | ⚠️ Erst nach Rechtsberatung |
| **Monatliches Käufer-Abo** | 49–99 € für Zugang zu Listings | Niedrig | ✅ Mittelfristig |

**Empfehlung für Start:** Listing-Gebühr (9,90 € pro eingestellter Forderung) — einfach, transparent, kein regulatorisches Risiko. Nur für Paid-Nutzer verfügbar.

### 11.5 Käufer-Netzwerk aufbauen (kritischer Erfolgsfaktor)

Ohne Käufer kein Marktplatz. Konkrete Schritte:

1. **Direktansprache Inkassounternehmen** (Andreas als Anwalt kennt hier Kontakte): Inkasso 24 AG, Dr. Duve Inkasso, Collectia, regionale Inkassofirmen
2. **Bundesverband Deutscher Inkassounternehmen (BDIU)** — Mitgliederliste als Startpunkt für Käufer-Akquise
3. **LinkedIn-Outreach** an Forderungsmanager in KMU und Banken
4. **Ziel vor Soft-Launch:** Mindestens 5 verifizierte Käufer auf der Plattform

---

## 12. Umsatzpotenzial und Wachstumspfad

### 12.1 Marktgröße (Zielgruppe)

| Zielgruppe | Größe | Potenzielle Fordify-Nutzer |
|---|---|---|
| Zugelassene Rechtsanwälte Deutschland (BRAK 2024) | ~165.000 | — |
| Einzelkanzleien und kleine Sozietäten | ~60.000–80.000 | Kernzielgruppe |
| Anwälte mit aktivem Forderungsmanagement | ~15.000–30.000 | Zahlungswillig |

### 12.2 MRR-Szenarien

| Szenario | Paid Accounts | ARPU | MRR |
|---|---|---|---|
| Konservativ (1 % Marktpenetration) | ~150–300 | 25–35 € | 4.000–10.000 € |
| Realistisch (2–3 %) | ~350–600 | 30–40 € | 10.000–24.000 € |
| Optimistisch (5 %) | ~750–1.000 | 35–45 € | 26.000–45.000 € |

### 12.3 Wachstumspfad (Conversion-basiert)

| Monat | Free-Nutzer kumulativ | Conversion 4 % | MRR |
|---|---|---|---|
| 6 | 500 | 20 | ~600 € |
| 12 | 2.000 | 80 | ~2.400 € |
| 18 | 5.000 | 200 | ~6.000 € |
| 24 | 9.000 | 360 | ~10.800 € |
| 30 | 15.000 | 600 | ~18.000 € |

### 12.4 Ziel: 5.000 € MRR

- Bei Solo-Only (29 €): ~173 zahlende Accounts
- Bei Mix 70 % Solo / 30 % Team: ~139 Accounts  
- Free-Nutzer-Basis nötig (bei 4 % Conversion): ~3.500 Nutzer

**Ist das realistisch?** Bei ~165.000 Anwälten in Deutschland und einer Kernzielgruppe von 15.000–30.000 ist 3.500 Free-Nutzer (< 25 % der Kernzielgruppe) ein erreichbares 18-Monats-Ziel bei aktivem Marketing.

---

## 13. Gesamtbewertung & Entscheidungsmatrix

### 13.1 Ist der Marktplatz eine gute Idee?

**Ja — aber nicht jetzt.**

Die strategische Logik ist überzeugend: Der Markt ist groß, die Lücke real, und Fordify sitzt an der richtigen Quelle. Kein anderer Anbieter hat Zugang zu qualifizierten Forderungsaufstellungen direkt aus Anwaltskanzleien.

Aber drei Voraussetzungen fehlen heute:
1. **Regulatorische Klarheit** — BaFin-Abstimmung fehlt
2. **Technische Infrastruktur** — Backend existiert noch nicht  
3. **Nutzerbasis** — ohne kritische Masse an Verkäufern gibt es kein Angebot für Käufer

### 13.2 Die Ein-Satz-Strategie

> Fordify wird in drei Stufen wachsen: **Werkzeug** (beste kostenlose Forderungsaufstellung) → **Produkt** (Freemium-SaaS für Kanzleien) → **Plattform** (Marktplatz für Forderungen) — wobei jede Stufe wirtschaftlich eigenständig tragfähig sein muss.

### 13.3 Entscheidungsmatrix: Was jetzt entscheiden?

| Entscheidung | Option A | Option B | Empfehlung |
|---|---|---|---|
| Free Tier Design | Kein Speichern + kein Export | Max. 3 Fälle | **Option A** — stärkere Upgrade-Motivation |
| Payment Provider | Paddle | Stripe | **Paddle** bis 50K MRR |
| Marktplatz Start | Modell A (Flohmarkt) | Modell B (Vollmarktplatz) | **Modell A** — geringstes Risiko |
| Marktplatz Timing | Mit Freemium-Launch | Nach Cloud-Infrastruktur | **Nach Cloud** — Listing-Feature für Paid-Nutzer |
| Auth-Methode | Magic Link | Passwort | **Magic Link** — einfacher, professioneller |
| Cloud-Region | Supabase EU Frankfurt | Supabase US | **EU Frankfurt** — DSGVO |

### 13.4 Kritische Erfolgsfaktoren

| Faktor | Bedeutung | Handlungsempfehlung |
|---|---|---|
| **Käuferliquidität** | Ohne Käufer kein Marktplatz | Käufernetzwerk vor MVP-Launch aufbauen (Partnerverträge) |
| **Regulatorische Klarheit** | BaFin-Risiko ist existenziell | Anwaltliche Prüfung Q2/Q3 2026 |
| **Vertrauen der Kanzleien** | Fehler bei Berechnung zerstören Fundament | Öffentliche Testmatrix, Berechnungs-Audit |
| **Cloud-Infrastruktur** | Voraussetzung für Marktplatz | 2026/2027 aufbauen |
| **Freemium-Conversion** | Finanziert weitere Entwicklung | Pro-Features müssen echten Pain lösen |

### 13.5 Was Fordify zu verlieren hat — und zu gewinnen

**Risiko bei zu schnellem Marktplatz-Launch:**
- BaFin-Einschreitung (Betrieb ohne Erlaubnis nach KWG)
- DSGVO-Datenschutzverletzung (Schuldnerdaten ohne DSFA)
- Reputationsschaden im Anwaltsmarkt (Vertrauen ist alles)

**Potenzial bei richtigem Timing:**
- Europas erste integrierte Lösung: Forderung berechnen + verkaufen
- Skalierbare Revenue-Quelle neben Abo-Einnahmen
- Netzwerkeffekte: mehr Verkäufer → mehr Käufer → bessere Preise → mehr Verkäufer

---

## 14. Roadmap

### Phase A: Werkzeug-Vervollständigung (Monate 1–6, 2026)
**Ziel:** Fordify wird die vollständigste Web-Forderungssoftware — als Grundlage für Freemium.

| Monat | Feature |
|---|---|
| 1 | Mehrere Zinsmethoden (act/365, 30/360) |
| 1–2 | Excel/CSV-Export (SheetJS via CDN) |
| 2 | Vorlagen-System |
| 2–3 | Vollstreckungstitel-Verwaltung (erweitert) |
| 3–4 | Zahlungsplan-Generator |
| 4–5 | Mahnschreiben-Generator |
| 5–6 | Fristenmanagement / Verjährungskalender |

### Phase B: Freemium-Launch (Monate 7–12, 2026)
**Ziel:** Free/Paid-Modell live, erste zahlende Nutzer.

| Monat | Feature |
|---|---|
| 7–8 | StorageBackend + sessionStorage für Free Tier |
| 8–9 | Supabase Auth (Magic Link) + Login-Modal |
| 9–10 | Cloud-Speicherung Cases + Settings + Feature-Gates |
| 10–11 | Paddle-Integration + Subscription-Gating |
| 11–12 | Bestandsnutzer-Kommunikation + Migration |
| **12** | **🚀 Freemium-Launch (Free + Solo Pro 29 €/Monat)** |

### Phase C: Kanzlei-Tier + Marktplatz Modell A (Monate 13–18, 2027)
**Ziel:** Kanzlei-Plan, erste Marktplatz-Listings.

| Monat | Feature |
|---|---|
| 13–14 | Team-Workspace (Multi-User, RBAC) → Kanzlei-Tier 79 €/Monat |
| 14–15 | Kontaktverwaltung (Schuldner-Adressbuch) |
| 15–16 | Marktplatz Modell A: Listing-Feature für Paid-Nutzer |
| 16–17 | Käufer-Netzwerk (5 verifizierte Käufer) |
| 17–18 | ZV-Auftrag-Generierung (ZwVollstrFormV 2024) |

### Phase D: Plattform (Monate 19–36, 2027/2028)
**Ziel:** Vollständiger Marktplatz nach regulatorischer Klärung.

| Zeitraum | Feature |
|---|---|
| M19–22 | Passwortschutz (AES-256, Web Crypto API) |
| M22–24 | **Juristische Prüfung Marktplatz Modell B/C** (RDG, KWG, GwG, AGB) + BaFin-Anfrage |
| M24–28 | Marktplatz MVP: Transaktionsmanagement, Dokument-Upload |
| M28–32 | Marktplatz v2: Payment-Provider, Vollauktionsmechanismus |
| M32–36 | API v1, offene Käufer-Onboarding, White-Label |

### Gantt-Übersicht

```
2026              Q2  Q3  Q4
Phase A: Werkzeug ████████
Phase B: Freemium          ████

2027          Q1  Q2  Q3  Q4
Phase B              ██
Phase C:     ████████
Rechts-Prüfg         ██

2028          Q1  Q2
Phase D:     ████
```

---

## 15. Launch-Checkliste

### Blocker (muss vor dem Freemium-Launch erledigt sein)

**Rechtlich / Vertraglich**
- [ ] AVV mit Supabase abgeschlossen und dokumentiert (Supabase Dashboard → Settings → Legal)
- [ ] Nutzungsbedingungen / AGB erstellt (inkl. AVV-Klauseln für Schuldnerdaten)
- [ ] Datenschutzerklärung aktualisiert: Account, Supabase, Paddle als Drittanbieter
- [ ] Paddle-DPA abgeschlossen
- [ ] Impressum geprüft (USt-ID bei gewerblicher Tätigkeit)
- [ ] Verzeichnis von Verarbeitungstätigkeiten (VVT) angelegt

**Technisch**
- [ ] Supabase RLS für alle Tabellen aktiviert und mit zwei Test-Accounts getestet
- [ ] Kein service_role Key im Frontend-Code
- [ ] TLS erzwungen, alle HTTP → HTTPS
- [ ] Account-Löschfunktion implementiert (kaskadierendes Löschen aller Nutzerdaten)
- [ ] Supabase-Region: EU Frankfurt verifiziert und dokumentiert
- [ ] Paddle-Checkout getestet (Kauf → Webhook → subscriptions-Tabelle → Feature-Unlock)
- [ ] sessionStorage-Verhalten für Free Tier getestet (Tab schließen → Daten weg)
- [ ] Bestandsnutzer-Migration: Legacy-localStorage-Daten werden beim Login erkannt

**Betrieb**
- [ ] Datenpannen-Verfahren dokumentiert (zuständige Behörde: HmbBfDI)
- [ ] E-Mail-Kanal für Datenschutzanfragen eingerichtet (datenschutz@fordify.de)
- [ ] Bestandsnutzer mindestens 4 Wochen vor Launch informiert

### Should-Haves (innerhalb 30 Tage nach Launch)
- [ ] Datenexport-Funktion für Nutzer (Art. 20 DSGVO, Portabilität)
- [ ] Session-Timeout konfiguriert
- [ ] Backup-Retention-Policy (≤ 30 Tage)
- [ ] VVT um alle Subauftragsverarbeiter ergänzt

---

## 16. Offene Fragen & nächste Schritte

### Sofortiger Handlungsbedarf

| Priorität | Aktion | Verantwortlich | Deadline |
|---|---|---|---|
| **Kritisch** | Anwaltliche Erstberatung: Ist Vermittlungsmodell (Marktplatz Stufe 1) ohne BaFin-Lizenz zulässig? | Jens / Andreas | Q2 2026 |
| **Hoch** | Entscheidung: Freemium-Launch — Zeitplan festlegen, Pro-Features finalisieren | Jens | Q2 2026 |
| **Hoch** | Implementierung Excel/CSV-Export (ersten Pro-Feature-Kandidat) | Entwicklung | Q2 2026 |
| **Mittel** | Erstkontakt mit 2–3 potenziellen Inkasso-Partnern für Marktplatz-Stufe-1 | Andreas | Q2/Q3 2026 |
| **Mittel** | DSGVO-Risikoabschätzung beauftragen (für Zeitpunkt der Cloud-Einführung vorbereiten) | Jens / Andreas | Q3 2026 |

### Offene Rechtsfragen (für anwaltliche Klärung)

1. Fällt Fordifys Vermittlungsmodell (Stufe 1) unter § 32 KWG oder § 1 Abs. 1a Nr. 2 KWG?
2. Genügt "berechtigtes Interesse" nach Art. 6 Abs. 1 lit. f DSGVO für die Verarbeitung anonymisierter Listing-Metadaten?
3. Welche AGB-Mindestanforderungen gelten für das Vermittlungsmodell B2B?
4. Greift das GwG bei reiner Vermittlung (ohne eigene Zahlungsabwicklung)?
5. Ist ein AVV-Standard-Template in den Nutzungsbedingungen ausreichend, oder ist eine individuelle Vereinbarung mit jeder Kanzlei nötig?

### Strategische Entscheidungspunkte

- **Wann beginnt der Freemium-Launch?** (Empfehlung: nach 5–6 Pro-Features, ca. Q4 2026 / M12)
- **Supabase vs. PocketBase** — DSGVO-Kontrolle vs. Betriebsaufwand?
- **Debitos-Partnerschaft prüfen:** Wäre White-Label-Anbindung für Stufe 2 möglich?
- **Wer baut die Backend-Infrastruktur?** (Fordify ist aktuell ein 2-Personen-Projekt)

---

## 17. Anhang: Quellenverweise

- Debitos German NPL Outlook 2025 — debitos.com
- BKS NPL-Barometer 2025 — bks-ev.de
- Deutscher Factoring Verband: Markt 2024 — factoring.de
- BDIU: Inkasso und Forderungsmanagement — inkasso.de
- BaFin: Kreditzweitmarktgesetz 2024 — bafin.de
- Debexpert: NPL Trading Platforms Comparison 2025 — debexpert.com
- Creditreform: Forderungsverkauf — creditreform.de
- Inkasso 24 AG: Forderungsankauf — inkasso-24.de
- BRAK: Statistik Zulassungen 2024 — brak.de
- Paddle: Merchant of Record Documentation 2024 — paddle.com
- Supabase: GDPR & Data Processing Agreements — supabase.com

---

*Erstellt April 2026 | Fordify Machbarkeitsstudie | Vertraulich*  
*Subagenten: Legal Advisor · Market Research · Software Architect · Product Planner · Pricing Research · DSGVO-Analyse*
