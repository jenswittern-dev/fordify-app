# SYSTEM.md – Technisches Whitepaper Fordify

> Stand: 2026-04-28
> Zielgruppe: Entwickler, Claude Code (Kontext für neue Features)

---

## 1. Architekturüberblick

Fordify ist eine **reine Client-Side-SPA** ohne Build-Schritt:

```
Browser
  └── forderungsaufstellung.html   (Haupt-App)
        ├── css/app.css            (Styling, Print-CSS, Preisseite, Feature-Gates)
        ├── css/themes.css         (Theme-Overrides: brand/dark/clean)
        ├── js/decimal.min.js      (externe Lib, exakte Dezimalarithmetik)
        ├── js/bootstrap.bundle.min.js
        ├── js/config.js           (Supabase-Credentials, Paddle-Token, PRICE_MAP, trackEvent)
        ├── js/data.js             (statische Datentabellen)
        ├── js/zinsen.js           (Verzugszinsberechnung)
        ├── js/rvg.js              (RVG-Gebührenberechnung)
        ├── js/verrechnung.js      (§ 367 BGB Verrechnung)
        ├── js/storage.js          (Storage-Abstraktion: sessionStorage/localStorage/Supabase)
        ├── js/auth.js             (Supabase Magic Link Auth)
        ├── js/auth-ui.js          (Auth-UI-Steuerung: data-auth-show, Avatar, Plan-Badge)
        ├── js/gates.js            (Feature-Gates: requiresPaid(), Upgrade-Modal)
        ├── js/zusammenfassung.js  (deprecated – nicht mehr direkt genutzt)
        ├── js/contacts.js         (Kontaktverwaltung – konto.html)
        ├── js/zv.js               (Zwangsvollstreckungsformular-Logik)
        └── js/app.js              (State, UI, Event-Handling – ~2100 Zeilen)

  Weitere Seiten (eigenständige HTML-Dateien):
  ├── index.html                   (Landing Page / Homepage)
  ├── konto.html                   (Kundenbereich: Fälle, Firmendaten, Abo)
  ├── preise.html                  (Pricing-Seite mit Paddle-Checkout)
  ├── zinsrechner.html             (SEO-Zinsrechner, js/rechner-zins.js)
  ├── rvg-rechner.html             (SEO-RVG-Rechner, js/rechner-rvg.js)
  ├── gerichtskostenrechner.html   (SEO-GKG-Rechner, js/rechner-gkg.js)
  ├── tilgungsrechner.html         (SEO-Tilgungsrechner, js/rechner-tilgung.js)
  ├── changelog.html               (Changelog-Seite)
  ├── avv.html                     (Auftragsverarbeitungsvertrag)
  ├── impressum.html
  ├── datenschutz.html
  └── agb.html
```

**Service Worker** (`sw.js`, aktuell `fordify-v175` / Staging `fordify-staging-v130`) cached alle Assets für Offline-Nutzung. Bei Frontend-Änderungen: Cache-Name inkrementieren.

**Externe Dienste:**
- **Supabase** (EU Frankfurt): Auth, Datenbank, Edge Functions
- **Paddle**: Zahlungsabwicklung (Merchant of Record)
- **GoatCounter**: Analytics (cookielos, DSGVO-konform, self-hosted)
- **Resend**: Transaktionale E-Mails (via Supabase SMTP / N8N)

---

## 2. Freemium-Architektur

Fordify nutzt ein dreistufiges Modell:

| Stufe | Storage | Features |
|---|---|---|
| **Free (Gast)** | `sessionStorage` — Daten weg beim Tab-Schließen | PDF-Export, Zinsberechnung |
| **Pro** | `localStorage` + Supabase Cloud-Sync | + dauerhafter Speicher, Excel-Export, Kanzlei-Profil |
| **Business** | `localStorage` + Supabase Cloud-Sync | + alles, white-label PDF |

**Auth-Flow:**
1. Nutzer klickt Login → Magic Link per Supabase
2. Klick auf Link → `SIGNED_IN`-Event → `fordifyAuth` befüllt
3. `ladeSubscriptionStatus()` → `fordifyAuth.hasSubscription` + `fordifyAuth.plan`
4. `StorageBackend.init(fordifyAuth)` → wechselt Backend zu localStorage
5. `ladeCloudDaten()` → Fälle + Einstellungen aus Supabase laden
6. `aktualisiereUIFuerAuth()` → UI anpassen

