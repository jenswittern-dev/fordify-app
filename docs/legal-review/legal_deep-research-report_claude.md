# Rechtsgutachten zur Konformität der Rechtstexte fordify.de

**Prüfgegenstand:** Impressum, Datenschutzerklärung, Allgemeine Geschäftsbedingungen (AGB), Auftragsverarbeitungsvertrag (AVV) der Domain fordify.de.
**Prüfungsstand:** Live-Fassung der Dokumente in der vom Auftraggeber bereitgestellten Form (AGB Stand April 2026, AVV Stand April 2026 / Version 1.0).
**Vertragstypus AGB:** rein B2B (vom Auftraggeber vorgegeben; durch AGB Ziff. 1.2 ausdrücklich gestützt).
**Methodischer Hinweis:** Die wörtlichen Zitate sind aus den als HTML übermittelten Live-Fassungen entnommen. Wo eine Verifikation einer juristischen Fundstelle nicht zweifelsfrei möglich ist, ist dies mit „st. Rspr." kenntlich gemacht. Aus der Website nicht ableitbare Tatsachen sind als [ANNAHME] markiert.

---

## A. Sachverhalt und Geschäftsmodell (Vorab-Recherche)

### A.I. Anbieter und Rechtsträger
Diensteanbieter im Sinne von § 5 Abs. 1 DDG ist Herr **Jens Wittern**, Rhiemsweg 80, 22111 Hamburg, USt-IdNr. **DE309464035** (vgl. Impressum). Anbieter ist gemäß AGB Ziff. 4.1 **Kleinunternehmer im Sinne des § 19 Abs. 1 UStG**; Hauptkommunikationsadressen sind `legal@fordify.de` (vertragsbezogen) und `datenschutz@fordify.de` (datenschutzbezogen). Es liegt ein einzelkaufmännisches Auftreten ohne Handelsregistereintragung vor; eine HRB-Nummer wird nicht ausgewiesen.

### A.II. Geschäftsmodell
Fordify ist ein **SaaS-Angebot für Forderungsberechnungen und -aufstellungen** (vgl. AGB Ziff. 2.1). Funktional umfasst der Dienst die Erstellung von Forderungsaufstellungen nach § 367 BGB, Berechnung von Verzugszinsen, RVG-Berechnungen einschließlich PKH-Vergütung nach § 49 RVG, Gerichtskostenrechner nach GKG, Tilgungspläne sowie das **automatisierte Vorausfüllen des amtlichen Vollstreckungsauftrags an den Gerichtsvollzieher (§ 753 ZPO i.V.m. ZwVollstrFormV)**. Das Angebot wird in drei Tarifen vermarktet: **Free** (sitzungsbezogen, kein Login), **Pro** (Cloud-Speicherung) und **Business** (Mandanten-Adressbuch, Massenimport, White-Label-PDF-Export).

### A.III. Zielgruppe und Vertragstypus
Das Angebot richtet sich auftragsgemäß und ausweislich AGB Ziff. 1.2 **ausschließlich an Unternehmer im Sinne des § 14 BGB**, „insbesondere" an Rechtsanwaltskanzleien und Unternehmen; eine Nutzung durch Verbraucher (§ 13 BGB) ist klauselseitig ausgeschlossen.

### A.IV. Verarbeitete Datenkategorien
Aus dem AVV (§ 3) ergibt sich, dass „Namen, Anschriften und Kontaktdaten von Schuldnern und Mandanten" verarbeitet werden, ferner Stammdaten juristischer Personen, ein Bearbeitungsstatus sowie **optionale Freitext-Notizen**, die personenbezogene Drittangaben enthalten können. Eine Verarbeitung besonderer Kategorien personenbezogener Daten i.S.v. Art. 9 DSGVO ist klauselseitig nicht vorgesehen, kann jedoch durch Freitexteingaben de facto erfolgen (z.B. Forderungen aus ärztlichen Behandlungen, die ihrerseits Gesundheitsdaten konnotieren).

### A.V. Berufsgeheimnis-Konstellation
Die Adressierung von Rechtsanwaltskanzleien aktiviert die Schutzdimension des § 203 Abs. 1 Nr. 3 StGB sowie die Pflichten aus § 43a Abs. 2 BRAO und § 43e BRAO bei Einbeziehung externer Dienstleister. AGB Ziff. 9.4 verlagert die berufsrechtliche Zulässigkeitsprüfung sowie die Mandanteneinwilligung auf den Kunden; eine ausdrückliche **Verpflichtung des Anbieters und seiner Mitarbeiter auf das Berufsgeheimnis nach § 43e Abs. 4 BRAO i.V.m. § 203 Abs. 4 S. 2 Nr. 1 StGB** ist weder in der AGB noch im AVV enthalten.

### A.VI. Einsatz von KI / automatisierter Entscheidungsfindung
[ANNAHME]: Die in AGB Ziff. 2.1 beschriebenen Funktionen (Verzugszins-, RVG-, GKG-Rechner, Tilgungsrechner, Forderungsaufstellung, Vollstreckungsauftrag-Vorausfüllung) sind deterministische Rechenvorgänge auf Grundlage gesetzlich normierter Tarife und Formeln. Es liegt damit **kein KI-System im Sinne des Art. 3 Nr. 1 VO (EU) 2024/1689 (AI Act)** vor; die Transparenzpflichten des Art. 50 AI Act sind nicht einschlägig. Eine ausschließlich automatisierte Entscheidungsfindung mit Rechtswirkung gegenüber Betroffenen i.S.v. Art. 22 DSGVO findet nicht statt, da die Endentscheidung über die Geltendmachung der Forderung beim menschlichen Anwender verbleibt.

### A.VII. Datenschutzrechtliche Rolle
Der Anbieter agiert in mehreren Rollen:
- **Verantwortlicher i.S.v. Art. 4 Nr. 7 DSGVO** für Betrieb der Website, Logfiles, Magic-Link-Authentifizierung, Vertragsabwicklung mit dem Kunden, Webanalyse;
- **Auftragsverarbeiter i.S.v. Art. 4 Nr. 8 DSGVO** hinsichtlich der vom Kunden eingegebenen Forderungs-, Schuldner- und Mandantendaten (vgl. AVV § 1, § 2);
- **Eigenständig nicht beteiligt** ist Paddle.com Market Ltd. als „Merchant of Record" für die Zahlungsabwicklung; Paddle wird in Datenschutzerklärung Abschnitt 4 (Paddle) und AVV § 5 ausdrücklich als **eigenständig Verantwortlicher** klassifiziert.

### A.VIII. Eingesetzte Sub-Verarbeiter / Drittlandtransfer
Aus der Datenschutzerklärung (Abschnitte 2 und 4) sowie AVV § 5 ergibt sich folgender Stand:
- **Hosting Website:** ALL-INKL.COM (Deutschland) – kein Drittlandtransfer;
- **Cloud-Datenbank/Authentifizierung:** Supabase Inc. (Sitz USA, Verarbeitung EU-Frankfurt) – Standardvertragsklauseln nach Beschluss 2021/914/EU vereinbart;
- **Transaktionale E-Mails:** Resend Inc. (USA) – Standardvertragsklauseln vereinbart, Versand-Infrastruktur EU-seitig;
- **E-Mail-Automatisierung (N8N):** Hostinger International Ltd. (EU) – kein Drittlandtransfer;
- **Webanalyse:** GoatCounter (Hetzner Online GmbH, Deutschland) – cookielos, IP-frei;
- **Schriftarten:** selbst gehostet (kein Drittübermittler);
- **Zahlungsdienstleister:** Paddle.com Market Limited (UK) – eigenständig Verantwortlicher; UK-Adäquanzbeschluss (Beschluss (EU) 2021/1772 vom 28.06.2021).

### A.IX. Datenfluss und Persistenz
Im Free-Tarif werden Arbeitsdaten ausschließlich im `sessionStorage` des Browsers gespeichert; eine Übertragung an die Server findet nach Eigenangabe der Datenschutzerklärung Abschnitt 4 nicht statt. In den Tarifen Pro/Business werden Daten zusätzlich im `localStorage` des Browsers sowie in der Supabase-Cloud (EU-Frankfurt) gespeichert. Konto- und Abrechnungsdaten werden gemäß AGB Ziff. 5.6 für 10 Jahre nach § 147 AO vorgehalten.

---

## B. Prüfungsgegenstand und Prüfungsmaßstab

### B.I. Prüfungsgegenstand
1. Impressum (Live-Fassung)
2. Datenschutzerklärung, Abschnitte 1–5 (Live-Fassung)
3. AGB, Stand April 2026, Ziff. 1–10 (Live-Fassung)
4. AVV, Stand April 2026 / Version 1.0, §§ 1–11 (Live-Fassung)

### B.II. Prüfungsmaßstab

**Unionsrecht:** VO (EU) 2016/679 (DSGVO); VO (EU) 2022/2065 (DSA, randständig); VO (EU) 2024/1689 (AI Act); VO (EU) Nr. 1215/2012 (Brüssel Ia-VO); VO (EG) Nr. 593/2008 (Rom I-VO); VO (EU) 2024/3228 (Aufhebung der ODR-VO mit Wirkung zum 20.07.2025); Durchführungsbeschluss (EU) 2021/914 (SCCs); Durchführungsbeschluss (EU) 2023/1795 (DPF); Beschluss (EU) 2021/1772 (UK-Adäquanz).

**Deutsches Umsetzungs- und Begleitrecht:** BGB §§ 126b, 145, 241, 271, 305 ff., 307, 308, 309, 310, 312i, 535 ff., 536, 536a, 366, 367; HGB § 257; AO § 147; BDSG §§ 26, 38; TDDDG § 25; DDG § 5; UStG §§ 19, 27a; StGB § 203; BRAO §§ 43a, 43e; BORA § 2; ZPO § 38; VSBG §§ 36, 37; RDG §§ 2, 10; ProdHaftG; GeschGehG § 2; UrhG; UWG.

**Soft Law:** EDSA-Leitlinien 07/2020 (Version 2.1, 07.07.2021) zu „Verantwortlicher und Auftragsverarbeiter"; EDSA-Empfehlungen 01/2020 (Version 2.0, 18.06.2021) zu ergänzenden Maßnahmen bei Drittlandtransfer; EDSA-Leitlinien 05/2020 zur Einwilligung; EDSA-Leitlinien 9/2022 (Version 2.0, 28.03.2023) zur Meldung von Datenschutzverletzungen; DSK-Orientierungshilfe für Anbieter von Telemedien (Stand 20.12.2021).

**Rechtsprechung (Auswahl):** EuGH, Urt. v. 16.07.2020 – C-311/18, ECLI:EU:C:2020:559 (Schrems II); EuGH, Urt. v. 01.10.2019 – C-673/17, ECLI:EU:C:2019:801 (Planet49); EuGH, Urt. v. 24.02.2022 – C-175/20, ECLI:EU:C:2022:124 (Speicherdauer); BGH, Urt. v. 15.11.2006 – XII ZR 120/04, NJW 2007, 2394 (ASP-Vertrag); BGH, Urt. v. 04.03.2010 – III ZR 79/09, NJW 2010, 1449 (Hosting); BGH, Urt. v. 19.09.2007 – VIII ZR 141/06, NJW 2007, 3774 (Indizwirkung §§ 308, 309 BGB); BGH, Urt. v. 24.09.2002 – KZR 10/01, NJW 2003, 347 (Salvatorische Klausel); BGH, Urt. v. 27.01.2010 – XII ZR 22/07, NJW 2010, 1518.

---

## C. Zusammenfassung der Befunde (Executive Legal Summary)

Die Rechtstexte sind insgesamt von erheblicher redaktioneller Sorgfalt geprägt und greifen die wesentlichen Pflichtinhalte auf. Der AVV erfüllt formal sämtliche Mindestinhalte des Art. 28 Abs. 3 DSGVO und ist inhaltlich oberhalb des Branchenniveaus angesiedelt; die TOM-Beschreibung ist konkret, die Subprozessor-Liste aktuell, die Drittlandtransfer-Klauseln benennen die Standardvertragsklauseln. Auch die AGB greifen die einschlägigen B2B-Strukturen (Haftungsbegrenzung, Kardinalpflichten, Produkthaftung) korrekt auf.

Inhaltlich identifizierbar sind gleichwohl folgende **substantielle Beanstandungspunkte**:

1. **AGB Ziff. 8.6 (Verfügbarkeit):** Pauschaler Ausschluss eines Anspruchs auf eine bestimmte Verfügbarkeit kollidiert mit § 535 Abs. 1 S. 2 BGB i.V.m. § 307 Abs. 2 Nr. 2 BGB; der SaaS-Vertrag ist mietrechtlich einzuordnen (BGH NJW 2007, 2394; BGH NJW 2010, 1449).
2. **AGB Ziff. 10.5 (ODR-Plattform):** Verweis auf eine seit 20.07.2025 nicht mehr existente EU-Plattform infolge Aufhebung der ODR-VO durch VO (EU) 2024/3228; redaktionell zu beseitigen.
3. **AGB Ziff. 8.4 (Haftungsdeckel):** Konstruktion „Jahresentgelt, mindestens 500 EUR" begründet im Free-Tarif eine garantierte Mindesthaftung von 500 EUR ohne Korrelation zur Gegenleistung; im B2B unbedenklich, jedoch redaktionell überprüfbar.
4. **AGB Ziff. 9.4 i.V.m. AVV § 4 / fehlende Berufsgeheimnis-Klausel:** Die ausdrückliche Verpflichtung des Anbieters und seiner Mitarbeiter auf das Berufsgeheimnis nach § 203 StGB / § 43e Abs. 4 BRAO fehlt. Bei adressierter Anwaltsklientel ist dies ein berufsrechtlich erheblicher Mangel; die Verlagerung der Verantwortung auf den Kunden in AGB Ziff. 9.4 reicht zur Erfüllung der § 43e BRAO-Pflicht des Berufsträgers nicht aus.
5. **AVV § 5 (Subprozessoren) – Hostinger:** Die Bezeichnung „Hostinger International Ltd. (EU)" verschleiert, dass Hostinger International Ltd. ihren Sitz in Zypern (EU) hat; eine Drittlandsrelevanz besteht insoweit nicht. Klärungsbedarf besteht jedoch hinsichtlich potenzieller Subprozessoren von Hostinger im konkreten VPS-Setup.
6. **Datenschutzerklärung:** Die zuständige Aufsichtsbehörde (HmbBfDI) wird nicht namentlich benannt; eine Speicherdauer-Tabelle fehlt; der UK-Bezug Paddle wird nicht ausdrücklich auf den UK-Adäquanzbeschluss (Beschluss (EU) 2021/1772) gestützt.
7. **AGB Ziff. 4.4 (Preisanpassung mit Schweigen-Zustimmung):** Die Konstruktion ist im B2B grundsätzlich zulässig, jedoch ist die Widerspruchsfrist von 14 Tagen sehr knapp bemessen und steht in einem ausgewogenen Verhältnis nur, wenn der Kunde tatsächlich angemessen aufgeklärt wird; Transparenzgebot des § 307 Abs. 1 S. 2 BGB.
8. **AGB Ziff. 10.3 (AGB-Änderung mit Zustimmungsfiktion):** Im B2B grundsätzlich zulässig und in der Klausel mit Sonderkündigungsrecht versehen; gleichwohl ist die Aufnahme eines ausdrücklichen Hinweises auf Wesentlichkeitskriterien empfehlenswert.
9. **AGB Ziff. 5.8 (Vertragsübernahme):** Die einseitige Übertragungsbefugnis des Anbieters ist im B2B zulässig, sollte aber mit Kontinuitätssicherung verknüpft werden.
10. **AVV § 7 (Unterstützungspflichten):** Formulierung „soweit technisch möglich" ist zu weich; Art. 28 Abs. 3 lit. e DSGVO verlangt eine generelle Unterstützungspflicht „nach Möglichkeit", die durch geeignete TOMs hinterlegt werden muss.
11. **Datenschutzerklärung Abschnitt 1 / Allgemeine Hinweise:** Die Datenschutzerklärung wirkt teilweise wie eine generierte Standardausführung (eRecht24-Vorlage); die Personalisierung auf das konkrete SaaS-Geschäftsmodell ist fragmentarisch.

Im Übrigen sind die Rechtstexte in vielen Klauseln **unbedenklich**.

---

## D. Detailprüfung

### D.I. Allgemeine Geschäftsbedingungen (AGB) — Hauptschwerpunkt

