# Machbarkeitsstudie: Fordify – Monetarisierung, Free/Paid-Architektur & Marktplatz
## Version 2.0

**Erstellt:** April 2026  
**Vorgänger:** `machbarkeitsstudie-forderungsmarktplatz.md` (Version 1.0)  
**Projektleitung:** Claude Sonnet 4.6 (Synthesebericht)  
**Subagenten:** Pricing Research (mit Web-Recherche) · Software Architect · Legal Advisor (DSGVO)  
**Status:** Interne Entscheidungsgrundlage — ersetzt keine anwaltliche Beratung

> **Was ist neu in V2?** Vollständiges Monetarisierungskonzept mit Free/Paid-Tier-Design, detaillierter Architektur für den Umbau der SPA, Payment-Provider-Analyse, DSGVO-Checkliste für das Account-Modell und Konkretisierung des Marktplatzes als Modell A ("Flohmarkt-Prinzip").

---

## Inhaltsverzeichnis

1. [Executive Summary V2](#1-executive-summary-v2)
2. [Monetarisierungskonzept: Free vs. Paid](#2-monetarisierungskonzept-free-vs-paid)
3. [Preisstruktur und Psychologie](#3-preisstruktur-und-psychologie)
4. [Payment Provider](#4-payment-provider)
5. [Technische Architektur: Free/Paid-Umbau](#5-technische-architektur-freepaid-umbau)
6. [DSGVO und Datenschutz](#6-dsgvo-und-datenschutz)
7. [Marktplatz Modell A: Konkretisierung](#7-marktplatz-modell-a-konkretisierung)
8. [Umsatzpotenzial und Wachstumspfad](#8-umsatzpotenzial-und-wachstumspfad)
9. [Gesamtbewertung und Entscheidungsmatrix](#9-gesamtbewertung-und-entscheidungsmatrix)
10. [Roadmap V2](#10-roadmap-v2)
11. [Launch-Checkliste](#11-launch-checkliste)

---

## 1. Executive Summary V2

Die Version 1 dieser Studie hat gezeigt: Der Forderungsmarktplatz ist eine strategisch richtige Idee, braucht aber Zeit und Infrastruktur. Version 2 beantwortet die entscheidende Vorfrage: **Wie monetarisiert Fordify seinen Kern — die Forderungsaufstellung — bevor der Marktplatz kommt?**

**Die fünf wichtigsten Erkenntnisse dieser Version:**

1. **Das richtige Free Tier ist "kein Speichern + kein Export"** — nicht ein Limit auf N Fälle. Diese Kombination erzeugt den stärksten Upgrade-Druck genau im Moment des höchsten Nutzens (Arbeit ist getan, Nutzer will Ergebnis verwenden).

2. **Paddle statt Stripe** — als Merchant of Record übernimmt Paddle alle USt-Compliance-Pflichten. Für ein 1-2-Personen-Startup spart das 10–20 Stunden/Monat an Steueradministration.

3. **Der Architektur-Umbau ist in 2–3 Wochen umsetzbar** — dank einer sauber abgesteckten Storage-Abstraktionsschicht. sessionStorage für Free, localStorage + Cloud für Paid. Nur ~4 Funktionen müssen mit Feature-Gates gesichert werden.

4. **Fordify wird mit dem Account-Modell zum DSGVO-Verantwortlichen** — mit klaren Pflichten. Der kritischste Punkt: Supabase RLS muss vor Launch korrekt konfiguriert sein, und ein AVV mit den Kanzleien für Schuldnerdaten ist Pflicht.

5. **Der Marktplatz startet als reines "Schwarzes Brett"** (Modell A) — kein algorithmisches Matching, keine Zahlungsabwicklung auf der Plattform, minimales regulatorisches Risiko. Das kann als Feature der bestehenden SPA ohne Backend realisiert werden.

---

## 2. Monetarisierungskonzept: Free vs. Paid

### 2.1 Das Design-Prinzip

Das Free Tier soll nützlich genug sein, dass Anwälte das Tool kennenlernen und die Qualität verstehen — aber unbequem genug, dass regelmäßige Nutzer upgraden. Die entscheidende Frage: **An welchem Punkt im Workflow entsteht der größte Schmerz?**

**Antwort:** Beim Export. Der Anwalt hat 20 Minuten an einer Forderungsaufstellung gearbeitet, sieht das perfekte Ergebnis in der Vorschau — und dann blockiert ein Gate. Das ist der "Aha-Moment" in umgekehrter Richtung: vollständige Arbeit, kein Zugang zum Ergebnis.

### 2.2 Free Tier — Ausgestaltung

| Aspekt | Ausgestaltung | Begründung |
|---|---|---|
| **Speicherung** | Nein — sessionStorage (geht beim Tab-Schließen verloren) | Stärkster emotionaler Trigger: aktiver Datenverlust |
| **Export: PDF/Drucken** | Nein — Gate mit Upgrade-Modal | Blockiert im Moment des höchsten Nutzens |
| **Export: Excel/JSON** | Nein | Gleiches Gate |
| **Kanzlei-Profil/Impressum** | Nur session-temporär | Kein Logo, kein Kanzlei-Header ohne Account |
| **Forderungsaufstellung selbst** | Vollständig nutzbar | Kompetenz und Qualität demonstrieren |
| **RVG, GKG, Zinsen** | Vollständig nutzbar | Kein Wasserzeichen im Ergebnis |
| **Anzahl Fälle** | Unbegrenzt (pro Session) | Komplexitätsbarrieren erzeugen unnötige Frustration |

**Was Free-Nutzer sehen:** Die vollständige Vorschau ihrer Forderungsaufstellung — mit korrekten Zahlen, korrektem § 367 BGB-Layout, funktionierender Zusammenfassung. Sie sehen, was Fordify kann. Dann das Gate.

**Was Free-Nutzer NICHT sehen:** Wasserzeichen. Das ist essentiell — im professionellen B2B-Kontext ist ein Wasserzeichen auf einem Rechtsdokument inakzeptabel und beschädigt die Marke.

**Wichtige Kommunikation:** Beim App-Start ein dezenter, dauerhafter Banner: *"Testversion — Daten werden nicht gespeichert. Erstelle einen kostenlosen Account oder teste 14 Tage Pro."* Keine versteckte Friction.

### 2.3 Paid Tiers — Ausgestaltung

**Solo / Pro** (Einzelanwalt oder Kleinste Kanzlei):
- Unbegrenzte Fälle, dauerhaft gespeichert (Cloud)
- PDF-Export, Excel-Export, JSON-Import/Export
- Kanzlei-Profil, Logo, Impressum dauerhaft gespeichert
- 1 Nutzer
- Zugang zum Marktplatz (Listings einstellen)

**Kanzlei / Team** (ab 2 Anwälten):
- Alles aus Solo
- Bis zu 5 Nutzer
- Kontaktverwaltung (Schuldner-Adressbuch)
- Fallvorlagen (teamweit geteilt)
- Prioritäts-Support

### 2.4 Feature-Tabelle (Vollständig)

| Feature | Free | Solo (Pro) | Kanzlei (Team) |
|---|---|---|---|
| Forderungsaufstellung § 367 BGB | ✅ | ✅ | ✅ |
| Zinsenberechnung, RVG, GKG | ✅ | ✅ | ✅ |
| Mehrere Hauptforderungen | ✅ | ✅ | ✅ |
| Tilgungsbestimmung | ✅ | ✅ | ✅ |
| Zahlungsplan-Generator (geplant) | ✅ | ✅ | ✅ |
| Forderungsvorschau | ✅ | ✅ | ✅ |
| **Speicherung** | ❌ (Session) | ✅ Cloud | ✅ Cloud |
| **PDF / Drucken** | ❌ | ✅ | ✅ |
| **Excel- / CSV-Export** | ❌ | ✅ | ✅ |
| **JSON-Export** | ❌ | ✅ | ✅ |
| **Kanzlei-Profil dauerhaft** | ❌ | ✅ | ✅ |
| **Logo dauerhaft** | ❌ | ✅ | ✅ |
| **Mehrere Nutzer** | ❌ | ❌ | ✅ (bis 5) |
| **Kontaktverwaltung** | ❌ | ❌ | ✅ |
| **Fallvorlagen (teamweit)** | ❌ | ❌ | ✅ |
| **Marktplatz: Listing einstellen** | ❌ | ✅ | ✅ |
| Support | Community | E-Mail | Priority |

---

## 3. Preisstruktur und Psychologie

### 3.1 Marktkontext

| Wettbewerber | Preis | Modell |
|---|---|---|
| LAWgistic (Forderungsmanagement) | 29,90 €/Monat/Modul | Abo |
| Smartlaw Business (Wolters Kluwer) | 49,90 €/Monat | Abo |
| KanzLaw (Cloud-Kanzleisoftware) | ab 24,90 €/Monat | Abo |
| RA-MICRO Essentials | ab 25 €/Monat/AP | Abo |
| XForderung | ~116 €/Jahr | Jahresabo |

**Positionierung:** Fordify soll zwischen XForderung (zu günstig, einmalig, Desktop) und LAWgistic (zu komplex, teuer) liegen — fokussiert, browserbasiert, fair bepreist.

### 3.2 Empfohlene Preistabelle

| Tier | Monatlich | Jährlich | Effektiv/Monat | Ersparnis |
|---|---|---|---|---|
| **Free** | 0 € | — | — | — |
| **Solo / Pro** | 29 €/Monat | **249 €/Jahr** | 20,75 €/Monat | spart 99 €/Jahr |
| **Kanzlei / Team** | 79 €/Monat | **669 €/Jahr** | 55,75 €/Monat | spart 279 €/Jahr |

### 3.3 Psychologische Begründung der Preispunkte

**29 € monatlich:**
- "Weniger als eine einzige Stunde Anwaltshonorar"
- Unter der 30 €-Schwelle (psychologisch gängige B2B-Kaufschwelle)
- Jahres-Kommunikation: "Spart 99 € gegenüber monatlich" — konkrete Euro-Zahl, keine %-Angabe (Anwälte denken in Beträgen, nicht Prozenten)

**79 € monatlich / Team:**
- Bei 5 Nutzern: 15,80 €/Nutzer — billiger als Solo-Einzellizenz
- Jahresrabatt 29 % ist aggressiv, aber gerechtfertigt: Fordify braucht Jahres-Cashflow, Kanzleien schätzen Planungssicherheit

**Jahresabo als Standard kommunizieren:**
- Preisseite zeigt Jahrespreise prominent, monatlich als Option dahinter
- Stripe/Paddle ermöglichen einfaches Umschalten

### 3.4 Freemium-Conversion-Benchmarks

| Modell | B2B-Benchmark | Für Fordify |
|---|---|---|
| Freemium B2B allgemein | 2–5 % | 3–5 % realistisch |
| Top-Performer Freemium | 6–8 % | Mittelfristig mit gutem Onboarding |
| Free Trial (14 Tage, zeitlich begrenzt) | 15–25 % | Bei "14 Tage Pro kostenlos" |

**Empfehlung:** Free Tier + optionaler 14-Tage-Pro-Trial ohne Kreditkarte. Der Trial senkt die Einstiegshürde erheblich und erzeugt die stärkste Conversion.

### 3.5 Einmalig vs. Abo — Entscheidung

**Entscheidung: Abo.** Kein Einmalkauf.

Begründung:
- Fordify erfordert laufende Updates (Basiszinssätze, RVG-Tabelle, GKG-Tabelle)
- Anwälte sind Abo-gewohnt (beA, Juris, Beck Online, RA-MICRO)
- Planbarkeit des MRR ermöglicht Weiterentwicklung
- Ein Einmalkauf würde "Was bekomme ich für den Preis?" aufwerfen — beim Abo ist die Antwort: "Immer aktuelle Berechnungsbasis"

---

## 4. Payment Provider

### 4.1 Vergleich der Kandidaten

| Anbieter | Typ | Gebühren | USt-Pflicht | SEPA | B2B-Rechnung | Empfehlung |
|---|---|---|---|---|---|---|
| **Paddle** | Merchant of Record | 5 % + 0,50 $ | Paddle übernimmt komplett | ✅ | ✅ inkl. Reverse Charge | **Empfohlen** |
| **Stripe** | Payment Processor | 1,4 % + 0,25 € + 0,7 % Billing | Fordify verantwortlich | ✅ | ✅ (mit Steuerberater) | Alternative ab ~50K MRR |
| **FastSpring** | Merchant of Record | ~5–9 % | FastSpring übernimmt | Eingeschränkt | ✅ | Zu komplex für MVP |
| **Digistore24** | Platform | 7,9 % + 1 € | Eingeschränkt | Eingeschränkt | Nein | Nicht geeignet |
| **Copecart** | Platform | 4,9 % + 1 € | Eingeschränkt | Eingeschränkt | Nein | Nicht geeignet |

### 4.2 Paddle — Detailanalyse (Empfehlung)

**Warum Paddle für Fordify:**

- **Merchant of Record:** Paddle kauft das Produkt von Fordify und verkauft es weiter an den Endkunden. Damit ist Paddle der rechtliche Verkäufer — alle USt-Pflichten (EU-weite USt, MOSS-Verfahren, Reverse Charge für B2B) liegen bei Paddle. Fordify stellt nur eine Rechnung an Paddle.
- **Kein Backend erforderlich:** Paddle bietet gehostete Checkout-Links und ein Customer Self-Service-Portal — Fordify muss keine Zahlungslogik selbst implementieren. Passt perfekt zum "kein Backend"-Ansatz.
- **B2B-optimiert:** Rechnungen mit ausgewiesener MwSt. und Reverse Charge für EU-Unternehmenskunden werden automatisch erstellt.
- **SEPA-Lastschrift verfügbar:** Für deutsche Kanzleien mit Präferenz für Bankeinzug.

**Kostenkalkulation Paddle vs. Stripe bei 5.000 € MRR:**

| Anbieter | Transaktionsgebühren/Monat | Steuerberater/Monat (Schätzung) | Gesamt |
|---|---|---|---|
| Paddle (5 % + 0,50$/Tx) | ~275 € | 0 € | ~275 € |
| Stripe (2,1 % + 0,7 % Billing) | ~140 € | ~200–400 € | ~340–540 € |

**Fazit:** Paddle ist bei kleinem MRR trotz höherer Transaktionsgebühr günstiger, weil es Steuer-Compliance-Aufwand eliminiert.

**Ab wann Stripe sinnvoll?** Ab ~50.000 € MRR, wenn ein dedizierter Steuerberater ohnehin vorhanden ist und mehr Checkout-Flexibilität gewünscht wird.

### 4.3 Checkout-Integration (technisch)

Paddle funktioniert komplett ohne Backend:

```html
<!-- Paddle.js via CDN, nur auf Pricing-Seite laden -->
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>
  Paddle.Setup({ token: "live_xxxx" });
</script>

<!-- Checkout-Button -->
<button onclick="Paddle.Checkout.open({
  items: [{ priceId: 'pri_solo_monthly', quantity: 1 }],
  customer: { email: fordifyAuth.user?.email }
})">Jetzt upgraden</button>
```

Paddle sendet Webhook an eine Supabase Edge Function → schreibt Subscription-Status in die `subscriptions`-Tabelle → App liest Status beim nächsten Login.

---

## 5. Technische Architektur: Free/Paid-Umbau

### 5.1 Prinzip: Storage-Abstraktionsschicht

Die bestehende App verwendet localStorage direkt an ~12 Stellen in `app.js`. Der Umbau führt eine **Storage-Abstraktionsschicht** ein, die je nach Auth-Status unterschiedliche Backends verwendet:

```
Free (kein Account)  →  sessionStorage  (geht beim Tab-Schließen verloren)
Paid (eingeloggt)    →  localStorage    (als Cache) + Supabase Cloud
```

**Warum sessionStorage statt In-Memory?**
- sessionStorage überlebt Page-Refreshes im gleichen Tab → kein frustrierender Datenverlust bei versehentlichem F5
- Wird beim Tab-Schließen automatisch gelöscht → gewünschtes Free-Tier-Verhalten
- Identische API zu localStorage → minimaler Umbauaufwand

### 5.2 Neue Dateien und Struktur

```
frontend/js/
├── app.js              ← angepasst (Storage-Calls → StorageBackend)
├── auth.js             ← NEU: Supabase Auth, Session-Management
├── storage.js          ← NEU: StorageBackend-Abstraktion + CloudSync
├── zinsen.js           ← unverändert
├── rvg.js              ← unverändert
├── verrechnung.js      ← unverändert
└── data.js             ← unverändert
```

### 5.3 Storage-Abstraktionsschicht (Kern)

```javascript
// storage.js
const StorageBackend = {
  _backend: null,
  _cloudSync: null,

  init(authState) {
    if (authState.isAuthenticated && authState.hasSubscription) {
      this._backend = localStorage;       // Paid: localStorage als Cache
      this._cloudSync = new CloudSync();   // + Supabase-Sync
    } else {
      this._backend = sessionStorage;      // Free: Session-only
      this._cloudSync = null;
    }
  },

  getItem(key) { return this._backend.getItem(key); },
  setItem(key, value) {
    this._backend.setItem(key, value);
    if (this._cloudSync) this._cloudSync.enqueue(key, value);
  },
  removeItem(key) {
    this._backend.removeItem(key);
    if (this._cloudSync) this._cloudSync.enqueueDelete(key);
  }
};

// Ausnahmen: immer localStorage (nie sicherheitsrelevant)
// fordify_theme, fordify_onboarded → direkt localStorage, nicht über Backend
```

**Umbau in app.js:** Alle `localStorage.getItem/setItem` in `ladeRegistry()` und `speichereRegistry()` werden zu `StorageBackend.getItem/setItem`. Da diese zwei Funktionen der einzige Datenpfad sind, sind die Änderungen minimal und sicher.

### 5.4 Feature-Gates (Export-Sperre)

Nur **4 Funktionen** müssen gesperrt werden:

```javascript
function requiresPaid(featureName) {
  if (fordifyAuth.hasSubscription) return false;
  zeigeUpgradeModal(featureName);
  return true;
}

function drucken()              { if (requiresPaid("drucken")) return; /* … */ }
function fallExportieren()      { if (requiresPaid("export"))  return; /* … */ }
function falTeilen()            { if (requiresPaid("teilen"))  return; /* … */ }
function einstellungenExport()  { if (requiresPaid("export"))  return; /* … */ }
```

**Soft-Gate (empfohlen):** Buttons bleiben sichtbar, aber mit "PRO"-Badge. Nutzer sieht, was er nicht hat — stärkerer Upgrade-Anreiz als ausgeblendete Buttons.

```css
[data-requires-paid].feature-locked {
  opacity: 0.65;
  position: relative;
}
[data-requires-paid].feature-locked::after {
  content: "PRO";
  font-size: 0.6rem;
  background: #f59e0b;
  color: #000;
  padding: 1px 4px;
  border-radius: 3px;
  position: absolute;
  top: -6px;
  right: -6px;
  font-weight: 700;
}
```

### 5.5 Supabase Auth (Magic Link)

Kein Passwort — Magic Link ist ideal für Anwälte (professionell, kein Passwort-Management):

```javascript
// auth.js
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loginMitEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (!error) zeigeInfoModal("Link gesendet", "Prüfe dein Postfach.");
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    ladeSubscriptionStatus().then(() => {
      StorageBackend.init(fordifyAuth);
      migrateSessionToCloud();   // Bestehende Session-Daten retten
      aktualisiereUIFuerAuth();
    });
  }
  if (event === "SIGNED_OUT") {
    fordifyAuth.isAuthenticated = false;
    fordifyAuth.hasSubscription = false;
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
  }
});
```

### 5.6 Supabase-Datenmodell

```sql
-- Profiles (erweitert auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  firma TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions (via Paddle-Webhook befüllt)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT,
  status TEXT DEFAULT 'inactive',  -- 'active', 'trialing', 'canceled'
  plan TEXT DEFAULT 'pro',         -- 'pro', 'team'
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fälle (JSONB — Fall-Objekt komplett gespeichert, keine Normalisierung)
CREATE TABLE cases (
  id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  data JSONB NOT NULL,
  naechste_id INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

-- Einstellungen (Kanzlei-Profil, Logo)
CREATE TABLE settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts (Schuldner-Adressbuch — Team-Tier)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strasse TEXT, plz TEXT, ort TEXT,
  email TEXT, telefon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS für alle Tabellen
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Nutzer sehen nur eigene Daten
CREATE POLICY "own_data" ON cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sub" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
```

**Warum JSONB für Fälle?** Das Fall-Objekt ist ein komplexes, variabel typisiertes JSON. Normalisierung würde enormen Umbauaufwand erzeugen ohne Mehrwert — es gibt keine Cross-Case-Queries. PostgreSQL JSONB ist durchsuchbar und performant.

### 5.7 Cloud-Sync (Debounced)

```javascript
class CloudSync {
  enqueue(key, value) {
    this._queue = this._queue.filter(i => i.key !== key);  // Deduplizieren
    this._queue.push({ key, value });
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._sync(), 2000);    // 2s Debounce
  }

  async _sync() {
    for (const item of this._queue) {
      if (item.key === STORAGE_KEY_CASES)    await this._syncCases(item.value);
      if (item.key === STORAGE_KEY_SETTINGS) await this._syncSettings(item.value);
    }
    this._queue = [];
  }
}
```

**Cloud-Primary mit localStorage als Cache** — kein Offline-First (zu komplex für MVP). Wenn Supabase-Call fehlschlägt, funktioniert die App mit lokalem Cache weiter.

### 5.8 Bestandsnutzer-Migration (kritisch)

Bestandsnutzer haben Daten in localStorage aus der Zeit vor dem Umbau. Beim ersten Login:

```javascript
async function migrateSessionToCloud() {
  const legacyData = localStorage.getItem(STORAGE_KEY_CASES);
  if (!legacyData) return;

  const reg = JSON.parse(legacyData);
  const count = Object.keys(reg.cases || {}).length;
  if (count === 0) return;

  if (!confirm(`${count} lokale(r) Fall/Fälle gefunden. In die Cloud übernehmen?`)) return;

  for (const c of Object.values(reg.cases)) {
    await supabase.from("cases").upsert({
      id: c.id, user_id: fordifyAuth.user.id,
      name: c.name, data: c.fall,
      naechste_id: c.naechsteId,
      updated_at: c.updatedAt
    });
  }

  localStorage.removeItem(STORAGE_KEY_CASES);
  localStorage.removeItem(STORAGE_KEY_SETTINGS);
}
```

**Wichtig:** Vor dem Freemium-Launch müssen bestehende Nutzer kommuniziert werden, dass das Modell sich ändert. Keine abrupte Umstellung ohne Vorwarnung.

### 5.9 Implementierungsaufwand

| Phase | Inhalt | Aufwand |
|---|---|---|
| 1 | StorageBackend + sessionStorage für Free | 2–3 Tage |
| 2 | Supabase Auth + Login-Modal | 2–3 Tage |
| 3 | Cloud-Speicherung Cases + Settings | 3–4 Tage |
| 4 | Feature-Gates (Export/Drucken) + Upgrade-Modal | 1–2 Tage |
| 5 | Paddle-Webhook → Supabase Edge Function | 2–3 Tage |
| 6 | Migration Bestandsnutzer + Edge Cases | 2–3 Tage |
| **Gesamt** | **MVP Free/Paid** | **~2–3 Wochen** |

---

## 6. DSGVO und Datenschutz

> *Alle Einschätzungen sind Orientierungshilfen — keine verbindliche Rechtsberatung. Ein auf IT-Recht spezialisierter Anwalt sollte vor dem Launch hinzugezogen werden.*

### 6.1 Was sich ändert: Fordify wird Verantwortlicher

**Aktuell:** Keine Daten verlassen den Browser. Fordify ist kein DSGVO-Verantwortlicher.  
**Mit Account-Modell:** Daten werden auf Supabase-Servern (AWS Frankfurt) gespeichert. Fordify wird zum Verantwortlichen nach Art. 4 Nr. 7 DSGVO.

Das ist eine fundamentale Statusänderung mit konkreten Pflichten.

### 6.2 Rechtsgrundlagen

| Verarbeitungszweck | Rechtsgrundlage | Anmerkung |
|---|---|---|
| Account-Erstellung (E-Mail) | Art. 6 Abs. 1 lit. b DSGVO | Vertragsdurchführung |
| Kanzlei-Profil, Logo | Art. 6 Abs. 1 lit. b DSGVO | Kernfunktion |
| Falldaten des Nutzers selbst | Art. 6 Abs. 1 lit. b DSGVO | Kernfunktion |
| Schuldnerdaten im Fall | **Fordify als Auftragsverarbeiter** | Anwalt ist Verantwortlicher — AVV erforderlich |
| Kontaktverwaltung (Schuldner-Adressbuch) | Art. 6 Abs. 1 lit. f DSGVO | Berechtigtes Interesse |

### 6.3 Schuldnerdaten — Das Kernproblem

Schuldner-Namen und -Adressen werden in Falldaten gespeichert. Der Schuldner ist kein Vertragspartner von Fordify.

**Empfohlene Konstruktion: Fordify als Auftragsverarbeiter**

```
Schuldner ← betroffen von →  Anwalt (Verantwortlicher)
                                   ↓ erteilt Weisungen
                              Fordify (Auftragsverarbeiter)
                                   ↓ nutzt
                              Supabase (Sub-Auftragsverarbeiter)
```

Der Anwalt trägt die Verantwortung für die Rechtmäßigkeit der Schuldnerdaten-Verarbeitung (sein Mandatsverhältnis ist die Rechtsgrundlage). Fordify stellt nur die technische Infrastruktur bereit.

**Konsequenz:** Fordify muss einen **AVV mit den Kanzleien/Anwälten** abschließen (Art. 28 DSGVO). Fordify darf Schuldnerdaten ausschließlich weisungsgebunden, nur für den Vertragszweck verwenden — **nicht für eigene Zwecke** (kein KI-Training, keine Marktplatz-Weitergabe ohne explizite Freigabe).

### 6.4 AVV mit Supabase

Supabase bietet eine Standard-DPA an, die Art. 28 DSGVO abdeckt. Da der Hosting-Standort AWS Frankfurt (eu-central-1) ist, findet keine Drittstaaten-Übermittlung statt.

**Aktionsschritte:**
1. Supabase DPA im Dashboard explizit akzeptieren und Bestätigung dokumentieren
2. Supabase-Projekteinstellungen: EU-Region Frankfurt verifizieren und screenshotten
3. Supabase's Subauftragsverarbeiter-Liste im VVT dokumentieren

### 6.5 DSFA (Art. 35 DSGVO)

Eine DSFA ist für das Account-Modell in seiner Grundform **nicht zwingend erforderlich** (keine Pflichtfälle des Art. 35 Abs. 3 DSGVO). Eine freiwillige, dokumentierte Risikoabschätzung ist jedoch empfohlen und dient als Nachweis der Rechenschaftspflicht.

### 6.6 Technisch-Organisatorische Maßnahmen (TOM, Art. 32 DSGVO)

| Maßnahme | Konkret |
|---|---|
| **RLS in Supabase** | Kritischste Maßnahme — Nutzer sehen nur eigene Daten. Vor Launch mit zwei Test-Accounts testen. |
| Verschlüsselung Transit | TLS 1.2+ (Supabase Standard) |
| Verschlüsselung at Rest | AES-256 (AWS S3/EBS, Supabase Standard) |
| Passwort-Hashing | bcrypt (Supabase Auth Standard) |
| Kein service_role Key im Frontend | Nur anon Key, RLS schützt Daten |
| Session-Timeout | JWT-Expiry konfigurieren (z.B. 8h Inaktivität) |
| Löschfunktion | Account-Löschung löscht alle verbundenen Datensätze kaskadierend |

### 6.7 Cookies und Tracking bei Paddle

Paddle setzt Session-Cookies. Empfehlung:
- Paddle-JS nur auf der expliziten Checkout-/Upgrade-Seite laden (nicht auf der Haupt-App)
- Da Checkout nur für eingeloggte Paid-Nutzer relevant ist: Minimal-Exposure
- Datenschutzerklärung muss Paddle als Drittanbieter nennen

### 6.8 Löschkonzept

| Datentyp | Löschfrist nach Kündigung |
|---|---|
| Falldaten, Einstellungen, Kontakte | Unverzüglich (max. 30 Tage) |
| Account-E-Mail | Unverzüglich |
| Zahlungsbelege (Rechnungen an Nutzer) | 10 Jahre (§ 147 AO) |
| Backup-Daten in Supabase | Backup-Retention ≤ 30 Tage konfigurieren |

---

## 7. Marktplatz Modell A: Konkretisierung

### 7.1 Das Flohmarkt-Prinzip

Modell A ist bewusst minimalistisch — niedrigstes regulatorisches Risiko, sofort umsetzbar:

- Anbieter (Anwälte) stellen **anonymisierte** Forderungsmetadaten als Listing ein
- Interessenten (Inkassounternehmen, Investoren) können browsen und **Kontaktanfrage** stellen
- Fordify übermittelt E-Mail des Anbieters an Interessenten nach Anfrage
- Vertrag kommt **direkt zwischen Parteien** zustande — Fordify ist nur Vermittlungsplattform
- **Keine Zahlungsabwicklung durch Fordify**

### 7.2 Anonymisierungsregeln (DSGVO-konform)

Kein Schuldner-Name, keine Adresse, kein Aktenzeichen in Listings:

| Datenelement | Erlaubt im Listing | Begründung |
|---|---|---|
| Nennwert | Als Betragsklasse (z.B. 10.000–50.000 €) | Keine exakte Zahl |
| Region | Bundesland / Landkreis | Nicht PLZ-genau |
| Forderungstyp | Kategorie (Kaufpreisforderung, Darlehensforderung) | Dropdown, kein Freitext |
| Titulierungsstatus | Ja / Nein | Binär |
| Schuldner-Name | ❌ | Niemals |
| Aktenzeichen | ❌ | Niemals |
| Genaue Adresse | ❌ | Niemals |

**Technische Erzwingung:** Das Listing-Formular hat keine Freitextfelder — nur Dropdowns und Schieberegler. Das macht DSGVO-Compliance by Design.

### 7.3 Technische Umsetzung Modell A

Modell A kann **ohne vollständiges Backend** realisiert werden:

**Option 1 (sofort, 1–2 Tage): Kontaktanfrage via E-Mail**
- "Forderung anbieten"-Button generiert anonymisiertes Zusammenfassungs-PDF ohne Schuldnerdaten
- `mailto:`-Link an kuratierten Käufer-Verteiler (Inkasso 24, Dr. Duve o.ä.)
- Kein Server, keine Datenbank, keine Auth nötig

**Option 2 (4–6 Wochen): Supabase-Listings (bei ohnehin vorhandenem Backend)**
Wenn das Account-Modell bereits implementiert ist, ergänzt das Marktplatz-Modul:
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',           -- active, reserved, sold, withdrawn
  betrag_klasse TEXT,                     -- '0-10k', '10k-50k', '50k-250k', '250k+'
  forderungstyp TEXT,                     -- 'kaufpreis', 'darlehen', 'miete', ...
  region TEXT,                            -- Bundesland
  tituliert BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '90 days'
);

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Listings: Jeder sieht aktive Listings
CREATE POLICY "listings_public" ON listings
  FOR SELECT USING (status = 'active');
```

### 7.4 Monetarisierung Modell A

| Modell | Gebühr | Regulatorisches Risiko | Empfehlung |
|---|---|---|---|
| **CPA (Cost per Acquisition)** | 100–300 € pro vermitteltem Kontakt | Sehr niedrig | ✅ Für Phase 1 |
| **Listing-Gebühr** | 9,90 € pro Listing | Sehr niedrig | ✅ Einfach |
| **Success-Fee** | 3–5 % des Transaktionsvolumens | Mittel (Abschlussvermittlung?) | ⚠️ Erst nach Rechtsberatung |
| **Monatliches Käufer-Abo** | 49–99 € für Zugang zu Listings | Niedrig | ✅ Mittelfristig |

**Empfehlung für Start:** Listing-Gebühr (9,90 € pro eingestellter Forderung) — einfach, transparent, kein regulatorisches Risiko. Nur für Paid-Nutzer verfügbar (Verifikation via Account).

### 7.5 Käufer-Netzwerk aufbauen (kritischer Erfolgsfaktor)

Ohne Käufer kein Marktplatz. Konkrete Schritte:

1. **Direktansprache Inkassounternehmen** (Andreas als Anwalt kennt hier Kontakte): Inkasso 24 AG, Dr. Duve Inkasso, Collectia, regionale Inkassofirmen
2. **Bundesverband Deutscher Inkassounternehmen (BDIU)** — Mitgliederliste als Startpunkt für Käufer-Akquise
3. **LinkedIn-Outreach** an Forderungsmanager in KMU und Banken
4. **Ziel vor Soft-Launch:** Mindestens 5 verifizierte Käufer auf der Plattform, bevor das erste Listing freigeschalten wird

---

## 8. Umsatzpotenzial und Wachstumspfad

### 8.1 Marktgröße (Zielgruppe)

| Zielgruppe | Größe | Potenzielle Fordify-Nutzer |
|---|---|---|
| Zugelassene Rechtsanwälte Deutschland (BRAK 2024) | ~165.000 | — |
| Einzelkanzleien und kleine Sozietäten | ~60.000–80.000 | Kernzielgruppe |
| Anwälte mit aktivem Forderungsmanagement | ~15.000–30.000 | Zahlungswillig |

### 8.2 MRR-Szenarien

| Szenario | Paid Accounts | ARPU | MRR |
|---|---|---|---|
| Konservativ (1 % Marktpenetration) | ~150–300 | 25–35 € | 4.000–10.000 € |
| Realistisch (2–3 %) | ~350–600 | 30–40 € | 10.000–24.000 € |
| Optimistisch (5 %) | ~750–1.000 | 35–45 € | 26.000–45.000 € |

### 8.3 Wachstumspfad (Conversion-basiert)

| Monat | Free-Nutzer kumulativ | Conversion 4 % | MRR |
|---|---|---|---|
| 6 | 500 | 20 | ~600 € |
| 12 | 2.000 | 80 | ~2.400 € |
| 18 | 5.000 | 200 | ~6.000 € |
| 24 | 9.000 | 360 | ~10.800 € |
| 30 | 15.000 | 600 | ~18.000 € |

### 8.4 Ziel: 5.000 € MRR

- Bei Solo-Only (29 €): ~173 zahlende Accounts
- Bei Mix 70 % Solo / 30 % Team: ~139 Accounts  
- Free-Nutzer-Basis nötig (bei 4 % Conversion): ~3.500 Nutzer

**Ist das realistisch?** Bei ~165.000 Anwälten in Deutschland und einer Kernzielgruppe von 15.000–30.000 ist 3.500 Free-Nutzer (< 25 % der Kernzielgruppe) ein erreichbares 18-Monats-Ziel bei aktivem Marketing (Legal-Tech-Blogs, Anwaltsverbände, LinkedIn, direkte Kanzlei-Ansprache).

---

## 9. Gesamtbewertung und Entscheidungsmatrix

### 9.1 Strategische Reihenfolge — unverändert

Die Gesamtstrategie aus V1 gilt:  
**Werkzeug → Produkt → Plattform**

V2 konkretisiert die Übergangsphase Werkzeug → Produkt:

| Phase | Was passiert |
|---|---|
| **Werkzeug** (jetzt) | Beste kostenlose Forderungsaufstellung im Web |
| **Produkt** (6–12 Monate) | Freemium-Launch: Free ohne Speicherung, Paid mit Cloud |
| **Plattform** (18–36 Monate) | Marktplatz, Multi-User, API |

### 9.2 Entscheidungsmatrix: Was jetzt entscheiden?

| Entscheidung | Option A | Option B | Empfehlung |
|---|---|---|---|
| Free Tier Design | Kein Speichern + kein Export | Max. 3 Fälle | **Option A** — stärkere Upgrade-Motivation |
| Payment Provider | Paddle | Stripe | **Paddle** bis 50K MRR |
| Marktplatz Start | Modell A (Flohmarkt) | Modell B (Vollmarktplatz) | **Modell A** — geringstes Risiko |
| Marktplatz Timing | Mit Freemium-Launch | Nach Cloud-Infrastruktur | **Nach Cloud** — Listing-Feature für Paid-Nutzer |
| Auth-Methode | Magic Link | Passwort | **Magic Link** — einfacher, professioneller |
| Cloud-Region | Supabase EU Frankfurt | Supabase US | **EU Frankfurt** — DSGVO |

### 9.3 Kritische Voraussetzungen für Freemium-Launch

Diese müssen alle erfüllt sein, bevor der erste bezahlte Account verkauft wird:

| # | Voraussetzung | Wer | Deadline |
|---|---|---|---|
| 1 | Supabase RLS korrekt konfiguriert und getestet | Entwicklung | Vor Launch |
| 2 | AVV mit Supabase abgeschlossen | Jens | Vor Launch |
| 3 | AVV-Vorlage für Kanzleien in AGB | Andreas + Anwalt | Vor Launch |
| 4 | Datenschutzerklärung aktualisiert (Account-Verarbeitung) | Jens + Andreas | Vor Launch |
| 5 | Nutzungsbedingungen / AGB erstellt | Andreas | Vor Launch |
| 6 | Paddle-Integration getestet (Checkout, Webhook, Customer Portal) | Entwicklung | Vor Launch |
| 7 | Migration Bestandsnutzer kommuniziert | Jens | 4 Wochen vor Launch |
| 8 | Account-Löschfunktion implementiert | Entwicklung | Vor Launch |

---

## 10. Roadmap V2

### Phase A: Werkzeug-Vervollständigung (Monate 1–6)
*(unverändert aus V1 — Features für Freemium-Basis)*

| Monat | Feature |
|---|---|
| 1 | Mehrere Zinsmethoden (act/365, 30/360) |
| 1–2 | Excel/CSV-Export (SheetJS) |
| 2 | Vorlagen-System |
| 3–4 | Zahlungsplan-Generator |
| 4–5 | Mahnschreiben-Generator |
| 5–6 | Fristenmanagement |

### Phase B: Freemium-Launch (Monate 7–12)

| Monat | Feature |
|---|---|
| 7–8 | StorageBackend + sessionStorage für Free Tier |
| 8–9 | Supabase Auth (Magic Link) + Login-Modal |
| 9–10 | Cloud-Speicherung Cases + Settings + Feature-Gates |
| 10–11 | Paddle-Integration + Subscription-Gating |
| 11–12 | Bestandsnutzer-Kommunikation + Migration |
| **12** | **🚀 Freemium-Launch (Free + Solo Pro)** |

### Phase C: Kanzlei-Tier + Marktplatz Modell A (Monate 13–18)

| Monat | Feature |
|---|---|
| 13–14 | Team-Workspace (Multi-User, RBAC) → Kanzlei-Tier |
| 14–15 | Kontaktverwaltung (Schuldner-Adressbuch) |
| 15–16 | Marktplatz: Listing-Feature für Paid-Nutzer |
| 16–17 | Käufer-Netzwerk (5 verifizierte Käufer) |
| 17–18 | ZV-Auftrag-Generierung (ZwVollstrFormV 2024) |

### Phase D: Plattform (Monate 19–36)
*(unverändert aus V1)*

Rechtliche Prüfung Marktplatz Modell B/C → Vollmarktplatz mit Transaktionsmanagement → API.

---

## 11. Launch-Checkliste

### Blocker (muss vor dem Freemium-Launch erledigt sein)

**Rechtlich / Vertraglich**
- [ ] AVV mit Supabase abgeschlossen und dokumentiert (Supabase Dashboard → Settings → Legal)
- [ ] Nutzungsbedingungen / AGB erstellt (inkl. AVV-Klauseln für Schuldnerdaten)
- [ ] Datenschutzerklärung aktualisiert: Account, Supabase, Paddle als Drittanbieter
- [ ] Paddle-DPA abgeschlossen
- [ ] Impressum geprüft (USt-ID bei gewerblicher Tätigkeit)
- [ ] Verzeichnis von Verarbeitungstätigkeiten (VVT) angelegt

**Technisch**
- [ ] Supabase RLS für alle Tabellen aktiviert und mit zwei Test-Accounts getestet
- [ ] Kein service_role Key im Frontend-Code
- [ ] TLS erzwungen, alle HTTP → HTTPS
- [ ] Account-Löschfunktion implementiert (kaskadierendes Löschen aller Nutzer-Daten)
- [ ] Supabase-Region: EU Frankfurt verifiziert und dokumentiert
- [ ] Paddle-Checkout getestet (Kauf → Webhook → subscriptions-Tabelle → Feature-Unlock)
- [ ] sessionStorage-Verhalten für Free Tier getestet (Tab schließen → Daten weg)
- [ ] Bestandsnutzer-Migration: Legacy-localStorage-Daten werden beim Login erkannt

**Betrieb**
- [ ] Datenpannen-Verfahren dokumentiert (zuständige Behörde: HmbBfDI)
- [ ] E-Mail-Kanal für Datenschutzanfragen eingerichtet (datenschutz@fordify.de)
- [ ] Bestandsnutzer mindestens 4 Wochen vor Launch informiert

### Should-Haves (innerhalb 30 Tage nach Launch)
- [ ] Datenexport-Funktion für Nutzer (Art. 20 DSGVO, Portabilität)
- [ ] Session-Timeout konfiguriert
- [ ] Backup-Retention-Policy (≤ 30 Tage)
- [ ] VVT um alle Subauftragsverarbeiter ergänzt

---

## Anhang: Änderungen gegenüber Version 1

| Thema | V1 | V2 (neu) |
|---|---|---|
| Free Tier | "max. 3 aktive Fälle" | "kein Speichern + kein Export" (stärkere Motivation) |
| Monetarisierung | Grundriss | Vollständiges Tier-Modell mit Preisen und Psychologie |
| Payment | Erwähnung Stripe | Paddle als Empfehlung (Merchant of Record) |
| Architektur | Supabase als Stack | Detailliertes Storage-Abstraktions-Design, Code-Level |
| DSGVO | Hohe Ebene | Konkrete Pflichten, AVV-Konstruktion, Launch-Checkliste |
| Marktplatz | Modelle A/B/C beschrieben | Modell A konkretisiert mit Anonymisierungsregeln und DB-Schema |
| Umsatz | Szenarien | Monatsgranularer Wachstumspfad |

---

*Erstellt April 2026 | Fordify Machbarkeitsstudie V2 | Vertraulich*  
*Subagenten: Market Research · Architect · Legal Advisor*  
*Basiert auf Erkenntnissen der V1 (Marktanalyse, Rechtsanalyse, Feature-Expansion)*
