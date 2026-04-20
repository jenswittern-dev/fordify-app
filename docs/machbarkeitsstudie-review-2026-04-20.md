# Machbarkeitsstudie – Review & Konkretisierung

**Datum:** 2026-04-20  
**Status:** Entwurf – offene Entscheidungen markiert mit ⚠️  
**Basis:** docs/machbarkeitsstudie.md (Version 2.0, April 2026)

---

## Gesamtbewertung

Die Machbarkeitsstudie ist fundiert. Stack-Entscheidungen (Supabase, Paddle, Magic Link), Rechtsanalyse, Datenbankschema und die Drei-Stufen-Strategie (Werkzeug → Produkt → Plattform) sind tragfähig und können direkt in die Umsetzung überführt werden.

**Offene Punkte dieses Reviews:**
1. Freemium-Abgrenzung (PDF-Export: kostenlos oder Gate?)
2. Zahlungsabwicklung – Paddle konkret
3. Transaktionale E-Mails (fehlt in der Studie)
4. N8N-Automatisierungen
5. Analytics (GoatCounter / Plausible)
6. Pricing-Seite
7. Vollständige Account- und Setup-Liste

---

## 1. ⚠️ Freemium-Abgrenzung – Entscheidung offen

### Ausgangslage (Machbarkeitsstudie)

Die Studie empfahl den **Export als härtesten Gate:**  
> "Nutzer hat 20 Minuten gearbeitet, sieht das perfekte Ergebnis – dann blockiert ein Gate."  
→ Free = kein Speichern + kein Export (PDF, Excel, JSON)

### Neue Überlegung

Jens möchte den **PDF-Export kostenlos lassen.** Paid beginnt erst bei Speicherung, Adressdatenbank und der Members Area (Cloud-Konto).

### Auswirkungsanalyse

| Aspekt | Export als Gate (Studie) | PDF kostenlos (neue Überlegung) |
|---|---|---|
| Conversion-Druck | Sehr stark – maximaler Schmerz im Moment des höchsten Nutzens | Geringer – Haupttrigger entfällt |
| Marketing-Effekt | Neutral | Positiv – jedes PDF ist Fordify-Werbung |
| Gelegenheitsnutzer | Upgraden (wenn sie exportieren wollen) | Bleiben dauerhaft Free ohne Upgrade-Druck |
| Upgrade-Trigger | Export-Gate + Datenverlust | Nur Datenverlust (kein Cloud-Speicher) |
| Markenimage | Kein Wasserzeichen → professionell | Kein Wasserzeichen → professionell |

### Vorgeschlagenes Modell (wenn PDF kostenlos)

**Kniff:** PDF-Export kostenlos, aber **ohne dauerhaften Kanzlei-Logo-Header** (kein Wasserzeichen – das wäre inakzeptabel – aber ein subtiler Professionalisierungs-Pull).

| Feature | Free | Pro (29 €/M) | Kanzlei (79 €/M) |
|---|---|---|---|
| Alle Berechnungen (Zinsen, RVG, GKG) | ✅ | ✅ | ✅ |
| Forderungsaufstellung – Vorschau + PDF | ✅ ohne Logo | ✅ mit Logo | ✅ mit Logo |
| Speicherung (Cloud, dauerhaft) | ❌ sessionStorage | ✅ | ✅ |
| Kanzlei-Profil + Logo dauerhaft | ❌ | ✅ | ✅ |
| Excel / CSV-Export | ❌ | ✅ | ✅ |
| JSON-Import / -Export | ❌ | ✅ | ✅ |
| Fallvorlagen | ❌ | ✅ | ✅ |
| Schuldner-Adressdatenbank | ❌ | ❌ | ✅ |
| Mehrere Nutzer (bis 5) | ❌ | ❌ | ✅ |
| Marktplatz: Listing einstellen | ❌ | ✅ | ✅ |
| Support | Community | E-Mail | Priority |

