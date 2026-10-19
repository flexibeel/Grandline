// Online-Rangliste. Zwei mögliche Speicherorte:
//  1. Eigene Datenbank (Supabase), wenn GL.config.online.url und .key gesetzt sind.
//     Dann kann sich jeder mit dem Link eintragen (anonyme Anmeldung, kein Konto nötig).
//  2. Sonst die gemeinsame Datenbank der geteilten Claude-Seite (nur Besitzer und Bearbeiter schreiben).
// Lokal ohne beides: nur der eigene Bestwert.
// Jeder Spieler hat genau einen Eintrag (seine id). Alle lesen alle Einträge, jeder schreibt nur seinen.
window.GL = window.GL || {};

(function () {
  const state = { status: 'local', rows: [], uid: null, readOnly: false, error: '', backend: 'local', email: null, anon: true, cloud: false, mailSent: '' };
  let client = null;
  let pushTimer = null;
  let onRemote = null;   // wird aufgerufen, wenn online ein neuerer Spielstand liegt
  const listeners = [];
  let store = null;     // { get(uid), set(uid, body), refresh() }
  let pending = null;
  let registered = false;
  let profileRef = null;

  // Gleicher Name = gleicher Spieler (z. B. neues Gerät, neue Sitzung): nur einmal zeigen.
  // Eigener Eintrag hat Vorrang, Bestwerte aus den alten Einträgen werden übernommen.
  // Sicherheit: Daten anderer Spieler sind fremd. Alles rekursiv säubern, bevor es irgendwo angezeigt wird:
  // Texte ohne < > " ' ` (kann kein HTML/Attribut mehr aufbrechen), Zahlen endlich, keine Prototyp-Schlüssel, Größe begrenzt.
  const BAD_KEY = /^(__proto__|constructor|prototype)$/;
  function safeData(v, depth, loose) {
    const d = depth || 0;
    if (v == null) return v;
    if (typeof v === 'string') return loose ? v.replace(/[<>`]/g, '') : v.replace(/[<>"'`\u0000-\u001f]/g, '').slice(0, 400);
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (typeof v === 'boolean') return v;
    if (d > (loose ? 14 : 8)) return null;
    if (Array.isArray(v)) return (loose ? v : v.slice(0, 400)).map(x => safeData(x, d + 1, loose));
    if (typeof v === 'object') {
      const o = {};
      (loose ? Object.keys(v) : Object.keys(v).slice(0, 200)).forEach(k => { if (!BAD_KEY.test(k) && (loose ? !/[<>"'`]/.test(k) : /^[\w$.:| -]{1,48}$/.test(k))) o[k] = safeData(v[k], d + 1, loose); });
      return o;
    }
    return null;
  }
  GL.safeData = safeData;
  function safeRows(rows) {
    rows = (Array.isArray(rows) ? rows : []).filter(r => r && typeof r === 'object').map(r => safeData(r));
    const ARR = ['squad', 'isles', 'showcase', 'vaultTop', 'chestTop', 'trophies', 'items', 'crew', 'relics', 'gear'];
    const OBJ = ['look', 'cos', 'ship', 'pos', 'endlessRec', 'bestPlace'];
    rows.forEach(r => {
      r.name = String(r.name || '').slice(0, 24);
      r.id = String(r.id || '');
      if (r.crewName != null) { const cn = typeof r.crewName === 'string' ? r.crewName.replace(/[<>"'`&\\]/g, '').trim().slice(0, 20) : ''; if (cn && (!GL.nameCheck || GL.nameCheck(cn).ok)) r.crewName = cn; else delete r.crewName; }
      ARR.forEach(k => { if (r[k] != null && !Array.isArray(r[k])) delete r[k]; });
      OBJ.forEach(k => { if (r[k] != null && (typeof r[k] !== 'object' || Array.isArray(r[k]))) delete r[k]; });
      const num = (v, lo, hi) => { const n = Number(v); return isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : lo; };
      const RN = ((GL.config || {}).rarities || [0]).length - 1;
      if (Array.isArray(r.chestTop)) r.chestTop = r.chestTop.filter(it => it && typeof it === 'object' && (GL.data.items || []).some(x => x.id === it.id)).slice(0, 4).map(it => ({ id: it.id, r: num(it.r, 0, RN), lvl: num(it.lvl, 0, 99) }));
      if (Array.isArray(r.vaultTop)) r.vaultTop = r.vaultTop.filter(v => v && typeof v === 'object' && (GL.data.artifacts || []).some(a => a.id === v.id)).slice(0, 6).map(v => ({ id: v.id, lvl: num(v.lvl, 0, 99) }));
      if (Array.isArray(r.showcase)) r.showcase = r.showcase.filter(x => typeof x === 'string').slice(0, 3);
      if (Array.isArray(r.isles)) r.isles = r.isles.filter(x => typeof x === 'string').slice(0, 80);
      ['score', 'rankXp', 'heatMax', 'artifacts', 'bestStep', 'pets', 'endlessBest', 'endlessLoops', 'seasDone', 'squadPower', 'squadW', 'squadRating', 'dlRating', 'dlMarksTotal', 'captains', 'invites', 'wins', 'runs', 'topBounty', 'bestDmg', 'maxHit', 'totalDmg', 'kos', 'crits', 'bossKills', 'landgang', 'landOrte'].forEach(k => { if (r[k] != null) r[k] = num(r[k], 0, 1e12); });
      if (r.dlRating != null) r.dlRating = num(r.dlRating, 0, 500000);
      r.squadTactic = GL.squad && GL.squad.tacOf ? GL.squad.tacOf(r.squadTactic) : null;   // nur bekannte Taktiken
      if (Array.isArray(r.squad)) r.squad = r.squad.filter(x => x && typeof x === 'object' && (x.id === 'self' || x.id === 'rival' || GL.data.crew.some(c => c.id === x.id))).slice(0, 4)
        .map(x => Object.assign(x, { lvl: num(x.lvl, 1, 999), max: num(x.max, 1, 1e6), hp: num(x.hp != null ? x.hp : x.max, 0, 1e6), atk: num(x.atk, 0, 1e5), spd: num(x.spd, 0, 1e4), gear: Array.isArray(x.gear) ? x.gear.filter(g => g && typeof g === 'object' && (GL.cgear ? (g.t ? GL.data.crewGear.trophyPerks[g.t] && Object.prototype.hasOwnProperty.call(GL.data.crewGear.trophyPerks, g.t) : GL.cgear.base(g.b)) : true)).slice(0, 4).map(g => { const A = (GL.data.crewGear || {}).affixes || {}, a = {}; Object.keys(g.a || {}).forEach(k => { if (Object.prototype.hasOwnProperty.call(A, k) && isFinite(+g.a[k])) a[k] = +g.a[k]; }); return Object.assign(g, { a, r: Math.max(0, Math.min(3, Math.round(+g.r || 0))), m: Object.prototype.hasOwnProperty.call(A, g.m) ? g.m : undefined }); }) : undefined }));
    });
    return rows;
  }
  GL.safeRows = safeRows;
  const MAXF = ['score', 'wins', 'runs', 'topBounty', 'bestDmg', 'maxHit', 'totalDmg', 'kos', 'crits', 'bossKills', 'rankXp', 'artifacts', 'heatMax', 'captains', 'squadW', 'squadRating', 'dlRating'];
  function dedupe(rows) {
    const groups = {};
    const out = [];
    rows = safeRows(rows);
    if (GL.safeName) rows.forEach(r => { if (r && r.name && !GL.nameCheck(r.name).ok) r.name = 'Pirat'; });
    rows.forEach(r => {
      const key = String(r.name || '').trim().toLowerCase();
      if (!key || key === '-' || key === 'unbekannter pirat' || key === 'pirat') { out.push(r); return; }
      (groups[key] = groups[key] || []).push(r);
    });
    Object.values(groups).forEach(g => {
      if (g.length === 1) { out.push(g[0]); return; }
      const top = g.slice().sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))[0];
      const keep = Object.assign({}, g.find(r => r.id === state.uid) || top);
      MAXF.forEach(k => { keep[k] = Math.max(...g.map(r => Number(r[k]) || 0)); });
      if (top !== keep && (Number(top.score) || 0) >= (Number(keep.score) || 0) && top.best) keep.best = top.best;
      if (!keep.vaultTop && top.vaultTop) keep.vaultTop = top.vaultTop;
      if (!keep.chestTop && top.chestTop) keep.chestTop = top.chestTop;
      if (!keep.squad && top.squad) { keep.squad = top.squad; keep.squadPower = top.squadPower; }
      keep.updated = g.map(r => r.updated || '').sort().pop();
      out.push(keep);
    });
    return out.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
  }

  function emit() { listeners.forEach(fn => { try { fn(); } catch (e) { /* Anzeige-Fehler ignorieren */ } }); }

  function afterRows() {
    state.status = 'ready';
    emit();
    const profile = profileRef;
    if (!profile || state.readOnly || !state.uid) return;
    const mine = state.rows.some(r => r.id === state.uid);
    const mineRow = state.rows.find(r => r.id === state.uid);
    // Neu eintragen, oder einmal aktualisieren, wenn dem Eintrag noch neue Felder fehlen (z. B. Stammcrew)
    // In die Rangliste erst nach dem ersten abgeschlossenen Run (nicht schon beim Anlegen)
    if (profile.nickname && (profile.stats && profile.stats.runs > 0) && !registered && (!mine || (mineRow && !mineRow.squad))) { registered = true; register(profile); }
    if (pending == null && !mine && profile.onlineBest) { pending = profile.onlineBest; flush(profile); }
  }

  // ---------- Speicherort 1: Supabase ----------
  async function initSupabase(cfg) {
    client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    state.backend = 'supabase';
    await signIn();
    // Anmeldung ändert sich (Mail-Link in anderem Tab, Token erneuert, Mail verknüpft): Stand passend abgleichen
    client.auth.onAuthStateChange((ev, session) => {
      token = session ? session.access_token : null;
      if (!session || !session.user) return;
      const u = session.user;
      const changed = state.uid && u.id !== state.uid;
      state.anon = !!u.is_anonymous; state.email = u.email || null;
      if (changed) { state.uid = u.id; state.pulled = false; state.cloud = false; setTimeout(() => { try { sessionStorage.removeItem('gl.pulled'); } catch (e) { /* egal */ } pullSave(); }, 0); }
      emit();
    });
    await pullSave();
    await codeSync();
    // Saison: Einträge ohne Fahrt in der neuen Saison bleiben sichtbar (Freunde, online), zählen aber mit null
    const PRE = { score: 0, best: null, runs: 0, wins: 0, topBounty: 0, bestDmg: 0, maxHit: 0, totalDmg: 0, kos: 0, crits: 0, bossKills: 0, runLog: [], preSeason: true };
    const toRow = r => {
      const row = Object.assign({}, r.data || {}, { id: r.id, name: r.name, score: r.score });
      return GL.season && GL.season.started() && row.sStat !== GL.season.id() ? Object.assign(row, PRE) : row;
    };
    store = {
      async get(uid) {
        const { data: d, error } = await client.from('scores').select('id,name,score,data').eq('id', uid).maybeSingle();
        if (error) throw error;
        return d ? toRow(d) : null;
      },
      async set(uid, body) {
        const { name, score, ...rest } = body;
        const { error } = await client.from('scores').upsert({ id: uid, name, score: Math.round(score || 0), data: rest, updated_at: new Date().toISOString() });
        if (error) throw error;
        await store.refresh();
      },
      async refresh() {
        // Nach dem großen Neustart zählen nur noch Einträge der neuen Saison
        const { data: d, error } = await client.from('scores').select('id,name,score,data').order('score', { ascending: false }).limit(300);
        if (error) throw error;
        state.rows = dedupe((d || []).map(toRow).filter(r => !r.deleted));
        afterRows();
      }
    };
    await store.refresh();
    setInterval(() => { if (!document.hidden) store.refresh().catch(() => {}); }, 20000);
  }

  // Sitzung holen oder anonym anlegen (klappt das nicht, z. B. offline: später bei resync nochmal)
  async function signIn() {
    const { data } = await client.auth.getSession();
    let session = data && data.session;
    if (!session) {
      const res = await client.auth.signInAnonymously();
      if (res.error) throw res.error;
      session = res.data.session;
    }
    token = session.access_token || null;
    state.uid = session.user.id;
    state.anon = !!session.user.is_anonymous;
    state.email = session.user.email || null;
  }

  // ---------- Online-Spielstand (alle Geräte) ----------
  // Tabelle saves: eine Zeile pro Spieler mit dem ganzen Profil.
  // Ablauf: beim Start (und nach Anmelden / Zurückkehren) erst HOLEN und entscheiden, dann erst HOCHLADEN.
  // Vorher lädt dieses Gerät nichts hoch, damit ein alter Stand nie einen neueren in der Cloud überschreibt.
  let dirty = false, token = null, retryTimer = null, firstCode = true;
  const sandboxed = () => !!(GL.sandbox && GL.sandbox.on());
  function setSync(s) {
    if (state.sync === s) return; state.sync = s;
    try { document.querySelectorAll('.sync-badge').forEach(b => { if (b.closest('#sync-slot')) return; const t = document.createElement('div'); t.innerHTML = badge(b.classList.contains('head') ? 'head' : ''); if (t.firstElementChild) b.replaceWith(t.firstElementChild); }); } catch (e) { /* egal */ }
    emit();
  }
  const pulledFlag = () => { try { return !!sessionStorage.getItem('gl.pulled'); } catch (e) { return false; } };
  const baseKey = k => 'grandline.syncBase.' + k;
  function getBase(k) { try { return JSON.parse(localStorage.getItem(baseKey(k)) || 'null'); } catch (e) { return null; } }
  function setBase(k, p) { try { localStorage.setItem(baseKey(k), JSON.stringify({ sig: GL.cloudSync.sig(p), at: Date.now() })); } catch (e) { /* egal */ } }
  const localT = p => Math.max((p && p.savedAt) || 0, p === profileRef ? ((GL.save && GL.save.runAt) || 0) : 0);
  const remoteT = r => (r && r.savedAt) || 0;

  async function pullSave() {
    if (sandboxed() || !client || !state.uid) return;
    if (state.hold) return;                              // Rückfrage läuft schon
    setSync('wait');
    let d = null, error = null;
    try { ({ data: d, error } = await client.from('saves').select('data,updated_at').eq('id', state.uid).maybeSingle()); } catch (e) { error = e; }
    if (error) { setSync('err'); return; }             // offline o. Ä.: nichts hochladen, später erneut
    state.cloud = true;
    const local = profileRef;
    // Neues Konto auf diesem Gerät (z. B. gerade angemeldet): der Online-Spielstand dieses Kontos hat Vorrang.
    let lastUid = null;
    try { lastUid = localStorage.getItem('grandline.uid'); localStorage.setItem('grandline.uid', state.uid); } catch (e) { /* egal */ }
    const switched = !!lastUid && lastUid !== state.uid;
    const raw = d && d.data && typeof d.data === 'object' && !Array.isArray(d.data) ? d.data : null;
    const remote = raw ? (raw.wiped ? { wiped: true, savedAt: Number(raw.savedAt) || 0 } : safeData(raw, 0, true)) : null;
    const key = 'u:' + state.uid;
    // Erster Abgleich nach dem Start: mit dem Stand beim Laden vergleichen. Kleine Speicherungen der ersten
    // Sekunden (Hinweise gesehen o. Ä.) machen den Stand sonst künstlich „neuer“ als die Cloud.
    const L0 = !state.pulled && GL.save && GL.save.loaded;
    const opt = { switched, base: getBase(key), localT: localT(local), remoteT: remoteT(remote) };
    if (L0) { opt.localSig = L0.sig; opt.localT = Math.max(L0.at || 0, GL.save.runAt0 || 0); }
    let how = GL.cloudSync.decide(local, remote, opt);
    // Gerade bewusst übernommen (Spielercode, Code-Import, Neustart, Auswahl im Konflikt-Fenster): dieser Stand gilt
    // (gilt nur für den ersten Abgleich nach dem Neuladen, danach zählt wieder nur der Inhalt)
    if (!state.pulled && pulledFlag() && !switched && (how === 'pull' || how === 'ask')) how = 'push';
    // Mitten im Run nicht einfach neu laden: lieber einmal fragen
    if (how === 'pull' && state.pulled && GL.save && Date.now() - (GL.save.runAt || 0) < 15 * 60e3) how = 'ask';
    route(how, key, local, remote, () => pushNow(true));
  }
  // Entscheidung umsetzen
  function route(how, key, local, remote, push) {
    if (how === 'pull') { setBase(key, remote); takeRemote(remote, false); return; }
    if (how === 'ask') { askConflict(local, remote, key); return; }
    state.pulled = true;
    if (how === 'push' || (how === 'same' && dirty)) push();
    else { if (how === 'same') setBase(key, local); state.syncAt = state.syncAt || Date.now(); setSync('ok'); }
  }
  // Cloud-Stand übernehmen (main.js führt zusammen und lädt neu). Der bisherige Stand bleibt als Sicherung auf dem Gerät.
  function takeRemote(remote, chosen) {
    try { const cur = localStorage.getItem('grandline.profile'); if (cur) localStorage.setItem('grandline.profile.vorher', cur); } catch (e) { /* egal */ }
    if (remote && remote.wiped) {
      state.leaving = true;
      // Auf einem anderen Gerät wurde neu angefangen: Name und Aussehen bleiben, Fortschritt startet bei null
      const p = profileRef || {};
      const fresh = Object.assign(GL.meta.newProfile(), { nickname: p.nickname, char: p.char, cos: p.cos, playerCode: p.playerCode, codeClaimed: p.codeClaimed, savedAt: Date.now() });
      try { ['grandline.run', 'grandline.best'].forEach(k => localStorage.removeItem(k)); localStorage.setItem('grandline.profile', JSON.stringify(fresh)); sessionStorage.setItem('gl.pulled', '1'); } catch (e) { /* egal */ }
      location.reload();
      return;
    }
    state.leaving = true;   // bis zum Neuladen nichts Altes mehr hochladen
    // main.js übernimmt nur ohne diese Marke (Schleifenschutz); sie wird dort gleich wieder gesetzt
    try { sessionStorage.removeItem('gl.pulled'); } catch (e) { /* egal */ }
    if (onRemote) onRemote(Object.assign({}, remote));
  }
  // Laufender Run reist mit (als Text), damit man am anderen Gerät mitten im Run weitermachen kann
  function withRun(profile) {
    let runJ = null;
    try { runJ = localStorage.getItem('grandline.run'); } catch (e) { /* egal */ }
    const at = Math.max(profile.savedAt || 0, (GL.save && GL.save.runAt) || 0);
    return Object.assign({}, profile, { savedAt: at, _runJ: runJ && runJ.length < 400000 ? runJ : null });
  }
  const canPush = () => !sandboxed() && !state.leaving && client && state.uid && state.cloud && state.pulled && !state.hold && profileRef && profileRef.nickname;
  // Jetzt hochladen (nicht entprellt). Fehler: Symbol ⚠, nach 20 s nochmal.
  async function pushNow() {
    if (!canPush()) return;
    clearTimeout(pushTimer); pushTimer = null;
    const p = profileRef;
    setSync('wait');
    let error = null;
    try { ({ error } = await client.from('saves').upsert({ id: state.uid, data: withRun(p), updated_at: new Date().toISOString() })); } catch (e) { error = e; }
    if (error) {
      setSync('err');
      clearTimeout(retryTimer); retryTimer = setTimeout(() => { if (dirty || state.sync === 'err') pushNow(); }, 20000);
      return;
    }
    dirty = false; state.syncAt = Date.now();
    setBase('u:' + state.uid, p);
    setSync('ok');
    codeSave(p);
  }
  // Sofort hochladen (Spiel geht in den Hintergrund / wird geschlossen). keepalive: kommt auch beim Schließen noch an.
  function flushSave() {
    if (!canPush() || !dirty) return;
    clearTimeout(pushTimer); pushTimer = null;
    const cfg = (GL.config && GL.config.online) || {};
    let body = '';
    try { body = JSON.stringify({ id: state.uid, data: withRun(profileRef), updated_at: new Date().toISOString() }); } catch (e) { return; }
    if (token && cfg.url && window.fetch && body.length < 50000) {
      const p = profileRef;
      try {
        fetch(cfg.url + '/rest/v1/saves?on_conflict=id', { method: 'POST', keepalive: true, body,
          headers: { apikey: cfg.key, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' } })
          .then(r => { if (r.ok) { dirty = false; state.syncAt = Date.now(); setBase('u:' + state.uid, p); setSync('ok'); } else setSync('err'); }, () => setSync('err'));
      } catch (e) { pushNow(); }
    } else pushNow();
    codeSave(profileRef);
  }
  function pushSave(profile) {
    if (sandboxed()) return;
    if (profile && profile !== profileRef && profileRef == null) profileRef = profile;
    dirty = true;
    if (!client || !state.uid) return;
    if (!state.hold) pushLive(profile);
    if (!state.pulled || state.hold) return;            // erst abgleichen, dann hochladen
    clearTimeout(pushTimer);
    if (state.sync === 'ok') setSync('wait');
    pushTimer = setTimeout(() => pushNow(), 3000);
  }

  // ---------- Konflikt: EIN kleines Fenster „Dieses Gerät“ oder „Cloud“ ----------
  const escH = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
  function when(t) {
    if (!t) return 'unbekannt';
    const d = new Date(t), now = new Date();
    const hm = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return 'heute ' + hm;
    if (d.toDateString() === new Date(now - 864e5).toDateString()) return 'gestern ' + hm;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + hm;
  }
  function sideInfo(p, t) {
    if (!p || p.wiped) return { head: 'Neu angefangen', sub: 'Auf einem anderen Gerät zurückgesetzt', at: when(t) };
    let r = '';
    try { const rp = GL.meta.rankProgress(p); r = 'Rang ' + (rp.i + 1) + ' · ' + rp.rank.name; } catch (e) { r = (p.rankXp || 0) + ' Rang-EP'; }
    const runs = (p.stats && p.stats.runs) || 0;
    return { head: r, sub: (p.nickname ? p.nickname + ' · ' : '') + runs + (runs === 1 ? ' Run' : ' Runs'), at: when(t) };
  }
  function conflictHtml() {
    const c = state.conflict; if (!c) return '';
    const L = sideInfo(c.local, localT(c.local)), R = sideInfo(c.remote, remoteT(c.remote));
    const opt = (k, ico, name, i) => `<button class="sync-opt" data-sync="${k}"><span class="sync-opt-h">${ico} ${name}</span><b>${escH(i.head)}</b><small>${escH(i.sub)}</small><small>Stand: ${escH(i.at)}</small></button>`;
    return `<div class="fpop-card sync-pop" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">Spielstand</span>
      <h3 id="fpop-t">Zwei Stände, ein Pirat</h3>
      <p class="hint">Hier und in der Cloud liegt verschiedener Fortschritt. Welcher gilt ab jetzt?</p>
      <div class="sync-pick">${opt('keep-local', '📱', 'Dieses Gerät', L)}${opt('take-cloud', '☁', 'Cloud', R)}</div>
      <p class="sync-fine">Gleicher Pirat? Dann kommt die Beute aus dem anderen Stand mit. Der alte Stand bleibt auf diesem Gerät gesichert.</p>
    </div>`;
  }
  function askConflict(local, remote, key) {
    state.hold = true;
    state.conflict = { local, remote, key };
    setSync('ask');
    const show = () => {
      if (!state.conflict) return;
      if (document.getElementById('fpop') || (GL.story && GL.story.active && GL.story.active())) { setTimeout(show, 1500); return; }
      openPop(conflictHtml());
    };
    setTimeout(show, 600);
  }
  function resolve(choice) {
    const c = state.conflict; if (!c) return;
    closeOwnPop();
    if (choice === 'take-cloud') { setBase(c.key, c.remote); takeRemote(c.remote, true); return; }
    // Dieses Gerät gilt: gleicher Pirat → Beute aus der Cloud dazu, dann neu laden und hochladen
    let p = c.local;
    try { if (c.remote && !c.remote.wiped && c.remote.nickname && c.remote.nickname === p.nickname) p = GL.meta.mergeProfiles(p, c.remote); } catch (e) { p = c.local; }
    p.savedAt = Date.now();
    try { localStorage.setItem('grandline.profile', JSON.stringify(p)); sessionStorage.setItem('gl.pulled', '1'); } catch (e) { /* egal */ }
    location.reload();
  }

  // ---------- Kleines Konto-Fenster (Sync-Symbol antippen) ----------
  function badge(cls) {
    if (sandboxed()) return '';
    const cfg = (GL.config && GL.config.online) || {};
    if (!cfg.url) return '';
    const s = state.sync || 'off';
    const map = {
      ok: ['☁', 's-ok', 'Spielstand ist in der Cloud gesichert'],
      wait: ['⏳', 's-wait', 'Spielstand wird gesichert …'],
      ask: ['⚠', 's-warn', 'Zwei Spielstände: bitte einmal auswählen'],
      err: ['⚠', 's-warn', 'Gerade nicht gesichert (offline?)'],
      off: ['⚠', 's-warn', 'Offline: Spielstand liegt nur auf diesem Gerät']
    };
    const [ico, st, tip] = map[s] || map.off;
    return `<button class="mu-btn sync-badge ${st}${cls ? ' ' + cls : ''}" data-sync="open" aria-label="Konto und Cloud-Spielstand: ${tip}" title="${tip}">${ico}</button>`;
  }
  function accountHtml() {
    const s = state.sync || 'off';
    const cfg = (GL.config && GL.config.online) || {};
    const head = s === 'ok' ? '☁ Alles gesichert' : s === 'wait' ? '⏳ Wird gesichert …' : '⚠ Gerade nicht gesichert';
    const line = s === 'ok' ? `Dein Spielstand liegt in der Cloud. Stand: ${escH(when(state.syncAt))}.`
      : s === 'wait' ? 'Einen Moment, der Stand geht gerade raus.'
      : 'Kein Netz oder Server nicht erreichbar. Dein Stand liegt sicher auf diesem Gerät und wandert hoch, sobald es wieder geht.';
    const mailed = !state.anon && state.email;
    const streamer = GL.streamer && GL.streamer.on();
    const mailShow = m => streamer ? '•••@•••' : escH(m);
    let acct;
    if (state.backend !== 'supabase') acct = '<p class="hint">Konten gehen nur auf der Website.</p>';
    else if (mailed) acct = `<div class="sync-sec ok"><b>✓ Konto gesichert</b><small>${mailShow(state.email)}. Auf jedem Gerät mit dieser Mail anmelden, dein Spielstand ist dann einfach da.</small></div>`;
    else if (state.mailSent && state.mailKind === 'link') acct = `<div class="sync-sec"><b>✉ Mail ist raus</b><small>An ${mailShow(state.mailSent)}. ${cfg.mailCode ? 'Code aus der Mail eintippen:' : 'Den Link in der Mail antippen, fertig. Am besten in diesem Browser.'}</small>
        ${cfg.mailCode ? `<div class="sync-row"><input id="sync-otp" class="code-input" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="123456" aria-label="Code aus der Mail"><button class="btn mini" data-sync="otp">OK</button></div>` : ''}
        <button class="link" data-sync="mail-again">Andere Adresse</button></div>`;
    else acct = `<div class="sync-sec"><b>Konto sichern</b><small>Gerade spielst du als Gast. Mit deiner Mail kommst du auf jedem Gerät an denselben Piraten. Kein Passwort.</small>
        <div class="sync-row"><input id="sync-mail" type="${streamer ? 'password' : 'email'}" inputmode="email" autocomplete="email" placeholder="deine@email.de" aria-label="E-Mail-Adresse"><button class="btn mini" data-sync="mail-link">Sichern</button></div></div>`;
    const other = state.backend === 'supabase' ? `<details class="sync-sec sync-other"><summary><b>Auf anderem Gerät anmelden</b></summary>
        <small>Spielercode vom anderen Gerät eingeben (steht dort im Profil unter 🔑):</small>
        <div class="sync-row"><input id="sync-code" class="code-input" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="9" placeholder="ABC-123" aria-label="Spielercode"><button class="btn mini" data-sync="code">Laden</button></div>
        <small>Oder <button class="link" data-act="login-open">mit Mail anmelden</button>.</small></details>` : '';
    return `<div class="fpop-card sync-acc" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">Konto</span>
      <h3 id="fpop-t">${head}</h3>
      <p class="hint">${line}</p>
      ${s === 'err' || s === 'off' ? '<button class="btn mini ghost" data-sync="retry">Nochmal versuchen</button>' : ''}
      ${acct}${other}
      <p class="sync-msg" id="sync-msg" aria-live="polite"></p>
    </div>`;
  }
  let ownPop = null;
  function openPop(html) {
    const old = document.getElementById('fpop'); if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = 'gear';
    el.innerHTML = html;
    el.addEventListener('click', e => { if (e.target === el) closeOwnPop(); });
    document.body.appendChild(el);
    ownPop = el;
    requestAnimationFrame(() => el.classList.add('in'));
  }
  function closeOwnPop() {
    const el = document.getElementById('fpop');
    if (el) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), 260); }
    ownPop = null;
  }
  function msg(t) { const m = document.getElementById('sync-msg'); if (m) m.textContent = t; }
  function openAccount() { if (state.conflict) openPop(conflictHtml()); else { accLast = accountHtml(); openPop(accLast); } }
  // Offenes Konto-Fenster nur dann neu füllen, wenn sich wirklich etwas geändert hat (kein Flackern)
  let accLast = '';
  function refreshAccount() {
    const c = document.querySelector('#fpop .sync-acc'); if (!c) return;
    const h = accountHtml(); if (h === accLast) return; accLast = h;
    const tmp = document.createElement('div'); tmp.innerHTML = h;
    const fresh = tmp.firstElementChild; c.replaceWith(fresh);
  }
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-sync]');
    if (!t) { if (e.target.closest && e.target.closest('.sync-acc [data-act="login-open"]')) closeOwnPop(); return; }
    const k = t.dataset.sync;
    if (k === 'open') { openAccount(); return; }
    if (k === 'keep-local' || k === 'take-cloud') { resolve(k); return; }
    if (k === 'retry') { msg('Versuche es …'); resync(true).then(() => refreshAccount()); return; }
    if (k === 'mail-again') { state.mailSent = ''; refreshAccount(); return; }
    if (k === 'mail-link') {
      const v = ((document.getElementById('sync-mail') || {}).value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { msg('Das sieht nicht nach einer Mail-Adresse aus.'); return; }
      t.disabled = true; msg('Schicke Mail …');
      linkEmail(v).then(r => { if (r.ok) refreshAccount(); else { t.disabled = false; msg(r.msg); } });
      return;
    }
    if (k === 'otp') {
      const v = ((document.getElementById('sync-otp') || {}).value || '').replace(/\D/g, '');
      if (v.length < 6) { msg('Der Code aus der Mail hat 6 Ziffern.'); return; }
      t.disabled = true; msg('Prüfe …');
      verifyCode(v).then(r => { if (r.ok) { msg('Gesichert. Lädt neu …'); try { sessionStorage.removeItem('gl.pulled'); } catch (e2) { /* egal */ } setTimeout(() => location.reload(), 600); } else { t.disabled = false; msg(r.msg); } });
      return;
    }
    if (k === 'code') {
      const v = (document.getElementById('sync-code') || {}).value || '';
      if (!GL.code || !GL.code.valid(v)) { msg('Der Code hat 6 Zeichen, z. B. K7Q-F9X.'); return; }
      t.disabled = true; msg('Suche Spielstand …');
      codeLoad(v).then(res => {
        if (!res.ok || !res.data) { t.disabled = false; msg(res.ok ? 'Zu diesem Code gibt es keinen Spielstand. Tippfehler?' : res.msg); return; }
        const p = res.data;
        delete p._runJ;
        p.playerCode = GL.code.format(v); p.codeClaimed = true; p.savedAt = Date.now();
        try { const cur = localStorage.getItem('grandline.profile'); if (cur) localStorage.setItem('grandline.profile.vorher', cur); } catch (e2) { /* egal */ }
        GL.save.replaceProfile(p);
        try { localStorage.removeItem('grandline.run'); sessionStorage.setItem('gl.pulled', '1'); } catch (e2) { /* egal */ }
        msg('Willkommen zurück, ' + (p.nickname || 'Pirat') + '. Lädt neu …');
        setTimeout(() => location.reload(), 700);
      }, err => { t.disabled = false; msg(String((err && err.message) || err)); });
    }
  });
  // Sync-Symbol oben in der Kopfzeile (eigener Platz vor dem ☰, auf dem Handy immer sichtbar)
  function placeBadge() {
    const box = document.querySelector('header .head-actions'); if (!box) return;
    let slot = document.getElementById('sync-slot');
    if (!slot) { slot = document.createElement('span'); slot.id = 'sync-slot'; box.insertBefore(slot, box.firstChild); }
    const h = badge('head');
    if (slot.dataset.h !== h) { slot.innerHTML = h; slot.dataset.h = h; }
    slot.hidden = !h;
  }
  listeners.push(placeBadge);
  // Live: Symbol im offenen Konto-Fenster mitziehen
  listeners.push(() => { if (document.querySelector('#fpop .sync-acc') && !(document.activeElement && /^sync-/.test(document.activeElement.id || ''))) refreshAccount(); });
  // Ranglisten-Eintrag frisch halten: Rang, Stammcrew, Liga-Wertung, Vitrine … nicht erst am Ende eines Runs
  let liveTimer = null, liveSig = '';
  function pushLive(profile) {
    if (!store || !state.uid || state.readOnly || !profile || !profile.nickname) return;
    clearTimeout(liveTimer);
    liveTimer = setTimeout(async () => {
      try {
        const lf = liveFields(profile);
        const sig = JSON.stringify(Object.assign({}, lf, { updated: 0, pos: 0 }));
        if (sig === liveSig) return;                       // nichts Wichtiges geändert
        const old = await store.get(state.uid);
        if (!old) return;                                   // Erst-Eintrag macht register()
        await store.set(state.uid, Object.assign({}, old, lf, { score: old.score }));
        liveSig = sig;
      } catch (e) { /* nächster Versuch beim nächsten Speichern */ }
    }, 4000);
  }

  // ---------- Spielercode-Konten (Tabelle accounts, siehe tools/spielercode.sql) ----------
  const codeMsg = e => /function|does not exist|schema cache/i.test(e.message || '') ? 'Der Spielercode-Speicher ist noch nicht eingerichtet (Admin: tools/spielercode.sql ausführen).' : (e.message || String(e));
  // Neuen Code beim Server reservieren; ist er vergeben, neuen würfeln
  async function codeClaim(profile) {
    if (GL.sandbox && GL.sandbox.on()) return;
    if (!client || !profile || !profile.nickname || profile.codeClaimed) return;
    for (let k = 0; k < 6; k++) {
      GL.code.ensure(profile);
      const { data, error } = await client.rpc('code_claim', { p_code: GL.code.key(profile.playerCode), p_name: profile.nickname, p_data: profile });
      if (error) { state.codeReady = false; state.codeError = codeMsg(error); emit(); return; }
      if (data === true) { profile.codeClaimed = true; state.codeReady = true; GL.save.storeProfile(profile); emit(); return; }
      profile.playerCode = GL.code.generate();
    }
  }
  async function codeSave(profile) {
    if (GL.sandbox && GL.sandbox.on()) return;
    if (!client || !profile || !profile.playerCode || !profile.codeClaimed || state.codeReady === false) return;
    try {
      const { error } = await client.rpc('code_save', { p_code: GL.code.key(profile.playerCode), p_name: profile.nickname || null, p_data: profile });
      if (error) { state.codeReady = false; state.codeError = codeMsg(error); emit(); return; }
      state.codeReady = true;
      setBase('c:' + GL.code.key(profile.playerCode), profile);
    } catch (e) { /* später erneut */ }
  }
  async function codeLoad(code) {
    if (!client) return { ok: false, msg: 'Geht nur auf der Website.' };
    const { data, error } = await client.rpc('code_load', { p_code: GL.code.key(code) });
    if (error) return { ok: false, msg: codeMsg(error) };
    state.codeReady = true;
    // Spielstand vom Server: nur ein Objekt akzeptieren und gefährliche Zeichen entfernen
    return { ok: true, data: data && typeof data === 'object' && !Array.isArray(data) ? safeData(data, 0, true) : null };
  }
  // Beim Start: Code reservieren bzw. neueren Stand von einem anderen Gerät übernehmen
  // Gleiche Regeln wie beim Cloud-Spielstand: nie blind überschreiben, im echten Zweifel einmal fragen.
  async function codeSync() {
    if (sandboxed() || state.hold || state.leaving) return;
    const local = profileRef;
    if (!local || !local.nickname) return;
    try {
      GL.code.ensure(local);
      if (!local.codeClaimed) return codeClaim(local);
      const res = await codeLoad(local.playerCode);
      if (state.hold || state.leaving) return;
      if (res.ok && !res.data) { local.codeClaimed = false; codeClaim(local); return; }
      if (!res.ok) { state.codeReady = false; state.codeError = res.msg; emit(); return; }
      const remote = res.data;
      delete remote._runJ;   // der Code-Speicher trägt keinen laufenden Run
      const key = 'c:' + GL.code.key(local.playerCode);
      let how = GL.cloudSync.decide(local, remote, { base: getBase(key), localT: localT(local), remoteT: remoteT(remote) });
      if (firstCode && pulledFlag() && (how === 'pull' || how === 'ask')) how = 'push';
      firstCode = false;
      if (how === 'pull') { setBase(key, remote); takeRemote(remote, false); }
      else if (how === 'ask') askConflict(local, remote, key);
      else if (how === 'push') codeSave(local);
      else setBase(key, local);
    } catch (e) { /* egal */ }
  }

  // Anonymes Profil mit E-Mail verknüpfen (Bestätigungslink kommt per Mail)
  async function linkEmail(email) {
    if (!client) return { ok: false, msg: 'Online-Speichern geht nur auf der Website.' };
    const { error } = await client.auth.updateUser({ email }, { emailRedirectTo: location.origin + location.pathname });
    if (error) return { ok: false, msg: niceError(error) };
    state.mailSent = email; state.mailKind = 'link'; emit();
    return { ok: true };
  }
  // Auf einem neuen Gerät: Anmeldelink bzw. Code per Mail
  async function loginEmail(email) {
    if (!client) return { ok: false, msg: 'Online-Speichern geht nur auf der Website.' };
    const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: location.origin + location.pathname } });
    if (error) return { ok: false, msg: niceError(error) };
    state.mailSent = email; state.mailKind = 'login'; emit();
    return { ok: true };
  }
  // Abmelden: Sitzung beenden, dieses Gerät startet danach frisch (Fortschritt bleibt online im Konto)
  async function logout() {
    // Vorher den letzten Stand sichern (sonst wäre Fortschritt seit dem letzten Upload weg)
    if (dirty) { try { await pushNow(); } catch (e) { /* egal */ } }
    state.leaving = true; state.pulled = false;
    clearTimeout(pushTimer);
    try { if (client) await client.auth.signOut(); } catch (e) { /* egal */ }
  }
  // 6-stelliger Code aus der Mail: Anmelden im selben Fenster, ohne Link
  async function verifyCode(code) {
    if (!client || !state.mailSent) return { ok: false, msg: 'Erst die E-Mail-Adresse eingeben.' };
    const type = state.mailKind === 'link' ? 'email_change' : 'email';
    const { error } = await client.auth.verifyOtp({ email: state.mailSent, token: String(code).trim(), type });
    if (error) return { ok: false, msg: niceError(error) };
    return { ok: true };
  }
  function niceError(e) {
    const m = String((e && e.message) || e || '');
    if (/signups not allowed|user not found|not found/i.test(m)) return 'Zu dieser Adresse gibt es noch keinen Account. Spiel erst einen Piraten und sichere ihn dann mit dieser Mail.';
    if (/already been registered|already registered|exists/i.test(m)) return 'Diese Adresse gehört schon zu einem Account. Nutze stattdessen „Anmelden“.';
    if (/expired|invalid/i.test(m)) return 'Der Code stimmt nicht oder ist abgelaufen. Fordere einfach einen neuen an.';
    if (/rate|seconds/i.test(m)) return 'Kurz warten, dann nochmal versuchen (Mail-Limit).';
    return m;
  }

  // ---------- Speicherort 2: geteilte Claude-Seite ----------
  async function initClaude(c) {
    const [db, u] = await Promise.all([c.use('db'), c.use('user')]);
    state.uid = u ? await u.id() : null;
    if (!db) { state.status = 'unavailable'; emit(); return; }
    state.backend = 'claude';
    if (u) {
      const w = await u.can('data.write');
      if (w === false && !(await u.isOwner())) state.readOnly = true;
    }
    if (!state.uid) state.readOnly = true;
    store = {
      async get(uid) { const s = await db.doc('scores/' + uid).get(); return s.exists ? s.data() : null; },
      async set(uid, body) { await db.doc('scores/' + uid).set(body); },
      async refresh() { /* live über onSnapshot */ }
    };
    db.collection('scores').limit(300).onSnapshot(snap => {
      state.rows = dedupe(snap.docs.map(x => Object.assign({ id: x.id }, x.data())).filter(r => !r.deleted));
      afterRows();
    }, () => { state.status = 'error'; emit(); });
  }

  async function init(profile) {
    profileRef = profile;
    const cfg = (GL.config && GL.config.online) || {};
    const c = window.claude;
    state.sync = cfg.url && !sandboxed() ? 'wait' : 'off';
    try {
      if (cfg.url && cfg.key && window.supabase) { state.status = 'connecting'; emit(); await initSupabase(cfg); }
      else if (c && typeof c.use === 'function') { state.status = 'connecting'; emit(); await initClaude(c); }
      else { state.status = 'local'; if (state.sync === 'wait') state.sync = 'off'; emit(); }
    } catch (e) {
      state.status = 'unavailable';
      state.error = e && (e.code || e.message) ? String(e.code || e.message) : 'fehler';
      if (state.sync !== 'ask') state.sync = 'off';
      emit();
    }
  }

  // Nach einem beendeten Run: Eintrag aktualisieren (Bestwert bleibt, Zähler steigen)
  async function submit(profile, run) {
    if (GL.sandbox && GL.sandbox.on()) return false;
    const S = run.stats || {};
    const entry = {
      score: GL.run.score(run),
      dmg: S.dmg || 0, maxHit: S.maxHit || 0, kos: S.kos || 0, crits: S.crits || 0,
      bosses: run.bounties || 0, duel: run.duel || null, won: run.phase === 'win',
      heat: run.heat || 0, bountyM: run.bountyM || 0, island: GL.run.island(run).name,
      captain: run.captain || (run.crew[0] && run.crew[0].id) || '',
      date: new Date().toISOString().slice(0, 10),
      step: run.step || 0,
      // Power-ups des Runs (für die Live-Meta im Wiki): Schätze, Früchte, Artefakte
      pu: { r: (run.relics || []).map(x => x.id), f: (run.eaten || []).slice(0, 12), a: (run.arts || []).map(x => x.id) },
      team: (run.crew || []).slice(0, 6).map(u => u.id === 'self' ? { id: 'self', lvl: u.lvl || 1, look: profile.char ? profile.char.look : null } : { id: u.id, lvl: u.lvl || 1 }),
      replay: { seed: run.seed, start: run.start, actions: run.actions },
      // Für die Live-Meta: Kampfstil am Ende und Ø-Schaden pro Kampf
      bk: (() => { try { const b = GL.effects.build(run.crew); return b ? b.key : null; } catch (e) { return null; } })(),
      dpf: Math.round((S.dmg || 0) / Math.max(1, S.fights || 1))
    };
    if (!profile.onlineBest || entry.score > profile.onlineBest.score) profile.onlineBest = entry;
    pending = entry;
    return flush(profile);
  }

  function liveFields(profile) {
    const vaultTop = Object.keys(profile.vault || {})
      .map(id => ({ id, lvl: GL.meta.artLevel(profile, id) }))
      .sort((a, b) => b.lvl - a.lvl).slice(0, 6);
    const chestTop = (profile.chest || []).slice()
      .sort((a, b) => b.r - a.r || (b.lvl || 0) - (a.lvl || 0)).slice(0, 4)
      .map(it => ({ id: it.id, r: it.r, lvl: it.lvl || 0 }));
    return {
      name: (profile.nickname || '').slice(0, 24) || 'Unbekannter Pirat',
      crewName: GL.meta.crewName ? GL.meta.crewName(profile) : null,
      look: profile.char ? profile.char.look : null,
      cos: profile.cos || null,
      ship: profile.ship || null,
      rank: GL.meta.rankProgress(profile).rank.name,
      rankXp: profile.rankXp || 0,
      heatMax: profile.heatMax || 0,
      artifacts: Object.keys(profile.vault || {}).length,
      vaultTop,
      chestTop,
      showcase: (profile.showcase || []).slice(0, 3),
      bestStep: profile.bestStep || 0,
      bestPlace: profile.bestPlace || null,
      isles: ((profile.seen && profile.seen.islands) || []).slice(0, 80),   // besuchte Inseln: „Dein Kumpel war schon auf …“
      pets: (profile.pets || []).length,
      endlessBest: profile.endlessBest || 0,
      endlessLoops: profile.endlessLoops || 0,
      endlessRec: profile.endlessRec || null,
      seasDone: GL.data.islands.filter((x, i) => GL.meta.chapterProgress(profile, i).complete).length,
      pos: GL.livePos ? Object.assign({}, GL.livePos) : null,
      squad: GL.meta.squadRefs(profile),
      squadPower: GL.meta.squadPower(GL.meta.squadRefs(profile)),
      squadW: profile.squadW || 0,
      squadOn: GL.meta.squadUnlocked(profile),
      squadRating: profile.squadRating == null ? 1000 : profile.squadRating,
      squadTactic: GL.squad && GL.squad.tacOf ? GL.squad.tacOf(profile.squadTactic) : null,
      dlRating: GL.dliga ? GL.dliga.rating(profile) : 0,   // Dungeon-Liga (Summe der Bestwerte)
      dlMarksTotal: Math.max(0, Math.min(1e8, Math.round(+profile.dlMarksTotal || 0))),
      captains: (profile.unlocked || []).length + GL.config.starters.length,
      landgang: Object.values(profile.dungeons || {}).reduce((n, d) => n + ((d && d.clears) || 0), 0),
      landOrte: Object.values(profile.dungeons || {}).filter(d => d && d.clears > 0).length,
      refBy: profile.refBy || null,
      invites: (profile.invites || []).length,
      season: profile.season || null,
      updated: new Date().toISOString()
    };
  }

  function fail(e) {
    if (e && (e.code === 'invalid_argument' || e.code === 'not_granted' || e.code === '42501')) state.readOnly = true;
    state.error = e && (e.code || e.message) ? String(e.code || e.message) : 'fehler';
    emit();
    return false;
  }

  async function flush(profile) {
    if (!store || !state.uid || state.readOnly || !pending) return false;
    const entry = pending;
    pending = null;
    try {
      let old = await store.get(state.uid);
      // Saison: Bestwert und Zähler beginnen mit der ersten Fahrt der neuen Saison bei null
      const sid = GL.season && GL.season.started() ? GL.season.id() : null;
      if (sid && old && old.sStat !== sid) old = null;
      const o = old || {};
      const n = v => Number(v) || 0;
      const better = !old || entry.score > n(o.score);
      const duels = Object.assign({}, o.duels || {});
      // alte Tageskarten nach einer Woche aufräumen
      const cut = Number(GL.daily.code(new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)).slice(1));
      Object.keys(duels).forEach(k => { if (/^T\d{8}$/.test(k) && Number(k.slice(1)) < cut) delete duels[k]; });
      if (entry.duel && (!duels[entry.duel] || entry.score > n(duels[entry.duel].score))) {
        duels[entry.duel] = { score: entry.score, won: entry.won, island: entry.island, dmg: entry.dmg, date: entry.date, step: entry.step, team: entry.team };
      }
      await store.set(state.uid, Object.assign({}, liveFields(profile), {
        sStat: sid || o.sStat || null,
        score: better ? entry.score : n(o.score),
        best: better ? entry : o.best || null,
        runs: n(o.runs) + 1,
        wins: n(o.wins) + (entry.won ? 1 : 0),
        topBounty: Math.max(n(o.topBounty), entry.bountyM || 0),
        bestDmg: Math.max(n(o.bestDmg), entry.dmg),
        maxHit: Math.max(n(o.maxHit), entry.maxHit),
        totalDmg: n(o.totalDmg) + entry.dmg,
        kos: n(o.kos) + entry.kos,
        crits: n(o.crits) + entry.crits,
        bossKills: n(o.bossKills) + entry.bosses,
        duels,
        // Letzte Runs (ohne Replay) für die Live-Meta im Wiki: wer war dabei, wie weit kam man
        runLog: [{ t: (entry.team || []).map(x => x.id), c: entry.captain, w: entry.won ? 1 : 0, s: entry.step, h: entry.heat || 0, d: entry.date, e: entry.duel && /^T/.test(entry.duel) ? 1 : 0, r: entry.pu ? entry.pu.r : undefined, f: entry.pu ? entry.pu.f : undefined, a: entry.pu ? entry.pu.a : undefined, b: entry.bk || undefined, m: entry.dpf || undefined }]
          .concat(Array.isArray(o.runLog) ? o.runLog : []).slice(0, 25)
      }));
      return better ? 'best' : 'saved';
    } catch (e) { return fail(e); }
  }

  // ---------- Feedback (Tabelle feedback, siehe tools/update-2026-10-17.sql) ----------
  async function sendFeedback(stars, comment, runs, rank, pin, name) {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return false;
    const row = { stars, comment: comment ? String(comment).slice(0, 300) : null, runs, rank };
    if (pin && comment) { row.pin = true; row.name = String(name || 'Pirat').slice(0, 24); }
    try {
      let { error } = await client.from('feedback').insert(row);
      if (error && row.pin) { delete row.pin; delete row.name; ({ error } = await client.from('feedback').insert(row)); }   // ohne Pinnwand-Spalten (altes SQL)
      return !error;
    } catch (e) { return false; }
  }
  // Pinnwand: öffentliche Rückmeldungen (nur die, die der Spieler freigegeben hat), höchstens alle 5 Minuten neu laden
  let pinCache = null, pinAt = 0;
  async function pinboard() {
    if (pinCache && Date.now() - pinAt < 300000) return pinCache;
    if (!client) return [];
    try {
      const { data, error } = await client.from('feedback').select('id,name,stars,comment,created_at').eq('pin', true).order('created_at', { ascending: false }).limit(40);
      if (error || !data) return pinCache || [];
      pinCache = data.map(x => ({ id: x.id, name: String(x.name || 'Pirat').replace(/[<>&"'`\u0000-\u001f]/g, '').slice(0, 24), stars: Math.max(1, Math.min(5, Number(x.stars) || 0)), text: String(x.comment || '').replace(/[<>`\u0000-\u0008]/g, '').slice(0, 300), at: x.created_at })).filter(x => x.text);
      pinAt = Date.now();
      return pinCache;
    } catch (e) { return pinCache || []; }
  }

  // ---------- Stammcrew-Verteidigung (Tabelle duel_events, siehe tools/update-2026-10-17.sql) ----------
  async function duelReport(defender, attackerWon, delta, name) {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return;
    if (!/^[0-9a-f-]{36}$/i.test(String(defender || '')) || defender === state.uid) return;
    try { await client.from('duel_events').insert({ defender, attacker_won: !!attackerWon, delta: Math.max(0, Math.min(64, Math.round(delta || 0))), attacker_name: String(name || 'Pirat').slice(0, 24) }); } catch (e) { /* ohne Tabelle egal */ }
  }
  // Neue Angriffe auf die eigene Stammcrew abholen (und danach löschen)
  async function duelInbox() {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return [];
    try {
      const { data, error } = await client.from('duel_events').select('id,attacker_name,attacker_won,delta,created_at').eq('defender', state.uid).order('created_at', { ascending: true }).limit(50);
      if (error || !data || !data.length) return [];
      data.forEach((x, i) => { data[i] = safeData(x); data[i].attacker_name = String(data[i].attacker_name || 'Pirat').slice(0, 24); data[i].delta = Math.max(0, Math.min(64, Number(data[i].delta) || 0)); data[i].attacker_won = !!data[i].attacker_won; });
      try { await client.from('duel_events').delete().in('id', data.map(x => x.id)); } catch (e) { /* egal */ }
      return data;
    } catch (e) { return []; }
  }

  // ---------- Flaschenpost (Tabelle bottle_post, siehe tools/flaschenpost.sql) ----------
  async function bottleSend(toId, item, name, note) {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return { ok: false, why: 'offline' };
    if (!/^[0-9a-f-]{36}$/i.test(String(toId || '')) || toId === state.uid) return { ok: false, why: 'ziel' };
    try {
      const { error } = await client.from('bottle_post').insert({ to_id: toId, from_name: String(name || 'Pirat').slice(0, 24), item, note: note ? String(note).slice(0, 60) : null });
      return error ? { ok: false, why: /row-level|policy/i.test(error.message || '') ? 'limit' : 'fehler' } : { ok: true };
    } catch (e) { return { ok: false, why: 'fehler' }; }
  }
  async function bottleInbox() {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return [];
    try {
      const { data, error } = await client.from('bottle_post').select('id,from_name,item,note,created_at').eq('to_id', state.uid).order('created_at', { ascending: true }).limit(20);
      if (error || !data || !data.length) return [];
      data.forEach((x, i) => { data[i] = safeData(x); data[i].from_name = String(data[i].from_name || 'Pirat').slice(0, 24); });
      try { await client.from('bottle_post').delete().in('id', data.map(x => x.id)); } catch (e) { /* egal */ }
      return data;
    } catch (e) { return []; }
  }

  // ---------- Segelkumpane (Tabelle friend_events, siehe tools/segelkumpan.sql) ----------
  // Wer jemanden anheuert, schickt eine kleine Nachricht mit Name und Freundescode. Ohne Tabelle passiert einfach nichts.
  const KUMPAN_CODE = /^[2-9A-HJKMNP-Z]{6}$/;
  async function friendSend(toId, name, code) {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return false;
    if (!/^[0-9a-f-]{36}$/i.test(String(toId || '')) || toId === state.uid) return false;
    const c = String(code || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!KUMPAN_CODE.test(c)) return false;
    try { const { error } = await client.from('friend_events').insert({ to_id: toId, from_name: String(name || 'Pirat').replace(/[<>"'`]/g, '').slice(0, 24), from_code: c }); return !error; } catch (e) { return false; }
  }
  async function friendInbox() {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return [];
    try {
      const { data, error } = await client.from('friend_events').select('id,from_name,from_code,created_at').eq('to_id', state.uid).order('created_at', { ascending: true }).limit(20);
      if (error || !data || !data.length) return [];
      try { await client.from('friend_events').delete().in('id', data.map(x => x.id)); } catch (e) { /* egal */ }
      return data.map(x => ({ name: String(x.from_name || 'Pirat').replace(/[<>"'`\u0000-\u001f]/g, '').slice(0, 24) || 'Pirat', code: String(x.from_code || '').toUpperCase().replace(/[^0-9A-Z]/g, '') }))
        .filter(x => KUMPAN_CODE.test(x.code));
    } catch (e) { return []; }
  }

  // Profil eintragen, ohne einen Run zu spielen
  async function register(profile) {
    if (GL.sandbox && GL.sandbox.on()) return false;
    if (!store || !state.uid || state.readOnly) return false;
    try {
      const old = await store.get(state.uid);
      const best = GL.save.best();
      const base = old || {
        score: best ? best.score : 0, best: null, runs: profile.stats.runs || 0, wins: profile.stats.wins || 0,
        topBounty: 0, bestDmg: 0, maxHit: 0, totalDmg: 0, kos: 0, crits: 0, bossKills: 0, duels: {}
      };
      await store.set(state.uid, Object.assign({}, base, liveFields(profile)));
      return true;
    } catch (e) { return fail(e); }
  }

  // Account zurücksetzen (full = false: Name und Aussehen bleiben) oder ganz löschen (full = true).
  // Online-Spielstand wird überschrieben, damit ihn kein Gerät zurückholt.
  async function wipe(full, keep) {
    if (GL.sandbox && GL.sandbox.on()) return;   // Zweitpirat: nur lokal löschen, nie den Hauptaccount
    clearTimeout(pushTimer);
    // Danach nichts Altes mehr hochladen (auch nicht beim Neuladen über pagehide).
    // Lädt die Seite nicht neu (Saison-Neustart), läuft der Abgleich nach ein paar Sekunden normal weiter.
    state.leaving = true;
    setTimeout(() => { if (!full) { state.leaving = false; if (dirty && profileRef) pushSave(profileRef); } }, 6000);
    if (state.backend === 'supabase' && client && state.uid) {
      const now = new Date().toISOString();
      try { await client.from('saves').upsert({ id: state.uid, data: { wiped: true, savedAt: Date.now() }, updated_at: now }); } catch (e) { /* egal */ }
      if (full) {
        let gone = false;
        try { const r = await client.from('scores').delete({ count: 'exact' }).eq('id', state.uid); gone = !r.error && r.count > 0; } catch (e) { /* egal */ }
        if (!gone) { try { await client.from('scores').upsert({ id: state.uid, name: '-', score: 0, data: { deleted: true }, updated_at: now }); } catch (e) { /* egal */ } }
        try { await client.auth.signOut(); } catch (e) { /* egal */ }
      } else {
        try { await client.from('scores').upsert({ id: state.uid, name: (keep && keep.nickname) || 'Pirat', score: 0, data: { rank: 0, rankXp: 0, look: keep && keep.char ? keep.char.look : null, cos: keep && keep.cos, updated: Date.now() }, updated_at: now }); } catch (e) { /* egal */ }
      }
    } else if (state.backend === 'claude' && store && state.uid && full) {
      try { await store.set(state.uid, { name: '-', score: 0, deleted: true }); } catch (e) { /* egal */ }
    }
  }

  async function rename(profile, name) {
    const n = String(name || '').trim().slice(0, 24);
    if (GL.nameCheck && !GL.nameCheck(n).ok) return false;
    profile.nickname = n;
    return register(profile);
  }

  // Beim Zurückkehren in die App: neueren Stand von anderen Geräten holen
  // Zuerst eigene ungesicherte Änderungen hochladen, dann schauen, ob ein anderes Gerät weiter ist.
  async function resync(force) {
    if (sandboxed() || state.hold) return;
    const cfg = (GL.config && GL.config.online) || {};
    // Start war offline: jetzt nochmal komplett verbinden
    if (!client && cfg.url && cfg.key && window.supabase && profileRef) { await init(profileRef); return; }
    if (!client) return;
    try {
      if (!state.uid) { await signIn(); if (!store) { await init(profileRef); return; } }
      if (state.pulled && dirty) await pushNow();
      if (!state.pulled || !dirty || force) await pullSave();
      await codeSync();
      if (store && store.refresh) await store.refresh();
      if (state.status === 'unavailable') { state.status = 'ready'; emit(); }
    } catch (e) { if (state.sync !== 'ask') setSync(state.cloud ? 'err' : 'off'); }
  }
  const refresh = () => (store && store.refresh ? store.refresh().catch(() => {}) : Promise.resolve());
  const pushRun = () => { if (profileRef && profileRef.nickname) pushSave(profileRef); };
  // Wieder online: offene Änderungen nachschieben
  window.addEventListener('online', () => { setTimeout(() => resync(), 1500); });
  GL.online = { flushSave, pushRun, pinboard, refresh, init, submit, rename, register, pushSave, resync, duelReport, duelInbox, bottleSend, bottleInbox, friendSend, friendInbox, sendFeedback, linkEmail, loginEmail, verifyCode, logout, wipe, liveFields, codeLoad, codeSave, codeClaim,
    badge, openAccount,
    onRemoteProfile(fn) { onRemote = fn; }, state: () => state, onChange(fn) { listeners.push(fn); } };
})();
