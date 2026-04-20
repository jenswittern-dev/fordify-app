# Machbarkeitsstudie – Review & Konkretisierung

**Datum:** 2026-04-20  
**Letzte Aktualisierung:** 2026-04-20 (v2 – Entscheidungen eingearbeitet)  
**Status:** Arbeitsdokument – offene Punkte mit ⚠️ markiert  
**Basis:** docs/machbarkeitsstudie.md (Version 2.0, April 2026)

---

## Gesamtbewertung

Die Machbarkeitsstudie ist fundiert. Stack-Entscheidungen (Supabase, Paddle, Magic Link), Rechtsanalyse, Datenbankschema und die Drei-Stufen-Strategie (Werkzeug → Produkt → Plattform) sind tragfähig.

**Änderungen gegenüber der ursprünglichen Studie:**
1. Freemium-Modell: PDF-Export bleibt kostenlos (inkl. Logo) – entschieden
2. Gesellschaftsform: GbR ausgeschlossen, UG (haftungsbeschränkt) empfohlen – ⚠️ zu entscheiden
3. Infrastruktur: All-Inkl (Webhosting) + bestehendes Hostinger-N8N nutzen – kein Zusatzaufwand
4. Kostenphilosophie: bis Proof of Concept möglichst 0 € laufende Zusatzkosten

---

## 1. Freemium-Modell – ENTSCHIEDEN

### Entscheidung

> **PDF-Export ist kostenlos – inklusive Kanzlei-Logo und vollem Funktionsumfang.**  
> Der Gate ist ausschließlich die **Speicherung** (Cloud-Konto) und die **Wiederholbarkeit** (Impressum, Kanzlei-Profil, Fälle dauerhaft verfügbar).

### Strategische Begründung

Das Ziel ist, dass potenzielle Kunden den vollen Funktionsumfang erleben – Qualität und Beeindruckung kommen vor Conversion-Optimierung. Der Schmerz entsteht nicht beim ersten Export, sondern beim zweiten Mal:

- Der Fall ist weg (sessionStorage → Tab schließen → Datenverlust)
- Das Impressum muss wieder eingetippt werden
- Das Logo muss wieder hochgeladen werden
- Die Kanzlei-Einstellungen sind nicht gespeichert

Das ist ein **weicherer, aber nachhaltigerer Upgrade-Druck** als ein Export-Gate. Es erzeugt keine Frustration im Moment der Nutzung – stattdessen wächst der Wunsch nach Komfort mit jeder Wiederholung.

**Zusatzeffekt:** Jedes exportierte PDF ist ein kostenloser Marketing-Kanal. Mandanten, Gegenseite, Gericht – alle sehen „erstellt mit fordify.de".

### Feature-Matrix (final)

| Feature | Free (Session) | Pro (29 €/M) | Kanzlei (79 €/M) |
|---|---|---|---|
| Alle Berechnungen (Zinsen, RVG, GKG) | ✅ | ✅ | ✅ |
| Forderungsaufstellung (vollständig) | ✅ | ✅ | ✅ |
| PDF-Export mit Logo | ✅ voll | ✅ voll | ✅ voll |
| Drucken | ✅ | ✅ | ✅ |
| **Speicherung (Cloud, dauerhaft)** | ❌ sessionStorage | ✅ | ✅ |
| **Kanzlei-Profil + Logo dauerhaft** | ❌ neu eingeben | ✅ gespeichert | ✅ gespeichert |
| **Impressum dauerhaft gespeichert** | ❌ neu eingeben | ✅ gespeichert | ✅ gespeichert |
| **Excel / CSV-Export** | ❌ | ✅ | ✅ |
| **JSON-Import / -Export** | ❌ | ✅ | ✅ |
| **Fallvorlagen** | ❌ | ✅ | ✅ |
| **Schuldner-Adressdatenbank** | ❌ | ❌ | ✅ |
| **Mehrere Nutzer (bis 5)** | ❌ | ❌ | ✅ |
| **Teamweit geteilte Vorlagen** | ❌ | ❌ | ✅ |
| **Marktplatz: Listing einstellen** | ❌ | ✅ | ✅ |
| Support | Community | E-Mail | Priority |

