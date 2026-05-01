# Auftragsverarbeitungsvertrag (AVV)

Gemäß Art. 28 DSGVO

Stand: April 2026 | Version 1.0

## § 1 Gegenstand und Dauer

Dieser Vertrag regelt die Verarbeitung personenbezogener Daten durch fordify (Auftragsverarbeiter) im Auftrag des Kunden (Verantwortlicher) gemäß Art. 28 DSGVO. Der Vertrag gilt für die Dauer der Nutzung des kostenpflichtigen fordify-Abonnements.

## § 2 Art und Zweck der Verarbeitung

Gegenstand der Verarbeitung ist die Speicherung und Verwaltung von Forderungsdaten (Schuldner-Adressen, Mandantendaten, Berechnungsergebnisse) zum Zweck der Nutzung der fordify-Webanwendung durch den Verantwortlichen.

## § 3 Art der Daten und Kategorien betroffener Personen

Verarbeitet werden Namen, Anschriften und Kontaktdaten von Schuldnern und Mandanten, die der Verantwortliche in fordify eingibt. Betroffene Personen im Sinne der DSGVO sind natürliche Personen, gegen die Forderungen bestehen oder die als Ansprechpartner von Mandanten oder Schuldnern in fordify hinterlegt sind. Darüber hinaus werden Stammdaten juristischer Personen (z. B. Firmenname, Geschäftsadresse) gespeichert, soweit diese im konkreten Fall mit personenbezogenen Daten natürlicher Personen verknüpft sind. Ferner wird zu jedem Fall ein Bearbeitungsstatus (Textkonstante: offen, in Vollstreckung, erledigt, abgeschrieben) sowie eine optionale Freitext-Notiz des Nutzers gespeichert; letztere kann personenbezogene Angaben Dritter enthalten.

## § 4 Pflichten des Auftragsverarbeiters

fordify verarbeitet personenbezogene Daten ausschließlich auf dokumentierte Weisung des Verantwortlichen – einschließlich in Bezug auf die Übermittlung personenbezogener Daten in ein Drittland – es sei denn, fordify ist aufgrund des Unionsrechts oder des Rechts der Mitgliedstaaten zur Verarbeitung verpflichtet; in einem solchen Fall teilt fordify dem Verantwortlichen diese rechtlichen Anforderungen vor der Verarbeitung mit, sofern das betreffende Recht eine solche Mitteilung nicht aus wichtigen Gründen des öffentlichen Interesses verbietet.

Hält fordify eine Weisung des Verantwortlichen für einen Verstoß gegen die DSGVO oder sonstige Datenschutzvorschriften, informiert fordify den Verantwortlichen unverzüglich. fordify ist berechtigt, die Ausführung der betreffenden Weisung auszusetzen, bis der Verantwortliche diese bestätigt oder abändert.

fordify gewährleistet, dass die mit der Verarbeitung befassten Personen zur Vertraulichkeit verpflichtet sind oder einer angemessenen gesetzlichen Verschwiegenheitspflicht unterliegen.

Weisungen des Verantwortlichen bedürfen der Textform (E-Mail genügt). Konkludente Weisungen ergeben sich aus der bestimmungsgemäßen Nutzung der Anwendung gemäß den vereinbarten Nutzungsbedingungen.

## § 5 Unterauftragsverarbeiter

fordify setzt folgende Unterauftragsverarbeiter ein:

- Supabase Inc. (Sitz: USA; Datenspeicherung: EU Frankfurt, Deutschland) – Datenbankhosting und Authentifizierung (Standard Contractual Clauses)

- Resend Inc. (USA) – Transaktionale E-Mails (Standard Contractual Clauses)

- Hostinger International Ltd. (EU) – Betrieb der E-Mail-Automatisierungsinfrastruktur (N8N)

Hinweis: Paddle.com Market Ltd. ist als Merchant of Record eigenverantwortlicher Datenverantwortlicher für die Zahlungsabwicklung und kein Unterauftragsverarbeiter von fordify.

Änderungen bei Unterauftragsverarbeitern werden dem Verantwortlichen mindestens 30 Tage vorab per E-Mail mitgeteilt. Der Verantwortliche kann einer geplanten Änderung innerhalb dieser Frist widersprechen.

fordify verpflichtet alle Unterauftragsverarbeiter vertraglich zur Einhaltung derselben Datenschutzpflichten, wie sie in diesem AVV geregelt sind, insbesondere hinsichtlich hinreichender Garantien für die Umsetzung geeigneter technischer und organisatorischer Maßnahmen (Art. 28 Abs. 4 DSGVO). Die Übermittlung personenbezogener Daten in Drittländer (USA) erfolgt auf Grundlage der Standardvertragsklauseln der EU-Kommission (Beschluss 2021/914/EU, Modul 2 – Controller to Processor). Auf Anfrage werden die einschlägigen SCC-Dokumente der jeweiligen Unterauftragsverarbeiter bereitgestellt.

## § 6 Technische und organisatorische Maßnahmen

fordify trifft angemessene technische und organisatorische Maßnahmen (TOMs) nach Art. 32 DSGVO, insbesondere:

