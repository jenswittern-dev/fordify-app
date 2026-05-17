// ============================================================
// Forderungsaufstellung – Haupt-App
// State Management, UI-Rendering, Event-Handling
// ============================================================

"use strict";

// ---- State ----

const STORAGE_KEY_CASES       = "fordify_cases";
const STORAGE_KEY_LEGACY      = "forderungsaufstellung_state";
const STORAGE_KEY_SETTINGS    = "fordify_settings";
const STORAGE_KEY_LAST_EXPORT = "fordify_last_export";
// STORAGE_KEY_THEME in theme.js zentralisiert

function leerFall() {
  return {
    mandant: "", gegner: "", aktenzeichen: "", aufschlagPP: 9, insoDatum: null,
    forderungsgrundKat: "",
    titelArt: "", titelDatum: "", titelRechtskraft: "", titelGericht: "", titelAz: "",
    positionen: [],
  };
}

let state = {
  fall: leerFall(),
  naechsteId: 1,
  ansicht: "stammdaten",
};

// ---- Hilfsfunktionen ----

function neuId() {
  return state.naechsteId++;
}

function neuGruppeId() {
  return "g" + neuId();
}

// parseDate, formatDate, formatEUR in utils.js zentralisiert

/**
 * Erzeugt den Basisdateinamen für Fall-Exporte.
 * Schema: Forderungsaufstellung_[Gläubiger]_[Schuldner]_[YYYY-MM-DD]
 */
