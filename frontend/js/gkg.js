// fordify – GKG-Streitwertrechner-Helper
// Nutzt GKG_TABELLE aus data.js (muss vorher geladen sein).
"use strict";

/**
 * Ermittelt die 1,0-Gebühr nach GKG Anlage 2 für einen gegebenen Streitwert.
 * Über 500.000 €: 2.201 € + 108 € je angefangene weitere 30.000 €.
 * @param {number} streitwert
 * @returns {number} Gebühr in Euro
 */
function gkgGebuehr(streitwert) {
  if (!streitwert || streitwert <= 0) return 0;
  for (const zeile of GKG_TABELLE) {
    if (streitwert <= zeile.bis) return zeile.gebuehr;
  }
  const ueber = streitwert - 500000;
  return 2201 + Math.ceil(ueber / 30000) * 108;
}
