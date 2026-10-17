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
    const S = GL.data.islands[sea];
    return id ? (ch === 0 ? S.small : S.big).find(x => x.id === id) || null : null;
  }
  // Kurswahl vor jedem Insel-Kapitel
  function openCourse(run) {
    const S = GL.data.islands[islandIndex(run)];
    const list = chapterIdx(run) === 0 ? S.small : S.big;
    run.courseOpts = list.length > 2 ? R.sample(run, list.map(x => x.id), 2) : list.map(x => x.id);
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
    const lvl = Math.max(1, Math.floor(avgLevel(run)) - R.int(run, 0, 1));
    // Statuspunkte früherer Level automatisch passend zur Rolle verteilen
    const weights = d.role === 'brecher' ? [3, 1, 1] : d.role === 'kaempfer' ? [1, 3, 1] : [2, 1, 2];
    const alloc = { hp: 0, atk: 0, spd: 0 };
    for (let i = 0; i < (lvl - 1) * C.levelUp.points; i++) {
      let y = R.float(run) * 5;
      alloc[(y -= weights[0]) < 0 ? 'hp' : (y -= weights[1]) < 0 ? 'atk' : 'spd']++;
    }
    return { id, stars: star.n, trait, lvl, alloc, jitter: R.int(run, -1, 1) };
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
  function openShop(run) {
    const free = availableCrew(run).filter(id => !run.crew.some(u => u.id === id));
    run.pool = R.sample(run, free, choices(run) + GL.config.shop.extraOffers).map(id => rollOffer(run, id));
    run.shopRolls = 0;
    run.phase = 'recruit';
  }
  // Gold nach einem Sieg: fester Betrag je Kampfart plus Zinsen (je 10 Gold 1, höchstens 3)
  function earnGold(run, kind) {
    const S = GL.config.shop;
    const base = S.win[kind] || 0;
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
      hp: def.hp, atk: def.atk, spd: def.spd, look: def.look, locked: true, self: true };
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
    return types;
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
    if (isl >= 1 && ch === 1 && !run.raidIslands.includes(isl) && R.float(run) < C.raidChance) {
      const r = R.int(run, 0, per - 2);
      rows[r][R.int(run, 0, rows[r].length - 1)].t = 'raid';
    }
    // Kopfgeldjäger-Orte: Bösewichte dieser Insel, sonst einer aus diesem Meer
    const gate = here && here.villain;
    const local = ((here && here.villains) || []).filter(v => v !== gate);
    const seaPool = (GL.data.hunted || []).filter(h => h.island === Math.min(isl, 2) && h.id !== gate).map(h => h.id);
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

  function makeEnemies(run, kind, who, gate) {
    const C = GL.config;
    const g = C.grunt;
    const H = run.H || heatMods(0);
    const level = run.step * C.enemyScale;
    const mult = (kind === 'elite' ? (gate && islandIndex(run) === 0 ? 1 : C.eliteMult) + H.eliteMult : 1) * (gate ? C.gateMult : 1);

    let boss = kind === 'boss' ? currentBoss(run) : null;
    if (kind === 'raid') boss = GL.data.raids[R.int(run, 0, GL.data.raids.length - 1)];
    let count;
    if (boss) count = boss.escort + H.bossEscort;
    else if (gate) count = 2 + Math.min(2, islandIndex(run));   // Bösewicht der Insel + Gefolge (wächst pro Meer)
    else count = Math.min(C.maxGrunts, 1 + Math.floor((level + 1) / 2)) + (kind === 'elite' ? 1 : 0);

    const enemies = [];
    for (let i = 0; i < count; i++) {
      const type = GL.data.grunts[R.int(run, 0, GL.data.grunts.length - 1)];
      const max = Math.round((g.hpBase + level * g.hpPerLevel) * mult * (1 + H.enemyHp));
      enemies.push({
        id: type.id, type: type.type, hp: max, max,
        atk: Math.round((g.atkBase + level * g.atkPerLevel) * mult * (1 + H.enemyAtk)),
        spd: R.int(run, g.spdMin, g.spdMax) + H.enemySpd
      });
    }
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
      const hp = Math.round(boss.hp * (1 + H.enemyHp + H.bossHp));
      enemies.unshift({
        id: boss.id, type: boss.type, boss: true, raid: !!boss.raid, hp, max: hp,
        atk: Math.round(boss.atk * (1 + H.enemyAtk + H.bossAtk)), spd: boss.spd + H.enemySpd
      });
    }
    return enemies;
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
    run.step++;
    run.phase = 'map';
    run.pool = [];
    run.pending = null;
    // Neues Insel-Kapitel: erst den Kurs wählen
    if (rowIdx(run) === 0) { openCourse(run); return; }
    run.options = genOptions(run);
    // Gelegentlich ein Ereignis auf See (nicht direkt vor dem Bösewicht oder Boss)
    if (rowIdx(run) < GL.config.chapterSteps - 1 && R.float(run) < GL.config.eventChance) {
      const ev = GL.data.events[R.int(run, 0, GL.data.events.length - 1)];
      run.event = { id: ev.id };
      run.phase = 'event';
    }
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
    return it;
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
      rollTrophy(run, raid.id, C.trophyChance.raid);
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
    if (b.kind === 'boss') { run.defeated.push(b.enemies[0].id); rollTrophy(run, b.enemies[0].id, C.trophyChance.boss); }

    const f = GL.effects.flags(run);
    if (!f.noWinHeal) heal(run, (C.winHeal + f.winHeal) * Math.max(0, 1 + (run.H ? run.H.winHeal : 0)));
    if (b.kind === 'elite' && run.pending && run.pending.who) {
      const h = byId(GL.data.hunted, run.pending.who);
      run.bountyM = (run.bountyM || 0) + Math.round(h.bounty * (1 + 0.25 * (run.heat || 0)));
      run.lastBounty = { id: h.id, gain: Math.round(h.bounty * (1 + 0.25 * (run.heat || 0))) };
      run.defeated.push(h.id);
      rollTrophy(run, h.id, C.trophyChance.mini);
    }
    if (b.kind === 'elite' && run.pending && run.pending.gate) heal(run, 0.3);   // Insel befreit: kurz durchatmen
    if (b.kind === 'elite') dropItem(run, C.items.dropElite);
    if (b.kind === 'boss') dropItem(run, C.items.dropBoss, 1);
    if (b.kind === 'boss') {
      const bossGain = Math.round(GL.config.bossBounty[Math.min(run.bounties, GL.config.bossBounty.length - 1)] * (1 + 0.25 * (run.heat || 0)));
      run.bountyM = (run.bountyM || 0) + bossGain;
      run.lastBounty = { id: b.enemies[0].id, gain: bossGain };
      run.bounties++;
      if (run.bounties >= GL.data.islands.length) { run.phase = 'win'; return; }
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

  function handle(run, a) {
    const C = GL.config;
    if (a.type === 'spend') return spend(run, a);
    if (a.type === 'swap') return swap(run, a);
    if (a.type === 'dismiss') return dismiss(run, a);
    if (a.type === 'equip') return equip(run, a);
    switch (run.phase) {
      case 'starter': {
        if (a.type !== 'pick') return false;
        const offer = run.pool[a.index];
        if (!offer) return false;
        run.crew.push(makeMember(run, offer));
        run.crew[0].points += run.startPoints || 0;
        run.captain = offer.id;
        run.pool = [];
        openCourse(run);
        return true;
      }

      case 'course': {
        // Kurs setzen: { type: 'pick', index } wählt die nächste Insel
        if (a.type !== 'pick') return false;
        const id = (run.courseOpts || [])[a.index];
        if (!id) return false;
        const sea = islandIndex(run);
        run.course = run.course || [];
        run.course[sea * 2 + chapterIdx(run)] = id;
        const isl = chapterIsland(run);
        if (isl && isl.boss) run.bosses[sea] = isl.boss;
        run.courseOpts = null;
        run.phase = 'map';
        run.options = genOptions(run);
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
          run.pending = { kind: node, who, gate, enemies: makeEnemies(run, node, who, gate) };
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
          heal(run, (C.restHeal + (run.bonus ? run.bonus.restHeal : 0)) * Math.max(0, 1 + (run.H ? run.H.restHeal : 0)));
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
          const enemies = run.pending.enemies.map(e => Object.assign({}, e));
          const start = enemies.map(e => Object.assign({}, e));
          const crewStart = run.crew.map(u => u.hp);
          const special = !!run.pending.special;
          if (special) run.charge = 0;
          const res = GL.battle.simulate(run, run.crew, enemies, run.pending.kind, { special });
          // Werte für die Rangliste: Schaden, härtester Treffer, K.o.s, Krits
          const S = run.stats || (run.stats = { dmg: 0, maxHit: 0, kos: 0, crits: 0, taken: 0, fights: 0 });
          S.fights++;
          res.events.forEach(ev => {
            if (ev.k === 'hit' && ev.side === 'crew') { S.dmg += ev.dmg; if (ev.dmg > S.maxHit) S.maxHit = ev.dmg; if (ev.crit) S.crits++; if (ev.hp <= 0 && ev.dmg > 0) S.kos++; }
            if (ev.k === 'hit' && ev.side === 'enemy') S.taken += ev.dmg;
            if (ev.k === 'dmg' && ev.side === 'enemy') ev.list.forEach(x => { S.dmg += x.dmg; if (x.hp <= 0 && x.dmg > 0) S.kos++; });
          });
          // Siege laden den Spezialangriff auf (Kopfgeldjäger doppelt)
          if (res.win) earnGold(run, run.pending.kind);
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
        const ev = byId(GL.data.events, run.event.id);
        const ch = ev.choices[a.index];
        if (!ch) return false;
        const lines = [];
        run.phase = 'map';
        applyOutcome(run, ch.outcome, lines);
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
          const free = availableCrew(run).filter(id => !run.crew.some(u => u.id === id));
          run.pool = R.sample(run, free, choices(run) + GL.config.shop.extraOffers).map(id => rollOffer(run, id));
          return true;
        }
        if (a.type === 'leave') {
          run.shopFree = false;
          if (run.fromEvent) { run.fromEvent = false; run.phase = 'map'; run.pool = []; return true; }
          advance(run);
          return true;
        }
        if (a.type !== 'pick') return false;
        const offer = run.pool[a.index];
        if (!offer || offer.sold || run.crew.length >= crewLimit(run)) return false;
        const price = offerPrice(run, offer);
        if ((run.gold || 0) < price) return false;
        run.gold -= price;
        run.shopFree = false;
        offer.sold = true;
        run.crew.push(makeMember(run, offer));
        return true;
      }
      case 'fruit':
      case 'treasure':
      case 'awaken': {
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
          if (run.phase === 'recruit') run.crew.push(makeMember(run, item));
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
        // Stand der Freischaltungen beim Start, für ein exaktes Replay:
        // GL.run.replay(run.seed, run.actions, run.start)
        start: {
          unlocked: (p.unlocked || []).slice(), epics: (p.epics || []).slice(),
          upgrades: Object.assign({}, up), gear: Array.isArray(p.gear) ? p.gear.slice() : [], heat: p.heat || 0,
          arts: (p.arts || []).map(a => ({ id: a.id, lvl: a.lvl })),
          items: (p.items || []).map(x => ({ uid: x.uid, id: x.id, r: x.r, lvl: x.lvl || 0 }))
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
      run.pool = (p.self ? ['self'] : []).concat(GL.config.starters, run.unlocked.filter(id => byId(GL.data.crew, id)))
        .map(id => rollOffer(run, id));
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
      return Math.round((run.step * S.perStep + run.bounties * S.perBounty + (run.bountyM || 0) * (S.perMio || 0)) * (1 + (run.heat || 0) * GL.config.heatBonus.score));
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
      if (!here) return GL.data.islands[islandIndex(run)].name;
      const r = row == null ? rowIdx(run) : row;
      if (r >= GL.config.chapterSteps - 1) return here.lair || here.name;
      return here.places[r] || here.name;
    },
    chapterIsland,
    chapterIdx,
    rowIdx,

    island(run) {
      return GL.data.islands[islandIndex(run)];
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
      const level = run.step * C.enemyScale;
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