### ⚠️ Offene Entscheidung

> **Frage:** PDF-Export kostenlos lassen – ja oder nein?  
> Das ist die wichtigste Weichenstellung für den gesamten Implementierungsplan.

---

## 2. Zahlungsabwicklung – Paddle konkret

### Bestätigung der Studienempfehlung

Paddle bleibt die richtige Wahl bis ~50.000 € MRR:
- Merchant of Record → alle USt-Pflichten bei Paddle
- Kein eigenes Backend für Checkout nötig
- B2B-Rechnungen mit Reverse Charge automatisch
- SEPA-Lastschrift verfügbar

### Konkrete Umsetzungsschritte

**Account-Setup (1–2 Wochen Vorlaufzeit einplanen):**
1. Paddle-Account anlegen (paddle.com) – als Unternehmen, nicht "individual"
2. Unterlagen bereitstellen: Gewerbeanmeldung/GbR, Bankverbindung, USt-ID
3. Vier Produkte anlegen:
   - `fordify_pro_monthly` → 29 €/Monat
   - `fordify_pro_yearly` → 249 €/Jahr
   - `fordify_team_monthly` → 79 €/Monat
   - `fordify_team_yearly` → 669 €/Jahr
4. Paddle Sandbox für Entwicklung/Tests (eigene Test-Credentials)
5. Webhook-Endpoint konfigurieren → Supabase Edge Function URL

### Webhook-Flow

```
Paddle Event: subscription_created / updated / cancelled
  → Supabase Edge Function
    → Paddle-Signatur validieren
    → subscriptions-Tabelle updaten
    → N8N-Trigger (für E-Mail-Versand)
```

**Wichtig:** Fordify darf zu keinem Zeitpunkt Zahlungsmittel auf eigenem Konto halten (§ 10 ZAG). Paddle ist der alleinige Zahlungsabwickler.

---

## 3. Transaktionale E-Mails (fehlt in der Studie)

Supabase Auth übernimmt nur den Magic-Link-Versand. Für alle anderen transaktionalen E-Mails ist ein separater Dienst nötig.

### Empfehlung: Resend

- 3.000 E-Mails/Monat kostenlos
- Beste Developer Experience
- Native N8N-Integration (eigener Node)
- Eigene Domain (noreply@fordify.de) einfach verifizierbar
- EU-DSGVO-konform

### E-Mail-Matrix

| Trigger | E-Mail | Versand via |
|---|---|---|
| Registrierung | Magic Link (Login) | Supabase Auth (eigener SMTP konfigurieren) |
| Trial-Start | "14 Tage Pro – was dich erwartet" | N8N → Resend |
| Trial läuft in 3 Tagen ab | Erinnerung | N8N Cron → Resend |
| Zahlung erfolgreich | Bestätigung + Rechnungshinweis | Paddle Webhook → N8N → Resend |
| Zahlung fehlgeschlagen | Dunning-Sequenz (Tag 1, 3, 7) | Paddle Webhook → N8N → Resend |
| Abo-Kündigung | Off-boarding + Daten-Export-Hinweis | Paddle Webhook → N8N → Resend |
| Konto-Löschung | Bestätigung + Löschdatum | N8N → Resend |
| Wöchentlicher Digest (intern) | Analytics-Zusammenfassung für Jens | N8N Cron → Resend / Slack |

### E-Mail-Templates (Pflicht vor Launch)

- [ ] Magic Link (Supabase-Standard anpassen, fordify-Branding)
- [ ] Willkommen (nach erster Registrierung)
- [ ] Trial-Start
- [ ] Trial-Erinnerung (3 Tage vor Ablauf)
- [ ] Zahlungsbestätigung
- [ ] Zahlungsfehlschlag / Dunning
- [ ] Kündigungsbestätigung

---

## 4. N8N-Automatisierungen

### Hosting

