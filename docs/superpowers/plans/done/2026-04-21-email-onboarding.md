# E-Mail-System & Onboarding-Flow – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein konsistentes, Fordify-gebrandetes E-Mail-System aufbauen: Magic Link Template fixen, Post-Payment Onboarding-Mail und wöchentlichen KPI-Digest via N8N einrichten, Paddle-Branding anpassen.

**Architecture:** Gemeinsames HTML-Basis-Template (inline CSS, keine Bilder) wird in Supabase und Resend/N8N eingesetzt. N8N orchestriert Post-Payment-Mail (Trigger: Paddle subscription.activated) und Digest (Cron). Supabase Magic Link wird direkt via Management API aktualisiert.

**Tech Stack:** Supabase Management API, Resend REST API, GoatCounter API v0, N8N (HTTP Request Nodes), Vanilla HTML/CSS für E-Mail-Templates

**Credentials (alle in `.env`):**
- `SUPABASE_ACCESS_TOKEN` — für Management API
- `SUPABASE_SERVICE_ROLE_KEY` — für Supabase-Datenbankabfragen in N8N
- `RESEND_API_KEY` — für E-Mail-Versand
- `GOATCOUNTER_API_KEY` — für Analytics-Abfragen
- Supabase Project-Ref: `dswhllvtewtqpiqnpbsu`

---

## File Structure

```
docs/email-templates/
├── fordify-base.html           ← Kanonisches HTML-Template (Referenz)
├── n8n-onboarding-workflow.json ← N8N Import-Workflow: Post-Payment
└── n8n-digest-workflow.json    ← N8N Import-Workflow: Wöchentlicher Digest
```

---

### Task 1: HTML-Basis-Template erstellen

**Files:**
- Erstellen: `docs/email-templates/fordify-base.html`

- [ ] **Schritt 1: Verzeichnis anlegen und Template-Datei erstellen**

```bash
mkdir -p docs/email-templates
```

Datei `docs/email-templates/fordify-base.html` erstellen:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>fordify</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:#1e3a8a;padding:20px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.03em;">fordify</span>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1e293b;">
              <!-- INHALT HIER -->
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1e293b;">Überschrift</h2>
              <p style="margin:0 0 24px;">Fließtext hier.</p>

              <!-- CTA-BUTTON -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#1e3a8a;border-radius:6px;">
                    <a href="https://fordify.de" style="display:inline-block;padding:13px 28px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;">
                      Button-Text →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#64748b;">Hinweis-Text hier.</p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;line-height:1.6;">
                fordify – Professionelle Forderungsaufstellungen<br>
                <a href="https://fordify.de" style="color:#64748b;text-decoration:underline;">fordify.de</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

- [ ] **Schritt 2: Visuell prüfen**

Datei im Browser öffnen. Erwartetes Ergebnis: Blauer Header mit „fordify" in Weiß, weißer Content-Bereich, hellgrauer Footer. Kein externes Asset geladen.

- [ ] **Schritt 3: Commit**

```bash
git add docs/email-templates/fordify-base.html
git commit -m "feat: Fordify HTML-Basis-Template für E-Mails"
```

---

### Task 2: Supabase Magic Link Template aktualisieren

**Files:** keine lokalen Dateien — Update via Supabase Management API

Das Template wird direkt per API-Call in Supabase aktualisiert. Kein Dashboard-Login nötig.

- [ ] **Schritt 1: Aktuellen Stand prüfen**

```bash
curl -s "https://api.supabase.com/v1/projects/dswhllvtewtqpiqnpbsu/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | grep -o '"mailer_templates_magic_link_content":"[^"]*"'
```

Erwartetes Ergebnis: Aktuelles (buggy) Template mit „Hallo, ist dein Anmeldelink".

- [ ] **Schritt 2: Template aktualisieren**

