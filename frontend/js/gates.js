// fordify Feature-Gates
// Setzt voraus: fordifyAuth aus auth.js, trackEvent aus config.js

function requiresPaid(featureName) {
  if (typeof fordifyAuth !== 'undefined' && fordifyAuth.hasSubscription) return false;
  zeigeUpgradeModal(featureName);
  trackEvent('upgrade-modal-' + featureName);
  return true;
}

function zeigeUpgradeModal(featureName) {
  const featureLabels = {
    'excel':         'Excel / CSV-Export',
    'json':          'JSON-Export',
    'json-import':   'JSON-Import',
    'einstellungen': 'Profil dauerhaft speichern'
  };
  const label = featureLabels[featureName] || featureName;
  const el = document.getElementById('upgrade-modal-feature');
  if (el) el.textContent = label;
  const modal = new bootstrap.Modal(document.getElementById('upgradeModal'));
  modal.show();
}
