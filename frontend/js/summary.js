// fordify – Vorschau + Summary-Tabelle (Rendering)
// Lädt vor app.js. Nutzt ladeEinstellungen + generiereImpressumFooterHtml
// (einstellungen.js), BASISZINSSAETZE + AKTIONSTYPEN (data.js),
// aktuellerBasiszinssatz + berechneVerzugszinsen + tageszins (zinsen.js),
// berechneRVGGesamt (rvg.js), berechneVerrechnung (verrechnung.js),
// Decimal (decimal.min.js), formatEUR + parseDate + formatDate + escHtml
// (utils.js), verjährungsWarnungHtml + positionKurzbeschreibung (app.js,
// zur Laufzeit aufgelöst).
"use strict";
// ---- Vorschau ----

function rendereVorschau() {
  const el = document.getElementById("vorschau-inhalt");
  if (!el) return;

  const fall = state.fall;
  const aufschlagPP = fall.aufschlagPP || 9;
  const insoDatum = fall.insoDatum ? parseDate(fall.insoDatum) : null;

  let aktBasisSatz = null;
  let aktZinssatzStr = "";
  try {
    aktBasisSatz = aktuellerBasiszinssatz(new Date(), BASISZINSSAETZE);
    const gesamt = aktBasisSatz.plus(new Decimal(aufschlagPP));
    aktZinssatzStr = gesamt.toFixed(2).replace(".", ",") + "\u00a0% p.a.";
  } catch (e) {}

  // Einstellungen: Logo + Impressum
  const einst = ladeEinstellungen();
  const VALID_LOGO_POS = ["links", "mitte", "rechts"];
  const logoPos = VALID_LOGO_POS.includes(einst.logoPosition) ? einst.logoPosition : "links";
  const logoSafe = (typeof einst.logo === "string" && /^data:image\/[a-z+]+;base64,/.test(einst.logo))
    ? einst.logo : null;
  const logoHtml = logoSafe
    ? `<div class="pdf-logo-wrap pdf-logo-wrap--${logoPos}"><img class="pdf-logo" src="${logoSafe}" alt="Kanzlei-Logo"></div>`
    : "";

  const imp = einst.imp || {};
  const impressumHtml = generiereImpressumFooterHtml(imp);

  // Forderungsgrund-Block (Backward-Compat: altes titelArt ohne forderungsgrundKat → "Titel")
  const fgKat = fall.forderungsgrundKat || (fall.titelArt ? "Titel" : "");
  const hatForderungsgrund = !!fgKat;
  const hatTitel = fgKat === "Titel";
  const fgBlock = hatForderungsgrund ? `
    <div class="pdf-section">
      <div class="pdf-section__label">Forderungsgrund</div>
      <div class="table-scroll">
      <table class="pdf-meta-table">
        <tr><th>Grundlage:</th><td>${escHtml(fgKat)}</td></tr>
        ${fall.titelArt ? `<tr><th>Art:</th><td>${escHtml(fall.titelArt)}</td></tr>` : ""}
        ${hatTitel && fall.titelGericht ? `<tr><th>Gericht / Beh\u00f6rde:</th><td>${escHtml(fall.titelGericht)}</td></tr>` : ""}
        ${hatTitel && fall.titelAz ? `<tr><th>Aktenzeichen:</th><td>${escHtml(fall.titelAz)}</td></tr>` : ""}
        ${hatTitel && fall.titelDatum ? `<tr><th>Datum:</th><td>${formatDate(parseDate(fall.titelDatum))}</td></tr>` : ""}
        ${hatTitel && fall.titelRechtskraft ? `<tr><th>Zustellungsdatum:</th><td>${formatDate(parseDate(fall.titelRechtskraft))}</td></tr>` : ""}
      </table>
      </div>
    </div>` : "";

  const { html: summaryHtml, hatTageszins } = baueSummaryTabelle(fall, BASISZINSSAETZE, aufschlagPP);
  const hatTilgungsbestimmung = (fall.positionen || []).some(p => p.typ === "zahlung" && p.tilgungsbestimmung);

  try { el.innerHTML = `
    ${logoHtml}
    <!-- PDF-Kopf (nur Print) -->
    <div class="pdf-header">
      <div>
        <div class="pdf-header__title">Forderungsaufstellung</div>
        <div class="pdf-header__subtitle">vom ${formatDate(new Date())}</div>
      </div>
      ${insoDatum ? `<div class="pdf-header__meta">InsO-Er\u00f6ffnung: ${formatDate(insoDatum)}</div>` : ""}
    </div>

    <!-- Screen-Kopf (kein Print) -->
    <div class="no-print mb-4">
      <h2 style="font-size:var(--text-xl);font-weight:700;margin:0 0 0.25rem">Forderungsaufstellung</h2>
      ${insoDatum ? `<p style="font-size:var(--text-sm);color:var(--color-text-muted);margin:0">InsO: ${formatDate(insoDatum)}</p>` : ""}
    </div>

    <!-- Parteien -->
    <div class="pdf-section">
      <div class="pdf-section__label">Parteien</div>
      <div class="pdf-parties">
        <div class="pdf-party">
          <span class="pdf-party__role">Gl\u00e4ubiger*in</span>
          <span class="pdf-party__name">${escHtml(fall.mandant) || "\u2014"}</span>
        </div>
        <div class="pdf-party__sep">./.</div>
        <div class="pdf-party">
          <span class="pdf-party__role">Schuldner*in</span>
          <span class="pdf-party__name">${escHtml(fall.gegner) || "\u2014"}</span>
        </div>
        ${fall.aktenzeichen ? `<div class="pdf-party__az">GZ.: ${escHtml(fall.aktenzeichen)}</div>` : ""}
      </div>
    </div>

    ${fgBlock}

    <!-- Zusammenfassung -->
    <div class="pdf-section pdf-section--summary">
      <div class="pdf-section__label">Zusammenfassung</div>
      <div class="table-scroll">
      ${summaryHtml}
      </div>
    </div>

    <!-- Fu\u00dfnote -->
    <div class="vorschau-footer">
      ${hatTageszins ? `(*)\u00a0` : ""}${aufschlagPP}\u00a0Prozentpunkte\u00a0p.\u00a0a. \u00fcber dem Basiszinssatz gem\u00e4\u00df \u00a7\u00a0247\u00a0BGB${aktBasisSatz ? ` (Basiszinssatz am ${formatDate(new Date())}: ${aktBasisSatz.toFixed(2).replace(".", ",")}\u00a0%)` : ""}.<br>
      ${insoDatum ? " Zinslauf endet gem.\u00a0\u00a7\u00a041\u00a0InsO am " + formatDate(insoDatum) + "." : ""}
      ${fall.positionen.some(p => verjährungsWarnungHtml(p)) ? "<br><span style=\"color:var(--color-warning)\">\u26a0 Hinweis: Mindestens eine Zinsforderung ist m\u00f6glicherweise gem.\u00a0\u00a7\u00a0197\u00a0BGB verj\u00e4hrt (3-Jahres-Frist). Bitte pr\u00fcfen Sie die Durchsetzbarkeit.</span>" : ""}
      <br><span style="opacity:0.75">Erstellt mit fordify.de \u00b7 Alle Berechnungen ohne Gew\u00e4hr \u2013 keine Rechtsberatung.</span>
    </div>

    ${impressumHtml}
  `;
  // Stagger-Index für Summary-Zeilen setzen (nach innerHTML-Zuweisung)
  el.querySelectorAll(".summary-table tbody tr").forEach((row, i) => {
    row.style.setProperty("--row-idx", i);
  });
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger m-3"><strong>Fehler beim Rendern der Vorschau:</strong><br><code>${escHtml(err?.message || '')}</code></div>`;
    console.error("rendereVorschau el.innerHTML:", err);
  }
}

