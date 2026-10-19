// Figuren-Meisterschaft: Jede Crew-Figur sammelt Erfahrung, wenn sie im Run dabei ist.
// Stufen: Bronze (Rahmen-Akzent), Silber (zweites Outfit), Gold (Fähigkeit 15 % stärker), Meister (Titel + Spruch).
// profile.mastery = { id: xp }, profile.masters = ids ab Gold (geht beim Run-Start in run.start.masters).
window.GL = window.GL || {};

(function () {
  const TIERS = [
    { k: 'bronze', xp: 100, name: 'Bronze', en: 'Bronze', c: '#c07a3a' },
    { k: 'silber', xp: 300, name: 'Silber', en: 'Silver', c: '#aab4c2' },
    { k: 'gold', xp: 700, name: 'Gold', en: 'Gold', c: '#e8c25a' },
    { k: 'meister', xp: 1500, name: 'Meister', en: 'Master', c: '#9a5ad8' }
  ];
  const xpOf = (p, id) => Math.max(0, Number((p.mastery || {})[id]) || 0);
  const tier = (p, id) => { const x = xpOf(p, id); let t = 0; TIERS.forEach((T, i) => { if (x >= T.xp) t = i + 1; }); return t; };

  // Erfahrung nach einem Run: dabei sein, Etappen, Sieg, Bosse
  function gain(p, run) {
    if (!run || !Array.isArray(run.crew)) return [];
    p.mastery = p.mastery && typeof p.mastery === 'object' ? p.mastery : {};
    const win = run.phase === 'win';
    const amount = Math.round(10 + Math.min(40, (run.step || 0) * 2) + (win ? 40 : 0) + Math.min(5, run.bounties || 0) * 10);
    const ups = [];
    const seen = {};
    run.crew.forEach(u => {
      const d = u && GL.data.crew.find(c => c.id === u.id);
      if (!d || seen[d.id]) return;
      seen[d.id] = 1;
      const before = tier(p, d.id);
      p.mastery[d.id] = xpOf(p, d.id) + amount;
      const after = tier(p, d.id);
      if (after > before) ups.push({ id: d.id, name: d.name, tier: after });
    });
    sync(p);
    return ups;
  }

  // Abgeleitete Listen: Gold+ für den Run-Start, Silber+ fürs zweite Outfit
  let altSet = new Set();
  function sync(p) {
    const ids = Object.keys((p && p.mastery) || {});
    p.masters = ids.filter(id => tier(p, id) >= 3);
    altSet = new Set(ids.filter(id => tier(p, id) >= 2 && !(p.outfitOff || []).includes(id)));
    return p;
  }
  const alt = id => altSet.has(id);

  // Zweites Outfit: Hemd und Hose aus der Charakter-Palette eine Farbe weiter, ruhig und erkennbar
  function altLook(look) {
    const P = GL.data.charParts || {};
    const next = (list, c, step) => { if (!list || !list.length) return c; const i = list.indexOf(c); return list[((i < 0 ? 0 : i) + step) % list.length]; };
    return Object.assign({}, look, { shirt: next(P.shirt, look.shirt, 3), pants: next(P.pants, look.pants, 2) });
  }

  function count(p) { const m = (p && p.mastery) || {}; const c = [0, 0, 0, 0, 0]; Object.keys(m).forEach(id => { c[tier(p, id)]++; }); return c; }

  GL.mastery = { TIERS, xpOf, tier, gain, sync, alt, altLook, count };
})();
