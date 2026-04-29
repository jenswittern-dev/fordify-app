// fordify ZV-Auftrag – pdf-lib AcroForm-Befüllung
// Setzt voraus: window.PDFLib (lazy-loaded on demand)

async function erstelleZVAuftrag(fallDaten, einstellungen, zvFelder) {
  if (!window.PDFLib) throw new Error('pdf-lib nicht geladen.');
  const { PDFDocument } = window.PDFLib;

  const pdfResp = await fetch('/data/zv_formular.pdf');
  if (!pdfResp.ok) throw new Error('Formular konnte nicht geladen werden.');
  const pdfBytes = await pdfResp.arrayBuffer();
  const pdfDoc  = await PDFDocument.load(pdfBytes);
  const form    = pdfDoc.getForm();
  if (typeof console !== 'undefined') console.log('[ZV] Formularfelder:', form.getFields().map(f => f.getName()));

  const set = (name, value) => {
    if (!value) return;
    try { form.getTextField(name).setText(String(value)); } catch(_) {}
  };
  const tick = (name) => {
    try { form.getCheckBox(name).check(); } catch(_) {}
  };

  // Page 1 – Gerichtsvollzieher / Verteilerstelle (user input)
  set('Textfeld 1', zvFelder.gvName);
  set('Textfeld 3', zvFelder.gvStrasse);
  set('Textfeld 4', zvFelder.gvPlzOrt);

  // Page 1 – Ort + Datum des Auftrags
  set('Textfeld 5', einstellungen.ort || '');
  set('Textfeld 6', _heuteDatum());

  // Page 1 – Vollstreckungsschuldner
  set('Textfeld 192', fallDaten.gegner || '');

  // Page 1 – Auftraggeber als Bevollmächtigter
  tick('Kontrollkästchen 7');
  set('Textfeld 203', einstellungen.name  || '');
  set('Textfeld 19',  einstellungen.tel   || '');
  set('Textfeld 20',  einstellungen.email || '');
  set('Textfeld 204', fallDaten.aktenzeichen || '');

  // Page 4 – Vollstreckungstitel (erste Titelstelle)
  set('Textfeld 5035', fallDaten.titelArt     || '');
  set('Textfeld 5016', fallDaten.titelGericht  || '');
  set('Textfeld 5030', _formatDatum(fallDaten.titelDatum));
  set('Textfeld 5012', fallDaten.titelAz       || '');

  // Page 5/6 – Vollstreckungsmaßnahmen
  if (zvFelder.sachpfaendung)       tick('Kontrollkästchen 466');
  if (zvFelder.vermoegensauskunft)  tick('Kontrollkästchen 447');
  if (zvFelder.forderungspfaendung) tick('Kontrollkästchen 460');

  // Forderungsbeträge
  const betraege = _zvForderungsbetraege(fallDaten.positionen || []);
  // TODO: Feldnamen nach PDF-Inspektion eintragen (s. Browser-Konsole)
  // set('FELD_HAUPTFORDERUNG', betraege.hf);
  // set('FELD_KOSTEN', betraege.kosten);

  const ausgabe = await pdfDoc.save();
  const blob = new Blob([ausgabe], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'ZV-Auftrag_' + (fallDaten.aktenzeichen || 'export').replace(/[^\w\-]/g, '_') + '.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function _heuteDatum() {
  return new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function _formatDatum(isoStr) {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch(_) { return isoStr; }
}

function _zvForderungsbetraege(positionen) {
  const pos = positionen || [];
  const hf = pos
    .filter(p => p.typ === 'hauptforderung')
    .reduce((s, p) => s + parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.')), 0);
  const kosten = pos
    .filter(p => ['anwaltsverguetung', 'mahnkosten', 'gv_kosten', 'sonstige_kosten', 'gerichtskosten'].includes(p.typ))
    .reduce((s, p) => s + parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.')), 0);
  const fmt = n => n.toFixed(2).replace('.', ',') + ' EUR';
  return { hf: fmt(hf), kosten: fmt(kosten) };
}
