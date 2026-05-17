# Mailbox-Automatisierung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vollautomatische Verarbeitung von `hallo@fordify.de` über 3 N8N-Workflows — IMAP-Polling alle 15 Minuten, GPT-4o-mini Zusammenfassung, Telegram-Benachrichtigung mit Buttons, bidirektionaler Bot (Text + Sprache), SMTP-Antwortversand.

**Architecture:** Drei N8N-Workflows: (1) IMAP-Trigger → Kategorisierung → Telegram-Notification, (2) Telegram-Webhook → Button/Text/Voice-Handler → SMTP-Reply, (3) Tages-Digest-Cron. Zustandsspeicherung via N8N Static Data (kein externes DB). N8N läuft auf Hostinger VPS `n8n.srv1063720.hstgr.cloud`.

**Tech Stack:** N8N (Hostinger VPS), IMAP/SMTP (All-Inkl `w017df85.kasserver.com`), OpenAI GPT-4o-mini + Whisper, Telegram Bot API, N8N REST API (`N8N_API_KEY` in .env)

---

## Vorbedingung: Telegram-Bot Setup (manuell durch Jens)

Bevor die Workflows implementiert werden können, muss Jens folgende Schritte abschließen:

1. Telegram-App installieren (iOS/Android/Desktop)
2. `@BotFather` in Telegram suchen und öffnen
3. `/newbot` senden → Name: `fordify Mailbox` → Username: `fordify_mailbox_bot` (oder ähnlich)
4. **Bot Token** aus der Antwort kopieren und in `.env` eintragen: `TELEGRAM_BOT_TOKEN=...`
5. `@userinfobot` in Telegram suchen → öffnen → auf "Start" klicken → **Chat ID** notieren
6. In `.env` eintragen: `TELEGRAM_CHAT_ID=...` (die Zahl, z.B. `123456789`)

---

## File Structure

```
N8N Workflows (in N8N UI, via REST API):
  Workflow 1: "fordify – E-Mail-Eingang"
  Workflow 2: "fordify – Telegram-Reaktion"
  Workflow 3: "fordify – Tages-Digest"

N8N Credentials (in N8N UI):
  "fordify IMAP"     → All-Inkl IMAP
  "fordify SMTP"     → All-Inkl SMTP
  "fordify OpenAI"   → (ggf. schon vorhanden)
  "fordify Telegram" → Bot Token

Lokale Hilfsskripte (nur für Deployment):
  scripts/n8n-register-webhook.sh  ← Telegram Webhook registrieren
```

---

## Task 1: IMAP-Ordner anlegen (manuell)

**Dateien:** keine (Änderung im All-Inkl Webmail)

- [ ] **Step 1: All-Inkl Webmail öffnen**

  URL: `https://www.kasserver.com/` → Webmail → Login mit `hallo@fordify.de` + Passwort (in `.env` → `HALLO_EMAIL_PASSWORD`)

- [ ] **Step 2: Ordner erstellen**

  Im Webmail-Interface (KAS Webmail oder Roundcube) folgende 5 Ordner als Unterordner des Posteingangs anlegen:

  ```
  Support
  Legal
  Datenschutz
  Allgemein
  Erledigt
  ```

  Reihenfolge: Rechtsklick auf "Posteingang" (oder "+ Ordner" Button) → Namen eingeben → Bestätigen. Alle 5 Ordner anlegen.

- [ ] **Step 3: Verifikation**

  Ordner erscheinen in der linken Sidebar des Webmails. IMAP-Ordnerpfade lauten:
  - `INBOX.Support`
  - `INBOX.Legal`
  - `INBOX.Datenschutz`
  - `INBOX.Allgemein`
  - `INBOX.Erledigt`

  *(All-Inkl verwendet standardmäßig `INBOX.` als Präfix für Unterordner)*

- [ ] **Step 4: Commit**

  ```bash
  git add docs/superpowers/plans/2026-04-24-mailbox-automation.md
  git commit -m "docs: Implementierungsplan Mailbox-Automatisierung"
  ```

---

## Task 2: N8N Credentials anlegen

**Dateien:** keine (Änderung im N8N UI)

**Voraussetzung:** N8N Dashboard öffnen unter `https://n8n.srv1063720.hstgr.cloud` (Login mit N8N-Credentials)

- [ ] **Step 1: IMAP Credential anlegen**

  N8N → Settings → Credentials → "+ Add Credential" → "IMAP"

  Werte:
  ```
  Name:     fordify IMAP
  Host:     w017df85.kasserver.com
  Port:     993
  Security: SSL/TLS
  User:     hallo@fordify.de
  Password: [aus .env: HALLO_EMAIL_PASSWORD]
  ```

  "Test" klicken → grüner Haken → "Save"

- [ ] **Step 2: SMTP Credential anlegen**

  N8N → Settings → Credentials → "+ Add Credential" → "SMTP"

  Werte:
  ```
  Name:     fordify SMTP
  Host:     w017df85.kasserver.com
  Port:     465
  Security: SSL/TLS
  User:     hallo@fordify.de
  Password: [aus .env: HALLO_EMAIL_PASSWORD]
  ```

  "Test" → "Save"

- [ ] **Step 3: OpenAI Credential prüfen / anlegen**

  N8N → Settings → Credentials → suchen ob "OpenAI" schon existiert. Falls ja, weiter. Falls nein:

  "+ Add Credential" → "OpenAI"
  ```
  Name:    fordify OpenAI
  API Key: [aus .env: OPENAI_API_KEY]
  ```
  "Save"

