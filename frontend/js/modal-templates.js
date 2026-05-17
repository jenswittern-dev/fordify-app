// fordify – Modal-Templates (HTML-Strings für Positionstyp-Eingabe-Modals)
// Lädt vor app.js. Nutzt escAttr, escHtml (utils.js), VV_DEFINITIONEN,
// STANDARDKOSTEN, AKTIONSTYPEN (data.js), formatEUR (utils.js),
// gkgGebuehr (gkg.js), holeGruppen (in app.js — kontextuell verfügbar),
// state.fall (global).
"use strict";
// ---- Modal-Templates ----

function datumFeld(id, wert, label = "Datum") {
  return `<div class="mb-3">
    <label class="form-label" for="${id}">${label}</label>
    <input type="date" class="form-control" id="${id}" value="${wert || ""}">
  </div>`;
}

function betragFeld(id, wert, label = "Betrag (€)") {
  const val = wert ? new Decimal(wert).toFixed(2) : "";
  return `<div class="mb-3">
    <label class="form-label" for="${id}">${label}</label>
    <input type="number" step="0.01" min="0" class="form-control" id="${id}" value="${val}" placeholder="0,00">
  </div>`;
}

function tituliertFeld(wert) {
  return `<div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="mf-tituliert" ${wert ? "checked" : ""}>
    <label class="form-check-label" for="mf-tituliert">Tituliert (im Vollstreckungstitel enthalten)</label>
  </div>`;
}

function tplHauptforderung(pos) {
  return `
    ${datumFeld("mf-datum", pos?.datum, "Fälligkeitsdatum")}
    <div class="mb-3">
      <label class="form-label">Beschreibung</label>
      <input type="text" class="form-control" id="mf-beschreibung" value="${escAttr(pos?.beschreibung || '')}" placeholder="z.B. Rechnung Nr. 1234 vom …">
    </div>
    ${betragFeld("mf-betrag", pos?.betrag)}
    ${tituliertFeld(pos?.tituliert)}
  `;
}

function tplAnwalt(pos) {
  const streitwert = pos?.streitwert || "";
  const checked = vv => pos?.vvNummern?.includes(vv) ? "checked" : "";
  const gespeicherterFaktor = vv => pos?.faktoren?.[vv] || VV_DEFINITIONEN[vv]?.faktor || "";
  const ustSatz = pos?.ustSatz ?? (pos?.ohneUst ? 0 : 19);
  return `
    ${datumFeld("mf-datum", pos?.datum, "Datum der Beauftragung")}
    <div class="mb-3">
      <label class="form-label">Streitwert (€)</label>
      <input type="number" step="0.01" min="0" class="form-control" id="mf-streitwert" value="${streitwert}" placeholder="0,00" data-onchange="1">
    </div>
    <div class="mb-3">
      <label class="form-label">VV-Nummern</label>
      ${Object.entries(VV_DEFINITIONEN).map(([vv, def]) => `
        <div class="d-flex align-items-center gap-2 mb-1">
          <div class="form-check mb-0 flex-grow-1">
            <input class="form-check-input mf-vv-check" type="checkbox" value="${vv}" id="vv-${vv}" ${checked(vv)}>
            <label class="form-check-label" for="vv-${vv}">${def.beschreibung}</label>
          </div>
          ${def.faktorMin != null ? `
          <div class="input-group input-group-sm" style="width:7.5rem;flex-shrink:0">
            <input type="number" class="form-control mf-vv-faktor" data-vv="${vv}"
                   id="faktor-${vv}" value="${gespeicherterFaktor(vv)}"
                   min="${def.faktorMin}" max="${def.faktorMax}" step="0.1"
                   style="text-align:right" data-onchange="1">
            <span class="input-group-text">-fach</span>
          </div>` : `<span class="text-muted" style="font-size:var(--text-xs);width:7.5rem;flex-shrink:0;text-align:right;padding-right:0.5rem">${def.faktor ? def.faktor + "-fach" : "pauschal"}</span>`}
        </div>`).join("")}
    </div>
    <div class="mb-3">
      <label class="form-label" for="mf-ust-satz">Umsatzsteuer</label>
      <select class="form-select form-select-sm" id="mf-ust-satz" style="max-width:260px" data-onchange="1">
        <option value="19" ${ustSatz === 19 ? "selected" : ""}>19&nbsp;% USt</option>
        <option value="7"  ${ustSatz === 7  ? "selected" : ""}>7&nbsp;% USt</option>
        <option value="0"  ${ustSatz === 0  ? "selected" : ""}>Ohne USt (Vorsteuerabzugsberechtigt)</option>
      </select>
    </div>
    ${tituliertFeld(pos?.tituliert)}
  `;
}

