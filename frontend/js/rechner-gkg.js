(function () {
  'use strict';

  document.getElementById('form-gkg').addEventListener('submit', function (e) {
    e.preventDefault();
    berechne();
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function gebuehrAusGKGTabelle(streitwert) {
    for (const zeile of GKG_TABELLE) {
      if (streitwert <= zeile.bis) return zeile.gebuehr;
    }
    const letzte = GKG_TABELLE[GKG_TABELLE.length - 1];
    const stufen = Math.ceil((streitwert - letzte.bis) / 30000);
    return letzte.gebuehr + stufen * 108;
  }

  const MULTIPLIKATOREN = { ag: 3.0, lg: 3.0, olg: 4.0, bgh: 5.0 };
  const INSTANZ_LABEL   = { ag: 'Amtsgericht', lg: 'Landgericht', olg: 'Oberlandesgericht', bgh: 'Bundesgerichtshof' };

  function berechne() {
    const streitwertRaw = document.getElementById('gkg-streitwert').value
      .replace(/\./g, '')
      .replace(',', '.');
    const instanz       = document.getElementById('gkg-instanz').value;
    const ergebnisEl    = document.getElementById('gkg-ergebnis');

    if (!MULTIPLIKATOREN[instanz]) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Ungültige Instanzauswahl.';
      ergebnisEl.replaceChildren(d);
      return;
    }

    if (!streitwertRaw || streitwertRaw === '.') {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Bitte einen gültigen Streitwert eingeben.';
      ergebnisEl.replaceChildren(d);
      return;
    }
    const streitwert = parseFloat(streitwertRaw);
    if (isNaN(streitwert) || streitwert <= 0) {
      const d = document.createElement('div');
      d.className = 'alert alert-warning';
      d.textContent = 'Ungültiger Streitwert. Bitte eine positive Zahl eingeben (z. B. 15000).';
      ergebnisEl.replaceChildren(d);
      return;
    }

    const mult           = MULTIPLIKATOREN[instanz];
    const einfach        = gebuehrAusGKGTabelle(streitwert);
    const gerichtskosten = einfach * mult;
    ergebnisEl.innerHTML = renderErgebnis(streitwert, instanz, einfach, mult, gerichtskosten);
  }

  function fmt(n) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderErgebnis(streitwert, instanz, einfach, mult, gesamt) {
    return `
      <div class="rechner-result">
        <table class="table table-sm table-bordered mb-0">
          <tbody>
            <tr><td>Streitwert</td><td class="text-end font-mono">${fmt(streitwert)} €</td></tr>
            <tr><td>Instanz</td><td class="text-end">${escapeHtml(INSTANZ_LABEL[instanz])}</td></tr>
            <tr><td>Einfache Gebühr (§ 34 GKG, Anlage 2)</td><td class="text-end font-mono">${fmt(einfach)} €</td></tr>
            <tr><td>Gebührenanzahl</td><td class="text-end">${mult.toFixed(1)}</td></tr>
            <tr class="fw-bold table-primary"><td>Gerichtskosten gesamt</td><td class="text-end font-mono">${fmt(gesamt)} €</td></tr>
          </tbody>
        </table>
        <div class="alert alert-info small mt-2 mb-0">
          <strong>Hinweis:</strong> Dies sind nur die Gerichtsgebühren. Anwaltskosten beider Parteien und sonstige Auslagen (Zeugenentschädigung, Sachverständigengebühren) sind nicht enthalten.
        </div>
      </div>
      <div class="rechner-cta-box mt-3">
        <div class="rechner-cta-box__title">Gerichtskosten in die Forderungsaufstellung aufnehmen</div>
        <div class="rechner-cta-box__sub">In der Forderungsaufstellung können titulierte Gerichtskosten und RVG-Positionen nach § 367 BGB verrechnet werden.</div>
        <a href="/forderungsaufstellung" class="btn btn-primary btn-sm">Zur Forderungsaufstellung →</a>
      </div>`;
  }
})();
