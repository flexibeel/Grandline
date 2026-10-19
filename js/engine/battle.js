// Kampfsystem. Rechnet einen ganzen Kampf auf einmal durch und liefert
// eine Liste von Ereignissen, die die Oberfläche danach abspielt.
// Kein Zugriff auf die Seite (DOM): läuft auch ohne Browser, z. B. auf einem Server.
//
// Ereignisse (k = Art):
//   hit     { side, from, to, dmg, crit, eff, blocked, miss, hp, ab }  side = Angreifer, ab = von Rüstung/Schutz geschluckt
//   dmg     { side, list: [{ to, dmg, hp }], by }            side = wer Schaden nimmt
//   heal    { side, list: [{ to, amount, hp }], by }         side = wer geheilt wird
//   revive  { side, list: [{ to, hp }], by }
//   note    { text }
//   status  { side, list: [{ to, key, rounds }], by }       Zustand verteilt (Furcht, Blutung, ...)
//   immune  { side, to, key }                                 Zustand abgewehrt (Mut, Brecher)
//   cleanse { side, to, key, by }                             Helfer entfernt einen Zustand
//   skip    { side, to }                                      Betäubt: Aktion fällt aus
//   special { by, name }                                      Spezialangriff des Kapitäns
//   round   { n }                                             neue Runde beginnt
// by = id der Figur, deren Fähigkeit wirkt, oder ein Schatz/Effekt ('kanone', 'seestein', 'vivre', 'helfer')
window.GL = window.GL || {};