### Free-Tier-Kommunikation in der App

Ein dezenter, dauerhafter Banner beim App-Start (kein Modal, keine Störung):

> *„Testversion – Daten werden beim Schließen des Tabs gelöscht. [Kostenloses Konto erstellen] oder [14 Tage Pro testen]"*

Wichtig: keine versteckte Friction, keine Überraschung. Der Nutzer weiß von Anfang an, was er hat.

---

## 2. ⚠️ Gesellschaftsform – Entscheidung offen

### Ausgangslage

- GbR ist ausgeschlossen (unbeschränkte persönliche Haftung beider Gesellschafter)
- Ziel: beschränkte Haftung, minimale Gründungskosten, keine großen Anfangsinvestitionen
- Zwei Gründer: Jens (Tech) + Andreas (Recht / Anwalt)

### Überblick relevanter Rechtsformen

#### Option A: UG (haftungsbeschränkt) – Empfehlung

Die Unternehmergesellschaft ist die „Mini-GmbH" mit beschränkter Haftung.

**Vorteile:**
- Beschränkte Haftung (wie GmbH) – kein privates Risiko
- Stammkapital: theoretisch ab 1 €, praktisch empfohlen 500–1.000 € (je 250–500 € pro Gründer)
- Gründungskosten: ~500–1.200 € (Notargebühren ~300–500 €, Handelsregistereintragung ~150–300 €)
- Schnelle Gründung: 2–4 Wochen bis Eintragung
- Alle Business-Dienste (Paddle, Supabase, Resend) akzeptieren UG problemlos
- Kann später in GmbH umgewandelt werden, wenn Rücklagen 25.000 € erreichen

**Nachteile / Pflichten:**
- **25%-Rücklagenpflicht:** 25 % des Jahresgewinns müssen zurückgelegt werden, bis 25.000 € Rücklage erreicht (für spätere GmbH-Umwandlung)
- Buchführungspflicht (EÜR oder Bilanz je nach Größe)
- Handelsregistereintragung → öffentlich einsehbar
- Kein Gewerbeschein nötig (Handelsregister ersetzt ihn), aber Gewerbeanmeldung beim Ordnungsamt erforderlich
- Körperschaftsteuer (15 %) + Gewerbesteuer + Solidaritätszuschlag auf Gewinne

**Typische Gründungskosten UG:**
| Position | Kosten |
|---|---|
| Notargebühren (Musterprotokoll möglich) | ~200–500 € |
| Handelsregistereintragung (Amtsgericht) | ~150–300 € |
| Stammkapital (Einlage) | 500–1.000 € (verbleibt im Unternehmen) |
| Steuerberater Erstberatung (empfohlen) | ~200–400 € |
| **Gesamt** | **~1.000–2.200 €** |

#### Option B: GmbH

**Nicht empfohlen für den Start.**
- 25.000 € Stammkapital (mind. 12.500 € bei Gründung einzuzahlen)
- Notarkosten ~1.000–2.000 €
- Gesamtgründungskosten ~3.000–5.000 €
- Zu hohe Einstiegshürde ohne Proof of Concept

#### Option C: PartG mbB (Partnerschaftsgesellschaft mit beschränkter Berufshaftung)

**Eingeschränkt geeignet.**
- Speziell für freie Berufe (Rechtsanwälte qualifizieren sich)
- Kein Stammkapital nötig, günstige Gründung (~200–400 €)
- Beschränkte Haftung für berufliche Fehler (nicht für alle Verbindlichkeiten)
- **Problem:** Nur Angehörige freier Berufe können Partner sein. Jens als Softwareentwickler qualifiziert sich möglicherweise nicht als freiberuflicher Partner – Klärung nötig
- **Problem:** Erfordert Berufshaftpflichtversicherung (erhöhte laufende Kosten)
- Würde das Geschäftsmodell auf „Rechtsdienstleistungen" eingrenzen – unpassend für ein Softwareprodukt