```bash
curl -X PATCH "https://api.supabase.com/v1/projects/dswhllvtewtqpiqnpbsu/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_magic_link": "Dein Fordify-Anmeldelink",
    "mailer_templates_magic_link_content": "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;\"><tr><td align=\"center\"><table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;\"><tr><td style=\"background:#1e3a8a;padding:20px 32px;border-radius:8px 8px 0 0;\"><span style=\"color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.03em;font-family:Arial,Helvetica,sans-serif;\">fordify<\/span><\/td><\/tr><tr><td style=\"background:#ffffff;padding:36px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1e293b;\"><h2 style=\"margin:0 0 16px;font-size:20px;font-weight:700;color:#1e293b;\">Hallo,<\/h2><p style=\"margin:0 0 24px;\">hier ist dein Fordify-Anmeldelink. Er ist 60 Minuten g\u00fcltig und kann nur einmal genutzt werden.<\/p><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 24px;\"><tr><td style=\"background:#1e3a8a;border-radius:6px;\"><a href=\"{{ .ConfirmationURL }}\" style=\"display:inline-block;padding:13px 28px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;\">Jetzt einloggen \u2192<\/a><\/td><\/tr><\/table><p style=\"margin:0;font-size:13px;color:#64748b;\">Falls du diesen Link nicht angefordert hast, kannst du diese E-Mail einfach ignorieren.<\/p><\/td><\/tr><tr><td style=\"background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;\"><p style=\"margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;line-height:1.6;\">fordify \u2013 Professionelle Forderungsaufstellungen<br><a href=\"https:\/\/fordify.de\" style=\"color:#64748b;text-decoration:underline;\">fordify.de<\/a><\/p><\/td><\/tr><\/table><\/td><\/tr><\/table>"
  }'
```

Erwartetes Ergebnis: HTTP 200, JSON-Response mit aktualisierten Werten.

- [ ] **Schritt 3: Verifizieren**

```bash
curl -s "https://api.supabase.com/v1/projects/dswhllvtewtqpiqnpbsu/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | grep -o '"mailer_templates_magic_link_content":"[^"]*"' | head -c 200
```

Erwartetes Ergebnis: Neues Template beginnt mit `<table width=...` (nicht mehr `<h2>Hallo,</h2>`).

- [ ] **Schritt 4: Live testen**

Auf `fordify.de/forderungsaufstellung.html` → Login-Modal öffnen → eigene E-Mail-Adresse eingeben → Magic Link anfordern → E-Mail prüfen.

Erwartetes Ergebnis:
- Betreff: „Dein Fordify-Anmeldelink"
- Blauer Header mit „fordify"
- Text: „Hallo, hier ist dein Fordify-Anmeldelink."
- Blauer CTA-Button „Jetzt einloggen →"
- Grauer Footer mit fordify.de

- [ ] **Schritt 5: Commit (Dokumentation)**

```bash
git commit --allow-empty -m "feat: Supabase Magic Link Template – CI-Branding + Bug-Fix (via API)"
```

---

### Task 3: N8N Post-Payment Onboarding-Workflow

**Files:**
- Erstellen: `docs/email-templates/n8n-onboarding-workflow.json`

**Voraussetzung:** N8N-Server läuft und ist erreichbar. Resend API Key in N8N als Credential hinterlegt.

Dieser Workflow wird durch das `subscription.activated`-Event von Paddle ausgelöst. Die Supabase Edge Function (paddle-webhook) muss nach erfolgreichem Upsert einen HTTP-Call an N8N senden — **oder** N8N pollt Supabase direkt per Cron auf neue aktive Subscriptions.

**Empfohlener Trigger-Ansatz: Supabase Webhook → N8N**

Im Supabase Dashboard → Database → Webhooks → New Webhook:
- Table: `subscriptions`
- Events: `INSERT`, `UPDATE`
- URL: `https://[dein-n8n]/webhook/fordify-subscription`
- Filter: `status = 'active'`

- [ ] **Schritt 1: N8N Workflow-JSON erstellen**

Datei `docs/email-templates/n8n-onboarding-workflow.json`:

