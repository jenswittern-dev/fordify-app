# Holistische Vorprüfung der Rechtstexte von fordify.de

## Überblick

### Executive Summary

- Die Rechtstexte sind **nicht roh oder unbrauchbar**, aber sie sind für ein Legal-Tech-/SaaS-Angebot mit Kanzlei- und Forderungsdaten **noch nicht sauber aufeinander abgestimmt**. Das stärkste Muster ist ein **Systembruch zwischen Marketing, Tariflogik, Datenschutzrollen und Haftungsverteilung**. citeturn0view0turn1view0turn25view1turn25view2turn25view3
- **Kritisch** ist der Widerspruch zwischen Website-Claims wie „rechtssicher“, „DSGVO-konform“ und „kein Server, keine Cloud“ einerseits und den bezahlten Cloud-Tarifen, dem Einsatz von Subprozessoren sowie dem weitgehenden Gewähr- und Haftungsausschluss in den AGB andererseits. Das erzeugt Fehl-Erwartungen und erhöht Streit- und Abmahnrisiken. citeturn0view0turn1view0turn2view0turn28view0turn26view2
- **Kritisch** ist der AVV in seiner aktuellen Form, weil der Auftragsverarbeiter dort nur als **„fordify“** bezeichnet wird; eine klare Parteienbezeichnung mit Betreibername und Anschrift fehlt. Für einen Vertrag nach Art. 28 DSGVO ist das unnötig angreifbar. citeturn25view3turn30view0turn14search7turn14search3
- **Hoch** ist die Inkonsistenz beim Drittland-/Subprocessor-Thema: Der AVV nennt für US-Unterauftragsverarbeiter pauschal **SCC Modul 2 (Controller-to-Processor)**, obwohl bei einem echten Subprocessor-Setup typischerweise **Processor-to-Processor** einschlägig ist. Die Europäische Kommission differenziert hier ausdrücklich zwischen Modul 2 und Modul 3. citeturn30view0turn24search1turn24search6
- **Hoch** ist die Datenschutzerklärung zu **entity["company","Resend","email delivery"]**: Fordify erklärt, die Server-Infrastruktur liege in der EU, während Resend selbst sagt, dass zwar aus EU-Regionen versendet werden kann, **Account-Daten, Logs und Metadaten aber in den USA gespeichert werden**. Das ist kein Schönheitsfehler, sondern ein substanzieller Transparenzmangel. citeturn29view2turn18search0turn18search3
- **Hoch** ist der B2B/B2C-Bruch: AGB schließen Verbraucher aus, die Website lädt aber breit und niedrigschwellig zur Nutzung ein; auf der Preisseite steht sogar „Für Einzelpersonen und kleine Teams“. Für den Free-Tarif entsteht laut AGB der Vertrag schon durch Erstnutzung. Das ist für einen echten B2B-only-Ansatz zu weich. citeturn27view0turn28view0turn0view0turn1view0
- **Hoch** ist der Preis-/Steuer-Widerspruch: AGB sagen „Kleinunternehmer, keine Umsatzsteuer“, die Preisseite sagt „Alle Preise zzgl. 19 % MwSt.“. Das lässt sich mit dem Merchant-of-Record-Modell von **entity["company","Paddle","merchant of record"]** zwar teilweise erklären, ist aber aktuell falsch oder missverständlich formuliert. citeturn28view0turn1view0turn10search7
- **Mittel bis hoch** ist die Behandlung von Kanzlei- und Mandatsdaten: Die AGB verlagern das berufsrechtliche Risiko praktisch vollständig auf den Kunden. Für ein Angebot, das sich ausdrücklich an Kanzleien richtet und Mandanten-/Schuldnerdaten verarbeitet, ist das zu dünn. Die anwaltliche Verschwiegenheit und der Einsatz externer Dienstleister sind in der BRAO klar geregelt. citeturn0view0turn1view0turn27view5turn7search0turn7search6turn7search16
- Wichtigste To-dos vor einem kommerziellen Rollout: **AVV strukturell überarbeiten**, **Datenschutzerklärung zu Resend/Supabase/Rollen trennen**, **B2B-Positionierung konsequent machen**, **Marketing-Claims rechtlich entgiften**, **Preis-/Steuerlogik sauber an Paddle anpassen**. citeturn25view1turn25view2turn25view3turn1view0turn10search7

### Kurzprofil Fordify nach Website-Recherche

**Beobachtung**

Fordify ist nach der Website eine browserbasierte SaaS-Anwendung für Forderungsaufstellungen nach § 367 BGB, Verzugszinsen, RVG-, GKG- und Tilgungsberechnungen. In den bezahlten Tarifen kommen Cloud-Speicherung, Export/Import, Adressbücher, Workflow-Funktionen, Fallnotizen und die Generierung eines ZV-Auftrags hinzu. Die Website adressiert vor allem Kanzleien, Inkassobüros und Unternehmen; der Checkout läuft über Paddle als Merchant of Record. In Free läuft die Anwendung laut Website/AGB ohne Login, Pro/Business mit Login und Cloud. citeturn0view0turn1view0turn2view0turn2view1turn22view0turn10search7

**Annahme**

Das Kernmodell ist **B2B Legal-Tech/SaaS** mit einem kostenlosen Lead-Magnet-Tool und einem Upsell in Pro/Business. Vertraglich entsteht wahrscheinlich eine Mischung aus unregistrierter Free-Nutzung und registriertem Subscription-Modell für Pro/Business. Datenschutzrechtlich ist Fordify teils **eigener Verantwortlicher** für Website, Auth, Billing-nahe Informationen und Kommunikation, teils **Auftragsverarbeiter** für kundenseitig eingegebene Fall-/Schuldner-/Mandantendaten. citeturn28view0turn29view1turn29view3turn30view0

**Prüfbedarf**

Offen bleibt, ob Fordify wirklich rein B2B sein soll oder faktisch ein Hybrid-Angebot ist. Offen bleibt auch, ob und in welchem Umfang sensible anwaltliche Geheimnisse, Forderungsakten, Vollstreckungsdaten oder sonstige besonders vertrauliche Informationen verarbeitet werden, ob ein echter Support-Zugriff auf Inhaltsdaten praktisch möglich ist und wie Subprocessor-/Drittlandtransfers technisch genau ausgestaltet sind. `[B2B/B2C-STATUS UNKLAR]` `[KI-EINSATZ UNKLAR]` `[SUPPORTREGELUNG UNKLAR]` `[VERFÜGBARKEIT UNKLAR]` citeturn27view0turn27view5turn29view2turn30view1

### Dokumentenübersicht

