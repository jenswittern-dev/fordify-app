'use strict';

function fordifyConfirm(message, onOK, { okLabel = 'Löschen', cancelLabel = 'Abbrechen' } = {}) {
  const textEl = document.getElementById('confirm-modal-text');
  const btnsEl = document.getElementById('confirm-modal-btns');
  if (!textEl || !btnsEl) { if (confirm(message)) onOK(); return; }
  textEl.textContent = message;
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal'));
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary btn-sm';
  cancelBtn.setAttribute('data-bs-dismiss', 'modal');
  cancelBtn.textContent = cancelLabel;
  const okBtn = document.createElement('button');
  okBtn.className = 'btn btn-danger btn-sm';
  okBtn.textContent = okLabel;
  okBtn.addEventListener('click', () => { modal.hide(); onOK(); }, { once: true });
  btnsEl.innerHTML = '';
  btnsEl.appendChild(cancelBtn);
  btnsEl.appendChild(okBtn);
  modal.show();
}

const KONTO_STORAGE_KEY_CASES    = 'fordify_cases';
const KONTO_STORAGE_KEY_SETTINGS = 'fordify_settings';
const KONTO_STORAGE_KEY_THEME    = 'fordify_theme';

// ---- Storage-Hilfsfunktionen ----

function kontoLadeRegistry() {
  try {
    const raw = StorageBackend.getItem(KONTO_STORAGE_KEY_CASES);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { cases: {}, currentCaseId: null };
}

function kontoSpeichereRegistry(reg) {
  try {
    StorageBackend.setItem(KONTO_STORAGE_KEY_CASES, JSON.stringify(reg));
  } catch (e) { console.warn('Registry speichern fehlgeschlagen:', e); }
}

function kontoLadeEinstellungen() {
  try {
    const raw = StorageBackend.getItem(KONTO_STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { logo: null, logoPosition: 'links', imp: {} };
}

function kontoSpeichereEinstellungen(einst) {
  try {
    StorageBackend.setItem(KONTO_STORAGE_KEY_SETTINGS, JSON.stringify(einst));
  } catch (e) { console.warn('Einstellungen speichern fehlgeschlagen:', e); }
}

// ---- Logout ----

async function kontoLogout() {
  try { await logout(); } catch (e) { console.warn('Logout-Fehler:', e); }
  // Clear session from localStorage directly as fallback
  try {
    const projectRef = new URL(CONFIG.supabase.url).hostname.split('.')[0];
    localStorage.removeItem(`sb-${projectRef}-auth-token`);
    localStorage.removeItem(`sb-${projectRef}-auth-token-code-verifier`);
  } catch (e) { /* ignore */ }
  window.location.href = '/forderungsaufstellung';
}

// ---- Auth-Guard und Init ----

// Reads session directly from localStorage — bypasses Supabase Web Locks entirely.
// Both getSession() and setSession() acquire the same lock that gets "stolen"
// during page-to-page navigation. Direct localStorage + fetch avoids this.
function _leseLocalSession() {
  try {
    const projectRef = new URL(CONFIG.supabase.url).hostname.split('.')[0];
    const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.user || !data?.access_token) return null;
    if (data.expires_at && data.expires_at < Math.floor(Date.now() / 1000)) return null;
    return { user: data.user, access_token: data.access_token };
  } catch (e) { return null; }
}

// Direct fetch instead of supabaseClient — avoids lock contention on konto.html.
async function _pruefeAbo(userId, accessToken) {
  const res = await fetch(
    `${CONFIG.supabase.url}/rest/v1/subscriptions?user_id=eq.${userId}&select=status,plan,grace_period_end`,
    { headers: { 'apikey': CONFIG.supabase.anonKey, 'Authorization': `Bearer ${accessToken}` } }
  );
  if (!res.ok) return;
  const rows = await res.json();
  const row = rows?.[0];
  if (row?.status === 'active') {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = row.plan;
  } else if (row?.status === 'canceled' && row?.grace_period_end &&
             new Date(row.grace_period_end) > new Date()) {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = row.plan;
    fordifyAuth.isGracePeriod = true;
    fordifyAuth.gracePeriodEnd = new Date(row.grace_period_end);
  }
}

async function _pruefeKonsens(userId, accessToken) {
  try {
    const res = await fetch(
      `${CONFIG.supabase.url}/rest/v1/profiles?id=eq.${userId}&select=accepted_agb_at,accepted_avv_at`,
      { headers: { 'apikey': CONFIG.supabase.anonKey, 'Authorization': `Bearer ${accessToken}` } }
    );
    if (!res.ok) { fordifyAuth.acceptedAgbAt = null; fordifyAuth.acceptedAvvAt = null; return; }
    const rows = await res.json();
    fordifyAuth.acceptedAgbAt = rows?.[0]?.accepted_agb_at ?? null;
    fordifyAuth.acceptedAvvAt = rows?.[0]?.accepted_avv_at ?? null;
  } catch (e) { fordifyAuth.acceptedAgbAt = null; fordifyAuth.acceptedAvvAt = null; }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!supabaseClient) {
    window.location.href = '/forderungsaufstellung';
    return;
  }

  const session = _leseLocalSession();
  if (!session) {
    window.location.href = '/forderungsaufstellung';
    return;
  }

  try {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    await _pruefeAbo(session.user.id, session.access_token);
    await _pruefeKonsens(session.user.id, session.access_token);
    if (!fordifyAuth.hasSubscription) {
      window.location.href = '/preise';
      return;
    }
    await ladeKontakte();
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
    _zeigGracePeriodBanner();
    _kontoUpdateHero();
    _kontoInitTabs();
    _kontoActivateTabFromUrl();

    document.getElementById('konto-loading').style.display = 'none';
    document.getElementById('konto-content').classList.remove('d-none');
  } catch (e) {
    console.error('Konto-Init fehlgeschlagen:', e);
    const loadingEl = document.getElementById('konto-loading');
    if (loadingEl) loadingEl.innerHTML = `<p class="text-danger">Fehler: ${e?.message || String(e)}</p><p class="small text-muted">Bitte diesen Fehler melden.</p>`;
  }

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') window.location.href = '/forderungsaufstellung';
  });
});

