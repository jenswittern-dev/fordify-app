# Fordify – Organisationsplan Freemium-Launch

> Dieser Plan richtet sich an Jens und listet alle manuellen Schritte auf:
> Accounts anlegen, Einstellungen vornehmen, rechtliche Dokumente erstellen.
> Der technische Umsetzungsplan für Claude liegt in `docs/superpowers/plans/2026-04-20-freemium-implementation.md`.

---

## 0. Reihenfolge auf einen Blick

```
1. Supabase → 2. Resend (Domain) → 3. Paddle (Lemon Squeezy) → 4. GoatCounter
→ 5. UG-Gründung → 6. Rechtliche Dokumente → 7. Paddle Produkte anlegen
→ 8. N8N Workflows → 9. Go-Live Checkliste
```

---

## 1. Supabase

**Ziel:** Datenbank + Auth + Edge Functions für Fordify

### Account & Projekt anlegen
- [ ] Auf **supabase.com** registrieren (GitHub-Login empfohlen, E-Mail: jenswittern@gmail.com)
- [ ] Neues Projekt anlegen: **Name:** `fordify-prod` | **Region:** `eu-central-1` (Frankfurt) | **Passwort:** sicher speichern (Passwort-Manager)
- [ ] Free-Tier reicht bis ~50.000 MAU und 500 MB DB – kein Upgrade nötig zum Start

### Einstellungen im Dashboard
- [ ] **Authentication → Providers → Email:** aktiviert lassen, "Confirm email" ON, "Enable email autoconfirm" OFF
- [ ] **Authentication → URL Configuration:**
  - Site URL: `https://fordify.de`
  - Redirect URLs (Allowlist): `https://fordify.de`, `https://fordify.de/login`, `https://fordify.de/staging`
- [ ] **Authentication → Email Templates → Magic Link:** Betreff und Text auf Deutsch anpassen (s.u.)
- [ ] **Settings → API:** `anon public key` und `Project URL` notieren → für Claude (Task 2 im technischen Plan)
- [ ] **Settings → API → service_role key:** notieren → NUR für Paddle Webhook Edge Function, NIEMALS im Frontend verwenden

### Magic-Link E-Mail-Template (Deutsch)
```
Betreff: Dein Fordify-Login-Link

Hallo,

hier ist dein Anmeldelink für Fordify. Er ist 60 Minuten gültig.

{{ .ConfirmationURL }}

Falls du die Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.

Viele Grüße
Das Fordify-Team
```

### SMTP (Resend) verbinden
- [ ] Erst Resend einrichten (Schritt 2), dann hier:
- [ ] **Settings → Auth → SMTP Settings:** Custom SMTP aktivieren
  - Host: `smtp.resend.com` | Port: `465` | User: `resend` | Password: Resend API Key
  - Sender: `noreply@fordify.de`

### Row Level Security prüfen
- [ ] Nach Datenbankanlage durch Claude (Task 1): Im Supabase Dashboard → **Table Editor** prüfen, ob alle Tabellen `RLS enabled` anzeigen (grüner Schild-Status)

---

## 2. Resend (Transaktionale E-Mails)

**Ziel:** Professioneller E-Mail-Versand über eigene Domain `fordify.de`

### Account & Domain
- [ ] Auf **resend.com** registrieren (E-Mail: jenswittern@gmail.com)
- [ ] Free-Tier: 3.000 E-Mails/Monat, 100/Tag – ausreichend zum Start
- [ ] **Domains → Add Domain → `fordify.de`**
- [ ] DNS-Einträge (SPF, DKIM, DMARC) in All-Inkl eintragen:
  - Resend zeigt die genauen Werte an – im All-Inkl Kundenmenü unter **Domains → DNS**
  - Warten bis Status „Verified" (kann bis zu 48 Stunden dauern)

### API Key
- [ ] **API Keys → Create API Key:** Name `fordify-supabase`, Permission `Full Access`
- [ ] Key notieren → in Supabase SMTP Settings eintragen (Schritt 1)

### Wichtige Einstellungen
- [ ] **Sender Addresses:** `noreply@fordify.de` als Absender verifizieren
- [ ] E-Mail-Template für Upgrade-Bestätigung vorbereiten (plain text reicht):
  ```
  Betreff: Fordify Pro – Dein Abo ist aktiv

  Hallo [Name],

  dein Fordify-Pro-Abo ist jetzt aktiv. Du kannst dich unter fordify.de anmelden
  und deine Fälle in der Cloud speichern.

  Falls du Fragen hast, antworte einfach auf diese E-Mail.

  Jens Wittern
  fordify.de
  ```