```json
{
  "name": "Fordify – Post-Payment Onboarding",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "fordify-subscription",
        "httpMethod": "POST",
        "responseMode": "onReceived"
      },
      "position": [250, 300]
    },
    {
      "name": "Nur aktive Subscriptions",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json[\"record\"][\"status\"]}}",
              "operation": "equals",
              "value2": "active"
            }
          ]
        }
      },
      "position": [450, 300]
    },
    {
      "name": "5 Minuten warten",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 5,
        "unit": "minutes"
      },
      "position": [650, 300]
    },
    {
      "name": "E-Mail aus Supabase holen",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "=https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/profiles?id=eq.{{$json[\"record\"][\"user_id\"]}}&select=email",
        "headers": {
          "apikey": "$SUPABASE_ANON_KEY",
          "Authorization": "Bearer $SUPABASE_SERVICE_ROLE_KEY"
        }
      },
      "position": [850, 300]
    },
    {
      "name": "Onboarding-Mail senden",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.resend.com/emails",
        "headers": {
          "Authorization": "Bearer $RESEND_API_KEY",
          "Content-Type": "application/json"
        },
        "body": "={\"from\":\"Fordify <noreply@fordify.de>\",\"to\":[\"{{$json[0].email}}\"],\"subject\":\"Willkommen bei fordify – so legst du los\",\"html\":\"[TEMPLATE – siehe Schritt 2]\"}"
      },
      "position": [1050, 300]
    }
  ]
}
```

- [ ] **Schritt 2: E-Mail-HTML für Onboarding-Mail**

Das HTML für den `html`-Parameter im Resend-Call (vollständig, inline CSS, basierend auf Basis-Template):

```html
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr><td style="background:#1e3a8a;padding:20px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:0.03em;font-family:Arial,Helvetica,sans-serif;">fordify</span>
    </td></tr>
    <tr><td style="background:#fff;padding:36px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1e293b;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1e293b;">Sch&ouml;n, dass du dabei bist.</h2>
      <p style="margin:0 0 28px;color:#475569;">Du hast jetzt vollen Zugriff auf alle Pro-Funktionen. Hier sind deine ersten drei Schritte:</p>

      <div style="margin:0 0 12px;padding:16px 20px;background:#f8fafc;border-left:3px solid #1e3a8a;border-radius:0 6px 6px 0;">
        <p style="margin:0;font-weight:700;color:#1e293b;">1. Firmendaten &amp; Logo hinterlegen</p>
        <p style="margin:6px 0 0;font-size:13px;color:#64748b;">&Uuml;ber &bdquo;Einstellungen&ldquo; (oben rechts in der App) kannst du deine Daten und dein Logo f&uuml;r das PDF hinterlegen.</p>
      </div>

      <div style="margin:0 0 12px;padding:16px 20px;background:#f8fafc;border-left:3px solid #1e3a8a;border-radius:0 6px 6px 0;">
        <p style="margin:0;font-weight:700;color:#1e293b;">2. Erste Forderungsaufstellung anlegen</p>
        <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Trag Stammdaten ein, f&uuml;ge Positionen hinzu &ndash; fordify berechnet Zinsen und Verrechnungen nach &sect; 367 BGB automatisch.</p>
      </div>

      <div style="margin:0 0 28px;padding:16px 20px;background:#f8fafc;border-left:3px solid #1e3a8a;border-radius:0 6px 6px 0;">
        <p style="margin:0;font-weight:700;color:#1e293b;">3. PDF exportieren</p>
        <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Mit einem Klick auf &bdquo;Drucken / PDF&ldquo; erzeugst du eine druckfertige, durchsuchbare PDF-Forderungsaufstellung.</p>
      </div>

      <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:#1e3a8a;border-radius:6px;">
          <a href="https://fordify.de/forderungsaufstellung.html" style="display:inline-block;padding:13px 28px;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;">Zur App &rarr;</a>
        </td></tr>
      </table>

      <p style="margin:0;font-size:13px;color:#64748b;">Fragen? Schreib uns: <a href="mailto:hallo@fordify.de" style="color:#1e3a8a;">hallo@fordify.de</a></p>
    </td></tr>
    <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
      <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">fordify &ndash; Professionelle Forderungsaufstellungen<br>
      <a href="https://fordify.de" style="color:#64748b;">fordify.de</a></p>
    </td></tr>
  </table>
  </td></tr>
</table>
```

- [ ] **Schritt 3: Supabase Webhook einrichten**

