// Kampfsystem. Rechnet einen ganzen Kampf auf einmal durch und liefert
// eine Liste von Ereignissen, die die Oberfläche danach abspielt.
// Kein Zugriff auf die Seite (DOM): läuft auch ohne Browser, z. B. auf einem Server.
//
// Ereignisse (k = Art):
//   hit     { side, from, to, dmg, crit, eff, blocked, miss, hp }  side = Angreifer
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
    const { crew, enemies, flags } = GL.effects.setup(run, crewRefs, enemyRefs);
    crew.concat(enemies).forEach(u => { u.status = {}; });
    const events = [];
    const alive = list => list.filter(u => u.hp > 0);
    const sideOf = s => (s === 'crew' ? crew : enemies);

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
      crew.concat(enemies).forEach(u => {
        if (u.hp === 0 && u.ability === 'revive' && !u.revived) {
          u.revived = true;
          u.hp = Math.ceil(u.max * u.power);
          events.push({ k: 'revive', side: u.side, list: [{ to: idx(u), hp: u.hp }], by: u.id });
        }
      });
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
    const statusOf = u => (GL.data.abilities[u.id] && GL.data.abilities[u.id].status) || null;

    // ---------- Ultis: Energie laden, bei voller Leiste ersetzt die Ulti den nächsten Angriff ----------
    const U = C.ult || { max: 100, gainHit: 25, gainHurt: 10, bossStart: 30 };
    const UL = GL.data.ultis || {}, UD = GL.data.ultiDefaults || {};
    const ultOf = u => {
      if (u.side === 'crew' || (u.ref && u.ref.pvp)) return UL[u.id] || UD[u.role] || UD.kaempfer || null;
      if (u.boss || u.mini) return UL[u.id] || UD.foe || null;
      return null;   // einfache Gegner haben keine Ulti
    };
    crew.concat(enemies).forEach(u => { u.ult = ultOf(u); u.energy = !u.ult ? 0 : u.side === 'enemy' && u.boss && !(u.ref && u.ref.pvp) ? U.bossStart : (U.start || 0); });
    const charge = (u, n) => { if (u.ult && u.hp > 0) u.energy = Math.min(U.max, u.energy + n); };

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
    function doUlt(u) {
      const ult = u.ult;
      u.energy = 0;
      events.push({ k: 'ult', side: u.side, from: idx(u), by: u.id, name: ult.name });
      let hitList = [];
      ult.fx.forEach(f => {
        const foes = foesOf(u), al = allies(u);
        if (f.do === 'strike') {
          const living = alive(foes);
          if (!living.length) return;
          const targets = f.target === 'all' ? living
            : f.target === 'weakest' ? [living.reduce((a, b) => (b.hp < a.hp ? b : a))] : [living[0]];
          const list = targets.map(t => { const d = ultStrike(u, t, f.mult, f.pierce); return { to: foes.indexOf(t), dmg: Math.min(t.hp, d), hp: damage(t, d) }; });
          hitList = targets;
          events.push({ k: 'dmg', side: targets[0].side, list, by: u.id, ult: true });
          checkRevives();
        } else if (f.do === 'status') {
          const list = f.target === 'all' ? alive(foes) : f.target === 'front' ? alive(foes).slice(0, 1)
            : f.target === 'hit' ? hitList.filter(t => t.hp > 0) : f.target === 'allies' ? alive(al) : [u];
          const got = list.map(t => addStatus(t, f.key, f.rounds, f.value)).filter(Boolean);
          if (got.length) events.push({ k: 'status', side: list[0].side, list: got, by: u.id, ult: true });
        } else if (f.do === 'heal') {
          const pool = f.target === 'all' ? alive(al) : f.target === 'lowest' ? alive(al).sort((a, b) => a.hp / a.max - b.hp / b.max).slice(0, 1) : [u];
          const hm = u.side === 'crew' ? flags.healMult : 1;
          const list = pool.map(t => ({ to: idx(t), amount: heal(t, Math.max(1, Math.round(t.max * f.pct * hm))), hp: t.hp })).filter(x => x.amount > 0);
          if (list.length) events.push({ k: 'heal', side: u.side, list, by: u.id, ult: true });
        } else if (f.do === 'atk' || f.do === 'armor') {
          (f.target === 'allies' ? alive(al) : [u]).forEach(t => { t[f.do] = (t[f.do] || 0) + f.value; });
          events.push({ k: 'note', by: u.id, side: u.side, ult: true,
            text: `${nameOf(u)}: ${f.target === 'allies' ? 'alle' : 'selbst'} +${f.value} ${f.do === 'atk' ? 'Angriff' : 'Rüstung'}.` });
        } else if (f.do === 'cleanse') {
          alive(al).forEach(t => DEBUFF_ORDER.forEach(k => {
            if (t.status[k]) { delete t.status[k]; events.push({ k: 'cleanse', side: t.side, to: idx(t), key: k, by: u.id }); }
          }));
        }
      });
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
    let firstBlock = flags.firstBlock;  // Anzahl abgewehrter Treffer pro Kampf
    let rounds = 0;

    // ---------- Runden ----------
    while (alive(crew).length && alive(enemies).length && rounds < C.battleRoundsMax) {
      rounds++;
      events.push({ k: 'round', n: rounds });
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
        if (u.hp <= 0) continue;
        if (u.status.stun) {
          delete u.status.stun;
          events.push({ k: 'skip', side: u.side, to: idx(u) });
          continue;
        }
        if (u.ult && u.energy >= U.max) { doUlt(u); continue; }
        const foes = foesOf(u);
        const attacks = u.ability === 'double' ? 2 : 1;

        for (let n = 0; n < attacks; n++) {
          const living = foes.filter(f => f.hp > 0);
          if (!living.length || u.hp <= 0) break;

          const target = u.ability === 'sniper'
            ? living.reduce((a, b) => (b.hp < a.hp ? b : a))
            : living[0]; // sonst: wer vorne steht, wird zuerst getroffen
          const to = foes.indexOf(target);

          let mult = typeMult(u.type, target.type);
          if (mult < 1 && u.ignoreWeak) mult = 1;
          if (mult > 1 && u.side === 'crew') mult += flags.effBonus;

          // Schaden schwankt prozentual (±dmgSpreadPct), dazu eine kleine Grund-Krit-Chance für alle
          const sp = C.dmgSpreadPct != null ? C.dmgSpreadPct : 0.18;
          let dmg = u.atk * (1 + (R.float(run) * 2 - 1) * sp) * mult * (1 + u.dmgPct);
          if (target.boss || target.mini) dmg *= 1 + u.bossPct;
          const critCh = (u.crit || 0) + (C.baseCrit || 0);
          const crit = critCh > 0 && R.float(run) < critCh;
          if (crit) dmg *= u.critMult;
          if (u.status.fear) dmg *= 0.65;
          if (target.status.weak) dmg *= 1.25;
          dmg = Math.max(1, Math.round(dmg * (1 - target.guard)) - target.armor);

          let blocked = false;
          let miss = false;
          if (u.side === 'enemy' && firstBlock > 0) { blocked = true; firstBlock--; dmg = 0; }
          else if (target.dodge > 0 && R.float(run) < target.dodge) { miss = true; dmg = 0; }

          damage(target, dmg);
          charge(u, U.gainHit);
          if (dmg > 0) charge(target, U.gainHurt);
          const eff = mult > 1 ? 'strong' : mult < 1 ? 'weak' : '';
          events.push({ k: 'hit', side: u.side, from: idx(u), to, dmg, crit: crit && dmg > 0, eff, blocked, miss, hp: target.hp,
            ea: u.ult ? u.energy : null, et: target.ult ? target.energy : null });

          // Fähigkeiten nach einem Treffer
          if (dmg > 0) {
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

      crew.concat(enemies).filter(u => u.hp > 0 && u.ability === 'medic').forEach(u => {
        const hurt = alive(allies(u)).filter(f => f.hp < f.max).sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
        if (hurt) {
          const got = heal(hurt, Math.round(u.power * (u.side === 'crew' ? flags.healMult : 1)));
          events.push({ k: 'heal', side: u.side, list: [{ to: idx(hurt), amount: got, hp: hurt.hp }], by: u.id });
        }
      });
    }

    // Leben zurück in die echten Figuren schreiben
    crew.forEach(u => { u.ref.hp = u.hp; });
    enemies.forEach(u => { u.ref.hp = u.hp; });

    return { events, win: !alive(enemies).length && alive(crew).length > 0 };
  }

  GL.battle = { typeMult, simulate };
})();