- [ ] **Step 4: Telegram Credential anlegen**

  N8N → Settings → Credentials → "+ Add Credential" → "Telegram"

  Werte:
  ```
  Name:        fordify Telegram
  Access Token: [TELEGRAM_BOT_TOKEN aus .env]
  ```
  "Save"

---

## Task 3: Workflow 1 — IMAP Trigger + Kategorisierung + GPT-Zusammenfassung

**Ziel:** E-Mails empfangen, X-Original-To-Header parsen, GPT-4o-mini Zusammenfassung + Priorität ermitteln, Mail in Kategorieordner verschieben.

- [ ] **Step 1: Neuen Workflow anlegen**

  N8N → "+ New Workflow" → Name: `fordify – E-Mail-Eingang` → Save

- [ ] **Step 2: IMAP Email Trigger Node**

  "+ Add Node" → "Email Trigger (IMAP)"

  Konfiguration:
  ```
  Credential:            fordify IMAP
  Mailbox Name:          INBOX
  Action:                Read → Mark as Read → Move (wir verschieben manuell per Code)
  Polling Time:          Every 15 Minutes
  Download Attachments:  No
  Format:                Simple
  ```

  Wichtig: "Get New Emails Only" = Yes

  Verifikation: "Execute Node" → sollte ohne Fehler laufen (auch wenn Inbox leer)

- [ ] **Step 3: Code Node — X-Original-To parsen**

  "+ Add Node" → "Code" → JavaScript

  Name: `Kategorie bestimmen`

  ```javascript
  const items = $input.all();
  return items.map(item => {
    const headers = item.json.headers || {};
    // All-Inkl setzt X-Original-To beim Weiterleiten
    const originalTo = (
      headers['x-original-to'] ||
      headers['X-Original-To'] ||
      item.json.to ||
      ''
    ).toLowerCase();

    let category = 'Allgemein';
    if (originalTo.includes('support@fordify.de'))      category = 'Support';
    else if (originalTo.includes('legal@fordify.de'))   category = 'Legal';
    else if (originalTo.includes('datenschutz@fordify')) category = 'Datenschutz';

    return {
      json: {
        ...item.json,
        category,
        uid: item.json.uid || item.json.messageId || String(Date.now()),
        fromEmail: item.json.from?.value?.[0]?.address || item.json.from || '',
        fromName:  item.json.from?.value?.[0]?.name    || '',
        subject:   item.json.subject || '(kein Betreff)',
        bodyText:  (item.json.text || item.json.html || '').substring(0, 2000)
      }
    };
  });
  ```

  "Execute Node" mit einer Test-Mail → Output muss `category`, `uid`, `fromEmail`, `subject`, `bodyText` enthalten.

- [ ] **Step 4: OpenAI Node — Zusammenfassung + Priorität**

  "+ Add Node" → "OpenAI" → "Message a Model"

  Konfiguration:
  ```
  Credential: fordify OpenAI
  Model:      gpt-4o-mini
  ```

  System Message (aus "System" Tab):
  ```
  Du bist ein E-Mail-Assistent für fordify, ein juristisches SaaS-Tool für Anwaltskanzleien.
  Fasse die E-Mail in maximal 3 prägnanten Sätzen zusammen.
  Bestimme die Priorität:
  - "hoch": Legal-Themen, Datenschutzanfragen, Beschwerden, Kündigungen, rechtliche Anforderungen
  - "normal": Support-Fragen, technische Probleme, allgemeine Anfragen von Kunden
  - "niedrig": Automails, Newsletter, allgemeine Infomails

  Antworte ausschließlich als JSON ohne Markdown:
  {"summary": "...", "priority": "hoch|normal|niedrig"}
  ```

  User Message (Expression):
  ```
  Von: {{ $json.fromName }} <{{ $json.fromEmail }}>
  Betreff: {{ $json.subject }}
  Kategorie: {{ $json.category }}

  {{ $json.bodyText }}
  ```

  Verifikation: "Execute Node" → Output enthält `message.content` mit JSON-String

- [ ] **Step 5: Code Node — GPT-Antwort parsen**

  "+ Add Node" → "Code" → Name: `GPT-Antwort parsen`

  ```javascript
  const items = $input.all();
  return items.map(item => {
    let summary = 'Zusammenfassung nicht verfügbar';
    let priority = 'normal';
    try {
      const content = item.json.message?.content || item.json.text || '{}';
      const parsed = JSON.parse(content);
      summary  = parsed.summary  || summary;
      priority = parsed.priority || priority;
    } catch (e) {}

    const priorityEmoji = priority === 'hoch' ? '🔴' : priority === 'normal' ? '🟡' : '⚪';

    return {
      json: {
        ...item.json,
        summary,
        priority,
        priorityEmoji
      }
    };
  });
  ```

- [ ] **Step 6: IMAP Node — Mail in Kategorieordner verschieben**

  "+ Add Node" → "Email (IMAP)" → Action: "Move Message"

  Konfiguration:
  ```
  Credential:    fordify IMAP
  Mailbox:       INBOX
  Message UID:   {{ $json.uid }}
  Destination:   INBOX.{{ $json.category }}
  ```

  Verifikation: Mail erscheint nach Ausführung im richtigen Unterordner im Webmail.

- [ ] **Step 7: Alle Nodes verbinden und testen**

  Nodes in Reihenfolge verbinden:
  ```
  IMAP Trigger → Kategorie bestimmen → OpenAI → GPT-Antwort parsen → IMAP Move
  ```

  Workflow speichern. "Execute Workflow" → Test-Mail an `hallo@fordify.de` schicken → Nach max. 15 Minuten (oder manuell triggern) erscheint Mail im richtigen Unterordner mit GPT-Analyse im Output.

---

## Task 4: Workflow 1 — Static Data Kontext-Cache + Telegram-Notification

