(function () {
  'use strict';

  document.getElementById('form-pkh').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  const VV_MAP = {
    'aussergerichtlich': ['2300', '7002'],
    'mahnverfahren':     ['3309', '7002'],
    'klage':             ['3100', '7002'],
  };

  function berechne() {
    const streitwert = document.getElementById('pkh-streitwert').value.replace(/\./g, '').replace(',', '.');
    const verfahren  = document.getElementById('pkh-verfahren').value;
    const ustSatz    = parseFloat(document.getElementById('pkh-ust').value) / 100;
    const vvNummern  = VV_MAP[verfahren] || ['2300', '7002'];
    const ergebnisEl = document.getElementById('pkh-ergebnis');

    if (!streitwert || streitwert === '.') {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte einen gültigen Gegenstandswert eingeben.';
      ergebnisEl.replaceChildren(d);
      return;
    }
    let streitwertD;
    try { streitwertD = new Decimal(streitwert); } catch (e) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Ungültiger Gegenstandswert. Bitte eine Zahl eingeben (z. B. 10000).';
      ergebnisEl.replaceChildren(d);
      return;
    }
    if (streitwertD.lte(0)) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte einen positiven Gegenstandswert eingeben.';
      ergebnisEl.replaceChildren(d);
      return;
    }

    try {
      const pkh    = berechneRVGGesamtPKH(streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN);
      const pkhUst = new Decimal(pkh.netto).times(ustSatz).toDecimalPlaces(2);
      const pkhGes = new Decimal(pkh.netto).plus(pkhUst);

      const normal    = berechneRVGGesamt(streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN);
      const normalUst = new Decimal(normal.netto).times(ustSatz).toDecimalPlaces(2);
      const normalGes = new Decimal(normal.netto).plus(normalUst);

      ergebnisEl.innerHTML = renderErgebnis(pkh.positionen, pkh.netto, pkhUst, pkhGes, Math.round(ustSatz * 100), normal.positionen, normalGes);
    } catch (err) {
      const errDiv = document.createElement('div');
      errDiv.className = 'alert alert-danger';
      errDiv.textContent = err.message;
      ergebnisEl.replaceChildren(errDiv);
    }
  }

  function renderErgebnis(positionen, netto, ust, gesamt, ustProzent, vergleichsPositionen, vergleichsGesamt) {
    let rows = '';
    for (let i = 0; i < positionen.length; i++) {
      const p = positionen[i];
      const vgl = vergleichsPositionen ? vergleichsPositionen[i] : null;
      rows += `<tr>
        <td>VV ${escHtml(p.vvNummer)}</td>
        <td>${escHtml(p.beschreibung)}</td>
        <td class="text-end">${p.faktor !== null ? p.faktor.toFixed(1) : '&#8211;'}</td>
        <td class="text-end font-mono">${p.gebuehrGesamt.toFixed(2)} &#8364;</td>
        ${vgl ? `<td class="text-end font-mono text-muted small">${vgl.gebuehrGesamt.toFixed(2)} &#8364;</td>` : ''}
      </tr>`;
    }
    const gesamtStr = gesamt.toFixed(2);
    return `
      <div class="rechner-result">
        <div class="rechner-result__header">
          <div class="rechner-result__header-title">Ergebnis &middot; PKH-Verg&uuml;tung (&#167; 49 RVG)</div>
          <div class="rechner-result__total-badge">${gesamtStr} &#8364;</div>
        </div>
        <div class="rechner-result__body">
          <table class="table table-sm table-striped mb-0">
            <thead>
              <tr><th>VV-Nr.</th><th>Position</th><th class="text-end">Faktor</th><th class="text-end">Betrag</th><th class="text-end text-muted small">Normal (&#167; 2 RVG)</th></tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr class="rechner-result__subtotal-row"><td colspan="3">Netto</td><td class="text-end font-mono">${netto.toFixed(2)} &#8364;</td><td></td></tr>
              <tr class="rechner-result__subtotal-row"><td colspan="3">Umsatzsteuer (${ustProzent} %)</td><td class="text-end font-mono">${ust.toFixed(2)} &#8364;</td><td></td></tr>
            </tfoot>
          </table>
        </div>
        <div class="rechner-result__footer">
          <span class="rechner-result__footer-label">PKH-Verg&uuml;tung gesamt</span>
          <span class="rechner-result__footer-val">${gesamtStr} &#8364;</span>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top text-muted small">
          <span>Zum Vergleich: normale RVG-Verg&uuml;tung (&#167; 2 RVG)</span>
          <span class="font-mono">${vergleichsGesamt.toFixed(2)} &#8364;</span>
        </div>
        <p class="text-muted small mt-3 mb-0">Verg&uuml;tung aus der Staatskasse nach &#167; 49 RVG. Gegenstandswert &gt; 4.000 &#8364; wird anteilig auf 75&nbsp;% des &uuml;bersteigenden Betrags begrenzt. Kein Ersatz f&uuml;r anwaltliche Pr&uuml;fung.</p>
      </div>`;
  }

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(el) {
    new bootstrap.Tooltip(el);
  });
})();
