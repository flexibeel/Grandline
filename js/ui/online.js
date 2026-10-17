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
  const MAXF = ['score', 'wins', 'runs', 'topBounty', 'bestDmg', 'maxHit', 'totalDmg', 'kos', 'crits', 'bossKills', 'rankXp', 'artifacts', 'heatMax', 'captains', 'squadW', 'squadRating'];
  function dedupe(rows) {
    const groups = {};
    const out = [];
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
    if (profile.nickname && !registered && (!mine || (mineRow && !mineRow.squad))) { registered = true; register(profile); }
    if (pending == null && !mine && profile.onlineBest) { pending = profile.onlineBest; flush(profile); }
  }

  // ---------- Speicherort 1: Supabase ----------
  async function initSupabase(cfg) {
    client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data } = await client.auth.getSession();
    let session = data && data.session;
    if (!session) {
      const res = await client.auth.signInAnonymously();
      if (res.error) throw res.error;
      session = res.data.session;
    }
    state.uid = session.user.id;
    state.backend = 'supabase';
    state.anon = !!session.user.is_anonymous;
    state.email = session.user.email || null;
    await pullSave();
    await codeSync();
    const toRow = r => Object.assign({}, r.data || {}, { id: r.id, name: r.name, score: r.score });
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
        const { data: d, error } = await client.from('scores').select('id,name,score,data').order('score', { ascending: false }).limit(300);
        if (error) throw error;
        state.rows = dedupe((d || []).map(toRow).filter(r => !r.deleted));
        afterRows();
      }
    };
    await store.refresh();
    setInterval(() => { if (!document.hidden) store.refresh().catch(() => {}); }, 30000);
  }

  // ---------- Online-Spielstand (alle Geräte) ----------
  // Tabelle saves: eine Zeile pro Spieler mit dem ganzen Profil
  async function pullSave() {
    if (GL.sandbox && GL.sandbox.on()) return;
    try {
      const { data: d, error } = await client.from('saves').select('data,updated_at').eq('id', state.uid).maybeSingle();
      if (error) return;
      state.cloud = true;
      const local = profileRef;
      // Neues Konto auf diesem Gerät (z. B. gerade angemeldet): der Online-Spielstand hat immer Vorrang,
      // sonst könnte ein frisch angelegter Pirat den echten Fortschritt überschreiben.
      let lastUid = null;
      try { lastUid = localStorage.getItem('grandline.uid'); localStorage.setItem('grandline.uid', state.uid); } catch (e) { /* egal */ }
      const switched = !!lastUid && lastUid !== state.uid;
      const remote = d && d.data && !d.data.wiped ? d.data : null;
      const remoteBetter = remote && (!local || switched || (remote.savedAt || 0) > (local.savedAt || 0) + 1000
        || (!state.anon && (remote.rankXp || 0) > (local.rankXp || 0)));
      if (remoteBetter && onRemote) onRemote(remote);
      else if (local && local.nickname) pushSave(local);   // erster Upload von diesem Gerät
    } catch (e) { /* ohne Tabelle läuft alles lokal weiter */ }
  }
  function pushSave(profile) {
    if (GL.sandbox && GL.sandbox.on()) return;
    if (!client || !state.uid) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      if (state.cloud) { try { await client.from('saves').upsert({ id: state.uid, data: profile, updated_at: new Date().toISOString() }); } catch (e) { /* später erneut */ } }
      codeSave(profile);
    }, 3000);
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
    } catch (e) { /* später erneut */ }
  }
  async function codeLoad(code) {
    if (!client) return { ok: false, msg: 'Geht nur auf der Website.' };
    const { data, error } = await client.rpc('code_load', { p_code: GL.code.key(code) });
    if (error) return { ok: false, msg: codeMsg(error) };
    state.codeReady = true;
    return { ok: true, data: data || null };
  }
  // Beim Start: Code reservieren bzw. neueren Stand von einem anderen Gerät übernehmen
  async function codeSync() {
    if (GL.sandbox && GL.sandbox.on()) return;
    const local = profileRef;
    if (!local || !local.nickname) return;
    try {
      GL.code.ensure(local);
      if (!local.codeClaimed) return codeClaim(local);
      const res = await codeLoad(local.playerCode);
      if (res.ok && res.data && (res.data.savedAt || 0) > (local.savedAt || 0) + 1000 && onRemote) onRemote(res.data);
      else if (res.ok && !res.data) { local.codeClaimed = false; codeClaim(local); }
      else if (res.ok) codeSave(local);
      else { state.codeReady = false; state.codeError = res.msg; emit(); }
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
    try {
      if (cfg.url && cfg.key && window.supabase) { state.status = 'connecting'; emit(); await initSupabase(cfg); }
      else if (c && typeof c.use === 'function') { state.status = 'connecting'; emit(); await initClaude(c); }
      else { state.status = 'local'; emit(); }
    } catch (e) {
      state.status = 'unavailable';
      state.error = e && (e.code || e.message) ? String(e.code || e.message) : 'fehler';
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
      team: (run.crew || []).slice(0, 6).map(u => u.id === 'self' ? { id: 'self', lvl: u.lvl || 1, look: profile.char ? profile.char.look : null } : { id: u.id, lvl: u.lvl || 1 }),
      replay: { seed: run.seed, start: run.start, actions: run.actions }
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
      look: profile.char ? profile.char.look : null,
      cos: profile.cos || null,
      rank: GL.meta.rankProgress(profile).rank.name,
      rankXp: profile.rankXp || 0,
      heatMax: profile.heatMax || 0,
      artifacts: Object.keys(profile.vault || {}).length,
      vaultTop,
      chestTop,
      showcase: (profile.showcase || []).slice(0, 3),
      bestStep: profile.bestStep || 0,
      bestPlace: profile.bestPlace || null,
      seasDone: GL.data.islands.filter((x, i) => GL.meta.chapterProgress(profile, i).complete).length,
      pos: GL.livePos ? Object.assign({}, GL.livePos) : null,
      squad: GL.meta.squadRefs(profile),
      squadPower: GL.meta.squadPower(GL.meta.squadRefs(profile)),
      squadW: profile.squadW || 0,
      squadOn: GL.meta.squadUnlocked(profile),
      squadRating: profile.squadRating == null ? 1000 : profile.squadRating,
      captains: (profile.unlocked || []).length + GL.config.starters.length,
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
      const old = await store.get(state.uid);
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
        duels
      }));
      return better ? 'best' : 'saved';
    } catch (e) { return fail(e); }
  }

  // ---------- Feedback (Tabelle feedback, siehe tools/update-2026-10-17.sql) ----------
  async function sendFeedback(stars, comment, runs, rank) {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return false;
    try {
      const { error } = await client.from('feedback').insert({ stars, comment: comment ? String(comment).slice(0, 300) : null, runs, rank });
      return !error;
    } catch (e) { return false; }
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
      try { await client.from('duel_events').delete().in('id', data.map(x => x.id)); } catch (e) { /* egal */ }
      return data;
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
  async function resync() {
    if (!client || !state.uid || (GL.sandbox && GL.sandbox.on())) return;
    try { await pullSave(); await codeSync(); if (store && store.refresh) await store.refresh(); } catch (e) { /* egal */ }
  }
  GL.online = { init, submit, rename, register, pushSave, resync, duelReport, duelInbox, sendFeedback, linkEmail, loginEmail, verifyCode, logout, wipe, liveFields, codeLoad, codeSave, codeClaim,
    onRemoteProfile(fn) { onRemote = fn; }, state: () => state, onChange(fn) { listeners.push(fn); } };
})();
