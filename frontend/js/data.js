// ============================================================
// Statische Stammdaten
// ============================================================

// Basiszinssätze § 247 BGB (Quelle: Deutsche Bundesbank)
// Zuletzt verifiziert: 31.03.2026
// Bitte zum 01.01. und 01.07. aktualisieren!
const BASISZINSSAETZE = [
  { gueltig_ab: "2002-01-01", satz: "2.57" },
  { gueltig_ab: "2002-07-01", satz: "2.47" },
  { gueltig_ab: "2003-01-01", satz: "1.97" },
  { gueltig_ab: "2003-07-01", satz: "1.22" },
  { gueltig_ab: "2004-01-01", satz: "1.14" },
  { gueltig_ab: "2004-07-01", satz: "1.13" },
  { gueltig_ab: "2005-01-01", satz: "1.21" },
  { gueltig_ab: "2005-07-01", satz: "1.17" },
  { gueltig_ab: "2006-01-01", satz: "1.37" },
  { gueltig_ab: "2006-07-01", satz: "1.95" },
  { gueltig_ab: "2007-01-01", satz: "2.70" },
  { gueltig_ab: "2007-07-01", satz: "3.19" },
  { gueltig_ab: "2008-01-01", satz: "3.32" },
  { gueltig_ab: "2008-07-01", satz: "3.19" },
  { gueltig_ab: "2009-01-01", satz: "1.62" },
  { gueltig_ab: "2009-07-01", satz: "0.12" },
  { gueltig_ab: "2010-01-01", satz: "0.12" },
  { gueltig_ab: "2010-07-01", satz: "0.12" },
  { gueltig_ab: "2011-01-01", satz: "0.12" },
  { gueltig_ab: "2011-07-01", satz: "0.37" },
  { gueltig_ab: "2012-01-01", satz: "0.12" },
  { gueltig_ab: "2012-07-01", satz: "0.12" },
  { gueltig_ab: "2013-01-01", satz: "-0.13" },
  { gueltig_ab: "2013-07-01", satz: "-0.38" },
  { gueltig_ab: "2014-01-01", satz: "-0.63" },
  { gueltig_ab: "2014-07-01", satz: "-0.73" },
  { gueltig_ab: "2015-01-01", satz: "-0.83" },
  { gueltig_ab: "2015-07-01", satz: "-0.83" },
  { gueltig_ab: "2016-01-01", satz: "-0.83" },
  { gueltig_ab: "2016-07-01", satz: "-0.88" },
  { gueltig_ab: "2017-01-01", satz: "-0.88" },
  { gueltig_ab: "2017-07-01", satz: "-0.88" },
  { gueltig_ab: "2018-01-01", satz: "-0.88" },
  { gueltig_ab: "2018-07-01", satz: "-0.88" },
  { gueltig_ab: "2019-01-01", satz: "-0.88" },
  { gueltig_ab: "2019-07-01", satz: "-0.88" },
  { gueltig_ab: "2020-01-01", satz: "-0.88" },
  { gueltig_ab: "2020-07-01", satz: "-0.88" },
  { gueltig_ab: "2021-01-01", satz: "-0.88" },
  { gueltig_ab: "2021-07-01", satz: "-0.88" },
  { gueltig_ab: "2022-01-01", satz: "-0.88" },
  { gueltig_ab: "2022-07-01", satz: "-0.88" },
  { gueltig_ab: "2023-01-01", satz: "1.62" },
  { gueltig_ab: "2023-07-01", satz: "3.12" },
  { gueltig_ab: "2024-01-01", satz: "3.62" },
  { gueltig_ab: "2024-07-01", satz: "3.37" },
  { gueltig_ab: "2025-01-01", satz: "2.27" },
  { gueltig_ab: "2025-07-01", satz: "1.27" },
  { gueltig_ab: "2026-01-01", satz: "1.27" },
];