**Checkout-Flow (preise.html):**
1. "Pro abonnieren" → prüft ob eingeloggt
2. Nicht eingeloggt → Login-Modal im Checkout-Modus (3-Schritt-Erklärung)
3. Magic Link → selber Browser → `?checkout=pro-monthly` Parameter
4. `checkAutoCheckout()` in preise.html feuert Paddle.Checkout.open automatisch

---

## 3. Datenmodell

### 3.1 localStorage-Keys

| Key | Inhalt |
|---|---|
| `fordify_cases` | Registry aller Fälle (JSON) |
| `fordify_settings` | Kanzlei-Einstellungen + Impressum (JSON) |
| `fordify_last_export` | ISO-Timestamp des letzten Exports |
| `fordify_theme` | Aktives Theme: `"brand"` (default) / `"dark"` / `"clean"` |
| `fordify_onboarded` | `"1"` wenn Onboarding-Modal bestätigt |
| `forderungsaufstellung_state` | Legacy-Key (Migration auf fordify_cases) |

**Hinweis:** `fordify_theme` und `fordify_onboarded` bleiben immer auf `localStorage` — auch für Free-Nutzer.

### 3.2 Registry-Struktur (`fordify_cases`)

```json
{
  "currentCaseId": "c-abc123",
  "cases": {
    "c-abc123": {
      "id": "c-abc123",
      "name": "Müller ./. Schmidt – AZ 1/25",
      "updatedAt": "2026-04-01T10:00:00.000Z",
      "fall": { ...Fall-Objekt... },
      "naechsteId": 42
    }
  }
}
```

### 3.3 Fall-Objekt

```json
{
  "mandant": "Max Mustermann",
  "gegner": "Erika Musterfrau",
  "aktenzeichen": "1 C 123/25",
  "aufschlagPP": 9,
  "insoDatum": null,
  "forderungsgrundKat": "Titel",
  "titelArt": "Vollstreckungsbescheid",
  "titelDatum": "2024-01-15",
  "titelRechtskraft": "2024-02-01",
  "titelGericht": "AG Musterhausen",
  "titelAz": "12-1234567-0-5",
  "positionen": [ ...Positions-Array... ]
}
```

### 3.4 Positions-Objekt (alle Typen)

Gemeinsame Felder aller Typen:

```json
{
  "id": 7,
  "typ": "hauptforderung",
  "datum": "2024-03-01",
  "beschreibung": "Rechnung Nr. 2024-042",
  "betrag": "1500.00",
  "tituliert": false
}
```

Typ-spezifische Zusatzfelder:

| Typ | Zusatzfelder |
|---|---|
| `hauptforderung` | `gruppeId` ("g7") |
| `zinsperiode` | `gruppeId`, `hauptbetrag`, `zinsVon`, `zinsBis`, `aufschlag`, `perioden[]`, `tage` |
| `zinsforderung_titel` | `zinsBis`, `aufschlag` |
| `anwaltsverguetung` | `streitwert`, `vvNummern[]`, `faktoren{}`, `ustSatz`, `ohneUst`, `netto`, `ust` |
| `gerichtskosten` | `gkgStreitwert`, `gkgVerfahren` (Faktor als String, z.B. "3.0") |
| `zahlung` | `tilgungsbestimmung` (bool, optional), `tilgungsGruppeId` (string, optional), `verrechnungsanweisung` (string, optional) |
| `inkassopauschale` | _(nur Basisfelder)_ |
| `gv_kosten`, `zahlungsverbot`, `auskunftskosten`, `mahnkosten`, `sonstige_kosten` | _(nur Basisfelder)_ |

### 3.5 Einstellungen-Objekt (`fordify_settings`)

```json
{
  "logo": "data:image/png;base64,...",
  "logoPosition": "links",
  "imp": {
    "kanzlei": "",
    "rechtsform": "",
    "strasse": "",
    "plz": "",
    "ort": "",
    "telefon": "",
    "fax": "",
    "email": "",
    "website": "",
    "steuerNr": "",
    "ustIdNr": "",
    "vertreter": "",
    "berufsbezeichnung": "",
    "berufsrecht": "",
    "berufsrechtsUrl": "",
    "kammer": "",
    "haftpflicht": "",
    "freitext": "",
    "impressumUrl": "",
    "datenschutzUrl": ""
  }
}
```

