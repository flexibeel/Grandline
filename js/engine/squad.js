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
      // Duell-Ausgleich: Ausrüstung zählt nur zur Hälfte, Zusammenhalt höchstens +5 Stufen.
      // So entscheidet eher die Aufstellung als die Schatzkammer.
      const g = r.gw;
      const nn = v => Math.max(0, Math.min(1e5, +v || 0));   // Fremddaten: nie negativ
      if (g && typeof g === 'object') { x.max = Math.max(1, r.max - Math.floor(nn(g.hp) / 2)); x.atk = Math.max(1, r.atk - Math.floor(nn(g.atk) / 2)); x.spd = r.spd - Math.floor(nn(g.spd) / 2); }
      if (+r.bond > 5 && +r.bond <= 10) { const cut = Math.round(+r.bond) - 5; x.lvl = (r.lvl || 1) - cut; x.max = Math.max(1, x.max - cut * 3); x.atk = Math.max(1, x.atk - Math.floor(cut * 0.45)); }
      if (r.gb) { x.gb = {}; Object.keys(r.gb).forEach(k => { x.gb[k] = typeof r.gb[k] === 'number' ? r.gb[k] / 2 : r.gb[k]; }); }
      // Zusammenhalt-Eigenschaft (nach dem Ausgleich, wird nicht halbiert)
      const tr = traitOf(r.role, r.bond);
      if (tr) { x.gb = Object.assign({}, x.gb || {}); x.gb[tr.k] = (+x.gb[tr.k] || 0) + tr.v; }
      // Taktik
      if (tac === 'sturm') { x.atk = Math.round(x.atk * 1.08); x.gb = Object.assign({}, x.gb || {}); x.gb.armor = (+x.gb.armor || 0) - 1; }
      else if (tac === 'mauer') { x.max = Math.round(x.max * (r.role === 'brecher' ? 1.18 : 1.1)); x.atk = Math.max(1, Math.round(x.atk * 0.96)); }
      else if (tac === 'list') { x.max = Math.max(1, Math.round(x.max * 0.94)); x.gb = Object.assign({}, x.gb || {}); x.gb.dodge = (+x.gb.dodge || 0) + 0.05; x.gb.crit = (+x.gb.crit || 0) + 0.05; }
      else { x.atk = Math.round(x.atk * 1.04); x.max = Math.round(x.max * 1.03); }   // ausgewogen: wer nichts wählt, verliert nichts
      if (edge) x.atk = Math.round(x.atk * 1.06);
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
    const res = GL.battle.simulate(run, me, foe, 'duel', { duel: true, cmds: opt && Array.isArray(opt.cmds) ? opt.cmds.filter(c => c && ['cheer', 'food', 'dice'].includes(c.cmd) && Number.isInteger(c.at)).slice(0, 30) : [] });
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
    return { win: res.win, events: res.events, me, foe, dealt, mvp };
  }

  GL.squad = { fight, TACTICS, tacOf, traitOf, traitTier };
})();
