// ============================================================
// RVG-Gebührenberechnung (Port von core/rvg.py)
// Verwendet decimal.js für exakte Dezimalarithmetik
// ============================================================

"use strict";

/**
 * Ermittelt die einfache Gebühr aus der RVG-Tabelle.
 * Über 500.000 EUR: § 13 Abs. 2 RVG – je angefangene 30.000 EUR + 108 EUR.
 * @param {Decimal} streitwert
 * @param {Array} tabelle - Array von {bis: number, gebuehr: "x.xx"}
 * @returns {Decimal}
 */
function gebuehrAusTabelle(streitwert, tabelle) {
  streitwert = new Decimal(streitwert);

  for (const zeile of tabelle) {
    if (streitwert.lte(zeile.bis)) {
      return new Decimal(zeile.gebuehr);
    }
  }

  // Über Tabellenmaximum (500.000 EUR)
  const maxGebuehr = new Decimal(tabelle[tabelle.length - 1].gebuehr);
  const maxBis = new Decimal(tabelle[tabelle.length - 1].bis);
  const ueberschuss = streitwert.minus(maxBis);
  // Jede angefangene 30.000 EUR = +108 EUR
  const stufen = ueberschuss.dividedBy(30000).ceil();
  return maxGebuehr.plus(stufen.times(108));
}

/**
 * Berechnet eine einzelne RVG-Position.
 * @param {Decimal|string|number} streitwert
 * @param {string} vvNummer - z.B. "2300", "3309", "7002"
 * @param {Array} tabelle - RVG_TABELLE aus data.js
 * @param {Object} vvDef - VV_DEFINITIONEN aus data.js (optional, Standard aus data.js)
 * @param {Decimal|null} nettoGebuehrenSumme - für VV 7002 (Basis = bisher aufgelaufene Nettogebühren)
 * @returns {Object} { vvNummer, beschreibung, faktor, gebuehrEinfach, gebuehrGesamt }
 */
function berechneRVGPosition(streitwert, vvNummer, tabelle, vvDef, nettoGebuehrenSumme = null) {
  streitwert = new Decimal(streitwert);

  if (!vvDef) throw new Error(`Unbekannte VV-Nummer: ${vvNummer}`);

  let gebuehrGesamt;
  let gebuehrEinfach = null;
  let faktor = null;

  if (vvNummer === "7002") {
    // Auslagenpauschale: 20% der Nettogebühren, max. 20,00 EUR
    const basis = nettoGebuehrenSumme ? new Decimal(nettoGebuehrenSumme) : new Decimal(0);
    const zwanzig = basis.times("0.20").toDecimalPlaces(2);
    gebuehrGesamt = Decimal.min(zwanzig, new Decimal("20.00"));
  } else {
    faktor = new Decimal(vvDef.faktor);
    gebuehrEinfach = gebuehrAusTabelle(streitwert, tabelle);
    gebuehrGesamt = gebuehrEinfach.times(faktor).toDecimalPlaces(2);
  }

  return {
    vvNummer,
    beschreibung: vvDef.beschreibung,
    faktor:        faktor        ? parseFloat(faktor.toFixed(4))        : null,
    gebuehrEinfach:gebuehrEinfach? parseFloat(gebuehrEinfach.toFixed(2)): null,
    gebuehrGesamt: parseFloat(gebuehrGesamt.toFixed(2)),
  };
}

/**
 * Berechnet alle RVG-Positionen inkl. Netto, USt und Gesamt.
 * @param {Decimal|string|number} streitwert
 * @param {string[]} vvNummern - z.B. ["2300", "7002"]
 * @param {Array} tabelle - RVG_TABELLE
 * @param {Object} vvDefinitionen - VV_DEFINITIONEN
 * @param {Object} faktoren - Optionale Faktor-Überschreibungen { "2300": "1.5", ... }
 * @returns {{ positionen, netto, ust, gesamt }}
 */
