const IS_STAGING = ['staging.fordify.de', 'localhost', '127.0.0.1'].some(
  h => window.location.hostname === h || window.location.hostname.startsWith('192.168.')
);

const CONFIG = Object.freeze({
  env: IS_STAGING ? 'staging' : 'production',
  supabase: {
    url:     IS_STAGING ? '' : 'https://dswhllvtewtqpiqnpbsu.supabase.co',
    anonKey: IS_STAGING ? '' : 'sb_publishable_oDmF5OVPExc5PxMp21rb7g_5VLqtPvE',
  },
  paddle: {
    token:       IS_STAGING ? '' : 'live_f5be54feee652705c46e99ab45f',
    environment: IS_STAGING ? 'sandbox' : 'production',
    prices: {
      proMonthly:       IS_STAGING ? '' : 'pri_01kpp1zs2b487axchzx5tc8kxx',
      proYearly:        IS_STAGING ? '' : 'pri_01kpp21sceph74f9bshqfsjy42',
      businessMonthly:  IS_STAGING ? '' : 'pri_01kpp23ycxcekkexfh1hd5vzht',
      businessYearly:   IS_STAGING ? '' : 'pri_01kpp257vybj8k2y6jan6pq1tw',
    },
  },
});

function trackEvent(name) {
  if (typeof window.goatcounter === 'undefined') return;
  window.goatcounter.count({ path: name, title: name, event: true });
}
