// Synergien, Schätze und Fähigkeits-Werte zusammenrechnen.
// Liefert die Werte, mit denen jede Figur in einen Kampf geht.
window.GL = window.GL || {};

(function () {
  // FIGHT: Taktik-Werte der Stile (battle.js): extraTurn = Chance auf Extra-Zug, riposte = Konter-Chance,
  // armorBreak = Chance auf Rüstungsbruch (Geschwächt), killChain = Ketten-Schlag nach K.O., taunt = zieht Angriffe (2 = auch Schützen)
  const STATS = ['atk', 'spd', 'crit', 'critMult', 'armor', 'guard', 'dodge', 'dmgPct', 'bossPct', 'regen', 'extraTurn', 'riposte', 'armorBreak', 'killChain', 'taunt'];

  function applies(scope, u) {
    if (!scope || scope === 'all') return true;
    const [kind, key] = scope.split(':');
    if (kind === 'type') return u.type === key;
    if (kind === 'role') return u.role === key;
    if (kind === 'faction') return u.faction === key;
    if (kind === 'char') return u.id === key;
    return false;
  }

  // Zählt Kampfstile und Rollen in der Crew
  function counts(crew) {
    const c = { type: {}, role: {}, faction: {} };
    crew.forEach(u => {
      c.type[u.type] = (c.type[u.type] || 0) + 1;
      c.role[u.role] = (c.role[u.role] || 0) + 1;
      if (u.faction) c.faction[u.faction] = (c.faction[u.faction] || 0) + 1;
    });
    return c;
  }

  // Für die Anzeige: alle Synergien mit Anzahl und Stufen
  function status(crew) {
    const c = counts(crew);
    const out = [];
    [['type', GL.data.types], ['role', GL.data.roles], ['faction', GL.data.factions]].forEach(([kind, table]) => {
      Object.keys(table).forEach(key => {
        const n = c[kind][key] || 0;
        const tiers = table[key].tiers;
        let active = null;
        tiers.forEach(t => { if (n >= t.n) active = t; });
        const next = tiers.find(t => n < t.n) || null;
        out.push({ kind, key, name: table[key].name, count: n, active, next, tiers });
      });
    });
    return out;
  }

  // Duo-Boni: beide Figuren sind in der Crew
  function duos(crew) {
    const ids = new Set(crew.map(u => u.id));
    return (GL.data.duos || []).filter(d => ids.has(d.a) && ids.has(d.b));
  }
  // Welche Duos würde diese Figur neu bilden?
  function duosWith(crew, id) {
    const ids = new Set(crew.map(u => u.id));
    if (ids.has(id)) return [];
    return (GL.data.duos || []).filter(d => (d.a === id && ids.has(d.b)) || (d.b === id && ids.has(d.a)));
  }

  // Bündnisse: beide Banden haben gleichzeitig einen aktiven Set-Bonus
  function alliances(crew) {
    const on = new Set(status(crew).filter(s => s.kind === 'faction' && s.active).map(s => s.key));
    return (GL.data.alliances || []).filter(a => on.has(a.a) && on.has(a.b));
  }
  // Bündnisse, denen nur noch eine Bande fehlt (für Hinweise)
  function alliancesNear(crew) {
    const on = new Set(status(crew).filter(s => s.kind === 'faction' && s.active).map(s => s.key));
    return (GL.data.alliances || []).filter(a => on.has(a.a) !== on.has(a.b));
  }

  // Stil-Kombos: zwei Kampfstile/Rollen gleichzeitig aktiv
  function combos(crew) {
    const on = new Set(status(crew).filter(s => s.active && s.kind !== 'faction').map(s => s.kind + ':' + s.key));
    return (GL.data.combos || []).filter(c => on.has(c.a) && on.has(c.b));
  }
  // Kombos, denen nur noch eine Seite fehlt (für Hinweise)
  function combosNear(crew) {
    const on = new Set(status(crew).filter(s => s.active && s.kind !== 'faction').map(s => s.kind + ':' + s.key));
    return (GL.data.combos || []).filter(c => on.has(c.a) !== on.has(c.b));
  }
  // Aktive Synergie-mods (nur die höchste erreichte Stufe pro Synergie) plus Duos, Bündnisse und Stil-Kombos
  function synergyMods(crew) {
    return status(crew).filter(s => s.active).flatMap(s => s.active.mods)
      .concat(duos(crew).flatMap(d => d.mods)).concat(alliances(crew).flatMap(a => a.mods)).concat(combos(crew).flatMap(c => c.mods));
  }

  // Gefundene Schätze mit ausgewürfelten Werten
  function relicList(run) {
    return (run.relics || []).map(x => GL.loot.relic(x));
  }

  // Sonderregeln aller Schätze zusammengefasst
  function flags(run) {
    const f = { winHeal: 0, noWinHeal: false, bossStartCut: 0, vivre: 0, firstBlock: 0,
                cannon: 0, effBonus: 0, crewLimit: 0, healMult: 1 };
    // Gemütlichkeit (Skilltree): Bordkanone und Pflaster
    if (run.sk) { f.cannon += run.sk.cannon || 0; f.winHeal += run.sk.winHeal || 0; }
    // Artefakte aus der Schatzkammer
    (run.arts || []).forEach(x => {
      const art = (GL.data.artifacts || []).find(t => t.id === x.id);
      if (art && art.flag) f[art.flag] = (f[art.flag] || 0) + GL.run.artValue(art, x.lvl);
    });
    relicList(run).forEach(r => {
      const x = r.flags || {};
      if (x.winHeal) f.winHeal += x.winHeal;
      if (x.noWinHeal) f.noWinHeal = true;
      if (x.bossStartCut) f.bossStartCut += x.bossStartCut;
      if (x.vivre) f.vivre = Math.max(f.vivre, x.vivre);
      if (x.firstBlock) f.firstBlock += x.firstBlock;
      if (x.cannon) f.cannon += x.cannon;
      if (x.effBonus) f.effBonus += x.effBonus;
      if (x.crewLimit) f.crewLimit += x.crewLimit;
      if (x.healBonus) f.healMult += x.healBonus;   // additiv statt multiplikativ (vorher bis ×3,9)
      if (x.reviveWin) f.reviveWin = Math.max(f.reviveWin || 0, x.reviveWin);
    });
    // Legendäre Ausrüstung mit Sonderregel (Muskete, Weste, Schürze), nur neue Runs
    if (run.ramp) (run.crew || []).forEach(m => {
      const it = m.item && (run.items || []).find(x => x.uid === m.item);
      const lg = it && it.r === 3 && (GL.data.itemLegends || {})[it.id];
      if (lg && lg.flags) Object.keys(lg.flags).forEach(k => { f[k] = (f[k] || 0) + lg.flags[k]; });
    });
    // NEXT: Deckel für Sonderregeln
    f.healMult = Math.min(f.healMult, 2);
    f.winHeal = Math.min(f.winHeal, 0.5);
    f.bossStartCut = Math.min(f.bossStartCut, 0.35);
    f.effBonus = Math.min(f.effBonus, 0.8);
    return f;
  }

  // STATS: src = { ico, name } (nur für die Werte-Aufschlüsselung im Steckbrief, ändert nichts am Ergebnis)
  function note(u, s, src, v) {
    if (!u.trace || !src || !v) return;
    const L = u.trace[s] = u.trace[s] || [];
    const x = L.find(y => y.name === src.name);
    if (x) x.v += v; else L.push({ ico: src.ico, name: src.name, v });
  }
  function applyMod(u, m, run, src) {
    STATS.forEach(s => { if (m[s]) { u[s] += m[s]; note(u, s, src, m[s]); } });
    if (m.atkPerBounty) { u.atk += m.atkPerBounty * run.bounties; note(u, 'atk', src, m.atkPerBounty * run.bounties); }
    if (m.ignoreWeak) u.ignoreWeak = true;
  }
  // STATS: dieselben Boni wie synergyMods/relicList/abilityMods/artifactMods, aber mit Herkunft
  function labeledCrewMods(run, crewRefs) {
    const T = GL.data.types, Ro = GL.data.roles;
    const icoOf = s => s.kind === 'type' ? (T[s.key].icon || '⚔') : s.kind === 'role' ? (Ro[s.key].icon || '⚔') : '🏴';
    const out = [];
    status(crewRefs).filter(s => s.active).forEach(s => s.active.mods.forEach(m => out.push({ m, src: { ico: icoOf(s), name: s.name + ' ' + s.count } })));
    duos(crewRefs).forEach(d => d.mods.forEach(m => out.push({ m, src: { ico: '♥', name: d.name } })));
    alliances(crewRefs).forEach(a => a.mods.forEach(m => out.push({ m, src: { ico: '🤝', name: a.name } })));
    combos(crewRefs).forEach(c => c.mods.forEach(m => out.push({ m, src: { ico: c.icon || '✦', name: c.name } })));
    relicList(run).forEach(r => (r.mods || []).forEach(m => out.push({ m, src: { ico: '💎', name: r.name } })));
    const A = GL.data.abilities;
    Object.keys(A).forEach(k => (A[k].mods || []).forEach(m => out.push({ m, src: { ico: '✦', name: A[k].name } })));
    (run.arts || []).forEach(x => {
      const art = (GL.data.artifacts || []).find(t => t.id === x.id);
      if (art && art.mod) out.push({ m: { scope: art.mod.scope, [art.mod.stat]: GL.run.artValue(art, x.lvl) }, src: { ico: '🏺', name: art.name } });
    });
    return out;
  }
  // STATS: Krit mit Deckel. Was über dem Deckel liegt, wird Krit-Schaden (gilt für Treffer, Ultis und Konter gleich)
  function critOf(u, extra) {
    const C = GL.config, K = C.caps || {};
    const cap = K.crit != null ? K.crit : 0.85;
    const ch = (u.crit || 0) + (C.baseCrit || 0) + (extra || 0);
    const over = Math.max(0, ch - cap);
    return { ch: Math.min(cap, ch), over, mult: (u.critMult || C.critMult || 1.5) + over * (K.critOver || 0) };
  }

  // Kampfwerte der ausgerüsteten Artefakte
  function artifactMods(run) {
    return (run.arts || []).map(x => {
      const art = (GL.data.artifacts || []).find(t => t.id === x.id);
      if (!art || !art.mod) return null;
      return { scope: art.mod.scope, [art.mod.stat]: GL.run.artValue(art, x.lvl) };
    }).filter(Boolean);
  }

  function abilityMods() {
    const A = GL.data.abilities;
    return Object.keys(A).flatMap(k => A[k].mods || []);
  }

  function unit(side, ref, base) {
    return Object.assign({
      side, ref, id: ref.id, type: ref.type, role: ref.role, faction: ref.faction, boss: !!ref.boss, mini: !!ref.mini,
      ability: ref.ability || (GL.data.abilities[ref.id] && GL.data.abilities[ref.id].kind) || null,
      power: ref.power || (GL.data.abilities[ref.id] && GL.data.abilities[ref.id].value) || 0,
      hp: ref.hp, max: ref.max, atk: ref.atk, spd: ref.spd,
      crit: 0, critMult: GL.config.critMult, armor: 0, guard: 0, dodge: 0, dmgPct: 0, bossPct: 0, regen: 0,
      extraTurn: 0, riposte: 0, armorBreak: 0, killChain: 0, taunt: 0,
      ignoreWeak: false, revived: false
    }, base);
  }

  // Baut die Kampf-Einheiten mit allen Boni
  function setup(run, crewRefs, enemyRefs, opt) {
    const crew = crewRefs.map(r => unit('crew', r, { crit: run.crit, dmgPct: (run.sk && run.sk.dmgPct) || 0 }));   // dmgPct: Feinschliff Schaden
    const enemies = enemyRefs.map(r => unit('enemy', r));
    // STATS: Aufschlüsselung mitschreiben (nur Anzeige)
    if (opt && opt.trace) crew.forEach(u => {
      u.trace = {};
      note(u, 'crit', { ico: '🍈', name: 'Früchte & Ereignisse' }, run.crit || 0);
      note(u, 'dmgPct', { ico: '🌳', name: 'Feinschliff' }, (run.sk && run.sk.dmgPct) || 0);
    });

    const crewMods = labeledCrewMods(run, crewRefs);   // STATS: gleiche Reihenfolge wie vorher, nur mit Herkunft
    crew.forEach(u => crewMods.forEach(x => { if (applies(x.m.scope, u)) applyMod(u, x.m, run, x.src); }));
    // Eigenschaft wirkt nur auf die Figur selbst
    crew.forEach(u => {
      const t = GL.data.traits.find(x => x.id === u.ref.trait);
      if (t && t.mods) applyMod(u, t.mods, run, { ico: '🧬', name: t.name });
    });
    // Ausrüstung (Leben wird schon beim Anlegen verrechnet)
    crew.forEach(u => {
      const it = u.ref.item && (run.items || []).find(x => x.uid === u.ref.item);
      if (!it) return;
      const s = GL.run.itemStats(it);
      const def = (GL.data.items || []).find(x => x.id === it.id);
      Object.keys(s).forEach(k => { if (k !== 'hp' && k in u) { u[k] += s[k]; note(u, k, { ico: '⚙', name: def ? def.name : 'Ausrüstung' }, s[k]); } });
      // Legendärer Effekt des Teils (nur neue Runs)
      const lg = run.ramp && it.r === 3 && (GL.data.itemLegends || {})[it.id];
      if (lg && lg.mods) Object.keys(lg.mods).forEach(k => { if (k in u) { u[k] += lg.mods[k]; note(u, k, { ico: '★', name: lg.name }, lg.mods[k]); } });
    });
    // Crew-Ausrüstung der Stammcrew (Duelle): Zusatzwerte wie Krit, Ausweichen, Rüstung
    crew.concat(enemies).forEach(u => { const g = u.ref.gb; if (g) Object.keys(g).forEach(k => { if (k !== 'ultStart' && k in u) { u[k] += g[k]; note(u, k, { ico: '⚙', name: 'Crew-Ausrüstung' }, g[k]); } }); });
    // Für Gegner gelten nur ihre eigenen Fähigkeiten
    enemies.forEach(u => abilityMods().forEach(m => {
      if (m.scope === 'char:' + u.id) applyMod(u, m, run);
    }));
    // Besondere Gegner: eigene Werte (z. B. Schildträger)
    enemies.forEach(u => { if (u.ref.mods && !u.ref.pvp) applyMod(u, u.ref.mods, run); });
    // Stammcrew eines anderen Spielers: Synergien wie bei einer Crew
    if (enemyRefs.some(r => r.pvp)) {
      const sm = synergyMods(enemyRefs);
      enemies.forEach(u => sm.forEach(m => { if (applies(m.scope, u)) applyMod(u, m, run); }));
    }
    // 4D Crew mit Gefühlen (G1): froh = schneller, erschöpft = 20 % weniger Höchstleben in diesem Kampf
    const HZ = run.herz && run.herz.f, HC = GL.config.herz || {};
    if (HZ) crew.forEach(u => {
      const h = HZ[u.id];
      if (!h) return;
      if (h.g === 'froh') { u.spd += HC.frohSpd || 1; note(u, 'spd', { ico: '😊', name: 'Froh' }, HC.frohSpd || 1); }
      if (h.g === 'muede') {
        const cut = Math.max(1, Math.round(u.max * (HC.muedeHp || 0.2)));
        u.max = Math.max(1, u.max - cut); u.hp = Math.min(u.hp, u.max);
        note(u, 'herzHp', { ico: '😮‍💨', name: 'Erschöpft' }, -cut);
      }
    });
    // NEXT: Deckel gegen Stapel-Explosionen (sonst wird aus vielen kleinen Boni Unsterblichkeit oder ein 4×-Krit)
    const K = GL.config.caps || {};
    crew.concat(enemies).forEach(u => {
      if (u.trace) u.raw = { critMult: u.critMult, dmgPct: u.dmgPct, bossPct: u.bossPct, guard: u.guard, regen: u.regen };   // STATS: vor dem Deckel
      u.critMult = Math.min(u.critMult, K.critMultMax || 3);
      u.dmgPct = Math.min(u.dmgPct, 1);
      u.bossPct = Math.min(u.bossPct, 1);
      // STATS: Ausweichen über dem Deckel wird Schutz (weniger Schaden), statt zu verfallen
      const dOver = Math.max(0, u.dodge - (K.dodge != null ? K.dodge : 0.6));
      u.dodgeGuard = dOver > 0 ? Math.min(K.dodgeOverMax || 0, dOver * (K.dodgeOver || 0)) : 0;
      u.guard = Math.min(u.guard + u.dodgeGuard, K.guardMax || 0.6);
      u.regen = Math.min(u.regen, Math.max(2, Math.round((u.max || 0) * 0.1)));
      u.killChain = Math.min(u.killChain, 0.75);
    });
    return { crew, enemies, flags: flags(run) };
  }

  // Dein Stil (Build): stärkste aktive Synergie aus Kampfstil oder Rolle, die einen Build-Namen hat
  function build(crew) {
    const list = status(crew).filter(s => s.kind !== 'faction' && s.active && (s.kind === 'type' ? GL.data.types : GL.data.roles)[s.key].build);
    if (!list.length) return null;
    const lvl = s => s.tiers.indexOf(s.active);
    list.sort((a, b) => lvl(b) - lvl(a) || b.count - a.count || (a.kind === 'type' ? -1 : 1));
    const s = list[0], d = (s.kind === 'type' ? GL.data.types : GL.data.roles)[s.key];
    return { kind: s.kind, key: s.key, name: d.build, icon: d.icon, pitch: d.pitch, count: s.count, tier: lvl(s) + 1, tiers: s.tiers, active: s.active, next: s.next, label: d.name };
  }

  GL.effects = { counts, status, flags, setup, relicList, duos, duosWith, alliances, alliancesNear, build, combos, combosNear, critOf };   // STATS: critOf
})();
