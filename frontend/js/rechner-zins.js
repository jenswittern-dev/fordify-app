(function () {
  'use strict';

  // Heutiges Datum als Standard für "Bis"
  const heute = new Date();
  const heuteStr = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
  document.getElementById('zins-bis').value = heuteStr;

  document.getElementById('form-zins').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  function berechne() {
    const betrag = document.getElementById('zins-betrag').value.replace(',', '.');

    const vonVal = document.getElementById('zins-von').value;
    const bisVal = document.getElementById('zins-bis').value;

    if (!betrag || betrag === '.') {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte einen gültigen Betrag eingeben.';
      document.getElementById('zins-ergebnis').replaceChildren(d);
      return;
    }
    if (!vonVal || !bisVal) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte Zinsbeginn und Zinsende eingeben.';
      document.getElementById('zins-ergebnis').replaceChildren(d);
      return;
    }
    let betragD;
    try { betragD = new Decimal(betrag); } catch (e) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Ungültiger Betrag. Bitte eine Zahl eingeben (z. B. 5000,00).';
      document.getElementById('zins-ergebnis').replaceChildren(d);
      return;
    }
    if (betragD.lte(0)) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte einen positiven Betrag eingeben.';
      document.getElementById('zins-ergebnis').replaceChildren(d);
      return;
    }

    const von    = parseDate(vonVal);
    const bis    = parseDate(bisVal);
    const typ    = document.getElementById('zins-typ').value; // 'b2b' | 'b2c'
    const aufschlagPP = typ === 'b2b' ? 9 : 5;

    const ergebnisEl = document.getElementById('zins-ergebnis');
    try {
      const perioden = berechneVerzugszinsen(betrag, von, bis, aufschlagPP, BASISZINSSAETZE);
      ergebnisEl.innerHTML = renderPerioden(perioden);
    } catch (err) {
      const errDiv = document.createElement('div');
      errDiv.className = 'alert alert-danger';
      errDiv.textContent = err.message;
      ergebnisEl.replaceChildren(errDiv);
    }
  }

  function renderPerioden(perioden) {
    if (perioden.length === 0) {
      return '<div class="alert alert-info">Kein Zinszeitraum – Enddatum liegt vor oder am Beginndatum.</div>';
    }
    let gesamt = new Decimal(0);
    let rows = '';
    for (const p of perioden) {
      gesamt = gesamt.plus(p.zinsbetrag);
      rows += `<tr>
        <td>${formatDate(p.von)} – ${formatDate(p.bis)}</td>
        <td class="text-end">${p.tage}</td>
        <td class="text-end">${p.basiszinssatz.toFixed(2)} % + ${p.aufschlag} PP = ${p.zinssatz.toFixed(2)} %</td>
        <td class="text-end font-mono">${p.zinsbetrag.toFixed(2)} €</td>
      </tr>`;
    }
    return `
      <div class="rechner-result">
        <table class="table table-sm table-bordered mb-0">
          <thead class="table-primary">
            <tr>
              <th>Zeitraum</th>
              <th class="text-end">Tage</th>
              <th class="text-end">Zinssatz</th>
              <th class="text-end">Zinsbetrag</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot class="fw-bold">
            <tr>
              <td colspan="3">Gesamte Verzugszinsen</td>
              <td class="text-end font-mono">${gesamt.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="rechner-cta-box mt-3">
        <div class="rechner-cta-box__title">Vollständige Forderungsaufstellung nach § 367 BGB</div>
        <div class="rechner-cta-box__sub">Zinsen, RVG-Gebühren, Zahlungsverrechnung – alles in einem professionellen Dokument.</div>
        <a href="/forderungsaufstellung" class="btn btn-primary btn-sm">Zur Forderungsaufstellung →</a>
      </div>`;
  }
})();
