# Mailbox-Automatisierung: N8N + Telegram-Bot

> **For agentic workers:** This spec is ready for implementation planning via `superpowers:writing-plans`.

**Goal:** Vollautomatische Verarbeitung von `hallo@fordify.de` — IMAP-Polling, KI-Zusammenfassung, Telegram-Benachrichtigung mit bidirektionalem Bot (Text + Sprache), SMTP-Antwortversand.

**Tech Stack:** N8N (Hostinger VPS), OpenAI (GPT-4o-mini + Whisper), Telegram Bot API, IMAP/SMTP (All-Inkl `w017df85.kasserver.com`), N8N Static Data für Kontext-Speicherung.

---

## 1. Ordnerstruktur (IMAP)

Fünf Ordner werden in `hallo@fordify.de` angelegt:

| Ordner | Befüllung |
|---|---|
| `Support/` | E-Mails an `support@fordify.de` |
| `Legal/` | E-Mails an `legal@fordify.de` |
| `Datenschutz/` | E-Mails an `datenschutz@fordify.de` |
| `Allgemein/` | Direkt an `hallo@fordify.de` |
| `Erledigt/` | Manuell oder per Bot markiert |

Kategorisierung erfolgt über den `X-Original-To`-Header, den All-Inkl beim Weiterleiten setzt. Der Posteingang (Inbox) bleibt dauerhaft leer.

---

## 2. Workflow 1 — E-Mail-Eingang (IMAP → Telegram)

**Trigger:** IMAP Email Trigger, Polling alle **15 Minuten**.

**Node-Kette:**

```
IMAP Trigger
  → Code: X-Original-To parsen → Kategorie (Support/Legal/Datenschutz/Allgemein)
  → OpenAI GPT-4o-mini: Zusammenfassung + Priorität
  → IMAP: Mail in Kategorieordner verschieben
  → Code: Skalierungs-Check (Static Data Tageszähler)
      ├── Einzelbenachrichtigung (< Schwellenwert oder Priorität 🔴)
      └── Digest-Sammlung (≥ Schwellenwert + Priorität normal/niedrig)
  → Telegram: Nachricht senden
```

**GPT-4o-mini Prompt (Zusammenfassung):**
- Zusammenfassung in max. 3 Sätzen
- Priorität: `hoch` (Legal, Datenschutz, Beschwerden), `normal` (Support-Fragen), `niedrig` (Allgemeines, Automails)
- Ausgabe als JSON: `{ "summary": "...", "priority": "hoch|normal|niedrig" }`

**Telegram-Nachricht (Einzelbenachrichtigung):**
```
🔴 [LEGAL] Max Mustermann · absender@beispiel.de
Betreff: Kündigung fordify-Abo

KI: Nutzer kündigt sein Abo zum Monatsende. Bittet um
Bestätigung. Keine sofortige Aktion nötig.

[✅ Erledigt]  [📝 Antworten]  [⏰ Später]
```

Priorität-Emoji: 🔴 hoch · 🟡 normal · ⚪ niedrig

**Callback-Daten der Buttons:** `erledigt:{uid}`, `antworten:{uid}`, `spaeter:{uid}` — die IMAP-UID identifiziert die Mail eindeutig.

**Static Data — Kontext-Cache:**
Beim Senden der Benachrichtigung wird gespeichert:
```json
{
  "{uid}": {
    "from": "absender@beispiel.de",
    "replyTo": "absender@beispiel.de",
    "subject": "Kündigung fordify-Abo",
    "body": "...(Original-Text)...",
    "folder": "Legal"
  }
}
```
Der Cache überlebt keine N8N-Restarts, was akzeptabel ist (alte Notifications sind dann obsolet).

**Skalierungsmodus:**
- Variable `DIGEST_THRESHOLD` (Default: `20`) oben im Workflow
- Static Data Zähler `mail_count_YYYY-MM-DD` zählt Mails pro Tag
- Ab Schwellenwert: nur 🔴 Priorität als Einzelmeldung, Rest gesammelt
- Täglicher Digest um 18:00 Uhr via separatem Cron-Workflow (Workflow 3)

---

## 3. Workflow 2 — Telegram-Reaktion (Webhook → Aktion)

