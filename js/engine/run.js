// Ablauf eines Runs: Karte, Entscheidungen, Kämpfe, Belohnungen.
//
// Alles, was der Spieler tut, läuft über GL.run.act(run, aktion).
// Jede gültige Aktion wird in run.actions gespeichert. Zusammen mit dem Seed
// lässt sich ein Run damit später komplett nachspielen (Grundlage für eine
// fälschungssichere Rangliste).
//
// Phasen (run.phase):
//   starter  Kapitän wählen        -> { type: 'pick', index }
//   map      Route wählen          -> { type: 'node', index }
//   (fast immer) Statuspunkt       -> { type: 'spend', index, stat: 'hp' | 'atk' | 'spd' }
//   recruit  Taverne (Shop)        -> { type: 'pick', index } kaufen, { type: 'reroll' }, { type: 'leave' }
//   (außer im Kampf) Entlassen     -> { type: 'dismiss', index }
//   (außer im Kampf) Ausrüsten     -> { type: 'equip', index, uid }   (uid leer = ablegen)
//   fruit    Teufelsfrucht wählen  -> { type: 'pick', index }
//   treasure Schatz wählen         -> { type: 'pick', index }
//   prep     Kampfreihenfolge      -> { type: 'fight' }  oder { type: 'special' } (Spezialangriff an/aus)
//   (außer im Kampf) Tauschen       -> { type: 'swap', a, b }
//   battle   Kampf ist berechnet   -> { type: 'continue' }   (auch Raids)
//   awaken   Erwachen wählen       -> { type: 'pick', index }
//   event    Ereignis auf See      -> { type: 'pick', index }
//   over     verloren
//   win      gewonnen
window.GL = window.GL || {};

