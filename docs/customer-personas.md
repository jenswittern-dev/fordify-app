# Customer Personas – Fordify

> Stand: April 2026  
> Basis: Nutzerfeedback (Runden 1–6), Konkurrenzanalyse, Anwaltsgespräche (transcript.md), Machbarkeitsstudie  
> Zweck: Produktentscheidungen, Priorisierung, Marketing-Messaging

---

## Persona 1 – Katharina Brandt

**Einzelanwältin, Allgemeinpraxis mit Schwerpunkt Miet- und Inkassorecht**

| Feld | Detail |
|---|---|
| Alter | 43 Jahre |
| Standort | Dortmund |
| Kanzleigröße | Einzelkanzlei (1 Anwältin, 1 Rechtsanwaltsfachangestellte) |
| Spezialisierung | Mietrecht, allgemeines Zivilrecht, laufende Mahnverfahren |
| Berufserfahrung | 15 Jahre |
| Technikaffinität | ★★★☆☆ (3/5) |

### Hintergrund

Katharina hat ihre Kanzlei 2011 nach einigen Jahren in einer Sozietät gegründet. Sie betreut ca. 25 laufende Mandate gleichzeitig, davon 8–10 mit regelmäßig anfallenden Forderungsaufstellungen. Ihr Schwerpunkt liegt bei Mietzinsrückständen: mehrere Monate Mietrückstand, dazu Zinsen, Gerichtskosten und Anwaltsgebühren. Sie erledigt die Forderungsaufstellungen selbst — die FA ist mit Korrespondenz und Fristen ausgelastet.

Bisher nutzte sie eine Excel-Vorlage, die sie vor Jahren selbst gebaut hat. Die Vorlage funktioniert, aber Zinszeiträume bei wechselndem Basiszinssatz sind fehleranfällig. Einen separaten Basiszinssatz-Kalender pflegt sie manuell.

### Typischer Arbeitsalltag mit Forderungsaufstellungen

Katharina erstellt ca. 2–3 Forderungsaufstellungen pro Woche. Häufig handelt es sich um Mietrückstände über 3–12 Monate mit monatlich identischem Betrag und unterschiedlichen Zahlungseingängen des Mieters. Die Aufstellung landet als Anlage im Schriftsatz ans Gericht oder in der Mahnung.

**Typischer Ablauf:** Aktennotiz lesen → Excel öffnen → Positionen eintippen → Zinsen manuell prüfen → PDF exportieren → in beA-Schriftsatz einfügen.

### Pain Points

- Excel-Zinsen sind fehleranfällig: Sie muss die Basiszinssatzwechsel (01.01./01.07.) selbst kontrollieren
- Mehrere Zahlungseingänge des Mieters muss sie von Hand verrechnen — § 367 BGB-Reihenfolge wird von Excel nicht erzwungen
- Kein Briefkopf in der Vorlage: Sie ergänzt das Kanzleilogo immer manuell in Word
- Bei 12 Mietmonaten muss sie 12 Zeilen einzeln eintippen — fehleranfällig und zeitraubend
- Das Gericht fragt gelegentlich nach, welcher Zinssatz für welchen Zeitraum gilt — ohne automatische Perioden-Aufschlüsselung schwierig zu erklären

### Was sie bei Fordify sucht

- Automatische Basiszinssatz-Perioden-Aufschlüsselung (einmal Zeitraum eingeben, Rest automatisch)
- Mehrere Monate Miete schnell erfassen (wiederkehrende Buchungen)
- § 367 BGB-Verrechnung ohne manuelle Rechenarbeit
- Professionelles PDF mit Kanzleilogo, das direkt ans Gericht geschickt werden kann
- Kein Windows-Zwang — sie arbeitet auf einem MacBook

### Feature-Prioritäten

1. **Wiederkehrende Buchungen** (Mietrückstände — n Monate × gleicher Betrag)
2. **Automatische Zinsperioden-Aufschlüsselung** nach Basiszinssatzwechsel
3. **Logo + Briefkopf im PDF**
4. § 367 BGB-Verrechnung bei mehreren Teilzahlungen
5. Fallverwaltung (mehrere Mandate gleichzeitig offen halten)

