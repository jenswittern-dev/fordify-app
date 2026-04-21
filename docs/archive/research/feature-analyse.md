# Fordify – Feature-Analyse & Entscheidungsgrundlage

**Stand:** April 2026  
**Quellen:** zv-assistent.de (Feldrecherche), konkurrenzanalyse.md, machbarkeitsstudie.md  
**Zweck:** Konsolidierte Entscheidungsgrundlage für Feature-Priorisierung vor Überführung in ROADMAP.md

---

## 1. Kontext

Fordify ist laut Machbarkeitsstudie perspektivisch kein reines Kanzlei-Inhouse-Tool, sondern soll zur **funktional vollständigsten Web-Forderungssoftware** ausgebaut werden (6-Monats-Ziel lt. Machbarkeitsstudie). Die Zielgruppe umfasst Anwaltskanzleien, KMU, Gerichtsvollzieher und perspektivisch jeden, der § 367 BGB-konforme Forderungsaufstellungen erstellt.

Alle Features werden nach folgendem Schema bewertet:

- **Empfehlung:** Umsetzen / Diskutieren / Zurückstellen / Ablehnen
- **Aufwand:** Gering / Mittel / Hoch / Sehr hoch
- **Zielgruppe:** Breit (alle Nutzer) / Mittel (häufiger Anwendungsfall) / Nische (Spezialfall)

---

## 2. Neue Features aus zv-assistent.de-Analyse

*Diese Features wurden durch die Feldrecherche am 15.04.2026 identifiziert und waren in der Konkurrenzanalyse noch nicht erfasst.*

### Z1 – Fester Zinssatz (z.B. 10 % p.a.)

**Was:** Neben „Prozentpunkte über Basiszins" auch einen fixen Zinssatz eintragen können (z.B. vertraglich vereinbarte 10 % p.a.).  
**Warum wichtig:** Viele gewerbliche Verträge (Darlehen, Lieferantenverträge) vereinbaren einen festen Zinssatz. Fordify kann solche Forderungen aktuell nicht korrekt abbilden — der Nutzer müsste manuell einen Annäherungswert berechnen. Das ist ein echter Fehlanwendungsfall.  
**Aufwand:** Mittel — Toggle im Zinsformular, eigener Berechnungspfad in `zinsen.js` (fester Satz ist rechnerisch einfacher als Basiszinssatz-Lookup).  
**Zielgruppe:** Breit.  
**Empfehlung:** ✅ **Umsetzen**

---

### Z2 – Zinsen auf titulierte Kosten

**Was:** Zu jeder Kostenposition (z.B. KFB) kann eine eigene Zinsperiode eingetragen werden.  
**Warum wichtig:** LawFirm hat das explizit als Feature für „Zinsen für festgesetzte und titulierte Kosten". In der Praxis kommt vor, dass ein KFB selbst Zinsen trägt.  
**Aufwand:** Hoch — berührt Datenstruktur, `verrechnung.js`, `baueSummaryTabelle()` und die Darstellung erheblich. Kosten-Positionen bräuchten ein optionales Zins-Kind.  
**Zielgruppe:** Mittel (kommt vor, aber nicht der Standardfall).  
**Offene Frage:** Wie häufig ist das in der Praxis? Braucht Andreas das aktiv?  
**Empfehlung:** 🔶 **Diskutieren** — erst Praxisrelevanz klären, dann einplanen.

---

### Z3 – Restforderung / Teilforderung als Ausgangsbetrag

**Was:** Beim Anlegen einer Hauptforderung kann der Nutzer direkt angeben, dass es sich nur um eine Rest- oder Teilforderung handelt (weil Zahlungen schon vor Fordify-Nutzung erfolgt sind).  
**Warum wichtig:** Wer einen laufenden Fall mit Vorgeschichte übernimmt, muss aktuell alle Vorjahres-Zahlungen manuell erfassen. Eine „Startrestschuld"-Eingabe würde das abkürzen.  
**Aufwand:** Gering–Mittel — optionales Feld an der HF, das den Rechenstart auf diesen Betrag setzt. Keine Änderung an der Verrechnungslogik.  
**Zielgruppe:** Mittel (relevant beim Übergang aus anderem System oder nach außergerichtlicher Einigung).  
**Empfehlung:** ✅ **Umsetzen**

---

### Z4 – Säumniszuschläge als eigene Positionsart