### 3.6 Supabase-Datenbankschema

```
profiles       – id (UUID), email, firma, created_at
subscriptions  – id, user_id, paddle_subscription_id, paddle_customer_id,
                 status ('active'|'trialing'|'canceled'|'past_due'|'suspended'),
                 plan ('pro'|'business'), billing_cycle ('monthly'|'yearly'),
                 trial_ends_at, current_period_end, updated_at
cases          – id (TEXT), user_id, name, data (JSONB), naechste_id, updated_at
settings       – user_id (PK), data (JSONB), updated_at
contacts       – id (UUID), user_id, name, strasse, plz, ort, email, telefon, created_at
```

RLS: Jede Tabelle hat Row Level Security. Nutzer sehen nur eigene Daten.
`subscriptions` ist schreibgeschützt für den Client — nur Edge Function (Service Role) schreibt.

---

## 4. Berechnungslogik

### 4.1 Verzugszinsen (`js/zinsen.js`)

**Formel:** `Zinsen = Betrag × (Basiszinssatz + Aufschlag) / 100 × Tage / 365`

- Basiszinssatz: aus `BASISZINSSAETZE[]` in `data.js` (aktuell bis 01.07.2026)
- Aufschlag: 5 PP (Verbraucher, § 288 Abs. 1 BGB) oder 9 PP (Unternehmer, § 288 Abs. 2 BGB)
- Zinssatz wird auf 0 geclampt (`Decimal.max(...)`) — kein negativer Zinssatz
- Perioden werden an Basiszinssatz-Wechselgrenzen (01.01 / 01.07) aufgeteilt
- Benachbarte Perioden mit identischem Zinssatz werden zusammengeführt

**InsO-Kappung:** Wenn `insoDatum` gesetzt, wird `zinsBis` auf `insoDatum - 1 Tag` gekappt.

### 4.2 RVG-Berechnung (`js/rvg.js`)

- Tabelle: `RVG_TABELLE[]` in `data.js` (BGBl. 2025 I Nr. 109, gültig ab 01.06.2025)
- VV-Nummern: `VV_DEFINITIONEN{}` in `data.js`
- Funktion: `berechneRVGGesamt(streitwert, vvNummern, tabelle, definitionen, faktoren)`
- USt-Satz wählbar: 0 % / 7 % / 19 % (default 19 %)

### 4.3 GKG-Gebühren (`js/app.js: gkgGebuehr()`)

- Tabelle: `GKG_TABELLE[]` in `data.js` (Anlage 2 GKG, KostBRÄG 2021)
- Über 500.000 €: 2.201 € + 108 € je angefangene weitere 30.000 €
- Verfahrensarten: Mahnbescheid (×0,5), Vollstreckungsbescheid (×1,5), Klage (×3,0), Berufung (×4,0)

### 4.4 § 367 BGB Verrechnung (`js/verrechnung.js`)

**Reihenfolge der Anrechnung** bei Teilzahlung:
1. Kosten (unverzinslich)
2. Zinsen
3. Hauptforderung

Funktion: `berechneVerrechnung(positionen, stichtag, basiszinssaetze, aufschlagPP, insoDatum)`

**Tilgungsbestimmung:** Wenn `zahlung.tilgungsbestimmung === true` und `zahlung.tilgungsHFId` gesetzt: Zahlung wird zuerst auf Zinsen + diese spezifische HF verrechnet, dann Rest nach § 367 BGB.

### 4.5 Zusammenfassung (`js/app.js: baueSummaryTabelle()`)

- Aktive Funktion: `baueSummaryTabelle()` in `app.js` (NICHT `erstelleZusammenfassung()` in `zusammenfassung.js` — deprecated)
- Spalten: Datum / Bezeichnung / Forderung / Teilzahlung / Anrechnung / Restforderung
- Ordnet Zinsperioden per `gruppeId` der jeweiligen Hauptforderung zu

---

## 5. Gruppen-System (mehrere Hauptforderungen)

Jede `hauptforderung`-Position hat eine `gruppeId` (z.B. `"g7"`).
Zugehörige `zinsperiode`-Positionen teilen dieselbe `gruppeId`.