(function () {
  const R = GL.rng;

  function typeMult(att, def) {
    const T = GL.data.types;
    if (!T[att] || !T[def]) return 1;
    if (T[att].strong === def) return GL.config.typeStrong;
    if (T[def].strong === att) return GL.config.typeWeak;
    return 1;
  }

  function simulate(run, crewRefs, enemyRefs, kind, opts) {
    const C = GL.config;
    const o = opts || {};
    // Nachschub (Welle 2) wird mit vorbereitet, kämpft aber erst, wenn Welle 1 gefallen ist
    const reserveRefs = Array.isArray(o.reserve) ? o.reserve : [];
    const S0 = GL.effects.setup(run, crewRefs, enemyRefs.concat(reserveRefs));
    const crew = S0.crew, flags = S0.flags;
    const enemies = S0.enemies.slice(0, enemyRefs.length);
    const reserve = S0.enemies.slice(enemyRefs.length);
    crew.concat(enemies, reserve).forEach(u => { u.status = {}; });
    const events = [];
    const alive = list => list.filter(u => u.hp > 0);
    const sideOf = s => (s === 'crew' ? crew : enemies);
    let FX = null;   // Teufelsfrucht-Mechaniken (js/engine/fruitfx.js)
    let PL = null;   // FIGHT: Plan der Gegnergruppe (GL.data.foePlans), höchstens einer pro Kampf
    let LX = null;   // FIGHT: Kampf-Laune (Kampfwetter mit eigener Mechanik)
    let M = null;    // NEXT: Landgang-Endgegner mit Mechanik (o.mech, nur Landgang)

    function damage(u, amount) {
      // NEXT: Trommler (Boss nimmt kaum Schaden, solange der Takt läuft) und Tekkai-Runde (gar keinen)
      if (M && u === M.boss && amount > 0) {
        if (M.id === 'drummer' && M.drum && M.drum.hp > 0) amount = Math.max(1, Math.round(amount * 0.3));
        if (M.id === 'tekkai' && M.iron) amount = Math.max(1, Math.round(amount * 0.25));
        if (M.id === 'vanish') amount = M.c ? Math.round(amount * 1.12) : M.hidden ? Math.max(1, Math.round(amount * 0.5)) : amount;   // Fokus enttarnt ihn: kein Verstecken, sogar etwas leichter zu treffen
        if (M.id === 'powder') M.hits = (M.hits || 0) + 1;
        if (M.id === 'larvae' && M.larvae.some(l => l.hp > 0)) amount = Math.max(1, Math.round(amount * 0.35));
      }
      // Unsichtbare Gehilfen: schwer zu treffen, solange niemand gezielt aufräumt
      if (M && M.id === 'larvae' && !M.c && u.ref && u.ref.larva && amount > 0) amount = Math.max(1, Math.round(amount * 0.35));
      u.hp = Math.max(0, u.hp - amount);
      return u.hp;
    }
    function heal(u, amount) {
      const before = u.hp;
      u.hp = Math.min(u.max, u.hp + amount);
      return u.hp - before;
    }

    const nameOf = u => {
      if (u.ref && u.ref.name) return u.ref.name;
      const d = GL.data.crew.find(x => x.id === u.id) || GL.data.bosses.find(x => x.id === u.id) || (GL.data.hunted || []).find(x => x.id === u.id) || GL.data.grunts.find(x => x.id === u.id);
      return d ? d.name : u.id;
    };
    const idx = u => sideOf(u.side).indexOf(u);
    const allies = u => sideOf(u.side);
    const foesOf = u => (u.side === 'crew' ? enemies : crew);

    // Sieht nach Schaden nach, ob jemand wieder aufsteht
    function checkRevives() {
      if (FX) FX.onFall();
      crew.concat(enemies).forEach(u => {
        if (u.hp === 0 && u.ability === 'revive' && !u.revived) {
          u.revived = true;
          u.hp = Math.ceil(u.max * u.power);
          events.push({ k: 'revive', side: u.side, list: [{ to: idx(u), hp: u.hp }], by: u.id });
        }
      });
      // Feldarzt: Chopper, ein volles Lazarett (4 Helfer) oder die Hito-Hito-Frucht holen einmal pro Kampf jemanden zurück
      if (doc && !docUsed && alive(crew).length && alive(enemies).length) {
        const down = crew.find(u => u.hp === 0);
        if (down) {
          docUsed = true;
          down.hp = Math.max(1, Math.ceil(down.max * doc.p));
          events.push({ k: 'revive', side: 'crew', list: [{ to: idx(down), hp: down.hp }], by: 'doc', doc: doc.by, from: doc.from });
        }
      }
      if (flags.vivre && !run.vivreUsed && !alive(crew).length) {
        run.vivreUsed = true;
        const list = crew.map((u, i) => { u.hp = Math.ceil(u.max * flags.vivre); return { to: i, hp: u.hp }; });
        events.push({ k: 'revive', side: 'crew', list, by: 'vivre' });
      }
      if (PL) planFall();
      if (KT) routCheck();
    }

    // ---------- Zustände (halten mehrere Runden) ----------
    const DEBUFF_ORDER = ['fear', 'stun', 'poison', 'weak', 'bleed', 'burning'];
    function addStatus(u, key, rounds, value) {
      if (u.hp <= 0) return null;
      const def = GL.data.statuses[key];
      if (def && !def.good) {
        const brave = u.status.brave && (key === 'fear' || key === 'stun');
        const tank = key === 'fear' && u.role === 'brecher';
        if (brave || tank) { events.push({ k: 'immune', side: u.side, to: idx(u), key }); return null; }
      }
      const cur = u.status[key];
      u.status[key] = { rounds: Math.max(rounds, cur ? cur.rounds : 0), value: value || (cur ? cur.value : 0) };
      return { to: idx(u), key, rounds };
    }
    function spreadStatus(u, st, target) {
      let list;
      if (st.target === 'all') list = alive(foesOf(u));
      else if (st.target === 'allies') list = alive(allies(u));
      else if (st.target === 'front') list = alive(foesOf(u)).slice(0, 1);
      else list = target && target.hp > 0 ? [target] : [];
      const side = list.length ? list[0].side : null;
      const got = list.map(t => addStatus(t, st.key, st.rounds, st.value)).filter(Boolean);
      if (got.length) events.push({ k: 'status', side, list: got, by: u.id });
    }
    const statusOf = u => (u.ref && u.ref.status) || (GL.data.abilities[u.id] && GL.data.abilities[u.id].status) || null;

    // ---------- Ultis: Energie laden, bei voller Leiste ersetzt die Ulti den nächsten Angriff ----------
    const U = C.ult || { max: 100, gainHit: 25, gainHurt: 10, bossStart: 30 };
    const UL = GL.data.ultis || {}, UD = GL.data.ultiDefaults || {};
    const ultOf = u => {
      if (u.side === 'crew' || (u.ref && u.ref.pvp)) return UL[u.id] || UD[u.role] || UD.kaempfer || null;
      if (u.boss || u.mini) return UL[u.id] || UD.foe || null;
      return null;   // einfache Gegner haben keine Ulti
    };
    crew.concat(enemies).forEach(u => { u.ult = ultOf(u); u.energy = !u.ult ? 0 : u.side === 'enemy' && u.boss && !(u.ref && u.ref.pvp) ? U.bossStart : (U.start || 0) + (u.side === 'crew' ? (run.ultBonus || 0) : 0) + ((u.ref && u.ref.gb && u.ref.gb.ultStart) || 0); });
    let gainMult = 1;
    const charge = (u, n) => { if (u.ult && u.hp > 0) u.energy = Math.min(U.max, u.energy + Math.round(n * gainMult)); };

    function ultStrike(u, t, mult, pierce) {
      let m = typeMult(u.type, t.type);
      if (m < 1 && u.ignoreWeak) m = 1;
      if (m > 1 && u.side === 'crew') m += flags.effBonus;
      let d = u.atk * mult * m * (1 + (u.dmgPct || 0));
      if (t.boss || t.mini) d *= 1 + (u.bossPct || 0);
      if (u.status.fear) d *= 0.65;
      if (t.status.weak) d *= 1.25;
      d = pierce ? Math.round(d) : Math.round(d * (1 - (t.guard || 0))) - (t.armor || 0);
      return u.side === 'enemy' ? foeCap(t, Math.max(1, d), true) : Math.max(1, d);   // GEGNER-WERTE: Gegner-Ulti wie ein angekündigter Brocken gedeckelt
    }
    // Ulti-Würfel: dieselbe Ulti fühlt sich nie gleich an.
    //   Schaden schwankt, kann kritisch sein, wird mit jeder weiteren Ulti im Kampf etwas stärker.
    //   Manchmal „Perfekt“ (alles stärker, Zustände länger), manchmal ein Bonus-Effekt passend zum Kampfstil.
    const UV = Object.assign({ spread: 0.15, perfect: 0.16, bonus: 0.16, perfectMult: 1.35, ramp: 0.1 }, U.vary || {});
    const ULT_BONUS = {
      kraft:   { label: 'Erschütterung', do: 'status', key: 'stun', rounds: 1, target: 'front' },
      klinge:  { label: 'Tiefe Wunde',   do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'front' },
      technik: { label: 'Schwachstelle', do: 'status', key: 'weak', rounds: 2, target: 'all' },
      heal:    { label: 'Zweiter Atem',  do: 'heal', pct: 0.12, target: 'lowest' }
    };
    function doUlt(u, spark) {
      const ult = u.ult;
      u.energy = 0; u.ultWait = 0;
      u.ultCount = (u.ultCount || 0) + 1;
      const roll = R.float(run);
      const tier = roll < UV.perfect ? 'perfect' : roll < UV.perfect + UV.bonus ? 'bonus' : '';
      const hasStrike = ult.fx.some(f => f.do === 'strike');
      const bonus = tier === 'bonus' ? (hasStrike ? ULT_BONUS[u.type] || ULT_BONUS.technik : ULT_BONUS.heal) : null;
      const P = tier === 'perfect';
      events.push({ k: 'ult', side: u.side, from: idx(u), by: u.id, name: ult.name, spark: !!spark, tier, bonus: bonus ? bonus.label : '', combo: u.ultCount });
      const st = { hit: [] };
      (bonus ? ult.fx.concat([bonus]) : ult.fx).forEach(f0 => fxStep(u, f0, P, st));
      teamCharge(u);
    }
    // Ein Effekt einer Ulti oder Team-Fähigkeit
    function fxStep(u, f0, P, st) {
      const f = !P ? f0 : Object.assign({}, f0, {
        rounds: f0.rounds ? f0.rounds + 1 : f0.rounds,
        pct: f0.pct ? f0.pct * 1.5 : f0.pct,
        value: f0.do === 'atk' || f0.do === 'armor' ? f0.value + 1 : f0.value });
      const foes = foesOf(u), al = allies(u);
      if (f.do === 'strike') {
        const living = alive(foes);
        if (!living.length) return;
        const mult0 = f.mult * (P ? UV.perfectMult : 1) * (st.team ? 1 : (1 + UV.ramp * (u.ultCount - 1)));
        const KR = GL.effects.critOf(u);   // STATS: gleicher Deckel + Überlauf wie bei normalen Treffern
        const crit = !P && R.float(run) < KR.ch;
        const targets = f.target === 'all' ? living
          : f.target === 'weakest' ? [living.reduce((a, b) => (b.hp < a.hp ? b : a))] : [living[0]];
        const list = targets.map(t => { const d = ultStrike(u, t, mult0 * (1 + (R.float(run) * 2 - 1) * UV.spread) * (crit ? KR.mult : 1), f.pierce); return { to: foes.indexOf(t), dmg: Math.min(t.hp, d), hp: damage(t, d) }; });
        st.hit = targets;
        events.push({ k: 'dmg', side: targets[0].side, list, by: u.id, ult: true, team: st.team || undefined, crit });
        checkRevives();
      } else if (f.do === 'status') {
        const list = f.target === 'all' ? alive(foes) : f.target === 'front' ? alive(foes).slice(0, 1)
          : f.target === 'hit' ? st.hit.filter(t => t.hp > 0) : f.target === 'allies' ? alive(al) : [u];
        const got = list.map(t => addStatus(t, f.key, f.rounds, f.value)).filter(Boolean);
        if (got.length) events.push({ k: 'status', side: list[0].side, list: got, by: u.id, ult: true, team: st.team || undefined });
      } else if (f.do === 'heal') {
        const pool = f.target === 'all' ? alive(al) : f.target === 'lowest' ? alive(al).sort((a, b) => a.hp / a.max - b.hp / b.max).slice(0, 1) : [u];
        const hm = u.side === 'crew' ? flags.healMult : 1;
        const list = pool.map(t => ({ to: idx(t), amount: heal(t, Math.max(1, Math.round(t.max * f.pct * hm))), hp: t.hp })).filter(x => x.amount > 0);
        if (list.length) events.push({ k: 'heal', side: u.side, list, by: u.id, ult: true, team: st.team || undefined });
      } else if (f.do === 'atk' || f.do === 'armor') {
        (f.target === 'allies' ? alive(al) : [u]).forEach(t => { t[f.do] = (t[f.do] || 0) + f.value; });
        events.push({ k: 'note', by: u.id, side: u.side, ult: true,
          text: `${nameOf(u)}: ${f.target === 'allies' ? 'alle' : 'selbst'} +${f.value} ${f.do === 'atk' ? 'Angriff' : 'Rüstung'}.` });
      } else if (f.do === 'cleanse') {
        alive(al).forEach(t => DEBUFF_ORDER.forEach(k => {
          if (t.status[k]) { delete t.status[k]; events.push({ k: 'cleanse', side: t.side, to: idx(t), key: k, by: u.id }); }
        }));
      }
    }
    // ---------- Team-Fähigkeit: volle Bande lädt mit jeder Ulti einen Balken ----------
    const TM = GL.data.teamMoves || {}, TNEED = GL.data.teamNeed || 3;
    const factionOf = u => u.faction || ((u.ref && u.ref.faction) || (GL.data.crew.find(c => c.id === u.id) || {}).faction || null);
    const team = { crew: null, enemy: null };
    ['crew', 'enemy'].forEach(side => {
      const list = sideOf(side).filter(u => u.hp > 0), cnt = {};
      list.forEach(u => { const f = factionOf(u); if (f) cnt[f] = (cnt[f] || 0) + 1; });
      const full = Object.keys(cnt).filter(f => TM[f] && GL.data.factions[f] && cnt[f] >= GL.data.factions[f].tiers[GL.data.factions[f].tiers.length - 1].n);
      if (full.length) {
        const f = full.sort((a, b) => cnt[b] - cnt[a])[0];
        // Der Balken der Crew bleibt über die Kämpfe eines Runs erhalten
        const keep = side === 'crew' && run.teamBar && run.teamBar.f === f ? run.teamBar.n : 0;
        team[side] = { faction: f, n: keep, start: keep, need: TNEED, name: TM[f].name };
      }
    });
    function teamCharge(u) {
      const t = team[u.side];
      if (!t || u.teamMove) return;
      t.n++;
      events.push({ k: 'teamCharge', side: u.side, n: Math.min(t.n, t.need), need: t.need, faction: t.faction });
      if (t.n < t.need) return;
      t.n = 0;
      const mates = alive(allies(u)).filter(x => factionOf(x) === t.faction);
      const lead = (mates.length ? mates : alive(allies(u))).slice().sort((a, b) => b.atk - a.atk)[0];
      if (!lead) return;
      const mv = TM[t.faction];
      events.push({ k: 'team', side: u.side, by: lead.id, from: idx(lead), name: mv.name, faction: t.faction, text: mv.text });
      const s2 = { hit: [], team: true };
      mv.fx.forEach(f => fxStep(lead, f, false, s2));
      t.fired = (t.fired || 0) + 1;
    }

    // ---------- Kampfbeginn ----------
    if (flags.cannon) {
      const list = enemies.map((u, i) => ({ to: i, dmg: Math.min(u.hp, flags.cannon), hp: damage(u, flags.cannon) }));
      events.push({ k: 'dmg', side: 'enemy', list, by: 'kanone' });
    }
    if (kind === 'boss' && flags.bossStartCut) {
      const i = enemies.findIndex(u => u.boss);
      if (i >= 0) {
        const d = Math.round(enemies[i].hp * Math.min(flags.bossStartCut, 0.9));
        events.push({ k: 'dmg', side: 'enemy', list: [{ to: i, dmg: d, hp: damage(enemies[i], d) }], by: 'seestein' });
      }
    }

    // Fähigkeiten zu Kampfbeginn (in Reihenfolge der Aufstellung)
    crew.concat(enemies).filter(u => u.hp > 0 && u.ability).forEach(u => {
      const name = nameOf(u);
      switch (u.ability) {
        case 'slow':
          foesOf(u).forEach(f => { f.spd -= u.power; });
          events.push({ k: 'note', by: u.id, side: u.side, text: `${name} bremst alle Gegner aus: -${u.power} Tempo.` });
          break;
        case 'rally':
          allies(u).forEach(f => { f.atk += u.power; });
          events.push({ k: 'note', by: u.id, side: u.side, text: `${name} feuert alle an: +${u.power} Angriff.` });
          break;
        case 'curse': {
          const t = alive(foesOf(u)).sort((x, y) => y.hp - x.hp)[0];
          if (t) {
            const d = Math.round(t.hp * u.power);
            events.push({ k: 'dmg', side: t.side, list: [{ to: idx(t), dmg: d, hp: damage(t, d) }], by: u.id });
          }
          break;
        }
        case 'mimic': {
          const others = allies(u).filter(f => f !== u);
          if (others.length) {
            u.atk = Math.max(u.atk, ...others.map(f => f.atk));
            events.push({ k: 'note', by: u.id, side: u.side, text: `${name} verwandelt sich und hat jetzt ${u.atk} Angriff.` });
          }
          break;
        }
        case 'oasis': {
          const amount = Math.round(u.power * (u.side === 'crew' ? flags.healMult : 1));
          const list = allies(u).filter(f => f.hp > 0)
            .map(f => ({ to: idx(f), amount: heal(f, amount), hp: f.hp })).filter(x => x.amount > 0);
          if (list.length) events.push({ k: 'heal', side: u.side, list, by: u.id });
          break;
        }
      }
    });

    // Zustände zu Kampfbeginn (z. B. Furcht von Bossen, Mut von Brook)
    crew.concat(enemies).filter(u => u.hp > 0).forEach(u => {
      const st = statusOf(u);
      if (st && st.when === 'start') spreadStatus(u, st);
    });

    // Spezialangriff des Kapitäns: großer Schaden an allen Gegnern, danach Mut für die Crew
    if (o.special) {
      const cap = run.captain || (crew[0] && crew[0].id);
      events.push({ k: 'special', by: cap, name: (GL.data.specials && GL.data.specials[cap]) || 'Crew-Großangriff' });
      const list = enemies.map((u, i) => {
        if (u.hp <= 0) return null;
        const d = Math.round(u.max * (u.boss ? C.specialBossCut : C.specialEscortCut));
        return { to: i, dmg: Math.min(u.hp, d), hp: damage(u, d) };
      }).filter(Boolean);
      events.push({ k: 'dmg', side: 'enemy', list, by: 'special' });
      Object.keys(crew).forEach(i => {
        const u = crew[i];
        DEBUFF_ORDER.forEach(k => { delete u.status[k]; });
      });
      const got = alive(crew).map(u => addStatus(u, 'brave', 2));
      events.push({ k: 'status', side: 'crew', list: got.filter(Boolean), by: 'special' });
    }

    const pvp = enemies.some(u => u.ref && u.ref.pvp);
    // GEGNER-WERTE: Gegner-Treffer gegen die Crew gedeckelt (Anteil Max-Leben), Gegner-Krit etwas flacher. Nicht in Duellen/PvP.
    const FH = !pvp && kind !== 'duel' && C.foeHit ? C.foeHit : null;
    if (FH && FH.critMult) enemies.concat(reserve).forEach(e => { e.critMult = Math.min(e.critMult, FH.critMult); });
    const foeCap = (t, d, big) => (FH && t && t.side === 'crew' && d > 0 ? Math.min(d, Math.max(1, Math.ceil(t.max * (big ? FH.capBig : FH.cap)))) : d);
    // ---------- Wendepunkte: machen jeden Kampf zur kleinen Geschichte ----------
    //   Boss-Wut: Bosse und Raid-Bosse werden bei halbem Leben wütend (stärker, schneller, Ulti lädt)
    //   Letzter Wille: Fällt die Crew unter ein Drittel ihres Lebens, rafft sie sich einmal auf
    const DR = Object.assign({ rageAt: 0.6, rageAtk: 0.2, rageEnergy: 50, finalAt: 0.25, finalAtk: 0.15, finalHeal: 0.08, willAt: 0.3, willEnergy: 50 }, C.drama || {});
    let willUsed = false;
    const BF = C.bossFight || {};
    if (!pvp) enemies.forEach(e => { if (e.boss || e.raid) e.dodge = (e.dodge || 0) + (BF.dodge || 0); });
    // ---------- Kampfwetter: manche Kämpfe bekommen eine Bedingung, damit sie sich nicht gleich anfühlen ----------
    const WX = C.weather || [];
    // Landgang-Räume (FUN) können eine Bedingung fest vorgeben (o.weather), sonst entscheidet der Zufall wie bisher
    const wx = o.weather && !pvp ? (WX.find(w => w.id === o.weather) || null)
      : !pvp && (kind === 'battle' || kind === 'elite') && WX.length && R.float(run) < (C.weatherChance || 0) ? WX[Math.floor(R.float(run) * WX.length)] : null;
    const DCAP = (C.caps && C.caps.dodge != null) ? C.caps.dodge : 0.6;   // STATS
    const wxMiss = wx && wx.miss || 0, wxCrit = wx && wx.crit || 0, wxGain = wx && wx.gain || 1, wxDmg = wx && wx.crewDmg || 0;
    if (wx) {
      if (wx.crewSpd) crew.forEach(u => { u.spd += wx.crewSpd; });
      if (wx.foeSpd) enemies.forEach(u => { u.spd += wx.foeSpd; });
      events.push({ k: 'weather', id: wx.id, name: wx.name, text: wx.text });
      gainMult = wxGain;
      LX = { id: wx.id, wx };
      // Zweikampf: die beiden Stärksten gehen aufeinander los
      if (wx.duel) {
        const c = alive(crew).reduce((a, b) => (b.atk > a.atk ? b : a), alive(crew)[0]);
        const e = alive(enemies).reduce((a, b) => (b.atk > a.atk ? b : a), alive(enemies)[0]);
        if (c && e) { LX.duel = [c, e]; events.push({ k: 'wxfx', id: 'duell', list: [{ side: 'crew', to: idx(c) }, { side: 'enemy', to: idx(e) }] }); }
      }
    }
    const isDuelPair = (a, b) => !!(LX && LX.duel && ((a === LX.duel[0] && b === LX.duel[1]) || (a === LX.duel[1] && b === LX.duel[0])));
    // Kampf-Launen, die zu Rundenbeginn wirken (Pulverfass, Möwen)
    function launeRound(n) {
      if (!LX) return;
      const w = LX.wx;
      if (w.blast && n === 2) {
        const c = alive(crew)[0], e = alive(enemies)[0];
        if (!c || !e) return;
        events.push({ k: 'wxfx', id: 'pulver' });
        [c, e].forEach(t => {
          const d = Math.max(1, Math.round(t.max * w.blast));
          events.push({ k: 'dmg', side: t.side, list: [{ to: idx(t), dmg: Math.min(t.hp, d), hp: damage(t, d) }], by: 'pulver' });
        });
        checkRevives();
      }
      if (w.gulls && R.float(run) < w.gulls) {
        const pool = alive(crew).concat(alive(enemies));
        if (!pool.length) return;
        const t = pool[Math.floor(R.float(run) * pool.length)];
        const got = addStatus(t, 'stun', 1);
        events.push({ k: 'wxfx', id: 'moewen', side: t.side, to: idx(t), hit: !!got });
      }
    }
    function drama() {
      if (pvp) return;
      enemies.forEach(e => {
        if (e.hp > 0 && (e.boss || e.raid) && !e.raged && e.hp <= e.max * DR.rageAt) {
          e.raged = true;
          e.atk = Math.round(e.atk * (1 + DR.rageAtk)); e.spd += 1;
          if (e.ult) e.energy = Math.min(U.max, e.energy + DR.rageEnergy);
          events.push({ k: 'rage', side: 'enemy', to: idx(e), by: e.id, ea: e.ult ? e.energy : null });
          sigWarn(e, 1);
          if (FM.on && !called && FM.call > 0) {
            const down = enemies.find(f => f.hp <= 0 && !isLead(f));
            if (down) {
              called = true;
              down.hp = Math.max(1, Math.ceil(down.max * FM.call));
              events.push({ k: 'revive', side: 'enemy', list: [{ to: idx(down), hp: down.hp }], by: e.id, ai: 'call' });
              events.push({ k: 'note', by: e.id, side: 'enemy', ai: 'call', text: `${nameOf(e)} pfeift. ${nameOf(down)} steht wieder auf und tut so, als wäre nichts gewesen.` });
            }
          }
        }
        // Endphase: letzter Akt mit voller Ulti und einem kleinen Atemzug
        if (e.hp > 0 && e.raged && !e.lastAct && e.hp <= e.max * DR.finalAt) {
          e.lastAct = true;
          e.atk = Math.round(e.atk * (1 + DR.finalAtk));
          if (e.ult) e.energy = U.max;
          const got = heal(e, Math.round(e.max * DR.finalHeal));
          events.push({ k: 'rage', phase: 3, side: 'enemy', to: idx(e), by: e.id, ea: e.ult ? e.energy : null, heal: got, hp: e.hp });
          sigWarn(e, SG.final || 1.3);
        }
      });
      if (!willUsed && alive(enemies).length) {
        const a = alive(crew);
        const frac = a.reduce((x, u) => x + u.hp, 0) / crew.reduce((x, u) => x + u.max, 0);
        if (a.length && frac <= DR.willAt) {
          willUsed = true;
          a.forEach(u => { if (u.ult) u.energy = Math.min(U.max, u.energy + DR.willEnergy); addStatus(u, 'brave', 2); });
          events.push({ k: 'will', side: 'crew', list: a.map(u => ({ to: idx(u), en: u.ult ? u.energy : null })) });
        }
      }
    }
    let firstBlock = flags.firstBlock;  // Anzahl abgewehrter Treffer pro Kampf
    // Wer kann als Feldarzt Gefallene zurückholen? (einmal pro Kampf)
    const DC = C.doctor || {};
    const chop = !pvp && kind !== 'duel' ? crew.find(u => u.id === 'chopper') : null;
    const helfer = crew.filter(u => u.role === 'helfer').length;
    const doc = pvp || kind === 'duel' ? null
      : chop && DC.chopper ? { p: DC.chopper, by: 'chopper', from: idx(chop) }
      : helfer >= (DC.lazarettN || 3) && DC.lazarett ? { p: helfer >= 4 ? (DC.lazarett4 || DC.lazarett) : DC.lazarett, by: 'lazarett' }
      : (run.eaten || []).some(id => /^hito/.test(id)) && DC.hito ? { p: DC.hito, by: 'hito' } : null;
    let docUsed = false;
    // Welle 2 rückt nach, sobald Welle 1 gefallen ist
    let waveN = 1;
    function callWave() {
      if (!reserve.length || !alive(crew).length) return false;
      const list = [];
      reserve.splice(0).forEach(u => { enemies.push(u); list.push({ to: enemies.length - 1, hp: u.hp }); });
      waveN++;
      events.push({ k: 'wave', n: waveN, of: waveN, list });
      return true;
    }
    FX = GL.fruitFx && !pvp && kind !== 'duel' ? GL.fruitFx.setup(run, crew, enemies, { events, addStatus, damage, heal }) : null;
    // ---------- Gegner-KI: Formation und Zielwahl ----------
    //   Das Gefolge steht vorne und schützt den Anführer (Boss/Kopfgeld-Ziel). Nahkämpfer müssen sich erst durchkämpfen,
    //   Technik-Figuren schießen über die Köpfe hinweg (mit Abschlag). Gegnerische Technik-Schützen suchen sich
    //   die angeschlagenste Figur deiner Crew. Trifft die Crew den Anführer, wird das Gefolge kurz wütend.
    const FM = Object.assign({ on: true, ranged: 0.75, foeFocus: true, rally: 0.12, call: 0.35 }, C.formation || {});
    const isLead = f => !!(f.boss || f.mini || f.raid);
    let rallied = false, called = false;
    // ---------- KAMPFTIEFE: Stil-Ketten, Schwung, Moralbruch, Standhaft (nur Crew gegen KI, keine Duelle) ----------
    //   Technik markiert (Blöße) -> Klinge trifft markierte Ziele sicher kritisch. Klinge-Krits schneiden (Blutung).
    //   Kraft reißt Blutung auf (Restschaden sofort). Technik nutzt Geschwächt/Betäubt (Schwachstelle: Rüstung egal).
    //   Schwung: Krits, K.O.s und Ketten füllen eine Leiste, voll = Crew in Fahrt (Ulti-Energie, kurz mehr Angriff).
    //   Fällt ein Anführer, wankt sein Gefolge (Furcht). Brecher stehen einen tödlichen Treffer pro Kampf durch.
    const CH = Object.assign({ on: true, open: 0.25, cut: 0.3, cutRounds: 2, rip: 1.5, expose: 0.2, routRounds: 2, moNeed: 6, surgeEn: 35, surgeAtk: 0.12, surgeMax: 2 }, C.chain || {});
    const KT = !!CH.on && C.chain !== false && !pvp && kind !== 'duel';
    const isChief = f => isLead(f) || !!(f.ref && f.ref.elite2);
    const blades = () => crew.some(c => c.hp > 0 && c.type === 'klinge');
    const MO = { n: 0, de: 0, dc: 0, fired: 0, buff: null };
    function moAdd(k) {
      if (!KT || !k || MO.fired >= CH.surgeMax) return;
      MO.n = Math.max(0, Math.min(CH.moNeed, MO.n + k));
      if (events.length) events[events.length - 1].mo = MO.n;
      if (MO.n >= CH.moNeed) surge();
    }
    function moDeaths() {
      if (!KT) return;
      const de = enemies.filter(f => f.hp <= 0).length, dc = crew.filter(f => f.hp <= 0).length;
      const gain = Math.max(0, de - MO.de), loss = Math.max(0, dc - MO.dc);
      MO.de = de; MO.dc = dc;
      if (gain || loss) moAdd(gain - 2 * loss);
    }
    function surge() {
      MO.n = 0;
      const a = alive(crew);
      if (!a.length || !alive(enemies).length) return;
      MO.fired++;
      const buff = [];
      const list = a.map(u => {
        if (u.ult) u.energy = Math.min(U.max, u.energy + CH.surgeEn);
        const add = Math.max(1, Math.round(u.atk * CH.surgeAtk)); u.atk += add; buff.push({ u, add });
        return { to: idx(u), en: u.ult ? u.energy : null };
      });
      if (MO.buff) MO.buff.list.forEach(b => { b.u.atk = Math.max(1, b.u.atk - b.add); });
      MO.buff = { list: buff, until: rounds + 1 };
      events.push({ k: 'surge', side: 'crew', list, mo: 0, n: MO.fired });
    }
    function routCheck() {
      if (!KT) return;
      enemies.forEach(l => {
        if (l.hp > 0 || l.routed || !isChief(l)) return;
        l.routed = true;
        const gs = alive(enemies).filter(f => !isChief(f));
        if (!gs.length || !alive(crew).length) return;
        const got = gs.map(g => { g.spd -= 1; return addStatus(g, 'fear', CH.routRounds); }).filter(Boolean);
        if (got.length) { events.push({ k: 'status', side: 'enemy', list: got, by: l.id, rout: idx(l) }); moAdd(1); }
      });
    }
    function pickTarget(u, living) {
      const tank = living.find(f => f.ability === 'taunt');
      if (tank) return tank;
      if (!pvp && FM.on && u.side === 'crew') {
        const guards = living.filter(f => !isLead(f)), lead = living.filter(isLead);
        if (guards.length && lead.length) return u.type === 'technik' ? living.reduce((a, b) => (b.hp < a.hp ? b : a)) : guards[0];
      }
      if (!pvp && FM.on && FM.foeFocus && u.side === 'enemy' && !isLead(u) && u.type === 'technik') {
        return living.reduce((a, b) => (b.hp / b.max < a.hp / a.max ? b : a));
      }
      // BATTLE2: Gegner kämpfen nicht mehr nur gegen die vorderste Figur. Klingen flankieren nach hinten,
      // alle anderen weichen gelegentlich auf eine Nachbarfigur aus (Zufall aus dem Run-Strom, Replays bleiben gleich)
      const FL = C.flank || { back: 0.3, side: 0.3 };
      if (!pvp && kind !== 'duel' && u.side === 'enemy' && living.length > 1 && FL) {
        const r = R.float(run);
        if (u.type === 'klinge' && r < FL.back) { u.flank = 'back'; return living[living.length - 1]; }
        if (r < (u.type === 'klinge' ? FL.back : 0) + FL.side) { u.flank = 'side'; return living[1 + Math.floor(R.float(run) * (living.length - 1))]; }
      }
      return living[0];
    }
    // Schutz: Schüsse über das Gefolge hinweg verlieren etwas Wucht
    const behindGuards = (u, target) => !pvp && FM.on && u.side === 'crew' && isLead(target) && alive(enemies).some(f => !isLead(f));

    // ---------- FIGHT: Signatur-Angriffe der Bosse (bei Wut und in der Endphase, eine Aktion vorher angekündigt) ----------
    const SIG = GL.data.bossSigs || {}, SG = Object.assign({ final: 1.3 }, C.sig || {});
    function sigWarn(e, m) {
      const S = SIG[e.id];
      if (!S || pvp || kind === 'duel' || C.sig === false) return;
      e.sigPending = m;
      events.push({ k: 'plan', side: 'enemy', plan: 'sig', step: 'warn', to: idx(e), by: e.id,
        text: `${nameOf(e)} bereitet ${S.name} vor …`, en: `${nameOf(e)} is preparing ${S.en} …` });
    }
    function doSig(u) {
      const S = SIG[u.id], m = u.sigPending || 1;
      u.sigPending = 0;
      events.push({ k: 'sig', side: 'enemy', from: idx(u), by: u.id, name: S.name, en: S.en, text: S.t, tEn: S.tEn, strong: m > 1 || undefined });
      const hitList = (list, mult) => {
        const out = list.filter(t => t && t.hp > 0).map(t => {
          let d = u.atk * mult * m * typeMult(u.type, t.type);
          if (t.status.weak) d *= 1.25;
          d = foeCap(t, Math.max(1, Math.round(d * (1 - (t.guard || 0))) - (t.armor || 0)), true);   // GEGNER-WERTE: Rüstung vor dem Mindestschaden, Deckel
          return { to: idx(t), dmg: Math.min(t.hp, d), hp: damage(t, d) };
        });
        if (out.length) { events.push({ k: 'dmg', side: 'crew', list: out, by: u.id, sig: true }); checkRevives(); }
        return out;
      };
      S.fx.forEach(f => {
        const T = alive(crew);
        if (!T.length) return;
        const strong = () => T.reduce((a, b) => (b.atk > a.atk ? b : a)), low = () => T.reduce((a, b) => (b.hp / b.max < a.hp / a.max ? b : a));
        if (f.do === 'aoe') hitList(T, f.m);
        else if (f.do === 'single') hitList([f.pick === 'low' ? low() : strong()], f.m);
        else if (f.do === 'front') hitList(T.slice(0, f.n || 2), f.m);
        else if (f.do === 'multi') { for (let k = 0; k < (f.n || 3); k++) { const L = alive(crew); if (!L.length) break; hitList([L[Math.floor(R.float(run) * L.length)]], f.m); } }
        else if (f.do === 'drain') {
          const out = hitList(T, f.m), tot = out.reduce((s, x) => s + x.dmg, 0);
          const got = heal(u, Math.round(tot * 0.6));
          if (got > 0) events.push({ k: 'heal', side: 'enemy', list: [{ to: idx(u), amount: got, hp: u.hp }], by: u.id, sig: true });
        } else if (f.do === 'status') {
          const list = f.target === 'all' ? T : f.target === 'low' ? [low()] : T.slice(0, 1);
          const got = list.map(t => addStatus(t, f.key, f.rounds + (m > 1 ? 1 : 0), f.value)).filter(Boolean);
          if (got.length) events.push({ k: 'status', side: 'crew', list: got, by: u.id, sig: true });
        } else if (f.do === 'stun') {
          const pool = f.pick === 'strong' ? [strong()] : T.slice(), pick = [];
          for (let k = 0; k < (f.n || 1) && pool.length; k++) pick.push(pool.splice(Math.floor(R.float(run) * pool.length), 1)[0]);
          const got = pick.map(t => addStatus(t, 'stun', 1)).filter(Boolean);
          if (got.length) events.push({ k: 'status', side: 'crew', list: got, by: u.id, sig: true });
        } else if (f.do === 'self') {
          const add = Math.max(1, Math.round(u.atk * f.atk * m));
          u.atk += add;
          events.push({ k: 'note', by: u.id, side: 'enemy', sig: true, text: `${nameOf(u)} wird stärker: +${add} Angriff.` });
        } else if (f.do === 'purge') {
          let n = 0;
          T.forEach(t => Object.keys(t.status).forEach(k => { const d = GL.data.statuses[k]; if (d && d.good) { delete t.status[k]; n++; } }));
          T.forEach(t => { if (t.regen > 0) { t.regen = Math.floor(t.regen / 2); n++; } });
          events.push({ k: 'note', by: u.id, side: 'enemy', sig: true, text: n ? 'Alles Gute ist weg: Mut verflogen, Heilung halbiert.' : 'Es gab nichts Gutes zu schlucken. Er wirkt enttäuscht.' });
        }
      });
    }

    // ---------- FIGHT: Pläne der Gegnergruppen (eine erkennbare Rotation pro Kampf) ----------
    const PD = GL.data.foePlans || {};
    const PV = Object.assign({ salvo: 0.45, frenzy: 0.1, bite: 0.18, wave: 0.55, beam: 1.6, undead: 0.3 }, C.plan || {});
    const inPlan = u => !!(PL && u && u.side === 'enemy' && PL.ids.includes(u.id));
    function planEv(step, u, text, en, big) {
      events.push({ k: 'plan', side: 'enemy', plan: PL.key, step, to: u ? idx(u) : null, by: u ? u.id : null, text, en, big: big || undefined });
    }
    function pickPlan() {
      if (pvp || kind === 'duel' || C.plans === false || o.mech) return null;   // Landgang-Endgegner haben ihre eigene Mechanik
      const cnt = {};
      enemies.concat(reserve).forEach(u => { if (isLead(u)) return; const k = GL.data.foePlanOf ? GL.data.foePlanOf(u.id) : null; if (k) cnt[k] = (cnt[k] || 0) + 1; });
      const keys = Object.keys(cnt).filter(k => cnt[k] >= (PD[k].min || 1)).sort((a, b) => cnt[b] - cnt[a]);
      return keys.length ? Object.assign({ key: keys[0] }, PD[keys[0]], { down: 0 }) : null;
    }
    const planMembers = () => alive(enemies).filter(inPlan);
    function planRound(n) {
      const G = planMembers(), g0 = G[0];
      if (!g0 || !alive(crew).length) return;
      const k = PL.key;
      if (k === 'marine') {
        if (n === 1) {
          const t = alive(crew).reduce((a, b) => (b.spd > a.spd ? b : a));
          planEv('netz', g0, `Formation! Die Marine wirft ein Netz über ${nameOf(t)}.`, `Formation! The Marines throw a net over ${nameOf(t)}.`, true);
          const got = addStatus(t, 'stun', 1);
          if (got) events.push({ k: 'status', side: 'crew', list: [got], by: g0.id, plan: 'netz' });
        } else if (n % 3 === 2) planEv('anlegen', g0, 'Die Marine legt an … Nächste Runde knallt es.', 'The Marines take aim … next round it goes bang.');
        else if (n % 3 === 0) {
          const acc = {};
          G.forEach(s => {
            const L = alive(crew); if (!L.length) return;
            const t = L[Math.floor(R.float(run) * L.length)];
            const d = Math.max(1, Math.round(s.atk * PV.salvo * (1 - (t.guard || 0))) - (t.armor || 0));
            acc[idx(t)] = foeCap(t, (acc[idx(t)] || 0) + d, true);   // GEGNER-WERTE: Salve gesammelt gedeckelt
          });
          planEv('salve', g0, 'Salve! Die ganze Marine-Truppe feuert auf einmal.', 'Volley! The whole Marine squad fires at once.', !PL.bigUsed);
          PL.bigUsed = true;
          const list = Object.keys(acc).map(i => { const t = crew[+i]; return { to: +i, dmg: Math.min(t.hp, acc[i]), hp: damage(t, acc[i]) }; });
          if (list.length) { events.push({ k: 'dmg', side: 'crew', list, by: 'salve' }); checkRevives(); }
        }
      } else if (k === 'pirat') {
        if (n === 1) planEv('start', g0, 'Piraten! Jeder Gefallene macht die anderen wütender.', 'Pirates! Every fallen mate makes the rest angrier.', true);
      } else if (k === 'tiere') {
        if (n === 1) {
          PL.prey = alive(crew).reduce((a, b) => (b.max < a.max ? b : a));
          planEv('rudel', g0, `Rudeljagd! Das Rudel hat sich ${nameOf(PL.prey)} ausgesucht.`, `Pack hunt! The pack has picked ${nameOf(PL.prey)}.`, true);
        }
      } else if (k === 'see') {
        if (n === 1) planEv('start', g0, 'Gezeiten! Alle 3 Runden rollt eine Welle über deine Crew.', 'Tides! Every 3 rounds a wave rolls over your crew.', true);
        else if (n % 3 === 2) { PL.tide = true; planEv('ebbe', g0, 'Das Wasser zieht sich zurück. Das ist nie ein gutes Zeichen.', 'The water pulls back. That is never a good sign.'); }
        else if (n % 3 === 0 && PL.tide) {
          PL.tide = false;
          const avgA = G.reduce((s, x) => s + x.atk, 0) / G.length;
          planEv('welle', g0, 'Die Welle kommt! Die ganze Crew wird nass und wund.', 'Here comes the wave! The whole crew gets soaked and sore.', !PL.bigUsed);
          PL.bigUsed = true;
          const list = alive(crew).map(t => { const d = foeCap(t, Math.max(1, Math.round(avgA * PV.wave * (1 - (t.guard || 0))) - (t.armor || 0)), true); return { to: idx(t), dmg: Math.min(t.hp, d), hp: damage(t, d) }; });
          events.push({ k: 'dmg', side: 'crew', list, by: 'welle' });
          checkRevives();
        }
      } else if (k === 'untot') {
        if (n === 1) planEv('start', g0, 'Untot! Was hier fällt, steht einmal wieder auf.', 'Undead! What falls here gets back up once.', true);
      } else if (k === 'maschine') {
        if (n % 3 === 2) planEv('surren', g0, `${nameOf(g0)} surrt bedrohlich. Irgendwas lädt da.`, `${nameOf(g0)} whirs ominously. Something is charging.`);
        else if (n % 3 === 0) G.forEach(r => {
          const L = alive(crew); if (!L.length) return;
          const t = L.reduce((a, b) => (b.atk > a.atk ? b : a));
          const miss = R.float(run) < (t.dodge || 0);
          const d = miss ? 0 : foeCap(t, Math.max(1, Math.round(r.atk * PV.beam * typeMult(r.type, t.type) * (1 - (t.guard || 0))) - (t.armor || 0)), true);   // GEGNER-WERTE
          planEv('schuss', r, `${nameOf(r)} überhitzt und feuert einen grellen Strahl auf ${nameOf(t)}.`, `${nameOf(r)} overheats and fires a blinding beam at ${nameOf(t)}.`, !PL.bigUsed);
          PL.bigUsed = true;
          if (miss) events.push({ k: 'hit', side: 'enemy', from: idx(r), to: idx(t), dmg: 0, miss: true, hp: t.hp, eff: '' });
          else events.push({ k: 'dmg', side: 'crew', list: [{ to: idx(t), dmg: Math.min(t.hp, d), hp: damage(t, d) }], by: r.id, plan: 'schuss' });
          r.cool = true;
          checkRevives();
        });
      }
    }
    function planFall() {
      const k = PL.key;
      if (k === 'untot') enemies.forEach(u => {
        if (u.hp === 0 && inPlan(u) && !u.undead && alive(crew).length) {
          u.undead = true;
          u.hp = Math.max(1, Math.ceil(u.max * PV.undead));
          events.push({ k: 'revive', side: 'enemy', list: [{ to: idx(u), hp: u.hp }], by: u.id, plan: 'untot' });
          planEv('auf', u, `${nameOf(u)} steht wieder auf. Niemand hat ihn darum gebeten.`, `${nameOf(u)} gets back up. Nobody asked.`);
        }
      });
      if (k === 'pirat') {
        const grp = enemies.filter(inPlan), down = grp.filter(u => u.hp <= 0).length;
        if (down <= PL.down) return;
        const add = down - PL.down;
        PL.down = down;
        const rest = grp.filter(u => u.hp > 0);
        if (!rest.length || !alive(crew).length) return;
        rest.forEach(u => { u.atk = Math.round(u.atk * Math.pow(1 + PV.frenzy, add)); });
        if (rest.length === 1 && !PL.last) {
          PL.last = true; rest[0].planDouble = true;
          planEv('letzter', rest[0], `${nameOf(rest[0])} ist allein übrig und nimmt das persönlich: schlägt jetzt doppelt.`, `${nameOf(rest[0])} is the last one standing and takes it personally: now strikes twice.`, !PL.bigUsed);
          PL.bigUsed = true;
        } else planEv('rausch', rest[0], `Rausch! Die Piraten werden wütender: +${Math.round(PV.frenzy * 100)} % Angriff.`, `Frenzy! The pirates get angrier: +${Math.round(PV.frenzy * 100)} % attack.`);
      }
    }
    PL = pickPlan();
    // ---------- NEXT: Landgang-Endgegner mit Mechanik ----------
    // o.mech = { id, countered, plan }. Nur der Landgang setzt das, Runs und Duelle bleiben unberührt.
    function mechSetup() {
      if (!o.mech || !o.mech.id) return null;
      const boss = enemies.find(e => e.boss) || enemies[0];
      if (!boss) return null;
      const m = { id: o.mech.id, c: !!o.mech.countered, plan: o.mech.plan || null, boss };
      m.drum = enemies.find(e => e.ref && e.ref.drummer) || null;
      m.larvae = enemies.filter(e => e.ref && e.ref.larva);
      // Ausgleich: Wer eine Mechanik hat, hat etwas weniger Masse
      boss.max = Math.round(boss.max * 0.92); boss.hp = Math.min(boss.hp, boss.max);
      // Kleiner Nutzen jeder Wahl, auch wenn sie nicht kontert
      if (m.plan === 'focus' && m.drum) FOCUS = m.drum;
      if (m.plan === 'clear' && m.larvae.length) FOCUS = m.larvae[0];
      if (m.plan === 'guard') crew.forEach(u => { u.guard = (u.guard || 0) + 0.03; });
      if (m.plan === 'feint') boss.status.stun = true;
      return m;
    }
    function mechEv(step, u, de, en, big, short) {
      events.push({ k: 'plan', side: 'enemy', plan: 'mech', step, to: u ? idx(u) : null, by: u ? u.id : null, text: de, en, big: big || undefined, short, title: [M.name || '', M.en || ''] });
    }
    function hitCrew(list, pct, by) {
      const out = list.filter(u => u.hp > 0).map(u => { const d = Math.max(1, Math.round(u.max * pct * (1 - Math.min(0.6, u.guard || 0)))); return { to: idx(u), dmg: Math.min(u.hp, d), hp: damage(u, d) }; });
      if (out.length) events.push({ k: 'dmg', side: 'crew', list: out, by });
    }
    function mechRound(r) {
      const B = M.boss, team = alive(crew);
      if (B.hp <= 0 || !team.length) return;
      const nm = nameOf(B);
      if (r === 1) {
        const intro = {
          drummer: ['Trommelwirbel! Solange der Trommler spielt, prallt fast alles an ' + nm + ' ab.', 'Drumroll! While the drummer plays, almost everything bounces off ' + nm + '.'],
          feast: [nm + ' hat Hunger. Alle drei Runden frisst er sich gesund.', nm + ' is hungry. Every third round he eats himself healthy.'],
          whirl: [nm + ' wetzt die Klingen. Alle drei Runden wirbelt er durch die ganze Crew.', nm + ' sharpens his blades. Every third round he whirls through the whole crew.'],
          storm: ['Über ' + nm + ' braut sich ein Gewitter zusammen. Wer vorne steht, wird gegrillt.', 'A storm gathers above ' + nm + '. Whoever stands in front gets grilled.'],
          tekkai: [nm + ' kann sich in Eisen verwandeln. Alle drei Runden ist er unverwundbar.', nm + ' can turn to iron. Every third round he is invulnerable.'],
          vanish: [nm + ' verschwindet jede zweite Runde. Wen man nicht sieht, trifft man schlecht.', nm + ' vanishes every second round. What you can’t see, you can’t hit.'],
          larvae: [nm + ' hat Gehilfen dabei. Jede Runde, die sie leben, macht ihn stärker.', nm + ' brought helpers. Every round they live makes him stronger.'],
          flood: ['Das Wasser steigt. Alle drei Runden rollt eine Flutwelle über die Crew.', 'The water rises. Every third round a flood wave rolls over the crew.'],
          powder: ['Überall Pulverfässer. Jeder Treffer auf ' + nm + ' kann eins hochgehen lassen.', 'Powder kegs everywhere. Every hit on ' + nm + ' may set one off.']
        }[M.id];
        if (intro) mechEv('start', B, intro[0], intro[1], true, [M.name || '', M.en || '']);
        if (M.c) mechEv('konter', B, 'Euer Plan passt: Die Mechanik ist durchschaut.', 'Your plan fits: the mechanic is seen through.', false, ['Konter!', 'Counter!']);
      }
      const third = r % 3 === 0, before = r % 3 === 2;
      if (M.id === 'drummer') {
        if (M.drum && M.drum.hp <= 0 && !M.drumDown) { M.drumDown = true; mechEv('takt', B, 'Der Trommler liegt. Ohne Takt ist ' + nm + ' nur noch ein Clown.', 'The drummer is down. Without the beat ' + nm + ' is just a clown.', true, ['Takt weg!', 'Beat gone!']); }
      } else if (M.id === 'feast') {
        if (before) mechEv('kaut', B, nm + ' kaut schon vor …', nm + ' is already chewing …', false, ['kaut …', 'chews …']);
        if (third) {
          if (M.c) { B.status.stun = true; mechEv('finte', B, 'Finte! ' + nm + ' beißt ins Leere und verschluckt sich.', 'Feint! ' + nm + ' bites thin air and chokes.', true, ['Ins Leere!', 'Missed!']); }
          else { const a = heal(B, Math.round(B.max * 0.07)); if (a > 0) { events.push({ k: 'heal', side: 'enemy', list: [{ to: idx(B), amount: a, hp: B.hp }], by: 'mech' }); mechEv('frisst', B, nm + ' frisst sich satt: +' + a + ' Leben.', nm + ' eats his fill: +' + a + ' health.', true, ['Frisst!', 'Feasts!']); } }
        }
      } else if (M.id === 'whirl' || M.id === 'flood') {
        if (before) mechEv('vor', B, M.id === 'whirl' ? nm + ' dreht sich ein …' : 'Das Wasser zieht sich zurück …', M.id === 'whirl' ? nm + ' winds up …' : 'The water draws back …', false, M.id === 'whirl' ? ['dreht sich …', 'winds up …'] : ['Ebbe …', 'Ebb …']);
        if (third) {
          const pct = M.c ? (M.id === 'whirl' ? 0 : 0.02) : 0.07;
          mechEv('los', B, M.c ? 'Schildwall genau rechtzeitig. Es rauscht, aber es hält.' : (M.id === 'whirl' ? 'Klingenwirbel durch die ganze Crew!' : 'Flutwelle!'), M.c ? 'Shield wall just in time. It roars, but it holds.' : (M.id === 'whirl' ? 'Blade whirl through the whole crew!' : 'Flood wave!'), true, M.id === 'whirl' ? ['Wirbel!', 'Whirl!'] : ['Flut!', 'Flood!']);
          if (pct > 0) hitCrew(team, pct, 'mech'); else if (M.id === 'whirl') { mechEv('prall', B, nm + ' prallt am Schildwall ab. Klirrt schön, tut aber keinem weh.', nm + ' bounces off the shield wall. Lovely clang, no harm done.', false, ['Abgeprallt!', 'Bounced!']); }
        }
      } else if (M.id === 'storm') {
        if (before) mechEv('vor', B, 'Es knistert über der Crew …', 'It crackles above the crew …', false, ['knistert …', 'crackles …']);
        if (third) {
          const tgt = M.c ? team.slice(0, 1) : team.slice(0, 2);
          mechEv('blitz', B, M.c ? 'Abstand gehalten: Der Blitz findet nur einen.' : 'Blitz! Die Vordersten glühen.', M.c ? 'Spread out: the bolt finds only one.' : 'Lightning! The front glows.', true, ['Blitz!', 'Bolt!']);
          hitCrew(tgt, M.c ? 0.06 : 0.12, 'mech');
        }
      } else if (M.id === 'tekkai') {
        M.iron = false;
        if (r % 3 === 1 && r > 1) mechEv('vor', B, nm + ' spannt jeden Muskel an …', nm + ' tenses every muscle …', false, ['spannt an …', 'tenses …']);
        if (before) {
          if (M.c) mechEv('finte', B, 'Finte! ' + nm + ' wird zu früh zu Eisen und muss wieder lockerlassen.', 'Feint! ' + nm + ' turns to iron too early and has to let go.', true, ['Verpufft!', 'Fizzled!']);
          else { M.iron = true; mechEv('eisen', B, 'Tekkai! ' + nm + ' ist diese Runde aus Eisen.', 'Tekkai! ' + nm + ' is made of iron this round.', true, ['Eisen!', 'Iron!']); }
        }
      } else if (M.id === 'vanish') {
        M.hidden = !M.c && r % 2 === 0;
        if (M.hidden || (M.c && r === 2)) mechEv('weg', B, M.c ? nm + ' wird unsichtbar – aber ihr habt ihn im Blick.' : nm + ' wird unsichtbar. Die Crew schlägt ins Leere.', M.c ? nm + ' turns invisible – but you keep him in sight.' : nm + ' turns invisible. The crew swings at nothing.', r <= 2, ['unsichtbar …', 'invisible …']);
      } else if (M.id === 'larvae') {
        if (r === 1 && M.c) {
          const list = M.larvae.filter(l => l.hp > 0).map(l => ({ to: idx(l), dmg: l.hp, hp: damage(l, l.hp) }));
          if (list.length) { mechEv('raus', B, 'Aufgeräumt! Die Gehilfen fliegen raus, bevor sie helfen können.', 'Tidied up! The helpers are thrown out before they can help.', true, ['Raus!', 'Out!']); events.push({ k: 'dmg', side: 'enemy', list, by: 'mech' }); }
        }
        const n = M.larvae.filter(l => l.hp > 0).length;
        if (n && r > 1) { const add = Math.max(1, Math.round(B.atk * 0.05 * n)); B.atk += add; M.gain = (M.gain || 0) + add; mechEv('stark', B, n + ' Gehilfen jubeln ' + nm + ' zu: +' + add + ' Angriff.', n + ' helpers cheer ' + nm + ' on: +' + add + ' attack.', false, ['+' + add + ' ⚔', '+' + add + ' ⚔']); }
        if (!n && !M.cleared && M.larvae.length) { M.cleared = true; B.atk = Math.max(1, Math.round((B.atk - (M.gain || 0)) * 0.85)); mechEv('leer', B, 'Keine Gehilfen mehr. ' + nm + ' wirkt plötzlich sehr allein.', 'No helpers left. ' + nm + ' suddenly looks very alone.', true, ['Allein!', 'Alone!']); }
        if (M.plan === 'clear') { const nx = M.larvae.find(l => l.hp > 0); FOCUS = nx || B; }
      } else if (M.id === 'powder') {
        const hits = M.hits || 0; M.hits = 0;
        let booms = 0; for (let k = 0; k < hits; k++) if (R.float(run) < 0.3) booms++;
        booms = Math.min(1, booms);
        for (let k = 0; k < booms; k++) {
          const tgt = M.c ? [team[Math.floor(R.float(run) * team.length)]] : team;
          mechEv('bumm', B, M.c ? 'Ein Fass geht hoch – aber ihr steht weit genug auseinander.' : 'Ein Pulverfass geht hoch! Alle in der Nähe fliegen mit.', M.c ? 'A keg blows – but you stand far enough apart.' : 'A powder keg blows! Everyone nearby goes flying.', true, ['Bumm!', 'Boom!']);
          hitCrew(tgt, M.c ? 0.04 : 0.05, 'mech');
        }
      }
    }
    let rounds = 0;
    // Duell-Kommandos (nur Stammcrew-Duell, nur mit o.duel): vor jedem Zug steht eine Zug-Marke im Protokoll.
    // Ein Kommando wirkt vor dem genannten Zug. Alles davor bleibt Ereignis für Ereignis gleich,
    // deshalb kann die Wiedergabe nach einem Tipp nahtlos mit dem neu gerechneten Verlauf weiterlaufen.
    // FUN: Run-Kämpfe bekommen dieselben Zug-Marken (o.turns) und Kapitänsbefehle (o.cmds) plus ein Fokusziel (o.focus).
    // Ohne Befehle und Fokus läuft alles wie vorher, nur mit Marken im Protokoll.
    const DUEL = !!o.duel, TURNS = DUEL || !!o.turns, CMDS = TURNS && Array.isArray(o.cmds) ? o.cmds : [];
    const DK = C.duelCmds || {}, RK = C.runCmds || {};
    const cmdBuff = [];
    let turnNo = 0;
    let FOCUS = !DUEL && o.focus != null && enemies[o.focus] ? enemies[o.focus] : null;
    M = mechSetup();
    function cmdTurn() {
      for (let k = cmdBuff.length - 1; k >= 0; k--) if (cmdBuff[k].until < turnNo) { const b = cmdBuff[k]; if (b.guard) b.u.guard = Math.max(0, (b.u.guard || 0) - b.guard); else b.u.atk = Math.max(1, b.u.atk - b.add); cmdBuff.splice(k, 1); }
      CMDS.forEach(c => {
        if (!c || c.at !== turnNo) return;
        const team = alive(crew), foes = alive(enemies);
        if (!team.length || !foes.length) return;
        if (!DUEL) { runCmd(c, team, foes); return; }
        if (c.cmd === 'cheer') {
          team.forEach(u => { const add = Math.max(1, Math.round(u.atk * (DK.cheerAtk || 0.12))); u.atk += add; cmdBuff.push({ u, add, until: turnNo + (DK.cheerTurns || 5) }); });
          events.push({ k: 'cmd', cmd: 'cheer', side: 'crew', list: team.map(u => idx(u)) });
        } else if (c.cmd === 'food') {
          const t = team.reduce((x, y) => (y.hp / y.max < x.hp / x.max ? y : x));
          const amount = heal(t, Math.round(t.max * (DK.food || 0.25)));
          events.push({ k: 'cmd', cmd: 'food', side: 'crew', to: idx(t) });
          if (amount > 0) events.push({ k: 'heal', side: 'crew', list: [{ to: idx(t), amount, hp: t.hp }], by: 'proviant' });
        } else if (c.cmd === 'dice') {
          const r = R.float(run);
          if (r < (DK.salvoP || 0.4)) {
            const avg = team.reduce((x, u) => x + u.atk, 0) / team.length;
            const list = foes.map(f => { const d = Math.max(1, Math.round(avg * (DK.salvo || 0.5) * (0.7 + R.float(run) * 0.6))); return { to: idx(f), dmg: Math.min(f.hp, d), hp: damage(f, d) }; });
            events.push({ k: 'cmd', cmd: 'dice', res: 'salvo', side: 'crew' });
            events.push({ k: 'dmg', side: 'enemy', list, by: 'gluecksschuss' });
          } else if (r < (DK.salvoP || 0.4) + (DK.tripP || 0.3)) {
            const big = foes.reduce((x, y) => (y.atk > x.atk ? y : x)); big.status.stun = true;   // der Stärkste stolpert
            events.push({ k: 'cmd', cmd: 'dice', res: 'trip', side: 'crew', to: idx(big) });
          } else events.push({ k: 'cmd', cmd: 'dice', res: 'flop', side: 'crew' });
        }
      });
    }

    // Kapitänsbefehle im Run (FUN). Wirken vor dem genannten Zug.
    function runCmd(c, team, foes) {
      if (c.cmd === 'focus') {
        const t = enemies[c.to];
        if (t && t.hp > 0) { FOCUS = t; events.push({ k: 'cmd', cmd: 'focus', side: 'crew', to: idx(t) }); }
      } else if (c.cmd === 'rally') {
        const pct = RK.rallyAtk || 0.15;
        team.forEach(u => { const add = Math.max(1, Math.round(u.atk * pct)); u.atk += add; cmdBuff.push({ u, add, until: turnNo + (RK.rallyTurns || 6) }); });
        events.push({ k: 'cmd', cmd: 'rally', side: 'crew', list: team.map(u => idx(u)) });
      } else if (c.cmd === 'guard') {
        const g = (RK.guard || 0.25) + (o.burst === 'wall' ? 0.1 : 0);
        team.forEach(u => { u.guard = (u.guard || 0) + g; cmdBuff.push({ u, guard: g, until: turnNo + (RK.guardTurns || 6) }); });
        events.push({ k: 'cmd', cmd: 'guard', side: 'crew', list: team.map(u => idx(u)) });
      } else if (c.cmd === 'burst') {
        const kind = o.burst || 'strike';
        if (kind === 'mend') {
          const list = team.map(u => ({ to: idx(u), amount: heal(u, Math.round(u.max * (RK.mend || 0.2))), hp: u.hp })).filter(x => x.amount > 0);
          events.push({ k: 'cmd', cmd: 'burst', res: 'mend', side: 'crew' });
          if (list.length) events.push({ k: 'heal', side: 'crew', list, by: 'befehl' });
        } else if (kind === 'stun') {
          const fast = foes.reduce((a, b) => (b.atk > a.atk ? b : a)); fast.status.stun = true;
          events.push({ k: 'cmd', cmd: 'burst', res: 'stun', side: 'crew', to: idx(fast) });
        } else {
          const cap = team[0];
          const t = FOCUS && FOCUS.hp > 0 ? FOCUS : foes.reduce((a, b) => (b.hp < a.hp ? b : a));
          const d = Math.max(1, Math.round(cap.atk * (RK.strike || 2.2) * typeMult(cap.type, t.type)));
          events.push({ k: 'cmd', cmd: 'burst', res: 'strike', side: 'crew', from: idx(cap), to: idx(t) });
          events.push({ k: 'dmg', side: 'enemy', list: [{ to: idx(t), dmg: Math.min(t.hp, d), hp: damage(t, d) }], by: 'kapitaensschlag' });
        }
      }
    }

    // ---------- Runden ----------
    // C3: Duo-Momente sichtbar machen (nur Anzeige): Schlagen beide Duo-Partner in einer Runde dasselbe Ziel, gibt es eine kurze Szene.
    const DUOS = !pvp && kind !== 'duel' && GL.effects && GL.effects.duos ? GL.effects.duos(crew) : [];
    let duoFrom = events.length, duoShown = 0;
    const duoSeen = {};
    function duoCheck() {
      if (!DUOS.length || duoShown >= 2) return;
      const hitBy = {};
      for (let k = duoFrom; k < events.length; k++) { const e = events[k]; if (e.k === 'hit' && e.side === 'crew' && !e.miss && e.dmg > 0 && crew[e.from]) (hitBy[e.to] = hitBy[e.to] || new Set()).add(crew[e.from].id); }
      DUOS.forEach(d => {
        if (duoShown >= 2 || duoSeen[d.a + d.b]) return;
        const t = Object.keys(hitBy).find(x => hitBy[x].has(d.a) && hitBy[x].has(d.b));
        if (t == null) return;
        const A = crew.findIndex(u => u.id === d.a && u.hp > 0), B2 = crew.findIndex(u => u.id === d.b && u.hp > 0);
        if (A < 0 || B2 < 0) return;
        duoSeen[d.a + d.b] = true; duoShown++;
        events.push({ k: 'duo', side: 'crew', a: A, b: B2, to: Number(t), name: d.name, text: d.text });
      });
    }
    while (alive(crew).length && rounds < C.battleRoundsMax && (alive(enemies).length || callWave())) {
      if (rounds > 0) duoCheck();
      rounds++;
      events.push({ k: 'round', n: rounds });
      duoFrom = events.length;
      // Boss holt aus: alle 3 Runden kündigt er einen schweren Schlag an, der in der nächsten Runde kommt.
      // Konter: Ausweichen zählt doppelt, Rüstung (Bollwerk) doppelt.
      if (!pvp && BF.windup) enemies.forEach(e => {
        if (e.hp <= 0 || !(e.boss || e.raid)) return;
        if (e.wind === 1) e.wind = 2;
        else if (!e.wind && rounds % 3 === 2) { e.wind = 1; events.push({ k: 'windup', side: 'enemy', to: idx(e), by: e.id }); }
      });
      // Zustände, die alle n Runden kommen (z. B. Smokers Rauch)
      crew.concat(enemies).filter(u => u.hp > 0).forEach(u => {
        const st = statusOf(u);
        if (st && st.when === 'every' && rounds % st.n === 0) spreadStatus(u, st);
      });
      if (PL) planRound(rounds);
      if (M) mechRound(rounds);
      launeRound(rounds);
      if (!alive(crew).length) break;
      const queue = crew.concat(enemies).filter(u => u.hp > 0);
      if (LX && LX.wx.shuffle) {
        // Glitschiges Deck: wer zuerst dran ist, entscheidet jede Runde (fast nur) das Glück
        queue.forEach(u => { u.tb = u.spd * 0.06 + R.float(run); });
        queue.sort((a, b) => b.tb - a.tb);
      } else if (pvp) {
        // Duell: bei gleichem Tempo entscheidet der Zufall, wer zuerst handelt (sonst hätte der Angreifer immer Vorteil)
        queue.forEach(u => { u.tb = R.float(run); });
        queue.sort((a, b) => b.spd - a.spd || b.tb - a.tb);
      } else queue.sort((a, b) => b.spd - a.spd);

      for (const u of queue) {
        if (!alive(enemies).length || !alive(crew).length) break;   // Kampf schon entschieden
        if (TURNS) { turnNo++; events.push({ k: 'turn', t: turnNo }); if (CMDS.length) { cmdTurn(); if (!alive(enemies).length) break; } }
        drama();
        if (u.hp <= 0) continue;
        if (u.status.stun) {
          delete u.status.stun;
          events.push({ k: 'skip', side: u.side, to: idx(u) });
          continue;
        }
        // Roboter kühlt nach dem grellen Schuss eine Aktion lang ab
        if (u.cool) { u.cool = false; if (PL) planEv('kuehlen', u, `${nameOf(u)} kühlt ab. Es dampft und riecht nach Lötzinn.`, `${nameOf(u)} cools down. It steams and smells of solder.`); continue; }
        // Boss-Signatur: angekündigt, kommt jetzt statt des normalen Angriffs
        if (u.sigPending && u.side === 'enemy' && SIG[u.id]) { doSig(u); continue; }
        // Ulti: Bei voller Leiste zündet sie mit etwas Glück sofort, spätestens im übernächsten Zug.
        // Selten springt schon bei halb voller Leiste ein Funke über (Glücks-Ulti).
        if (u.ult && u.energy >= U.max) {
          if ((u.ultWait || 0) >= (U.maxWait || 2) || R.float(run) < (U.fireChance || 0.6)) { doUlt(u); continue; }
          u.ultWait = (u.ultWait || 0) + 1;
        } else if (u.ult && u.energy >= U.max * 0.5 && R.float(run) < (U.spark || 0)) { doUlt(u, true); continue; }
        const foes = foesOf(u);
        // Tempo-Stil: Chance auf einen Extra-Zug. Letzter Pirat im Rausch schlägt doppelt.
        const baseAtt = u.ability === 'double' || u.planDouble ? 2 : 1;
        const extra = u.extraTurn > 0 && R.float(run) < Math.min(0.6, u.extraTurn) ? 1 : 0;
        const attacks = baseAtt + extra;

        for (let n = 0; n < attacks; n++) {
          const living = foes.filter(f => f.hp > 0);
          if (!living.length || u.hp <= 0) break;
          if (extra && n === baseAtt) events.push({ k: 'extra', side: u.side, from: idx(u) });

          // Zweikampf (Kampf-Laune): die beiden Stärksten suchen sich gegenseitig.
          // Spott (Bollwerk): Brecher ziehen die Angriffe auf sich (Stufe 2 auch die von Schützen).
          // Rudeljagd: Tiere stürzen sich gemeinsam auf ein Opfer.
          // sniper: schwächstes Ziel, bully: stärkstes Ziel (meister Angriff),
          // sonst: Leibwache (taunt) fängt ab, ansonsten wer vorne steht
          let target = null;
          if (LX && LX.duel && (u === LX.duel[0] || u === LX.duel[1])) { const other = u === LX.duel[0] ? LX.duel[1] : LX.duel[0]; if (other.hp > 0 && living.includes(other)) target = other; }
          const taunter = target ? null : living.find(f => f.taunt > 0);
          if (taunter && (taunter.taunt >= 2 || (u.ability !== 'sniper' && u.ability !== 'bully'))) target = taunter;
          // Fokusziel (Kapitän hat einen Gegner markiert): die Crew geht bevorzugt auf ihn
          if (!target && FOCUS && u.side === 'crew' && FOCUS.hp > 0 && living.includes(FOCUS)) target = FOCUS;
          if (!target && inPlan(u) && PL.key === 'tiere' && u.ability !== 'sniper') {
            if (!PL.prey || PL.prey.hp <= 0 || !living.includes(PL.prey)) PL.prey = living.reduce((a, b) => (b.hp / b.max < a.hp / a.max ? b : a));
            target = PL.prey;
          }
          if (!target) target = u.ability === 'sniper'
            ? living.reduce((a, b) => (b.hp < a.hp ? b : a))
            : u.ability === 'bully'
              ? living.reduce((a, b) => (b.atk > a.atk ? b : a))
              : pickTarget(u, living);
          const to = foes.indexOf(target);

          let mult = typeMult(u.type, target.type);
          if (mult < 1 && u.ignoreWeak) mult = 1;
          if (mult > 1 && u.side === 'crew') mult += flags.effBonus;

          // Schaden schwankt prozentual (±dmgSpreadPct), dazu eine kleine Grund-Krit-Chance für alle
          const sp = C.dmgSpreadPct != null ? C.dmgSpreadPct : 0.18;
          let dmg = u.atk * (1 + (R.float(run) * 2 - 1) * sp) * mult * (1 + u.dmgPct);
          if (target.boss || target.mini) dmg *= 1 + u.bossPct;
          if (u.side === 'crew') dmg *= 1 + wxDmg;
          if (isDuelPair(u, target)) dmg *= 1 + (LX.wx.duel || 0);
          const KR = GL.effects.critOf(u, wxCrit);   // STATS: Deckel (config.caps.crit), darüber wird es Krit-Schaden
          const critCh = KR.ch;
          let crit = critCh > 0 && R.float(run) < critCh;
          // KAMPFTIEFE: Blöße (von Technik markiert) -> Klinge trifft sicher kritisch. Schwachstelle: Technik gegen Geschwächt/Betäubt
          const opening = KT && u.side === 'crew' && u.type === 'klinge' && !!target.mark;
          if (opening) { crit = true; target.mark = false; dmg *= 1 + CH.open; }
          const expose = KT && u.side === 'crew' && u.type === 'technik' && !!(target.status.weak || target.status.stun);
          if (expose) dmg *= 1 + CH.expose;          if (crit) dmg *= KR.mult;
          if (u.status.fear) dmg *= 0.65;
          if (target.status.weak) dmg *= 1.25;
          if (FX) dmg *= FX.dmgMult(u, target);
          if (behindGuards(u, target)) dmg *= FM.ranged;
          const heavy = u.wind === 2 && u.side === 'enemy';
          if (heavy) { dmg *= BF.windup; u.wind = 0; }
          const rawDmg = Math.max(1, Math.round(dmg));
          { const base = Math.round(dmg * (1 - Math.min(0.6, target.guard || 0))); dmg = Math.max(1, Math.round(base * 0.2), base - (expose ? 0 : target.armor) * (heavy ? 2 : 1)); }   // Rüstung schluckt höchstens 80 %
          const absorbed = rawDmg - dmg;   // nur Anzeige: was Rüstung/Schutz geschluckt hat

          let blocked = false;
          let miss = false;
          if (u.side === 'enemy' && firstBlock > 0) { blocked = true; firstBlock--; dmg = 0; }
          else if ((target.dodge || 0) + wxMiss > 0 && R.float(run) < Math.min(DCAP, ((target.dodge || 0) + wxMiss) * (heavy ? 2 : 1))) { miss = true; dmg = 0; }   // Deckel: höchstens 60 % Ausweichen (STATS: config.caps.dodge, Überlauf = Schutz, siehe effects.js)

          // Volltreffer: seltener Glücksschlag der eigenen Crew
          let lucky = false;
          if (dmg > 0 && u.side === 'crew' && R.float(run) < (C.luckyHit || 0)) { lucky = true; dmg = Math.round(dmg * 2.5); }
          // KAMPFTIEFE: Standhaft – ein Brecher der Crew übersteht einmal pro Kampf einen tödlichen Treffer mit 1 Leben
          if (u.side === 'enemy' && dmg > 0) dmg = foeCap(target, dmg, heavy);   // GEGNER-WERTE: kein Einzeltreffer über den Deckel (Ankündigung darf mehr)
          let stand = false;
          if (KT && CH.stand !== false && dmg > 0 && target.side === 'crew' && target.role === 'brecher' && !target.stood && target.hp > 1 && target.hp >= target.max * (CH.standAt || 0) && dmg >= target.hp) { dmg = target.hp - 1; target.stood = true; stand = true; }
          damage(target, dmg);
          charge(u, U.gainHit);
          if (dmg > 0) charge(target, U.gainHurt);
          const eff = mult > 1 ? 'strong' : mult < 1 ? 'weak' : '';
          const flank = u.flank; u.flank = undefined;
          events.push({ k: 'hit', side: u.side, from: idx(u), to, dmg, crit: crit && dmg > 0, lucky, eff, blocked, miss, hp: target.hp, heavy: heavy || undefined, flank: flank || undefined,
            ea: u.ult ? u.energy : null, et: target.ult ? target.energy : null, ab: !miss && !blocked && absorbed > 0 ? absorbed : undefined,
            op: opening && dmg > 0 || undefined, xp: expose && dmg > 0 || undefined, stand: stand || undefined, mk: KT && u.side === 'crew' && u.type === 'technik' && dmg > 0 && target.hp > 0 && blades() || undefined });
          if (KT && u.side === 'crew' && crit && dmg > 0) moAdd(1);
          if (stand) moAdd(1);

          // „Für den Boss!“: Trifft die Crew den Anführer, wird sein Gefolge einmal pro Kampf wütend
          if (!pvp && FM.on && !rallied && dmg > 0 && u.side === 'crew' && isLead(target)) {
            const gs = alive(enemies).filter(f => !isLead(f));
            if (gs.length) {
              rallied = true;
              gs.forEach(f => { f.atk = Math.round(f.atk * (1 + FM.rally)); });
              events.push({ k: 'note', by: target.id, side: 'enemy', ai: 'rally', text: `„Für den Boss!“ Das Gefolge von ${nameOf(target)} wird wütend: +${Math.round(FM.rally * 100)} % Angriff.` });
            }
          }
          // Konter: Bosse schlagen manchmal sofort zurück
          if (!pvp && dmg > 0 && target.hp > 0 && (target.boss || target.raid) && u.side === 'crew' && !target.status.stun && R.float(run) < (BF.counter || 0)) {
            const cd = foeCap(u, Math.max(1, Math.round(target.atk * (BF.counterMult || 0.6) * typeMult(target.type, u.type) * (1 - (u.guard || 0))) - (u.armor || 0)), false);   // GEGNER-WERTE: Konter gedeckelt
            damage(u, cd);
            events.push({ k: 'counter', side: 'enemy', from: idx(target), to: idx(u), dmg: cd, hp: u.hp });
            checkRevives();
          }
          // Schwertkunst: Klinge-Figuren parieren und schlagen sofort zurück (keine Konter auf Konter)
          if (dmg > 0 && target.hp > 0 && u.hp > 0 && target.riposte > 0 && !target.status.stun && R.float(run) < Math.min(0.6, target.riposte)) {
            // Konter können kritisch sein (Klinge-Figuren haben viel Krit)
            const RK = GL.effects.critOf(target);   // STATS: Konter mit demselben Deckel + Überlauf
            const rcrit = R.float(run) < RK.ch;
            const rc = Math.max(1, Math.round(target.atk * (C.riposteMult || 0.7) * (rcrit ? RK.mult : 1) * typeMult(target.type, u.type) * (1 + (target.dmgPct || 0)) * (1 - (u.guard || 0))) - (u.armor || 0));
            damage(u, rc);
            events.push({ k: 'riposte', side: target.side, from: idx(target), to: idx(u), dmg: rc, hp: u.hp, crit: rcrit || undefined });
            checkRevives();
          }
          // Sturmtrupp: wer einen Gegner umhaut, setzt mit Schwung nach
          if (dmg > 0 && target.hp === 0 && u.hp > 0 && u.killChain > 0 && R.float(run) < u.killChain) {
            const next = foes.find(f => f.hp > 0);
            if (next) {
              const d = Math.max(1, Math.round(u.atk * 0.7 * (1 + (u.dmgPct || 0)) * typeMult(u.type, next.type) * (1 - (next.guard || 0))) - (next.armor || 0));
              events.push({ k: 'dmg', side: next.side, list: [{ to: foes.indexOf(next), dmg: Math.min(next.hp, d), hp: damage(next, d) }], by: u.id, chain: true });
              checkRevives();
            }
          }
          // Fähigkeiten nach einem Treffer
          if (dmg > 0) {
            if (FX) FX.onHit(u, target, dmg);
            // KAMPFTIEFE: Stil-Ketten der Crew
            if (KT && u.side === 'crew' && target.hp > 0) {
              if (u.type === 'technik' && blades()) target.mark = true;
              if (u.type === 'kraft' && target.status.bleed) {
                const b = target.status.bleed, d = Math.max(1, Math.round((b.value || 2) * Math.max(1, b.rounds) * CH.rip));
                delete target.status.bleed;
                events.push({ k: 'dmg', side: target.side, list: [{ to, dmg: Math.min(target.hp, d), hp: damage(target, d) }], by: u.id, rip: true, from: idx(u) });
                moAdd(1);
              } else if (u.type === 'klinge' && crit) {
                const got = addStatus(target, 'bleed', CH.cutRounds, Math.max(2, Math.round(u.atk * CH.cut)));
                if (got) events.push({ k: 'status', side: target.side, list: [got], by: u.id, cut: true });
              }
            }
            // Wucht: harte Treffer brechen die Rüstung (Geschwächt: +25 % Schaden)
            if (u.armorBreak > 0 && target.hp > 0 && !target.status.weak && R.float(run) < u.armorBreak) {
              const got = addStatus(target, 'weak', 2);
              if (got) events.push({ k: 'status', side: target.side, list: [got], by: u.id, brk: true });
            }
            // Rudeljagd: Bisse lassen bluten
            if (inPlan(u) && PL.key === 'tiere' && target.hp > 0 && R.float(run) < PV.bite) {
              const got = addStatus(target, 'bleed', 2, Math.max(2, Math.round(u.atk * 0.25)));
              if (got) events.push({ k: 'status', side: target.side, list: [got], by: u.id, plan: 'biss' });
            }
            const st = statusOf(u);
            if (st && st.when === 'hit' && target.hp > 0 && (!st.chance || R.float(run) < st.chance)) spreadStatus(u, st, target);
            if (u.ability === 'ramp') u.atk += u.power;

            if (u.ability === 'lifesteal') {
              const got = heal(u, Math.round(dmg * u.power));
              if (got > 0) events.push({ k: 'heal', side: u.side, list: [{ to: idx(u), amount: got, hp: u.hp }], by: u.id });
            }

            if (u.ability === 'burn') {
              const d = Math.max(1, Math.round(dmg * u.power));
              const list = foes.filter(f => f !== target && f.hp > 0)
                .map(f => ({ to: foes.indexOf(f), dmg: d, hp: damage(f, d) }));
              if (list.length) events.push({ k: 'dmg', side: target.side, list, by: u.id });
            }

            if (u.ability === 'chain') {
              const next = foes.slice(to + 1).find(f => f.hp > 0);
              if (next) {
                const d = Math.max(1, Math.round(dmg * u.power));
                events.push({ k: 'dmg', side: target.side, list: [{ to: foes.indexOf(next), dmg: d, hp: damage(next, d) }], by: u.id });
              }
            }

            if (u.ability === 'execute' && target.hp > 0 && target.hp < target.max * 0.25 && R.float(run) < u.power) {
              const d = target.hp;
              events.push({ k: 'dmg', side: target.side, list: [{ to, dmg: d, hp: damage(target, d) }], by: u.id });
            }

            if (target.ability === 'thorns' && u.hp > 0) {
              events.push({ k: 'dmg', side: u.side, list: [{ to: idx(u), dmg: target.power, hp: damage(u, target.power) }], by: target.id });
            }
          }

          checkRevives();
        }
        moDeaths();
      }

      // ---------- Rundenende ----------
      // Blutung und Brand
      ['crew', 'enemy'].forEach(side => {
        const list = [];
        sideOf(side).forEach((u, i) => {
          if (u.hp <= 0) return;
          const d = ['bleed', 'burning', 'poison'].reduce((s, k) => s + (u.status[k] ? u.status[k].value || 2 : 0), 0);
          if (d > 0) list.push({ to: i, dmg: Math.min(u.hp, d), hp: damage(u, d) });
        });
        if (list.length) events.push({ k: 'dmg', side, list, by: 'bleed' });
      });
      checkRevives();
      moDeaths();
      if (MO.buff && rounds >= MO.buff.until) { MO.buff.list.forEach(b => { b.u.atk = Math.max(1, b.u.atk - b.add); }); MO.buff = null; }
      if (FX) FX.roundEnd();
      // Konter: jeder Helfer entfernt einen schlechten Zustand im eigenen Team (Furcht zuerst)
      [crew, enemies].forEach(team => alive(team).filter(u => u.role === 'helfer').forEach(h => {
        for (const key of DEBUFF_ORDER) {
          const t = alive(team).find(f => f.status[key]);
          if (t) { delete t.status[key]; events.push({ k: 'cleanse', side: t.side, to: idx(t), key, by: h.id }); break; }
        }
      }));
      // Zustände laufen ab (Betäubung erst, wenn sie gewirkt hat)
      crew.concat(enemies).forEach(u => {
        Object.keys(u.status).forEach(k => {
          if (k === 'stun') return;
          if (--u.status[k].rounds <= 0) delete u.status[k];
        });
      });
      [crew, enemies].forEach(team => {
        const regenList = [];
        team.forEach((u, i) => {
          if (u.hp > 0 && u.regen > 0) {
            const got = heal(u, Math.round(u.regen * (u.side === 'crew' ? flags.healMult : 1)));
            if (got > 0) regenList.push({ to: i, amount: got, hp: u.hp });
          }
        });
        if (regenList.length) events.push({ k: 'heal', side: team === crew ? 'crew' : 'enemy', list: regenList, by: 'helfer' });
      });

      // Rudelführer: wird für jeden gefallenen Verbündeten stärker
      crew.concat(enemies).filter(u => u.hp > 0 && u.ability === 'pack').forEach(u => {
        const fallen = allies(u).filter(f => f !== u && f.hp <= 0).length;
        if (fallen > (u.packN || 0)) {
          const add = u.power * (fallen - (u.packN || 0));
          u.packN = fallen; u.atk += add;
          events.push({ k: 'note', by: u.id, side: u.side, text: `${nameOf(u)} wird wütend: +${add} Angriff.` });
        }
      });
      crew.concat(enemies).filter(u => u.hp > 0 && u.ability === 'medic').forEach(u => {
        const hurtAll = alive(allies(u)).filter(f => f.hp < f.max).sort((a, b) => a.hp / a.max - b.hp / b.max);
        const vip = !pvp && FM.on && u.side === 'enemy' ? hurtAll.find(f => isLead(f) && f.hp < f.max * 0.85) : null;
        const hurt = vip || hurtAll[0];
        if (hurt) {
          const got = heal(hurt, Math.round(u.power * (u.side === 'crew' ? flags.healMult : 1)));
          events.push({ k: 'heal', side: u.side, list: [{ to: idx(hurt), amount: got, hp: hurt.hp }], by: u.id });
        }
      });
    }

    // Leben zurück in die echten Figuren schreiben
    crew.forEach(u => { u.ref.hp = u.hp; });
    enemies.forEach(u => { u.ref.hp = u.hp; });
    reserve.forEach(u => { u.ref.hp = u.hp; });

    const win = !alive(enemies).length && !reserve.length && alive(crew).length > 0;
    // Finaler Schlag: der Treffer, der den letzten Gegner fällt, bekommt seinen eigenen Moment
    if (win) for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if ((e.k === 'hit' && e.side === 'crew' && e.hp === 0) || (e.k === 'dmg' && e.side === 'enemy' && e.list.some(x => x.hp === 0))) { e.final = true; break; }
    }
    if (team.crew && kind !== 'duel') run.teamBar = { f: team.crew.faction, n: team.crew.n };
    return { events, win, team: { crew: team.crew, enemy: team.enemy }, mo: KT ? { need: CH.moNeed, fired: MO.fired } : null };
  }

  // Welcher Kapitänsschlag passt zur Crew? (Lazarett heilt, Tempo/Schwertkunst betäuben, Bollwerk stärkt den Schildwall)
  function burstKind(crewList) {
    const b = GL.effects && GL.effects.build ? GL.effects.build(crewList || []) : null;
    const k = b ? b.key : '';
    return k === 'helfer' ? 'mend' : k === 'technik' ? 'stun' : k === 'brecher' ? 'wall' : 'strike';
  }
  GL.battle = { typeMult, simulate, burstKind };
})();
