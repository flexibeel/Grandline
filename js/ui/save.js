// Speicherstand im Browser (localStorage).
// Der laufende Run wird nach jeder Aktion gespeichert, damit du nach dem
// Schließen des Tabs weiterspielen kannst. Dazu der beste Run als Highscore.
window.GL = window.GL || {};

(function () {
  const RUN_KEY = 'grandline.run';
  const BEST_KEY = 'grandline.best';
  const PROFILE_KEY = 'grandline.profile';

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* Speichern nicht möglich, Spiel läuft trotzdem */ }
  }

  GL.save = {
    loadRun() {
      const run = read(RUN_KEY);
      if (!run || run.version !== GL.config.saveVersion) return null;
      GL.save.runAt = Math.max(GL.save.runAt || 0, run.savedAt || 0);
      if (GL.save.runAt0 == null) GL.save.runAt0 = run.savedAt || 0;
      return run;
    },
    storeRun(run) { run.savedAt = GL.save.runAt = Date.now(); write(RUN_KEY, run); if (GL.online && GL.online.pushRun) GL.online.pushRun(); },
    clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) { /* egal */ } },

    // Dauerhaftes Profil: Freischaltungen, Sammelalbum, Statistik
    loadProfile() {
      const p = read(PROFILE_KEY);
      // Großer Neustart: alter Stand wird gesichert, alle starten frisch
      // Neue Saison: Fortschritt bleibt, es gibt einmal den Einspieler (frisch starten ist freiwillig)
      if (p && p.version === 1 && GL.season && GL.season.stale(p)) { p.season = GL.season.id(); p.launchIntro = true; write(PROFILE_KEY, p); }
      // Stand beim Laden merken: der Cloud-Abgleich vergleicht damit (nicht mit Kleinkram der ersten Sekunden)
      try { GL.save.loaded = p && p.version === 1 ? { at: p.savedAt || 0, sig: GL.cloudSync.sig(p), prog: GL.cloudSync.prog(p) } : null; } catch (e) { GL.save.loaded = null; }
      return p && p.version === 1 ? GL.meta.migrate(p) : GL.meta.newProfile();
    },
    storeProfile(p) { p.savedAt = Date.now(); write(PROFILE_KEY, p); if (GL.online) GL.online.pushSave(p); },
    // Spielstand von einem anderen Gerät übernehmen
    replaceProfile(p) { write(PROFILE_KEY, p); },

    best() { return read(BEST_KEY); },

    // Gibt true zurück, wenn der Run ein neuer Bestwert ist.
    recordFinished(run) {
      const score = GL.run.score(run);
      const best = read(BEST_KEY);
      if (best && best.score >= score) return false;
      write(BEST_KEY, {
        score,
        bounties: run.bounties,
        island: GL.run.island(run).name,
        won: run.phase === 'win',
        date: new Date().toISOString().slice(0, 10)
      });
      return true;
    }
  };
})();