- Vertraulichkeit: Verschlüsselte Datenübertragung (TLS/HTTPS); Zugriffskontrolle über Row Level Security (RLS) in Supabase; Authentifizierung per Magic Link (passwortlos); Service Role Key wird ausschließlich serverseitig verwendet und nie an den Client übertragen.

- Integrität: Eingabevalidierung in Edge Functions; HMAC-Signaturprüfung für Paddle-Webhooks.

- Verfügbarkeit: Automatische Backups durch Supabase (täglich); georedundante Infrastruktur über den EU-Frankfurt-Datenbankcluster von Supabase.

- Belastbarkeit: Statische Auslieferung über CDN; Service-Worker-Caching für Offline-Betrieb.

- Datensparsamkeit: Es werden ausschließlich für den Betrieb erforderliche Daten gespeichert; keine Tracking-Cookies; datenschutzkonformes Analyse-Tool (GoatCounter, cookielos, selbst gehostet).

- Löschkonzept: Automatisierte Löschung von Fällen, Kontakten und Einstellungen nach Ablauf der Grace Period; Aufbewahrung von Profil- und Abrechnungsdaten für 10 Jahre (§ 147 AO).

fordify berücksichtigt bei der Entwicklung und dem Betrieb des Dienstes die Grundsätze des Datenschutzes durch Technikgestaltung und datenschutzfreundliche Voreinstellungen gemäß Art. 25 DSGVO.

Bei datenschutzrelevanten Sicherheitsverletzungen informiert fordify den Verantwortlichen unverzüglich, spätestens jedoch innerhalb von 72 Stunden nach Bekanntwerden, um dem Verantwortlichen die Erfüllung seiner Meldepflicht nach Art. 33 DSGVO zu ermöglichen (Art. 28 Abs. 3 lit. f DSGVO). Die Erstmeldung kann mit den zum Zeitpunkt verfügbaren Informationen erfolgen und wird vervollständigt, sobald weitere Erkenntnisse vorliegen (Art. 33 Abs. 4 DSGVO). fordify dokumentiert alle Verletzungen des Schutzes personenbezogener Daten gemäß Art. 33 Abs. 5 DSGVO und stellt diese Dokumentation dem Verantwortlichen auf Anfrage zur Verfügung.

## § 7 Rechte betroffener Personen

fordify unterstützt den Verantwortlichen bei der Erfüllung von Anfragen betroffener Personen (Auskunft, Löschung, Berichtigung) soweit technisch möglich. fordify unterstützt den Verantwortlichen darüber hinaus bei der Erfüllung von Pflichten aus Art. 32–36 DSGVO, insbesondere bei der Durchführung von Datenschutz-Folgeabschätzungen (Art. 35 DSGVO) und der Konsultation der Aufsichtsbehörde (Art. 36 DSGVO), soweit dies im Rahmen des Auftrags möglich und zumutbar ist.

## § 8 Löschung und Rückgabe

Nach Beendigung des Auftrags löscht fordify alle personenbezogenen Daten des Verantwortlichen innerhalb von 30 Tagen, sofern keine gesetzliche Aufbewahrungspflicht besteht. Auf Anfrage wird eine Kopie der Daten in maschinenlesbarem Format bereitgestellt.

## § 9 Kontroll- und Nachweisrechte

Der Verantwortliche ist berechtigt, die Einhaltung dieses Vertrags durch eigene Prüfungen oder durch beauftragte Dritte zu überprüfen, insbesondere durch Einsichtnahme in relevante Unterlagen. Vor-Ort-Inspektionen sind nach vorheriger schriftlicher Ankündigung mit einer Frist von mindestens fünf Werktagen und während der üblichen Geschäftszeiten möglich; sie sind auf das erforderliche Maß zu beschränken und dürfen den Betrieb nicht unverhältnismäßig beeinträchtigen. fordify stellt die hierfür erforderlichen Informationen bereit und unterstützt Audits im zumutbaren Rahmen. fordify ist berechtigt, an Stelle einer Vor-Ort-Inspektion einen aktuellen Bericht eines unabhängigen Sachverständigen (z. B. ISO-27001-Zertifikat oder gleichwertigen Nachweis) vorzulegen, sofern dieser die Prüffragen des Verantwortlichen hinreichend beantwortet.

## § 10 Schlussbestimmungen

Dieser Vertrag unterliegt dem Recht der Bundesrepublik Deutschland. Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist Hamburg, sofern der Verantwortliche Kaufmann, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist.

Dieser Vertrag gilt als abgeschlossen, wenn der Verantwortliche die fordify AGB akzeptiert und den Dienst im Rahmen eines kostenpflichtigen Abonnements nutzt (Art. 28 Abs. 9 DSGVO). Der Zeitpunkt der Akzeptanz wird vom Anbieter dokumentiert und ist dem Verantwortlichen auf Anfrage mitzuteilen.

Sollte eine Bestimmung dieses Vertrags unwirksam sein, bleiben die übrigen Bestimmungen davon unberührt.

## § 11 Kontakt

Bei Fragen zum AVV: [datenschutz@fordify.de](mailto:datenschutz@fordify.de)
