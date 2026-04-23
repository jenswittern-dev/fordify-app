(function () {
  'use strict';

  document.getElementById('form-tilgung').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  document.getElementById('tilgung-schuld').addEventListener('input', aktualisiereMindestrate);
  document.getElementById('tilgung-zins').addEventListener('input', aktualisiereMindestrate);

  function parseBetrag(str) {
    return parseFloat(String(str).replace(/\./g, '').replace(',', '.'));
  }

  function formatEUR(val) {
    const parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',') + ' €';
  }

  function aktualisiereMindestrate() {
    const schuld = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zins   = parseBetrag(document.getElementById('tilgung-zins').value);
    const el     = document.getElementById('tilgung-mindestrate-hint');
    if (!el) return;
    if (isNaN(schuld) || isNaN(zins) || schuld <= 0 || zins <= 0) {
      el.textContent = '';
      return;
    }
    const mindest = schuld * zins / 12 / 100;
    el.textContent = 'Mindestrate (Zinsdeckung): ' + formatEUR(mindest) + ' – Ihre Rate muss höher sein.';
  }

  function berechne() {
    const ergebnisEl = document.getElementById('tilgung-ergebnis');
    const schuld  = parseBetrag(document.getElementById('tilgung-schuld').value);
    const zinsPA  = parseBetrag(document.getElementById('tilgung-zins').value);
    const rate    = parseBetrag(document.getElementById('tilgung-rate').value);

    if (isNaN(schuld) || schuld <= 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Bitte einen gültigen Schuldbetrag eingeben.</div>';
      return;
    }
    if (isNaN(zinsPA) || zinsPA < 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Bitte einen gültigen Zinssatz eingeben (≥ 0 %).</div>';
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Bitte eine gültige monatliche Rate eingeben.</div>';
      return;
    }

    const pm = zinsPA / 12 / 100;
    const mindestrate = schuld * pm;
    if (pm > 0 && rate <= mindestrate) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Die monatliche Rate (' + formatEUR(rate) + ') deckt nicht einmal die Zinsen (' + formatEUR(mindestrate) + '). Bitte erhöhen Sie die Rate.</div>';
      return;
    }

    const plan = [];
    let rest = schuld;
    let gesamtZinsen = 0;
    let gesamtZahlungen = 0;
    const MAX_MONATE = 600;

    for (let monat = 1; monat <= MAX_MONATE; monat++) {
      const zinsen  = Math.round(rest * pm * 100) / 100;
      let aktRate   = rate;
      let tilgung   = Math.round((aktRate - zinsen) * 100) / 100;
      const restAlt = rest;

      if (rest - tilgung <= 0) {
        tilgung  = rest;
        aktRate  = zinsen + tilgung;
        rest     = 0;
      } else {
        rest = Math.round((rest - tilgung) * 100) / 100;
      }

      gesamtZinsen    += zinsen;
      gesamtZahlungen += aktRate;

      plan.push({ monat, schuld: restAlt, zinsen, tilgung, rate: aktRate, rest });

      if (rest <= 0) break;
    }

    if (rest > 0) {
      ergebnisEl.innerHTML = '<div class="alert alert-warning">Der Kredit ist innerhalb von 50 Jahren nicht getilgt. Bitte erhöhen Sie die Rate.</div>';
      return;
    }

    const laufzeitMonate = plan.length;
    const jahre  = Math.floor(laufzeitMonate / 12);
    const monate = laufzeitMonate % 12;
    const laufzeitStr = jahre > 0
      ? jahre + ' Jahr' + (jahre !== 1 ? 'e' : '') + (monate > 0 ? ' und ' + monate + ' Monat' + (monate !== 1 ? 'e' : '') : '')
      : monate + ' Monat' + (monate !== 1 ? 'e' : '');

    let rows = '';
    for (const p of plan) {
      rows += '<tr>' +
        '<td class="text-end">' + p.monat + '</td>' +
        '<td class="text-end font-mono">' + formatEUR(p.schuld) + '</td>' +
        '<td class="text-end font-mono">' + formatEUR(p.zinsen) + '</td>' +
        '<td class="text-end font-mono">' + formatEUR(p.tilgung) + '</td>' +
        '<td class="text-end font-mono">' + formatEUR(p.rate) + '</td>' +
        '<td class="text-end font-mono">' + (p.rest <= 0 ? '0,00 €' : formatEUR(p.rest)) + '</td>' +
        '</tr>';
    }

    ergebnisEl.innerHTML =
      '<div class="rechner-result">' +
        '<div class="rechner-result__header">' +
          '<div class="rechner-result__header-title">Tilgungsplan · ' + laufzeitStr + '</div>' +
          '<div class="rechner-result__total-badge">' + formatEUR(gesamtZahlungen) + '</div>' +
        '</div>' +
        '<div class="rechner-result__summary mb-3 px-3 pt-3">' +
          '<div class="row g-2">' +
            '<div class="col-6 col-md-4"><div class="p-2 bg-light rounded text-center"><div class="fw-bold font-mono">' + formatEUR(schuld) + '</div><div class="text-muted small">Schuldbetrag</div></div></div>' +
            '<div class="col-6 col-md-4"><div class="p-2 bg-light rounded text-center"><div class="fw-bold font-mono">' + formatEUR(gesamtZinsen) + '</div><div class="text-muted small">Zinsen gesamt</div></div></div>' +
            '<div class="col-12 col-md-4"><div class="p-2 bg-light rounded text-center"><div class="fw-bold">' + laufzeitStr + '</div><div class="text-muted small">Laufzeit</div></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="rechner-result__body" style="max-height:400px;overflow-y:auto;">' +
          '<table class="table table-sm table-striped mb-0">' +
            '<thead class="sticky-top bg-white">' +
              '<tr>' +
                '<th class="text-end">Monat</th>' +
                '<th class="text-end">Schuld</th>' +
                '<th class="text-end">Zinsen</th>' +
                '<th class="text-end">Tilgung</th>' +
                '<th class="text-end">Rate</th>' +
                '<th class="text-end">Restschuld</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="rechner-result__footer">' +
          '<span class="rechner-result__footer-label">Gesamtzahlungen</span>' +
          '<span class="rechner-result__footer-val">' + formatEUR(gesamtZahlungen) + '</span>' +
        '</div>' +
      '</div>' +
      '<a href="/forderungsaufstellung" class="rechner-cta-box mt-3">' +
        '<div>' +
          '<div class="rechner-cta-box__title">Vollständige Forderungsaufstellung nach § 367 BGB →</div>' +
          '<div class="rechner-cta-box__sub">Zinsen, RVG-Gebühren, Zahlungsverrechnung – alles in einem professionellen Dokument.</div>' +
        '</div>' +
      '</a>';
  }
})();