### Zahlungsbereitschaft

**Plan: Pro (Solo)** — 29 €/Monat wäre für sie sofort akzeptabel, wenn die wiederkehrenden Buchungen da sind. Aktuell spart sie ca. 45 Minuten pro Forderungsaufstellung — das rechtfertigt das Abo klar.

### Charakteristisches Zitat

> „Ich mache das alles in Excel und ärgere mich jedes Mal, wenn der Basiszinssatz sich geändert hat. Ich schaue es nach, korrigiere es, und frage mich, ob ich's diesmal richtig habe. Das ist nicht das, wofür ich Juristin geworden bin."

---

## Persona 2 – Thomas Weidemann

**Anwalt in Sozietät, Spezialist für gewerbliches Miet- und Insolvenzrecht**

| Feld | Detail |
|---|---|
| Alter | 51 Jahre |
| Standort | Hamburg |
| Kanzleigröße | Sozietät mit 6 Anwälten (3 Standorte) |
| Spezialisierung | Gewerbliches Mietrecht, Insolvenzanfechtung, ZV-Maßnahmen |
| Berufserfahrung | 24 Jahre |
| Technikaffinität | ★★☆☆☆ (2/5) |

### Hintergrund

Thomas arbeitet in einer mittelgroßen Hamburger Sozietät, die auf gewerbliche Vermieter und insolvenzrechtliche Mandate spezialisiert ist. Er persönlich betreut die aufwendigeren Forderungsaufstellungen — oft Forderungen über 100.000 € mit mehreren Hauptforderungen, langen Zinslaufzeiten und Insolvenzverfahren der Schuldner.

Bisher nutzt die Sozietät eine Desktop-Lizenz von „Forderungsaufstellung 367 Professional Plus", die auf dem Server liegt und nur von Windows-PCs erreichbar ist. Thomas' eigener Laptop läuft jedoch mit macOS. Er muss Remote-Desktop nutzen, um ans Tool zu kommen — das kostet Zeit und funktioniert im Homeoffice instabil.

### Typischer Arbeitsalltag mit Forderungsaufstellungen

Thomas erstellt größere, komplexe Aufstellungen mit mehreren Hauptforderungen (z. B. mehrere separate Mietobjekte desselben Mieters) und InsO-Zinslauf-Kappung. Eine Aufstellung nimmt 60–90 Minuten, wird mehrfach angepasst und muss vor Gericht standhalten.

Besonders aufwendig: Nach einem Insolvenzantrag muss der Zinslauf gekappt werden. Bei der bisherigen Software ist das eine manuelle Anpassung, die er leicht vergisst.

### Pain Points

- Windows-only-Software über Remote-Desktop im Homeoffice unzuverlässig
- InsO-Datum muss manuell in jeden Zinszeitraum eingetragen werden — Fehlerquelle
- Bei mehreren Hauptforderungen verliert er schnell den Überblick, welche Zinsperiode zu welcher HF gehört
- Update-Management: Die Desktop-Software hat das RVG-2025-Update erst zwei Monate nach Inkrafttreten erhalten — er hat in der Zwischenzeit alte Gebührentabellen genutzt, ohne es zu merken
- Die Kanzlei hat keine klare Backup-Strategie für die lokalen Programm-Dateien

### Was er bei Fordify sucht

- Browserbasiert: funktioniert auf macOS ohne Remote-Desktop
- InsO-Datum-Funktion mit automatischer Zinslauf-Kappung
- Mehrere Hauptforderungen klar gegliedert (gruppeId-Logik)
- Immer aktuelles RVG ohne manuelle Updates
- Export-Funktion für die Aktenablage

### Feature-Prioritäten

1. **InsO-Datum / automatische Zinslauf-Kappung**
2. **Mehrere Hauptforderungen mit klarer Zuordnung**
3. Browser-basiert (kein Remote-Desktop nötig)
4. **Immer aktuelle Tabellen** (RVG, Basiszinssätze)
5. JSON-Export für Aktenablage

### Zahlungsbereitschaft

