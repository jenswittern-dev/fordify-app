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
const STORAGE_KEY_THEME       = "fordify_theme";

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

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function formatEUR(val) {
  if (val === null || val === undefined) return "";
  const d = new Decimal(val);
  const parts = d.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",") + "\u00a0€";
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
    const raw = localStorage.getItem(STORAGE_KEY_CASES);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { cases: {}, currentCaseId: null };
}

function speichereRegistry(reg) {
  try {
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(reg));
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
    const regRaw = localStorage.getItem(STORAGE_KEY_CASES);
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
  const data = { fall: state.fall, naechsteId: state.naechsteId, exportDatum: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const name = fallAnzeigename(state.fall).replace(/[/\\:*?"<>|]/g, "_");
  a.download = (name || "fall") + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

function fallImportierenDatei(input) {
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

function fallLoeschenBestaetigen(id) {
  if (confirm("Diesen Fall wirklich löschen?")) fallLoeschen(id);
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

  if (pos?.typ === "hauptforderung" && pos.gruppeId) {
    const zugehoerig = state.fall.positionen.filter(
      p => p.typ === "zinsperiode" && p.gruppeId === pos.gruppeId
    );
    if (zugehoerig.length > 0) {
      if (confirm(`Diese Hauptforderung hat ${zugehoerig.length} zugeh\u00f6rige Zinsperiode(n).\nSollen diese ebenfalls gel\u00f6scht werden?`)) {
        zugehoerig.forEach(p => idsToRemove.add(p.id));
      }
    }
  }

  const commit = () => {
    state.fall.positionen = state.fall.positionen.filter(p => !idsToRemove.has(p.id));
    speichernMitFeedback();
    renderePositionsliste();
  };

  const rows = [...idsToRemove]
    .map(rid => document.querySelector(`tr[data-pos-id="${rid}"]`))
    .filter(Boolean);

  if (rows.length > 0) {
    rows.forEach(r => r.classList.add("pos-row--removing"));
    rows[0].addEventListener("animationend", commit, { once: true });
  } else {
    commit();
  }
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
      ? '<span style="font-style:italic;color:var(--color-text-muted);font-size:var(--text-sm)">lfd.</span>'
      : pos.betrag ? formatEUR(pos.betrag) : "—";
    const datumStr = pos.datum ? formatDate(parseDate(pos.datum)) : "—";
    const beschrStr = positionKurzbeschreibung(pos);
    const warnHtml = verjährungsWarnungHtml(pos);
    const last = idx === state.fall.positionen.length - 1;

    const gruppeLabel = hatMehreGruppen && pos.gruppeId && gruppenIndex[pos.gruppeId]
      ? `<span class="gruppe-label">\u00b7\u00a0${gruppenIndex[pos.gruppeId]}</span>` : "";

    return `<tr data-pos-id="${pos.id}" class="${istZahlung ? "position-row--zahlung" : ""}">
      <td><span class="${badgeKlasse(pos.typ)}">${typLabel}</span>${gruppeLabel}</td>
      <td style="color:var(--color-text-muted);font-size:var(--text-sm)">${datumStr}</td>
      <td style="font-size:var(--text-sm)">${beschrStr}${warnHtml}</td>
      <td class="text-end">
        <span class="amount${istZahlung ? " amount--negative" : ""}">${istZahlung ? "− " : ""}${betragStr}</span>
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
      const perioden = berechneVerzugszinsen(
        betrag, parseDate(von), parseDate(bis), aufschlag, BASISZINSSAETZE, insoDatum
      );
      const gesamtBetrag = perioden.reduce((s, p) => s.plus(p.zinsbetrag), new Decimal(0));
      const gruppeIdFromDropdown = v("mf-gruppe") || null;
      return {
        ...basis,
        hauptbetrag: betrag,
        zinsVon: von,
        zinsBis: bis,
        aufschlag,
        perioden,
        betrag: gesamtBetrag.toFixed(2),
        tage: perioden.reduce((s, p) => s + p.tage, 0),
        ...(gruppeIdFromDropdown ? { gruppeId: gruppeIdFromDropdown } : {}),
      };
    }

    case "zahlung":
      return { ...basis, betrag: v("mf-betrag") };

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
      const ohneUst = ustSatzVorschau === 0;
      const { positionen, netto, ust, gesamt } = berechneRVGGesamt(
        streitwert, vvNummern, RVG_TABELLE, VV_DEFINITIONEN, faktoren
      );
      container.innerHTML = "";  // Berechnungsergebnis wird im Hintergrund berechnet, nicht angezeigt
    } catch (e) {
      container.innerHTML = `<div class="modal-preview-area"><p class="text-danger small mb-0">${e.message}</p></div>`;
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
      const sw = parseFloat(streitwertRaw.replace(",", "."));
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
      const perioden = berechneVerzugszinsen(
        betrag, parseDate(von), parseDate(bis), aufschlag, BASISZINSSAETZE, insoDatum
      );
      container.innerHTML = "";  // Berechnungsergebnis wird im Hintergrund berechnet, nicht angezeigt
    } catch (e) {
      container.innerHTML = `<div class="modal-preview-area"><p class="text-danger small mb-0">${e.message}</p></div>`;
    }
  }
}

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
      <input type="text" class="form-control" id="mf-beschreibung" value="${pos?.beschreibung || ""}" placeholder="z.B. Rechnung Nr. 1234 vom …">
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
    ${tituliertFeld(pos?.tituliert)}
  `;
}

function tplZahlung(pos) {
  return `
    ${datumFeld("mf-datum", pos?.datum, "Zahlungsdatum")}
    <div class="mb-3">
      <label class="form-label">Beschreibung</label>
      <input type="text" class="form-control" id="mf-beschreibung" value="${pos?.beschreibung || ""}" placeholder="z.B. Überweisung vom …">
    </div>
    ${betragFeld("mf-betrag", pos?.betrag, "Zahlbetrag (€)")}
  `;
}

function tplEinfacheKosten(pos, label, standard) {
  return `
    ${datumFeld("mf-datum", pos?.datum)}
    <div class="mb-3">
      <label class="form-label">Beschreibung</label>
      <input type="text" class="form-control" id="mf-beschreibung" value="${pos?.beschreibung || label}" placeholder="${label}">
    </div>
    ${betragFeld("mf-betrag", pos?.betrag || standard)}
    ${tituliertFeld(pos?.tituliert)}
  `;
}

function tplGerichtskosten(pos) {
  const streitwert = pos?.gkgStreitwert || "";
  const verfahren = pos?.gkgVerfahren || "3.0";
  const gebuehr = streitwert ? gkgGebuehr(parseFloat(streitwert.replace(",", "."))) : 0;
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
             value="${pos?.beschreibung || "Gerichtskosten"}" placeholder="Gerichtskosten">
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
             value="${pos?.beschreibung || ""}" placeholder="z.\u00a0B. Monatliche Mahnkosten">
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
             value="${pos?.beschreibung || "Inkassopauschale (§ 288 Abs. 5 BGB)"}"
             placeholder="Inkassopauschale (§ 288 Abs. 5 BGB)">
    </div>
    ${betragFeld("mf-betrag", pos?.betrag || STANDARDKOSTEN.inkassopauschale, "Pauschalbetrag (€)")}
    <div class="alert alert-info py-2 px-3 small mb-3" style="font-size:var(--text-xs)">
      Die Inkassopauschale von 40\u00a0€ steht nur bei <strong>unternehmerischen Forderungen</strong>
      zu (§\u00a0288\u00a0Abs.\u00a05\u00a0BGB, B2B). Nicht anwendbar bei Verbrauchern als Schuldner.
    </div>
    ${tituliertFeld(pos?.tituliert)}
  `;
}

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
  const logoPos = einst.logoPosition || "links";
  const logoHtml = einst.logo
    ? `<div class="pdf-logo-wrap pdf-logo-wrap--${logoPos}"><img class="pdf-logo" src="${einst.logo}" alt="Kanzlei-Logo"></div>`
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
        <tr><th>Grundlage:</th><td>${fgKat}</td></tr>
        ${fall.titelArt ? `<tr><th>Art:</th><td>${fall.titelArt}</td></tr>` : ""}
        ${hatTitel && fall.titelGericht ? `<tr><th>Gericht / Beh\u00f6rde:</th><td>${fall.titelGericht}</td></tr>` : ""}
        ${hatTitel && fall.titelAz ? `<tr><th>Aktenzeichen:</th><td>${fall.titelAz}</td></tr>` : ""}
        ${hatTitel && fall.titelDatum ? `<tr><th>Datum:</th><td>${formatDate(parseDate(fall.titelDatum))}</td></tr>` : ""}
        ${hatTitel && fall.titelRechtskraft ? `<tr><th>Zustellungsdatum:</th><td>${formatDate(parseDate(fall.titelRechtskraft))}</td></tr>` : ""}
      </table>
      </div>
    </div>` : "";

  const { html: summaryHtml, hatTageszins } = baueSummaryTabelle(fall, BASISZINSSAETZE, aufschlagPP);

  try { el.innerHTML = `
    ${logoHtml}
    <!-- PDF-Kopf (nur Print) -->
    <div class="pdf-header">
      <div>
        <div class="pdf-header__title">Forderungsaufstellung</div>
        <div class="pdf-header__subtitle">gem\u00e4\u00df \u00a7\u00a0367\u00a0BGB</div>
      </div>
      <div class="pdf-header__meta">
        Aufgestellt am: ${formatDate(new Date())}<br>
        Basiszinssatz: ${aktBasisSatz ? aktBasisSatz.toFixed(2).replace(".", ",") + "\u00a0%" : "\u2014"} (\u00a7\u00a0247\u00a0BGB)<br>
        Verzugszinsaufschlag: ${aufschlagPP}\u00a0Prozentpunkte (\u00a7\u00a0288\u00a0BGB)
        ${insoDatum ? `<br>InsO-Er\u00f6ffnung: ${formatDate(insoDatum)}` : ""}
      </div>
    </div>

    <!-- Screen-Kopf (kein Print) -->
    <div class="no-print mb-4">
      <h2 style="font-size:var(--text-xl);font-weight:700;margin:0 0 0.25rem">Forderungsaufstellung</h2>
      <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin:0">
        Basiszinssatz ${aktBasisSatz ? aktBasisSatz.toFixed(2).replace(".", ",") + "\u00a0%" : "\u2014"} +
        ${aufschlagPP}\u00a0PP = <strong>${aktZinssatzStr}</strong>
        ${insoDatum ? " \u00b7 InsO: " + formatDate(insoDatum) : ""}
      </p>
    </div>

    <!-- Parteien -->
    <div class="pdf-section">
      <div class="pdf-section__label">Parteien</div>
      <div class="pdf-parties">
        <div class="pdf-party">
          <span class="pdf-party__role">Gl\u00e4ubiger</span>
          <span class="pdf-party__name">${fall.mandant || "\u2014"}</span>
        </div>
        <div class="pdf-party__sep">./.</div>
        <div class="pdf-party">
          <span class="pdf-party__role">Schuldner</span>
          <span class="pdf-party__name">${fall.gegner || "\u2014"}</span>
        </div>
        ${fall.aktenzeichen ? `<div class="pdf-party__az">GZ.: ${fall.aktenzeichen}</div>` : ""}
      </div>
    </div>

    ${fgBlock}

    <!-- Zusammenfassung -->
    <div class="pdf-section">
      <div class="pdf-section__label">Zusammenfassung</div>
      <div class="table-scroll">
      ${summaryHtml}
      </div>
    </div>

    <!-- Fu\u00dfnote -->
    <div class="vorschau-footer">
      ${hatTageszins ? `(*)\u00a0${aufschlagPP}\u00a0Prozentpunkte\u00a0p.\u00a0a. \u00fcber dem Basiszinssatz gem\u00e4\u00df \u00a7\u00a0247\u00a0BGB.<br>` : ""}
      Verrechnung gem.\u00a0\u00a7\u00a7\u00a0366\u00a0Abs.\u00a02, 367\u00a0Abs.\u00a01\u00a0BGB.
      ${insoDatum ? " Zinslauf endet gem.\u00a0\u00a7\u00a041\u00a0InsO am " + formatDate(insoDatum) + "." : ""}
      ${fall.positionen.some(p => verjährungsWarnungHtml(p)) ? "<br><span style=\"color:var(--color-warning)\">\u26a0 Hinweis: Mindestens eine Zinsforderung ist m\u00f6glicherweise gem.\u00a0\u00a7\u00a0197\u00a0BGB verj\u00e4hrt (3-Jahres-Frist). Bitte pr\u00fcfen Sie die Durchsetzbarkeit.</span>" : ""}
      <br><span style="opacity:0.75">Erstellt mit fordify.de \u00b7 Alle Angaben ohne Gew\u00e4hr \u2013 keine Rechtsberatung.</span>
    </div>

    ${impressumHtml}
  `;
  // Stagger-Index für Summary-Zeilen setzen (nach innerHTML-Zuweisung)
  el.querySelectorAll(".summary-table tbody tr").forEach((row, i) => {
    row.style.setProperty("--row-idx", i);
  });
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger m-3"><strong>Fehler beim Rendern der Vorschau:</strong><br><code>${err.message}</code></div>`;
    console.error("rendereVorschau el.innerHTML:", err);
  }
}

/**
 * Baut die neue 4-spaltige Zusammenfassungstabelle:
 * Bezeichnung | Forderung | Verrechnung | Restforderung
 * – Jede HF einzeln mit zugehörigen Zinsen
 * – Zinsen jeweils bis zum Zahlungsdatum (oder heute)
 * – Nach Zahlung: Neuberechnung auf verbleibende HF-Beträge
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

  function calcZinsen(betrag, vonStr, bisDate) {
    if (!vonStr || !betrag || new Decimal(betrag).lte(0)) return ZERO;
    const vonDate = parseDate(vonStr);
    if (vonDate >= bisDate) return ZERO;
    try {
      const per = berechneVerzugszinsen(
        new Decimal(betrag).toFixed(2), vonDate, bisDate,
        aufschlagPP, basiszinssaetze, insoDatum
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

  // Laufende Restbeträge
  const hfRestMap = {};
  for (const hf of hfs) hfRestMap[hf.id] = new Decimal(hf.betrag || 0);
  const kostenRestMap = {};
  for (const k of kostenPos) kostenRestMap[k.id] = kostenBrutto(k);

  // Zeilen-Array: { typ, bezeichnung, forderung, verrechnung, restforderung }
  const zeilen = [];

  const phaseEnd = i => i < zahlungen.length ? parseDate(zahlungen[i].datum) : heute;
  const phaseCount = zahlungen.length + 1;

  for (let phase = 0; phase < phaseCount; phase++) {
    const endDate = phaseEnd(phase);
    const isFirst = phase === 0;
    const isLast  = phase === phaseCount - 1;

    if (isFirst) {
      // HF + Zinsen bis erste Zahlung (oder heute)
      for (let hfIdx = 0; hfIdx < hfs.length; hfIdx++) {
        const hf = hfs[hfIdx];
        const b = new Decimal(hf.betrag || 0);
        const hfNum = hfs.length > 1 ? ` ${hfIdx + 1}` : "";
        const label = hf.beschreibung
          ? `Hauptforderung${hfNum}: ${hf.beschreibung}`
          : `Hauptforderung${hfNum}`;
        zeilen.push({ typ: "hf", datum: hf.datum || null, hfId: hf.id, bezeichnung: label,
          forderung: b, restforderung: b });

        const zp = hfZpMap[hf.id];
        if (zp && zp.zinsVon) {
          const z = calcZinsen(b, zp.zinsVon, endDate);
          if (z.gt(0)) {
            const bisLabel = zahlungen.length > 0 ? ` bis ${formatDate(endDate)}` : " bis heute";
            zeilen.push({ typ: "zinsen", datum: null, hfId: hf.id,
              bezeichnung: `Zinsen ab ${formatDate(parseDate(zp.zinsVon))}${bisLabel}`,
              forderung: z, restforderung: z });
          }
        }
      }
      // Kosten
      for (const k of kostenPos) {
        const b = kostenBrutto(k);
        const label = k.beschreibung || AKTIONSTYPEN[k.typ] || k.typ;
        zeilen.push({ typ: "kosten", datum: k.datum || null, kostenId: k.id,
          bezeichnung: label, forderung: b, restforderung: b });
      }
    } else {
      // Zinsen auf verbleibende HF ab letzter Zahlung
      const prevPayDatum = zahlungen[phase - 1].datum;
      for (const hf of hfs) {
        const rest = hfRestMap[hf.id];
        if (rest.lte(0)) continue;
        const zp = hfZpMap[hf.id];
        if (!zp) continue;
        const z = calcZinsen(rest, prevPayDatum, endDate);
        if (z.lte(0)) continue;
        const bisLabel = isLast ? " bis heute" : ` bis ${formatDate(endDate)}`;
        zeilen.push({ typ: "zinsen_neu", datum: null, hfId: hf.id,
          bezeichnung: `Zinsen auf ${formatEUR(rest)} ab ${formatDate(parseDate(prevPayDatum))}${bisLabel}`,
          forderung: ZERO, restforderung: z });
      }
    }

    // Zahlung verarbeiten
    if (phase < zahlungen.length) {
      const zahlung = zahlungen[phase];
      let restZahlung = new Decimal(zahlung.betrag || 0);

      const zinsenGes = zeilen
        .filter(z => (z.typ === "zinsen" || z.typ === "zinsen_neu") && z.restforderung.gt(0))
        .reduce((s, z) => s.plus(z.restforderung), ZERO);
      const kostenGes = Object.values(kostenRestMap).reduce((s, v) => s.plus(v), ZERO);
      const hfGes    = Object.values(hfRestMap).reduce((s, v) => s.plus(v), ZERO);

      const verrZinsen = Decimal.min(restZahlung, zinsenGes);
      restZahlung = restZahlung.minus(verrZinsen);
      const verrKosten = Decimal.min(restZahlung, kostenGes);
      restZahlung = restZahlung.minus(verrKosten);
      const verrHF = Decimal.min(restZahlung, hfGes);

      // Zinsen-Zeilen reduzieren
      let rem = verrZinsen;
      for (const z of zeilen) {
        if (z.typ !== "zinsen" && z.typ !== "zinsen_neu") continue;
        if (rem.lte(0)) break;
        const used = Decimal.min(rem, z.restforderung);
        z.restforderung = z.restforderung.minus(used);
        rem = rem.minus(used);
      }
      // Kosten-Zeilen reduzieren
      rem = verrKosten;
      for (const z of zeilen) {
        if (z.typ !== "kosten") continue;
        if (rem.lte(0)) break;
        const used = Decimal.min(rem, z.restforderung);
        z.restforderung = z.restforderung.minus(used);
        if (z.kostenId !== undefined) kostenRestMap[z.kostenId] = z.restforderung;
        rem = rem.minus(used);
      }
      // HF-Zeilen reduzieren (FIFO)
      rem = verrHF;
      for (const hf of hfs) {
        if (rem.lte(0)) break;
        const rest = hfRestMap[hf.id];
        const used = Decimal.min(rem, rest);
        hfRestMap[hf.id] = rest.minus(used);
        rem = rem.minus(used);
        for (const z of zeilen) {
          if (z.typ === "hf" && z.hfId === hf.id) {
            z.restforderung = z.restforderung.minus(used);
          }
        }
      }

      const zahlBetrag = new Decimal(zahlung.betrag || 0);
      const zahlLabel = `Zahlung${zahlung.beschreibung ? " – " + zahlung.beschreibung : ""}`;
      zeilen.push({ typ: "zahlung", datum: zahlung.datum || null, bezeichnung: zahlLabel,
        forderung: ZERO, verrechnung: zahlBetrag.negated(), restforderung: ZERO });

      // Restsaldo-Zeilen nach der Zahlung: zeigt verbleibende HF und Kosten explizit
      for (let hfIdx = 0; hfIdx < hfs.length; hfIdx++) {
        const hf = hfs[hfIdx];
        const rest = hfRestMap[hf.id];
        if (rest.lte(0)) continue;
        const hfNum = hfs.length > 1 ? ` ${hfIdx + 1}` : "";
        zeilen.push({ typ: "restsaldo_hf", datum: null, hfId: hf.id,
          bezeichnung: `\u2514 Hauptforderung${hfNum}: Restsaldo`,
          forderung: ZERO, restforderung: rest });
      }
      const kostenRestGes = Object.values(kostenRestMap).reduce((s, v) => s.plus(v), ZERO);
      if (kostenRestGes.gt(0)) {
        zeilen.push({ typ: "restsaldo_kosten", datum: null,
          bezeichnung: "\u2514 Kosten: Restsaldo",
          forderung: ZERO, restforderung: kostenRestGes });
      }
    }
  }

  // Tageszins auf verbleibende HF
  const hfRestFinal = hfs.reduce((s, hf) => s.plus(hfRestMap[hf.id]), ZERO);
  let tageszinsZeile = null;
  if (hfRestFinal.gt(0)) {
    try {
      const tz = tageszins(hfRestFinal, aufschlagPP, heute, basiszinssaetze);
      if (tz.gt(0)) {
        tageszinsZeile = {
          typ: "tageszins",
          bezeichnung: "Tageszins ab heute (*)",
          forderung: ZERO, verrechnung: ZERO, restforderung: tz,
        };
      }
    } catch(e) {}
  }

  // Gesamtzeile
  const totForderung = zeilen.reduce((s, z) => s.plus(z.forderung || ZERO), ZERO);
  const totVerrechnung = zeilen.filter(z => z.typ === "zahlung").reduce((s, z) => s.plus(z.verrechnung || ZERO), ZERO);
  const totRest = zeilen.filter(z =>
    z.typ !== "zahlung" && z.typ !== "restsaldo_hf" && z.typ !== "restsaldo_kosten"
  ).reduce((s, z) => s.plus(z.restforderung || ZERO), ZERO);

  // HTML-Tabelle rendern
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

  const rows = zeilen.map(z => {
    let rowCls = "";
    let fCell, vCell, rCell;

    if (z.typ === "zahlung") {
      rowCls = "summary-row--zahlung";
      fCell = `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
      vCell = amtCell(z.verrechnung);
      rCell = `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
    } else if (z.typ === "zinsen_neu") {
      rowCls = "summary-row--zinsen-neu";
      fCell = `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
      vCell = `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
      rCell = amtCell(z.restforderung);
    } else if (z.typ === "restsaldo_hf" || z.typ === "restsaldo_kosten") {
      rowCls = "summary-row--restsaldo";
      fCell = `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
      vCell = `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
      rCell = amtCell(z.restforderung);
    } else {
      fCell = amtCell(z.forderung);
      vCell = `<td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>`;
      rCell = amtCell(z.restforderung);
    }
    return `<tr class="${rowCls}">${datumCell(z.datum || null)}<td>${z.bezeichnung}</td>${fCell}${vCell}${rCell}</tr>`;
  }).join("");

  const gesamtRow = `<tr class="summary-row--gesamt">
    <td></td>
    <td>Offene Forderung</td>
    ${amtCell(totForderung, "amount--gesamt")}
    ${amtCell(totVerrechnung, "amount--gesamt")}
    ${amtCell(totRest, "amount--gesamt")}
  </tr>`;

  const tageszinsRow = tageszinsZeile ? `<tr class="summary-row--tageszins">
    <td></td>
    <td>${tageszinsZeile.bezeichnung}</td>
    <td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>
    <td class="text-end" style="color:var(--color-text-subtle)">${dash}</td>
    ${amtCell(tageszinsZeile.restforderung)}
  </tr>` : "";

  const html = `<table class="summary-table">
    <thead>
      <tr>
        <th class="summary-datum-th">Datum</th>
        <th>Bezeichnung</th>
        <th class="text-end">Forderung</th>
        <th class="text-end">Verrechnung</th>
        <th class="text-end">Restforderung</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
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
      return `Laufende Zinsen ab ${formatDate(parseDate(pos.zinsBis))}, ${pos.aufschlag || state.fall.aufschlagPP} PP über Basiszins`;
    case "zinsperiode":
      return `Zinsen ${formatDate(parseDate(pos.zinsVon))} – ${formatDate(parseDate(pos.zinsBis))} (${pos.tage || "?"} Tage, ${pos.aufschlag || state.fall.aufschlagPP} PP)`;
    case "zahlung":
      return pos.beschreibung || "Zahlung";
    default:
      return pos.beschreibung || "—";
  }
}

// ---- Einstellungen (Logo + Impressum) ----

function ladeEinstellungen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return { logo: null, logoPosition: "links", imp: {} };
    return JSON.parse(raw);
  } catch (e) {
    return { logo: null, logoPosition: "links", imp: {} };
  }
}

function speichereEinstellungen(einst) {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(einst));
}

function zeigeEinstellungenModal() {
  const einst = ladeEinstellungen();

  aktualisierThemeSwitcher(localStorage.getItem(STORAGE_KEY_THEME) || "brand");

  const posEl = document.getElementById("einst-logo-position");
  if (posEl) posEl.value = einst.logoPosition || "links";

  const imp = einst.imp || {};
  const IMP_FIELDS = ["name","rechtsform","strasse","plz","ort","tel","fax","email",
                      "website","kammer","register","vertreten","ustid","bhv","iban","bic","bank",
                      "impressum-url","datenschutz-url"];
  for (const f of IMP_FIELDS) {
    const el = document.getElementById("einst-imp-" + f);
    const key = f.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (el) el.value = imp[key] || "";
  }
  aktualisiereFussVorschau();

  aktualisiereLogoVorschau(einst.logo || null);

  const m = document.getElementById("modal-einstellungen");
  if (m) {
    delete m.dataset.pendingLogo;
    const body = m.querySelector(".modal-body--app");
    if (body) {
      body.removeEventListener("input", aktualisiereFussVorschau);
      body.addEventListener("input", aktualisiereFussVorschau);
    }
  }

  new bootstrap.Modal(m).show();
}

function leseImpFelder() {
  function v(id) { return document.getElementById(id)?.value?.trim() || ""; }
  return {
    name:           v("einst-imp-name"),
    rechtsform:     v("einst-imp-rechtsform"),
    strasse:        v("einst-imp-strasse"),
    plz:            v("einst-imp-plz"),
    ort:            v("einst-imp-ort"),
    tel:            v("einst-imp-tel"),
    fax:            v("einst-imp-fax"),
    email:          v("einst-imp-email"),
    website:        v("einst-imp-website"),
    kammer:         v("einst-imp-kammer"),
    register:       v("einst-imp-register"),
    vertreten:      v("einst-imp-vertreten"),
    ustid:          v("einst-imp-ustid"),
    bhv:            v("einst-imp-bhv"),
    iban:           v("einst-imp-iban"),
    bic:            v("einst-imp-bic"),
    bank:           v("einst-imp-bank"),
    impressumUrl:   v("einst-imp-impressum-url"),
    datenschutzUrl: v("einst-imp-datenschutz-url"),
  };
}

function aktualisiereFussVorschau() {
  const vorschau = document.getElementById("einst-imp-vorschau");
  if (!vorschau) return;
  const html = generiereImpressumFooterHtml(leseImpFelder());
  vorschau.innerHTML = html ||
    "<em style='color:var(--color-text-subtle)'>Vorschau des generierten Footer-Texts erscheint hier\u2026</em>";
}

function generiereImpressumFooterHtml(imp) {
  if (!imp) return "";

  // Backward compat: altes Freitext-Format
  if (imp.freitext && !imp.name) {
    return `<div class="pdf-impressum-footer">${imp.freitext.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g," &nbsp;\u00b7&nbsp; ")}</div>`;
  }
  if (!imp.name) return "";

  function e(s) { return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  const teile = [];
  teile.push(e(imp.name) + (imp.rechtsform ? ` ${e(imp.rechtsform)}` : ""));
  if (imp.strasse) {
    let adr = e(imp.strasse);
    if (imp.plz || imp.ort) adr += ` \u00b7 ${e(imp.plz)} ${e(imp.ort)}`.trim();
    teile.push(adr);
  }
  if (imp.tel)  teile.push(`Tel.: ${e(imp.tel)}`);
  if (imp.fax)  teile.push(`Fax: ${e(imp.fax)}`);
  if (imp.email) teile.push(`E-Mail: <a href="mailto:${e(imp.email)}" class="imp-link">${e(imp.email)}</a>`);
  if (imp.website) teile.push(`<a href="${e(imp.website)}" target="_blank" rel="noopener noreferrer" class="imp-link">${e(imp.website.replace(/^https?:\/\//, ""))}</a>`);
  if (imp.kammer)   teile.push(e(imp.kammer));
  if (imp.register) teile.push(`Reg.-Nr.: ${e(imp.register)}`);
  if (imp.vertreten) teile.push(`Vertreten durch: ${e(imp.vertreten)}`);
  if (imp.ustid)    teile.push(`USt-ID: ${e(imp.ustid)}`);
  if (imp.bhv)      teile.push(`BHV: ${e(imp.bhv)}`);
  if (imp.iban) {
    let b = `IBAN: ${e(imp.iban)}`;
    if (imp.bic)  b += ` \u00b7 BIC: ${e(imp.bic)}`;
    if (imp.bank) b += ` (${e(imp.bank)})`;
    teile.push(b);
  }
  if (!teile.length) return "";

  let html = `<div class="pdf-impressum-footer">${teile.join(" &nbsp;\u00b7&nbsp; ")}`;

  const links = [];
  if (imp.impressumUrl)   links.push(`<a href="${e(imp.impressumUrl)}" target="_blank" rel="noopener noreferrer" class="imp-link">Impressum</a>`);
  if (imp.datenschutzUrl) links.push(`<a href="${e(imp.datenschutzUrl)}" target="_blank" rel="noopener noreferrer" class="imp-link">Datenschutz</a>`);
  if (links.length) html += `<span class="no-print" style="margin-left:0.75em;font-size:0.85em"> \u00b7 ${links.join(" \u00b7 ")}</span>`;

  html += `</div>`;
  return html;
}

function logoHochladen(input) {
  const file = input.files[0];
  if (!file) return;

  const ERLAUBT = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
  if (!ERLAUBT.includes(file.type)) {
    alert("Ungültiges Format. Erlaubt: PNG, JPG, SVG, WebP.");
    input.value = "";
    return;
  }
  if (file.size > 500 * 1024) {
    alert("Das Logo ist zu groß (max. 500 KB).");
    input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const m = document.getElementById("modal-einstellungen");
    if (m) m.dataset.pendingLogo = e.target.result;
    aktualisiereLogoVorschau(e.target.result);
  };
  reader.readAsDataURL(file);
}

function aktualisiereLogoVorschau(dataUrl) {
  const box = document.getElementById("einst-logo-vorschau");
  const placeholder = document.getElementById("einst-logo-placeholder");
  const loeschenBtn = document.getElementById("einst-logo-loeschen-btn");
  if (!box) return;

  const existing = box.querySelector("img.einst-logo-img");
  if (existing) existing.remove();

  if (dataUrl) {
    const img = document.createElement("img");
    img.className = "einst-logo-img";
    img.src = dataUrl;
    img.style.cssText = "max-height:60px;max-width:200px;width:auto;height:auto;object-fit:contain;display:block;";
    box.insertBefore(img, placeholder);
    if (placeholder) placeholder.style.display = "none";
    loeschenBtn?.classList.remove("d-none");
  } else {
    if (placeholder) placeholder.style.display = "";
    loeschenBtn?.classList.add("d-none");
  }
}

function logoLoeschen() {
  const m = document.getElementById("modal-einstellungen");
  if (m) m.dataset.pendingLogo = "";
  aktualisiereLogoVorschau(null);
  const input = document.getElementById("einst-logo-input");
  if (input) input.value = "";
}

function einstellungenSpeichern() {
  const einst = ladeEinstellungen();

  const m = document.getElementById("modal-einstellungen");
  if (m && m.dataset.pendingLogo !== undefined) {
    einst.logo = m.dataset.pendingLogo || null;
    delete m.dataset.pendingLogo;
  }

  einst.logoPosition = document.getElementById("einst-logo-position")?.value || "links";

  einst.imp = leseImpFelder();

  speichereEinstellungen(einst);
  bootstrap.Modal.getInstance(m)?.hide();
  rendereVorschau();
}

/**
 * Exportiert die aktuellen Einstellungen (inkl. Impressum) als JSON-Datei.
 */
function einstellungenExportieren() {
  const einst = ladeEinstellungen();
  const json = JSON.stringify({ fordify_settings: einst }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fordify-einstellungen.json";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Importiert Einstellungen aus einer JSON-Datei und befüllt das Modal.
 */
function einstellungenImportieren(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.fordify_settings) {
        alert("Import fehlgeschlagen: Dies ist keine fordify-Einstellungsdatei.\nBitte verwenden Sie eine zuvor \u00fcber \u201eExport\u201c heruntergeladene Datei.");
        input.value = "";
        return;
      }
      speichereEinstellungen(parsed.fordify_settings);
      // Modal-Felder neu befüllen
      zeigeEinstellungenModal();
      // Datei-Input zurücksetzen
      input.value = "";
    } catch (err) {
      alert("Import fehlgeschlagen: Ungültige JSON-Datei.\n" + err.message);
    }
  };
  reader.readAsText(file);
}

// ---- Drucken / PDF ----

function drucken() {
  rendereVorschau();
  const vorschauEl = document.getElementById("vorschau-inhalt");
  if (!vorschauEl) { window.print(); return; }

  // no-print-Elemente entfernen
  const tmp = document.createElement("div");
  tmp.innerHTML = vorschauEl.innerHTML;
  tmp.querySelectorAll(".no-print").forEach(el => el.remove());
  const cleanHtml = tmp.innerHTML;

  const origin = window.location.origin;
  const fullHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Forderungsaufstellung</title>
  <link rel="stylesheet" href="${origin}/css/bootstrap.min.css">
  <link rel="stylesheet" href="${origin}/css/app.css">
  <style>body{margin:2rem}@media print{body{margin:0}}</style>
</head>
<body>
  <div class="content-card">${cleanHtml}</div>
  <script>window.onload=function(){setTimeout(function(){window.print();},400);}<\/script>
</body>
</html>`;

  const popup = window.open("", "_blank", "width=960,height=750");
  if (!popup) { window.print(); return; }  // Popup-Blocker: Fallback
  popup.document.write(fullHtml);
  popup.document.close();
}

// ---- Zurücksetzen ----

function fallZuruecksetzen() {
  if (!confirm("Neuen leeren Fall anlegen?")) return;
  neuenFallAnlegen();
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

function themeWechseln(name) {
  const valid = ["brand", "dark", "clean"];
  if (!valid.includes(name)) name = "brand";
  if (name === "brand") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", name);
  }
  // Logo je Theme tauschen
  const logoImg = document.querySelector(".navbar-brand img");
  if (logoImg) {
    const logoMap = { brand: "img/logo.svg", dark: "img/logo-dark.svg", clean: "img/logo-clean.svg" };
    logoImg.src = logoMap[name] || "img/logo.svg";
  }
  localStorage.setItem(STORAGE_KEY_THEME, name);
  aktualisierThemeSwitcher(name);
}

function aktualisierThemeSwitcher(name) {
  document.querySelectorAll(".theme-card").forEach(el => {
    const active = el.dataset.themeSelect === name;
    el.classList.toggle("theme-card--active", active);
    el.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function themeLaden() {
  const saved = localStorage.getItem(STORAGE_KEY_THEME) || "brand";
  themeWechseln(saved);
}

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

// ---- GKG-Streitwertrechner ----

/**
 * Ermittelt die 1,0-Gebühr nach GKG Anlage 2 für einen gegebenen Streitwert.
 * @param {number} streitwert
 * @returns {number} Gebühr in Euro
 */
function gkgGebuehr(streitwert) {
  if (!streitwert || streitwert <= 0) return 0;
  for (const zeile of GKG_TABELLE) {
    if (streitwert <= zeile.bis) return zeile.gebuehr;
  }
  // Über 500.000 €: 2.201 € + 108 € je angefangene weitere 30.000 €
  const ueber = streitwert - 500000;
  return 2201 + Math.ceil(ueber / 30000) * 108;
}

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
  const az = (state.fall.aktenzeichen || "fall").replace(/[^a-zA-Z0-9\-_]/g, "_");
  const filename = `fordify-${az}.json`;
  const blob = new Blob([json], { type: "application/json" });

  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "application/json" })] })) {
    try {
      await navigator.share({
        title: "Forderungsaufstellung – " + (state.fall.aktenzeichen || state.fall.mandant || "fordify"),
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