| Dokument / Abschnitt | Vorhanden? | Quelle / HTML-Abschnitt | Erste Einschätzung | Auffälligkeiten |
|---|---:|---|---|---|
| Impressum | Ja | `impressum.html` / Impressumseite citeturn25view0 | Formal weitgehend brauchbar | Kein Registereintrag genannt; bei natürlicher Person wohl vertretbar. ODR-/Schlichtungstext vorhanden, aber B2B-Kontext schwach. |
| Datenschutzerklärung | Ja | `datenschutz.html` / Datenschutzseite citeturn25view1turn29view0turn29view4 | Inhaltlich bereits ungewöhnlich detailliert | Gute App-Nähe, aber Rollenabgrenzung unscharf; Resend-Angabe wohl materiell falsch/unvollständig. |
| AGB | Ja | `agb.html` / AGB-Seite citeturn25view2turn28view0 | Solide Grundstruktur für frühes SaaS | Größte Schwächen: B2B-Abgrenzung, Preis-/Steuerlogik, Marketing-Passung, fehlende Vertraulichkeit/SLA-/Change-Details. |
| AVV | Ja | `avv.html` / AVV-Seite citeturn25view3turn30view2 | Für Version 1.0 erstaunlich konkret | Parteienbezeichnung unzureichend; SCC-Modul fragwürdig; TOMs inline, aber nicht tief genug; Rückgabe/Löschung/Rollen nicht sauber getrennt. |
| Preis-/Checkout-Logik | Ja | Preisseite / Konto / Checkout-Checkboxen citeturn1view0turn22view0 | Sehr relevant für Wirksamkeit und Erwartungen | AGB-/AVV-Akzeptanz dokumentierbar; zugleich B2B-Botschaft und Preissteuerung nicht sauber. |
| Produkt-/Claim-Ebene | Ja | Startseite, App, Changelog citeturn0view0turn2view0turn2view1 | Für die Rechtsprüfung zentral | „rechtssicher“, „DSGVO-konform“, „kein Server/keine Cloud“ kollidieren mit Cloud- und Haftungstexten. |

### Gesamtmatrix der wichtigsten Risiken

| Priorität | Bereich | Fundstelle | Problem | Risiko | Empfehlung |
|---:|---|---|---|---|---|
| 1 | AVV | AVV §1, §10 citeturn26view3turn30view2turn14search7turn14search3 | Auftragsverarbeiter nur als „fordify“ bezeichnet; keine klare Vertragspartei/Adresse | **Kritisch** | Vollständige Parteiklausel mit Betreibername, Anschrift, Kontakt, ggf. Vertretung und Referenz auf Tarif-/Bestelldaten ergänzen. `[BETREIBER / RECHTSTRÄGER FEHLT]` `[ANSCHRIFT FEHLT]` |
| 1 | Datenschutz / Drittland | DS Resend; Resend-Doku citeturn29view2turn18search0turn18search3 | DS sagt „Server-Infrastruktur in der EU“, Resend speichert Account-Daten/Logs laut eigener Doku in den USA | **Kritisch** | Resend-Abschnitt neu formulieren: Versandregion EU ≠ Datenresidenz; US-Speicherung, SCCs, Datenkategorien klar offenlegen. |
| 1 | Website vs AGB/DS | Startseite, Preise, AGB, DS citeturn0view0turn1view0turn28view0turn29view1 | Absolute Claims „rechtssicher“, „DSGVO-konform“, „kein Server, keine Cloud“ passen nicht zu Cloud-Tarifen und Haftungsausschluss | **Kritisch** | Claims entschärfen und planbezogen trennen: Free lokal, Pro/Business Cloud; „unterstützt“ statt „rechtssicher“. |
| 1 | B2B/B2C | AGB 1.2/3.3, Startseite, Preise citeturn27view0turn28view0turn0view0turn1view0 | AGB: nur Unternehmer; Website: offene Free-Nutzung, „Einzelpersonen“ | **Hoch** | Entweder echtes B2B-Gating einbauen oder B2C-Risiken sauber mitdenken und Texte anpassen. `[B2B/B2C-STATUS UNKLAR]` |
| 1 | AGB / Preise | AGB 4.1 vs Preise citeturn28view0turn1view0turn10search7 | „Kleinunternehmer, keine USt“ vs „Alle Preise zzgl. 19 % MwSt.“ | **Hoch** | Pricing-Sprache auf Merchant-of-Record-Logik umstellen: „Steuern können je nach Land/Zahlungsabwicklung durch Paddle anfallen“ oder Bruttopreise ausweisen. |
| 2 | AVV / SCC | AVV §5; Kommissions-Q&A citeturn30view0turn24search1turn24search6 | Pauschal Modul 2 genannt; bei Subprozessing spricht viel für Modul 3 | **Hoch** | SCC-Verweis je Transferweg prüfen und korrekt benennen; Transfer-Impact-Assessment dokumentieren. |
| 2 | AVV / Incident | AVV §6; Art. 33 DSGVO citeturn30view1turn20search0turn20search8 | Meldung „spätestens binnen 72 Stunden“ statt „unverzüglich“ an den Verantwortlichen | **Hoch** | Wortlaut auf „unverzüglich“ umstellen; 72h höchstens als äußerste Leitplanke für Erstmeldung. |
| 2 | Kanzleidaten / Berufsrecht | AGB 9.4; Zielgruppe; BRAO citeturn27view5turn1view0turn7search0turn7search6turn7search16 | Berufsrechtlicher Geheimnisschutz wird fast vollständig auf den Kunden abgewälzt | **Hoch** | Ergänzende Vertraulichkeits- und Sicherheitszusagen, Supportzugriffsregeln und ggf. §43e-BRAO-kompatible Dienstleisterklausel ergänzen. |
| 2 | Verfügbarkeit / Support | AGB 2.2, 8.6; Preise citeturn27view2turn26view2turn1view0 | Support und Verfügbarkeit werden verkauft, aber nicht konkretisiert | **Mittel** | Supportkanäle, Reaktionsfenster, Wartungsfenster und Störungsmanagement definieren. `[SUPPORTREGELUNG UNKLAR]` `[VERFÜGBARKEIT UNKLAR]` |
| 3 | DS / Endgerätezugriff | DS Hosting/App/Analytics; TDDDG §25 citeturn25view1turn29view1turn29view3turn3search3 | Kein Cookie-Banner wird stark behauptet, obwohl Session-/LocalStorage und Analytics adressiert werden | **Mittel** | Rechtsgrundlagen-/Notwendigkeitslogik für Endgerätezugriffe sauberer erklären; Consent-Freiheit nur plan- und toolbezogen behaupten. |
| 3 | AGB / Preis- und AGB-Änderung | AGB 4.4, 10.3 citeturn28view0turn27view6 | Zustimmung durch Schweigen ohne Begründungskatalog | **Mittel** | Änderungsgründe, Änderungsgrenzen und Kündigungsfolgen präziser normieren. |
| 4 | Impressum / ODR-Link | AGB 10.5; EU-Kommission citeturn27view6turn8search0 | Verweis auf ODR-Plattform, die seit 20.07.2025 geschlossen ist | **Niedrig** | Entfernen oder neutral ersetzen; für B2B ohnehin wenig Mehrwert. |