**Was:** Eine eigene Positionsart „Säumniszuschlag" (z.B. nach § 24 SGB IV für Sozialversicherungsgläubiger, oder vertraglich vereinbart).  
**Warum wichtig:** Für Sozialversicherungsträger, Finanzämter und manche gewerbliche Verträge gibt es eigene Zuschlagslogiken. zv-assistent.de nennt Säumniszuschläge neben Zinsen als eigene Kategorie.  
**Aufwand:** Gering — eine neue Positionsart ähnlich einer freien Kostenposition. Falls Berechnung (1 % pro angefangenem Monat nach § 24 SGB IV) automatisiert werden soll: Mittel.  
**Zielgruppe:** Nische — relevant für Sozialversicherungsträger, Finanzämter, bestimmte Gewerbeverträge. Für reine Anwaltskanzleien eher selten.  
**Offene Frage:** Ist das für Fordify-Nutzer relevant, oder sind das Spezialisten mit eigener Software?  
**Empfehlung:** 🔶 **Diskutieren** — bei breiter Zielgruppe ja, aber erst Klarheit ob die Nutzer das brauchen.

---

### Z5 – Explizite Kostenkategorien (Mahnverfahren / vorgerichtlich / KFB)

**Was:** Beim Anlegen einer Kostenposition kann der Nutzer eine Kategorie wählen: „Kosten des Mahnverfahrens (im VB)", „Titulierte vorgerichtliche Kosten", „Festgesetzte Kosten (KFB)", „Vollstreckungskosten § 788 ZPO", „Sonstige".  
**Warum wichtig:** Das ZV-Formular unterscheidet diese Kategorien explizit. Ein Anwalt, der Fordify für die Forderungsaufstellung im Vollstreckungsauftrag nutzt, muss die Kosten korrekt zuordnen. Aktuell sind alle Kosten gleichwertig.  
**Aufwand:** Gering — Dropdown/Label an der Kostenposition, beeinflusst nur Bezeichnung und Tabellendarstellung.  
**Zielgruppe:** Breit — jeder der Forderungsaufstellungen für ZV erstellt.  
**Empfehlung:** ✅ **Umsetzen**

---

### Z6 – Rückständiger Unterhalt / Renten nach § 850d ZPO

**Was:** Eine eigene Forderungskategorie „Rückständiger Unterhalt / Rente aus Körperverletzung" mit Personenangaben (Name, Vorname, Geburtsdatum) und Zeitraum (von/bis).  
**Warum wichtig:** Im ZV-Formular ist das eine eigene Rubrik (Abschnitt II). Betrifft Unterhaltsrecht und Personenschadenrecht.  
**Aufwand:** Hoch — eigene Positionsart mit abweichendem Datenmodell und Darstellung.  
**Zielgruppe:** Nische — primär Familienrecht und Personenschadenrecht. Für allgemeine Forderungsaufstellungen nach § 367 BGB nicht relevant.  
**Empfehlung:** ⏸ **Zurückstellen** — erst wenn Fordify aktiv von Familien- oder Personenschadensrechtlern genutzt wird. Kaum Aufwand-Nutzen-Verhältnis für die Kernzielgruppe.

---

## 3. Bestehende Features aus Konkurrenzanalyse (noch nicht umgesetzt)

*Stand konkurrenzanalyse.md, ergänzt um aktuelle Bewertung.*

### Priorität 1 – Hoher Nutzen, geringer Aufwand

| ID | Feature | Bewertung | Empfehlung |
|---|---|---|---|
| P1.1 | **§ 288 Abs. 5 BGB – 40-€-Inkassopauschale** | Standard in jedem Verzugszinsrechner. Einfache Checkbox bei B2B-HF. | ✅ Umsetzen |
| P1.2 | **Verjährungswarnung für Zinsen** | § 197 BGB: Zinsen verjähren in 3 Jahren. Hinweis bei alten Zinspositionen. Alleinstellungsmerkmal. | ✅ Umsetzen |
| P1.3 | **Negativer Basiszinssatz (2012–2022)** | Muss korrekt behandelt werden (0 % floor oder echte negative Anzeige). Prüfen ob aktuell schon korrekt. | 🔍 Prüfen ob bereits korrekt |
| P1.4 | **Art. 229 § 34 EGBGB Übergangshinweis** | Hinweis bei Forderungen vor 29.07.2014 (andere Zinssätze). Kleines Info-Icon genügt. | ✅ Umsetzen |

### Priorität 2 – Erheblicher Nutzen, mittlerer Aufwand

| ID | Feature | Bewertung | Empfehlung |
|---|---|---|---|
| P2.1 | **Wiederkehrende Buchungen** | Sehr hoher Praxiswert bei Miet- und Ratenforderungen. Echter Schmerzpunkt bei manueller Einzeleingabe. | ✅ Umsetzen |
| P2.2 | **Zukunfts-Zahlungsplan** | „Bei X €/Monat: wann schuldenfrei?" – Alleinstellungspotenzial im Browser-Segment. | ✅ Umsetzen |
| P2.3 | **GKG-Streitwertrechner** | ~~Fehlend~~ **Bereits implementiert in Fordify.** | ✅ Erledigt |
| P2.4 | **PKH-Abrechnung** | Prozesskostenhilfe-Mandate häufig in Kanzleien. Hoher Aufwand, aber klarer Mehrwert. | 🔶 Diskutieren |
| P2.5 | **Mehrere Zinsmethoden** | 30/360 (Standard), act/365, act/360. Für Darlehens-/Handelsrecht relevant. | ✅ Umsetzen |

