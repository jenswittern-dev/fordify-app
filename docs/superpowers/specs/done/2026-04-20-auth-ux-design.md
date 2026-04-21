# Auth & Account UX – Design Spec (v2)

**Goal:** Konsistenter, moderner Login- und Account-Bereich für fordify nach SaaS-Best-Practices. Nahtlose Integration mit Freemium-Modell und Paddle-Checkout.

**Architecture:** Neue Datei `js/auth-ui.js` (lädt VOR `auth.js`) enthält alle DOM-Logik für Avatar-Dropdown, Auto-Checkout und UI-Updates. `auth.js` bleibt für Auth-Logik (Supabase, Magic Link, Cloud-Sync) und ruft Funktionen aus `auth-ui.js` auf.

**Tech Stack:** Vanilla JS, Bootstrap 5 Dropdown, Supabase CDN, Paddle.js (nur auf preise.html).

---

## Seiten-Scope

| Seite | Auth-Navbar | Login-Modal | Free-Banner | Supabase CDN |
|---|---|---|---|---|
| `index.html` | ✅ Avatar-Dropdown | ✅ | ✗ | ✅ |
| `forderungsaufstellung.html` | ✅ Avatar-Dropdown | ✅ | ✅ | ✅ |
| `preise.html` | ✅ Avatar-Dropdown | ✅ | ✗ | ✅ |
| `zinsrechner.html` | ✗ unverändert | ✗ | ✗ | ✗ |
| `rvg-rechner.html` | ✗ unverändert | ✗ | ✗ | ✗ |
| `gerichtskostenrechner.html` | ✗ unverändert | ✗ | ✗ | ✗ |

---

## Script-Ladereihenfolge auf Auth-Seiten

```html
<!-- REIHENFOLGE IST KRITISCH -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/..."></script>
<script src="js/config.js"></script>
<script src="js/storage.js"></script>
<script src="js/auth-ui.js"></script>  <!-- VOR auth.js! aktualisiereUIFuerAuth muss definiert sein -->
<script src="js/auth.js"></script>
<!-- preise.html zusätzlich: paddle.js + inline-script -->
```

`auth.js` ruft `aktualisiereUIFuerAuth()` auf — diese Funktion muss bereits definiert sein wenn `onAuthStateChange` feuert.

---

## Navbar Auth-Komponente

### Guest-Zustand
```html
<button class="btn btn-sm btn-outline-light" id="nav-login-btn"
        data-auth-show="guest" data-bs-toggle="modal" data-bs-target="#loginModal">
  Anmelden
</button>
```

### Eingeloggt-Zustand — Avatar-Dropdown
```html
<div class="dropdown d-none" data-auth-show="user">
  <button class="nav-avatar dropdown-toggle" id="navAvatarBtn"
          data-bs-toggle="dropdown" aria-expanded="false"
          title="Mein Konto">
    <span id="nav-avatar-initials">?</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end nav-account-dropdown">
    <li><div class="dropdown-header-info">
      <div id="nav-user-email" class="dropdown-email"></div>
      <span id="nav-plan-badge" class="plan-badge"></span>
    </div></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="#" onclick="openCustomerPortal(); return false;">
      Abo verwalten <span style="opacity:0.5;font-size:0.8em">↗</span>
    </a></li>
    <li><a class="dropdown-item text-danger" href="#" onclick="logout(); return false;">Abmelden</a></li>
  </ul>
</div>
```

**Plan-Badge Farben:**
- `free` → `background:#e2e8f0; color:#475569` — Text „FREE"
- `pro` → `background:#fef3c7; color:#92400e` — Text „PRO"
- `business` → `background:#dbeafe; color:#1e40af` — Text „BUSINESS"

**Avatar-CSS:**
```css
.nav-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.2); color: white;
  font-size: 0.7rem; font-weight: 700; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.nav-avatar:hover { background: rgba(255,255,255,0.35); }
.nav-account-dropdown { min-width: 220px; }
.dropdown-header-info { padding: 0.5rem 1rem; }
.dropdown-email { font-size: 0.8rem; color: #64748b; word-break: break-all; }
.plan-badge { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem;
              border-radius: 4px; margin-top: 0.25rem; display: inline-block; }
```

---

## Login-Modal (einheitlich auf allen 3 Auth-Seiten)

```html
<div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold" id="loginModalLabel">Bei fordify anmelden</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body pt-2">
        <p class="text-muted small mb-3">
          Wir senden dir einen sicheren Login-Link per E-Mail –
          kein Passwort nötig. Bitte öffne den Link in diesem Browser-Fenster.
        </p>
        <input type="email" id="login-email" class="form-control mb-2"
               placeholder="deine@email.de" autocomplete="email">
        <button class="btn btn-primary w-100"
                onclick="loginMitEmail(document.getElementById('login-email').value)">
          Login-Link senden
        </button>
        <div id="login-status" class="d-none mt-2"></div>
      </div>
    </div>
  </div>
</div>
```

---

## Checkout-Flow (nicht eingeloggt)