function tplZinsforderungTitel(pos) {
  return `
    ${datumFeld("mf-datum", pos?.datum, "Datum letzter Zinsabschluss / Titel")}
    <div class="mb-3">
      <label class="form-label">Zinsen laufend ab</label>
      <input type="date" class="form-control" id="mf-zins-bis" value="${pos?.zinsBis || ""}">
    </div>
    <div class="mb-3">
      <label class="form-label">Zinsaufschlag (Prozentpunkte über jeweiligem Basiszinssatz p.\u00a0a.)</label>
      <input type="number" step="1" min="1" max="20" class="form-control" id="mf-aufschlag" value="${pos?.aufschlag || state.fall.aufschlagPP}">
    </div>
    <div class="mb-3">
      <label class="form-label">Zinsmethode</label>
      <select class="form-select" id="mf-zinsmethode">
        <option value="act/365" ${(!pos?.zinsmethode || pos?.zinsmethode === 'act/365') ? 'selected' : ''}>act/365 – Taggenau (§ 288 BGB Standard)</option>
        <option value="30/360" ${pos?.zinsmethode === '30/360' ? 'selected' : ''}>30/360 – Kaufmännisch (vertragliche Zinsen)</option>
      </select>
    </div>
    ${betragFeld("mf-betrag", pos?.betrag, "Zinsbetrag (bis Datum oben)")}
    ${tituliertFeld(pos?.tituliert)}
  `;
}

function tplZinsperiode(pos) {
  const heuteBis = new Date().toISOString().slice(0, 10);
  const gruppen = holeGruppen();

  let gruppenDropdown = "";
  if (gruppen.length > 1) {
    const options = gruppen.map((hf, i) => {
      const label = hf.beschreibung
        ? `Rechnung\u00a0${i + 1}: ${hf.beschreibung} (${formatEUR(hf.betrag)})`
        : `Hauptforderung\u00a0${i + 1} (${formatEUR(hf.betrag)})`;
      const selected = pos?.gruppeId === hf.gruppeId || (!pos?.gruppeId && i === 0) ? "selected" : "";
      return `<option value="${hf.gruppeId}" ${selected}>${label}</option>`;
    }).join("");
    gruppenDropdown = `
    <div class="mb-3">
      <label class="form-label" for="mf-gruppe">Gehört zu Hauptforderung</label>
      <select class="form-select" id="mf-gruppe">${options}</select>
    </div>`;
  }

  return `
    ${gruppenDropdown}
    ${datumFeld("mf-datum", pos?.datum, "Buchungsdatum")}
    ${betragFeld("mf-hauptbetrag", pos?.hauptbetrag, "Hauptbetrag (€)")}
    <div class="mb-3">
      <label class="form-label">Zinsen ab (Datum)</label>
      <input type="date" class="form-control" id="mf-zins-von" value="${pos?.zinsVon || ""}" data-onchange="1">
    </div>
    <input type="hidden" id="mf-zins-bis" value="${pos?.zinsBis || heuteBis}">
    <div class="mb-3">
      <label class="form-label">Zinsaufschlag (Prozentpunkte über jeweiligem Basiszinssatz p.\u00a0a.)</label>
      <input type="number" step="1" min="1" max="20" class="form-control" id="mf-aufschlag" value="${pos?.aufschlag || state.fall.aufschlagPP}" data-onchange="1">
    </div>
    <div class="mb-3">
      <label class="form-label">Zinsmethode</label>
      <select class="form-select" id="mf-zinsmethode" data-onchange="1">
        <option value="act/365" ${(!pos?.zinsmethode || pos?.zinsmethode === 'act/365') ? 'selected' : ''}>act/365 – Taggenau (§ 288 BGB Standard)</option>
        <option value="30/360" ${pos?.zinsmethode === '30/360' ? 'selected' : ''}>30/360 – Kaufmännisch (vertragliche Zinsen)</option>
      </select>
    </div>
    ${tituliertFeld(pos?.tituliert)}
  `;
}