**Option A (empfohlen für Start):** Hetzner CX22 (4 €/Monat) mit Docker – N8N + GoatCounter auf einem Server  
**Option B:** n8n.cloud (20 €/Monat) – kein Setup-Aufwand, aber teurer

### Kernworkflows

**Workflow 1: Paddle → DB + E-Mail**
```
Paddle Webhook → Supabase Edge Function (Signatur-Validierung)
  → Supabase: subscriptions updaten
  → N8N: E-Mail-Trigger (Resend)
```

**Workflow 2: Neuer User-Onboarding**
```
Supabase Webhook: neuer User in auth.users
  → N8N: Willkommens-E-Mail (Resend)
  → N8N: Interne Benachrichtigung (Slack / E-Mail an Jens)
    "Neue Registrierung: [E-Mail], [Kanzlei wenn angegeben]"
```

**Workflow 3: Trial-Management (Cron täglich)**
```
N8N Cron 08:00 täglich
  → Supabase Query: Wer hat Trial der heute in 3 Tagen abläuft?
  → Resend: Trial-Erinnerung
  → Supabase Query: Wessen Trial läuft heute ab?
  → Resend: Trial-Ablauf + Upgrade-CTA
```

**Workflow 4: Dunning (Cron täglich)**
```
N8N Cron
  → Supabase Query: subscriptions mit status = 'past_due'
  → Resend: Dunning-E-Mail (gestaffelt nach Tagen seit Fehlschlag)
```

**Workflow 5: Wöchentlicher interner Digest**
```
N8N Cron Montag 08:00
  → GoatCounter API: Seitenaufrufe letzte Woche
  → Supabase: neue Registrierungen, neue Paid-Accounts
  → Resend / Slack: Zusammenfassung an Jens
```

---

## 5. Analytics

### Vergleich

| Tool | Preis | Hosting | Cookie-Banner | DSGVO |
|---|---|---|---|---|
| **GoatCounter** | 0 € (self-host) / 5 $/M SaaS | Self-host oder SaaS | Nein | ✅ |
| **Plausible** | 9 €/M | EU-Server (Cloudflare) | Nein | ✅ |
| **Umami** | 0 € (self-host) | Self-host | Nein | ✅ |
| **Pirsch** | ab 6 €/M | DE-Server | Nein | ✅ |
| Google Analytics 4 | 0 € | US-Server | Ja | ⚠️ |

### Empfehlung

- **GoatCounter self-hosted** wenn ohnehin ein Hetzner-Server für N8N vorhanden ist → kein zusätzlicher Kostenpunkt
- **Plausible** wenn kein eigener Server gewünscht → schönstes Dashboard, 9 €/M

Kein Cookie-Banner nötig bei beiden – wichtig für ein professionelles B2B-Tool.

### Was gemessen werden soll

- Seitenaufrufe pro Seite (welcher Rechner wird wie häufig genutzt?)
- Conversion-Funnel: Rechner → Registrierung → Paid
- Woher kommen Nutzer (Referrer: SEO, direkt, LinkedIn)
- Registrierungen über Zeit
- Upgrade-Ereignisse (via Paddle-Daten)

---

## 6. Pricing-Seite (`/preise.html`)

### Pflichtinhalt

- **Preis-Toggle:** Monatlich / Jährlich (Jahres-Preise als Default anzeigen)
- **Feature-Vergleichstabelle** (drei Spalten: Free / Pro / Kanzlei)
- **Paddle-Checkout-Buttons** direkt eingebunden (kein Redirect)
- **Trust-Signale:**
  - "14 Tage kostenlos testen – keine Kreditkarte"
  - "Jederzeit monatlich kündbar"
  - "Alle Daten DSGVO-konform in der EU gespeichert"
  - "Von Anwälten entwickelt"
