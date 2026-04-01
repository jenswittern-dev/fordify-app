// ============================================================
// Zahlungsverrechnung §§ 366, 367 BGB (Port von core/verrechnung.py)
// Reihenfolge: Zinsen → unverzinsliche Kosten → Hauptforderung
// ============================================================

"use strict";

// Verrechnungsreihenfolge (kann per Position überschrieben werden)
const VERRECHNUNG_REIHENFOLGE = [
  "zinsen_hauptsache",
  "zinsen_kosten",
  "unverzinsliche_kosten",
  "verzinsliche_kosten",
  "hauptforderung",
];

/**
 * Verrechnet eine Zahlung gegen offene Posten.
 *
 * @param {Decimal} zahlung - Zahlungsbetrag (positiv)
 * @param {Object} offen - { hauptforderung, zinsen_hauptsache, zinsen_kosten,
 *                            unverzinsliche_kosten, verzinsliche_kosten }
 *                          Alle Werte als Decimal.
 * @param {string[]|null} reihenfolge - Optionale Überschreibung der Verrechnungsreihenfolge
 * @returns {{ verrechnet: Object, rest: Decimal }}
 *   verrechnet: Welcher Betrag gegen welche Kategorie verrechnet wurde
 *   rest: Verbleibender Zahlungsüberschuss
 */
function verrechneZahlung(zahlung, offen, reihenfolge = null) {
  zahlung = new Decimal(zahlung);
  const reihe = reihenfolge || VERRECHNUNG_REIHENFOLGE;

  const verrechnet = {};
  for (const kat of VERRECHNUNG_REIHENFOLGE) {
    verrechnet[kat] = new Decimal(0);
  }

  for (const kat of reihe) {
    if (zahlung.lte(0)) break;
    const offenBetrag = offen[kat] ? new Decimal(offen[kat]) : new Decimal(0);
    if (offenBetrag.lte(0)) continue;

    const anzurechnen = Decimal.min(zahlung, offenBetrag);
    verrechnet[kat] = verrechnet[kat].plus(anzurechnen);
    zahlung = zahlung.minus(anzurechnen);
  }

  return { verrechnet, rest: zahlung };
}

/**
 * Verarbeitet alle Positionen einer Forderungsaufstellung chronologisch
 * und berechnet den aktuellen Saldo nach jeder Position.
 *
 * @param {Array} positionen - Array von Positions-Objekten (aus app.js state)
 * @param {Array} basiszinssaetze - BASISZINSSAETZE aus data.js
 * @returns {Array} Aufgelistete Buchungen mit laufenden Salden
 */
function berechneVerrechnung(positionen, basiszinssaetze) {
  // Sortierung nach Buchungsdatum (aufsteigend)
  const sortiert = [...positionen].sort((a, b) => {
    const da = a.datum ? parseDate(a.datum) : new Date(0);
    const db = b.datum ? parseDate(b.datum) : new Date(0);
    return da - db;
  });

  // Laufende Salden
  let saldo = {
    hauptforderung: new Decimal(0),
    zinsen_hauptsache: new Decimal(0),
    zinsen_kosten: new Decimal(0),
    unverzinsliche_kosten: new Decimal(0),
    verzinsliche_kosten: new Decimal(0),
  };

  const buchungen = [];

  for (const pos of sortiert) {
    const buchung = { position: pos, saldenVorher: { ...saldo }, saldenNachher: null, verrechnet: null };

    switch (pos.typ) {
      case "hauptforderung":
        saldo.hauptforderung = saldo.hauptforderung.plus(new Decimal(pos.betrag || 0));
        break;

      case "zinsforderung_titel":
      case "zinsperiode":
        saldo.zinsen_hauptsache = saldo.zinsen_hauptsache.plus(new Decimal(pos.betrag || 0));
        break;

      case "anwaltsverguetung":
      case "gv_kosten":
      case "gerichtskosten":
      case "zahlungsverbot":
      case "auskunftskosten":
      case "mahnkosten":
      case "sonstige_kosten":
        saldo.unverzinsliche_kosten = saldo.unverzinsliche_kosten.plus(new Decimal(pos.betrag || 0));
        break;

      case "zahlung": {
        const zahlungsBetrag = new Decimal(pos.betrag || 0);
        const { verrechnet, rest } = verrechneZahlung(zahlungsBetrag, saldo, pos.verrechnungsreihenfolge || null);
        buchung.verrechnet = verrechnet;
        buchung.ueberschuss = rest;

        // Salden reduzieren
        for (const kat of VERRECHNUNG_REIHENFOLGE) {
          if (saldo[kat]) {
            saldo[kat] = saldo[kat].minus(verrechnet[kat] || new Decimal(0));
          }
        }
        break;
      }
    }

    buchung.saldenNachher = { ...saldo };
    buchungen.push(buchung);
  }

  return { buchungen, saldoFinal: saldo };
}

/**
 * Parst "YYYY-MM-DD" zu Date.
 */
function parseDate(str) {
  if (!str) return new Date(0);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Summiert alle Werte eines Salden-Objekts.
 */
function saldoGesamt(saldo) {
  return Object.values(saldo).reduce((sum, v) => sum.plus(v), new Decimal(0));
}