function tplZahlung(pos) {
  const hfsAlle = state.fall.positionen.filter(p => p.typ === "hauptforderung");
  const kostenTypen = ["anwaltsverguetung","gv_kosten","gerichtskosten","zahlungsverbot",
    "auskunftskosten","mahnkosten","inkassopauschale","sonstige_kosten"];
  const kostenPos = state.fall.positionen.filter(p => kostenTypen.includes(p.typ));
  // Zinsen-Ziele: HFs mit Zinsperioden + titulierte Zinsforderungen
  const zpPos = state.fall.positionen.filter(p => p.typ === "zinsperiode");
  const ztPos = state.fall.positionen.filter(p => p.typ === "zinsforderung_titel");
  const hfsWithZinsen = hfsAlle.filter(hf => zpPos.some(z => z.gruppeId === hf.gruppeId));
  const zinsenZielCount = hfsWithZinsen.length + ztPos.length;
  const hatZiele = hfsAlle.length > 0 || kostenPos.length > 0 || zinsenZielCount > 0;
  const hatMehrereZiele = hfsAlle.length + kostenPos.length + zinsenZielCount > 1;
  const tilgungAktiv = pos?.tilgungsbestimmung || false;

  // Aktuell ausgewähltes Ziel (beim Bearbeiten)
  let selectedZiel = "";
  if (tilgungAktiv) {
    if (pos?.tilgungsHFId) selectedZiel = `hf-id:${pos.tilgungsHFId}`;
    else if (pos?.tilgungsGruppeId) {
      // Legacy: gruppeId → erste passende HF
      const matchHF = state.fall.positionen.find(p => p.typ === "hauptforderung" && p.gruppeId === pos.tilgungsGruppeId);
      if (matchHF) selectedZiel = `hf-id:${matchHF.id}`;
    }
    else if (pos?.tilgungsKostenId) selectedZiel = `k:${pos.tilgungsKostenId}`;
    else if (pos?.tilgungsZinsHFId) selectedZiel = `z-hf:${pos.tilgungsZinsHFId}`;
    else if (pos?.tilgungsZtId) selectedZiel = `zt:${pos.tilgungsZtId}`;
  }

  // Optionen aufbauen
  let zielOptionen = "";
  const hatGruppen = [hfsAlle.length > 0, kostenPos.length > 0, zinsenZielCount > 0].filter(Boolean).length > 1;
  if (hfsAlle.length > 0) {
    if (hatGruppen) zielOptionen += `<optgroup label="Hauptforderung(en)">`;
    hfsAlle.forEach((hf, i) => {
      const label = hf.beschreibung
        ? `HF\u00a0${i + 1}: ${hf.beschreibung}`
        : `Hauptforderung\u00a0${i + 1}`;
      const betragStr = hf.betrag ? ` (${formatEUR(new Decimal(hf.betrag))})` : "";
      const sel = selectedZiel === `hf-id:${hf.id}` ? " selected" : "";
      zielOptionen += `<option value="hf-id:${hf.id}"${sel}>${label}${betragStr}</option>`;
    });
    if (hatGruppen) zielOptionen += `</optgroup>`;
  }
  if (kostenPos.length > 0) {
    if (hatGruppen) zielOptionen += `<optgroup label="Kosten">`;
    kostenPos.forEach(k => {
      const label = k.beschreibung || AKTIONSTYPEN[k.typ] || k.typ;
      const sel = selectedZiel === `k:${k.id}` ? " selected" : "";
      zielOptionen += `<option value="k:${k.id}"${sel}>${label}</option>`;
    });
    if (hatGruppen) zielOptionen += `</optgroup>`;
  }
  if (zinsenZielCount > 0) {
    if (hatGruppen) zielOptionen += `<optgroup label="Zinsen">`;
    hfsWithZinsen.forEach(hf => {
      const hfIdx = hfsAlle.indexOf(hf);
      const label = hfsAlle.length > 1 ? `Zinsen HF\u00a0${hfIdx + 1}` : "Zinsen";
      const sel = selectedZiel === `z-hf:${hf.id}` ? " selected" : "";
      zielOptionen += `<option value="z-hf:${hf.id}"${sel}>${label}</option>`;
    });
    ztPos.forEach(zt => {
      const label = zt.beschreibung || "Titulierte Zinsen";
      const sel = selectedZiel === `zt:${zt.id}` ? " selected" : "";
      zielOptionen += `<option value="zt:${zt.id}"${sel}>${label}</option>`;
    });
    if (hatGruppen) zielOptionen += `</optgroup>`;
  }

  // Automatisch erstes Ziel vorauswählen (nur bei neuer Zahlung)
  if (!tilgungAktiv && !selectedZiel && hfsAlle.length > 0) {
    zielOptionen = zielOptionen.replace(`value="hf-id:${hfsAlle[0].id}"`, `value="hf-id:${hfsAlle[0].id}" selected`);
  }

  const tilgungDetails = hatZiele ? `
    <div id="mf-tilgung-details" class="${tilgungAktiv ? "" : "d-none"} mt-2">
      <div class="mb-2">
        <label class="form-label mb-1">Zahlung verrechnen auf</label>
        ${hatMehrereZiele
          ? `<select class="form-select form-select-sm" id="mf-tilgung-zielId">${zielOptionen}</select>`
          : hfsAlle.length === 1
            ? `<input type="hidden" id="mf-tilgung-zielId" value="hf-id:${hfsAlle[0].id}">
               <div class="form-text">Die Zahlung wird direkt auf den Hauptbetrag angerechnet (Zinsen bleiben als separate Forderung bestehen).</div>`
            : `<input type="hidden" id="mf-tilgung-zielId" value="k:${kostenPos[0].id}">
               <div class="form-text">Die Zahlung wird auf die Kostenposition angerechnet.</div>`
        }
        ${hatMehrereZiele ? `<div class="form-text">Die Zahlung wird direkt auf den gew\u00e4hlten Hauptbetrag angerechnet (Zinsen bleiben separat). Ein verbleibender Rest wird gem.\u00a0\u00a7\u00a7\u00a0366/367\u00a0BGB verrechnet.</div>` : ""}
      </div>
      <div class="mb-2">
        <label class="form-label mb-1">Zugeordneter Betrag <span class="text-muted fw-normal">(optional)</span></label>
        <input type="number" class="form-control form-control-sm" id="mf-tilgung-betrag"
          step="0.01" min="0"
          placeholder="Leer = bis zur H\u00f6he der Restforderung"
          value="${tilgungAktiv && pos?.tilgungsBetrag ? pos.tilgungsBetrag : ""}">
        <div class="form-text">Nur ausf\u00fcllen, wenn die Schuldner*in explizit nur einen Teilbetrag zugeordnet hat.</div>
      </div>
      <div>
        <label class="form-label mb-1">Wortlaut / Verwendungszweck <span class="text-muted fw-normal">(optional)</span></label>
        <textarea class="form-control form-control-sm" id="mf-verrechnungsanweisung" rows="2"
          placeholder="z.B. genauen Wortlaut der Tilgungsbestimmung aus dem Verwendungszweck eintragen">${escHtml(pos?.verrechnungsanweisung || '')}</textarea>
        <div class="form-text">Wird als Vermerk im PDF angezeigt.</div>
      </div>
    </div>` : "";

  return `
    ${datumFeld("mf-datum", pos?.datum, "Zahlungsdatum")}
    ${betragFeld("mf-betrag", pos?.betrag, "Zahlbetrag (\u20ac)")}
    <div class="mb-3 p-3 rounded" style="border:1px solid var(--color-border);background:var(--color-surface)">
      <div class="fw-semibold mb-2" style="font-size:var(--text-sm)">Tilgungsbestimmung</div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="mf-tilgungsbestimmung"
          ${tilgungAktiv ? "checked" : ""}
          onchange="document.getElementById('mf-tilgung-details')?.classList.toggle('d-none', !this.checked); document.getElementById('mf-no-tilgung-text')?.classList.toggle('d-none', this.checked)">
        <label class="form-check-label" for="mf-tilgungsbestimmung">
          Schuldner*in hat eine Tilgungsbestimmung getroffen
        </label>
      </div>
      <div id="mf-no-tilgung-text" class="form-text mt-1${tilgungAktiv ? " d-none" : ""}">Ohne Tilgungsbestimmung wird eine Zahlung gem\u00e4\u00df \u00a7\u00a7\u00a0366\u00a0Abs.\u00a02, 367\u00a0Abs.\u00a01\u00a0BGB zun\u00e4chst auf Kosten, dann auf Zinsen und schlie\u00dflich auf die \u00e4lteste Hauptforderung angerechnet.</div>
      ${tilgungDetails}
    </div>
  `;
}

