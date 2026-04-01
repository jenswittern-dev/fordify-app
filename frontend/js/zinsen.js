// ============================================================
// Verzugszinsberechnung (Port von core/zinsen.py)
// Verwendet decimal.js für exakte Dezimalarithmetik
// ============================================================

"use strict";

/**
 * Gibt den gültigen Basiszinssatz für ein Datum zurück.
 * @param {Date} datum
 * @param {Array} basiszinssaetze - Array von {gueltig_ab: "YYYY-MM-DD", satz: "x.xx"}
 * @returns {Decimal}
 * @throws {Error} wenn kein Satz vor dem Datum verfügbar
 */
function aktuellerBasiszinssatz(datum, basiszinssaetze) {
  const ts = datum.getTime();
  let gefunden = null;
  for (const eintrag of basiszinssaetze) {
    const ab = parseDate(eintrag.gueltig_ab);
    if (ab.getTime() <= ts) {
      gefunden = eintrag;
    } else {
      break;
    }
  }
  if (gefunden === null) {
    throw new Error(`Kein Basiszinssatz verfügbar für ${formatDate(datum)}`);
  }
  return new Decimal(gefunden.satz);
}

/**
 * Zerlegt den Zeitraum [von, bis] an Basiszinssatz-Wechselgrenzen (01.01 und 01.07).
 * Gibt Array von {von: Date, bis: Date} zurück.
 */
function periodenGrenzen(von, bis) {
  const grenzen = [];
  let aktuell = new Date(von);

  while (aktuell <= bis) {
    // Nächste Grenze: 01.01 oder 01.07 nach aktuellem Datum
    const jahr = aktuell.getFullYear();
    const monat = aktuell.getMonth(); // 0-basiert

    let naechsteGrenze;
    if (monat < 6) {
      naechsteGrenze = new Date(jahr, 6, 1); // 01.07 dieses Jahres
    } else {
      naechsteGrenze = new Date(jahr + 1, 0, 1); // 01.01 nächstes Jahr
    }

    const periodenEnde = naechsteGrenze > bis ? bis : new Date(naechsteGrenze.getTime() - 86400000);
    grenzen.push({ von: new Date(aktuell), bis: new Date(periodenEnde) });
    aktuell = naechsteGrenze;
  }
  return grenzen;
}

/**
 * Berechnet Verzugszinsen für einen Zeitraum, aufgeteilt nach Basiszinssatz-Perioden.
 *
 * @param {Decimal|string|number} betrag - Hauptforderung
 * @param {Date} von - Zinsbeginn (inklusiv)
 * @param {Date} bis - Zinsende (inklusiv)
 * @param {number} aufschlagPP - Aufschlag in Prozentpunkten (5 = Verbraucher, 9 = Unternehmer)
 * @param {Array} basiszinssaetze - Datensatz aus data.js
 * @param {Date|null} insoDatum - InsO-Eröffnungsdatum (kappt Zinslauf)
 * @returns {Array} Array von ZinsPeriode-Objekten
 */
function berechneVerzugszinsen(betrag, von, bis, aufschlagPP, basiszinssaetze, insoDatum = null) {
  betrag = new Decimal(betrag);

  if (von > bis) return [];

  // InsO kürzt den Zinszeitraum
  let zinsBis = bis;
  if (insoDatum !== null && insoDatum < zinsBis) {
    zinsBis = insoDatum;
  }
  if (von > zinsBis) return [];

  const perioden = periodenGrenzen(von, zinsBis);
  const ergebnis = [];

  for (const p of perioden) {
    const basisSatz = aktuellerBasiszinssatz(p.von, basiszinssaetze);
    const zinssatz = Decimal.max(basisSatz.plus(new Decimal(aufschlagPP)), new Decimal(0));
    const tage = tageDiff(p.von, p.bis);
    const zinsbetrag = betrag.times(zinssatz).dividedBy(100).times(tage).dividedBy(365).toDecimalPlaces(2);

    ergebnis.push({
      von: p.von,
      bis: p.bis,
      tage: tage,
      basiszinssatz: basisSatz,
      aufschlag: new Decimal(aufschlagPP),
      zinssatz: zinssatz,
      betrag: betrag,
      zinsbetrag: zinsbetrag,
    });
  }

  // Benachbarte Perioden mit identischem Zinssatz zusammenführen
  return zusammenfuehren(ergebnis);
}

/**
 * Berechnet den Tageszins für einen aktuellen Betrag.
 * @param {Decimal|string|number} betrag
 * @param {number} aufschlagPP
 * @param {Date} stichtag
 * @param {Array} basiszinssaetze
 * @returns {Decimal} Tageszins (gerundet auf 2 Dezimalstellen)
 */
function tageszins(betrag, aufschlagPP, stichtag, basiszinssaetze) {
  betrag = new Decimal(betrag);
  const basisSatz = aktuellerBasiszinssatz(stichtag, basiszinssaetze);
  const zinssatz = basisSatz.plus(new Decimal(aufschlagPP));
  return betrag.times(zinssatz).dividedBy(100).dividedBy(365).toDecimalPlaces(2);
}

// ---- Hilfsfunktionen ----

/**
 * Parst "YYYY-MM-DD" zu Date (UTC-Mitternacht, verhindert Zeitzonen-Offset).
 */
function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formatiert Date zu "DD.MM.YYYY".
 */
function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

/**
 * Anzahl Tage von bis inklusiv beider Grenzen.
 * (Entspricht Python: (bis - von).days + 1)
 */
function tageDiff(von, bis) {
  const ms = bis.getTime() - von.getTime();
  return Math.round(ms / 86400000) + 1;
}

/**
 * Führt benachbarte Perioden mit demselben Zinssatz zusammen.
 */
function zusammenfuehren(perioden) {
  if (perioden.length === 0) return [];
  const result = [perioden[0]];
  for (let i = 1; i < perioden.length; i++) {
    const prev = result[result.length - 1];
    const curr = perioden[i];
    if (prev.zinssatz.equals(curr.zinssatz) && prev.betrag.equals(curr.betrag)) {
      const neuTage = prev.tage + curr.tage;
      const neuZinsbetrag = prev.betrag
        .times(prev.zinssatz)
        .dividedBy(100)
        .times(neuTage)
        .dividedBy(365)
        .toDecimalPlaces(2);
      result[result.length - 1] = {
        von: prev.von,
        bis: curr.bis,
        tage: neuTage,
        basiszinssatz: prev.basiszinssatz,
        aufschlag: prev.aufschlag,
        zinssatz: prev.zinssatz,
        betrag: prev.betrag,
        zinsbetrag: neuZinsbetrag,
      };
    } else {
      result.push(curr);
    }
  }
  return result;
}
