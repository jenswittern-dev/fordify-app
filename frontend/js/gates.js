// fordify Feature-Gates
// Setzt voraus: fordifyAuth aus auth.js, trackEvent aus config.js

function requiresPaid(featureName) {
  if (typeof fordifyAuth !== 'undefined' && fordifyAuth.hasSubscription) return false;
  _zeigeUpgradeModal(featureName, 'pro');
  trackEvent('upgrade-modal-' + featureName);
  return true;
}

function requiresBusiness(featureName) {
  if (typeof fordifyAuth !== 'undefined' && fordifyAuth.hasSubscription && fordifyAuth.plan === 'business') return false;
  _zeigeUpgradeModal(featureName, 'business');
  trackEvent('upgrade-modal-business-' + featureName);
  return true;
}

// Rückwärtskompatibel – intern auf _zeigeUpgradeModal delegieren
function zeigeUpgradeModal(featureName) {
  _zeigeUpgradeModal(featureName, 'pro');
}

function _zeigeUpgradeModal(featureName, plan) {
  const featureLabels = {
    'excel':                'CSV & JSON-Export',
    'json':                 'JSON-Export',
    'json-import':          'JSON-Import',
    'einstellungen':        'Profil dauerhaft speichern',
    'schuldner-adressbuch': 'Schuldner-Adressbuch',
    'mandanten-adressbuch': 'Mandanten-Adressbuch',
    'csv-import':           'CSV-Import',
  };
  const label = featureLabels[featureName] || featureName;
  const isBusiness = plan === 'business';

  const featureEl = document.getElementById('upgrade-modal-feature');
  if (featureEl) featureEl.textContent = label;

  const titleEl = document.getElementById('upgradeModalLabel');
  if (titleEl) titleEl.textContent = isBusiness ? 'Business-Funktion' : 'Pro-Funktion';

  const descEl = document.getElementById('upgrade-modal-desc');
  if (descEl) descEl.textContent = isBusiness
    ? 'Diese Funktion ist ab dem Business-Plan verfügbar.'
    : 'Diese Funktion ist ab dem Pro-Plan verfügbar.';

  const ctaEl = document.getElementById('upgrade-modal-cta');
  if (ctaEl) {
    ctaEl.textContent = isBusiness ? 'Business abonnieren →' : 'Pro abonnieren →';
    ctaEl.href = '/preise';
  }

  const modalEl = document.getElementById('upgradeModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}