#### Option D: Einzelunternehmen / Freiberufler

**Nicht geeignet** für eine Zusammenarbeit zweier Gründer als Gesellschaft. Nur für Solobetrieb.

### Empfehlung: UG (haftungsbeschränkt)

**Begründung:**
1. Geringste Gründungskosten bei echter Haftungsbeschränkung
2. Flexibel für Softwareprodukt (keine Beschränkung auf freie Berufe)
3. Alle benötigten Business-Services (Paddle, Supabase, Bankverbindung) funktionieren problemlos
4. Paddle-Onboarding: UG wird als Unternehmen akzeptiert (Handelsregisternummer + USt-ID genügen)
5. Upgrade zu GmbH möglich, sobald wirtschaftlich sinnvoll

**Aufteilung:** 50/50 Gesellschafterstruktur (je 50 % Stammkapital) – einfachste Lösung für zwei gleichberechtigte Gründer.

**Achtung:** Andreas als Rechtsanwalt (BRAO) darf Gesellschafter einer UG sein, die Software vertreibt – das ist kein Problem. Eine anwaltliche Tätigkeit über die UG wäre jedoch nur unter bestimmten Voraussetzungen möglich (ggf. separate Abrechnung als Freiberufler). Für Fordify als Softwareprodukt ist das irrelevant.

### ⚠️ Offene Entscheidungen zur Gesellschaftsform

- [ ] UG bestätigen als gewählte Rechtsform
- [ ] Gesellschafteraufteilung klären (50/50 empfohlen)
- [ ] Firmensitz festlegen (Adresse eines Gründers oder virtuelles Büro)
- [ ] Steuerberater für Gründungsberatung beauftragen (1x ~200–400 €)
- [ ] Notar beauftragen (Musterprotokoll für UG-Gründung mit zwei Gesellschaftern möglich)
- [ ] Gewerbeanmeldung nach Eintragung ins Handelsregister
- [ ] Geschäftskonto eröffnen (DKB Business, Commerzbank Business – kostenlos oder günstig)
- [ ] USt-ID beim Finanzamt beantragen (für Paddle Pflicht)

---

## 3. Infrastruktur & Kosten – Kostenoptimiert

### Prinzip: Bestehende Infrastruktur nutzen

| Dienst | Zweck | Bestehend? | Zusatzkosten/M |
|---|---|---|---|
| **All-Inkl** | Webhosting fordify.de | ✅ läuft | 0 € |
| **Hostinger VPS** | N8N bereits installiert | ✅ läuft | 0 € |
| **N8N** | Automatisierungen | ✅ auf Hostinger | 0 € |
| **Supabase** | DB + Auth (Free Tier) | ❌ neu anlegen | 0 € |
| **Resend** | Transaktionale E-Mails (Free: 3k/M) | ❌ neu anlegen | 0 € |
| **GoatCounter** | Analytics (self-hosted auf Hostinger) | ❌ installieren | 0 € |
| **Paddle** | Payment | ❌ UG-Gründung zuerst | % vom Umsatz |

**Laufende Zusatzkosten bis zum ersten Umsatz: 0 €/Monat**

Paddle verursacht erst Kosten, wenn Umsatz fließt (~5 % + 0,50 $ je Transaktion). Supabase Free Tier reicht für 500 MB Daten und 50.000 monatliche Aktive Nutzer – mehr als ausreichend für den MVP.

### Wann werden Upgrades nötig?

| Trigger | Upgrade | Kosten |
|---|---|---|
| >500 MB Datenbankgröße | Supabase Pro | 25 €/M |
| >3.000 E-Mails/Monat | Resend Starter | 20 €/M |
| >500k Seitenaufrufe/M | GoatCounter bleibt kostenlos | 0 € |
| >50.000 MAU | Supabase Pro | 25 €/M |

Diese Trigger werden erst bei signifikantem Wachstum (hunderte zahlende Nutzer) erreicht.

### N8N auf Hostinger – Hinweis

