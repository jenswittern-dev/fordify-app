# Auth & Account UX – Design Spec

**Goal:** Konsistenter, moderner Login- und Account-Bereich für fordify, der auf Best Practices moderner SaaS-Apps (Stripe, Linear, GitHub) basiert und nahtlos mit dem Freemium-Modell zusammenarbeitet.

**Architecture:** Shared `js/auth-ui.js` enthält Avatar-Dropdown-Logik und wird auf den drei relevanten Seiten eingebunden. Login via Magic Link (bereits implementiert in `auth.js`). Checkout-Flow über URL-Parameter für Auto-Checkout nach Login.

**Tech Stack:** Vanilla JS, Bootstrap 5 Dropdown, bestehende `auth.js` + `storage.js`, Supabase CDN nur auf Auth-Seiten.

---

## Seiten-Scope

| Seite | Auth-Navbar | Login-Modal | Free-Banner |
|---|---|---|---|
| `index.html` | ✅ Avatar-Dropdown | ✅ | ✗ |
| `forderungsaufstellung.html` | ✅ Avatar-Dropdown | ✅ | ✅ |
| `preise.html` | ✅ Avatar-Dropdown | ✅ | ✗ |
| `zinsrechner.html` | ✗ unverändert | ✗ | ✗ |
| `rvg-rechner.html` | ✗ unverändert | ✗ | ✗ |
| `gerichtskostenrechner.html` | ✗ unverändert | ✗ | ✗ |

---

## Navbar Auth-Komponente

### Guest-Zustand
Rechts in der Navbar ein einzelner Button:
```html
<button class="btn btn-sm btn-outline-light" id="nav-login-btn">Anmelden</button>
```
Klick öffnet das Login-Modal.

### Eingeloggt-Zustand
Avatar-Kreis mit Initialen des Nutzers (erste Buchstaben der E-Mail), Bootstrap Dropdown:

```html
<div class="dropdown">
  <button class="nav-avatar" id="nav-avatar-btn" data-bs-toggle="dropdown">
    JW  <!-- Initialen -->
  </button>
  <ul class="dropdown-menu dropdown-menu-end">
    <li><span class="dropdown-email">j.wittern@gmail.com</span></li>
    <li><span class="dropdown-plan-badge">PRO</span></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" onclick="openCustomerPortal()">Abo verwalten →</a></li>
    <li><a class="dropdown-item text-danger" onclick="logout()">Abmelden</a></li>
  </ul>
</div>
```

**Plan-Badge Farben:**
- `free` → grau, Text „FREE"
- `pro` → amber (`#f59e0b`), Text „PRO"
- `business` → blau (`#1e40af`), Text „BUSINESS"

**Avatar-Farbe:** Primärblau mit weißem Text, Hover etwas heller.

---

## Login-Modal

Einheitliches Modal auf allen drei Auth-Seiten:
- Titel: „Bei fordify anmelden"
- Untertitel: „Wir senden dir einen Magic Link – kein Passwort nötig."
- E-Mail-Input + „Magic Link senden"-Button
- Status-Div für Feedback (Fehler, Erfolg)

`emailRedirectTo` zeigt auf `/preise` wenn Checkout-Parameter vorhanden, sonst auf `/forderungsaufstellung`.

---

## Checkout-Flow (nicht eingeloggt)

1. Nutzer klickt „Pro abonnieren" auf `/preise` ohne eingeloggt zu sein
2. URL-Parameter wird gesetzt: `?checkout=pro-monthly` (oder `pro-yearly`, `business-monthly`, `business-yearly`)
3. Login-Modal öffnet sich mit Hinweis: _„Melde dich an, um das Abonnement abzuschließen."_
4. `emailRedirectTo` = `window.location.origin + '/preise?checkout=pro-monthly'`
5. Nach Magic-Link-Klick landet Nutzer auf `/preise?checkout=pro-monthly`
6. `onAuthStateChange` SIGNED_IN feuert → `checkAutoCheckout()` liest URL-Parameter → Paddle-Checkout öffnet sich automatisch
7. URL-Parameter wird aus der History entfernt (`history.replaceState`)

---

## Customer Portal

`openCustomerPortal()` öffnet Paddle Customer Portal:
```javascript
function openCustomerPortal() {
  window.open('https://customer.paddle.com/', '_blank');
}
```
Paddle leitet nach E-Mail-Eingabe automatisch zum richtigen Account. Kein zusätzliches Backend nötig.

---

## Neue Datei: `js/auth-ui.js`

Enthält die gesamte UI-Logik für Auth-Navbar — wird aus `auth.js` herausgetrennt:

- `aktualisiereUIFuerAuth()` — togglet Guest/User-Elemente, setzt Avatar-Initialen und Plan-Badge
- `openCustomerPortal()` — öffnet Paddle-Portal
- `checkAutoCheckout()` — liest `?checkout=` URL-Parameter, öffnet Paddle-Checkout nach Login
- `_getInitials(email)` — extrahiert Initialen aus E-Mail
- `_getPlanBadge(plan)` — gibt Badge-HTML zurück

`auth.js` bleibt für Auth-Logik (Supabase, Magic Link, Cloud-Sync). `auth-ui.js` ist ausschließlich für DOM-Manipulation zuständig.

---

## Anpassungen bestehender Dateien

**`auth.js`:**
- `aktualisiereUIFuerAuth()` wird nach `auth-ui.js` ausgelagert
- Aufruf bleibt gleich

**`forderungsaufstellung.html`:**
- Navbar: bestehende `data-auth-show`-Buttons durch Avatar-Dropdown ersetzen
- Login-Modal: bereits vorhanden, Untertitel anpassen
- Free-Banner: bleibt, Text leicht optimieren

**`preise.html`:**
- Navbar: bestehende inkonsistente Buttons durch Avatar-Dropdown ersetzen
- `checkAutoCheckout()` nach SIGNED_IN aufrufen
- `startCheckout()` setzt URL-Parameter vor Modal-Öffnung

**`index.html`:**
- Supabase CDN + `storage.js` + `auth.js` + `auth-ui.js` hinzufügen
- Avatar-Dropdown in Navbar einbauen
- Login-Modal hinzufügen

**`sw.js`:** `/js/auth-ui.js` zu ASSETS hinzufügen, Version erhöhen.
