# Legal & UX Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Footer der Forderungsaufstellung angleichen + Haftungsausschluss ergänzen, Changelog-Seite erstellen, und Export/Import-Buttons für Free-Nutzer ausblenden.

**Architecture:** Drei unabhängige Teilaufgaben. Kein neues JS-Modul nötig: Footer ist reines HTML, Changelog ist eine neue statische HTML-Seite, Export/Import-Gate nutzt das bestehende `data-auth-show`-Attribut-System aus `auth-ui.js`.

**Tech Stack:** Vanilla HTML/CSS, Bootstrap 5.3.3, bestehende `aktualisiereUIFuerAuth()` in `auth-ui.js`.

---

## Kontext & Architektur

### Footer-System

Alle Seiten außer `forderungsaufstellung.html` nutzen:
```html
<footer class="fordify-footer">
  <div class="container">
    <div class="footer-cols">
      <div><!-- Brand + Badges --></div>
      <div><!-- Tools --></div>
      <div><!-- Produkt --></div>
      <div><!-- Rechtliches --></div>
    </div>
    <div class="fordify-footer__bottom">
      <div class="fordify-footer__copy">© 2025 fordify · Alle Rechte vorbehalten</div>
      <div class="fordify-footer__right">Von Anwälten entwickelt · DSGVO-konform</div>
    </div>
  </div>
</footer>
```

`forderungsaufstellung.html` hat noch einen minimalen Inline-Footer (Zeile ~633). Er muss durch den Standard-Footer ersetzt werden — mit zusätzlicher Klasse `no-print`, damit er nicht ins PDF gedruckt wird.

Der Haftungsausschluss kommt als dritte Zeile in `fordify-footer__bottom`:
```html
<div class="fordify-footer__disclaimer">Kein Ersatz für individuelle Rechtsberatung · Ergebnisse ohne Gewähr</div>
```

Da die Forderungsaufstellungs-Seite das einzige Tool ist, das Berechnungen mit rechtlichen Konsequenzen ausgibt, kommt der Haftungsausschluss **nur auf dieser Seite** in den Footer — nicht sitewide.

### `data-auth-show`-System (auth-ui.js)

`aktualisiereUIFuerAuth()` in `frontend/js/auth-ui.js` verarbeitet aktuell:
- `data-auth-show="guest"` → sichtbar wenn nicht eingeloggt
- `data-auth-show="user"` → sichtbar wenn eingeloggt

Für 5.8 wird `data-auth-show="paid"` ergänzt:
- Sichtbar wenn `fordifyAuth.hasSubscription === true`
- Unsichtbar (d-none) für Gäste und eingeloggte Free-Nutzer

### Export/Import-Buttons in forderungsaufstellung.html

