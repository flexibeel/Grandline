// Online-Rangliste. Zwei mögliche Speicherorte:
//  1. Eigene Datenbank (Supabase), wenn GL.config.online.url und .key gesetzt sind.
//     Dann kann sich jeder mit dem Link eintragen (anonyme Anmeldung, kein Konto nötig).
//  2. Sonst die gemeinsame Datenbank der geteilten Claude-Seite (nur Besitzer und Bearbeiter schreiben).
// Lokal ohne beides: nur der eigene Bestwert.
// Jeder Spieler hat genau einen Eintrag (seine id). Alle lesen alle Einträge, jeder schreibt nur seinen.
window.GL = window.GL || {};

(function () {
  const state = { status: 'local', rows: [], uid: null, readOnly: false, error: '', backend: 'local' };
  const listeners = [];
  let store = null;     // { get(uid), set(uid, body), refresh() }
  let pending = null;
  let registered = false;
  let profileRef = null;

  function emit() { listeners.forEach(fn => { try { fn(); } catch (e) { /* Anzeige-Fehler ignorieren */ } }); }

  function afterRows() {
    state.status = 'ready';
    emit();
    const profile = profileRef;
    if (!profile || state.readOnly || !state.uid) return;
    const mine = state.rows.some(r => r.id === state.uid);
    if (profile.nickname && !registered && !mine) { registered = true; register(profile); }
    if (pending == null && !mine && profile.onlineBest) { pending = profile.onlineBest; flush(profile); }
  }

  // ---------- Speicherort 1: Supabase ----------
  async function initSupabase(cfg) {
    const client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true } });
    const { data } = await client.auth.getSession();
    let session = data && data.session;
    if (!session) {
      const res = await client.auth.signInAnonymously();
      if (res.error) throw res.error;
      session = res.data.session;
    }
    state.uid = session.user.id;
    state.backend = 'supabase';
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
        state.rows = (d || []).map(toRow);
        afterRows();
      }
    };
    await store.refresh();
    setInterval(() => { if (!document.hidden) store.refresh().catch(() => {}); }, 30000);
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
      state.rows = snap.docs.map(x => Object.assign({ id: x.id }, x.data()));
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
    const S = run.stats || {};
    const entry = {
      score: GL.run.score(run),
      dmg: S.dmg || 0, maxHit: S.maxHit || 0, kos: S.kos || 0, crits: S.crits || 0,
      bosses: run.bounties || 0, duel: run.duel || null, won: run.phase === 'win',
      heat: run.heat || 0, bountyM: run.bountyM || 0, island: GL.run.island(run).name,
      captain: run.captain || (run.crew[0] && run.crew[0].id) || '',
      date: new Date().toISOString().slice(0, 10),
      replay: { seed: run.seed, start: run.start, actions: run.actions }
    };
    if (!profile.onlineBest || entry.score > profile.onlineBest.score) profile.onlineBest = entry;
    pending = entry;
    return flush(profile);
  }

  function liveFields(profile) {
    return {
      name: (profile.nickname || '').slice(0, 24) || 'Unbekannter Pirat',
      rank: GL.meta.rankProgress(profile).rank.name,
      rankXp: profile.rankXp || 0,
      heatMax: profile.heatMax || 0,
      artifacts: Object.keys(profile.vault || {}).length,
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
      if (entry.duel && (!duels[entry.duel] || entry.score > n(duels[entry.duel].score))) {
        duels[entry.duel] = { score: entry.score, won: entry.won, island: entry.island, dmg: entry.dmg, date: entry.date };
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

  // Profil eintragen, ohne einen Run zu spielen
  async function register(profile) {
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

  async function rename(profile, name) {
    profile.nickname = String(name || '').trim().slice(0, 24);
    return register(profile);
  }

  GL.online = { init, submit, rename, register, state: () => state, onChange(fn) { listeners.push(fn); } };
})();
