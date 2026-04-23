// fordify Contacts – Schuldner- und Mandanten-Adressbuch
// Setzt voraus: supabaseClient aus auth.js, fordifyAuth aus auth.js

const fordifyContacts = {
  schuldner: [],
  mandanten: []
};

async function ladeKontakte() {
  if (!supabaseClient || !fordifyAuth.user || !fordifyAuth.hasSubscription) return;
  const { data, error } = await supabaseClient
    .from('contacts')
    .select('id, type, name, strasse, plz, ort, email, telefon')
    .eq('user_id', fordifyAuth.user.id)
    .order('name');
  if (error) { console.warn('Kontakte laden fehlgeschlagen:', error.message); return; }
  fordifyContacts.schuldner = (data || []).filter(c => c.type === 'schuldner');
  fordifyContacts.mandanten = (data || []).filter(c => c.type === 'mandant');
  _aktualisiereKontaktAutocomplete();
}

async function speichereKontakt(type, kontakt) {
  if (!supabaseClient || !fordifyAuth.user || !fordifyAuth.hasSubscription) return null;
  const { data, error } = await supabaseClient
    .from('contacts')
    .insert({ type, user_id: fordifyAuth.user.id, ...kontakt })
    .select('id, type, name, strasse, plz, ort, email, telefon')
    .single();
  if (error) { console.warn('Kontakt speichern fehlgeschlagen:', error.message); return null; }
  await ladeKontakte();
  return data;
}

async function aktualisiereKontakt(id, updates) {
  if (!supabaseClient || !fordifyAuth.user) return null;
  const { data, error } = await supabaseClient
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', fordifyAuth.user.id)
    .select('id, type, name, strasse, plz, ort, email, telefon')
    .single();
  if (error) { console.warn('Kontakt aktualisieren fehlgeschlagen:', error.message); return null; }
  await ladeKontakte();
  return data;
}

async function loescheKontakt(id) {
  if (!supabaseClient || !fordifyAuth.user) return;
  const { error } = await supabaseClient
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', fordifyAuth.user.id);
  if (error) console.warn('Kontakt löschen fehlgeschlagen:', error.message);
  await ladeKontakte();
}

function _aktualisiereKontaktAutocomplete() {
  const schuldnerList = document.getElementById('schuldner-datalist');
  if (schuldnerList) {
    schuldnerList.innerHTML = fordifyContacts.schuldner
      .map(c => `<option value="${_escKontakt(c.name)}">`)
      .join('');
  }
  if (fordifyAuth.plan === 'business') {
    const mandantenList = document.getElementById('mandanten-datalist');
    if (mandantenList) {
      mandantenList.innerHTML = fordifyContacts.mandanten
        .map(c => `<option value="${_escKontakt(c.name)}">`)
        .join('');
    }
  }
}

function _escKontakt(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
