// Crew-Ausrüstung: Würfeln, Namen, Werte, Anlegen. Läuft nur im Hauptquartier (nicht im Run-Replay),
// daher reicht Math.random.
window.GL = window.GL || {};

(function () {
  const D = () => GL.data.crewGear;
  const base = id => D().bases.find(b => b.id === id);
  const round = (k, v) => (k === 'crit' || k === 'dodge' || k === 'dmgPct') ? Math.round(v * 100) / 100 : Math.max(1, Math.round(v));
  const between = (a, b) => a + Math.random() * (b - a);
  const RNAME = ['Gewöhnlich', 'Selten', 'Episch', 'Legendär'];
  const RID = ['common', 'rare', 'epic', 'legendary'];

  function rollRarity(src) {
    const w = D().weights.slice();
    const heat = src.heat || 0, loop = src.loop || 0;
    w[2] += 2 * heat + 4 * loop + (src.raid ? 10 : 0);
    w[3] += 0.6 * heat + 2 * loop + (src.raid ? 5 : 0);
    let x = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let r = 0; r < w.length; r++) { x -= w[r]; if (x < 0) return r; }
    return 0;
  }

  // src: { boss, name, sea (Index), seaName, raid, loop, heat }
  function roll(src) {
    const C = D();
    const r = src.r != null ? src.r : rollRarity(src);
    const b = C.bases[Math.floor(Math.random() * C.bases.length)];
    const q = (1 + C.perSea * (src.sea || 0) + 0.15 * (src.loop || 0)) * C.rarityMult[r];
    const a = {};
    const A = C.affixes[b.main];
    a[b.main] = round(b.main, between(A.min, A.max) * q * C.mainMult);
    const pool = Object.keys(C.affixes).filter(k => k !== b.main);
    for (let i = 0; i < r && pool.length; i++) {
      const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      const F = C.affixes[k];
      a[k] = round(k, between(F.min, F.max) * q);
    }
    return {
      uid: 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
      b: b.id, r, a, m: b.main,
      f: { boss: src.boss || null, name: src.name || null, sea: src.seaName || null, at: new Date().toISOString(), loop: src.loop || 0, raid: !!src.raid }
    };
  }

  function name(it) {
    const b = base(it.b);
    if (!b) return 'Ausrüstung';
    if (it.r >= 3 && it.f && it.f.name) return `${b.name} von ${it.f.name}`;
    const extra = Object.keys(it.a).filter(k => k !== it.m);
    if (!extra.length) return b.name;
    const adj = D().affixes[extra[0]].adj;
    return `${adj}${{ m: 'er', f: 'e', n: 'es' }[b.g] || 'e'} ${b.name}`;
  }
  function lines(it) { return Object.keys(it.a).map(k => ({ k, main: k === it.m, text: D().affixes[k].fmt(it.a[k]) })); }
  function power(it) {
    const a = it.a || {};
    return Math.round((a.atk || 0) * 4 + (a.hp || 0) * 0.5 + (a.spd || 0) * 3 + (a.crit || 0) * 150 + (a.dodge || 0) * 150 + (a.armor || 0) * 4 + (a.dmgPct || 0) * 120);
  }
  function slotOf(it) { const b = base(it.b); return b ? b.slot : null; }
  function from(it) {
    const f = it.f || {};
    const d = f.at ? new Date(f.at) : null;
    const when = d ? `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} Uhr` : '';
    return { who: f.name ? `${f.raid ? 'Raid' : 'Boss'}: ${f.name}` : 'Unbekannt', where: f.sea || '', when, loop: f.loop || 0 };
  }

  // ---------- Profil: Tasche und angelegte Teile ----------
  function bag(profile) { return (profile.gearBag = profile.gearBag || []); }
  function worn(profile) { return (profile.squadGear = profile.squadGear || {}); }
  function wornBy(profile, uid) {
    const W = worn(profile);
    return Object.keys(W).find(id => Object.values(W[id] || {}).includes(uid)) || null;
  }
  function equip(profile, crewId, uid) {
    const it = bag(profile).find(x => x.uid === uid);
    if (!it) return false;
    const W = worn(profile), slot = slotOf(it);
    Object.keys(W).forEach(id => { Object.keys(W[id] || {}).forEach(s => { if (W[id][s] === uid) delete W[id][s]; }); });
    W[crewId] = Object.assign({}, W[crewId], { [slot]: uid });
    return true;
  }
  function unequip(profile, crewId, slot) { const W = worn(profile); if (W[crewId]) delete W[crewId][slot]; }
  function scrap(profile, uid) {
    const B = bag(profile), i = B.findIndex(x => x.uid === uid);
    if (i < 0 || wornBy(profile, uid)) return 0;
    const berry = D().scrap[B[i].r] || 0;
    B.splice(i, 1);
    profile.berry = (profile.berry || 0) + berry;
    return berry;
  }
  // Werte aller angelegten Teile einer Figur zusammenzählen
  function totals(profile, crewId) {
    const W = worn(profile)[crewId] || {}, B = bag(profile), t = {};
    Object.values(W).forEach(uid => { const it = B.find(x => x.uid === uid); if (it) Object.keys(it.a).forEach(k => { t[k] = (t[k] || 0) + it.a[k]; }); });
    return t;
  }
  // Kompakte Kopie für die Rangliste (Freunde sehen Werte und Herkunft)
  function wornList(profile, crewId) {
    const W = worn(profile)[crewId] || {}, B = bag(profile);
    return D().slots.map(s => B.find(x => x.uid === W[s.id])).filter(Boolean).map(it => ({ b: it.b, r: it.r, a: it.a, m: it.m, f: it.f }));
  }

  // Nach einem Run: für jeden besiegten Boss/Raid eine Chance auf ein Teil
  function drops(profile, run) {
    if (run.daily || run.duel || !(run.gearSrc || []).length) return [];
    const C = D(), got = [];
    // Endlos-Modus: derselbe Run wird mehrmals abgeschlossen, schon Gewürfeltes zählt nicht doppelt
    const done = profile.gearRolled && profile.gearRolled.seed === run.seed ? profile.gearRolled.n : 0;
    profile.gearRolled = { seed: run.seed, n: run.gearSrc.length };
    run.gearSrc.slice(done).forEach(s => {
      const raid = (GL.data.raids || []).some(x => x.id === s.id);
      const chance = (raid ? C.dropChance.raid : C.dropChance.boss) + C.dropChance.perLoop * (s.loop || 0);
      if (Math.random() >= chance) return;
      const d = (GL.data.raids || []).find(x => x.id === s.id) || GL.data.bosses.find(x => x.id === s.id) || {};
      const sea = GL.data.islands[s.sea] || {};
      got.push(roll({ boss: s.id, name: d.name, sea: s.sea, seaName: sea.name, raid, loop: s.loop, heat: run.heat || 0 }));
    });
    const B = bag(profile);
    got.forEach(it => B.push(it));
    // Tasche voll: die schwächsten nicht angelegten Teile werden zu Berry
    while (B.length > C.bagMax) {
      const free = B.filter(x => !wornBy(profile, x.uid)).sort((a, b) => a.r - b.r || power(a) - power(b));
      if (!free.length) break;
      scrap(profile, free[0].uid);
    }
    profile.gearNew = got.map(x => x.uid);
    return got;
  }

  GL.cgear = { roll, name, lines, power, slotOf, from, base, bag, worn, wornBy, equip, unequip, scrap, totals, wornList, drops, RNAME, RID };
})();