(function () {
  const R = GL.rng;
  const byId = (list, id) => list.find(x => x.id === id);

  function totalSteps() {
    return GL.data.islands.length * GL.config.stepsPerIsland;
  }

  function islandIndex(run) {
    return Math.min(Math.floor(run.step / GL.config.stepsPerIsland), GL.data.islands.length - 1);
  }

  // Insel-Kapitel: pro Meer erst eine kleine Insel, dann eine große (siehe islands.js)
  function seaPos(run) { return run.step % GL.config.stepsPerIsland; }
  function chapterIdx(run) { return Math.floor(seaPos(run) / GL.config.chapterSteps); }
  function rowIdx(run) { return seaPos(run) % GL.config.chapterSteps; }
  function chapterIsland(run, step) {
    const st = step == null ? run.step : step;
    const per = GL.config.stepsPerIsland;
    const sea = Math.min(Math.floor(st / per), GL.data.islands.length - 1);
    const ch = Math.floor((st % per) / GL.config.chapterSteps);
    const id = (run.course || [])[sea * 2 + ch];
    const S = GL.data.seaOf(run, sea);
    return id ? (ch === 0 ? S.small : S.big).find(x => x.id === id) || null : null;
  }
  // Kurswahl vor jedem Insel-Kapitel
  function openCourse(run) {
    const si = islandIndex(run);
    const base = GL.data.islands[si];
    const S = GL.data.seaOf(run, si);
    const list = chapterIdx(run) === 0 ? S.small : S.big;
    // Zwei Routen offen: am Anfang des Meeres je eine Insel aus beiden Routen
    if (chapterIdx(run) === 0 && GL.data.altOpen(run, si)) {
      run.courseOpts = [R.sample(run, base.small.map(x => x.id), 1)[0], R.sample(run, base.alt.small.map(x => x.id), 1)[0]];
    } else run.courseOpts = list.length > 2 ? R.sample(run, list.map(x => x.id), 2) : list.map(x => x.id);
    run.phase = 'course';
    run.chart = null;
    run.options = [];
  }

  function currentBoss(run) {
    return byId(GL.data.bosses, run.bosses[islandIndex(run)]);
  }

  // ---------- Crew: gewürfelte Angebote, Level, Statuspunkte ----------

  function xpNeed(lvl) {
    return GL.config.xpNeed.base + GL.config.xpNeed.perLevel * lvl;
  }

  function avgLevel(run) {
    if (!run.crew.length) return 1;
    return run.crew.reduce((s, u) => s + u.lvl, 0) / run.crew.length;
  }

  // Ein zufällig ausgewürfeltes Angebot für eine Figur
  function rollOffer(run, id) {
    const C = GL.config;
    const d = byId(GL.data.crew, id);
    const total = C.stars.reduce((s, x) => s + x.w, 0);
    let x = R.float(run) * total;
    const star = C.stars.find(st => (x -= st.w) < 0) || C.stars[0];
    const trait = GL.data.traits[R.int(run, 0, GL.data.traits.length - 1)].id;
    let lvl = Math.max(1, Math.floor(avgLevel(run)) - R.int(run, 0, 1));
    // Endlos-Fahrt in einem späteren Meer: Kapitän kommt schon mit passender Erfahrung
    if (run.endlessSea && !run.crew.length) lvl = 1 + GL.config.endless.lvlPerSea * run.endlessSea;
    // Statuspunkte früherer Level automatisch passend zur Rolle verteilen
    const weights = d.role === 'brecher' ? [3, 1, 1] : d.role === 'kaempfer' ? [1, 3, 1] : [2, 1, 2];
    const alloc = { hp: 0, atk: 0, spd: 0 };
    for (let i = 0; i < (lvl - 1) * C.levelUp.points; i++) {
      let y = R.float(run) * 5;
      alloc[(y -= weights[0]) < 0 ? 'hp' : (y -= weights[1]) < 0 ? 'atk' : 'spd']++;
    }
    return { id, stars: star.n, trait, lvl, alloc, jitter: R.int(run, -1, 1) };
  }

  // Zwei gleiche Figuren werden eine stärkere: +1 Stern, mehr Leben und Angriff, voll geheilt
  function mergeMember(run, u) {
    const M = GL.config.merge;
    const before = u.stars || 1;
    u.stars = Math.min(3, before + 1);
    const addHp = Math.round(u.max * M.hp), addAtk = Math.max(M.atkMin, Math.round(u.atk * M.atk));
    u.max += addHp; u.hp = u.max; u.atk += addAtk;
    u.merged = (u.merged || 0) + 1;
    run.lastMerge = { id: u.id, from: before, to: u.stars, hp: addHp, atk: addAtk };
  }
  function makeMember(run, offer) {
    const C = GL.config;
    const d = byId(GL.data.crew, offer.id);
    const star = C.stars.find(s => s.n === offer.stars) || C.stars[1];
    const t = byId(GL.data.traits, offer.trait) || {};
    const tb = t.base || {};
    const a = offer.alloc || { hp: 0, atk: 0, spd: 0 };
    const max = Math.max(5, d.hp + star.hp + (tb.hp || 0) + run.mod.hp
      + (offer.lvl - 1) * C.levelUp.hp + a.hp * C.point.hp);
    return {
      id: d.id, type: d.type, role: d.role, faction: d.faction,
      trait: offer.trait, stars: offer.stars, lvl: offer.lvl, xp: 0, points: 0,
      hp: max, max,
      atk: Math.max(1, d.atk + star.atk + (tb.atk || 0) + run.mod.atk + a.atk * C.point.atk),
      spd: Math.max(1, d.spd + (offer.jitter || 0) + (tb.spd || 0) + run.mod.spd + a.spd * C.point.spd)
    };
  }

  // Erfahrung nach einem Sieg verteilen. Gibt die Ergebnisse für die Anzeige zurück.
  function grantXp(run, kind, alive, amount) {
    const C = GL.config;
    return run.crew.map((u, i) => {
      const t = byId(GL.data.traits, u.trait) || {};
      const gain = Math.round((amount || C.xp[kind] || 0) * (alive[i] ? 1 : 0.5) * (t.xpMult || 1) * (1 + (run.bonus ? run.bonus.xp : 0)));
      const from = { lvl: u.lvl, xp: u.xp };
      u.xp += gain;
      while (u.xp >= xpNeed(u.lvl)) {
        u.xp -= xpNeed(u.lvl);
        u.lvl++;
        u.max += C.levelUp.hp;
        if (u.hp > 0) u.hp += C.levelUp.hp;
        u.points += C.levelUp.points;
      }
      return { gain, from, to: { lvl: u.lvl, xp: u.xp } };
    });
  }

  // Gesamtwirkung der Werft-Ausbauten für einen Effekt (z. B. 'hp')
  function upgradeTotal(upgrades, effect) {
    return GL.data.upgrades.reduce((sum, u) =>
      sum + (u.effect === effect ? (upgrades[u.id] || 0) * u.per : 0), 0);
  }

  function choices(run) {
    return GL.config.choicesPerPick + (run.bonus ? run.bonus.choices : 0);
  }

  // ---------- Taverne (Shop) ----------
  // Neue Crewmitglieder kosten Gold. Gold gibt es für Siege, dazu Zinsen auf Erspartes.
  function offerPrice(run, offer) {
    const S = GL.config.shop;
    if (run.shopFree) return 0;
    const d = byId(GL.data.crew, offer.id);
    return S.base + S.perStar * ((offer.stars || 1) - 1) + S.perLevel * ((offer.lvl || 1) - 1) + (d && d.locked ? S.locked : 0);
  }
  function sellValue(u) {
    const S = GL.config.shop;
    return Math.max(1, Math.round((S.base + S.perStar * ((u.stars || 1) - 1) + S.perLevel * ((u.lvl || 1) - 1)) * S.sellShare));
  }
  function rerollCost(run) { return GL.config.shop.reroll + GL.config.shop.rerollStep * (run.shopRolls || 0); }
  // Taverne wie bei TFT: Figuren aus Banden, die schon in der Crew sind, tauchen etwas häufiger auf.
  // So bleiben Banden-Boni erreichbar, auch wenn man viele Figuren freigeschaltet hat.
  function shopOffers(run) {
    const free = availableCrew(run).filter(id => !run.crew.some(u => u.id === id));
    const n = choices(run) + GL.config.shop.extraOffers;
    const fw = GL.config.shop.factionWeight || 1;
    const have = new Set(run.crew.map(u => u.faction).filter(Boolean));
    // Build: Kampfstile, die schon mindestens zweimal an Bord sind, tauchen öfter auf (Build kristallisiert sich heraus)
    const tw = GL.config.shop.typeWeight || 1, tc = GL.effects.counts(run.crew).type;
    const build = new Set(Object.keys(tc).filter(k => tc[k] >= 2));
    // Du bist Kapitän: freigeschaltete Kapitäne tauchen in der Taverne etwas öfter auf
    const uw = run.mateMode ? 1.4 : 1, anyU = uw !== 1 && free.some(id => { const d = byId(GL.data.crew, id); return d && d.locked; });
    if ((fw === 1 || !have.size) && (tw === 1 || !build.size) && !anyU) return R.sample(run, free, n);
    const pool = free.map(id => { const d = byId(GL.data.crew, id); return { id, w: (d && d.faction && have.has(d.faction) ? fw : 1) * (d && build.has(d.type) ? tw : 1) * (d && d.locked ? uw : 1) }; });
    const out = [];
    while (out.length < n && pool.length) {
      let x = R.float(run) * pool.reduce((a, b) => a + b.w, 0), k = 0;
      for (; k < pool.length - 1; k++) { x -= pool[k].w; if (x < 0) break; }
      out.push(pool.splice(k, 1)[0].id);
    }
    return out;
  }
  // Zusammenlegen: manchmal taucht eine Figur aus der Crew (unter 3 Sternen) noch einmal auf
  function addDuplicate(run, offers) {
    const M = GL.config.merge; if (!M || !offers.length) return null;
    const cand = run.crew.filter(u => u.id !== 'self' && (u.stars || 1) < 3 && byId(GL.data.crew, u.id));
    if (!cand.length || R.float(run) >= M.chance) return null;
    const u = cand[R.int(run, 0, cand.length - 1)];
    offers.push(u.id);   // zusätzliches Angebot, nimmt keinem anderen den Platz
    return u;
  }
  function dupOffer(run, offer, u) {
    if (!u || offer.id !== u.id) return offer;
    return Object.assign(offer, { stars: u.stars || 1, dup: true });
  }
  function openShop(run) {
    const offers = shopOffers(run);
    // Vertrauter: wartet in der ersten Taverne, falls er nicht schon an Bord ist
    if (run.buddy && !run.buddyMet && byId(GL.data.crew, run.buddy) && (!byId(GL.data.crew, run.buddy).locked || run.unlocked.includes(run.buddy))) {
      run.buddyMet = true;
      if (!run.crew.some(u => u.id === run.buddy) && !offers.includes(run.buddy) && offers.length) offers[offers.length - 1] = run.buddy;
    }
    const du = addDuplicate(run, offers);
    run.pool = offers.map(id => dupOffer(run, rollOffer(run, id), du));
    run.shopRolls = 0;
    run.phase = 'recruit';
  }
  // Gold nach einem Sieg: fester Betrag je Kampfart plus Zinsen (je 10 Gold 1, höchstens 3)
  function earnGold(run, kind) {
    const S = GL.config.shop;
    const base = Math.round((S.win[kind] || 0) * (run.mood === 'goldrausch' ? 1.4 : 1));
    const interest = Math.min(S.interestMax, Math.floor((run.gold || 0) / 10));
    run.gold = (run.gold || 0) + base + interest;
    run.lastGold = { base, interest };
  }

  function crewLimit(run) {
    return GL.config.maxCrew + GL.effects.flags(run).crewLimit;
  }

  // Figuren, die in diesem Run auftauchen können (Grundliste + Freischaltungen)
  // Eigener Pirat des Spielers: wird als Figur 'self' eingetragen (auch beim Replay aus run.start)
  function registerSelf(def) {
    if (!def) return;
    const entry = { id: 'self', name: def.name, type: def.type, role: def.role, faction: null,
      hp: def.hp, atk: def.atk, spd: def.spd, look: def.look, locked: true, self: true,
      crewName: def.crew ? String(def.crew).replace(/[<>"'`&\\]/g, '').slice(0, 20) : null,
      fruit: def.fruit && def.fruit.id ? { id: String(def.fruit.id), r: def.fruit.r | 0 } : null };
    const i = GL.data.crew.findIndex(c => c.id === 'self');
    if (i >= 0) GL.data.crew[i] = entry; else GL.data.crew.push(entry);
    GL.data.abilities.self = { name: 'Wille des Kapitäns', kind: 'rally', value: def.rally,
      text: `Zu Kampfbeginn bekommt die ganze Crew +${def.rally} Angriff. Wird mit deinem Piratenrang stärker.` };
  }

  function availableCrew(run) {
    return GL.data.crew.filter(c => !c.locked || run.unlocked.includes(c.id)).map(c => c.id);
  }

  // Teufelsfrüchte im Angebot. Freigeschaltete epische tauchen manchmal mit auf.
  function fruitPool(run, elite) {
    const pool = GL.data.fruits.filter(f => !f.awakened).map(f => f.id);
    run.epics.forEach(id => { if (R.float(run) < GL.config.epicChance) pool.push(id); });
    return R.sample(run, pool, choices(run)).map(id => ({
      id, r: byId(GL.data.fruits, id).awakened ? -1 : GL.loot.rollRarity(run, elite)
    }));
  }

  function freeRelics(run) {
    return GL.data.relics.map(r => r.id).filter(id => !run.relics.some(x => x.id === id));
  }

  // ---------- Seekarte (wie bei Pokelike) ----------
  // Pro Insel eine Karte mit Reihen (stepsPerIsland). Jede Reihe hat 2 bis 4 Orte,
  // Wege führen nur zu benachbarten Orten der nächsten Reihe. Oben wartet der Inselboss.
  //   run.chart = { rows: [[{ t, next: [spalten] }]], at: spalte | null, path: [spalten] }
  function nodeTypes(run, row) {
    const types = ['battle', 'battle', 'battle', 'recruit', 'recruit', 'fruit', 'rest'];
    if (freeRelics(run).length) types.push('treasure');
    if (row >= 1 || chapterIdx(run) === 1) types.push('elite');
    // Eigenheiten der Insel und Insel-Twist: ein paar Orte mehr von einer Sorte
    const here = chapterIsland(run), tw = twistOf(run);
    ((here && here.bias) || []).concat((tw && tw.types) || []).forEach(k => {
      if (k === 'treasure' && !freeRelics(run).length) return;
      if (k === 'elite' && row < 1 && chapterIdx(run) === 0) return;
      types.push(k);
    });
    return types;
  }

  // Insel-Twist des aktuellen Insel-Kapitels (aus Seed und Kapitel, ohne Zufallszug)
  function twistOf(run, step) {
    const T = GL.data.twists || [];
    if (!T.length || !run || run.seed == null) return null;
    const st = step == null ? run.step : step;
    const per = GL.config.stepsPerIsland;
    const k = (run.loop || 0) * 16 + Math.floor(st / per) * 2 + Math.floor((st % per) / GL.config.chapterSteps);
    let h = (run.seed ^ Math.imul(k + 1, 2654435761)) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489917) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return T[h % T.length] || null;
  }

  // Eine Karte pro Insel-Kapitel: Reihen mit Orten der Insel, oben der Bösewicht (kleine Insel)
  // bzw. der Boss des Meeres (große Insel).
  function genChart(run) {
    const C = GL.config;
    const per = C.chapterSteps;
    const ch = chapterIdx(run);
    const isl = islandIndex(run);
    const here = chapterIsland(run);
    const rows = [];
    for (let r = 0; r < per - 1; r++) {
      const w = r === 0 ? 3 : R.int(run, 3, 4);
      const pool = nodeTypes(run, r);
      const row = [];
      for (let i = 0; i < w; i++) {
        // gleiche Orte direkt nebeneinander vermeiden
        let t = pool[R.int(run, 0, pool.length - 1)];
        if (i > 0 && row[i - 1].t === t) t = pool[R.int(run, 0, pool.length - 1)];
        row.push({ t, next: [] });
      }
      rows.push(row);
    }
    // Ende des Kapitels: Bösewicht der kleinen Insel oder Boss des Meeres
    if (ch === 0 && here && here.villain) rows.push([{ t: 'elite', who: here.villain, gate: true, next: [] }]);
    else rows.push([{ t: 'boss', next: [] }]);
    // Allererster Ort: mindestens ein Kampf
    if (run.step === 0 && !rows[0].some(n => n.t === 'battle')) rows[0][1].t = 'battle';
    // Seltener Raid ab dem zweiten Meer, auf der großen Insel
    if (isl >= 1 && ch === 1 && !run.raidIslands.includes(isl) && R.float(run) < (run.hunt && C.hunt ? C.hunt.raidChance : C.raidChance)) {
      const r = R.int(run, 0, per - 2);
      rows[r][R.int(run, 0, rows[r].length - 1)].t = 'raid';
    }
    // Kopfgeldjäger-Orte: Bösewichte dieser Insel, sonst einer aus diesem Meer
    const gate = here && here.villain;
    const local = ((here && here.villains) || []).filter(v => v !== gate);
    const seaId = GL.data.seaOf(run, isl).id;
    const seaPool = (GL.data.hunted || []).filter(h => (h.sea || (GL.data.islands[h.island] || {}).id) === seaId && h.id !== gate).map(h => h.id);
    const pool = local.length ? local : seaPool;
    let pi = R.int(run, 0, Math.max(0, pool.length - 1));
    rows.forEach(row => row.forEach(n => {
      if (n.t !== 'elite' || n.who) return;
      if (pool.length) { n.who = pool[pi % pool.length]; pi++; }
    }));
    // Wege: jeder Ort führt zum nächstgelegenen Ort darüber, manchmal auch zu einem Nachbarn
    for (let r = 0; r < rows.length - 1; r++) {
      const a = rows[r], b = rows[r + 1];
      const pos = (i, w) => (w === 1 ? 0.5 : i / (w - 1));
      a.forEach((n, i) => {
        const j = Math.round(pos(i, a.length) * (b.length - 1));
        n.next.push(j);
        if (b.length > 1 && R.float(run) < 0.75) {
          const k = j + (R.float(run) < 0.5 ? -1 : 1);
          if (k >= 0 && k < b.length) n.next.push(k);
        }
      });
      // Jeder Ort muss erreichbar sein
      b.forEach((_, j) => {
        if (a.some(n => n.next.includes(j))) return;
        let best = 0, bd = Infinity;
        a.forEach((n, i) => { const d = Math.abs(pos(i, a.length) - pos(j, b.length)); if (d < bd) { bd = d; best = i; } });
        a[best].next.push(j);
      });
      a.forEach(n => { n.next = [...new Set(n.next)].sort((x, y) => x - y); });
    }
    const names = here ? here.places.concat([here.lair || here.name]) : [];
    return { rows, at: null, path: [], stops: rows.map((_, r) => names[r] || null) };
  }

  function genOptions(run) {
    const pos = rowIdx(run);
    if (pos === 0 || !run.chart) run.chart = genChart(run);
    const ch = run.chart;
    const cols = (pos === 0 || ch.at == null)
      ? ch.rows[pos].map((_, i) => i)
      : ch.rows[pos - 1][ch.at].next;
    // Orte, die gerade nicht gehen, werden zu Kämpfen (Crew voll, keine Schätze mehr)
    cols.forEach(c => {
      const n = ch.rows[pos][c];
      if (n.t === 'recruit' && run.crew.length >= crewLimit(run)) n.t = 'battle';
      if (n.t === 'treasure' && !freeRelics(run).length) n.t = 'battle';
    });
    run.optCols = cols.slice();
    return cols.map(c => ch.rows[pos][c].t);
  }

  // Summe aller Kopfgeld-Stufen bis zur gewählten
  function heatMods(level) {
    const out = { enemyHp: 0, enemyAtk: 0, bossAtk: 0, bossHp: 0, enemySpd: 0, eliteMult: 0, bossEscort: 0, winHeal: 0, restHeal: 0 };
    (GL.data.heat || []).filter(h => h.lvl <= level).forEach(h => {
      Object.keys(h.mod).forEach(k => { out[k] += h.mod[k]; });
    });
    return out;
  }

  // Anderer Spieler als kleiner Zwischenboss: auf dein Level skaliert und etwas abgeschwächt
  function makeRival(run, rv) {
    const C = GL.config, g = C.grunt, H = run.H || heatMods(0);
    const level = (run.step + (run.loopSteps || 0)) * C.enemyScale;
    const RV = C.rival || { hp: 1.05, atk: 0.9, max: 4 };
    const n = Math.max(2, Math.min(RV.max, 1 + Math.floor((level + 1) / 2) + 1));
    const team = rv.team.filter(t => t && (t.id === 'self' || byId(GL.data.crew, t.id))).slice(0, n);
    return team.map((t, i) => {
      const d = t.id === 'self' ? { type: t.type || 'kraft', spd: 5 } : byId(GL.data.crew, t.id);
      const max = Math.round((g.hpBase + level * g.hpPerLevel) * RV.hp * (i === 0 ? 1.25 : 1) * (1 + H.enemyHp));
      const e = { id: t.id === 'self' ? 'rival' : t.id, type: d.type, hp: max, max,
        atk: Math.round((g.atkBase + level * g.atkPerLevel) * RV.atk * (1 + H.enemyAtk)), spd: Math.min(9, d.spd || 5) + H.enemySpd };
      if (i === 0) { e.mini = true; e.name = String(rv.name || 'Pirat').slice(0, 24); }
      if (t.id === 'self') { e.name = String(rv.name || 'Pirat').slice(0, 24); e.def = { id: 'rival', name: e.name, type: e.type, look: t.look || { hair: '#3a2a1a', skin: '#f2c9a0', shirt: '#7a3a3a', pants: '#2a2a3a', hat: 'band', hatColor: '#2a2a2a' } }; }
      return e;
    });
  }
  function makeEnemies(run, kind, who, gate) {
    const C = GL.config;
    const g = C.grunt;
    const H = run.H || heatMods(0);
    const level = (run.step + (run.loopSteps || 0)) * C.enemyScale;
    const mult = (kind === 'elite' ? (gate && islandIndex(run) === 0 ? 1 : C.eliteMult) + H.eliteMult : 1) * (gate ? C.gateMult : 1);

    let boss = kind === 'boss' ? currentBoss(run) : null;
    if (kind === 'raid') {
      const rare = GL.data.raids.filter(r => r.rare), normal = GL.data.raids.filter(r => !r.rare);
      const pool = rare.length && R.float(run) < (C.rareRaidChance || 0) ? rare : normal;
      boss = pool[R.int(run, 0, pool.length - 1)];
      const target = run.hunt && GL.data.raids.find(r => r.id === run.hunt);
      if (target) boss = target;
    }
    let count;
    if (boss) count = boss.escort + H.bossEscort;
    else if (gate) count = 2 + Math.min(2, islandIndex(run));   // Bösewicht der Insel + Gefolge (wächst pro Meer)
    else count = Math.min(C.maxGrunts, 1 + Math.floor((level + 1) / 2)) + (kind === 'elite' ? 1 : 0);

    const enemies = [];
    for (let i = 0; i < count; i++) {
      const sea = islandIndex(run);
      let gp = GL.data.grunts.filter(x => !x.seas || x.seas.includes(Math.min(sea, 2)));
      if (run.mood === 'tierzeit') gp = gp.concat(gp.filter(x => x.art), gp.filter(x => x.art));
      const type = gp[R.int(run, 0, gp.length - 1)];
      const moodHp = run.mood === 'goldrausch' ? 1.08 : run.mood === 'tierzeit' && type.art ? 0.9 : run.mood === 'kopfgeld' && kind === 'elite' ? 1.1 : 1;
      const max = Math.round((g.hpBase + level * g.hpPerLevel) * mult * (1 + H.enemyHp) * moodHp);
      enemies.push({
        id: type.id, type: type.type, hp: max, max,
        atk: Math.round((g.atkBase + level * g.atkPerLevel) * mult * (1 + H.enemyAtk)),
        spd: Math.max(1, R.int(run, g.spdMin, g.spdMax) + H.enemySpd - (run.mood === 'flaute' ? 1 : 0) + ((twistOf(run) || {}).foeSpd || 0))
      });
    }
    specialize(run, enemies, level);
    // Kopfgeld-Ziel ersetzt den zusätzlichen Gegner des Kopfgeldjäger-Kampfs
    const target = kind === 'elite' && who ? byId(GL.data.hunted, who) : null;
    if (target) {
      enemies.pop();
      const max = Math.round((g.hpBase + level * g.hpPerLevel) * mult * target.hpX * (1 + H.enemyHp));
      enemies.unshift({
        id: target.id, type: target.type, mini: true, hp: max, max,
        atk: Math.round((g.atkBase + level * g.atkPerLevel) * mult * target.atkX * (1 + H.enemyAtk)),
        spd: target.spd + H.enemySpd
      });
    }
    if (boss) {
      // Bosskämpfe dauern länger, je weiter man kommt (mehr Leben, etwas weniger Angriff: länger mitfiebern, nicht unfairer)
      const BF = C.bossFight || { hp: 0, hpPerSea: 0, atk: 1 };
      const len = 1 + BF.hp + BF.hpPerSea * islandIndex(run);
      const hp = Math.round(boss.hp * (1 + H.enemyHp + H.bossHp) * len);
      enemies.unshift({
        id: boss.id, type: boss.type, boss: true, raid: !!boss.raid, hp, max: hp,
        atk: Math.round(boss.atk * (1 + H.enemyAtk + H.bossAtk) * BF.atk), spd: boss.spd + H.enemySpd
      });
    }
    // Gegnerwellen: normale Kämpfe ab einer bestimmten Etappe bekommen Nachschub (Welle 2), Raids dauern länger
    const W = C.waves;
    const waveOn = W && !gate && ((kind === 'battle' || kind === 'elite') ? !boss && (run.step || 0) >= (W.fromStep || 2) : kind === 'raid');
    if (waveOn) {
      const sea = islandIndex(run);
      const n2 = kind === 'raid' ? (W.raidExtra || 2) : (W.extra || 2);
      if (kind === 'raid') enemies.forEach(e => { if (e.boss) { e.max = e.hp = Math.round(e.max * (W.raidHp || 1)); } });
      let gp = GL.data.grunts.filter(x => !x.seas || x.seas.includes(Math.min(sea, 2)));
      for (let i = 0; i < n2; i++) {
        const type = gp[R.int(run, 0, gp.length - 1)];
        const elite = i === 0 && (sea >= (W.eliteFromSea || 1) || kind === 'elite' || kind === 'raid');
        const hpM = (W.hp || 0.8) * (elite ? (W.eliteHp || 1.4) : 1), atkM = (W.atk || 0.9) * (elite ? (W.eliteAtk || 1.2) : 1);
        const max = Math.max(1, Math.round((g.hpBase + level * g.hpPerLevel) * (kind === 'raid' ? C.eliteMult : 1) * (1 + H.enemyHp) * hpM));
        enemies.push({
          id: type.id, type: type.type, hp: max, max, wave: 2, elite2: elite || undefined,
          atk: Math.max(1, Math.round((g.atkBase + level * g.atkPerLevel) * (kind === 'raid' ? C.eliteMult : 1) * (1 + H.enemyAtk) * atkM)),
          spd: Math.max(1, R.int(run, g.spdMin, g.spdMax) + H.enemySpd + (elite ? 1 : 0) - (run.mood === 'flaute' ? 1 : 0) + ((twistOf(run) || {}).foeSpd || 0))
        });
      }
    }
    // Endlos-Modus: jede Runde deutlich stärker (auch Bosse, die sonst feste Werte haben)
    // Endlos-Fahrt in späteren Meern: die Crew startet ohne Schätze aus den Vor-Meeren, daher etwas leichter
    if (run.endlessSea) {
      const ease = (C.endless.seaEase || [])[run.endlessSea] || 1;
      enemies.forEach(e => { e.max = e.hp = Math.round(e.max * ease); e.atk = Math.round(e.atk * ease); });
    }
    if (run.loop) {
      const E = C.endless || { hp: 0.45, atk: 0.3 };
      enemies.forEach(e => {
        e.max = e.hp = Math.round(e.max * (1 + E.hp * run.loop));
        e.atk = Math.round(e.atk * (1 + E.atk * run.loop));
        e.spd += Math.min(3, run.loop);
      });
    }
    return enemies;
  }

  // Macht aus einigen normalen Gegnern besondere Gegner (Heiler, Tank, Schütze …)
  function specialize(run, enemies, level) {
    const F = GL.config.foeKinds, kinds = GL.data.foeKinds || [];
    if (!F || !kinds.length || run.step < (F.fromStep || 0)) return;
    const sea = islandIndex(run);
    const pool = kinds.filter(k => sea >= (k.from || 0));
    const chance = Math.min(F.cap + 0.1, Math.min(F.cap, F.base + F.perSea * sea) + ((twistOf(run) || {}).foeKinds || 0));
    let n = 0;
    enemies.forEach(e => {
      if (n >= F.max || !pool.length || R.float(run) >= chance) return;
      const total = pool.reduce((s, k) => s + k.w, 0);
      let r = R.float(run) * total, k = pool[0];
      for (const x of pool) { r -= x.w; if (r < 0) { k = x; break; } }
      n++;
      e.kind = k.key; e.name = k.name;
      e.max = e.hp = Math.max(1, Math.round(e.max * k.hpX));
      e.atk = Math.max(1, Math.round(e.atk * k.atkX));
      if (k.ability) { e.ability = k.ability; e.power = k.power ? k.power(level) : 0; }
      if (k.mods) e.mods = Object.assign({}, k.mods);
      if (k.status) e.status = Object.assign({}, k.status, k.statusValue ? { value: k.statusValue(level) } : {});
    });
    // Tanks stellen sich nach vorn
    enemies.sort((a, b) => (b.kind === 'schild') - (a.kind === 'schild'));
  }

  function heal(run, share) {
    run.crew.forEach(u => {
      if (u.hp > 0) u.hp = Math.min(u.max, u.hp + Math.ceil(u.max * share));
    });
  }

  function applyEffect(run, e) {
    const front = run.crew.find(u => u.hp > 0) || run.crew[0];
    if (e.type === 'buffFront' && !front) return;
    const buff = (u, stat, v) => {
      if (stat === 'hp') { u.max += v; if (u.hp > 0) u.hp += v; }
      else u[stat] += v;
    };
    if (e.type === 'buffAll') { run.mod[e.stat] += e.value; run.crew.forEach(u => buff(u, e.stat, e.value)); }
    if (e.type === 'buffFront') buff(front, e.stat, e.value);
    if (e.type === 'crit') run.crit += e.value;
    if (e.type === 'healAll') run.crew.forEach(u => { if (u.hp > 0) u.hp = u.max; });
    if (e.type === 'multi') e.list.forEach(x => applyEffect(run, x));
  }

  function advance(run) {
    // Endlos-Fahrt: am Ende des Meeres geht es von vorn los, nur härter
    if (run.endlessSea != null && run.step + 1 >= (run.endlessSea + 1) * GL.config.stepsPerIsland) { endlessLoop(run); return; }
    run.step++;
    run.phase = 'map';
    run.pool = [];
    run.pending = null;
    // Neues Insel-Kapitel: erst den Kurs wählen
    if (rowIdx(run) === 0) { endEpisode(run); openCourse(run); return; }
    run.options = genOptions(run);
    // Zwischen-Event mit der Crew: einmal pro Insel-Kapitel sicher in der Reihe vor dem Bösewicht
    const CE = GL.data.crewEvents || [], rI = rowIdx(run), chap = run.step - rI;
    // Folge: Teil 2 unterwegs, Teil 3 direkt vor dem Bösewicht
    if (run.epi && run.epi.chap === chap && run.epi.part < 3 && (rI === 1 || rI === GL.config.chapterSteps - 2)) { episodePart(run, rI === 1 ? 2 : 3); return; }
    if (CE.length && rI === GL.config.chapterSteps - 2 && run.ceChap !== chap) { startCrewEvent(run, chap); return; }
    // Gelegentlich ein Ereignis auf See (nicht direkt vor dem Bösewicht oder Boss)
    if (rI < GL.config.chapterSteps - 1 && R.float(run) < GL.config.eventChance) {
      if (CE.length && run.ceChap !== chap && R.float(run) < 0.35) { startCrewEvent(run, chap); return; }
      const ev = GL.data.events[R.int(run, 0, GL.data.events.length - 1)];
      run.event = { id: ev.id };
      run.phase = 'event';
    }
  }
  // ---------- Folgen: drei Teile über ein Insel-Kapitel (js/data/events3.js) ----------
  // Teil 1 nach dem Ablegen, Teil 2 unterwegs, Teil 3 vor dem Bösewicht. Entscheidungen setzen Flags,
  // Teil 3 wählt danach seine Variante. temp-Boni gelten bis zum Ende des Kapitels.
  function startEpisode(run) {
    const EP = GL.data.crewEpisodes || [];
    if (!EP.length) return false;
    if (R.float(run) >= 0.6) return false;
    run.epSeen = run.epSeen || [];
    let pool = EP.filter(e => !run.epSeen.includes(e.id));
    if (!pool.length) { run.epSeen = []; pool = EP.slice(); }
    const ep = pool[R.int(run, 0, pool.length - 1)];
    run.epSeen.push(ep.id);
    run.epi = { id: ep.id, chap: run.step - rowIdx(run), part: 0, flags: [] };
    episodePart(run, 1);
    return true;
  }
  function episodePart(run, n) {
    const ep = (GL.data.crewEpisodes || []).find(e => e.id === run.epi.id);
    if (!ep) { run.epi = null; return; }
    let id = `ep-${ep.id}-${n}`;
    if (n === 3) { const v = ep.third.find(x => x.need && run.epi.flags.includes(x.need)) || ep.third.find(x => !x.need); id = v ? v.id : null; }
    if (!id || !(GL.data.crewEvents || []).some(e => e.id === id)) { run.epi.part = n; return; }
    run.epi.part = n;
    run.ceChap = run.epi.chap;   // kein zusätzliches Zwischen-Event in diesem Kapitel
    const alive = run.crew.filter(u => u.hp > 0);
    const a = (alive[0] || run.crew[0] || {}).id || 'ruffy';
    const others = alive.filter(u => u.id !== a);
    const b = others.length ? others[R.int(run, 0, others.length - 1)].id : 'kalle';
    run.event = { id, crew: true, cast: [a, b] };
    run.phase = 'event';
  }
  // Kapitel vorbei: Folge abschließen und Boni „bis zum Ende der Insel“ zurücknehmen
  function endEpisode(run) {
    (run.epTemp || []).forEach(t => run.crew.forEach(u => {
      if (!t.ids.includes(u.uid != null ? u.uid : u.id)) return;
      if (t.stat === 'hp') { u.max = Math.max(1, u.max - t.value); u.hp = Math.min(u.hp, u.max); } else u[t.stat] = Math.max(t.stat === 'atk' || t.stat === 'spd' ? 1 : 0, u[t.stat] - t.value);
    }));
    run.epTemp = [];
    run.epi = null;
  }

  // Mini-Szene mit Kapitän (A) und jemandem aus der Crew (B), danach eine Entscheidung
  function startCrewEvent(run, chap) {
    const CE = GL.data.crewEvents;
    run.ceSeen = run.ceSeen || [];
    const ok = e => !e.ep && (!e.when || e.when(run));
    let pool = CE.filter(e => ok(e) && !run.ceSeen.includes(e.id));
    if (!pool.length) { run.ceSeen = []; pool = CE.filter(ok); }
    if (!pool.length) { run.ceSeen = []; pool = CE.slice(); }
    const ev = pool[R.int(run, 0, pool.length - 1)];
    const alive = run.crew.filter(u => u.hp > 0);
    const a = (alive[0] || run.crew[0] || {}).id || 'ruffy';
    const others = alive.filter(u => u.id !== a);
    const b = others.length ? others[R.int(run, 0, others.length - 1)].id : 'kalle';   // allein an Bord: die Zeitungsmöwe redet mit
    run.ceSeen.push(ev.id);
    run.ceChap = chap;
    run.event = { id: ev.id, crew: true, cast: [a, b] };
    run.phase = 'event';
  }

  // ---------- Ereignisse auf See ----------
  function applyOutcome(run, o, lines) {
    const C = GL.config;
    if (o.chance !== undefined) {
      const won = R.float(run) < o.chance;
      lines.push(won ? 'Glück gehabt!' : 'Pech gehabt.');
      return applyOutcome(run, won ? o.win : o.lose, lines);
    }
    if (o.berry) { run.berry += o.berry; lines.push(`${o.berry > 0 ? '+' : ''}${o.berry} Berry`); }
    if (o.gold) { run.gold = Math.max(0, (run.gold || 0) + o.gold); lines.push(`${o.gold > 0 ? '+' : ''}${o.gold} Gold`); }
    if (o.heal) { heal(run, o.heal); lines.push(`Crew heilt ${Math.round(o.heal * 100)} %`); }
    if (o.revive) {
      const down = run.crew.filter(u => u.hp <= 0);
      down.forEach(u => { u.hp = Math.max(1, Math.ceil(u.max * o.revive)); });
      lines.push(down.length ? `${down.length === 1 ? 'Ein Gefallener steht' : down.length + ' Gefallene stehen'} mit ${Math.round(o.revive * 100)} % Leben wieder auf` : 'Niemand musste geflickt werden. Auch schön.');
    }
    if (o.hurt) {
      run.crew.forEach(u => { if (u.hp > 0) u.hp = Math.max(1, u.hp - Math.ceil(u.max * o.hurt)); });
      lines.push(`Crew verliert ${Math.round(o.hurt * 100)} % Leben`);
    }
    if (o.xp) {
      lines.push(`+${o.xp} Erfahrung für alle`);
      grantXp(run, null, run.crew.map(() => true), o.xp).forEach((x, i) => {
        if (x.to.lvl > x.from.lvl) lines.push(`${byId(GL.data.crew, run.crew[i].id).name} erreicht Level ${x.to.lvl}!`);
      });
    }
    if (o.points && run.crew[0]) { run.crew[0].points += o.points; lines.push(`Kapitän +${o.points} Statuspunkte`); }
    if (o.buffAll) { run.crew.forEach(u => { const v = o.buffAll.value; if (o.buffAll.stat === 'hp') { u.max += v; if (u.hp > 0) u.hp += v; } else u[o.buffAll.stat] += v; });   /* nur wer jetzt an Bord ist */ lines.push(`Ganze Crew +${o.buffAll.value} ${{ atk: 'Angriff', hp: 'Leben', spd: 'Tempo' }[o.buffAll.stat] || o.buffAll.stat}`); }
    if (o.crit) { run.crit = (run.crit || 0) + o.crit; lines.push(`Ganze Crew +${Math.round(o.crit * 100)} % Krit-Chance`); }
    if (o.temp) {
      // gilt bis zum Ende des Insel-Kapitels (Folgen), wird in endEpisode zurückgenommen
      const t = o.temp, ids = [];
      run.crew.forEach(u => { if (t.stat === 'hp') { u.max += t.value; if (u.hp > 0) u.hp = Math.max(1, u.hp + t.value); } else u[t.stat] += t.value; ids.push(u.uid != null ? u.uid : u.id); });
      run.epTemp = (run.epTemp || []).concat([{ stat: t.stat, value: t.value, ids }]);
      lines.push(`Bis zum Ende der Insel: Ganze Crew ${t.value > 0 ? '+' : ''}${t.value} ${{ atk: 'Angriff', hp: 'Leben', spd: 'Tempo' }[t.stat] || t.stat}`);
    }
    if (o.relic !== undefined) {
      const free = freeRelics(run);
      if (free.length) {
        const item = { id: free[R.int(run, 0, free.length - 1)], r: o.relic };
        run.relics.push(item);
        const r = GL.loot.relic(item);
        lines.push(`Schatz gefunden: ${r.name} (${GL.loot.rarityName(r.rarity) || 'Einzigartig'})`);
      } else { run.berry += 40; lines.push('+40 Berry'); }
    }
    if (o.pick) {
      if (o.pick === 'recruit' && run.crew.length >= crewLimit(run)) {
        run.berry += 20; lines.push('Kein Platz an Bord. +20 Berry als Dank');
      } else {
        run.fromEvent = true;
        if (o.pick === 'recruit') {
          openShop(run);
          run.shopFree = true;   // Schiffbrüchiger: der erste Kauf ist gratis
        } else if (o.pick === 'fruit') { run.pool = fruitPool(run); run.phase = 'fruit'; }
        else openTreasure(run);
      }
    }
  }

  // Schatzauswahl, oder Teufelsfrüchte, falls alle Schätze schon gefunden sind.
  // elite = bessere Chancen auf seltene Beute
  function openTreasure(run, elite) {
    const C = GL.config;
    const free = freeRelics(run);
    if (free.length) {
      run.pool = R.sample(run, free, choices(run)).map(id => ({ id, r: GL.loot.rollRarity(run, elite) }));
      run.phase = 'treasure';
    } else {
      run.pool = fruitPool(run, elite);
      run.phase = 'fruit';
    }
  }

  // ---------- Ausrüstung ----------
  // Fertige Werte eines Gegenstands (Seltenheit r, Schmiede-Stufe lvl)
  function itemStats(it) {
    const def = byId(GL.data.items, it.id);
    if (!def) return {};
    const out = {};
    Object.keys(def.stats).forEach(k => { out[k] = def.stats[k][Math.max(0, Math.min(3, it.r))]; });
    Object.keys(def.up || {}).forEach(k => { out[k] = (out[k] || 0) + def.up[k] * (it.lvl || 0); });
    Object.keys(out).forEach(k => { out[k] = Math.round(out[k] * 100) / 100; });
    return out;
  }
  function dropItem(run, chance, minR) {
    if (R.float(run) >= chance) return null;
    const def = GL.data.items[R.int(run, 0, GL.data.items.length - 1)];
    let r = GL.loot.rollRarity(run, true);
    if (minR != null) r = Math.max(r, minR);
    run.itemSeq = (run.itemSeq || 0) + 1;
    const it = { uid: 'i' + run.seed.toString(36) + '-' + run.itemSeq, id: def.id, r, lvl: 0, isNew: true };
    run.items.push(it);
    run.lastItem = it.uid;
    autoEquip(run);
    return it;
  }
  // Freie Ausrüstung automatisch an Crewmitglieder ohne Ausrüstung geben:
  // Schutz (Leben/Rüstung) an die vorderste Figur, Angriff an die stärkste. Umhängen geht weiter per Hand.
  function autoEquip(run) {
    if (run.autoEquip === false) return;
    const worn = new Set(run.crew.map(u => u.item).filter(Boolean));
    const free = run.items.filter(it => !worn.has(it.uid)).sort((a, b) => b.r - a.r || (b.lvl || 0) - (a.lvl || 0));
    free.forEach(it => {
      const open = run.crew.filter(u => !u.item && u.hp > 0);
      if (!open.length) return;
      const st = itemStats(it);
      const defensive = (st.hp || 0) + (st.armor || 0) * 4 > (st.atk || 0) * 2 + (st.dmgPct || 0) * 40 + (st.crit || 0) * 30;
      const u = defensive ? open[0] : open.slice().sort((a, b) => b.atk - a.atk)[0];
      u.item = it.uid; setItemHp(u, it, 1);
      it.auto = u.id;
    });
  }
  // Leben aus Ausrüstung gilt dauerhaft, solange sie angelegt ist
  function setItemHp(u, it, sign) {
    const hp = it ? (itemStats(it).hp || 0) : 0;
    if (!hp) return;
    u.max += sign * hp;
    u.hp = Math.max(sign > 0 ? u.hp + hp : Math.min(u.hp, u.max), u.hp > 0 ? 1 : 0);
    if (u.hp > u.max) u.hp = u.max;
  }
  // Anlegen: { type: 'equip', index, uid } (uid leer = ablegen)
  function equip(run, a) {
    const u = run.crew[a.index];
    if (!u || !SWAP_PHASES.includes(run.phase)) return false;
    const it = a.uid ? run.items.find(x => x.uid === a.uid) : null;
    if (a.uid && !it) return false;
    // vom bisherigen Träger abnehmen
    if (it) run.crew.forEach(o => { if (o.item === it.uid) { setItemHp(o, it, -1); o.item = null; } });
    const old = u.item ? run.items.find(x => x.uid === u.item) : null;
    if (old) setItemHp(u, old, -1);
    u.item = it ? it.uid : null;
    if (it) { setItemHp(u, it, 1); it.isNew = false; }
    return true;
  }

  // ---------- Artefakte (Schatzkammer) ----------
  // Besiegte Bosse, Raids und Kopfgeld-Ziele lassen manchmal ein Artefakt fallen.
  function rollTrophy(run, srcId, chance) {
    const art = (GL.data.artifacts || []).find(a => a.from.includes(srcId));
    if (!art || R.float(run) >= chance) return;
    run.trophies = run.trophies || [];
    run.trophies.push(art.id);
  }

  // Wert eines Artefakts auf Stufe lvl (1 bis 5)
  function artValue(art, lvl) {
    return art.per[Math.max(0, Math.min(art.per.length, lvl) - 1)];
  }

  // Begleiter: nach dem Sieg über Bösewicht oder Boss einer Insel kann ihr Tier an Bord springen.
  // Ohne Zufallszahl aus dem Run (Hash aus Seed + Insel), damit Kämpfe und Replays gleich bleiben.
  function petCheck(run) {
    const isl = chapterIsland(run);
    const pet = isl && (GL.data.pets || []).find(p => p.isl === isl.id);
    if (!pet) return;
    let h = (run.seed ^ 0x9e3779b9) >>> 0;
    const key = isl.id + ':' + (run.loop || 0);
    for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 2654435761) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    if ((h % 1000) / 1000 >= pet.chance) return;
    run.pets = run.pets || [];
    if (!run.pets.includes(pet.id)) run.pets.push(pet.id);
  }

  function finishBattle(run) {
    const C = GL.config;
    const b = run.battle;
    if (b.kind === 'raid') {
      const raid = b.enemies[0];
      if (!b.win) {
        // Ein verlorener Raid beendet den Run nicht: die Crew entkommt geschwächt
        run.crew.forEach(u => { u.hp = Math.max(1, Math.ceil(u.max * C.raidEscapeHp)); });
        advance(run);
        return;
      }
      run.defeated.push(raid.id);
      (run.gearSrc = run.gearSrc || []).push({ id: raid.id, sea: islandIndex(run), loop: run.loop || 0 });
      rollTrophy(run, raid.id, C.trophyChance.raid);
      // Raid-Beute (episch / legendär), nur gegen diesen Boss
      if (C.hunt && GL.data.huntFor) {
        run.loot = run.loot || [];
        GL.data.huntFor(raid.id).forEach(l => {
          const ch = l.r >= 3 ? C.hunt.legendary + (run.heat || 0) * C.hunt.legendaryPerHeat : C.hunt.epic;
          if (R.float(run) < ch) run.loot.push(l.id);
        });
      }
      const reward = byId(GL.data.raids, raid.id).reward;
      if (!run.epics.includes(reward)) run.epics.push(reward);
      heal(run, C.winHeal);
      const others = R.sample(run, GL.data.fruits.filter(f => !f.awakened).map(f => f.id), choices(run) - 1)
        .map(id => ({ id, r: GL.loot.rollRarity(run, true) }));
      run.pool = [{ id: reward, r: -1 }, ...others];
      run.phase = 'fruit';
      return;
    }
    if (!b.win) { run.phase = 'over'; return; }
    if (b.kind === 'boss') {
      run.defeated.push(b.enemies[0].id); rollTrophy(run, b.enemies[0].id, C.trophyChance.boss);
      (run.gearSrc = run.gearSrc || []).push({ id: b.enemies[0].id, sea: islandIndex(run), loop: run.loop || 0 });   // Crew-Ausrüstung (wird nach dem Run gewürfelt)
    }

    // Glücksfund: selten eine Goldtruhe mit mindestens seltener Ausrüstung und Extra-Gold
    const LC = C.luck || {};
    run.lucky = null;
    if (R.float(run) < (LC[b.kind] || 0) * (1 + (run.luck || 0) * 0.5)) {
      const it = dropItem(run, 1, R.float(run) < 0.25 ? 2 : 1);
      run.gold = (run.gold || 0) + (LC.gold || 15);
      run.lucky = { item: it ? it.uid : null, gold: LC.gold || 15, n: (run.luckyN = (run.luckyN || 0) + 1) };
    }
    const f = GL.effects.flags(run);
    // Kampfrausch nimmt nur die normale Heilung weg, Heil-Schätze (Fleischkeule) wirken weiter
    const wh = (f.noWinHeal ? 0 : C.winHeal) + f.winHeal;
    if (wh > 0) heal(run, wh * Math.max(0, 1 + (run.H ? run.H.winHeal : 0)));
    // Gefallene rappeln sich nach dem Sieg wieder auf (Medizinkoffer: deutlich mehr)
    const rv = Math.max(C.reviveAfterWin || 0, f.reviveWin || 0);
    run.revived = [];
    if (rv > 0) run.crew.forEach(u => { if (u.hp <= 0) { u.hp = Math.max(1, Math.ceil(u.max * rv)); run.revived.push(u.id); } });
    if (b.kind === 'elite' && run.pending && run.pending.who) {
      const h = byId(GL.data.hunted, run.pending.who);
      const bm = run.mood === 'kopfgeld' ? 1.5 : 1;
      run.bountyM = (run.bountyM || 0) + Math.round(h.bounty * (1 + 0.25 * (run.heat || 0)) * bm);
      run.lastBounty = { id: h.id, gain: Math.round(h.bounty * (1 + 0.25 * (run.heat || 0)) * bm) };
      run.defeated.push(h.id);
      rollTrophy(run, h.id, C.trophyChance.mini);
    }
    if (b.kind === 'elite' && run.pending && run.pending.gate) heal(run, 0.3);   // Insel befreit: kurz durchatmen
    if ((b.kind === 'elite' && run.pending && run.pending.gate) || b.kind === 'boss') petCheck(run);
    if (b.kind === 'elite') dropItem(run, C.items.dropElite);
    if (b.kind === 'boss') dropItem(run, C.items.dropBoss, 1);
    if (b.kind === 'boss') {
      const bossGain = Math.round(GL.config.bossBounty[Math.min(run.bounties, GL.config.bossBounty.length - 1)] * (1 + 0.25 * (run.heat || 0)));
      run.bountyM = (run.bountyM || 0) + bossGain;
      run.lastBounty = { id: b.enemies[0].id, gain: bossGain };
      run.bounties++;
      if (run.endlessSea == null && run.bounties >= GL.data.islands.length) { run.phase = 'win'; return; }
      run.crew.forEach(u => { u.hp = u.hp > 0 ? u.max : Math.ceil(u.max * C.reviveAfterBoss); });
      run.phase = 'awaken';
      return;
    }
    if (b.kind === 'elite') {
      openTreasure(run, true);
      return;
    }
    advance(run);
  }

  // Statuspunkt verteilen: { type: 'spend', index, stat: 'hp' | 'atk' | 'spd' }
  const SPEND_PHASES = ['course', 'map', 'prep', 'recruit', 'fruit', 'treasure', 'awaken', 'battle', 'event'];
  function spend(run, a) {
    const C = GL.config;
    const u = run.crew[a.index];
    if (!u || u.points <= 0 || !SPEND_PHASES.includes(run.phase) || !(a.stat in C.point)) return false;
    u.points--;
    if (a.stat === 'hp') { u.max += C.point.hp; if (u.hp > 0) u.hp += C.point.hp; }
    else u[a.stat] += C.point[a.stat];
    return true;
  }

  // Reihenfolge der Crew tauschen: geht jederzeit außer im laufenden Kampf
  // Crewmitglied entlassen: { type: 'dismiss', index }. Gibt einen Teil des Preises als Gold zurück.
  function dismiss(run, a) {
    const u = run.crew[a.index];
    if (!u || run.crew.length <= 1 || u.id === run.captain || !SWAP_PHASES.includes(run.phase)) return false;
    run.gold = (run.gold || 0) + sellValue(u);
    u.item = null;
    run.crew.splice(a.index, 1);
    return true;
  }

  const SWAP_PHASES = ['course', 'map', 'prep', 'recruit', 'fruit', 'treasure', 'awaken', 'event'];
  function swap(run, a) {
    const n = run.crew.length;
    if (!SWAP_PHASES.includes(run.phase)) return false;
    if (!(a.a >= 0 && a.a < n && a.b >= 0 && a.b < n) || a.a === a.b) return false;
    [run.crew[a.a], run.crew[a.b]] = [run.crew[a.b], run.crew[a.a]];
    return true;
  }

  // Endlos-Modus: nach dem Sieg weitersegeln. Alles bisher Erreichte ist schon gutgeschrieben,
  // die neue Runde beginnt wieder im ersten Meer, aber die Gegner bleiben so stark wie zuletzt und wachsen weiter.
  function endlessLoop(run) {
    const S = GL.config.score, SPI = GL.config.stepsPerIsland, base = run.endlessSea * SPI;
    run.loop = (run.loop || 0) + 1;
    run.loopScore = (run.loopScore || 0) + Math.round(((run.step + 1 - base) * S.perStep * (1 + run.endlessSea) + run.bounties * S.perBounty) * (1 + (run.heat || 0) * GL.config.heatBonus.score));
    run.loopSteps = (run.loopSteps || 0) + SPI;
    run.step = base; run.bounties = 0; run.course = []; run.alt = {};
    run.bosses = GL.data.islands.map(isl => isl.bosses[R.int(run, 0, isl.bosses.length - 1)]);
    run.crew.forEach(u => { u.hp = u.max; });
    run.gold = (run.gold || 0) + GL.config.endless.loopGold;
    run.pending = null; run.pool = [];
    run.harbor = true;
    openShop(run);
  }
  function endless(run) {
    if (run.phase !== 'win') return false;
    const S = GL.config.score;
    run.loop = (run.loop || 0) + 1;
    run.loopScore = (run.loopScore || 0) + Math.round((run.step * S.perStep + run.bounties * S.perBounty) * (1 + (run.heat || 0) * GL.config.heatBonus.score));
    run.loopSteps = (run.loopSteps || 0) + run.step;
    run.step = 0; run.bounties = 0; run.course = []; run.alt = {}; run.raidIslands = [];
    run.defeated = []; run.trophies = []; run.loot = [];
    run.stats = { dmg: 0, maxHit: 0, kos: 0, crits: 0, taken: 0, fights: 0 };
    run.bosses = GL.data.islands.map(isl => isl.bosses[R.int(run, 0, isl.bosses.length - 1)]);
    run.crew.forEach(u => { u.hp = u.max; });
    run.gold = (run.gold || 0) + GL.config.shop.startGold;
    run.pending = null; run.pool = [];
    // Zwischenhafen: Taverne vor der nächsten Runde (anheuern, entlassen, umstellen), dann Kurs setzen
    run.harbor = true;
    openShop(run);
    return true;
  }

  function handle(run, a) {
    const C = GL.config;
    if (a.type === 'endless') return endless(run);
    if (a.type === 'spend') return spend(run, a);
    if (a.type === 'swap') return swap(run, a);
    if (a.type === 'dismiss') return dismiss(run, a);
    if (a.type === 'equip') return equip(run, a);
    switch (run.phase) {
      case 'starter': {
        if (a.type !== 'pick') return false;
        const offer = run.pool[a.index];
        if (!offer) return false;
        // Erster Maat: dein Pirat ist Kapitän (vorne), der Maat kommt als Zweiter an Bord
        if (run.mateMode && run.selfOffer) {
          run.crew.push(makeMember(run, run.selfOffer));
          run.crew.push(makeMember(run, offer));
          run.mate = offer.id;
          // Der Maat will auch bezahlt werden: seine Heuer ist dein ganzes Startgold
          run.gold = 0;
        } else run.crew.push(makeMember(run, offer));
        autoEquip(run);
        run.crew[0].points += run.startPoints || 0;
        run.captain = run.crew[0].id;
        // Eigene Teufelsfrucht deines Piraten (im Profil ausgerüstet): wirkt wie eine gegessene Frucht
        if (run.captain === 'self' && run.start.self && run.start.self.fruit) {
          const sf = run.start.self.fruit, fd = byId(GL.data.fruits, sf.id);
          if (fd && !fd.awakened && !fd.unique) { applyEffect(run, GL.loot.fruit({ id: sf.id, r: Math.max(0, Math.min(1, sf.r | 0)) }).effect); run.eaten.push(sf.id); run.selfFruit = sf.id; }
        }
        run.pool = [];
        if (run.endlessSea != null) {
          // Endlos-Fahrt: direkt ins gewählte Meer, vorher im Hafen eine Crew anheuern
          run.step = run.endlessSea * C.stepsPerIsland;
          run.gold = (run.gold || 0) + C.endless.startGold + C.endless.goldPerSea * run.endlessSea;
          run.harbor = true;
          openShop(run);
          return true;
        }
        openCourse(run);
        return true;
      }

      case 'course': {
        // Kurs setzen: { type: 'pick', index } wählt die nächste Insel
        if (a.type !== 'pick') return false;
        const id = (run.courseOpts || [])[a.index];
        if (!id) return false;
        const sea = islandIndex(run);
        const base = GL.data.islands[sea];
        if (chapterIdx(run) === 0 && base.alt) {
          run.alt = run.alt || {};
          run.alt[sea] = base.alt.small.some(x => x.id === id);
        }
        run.course = run.course || [];
        run.course[sea * 2 + chapterIdx(run)] = id;
        const isl = chapterIsland(run);
        if (isl && isl.boss) run.bosses[sea] = isl.boss;
        run.courseOpts = null;
        run.phase = 'map';
        run.options = genOptions(run);
        if (startEpisode(run)) return true;
        return true;
      }

      case 'map': {
        if (a.type !== 'node') return false;
        run.notice = null;
        const node = run.options[a.index];
        if (!node) return false;
        if (run.chart && run.optCols) { run.chart.at = run.optCols[a.index]; run.chart.path.push(run.chart.at); }
        if (node === 'raid') run.raidIslands.push(islandIndex(run));
        if (node === 'battle' || node === 'elite' || node === 'boss' || node === 'raid') {
          // Gegner stehen schon vor dem Kampf fest, damit man die Reihenfolge planen kann
          const cn = run.chart && run.optCols ? run.chart.rows[rowIdx(run)][run.optCols[a.index]] : null;
          const who = node === 'elite' && cn ? cn.who : null;
          const gate = !!(cn && cn.gate);
          // Begegnung auf See: ein anderer Pirat (Crew kommt in der Aktion mit, damit das Replay gleich bleibt)
          const rv = node === 'battle' && a.rival && Array.isArray(a.rival.team) && a.rival.team.length ? a.rival : null;
          run.pending = rv ? { kind: node, rival: { name: String(rv.name || 'Pirat').slice(0, 24) }, enemies: makeRival(run, rv) }
            : { kind: node, who, gate, enemies: makeEnemies(run, node, who, gate) };
          run.phase = 'prep';
        } else if (node === 'recruit') {
          openShop(run);
        } else if (node === 'fruit') {
          run.pool = fruitPool(run);
          run.phase = 'fruit';
        } else if (node === 'treasure') {
          dropItem(run, C.items.dropTreasure);
          openTreasure(run);
        } else if (node === 'rest') {
          heal(run, (C.restHeal + (run.mood === 'flaute' ? 0.2 : 0) + (run.bonus ? run.bonus.restHeal : 0)) * Math.max(0, 1 + (run.H ? run.H.restHeal : 0)));
          run.crew.forEach(u => { if (u.hp <= 0) u.hp = Math.max(1, Math.ceil(u.max * (C.reviveAtRest || 0))); });   // Rast weckt Gefallene
          advance(run);
        }
        return true;
      }

      case 'prep': {
        // Spezialangriff an- oder abwählen (nur gegen Inselbosse und Raids, Ladung voll)
        if (a.type === 'special') {
          if (!['boss', 'raid'].includes(run.pending.kind) || (run.charge || 0) < C.specialMax) return false;
          run.pending.special = !run.pending.special;
          return true;
        }
        if (a.type === 'fight') {
          // Welle 1 kämpft sofort, Welle 2 wartet als Nachschub (gleiche Reihenfolge wie in der Anzeige)
          const all = run.pending.enemies.map(e => Object.assign({}, e));
          const enemies = all.filter(e => e.wave !== 2).concat(all.filter(e => e.wave === 2));
          const reserve = enemies.filter(e => e.wave === 2);
          const start = enemies.map(e => Object.assign({}, e));
          const crewStart = run.crew.map(u => u.hp);
          const special = !!run.pending.special;
          if (special) run.charge = 0;
          const res = GL.battle.simulate(run, run.crew, enemies.filter(e => e.wave !== 2), run.pending.kind, { special, reserve });
          // Werte für die Rangliste: Schaden, härtester Treffer, K.o.s, Krits
          const S = run.stats || (run.stats = { dmg: 0, maxHit: 0, kos: 0, crits: 0, taken: 0, fights: 0 });
          S.fights++;
          res.events.forEach(ev => {
            if (ev.k === 'hit' && ev.side === 'crew') {
              S.dmg += ev.dmg; if (ev.dmg > S.maxHit) S.maxHit = ev.dmg; if (ev.crit) S.crits++;
              if (ev.hp <= 0 && ev.dmg > 0) { S.kos++; const t = enemies[ev.to] && enemies[ev.to].type; if (t) { S.koT = S.koT || {}; S.koT[t] = (S.koT[t] || 0) + 1; } }
            }
            if (ev.k === 'ult' && ev.side === 'crew') S.ults = (S.ults || 0) + 1;
            if (ev.k === 'hit' && ev.side === 'enemy') S.taken += ev.dmg;
            if (ev.k === 'dmg' && ev.side === 'enemy') ev.list.forEach(x => { S.dmg += x.dmg; if (x.hp <= 0 && x.dmg > 0) S.kos++; });
          });
          // Siege laden den Spezialangriff auf (Kopfgeldjäger doppelt)
          if (res.win) { earnGold(run, run.pending.kind); S.won = (S.won || 0) + 1; }
          // Kopfgeld-Serie: Siege in Folge, bei denen niemand aus der Crew fällt. Ab 3 gibt es Extra-Gold.
          const fell = run.crew.some((u, k) => crewStart[k] > 0 && u.hp <= 0);
          run.streak = res.win && !fell ? (run.streak || 0) + 1 : 0;
          run.bestStreak = Math.max(run.bestStreak || 0, run.streak);
          run.streakGold = res.win && run.streak >= 3 ? (run.streak >= 6 ? 2 : 1) : 0;
          if (run.streakGold) run.gold = (run.gold || 0) + run.streakGold;
          if (res.win && run.pending.rival) { run.gold = (run.gold || 0) + (C.rival ? C.rival.gold : 12); run.rivals = (run.rivals || 0) + 1; }
          if (res.win && !special) {
            const gain = run.pending.kind === 'elite' ? 2 : run.pending.kind === 'battle' ? 1 : 0;
            run.charge = Math.min(C.specialMax, (run.charge || 0) + gain);
          }
          const before = run.crew.map(u => ({ lvl: u.lvl, xp: u.xp }));
          run.battle = {
            kind: run.pending.kind,
            special,
            enemies: start,
            enemyEnd: enemies.map(e => e.hp),
            crewStart,
            events: res.events,
            win: res.win,
            team: res.team && res.team.crew ? { f: res.team.crew.faction, name: res.team.crew.name, need: res.team.crew.need, start: res.team.crew.start || 0 } : null,
            before,
            // Erfahrung gibt es direkt nach dem Sieg, damit die Auswertung sie zeigen kann
            xp: res.win ? grantXp(run, run.pending.kind, run.crew.map(u => u.hp > 0)) : null
          };
          run.phase = 'battle';
          return true;
        }
        return false;
      }

      case 'event': {
        if (a.type !== 'pick') return false;
        const ev = run.event.crew ? byId(GL.data.crewEvents || [], run.event.id) : byId(GL.data.events, run.event.id);
        const ch = ev.choices[a.index];
        if (!ch) return false;
        const lines = [];
        run.phase = 'map';
        applyOutcome(run, ch.outcome, lines);
        if (ch.flag && run.epi) run.epi.flags.push(ch.flag);
        run.notice = { title: ev.title, text: ch.text, lines };
        run.event = null;
        return true;
      }

      case 'battle': {
        if (a.type !== 'continue') return false;
        finishBattle(run);
        return true;
      }

      case 'recruit': {
        // Kaufen: { type: 'pick', index }  Neu würfeln: { type: 'reroll' }  Weiter: { type: 'leave' }
        if (a.type === 'reroll') {
          const cost = rerollCost(run);
          if ((run.gold || 0) < cost) return false;
          run.gold -= cost;
          run.shopRolls = (run.shopRolls || 0) + 1;
          const offers = shopOffers(run), du = addDuplicate(run, offers);
          run.pool = offers.map(id => dupOffer(run, rollOffer(run, id), du));
          return true;
        }
        if (a.type === 'leave') {
          run.shopFree = false;
          if (run.harbor) { run.harbor = false; run.pool = []; openCourse(run); return true; }
          if (run.fromEvent) { run.fromEvent = false; run.phase = 'map'; run.pool = []; return true; }
          advance(run);
          return true;
        }
        if (a.type !== 'pick') return false;
        const offer = run.pool[a.index];
        if (!offer || offer.sold) return false;
        // Zusammenlegen braucht keinen freien Platz
        const twin = offer.dup ? run.crew.find(u => u.id === offer.id && (u.stars || 1) === offer.stars && offer.stars < 3) : null;
        if (!twin && (run.crew.length >= crewLimit(run) || run.crew.some(u => u.id === offer.id))) return false;
        const price = offerPrice(run, offer);
        if ((run.gold || 0) < price) return false;
        run.gold -= price;
        run.shopFree = false;
        offer.sold = true;
        if (twin) { mergeMember(run, twin); return true; }
        run.crew.push(makeMember(run, offer)); autoEquip(run);
        return true;
      }
      case 'fruit':
      case 'treasure':
      case 'awaken': {
        // Überspringen (Frucht/Schatz): kleine Goldbelohnung statt Auswahl
        if (a.type === 'skip' && run.phase !== 'awaken') {
          run.gold = (run.gold || 0) + (C.skipGold || 10);
          if (run.fromEvent) { run.fromEvent = false; run.phase = 'map'; run.pool = []; return true; }
          advance(run);
          return true;
        }
        if (a.type !== 'pick') return false;
        if (run.phase === 'awaken') {
          const u = run.crew[a.index];
          if (!u) return false;
          u.atk += C.awaken.atk;
          u.max += C.awaken.hp;
          u.hp += C.awaken.hp;
        } else {
          const item = run.pool[a.index];
          if (!item) return false;
          if (run.phase === 'recruit') { run.crew.push(makeMember(run, item)); autoEquip(run); }
          else if (run.phase === 'treasure') run.relics.push(item);
          else { applyEffect(run, GL.loot.fruit(item).effect); run.eaten.push(item.id); }
        }
        // Auswahl aus einem Ereignis: zurück zur Route, ohne weiterzusegeln
        if (run.fromEvent) { run.fromEvent = false; run.phase = 'map'; run.pool = []; return true; }
        advance(run);
        return true;
      }
    }
    return false;
  }

  // Skilltree-Boni säubern (nur bekannte Zahlen, gedeckelt), damit Replays und fremde Spielstände sicher sind
  function skillBonus(raw) {
    const MAX = { hp: 20, atk: 3, spd: 2, restHeal: 0.5, winHeal: 0.2, luck: 1, xp: 0.5, choices: 1, gold: 8, points: 2, cannon: 10, berry: 0.3, rankXp: 0.3, bond: 0.5 };
    const out = {};
    if (raw && typeof raw === 'object') Object.keys(MAX).forEach(k => { const v = Number(raw[k]); if (isFinite(v) && v > 0) out[k] = Math.min(MAX[k], v); });
    return out;
  }

  GL.run = {
    // profile = dauerhafte Freischaltungen { unlocked: [...], epics: [...] }.
    // Wird im Run gespeichert, damit ein Replay genau gleich abläuft.
    // profile.upgrades = Werft-Stufen { rumpf: 2, ... }, profile.gear = mitgenommene Ausrüstung [ids]
    create(seed, profile) {
      const s = seed === undefined ? GL.rng.newSeed() : seed >>> 0;
      const p = profile || {};
      const up = p.upgrades || {};
      const run = {
        version: GL.config.saveVersion,
        seed: s,
        rng: s,
        step: 0,
        phase: 'starter',
        mod: { atk: upgradeTotal(up, 'atk'), hp: upgradeTotal(up, 'hp'), spd: upgradeTotal(up, 'spd') },
        crit: 0,
        bounties: 0,
        relics: [],
        eaten: [],
        berry: 0,          // Berry aus Ereignissen, kommt am Ende dazu
        event: null,
        notice: null,
        fromEvent: false,
        defeated: [],
        raidIslands: [],
        charge: 0,
        items: (p.items || []).map(x => ({ uid: x.uid, id: x.id, r: x.r, lvl: x.lvl || 0, carried: true })),   // Ausrüstung im Run
        itemSeq: 0,
        gold: GL.config.shop.startGold,   // Gold für die Taverne (nur in diesem Run)
        shopRolls: 0,
        bountyM: 0,
        trophies: [],
        stats: { dmg: 0, maxHit: 0, kos: 0, crits: 0, taken: 0, fights: 0 },      // in diesem Run gefundene Artefakte (ids)
        arts: (p.arts || []).map(a => ({ id: a.id, lvl: a.lvl })),   // ausgerüstete Artefakte
        unlocked: (p.unlocked || []).slice(),
        epics: (p.epics || []).slice(),
        hunt: p.hunt || null,
        altOpen: !!p.altOpen,
        altOpen1: !!p.altOpen1,
        buddy: typeof p.buddy === 'string' && p.buddy !== 'self' ? p.buddy : null,   // Vertrauter aus der Stammcrew
        endlessSea: Number.isInteger(p.endlessSea) && p.endlessSea >= 0 && p.endlessSea < GL.data.islands.length ? p.endlessSea : null,
        alt: {},
        loot: [],
        // Stand der Freischaltungen beim Start, für ein exaktes Replay:
        // GL.run.replay(run.seed, run.actions, run.start)
        start: {
          unlocked: (p.unlocked || []).slice(), epics: (p.epics || []).slice(),
          upgrades: Object.assign({}, up), gear: Array.isArray(p.gear) ? p.gear.slice() : [], heat: p.heat || 0, hunt: p.hunt || null, altOpen: !!p.altOpen, altOpen1: !!p.altOpen1, buddy: typeof p.buddy === 'string' && p.buddy !== 'self' ? p.buddy : null,
          endlessSea: Number.isInteger(p.endlessSea) ? p.endlessSea : null,
          arts: (p.arts || []).map(a => ({ id: a.id, lvl: a.lvl })),
          items: (p.items || []).map(x => ({ uid: x.uid, id: x.id, r: x.r, lvl: x.lvl || 0 })),
          skills: skillBonus(p.skills)
        },
        bonus: {
          restHeal: upgradeTotal(up, 'restHeal'), choices: upgradeTotal(up, 'choices'),
          xp: upgradeTotal(up, 'xp')
        },
        luck: upgradeTotal(up, 'luck'),
        heat: Math.max(0, Math.min(p.heat || 0, (GL.data.heat || []).length)),
        startPoints: 0,
        captain: null,
        vivreUsed: false,
        crew: [],
        course: [],        // gewählte Inseln pro Kapitel (ids aus islands.js)
        courseOpts: null,
        options: [],
        pool: [],
        pending: null,
        battle: null,
        actions: []
      };
      run.H = heatMods(run.heat);
      // Laune der See: ohne Zufallszug aus dem Seed, damit Replays gleich bleiben
      const M = GL.config.moods || [];
      const moodId = p.mood !== undefined ? p.mood : (M.length && ((p.stats && p.stats.runs) || 0) >= 2 && run.endlessSea == null ? M[s % M.length].id : null);
      run.mood = moodId; run.start.mood = moodId;
      if (moodId === 'schatzfieber') run.luck = (run.luck || 0) + 0.5;
      if (moodId === 'rueckenwind') run.mod.spd += 1;
      // Mitgenommene Ausrüstung anwenden
      (Array.isArray(p.gear) ? p.gear : []).forEach(id => {
        const g = byId(GL.data.gear, id);
        if (!g) return;
        const x = g.grant;
        if (x.relic && !run.relics.some(r => r.id === x.relic)) run.relics.push({ id: x.relic, r: x.r });
        if (x.hp) run.mod.hp += x.hp;
        if (x.luck) run.luck = Math.max(run.luck, x.luck);
        if (x.points) run.startPoints += x.points;
        if (x.gold) run.gold = (run.gold || 0) + x.gold;
        if (x.ult) run.ultBonus = (run.ultBonus || 0) + x.ult;
        if (x.atk) run.mod.atk += x.atk;
        if (x.spd) run.mod.spd += x.spd;
        if (x.fruit) { applyEffect(run, GL.loot.fruit({ id: x.fruit, r: x.r }).effect); run.eaten.push(x.fruit); }
      });
      // Gemütlichkeit (Skilltree): kleine Startboni, Rest wirkt über run.sk (Kanone, Sieg-Heilung, Berry, Rang-EP, Vertrautheit)
      (sk => {
        run.sk = sk;
        run.mod.hp += sk.hp || 0; run.mod.atk += sk.atk || 0; run.mod.spd += sk.spd || 0;
        run.bonus.restHeal += sk.restHeal || 0; run.bonus.choices += sk.choices || 0; run.bonus.xp += sk.xp || 0;
        run.luck = (run.luck || 0) + (sk.luck || 0);
        run.gold = (run.gold || 0) + (sk.gold || 0);
        run.startPoints += sk.points || 0;
      })(run.start.skills);
      // Ausgerüstete Artefakte: Start-Wirkungen (Kampfwerte stehen in effects.js)
      run.arts.forEach(a => {
        const art = byId(GL.data.artifacts || [], a.id);
        if (!art) return;
        const v = artValue(art, a.lvl);
        if (art.start === 'hp') run.mod.hp += v;
        if (art.start === 'charge') run.charge = Math.min(GL.config.specialMax, run.charge + v);
      });
      // Pro Insel einen der möglichen Bosse auslosen
      run.bosses = GL.data.islands.map(isl => isl.bosses[R.int(run, 0, isl.bosses.length - 1)]);
      // Eigener Pirat steht als erster Kapitän zur Wahl
      if (p.self) { registerSelf(p.self); run.start.self = p.self; }
      // Nicht alle auf einmal: dein eigener Pirat plus eine kleine, zufällige Auswahl aus allen freigeschalteten Kapitänen
      const capPool = GL.config.starters.concat(run.unlocked.filter(id => byId(GL.data.crew, id) && !GL.config.starters.includes(id)));
      // Du bist immer selbst Kapitän: statt Kapitänswahl gibt es einen „Ersten Maat“ aus 3 Angeboten (kein Neu-Würfeln).
      // Ohne eigenen Piraten (z. B. Wettfahrt mit festem Kapitän, alte Spielstände) bleibt die alte Kapitänswahl.
      if (p.self && !p.classicCaptain) {
        run.mateMode = true;
        run.selfOffer = rollOffer(run, 'self');
        const mates = R.sample(run, capPool, Math.min(capPool.length, GL.config.captainChoices || 3));
        if (run.buddy && capPool.includes(run.buddy) && !mates.includes(run.buddy)) mates.push(run.buddy);
        run.pool = mates.map(id => rollOffer(run, id));
        return run;
      }
      const caps = (p.self ? ['self'] : []).concat(R.sample(run, capPool, Math.min(capPool.length, GL.config.captainChoices || 3)));
      // Vertrauter: steht zusätzlich als Kapitän zur Wahl (nur wenn freigeschaltet)
      if (run.buddy && capPool.includes(run.buddy) && !caps.includes(run.buddy)) caps.push(run.buddy);
      run.pool = caps.map(id => rollOffer(run, id));
      return run;
    },

    // Führt eine Aktion aus. Gibt false zurück, wenn sie gerade nicht erlaubt ist.
    act(run, action) {
      const ok = handle(run, action);
      if (ok) run.actions.push(action);
      return ok;
    },

    // Spielt einen Run aus Seed + Aktionen nach (z. B. auf einem Server).
    replay(seed, actions, profile) {
      const run = GL.run.create(seed, profile);
      for (const a of actions) {
        if (!GL.run.act(run, a)) return null;
      }
      return run;
    },

    score(run) {
      const S = GL.config.score;
      const st = run.endlessSea != null ? run.step - run.endlessSea * GL.config.stepsPerIsland : run.step;
      return (run.loopScore || 0) + Math.round((st * S.perStep + run.bounties * S.perBounty + (run.bountyM || 0) * (S.perMio || 0)) * (1 + (run.heat || 0) * GL.config.heatBonus.score));
    },

    heatMods,

    isFinished(run) {
      return run.phase === 'over' || run.phase === 'win';
    },

    boss: currentBoss,
    itemStats,
    registerSelf,
    offerPrice, sellValue, rerollCost,
    artValue,
    islandIndex,

    // Name der aktuellen Station (Insel aus der Serie)
    stopName(run, row) {
      const here = chapterIsland(run);
      if (!here) return GL.data.seaOf(run, islandIndex(run)).name;
      const r = row == null ? rowIdx(run) : row;
      if (r >= GL.config.chapterSteps - 1) return here.lair || here.name;
      return here.places[r] || here.name;
    },
    chapterIsland,
    twist: twistOf,
    chapterIdx,
    rowIdx,

    island(run) {
      return GL.data.seaOf(run, islandIndex(run));
    },

    totalSteps,
    crewLimit,
    xpNeed,
    upgradeTotal,

    // Vorschau, wie ein Angebot als Crewmitglied aussähe (für die Anzeige)
    previewMember: makeMember,

    // Grobe Stärke-Schätzung eines Routen-Knotens ohne Zufall (für die Gefahren-Anzeige)
    estimate(run, kind) {
      const C = GL.config;
      const g = C.grunt;
      const level = (run.step + (run.loopSteps || 0)) * C.enemyScale;
      const H = run.H || heatMods(0);
      const mult = kind === 'elite' ? C.eliteMult + H.eliteMult : 1;
      let hp = 0, atk = 0, count;
      let boss = kind === 'boss' ? currentBoss(run) : null;
      if (kind === 'raid') {
        boss = { hp: 0, atk: 0, escort: 1 };
        GL.data.raids.forEach(r => { boss.hp += r.hp / GL.data.raids.length; boss.atk += r.atk / GL.data.raids.length; });
      }
      if (boss) { count = boss.escort + H.bossEscort; hp += boss.hp * (1 + H.enemyHp + H.bossHp); atk += boss.atk * (1 + H.enemyAtk + H.bossAtk); }
      else count = Math.min(C.maxGrunts, 1 + Math.floor((level + 1) / 2)) + (kind === 'elite' ? 1 : 0);
      hp += count * (g.hpBase + level * g.hpPerLevel) * mult * (1 + H.enemyHp);
      atk += count * (g.atkBase + level * g.atkPerLevel) * mult * (1 + H.enemyAtk);
      const alive = run.crew.filter(u => u.hp > 0);
      const crewHp = alive.reduce((x, u) => x + u.hp, 0);
      const crewAtk = alive.reduce((x, u) => x + u.atk, 0);
      return (hp * atk) / Math.max(1, crewHp * crewAtk);
    }
  };
})();
