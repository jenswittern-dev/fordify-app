# Landing Page P2 Fixes – Design & Content

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply all P2 Design (D1–D5) and Content (C1–C6) improvements to the fordify landing page and pricing page on the staging branch.

**Architecture:** Pure Static SPA – no build step, edit files directly. All frontend changes require incrementing the staging Service Worker version in `frontend/sw.js` (current: `fordify-staging-v149`).

**Tech Stack:** HTML, Bootstrap 5.3.3, CSS Custom Properties (`var(--color-primary)` = #1e3a8a), Vanilla JS

**Staging only** – push only to `staging` branch, NOT to `main`.

---

## File Map

- Modify: `frontend/css/rechner.css` — D1 (tool-card icon colors), D4 (add CSS class)
- Modify: `frontend/css/app.css` — D3 (remove min-height), D5 (extract modal CSS), D2 (free-link style)
- Modify: `frontend/index.html` — D4 (swap inline style → class), C1–C5
- Modify: `frontend/preise.html` — D2 (add free CTA), D5 (swap inline styles → classes), C3, C5, C6
- Modify: `frontend/sw.js` — bump staging version after each commit

---

### Task 1: CSS Fixes (rechner.css + app.css)

**Files:**
- Modify: `frontend/css/rechner.css` (lines 374, 382, 400, ~497)
- Modify: `frontend/css/app.css` (line 1964–1968, 1979, ~2033)
- Modify: `frontend/sw.js`

**What and why:**
- D1: Tool-card secondary icon background/fill/link colors use violet (#ede9fe / #6d28d9) — off-brand, should match primary blue
- D4: SEO first-column spans full grid via inline `style="grid-column: 1 / -1"` — extract to CSS class
- D3: `.plan-desc` has `min-height: 4.5rem` that forces uneven card heights — remove it
- D5: AGB-Consent-Modal uses ~20 inline styles — extract to named classes in app.css
- D2: Pricing hero needs a "start for free" secondary CTA link below billing toggle

- [ ] **Step 1: Fix D1 – Tool-card violet colors in rechner.css**

  Current (rechner.css ~line 374):
  ```css
  .tool-card__icon {
    background: #ede9fe;
  ```

  Change to:
  ```css
  .tool-card__icon {
    background: rgba(30,58,138,.1);
  ```

  Current (rechner.css ~line 382):
  ```css
  .tool-card__icon svg {
    fill: #6d28d9;
  ```

  Change to:
  ```css
  .tool-card__icon svg {
    fill: var(--color-primary);
  ```

  Current (rechner.css ~line 400):
  ```css
  .tool-card__cta {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6d28d9;
  ```

  Change to:
  ```css
  .tool-card__cta {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-primary);
  ```

- [ ] **Step 2: Add D4 – `.seo-cols__wide` CSS rule in rechner.css**

  After the line `@media (max-width: 767px) { .seo-text-block .seo-cols { grid-template-columns: 1fr; } }` (currently ~line 484), add:

  ```css
  .seo-cols__wide { grid-column: 1 / -1; }
  ```

- [ ] **Step 3: Fix D3 – Remove min-height from .plan-desc in app.css**

  Current (app.css line 1979):
  ```css
  .plan-desc { font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem; line-height: 1.5; min-height: 4.5rem; }
  ```

  Change to:
  ```css
  .plan-desc { font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem; line-height: 1.5; }
  ```

- [ ] **Step 4: Add D2 – Free-link style in app.css**

  After the `.billing-toggle-wrap .save-badge { ... }` rule (~line 1968), add:

  ```css
  .preise-hero__free-link { display: inline-block; margin-top: 1rem; color: rgba(255,255,255,.65); font-size: 0.875rem; text-decoration: none; }
  .preise-hero__free-link:hover { color: #fff; text-decoration: underline; }
  ```

- [ ] **Step 5: Add D5 – AGB-Consent-Modal CSS classes in app.css**

  After the `.preise-hero__free-link` rules (added above), add:

  ```css
  /* AGB-Consent-Modal */
  .modal-consent .modal-dialog { max-width: 440px; }
  .modal-consent .modal-content { border-radius: 14px; overflow: hidden; }
  .modal-consent .modal-header { background: linear-gradient(135deg,#1e3a8a,#2563eb); padding: 1.5rem 1.75rem 1.25rem; }
  .modal-consent__step { color: #93c5fd; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.3rem; }
  .modal-consent .modal-title { color: #fff; font-size: 1.15rem; }
  .modal-consent .btn-close { opacity: 0.7; }
  .modal-consent .modal-body { padding: 1.75rem; }
  .modal-consent__intro { color: #475569; font-size: 0.9rem; line-height: 1.6; }
  .modal-consent__box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 0.875rem; }
  .modal-consent__box--last { margin-bottom: 1.5rem; }
  .modal-consent__box .form-check { margin: 0; }
  .modal-consent__box .form-check-input { width: 1.1em; height: 1.1em; margin-top: 0.15em; cursor: pointer; }
  .modal-consent__box .form-check-label { font-size: 0.875rem; line-height: 1.55; color: #334155; cursor: pointer; padding-left: 0.35rem; }
  .modal-consent__box a { color: #2563eb; font-weight: 500; }
  .modal-consent__submit { padding: 0.75rem; font-size: 1rem; border-radius: 8px; letter-spacing: 0.01em; }
  .modal-consent__security { margin-top: 0.875rem; font-size: 0.8rem; color: #94a3b8; }
  ```

- [ ] **Step 6: Bump SW version in sw.js**

  Change `fordify-staging-v149` → `fordify-staging-v150` (leave `fordify-v190` for production untouched).

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/css/rechner.css frontend/css/app.css frontend/sw.js
  git commit -m "style(landing): P2-CSS – Tool-card primary colors, modal-consent classes, plan-desc min-height entfernt"
  git push origin staging
  ```

---

### Task 2: index.html P2 Changes

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/sw.js`

**What and why:**
- D4: Replace `style="grid-column: 1 / -1"` inline style with the new `.seo-cols__wide` class (CSS extracted in Task 1)
- C1: First SEO H2 "Forderungsaufstellung nach § 367 BGB" is nearly identical to new H1 — differentiate it
- C2: First SEO paragraph has 5 dense sentences — trim to 3 focused ones
- C3: Prefooter title "Jetzt fordify nutzen" is generic — make it action-oriented
- C4: No price context after hero CTA — add short price hint line
- C5: Footer brand-desc repeats "Von Anwälten entwickelt und geprüft" which already appears in hero badge and footer-right — remove from brand-desc only

- [ ] **Step 1: Fix D4 – Replace inline style with class**

  Current (index.html ~line 280):
  ```html
  <div style="grid-column: 1 / -1">
  ```

  Change to:
  ```html
  <div class="seo-cols__wide">
  ```

- [ ] **Step 2: Fix C1 – Differentiate first SEO H2**

  Current (index.html ~line 281):
  ```html
  <h2>Forderungsaufstellung nach § 367 BGB</h2>
  ```

  Change to:
  ```html
  <h2>§ 367 BGB: Verrechnungsreihenfolge bei Teilzahlungen</h2>
  ```

- [ ] **Step 3: Fix C2 – Trim first SEO paragraph to 3 sentences**

  Current (index.html ~line 282):
  ```html
  <p>§ 367 BGB schreibt die Verrechnungsreihenfolge bei Teilzahlungen zwingend vor: zuerst werden Kosten verrechnet, dann Zinsen, zuletzt die Hauptforderung. fordify berechnet diese Verrechnung vollautomatisch – inklusive tagesgenauer Verzugszinsen nach § 288 BGB, RVG-Gebühren und Gerichtskosten. Das Ergebnis ist eine druckfertige Forderungsaufstellung, die direkt als PDF exportiert werden kann. Mehrere Hauptforderungen, Zinsmethoden (act/365 und 30/360) sowie die InsO-Kappung nach § 174 InsO werden unterstützt. Alle Berechnungen laufen ausschließlich im Browser – kein Server, keine Cloud, DSGVO-konform.</p>
  ```

  Change to:
  ```html
  <p>§ 367 BGB schreibt die Verrechnungsreihenfolge bei Teilzahlungen zwingend vor: zuerst werden Kosten verrechnet, dann Zinsen, zuletzt die Hauptforderung. fordify berechnet diese Verrechnung vollautomatisch – inklusive tagesgenauer Verzugszinsen nach § 288 BGB, RVG-Gebühren und Gerichtskosten. Mehrere Hauptforderungen, Zinsmethoden (act/365 und 30/360) sowie die InsO-Kappung nach § 174 InsO werden unterstützt.</p>
  ```

- [ ] **Step 4: Fix C4 – Add price hint after hero CTA**

  Current (index.html ~line 153–155):
  ```html
  <a href="/forderungsaufstellung" class="btn btn-hero-cta">
    Jetzt kostenlos starten
  </a>
  ```

  Change to:
  ```html
  <a href="/forderungsaufstellung" class="btn btn-hero-cta">
    Jetzt kostenlos starten
  </a>
  <p class="hero-price-hint">Kostenlos unbegrenzt nutzbar. Pro ab 19&nbsp;&#8364;/Monat.</p>
  ```

  Also add the CSS rule for `.hero-price-hint` in `frontend/css/rechner.css`, after the `.btn-hero-cta:focus-visible` rule. Find the btn-hero-cta section and add:
  ```css
  .hero-price-hint { font-size: 0.8rem; color: rgba(255,255,255,.6); margin-top: 0.75rem; margin-bottom: 0; }
  ```

- [ ] **Step 5: Fix C3 – Update prefooter title in index.html**

  Current (index.html ~line 307):
  ```html
  <div class="prefooter-cta__title">Jetzt fordify nutzen</div>
  ```

  Change to:
  ```html
  <div class="prefooter-cta__title">Kostenlos loslegen – kein Abo nötig</div>
  ```

- [ ] **Step 6: Fix C5 – Remove duplicate from footer brand-desc in index.html**

  Current (index.html ~line 318):
  ```html
  <div class="fordify-footer__brand-desc">Professionelle Forderungsberechnungen für Anwaltskanzleien und Kanzleiteams. Von Anwälten entwickelt und geprüft.</div>
  ```

  Change to:
  ```html
  <div class="fordify-footer__brand-desc">Professionelle Forderungsberechnungen für Anwaltskanzleien und Kanzleiteams.</div>
  ```

- [ ] **Step 7: Bump SW version in sw.js**

  Change `fordify-staging-v150` → `fordify-staging-v151`

- [ ] **Step 8: Commit**

  ```bash
  git add frontend/index.html frontend/css/rechner.css frontend/sw.js
  git commit -m "content(landing): P2-index – SEO-H2, Paragraph kürzen, Prefooter-CTA, Preishinweis, Footer-Desc"
  git push origin staging
  ```

---

### Task 3: preise.html P2 Changes

**Files:**
- Modify: `frontend/preise.html`
- Modify: `frontend/sw.js`

**What and why:**
- D2: Pricing hero has no secondary CTA for visitors who want to start for free without subscribing
- D5: AGB-Consent-Modal uses ~20 inline styles (CSS classes were added in Task 1 — now swap HTML to use them)
- C3: Prefooter title same "Jetzt fordify nutzen" issue as index.html
- C5: Same footer brand-desc duplicate as index.html
- C6: Business plan-desc "für anspruchsvolle Kanzleien" is vague — replace with concrete benefit-focused text

- [ ] **Step 1: Fix D2 – Add free CTA in preise.html hero**

  Current (preise.html ~line 120–127):
  ```html
  <div class="billing-toggle-wrap">
    <span>Monatlich</span>
    <div class="form-check form-switch mb-0">
      <label class="visually-hidden" for="billing-toggle">Jährliche Abrechnung aktivieren</label>
      <input class="form-check-input" type="checkbox" id="billing-toggle" style="width:2.5rem;height:1.25rem;cursor:pointer">
    </div>
    <span>Jährlich <span class="save-badge">2 Monate gratis</span></span>
  </div>
  ```

  Change to:
  ```html
  <div class="billing-toggle-wrap">
    <span>Monatlich</span>
    <div class="form-check form-switch mb-0">
      <label class="visually-hidden" for="billing-toggle">Jährliche Abrechnung aktivieren</label>
      <input class="form-check-input" type="checkbox" id="billing-toggle" style="width:2.5rem;height:1.25rem;cursor:pointer">
    </div>
    <span>Jährlich <span class="save-badge">2 Monate gratis</span></span>
  </div>
  <a href="/forderungsaufstellung" class="preise-hero__free-link">Oder jetzt kostenlos starten – ohne Anmeldung &#8594;</a>
  ```

- [ ] **Step 2: Fix D5 – Swap inline modal styles for CSS classes in preise.html**

  The modal is `<div class="modal fade" id="agbConsentModal" ...>` (~line 340). Replace the entire modal block (lines 340–381) with:

  ```html
  <!-- AGB-Zustimmungs-Modal (erscheint vor Paddle-Checkout) -->
  <div class="modal fade modal-consent" id="agbConsentModal" tabindex="-1" aria-labelledby="agbConsentLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header border-0">
          <div>
            <div class="modal-consent__step">Schritt 1 von 2</div>
            <h5 class="modal-title fw-bold mb-0" id="agbConsentLabel">Bestellung abschließen</h5>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Schließen"></button>
        </div>
        <div class="modal-body">
          <p class="modal-consent__intro mb-4">Bitte bestätige vor dem Checkout, dass du unsere Geschäftsbedingungen akzeptierst:</p>

          <div class="modal-consent__box">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="agbConsentCheck">
              <label class="form-check-label" for="agbConsentCheck">
                Ich habe die <a href="/agb" target="_blank" rel="noopener">Allgemeinen Geschäftsbedingungen von fordify</a> gelesen und akzeptiere sie. Ich handle als Unternehmer im Sinne des § 14 BGB.
              </label>
            </div>
          </div>

          <div class="modal-consent__box modal-consent__box--last">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="avvConsentCheck">
              <label class="form-check-label" for="avvConsentCheck">
                Ich schließe den <a href="/avv" target="_blank" rel="noopener">Auftragsverarbeitungsvertrag (AVV)</a> mit fordify gemäß Art. 28 DSGVO ab.
              </label>
            </div>
          </div>

          <button class="btn btn-primary w-100 fw-semibold modal-consent__submit" id="agbConsentBtn" onclick="confirmCheckout()" disabled>
            Weiter zum Checkout &#8594;
          </button>
          <p class="text-center mb-0 modal-consent__security">
            &#128274; Die Zahlung erfolgt sicher über Paddle
          </p>
        </div>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 3: Fix C3 – Update prefooter title in preise.html**

  Current (preise.html ~line 287):
  ```html
  <div class="prefooter-cta__title">Jetzt fordify nutzen</div>
  ```

  Change to:
  ```html
  <div class="prefooter-cta__title">Kostenlos loslegen – kein Abo nötig</div>
  ```

- [ ] **Step 4: Fix C5 – Remove duplicate from footer brand-desc in preise.html**

  Current (preise.html ~line 298):
  ```html
  <div class="fordify-footer__brand-desc">Professionelle Forderungsberechnungen für Anwaltskanzleien und Kanzleiteams. Von Anwälten entwickelt und geprüft.</div>
  ```

  Change to:
  ```html
  <div class="fordify-footer__brand-desc">Professionelle Forderungsberechnungen für Anwaltskanzleien und Kanzleiteams.</div>
  ```

- [ ] **Step 5: Fix C6 – Update Business plan-desc in preise.html**

  Current (preise.html ~line 185):
  ```html
  <div class="plan-desc">Für anspruchsvolle Kanzleien: Mandanten-Adressbuch, CSV-Import für Massendaten, kein fordify-Branding und Prioritäts-Support.</div>
  ```

  Change to:
  ```html
  <div class="plan-desc">Für Teams und größere Kanzleien: Mandanten-Adressbuch, CSV-Import für Massendaten und kein fordify-Branding im PDF.</div>
  ```

- [ ] **Step 6: Bump SW version in sw.js**

  Change `fordify-staging-v151` → `fordify-staging-v152`

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/preise.html frontend/sw.js
  git commit -m "content(preise): P2-preise – Free-CTA im Hero, Modal-inline-Styles extrahiert, Prefooter, Business-Desc"
  git push origin staging
  ```

---

### Task 4: Documentation Update

**Files:**
- Modify: `CLAUDE.md` — update SW version to staging-v152
- Modify: `docs/ROADMAP.md` — mark P2 as ✅ with date 2026-05-05

- [ ] **Step 1: Update CLAUDE.md SW version**

  In `CLAUDE.md`, find the line referencing the sw.js versions:
  ```
  ├── sw.js                   ← Service Worker (aktuell fordify-v190 / staging-v145)
  ```
  (Note: this line may show a different staging version — update whatever number is there to `staging-v152`)

  Change to:
  ```
  ├── sw.js                   ← Service Worker (aktuell fordify-v190 / staging-v152)
  ```

- [ ] **Step 2: Update ROADMAP.md**

  Find the Phase 7 section. Mark Phase 7 P2 (Landing Page P2 Design & Content Fixes) as ✅ 2026-05-05. The exact wording in the ROADMAP may differ — update the relevant entry to show completion.

- [ ] **Step 3: Move P1 plan to done/**

  ```bash
  mv docs/superpowers/plans/2026-05-05-landing-page-p1-fixes.md docs/superpowers/plans/done/
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add CLAUDE.md docs/ROADMAP.md docs/superpowers/plans/done/2026-05-05-landing-page-p1-fixes.md docs/superpowers/plans/2026-05-05-landing-page-p2-fixes.md
  git commit -m "docs: P2 Landing Page abgeschlossen – CLAUDE.md SW-Version, ROADMAP aktualisiert, P1-Plan archiviert"
  git push origin staging
  ```