Im Supabase Dashboard → Database → Webhooks → „Create a new hook":
- Name: `n8n-subscription-activated`
- Table: `subscriptions`
- Events: `INSERT`, `UPDATE`
- Type: HTTP Request
- URL: `https://[N8N-URL]/webhook/fordify-subscription`
- HTTP Method: POST

- [ ] **Schritt 4: Workflow in N8N importieren**

N8N → New Workflow → Import from JSON → `docs/email-templates/n8n-onboarding-workflow.json` einfügen → anpassen → aktivieren.

- [ ] **Schritt 5: End-to-End testen**

Test-Eintrag direkt in Supabase SQL Editor:
```sql
INSERT INTO subscriptions (user_id, status, plan, billing_cycle, updated_at)
SELECT id, 'active', 'pro', 'monthly', now()
FROM profiles
WHERE email = 'jenswittern@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET status = 'active', updated_at = now();
```

→ N8N Execution prüfen → E-Mail-Postfach prüfen → Onboarding-Mail mit CI angekommen?

- [ ] **Schritt 6: Commit**

```bash
git add docs/email-templates/n8n-onboarding-workflow.json
git commit -m "feat: N8N Onboarding-Workflow JSON + Supabase Webhook-Konfiguration"
```

---

### Task 4: N8N Wöchentlicher Digest

**Files:**
- Erstellen: `docs/email-templates/n8n-digest-workflow.json`

**Voraussetzung:** N8N läuft, Task 3 abgeschlossen (Credentials bekannt).

- [ ] **Schritt 1: GoatCounter API testen**

```bash
curl -s "https://fordify.goatcounter.com/api/v0/stats/hits?limit=5&start=$(date -d '7 days ago' +%Y-%m-%d)&end=$(date +%Y-%m-%d)" \
  -H "Authorization: Bearer $GOATCOUNTER_API_KEY"
```

Erwartetes Ergebnis: JSON mit Seiten und Aufrufzahlen der letzten 7 Tage.

```bash
curl -s "https://fordify.goatcounter.com/api/v0/stats/total?start=$(date -d '7 days ago' +%Y-%m-%d)&end=$(date +%Y-%m-%d)" \
  -H "Authorization: Bearer $GOATCOUNTER_API_KEY"
```

Erwartetes Ergebnis: JSON mit `total` (Pageviews) und `unique` (Visitors).

- [ ] **Schritt 2: Supabase-Abfragen testen**

```bash
# Neue Registrierungen letzte 7 Tage
curl -s "https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/profiles?created_at=gte.$(date -d '7 days ago' +%Y-%m-%dT00:00:00Z)&select=id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Prefer: count=exact" -I | grep -i content-range

# Neue Paid-Nutzer letzte 7 Tage
curl -s "https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?status=eq.active&updated_at=gte.$(date -d '7 days ago' +%Y-%m-%dT00:00:00Z)&select=id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Prefer: count=exact" -I | grep -i content-range

# Gesamt aktive Paid-Nutzer
curl -s "https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?status=eq.active&select=id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Prefer: count=exact" -I | grep -i content-range
```

Erwartetes Ergebnis: `Content-Range: 0-X/Y` — Y ist die Gesamtanzahl.

- [ ] **Schritt 3: N8N Digest-Workflow JSON erstellen**

Datei `docs/email-templates/n8n-digest-workflow.json`:

