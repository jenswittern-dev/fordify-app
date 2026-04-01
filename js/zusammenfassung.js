// ============================================================
// Zusammenfassungstabelle
// Spalten: Bezeichnung | Gefordert | Offen (nach Zahlungsverrechnung)
// ============================================================

"use strict";

/**
 * Löst Positionen für Berechnungen auf:
 * - Zinsperiode: Betrag wird dynamisch bis heute berechnet
 * - Anwaltsvergütung: Betrag wird auf netto+USt gesetzt (für Verrechnung/Summierung)
 *
 * @param {Array} positionen
 * @param {number} aufschlagPP
 * @param {Array} basiszinssaetze
 * @param {Date|null} insoDatum
 * @returns {Array} Aufgelöste Kopie der Positionen
 */
function resolvePositionen(positionen, aufschlagPP, basiszinssaetze, insoDatum) {
  const heute = new Date();
  return positionen.map(pos => {
    if (pos.typ === "zinsperiode" && pos.zinsVon && pos.hauptbetrag) {
      try {
        const perioden = berechneVerzugszinsen(
          pos.hauptbetrag, parseDate(pos.zinsVon), heute,
          pos.aufschlag || aufschlagPP, basiszinssaetze, insoDatum || null
        );
        const betrag = perioden.reduce((s, p) => s.plus(p.zinsbetrag), new Decimal(0)).toFixed(2);
        return { ...pos, betrag, perioden };
      } catch (e) { return pos; }
    }
    if (pos.typ === "anwaltsverguetung") {
      const netto = parseFloat(pos.betrag || 0);
      const ust   = parseFloat(pos.ust   || 0);
      const ustSatz = pos.ustSatz ?? (pos.ohneUst ? 0 : 19);
      const total = ustSatz > 0 ? netto + ust : netto;
      return { ...pos, betrag: total.toFixed(2) };
    }
    return pos;
  });
}

/**
 * Erstellt die Zusammenfassung für einen Fall.
 *
 * @param {Object} fall - { positionen: Array, aufschlagPP: number, insoDatum: Date|null }
 * @param {Array} basiszinssaetze - BASISZINSSAETZE aus data.js
 * @returns {Object} Zusammenfassung mit allen Zeilen und Tageszins
 */
