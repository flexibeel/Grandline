// Geräusche: weiche, leise Pixel-Klänge, im Browser erzeugt (keine Dateien).
// Hängen direkt an den Kampf-Ereignissen, laufen also immer synchron, auch bei hohem Tempo.
// Bei hohem Tempo werden Klänge kürzer und seltener, damit nichts rattert.
window.GL = window.GL || {};

(function () {
  const KEY = 'grandline.sfx';
  let on = true;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (e) { /* egal */ }
  let ctx = null, out = null;
  const VOL = 0.32;
  const last = {};

  function ready() {
    if (!on) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      out = ctx.createGain(); out.gain.value = VOL;
      // Sanft abrunden: Tiefpass, damit nichts schrill klingt
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4;
      out.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  // Ein Ton: Frequenz (von -> bis), Dauer, Wellenform, Lautstärke, Startverzögerung
  function tone(f0, f1, dur, type, vol, at) {
    const c = ready(); if (!c) return;
    const t = c.currentTime + (at || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // Kurzes, gefiltertes Rauschen (für Treffer)
  let noiseBuf = null;
  function noise(dur, freq, vol, at) {
    const c = ready(); if (!c) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = c.currentTime + (at || 0);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq || 900; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(out);
    s.start(t); s.stop(t + dur + 0.02);
  }
  const notes = (list, step, type, vol) => list.forEach((f, i) => tone(f, f, step * 1.6, type || 'triangle', vol || 0.18, i * step));

  // Klänge. sp = Tempo-Faktor (1 normal, 4 sehr schnell): kürzer und leiser bei Tempo
  const S = {
    hit: sp => { const k = 1 / Math.sqrt(sp); tone(170, 70, 0.09 * k, 'sine', 0.32); noise(0.05 * k, 700, 0.10); },
    crit: sp => { const k = 1 / Math.sqrt(sp); tone(190, 60, 0.12 * k, 'sine', 0.36); noise(0.07 * k, 1400, 0.14); tone(880, 1180, 0.08 * k, 'triangle', 0.10, 0.02); },
    miss: () => tone(520, 380, 0.07, 'sine', 0.08),
    block: () => tone(300, 300, 0.06, 'square', 0.05),
    ko: () => { tone(330, 110, 0.22, 'triangle', 0.16); },
    heal: () => notes([660, 880], 0.06, 'sine', 0.10),
    ability: () => tone(990, 990, 0.05, 'triangle', 0.08),
    status: () => tone(420, 300, 0.1, 'triangle', 0.08),
    ult: () => { notes([523, 659, 784, 1046], 0.055, 'triangle', 0.14); noise(0.25, 2400, 0.04, 0.05); },
    revive: () => notes([392, 523, 659, 784, 1046], 0.08, 'sine', 0.16),
    rage: () => { tone(110, 80, 0.4, 'sawtooth', 0.06); tone(220, 160, 0.3, 'triangle', 0.08); },
    win: () => notes([523, 659, 784, 1046], 0.11, 'triangle', 0.16),
    lose: () => notes([392, 330, 262], 0.16, 'sine', 0.13),
    coin: () => { tone(1320, 1320, 0.05, 'square', 0.04); tone(1760, 1760, 0.09, 'square', 0.04, 0.05); },
    level: () => notes([523, 784, 1046, 1318], 0.07, 'triangle', 0.14),
    tap: () => tone(700, 600, 0.025, 'sine', 0.05),
    found: () => notes([784, 988, 1175, 1568], 0.09, 'sine', 0.14)
  };
  // Mindestabstand je Klang, damit bei Tempo nichts rattert (ms)
  const GAP = { hit: 55, crit: 60, ability: 120, status: 120, heal: 90, miss: 80, block: 80, ko: 90, tap: 40, coin: 80 };

  function play(kind, speed) {
    if (!on || !S[kind]) return;
    const now = performance.now(), sp = Math.max(1, speed || 1);
    const gap = (GAP[kind] || 0) * (sp >= 3 ? 2 : 1);
    if (gap && last[kind] && now - last[kind] < gap) return;
    last[kind] = now;
    try { S[kind](sp); } catch (e) { /* egal */ }
  }

  // Kampf-Ereignis -> Klang
  function battle(ev, speed) {
    if (!on || !ev) return;
    switch (ev.k) {
      case 'hit': play(ev.miss ? 'miss' : ev.blocked ? 'block' : ev.crit || ev.heavy ? 'crit' : 'hit', speed); if (ev.hp === 0 && ev.dmg > 0) play('ko', speed); break;
      case 'dmg': play('hit', speed); if ((ev.list || []).some(x => x.hp === 0)) play('ko', speed); break;
      case 'heal': play('heal', speed); break;
      case 'status': play('status', speed); break;
      case 'ult': case 'special': play('ult', speed); break;
      case 'revive': play('revive', speed); break;
      case 'rage': case 'will': play('rage', speed); break;
      case 'windup': play('status', speed); break;
      default: break;
    }
  }

  function toggle() {
    on = !on;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* egal */ }
    if (on) { ready(); play('tap'); } else if (ctx) ctx.suspend().catch(() => {});
    return on;
  }
  // iOS: Ton erst nach einer Berührung erlaubt
  const unlock = () => { if (on) ready(); };
  ['pointerdown', 'touchend', 'keydown'].forEach(e => window.addEventListener(e, unlock, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (ctx) { if (document.hidden) ctx.suspend().catch(() => {}); else if (on) ctx.resume().catch(() => {}); } });

  // Stimmen wie in Stardew: kurze, weiche Silben-Töne, jede Figur mit eigener Tonlage und Klangfarbe
  const VOICES = {
    self: [330, 'triangle'], ruffy: [392, 'square'], zorro: [196, 'triangle'], nami: [523, 'sine'], lysop: [440, 'square'],
    sanji: [262, 'sine'], chopper: [659, 'triangle'], robin: [294, 'sine'], franky: [175, 'square'], brook: [247, 'sine'], kalle: [784, 'square']
  };
  let lastVoice = 0;
  function voice(who, ch) {
    const c = ready(); if (!c) return;
    const now = c.currentTime;
    if (now - lastVoice < 0.055) return;   // nicht bei jedem Buchstaben, sonst rattert es
    lastVoice = now;
    const v = VOICES[who] || VOICES.self;
    const code = String(ch || 'a').toLowerCase().charCodeAt(0) || 97;
    const steps = [0, 2, 4, 5, 7, 9];
    const f = v[0] * Math.pow(2, steps[code % steps.length] / 12);
    tone(f, f * 0.94, 0.07, v[1], v[1] === 'square' ? 0.05 : 0.09);
  }
  // Kleine Klang-Akzente für Story-Szenen
  function sting(name) {
    if (!ready()) return;
    if (name === 'boing') { tone(220, 520, 0.18, 'sine', 0.18); tone(520, 300, 0.12, 'sine', 0.1, 0.16); }
    else if (name === 'shake') { tone(110, 60, 0.22, 'triangle', 0.25); tone(90, 50, 0.18, 'square', 0.05, 0.05); }
    else if (name === 'dramatic') { [0, 0.07, 0.14, 0.21, 0.28].forEach((t, k) => tone(98 + k * 3, 90, 0.07, 'triangle', 0.12 + k * 0.02, t)); tone(147, 140, 0.4, 'square', 0.06, 0.36); }
    else if (name === 'flash' || name === 'sparkle') { [0, 0.06, 0.12].forEach((t, k) => tone(1047 + k * 260, 1200 + k * 260, 0.12, 'sine', 0.08, t)); }
    else if (name === 'zoom') { tone(300, 700, 0.16, 'sine', 0.07); }
    else if (name === 'jump') { [0, 0.08, 0.16].forEach((t, k) => tone(440 + k * 90, 620 + k * 90, 0.07, 'square', 0.04, t)); }
    // 9e C: Ton je Kampfart (Felix' Wahl aus der Hörprobe tools/kampfton-probe.html). Normale Kämpfe bleiben still.
    else if (name === 'kind-elite') {   // E3 „Zwei Schläge“ (~0,8 s): zweimal dumpf, dann ein hoher Warnton
      tone(196, 120, 0.16, 'triangle', 0.24, 0); tone(196, 120, 0.16, 'triangle', 0.24, 0.2); tone(784, 784, 0.25, 'square', 0.04, 0.4);
    } else if (name === 'kind-boss') {   // B1 „Dumpfe Trommel“ (~1,8 s): drei tiefe Schläge, jeder lauter, dann Grollen
      [0, 0.3, 0.6].forEach((t, k) => { tone(120, 45, 0.28, 'sine', 0.34 + k * 0.04, t); noise(0.08, 180, 0.12, t); });
      tone(65, 60, 0.8, 'triangle', 0.12, 0.9);
    } else if (name === 'kind-raid') {   // R2 „Kriegshorn und Schlag“: der Boom fällt auf den Schlag aufs Bild (bs-slam startet 0,62 s nach dem Einblenden)
      tone(98, 196, 0.62, 'sawtooth', 0.07, 0); tone(147, 294, 0.62, 'square', 0.03, 0); tone(98, 98, 0.4, 'sawtooth', 0.07, 0.62);
      tone(90, 35, 0.6, 'sine', 0.38, 0.62); noise(0.25, 150, 0.2, 0.62);
    } else if (name === 'kind-duell') {   // D2 „Trommelwirbel“ (~1 s): kurzer Wirbel, der anschwillt, dann ein Schlag
      for (let k = 0; k < 10; k++) noise(0.04, 400, 0.04 + k * 0.012, k * 0.055);
      tone(150, 60, 0.2, 'sine', 0.34, 0.6); noise(0.1, 900, 0.15, 0.6);
    }
  }
  GL.sfx = { play, battle, toggle, voice, sting, isOn: () => on };
})();