**Ziel:** E-Mail-Kontext in Static Data speichern (für spätere Antwort-Funktion), Skalierungs-Check, Telegram-Benachrichtigung mit Inline-Buttons senden.

- [ ] **Step 1: Code Node — Kontext in Static Data speichern + Scaling-Check**

  Im bestehenden Workflow, nach "GPT-Antwort parsen", Node einfügen:
  Name: `Cache + Scaling-Check`

  ```javascript
  const DIGEST_THRESHOLD = 20;
  const today = new Date().toISOString().substring(0, 10); // YYYY-MM-DD

  const staticData = $getWorkflowStaticData('global');

  // Tageszähler
  const counterKey = `mail_count_${today}`;
  staticData[counterKey] = (staticData[counterKey] || 0) + 1;
  const dailyCount = staticData[counterKey];

  const items = $input.all();
  return items.map(item => {
    const uid = item.json.uid;

    // Kontext für spätere Antwort cachen
    staticData[`ctx_${uid}`] = {
      from:     item.json.fromEmail,
      replyTo:  item.json.fromEmail,
      subject:  item.json.subject,
      body:     item.json.bodyText,
      folder:   item.json.category,
      fromName: item.json.fromName
    };

    // Skalierungsmodus: Einzelmeldung vs. Digest
    const digestMode = dailyCount >= DIGEST_THRESHOLD && item.json.priority !== 'hoch';

    return {
      json: {
        ...item.json,
        dailyCount,
        digestMode
      }
    };
  });
  ```

- [ ] **Step 2: IF Node — Einzelmeldung vs. Digest**

  "+ Add Node" → "IF"

  Bedingung:
  ```
  {{ $json.digestMode }} === false
  ```

  True-Branch → Einzelmeldung (Telegram-Notification)
  False-Branch → Digest-Sammlung (nächster Step)

- [ ] **Step 3: Code Node — Digest akkumulieren (False-Branch)**

  Name: `Digest sammeln`

  ```javascript
  const today = new Date().toISOString().substring(0, 10);
  const staticData = $getWorkflowStaticData('global');
  const digestKey = `digest_${today}`;

  if (!staticData[digestKey]) staticData[digestKey] = [];

  const items = $input.all();
  items.forEach(item => {
    staticData[digestKey].push({
      category: item.json.category,
      priority: item.json.priority,
      priorityEmoji: item.json.priorityEmoji,
      subject:  item.json.subject,
      uid:      item.json.uid
    });
  });

  // Keine weitere Aktion — Digest wird durch Workflow 3 gesendet
  return [];
  ```

- [ ] **Step 4: Telegram Node — Einzelbenachrichtigung senden (True-Branch)**

  "+ Add Node" → "Telegram" → "Send Message"

  Konfiguration:
  ```
  Credential:  fordify Telegram
  Chat ID:     [TELEGRAM_CHAT_ID aus .env]
  Message Type: Text
  Parse Mode:  Markdown
  ```

  Text (Expression):
  ```
  {{ $json.priorityEmoji }} *[{{ $json.category.toUpperCase() }}]* {{ $json.fromName || $json.fromEmail }}
  Von: {{ $json.fromEmail }}
  Betreff: {{ $json.subject }}

  KI: {{ $json.summary }}
  ```

  Unter "Additional Fields" → "Reply Markup" → "Inline Keyboard":
  ```json
  {
    "inline_keyboard": [[
      {"text": "✅ Erledigt", "callback_data": "erledigt:{{ $json.uid }}"},
      {"text": "📝 Antworten", "callback_data": "antworten:{{ $json.uid }}"},
      {"text": "⏰ Später", "callback_data": "spaeter:{{ $json.uid }}"}
    ]]
  }
  ```

  *(Hinweis: N8N Telegram Node "Reply Markup" kann als JSON-Expression gesetzt werden)*

- [ ] **Step 5: Workflow komplett verbinden**

  ```
  IMAP Trigger
    → Kategorie bestimmen
    → OpenAI
    → GPT-Antwort parsen
    → IMAP Move
    → Cache + Scaling-Check
    → IF (digestMode)
        True  → [leer / kein Node nötig]
        False → Digest sammeln
    → [beide Branches mergen oder True-Branch direkt zu Telegram]
    → Telegram Send (nur True-Branch)
  ```

  *(Im N8N Editor: True-Branch des IF-Nodes mit Telegram verbinden; False-Branch mit "Digest sammeln")*

- [ ] **Step 6: Workflow aktivieren + End-to-End-Test**

  Workflow → Toggle "Active" einschalten.

  Test: E-Mail an `hallo@fordify.de` schicken → nach max. 15 Minuten kommt Telegram-Nachricht mit Buttons.

  Verifikation:
  - Mail erscheint im korrekten IMAP-Unterordner
  - Telegram-Nachricht enthält `priorityEmoji`, Kategorie, Absender, Betreff, KI-Zusammenfassung
  - Drei Buttons sichtbar

---

## Task 5: Workflow 2 — Telegram Webhook + Button-Handler

**Ziel:** Telegram-Webhook empfangen, nach Update-Typ switchen, Button-Callbacks verarbeiten (Erledigt/Antworten/Später).

- [ ] **Step 1: Neuen Workflow anlegen**

  N8N → "+ New Workflow" → Name: `fordify – Telegram-Reaktion` → Save

- [ ] **Step 2: Webhook Trigger Node**

  "+ Add Node" → "Webhook"

  Konfiguration:
  ```
  HTTP Method:        POST
  Path:               fordify-telegram
  Response Mode:      Immediately (respond with 200 OK)
  Response Code:      200
  Response Data:      First Entry JSON
  ```

  **Webhook-URL notieren** — sieht aus wie:
  `https://n8n.srv1063720.hstgr.cloud/webhook/fordify-telegram`

  Diese URL wird in Task 9 bei Telegram registriert.