Betroffen (alle im „Teilen/Export"-Modal oder in der Sidebar):
- `<button onclick="fallExportieren()">Export JSON</button>` (ca. Zeile 392)
- `<button onclick="fallExportierenAlsExcel()">Export CSV</button>` (ca. Zeile 393)
- `<label>Import JSON <input onchange="fallImportierenDatei(this)"></label>` (ca. Zeile 396)

Diese erhalten `data-auth-show="paid"`. Die JS-Gates (`requiresPaid`) bleiben als Fallback erhalten.

---

## Dateistruktur

| Datei | Aktion | Was |
|-------|--------|-----|
| `frontend/forderungsaufstellung.html` | Modify | Footer ersetzen + Haftungsausschluss + `data-auth-show="paid"` auf Export/Import-Buttons |
| `frontend/js/auth-ui.js` | Modify | `data-auth-show="paid"` Handler in `aktualisiereUIFuerAuth()` |
| `frontend/changelog.html` | Create | Neue Changelog-Seite |
| `frontend/sw.js` | Modify | SW v118→v119, `/changelog.html` in ASSETS |
| `CLAUDE.md` | Modify | SW-Version aktualisieren |
| `docs/ROADMAP.md` | Modify | 5.1, 5.2, 5.3, 5.8 auf ✅ setzen |

---

## Task 1: Footer FA + Haftungsausschluss

**Files:**
- Modify: `frontend/forderungsaufstellung.html` (Footer-Block, ca. Zeile 632–641)

- [ ] **Step 1: Footer-Block in forderungsaufstellung.html identifizieren und ersetzen**

Lies `frontend/forderungsaufstellung.html` ab Zeile 628 um den genauen Block zu finden.

Ersetze den aktuellen Footer:
```html
<footer class="no-print" style="margin-top:3rem;padding:1.25rem 0;border-top:1px solid var(--color-border);background:var(--color-surface)">
  <div class="container d-flex gap-3 justify-content-center" style="font-size:0.8rem;color:var(--color-text-muted)">
    <span>© 2026 fordify</span>
    <a href="impressum.html" style="color:var(--color-text-muted);text-decoration:none" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text-muted)'">Impressum</a>
    <a href="datenschutz.html" style="color:var(--color-text-muted);text-decoration:none" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text-muted)'">Datenschutz</a>
    <a href="agb.html" style="color:var(--color-text-muted);text-decoration:none" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text-muted)'">AGB</a>
  </div>
</footer>
```

durch:
```html
<footer class="fordify-footer no-print">
  <div class="container">
    <div class="footer-cols">
      <div>
        <div class="fordify-footer__brand-name">fordify</div>
        <div class="fordify-footer__brand-desc">Professionelle Forderungsberechnungen für Kanzleien, Inkassobüros und Unternehmen. Von Anwälten entwickelt und geprüft.</div>
        <div class="fordify-footer__badges">
          <span class="fordify-footer__badge">RVG 2025</span>
          <span class="fordify-footer__badge">§ 367 BGB</span>
          <span class="fordify-footer__badge">DSGVO</span>
          <span class="fordify-footer__badge">Basiszins 07/2026</span>
        </div>
      </div>
      <div>
        <div class="fordify-footer__col-title">Tools</div>
        <ul>
          <li><a href="/forderungsaufstellung" class="footer-link--highlight">Forderungsaufstellung →</a></li>
          <li><a href="/zinsrechner">Verzugszinsrechner</a></li>
          <li><a href="/rvg-rechner">RVG-Rechner</a></li>
          <li><a href="/gerichtskostenrechner">Gerichtskostenrechner</a></li>
        </ul>
      </div>
      <div>
        <div class="fordify-footer__col-title">Produkt</div>
        <ul>
          <li><a href="/preise" class="footer-link--highlight">Preise</a></li>
          <li><a href="/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <div class="fordify-footer__col-title">Rechtliches</div>
        <ul>
          <li><a href="/impressum.html">Impressum</a></li>
          <li><a href="/datenschutz.html">Datenschutz</a></li>
          <li><a href="/agb">AGB</a></li>
        </ul>
      </div>
    </div>
    <div class="fordify-footer__bottom">
      <div class="fordify-footer__copy">© 2026 fordify · Alle Rechte vorbehalten</div>
      <div class="fordify-footer__right">Von Anwälten entwickelt · DSGVO-konform</div>
      <div class="fordify-footer__disclaimer" style="width:100%;text-align:center;font-size:0.72rem;color:var(--color-text-muted);margin-top:0.5rem;opacity:0.75;">Kein Ersatz für individuelle Rechtsberatung · Ergebnisse ohne Gewähr</div>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Gleiche Changelog-Links auch in den anderen Seiten-Footern ergänzen**

In `frontend/index.html`, `frontend/zinsrechner.html`, `frontend/rvg-rechner.html`, `frontend/gerichtskostenrechner.html`, `frontend/preise.html`:

Suche jeweils den Produkt-Spalten-Block:
```html
      <div>
        <div class="fordify-footer__col-title">Produkt</div>
        <ul>
          <li><a href="/preise" class="footer-link--highlight">Preise</a></li>
        </ul>
      </div>
```

Ersetze durch:
```html
      <div>
        <div class="fordify-footer__col-title">Produkt</div>
        <ul>
          <li><a href="/preise" class="footer-link--highlight">Preise</a></li>
          <li><a href="/changelog">Changelog</a></li>
        </ul>
      </div>
```

- [ ] **Step 3: Verifizieren**

```bash
grep -l "fordify-footer" frontend/*.html
# Erwartung: index.html, zinsrechner.html, rvg-rechner.html, gerichtskostenrechner.html, preise.html, forderungsaufstellung.html

grep -c "changelog" frontend/index.html frontend/zinsrechner.html frontend/rvg-rechner.html frontend/gerichtskostenrechner.html frontend/preise.html frontend/forderungsaufstellung.html
# Jede Datei: mind. 1
```

- [ ] **Step 4: Commit**

```bash
git add frontend/forderungsaufstellung.html frontend/index.html frontend/zinsrechner.html frontend/rvg-rechner.html frontend/gerichtskostenrechner.html frontend/preise.html
git commit -m "feat: Footer FA auf fordify-footer upgraden + Haftungsausschluss + Changelog-Links"
```

---

## Task 2: data-auth-show="paid" in auth-ui.js + Export/Import-Buttons

**Files:**
- Modify: `frontend/js/auth-ui.js` (Funktion `aktualisiereUIFuerAuth`, ca. Zeile 14–36)
- Modify: `frontend/forderungsaufstellung.html` (Export/Import-Buttons, ca. Zeile 390–400)

- [ ] **Step 1: `data-auth-show="paid"` Handler in auth-ui.js ergänzen**

Aktuelle `aktualisiereUIFuerAuth`-Funktion (Zeilen 14–36 in `auth-ui.js`) enthält:
```js
  document.querySelectorAll('[data-auth-show="guest"]').forEach(el =>
    el.classList.toggle('d-none', isAuth));
  document.querySelectorAll('[data-auth-show="user"]').forEach(el =>
    el.classList.toggle('d-none', !isAuth));
```

Ergänze direkt darunter (nach der `user`-Zeile, vor dem `if (isAuth && fordifyAuth.user)` Block):
```js
  document.querySelectorAll('[data-auth-show="paid"]').forEach(el =>
    el.classList.toggle('d-none', !isPaid));
```

- [ ] **Step 2: Export/Import-Buttons in forderungsaufstellung.html mit data-auth-show="paid" ausstatten**

Lies `frontend/forderungsaufstellung.html` ab Zeile 388 um die genauen Zeilen zu finden.

Es gibt drei betroffene Elemente (im Teilen/Export-Bereich):

**Export JSON Button** — suche `onclick="fallExportieren()"`, ergänze `data-auth-show="paid"`:
```html
<button type="button" class="btn-ghost" onclick="fallExportieren()" data-auth-show="paid">Export JSON</button>
```

**Export CSV Button** — suche `onclick="fallExportierenAlsExcel()"`, ergänze `data-auth-show="paid"`:
```html
<button type="button" class="btn-ghost" onclick="fallExportierenAlsExcel()" data-auth-show="paid">Export CSV</button>
```

**Import JSON Label** — suche das `<label>`-Element mit dem JSON-file-input `onchange="fallImportierenDatei(this)"`, ergänze `data-auth-show="paid"` am Label:
```html
<label class="btn-ghost" data-auth-show="paid" role="button" tabindex="0"
       onkeydown="if(event.key==='Enter'||event.key===' ')this.click()">
  Import JSON
  <input type="file" accept=".json" class="d-none" onchange="fallImportierenDatei(this)">
</label>
```

Achtung: Das Label hat möglicherweise bereits `role="button"` und `tabindex` — nur `data-auth-show="paid"` hinzufügen, nichts entfernen.

- [ ] **Step 3: Manuell verifizieren (Konsole)**

Öffne die App als nicht-eingeloggter Nutzer. Öffne das Teilen/Export-Modal. Die drei Buttons (Export JSON, Export CSV, Import JSON) dürfen nicht sichtbar sein.

Als Pro-Nutzer eingeloggt: alle drei Buttons sichtbar.

- [ ] **Step 4: Commit**

```bash
git add frontend/js/auth-ui.js frontend/forderungsaufstellung.html
git commit -m "feat: Export/Import-Buttons für Free-Nutzer ausblenden (data-auth-show=paid)"
```

---

## Task 3: Changelog-Seite

**Files:**
- Create: `frontend/changelog.html`
- Modify: `frontend/sw.js` (Version v118→v119, `/changelog.html` in ASSETS)
- Modify: `CLAUDE.md` (SW-Version)
- Modify: `docs/ROADMAP.md` (5.1, 5.2, 5.3, 5.8 auf ✅)

- [ ] **Step 1: changelog.html erstellen**

Erstelle `frontend/changelog.html` mit folgendem Inhalt:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changelog – fordify</title>
  <meta name="description" content="fordify Änderungshistorie – neue Features, Verbesserungen und Bugfixes.">
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/app.css">
  <link rel="stylesheet" href="/css/rechner.css">
  <link rel="icon" href="/img/logo.svg" type="image/svg+xml">
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg fordify-navbar" style="background:var(--color-surface);border-bottom:1px solid var(--color-border);">
  <div class="container">
    <a class="navbar-brand fordify-brand" href="/">
      <img src="/img/logo-wordmark.svg" alt="fordify" height="28">
    </a>
    <div class="d-flex gap-2 align-items-center ms-auto">
      <a href="/forderungsaufstellung" class="btn btn-primary btn-sm">App öffnen →</a>
    </div>
  </div>
</nav>

<!-- Content -->
<div class="container py-5" style="max-width:720px;">
  <h1 class="h3 fw-bold mb-1">Changelog</h1>
  <p class="text-muted mb-5">Neue Funktionen, Verbesserungen und Korrekturen.</p>

  <!-- v1.x Einträge -->
  <div class="mb-5">
    <div class="d-flex align-items-baseline gap-3 mb-3">
      <h2 class="h5 fw-semibold mb-0">April 2026</h2>
      <span class="badge" style="background:#eff6ff;color:#1e40af;font-weight:500;font-size:0.7rem;">Business</span>
      <span class="badge" style="background:#f0fdf4;color:#166534;font-weight:500;font-size:0.7rem;">Pro</span>
    </div>
    <ul class="list-unstyled" style="border-left:2px solid var(--color-border);padding-left:1.25rem;">
      <li class="mb-3">
        <span class="badge mb-1" style="background:#eff6ff;color:#1e40af;font-size:0.65rem;">Business</span>
        <div class="fw-medium">Mandanten-Adressbuch</div>
        <div class="text-muted small">Mandanten zentral verwalten, Autovervollständigung im Mandant-Feld der Forderungsaufstellung.</div>
      </li>
      <li class="mb-3">
        <span class="badge mb-1" style="background:#f0fdf4;color:#166534;font-size:0.65rem;">Pro</span>
        <div class="fw-medium">Schuldner-Adressbuch</div>
        <div class="text-muted small">Schuldner-Adressen speichern und per Autovervollständigung in neue Fälle übernehmen.</div>
      </li>
      <li class="mb-3">
        <span class="badge mb-1" style="background:#eff6ff;color:#1e40af;font-size:0.65rem;">Business</span>
        <div class="fw-medium">CSV-Import für Fälle</div>
        <div class="text-muted small">Mehrere Fälle auf einmal aus einer CSV-Datei importieren (Pflichtfelder: Gegner, Betrag).</div>
      </li>
      <li class="mb-3">
        <span class="badge mb-1" style="background:#f8fafc;color:#475569;font-size:0.65rem;">Alle</span>
        <div class="fw-medium">Gestuftes PDF-Branding</div>
        <div class="text-muted small">Business-Nutzer erhalten PDFs ohne fordify-Branding, Pro-Nutzer dezentes Branding, Free-Nutzer prominentes Branding.</div>
      </li>
      <li class="mb-3">
        <span class="badge mb-1" style="background:#f8fafc;color:#475569;font-size:0.65rem;">Alle</span>
        <div class="fw-medium">Tilgungsbestimmung bei Zahlungen</div>
        <div class="text-muted small">Zahlungen können spezifischen Hauptforderungen oder Zinsen zugeordnet werden (§ 366 BGB).</div>
      </li>
    </ul>
  </div>

  <div class="mb-5">
    <div class="d-flex align-items-baseline gap-3 mb-3">
      <h2 class="h5 fw-semibold mb-0">März 2026</h2>
    </div>
    <ul class="list-unstyled" style="border-left:2px solid var(--color-border);padding-left:1.25rem;">
      <li class="mb-3">
        <span class="badge mb-1" style="background:#f8fafc;color:#475569;font-size:0.65rem;">Alle</span>
        <div class="fw-medium">Launch: fordify</div>
        <div class="text-muted small">Forderungsaufstellung nach § 367 BGB, RVG-Rechner (BGBl. 2025), Verzugszinsrechner, GKG-Rechner. Mehrfall-Verwaltung, Undo-Stack, Print-to-PDF, PWA.</div>
      </li>
    </ul>
  </div>
</div>

<!-- Footer -->
<footer class="fordify-footer">
  <div class="container">
    <div class="footer-cols">
      <div>
        <div class="fordify-footer__brand-name">fordify</div>
        <div class="fordify-footer__brand-desc">Professionelle Forderungsberechnungen für Kanzleien, Inkassobüros und Unternehmen. Von Anwälten entwickelt und geprüft.</div>
        <div class="fordify-footer__badges">
          <span class="fordify-footer__badge">RVG 2025</span>
          <span class="fordify-footer__badge">§ 367 BGB</span>
          <span class="fordify-footer__badge">DSGVO</span>
          <span class="fordify-footer__badge">Basiszins 07/2026</span>
        </div>
      </div>
      <div>
        <div class="fordify-footer__col-title">Tools</div>
        <ul>
          <li><a href="/forderungsaufstellung" class="footer-link--highlight">Forderungsaufstellung →</a></li>
          <li><a href="/zinsrechner">Verzugszinsrechner</a></li>
          <li><a href="/rvg-rechner">RVG-Rechner</a></li>
          <li><a href="/gerichtskostenrechner">Gerichtskostenrechner</a></li>
        </ul>
      </div>
      <div>
        <div class="fordify-footer__col-title">Produkt</div>
        <ul>
          <li><a href="/preise" class="footer-link--highlight">Preise</a></li>
          <li><a href="/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <div class="fordify-footer__col-title">Rechtliches</div>
        <ul>
          <li><a href="/impressum.html">Impressum</a></li>
          <li><a href="/datenschutz.html">Datenschutz</a></li>
          <li><a href="/agb">AGB</a></li>
        </ul>
      </div>
    </div>
    <div class="fordify-footer__bottom">
      <div class="fordify-footer__copy">© 2026 fordify · Alle Rechte vorbehalten</div>
      <div class="fordify-footer__right">Von Anwälten entwickelt · DSGVO-konform</div>
    </div>
  </div>
</footer>

</body>
</html>
```

- [ ] **Step 2: SW v119 + changelog.html in ASSETS**

In `frontend/sw.js` Zeile 5:
```js
const CACHE = IS_STAGING_SW ? "fordify-staging-v72" : "fordify-v118";
```
→
```js
const CACHE = IS_STAGING_SW ? "fordify-staging-v73" : "fordify-v119";
```

Im ASSETS-Array nach `"/changelog.html"` einfügen — direkt nach `"/agb.html"` (ca. Zeile 15):
```js
  "/agb.html",
  "/changelog.html",
```

- [ ] **Step 3: ROADMAP.md aktualisieren**

In `docs/ROADMAP.md`:

| Zeile | Alt | Neu |
|-------|-----|-----|
| 5.1 | `\| 5.1 \| Haftungsausschluss im Footer der App \| 📋 \| — \|` | `\| 5.1 \| Haftungsausschluss im Footer der App \| ✅ \| 2026-04-23 \|` |
| 5.2 | `\| 5.2 \| Datenschutz-Link im App-Footer \| 📋 \| — \|` | `\| 5.2 \| Datenschutz-Link im App-Footer \| ✅ \| 2026-04-23 \|` |
| 5.3 | `\| 5.3 \| Changelog / Versionshistorie \| 📋 \| — \|` | `\| 5.3 \| Changelog / Versionshistorie \| ✅ \| 2026-04-23 \|` |
| 5.8 | `\| 5.8 \| **Free-Version: Export/Import vollständig sperren** ...` | Status `📋` → `✅`, Datum `—` → `2026-04-23` |

- [ ] **Step 4: CLAUDE.md SW-Version aktualisieren**

Suche in `CLAUDE.md` die Zeile mit `fordify-v118 / staging-v72`, ersetze durch `fordify-v119 / staging-v73`.

- [ ] **Step 5: Verifizieren**

```bash
grep "fordify-v" frontend/sw.js
# Erwartet: fordify-staging-v73 / fordify-v119

grep "changelog" frontend/sw.js
# Erwartet: "/changelog.html",

grep -c "✅" docs/ROADMAP.md
# Sollte mehr als vorher sein
```

- [ ] **Step 6: Commit + Push**

```bash
git add frontend/changelog.html frontend/sw.js CLAUDE.md docs/ROADMAP.md
git commit -m "feat: Changelog-Seite + SW v119 + ROADMAP 5.1-5.3/5.8 ✅"
git push origin staging
git push origin main
```