Da N8N bereits auf Hostinger läuft, entfällt der ursprünglich angedachte Hetzner-Server. GoatCounter kann auf dem gleichen Hostinger-Server installiert werden (Docker oder Binary).

**Voraussetzung prüfen:** Hat der Hostinger-Server eine feste IP und öffentlich erreichbare Webhook-URLs? Das ist zwingend für Paddle-Webhooks und Supabase-Webhooks an N8N.

---

## 4. Zahlungsabwicklung – Paddle konkret

### Voraussetzung: Gesellschaftsgründung zuerst

Paddle erfordert eine registrierte Geschäftsadresse, Handelsregisternummer und USt-ID. Der Paddle-Account kann erst nach UG-Eintragung vollständig verifiziert werden.

**Zeitplan:**
1. UG gründen → Handelsregisternummer + USt-ID erhalten (~4–6 Wochen)
2. Paddle-Account anlegen + Unternehmensverifikation (~1–2 Wochen)
3. Parallel: technische Integration entwickeln (Sandbox-Modus)

### Produkte in Paddle

| Produkt-ID | Beschreibung | Preis |
|---|---|---|
| `fordify_pro_monthly` | Pro Monatlich | 29 €/M |
| `fordify_pro_yearly` | Pro Jährlich | 249 €/J |
| `fordify_team_monthly` | Kanzlei Monatlich | 79 €/M |
| `fordify_team_yearly` | Kanzlei Jährlich | 669 €/J |

### Webhook-Flow (technisch)

```
Paddle Event: subscription_created / updated / cancelled
  → Supabase Edge Function (Signatur-Validierung mit Paddle-Secret)
    → subscriptions-Tabelle updaten
    → N8N Webhook aufrufen (für E-Mail-Versand via Resend)
```

**Kritisch:** Paddle-Webhooks müssen mit dem Paddle-Webhook-Secret signaturgeprüft werden, bevor die Edge Function etwas schreibt. Andernfalls ist die Subscription-Tabelle von außen manipulierbar.

---

## 5. Transaktionale E-Mails – Resend

Supabase Auth übernimmt nur den Magic-Link-Versand. Alle anderen transaktionalen E-Mails laufen über Resend + N8N.

### Setup

1. Resend-Account anlegen (kostenlos, 3.000 E-Mails/Monat im Free Tier)
2. Domain `fordify.de` in Resend verifizieren (SPF + DKIM DNS-Einträge bei All-Inkl)
3. Absender: `noreply@fordify.de`
4. Supabase Auth SMTP auf Resend umstellen (eigene Magic-Link-E-Mails mit fordify-Branding)

### E-Mail-Matrix

| Trigger | Betreff | Via |
|---|---|---|
| Neue Registrierung | Magic Link – Jetzt bei fordify einloggen | Supabase Auth → Resend SMTP |
| Erster Login | Willkommen bei fordify | N8N → Resend |
| Trial-Start | Deine 14 Tage Pro haben begonnen | N8N → Resend |
| Trial läuft in 3 Tagen ab | Noch 3 Tage – danach zurück zu Free | N8N Cron → Resend |
| Trial abgelaufen (kein Upgrade) | Dein Test ist abgelaufen | N8N Cron → Resend |
| Zahlung erfolgreich | fordify Pro – Danke für dein Vertrauen | Paddle → N8N → Resend |
| Zahlung fehlgeschlagen | Zahlung fehlgeschlagen – bitte aktualisieren | Paddle → N8N → Resend |
| Dunning Tag 3 | Erinnerung: Zahlung noch offen | N8N Cron → Resend |
| Dunning Tag 7 | Zugang wird gesperrt | N8N Cron → Resend |
| Kündigung | Kündigung bestätigt – Daten bis [Datum] verfügbar | Paddle → N8N → Resend |
| Konto-Löschung | Alle Daten wurden gelöscht | N8N → Resend |
| Wöchentlicher Digest (intern) | fordify Woche: [X] neue Nutzer | N8N Cron → E-Mail an Jens |

### Templates (Pflicht vor Launch)

