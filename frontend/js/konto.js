'use strict';

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
  StorageBackend.setItem(KONTO_STORAGE_KEY_SETTINGS, JSON.stringify(einst));
}

// ---- Auth-Guard und Init ----

document.addEventListener('DOMContentLoaded', async () => {
  if (!supabaseClient) {
    window.location.href = '/forderungsaufstellung';
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = '/forderungsaufstellung';
    return;
  }

  fordifyAuth.isAuthenticated = true;
  fordifyAuth.user = session.user;
  await ladeSubscriptionStatus();
  StorageBackend.init(fordifyAuth);
  aktualisiereUIFuerAuth();

  _kontoUpdateHero();
  _kontoInitTabs();
  _kontoActivateTabFromUrl();

  document.getElementById('konto-loading').style.display = 'none';
  document.getElementById('konto-content').classList.remove('d-none');
});

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
  if (tab && ['faelle', 'firmendaten', 'abo'].includes(tab)) {
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
}

// ---- Tab: Fälle ----

function kontoRendereFaelleTab() {
  const reg = kontoLadeRegistry();
  const cases = Object.values(reg.cases).sort((a, b) =>
    (b.updatedAt || '').localeCompare(a.updatedAt || '')
  );

  const anzahlEl = document.getElementById('faelle-anzahl');
  if (anzahlEl) anzahlEl.textContent = cases.length === 1 ? '1 gespeicherter Fall' : cases.length + ' gespeicherte Fälle';

  const listeEl = document.getElementById('faelle-liste');
  if (!listeEl) return;

  if (cases.length === 0) {
    listeEl.innerHTML = `
      <div class="text-center py-5 text-muted">
        <p class="mb-3">Noch keine gespeicherten Fälle.</p>
        <button class="btn btn-primary" onclick="kontoNeuenFallAnlegen()">Ersten Fall anlegen</button>
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
            <th style="width:1%;white-space:nowrap;"></th>
          </tr>
        </thead>
        <tbody>
          ${cases.map(c => {
            const datum = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('de-DE') : '';
            const positionen = (c.fall?.positionen || []).length;
            return `<tr>
              <td class="ps-3">
                <div class="fw-medium">${_escHtml(c.name || 'Unbenannter Fall')}</div>
                <div class="text-muted" style="font-size:0.75rem;">${positionen} Position${positionen !== 1 ? 'en' : ''}</div>
              </td>
              <td class="text-muted small">${datum}</td>
              <td>
                <div class="d-flex gap-1 justify-content-end">
                  <button class="btn btn-sm" style="background:#eff6ff;color:#1e3a8a;border:none;" onclick="kontoFallLaden('${c.id}')">Laden</button>
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

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function kontoFallLaden(id) {
  const reg = kontoLadeRegistry();
  if (!reg.cases[id]) return;
  reg.currentCaseId = id;
  kontoSpeichereRegistry(reg);
  window.location.href = '/forderungsaufstellung';
}

function kontoFallLoeschen(id) {
  if (!confirm('Diesen Fall wirklich löschen?')) return;
  const reg = kontoLadeRegistry();
  delete reg.cases[id];
  if (reg.currentCaseId === id) reg.currentCaseId = null;
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
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.fall) {
        alert('Ungültige Datei. Bitte verwenden Sie eine von fordify exportierte Fall-JSON-Datei.');
        input.value = '';
        return;
      }
      const reg = kontoLadeRegistry();
      const id = 'f' + Date.now();
      const mandant = data.fall.mandant || '';
      const gegner  = data.fall.gegner  || '';
      const name = mandant && gegner ? mandant + ' ./. ' + gegner : mandant || gegner || 'Importierter Fall';
      reg.cases[id] = {
        id,
        name,
        updatedAt: new Date().toISOString(),
        fall: data.fall,
        naechsteId: data.naechsteId || 1,
      };
      kontoSpeichereRegistry(reg);
      kontoRendereFaelleTab();
    } catch (e) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
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

// Stubs for Task 4 (will be replaced)
function kontoRendereFirmendatenTab() {}
function kontoRendereAboTab() {}
