// Kontor im Hafen (Design-Fläche „Grand Line: Gesamtplan“, Baustein 6 und 7), Teil 1.
//   Bernstein wächst auch offline, bis das Lager voll ist. Nach jedem Run wird das Schiff entladen:
//   Kram wird zu Bernstein, Wertsachen bringen Berry, ganz selten ist eine Rarität dabei (nur Schmuck, nie Kampfwerte).
//   Bernstein frischt Landgänge auf: Wer heute schon dort war, bekommt mit 20 Bernstein noch einmal die volle Beute.
//   Regel: Das Kontor erzeugt nie Kopfgeld-Marken oder Kampfkraft. Warten bringt Steine, Spielen bringt Fortschritt.
// Alles läuft ohne Datenbank im Profil (profile.kontor). Offline-Zeit kommt von der Geräteuhr.
window.GL = window.GL || {};

(function () {
  const K = {
    maxLvl: 20,
    rate: lvl => 4 + lvl,                         // Bernstein pro Stunde
    capHours: lvl => Math.min(24, 7 + lvl),       // nach so vielen Stunden ist das Lager voll
    cost: lvl => Math.round(100 * Math.pow(1.2, lvl - 1) / 10) * 10,   // Berry für die nächste Stufe (Stufe 2: 100, Stufe 20: etwa 2.700)
    wind: { min: 10, hours: 4, mult: 1.5 },       // Frischer Wind: volle Ladung gibt 4 h lang +50 % Ertrag
    refresh: 20,                                  // Bernstein für einen aufgefrischten Landgang
    rareChance: 1 / 250, redShare: 0.1            // Raritäten: sehr selten, Rot noch zehnmal seltener
  };
  GL.data = GL.data || {};
  // Kram (häufig, wird zu Bernstein), Wertsachen (selten, Berry), Raritäten (sehr selten, Vitrine). Namen neutral, gelten in beiden Welten.
  GL.data.kontorFinds = {
    kram: [['Tauwerk', 'Rope'], ['Kerzen', 'Candles'], ['Nägel', 'Nails'], ['Segeltuch', 'Sailcloth'], ['Fass Pökelfleisch', 'Barrel of salt meat'], ['Flasche Rum', 'Bottle of rum'], ['Verband', 'Bandage']],
    wert: [['Goldene Taschenuhr', 'Golden pocket watch', 90], ['Elfenbein-Kompass', 'Ivory compass', 110], ['Perlenkette', 'Pearl necklace', 140], ['Silberner Kerzenleuchter', 'Silver candlestick', 70], ['Versiegelte Schatzkarte', 'Sealed treasure map', 160]],
    rare: [['Tiefseeriesen-Zahn', 'Deep Giant tooth', 'gold'], ['Flaschenschiff', 'Ship in a bottle', 'gold'], ['Goldener Anker', 'Golden anchor', 'gold'], ['Uralte Flagge', 'Ancient flag', 'gold'], ['Sturmglas', 'Storm glass', 'gold'], ['Herz des Meeres', 'Heart of the Sea', 'red']]
  };

  const now = () => Date.now();
  function state(profile) {
    const k = profile.kontor = profile.kontor || { lvl: 1, amber: 0, at: now(), rare: [], total: 0 };
    if (!k.at) k.at = now();
    if (!Array.isArray(k.rare)) k.rare = [];
    return k;
  }
  const cap = k => Math.round(K.rate(k.lvl) * K.capHours(k.lvl));
  // Was gerade im Lager liegt (ohne abzuholen)
  function pending(profile, t) {
    const k = state(profile), at = t || now();
    const hrs = Math.max(0, (at - k.at) / 3600000);
    const windHrs = k.windUntil ? Math.max(0, Math.min(at, k.windUntil) - k.at) / 3600000 : 0;
    const got = Math.floor(K.rate(k.lvl) * (hrs + Math.max(0, windHrs) * (K.wind.mult - 1)));
    return Math.max(0, Math.min(cap(k), got));
  }
  function collect(profile) {
    const k = state(profile), n = pending(profile);
    k.amber += n; k.total = (k.total || 0) + n; k.at = now();
    return n;
  }
  function upgrade(profile) {
    const k = state(profile);
    if (k.lvl >= K.maxLvl) return false;
    const c = K.cost(k.lvl);
    if ((profile.berry || 0) < c) return false;
    collect(profile);   // erst abholen, damit die neue Rate nicht rückwirkend zählt
    profile.berry -= c; k.lvl++;
    return true;
  }
  // Kleiner eigener Würfel aus dem Seed des Runs: gleiches Ergebnis bei gleichem Run, stört den Run-Zufall nicht
  function rngFrom(seed) {
    let s = (seed >>> 0) ^ 0x9e3779b9;
    return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Heimkehr: Schiff entladen. Einmal pro Run (über den Seed), nicht bei Wettfahrten.
  function unload(profile, run, placeName) {
    const k = state(profile);
    if (!run || run.duel || k.lastSeed === run.seed) return null;
    k.lastSeed = run.seed;
    const r = rngFrom(run.seed + (run.step || 0));
    const D = GL.data.kontorFinds;
    const steps = run.step || 0, bosses = run.bounties || 0, win = run.phase === 'win';
    const kram = Math.max(1, Math.round(steps * 1.4 + bosses * 3 + (win ? 6 : 0) + r() * 3));
    const haul = { kram, amber: kram, wert: null, berry: 0, rare: null, wind: false, names: [] };
    for (let i = 0; i < Math.min(3, Math.ceil(kram / 6)); i++) haul.names.push(D.kram[Math.floor(r() * D.kram.length)]);
    if (r() < Math.min(0.5, 0.08 + steps * 0.02 + bosses * 0.05)) {
      const w = D.wert[Math.floor(r() * D.wert.length)];
      const sea = Math.min(3, Math.floor(steps / ((GL.config && GL.config.stepsPerIsland) || 8)));
      haul.wert = [w[0], w[1]]; haul.berry = Math.round(w[2] * (1 + sea * 0.35));
      profile.berry = (profile.berry || 0) + haul.berry;
    }
    if (r() < K.rareChance * (1 + bosses * 0.5)) {
      const red = r() < K.redShare;
      const pool = D.rare.filter(x => (x[2] === 'red') === red);
      const it = pool[Math.floor(r() * pool.length)];
      const d = new Date();
      haul.rare = { id: it[0], name: it[0], en: it[1], tier: it[2], day: `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`, place: placeName || '' };
      k.rare.push(haul.rare);
    }
    collect(profile);
    k.amber += haul.amber; k.total = (k.total || 0) + haul.amber;
    if (kram >= K.wind.min) { k.windUntil = now() + K.wind.hours * 3600000; haul.wind = true; }
    k.lastHaul = haul;
    return haul;
  }
  // Landgang auffrischen: heute schon besucht -> mit Bernstein noch einmal volle Beute
  function refreshDungeon(profile, id) {
    const k = state(profile);
    const d = profile.dungeons && profile.dungeons[id];
    if (!d || k.amber < K.refresh) return false;
    k.amber -= K.refresh; d.day = null; k.refreshed = (k.refreshed || 0) + 1;
    return true;
  }
  GL.kontor = { K, state, cap, pending, collect, upgrade, unload, refreshDungeon };
})();
