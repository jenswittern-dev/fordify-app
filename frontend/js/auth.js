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
    .single();

  if (data && data.status === 'active') {
    fordifyAuth.hasSubscription = true;
    fordifyAuth.plan = data.plan; // 'pro' oder 'business'
  } else {
    fordifyAuth.hasSubscription = false;
    fordifyAuth.plan = 'free';
  }
}

async function loginMitEmail(email) {
  if (!supabaseClient) { _loginStatus('Auth nicht konfiguriert.', 'danger'); return; }
  email = (email || '').trim();
  if (!email) { _loginStatus('Bitte E-Mail eingeben.', 'danger'); return; }

  _loginStatus('Link wird gesendet…', 'info');
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: _emailRedirectTo() }
  });

  if (error) {
    _loginStatus('Fehler: ' + error.message, 'danger');
  } else {
    _loginStatus('Link gesendet – bitte E-Mail prüfen und Link in diesem Browser öffnen.', 'success');
    trackEvent('login-link-gesendet');
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
  if (event === 'SIGNED_IN') {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    await ladeSubscriptionStatus();
    await migrateSessionToCloud();
    StorageBackend.init(fordifyAuth);
    await ladeCloudDaten();
    aktualisiereUIFuerAuth();
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