- **FAQ-Block** (mind. 5 Fragen):
  - Was passiert mit meinen Daten bei Kündigung?
  - Kann ich von Pro auf Kanzlei wechseln?
  - Gibt es einen Rabatt für größere Kanzleien?
  - Ist die Rechnung umsatzsteuerpflichtig? (Paddle stellt Rechnung)
  - Welche Zahlungsmethoden werden akzeptiert?

### Technische Integration

```html
<!-- Paddle nur auf /preise.html laden -->
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>Paddle.Setup({ token: "live_xxxx" });</script>

<button onclick="Paddle.Checkout.open({
  items: [{ priceId: 'pri_fordify_pro_monthly', quantity: 1 }]
})">Pro starten – 29 €/Monat</button>
```

---

## 7. Vollständige Account- und Setup-Liste

### Benötigte Accounts (vor Implementierungsstart anlegen)

| Dienst | Zweck | Kosten/Monat | Priorität | Account unter |
|---|---|---|---|---|
| **Supabase** | Datenbank + Auth + Storage | 0 € → 25 € (Pro bei >500 MB) | Kritisch | jenswittern@gmail.com |
| **Paddle** | Payment + Rechnungen + USt | % Umsatz (~5 % + 0,50 $/Tx) | Kritisch | Unternehmens-E-Mail |
| **Resend** | Transaktionale E-Mails | 0 € (bis 3.000/M) | Hoch | jenswittern@gmail.com |
| **Hetzner CX22** | VPS für N8N + Analytics | ~4 €/M | Hoch | bestehend? |
| **N8N** (self-host) | Automatisierungen | 0 € | Hoch | auf Hetzner |
| **GoatCounter** (self-host) | Analytics | 0 € | Mittel | auf Hetzner |
| **Custom E-Mail** | noreply@fordify.de | im Hosting enthalten? | Hoch | Jens |

### Technische Voraussetzungen vor Launch

**Supabase:**
- [ ] Projekt erstellen (Region: EU Frankfurt)
- [ ] Supabase DPA akzeptieren (Settings → Legal) + Screenshot dokumentieren
- [ ] Datenbankschema anlegen (siehe Machbarkeitsstudie Kap. 8.6)
- [ ] RLS für alle Tabellen aktivieren + mit zwei Test-Accounts testen
- [ ] `service_role` Key niemals im Frontend verwenden (nur `anon` Key)
- [ ] AVV-DPA Link für Kanzlei-AGB vorbereiten

**Paddle:**
- [ ] Account anlegen + Unternehmensverifikation (Gewerbeanmeldung, Bankverbindung, USt-ID)
- [ ] Vier Produkte/Preise anlegen
- [ ] Sandbox-Modus für Entwicklung konfigurieren
- [ ] Webhook-Endpoint registrieren
- [ ] Paddle-DPA abschließen (in Paddle-Dashboard)

**Resend:**
- [ ] Account anlegen
- [ ] Domain `fordify.de` verifizieren (DNS-Einträge)
- [ ] Absender-Adresse `noreply@fordify.de` einrichten
- [ ] E-Mail-Templates anlegen

**N8N:**
- [ ] Hetzner VPS aufsetzen (Docker)
- [ ] N8N installieren und absichern (Basic Auth / HTTPS via Nginx)
- [ ] Webhook-URLs für Paddle-Events konfigurieren

**Analytics:**
- [ ] GoatCounter / Plausible aufsetzen
- [ ] Tracking-Script in alle HTML-Seiten einbinden (kein Cookie-Banner nötig)
- [ ] Conversion-Ziele definieren: Registrierung, Checkout-Start, Checkout-Abschluss

---

## 8. Rechtliches – Offene Punkte vor Launch

Aus der Machbarkeitsstudie übernommen, priorisiert:

**Blocker (muss vor Freemium-Launch erledigt sein):**
- [ ] AVV mit Supabase abgeschlossen und dokumentiert
- [ ] Nutzungsbedingungen / AGB mit AVV-Klauseln für Schuldnerdaten (Anwalt prüfen lassen)
- [ ] Datenschutzerklärung aktualisiert: Account, Supabase, Paddle, Resend als Drittanbieter
- [ ] Paddle-DPA abgeschlossen
- [ ] Impressum: USt-ID eintragen (bei gewerblicher Tätigkeit Pflicht)
- [ ] Verzeichnis von Verarbeitungstätigkeiten (VVT) anlegen
- [ ] E-Mail-Adresse datenschutz@fordify.de einrichten

**Empfohlen vor Launch:**
- [ ] Anwaltliche Kurzprüfung der AGB (ein Anwalt der nicht Andreas ist – Interessenkonflikt?)
- [ ] Bestandsnutzer mind. 4 Wochen vor Launch über Modellwechsel informieren

---

## 9. Implementierungsreihenfolge (Vorschlag)

### Phase 1: Infrastruktur (1–2 Wochen)
1. Supabase-Projekt anlegen, Schema deployen, RLS testen
2. Resend-Account, Domain verifizieren, Magic-Link-SMTP konfigurieren
3. Paddle-Account anlegen (Verifikation kann parallel laufen)
4. Hetzner VPS: N8N + GoatCounter aufsetzen

### Phase 2: Auth + Storage-Abstraktion (2–3 Wochen)
1. `storage.js` – StorageBackend-Abstraktion (sessionStorage für Free, localStorage + Cloud für Paid)
2. `auth.js` – Supabase Magic Link, onAuthStateChange, UI-Updates
3. Bestandsnutzer-Migration (Legacy-localStorage → Cloud beim ersten Login)

### Phase 3: Feature-Gates + Upgrade-Flow (1–2 Wochen)
1. `requiresPaid()`-Funktion + Soft-Gate CSS (PRO-Badge auf gesperrten Buttons)
2. Upgrade-Modal (Preisübersicht + Paddle-Checkout-Button)
3. Trial-Flow (14 Tage, kein Kreditkarte nötig)

### Phase 4: Paddle-Integration (1–2 Wochen)
1. Supabase Edge Function für Paddle-Webhooks
2. subscriptions-Tabelle wird via Webhook befüllt
3. Feature-Unlock nach Zahlung testen (End-to-End)

### Phase 5: N8N-Workflows + E-Mails (1 Woche)
1. Onboarding-E-Mail-Sequenz
2. Trial-Erinnerungs-Cron
3. Dunning-Sequenz
4. Interner Weekly-Digest

### Phase 6: Pricing-Seite + Launch-Vorbereitung (1 Woche)
1. `/preise.html` mit Feature-Vergleich + Paddle-Checkout
2. Bestandsnutzer-Kommunikation (E-Mail an alle bestehenden localStorage-Nutzer)
3. End-to-End-Test: Free → Trial → Paid → Kündigung → Datenlöschung

**Gesamt: ~8–11 Wochen bis zum Freemium-Launch**

---

## 10. Offene Entscheidungen (Zusammenfassung)

| # | Frage | Optionen | Status |
|---|---|---|---|
| 1 | **PDF-Export: kostenlos oder Gate?** | Kostenlos (schwächerer Upgrade-Druck, stärkere Verbreitung) vs. Gate (stärkster Trigger) | ⚠️ Offen |
| 2 | Analytics: GoatCounter oder Plausible? | GoatCounter (self-host, kostenlos) vs. Plausible (9 €/M, schöneres Dashboard) | ⚠️ Offen |
| 3 | N8N: self-host oder n8n.cloud? | Self-host auf Hetzner (~4 €/M) vs. n8n.cloud (20 €/M) | ⚠️ Offen |
| 4 | Freemium-Launch-Termin | Q4 2026 (Studie) – realistisch? | ⚠️ Offen |
| 5 | Wer prüft die AGB? | Anwalt extern (Andreas als Interessenkonflikt?) | ⚠️ Offen |

---

*Erstellt 2026-04-20 | Fordify Review & Konkretisierung | Vertraulich*