- [ ] **Step 3: Code Node — Chat-ID-Filter + Update-Typ bestimmen**

  Name: `Security + Routing`

  ```javascript
  const MY_CHAT_ID = 'TELEGRAM_CHAT_ID_PLACEHOLDER'; // wird in N8N als Variable gesetzt

  const body = $input.first().json.body || $input.first().json;

  // Sicherheitscheck: nur eigene Chat-ID
  const chatId = (
    body?.message?.chat?.id ||
    body?.callback_query?.message?.chat?.id
  )?.toString();

  if (chatId !== MY_CHAT_ID) {
    return []; // ignorieren
  }

  let updateType = 'unknown';
  let callbackData = null;
  let text = null;
  let voiceFileId = null;
  let messageId = null;

  if (body.callback_query) {
    updateType    = 'callback_query';
    callbackData  = body.callback_query.data || '';
    messageId     = body.callback_query.message?.message_id;
  } else if (body.message?.voice) {
    updateType   = 'voice';
    voiceFileId  = body.message.voice.file_id;
    messageId    = body.message.message_id;
  } else if (body.message?.text) {
    updateType = 'text';
    text       = body.message.text;
    messageId  = body.message.message_id;
  }

  return [{
    json: { updateType, callbackData, text, voiceFileId, messageId, chatId, raw: body }
  }];
  ```

  **Wichtig:** `MY_CHAT_ID` muss mit der echten Telegram-Chat-ID ersetzt werden (aus `.env: TELEGRAM_CHAT_ID`). In N8N kann man unter Workflow-Settings eine Variable `TELEGRAM_CHAT_ID` hinterlegen und via `$vars.TELEGRAM_CHAT_ID` referenzieren — oder direkt als String eintragen.

- [ ] **Step 4: Switch Node — Update-Typ**

  "+ Add Node" → "Switch"

  Wert: `{{ $json.updateType }}`

  Routen:
  ```
  Route 1: callback_query  → [Button-Handler Branch]
  Route 2: text            → [Text-Handler Branch]
  Route 3: voice           → [Voice-Handler Branch]
  Fallback: Nichts (kein Output)
  ```

- [ ] **Step 5: Code Node — Button-Typ bestimmen (callback_query-Branch)**

  Name: `Callback Routing`

  ```javascript
  const item = $input.first().json;
  const cb = item.callbackData || '';

  let action = 'unknown';
  let uid = '';

  if (cb.startsWith('erledigt:')) {
    action = 'erledigt';
    uid    = cb.replace('erledigt:', '');
  } else if (cb.startsWith('antworten:')) {
    action = 'antworten';
    uid    = cb.replace('antworten:', '');
  } else if (cb.startsWith('spaeter:')) {
    action = 'spaeter';
    uid    = cb.replace('spaeter:', '');
  } else if (cb.startsWith('absenden:')) {
    action = 'absenden';
    uid    = cb.replace('absenden:', '');
  } else if (cb.startsWith('nochmal:')) {
    action = 'nochmal';
    uid    = cb.replace('nochmal:', '');
  } else if (cb === 'abbrechen') {
    action = 'abbrechen';
  }

  return [{ json: { ...item, action, uid } }];
  ```

- [ ] **Step 6: Switch Node — Button-Aktion**

  "+ Add Node" → "Switch"

  Wert: `{{ $json.action }}`

  Routen: `erledigt`, `antworten`, `spaeter`, `absenden`, `nochmal`, `abbrechen`

- [ ] **Step 7: IMAP Move Node — "Erledigt" Branch**

  "+ Add Node" → "Email (IMAP)" → "Move Message"
  ```
  Credential:  fordify IMAP
  Message UID: {{ $json.uid }}
  Mailbox:     INBOX.{{ ($getWorkflowStaticData('global')[`ctx_${$json.uid}`] || {}).folder || 'Allgemein' }}
  Destination: INBOX.Erledigt
  ```

  Danach → Telegram Node → "Edit Message Text"
  ```
  Credential:  fordify Telegram
  Chat ID:     {{ $json.chatId }}
  Message ID:  {{ $json.messageId }}
  Text:        ✓ Erledigt — {{ new Date().toLocaleString('de-DE') }}
  ```

- [ ] **Step 8: Code Node — "Antworten" Branch**

  Name: `Antworten vorbereiten`

  ```javascript
  const item = $input.first().json;
  const staticData = $getWorkflowStaticData('global');
  staticData['pending_reply'] = item.uid;
  return [{ json: { ...item, pendingSet: true } }];
  ```

  Danach → Telegram Node → "Send Message"
  ```
  Chat ID: {{ $json.chatId }}
  Text: 📝 Was soll ich schreiben? Schick mir Text oder eine Sprachnachricht.
  ```

- [ ] **Step 9: Telegram Node — "Später" Branch**

  "+ Add Node" → "Telegram" → "Send Message"
  ```
  Chat ID: {{ $json.chatId }}
  Text: ⏰ Ok, Mail bleibt im Ordner. Kein weiterer Schritt nötig.
  ```

- [ ] **Step 10: Verifikation Button-Handler**

  Workflow aktivieren. Test:
  1. Eine Test-E-Mail schicken → warten auf Telegram-Benachrichtigung aus Workflow 1
  2. "✅ Erledigt" Button drücken → Mail erscheint in `INBOX.Erledigt`, Telegram-Nachricht wird zu "✓ Erledigt" editiert
  3. Neue E-Mail → "📝 Antworten" drücken → Bot antwortet mit Aufforderung
  4. "⏰ Später" → Bot bestätigt