- `neuGruppeId()` → `"g" + neuId()`
- `migratePositionen()`: Alte Positionen ohne `gruppeId` → `"g0"` (lazy migration, idempotent)
- `holeGruppen()`: gibt deduplizierte Hauptforderungen zurück (eine pro gruppeId)
- `neueRechnungsgruppe()`: erstellt neue gruppeId, öffnet Hauptforderungs-Modal

---

## 6. UI-Architektur

### 6.1 Ansichten (Views) in forderungsaufstellung.html

```
stammdaten  → Mandant, Gegner, AZ, Aufschlag, InsO, Forderungsgrund
eingabe     → Positions-Tabelle + Modal-Workflow
vorschau    → Druckvorschau (rendereVorschau()) + PDF-Export
```

Navigation via `zeigeAnsicht(name)` — schaltet `d-none` um.

### 6.2 Modal-Workflow

```
positionHinzufuegen(typ) / positionBearbeiten(id)
  → modalOeffnen(typ, pos)
    → renderModalInhalt(typ, pos)  [Template-Funktion je Typ]
  → modalDynamischAktualisieren(typ)  [Live-Vorschau bei input/change]
  → modalSpeichern()
    → modalDatenLesen()  [liest Formularfelder, gibt Positions-Objekt zurück]
    → state.fall.positionen.push/splice
    → speichernMitFeedback() + renderePositionsliste()
```

### 6.3 Undo-Stack

- `pushUndo()` vor jeder Mutation aufrufen
- Max. 20 Einträge (LIFO)
- `undo()` stellt letzten State wieder her
- Tastatur: Strg+Z (außerhalb von Eingabefeldern)

### 6.4 Theme-System

Drei Themes, umschaltbar via `themeWechseln(name)`:

| Theme-Key | Name | Beschreibung |
|---|---|---|
| `brand` (default) | Professionell | Gradient-Navbar (Blau), Shimmer-Animation, Card-Hover-Lift |
| `dark` | Dark | Vollständiges Dark Mode |
| `clean` | Clean | Notion-Stil: weiße Navbar, flache Cards, Blau #2383e2 |

**Technisch:**
- `[data-theme]`-Attribut auf `<html>` — `brand` = kein Attribut (Base-Styles gelten)
- `css/themes.css` wird nach `css/app.css` geladen
- Persistenz: `localStorage["fordify_theme"]`
- Logo-SVGs: `img/logo.svg` (Standard), `img/logo-dark.svg`, `img/logo-clean.svg` — gestapelte Balken-Grafik, kein einzelnes F mehr

### 6.5 Auth-UI (`js/auth-ui.js`)

Steuert sichtbare Elemente anhand Auth-Status via `data-auth-show`-Attribut:

| Attributwert | Sichtbar wenn |
|---|---|
| `guest` | Nicht eingeloggt |
| `user` | Eingeloggt |
| `paid` | Eingeloggt + aktives Abo |

### 6.6 Feature-Gates (`js/gates.js`)

```javascript
function requiresPaid(featureName)  // → false wenn bezahlt, sonst Upgrade-Modal + return true
function zeigeUpgradeModal(featureName)  // → Bootstrap-Modal mit Upgrade-CTA
```

Gegated: Excel-Export (`fallExportierenAlsExcel()`), JSON-Export, Einstellungen dauerhaft speichern.
Nicht gegated: PDF-Export (`drucken()`).

### 6.7 Print-Popup

`drucken()` öffnet `window.open()` mit vollständigem HTML (CSS inline injiziert),
ruft `window.print()` nach 400ms auf. Kein html2canvas / jsPDF — native Druckengine.

PDF-Branding: gestuft via `getFordifyBranding()` in `app.js` — Free = prominenter Fordify-Footer, Pro = dezenter Footer, Business = kein Footer (implementiert 2026-04-23).

### 6.8 Storage-Abstraktion (`js/storage.js`)

```javascript
StorageBackend.init(authState)   // wechselt Backend je nach Plan
StorageBackend.getItem(key)
StorageBackend.setItem(key, val) // → bei Paid: auch CloudSync.enqueue()
StorageBackend.removeItem(key)
```

`CloudSync` sendet Änderungen debounced (2 Sek.) an Supabase.

---

## 7. Service Worker & Caching