function exportBasisname(fall) {
  const clean = s => (s || "").replace(/[/\\:*?"<>|]/g, "").replace(/\s+/g, "_").slice(0, 40);
  const mandant = clean(fall.mandant);
  const gegner  = clean(fall.gegner);
  const datum   = new Date().toISOString().slice(0, 10);
  const teile   = ["Forderungsaufstellung"];
  if (mandant) teile.push(mandant);
  if (gegner)  teile.push(gegner);
  teile.push(datum);
  return teile.join("_");
}

// ---- Fallverwaltung (mehrere Fälle in localStorage) ----

function fallAnzeigename(fall) {
  return [fall.aktenzeichen, fall.mandant].filter(Boolean).join(" – ")
    || "Fall vom " + new Date().toLocaleDateString("de-DE");
}

function neueFallId() {
  return "f" + Date.now();
}

function ladeRegistry() {
  try {
    const raw = StorageBackend.getItem(STORAGE_KEY_CASES);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { cases: {}, currentCaseId: null };
}

function speichereRegistry(reg) {
  try {
    StorageBackend.setItem(STORAGE_KEY_CASES, JSON.stringify(reg));
  } catch (e) {
    console.warn("Speichern fehlgeschlagen:", e);
  }
}

function aktuellenFallInRegistry(reg) {
  let id = reg.currentCaseId;
  if (!id) {
    id = neueFallId();
    reg.currentCaseId = id;
  }
  reg.cases[id] = {
    id,
    name: fallAnzeigename(state.fall),
    updatedAt: new Date().toISOString(),
    fall: state.fall,
    naechsteId: state.naechsteId,
  };
  return reg;
}

function speichern() {
  const reg = aktuellenFallInRegistry(ladeRegistry());
  speichereRegistry(reg);
}

let _saveIndicatorTimer;

function speichernMitFeedback() {
  speichern();
  const ind = document.getElementById("save-indicator");
  if (!ind) return;
  // Animation neu starten: Klasse kurz entfernen → reflow → neu hinzufügen
  ind.classList.remove("visible");
  void ind.offsetWidth;
  ind.classList.add("visible");
  clearTimeout(_saveIndicatorTimer);
  _saveIndicatorTimer = setTimeout(() => ind.classList.remove("visible"), 2200);
}

/** Migriert alte Positionen auf aktuelle Formate. */
function migratePositionen(positionen) {
  if (!positionen) return positionen;
  return positionen.map(pos => {
    // Migration 1: Anwaltsvergütung auf neues Format (betrag = netto, ustSatz)
    if (pos.typ === "anwaltsverguetung" && pos.ustSatz === undefined) {
      const ustSatz = pos.ohneUst ? 0 : 19;
      const betrag = pos.netto || pos.betrag;
      return { ...pos, ustSatz, betrag };
    }
    // Migration 2: gruppeId für Hauptforderungen und Zinsperioden
    if ((pos.typ === "hauptforderung" || pos.typ === "zinsperiode") && !pos.gruppeId) {
      return { ...pos, gruppeId: "g0" };
    }
    return pos;
  });
}

function laden() {
  try {
    // Migration: alten Key in neue Registry übernehmen
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    const regRaw = StorageBackend.getItem(STORAGE_KEY_CASES);
    if (!regRaw && legacy) {
      const alt = JSON.parse(legacy);
      const id = neueFallId();
      const reg = {
        currentCaseId: id,
        cases: { [id]: { id, name: fallAnzeigename(alt.fall || {}), updatedAt: new Date().toISOString(),
                          fall: alt.fall || leerFall(), naechsteId: alt.naechsteId || 1 } },
      };
      speichereRegistry(reg);
      state.fall = reg.cases[id].fall;
      state.naechsteId = reg.cases[id].naechsteId;
      return;
    }
    if (regRaw) {
      const reg = JSON.parse(regRaw);
      const id = reg.currentCaseId;
      const eintrag = id && reg.cases[id];
      if (eintrag) {
        state.fall = eintrag.fall || leerFall();
        state.fall.positionen = migratePositionen(state.fall.positionen);
        state.naechsteId = eintrag.naechsteId || 1;
      }
    }
  } catch (e) {
    console.warn("Laden fehlgeschlagen:", e);
  }
}

// ---- Fall-Aktionen ----

function fallWechseln(id) {
  speichern();
  const reg = ladeRegistry();
  const eintrag = reg.cases[id];
  if (!eintrag) return;
  reg.currentCaseId = id;
  speichereRegistry(reg);
  state.fall = eintrag.fall || leerFall();
  state.fall.positionen = migratePositionen(state.fall.positionen);
  state.naechsteId = eintrag.naechsteId || 1;
  state.ansicht = "stammdaten";
  stammdatenLaden();
  aktualisiereNavContext();
  zeigeAnsicht("stammdaten");
  fallModalSchliessen();
  aktualisiereNaechsteFallListe();
}

function neuenFallAnlegen() {
  speichern();
  const reg = ladeRegistry();
  const id = neueFallId();
  const fall = leerFall();
  reg.cases[id] = { id, name: "Neuer Fall", updatedAt: new Date().toISOString(), fall, naechsteId: 1 };
  reg.currentCaseId = id;
  speichereRegistry(reg);
  state.fall = fall;
  state.naechsteId = 1;
  state.ansicht = "stammdaten";
  stammdatenLaden();
  aktualisiereNavContext();
  zeigeAnsicht("stammdaten");
  fallModalSchliessen();
  aktualisiereNaechsteFallListe();
}

function fallLoeschen(id) {
  const reg = ladeRegistry();
  if (!reg.cases[id]) return;
  delete reg.cases[id];
  const restIds = Object.keys(reg.cases);
  if (reg.currentCaseId === id) {
    reg.currentCaseId = restIds.length ? restIds[restIds.length - 1] : null;
  }
  speichereRegistry(reg);
  if (reg.currentCaseId) {
    fallWechseln(reg.currentCaseId);
  } else {
    neuenFallAnlegen();
  }
}

function fallExportieren() {
  if (typeof requiresPaid === 'function' && requiresPaid('json')) return;
  const data = { fall: state.fall, naechsteId: state.naechsteId, exportDatum: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportBasisname(state.fall) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

function _csvFmla(s) {
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function fallExportierenAlsExcel() {
  if (typeof requiresPaid === 'function' && requiresPaid('excel')) return;
  const fall = state.fall;
  const KOSTEN_TYPEN = ["anwaltsverguetung","gv_kosten","gerichtskosten",
    "zahlungsverbot","auskunftskosten","mahnkosten","sonstige_kosten"];

  const typLabel = {
    hauptforderung: "Hauptforderung", zinsperiode: "Zinsen",
    zinsforderung_titel: "Titulierte Zinsen", zahlung: "Zahlung",
    anwaltsverguetung: "Anwaltsvergütung", gv_kosten: "GV-Kosten",
    gerichtskosten: "Gerichtskosten", zahlungsverbot: "Zahlungsverbot",
    auskunftskosten: "Auskunftskosten", mahnkosten: "Mahnkosten",
    sonstige_kosten: "Sonstige Kosten"
  };

  const rows = [["Typ", "Datum", "Bezeichnung", "Betrag (€)"]];
  let summe = new Decimal(0);

  for (const pos of (fall.positionen || [])) {
    const label = typLabel[pos.typ] || pos.typ;
    const datum = pos.datum || "";
    const bezeichnung = pos.beschreibung || pos.bezeichnung || "";
    let betrag = new Decimal(0);

    if (pos.typ === "hauptforderung" || pos.typ === "zinsforderung_titel") {
      betrag = new Decimal(pos.betrag || 0);
      summe = summe.plus(betrag);
    } else if (KOSTEN_TYPEN.includes(pos.typ)) {
      if (pos.typ === "anwaltsverguetung") {
        const ustSatz = pos.ustSatz ?? (pos.ohneUst ? 0 : 19);
        betrag = new Decimal(parseFloat(pos.netto || pos.betrag || 0))
          .plus(ustSatz > 0 ? new Decimal(pos.ust || 0) : new Decimal(0));
      } else {
        betrag = new Decimal(pos.betrag || 0);
      }
      summe = summe.plus(betrag);
    } else if (pos.typ === "zahlung") {
      betrag = new Decimal(pos.betrag || 0).negated();
      summe = summe.minus(new Decimal(pos.betrag || 0));
    } else if (pos.typ === "zinsperiode") {
      continue; // Zinsen werden dynamisch berechnet – nicht einzeln ausgeben
    }

    rows.push([label, datum, bezeichnung, betrag.toFixed(2).replace(".", ",")]);
  }

  rows.push([]);
  rows.push(["", "", "Summe (ohne lfd. Zinsen)", summe.toFixed(2).replace(".", ",")]);
  rows.push(["", "", "Laufende Zinsen: siehe PDF-Export", ""]);

  const csv = rows.map(r =>
    r.map(cell => { const s = _csvFmla(String(cell)); return '"' + s.replace(/"/g, '""') + '"'; }).join(";")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportBasisname(fall) + ".csv";
  a.click();
  URL.revokeObjectURL(url);
  merkeExportZeitpunkt();
}

function fallImportierenDatei(input) {
  if (requiresPaid('json-import')) return;
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.fall) throw new Error("Ungültiges Format");
      speichern();
      const reg = ladeRegistry();
      const id = neueFallId();
      reg.cases[id] = { id, name: fallAnzeigename(data.fall), updatedAt: new Date().toISOString(),
                         fall: data.fall, naechsteId: data.naechsteId || 1 };
      reg.currentCaseId = id;
      speichereRegistry(reg);
      state.fall = data.fall;
      state.fall.positionen = migratePositionen(state.fall.positionen);
      state.naechsteId = data.naechsteId || 1;
      stammdatenLaden();
      aktualisiereNavContext();
      zeigeAnsicht("stammdaten");
      fallModalSchliessen();
      aktualisiereNaechsteFallListe();
    } catch (err) {
      alert("Import fehlgeschlagen: " + err.message);
    }
  };
  reader.readAsText(file);
  input.value = "";
}

function zeigeFallModal() {
  const reg = ladeRegistry();
  const cases = Object.values(reg.cases).sort((a, b) =>
    (b.updatedAt || "").localeCompare(a.updatedAt || "")
  );
  const currentId = reg.currentCaseId;
  const body = document.getElementById("modal-faelle-body");
  if (!body) return;

  body.innerHTML = cases.length === 0
    ? `<p class="text-muted small mb-0">Keine gespeicherten F\u00e4lle.</p>`
    : cases.map(c => {
        const aktiv = c.id === currentId;
        const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("de-DE") : "";
        return `<div class="d-flex align-items-center gap-2 py-2 border-bottom">
          <span class="flex-grow-1" style="font-size:var(--text-sm);font-weight:${aktiv ? "600" : "400"}">${c.name}${aktiv ? ' <span class="badge bg-primary" style="font-size:10px;vertical-align:middle">aktiv</span>' : ""}</span>
          <small class="text-muted" style="font-size:var(--text-xs);white-space:nowrap">${datum}</small>
          ${!aktiv ? `<button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:var(--text-xs)" onclick="fallWechseln('${c.id}')">Öffnen</button>` : ""}
          <button class="btn btn-sm btn-outline-danger py-0 px-1" style="font-size:var(--text-xs)" onclick="fallLoeschenBestaetigen('${c.id}')" title="Fall löschen">&times;</button>
        </div>`;
      }).join("");

  bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-faelle")).show();
}

// fordifyConfirm in fordify-confirm.js zentralisiert

function fallLoeschenBestaetigen(id) {
  fordifyConfirm('Diesen Fall wirklich löschen?', () => fallLoeschen(id));
}

function fallModalSchliessen() {
  const el = document.getElementById("modal-faelle");
  if (el) bootstrap.Modal.getInstance(el)?.hide();
}

function aktualisiereNaechsteFallListe() {
  // Aktualisiert die Fall-Liste im Modal, falls offen
  const modal = document.getElementById("modal-faelle");
  if (modal && modal.classList.contains("show")) zeigeFallModal();
}

// ---- Navigation ----

function zeigeAnsicht(name) {
  state.ansicht = name;

  const applyView = () => {
    document.querySelectorAll(".ansicht").forEach(el => {
      el.classList.add("d-none");
      el.classList.remove("ansicht--exiting");
    });
    const next = document.getElementById("ansicht-" + name);
    if (!next) return;
    next.classList.remove("d-none");
    void next.offsetWidth; // reflow → Animation neu starten
    next.classList.add("ansicht--entering");
    next.addEventListener("animationend", () => next.classList.remove("ansicht--entering"), { once: true });

    document.querySelectorAll(".stepper-step[data-ansicht]").forEach(link => {
      const isActive = link.dataset.ansicht === name;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });

    if (name === "eingabe") { renderePositionsliste(); pruefeExportReminder(); }
    if (name === "vorschau") rendereVorschau();
  };

  const prev = document.querySelector(".ansicht:not(.d-none)");
  if (prev && prev.id !== "ansicht-" + name) {
    prev.classList.add("ansicht--exiting");
    prev.addEventListener("animationend", applyView, { once: true });
  } else {
    applyView();
  }
}

// ---- Nav-Kontext ----

function aktualisiereNavContext() {
  const ctx = document.getElementById("nav-context");
  if (!ctx) return;
  const az = state.fall.aktenzeichen;
  const mandant = state.fall.mandant;
  ctx.textContent = [az, mandant].filter(Boolean).join(" – ");
}

// ---- Stammdaten ----

function stammdatenSpeichern(e) {
  e.preventDefault();
  state.fall.mandant      = document.getElementById("inp-mandant").value.trim();
  state.fall.gegner       = document.getElementById("inp-gegner").value.trim();
  state.fall.aktenzeichen = document.getElementById("inp-aktenzeichen").value.trim();
  state.fall.aufschlagPP  = parseInt(document.getElementById("inp-aufschlag").value, 10) || 9;
  state.fall.insoDatum    = document.getElementById("inp-inso-datum").value || null;

  // Forderungsgrund
  const kat = document.getElementById("inp-fg-kat").value;
  state.fall.forderungsgrundKat = kat;
  if (kat === "Vertrag") {
    state.fall.titelArt = document.getElementById("inp-fg-art-vertrag").value;
  } else if (kat === "gesetzlich") {
    state.fall.titelArt = document.getElementById("inp-fg-art-gesetzlich").value;
  } else if (kat === "Titel") {
    state.fall.titelArt         = document.getElementById("inp-titel-art").value;
    state.fall.titelDatum       = document.getElementById("inp-titel-datum").value || "";
    state.fall.titelRechtskraft = document.getElementById("inp-titel-rechtskraft").value || "";
    state.fall.titelGericht     = document.getElementById("inp-titel-gericht").value.trim();
    state.fall.titelAz          = document.getElementById("inp-titel-az").value.trim();
  } else {
    state.fall.titelArt = "";
  }
  if (kat !== "Titel") {
    state.fall.titelDatum = "";
    state.fall.titelRechtskraft = "";
    state.fall.titelGericht = "";
    state.fall.titelAz = "";
  }

  speichernMitFeedback();
  aktualisiereNavContext();
  zeigeAnsicht("eingabe");
}

function stammdatenLaden() {
  document.getElementById("inp-mandant").value      = state.fall.mandant || "";
  document.getElementById("inp-gegner").value       = state.fall.gegner || "";
  document.getElementById("inp-aktenzeichen").value = state.fall.aktenzeichen || "";
  const aufschlagVal = state.fall.aufschlagPP || 9;
  document.getElementById("inp-aufschlag").value    = aufschlagVal;
  egbgbHinweisToggle(aufschlagVal);
  document.getElementById("inp-inso-datum").value   = state.fall.insoDatum || "";
  const statusEl = document.getElementById("inp-fall-status");
  if (statusEl) statusEl.value = state.fall.fall_status || "offen";
  const notesEl = document.getElementById("inp-fall-notes");
  if (notesEl) notesEl.value = state.fall.notes || "";

  // Forderungsgrund – Backward-Compat: altes titelArt ohne forderungsgrundKat → "Titel"
  const kat = state.fall.forderungsgrundKat || (state.fall.titelArt ? "Titel" : "");
  document.getElementById("inp-fg-kat").value = kat;
  fgKatWechseln(kat);

  if (kat === "Vertrag") {
    document.getElementById("inp-fg-art-vertrag").value = state.fall.titelArt || "";
  } else if (kat === "gesetzlich") {
    document.getElementById("inp-fg-art-gesetzlich").value = state.fall.titelArt || "";
  } else if (kat === "Titel") {
    document.getElementById("inp-titel-art").value          = state.fall.titelArt || "";
    document.getElementById("inp-titel-datum").value        = state.fall.titelDatum || "";
    document.getElementById("inp-titel-rechtskraft").value  = state.fall.titelRechtskraft || "";
    document.getElementById("inp-titel-gericht").value      = state.fall.titelGericht || "";
    document.getElementById("inp-titel-az").value           = state.fall.titelAz || "";
  }
}

function fgKatWechseln(kat) {
  document.getElementById("fg-art-vertrag-wrap").classList.toggle("d-none", kat !== "Vertrag");
  document.getElementById("fg-art-gesetzlich-wrap").classList.toggle("d-none", kat !== "gesetzlich");
  document.getElementById("fg-titel-wrap").classList.toggle("d-none", kat !== "Titel");
}

// ---- Gruppen ----

let modalGruppeId = null;

/**
 * Gibt alle Hauptforderungen als Gruppen-Referenzen zurück (dedupliziert nach gruppeId).
 */
function holeGruppen() {
  const seen = new Set();
  return state.fall.positionen
    .filter(p => p.typ === "hauptforderung")
    .filter(hf => {
      if (seen.has(hf.gruppeId)) return false;
      seen.add(hf.gruppeId);
      return true;
    });
}

/**
 * Legt eine neue Rechnungsgruppe an und öffnet das Hauptforderungs-Modal.
 */
function neueRechnungsgruppe() {
  modalGruppeId = neuGruppeId();
  modalOeffnen("hauptforderung", null);
}

// ---- Undo ----

const UNDO_MAX = 20;
let undoStack = [];

function pushUndo() {
  undoStack.push({
    positionen: JSON.parse(JSON.stringify(state.fall.positionen)),
    naechsteId: state.naechsteId,
  });
  if (undoStack.length > UNDO_MAX) undoStack.shift();
  aktualisierUndoBtn();
}

function undo() {
  if (undoStack.length === 0) return;
  const snap = undoStack.pop();
  state.fall.positionen = snap.positionen;
  state.naechsteId = snap.naechsteId;
  speichernMitFeedback();
  renderePositionsliste();
  aktualisierUndoBtn();
}

function aktualisierUndoBtn() {
  const btn = document.getElementById("btn-undo");
  if (btn) btn.disabled = undoStack.length === 0;
}

// ---- Positionen ----

function positionHinzufuegen(typ) {
  if (typ === "zinsperiode") {
    const gruppen = holeGruppen();
    if (gruppen.length === 0) {
      alert("Bitte legen Sie zuerst eine Hauptforderung an.");
      return;
    }
    // Bei genau einer Gruppe: automatisch zuordnen
    modalGruppeId = gruppen.length === 1 ? gruppen[0].gruppeId : null;
  } else {
    modalGruppeId = null;
  }
  modalOeffnen(typ, null);
}

function positionBearbeiten(id) {
  const pos = state.fall.positionen.find(p => p.id === id);
  if (pos) modalOeffnen(pos.typ, pos);
}

// Inline-Confirm-Logik (ersetzt confirm())
function positionLoeschenAnfragen(id) {
  const row = document.querySelector(`tr[data-pos-id="${id}"]`);
  if (!row) return;
  const confirmEl = row.querySelector(".inline-confirm");
  const loeschenBtn = row.querySelector(".icon-btn--loeschen");
  if (confirmEl) confirmEl.classList.add("visible");
  if (loeschenBtn) loeschenBtn.style.display = "none";
  // Auto-Abbruch nach 4 Sekunden
  setTimeout(() => positionLoeschenAbbrechen(id), 4000);
}

function positionLoeschenAbbrechen(id) {
  const row = document.querySelector(`tr[data-pos-id="${id}"]`);
  if (!row) return;
  const confirmEl = row.querySelector(".inline-confirm");
  const loeschenBtn = row.querySelector(".icon-btn--loeschen");
  if (confirmEl) confirmEl.classList.remove("visible");
  if (loeschenBtn) loeschenBtn.style.display = "";
}

function positionLoeschenBestaetigen(id) {
  pushUndo();
  const pos = state.fall.positionen.find(p => p.id === id);
  const idsToRemove = new Set([id]);

  const commit = () => {
    state.fall.positionen = state.fall.positionen.filter(p => !idsToRemove.has(p.id));
    speichernMitFeedback();
    renderePositionsliste();
  };

  const doCommit = () => {
    const rows = [...idsToRemove]
      .map(rid => document.querySelector(`tr[data-pos-id="${rid}"]`))
      .filter(Boolean);
    if (rows.length > 0) {
      rows.forEach(r => r.classList.add('pos-row--removing'));
      rows[0].addEventListener('animationend', commit, { once: true });
    } else {
      commit();
    }
  };

  if (pos?.typ === 'hauptforderung' && pos.gruppeId) {
    const zugehoerig = state.fall.positionen.filter(
      p => p.typ === 'zinsperiode' && p.gruppeId === pos.gruppeId
    );
    if (zugehoerig.length > 0) {
      fordifyConfirm(
        `Diese Hauptforderung hat ${zugehoerig.length} zugehörige Zinsperiode(n). Sollen diese ebenfalls gelöscht werden?`,
        () => { zugehoerig.forEach(p => idsToRemove.add(p.id)); doCommit(); },
        { okLabel: 'Auch Zinsperioden löschen', extraLabel: 'Nur Hauptforderung', onExtra: doCommit }
      );
      return;
    }
  }
  doCommit();
}
function positionNachOben(id) {
  const idx = state.fall.positionen.findIndex(p => p.id === id);
  if (idx > 0) {
    pushUndo();
    [state.fall.positionen[idx - 1], state.fall.positionen[idx]] =
      [state.fall.positionen[idx], state.fall.positionen[idx - 1]];
    speichernMitFeedback();
    renderePositionsliste();
  }
}

function positionNachUnten(id) {
  const idx = state.fall.positionen.findIndex(p => p.id === id);
  if (idx < state.fall.positionen.length - 1) {
    pushUndo();
    [state.fall.positionen[idx], state.fall.positionen[idx + 1]] =
      [state.fall.positionen[idx + 1], state.fall.positionen[idx]];
    speichernMitFeedback();
    renderePositionsliste();
  }
}

// ---- Positionen Rendering ----

// SVG-Icons (inline)
const ICON = {
  up:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  down:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  edit:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
};

function badgeKlasse(typ) {
  return `pos-badge pos-badge--${typ}`;
}

function renderePositionsliste() {
  const tbody = document.getElementById("positionen-tbody");
  if (!tbody) return;

  // pos-count im Stepper aktualisieren
  const posCount = document.getElementById("pos-count");
  if (posCount) {
    const n = state.fall.positionen.length;
    posCount.textContent = n > 0 ? String(n) : "";
  }

  if (state.fall.positionen.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        </div>
        <p class="empty-state__title">Noch keine Positionen</p>
        <p class="empty-state__subtitle">Fügen Sie über das Dropdown eine Hauptforderung, Kosten oder Zahlung hinzu.</p>
      </div>
    </td></tr>`;
    return;
  }

  // Gruppen-Index-Map aufbauen (für Label "1", "2", …)
  const gruppenIndex = {};
  let gruppenZaehler = 0;
  for (const p of state.fall.positionen) {
    if (p.typ === "hauptforderung" && p.gruppeId && !(p.gruppeId in gruppenIndex)) {
      gruppenIndex[p.gruppeId] = ++gruppenZaehler;
    }
  }
  const hatMehreGruppen = gruppenZaehler > 1;

  tbody.innerHTML = state.fall.positionen.map((pos, idx) => {
    const typLabel = AKTIONSTYPEN[pos.typ] || pos.typ;
    const istZahlung = pos.typ === "zahlung";
    const betragStr = pos.typ === "zinsperiode"
      ? '<span style="color:var(--color-text-muted);font-size:var(--text-sm)">lfd.</span>'
      : pos.betrag ? formatEUR(pos.betrag) : "—";
    const datumStr = pos.datum ? formatDate(parseDate(pos.datum)) : "—";
    const beschrStr = escHtml(positionKurzbeschreibung(pos));
    const warnHtml = verjährungsWarnungHtml(pos);
    const last = idx === state.fall.positionen.length - 1;

    const gruppeLabel = hatMehreGruppen && pos.gruppeId && gruppenIndex[pos.gruppeId]
      ? `<span class="gruppe-label">\u00b7\u00a0${gruppenIndex[pos.gruppeId]}</span>` : "";

    return `<tr data-pos-id="${pos.id}" class="${istZahlung ? "position-row--zahlung" : ""}">
      <td><span class="${badgeKlasse(pos.typ)}">${typLabel}</span>${gruppeLabel}</td>
      <td style="color:var(--color-text-muted);font-size:var(--text-sm)">${datumStr}</td>
      <td style="font-size:var(--text-sm)">${beschrStr}${warnHtml}</td>
      <td class="text-end">
        <span class="amount">${betragStr}</span>
      </td>
      <td class="text-end" style="white-space:nowrap">
        <button class="icon-btn" onclick="positionNachOben(${pos.id})" ${idx === 0 ? "disabled" : ""} title="Nach oben" aria-label="Nach oben">${ICON.up}</button>
        <button class="icon-btn" onclick="positionNachUnten(${pos.id})" ${last ? "disabled" : ""} title="Nach unten" aria-label="Nach unten">${ICON.down}</button>
        <button class="icon-btn icon-btn--edit" onclick="positionBearbeiten(${pos.id})" title="Bearbeiten" aria-label="Bearbeiten">${ICON.edit}</button>
        <button class="icon-btn icon-btn--loeschen icon-btn--danger" onclick="positionLoeschenAnfragen(${pos.id})" title="Löschen" aria-label="Löschen">${ICON.trash}</button>
        <span class="inline-confirm">
          <span class="inline-confirm__text">Löschen?</span>
          <button class="icon-btn icon-btn--danger" onclick="positionLoeschenBestaetigen(${pos.id})">Ja</button>
          <button class="icon-btn" onclick="positionLoeschenAbbrechen(${pos.id})">Nein</button>
        </span>
      </td>
    </tr>`;
  }).join("");

  // Stagger-Index als CSS Custom Property setzen (für row-in Animation)
  tbody.querySelectorAll("tr[data-pos-id]").forEach((row, i) => {
    row.style.setProperty("--row-idx", i);
  });
}

function positionKurzbeschreibung(pos) {
  switch (pos.typ) {
    case "hauptforderung": return pos.beschreibung || "—";
    case "zinsforderung_titel": return `Laufend ab ${formatDate(parseDate(pos.zinsBis))}`;
    case "zinsperiode": return `Zinsen ab ${formatDate(parseDate(pos.zinsVon))}`;
    case "anwaltsverguetung": {
      const ustSatz = pos.ustSatz ?? (pos.ohneUst ? 0 : 19);
      const ustHint = ustSatz === 0 ? "· netto" : `· zzgl. ${ustSatz}\u00a0% USt`;
      return (pos.vvNummern ? pos.vvNummern.join(", ") : "—") + " " + ustHint;
    }
    case "zahlung": return pos.beschreibung || "Zahlung";
    default: return pos.beschreibung || "—";
  }
}

/**
 * Gibt ein Warn-Icon zurück, wenn eine Zinsforderung möglicherweise verjährt ist (§ 197 BGB: 3 Jahre).
 * Betroffen: zinsperiode (ab zinsVon) und zinsforderung_titel (ab datum).
 */
function verjährungsWarnungHtml(pos) {
  const DREI_JAHRE_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;
  let refDatumStr = null;
  if (pos.typ === "zinsperiode") refDatumStr = pos.zinsVon;
  else if (pos.typ === "zinsforderung_titel") refDatumStr = pos.datum;
  if (!refDatumStr) return "";
  const refDatum = parseDate(refDatumStr);
  if (!refDatum) return "";
  if (Date.now() - refDatum.getTime() > DREI_JAHRE_MS) {
    return `<span class="verjaerungs-warnung" title="Mögliche Verjährung: Zinsforderungen verjähren gem. § 197 BGB in 3 Jahren (ab ${formatDate(refDatum)})">⚠</span>`;
  }
  return "";
}

// ---- Modal ----

let modalAktuellePos = null;
let modalTyp = null;

function modalOeffnen(typ, pos) {
  modalTyp = typ;
  modalAktuellePos = pos;

  const modalEl = document.getElementById("modal-position");
  const modalTitle = document.getElementById("modal-titel");
  const modalBody = document.getElementById("modal-body");
  const previewContainer = document.getElementById("modal-preview-container");

  // Typ-Badge im Header
  const badge = document.getElementById("modal-typ-badge");
  if (badge) {
    badge.className = badgeKlasse(typ);
    badge.textContent = AKTIONSTYPEN[typ] || typ;
  }

  modalTitle.textContent = pos ? "Bearbeiten" : "Neue Position";
  modalBody.innerHTML = renderModalInhalt(typ, pos);
  if (previewContainer) previewContainer.innerHTML = "";

  // Events für dynamische Vorschau
  modalBody.querySelectorAll("[data-onchange]").forEach(el => {
    el.addEventListener("change", () => modalDynamischAktualisieren(typ));
    el.addEventListener("input", () => modalDynamischAktualisieren(typ));
  });

  // Checkbox-Events separat
  modalBody.querySelectorAll(".mf-vv-check").forEach(cb => {
    cb.addEventListener("change", () => modalDynamischAktualisieren(typ));
  });

  modalDynamischAktualisieren(typ);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function renderModalInhalt(typ, pos) {
  switch (typ) {
    case "hauptforderung":       return tplHauptforderung(pos);
    case "anwaltsverguetung":    return tplAnwalt(pos);
    case "zinsforderung_titel":  return tplZinsforderungTitel(pos);
    case "zinsperiode":          return tplZinsperiode(pos);
    case "zahlung":              return tplZahlung(pos);
    case "gv_kosten":            return tplEinfacheKosten(pos, "ZV-Kosten (Gerichtsvollzieher)", "");
    case "gerichtskosten":       return tplGerichtskosten(pos);
    case "zahlungsverbot":       return tplEinfacheKosten(pos, "Vorläufiges Zahlungsverbot", "");
    case "auskunftskosten":      return tplEinfacheKosten(pos, "Auskunftskosten", STANDARDKOSTEN.auskunftskosten);
    case "mahnkosten":           return tplEinfacheKosten(pos, "Mahnkosten", STANDARDKOSTEN.mahnkosten);
    case "inkassopauschale":     return tplInkassopauschale(pos);
    case "sonstige_kosten":      return tplEinfacheKosten(pos, "Sonstige Kosten", "");
    case "wiederkehrend":        return tplWiederkehrend(pos);
    default: return "<p>Unbekannter Typ.</p>";
  }
}

function modalSpeichern() {
  const pos = modalDatenLesen();
  if (!pos) return;

  // Sonderfall: Wiederkehrende Buchungen → mehrere Einzelpositionen erzeugen
  if (pos.typ === "wiederkehrend") {
    pushUndo();
    const start = parseDate(pos.datum);
    const intervallMonate = { monatlich: 1, quartalsweise: 3, halbjaehrlich: 6, jaehrlich: 12 };
    const monate = intervallMonate[pos.wkIntervall] || 1;
    for (let i = 0; i < pos.wkAnzahl; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i * monate, start.getDate());
      const datum = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      state.fall.positionen.push({
        id: neuId(),
        typ: pos.wkTyp,
        datum,
        beschreibung: pos.beschreibung,
        betrag: pos.betrag,
        tituliert: pos.tituliert,
      });
    }
    speichernMitFeedback();
    renderePositionsliste();
    const modalEl = document.getElementById("modal-position");
    bootstrap.Modal.getInstance(modalEl)?.hide();
    return;
  }

  pushUndo();

  if (modalAktuellePos) {
    const idx = state.fall.positionen.findIndex(p => p.id === modalAktuellePos.id);
    if (idx !== -1) {
      const merged = { ...pos, id: modalAktuellePos.id };
      // gruppeId beim Bearbeiten erhalten
      if (modalAktuellePos.gruppeId) merged.gruppeId = modalAktuellePos.gruppeId;
      state.fall.positionen[idx] = merged;
    }
  } else {
    pos.id = neuId();
    // gruppeId für neue Hauptforderungen und Zinsperioden setzen
    if ((pos.typ === "hauptforderung" || pos.typ === "zinsperiode") && !pos.gruppeId) {
      pos.gruppeId = modalGruppeId || "g0";
    }
    modalGruppeId = null;
    state.fall.positionen.push(pos);
  }

  speichernMitFeedback();
  renderePositionsliste();

  const modalEl = document.getElementById("modal-position");
  bootstrap.Modal.getInstance(modalEl)?.hide();
}

function modalDatenLesen() {
  const v = id => document.getElementById(id)?.value?.trim() || "";
  const f = id => document.getElementById(id);

  const basis = {
    typ: modalTyp,
    datum: v("mf-datum"),
    beschreibung: v("mf-beschreibung"),
    tituliert: f("mf-tituliert")?.checked || false,
  };

  switch (modalTyp) {
    case "hauptforderung":
      return { ...basis, betrag: v("mf-betrag") };

    case "anwaltsverguetung": {
      const streitwert = v("mf-streitwert");
      const vvNummern = [...document.querySelectorAll(".mf-vv-check:checked")].map(cb => cb.value);
      if (!streitwert || !vvNummern.length) {
        zeigeModalFehler("mf-streitwert", "Bitte Streitwert und mindestens eine VV-Nummer angeben.");
        return null;
      }
      const faktoren = {};
      document.querySelectorAll(".mf-vv-faktor").forEach(inp => {
        if (inp.value) faktoren[inp.dataset.vv] = inp.value;
      });
      const ustSatz = parseInt(document.getElementById("mf-ust-satz")?.value ?? "19", 10);
      const { positionen: rvgPos, netto, ust: ust19 } = berechneRVGGesamt(
        streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN, faktoren
      );
      // USt nach gewähltem Satz berechnen (berechneRVGGesamt verwendet intern immer 19 %)
      const ust = ustSatz === 0 ? new Decimal(0)
                : ustSatz === 7 ? netto.times("0.07").toDecimalPlaces(2)
                : ust19;
      const betrag = netto.toFixed(2);  // Betrag = Netto (USt wird separat ausgewiesen)
      return { ...basis, streitwert, vvNummern, faktoren, ustSatz, ohneUst: ustSatz === 0, netto: netto.toFixed(2), ust: ust.toFixed(2), betrag };
    }

    case "zinsforderung_titel":
      return {
        ...basis,
        zinsBis: v("mf-zins-bis"),
        aufschlag: parseInt(v("mf-aufschlag"), 10) || state.fall.aufschlagPP,
        zinsmethode: v("mf-zinsmethode") || 'act/365',
        betrag: v("mf-betrag"),
      };

    case "zinsperiode": {
      const betrag = v("mf-hauptbetrag");
      const von = v("mf-zins-von");
      const bis = v("mf-zins-bis") || new Date().toISOString().slice(0, 10);
      const aufschlag = parseInt(v("mf-aufschlag"), 10) || state.fall.aufschlagPP;
      if (!betrag || !von) {
        zeigeModalFehler(!betrag ? "mf-hauptbetrag" : "mf-zins-von",
          "Bitte Betrag und Startdatum angeben.");
        return null;
      }
      const insoDatum = state.fall.insoDatum ? parseDate(state.fall.insoDatum) : null;
      const methode = v("mf-zinsmethode") || 'act/365';
      const perioden = berechneVerzugszinsen(
        betrag, parseDate(von), parseDate(bis), aufschlag, BASISZINSSAETZE, insoDatum, methode
      );
      const gesamtBetrag = perioden.reduce((s, p) => s.plus(p.zinsbetrag), new Decimal(0));
      const gruppeIdFromDropdown = v("mf-gruppe") || null;
      return {
        ...basis,
        hauptbetrag: betrag,
        zinsVon: von,
        zinsBis: bis,
        aufschlag,
        zinsmethode: v("mf-zinsmethode") || 'act/365',
        perioden,
        betrag: gesamtBetrag.toFixed(2),
        tage: perioden.reduce((s, p) => s + p.tage, 0),
        ...(gruppeIdFromDropdown ? { gruppeId: gruppeIdFromDropdown } : {}),
      };
    }

    case "zahlung": {
      const verrAnw = document.getElementById("mf-verrechnungsanweisung")?.value?.trim() || "";
      const tilgungsbestimmung = document.getElementById("mf-tilgungsbestimmung")?.checked || false;
      const zielRaw = tilgungsbestimmung
        ? (document.getElementById("mf-tilgung-zielId")?.value || "")
        : "";
      const tilgungsHFId = zielRaw.startsWith("hf-id:") ? parseInt(zielRaw.slice(6)) : null;
      const tilgungsKostenId = zielRaw.startsWith("k:") ? zielRaw.slice(2) : null;
      const tilgungsZinsHFId = zielRaw.startsWith("z-hf:") ? parseInt(zielRaw.slice(5)) : null;
      const tilgungsZtId = zielRaw.startsWith("zt:") ? parseInt(zielRaw.slice(3)) : null;
      const tilgungsBetragRaw = tilgungsbestimmung
        ? (document.getElementById("mf-tilgung-betrag")?.value?.trim() || "")
        : "";
      const tilgungsBetrag = tilgungsBetragRaw && parseFloat(tilgungsBetragRaw) > 0
        ? tilgungsBetragRaw
        : null;
      const hatZiel = tilgungsHFId || tilgungsKostenId || tilgungsZinsHFId || tilgungsZtId;
      return {
        ...basis,
        betrag: v("mf-betrag"),
        ...(tilgungsbestimmung && hatZiel ? {
          tilgungsbestimmung: true,
          ...(tilgungsHFId ? { tilgungsHFId } : {}),
          ...(tilgungsKostenId ? { tilgungsKostenId } : {}),
          ...(tilgungsZinsHFId ? { tilgungsZinsHFId } : {}),
          ...(tilgungsZtId ? { tilgungsZtId } : {}),
          ...(tilgungsBetrag ? { tilgungsBetrag } : {})
        } : tilgungsbestimmung ? { tilgungsbestimmung: true } : {}),
        ...(verrAnw ? { verrechnungsanweisung: verrAnw } : {})
      };
    }

    case "gerichtskosten": {
      const verfahrenSel = document.getElementById("mf-gkg-verfahren")?.value || "3.0";
      const isCustom = verfahrenSel === "custom";
      const gkgVerfahren = isCustom
        ? (document.getElementById("mf-gkg-faktor")?.value?.trim() || "3.0")
        : verfahrenSel;
      return {
        ...basis,
        betrag: v("mf-betrag"),
        gkgStreitwert: document.getElementById("mf-gkg-streitwert")?.value?.trim() || "",
        gkgVerfahren,
      };
    }

    case "wiederkehrend": {
      const betrag = v("mf-betrag");
      const startdatum = v("mf-datum");
      const anzahl = parseInt(document.getElementById("mf-wk-anzahl")?.value, 10) || 2;
      const intervall = document.getElementById("mf-wk-intervall")?.value || "monatlich";
      const wkTyp = document.getElementById("mf-wk-typ")?.value || "zahlung";
      if (!betrag || !startdatum) {
        zeigeModalFehler(!betrag ? "mf-betrag" : "mf-datum", "Bitte Betrag und Startdatum angeben.");
        return null;
      }
      return { ...basis, typ: "wiederkehrend", betrag, wkTyp, wkAnzahl: anzahl, wkIntervall: intervall };
    }

    default:
      return { ...basis, betrag: v("mf-betrag") };
  }
}

function zeigeModalFehler(feldId, meldung) {
  document.querySelectorAll(".modal-fehler").forEach(el => el.remove());
  document.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  if (feldId) document.getElementById(feldId)?.classList.add("is-invalid");
  const ziel = feldId
    ? document.getElementById(feldId)?.closest(".mb-3")
    : document.getElementById("modal-body");
  if (ziel) {
    const div = document.createElement("div");
    div.className = "alert alert-danger py-1 px-2 mt-1 small modal-fehler";
    div.textContent = meldung;
    ziel.appendChild(div);
  }
}

function modalDynamischAktualisieren(typ) {
  if (typ === "anwaltsverguetung") {
    const streitwert = document.getElementById("mf-streitwert")?.value?.trim();
    const vvNummern = [...document.querySelectorAll(".mf-vv-check:checked")].map(cb => cb.value);
    const container = document.getElementById("modal-preview-container");
    if (!container) return;

    if (!streitwert || !vvNummern.length) {
      container.innerHTML = "";
      return;
    }
    try {
      const faktoren = {};
      document.querySelectorAll(".mf-vv-faktor").forEach(inp => {
        if (inp.value) faktoren[inp.dataset.vv] = inp.value;
      });
      const ustSatzVorschau = parseInt(document.getElementById("mf-ust-satz")?.value ?? "19", 10);
      const { positionen, netto, ust: ust19 } = berechneRVGGesamt(
        streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN, faktoren
      );
      const ustVorschau = ustSatzVorschau === 0 ? new Decimal(0)
                        : ustSatzVorschau === 7  ? netto.times("0.07").toDecimalPlaces(2)
                        : ust19;
      const gesamtVorschau = netto.plus(ustVorschau);

      // Basis für VV 7002 = Netto ohne Auslagenpauschale selbst
      const nettoOhne7002 = positionen
        .filter(p => p.vvNummer !== "7002")
        .reduce((s, p) => s.plus(new Decimal(p.gebuehrGesamt)), new Decimal(0));

      const posRows = positionen.map(p => {
        let detail = "";
        if (p.vvNummer === "7002") {
          const gekappt = nettoOhne7002.times("0.20").toDecimalPlaces(2).gt(new Decimal("20.00"));
          detail = `<span class="text-muted ms-1" style="font-size:var(--text-xs)">20\u00a0% von\u00a0${formatEUR(nettoOhne7002)}${gekappt ? ", max.\u00a020,00\u00a0€" : ""}</span>`;
        } else if (p.faktor != null && p.gebuehrEinfach != null) {
          const fStr = parseFloat(p.faktor).toFixed(1).replace(/\.0$/, "");
          detail = `<span class="text-muted ms-1" style="font-size:var(--text-xs)">${fStr}-fach\u00a0×\u00a0${formatEUR(p.gebuehrEinfach)}</span>`;
        }
        return `<div class="d-flex justify-content-between align-items-baseline mb-1">
          <span style="flex:1">${p.beschreibung} ${detail}</span>
          <span class="amount ms-3" style="white-space:nowrap;font-variant-numeric:tabular-nums">${formatEUR(p.gebuehrGesamt)}</span>
        </div>`;
      }).join("");

      const ustLabel = ustSatzVorschau === 0
        ? `<span class="text-muted" style="font-size:var(--text-xs)">Ohne USt (Vorsteuer)</span>`
        : `<div class="d-flex justify-content-between mb-1" style="color:var(--color-text-muted)">
            <span>zzgl.\u00a0${ustSatzVorschau}\u00a0% USt</span>
            <span class="amount">${formatEUR(ustVorschau)}</span>
           </div>`;

      container.innerHTML = `<div class="modal-preview-area">
        <div class="modal-preview-area__label">Vorschau</div>
        ${posRows}
        <div style="border-top:1px solid var(--color-border);margin:0.5rem 0 0.4rem"></div>
        <div class="d-flex justify-content-between mb-1">
          <span>Netto</span>
          <span class="amount">${formatEUR(netto)}</span>
        </div>
        ${ustLabel}
        <div class="d-flex justify-content-between" style="font-weight:600;border-top:1px solid var(--color-border);padding-top:0.4rem;margin-top:0.25rem">
          <span>Gesamt</span>
          <span class="amount">${formatEUR(gesamtVorschau)}</span>
        </div>
      </div>`;
    } catch (e) {
      container.innerHTML = `<div class="modal-preview-area"><p class="text-danger small mb-0">${escHtml(e?.message || '')}</p></div>`;
    }
  }

  if (typ === "gerichtskosten") {
    const streitwertRaw = document.getElementById("mf-gkg-streitwert")?.value?.trim();
    const verfahrenSel = document.getElementById("mf-gkg-verfahren")?.value;
    const customWrap = document.getElementById("gkg-custom-wrap");
    const isCustom = verfahrenSel === "custom";
    if (customWrap) customWrap.classList.toggle("d-none", !isCustom);
    const faktor = isCustom
      ? parseFloat(document.getElementById("mf-gkg-faktor")?.value || "0")
      : parseFloat(verfahrenSel || "0");
    const ergebnisEl = document.getElementById("gkg-ergebnis");
    if (streitwertRaw && !isNaN(parseFloat(streitwertRaw)) && faktor > 0) {
      const sw = parseGermanDecimal(streitwertRaw);
      const basis = gkgGebuehr(sw);
      const gesamt = basis * faktor;
      const betragEl = document.getElementById("mf-betrag");
      if (betragEl) betragEl.value = gesamt.toFixed(2);
      const basisEl = document.getElementById("gkg-basis");
      const gesamtEl = document.getElementById("gkg-gesamt");
      if (basisEl) basisEl.textContent = formatEUR(basis.toFixed(2));
      if (gesamtEl) gesamtEl.textContent = formatEUR(gesamt.toFixed(2));
      if (ergebnisEl) ergebnisEl.classList.remove("d-none");
    } else {
      if (ergebnisEl) ergebnisEl.classList.add("d-none");
    }
  }

  if (typ === "zinsperiode") {
    const betrag = document.getElementById("mf-hauptbetrag")?.value?.trim();
    const von = document.getElementById("mf-zins-von")?.value;
    const bis = document.getElementById("mf-zins-bis")?.value;
    const aufschlag = parseInt(document.getElementById("mf-aufschlag")?.value, 10) || state.fall.aufschlagPP;
    const container = document.getElementById("modal-preview-container");
    if (!container) return;

    if (!betrag || !von || !bis) {
      container.innerHTML = "";
      return;
    }
    try {
      const insoDatum = state.fall.insoDatum ? parseDate(state.fall.insoDatum) : null;
      const methode = document.getElementById("mf-zinsmethode")?.value || 'act/365';
      const perioden = berechneVerzugszinsen(
        betrag, parseDate(von), parseDate(bis), aufschlag, BASISZINSSAETZE, insoDatum, methode
      );
      container.innerHTML = "";  // Berechnungsergebnis wird im Hintergrund berechnet, nicht angezeigt
    } catch (e) {
      container.innerHTML = `<div class="modal-preview-area"><p class="text-danger small mb-0">${escHtml(e?.message || '')}</p></div>`;
    }
  }
}

// Modal-Templates (Cluster H) in modal-templates.js zentralisiert
// Vorschau + Summary-Tabelle (Cluster I) in summary.js zentralisiert

// ---- Zurücksetzen ----

function fallZuruecksetzen() {
  const modal = new bootstrap.Modal(document.getElementById("confirmNeuModal"));
  document.getElementById("confirmNeuBtn").onclick = () => {
    modal.hide();
    neuenFallAnlegen();
  };
  modal.show();
}

// ---- Init ----

document.addEventListener("DOMContentLoaded", () => {
  themeLaden();
  laden();
  stammdatenLaden();
  aktualisiereNavContext();
  zeigeAnsicht(state.ansicht || "stammdaten");

  // Stammdaten-Formular
  document.getElementById("form-stammdaten")?.addEventListener("submit", stammdatenSpeichern);

  // Stepper-Navigation
  document.querySelectorAll(".stepper-step[data-ansicht]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      zeigeAnsicht(link.dataset.ansicht);
    });
  });

  // Modal-Speichern-Button
  document.getElementById("btn-modal-speichern")?.addEventListener("click", modalSpeichern);

  // Modal: dynamische Aktualisierung
  document.getElementById("modal-body")?.addEventListener("input", e => {
    if (e.target.dataset.onchange) modalDynamischAktualisieren(modalTyp);
  });
  document.getElementById("modal-body")?.addEventListener("change", e => {
    if (e.target.dataset.onchange || e.target.classList.contains("mf-vv-check"))
      modalDynamischAktualisieren(modalTyp);
  });

  // Strg+Z Undo
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      // Nicht auslösen wenn ein Eingabefeld fokussiert ist
      const tag = document.activeElement?.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        undo();
      }
    }
  });

  // Onboarding beim ersten Aufruf
  if (!localStorage.getItem("fordify_onboarded")) {
    setTimeout(() => {
      const m = document.getElementById("modal-onboarding");
      if (m) new bootstrap.Modal(m).show();
    }, 400);
  }
});

function onboardingBestaetigen() {
  localStorage.setItem("fordify_onboarded", "1");
  bootstrap.Modal.getInstance(document.getElementById("modal-onboarding"))?.hide();
}

function egbgbHinweisToggle(val) {
  const el = document.getElementById("hinweis-egbgb");
  if (el) el.classList.toggle("d-none", String(val) !== "9");
}

// ---- Theme ----

// themeWechseln, themeLaden in theme.js zentralisiert

// ---- Export-Reminder ----

function merkeExportZeitpunkt() {
  localStorage.setItem(STORAGE_KEY_LAST_EXPORT, new Date().toISOString());
  document.getElementById("export-reminder")?.classList.add("d-none");
}

function pruefeExportReminder() {
  const el = document.getElementById("export-reminder");
  if (!el) return;
  if (state.fall.positionen.length === 0) { el.classList.add("d-none"); return; }
  const last = localStorage.getItem(STORAGE_KEY_LAST_EXPORT);
  if (!last) { el.classList.remove("d-none"); return; }
  const tage = (Date.now() - new Date(last).getTime()) / 86400000;
  el.classList.toggle("d-none", tage <= 7);
}

function exportReminderDismiss() {
  merkeExportZeitpunkt();
}

// gkgGebuehr in gkg.js zentralisiert

/**
 * Teilt den aktuellen Fall als JSON-Datei über die Web Share API (mobile)
 * oder löst einen Download aus (Desktop-Fallback).
 */
async function falTeilen() {
  const reg = ladeRegistry();
  const fallId = reg.currentCaseId;
  if (!fallId || !reg.cases[fallId]) {
    alert("Bitte speichern Sie den Fall zuerst.");
    return;
  }
  const payload = { fall: state.fall, naechsteId: state.naechsteId };
  const json = JSON.stringify(payload, null, 2);
  const filename = exportBasisname(state.fall) + ".json";
  const blob = new Blob([json], { type: "application/json" });

  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "application/json" })] })) {
    try {
      const parteien = [state.fall.mandant, state.fall.gegner].filter(Boolean).join(" ./. ");
      await navigator.share({
        title: "Forderungsaufstellung" + (parteien ? " – " + parteien : ""),
        text: "Erstellt mit fordify.de",
        files: [new File([blob], filename, { type: "application/json" })],
      });
      merkeExportZeitpunkt();
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // Nutzer hat abgebrochen
    }
  }

  // Fallback: direkter Download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  merkeExportZeitpunkt();
}

