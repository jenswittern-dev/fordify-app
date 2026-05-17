// fordify – Einstellungen (Logo + Impressum)
// Lädt vor app.js. Nutzt StorageBackend, STORAGE_KEY_SETTINGS, requiresPaid, bootstrap.
// rendereVorschau wird in app.js definiert und nach Modal-Speichern aufgerufen.
"use strict";

function ladeEinstellungen() {
  try {
    const raw = StorageBackend.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return { logo: null, logoPosition: "links", imp: {} };
    return JSON.parse(raw);
  } catch (e) {
    return { logo: null, logoPosition: "links", imp: {} };
  }
}

function speichereEinstellungen(einst) {
  StorageBackend.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(einst));
}

function zeigeEinstellungenModal() {
  const einst = ladeEinstellungen();

  const posEl = document.getElementById("einst-logo-position");
  if (posEl) posEl.value = einst.logoPosition || "links";

  const imp = einst.imp || {};
  const IMP_FIELDS = ["name","strasse","plz","ort","tel","fax","email",
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
    "<em style='color:var(--color-text-subtle)'>Vorschau des generierten Footer-Texts erscheint hier…</em>";
}

function generiereImpressumFooterHtml(imp) {
  if (!imp) return "";

  // Backward compat: altes Freitext-Format
  if (imp.freitext && !imp.name) {
    return `<div class="pdf-impressum-footer">${imp.freitext.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g," &nbsp;·&nbsp; ")}</div>`;
  }
  if (!imp.name) return "";

  function e(s) {
    return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
  function safeHref(url) {
    const u = (url || "").trim();
    if (!/^(https?:|mailto:)/i.test(u)) return "#";
    return u.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
  }
  const DOT = " &nbsp;·&nbsp; ";

  // Zeile 1: Firmenname · Vertreten durch · Adresse · E-Mail · Website
  const zeile1 = [];
  zeile1.push(e(imp.name));
  if (imp.vertreten) zeile1.push(`vertreten durch: ${e(imp.vertreten)}`);
  if (imp.strasse) {
    let adr = e(imp.strasse);
    if (imp.plz || imp.ort) adr += `, ${[e(imp.plz), e(imp.ort)].filter(Boolean).join(" ")}`;
    zeile1.push(adr);
  }
  if (imp.email)   zeile1.push(`E-Mail: <a href="${safeHref("mailto:" + imp.email)}" class="imp-link">${e(imp.email)}</a>`);
  if (imp.website) zeile1.push(`<a href="${safeHref(imp.website)}" target="_blank" rel="noopener noreferrer" class="imp-link">${e(imp.website.replace(/^https?:\/\//, ""))}</a>`);

  // Zeile 2: Tel · Fax · Kammer · Reg.-Nr. · USt-ID · BHV
  const zeile2 = [];
  if (imp.tel)      zeile2.push(`Tel.: ${e(imp.tel)}`);
  if (imp.fax)      zeile2.push(`Fax: ${e(imp.fax)}`);
  if (imp.kammer)   zeile2.push(e(imp.kammer));
  if (imp.register) zeile2.push(`Reg.-Nr.: ${e(imp.register)}`);
  if (imp.ustid)    zeile2.push(`USt-ID: ${e(imp.ustid)}`);
  if (imp.bhv)      zeile2.push(`BHV: ${e(imp.bhv)}`);

  // Zeile 3: Bankdaten (nur wenn vorhanden)
  const zeile3 = [];
  if (imp.iban) {
    let b = `IBAN: ${e(imp.iban)}`;
    if (imp.bic)  b += `${DOT}BIC: ${e(imp.bic)}`;
    if (imp.bank) b += ` (${e(imp.bank)})`;
    zeile3.push(b);
  }

  // Zeile 4: Impressum · Datenschutz (klickbar in Web-Vorschau und PDF)
  const zeile4 = [];
  if (imp.impressumUrl)   zeile4.push(`<a href="${safeHref(imp.impressumUrl)}" target="_blank" rel="noopener noreferrer" class="imp-link">Impressum</a>`);
  if (imp.datenschutzUrl) zeile4.push(`<a href="${safeHref(imp.datenschutzUrl)}" target="_blank" rel="noopener noreferrer" class="imp-link">Datenschutz</a>`);

  if (!zeile1.length) return "";

  let content = zeile1.join(DOT);
  if (zeile2.length) content += `<br>${zeile2.join(DOT)}`;
  if (zeile3.length) content += `<br>${zeile3.join(DOT)}`;
  if (zeile4.length) content += `<br>${zeile4.join(DOT)}`;

  return `<div class="pdf-impressum-footer">${content}</div>`;
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
  if (typeof requiresPaid === 'function' && requiresPaid('einstellungen')) return;
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
  if (typeof rendereVorschau === 'function') rendereVorschau();
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
  const firma = (einst.name || "").replace(/[/\\:*?"<>|]/g, "").replace(/\s+/g, "_").slice(0, 50);
  a.download = "Fordify_Einstellungen" + (firma ? "_" + firma : "") + ".json";
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
  reader.onload = function(ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed.fordify_settings) {
        alert("Import fehlgeschlagen: Dies ist keine fordify-Einstellungsdatei.\nBitte verwenden Sie eine zuvor über „Export\" heruntergeladene Datei.");
        input.value = "";
        return;
      }
      const einst = parsed.fordify_settings;
      // Sicherheitsvalidierung: Logo nur als data:image/-URI erlaubt
      if (einst.logo && !/^data:image\/[a-z+]+;base64,/.test(einst.logo)) {
        einst.logo = null;
      }
      // Sicherheitsvalidierung: logoPosition auf Whitelist prüfen
      if (einst.logoPosition && !["links", "mitte", "rechts"].includes(einst.logoPosition)) {
        einst.logoPosition = "links";
      }
      speichereEinstellungen(einst);

      // Felder direkt befüllen (Modal ist bereits offen – kein erneutes .show())
      const imp = einst.imp || {};
      const posEl = document.getElementById("einst-logo-position");
      if (posEl) posEl.value = einst.logoPosition || "links";
      const IMP_FIELDS = ["name","strasse","plz","ort","tel","fax","email",
                          "website","kammer","register","vertreten","ustid","bhv","iban","bic","bank",
                          "impressum-url","datenschutz-url"];
      for (const f of IMP_FIELDS) {
        const el = document.getElementById("einst-imp-" + f);
        const key = f.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (el) el.value = imp[key] || "";
      }
      aktualisiereLogoVorschau(einst.logo || null);
      aktualisiereFussVorschau();
      input.value = "";
    } catch (err) {
      alert("Import fehlgeschlagen: Ungültige JSON-Datei.\n" + err.message);
    }
  };
  reader.readAsText(file);
}