/**
 * Baut die neue 4-spaltige Zusammenfassungstabelle:
 * Bezeichnung | Forderung | (Teil-)Zahlung | Restforderung
 * – Initiale Zinsen + Kosten + HF als separate Abschnitte
 * – Jede Position mit eingerückten Zahlungs-Sub-Rows
 * – Neue Zinsen nach Zahlung direkt unter der zugehörigen HF
 * – §367 BGB Verrechnungsreihenfolge: Kosten → Zinsen → HF
 */
function baueSummaryTabelle(fall, basiszinssaetze, aufschlagPP) {
  const insoDatum = fall.insoDatum ? parseDate(fall.insoDatum) : null;
  const heute = new Date();
  const ZERO = new Decimal(0);

  const pos = fall.positionen || [];

  const hfs = pos.filter(p => p.typ === "hauptforderung")
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  const zpAll = pos.filter(p => p.typ === "zinsperiode");

  const kostenTypen = ["anwaltsverguetung","gv_kosten","gerichtskosten","zahlungsverbot",
    "auskunftskosten","mahnkosten","sonstige_kosten"];
  const kostenPos = pos.filter(p => kostenTypen.includes(p.typ));

  const zahlungen = pos.filter(p => p.typ === "zahlung")
    .sort((a, b) => parseDate(a.datum) - parseDate(b.datum));

  // Jede HF ihrer Zinsperiode zuordnen – primär per gruppeId, Fallback: Betrags-Heuristik
  const hfZpMap = {};
  for (const hf of hfs) {
    let zp = zpAll.find(z => z.gruppeId && z.gruppeId === hf.gruppeId);
    if (!zp) {
      const usedIds = new Set(Object.values(hfZpMap).map(z => z.id));
      zp = zpAll.find(z =>
        !usedIds.has(z.id) &&
        Math.abs(parseFloat(z.hauptbetrag || 0) - parseFloat(hf.betrag || 0)) < 0.01
      );
    }
    if (zp) hfZpMap[hf.id] = zp;
  }

  function calcZinsen(betrag, vonStr, bisDate, methode) {
    if (!vonStr || !betrag || new Decimal(betrag).lte(0)) return ZERO;
    const vonDate = parseDate(vonStr);
    if (vonDate >= bisDate) return ZERO;
    try {
      const per = berechneVerzugszinsen(
        new Decimal(betrag).toFixed(2), vonDate, bisDate,
        aufschlagPP, basiszinssaetze, insoDatum, methode || 'act/365'
      );
      return per.reduce((s, p) => s.plus(new Decimal(p.zinsbetrag)), ZERO);
    } catch(e) { return ZERO; }
  }

  function kostenBrutto(k) {
    if (k.typ === "anwaltsverguetung") {
      const ustSatz = k.ustSatz ?? (k.ohneUst ? 0 : 19);
      return new Decimal(parseFloat(k.netto || k.betrag || 0) + (ustSatz > 0 ? parseFloat(k.ust || 0) : 0));
    }
    return new Decimal(k.betrag || 0);
  }

  // ----------------------------------------------------------------
  // Datenstrukturen aufbauen
  // Jeder Eintrag: { ..., betrag, rest, payAllocs: [{zahlIdx, datum, beschreibung, amount, restAfter}] }
  // ----------------------------------------------------------------

  // zinsenEntries: initiale Zinsen (zt-Positionen + HF-Zinsen Phase 0) + neue Zinsen nach Zahlung
  // isNew=true: neue Zinsen nach Zahlung, afterPayIdx = Index der auslösenden Zahlung
  const zinsenEntries = [];

  // zinsforderung_titel
  const ztPos = pos.filter(p => p.typ === "zinsforderung_titel")
    .sort((a, b) => parseDate(a.datum || "1900-01-01") - parseDate(b.datum || "1900-01-01"));
  for (const zt of ztPos) {
    const b = new Decimal(zt.betrag || 0);
    zinsenEntries.push({
      id: `zt_${zt.id}`, hfId: null, isNew: false, afterPayIdx: null,
      bezeichnung: zt.beschreibung || "Titulierte Zinsen",
      betrag: b, rest: b.plus(ZERO), payAllocs: []
    });
  }

  // Initiale HF-Zinsen (Phase 0: von zp.zinsVon bis erster Zahlung oder heute)
  let phase0End = zahlungen.length > 0 ? parseDate(zahlungen[0].datum) : heute;
  if (insoDatum && phase0End > insoDatum) phase0End = insoDatum;
  for (let hfIdx = 0; hfIdx < hfs.length; hfIdx++) {
    const hf = hfs[hfIdx];
    const zp = hfZpMap[hf.id];
    if (!zp || !zp.zinsVon) continue;
    const z = calcZinsen(hf.betrag, zp.zinsVon, phase0End, hf.zinsmethode);
    if (z.lte(0)) continue;
    const hfNum = hfs.length > 1 ? ` ${hfIdx + 1}` : "";
    zinsenEntries.push({
      id: `hfz_init_${hf.id}`, hfId: hf.id, isNew: false, afterPayIdx: null,
      vonStr: zp.zinsVon, bisDate: phase0End,
      bezeichnung: `Zinsen HF${hfNum}`,
      betrag: z, rest: z.plus(ZERO), payAllocs: []
    });
  }

  // kostenEntries
  const kostenEntries = kostenPos.map(k => {
    const b = kostenBrutto(k);
    return {
      id: k.id, typ: k.typ, bezeichnung: k.beschreibung || AKTIONSTYPEN[k.typ] || k.typ,
      datum: k.datum || null, betrag: b, rest: b.plus(ZERO), payAllocs: []
    };
  });

  // hfEntries
  const hfEntries = hfs.map((hf, hfIdx) => {
    const b = new Decimal(hf.betrag || 0);
    const hfNum = hfs.length > 1 ? ` ${hfIdx + 1}` : "";
    const label = hf.beschreibung
      ? `Hauptforderung${hfNum}: ${hf.beschreibung}`
      : `Hauptforderung${hfNum}`;
    return {
      id: hf.id, hfId: hf.id, bezeichnung: label,
      datum: hf.datum || null, betrag: b, rest: b.plus(ZERO), payAllocs: []
    };
  });

  // ----------------------------------------------------------------
  // Zahlungen verarbeiten (§367 BGB: Kosten → Zinsen → HF)
  // ----------------------------------------------------------------
  for (let zahlIdx = 0; zahlIdx < zahlungen.length; zahlIdx++) {
    const zahlung = zahlungen[zahlIdx];
    const zahlDatum = parseDate(zahlung.datum);
    let restZahlung = new Decimal(zahlung.betrag || 0);

    // Neue Zinsen zwischen voriger Zahlung und dieser (für verbleibende HFs)
    if (zahlIdx > 0) {
      const prevPayDatum = zahlungen[zahlIdx - 1].datum;
      for (let hfIdx = 0; hfIdx < hfs.length; hfIdx++) {
        const hf = hfs[hfIdx];
        const hfEntry = hfEntries.find(e => e.hfId === hf.id);
        if (!hfEntry || hfEntry.rest.lte(0)) continue;
        if (!hfZpMap[hf.id]) continue;
        const z = calcZinsen(hfEntry.rest, prevPayDatum, zahlDatum, hf.zinsmethode);
        if (z.lte(0)) continue;
        const hfNum = hfs.length > 1 ? ` ${hfIdx + 1}` : "";
        zinsenEntries.push({
          id: `hfz_new_${hf.id}_${zahlIdx}`, hfId: hf.id, isNew: true,
          afterPayIdx: zahlIdx - 1,
          vonStr: prevPayDatum, bisDate: zahlDatum,
          bezeichnung: `Zinsen HF${hfNum}`,
          betrag: z, rest: z.plus(ZERO), payAllocs: []
        });
      }
    }

    // Alle Zinsen-Einträge in Verrechnungsreihenfolge: zt → initiale hfZinsen → neue (nach afterPayIdx)
    const zinsenGeordnet = [
      ...zinsenEntries.filter(e => !e.isNew),
      ...zinsenEntries.filter(e => e.isNew).sort((a, b) => (a.afterPayIdx || 0) - (b.afterPayIdx || 0))
    ];

    function verrechneAufEntry(entries, zahlLabel) {
      for (const e of entries) {
        if (restZahlung.lte(0)) break;
        if (e.rest.lte(0)) continue;
        const used = Decimal.min(restZahlung, e.rest);
        restZahlung = restZahlung.minus(used);
        e.rest = e.rest.minus(used);
        e.payAllocs.push({ zahlIdx, datum: zahlung.datum, beschreibung: zahlLabel, amount: used, restAfter: e.rest.plus(ZERO), hasTilgung: !!zahlung.tilgungsbestimmung });
      }
    }

    const zahlLabel = zahlung.beschreibung || "";

    if (zahlung.tilgungsbestimmung && (zahlung.tilgungsHFId || zahlung.tilgungsGruppeId || zahlung.tilgungsKostenId || zahlung.tilgungsZinsHFId || zahlung.tilgungsZtId)) {
      const tilgungsBudget = zahlung.tilgungsBetrag
        ? Decimal.min(new Decimal(zahlung.tilgungsBetrag), restZahlung)
        : restZahlung;
      const restVorTilgung = restZahlung;
      restZahlung = tilgungsBudget;

      if (zahlung.tilgungsHFId) {
        // Tilgungsbestimmung auf spezifische HF (§ 366 BGB): direkt auf Hauptbetrag,
        // keine vorrangige Zinsenverrechnung (Zinsen bleiben als separate Forderung bestehen).
        const zielEntry = hfEntries.find(e => e.hfId === zahlung.tilgungsHFId);
        if (zielEntry) verrechneAufEntry([zielEntry], zahlLabel);
      } else if (zahlung.tilgungsGruppeId) {
        // Legacy: Tilgungsbestimmung per gruppeId (ältere Datensätze), ebenfalls direkt auf HF.
        const zielHF = hfs.find(h => h.gruppeId === zahlung.tilgungsGruppeId);
        if (zielHF) verrechneAufEntry(hfEntries.filter(e => e.hfId === zielHF.id), zahlLabel);
      } else if (zahlung.tilgungsKostenId) {
        // Tilgungsbestimmung auf spezifische Kostenposition
        const zielKosten = kostenEntries.find(e => e.id === zahlung.tilgungsKostenId);
        if (zielKosten) verrechneAufEntry([zielKosten], zahlLabel);
      } else if (zahlung.tilgungsZinsHFId) {
        // Tilgungsbestimmung auf Zinsen einer spezifischen HF
        verrechneAufEntry(zinsenGeordnet.filter(e => e.hfId === zahlung.tilgungsZinsHFId), zahlLabel);
      } else if (zahlung.tilgungsZtId) {
        // Tilgungsbestimmung auf titulierte Zinsforderung
        const zielZt = zinsenEntries.find(e => e.id === `zt_${zahlung.tilgungsZtId}`);
        if (zielZt) verrechneAufEntry([zielZt], zahlLabel);
      }

      // Restbetrag wiederherstellen, dann Rest nach § 367
      const fuerZielVerwendet = tilgungsBudget.minus(restZahlung);
      restZahlung = restVorTilgung.minus(fuerZielVerwendet);
      verrechneAufEntry(kostenEntries, zahlLabel);
      verrechneAufEntry(zinsenGeordnet, zahlLabel);
      verrechneAufEntry(hfEntries, zahlLabel);
    } else {
      // Standard § 367 BGB: Kosten → Zinsen → HF (älteste zuerst)
      verrechneAufEntry(kostenEntries, zahlLabel);
      verrechneAufEntry(zinsenGeordnet, zahlLabel);
      verrechneAufEntry(hfEntries, zahlLabel);
    }
  }

  // Abschließender Zinslauf auf verbleibende HF-Beträge (nach letzter Zahlung bis heute)
  if (zahlungen.length > 0) {
    const lastPayDatum = zahlungen[zahlungen.length - 1].datum;
    for (let hfIdx = 0; hfIdx < hfs.length; hfIdx++) {
      const hf = hfs[hfIdx];
      const hfEntry = hfEntries.find(e => e.hfId === hf.id);
      if (!hfEntry || hfEntry.rest.lte(0)) continue;
      if (!hfZpMap[hf.id]) continue;
      const effektivBis = (insoDatum && insoDatum < heute) ? insoDatum : heute;
      const z = calcZinsen(hfEntry.rest, lastPayDatum, effektivBis, hf.zinsmethode);
      if (z.lte(0)) continue;
      const hfNum = hfs.length > 1 ? ` ${hfIdx + 1}` : "";
      zinsenEntries.push({
        id: `hfz_final_${hf.id}`, hfId: hf.id, isNew: true,
        afterPayIdx: zahlungen.length - 1,
        vonStr: lastPayDatum, bisDate: effektivBis,
        bezeichnung: `Zinsen HF${hfNum}`,
        betrag: z, rest: z.plus(ZERO), payAllocs: []
      });
    }
  }

  // ----------------------------------------------------------------
  // Tageszins
  // ----------------------------------------------------------------
  const hfRestFinal = hfEntries.reduce((s, e) => s.plus(e.rest), ZERO);
  let tageszinsZeile = null;
  if (hfRestFinal.gt(0)) {
    try {
      const tz = tageszins(hfRestFinal, aufschlagPP, heute, basiszinssaetze);
      if (tz.gt(0)) tageszinsZeile = { bezeichnung: "Tageszins ab heute (*)", betrag: tz };
    } catch(e) {}
  }

  // ----------------------------------------------------------------
  // Totals
  // ----------------------------------------------------------------
  const totForderung = [
    ...zinsenEntries,   // alle Zinsen inkl. neue nach Zahlung
    ...kostenEntries,
    ...hfEntries
  ].reduce((s, e) => s.plus(e.betrag), ZERO);

  const totZahlung = zahlungen.reduce((s, z) => s.plus(new Decimal(z.betrag || 0)), ZERO);

  const totRest = [
    ...zinsenEntries,
    ...kostenEntries,
    ...hfEntries
  ].reduce((s, e) => s.plus(e.rest), ZERO);

  // ----------------------------------------------------------------
  // HTML-Rendering
  // ----------------------------------------------------------------
  const dash = "\u2014";

  function amtCell(val, cls) {
    if (val === null || val === undefined) return `<td class="text-end">${dash}</td>`;
    const d = new Decimal(val);
    if (d.isZero()) return `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
    const neg = d.lt(0);
    return `<td class="text-end"><span class="amount${cls ? " " + cls : ""}${neg ? " amount--negative" : ""}">${formatEUR(d)}</span></td>`;
  }
  function datumCell(datum, cls) {
    return `<td class="summary-datum${cls ? " " + cls : ""}">${datum ? formatDate(parseDate(datum)) : ""}</td>`;
  }
  function datumRangeCell(vonStr, bisDate) {
    if (!vonStr) return `<td class="summary-datum"></td>`;
    const vonFmt = formatDate(parseDate(vonStr));
    const bisFmt = bisDate ? formatDate(bisDate instanceof Date ? bisDate : parseDate(bisDate)) : "heute";
    return `<td class="summary-datum summary-datum--range">${vonFmt}\u00a0\u2013\u00a0${bisFmt}</td>`;
  }
  // Sub-Row: Anrechnung unter der jeweiligen Forderungsposition
  // isLast=true: letzte Sub-Row einer Position → Abgrenzungslinie zur nächsten Position
  function payAllocRow(alloc, isLast = false) {
    const base = alloc.beschreibung
      ? `\u2514\u00a0${formatDate(parseDate(alloc.datum))}\u00a0${escHtml(alloc.beschreibung)}`
      : `\u2514\u00a0${formatDate(parseDate(alloc.datum))}\u00a0Zahlung`;
    const badge = alloc.hasTilgung
      ? `\u00a0<span class="badge-tilgung">Tilgungsbestimmung</span>`
      : "";
    // Restforderung nach Anrechnung: nur beim letzten Sub-Row anzeigen (Zwischenstände weglassen).
    // Ist die Position vollständig beglichen, explizit 0,00 € zeigen statt leer.
    const restAfterAmt = alloc.restAfter || new Decimal(0);
    const restAfterCell = isLast
      ? `<td class="text-end"><span class="amount amount--restforderung">${formatEUR(restAfterAmt)}</span></td>`
      : `<td class="text-end"></td>`;
    return `<tr class="summary-row--pay-alloc${isLast ? ' summary-row--pay-alloc-last' : ''}">
      <td class="summary-datum"></td>
      <td class="pay-alloc-label">${base}${badge}</td>
      <td class="text-end"></td>
      <td class="text-end"></td>
      ${amtCell(alloc.amount.negated())}
      ${restAfterCell}
    </tr>`;
  }
  // Neue Zinsen (nach Zahlung): Betrag in Forderung-Spalte damit Totals balancieren.
  // Forderung − Anrechnung = Restforderung gilt dann auch arithmetisch.
  function zinsenNeuRow(e) {
    const hasAllocs = e.payAllocs && e.payAllocs.length > 0;
    const restCell = hasAllocs ? `<td class="text-end"></td>` : amtCell(e.rest);
    return `<tr class="summary-row--zinsen-neu${hasAllocs ? " summary-row--has-allocs" : ""}">
      ${datumRangeCell(e.vonStr, e.bisDate)}
      <td>${escHtml(e.bezeichnung)}</td>
      ${amtCell(e.betrag)}
      <td class="text-end"></td>
      <td class="text-end"></td>
      ${restCell}
    </tr>`;
  }

  const rowsHtml = [];

  // Kosten-Priorität: Anwaltsvergütung zuerst, dann Gerichtskosten, dann Rest
  const kostenPrio = { anwaltsverguetung: 0, gerichtskosten: 1 };
  const sortedKosten = [...kostenEntries].sort((a, b) =>
    (kostenPrio[a.typ] ?? 2) - (kostenPrio[b.typ] ?? 2)
  );

  // Hilfsfunktion: Forderungszeile rendern
  // Hat die Position PayAllocs, bleibt Restforderung in der Hauptzeile leer (steht in der letzten Sub-Row).
  function claimRow(datumSpalte, bezeichnung, betrag, rest, payAllocs) {
    const hasAllocs = payAllocs && payAllocs.length > 0;
    const restCell = hasAllocs ? `<td class="text-end"></td>` : amtCell(rest);
    return `<tr${hasAllocs ? ' class="summary-row--has-allocs"' : ''}>
      ${datumSpalte}
      <td>${escHtml(bezeichnung)}</td>
      ${amtCell(betrag)}
      <td class="text-end"></td>
      <td class="text-end"></td>
      ${restCell}
    </tr>`;
  }

  // Hilfsfunktion: PayAllocs einer Position rendern, letzte zeigt Restforderung
  function renderPayAllocs(allocs) {
    allocs.forEach((alloc, i) => rowsHtml.push(payAllocRow(alloc, i === allocs.length - 1)));
  }

  // Abschnitt 1: Für jede HF: HF-Zeile + PayAllocs, dann Zinsen (init + neu) + PayAllocs
  for (const hfEntry of hfEntries) {
    rowsHtml.push(claimRow(datumCell(hfEntry.datum), hfEntry.bezeichnung, hfEntry.betrag, hfEntry.rest, hfEntry.payAllocs));
    renderPayAllocs(hfEntry.payAllocs);

    // Initiale Zinsen dieser HF (Phase 0) + zugehörige PayAllocs
    for (const e of zinsenEntries.filter(en => !en.isNew && en.hfId === hfEntry.hfId)) {
      const datumSpalte = e.vonStr ? datumRangeCell(e.vonStr, e.bisDate) : datumCell(null);
      rowsHtml.push(claimRow(datumSpalte, e.bezeichnung, e.betrag, e.rest, e.payAllocs));
      renderPayAllocs(e.payAllocs);
    }

    // Neue Zinsen nach jeder Zahlung (für diese HF) + zugehörige PayAllocs
    for (let payIdx = 0; payIdx < zahlungen.length; payIdx++) {
      for (const nz of zinsenEntries.filter(e =>
        e.isNew && e.hfId === hfEntry.hfId && e.afterPayIdx === payIdx
      )) {
        rowsHtml.push(zinsenNeuRow(nz));
        renderPayAllocs(nz.payAllocs);
      }
    }
  }

  // Titulierte Zinsen (zinsforderung_titel – keiner HF zugeordnet) + PayAllocs
  for (const e of zinsenEntries.filter(en => !en.isNew && en.hfId === null)) {
    const datumSpalte = e.vonStr ? datumRangeCell(e.vonStr, e.bisDate) : datumCell(null);
    rowsHtml.push(claimRow(datumSpalte, e.bezeichnung, e.betrag, e.rest, e.payAllocs));
    renderPayAllocs(e.payAllocs);
  }

  // Abschnitt 2: Kosten (Anwaltsvergütung → Gerichtskosten → sonstige) + PayAllocs
  for (const e of sortedKosten) {
    rowsHtml.push(claimRow(datumCell(e.datum), e.bezeichnung, e.betrag, e.rest, e.payAllocs));
    renderPayAllocs(e.payAllocs);
  }

  // Abschnitt 3: Zahlungen als Teilzahlung-Zeile (immer anzeigen, Betrag in Teilzahlung-Spalte)
  for (let zahlIdx = 0; zahlIdx < zahlungen.length; zahlIdx++) {
    const z = zahlungen[zahlIdx];
    const zBetrag = new Decimal(z.betrag || 0);
    const tilgBadge = z.tilgungsbestimmung
      ? ` <span class="badge-tilgung">Tilgungsbestimmung</span>`
      : "";
    rowsHtml.push(`<tr class="summary-row--zahlung-explicit">
      ${datumCell(z.datum)}
      <td>${escHtml(z.beschreibung || "Zahlung")}${tilgBadge}</td>
      <td class="text-end"></td>
      ${amtCell(zBetrag)}
      <td class="text-end"></td>
      <td class="text-end"></td>
    </tr>`);
  }

  const gesamtRow = `<tr class="summary-row--gesamt">
    <td></td>
    <td>Offene Forderung</td>
    ${amtCell(totForderung, "amount--gesamt")}
    ${amtCell(totZahlung.negated(), "amount--gesamt")}
    <td class="text-end"></td>
    ${amtCell(totRest, "amount--gesamt")}
  </tr>`;

  const tageszinsRow = tageszinsZeile ? `<tr class="summary-row--tageszins">
    <td></td>
    <td>${escHtml(tageszinsZeile.bezeichnung)}</td>
    <td class="text-end"></td>
    <td class="text-end"></td>
    <td class="text-end"></td>
    ${amtCell(tageszinsZeile.betrag)}
  </tr>` : "";

  const html = `<table class="summary-table">
    <thead>
      <tr>
        <th class="summary-datum-th">Datum</th>
        <th>Bezeichnung</th>
        <th class="text-end">Forderung</th>
        <th class="text-end">(Teil-)Zahlung</th>
        <th class="text-end">Anrechnung</th>
        <th class="text-end">Restforderung</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml.join("\n      ")}
      ${gesamtRow}
      ${tageszinsRow}
    </tbody>
  </table>`;
  return { html, hatTageszins: tageszinsZeile !== null };
}

/** Rendert Zins-Detailzeilen für Zinsperioden im PDF */
function renderZinsdetail(pos) {
  if (pos.typ !== "zinsperiode" || !pos.perioden || !pos.perioden.length) return "";
  // Nach JSON-Roundtrip (localStorage / Import) sind von/bis Strings, zinssatz ein String
  const zuDatum = v => v instanceof Date ? v : new Date(v);
  const zinssatzStr = v => parseFloat(v).toFixed(2).replace(".", ",");
  const zeilen = pos.perioden.map(p =>
    `${formatDate(zuDatum(p.von))}\u00a0\u2013\u00a0${formatDate(zuDatum(p.bis))} ` +
    `(${p.tage}\u00a0Tage \u00d7 ${zinssatzStr(p.zinssatz)}\u00a0% p.a. = ${formatEUR(p.zinsbetrag)})`
  ).join("<br>");
  return `<div class="zins-detail">${zeilen}</div>`;
}

function positionDetailBeschreibung(pos) {
  switch (pos.typ) {
    case "hauptforderung":
      return pos.beschreibung || "—";
    case "anwaltsverguetung": {
      const ustSatz = pos.ustSatz ?? (pos.ohneUst ? 0 : 19);
      const ustHinweis = ustSatz === 0 ? " · netto (Vorsteuer)" : ustSatz === 7 ? " · zzgl. 7\u00a0% USt" : "";
      if (pos.streitwert && pos.vvNummern && pos.vvNummern.length) {
        try {
          const { positionen: rp } = berechneRVGGesamt(
            pos.streitwert, pos.vvNummern, RVG_TABELLE, VV_DEFINITIONEN, pos.faktoren || {}
          );
          return rp.map(p => {
            const f = p.faktor != null ? parseFloat(p.faktor) : null;
            const fStr = f && !isNaN(f) ? f.toFixed(1).replace(/\.0$/, "") + "-fach" : null;
            return `${p.beschreibung}${fStr ? " (" + fStr + ")" : ""}`;
          }).join("; ") + ustHinweis;
        } catch (e) { /* fallback */ }
      }
      return (pos.vvNummern ? pos.vvNummern.join(", ") : "—") + ustHinweis;
    }
    case "zinsforderung_titel":
      return `Laufende Zinsen ab ${formatDate(parseDate(pos.zinsBis))}, ${pos.aufschlag || state.fall.aufschlagPP} PP${pos.zinsmethode === '30/360' ? ', 30/360' : ''}`;
    case "zinsperiode":
      return `Zinsen ${formatDate(parseDate(pos.zinsVon))} – ${formatDate(parseDate(pos.zinsBis))} (${pos.tage || "?"} Tage, ${pos.aufschlag || state.fall.aufschlagPP} PP${pos.zinsmethode === '30/360' ? ', 30/360' : ''})`;
    case "zahlung":
      return pos.beschreibung || "Zahlung";
    default:
      return pos.beschreibung || "—";
  }
}

// Einstellungen (Logo + Impressum) in einstellungen.js zentralisiert

// drucken, getFordifyBranding in print.js zentralisiert