// ============================================================
// ZV-Auftrag (§ 753 ZPO) – Feature 5.7
// ============================================================

async function zeigeZVModal() {
  if (requiresPaid('zv-auftrag')) return;

  // Vorschau mit aktuellen Fall-Daten befüllen
  const f = state.fall;
  _setVal('zv-prev-schuldner',     f.gegner        || '');
  _setVal('zv-prev-az',            f.aktenzeichen  || '');
  _setVal('zv-prev-titel-art',     f.titelArt      || '');
  _setVal('zv-prev-titel-gericht', f.titelGericht  || '');
  _setVal('zv-prev-titel-az',      f.titelAz       || '');

  // Fehleranzeige zurücksetzen
  const err = document.getElementById('zv-fehler');
  if (err) { err.classList.add('d-none'); err.textContent = ''; }

  // Lazy-load pdf-lib
  if (!window.PDFLib) {
    const btn = document.getElementById('btn-zv-erstellen');
    if (btn) btn.textContent = 'Lade…';
    try {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = '/js/pdf-lib.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    } catch(_) {}
    if (btn) btn.textContent = 'PDF erstellen & herunterladen';
  }

  const modal = new bootstrap.Modal(document.getElementById('zvModal'));
  modal.show();
}

function _setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

async function erstelleZVAuftragJetzt() {
  const btn = document.getElementById('btn-zv-erstellen');
  const err = document.getElementById('zv-fehler');
  if (err) { err.classList.add('d-none'); err.textContent = ''; }

  const zvFelder = {
    gvName:             (document.getElementById('zv-gv-name')?.value   || '').trim(),
    gvStrasse:          (document.getElementById('zv-gv-strasse')?.value || '').trim(),
    gvPlzOrt:           (document.getElementById('zv-gv-plzort')?.value  || '').trim(),
    sachpfaendung:      document.getElementById('zv-ma-sachpfaendung')?.checked || false,
    vermoegensauskunft: document.getElementById('zv-ma-vermoegen')?.checked    || false,
    forderungspfaendung:document.getElementById('zv-ma-forderung')?.checked    || false,
  };

  const settingsRaw = StorageBackend.getItem(STORAGE_KEY_SETTINGS);
  const einst = settingsRaw ? JSON.parse(settingsRaw) : {};

  if (btn) { btn.disabled = true; btn.textContent = 'Erstelle PDF…'; }
  try {
    await erstelleZVAuftrag(state.fall, einst, zvFelder);
    const modal = bootstrap.Modal.getInstance(document.getElementById('zvModal'));
    if (modal) modal.hide();
    trackEvent('zv-auftrag-erstellt');
  } catch(e) {
    if (err) { err.textContent = 'Fehler: ' + (e.message || 'Unbekannter Fehler'); err.classList.remove('d-none'); }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'PDF erstellen & herunterladen'; }
  }
}

function fallStatusSpeichern() {
  const el = document.getElementById('inp-fall-status');
  if (!el) return;
  state.fall.fall_status = el.value;
  speichern();
}

function fallNotizenSpeichern() {
  const el = document.getElementById('inp-fall-notes');
  if (!el) return;
  state.fall.notes = el.value;
  speichern();
}