---

## Task 6: Workflow 2 — Text-Handler (Antwort-Entwurf via GPT-4o-mini)

**Ziel:** Text-Nachricht als Antwort-Anweisung interpretieren, GPT-4o-mini Entwurf generieren, Entwurf mit Aktions-Buttons zeigen.

- [ ] **Step 1: Code Node — Kontext für pending_reply laden (Text-Branch)**

  Name: `Kontext laden`

  ```javascript
  const staticData = $getWorkflowStaticData('global');
  const uid = staticData['pending_reply'];

  if (!uid) {
    // Kein pending_reply → ignorieren
    return [{ json: { noPendingReply: true } }];
  }

  const ctx = staticData[`ctx_${uid}`];
  if (!ctx) {
    return [{ json: { noPendingReply: true, reason: 'context_expired' } }];
  }

  const item = $input.first().json;
  return [{
    json: {
      ...item,
      uid,
      pendingFrom:    ctx.from,
      pendingFromName: ctx.fromName || ctx.from,
      pendingSubject: ctx.subject,
      pendingBody:    ctx.body,
      pendingFolder:  ctx.folder,
      userInstruction: item.text
    }
  }];
  ```

- [ ] **Step 2: IF Node — pending_reply vorhanden?**

  Bedingung: `{{ $json.noPendingReply }}` !== `true`

  False-Branch (kein pending): Nichts tun oder optionale Hilfe-Nachricht senden.
  True-Branch: weiter zu OpenAI.

- [ ] **Step 3: OpenAI Node — E-Mail-Entwurf generieren**

  "+ Add Node" → "OpenAI" → "Message a Model"
  ```
  Credential: fordify OpenAI
  Model:      gpt-4o-mini
  ```

  System Message:
  ```
  Du bist E-Mail-Assistent für fordify, ein juristisches SaaS-Tool.
  Erstelle eine professionelle E-Mail-Antwort auf Basis der Nutzer-Anweisung.

  Regeln:
  - Wenn die Original-Mail den Absender mit "Sie" anspricht: Antworte mit "Sie"
  - Wenn die Original-Mail duzt: Antworte mit "du"
  - Analysiere dafür die Anredeform im Original-Mailtext
  - Unterschreibe immer mit: "Mit freundlichen Grüßen\nJens Wittern / fordify"
  - Kein Markdown, nur Plain Text
  - Keine Betreffzeile generieren
  ```

  User Message:
  ```
  Anweisung: {{ $json.userInstruction }}

  Original-Mail:
  Von: {{ $json.pendingFromName }} <{{ $json.pendingFrom }}>
  Betreff: {{ $json.pendingSubject }}

  {{ $json.pendingBody }}
  ```

- [ ] **Step 4: Code Node — Entwurf extrahieren**

  Name: `Entwurf formatieren`

  ```javascript
  const item = $input.first().json;
  const draft = item.message?.content || item.text || '(kein Entwurf)';

  return [{
    json: {
      ...item,
      emailDraft: draft
    }
  }];
  ```

- [ ] **Step 5: Telegram Node — Entwurf mit Aktions-Buttons zeigen**

  "+ Add Node" → "Telegram" → "Send Message"
  ```
  Credential:  fordify Telegram
  Chat ID:     {{ $json.chatId }}
  Parse Mode:  None (kein Markdown, da Entwurf Plain Text ist)
  ```

  Text:
  ```
  📧 Entwurf an {{ $json.pendingFrom }}:

  ---
  {{ $json.emailDraft }}
  ---
  ```

  Reply Markup (Inline Keyboard):
  ```json
  {
    "inline_keyboard": [[
      {"text": "✉️ Absenden", "callback_data": "absenden:{{ $json.uid }}"},
      {"text": "✏️ Nochmal", "callback_data": "nochmal:{{ $json.uid }}"},
      {"text": "❌ Abbrechen", "callback_data": "abbrechen"}
    ]]
  }
  ```

- [ ] **Step 6: "Absenden" Branch — SMTP Reply senden**

  Code Node — Kontext + Entwurf laden:
  ```javascript
  const staticData = $getWorkflowStaticData('global');
  const uid = $input.first().json.uid;
  const ctx = staticData[`ctx_${uid}`] || {};

  // Draft wurde zuletzt gesendet — wir brauchen ihn nicht mehr aus Static Data
  // Da der Draft im Callback nicht mitgegeben wird, muss er zwischengespeichert sein.
  // Temporären Draft-Cache schreiben in Task 6, Step 3 (Code "Entwurf formatieren"):
  // staticData[`draft_${uid}`] = draft;
  // Hier lesen:
  const draft = staticData[`draft_${uid}`] || '(Entwurf nicht gefunden)';

  // pending_reply + cache bereinigen
  delete staticData['pending_reply'];
  delete staticData[`draft_${uid}`];
  delete staticData[`ctx_${uid}`];

  return [{
    json: {
      ...($input.first().json),
      toEmail:   ctx.replyTo || ctx.from,
      subject:   `Re: ${ctx.subject || ''}`,
      emailDraft: draft,
      folder:    ctx.folder || 'Allgemein'
    }
  }];
  ```

  **Wichtig:** In Step 4 (`Entwurf formatieren`) zusätzlich den Draft in Static Data cachen:
  ```javascript
  staticData[`draft_${item.uid}`] = draft; // vor return einfügen
  ```

  Danach → "Send Email (SMTP)" Node:
  ```
  Credential: fordify SMTP
  From:       hallo@fordify.de
  To:         {{ $json.toEmail }}
  Subject:    {{ $json.subject }}
  Text:       {{ $json.emailDraft }}
  ```

  Danach → IMAP Move Node:
  ```
  Credential:  fordify IMAP
  Message UID: {{ $json.uid }}
  Mailbox:     INBOX.{{ $json.folder }}
  Destination: INBOX.Erledigt
  ```

  Danach → Telegram → "Send Message":
  ```
  Text: ✉️ Gesendet und als erledigt markiert.
  ```