### Priorität 3 – Nischenbedarf

| ID | Feature | Bewertung | Empfehlung |
|---|---|---|---|
| P3.1 | **§ 497 BGB Verbraucherkredit** | Andere Verrechnungsreihenfolge für Darlehen. Zielgruppen-Erweiterung nötig. | ⏸ Zurückstellen |
| P3.2 | **§ 24 SGB IV Säumniszuschläge** | Nur für Sozialversicherungsträger. Enge Nische. (Vgl. Z4 oben) | ⏸ Zurückstellen |
| P3.3 | **USt-Abzugsfähigkeit bei RVG** | Wenn Mandant vorsteuerabzugsberechtigt ist, keine USt als Kostenforderung. | 🔶 Diskutieren |
| P3.4 | **Mehrere Gläubiger / Schuldner** | Für Streitgenossenschaften. Erhebliche Komplexität. | ⏸ Zurückstellen |
| P3.5 | **ZV-Auftrag-Generierung** | Nächster Workflow-Schritt nach Forderungsaufstellung. Sehr hoher Aufwand, aber Alleinstellungsmerkmal. | 🔶 Diskutieren (langfristig) |

---

## 4. Zusammenfassung nach Empfehlung

### ✅ Umsetzen (Konsens, kein Klärungsbedarf)

| ID | Feature | Aufwand |
|---|---|---|
| Z1 | Fester Zinssatz (z.B. 10 % p.a.) | Mittel |
| Z3 | Restforderung als Ausgangsbetrag | Gering |
| Z5 | Explizite Kostenkategorien | Gering |
| P1.1 | 40-€-Inkassopauschale § 288 Abs. 5 | Gering |
| P1.2 | Verjährungswarnung Zinsen § 197 | Mittel |
| P1.4 | Übergangshinweis Art. 229 § 34 EGBGB | Gering |
| P2.1 | Wiederkehrende Buchungen | Mittel |
| P2.2 | Zukunfts-Zahlungsplan | Mittel |
| P2.5 | Mehrere Zinsmethoden (30/360 etc.) | Gering–Mittel |

### 🔶 Diskutieren (Klärungsbedarf vor Entscheidung)

| ID | Feature | Offene Frage |
|---|---|---|
| Z2 | Zinsen auf titulierte Kosten | Wie häufig in der Praxis? Andreas direkt fragen. |
| Z4 | Säumniszuschläge als Positionsart | Für welche Zielgruppe konkret? Sozialversicherungsträger oder auch Anwälte? |
| P2.4 | PKH-Abrechnung | Ist PKH ein häufiger Fall bei Fordify-Nutzern? |
| P3.3 | USt-Abzugsfähigkeit RVG | Wie groß ist der Anteil vorsteuerabzugsberechtigter Mandanten? |
| P3.5 | ZV-Auftrag-Generierung | Langfristige Strategie: Fordify als ZV-Workflow-Tool? |

### ⏸ Zurückstellen (wenig Aufwand-Nutzen-Verhältnis für Kernzielgruppe)

| ID | Feature | Begründung |
|---|---|---|
| Z6 | Rückständiger Unterhalt § 850d | Nische Familienrecht, hohes Aufwand |
| P3.1 | § 497 BGB Verbraucherkredit | Zielgruppen-Erweiterung erforderlich |
| P3.2 | § 24 SGB IV Säumniszuschläge | Sehr enge Nische |
| P3.4 | Mehrere Gläubiger/Schuldner | Hohe Komplexität, selten gebraucht |

### 🔍 Prüfen (technische Klärung nötig)

| ID | Feature | Klärung |
|---|---|---|
| P1.3 | Negativer Basiszinssatz | Fordify aktuell testen: sind Zinsen 2012–2022 korrekt (0 % floor)? |

---

## 5. Empfohlene Umsetzungsreihenfolge (nach Entscheidung)

**Welle 1** (schnelle Wins, geringe Komplexität):
Z5 → P1.1 → P1.4 → Z3 → P1.2

**Welle 2** (mittlere Komplexität, hoher Praxiswert):
Z1 → P2.5 → P2.1 → P2.2

**Welle 3** (nach Klärung der offenen Fragen):
Z2, Z4, P2.4, P3.3 nach Entscheidung

---

*Nächster Schritt: Offene Fragen (🔶) klären, dann Features aus „✅ Umsetzen" in `docs/ROADMAP.md` einpflegen.*