- [ ] Magic Link (Supabase-Vorlage anpassen mit fordify-Branding)
- [ ] Willkommen
- [ ] Trial-Start + Was ist Pro?
- [ ] Trial-Erinnerung (3 Tage)
- [ ] Trial-Ablauf
- [ ] Zahlungsbestätigung
- [ ] Zahlungsfehlschlag / Dunning (3 Versionen)
- [ ] Kündigung + Offboarding
- [ ] Konto-Löschungsbestätigung

---

## 6. N8N-Automatisierungen (auf bestehendem Hostinger-Server)

### Kernworkflows

**Workflow 1: Paddle → Supabase + E-Mail**
```
Paddle Webhook → Supabase Edge Function
  → Subscriptions-Tabelle updaten
  → N8N Webhook: Trigger E-Mail-Versand (Resend)
```

**Workflow 2: Neuer User (Onboarding)**
```
Supabase DB Webhook: INSERT in auth.users
  → N8N: Willkommens-E-Mail (Resend)
  → N8N: Interne Benachrichtigung an Jens + Andreas
    „Neue Registrierung: [E-Mail], [Kanzlei-Name wenn angegeben]"
```

**Workflow 3: Trial-Management (Cron täglich 08:00)**
```
Supabase Query: subscription.status = 'trialing' AND trial_end = HEUTE + 3 Tage
  → Resend: Trial-Erinnerung

Supabase Query: subscription.status = 'trialing' AND trial_end = HEUTE
  → Resend: Trial abgelaufen
  → Supabase: status auf 'expired' setzen → Feature-Gates aktiv
```

**Workflow 4: Dunning (Cron täglich)**
```
Supabase Query: subscription.status = 'past_due'
  → Berechne Tage seit Fehlschlag
  → Tag 1: Zahlungsfehlschlag-E-Mail
  → Tag 3: Erinnerung
  → Tag 7: Sperrankündigung
  → Tag 14: Konto pausiert (status = 'suspended')
```

**Workflow 5: Wöchentlicher interner Digest (Montag 08:00)**
```
Supabase Query: neue Registrierungen + neue Paid-Accounts letzte 7 Tage
GoatCounter API: Seitenaufrufe letzte Woche, Top-Seiten
  → Resend: Zusammenfassung an Jens + Andreas
```

---

## 7. Analytics – GoatCounter auf Hostinger

### Entscheidung

GoatCounter selbst-gehosted auf dem bestehenden Hostinger-Server (0 € Zusatzkosten).

**Vorteile gegenüber Plausible:**
- Kostenlos (kein 9 €/M)
- Nutzt bestehende Infrastruktur
- Datenschutzkonform ohne Cookie-Banner
- Einfache Installation (Single Binary oder Docker)

### Installation auf Hostinger

```bash
# GoatCounter als Docker-Container
docker run -d --name goatcounter \
  -p 8080:8080 \
  -v goatcounter_data:/data \
  goatcounter/goatcounter:latest \
  serve -listen :8080 -db sqlite+/data/goatcounter.sqlite3
```

Dann Nginx-Reverse-Proxy auf analytics.fordify.de oder intern.

### Tracking-Integration

```html
<!-- In alle HTML-Seiten einfügen, kein Cookie-Banner nötig -->
<script data-goatcounter="https://analytics.fordify.de/count"
        async src="//analytics.fordify.de/count.js"></script>
```

### Was gemessen wird

- Seitenaufrufe pro Seite (welcher Rechner am häufigsten?)
- Referrer (SEO, direkt, LinkedIn, Anwaltsforen)
- Conversion-Events: Registrierung, Trial-Start, Upgrade (als Custom Events)
- Wochen- und Monatstrends

---

## 8. Pricing-Seite (`/preise.html`)

### Inhalt

- **Preis-Toggle:** Jährlich / Monatlich (Jährlich als Standard → zeigt günstigeren Preis)
- **Feature-Vergleichstabelle** (Free / Pro / Kanzlei)
- **Paddle-Checkout-Buttons** direkt auf der Seite
- **Trust-Signale:**
  - „14 Tage Pro kostenlos testen – keine Kreditkarte nötig"
  - „Jederzeit kündbar"
  - „Daten DSGVO-konform in der EU (Frankfurt)"
  - „Von Anwälten entwickelt"
  - „Kein Login für den Einstieg nötig"
