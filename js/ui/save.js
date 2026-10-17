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


// Persönlicher Spielercode: Schlüssel zum Spielstand auf allen Geräten.
// Format XXXX-XXXX-XXXX-XXXX (ohne verwechselbare Zeichen), 80 Bit Zufall.
// Der Server sieht nur den SHA-256-Fingerabdruck, nie den Code selbst.
GL.code = {
  ALPHA: '23456789ABCDEFGHJKMNPQRSTUVWXYZ',
  generate() {
    const a = GL.code.ALPHA, bytes = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    const raw = Array.from(bytes, b => a[b % a.length]).join('');
    return raw.match(/.{4}/g).join('-');
  },
  normalize(c) { return String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1'); },
  valid(c) { const n = GL.code.normalize(c); return n.length === 16 && /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/.test(n); },
  format(c) { return GL.code.normalize(c).match(/.{1,4}/g).join('-'); },
  async key(c) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('grandline:' + GL.code.normalize(c)));
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  },
  ensure(profile) {
    if (!profile.playerCode || !GL.code.valid(profile.playerCode)) profile.playerCode = GL.code.generate();
    return profile.playerCode;
  }
};