**Plan: Business (Kanzlei)** — die Kanzlei würde 79 €/Monat zahlen, wenn alle 6 Anwälte Zugang haben und die Fälle synchronisiert sind (Cloud-Sync). Ohne Cloud-Sync würde er persönlich Pro/Solo nutzen (29 €/Monat).

### Charakteristisches Zitat

> „Das Tool, das wir haben, ist gut. Aber es läuft nur auf Windows, und ich bin mit meinem MacBook zu Hause. Ich habe dann Remote-Desktop — und dann friert das ein. Das kostet mich mehr Zeit als das Tool spart."

---

## Persona 3 – Dilnoza Yusupova

**Sachbearbeiterin in einem mittelgroßen Inkassounternehmen**

| Feld | Detail |
|---|---|
| Alter | 34 Jahre |
| Standort | Berlin |
| Unternehmensgröße | 40 Mitarbeiter, ca. 3.500 aktive Forderungsfälle |
| Spezialisierung | Forderungseinzug für Telekommunikationsunternehmen und E-Commerce |
| Berufserfahrung | 9 Jahre (Inkassobranche), kein Jurastudium |
| Technikaffinität | ★★★★☆ (4/5) |

### Hintergrund

Dilnoza arbeitet als Senior-Sachbearbeiterin in einem Berliner Inkassounternehmen, das sie nach einer kaufmännischen Ausbildung und mehreren Jahren im Forderungsmanagement eingestellt hat. Sie ist für die Bearbeitung von Fällen zuständig, die aus dem Volumen-Inkasso herausfallen und individuelle Forderungsaufstellungen benötigen — z. B. nach Widerspruch des Schuldners oder bei gerichtlicher Geltendmachung.

Das Unternehmen hat ein hausinternes ERP-System, aber für individuelle § 367 BGB-Aufstellungen (die oft von Rechtsanwälten angefordert werden) fehlt ein passendes Tool. Sie nutzt derzeit „XForderung" — ein Windows-Tool, das zu teuer und zu umständlich für gelegentlichen Gebrauch ist.

### Typischer Arbeitsalltag mit Forderungsaufstellungen

Dilnoza erstellt ca. 15–20 Forderungsaufstellungen pro Monat für Fälle, bei denen Schuldner Widerspruch einlegen oder bei denen ein Rechtsanwalt die Unterlagen für eine Klagebegründung benötigt. Die Forderungen sind meist überschaubar (500 – 8.000 €), haben aber mehrere Teilzahlungen des Schuldners, die korrekt zu verrechnen sind.

Sie schickt die fertige Aufstellung als PDF per E-Mail an den beauftragten Rechtsanwalt.

### Pain Points

- XForderung ist für ihr Volumen überdimensioniert und kostet Jahresabo
- Keine einfache Möglichkeit, Aufstellungen mit Kolleginnen zu teilen (jede hat ihre lokale Installation)
- Ihre Kolleginnen sind nicht alle so technikaffin — das Tool muss einfach zu bedienen sein
- Für Telekommunikationsforderungen gibt es spezifische Kostentypen (Mahnkosten, Sperrentgelte), die als „Sonstiges" eingetippt werden müssen
- Sie hat kein Jurastudium — ist aber für die Korrektheit der Berechnung verantwortlich. Sie vertraut auf die Software, braucht aber Sicherheit, dass § 367 BGB korrekt umgesetzt ist.

### Was sie bei Fordify sucht

- Einfache, schnelle Bedienung ohne lange Einarbeitung
- § 367 BGB-Verrechnung ist automatisch richtig (Vertrauen in die Software)
- Kein Abo für gelegentliche Nutzung (oder günstiges Freemium)
- Import/Export, um Aufstellungen an Anwälte zu schicken
- Cloudbasiertes Speichern, damit Kolleginnen auf dieselben Fälle zugreifen können

### Feature-Prioritäten

1. **Einfache UX** (auch für nicht-juristische Mitarbeiter verständlich)
2. **§ 367 BGB-Korrektheit** transparent und vertrauenswürdig kommuniziert
3. **Cloud-Sync** für Teamzugriff (mehrere Sachbearbeiterinnen, ein Fall)
4. JSON- oder PDF-Export für Anwälte
5. **Freemium oder günstiger Einstieg** (das Unternehmen kauft nicht 40 Lizenzen)