- **FAQ-Block** (mind. 5 Fragen):
  - Was passiert mit meinen Daten, wenn ich Free bleibe?
  - Was passiert bei Kündigung mit meinen gespeicherten Fällen?
  - Kann ich von Pro auf Kanzlei wechseln?
  - Welche Zahlungsmethoden werden akzeptiert?
  - Wer stellt die Rechnung aus? (Paddle – mit USt. bzw. Reverse Charge für EU-Unternehmen)

### Technische Integration (Paddle Inline Checkout)

```html
<!-- Nur auf /preise.html laden -->
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>Paddle.Setup({ token: "live_xxxx" });</script>

<!-- Pro monatlich -->
<button class="btn btn-primary" onclick="Paddle.Checkout.open({
  items: [{ priceId: 'pri_fordify_pro_monthly', quantity: 1 }]
})">Pro starten – 29 €/Monat</button>

<!-- Pro jährlich -->
<button class="btn btn-outline-primary" onclick="Paddle.Checkout.open({
  items: [{ priceId: 'pri_fordify_pro_yearly', quantity: 1 }]
})">Pro Jährlich – 249 €/Jahr</button>
```

---

## 9. Rechtliches – Checkliste vor Launch

**Blocker (muss vor Freemium-Launch erledigt sein):**
- [ ] UG gegründet, im Handelsregister eingetragen
- [ ] USt-ID vorhanden (Paddle Pflicht)
- [ ] Geschäftskonto eröffnet
- [ ] AVV mit Supabase abgeschlossen (Supabase Dashboard → Settings → Legal)
- [ ] Nutzungsbedingungen / AGB mit AVV-Klauseln (Anwalt prüfen lassen – nicht Andreas, Interessenkonflikt)
- [ ] Datenschutzerklärung: Account, Supabase, Paddle, Resend, GoatCounter als Drittanbieter
- [ ] Paddle-DPA abgeschlossen
- [ ] Impressum: USt-ID, Handelsregisternummer, vertretungsberechtigter Geschäftsführer
- [ ] Verzeichnis von Verarbeitungstätigkeiten (VVT) anlegen
- [ ] E-Mail-Adresse `datenschutz@fordify.de` einrichten

**Empfohlen (innerhalb 30 Tage nach Launch):**
- [ ] Datenexport-Funktion (Art. 20 DSGVO)
- [ ] Session-Timeout konfigurieren (Supabase JWT-Expiry)
- [ ] Backup-Retention-Policy (≤ 30 Tage in Supabase)
- [ ] Bestandsnutzer mind. 4 Wochen vor Launch über Modellwechsel informieren

---

## 10. Implementierungsreihenfolge

### Voraussetzungen (parallel zur Entwicklung)
- UG-Gründung anstoßen
- Paddle-Account vorbereiten (Sandbox schon heute möglich, live erst nach UG)
- Resend-Account anlegen + Domain verifizieren
- GoatCounter auf Hostinger installieren

### Phase 1: Infrastruktur (1–2 Wochen)
1. Supabase-Projekt anlegen (Region: EU Frankfurt)
2. Datenbankschema deployen + RLS testen (zwei Test-Accounts!)
3. Resend SMTP für Supabase Magic Link konfigurieren
4. GoatCounter auf Hostinger aufsetzen + in alle Seiten einbinden

### Phase 2: Auth + Storage-Abstraktion (2–3 Wochen)
1. `storage.js` – StorageBackend: sessionStorage (Free) vs. localStorage + Supabase (Paid)
2. `auth.js` – Magic Link Login, onAuthStateChange, Session-Management
3. Bestandsnutzer-Migration: Legacy-localStorage → Cloud beim ersten Login