```json
{
  "name": "Fordify – Wöchentlicher Digest",
  "nodes": [
    {
      "name": "Cron Montag 08:00",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "cronExpression", "expression": "0 8 * * 1"}]
        }
      },
      "position": [250, 300]
    },
    {
      "name": "Neue Registrierungen",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "=https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/profiles?created_at=gte.{{$now.minus({days:7}).toISO()}}&select=id",
        "headers": {
          "apikey": "$SUPABASE_ANON_KEY",
          "Authorization": "Bearer $SUPABASE_SERVICE_ROLE_KEY",
          "Prefer": "count=exact"
        }
      },
      "position": [450, 200]
    },
    {
      "name": "Neue Paid-Nutzer",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "=https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?status=eq.active&updated_at=gte.{{$now.minus({days:7}).toISO()}}&select=id",
        "headers": {
          "apikey": "$SUPABASE_ANON_KEY",
          "Authorization": "Bearer $SUPABASE_SERVICE_ROLE_KEY",
          "Prefer": "count=exact"
        }
      },
      "position": [450, 320]
    },
    {
      "name": "Gesamt Paid-Nutzer",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "https://dswhllvtewtqpiqnpbsu.supabase.co/rest/v1/subscriptions?status=eq.active&select=id",
        "headers": {
          "apikey": "$SUPABASE_ANON_KEY",
          "Authorization": "Bearer $SUPABASE_SERVICE_ROLE_KEY",
          "Prefer": "count=exact"
        }
      },
      "position": [450, 440]
    },
    {
      "name": "GoatCounter Total",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "=https://fordify.goatcounter.com/api/v0/stats/total?start={{$now.minus({days:7}).toFormat('yyyy-MM-dd')}}&end={{$now.toFormat('yyyy-MM-dd')}}",
        "headers": {
          "Authorization": "Bearer $GOATCOUNTER_API_KEY"
        }
      },
      "position": [450, 560]
    },
    {
      "name": "GoatCounter Top-Seiten",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "=https://fordify.goatcounter.com/api/v0/stats/hits?limit=5&start={{$now.minus({days:7}).toFormat('yyyy-MM-dd')}}&end={{$now.toFormat('yyyy-MM-dd')}}",
        "headers": {
          "Authorization": "Bearer $GOATCOUNTER_API_KEY"
        }
      },
      "position": [450, 680]
    },
    {
      "name": "Digest-Mail senden",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.resend.com/emails",
        "headers": {
          "Authorization": "Bearer $RESEND_API_KEY",
          "Content-Type": "application/json"
        },
        "body": "={\"from\":\"Fordify <noreply@fordify.de>\",\"to\":[\"hallo@fordify.de\"],\"subject\":\"fordify Wochenreport – KW {{$now.weekNumber}}\",\"html\":\"[TEMPLATE – siehe Schritt 4]\"}"
      },
      "position": [700, 440]
    }
  ]
}
```

- [ ] **Schritt 4: Digest-E-Mail HTML**

Das HTML für den Digest (inline CSS, Basis-Template):

```html
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr><td style="background:#1e3a8a;padding:20px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:0.03em;font-family:Arial,Helvetica,sans-serif;">fordify</span>
    </td></tr>
    <tr><td style="background:#fff;padding:36px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1e293b;">
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1e293b;">Wochenreport</h2>
      <p style="margin:0 0 28px;font-size:13px;color:#64748b;">{{startDate}} – {{endDate}}</p>

      <!-- Nutzer -->
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Nutzer</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="padding:12px 16px;background:#f8fafc;border-radius:6px 6px 0 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#64748b;font-size:13px;">Neue Registrierungen</span>
            <span style="float:right;font-weight:700;color:#1e293b;">{{neueRegistrierungen}}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
            <span style="color:#64748b;font-size:13px;">Neue Paid-Nutzer</span>
            <span style="float:right;font-weight:700;color:#1e293b;">{{neuePaidNutzer}}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background:#f8fafc;border-radius:0 0 6px 6px;">
            <span style="color:#64748b;font-size:13px;">Gesamt aktive Paid-Nutzer</span>
            <span style="float:right;font-weight:700;color:#1e3a8a;">{{gesamtPaidNutzer}}</span>
          </td>
        </tr>
      </table>

      <!-- Website -->
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Website (fordify.de)</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
        <tr>
          <td style="padding:12px 16px;background:#f8fafc;border-radius:6px 6px 0 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#64748b;font-size:13px;">Besucher (Pageviews)</span>
            <span style="float:right;font-weight:700;color:#1e293b;">{{pageviews}}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background:#f8fafc;border-radius:0 0 6px 6px;">
            <span style="color:#64748b;font-size:13px;">Unique Visitors</span>
            <span style="float:right;font-weight:700;color:#1e293b;">{{uniqueVisitors}}</span>
          </td>
        </tr>
      </table>

      <!-- Top Seiten -->
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#64748b;">Top-Seiten der Woche:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <!-- N8N befüllt diese Zeilen dynamisch via Code-Node -->
        {{topSeitenRows}}
      </table>

      <table cellpadding="0" cellspacing="0">
        <tr><td style="background:#f1f5f9;border-radius:6px;">
          <a href="https://fordify.goatcounter.com" style="display:inline-block;padding:10px 20px;color:#1e3a8a;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;text-decoration:none;">GoatCounter-Dashboard &rarr;</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
      <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">fordify &ndash; interner Wochenreport<br>
      <a href="https://fordify.de" style="color:#64748b;">fordify.de</a></p>
    </td></tr>
  </table>
  </td></tr>
</table>
```

