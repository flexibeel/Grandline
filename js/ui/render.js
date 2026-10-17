// Zeichnet den aktuellen Zustand auf die Seite.
// Buttons tragen data-act="..." und werden in js/main.js ausgewertet.
window.GL = window.GL || {};

(function () {
  const byId = (list, id) => list.find(x => x.id === id);
  const crewData = id => byId(GL.data.crew, id);
  const enemyData = id => byId(GL.data.grunts, id) || byId(GL.data.bosses, id) || byId(GL.data.raids, id) || byId(GL.data.hunted || [], id);
  const anyData = id => crewData(id) || enemyData(id);
  const ability = id => GL.data.abilities[id];
  const trait = id => byId(GL.data.traits, id);
  const $ = sel => document.querySelector(sel);
  const pct = v => Math.round(v * 100) + ' %';

  // ---------- kleine Bausteine ----------

  function badge(type) {
    const t = GL.data.types[type];
    return t ? `<em class="type t-${type}">${t.name}</em>` : '';
  }

  function tags(d) {
    const parts = [];
    if (d.role && GL.data.roles[d.role]) parts.push(GL.data.roles[d.role].name);
    if (d.faction && GL.data.factions[d.faction]) parts.push(GL.data.factions[d.faction].name);
    return parts.join(', ');
  }

  function stars(n) {
    return `<span class="stars s${n}" aria-label="${n} von 3 Sternen">${'★'.repeat(n)}<i>${'★'.repeat(3 - n)}</i></span>`;
  }

  function traitChip(id) {
    const t = trait(id);
    return t ? `<span class="trait" title="${t.text}">${t.name}</span>` : '';
  }

  function rarityPill(r, awakened) {
    if (awakened) return '<em class="rar rar-awakened">Erwacht</em>';
    if (r < 0) return '';
    const R = GL.config.rarities[r];
    return `<em class="rar rar-${R.id}">${R.name}</em>`;
  }

  function typeChart() {
    const T = GL.data.types;
    return Object.keys(T).map(k => `${T[k].name} schlägt ${T[T[k].strong].name}`).join(', ') + '.';
  }

  // kleine Tasten-Beschriftung (auf Touch-Geräten ausgeblendet)
  function keyHint(k) {
    return `<kbd class="key inline">${k}</kbd>`;
  }

  // Fläche oder Einzelziel? Kleines Schild an der Fähigkeit
  const AOE = ['burn', 'chain', 'slow', 'rally', 'oasis'];
  const SINGLE = ['sniper', 'execute', 'curse', 'medic'];
  function abilityTag(a) {
    if (!a) return '';
    const tags = [];
    if (AOE.includes(a.kind) || (a.status && ['all', 'allies'].includes(a.status.target))) tags.push('<em class="ab-tag aoe">Fläche</em>');
    else if (SINGLE.includes(a.kind) || (a.status && ['target', 'front'].includes(a.status.target))) tags.push('<em class="ab-tag single">Einzelziel</em>');
    if (a.status) { const s = GL.data.statuses[a.status.key]; tags.push(`<em class="ab-tag st ${s.good ? 'good' : ''}">${s.name}</em>`); }
    return tags.join('');
  }
  function abilityLine(id) {
    const a = ability(id);
    return a ? `<span class="abil"><b>${a.name}:</b> ${abilityTag(a)} ${a.text}</span>` : '';
  }

  function xpBar(u) {
    const need = GL.run.xpNeed(u.lvl);
    return `<div class="xpbar" title="${u.xp} von ${need} Erfahrung"><i style="width:${Math.min(100, 100 * u.xp / need)}%"></i></div>`;
  }

  // Karte eines Crewmitglieds. Klick öffnet den Steckbrief.
  function crewCard(u, i, hp) {
    const d = crewData(u.id);
    const dead = hp <= 0;
    return `<div class="u member${dead ? ' dead' : ''}" role="button" tabindex="0" data-act="sheet" data-i="${i}" aria-label="Steckbrief von ${d.name}">
      <b class="av">${GL.sprites.render(d)}</b>
      <span class="u-name">${d.name} <em class="lv">Lv ${u.lvl}</em></span>
      <small>${stars(u.stars)} ${traitChip(u.trait)}</small>
      <small>${badge(u.type)} ATK ${u.atk} TMP ${u.spd}</small>
      <small class="tags">${tags(d)}</small>
      <div class="bar"><i style="width:${Math.max(0, 100 * hp / u.max)}%"></i></div>
      <small>Leben ${hp} von ${u.max}</small>
      ${xpBar(u)}
      ${u.points > 0 ? `<span class="points-badge" title="Statuspunkte offen">+${u.points}</span>` : ''}
    </div>`;
  }

  // Kompakte Porträts für die Crew-Leiste
  function miniCard(u, i) {
    const d = crewData(u.id);
    return `<div class="crewmini${u.hp <= 0 ? ' dead' : ''}${u.points > 0 ? ' has-points' : ''}" role="button" tabindex="0" data-act="sheet" data-i="${i}"
        title="${d.name}: Level ${u.lvl}, ${u.hp}/${u.max} Leben${u.points > 0 ? `, ${u.points} Statuspunkte offen` : ''}">
      <i>${GL.sprites.render(d)}</i>
      <em class="lvtag">Lv ${u.lvl}</em>

      <div class="bar"><i style="width:${Math.max(0, 100 * u.hp / u.max)}%"></i></div>
      ${u.points > 0 ? `<span class="skill-tab">+${u.points} Skillen</span>` : ''}
    </div>`;
  }

  function synergyChips(run) {
    return GL.effects.status(run.crew).filter(s => s.active).map(s =>
      `<span class="chip${s.kind === 'faction' ? ' set' : ''}" title="${s.active.text}">${s.name} ${s.count}</span>`).join('');
  }

  function enemyCard(entry, u, hp) {
    return `<div class="u${hp <= 0 ? ' dead' : ''}${u.boss ? ' is-boss' : ''}">
      <b class="av">${GL.sprites.render(entry)}</b>
      <span>${entry.name}</span>
      <small>${badge(u.type)} ATK ${u.atk} TMP ${u.spd}</small>
      <div class="bar"><i style="width:${Math.max(0, 100 * hp / u.max)}%"></i></div>
      <small>Leben ${hp} von ${u.max}</small>
    </div>`;
  }

  function button(act, index, title, text, cls, sprite, tip) {
    const isTip = tip && tip.index === index;
    return `<button class="opt${cls ? ' ' + cls : ''}${sprite ? ' with-sprite' : ''}${isTip ? ' is-tip' : ''}" data-act="${act}" data-i="${index}">
      ${index < 9 ? `<kbd class="key">${index + 1}</kbd>` : ''}${isTip ? '<span class="tip-badge">Tipp</span>' : ''}
      ${sprite ? `<i class="opt-sprite">${sprite}</i>` : ''}
      <span class="opt-body"><b>${title}</b><span>${text}</span></span></button>`;
  }

  // Welche Synergie-Stufen würde diese Figur zusätzlich freischalten?
  function unlockPreview(run, d) {
    const before = GL.effects.status(run.crew);
    const after = GL.effects.status(run.crew.concat([{ id: d.id, type: d.type, role: d.role, faction: d.faction }]));
    const gains = after.filter((s, i) => s.active && s.active !== before[i].active)
      .map(s => `${s.kind === 'faction' ? 'Set-Bonus ' : ''}${s.name} ${s.count}: ${s.active.text}`);
    return gains.length ? `<span class="gain">Schaltet frei: ${gains.join('; ')}</span>` : '';
  }

  // ---------- Karten im Sammelkarten-Stil ----------
  // Figurenkarte: Bild, Name, Fähigkeit, Angriff unten links, Leben unten rechts
  function crewCardFace(d, m, opts) {
    const o = opts || {};
    const a = ability(d.id);
    const t = o.trait ? trait(o.trait) : null;
    return `<span class="card-face frame-s${o.stars || 2}${o.gold ? ' frame-gold' : ''}">
      ${o.lvl ? `<span class="gem gem-lv" title="Level">${o.lvl}</span>` : ''}
      ${o.stars ? `<span class="card-stars">${stars(o.stars)}</span>` : ''}
      <span class="gem gem-spd" title="Tempo"><b>${m.spd}</b></span>
      <span class="card-art art-${d.type}">${GL.sprites.render(d)}</span>
      <span class="card-name">${d.name}</span>
      <span class="card-type">${badge(d.type)} ${tags(d)}</span>
      <span class="card-text">
        ${a ? `<b>${a.name}:</b> ${a.text}` : ''}
        ${t ? `<span class="card-trait"><b>${t.name}:</b> ${t.text}</span>` : ''}
        ${o.extra || ''}
      </span>
      <span class="gem gem-atk" title="Angriff">${m.atk}</span>
      <span class="gem gem-hp" title="Leben">${m.max}</span>
    </span>`;
  }

  // Beutekarte (Schatz oder Frucht)
  function lootCardFace(item, kind) {
    const rid = item.awakened ? 'awakened' : item.rarity >= 0 ? GL.config.rarities[item.rarity].id : 'unique';
    const label = item.awakened ? 'Erwacht' : item.rarity >= 0 ? GL.loot.rarityName(item.rarity) : 'Einzigartig';
    return `<span class="card-face loot-face frame-${rid}">
      <span class="card-rarity rar rar-${rid}">${label}</span>
      <span class="card-art art-loot">${GL.sprites.icon(kind, item.id, item.awakened)}</span>
      <span class="card-name">${item.name}</span>
      <span class="card-type">${kind === 'fruit' ? 'Teufelsfrucht' : 'Schatz'}</span>
      <span class="card-text">${item.text}</span>
    </span>`;
  }

  function cardButton(i, face, cls, tip) {
    const isTip = tip && tip.index === i;
    return `<button class="opt card${cls ? ' ' + cls : ''}${isTip ? ' is-tip' : ''}" data-act="pick" data-i="${i}">
      ${i < 9 ? `<kbd class="key">${i + 1}</kbd>` : ''}${isTip ? '<span class="tip-badge">Tipp</span>' : ''}${face}</button>`;
  }

  // Kurze Begründung unter einer Auswahl, falls es einen Tipp gibt
  function tipLine(tip) {
    return tip ? `<p class="tip-line"><span class="tip-badge">Tipp</span>${tip.why}</p>` : '';
  }

  // Angebot (Kapitän oder Rekrut) mit ausgewürfelten Werten
  function offerButton(run, offer, i, extraCls, withPreview, tip) {
    const d = crewData(offer.id);
    const m = GL.run.previewMember(run, offer);
    return cardButton(i, crewCardFace(d, m, {
      lvl: m.lvl, stars: offer.stars, trait: offer.trait, gold: d.locked,
      extra: withPreview ? unlockPreview(run, d) : ''
    }), extraCls, tip);
  }

  // ---------- Kopfzeile ----------

  function header(run) {
    const total = GL.run.totalSteps();
    const per = GL.config.stepsPerIsland;
    const bars = Array.from({ length: total }, (_, i) =>
      `<i class="${i < run.step ? 'done' : i === run.step ? 'now' : ''}${i % per === per - 1 ? ' boss' : ''}"></i>`).join('');
    const island = GL.run.island(run).name;
    const pos = Math.min(run.step % per + 1, per);
    return `${bars}<span>${island} · <b class="stop-name">${GL.run.stopName(run)}</b> <small class="muted">(${pos}/${per})</small> <em class="gold-chip">${GL.sprites.coin()} ${run.gold || 0}</em> <em class="bounty-chip" id="bounty-chip">Kopfgeld ${fmtBounty(run.bountyM || 0)}</em>${run.heat ? ` <em class="heat-chip">Stufe ${run.heat}</em>` : ''}${run.duel ? ` <em class="duel-chip">⚔ Duell ${run.duel}</em>` : ''}</span>`;
  }

  // ---------- Synergien und Schätze unter der Crew ----------

  function synergyPanel(run) {
    if (!run.crew.length) return '';
    const present = GL.effects.status(run.crew).filter(s => s.count > 0);
    const pending = present.filter(s => !s.active).sort((a, b) => b.count / b.next.n - a.count / a.next.n);
    const pendingHtml = pending.length
      ? `<div class="syn-pending">Auf dem Weg: ${pending.map(s =>
          `<span title="Ab ${s.next.n}: ${s.next.text}">${s.name} ${s.count}/${s.next.n}</span>`).join(', ')}</div>`
      : '';
    const rows = present.filter(s => s.active)
      .sort((a, b) => (b.kind === 'faction') - (a.kind === 'faction') || b.count - a.count)
      .map(s => {
        const pips = s.tiers.map(t => `<i class="${s.count >= t.n ? 'on' : ''}">${t.n}</i>`).join('');
        const text = s.active.text + (s.next ? `<span class="muted"> Ab ${s.next.n}: ${s.next.text}</span>` : '');
        const isSet = s.kind === 'faction';
        return `<div class="syn-row on${isSet ? ' set' : ''}">
          <b class="syn-name">${s.kind === 'type' ? badge(s.key) : s.name}${isSet ? '<small>Set-Bonus</small>' : ''}</b>
          <span class="syn-count">${s.count}</span>
          <span class="pips">${pips}</span>
          <span class="syn-text">${text}</span></div>`;
      }).join('');

    const relics = GL.effects.relicList(run);
    const relicHtml = relics.length
      ? `<div class="relics">${relics.map(r =>
          `<span class="relic rr-${r.rarity >= 0 ? GL.config.rarities[r.rarity].id : 'unique'}" title="${r.text}">${GL.sprites.icon('relic', r.id)}${r.name}</span>`).join('')}</div>`
      : '';

    const details = relics.length ? `<details class="info"><summary>Schätze anzeigen</summary>
      <ul>${relics.map(r => `<li>${rarityPill(r.rarity)} <b>${r.name}:</b> ${r.text}</li>`).join('')}</ul></details>` : '';

    return `<div class="syn">${rows}</div>${pendingHtml}${relicHtml}${details}`;
  }

  // ---------- Konter und Spezialangriff ----------
  // Zeigt, womit man einen Boss-Zustand kontern kann und ob die Crew das gerade hat
  function counterHint(run, key) {
    const helfer = run.crew.filter(u => u.hp > 0 && u.role === 'helfer').length;
    const brecher = run.crew.filter(u => u.hp > 0 && u.role === 'brecher').length;
    const brook = run.crew.some(u => u.hp > 0 && u.id === 'brook');
    const parts = [];
    if (key === 'fear') {
      parts.push(`Helfer reinigen am Rundenende (${helfer ? `<b class="ok">${helfer} dabei</b>` : '<b class="no">keiner dabei</b>'})`);
      parts.push(`Brecher sind immun (${brecher ? `<b class="ok">${brecher} dabei</b>` : '<b class="no">keiner dabei</b>'})`);
    } else if (key === 'stun') {
      parts.push(`Helfer reinigen (${helfer ? `<b class="ok">${helfer} dabei</b>` : '<b class="no">keiner dabei</b>'})`);
      parts.push('einen robusten Brecher nach vorne stellen');
    } else {
      parts.push(`Helfer reinigen (${helfer ? `<b class="ok">${helfer} dabei</b>` : '<b class="no">keiner dabei</b>'})`);
      parts.push('Heilung über Runden hilft');
    }
    if (brook && (key === 'fear' || key === 'stun')) parts.push('<b class="ok">Brook macht Mut</b>');
    if (['fear', 'stun'].includes(key)) parts.push('der Spezialangriff gibt Mut');
    return `<p class="hint counter"><span class="ab-tag st">Konter</span> ${parts.join(', ')}.</p>`;
  }

  function chargePips(run) {
    const max = GL.config.specialMax, c = Math.min(max, run.charge || 0);
    return `<span class="charge${c >= max ? ' full' : ''}" title="Spezialangriff: ${c} von ${max} geladen. Siege laden auf, Kopfgeldjäger doppelt.">${'<i class="on"></i>'.repeat(c)}${'<i></i>'.repeat(max - c)}</span>`;
  }

  function specialPanel(run) {
    if (!['boss', 'raid'].includes(run.pending.kind)) return '';
    const max = GL.config.specialMax, c = run.charge || 0;
    const cap = crewData(run.captain || run.crew[0].id);
    const name = (GL.data.specials && GL.data.specials[cap.id]) || 'Crew-Großangriff';
    if (c < max) {
      return `<div class="special-box"><span class="sp-name">Spezialangriff ${chargePips(run)}</span>
        <span class="muted">Noch nicht geladen. Siege laden ihn auf (${c} von ${max}).</span></div>`;
    }
    const on = !!run.pending.special;
    return `<div class="special-box ready${on ? ' on' : ''}">
      <span class="sp-name">${GL.sprites.render(cap)} <b>${name}</b> ${chargePips(run)}</span>
      <span class="muted">Zu Kampfbeginn: Boss verliert ${Math.round(GL.config.specialBossCut * 100)} %, Begleiter ${Math.round(GL.config.specialEscortCut * 100)} % Leben. Die Crew wird von allen Zuständen befreit und hat 2 Runden Mut.</span>
      <button class="btn${on ? '' : ' ghost'} sp-btn" data-act="special">${on ? '✦ Wird eingesetzt' : '✦ Spezialangriff einsetzen'} ${keyHint('Q')}</button>
    </div>`;
  }

  // ---------- Kopfgeld ----------
  // Inselbosse und Kopfgeld-Ziele erhöhen das Kopfgeld des Kapitäns (Berechnung in run.js, finishBattle).
  function fmtBounty(m) {
    if (!m) return '0 ฿';
    return m >= 1000 ? (m / 1000).toFixed(1).replace('.', ',') + ' Mrd. ฿' : m + ' Mio. ฿';
  }

  // Steckbrief fliegt in 3D ins Bild, zählt das neue Kopfgeld hoch und fliegt dann zur Anzeige oben
  function bountyPoster(run) {
    const old = document.getElementById('bounty-pop');
    if (old) old.remove();
    const cap = crewData(run.captain || run.crew[0].id);
    const last = run.lastBounty || { gain: 0 };
    const to = run.bountyM || 0, from = to - last.gain;
    const src = last.id ? enemyData(last.id) : null;
    const el = document.createElement('div');
    el.id = 'bounty-pop';
    el.className = 'bounty-pop';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="bp-poster">
        <span class="bp-wanted">GESUCHT</span>
        <span class="bp-sub">Tot oder lebendig</span>
        <span class="bp-art">${GL.sprites.render(cap)}</span>
        <span class="bp-name">${cap.name}</span>
        <span class="bp-amount"><b>${from}</b> Mio. ฿</span>
        <span class="bp-up">+${to - from} Mio.</span>
        ${src ? `<span class="bp-src">für ${src.name}</span>` : ''}
        <span class="bp-shine"></span>
      </div>`;
    document.body.appendChild(el);
    const num = el.querySelector('.bp-amount b');
    const t0 = performance.now() + 700, dur = 900;
    const tick = now => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      num.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1 && el.isConnected) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const close = () => {
      if (!el.isConnected || el.classList.contains('fly')) return;
      const chip = document.getElementById('bounty-chip');
      const p = el.querySelector('.bp-poster');
      if (chip) {
        const a = p.getBoundingClientRect(), b = chip.getBoundingClientRect();
        p.style.setProperty('--fx', (b.left + b.width / 2 - (a.left + a.width / 2)) + 'px');
        p.style.setProperty('--fy', (b.top + b.height / 2 - (a.top + a.height / 2)) + 'px');
      }
      el.classList.add('fly');
      setTimeout(() => { el.remove(); if (chip) { chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); } }, 650);
    };
    el.addEventListener('click', close);
    setTimeout(close, 3200);
  }

  // ---------- Seekarte (wie bei Pokelike) ----------
  // Reihen von unten (Start) nach oben (Inselboss). Erreichbare Orte sind Knöpfe,
  // besuchte Orte sind golden verbunden, das Schiff zeigt, wo die Crew gerade ist.
  function seaChart(run, boss, tip) {
    const ch = run.chart;
    if (!ch) return '';
    const N = GL.data.nodes;
    const rows = ch.rows;
    const pos = run.step % GL.config.stepsPerIsland;
    const ROW = 108, TOP = 58, BOTTOM = 104;
    const H = TOP + (rows.length - 1) * ROW + BOTTOM;
    // kleine, feste Verschiebung pro Ort, damit die Karte nicht wie ein Raster aussieht
    const jit = (r, i) => { const h = Math.sin((run.seed % 997) * 12.9898 + r * 78.233 + i * 37.719) * 43758.5453; return (h - Math.floor(h) - 0.5) * 7; };
    const X = (r, i) => (rows[r].length === 1 ? 58 : 20 + (i + 1) / (rows[r].length + 1) * 78 + jit(r, i));   // links Platz für die Inselnamen
    const Y = r => TOP + (rows.length - 1 - r) * ROW;
    const startX = 58, startY = H - 26;
    const reach = new Map();
    run.optCols.forEach((c, k) => reach.set(c, k));
    const onPath = (r, i) => r < pos && ch.path[r] === i;

    // Wege
    let lines = '';
    const line = (x1, y1, x2, y2, cls) => { lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`; };
    rows[0].forEach((_, i) => line(startX, startY, X(0, i), Y(0), pos === 0 ? 'can' : onPath(0, i) ? 'done' : 'off'));
    rows.forEach((row, r) => row.forEach((n, i) => n.next.forEach(j => {
      let cls = 'off';
      if (onPath(r, i) && onPath(r + 1, j)) cls = 'done';
      else if (r === pos - 1 && ch.at === i && reach.has(j)) cls = 'can';
      else if (r >= pos) cls = 'future';
      line(X(r, i), Y(r), X(r + 1, j), Y(r + 1), cls);
    })));

    // Orte
    let nodes = '';
    rows.forEach((row, r) => row.forEach((n, i) => {
      const style = `left:${X(r, i)}%;top:${Y(r)}px`;
      const isBoss = n.t === 'boss';
      const hunted = n.t === 'elite' && n.who ? enemyData(n.who) : null;
      const icon = isBoss ? GL.sprites.render(boss) : hunted ? GL.sprites.render(hunted) : GL.sprites.icon('node', n.t);
      const title = isBoss ? `${N.boss.title}: ${boss.name}` : hunted ? `Kopfgeld-Ziel: ${hunted.name} (${hunted.bounty} Mio. ฿)` : N[n.t].title;
      if (r === pos && reach.has(i)) {
        const k = reach.get(i);
        const isTip = tip && tip.index === k;
        nodes += `<button class="map-node can n-${n.t}${isBoss ? ' boss' : ''}${hunted ? ' hunted' : ''}${isTip ? ' is-tip' : ''}" data-act="node" data-i="${k}" style="${style}"
            title="${title}: ${isBoss ? bossInfo(boss).text : hunted ? (ability(hunted.id) ? ability(hunted.id).name + ': ' + ability(hunted.id).text : '') : N[n.t].text}">
          <span class="mn-icon">${icon}</span>${k < 9 ? `<kbd class="key">${k + 1}</kbd>` : ''}${isTip ? '<span class="tip-badge">Tipp</span>' : ''}
          <span class="mn-label"><b>${isBoss ? boss.name : hunted ? hunted.name : title}</b>${hunted ? `<em class="mn-bounty">${hunted.bounty} Mio. ฿</em>` : ''}${dangerTag(run, n.t)}</span>
        </button>`;
      } else {
        const state = onPath(r, i) ? 'done' : r < pos ? 'gone' : 'future';
        nodes += `<span class="map-node ${state} n-${n.t}${isBoss ? ' boss' : ''}${hunted ? ' hunted' : ''}" style="${style}" title="${title}">
          <span class="mn-icon">${icon}</span>${isBoss ? `<span class="mn-label"><b>${boss.name}</b></span>` : ''}</span>`;
      }
    }));
    const shipX = pos === 0 ? startX : X(pos - 1, ch.at);
    const shipY = pos === 0 ? startY : Y(pos - 1);
    const labels = rows.map((row, r) => {
      const name = GL.run.stopName(run, r);
      const state = r < pos ? 'done' : r === pos ? 'now' : '';
      return `<span class="sc-stop ${state}" style="top:${Y(r)}px">${name}</span>`;
    }).join('');
    return `<div class="sea-chart isl-${GL.run.island(run).id}" style="height:${H}px">
      ${labels}
      <svg class="sc-lines" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
      <span class="sc-start" style="left:${startX}%;top:${startY}px">Start</span>
      ${nodes}
      <span class="sc-ship" style="left:${shipX}%;top:${shipY}px" aria-hidden="true">${GL.sprites.ship()}</span>
    </div>`;
  }

  // ---------- Buff-Leiste links (wie bei TFT) ----------
  // Zeigt alle Synergien, die die Crew gerade hat: aktive oben, angefangene darunter.
  function traitRail(run) {
    const list = GL.effects.status(run.crew).filter(s => s.count > 0);
    if (!list.length) return '';
    const tierIdx = s => s.active ? s.tiers.indexOf(s.active) : -1;
    list.sort((a, b) => (!!b.active - !!a.active) || (tierIdx(b) - tierIdx(a)) ||
      ((b.kind === 'faction') - (a.kind === 'faction')) || (b.count - a.count));
    const level = s => {
      if (!s.active) return 'off';
      const k = tierIdx(s);
      if (k === s.tiers.length - 1) return 'gold';
      return k >= 1 ? 'silver' : 'bronze';
    };
    const row = s => {
      const lv = level(s);
      const steps = s.tiers.map(t => `<i class="${s.count >= t.n ? 'on' : ''}">${t.n}</i>`).join('<b>›</b>');
      const tip = s.tiers.map(t => `${s.count >= t.n ? '✓' : '·'} ${t.n}: ${t.text}`).join('\n');
      const icon = `<span class="tr-hex">${s.name.slice(0, 2)}</span>`;
      return `<div class="tr tr-${lv}${s.kind === 'faction' ? ' tr-set' : ''}" title="${s.name}${s.kind === 'faction' ? ' (Set-Bonus)' : ''}\n${tip}">
        <span class="tr-icon">${icon}</span>
        <span class="tr-body"><b>${s.kind === 'type' ? `<i class="tr-dot t-${s.key}"></i>` : ''}${s.name}</b><span class="tr-steps">${steps}</span></span>
        <span class="tr-count">${s.count}${s.next ? `<small>/${s.next.n}</small>` : ''}</span>
      </div>`;
    };
    const active = list.filter(s => s.active), rest = list.filter(s => !s.active);
    return `<div class="tr-head">Aktive Boni</div>${active.map(row).join('') || '<p class="tr-empty">Noch keine</p>'}
      ${rest.length ? `<div class="tr-head sub">Fast geschafft</div>${rest.map(row).join('')}` : ''}`;
  }

  // ---------- Kampftexte ----------

  function targetName(run, side, to) {
    const u = side === 'crew' ? run.crew[to] : run.battle.enemies[to];
    return u ? anyData(u.id).name : '';
  }

  const SPECIAL = {
    kanone: 'Die Schiffskanone',
    seestein: 'Das Seestein-Netz',
    vivre: 'Die Vivre Card',
    helfer: 'Die Helfer',
    bleed: 'Wunden, Gift und Feuer',
    special: 'Der Spezialangriff'
  };

  function battleText(run, ev) {
    if (ev.k === 'note') return ev.text;
    if (ev.k === 'round') return '';
    if (ev.k === 'special') return `Spezialangriff: ${ev.name}!`;
    if (ev.k === 'skip') return `${targetName(run, ev.side, ev.to)} ist betäubt und setzt aus.`;
    if (ev.k === 'immune') return `${targetName(run, ev.side, ev.to)} lässt sich nicht beeindrucken (${GL.data.statuses[ev.key].name} abgewehrt).`;
    if (ev.k === 'cleanse') return `${anyData(ev.by) ? anyData(ev.by).name : 'Ein Helfer'} befreit ${targetName(run, ev.side, ev.to)} von ${GL.data.statuses[ev.key].name}.`;
    if (ev.k === 'status') {
      if (!ev.list.length) return '';
      const s = GL.data.statuses[ev.list[0].key];
      const names = ev.list.map(x => targetName(run, ev.side, x.to));
      const who = names.length > 2 ? (ev.side === 'crew' ? 'die ganze Crew' : 'alle Gegner') : names.join(' und ');
      const src = ev.by === 'special' ? 'Der Spezialangriff' : (anyData(ev.by) ? anyData(ev.by).name : '');
      return `${src}: ${who} ${names.length > 1 ? 'haben' : 'hat'} ${s.name} (${ev.list[0].rounds} ${ev.list[0].rounds === 1 ? 'Runde' : 'Runden'}).`;
    }

    if (ev.k === 'hit') {
      const attacker = ev.side === 'crew'
        ? crewData(run.crew[ev.from].id).name
        : enemyData(run.battle.enemies[ev.from].id).name;
      const target = targetName(run, ev.side === 'crew' ? 'enemy' : 'crew', ev.to);
      if (ev.blocked) return `${attacker} greift ${target} an, aber der Impact Dial wehrt ab.`;
      if (ev.miss) return `${target} weicht ${attacker} aus.`;
      const eff = ev.eff === 'strong' ? ' Sehr effektiv!' : ev.eff === 'weak' ? ' Wenig effektiv.' : '';
      return `${attacker} trifft ${target} für ${ev.dmg}${ev.crit ? ' (kritisch!)' : ''}.${eff}` +
        `${ev.hp <= 0 ? ' ' + target + ' ist besiegt.' : ''}`;
    }

    const actor = SPECIAL[ev.by] || (anyData(ev.by) ? anyData(ev.by).name : '');
    const skill = ability(ev.by) ? ` (${ability(ev.by).name})` : '';
    const names = ev.list.map(x => targetName(run, ev.side, x.to));
    const many = ev.side === 'crew' ? 'die Crew' : (SPECIAL[ev.by] ? 'alle Gegner' : 'die anderen Gegner');
    const who = names.length > 2 ? many : names.join(' und ');

    if (ev.k === 'dmg') {
      const n = ev.list[0].dmg;
      const ko = ev.list.filter(x => x.hp <= 0).map(x => targetName(run, ev.side, x.to));
      return `${actor}${skill} trifft ${who} für ${n}.${ko.length ? ' ' + ko.join(' und ') + (ko.length > 1 ? ' sind' : ' ist') + ' besiegt.' : ''}`;
    }
    if (ev.k === 'heal') {
      const n = Math.max(...ev.list.map(x => x.amount));
      return `${actor}${skill} heilt ${who} um ${n}.`;
    }
    if (ev.k === 'revive') {
      return ev.by === 'vivre'
        ? 'Die Vivre Card bringt die ganze Crew zurück!'
        : `${actor} steht wieder auf${skill}!`;
    }
    return '';
  }

  // Auswertung nach dem Kampf: Schaden pro Figur, Erfahrung, Level-ups
  function battleSummary(run) {
    const b = run.battle;
    const dealt = run.crew.map(() => 0);
    b.events.forEach(ev => {
      if (ev.k === 'hit' && ev.side === 'crew') dealt[ev.from] += ev.dmg;
      if (ev.k === 'dmg' && ev.side === 'enemy') {
        const i = run.crew.findIndex(u => u.id === ev.by);
        if (i >= 0) dealt[i] += ev.list.reduce((s, x) => s + x.dmg, 0);
      }
    });
    const mvp = dealt.indexOf(Math.max(...dealt));
    const rows = run.crew.map((u, i) => {
      const d = crewData(u.id);
      const xp = b.xp && b.xp[i];
      const before = b.before ? b.before[i] : { lvl: u.lvl, xp: u.xp };
      const levels = xp ? xp.to.lvl - before.lvl : 0;
      const fromPct = Math.min(100, 100 * before.xp / GL.run.xpNeed(before.lvl));
      const toPct = Math.min(100, 100 * u.xp / GL.run.xpNeed(u.lvl));
      return `<div class="sum-row${i === mvp && dealt[i] > 0 ? ' mvp' : ''}">
        <i class="sum-sprite">${GL.sprites.render(d)}</i>
        <span class="sum-name"><b>${d.name}</b>${i === mvp && dealt[i] > 0 ? '<em class="mvp-tag">MVP</em>' : ''}<small>${dealt[i]} Schaden</small></span>
        <span class="sum-xp">
          <span class="sum-xp-top"><em class="lv">Lv <span class="lvnum">${before.lvl}</span></em>${xp ? `<small>+${xp.gain} EP</small>` : ''}</span>
          <span class="xpbar big"><i class="xpfill" style="width:${fromPct}%" data-to="${toPct}" data-levels="${levels}" data-newlv="${u.lvl}"></i></span>
        </span>
        <span class="lvup" hidden>Level ${u.lvl}! +${levels * GL.config.levelUp.points} Statuspunkte
          <button class="btn mini" data-act="sheet" data-i="${i}">Punkte verteilen</button></span>
      </div>`;
    }).join('');
    return `<div class="summary">${rows}</div>`;
  }

  function bossInfo(boss) {
    const T = GL.data.types;
    const counter = Object.keys(T).find(k => T[k].strong === boss.type);
    return { counter, text: `${boss.name} kämpft mit ${T[boss.type].name}, schwach gegen ${T[counter].name}. ${ability(boss.id) ? ability(boss.id).name + ': ' + ability(boss.id).text : ''}` };
  }

  const DANGER = [
    { max: 0.6, cls: 'low', name: 'Gefahr gering' },
    { max: 2,   cls: 'mid', name: 'Gefahr mittel' },
    { max: 1e9, cls: 'high', name: 'Gefahr hoch' }
  ];

  function dangerTag(run, kind) {
    if (!['battle', 'elite', 'boss', 'raid'].includes(kind)) return '';
    const r = GL.run.estimate(run, kind);
    const i = DANGER.findIndex(d => r < d.max);
    return `<span class="danger d-${DANGER[i].cls}">${'<i></i>'.repeat(i + 1)}${DANGER[i].name}</span>`;
  }

  // ---------- Steckbrief einer Figur ----------

  function sheet(run, i) {
    const u = run.crew[i];
    if (!u) return '';
    const d = crewData(u.id);
    const unit = GL.effects.setup(run, run.crew, []).crew[i];
    const t = trait(u.trait);
    const need = GL.run.xpNeed(u.lvl);
    const canSpend = ['map', 'prep', 'recruit', 'fruit', 'treasure', 'awaken', 'battle', 'event'].includes(run.phase);
    const P = GL.config.point;
    const diff = (eff, base) => eff !== base ? ` <em class="up">${eff > base ? '+' : ''}${eff - base}</em>` : '';
    const stat = (label, value) => `<div class="st"><span>${label}</span><b>${value}</b></div>`;
    const rec = GL.advice.stat(run, i);
    const sb = (key, label) => `<button class="btn${rec && rec.stat === key ? ' rec' : ''}" data-act="spend" data-i="${i}" data-stat="${key}"${canSpend ? '' : ' disabled'}>${rec && rec.stat === key ? '<span class="tip-badge">Tipp</span>' : ''}${label}</button>`;
    const sets = GL.effects.status(run.crew).filter(s => s.active &&
      ((s.kind === 'type' && s.key === u.type) || (s.kind === 'role' && s.key === u.role) || (s.kind === 'faction' && s.key === u.faction)));

    return `<div class="sheet-card">
      <div class="sheet-top">
        <button class="sheet-nav" data-act="sheet" data-i="${(i - 1 + run.crew.length) % run.crew.length}" aria-label="Vorherige Figur">‹</button>
        <div class="poster">
          <span class="poster-label">Steckbrief</span>
          <div class="poster-art">${GL.sprites.render(d)}</div>
          <h3>${d.name}</h3>
          <div>${stars(u.stars)} <em class="lv">Lv ${u.lvl}</em></div>
          <div class="xpbar big"><i style="width:${Math.min(100, 100 * u.xp / need)}%"></i></div>
          <small>${u.xp} / ${need} EP bis Level ${u.lvl + 1}</small>
        </div>
        <button class="sheet-nav" data-act="sheet" data-i="${(i + 1) % run.crew.length}" aria-label="Nächste Figur">›</button>
      </div>
      <div class="sheet-tags">${badge(u.type)} <span>${tags(d)}</span> ${traitChip(u.trait)}</div>
      <p class="sheet-abil">${abilityLine(u.id)}<span class="abil"><b>Eigenschaft ${t.name}:</b> ${t.text}</span></p>

      ${u.points > 0 ? `<div class="spend">
        <b>${u.points} Statuspunkte verteilen</b>
        <div class="spend-btns">
          ${sb('hp', `+${P.hp} Leben`)}
          ${sb('atk', `+${P.atk} Angriff`)}
          ${sb('spd', `+${P.spd} Tempo`)}
        </div>${rec ? `<p class="spend-why">${rec.why}</p>` : ''}</div>` : ''}

      <div class="lbl">Kampfwerte mit allen Boni</div>
      <div class="stats">
        ${stat('Leben', `${u.hp} / ${u.max}`)}
        ${stat('Angriff', unit.atk + diff(unit.atk, u.atk))}
        ${stat('Tempo', unit.spd + diff(unit.spd, u.spd))}
        ${stat('Krit-Chance', pct(unit.crit))}
        ${stat('Krit-Schaden', pct(unit.critMult))}
        ${stat('Rüstung', unit.armor)}
        ${stat('Ausweichen', pct(unit.dodge))}
        ${stat('Schaden', '+' + pct(unit.dmgPct))}
        ${stat('Gegen Bosse', '+' + pct(unit.bossPct))}
        ${stat('Heilung pro Runde', unit.regen)}
      </div>
      ${sets.length ? `<div class="lbl">Aktive Boni für ${d.name}</div><ul class="sheet-sets">${sets.map(s =>
        `<li>${s.kind === 'faction' ? '<em class="set-tag">Set</em>' : ''}<b>${s.name} ${s.count}:</b> ${s.active.text}</li>`).join('')}</ul>` : ''}
      <div class="sheet-foot">
        <button class="btn ghost" data-act="sheet-close">Schließen</button>
        ${u.id !== run.captain && run.crew.length > 1 && ['map', 'prep', 'recruit', 'fruit', 'treasure', 'awaken', 'event'].includes(run.phase)
          ? `<button class="btn ghost danger-btn" data-act="dismiss" data-i="${i}">Entlassen (+${GL.run.sellValue(u)} Gold)</button>` : ''}
      </div>
    </div>`;
  }

  // Hinweis, solange Statuspunkte offen sind
  function pointsBanner(run) {
    if (['battle', 'over', 'win', 'starter'].includes(run.phase)) return '';
    const i = run.crew.findIndex(u => u.points > 0);
    if (i < 0) return '';
    const total = run.crew.reduce((s, u) => s + u.points, 0);
    const who = run.crew.filter(u => u.points > 0).map(u => crewData(u.id).name);
    return `<div class="points-banner">
      <span class="pb-star">✦</span>
      <span><b>${who.length > 1 ? who.slice(0, -1).join(', ') + ' und ' + who.slice(-1) : who[0]}</b>
        ${who.length > 1 ? 'haben' : 'hat'} ${total} Statuspunkte zum Verteilen</span>
      <button class="btn mini" data-act="sheet" data-i="${i}">Jetzt verteilen</button>
    </div>`;
  }

  function noticeBox(run) {
    const n = run.notice;
    if (!n) return '';
    return `<div class="notice"><b>${n.title}</b> <span>${n.text}</span>
      ${n.lines.length ? `<ul>${n.lines.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}</div>`;
  }

  // ---------- Hauptbereich je nach Phase ----------

  function stage(run, anim, ui) {
    return pointsBanner(run) + phaseStage(run, anim, ui);
  }

  function phaseStage(run, anim, ui) {
    const N = GL.data.nodes;
    switch (run.phase) {
      case 'event': {
        const ev = byId(GL.data.events, run.event.id);
        return `<div class="event">
          <span class="event-kicker">Ereignis auf See</span>
          <h2>${ev.title}</h2>
          <p>${ev.text}</p>
          <div class="opts">${ev.choices.map((c, i) => button('pick', i, c.label, c.hint, 'event-opt')).join('')}</div>
        </div>`;
      }

      case 'starter': {
        const offered = run.pool.map(o => o.id);
        const locked = GL.data.unlocks.filter(u => !offered.includes(u.unlock));
        const lockedHtml = locked.length ? `<div class="lbl">Noch gesperrt</div><div class="locked-grid">${locked.map(u => {
          const d = crewData(u.unlock);
          const pr = ui.profile ? GL.meta.progress(ui.profile, u) : { have: 0, need: 1 };
          return `<div class="locked-cap"><i class="opt-sprite silhouette">${GL.sprites.render(d)}</i>
            <span><b>${d.name}</b><small>${u.text}${pr.need > 1 ? ` (${pr.have}/${pr.need})` : ''}</small></span></div>`;
        }).join('')}</div>` : '';
        return `<h2>Wähle deinen Kapitän</h2>
          <p class="hint">Mit ihm oder ihr beginnt deine Reise über die Grand Line. Werte und Eigenschaft sind bei jedem Run neu ausgewürfelt.</p>
          <div class="cards">${run.pool.map((o, i) =>
            offerButton(run, o, i, 'cap' + (crewData(o.id).locked ? ' unlocked-cap' : ''), false)).join('')}</div>${lockedHtml}`;
      }

      case 'map': {
        const boss = GL.run.boss(run);
        const info = bossInfo(boss);
        const preview = run.options[0] === 'boss' ? ''
          : `<div class="lbl">Inselboss: ${boss.name} ${badge(boss.type)} schwach gegen ${badge(info.counter)}</div>`;
        const tip = GL.advice.map(run);
        return `${noticeBox(run)}<h2>Wähle deine Route</h2>${preview}${seaChart(run, boss, tip)}${tipLine(tip)}`;
      }

      case 'recruit': {
        // Taverne: kaufen mit Gold, neu würfeln, Crew entlassen, weitersegeln
        const lim = GL.run.crewLimit(run);
        const full = run.crew.length >= lim;
        const gold = run.gold || 0;
        const tip = GL.advice.recruit(run);
        const cards = run.pool.map((o, i) => {
          const price = GL.run.offerPrice(run, o);
          const can = !o.sold && !full && gold >= price;
          const btn = offerButton(run, o, i, o.sold ? 'sold' : can ? '' : 'cant', true, o.sold ? null : tip);
          return `<div class="shop-slot">${btn.replace('<button ', can ? '<button ' : '<button disabled ')}
            <span class="price${can ? '' : ' no'}">${o.sold ? 'Gekauft' : `${GL.sprites.coin()} ${price}`}</span></div>`;
        }).join('');
        const roll = GL.run.rerollCost(run);
        const sell = run.crew.map((u, i) => {
          const d = crewData(u.id);
          const cap = u.id === run.captain;
          return `<div class="sell-slot">${GL.sprites.render(d)}<b>${d.name}</b>
            ${cap ? '<small>Kapitän</small>' : `<button class="btn mini ghost" data-act="dismiss" data-i="${i}">Entlassen +${GL.run.sellValue(u)}</button>`}</div>`;
        }).join('');
        return `<div class="shop-head"><h2>Taverne</h2>
            <span class="gold">${GL.sprites.coin()} <b>${gold}</b> Gold</span></div>
          <p class="hint">${run.shopFree ? '<b>Der erste Kauf ist gratis.</b> ' : ''}Kaufe so viele Crewmitglieder, wie dein Gold und dein Schiff (${run.crew.length}/${lim}) erlauben. Gold gibt es für Siege, dazu Zinsen auf Erspartes.</p>
          <div class="cards shop">${cards}</div>${tipLine(tip)}
          <div class="shop-actions">
            <button class="btn ghost" data-act="reroll"${gold < roll ? ' disabled' : ''}>Neu würfeln (${roll} Gold) ${keyHint('R')}</button>
            <button class="btn" data-act="leave">Weitersegeln ${keyHint('Leertaste')}</button>
          </div>
          <div class="lbl">Deine Crew${full ? ' <small>Schiff voll: entlasse jemanden für Platz</small>' : ''}</div>
          <div class="sell-row">${sell}</div>`;
      }

      case 'fruit': {
        const items = run.pool.map(it => GL.loot.fruit(it));
        const tip = GL.advice.loot(run, items, 'fruit');
        return `<h2>Welche Frucht isst du?</h2>
          <p class="hint">Je seltener die Frucht, desto stärker ihr Effekt.</p>
          <div class="cards loot">${items.map((f, i) => {
          const rid = f.awakened ? 'awakened' : f.rarity >= 0 ? GL.config.rarities[f.rarity].id : 'unique';
          return cardButton(i, lootCardFace(f, 'fruit'), `loot-opt lr-${rid}`, tip);
        }).join('')}</div>${tipLine(tip)}`;
      }

      case 'treasure': {
        const items = run.pool.map(it => GL.loot.relic(it));
        const tip = GL.advice.loot(run, items, 'relic');
        return `<h2>Welchen Schatz nimmst du mit?</h2>
          <p class="hint">Schätze wirken bis zum Ende des Runs. Je seltener, desto stärker.</p>
          <div class="cards loot">${items.map((r, i) => {
            const rid = r.rarity >= 0 ? GL.config.rarities[r.rarity].id : 'unique';
            return cardButton(i, lootCardFace(r, 'relic'), `loot-opt lr-${rid}`, tip);
          }).join('')}</div>${tipLine(tip)}`;
      }

      case 'prep': {
        const foes = run.pending.enemies;
        const boss = foes.find(e => e.boss || e.mini);
        const front = foes[0];
        const mult = (a, d) => GL.battle.typeMult(a, d);
        const fmtMult = m => (m === 1 ? '' : '×' + String(m).replace('.', ','));
        const firstAlive = run.crew.findIndex(u => u.hp > 0);
        const formTip = GL.advice.formation(run, front);
        const crewRows = run.crew.map((u, i) => {
          const d = crewData(u.id);
          const atk = mult(u.type, front.type);
          const def = mult(front.type, u.type);
          const isFront = i === firstAlive;
          return `<div class="slot${u.hp <= 0 ? ' down' : ''}${isFront ? ' is-front' : ''}${formTip && formTip.index === i ? ' is-tip' : ''}" data-slot="${i}" tabindex="0"
              role="listitem" aria-label="Platz ${i + 1}: ${d.name}${isFront ? ', vorne' : ''}">
            <span class="slot-pos">${isFront ? '<i class="shield" aria-hidden="true"></i>' : i + 1}</span>
            <span class="slot-sprite">${GL.sprites.render(d)}</span>
            <span class="slot-info">
              <b>${d.name} ${badge(u.type)}</b>
              <span class="slot-bar"><i style="width:${Math.max(0, 100 * u.hp / u.max)}%"></i></span>
              <span class="slot-tags">
                ${u.hp <= 0 ? '<em class="mu bad">Besiegt</em>' : ''}
                ${atk > 1 ? `<em class="mu good">Angriff ${fmtMult(atk)}</em>` : atk < 1 ? `<em class="mu bad">Angriff ${fmtMult(atk)}</em>` : ''}
                ${isFront && def > 1 ? `<em class="mu bad">Nimmt ${fmtMult(def)}</em>` : ''}
                ${isFront && def < 1 ? `<em class="mu good">Nimmt ${fmtMult(def)}</em>` : ''}
              </span>
            </span>
            <span class="grip" aria-hidden="true"></span>
          </div>`;
        }).join('');
        const foeRows = foes.map((e, i) => {
          const d = enemyData(e.id);
          return `<div class="slot foe${e.boss ? ' boss' : ''}${i === 0 ? ' is-front' : ''}">
            <span class="slot-sprite">${GL.sprites.render(d)}</span>
            <span class="slot-info"><b>${d.name} ${badge(e.type)}</b>
              <span class="slot-bar"><i style="width:100%"></i></span>
              <small>${e.hp} Leben, ${e.atk} Angriff</small></span>
            <span class="slot-pos">${i === 0 ? '<i class="shield" aria-hidden="true"></i>' : i + 1}</span>
          </div>`;
        }).join('');
        const huntedT = boss && boss.mini ? enemyData(boss.id) : null;
        return `<h2>${run.pending.kind === 'raid' ? 'Raid: ' + enemyData(boss.id).name : run.pending.kind === 'boss' ? 'Bosskampf: Aufstellung' : huntedT ? 'Kopfgeld-Ziel: ' + huntedT.name : 'Aufstellung'}</h2>
          ${huntedT ? `<p class="hint">Auf ${huntedT.name} sind <b>${huntedT.bounty} Mio. ฿</b> ausgesetzt. Sieg: Das Kopfgeld geht an deinen Kapitän, dazu ein Schatz.</p>` : ''}
          ${run.pending.kind === 'raid' ? `<p class="hint">Gewinnst du, gehört dir eine erwachte Teufelsfrucht für immer. Verlierst du, entkommt deine Crew mit wenig Leben.</p>` : ''}
          <div class="formation isl-${GL.run.island(run).id}${run.pending.kind === 'raid' ? ' raid' : ''}">
            <div class="arena-sky" aria-hidden="true"></div>
            <div class="form-side">
              <span class="form-label">Deine Crew ${dangerTag(run, run.pending.kind)}</span>
              <div class="slots" id="slots" role="list">${crewRows}</div>
            </div>
            <div class="form-vs" aria-hidden="true">VS</div>
            <div class="form-side">
              <span class="form-label">Gegner</span>
              <div class="slots">${foeRows}</div>
            </div>
          </div>
          ${tipLine(formTip)}
          <p class="hint form-hint">Figuren an die gewünschte Stelle ziehen (oder anwählen und Pfeiltasten). Wer ganz oben steht, steht <b>vorne</b> und wird zuerst angegriffen. Alle greifen den vordersten Gegner an. ${typeChart()}</p>
          ${boss && ability(boss.id) ? `<p class="hint boss-mech"><b>${enemyData(boss.id).name}, ${ability(boss.id).name}:</b> ${abilityTag(ability(boss.id))} ${ability(boss.id).text}</p>` : ''}
          ${boss && ability(boss.id) && ability(boss.id).status ? counterHint(run, ability(boss.id).status.key) : ''}
          ${specialPanel(run)}
          <button class="btn" data-act="fight">Kampf starten ${keyHint('Leertaste')}</button>`;
      }

      case 'battle': {
        const b = run.battle;
        const done = !anim || anim.done;
        let log, controls;
        if (done) {
          log = b.win ? 'Sieg! Die Gegner sind besiegt.'
            : b.kind === 'raid' ? 'Der Raid ist gescheitert. Deine Crew entkommt mit letzter Kraft.'
            : 'Niederlage. Deine Crew ist gefallen.';
          controls = `<button class="btn" data-act="continue">Weiter ${keyHint('Leertaste')}</button>`;
        } else {
          log = anim.log;
          controls = `<button class="btn" data-act="fast">Schneller ${keyHint('F')}</button> <button class="btn ghost" data-act="skip">Überspringen ${keyHint('S')}</button>`;
        }
        const title = b.kind === 'raid' ? 'Raid' : b.kind === 'boss' ? 'Bosskampf' : 'Kampf';
        return `<div class="battle-head"><h2>${title}</h2>${done ? `<span class="result ${b.win ? 'win' : 'lose'}">${b.win ? 'Sieg' : 'Niederlage'}</span>` : ''}</div>
          ${GL.arena.html(run, anim)}
          <div class="log" id="log" role="status" aria-live="polite">${log}</div>
          ${done && b.win ? battleSummary(run) : ''}
          ${controls}`;
      }

      case 'awaken':
        return `<h2>Kopfgeld kassiert</h2>
          <div class="lbl">Die Crew ist wieder fit. Wer erwacht? (+${GL.config.awaken.atk} Angriff, +${GL.config.awaken.hp} Leben)</div>
          <div class="opts">${run.crew.map((u, i) =>
            button('pick', i, `${crewData(u.id).name} <em class="lv">Lv ${u.lvl}</em>`, `Angriff ${u.atk}, Leben ${u.max}`, '', GL.sprites.render(crewData(u.id)))).join('')}</div>`;

      case 'over':
      case 'win': {
        const score = GL.run.score(run);
        const best = GL.save.best();
        const head = run.phase === 'win'
          ? `<h2>Die Grand Line gehört dir</h2><p>Alle Inselbosse besiegt, ${run.bounties} Kopfgelder kassiert.</p>`
          : `<h2>Die Crew ist untergegangen</h2><p>Du bist bis ${GL.run.island(run).name} gekommen.</p>`;
        const record = ui.newBest
          ? `<p><b>Neuer Bestwert: ${score} Punkte.</b></p>`
          : `<p>${score} Punkte.${best ? ` Dein Bestwert: ${best.score} Punkte.` : ''}</p>`;
        const heatUp = ui.profile && ui.profile.lastHeatUnlock
          ? `<div class="heat-unlock"><span class="event-kicker">Neu freigeschaltet</span><b>Kopfgeld-Stufe ${ui.profile.lastHeatUnlock}: ${GL.data.heat[ui.profile.lastHeatUnlock - 1].name}</b><small>${GL.data.heat[ui.profile.lastHeatUnlock - 1].text} Dafür mehr Berry.</small></div>` : '';
        const berry = ui.lastBerry != null
          ? `<div class="berry-gain">${GL.sprites.coin()} <b>+${ui.lastBerry}</b> Berry für das Hauptquartier</div>` : '';
        const lr = ui.profile && ui.profile.lastRank;
        let rankHtml = '';
        if (lr && ui.lastBerry != null) {
          const R = GL.data.ranks;
          const now = GL.meta.rankProgress(ui.profile);
          const ups = lr.ups.map(k => `<div class="rank-up">${medal(k, 'big flip')}<span class="event-kicker">Rang-Aufstieg!</span><b>${R[k].name}</b><small>Belohnung: ${[R[k].reward.berry ? R[k].reward.berry + ' Berry' : '', R[k].reward.gear ? byId(GL.data.gear, R[k].reward.gear).name : ''].filter(Boolean).join(' und ')}</small></div>`).join('');
          const beforeP = GL.meta.rankProgress({ rankXp: lr.before });
          const fromPct = lr.ups.length ? 0 : Math.min(100, 100 * beforeP.have / beforeP.need);
          const toPct = now.next ? Math.min(100, 100 * now.have / now.need) : 100;
          rankHtml = `<div class="rank-gain">${medal(now.i, 'small')}<span>Piratenrang: <b>${now.rank.name}</b></span><small>+${lr.xp} Rang-EP</small>
            <div class="xpbar big rank-bar fill-anim" style="--from:${fromPct}%;--to:${toPct}%"><i style="width:${toPct}%"></i></div></div>${ups}`;
        }
        const tro = (run.trophies || []).map(id => (GL.data.artifacts || []).find(a => a.id === id)).filter(Boolean);
        const troHtml = tro.length ? `<div class="trophy-sum"><span class="event-kicker">Neu in der Schatzkammer</span>
          ${tro.map(a => `<span class="trophy-chip" title="${a.text.replace('{v}', '…')}">${artIcon(a)} ${a.name}</span>`).join('')}</div>` : '';
        const duelHtml = run.duel ? `<div class="duel-sum"><span class="event-kicker">Duell ${run.duel}</span>
          <span>Dein Ergebnis: <b>${GL.run.score(run).toLocaleString('de-DE')}</b> Punkte. Schick deinem Freund den Code <b>${run.duel}</b>, er spielt denselben Run.</span>
          <button class="btn mini ghost" data-act="duel-copy" data-id="${run.duel}">Code kopieren</button></div>` : '';
        return `${head}${duelHtml}${record}${berry}${troHtml}${rankHtml}${heatUp}<button class="btn" data-act="hq">Zurück ins Hauptquartier ${keyHint('Leertaste')}</button>`;
      }
    }
    return '';
  }

  // ---------- Hauptquartier ----------

  function fmtUpgrade(u, total) {
    const isPct = ['restHeal', 'luck', 'xp', 'berry'].includes(u.effect);
    return u.text.replace('{v}', isPct ? Math.round(total * 100) + ' %' : String(total));
  }

  function rankReward(r) {
    const parts = [];
    if (r.reward.berry) parts.push(`${r.reward.berry} Berry`);
    if (r.reward.gear) parts.push(byId(GL.data.gear, r.reward.gear).name);
    return parts.length ? `. Belohnung: ${parts.join(' und ')}` : '';
  }

  // ---------- Online-Rangliste ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  // Kategorien der Rangliste: Feld im Eintrag, Name, Einheit
  const LB_CATS = [
    { id: 'score',     name: 'Punkte',            get: x => x.score,     unit: 'Punkte' },
    { id: 'bestDmg',   name: 'Schaden (Run)',     get: x => x.bestDmg,   unit: 'Schaden in einem Run' },
    { id: 'maxHit',    name: 'Härtester Treffer', get: x => x.maxHit,    unit: 'Schaden mit einem Schlag' },
    { id: 'totalDmg',  name: 'Schaden gesamt',    get: x => x.totalDmg,  unit: 'Schaden insgesamt' },
    { id: 'kos',       name: 'K.o.s',             get: x => x.kos,       unit: 'besiegte Gegner' },
    { id: 'topBounty', name: 'Kopfgeld',          get: x => x.topBounty, unit: 'Mio. ฿ in einem Run' },
    { id: 'bossKills', name: 'Inselbosse',        get: x => x.bossKills, unit: 'Bosse besiegt' },
    { id: 'wins',      name: 'Siege',             get: x => x.wins,      unit: 'gewonnene Runs' },
    { id: 'rankXp',    name: 'Piratenrang',       get: x => x.rankXp,    unit: 'Rang-EP' },
    { id: 'artifacts', name: 'Artefakte',         get: x => x.artifacts, unit: 'Artefakte gefunden' }
  ];
  // Dein Profil als Karte: Name, Rang, wichtigste Werte
  function myCard(profile, mine, best, fmt) {
    const rp = GL.meta.rankProgress(profile);
    const m = mine || {};
    const cap = m.best && m.best.captain ? crewData(m.best.captain) : crewData(GL.config.starters[0]);
    const stat = (v, l) => `<div><b>${fmt(v)}</b><small>${l}</small></div>`;
    return `<div class="my-card">
      <div class="my-top">${medal(rp.i, 'big')}
        <div><span class="event-kicker">Dein Piratenprofil</span>
          <b class="my-name">${esc(profile.nickname || 'Noch ohne Namen')}</b>
          <small>${esc(rp.rank.name)} · ${profile.stats.runs} Runs · ${profile.stats.wins} Siege${mine ? ' · <span class="ok">in der Rangliste</span>' : ''}</small></div>
        <span class="my-cap">${GL.sprites.render(cap)}</span>
      </div>
      <div class="my-stats">
        ${stat(m.score || (best ? best.score : 0), 'Bestwert')}
        ${stat(m.maxHit || 0, 'Härtester Treffer')}
        ${stat(m.totalDmg || 0, 'Schaden gesamt')}
        ${stat(m.kos || 0, 'K.o.s')}
        ${stat(Object.keys(profile.vault || {}).length, 'Artefakte')}
        ${stat(profile.unlocked.length + GL.config.starters.length, 'Kapitäne')}
      </div>
    </div>`;
  }
  function leaderboard(profile, ui) {
    const st = GL.online ? GL.online.state() : { status: 'local', rows: [] };
    const fmt = n => Number(n || 0).toLocaleString('de-DE');
    const best = GL.save.best();
    const cat = LB_CATS.find(c => c.id === (ui.lbCat || 'score')) || LB_CATS[0];
    const mine = (st.rows || []).find(x => x.id === st.uid);
    const nameBox = `<div class="lb-name">
        <label for="nick">Dein Piratenname</label>
        <input id="nick" maxlength="24" placeholder="z. B. Felix der Gummimann" value="${esc(profile.nickname || '')}">
        <button class="btn mini" data-act="set-nick">${(st.rows || []).some(x => x.id === st.uid) ? 'Speichern' : 'Eintragen'}</button>
      </div>`;
    let info = '';
    if (st.status === 'local') info = 'Die Online-Rangliste läuft in der geteilten Version (über den Link). Hier siehst du nur deinen eigenen Bestwert.';
    else if (st.status === 'connecting') info = 'Verbinde mit der Rangliste …';
    else if (st.status === 'unavailable' || st.status === 'error') info = 'Die Rangliste ist gerade nicht erreichbar. Melde dich bei Claude an und öffne den Link erneut.';
    else if (st.readOnly) info = 'Du kannst die Rangliste ansehen, aber noch nicht eintragen. Der Besitzer der Seite muss dich per E-Mail als Bearbeiter einladen.';
    else info = 'Nach jedem Run wird alles eingetragen. Wähle oben, worin ihr euch messt.';
    const rows = (st.rows || []).slice().sort((a, b) => (Number(cat.get(b)) || 0) - (Number(cat.get(a)) || 0));
    const chips = `<div class="lb-cats" role="tablist">${LB_CATS.map(c =>
      `<button class="lb-cat${c.id === cat.id ? ' on' : ''}" data-act="lb-cat" data-id="${c.id}">${c.name}</button>`).join('')}</div>`;
    const row = (x, k, value, unit, extra) => {
      const b = x.best || {};
      const cap = b.captain ? crewData(b.captain) : null;
      return `<li class="lb-row${x.id === st.uid ? ' me' : ''}${k < 3 ? ' top' + (k + 1) : ''}">
        <span class="lb-pos">${k + 1}</span>
        <span class="lb-cap">${cap ? GL.sprites.render(cap) : ''}</span>
        <span class="lb-who"><b>${esc(x.name || 'Unbekannter Pirat')}${x.id === st.uid ? ' <em>du</em>' : ''}</b>
          <small>${esc(x.rank || '')}${extra ? ' · ' + extra : ''}</small></span>
        <span class="lb-score"><b>${fmt(value)}</b><small>${unit}</small></span>
      </li>`;
    };
    const table = rows.length
      ? `<ol class="lb-list">${rows.map((x, k) => row(x, k, cat.get(x), cat.unit,
          `${x.wins || 0} / ${x.runs || 0} Siege`)).join('')}</ol>`
      : `<p class="muted">${st.status === 'ready' ? 'Noch keine Einträge. Beende einen Run, um der Erste zu sein!' : ''}</p>`;

    // Duelle: alle Codes, bei denen du oder andere mitgespielt haben
    const codes = {};
    (st.rows || []).forEach(x => Object.keys(x.duels || {}).forEach(c => { codes[c] = (codes[c] || 0) + 1; }));
    const myCodes = mine ? Object.keys(mine.duels || {}) : [];
    const shown = ui.duelView && codes[ui.duelView] ? ui.duelView : (myCodes[myCodes.length - 1] || Object.keys(codes)[0]);
    const duelRows = shown ? (st.rows || []).filter(x => x.duels && x.duels[shown])
      .sort((a, b) => b.duels[shown].score - a.duels[shown].score) : [];
    const duelBox = `<div class="duel-box">
      <div class="duel-head"><b>Duell</b><small>Alle spielen exakt denselben Run: gleiche Angebote, gleiche Gegner, ohne Werft, Lager und Artefakte. Wer mehr Punkte holt, gewinnt.</small></div>
      <div class="duel-actions">
        <button class="btn" data-act="duel-new">⚔ Neues Duell starten</button>
        <span class="duel-join"><input id="duel-code" maxlength="8" placeholder="Code vom Freund" value="${esc(ui.duelInput || '')}">
        <button class="btn ghost" data-act="duel-join">Annehmen</button></span>
      </div>
      ${Object.keys(codes).length ? `<div class="lb-cats duel-codes">${Object.keys(codes).map(c =>
        `<button class="lb-cat${c === shown ? ' on' : ''}" data-act="duel-view" data-id="${esc(c)}">${esc(c)} <small>${codes[c]}</small></button>`).join('')}</div>` : ''}
      ${duelRows.length ? `<ol class="lb-list">${duelRows.map((x, k) => row(x, k, x.duels[shown].score, 'Punkte',
        `${x.duels[shown].won ? 'Grand Line geschafft' : 'bis ' + esc(x.duels[shown].island || '?')} · ${fmt(x.duels[shown].dmg)} Schaden`)).join('')}</ol>
        <button class="btn mini ghost" data-act="duel-copy" data-id="${esc(shown)}">Code ${esc(shown)} kopieren</button>` : ''}
    </div>`;

    return `<section class="hq-sec leaderboard">
      <p class="hint">${info}</p>
      ${nameBox}
      ${myCard(profile, mine, best, fmt)}
      ${duelBox}
      <div class="lbl">Rangliste</div>
      ${chips}
      ${table}
      <p class="muted lb-note">Punkte: 100 pro Etappe, 500 pro Inselboss, 2 pro Million Kopfgeld. Höhere Kopfgeld-Stufen zählen mehr.</p>
    </section>`;
  }

  // ---------- Schatzkammer: Artefakte für den dauerhaften Fortschritt ----------
  function fmtArt(art, v) {
    return art.text.replace('{v}', art.pct ? Math.round(v * 100) + ' %' : String(v));
  }
  // Bild eines Artefakts: die Figur, von der es stammt
  function artIcon(art) {
    const d = enemyData(art.from[0]);
    return d ? GL.sprites.render(d) : GL.sprites.icon('relic', art.id, true);
  }
  function artSource(art) {
    const C = GL.config.trophyChance;
    return art.from.map(id => {
      const d = enemyData(id);
      const ch = GL.data.raids.some(x => x.id === id) ? C.raid : (GL.data.hunted || []).some(x => x.id === id) ? C.mini : C.boss;
      return `${d ? d.name : id} (${Math.round(ch * 100)} %)`;
    }).join(', ');
  }
  function artifactCard(profile, art, opts) {
    const o = opts || {};
    const n = profile.vault[art.id] || 0;
    const lvl = GL.meta.artLevelFor(n);
    const needNext = GL.config.artLevels[lvl];
    const on = profile.artLoadout.includes(art.id);
    const full = !on && profile.artLoadout.length >= GL.meta.artSlots(profile);
    if (!n) {
      return `<div class="art-card locked">
        <span class="art-icon">?</span>
        <b>Unbekanntes Artefakt</b>
        <small>Fundort: ${artSource(art)}</small>
      </div>`;
    }
    const pips = [1, 2, 3, 4, 5].map(k => `<i class="${k <= lvl ? 'on' : ''}"></i>`).join('');
    const next = lvl < 5 ? `<small class="muted">Stufe ${lvl + 1} (${n}/${needNext} Funde): ${fmtArt(art, GL.run.artValue(art, lvl + 1))}</small>` : '<small class="muted">Höchste Stufe erreicht.</small>';
    return `<div class="art-card${on ? ' on' : ''} lv${lvl}">
      <span class="art-icon">${artIcon(art)}</span>
      <span class="art-lv" title="Stufe ${lvl} von 5. Jeder weitere Fund macht es stärker.">${pips}</span>
      <b>${art.name}</b>
      <span class="art-eff">${fmtArt(art, GL.run.artValue(art, lvl))}</span>
      ${next}
      <small class="art-src">Fundort: ${artSource(art)}</small>
      ${o.noButton ? '' : `<button class="btn mini${on ? '' : ' ghost'}" data-act="toggle-art" data-id="${art.id}"${full ? ' disabled' : ''}>${on ? 'Ausgerüstet' : full ? 'Plätze voll' : 'Ausrüsten'}</button>`}
    </div>`;
  }
  function vaultSection(profile) {
    const A = GL.data.artifacts || [];
    const found = A.filter(a => profile.vault[a.id] > 0).length;
    const slotsA = GL.meta.artSlots(profile);
    const nextSlotRank = [4, 8, 12].find(k => k > GL.meta.rankIndex(profile));
    const epics = GL.data.fruits.filter(f => f.awakened).map(f => {
      const have = profile.epics.includes(f.id);
      const raid = GL.data.raids.find(x => x.reward === f.id);
      return `<div class="art-card fruit${have ? ' have' : ' locked'}">
        <span class="art-icon">${have ? GL.sprites.icon('fruit', f.id, true) : '?'}</span>
        <b>${have ? f.name : 'Erwachte Frucht'}</b>
        <span class="art-eff">${have ? f.text : ''}</span>
        <small class="art-src">${have ? 'Taucht ab jetzt in Frucht-Angeboten auf.' : `Fundort: Raid gegen ${raid ? raid.name : '?'}`}</small>
      </div>`;
    }).join('');
    return `<section class="hq-sec vault">
      <div class="vault-head">
        <p class="hint">Epische Artefakte bleiben für immer. Sie fallen bei Inselbossen, Raids und Kopfgeld-Zielen. Jeder weitere Fund hebt die Stufe (bis 5).</p>
        <div class="vault-slots"><b>${profile.artLoadout.length} / ${slotsA}</b><small>Plätze${nextSlotRank != null ? `<br>nächster ab Rang ${nextSlotRank + 1}` : ''}</small></div>
      </div>
      <div class="lbl">Artefakte <small>${found} von ${A.length} gefunden</small></div>
      <div class="art-grid">${A.map(a => artifactCard(profile, a)).join('')}</div>
      <div class="lbl">Erwachte Teufelsfrüchte</div>
      <div class="art-grid">${epics}</div>
    </section>`;
  }

  // Fund im Run: Artefakt dreht sich in 3D ins Bild
  function trophyPop(id, lvl, isNew, up, count) {
    const art = (GL.data.artifacts || []).find(a => a.id === id);
    if (!art) return;
    const old = document.getElementById('trophy-pop');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'trophy-pop';
    el.className = 'trophy-pop';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="tp-card">
        <span class="tp-kicker">${isNew ? 'Epischer Fund!' : up ? 'Stufe aufgestiegen!' : 'Weiterer Fund!'}</span>
        <span class="tp-icon">${artIcon(art)}</span>
        <b class="tp-name">${art.name}</b>
        <span class="tp-lv">Stufe ${lvl} von 5${!isNew && lvl < 5 ? ` · ${count}/${GL.config.artLevels[lvl]} Funde bis Stufe ${lvl + 1}` : ''}</span>
        <span class="tp-eff">${fmtArt(art, GL.run.artValue(art, lvl))}</span>
        <small>Liegt jetzt in der Schatzkammer im Hauptquartier.</small>
        <span class="tp-rays" aria-hidden="true"></span>
      </div>`;
    el.addEventListener('click', () => el.remove());
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 3300);
    setTimeout(() => el.remove(), 3900);
  }

  // ---------- Piratenrang im Hauptquartier ----------
  // Medaille in Bronze, Silber, Gold oder Legende, darunter die Belohnungsstraße aller Ränge
  function rankTier(i) {
    return i >= 12 ? 'legend' : i >= 8 ? 'gold' : i >= 4 ? 'silver' : 'bronze';
  }
  function medal(i, cls) {
    return `<span class="medal m-${rankTier(i)}${cls ? ' ' + cls : ''}" aria-hidden="true">
      <span class="medal-face"><span class="medal-num">${i + 1}</span></span><span class="medal-shine"></span></span>`;
  }
  function rankPanel(profile, rp, fmt) {
    const R = GL.data.ranks;
    const pct = rp.next ? Math.min(100, 100 * rp.have / rp.need) : 100;
    const bonus = rp.i * 2;
    const road = R.map((r, k) => {
      const state = k < rp.i ? 'done' : k === rp.i ? 'now' : k === rp.i + 1 ? 'next' : 'locked';
      const rew = [r.reward.berry ? `${GL.sprites.coin()} ${r.reward.berry}` : '', r.reward.gear ? `${GL.sprites.icon('relic', r.reward.gear)} ${byId(GL.data.gear, r.reward.gear).name}` : '']
        .filter(Boolean).join('<br>');
      return `<div class="road-step ${state}${r.reward.gear ? ' has-gear' : ''}" title="${r.name}: ab ${fmt(r.xp)} EP">
        ${medal(k, 'small')}
        <b>${r.name}</b>
        <small>${k === 0 ? 'Start' : rew || '–'}</small>
      </div>`;
    }).join('');
    return `<div class="rank rank-v2 t-${rankTier(rp.i)}">
        <div class="rank-top">
          ${medal(rp.i, 'big')}
          <div class="rank-body">
            <span class="event-kicker">Piratenrang ${rp.i + 1} von ${R.length}</span>
            <b class="rank-name">${rp.rank.name}</b>
            <div class="xpbar big rank-bar"><i style="width:${pct}%"></i><span class="rank-bar-txt">${rp.next ? `${fmt(rp.have)} / ${fmt(rp.need)} EP` : 'Maximum'}</span></div>
            <small>${rp.next ? `Nächster Rang: <b>${rp.next.name}</b>${rankReward(rp.next)}` : 'Höchster Rang erreicht. Du bist der Piratenkönig!'}</small>
          </div>
          <div class="rank-perk"><b>+${bonus} %</b><small>Berry pro Run<br>(+2 % je Rang)</small></div>
        </div>
        <div class="rank-road" role="list" aria-label="Belohnungen der Ränge">${road}</div>
        <p class="rank-src">Rang-EP gibt es für jede Etappe, Kopfgeld-Ziele, Inselbosse, Raids und Siege. Höhere Kopfgeld-Stufen geben mehr.</p>
      </div>`;
  }

  function hq(profile, tab, uiRef) {
    const best = GL.save.best();
    const slots = GL.meta.slots(profile);
    const fmt = n => n.toLocaleString('de-DE');

    const upgrades = GL.data.upgrades.map(u => {
      const lvl = profile.upgrades[u.id] || 0;
      const cost = GL.meta.upgradeCost(profile, u.id);
      const pips = u.costs.map((_, k) => `<i class="${k < lvl ? 'on' : ''}"></i>`).join('');
      const now = lvl ? fmtUpgrade(u, lvl * u.per) : 'Noch nicht gebaut.';
      const next = cost != null ? `Nächste Stufe: ${fmtUpgrade(u, (lvl + 1) * u.per)}` : 'Voll ausgebaut.';
      return `<div class="hq-card${cost == null ? ' maxed' : ''}">
        <div class="hq-card-head"><b>${u.name}</b><span class="lvpips">${pips}</span></div>
        <p>${now}</p><p class="muted">${next}</p>
        ${cost != null ? `<button class="btn mini buy" data-act="buy-upgrade" data-id="${u.id}"${profile.berry < cost ? ' disabled' : ''}>
          ${GL.sprites.coin()} ${fmt(cost)}</button>` : ''}
      </div>`;
    }).join('');

    const owned = GL.data.gear.filter(g => profile.gear[g.id] > 0);
    const storage = owned.length ? owned.map(g => {
      const on = profile.loadout.includes(g.id);
      const full = !on && profile.loadout.length >= slots;
      return `<div class="hq-item${on ? ' on' : ''}">
        <i>${GL.sprites.icon('relic', g.id)}</i>
        <span><b>${g.name}</b> <small>×${profile.gear[g.id]}</small><small>${g.text}</small></span>
        <button class="btn mini${on ? '' : ' ghost'}" data-act="toggle-gear" data-id="${g.id}"${full ? ' disabled' : ''}>${on ? 'Kommt mit' : 'Mitnehmen'}</button>
      </div>`;
    }).join('') : '<p class="muted">Das Lager ist leer. Beim Händler bekommst du Ausrüstung für deine Runs.</p>';

    const shop = GL.data.gear.map(g => `<div class="hq-item">
        <i>${GL.sprites.icon('relic', g.id)}</i>
        <span><b>${g.name}</b><small>${g.text}</small></span>
        <button class="btn mini buy" data-act="buy-gear" data-id="${g.id}"${profile.berry < g.cost ? ' disabled' : ''}>${GL.sprites.coin()} ${fmt(g.cost)}</button>
      </div>`).join('');

    const loadout = profile.loadout.map(id => byId(GL.data.gear, id).name);
    const H = GL.data.heat;
    const heatBox = profile.heatMax > 0 ? `<div class="heat">
        <span class="heat-label">Kopfgeld-Stufe</span>
        <button class="btn mini ghost" data-act="heat" data-d="-1" aria-label="Stufe senken"${profile.heat <= 0 ? ' disabled' : ''}>−</button>
        <b class="heat-num">${profile.heat}</b>
        <button class="btn mini ghost" data-act="heat" data-d="1" aria-label="Stufe erhöhen"${profile.heat >= profile.heatMax ? ' disabled' : ''}>+</button>
        <small>${profile.heat ? `+${Math.round(profile.heat * GL.config.heatBonus.berry * 100)} % Berry, +${Math.round(profile.heat * GL.config.heatBonus.score * 100)} % Punkte` : 'Normale Schwierigkeit'}</small>
        ${profile.heat ? `<ul class="heat-list">${H.filter(h => h.lvl <= profile.heat).map(h => `<li><b>${h.name}:</b> ${h.text}</li>`).join('')}</ul>` : ''}
      </div>` : `<small class="muted">Gewinne einen Run, um Kopfgeld-Stufen freizuschalten: schwerer, aber mehr Berry.</small>`;

    const rp = GL.meta.rankProgress(profile);
    const rankHtml = rankPanel(profile, rp, fmt);

    return `<div class="hq">
      <div class="hq-hero">
        <div class="hq-scene" aria-hidden="true"><div class="hq-ship">${GL.sprites.ship()}</div><div class="hq-waves"></div></div>
        <div class="hq-title">
          <span class="event-kicker">Deine Basis</span>
          <h2>Hauptquartier</h2>
          <div class="berry">${GL.sprites.coin()} <b>${fmt(profile.berry)}</b> Berry</div>
        </div>
      </div>
      ${rankHtml}
      <div class="hq-stats">
        <div><b>${profile.stats.runs}</b><span>Runs</span></div>
        <div><b>${profile.stats.wins}</b><span>Siege</span></div>
        <div><b>${best ? fmt(best.score) : '0'}</b><span>Bestwert</span></div>
        <div><b>${profile.unlocked.length + GL.config.starters.length}</b><span>Kapitäne</span></div>
      </div>

      <div class="hq-sail">
        <div><b>Bereit zum Ablegen?</b>
          <small>${loadout.length ? 'An Bord: ' + loadout.join(', ') : 'Keine Ausrüstung an Bord. Schau ins Lager.'}</small>
          <small>${profile.artLoadout.length ? 'Artefakte: ' + profile.artLoadout.map(id => { const a = GL.data.artifacts.find(x => x.id === id); return `${a.name} (St. ${GL.meta.artLevel(profile, id)})`; }).join(', ') : 'Noch keine Artefakte ausgerüstet.'}</small></div>
        <button class="btn sail" data-act="sail">Leinen los! ${keyHint('Leertaste')}</button>
        ${heatBox}
      </div>

      <div class="atabs hq-tabs" role="tablist">
        ${[['werft', 'Werft'], ['rangliste', 'Rangliste'], ['kammer', `Schatzkammer <small>${profile.artLoadout.length}/${GL.meta.artSlots(profile)}</small>`], ['lager', `Lager <small>${profile.loadout.length}/${slots}</small>`], ['haendler', 'Händler']].map(([id, name]) =>
          `<button class="atab${tab === id ? ' on' : ''}" role="tab" aria-selected="${tab === id}" data-act="hq-tab" data-tab="${id}">${name}</button>`).join('')}
      </div>

      ${tab === 'werft' ? `<section class="hq-sec">
        <p class="hint">Dauerhafte Ausbauten für dein Schiff. Sie gelten für jeden zukünftigen Run.</p>
        <div class="hq-grid">${upgrades}</div></section>` : ''}

      ${tab === 'kammer' ? vaultSection(profile) : ''}
      ${tab === 'rangliste' ? leaderboard(profile, uiRef) : ''}
      <div class="hq-reset">
        <button class="link danger-link" data-act="reset-all">${uiRef && uiRef.resetArmed ? 'Wirklich alles löschen? Zum Bestätigen nochmal klicken.' : 'Spielstand komplett löschen und von vorne beginnen'}</button>
      </div>

      ${tab === 'lager' ? `<section class="hq-sec">
        <p class="hint">${profile.loadout.length} von ${slots} Plätzen belegt. Ausgewählte Ausrüstung kommt mit in den nächsten Run und wird dabei verbraucht.</p>
        <div class="hq-list">${storage}</div></section>` : ''}

      ${tab === 'haendler' ? `<section class="hq-sec">
        <p class="hint">Gekaufte Ausrüstung landet im Lager.</p>
        <div class="hq-list">${shop}</div></section>` : ''}
    </div>`;
  }

  // ---------- Sammelalbum ----------
  const ALBUM_TABS = [
    { id: 'crew', name: 'Figuren' },
    { id: 'bosses', name: 'Bosse' },
    { id: 'fruits', name: 'Früchte' },
    { id: 'relics', name: 'Schätze' }
  ];

  function albumCard(known, sprite, title, sub, cls, no) {
    return `<div class="acard${known ? '' : ' unknown'}${cls ? ' ' + cls : ''}">
      ${no ? `<span class="no">#${String(no).padStart(3, '0')}</span>` : ''}
      <div class="acard-art">${sprite}</div>
      <b>${known ? title : '???'}</b>
      <small>${sub}</small></div>`;
  }

  function album(profile, tab) {
    const seen = profile.seen;
    const lists = {
      crew: GL.data.crew.map((d, idx) => {
        const u = GL.data.unlocks.find(x => x.unlock === d.id);
        const known = seen.crew.includes(d.id) || profile.unlocked.includes(d.id);
        let sub = known ? `${GL.data.types[d.type].name}, ${tags(d)}` : 'Noch nicht getroffen';
        if (u && !profile.unlocked.includes(d.id)) {
          const pr = GL.meta.progress(profile, u);
          sub = `Gesperrt: ${u.text}${pr.need > 1 ? ` (${pr.have}/${pr.need})` : ''}`;
        }
        if (known && !(u && !profile.unlocked.includes(d.id))) {
          return { known, html: `<div class="acard-card"><span class="no">#${String(idx + 1).padStart(3, '0')}</span>${crewCardFace(d, { atk: d.atk, max: d.hp, spd: d.spd }, { gold: d.locked })}</div>` };
        }
        return { known, html: albumCard(known, GL.sprites.render(d), d.name, sub, d.locked ? 'gold' : '', idx + 1) };
      }),
      bosses: GL.data.bosses.concat(GL.data.raids, GL.data.hunted || []).map(d => {
        const n = profile.counts['defeated:' + d.id] || 0;
        const known = n > 0;
        return { known, html: albumCard(known, GL.sprites.render(d), d.name,
          known ? `${n}-mal besiegt` : (d.raid ? 'Raid-Boss' : d.bounty ? `Kopfgeld ${d.bounty} Mio. ฿` : 'Noch nicht besiegt'), d.raid ? 'epic' : d.bounty ? 'rare' : '') };
      }),
      fruits: GL.data.fruits.map(f => {
        const known = seen.fruits.includes(f.id) || (f.awakened && profile.epics.includes(f.id));
        const text = GL.loot.make(f, f.vals ? 1 : -1).text + (f.vals ? ' (Seltene Stufe)' : '');
        return { known, html: albumCard(known, GL.sprites.icon('fruit', f.id, f.awakened), f.name,
          known ? text : (f.awakened ? 'Erwacht, nur aus Raids' : 'Noch nicht gegessen'), f.awakened ? 'epic' : '') };
      }),
      relics: GL.data.relics.map(r => {
        const known = seen.relics.includes(r.id);
        const text = GL.loot.make(r, r.vals ? 1 : -1).text + (r.vals ? ' (Seltene Stufe)' : '');
        return { known, html: albumCard(known, GL.sprites.icon('relic', r.id), r.name, known ? text : 'Noch nicht gefunden') };
      })
    };
    const all = Object.values(lists).flat();
    const total = all.filter(x => x.known).length;
    const tabs = ALBUM_TABS.map(t => {
      const l = lists[t.id];
      return `<button class="atab${t.id === tab ? ' on' : ''}" data-act="album-tab" data-tab="${t.id}">${t.name}
        <small>${l.filter(x => x.known).length}/${l.length}</small></button>`;
    }).join('');
    return `<div class="album-inner">
      <div class="album-head">
        <div><h2>Sammelalbum</h2>
          <p class="hint">${total} von ${all.length} entdeckt. ${profile.stats.runs} ${profile.stats.runs === 1 ? 'Run' : 'Runs'} gespielt, ${profile.stats.wins} gewonnen.</p></div>
        <button class="btn ghost" data-act="album-close">Schließen</button>
      </div>
      <div class="atabs" role="tablist">${tabs}</div>
      <div class="agrid">${lists[tab].map(x => x.html).join('')}</div>
    </div>`;
  }

  // Erfahrungsbalken in der Auswertung animieren
  function animateSummary() {
    document.querySelectorAll('.summary .xpfill').forEach((bar, n) => {
      const row = bar.closest('.sum-row');
      const levels = Number(bar.dataset.levels);
      const to = Number(bar.dataset.to);
      const delay = 250 + n * 120;
      setTimeout(() => {
        if (!levels) { bar.style.width = to + '%'; return; }
        bar.style.width = '100%';
        setTimeout(() => {
          row.classList.add('leveled');
          row.querySelector('.lvup').hidden = false;
          row.querySelector('.lvnum').textContent = bar.dataset.newlv;
          bar.style.transition = 'none';
          bar.style.width = '0%';
          void bar.offsetWidth;
          bar.style.transition = '';
          bar.style.width = to + '%';
        }, 650);
      }, delay);
    });
  }

  // ---------- Willkommen / Anleitung ----------
  const INTRO = [
    {
      kicker: 'Willkommen',
      title: 'Auf zur Grand Line',
      body: `<p>Ein kleines Roguelike im Browser: Stell deine Piratencrew zusammen und kämpf dich über drei Inseln bis zum letzten Boss. Jeder Run ist anders.</p>
        <div class="intro-note"><b>Inoffizielles Fanprojekt.</b> Kostenlos und ohne kommerzielle Absicht. Nicht verbunden mit Eiichiro Oda, Shueisha oder Toei Animation.</div>`
    },
    {
      kicker: 'So läuft ein Run',
      title: 'Wählen, kämpfen, weitersegeln',
      body: `<ol class="intro-steps">
        <li><b>Kapitän wählen.</b> Er oder sie startet allein.</li>
        <li><b>Route wählen:</b> Kampf, neues Crewmitglied, Schatz, Teufelsfrucht oder Rast.</li>
        <li><b>Kämpfe laufen automatisch.</b> Du bestimmst vorher, wer vorne steht.</li>
        <li><b>Inselboss besiegen,</b> dann geht es zur nächsten Insel.</li></ol>`
    },
    {
      kicker: 'Stark werden',
      title: 'Kombos und Level',
      body: `<ul class="intro-list">
        <li><b>Kampfstile:</b> ${badge('kraft')} schlägt ${badge('technik')} schlägt ${badge('klinge')} schlägt ${badge('kraft')}. Doppelter Schaden!</li>
        <li><b>Kombos:</b> Mehrere Figuren mit gleichem Stil, gleicher Rolle oder aus derselben Bande schalten Boni frei.</li>
        <li><b>Level-ups</b> geben Statuspunkte. Klick auf eine Figur, um sie zu verteilen.</li></ul>`
    },
    {
      kicker: 'Zwischen den Runs',
      title: 'Dein Hauptquartier',
      body: `<ul class="intro-list">
        <li>Jeder Run bringt <b>Berry</b>. Damit baust du dein Schiff aus und kaufst Ausrüstung.</li>
        <li>Besiegte Bosse kannst du später als <b>Kapitän</b> spielen.</li>
        <li><b>Tastatur:</b> <kbd class="key inline">Leertaste</kbd> geht weiter, <kbd class="key inline">1</kbd> bis <kbd class="key inline">9</kbd> wählt.</li></ul>`
    }
  ];

  function intro(step) {
    const s = INTRO[step];
    const last = step === INTRO.length - 1;
    return `<div class="intro-card" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div class="intro-ship" aria-hidden="true">${GL.sprites.ship()}</div>
      <span class="event-kicker">${s.kicker}</span>
      <h2 id="intro-title">${s.title}</h2>
      <div class="intro-body">${s.body}</div>
      <div class="intro-foot">
        <span class="intro-dots">${INTRO.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</span>
        ${step > 0 ? '<button class="btn ghost mini" data-act="intro-prev">Zurück</button>' : '<button class="link" data-act="intro-close">Überspringen</button>'}
        <button class="btn" data-act="${last ? 'intro-close' : 'intro-next'}">${last ? 'Los geht\'s' : 'Weiter'} ${keyHint('Leertaste')}</button>
      </div>
    </div>`;
  }

  // Kleine Einblendung beim Erreichen einer neuen Insel innerhalb eines Meeres
  function showStop(name, sub) {
    const old = document.getElementById('stop-banner');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'stop-banner';
    el.className = 'stop-banner';
    el.setAttribute('role', 'status');
    el.innerHTML = `<small>${sub || 'Ankunft'}</small><b>${name}</b>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 1700);
    setTimeout(() => el.remove(), 2300);
  }

  function showScene(isl, idx) {
    const old = document.getElementById('scene');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'scene';
    el.className = 'scene isl-' + isl.id;
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="scene-card"><span class="event-kicker">Insel ${idx + 1} von ${GL.data.islands.length}</span>
      <h2>${isl.name}</h2><p>${isl.tagline || ''}</p>
      ${isl.stops ? `<p class="scene-stops">${isl.stops.map(s => s.name).join(' → ')} → <b>Inselboss</b></p>` : ''}</div>`;
    el.addEventListener('click', () => el.remove());
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 1900);
    setTimeout(() => el.remove(), 2500);
  }

  GL.ui = {
    introSteps: INTRO.length,
    bountyPoster,
    trophyPop,

    render(run, anim, ui) {
      const introEl = $('#intro');
      introEl.hidden = ui.intro == null;
      if (ui.intro != null) introEl.innerHTML = intro(ui.intro);
      if (!run) {
        $('#track').innerHTML = '';
        ['#crew', '#syn', '#crew-label', '#restart', '#sheet', '#traits'].forEach(sel => { $(sel).hidden = true; });
        const html = hq(ui.profile, ui.hqTab || 'werft', ui);
        if (html !== ui.lastStage) {
          $('#stage').innerHTML = html; ui.lastStage = html;
          // Belohnungsstraße: aktuellen Rang in die Mitte schieben
          const now = $('.road-step.now');
          if (now) now.parentElement.scrollLeft = now.offsetLeft - now.parentElement.clientWidth / 2 + now.clientWidth / 2;
        }
        $('#album').hidden = !ui.album;
        if (ui.album) $('#album').innerHTML = album(ui.profile, ui.album);
        return;
      }
      $('#restart').hidden = false;
      $('#track').innerHTML = header(run);
      const rail = run.crew.length && !['over', 'win', 'starter'].includes(run.phase) ? traitRail(run) : '';
      $('#traits').hidden = !rail;
      if ($('#traits').innerHTML !== rail) $('#traits').innerHTML = rail;
      // Szenenwechsel: beim Erreichen einer neuen Insel kurz ihren Namen einblenden
      const isl = GL.run.island(run);
      if (run.phase === 'map' && run.step % GL.config.stepsPerIsland === 0 && ui.shownIsland !== isl.id + run.seed) {
        ui.shownIsland = isl.id + run.seed;
        showScene(isl, GL.run.islandIndex(run));
      }
      const stopKey = run.seed + ':' + run.step;
      if (run.phase === 'map' && run.step % GL.config.stepsPerIsland !== 0 && ui.shownStop !== stopKey) {
        ui.shownStop = stopKey;
        const last = run.step % GL.config.stepsPerIsland === GL.config.stepsPerIsland - 1;
        showStop(GL.run.stopName(run), last ? 'Endstation: Inselboss' : 'Ankunft');
      }
      const inBattle = run.phase === 'battle' && anim && !anim.done;
      // Im Kampf zeigt die Arena die Crew, daher Crew-Liste und Synergien ausblenden
      const battle = run.phase === 'battle';
      $('#crew').hidden = battle;
      $('#syn').hidden = battle || !ui.crewOpen;
      $('#crew-label').hidden = !run.crew.length || battle;
      const openPts = run.crew.reduce((s, u) => s + u.points, 0);
      const firstPts = run.crew.findIndex(u => u.points > 0);
      $('#crew-label').innerHTML = `<span class="nowrap">Deine Crew ${run.crew.length ? `<small>${run.crew.length}/${GL.run.crewLimit(run)}</small>` : ''}</span>
        <span class="nowrap charge-wrap">Spezial ${chargePips(run)}</span>
        ${openPts > 0 ? `<button class="skill-btn" data-act="sheet" data-i="${firstPts}">✦ ${openPts} Statuspunkte verteilen</button>` : ''}
        <button class="link" data-act="crew-toggle" aria-expanded="${!!ui.crewOpen}">${ui.crewOpen ? 'Kompakt' : 'Details'}</button>`;
      $('#crew').classList.toggle('compact', !ui.crewOpen);
      $('#crew').title = 'Ziehen zum Umsortieren: Wer vorne steht, wird im Kampf zuerst angegriffen.';
      $('#crew').innerHTML = ui.crewOpen
        ? run.crew.map((u, i) => crewCard(u, i, inBattle ? anim.crewHp[i] : u.hp)).join('')
        : run.crew.map((u, i) => miniCard(u, i).replace('class="crewmini', `class="crewmini${i === run.crew.findIndex(x => x.hp > 0) ? ' is-front' : ''}`)).join('') + `<div class="chips">${synergyChips(run)}${GL.effects.relicList(run).length ? `<span class="chip relic-chip">${GL.effects.relicList(run).length} ${GL.effects.relicList(run).length === 1 ? 'Schatz' : 'Schätze'}</span>` : ''}</div>`;
      const open = $('#syn details') && $('#syn details').open;
      if (ui.crewOpen) $('#syn').innerHTML = synergyPanel(run);
      if (open && $('#syn details')) $('#syn details').open = true;

      // Hauptbereich nur neu aufbauen, wenn sich etwas geändert hat (sonst starten Animationen neu)
      const html = stage(run, anim, ui);
      if (html !== ui.lastStage) {
        $('#stage').innerHTML = html;
        ui.lastStage = html;
        // Bei einem neuen Bildschirm zur Auswahl springen, falls sie nicht sichtbar ist
        if (ui.lastPhase !== run.phase) {
          ui.lastPhase = run.phase;
          const top = $('#stage').getBoundingClientRect().top;
          if (top < 0 || top > window.innerHeight * 0.5) $('#stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (battle) GL.arena.mounted(run);
        if (battle && (!anim || anim.done)) animateSummary();
      }

      $('#sheet').hidden = ui.sheet == null || !run.crew[ui.sheet];
      if (!$('#sheet').hidden) $('#sheet').innerHTML = sheet(run, ui.sheet);
      $('#album').hidden = !ui.album;
      if (ui.album) $('#album').innerHTML = album(ui.profile, ui.album);
      const restart = $('#restart');
      restart.textContent = ui.restartArmed ? 'Wirklich aufgeben?' : 'Run aufgeben';
      restart.hidden = GL.run.isFinished(run);
    },
    battleText
  };
})();