## Einzelprüfung

### Detailprüfung Impressum

| Prüfpunkte | Bewertung | Risiko | Empfehlung |
|---|---|---|---|
| Anbieterkennzeichnung | Natürliche Person **entity["people","Jens Wittern","fordify operator"]** mit Anschrift in entity["city","Hamburg","Germany"] ist genannt. citeturn25view0turn3search2 | Niedrig | Für das Impressum formal okay. Wichtig ist nur, dass dieselbe Identität auch in AVV und Vertragsstrecke sauber auftaucht. |
| Kontaktmöglichkeiten | Telefon und E-Mail vorhanden. citeturn25view0 | Niedrig | Ausreichend. Optional zusätzlich klares Support-/Datenschutzrouting auf der Website. |
| USt-IdNr. | USt-IdNr. genannt. citeturn25view0 | Hinweis | Inhaltlich okay; sie beseitigt aber **nicht** den Widerspruch zwischen Kleinunternehmerklausel und Preisangabe „zzgl. 19 % MwSt.“ |
| Registerangaben / Rechtsform | Keine Registerangaben; als natürliche Person grundsätzlich plausibel. Eine Rechtsform fehlt, was hier nicht zwingend falsch ist. citeturn25view0 | Niedrig | Nur dann ergänzen, falls doch eine eingetragene Gesellschaft oder ein Registertatbestand besteht. |
| Verbraucherstreitbeilegung | Hinweis vorhanden. citeturn25view0 | Niedrig | Im B2B-Kontext kein Schwerpunkt. Konsistenz mit AGB bereinigen und ODR-Verweis dort aktualisieren. |
| Konsistenz mit AGB/AVV | Impressum und AGB nennen dieselbe Person/Adresse; der AVV dagegen nur „fordify“. citeturn25view0turn27view0turn26view3 | **Hoch** | AVV an eindruckslose, aber rechtlich saubere Grundregel erinnern: Vertragspartner immer klar benennen. |

### Detailprüfung Datenschutzerklärung

| Prüfpunkte | Bewertung | Risiko | Empfehlung |
|---|---|---|---|
| Verantwortlichenangaben | Betreiber, Anschrift und Datenschutz-E-Mail sind benannt. citeturn25view1 | Niedrig | Formal okay. |
| Abdeckung der eigentlichen App | Positiv: Die DS beschreibt nicht nur die Website, sondern auch Free-/Pro-/Business-Logik, lokale Speicherung, Cloud, Auth, Mail und Billing. citeturn29view1turn29view4 | Hinweis | Diese App-Nähe ist ein Pluspunkt und sollte beibehalten werden. |
| Rollenabgrenzung Website vs SaaS vs AVV | Rollen werden angedeutet, aber nicht konsequent getrennt. Website-Besucher, Kunden, Nutzerkonten und Drittdaten laufen teilweise zusammen. citeturn25view1turn29view1turn29view4turn30view0 | **Mittel** | Abschnitt „Wann sind wir Verantwortlicher, wann Auftragsverarbeiter?“ ergänzen. |
| Hosting der Website | Website-Hosting über **entity["company","ALL-INKL.COM","web host"]** wird benannt; AVV mit Host wird behauptet. citeturn25view1 | Niedrig | Plausibel. |
| Lokale Datenspeicherung | Free = sessionStorage; Pro/Business = localStorage + Cloud. Das ist grundsätzlich transparent erklärt. citeturn29view1 | Mittel | Mit den UI-Texten auf der Produktseite harmonisieren; dort wird teils pauschal „localStorage / kein Server, keine Cloud“ gesagt. |
| Supabase | **entity["company","Supabase","database platform"]** wird als Cloud- und Auth-Anbieter genannt; EU-Hosting Frankfurt und SCCs wegen Auslandsbezug werden erklärt. citeturn29view1turn29view2turn17search7turn17search10 | Mittel | Gut, aber Datenarten und Rollen pro Tarif noch klarer trennen; ggf. DPA-/Subprocessor-Link ergänzen. |
| Resend | Resend wird genannt, aber die Aussage „Server-Infrastruktur befindet sich innerhalb der EU“ kollidiert mit Resends eigener Aussage, dass Account-Daten und Logs in den USA gespeichert werden. citeturn29view2turn18search0turn18search3 | **Kritisch** | Vollständig korrigieren: Versandregion, Datenresidenz, Metadaten, SCCs und US-Speicherung getrennt erläutern. |
| Eigene E-Mail-Automatisierung | N8N auf Hostinger wird erwähnt; gleichzeitig heißt es „keine Datenübertragung an Dritte“, obwohl Infrastruktur bei **entity["company","Hostinger","hosting provider"]** läuft. citeturn29view2turn30view0 | **Mittel** | Formulierung präzisieren: keine Weitergabe an zusätzliche fachfremde Empfänger, aber Hosting durch externen Infrastrukturanbieter. |
| GoatCounter / Analytics | Webanalyse wird relativ sauber beschrieben; keine Cookies, kein Fingerprinting, kein Cookie-Banner. citeturn29view3 | Mittel | TDDDG-/Endgerätezugriffslogik vorsichtiger formulieren; nicht pauschal „kein Cookie-Banner“ als Rechtsfazit verkaufen. citeturn3search3 |
| Paddle / Zahlungsabwicklung | Paddle wird zutreffend als Merchant of Record und eigener Verantwortlicher für Payment-/Rechnungsdaten dargestellt. citeturn29view3turn10search7 | Niedrig | Diese Logik muss 1:1 in AGB und Preistexten gespiegelt werden. |
| Empfänger / Dienstleister | Dienstleister werden gut konkretisiert; das ist besser als viele Standard-Datenschutzerklärungen. citeturn25view1turn29view1turn29view4 | Hinweis | Subprocessor-Liste zusätzlich zentral auf AVV-Seite oder Trust-Seite versionieren. |
| Drittlandübermittlungen | SCCs werden bei Supabase/Resend genannt; das ist richtig gedacht. citeturn29view2turn9search8turn9search9 | Mittel | Transferpfade und betroffene Daten je Dienst präziser ausbuchstabieren. |
| Speicherdauer | Generelle Speicherdauer plus 30-Tage-Exportfenster sind erkennbar. citeturn25view1turn1view0 | Mittel | Trennen zwischen Kundendaten, Nutzerkontodaten, Abrechnungsdaten und Backup-/Log-Daten. |
| Pflicht zur Bereitstellung / automatisierte Entscheidungen | Eine explizite Angabe zur Pflicht bestimmter Daten im Registrierungs-/Zahlungskontext und zu automatisierten Entscheidungen fehlt. citeturn25view1turn15search11 | Mittel | Pflichtfelder und Nichtbereitstellungsfolgen ergänzen; KI-/Automationsbezug ausdrücklich verneinen oder erläutern. `[KI-EINSATZ UNKLAR]` |

