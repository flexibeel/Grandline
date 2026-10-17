// Gemütliche Hintergrundmusik, komplett selbst komponiert und live im Browser erzeugt (WebAudio).
// Keine Audiodateien, keine fremden Samples, daher lizenzfrei.
//   Titelbild: leise Spieluhr-Melodie mit warmem Teppich
//   Hauptquartier und Fahrt: noch leiser, nur Begleitung und vereinzelte Töne
// Startet erst nach der ersten Berührung (Browser-Regel). Schalter ♪ merkt sich die Wahl.
window.GL = window.GL || {};

(function () {
  const KEY = 'grandline.music';
  let on = true;
  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}
  let ctx = null, master = null, wet = null, timer = null, mode = 'off', unlocked = false;
  let nextTime = 0, step = 0;
  const BPM = 84, EIGHTH = 60 / BPM / 2;
  const VOL = { title: 0.16, hq: 0.07, run: 0.045, off: 0 };

  const N = n => 440 * Math.pow(2, (n - 69) / 12);       // MIDI-Nummer -> Hz
  const nm = s => { const m = /^([A-G])(#?)(\d)$/.exec(s); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0); };

  // Akkorde (je ein Takt) und Melodie (8 Achtel pro Takt, '.' = Pause)
  const CHORDS = [['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'],
                  ['C3', 'E3', 'G3'], ['E2', 'G2', 'B2'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3']];
  const MEL = [
    'E5 . G5 . A5 G5 E5 .', 'C5 . E5 . D5 . C5 .', 'A4 . C5 . F5 E5 D5 .', 'D5 . E5 D5 B4 . G4 .',
    'E5 . G5 . C6 . B5 A5', 'G5 . E5 . D5 E5 G5 .', 'A5 G5 F5 . E5 . D5 .', 'D5 . E5 . C5 . . .'
  ].map(b => b.split(' '));
  // Zweiter Durchgang: ruhige Variante, nur einzelne Töne
  const MEL2 = [
    'G5 . . . E5 . . .', 'E5 . . . C5 . . .', 'F5 . . . A4 . . .', 'D5 . . . B4 . . .',
    'C6 . . . G5 . . .', 'B5 . . . G5 . . .', 'A5 . . . F5 . . .', 'G5 . . . . . . .'
  ].map(b => b.split(' '));

  function reverb() {
    const len = ctx.sampleRate * 2.2, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const cv = ctx.createConvolver(); cv.buffer = buf; return cv;
  }
  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    master.connect(lp); lp.connect(ctx.destination);
    const rv = reverb(); wet = ctx.createGain(); wet.gain.value = 0.32;
    wet.connect(rv); rv.connect(lp);
    return true;
  }
  function out(node, dry) { const g = ctx.createGain(); g.gain.value = dry; node.connect(g); g.connect(master); node.connect(wet); }

  // Spieluhr/Kalimba: Grundton + leiser Oberton, schnelles Anklingen, langes Ausklingen
  function pluck(t, f, v) {
    [[1, 'sine', 1], [2, 'sine', 0.22], [3.01, 'triangle', 0.06]].forEach(([mul, type, amp]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f * mul;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * amp, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (mul === 1 ? 1.6 : 0.6));
      o.connect(g); out(g, 0.85); o.start(t); o.stop(t + 1.7);
    });
  }
  // Warmer Teppich: zwei leicht verstimmte Dreiecke, weich gefiltert
  function pad(t, notes, dur, v) {
    notes.forEach(n => [-4, 4].forEach(det => {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = N(nm(n) + 12); o.detune.value = det;
      f.type = 'lowpass'; f.frequency.value = 900;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.35); g.gain.linearRampToValueAtTime(0, t + dur * 1.02);
      o.connect(f); f.connect(g); out(g, 0.7); o.start(t); o.stop(t + dur * 1.05);
    }));
  }
  function bass(t, n, v) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = N(nm(n) - 12);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g); out(g, 1); o.start(t); o.stop(t + 1.2);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.25) {
      const bar = Math.floor(step / 8) % 8, pos = step % 8, pass = Math.floor(step / 64) % 2;
      const ch = CHORDS[bar], t = nextTime, calm = mode !== 'title';
      if (pos === 0) { pad(t, ch, EIGHTH * 8, calm ? 0.05 : 0.06); bass(t, ch[0], 0.22); }
      if (pos === 4) bass(t, ch[0], 0.14);
      // Begleit-Arpeggio, sehr leise
      if (pos % 2 === 1 && !(calm && pos % 4 !== 3)) pluck(t, N(nm(ch[(pos >> 1) % 3]) + 12), 0.05);
      const mel = (calm || pass === 1 ? MEL2 : MEL)[bar][pos];
      if (mel && mel !== '.') pluck(t + (Math.random() * 0.012), N(nm(mel)), calm ? 0.11 : 0.16);
      nextTime += EIGHTH; step++;
    }
  }
  function fadeTo(v, s) {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(v, t + (s || 1.5));
  }
  function run() {
    if (!ctx) return;
    if (!timer) { nextTime = ctx.currentTime + 0.1; timer = setInterval(schedule, 90); }
    if (ctx.state === 'suspended') ctx.resume();
  }
  function apply() {
    const want = on && unlocked ? VOL[mode] || 0 : 0;
    if (!want) { fadeTo(0, 0.8); return; }
    if (!init()) return;
    run(); fadeTo(want, 2.2);
  }

  // Erste Berührung schaltet Audio frei
  const unlock = () => { if (unlocked) return; unlocked = true; apply(); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, unlock, { once: false, passive: true }));
  // Tab im Hintergrund: Musik pausieren
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on && unlocked && VOL[mode]) ctx.resume();
  });

  GL.music = {
    setMode(m) { if (m === mode) return; mode = m; apply(); },
    isOn: () => on,
    toggle() {
      on = !on;
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      unlocked = true; apply();
      return on;
    }
  };
})();
