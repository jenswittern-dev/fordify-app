# Staging-Umgebung Implementation Plan

## Aktueller Stand (2026-04-21)
| Task | Status | Notiz |
|---|---|---|
| 1 – Staging-Branch | ✅ | Branch `staging` existiert, GitHub Actions aktiv |
| 2 – Supabase-Projekte (manuell) | ⏳ | Prod-Credentials in config.js, Staging-Credentials fehlen noch |
| 3 – config.js | ✅ | `frontend/js/config.js` mit IS_STAGING-Erkennung live |
| 4 – config.js in HTML einbinden | ✅ | In allen HTML-Seiten als erstes Script eingebunden |
| 5 – Service Worker Staging | ✅ | `fordify-staging-vN` / `fordify-vN` Cache-Namen aktiv |
| 6 – All Inkl Hosting (manuell) | ⏳ | Staging läuft als Subfolder `/staging`, Subdomain noch nicht |
| 7 – GitHub Actions Workflows | ✅ | `deploy.yml` + `deploy-staging.yml` funktionieren |
| 8 – E2E-Test | ⏳ | Ausstehend (wartet auf Supabase Staging-Credentials) |

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine vollständige Staging-Umgebung einrichten: `staging.fordify.de` wird automatisch aus dem `staging`-Branch deployed, `fordify.de` aus `main` — mit separaten Supabase-Projekten und Runtime-Umgebungserkennung.

**Architecture:** `config.js` erkennt zur Laufzeit anhand von `window.location.hostname`, ob Staging oder Produktion aktiv ist, und liefert die passenden Supabase-Credentials. Zwei GitHub-Actions-Workflows deployen via FTP auf All Inkl: einer für `main` → Live-Ordner, einer für `staging` → Staging-Subfolder. Der Service Worker verwendet in Staging einen separaten Cache-Namen.

**Tech Stack:** GitHub Actions (SamKirkland/FTP-Deploy-Action), All Inkl FTP/Plesk, Supabase (zwei EU-Frankfurt-Projekte), Vanilla JS

---

## File Structure

| Datei | Aktion | Zweck |
|---|---|---|
| `frontend/js/config.js` | NEU | Runtime-Umgebungserkennung + Supabase/Paddle-Config |
| `frontend/index.html` | Ändern | `<script>`-Tag für config.js als erstes App-Script |
| `frontend/sw.js` | Ändern | Umgebungsabhängiger Cache-Name, SW-Version erhöhen |
| `.github/workflows/deploy-staging.yml` | NEU | Staging-Deployment bei Push auf `staging`-Branch |

---

### Task 1: Staging-Branch erstellen

**Files:** keine

- [ ] **Schritt 1: Branch erstellen und pushen**

```bash
git checkout -b staging
git push -u origin staging
```

- [ ] **Schritt 2: Verifizieren**

Auf GitHub → Code → "Branches": Branch `staging` ist sichtbar.

---

### Task 2: Supabase-Projekte anlegen (manuell)

**Files:** keine Codeänderungen — manuelle Schritte auf supabase.com

- [ ] **Schritt 1: Staging-Projekt anlegen**

1. https://supabase.com → Dashboard → "New Project"
2. Name: `fordify-staging`
3. Region: **Europe (Frankfurt)** ← zwingend für DSGVO
4. Datenbankpasswort: sicher generieren und speichern
5. ~2 Minuten warten bis "Project is ready"

- [ ] **Schritt 2: Staging-Credentials notieren**

Dashboard → Settings → API:
- `Project URL` → notieren als `STAGING_SUPABASE_URL`
- `anon public` Key → notieren als `STAGING_SUPABASE_ANON_KEY`

- [ ] **Schritt 3: Production-Projekt anlegen**

1. "New Project" → Name: `fordify-prod`
2. Region: **Europe (Frankfurt)**
3. Ebenso notieren als `PROD_SUPABASE_URL` und `PROD_SUPABASE_ANON_KEY`

---

### Task 3: config.js erstellen

**Files:**
- Erstellen: `frontend/js/config.js`

- [ ] **Schritt 1: Datei erstellen**

`frontend/js/config.js`:

```javascript
const IS_STAGING = ['staging.fordify.de', 'localhost', '127.0.0.1'].some(
  h => window.location.hostname === h || window.location.hostname.startsWith('192.168.')
);

const CONFIG = Object.freeze({
  env: IS_STAGING ? 'staging' : 'production',
  supabase: {
    url:     IS_STAGING ? 'STAGING_SUPABASE_URL_HIER_EINTRAGEN'      : 'PROD_SUPABASE_URL_HIER_EINTRAGEN',
    anonKey: IS_STAGING ? 'STAGING_SUPABASE_ANON_KEY_HIER_EINTRAGEN' : 'PROD_SUPABASE_ANON_KEY_HIER_EINTRAGEN',
  },
  paddle: {
    token:       IS_STAGING ? '' : '',
    environment: IS_STAGING ? 'sandbox' : 'production',
  },
});
```

- [ ] **Schritt 2: Supabase-Credentials aus Task 2 eintragen**

Die vier Platzhalter `*_HIER_EINTRAGEN` mit den in Task 2 notierten Werten ersetzen.

- [ ] **Schritt 3: Lokal im Browser testen**

`index.html` lokal öffnen. In der Browser-Konsole:
```javascript
CONFIG.env        // → "staging"  (weil localhost)
CONFIG.supabase.url  // → deine Staging-URL
```
Kein Fehler "CONFIG is not defined".

- [ ] **Schritt 4: Commit**

```bash
git add frontend/js/config.js
git commit -m "feat: config.js mit Runtime-Umgebungserkennung (Staging/Prod)"
```

---

### Task 4: config.js in index.html einbinden

**Files:**
- Ändern: `frontend/index.html`

- [ ] **Schritt 1: Script-Tag einfügen**

In `index.html` config.js **als erstes** vor allen anderen App-Scripts einfügen (nach Bootstrap, vor data.js):

```html
<!-- Umgebungskonfiguration – muss vor allen App-Scripts stehen -->
<script src="js/config.js"></script>
<!-- danach die bestehenden Scripts: -->
<script src="js/data.js"></script>
<script src="js/zinsen.js"></script>
<!-- ... etc. -->
```

- [ ] **Schritt 2: Verifizieren**

Browser öffnen, Konsole:
```javascript
CONFIG  // → {env: "staging", supabase: {url: "...", anonKey: "..."}, paddle: {...}}
```

- [ ] **Schritt 3: Commit**

```bash
git add frontend/index.html
git commit -m "feat: config.js in index.html eingebunden"
```

---

### Task 5: Service Worker für Staging anpassen

**Files:**
- Ändern: `frontend/sw.js` (Zeile 2)

Der SW cached aggressiv. Ohne Anpassung teilen sich Staging und Produktion denselben Cache — das macht Debugging auf staging.fordify.de fehleranfällig.

- [ ] **Schritt 1: SW-Cache-Name umgebungsabhängig machen**

In `frontend/sw.js` die erste Zeile mit `const CACHE` ersetzen:

```javascript
// fordify Service Worker
const IS_STAGING_SW = self.location.hostname.includes('staging') ||
                      self.location.hostname === 'localhost' ||
                      self.location.hostname === '127.0.0.1';
const CACHE = IS_STAGING_SW ? "fordify-staging-v1" : "fordify-v46";
```

**Wichtig:** `fordify-v45` → `fordify-v46` weil `sw.js` geändert wurde. Alle anderen Stellen in sw.js bleiben unverändert.

- [ ] **Schritt 2: Verifizieren**

Chrome DevTools → Application → Service Workers → Cache Storage:
Auf localhost: `fordify-staging-v1` erscheint (nicht `fordify-v46`).

- [ ] **Schritt 3: Commit**

```bash
git add frontend/sw.js
git commit -m "feat: SW-Cache-Name umgebungsabhängig (fordify-v46 prod / fordify-staging-v1)"
```

---

### Task 6: All Inkl – Staging-Subfolder und Subdomain einrichten (manuell)

**Files:** keine Codeänderungen — manuelle Schritte im All Inkl KAS / Plesk

- [ ] **Schritt 1: Staging-Verzeichnis per FTP anlegen**

Mit FTP-Client (z.B. FileZilla) verbinden:
```
Neuen Ordner anlegen: /staging.fordify.de/
```
(Falls Plesk Subdomains automatisch einen Ordner anlegt, diesen Schritt überspringen.)

- [ ] **Schritt 2: Subdomain im KAS-Panel anlegen**

All Inkl KAS (kas.all-inkl.com) → Domains → Subdomains → "Neue Subdomain":
- Subdomain-Präfix: `staging`
- Domain: `fordify.de`
- Zielverzeichnis: den in Schritt 1 angelegten Ordner

- [ ] **Schritt 3: DNS propagation abwarten**

```bash
nslookup staging.fordify.de
```
Bis eine IP zurückkommt (~5–30 Minuten). Dann weiter.

