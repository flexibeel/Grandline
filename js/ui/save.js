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
      return run;
    },
    storeRun(run) { write(RUN_KEY, run); },
    clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) { /* egal */ } },

    // Dauerhaftes Profil: Freischaltungen, Sammelalbum, Statistik
    loadProfile() {
      const p = read(PROFILE_KEY);
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
    const p = JSON.parse(new TextDecoder().decode(bytes));
    if (!p || typeof p !== 'object' || !p.stats) throw new Error('Der Code ist unvollständig.');
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
// Für die Online-Funktionen: Zweitpiraten werden nie online gespeichert
GL.sandbox = { on: () => GL.slots.active() !== 0 };
