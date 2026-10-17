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
  const VOL = { title: 0.55, hq: 0, run: 0, off: 0 };   // nur im Startbildschirm

  const N = n => 440 * Math.pow(2, (n - 69) / 12);       // MIDI-Nummer -> Hz
  const nm = s => { const m = /^([A-G])(#?)(\d)$/.exec(s); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0); };

  // Akkorde (je ein Takt) und Melodie (8 Achtel pro Takt, '.' = Pause)
  const CHORDS = [['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'],
                  ['C3', 'E3', 'G3'], ['E2', 'G2', 'B2'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3']];
  const MEL = [
    'E5 . G5 . A5 G5 E5 .', 'C5 . E5 . D5 . C5 .', 'A4 . C5 . F5 E5 D5 .', 'D5 . E5 D5 B4 . G4 .',
    'E5 . G5 . C6 . B5 A5', 'G5 . E5 . D5 E5 G5 .', 'A5 G5 F5 . E5 . D5 .', 'D5 . E5 . C5 . . .'
  ].map(b => b.split(' '));
  // B-Teil: Flöte über F – G – Em – Am, F – G – C – C (der „Heimweg am Abend“)
  const CHORDS_B = [['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'], ['E2', 'G2', 'B2'], ['A2', 'C3', 'E3'],
                    ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'], ['C3', 'E3', 'G3'], ['C3', 'E3', 'G3']];
  const FLUTE = [ // [Takt, Achtel, Ton, Länge in Achteln]
    [0, 0, 'A5', 3], [0, 3, 'G5', 1], [0, 4, 'F5', 4], [1, 0, 'G5', 3], [1, 3, 'A5', 1], [1, 4, 'B5', 4],
    [2, 0, 'G5', 6], [2, 6, 'E5', 2], [3, 0, 'C5', 4], [3, 4, 'E5', 4],
    [4, 0, 'F5', 3], [4, 3, 'E5', 1], [4, 4, 'D5', 4], [5, 0, 'E5', 2], [5, 2, 'F5', 2], [5, 4, 'D5', 4],
    [6, 0, 'C5', 8], [7, 0, 'E5', 2], [7, 2, 'G5', 2], [7, 4, 'C6', 4]
  ];
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
    // Sanfter Begrenzer: keine Spitzen, auch auf Handy-Lautsprechern angenehm
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
    master.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
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
  // Weiche Flöte: Sinus mit langsamem Anblasen und leichtem Vibrato
  function flute(t, f, dur, v) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f * 2; g2.gain.value = 0.08;
    lfo.frequency.value = 5; lg.gain.value = f * 0.006; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.09); g.gain.setValueAtTime(v * 0.85, t + dur * 0.7); g.gain.linearRampToValueAtTime(0, t + dur + 0.12);
    o.connect(g); o2.connect(g2); g2.connect(g); out(g, 0.75);
    [o, o2, lfo].forEach(x => { x.start(t); x.stop(t + dur + 0.2); });
  }
  // Hafen-Rauschen fürs Titelbild: gefiltertes Rauschen, das langsam an- und abschwillt wie Wellen
  let waves = null;
  function startWaves() {
    if (waves) return;
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
    const g = ctx.createGain(); g.gain.value = 0;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.11; lg.gain.value = 0.05;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(f); f.connect(g); g.connect(master); src.start(); lfo.start();
    waves = { g };
  }
  function wavesLevel(v) { if (waves) { const t = ctx.currentTime; waves.g.gain.cancelScheduledValues(t); waves.g.gain.linearRampToValueAtTime(v, t + 2); } }
  function bass(t, n, v) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = N(nm(n) - 12);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g); out(g, 1); o.start(t); o.stop(t + 1.2);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.25) {
      // Form: A (Spieluhr) – A' (ruhig) – B (Flöte) – A, dann von vorn. 8 Takte pro Teil.
      const bar = Math.floor(step / 8) % 8, pos = step % 8, part = Math.floor(step / 64) % 4;
      const isB = part === 2;
      const ch = (isB ? CHORDS_B : CHORDS)[bar], t = nextTime, calm = mode !== 'title';
      const pass = part === 1 ? 1 : 0;
      if (isB) {
        if (pos === 0) { pad(t, ch, EIGHTH * 8, calm ? 0.045 : 0.055); bass(t, ch[0], 0.2); }
        if (pos === 4) bass(t, ch[2], 0.12);
        if (pos % 2 === 1) pluck(t, N(nm(ch[(pos >> 1) % 3]) + 12), 0.045);
        FLUTE.filter(x => x[0] === bar && x[1] === pos).forEach(x => flute(t, N(nm(x[2])), x[3] * EIGHTH, calm ? 0.06 : 0.085));
        nextTime += EIGHTH; step++;
        continue;
      }
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
    if (!want) {
      fadeTo(0, 0.8);
      clearTimeout(apply.t); apply.t = setTimeout(() => { if (ctx && !(on && unlocked && VOL[mode])) ctx.suspend(); if (silentEl && !(on && VOL[mode])) silentEl.pause(); }, 1200);
      return;
    }
    if (silentEl && silentEl.paused) { const p = silentEl.play(); if (p && p.catch) p.catch(() => {}); }
    if (!init()) return;
    run(); fadeTo(want, 2.2);
    // Wellenrauschen entfernt (klang wie Wind)
  }

  // iPhone: Web-Audio ist bei Stummschalter sonst still. Als „Wiedergabe“ anmelden und einmal
  // ein stilles <audio> abspielen, das schaltet die Audio-Sitzung auf Medien-Wiedergabe.
  let silentDone = false, silentEl = null;
  function silentKick() {
    if (silentDone) return; silentDone = true;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try {
      const sr = 8000, n = 800, b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
      const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      const a = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' })));
      a.setAttribute('playsinline', ''); a.loop = true; a.volume = 0.01; silentEl = a;
      const p = a.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  // Jede Berührung: Audio freischalten bzw. wieder aufwecken (Browser erlauben Ton nur nach einer Geste)
  const unlock = () => {
    if (on && VOL[mode]) silentKick();
    if (!unlocked) { unlocked = true; apply(); }
    else if (ctx && ctx.state !== 'running' && on && VOL[mode]) ctx.resume();
  };
  ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));
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
      unlocked = true; if (on) silentKick(); apply();
      if (on && ctx && ctx.state !== 'running') ctx.resume();
      return on;
    }
  };
})();
