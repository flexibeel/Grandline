// Empfehlungen ("Tipps"): kleine Hinweise, was gerade sinnvoll wäre.
// Bewusst sparsam: pro Bildschirm höchstens ein Tipp, und nur wenn eine Wahl klar besser ist.
// Reine Lesefunktionen auf dem Run, ändern nichts am Spielstand.
window.GL = window.GL || {};

(function () {
  const crewData = id => GL.data.crew.find(c => c.id === id);
  const abil = id => GL.data.abilities[id] || null;

  // Welcher Statuswert lohnt sich für Figur i am meisten?
  function stat(run, i) {
    const u = run.crew[i];
    if (!u) return null;
    const d = crewData(u.id);
    const a = abil(u.id);
    const kind = a ? a.kind : '';
    const front = run.crew.findIndex(x => x.hp > 0) === i;
    if (front || u.role === 'brecher') {
      return { stat: 'hp', why: front ? `${d.name} steht vorne und wird zuerst angegriffen. Mehr Leben hält die ganze Crew länger im Kampf.`
        : `${d.name} ist Brecher und soll Treffer einstecken. Leben wirkt mit der Rüstung doppelt gut.` };
    }
    if (['revive', 'thorns'].includes(kind)) {
      return { stat: 'hp', why: `${a.name} wirkt umso länger, je mehr Leben ${d.name} hat.` };
    }
    if (u.role === 'helfer' || ['medic', 'oasis', 'mimic'].includes(kind)) {
      return { stat: 'hp', why: `${d.name} hilft der Crew am meisten, solange sie oder er steht. Leben sichert das ab.` };
    }
    if (['sniper', 'execute'].includes(kind)) {
      return { stat: 'spd', why: `Mit mehr Tempo handelt ${d.name} vor den Gegnern und erledigt Angeschlagene, bevor sie zuschlagen.` };
    }
    return { stat: 'atk', why: `${d.name} ist zum Austeilen da. Jeder Punkt Angriff wirkt bei jedem einzelnen Treffer.` };
  }

  // Wie sehr bringt eine neue Figur die Synergien voran?
  function synergyGain(run, d) {
    const before = GL.effects.status(run.crew);
    const after = GL.effects.status(run.crew.concat([{ id: d.id, type: d.type, role: d.role, faction: d.faction }]));
    let score = 0, best = null;
    after.forEach((s, i) => {
      if (s.active && s.active !== before[i].active) {
        const v = s.kind === 'faction' ? 4 : 3;
        score += v;
        if (!best || v > best.v) best = { v, text: `schaltet ${s.kind === 'faction' ? 'den Set-Bonus ' : ''}${s.name} ${s.count} frei` };
      } else if (s.count > before[i].count && before[i].count > 0) {
        score += 1;
        if (!best) best = { v: 1, text: `bringt ${s.name} näher an die nächste Stufe (${s.count}/${s.next ? s.next.n : s.count})` };
      }
    });
    return { score, best };
  }

  function recruit(run) {
    if (!run.pool || run.pool.length < 2) return null;
    const lim = GL.run.crewLimit(run);
    const scored = run.pool.map((o, i) => {
      const d = crewData(o.id);
      const g = synergyGain(run, d);
      // Nur, was man gerade kaufen kann
      const ok = !o.sold && run.crew.length < lim && (run.gold || 0) >= GL.run.offerPrice(run, o);
      return { i, d, g, score: ok ? g.score + (o.stars || 1) * 0.6 : -99 };
    }).sort((a, b) => b.score - a.score);
    if (scored[0].score < 0) return null;
    if (!scored[0].g.best || scored[0].score - scored[1].score < 1) return null;
    return { index: scored[0].i, why: `${scored[0].d.name} ${scored[0].g.best.text}.` };
  }

  function lootPick(run, items, kind) {
    if (!items || items.length < 2) return null;
    const hpShare = run.crew.reduce((s, u) => s + Math.max(0, u.hp), 0) / Math.max(1, run.crew.reduce((s, u) => s + u.max, 0));
    const scored = items.map((it, i) => {
      let score = it.awakened ? 5 : Math.max(0, it.rarity) * 1.2;
      let why = it.awakened ? 'Erwachte Früchte sind stärker als jede normale.' : it.rarity >= 0 ? `${GL.loot.rarityName(it.rarity)} und damit stärker als die anderen Angebote.` : '';
      if (kind === 'fruit' && it.effect && it.effect.type === 'healAll') {
        score = hpShare < 0.45 ? 6 : -1;
        why = 'Deine Crew ist schwer angeschlagen. Volle Heilung rettet den Run.';
      }
      // Schätze, die nur bestimmte Figuren betreffen: zählt, ob du solche hast
      (it.mods || []).forEach(m => {
        if (!m.scope || m.scope === 'all') return;
        const [k, v] = m.scope.split(':');
        const n = run.crew.filter(u => (k === 'char' ? u.id : u[k]) === v).length;
        if (n === 0) { score -= 3; return; }
        score += n * 0.5;
        if (n >= 2 && !why) why = `Passt zu deiner Crew: ${n} Figuren profitieren davon.`;
      });
      return { i, score, why };
    }).sort((a, b) => b.score - a.score);
    if (scored[0].score - scored[1].score < 1) return null;
    return { index: scored[0].i, why: scored[0].why || 'Bringt deiner aktuellen Crew am meisten.' };
  }

  function map(run) {
    const total = run.crew.reduce((s, u) => s + u.max, 0);
    const hp = run.crew.reduce((s, u) => s + Math.max(0, u.hp), 0);
    const rest = run.options.indexOf('rest');
    if (rest >= 0 && total && hp / total < 0.45) {
      return { index: rest, why: 'Deine Crew hat weniger als die Hälfte ihres Lebens. Eine Rast macht den nächsten Kampf viel sicherer.' };
    }
    return null;
  }

  // Aufstellung: steht der Falsche vorne?
  function formation(run, front) {
    const alive = run.crew.map((u, i) => ({ u, i })).filter(x => x.u.hp > 0);
    if (alive.length < 2) return null;
    const first = alive[0];
    const mult = (a, d) => GL.battle.typeMult(a, d);
    const tank = x => x.u.hp * (x.u.role === 'brecher' ? 1.6 : 1) / mult(front.type, x.u.type);
    const best = alive.slice().sort((a, b) => tank(b) - tank(a))[0];
    if (best.i === first.i || tank(best) < tank(first) * 1.3) return null;
    const d = crewData(best.u.id);
    const reasons = [];
    if (best.u.role === 'brecher') reasons.push('ist Brecher');
    if (mult(front.type, best.u.type) < 1) reasons.push('nimmt weniger Schaden vom vordersten Gegner');
    if (!reasons.length) reasons.push('hat am meisten Leben');
    return { index: best.i, why: `${d.name} ${reasons.join(' und ')}. Ganz nach oben ziehen, dann hält die Crew länger.` };
  }

  GL.advice = { stat, recruit, loot: lootPick, map, formation };
})();