---

## 3. Paddle (Zahlungsabwicklung)

**Ziel:** Merchant of Record – Paddle übernimmt die gesamte EU-Steuerabwicklung

### Account anlegen
- [ ] Auf **paddle.com** registrieren
- [ ] Business type: **Individual / Sole trader** (Einzelunternehmer)
- [ ] Business name: `Jens Wittern` oder `fordify` (Gewerbename)
- [ ] **Wichtig:** Gewerbeanmeldung bereithalten (Scan als PDF) – Paddle prüft das
- [ ] USt-ID eintragen (auch als Kleinunternehmer – Paddle MoR-Modell funktioniert trotzdem)
- [ ] Bankkonto hinterlegen für Auszahlungen (IBAN)

### Steuer-Einstellung
- [ ] **Settings → Tax:** Paddle übernimmt als MoR die gesamte Steuerabrechnung gegenüber Kunden → keine eigene USt-Ausweisung nötig
- [ ] Paddle stellt dir eine monatliche B2B-Rechnung ohne USt (Kleinunternehmer → Reverse Charge)

### Produkte anlegen (nach UG-Gründung oder sofort als Einzelunternehmer)
- [ ] **Catalog → Products → New Product:**
  - Name: `Fordify Pro`
  - Billing: `Recurring` | Interval: `Monthly` | Currency: `EUR`
  - Price: `19,00 EUR/Monat` (Netto → Paddle addiert MwSt.)
- [ ] Zweites Produkt anlegen:
  - Name: `Fordify Pro – Jährlich`
  - Price: `149,00 EUR/Jahr`
- [ ] Drittes Produkt anlegen:
  - Name: `Fordify Kanzlei`
  - Billing: `Recurring` | Interval: `Monthly` | Currency: `EUR`
  - Price: `49,00 EUR/Monat` (ab 3 Nutzer)
- [ ] **Checkout → Custom Data:** Feld `user_id` (UUID) hinzufügen → wird vom Frontend befüllt

### Webhook einrichten (nach Claude Task 7)
- [ ] **Notifications → New Endpoint:**
  - URL: `https://[supabase-project-ref].supabase.co/functions/v1/paddle-webhook`
  - Events: `subscription.created`, `subscription.updated`, `subscription.activated`, `subscription.canceled`, `transaction.completed`
- [ ] **Webhook Signing Secret** notieren → für Claude (Task 7 Edge Function)

### Sandbox zum Testen
- [ ] Paddle Sandbox unter **developer.paddle.com** separat einrichten
- [ ] Sandbox-Keys für Staging-Umgebung verwenden

---

## 3b. Alternative: Lemon Squeezy (nur falls Paddle ablehnt)

- [ ] **lemonsqueezy.com** → Account mit Einzelunternehmer-Daten
- [ ] Produkte gleich anlegen wie bei Paddle
- [ ] Webhook-URL: `https://[ref].supabase.co/functions/v1/lemonsqueezy-webhook`
- [ ] API-Signing-Secret notieren

---

## 4. GoatCounter (Datenschutzkonforme Analytics)

**Ziel:** Besucherstatistiken ohne Cookie-Banner – auf eigenem Hostinger-Server

### Installation auf Hostinger VPS
```bash
# SSH in Hostinger VPS
cd /opt
wget https://github.com/arp242/goatcounter/releases/latest/download/goatcounter-linux-amd64.gz
gunzip goatcounter-linux-amd64.gz
chmod +x goatcounter-linux-amd64
mv goatcounter-linux-amd64 /usr/local/bin/goatcounter

# Datenbank initialisieren
goatcounter db create -createdb -dbconnect sqlite:///var/lib/goatcounter/goatcounter.sqlite3

# Admin-User anlegen
goatcounter create -site stats.fordify.de -email jenswittern@gmail.com -password [sicheres-passwort]
```

### Als systemd-Service einrichten
```ini
# /etc/systemd/system/goatcounter.service
[Unit]
Description=GoatCounter
After=network.target

[Service]
ExecStart=/usr/local/bin/goatcounter serve -dbconnect sqlite:///var/lib/goatcounter/goatcounter.sqlite3 -listen :8181
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```
```bash
systemctl enable goatcounter && systemctl start goatcounter
```