### Zahlungsbereitschaft

**Plan: Business** — wenn Cloud-Sync vorhanden ist und mehrere Mitarbeiter gleichzeitig arbeiten können. Derzeit würde sie Free oder Pro/Solo nutzen, solange Cloud-Sync fehlt.

### Charakteristisches Zitat

> „Ich bin keine Juristin, aber ich muss trotzdem sicherstellen, dass die Verrechnung stimmt. Wenn das Gericht die Aufstellung zurückwirft, liegt es an mir. Ich brauche ein Tool, dem ich vertrauen kann — und das meine Kolleginnen auch ohne Schulung bedienen können."

---

## Persona 4 – Oliver Kempf

**Freiberuflicher Gerichtsvollzieher, Bezirksstelle Südbayern**

| Feld | Detail |
|---|---|
| Alter | 57 Jahre |
| Standort | Augsburg |
| Struktur | Beamter (Freier Beruf nach Art. 155 BayBG), Einzelbüro mit 1 Bürokraft |
| Spezialisierung | Pfändung, Abnahme Vermögensauskunft, GV-Tabelle § 13 GvKostG |
| Berufserfahrung | 31 Jahre |
| Technikaffinität | ★★☆☆☆ (2/5) |

### Hintergrund

Oliver ist staatlich bestellter Gerichtsvollzieher mit eigenem Büro. Er erhält von Anwaltskanzleien und Gläubigern Vollstreckungsaufträge und berechnet selbst die anfallenden GV-Kosten, Auslagen und Zinsen für die Schlussabrechnung. In Bayern läuft das über ein staatliches System, aber für die individuelle Forderungsübersicht — wenn er dem Gläubiger den aktuellen Stand mitteilt — erstellt er eigene Aufstellungen.

Bisher nutzt er XForderung, das er seit 15 Jahren einsetzt. Sein Büro-PC läuft Windows 10. Er wäre offen für etwas Moderneres, wenn es keinen Lernaufwand bedeutet.

### Typischer Arbeitsalltag mit Forderungsaufstellungen

Oliver verarbeitet täglich 5–15 Vorgänge. Forderungsaufstellungen entstehen meist am Ende eines Verfahrens oder wenn der Schuldner eine Ratenzahlungsvereinbarung anstrebt. Er muss GV-Kosten nach § 13 GvKostG, Auslagen, Zinsen und die verbleibende Hauptforderung zusammenführen.

Besonders relevant: Säumniszuschläge (§ 24 SGB IV) bei Sozialversicherungs-Mandaten. Das ist eine Spezialität, die kaum ein Tool beherrscht.

### Pain Points

- XForderung ist teuer (Jahresabo) für ein Ein-Mann-Büro
- Das Tool läuft nur auf Windows — sein Tablet (iPad) kann er nicht nutzen
- Der aktuelle XForderung-Support kostet extra, wenn mehr als 90 Minuten/Monat nötig sind
- Basiszinssätze seit 1950 braucht er für sehr alte Forderungen — das haben nur wenige Tools
- Die neue ZwVollstrFormV 2024 (Formulare für ZV-Aufträge) ist noch nicht in XForderung integriert

### Was er bei Fordify sucht

