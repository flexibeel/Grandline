// Stammcrew-Duell: die eigene Stammcrew kämpft gegen die gespeicherte Stammcrew eines anderen Spielers.
// Läuft komplett lokal mit dem normalen Kampfsystem. Die gegnerische Crew bekommt ihre Synergien
// und Ultis wie eine echte Crew (pvp-Markierung).
window.GL = window.GL || {};

(function () {
  // Duell-Taktik: ein Tipp vor dem Kampf. Sturm schlägt List, List schlägt Mauer, Mauer schlägt Sturm.
  const TACTICS = {
    sturm: { icon: '⚔', beats: 'list' },
    mauer: { icon: '🛡', beats: 'sturm' },
    list:  { icon: '🎭', beats: 'mauer' }
  };
  const tacOf = t => (typeof t === 'string' && Object.prototype.hasOwnProperty.call(TACTICS, t)) ? t : null;
  // Zusammenhalt-Eigenschaften (Vertraut 6/8/10), je Rolle eine kleine feste Gabe
  const TRAITS = {
    brecher:  { icon: '🪵', k: 'armor', v: [0, 1, 2, 3] },
    kaempfer: { icon: '🤝', k: 'crit',  v: [0, 0.04, 0.06, 0.08] },
    helfer:   { icon: '🩹', k: 'regen', v: [0, 1, 2, 3] }
  };
  function traitTier(bond) { const b = Math.max(0, Math.min(10, Math.round(+bond || 0))); return b >= 10 ? 3 : b >= 8 ? 2 : b >= 6 ? 1 : 0; }
  function traitOf(role, bond) {
    const T = Object.prototype.hasOwnProperty.call(TRAITS, role) ? TRAITS[role] : null, t = traitTier(bond);
    return T && t ? { role, tier: t, icon: T.icon, k: T.k, v: T.v[t] } : null;
  }
  function prep(list, pvp, tac, edge) {
    tac = tacOf(tac);
    return (list || []).map(r => {
      const x = Object.assign({}, r);
      // Ausrüstung zählt im Duell voll (seit 29b, vorher halbiert). Fair bleibt es über die Gegnersuche
      // nach Kampfkraft-Band (GL.config.duel). Zusammenhalt zählt höchstens +5 Stufen.
      if (+r.bond > 5 && +r.bond <= 10) { const cut = Math.round(+r.bond) - 5; x.lvl = (r.lvl || 1) - cut; x.max = Math.max(1, x.max - cut * 3); x.atk = Math.max(1, x.atk - Math.floor(cut * 0.45)); }
      if (r.gb) { x.gb = {}; Object.keys(r.gb).forEach(k => { const v = r.gb[k]; x.gb[k] = typeof v === 'number' ? Math.max(0, Math.min(1e4, v)) : v; }); }   // Fremddaten: nie negativ
      // Zusammenhalt-Eigenschaft (nach dem Ausgleich, wird nicht halbiert)
      const tr = traitOf(r.role, r.bond);
      if (tr) { x.gb = Object.assign({}, x.gb || {}); x.gb[tr.k] = (+x.gb[tr.k] || 0) + tr.v; }
      // Taktik
      if (tac === 'sturm') { x.atk = Math.round(x.atk * 1.08); x.gb = Object.assign({}, x.gb || {}); x.gb.armor = (+x.gb.armor || 0) - 1; }
      else if (tac === 'mauer') { x.max = Math.round(x.max * (r.role === 'brecher' ? 1.18 : 1.1)); x.atk = Math.max(1, Math.round(x.atk * 0.96)); }
      else if (tac === 'list') { x.max = Math.max(1, Math.round(x.max * 0.94)); x.gb = Object.assign({}, x.gb || {}); x.gb.dodge = (+x.gb.dodge || 0) + 0.05; x.gb.crit = (+x.gb.crit || 0) + 0.05; }
      else { x.atk = Math.round(x.atk * 1.04); x.max = Math.round(x.max * 1.03); }   // ausgewogen: wer nichts wählt, verliert nichts
      if (edge) x.atk = Math.round(x.atk * (1 + ((GL.config.duel || {}).counter != null ? GL.config.duel.counter : 0.15)));   // Taktik-Konter (Kämpfe offen: 15 % statt 6 %)
      x.hp = x.max;
      if (r.id === 'self') {
        // eigener Pirat: Fähigkeit "Wille des Kapitäns" mitnehmen, Name aus dem Eintrag
        x.ability = 'rally'; x.power = r.rally || 1;
        if (pvp) x.id = 'rival';
      }
      if (pvp) x.pvp = true;
      return x;
    });
  }

  // mine/theirs: Listen aus GL.meta.squadRefs. seed: Zahl. Ergebnis: { win, events, me, foe, mvp, dealt }
  // opt (optional): { me: 'sturm'|'mauer'|'list', foe: … } – fehlt sie, ist alles neutral
  function fight(mine, theirs, seed, opt) {
    const tm = tacOf(opt && opt.me), tf = tacOf(opt && opt.foe);
    const me = prep(mine, false, tm, !!(tm && tf && TACTICS[tm].beats === tf));
    const foe = prep(theirs, true, tf, !!(tm && tf && TACTICS[tf].beats === tm));
    // "self" der eigenen Crew nutzt die eingetragene Figur (Name/Aussehen stimmen schon)
    const run = { rng: (seed >>> 0) || 1, crew: me, relics: [], arts: [], items: [], crit: 0, bounties: 0,
      captain: me[0] && me[0].id, mod: { atk: 0, hp: 0, spd: 0 } };
    const cmds = opt && Array.isArray(opt.cmds) ? opt.cmds.filter(c => c && ((['cheer', 'food', 'dice'].includes(c.cmd) && Number.isInteger(c.at)) || (c.cmd === 'tip' && Number.isInteger(c.n)))).slice(0, 40) : [];
    const res = GL.battle.simulate(run, me, foe, 'duel', { duel: true, cmds, tipAll: !!(opt && opt.tipAll) });
    // Schaden pro Figur zählen (für MVP und Bericht)
    const dealt = { crew: me.map(() => 0), enemy: foe.map(() => 0) };
    res.events.forEach(e => {
      if (e.k === 'hit' && e.dmg > 0) dealt[e.side][e.from] += e.dmg;
      if (e.k === 'dmg' && e.by && e.list) {
        const side = e.side === 'crew' ? 'enemy' : 'crew';
        const team = side === 'crew' ? me : foe;
        const i = team.findIndex(u => u.id === e.by || (e.by === 'rival' && u.id === 'rival'));
        if (i >= 0) dealt[side][i] += e.list.reduce((s, x) => s + x.dmg, 0);
      }
    });
    const mvp = dealt.crew.indexOf(Math.max(...dealt.crew));
    const out = { win: res.win, events: res.events, me, foe, dealt, mvp, tac: { me: tm, foe: tf } };
    out.key = keyMoment(out);
    return out;
  }

  // Kämpfe offen: Was hat das Duell entschieden? Eine Zeile (DE/EN) und wer im Bild steht.
  // Reihenfolge: Letzter steht der Siegerseite, Ulti-Duell der Siegerseite, Taktik-Konter, sonst wer am meisten austeilte.
  // Ergebnis: { m: 'last'|'clash'|'tac'|'mvp'|'fight', side: 'crew'|'enemy', i, de, en, tipped }
  const TAC_N = {   // [Nominativ dein, Akkusativ dein, Nominativ ihr, Akkusativ ihr, englisch]
    sturm: ['Dein Sturm', 'deinen Sturm', 'Ihr Sturm', 'ihren Sturm', 'Storm'],
    mauer: ['Deine Mauer', 'deine Mauer', 'Ihre Mauer', 'ihre Mauer', 'Wall'],
    list:  ['Deine List', 'deine List', 'Ihre List', 'ihre List', 'Cunning']
  };
  const TAC_V = { sturm: ['überrannt', 'overran'], list: ['ausgetrickst', 'outwitted'], mauer: ['auflaufen lassen', 'stopped cold'] };
  function keyMoment(r) {
    const nm = (side, i) => { const u = (side === 'crew' ? r.me : r.foe)[i]; return String((u && u.name) || '?').split(' ')[0]; };
    const ends = r.events.filter(e => e.k === 'moment' && e.ph === 'end');
    const won = r.win ? 'crew' : 'enemy', lost = r.win ? 'enemy' : 'crew';
    const last = ends.find(e => e.m === 'last' && e.side === won);
    const clash = ends.slice().reverse().find(e => e.m === 'clash' && e.win === won);
    if (last) {
      const n = nm(won, last.to), t = won === 'crew' && last.tipped > 0;
      return r.win ? { m: 'last', side: won, i: last.to, tipped: t, de: `Gewonnen, weil ${n} einfach nicht umfallen wollte.`, en: `Won because ${n} simply refused to fall over.` }
        : { m: 'last', side: won, i: last.to, de: `Verloren: ${n} wollte einfach nicht umfallen.`, en: `Lost: ${n} simply refused to fall over.` };
    }
    if (clash) {
      const a = nm('crew', clash.a), b = nm('enemy', clash.b);
      return r.win ? { m: 'clash', side: 'crew', i: clash.a, tipped: clash.tipped > 0, de: `Gewonnen: Im Ulti-Duell war ${a} schneller als ${b}.`, en: `Won: ${a} beat ${b} to the punch in the ult clash.` }
        : { m: 'clash', side: 'enemy', i: clash.b, de: `Verloren: Im Ulti-Duell war ${b} schneller als ${a}.`, en: `Lost: ${b} beat ${a} to the punch in the ult clash.` };
    }
    const tm = r.tac.me, tf = r.tac.foe;
    if (tm && tf && r.win && TACTICS[tm].beats === tf) return { m: 'tac', side: 'crew', i: r.mvp, de: `Gewonnen: ${TAC_N[tm][0]} hat ${TAC_N[tf][3]} ${TAC_V[tm][0]}.`, en: `Won: your ${TAC_N[tm][4]} ${TAC_V[tm][1]} their ${TAC_N[tf][4]}.` };
    if (tm && tf && !r.win && TACTICS[tf].beats === tm) {
      const fi = r.dealt.enemy.indexOf(Math.max(...r.dealt.enemy));
      return { m: 'tac', side: 'enemy', i: fi, de: `Verloren: ${TAC_N[tm][1].replace(/^d/, 'D')} hat ${TAC_N[tf][2].toLowerCase()} ${TAC_V[tf][0]}.`, en: `Lost: their ${TAC_N[tf][4]} ${TAC_V[tf][1]} your ${TAC_N[tm][4]}.` };
    }
    if (r.win) return { m: 'mvp', side: 'crew', i: r.mvp, de: `Gewonnen, vor allem dank ${nm('crew', r.mvp)} (${r.dealt.crew[r.mvp]} Schaden).`, en: `Won, mostly thanks to ${nm('crew', r.mvp)} (${r.dealt.crew[r.mvp]} damage).` };
    const mine = ends.find(e => e.m === 'last' && e.side === 'crew');
    if (mine) return { m: 'fight', side: 'crew', i: mine.to, de: `Verloren, obwohl ${nm('crew', mine.to)} sich bis zuletzt gewehrt hat.`, en: `Lost, even though ${nm('crew', mine.to)} fought to the very end.` };
    const fi = r.dealt.enemy.indexOf(Math.max(...r.dealt.enemy));
    return { m: 'mvp', side: 'enemy', i: fi, de: `Verloren: ${nm('enemy', fi)} war heute nicht zu bremsen.`, en: `Lost: ${nm('enemy', fi)} was unstoppable today.` };
  }

  // Gegnersuche nach Kampfkraft-Band: nur Crews zwischen (1 - band) und (1 + band) der eigenen Kampfkraft.
  // rows: Ranglisten-Zeilen (schon ohne einen selbst). Ergebnis: bis zu 5, die nächsten zuerst.
  function inBand(rows, mine, myRating) {
    const D = (GL.config && GL.config.duel) || {}, band = D.band == null ? 0.25 : D.band;
    const lo = mine * (1 - band), hi = mine * (1 + band);
    return (rows || []).map(x => ({ x, p: GL.meta.squadPower(x.squad) }))   // immer neu rechnen: gespeicherte Zahlen können von der alten Formel sein
      .filter(o => o.p >= lo && o.p <= hi)
      .map(o => ({ x: o.x, d: Math.abs(o.p - mine) + Math.abs((o.x.squadRating || 1000) - myRating) / 4 }))
      .sort((p, q) => p.d - q.d).slice(0, 5);
  }
  // Übungscrew der Kronwacht, wenn niemand im Band ist: so viele Figuren wie du, auf deiner Stufe,
  // Werte so gestreckt, dass ihre Kampfkraft trainer × deiner ist (GL.config.duel.trainer; 1.1 = gemessen etwa 50 % Siegchance).
  // rnd: Zufallsfunktion (fürs Messen festlegbar). Ergebnis: Liste wie squadRefs, mit .tactic.
  function trainer(lvl, n, mine, rnd) {
    rnd = rnd || Math.random;
    const D = (GL.config && GL.config.duel) || {}, aim = mine * (D.trainer == null ? 1 : D.trainer);
    const pool = ['koby', 'tashigi', 'hina', 'garp', 'smoker'].slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const squad = pool.slice(0, Math.max(1, Math.min(5, n))).map(id => {
      const d = GL.data.crew.find(c => c.id === id); const max = d.hp + (lvl - 1) * 3;
      return { id, name: d.name, type: d.type, role: d.role, faction: d.faction, lvl, hp: max, max, atk: d.atk + Math.floor((lvl - 1) * 0.45), spd: d.spd };
    });
    // Leben und Angriff strecken (Tempo bleibt), nach oben wie nach unten, aber nie unter die Hälfte.
    // Die Kampfkraft ist nicht linear (geeichte Formel), deshalb wird der Faktor gesucht.
    const at = f => squad.map(r => Object.assign({}, r, { max: Math.max(1, Math.round(r.max * f)), atk: Math.max(1, Math.round(r.atk * f)) }));
    let lo = 0.5, hi = 20;
    if (GL.meta.squadPower(at(lo)) >= aim) hi = lo;
    else for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (GL.meta.squadPower(at(m)) < aim) lo = m; else hi = m; }
    at(hi).forEach((x, i) => { squad[i].max = squad[i].hp = x.max; squad[i].atk = x.atk; });
    // Die Kronwacht hat auch eine Taktik (meistens). Sie steht in der Vorschau, damit man kontern kann.
    squad.tactic = ['sturm', 'mauer', 'list', null][Math.floor(rnd() * 4)];
    return squad;
  }

  // ---------- Duell-Beute (Häppchen 3) ----------
  // profile.dloot = { n: offene Schlösser, h: halbe Abwehr (0/1), d: Tag, beat: [heute geschlagene Crews], prac: Übungssiege heute, def: Schlösser aus Abwehr heute }
  // Läuft nur im Hauptquartier (nicht im Run-Replay), daher Math.random wie bei GL.cgear.roll.
  const LC = () => (GL.config && GL.config.dloot) || { locks: 3, prac: 3, def: 2, loss: 2, shards: [2, 3, 4, 6], rar: {} };
  function chest(profile) {
    const L = profile.dloot = profile.dloot && typeof profile.dloot === 'object' ? profile.dloot : {};
    L.n = Math.max(0, Math.min(LC().locks - 1, +L.n || 0)); L.h = L.h ? 1 : 0;
    const day = GL.meta.dayKey();
    if (L.d !== day) { L.d = day; L.beat = []; L.prac = 0; L.def = 0; }
    if (!Array.isArray(L.beat)) L.beat = [];
    return L;
  }
  function lootLeague(profile) {
    const lg = GL.meta.league(profile.squadRating);
    return { lg, i: Math.max(0, GL.meta.leagues.indexOf(lg)), w: (LC().rar || {})[lg.id] || [70, 27, 3, 0] };
  }
  // Kiste öffnen: ein Teil nach Liga (Qualität wie Beute aus dem Meer mit dem Index der Liga) plus Meersplitter
  function openChest(profile) {
    const { lg, i, w } = lootLeague(profile);
    let x = Math.random() * w.reduce((a, b) => a + b, 0), r = 0;
    for (; r < w.length - 1; r++) { x -= w[r]; if (x < 0) break; }
    const it = GL.cgear.roll({ r, sea: Math.max(0, i - 1) });
    it.f.duel = lg.name;   // Herkunft „Duell-Kiste (Silber-Liga)“
    const B = GL.cgear.bag(profile); B.push(it);
    const max = GL.data.crewGear.bagMax || 40;
    while (B.length > max) {   // Tasche voll: wie bei der Fahrt-Beute wird das schwächste freie Teil zerlegt
      const free = B.filter(g => g.uid !== it.uid && !GL.cgear.wornBy(profile, g.uid)).sort((a, b) => a.r - b.r || GL.cgear.power(a) - GL.cgear.power(b));
      if (!free.length) break;
      GL.cgear.scrap(profile, free[0].uid);
    }
    const sh = LC().shards[r] || 0;
    profile.shards = (profile.shards || 0) + sh;
    profile.gearNew = (profile.gearNew || []).concat(it.uid);
    return { it, shards: sh };
  }
  function addLock(profile, L) {
    L.n++;
    if (L.n < LC().locks) return null;
    L.n = 0;
    return openChest(profile);
  }
  // Nach einem Duell (Endergebnis). row = Gegner-Zeile, mine/theirs = Kampfkraft beider Crews.
  // Ergebnis: { lock, why, n, open, shards }  why: 'npc' (Übungssiege voll), 'again' (heute schon geschlagen), 'weak' (unter dem Band)
  function lootDuel(profile, row, win, mine, theirs) {
    const L = chest(profile), C = LC();
    if (!win) { profile.shards = (profile.shards || 0) + (C.loss || 0); return { lock: false, n: L.n, shards: C.loss || 0 }; }
    const band = (GL.config.duel && GL.config.duel.band) || 0.25;
    let why = null;
    if (row.npc) { if (L.prac >= C.prac) why = 'npc'; }
    else if (L.beat.includes(row.id)) why = 'again';
    else if (theirs < mine * (1 - band)) why = 'weak';
    if (why) return { lock: false, why, n: L.n };
    if (row.npc) L.prac++; else { L.beat.push(row.id); if (L.beat.length > 60) L.beat.shift(); }
    const o = addLock(profile, L);
    return { lock: true, n: o ? C.locks : L.n, open: o && o.it, shards: o ? o.shards : 0 };
  }
  // Abgewehrte Angriffe seit dem letzten Besuch: zwei = ein Schloss, höchstens C.def Schlösser am Tag
  function lootDefense(profile, held) {
    const L = chest(profile), C = LC(), out = { locks: 0, open: [] };
    let half = L.h + Math.max(0, held | 0);
    while (half >= 2 && L.def < C.def) {
      half -= 2; L.def++; out.locks++;
      const o = addLock(profile, L); if (o) out.open.push(o.it);
    }
    L.h = Math.min(1, half);
    return out;
  }

  GL.squad = { fight, TACTICS, tacOf, traitOf, traitTier, inBand, trainer, prep: list => prep(list, false, null, false), chest, lootLeague, lootDuel, lootDefense };
})();
