# Design-Spec: E-Mail-System & Onboarding-Flow

> Stand: 2026-04-21

---

## Ziel

Ein konsistentes, Fordify-gebrandetes E-Mail-System aufbauen, das:
1. Den Checkout-/Onboarding-Flow für zahlende Nutzer abdeckt
2. Intern einen wöchentlichen KPI-Digest liefert
3. Über alle Kanäle (Supabase, Resend/N8N, Paddle) ein einheitliches CI zeigt
4. Durchgängig duzt und keine kanzlei-spezifische Sprache verwendet

---

## Kontext & Ausgangslage

**Nur zahlende Nutzer erstellen einen Account.** Der Flow ist:
1. Nutzer klickt „Pro abonnieren" auf preise.html
2. Nicht eingeloggt → Login-Modal (Checkout-Modus, 3-Schritt-Erklärung)
3. Gibt E-Mail ein → Supabase sendet Magic Link mit `?checkout=...` Parameter
4. Nutzer klickt Link → eingeloggt → Paddle-Checkout öffnet automatisch
5. Nutzer zahlt → Paddle sendet Zahlungsbestätigung (automatisch)
6. Paddle-Webhook → Supabase Edge Function → `subscriptions`-Tabelle befüllt

**Aktueller Stand der E-Mails:**
- Supabase Magic Link: teilweise angepasst (Deutsch, Resend als SMTP), aber mit Bug und ohne CI
- Paddle: Standard-Template, kein Fordify-Branding
- N8N: noch nicht eingerichtet — kein Onboarding-E-Mail, kein Digest