- Cache-Name: `fordify-v175` (Prod) / `fordify-staging-v130` (Staging)
- Erkennung: `self.location.hostname.includes('staging') || localhost`
- Strategie: Cache-First, dann Network
- **Regel:** Bei jedem Commit mit geänderten Frontend-Dateien → N um 1 erhöhen

---

## 8. Datentabellen – Pflegeanforderungen

| Tabelle | Quelle | Nächste Fälligkeit |
|---|---|---|
| `BASISZINSSAETZE` in `data.js` + `data/basiszinssaetze.json` | Deutsche Bundesbank | 01.07.2026 |
| `RVG_TABELLE` in `data.js` | BGBl. 2025 I Nr. 109 | bei nächster RVG-Reform |
| `GKG_TABELLE` in `data.js` | KostBRÄG 2021 | bei nächster GKG-Reform (→ abgleichen) |

---

## 9. N8N Workflows

N8N-Instanz: `https://n8n.srv1063720.hstgr.cloud` (Hostinger VPS)

| Workflow-ID | Name | Typ | Trigger | Status |
|---|---|---|---|---|
| `elcsjZCxDmtCw2BI` | Fordify – Onboarding-Mail | Webhook | Supabase `on_new_user`-Trigger → N8N-Webhook | Aktiv seit 2026-04-21 |
| `PexOk66BNT8uDntc` | Fordify – Zahlungsbestätigung | Webhook | paddle-webhook bei `transaction.completed` | Aktiv |
| `mYQAOS7oacoKW5Rq` | Fordify – Offboarding bei Kündigung | Webhook | paddle-webhook bei `subscription.canceled` | Aktiv |
| `hJpXXeIuvGQY60iQ` | Fordify – Weekly Digest | Cron | Montags 08:00 | Aktiv |
| `HDZV78j89uLYdPTB` | Fordify – Retention Email Cron | Cron | Täglich 09:00 | Aktiv seit 2026-04-23 |
| `fdfPAUVG4rvMoPcS` | Fordify – Datenlöschungs-Cron | Cron | Täglich 02:00, löscht cases/contacts/settings nach grace_period_end | Aktiv |

### Retention Email Cron (`HDZV78j89uLYdPTB`)

Sendet Win-Back-E-Mails an Nutzer mit bevorstehender Kündigung:
- **Monthly:** 7 Tage vor `scheduled_cancel_at` (Fenster: 6–8 Tage)
- **Yearly:** 30 Tage vor `scheduled_cancel_at` (Fenster: 29–31 Tage)
- **Guard:** `retention_email_sent_at IS NULL` — verhindert Doppelsendungen
- Nach dem Senden: `retention_email_sent_at` wird auf aktuellen Timestamp gesetzt

**Nodes:** ScheduleTrigger → HTTP (Supabase PostgREST) → Code (Zeitfenster-Filter) → HTTP (Resend) → HTTP (PATCH `retention_email_sent_at`)

**PostgREST-Join:** `profiles!subscriptions_user_id_fkey(email)` für E-Mail-Lookup.

**Performance-Indexes** (in `supabase/schema.sql`):
- `idx_subscriptions_scheduled_cancel_at` — partial index auf offene Kündigungen ohne gesendete Retention-Mail
- `idx_subscriptions_grace_period_end` — partial index auf canceled + aktive Grace Period

---

## 10. Bekannte Besonderheiten & Fallstricke

- **Typografische Anführungszeichen** (`„"`) in JS-Strings verursachen SyntaxError → immer `\u201e` / `\u201c` verwenden
- `href="#"` in Navigationslinks schreibt `#` in die URL → immer `href="javascript:void(0)"` oder `onclick="return false;"`
- `zusammenfassung.js: erstelleZusammenfassung()` ist deprecated — nicht wieder aktivieren
- `berechneVerrechnung()` sortiert intern nach Datum — Positionsreihenfolge im Array ist für Verrechnung irrelevant
- `localStorage` ist domain-scoped: Entwicklung auf `localhost` vs. Produktion `fordify.de` haben getrennte Stores
- **Free-Nutzer** verwenden `sessionStorage` — alle Daten weg beim Tab-Schließen, das ist Absicht (kein Bug)
- **`supabase.auth.onAuthStateChange`** feuert auch beim Seitenneuladen wenn Session noch aktiv ist → kein separater Init-Call nötig
