// Stammcrew-Duell: die eigene Stammcrew kämpft gegen die gespeicherte Stammcrew eines anderen Spielers.
// Läuft komplett lokal mit dem normalen Kampfsystem. Die gegnerische Crew bekommt ihre Synergien
// und Ultis wie eine echte Crew (pvp-Markierung).
window.GL = window.GL || {};

(function () {
  function prep(list, pvp) {
    return (list || []).map(r => {
      const x = Object.assign({}, r, { hp: r.max });
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
  function fight(mine, theirs, seed) {
    const me = prep(mine, false);
    const foe = prep(theirs, true);
    // "self" der eigenen Crew nutzt die eingetragene Figur (Name/Aussehen stimmen schon)
    const run = { rng: (seed >>> 0) || 1, crew: me, relics: [], arts: [], items: [], crit: 0, bounties: 0,
      captain: me[0] && me[0].id, mod: { atk: 0, hp: 0, spd: 0 } };
    const res = GL.battle.simulate(run, me, foe, 'duel', {});
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

  GL.squad = { fight };
})();
