// fordify Auth – Supabase Magic Link
// Setzt voraus: CONFIG aus config.js, StorageBackend aus storage.js

let supabaseClient = null;
if (CONFIG.supabase.url && CONFIG.supabase.anonKey) {
  supabaseClient = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
}

const fordifyAuth = {
  isAuthenticated: false,
  hasSubscription: false,
  user: null,
  plan: 'free'
};

function _emailRedirectTo() {
  const params = new URLSearchParams(window.location.search);
  const checkout = params.get('checkout');
  if (checkout && typeof VALID_CHECKOUT_PARAMS !== 'undefined' && VALID_CHECKOUT_PARAMS.includes(checkout)) {
    return window.location.origin + '/preise?' + params.toString();
  }
  return window.location.origin + '/forderungsaufstellung';
}

async function ladeSubscriptionStatus() {
  if (!fordifyAuth.user) return;
  const { data } = await supabaseClient
    .from('subscriptions')
    .select('status, plan, current_period_end')
    .eq('user_id', fordifyAuth.user.id)
    .maybeSingle();

  if (data && data.status === 'active') {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = data.plan; // 'pro' oder 'business'
  } else {
    fordifyAuth.hasSubscription = false;
    fordifyAuth.plan = 'free';
  }
}

async function loginMitEmail(email) {
  email = (email || '').trim();
  if (!email) { _loginStatus('Bitte E-Mail eingeben.', 'danger'); return; }
  if (!CONFIG.supabase.url) { _loginStatus('Auth auf dieser Umgebung nicht konfiguriert.', 'danger'); return; }

  _loginStatus('Link wird gesendet…', 'info');
  try {
    const resp = await fetch(CONFIG.supabase.url + '/functions/v1/verify-and-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': CONFIG.supabase.anonKey },
      body: JSON.stringify({ email, redirectTo: _emailRedirectTo() })
    });
    const json = await resp.json();

    if (resp.status === 403 && json.error === 'kein_abo') {
      const safeHref = (typeof json.preiseUrl === 'string' && json.preiseUrl.startsWith('https://fordify.de'))
        ? json.preiseUrl : '/preise';
      _loginStatusMitLink(
        'Kein aktives Abo gefunden. Bitte zuerst ',
        'abonnieren',
        safeHref,
        '.'
      );
      return;
    }
    if (!resp.ok) {
      _loginStatus('Fehler beim Senden. Bitte erneut versuchen.', 'danger');
      return;
    }
    _loginStatus('Link gesendet – bitte E-Mail prüfen und Link in diesem Browser öffnen.', 'success');
    trackEvent('login-link-gesendet');
  } catch (e) {
    _loginStatus('Netzwerkfehler. Bitte erneut versuchen.', 'danger');
  }
}

async function logout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  trackEvent('logout');
}

async function migrateSessionToCloud() {
  // Daten aus der aktuellen Free-Sitzung (sessionStorage) in die Cloud übertragen
  const casesRaw = sessionStorage.getItem(STORAGE_KEY_CASES);
  if (!casesRaw) return;
  const reg = JSON.parse(casesRaw);
  const count = Object.keys(reg.cases || {}).length;
  if (count === 0) return;

  const confirmed = confirm(
    `${count} Fall/Fälle aus dieser Sitzung gefunden.\nIn dein Cloud-Konto übernehmen?`
  );
  if (!confirmed) return;

  for (const c of Object.values(reg.cases || {})) {
    await supabaseClient.from('cases').upsert({
      id: c.id,
      user_id: fordifyAuth.user.id,
      name: c.name,
      data: c.fall,
      naechste_id: c.naechsteId,
      updated_at: new Date().toISOString()
    });
  }
  sessionStorage.removeItem(STORAGE_KEY_CASES);
  sessionStorage.removeItem(STORAGE_KEY_SETTINGS);
}

async function ladeCloudDaten() {
  if (!fordifyAuth.hasSubscription) return;

  const { data: cases } = await supabaseClient
    .from('cases')
    .select('*')
    .eq('user_id', fordifyAuth.user.id);

  if (cases && cases.length > 0) {
    const reg = { cases: {}, naechsteId: 1 };
    cases.forEach(c => {
      reg.cases[c.id] = {
        id: c.id, name: c.name,
        fall: c.data, naechsteId: c.naechste_id,
        updatedAt: c.updated_at
      };
    });
    StorageBackend.setItem(STORAGE_KEY_CASES, JSON.stringify(reg));
  }

  const { data: settings } = await supabaseClient
    .from('settings')
    .select('data')
    .eq('user_id', fordifyAuth.user.id)
    .single();

  if (settings) {
    StorageBackend.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings.data));
  }

  // App mit geladenen Cloud-Daten neu initialisieren
  if (typeof laden === 'function') laden();
}

// Auth-State-Listener
if (supabaseClient) supabaseClient.auth.onAuthStateChange(async (event, session) => {
  // INITIAL_SESSION: bereits eingeloggt, Seite neu geladen oder von anderer Seite navigiert
  if (event === 'INITIAL_SESSION' && session) {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    aktualisiereUIFuerAuth();
    await ladeSubscriptionStatus();
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
    checkAutoCheckout();
    // Auf forderungsaufstellung: App mit korrektem StorageBackend (localStorage) neu laden
    if (fordifyAuth.hasSubscription && typeof laden === 'function') laden();
  }
  if (event === 'SIGNED_IN') {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    aktualisiereUIFuerAuth(); // Avatar sofort zeigen, Plan-Badge aktualisiert sich nach DB-Call
    await ladeSubscriptionStatus();
    await migrateSessionToCloud();
    StorageBackend.init(fordifyAuth);
    await ladeCloudDaten();
    aktualisiereUIFuerAuth(); // Nochmal für Plan-Badge (pro/business)
    checkAutoCheckout();
    // Login-Modal schließen falls offen
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (modal) modal.hide();
    trackEvent('login');
  }
  if (event === 'SIGNED_OUT') {
    fordifyAuth.isAuthenticated = false;
    fordifyAuth.hasSubscription = false;
    fordifyAuth.user = null;
    fordifyAuth.plan = 'free';
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
  }
});

function _loginStatus(msg, type) {
  const el = document.getElementById('login-status');
  if (!el) return;
  el.className = `alert alert-${type} py-2 small mb-0 mt-2`;
  el.textContent = msg;
  el.classList.remove('d-none');
}

function _loginStatusMitLink(before, linkText, href, after) {
  const el = document.getElementById('login-status');
  if (!el) return;
  el.className = 'alert alert-danger py-2 small mb-0 mt-2';
  el.innerHTML = '';
  el.appendChild(document.createTextNode(before));
  const a = document.createElement('a');
  a.href = href;
  a.textContent = linkText;
  el.appendChild(a);
  el.appendChild(document.createTextNode(after));
  el.classList.remove('d-none');
}