function tplEinfacheKosten(pos, label, standard) {
  return `
    ${datumFeld("mf-datum", pos?.datum)}
    <div class="mb-3">
      <label class="form-label">Beschreibung</label>
      <input type="text" class="form-control" id="mf-beschreibung" value="${escAttr(pos?.beschreibung || label)}" placeholder="${label}">
    </div>
    ${betragFeld("mf-betrag", pos?.betrag || standard)}
    ${tituliertFeld(pos?.tituliert)}
  `;
}

function tplGerichtskosten(pos) {
  const streitwert = pos?.gkgStreitwert || "";
  const verfahren = pos?.gkgVerfahren || "3.0";
  const gebuehr = streitwert ? gkgGebuehr(parseGermanDecimal(streitwert)) : 0;
  const betrag = streitwert ? (gebuehr * parseFloat(verfahren)).toFixed(2) : (pos?.betrag || "");
  return `
    ${datumFeld("mf-datum", pos?.datum)}
    <div class="row g-2 mb-3">
      <div class="col-sm-7">
        <label class="form-label" for="mf-gkg-streitwert">Streitwert (€)</label>
        <input type="number" class="form-control" id="mf-gkg-streitwert" min="0" step="0.01"
               value="${streitwert}" placeholder="z.\u00a0B. 5000" data-onchange="1">
      </div>
      <div class="col-sm-5">
        <label class="form-label" for="mf-gkg-verfahren">Verfahrensart</label>
        <select class="form-select" id="mf-gkg-verfahren" data-onchange="1">
          <option value="0.5"${verfahren === "0.5" ? " selected" : ""}>Mahnbescheid (0,5)</option>
          <option value="1.5"${verfahren === "1.5" ? " selected" : ""}>Vollstreckungsbescheid (1,5)</option>
          <option value="3.0"${verfahren === "3.0" ? " selected" : ""}>Klage 1. Instanz (3,0)</option>
          <option value="4.0"${verfahren === "4.0" ? " selected" : ""}>Berufung (4,0)</option>
          <option value="custom"${verfahren !== "0.5" && verfahren !== "1.5" && verfahren !== "3.0" && verfahren !== "4.0" ? " selected" : ""}>Benutzerdefiniert</option>
        </select>
      </div>
    </div>
    <div class="mb-3${verfahren !== "0.5" && verfahren !== "1.5" && verfahren !== "3.0" && verfahren !== "4.0" ? "" : " d-none"}" id="gkg-custom-wrap">
      <label class="form-label" for="mf-gkg-faktor">Gebührenfaktor</label>
      <input type="number" class="form-control" id="mf-gkg-faktor" min="0" step="0.5"
             value="${verfahren !== "0.5" && verfahren !== "1.5" && verfahren !== "3.0" && verfahren !== "4.0" ? verfahren : ""}"
             placeholder="z.\u00a0B. 2.0" data-onchange="1">
    </div>
    <div id="gkg-ergebnis" class="mb-3 ${streitwert ? "" : "d-none"}">
      <div class="alert alert-info py-2 px-3 small">
        1,0-Gebühr: <strong id="gkg-basis">${formatEUR(gebuehr.toFixed(2))}</strong> &nbsp;&middot;&nbsp;
        Gesamtgebühr: <strong id="gkg-gesamt">${formatEUR((gebuehr * parseFloat(verfahren || 0)).toFixed(2))}</strong>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label" for="mf-beschreibung">Beschreibung</label>
      <input type="text" class="form-control" id="mf-beschreibung"
             value="${escAttr(pos?.beschreibung || 'Gerichtskosten')}" placeholder="Gerichtskosten">
    </div>
    ${betragFeld("mf-betrag", betrag)}
    ${tituliertFeld(pos?.tituliert)}
    <div class="alert alert-warning py-2 px-3 small mb-0" style="font-size:var(--text-xs)">
      Die Tabellenwerte basieren auf GKG Anlage\u00a02 (KostBR\u00c4G 2021). Bitte vor Verwendung mit der
      aktuellen amtlichen Fassung abgleichen.
    </div>
  `;
}

