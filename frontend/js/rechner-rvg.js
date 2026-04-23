(function () {
  'use strict';

  document.getElementById('form-rvg').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  const VV_MAP = {
    'aussergerichtlich': ['2300', '7002'],
    'mahnverfahren':     ['3309', '7002'],
    'klage':             ['3100', '7002'],
  };

  function berechne() {
    const streitwert = document.getElementById('rvg-streitwert').value.replace(',', '.');
    const verfahren  = document.getElementById('rvg-verfahren').value;
    const ustSatz    = parseFloat(document.getElementById('rvg-ust').value) / 100;
    const vvNummern  = VV_MAP[verfahren] || ['2300', '7002'];
    const ergebnisEl = document.getElementById('rvg-ergebnis');

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
      const { positionen, netto } = berechneRVGGesamt(
        streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN
      );
      const nettoD  = new Decimal(netto);
      const ustD    = nettoD.times(ustSatz).toDecimalPlaces(2);
      const gesamtD = nettoD.plus(ustD);
      ergebnisEl.innerHTML = renderErgebnis(positionen, nettoD, ustD, gesamtD, Math.round(ustSatz * 100));
    } catch (err) {
      const errDiv = document.createElement('div');
      errDiv.className = 'alert alert-danger';
      errDiv.textContent = err.message;
      ergebnisEl.replaceChildren(errDiv);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderErgebnis(positionen, netto, ust, gesamt, ustProzent) {
    let rows = '';
    for (const p of positionen) {
      rows += `<tr>
        <td>VV ${escapeHtml(p.vvNummer)}</td>
        <td>${escapeHtml(p.beschreibung)}</td>
        <td class="text-end">${p.faktor !== null ? p.faktor.toFixed(1) : '–'}</td>
        <td class="text-end font-mono">${p.gebuehrGesamt.toFixed(2)} €</td>
      </tr>`;
    }
    const gesamtStr = gesamt.toFixed(2);
    return `
      <div class="rechner-result">
        <div class="rechner-result__header">
          <div class="rechner-result__header-title">Ergebnis · Anwaltskosten</div>
          <div class="rechner-result__total-badge">${gesamtStr} €</div>
        </div>
        <div class="rechner-result__body">
          <table class="table table-sm table-striped mb-0">
            <thead>
              <tr><th>VV-Nr.</th><th>Position</th><th class="text-end">Faktor</th><th class="text-end">Betrag</th></tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr class="rechner-result__subtotal-row"><td colspan="3">Netto</td><td class="text-end font-mono">${netto.toFixed(2)} €</td></tr>
              <tr class="rechner-result__subtotal-row"><td colspan="3">Umsatzsteuer (${ustProzent} %)</td><td class="text-end font-mono">${ust.toFixed(2)} €</td></tr>
            </tfoot>
          </table>
        </div>
        <div class="rechner-result__footer">
          <span class="rechner-result__footer-label">Anwaltskosten gesamt</span>
          <span class="rechner-result__footer-val">${gesamtStr} €</span>
        </div>
      </div>`;
  }

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(el) {
    new bootstrap.Tooltip(el);
  });
})();