- [ ] **Schritt 4: Genauen FTP-Zielpfad notieren**

Den FTP-Pfad des Staging-Ordners notieren, z.B.:
- `/staging.fordify.de/` oder
- `/www/staging.fordify.de/`

Dieser Wert kommt in Task 7 als GitHub Secret.

---

### Task 7: GitHub Actions – Staging-Deployment-Workflow

**Files:**
- Erstellen: `.github/workflows/deploy-staging.yml`

- [ ] **Schritt 1: GitHub Secret hinzufügen**

GitHub → Repository → Settings → Secrets and variables → Actions → "New repository secret":
- Name: `FTP_SERVER_DIR_STAGING`
- Value: der in Task 6 Schritt 4 notierte Pfad, z.B. `/staging.fordify.de/`

Die bestehenden Secrets `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD` werden wiederverwendet — kein neues FTP-Konto nötig.

- [ ] **Schritt 2: Staging-Workflow erstellen**

`.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging (staging.fordify.de)

on:
  push:
    branches:
      - staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy via FTP → staging.fordify.de
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./frontend/
          server-dir: ${{ secrets.FTP_SERVER_DIR_STAGING }}
          timeout: 60000
```

- [ ] **Schritt 3: Commit und auf staging pushen**

```bash
git add .github/workflows/deploy-staging.yml
git commit -m "feat: GitHub Actions Staging-Deployment-Workflow"
git push origin staging
```

- [ ] **Schritt 4: GitHub Actions prüfen**

GitHub → Actions → "Deploy to Staging" → Workflow läuft durch (grüner Haken, keine Fehler).

---

### Task 8: End-to-End-Test

**Files:** keine

- [ ] **Schritt 1: staging.fordify.de öffnen**

Browser: `https://staging.fordify.de`  
Erwartetes Ergebnis: Fordify-App lädt vollständig, kein JS-Fehler in der Konsole.

- [ ] **Schritt 2: Umgebungserkennung prüfen**

Browser-Konsole auf staging.fordify.de:
```javascript
CONFIG.env           // → "staging"
CONFIG.supabase.url  // → deine Staging-URL (nicht die Prod-URL!)
```

- [ ] **Schritt 3: Service Worker prüfen**

Chrome DevTools → Application → Cache Storage:
```
fordify-staging-v1  ✓
```
(nicht `fordify-v46`)

- [ ] **Schritt 4: Produktionsseite unverändert prüfen**

Browser: `https://fordify.de`  
Browser-Konsole:
```javascript
CONFIG.env  // → "production"
```
App funktioniert wie vorher.

- [ ] **Schritt 5: Isolation verifizieren – Teständerung nur auf Staging**

```bash
git checkout staging
```

In `frontend/css/app.css` eine sichtbare Änderung machen, z.B. den Navbar-Hintergrund:
```css
/* STAGING TEST – wird direkt revertiert */
.navbar { outline: 3px solid red !important; }
```

```bash
git add frontend/css/app.css
git commit -m "test: Staging-Isolation-Test (wird revertiert)"
git push origin staging
```

Nach GitHub-Actions-Durchlauf (~1 Minute):
- `staging.fordify.de` → roter Navbar-Rahmen sichtbar ✓
- `fordify.de` → unverändert ✓

- [ ] **Schritt 6: Teständerung rückgängig machen**

```bash
git revert HEAD --no-edit
git push origin staging
```

---

## Deployment-Workflow ab jetzt

```
feature-branch  (lokale Entwicklung)
      ↓ merge / push
staging branch  →  GitHub Actions  →  staging.fordify.de  (Supabase staging)
      ↓ Review OK, merge
main branch     →  GitHub Actions  →  fordify.de          (Supabase prod)
```

**Faustregeln:**
- Niemals direkt auf `main` pushen (immer via `staging`)
- Neue Features immer erst auf `staging` testen, dann nach `main` mergen
- `config.js` einmalig gepflegt — keine separaten Configs pro Branch

---

## Manuelle Schritte auf einen Blick

| # | Wo | Was |
|---|---|---|
| 1 | supabase.com | Projekt `fordify-staging` anlegen (EU Frankfurt) |
| 2 | supabase.com | Projekt `fordify-prod` anlegen (EU Frankfurt) |
| 3 | config.js | Vier Supabase-Credentials eintragen |
| 4 | All Inkl KAS | Subdomain `staging.fordify.de` + Zielordner anlegen |
| 5 | github.com/repo/settings | Secret `FTP_SERVER_DIR_STAGING` anlegen |