function erstelleZusammenfassung(fall, basiszinssaetze) {
  const aufschlagPP = fall.aufschlagPP || 9;
  const insoDatum   = fall.insoDatum ? parseDate(fall.insoDatum) : null;

  // Positionen auflösen: Zinsperiode dynamisch, Anwaltsvergütung netto+USt
  const positionen = resolvePositionen(fall.positionen || [], aufschlagPP, basiszinssaetze, insoDatum);

  // Geforderte Beträge pro Kategorie
  const gefordert = {
    hauptforderung:        new Decimal(0),
    zinsen_hauptsache:     new Decimal(0),
    zinsen_kosten:         new Decimal(0),
    unverzinsliche_kosten: new Decimal(0),
    zahlungen:             new Decimal(0),
  };

  for (const pos of positionen) {
    const betrag = new Decimal(pos.betrag || 0);
    const kat = kategorieVonTyp(pos.typ);
    if (!kat) continue;
    if (pos.typ === "zahlung") {
      gefordert.zahlungen = gefordert.zahlungen.plus(betrag);
    } else {
      gefordert[kat] = gefordert[kat].plus(betrag);
    }
  }

  // Offene Beträge nach Zahlungsverrechnung (§§ 366, 367 BGB)
  let saldoFinal;
  try {
    ({ saldoFinal } = berechneVerrechnung(positionen, basiszinssaetze));
  } catch (e) {
    console.warn("berechneVerrechnung fehlgeschlagen:", e);
    saldoFinal = {};
  }
  const offen = {
    hauptforderung:        (saldoFinal && saldoFinal.hauptforderung)        || new Decimal(0),
    zinsen_hauptsache:     (saldoFinal && saldoFinal.zinsen_hauptsache)     || new Decimal(0),
    zinsen_kosten:         (saldoFinal && saldoFinal.zinsen_kosten)         || new Decimal(0),
    unverzinsliche_kosten: (saldoFinal && saldoFinal.unverzinsliche_kosten) || new Decimal(0),
  };

  // Gesamtsummen
  const gesamtGefordert = gefordert.hauptforderung
    .plus(gefordert.zinsen_hauptsache)
    .plus(gefordert.zinsen_kosten)
    .plus(gefordert.unverzinsliche_kosten);

  const gesamtOffen = offen.hauptforderung
    .plus(offen.zinsen_hauptsache)
    .plus(offen.zinsen_kosten)
    .plus(offen.unverzinsliche_kosten);

  // Tageszins auf offene Hauptforderung
  const tageszinsGefordert = berechneTagesZins(
    gefordert.hauptforderung.minus(gefordert.zahlungen),
    aufschlagPP, basiszinssaetze
  );
  const tageszinsOffen = berechneTagesZins(
    offen.hauptforderung,
    aufschlagPP, basiszinssaetze
  );

  return {
    zeilen: [
      {
        bezeichnung: "Hauptforderung",
        gefordert: gefordert.hauptforderung,
        offen: offen.hauptforderung,
      },
      {
        bezeichnung: "Zinsen (Hauptsache)",
        gefordert: gefordert.zinsen_hauptsache,
        offen: offen.zinsen_hauptsache,
      },
      {
        bezeichnung: "Zinsen (Kosten)",
        gefordert: gefordert.zinsen_kosten,
        offen: offen.zinsen_kosten,
      },
      {
        bezeichnung: "Kosten",
        gefordert: gefordert.unverzinsliche_kosten,
        offen: offen.unverzinsliche_kosten,
      },
      {
        bezeichnung: "Zwischensumme",
        gefordert: gesamtGefordert,
        offen: gesamtOffen,
        istZwischensumme: true,
      },
      {
        bezeichnung: "abzgl. Zahlungen",
        gefordert: gefordert.zahlungen.negated(),
        offen: new Decimal(0),
        istAbzug: true,
      },
      {
        bezeichnung: "Offene Forderung",
        gefordert: gesamtGefordert.minus(gefordert.zahlungen),
        offen: gesamtOffen,
        istGesamt: true,
      },
      {
        bezeichnung: "Tageszinsen ab heute (*)",
        gefordert: tageszinsGefordert,
        offen: tageszinsOffen,
        istTageszins: true,
      },
    ],
    tageszinsGefordert,
    tageszinsOffen,
    offenGefordert: gesamtGefordert.minus(gefordert.zahlungen),
    offenOffen: gesamtOffen,
    restHauptforderung: offen.hauptforderung,
  };
}

/**
 * Berechnet den aktuellen Tageszins auf den übergebenen Betrag.
 * @param {Decimal} betrag - Bereits berechnete offene Hauptforderung
 */
function berechneTagesZins(betrag, aufschlagPP, basiszinssaetze) {
  if (!betrag || betrag.lte(0)) return new Decimal(0);
  try {
    return tageszins(betrag, aufschlagPP, new Date(), basiszinssaetze);
  } catch (e) {
    return new Decimal(0);
  }
}

/**
 * Mappt Positionstyp auf Zusammenfassungskategorie.
 */
function kategorieVonTyp(typ) {
  const map = {
    hauptforderung:      "hauptforderung",
    zinsforderung_titel: "zinsen_hauptsache",
    zinsperiode:         "zinsen_hauptsache",
    anwaltsverguetung:   "unverzinsliche_kosten",
    gv_kosten:           "unverzinsliche_kosten",
    gerichtskosten:      "unverzinsliche_kosten",
    zahlungsverbot:      "unverzinsliche_kosten",
    auskunftskosten:     "unverzinsliche_kosten",
    mahnkosten:          "unverzinsliche_kosten",
    sonstige_kosten:     "unverzinsliche_kosten",
    zahlung:             "zahlungen",
  };
  return map[typ] || null;
}

/**
 * Formatiert einen Decimal-Betrag als EUR-String (z.B. "1.234,56 €").
 */
function formatEUR(d) {
  if (!d) return "0,00 €";
  const val = new Decimal(d);
  return val.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

/**
 * Formatiert einen Decimal-Betrag als Tageszins-String.
 */
function formatTageszins(d, aufschlagPP, basiszinssaetze) {
  try {
    const basisSatz = aktuellerBasiszinssatz(new Date(), basiszinssaetze);
    const zinssatz = basisSatz.plus(new Decimal(aufschlagPP));
    return `${formatEUR(d)} (${zinssatz.toFixed(2).replace(".", ",")} % p.a.)`;
  } catch (e) {
    return formatEUR(d);
  }
}
