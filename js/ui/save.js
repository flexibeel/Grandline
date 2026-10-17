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