- Kostenloser oder günstiger Einstieg (er bezahlt aktuell zu viel)
- Browserbasiert — könnte er dann auch auf dem Tablet nutzen
- GV-Kosten als eigene Position (ist schon in Fordify als „ZV-Kosten" vorhanden)
- Lange Zinslaufzeiten problemlos (historische Basiszinssätze)
- Einfache, übersichtliche Oberfläche (er lernt keine neuen Systeme gerne)

### Feature-Prioritäten

1. **GV-/ZV-Kosten als eigene Position** (vorhanden in Fordify)
2. **Historische Basiszinssätze** (auch für Forderungen vor 2000)
3. **Kostenloser Einstieg / günstiges Abo** (preissensibel)
4. Browserbasiert / iPad-kompatibel
5. Einfache UX ohne Einarbeitungsaufwand

### Zahlungsbereitschaft

**Plan: Free → Pro/Solo** — er würde 29 €/Monat zahlen, wenn das Tool stabil ist und XForderung wirklich ersetzt. Stärker preissensibel als Anwälte. Der Wechsel von XForderung (ca. 116 €/Jahr) zu Fordify Pro (ca. 348 €/Jahr) wäre ohne starken Mehrwert schwer zu rechtfertigen.

### Charakteristisches Zitat

> „XForderung kenne ich seit 1991. Es funktioniert. Aber ich zahle jedes Jahr und bekomme nichts Neues dafür. Wenn es was gibt, das genauso gut ist und im Browser läuft, dann schaue ich mir das an."

---

## Persona 5 – Miriam Hofer

**Rechtsreferendarin (2. Staatsexamen), Referendariat in Anwaltskanzlei**

| Feld | Detail |
|---|---|
| Alter | 27 Jahre |
| Standort | München |
| Ausbildungsstand | Referendariat, Station Anwaltskanzlei (Zivilrecht) |
| Spezialisierung | Noch keine — breite Ausbildung |
| Berufserfahrung | 0 Jahre (Berufseinsteigerin) |
| Technikaffinität | ★★★★★ (5/5) |

### Hintergrund

Miriam ist im dritten Monat ihrer Anwaltsstation bei einer kleinen Münchner Kanzlei (2 Anwälte, 1 RA-Fachangestellte). Der Ausbilder hat ihr erklärt, dass § 367 BGB die Verrechnungsreihenfolge bei Teilzahlungen bestimmt, und sie gebeten, für einen Mietrückstandsfall eine Forderungsaufstellung zu erstellen. Sie hat noch nie eine erstellt.

Miriam ist digital native: Sie nutzt Notion, Figma, Linear. Sie erwartet, dass Software intuitiv funktioniert, und greift bei Unklarheiten sofort auf die Dokumentation oder YouTube zurück. Die Desktop-Tools, die in der Kanzlei vorhanden sind, empfindet sie als „angestaubt".

### Typischer Einstieg mit Forderungsaufstellungen

Miriam googelt „Forderungsaufstellung § 367 BGB" und findet Fordify. Sie öffnet das Tool, klickt sich durch das Onboarding-Modal und legt ihren ersten Fall an. Sie macht Fehler beim ersten Versuch (Zinsperiode falsch verknüpft), versteht aber nach kurzem Nachdenken das Gruppen-System. Nach 45 Minuten hat sie ihre erste Aufstellung erstellt — ohne Anleitung vom Ausbilder.

### Pain Points

- Sie versteht die rechtliche Logik von § 367 BGB erst beim Ausprobieren — das Tool muss erklären, was es tut
- Fehlermeldungen sind ihr wichtig: Wenn sie etwas falsch macht, möchte sie einen klaren Hinweis
- Die Kanzlei-interne Software (LAWgistic auf einem alten Windows-PC) läuft nicht auf ihrem MacBook Air M2
- Ihr fehlt der Überblick, was eine „korrekte" Forderungsaufstellung für ein Gericht enthalten muss — sie sucht Orientierung
- Sie teilt die Aufstellung mit ihrem Ausbilder — ein Export-Link oder Datei-Austausch wäre hilfreich

### Was sie bei Fordify sucht

- **Erklärende Oberfläche** (Tooltips, warum was berechnet wird)
- Onboarding das schnell zeigt, wie ein vollständiger Fall aussieht
- Export als PDF und JSON (Datei an Ausbilder schicken)
- Korrekte Berechnung ohne tiefes Vorwissen erforderlich zu sein
- Kostenlos (Referendariat, kein Gehalt)

### Feature-Prioritäten

1. **Gute UX + Onboarding** (selbsterklärend, keine Einarbeitung nötig)
2. **Tooltips / Erklärungen** bei Fachbegriffen und Berechnungslogik
3. **Export PDF + JSON** für Ausbilder
4. Kostenloser Zugang (Free-Tier)
5. Fehlerhinweise bei unvollständigen oder widersprüchlichen Eingaben

### Zahlungsbereitschaft

**Plan: Free** — Referendariat bedeutet geringe Einkünfte. Nach dem Berufseinstieg würde sie das Tool bei eigenem Mandat sofort als Pro/Solo upgraden. Sie ist die Persona, die das Tool in ihrer Kanzlei empfehlen wird.

### Charakteristisches Zitat

> „Ich hab das einfach ausprobiert. Ich wusste am Anfang nicht genau, was § 367 BGB bedeutet — also in der Praxis. Aber dann habe ich eine Zahlung eingetragen und gesehen, wie sie sich auf Zinsen, dann Kosten, dann Hauptforderung aufteilt. Das hat mir mehr erklärt als das Lehrbuch."

---

## Persona 6 – Axel Dombrowski

**Steuerberater mit Schwerpunkt Unternehmensinsolvenz, nebenberuflich Insolvenzverwalter**

| Feld | Detail |
|---|---|
| Alter | 49 Jahre |
| Standort | Düsseldorf |
| Kanzleigröße | Steuerberatungskanzlei (8 Mitarbeiter), 3 laufende Insolvenzverwalter-Mandate |
| Spezialisierung | Unternehmenssteuerrecht, Insolvenz, Sanierung |
| Berufserfahrung | 22 Jahre |
| Technikaffinität | ★★★☆☆ (3/5) |

### Hintergrund

Axel ist Steuerberater und wird gelegentlich vom Amtsgericht als Insolvenzverwalter bestellt. In dieser Rolle muss er Gläubigerforderungen prüfen, bestätigen oder bestreiten — und dafür selbst Vergleichsberechnungen anfertigen. Er braucht kein vollständiges Kanzleitool, aber für die Überprüfung von Forderungsaufstellungen, die Gläubiger einreichen, ist ein eigenes Rechentool hilfreich.

Außerdem: Bei der Insolvenztabelle werden Zinsforderungen nach § 38 InsO angemeldet, aber nur bis zum Insolvenzantragsdatum anerkannt. Axel muss diesen Zinslauf genau kontrollieren — und zwar schnell.

### Typischer Arbeitsalltag mit Forderungsaufstellungen

Axel bekommt eine Forderungsanmeldung eines Gläubigers (z. B. Lieferant mit offener Rechnung + Zinsen). Er öffnet Fordify, gibt die Hauptforderung, Zinsen und das InsO-Datum ein, und prüft ob die angemeldeten Beträge stimmen. Das dauert 5–10 Minuten pro Forderung — viel schneller als eine eigene Excel-Kalkulation.

Er nutzt Fordify nicht für Mandanten-PDFs, sondern als schnelles Prüfinstrument für seinen eigenen Workflow.

### Pain Points

- Er hat kein spezialisiertes Tool für die Überprüfung von Gläubigerforderungen — er rechnet bisher manuell nach
- Das InsO-Datum ist ein zentrales Datum, das bei der Zinsberechnung häufig falsch gesetzt ist — ein Tool, das das automatisch kapppt, spart ihm viel Arbeit
- Er braucht keine Kanzlei-Konfiguration (kein Logo, kein Briefkopf) — nur schnelle Ergebnisse
- Manchmal sind Forderungen sehr alt (Vertragsbeginn 2012 oder früher) — er braucht historische Basiszinssätze
- DATEV und seine Kanzleisoftware können das nicht — er sucht ein Ergänzungstool

### Was er bei Fordify sucht

- **InsO-Datum-Funktion** als zentrales Feature — Zinslauf endet automatisch am richtigen Tag
- Schnelle Eingabe, schnelle Prüfung — kein langer Workflow
- Historische Basiszinssätze (auch für Zeiträume mit negativem Basiszins)
- Export als Nachweis für die Insolvenztabelle
- Keine Kanzlei-Konfiguration erforderlich (er braucht kein Logo)

### Feature-Prioritäten

1. **InsO-Datum / Zinslauf-Kappung** (sein entscheidendes Feature)
2. **Historische Basiszinssätze** (weit zurück)
3. Schnelle Eingabe ohne Pflichtfelder, die ihn aufhalten
4. Export als Nachweis / Dokument
5. **Ohne Registrierung nutzbar** (er will kein weiteres Tool-Abo)

### Zahlungsbereitschaft

**Plan: Free** — er nutzt das Tool selten und situativ. Pro wäre eine Option, wenn er es regelmäßiger einsetzt. DATEV kostet ihn tausende Euro — ein Zusatztool für 29 €/Monat wäre vertretbar, wenn es ihn wirklich Zeit spart.

### Charakteristisches Zitat

> „Ich bin kein Anwalt, aber ich bekomme Forderungsanmeldungen auf meinen Tisch und muss die prüfen. Wenn jemand behauptet, da stehen noch 12.000 € Zinsen, dann will ich das in fünf Minuten nachrechnen können — ohne Excel aufzumachen."

---

## Persona 7 – Sandra Lechner

**Leiterin Forderungsmanagement bei einem mittelständischen Sanitärhersteller**

| Feld | Detail |
|---|---|
| Alter | 41 Jahre |
| Standort | Stuttgart |
| Unternehmensgröße | 280 Mitarbeiter, Forderungsvolumen ca. 4 Mio. € p. a. |
| Abteilung | Buchhaltung / Forderungsmanagement (4 Mitarbeiter) |
| Ausbildung | Bilanzbuchhalterin, keine juristische Ausbildung |
| Technikaffinität | ★★★☆☆ (3/5) |

### Hintergrund

Sandra leitet das Forderungsmanagement eines mittelständischen Unternehmens. Wenn Kunden trotz Mahnung nicht zahlen, übergibt sie säumige Fälle an eine externe Anwaltskanzlei oder ein Inkassounternehmen. Aber: Vor der Übergabe muss sie selbst eine vollständige Forderungsübersicht erstellen, damit der Anwalt weiß, was genau geltend gemacht werden soll.

Das SAP-System des Unternehmens gibt Offene-Posten-Listen aus, aber keine § 367 BGB-konforme Forderungsaufstellung mit Zinsen. Sandra erstellt das derzeit in Excel.

### Typischer Arbeitsalltag mit Forderungsaufstellungen

Sandra erstellt ca. 3–5 Forderungsaufstellungen pro Monat für Fälle, die an Anwälte übergeben werden. Meist mehrere Rechnungen desselben Kunden, mit unterschiedlichen Fälligkeiten und gelegentlichen Teilzahlungen. Der Anwalt braucht eine saubere Aufstellung, die er direkt verwenden kann.

Das Problem: SAP gibt ihr keine Zinsen aus. Sie muss Zinsen für jede Rechnung manuell berechnen. Und wenn der Schuldner 2.000 € gezahlt hat, weiß sie nicht, wie das § 367 BGB-konform zu verrechnen ist.

### Pain Points

- SAP gibt keine § 367 BGB-konforme Aufstellung aus — sie muss das extern ergänzen
- Die anwaltliche Kanzlei beklagt, dass die gelieferten Unterlagen oft unvollständig sind (Zinsen fehlen, Verrechnung nicht dokumentiert)
- Kein juristisches Fachwissen: Sie weiß, dass § 367 BGB eine Reihenfolge vorschreibt, aber kennt die Details nicht
- Inkassopauschale (40 € nach § 288 Abs. 5 BGB) ist ihr bekannt, aber sie ist sich nie sicher, ob sie anwendbar ist
- Unterschiedliche USt-Sätze bei manchen Positionen (7 % vs. 19 %) beim RVG sind für sie verwirrend — das trifft auf ihre Aufstellung nicht zu, macht das Tool aber unübersichtlicher

### Was sie bei Fordify sucht

- Einfache Eingabe mehrerer Rechnungen (verschiedene Hauptforderungen, verschiedene Fälligkeiten)
- Automatische Zinsberechnung — ohne dass sie den Basiszinssatz kennen muss
- § 367 BGB-Verrechnung von Teilzahlungen automatisch richtig
- PDF-Export, der direkt an den Anwalt geht — ohne nachbearbeiten zu müssen
- Hinweis, ob die 40-€-Pauschale gilt (B2B-Kontext ist bei ihr gegeben)

### Feature-Prioritäten

1. **Mehrere Hauptforderungen** (verschiedene Rechnungen desselben Schuldners)
2. **Automatische Zinsberechnung** (kein Fachwissen erforderlich)
3. § 367 BGB-Verrechnung bei Teilzahlungen
4. **Professionelles PDF**, das der Anwalt direkt nutzen kann
5. **Inkassopauschale § 288 Abs. 5 BGB** (automatischer Hinweis bei B2B)

### Zahlungsbereitschaft

**Plan: Free → Pro/Solo** — sie würde das Tool zunächst kostenlos testen. Wenn die Qualität der Aufstellungen die Rückfragen der Kanzlei deutlich reduziert, würde ihre Geschäftsführung 29 €/Monat ohne große Diskussion genehmigen.

### Charakteristisches Zitat

> „Unser Anwalt hat mich angerufen und gefragt, wie ich die Zinsen berechnet habe. Ich hab gesagt: In Excel, mit der Formel, die ich mal irgendwo gefunden habe. Er hat dann erklärt, dass ich die § 367 BGB-Reihenfolge nicht eingehalten habe. Das war mir peinlich. Und ich möchte nicht, dass das nochmal passiert."

---

## Zusammenfassung: Personas auf einen Blick

| Persona | Beruf | Technik | Plan | Wichtigstes Feature |
|---|---|---|---|---|
| Katharina Brandt | Einzelanwältin | ★★★☆☆ | Pro | Wiederkehrende Buchungen |
| Thomas Weidemann | Sozietät-Anwalt | ★★☆☆☆ | Business | InsO-Datum, mehrere HF |
| Dilnoza Yusupova | Inkasso-Sachbearbeiterin | ★★★★☆ | Business | Einfache UX, Cloud-Sync |
| Oliver Kempf | Gerichtsvollzieher | ★★☆☆☆ | Free → Pro | ZV-Kosten, historische Zinsen |
| Miriam Hofer | Referendarin | ★★★★★ | Free | Onboarding, Erklärungen |
| Axel Dombrowski | Steuerberater / InsO-Verwalter | ★★★☆☆ | Free | InsO-Datum, schnelle Prüfung |
| Sandra Lechner | Forderungsmanagement (Unternehmen) | ★★★☆☆ | Free → Pro | Mehrere HF, Auto-Zinsen |

---

## Implikationen für Produktentscheidungen

### Höchste Feature-Priorität (5+ Personas betroffen)
- **Automatische Zinsberechnung mit Basiszinssatz-Perioden** — alle Personas erwarten das als selbstverständlich
- **§ 367 BGB-Verrechnung sichtbar und korrekt** — ist der Kernwert des Produkts, muss vertrauenswürdig kommuniziert werden
- **Professioneller PDF-Export** — alle Personas geben die Aufstellung weiter

### Hohe Feature-Priorität (3–4 Personas betroffen)
- **Mehrere Hauptforderungen** (Katharina, Thomas, Sandra)
- **InsO-Datum / Zinslauf-Kappung** (Thomas, Axel — aber entscheidend für deren Nutzung)
- **Wiederkehrende Buchungen** (Katharina, Oliver, Sandra)
- **Einfache, selbsterklärende UX** (Miriam, Dilnoza, Sandra)

### Mittlere Priorität (2 Personas betroffen)
- **Cloud-Sync / Teamzugriff** (Dilnoza, Thomas)
- **Historische Basiszinssätze** (Oliver, Axel)
- **Tooltips und Erklärungen** (Miriam, Sandra)
- **Inkassopauschale § 288 Abs. 5 BGB** (Sandra, Dilnoza)

### Monetarisierungsimplikationen
- **Free-Tier** muss stark genug sein, um Miriam, Axel und Oliver zu überzeugen (sie sind wichtige Multiplikatoren)
- **Cloud-Sync** ist das entscheidende Upgrade-Argument für Dilnoza (Inkasso) und Thomas (Sozietät)
- **Wiederkehrende Buchungen** ist das entscheidende Upgrade-Argument für Katharina (Einzelanwältin)
- Das Business-Tier hat nur Sinn, wenn Cloud-Sync vorhanden ist — ohne ist es für Kanzleien uninteressant

---

*Erstellt: April 2026 | Fordify Customer Research*
