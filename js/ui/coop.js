// Gemeinschafts-Fahrt: deine Stammcrew + bis zu 3 Crews deiner Segelkumpane gegen den Welt-Boss der Woche.
// Asynchron und ohne eigene Tabelle: die Crews der Kumpane kommen aus ihren Ranglisten-Einträgen (squad).
// Der Kampf läuft lokal mit dem normalen Kampfsystem (deterministisch aus Datum, Boss und Versuch).
window.GL = window.GL || {};

(function () {
  const D = () => GL.data.coop;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const fmt = n => Number(n || 0).toLocaleString('de-DE');

  // Boss der Woche (Montag bis Sonntag gleich)
  function weekNo() { return Math.floor((Date.now() / 864e5 + 3) / 7); }
  function boss() { const B = D().bosses; return B[weekNo() % B.length]; }
  function state(profile) {
    const c = profile.coop = profile.coop || {};
    if (c.day !== today()) { c.day = today(); c.tries = 0; c.looted = false; }
    return c;
  }
  function triesLeft(profile) { return Math.max(0, D().triesPerDay - (state(profile).tries || 0)); }

  // ---------- Crews ----------
  const st = () => (GL.online && GL.online.state ? GL.online.state() : { rows: [] });
  const powerOf = r => (r.atk || 0) * 3 + (r.max || r.hp || 0) / 4 + (r.spd || 0);
  function pick(refs, keepSelf) {
    return (refs || []).filter(r => r && r.id && (keepSelf || r.id !== 'self') && (r.id === 'self' || GL.data.crew.some(c => c.id === r.id)))
      .slice().sort((a, b) => powerOf(b) - powerOf(a)).slice(0, D().perTeam);
  }
  function rowById(id) { return (st().rows || []).find(r => r.id === id) || null; }
  const canJoin = r => r && r.id !== st().uid && r.squadOn && Array.isArray(r.squad) && pick(r.squad).length > 0;
  // Kumpane zuerst, dann „Gast-Crews“ aus der Rangliste (damit es auch ohne Freunde geht)
  function candidates(profile) {
    const friends = (profile.friends || []).map(c => GL.friends && GL.friends.rowOf(c)).filter(canJoin);
    const fIds = new Set(friends.map(r => r.id));
    const seed = hash(today() + (st().uid || ''));
    const guests = (st().rows || []).filter(r => canJoin(r) && !fIds.has(r.id))
      .map(r => ({ r, k: hash(seed + r.id) })).sort((a, b) => a.k - b.k).slice(0, 6).map(x => x.r);
    return { friends, guests };
  }
  function teams(profile, ui) {
    const sel = ((ui.coop && ui.coop.sel) || []).map(rowById).filter(canJoin).slice(0, 3);
    return [{ id: 'me', name: profile.nickname || 'Du', me: true, refs: pick(GL.meta.squadRefs(profile), true) }]
      .concat(sel.map(r => ({ id: r.id, name: r.name || 'Pirat', refs: pick(r.squad), crewName: r.crewName })));
  }

  // ---------- Kampf ----------
  // Zeitlimit: nach so vielen Runden taucht der Boss ab (Schaden bis dahin zählt)
  const ROUNDS = 20;
  function simulate(profile, ui, bossOverride) {
    const B0 = bossOverride || boss(), T = teams(profile, ui);
    // Mehr Crews, mehr Boss: Leben und Wucht wachsen mit der Flotte
    const n = T.length, B = Object.assign({}, B0, { hp: Math.round(B0.hp * (0.55 + 0.45 * n)), atk: Math.round(B0.atk * (0.8 + 0.2 * n)) });
    const crew = [], owner = [];
    T.forEach((t, ti) => t.refs.forEach(r => {
      const x = Object.assign({}, r, { hp: r.max || r.hp });
      if (r.id === 'self') { x.ability = 'rally'; x.power = r.rally || 1; }
      crew.push(x); owner.push(ti);
    }));
    const foe = [{ id: B.id, name: B.name, type: B.type, hp: B.hp, max: B.hp, atk: B.atk, spd: B.spd, boss: true, ability: B.ability, power: B.power }];
    const s = state(profile);
    const seed = hash(today() + B.id + (s.tries || 0) + (st().uid || ''));
    const run = { rng: seed || 1, crew, relics: [], arts: [], items: [], crit: 0, bounties: 0, captain: crew[0] && crew[0].id, mod: { atk: 0, hp: 0, spd: 0 } };
    const res = GL.battle.simulate(run, crew, foe, 'duel', {});
    const per = T.map(() => 0), heal = T.map(() => 0);
    const timeline = [];   // Boss-Leben nach jedem Treffer (für die Anzeige)
    let left = B.hp, rounds = 0;
    res.events.forEach(e => {
      if (e.k === 'round') rounds++;
      if (rounds > ROUNDS) return;
      if (e.k === 'hit' && e.dmg > 0 && e.side === 'crew' && owner[e.from] != null) {
        per[owner[e.from]] += e.dmg; left = Math.max(0, left - e.dmg);
        timeline.push({ t: owner[e.from], d: e.dmg, left, crit: !!e.crit });
      }
      if (e.k === 'dmg' && e.side === 'enemy' && e.list) {
        const i = crew.findIndex(u => u.id === e.by);
        const sum = e.list.reduce((a, x) => a + (x.dmg || 0), 0);
        if (i >= 0 && sum > 0) { per[owner[i]] += sum; left = Math.max(0, left - sum); timeline.push({ t: owner[i], d: sum, left }); }
      }
      if (e.k === 'heal' && e.side === 'crew' && e.list) { const i = e.from != null ? e.from : -1; if (owner[i] != null) heal[owner[i]] += e.list.reduce((a, x) => a + (x.amt || x.heal || 0), 0); }
    });
    const total = per.reduce((a, b) => a + b, 0);
    return { boss: B, teams: T, per, heal, total: Math.min(total, B.hp), win: total >= B.hp, rounds: Math.min(rounds, ROUNDS), timeline };
  }

  // Beute: einmal am Tag, je nach Anteil am Boss-Leben
  function reward(profile, r) {
    const s = state(profile);
    if (s.looted || !GL.cgear || !GL.cgear.roll) return null;
    const share = r.total / r.boss.hp;
    const rar = r.win ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
    const it = GL.cgear.roll({ r: rar, name: r.boss.short, seaName: 'Gemeinschaft', sea: 2 });
    GL.cgear.bag(profile).push(it);
    s.looted = true;
    return it;
  }

  // ---------- Darstellung ----------
  function teamFaces(refs) {
    return refs.map(r => {
      const d = r.id === 'self' ? { id: 'self', name: r.name, look: r.look, type: r.type } : GL.data.crew.find(c => c.id === r.id) || {};
      return `<i class="cp-face">${GL.sprites.render(d)}</i>`;
    }).join('');
  }
  function bossStage(B, cls) {
    return `<div class="cp-stage bg-${B.bg} ${cls || ''}" aria-hidden="true"><i class="cp-sky"></i><i class="cp-wave a"></i><i class="cp-wave b"></i>
      <span class="cp-boss">${GL.sprites.render({ id: B.id, name: B.name, art: B.art })}</span><i class="cp-shadow"></i></div>`;
  }
  function slotCard(t, i) {
    if (!t) return `<button class="cp-slot empty" data-act="coop-open-pick" data-i="${i}"><b>+</b><small>Kumpan holen</small></button>`;
    return `<div class="cp-slot${t.me ? ' me' : ''}"><span class="cp-faces">${teamFaces(t.refs)}</span>
      <b>${esc(t.name)}</b><small>${t.me ? 'Deine Stammcrew' : esc(t.crewName || 'Segelkumpan')}</small>
      ${t.me ? '' : `<button class="cp-x" data-act="coop-drop" data-id="${esc(t.id)}" aria-label="Entfernen">✕</button>`}</div>`;
  }
  function section(profile, ui) {
    ui.coop = ui.coop || { sel: [] };
    if (!GL.meta.squadUnlocked(profile)) return `<div class="cp-wrap"><p class="cp-note">Die Gemeinschafts-Fahrt öffnet sich mit deiner Stammcrew.</p></div>`;
    const B = boss(), T = teams(profile, ui), s = state(profile), left = triesLeft(profile);
    const C = candidates(profile);
    const picking = ui.coop.picking;
    const chip = r => { const on = (ui.coop.sel || []).includes(r.id);
      return `<button class="cp-cand${on ? ' on' : ''}" data-act="coop-pick" data-id="${esc(r.id)}"><span class="cp-faces sm">${teamFaces(pick(r.squad))}</span><b>${esc(r.name || 'Pirat')}</b><small>⚔ ${fmt(GL.meta.squadPower ? GL.meta.squadPower(r.squad) : 0)}</small></button>`; };
    const best = s.best && s.best.boss === B.id ? s.best.dmg : 0;
    return `<div class="cp-wrap">
      <div class="cp-head">
        ${bossStage(B)}
        <div class="cp-binfo">
          <span class="cp-kick">Welt-Boss der Woche</span>
          <h3>${esc(B.name)}</h3>
          <div class="cp-hp"><i style="width:100%"></i><span>${fmt(B.hp)} Leben</span></div>
          <p class="cp-ab"><b>${esc(B.abilityName)}</b> ${esc(B.text)}</p>
          <p class="cp-tip">💡 ${esc(B.tip)}</p>
        </div>
      </div>
      <div class="cp-lbl"><span>Eure Flotte</span><small>${T.length}/4 Crews · je ${D().perTeam} Stärkste</small></div>
      <div class="cp-slots">${[0, 1, 2, 3].map(i => slotCard(T[i], i)).join('')}</div>
      ${picking ? `<div class="cp-pick">
        ${C.friends.length ? `<div class="cp-lbl"><span>♥ Segelkumpane</span></div><div class="cp-cands">${C.friends.map(chip).join('')}</div>` : `<p class="cp-note">Noch keine Segelkumpane mit Stammcrew. Lade welche ein, oder nimm Gast-Crews aus der Rangliste.</p>`}
        ${C.guests.length ? `<div class="cp-lbl"><span>⚓ Gast-Crews aus der Rangliste</span><small>wechseln täglich</small></div><div class="cp-cands">${C.guests.map(chip).join('')}</div>` : ''}
        <div class="cp-row"><button class="btn mini ghost" data-act="coop-invite">💌 Kumpels einladen</button><button class="btn mini" data-act="coop-close-pick">Fertig</button></div>
      </div>` : ''}
      <div class="cp-go-row">
        <button class="btn cp-go" data-act="coop-go"${left ? '' : ' disabled'}>⚓ Gemeinsam angreifen</button>
        <span class="cp-tries">${left ? `Noch <b>${left}</b> ${left === 1 ? 'Versuch' : 'Versuche'} heute` : 'Für heute ist die Flotte erschöpft. Morgen wieder.'}${s.looted ? ' · Beute heute schon geholt' : ' · Beute beim ersten Versuch'}</span>
      </div>
      ${best ? `<p class="cp-note">Euer Bestwert diese Woche: <b>${fmt(best)}</b> Schaden${s.best.win ? ' · besiegt! 🏆' : ''}</p>` : ''}
      <p class="cp-fine">Die Crews deiner Kumpane kämpfen mit ihrer gespeicherten Stammcrew mit. Sie müssen dafür nicht online sein, nur wach genug, um nicht über Bord zu fallen.</p>
    </div>`;
  }

  // Kampf-Fenster: Boss-Leben läuft runter, Balken je Crew füllen sich
  function fightPop(r) {
    const max = Math.max(1, ...r.per);
    return `<div class="fpop-card cp-pop" data-noclose="1">
      <span class="cp-kick">Gemeinschafts-Fahrt</span>
      <h3>${esc(r.boss.name)}</h3>
      ${bossStage(r.boss, 'big')}
      <div class="cp-hp big"><i id="cp-bar" style="width:100%"></i><span id="cp-left">${fmt(r.boss.hp)}</span></div>
      <p class="cp-ticker" id="cp-tick">Die Flotte setzt die Segel …</p>
      <div class="cp-res">${r.teams.map((t, i) => `<div class="cp-tr${t.me ? ' me' : ''}"><span class="cp-faces sm">${teamFaces(t.refs)}</span>
        <span class="cp-tn"><b>${esc(t.name)}</b><span class="cp-tb"><i id="cp-tb${i}" style="width:0%" data-w="${Math.round(100 * r.per[i] / max)}"></i></span></span><em id="cp-td${i}">0</em></div>`).join('')}</div>
      <div class="cp-end" id="cp-end" hidden></div>
    </div>`;
  }
  function play(r, onDone) {
    const pop = document.getElementById('fpop'); if (!pop) return;
    const TL = r.timeline, N = TL.length;
    const frames = Math.min(48, Math.max(12, N));
    const per = r.teams.map(() => 0);
    let k = 0;
    const lines = ['%s holt aus!', '%s trifft ins Schwarze.', 'Volltreffer von %s!', '%s schlägt zu, der Boss schaut beleidigt.', '%s findet eine Lücke.'];
    const step = () => {
      if (!document.getElementById('cp-bar')) return;
      const upto = Math.round((k + 1) / frames * N);
      for (let j = Math.round(k / frames * N); j < upto; j++) { const e = TL[j]; if (e) per[e.t] += e.d; }
      const e = TL[Math.max(0, upto - 1)];
      const left = e ? e.left : r.boss.hp;
      document.getElementById('cp-bar').style.width = (100 * left / r.boss.hp).toFixed(1) + '%';
      document.getElementById('cp-left').textContent = fmt(left);
      const mx = Math.max(1, ...r.per);
      per.forEach((v, i) => { const b = document.getElementById('cp-tb' + i), d = document.getElementById('cp-td' + i); if (b) b.style.width = Math.round(100 * v / mx) + '%'; if (d) d.textContent = fmt(v); });
      if (e && k % 3 === 0) { const t = document.getElementById('cp-tick'); if (t) t.textContent = lines[(k / 3) % lines.length | 0].replace('%s', r.teams[e.t].name) + (e.crit ? ' Krit!' : ''); }
      if (e && k % 2 === 0) { const s = pop.querySelector('.cp-boss'); if (s) { s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit'); } if (GL.sfx) GL.sfx.play('hit'); }
      k++;
      if (k < frames) setTimeout(step, 110);
      else onDone();
    };
    setTimeout(step, 600);
  }
  function endHtml(r, item) {
    const share = Math.round(100 * r.total / r.boss.hp);
    const mvp = r.per.indexOf(Math.max(...r.per));
    const head = r.win ? `🏆 <b>${esc(r.boss.short)} ist besiegt!</b> Nächste Woche überlegt er sich das zweimal.`
      : `<b>${fmt(r.total)} Schaden</b> (${share} %). ${share >= 60 ? 'Er wackelt schon. Morgen fällt er.' : share >= 30 ? 'Ordentlich angekratzt. Er tut so, als hätte er nichts gemerkt.' : 'Er hat es kaum bemerkt. Wir nennen es Aufwärmen.'}`;
    return `<p class="cp-endt">${head}</p>
      <p class="cp-mvp">⭐ Beste Crew: <b>${esc(r.teams[mvp].name)}</b> mit ${fmt(r.per[mvp])} Schaden</p>
      ${item ? `<p class="cp-loot">🎁 Beute: <b>${esc(GL.cgear.name(item))}</b> (${esc(GL.cgear.RNAME[item.r])}) liegt in der Truhe</p>` : '<p class="cp-loot muted">Beute gibt es einmal am Tag. Ruhm gibt es immer.</p>'}
      <button class="btn" data-act="pop-close">Zurück in den Hafen</button>`;
  }

  // ---------- Aktionen (aus main.js) ----------
  function act(type, el, profile, ui, H) {
    ui.coop = ui.coop || { sel: [] };
    const redraw = () => { ui.lastStage = null; H.draw(); };
    if (type === 'coop-open-pick') { ui.coop.picking = true; redraw(); return; }
    if (type === 'coop-close-pick') { ui.coop.picking = false; redraw(); return; }
    if (type === 'coop-drop') { ui.coop.sel = (ui.coop.sel || []).filter(x => x !== el.dataset.id); redraw(); return; }
    if (type === 'coop-pick') {
      const id = el.dataset.id, sel = ui.coop.sel = ui.coop.sel || [];
      if (sel.includes(id)) ui.coop.sel = sel.filter(x => x !== id);
      else if (sel.length < 3) sel.push(id);
      else { H.toast('<span><b>Flotte voll</b>Mehr als vier Crews passen nicht auf die Karte. Wir haben es versucht.</span>'); return; }
      redraw(); return;
    }
    if (type === 'coop-invite') { H.invite(); return; }
    if (type === 'coop-go') {
      if (!triesLeft(profile)) return;
      const r = simulate(profile, ui);
      const s = state(profile); s.tries = (s.tries || 0) + 1;
      if (!s.best || s.best.boss !== r.boss.id || r.total > s.best.dmg) s.best = { boss: r.boss.id, dmg: r.total, win: r.win, week: weekNo() };
      const item = reward(profile, r);
      H.save();
      H.pop(fightPop(r));
      play(r, () => { const end = document.getElementById('cp-end'); if (end) { end.innerHTML = endHtml(r, item); end.hidden = false; } if (GL.sfx) GL.sfx.play(r.win ? 'win' : 'found'); redraw(); });
    }
  }

  GL.coop = { section, act, boss, simulate, triesLeft };
})();
