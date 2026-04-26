(function () {
  'use strict';

  let pkhModus = false;

  window.setPKHModus = function (active) {
    pkhModus = active;
    document.getElementById('btn-rvg-normal').classList.toggle('active', !active);
    document.getElementById('btn-rvg-pkh').classList.toggle('active', active);
    const sw = document.getElementById('rvg-streitwert');
    if (sw && sw.value) {
      document.getElementById('form-rvg').dispatchEvent(new Event('submit'));
    }
  };

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
    const toggleEl   = document.getElementById('rvg-modus-toggle');

    if (!streitwert || streitwert === '.') {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte einen gültigen Gegenstandswert eingeben.';
      ergebnisEl.replaceChildren(d);
      toggleEl.classList.add('d-none');
      return;
    }
    let streitwertD;
    try { streitwertD = new Decimal(streitwert); } catch (e) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Ungültiger Gegenstandswert. Bitte eine Zahl eingeben (z. B. 10000).';
      ergebnisEl.replaceChildren(d);
      toggleEl.classList.add('d-none');
      return;
    }
    if (streitwertD.lte(0)) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte einen positiven Gegenstandswert eingeben.';
      ergebnisEl.replaceChildren(d);
      toggleEl.classList.add('d-none');
      return;
    }

    try {
      const normal = berechneRVGGesamt(streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN);
      const normalUst  = new Decimal(normal.netto).times(ustSatz).toDecimalPlaces(2);
      const normalGes  = new Decimal(normal.netto).plus(normalUst);

      if (pkhModus) {
        const pkh = berechneRVGGesamtPKH(streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN);
        const pkhUst = new Decimal(pkh.netto).times(ustSatz).toDecimalPlaces(2);
        const pkhGes = new Decimal(pkh.netto).plus(pkhUst);
        ergebnisEl.innerHTML = renderErgebnis(pkh.positionen, pkh.netto, pkhUst, pkhGes, Math.round(ustSatz * 100), normal.positionen, normalGes);
      } else {
        ergebnisEl.innerHTML = renderErgebnis(normal.positionen, normal.netto, normalUst, normalGes, Math.round(ustSatz * 100), null, null);
      }

      toggleEl.classList.remove('d-none');
    } catch (err) {
      const errDiv = document.createElement('div');
      errDiv.className = 'alert alert-danger';
      errDiv.textContent = err.message;
      ergebnisEl.replaceChildren(errDiv);
      toggleEl.classList.add('d-none');
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderErgebnis(positionen, netto, ust, gesamt, ustProzent, vergleichsPositionen, vergleichsGesamt) {
    const isPKH = vergleichsPositionen !== null;
    let rows = '';
    for (let i = 0; i < positionen.length; i++) {
      const p = positionen[i];
      const vgl = vergleichsPositionen ? vergleichsPositionen[i] : null;
      rows += `<tr>
        <td>VV ${escapeHtml(p.vvNummer)}</td>
        <td>${escapeHtml(p.beschreibung)}</td>
        <td class="text-end">${p.faktor !== null ? p.faktor.toFixed(1) : '–'}</td>
        <td class="text-end font-mono">${p.gebuehrGesamt.toFixed(2)} €</td>
        ${vgl ? `<td class="text-end font-mono text-muted small">${vgl.gebuehrGesamt.toFixed(2)} €</td>` : ''}
      </tr>`;
    }

    const extraTh = isPKH ? '<th class="text-end text-muted small">Normal (§ 2 RVG)</th>' : '';
    const extraTdSubtotal = isPKH ? '<td></td>' : '';
    const gesamtStr = gesamt.toFixed(2);
    const titelSuffix = isPKH ? ' · PKH (§ 49 RVG)' : '';
    const pkhHinweis = isPKH ? `<p class="text-muted small mt-3 mb-0">Vergütung aus der Staatskasse nach § 49 RVG. Gegenstandswert > 4.000 € wird anteilig auf 75 % des übersteigenden Betrags begrenzt. Kein Ersatz für anwaltliche Prüfung.</p>` : '';
    const vergleichsHinweis = isPKH && vergleichsGesamt
      ? `<div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top text-muted small"><span>Zum Vergleich: normale RVG-Vergütung</span><span class="font-mono">${vergleichsGesamt.toFixed(2)} €</span></div>`
      : '';

    return `
      <div class="rechner-result">
        <div class="rechner-result__header">
          <div class="rechner-result__header-title">Ergebnis · Anwaltskosten${titelSuffix}</div>
          <div class="rechner-result__total-badge">${gesamtStr} €</div>
        </div>
        <div class="rechner-result__body">
          <table class="table table-sm table-striped mb-0">
            <thead>
              <tr><th>VV-Nr.</th><th>Position</th><th class="text-end">Faktor</th><th class="text-end">Betrag</th>${extraTh}</tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr class="rechner-result__subtotal-row"><td colspan="3">Netto</td><td class="text-end font-mono">${netto.toFixed(2)} €</td>${extraTdSubtotal}</tr>
              <tr class="rechner-result__subtotal-row"><td colspan="3">Umsatzsteuer (${ustProzent} %)</td><td class="text-end font-mono">${ust.toFixed(2)} €</td>${extraTdSubtotal}</tr>
            </tfoot>
          </table>
        </div>
        <div class="rechner-result__footer">
          <span class="rechner-result__footer-label">Anwaltskosten gesamt</span>
          <span class="rechner-result__footer-val">${gesamtStr} €</span>
        </div>
        ${vergleichsHinweis}
        ${pkhHinweis}
      </div>`;
  }

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(el) {
    new bootstrap.Tooltip(el);
  });
})();