// Cloud-Abgleich: welcher Stand gilt? (reine Logik, ohne Netz; getestet in tools/sync-test.js)
//  sig:  Fingerabdruck des Inhalts (ohne Zeitstempel), unabhängig von der Reihenfolge der Schlüssel
//  base: Fingerabdruck beim letzten erfolgreichen Abgleich dieses Geräts ({ sig })
//  Ergebnis: 'push' (hochladen), 'pull' (Cloud übernehmen), 'ask' (einmal fragen), 'same', 'none'
GL.cloudSync = (function () {
  const SKIP = { savedAt: 1, _runJ: 1, codeClaimed: 1 };
  function stable(v) {
    if (v == null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    return '{' + Object.keys(v).filter(k => !SKIP[k] && v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  }
  function sig(p) {
    if (!p || typeof p !== 'object') return '0';
    if (p.wiped) return 'wiped';
    const s = stable(p);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36) + '.' + s.length;
  }
  // Fortschritt grob als Zahl: Rang-EP plus ein bisschen pro Run
  function prog(p) { return !p || p.wiped ? 0 : (Number(p.rankXp) || 0) + 10 * ((p.stats && Number(p.stats.runs)) || 0); }
  const fresh = p => !p || !p.nickname || prog(p) === 0;
  // a ist „deutlich weiter“ als b
  const ahead = (a, b) => prog(a) > prog(b) * 1.05 + 30;
  function decide(local, remote, o) {
    o = o || {};
    const lt = o.localT != null ? o.localT : (local && local.savedAt) || 0;
    const rt = o.remoteT != null ? o.remoteT : (remote && remote.savedAt) || 0;
    const ls = o.localSig || sig(local), rs = sig(remote);
    if (!remote) return local && local.nickname ? 'push' : 'none';
    if (!local || !local.nickname) return remote.wiped ? 'none' : 'pull';
    if (ls === rs) return 'same';
    if (remote.wiped && fresh(local)) return 'push';
    if (fresh(local) && !remote.wiped) return 'pull';
    // Anderes Konto als zuletzt auf diesem Gerät (gerade angemeldet): nie still hochladen
    if (o.switched) return ahead(local, remote) ? 'ask' : 'pull';
    const base = o.base;
    if (base && base.sig) {
      if (base.sig === rs) return 'push';                     // nur hier geändert
      if (base.sig === ls) return rt >= lt || !ahead(local, remote) ? 'pull' : 'ask';   // nur in der Cloud geändert
    }
    // Beide geändert oder dieses Gerät kennt den Cloud-Stand nicht (neues Gerät, Browser geleert, gerade angemeldet)
    if (rt > lt) return ahead(local, remote) ? 'ask' : 'pull';
    if (lt > rt) return ahead(remote, local) ? 'ask' : 'push';
    return ahead(remote, local) ? 'pull' : 'push';
  }
  return { sig, prog, decide, ahead };
})();
if (typeof module !== 'undefined') module.exports = GL;

// Spielstand-Code: ganzes Profil als kurzer Text (gzip + base64), z. B. per Messenger aufs andere Gerät.
// Funktioniert ohne Anmeldung und ohne Mail.
GL.transfer = {
  async exportCode(profile) {
    const json = JSON.stringify(profile);
    let bytes = new TextEncoder().encode(json), tag = 'GL0.';
    if (window.CompressionStream) {
      const cs = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
      bytes = new Uint8Array(await new Response(cs).arrayBuffer()); tag = 'GL1.';
    }
    let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); });
    return tag + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  async importCode(code) {
    const c = String(code || '').trim().replace(/\s+/g, '');
    const m = c.match(/^GL([01])\.(.+)$/);
    if (!m) throw new Error('Das ist kein Spielstand-Code.');
    const b64 = m[2].replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
    let bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
    if (m[1] === '1') {
      if (!window.DecompressionStream) throw new Error('Dieser Browser kann den Code nicht lesen.');
      const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      bytes = new Uint8Array(await new Response(ds).arrayBuffer());
    }
    let p = JSON.parse(new TextDecoder().decode(bytes));
    if (!p || typeof p !== 'object' || Array.isArray(p) || !p.stats) throw new Error('Der Code ist unvollständig.');
    // Fremder Code = fremde Daten: gefährliche Zeichen entfernen (wie bei Online-Spielständen)
    if (GL.safeData) p = GL.safeData(p, 0, true);
    return p;
  }
};