// RVG-Tabelle Anlage 2 zu § 13 Abs. 1 RVG
// Quelle: BGBl. 2025 I Nr. 109, S. 30
// Verifiziert: 31.03.2026
const RVG_TABELLE = [
  { bis:    500, gebuehr: "51.50" },
  { bis:   1000, gebuehr: "93.00" },
  { bis:   1500, gebuehr: "134.50" },
  { bis:   2000, gebuehr: "176.00" },
  { bis:   3000, gebuehr: "235.50" },
  { bis:   4000, gebuehr: "295.00" },
  { bis:   5000, gebuehr: "354.50" },
  { bis:   6000, gebuehr: "414.00" },
  { bis:   7000, gebuehr: "473.50" },
  { bis:   8000, gebuehr: "533.00" },
  { bis:   9000, gebuehr: "592.50" },
  { bis:  10000, gebuehr: "652.00" },
  { bis:  13000, gebuehr: "707.00" },
  { bis:  16000, gebuehr: "762.00" },
  { bis:  19000, gebuehr: "817.00" },
  { bis:  22000, gebuehr: "872.00" },
  { bis:  25000, gebuehr: "927.00" },
  { bis:  30000, gebuehr: "1013.00" },
  { bis:  35000, gebuehr: "1099.00" },
  { bis:  40000, gebuehr: "1185.00" },
  { bis:  45000, gebuehr: "1271.00" },
  { bis:  50000, gebuehr: "1357.00" },
  { bis:  65000, gebuehr: "1456.50" },
  { bis:  80000, gebuehr: "1556.00" },
  { bis:  95000, gebuehr: "1655.50" },
  { bis: 110000, gebuehr: "1755.00" },
  { bis: 125000, gebuehr: "1854.50" },
  { bis: 140000, gebuehr: "1954.00" },
  { bis: 155000, gebuehr: "2053.50" },
  { bis: 170000, gebuehr: "2153.00" },
  { bis: 185000, gebuehr: "2252.50" },
  { bis: 200000, gebuehr: "2352.00" },
  { bis: 230000, gebuehr: "2492.00" },
  { bis: 260000, gebuehr: "2632.00" },
  { bis: 290000, gebuehr: "2772.00" },
  { bis: 320000, gebuehr: "2912.00" },
  { bis: 350000, gebuehr: "3052.00" },
  { bis: 380000, gebuehr: "3192.00" },
  { bis: 410000, gebuehr: "3332.00" },
  { bis: 440000, gebuehr: "3472.00" },
  { bis: 470000, gebuehr: "3612.00" },
  { bis: 500000, gebuehr: "3752.00" },
];

// VV-Nummern
// faktorMin/faktorMax: Gebühr ist variabel (Anwalt kann abweichen)
const VV_DEFINITIONEN = {
  "2300": { beschreibung: "Geschäftsgebühr Nr. 2300 VV RVG",       faktor: "1.3", faktorMin: 0.3, faktorMax: 2.5 },
  "3309": { beschreibung: "Verfahrensgebühr Nr. 3309 VV RVG",      faktor: "0.5", faktorMin: 0.3, faktorMax: 1.0 },
  "3100": { beschreibung: "Verfahrensgebühr Nr. 3100 VV RVG",      faktor: "1.3", faktorMin: 0.5, faktorMax: 1.8 },
  "3104": { beschreibung: "Terminsgebühr Nr. 3104 VV RVG",         faktor: "1.2" },
  "7002": { beschreibung: "Auslagenpauschale gem. Nr. 7002 VV",    faktor: null  },
};

// Aktionstypen
const AKTIONSTYPEN = {
  hauptforderung:       "Hauptforderung",
  anwaltsverguetung:    "Anwaltsvergütung",
  zinsforderung_titel:  "Zinsforderung",
  zinsperiode:          "Zinsen (Periode)",
  zahlung:              "Zahlung / Geldeingang",
  gv_kosten:            "ZV-Kosten",
  gerichtskosten:       "Gerichtskosten",
  zahlungsverbot:       "Vorläufiges Zahlungsverbot",
  auskunftskosten:      "Auskünfte",
  mahnkosten:           "Mahnkosten",
  sonstige_kosten:      "Sonstige Kosten",
};

const STANDARDKOSTEN = {
  auskunftskosten: "25.00",
  mahnkosten:      "5.00",
};

// Kategorien für Zusammenfassungstabelle
const KATEGORIEN = {
  hauptforderung:      "hauptforderung",
  anwaltsverguetung:   "unverzinsliche_kosten",
  zinsforderung_titel: "zinsen_hauptsache",
  zinsperiode:         "zinsen_hauptsache",
  zahlung:             "zahlung",
  gv_kosten:           "unverzinsliche_kosten",
  gerichtskosten:      "unverzinsliche_kosten",
  zahlungsverbot:      "unverzinsliche_kosten",
  auskunftskosten:     "unverzinsliche_kosten",
  mahnkosten:          "unverzinsliche_kosten",
  sonstige_kosten:     "unverzinsliche_kosten",
};
