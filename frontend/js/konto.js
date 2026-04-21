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
  try {
    StorageBackend.setItem(KONTO_STORAGE_KEY_SETTINGS, JSON.stringify(einst));
  } catch (e) { console.warn('Einstellungen speichern fehlgeschlagen:', e); }
}

// ---- Auth-Guard und Init ----

document.addEventListener('DOMContentLoaded', async () => {
  if (!supabaseClient) {
    window.location.href = '/forderungsaufstellung';
    return;
  }

  try {
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
  } catch (e) {
    console.error('Konto-Init fehlgeschlagen:', e);
    const loadingEl = document.getElementById('konto-loading');
    if (loadingEl) loadingEl.innerHTML = '<p class="text-danger">Fehler beim Laden. Bitte Seite neu laden.</p>';
  }
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
  if (imp.name)     parts.push(`<strong>${_escHtml(imp.name)}</strong>`);
  const adresse = [imp.strasse, (imp.plz && imp.ort ? imp.plz + ' ' + imp.ort : imp.plz || imp.ort)].filter(Boolean);
  if (adresse.length) parts.push(adresse.map(_escHtml).join(', '));
  if (imp.tel)      parts.push('Tel: ' + _escHtml(imp.tel));
  if (imp.fax)      parts.push('Fax: ' + _escHtml(imp.fax));
  if (imp.email)    parts.push('E-Mail: ' + _escHtml(imp.email));
  if (imp.website)  parts.push(_escHtml(imp.website));
  if (imp.kammer)   parts.push(_escHtml(imp.kammer));
  if (imp.ustid)    parts.push('USt-IdNr.: ' + _escHtml(imp.ustid));
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
}