- [ ] **Step 7: "Nochmal" Branch**

  Telegram → "Send Message":
  ```
  Text: ✏️ Was soll ich ändern?
  ```

  *(pending_reply bleibt gesetzt, nächste Text-Nachricht startet neuen Entwurf)*

- [ ] **Step 8: "Abbrechen" Branch**

  Code Node:
  ```javascript
  const staticData = $getWorkflowStaticData('global');
  delete staticData['pending_reply'];
  return [$input.first()];
  ```

  Telegram → "Send Message":
  ```
  Text: ❌ Abgebrochen.
  ```

- [ ] **Step 9: Verifikation Text-Handler**

  Test:
  1. E-Mail schicken → Telegram-Notification → "📝 Antworten" klicken
  2. In Telegram schreiben: "Bestätige den Eingang und sage, dass wir uns darum kümmern"
  3. GPT-Entwurf erscheint mit Buttons
  4. "✉️ Absenden" → Bestätigungs-Nachricht → Mail-Antwort geht raus, Mail landet in Erledigt

---

## Task 7: Workflow 2 — Voice-Handler (Whisper-Transkription)

**Ziel:** Sprachnachricht empfangen, via Telegram API Datei-URL ermitteln, Whisper transkribieren, dann identisch zu Text-Handler weiterverfahren.

- [ ] **Step 1: HTTP Request Node — Telegram File Info abrufen (Voice-Branch)**

  "+ Add Node" → "HTTP Request"

  Konfiguration:
  ```
  Method:  GET
  URL:     https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/getFile?file_id={{ $json.voiceFileId }}
  ```

  *(N8N-Umgebungsvariable `TELEGRAM_BOT_TOKEN` muss in N8N Settings → Variables hinterlegt sein)*

  Output enthält `result.file_path`.

- [ ] **Step 2: HTTP Request Node — OGG-Datei herunterladen**

  "+ Add Node" → "HTTP Request"

  Konfiguration:
  ```
  Method:           GET
  URL:              https://api.telegram.org/file/bot{{ $env.TELEGRAM_BOT_TOKEN }}/{{ $json.result.file_path }}
  Response Format:  File
  ```

  Output: Binary-Datei (`data` Property)

- [ ] **Step 3: OpenAI Node — Whisper Transkription**

  "+ Add Node" → "OpenAI" → "Transcribe Recording"

  Konfiguration:
  ```
  Credential:   fordify OpenAI
  Input Type:   Binary File
  Input Field:  data
  Language:     de
  ```

  Output: `text` (transkribierter Text)

- [ ] **Step 4: Code Node — Transkript aufbereiten**

  Name: `Voice → Text`

  ```javascript
  const item = $input.first().json;
  const transcript = item.text || '';
  return [{
    json: {
      ...item,
      text: transcript,  // identisches Format wie Text-Handler
      updateType: 'text' // damit folgende Nodes identisch reagieren
    }
  }];
  ```

- [ ] **Step 5: Telegram Node — Transkript bestätigen**

  "+ Add Node" → "Telegram" → "Send Message"
  ```
  Chat ID: {{ $json.chatId }}
  Text: 🎤 Verstanden: "{{ $json.text }}"
  ```

- [ ] **Step 6: Weiter wie Text-Handler**

  Die weiteren Nodes (Kontext laden, OpenAI Entwurf, Entwurf zeigen) sind identisch zu Task 6.

  **Lösung:** Im N8N-Editor den Voice-Branch nach der Bestätigungs-Nachricht mit dem gleichen Node verbinden, der auch vom Text-Branch aus "Kontext laden" startet.

  *(N8N erlaubt, dass mehrere Branches in denselben Node münden)*

- [ ] **Step 7: Verifikation Voice-Handler**

  Test:
  1. "📝 Antworten" für eine Mail klicken
  2. Sprachnachricht in Telegram aufnehmen (Mikrofon-Icon halten)
  3. Bot antwortet: `🎤 Verstanden: "[Transkript]"`
  4. GPT-Entwurf erscheint mit Buttons
  5. "✉️ Absenden" → Mail geht raus

---

## Task 8: Workflow 3 — Tages-Digest Cron (18:00 Uhr)

**Ziel:** Täglich um 18:00 Uhr gesammelte Digest-Mails aus Static Data in einer übersichtlichen Telegram-Nachricht senden.

- [ ] **Step 1: Neuen Workflow anlegen**

  N8N → "+ New Workflow" → Name: `fordify – Tages-Digest` → Save

- [ ] **Step 2: Schedule Trigger Node**

  "+ Add Node" → "Schedule Trigger"

  Konfiguration:
  ```
  Trigger Interval: Days
  Trigger at Hour:  18
  Trigger at Minute: 0
  ```

