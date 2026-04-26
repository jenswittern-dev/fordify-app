// fordify Storage-Abstraktion
// Free-Nutzer: sessionStorage (Daten weg beim Tab-Schließen)
// Paid-Nutzer: localStorage + Supabase Cloud-Sync (nach Task 4 Auth)

const StorageBackend = (() => {
  let _backend = sessionStorage;
  let _cloudSync = null;

  function init(authState) {
    if (authState && authState.isAuthenticated && authState.hasSubscription) {
      _backend = localStorage;
      _cloudSync = CloudSync;
    } else {
      _backend = sessionStorage;
      _cloudSync = null;
    }
  }

  function getItem(key) {
    return _backend.getItem(key);
  }

  function setItem(key, value) {
    _backend.setItem(key, value);
    if (_cloudSync) _cloudSync.enqueue(key, value);
  }

  function removeItem(key) {
    _backend.removeItem(key);
    if (_cloudSync) _cloudSync.enqueueDelete(key);
  }

  return { init, getItem, setItem, removeItem };
})();

// Cloud-Sync: debounced 2 Sekunden, schreibt nach Supabase
// Wird erst aktiv wenn Task 4 (Auth) implementiert ist und fordifyAuth + supabaseClient existieren
const CloudSync = (() => {
  let _queue = [];
  let _timer = null;

  function enqueue(key, value) {
    _queue = _queue.filter(i => i.key !== key);
    _queue.push({ key, value, deleted: false });
    clearTimeout(_timer);
    _timer = setTimeout(_sync, 2000);
  }

  function enqueueDelete(key) {
    _queue = _queue.filter(i => i.key !== key);
    _queue.push({ key, deleted: true });
    clearTimeout(_timer);
    _timer = setTimeout(_sync, 2000);
  }

  async function _sync() {
    if (typeof supabaseClient === 'undefined' || typeof fordifyAuth === 'undefined') return;
    const items = [..._queue];
    _queue = [];
    for (const item of items) {
      try {
        if (item.key === STORAGE_KEY_CASES)    await _syncCases(item);
        if (item.key === STORAGE_KEY_SETTINGS) await _syncSettings(item);
      } catch (e) {
        console.warn('CloudSync Fehler:', e);
      }
    }
  }

  async function _syncCases(item) {
    if (item.deleted) {
      await supabaseClient.from('cases').delete().eq('user_id', fordifyAuth.user.id);
      return;
    }
    const reg = JSON.parse(item.value);
    for (const c of Object.values(reg.cases || {})) {
      await supabaseClient.from('cases').upsert({
        id: c.id,
        user_id: fordifyAuth.user.id,
        name: c.name,
        data: c.fall,
        naechste_id: c.naechsteId,
        fall_status: c.fall_status || 'offen',
        notes: c.notes || null,
        pinned: c.pinned || false,
        updated_at: new Date().toISOString()
      });
    }
  }

  async function _syncSettings(item) {
    if (item.deleted) {
      await supabaseClient.from('settings').delete().eq('user_id', fordifyAuth.user.id);
      return;
    }
    await supabaseClient.from('settings').upsert({
      user_id: fordifyAuth.user.id,
      data: JSON.parse(item.value),
      updated_at: new Date().toISOString()
    });
  }

  return { enqueue, enqueueDelete };
})();
