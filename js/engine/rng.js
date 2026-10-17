// Zufallsgenerator mit Startwert (Seed).
// Der Zustand liegt im Run selbst (run.rng). Dadurch lässt sich ein Run
// speichern, fortsetzen und später auf einem Server exakt nachrechnen,
// um gefälschte Ranglisten-Einträge zu erkennen.
window.GL = window.GL || {};

GL.rng = {
  newSeed() {
    return (Math.random() * 0x100000000) >>> 0;
  },

  // Gleitkommazahl in [0, 1), Mulberry32
  float(run) {
    run.rng = (run.rng + 0x6D2B79F5) >>> 0;
    let t = run.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  },

  // ganze Zahl von a bis b (beide eingeschlossen)
  int(run, a, b) {
    return a + Math.floor(GL.rng.float(run) * (b - a + 1));
  },

  // n zufällige, verschiedene Elemente aus arr
  sample(run, arr, n) {
    const copy = arr.slice();
    const out = [];
    while (out.length < n && copy.length) {
      out.push(copy.splice(GL.rng.int(run, 0, copy.length - 1), 1)[0]);
    }
    return out;
  }
};
