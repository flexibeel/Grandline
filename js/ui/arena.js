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

  // ---------- INT: Absichten der Gegner (Slay-the-Spire-Prinzip) ----------
  // Rein aus Daten abgeleitet, was die Gegner-KI ohnehin tut. Kleine Pixel-Symbole, Erklärung beim Antippen.
  const pxIco = (rows, pal) => `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${rows.map((r, y) => [...r].map((c, x) => pal[c] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${pal[c]}"/>` : '').join('')).join('')}</svg>`;
  const INT_ICO = {
    wind: pxIco(['..o.o..', '.oyyyo.', 'oyrrryo', '.yrwry.', 'oyrrryo', '.oyyyo.', '..o.o..'], { o: '#7a3412', y: '#f2a33a', r: '#d24a24', w: '#fff3c4' }),
    heal: pxIco(['.kkkkk.', 'kggwggk', 'kgwwwgk', 'kwwwwwk', 'kgwwwgk', 'kggwggk', '.kkkkk.'], { k: '#2c5a2a', g: '#5fae4f', w: '#effae6' }),
    aim: pxIco(['..rrr..', '.r...r.', 'r..k..r', 'r.kkk.r', 'r..k..r', '.r...r.', '..rrr..'], { r: '#c2412d', k: '#3a2a14' }),
    call: pxIco(['......k', '....kyk', 'k.kyyyk', 'kkyyyyk', 'k.kyyyk', '....kyk', '......k'], { k: '#5a3a12', y: '#e8b84a' }),
    taunt: pxIco(['.kkkkk.', 'kbbbbbk', 'kbwbbbk', 'kbbbbbk', '.kbbbk.', '..kbk..', '...k...'], { k: '#2a3a52', b: '#8fb0d6', w: '#eaf2fb' })
  };
  const INT_TXT = {
    wind: ['Holt aus', 'Alle 3 Runden kündigt er einen schweren Schlag an. Ausweichen und Rüstung helfen dagegen doppelt.', 'Winds up', 'Every 3 rounds he announces a heavy blow. Dodge and armor count double against it.'],
    call: ['Ruft Verstärkung', 'Wird er wütend, pfeift er einen gefallenen Gefolgsmann zurück. Schnell sein lohnt sich.', 'Calls for help', 'Once enraged, he whistles a fallen henchman back up. Speed pays off.'],
    healBoss: ['Flickt den Boss', 'Heilt jede Runde, am liebsten den Anführer. Zuerst ausschalten.', 'Patches up the boss', 'Heals every round, the leader first. Take it out early.'],
    heal: ['Heiler', 'Heilt jede Runde den Angeschlagensten seiner Truppe.', 'Healer', 'Heals the most battered ally every round.'],
    aimLow: ['Zielt auf Angeschlagene', 'Schießt über die Köpfe auf die Figur mit dem wenigsten Leben.', 'Picks on the wounded', 'Shoots past the front line at your most battered fighter.'],
    aimWeak: ['Scharfschütze', 'Nimmt immer die schwächste Figur ins Visier.', 'Sniper', 'Always targets your weakest fighter.'],
    aimStrong: ['Rauflustig', 'Sucht sich deine stärkste Figur aus.', 'Bully', 'Goes after your strongest fighter.'],
    taunt: ['Leibwache', 'Zieht alle Angriffe auf sich, bis sie fällt.', 'Bodyguard', 'Draws every attack until it falls.']
  };
  function intents(e, team, opts) {
    if (!e || (opts && opts.pvp) || e.pvp || (e.ref && e.ref.pvp)) return [];
    const C = GL.config, FM = Object.assign({ on: true, foeFocus: true, call: 0.35 }, C.formation || {}), BF = C.bossFight || {};
    const lead = f => !!(f.boss || f.mini || f.raid);
    const hasLead = (team || []).some(lead), hasGuard = (team || []).some(f => !lead(f));
    const out = [];
    if ((e.boss || e.raid) && BF.windup) out.push({ k: 'wind', t: 'wind' });
    if ((e.boss || e.raid) && FM.on && FM.call > 0 && hasGuard) out.push({ k: 'call', t: 'call' });
    if (e.ability === 'medic') out.push({ k: 'heal', t: FM.on && hasLead && !lead(e) ? 'healBoss' : 'heal' });
    if (e.ability === 'taunt') out.push({ k: 'taunt', t: 'taunt' });
    if (e.ability === 'sniper') out.push({ k: 'aim', t: 'aimWeak' });
    else if (e.ability === 'bully') out.push({ k: 'aim', t: 'aimStrong' });
    else if (FM.on && FM.foeFocus && !lead(e) && e.type === 'technik' && e.ability !== 'medic') out.push({ k: 'aim', t: 'aimLow' });
    return out.slice(0, 2);
  }
  function intentText(t) {
    const en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en', x = INT_TXT[t] || ['', ''];
    return en ? [x[2], x[3]] : [x[0], x[1]];
  }
  function intentHtml(e, team, opts, cls) {
    const list = intents(e, team, opts);
    if (!list.length) return '';
    return `<span class="int-row ${cls || ''}">${list.map(x => { const [n, d] = intentText(x.t); return `<i class="int-i int-${x.k}" tabindex="0" role="button" data-act="noop" data-int="${x.t}" title="${String(n).replace(/"/g, '&quot;')}" aria-label="${String(n + ': ' + d).replace(/"/g, '&quot;')}">${INT_ICO[x.k]}</i>`; }).join('')}</span>`;
  }
  // Start-Energie wie im Kampfsystem (Crew und Bösewichte/Bosse haben eine Ulti, einfache Gegner nicht)
  let curRun = null;
  // Gegnerwellen: Welle 2 wartet unsichtbar am Rand, bis sie im Kampf aufgerufen wird
  const waveIn = new Set();
  let waveDone = false;
  const waitW2 = (side, i, unit) => side === 'enemy' && unit && unit.wave === 2 && !waveDone && !waveIn.has(i);
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
    return `<div class="fighter${hp <= 0 ? ' ko' : ''}${unit.boss ? ' big' : ''}${unit.mini ? ' mini-boss' : ''}${waitW2(side, i, unit) ? ' w2-wait' : ''}" data-side="${side}" data-i="${i}">
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
      const first = list.find(el => !el.classList.contains('ko') && !el.classList.contains('w2-wait'));
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
    if (hp > 0) f.querySelectorAll('.ko-stamp').forEach(x => x.remove());   // wiederbelebt: Stempel weg
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

  // ---------- Pixel-Effekte für Ultis und Zustände: auf dem Feld passiert sichtbar etwas ----------
  const PX = {
    fist:   { rows: ['..AA.AA...', '.AAAAAAAA.', 'AABAAAAAAA', 'AABAAAAAAA', 'AAAAAAAAAA', '.AAAAAAAA.', '..AAAAAA..', '...BBBB...'], c: { A: '#f2c9a0', B: '#c08a5a' } },
    slash:  { rows: ['W........W', '.W......W.', '..W....W..', '...W..W...', '....WW....', '....WW....', '...W..W...', '..W....W..', '.W......W.', 'W........W'], c: { W: '#ffffff' } },
    bolt:   { rows: ['....YY', '...YY.', '..YYY.', '.YYYYY', '...YY.', '..YY..', '.YY...', 'YY....'], c: { Y: '#fff27a' } },
    flame:  { rows: ['...R....', '..RR..R.', '.RRYR.R.', '.RYYRRR.', 'RRYYYRR.', 'RYYWYYR.', '.RYYYR..', '..RRR...'], c: { R: '#e0603a', Y: '#f6c94a', W: '#fff6c8' } },
    drop:   { rows: ['..R..', '.RRR.', 'RRRRR', 'RRWRR', '.RRR.'], c: { R: '#c2412f', W: '#f6a89a' } },
    skull:  { rows: ['.PPPPP.', 'PPPPPPP', 'PKPPPKP', 'PPPPPPP', '.PPKPP.', '.P.P.P.'], c: { P: '#c9a8ff', K: '#3a2a50' } },
    crack:  { rows: ['K...K', '.K.K.', '..K..', '.K.K.', 'K...K'], c: { K: '#5a4a6a' } },
    spark:  { rows: ['..G..', '..G..', 'GGWGG', '..G..', '..G..'], c: { G: '#6fd08a', W: '#ffffff' } },
    star:   { rows: ['..Y..', '.YYY.', 'YYYYY', '.Y.Y.'], c: { Y: '#ffe04a' } },
    shield: { rows: ['SSSSSS', 'SWWWWS', 'SWSSWS', '.SWWS.', '..SS..'], c: { S: '#e0b040', W: '#fff2b8' } },
    ball:   { rows: ['..KKKK..', '.KKKKKK.', 'KKWKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', '.KKKKKK.', '..KKKK..'], c: { K: '#2a2a32', W: '#9aa0b0' } },
    sword:  { rows: ['.........W', '........WS', '.......WS.', '......WS..', '.....WS...', '..G.WS....', '..GGS.....', '...GG.....', '..B..G....', '.B........'], c: { W: '#ffffff', S: '#c8d0da', G: '#e0b040', B: '#6b4a2a' } },
    anchor: { rows: ['...KK...', '..K..K..', '...KK...', 'KKKKKKKK', '...KK...', 'K..KK..K', 'KK.KK.KK', '.KKKKKK.'], c: { K: '#5a6a7a' } }
  };
  const pxSvgCache = {};
  function pxSvg(k) {
    if (pxSvgCache[k]) return pxSvgCache[k];
    const a = PX[k], w = a.rows[0].length, h = a.rows.length;
    let r = '';
    a.rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (a.c[ch]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${a.c[ch]}"/>`; }));
    return (pxSvgCache[k] = `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${r}</svg>`);
  }
  function pxFx(kind, pos, cls, life, delay) {
    if (!pos) return;
    setTimeout(() => { const n = fx('pxfx ' + kind + ' ' + (cls || ''), pos, life || 800); if (n) n.innerHTML = pxSvg(kind); }, delay || 0);
  }
  const TYPE_FX = { kraft: 'fist', klinge: 'slash', technik: 'bolt' };
  const PROJ = { kraft: 'anchor', klinge: 'sword', technik: 'ball' };
  // Ein Geschoss fliegt vom Angreifer zum Ziel (mit Drehung), schlägt ein, das Feld bebt kurz
  function launch(fromEl, toEl, type, delay, big) {
    const box = $('#field .f-fx'), A = center(fromEl), T = center(toEl);
    if (!box || !A || !T) return;
    setTimeout(() => {
      const n = document.createElement('span');
      n.className = 'proj p-' + type + (big ? ' big' : '');
      n.innerHTML = pxSvg(PROJ[type] || 'ball');
      n.style.left = A.x + 'px'; n.style.top = (A.y - 10) + 'px';
      box.appendChild(n);
      const dx = T.x - A.x, dy = T.y - A.y - 10, arc = -Math.min(70, Math.abs(dx) * 0.35);
      const spin = type === 'klinge' ? 900 : type === 'kraft' ? 360 : 0;
      const dur = document.body.classList.contains('fast') ? 220 : 420;
      const anim = n.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg) scale(.8)' },
        { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 + arc}px)) rotate(${spin / 2}deg) scale(1.15)` },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin}deg) scale(1)` }
      ], { duration: dur, easing: 'cubic-bezier(.3,.6,.4,1)' });
      anim.onfinish = () => {
        n.remove();
        pxFx(TYPE_FX[type], T, big ? 'huge' : 'big', 650);
        pulse(toEl, 'hurt-crit'); pulse($('#field'), 'boss-slam');
      };
    }, delay || 0);
  }
  // Ulti: Signatur-Effekt je Kampfstil auf die Ziele, bei „alle“ eine Welle über die ganze Gegnerseite
  function ultSignature(ev) {
    const run = window.__glRun || {};
    const list = ev.side === 'crew' ? run.crew : (run.battle || {}).enemies;
    const u = list && list[ev.from];
    const ult = (GL.data.ultis || {})[ev.by] || null;
    const type = (u && (u.type || (u.def && u.def.type))) || 'kraft';
    const foe = ev.side === 'crew' ? 'enemy' : 'crew';
    const strike = ult && (ult.fx || []).find(f => f.do === 'strike');
    const heal = ult && (ult.fx || []).find(f => f.do === 'heal');
    const targets = [...document.querySelectorAll(`#field .fu-${foe}:not(.ko)`)];
    const me = fu(ev.side, ev.from);
    if (me) pulse(me, 'atk');
    if (strike && strike.target === 'all') {
      const field = $('#field');
      if (field) { const w = document.createElement('div'); w.className = 'ult-wave ' + foe + ' t-' + type; field.appendChild(w); setTimeout(() => w.remove(), 900); }
      targets.forEach((t, k) => launch(me, t, type, 120 + k * 110, false));
    } else if (strike) {
      const t = strike.target === 'weakest' ? targets.slice().sort((a, b) => (parseFloat(a.querySelector('.fu-bar i').style.width) || 0) - (parseFloat(b.querySelector('.fu-bar i').style.width) || 0))[0] : targets[0];
      if (t) { launch(me, t, type, 120, true); pxFx(TYPE_FX[type], center(t), 'echo', 800, 560); }
    }
    if (heal) [...document.querySelectorAll(`#field .fu-${ev.side}:not(.ko)`)].forEach((t, k) => pxFx('spark', center(t), 'rise', 1000, 200 + k * 80));
  }
  const ST_FX = { burning: 'flame', bleed: 'drop', poison: 'drop', fear: 'skull', weak: 'crack', stun: 'star', brave: 'shield' };

  function ultFx(ev) {
    const f = el(ev.side, ev.from);
    setEn(ev.side, ev.from, 0);
    if (f) pulse(f, 'ult-glow');
    try { ultSignature(ev); } catch (e) { /* Effekt ist Deko */ }
    const field = $('#field');
    if (field) {
      const run = window.__glRun || {};
      const list = ev.side === 'crew' ? run.crew : (run.battle || {}).enemies;
      const d = list && list[ev.from] ? (list[ev.from].def || crewData(list[ev.from].id) || enemyData(list[ev.from].id) || { name: list[ev.from].name }) : null;
      field.querySelectorAll('.ult-tag').forEach(x => x.remove());
      const me = fu(ev.side, ev.from), p = center(me);
      const c = document.createElement('div');
      c.className = 'ult-tag ' + (ev.side === 'crew' ? 'us' : 'them') + (ev.tier ? ' ' + ev.tier : '') + (ev.spark ? ' spark' : '');
      const extra = ev.tier === 'perfect' ? '<em>★ Perfekt</em>' : ev.bonus ? `<em>+ ${ev.bonus}</em>` : ev.combo > 1 ? `<em>${ev.combo}. Ulti</em>` : ev.spark ? '<em>Glücksfunke</em>' : '';
      c.innerHTML = `<b>${ev.name}</b>${extra}`;
      if (p) { c.style.left = Math.max(70, Math.min(field.clientWidth - 70, p.x)) + 'px'; c.style.top = Math.max(26, p.y - 70) + 'px'; }
      field.appendChild(c);
      setTimeout(() => c.remove(), 1400);
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
        c.className = 'callout ty-' + (list[i].type || 'kraft') + (f.classList.contains('fu') ? ' on-field' : '');
        c.textContent = a.name + '!';
        f.querySelectorAll('.callout').forEach(x => x.remove());
        f.appendChild(c);
        setTimeout(() => c.remove(), 1500);
        return;
      }
    }
  }

  // Fähigkeiten, die beim normalen Treffer wirken (Krit-Stil, Scharfschütze, Doppelschlag,
  // stärker werden): kurz sichtbar machen, damit jede Crew anders kämpft. Nur Anzeige.
  const hitMemo = { last: null, ramp: {}, seen: {}, at: {} };
  function hitAbility(ev) {
    const run = window.__glRun || {};
    const list = ev.side === 'crew' ? run.crew : (run.battle || {}).enemies;
    const u = list && list[ev.from];
    const a = u && GL.data.abilities[u.id];
    const key = ev.side + ':' + ev.from;
    const prev = hitMemo.last; hitMemo.last = key;
    if (!a || ev.miss || ev.blocked) return;
    const now = Date.now();
    const calm = id => { if (now - (hitMemo.at[id] || 0) < 2600) return false; hitMemo.at[id] = now; return true; };
    const critStyle = (a.mods || []).some(m => m.crit) || /Krit/.test(a.text || '');
    if (a.kind === 'double' && prev === key) { tagAt(ev.side, ev.from, 'Doppelschlag!', 'buff ab', 50); return; }
    if (a.kind === 'sniper' && !hitMemo.seen[key]) { hitMemo.seen[key] = 1; callout(u.id, ev.side); return; }
    if (a.kind === 'ramp') {
      const n = hitMemo.ramp[key] = (hitMemo.ramp[key] || 0) + 1;
      tagAt(ev.side, ev.from, '+' + (a.value || 1) + ' ⚔', 'buff ab', 50);
      if (n === 3 || n === 6 || n === 10) callout(u.id, ev.side);
      return;
    }
    if (ev.crit && critStyle && calm(key)) callout(u.id, ev.side);
  }
  // Kampfbeginn: welche Duos, Banden-Boni und Bündnisse wirken gerade? Kurz als Pixel-Schilder
  function synergyIntro(run) {
    const field = $('#field');
    if (!field || !run || !run.crew) return;
    const alive = run.crew.filter(u => u.hp > 0);
    const chips = [];
    (GL.effects.duos(alive) || []).forEach(x => chips.push(`<span class="sy-chip duo">♥ ${x.name}</span>`));
    (GL.effects.status(alive) || []).filter(s => s.active && s.kind === 'faction').forEach(s => chips.push(`<span class="sy-chip fac">${s.name} ${s.count}</span>`));
    (GL.effects.alliances ? GL.effects.alliances(alive) : []).forEach(x => chips.push(`<span class="sy-chip ally">✦ ${x.name}</span>`));
    if (!chips.length) return;
    // Nicht mehr über die Szene legen: still in die schmale Leiste unter dem Kampfbild
    const strip = $('#f-strip');
    if (strip) {
      if (strip.querySelector('.fs-syn')) return;
      const s = document.createElement('span');
      s.className = 'fs-syn';
      s.innerHTML = chips.slice(0, 4).join('');
      strip.appendChild(s);
      return;
    }
    const n = document.createElement('div');
    n.className = 'sy-intro';
    n.innerHTML = `<small>Zusammenspiel</small>${chips.slice(0, 4).join('')}`;
    field.appendChild(n);
    setTimeout(() => n.classList.add('out'), 2300);
    setTimeout(() => n.remove(), 2800);
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
  // Alle stehen auf einer gemeinsamen Bodenlinie: vorne Reihe 1, dahinter versetzt Reihe 2
  const CREW_SLOTS = [[38, 8], [24, 10], [10, 12], [45, 19], [31, 21], [17, 23], [5, 25]];
  const FOE_SLOTS  = [[62, 8], [76, 10], [90, 12], [55, 19], [69, 21], [83, 23]];
  // Kulisse je Insel (sonst nach Meer)
  const THEME = {
    'shells-town': 'town', 'orange-town': 'town', 'loguetown': 'town', 'whisky-peak': 'town',
    'syrup': 'beach', 'jaya': 'beach', 'baratie': 'deck', 'puffing-tom': 'deck', 'arlong-park': 'pier', 'water-7': 'pier',
    'little-garden': 'jungle', 'drumm': 'snow', 'alabasta': 'desert', 'skypiea': 'sky', 'long-ring': 'meadow',
    'enies-gate': 'fort', 'tower': 'fort', 'tor': 'fort', 'sabaody': 'meadow',
    'tiefsee': 'deep', 'korallenhuegel': 'deep', 'fischmenschen-viertel': 'deep', 'meerwald': 'deep', 'gyoncorde': 'deep', 'ryugu': 'deep',
    'florian': 'grave', 'grusel-garten': 'grave', 'hogback-labor': 'grave', 'mangroven': 'grave', 'thriller-schloss': 'grave'
  };
  const SEA_THEME = { 'east-blue': 'beach', 'paradies': 'desert', 'enies-lobby': 'fort' };
  function themeOf(run) {
    if (run.theme) return run.theme;   // Duelle/Landgang können eine Kulisse vorgeben
    let here = null, sea = null;
    try { here = GL.run.chapterIsland(run); } catch (e) { here = null; }
    try { sea = GL.run.island(run).id; } catch (e) { sea = null; }
    return (here && THEME[here.id]) || SEA_THEME[sea] || 'beach';
  }
  // Kleine Pixel-Requisiten je Kulisse (reine CSS-Formen)
  const PROPS = {
    town: '<i class="p3 house a"></i><i class="p3 house b"></i><i class="p3 lamp l"></i><i class="p3 barrel r"></i><i class="p3 crate r2"></i>',
    beach: '<i class="p3 palm l"><i></i></i><i class="p3 palm r"><i></i></i><i class="p3 shell s1"></i><i class="p3 shell s2"></i><i class="p3 rock r"></i>',
    deck: '<i class="p3 mast"><i></i></i><i class="p3 barrel l"></i><i class="p3 cannon r"></i><i class="p3 ring r2"></i>',
    pier: '<i class="p3 post l"></i><i class="p3 post r"></i><i class="p3 crate l2"></i><i class="p3 rope r2"></i>',
    jungle: '<i class="p3 fern l"></i><i class="p3 fern r"></i><i class="p3 bone m"></i><i class="p3 tree bg"></i>',
    snow: '<i class="p3 pine l"></i><i class="p3 pine r"></i><i class="p3 pine bg"></i><i class="snowfall"></i>',
    desert: '<i class="p3 pyramid bg"></i><i class="p3 cactus l"></i><i class="p3 cactus r"></i><i class="p3 rock m"></i>',
    sky: '<i class="p3 puff l"></i><i class="p3 puff r"></i><i class="p3 bell bg"></i>',
    meadow: '<i class="p3 fence l"></i><i class="p3 flower f1"></i><i class="p3 flower f2"></i><i class="p3 flower f3"></i><i class="p3 tree r"></i>',
    fort: '<i class="p3 tower bg"></i><i class="p3 torch l"></i><i class="p3 torch r"></i><i class="p3 banner m"></i>',
    deep: '<i class="p3 coral l"></i><i class="p3 coral r"></i><i class="p3 kelp m"></i><i class="bubbles"></i>',
    grave: '<i class="p3 tomb l"></i><i class="p3 tomb r"></i><i class="p3 deadtree bg"></i><i class="fog"></i>'
  };
  // Formation: der Anführer steht hinten (eigener Platz), sein Gefolge vorne mit kleinem Schild
  let leadAt = -1;
  function fieldUnit(side, i, entry, unit, hp) {
    const slots = side === 'crew' ? CREW_SLOTS : FOE_SLOTS;
    const backLead = side === 'enemy' && i === leadAt && i > 0;
    const [x, y] = backLead ? [79, 20] : slots[Math.min(i, slots.length - 1)];
    const depth = 1.04 - y / 140;
    const scale = (unit.boss ? 1.6 : unit.mini ? 1.15 : 1) * depth;
    const pct = Math.max(0, 100 * hp / unit.max);
    return `<div class="fu fu-${side}${hp <= 0 ? ' ko' : ''}${side === 'enemy' && leadAt > 0 && i < leadAt && !unit.wave ? ' guard' : ''}${backLead ? ' lead-back' : ''}${unit.boss ? ' boss' : ''}${unit.mini ? ' mini' : ''}${unit.elite2 ? ' elite2' : ''}${waitW2(side, i, unit) ? ' w2-wait' : ''}" data-side="${side}" data-i="${i}"
        style="left:${x}%;bottom:${y}%;z-index:${200 - y};--s:${scale.toFixed(2)}">
      <div class="fu-shadow"></div>${hp <= 0 ? (GL.arenaFx ? GL.arenaFx.koMark() : '<span class="fu-ko">K.O.</span>') : ''}
      <div class="fu-aura"></div>
      <div class="fu-body" style="--d:${(i * 0.37 + (side === 'crew' ? 0 : 0.5)).toFixed(2)}s">${GL.sprites.renderShaded ? GL.sprites.renderShaded(entry) : GL.sprites.render(entry)}</div>
      <div class="fu-bar"><i style="width:${pct}%"></i></div>
      ${side === 'enemy' && hp > 0 && curRun && curRun.battle ? intentHtml(unit, curRun.battle.enemies, { pvp: curRun.battle.kind === 'duel' }, 'fu-int') : ''}
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
    // Nur noch einer steht: kurzer Hinweis, einmal pro Kampf
    const up = [...document.querySelectorAll('#arena .fighter[data-side="crew"]:not(.ko)')];
    if (up.length === 1 && foesUp > 0 && !lastShown && document.querySelectorAll('#arena .fighter[data-side="crew"]').length > 1) {
      lastShown = true;
      const nm = (up[0].querySelector('.f-name b') || {}).textContent || '';
      banner('us will last', `<small>Letzte Hoffnung</small><b>Nur noch ${nm} steht!</b>`, 1300);
    }
  }
  let lastShown = false;

  function fieldHtml(run, crewHp, enemyHp) {
    const b = run.battle;
    const crew = run.crew.map((u, i) => fieldUnit('crew', i, u.def || crewData(u.id), u, crewHp[i])).join('');
    leadAt = b.enemies.findIndex(e => (e.boss || e.mini) && e.wave !== 2);
    const foes = b.enemies.map((e, i) => fieldUnit('enemy', i, e.def || GL.data.foeDef(e) || crewData(e.id), e, enemyHp[i])).join('');
    const isl = GL.run.island(run).id;
    const th = themeOf(run);
    const n = Math.max(run.crew.length, b.enemies.length);
    return `<div class="field v3 th-${th} isl-${isl}${(() => { try { const s = GL.ui && GL.ui.lageSky ? GL.ui.lageSky(run) : {}; return s.weather ? ' lw-' + s.weather : ''; } catch (e) { return ''; } })()}${b.kind === 'raid' ? ' raid' : b.kind === 'boss' ? ' bossfight' : ''}${n >= 6 ? ' crowd' : n >= 5 ? ' busy' : ''}" id="field" aria-hidden="true" data-act="faster">
      <div class="f-stage">
        <div class="b3"><i class="b3-sky"></i><i class="b3-sun"></i><i class="b3-cloud c1"></i><i class="b3-cloud c2"></i><i class="b3-cloud c3"></i><i class="b3-sea"><i></i></i><i class="b3-ground"></i><span class="b3-props">${PROPS[th] || ''}</span>${b.kind === 'boss' || b.kind === 'raid' ? '<i class="b3-flag"></i>' : ''}</div>
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
    // Worte (Ausgewichen, Konter, Betäubt …) als kleines Pixel-Abzeichen, Zahlen bleiben Zahlen
    const word = !/^[-+]\d/.test(String(text));
    const n = fx((word ? 'ptag ' : 'fnum ') + (cls || ''), { x: p.x + (word ? 0 : Math.random() * 30 - 15), y: p.y - (word ? 40 : 24) }, word ? 1000 : 1100);
    if (n) n.textContent = text;
    // ART2: Zahlen als Pixel-Ziffern (Text bleibt als Fallback/Vorlese-Label)
    if (n && !word && GL.art && GL.art.digits) {
      const c = cls || '', kind = /crit|lucky/.test(c) ? 'crit' : /heal/.test(c) ? 'heal' : /burn/.test(c) ? 'burn' : /poison|gift/.test(c) ? 'poison' : /block|shield/.test(c) ? 'shield' : 'normal';
      const h = GL.art.digits(String(text).replace(/[^0-9+\-%]/g, ''), kind);
      if (h) { n.setAttribute('aria-label', text); n.innerHTML = h; n.classList.add('fpx'); }
    }
  }
  function tagAt(side, i, text, cls, dy) {
    const p = center(fu(side, i));
    if (!p) return;
    const n = fx('ptag ' + (cls || ''), { x: p.x, y: p.y - (dy || 44) }, 1000);
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

  // BUFF: Stil-Signaturen. Der eigene aktive Stil bekommt ein wiedererkennbares Zeichen, wenn er wirkt.
  const SIG = { b: null, key: null, at: {} };
  function sigKey() {
    const run = window.__glRun;
    const b = run && run.battle;
    if (!b || b.kind === 'duel') return null;
    if (SIG.b !== b) { SIG.b = b; SIG.at = {}; const bd = GL.effects && GL.effects.build ? GL.effects.build(run.crew || []) : null; SIG.key = bd ? bd.key : null; }
    return SIG.key;
  }
  function sigCalm(id, ms) { const now = Date.now(); if (now - (SIG.at[id] || 0) < ms) return false; SIG.at[id] = now; return true; }
  function crewRole(i) { const run = window.__glRun; const u = run && run.crew && run.crew[i]; return u ? u.role : ''; }
  const SIG_TXT = { dodge: ['💨 Ausgewichen!', '💨 Dodged!'] };
  const sigT = k => (GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en' ? SIG_TXT[k][1] : SIG_TXT[k][0]);

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
    const fast = document.body.classList.contains('fast');
    const impact = () => {
      if (ev.heavy) { const b = fu('enemy', ev.from); if (b) b.classList.remove('windup'); }
      const sk = sigKey();
      if (ev.miss) {
        // Tempo-Stil: deine Figur wischt sichtbar zur Seite, mit Stil-Zeichen
        if (tside === 'crew' && sk === 'technik') {
          pulse(tgt, 'sig-swipe'); if (!fast) fx('sig-wind', T, 520);
          fieldFloat(tside, ev.to, ev.heavy ? '💨 Knapp vorbei!' : sigT('dodge'), 'miss sig sig-tempo');
          return;
        }
        // Ausweichen: kurzes Nachbild, bei schwerem Schlag ein extra Lob
        pulse(tgt, 'dodge'); if (!fast) pulse(tgt, 'kghost');
        fieldFloat(tside, ev.to, ev.heavy ? 'Knapp vorbei!' : 'Daneben!', 'miss');
        return;
      }
      if (ev.blocked) { fx('fx-block', T, 600); fieldFloat(tside, ev.to, 'Geblockt', 'miss'); return; }
      if (type === 'klinge') fx('fx-slash', T, 500);
      else if (type === 'technik') fx('fx-burst', T, 600);
      else fx('fx-impact', T, 600);
      // Wucht: Staubwölkchen am Boden, bei richtig großen Treffern ruckelt kurz das Bild
      const big = bigNum(tside, ev.to, ev.dmg);
      if (type === 'kraft' && !fast) fx('kfx-dust', { x: T.x, y: T.y + 22 }, 520);
      if ((type === 'kraft' && big === ' huge') || ev.heavy) pulse($('#field'), 'knudge');
      if (ev.heavy) { fx('kfx-heavy', T, 650); tagAt(tside, ev.to, 'Schwerer Schlag!', 'debuff', 60); }
      if (ev.eff === 'strong') fx('fx-ring', T, 700);
      pulse(tgt, ev.crit ? 'hurt-crit' : 'hurt');
      if (GL.arenaFx) try { GL.arenaFx.hit(ev, A, T, type, fast); } catch (e) { /* nur Deko */ }
      // Bollwerk: Rüstung schluckt sichtbar etwas weg
      if (tside === 'crew' && sk === 'brecher' && (ev.ab || 0) >= 2 && sigCalm('w' + ev.to, 900)) { fx('sig-shield', T, 650); tagAt(tside, ev.to, '🛡 −' + ev.ab, 'sig sig-wall', 64); }
      // Wucht: große Kraft-Treffer rumsen
      if (ev.side === 'crew' && sk === 'kraft' && type === 'kraft' && big && sigCalm('k', 700)) { if (big !== ' huge' && !fast) pulse($('#field'), 'knudge'); tagAt(tside, ev.to, '💥', 'sig sig-smash', 66); }
      // Sturmtrupp: Kämpfer schlagen mit Glut zu
      if (ev.side === 'crew' && sk === 'kaempfer' && crewRole(ev.from) === 'kaempfer' && !fast && sigCalm('f' + ev.from, 1400)) fx('sig-ember', T, 620);
      if (ev.crit && ev.side === 'crew' && sk === 'klinge' && type === 'klinge') { if (!fast) fx('sig-cut', T, 520); tagAt(tside, ev.to, '⚔ KRIT!', 'crit sig-blade', 56); }
      else if (ev.crit) tagAt(tside, ev.to, 'KRIT!', 'crit', 56);
      fieldFloat(tside, ev.to, '-' + ev.dmg, (ev.crit ? 'crit' : ev.eff === 'strong' ? 'strong' : ev.eff === 'weak' ? 'weak' : '') + bigNum(tside, ev.to, ev.dmg));
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
    if (was && hp <= 0 && side === 'crew' && GL.quips) { try { GL.quips.ko(i); } catch (e) { /* nur Deko */ } }
    if (was && hp <= 0) { const p = center(u); fx('fx-ko', p, 900); if (GL.arenaFx) GL.arenaFx.ko(u, p); else { const t = fx('ptag ko', { x: p.x, y: p.y - 30 }, 1100); if (t) t.textContent = 'K.O.'; } }
    if (!(hp <= 0)) { const k = u.querySelector('.fu-ko.kx'); if (k) k.remove(); }
  }
  // JUICE: kleine Sprechblase über dem Kopf einer Figur (selten, siehe crewquips.js)
  function say(side, i, text, ms) {
    const u = fu(side, i), f = $('#field'), box = $('#field .f-fx');
    if (!u || !f || !box || !text || u.classList.contains('ko')) return false;
    box.querySelectorAll('.cq-bubble').forEach(x => x.remove());
    const a = f.getBoundingClientRect(), r = u.querySelector('.fu-body').getBoundingClientRect();
    const n = document.createElement('span');
    n.className = 'cq-bubble' + (side === 'enemy' ? ' them' : '');
    n.textContent = text;
    box.appendChild(n);
    const w = n.offsetWidth || 120, cx = r.left + r.width / 2 - a.left;
    const x = Math.max(w / 2 + 4, Math.min(a.width - w / 2 - 4, cx));
    n.style.left = x + 'px';
    n.style.top = Math.max(4, r.top - a.top - 6) + 'px';
    n.style.setProperty('--tail', Math.max(10, Math.min(w - 10, w / 2 + (cx - x))) + 'px');
    requestAnimationFrame(() => n.classList.add('in'));
    setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 300); }, ms || 2300);
    return true;
  }
  function fieldAura(side, i) {
    const u = fu(side, i);
    if (!u) return;
    const st = live[side + ':' + i] || {};
    const keys = Object.keys(st);
    u.dataset.st = keys.length ? keys[keys.length - 1] : '';
  }

  // Team-Balken: volle Bande lädt mit jeder Ulti, voll = Team-Fähigkeit
  function teamBarHtml(run, done) {
    const t = run.battle && run.battle.team;
    if (!t) return '';
    const F = GL.data.factions[t.f] || {};
    let n = t.start || 0;
    if (done) (run.battle.events || []).forEach(e => { if (e.side === 'crew' && e.k === 'teamCharge') n = e.n >= e.need ? 0 : e.n; });
    const segs = Array.from({ length: t.need }, (_, k) => `<i class="tb-seg${k < n ? ' on' : ''}"></i>`).join('');
    return `<div class="team-bar" id="team-bar" data-n="${n}" data-need="${t.need}">
      <span class="tb-ico">${GL.ui && GL.ui.pxIcon ? GL.ui.pxIcon(t.f) : ''}</span>
      <span class="tb-txt"><small>${String(F.name || '').replace(/[<>&"]/g, '')}</small><b>${String(t.name).replace(/[<>&"]/g, '')}</b></span>
      <span class="tb-segs">${segs}</span></div>`;
  }
  function teamBarSet(n, full) {
    const bar = $('#team-bar'); if (!bar) return;
    bar.querySelectorAll('.tb-seg').forEach((s, k) => s.classList.toggle('on', k < n));
    if (full) { bar.classList.add('full'); setTimeout(() => { bar.classList.remove('full'); bar.querySelectorAll('.tb-seg').forEach(s => s.classList.remove('on')); }, 1400); }
    else { bar.classList.remove('tick'); void bar.offsetWidth; bar.classList.add('tick'); }
  }

  GL.arena = {
    say,
    intents, intentHtml, intentText, intentIcon: k => INT_ICO[k] || '',
    html(run, anim) {
      curRun = run;
      const b = run.battle;
      const done = !anim || anim.done;
      waveDone = done;
      const crewHp = done ? run.crew.map(u => u.hp) : anim.crewHp;
      const enemyHp = done ? b.enemyEnd : anim.enemyHp;
      const crew = run.crew.map((u, i) => fighter('crew', i, u.def || crewData(u.id), u, crewHp[i])).join('');
      const foes = b.enemies.map((e, i) => fighter('enemy', i, e.def || GL.data.foeDef(e) || crewData(e.id), e, enemyHp[i])).join('');
      return `<div class="battle3d${done && b.win ? ' won' : ''}">${fieldHtml(run, crewHp, enemyHp)}<div class="f-strip" id="f-strip">${teamBarHtml(run, done)}</div><div class="arena hud isl-${GL.run.island(run).id}${b.kind === 'raid' ? ' raid' : b.kind === 'boss' ? ' bossfight' : ''}${done ? '' : ' entering'}" id="arena">
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
        waveIn.clear();
        const b0 = run.battle.enemies.find(e => e.boss || e.raid) || run.battle.enemies[0];
        if (b0 && (b0.boss || b0.raid)) { const d = enemyData(b0.id) || crewData(b0.id); fieldEl.dataset.boss = (run.battle.kind === 'raid' ? 'Raid: ' : 'Boss: ') + (d ? d.name : ''); }
        lowShown = false; lastShown = false;
        // Bosse bekommen ihren großen Auftritt schon vor dem Kampf (siehe startFight in main.js)
        if (run.pending && run.pending.rival) {
          const n = document.createElement('div');
          n.className = 'boss-intro rival';
          n.innerHTML = `<i class="bi-bar top"></i><i class="bi-bar bot"></i><span class="bi-card"><small>Begegnung auf See</small><b>${String(run.pending.rival.name).replace(/[<>&"]/g, '')}</b><em>Stammcrew eines Mitspielers</em></span>`;
          fieldEl.appendChild(n); setTimeout(() => n.remove(), 2300);
        }
        fieldEl.classList.add('enter');
        setTimeout(() => fieldEl.classList.remove('enter'), 2500);
        hitMemo.last = null; hitMemo.ramp = {}; hitMemo.seen = {}; hitMemo.at = {};
        setTimeout(() => synergyIntro(run), 500);
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
        try { hitAbility(ev); } catch (e) { /* nur Anzeige */ }
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
      } else if (ev.k === 'cmd') {
        // Duell-Kommando (Stammcrew): kurzes Banner, Wirkung an den Figuren
        const en = GL.i18n && GL.i18n.lang() === 'en';
        const T = {
          cheer: ['📣', en ? 'Cheer!' : 'Anfeuern!', en ? 'Everyone hits a bit harder. For a moment.' : 'Alle hauen etwas fester zu. Für einen Moment.'],
          food: ['🍖', en ? 'Provisions!' : 'Proviant!', en ? 'Food helps. It usually does.' : 'Essen hilft. Meistens.'],
          salvo: ['🎲', en ? 'Lucky shot!' : 'Glückswurf: Volltreffer!', en ? 'Nobody aimed. Everybody hit.' : 'Keiner hat gezielt. Alle haben getroffen.'],
          trip: ['🎲', en ? 'Lucky roll: they trip!' : 'Glückswurf: Stolperfalle!', en ? 'Their strongest trips over a rope. Classic.' : 'Ihr Stärkster stolpert über ein Tau. Klassiker.'],
          flop: ['🎲', en ? 'Lucky roll: nothing.' : 'Glückswurf: nichts.', en ? 'The die rolls overboard. Brave little die.' : 'Der Würfel ist über Bord gerollt. Tapferer kleiner Würfel.']
        }[ev.cmd === 'dice' ? ev.res : ev.cmd] || ['✦', '', ''];
        banner('team dx-ban', `<small>${en ? 'Command' : 'Kommando'}</small><b>${T[0]} ${T[1]}</b><em>${T[2]}</em>`, 1300);
        if (ev.cmd === 'cheer') (ev.list || []).forEach(i => { pulse(fu('crew', i), 'healed'); fieldFloat('crew', i, '⚔ +', 'buff'); });
        if (ev.cmd === 'dice' && ev.res === 'trip' && ev.to != null) { pulse(fu('enemy', ev.to), 'hurt'); fieldFloat('enemy', ev.to, en ? 'trips' : 'stolpert', 'debuff'); }
        if (ev.cmd === 'dice' && ev.res === 'salvo') pulse(root, 'shake');
        if (GL.sfx) GL.sfx.play(ev.res === 'flop' ? 'miss' : 'level');
      } else if (ev.k === 'ult') {
        ultFx(ev);
        if (GL.arenaFx) try { GL.arenaFx.ult(ev); } catch (e) { /* nur Deko */ }
      } else if (ev.k === 'teamCharge') {
        if (ev.side === 'crew') teamBarSet(ev.n, ev.n >= ev.need);
      } else if (ev.k === 'team') {
        const F = GL.data.factions[ev.faction] || {};
        banner('team' + (ev.side === 'crew' ? '' : ' them'), `<small>Team-Fähigkeit · ${String(F.name || '').replace(/[<>&"]/g, '')}</small><b>${String(ev.name).replace(/[<>&"]/g, '')}</b><em>${String(ev.text || '').replace(/[<>&"]/g, '')}</em>`, 2000);
        const field = $('#field'); if (field) { pulse(field, 'finale'); fx('fx-flash', { x: 0, y: 0 }, 450); }
        pulse(el(ev.side, ev.from), 'lunge');
        if (GL.sfx) GL.sfx.play('level');
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
        if (GL.arenaFx && ev.list.length >= 2) try { GL.arenaFx.aoe(ev.side, ev.list.map(x => x.to), ev.by); } catch (e) { /* nur Deko */ }
      } else if (ev.k === 'heal') {
        if (GL.data.abilities[ev.by] && !ev.ult) callout(ev.by, ev.side);
        ev.list.forEach(x => {
          pulse(el(ev.side, x.to), 'healed'); float(ev.side, x.to, '+' + x.amount, 'heal'); setHp(ev.side, x.to, x.hp);
          fx('fx-heal', center(fu(ev.side, x.to)), 900); fieldFloat(ev.side, x.to, '+' + x.amount, 'heal');
          if (ev.side === 'crew' && !document.body.classList.contains('fast')) { const c = center(fu(ev.side, x.to)); if (c) fx('kfx-plus', { x: c.x, y: c.y - 6 }, 900); }
          // Lazarett: grüne Pixel steigen auf, damit man die Rundenheilung wirklich sieht
          if (ev.side === 'crew' && ev.by === 'helfer' && sigKey() === 'helfer' && !document.body.classList.contains('fast')) { const c = center(fu(ev.side, x.to)); if (c) fx('sig-sparkle', c, 950); }
        });
      } else if (ev.k === 'revive') {
        if (GL.data.abilities[ev.by]) callout(ev.by, ev.side);
        // Vivre Card: die ganze Crew war besiegt. Erst kurz Stille, dann steht alle auf, gut sichtbar mit Grund
        if (ev.by === 'vivre') {
          const field = $('#field');
          if (field) { pulse(field, 'finale'); fx('fx-flash', { x: 0, y: 0 }, 500); }
          const x0 = ev.list[0], e0 = x0 ? el('crew', x0.to) : null, mx = e0 ? Number(e0.dataset.max) : 0;
          const pct = x0 && mx ? Math.round(100 * x0.hp / mx) : 30;
          banner('us will vivre', `<small>Schatz: Vivre Card</small><b>Die Crew steht wieder auf!</b><em>Einmal pro Run, alle mit ${pct} % Leben</em>`, 2400);
        }
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
          if (ST_FX[x.key]) pxFx(ST_FX[x.key], center(fu(ev.side, x.to)), 'st', 1000, 100);
          fieldFloat(ev.side, x.to, d.name + '!', d.good ? 'buff' : 'debuff');
          float(ev.side, x.to, d.name + '!', 'tag ' + (d.good ? 'buff' : 'debuff'));
        });
      } else if (ev.k === 'wave') {
        // Nachschub läuft ein: Welle 2 wird sichtbar, kurzes Schild oben
        (ev.list || []).forEach((x, n) => {
          waveIn.add(x.to);
          [fu('enemy', x.to), el('enemy', x.to)].forEach(node => { if (node) { node.classList.remove('w2-wait'); node.classList.add('w2-in'); node.style.setProperty('--wd', (n * 0.12).toFixed(2) + 's'); } });
        });
        const elite = (ev.list || []).some(x => curRun && curRun.battle && curRun.battle.enemies[x.to] && curRun.battle.enemies[x.to].elite2);
        banner('them wave', `<small>Nachschub</small><b>Welle ${ev.n}!</b><em>${elite ? 'mit Anführer' : (ev.list || []).length + ' neue Gegner'}</em>`, 1500);
        const rb = $('#f-round'); if (rb) { rb.dataset.wave = 'Welle ' + ev.n; }
        if (GL.sfx && GL.sfx.sting) GL.sfx.sting('dramatic');
      } else if (ev.k === 'windup') {
        // Boss holt aus: lehnt sich zurück, kleines Warnzeichen, nächste Runde kommt der schwere Schlag
        const b = fu('enemy', ev.to); if (b) { b.classList.add('windup'); b.dataset.wr = String(window.__glRound || 0); }
        tagAt('enemy', ev.to, 'holt aus …', 'debuff', 64);
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
        // Ausholen erlischt spätestens nach einer vollen Runde (falls der Schlag ausfiel, z. B. betäubt)
        window.__glRound = ev.n;
        document.querySelectorAll('.fu.windup').forEach(b => { if (ev.n - Number(b.dataset.wr || 0) >= 2) b.classList.remove('windup'); });
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