### Detailprüfung AGB

| Klausel / Thema | Aktueller Befund | Risiko | Warum relevant? | Konkrete Empfehlung |
|---|---|---|---|---|
| Vertragspartner und Geltungsbereich | Vertragspartner ist der Betreiber, AGB gelten für SaaS-Nutzung. Betreiberdaten sind sauber benannt. citeturn27view0 | Niedrig | Gute Basis für die Vertragsarchitektur. | So belassen; dieselbe Identität in AVV und Checkout spiegeln. |
| Zielgruppe B2B/B2C | AGB schließen Verbraucher ausdrücklich aus. Website und Preise sprechen aber offen alle Besucher an; „Einzelpersonen“ ist missverständlich. citeturn27view0turn0view0turn1view0 | **Hoch** | Für Free-Nutzung entsteht laut AGB schon bei Erstnutzung ein Vertrag; ohne wirksame B2B-Selektion ist das ein echter Friktionspunkt. | Entweder hartes B2B-Gating vor Nutzung/Checkout oder Hybrid-Modell sauber neu aufsetzen. |
| Registrierung, Account, Vertragsschluss | Paid-Vertrag per Registrierung + Tarifwahl; Free-Vertrag durch erstmalige Nutzung. citeturn27view2turn28view0 | Mittel | Besonders der Free-Vertrag ist für B2B-only nur belastbar, wenn der Nutzerstatus sauber kontrolliert wird. | Free-Tarif mit deutlich sichtbarer Unternehmer-Erklärung versehen oder AGB-Logik anpassen. |
| Leistungsbeschreibung | Leistungsbeschreibung ist konkret und nah am Produkt. Pro/Business-Funktionen werden erkennbar beschrieben. citeturn28view0turn1view0turn2view1 | Hinweis | Das ist stark; es reduziert Auslegungsstreit. | Beibehalten, aber Cloud-/Lokal-Logik überall gleich formulieren. |
| Leistungsgrenzen | Leistungsreduzierungen dürfen mit 30 Tagen Vorlauf angekündigt werden; sonst wenig zur Change Governance. citeturn27view2 | Mittel | Für SaaS ist „was darf sich ändern?“ ein häufiger Konfliktpunkt. | Änderungsgründe, Zumutbarkeit und Kundenschutz klarer regeln. |
| SaaS-typische Regelungen | Es fehlen klare Regeln zu Wartungsfenstern, Statuspage/Störungsmeldung, Supportzeiten, Backup-Restore-Zusagen. citeturn26view2turn1view0 | **Mittel** | Bei Tools für Kanzleien/Forderungsmanagement ist operative Zuverlässigkeit Teil des Produktversprechens. | Eigene SaaS-Betriebsklauseln ergänzen. |
| Verfügbarkeit | Kein Anspruch auf bestimmte Verfügbarkeit; gleichzeitig werden E-Mail-/Prioritäts-Support und Cloud-Speicherung verkauft. citeturn26view2turn1view0 | **Mittel** | Ohne SLA ist das rechtlich möglich, aber kommerziell und erwartungsseitig schwach. | Wenigstens „Best effort“ + Wartungs-/Störungsprozess + planbezogene Supportlevel definieren. |
| Preise und Zahlung | Großes Problem: AGB „Kleinunternehmer, keine USt“, Website „zzgl. 19 % MwSt.“; Paddle als Merchant of Record wird zwar genannt. citeturn28view0turn1view0turn10search7 | **Hoch** | Das kann zu Verwirrung bei Rechnung, Preiswahrheit und Vertragsgegner führen. | Preis-/Steuertext komplett vereinheitlichen. |
| Zahlungspartner Paddle | AGB stellen Paddle sinnvoll als MoR für Zahlungsabwicklung dar. citeturn28view0turn10search7 | Niedrig | Das ist grundsätzlich passend für SaaS-Subscriptions. | Ergänzend klarstellen, wer Vertragspartner für die Softwareleistung bleibt. |
| Preisänderungen | Zustimmung durch Schweigen nach 14 Tagen, ohne objektive Änderungsgründe. citeturn28view0 | **Mittel** | Solche Klauseln sind auslegungsanfällig und unnötig konfliktträchtig. | Sachliche Änderungsgründe, Änderungskorridor und Kündigungsfolgen konkretisieren. |
| Laufzeit und Kündigung | Monatlich/jährlich mit Verlängerung; 30 Tage Datenhaltung nach Ende. citeturn26view1turn28view0turn1view0 | Niedrig | Grundlogik ist plausibel und produktnah. | Gut; ergänzend definieren, welche Exporte in welchem Tarif nach Kündigung noch möglich sind. |
| Sperrung / außerordentliche Kündigung | Sperrungs- und Kündigungsrechte des Anbieters sind vorhanden. citeturn26view1turn27view3 | Mittel | Für Missbrauch okay, für Kanzleisysteme aber sensibel. | Vor endgültiger Sperrung gestufte Verfahren, Notfallexport und Benachrichtigung regeln. |
| Nutzungsrechte | Browsernutzungsrecht und Drittnutzungsverbote sauber angerissen. citeturn27view3 | Niedrig | Für ein webbasiertes Tool passend. | Ergänzend Rechte an PDF-/Export-Outputs und Kundenlogos klarstellen. |
| Kundendaten / eingegebene Inhalte | Kunde bleibt Inhaber seiner Daten; Verarbeitungsrecht des Anbieters ist knapp geregelt. citeturn28view0 | Mittel | Bei Legal-Tech-Daten wichtig, aber noch zu dünn. | Datenhoheit, Export, Löschung, Supportzugriff und Anonymisierung präziser regeln. |
| Umgang mit juristischen Dokumenten/Berechnungen | AGB sagen „kein Ersatz für Rechtsberatung“ und „keine Gewähr für Berechnungsrichtigkeit“. Website verkauft aber „rechtssichere Forderungsaufstellung“. citeturn26view2turn0view0 | **Hoch** | Das ist der sichtbarste Erwartungsbruch der gesamten Dokumentation. | Marketing entschärfen oder Prüf-/Validierungsversprechen substantiieren. |
| Haftung und Haftungsbegrenzung | Klassische B2B-Haftung, Mindestdeckel 500 €, Datenverlustklausel, Ausschluss leichter Fahrlässigkeit außer Kardinalpflichten. citeturn26view2 | Mittel | Grundsätzlich plausibel, aber bei einem „rechtssicher“ vermarkteten Legal-Tech-Tool wirkt die harte Entlastung angreifbar. | Haftungstext mit Claim-Niveau harmonisieren; ggf. eigene Regel für Berechnungsfehler/Updatefehler. |
| Gewährleistung | Eine echte Mängel-/Gewährleistungsstruktur fehlt; stattdessen nur Haftungsausschluss und Richtigkeitsdisclaimer. citeturn26view2 | **Mittel** | Für SaaS sollte klar sein, wann ein Mangel vorliegt und wie nachgebessert wird. | Eigene Gewährleistungs-/Fehlerbehebungsregel ergänzen. |
| Datenschutzverweis | Verweis auf Datenschutzerklärung und AVV vorhanden; AVV soll „konkludent“ gelten. citeturn27view4turn26view5turn14search3 | Mittel | Grundidee okay, aber „konkludent“ ist unnötig unscharf, wenn im Checkout ohnehin aktiv akzeptiert wird. | „Elektronisch ausdrücklich abgeschlossen“ statt „konkludent“ formulieren. |
| Vertraulichkeit | Keine eigenständige Vertraulichkeitsklausel zwischen den Parteien, obwohl hochsensible Forderungs-/Mandatsdaten im Raum stehen. citeturn27view5turn30view0 | **Hoch** | Datenschutz ersetzt keine allgemeine Geheimhaltungsregel. | Separate Vertraulichkeitsklausel aufnehmen. |
| Berufsrechtlicher Geheimnisschutz | AGB wälzen Verantwortung für BRAO-/Mandantenthemen fast ganz auf den Kunden ab. citeturn27view5turn7search0turn7search6 | **Hoch** | Für Kanzleizielgruppe ist das zu defensiv und vertrieblich selbstschädigend. | Eigene Zusagen zu Vertraulichkeit, Zugriffskontrollen und Dienstleisterverpflichtung ergänzen. |
| Änderungen der AGB | Zustimmung durch Schweigen mit Kündigungsrecht. citeturn27view6 | Mittel | Nicht untypisch, aber besser mit Änderungsgründen. | Gründe, Reichweite und Kundenschutz ergänzen. |
| Gerichtsstand / Recht | Deutsches Recht, Hamburg als Gerichtsstand für kaufmännische Kunden. citeturn27view5 | Niedrig | Für B2B plausibel. | So belassen. |
| Streitbeilegung / ODR | Verweis auf ODR-Plattform ist veraltet; die Plattform wurde am 20.07.2025 eingestellt. citeturn27view6turn8search0 | Niedrig | Kein Kernrisiko, aber unnötig veraltet. | Entfernen oder aktualisieren. |

