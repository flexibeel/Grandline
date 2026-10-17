// Kampf-Arena: beide Teams stehen sich gegenüber, Treffer werden mit
// Schadenszahlen, Wacklern und Blitzen gezeigt. Die Arena wird einmal
// aufgebaut und dann pro Ereignis direkt verändert (kein Neuzeichnen),
// damit die Animationen flüssig laufen.
window.GL = window.GL || {};

(function () {
  const byId = (list, id) => list.find(x => x.id === id);
  const crewData = id => byId(GL.data.crew, id);
  const enemyData = id => byId(GL.data.grunts, id) || byId(GL.data.bosses, id) || byId(GL.data.raids, id) || byId(GL.data.hunted || [], id);
  const $ = sel => document.querySelector(sel);

  function badge(type) {
    const t = GL.data.types[type];
    return t ? `<em class="type t-${type}">${t.name}</em>` : '';
  }

  // Start-Energie wie im Kampfsystem (Crew und Bösewichte/Bosse haben eine Ulti, einfache Gegner nicht)
  let curRun = null;
  function startEnergy(side, unit) {
    const U = GL.config.ult || {};
    if (side === 'crew') return Math.min(100, (U.start || 0) + ((curRun && curRun.ultBonus) || 0));
    if (unit.boss) return U.bossStart || 0;
    if (unit.mini) return U.start || 0;
    return null;
  }
  function fighter(side, i, entry, unit, hp) {
    const pct = Math.max(0, 100 * hp / unit.max);
    const en = startEnergy(side, unit);
    return `<div class="fighter${hp <= 0 ? ' ko' : ''}${unit.boss ? ' big' : ''}${unit.mini ? ' mini-boss' : ''}" data-side="${side}" data-i="${i}">
      <div class="f-status" aria-label="Zustände"></div>
      <div class="f-sprite">${GL.sprites.render(entry)}</div>
      <div class="f-info">
        <div class="f-name"><b>${entry.name}</b> ${badge(unit.type)}</div>
        <div class="f-bar"><i style="width:${pct}%"></i><s style="width:${pct}%"></s></div>
        ${en != null ? `<div class="f-en" title="Ulti-Energie"><i style="width:${en}%"></i></div>` : ''}
        <div class="f-hp"><span>${hp}</span> / ${unit.max}</div>
      </div>
      <div class="fx" aria-hidden="true"></div>
    </div>`;
  }

  function markFront(root) {
    ['crew', 'enemy'].forEach(side => {
      const list = [...root.querySelectorAll(`.fighter[data-side="${side}"]`)];
      list.forEach(el => el.classList.remove('front'));
      const first = list.find(el => !el.classList.contains('ko'));
      if (first) first.classList.add('front');
    });
  }

  function el(side, i) {
    return document.querySelector(`#arena .fighter[data-side="${side}"][data-i="${i}"]`);
  }

  function setHp(side, i, hp) {
    const f = el(side, i);
    if (!f) return;
    const wasUp = !f.classList.contains('ko');
    const max = Number(f.dataset.max);
    const pct = Math.max(0, 100 * hp / max);
    f.querySelector('.f-bar i').style.width = pct + '%';
    // Der helle Balken läuft verzögert hinterher und zeigt den verlorenen Anteil
    f.querySelector('.f-bar s').style.width = pct + '%';
    f.querySelector('.f-hp span').textContent = hp;
    f.dataset.hp = pct > 50 ? 'high' : pct > 20 ? 'mid' : 'low';
    f.classList.toggle('ko', hp <= 0);
    if (wasUp && hp <= 0) stamp(f);
    fieldHp(side, i, hp);
  }

  // Ulti-Energie: Leiste füllen, bei voll leuchten
  function setEn(side, i, v) {
    const f = el(side, i);
    if (!f || v == null) return;
    const bar = f.querySelector('.f-en i');
    if (bar) bar.style.width = Math.min(100, v) + '%';
    f.classList.toggle('charged', v >= 100);
    const u = fu(side, i);
    if (u) u.classList.toggle('charged', v >= 100);
  }
  // Ulti-Moment: großer Name über der Figur, Lichtblitz, Figur leuchtet auf
  function ultFx(ev) {
    const f = el(ev.side, ev.from);
    setEn(ev.side, ev.from, 0);
    if (f) pulse(f, 'ult-glow');
    const field = $('#field');
    if (field) {
      const run = window.__glRun || {};
      const list = ev.side === 'crew' ? run.crew : (run.battle || {}).enemies;
      const d = list && list[ev.from] ? (list[ev.from].def || crewData(list[ev.from].id) || enemyData(list[ev.from].id) || { name: list[ev.from].name }) : null;
      field.querySelectorAll('.ult-call:not(.rage):not(.will)').forEach(x => x.remove());
      const c = document.createElement('div');
      c.className = 'ult-call ' + (ev.side === 'crew' ? 'us' : 'them');
      c.className += ev.spark ? ' spark' : '';
      c.className += ev.tier ? ' ' + ev.tier : '';
      const extra = ev.tier === 'perfect' ? '<em>★ Perfekt!</em>' : ev.bonus ? `<em>+ ${ev.bonus}</em>` : ev.combo > 1 ? `<em>${ev.combo}. Ulti · stärker</em>` : '';
      c.innerHTML = `<small>${d ? d.name : ''} · ${ev.spark ? '✨ Glücksfunke!' : 'Ulti'}</small><b>${ev.name}!</b>${extra}`;
      field.appendChild(c);
      setTimeout(() => c.remove(), 1500);
      if (ev.tier === 'perfect') {
        pulse(field, 'perfect-hit');
        const fl = document.createElement('div'); fl.className = 'perfect-flash'; field.appendChild(fl); setTimeout(() => fl.remove(), 700);
      }
    }
    const u = fu(ev.side, ev.from);
    const fld = $('#field');
    if (u && fld) {
      const p = center(u);
      const spot = fld.querySelector('.f-spot');
      if (spot && p) { spot.style.setProperty('--x', p.x + 'px'); spot.style.setProperty('--y', p.y + 'px'); }
      fld.classList.remove('ulting'); void fld.offsetWidth; fld.classList.add('ulting');
      u.classList.add('ult-star');
      setTimeout(() => { fld.classList.remove('ulting'); u.classList.remove('ult-star'); }, document.body.classList.contains('fast') ? 300 : 950);
      pulse(u, 'ult-glow'); fx('fx-ring', p, 700);
    }
  }

  // K.o.-Stempel
  function stamp(f) {
    const s = document.createElement('span');
    s.className = 'ko-stamp';
    s.textContent = 'K.O.';
    f.querySelector('.fx').appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }

  // Einblendung des Fähigkeitsnamens über der Figur, die sie auslöst
  function callout(id, side) {
    const a = GL.data.abilities[id];
    if (!a) return;
    const sides = side ? [side] : ['crew', 'enemy'];
    for (const sd of sides) {
      const list = sd === 'crew' ? (window.__glRun || {}).crew : ((window.__glRun || {}).battle || {}).enemies;
      const i = list ? list.findIndex(u => u.id === id) : -1;
      if (i >= 0) {
        const f = fu(sd, i) || el(sd, i);
        if (!f) return;
        const c = document.createElement('span');
        c.className = 'callout' + (f.classList.contains('fu') ? ' on-field' : '');
        c.textContent = a.name + '!';
        f.appendChild(c);
        setTimeout(() => c.remove(), 1500);
        return;
      }
    }
  }

  // Kurze CSS-Animation neu starten
  function pulse(node, cls) {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function float(side, i, text, cls) {
    const f = el(side, i);
    if (!f) return;
    const n = document.createElement('span');
    n.className = 'float ' + (cls || '');
    n.textContent = text;
    // leicht versetzt, damit sich mehrere Zahlen nicht überdecken
    n.style.setProperty('--dx', (Math.round(Math.random() * 30) - 15) + 'px');
    f.querySelector('.fx').appendChild(n);
    setTimeout(() => n.remove(), 1300);
  }

  // ---------- Zustände als kleine Abzeichen über der Figur ----------
  // Die Rundenzahl läuft mit den 'round'-Ereignissen herunter.
  const live = {};   // "side:i" -> { key: rounds }
  function drawStatus(side, i) {
    const f = el(side, i);
    if (!f) return;
    const box = f.querySelector('.f-status');
    const st = live[side + ':' + i] || {};
    fieldAura(side, i);
    box.innerHTML = Object.keys(st).map(k => {
      const d = GL.data.statuses[k];
      return `<span class="st-chip st-${k}${d.good ? ' good' : ''}" title="${d.name}: ${d.text}">${d.name}${k === 'stun' ? '' : ` <small>${st[k]}</small>`}</span>`;
    }).join('');
  }
  function addLive(side, i, key, rounds) {
    const id = side + ':' + i;
    live[id] = live[id] || {};
    live[id][key] = Math.max(rounds, live[id][key] || 0);
    drawStatus(side, i);
  }
  function removeLive(side, i, key) {
    const id = side + ':' + i;
    if (live[id]) delete live[id][key];
    drawStatus(side, i);
  }

  // Spezialangriff: kurze Kinoszene über der Arena
  function cinematic(by, name) {
    const run = window.__glRun || {};
    const d = crewData(by) || enemyData(by);
    const old = document.getElementById('special-pop');
    if (old) old.remove();
    const n = document.createElement('div');
    n.id = 'special-pop';
    n.className = 'special-pop';
    n.innerHTML = `<div class="sp-bars"></div>
      <div class="sp-card">
        <span class="sp-art">${d ? GL.sprites.render(d) : ''}</span>
        <span class="sp-text"><small>Spezialangriff</small><b>${name}!</b><em>${d ? d.name : ''}</em></span>
      </div>`;
    document.body.appendChild(n);
    setTimeout(() => n.classList.add('out'), 1500);
    setTimeout(() => n.remove(), 2000);
    void run;
  }

  // ---------- 3D-Kampffeld (Pokémon-Stil) ----------
  // Crew vorne links auf ihrer Plattform, Gegner hinten rechts. Die Liste darunter
  // bleibt als Anzeige für Leben und Zustände, das Feld zeigt die Bewegung.
  const CREW_SLOTS = [[38, 6], [20, 9], [50, 14], [10, 20], [30, 24], [44, 29], [17, 33]];
  const FOE_SLOTS  = [[70, 44], [84, 41], [92, 50], [62, 53], [78, 57], [90, 60]];
  function fieldUnit(side, i, entry, unit, hp) {
    const slots = side === 'crew' ? CREW_SLOTS : FOE_SLOTS;
    const [x, y] = slots[Math.min(i, slots.length - 1)];
    const depth = side === 'crew' ? 1.05 - y / 200 : 0.82 - (y - 46) / 160;
    const scale = (unit.boss ? 1.6 : unit.mini ? 1.15 : 1) * depth;
    const pct = Math.max(0, 100 * hp / unit.max);
    return `<div class="fu fu-${side}${hp <= 0 ? ' ko' : ''}${unit.boss ? ' boss' : ''}${unit.mini ? ' mini' : ''}" data-side="${side}" data-i="${i}"
        style="left:${x}%;bottom:${y}%;z-index:${200 - y};--s:${scale.toFixed(2)}">
      <div class="fu-shadow"></div>
      <div class="fu-aura"></div>
      <div class="fu-body" style="--d:${(i * 0.37 + (side === 'crew' ? 0 : 0.5)).toFixed(2)}s">${GL.sprites.renderShaded ? GL.sprites.renderShaded(entry) : GL.sprites.render(entry)}</div>
      <div class="fu-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }
  // Boss-Leiste oben im Feld: Name, Leben, Markierung bei halbem Leben (dort wird er wütend)
  function bossIdx(run) { return run.battle ? run.battle.enemies.findIndex(e => e.boss || e.raid) : -1; }
  function bossBar(run, enemyHp) {
    const bi = bossIdx(run);
    if (bi < 0 || (run.battle.enemies[bi].ref && run.battle.enemies[bi].ref.pvp)) return '';
    const e = run.battle.enemies[bi], d = enemyData(e.id) || crewData(e.id) || {};
    const pct = Math.max(0, 100 * (enemyHp[bi] != null ? enemyHp[bi] : e.hp) / e.max);
    return `<div class="boss-bar${run.battle.kind === 'raid' ? ' raid' : ''}" id="boss-bar" data-i="${bi}">
      <span class="bb-name">${run.battle.kind === 'raid' ? 'Raid' : 'Boss'} · ${d.name || ''}</span>
      <span class="bb-track"><s style="width:${pct}%"></s><i style="width:${pct}%"></i><em class="bb-mark" title="Ab hier wird er wütend"></em></span>
    </div>`;
  }
  function bossIntro(run) {
    const field = $('#field'), bi = bossIdx(run);
    if (!field || bi < 0) return;
    const e = run.battle.enemies[bi], d = enemyData(e.id) || crewData(e.id) || {};
    const raid = run.battle.kind === 'raid';
    const n = document.createElement('div');
    n.className = 'boss-intro' + (raid ? ' raid' : '');
    n.innerHTML = `<i class="bi-bar top"></i><i class="bi-bar bot"></i>
      <span class="bi-card"><small>${raid ? 'Raid-Boss' : 'Boss des Meeres'}</small><b>${d.name || ''}</b>${d.bounty ? `<em>Kopfgeld ${d.bounty} Mio. ฿</em>` : ''}</span>`;
    field.appendChild(n);
    setTimeout(() => n.remove(), 2300);
  }
  // Spannung: Wird es knapp, pocht der Rand rot. Ist der Boss fast besiegt, leuchtet seine Leiste.
  let lowShown = false;
  function tension() {
    const field = $('#field');
    if (!field) return;
    let hp = 0, max = 0;
    document.querySelectorAll('#arena .fighter[data-side="crew"]').forEach(f => { max += Number(f.dataset.max) || 0; hp += Number(f.querySelector('.f-hp span').textContent) || 0; });
    const foesUp = document.querySelectorAll('#arena .fighter[data-side="enemy"]:not(.ko)').length;
    field.classList.toggle('tense', !!max && foesUp > 0 && hp / max < 0.35 && hp > 0);
  }

  function fieldHtml(run, crewHp, enemyHp) {
    const b = run.battle;
    const crew = run.crew.map((u, i) => fieldUnit('crew', i, u.def || crewData(u.id), u, crewHp[i])).join('');
    const foes = b.enemies.map((e, i) => fieldUnit('enemy', i, e.def || GL.data.foeDef(e) || crewData(e.id), e, enemyHp[i])).join('');
    const isl = GL.run.island(run).id;
    const n = Math.max(run.crew.length, b.enemies.length);
    return `<div class="field isl-${isl}${b.kind === 'raid' ? ' raid' : b.kind === 'boss' ? ' bossfight' : ''}${n >= 6 ? ' crowd' : n >= 5 ? ' busy' : ''}" id="field" aria-hidden="true">
      <div class="f-stage">
        <div class="f-sky"></div>
        <div class="f-sun"></div>
        <div class="f-clouds c1"></div><div class="f-clouds c2"></div>
        <div class="f-horizon">${horizon(isl, b.kind)}</div>
        <div class="f-floor"><div class="f-waves"></div></div>
        <div class="plat plat-crew"><i></i></div>
        <div class="plat plat-enemy"><i></i></div>
        ${crew}${foes}
        <div class="f-fx"></div>
        <div class="f-dust"></div>
        <div class="f-spot"></div>
      </div>
      <div class="f-vignette"></div>
      ${bossBar(run, enemyHp)}
      <span class="f-round" id="f-round"></span>
    </div>`;
  }
  // Silhouetten am Horizont, je nach Meer
  function horizon(isl, kind) {
    const svg = inner => `<svg viewBox="0 0 400 60" preserveAspectRatio="none">${inner}</svg>`;
    if (kind === 'raid') return svg('<path d="M0 60 L0 42 L40 30 L70 40 L120 22 L170 38 L220 18 L260 34 L310 20 L360 36 L400 26 L400 60Z" fill="#1a0f2a"/>');
    if (isl === 'paradies') return svg('<path d="M0 60 Q60 30 120 46 T240 42 T400 40 L400 60Z" fill="#b07a46"/><path d="M250 44 L250 26 Q262 14 274 26 L274 44Z M280 44 L280 18 Q296 2 312 18 L312 44Z M318 44 L318 28 Q328 18 338 28 L338 44Z" fill="#8a5a34"/><rect x="246" y="40" width="96" height="6" fill="#8a5a34"/>');
    if (isl === 'enies-lobby') return svg('<path d="M0 60 L0 50 L400 50 L400 60Z" fill="#141a26"/><rect x="60" y="22" width="16" height="30" fill="#1c2434"/><rect x="150" y="6" width="26" height="46" fill="#1c2434"/><polygon points="150,6 163,-6 176,6" fill="#1c2434"/><rect x="230" y="16" width="18" height="36" fill="#1c2434"/><rect x="300" y="26" width="40" height="26" fill="#1c2434"/><rect x="158" y="14" width="4" height="4" fill="#f3d27a"/><rect x="166" y="24" width="4" height="4" fill="#f3d27a"/><rect x="236" y="26" width="4" height="4" fill="#f3d27a"/>');
    return svg('<path d="M40 60 Q90 30 150 52 L150 60Z" fill="#2d6a4a"/><path d="M96 38 Q100 24 104 14 M104 14 Q92 10 84 16 M104 14 Q116 8 124 14 M104 14 Q100 4 92 2" stroke="#245a3c" stroke-width="3" fill="none"/><path d="M260 60 Q300 40 340 50 Q370 44 400 52 L400 60Z" fill="#3a7a58"/><path d="M200 52 L214 52 L207 40Z" fill="#f0ece0"/><rect x="206" y="40" width="2" height="12" fill="#6b4f3a"/>');
  }
  // Kamera schwenkt kurz zur Seite, auf der gerade etwas passiert
  function cam(side) {
    const s = document.querySelector('#field .f-stage');
    if (!s) return;
    s.classList.remove('cam-crew', 'cam-enemy');
    void s.offsetWidth;
    s.classList.add('cam-' + side);
  }
  const fu = (side, i) => document.querySelector(`#field .fu[data-side="${side}"][data-i="${i}"]`);
  function center(node) {
    const f = $('#field');
    if (!node || !f) return null;
    const a = f.getBoundingClientRect(), r = node.querySelector('.fu-body').getBoundingClientRect();
    return { x: r.left + r.width / 2 - a.left, y: r.top + r.height / 2 - a.top };
  }
  // Effekt-Element im Feld an einer Position
  function fx(cls, pos, life, vars) {
    const box = $('#field .f-fx');
    if (!box || !pos) return null;
    const n = document.createElement('span');
    n.className = 'fx3 ' + cls;
    n.style.left = pos.x + 'px';
    n.style.top = pos.y + 'px';
    if (vars) Object.keys(vars).forEach(k => n.style.setProperty(k, vars[k]));
    box.appendChild(n);
    setTimeout(() => n.remove(), life || 700);
    return n;
  }
  function fieldFloat(side, i, text, cls) {
    const p = center(fu(side, i));
    if (!p) return;
    const n = fx('fnum ' + (cls || ''), { x: p.x + (Math.random() * 30 - 15), y: p.y - 24 }, 1100);
    if (n) n.textContent = text;
  }
  function typeOf(side, i) {
    const run = window.__glRun;
    if (!run) return 'kraft';
    const u = side === 'crew' ? run.crew[i] : run.battle.enemies[i];
    return u ? u.type : 'kraft';
  }
  // Angriff: Angreifer springt zum Ziel, Effekt je Kampfstil
  // Großes Spruchband auf dem Feld (Boss-Wut, Letzter Wille)
  function banner(cls, html, ms) {
    const field = $('#field');
    if (!field) return;
    field.querySelectorAll('.ult-call.rage, .ult-call.will').forEach(x => x.remove());
    const c = document.createElement('div');
    c.className = 'ult-call ' + cls; c.innerHTML = html;
    field.appendChild(c); setTimeout(() => c.remove(), ms || 1600);
  }
  // Der letzte Treffer: kurzes Einfrieren, Zoom, großes K.O.
  function finale(side, i) {
    const field = $('#field');
    if (!field) return;
    pulse(field, 'finale');
    const k = fx('ko-big', { x: field.clientWidth / 2, y: field.clientHeight * 0.4 }, 1400); if (k) k.textContent = 'K.O.!';
    fx('fx-flash', { x: 0, y: 0 }, 400);
  }
  function bigNum(side, i, dmg) {
    const f = el(side, i), max = f ? Number(f.dataset.max) : 0;
    return max && dmg >= max * 0.3 ? ' huge' : max && dmg >= max * 0.15 ? ' big' : '';
  }

  function fieldHit(ev) {
    const tside = ev.side === 'crew' ? 'enemy' : 'crew';
    const att = fu(ev.side, ev.from), tgt = fu(tside, ev.to);
    const A = center(att), T = center(tgt);
    if (!A || !T) return;
    const type = typeOf(ev.side, ev.from);
    const reach = type === 'technik' ? 0.18 : 0.62;
    att.style.setProperty('--dx', ((T.x - A.x) * reach).toFixed(0) + 'px');
    att.style.setProperty('--dy', ((T.y - A.y) * reach).toFixed(0) + 'px');
    pulse(att, 'atk');
    cam(tside);
    const impact = () => {
      if (ev.miss) { pulse(tgt, 'dodge'); fieldFloat(tside, ev.to, 'Ausgewichen', 'miss'); return; }
      if (ev.blocked) { fx('fx-block', T, 600); fieldFloat(tside, ev.to, 'Geblockt', 'miss'); return; }
      if (type === 'klinge') fx('fx-slash', T, 500);
      else if (type === 'technik') fx('fx-burst', T, 600);
      else fx('fx-impact', T, 600);
      if (ev.eff === 'strong') fx('fx-ring', T, 700);
      pulse(tgt, ev.crit ? 'hurt-crit' : 'hurt');
      fieldFloat(tside, ev.to, (ev.crit ? 'KRIT ' : '') + '-' + ev.dmg, (ev.crit ? 'crit' : ev.eff === 'strong' ? 'strong' : ev.eff === 'weak' ? 'weak' : '') + bigNum(tside, ev.to, ev.dmg));
      if (ev.crit) { pulse($('#field'), 'zoom'); fx('fx-flash', { x: 0, y: 0 }, 300); }
      if (ev.final) finale(tside, ev.to);
      if (ev.side === 'enemy' && curRun && curRun.battle && curRun.battle.enemies[ev.from] && (curRun.battle.enemies[ev.from].boss || curRun.battle.enemies[ev.from].raid)) {
        pulse($('#field'), 'boss-slam'); fx('fx-ring', T, 600);
      }
    };
    if (type === 'technik') {
      // Geschoss fliegt vom Angreifer zum Ziel
      const shot = fx('fx-shot', A, 400, { '--tx': (T.x - A.x) + 'px', '--ty': (T.y - A.y) + 'px' });
      setTimeout(impact, document.body.classList.contains('fast') ? 40 : 180);
      void shot;
    } else {
      setTimeout(impact, document.body.classList.contains('fast') ? 30 : 140);
    }
  }
  function fieldHp(side, i, hp) {
    const u = fu(side, i);
    if (!u) return;
    const f = el(side, i);
    const max = f ? Number(f.dataset.max) : 0;
    if (max) u.querySelector('.fu-bar i').style.width = Math.max(0, 100 * hp / max) + '%';
    const bb = $('#boss-bar');
    if (bb && side === 'enemy' && Number(bb.dataset.i) === i && max) {
      const pct = Math.max(0, 100 * hp / max);
      bb.querySelector('.bb-track i').style.width = pct + '%'; bb.querySelector('.bb-track s').style.width = pct + '%';
      pulse(bb, 'hit');
      if (pct > 0 && pct <= 22 && !lowShown) { lowShown = true; bb.classList.add('low'); fieldFloat('enemy', i, 'Fast geschafft!', 'buff'); }
    }
    tension();
    const was = !u.classList.contains('ko');
    u.classList.toggle('ko', hp <= 0);
    if (was && hp <= 0) { const p = center(u); fx('fx-ko', p, 900); }
  }
  function fieldAura(side, i) {
    const u = fu(side, i);
    if (!u) return;
    const st = live[side + ':' + i] || {};
    const keys = Object.keys(st);
    u.dataset.st = keys.length ? keys[keys.length - 1] : '';
  }

  GL.arena = {
    html(run, anim) {
      curRun = run;
      const b = run.battle;
      const done = !anim || anim.done;
      const crewHp = done ? run.crew.map(u => u.hp) : anim.crewHp;
      const enemyHp = done ? b.enemyEnd : anim.enemyHp;
      const crew = run.crew.map((u, i) => fighter('crew', i, u.def || crewData(u.id), u, crewHp[i])).join('');
      const foes = b.enemies.map((e, i) => fighter('enemy', i, e.def || GL.data.foeDef(e) || crewData(e.id), e, enemyHp[i])).join('');
      return `<div class="battle3d${done && b.win ? ' won' : ''}">${fieldHtml(run, crewHp, enemyHp)}<div class="arena hud isl-${GL.run.island(run).id}${b.kind === 'raid' ? ' raid' : b.kind === 'boss' ? ' bossfight' : ''}${done ? '' : ' entering'}" id="arena">
        <div class="arena-sky" aria-hidden="true"></div>
        <div class="side side-crew">${crew}</div>
        <div class="side side-enemy">${foes}</div>
      </div></div>`;
    },

    // Nach dem Einfügen ins DOM: Max-Werte merken, vorderste markieren
    mounted(run) {
      window.__glRun = run;
      // Einlauf-Animation nur einmal pro Kampf
      const fieldEl = $('#field');
      if (run.battle && fieldEl && !run.battle.shown) {
        run.battle.shown = true;
        const b0 = run.battle.enemies[0];
        if (b0 && (b0.boss || b0.raid)) { const d = enemyData(b0.id) || crewData(b0.id); fieldEl.dataset.boss = (run.battle.kind === 'raid' ? 'Raid: ' : 'Boss: ') + (d ? d.name : ''); }
        lowShown = false;
        if (bossIdx(run) >= 0 && !run.battle.enemies.some(e => e.ref && e.ref.pvp)) bossIntro(run);
        fieldEl.classList.add('enter');
        setTimeout(() => fieldEl.classList.remove('enter'), 2500);
      }
      Object.keys(live).forEach(k => delete live[k]);
      const root = $('#arena');
      if (!root) return;
      run.crew.forEach((u, i) => { const f = el('crew', i); if (f) f.dataset.max = u.max; });
      run.battle.enemies.forEach((u, i) => { const f = el('enemy', i); if (f) f.dataset.max = u.max; });
      markFront(root);
    },

    play(ev) {
      const root = $('#arena');
      if (!root) return;
      if (ev.k === 'hit') {
        const tside = ev.side === 'crew' ? 'enemy' : 'crew';
        pulse(el(ev.side, ev.from), 'lunge');
        fieldHit(ev);
        if (ev.miss) float(tside, ev.to, 'Ausgewichen', 'miss');
        else if (ev.blocked) float(tside, ev.to, 'Geblockt', 'block');
        else {
          const t = el(tside, ev.to);
          pulse(t, ev.crit ? 'hit-crit' : 'hit');
          float(tside, ev.to, (ev.lucky ? 'VOLLTREFFER ' : ev.crit ? 'KRIT ' : '') + '-' + ev.dmg, ev.lucky ? 'crit lucky' : ev.crit ? 'crit' : ev.eff === 'strong' ? 'strong' : ev.eff === 'weak' ? 'weak' : '');
          if (ev.lucky) { pulse(root, 'shake'); const p = center(fu(tside, ev.to)); fx('fx-ring', p, 800); fieldFloat(tside, ev.to, '🍀 Volltreffer!', 'buff'); }
          if (ev.eff === 'strong') float(tside, ev.to, 'Sehr effektiv', 'tag strong');
          if (ev.crit) pulse(root, 'shake');
        }
        setHp(tside, ev.to, ev.hp);
        setEn(ev.side, ev.from, ev.ea);
        setEn(tside, ev.to, ev.et);
      } else if (ev.k === 'ult') {
        ultFx(ev);
      } else if (ev.k === 'dmg') {
        // Schaden durch eine Fähigkeit: Name über dem Auslöser einblenden
        if (GL.data.abilities[ev.by] && !ev.ult) callout(ev.by, ev.side === 'crew' ? 'enemy' : 'crew');
        ev.list.forEach(x => {
          pulse(el(ev.side, x.to), 'hit'); float(ev.side, x.to, '-' + x.dmg, 'burn'); setHp(ev.side, x.to, x.hp);
          const p = center(fu(ev.side, x.to));
          fx(ev.by === 'special' ? 'fx-beam' : ev.by === 'bleed' ? 'fx-dot' : 'fx-ring burn', p, 700);
          pulse(fu(ev.side, x.to), 'hurt');
          fieldFloat(ev.side, x.to, '-' + x.dmg, 'burn' + bigNum(ev.side, x.to, x.dmg));
          if (ev.final && x.hp === 0) finale(ev.side, x.to);
        });
      } else if (ev.k === 'heal') {
        if (GL.data.abilities[ev.by] && !ev.ult) callout(ev.by, ev.side);
        ev.list.forEach(x => {
          pulse(el(ev.side, x.to), 'healed'); float(ev.side, x.to, '+' + x.amount, 'heal'); setHp(ev.side, x.to, x.hp);
          fx('fx-heal', center(fu(ev.side, x.to)), 900); fieldFloat(ev.side, x.to, '+' + x.amount, 'heal');
        });
      } else if (ev.k === 'revive') {
        if (GL.data.abilities[ev.by]) callout(ev.by, ev.side);
        ev.list.forEach(x => {
          setHp(ev.side, x.to, x.hp); pulse(el(ev.side, x.to), 'revived'); float(ev.side, x.to, 'Wieder da!', 'heal');
          pulse(fu(ev.side, x.to), 'rise'); fx('fx-heal', center(fu(ev.side, x.to)), 900);
        });
      } else if (ev.k === 'status') {
        if (GL.data.abilities[ev.by] && !ev.ult) callout(ev.by, ev.side === 'crew' && ev.list[0] && GL.data.statuses[ev.list[0].key].good ? 'crew' : (ev.side === 'crew' ? 'enemy' : 'crew'));
        ev.list.forEach(x => {
          const d = GL.data.statuses[x.key];
          addLive(ev.side, x.to, x.key, x.rounds);
          pulse(el(ev.side, x.to), d.good ? 'healed' : 'debuffed');
          fx(d.good ? 'fx-heal' : 'fx-curse', center(fu(ev.side, x.to)), 800);
          fieldFloat(ev.side, x.to, d.name + '!', d.good ? 'buff' : 'debuff');
          float(ev.side, x.to, d.name + '!', 'tag ' + (d.good ? 'buff' : 'debuff'));
        });
      } else if (ev.k === 'counter') {
        fieldFloat('enemy', ev.from, 'Konter!', 'debuff');
        pulse(fu('enemy', ev.from), 'atk'); pulse($('#field'), 'boss-slam');
        pulse(el('crew', ev.to), 'hit'); float('crew', ev.to, '-' + ev.dmg, 'crit');
        fx('fx-slash', center(fu('crew', ev.to)), 500); pulse(fu('crew', ev.to), 'hurt');
        fieldFloat('crew', ev.to, '-' + ev.dmg, 'crit'); setHp('crew', ev.to, ev.hp);
      } else if (ev.k === 'weather') {
        banner('us wx', `<small>Kampfwetter</small><b>${ev.name}</b><em>${ev.text}</em>`, 1900);
        const fld = $('#field'); if (fld) fld.classList.add('wx-' + ev.id);
      } else if (ev.k === 'rage' && ev.phase === 3) {
        const d = enemyData(ev.by) || crewData(ev.by);
        banner('them rage final', `<small>Endphase</small><b>${d ? d.name : 'Der Boss'} setzt alles auf eine Karte!</b><em>Ulti voll geladen</em>`, 1800);
        const fld = $('#field'); if (fld) fld.classList.add('phase3');
        pulse(fld, 'perfect-hit'); setEn('enemy', ev.to, ev.ea);
        if (ev.heal) { setHp('enemy', ev.to, ev.hp); fieldFloat('enemy', ev.to, '+' + ev.heal, 'heal'); }
      } else if (ev.k === 'rage') {
        const d = enemyData(ev.by) || crewData(ev.by);
        banner('them rage', `<small>Halbes Leben</small><b>${d ? d.name : 'Der Boss'} wird wütend!</b><em>stärker und schneller</em>`, 1700);
        const u = fu('enemy', ev.to); if (u) u.classList.add('raged');
        pulse(el('enemy', ev.to), 'debuffed'); pulse($('#field'), 'perfect-hit');
        fieldFloat('enemy', ev.to, 'Wut!', 'debuff');
        setEn('enemy', ev.to, ev.ea);
      } else if (ev.k === 'will') {
        banner('us will', `<small>Letzter Wille</small><b>Die Crew gibt nicht auf!</b><em>Ulti-Leisten laden, Mut</em>`, 1700);
        ev.list.forEach(x => { pulse(fu('crew', x.to), 'rise'); fx('fx-heal', center(fu('crew', x.to)), 900); setEn('crew', x.to, x.en); });
      } else if (ev.k === 'immune') {
        float(ev.side, ev.to, 'Immun', 'tag buff');
      } else if (ev.k === 'cleanse') {
        removeLive(ev.side, ev.to, ev.key);
        pulse(el(ev.side, ev.to), 'healed');
        float(ev.side, ev.to, GL.data.statuses[ev.key].name + ' weg', 'tag buff');
      } else if (ev.k === 'skip') {
        removeLive(ev.side, ev.to, 'stun');
        pulse(el(ev.side, ev.to), 'debuffed');
        float(ev.side, ev.to, 'Betäubt', 'tag debuff');
        fieldFloat(ev.side, ev.to, 'Betäubt', 'debuff'); fx('fx-stars', center(fu(ev.side, ev.to)), 900);
      } else if (ev.k === 'round') {
        const rb = $('#f-round');
        if (rb) { rb.textContent = 'Runde ' + ev.n; pulse(rb, 'pop'); }
        // Zustände laufen am Ende jeder Runde ab, also beim Start der nächsten herunterzählen
        if (ev.n > 1) Object.keys(live).forEach(id => {
          const [side, i] = id.split(':');
          Object.keys(live[id]).forEach(k => { if (k !== 'stun' && --live[id][k] <= 0) delete live[id][k]; });
          drawStatus(side, Number(i));
        });
      } else if (ev.k === 'special') {
        cinematic(ev.by, ev.name);
        pulse(root, 'shake');
        pulse($('#field'), 'special');
      } else if (ev.k === 'note') {
        pulse(root, 'flash');
        if (ev.by && !ev.ult) callout(ev.by, ev.side);
      }
      markFront(root);
    }
  };
})();