### Nginx-Reverse-Proxy (Hostinger)
- [ ] Subdomain `stats.fordify.de` anlegen (DNS: A-Record auf Hostinger-IP)
- [ ] Nginx-Config für `stats.fordify.de` → Proxy auf `localhost:8181`
- [ ] SSL-Zertifikat via Certbot: `certbot --nginx -d stats.fordify.de`

### Einstellungen in GoatCounter
- [ ] Einloggen auf `https://stats.fordify.de`
- [ ] **Settings → Sites:** `fordify.de` als erlaubte Domain eintragen
- [ ] **Settings → Privacy:** "Do not collect IP addresses" bestätigen (ist Standard)
- [ ] Script-URL für Claude notieren: `https://stats.fordify.de/count.js`

---

## 5. UG-Gründung (haftungsbeschränkt)

> **Timing:** Kann parallel zur technischen Implementierung laufen.
> Fordify läuft bis zur UG-Eintragung unter Einzelunternehmen weiter.

### Vorbereitung
- [ ] Gesellschaftsvertrag (Musterprotokoll reicht für 1 Gesellschafter, kostet ~100€ weniger)
- [ ] Stammkapital: mindestens **1 €**, empfohlen: **1.000 €** (höhere Seriosität)
- [ ] Notar auswählen (Vergleichsportale: notartermin.de)

### Schritte
1. [ ] Notartermin vereinbaren (Vorlaufzeit: 1–3 Wochen)
2. [ ] Notariell beurkundeter Gesellschaftsvertrag unterzeichnen
3. [ ] Geschäftskonto bei Bank eröffnen (N26 Business, Qonto, Commerzbank)
4. [ ] Stammkapital einzahlen, Einzahlungsbeleg von Bank holen
5. [ ] Anmeldung beim Handelsregister durch Notar (Kosten: ~250–450€)
6. [ ] Eintragung abwarten (4–8 Wochen)
7. [ ] Gewerbeummeldung: Einzelunternehmen → UG beim Gewerbeamt
8. [ ] Finanzamt: Fragebogen zur steuerlichen Erfassung ausfüllen (UG-Steuernummer)
9. [ ] Paddle-Account auf UG-Daten umschreiben

### Kosten gesamt
| Position | Betrag |
|---|---|
| Notarkosten (Musterprotokoll, 1 Gesellschafter) | ~280 € |
| Handelsregistergebühren | ~150 € |
| Stammkapital (wird Betriebsvermögen) | 1.000 € |
| Geschäftskonto (z.B. Qonto) | 9 €/Monat |
| **Gesamt Cash-Out** | **~1.430 €** |

---

## 6. Rechtliche Dokumente

### AGB (Allgemeine Geschäftsbedingungen)
- [ ] AGB-Generator nutzen (z.B. eRecht24, IT-Recht Kanzlei, oder Anwalt)
- [ ] Wichtige Punkte für fordify:
  - SaaS-Abonnement, monatlich/jährlich kündbar
  - Keine Garantie für Berechnungsrichtigkeit (Tools ersetzen keine Rechtsberatung)
  - Datenspeicherung in EU (Supabase Frankfurt)
  - Kündigung zum Ablauf des Abrechnungszeitraums
  - Paddle als Zahlungsabwickler (Verweise auf Paddle AGB)

### Datenschutzerklärung aktualisieren
- [ ] Bestehende `datenschutz.html` ergänzen um:
  - Supabase (EU-Verarbeitung, Auftragsverarbeitungsvertrag)
  - Paddle (als MoR, eigener Verantwortlicher für Zahlungsdaten)
  - Resend (E-Mail-Versand, EU-Server)
  - GoatCounter (keine personenbezogenen Daten, kein Cookie)
  - Rechtsgrundlage Vertrag (Art. 6 Abs. 1 lit. b DSGVO) für Abo-Daten

### Auftragsverarbeitungsverträge (AVV) abschließen
- [ ] **Supabase AVV:** Dashboard → Settings → Legal → DPA herunterladen und unterzeichnen
- [ ] **Paddle:** Paddle ist MoR, kein AVV nötig (eigenständiger Verantwortlicher)
- [ ] **Resend AVV:** resend.com → Settings → Legal → DPA