#### Fehlende oder zu ergänzende AGB-Regelungen

| Thema | Warum wichtig? | Formulierungsidee / Regelungsziel |
|---|---|---|
| Vertraulichkeit | Legal-Tech mit Mandats-/Schuldnerdaten braucht mehr als DSGVO-Verweise | Gegenseitige Vertraulichkeit; Supportzugriff nur need-to-know; Unterlagen/Logs vertraulich |
| Supportregime | „E-Mail-Support“ und „Prioritäts-Support“ sind verkauft, aber nicht definiert | Supportkanäle, Zeiten, Reaktionsfenster, Eskalation, Ausschlüsse |
| SaaS-Betrieb / Wartung | Produktnutzung hängt an Verfügbarkeit und Änderungen | Wartungsfenster, Störungsinformation, geplante Downtimes, Force-Majeure-Abgrenzung |
| Mängel / Gewährleistung | Haftung ersetzt keine Mangelregel | Definition wesentlicher Mängel, Nachbesserung, Fristen, Minderungsfolgen |
| Export / Exit | Für B2B-Kunden essenziell | Welche Formate, wie lange nach Kündigung, ob vollständiger Export inkl. Notizen/Adressen |
| Rollen- und Verantwortungsmodell | Forderungs-/Mandatsdaten und Nutzerkonten haben unterschiedliche Rollen | Klarstellen, was Kundendaten sind und was Fordify als eigener Verantwortlicher verarbeitet |
| Berufsrecht / Kanzleien | Zielgruppe sind Kanzleien | Regelungsziel: §43e-BRAO-kompatible Dienstleister-/Vertraulichkeitsarchitektur |
| Missbrauchs-/Sperrprozess | Sperrung kann operative Schäden auslösen | Vorwarnung, Notfallexport, dokumentierte Gründe, abgestufte Maßnahmen |
| Preise / Steuern / MoR | Derzeitig inkonsistent | Einheitliche Steuerlogik mit Paddle als Reseller/Merchant of Record |
| Claim-Konsistenz | „rechtssicher“ vs „keine Gewähr“ | Leistungsversprechen rechtlich und vertrieblich konsistent formulieren |

### Detailprüfung AVV