- [ ] **Schritt 5: N8N Code-Node für Top-Seiten-Rows**

In N8N einen Code-Node vor dem Mail-Senden einfügen, der die GoatCounter-Antwort in HTML-Tabellenzeilen umwandelt:

```javascript
// Input: GoatCounter /stats/hits Response
const hits = $input.first().json.hits || [];
const rows = hits.slice(0, 5).map((hit, i) =>
  `<tr><td style="padding:8px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;">
    <span style="color:#64748b;">${i + 1}. ${hit.path}</span>
    <span style="float:right;font-weight:700;color:#1e293b;">${hit.count}</span>
  </td></tr>`
).join('');
return [{ json: { topSeitenRows: rows } }];
```

- [ ] **Schritt 6: Workflow in N8N importieren und aktivieren**

N8N → New Workflow → Import from JSON → Workflow einfügen → alle Nodes überprüfen → aktivieren.

- [ ] **Schritt 7: Manuell ausführen und testen**

Im N8N-Dashboard: Workflow manuell triggern → alle Nodes grün → E-Mail bei `hallo@fordify.de` prüfen.

Erwartetes Ergebnis: Digest-Mail mit CI-Branding, Kennzahlen befüllt, Top-Seiten-Liste.

- [ ] **Schritt 8: Commit**

```bash
git add docs/email-templates/n8n-digest-workflow.json
git commit -m "feat: N8N Digest-Workflow JSON (Cron montags, GoatCounter + Supabase)"
```

---

### Task 5: Paddle-Branding setzen (manuell)

**Files:** keine — manuelle Schritte im Paddle Dashboard

- [ ] **Schritt 1: Paddle Dashboard öffnen**

`https://vendors.paddle.com` → Login → **Customization** (im linken Menü)

- [ ] **Schritt 2: Markenfarbe setzen**

Unter „Brand color": `#1e3a8a` eintragen → Speichern.

- [ ] **Schritt 3: Footer-Text setzen**

Unter „Email footer" o.ä.: `fordify – Professionelle Forderungsaufstellungen | fordify.de` eintragen → Speichern.

- [ ] **Schritt 4: Test-Mail anfordern**

Paddle → Notifications → Test-Benachrichtigung senden → E-Mail prüfen: Fordify-Blau als Akzentfarbe sichtbar?

- [ ] **Schritt 5: Commit (Dokumentation)**

```bash
git commit --allow-empty -m "feat: Paddle Branding – Markenfarbe #1e3a8a + Footer-Text (manuell)"
```

---

### Task 6: Dokumentation aktualisieren

**Files:**
- Ändern: `CLAUDE.md`
- Ändern: `docs/superpowers/plans/2026-04-21-email-onboarding.md` (Status)

- [ ] **Schritt 1: CLAUDE.md aktualisieren**

Im Freemium-Plan-Status in `CLAUDE.md` Task 9 auf ✅ setzen (N8N-Workflows) sobald N8N live ist und beide Workflows aktiv sind.

```markdown
| 9 – N8N-Workflows | ✅ | Onboarding-Mail + Wöchentlicher Digest aktiv |
```

- [ ] **Schritt 2: Spec in done/ verschieben**

```bash
mv docs/superpowers/specs/2026-04-21-email-onboarding-design.md docs/superpowers/specs/done/
```

- [ ] **Schritt 3: Commit**

```bash
git add CLAUDE.md docs/superpowers/specs/done/2026-04-21-email-onboarding-design.md
git commit -m "docs: E-Mail-Onboarding abgeschlossen – Spec nach done/, CLAUDE.md aktualisiert"
```
