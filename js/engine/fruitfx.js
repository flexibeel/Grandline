// Teufelsfrucht-Mechaniken im Kampf: jede gegessene Frucht bringt eine kleine, sichtbare Eigenheit mit,
// mehrere Früchte derselben Familie (Logia, Paramecia, Zoan) verstärken sich gegenseitig.
// Alles deterministisch über GL.rng (Replays bleiben gleich). Daten: GL.data.fruits (fam, mech), GL.data.fruitFams.
window.GL = window.GL || {};

(function () {
  const F = () => GL.data.fruits || [];
  const baseOf = id => { const f = F().find(x => x.id === id); return f ? (f.base || f.id) : id; };

  // Welche Familien und Eigenheiten hat dieser Run? (verschiedene Früchte zählen)
  function state(run) {
    const ids = [...new Set((run && run.eaten) || [])];
    const fams = { logia: 0, paramecia: 0, zoan: 0 };
    const has = {};
    ids.forEach(id => {
      const f = F().find(x => x.id === id);
      if (!f || !f.fam) return;
      fams[f.fam] = (fams[f.fam] || 0) + 1;
      has[baseOf(id)] = true;
    });
    const tier = k => { const T = (GL.data.fruitFams[k] || {}).tiers || []; let t = 0; T.forEach((x, i) => { if (fams[k] >= x.n) t = i + 1; }); return t; };
    return { fams, has, tier: { logia: tier('logia'), paramecia: tier('paramecia'), zoan: tier('zoan') } };
  }

  // Für die Oberfläche: Familien mit Stand, nächste Stufe usw.
  function families(run) {
    const s = state(run);
    return Object.keys(GL.data.fruitFams || {}).map(k => {
      const d = GL.data.fruitFams[k];
      return { key: k, name: d.name, icon: d.icon, text: d.text, count: s.fams[k] || 0, tier: s.tier[k], tiers: d.tiers,
        active: s.tier[k] ? d.tiers[s.tier[k] - 1] : null, next: d.tiers[s.tier[k]] || null };
    }).filter(x => x.count > 0);
  }

  // Wird vom Kampf einmal aufgerufen. ctx: Helfer aus battle.js
  function setup(run, crew, enemies, ctx) {
    const s = state(run);
    if (!Object.keys(s.has).length && !s.fams.logia) return null;
    const R = GL.rng, T = s.tier;
    const boostL = T.logia >= 1 ? 2 : 1, boostP = T.paramecia >= 1 ? 2 : 1, boostZ = T.zoan >= 1 ? 1.75 : 1;
    const extraRounds = T.logia >= 1 ? 1 : 0;
    const note = (by, side, text) => ctx.events.push({ k: 'note', by: 'fruit', side, text, fruit: by });
    // Kampfbeginn: Familienstufe 3
    if (T.paramecia >= 2) crew.forEach(u => { u.atk += 3; });
    if (T.zoan >= 2) crew.forEach(u => { u.spd += 1; u.dmgPct = (u.dmgPct || 0) + 0.1; });
    if (s.has['bara-bara']) crew.forEach(u => { u.dodge = (u.dodge || 0) + 0.06; });
    const rageAt = T.zoan >= 2 ? 0.6 : 0.4;
    let phoenix = !!s.has['tori-tori'];
    const pick = list => list[Math.floor(R.float(run) * list.length)];

    return {
      // Schadensfaktor für einen Treffer der Crew (vor Rüstung)
      dmgMult(u, target) {
        let m = 1;
        if (u.side === 'crew' && s.has.zoan && u.hp > 0 && u.hp <= u.max * rageAt) m *= 1 + 0.2 * boostZ;
        if (u.side === 'crew' && T.logia >= 2 && target && ['burning', 'weak', 'stun'].some(k => target.status[k])) m *= 1.3;
        return m;
      },
      // Nach einem Treffer mit Schaden
      onHit(u, target, dmg) {
        if (u.side === 'crew' && target.side === 'enemy') {
          if (target.hp > 0 && s.has['mera-mera'] && R.float(run) < 0.12 * boostL) {
            const got = ctx.addStatus(target, 'burning', 2 + extraRounds, 2 + (T.logia >= 1 ? 1 : 0));
            if (got) ctx.events.push({ k: 'status', side: 'enemy', list: [got], by: 'mera-mera' });
          }
          if (target.hp > 0 && s.has['suna-suna'] && R.float(run) < 0.10 * boostL) {
            const got = ctx.addStatus(target, 'weak', 2 + extraRounds);
            if (got) ctx.events.push({ k: 'status', side: 'enemy', list: [got], by: 'suna-suna' });
          }
          if (target.hp > 0 && s.has['hie-hie'] && R.float(run) < 0.07 * boostL * (target.boss || target.raid ? 0.5 : 1)) {
            const got = ctx.addStatus(target, 'stun', 1);
            if (got) { ctx.events.push({ k: 'status', side: 'enemy', list: [got], by: 'hie-hie' }); }
          }
          if (s.has['hana-hana'] && R.float(run) < 0.10 * boostP) {
            const others = enemies.filter(f => f.hp > 0 && f !== target);
            const t2 = others.length ? pick(others) : (target.hp > 0 ? target : null);
            if (t2) {
              const d = Math.max(1, Math.round(dmg * 0.5));
              ctx.damage(t2, d);
              ctx.events.push({ k: 'dmg', side: 'enemy', list: [{ to: enemies.indexOf(t2), dmg: d, hp: t2.hp }], by: 'hana-hana' });
            }
          }
        }
        // Gummi: Treffer auf die Crew federn zurück
        if (u.side === 'enemy' && target.side === 'crew' && s.has['gum-gum'] && u.hp > 0 && R.float(run) < 0.12 * boostP) {
          const d = Math.max(1, Math.round(dmg * 0.4));
          ctx.damage(u, d);
          ctx.events.push({ k: 'dmg', side: 'enemy', list: [{ to: enemies.indexOf(u), dmg: d, hp: u.hp }], by: 'gum-gum' });
        }
      },
      // Fällt jemand aus der Crew: Phönix
      onFall() {
        if (!phoenix) return;
        const u = crew.find(x => x.hp <= 0 && !x.phoenixed);
        if (!u || !crew.some(x => x.hp > 0)) return;
        phoenix = false; u.phoenixed = true;
        u.hp = Math.max(1, Math.round(u.max * 0.15 * (T.zoan >= 1 ? 1.3 : 1)));
        ctx.events.push({ k: 'revive', side: 'crew', list: [{ to: crew.indexOf(u), hp: u.hp }], by: 'tori-tori' });
      },
      // Rundenende: Doktor
      roundEnd() {
        if (!s.has['hito-hito']) return;
        const hurt = crew.filter(f => f.hp > 0 && f.hp < f.max).sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
        if (!hurt) return;
        const before = hurt.hp;
        hurt.hp = Math.min(hurt.max, hurt.hp + Math.round(2 * boostZ));
        if (hurt.hp > before) ctx.events.push({ k: 'heal', side: 'crew', list: [{ to: crew.indexOf(hurt), amount: hurt.hp - before, hp: hurt.hp }], by: 'hito-hito' });
      },
      note
    };
  }

  GL.fruitFx = { state, families, setup, baseOf };
})();