| Abschnitt / Thema | Aktueller Befund | Risiko | Warum relevant? | Konkrete Empfehlung |
|---|---|---|---|---|
| Parteien des AVV | Der AVV nennt nur „fordify“ und „Kunde“; vollständige Vertragsparteien fehlen. citeturn26view3turn30view2turn14search7 | **Kritisch** | Art. 28-Verträge müssen nicht schön, aber identifizierbar sein. | Betreibername, Anschrift, E-Mail, ggf. Referenz auf Bestellung/Account ergänzen. `[BETREIBER / RECHTSTRÄGER FEHLT]` |
| Verhältnis Auftraggeber / Auftragnehmer | Rollen werden grundsätzlich als Verantwortlicher/Kunde und Auftragsverarbeiter/fordify beschrieben. citeturn26view3 | Mittel | Grundstruktur stimmt. Problematisch ist die fehlende Schärfe bei Randprozessen. | Explizit abgrenzen: AVV gilt für Arbeitsdaten; Billing/Auth/Website teils eigene Verantwortlichkeit. |
| Gegenstand und Dauer | Gegenstand und Dauer sind genannt. citeturn26view3 | Niedrig | Das erfüllt den Mindestansatz. | Gut. |
| Art und Zweck der Verarbeitung | Forderungsdatenverwaltung wird beschrieben. citeturn26view3 | Mittel | Für das Kernprodukt passend, aber etwas zu knapp für das tatsächliche Funktionsspektrum. | Auch Export/Import, Suche, Notizen, Auth, Supportzugriffe und ZV-Generierung einbeziehen. |
| Kategorien betroffener Personen | Schuldner, Mandanten/Ansprechpartner beschrieben. citeturn26view3 | Mittel | Besser als Standardtext, aber Nutzerkonten des Kunden fehlen. | Kundenmitarbeiter/Nutzerkonten und ggf. Bevollmächtigte ergänzen. |
| Kategorien personenbezogener Daten | Namen, Anschriften, Kontaktdaten, Status, Freitext-Notizen. citeturn26view3 | Mittel | Gut, aber E-Mail-/Auth-/Metadaten fehlen im AVV, obwohl sie in der DS genannt werden. | Datenkategorien mit DS harmonisieren. `[DATENKATEGORIEN UNKLAR]` |
| Verarbeitung vertraulicher Kanzlei-/Mandatsdaten | Faktisch klar im Produkt angelegt; AVV behandelt das nicht besonders. citeturn30view0turn2view0turn1view0 | **Hoch** | Für Kanzleien reicht ein generischer AVV oft nicht. | Vertraulichkeitsniveau und Schutzbedarf sensibler Akten-/Mandatsdaten gesondert adressieren. |
| Weisungsgebundenheit | Dokumentierte Weisung + konkludente Weisung durch Nutzung. citeturn30view0 | Niedrig | Im SaaS-Kontext vertretbar. | Support-/Admin-Zugriffe als gesonderte Weisungssituationen konkretisieren. |
| TOMs | TOMs sind inline und vergleichsweise konkret, aber nicht tief genug zu Rollen, Logging, Wiederherstellung, Schlüsseln, Zugriffspfaden. citeturn30view1turn21search0turn21search2 | Mittel | Art. 32 verlangt angemessene TOMs; für Kanzleidaten sollte die Tiefe höher sein. | TOM-Anlage oder Trust-Annex ergänzen. `[TOMS FEHLEN]` im Sinne fehlender Detailtiefe. |
| Vertraulichkeitsverpflichtung | Vertraulichkeitsverpflichtung der verarbeitenden Personen wird genannt. citeturn30view0 | Niedrig | Positiv. | Optional Dokumentations-/Nachweisniveau ergänzen. |
| Unterauftragsverarbeiter | Supabase, Resend, Hostinger werden genannt; Paddle wird zutreffend als eigener Verantwortlicher ausgenommen. citeturn30view0turn29view3 | Hinweis | Das ist überdurchschnittlich transparent. | Rollenbeschreibung je Subprocessor noch feiner ausdifferenzieren. |
| Internationale Datenübermittlungen | SCCs werden erwähnt, aber pauschal als „Modul 2 – Controller to Processor“. citeturn30view0turn24search1turn24search6 | **Hoch** | Bei Subprozessoren im Auftrag eines Prozessors ist das wahrscheinlich das falsche Modul. | Transferweg je Anbieter prüfen und korrekt referenzieren. |
| Unterstützungspflichten | Hilfe bei Betroffenenrechten, DSFA und Behördenkonsultation ist geregelt. citeturn30view1 | Niedrig | Positiv. | Beibehalten. |
| Meldepflichten bei Datenschutzverletzungen | „unverzüglich, spätestens jedoch innerhalb von 72 Stunden“. citeturn30view1turn20search0turn20search8 | **Hoch** | Gegenüber dem Verantwortlichen verlangt die DSGVO „ohne unangemessene Verzögerung“, nicht erst binnen 72h. | Formulierung auf Sofortmeldung/Erstmeldung + Updatepflicht umbauen. |
| Löschung, Rückgabe und Export | 30 Tage Löschfrist + Export auf Anfrage. citeturn30view1turn1view0 | Mittel | Gut, aber unklar für Backups, Logs und gemischte Datenbestände. | Backup-/Restorefenster, Log-Retention und Abgrenzung eigener Verantwortlichkeit ergänzen. |
| Kontrollrechte | Audits/Unterlagen/Vor-Ort/Sachverständigenbericht sind geregelt. citeturn30view1 | Niedrig | Für kleines SaaS recht ordentlich. | Gut; ggf. Kosten-/Verhältnismäßigkeitsregeln ergänzen. |
| Nachweispflichten | Auf Anfrage sollen SCC-Dokumente bereitgestellt werden; sonst begrenzte Nachweissystematik. citeturn26view4turn30view1 | Mittel | Für juristische Kunden oft wichtig. | Trust Center oder strukturierte Nachweisliste aufbauen. |
| Ende des Vertrags | Löschung binnen 30 Tagen; AGB behalten Konto-/Abrechnungsdaten 10 Jahre. citeturn30view1turn28view0 | Mittel | Das kann passen, wenn sauber zwischen Prozessor- und Controller-Daten getrennt wird; derzeit ist es dafür nicht sauber genug. | Rollen- und Datenklassen bei Vertragsende ausdrücklich trennen. |
| Konsistenz mit Datenschutzerklärung und AGB | Grundsätzlich konzeptionell abgestimmt, aber bei Parteien, Datenkategorien, Resend, Rollen und Secret-Thema nicht sauber. citeturn25view1turn25view2turn25view3 | **Hoch** | Das ist die Hauptschwäche des gesamten Sets. | AVV als „systemisches Dokument“ neu aufsetzen, nicht nur punktuell flicken. |

#### Fehlende oder zu ergänzende AVV-Bestandteile

| Thema | Warum wichtig? | Regelungsziel |
|---|---|---|
| Vollständige Parteienbezeichnung | Ohne klaren Auftragsverarbeiter ist der Vertrag unnötig angreifbar | Rechtsklarer Vertragspartner + Zuordnung zum Kundenaccount |
| Exakte Datenkategorien | DS und AVV müssen zusammenpassen | Arbeitsdaten, Nutzerdaten, Metadaten, Notizen, Im-/Exporte, Logs |
| Rollenabgrenzung | Billing/Auth/Website/Analytics sind nicht dieselbe Rolle wie Kundendatenverarbeitung | Trennung „eigene Verantwortlichkeit“ vs „Auftragsverarbeitung“ |
| Transfermodul je Subprocessor | Modul-Fehlzuordnung schafft Rechtsunsicherheit | Korrekte SCC-Module und Transferwege je Anbieter |
| Backup-/Log-/Restore-Regeln | Löschung ist ohne Backupregeln unvollständig | Aufbewahrung, Restorefenster, endgültige Löschung |
| Konkretisierte TOM-Anlage | Kanzlei-/Forderungsdaten rechtfertigen mehr Tiefe | Zugriffskonzepte, Logging, Recovery, Schlüssel, Admin-Zugriffe |
| Incident-Playbook | „72 Stunden“ ist zu grob | Sofortmeldung, Erstinfo, Updates, Ansprechpartner, Minimum-Content |
| Subprocessor-Änderungsfolgen | Nur Widerspruchsmöglichkeit, aber keine saubere Folge | Sonderkündigungs-/Abhilfemechanismus |
| Geheimnisschutz für Kanzleien | Datenschutzrecht ist nicht das ganze Spiel | Ergänzende Vertraulichkeit und Supportzugriffsbeschränkung |
| Nachweiskonzept | B2B-Kunden wollen Belege | Zertifikate, TOM-Summary, SCC-Nachweis, Auditprozess |