**Tools:**
- Supabase (Magic Link Template)
- Resend (`noreply@fordify.de`, Absender „Fordify")
- N8N (Automatisierung: Trigger + Cron)
- Paddle (begrenzt anpassbar: Farbe, Footer)
- GoatCounter API (`https://fordify.goatcounter.com/api/v0/`, Token in `.env`)

---

## 1. Fordify HTML-Basis-Template

Einmalig erstellt, in alle eigenen E-Mails eingebaut (Supabase + Resend/N8N).

**Struktur:**

```html
<!-- Header -->
<div style="background:#1e3a8a;padding:20px 32px;">
  <span style="color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.02em;">fordify</span>
</div>

<!-- Body -->
<div style="background:#fff;padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1e293b;max-width:600px;">
  <!-- Inhalt hier -->
</div>

<!-- CTA-Button (wenn nötig) -->
<a href="{{URL}}" style="display:inline-block;background:#1e3a8a;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
  Button-Text →
</a>

<!-- Footer -->
<div style="background:#f8fafc;padding:20px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;">
  <p style="margin:0;">fordify – Professionelle Forderungsaufstellungen</p>
  <p style="margin:4px 0 0;"><a href="https://fordify.de" style="color:#64748b;">fordify.de</a></p>
</div>
```

**Regeln:**
- Keine Bilder, keine externen Ressourcen — 100% inline CSS
- Systemschriften: Arial, Helvetica, sans-serif
- Farben: #1e3a8a (Blau), #1e293b (Text), #64748b (Muted), #f8fafc (Footer-BG)
- max-width: 600px
- Sprache: konsequent Du, keine Kanzlei-spezifischen Begriffe

---

## 2. Supabase Magic Link E-Mail

**Betreff:** `Dein Fordify-Anmeldelink`

**Template (HTML):**

```html
[Basis-Template-Header]

<h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1e293b;">Hallo,</h2>
<p style="margin:0 0 24px;">hier ist dein Fordify-Anmeldelink. Er ist 60 Minuten gültig und kann nur einmal genutzt werden.</p>

[CTA-Button: "Jetzt einloggen →" → {{ .ConfirmationURL }}]

<p style="margin:24px 0 0;font-size:13px;color:#64748b;">
  Falls du diesen Link nicht angefordert hast, kannst du diese E-Mail einfach ignorieren.
</p>

[Basis-Template-Footer]
```

**Änderungen gegenüber aktuellem Stand:**
- Bug gefixt: „Hallo, ist dein Anmeldelink" → „Hallo, hier ist dein..."
- CI-Template angewendet (Header, Button, Footer)
- Neutral: kein „Kanzlei", kein „Sie"

**Umsetzung:** Supabase Management API (PATCH `/v1/projects/{ref}/config/auth`)

---

## 3. Post-Payment Onboarding-E-Mail

**Trigger:** N8N empfängt Paddle-Webhook-Event `subscription.activated`
**Delay:** 5 Minuten (damit Paddle-Zahlungsbestätigung zuerst ankommt)
**Empfänger:** `user_email` aus Supabase (via `user_id` aus Paddle `custom_data`)
**Absender:** `noreply@fordify.de` via Resend

**Betreff:** `Willkommen bei fordify – so legst du los`

**Template (HTML):**

```html
[Basis-Template-Header]

<h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1e293b;">Schön, dass du dabei bist.</h2>
<p style="margin:0 0 24px;">Du hast jetzt vollen Zugriff auf alle Pro-Funktionen. Hier sind deine ersten drei Schritte:</p>

<!-- Schritt 1 -->
<div style="margin:0 0 16px;padding:16px;background:#f8fafc;border-left:3px solid #1e3a8a;border-radius:0 6px 6px 0;">
  <p style="margin:0;font-weight:700;color:#1e293b;">1. Firmendaten &amp; Logo hinterlegen</p>
  <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Über „Einstellungen" (oben rechts in der App) kannst du deine Daten und dein Logo für das PDF hinterlegen.</p>
</div>

<!-- Schritt 2 -->
<div style="margin:0 0 16px;padding:16px;background:#f8fafc;border-left:3px solid #1e3a8a;border-radius:0 6px 6px 0;">
  <p style="margin:0;font-weight:700;color:#1e293b;">2. Erste Forderungsaufstellung anlegen</p>
  <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Trag Stammdaten ein, füge Positionen hinzu – fordify berechnet Zinsen und Verrechnungen nach § 367 BGB automatisch.</p>
</div>

<!-- Schritt 3 -->
<div style="margin:0 0 24px;padding:16px;background:#f8fafc;border-left:3px solid #1e3a8a;border-radius:0 6px 6px 0;">
  <p style="margin:0;font-weight:700;color:#1e293b;">3. PDF exportieren</p>
  <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Mit einem Klick auf „Drucken / PDF" erzeugst du eine druckfertige, durchsuchbare PDF-Forderungsaufstellung.</p>
</div>

[CTA-Button: "Zur App →" → https://fordify.de/forderungsaufstellung.html]

<p style="margin:24px 0 0;font-size:13px;color:#64748b;">
  Fragen? Schreib uns einfach an <a href="mailto:hallo@fordify.de" style="color:#1e3a8a;">hallo@fordify.de</a>.
</p>

[Basis-Template-Footer]
```

**N8N-Flow:**
1. Webhook-Trigger (POST von Paddle-Edge-Function nach subscription.activated)
2. Wait-Node: 5 Minuten
3. Supabase-HTTP-Request: E-Mail-Adresse des Users anhand `user_id` aus `profiles` holen
4. Resend-HTTP-Request: E-Mail senden

---

## 4. Wöchentlicher interner Digest

**Trigger:** N8N Cron — montags 08:00 Uhr
**Empfänger:** `hallo@fordify.de`
**Absender:** `noreply@fordify.de` via Resend

**Betreff:** `fordify Wochenreport – KW {{KW}}`

**Datenquellen:**

| Metrik | Quelle | Abfrage |
|---|---|---|
| Neue Registrierungen | Supabase `profiles` | `created_at >= now() - interval '7 days'` |
| Neue Paid-Nutzer | Supabase `subscriptions` | `status = 'active' AND updated_at >= now() - 7 days` |
| Gesamt aktive Paid-Nutzer | Supabase `subscriptions` | `status = 'active'` COUNT |
| Website-Besucher | GoatCounter API | `GET /api/v0/stats/total?start=...&end=...` |
| Unique Visitors | GoatCounter API | aus gleichem Endpoint |
| Top 5 Seiten | GoatCounter API | `GET /api/v0/stats/hits?start=...&end=...` |

**GoatCounter API:** `https://fordify.goatcounter.com/api/v0/` — Auth via `Authorization: Bearer {GOATCOUNTER_API_KEY}`

**Template-Inhalt:**

```
KW-Nummer + Datumsrange als Überschrift

Nutzer
  Neue Registrierungen: X
  Neue Paid-Nutzer: X
  Gesamt aktive Paid-Nutzer: X

Website (fordify.de)
  Besucher: X
  Unique Visitors: X
  Top-Seiten:
    1. /forderungsaufstellung.html – X Aufrufe
    2. /preise.html – X Aufrufe
    ...

→ Link zum GoatCounter-Dashboard
```

---

## 5. Paddle-Branding (manuell)

Manuell im Paddle Dashboard unter „Customization":

| Einstellung | Wert |
|---|---|
| Markenfarbe | `#1e3a8a` |
| Footer-Text | `fordify – Professionelle Forderungsaufstellungen \| fordify.de` |
| Absendername | `Fordify` (bereits gesetzt) |

---

## Separate Tasks (nach E-Mail-Umsetzung)

Diese entstammen der Diskussion und gehören in einen eigenen Plan:

1. **Konsequentes Duzen** auf allen HTML-Seiten und in der App
2. **„Kanzlei" → neutrale Sprache** auf allen HTML-Seiten (Firma, Profil, Unternehmen)

---

## Nicht im Scope

- Trial-Erinnerungsmail (kein Trial-Modell)
- Zahlungsbestätigung via N8N (Paddle sendet selbst)
- HTML-Bild-Assets in E-Mails