// Persönlicher Spielercode: kurzer Schlüssel zum Spielstand auf allen Geräten, z. B. K7Q-F9X.
// 6 Zeichen ohne verwechselbare Zeichen (kein 0/O, 1/I/L). Der Server reserviert jeden Code nur einmal.
GL.code = {
  ALPHA: '23456789ABCDEFGHJKMNPQRSTUVWXYZ',
  LEN: 6,
  generate() {
    const a = GL.code.ALPHA, bytes = new Uint8Array(GL.code.LEN);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    const raw = Array.from(bytes, b => a[b % a.length]).join('');
    return raw.slice(0, 3) + '-' + raw.slice(3);
  },
  normalize(c) { return String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1'); },
  valid(c) { const n = GL.code.normalize(c); return n.length === GL.code.LEN && /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/.test(n); },
  format(c) { const n = GL.code.normalize(c); return n.slice(0, 3) + '-' + n.slice(3); },
  key(c) { return GL.code.normalize(c); },
  // Alte lange Codes werden automatisch durch einen kurzen ersetzt (muss dann neu reserviert werden)
  ensure(profile) {
    if (!profile.playerCode || !GL.code.valid(profile.playerCode)) { profile.playerCode = GL.code.generate(); profile.codeClaimed = false; }
    return profile.playerCode;
  }
};

// Streamer-Modus: verdeckt Mail und Spielercode. Gilt pro Gerät; per Link ?stream=1 direkt an.
GL.streamer = (function () {
  const KEY = 'grandline.streamer';
  let mem = false;
  try { mem = localStorage.getItem(KEY) === '1'; } catch (e) {}
  try { if (/[?&]stream(er)?(=1|=on)?(&|$)/.test(location.search)) { mem = true; localStorage.setItem(KEY, '1'); } } catch (e) {}
  return {
    on: () => mem,
    set(v) { mem = !!v; try { localStorage.setItem(KEY, mem ? '1' : '0'); } catch (e) {} return mem; }
  };
})();

// Spielstände: Platz 1 ist der Hauptpirat (online, Rangliste, Spielercode).
// Platz 2 und 3 sind Zweitpiraten nur auf diesem Gerät: zum Ausprobieren, ohne Online-Speichern.
// Gespeichert wird immer unter den normalen Schlüsseln; beim Wechseln wird umgeräumt.
GL.slots = (function () {
  const ACTIVE = 'grandline.slot', KEYS = ['grandline.profile', 'grandline.run', 'grandline.best'], MAX = 3;
  const store = i => k => k + (i === 0 ? '.real' : '.s' + i);
  let cur = 0;
  try { cur = Math.max(0, Math.min(MAX - 1, Number(localStorage.getItem(ACTIVE)) || 0)); } catch (e) {}
  // Altlast aus dem ersten Testmodus
  try { if (localStorage.getItem('grandline.sandbox') === '1' && !localStorage.getItem(ACTIVE)) { cur = 1; localStorage.setItem(ACTIVE, '1'); } localStorage.removeItem('grandline.sandbox'); } catch (e) {}
  function read(i) {
    try {
      const raw = i === cur ? localStorage.getItem(KEYS[0]) : localStorage.getItem(store(i)(KEYS[0]));
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p && p.nickname ? { name: p.nickname, rankXp: p.rankXp || 0, runs: (p.stats && p.stats.runs) || 0, look: p.char && p.char.look, savedAt: p.savedAt || 0 } : null;
    } catch (e) { return null; }
  }
  return {
    max: MAX,
    active: () => cur,
    info: read,
    switchTo(i) {
      if (i === cur || i < 0 || i >= MAX) return false;
      try {
        KEYS.forEach(k => { const v = localStorage.getItem(k); if (v != null) localStorage.setItem(store(cur)(k), v); else localStorage.removeItem(store(cur)(k)); });
        KEYS.forEach(k => { const v = localStorage.getItem(store(i)(k)); localStorage.removeItem(k); if (v != null) localStorage.setItem(k, v); localStorage.removeItem(store(i)(k)); });
        cur = i; localStorage.setItem(ACTIVE, String(i));
      } catch (e) { return false; }
      return true;
    },
    remove(i) {
      if (i === 0 || i === cur) return false;
      try { KEYS.forEach(k => localStorage.removeItem(store(i)(k))); } catch (e) { return false; }
      return true;
    }
  };
})();
// Echtes Zweitkonto (nur für den Entwickler): komplett eigener Online-Pirat mit eigener Anmeldung.
// Beim Wechseln werden Spielstand und Anmeldung des aktuellen Kontos weggelegt und die des anderen geladen.
// „Neu anlegen“ startet einen ganz frischen Online-Piraten (wie ein neuer Spieler), das Hauptkonto bleibt unberührt.
GL.accounts = (function () {
  const VAULT = 'grandline.acct.', CUR = 'grandline.acct.cur';
  const own = k => /^grandline\.(profile|run|best|uid)$/.test(k) || /^sb-.*-auth-token$/.test(k);
  const cur = () => { try { return localStorage.getItem(CUR) === 'test' ? 'test' : 'main'; } catch (e) { return 'main'; } };
  function snap() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (own(k)) o[k] = localStorage.getItem(k); } return o; }
  function clear() { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (own(k)) ks.push(k); } ks.forEach(k => localStorage.removeItem(k)); }
  function switchTo(to, fresh) {
    try {
      const from = cur();
      if (to === from && !fresh) return false;
      if (to !== from) localStorage.setItem(VAULT + from, JSON.stringify(snap()));
      clear();
      if (!fresh) { const v = JSON.parse(localStorage.getItem(VAULT + to) || '{}'); Object.keys(v).forEach(k => { if (own(k)) localStorage.setItem(k, v[k]); }); }
      localStorage.removeItem(VAULT + to);
      localStorage.setItem(CUR, to);
      sessionStorage.removeItem('gl.pulled');
      return true;
    } catch (e) { return false; }
  }
  const hasTest = () => { try { return cur() === 'test' || !!localStorage.getItem(VAULT + 'test'); } catch (e) { return false; } };
  const name = k => { try { const v = k === cur() ? { 'grandline.profile': localStorage.getItem('grandline.profile') } : JSON.parse(localStorage.getItem(VAULT + k) || '{}'); const p = JSON.parse(v['grandline.profile'] || 'null'); return p && p.nickname ? p.nickname : null; } catch (e) { return null; } };
  return { cur, switchTo, hasTest, name, known: () => { try { return !!localStorage.getItem(CUR); } catch (e) { return false; } } };
})();

// Für die Online-Funktionen: Zweitpiraten werden nie online gespeichert
GL.sandbox = { on: () => GL.slots.active() !== 0 };

// Tageskarte: jeden Tag dieselbe Karte für alle (Seed aus dem Datum), ohne dauerhafte Boni, ein Versuch pro Tag.
GL.daily = {
  today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  code(day) { return 'T' + String(day || GL.daily.today()).replace(/-/g, ''); },
  // Heute schon gespielt? (dieses Gerät oder online, z. B. auf dem anderen Handy)
  done(profile) {
    const day = GL.daily.today();
    // Abgebrochen (keine Punkte)? Dann darf man es einmal neu versuchen
    if (profile.daily && profile.daily.d === day && (profile.daily.score != null || (profile.daily.tries || 1) >= 2)) return { local: true, score: profile.daily.score };
    if (profile.daily && profile.daily.d === day) return null;
    const st = GL.online && GL.online.state ? GL.online.state() : null;
    const me = st && st.uid && (st.rows || []).find(x => x.id === st.uid || (profile.nickname && x.name === profile.nickname));
    const e = me && me.duels && me.duels[GL.daily.code(day)];
    return e ? { online: true, score: e.score } : null;
  },
  seed(day) { let h = 2166136261; const t = 'grandline-' + (day || GL.daily.today()); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
};