## Konsistenz und Maßnahmen

### Konsistenzprüfung zwischen AGB, AVV, Datenschutzerklärung und Website

| Thema | Website | AGB | AVV | Datenschutzerklärung | Bewertung / Widerspruch |
|---|---|---|---|---|---|
| Anbieterangaben | Brand dominiert, Betreiber kaum sichtbar citeturn0view0 | Betreiber klar benannt citeturn27view0 | Nur „fordify“ citeturn26view3 | Betreiber klar benannt citeturn25view1 | **Widerspruch**: AVV fällt aus dem System |
| Rollen im Datenschutz | Nicht klar sichtbar | AVV erforderlich bei Kundendaten citeturn27view4 | Fordify = Processor citeturn26view3 | Paddle = eigener Verantwortlicher; Websitebetreiber = Verantwortlicher citeturn29view3turn25view1 | **Teilweise konsistent**, aber nicht sauber getrennt |
| Leistungsbeschreibung | Sehr konkret, produktnah citeturn0view0turn1view0turn2view1 | Ebenfalls konkret citeturn28view0 | Nur verkürzt als Forderungsdatenverwaltung citeturn26view3 | App-Funktionen gut abgebildet citeturn29view1 | **AVV zu schmal** im Vergleich zum Produkt |
| Datenarten | Schuldner-, Mandanten-, Fall-, Notiz-, Zahlungs-/Auth-bezogene Daten erkennbar citeturn2view0turn1view0 | Schuldner-/Mandantendaten erwähnt citeturn27view4turn27view5 | Schuldner/Mandanten/Notizen genannt citeturn30view0 | E-Mail, Session-Tokens, Arbeitsdaten, Billing-nahe Daten genannt citeturn29view1turn29view4 | **Nicht vollständig harmonisiert** |
| Verantwortlichkeiten | Anspruchsvoll, aber irreführungsgefährdet | Haftungs- und Verantwortungsverschiebung stark zu Kunden | Processor-Pflichten ordentlich angelegt | Verantwortlichkeit teilweise gut beschrieben | **Systembruch**: Website verspricht viel, Vertrag begrenzt stark |
| Subunternehmer | Nicht prominent auf Produktseiten | Supabase erwähnt citeturn27view4 | Supabase/Resend/Hostinger genannt citeturn30view0 | All-Inkl, Supabase, Resend, Hostinger, GoatCounter, Paddle genannt citeturn25view1turn29view4 | **DS am transparentesten**, AGB/Website dünner |
| Löschung / Export | 30 Tage nach Kündigung, Export erwähnt citeturn1view0 | 30 Tage Kundendaten, 10 Jahre Konto/Billing citeturn28view0 | 30 Tage Löschung + maschinenlesbare Kopie citeturn30view1 | Nutzer kann löschen/exportieren; Speicherdauern nur teils konkret citeturn29view1 | **Grundsätzlich konsistent**, aber Rollen-/Backupthema offen |
| Haftung | „rechtssicher“, „von Anwälten geprüft“ citeturn0view0 | „kein Ersatz für Rechtsberatung“, „keine Gewähr“ citeturn28view0 | kein eigenes Leistungsversprechen | keine Haftungsaussagen als solche | **Starker Widerspruch** zwischen Vertrieb und Vertrag |
| Verfügbarkeit | Cloud-/Support-Nutzen wird verkauft citeturn1view0 | Kein Anspruch auf bestimmte Verfügbarkeit citeturn26view2 | TOMs nennen Verfügbarkeit/Backups citeturn30view1 | Infrastruktur beschrieben, aber keine SLA-Logik citeturn29view1 | **Operativ nicht sauber gespiegelt** |
| Support | E-Mail-/Prioritäts-Support beworben citeturn1view0 | Nur rudimentär indirekt | Kein Supportprozess | Datenzugriffe/Kommunikation technisch beschrieben | **Lücke** |
| KI / Automatisierung | Automatisierung ja; KI nicht ausdrücklich gefunden citeturn2view1turn2view0 | Keine KI-Regel | Keine KI-Regel | Keine KI-Regel | `[KI-EINSATZ UNKLAR]` |
| Vertragslaufzeit / Kündigung | Monatlich kündbar, 30 Tage Zugriff nach Kündigung citeturn1view0 | Entspricht der Produktkommunikation weitgehend citeturn28view0 | Ende des Auftrags mit 30-Tage-Löschung citeturn30view1 | Kontolöschung/Export genannt citeturn29view1 | **Im Kern konsistent** |

### Konkrete Änderungsempfehlungen

#### Sofort

| Aufgabe | Bereich | Begründung |
|---|---|---|
| AVV-Parteienklausel vollständig neu einziehen | AVV | Der Auftragsverarbeiter ist derzeit nicht sauber identifiziert. |
| Resend-Abschnitt in der Datenschutzerklärung korrigieren | Datenschutz | EU-Versandregion ist nicht dasselbe wie US-Datenresidenz; derzeit materiell unklar/falsch. |
| Marketing-Claims „rechtssicher“, „DSGVO-konform“, „kein Server/keine Cloud“ neu kalibrieren | Website / AGB / Datenschutz | Höchstes Widerspruchs- und Erwartungsrisiko. |
| Preis-/Steuerdarstellung an Paddle-MoR-Modell angleichen | Preise / AGB / Datenschutz | Derzeit widersprüchlich und potenziell irreführend. |
| AVV-Transferklausel zu SCC-Modulen prüfen und korrigieren | AVV | Modul-2-Verweis wirkt im Subprocessor-Kontext falsch. |

#### Kurzfristig

