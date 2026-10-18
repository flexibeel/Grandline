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

  // Trophäe aus Raid-Beute: eigene Instanz mit zufälligen Zusatzwerten
  function trophy(lootId, src) {
    const C = D(), l = (GL.data.huntLoot || []).find(x => x.id === lootId);
    if (!l) return null;
    const r = l.r >= 3 ? 3 : 2;
    const q = (1 + C.perSea * (src && src.sea || 1)) * C.rarityMult[r];
    const a = {}, pool = Object.keys(C.affixes);
    for (let i = 0; i < r - 1; i++) {
      const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      const F = C.affixes[k];
      a[k] = round(k, between(F.min, F.max) * q);
    }
    const raid = (GL.data.raids || []).find(x => x.id === l.raid) || {};
    return { uid: 't' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), t: lootId, r, a,
      f: { boss: l.raid, name: raid.name || null, sea: src && src.seaName || null, at: src && src.at || new Date().toISOString(), loop: src && src.loop || 0, raid: true } };
  }
  // Flaschenpost: nur bekannte Felder übernehmen, Werte begrenzen, neue uid
  function clean(raw, fromName) {
    if (!raw || typeof raw !== 'object') return null;
    const C = D(), r = Math.max(0, Math.min(3, Math.round(+raw.r || 0)));
    const isT = raw.t && C.trophyPerks && C.trophyPerks[raw.t];
    const b = !isT && base(raw.b);
    if (!isT && !b) return null;
    const a = {};
    Object.keys(raw.a || {}).slice(0, 5).forEach(k => { const F = C.affixes[k]; if (!F) return; const v = +raw.a[k]; if (!isFinite(v) || v <= 0) return; a[k] = Math.min(v, F.max * 6); });
    if (!Object.keys(a).length && !isT) return null;
    const it = { uid: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), r, a,
      f: { boss: null, name: (raw.f && raw.f.name) ? String(raw.f.name).slice(0, 24) : null, sea: null, at: new Date().toISOString(), loop: 0, raid: !!isT, gift: String(fromName || 'Pirat').slice(0, 24) } };
    if (isT) it.t = raw.t; else { it.b = b.id; it.m = C.affixes[raw.m] ? raw.m : b.main; }
    return it;
  }
  function perk(it) { return it && it.t ? D().trophyPerks[it.t] || null : null; }
  function name(it) {
    if (it.t) { const l = (GL.data.huntLoot || []).find(x => x.id === it.t); return l ? l.name : 'Trophäe'; }
    const b = base(it.b);
    if (!b) return 'Ausrüstung';
    if (it.r >= 3 && it.f && it.f.name) return `${b.name} von ${it.f.name}`;
    const extra = Object.keys(it.a).filter(k => k !== it.m);
    if (!extra.length) return b.name;
    const adj = D().affixes[extra[0]].adj;
    return `${adj}${{ m: 'er', f: 'e', n: 'es' }[b.g] || 'e'} ${b.name}`;
  }
  function lines(it) {
    const out = Object.keys(it.a).map(k => ({ k, main: k === it.m, text: D().affixes[k].fmt(it.a[k]) }));
    const p = perk(it);
    if (p) out.unshift({ k: 'perk', main: true, text: `${p.name}: ${p.text}` });
    return out;
  }
  function power(it) {
    const p = perk(it);
    const a = Object.assign({}, it.a || {});
    if (p) { Object.keys(p.a || {}).forEach(k => { a[k] = (a[k] || 0) + p.a[k]; }); Object.keys(p.gb || {}).forEach(k => { a[k] = (a[k] || 0) + p.gb[k]; }); }
    const extra = (a.ultStart || 0) * 0.4 + (a.regen || 0) * 6 + (a.critMult || 0) * 60;
    return Math.round((a.atk || 0) * 4 + (a.hp || 0) * 0.5 + (a.spd || 0) * 3 + (a.crit || 0) * 150 + (a.dodge || 0) * 150 + (a.armor || 0) * 4 + (a.dmgPct || 0) * 120 + extra);
  }
  function slotOf(it) { if (it.t) return 'trophae'; const b = base(it.b); return b ? b.slot : null; }
  function from(it) {
    const f = it.f || {};
    const d = f.at ? new Date(f.at) : null;
    const when = d ? `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} Uhr` : '';
    return { who: f.gift ? `Flaschenpost von ${f.gift}` : f.name ? `${f.raid ? 'Raid' : 'Boss'}: ${f.name}` : 'Unbekannt', where: f.sea || '', when, loop: f.loop || 0 };
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
    const sh = D().shardScrap[B[i].r] || 0, sn = (D().snackScrap || [])[B[i].r] || 0;
    profile.shards = (profile.shards || 0) + sh;
    profile.snacks = (profile.snacks || 0) + sn;
    profile.lastScrap = { berry, shards: sh, snacks: sn };
    if (GL.meta && GL.meta.gone) GL.meta.gone(profile, B[i].uid);
    B.splice(i, 1);
    profile.berry = (profile.berry || 0) + berry;
    return berry;
  }
  // Zusatzwerte neu würfeln (kostet Meersplitter). Hauptwert und Trophäen-Fähigkeit bleiben.
  function reroll(profile, uid) {
    const it = bag(profile).find(x => x.uid === uid);
    if (!it) return false;
    const cost = D().rerollCost[it.r] || 1;
    if ((profile.shards || 0) < cost) return false;
    profile.shards -= cost;
    const C = D(), keep = it.m ? { [it.m]: it.a[it.m] } : {};
    const n = Object.keys(it.a).length - Object.keys(keep).length;
    const pool = Object.keys(C.affixes).filter(k => !(k in keep));
    const q = (1 + C.perSea * 1.5 + 0.15 * ((it.f && it.f.loop) || 0)) * C.rarityMult[it.r];
    const a = Object.assign({}, keep);
    for (let i = 0; i < n && pool.length; i++) { const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]; const F = C.affixes[k]; a[k] = round(k, between(F.min, F.max) * q); }
    it.a = a; it.rolls = (it.rolls || 0) + 1;
    return true;
  }
  // Werte aller angelegten Teile einer Figur zusammenzählen
  function totals(profile, crewId) {
    const W = worn(profile)[crewId] || {}, B = bag(profile), t = {};
    const add = (k, v) => { t[k] = (t[k] || 0) + v; };
    Object.values(W).forEach(uid => {
      const it = B.find(x => x.uid === uid); if (!it) return;
      Object.keys(it.a).forEach(k => add(k, it.a[k]));
      const p = perk(it);
      if (p) { Object.keys(p.a || {}).forEach(k => add(k, p.a[k])); Object.keys(p.gb || {}).forEach(k => add(k, p.gb[k])); }
    });
    return t;
  }
  // Kompakte Kopie für die Rangliste (Freunde sehen Werte und Herkunft)
  function wornList(profile, crewId) {
    const W = worn(profile)[crewId] || {}, B = bag(profile);
    return D().slots.map(s => B.find(x => x.uid === W[s.id])).filter(Boolean).map(it => ({ b: it.b, t: it.t, r: it.r, a: it.a, m: it.m, f: it.f }));
  }

  // Nach einem Run: für jeden besiegten Boss/Raid eine Chance auf ein Teil
  // Vorhandene Vitrine einmalig in Trophäen umwandeln (je Fund ein Stück, höchstens 3)
  function migrate(profile) {
    if (profile.trophyInit) return;
    profile.trophyInit = 1;
    const B = bag(profile);
    Object.keys(profile.loot || {}).forEach(id => { for (let i = 0; i < Math.min(3, profile.loot[id]); i++) { const t = trophy(id, { sea: 2 }); if (t) B.push(t); } });
  }
  function drops(profile, run) {
    migrate(profile);
    const C = D(), got = [];
    // Raid-Beute aus diesem Run: zusätzlich als Trophäe für die Stammcrew
    (run.loot || []).forEach(id => { const t = trophy(id, { sea: 2, loop: run.loop || 0 }); if (t) got.push(t); });
    if (run.daily || run.duel || !(run.gearSrc || []).length) { const B0 = bag(profile); got.forEach(it => B0.push(it)); profile.gearNew = got.map(x => x.uid); return got; }
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

  GL.cgear = { clean, reroll, trophy, perk, migrate, roll, name, lines, power, slotOf, from, base, bag, worn, wornBy, equip, unequip, scrap, totals, wornList, drops, RNAME, RID };
})();