// ---- Grace-Period-Banner ----

function _zeigGracePeriodBanner() {
  if (!fordifyAuth.isGracePeriod || !fordifyAuth.gracePeriodEnd) return;
  const bis = fordifyAuth.gracePeriodEnd.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const banner = document.createElement('div');
  banner.className = 'alert alert-warning alert-dismissible fade show mx-3 mt-3';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <strong>Abo gekündigt.</strong> Du hast noch bis zum <strong>${bis}</strong> Zugriff auf deine Daten.
    Jetzt <a href="/preise" class="alert-link">erneut abonnieren</a> oder Daten exportieren.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Schließen"></button>`;
  const content = document.getElementById('konto-content');
  if (content) content.prepend(banner);
}

// ---- Hero aktualisieren ----

function _kontoUpdateHero() {
  const user = fordifyAuth.user;
  if (!user) return;

  const email = user.email || '';
  const local = email.split('@')[0];
  const parts = local.split(/[._-]/);
  let initials;
  if (parts.length >= 2 && parts[0] && parts[1]) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else {
    initials = local.slice(0, 2).toUpperCase();
  }

  const avatarEl = document.getElementById('konto-hero-avatar');
  if (avatarEl) avatarEl.textContent = initials;

  const emailEl = document.getElementById('konto-hero-email');
  if (emailEl) emailEl.textContent = email;

  const badgeEl = document.getElementById('konto-hero-badge');
  if (badgeEl) {
    const configs = {
      pro:      { label: 'PRO',      bg: '#fef3c7', color: '#92400e' },
      business: { label: 'BUSINESS', bg: '#dbeafe', color: '#1e40af' },
    };
    const c = configs[fordifyAuth.plan];
    if (c) badgeEl.innerHTML = `<span class="plan-badge" style="background:${c.bg};color:${c.color}">${c.label}</span>`;
  }
}

// ---- Tab-Switching ----

function _kontoInitTabs() {
  document.querySelectorAll('.konto-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      _kontoZeigeTab(tab);
      history.replaceState({}, '', '?tab=' + tab);
    });
  });
  _kontoRendererFuerTab('faelle');
}

function _kontoActivateTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && ['faelle', 'firmendaten', 'abo', 'adressen'].includes(tab)) {
    _kontoZeigeTab(tab);
  }
}

function _kontoZeigeTab(name) {
  document.querySelectorAll('.konto-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === name);
    btn.setAttribute('aria-selected', btn.dataset.tab === name ? 'true' : 'false');
  });
  document.querySelectorAll('.konto-tab-panel').forEach(panel => {
    panel.classList.toggle('d-none', panel.id !== 'tab-' + name);
  });
  _kontoRendererFuerTab(name);
}

function _kontoRendererFuerTab(name) {
  if (name === 'faelle')      kontoRendereFaelleTab();
  if (name === 'firmendaten') kontoRendereFirmendatenTab();
  if (name === 'abo')         kontoRendereAboTab();
  if (name === 'adressen')    kontoRendereAdressbuchTab();
}

// ---- Tab: Fälle ----

let _faelleSearch = '';
let _faelleFilter = 'alle';
let _faelleSort   = 'datum';

const STATUS_CONFIG = {
  offen:             { label: 'Offen',           bg: '#dbeafe', color: '#1e40af' },
  in_vollstreckung:  { label: 'In Vollstreckung', bg: '#fef3c7', color: '#92400e' },
  erledigt:          { label: 'Erledigt',         bg: '#dcfce7', color: '#166534' },
  abgeschrieben:     { label: 'Abgeschrieben',    bg: '#f1f5f9', color: '#64748b' },
};

function kontoFaelleFilterAendern() {
  _faelleSearch = (document.getElementById('faelle-suche')?.value || '').toLowerCase();
  _faelleFilter = document.getElementById('faelle-filter')?.value || 'alle';
  _faelleSort   = document.getElementById('faelle-sort')?.value || 'datum';
  kontoRendereFaelleTab();
}

function kontoFallPinToggle(id) {
  const reg = kontoLadeRegistry();
  if (!reg.cases[id]) return;
  reg.cases[id].pinned = !reg.cases[id].pinned;
  reg.cases[id].updatedAt = new Date().toISOString();
  kontoSpeichereRegistry(reg);
  kontoRendereFaelleTab();
}

function kontoFallStatusAendern(id, status) {
  const reg = kontoLadeRegistry();
  if (!reg.cases[id]) return;
  reg.cases[id].fall_status = status;
  reg.cases[id].updatedAt = new Date().toISOString();
  kontoSpeichereRegistry(reg);
  kontoRendereFaelleTab();
}