| Aufgabe | Bereich | Begründung |
|---|---|---|
| B2B-only-Strategie entscheiden und sichtbar umsetzen | Website / AGB / Checkout | AGB und UX laufen derzeit auseinander. |
| Rollenmodell „Verantwortlicher vs Auftragsverarbeiter“ explizit machen | Datenschutz / AVV / AGB | Das ist der Kern für Nachvollziehbarkeit und Wirksamkeit. |
| Support-, Verfügbarkeits- und Wartungsregeln ergänzen | AGB | Für Professional-Pläne und Kanzleien kommerziell wichtig. |
| Vertraulichkeitsklausel und berufsrechtliche Schutzarchitektur ergänzen | AGB / AVV | Zielgruppe Kanzleien verlangt mehr als Standard-Datenschutzrecht. |
| Data-breach-Klausel „unverzüglich“ statt „72h“ | AVV | Art. 33-Logik sauber abbilden. |

#### Mittelfristig

| Aufgabe | Bereich | Begründung |
|---|---|---|
| TOMs in eigene Anlage / Trust-Anhang auslagern | AVV | Bessere Auditierbarkeit und Updatefähigkeit. |
| Datenklassen-/Löschmatrix bauen | Datenschutz / AGB / AVV | Damit Export, Retention und Rollen sauber zusammenpassen. |
| Rechtstexte als Release-Objekte versionieren | Governance | Für künftige Produktänderungen, gerade im Changelog-getriebenen Setup, sehr hilfreich. |
| ODR-/Schlichtungstexte aktualisieren | Impressum / AGB | Kein großes Risiko, aber veraltet. |

### Fragen für die juristische Finalprüfung

**Geschäftsmodell**

1. Soll fordify **wirklich rein B2B** sein, oder ist die Free-Nutzung faktisch auch für Verbraucher gedacht?
2. Ist fordify nur ein Rechen-/Dokumentationstool oder soll das Produkt bewusst als „rechtssicheres“ Arbeitsmittel positioniert werden?

**Vertragspartner**

1. Bleibt der Softwarevertrag immer mit **entity["people","Jens Wittern","fordify operator"]** bestehen, während Paddle nur Reseller/Merchant of Record für Payment ist?
2. Soll der AVV als eigenständiger Vertrag oder als in den Checkout integrierter Annex geführt werden?

**Zielgruppe**

1. Sind Kanzleien Kernzielgruppe oder nur ein Segment neben Forderungsmanagement in Unternehmen?
2. Soll die Nutzung durch Inkassodienstleister, Solo-Selbständige oder Einzelunternehmer explizit erfasst werden?

**Zahlungsmodell**

1. Wie soll die Steuerlogik exakt lauten, wenn Paddle Merchant of Record ist?
2. Sollen Preise netto, brutto oder „je nach Steuerland durch Paddle“ ausgewiesen werden?

**Datenverarbeitung**

1. Welche Daten werden pro Tarif tatsächlich verarbeitet: nur Fall-/Schuldnerdaten oder auch Kundenmitarbeiter-/Mandanten-/Meta-/Log-Daten?
2. Gibt es Supportfälle mit echtem Inhaltsdatenzugriff durch den Betreiber?

**Hosting und Subunternehmer**

1. Welche Dienste sind produktiv verbindlich im Stack: All-Inkl, Supabase, Resend, Hostinger, GoatCounter?
2. Gibt es weitere Dienstleister für Monitoring, Error-Logging, Backups oder CDN? `[SUBUNTERNEHMER UNKLAR]`

**KI / Automatisierung**

1. Wird heute oder perspektivisch KI für Textvorschläge, Dokumentgenerierung, Auswertung oder Support eingesetzt?
2. Falls nein: Soll das in den Rechtstexten ausdrücklich verneint oder offen gehalten werden? `[KI-EINSATZ UNKLAR]`

**Support und Verfügbarkeit**

1. Welche Supportzeiten und Antwortzeiten sollen Pro- und Business-Kunden real erwarten dürfen?
2. Gibt es interne SLA-Ziele oder nur Best Effort? `[VERFÜGBARKEIT UNKLAR]`

**Löschung und Datenexport**

1. Welche Daten erhalten Kunden nach Kündigung exakt zurück: nur Fälle oder auch Notizen, Adressbücher, Einstellungen, PDF-Assets?
2. Wie lange verbleiben Backups/Logs technisch nach Löschung?

**Haftung und Leistungsgrenzen**

1. Soll an starken Vertriebsclaims festgehalten werden, obwohl AGB Richtigkeit/Haftung massiv begrenzen?
2. Wie weit will fordify gegenüber Kanzleien Verantwortung für Aktualität, Rechenlogik und Rechtsdaten tatsächlich übernehmen?

### Empfohlene nächste Schritte

1. **Zuerst korrigieren**: AVV-Parteien, Resend-Drittlandtext, Preis-/Steuerlogik, B2B-Abgrenzung und die großen Website-Claims. Das sind die Punkte mit dem höchsten Hebel und dem größten Eskalationspotenzial. citeturn26view3turn29view2turn1view0turn28view0  
2. **Juristisch neu formulieren** sollten vor allem der **AVV insgesamt** sowie die **AGB-Kapitel zu Zielgruppe, Preisänderung, Verfügbarkeit, Vertraulichkeit, Haftung und Berufsrecht**. Hier lohnt kein Text-Pflaster; hier braucht es eine stringente Vertragslogik. citeturn28view0turn30view1  
3. **Vom Betreiber nachzuliefern** sind: finale B2B-Entscheidung, exakter Tech-Stack, Subprocessor-Liste, Supportmodell, Datenklassen, Lösch-/Backupkonzept, Rollenmodell und MoR-Steuerlogik. Ohne diese Informationen bleibt jede juristische Endfassung an mehreren Stellen spekulativ. `[B2B/B2C-STATUS UNKLAR]` `[SUBUNTERNEHMER UNKLAR]` `[LÖSCHKONZEPT FEHLT]` `[DATENEXPORT UNKLAR]`  
4. **Vor Launch oder kommerziellem Einsatz kritisch** sind: jede Aussage zur Rechtssicherheit/DSGVO-Konformität, jede Klausel zur Auftragsverarbeitung, jede Drittlandangabe zu Resend/Supabase und jede Preis-/Steuerkommunikation im Checkout. Das sind die Stellen, an denen Erwartung, Wirksamkeit und Compliance direkt zusammenstoßen. citeturn0view0turn1view0turn29view2turn30view0  
5. **Später optimierbar** sind: ODR-/Schlichtungstexte, redaktionelle Straffung, Auslagerung der TOMs in einen Anhang, Versionierung im Changelog und eine kleine Trust-/Compliance-Seite. Das sind sinnvolle Reifegrad-Schritte, aber nicht die ersten Brandherde. citeturn27view6turn2view1