#### D.I.1 — AGB Ziff. 1.1 (Einbeziehung der AGB / Anbieteridentifikation)
**Wortlaut:** „Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge über die Nutzung der Software-as-a-Service-Plattform fordify (nachfolgend „Dienst"), die zwischen Jens Wittern, Rhiemsweg 80, 22111 Hamburg […] (nachfolgend „Anbieter") und dem jeweiligen Vertragspartner (nachfolgend „Kunde") geschlossen werden."
**Befund:** Keine Beanstandung. Die räumliche und persönliche Anbieteridentifikation entspricht den Anforderungen der § 305 Abs. 2 BGB analog (im B2B nach § 310 Abs. 1 BGB ohnehin gelockert) sowie den Transparenzanforderungen aus § 307 Abs. 1 S. 2 BGB.

#### D.I.2 — AGB Ziff. 1.2 (Beschränkung auf Unternehmer)
**Wortlaut:** „fordify richtet sich ausschließlich an Unternehmen im Sinne des § 14 BGB […]. Die Nutzung durch Verbraucher im Sinne des § 13 BGB ist ausgeschlossen."
**Befund:** Keine Beanstandung. Die ausdrückliche B2B-Beschränkung legitimiert die Anwendung des AGB-rechtlichen Maßstabs des § 310 Abs. 1 BGB. Wirksam ist die Klausel jedoch nur, wenn der Anbieter den Unternehmerstatus des Vertragspartners auch faktisch verifiziert (z.B. durch Abfrage „Sie bestätigen, dass Sie als Unternehmer i.S.v. § 14 BGB handeln"); andernfalls trifft den Anbieter im Streitfall die Beweislast bei einem behaupteten Verbraucherstatus.

#### D.I.3 — AGB Ziff. 1.3 (Abwehrklausel gegenüber Kunden-AGB)
**Wortlaut:** „Abweichende oder entgegenstehende Allgemeine Geschäftsbedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, der Anbieter hat ihrer Geltung ausdrücklich schriftlich zugestimmt."
**Befund:** Keine Beanstandung. Eine sogenannte Abwehrklausel ist im B2B unbedenklich (st. Rspr.). Das Schriftformerfordernis bezüglich der Geltung gegnerischer AGB ist als gewillkürte Schriftform nach §§ 127, 126 BGB zu qualifizieren.

#### D.I.4 — AGB Ziff. 2.1 (Leistungsbeschreibung)
**Wortlaut (Auszug):** „fordify ist eine webbasierte SaaS-Anwendung […]. Sie stellt dem Kunden Werkzeuge zur Erstellung professioneller Forderungsaufstellungen nach § 367 BGB, zur Berechnung von Verzugszinsen, zur Anwendung des Rechtsanwaltsvergütungsgesetzes (RVG […]), zur Berechnung von Gerichtskosten nach dem Gerichtskostengesetz (GKG), zur Erstellung von Tilgungsplänen und Annuitätenberechnungen sowie zur automatisierten Vorausfüllung des amtlichen Vollstreckungsauftrags an den Gerichtsvollzieher (§ 753 ZPO i.V.m. ZwVollstrFormV) bereit."
**Befund:** Inhaltlich keine Beanstandung. Die Leistungsbeschreibung erfüllt das Bestimmtheitserfordernis und ermöglicht die Beschaffenheitsbestimmung i.S.v. § 535 Abs. 1 S. 2 BGB. Hinweise auf die rechtliche Einordnung als Mietvertrag (BGH NJW 2007, 2394) sind im Leistungsbeschreibungstext nicht erforderlich.

#### D.I.5 — AGB Ziff. 2.2 (Tarifstufen)
**Wortlaut (Auszug):** „[…] **Free (kostenlos)**: Zugang zu allen Rechnern […] ohne Login und ohne Zeitlimitierung. […] Kein Anspruch auf Support oder Verfügbarkeitsgarantie. […]"
**Befund:** Inhaltlich keine Beanstandung; allerdings ist der Halbsatz „Kein Anspruch auf Support oder Verfügbarkeitsgarantie" für den Free-Tarif noch von der Frage zu trennen, ob im **kostenpflichtigen** Bereich eine Verfügbarkeit klauselseitig ausgeschlossen werden darf (vgl. D.I.20 zu Ziff. 8.6); für den unentgeltlichen Free-Tarif ist die Beschneidung der Hauptleistungspflichten als „inhaltsbestimmend" zu qualifizieren und entzieht sich der AGB-rechtlichen Inhaltskontrolle nach § 307 Abs. 3 S. 1 BGB.

#### D.I.6 — AGB Ziff. 2.3 (Weiterentwicklungsvorbehalt)
**Wortlaut:** „Der Anbieter ist berechtigt, den Funktionsumfang des Dienstes weiterzuentwickeln. Wesentliche Leistungsreduzierungen werden dem Kunden mit einer Frist von mindestens 30 Tagen per E-Mail angekündigt."
**Befund:** Im Grundsatz keine Beanstandung; im B2B ist ein einseitiger Leistungsänderungsvorbehalt mit angemessener Vorankündigungsfrist zulässig (st. Rspr. zu §§ 307 ff. BGB). Bemerkenswert ist jedoch das Fehlen eines **Sonderkündigungsrechts** des Kunden bei wesentlicher Leistungsreduzierung. Da bei wesentlicher Reduzierung der Vertrag nicht mehr im ursprünglichen Umfang erfüllt wird, ist ein Sonderkündigungsrecht aus dem Transparenzgebot (§ 307 Abs. 1 S. 2 BGB) und dem Gebot der Vertragsausgewogenheit (§ 307 Abs. 1 S. 1 BGB) ableitbar, jedenfalls aber redaktionell ratsam.

#### D.I.7 — AGB Ziff. 3.1 (invitatio ad offerendum)
**Wortlaut:** „Die Darstellung des Dienstes auf der Website stellt kein bindendes Angebot dar, sondern eine Aufforderung zur Abgabe eines Angebots (invitatio ad offerendum)."
**Befund:** Keine Beanstandung. Klassische Klausel; entspricht der zivilrechtlichen Auslegungsregel (§§ 145 ff. BGB).

#### D.I.8 — AGB Ziff. 3.2 (Vertragsschluss)
**Wortlaut:** „Durch Registrierung und Auswahl einer kostenpflichtigen Nutzungsstufe gibt der Kunde ein verbindliches Angebot ab. Der Vertrag kommt durch Freischaltung des gewählten Tarifs oder eine Bestätigungsmail zustande."
**Befund:** Keine Beanstandung. Annahmemodi sind klar bezeichnet.

#### D.I.9 — AGB Ziff. 3.3 (Vertragsschluss Free-Tarif)
**Wortlaut:** „Für den Free-Tarif kommt der Vertrag durch die erstmalige Nutzung des Dienstes zustande; eine Registrierung ist hierfür nicht erforderlich."
**Befund:** Keine Beanstandung. Konkludenter Vertragsschluss ist anerkannt; die Einbeziehung der AGB i.S.v. § 305 Abs. 2 BGB ist im B2B nach § 310 Abs. 1 BGB ohnehin nicht streng formgebunden, doch sollte die zumutbare Kenntnisnahme über einen erkennbaren AGB-Link gewährleistet sein. Verifikation der UI-Implementierung empfehlenswert.

#### D.I.10 — AGB Ziff. 3.4 (Paddle als Merchant of Record)
**Wortlaut:** „Die Zahlungsabwicklung für kostenpflichtige Tarife erfolgt über Paddle (Paddle.com Market Limited), der als Merchant of Record auftritt. Bei Nutzung des Paddle-Checkouts ist Paddle Vertragspartner für die Zahlungsabwicklung; Rechnungen werden von Paddle ausgestellt […]. Es gelten ergänzend die Nutzungsbedingungen von Paddle."
**Befund:** Materiell keine Beanstandung. Die Klausel erkennt die Doppelvertragsstruktur an. Allerdings ist die Formulierung „Es gelten ergänzend die Nutzungsbedingungen von Paddle" als **dynamische Verweisung** auf nicht-eigene AGB problematisch im Hinblick auf das Transparenzgebot des § 307 Abs. 1 S. 2 BGB, soweit eine Verlinkung oder zumindest Bezeichnung der konkret einschlägigen Paddle-Vertragsdokumente fehlt. Im B2B ist die dynamische Bezugnahme zwar im Grundsatz zulässig (st. Rspr.), die Fundstelle (URL) sollte jedoch zumindest zur Information bezeichnet sein.

#### D.I.11 — AGB Ziff. 4.1 (Preise / Kleinunternehmer)
**Wortlaut:** „Es gelten die zum Zeitpunkt des Vertragsschlusses auf https://fordify.de/preise ausgewiesenen Preise. Der Anbieter ist Kleinunternehmer im Sinne des § 19 Abs. 1 UStG; es wird daher keine Umsatzsteuer berechnet und ausgewiesen. Soweit die Zahlungsabwicklung über Paddle als Merchant of Record erfolgt, kann Paddle als steuerpflichtiger Wiederverkäufer eigene Steuern ausweisen."
**Befund:** Keine Beanstandung. Hinweis: Paddle als Merchant of Record kann unabhängig vom Kleinunternehmerstatus des Anbieters Umsatzsteuer ausweisen, da Paddle im Außenverhältnis Verkäufer wird; die Klausel reflektiert dies zutreffend. Die dynamische Verlinkung der Preisliste (`https://fordify.de/preise`) ist ausreichend.

#### D.I.12 — AGB Ziff. 4.2 (Vorauszahlungsmodell)
**Wortlaut:** „Kostenpflichtige Tarife werden im Voraus für den jeweiligen Abrechnungszeitraum (monatlich oder jährlich) in Rechnung gestellt."
**Befund:** Keine Beanstandung.

#### D.I.13 — AGB Ziff. 4.3 (Sperrung bei Zahlungsverzug)
**Wortlaut:** „Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zum kostenpflichtigen Tarif bis zur vollständigen Zahlung zu sperren."
**Befund:** Im Grundsatz keine Beanstandung. Sperrrechte bei Zahlungsverzug sind im B2B nach Maßgabe der §§ 273, 320 BGB anerkannt. Empfehlenswert wäre jedoch die Aufnahme einer **Mahnschwelle** und einer Vorankündigung in Textform vor Sperrung, um das Verhältnismäßigkeitsgebot des § 307 Abs. 1 S. 1 BGB zu wahren; insbesondere bei einmonatigen Verzugszeiträumen kann die unmittelbare Sperrung bei einer auch nur einmaligen Zahlungsverzögerung im Hinblick auf die wirtschaftliche Tragweite (Mandatsfortführung der Anwaltskanzlei) unverhältnismäßig sein.

#### D.I.14 — AGB Ziff. 4.4 (Preisänderung mit Schweigen-Zustimmung)
**Wortlaut:** „Preisänderungen werden dem Kunden mindestens 30 Tage vor Inkrafttreten per E-Mail mitgeteilt. Die Mitteilung enthält einen ausdrücklichen Hinweis darauf, dass das Ausbleiben eines Widerspruchs innerhalb von 14 Tagen als Zustimmung zur Preisänderung gilt. Widerspricht der Kunde nicht innerhalb dieser Frist, gilt die Änderung als genehmigt."
**Befund:** Materiell wird die Preisanpassungsklausel im B2B zwar nicht durch § 309 Nr. 1 BGB unmittelbar erfasst (§ 310 Abs. 1 BGB), unterliegt aber der Inhaltskontrolle nach § 307 BGB unter Berücksichtigung der Indizwirkung (BGH NJW 2007, 3774). Beanstandungspunkte:
1. Die Preisänderung ist **richtungs- und höhenmäßig unbeschränkt**; ein Anpassungsmaßstab oder -anlass (z.B. Kostenentwicklung, Index) fehlt. Das Transparenzgebot des § 307 Abs. 1 S. 2 BGB verlangt nach gefestigter Rechtsprechung zumindest eine sachliche Begründungsschiene (st. Rspr. zu Preisanpassungsklauseln);
2. Ein **Sonderkündigungsrecht** wird in Ziff. 4.5 zwar eingeräumt, ist aber nur als Reaktion auf einen Widerspruch ausgestaltet (außerordentliche Kündigung); die Verzahnung mit Ziff. 4.4 ist redaktionell intransparent;
3. Die Frist von **14 Tagen** für den Widerspruch ist im Vergleich zur Vorankündigungsfrist von 30 Tagen sehr knapp; sie führt dazu, dass die Schweigen-Zustimmung de facto **vor** Inkrafttreten der Preisänderung eintritt.

#### D.I.15 — AGB Ziff. 4.5 (Sonderkündigungsrecht bei Preiserhöhung)
**Wortlaut:** „Stimmt der Kunde einer Preiserhöhung nicht zu, kann er den Vertrag zum Zeitpunkt des Inkrafttretens der Preiserhöhung außerordentlich kündigen. In diesem Fall wird kein anteiliger Betrag für den bereits bezahlten Zeitraum zurückerstattet, sofern dieser zum Zeitpunkt der Kündigung bereits vollständig erbracht wurde."
**Befund:** Im Grundsatz keine Beanstandung. Die fehlende anteilige Rückerstattung des bereits bezahlten Zeitraums ist im Vorauszahlungsmodell (Ziff. 4.2) konsequent. Die Klausel ist transparenzrechtlich (§ 307 Abs. 1 S. 2 BGB) jedoch nur dann unbedenklich, wenn die Erbringung der Leistung im bereits bezahlten Zeitraum vollständig stattgefunden hat. Bei untermonatigen oder jährlich vorausbezahlten Modellen ist die Klausel rechtswirksam.

#### D.I.16 — AGB Ziff. 4.6 (Aufrechnungs- und Zurückbehaltungsverbot)
**Wortlaut:** „Der Kunde ist nicht berechtigt, Zahlungen zurückzuhalten oder gegen Forderungen des Anbieters aufzurechnen, sofern nicht die Gegenforderung unbestritten oder rechtskräftig festgestellt ist oder dem Kunden aus demselben Vertragsverhältnis ein gesetzliches Zurückbehaltungsrecht zusteht."
**Befund:** Keine Beanstandung. Die Klausel entspricht der seit langem etablierten Rechtsprechung zu Aufrechnungsverboten in B2B-AGB; Aufrechnungsbeschränkungen sind zulässig, soweit unbestrittene oder rechtskräftig festgestellte Gegenforderungen ausgenommen werden (st. Rspr. zu § 309 Nr. 3 BGB unter Berücksichtigung des § 310 Abs. 1 BGB).

#### D.I.17 — AGB Ziff. 5.1–5.3 (Vertragslaufzeit, Verlängerung)
**Wortlaut:** „5.1 Der Vertrag über den Free-Tarif läuft auf unbestimmte Zeit […]. 5.2 Monatliche Tarife verlängern sich automatisch um einen weiteren Monat […]. 5.3 Jährliche Tarife verlängern sich automatisch um ein weiteres Jahr […]."
**Befund:** Keine Beanstandung. Im B2B ist § 309 Nr. 9 BGB nicht direkt anwendbar (§ 310 Abs. 1 BGB); Indizwirkung wird gewahrt, da die Verlängerungsdauer der Mindestlaufzeit entspricht und die Kündigungsfrist sich aus dem Ende des Abrechnungszeitraums ergibt – funktional vergleichbar mit dem in § 309 Nr. 9 BGB für B2C tolerierten Modell.

#### D.I.18 — AGB Ziff. 5.4 (Kündigungsweg)
**Wortlaut:** „Die Kündigung ist per E-Mail an legal@fordify.de oder über das Paddle Customer Portal (erreichbar unter https://fordify.de/konto) möglich. Nach Kündigung bleibt der Zugang bis zum Ende des bereits bezahlten Zeitraums erhalten."
**Befund:** Keine Beanstandung. Der Verweis auf das Paddle Customer Portal kollidiert nicht mit dem Hauptvertragsverhältnis, da Paddle die Kündigungsmechanik in der Zahlungsabwicklungsschiene technisch trägt.

#### D.I.19 — AGB Ziff. 5.5 (Außerordentliche Kündigung)
**Wortlaut (Auszug):** „Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Der Anbieter ist insbesondere berechtigt, den Vertrag fristlos zu kündigen, wenn (a) der Kunde mit der Zahlung […] in Verzug ist; (b) über das Vermögen des Kunden das Insolvenzverfahren […] eingeleitet wird; (c) der Kunde Zugangsdaten oder das Kundenkonto […] auf Dritte überträgt; oder (d) der Kunde wesentliche Vertragspflichten verletzt […]."
**Befund:** Im Grundsatz keine Beanstandung. Die Klausel konkretisiert den Begriff des wichtigen Grundes i.S.v. § 314 BGB durch eine offene Aufzählung („insbesondere"). Tatbestand (b) (Insolvenzeinleitung) ist insolvenzrechtlich allerdings teilweise unwirksam; **§ 119 InsO** lässt insolvenzbedingte Lösungsklauseln, die das Wahlrecht des Insolvenzverwalters nach § 103 InsO unterlaufen würden, in bestimmten Konstellationen unwirksam sein (vgl. BGH, Urt. v. 15.11.2012 – IX ZR 169/11, NJW 2013, 1159, st. Rspr. zu insolvenzbedingten Lösungsklauseln). Bei einem reinen Nutzungsvertrag über austauschbare Software ist die Kündigung allerdings auch insolvenzrechtlich tragfähig, sofern hinreichende sonstige Gründe (Zahlungsausfall, Unsicherheit über Vertragserfüllung) vorliegen.

#### D.I.20 — AGB Ziff. 5.6 (Datenaufbewahrung nach Vertragsende)
**Wortlaut:** „Nach Vertragsende werden Kundendaten (Fälle, Kontakte, Einstellungen) 30 Tage aufbewahrt, damit der Kunde seine Daten exportieren kann. Danach werden diese Daten gelöscht. Konto- und Abrechnungsdaten (Profil, Abonnementhistorie) werden gemäß der gesetzlichen Aufbewahrungspflicht nach § 147 AO für 10 Jahre vorgehalten."
**Befund:** Keine Beanstandung. Die 30-tägige Grace Period entspricht dem branchenüblichen Standard; die 10-jährige Aufbewahrung steuerrelevanter Daten ist zwingend nach § 147 AO. Konsistent mit AVV § 8 (Löschung nach 30 Tagen).

#### D.I.21 — AGB Ziff. 5.7 (Datenpufferung bei Sperrung)
**Wortlaut:** „Bei Sperrung des Zugangs wegen Zahlungsverzugs (§ 4.3) bleiben die Kundendaten bis zur Sperrung vollständig erhalten und werden nach Wiederherstellung des Zugangs oder — bei endgültigem Vertragsende — gemäß § 5.6 behandelt."
**Befund:** Keine Beanstandung.

#### D.I.22 — AGB Ziff. 5.8 (Übertragung des Vertrags)
**Wortlaut:** „Der Anbieter ist berechtigt, seine Rechte und Pflichten aus diesem Vertrag mit einer Ankündigungsfrist von vier Wochen ganz oder teilweise auf einen Dritten zu übertragen, insbesondere im Fall einer Unternehmensveräußerung oder Betriebsübertragung. In diesem Fall ist der Kunde berechtigt, den Vertrag innerhalb von zwei Wochen nach Zugang der Ankündigung außerordentlich zu kündigen."
**Befund:** Im Grundsatz keine Beanstandung. Die Klausel erfüllt die Anforderungen der Rechtsprechung zu Vertragsübernahmeklauseln durch das eingeräumte Sonderkündigungsrecht. Empfehlenswert wäre die Klarstellung, dass der Übernehmer in alle bestehenden Rechte und Pflichten einzutreten hat und insbesondere die datenschutzrechtlichen Verpflichtungen (Art. 28 DSGVO; AVV) gleichwertig fortgeführt werden.

#### D.I.23 — AGB Ziff. 6 (Widerruf und Rückerstattung)
**Wortlaut:** „Da fordify ausschließlich an Unternehmer im Sinne des § 14 BGB gerichtet ist, besteht kein gesetzliches Widerrufsrecht nach §§ 312g, 355 BGB. Die Vorschriften über Verbraucherverträge finden keine Anwendung. […]"
**Befund:** Keine Beanstandung. Der Hinweis ist klarstellend; ein Widerrufsrecht ist im B2B nicht eröffnet (§§ 13, 14, 312, 355 BGB).

#### D.I.24 — AGB Ziff. 7.1 (Nutzungsrecht / Umfang)
**Wortlaut:** „Der Anbieter räumt dem Kunden für die Laufzeit des Vertrags ein nicht exklusives, nicht übertragbares Recht zur bestimmungsgemäßen Nutzung des Dienstes über einen Webbrowser ein. Das Nutzungsrecht ist kanzlei- bzw. unternehmensbezogen; Mitarbeiter des Kunden dürfen den Dienst im Rahmen ihrer beruflichen Tätigkeit für den Kunden nutzen. Eine Nutzung durch unternehmensfremde Dritte ist untersagt."
**Befund:** Keine Beanstandung. Die Beschränkung auf unternehmens- bzw. kanzleibezogene Nutzung ist im SaaS-Kontext angemessen.

#### D.I.25 — AGB Ziff. 7.2 (Nutzungsverbote)
**Wortlaut:** „Dem Kunden ist es untersagt: den Dienst oder Teile davon zu vervielfältigen, weiterzulizenzieren oder Dritten zur Nutzung zu überlassen; den Quellcode zu dekompilieren oder zurückzuentwickeln; Sicherheitsmechanismen zu umgehen oder zu manipulieren; den Dienst für rechtswidrige Zwecke oder zur Verletzung von Rechten Dritter zu nutzen; automatisierte Abfragen in einem Umfang durchzuführen, der den normalen Betrieb beeinträchtigt; Zugangsdaten an nicht autorisierte Personen weiterzugeben."
**Befund:** Im Grundsatz keine Beanstandung. Das Dekompilierungsverbot ist nach **§ 69e UrhG** lediglich insoweit wirksam, als die zwingenden Befugnisse zur Erstellung interoperabler Programme nicht ausgeschlossen werden dürfen. Da die Klausel das Dekompilierungsverbot nicht ausdrücklich auf nicht-zwingende Fälle beschränkt, droht eine Teilunwirksamkeit nach § 69g Abs. 2 UrhG. Klarstellung empfehlenswert.

#### D.I.26 — AGB Ziff. 7.3 (Sanktion bei Verstoß)
**Wortlaut:** „Bei schwerwiegendem oder wiederholtem Verstoß gegen die Nutzungsbeschränkungen gemäß § 7.2 ist der Anbieter berechtigt, den Zugang des Kunden vorübergehend zu sperren oder den Vertrag außerordentlich zu kündigen. Eine vorherige Abmahnung ist nur erforderlich, soweit dies dem Anbieter zumutbar ist."
**Befund:** Materiell keine Beanstandung. Die Bezugnahme auf den allgemeinen Grundsatz „Abmahnung erforderlich, sofern zumutbar" entspricht § 314 Abs. 2 BGB.

#### D.I.27 — AGB Ziff. 7.4 (Eigentum an Daten / Nutzungsrecht des Anbieters)
**Wortlaut:** „Der Kunde bleibt Inhaber aller Rechte an den von ihm eingegebenen Daten. Er räumt dem Anbieter das für den Betrieb erforderliche Recht ein, diese Daten zu speichern und zu verarbeiten."
**Befund:** Materiell unbedenklich, jedoch zu unspezifisch. Die Klausel benennt **nicht** ausdrücklich den Ausschluss einer Nutzung zu eigenen Zwecken (insbesondere zu Modelltraining im KI-Bereich, zur Statistikbildung oder zu Marketingzwecken). Im Lichte der heutigen Branchenstandards ist eine ausdrückliche Negativklausel zur Vermeidung künftiger Streitigkeiten zweckmäßig. Materiell-rechtlich ist die Klausel jedoch nicht zu beanstanden.

#### D.I.28 — AGB Ziff. 8.1 (Kein Ersatz für Rechtsberatung)
**Wortlaut:** „fordify ist ein technisches Hilfsmittel und stellt keine Rechtsberatung, Steuerberatung oder sonstige regulierte Beratungsleistung dar. Für die rechtliche Richtigkeit der erstellten Dokumente und Berechnungen trägt ausschließlich der Kunde die Verantwortung."
**Befund:** Keine Beanstandung. Die Klausel ist abgrenzungsrechtlich (RDG) unbedenklich und stützt die Eigenverantwortung des Anwenders.

#### D.I.29 — AGB Ziff. 8.2 (Keine Gewähr für Berechnungsrichtigkeit)
**Wortlaut:** „Der Anbieter bemüht sich um die Richtigkeit der hinterlegten Berechnungslogiken und Rechtsdaten (Basiszinssätze, RVG-Tabelle, GKG-Tabelle). Eine Gewähr für jederzeitige Aktualität und Fehlerfreiheit wird nicht übernommen. Der Kunde ist verpflichtet, Ergebnisse vor ihrer Verwendung eigenverantwortlich zu prüfen."
**Befund:** Im Grundsatz keine Beanstandung. Allerdings ist zu beachten, dass die Klausel als isolierter **Gewährausschluss** gegen § 307 Abs. 2 Nr. 2 BGB (Aushöhlung des Vertragszwecks) verstoßen würde, wäre der Vertragszweck primär die Berechnungsrichtigkeit. Da die Klausel jedoch die Eigenprüfungspflicht des Kunden statuiert und im Kontext mit Ziff. 8.1 (Kein Ersatz für Rechtsberatung) zu lesen ist, ist sie zulässig. Empfehlenswert wäre die Klarstellung, dass Vorsatz und grobe Fahrlässigkeit von dieser Klausel nicht erfasst sind, um Wechselwirkungen mit Ziff. 8.3 transparent zu halten.

#### D.I.30 — AGB Ziff. 8.3 (Haftungsbeschränkung)
**Wortlaut:** „Soweit nicht zwingendes Recht etwas anderes vorschreibt, haftet der Anbieter nur für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen. Die Haftung für leichte Fahrlässigkeit ist – außer bei Verletzung wesentlicher Vertragspflichten, bei Schäden aus Verletzung des Lebens, des Körpers oder der Gesundheit sowie bei Ansprüchen nach dem Produkthaftungsgesetz – ausgeschlossen."
**Befund:** Im Grundsatz wirksam; die Klausel respektiert die zwingenden Haftungsschranken (Vorsatz, grobe Fahrlässigkeit, Personenschäden, Kardinalpflichten, ProdHaftG) und ist damit im B2B nach §§ 307, 309 Nr. 7 BGB i.V.m. § 310 Abs. 1 S. 2 BGB (Indizwirkung; BGH NJW 2007, 3774) wirksam. Beanstandungspunkte:
1. Die Definition der „wesentlichen Vertragspflichten" (Kardinalpflichten) **fehlt**. Nach gefestigter BGH-Rechtsprechung ist die Definition in der Klausel selbst zu treffen, andernfalls droht Transparenzverstoß (§ 307 Abs. 1 S. 2 BGB; st. Rspr. zu Kardinalpflichten);
2. Die Begrenzung der Kardinalpflichthaftung auf den **vertragstypischen, vorhersehbaren Schaden** ist zwar im B2B üblich und wirksam, fehlt jedoch in der Klausel; die Klausel würde damit auch bei einfacher Fahrlässigkeit für Kardinalpflichtverletzungen eine **unbegrenzte** Haftung begründen (lediglich gedeckelt durch Ziff. 8.4). Die fehlende Begrenzung ist haftungsmaximierend für den Anbieter und wirkt sich kundenschützend aus, ist aber redaktionell unklar.

#### D.I.31 — AGB Ziff. 8.4 (Haftungsdeckel)
**Wortlaut:** „Soweit der Anbieter nach § 8.3 dem Grunde nach haftet, ist die Haftung der Höhe nach auf den Betrag begrenzt, den der Kunde im betreffenden Kalenderjahr an den Anbieter gezahlt hat, mindestens jedoch 500 Euro. Diese Begrenzung gilt nicht für Ansprüche wegen Verletzung von Leben, Körper oder Gesundheit sowie für Ansprüche nach dem Produkthaftungsgesetz."
**Befund:** Im Grundsatz wirksam. Beanstandungspunkte:
1. Der Haftungsdeckel ist im B2B grundsätzlich zulässig, soweit kein deutliches Missverhältnis zum vorhersehbaren Schaden besteht (st. Rspr.). Bei einem Anwaltsmandat können infolge eines Berechnungsfehlers (z.B. fehlerhafter Verzugszins, Verjährungsschaden) Schäden entstehen, die das Jahresentgelt um Größenordnungen übersteigen – dies kann im konkreten Streitfall zu einer geltungserhaltenden Reduktion führen, ist aber im B2B nicht per se unwirksam;
2. Die Mindesthaftung von **500 EUR auch im Free-Tarif** (kein gezahltes Entgelt) ist eine ungewöhnliche Konstruktion, die im B2B zulässig, aber inkonsequent erscheint, da im Free-Tarif keine Gegenleistung erbracht wird; ggf. redaktionelle Klarstellung;
3. Der Haftungsdeckel **erfasst nicht ausdrücklich Vorsatz**. Nach allgemeinen Grundsätzen ist eine Haftungsbegrenzung für Vorsatz nach § 276 Abs. 3 BGB zwingend ausgeschlossen. Da die Klausel sich auf „Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen" (Ziff. 8.3) bezieht, wäre die Höchstbetragsklausel auch für Vorsatzschäden anwendbar, was nach § 276 Abs. 3 BGB unwirksam ist; eine ausdrückliche Rückausnahme „außer bei Vorsatz" ist erforderlich.

#### D.I.32 — AGB Ziff. 8.5 (Datenverlust)
**Wortlaut:** „Für den Verlust von Daten haftet der Anbieter nur in dem Umfang, in dem der Schaden auch bei ordnungsgemäßem, regelmäßigem Datensicherungsverhalten des Kunden eingetreten wäre."
**Befund:** Im Grundsatz wirksam. Die Klausel entspricht der „Mitverschuldensbasierten" Datenverlust-Klausel, die in der B2B-Rechtsprechung anerkannt ist (st. Rspr. zur Datensicherungsobliegenheit des Kunden). Sie ist als Ausgestaltung des Mitverschuldenseinwands nach § 254 BGB zu lesen.

#### D.I.33 — AGB Ziff. 8.6 (Verfügbarkeit)
**Wortlaut:** „Der Anbieter ist bestrebt, den Dienst möglichst unterbrechungsfrei bereitzustellen. **Ein Anspruch auf eine bestimmte Verfügbarkeit besteht nicht.** Geplante Wartungsarbeiten werden, soweit möglich, in nachfrageschwachen Zeiten durchgeführt. Vorübergehende Einschränkungen aufgrund technischer Notwendigkeiten begründen keinen Anspruch auf Mietminderung oder Schadensersatz."
**Befund:** **Substantielle Beanstandung.** Die Klausel höhlt im SaaS-Mietverhältnis die Hauptleistungspflicht aus § 535 Abs. 1 S. 2 BGB aus und kollidiert mit § 307 Abs. 2 Nr. 2 BGB (Aushöhlung des Vertragszwecks). Die rechtliche Einordnung des SaaS-Vertrags als **Mietvertrag** ist gefestigt (BGH, Urt. v. 15.11.2006 – XII ZR 120/04, NJW 2007, 2394; BGH, Urt. v. 04.03.2010 – III ZR 79/09, NJW 2010, 1449). Eine vollständige Negation des Verfügbarkeitsanspruchs ist im B2B-AGB nicht zulässig. Zulässig sind:
- die Festlegung einer **konkreten Verfügbarkeitsquote** (z.B. 99,5 % im Jahresmittel);
- die Ausnahme für **angekündigte Wartungsfenster**;
- die Ausnahme für **höhere Gewalt**.

Der pauschale Ausschluss ist hingegen unwirksam. Die zusätzlich enthaltene Negation des Mietminderungsanspruchs („begründen keinen Anspruch auf Mietminderung") ist im B2B grundsätzlich abdingbar (im Wohnraummietrecht zwingend, vgl. § 536 Abs. 4 BGB; in B2B-Geschäftsraummietverträgen analog), jedoch nur **bei vorübergehenden, geringfügigen** Einschränkungen; ein vollständiger Ausschluss verletzt § 307 Abs. 2 Nr. 1 BGB.

#### D.I.34 — AGB Ziff. 9.1 (Datenschutz / Verweis auf Datenschutzerklärung)
**Wortlaut:** „Der Anbieter verarbeitet personenbezogene Daten ausschließlich zur Erfüllung dieses Vertrags und im Einklang mit der DSGVO. Einzelheiten ergeben sich aus der Datenschutzerklärung."
**Befund:** Keine Beanstandung.

#### D.I.35 — AGB Ziff. 9.2 (Konkludenter AVV-Abschluss)
**Wortlaut:** „Soweit der Anbieter im Auftrag des Kunden personenbezogene Daten Dritter verarbeitet (insbesondere Daten von Schuldnern oder Mandanten), ist der Abschluss eines Auftragsverarbeitungsvertrags (AVV) nach Art. 28 DSGVO erforderlich. Der Anbieter stellt den AVV unter https://fordify.de/avv bereit. Der AVV gilt als konkludent abgeschlossen, sobald der Kunde diese AGB akzeptiert und den Dienst im Rahmen eines kostenpflichtigen Abonnements nutzt (Art. 28 Abs. 9 DSGVO); der Anbieter dokumentiert den Zeitpunkt der Akzeptanz."
**Befund:** Materiell wirksam. **Art. 28 Abs. 9 DSGVO** lässt den Abschluss in elektronischer Form ausdrücklich zu; eine konkludente Annahme durch Akzeptanz der AGB und Nutzung der kostenpflichtigen Funktion ist in Verbindung mit der Akzeptanz-Dokumentation rechtlich tragfähig (so EDSA-Leitlinien 07/2020 zur Vertragsform unter Hinweis auf Art. 28 Abs. 9 DSGVO). Empfehlenswert wäre die Aufnahme einer **expliziten Akzeptanzaktion** (Checkbox „Ich akzeptiere AGB und AVV") im Buchungsprozess, um Beweisproblemen vorzubeugen; technische Verifikation der UI-Implementierung empfehlenswert.

#### D.I.36 — AGB Ziff. 9.3 (Hosting / EU-Speicherung)
**Wortlaut:** „Die technische Infrastruktur wird über Supabase betrieben; die Datenspeicherung erfolgt innerhalb der Europäischen Union (Frankfurt, Deutschland)."
**Befund:** Inhaltlich konsistent mit Datenschutzerklärung (Abschnitt 4 Supabase). Zur Klarstellung: Supabase Inc. hat ihren Sitz **außerhalb der EU**; die Datenspeicherung erfolgt zwar in der EU, ein **theoretischer Drittlandzugriff** durch Supabase Inc. ist jedoch nicht ausgeschlossen, weshalb in der Datenschutzerklärung und im AVV (§ 5) zutreffend Standardvertragsklauseln vereinbart wurden. Die AGB-Klausel ist insoweit verkürzend, aber nicht falsch.

#### D.I.37 — AGB Ziff. 9.4 (Berufsrechtlicher Geheimnisschutz)
**Wortlaut:** „Soweit der Kunde zur Nutzung des Dienstes Daten eingibt, die berufsrechtlichem Geheimnisschutz unterliegen – insbesondere Mandantendaten im Sinne des § 43a BRAO –, liegt die Verantwortung für die berufsrechtliche Zulässigkeit der Übermittlung und Verarbeitung dieser Daten ausschließlich beim Kunden. Der Kunde ist insbesondere selbst dafür verantwortlich zu prüfen, ob die Weitergabe von Mandantendaten an einen externen Auftragsverarbeiter einer Einwilligung der Mandanten bedarf, und diese gegebenenfalls einzuholen."
**Befund:** **Substantielle Beanstandung.** Die Klausel verlagert zwar zutreffend die berufsrechtliche Zulässigkeitsprüfung auf den Berufsträger (Anwalt), entlässt den Anbieter jedoch nicht aus seinen **eigenen Pflichten** nach § 203 Abs. 4 S. 2 Nr. 1 StGB i.V.m. § 43e Abs. 4 BRAO. Diese Vorschriften setzen voraus, dass der externe Dienstleister und seine Mitarbeiter förmlich auf das **Berufsgeheimnis verpflichtet** werden. Die Klausel adressiert dies nicht; eine entsprechende Verpflichtung fehlt sowohl in den AGB als auch im AVV.

Der seit Inkrafttreten des Gesetzes zur Neuregelung des Schutzes von Geheimnissen bei der Mitwirkung Dritter an der Berufsausübung schweigepflichtiger Personen (BGBl. I 2017 S. 3618) etablierte Standard verlangt:
- ausdrückliche Verpflichtung des Anbieters und seiner Mitarbeiter auf das Berufsgeheimnis;
- Sicherstellung gleichwertiger Verpflichtung gegenüber Subunternehmern;
- Hinweis auf die Strafbarkeit nach § 203 StGB.

Die alleinige Verlagerung der Verantwortung auf den Kunden gefährdet den Berufsträger im Strafverfahren und ist unter berufsrechtlichen Gesichtspunkten unzureichend.

#### D.I.38 — AGB Ziff. 9.5 (Datenzugriff durch Anbieter-Mitarbeiter)
**Wortlaut:** „Mitarbeiter des Anbieters greifen auf im System gespeicherte Inhaltsdaten des Kunden nur zu, wenn (a) der Kunde eine ausdrückliche Supportfreigabe erteilt hat, (b) eine gesetzliche Verpflichtung besteht (z. B. behördliche Auskunftsanordnung) oder (c) konkrete Anhaltspunkte für einen Straftatverdacht vorliegen."
**Befund:** Materiell wirksam und transparenzrechtlich begrüßenswert. Allerdings ist der Tatbestand (c) („konkrete Anhaltspunkte für einen Straftatverdacht") problematisch:
1. Der Anbieter ist als Auftragsverarbeiter nach Art. 28 DSGVO **weisungsgebunden** (vgl. AVV § 4); eine eigeninitiierte Datenanalyse durch den Anbieter ohne Weisung des Verantwortlichen verstößt gegen Art. 28 Abs. 3 lit. a DSGVO;
2. Bei Anwaltsmandanten ist die Kenntnisnahme strafbarer Inhalte durch den Auftragsverarbeiter strafbewehrt nach § 203 Abs. 4 StGB, soweit nicht Voraussetzungen einer Anzeigepflicht nach § 138 StGB greifen, die jedoch nur einen abgegrenzten Katalog umfasst.

Der Tatbestand (c) ist daher strikt eng auszulegen oder ersatzlos zu streichen.

#### D.I.39 — AGB Ziff. 10.1 (Anwendbares Recht)
**Wortlaut:** „Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG)."
**Befund:** Keine Beanstandung. Konform mit Art. 3 Rom I-VO; CISG-Ausschluss im B2B üblich.

#### D.I.40 — AGB Ziff. 10.2 (Gerichtsstand)
**Wortlaut:** „Ausschließlicher Gerichtsstand für alle Streitigkeiten aus und im Zusammenhang mit diesen AGB ist Hamburg, soweit der Kunde Kaufmann, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist. Zwingende gesetzliche Gerichtsstandsregelungen bleiben unberührt."
**Befund:** Keine Beanstandung. Konform mit § 38 Abs. 1 ZPO und Art. 25 Brüssel Ia-VO.

#### D.I.41 — AGB Ziff. 10.3 (AGB-Änderungsklausel mit Zustimmungsfiktion)
**Wortlaut:** „Der Anbieter ist berechtigt, diese AGB mit einer Ankündigungsfrist von mindestens 30 Tagen per E-Mail zu ändern. Die Ankündigung enthält einen ausdrücklichen Hinweis auf die Rechtsfolge des Schweigens sowie auf das Recht zur außerordentlichen Kündigung. Widerspricht der Kunde nicht innerhalb dieser Frist, gelten die neuen AGB als genehmigt. Widerspricht der Kunde, ist er berechtigt, den Vertrag zum Zeitpunkt des Inkrafttretens der neuen AGB außerordentlich zu kündigen; bis zur Kündigung läuft der Vertrag zu den bisherigen Bedingungen weiter."
**Befund:** Im B2B grundsätzlich zulässig. Zustimmungsfiktionsklauseln unterliegen seit der EuGH-Entscheidung **C-385/20 (DenizBank, Urt. v. 27.01.2021)** und der nachfolgenden BGH-Rechtsprechung im B2C-Verkehr verschärften Wirksamkeitsanforderungen (BGH, Urt. v. 27.04.2021 – XI ZR 26/20, NJW 2021, 2273); im B2B besteht jedoch nach § 310 Abs. 1 BGB keine direkte Anwendung, lediglich Indizwirkung. Die Klausel wahrt Indizwirkung, da sie:
- eine angemessene Vorankündigungsfrist (30 Tage) vorsieht;
- einen ausdrücklichen Hinweis auf die Zustimmungsfiktion verlangt;
- ein **Sonderkündigungsrecht** einräumt.

Empfehlenswert wäre eine Beschränkung der Zustimmungsfiktion auf Änderungen, die das **vertragliche Äquivalenzverhältnis nicht wesentlich verschieben** (BGH, st. Rspr. zu Bankenklauseln).

#### D.I.42 — AGB Ziff. 10.4 (Salvatorische Klausel)
**Wortlaut:** „Sollte eine Bestimmung dieser AGB unwirksam sein, bleiben die übrigen Bestimmungen davon unberührt."
**Befund:** Materiell wirksam, da rein erhaltend und ohne Beweislastumkehr. Die Klausel beschränkt sich auf die Trennbarkeitsregel des § 306 Abs. 1 BGB und enthält keine **Ersetzungsklausel**, was die Wirksamkeit fördert (BGH, Urt. v. 24.09.2002 – KZR 10/01, NJW 2003, 347 zu Salvatorischen Klauseln). Die fehlende Ersetzungsklausel hat allerdings zur Folge, dass im Fall der Unwirksamkeit einer Klausel auf das dispositive Recht zurückgegriffen wird (§ 306 Abs. 2 BGB), was im Einzelfall für den Anbieter ungünstige Konsequenzen haben kann.

#### D.I.43 — AGB Ziff. 10.5 (Streitbeilegung / ODR-Plattform)
**Wortlaut:** „Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr. Der Anbieter ist nicht verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
**Befund:** **Substantielle Beanstandung.** Die ODR-VO (VO (EU) Nr. 524/2013) wurde durch **VO (EU) 2024/3228** mit Wirkung zum **20.07.2025** aufgehoben; die ODR-Plattform der EU-Kommission ist seither eingestellt. Der Verweis auf die Plattform ist gegenstandslos und kann wettbewerbsrechtlich nach §§ 3, 5 UWG (Irreführung) angreifbar sein, soweit der Eindruck einer noch funktionsfähigen Streitbeilegungsmöglichkeit erweckt wird. Im B2B besteht überdies keinerlei Pflicht zur Aufnahme eines ODR-Hinweises (ODR-VO erfasste ohnehin nur B2C). Redaktionelle Beseitigung erforderlich.

Der zweite Halbsatz („Der Anbieter ist nicht verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen") spiegelt die VSBG-Klausel des Impressums (§ 36 VSBG); im B2B nicht erforderlich, aber rechtssystematisch unbedenklich.

#### D.I.44 — AGB Ziff. 10.6 (Höhere Gewalt)
**Wortlaut:** „Der Anbieter haftet nicht für die Verzögerung oder Nichterfüllung von Leistungen, soweit diese auf Umstände zurückzuführen sind, die außerhalb seines zumutbaren Einflussbereichs liegen, insbesondere auf Naturkatastrophen, behördliche Anordnungen, Netzwerkausfälle Dritter, Pandemien oder schwere Erkrankung des Betreibers als Einzelunternehmer. Der Anbieter wird den Kunden über solche Ereignisse unverzüglich informieren und sich um eine schnellstmögliche Wiederherstellung des Dienstbetriebs bemühen."
**Befund:** Im Grundsatz wirksam. Die Aufnahme der Tatbestände „Pandemien" und insbesondere „schwere Erkrankung des Betreibers als Einzelunternehmer" als Höhere-Gewalt-Tatbestand ist – jedenfalls bei einem einzelkaufmännischen Anbieter – ungewöhnlich, aber im B2B zulässig. Die Beanstandung ist hier transparenzrechtlich (§ 307 Abs. 1 S. 2 BGB) gering; bedenklich ist jedoch, dass die Klausel die Rechtsfolge „haftet nicht" ohne explizite Verzahnung zur Hauptleistungspflicht (Mietzahlungsanspruch des Anbieters) regelt. Empfehlenswert wäre die Aufnahme einer **Vergütungsanpassungsregel** (Mietminderung in Höhere-Gewalt-Phase), um das Synallagma zu wahren. Sodann wäre auch der Tatbestand „schwere Erkrankung des Betreibers" sinnvoll redaktionell um eine Mindestdauer und ggf. eine außerordentliche Kündigungsmöglichkeit des Kunden zu ergänzen, falls die Erkrankung längerfristig andauert.

### D.II. Auftragsverarbeitungsvertrag (AVV) — Hauptschwerpunkt

#### D.II.1 — AVV § 1 (Gegenstand und Dauer)
**Wortlaut:** „Dieser Vertrag regelt die Verarbeitung personenbezogener Daten durch fordify (Auftragsverarbeiter) im Auftrag des Kunden (Verantwortlicher) gemäß Art. 28 DSGVO. Der Vertrag gilt für die Dauer der Nutzung des kostenpflichtigen fordify-Abonnements."
**Befund:** Im Grundsatz wirksam. Die Pflichtangaben „Gegenstand und Dauer" nach Art. 28 Abs. 3 S. 1 DSGVO sind erfüllt. Zur Vermeidung von Auslegungsstreitigkeiten empfehlenswert wäre die Klarstellung, dass der AVV auch nach Vertragsende fortwirkt, soweit der Auftragsverarbeiter noch personenbezogene Daten zur Erfüllung von Restpflichten (Datenrückgabe, Löschung, gesetzliche Aufbewahrungspflichten) verarbeitet.

#### D.II.2 — AVV § 2 (Art und Zweck der Verarbeitung)
**Wortlaut:** „Gegenstand der Verarbeitung ist die Speicherung und Verwaltung von Forderungsdaten (Schuldner-Adressen, Mandantendaten, Berechnungsergebnisse) zum Zweck der Nutzung der fordify-Webanwendung durch den Verantwortlichen."
**Befund:** Inhaltlich grenzwertig knapp. Art. 28 Abs. 3 S. 1 DSGVO verlangt eine Festlegung der **Art** und des **Zwecks** der Verarbeitung. Der Wortlaut beschränkt sich auf die Funktionsbeschreibung; Verarbeitungstätigkeiten i.S.v. Art. 4 Nr. 2 DSGVO (Erheben, Erfassen, Organisation, Ordnung, Speicherung, Anpassung, Auslesen, Verwendung, Offenlegung, Übermittlung, Löschung) sind nicht ausdrücklich aufgelistet. Eine ausdifferenzierte Aufzählung der konkreten Verarbeitungstätigkeiten wäre vorzugswürdig, ist aber nicht zwingend, soweit der Zweck eindeutig ableitbar ist (vgl. EDSA-Leitlinien 07/2020 Tz. 113).

#### D.II.3 — AVV § 3 (Art der Daten und Kategorien betroffener Personen)
**Wortlaut:** „Verarbeitet werden Namen, Anschriften und Kontaktdaten von Schuldnern und Mandanten, die der Verantwortliche in fordify eingibt. Betroffene Personen im Sinne der DSGVO sind natürliche Personen, gegen die Forderungen bestehen oder die als Ansprechpartner von Mandanten oder Schuldnern in fordify hinterlegt sind. Darüber hinaus werden Stammdaten juristischer Personen (z. B. Firmenname, Geschäftsadresse) gespeichert, soweit diese im konkreten Fall mit personenbezogenen Daten natürlicher Personen verknüpft sind. Ferner wird zu jedem Fall ein Bearbeitungsstatus (Textkonstante: offen, in Vollstreckung, erledigt, abgeschrieben) sowie eine optionale Freitext-Notiz des Nutzers gespeichert; letztere kann personenbezogene Angaben Dritter enthalten."
**Befund:** Keine Beanstandung. Die Auflistung erfüllt Art. 28 Abs. 3 S. 1 DSGVO und ist im Branchenvergleich überdurchschnittlich präzise; der Hinweis auf Freitext-Notizen mit potenziellem personenbezogenem Drittbezug ist redaktionell vorbildlich.

#### D.II.4 — AVV § 4 Abs. 1 (Weisungsbindung / Drittlandtransfer)
**Wortlaut:** „fordify verarbeitet personenbezogene Daten ausschließlich auf dokumentierte Weisung des Verantwortlichen – einschließlich in Bezug auf die Übermittlung personenbezogener Daten in ein Drittland – es sei denn, fordify ist aufgrund des Unionsrechts oder des Rechts der Mitgliedstaaten zur Verarbeitung verpflichtet; in einem solchen Fall teilt fordify dem Verantwortlichen diese rechtlichen Anforderungen vor der Verarbeitung mit, sofern das betreffende Recht eine solche Mitteilung nicht aus wichtigen Gründen des öffentlichen Interesses verbietet."
**Befund:** Keine Beanstandung. Die Klausel reproduziert nahezu wörtlich Art. 28 Abs. 3 lit. a DSGVO und erfüllt damit zwingend die Anforderungen.

#### D.II.5 — AVV § 4 Abs. 2 (Hinweispflicht bei rechtswidriger Weisung)
**Wortlaut:** „Hält fordify eine Weisung des Verantwortlichen für einen Verstoß gegen die DSGVO oder sonstige Datenschutzvorschriften, informiert fordify den Verantwortlichen unverzüglich. fordify ist berechtigt, die Ausführung der betreffenden Weisung auszusetzen, bis der Verantwortliche diese bestätigt oder abändert."
**Befund:** Keine Beanstandung. Klausel erfüllt Art. 28 Abs. 3 S. 3 DSGVO; das Aussetzungsrecht ist eine sachgerechte Konkretisierung.

#### D.II.6 — AVV § 4 Abs. 3 (Vertraulichkeit der Beschäftigten)
**Wortlaut:** „fordify gewährleistet, dass die mit der Verarbeitung befassten Personen zur Vertraulichkeit verpflichtet sind oder einer angemessenen gesetzlichen Verschwiegenheitspflicht unterliegen."
**Befund:** Materiell konform mit Art. 28 Abs. 3 lit. b DSGVO. **Mangel:** Bei adressierter Anwaltsklientel fehlt eine spezifische Verpflichtung nach **§ 203 Abs. 4 S. 2 Nr. 1 StGB i.V.m. § 43e Abs. 4 BRAO**. Die allgemeine Vertraulichkeitsverpflichtung erfasst nicht die qualifizierte Strafbarkeit der Mitwirkenden bei Bruch des Berufsgeheimnisses; eine ausdrückliche Belehrung ist erforderlich. Da der Anbieter laut AVV § 5 als Einzelunternehmer agiert und voraussichtlich nur über wenige (oder keine) Mitarbeiter verfügt [ANNAHME], ist die Klausel im Verhältnis Anbieter selbst → Berufsgeheimnis durch eine ausdrückliche Erklärung des Anbieters auf eigene Verpflichtung zu erweitern.

#### D.II.7 — AVV § 4 Abs. 4 (Form der Weisungen)
**Wortlaut:** „Weisungen des Verantwortlichen bedürfen der Textform (E-Mail genügt). Konkludente Weisungen ergeben sich aus der bestimmungsgemäßen Nutzung der Anwendung gemäß den vereinbarten Nutzungsbedingungen."
**Befund:** Keine Beanstandung. Konkludente Weisungen aus bestimmungsgemäßer Nutzung sind in Auftragsverarbeitungs-Konstellationen anerkannt (vgl. EDSA-Leitlinien 07/2020 Tz. 79).

#### D.II.8 — AVV § 5 (Unterauftragsverarbeiter)
**Wortlaut:** „fordify setzt folgende Unterauftragsverarbeiter ein: Supabase Inc. (Sitz: USA; Datenspeicherung: EU Frankfurt, Deutschland) – Datenbankhosting und Authentifizierung (Standard Contractual Clauses); Resend Inc. (USA) – Transaktionale E-Mails (Standard Contractual Clauses); Hostinger International Ltd. (EU) – Betrieb der E-Mail-Automatisierungsinfrastruktur (N8N). Hinweis: Paddle.com Market Ltd. ist als Merchant of Record eigenverantwortlicher Datenverantwortlicher für die Zahlungsabwicklung und kein Unterauftragsverarbeiter von fordify. Änderungen bei Unterauftragsverarbeitern werden dem Verantwortlichen mindestens 30 Tage vorab per E-Mail mitgeteilt. Der Verantwortliche kann einer geplanten Änderung innerhalb dieser Frist widersprechen. fordify verpflichtet alle Unterauftragsverarbeiter vertraglich zur Einhaltung derselben Datenschutzpflichten, wie sie in diesem AVV geregelt sind, insbesondere hinsichtlich hinreichender Garantien für die Umsetzung geeigneter technischer und organisatorischer Maßnahmen (Art. 28 Abs. 4 DSGVO). Die Übermittlung personenbezogener Daten in Drittländer (USA) erfolgt auf Grundlage der Standardvertragsklauseln der EU-Kommission (Beschluss 2021/914/EU, Modul 2 – Controller to Processor). Auf Anfrage werden die einschlägigen SCC-Dokumente der jeweiligen Unterauftragsverarbeiter bereitgestellt."

**Befund:** Im Grundsatz konform mit Art. 28 Abs. 2 und 4 DSGVO. Beanstandungspunkte:

1. **Modul 2 vs. Modul 3 SCC:** Die Bezugnahme auf „Modul 2 – Controller to Processor" bedeutet, dass der **Verantwortliche (Kunde)** als Controller selbst SCC mit dem US-Subprozessor abgeschlossen hätte. Tatsächlich agiert hier jedoch ein **dreigliedriges Verhältnis**: Kunde (Controller) → fordify (Processor) → Supabase/Resend (Sub-Processor). In dieser Konstellation ist regelmäßig **Modul 3 (Processor to Processor)** einschlägig, nicht Modul 2. Die Bezeichnung „Modul 2" ist daher rechtssystematisch unzutreffend, soweit der Anbieter selbst die SCC mit Supabase/Resend in eigenem Namen abgeschlossen hat. Sofern der Anbieter Modul 3 vereinbart hat, ist die Klausel zu korrigieren; sofern Modul 2 vereinbart wurde (etwa aufgrund einer Pass-Through-Konstellation), ist die rechtliche Einordnung zu erläutern.

2. **EDSA-Empfehlungen 01/2020 / Transfer Impact Assessment (TIA):** Die Bezugnahme auf Standardvertragsklauseln allein genügt nach **EuGH, Schrems II** (C-311/18) und den nachfolgenden EDSA-Empfehlungen 01/2020 (Version 2.0, 18.06.2021) nicht; erforderlich ist ein **Transfer Impact Assessment**, welches insbesondere bei US-Empfängern die Reichweite des FISA 702-Zugriffs würdigt. Eine Erklärung des Auftragsverarbeiters über die Durchführung eines TIA fehlt. Da Supabase und Resend dem **EU-U.S. Data Privacy Framework (DPF)** beitreten können (Stand verifizieren), wäre vorrangig zu prüfen, ob der DPF-Angemessenheitsbeschluss (Durchführungsbeschluss (EU) 2023/1795) als primäre Transfergrundlage greift, wodurch die SCC-Pflicht entfällt. Klarstellung im AVV erforderlich.

3. **Hostinger International Ltd.:** Die Bezeichnung „(EU)" verschleiert den konkreten Unternehmenssitz; Hostinger International Ltd. hat ihren Sitz in **Zypern** (EU-Mitgliedstaat), die operative Mutter Hostinger Operations UAB in **Litauen**. Eine Drittlandsrelevanz besteht nicht. Konkretisierung empfehlenswert. Zu prüfen ist überdies, ob Hostinger seinerseits **Sub-Sub-Auftragsverarbeiter** einsetzt, deren Drittlandsrelevanz beleuchtet werden muss (insb. CDN- oder DDoS-Schutz-Provider).

4. **Widerspruchsmechanismus:** Die Klausel räumt einen Widerspruch innerhalb von 30 Tagen ein, normiert jedoch nicht die **Rechtsfolge des Widerspruchs**. Nach Art. 28 Abs. 2 S. 2 DSGVO ist der Auftragsverarbeiter verpflichtet, dem Widerspruch Rechnung zu tragen; sollte der Auftragsverarbeiter den Subprozessor dennoch einsetzen wollen, muss der Verantwortliche ein außerordentliches Kündigungsrecht haben. Die Klausel sollte dies ausdrücklich vorsehen.

5. **Aktualisierung der Subprozessor-Liste:** Die Klausel verweist zwar auf eine 30-tägige Vorab-Mitteilung, normiert jedoch nicht den **technischen Mechanismus der Aktualität** (z.B. veröffentlichte Liste auf einer Website mit Versionsnummer); dies wäre transparenzrechtlich vorzugswürdig.

#### D.II.9 — AVV § 6 Abs. 1 (TOMs)
**Wortlaut (Auszug):** „fordify trifft angemessene technische und organisatorische Maßnahmen (TOMs) nach Art. 32 DSGVO, insbesondere: Vertraulichkeit: Verschlüsselte Datenübertragung (TLS/HTTPS); Zugriffskontrolle über Row Level Security (RLS) in Supabase; Authentifizierung per Magic Link (passwortlos); Service Role Key wird ausschließlich serverseitig verwendet und nie an den Client übertragen. Integrität: Eingabevalidierung in Edge Functions; HMAC-Signaturprüfung für Paddle-Webhooks. Verfügbarkeit: Automatische Backups durch Supabase (täglich); georedundante Infrastruktur über den EU-Frankfurt-Datenbankcluster von Supabase. Belastbarkeit: Statische Auslieferung über CDN; Service-Worker-Caching für Offline-Betrieb. Datensparsamkeit: Es werden ausschließlich für den Betrieb erforderliche Daten gespeichert; keine Tracking-Cookies; datenschutzkonformes Analyse-Tool (GoatCounter, cookielos, selbst gehostet). Löschkonzept: Automatisierte Löschung von Fällen, Kontakten und Einstellungen nach Ablauf der Grace Period; Aufbewahrung von Profil- und Abrechnungsdaten für 10 Jahre (§ 147 AO)."
**Befund:** Materiell konform mit Art. 28 Abs. 3 lit. c, Art. 32 DSGVO. Die TOM-Beschreibung ist konkret und überdurchschnittlich präzise. Mängel:
1. Eine **Verschlüsselung der Daten at rest** wird nicht ausdrücklich erwähnt; Supabase bietet AES-256-Verschlüsselung at rest, dies sollte deklarativ aufgenommen werden;
2. Eine **Pseudonymisierung** i.S.v. Art. 32 Abs. 1 lit. a DSGVO wird nicht erwähnt; angesichts der Verarbeitung von Forderungsdaten ggf. nicht durchführbar, gleichwohl wäre eine ausdrückliche Negativfeststellung vorzugswürdig;
3. Ein **Verfahren zur regelmäßigen Überprüfung, Bewertung und Evaluierung der TOMs** (Art. 32 Abs. 1 lit. d DSGVO) fehlt. Auch wenn der Anbieter als Einzelunternehmer keine umfangreichen Audit-Strukturen vorhält, sollte zumindest ein periodischer Selbst-Review zugesagt sein;
4. **Keine Pseudonymisierung des Service Role Key in Logs** wird thematisiert; dies wäre zur Vermeidung versehentlicher Offenlegung relevant.

#### D.II.10 — AVV § 6 Abs. 2 (Privacy by Design)
**Wortlaut:** „fordify berücksichtigt bei der Entwicklung und dem Betrieb des Dienstes die Grundsätze des Datenschutzes durch Technikgestaltung und datenschutzfreundliche Voreinstellungen gemäß Art. 25 DSGVO."
**Befund:** Keine Beanstandung. Reflektiert Art. 25 DSGVO.

#### D.II.11 — AVV § 6 Abs. 3 (Meldung von Sicherheitsverletzungen)
**Wortlaut:** „Bei datenschutzrelevanten Sicherheitsverletzungen informiert fordify den Verantwortlichen unverzüglich, spätestens jedoch innerhalb von 72 Stunden nach Bekanntwerden, um dem Verantwortlichen die Erfüllung seiner Meldepflicht nach Art. 33 DSGVO zu ermöglichen (Art. 28 Abs. 3 lit. f DSGVO). Die Erstmeldung kann mit den zum Zeitpunkt verfügbaren Informationen erfolgen und wird vervollständigt, sobald weitere Erkenntnisse vorliegen (Art. 33 Abs. 4 DSGVO). fordify dokumentiert alle Verletzungen des Schutzes personenbezogener Daten gemäß Art. 33 Abs. 5 DSGVO und stellt diese Dokumentation dem Verantwortlichen auf Anfrage zur Verfügung."
**Befund:** Im Grundsatz konform mit Art. 33 DSGVO. **Beanstandung:** Die 72-Stunden-Frist ist im Verhältnis Auftragsverarbeiter → Verantwortlicher tatsächlich zu lang. Da der Verantwortliche **selbst** binnen 72 Stunden ab Kenntnis nach Art. 33 Abs. 1 DSGVO melden muss, würde eine 72-Stunden-Meldekette die Frist des Verantwortlichen vollständig ausschöpfen und keine Reaktionszeit lassen. Die EDSA-Leitlinien 9/2022 (Version 2.0, 28.03.2023) zu Datenpannenmeldungen verlangen daher faktisch eine **deutlich kürzere** interne Meldekette (Branchenstandard: 24–36 Stunden, idealerweise 12–24 Stunden). Empfehlenswert ist die Aufnahme einer Meldefrist von **24 Stunden**, ggf. mit Eskalationsstufen.

#### D.II.12 — AVV § 7 (Rechte betroffener Personen)
**Wortlaut:** „fordify unterstützt den Verantwortlichen bei der Erfüllung von Anfragen betroffener Personen (Auskunft, Löschung, Berichtigung) soweit technisch möglich. fordify unterstützt den Verantwortlichen darüber hinaus bei der Erfüllung von Pflichten aus Art. 32–36 DSGVO, insbesondere bei der Durchführung von Datenschutz-Folgeabschätzungen (Art. 35 DSGVO) und der Konsultation der Aufsichtsbehörde (Art. 36 DSGVO), soweit dies im Rahmen des Auftrags möglich und zumutbar ist."
**Befund:** Konform mit Art. 28 Abs. 3 lit. e und f DSGVO. **Beanstandung:** Die Einschränkung „soweit technisch möglich" bzw. „soweit dies im Rahmen des Auftrags möglich und zumutbar ist" ist zu weich; Art. 28 Abs. 3 lit. e DSGVO verlangt eine generelle Unterstützungspflicht. Empfehlenswert wäre die Konkretisierung der Reaktionsfristen (z.B. binnen 5 Werktagen) sowie der inhaltlichen Mindestleistungen (Datenexport, Löschung im Self-Service, Auskunftsbericht). Eine pauschale Verweisung auf „technische Möglichkeit" könnte als Verstoß gegen das Wirksamkeitsgebot des Art. 28 Abs. 3 lit. e DSGVO ausgelegt werden, wenn die TOM-Architektur die Unterstützung technisch verhindert.

Ferner fehlt der Hinweis, dass auch die Unterstützung bei **Art. 32 DSGVO (Sicherheitsmaßnahmen)**, **Art. 33/34 DSGVO (Datenpannenmeldung an Betroffene)** ausdrücklich zur Unterstützungspflicht gehört. Die Klausel benennt zwar Art. 32–36 DSGVO insgesamt, jedoch nur exemplarisch („insbesondere Art. 35, 36").

#### D.II.13 — AVV § 8 (Löschung und Rückgabe)
**Wortlaut:** „Nach Beendigung des Auftrags löscht fordify alle personenbezogenen Daten des Verantwortlichen innerhalb von 30 Tagen, sofern keine gesetzliche Aufbewahrungspflicht besteht. Auf Anfrage wird eine Kopie der Daten in maschinenlesbarem Format bereitgestellt."
**Befund:** Im Grundsatz konform mit Art. 28 Abs. 3 lit. g DSGVO. **Beanstandung:** Art. 28 Abs. 3 lit. g DSGVO verlangt das **Wahlrecht des Verantwortlichen** zwischen Löschung und Rückgabe. Die Klausel statuiert hingegen die Löschung als Standard, gewährt eine Kopie nur „auf Anfrage". Eine Klarstellung, dass dem Verantwortlichen **vor** Ablauf der Löschfrist die Wahl angeboten wird, ist erforderlich.

Konsistenz mit AGB Ziff. 5.6 (30 Tage Grace Period) ist gewahrt; einzelne redaktionelle Querbezüge (Aufbewahrung 10 Jahre nach § 147 AO) wären transparenzfördernd.

#### D.II.14 — AVV § 9 (Kontroll- und Nachweisrechte)
**Wortlaut:** „Der Verantwortliche ist berechtigt, die Einhaltung dieses Vertrags durch eigene Prüfungen oder durch beauftragte Dritte zu überprüfen, insbesondere durch Einsichtnahme in relevante Unterlagen. Vor-Ort-Inspektionen sind nach vorheriger schriftlicher Ankündigung mit einer Frist von mindestens fünf Werktagen und während der üblichen Geschäftszeiten möglich; sie sind auf das erforderliche Maß zu beschränken und dürfen den Betrieb nicht unverhältnismäßig beeinträchtigen. fordify stellt die hierfür erforderlichen Informationen bereit und unterstützt Audits im zumutbaren Rahmen. fordify ist berechtigt, an Stelle einer Vor-Ort-Inspektion einen aktuellen Bericht eines unabhängigen Sachverständigen (z. B. ISO-27001-Zertifikat oder gleichwertigen Nachweis) vorzulegen, sofern dieser die Prüffragen des Verantwortlichen hinreichend beantwortet."
**Befund:** Im Grundsatz konform mit Art. 28 Abs. 3 lit. h DSGVO. Die Klausel ist überdurchschnittlich präzise und enthält zutreffend das Substitutionsrecht durch Sachverständigenberichte (ISO 27001). **Hinweis:** Die Aufnahme einer Mindestfrist von 5 Werktagen ist im Branchenvergleich ungewöhnlich kurz und für den Anbieter ungünstig; üblich sind 4 Wochen. Aus Sicht des Verantwortlichen ist diese Klausel hingegen sehr günstig.

#### D.II.15 — AVV § 10 (Schlussbestimmungen)
**Wortlaut:** „Dieser Vertrag unterliegt dem Recht der Bundesrepublik Deutschland. Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist Hamburg, sofern der Verantwortliche Kaufmann, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist. Dieser Vertrag gilt als abgeschlossen, wenn der Verantwortliche die fordify AGB akzeptiert und den Dienst im Rahmen eines kostenpflichtigen Abonnements nutzt (Art. 28 Abs. 9 DSGVO). Der Zeitpunkt der Akzeptanz wird vom Anbieter dokumentiert und ist dem Verantwortlichen auf Anfrage mitzuteilen. Sollte eine Bestimmung dieses Vertrags unwirksam sein, bleiben die übrigen Bestimmungen davon unberührt."
**Befund:** Keine Beanstandung. Die Klausel reproduziert die Wirksamkeitsanforderung des Art. 28 Abs. 9 DSGVO und ist konsistent mit AGB Ziff. 9.2.

#### D.II.16 — AVV § 11 (Kontakt)
**Wortlaut:** „Bei Fragen zum AVV: datenschutz@fordify.de"
**Befund:** Keine Beanstandung.

### D.III. Datenschutzerklärung

#### D.III.1 — DSE Abschnitt 1 (Datenschutz auf einen Blick)
**Wortlaut (Auszug):** „Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. […]"
**Befund:** Keine Beanstandung. Die Allgemeinformulierung ist als Einleitung üblich; sie wird durch die nachfolgenden Abschnitte konkretisiert.

#### D.III.2 — DSE Abschnitt 2 (Hosting bei All-Inkl)
**Wortlaut (Auszug):** „Anbieter ist die ALL-INKL.COM - Neue Medien Münnich, Inh. René Münnich, Hauptstraße 68, 02742 Friedersdorf […]. Die Verwendung von All-Inkl erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. […] Wir haben einen Vertrag über Auftragsverarbeitung (AVV) zur Nutzung des oben genannten Dienstes geschlossen."
**Befund:** Keine Beanstandung. Rechtsgrundlage und AVV sind benannt.

#### D.III.3 — DSE Abschnitt 3 (Verantwortliche Stelle)
**Wortlaut (Auszug):** „Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist: Jens Wittern, Rhiemsweg 80, 22111 Hamburg. Telefon: +49 (0) 40 235 466 75. E-Mail: datenschutz@fordify.de."
**Befund:** Keine Beanstandung. Pflichtangaben nach Art. 13 Abs. 1 lit. a DSGVO erfüllt. Hinweis: Ein **Datenschutzbeauftragter** wird nicht benannt; soweit die Voraussetzungen des Art. 37 Abs. 1 DSGVO und des § 38 Abs. 1 BDSG nicht erreicht werden (insbesondere weniger als 20 ständig mit automatisierter Verarbeitung beschäftigte Personen) [ANNAHME: Einzelunternehmer ohne weitere Beschäftigte], besteht keine Bestellpflicht. Eine **klarstellende Negativaussage** wäre transparenzfördernd.

#### D.III.4 — DSE Abschnitt 3 (Speicherdauer)
**Wortlaut:** „Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. […]"
**Befund:** Im Grundsatz akzeptabel. Art. 13 Abs. 2 lit. a DSGVO verlangt entweder eine konkrete Frist oder ein **Kriterium** für die Festlegung der Frist. Das Kriterium „Zweckwegfall" ist anerkannt (vgl. EuGH, Urt. v. 24.02.2022 – C-175/20, ECLI:EU:C:2022:124), könnte jedoch für die einzelnen Verarbeitungsstränge konkretisierter sein (Tabellenform). **Beanstandung gering**, da die Klausel den EuGH-Anforderungen knapp genügt.

#### D.III.5 — DSE Abschnitt 3 (Allgemeine Hinweise zu Rechtsgrundlagen)
**Wortlaut:** „Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. […]"
**Befund:** Keine Beanstandung. Die einzelnen Rechtsgrundlagen werden in den späteren Abschnitten konkretisiert.

#### D.III.6 — DSE Abschnitt 3 (Empfänger personenbezogener Daten)
**Wortlaut:** „Im Rahmen unserer Geschäftstätigkeit arbeiten wir mit verschiedenen externen Stellen zusammen. Dabei ist teilweise auch eine Übermittlung von personenbezogenen Daten an diese externen Stellen erforderlich. […]"
**Befund:** Im Grundsatz konform mit Art. 13 Abs. 1 lit. e DSGVO. Eine **konkrete Empfängerliste** mit Bezug auf die in den Abschnitten 4 und 5 genannten Dienstleister fehlt; transparenzrechtlich vorzugswürdig wäre eine Tabelle.

#### D.III.7 — DSE Abschnitt 3 (Widerruf der Einwilligung)
**Befund:** Keine Beanstandung.

#### D.III.8 — DSE Abschnitt 3 (Widerspruchsrecht Art. 21 DSGVO)
**Wortlaut:** „WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT […]"
**Befund:** Keine Beanstandung. Die Hervorhebung in Großbuchstaben entspricht der Anforderung des Art. 21 Abs. 4 DSGVO an die deutliche Hervorhebung des Widerspruchsrechts.

#### D.III.9 — DSE Abschnitt 3 (Beschwerderecht bei Aufsichtsbehörde)
**Wortlaut:** „Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. […]"
**Befund:** Konform mit Art. 13 Abs. 2 lit. d, Art. 77 DSGVO. **Beanstandung:** Die für den Verantwortlichen **örtlich zuständige Aufsichtsbehörde** (Hamburgischer Beauftragter für Datenschutz und Informationsfreiheit – HmbBfDI, Ludwig-Erhard-Str. 22, 20459 Hamburg) wird nicht namentlich genannt. Zwar ist die Pflichtangabe formell allgemein gehalten, jedoch fördert die Nennung der zuständigen Behörde die praktische Wahrnehmbarkeit des Beschwerderechts und ist Branchenstandard.

#### D.III.10 — DSE Abschnitt 3 (Datenübertragbarkeit, Auskunft, Berichtigung, Löschung, Einschränkung, SSL/TLS, Werbe-Widerspruch)
**Befund:** Keine Beanstandung. Standardklauseln, ordnungsgemäß formuliert.

#### D.III.11 — DSE Abschnitt 4 (Server-Log-Dateien)
**Wortlaut (Auszug):** „Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien […]: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse. […] Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO."
**Befund:** Im Grundsatz konform. **Beanstandung:** Die **Speicherdauer** der Server-Log-Dateien wird nicht konkret angegeben; Art. 13 Abs. 2 lit. a DSGVO verlangt entweder eine konkrete Frist oder ein nachvollziehbares Kriterium. Branchenstandard sind 7–14 Tage; eine Angabe ist erforderlich.

#### D.III.12 — DSE Abschnitt 4 (Anfrage per E-Mail, Telefon oder Telefax)
**Befund:** Keine Beanstandung.

#### D.III.13 — DSE Abschnitt 4 (Lokale Datenspeicherung in der fordify-App)
**Wortlaut:** „Free-Tarif (kein Login): Arbeitsdaten […] werden ausschließlich sitzungsbezogen im Browser mittels der Browser-Technologie sessionStorage gespeichert. […] Nach dem Schließen des Browser-Tabs gehen sie unwiederbringlich verloren. […] Kostenpflichtige Tarife (Pro / Business): Arbeitsdaten werden zusätzlich dauerhaft im Browser (localStorage) sowie in der Cloud-Infrastruktur von Supabase gespeichert […]."
**Befund:** Im Grundsatz konform und transparenzrechtlich vorbildlich. **Hinweis zu § 25 TDDDG:** Der Zugriff auf `localStorage` und `sessionStorage` stellt im Sinne des § 25 Abs. 1 TDDDG einen „Zugriff auf Informationen, die auf dem Endgerät des Nutzers gespeichert sind" dar. Dieser ist einwilligungspflichtig, **es sei denn**, er ist „unbedingt erforderlich, damit der Anbieter eines Telemediendienstes einen vom Nutzer ausdrücklich gewünschten Telemediendienst zur Verfügung stellen kann" (§ 25 Abs. 2 Nr. 2 TDDDG). Die Speicherung von Arbeitsdaten zur Bereitstellung der Anwendungsfunktionalität ist in der Konstellation regelmäßig als unbedingt erforderlich einzustufen, sodass keine Einwilligungspflicht besteht. Klarstellung in der Datenschutzerklärung empfehlenswert.

#### D.III.14 — DSE Abschnitt 4 (Supabase)
**Wortlaut:** „Für kostenpflichtige Tarife setzen wir Supabase zur Bereitstellung von Cloud-Datenspeicherung und Benutzerauthentifizierung ein. Anbieter ist Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992. Die Datenspeicherung und -verarbeitung erfolgt ausschließlich auf Servern innerhalb der Europäischen Union (Rechenzentrum Frankfurt, Deutschland). […] Da Supabase Inc. seinen Firmensitz außerhalb der EU hat, wurden für den möglichen Zugriff des Anbieters auf Daten Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO, Beschluss 2021/914/EU) vereinbart. Rechtsgrundlage der Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO […]."
**Befund:** Im Grundsatz konform und transparenzrechtlich überdurchschnittlich. **Beanstandung gering:** Die **Sitzangabe Singapur** ist auf den ersten Blick irreführend, weil nach allgemeiner Branchenkenntnis Supabase Inc. ihren Hauptsitz in den USA hat [ANNAHME zu verifizieren – ggf. handelt es sich um die Konzernstruktur mit Asia-Pacific-Hub in Singapur]. Klärung der konkreten konzernrechtlichen Struktur empfehlenswert.

Hinweis zum **DPF (Data Privacy Framework):** Sofern Supabase Inc. unter dem EU-U.S. Data Privacy Framework zertifiziert ist (Verifikation am DPF-Verzeichnis erforderlich), wäre der DPF-Angemessenheitsbeschluss (Durchführungsbeschluss (EU) 2023/1795 vom 10.07.2023) primäre Transfergrundlage; SCC würden nur subsidiär greifen. Klarstellung in der Klausel empfehlenswert.

#### D.III.15 — DSE Abschnitt 4 (Resend)
**Wortlaut:** „Anbieter ist Resend Inc., 2261 Market Street #5643, San Francisco, CA 94114, USA. E-Mails werden über die Subdomain mail.fordify.de versandt; die Server-Infrastruktur befindet sich innerhalb der Europäischen Union. […] Für die Übermittlung in die USA stützen wir uns auf Standardvertragsklauseln (Standard Contractual Clauses, Art. 46 Abs. 2 lit. c DSGVO), die zwischen uns und Resend vereinbart wurden."
**Befund:** Im Grundsatz konform. **Hinweis:** DPF-Prüfung (s.o. Supabase) auch hier erforderlich. Eine Erwähnung des **Transfer Impact Assessment (TIA)** entsprechend EDSA-Empfehlungen 01/2020 ist in der Datenschutzerklärung zwar nicht zwingend, jedoch wird häufig erwartet.

#### D.III.16 — DSE Abschnitt 4 (E-Mail-Automatisierung / N8N)
**Wortlaut:** „Für die automatisierte Auslösung transaktionaler E-Mails […] betreiben wir eine eigene Automatisierungslösung (N8N) auf einem Server innerhalb der Europäischen Union (Hostinger VPS). […] Da die Infrastruktur vollständig im eigenen Betrieb liegt, erfolgt keine Datenübertragung an Dritte."
**Befund:** Inhaltlich grenzwertig. Die Aussage „keine Datenübertragung an Dritte" ist insoweit fragwürdig, als **Hostinger als Hosting-Provider** technisch weiterhin Datenzugriff hat (Server-Administration, Backup, technische Wartung). Hostinger ist daher als **Auftragsverarbeiter** zu qualifizieren und wird in AVV § 5 zutreffend genannt; die Aussage in der Datenschutzerklärung ist redaktionell missverständlich.

#### D.III.17 — DSE Abschnitt 4 (GoatCounter)
**Wortlaut (Auszug):** „GoatCounter, einen datenschutzfreundlichen Webanalysedienst von Martin Tournoij […]. Die Server-Infrastruktur wird von Hetzner Online GmbH in Deutschland betrieben. Es werden keine Cookies gesetzt, keine geräteübergreifenden Profile erstellt und kein Fingerprinting betrieben. IP-Adressen werden nicht gespeichert."
**Befund:** Keine Beanstandung. Cookielose Webanalyse ist nach DSK-Orientierungshilfe für Anbieter von Telemedien (Stand 20.12.2021) auf Art. 6 Abs. 1 lit. f DSGVO ohne Einwilligung tragbar.

#### D.III.18 — DSE Abschnitt 4 (Paddle)
**Wortlaut:** „Die Zahlungsabwicklung für kostenpflichtige Tarife erfolgt über Paddle (Paddle.com Market Limited, Judd House, 18-29 Mora Street, London, EC1V 8BT, Vereinigtes Königreich). Paddle tritt dabei als sogenannter Merchant of Record auf […]. Paddle ist für die im Rahmen des Bezahlvorgangs verarbeiteten Zahlungs- und Rechnungsdaten (Name, Rechnungsadresse, Zahlungsmittelinformationen) eigenständig Verantwortlicher im Sinne des Art. 4 Nr. 7 DSGVO. […]"
**Befund:** Im Grundsatz konform. **Beanstandung:** Die Übermittlung in das **Vereinigte Königreich** wird nicht als solche thematisiert. Das Vereinigte Königreich ist seit dem Brexit ein **Drittland i.S.v. Art. 44 ff. DSGVO**, jedoch besteht ein **Angemessenheitsbeschluss** (Durchführungsbeschluss (EU) 2021/1772 vom 28.06.2021), wonach personenbezogene Daten ohne weitere Rechtfertigung übermittelt werden können. Der Beschluss ist befristet bis Dezember 2025 und wurde durch die EU-Kommission **bis Ende 2025/Anfang 2026** überprüft. [ANNAHME zum heutigen Stand: Verlängerung erfolgt; aktuell zu verifizieren]. Eine Erwähnung des Adäquanzbeschlusses ist erforderlich, um die Drittlandtransfer-Pflichten nach Art. 13 Abs. 1 lit. f DSGVO zu erfüllen.

#### D.III.19 — DSE Abschnitt 5 (Schriftarten selbst gehostet)
**Wortlaut:** „Diese Website verwendet die Schriftarten Inter und JetBrains Mono, die vollständig auf eigenen Servern gehostet werden. Es findet keine Verbindung zu externen Schriftarten-Diensten statt; es werden dabei keine Daten an Dritte übertragen."
**Befund:** Keine Beanstandung. Selbst-Hosting der Schriftarten ist nach LG München I, Urt. v. 20.01.2022 – 3 O 17493/20 (zu Google Fonts) der vorzugswürdige Weg.

### D.IV. Impressum

#### D.IV.1 — Impressum (Anbieterkennzeichnung)
**Wortlaut:** „Angaben gemäß § 5 DDG. Jens Wittern, Rhiemsweg 80, 22111 Hamburg."
**Befund:** Keine Beanstandung. Pflichtangabe nach § 5 Abs. 1 Nr. 1 DDG erfüllt; die zutreffende Bezugnahme auf das **Digitale-Dienste-Gesetz** (DDG, in Kraft seit 14.05.2024) ist redaktionell aktuell. Das ehemals geltende TMG ist nicht mehr in Bezug genommen.

#### D.IV.2 — Impressum (Kontakt)
**Wortlaut:** „Telefon: +49 (0) 40 235 466 75. E-Mail: legal@fordify.de."
**Befund:** Keine Beanstandung. Pflichtangabe nach § 5 Abs. 1 Nr. 2 DDG erfüllt; zwei Kommunikationswege bezeichnet. Konform mit EuGH, Urt. v. 16.10.2008 – C-298/07 (BVV).

#### D.IV.3 — Impressum (Umsatzsteuer-IdNr.)
**Wortlaut:** „Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE309464035."
**Befund:** Keine Beanstandung. Pflichtangabe nach § 5 Abs. 1 Nr. 6 DDG erfüllt. Bemerkenswerte Inkohärenz mit AGB Ziff. 4.1 (Kleinunternehmer nach § 19 UStG): Kleinunternehmer können eine USt-IdNr. innehaben, sind aber zu deren Verwendung nicht verpflichtet; im Außenverhältnis ist die Nennung der USt-IdNr. dann sinnvoll, wenn EU-grenzüberschreitende Geschäfte stattfinden. Im Übrigen entfaltet die USt-IdNr. nur dann tatsächliche Bedeutung, wenn umsatzsteuerlich relevante Geschäfte vorliegen; bei Kleinunternehmer-Status ist sie eher deklaratorisch. Keine Beanstandung; nur redaktionell hinweiswert.

#### D.IV.4 — Impressum (Verbraucherstreitbeilegung)
**Wortlaut:** „Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
**Befund:** Keine Beanstandung. § 36 Abs. 1 VSBG verlangt im B2C-Verkehr eine Information; im reinen B2B nicht zwingend, aber rechtssystematisch unbedenklich. Da das Angebot nach AGB Ziff. 1.2 ohnehin nur an Unternehmer gerichtet ist, hat die Klausel deklaratorischen Charakter.

**Anmerkung zur ODR-Plattform:** Im Impressum **fehlt** der ODR-Plattform-Hinweis vollständig — dies ist seit Aufhebung der ODR-VO durch VO (EU) 2024/3228 zum 20.07.2025 korrekt und nicht zu beanstanden. Allerdings findet sich in **AGB Ziff. 10.5** noch ein veralteter Verweis (siehe D.I.43).

---

## E. Redline-Änderungsvorschläge (klauselweise)

### E.I. AGB

#### E.AGB.6 — Ziff. 2.3 (Sonderkündigungsrecht bei wesentlicher Leistungsreduzierung)
- **Originaltext:** „Der Anbieter ist berechtigt, den Funktionsumfang des Dienstes weiterzuentwickeln. Wesentliche Leistungsreduzierungen werden dem Kunden mit einer Frist von mindestens 30 Tagen per E-Mail angekündigt."
- **Beanstandung:** Fehlendes Sonderkündigungsrecht bei wesentlicher Leistungsreduzierung; Transparenz- und Ausgewogenheitsmangel im Sinne von § 307 Abs. 1 S. 1, 2 BGB.
- **Redline-Vorschlag:** „Der Anbieter ist berechtigt, den Funktionsumfang des Dienstes weiterzuentwickeln. Wesentliche Leistungsreduzierungen werden dem Kunden mit einer Frist von mindestens 30 Tagen per E-Mail angekündigt. **Bei wesentlichen Leistungsreduzierungen, die den Vertragszweck spürbar beeinträchtigen, steht dem Kunden ein Sonderkündigungsrecht zum Wirksamkeitstermin der Reduzierung zu, das er innerhalb von 14 Tagen nach Zugang der Ankündigung in Textform ausüben kann.**"
- **Begründung:** Wahrung der Vertragsausgewogenheit und der Transparenz nach § 307 Abs. 1 S. 1, 2 BGB.

#### E.AGB.13 — Ziff. 4.3 (Vorankündigung der Sperrung)
- **Originaltext:** „Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zum kostenpflichtigen Tarif bis zur vollständigen Zahlung zu sperren."
- **Beanstandung:** Verhältnismäßigkeitsdefizit; ohne Mahnschwelle und Vorankündigung.
- **Redline-Vorschlag:** „Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zum kostenpflichtigen Tarif bis zur vollständigen Zahlung zu sperren. **Die Sperrung wird dem Kunden mindestens 7 Kalendertage vorher per E-Mail angekündigt; sie unterbleibt, wenn der Kunde die offenen Forderungen vor Wirksamkeit der Sperrung ausgleicht.** Die Sperrung berührt nicht das Recht des Kunden auf Datenexport gemäß § 5.6."
- **Begründung:** Wahrung des Verhältnismäßigkeitsgebots (§ 307 Abs. 1 S. 1 BGB).

#### E.AGB.14 — Ziff. 4.4 (Preisänderung mit Anpassungsmaßstab)
- **Originaltext:** „Preisänderungen werden dem Kunden mindestens 30 Tage vor Inkrafttreten per E-Mail mitgeteilt. Die Mitteilung enthält einen ausdrücklichen Hinweis darauf, dass das Ausbleiben eines Widerspruchs innerhalb von 14 Tagen als Zustimmung zur Preisänderung gilt. Widerspricht der Kunde nicht innerhalb dieser Frist, gilt die Änderung als genehmigt."
- **Beanstandung:** Fehlender Anpassungsmaßstab; Transparenzdefizit nach § 307 Abs. 1 S. 2 BGB; knappe Widerspruchsfrist.
- **Redline-Vorschlag:** „Der Anbieter ist berechtigt, die Preise frühestens 12 Monate nach Vertragsschluss und sodann mit einer Vorankündigungsfrist von mindestens 30 Tagen anzupassen, soweit sich die Kosten für die Bereitstellung des Dienstes (insbesondere Hosting-, Lizenz-, Personal- und Compliance-Kosten) verändert haben. **Die Anpassung erfolgt nur in dem Umfang, in dem die Kostenänderung den Preis beeinflusst.** Die Mitteilung enthält einen ausdrücklichen Hinweis auf die Rechtsfolge des Schweigens sowie auf das Sonderkündigungsrecht nach § 4.5. Widerspricht der Kunde nicht innerhalb von **30 Tagen** nach Mitteilung in Textform, gilt die Preisänderung als genehmigt."
- **Begründung:** Konkretisierung des Anpassungsmaßstabs entsprechend Transparenzgebot des § 307 Abs. 1 S. 2 BGB; Verlängerung der Widerspruchsfrist auf 30 Tage zur Synchronisation mit der Vorankündigungsfrist.

#### E.AGB.30 — Ziff. 8.3 (Kardinalpflicht-Definition und vertragstypische Schadenshöhe)
- **Originaltext:** „Soweit nicht zwingendes Recht etwas anderes vorschreibt, haftet der Anbieter nur für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen. Die Haftung für leichte Fahrlässigkeit ist – außer bei Verletzung wesentlicher Vertragspflichten, bei Schäden aus Verletzung des Lebens, des Körpers oder der Gesundheit sowie bei Ansprüchen nach dem Produkthaftungsgesetz – ausgeschlossen."
- **Beanstandung:** Fehlende Definition der Kardinalpflichten; fehlende Begrenzung auf den vertragstypischen, vorhersehbaren Schaden.
- **Redline-Vorschlag:** „Der Anbieter haftet bei einfacher Fahrlässigkeit nicht, es sei denn, es liegt eine Verletzung **wesentlicher Vertragspflichten (Kardinalpflichten)** vor. **Wesentliche Vertragspflichten sind solche, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertraut und vertrauen darf.** Bei Verletzung wesentlicher Vertragspflichten durch einfache Fahrlässigkeit ist die Haftung **auf den vertragstypischen, vorhersehbaren Schaden begrenzt**. Im Übrigen haftet der Anbieter unbeschränkt für Vorsatz, grobe Fahrlässigkeit, Schäden aus Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Ansprüche nach dem Produkthaftungsgesetz."
- **Begründung:** Gefestigte BGH-Rechtsprechung zur Kardinalpflicht-Klausel verlangt eine inhaltliche Definition und die Begrenzung auf den vertragstypischen Schaden zur Wahrung des Transparenzgebots (st. Rspr. zu Kardinalpflichten).

#### E.AGB.31 — Ziff. 8.4 (Rückausnahme für Vorsatz)
- **Originaltext:** „Soweit der Anbieter nach § 8.3 dem Grunde nach haftet, ist die Haftung der Höhe nach auf den Betrag begrenzt, den der Kunde im betreffenden Kalenderjahr an den Anbieter gezahlt hat, mindestens jedoch 500 Euro. Diese Begrenzung gilt nicht für Ansprüche wegen Verletzung von Leben, Körper oder Gesundheit sowie für Ansprüche nach dem Produkthaftungsgesetz."
- **Beanstandung:** Fehlende Rückausnahme für Vorsatzschäden; Verstoß gegen § 276 Abs. 3 BGB.
- **Redline-Vorschlag:** „Soweit der Anbieter nach § 8.3 dem Grunde nach haftet, ist die Haftung der Höhe nach auf den Betrag begrenzt, den der Kunde im betreffenden Kalenderjahr an den Anbieter gezahlt hat, mindestens jedoch 500 Euro. Diese Begrenzung gilt nicht **für Schäden aus Vorsatz,** für Ansprüche wegen Verletzung von Leben, Körper oder Gesundheit sowie für Ansprüche nach dem Produkthaftungsgesetz."
- **Begründung:** Zwingende Vorgabe des § 276 Abs. 3 BGB; ohne Rückausnahme partielle Unwirksamkeit der Klausel.

#### E.AGB.33 — Ziff. 8.6 (Verfügbarkeitsklausel mit konkreter SLA)
- **Originaltext:** „Der Anbieter ist bestrebt, den Dienst möglichst unterbrechungsfrei bereitzustellen. Ein Anspruch auf eine bestimmte Verfügbarkeit besteht nicht. Geplante Wartungsarbeiten werden, soweit möglich, in nachfrageschwachen Zeiten durchgeführt. Vorübergehende Einschränkungen aufgrund technischer Notwendigkeiten begründen keinen Anspruch auf Mietminderung oder Schadensersatz."
- **Beanstandung:** Pauschaler Verfügbarkeitsausschluss höhlt Hauptleistungspflicht aus § 535 Abs. 1 S. 2 BGB aus; Verstoß gegen § 307 Abs. 2 Nr. 2 BGB.
- **Redline-Vorschlag:** „Der Anbieter stellt den Dienst mit einer Verfügbarkeit von **mindestens 99 % im Jahresmittel** bereit, gemessen am Übergabepunkt der Internet-Schnittstelle des Anbieters. Nicht in die Verfügbarkeitsberechnung einzurechnen sind: (a) angekündigte Wartungsfenster (regelmäßig außerhalb der üblichen Geschäftszeiten Werktags 8:00–18:00 Uhr MEZ), (b) Ausfälle aufgrund höherer Gewalt im Sinne von § 10.6, (c) Ausfälle bei Unterauftragsverarbeitern, soweit diese außerhalb des zumutbaren Einflussbereichs des Anbieters liegen. **Im Übrigen bleiben die mietrechtlichen Mängelrechte des Kunden unberührt; insbesondere ist die Mietminderung gemäß § 536 BGB nicht ausgeschlossen, soweit eine erhebliche Beeinträchtigung der Tauglichkeit zum vertragsgemäßen Gebrauch vorliegt.**"
- **Begründung:** Wirksame Konkretisierung der Beschaffenheit i.S.v. § 535 Abs. 1 S. 2 BGB unter Wahrung der Mietminderungsrechte. Die Quote von 99 % ist im SaaS-Bereich für nicht-geschäftskritische Anwendungen branchenüblich; eine höhere Quote ist gleichermaßen denkbar.

#### E.AGB.37 — Ziff. 9.4 / Ergänzung um Berufsgeheimnis-Verpflichtung
- **Originaltext:** „Soweit der Kunde zur Nutzung des Dienstes Daten eingibt, die berufsrechtlichem Geheimnisschutz unterliegen […], liegt die Verantwortung für die berufsrechtliche Zulässigkeit der Übermittlung und Verarbeitung dieser Daten ausschließlich beim Kunden. […]"
- **Beanstandung:** Fehlende ausdrückliche Verpflichtung des Anbieters auf das Berufsgeheimnis; Verstoß gegen § 203 Abs. 4 S. 2 Nr. 1 StGB i.V.m. § 43e Abs. 4 BRAO.
- **Redline-Vorschlag (ergänzte Klausel):** „Soweit der Kunde zur Nutzung des Dienstes Daten eingibt, die berufsrechtlichem Geheimnisschutz unterliegen – insbesondere Mandantendaten im Sinne des § 43a BRAO –, gelten ergänzend die folgenden Bestimmungen:
  - **(a) Verpflichtung des Anbieters auf das Berufsgeheimnis. Der Anbieter und seine Mitarbeiter werden hiermit gemäß § 203 Abs. 4 S. 2 Nr. 1 StGB i.V.m. § 43e Abs. 4 BRAO zur Verschwiegenheit über alle ihnen im Rahmen der Leistungserbringung bekannt werdenden, dem Berufsgeheimnis unterliegenden Tatsachen verpflichtet. Diese Verpflichtung wirkt über das Vertragsende hinaus.**
  - **(b) Belehrung. Der Anbieter wurde über die Strafbarkeit eines Bruchs des Berufsgeheimnisses nach § 203 StGB belehrt.**
  - **(c) Subunternehmer. Der Anbieter wird sicherstellen, dass von ihm beauftragte Unterauftragsverarbeiter (vgl. AVV § 5) auf das Berufsgeheimnis in äquivalenter Weise verpflichtet werden.**
  - (d) Die berufsrechtliche Zulässigkeitsprüfung der Datenübermittlung sowie die etwaige Einholung von Mandanteneinwilligungen obliegen dem Kunden."
- **Begründung:** Erfüllung der berufsrechtlichen Pflichten des Berufsträgers (§ 43e Abs. 4 BRAO); Schutz vor Strafbarkeit nach § 203 StGB sowohl auf Anbieter- als auch auf Kundenseite.

#### E.AGB.38 — Ziff. 9.5 (Datenzugriff – Tatbestand c) Streichung)
- **Originaltext:** „Mitarbeiter des Anbieters greifen auf im System gespeicherte Inhaltsdaten des Kunden nur zu, wenn […] (c) konkrete Anhaltspunkte für einen Straftatverdacht vorliegen."
- **Beanstandung:** Eigeninitiierte Datenanalyse ohne Weisung verletzt Art. 28 Abs. 3 lit. a DSGVO und ist bei Berufsgeheimnis-Daten strafbewehrt nach § 203 Abs. 4 StGB.
- **Redline-Vorschlag:** „Mitarbeiter des Anbieters greifen auf im System gespeicherte Inhaltsdaten des Kunden nur zu, wenn (a) der Kunde eine ausdrückliche Supportfreigabe erteilt hat **oder** (b) eine gesetzliche Verpflichtung besteht (z.B. behördliche Auskunftsanordnung)." **[Tatbestand (c) STREICHUNG.]**
- **Begründung:** Tatbestand (c) ist mit Art. 28 Abs. 3 lit. a DSGVO und § 203 StGB nicht vereinbar.

#### E.AGB.43 — Ziff. 10.5 (ODR-Hinweis Streichung)
- **Originaltext:** „Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr. Der Anbieter ist nicht verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
- **Beanstandung:** ODR-Plattform existiert seit 20.07.2025 nicht mehr (Aufhebung der ODR-VO durch VO (EU) 2024/3228); Verweis ist gegenstandslos und potentiell wettbewerbsrechtlich angreifbar nach §§ 3, 5 UWG.
- **Redline-Vorschlag:** Erster Satz **[STREICHUNG]**. Ersatz: „**Streitbeilegung. Der Anbieter ist nicht bereit oder verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).** Der Dienst richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB; verbraucherschützende Vorschriften finden keine Anwendung."
- **Begründung:** Beseitigung des veralteten ODR-Verweises; Beibehaltung des VSBG-Hinweises (rechtssystematisch unbedenklich).

### E.II. AVV

#### E.AVV.6 — § 4 Abs. 3 (Ergänzung Berufsgeheimnis)
- **Originaltext:** „fordify gewährleistet, dass die mit der Verarbeitung befassten Personen zur Vertraulichkeit verpflichtet sind oder einer angemessenen gesetzlichen Verschwiegenheitspflicht unterliegen."
- **Beanstandung:** Fehlende Ergänzung um Berufsgeheimnis-Verpflichtung gemäß § 203 Abs. 4 S. 2 Nr. 1 StGB i.V.m. § 43e Abs. 4 BRAO.
- **Redline-Vorschlag:** „fordify gewährleistet, dass die mit der Verarbeitung befassten Personen zur Vertraulichkeit verpflichtet sind oder einer angemessenen gesetzlichen Verschwiegenheitspflicht unterliegen. **Soweit der Verantwortliche Berufsgeheimnisträger im Sinne des § 203 StGB ist, werden der Anbieter und alle mit der Verarbeitung befassten Personen darüber hinaus gemäß § 203 Abs. 4 S. 2 Nr. 1 StGB i.V.m. § 43e Abs. 4 BRAO zur Verschwiegenheit über die im Rahmen der Verarbeitung bekannt werdenden Tatsachen verpflichtet und über die Strafbarkeit nach § 203 StGB belehrt.**"
- **Begründung:** Erfüllung der Pflichten aus § 43e Abs. 4 BRAO.

#### E.AVV.8 — § 5 (Modul-Korrektur, DPF, Hostinger-Sitz, Widerspruchsfolgen)
- **Originaltext:** s.o. D.II.8.
- **Beanstandungen:** Modul-Bezeichnung der SCC; fehlender DPF-Bezug; ungenaue Hostinger-Sitzangabe; fehlende Rechtsfolge des Widerspruchs.
- **Redline-Vorschlag:**
  - „Die Übermittlung personenbezogener Daten in Drittländer (USA) erfolgt vorrangig auf Grundlage des **EU-U.S. Data Privacy Framework (Durchführungsbeschluss (EU) 2023/1795 vom 10.07.2023)**, soweit der jeweilige Unterauftragsverarbeiter aktiv unter dem DPF zertifiziert ist. Subsidiär werden Standardvertragsklauseln der EU-Kommission (Beschluss 2021/914/EU, **Modul 3 – Processor to Processor**) zwischen dem Anbieter und dem Unterauftragsverarbeiter vereinbart. Der Anbieter hat ein Transfer Impact Assessment durchgeführt, dessen Ergebnis dem Verantwortlichen auf Anfrage in Auszügen zur Verfügung gestellt wird."
  - „**Hostinger International Ltd. (Sitz: Zypern, EU)** – Betrieb der E-Mail-Automatisierungsinfrastruktur (N8N); kein Drittlandtransfer."
  - „**Widerspricht der Verantwortliche einer geplanten Änderung des Subprozessors innerhalb der 30-tägigen Frist und kann der Anbieter dem Widerspruch nicht entsprechen, ist der Verantwortliche berechtigt, das kostenpflichtige Abonnement mit einer Frist von einem Monat zum Wirksamkeitstermin der Änderung außerordentlich zu kündigen.**"
- **Begründung:** Korrekte Modul-Bezeichnung; Berücksichtigung des DPF-Adäquanzbeschlusses; Konkretisierung der Hostinger-Sitzangabe; Erfüllung der Folgenregelung nach Art. 28 Abs. 2 DSGVO.

#### E.AVV.9 — § 6 (Ergänzungen TOMs)
- **Originaltext:** s.o. D.II.9.
- **Beanstandungen:** Fehlende Verschlüsselung at rest; fehlendes Verfahren zur regelmäßigen Überprüfung der TOMs; fehlende Pseudonymisierung-Klausel.
- **Redline-Vorschlag (ergänzte Spiegelstriche):**
  - „**Verschlüsselung at rest:** Sämtliche personenbezogenen Daten werden in der Datenbankinstanz von Supabase mit AES-256 verschlüsselt gespeichert."
  - „**Pseudonymisierung:** Soweit der Verarbeitungszweck dies zulässt, werden personenbezogene Daten pseudonymisiert verarbeitet; eine Pseudonymisierung der Schuldner- und Mandantendaten ist technisch nicht durchführbar, da diese als Klartextdaten zur Forderungsdarstellung benötigt werden (Negativfeststellung)."
  - „**Regelmäßige Überprüfung der TOMs:** Der Anbieter überprüft die technischen und organisatorischen Maßnahmen mindestens einmal jährlich und passt diese bei Bedarf an. Eine Dokumentation der Überprüfung wird dem Verantwortlichen auf Anfrage zur Verfügung gestellt (Art. 32 Abs. 1 lit. d DSGVO)."
- **Begründung:** Vollständige Erfüllung der TOM-Anforderungen aus Art. 32 DSGVO.

#### E.AVV.11 — § 6 Abs. 3 (Verkürzung der Meldefrist)
- **Originaltext:** „Bei datenschutzrelevanten Sicherheitsverletzungen informiert fordify den Verantwortlichen unverzüglich, spätestens jedoch innerhalb von 72 Stunden nach Bekanntwerden, um dem Verantwortlichen die Erfüllung seiner Meldepflicht nach Art. 33 DSGVO zu ermöglichen […]."
- **Beanstandung:** 72-Stunden-Frist zwischen Auftragsverarbeiter und Verantwortlichem ist faktisch unangemessen, da sie die 72-Stunden-Frist des Art. 33 Abs. 1 DSGVO vollständig ausschöpft.
- **Redline-Vorschlag:** „Bei datenschutzrelevanten Sicherheitsverletzungen informiert fordify den Verantwortlichen unverzüglich, spätestens jedoch **innerhalb von 24 Stunden nach Bekanntwerden** […]."
- **Begründung:** Sicherung der praktischen Wirksamkeit der Meldepflicht des Verantwortlichen aus Art. 33 Abs. 1 DSGVO.

#### E.AVV.12 — § 7 (Verschärfung der Unterstützungspflicht)
- **Originaltext:** „fordify unterstützt den Verantwortlichen bei der Erfüllung von Anfragen betroffener Personen (Auskunft, Löschung, Berichtigung) soweit technisch möglich. […]"
- **Beanstandung:** Pauschaler Vorbehalt der „technischen Möglichkeit" untergräbt Art. 28 Abs. 3 lit. e DSGVO.
- **Redline-Vorschlag:** „fordify unterstützt den Verantwortlichen **mit geeigneten technischen und organisatorischen Maßnahmen** bei der Erfüllung von Anfragen betroffener Personen nach Art. 15–22 DSGVO; eine Reaktion erfolgt **innerhalb von fünf Werktagen nach Eingang der Anfrage**. Diese Unterstützung umfasst insbesondere: (a) die Bereitstellung eines Daten-Exports im maschinenlesbaren Format auf Anfrage, (b) die Löschung personenbezogener Daten auf Weisung des Verantwortlichen, (c) die Bereitstellung von Auskunftsberichten zu den vom Verantwortlichen erhobenen Daten. fordify unterstützt den Verantwortlichen darüber hinaus bei der Erfüllung der Pflichten aus **Art. 32 (Sicherheit der Verarbeitung), Art. 33 und 34 (Meldung von Datenschutzverletzungen), Art. 35 (Datenschutz-Folgenabschätzung) und Art. 36 (vorherige Konsultation der Aufsichtsbehörde)** unter Berücksichtigung der Art der Verarbeitung und der dem Anbieter zur Verfügung stehenden Informationen."
- **Begründung:** Konkretisierung der Unterstützungspflicht entsprechend Art. 28 Abs. 3 lit. e und f DSGVO sowie EDSA-Leitlinien 07/2020.

#### E.AVV.13 — § 8 (Wahlrecht des Verantwortlichen vor Löschung)
- **Originaltext:** „Nach Beendigung des Auftrags löscht fordify alle personenbezogenen Daten des Verantwortlichen innerhalb von 30 Tagen, sofern keine gesetzliche Aufbewahrungspflicht besteht. Auf Anfrage wird eine Kopie der Daten in maschinenlesbarem Format bereitgestellt."
- **Beanstandung:** Wahlrecht zwischen Löschung und Rückgabe nicht ausdrücklich eingeräumt; Verstoß gegen Art. 28 Abs. 3 lit. g DSGVO.
- **Redline-Vorschlag:** „Nach Beendigung des Auftrags **stellt fordify dem Verantwortlichen eine Frist von 30 Tagen zur Verfügung, um die personenbezogenen Daten zu exportieren oder die Rückgabe der Daten zu beantragen.** Nach Ablauf dieser Frist löscht fordify alle personenbezogenen Daten des Verantwortlichen, sofern keine gesetzliche Aufbewahrungspflicht besteht. Eine Kopie der Daten wird auf Anfrage in maschinenlesbarem Format (z.B. JSON, CSV) bereitgestellt."
- **Begründung:** Erfüllung der Wahlrechtsanforderung des Art. 28 Abs. 3 lit. g DSGVO.

### E.III. Datenschutzerklärung

#### E.DSE.3 — Abschnitt 3 (DSB-Negativaussage)
- **Beanstandung:** Fehlende ausdrückliche Aussage zur (Nicht-)Bestellung eines Datenschutzbeauftragten.
- **Redline-Vorschlag (Ergänzung):** „**Datenschutzbeauftragter.** Der Verantwortliche ist nicht zur Bestellung eines Datenschutzbeauftragten verpflichtet (Art. 37 Abs. 1 DSGVO, § 38 Abs. 1 BDSG). Bei datenschutzrechtlichen Anfragen wenden Sie sich bitte an datenschutz@fordify.de."

#### E.DSE.9 — Abschnitt 3 (Konkrete Aufsichtsbehörde)
- **Beanstandung:** Aufsichtsbehörde nicht namentlich benannt.
- **Redline-Vorschlag (Ergänzung):** „**Die für den Verantwortlichen zuständige Aufsichtsbehörde ist:** Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit, Ludwig-Erhard-Str. 22, 20459 Hamburg, https://datenschutz-hamburg.de."

#### E.DSE.11 — Abschnitt 4 (Server-Log-Speicherdauer)
- **Beanstandung:** Speicherdauer der Server-Log-Dateien nicht angegeben.
- **Redline-Vorschlag (Ergänzung):** „**Die Server-Log-Dateien werden für maximal [7/14] Tage gespeichert und anschließend automatisch gelöscht.** Eine längere Speicherung erfolgt ausnahmsweise zur Aufklärung von Sicherheitsvorfällen für die Dauer der Aufklärung."

#### E.DSE.13 — Abschnitt 4 (TDDDG-Klarstellung sessionStorage/localStorage)
- **Redline-Vorschlag (Ergänzung):** „Die Speicherung im sessionStorage und localStorage des Browsers ist nach § 25 Abs. 2 Nr. 2 TDDDG einwilligungsfrei zulässig, da sie für die Bereitstellung der vom Nutzer ausdrücklich gewünschten Anwendungsfunktionalität unbedingt erforderlich ist."

#### E.DSE.18 — Abschnitt 4 (Paddle / UK-Adäquanzbeschluss)
- **Originaltext:** „[…] Anbieter ist Paddle.com Market Limited […], Vereinigtes Königreich. […]"
- **Beanstandung:** Drittlandsbezug Vereinigtes Königreich nicht thematisiert.
- **Redline-Vorschlag (Ergänzung am Ende):** „**Die Übermittlung in das Vereinigte Königreich erfolgt auf Grundlage des Angemessenheitsbeschlusses der EU-Kommission (Durchführungsbeschluss (EU) 2021/1772 vom 28.06.2021), wonach das Vereinigte Königreich ein angemessenes Datenschutzniveau gewährleistet. Eine Zweitverarbeitung in den USA durch konzernverbundene Unternehmen von Paddle ist möglich; insoweit greift das EU-U.S. Data Privacy Framework (Durchführungsbeschluss (EU) 2023/1795).**"

### E.IV. Impressum

Das Impressum entspricht den Anforderungen des § 5 DDG und enthält keine zu beanstandenden Klauseln. Eine Anpassung ist nicht erforderlich.

---

## F. Offene Punkte / Erforderliche Sachverhaltsaufklärung

1. **DPF-Zertifizierung der US-Subprozessoren.** Zu verifizieren ist, ob Supabase Inc. und Resend Inc. zum heutigen Tag aktiv unter dem EU-U.S. Data Privacy Framework zertifiziert sind (Liste unter https://www.dataprivacyframework.gov). Sofern ja, ist die primäre Transfergrundlage zu korrigieren (vgl. E.AVV.8).

2. **SCC-Modul-Konkretisierung.** AVV § 5 nennt „Modul 2 – Controller to Processor". Im dreigliedrigen Verhältnis Kunde → Anbieter → US-Subprozessor ist Modul 3 (Processor to Processor) die typische Konstellation; der konkret abgeschlossene SCC-Vertragstyp ist zu verifizieren.

3. **UK-Angemessenheitsbeschluss.** Der UK-Adäquanzbeschluss (Beschluss (EU) 2021/1772) wurde durch die EU-Kommission in einem Verlängerungsverfahren überprüft; der aktuelle Status ist tagesaktuell zu verifizieren. Bei Verlängerung ist die Datenschutzerklärung um einen entsprechenden Hinweis zu ergänzen.

4. **Hostinger-Sitz und Sub-Sub-Verarbeitung.** Konkretisierung des Sitzes von Hostinger International Ltd. (Zypern); Verifikation potenzieller Sub-Sub-Verarbeiter (CDN, DDoS-Schutz, Backup-Provider).

5. **Supabase-Sitz / Konzernstruktur.** Klärung der Sitzangabe „Singapur"; ggf. Korrektur auf Supabase Inc. (USA) bzw. Konzernstruktur.

6. **UI-Implementierung des konkludenten AVV-Abschlusses.** Verifikation, ob im Buchungsprozess für kostenpflichtige Tarife eine **explizite Akzeptanz** der AGB (und damit konkludent des AVV nach Art. 28 Abs. 9 DSGVO) erfolgt; transparenzfördernd wäre eine separate Akzeptanz-Checkbox für AGB **und** AVV.

7. **Anzahl der Mitarbeiter.** [ANNAHME: Einzelunternehmer ohne Beschäftigte]; Verifikation, ob die Schwelle des § 38 Abs. 1 BDSG zur DSB-Bestellpflicht überschritten ist (mindestens 20 ständig mit automatisierter Verarbeitung Beschäftigte).

8. **Einwilligungsmechanismus / Cookie-Banner.** Da gemäß Datenschutzerklärung Abschnitt 4 (GoatCounter) **keine** Cookies gesetzt werden und die einzigen Browser-Storage-Verwendungen (sessionStorage, localStorage) nach § 25 Abs. 2 Nr. 2 TDDDG einwilligungsfrei sind, ist ein Cookie-Banner technisch nicht erforderlich. Verifikation der Live-Implementierung, ob dies konsistent umgesetzt ist.

9. **Verifikation der Berechnungslogiken.** Vor dem Hintergrund der Anwaltsklientel und der potenziellen Schadensersatzhaftung aus fehlerhaften Berechnungsergebnissen ist die regelmäßige Verifikation der Berechnungslogik (RVG-Tabelle, GKG-Tabelle, Basiszinssatz, ZwVollstrFormV) sicherzustellen. Versionierung der Rechtsdaten (Stand der hinterlegten Tabellenwerke) im Changelog wäre transparenzfördernd.

10. **Beauftragte Versicherung.** Im Hinblick auf die Berufsgeheimnisrelevanz und den Haftungsdeckel von 500 EUR Mindesthaftung wäre der Abschluss einer **Vermögensschaden-Haftpflichtversicherung** sinnvoll und sollte den Kunden gegenüber kommunikativ erwähnt werden (außerhalb des juristischen Pflichtkanons).

11. **Konsistenz AGB Ziff. 9.3 vs. Datenschutzerklärung Abschnitt 4 Supabase.** AGB Ziff. 9.3 nennt Supabase als „technische Infrastruktur"; Datenschutzerklärung Abschnitt 4 stellt die EU-Speicherung klar; AVV § 5 erwähnt Supabase als Subprozessor mit US-Sitz. Redaktionelle Harmonisierung empfehlenswert.

12. **Fehlende Datenschutz-Folgenabschätzung (DSFA).** Bei systematischer Verarbeitung von Schuldnerdaten durch Anwaltskanzleien kann die Schwelle des Art. 35 Abs. 1 DSGVO (i.V.m. der DSK-Liste der DSFA-pflichtigen Verarbeitungstätigkeiten vom 17.10.2018) überschritten sein. Verifikation, ob der Verantwortliche (Kunde) eine DSFA durchführt; Unterstützungspflicht des Anbieters nach AVV § 7.

---

## G. Verzeichnis zitierter Rechtsquellen, Rechtsprechung und Stellungnahmen

### G.I. Unionsrecht
- Verordnung (EU) 2016/679 (DSGVO) – Art. 4, 5, 6, 9, 13, 14, 15–22, 25, 26, 27, 28, 32, 33, 34, 35, 36, 37, 44 ff., 77, 82.
- Verordnung (EU) 2022/2065 (DSA).
- Verordnung (EU) 2024/1689 (AI Act) – Art. 3 Nr. 1, Art. 50.
- Verordnung (EU) Nr. 1215/2012 (Brüssel Ia-VO) – Art. 25.
- Verordnung (EG) Nr. 593/2008 (Rom I-VO) – Art. 3.
- Verordnung (EU) 2024/3228 zur Aufhebung der ODR-VO mit Wirkung zum 20.07.2025.
- Durchführungsbeschluss (EU) 2021/914 zu Standardvertragsklauseln, Module 2 und 3.
- Durchführungsbeschluss (EU) 2023/1795 (DPF-Angemessenheitsbeschluss vom 10.07.2023).
- Beschluss (EU) 2021/1772 vom 28.06.2021 (UK-Angemessenheitsbeschluss).

### G.II. Deutsches Recht
- BGB §§ 13, 14, 126b, 145, 241, 254, 271, 273, 276, 305 ff., 307, 308, 309, 310, 312i, 314, 320, 535 ff., 536, 536a, 366, 367.
- HGB § 257.
- AO § 147.
- BDSG §§ 26, 38.
- TDDDG § 25.
- DDG § 5.
- UStG §§ 19, 27a.
- StGB § 203.
- BRAO §§ 43a, 43e.
- BORA § 2.
- ZPO §§ 38, 753.
- VSBG §§ 36, 37.
- RDG §§ 2, 10.
- ProdHaftG.
- GeschGehG § 2.
- UrhG §§ 69e, 69g.
- UWG §§ 3, 5, 5a.
- InsO §§ 103, 119.
- ZwVollstrFormV.

### G.III. Rechtsprechung
- EuGH, Urt. v. 16.07.2020 – C-311/18, ECLI:EU:C:2020:559 (Schrems II).
- EuGH, Urt. v. 01.10.2019 – C-673/17, ECLI:EU:C:2019:801 (Planet49).
- EuGH, Urt. v. 24.02.2022 – C-175/20, ECLI:EU:C:2022:124 (Speicherdauer).
- EuGH, Urt. v. 16.10.2008 – C-298/07, ECLI:EU:C:2008:572 (BVV; elektronische Kontaktaufnahme).
- EuGH, Urt. v. 27.01.2021 – C-385/20 (DenizBank, zu Zustimmungsfiktionen).
- BGH, Urt. v. 15.11.2006 – XII ZR 120/04, NJW 2007, 2394 (ASP-Vertrag).
- BGH, Urt. v. 04.03.2010 – III ZR 79/09, NJW 2010, 1449 (SaaS / Hosting).
- BGH, Urt. v. 19.09.2007 – VIII ZR 141/06, NJW 2007, 3774 (Indizwirkung §§ 308, 309 BGB im B2B).
- BGH, Urt. v. 24.09.2002 – KZR 10/01, NJW 2003, 347 (Salvatorische Klausel).
- BGH, Urt. v. 27.01.2010 – XII ZR 22/07, NJW 2010, 1518 (§ 536a BGB-Abdingbarkeit).
- BGH, Urt. v. 27.04.2021 – XI ZR 26/20, NJW 2021, 2273 (Zustimmungsfiktion).
- BGH, Urt. v. 15.11.2012 – IX ZR 169/11, NJW 2013, 1159 (insolvenzbedingte Lösungsklauseln).
- LG München I, Urt. v. 20.01.2022 – 3 O 17493/20 (Google Fonts / selbst gehostete Schriftarten).
- St. Rspr. zu Kardinalpflicht-Definitionen in B2B-AGB.
- St. Rspr. zu Preisanpassungsklauseln (Anpassungsmaßstab).
- St. Rspr. zu Datensicherungsobliegenheiten.

### G.IV. Soft Law / Aufsichtsbehörden
- EDSA-Leitlinien 07/2020 (Version 2.1, 07.07.2021) –