- [ ] **Step 3: Code Node — Digest aus Static Data laden**

  Name: `Digest laden`

  ```javascript
  // Zugriff auf Static Data von Workflow 1
  // Hinweis: Static Data ist workflow-spezifisch in N8N.
  // Da Workflow 3 ein separater Workflow ist, muss der Digest-Key
  // über den Workflow 1 Static Data zugänglich gemacht werden.
  //
  // Lösung: Workflow 1 schreibt Digest-Daten in den eigenen Static Data.
  // Workflow 3 ist ein Sub-Workflow von Workflow 1 ODER
  // Workflow 3 ruft Workflow 1 Static Data via N8N API ab.
  //
  // Einfachste Lösung: Workflow 3 ist ein Sub-Workflow (Execute Workflow Node in Workflow 1).
  // Alternativ: Workflow 3 liest Static Data via N8N API.
  //
  // Implementierung: Workflow 3 wird als eigenständiger Workflow gehalten.
  // Der Digest wird via N8N API aus Workflow 1 gelesen:

  const N8N_API_KEY = $env.N8N_API_KEY;
  const N8N_BASE = 'https://n8n.srv1063720.hstgr.cloud/api/v1';

  // Workflow 1 ID (nach Anlage notieren und hier eintragen)
  const WORKFLOW1_ID = 'WORKFLOW_1_ID_PLACEHOLDER';

  const resp = await fetch(`${N8N_BASE}/workflows/${WORKFLOW1_ID}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  const wf = await resp.json();
  const staticData = wf.staticData || {};

  const today = new Date().toISOString().substring(0, 10);
  const digestKey = `digest_${today}`;
  const digestMails = staticData[digestKey] || [];

  return [{
    json: {
      digestMails,
      count: digestMails.length,
      today
    }
  }];
  ```

  **Hinweis:** `WORKFLOW_1_ID_PLACEHOLDER` muss nach Anlage von Workflow 1 mit der echten Workflow-ID ersetzt werden. Die ID steht in der N8N-URL wenn Workflow 1 geöffnet ist.

- [ ] **Step 4: IF Node — Digest leer?**

  Bedingung: `{{ $json.count }}` > `0`

  False-Branch → kein Output (Workflow endet)
  True-Branch → weiter

- [ ] **Step 5: Code Node — Digest-Nachricht aufbereiten**

  Name: `Digest formatieren`

  ```javascript
  const { digestMails, count, today } = $input.first().json;

  // Zählen nach Kategorie + Priorität
  const counts = {};
  digestMails.forEach(m => {
    const key = `${m.priorityEmoji} ${m.category}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  const lines = Object.entries(counts)
    .map(([key, n]) => `${n}× ${key}`)
    .join(' · ');

  const text = `📬 ${count} neue Mail${count !== 1 ? 's' : ''} heute (${today})\n${lines}`;

  return [{
    json: {
      digestText: text,
      digestMails,
      today
    }
  }];
  ```

- [ ] **Step 6: Telegram Node — Digest senden**

  "+ Add Node" → "Telegram" → "Send Message"
  ```
  Credential: fordify Telegram
  Chat ID:    [TELEGRAM_CHAT_ID]
  Text:       {{ $json.digestText }}
  ```

- [ ] **Step 7: HTTP Request Node — Digest-Sammlung in Workflow 1 Static Data leeren**

  *(Verwendet N8N API um Static Data von Workflow 1 zu updaten)*

  "+ Add Node" → "HTTP Request"

  ```
  Method:  GET
  URL:     https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/WORKFLOW_1_ID_PLACEHOLDER
  Headers:
    X-N8N-API-KEY: {{ $env.N8N_API_KEY }}
  ```

  Danach zweiter HTTP Request Node:
  ```
  Method:  PATCH
  URL:     https://n8n.srv1063720.hstgr.cloud/api/v1/workflows/WORKFLOW_1_ID_PLACEHOLDER
  Headers:
    X-N8N-API-KEY: {{ $env.N8N_API_KEY }}
    Content-Type: application/json
  Body:    JSON
  ```

  Body Expression:
  ```javascript
  const today = $('Digest laden').first().json.today;
  const wfData = $input.first().json;
  const staticData = { ...(wfData.staticData || {}) };
  delete staticData[`digest_${today}`];
  return { staticData };
  ```

  *(Dieser Step ist optional — Digest-Keys verschwinden automatisch wenn der nächste Tag beginnt, da der Key Datum enthält)*

- [ ] **Step 8: Workflow aktivieren + Test**

  Workflow → Toggle "Active" einschalten.

  Manueller Test: "Execute Workflow" → wenn Digest-Daten in Static Data vorhanden, erscheint Telegram-Nachricht.

---

## Task 9: Telegram Webhook registrieren + End-to-End-Test

**Ziel:** N8N-Webhook-URL bei Telegram als Bot-Webhook registrieren, damit Workflow 2 Nachrichten und Button-Klicks empfängt.

- [ ] **Step 1: Webhook-URL aus Workflow 2 ermitteln**

  Workflow 2 öffnen → Webhook-Node anklicken → "Webhook URL" kopieren.

  Format: `https://n8n.srv1063720.hstgr.cloud/webhook/fordify-telegram`

  **Wichtig:** Workflow 2 muss aktiv sein, bevor der Webhook registriert wird.

- [ ] **Step 2: Webhook-Script erstellen**

  ```bash
  # scripts/n8n-register-webhook.sh
  #!/bin/bash
  # Telegram Webhook registrieren
  # Aufruf: bash scripts/n8n-register-webhook.sh

  # .env lesen
  BOT_TOKEN=$(grep -m1 "TELEGRAM_BOT_TOKEN" .env | cut -d'=' -f2)
  WEBHOOK_URL="https://n8n.srv1063720.hstgr.cloud/webhook/fordify-telegram"

  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"${WEBHOOK_URL}\"}" | python3 -m json.tool
  ```

- [ ] **Step 3: Webhook registrieren**

  ```bash
  bash scripts/n8n-register-webhook.sh
  ```

  Erwartete Antwort:
  ```json
  {
    "ok": true,
    "result": true,
    "description": "Webhook was set"
  }
  ```

- [ ] **Step 4: Webhook-Status prüfen**

  ```bash
  BOT_TOKEN=$(grep -m1 "TELEGRAM_BOT_TOKEN" .env | cut -d'=' -f2)
  curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool
  ```

  Output muss zeigen:
  ```json
  {
    "url": "https://n8n.srv1063720.hstgr.cloud/webhook/fordify-telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
  ```

- [ ] **Step 5: N8N Umgebungsvariablen setzen**

  N8N Dashboard → Settings → Variables → folgende Variablen anlegen:
  ```
  TELEGRAM_BOT_TOKEN  = [Wert aus .env]
  TELEGRAM_CHAT_ID    = [Wert aus .env]
  N8N_API_KEY         = [Wert aus .env]
  ```

  Diese werden in Workflow-Code-Nodes via `$env.VARIABLE_NAME` referenziert.

- [ ] **Step 6: Vollständiger End-to-End-Test**

  1. **Eingang:** E-Mail an `hallo@fordify.de` schicken (von eigener E-Mail-Adresse, mit "Sie" Anrede)
  2. **Warten:** Max. 15 Minuten (oder Workflow 1 manuell ausführen)
  3. **Verifikation Workflow 1:**
     - Mail erscheint in korrektem IMAP-Unterordner
     - Telegram-Nachricht erscheint mit Prioritäts-Emoji, Kategorie, Zusammenfassung, 3 Buttons
  4. **Test "Antworten":**
     - "📝 Antworten" klicken → Bot fragt nach Anweisung
     - "Bestätige freundlich den Eingang, wir melden uns bald" schreiben
     - Entwurf erscheint (mit "Sie"-Anrede)
     - "✉️ Absenden" → Bestätigung → Mail geht raus an eigene Adresse
     - Mail erscheint in `INBOX.Erledigt`
  5. **Test Sprachnachricht:**
     - Neue E-Mail → "📝 Antworten" → Sprachnachricht aufnehmen
     - Transkriptions-Bestätigung erscheint → Entwurf → Absenden
  6. **Test "Erledigt":**
     - Neue E-Mail → Notification → "✅ Erledigt" → Nachricht editiert, Mail in Erledigt
  7. **Test "Später":**
     - Neue E-Mail → Notification → "⏰ Später" → Bestätigung, Mail bleibt in Kategorieordner

- [ ] **Step 7: Script committen**

  ```bash
  git add scripts/n8n-register-webhook.sh
  git commit -m "feat: Mailbox-Automatisierung N8N Workflows + Telegram-Bot (Task 9 ✅)"
  git push origin staging
  git push origin main
  ```

---

## Manuelle Schritte nach Implementierung (für Jens)

1. **IMAP-Ordner in All-Inkl Webmail anlegen** (Task 1)
2. **Telegram-Bot erstellen** (via @BotFather) → Token in `.env` eintragen
3. **Chat-ID ermitteln** (via @userinfobot) → in `.env` eintragen
4. **N8N Credentials anlegen** (Task 2) — direkter Zugriff auf N8N Dashboard nötig
5. **Workflow 1 ID notieren** und in Task 8 Code eintragen
6. **N8N Umgebungsvariablen setzen** (Task 9 Step 5)
7. **Webhook registrieren**: `bash scripts/n8n-register-webhook.sh`

---

## Spec Coverage Check

| Spec-Anforderung | Task |
|---|---|
| 5 IMAP-Ordner (Support/Legal/Datenschutz/Allgemein/Erledigt) | Task 1 |
| IMAP Trigger 15 Minuten | Task 3 Step 2 |
| X-Original-To Kategorisierung | Task 3 Step 3 |
| GPT-4o-mini Zusammenfassung + Priorität JSON | Task 3 Step 4+5 |
| Mail in Kategorieordner verschieben | Task 3 Step 6 |
| Priorität-Emoji 🔴🟡⚪ | Task 3 Step 5, Task 4 Step 4 |
| Inline-Buttons erledigt/antworten/spaeter mit UID | Task 4 Step 4 |
| Static Data Kontext-Cache {uid: {from, replyTo, subject, body, folder}} | Task 4 Step 1 |
| DIGEST_THRESHOLD = 20, Tageszähler | Task 4 Step 1+2 |
| Digest-Sammlung für normale Priorität | Task 4 Step 3 |
| Telegram-Webhook Workflow 2 | Task 5 Step 2 |
| Chat-ID-Filter (Security) | Task 5 Step 3 |
| Switch: callback_query / text / voice | Task 5 Step 4 |
| Erledigt → IMAP Move + Telegram Edit | Task 5 Step 7 |
| Antworten → pending_reply setzen | Task 5 Step 8 |
| Später → Bestätigung | Task 5 Step 9 |
| Text-Handler: pending_reply + GPT-4o-mini Entwurf | Task 6 |
| Sie/du situationsabhängig im System-Prompt | Task 6 Step 3 |
| absenden/nochmal/abbrechen Buttons | Task 6 Step 5 |
| SMTP Reply senden + Mail in Erledigt | Task 6 Step 6 |
| Voice: Telegram File API + HTTP Download + Whisper | Task 7 |
| Transkriptions-Bestätigung vor Entwurf | Task 7 Step 5 |
| Tages-Digest Cron 18:00 | Task 8 |
| Digest: Zählung nach Kategorie + Priorität | Task 8 Step 5 |
| Digest leer → nichts senden | Task 8 Step 4 |
| Telegram Webhook registrieren | Task 9 Step 2-4 |
| End-to-End-Test | Task 9 Step 6 |
