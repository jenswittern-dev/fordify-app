// fordify Auth-UI
// Setzt voraus: CONFIG aus config.js
// Muss VOR auth.js geladen werden

const VALID_CHECKOUT_PARAMS = ['pro-monthly', 'pro-yearly', 'business-monthly', 'business-yearly'];

const PRICE_MAP = {
  'pro-monthly':      () => CONFIG.paddle.prices.proMonthly,
  'pro-yearly':       () => CONFIG.paddle.prices.proYearly,
  'business-monthly': () => CONFIG.paddle.prices.businessMonthly,
  'business-yearly':  () => CONFIG.paddle.prices.businessYearly,
};

function aktualisiereUIFuerAuth() {
  const isAuth = fordifyAuth.isAuthenticated;
  const isPaid  = fordifyAuth.hasSubscription;

  document.querySelectorAll('[data-auth-show="guest"]').forEach(el =>
    el.classList.toggle('d-none', isAuth));
  document.querySelectorAll('[data-auth-show="user"]').forEach(el =>
    el.classList.toggle('d-none', !isAuth));
  document.querySelectorAll('[data-auth-show="paid"]').forEach(el =>
    el.classList.toggle('d-none', !isPaid));

  if (isAuth && fordifyAuth.user) {
    const initials = _getInitials(fordifyAuth.user.email);
    document.querySelectorAll('.nav-avatar-initials').forEach(el => el.textContent = initials);

    document.querySelectorAll('.nav-user-email-display').forEach(el =>
      el.textContent = fordifyAuth.user.email);

    document.querySelectorAll('.nav-plan-badge').forEach(el => {
      el.innerHTML = _getPlanBadgeHTML(fordifyAuth.plan);
    });
  }

  const banner = document.getElementById('free-tier-banner');
  if (banner) banner.classList.toggle('d-none', isPaid);
}

function _getInitials(email) {
  if (!email) return '?';
  const local = email.split('@')[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) {
    const initials = [parts[0]?.[0], parts[1]?.[0]].filter(Boolean);
    if (initials.length === 2) return initials.join('').toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

function _getPlanBadgeHTML(plan) {
  const configs = {
    free:     { label: 'FREE',     bg: '#e2e8f0', color: '#475569' },
    pro:      { label: 'PRO',      bg: '#fef3c7', color: '#92400e' },
    business: { label: 'BUSINESS', bg: '#dbeafe', color: '#1e40af' },
  };
  const c = configs[plan] || configs.free;
  return `<span class="plan-badge" style="background:${c.bg};color:${c.color}">${c.label}</span>`;
}

function openCustomerPortal() {
  window.open('https://customer.paddle.com/', '_blank', 'noopener');
}

function checkAutoCheckout() {
  if (typeof Paddle === 'undefined') return;
  if (!fordifyAuth.user) return;
  const params = new URLSearchParams(window.location.search);
  const interval = params.get('checkout');
  if (!VALID_CHECKOUT_PARAMS.includes(interval)) return;

  history.replaceState({}, '', window.location.pathname);

  const priceId = PRICE_MAP[interval]?.();
  if (!priceId) return;

  _zeigeCheckoutToast(() => {
    if (typeof Paddle === 'undefined') return;
    Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { user_id: fordifyAuth.user.id },
      locale: 'de'
    });
  });
}

function _zeigeCheckoutToast(callback) {
  const toast = document.createElement('div');
  toast.style.cssText = [
    'position:fixed', 'top:1rem', 'right:1rem', 'z-index:9999',
    'background:#1e3a8a', 'color:white', 'padding:0.75rem 1.25rem',
    'border-radius:8px', 'font-size:0.875rem', 'font-family:inherit',
    'box-shadow:0 4px 12px rgba(0,0,0,0.2)', 'transition:opacity 0.3s'
  ].join(';');
  toast.textContent = 'Angemeldet ✓ – Checkout wird vorbereitet…';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { document.body.removeChild(toast); callback(); }, 300);
  }, 800);
}