function kontoRendereFaelleTab() {
  const isBusiness = fordifyAuth?.plan === 'business';
  const reg = kontoLadeRegistry();
  let cases = Object.values(reg.cases);

  // Business: Suche + Filter anwenden
  if (isBusiness && _faelleSearch) {
    cases = cases.filter(c =>
      (c.name || '').toLowerCase().includes(_faelleSearch) ||
      (c.fall?.aktenzeichen || '').toLowerCase().includes(_faelleSearch) ||
      (c.fall?.gegner || '').toLowerCase().includes(_faelleSearch)
    );
  }
  if (isBusiness && _faelleFilter !== 'alle') {
    cases = cases.filter(c => (c.fall_status || 'offen') === _faelleFilter);
  }

  // Sortierung
  cases.sort((a, b) => {
    if (isBusiness) {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (_faelleSort === 'name') return (a.name || '').localeCompare(b.name || '', 'de');
    }
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });

  // Controls rendern (Business-only)
  const controlsEl = document.getElementById('faelle-controls');
  if (controlsEl) {
    if (isBusiness) {
      controlsEl.innerHTML = `
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <input type="search" id="faelle-suche" class="form-control form-control-sm" style="max-width:220px;"
                 placeholder="Fall suchen…" value="${escHtml(_faelleSearch)}" oninput="kontoFaelleFilterAendern()">
          <select id="faelle-filter" class="form-select form-select-sm" style="max-width:180px;" onchange="kontoFaelleFilterAendern()">
            <option value="alle"${_faelleFilter==='alle'?' selected':''}>Alle Status</option>
            <option value="offen"${_faelleFilter==='offen'?' selected':''}>Offen</option>
            <option value="in_vollstreckung"${_faelleFilter==='in_vollstreckung'?' selected':''}>In Vollstreckung</option>
            <option value="erledigt"${_faelleFilter==='erledigt'?' selected':''}>Erledigt</option>
            <option value="abgeschrieben"${_faelleFilter==='abgeschrieben'?' selected':''}>Abgeschrieben</option>
          </select>
          <select id="faelle-sort" class="form-select form-select-sm" style="max-width:160px;" onchange="kontoFaelleFilterAendern()">
            <option value="datum"${_faelleSort==='datum'?' selected':''}>Zuletzt geändert</option>
            <option value="name"${_faelleSort==='name'?' selected':''}>Name A–Z</option>
          </select>
        </div>`;
    } else {
      controlsEl.innerHTML = '';
    }
  }

  const anzahlEl = document.getElementById('faelle-anzahl');
  if (anzahlEl) anzahlEl.textContent = cases.length === 1 ? '1 gespeicherter Fall' : cases.length + ' gespeicherte Fälle';

  const listeEl = document.getElementById('faelle-liste');
  if (!listeEl) return;

  if (cases.length === 0) {
    listeEl.innerHTML = `
      <div class="text-center py-5 text-muted">
        <p class="mb-3">${_faelleSearch || _faelleFilter !== 'alle' ? 'Keine Fälle gefunden.' : 'Noch keine gespeicherten Fälle.'}</p>
        ${!_faelleSearch && _faelleFilter === 'alle' ? '<button class="btn btn-primary" onclick="kontoNeuenFallAnlegen()">Ersten Fall anlegen</button>' : ''}
      </div>`;
    return;
  }

  listeEl.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0" style="background:white;border-radius:8px;overflow:hidden;">
        <thead style="background:#f1f5f9;font-size:0.75rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;">
          <tr>
            <th class="ps-3">Fall</th>
            <th>Geändert</th>
            <th class="text-end pe-2">Forderung</th>
            <th style="width:1%;white-space:nowrap;"></th>
          </tr>
        </thead>
        <tbody>
          ${cases.map(c => {
            const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('de-DE') : '';
            const positionen = (c.fall?.positionen || []).length;
            const summe = _hfSumme(c.fall?.positionen);
            const summeFormatiert = summe > 0
              ? summe.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
              : '—';

            const statusKey = c.fall_status || 'offen';
            const sc = STATUS_CONFIG[statusKey] || STATUS_CONFIG.offen;
            const statusBadge = isBusiness
              ? `<span class="ms-2" style="font-size:0.7rem;padding:2px 7px;border-radius:10px;background:${sc.bg};color:${sc.color};font-weight:600;">${sc.label}</span>`
              : '';
            const pinIcon = isBusiness && c.pinned
              ? `<span class="me-1" title="Favorit" aria-label="Favorit">📌</span>`
              : '';
            const notesIcon = isBusiness && c.notes
              ? `<span class="ms-1 text-muted" title="${escHtml(c.notes.slice(0,120))}" style="cursor:default;">💬</span>`
              : '';

            const statusSelect = isBusiness
              ? `<select class="form-select form-select-sm" style="font-size:0.7rem;padding:2px 6px;min-width:130px;" onchange="kontoFallStatusAendern('${c.id}', this.value)">
                  ${Object.entries(STATUS_CONFIG).map(([k,v]) => `<option value="${k}"${statusKey===k?' selected':''}>${v.label}</option>`).join('')}
                </select>`
              : '';
            const pinBtn = isBusiness
              ? `<button class="btn btn-sm" style="background:#f1f5f9;color:#475569;border:none;" title="${c.pinned?'Aus Favoriten entfernen':'Als Favorit markieren'}" onclick="kontoFallPinToggle('${c.id}')">${c.pinned ? '📌' : '☆'}</button>`
              : '';

            return `<tr>
              <td class="ps-3">
                <div class="fw-medium">${pinIcon}${escHtml(c.name || 'Unbenannter Fall')}${statusBadge}${notesIcon}</div>
                <div class="text-muted" style="font-size:0.75rem;">${positionen} Position${positionen !== 1 ? 'en' : ''}</div>
              </td>
              <td class="text-muted small">${datum}</td>
              <td class="text-end pe-2 small text-muted" style="white-space:nowrap;">${summeFormatiert}</td>
              <td>
                <div class="d-flex gap-1 justify-content-end flex-wrap">
                  ${statusSelect}
                  ${pinBtn}
                  <button class="btn btn-sm" style="background:#eff6ff;color:#1e3a8a;border:none;" onclick="kontoFallLaden('${c.id}')">Laden</button>
                  <button class="btn btn-sm" style="background:#f1f5f9;color:#475569;border:none;" onclick="kontoFallDuplizieren('${c.id}')">Kopieren</button>
                  <button class="btn btn-sm" style="background:#f1f5f9;color:#475569;border:none;" onclick="kontoFallExportieren('${c.id}')">Export</button>
                  <button class="btn btn-sm" style="background:#fef2f2;color:#ef4444;border:none;" onclick="kontoFallLoeschen('${c.id}')">Löschen</button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function kontoFallLaden(id) {
  const reg = kontoLadeRegistry();
  if (!reg.cases[id]) return;
  reg.currentCaseId = id;
  kontoSpeichereRegistry(reg);
  window.location.href = '/forderungsaufstellung';
}

function kontoFallLoeschen(id) {
  fordifyConfirm('Diesen Fall wirklich löschen?', () => {
    const reg = kontoLadeRegistry();
    delete reg.cases[id];
    if (reg.currentCaseId === id) reg.currentCaseId = null;
    kontoSpeichereRegistry(reg);
    kontoRendereFaelleTab();
  });
}

function kontoFallDuplizieren(id) {
  const reg = kontoLadeRegistry();
  const original = reg.cases[id];
  if (!original) return;
  const neueId = 'f' + Date.now();
  const kopie = JSON.parse(JSON.stringify(original)); // deep clone
  kopie.id = neueId;
  kopie.name = (kopie.name || 'Fall') + ' (Kopie)';
  kopie.updatedAt = new Date().toISOString();
  reg.cases[neueId] = kopie;
  kontoSpeichereRegistry(reg);
  kontoRendereFaelleTab();
}

function kontoFallExportieren(id) {
  const reg = kontoLadeRegistry();
  const eintrag = reg.cases[id];
  if (!eintrag) return;
  const data = { fall: eintrag.fall, naechsteId: eintrag.naechsteId, exportDatum: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Fordify_Fall_' + (eintrag.name || id).replace(/[/\\:*?"<>|]/g, '').replace(/\s+/g, '_').slice(0, 50) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function kontoFaelleExportierenAlle() {
  if (requiresPaid('json')) return;
  const reg = kontoLadeRegistry();
  const blob = new Blob([JSON.stringify({ fordify_cases: reg }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Fordify_Alle_Faelle_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function kontoFallImportieren(input) {
  if (requiresPaid('json-import')) return;
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      const reg = kontoLadeRegistry();

      if (data.fordify_cases && data.fordify_cases.cases) {
        // Bulk-Import: alle Fälle aus exportierter Gesamt-JSON
        const imported = Object.values(data.fordify_cases.cases);
        if (imported.length === 0) {
          alert('Die Datei enthält keine Fälle.');
          input.value = '';
          return;
        }
        let count = 0;
        for (const eintrag of imported) {
          if (!eintrag.id || !eintrag.fall) continue;
          reg.cases[eintrag.id] = { ...eintrag, updatedAt: eintrag.updatedAt || new Date().toISOString() };
          count++;
        }
        kontoSpeichereRegistry(reg);
        kontoRendereFaelleTab();
        alert(count + (count === 1 ? ' Fall importiert.' : ' Fälle importiert.'));
      } else if (data.fall) {
        // Einzel-Fall-Import
        const id = 'f' + Date.now();
        const mandant = data.fall.mandant || '';
        const gegner  = data.fall.gegner  || '';
        const name = mandant && gegner ? mandant + ' ./. ' + gegner : mandant || gegner || 'Importierter Fall';
        reg.cases[id] = { id, name, updatedAt: new Date().toISOString(), fall: data.fall, naechsteId: data.naechsteId || 1 };
        kontoSpeichereRegistry(reg);
        kontoRendereFaelleTab();
        alert('Fall "' + name + '" importiert.');
      } else {
        alert('Ungültige Datei. Bitte verwenden Sie eine von fordify exportierte Fall-JSON-Datei.');
      }
    } catch (e) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
    input.value = '';
  };
  reader.onerror = () => {
    alert('Datei konnte nicht gelesen werden.');
    input.value = '';
  };
  reader.readAsText(file);
}

function kontoNeuenFallAnlegen() {
  const reg = kontoLadeRegistry();
  const id = 'f' + Date.now();
  reg.cases[id] = {
    id,
    name: 'Neuer Fall',
    updatedAt: new Date().toISOString(),
    fall: { mandant: '', gegner: '', aktenzeichen: '', aufschlagPP: 9, insoDatum: null, forderungsgrundKat: '', titelArt: '', titelDatum: '', titelRechtskraft: '', titelGericht: '', titelAz: '', positionen: [] },
    naechsteId: 1,
  };
  reg.currentCaseId = id;
  kontoSpeichereRegistry(reg);
  window.location.href = '/forderungsaufstellung';
}

// ---- Tab: Firmendaten ----

const KONTO_IMP_FIELDS = [
  'name','strasse','plz','ort','tel','fax','email',
  'website','kammer','register','vertreten','ustid','bhv','iban','bic','bank',
  'impressum-url','datenschutz-url'
];

let _pendingLogoData = undefined; // undefined = keine Änderung; null = entfernen; string = neues DataURL

function kontoRendereFirmendatenTab() {
  const einst = kontoLadeEinstellungen();
  _pendingLogoData = undefined;

  const posEl = document.getElementById('konto-logo-position');
  if (posEl) posEl.value = einst.logoPosition || 'links';

  const imp = einst.imp || {};
  for (const suffix of KONTO_IMP_FIELDS) {
    const key = suffix.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const el = document.getElementById('konto-einst-imp-' + suffix);
    if (el) el.value = imp[key] || '';
  }

  _kontoAktualisiereLogoVorschau(einst.logo || null);
  _kontoAktualisiereFussVorschau();

  // Live-Vorschau bei Eingabe
  const col = document.getElementById('tab-firmendaten');
  if (col) {
    col.removeEventListener('input', _kontoAktualisiereFussVorschau);
    col.addEventListener('input', _kontoAktualisiereFussVorschau);
  }
}

function _kontoAktualisiereLogoVorschau(src) {
  const img = document.getElementById('konto-logo-vorschau');
  if (!img) return;
  if (src) {
    img.src = src;
    img.style.display = '';
  } else {
    img.src = '';
    img.style.display = 'none';
  }
}

function kontoLogoBildLaden(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('Logo-Datei ist zu groß (max. 2 MB).');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    _pendingLogoData = ev.target.result;
    _kontoAktualisiereLogoVorschau(_pendingLogoData);
  };
  reader.onerror = () => {
    alert('Logo konnte nicht gelesen werden.');
    input.value = '';
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function kontoLogoEntfernen() {
  _pendingLogoData = null;
  _kontoAktualisiereLogoVorschau(null);
}

function _kontoLeseImpFelder() {
  const imp = {};
  for (const suffix of KONTO_IMP_FIELDS) {
    const key = suffix.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const el = document.getElementById('konto-einst-imp-' + suffix);
    imp[key] = el ? el.value.trim() : '';
  }
  return imp;
}

function _kontoGeneriereImpressumFooterHtml(imp) {
  if (!imp) return '';
  const parts = [];
  if (imp.name)     parts.push(`<strong>${escHtml(imp.name)}</strong>`);
  const adresse = [imp.strasse, (imp.plz && imp.ort ? imp.plz + ' ' + imp.ort : imp.plz || imp.ort)].filter(Boolean);
  if (adresse.length) parts.push(adresse.map(_escHtml).join(', '));
  if (imp.tel)      parts.push('Tel: ' + escHtml(imp.tel));
  if (imp.fax)      parts.push('Fax: ' + escHtml(imp.fax));
  if (imp.email)    parts.push('E-Mail: ' + escHtml(imp.email));
  if (imp.website)  parts.push(escHtml(imp.website));
  if (imp.kammer)   parts.push(escHtml(imp.kammer));
  if (imp.ustid)    parts.push('USt-IdNr.: ' + escHtml(imp.ustid));
  return parts.join(' &middot; ');
}

function _kontoAktualisiereFussVorschau() {
  const el = document.getElementById('konto-imp-vorschau');
  if (!el) return;
  const html = _kontoGeneriereImpressumFooterHtml(_kontoLeseImpFelder());
  el.innerHTML = html || '<em style="color:#94a3b8;">Vorschau erscheint hier…</em>';
}

function kontoEinstellungenSpeichern() {
  const einst = kontoLadeEinstellungen();

  if (_pendingLogoData !== undefined) {
    einst.logo = _pendingLogoData; // null = entfernen, string = neues Logo
  }

  einst.logoPosition = document.getElementById('konto-logo-position')?.value || 'links';
  einst.imp = _kontoLeseImpFelder();

  kontoSpeichereEinstellungen(einst);
  _pendingLogoData = undefined;

  // Kurzfeedback
  const btn = document.querySelector('[onclick="kontoEinstellungenSpeichern()"]');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Gespeichert ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
  }
}

function kontoEinstellungenExportieren() {
  const einst = kontoLadeEinstellungen();
  const blob = new Blob([JSON.stringify({ fordify_settings: einst }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const firma = ((einst.imp || {}).name || '').replace(/[/\\:*?"<>|]/g, '').replace(/\s+/g, '_').slice(0, 50);
  a.download = 'Fordify_Einstellungen' + (firma ? '_' + firma : '') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function kontoEinstellungenImportieren(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed.fordify_settings) {
        alert('Import fehlgeschlagen: Dies ist keine fordify-Einstellungsdatei.');
        input.value = '';
        return;
      }
      kontoSpeichereEinstellungen(parsed.fordify_settings);
      kontoRendereFirmendatenTab();
    } catch (e) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
    input.value = '';
  };
  reader.onerror = () => {
    alert('Datei konnte nicht gelesen werden.');
    input.value = '';
  };
  reader.readAsText(file);
}

function kontoThemeWechseln(name) {
  const valid = ['brand', 'dark', 'clean'];
  if (!valid.includes(name)) name = 'brand';
  // Theme is always local-only (not Supabase-synced) — direct localStorage is intentional
  localStorage.setItem(KONTO_STORAGE_KEY_THEME, name);
  alert('Theme "' + name + '" gespeichert. Es wird aktiv, sobald Sie die Forderungsaufstellungs-Seite öffnen.');
}

// ---- Tab: Abo ----

function kontoRendereAboTab() {
  const plan = fordifyAuth.plan || 'free';
  const configs = {
    pro:      { label: 'PRO',      bg: '#fef3c7', color: '#92400e' },
    business: { label: 'BUSINESS', bg: '#dbeafe', color: '#1e40af' },
  };
  const c = configs[plan];

  const badgeEl = document.getElementById('konto-abo-plan-badge');
  if (badgeEl) {
    if (c) {
      badgeEl.innerHTML = `<span class="plan-badge" style="background:${c.bg};color:${c.color};font-size:1rem;padding:4px 14px;">${c.label}</span>`;
    } else {
      badgeEl.textContent = 'Kein aktives Abo';
    }
  }

  // Laufzeit aus Supabase laden
  if (supabaseClient && fordifyAuth.user) {
    supabaseClient
      .from('subscriptions')
      .select('current_period_end')
      .eq('user_id', fordifyAuth.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) { console.warn('Abo-Laufzeit nicht ladbar:', error.message); return; }
        const laufzeitEl = document.getElementById('konto-abo-laufzeit');
        if (laufzeitEl && data?.current_period_end) {
          laufzeitEl.textContent = new Date(data.current_period_end).toLocaleDateString('de-DE');
        }
      })
      .catch(e => console.warn('Abo-Laufzeit Netzwerkfehler:', e));
  }

  const avvEl = document.getElementById('konto-abo-avv');
  if (avvEl) {
    const agbDatum = fordifyAuth.acceptedAgbAt
      ? new Date(fordifyAuth.acceptedAgbAt).toLocaleDateString('de-DE') : null;
    const avvDatum = fordifyAuth.acceptedAvvAt
      ? new Date(fordifyAuth.acceptedAvvAt).toLocaleDateString('de-DE') : null;
    avvEl.innerHTML = `
      <div class="d-flex flex-column gap-1">
        <div class="small">
          ${agbDatum
            ? `<span class="text-success">✓ AGB akzeptiert am ${agbDatum}</span>`
            : `<span class="text-muted">AGB: nicht dokumentiert</span>`}
          &nbsp;<a href="/agb" target="_blank" rel="noopener noreferrer" class="text-muted">lesen ↗</a>
        </div>
        <div class="small">
          ${avvDatum
            ? `<span class="text-success">✓ AVV geschlossen am ${avvDatum}</span>`
            : `<span class="text-muted">AVV: nicht dokumentiert</span>`}
          &nbsp;<a href="/avv" target="_blank" rel="noopener noreferrer" class="text-muted">lesen ↗</a>
        </div>
      </div>`;
  }
}

// ---- Tab: Adressen ----

function kontoRendereAdressbuchTab() {
  _kontoRendereKontaktListe('schuldner');

  const isBusiness = fordifyAuth.plan === 'business';
  const gateEl = document.getElementById('mandanten-gate-hinweis');
  const neuBtn = document.getElementById('mandant-neu-btn');
  const formEl = document.getElementById('mandant-form-wrap');

  if (gateEl)  gateEl.classList.toggle('d-none', isBusiness);
  if (neuBtn)  neuBtn.style.display = isBusiness ? '' : 'none';
  if (formEl && !isBusiness) formEl.classList.add('d-none');

  if (isBusiness) _kontoRendereKontaktListe('mandant');
}

function _kontoRendereKontaktListe(type) {
  const listeEl = document.getElementById(type === 'schuldner' ? 'schuldner-liste' : 'mandanten-liste');
  if (!listeEl) return;
  const eintraege = fordifyContacts[type === 'schuldner' ? 'schuldner' : 'mandanten'];

  if (eintraege.length === 0) {
    listeEl.innerHTML = '<p class="text-muted small mt-3 mb-0">Noch keine Einträge vorhanden.</p>';
    return;
  }

  listeEl.innerHTML = `
    <div class="list-group list-group-flush mt-3">
      ${eintraege.map(k => {
        const eid = escHtml(k.id);
        const adresse = [k.strasse, k.plz && k.ort ? k.plz + ' ' + k.ort : (k.plz || k.ort)].filter(Boolean);
        const neuFallBtn = type === 'schuldner'
          ? `<button class="btn btn-sm" style="background:#eff6ff;color:#1e3a8a;border:none;white-space:nowrap;"
                    onclick="kontoFallAusSchuldnerAnlegen('${eid}')">Neuer Fall</button>`
          : '';
        return `<div class="list-group-item px-0" id="kontakt-${eid}">
          <div class="d-flex align-items-start justify-content-between gap-2">
            <div>
              <div class="fw-medium">${escHtml(k.name)}</div>
              ${adresse.length ? `<div class="text-muted small">${adresse.map(_escHtml).join(', ')}</div>` : ''}
              ${k.email ? `<div class="text-muted small">${escHtml(k.email)}</div>` : ''}
              ${k.telefon ? `<div class="text-muted small">${escHtml(k.telefon)}</div>` : ''}
            </div>
            <div class="d-flex gap-1 flex-shrink-0 flex-wrap justify-content-end">
              ${neuFallBtn}
              <button class="btn btn-sm" style="background:#f1f5f9;color:#475569;border:none;"
                      onclick="kontoKontaktBearbeitenToggle('${eid}')">Bearbeiten</button>
              <button class="btn btn-sm" style="background:#fef2f2;color:#ef4444;border:none;"
                      onclick="kontoKontaktLoeschen('${eid}')">Löschen</button>
            </div>
          </div>
          <div class="d-none mt-2" id="kontakt-edit-${eid}">
            <div class="p-3 border rounded bg-light">
              <div class="row g-2">
                <div class="col-12">
                  <input type="text" class="form-control form-control-sm" id="ke-name-${eid}"
                         value="${escHtml(k.name)}" placeholder="Name *">
                </div>
                <div class="col-12">
                  <input type="text" class="form-control form-control-sm" id="ke-strasse-${eid}"
                         value="${escHtml(k.strasse || '')}" placeholder="Straße">
                </div>
                <div class="col-4">
                  <input type="text" class="form-control form-control-sm" id="ke-plz-${eid}"
                         value="${escHtml(k.plz || '')}" placeholder="PLZ">
                </div>
                <div class="col-8">
                  <input type="text" class="form-control form-control-sm" id="ke-ort-${eid}"
                         value="${escHtml(k.ort || '')}" placeholder="Ort">
                </div>
                <div class="col-sm-6">
                  <input type="email" class="form-control form-control-sm" id="ke-email-${eid}"
                         value="${escHtml(k.email || '')}" placeholder="E-Mail">
                </div>
                <div class="col-sm-6">
                  <input type="tel" class="form-control form-control-sm" id="ke-telefon-${eid}"
                         value="${escHtml(k.telefon || '')}" placeholder="Telefon">
                </div>
              </div>
              <div class="mt-2 d-flex gap-2">
                <button class="btn btn-sm btn-primary" onclick="kontoKontaktAktualisieren('${eid}')">Speichern</button>
                <button class="btn btn-sm btn-outline-secondary"
                        onclick="kontoKontaktBearbeitenToggle('${eid}')">Abbrechen</button>
              </div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function kontoKontaktBearbeitenToggle(id) {
  const el = document.getElementById('kontakt-edit-' + id);
  if (el) el.classList.toggle('d-none');
}

async function kontoKontaktAktualisieren(id) {
  const name = (document.getElementById('ke-name-' + id)?.value || '').trim();
  if (!name) { alert('Name ist erforderlich.'); return; }
  const updates = {
    name,
    strasse: document.getElementById('ke-strasse-' + id)?.value.trim() || null,
    plz:     document.getElementById('ke-plz-'     + id)?.value.trim() || null,
    ort:     document.getElementById('ke-ort-'     + id)?.value.trim() || null,
    email:   document.getElementById('ke-email-'   + id)?.value.trim() || null,
    telefon: document.getElementById('ke-telefon-' + id)?.value.trim() || null,
  };
  const result = await aktualisiereKontakt(id, updates);
  if (!result) { alert('Aktualisierung fehlgeschlagen. Bitte erneut versuchen.'); return; }
  kontoRendereAdressbuchTab();
}

function kontoFallAusSchuldnerAnlegen(id) {
  const kontakt = fordifyContacts.schuldner.find(c => String(c.id) === String(id));
  if (!kontakt) return;
  const reg = kontoLadeRegistry();
  const newId = 'f' + Date.now();
  reg.cases[newId] = {
    id: newId,
    name: kontakt.name,
    updatedAt: new Date().toISOString(),
    naechsteId: 1,
    fall: {
      mandant: '', gegner: kontakt.name, aktenzeichen: '',
      aufschlagPP: 9, insoDatum: null,
      forderungsgrundKat: '', titelArt: '', titelDatum: '',
      titelRechtskraft: '', titelGericht: '', titelAz: '',
      positionen: []
    }
  };
  reg.currentCaseId = newId;
  kontoSpeichereRegistry(reg);
  window.location.href = '/forderungsaufstellung';
}

function kontoAdressbuchFormToggle(type) {
  const el = document.getElementById(type + '-form-wrap');
  if (!el) return;
  el.classList.toggle('d-none');
  if (!el.classList.contains('d-none')) {
    const first = el.querySelector('input');
    if (first) first.focus();
  }
}

function kontoKontaktSpeichern(type) {
  const name = (document.getElementById(type + '-inp-name')?.value || '').trim();
  if (!name) { alert('Name ist erforderlich.'); return; }

  const kontakt = {
    name,
    strasse: (document.getElementById(type + '-inp-strasse')?.value || '').trim() || null,
    plz:     (document.getElementById(type + '-inp-plz')?.value || '').trim() || null,
    ort:     (document.getElementById(type + '-inp-ort')?.value || '').trim() || null,
    email:   (document.getElementById(type + '-inp-email')?.value || '').trim() || null,
    telefon: (document.getElementById(type + '-inp-telefon')?.value || '').trim() || null,
  };

  speichereKontakt(type, kontakt).then(result => {
    if (!result) { alert('Speichern fehlgeschlagen. Bitte erneut versuchen.'); return; }
    ['name', 'strasse', 'plz', 'ort', 'email', 'telefon'].forEach(f => {
      const el = document.getElementById(type + '-inp-' + f);
      if (el) el.value = '';
    });
    document.getElementById(type + '-form-wrap')?.classList.add('d-none');
    kontoRendereAdressbuchTab();
  });
}

async function kontoKontaktLoeschen(id) {
  fordifyConfirm('Diesen Eintrag wirklich löschen?', async () => {
    await loescheKontakt(id);
    kontoRendereAdressbuchTab();
  });
}

// ---- CSV-Import (Business) ----

function kontoCSVImportOeffnen() {
  if (requiresBusiness('csv-import')) return;
  document.getElementById('csv-import-input').click();
}

function kontoCSVImportDatei(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const rows = _parseCSV(ev.target.result);
    if (rows.length === 0) {
      alert('Die CSV-Datei enthält keine gültigen Zeilen.\nPflichtfelder: gegner, betrag');
      input.value = '';
      return;
    }

    const reg = kontoLadeRegistry();
    const baseTime = Date.now();
    let importiert = 0;
    let fehler = 0;

    for (let i = 0; i < rows.length; i++) {
      const eintrag = _csvZeileZuFall(rows[i], baseTime, i);
      if (!eintrag) { fehler++; continue; }
      reg.cases[eintrag.id] = eintrag;
      importiert++;
    }

    if (importiert === 0) {
      alert('Kein Fall konnte importiert werden.\nBitte prüfen Sie, ob „gegner" und „betrag" in der CSV vorhanden sind.');
      input.value = '';
      return;
    }

    kontoSpeichereRegistry(reg);
    kontoRendereFaelleTab();

    const msg = importiert === 1
      ? '1 Fall erfolgreich importiert.'
      : importiert + ' Fälle erfolgreich importiert.';
    alert(fehler > 0
      ? msg + '\n' + fehler + ' Zeile(n) übersprungen (fehlende Pflichtfelder).'
      : msg);
    input.value = '';
  };
  reader.onerror = () => {
    alert('Datei konnte nicht gelesen werden.');
    input.value = '';
  };
  reader.readAsText(file, 'UTF-8');
}

function _parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const delimiter = _csvDetectDelimiter(lines[0]);
  const headers = _csvSplitLine(lines[0], delimiter).map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = _csvSplitLine(line, delimiter);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

function _csvDetectDelimiter(firstLine) {
  const semis  = (firstLine.match(/;/g)  || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semis > commas ? ';' : ',';
}

function _csvSplitLine(line, delimiter = ',') {
  const values = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === delimiter && !inQuotes) {
      values.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  values.push(cur);
  return values;
}

function _csvBetragsNormalisieren(raw) {
  if (!raw) return '';
  let s = raw.replace(/[€$£\s]/g, '');
  if (s.includes('.') && s.includes(',')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '');
    } else {
      s = s.replace(/,/g, '').replace('.', ',');
    }
  } else if (s.includes('.') && !s.includes(',')) {
    s = s.replace('.', ',');
  }
  if (s && !/^\d+(,\d+)?$/.test(s)) return '';
  return s;
}

function _csvZeileZuFall(row, baseTime, index) {
  const gegner = (row.gegner || '').trim();
  if (!gegner) return null;
  const betrag = _csvBetragsNormalisieren(row.betrag || '');
  if (!betrag) return null;

  const mandant      = (row.mandant || '').trim();
  const aktenzeichen = (row.aktenzeichen || '').trim();
  const datum        = (row.faelligkeitsdatum || '').trim();
  const pp = parseInt(row.aufschlag_pp, 10);
  const aufschlagPP = !isNaN(pp) ? pp : 9;
  const id           = 'f' + baseTime + '_' + index;
  const name         = mandant && gegner ? mandant + ' ./. ' + gegner : gegner;

  return {
    id,
    name,
    updatedAt: new Date().toISOString(),
    naechsteId: 2,
    fall: {
      mandant, gegner, aktenzeichen, aufschlagPP,
      insoDatum: null, forderungsgrundKat: '', titelArt: '', titelDatum: '',
      titelRechtskraft: '', titelGericht: '', titelAz: '',
      positionen: [{
        typ: 'hauptforderung', id: 1, gruppeId: 'g1',
        datum, betrag, bezeichnung: 'Hauptforderung'
      }]
    }
  };
}

// ---- CSV-Export (6.2) ----

function kontoFaelleExportierenAlsCSV() {
  if (requiresPaid('csv-export')) return;
  const reg = kontoLadeRegistry();
  const cases = Object.values(reg.cases || {}).sort(
    (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')
  );

  const header = ['FallID', 'Aktenzeichen', 'Name', 'Mandant', 'Geändert', 'Gesamtforderung_EUR', 'Restforderung_EUR', 'Status'];
  const rows = cases.map(c => {
    const fallId = c.id || '';
    const az = c.fall?.aktenzeichen || '';
    const gegner = c.fall?.gegner || '';
    const mandant = c.fall?.mandant || '';
    const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('de-DE') : '';
    const gesamtHF = _hfSumme(c.fall?.positionen);
    const gezahlt = _zahlungenSumme(c.fall?.positionen);
    const rest = Math.max(0, gesamtHF - gezahlt);
    const statusKey = c.fall_status || 'offen';
    const statusLabel = STATUS_CONFIG[statusKey]?.label || 'Offen';
    return [
      fallId, az, gegner, mandant, datum,
      gesamtHF.toFixed(2).replace('.', ','),
      rest.toFixed(2).replace('.', ','),
      statusLabel
    ].map(_csvQuote).join(';');
  });

  const bom = '﻿';
  const csv = bom + header.map(_csvQuote).join(';') + '\r\n' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Fordify_Faelle_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ---- CSV-Export Hilfsfunktionen ----

function _hfSumme(positionen) {
  return (positionen || [])
    .filter(p => p.typ === 'hauptforderung')
    .reduce((s, p) => {
      const val = parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.'));
      return s + (isNaN(val) ? 0 : val);
    }, 0);
}

function _zahlungenSumme(positionen) {
  return (positionen || [])
    .filter(p => p.typ === 'zahlung')
    .reduce((s, p) => {
      const val = parseFloat((p.betrag || '0').replace(/\./g, '').replace(',', '.'));
      return s + (isNaN(val) ? 0 : val);
    }, 0);
}

function _csvQuote(val) {
  let s = String(val == null ? '' : val);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ---- Schuldner-CSV-Import (6.3) ----

function kontoSchuldnerCSVImportOeffnen() {
  if (requiresPaid('schuldner-adressbuch')) return;
  document.getElementById('schuldner-csv-import-input').click();
}

function kontoSchuldnerCSVImportDatei(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const text = ev.target.result.replace(/^﻿/, ''); // BOM entfernen
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { alert('CSV leer oder kein Header gefunden.'); input.value = ''; return; }

    const delimiter = _csvDetectDelimiter(lines[0]);
    const headers = _csvSplitLine(lines[0], delimiter).map(h => h.trim().toLowerCase());
    const nameIdx    = headers.indexOf('name');
    const strasseIdx = headers.indexOf('strasse');
    const plzIdx     = headers.indexOf('plz');
    const ortIdx     = headers.indexOf('ort');
    const emailIdx   = headers.indexOf('email');
    const telefonIdx = headers.indexOf('telefon');

    if (nameIdx === -1) { alert('Spalte "name" fehlt in der CSV-Datei.'); input.value = ''; return; }

    let ok = 0, skip = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = _csvSplitLine(lines[i], delimiter);
      const name = (cols[nameIdx] || '').trim();
      if (!name) { skip++; continue; }
      const kontakt = {
        name,
        strasse: strasseIdx >= 0 ? (cols[strasseIdx] || '').trim() || null : null,
        plz:     plzIdx     >= 0 ? (cols[plzIdx]     || '').trim() || null : null,
        ort:     ortIdx     >= 0 ? (cols[ortIdx]      || '').trim() || null : null,
        email:   emailIdx   >= 0 ? (cols[emailIdx]    || '').trim() || null : null,
        telefon: telefonIdx >= 0 ? (cols[telefonIdx]  || '').trim() || null : null,
      };
      const result = await speichereKontakt('schuldner', kontakt);
      if (result) ok++; else skip++;
    }
    input.value = '';
    alert(ok + (ok === 1 ? ' Eintrag importiert' : ' Einträge importiert') + (skip ? ', ' + skip + ' übersprungen.' : '.'));
    kontoRendereAdressbuchTab();
  };
  reader.onerror = () => { alert('Datei konnte nicht gelesen werden.'); input.value = ''; };
  reader.readAsText(file, 'UTF-8');
}

// ---- AGB + AVV Konsens-Status ----
// accepted_agb_at und accepted_avv_at werden beim Checkout gesetzt (Paddle-Webhook)
// und in _pruefeKonsens() geladen. Darstellung in kontoRendereAboTab().
