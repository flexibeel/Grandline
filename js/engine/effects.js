// Synergien, Schätze und Fähigkeits-Werte zusammenrechnen.
// Liefert die Werte, mit denen jede Figur in einen Kampf geht.
window.GL = window.GL || {};

(function () {
  const STATS = ['atk', 'spd', 'crit', 'critMult', 'armor', 'guard', 'dodge', 'dmgPct', 'bossPct', 'regen'];

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

  // Aktive Synergie-mods (nur die höchste erreichte Stufe pro Synergie)
  function synergyMods(crew) {
    return status(crew).filter(s => s.active).flatMap(s => s.active.mods);
  }

  // Gefundene Schätze mit ausgewürfelten Werten
  function relicList(run) {
    return (run.relics || []).map(x => GL.loot.relic(x));
  }

  // Sonderregeln aller Schätze zusammengefasst
  function flags(run) {
    const f = { winHeal: 0, noWinHeal: false, bossStartCut: 0, vivre: 0, firstBlock: 0,
                cannon: 0, effBonus: 0, crewLimit: 0, healMult: 1 };
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
      if (x.healBonus) f.healMult *= 1 + x.healBonus;
    });
    return f;
  }

  function applyMod(u, m, run) {
    STATS.forEach(s => { if (m[s]) u[s] += m[s]; });
    if (m.atkPerBounty) u.atk += m.atkPerBounty * run.bounties;
    if (m.ignoreWeak) u.ignoreWeak = true;
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
      ignoreWeak: false, revived: false
    }, base);
  }

  // Baut die Kampf-Einheiten mit allen Boni
  function setup(run, crewRefs, enemyRefs) {
    const crew = crewRefs.map(r => unit('crew', r, { crit: run.crit }));
    const enemies = enemyRefs.map(r => unit('enemy', r));

    const crewMods = [...synergyMods(crewRefs), ...relicList(run).flatMap(r => r.mods || []), ...abilityMods(), ...artifactMods(run)];
    crew.forEach(u => crewMods.forEach(m => { if (applies(m.scope, u)) applyMod(u, m, run); }));
    // Eigenschaft wirkt nur auf die Figur selbst
    crew.forEach(u => {
      const t = GL.data.traits.find(x => x.id === u.ref.trait);
      if (t && t.mods) applyMod(u, t.mods, run);
    });
    // Ausrüstung (Leben wird schon beim Anlegen verrechnet)
    crew.forEach(u => {
      const it = u.ref.item && (run.items || []).find(x => x.uid === u.ref.item);
      if (!it) return;
      const s = GL.run.itemStats(it);
      Object.keys(s).forEach(k => { if (k !== 'hp' && k in u) u[k] += s[k]; });
    });
    // Für Gegner gelten nur ihre eigenen Fähigkeiten
    enemies.forEach(u => abilityMods().forEach(m => {
      if (m.scope === 'char:' + u.id) applyMod(u, m, run);
    }));
    // Stammcrew eines anderen Spielers: Synergien wie bei einer Crew
    if (enemyRefs.some(r => r.pvp)) {
      const sm = synergyMods(enemyRefs);
      enemies.forEach(u => sm.forEach(m => { if (applies(m.scope, u)) applyMod(u, m, run); }));
    }
    return { crew, enemies, flags: flags(run) };
  }

  GL.effects = { counts, status, flags, setup, relicList };
})();
