// fordify Auth – Supabase Magic Link
// Setzt voraus: CONFIG aus config.js, StorageBackend aus storage.js

const supabaseClient = window.supabase.createClient(
  CONFIG.supabase.url,
  CONFIG.supabase.anonKey
);

const fordifyAuth = {
  isAuthenticated: false,
  hasSubscription: false,
  user: null,
  plan: 'free'
};

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
  email = (email || '').trim();
  if (!email) { _loginStatus('Bitte E-Mail eingeben.', 'danger'); return; }

  _loginStatus('Link wird gesendet…', 'info');
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/forderungsaufstellung' }
  });

  if (error) {
    _loginStatus('Fehler: ' + error.message, 'danger');
  } else {
    _loginStatus('Link gesendet – prüfe dein Postfach.', 'success');
    trackEvent('login-link-gesendet');
  }
}

async function logout() {
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

// Auth-State-Listener
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    fordifyAuth.isAuthenticated = true;
    fordifyAuth.user = session.user;
    await ladeSubscriptionStatus();
    await migrateSessionToCloud();
    StorageBackend.init(fordifyAuth);
    aktualisiereUIFuerAuth();
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

function aktualisiereUIFuerAuth() {
  const isAuth = fordifyAuth.isAuthenticated;
  const isPaid = fordifyAuth.hasSubscription;

  document.querySelectorAll('[data-auth-show="guest"]').forEach(el =>
    el.classList.toggle('d-none', isAuth));
  document.querySelectorAll('[data-auth-show="user"]').forEach(el =>
    el.classList.toggle('d-none', !isAuth));

  // User-E-Mail in Navbar anzeigen
  const emailEl = document.getElementById('nav-user-email');
  if (emailEl && fordifyAuth.user) emailEl.textContent = fordifyAuth.user.email;

  // Free-Tier-Banner
  const banner = document.getElementById('free-tier-banner');
  if (banner) banner.classList.toggle('d-none', isPaid);
}

function _loginStatus(msg, type) {
  const el = document.getElementById('login-status');
  if (!el) return;
  el.className = `alert alert-${type} py-2 small mb-0 mt-2`;
  el.textContent = msg;
  el.classList.remove('d-none');
}