function tplWiederkehrend(pos) {
  return `
    <div class="mb-3">
      <label class="form-label" for="mf-wk-typ">Positionstyp</label>
      <select class="form-select" id="mf-wk-typ">
        <option value="zahlung"${pos?.wkTyp === "zahlung" ? " selected" : ""}>Zahlung / Geldeingang</option>
        <option value="mahnkosten"${pos?.wkTyp === "mahnkosten" ? " selected" : ""}>Mahnkosten</option>
        <option value="gv_kosten"${pos?.wkTyp === "gv_kosten" ? " selected" : ""}>ZV-Kosten (Gerichtsvollzieher)</option>
        <option value="sonstige_kosten"${pos?.wkTyp === "sonstige_kosten" ? " selected" : ""}>Sonstige Kosten</option>
      </select>
    </div>
    ${betragFeld("mf-betrag", pos?.betrag || "", "Betrag je Position (€)")}
    <div class="mb-3">
      <label class="form-label" for="mf-beschreibung">Beschreibung</label>
      <input type="text" class="form-control" id="mf-beschreibung"
             value="${escAttr(pos?.beschreibung || '')}" placeholder="z.\u00a0B. Monatliche Mahnkosten">
    </div>
    ${datumFeld("mf-datum", pos?.datum, "Startdatum (1. Position)")}
    <div class="row g-2 mb-3">
      <div class="col-sm-6">
        <label class="form-label" for="mf-wk-anzahl">Anzahl Positionen</label>
        <input type="number" class="form-control" id="mf-wk-anzahl" min="2" max="60" step="1"
               value="${pos?.wkAnzahl || 2}">
      </div>
      <div class="col-sm-6">
        <label class="form-label" for="mf-wk-intervall">Intervall</label>
        <select class="form-select" id="mf-wk-intervall">
          <option value="monatlich"${(pos?.wkIntervall || "monatlich") === "monatlich" ? " selected" : ""}>Monatlich</option>
          <option value="quartalsweise"${pos?.wkIntervall === "quartalsweise" ? " selected" : ""}>Quartalsweise</option>
          <option value="halbjaehrlich"${pos?.wkIntervall === "halbjaehrlich" ? " selected" : ""}>Halbjährlich</option>
          <option value="jaehrlich"${pos?.wkIntervall === "jaehrlich" ? " selected" : ""}>Jährlich</option>
        </select>
      </div>
    </div>
    <div class="alert alert-info py-2 px-3 small">
      Erzeugt mehrere Einzelpositionen mit dem gewählten Intervall ab dem Startdatum.
    </div>
  `;
}

function tplInkassopauschale(pos) {
  return `
    ${datumFeld("mf-datum", pos?.datum, "Datum der Entstehung")}
    <div class="mb-3">
      <label class="form-label" for="mf-beschreibung">Beschreibung</label>
      <input type="text" class="form-control" id="mf-beschreibung"
             value="${escAttr(pos?.beschreibung || 'Inkassopauschale (§ 288 Abs. 5 BGB)')}"
             placeholder="Inkassopauschale (§ 288 Abs. 5 BGB)">
    </div>
    ${betragFeld("mf-betrag", pos?.betrag || STANDARDKOSTEN.inkassopauschale, "Pauschalbetrag (€)")}
    <div class="alert alert-info py-2 px-3 small mb-3" style="font-size:var(--text-xs)">
      Die Inkassopauschale von 40\u00a0€ steht nur bei <strong>unternehmerischen Forderungen</strong>
      zu (§\u00a0288\u00a0Abs.\u00a05\u00a0BGB, B2B). Nicht anwendbar bei Verbrauchern als Schuldner*in.
    </div>
    ${tituliertFeld(pos?.tituliert)}
  `;
}

