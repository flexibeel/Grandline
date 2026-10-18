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

    function damage(u, amount) {
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
      return Math.max(1, d);
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
        const crit = !P && R.float(run) < (u.crit || 0) + (C.baseCrit || 0);
        const targets = f.target === 'all' ? living
          : f.target === 'weakest' ? [living.reduce((a, b) => (b.hp < a.hp ? b : a))] : [living[0]];
        const list = targets.map(t => { const d = ultStrike(u, t, mult0 * (1 + (R.float(run) * 2 - 1) * UV.spread) * (crit ? (u.critMult || 1.5) : 1), f.pierce); return { to: foes.indexOf(t), dmg: Math.min(t.hp, d), hp: damage(t, d) }; });
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
    // ---------- Wendepunkte: machen jeden Kampf zur kleinen Geschichte ----------
    //   Boss-Wut: Bosse und Raid-Bosse werden bei halbem Leben wütend (stärker, schneller, Ulti lädt)
    //   Letzter Wille: Fällt die Crew unter ein Drittel ihres Lebens, rafft sie sich einmal auf
    const DR = Object.assign({ rageAt: 0.6, rageAtk: 0.2, rageEnergy: 50, finalAt: 0.25, finalAtk: 0.15, finalHeal: 0.08, willAt: 0.3, willEnergy: 50 }, C.drama || {});
    let willUsed = false;
    const BF = C.bossFight || {};
    if (!pvp) enemies.forEach(e => { if (e.boss || e.raid) e.dodge = (e.dodge || 0) + (BF.dodge || 0); });
    // ---------- Kampfwetter: manche Kämpfe bekommen eine Bedingung, damit sie sich nicht gleich anfühlen ----------
    const WX = C.weather || [];
    const wx = !pvp && (kind === 'battle' || kind === 'elite') && WX.length && R.float(run) < (C.weatherChance || 0) ? WX[Math.floor(R.float(run) * WX.length)] : null;
    const wxMiss = wx && wx.miss || 0, wxCrit = wx && wx.crit || 0, wxGain = wx && wx.gain || 1, wxDmg = wx && wx.crewDmg || 0;
    if (wx) {
      if (wx.crewSpd) crew.forEach(u => { u.spd += wx.crewSpd; });
      if (wx.foeSpd) enemies.forEach(u => { u.spd += wx.foeSpd; });
      events.push({ k: 'weather', id: wx.id, name: wx.name, text: wx.text });
      gainMult = wxGain;
    }
    function drama() {
      if (pvp) return;
      enemies.forEach(e => {
        if (e.hp > 0 && (e.boss || e.raid) && !e.raged && e.hp <= e.max * DR.rageAt) {
          e.raged = true;
          e.atk = Math.round(e.atk * (1 + DR.rageAtk)); e.spd += 1;
          if (e.ult) e.energy = Math.min(U.max, e.energy + DR.rageEnergy);
          events.push({ k: 'rage', side: 'enemy', to: idx(e), by: e.id, ea: e.ult ? e.energy : null });
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
      : helfer >= 4 && DC.lazarett ? { p: DC.lazarett, by: 'lazarett' }
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
      return living[0];
    }
    // Schutz: Schüsse über das Gefolge hinweg verlieren etwas Wucht
    const behindGuards = (u, target) => !pvp && FM.on && u.side === 'crew' && isLead(target) && alive(enemies).some(f => !isLead(f));
    let rounds = 0;
    // Duell-Kommandos (nur Stammcrew-Duell, nur mit o.duel): vor jedem Zug steht eine Zug-Marke im Protokoll.
    // Ein Kommando wirkt vor dem genannten Zug. Alles davor bleibt Ereignis für Ereignis gleich,
    // deshalb kann die Wiedergabe nach einem Tipp nahtlos mit dem neu gerechneten Verlauf weiterlaufen.
    const DUEL = !!o.duel, CMDS = DUEL && Array.isArray(o.cmds) ? o.cmds : [];
    const DK = C.duelCmds || {};
    const cmdBuff = [];
    let turnNo = 0;
    function cmdTurn() {
      for (let k = cmdBuff.length - 1; k >= 0; k--) if (cmdBuff[k].until < turnNo) { const b = cmdBuff[k]; b.u.atk = Math.max(1, b.u.atk - b.add); cmdBuff.splice(k, 1); }
      CMDS.forEach(c => {
        if (!c || c.at !== turnNo) return;
        const team = alive(crew), foes = alive(enemies);
        if (!team.length || !foes.length) return;
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

    // ---------- Runden ----------
    while (alive(crew).length && rounds < C.battleRoundsMax && (alive(enemies).length || callWave())) {
      rounds++;
      events.push({ k: 'round', n: rounds });
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
      const queue = crew.concat(enemies).filter(u => u.hp > 0);
      if (pvp) {
        // Duell: bei gleichem Tempo entscheidet der Zufall, wer zuerst handelt (sonst hätte der Angreifer immer Vorteil)
        queue.forEach(u => { u.tb = R.float(run); });
        queue.sort((a, b) => b.spd - a.spd || b.tb - a.tb);
      } else queue.sort((a, b) => b.spd - a.spd);

      for (const u of queue) {
        if (!alive(enemies).length || !alive(crew).length) break;   // Kampf schon entschieden
        if (DUEL) { turnNo++; events.push({ k: 'turn', t: turnNo }); if (CMDS.length) { cmdTurn(); if (!alive(enemies).length) break; } }
        drama();
        if (u.hp <= 0) continue;
        if (u.status.stun) {
          delete u.status.stun;
          events.push({ k: 'skip', side: u.side, to: idx(u) });
          continue;
        }
        // Ulti: Bei voller Leiste zündet sie mit etwas Glück sofort, spätestens im übernächsten Zug.
        // Selten springt schon bei halb voller Leiste ein Funke über (Glücks-Ulti).
        if (u.ult && u.energy >= U.max) {
          if ((u.ultWait || 0) >= (U.maxWait || 2) || R.float(run) < (U.fireChance || 0.6)) { doUlt(u); continue; }
          u.ultWait = (u.ultWait || 0) + 1;
        } else if (u.ult && u.energy >= U.max * 0.5 && R.float(run) < (U.spark || 0)) { doUlt(u, true); continue; }
        const foes = foesOf(u);
        const attacks = u.ability === 'double' ? 2 : 1;

        for (let n = 0; n < attacks; n++) {
          const living = foes.filter(f => f.hp > 0);
          if (!living.length || u.hp <= 0) break;

          // sniper: schwächstes Ziel, bully: stärkstes Ziel (meister Angriff),
          // sonst: Leibwache (taunt) fängt ab, ansonsten wer vorne steht
          const target = u.ability === 'sniper'
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
          const critCh = (u.crit || 0) + (C.baseCrit || 0) + wxCrit;
          const crit = critCh > 0 && R.float(run) < critCh;
          if (crit) dmg *= u.critMult;
          if (u.status.fear) dmg *= 0.65;
          if (target.status.weak) dmg *= 1.25;
          if (FX) dmg *= FX.dmgMult(u, target);
          if (behindGuards(u, target)) dmg *= FM.ranged;
          const heavy = u.wind === 2 && u.side === 'enemy';
          if (heavy) { dmg *= BF.windup; u.wind = 0; }
          const rawDmg = Math.max(1, Math.round(dmg));
          dmg = Math.max(1, Math.round(dmg * (1 - target.guard)) - target.armor * (heavy ? 2 : 1));
          const absorbed = rawDmg - dmg;   // nur Anzeige: was Rüstung/Schutz geschluckt hat

          let blocked = false;
          let miss = false;
          if (u.side === 'enemy' && firstBlock > 0) { blocked = true; firstBlock--; dmg = 0; }
          else if ((target.dodge || 0) + wxMiss > 0 && R.float(run) < ((target.dodge || 0) + wxMiss) * (heavy ? 2 : 1)) { miss = true; dmg = 0; }

          // Volltreffer: seltener Glücksschlag der eigenen Crew
          let lucky = false;
          if (dmg > 0 && u.side === 'crew' && R.float(run) < (C.luckyHit || 0)) { lucky = true; dmg = Math.round(dmg * 2.5); }
          damage(target, dmg);
          charge(u, U.gainHit);
          if (dmg > 0) charge(target, U.gainHurt);
          const eff = mult > 1 ? 'strong' : mult < 1 ? 'weak' : '';
          events.push({ k: 'hit', side: u.side, from: idx(u), to, dmg, crit: crit && dmg > 0, lucky, eff, blocked, miss, hp: target.hp, heavy: heavy || undefined,
            ea: u.ult ? u.energy : null, et: target.ult ? target.energy : null, ab: !miss && !blocked && absorbed > 0 ? absorbed : undefined });

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
            const cd = Math.max(1, Math.round(target.atk * (BF.counterMult || 0.6) * typeMult(target.type, u.type) * (1 - (u.guard || 0))) - (u.armor || 0));
            damage(u, cd);
            events.push({ k: 'counter', side: 'enemy', from: idx(target), to: idx(u), dmg: cd, hp: u.hp });
            checkRevives();
          }
          // Fähigkeiten nach einem Treffer
          if (dmg > 0) {
            if (FX) FX.onHit(u, target, dmg);
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
    return { events, win, team: { crew: team.crew, enemy: team.enemy } };
  }

  GL.battle = { typeMult, simulate };
})();
