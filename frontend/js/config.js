const IS_STAGING = ['staging.fordify.de', 'localhost', '127.0.0.1'].some(
  h => window.location.hostname === h || window.location.hostname.startsWith('192.168.')
);

const CONFIG = Object.freeze({
  env: IS_STAGING ? 'staging' : 'production',
  supabase: {
    url:     IS_STAGING ? '' : '',
    anonKey: IS_STAGING ? '' : '',
  },
  paddle: {
    token:       IS_STAGING ? '' : '',
    environment: IS_STAGING ? 'sandbox' : 'production',
  },
});