function berechneRVGGesamt(streitwert, vvNummern, tabelle, vvDefinitionen, faktoren = {}) {
  streitwert = new Decimal(streitwert);

  const positionen = [];
  let netto = new Decimal(0);

  for (const vv of vvNummern) {
    const vvDef = vvDefinitionen[vv];
    if (!vvDef) throw new Error(`Unbekannte VV-Nummer: ${vv}`);

    // Überschreibe Faktor wenn vom Nutzer angegeben
    const vvDefMitFaktor = faktoren[vv]
      ? { ...vvDef, faktor: String(faktoren[vv]) }
      : vvDef;

    // 7002 bekommt die bisherige Netto-Summe als Basis
    const pos = berechneRVGPosition(streitwert, vv, tabelle, vvDefMitFaktor, vv === "7002" ? netto : null);
    positionen.push(pos);
    netto = netto.plus(pos.gebuehrGesamt);
  }

  const ust = netto.times("0.19").toDecimalPlaces(2);
  const gesamt = netto.plus(ust);

  // Decimal-Objekte bleiben für die Vorschau-Berechnung (werden nicht gespeichert)
  return { positionen, netto, ust, gesamt };
}

/**
 * Berechnet eine PKH-Position nach § 49 RVG (Vergütung aus der Staatskasse).
 * Gegenstandswert ≤ 4.000 EUR: normale Tabellengebühr.
 * Gegenstandswert > 4.000 EUR: Gebühr(4000) + 75 % × (Gebühr(actual) − Gebühr(4000)).
 */
function berechneRVGPositionPKH(streitwert, vvNummer, tabelle, vvDef, nettoGebuehrenSumme = null) {
  streitwert = new Decimal(streitwert);
  if (!vvDef) throw new Error(`Unbekannte VV-Nummer: ${vvNummer}`);

  let gebuehrGesamt;
  let gebuehrEinfach = null;
  let faktor = null;

  if (vvNummer === "7002") {
    const basis = nettoGebuehrenSumme ? new Decimal(nettoGebuehrenSumme) : new Decimal(0);
    const zwanzig = basis.times("0.20").toDecimalPlaces(2);
    gebuehrGesamt = Decimal.min(zwanzig, new Decimal("20.00"));
  } else {
    faktor = new Decimal(vvDef.faktor);
    const gebuehrNormal = gebuehrAusTabelle(streitwert, tabelle);

    if (streitwert.lte(4000)) {
      gebuehrEinfach = gebuehrNormal;
    } else {
      const g4000 = gebuehrAusTabelle(new Decimal(4000), tabelle);
      gebuehrEinfach = g4000.plus(gebuehrNormal.minus(g4000).times("0.75"));
    }
    gebuehrGesamt = gebuehrEinfach.times(faktor).toDecimalPlaces(2);
  }

  return {
    vvNummer,
    beschreibung: vvDef.beschreibung,
    faktor:        faktor        ? parseFloat(faktor.toFixed(4))        : null,
    gebuehrEinfach:gebuehrEinfach? parseFloat(gebuehrEinfach.toFixed(2)): null,
    gebuehrGesamt: parseFloat(gebuehrGesamt.toFixed(2)),
  };
}

/**
 * Berechnet alle PKH-Positionen nach § 49 RVG inkl. Netto, USt und Gesamt.
 */
function berechneRVGGesamtPKH(streitwert, vvNummern, tabelle, vvDefinitionen, faktoren = {}) {
  streitwert = new Decimal(streitwert);
  const positionen = [];
  let netto = new Decimal(0);

  for (const vv of vvNummern) {
    const vvDef = vvDefinitionen[vv];
    if (!vvDef) throw new Error(`Unbekannte VV-Nummer: ${vv}`);
    const vvDefMitFaktor = faktoren[vv] ? { ...vvDef, faktor: String(faktoren[vv]) } : vvDef;
    const pos = berechneRVGPositionPKH(streitwert, vv, tabelle, vvDefMitFaktor, vv === "7002" ? netto : null);
    positionen.push(pos);
    netto = netto.plus(pos.gebuehrGesamt);
  }

  const ust = netto.times("0.19").toDecimalPlaces(2);
  const gesamt = netto.plus(ust);
  return { positionen, netto, ust, gesamt };
}