### Impressum aktualisieren
- [ ] Nach UG-Gründung: Firmenname, Handelsregisternummer, Registergericht eintragen
- [ ] Bis dahin: Einzelunternehmen-Angaben (Name, Adresse, Steuernummer, Gewerbeanmeldung)

---

## 7. N8N Workflows (auf Hostinger VPS)

> N8N läuft bereits auf Hostinger – nur Workflows anlegen

### Workflow 1: Neues Abo → Willkommens-E-Mail
**Trigger:** Webhook (von Supabase Edge Function nach `subscription.activated`)
```
Webhook-Node → 
Set-Node (E-Mail aus Payload) → 
Resend-Node (Willkommens-E-Mail senden) → 
Supabase-Node (onboarding_email_sent = true in profiles)
```
- [ ] Webhook-URL aus N8N notieren → für Claude (Task 9)
- [ ] Resend API Key in N8N Credentials hinterlegen

### Workflow 2: Abo-Kündigung → Offboarding-E-Mail
**Trigger:** Webhook (von Supabase Edge Function nach `subscription.canceled`)
```
Webhook-Node → 
Resend-Node ("Tut uns leid" + Datenexport-Hinweis) →
Supabase-Node (Status auf canceled setzen)
```

### Workflow 3: Täglicher Gesundheitscheck (optional)
**Trigger:** Cron (täglich 09:00)
```
Supabase-Node (aktive Abos zählen) →
IF (Fehlerrate > 5%) →
E-Mail-Alarm an jenswittern@gmail.com
```

---

## 8. Staging-Test vor Go-Live

- [ ] Staging-URL: `fordify.de/staging/`
- [ ] Supabase Sandbox-Projekt anlegen (Name: `fordify-staging`)
- [ ] Paddle Sandbox-Keys in `frontend/js/config.js` für Staging eintragen
- [ ] Kompletter Durchlauf testen:
  1. Magic-Link anfordern und einloggen
  2. Paddle-Checkout öffnen (Sandbox-Kreditkarte: 4242 4242 4242 4242)
  3. Prüfen: Supabase `subscriptions`-Tabelle → Status `active`
  4. Feature-Gates testen: Excel-Export zeigt Upgrade-Modal (nicht eingeloggt), nach Login kein Modal
  5. Fall anlegen → Tab schließen → neu öffnen → Fall noch vorhanden (Cloud-Sync)
  6. GoatCounter: Seitenaufruf erscheint in stats.fordify.de

---

## 9. Go-Live Checkliste

### 1 Woche vorher
- [ ] Alle AVV unterzeichnet und gespeichert
- [ ] AGB und aktualisierte Datenschutzerklärung live
- [ ] Paddle Produkte in Live-Modus erstellt
- [ ] Staging-Tests erfolgreich (Schritt 8)
- [ ] Resend Domain verifiziert

### Am Launch-Tag
- [ ] `config.js` → `IS_PROD = true`, Paddle Live-Keys eintragen
- [ ] SW-Version erhöhen (Claude erledigt das automatisch)
- [ ] Push auf `main` → Auto-Deploy läuft durch
- [ ] Manuell testen: ein echter Kauf mit echter Kreditkarte (danach refunden)
- [ ] GoatCounter beobachten: kommen Aufrufe an?

### Nach Launch
- [ ] Paddle-Dashboard: erste Zahlungen prüfen
- [ ] N8N: Willkommens-E-Mails korrekt versendet?
- [ ] Supabase: `subscriptions`-Tabelle zeigt `active`?
- [ ] Erster Auszahlungstermin Paddle: nach 7 Tagen (erste Zahlung)

---

## Zusammenfassung: Accounts & Zugangsdaten sichern

| Service | Account | Wichtige Keys |
|---|---|---|
| Supabase | jenswittern@gmail.com | anon key, service_role key, Project URL |
| Resend | jenswittern@gmail.com | API Key für SMTP |
| Paddle | Einzelunternehmer-Daten | Live Secret Key, Webhook Signing Secret |
| GoatCounter | stats.fordify.de | Admin-Passwort |
| N8N | Hostinger VPS | Webhook-URLs |

> **Alle Secrets in einem Passwort-Manager speichern (z.B. Bitwarden).**
> NIEMALS in Git committen.

---

*Stand: 2026-04-20 | Technischer Plan: `docs/superpowers/plans/2026-04-20-freemium-implementation.md`*