**Trigger:** Telegram Webhook (N8N Webhook-Node, URL in Telegram Bot API registriert).

**Switch nach Nachrichten-Typ:**

```
Telegram Webhook
  → Switch: update_type
      ├── callback_query  → Button-Handler
      ├── message.text    → Text-Handler
      └── message.voice   → Voice-Handler
```

### 3a. Button-Handler (callback_query)

Switch nach `callback_data` Präfix:

- **`erledigt:{uid}`**
  1. Mail per IMAP UID in `Erledigt/` verschieben
  2. Telegram: Nachricht editieren → ✓ mit Timestamp

- **`antworten:{uid}`**
  1. UID in Static Data als `pending_reply` speichern
  2. Telegram: *„Was soll ich schreiben? Schick mir Text oder eine Sprachnachricht."*

- **`spaeter:{uid}`**
  1. Telegram: *„Ok, Mail bleibt in [Ordner]."* (kurze Bestätigung, Nachricht bleibt)

### 3b. Text-Handler

Voraussetzung: `pending_reply` in Static Data gesetzt.

```
Text empfangen
  → Static Data: Kontext für pending_reply-UID laden
  → OpenAI GPT-4o-mini: E-Mail-Entwurf generieren
      System-Prompt: "Du bist E-Mail-Assistent für fordify.
       Erstelle eine professionelle Antwort auf Basis der
       Nutzer-Anweisung. Analysiere die Original-Mail:
       Siezt der Absender → antworte mit Sie.
       Duzt der Absender → antworte mit du.
       Unterschreibe immer mit 'Jens Wittern / fordify'."
  → Telegram: Entwurf zeigen
      [✉️ Absenden]  [✏️ Nochmal]  [❌ Abbrechen]
```

- **`absenden`:** SMTP Reply senden, Mail in `Erledigt/` verschieben, `pending_reply` löschen
- **`nochmal`:** `pending_reply` bleibt, Telegram: *„Was soll ich ändern?"*
- **`abbrechen`:** `pending_reply` löschen, Telegram: *„Abgebrochen."*

### 3c. Voice-Handler

```
Voice-Nachricht empfangen
  → Telegram API: Datei-URL abrufen
  → HTTP Request: OGG-Datei herunterladen
  → OpenAI Whisper: transkribieren
  → Telegram: Bestätigung „Verstanden: ‚[Transkript]'"
  → weiter wie Text-Handler ab GPT-4o-mini Entwurf
```

---

## 4. Workflow 3 — Tages-Digest (Cron, 18:00 Uhr)

Nur aktiv wenn Digest-Modus greift:

```
Cron 18:00
  → Static Data: gesammelte Digest-Mails des Tages laden
  → Wenn leer: nichts senden
  → Telegram: Digest-Nachricht
      „📬 5 neue Mails heute
       2× 🟡 Support · 2× ⚪ Allgemein · 1× 🟡 Legal
       [Übersicht anzeigen]"
  → Static Data: Digest-Sammlung leeren
```

---

## 5. Telegram Bot Setup

- Bot via @BotFather erstellen → Token in N8N Credential
- Webhook-URL bei Telegram registrieren: `POST https://api.telegram.org/bot{TOKEN}/setWebhook`
- **Chat-ID-Filter:** Webhook-Handler prüft, dass Nachrichten nur von deiner Telegram-ID kommen — kein Zugriff durch Dritte möglich
- Nur ein Chat (kein Group-Bot), kein öffentlicher Zugang

---

## 6. Credentials (in N8N zu hinterlegen)

| Credential | Wert |
|---|---|
| IMAP | Host: `w017df85.kasserver.com`, Port: 993 (SSL), User: `hallo@fordify.de` |
| SMTP | Host: `w017df85.kasserver.com`, Port: 465 (SSL), User: `hallo@fordify.de` |
| OpenAI | Bestehender API Key aus .env |
| Telegram | Bot Token (neu via @BotFather), Chat ID (deine Telegram ID) |

---

## 7. Nicht im Scope

- Web-Dashboard über Posteingang (→ wäre Ansatz 2 mit Supabase)
- Mehrere Empfänger / Team-Inbox
- Automatische Antworten ohne manuelle Bestätigung (Sicherheitsrisiko)
