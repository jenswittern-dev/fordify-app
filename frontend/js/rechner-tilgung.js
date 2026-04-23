(function () {
  'use strict';

  const MAX_MONATE = 600;
  let aktiverModus = 'plan'; // 'plan' | 'rate' | 'betrag'

  function parseBetrag(str) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }

  function formatEUR(d) {
    return d.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  }

  function formatNum(d) {
    return d.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // ── Modus-Switching ────────────────────────────────────────────

  function setModus(modus) {
    aktiverModus = modus;

    document.querySelectorAll('.tilgung-tab').forEach(btn => {
      const isActive = btn.dataset.mode === modus;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const fieldSchuld   = document.getElementById('field-schuld');
    const fieldRate     = document.getElementById('field-rate');
    const fieldLaufzeit = document.getElementById('field-laufzeit');
    const label         = document.getElementById('tilgung-submit-label');
    const hint          = document.getElementById('tilgung-mindestrate-hint');

    if (modus === 'plan') {
      fieldSchuld.classList.remove('d-none');
      fieldRate.classList.remove('d-none');
      fieldLaufzeit.classList.add('d-none');
      label.textContent = 'Tilgungsplan berechnen';
      document.getElementById('tilgung-schuld').required = true;
      document.getElementById('tilgung-rate').required = true;
      document.getElementById('tilgung-laufzeit').required = false;
      aktualisiereMindestrate();
    } else if (modus === 'rate') {
      fieldSchuld.classList.remove('d-none');
      fieldRate.classList.add('d-none');
      fieldLaufzeit.classList.remove('d-none');
      label.textContent = 'Monatliche Rate berechnen';
      document.getElementById('tilgung-schuld').required = true;
      document.getElementById('tilgung-rate').required = false;
      document.getElementById('tilgung-laufzeit').required = true;
      hint.textContent = '';
    } else {
      fieldSchuld.classList.add('d-none');
      fieldRate.classList.remove('d-none');
      fieldLaufzeit.classList.remove('d-none');
      label.textContent = 'Schuldbetrag berechnen';
      document.getElementById('tilgung-schuld').required = false;
      document.getElementById('tilgung-rate').required = true;
      document.getElementById('tilgung-laufzeit').required = true;
      hint.textContent = '';
    }

    document.getElementById('tilgung-ergebnis').innerHTML = '';
  }

  // ── Mindestrate-Hinweis (nur Modus "plan") ────────────────────

  function aktualisiereMindestrate() {
    if (aktiverModus !== 'plan') return;
    const schuld = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins   = parseBetrag(document.getElementById('tilgung-zins').value);
    const hint   = document.getElementById('tilgung-mindestrate-hint');
    if (schuld > 0 && zins > 0) {
      const mindest = schuld * (zins / 100 / 12);
      hint.textContent = 'Mindestrate (nur Zinsen): ' + formatNum(mindest) + ' €/Monat';
    } else {
      hint.textContent = '';
    }
  }

  // ── Tilgungsplan-HTML ──────────────────────────────────────────

  function tilgungsplanHTML(schuld, zins, rate, berechneterWertLabel, berechneterWert) {
    const i_m = zins / 100 / 12;
    let rest = schuld;
    let rows = '';
    let gesamtZahlungen = 0;
    let monat = 0;

    while (rest > 0.005 && monat < MAX_MONATE) {
      monat++;
      const zinsen = rest * i_m;
      let tilgung = rate - zinsen;
      let aktRate = rate;
      if (tilgung >= rest) {
        tilgung = rest;
        aktRate = zinsen + tilgung;
      }
      rest -= tilgung;
      if (rest < 0.005) rest = 0;
      gesamtZahlungen += aktRate;

      const fmtRest = rest < 0.005 ? '0,00 €' : formatEUR(rest);
      rows += `<tr>
        <td class="text-end">${monat}</td>
        <td class="text-end font-mono">${formatEUR(rest + tilgung)}</td>
        <td class="text-end font-mono">${formatEUR(zinsen)}</td>
        <td class="text-end font-mono">${formatEUR(tilgung)}</td>
        <td class="text-end font-mono">${formatEUR(aktRate)}</td>
        <td class="text-end font-mono">${fmtRest}</td>
      </tr>`;
    }

    const gesamtZinsen = gesamtZahlungen - schuld;
    const laufzeitStr = monat >= MAX_MONATE
      ? `> ${MAX_MONATE} Monate`
      : monat === 1 ? '1 Monat' : monat + ' Monate';

    const berechneterBlock = berechneterWertLabel
      ? `<div class="col-12 col-md-4">
           <div class="p-2 rounded text-center" style="background:#eff6ff;border:1px solid #bfdbfe">
             <div class="fw-bold font-mono" style="color:#1e3a8a">${berechneterWert}</div>
             <div class="text-muted small">${berechneterWertLabel}</div>
           </div>
         </div>`
      : '';

    const statsColClass = berechneterWertLabel ? 'col-6 col-md-4' : 'col-6 col-md-6';

    return `
      <div class="rechner-result">
        <div class="rechner-result__header">
          <div class="row g-2">
            ${berechneterBlock}
            <div class="${statsColClass}">
              <div class="p-2 bg-light rounded text-center">
                <div class="fw-bold font-mono">${formatEUR(gesamtZinsen)}</div>
                <div class="text-muted small">Zinsen gesamt</div>
              </div>
            </div>
            <div class="${statsColClass}">
              <div class="p-2 bg-light rounded text-center">
                <div class="fw-bold">${laufzeitStr}</div>
                <div class="text-muted small">Laufzeit</div>
              </div>
            </div>
          </div>
        </div>
        <div class="rechner-result__body" style="max-height:400px;overflow-y:auto;padding-top:0;">
          <table class="table table-sm table-striped mb-0">
            <thead style="position:sticky;top:0;z-index:2;background:#fff">
              <tr>
                <th class="text-end">Monat</th>
                <th class="text-end">Schuld</th>
                <th class="text-end">Zinsen</th>
                <th class="text-end">Tilgung</th>
                <th class="text-end">Rate</th>
                <th class="text-end">Restschuld</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="rechner-result__footer">
          <span class="rechner-result__footer-label">Gesamtzahlungen</span>
          <span class="rechner-result__footer-val">${formatEUR(gesamtZahlungen)}</span>
        </div>
      </div>`;
  }

  // ── Berechnungen ───────────────────────────────────────────────

  function berechne() {
    const schuld = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins   = parseBetrag(document.getElementById('tilgung-zins').value);
    const rate   = parseBetrag(document.getElementById('tilgung-rate').value);
    const ergebnis = document.getElementById('tilgung-ergebnis');

    if (schuld <= 0 || zins < 0 || rate <= 0) {
      ergebnis.innerHTML = '<div class="alert alert-warning">Bitte alle Felder korrekt ausfüllen.</div>';
      return;
    }
    const mindest = schuld * (zins / 100 / 12);
    if (rate <= mindest) {
      ergebnis.innerHTML = `<div class="alert alert-danger">Die Rate muss höher als die monatlichen Zinsen (${formatNum(mindest)} €) sein.</div>`;
      return;
    }
    ergebnis.innerHTML = tilgungsplanHTML(schuld, zins, rate, null, null);
  }

  function berechneRate() {
    const schuld   = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins     = parseBetrag(document.getElementById('tilgung-zins').value);
    const laufzeit = parseInt(document.getElementById('tilgung-laufzeit').value.replace(',', '.'), 10);
    const ergebnis = document.getElementById('tilgung-ergebnis');

    if (schuld <= 0 || zins < 0 || !(laufzeit > 0)) {
      ergebnis.innerHTML = '<div class="alert alert-warning">Bitte alle Felder korrekt ausfüllen.</div>';
      return;
    }
    const i_m = zins / 100 / 12;
    let rate;
    if (i_m === 0) {
      rate = schuld / laufzeit;
    } else {
      const q = Math.pow(1 + i_m, laufzeit);
      rate = schuld * (i_m * q) / (q - 1);
    }
    ergebnis.innerHTML = tilgungsplanHTML(schuld, zins, rate, 'Monatliche Rate', formatEUR(rate));
  }

  function berechneBetrag() {
    const rate     = parseBetrag(document.getElementById('tilgung-rate').value);
    const zins     = parseBetrag(document.getElementById('tilgung-zins').value);
    const laufzeit = parseInt(document.getElementById('tilgung-laufzeit').value.replace(',', '.'), 10);
    const ergebnis = document.getElementById('tilgung-ergebnis');

    if (rate <= 0 || zins < 0 || !(laufzeit > 0)) {
      ergebnis.innerHTML = '<div class="alert alert-warning">Bitte alle Felder korrekt ausfüllen.</div>';
      return;
    }
    const i_m = zins / 100 / 12;
    let schuld;
    if (i_m === 0) {
      schuld = rate * laufzeit;
    } else {
      const q = Math.pow(1 + i_m, laufzeit);
      schuld = rate * (q - 1) / (i_m * q);
    }
    ergebnis.innerHTML = tilgungsplanHTML(schuld, zins, rate, 'Schuldbetrag', formatEUR(schuld));
  }

  // ── Event-Listener ─────────────────────────────────────────────

  document.querySelectorAll('.tilgung-tab').forEach(btn => {
    btn.addEventListener('click', () => setModus(btn.dataset.mode));
  });

  document.getElementById('tilgung-schuld').addEventListener('input', aktualisiereMindestrate);
  document.getElementById('tilgung-zins').addEventListener('input', aktualisiereMindestrate);

  document.getElementById('form-tilgung').addEventListener('submit', e => {
    e.preventDefault();
    if (aktiverModus === 'plan')        berechne();
    else if (aktiverModus === 'rate')   berechneRate();
    else                                berechneBetrag();
  });

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(el) {
    new bootstrap.Tooltip(el);
  });
})();