### Ablauf
1. Nutzer klickt „Pro abonnieren"
2. `startCheckout('pro-monthly')` validiert `interval` gegen Whitelist
3. URL-Parameter setzen: `?checkout=pro-monthly`
4. Login-Modal öffnet sich
5. `emailRedirectTo` = `window.location.origin + '/preise?checkout=pro-monthly'`
6. Nach Magic Link → Rückkehr auf `/preise?checkout=pro-monthly`
7. `onAuthStateChange` SIGNED_IN → `checkAutoCheckout()` wird aufgerufen
8. `checkAutoCheckout()` zeigt 800ms Toast „Checkout wird vorbereitet…" → dann `Paddle.Checkout.open()`
9. `history.replaceState()` entfernt `?checkout=` aus URL

### Whitelist-Validierung (Security)
```javascript
const VALID_CHECKOUT_PARAMS = ['pro-monthly', 'pro-yearly', 'business-monthly', 'business-yearly'];

function startCheckout(interval) {
  if (!VALID_CHECKOUT_PARAMS.includes(interval)) return;
  if (!paddleReady) { /* Fehlermeldung */ return; }
  const priceId = PRICE_MAP[interval];
  if (!priceId) return;

  const userId = (typeof fordifyAuth !== 'undefined' && fordifyAuth.user?.id) || null;
  if (!userId) {
    // Nicht eingeloggt → URL-Param setzen, dann Modal
    const url = new URL(window.location.href);
    url.searchParams.set('checkout', interval);
    history.replaceState({}, '', url);
    new bootstrap.Modal(document.getElementById('loginModal')).show();
    return;
  }
  Paddle.Checkout.open({ items: [{ priceId, quantity: 1 }], customData: { user_id: userId } });
}
```

### checkAutoCheckout() mit Guards
```javascript
function checkAutoCheckout() {
  if (!paddleReady) return;                          // Paddle nicht bereit
  const params = new URLSearchParams(window.location.search);
  const interval = params.get('checkout');
  if (!VALID_CHECKOUT_PARAMS.includes(interval)) return;  // Whitelist

  history.replaceState({}, '', window.location.pathname);  // URL aufräumen

  // Toast zeigen, dann Checkout
  _zeigeCheckoutToast(() => {
    const priceId = PRICE_MAP[interval];
    Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { user_id: fordifyAuth.user.id }
    });
  });
}

function _zeigeCheckoutToast(callback) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;background:#1e3a8a;color:white;padding:0.75rem 1.25rem;border-radius:8px;font-size:0.875rem;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
  toast.textContent = 'Angemeldet ✓ – Checkout wird vorbereitet…';
  document.body.appendChild(toast);
  setTimeout(() => { document.body.removeChild(toast); callback(); }, 800);
}
```

---

## Neue Datei: `js/auth-ui.js`

Verantwortlichkeiten:
- `aktualisiereUIFuerAuth()` — togglet `data-auth-show` Elemente, setzt Initialen, E-Mail, Plan-Badge
- `_getInitials(email)` — z.B. `jens@fordify.de` → `JW` (erster Buchstabe + letzter Buchstabe vor @, oder einfach erster Buchstabe)
- `_getPlanBadgeHTML(plan)` — gibt Badge-HTML zurück
- `openCustomerPortal()` — `window.open('https://customer.paddle.com/', '_blank')`
- `checkAutoCheckout()` — liest `?checkout=` nach SIGNED_IN (nur auf preise.html)
- `_zeigeCheckoutToast(callback)` — 800ms Toast vor Checkout-Open
- `VALID_CHECKOUT_PARAMS` — Whitelist der 4 gültigen Werte
- `PRICE_MAP` — Mapping interval → priceId (von preise.html inline ausgelagert)

---

## Anpassungen bestehender Dateien

**`auth.js`:**
- `aktualisiereUIFuerAuth()` entfernen (jetzt in auth-ui.js)
- Aufrufe bleiben: `aktualisiereUIFuerAuth()` — funktioniert weil auth-ui.js vorher lädt
- `onAuthStateChange` SIGNED_IN: nach `aktualisiereUIFuerAuth()` zusätzlich `checkAutoCheckout()` aufrufen

**`forderungsaufstellung.html`:**
- Script-Reihenfolge: auth-ui.js vor auth.js
- Navbar: bestehende Buttons durch Avatar-Dropdown-HTML ersetzen
- Login-Modal: Text aktualisieren

**`preise.html`:**
- Script-Reihenfolge: auth-ui.js vor auth.js
- Navbar: inkonsistente Buttons durch Avatar-Dropdown-HTML ersetzen
- Inline-Script: `startCheckout()` und `PRICE_MAP` aus auth-ui.js beziehen
- `paddleReady`-Variable bleibt im Inline-Script (Paddle-Init ist seitenspezifisch)

**`index.html`:**
- Supabase CDN + config.js + storage.js + auth-ui.js + auth.js hinzufügen
- Avatar-Dropdown in Navbar einbauen
- Login-Modal hinzufügen

**`supabase/functions/paddle-webhook/index.ts`:**
- E-Mail-Fallback-Lookup entfernen (Security-Risiko: Subscription-Hijacking möglich)
- `user_id` ist Pflicht — ohne user_id → 400 zurückgeben

**`sw.js`:** `/js/auth-ui.js` zu ASSETS hinzufügen, Version erhöhen.

---

## CSS-Ergänzungen (`css/app.css`)

Avatar-Dropdown-Styles + Plan-Badge-Farben eintragen (siehe oben).