### Phase 3: Feature-Gates + Upgrade-Modal (1–2 Wochen)
1. `requiresPaid()` + Soft-Gate-CSS (PRO-Badge auf gesperrten Features)
2. Upgrade-Modal (Preisübersicht + Paddle-Checkout direkt eingebunden)
3. 14-Tage-Trial-Flow (kein Kreditkarte nötig)
4. Free-Tier-Banner (dezent, dauerhaft sichtbar)

### Phase 4: Paddle-Integration (1–2 Wochen)
1. Supabase Edge Function für Paddle-Webhooks (mit Signatur-Validierung)
2. subscriptions-Tabelle via Webhook befüllen
3. Feature-Unlock nach Zahlung End-to-End testen
4. (Erst live möglich nach UG-Gründung + Paddle-Verifikation)

### Phase 5: N8N-Workflows + E-Mail-Templates (1 Woche)
1. E-Mail-Templates in Resend anlegen (alle aus der E-Mail-Matrix)
2. Onboarding-Workflow (Willkommen, Trial-Start)
3. Trial-Management-Cron
4. Dunning-Sequenz
5. Interner Wochendigest

### Phase 6: Pricing-Seite + Launch-Vorbereitung (1 Woche)
1. `/preise.html` mit Vergleichstabelle + Paddle-Checkout
2. Bestandsnutzer-E-Mail über Modellwechsel
3. End-to-End-Test: Free → Trial → Paid → Kündigung → Datenlöschung
4. Impressum + Datenschutz aktualisieren (UG-Daten, Drittanbieter)

**Gesamt Entwicklung: ~8–11 Wochen**  
**Blockierender Faktor:** UG-Gründung (4–6 Wochen) – parallel anstoßen

---

## 11. Kostenübersicht (Gesamtbild)

### Einmalige Gründungskosten

| Position | Kosten |
|---|---|
| Notar (UG-Gründung) | ~300–500 € |
| Handelsregistereintragung | ~150–300 € |
| Steuerberater Erstberatung | ~200–400 € |
| Stammkapital (verbleibt im Unternehmen) | 500–1.000 € |
| Anwalt AGB-Prüfung | ~300–600 € |
| **Gesamt Einmalig** | **~1.450–2.800 €** |

### Laufende Kosten (bis zu ersten Einnahmen)

| Dienst | Kosten/M |
|---|---|
| All-Inkl (Webhosting) | bereits bezahlt |
| Hostinger VPS (N8N + GoatCounter) | bereits bezahlt |
| Supabase Free Tier | 0 € |
| Resend Free Tier | 0 € |
| Paddle | 0 € (nur % auf Umsatz) |
| **Gesamt laufend zusätzlich** | **0 €** |

### Kosten bei Wachstum

| MRR | Zusätzliche Kosten/M |
|---|---|
| 0–1.000 € | 0 € (alles Free Tier) |
| 1.000–5.000 € | ~50–75 € (Paddle-Fees ~250 €, ggf. Supabase Pro 25 €) |
| 5.000–20.000 € | ~300–1.000 € (Supabase Pro, Resend Paid, ggf. Steuerberater) |

---

## 12. Offene Entscheidungen (Zusammenfassung)

| # | Frage | Empfehlung | Status |
|---|---|---|---|
| 1 | Gesellschaftsform | UG (haftungsbeschränkt) | ⚠️ Entscheiden |
| 2 | Gesellschafteraufteilung | 50/50 | ⚠️ Entscheiden |
| 3 | Firmensitz | Adresse Jens oder Andreas | ⚠️ Entscheiden |
| 4 | AGB-Prüfung: wer? | Externer Anwalt (nicht Andreas) | ⚠️ Organisieren |
| 5 | Freemium-Launch-Termin | Q4 2026 – realistisch nach UG-Gründung | ⚠️ Festlegen |
| 6 | Hostinger: öffentliche Webhook-URL verfügbar? | Prüfen (Pflicht für Paddle + Supabase → N8N) | ⚠️ Prüfen |

---

*Erstellt 2026-04-20 | Aktualisiert 2026-04-20 (v2) | Fordify Interne Planung | Vertraulich*
