// Zeichnet den aktuellen Zustand auf die Seite.
// Buttons tragen data-act="..." und werden in js/main.js ausgewertet.
window.GL = window.GL || {};

(function () {
  const byId = (list, id) => list.find(x => x.id === id);
  const crewData = id => byId(GL.data.crew, id);
  // Streamer-Modus: Mail, Spielercode und Kopier-Codes werden nirgends im Klartext gezeigt
  const streamOn = () => !!(GL.streamer && GL.streamer.on());
  let mailShown = false;
  const mailOut = m => streamOn() ? '<span class="redact">versteckt</span>'
    : mailShown ? `<button class="link mail-reveal" data-act="mail-reveal">${esc(m)}</button>`
    : '<button class="link mail-reveal" data-act="mail-reveal">•••@••• <small>anzeigen</small></button>';
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

  const ROLE_ICON = { brecher: '🛡', kaempfer: '⚔', helfer: '✚' };
  const ROLE_HINT = { brecher: 'Tank', kaempfer: 'Schaden', helfer: 'Heiler' };
  function roleBadge(role) {
    const r = GL.data.roles[role];
    if (!r) return '';
    return `<em class="role-ico role-${role}" title="${esc(r.name)} (${ROLE_HINT[role] || ''})">${ROLE_ICON[role] || ''}</em>`;
  }
  // Beschrifteter Rollen-Chip: auf einen Blick, wer Tank, Schaden oder Heiler ist
  function roleChip(role) {
    const r = GL.data.roles[role];
    if (!r) return '';
    return `<em class="role-chip rc-${role}" title="${esc(ROLE_HINT[role] || '')}">${esc(r.name)}</em>`;
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

  // ---------- Ausrüstung ----------
  const STAT_NAMES = { atk: 'Angriff', hp: 'Leben', spd: 'Tempo', crit: 'Krit', armor: 'Rüstung', dmgPct: 'Schaden', regen: 'Heilung/Runde' };
  function itemStatText(it) {
    const s = GL.run.itemStats(it);
    return Object.keys(s).filter(k => s[k]).map(k => `+${['crit', 'dmgPct'].includes(k) ? Math.round(s[k] * 100) + ' %' : s[k]} ${STAT_NAMES[k]}`).join(', ');
  }
  function itemName(it) {
    const d = GL.data.items.find(x => x.id === it.id);
    return (d ? d.name : it.id) + (it.lvl ? ` +${it.lvl}` : '');
  }
  // Kleine Pixel-Symbole je Gegenstandsart, eingefärbt nach Seltenheit
  const ITEM_PIX = {
    saebel:     ['.......X', '......X.', '.....X..', '....X...', '.H.X....', '..H.....', '.H.H....', 'H.......'],
    schlagring: ['........', '.XXXXXX.', 'X.X.X.XX', 'XXXXXXXX', '.XXXXXX.', '..HHHH..', '..HHHH..', '........'],
    muskete:    ['........', '........', 'XXXXXXX.', '.HHHXXXX', '..HH....', '..H.....', '.HH.....', '........'],
    weste:      ['.XX..XX.', 'XXXXXXXX', 'XXX..XXX', 'XXXHHXXX', 'XXXHHXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.'],
    panzer:     ['.XXXXXX.', 'XXHHHHXX', 'XHXXXXHX', 'XHXXXXHX', 'XHXXXXHX', '.XHXXHX.', '..XHHX..', '...XX...'],
    mantel:     ['..XXXX..', '.XXHHXX.', 'XXXHHXXX', 'XXXXXXXX', 'XXXXXXXX', 'XX.XX.XX', 'XX.XX.XX', 'X..XX..X'],
    stiefel:    ['..XXX...', '..XXX...', '..XXX...', '..XXX...', '..XXXX..', '..XXXXXX', '.HHHHHHH', '........'],
    anhaenger:  ['...HH...', '..H..H..', '..H..H..', '...XX...', '..XXXX..', '.XXXXXX.', '..XXXX..', '...XX...'],
    amulett:    ['..HHHH..', '.H....H.', '...XX...', '..XXXX..', '.XX..XX.', '.XX..XX.', '..XXXX..', '...XX...'],
    fernrohr:   ['........', 'X.......', 'XXX.....', '.XXXX...', '..XXHHH.', '....HHHH', '.....HH.', '........']
  };
  const RAR_COL = ['#8a94a3', '#4a8be0', '#9a63e0', '#e2a92a'];
  function itemIcon(it) {
    const rows = ITEM_PIX[it.id];
    if (!rows) return GL.sprites.icon('relic', 'kanone');
    let rects = '';
    rows.forEach((row, y) => row.split('').forEach((ch, x) => {
      if (ch === 'X') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${RAR_COL[Math.max(0, Math.min(3, it.r))]}"/>`;
      if (ch === 'H') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#6b4f3a"/>`;
    }));
    return `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }
  function itemCard(it, extra, cls) {
    const d = GL.data.items.find(x => x.id === it.id) || {};
    const rid = GL.config.rarities[Math.max(0, it.r)].id;
    return `<div class="item-card ir-${rid}${cls ? ' ' + cls : ''}">
      <span class="item-ico">${itemIcon(it)}</span>
      <span class="item-body"><b>${esc(itemName(it))}</b>${rarityPill(it.r)}<small>${itemStatText(it)}</small></span>
      ${extra || ''}
    </div>`;
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
  // Ulti einer Figur (eigene oder nach Rolle)
  function ultiOf(id, role) {
    const U = GL.data.ultis || {}, D = GL.data.ultiDefaults || {};
    return U[id] || (role ? D[role] : null) || null;
  }
  function ultiLine(id, role) {
    const u = ultiOf(id, role);
    return u ? `<span class="abil ulti-line"><b>⚡ Ulti ${u.name}:</b> ${u.text}</span>` : '';
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
    return `<div class="crewmini role-bg-${d.role || ''}${u.hp <= 0 ? ' dead' : ''}${u.points > 0 ? ' has-points' : ''}" role="button" tabindex="0" data-act="sheet" data-i="${i}"
        title="${d.name}: ${d.role ? GL.data.roles[d.role].name + ', ' : ''}Level ${u.lvl}, ${u.hp}/${u.max} Leben${u.points > 0 ? `, ${u.points} Statuspunkte offen` : ''}">
      ${roleBadge(d.role)}
      <i>${GL.sprites.render(d)}</i>
      <em class="lvtag">Lv ${u.lvl}</em>

      <div class="bar"><i style="width:${Math.max(0, 100 * u.hp / u.max)}%"></i></div>
      ${u.points > 0 ? `<span class="skill-tab" title="${u.points} Trainingspunkte offen">+${u.points} ▲</span>` : ''}
    </div>`;
  }

  function synergyChips(run) {
    return GL.effects.status(run.crew).filter(s => s.active).map(s =>
      `<span class="chip${s.kind === 'faction' ? ' set' : ''}" title="${s.active.text}">${s.name} ${s.count}</span>`).join('')
      + GL.effects.duos(run.crew).map(d => `<span class="chip duo" title="${esc(d.text)}">Duo: ${d.name}</span>`).join('');
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
    GL.effects.duosWith(run.crew, d.id).forEach(x => gains.push(`Duo ${x.name}: ${x.text}`));
    return gains.length ? `<span class="gain">Schaltet frei: ${gains.join('; ')}</span>` : '';
  }

  // ---------- Karten im Sammelkarten-Stil ----------
  // Figurenkarte: Bild, Name, Fähigkeit, Angriff unten links, Leben unten rechts
  const FAC_SHORT = { strohhut: 'Strohhut', marine: 'Marine', cp9: 'CP9', baroque: 'Baroque', weissbart: 'Weißbart', samurai: 'Samurai' };
  // Figurenkarte: Rahmen in der Farbe der Bande, oben das Banden-Band, unten klare Werte-Leiste
  // Erster Satz, ohne Klammern, höchstens ~56 Zeichen
  function shortText(t) {
    let s = String(t || '').replace(/\s*\([^)]*\)/g, '').split(/(?<=[.!])\s/)[0].replace(/[.!]$/, '');
    return s.length > 74 ? s.slice(0, 72).replace(/\s+\S*$/, '') + '…' : s;
  }
  function crewCardFace(d, m, opts) {
    const o = opts || {};
    const a = ability(d.id);
    const t = o.trait ? trait(o.trait) : null;
    const fac = d.faction && GL.data.factions[d.faction];
    const u = ultiOf(d.id, d.role);
    const R = GL.data.roles && GL.data.roles[d.role];
    const T = GL.data.types && GL.data.types[d.type];
    const rare = (o.stars || 0) >= 3;
    return `<span class="card-face cf3 fac-${d.faction || 'none'} ty-${d.type}${o.gold ? ' frame-gold' : ''}${rare ? ' shiny' : ''}">
      <span class="c3-top">
        <span class="c3-head"><span class="c3-fac">${fac ? esc(FAC_SHORT[d.faction] || fac.name) : 'Ohne Bande'}</span>${o.stars ? stars(o.stars) : ''}</span>
        <span class="c3-ped" aria-hidden="true"></span>
        <span class="c3-sprite">${GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d)}</span>
        ${o.lvl ? `<em class="c3-lv">Lv ${o.lvl}</em>` : ''}
      </span>
      <span class="c3-name">${d.name}</span>
      <span class="c3-sub"><i class="c3-dot t-${d.type}"></i>${T ? esc(T.name) : ''}<span>·</span>${R ? esc(R.name) : ''}</span>
      <span class="c3-ab">
        ${a ? `<span title="${esc(a.text)}"><b>${a.name}</b> ${esc(shortText(a.text))}</span>` : ''}
        ${t ? `<span class="c3-trait" title="${esc(t.text)}"><b>${t.name}</b> ${esc(shortText(t.text))}</span>` : ''}
        ${o.extra || ''}
      </span>
      ${u ? `<span class="c3-ult" title="${esc(u.text)}">✦ ${esc(u.name)}</span>` : ''}
      <span class="c3-stats" aria-label="Leben ${m.max}, Angriff ${m.atk}, Tempo ${m.spd}">
        <span class="hp" title="Leben"><i aria-hidden="true">♥</i>${m.max}</span>
        <span class="atk" title="Angriff"><i aria-hidden="true">⚔</i>${m.atk}</span>
        <span class="spd" title="Tempo"><i aria-hidden="true">➤</i>${m.spd}</span>
      </span>
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
      `<i class="${i < run.step ? 'done' : i === run.step ? 'now' : ''}${i % GL.config.chapterSteps === GL.config.chapterSteps - 1 ? ' boss' : ''}${i % per === per - 1 ? ' sea' : ''}"></i>`).join('');
    const here = GL.run.chapterIsland(run);
    const island = here && run.phase !== 'course' ? here.name : GL.run.island(run).name;
    const pos = Math.min(GL.run.rowIdx(run) + 1, GL.config.chapterSteps);
    return `${bars}<span class="track-loc">${island} · <b class="stop-name">${run.phase === 'course' ? 'Kurs setzen' : run.phase === 'starter' ? 'Kapitän wählen' : GL.run.stopName(run)}</b>${run.phase === 'course' || run.phase === 'starter' ? '' : ` <small class="muted">(${pos}/${GL.config.chapterSteps})</small>`}</span>
      <span class="head-chips">
        <em class="gold-chip" data-tip="Gold für die Taverne.\nGibt es für Siege, verfällt am Run-Ende.">${GL.sprites.coin()} <b>${run.gold || 0}</b></em>
        <em class="bounty-chip" id="bounty-chip" data-tip="Kopfgeld deines Kapitäns.\nZählt für deinen Punktestand und die Rangliste 'Höchstes Kopfgeld'. Bringt sonst nichts im Run.">${GL.sprites.icon('node', 'elite')} <b>${fmtBounty(run.bountyM || 0)}</b></em>
        ${run.heat ? `<em class="heat-chip">Stufe ${run.heat}</em>` : ''}
        ${run.loop ? `<em class="duel-chip endless-chip">Endlos ${run.loop + 1}</em>` : ''}
        ${run.daily ? '<em class="duel-chip">Tageskarte</em>' : run.duel ? `<button class="duel-chip" data-act="duel-copy" data-id="${run.duel}" title="Code teilen">Wettfahrt ${run.duel} · teilen</button>` : ''}
      </span>`;
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

    const duoHtml = GL.effects.duos(run.crew).map(d => `<div class="syn-row on duo"><b class="syn-name">${esc(d.name)}<small>Duo</small></b><span class="syn-count">♥</span><span class="pips"></span><span class="syn-text">${esc(d.text)}</span></div>`).join('');
    return `<div class="syn">${rows}${duoHtml}</div>${pendingHtml}${relicHtml}${details}`;
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
    // Nur ein Tipp aufs Plakat selbst schließt es; der Tipp wird dabei verschluckt (nichts darunter wird ausgelöst)
    el.querySelector('.bp-poster').addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); close(); });
    setTimeout(close, 2600);
  }

  // ---------- Seekarte (wie bei Pokelike) ----------
  // Reihen von unten (Start) nach oben (Inselboss). Erreichbare Orte sind Knöpfe,
  // besuchte Orte sind golden verbunden, das Schiff zeigt, wo die Crew gerade ist.
  // „Neu“-Markierung: Gegner, die man noch nie besiegt hat, und Inseln, die man noch nie angesteuert hat
  let seenRef = null;
  const isNewFoe = id => !!(seenRef && id && !(seenRef.bosses || []).includes(id));
  const isNewIsl = isl => !!(seenRef && isl && !(seenRef.islands || []).includes(isl.id) && !(seenRef.bosses || []).includes(isl.villain || isl.boss));
  const newChip = '<span class="new-chip" title="Noch nie besiegt">Neu</span>';

  function seaChart(run, boss, tip) {
    const ch = run.chart;
    if (!ch) return '';
    const N = GL.data.nodes;
    const rows = ch.rows;
    const pos = GL.run.rowIdx(run);
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
      const big = isBoss || !!n.gate;
      const icon = isBoss ? GL.sprites.render(boss) : hunted ? GL.sprites.render(hunted) : GL.sprites.icon('node', n.t);
      const title = isBoss ? `${N.boss.title}: ${boss.name}` : n.gate && hunted ? `Bösewicht der Insel: ${hunted.name} (${hunted.bounty} Mio. ฿)` : hunted ? `Kopfgeld-Ziel: ${hunted.name} (${hunted.bounty} Mio. ฿)` : N[n.t].title;
      if (r === pos && reach.has(i)) {
        const k = reach.get(i);
        const isTip = tip && tip.index === k;
        nodes += `<button class="map-node can n-${n.t}${big ? ' boss' : ''}${n.gate ? ' gate' : ''}${hunted ? ' hunted' : ''}${isTip ? ' is-tip' : ''}" data-act="node" data-i="${k}" style="${style}"
            title="${title}: ${isBoss ? bossInfo(boss).text : hunted ? (ability(hunted.id) ? ability(hunted.id).name + ': ' + ability(hunted.id).text : '') : N[n.t].text}">
          <span class="mn-icon">${icon}</span>${k < 9 ? `<kbd class="key">${k + 1}</kbd>` : ''}${isTip ? '<span class="tip-badge">Tipp</span>' : ''}${(isBoss || hunted) && isNewFoe(isBoss ? boss.id : hunted.id) && !isTip ? newChip : ''}
          <span class="mn-label"><b>${isBoss ? boss.name : hunted ? hunted.name : title}</b>${hunted ? `<em class="mn-bounty">${hunted.bounty} Mio. ฿</em>` : ''}${dangerTag(run, n.t)}</span>
        </button>`;
      } else {
        const state = onPath(r, i) ? 'done' : r < pos ? 'gone' : 'future';
        nodes += `<span class="map-node ${state} n-${n.t}${big ? ' boss' : ''}${n.gate ? ' gate' : ''}${hunted ? ' hunted' : ''}" style="${style}" title="${title}">
          <span class="mn-icon">${icon}</span>${(isBoss || hunted) && state === 'future' && isNewFoe(isBoss ? boss.id : hunted.id) ? newChip : ''}${big ? `<span class="mn-label"><b>${isBoss ? boss.name : hunted ? hunted.name : ''}</b></span>` : ''}</span>`;
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
    if (!list.length && !GL.effects.duos(run.crew).length) return '';
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
      return `<div class="tr tr-${lv}${s.kind === 'faction' ? ' tr-set' : ''}" tabindex="0" data-tip="${esc(s.name + (s.kind === 'faction' ? ' (Set-Bonus)' : '') + '\n' + tip)}">
        <span class="tr-icon">${icon}</span>
        <span class="tr-body"><b>${s.kind === 'type' ? `<i class="tr-dot t-${s.key}"></i>` : ''}${s.name}</b><span class="tr-steps">${steps}</span></span>
        <span class="tr-count">${s.count}${s.next ? `<small>/${s.next.n}</small>` : ''}</span>
        <span class="tr-text">${s.active ? esc(s.active.text) : ''}${s.next ? `<em>${s.active ? 'Nächste Stufe' : 'Ab ' + s.next.n}: ${esc(s.next.text)}</em>` : ''}</span>
      </div>`;
    };
    const active = list.filter(s => s.active), rest = list.filter(s => !s.active);
    const duoRows = GL.effects.duos(run.crew).map(d => `<div class="tr tr-duo" tabindex="0" data-tip="${esc('Duo: ' + d.name + '\n' + d.text)}">
        <span class="tr-icon"><span class="tr-hex">♥</span></span>
        <span class="tr-body"><b>${esc(d.name)}</b><span class="tr-steps">Duo</span></span>
        <span class="tr-text">${esc(d.text)}</span>
      </div>`).join('');
    return `<div class="tr-head">Aktive Boni</div>${active.map(row).join('') + duoRows || '<p class="tr-empty">Noch keine</p>'}
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
    if (ev.k === 'ult') return `${anyData(ev.by) ? anyData(ev.by).name : ''} entfesselt die Ulti: ${ev.name}!${ev.tier === 'perfect' ? ' Perfekt, alles stärker!' : ev.bonus ? ` Bonus: ${ev.bonus}.` : ''}`;
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
    const cm = run.crew.find(x => x.id === ev.by);
    const ulti = ev.ult ? ultiOf(ev.by, cm ? cm.role : 'foe') : null;
    const skill = ulti ? ` (${ulti.name})` : ability(ev.by) ? ` (${ability(ev.by).name})` : '';
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
        <span class="lvup" hidden>Level ${u.lvl}! Training wartet</span>
      </div>`;
    }).join('');
    const g = run.lastGold && b.win ? `<div class="sum-gold">${GL.sprites.coin()} +${run.lastGold.base} Gold${run.lastGold.interest ? ` <small>+${run.lastGold.interest} Zinsen</small>` : ''}</div>` : '';
    const it = run.lastItem && b.win ? (run.items || []).find(x => x.uid === run.lastItem && x.isNew) : null;
    return `<div class="summary">${rows}</div>${g}`;
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
      <p class="sheet-abil">${abilityLine(u.id)}${ultiLine(u.id, u.role)}<span class="abil"><b>Eigenschaft ${t.name}:</b> ${t.text}</span></p>

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
        ${unit.crit > 0 ? stat('Krit-Chance', pct(unit.crit)) : ''}
        ${stat('Krit-Schaden', pct(unit.critMult))}
        ${unit.armor > 0 ? stat('Rüstung', unit.armor) : ''}
        ${unit.dodge > 0 ? stat('Ausweichen', pct(unit.dodge)) : ''}
        ${unit.dmgPct > 0 ? stat('Schaden', '+' + pct(unit.dmgPct)) : ''}
        ${unit.bossPct > 0 ? stat('Gegen Bosse', '+' + pct(unit.bossPct)) : ''}
        ${unit.regen > 0 ? stat('Heilung pro Runde', unit.regen) : ''}
      </div>
      ${sets.length ? `<div class="lbl">Aktive Boni für ${d.name}</div><ul class="sheet-sets">${sets.map(s =>
        `<li>${s.kind === 'faction' ? '<em class="set-tag">Set</em>' : ''}<b>${s.name} ${s.count}:</b> ${s.active.text}</li>`).join('')}</ul>` : ''}
      ${equipSection(run, i)}
      <div class="sheet-foot">
        <button class="btn ghost" data-act="sheet-close">Schließen</button>
        ${u.id !== run.captain && run.crew.length > 1 && ['map', 'prep', 'recruit', 'fruit', 'treasure', 'awaken', 'event'].includes(run.phase)
          ? `<button class="btn ghost danger-btn" data-act="dismiss" data-i="${i}">Entlassen (+${GL.run.sellValue(u)} Gold)</button>` : ''}
      </div>
    </div>`;
  }

  // Ausrüstung im Steckbrief: angelegter Gegenstand und Auswahl aus dem Run-Inventar
  function equipSection(run, i) {
    const u = run.crew[i];
    const items = run.items || [];
    const can = ['map', 'prep', 'recruit', 'fruit', 'treasure', 'awaken', 'event'].includes(run.phase);
    const cur = u.item ? items.find(x => x.uid === u.item) : null;
    const others = items.filter(x => x.uid !== u.item);
    const holder = uid => run.crew.find(o => o.item === uid);
    return `<div class="lbl">Ausrüstung</div>
      <div class="equip">
        ${cur ? itemCard(cur, can ? `<button class="btn mini ghost" data-act="equip" data-i="${i}" data-uid="">Ablegen</button>` : '') : '<p class="muted">Nichts angelegt.</p>'}
        ${others.length && can ? `<div class="equip-list">${others.map(it => {
          const h = holder(it.uid);
          return itemCard(it, `<button class="btn mini" data-act="equip" data-i="${i}" data-uid="${it.uid}">${h ? 'Tauschen' : 'Anlegen'}</button>`, h ? 'worn' : '') +
            (h ? `<small class="worn-by">trägt ${esc(crewData(h.id).name)}</small>` : '');
        }).join('')}</div>` : items.length ? '' : '<small class="muted">Ausrüstung findest du bei Kopfgeld-Zielen, Bossen und in Schatztruhen.</small>'}
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
    return phaseStage(run, anim, ui);
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
        const lockedHtml = locked.length ? `<details class="locked-wrap"><summary>Noch gesperrt <small>${locked.length}</small></summary><div class="locked-grid">${locked.map(u => {
          const d = crewData(u.unlock);
          const pr = ui.profile ? GL.meta.progress(ui.profile, u) : { have: 0, need: 1 };
          return `<div class="locked-cap"><i class="opt-sprite silhouette">${GL.sprites.render(d)}</i>
            <span><b>${d.name}</b><small>${u.text}${pr.need > 1 ? ` (${pr.have}/${pr.need})` : ''}</small></span></div>`;
        }).join('')}</div></details>` : '';
        // Viele Kapitäne: nach Kampfstil/Rolle filtern statt alle auf einmal zu zeigen
        const f = ui.capFilter || 'all';
        const T = GL.data.types, Rl = GL.data.roles;
        const all = run.pool.map((o, i) => ({ o, i, d: crewData(o.id) }));
        const shown = all.filter(x => f === 'all' || x.d.type === f || x.d.role === f);
        const cnt = k => all.filter(x => x.d.type === k || x.d.role === k).length;
        const chip = (k, name) => `<button class="lb-cat${f === k ? ' on' : ''}" data-act="cap-filter" data-v="${k}">${name}${k !== 'all' ? ` <small>${cnt(k)}</small>` : ''}</button>`;
        const filters = all.length > 4 ? `<div class="lb-cats cap-filter">${chip('all', 'Alle')}${Object.keys(T).map(k => chip(k, T[k].name)).join('')}${Object.keys(Rl).map(k => chip(k, (ROLE_ICON[k] || '') + ' ' + Rl[k].name)).join('')}</div>` : '';
        return `<h2>Wähle deinen Kapitän</h2>
          <p class="hint">Mit ihm oder ihr beginnt deine Reise. Werte und Eigenschaft sind bei jedem Run neu ausgewürfelt.</p>
          ${filters}
          <div class="cards">${shown.map(x =>
            offerButton(run, x.o, x.i, 'cap' + (x.d.locked ? ' unlocked-cap' : ''), false)).join('')}</div>${lockedHtml}`;
      }

      case 'course': {
        // Kurs setzen: welche Insel steuert die Crew als Nächstes an?
        const sea = GL.run.island(run);
        const ch = GL.run.chapterIdx(run);
        const baseSea = GL.data.islands[GL.run.islandIndex(run)];
        const twoRoutes = ch === 0 && baseSea.alt && run.altOpen;
        const findIsl = id => (ch === 0 ? sea.small : sea.big).find(x => x.id === id) || (twoRoutes ? baseSea.alt.small.find(x => x.id === id) || baseSea.small.find(x => x.id === id) : null);
        const opts = (run.courseOpts || []).map(findIsl).filter(Boolean);
        const cards = opts.map((isl, i) => {
          const route = twoRoutes ? (baseSea.alt.small.includes(isl) ? baseSea.alt.name : baseSea.name) : '';
          const foe = enemyData(ch === 0 ? isl.villain : isl.boss);
          const info = bossInfo(foe);
          const bounty = foe.bounty ? `${foe.bounty} Mio. ฿` : '';
          return `<button class="opt course-opt" data-act="pick" data-i="${i}">
            ${i < 9 ? `<kbd class="key">${i + 1}</kbd>` : ''}
            ${route ? `<span class="co-routechip">Route: ${esc(route)}</span>` : ''}
            ${isNewIsl(isl) ? '<span class="new-chip co-new" title="Hier warst du noch nie">Neue Insel</span>' : ''}
            <span class="co-top"><b class="co-name">${isl.name}</b><small>${isl.text}</small></span>
            <span class="co-route">${isl.places.map(p => `<i>${p}</i>`).join('<em>›</em>')}<em>›</em><i class="co-lair">${isl.lair}</i></span>
            <span class="co-foe"><span class="co-sprite">${GL.sprites.render(foe)}</span>
              <span><small>${ch === 0 ? 'Bösewicht der Insel' : 'Boss des Meeres'}</small><b>${foe.name} ${badge(foe.type)}${isNewFoe(foe.id) ? newChip : ''}</b>
              <small>schwach gegen ${badge(info.counter)}${bounty ? ` · Kopfgeld ${bounty}` : ''}</small></span></span>
          </button>`;
        }).join('');
        return `${noticeBox(run)}<span class="event-kicker">${twoRoutes ? 'Drittes Meer · Zwei Routen' : sea.name + ' · ' + (ch === 0 ? 'Erste Insel' : 'Zweite Insel')}</span>
          <h2>${ch === 0 ? 'Welche Insel steuerst du an?' : 'Kurs auf den Boss des Meeres'}</h2>
          <p class="hint">${ch === 0 ? 'Jede Insel hat ihre eigenen Orte. Am Ende wartet ihr Bösewicht: Sieg bringt Kopfgeld, einen Schatz und eine Verschnaufpause.'
            : 'Auf der großen Insel wartet der Boss dieses Meeres. Wähle den Gegner, gegen den deine Crew die besseren Karten hat.'}</p>
          <div class="course-grid">${cards}</div>`;
      }

      case 'map': {
        const boss = GL.run.boss(run);
        const here = GL.run.chapterIsland(run);
        const gateFoe = here && here.villain && GL.run.chapterIdx(run) === 0 ? enemyData(here.villain) : null;
        const foe = gateFoe || boss;
        const info = bossInfo(foe);
        const last = GL.run.rowIdx(run) === GL.config.chapterSteps - 1;
        const preview = last ? ''
          : `<div class="lbl">${gateFoe ? 'Bösewicht der Insel' : 'Boss des Meeres'}: ${foe.name} ${badge(foe.type)} schwach gegen ${badge(info.counter)}</div>`;
        const tip = GL.advice.map(run);
        return `${noticeBox(run)}<h2>${here ? here.name : 'Wähle deine Route'}</h2>${preview}${seaChart(run, boss, tip)}${tipLine(tip)}`;
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
            <div class="dock"><button class="btn" data-act="leave">Weitersegeln ${keyHint('Leertaste')}</button></div>
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
          return `<div class="slot role-bg-${d.role || ''}${u.hp <= 0 ? ' down' : ''}${isFront ? ' is-front' : ''}${formTip && formTip.index === i ? ' is-tip' : ''}" data-slot="${i}" tabindex="0"
              role="listitem" aria-label="Platz ${i + 1}: ${d.name}${isFront ? ', vorne' : ''}, ${d.role ? GL.data.roles[d.role].name : ''}">
            <span class="slot-pos">${isFront ? '<i class="shield" aria-hidden="true"></i>' : i + 1}</span>
            <span class="slot-sprite">${GL.sprites.render(d)}</span>
            <span class="slot-info">
              <b>${d.name} ${badge(u.type)}</b>
              <span class="slot-bar"><i style="width:${Math.max(0, 100 * u.hp / u.max)}%"></i></span>
              <span class="slot-stats">${roleChip(d.role)}<span class="ss">Leben ${u.hp}/${u.max}</span><span class="ss">Angriff ${u.atk}</span><span class="ss">Tempo ${u.spd}</span></span>
              <span class="slot-tags">
                ${u.hp <= 0 ? '<em class="mu bad">Besiegt</em>' : ''}
                ${atk > 1 ? `<em class="mu good">Schaden ${fmtMult(atk)}</em>` : atk < 1 ? `<em class="mu bad">Schaden ${fmtMult(atk)}</em>` : ''}
                ${isFront && def > 1 ? `<em class="mu bad">nimmt ${fmtMult(def)}</em>` : ''}
                ${isFront && def < 1 ? `<em class="mu good">nimmt ${fmtMult(def)}</em>` : ''}
              </span>
            </span>
            <span class="grip" aria-hidden="true"></span>
          </div>`;
        }).join('');
        const foeRows = foes.map((e, i) => {
          const d = GL.data.foeDef(e) || enemyData(e.id);
          const fk = e.kind && GL.data.foeKind(e.kind);
          return `<div class="slot foe${e.boss ? ' boss' : ''}${fk ? ' special' : ''}${i === 0 ? ' is-front' : ''}">
            <span class="slot-sprite">${GL.sprites.render(d)}</span>
            <span class="slot-info"><b>${d.name} ${badge(e.type)}</b>
              <span class="slot-bar"><i style="width:100%"></i></span>
              <small>${e.hp} Leben, ${e.atk} Angriff</small>
              ${fk ? `<em class="foe-tag fk-${fk.key}" title="${esc(fk.text)}" data-tip="${esc(fk.text)}">${fk.tag}</em>` : ''}</span>
            <span class="slot-pos">${i === 0 ? '<i class="shield" aria-hidden="true"></i>' : i + 1}</span>
          </div>`;
        }).join('');
        const huntedT = boss && boss.mini ? enemyData(boss.id) : null;
        return `<h2>${run.pending.kind === 'raid' ? 'Raid: ' + enemyData(boss.id).name : run.pending.kind === 'boss' ? 'Bosskampf: Aufstellung' : huntedT ? (run.pending.gate ? 'Bösewicht der Insel: ' : 'Kopfgeld-Ziel: ') + huntedT.name : 'Aufstellung'}</h2>
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
          <p class="hint form-hint">↕ Ziehen zum Umsortieren. <b>Oben steht vorne</b> und wird zuerst angegriffen. ${typeChart()}</p>
          ${boss && ability(boss.id) ? `<p class="hint boss-mech"><b>${enemyData(boss.id).name}, ${ability(boss.id).name}:</b> ${abilityTag(ability(boss.id))} ${ability(boss.id).text}</p>` : ''}
          ${boss && ability(boss.id) && ability(boss.id).status ? counterHint(run, ability(boss.id).status.key) : ''}
          ${specialPanel(run)}
          <div class="dock"><button class="btn" data-act="fight">Kampf starten ${keyHint('Leertaste')}</button></div>`;
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
          controls = `<div class="fight-ctrl"><button class="btn ghost" data-act="fast">Schneller ${keyHint('F')}</button><button class="btn ghost" data-act="skip">Überspringen ${keyHint('S')}</button></div>`;
        }
        const title = b.kind === 'raid' ? 'Raid' : b.kind === 'boss' ? 'Bosskampf' : 'Kampf';
        return `<div class="battle-head"><h2>${title}</h2>${done ? `<span class="result ${b.win ? 'win' : 'lose'}">${b.win ? 'Sieg' : 'Niederlage'}</span>` : ''}</div>
          ${GL.arena.html(run, anim)}
          <div class="log" id="log" role="status" aria-live="polite">${log}</div>
          ${done && b.win ? battleSummary(run) : ''}
          <div class="dock">${controls}</div>`;
      }

      case 'awaken': {
        const A = GL.config.awaken;
        return `<h2>Kopfgeld kassiert</h2>
          <p class="awk-why">Deine Crew ist wieder voll geheilt. Als Belohnung wird <b>eine Figur deiner Wahl</b> stärker, bis zum Ende dieses Runs.</p>
          <p class="hint">Tipp: Am meisten bringt es deinem stärksten Angreifer oder der Figur, die vorne viel einsteckt.</p>
          <div class="opts">${run.crew.map((u, i) =>
            button('pick', i, `${crewData(u.id).name} <em class="lv">Lv ${u.lvl}</em>`,
              `<span class="awk-up">⚔ ${u.atk} → <b>${u.atk + A.atk}</b> · ♥ ${u.max} → <b>${u.max + A.hp}</b></span>`, '', GL.sprites.render(crewData(u.id)))).join('')}</div>`;
      }

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
        const newItems = (run.items || []).filter(x => !x.carried);
        const itemSum = newItems.length ? `<div class="trophy-sum items-sum"><span class="event-kicker">Neue Ausrüstung für die Schmiede</span>
          ${newItems.map(x => `<span class="trophy-chip ir-${GL.config.rarities[x.r].id}">${esc(itemName(x))}</span>`).join('')}</div>` : '';
        const tro = (run.trophies || []).map(id => (GL.data.artifacts || []).find(a => a.id === id)).filter(Boolean);
        const troHtml = tro.length ? `<div class="trophy-sum"><span class="event-kicker">Neu in der Schatzkammer</span>
          ${tro.map(a => `<span class="trophy-chip" title="${a.text.replace('{v}', '…')}">${artIcon(a)} ${a.name}</span>`).join('')}</div>` : '';
        const duelHtml = run.daily ? `<div class="duel-sum"><span class="event-kicker">Tageskarte</span><span>Dein Ergebnis heute: <b>${GL.run.score(run).toLocaleString('de-DE')}</b> Punkte. Vergleiche dich in der Rangliste unter „Tageskarte“.</span></div>` : run.duel ? `<div class="duel-sum"><span class="event-kicker">Wettfahrt ${run.duel}</span>
          <span>Dein Ergebnis: <b>${GL.run.score(run).toLocaleString('de-DE')}</b> Punkte. Schick deinem Freund den Code <b>${run.duel}</b>, er spielt denselben Run.</span>
          <button class="btn mini ghost" data-act="duel-copy" data-id="${run.duel}">Code teilen</button></div>` : '';
        // Endlos-Modus: nach einem Sieg (nicht bei Tageskarte/Wettfahrt) weitersegeln
        const canEndless = run.phase === 'win' && !run.daily && !run.duel;
        const endlessHtml = canEndless ? `<div class="endless-box"><span class="event-kicker">Endlos-Modus</span>
          <b>Die Grand Line ist bezwungen${run.loop ? ` – zum ${run.loop + 1}. Mal` : ''}!</b>
          <span>Weitersegeln? Deine Crew bleibt, die Gegner werden mit jeder Runde stärker. Alles bisher Erreichte ist schon gutgeschrieben.</span></div>` : '';
        return `${head}${duelHtml}${endlessHtml}${record}${berry}${troHtml}${itemSum}${rankHtml}${heatUp}<div class="end-actions dock">${canEndless ? `<button class="btn" data-act="endless">Weitersegeln ⚓</button>` : ''}<button class="btn${canEndless ? ' ghost' : ''}" data-act="again">${run.daily ? 'Neuer Run' : run.duel ? 'Normaler Run' : 'Nochmal!'} ${keyHint('Leertaste')}</button>
          <button class="btn ghost" data-act="hq">Hauptquartier ${keyHint('H')}</button></div>`;
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
  let dailyCodeShown = null;
  // Reise eines Spielers: drei Meere als Punkte (geschafft / erreicht / offen) und wo er gerade segelt
  function journey(x) {
    const per = GL.config.stepsPerIsland, seas = GL.data.islands;
    const reach = Math.max(x.bestStep || 0, x.best && x.best.won ? GL.run.totalSteps() : 0);
    const dots = seas.map((s, i) => {
      const cls = i < (x.seasDone || 0) ? 'done' : reach >= i * per + 1 ? 'seen' : '';
      return `<i class="jd ${cls}" title="${esc(s.name)}"></i>`;
    }).join('');
    const live = isOnline(x) && x.pos;
    const bp = x.bestPlace;
    const place = bp ? esc(bp.sea + (bp.isl && bp.isl !== bp.sea ? ' · ' + bp.isl : '')) + (bp.won ? ' ✓' : '')
      : reach ? esc((seas[Math.min(seas.length - 1, Math.floor(Math.max(0, reach - 1) / per))] || {}).name || '') + (reach >= GL.run.totalSteps() ? ' ✓' : '') : '';
    const txt = live ? `⛵ ${esc(x.pos.sea)}${x.pos.isl && x.pos.isl !== x.pos.sea ? ' · ' + esc(x.pos.isl) : ''}${x.pos.daily ? ' (Tageskarte)' : ''}`
      : place || 'noch im Hafen';
    return `<span class="lb-journey"><span class="jdots">${dots}</span><small${live ? ' class="live"' : ''}>${txt}</small></span>`;
  }
  // Grüner Punkt: Spieler hat sich in den letzten 4 Minuten gemeldet (Lebenszeichen alle 2 Min.)
  const isOnline = x => { const t = Date.parse(x && x.updated); return isFinite(t) && Date.now() - t < 240000; };
  const onDot = x => isOnline(x) ? '<i class="on-dot" title="Gerade online" aria-label="online"></i>' : '';
  const yesterday = () => { const d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  // Team und Fortschritt einer Tageskarte in einer Zeile
  function dailyLine(e) {
    if (!e) return '';
    const total = GL.run.totalSteps();
    const where = e.won ? 'Grand Line geschafft ✓' : `bis ${esc(e.island || '?')}${e.step ? ` · Etappe ${Math.min(e.step + 1, total)}/${total}` : ''}`;
    const team = (e.team || []).map(r => `<i title="${esc((r.id === 'self' ? 'Eigener Pirat' : (crewData(r.id) || {}).name || r.id) + ' · Lv ' + (r.lvl || 1))}">${squadSprite(r)}<b>${r.lvl || 1}</b></i>`).join('');
    return `<span class="dl-line"><span class="dl-team">${team}</span><small>${where}</small></span>`;
  }
  const LB_CATS = [
    { id: 'score',     name: 'Punkte',            get: x => x.score,     unit: 'Punkte' },
    { id: 'daily',     name: 'Tageskarte',        get: x => { const d = (x.duels || {})[dailyCodeShown]; return d ? d.score : 0; }, unit: 'Punkte' },
    { id: 'bestDmg',   name: 'Schaden (Run)',     get: x => x.bestDmg,   unit: 'Schaden in einem Run' },
    { id: 'maxHit',    name: 'Härtester Treffer', get: x => x.maxHit,    unit: 'Schaden mit einem Schlag' },
    { id: 'totalDmg',  name: 'Schaden gesamt',    get: x => x.totalDmg,  unit: 'Schaden insgesamt' },
    { id: 'kos',       name: 'K.o.s',             get: x => x.kos,       unit: 'besiegte Gegner' },
    { id: 'topBounty', name: 'Kopfgeld',          get: x => x.topBounty, unit: 'Mio. ฿ in einem Run' },
    { id: 'bossKills', name: 'Inselbosse',        get: x => x.bossKills, unit: 'Bosse besiegt' },
    { id: 'wins',      name: 'Siege',             get: x => x.wins,      unit: 'gewonnene Runs' },
    { id: 'rankXp',    name: 'Piratenrang',       get: x => x.rankXp,    unit: 'Rang-EP' },
    { id: 'artifacts', name: 'Artefakte',         get: x => x.artifacts, unit: 'Artefakte gefunden' },
    { id: 'squadRating', name: 'Crew-Liga',       get: x => x.squadOn ? (x.squadRating || 1000) : 0, unit: 'Crew-Rating' },
    { id: 'endless',   name: 'Endlos',            get: x => x.endlessBest || 0, unit: 'Etappen im Endlos-Modus' },
    { id: 'squadW',    name: 'Crew-Duelle',       get: x => x.squadW,    unit: 'Stammcrew-Siege' }
  ];
  // Dein Profil als Karte: Name, Rang, wichtigste Werte
  function myCard(profile, mine, best, fmt) {
    const rp = GL.meta.rankProgress(profile);
    const m = mine || {};
    const cap = avatarOf(profile);
    const stat = (v, l) => `<div><b>${fmt(v)}</b><small>${l}</small></div>`;
    return `<div class="my-card">
      <div class="my-top">${medal(rp.i, 'big')}
        <div><span class="event-kicker">Dein Piratenprofil</span>
          <b class="my-name">${esc(profile.nickname || 'Noch ohne Namen')}</b>
          <small>${esc(rp.rank.name)} · ${profile.stats.runs} Runs · ${profile.stats.wins} Siege${mine ? ' · <span class="ok">in der Rangliste</span>' : ''}</small></div>
        <span class="my-cap">${portrait(lookOf(profile), cosOf(profile), 'lg')}</span>
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
  // ---------- Stammcrew ----------
  function leagueChip(rating, withNum) {
    const L = GL.meta.league(rating);
    return `<em class="league-chip lg-${L.id}" title="${L.name}: ${rating == null ? 1000 : rating} Crew-Rating">⚔ ${L.name.replace('-Liga', '')}${withNum ? ` <b>${rating == null ? 1000 : rating}</b>` : ''}</em>`;
  }
  function squadMini(refs) {
    return `<span class="sq-mini">${(refs || []).slice(0, 4).map(r => `<i>${squadSprite(r)}</i>`).join('')}</span>`;
  }
  function squadSprite(r) {
    const d = (r.id === 'self' || r.id === 'rival') ? { id: 'self', name: r.name, look: r.look } : crewData(r.id);
    return d ? GL.sprites.render(d) : '';
  }
  function squadRow(refs, hpList) {
    return `<div class="sq-row">${(refs || []).map((r, i) => {
      const hp = hpList ? hpList[i] : r.max;
      return `<span class="sq-u role-bg-${r.role || ''}${hp <= 0 ? ' ko' : ''}" title="${esc(r.name)} · Lv ${r.lvl || 1}">
        <i>${squadSprite(r)}</i>${roleBadge(r.role)}<em class="lvtag">Lv ${r.lvl || 1}</em>
        <b class="sq-name">${esc(r.name)}</b>
        <span class="bar"><i style="width:${Math.max(0, 100 * hp / r.max)}%"></i></span></span>`;
    }).join('')}</div>`;
  }
  function squadSection(profile) {
    if (!GL.meta.squadUnlocked(profile)) {
      return `<section class="hq-sec squad-sec squad-locked">
        <div class="sl-art">${squadMini(GL.meta.squadRefs(profile))}</div>
        <b>🔒 Stammcrew & Crew-Liga</b>
        <p class="hint">Dein Endgame: Stell eine feste Crew auf, die dich auch offline verteidigt. Fordere andere Crews heraus, steig von der Planken- bis zur Legenden-Liga auf und zeig in der Rangliste, wer die stärkste Crew hat.</p>
        <small class="muted">Freigeschaltet nach deinem ersten gewonnenen Run oder ab Rang 10.</small>
      </section>`;
    }
    const refs = GL.meta.squadRefs(profile);
    const pool = GL.meta.squadPool(profile);
    const ids = GL.meta.squadIds(profile);
    const N = GL.meta.squadSize;
    const pick = pool.map(id => {
      const d = id === 'self' ? avatarOf(profile) : crewData(id);
      const dd = id === 'self' ? { type: profile.char.type, role: profile.char.role } : d;
      const k = ids.indexOf(id);
      return `<button class="sq-pick${k >= 0 ? ' on' : ''}" data-act="squad-toggle" data-id="${id}" title="${esc(d.name)}">
        ${k >= 0 ? `<em class="sq-num">${k + 1}</em>` : ''}<i>${GL.sprites.render(d)}</i>
        <small>${esc(d.name)}</small>${badge(dd.type)}</button>`;
    }).join('');
    const w = profile.squadW || 0, l = profile.squadL || 0;
    return `<section class="hq-sec squad-sec">
      <div class="squad-head">
        <div><span class="event-kicker">Deine Stammcrew</span>
          <b class="squad-power">⚔ ${GL.meta.squadPower(refs)} Stärke</b>
          <small>Level ${GL.meta.squadLevel(profile)} · ${w} Siege, ${l} Niederlagen</small></div>
        ${(() => { const r = profile.squadRating == null ? 1000 : profile.squadRating; const L = GL.meta.league(r); const nx = GL.meta.leagues.find(x => x.min > r);
          return `<div class="sq-league">${leagueChip(r, true)}<small>${nx ? `noch ${nx.min - r} bis ${nx.name}` : 'höchste Liga'}</small></div>`; })()}
      </div>
      ${squadRow(refs)}
      <button class="btn squad-match" data-act="squad-match">⚔ Gegner suchen <small>ähnliche Stärke</small></button>
      <div class="sq-xp">${refs.map(r => { const nx = GL.meta.squadNext((profile.squadXp || {})[r.id]);
        return `<span><small>${esc(r.name)}</small><i class="xpbar"><i style="width:${nx ? Math.round(100 * nx.have / nx.need) : 100}%"></i></i></span>`; }).join('')}</div>
      <p class="hint">Freunde fordern deine Stammcrew in der Rangliste heraus, auch wenn du offline bist. Jedes Duell gibt EP (Sieg 12, Niederlage 4) und damit Extra-Level. Bis zu ${N} Figuren, <b>zuerst gewählt steht vorne</b>.</p>
      <div class="sq-pool">${pick}</div>
    </section>`;
  }
  function duelReport(res, theirName) {
    const lines = [];
    const nm = (side, i) => { const r = (side === 'crew' ? res.me : res.foe)[i]; return r ? r.name : '?'; };
    res.events.forEach(e => {
      if (lines.length >= 8) return;
      if (e.k === 'ult') lines.push(`<li class="${e.side === 'crew' ? 'us' : 'them'}">⚡ ${esc(nm(e.side, e.from))}: <b>${esc(e.name)}</b></li>`);
      if (e.k === 'hit' && e.hp <= 0) lines.push(`<li class="${e.side === 'crew' ? 'us' : 'them'}">✖ ${esc(nm(e.side === 'crew' ? 'enemy' : 'crew', e.to))} ist k.o.</li>`);
      if (e.k === 'dmg' && e.list) e.list.filter(x => x.hp <= 0).forEach(x => lines.push(`<li class="${e.side === 'crew' ? 'them' : 'us'}">✖ ${esc(nm(e.side, x.to))} ist k.o.</li>`));
    });
    const mvp = res.me[res.mvp];
    return `<div class="duel-res ${res.win ? 'won' : 'lost'}">
      <b class="duel-verdict">${res.win ? 'Sieg!' : 'Niederlage'}</b>
      <small>${res.win ? `Deine Stammcrew hat ${esc(theirName)} geschlagen.` : `${esc(theirName)} war diesmal stärker. Probier eine andere Reihenfolge.`}</small>
      <div class="duel-teams"><div><span class="lbl">Du</span>${squadRow(res.me, res.me.map(r => r.hp))}</div>
        <div><span class="lbl">${esc(theirName)}</span>${squadRow(res.foe, res.foe.map(r => r.hp))}</div></div>
      ${mvp ? `<p class="duel-mvp">MVP: <b>${esc(mvp.name)}</b> mit ${res.dealt.crew[res.mvp]} Schaden</p>` : ''}
      <ol class="duel-log">${lines.join('')}</ol>
    </div>`;
  }

  // Visitenkarte eines Spielers: aus der Rangliste anklickbar, zeigt Werte, Artefakte und seltene Items
  function vaultChip(v) {
    const art = (GL.data.artifacts || []).find(a => a.id === v.id);
    if (!art) return '';
    return `<span class="vc-chip">${artIcon(art)}<b>${esc(art.name)}</b><small>Stufe ${v.lvl}</small></span>`;
  }
  function chestChip(it) {
    const d = (GL.data.items || []).find(x => x.id === it.id) || {};
    const rid = GL.config.rarities[Math.max(0, it.r)].id;
    return `<span class="vc-chip ir-${rid}">${itemIcon(it)}<b>${esc(d.name || it.id)}${it.lvl ? ' +' + it.lvl : ''}</b>${rarityPill(it.r)}</span>`;
  }
  function playerCard(x, isMe, ui) {
    const sf = ui && ui.squadFight && ui.squadFight.id === x.id ? ui.squadFight : null;
    const res = sf ? sf.res : null;
    // Während der Kampf läuft: Kampffeld (einmal erzeugt, damit die Animation nicht neu startet)
    if (sf && sf.playing) {
      if (!sf.html) sf.html = `<div class="pcard-bg duel-bg"><div class="pcard duel-play" data-act="noop">
          <div class="duel-vs"><b>Du</b><span>VS</span><b>${esc(x.name || 'Gegner')}</b></div>
          ${GL.arena.html(sf.dRun, { crewHp: sf.dRun.crew.map(u => u.max), enemyHp: sf.dRun.battle.enemies.map(u => u.max), done: false })}
          <div class="duel-bar"><span id="duel-log">Der Kampf beginnt!</span><button class="btn mini ghost" data-act="duel-skip">Überspringen</button></div>
        </div></div>`;
      return sf.html;
    }
    const meOn = GL.meta.squadUnlocked(ui && ui.profile ? ui.profile : {});
    const sq = (x.squadOn || x.npc) && (x.squad || []).length
      ? `<div class="pcard-sec"><b>Stammcrew ${leagueChip(x.squadRating, true)} ${x.squadPower ? `<small>⚔ ${x.squadPower} Stärke</small>` : ''}</b>${squadRow(x.squad)}
          ${isMe ? '' : meOn ? `<button class="btn pcard-duel" data-act="squad-fight" data-id="${esc(x.id)}">⚔ ${res ? 'Nochmal herausfordern' : 'Herausfordern'}</button>` : '<small class="muted">Herausfordern geht nach deinem ersten gewonnenen Run oder ab Rang 10.</small>'}</div>`
      : '';
    if (res) return `<div class="pcard-bg" data-act="lb-view-close"><div class="pcard" data-act="noop">
        <button class="link pcard-close" data-act="lb-view-close">✕</button>
        ${duelReport(res, x.name || 'Gegner')}
        ${sf && sf.ratingDelta != null ? `<p class="duel-rating">Crew-Rating ${sf.ratingDelta >= 0 ? '+' : ''}${sf.ratingDelta} → ${leagueChip(ui.profile.squadRating, true)}</p>` : ''}
        ${sf && sf.xp ? `<p class="duel-xp">Stammcrew-EP: +${sf.xp.gain} für jede Figur${sf.xp.ups.length ? ` · <b>Level-up: ${sf.xp.ups.map(esc).join(', ')}</b>` : ''}</p>` : ''}
        <div class="duel-actions"><button class="btn" data-act="squad-fight" data-id="${esc(x.id)}">⚔ Nochmal</button>
          <button class="btn ghost" data-act="squad-back">Zur Visitenkarte</button></div>
      </div></div>`;
    return playerCardBody(x, isMe, sq);
  }
  function playerCardBody(x, isMe, sq) {
    const fmt = n => Number(n || 0).toLocaleString('de-DE');
    const cap = crewData(x.captain || (x.best && x.best.captain));
    return `<div class="pcard-bg" data-act="lb-view-close">
      <div class="pcard" data-act="noop">
        <button class="link pcard-close" data-act="lb-view-close">✕</button>
        <div class="pcard-top">
          <span class="pcard-cap">${x.look ? portrait(x.look, x.cos, 'lg') : cap ? GL.sprites.render(cap) : ''}</span>
          <b class="pcard-name">${medal(GL.meta.rankIndex({ rankXp: x.rankXp || 0 }), 'small')} ${esc(x.name || 'Unbekannter Pirat')}${onDot(x)} ${badgeIcon(x.cos, true)}${isMe ? ' <em>du</em>' : ''}</b>
          ${x.cos && x.cos.star ? '<span class="admin-tag big">★ Entwickler · hat dieses Spiel gebaut</span>' : ''}
          <small>${x.cos && x.cos.title ? esc(titleName(x.cos.title)) + ' · ' : ''}${esc(x.rank || '')}</small>
        </div>
        <div class="pcard-stats">
          <div><b>${fmt(x.score)}</b><span>Bestwert</span></div>
          <div><b>${fmt(x.wins)}</b><span>Siege</span></div>
          <div><b>${fmt(x.runs)}</b><span>Runs</span></div>
          <div><b>${fmt(x.maxHit)}</b><span>Härtester Treffer</span></div>
          <div><b>${fmt(x.kos)}</b><span>K.o.s</span></div>
          <div><b>${fmt(x.topBounty)}</b><span>Mio. ฿ Kopfgeld</span></div>
        </div>
        ${(x.showcase || []).length ? `<div class="pcard-sec showcase"><b>Vitrine</b><div class="vc-row">${x.showcase.map(id => { const l = lootDef(id); return l ? `<span class="sc-item lr-${l.r}">${lootArt(l)}<small>${esc(l.name)}</small></span>` : ''; }).join('')}</div></div>` : ''}
        ${(x.vaultTop || []).length ? `<div class="pcard-sec"><b>Artefakte</b><div class="vc-row">${x.vaultTop.map(vaultChip).join('')}</div></div>` : ''}
        ${(x.chestTop || []).length ? `<div class="pcard-sec"><b>Seltene Funde</b><div class="vc-row">${x.chestTop.map(chestChip).join('')}</div></div>` : ''}
        ${sq}
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
    const isDaily = cat.id === 'daily';
    const isCrew = cat.id === 'squadRating' || cat.id === 'squadW';
    dailyCodeShown = GL.daily.code(ui.dailyDay === 'y' ? yesterday() : GL.daily.today());
    let rows = (st.rows || []).slice().sort((a, b) => (Number(cat.get(b)) || 0) - (Number(cat.get(a)) || 0));
    if (isDaily) rows = rows.filter(x => x.duels && x.duels[dailyCodeShown]);
    const MAIN = ['score', 'daily', 'rankXp', 'topBounty', 'squadRating'];
    const chip = c => `<button class="lb-cat${c.id === cat.id ? ' on' : ''}" data-act="lb-cat" data-id="${c.id}">${c.name}</button>`;
    const more = LB_CATS.filter(c => !MAIN.includes(c.id));
    const chips = `<div class="lb-cats" role="tablist">${LB_CATS.filter(c => MAIN.includes(c.id)).map(chip).join('')}
      <details class="lb-more"${more.some(c => c.id === cat.id) ? ' open' : ''}><summary>Mehr</summary><div class="lb-cats">${more.map(chip).join('')}</div></details></div>`;
    const row = (x, k, value, unit, extra) => {
      const b = x.best || {};
      const cap = crewData(x.avatar) || (b.captain ? crewData(b.captain) : null);
      return `<li class="lb-row${x.id === st.uid ? ' me' : ''}${k < 3 ? ' top' + (k + 1) : ''}${x.cos && x.cos.bg ? ' rowbg-' + x.cos.bg : ''}" data-act="lb-view" data-id="${esc(x.id)}" tabindex="0" role="button">
        <span class="lb-pos">${k + 1}</span>
        <span class="lb-cap">${x.look ? portrait(x.look, x.cos, 'sm') : cap ? GL.sprites.render(cap) : ''}</span>
        <span class="lb-who"><b>${medal(GL.meta.rankIndex({ rankXp: x.rankXp || 0 }), 'tiny')} ${esc(x.name || 'Unbekannter Pirat')}${onDot(x)} ${badgeIcon(x.cos)}${x.id === st.uid ? ' <em>du</em>' : ''}${x.cos && x.cos.star ? ' <em class="admin-tag" title="Der Entwickler dieses Spiels. Unbesiegbar (fast).">★ Entwickler</em>' : ''}${(x.showcase || []).length ? `<span class="lb-show">${x.showcase.map(lootChip).join('')}</span>` : ''}</b>
          ${isDaily ? dailyLine(x.duels[dailyCodeShown]) : isCrew && x.squadOn && (x.squad || []).length ? `<span class="lb-crew">${squadMini(x.squad)}${leagueChip(x.squadRating)}</span>` : journey(x)}</span>
        <span class="lb-score"><b>${fmt(value)}</b><small>${unit}</small></span>
      </li>`;
    };
    const dayTabs = isDaily ? `<div class="lb-cats day-tabs"><button class="lb-cat${ui.dailyDay !== 'y' ? ' on' : ''}" data-act="daily-day" data-id="t">Heute</button><button class="lb-cat${ui.dailyDay === 'y' ? ' on' : ''}" data-act="daily-day" data-id="y">Gestern</button>
      <small class="muted">Alle spielen dieselbe Route. Belohnung für die Plätze gibt es am nächsten Tag.</small></div>` : '';
    const table = isDaily && !rows.length ? `${dayTabs}<p class="muted">${ui.dailyDay === 'y' ? 'Gestern hat niemand die Tageskarte gespielt.' : 'Heute noch keine Ergebnisse. Sei der Erste!'}</p>` : rows.length
      ? `${dayTabs}<ol class="lb-list">${rows.map((x, k) => row(x, k, cat.get(x), cat.unit,
          `${x.wins || 0} / ${x.runs || 0} Siege`)).join('')}</ol>`
      : `<p class="muted">${st.status === 'ready' ? 'Noch keine Einträge. Beende einen Run, um der Erste zu sein!' : ''}</p>`;

    // Duelle: alle Codes, bei denen du oder andere mitgespielt haben
    const codes = {};
    (st.rows || []).forEach(x => Object.keys(x.duels || {}).filter(c => !/^T\d{8}$/.test(c)).forEach(c => { codes[c] = (codes[c] || 0) + 1; }));
    const myCodes = mine ? Object.keys(mine.duels || {}).filter(c => !/^T\d{8}$/.test(c)) : [];
    const shown = ui.duelView && codes[ui.duelView] ? ui.duelView : (myCodes[myCodes.length - 1] || Object.keys(codes)[0]);
    const duelRows = shown ? (st.rows || []).filter(x => x.duels && x.duels[shown])
      .sort((a, b) => b.duels[shown].score - a.duels[shown].score) : [];
    const duelBox = `<div class="duel-box">
      <div class="duel-head"><b>Wettfahrt mit Freunden</b><small>Starte eine Fahrt und schick deinem Kumpel den Code. Ihr spielt exakt dieselbe Route, ohne Ausbauten. Wer mehr Punkte holt, gewinnt. (Hat nichts mit der Stammcrew zu tun.)</small></div>
      <div class="duel-actions">
        <button class="btn" data-act="duel-new">Neue Wettfahrt starten</button>
        <span class="duel-join"><input id="duel-code" maxlength="8" placeholder="Code vom Freund" value="${esc(ui.duelInput || '')}">
        <button class="btn ghost" data-act="duel-join">Annehmen</button></span>
      </div>
      ${Object.keys(codes).length ? `<div class="lb-cats duel-codes">${Object.keys(codes).map(c =>
        `<button class="lb-cat${c === shown ? ' on' : ''}" data-act="duel-view" data-id="${esc(c)}">${esc(c)} <small>${codes[c]}</small></button>`).join('')}</div>` : ''}
      ${duelRows.length ? `<ol class="lb-list">${duelRows.map((x, k) => row(x, k, x.duels[shown].score, 'Punkte',
        `${x.duels[shown].won ? 'Grand Line geschafft' : 'bis ' + esc(x.duels[shown].island || '?')} · ${fmt(x.duels[shown].dmg)} Schaden`)).join('')}</ol>
        <button class="btn mini ghost" data-act="duel-copy" data-id="${esc(shown)}">Code ${esc(shown)} teilen</button>` : ''}
    </div>`;

    return `<section class="hq-sec leaderboard">
      <p class="hint">${info}</p>
      ${nameBox}
      ${myCard(profile, mine, best, fmt)}
      <div class="lbl">Rangliste</div>
      ${chips}
      ${table}
      ${(() => {
        const top = (st.rows || []).filter(x => x.squadOn && (x.squad || []).length).sort((a, b) => (b.squadRating || 1000) - (a.squadRating || 1000)).slice(0, 3);
        if (!top.length) return '';
        const order = top.length === 3 ? [top[1], top[0], top[2]] : top;
        return `<div class="podium"><div class="lbl">Stärkste Stammcrews</div><div class="pod-row">${order.map(x => {
          const place = top.indexOf(x) + 1;
          return `<button class="pod p${place}" data-act="lb-view" data-id="${esc(x.id)}">
            <span class="pod-crew">${squadMini(x.squad)}</span>
            <b>${esc(x.name || 'Pirat')}</b>${leagueChip(x.squadRating, true)}
            <span class="pod-step">${place}</span></button>`; }).join('')}</div></div>`;
      })()}
      ${duelBox}
      <p class="muted lb-note">Punkte: 100 pro Etappe, 500 pro Inselboss, 2 pro Million Kopfgeld. Höhere Kopfgeld-Stufen zählen mehr.</p>
    </section>`;
  }

  // ---------- Schmiede: Ausrüstung behalten, verbessern, mitnehmen ----------
  function forgeSection(profile) {
    const chest = (profile.chest || []).slice().sort((a, b) => b.r - a.r || (b.lvl || 0) - (a.lvl || 0));
    const slots = GL.meta.itemSlots(profile);
    const used = (profile.itemLoadout || []).length;
    const fmt = n => n.toLocaleString('de-DE');
    const cards = chest.map(it => {
      const on = (profile.itemLoadout || []).includes(it.uid);
      const cost = GL.meta.forgeCost(it);
      const btns = `<span class="forge-btns">
        <button class="btn mini${on ? '' : ' ghost'}" data-act="toggle-item" data-id="${it.uid}"${!on && used >= slots ? ' disabled' : ''}>${on ? 'Kommt mit' : 'Mitnehmen'}</button>
        ${cost != null ? `<button class="btn mini buy" data-act="forge" data-id="${it.uid}"${profile.berry < cost ? ' disabled' : ''}>⚒ ${GL.sprites.coin()} ${fmt(cost)}</button>` : '<small class="muted">Max.</small>'}
        <button class="link" data-act="scrap" data-id="${it.uid}" title="Einschmelzen für Berry">einschmelzen</button></span>`;
      return itemCard(it, btns, on ? 'on' : '');
    }).join('');
    const R = GL.config.rarities;
    const fuseBar = R.slice(0, -1).map((rr, r) => {
      const n = GL.meta.fusable(profile, r).length;
      const cost = GL.meta.fuseCost(r);
      const ok = n >= 3 && profile.berry >= cost;
      return `<div class="fuse-step ir-${rr.id}${ok ? ' ready' : ''}">
        <span class="fuse-from">${rarityPill(r)} <small>${n >= 3 ? `${n} da` : `${n} von 3`}</small></span><span class="fuse-arrow">→</span>${rarityPill(r + 1)}
        <button class="btn mini${ok ? '' : ' ghost'}" data-act="fuse" data-r="${r}"${ok ? '' : ' disabled'}>Verschmelzen · ${GL.sprites.coin()} ${cost}</button>
      </div>`;
    }).join('');
    return `<section class="hq-sec">
      <div class="fuse-box"><b>Verschmelzen</b><small>3 Teile gleicher Seltenheit (nicht ausgewählt, niedrigste Stufe zuerst) werden zu 1 zufälligen Teil der nächsten Seltenheit.</small>${fuseBar}</div>
      <p class="hint">Ausrüstung aus deinen Runs landet hier. Verbessere sie mit Berry (bis +${GL.config.items.maxLevel}) und nimm bis zu <b>${slots}</b> Stück in den nächsten Run mit (mehr Plätze ab Rang 6, 11, 16, 21). Im Run legst du sie im Steckbrief einer Figur an.</p>
      ${chest.length ? `<div class="item-grid">${cards}</div>` : '<p class="muted">Noch leer. Besiege Kopfgeld-Ziele und Bosse, dann füllt sich die Truhe.</p>'}
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
    const nextSlotRank = [5, 10, 15, 20].find(k => k > GL.meta.rankIndex(profile));
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
      ${profile.artLoadout.length ? `<div class="vault-active"><b>Aktive Boni im nächsten Run</b><ul>${profile.artLoadout.map(id => {
        const a = A.find(x => x.id === id); if (!a) return '';
        const lv = GL.meta.artLevel(profile, id);
        return `<li><span class="va-ico">${artIcon(a)}</span><span><b>${a.name}</b> <small>Stufe ${lv}</small><br>${fmtArt(a, GL.run.artValue(a, lv))}</span></li>`;
      }).join('')}</ul></div>` : ''}
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
    dismissOnTap(el);
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3150);
  }

  // Schalter für den Streamer-Modus
  // Vollbild: auf Handys ohne Vollbild-Funktion (iPhone) Tipp für den Home-Bildschirm
  const fsApp = () => { try { return matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone; } catch (e) { return false; } };
  const touchDev = () => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };
  function fsLink() {
    if (fsApp() || !touchDev()) return '';   // am PC kein Vollbild: das Spiel bleibt hochkant
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
      const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
      return `<button class="link ts-fs" data-act="fullscreen">${on ? 'Vollbild beenden' : '⛶ Vollbild'}</button>`;
    }
    return `<small class="ts-fs-tip">Tipp für Vollbild: Teilen → „Zum Home-Bildschirm“</small>`;
  }
  function streamToggle() {
    const on = streamOn();
    return `<button class="stream-tg${on ? ' on' : ''}" data-act="stream-toggle" aria-pressed="${on}">
      <span class="st-ico" aria-hidden="true">🎥</span><span>Streamer-Modus</span><i class="st-sw" aria-hidden="true"></i></button>`;
  }

  // Persönlicher Spielercode im Profil: verdeckt, antippen zum Anzeigen
  function codeBox(profile, ui) {
    if (!profile.playerCode || GL.sandbox.on()) return '';
    const st = GL.online ? GL.online.state() : {};
    if (streamOn()) return `<div class="code-box">
      <div class="cb-head"><b>🔑 Dein Spielercode</b></div>
      <div class="cb-code locked">•••-•••<small>🎥 Im Streamer-Modus verborgen</small></div>
      <div class="cb-actions"><button class="btn mini ghost" data-act="code-copy">Kopieren</button>${streamToggle()}</div>
    </div>`;
    const shown = ui && ui.codeShow;
    return `<div class="code-box">
      <div class="cb-head"><b>🔑 Dein Spielercode</b>${st.codeReady === false ? `<em class="cb-warn">${esc(st.codeError || 'Abgleich noch nicht eingerichtet')}</em>` : !profile.codeClaimed ? '<em class="cb-wait">wird eingerichtet …</em>' : ''}</div>
      <button class="cb-code${shown ? ' on' : ''}" data-act="${shown ? 'code-copy' : 'code-show'}" aria-label="${shown ? 'Spielercode kopieren' : 'Spielercode anzeigen'}">${shown ? esc(profile.playerCode) : '•••-•••'}<small>${shown ? '📋 antippen zum Kopieren' : '👁 antippen zum Anzeigen'}</small></button>
      <p class="cb-warn-txt">⚠ Zeig diesen Code niemandem. Er ist wie ein Passwort: Wer ihn hat, spielt mit deinem Account. Damit meldest du dich auf jedem Gerät an, dein Fortschritt gleicht sich dann automatisch ab.</p>
      <div class="cb-actions">${shown ? '<button class="btn mini ghost" data-act="code-show">Verbergen</button>' : '<button class="btn mini ghost" data-act="code-copy">Kopieren</button>'}<button class="btn mini ghost" data-act="code-mail">An mich mailen</button>${streamToggle()}</div>
    </div>`;
  }

  // Eine Zeile: mit welcher Mail ist dieser Account verbunden?
  function accountLine() {
    const st = GL.online ? GL.online.state() : {};
    if (GL.sandbox.on()) return '';
    if (st.backend !== 'supabase') return '';
    return !st.anon && st.email
      ? `<p class="acc-line">✓ Angemeldet: <b>${mailOut(st.email)}</b> <button class="link" data-act="login-open">Konto</button></p>`
      : `<p class="acc-line">Noch nicht mit einer Mail verbunden. <button class="link" data-act="login-open">Jetzt sichern</button></p>`;
  }

  // Auf allen Geräten spielen: Kurzstatus im Profil, das eigentliche Anmelden läuft über den Login-Screen
  function devicesBox() {
    const st = GL.online ? GL.online.state() : {};
    if (GL.sandbox.on()) return '';
    if (st.backend !== 'supabase') return `<div class="dev-box"><b>Auf allen Geräten spielen</b><small>Geht auf der Website (flexibeel.github.io/Grandline).</small></div>`;
    if (!st.anon && st.email) return `<div class="dev-box ok"><b>Account ✓</b><small>Angemeldet als ${mailOut(st.email)}. Dein Fortschritt ist auf allen Geräten da.</small></div>`;
    return `<div class="dev-box"><b>Auf allen Geräten spielen</b>
      <small>Mit einer E-Mail spielst du auf Handy und PC mit demselben Piraten weiter. Kein Passwort nötig.</small>
      <button class="btn ghost" data-act="login-open">Account einrichten</button></div>`;
  }

  // ---------- Startbildschirm und Profil ----------
  // Eigener Pirat als Avatar (sonst der erste Kapitän)
  const DEFAULT_LOOK = { hair: '#6b4a2a', skin: '#f2c9a0', shirt: '#2f6fb0', pants: '#3b5a8c', hat: 'band', hatColor: '#c0392b' };
  function lookOf(profile) { return (profile.char && profile.char.look) || DEFAULT_LOOK; }
  function avatarOf(profile) { return { id: 'self', name: profile.nickname || 'Pirat', look: lookOf(profile) }; }
  function cosOf(profile) { return Object.assign({ bg: 'meer', frame: 'holz', anim: 'ruhig', title: 'neuling', flag: 'keine' }, profile.cos || {}); }
  function titleName(id) { const t = GL.data.cosmetics.titles.find(x => x.id === id); return t ? t.name : ''; }
  // Kleines Porträt mit Hintergrund, Rahmen und Animation (Profil, Rangliste, Startbildschirm)
  function portrait(look, cos, size) {
    const c = Object.assign({ bg: 'meer', frame: 'holz', anim: 'ruhig', flag: 'keine' }, cos || {});
    const flag = c.flag && c.flag !== 'keine' ? `<i class="pflag fl-${c.flag}" aria-hidden="true"></i>` : '';
    const star = c.star ? ' star-power' : '';
    return `<span class="portrait bg-${c.bg} fr-${c.frame} an-${c.anim}${star}${size ? ' ' + size : ''}">${GL.sprites.render({ id: 'self', look: look || DEFAULT_LOOK })}${flag}${c.star ? '<i class="star-tag" aria-hidden="true">★</i>' : ''}</span>`;
  }
  // Easter Egg: nur der Entwickler (Account westerholt.felix…) darf den Regenbogen-Stern einschalten
  function isAdmin() {
    const st = GL.online ? GL.online.state() : {};
    return !!(st.email && /^westerholt\.felix/i.test(st.email));
  }
  // Spielstände: bis zu 3 Piraten, Platz 1 ist der Hauptpirat
  function slotsBox(uiRef) {
    const cur = GL.slots.active();
    const rows = [];
    for (let i = 0; i < GL.slots.max; i++) {
      const s = GL.slots.info(i), act = i === cur, armed = uiRef && uiRef.slotDel === i;
      rows.push(`<div class="slot-row${act ? ' on' : ''}">
        <span class="sr-av">${s && s.look ? GL.sprites.render({ id: 'self', look: s.look }) : '<i class="sr-empty">+</i>'}</span>
        <span class="sr-txt"><b>${s ? esc(GL.safeName ? GL.safeName(s.name) : s.name) : 'Freier Platz'}</b>
          <small>${i === 0 ? 'Hauptpirat · online' : 'Nur dieses Gerät'}${s ? ` · Rang ${GL.meta.rankIndex({ rankXp: s.rankXp }) + 1}` : ''}</small></span>
        ${act ? '<em class="sr-cur">Aktiv</em>'
          : `<button class="btn mini${s ? ' ghost' : ''}" data-act="slot-switch" data-i="${i}">${s ? 'Spielen' : 'Neu starten'}</button>${s && i !== 0 ? `<button class="btn mini ghost danger-btn" data-act="slot-del" data-i="${i}" aria-label="Spielstand löschen">${armed ? 'Sicher?' : '🗑'}</button>` : ''}`}
      </div>`);
    }
    return `<div class="slots-box"><b>Spielstände</b><small>Probier andere Kapitäne aus. Zweitpiraten zählen nicht für die Rangliste.</small>${rows.join('')}</div>`;
  }
  function adminBox(profile) {
    if (!isAdmin()) return '';
    const on = !!(profile.cos && profile.cos.star);
    return `<div class="admin-box"><span class="portrait sm star-power demo">${GL.sprites.render({ id: 'self', look: lookOf(profile) })}</span>
      <span><b>Entwickler-Modus</b><small>Regenbogen-Stern wie in Mario Kart. Alle sehen ihn in der Rangliste. Nur du kannst ihn einschalten.</small></span>
      <button class="btn mini${on ? '' : ' ghost'}" data-act="admin-star">${on ? '★ An' : 'Aus'}</button></div>
      <div class="admin-box"><span class="admin-ico" aria-hidden="true">🧪</span>
      <span><b>Als neuer Spieler testen</b><small>Startet einen frischen Piraten in einem freien Spielstand. Dein Hauptpirat bleibt unberührt. Zurück über „Spielstände“.</small></span>
      <button class="btn mini ghost" data-act="slot-fresh">Starten</button></div>`;
  }
  function profileChip(profile) {
    const rp = GL.meta.rankProgress(profile);
    const pct = rp.next ? Math.min(100, 100 * rp.have / rp.need) : 100;
    return `<button class="pf-chip" data-act="profile-edit" title="Profil bearbeiten">
      ${portrait(lookOf(profile), cosOf(profile), 'sm')}
      <span class="pf-txt"><b>${esc(profile.nickname || 'Neuer Pirat')}</b>
        <small>${esc(titleName(cosOf(profile).title))} · Rang ${rp.i + 1}</small>
        <i class="pf-xp"><i style="width:${pct}%"></i></i></span>
    </button>`;
  }
  function titleScreen(run, profile) {
    const W = GL.world && GL.world.title ? GL.world.title : 'Grand Line';
    const ids = GL.config.starters.slice();
    const crew = (profile.char ? [avatarOf(profile)] : []).concat(ids.map(id => crewData(id))).slice(0, 4)
      .map(dd => `<span class="ts-hop">${GL.sprites.render(dd)}</span>`).join('');
    const st = GL.online ? GL.online.state() : { status: 'local', rows: [] };
    const players = (st.rows || []).length;
    return `<div class="ts-inner">
      <div class="ts-top">${profile.nickname ? profileChip(profile) : '<span></span>'}</div>
      <div class="ts-logo"><b>${esc(W)}</b><small>Ein Piraten-Roguelike</small></div>
      <div class="ts-scene" aria-hidden="true">
        <div class="ts-sun"></div>
        <div class="ts-ship">${GL.sprites.ship()}</div>
        <div class="ts-sea"></div>
        <div class="ts-crew">${crew}</div>
      </div>
      <div class="ts-menu">
        <button class="btn ts-play" data-act="title-play">${run ? 'Weiterspielen' : profile.nickname ? 'Spielen' : 'Neues Spiel'} ${keyHint('Leertaste')}</button>
        <div class="ts-row">
          ${GL.meta.featureOpen(profile, 'rangliste') ? `<button class="btn ghost" data-act="title-go" data-tab="rangliste">Rangliste${players ? ` <small>${players}</small>` : ''}</button>` : `<button class="btn ghost locked" data-act="title-go" data-tab="rangliste" title="Ab Rang 2">Rangliste <small>ab Rang 2</small></button>`}
          <button class="btn ghost" data-act="title-go" data-tab="album">Sammelalbum</button>
          <button class="btn ghost" data-act="intro-open">Anleitung</button>
        </div>
        <button class="link ts-login" data-act="login-open">${st.anon === false && st.email ? 'Angemeldet ✓' : 'Anmelden'}</button>
        <div class="ts-small"><button class="link ts-notes" data-act="notes-open">Neuigkeiten${profile.nickname && profile.notesSeen !== GL.version ? ' <i class="new-dot"></i>' : ''}</button><button class="link ts-reload" data-act="reload">↻ Neu laden</button>${fsLink()}${streamToggle()}</div>
      </div>
      <p class="ts-foot">Inoffizielles Fanprojekt, kostenlos und ohne kommerzielle Absicht. One Piece gehört seinen Rechteinhabern. <a href="legal.html">Rechtliches &amp; Datenschutz</a></p>
    </div>`;
  }
  // Spielstand per Code übertragen (ohne Mail)
  function transferBox(profile, ui) {
    return `<details class="login-transfer"${ui && ui.transferOpen ? ' open' : ''}><summary>Ohne Mail: Spielstand per Code übertragen</summary>
      <p class="hint">Auf dem alten Gerät „Code kopieren“, den Code an dich selbst schicken (z. B. WhatsApp), hier einfügen.</p>
      ${profile.nickname ? `<button class="btn ghost mini" data-act="xfer-copy">📋 Code kopieren</button>${ui && ui.xferCode && !streamOn() ? `<textarea class="xfer-out" readonly>${esc(ui.xferCode)}</textarea>` : ''}` : ''}
      <textarea id="xfer-in" class="xfer-in" placeholder="Code hier einfügen (beginnt mit GL1.)"></textarea>
      <button class="btn mini" data-act="xfer-import">Spielstand übernehmen</button>
    </details>`;
  }
  function loginScreen(profile, ui) {
    const st = GL.online ? GL.online.state() : {};
    const back = `<button class="link login-back" data-act="login-back">‹ Zurück</button>`;
    const err = ui && ui.loginError ? `<p class="login-err">${esc(ui.loginError)}</p>` : '';
    if (st.backend !== 'supabase') {
      return `<div class="ts-inner login-card">${back}
        <div class="login-icon">⚓</div><h2>Anmelden</h2>
        <p class="hint">Geht nur auf der Website: flexibeel.github.io/Grandline</p></div>`;
    }
    if (!st.anon && st.email) {
      return `<div class="ts-inner login-card">${back}
        <div class="login-icon">✓</div><h2>Angemeldet</h2>
        <p class="hint">Angemeldet als <b>${mailOut(st.email)}</b>. Du bleibst angemeldet, bis du dich abmeldest. Auf jedem anderen Gerät reicht „Anmelden“ mit dieser Adresse.</p>
        <button class="btn" data-act="login-back">Fertig</button>
        ${transferBox(profile, ui)}
        <button class="link" data-act="logout">${ui && ui.logoutArmed ? 'Wirklich abmelden? Nochmal tippen' : 'Abmelden'}</button></div>`;
    }
    // Schritt 2: Mail ist raus, Code eintippen (oder Link in der Mail antippen)
    if (st.mailSent) {
      return `<div class="ts-inner login-card">${back}
        <div class="login-icon">✉</div><h2>Schau in dein Postfach</h2>
        <p class="hint">Mail an <b>${mailOut(st.mailSent)}</b> ist unterwegs. <b>Tippe in der Mail auf den Link</b>, dann bist du angemeldet. Am besten auf dem Gerät, auf dem du spielen willst.</p>
        <p class="login-alt">Keine Mail da? Spam-Ordner prüfen oder <button class="link" data-act="mail-again">andere Adresse / neu senden</button></p>
        ${transferBox(profile, ui)}
        ${GL.config.online && GL.config.online.mailCode ? `<details class="login-code"><summary>Ich habe einen Code in der Mail</summary>
          <div class="login-field"><input id="mail-code" class="code-input" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="123456"></div>
          <button class="btn login-main" data-act="mail-code">Bestätigen</button></details>` : ''}
      </div>`;
    }
    const codeLogin = `<div class="login-field">
        <input id="code-in" class="code-input" type="${streamOn() ? 'password' : 'text'}" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC-123" maxlength="9" enterkeyhint="go" aria-label="Spielercode">
      </div>
      ${ui && ui.codeError ? `<p class="login-err">${esc(ui.codeError)}</p>` : ''}
      <button class="btn login-main" data-act="code-login">Weiterspielen</button>
      <p class="login-alt">Deinen Code findest du auf dem anderen Gerät: Hauptquartier → Profil → 🔑 Spielercode.</p>`;
    return `<div class="ts-inner login-card">${back}
      <div class="login-icon">🔑</div><h2>Mit Spielercode anmelden</h2>
      ${codeLogin}
      <details class="login-more"${err ? ' open' : ''}><summary>Andere Wege</summary>
        <span class="lm-lbl">Per Mail (Link in der Mail antippen)</span>
        <div class="login-field"><input id="mail" type="${streamOn() ? 'password' : 'email'}" inputmode="email" placeholder="deine@email.de" autocomplete="email" aria-label="E-Mail-Adresse"></div>
        ${err}
        <button class="btn ghost login-main" data-act="mail-login">Link schicken</button>
        ${profile.nickname ? `<p class="login-alt"><button class="link" data-act="mail-link">Diesen Piraten mit der Mail sichern</button></p>` : ''}
        ${transferBox(profile, ui)}
      </details>
    </div>`;
  }
  function profileScreen(profile, ui) {
    const d = ui.draft;
    const P = GL.data.charParts;
    const vals = GL.meta.progressValues(profile);
    const sw = (part, list) => `<div class="sw-row"><span>${{ hair: 'Haare', skin: 'Haut', shirt: 'Oberteil', pants: 'Hose', hatColor: 'Hutfarbe' }[part]}</span>
      <div class="sw">${list.map(c => `<button class="sw-c${d.char.look[part] === c ? ' on' : ''}" style="background:${c}" data-act="char-part" data-part="${part}" data-v="${c}" aria-label="${c}"></button>`).join('')}</div></div>`;
    const hats = { '': 'Ohne', straw: 'Strohhut', band: 'Kopftuch', cap: 'Mütze', hood: 'Kapuze', afro: 'Locken' };
    const opt = (act, cur, list) => list.map(([id, name]) => `<button class="seg${cur === id ? ' on' : ''}" data-act="${act}" data-v="${id}">${name}</button>`).join('');
    const cosGrid = (kind, label, cls) => `<div class="cos-block"><span class="lbl">${label}</span><div class="cos-grid">${(kind === 'badges' ? GL.data.badges : GL.data.cosmetics[kind]).map(it => {
      const ok = GL.meta.cosmeticUnlocked(profile, it, vals);
      const on = d.cos[cls] === it.id;
      const prev = kind === 'titles' ? `<b class="cos-title">${esc(it.name)}</b>` : kind === 'badges' ? `<span class="badge-prev">${badgeSvg(it.id) || '–'}</span>`
        : portrait(d.char.look, Object.assign({}, d.cos, { [cls]: it.id }), 'xs');
      return `<button class="cos${on ? ' on' : ''}${ok ? '' : ' locked'}" data-act="cos-pick" data-kind="${cls}" data-v="${it.id}"${ok ? '' : ' disabled'} title="${esc(it.name)}${ok ? '' : ': ' + GL.meta.reqText(it)}">
        ${prev}<small>${ok ? esc(it.name) : '🔒 ' + GL.meta.reqText(it)}</small></button>`;
    }).join('')}</div></div>`;
    const def = GL.meta.selfDef(Object.assign({}, profile, { nickname: d.name || 'Pirat', char: d.char }));
    return `<div class="ts-inner pf-screen wide">
      <div class="pf-card">
        <span class="event-kicker">${profile.nickname ? 'Dein Pirat' : 'Erstelle deinen Piraten'}</span>
        <div class="pf-grid">
          <div class="pf-preview">
            ${portrait(d.char.look, d.cos, 'xl')}
            <b class="pf-prev-name">${esc(d.name || 'Dein Name')}</b>
            <small>${esc(titleName(d.cos.title))}</small>
            <div class="pf-stats"><span>❤ ${def.hp}</span><span>⚔ ${def.atk}</span><span>➤ ${def.spd}</span></div>
            <small class="muted">Spielbar als Kapitän. Wird mit jedem Piratenrang stärker.</small>
          </div>
          <div class="pf-form">
            <label for="pf-name">Piratenname</label>
            <input id="pf-name" maxlength="24" autocomplete="off" placeholder="z. B. Felix der Furchtlose" value="${esc(d.name || '')}">${ui.nameError ? `<p class="login-err">${esc(ui.nameError)}</p>` : ''}
            <span class="lbl">Kampfstil</span><div class="segs">${opt('char-type', d.char.type, [['kraft', 'Kraft'], ['klinge', 'Klinge'], ['technik', 'Technik']])}</div>
            <span class="lbl">Rolle</span><div class="segs">${opt('char-role', d.char.role, [['kaempfer', 'Kämpfer'], ['brecher', 'Brecher'], ['helfer', 'Helfer']])}</div>
            <span class="lbl">Aussehen</span>
            ${sw('hair', P.hair)}${sw('skin', P.skin)}${sw('shirt', P.shirt)}${sw('pants', P.pants)}
            <div class="sw-row"><span>Hut</span><div class="segs small">${opt('char-hat', d.char.look.hat || '', P.hat.map(h => [h, hats[h]]))}</div></div>
            ${d.char.look.hat ? sw('hatColor', P.hatColor) : ''}
          </div>
        </div>
        <div class="cos-all">
          <p class="hint">Alles hier sehen andere in der Rangliste. 🔒 zeigt, was dir noch fehlt.</p>
          ${cosGrid('backgrounds', 'Hintergrund', 'bg')}
          ${cosGrid('frames', 'Rahmen', 'frame')}
          ${cosGrid('animations', 'Animation', 'anim')}
          ${cosGrid('titles', 'Titel', 'title')}
          ${cosGrid('flags', 'Piratenflagge', 'flag')}
          ${cosGrid('badges', 'Abzeichen', 'badge')}
        </div>
        <div class="pf-actions">
          ${profile.nickname ? '<button class="btn ghost" data-act="title-back">Zurück</button>' : ''}
          <button class="btn" data-act="profile-save">${profile.nickname ? 'Speichern' : 'Profil erstellen'} ${keyHint('Enter')}</button>
        </div>
        ${profile.nickname ? accountLine() + dangerZone(ui) : ''}
      </div>
    </div>`;
  }

  // ---------- Piratenrang im Hauptquartier ----------
  // Medaille in Bronze, Silber, Gold oder Legende, darunter die Belohnungsstraße aller Ränge
  // 5 Stufen à 5 Ränge, jede mit eigenem Pixel-Emblem
  function rankTier(i) {
    return i >= 20 ? 'mythic' : i >= 15 ? 'legend' : i >= 10 ? 'gold' : i >= 5 ? 'silver' : 'bronze';
  }
  // Pixel-Embleme: linke Hälfte (6 Spalten), wird gespiegelt. O = Kontur, B = Körper, S = Symbol.
  // Körper wird automatisch schattiert (oben hell, unten dunkel), dazu eine Tiefenkante für den 3D-Look.
  const EMBLEMS = {
    bronze: ['...OOO', '.OOBBB', '.OBBBS', 'OBBBSB', 'OBBBBS', 'OBSSSS', 'OBBBBS', 'OBSBBS', 'OBBSSS', '.OBBBB', '.OOBBB', '...OOO'],
    silver: ['OOOOOO', 'OBBBBB', 'OBSBBB', 'OBBSBB', 'OBBBSB', 'OBBBBS', 'OBBBSB', 'OBBSBB', '.OBBBB', '.OBBBB', '..OOBB', '....OO'],
    gold:   ['.....O', '....OB', '...OBB', 'OOOOBB', 'OBBBBS', '.OBBSS', '..OBBS', '..OBBB', '.OBBOO', '.OBO..', 'OBO...', 'OO....'],
    legend: ['.O..OO', '.OBOBB', '.OBBBB', '.OOOOO', '..OBBB', '.OBBBB', '.OBSSB', '.OBSSB', '.OBBBS', '..OBBB', '..OBSB', '...OOO'],
    mythic: ['......', '...OOO', '..OBBB', '..OBBB', '..OSSS', 'OOOBBB', 'OBBBBB', '.OOOOO', '......', '......', '......', '......']
  };
  const EMB_COL = {
    bronze: { o: '#4a2a12', hi: '#f6c08a', mid: '#cf8446', sh: '#8a4a1e', s: '#fff1d6', depth: '#2e1808' },
    silver: { o: '#28303c', hi: '#ffffff', mid: '#c8d1db', sh: '#7d8896', s: '#2f5f8f', depth: '#161c24' },
    gold:   { o: '#5a3a00', hi: '#fff3b0', mid: '#f2b632', sh: '#b07812', s: '#e0483b', depth: '#3a2400' },
    legend: { o: '#1a1020', hi: '#ffffff', mid: '#e6def2', sh: '#a493c4', s: '#7a2fd0', depth: '#0c0612' },
    mythic: { o: '#3a2200', hi: '#fff3b0', mid: '#f2c94c', sh: '#c08a2e', s: '#d0303a', depth: '#241400' }
  };
  const embCache = {};
  function emblemSvg(tier) {
    if (embCache[tier]) return embCache[tier];
    const rows = EMBLEMS[tier].map(h => h + h.split('').reverse().join(''));
    const C = EMB_COL[tier];
    const cell = (x, y) => (rows[y] && rows[y][x]) || '.';
    const solid = ch => ch !== '.';
    let depth = '', px = '';
    rows.forEach((row, y) => row.split('').forEach((ch, x) => {
      if (!solid(ch)) return;
      depth += `<rect x="${x}" y="${y + 1}" width="1" height="1" fill="${C.depth}"/>`;
      let col = C.o;
      if (ch === 'S') col = C.s;
      else if (ch === 'B') {
        const up = cell(x, y - 1), down = cell(x, y + 1);
        col = (up === 'O' || up === '.') ? C.hi : (down === 'O' || down === '.') ? C.sh : C.mid;
      }
      px += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
    }));
    embCache[tier] = `<svg class="emb-svg" viewBox="0 -0.5 12 13.5" shape-rendering="crispEdges" aria-hidden="true">${depth}${px}</svg>`;
    return embCache[tier];
  }
  // Abzeichen als Pixelbild mit Tiefenkante (leichter 3D-Effekt)
  const badgeCache = {};
  function badgeSvg(id) {
    if (badgeCache[id] != null) return badgeCache[id];
    const b = (GL.data.badges || []).find(x => x.id === id);
    if (!b || !b.px.length) return (badgeCache[id] = '');
    let depth = '', px = '';
    b.px.forEach((row, y) => row.split('').forEach((ch, x) => {
      if (ch === '.' || !b.pal[ch]) return;
      depth += `<rect x="${x}" y="${y + 1}" width="1" height="1" fill="rgba(40,25,10,.35)"/>`;
      px += `<rect x="${x}" y="${y}" width="1" height="1" fill="${b.pal[ch]}"/>`;
    }));
    return (badgeCache[id] = `<svg class="badge-svg" viewBox="0 0 12 13" shape-rendering="crispEdges" aria-hidden="true">${depth}${px}</svg>`);
  }
  function badgeIcon(cos, big) {
    const id = cos && cos.badge;
    if (!id || id === 'keins') return '';
    const b = (GL.data.badges || []).find(x => x.id === id);
    return b ? `<span class="badge-ico${big ? ' big' : ''}" data-tip="${esc(b.name)}: ${esc(b.desc)}">${badgeSvg(id)}</span>` : '';
  }
  function medal(i, cls) {
    const t = rankTier(i);
    const step = Math.min(4, i % 5);
    return `<span class="medal emb m-${t}${cls ? ' ' + cls : ''}" aria-hidden="true">${emblemSvg(t)}
      <span class="emb-pips">${'<i class="on"></i>'.repeat(step + 1)}${'<i></i>'.repeat(4 - step)}</span>
      <span class="emb-num">${i + 1}</span></span>`;
  }
  const TIER_NAME = { bronze: 'Bronze', silver: 'Silber', gold: 'Gold', legend: 'Legende', mythic: 'Mythisch' };
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
            <span class="event-kicker">Piratenrang ${rp.i + 1} von ${R.length} · ${TIER_NAME[rankTier(rp.i)]}</span>
            <b class="rank-name">${rp.rank.name}</b>
            <div class="xpbar big rank-bar"><i style="width:${rp.next ? pct : Math.round(100 * rp.have / rp.need)}%"></i><span class="rank-bar-txt">${fmt(rp.have)} / ${fmt(rp.need)} EP</span></div>
            <small>${rp.next ? `Nächster Rang: <b>${rp.next.name}</b>${rankReward(rp.next)}` : `<b>Prestige ${rp.prestige}</b>${rp.prestige ? '' : ' – du bist Piratenkönig!'} Weiter sammeln für Prestige ${rp.prestige + 1}.`}</small>
          </div>
          <div class="rank-perk"><b>+${bonus} %</b><small>Berry pro Run<br>(+2 % je Rang)</small></div>
        </div>
        <div class="rank-road" role="list" aria-label="Belohnungen der Ränge">${road}</div>
        <p class="rank-src">Rang-EP gibt es für jede Etappe, Kopfgeld-Ziele, Inselbosse, Raids und Siege. Höhere Kopfgeld-Stufen geben mehr.</p>
      </div>`;
  }

  // Kapitel-Fortschritt: pro Meer alle Bösewichte + Bosse über mehrere Runs besiegen
  function chapterPanel(profile) {
    const seas = GL.data.islands.map((isl, i) => [isl, i]);
    if (GL.meta.featureOpen(profile, 'route')) GL.data.islands.forEach(isl => { if (isl.alt) seas.push([isl.alt, isl.alt]); });
    const rows = seas.map(([isl, i]) => {
      const cp = GL.meta.chapterProgress(profile, i);
      return `<div class="chapter-row${cp.complete ? ' done' : ''}">
        <span class="chapter-name">${esc(isl.name)}${cp.complete ? ' ✓' : ''}</span>
        <div class="xpbar big chapter-bar"><i style="width:${cp.pct}%"></i><span class="rank-bar-txt">${cp.done} / ${cp.total}</span></div>
      </div>`;
    }).join('');
    return `<div class="chapter-panel">
      <span class="event-kicker">Kapitel-Fortschritt</span>
      <p class="hint">Besiege jeden Bösewicht und Boss eines Meeres einmal. Belohnung: Berry.</p>
      ${rows}
    </div>`;
  }

  // Account zurücksetzen oder löschen (auch im Profil-Editor)
  function dangerZone(uiRef) {
    const armed = uiRef && uiRef.accArmed;
    const lo = uiRef && uiRef.logoutArmed;
    return `<div class="danger-zone">
      <b>${GL.sandbox.on() ? 'Dieser Spielstand' : 'Account'}</b>
      ${GL.sandbox.on() ? '' : `<div class="dz-row dz-logout">
        <span><b>Abmelden</b><small>Nur auf diesem Gerät. Dein Fortschritt bleibt gespeichert, zurück kommst du mit deinem Spielercode.</small></span>
        <button class="btn mini ghost" data-act="logout">${lo ? 'Code notiert? Abmelden' : 'Abmelden'}</button>
      </div>`}
      <div class="dz-row">
        <span><b>Fortschritt zurücksetzen</b><small>Rang, Berry, Freischaltungen und Funde weg. Name und Aussehen bleiben.</small></span>
        <button class="btn mini ghost danger-btn" data-act="acc-reset">${armed === 'reset' ? 'Sicher? Nochmal klicken' : 'Zurücksetzen'}</button>
      </div>
      <div class="dz-row">
        <span><b>Account löschen</b><small>Alles weg, auch dein Eintrag in der Rangliste. Danach startest du als neuer Pirat.</small></span>
        <button class="btn mini ghost danger-btn" data-act="acc-delete">${armed === 'delete' ? 'Sicher? Nochmal klicken' : 'Löschen'}</button>
      </div>
    </div>`;
  }

  // Witziges Gimmick: wie viele andere Kopfgeldjäger gerade ungefähr unterwegs sind
  // (grob geschätzt: Profile, die in den letzten 10 Minuten etwas eingetragen haben)
  function atSeaBox() {
    const st = GL.online ? GL.online.state() : {};
    if (st.backend !== 'supabase') return '';
    const now = Date.now();
    const n = (st.rows || []).filter(x => x.updated && now - new Date(x.updated).getTime() < 10 * 60 * 1000 && x.id !== st.uid).length + 1;
    const txt = n === 1 ? 'Nur du auf See' : `${n} Kopfgeldjäger*innen auf See`;
    return `<span class="atsea" data-tip="Wer in den letzten 10 Minuten gespielt hat (du zählst mit). Aktualisiert sich von selbst."><i class="atsea-dot" aria-hidden="true"></i>${txt}</span>`;
  }

  // ---------- Raid-Beute: Pixelbild, Vitrine, Jagd-Ziel ----------
  const lootDef = id => (GL.data.huntLoot || []).find(x => x.id === id);
  function lootArt(l) {
    const P = GL.data.huntPal;
    let rects = '';
    l.art.forEach((row, y) => row.split('').forEach((ch, x) => { if (P[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${P[ch]}"/>`; }));
    return `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }
  const lootChip = id => { const l = lootDef(id); return l ? `<span class="loot-chip lr-${l.r}" title="${esc(l.name)}">${lootArt(l)}</span>` : ''; };
  function vitrine(profile) {
    if (!GL.meta.featureOpen(profile, 'jagd')) return '';
    const have = profile.loot || {}, show = profile.showcase || [];
    const cards = GL.data.raids.map(raid => GL.data.huntFor(raid.id).map(l => {
      const n = have[l.id] || 0, on = show.includes(l.id);
      return n ? `<button class="loot-card lr-${l.r}${on ? ' on' : ''}" data-act="showcase" data-id="${l.id}" aria-pressed="${on}">
          <span class="lc-art">${lootArt(l)}</span><b>${esc(l.name)}</b><small>${l.r >= 3 ? 'Legendär' : 'Episch'} · ${esc(raid.name)}${n > 1 ? ` · ${n}×` : ''}</small>
          <em>${on ? '✓ Ausgestellt' : 'Ausstellen'}</em></button>`
        : `<div class="loot-card empty lr-${l.r}"><span class="lc-art">${lootArt(l)}</span><b>???</b><small>${l.r >= 3 ? 'Legendär' : 'Episch'} · ${esc(raid.name)}</small></div>`;
    }).join('')).join('');
    return `<div class="vitrine"><div class="vit-head"><b>Vitrine</b><small>Bis zu 3 Stücke sind auf deiner Visitenkarte zu sehen.</small></div><div class="vit-grid">${cards}</div></div>`;
  }
  function dailyCard(profile) {
    if (!GL.meta.featureOpen(profile, 'daily')) return '';
    const day = GL.daily.today(), dd = GL.daily.done(profile), done = !!dd;
    const dScore = dd ? dd.score : null;
    return `<div class="daily-card${done ? ' done' : ''}">
      <span class="dc-ico" aria-hidden="true">${featureArt('scroll')}</span>
      <span class="dc-txt"><b>Tageskarte${(profile.dailyStreak || 0) > 1 && profile.daily && (profile.daily.d === day || profile.daily.d === yesterday()) ? ` <em class="dc-streak">${profile.dailyStreak} Tage in Folge</em>` : ''}</b><small>${done ? (dScore != null ? `Heute: ${Number(dScore).toLocaleString('de-DE')} Punkte. Morgen gibt es eine neue.` : 'Heute schon gestartet. Morgen gibt es eine neue.') : '<i class="dc-open">Heute noch offen</i> Alle starten gleich, egal welcher Rang. Dann entscheiden deine Wahl und das Glück. Ein Versuch.'}</small></span>
      ${done ? '<em class="dc-done">✓</em>' : '<button class="btn mini" data-act="daily-start">Starten</button>'}
    </div>`;
  }
  function huntPicker(profile) {
    if (!GL.meta.featureOpen(profile, 'jagd')) return '';
    const cur = profile.hunt || null;
    const chips = GL.meta.huntTargets(profile).map(({ raid, open }) => open
      ? `<button class="hunt-chip${cur === raid.id ? ' on' : ''}" data-act="hunt-pick" data-id="${raid.id}" aria-pressed="${cur === raid.id}">${GL.sprites.render(raid)}<span>${esc(raid.name.replace(/^Admiral |^Rothaar /, ''))}</span></button>`
      : `<span class="hunt-chip locked" title="Einmal zufällig im Raid besiegen, dann jagbar">${GL.sprites.render(raid)}<span>???</span></span>`).join('');
    const t = cur && GL.data.raids.find(r => r.id === cur);
    const have = profile.loot || {};
    const info = t
      ? `<div class="hunt-info"><b>Ziel: ${esc(t.name)}</b><span>Ab dem 2. Meer wartet fast sicher sein Raid. Gewinnst du, kann er fallen lassen:</span>
          <span class="hi-loot">${GL.data.huntFor(t.id).map(l => `<span class="hi-item lr-${l.r}${have[l.id] ? ' got' : ''}">${lootArt(l)}<small>${have[l.id] ? esc(l.name) : '???'}<br><em>${l.r >= 3 ? 'Legendär' : 'Episch'}</em></small></span>`).join('')}</span></div>`
      : `<div class="hunt-info muted">Tippe einen Raid-Boss an, um ihn gezielt zu jagen. Jeder hat zwei seltene Beutestücke für deine Vitrine im Lager.</div>`;
    return `<div class="hunt-row"><span class="hunt-lbl">Raid-Jagd</span>${chips}</div>${info}`;
  }

  // ---------- Freischaltungen: kleine Pixelbilder und ruhiges Pop-up ----------
  const FEAT_ART = {
    pal: { k: '#4a3a2c', d: '#7a6a5a', m: '#a89a88', l: '#d8d0c4', w: '#9a6a3a', W: '#c4904f', g: '#e2b44a', G: '#f6dc8a', r: '#c0533f', R: '#e07a5f', p: '#f4ecdc', b: '#4f7fa8', B: '#8ab6d6', s: '#3f8a52' },
    anvil:  ['............', '............', '.kkkkkkkk...', 'kmmmmmmmmkkk', '.kllllllmmmk', '..kkmmmmkkk.', '....kmmk....', '....kmmk....', '...kmmmmk...', '..kddddddk..', '..kkkkkkkk..', '............'],
    crate:  ['............', '..kkkkkkkk..', '.kWWWWWWWWk.', '.kwkkkkkkwk.', '.kWkWWWWkWk.', '.kWWkWWkWWk.', '.kWWWkkWWWk.', '.kWWkWWkWWk.', '.kWkWWWWkWk.', '.kwkkkkkkwk.', '.kkkkkkkkkk.', '............'],
    stall:  ['............', '.rrppRRpprr.', 'rRRppRRppRRr', 'kkkkkkkkkkkk', '.k........k.', '.k.gg..B..k.', '.k.gg.BBB.k.', '.kWWWWWWWWk.', '.kwwwwwwwwk.', '.k........k.', '.k........k.', '............'],
    chest:  ['............', '............', '..kkkkkkkk..', '.kWWWWWWWWk.', 'kWWWWWWWWWWk', 'kggggggggggk', 'kwwwwGGwwwwk', 'kWWWWgkWWWWk', 'kWWWWWWWWWWk', 'kwwwwwwwwwwk', '.kkkkkkkkkk.', '............'],
    podium: ['............', '.....GG.....', '....GggG....', '.....gg.....', '....kkkk....', '....kGGk....', '.kkkkggkkkk.', '.kllkggkddk.', '.kllkggkddk.', '.kllkggkddk.', 'kkkkkkkkkkkk', '............'],
    scroll: ['............', '.kkkkkkkkk..', 'kpppppppppk.', '.kpllllllpk.', '.kpppppppkk.', '.kpllllpppk.', '.kpppppppkk.', '.kplllllppk.', '.kppppppppk.', 'kpppppppppk.', '.kkkkkkkkk..', '............'],
    flag:   ['............', '.k..........', '.kkkkkkkkk..', '.kkpkkkpkkk.', '.kkkpppkkk..', '.kkkkpkkkk..', '.kkpkkkpkk..', '.kkkkkkkk...', '.k..........', '.k..........', '.k..........', 'kkk.........']
  };
  function featureArt(kind) {
    const grid = FEAT_ART[kind] || FEAT_ART.chest, P = FEAT_ART.pal;
    let rects = '';
    grid.forEach((row, y) => row.split('').forEach((ch, x) => { if (P[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${P[ch]}"/>`; }));
    return `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }
  // Wettfahrt: Code zeigen, kurz erklären, teilen
  function duelPop(code, invited) {
    return `<div class="fpop-card duel-card" role="dialog" aria-labelledby="dp-t">
      <span class="fpop-kicker">${invited ? 'Einladung' : 'Wettfahrt mit Freunden'}</span>
      <h3 id="dp-t">${invited ? 'Du wurdest herausgefordert!' : 'Deine Wettfahrt'}</h3>
      <div class="dp-code"><small>Code</small><b>${esc(code)}</b></div>
      <ol class="fpop-steps">${invited
        ? '<li>Du fährst exakt dieselbe Route wie dein Kumpel</li><li>Ohne Ausbauten: nur Können und Glück</li><li>Wer mehr Punkte holt, gewinnt</li>'
        : '<li>Code teilen, z. B. per WhatsApp</li><li>Dein Kumpel tippt auf den Link und fährt dieselbe Route</li><li>Wer mehr Punkte holt, gewinnt (Rangliste → Wettfahrt)</li>'}</ol>
      <div class="fpop-btns">${invited
        ? `<button class="btn" data-act="duel-go" data-id="${esc(code)}">Annehmen</button><button class="btn ghost" data-act="duel-later">Später</button>`
        : `<button class="btn ghost" data-act="duel-copy" data-id="${esc(code)}">Teilen</button><button class="btn" data-act="duel-go" data-id="${esc(code)}">Losfahren</button>`}</div>
    </div>`;
  }
  // Neuigkeiten
  function notesPop() {
    return `<div class="fpop-card notes-card" role="dialog" aria-labelledby="nt-t">
      <span class="fpop-kicker">Neuigkeiten</span>
      <h3 id="nt-t">Was ist neu?</h3>
      <div class="notes-list">${(GL.patchNotes || []).slice(0, 4).map(n => `<section><b>${esc(n.title)}</b><small>${esc(n.date)}</small><ul>${n.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></section>`).join('')}</div>
      <div class="fpop-btns"><button class="btn" data-act="notes-close">Schön</button></div>
    </div>`;
  }
  // Hinweis: als App auf den Home-Bildschirm (Vollbild ohne Browserleisten)
  function installPop(kind) {
    const shareIco = `<svg viewBox="0 0 24 24" class="ip-share" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    const steps = kind === 'ios'
      ? `<ol class="fpop-steps"><li>Unten in Safari auf ${shareIco} <b>Teilen</b> tippen</li><li><b>„Zum Home-Bildschirm“</b> wählen</li><li>Grand Line wie eine App öffnen</li></ol>`
      : kind === 'prompt' ? ''
      : `<ol class="fpop-steps"><li>Oben rechts im Browser auf <b>⋮</b> tippen</li><li><b>„Zum Startbildschirm hinzufügen“</b> wählen</li><li>Grand Line wie eine App öffnen</li></ol>`;
    return `<div class="fpop-card ip-card" role="dialog" aria-labelledby="ip-t">
      <span class="fpop-kicker">Tipp für dein Handy</span>
      <div class="ip-phone" aria-hidden="true"><span class="ip-screen"><img src="img/icon-192.png" alt=""></span></div>
      <h3 id="ip-t">Im Vollbild spielt es sich schöner</h3>
      <p>Als App auf dem Home-Bildschirm: keine Browserleisten, kein versehentliches Wegwischen.</p>
      ${steps}
      <div class="fpop-btns">${kind === 'prompt' ? '<button class="btn" data-act="inst-go">Als App installieren</button>' : '<button class="btn" data-act="inst-done">Verstanden</button>'}<button class="btn ghost" data-act="inst-later">Später</button></div>
    </div>`;
  }

  // Kurze Bewertung: 1 bis 5 Sterne, optional ein Satz
  function feedbackPop(stars) {
    const s = stars || 0;
    return `<div class="fpop-card fb-card" role="dialog" aria-labelledby="fb-t">
      <span class="fpop-kicker">Kurze Frage</span>
      <h3 id="fb-t">Wie gefällt dir Grand Line bisher?</h3>
      <div class="fb-stars" role="radiogroup" aria-label="Bewertung">${[1, 2, 3, 4, 5].map(n => `<button class="fb-star${n <= s ? ' on' : ''}" data-act="fb-star" data-i="${n}" role="radio" aria-checked="${n === s}" aria-label="${n} Stern${n > 1 ? 'e' : ''}">★</button>`).join('')}</div>
      <textarea id="fb-text" maxlength="300" rows="2" placeholder="Was gefällt dir, was nervt? (freiwillig)"></textarea>
      <div class="fpop-btns"><button class="btn" data-act="fb-send"${s ? '' : ' disabled'}>Senden</button><button class="btn ghost" data-act="fb-later">Später</button></div>
      <small class="fb-note">Anonym. Hilft, das Spiel besser zu machen.</small>
    </div>`;
  }
  function featurePop(f, more) {
    return `<div class="fpop-card" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">Neu freigeschaltet</span>
      <div class="fpop-art">${featureArt(f.art)}</div>
      <h3 id="fpop-t">${esc(f.name)}</h3>
      <p>${esc(f.text)}</p>
      ${f.steps && f.steps.length ? `<ol class="fpop-steps">${f.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
      ${more && more.length ? `<p class="fpop-more">Auch neu: ${more.map(m => `<span>${featureArt(m.art)}${esc(m.name.replace(/^(Der|Die|Das|Deine) /, ''))}</span>`).join('')}</p>` : ''}
      <div class="fpop-btns">${f.tab ? `<button class="btn" data-act="fpop-go" data-id="${f.id}">Ansehen</button>` : ''}<button class="btn ghost" data-act="fpop-close" data-id="${f.id}">${f.tab ? 'Später' : 'Alles klar'}</button></div>
    </div>`;
  }
  // Ruhiger Hinweis auf die nächste Freischaltung
  function featureNextLine(profile) {
    const f = GL.meta.featureNext(profile);
    if (!f) return '';
    const R = GL.data.ranks, need = R[Math.min(R.length - 1, f.lvl - 1)].xp, prev = R[Math.max(0, GL.meta.rankIndex(profile))].xp;
    const pct = need > prev ? Math.max(4, Math.min(100, Math.round(100 * ((profile.rankXp || 0) - prev) / (need - prev)))) : 100;
    return `<div class="fnext"><span class="fnext-art">${featureArt(f.art)}</span><span><small>Ab Rang ${f.lvl}</small><b>${esc(f.name)}</b></span><i class="fnext-bar"><i style="width:${pct}%"></i></i></div>`;
  }

  function questBoard(profile) {
    if (!GL.meta.featureOpen(profile, 'quests')) return '';
    const qs = GL.meta.questsEnsure(profile);
    const cards = qs.map(q => {
      const d = GL.meta.questDef(q);
      const p = GL.meta.questProgress(profile, q);
      return `<div class="quest${p.done ? ' done' : ''}">
        <span class="q-ico">${d.icon}</span>
        <span class="q-body"><b>${esc(d.text.replace('{n}', q.n.toLocaleString('de-DE')))}</b>
          <span class="q-bar"><i style="width:${Math.round(100 * p.have / p.need)}%"></i><em>${p.have.toLocaleString('de-DE')} / ${p.need.toLocaleString('de-DE')}</em></span>
          <small class="q-rew">${GL.sprites.coin()} ${q.berry} · ✦ ${q.xp} EP</small></span>
        ${p.done ? `<button class="btn mini q-claim" data-act="quest-claim" data-id="${q.id}">Abholen</button>`
          : profile.questReroll > 0 ? `<button class="link q-re" data-act="quest-reroll" data-id="${q.id}" title="Einmal am Tag gratis neu würfeln">↻</button>` : ''}
      </div>`;
    }).join('');
    return `<section class="quests"><div class="q-head"><b>Aufträge</b><small>Abgeholt? Sofort kommt ein neuer. Jeden Tag frische.</small></div>${cards}</section>`;
  }

  function hq(profile, tab, uiRef) {
    if (!GL.meta.featureOpen(profile, tab)) tab = 'profil';
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

    const H = GL.data.heat;
    // Kopfgeld-Stufe als kompakte Pille (Details im Tooltip)
    const heatTip = profile.heat ? H.filter(h => h.lvl <= profile.heat).map(h => `${h.name}: ${h.text}`).join(' · ') + ` · Dafür +${Math.round(profile.heat * GL.config.heatBonus.berry * 100)} % Berry, +${Math.round(profile.heat * GL.config.heatBonus.score * 100)} % Punkte` : 'Normale Schwierigkeit. Höher = schwerer, aber mehr Berry und Punkte.';
    const heatBox = profile.heatMax > 0 ? `<div class="heat-pill" data-tip="${esc(heatTip)}">
        <span>🔥 Kopfgeld-Stufe</span>
        <button class="btn mini ghost" data-act="heat" data-d="-1" aria-label="Stufe senken"${profile.heat <= 0 ? ' disabled' : ''}>−</button>
        <b class="heat-num">${profile.heat}</b>
        <button class="btn mini ghost" data-act="heat" data-d="1" aria-label="Stufe erhöhen"${profile.heat >= profile.heatMax ? ' disabled' : ''}>+</button>
      </div>` : GL.meta.level(profile) >= 3 ? `<div class="heat-pill locked" data-tip="Gewinne einen Run, dann kannst du die Schwierigkeit erhöhen: mehr Berry, mehr Punkte.">🔒 Kopfgeld-Stufen</div>` : '';

    const rp = GL.meta.rankProgress(profile);
    const rankHtml = rankPanel(profile, rp, fmt);

    // Was kommt mit in den nächsten Run: kleine Symbole statt Text
    const board = profile.loadout.map(id => { const g = byId(GL.data.gear, id); return g ? `<span class="sb-chip" data-tip="${esc(g.name)}: ${esc(g.text)}">${GL.sprites.icon('relic', g.id)}</span>` : ''; })
      .concat(profile.artLoadout.map(id => { const a = GL.data.artifacts.find(x => x.id === id); return a ? `<span class="sb-chip art" data-tip="${esc(a.name)}">${artIcon(a)}</span>` : ''; }))
      .concat(GL.meta.takeItems(profile).map(x => `<span class="sb-chip" data-tip="${esc(itemName(x))}">${itemIcon(x)}</span>`)).filter(Boolean);
    return `<div class="hq">
      <div class="hq-bar">
        ${profileChip(profile)}
        <div class="berry">${GL.sprites.coin()} <b>${fmt(profile.berry)}</b> <small>Berry</small></div>
      </div>

      <div class="hq-sail game">
        <div class="sail-stage" aria-hidden="true">
          <div class="ss-sun"></div><div class="ss-cloud c1"></div><div class="ss-cloud c2"></div>
          <div class="ss-sea"></div><div class="ss-ship">${GL.sprites.ship()}</div>
          <span class="ss-title">${uiRef && uiRef.peek ? 'Dein Run läuft noch' : 'Die Grand Line ruft!'}</span>
        </div>
        ${atSeaBox()}
        ${uiRef && uiRef.peek ? `<small class="sail-note">Oben links geht es zurück zum Run.</small>` : `
        <div class="sail-row">
          <button class="btn sail" data-act="sail">⚓ Leinen los! ${keyHint('Leertaste')}</button>
          ${heatBox}
        </div>
        ${huntPicker(profile)}
        ${dailyCard(profile)}
        ${board.length || GL.meta.featureOpen(profile, 'schmiede') ? `<div class="sail-board"><span class="sb-lbl">An Bord</span>${board.length ? board.join('') : '<small class="muted">noch nichts dabei</small>'}</div>` : ''}`}
      </div>

      ${uiRef && uiRef.peek ? '' : questBoard(profile)}

      <div class="atabs hq-tabs" role="tablist">
        ${[['profil', 'Profil'], ['stammcrew', '⚔ Stammcrew'], ['werft', 'Werft'], ['rangliste', 'Rangliste'], ['schmiede', `Schmiede <small>${(profile.itemLoadout || []).length}/${GL.meta.itemSlots(profile)}</small>`], ['kammer', `Schatzkammer <small>${profile.artLoadout.length}/${GL.meta.artSlots(profile)}</small>`], ['lager', `Lager <small>${profile.loadout.length}/${slots}</small>`], ['haendler', 'Händler']].filter(([id]) => GL.meta.featureOpen(profile, id)).map(([id, name]) =>
          `<button class="atab${tab === id ? ' on' : ''}" role="tab" aria-selected="${tab === id}" data-act="hq-tab" data-tab="${id}">${name}</button>`).join('')}
      </div>
      ${featureNextLine(profile)}

      ${tab === 'werft' ? `<section class="hq-sec">
        <p class="hint">Dauerhafte Ausbauten für dein Schiff. Sie gelten für jeden zukünftigen Run.</p>
        <div class="hq-grid">${upgrades}</div></section>` : ''}

      ${tab === 'profil' ? `<section class="hq-sec">
        ${rankHtml}
        <div class="hq-stats">
          <div><b>${profile.stats.runs}</b><span>Runs</span></div>
          <div><b>${profile.stats.wins}</b><span>Siege</span></div>
          <div><b>${best ? fmt(best.score) : '0'}</b><span>Bestwert</span></div>
          <div><b>${profile.unlocked.length + GL.config.starters.length}</b><span>Kapitäne</span></div>
        </div>
        <button class="btn ghost" data-act="profile-edit">Pirat und Aussehen bearbeiten</button>
        ${codeBox(profile, uiRef)}
        ${accountLine()}
        ${slotsBox(uiRef)}
        <p class="fb-link"><button class="link" data-act="notes-open">Neuigkeiten${profile.notesSeen !== GL.version ? ' <i class="new-dot"></i>' : ''}</button> · <button class="link" data-act="fb-open">★ Feedback</button> · <button class="link" data-act="reload">↻ Neu laden</button> · <a href="legal.html">Rechtliches</a></p>
        ${adminBox(profile)}
        ${chapterPanel(profile)}
        ${devicesBox()}
        ${dangerZone(uiRef)}</section>` : ''}
      ${tab === 'stammcrew' ? squadSection(profile) : ''}
      ${tab === 'kammer' ? vaultSection(profile) : ''}
      ${tab === 'schmiede' ? forgeSection(profile) : ''}
      ${tab === 'rangliste' ? leaderboard(profile, uiRef) : ''}
      ${tab === 'lager' ? `<section class="hq-sec">
        ${vitrine(profile)}
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
      crew: GL.data.crew.filter(d => !d.self).map((d, idx) => {
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
      body: `<p>Ein kleines Roguelike im Browser: Stell deine Piratencrew zusammen und kämpf dich durch drei Meere voller Inseln aus der Serie bis zum letzten Boss. Jeder Run ist anders und dauert nur rund 20 Minuten.</p>
        <div class="intro-note"><b>Inoffizielles Fanprojekt.</b> Kostenlos und ohne kommerzielle Absicht. Nicht verbunden mit Eiichiro Oda, Shueisha oder Toei Animation.</div>`
    },
    {
      kicker: 'So läuft ein Run',
      title: 'Wählen, kämpfen, weitersegeln',
      body: `<ol class="intro-steps">
        <li><b>Kapitän wählen.</b> Er oder sie startet allein.</li>
        <li><b>Kurs setzen:</b> Welche Insel steuerst du an? Jede hat eigene Orte und am Ende ihren Bösewicht.</li>
        <li><b>Route wählen:</b> Kampf, Taverne, Schatz, Teufelsfrucht oder Rast.</li>
        <li><b>Kämpfe laufen automatisch.</b> Du bestimmst vorher, wer vorne steht.</li>
        <li><b>Pro Meer zwei Inseln:</b> erst eine kleine mit Bösewicht, dann eine große mit dem Boss des Meeres.</li></ol>`
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

  // Einblendungen blockieren keine Klicks; ein Tipp irgendwo blendet sie sofort aus
  // Einblendung per Tipp auf sie selbst schließen; der Tipp löst darunter nichts aus
  function dismissOnTap(el) {
    el.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); el.classList.add('out'); setTimeout(() => el.remove(), 400); });
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
    setTimeout(() => el.classList.add('out'), 1300);
    setTimeout(() => el.remove(), 1850);
  }

  function showScene(isl, idx) {
    const old = document.getElementById('scene');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'scene';
    el.className = 'scene isl-' + isl.id;
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="scene-card"><div class="scene-wave" aria-hidden="true">${GL.sprites.ship()}</div><span class="event-kicker">Meer ${idx + 1} von ${GL.data.islands.length}</span>
      <h2>${isl.name}</h2><p>${isl.tagline || ''}</p>
      <p class="scene-stops">Kleine Insel → Bösewicht → Große Insel → <b>Boss des Meeres</b></p></div>`;
    dismissOnTap(el);
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2300);
    setTimeout(() => el.remove(), 2850);
  }

  // Training nach Level-up: kurze Wahl aus Trainingskarten statt Punkte einzeln verteilen
  const TRAIN = [
    { c: 'atk', ico: '⚔', name: 'Kampftraining', fx: p => `+${p * GL.config.point.atk} Angriff` },
    { c: 'hp',  ico: '❤', name: 'Ausdauer',      fx: p => `+${p * GL.config.point.hp} Leben` },
    { c: 'spd', ico: '⚡', name: 'Sprinttraining', fx: p => `+${p * GL.config.point.spd} Tempo` },
    { c: 'mix', ico: '⚖', name: 'Ausgewogen',     fx: p => `+${Math.ceil(p / 2) * GL.config.point.hp} Leben, +${Math.floor(p / 2) * GL.config.point.atk} Angriff` }
  ];
  // Haken: Training nach Level-up automatisch wählen
  function autoCheck(profile, cls) {
    const on = !!(profile && profile.settings && profile.settings.autoTrain);
    return `<button class="auto-check${on ? ' on' : ''}${cls ? ' ' + cls : ''}" data-act="auto-train-toggle" role="checkbox" aria-checked="${on}" title="Level-ups automatisch mit dem empfohlenen Training verteilen">
      <i class="ac-box" aria-hidden="true">${on ? '✓' : ''}</i><span class="ac-long">Auto-Training</span><span class="ac-short">Auto</span></button>`;
  }
  function trainPanel(run, profile) {
    const i = run.crew.findIndex(u => u.points > 0);
    if (i < 0) return '';
    const u = run.crew[i];
    const d = crewData(u.id);
    const rec = GL.advice.stat(run, i);
    const others = run.crew.filter(x => x.points > 0).length - 1;
    return `<div class="train">
      <div class="train-head"><span class="train-av">${GL.sprites.render(d)}</span>
        <span><b>${d.name} hat trainiert!</b><small>Lv ${u.lvl} · wähle ein Training${others > 0 ? ` · danach noch ${others} weitere` : ''}</small></span>
        <button class="link" data-act="train-auto" title="Für alle das empfohlene Training wählen">Jetzt für alle</button></div>
      <div class="train-auto-row">${autoCheck(profile)}<small>Neue Level werden dann sofort sinnvoll verteilt.</small></div>
      <div class="train-opts">${TRAIN.map(t => `<button class="train-opt${rec && rec.stat === t.c ? ' rec' : ''}" data-act="train" data-i="${i}" data-c="${t.c}">
        ${rec && rec.stat === t.c ? '<span class="tip-badge">Tipp</span>' : ''}<i>${t.ico}</i><b>${t.name}</b><small>${t.fx(u.points)}</small></button>`).join('')}</div>
    </div>`;
  }

  GL.ui = {
    introSteps: INTRO.length,
    bountyPoster,
    trophyPop,
    featurePop,
    feedbackPop,
    installPop,
    notesPop,
    duelPop,
    toggleMail() { mailShown = !mailShown; },

    render(run, anim, ui) {
      const titleEl = $('#title');
      titleEl.hidden = !ui.screen;
      document.body.classList.toggle('on-title', !!ui.screen);
      seenRef = ui.profile && ui.profile.seen;
      document.body.classList.toggle('streamer', streamOn());
      document.body.classList.toggle('is-app', !!fsApp());
      document.body.classList.toggle('in-run', !!run && !ui.screen);
      const fsb = document.querySelector('.fs-btn');
      if (fsb) fsb.hidden = fsApp() || !touchDev() || !(document.fullscreenEnabled || document.webkitFullscreenEnabled);
      let sb = document.getElementById('sandbox-bar');
      if (GL.sandbox.on() && !sb) {
        sb = document.createElement('div'); sb.id = 'sandbox-bar';
        sb.innerHTML = `<span>Spielstand ${GL.slots.active() + 1} · nur auf diesem Gerät</span><button class="link" data-act="slot-switch" data-i="0">Zum Hauptpiraten</button>`;
        document.body.appendChild(sb);
      } else if (!GL.sandbox.on() && sb) sb.remove();
      if (ui.screen) {
        const html = ui.screen === 'profile' ? profileScreen(ui.profile, ui) : ui.screen === 'login' ? loginScreen(ui.profile, ui) : titleScreen(run, ui.profile);
        if (titleEl.dataset.last !== html) {
          titleEl.innerHTML = html; titleEl.dataset.last = html;
          if (ui.screen === 'profile') setTimeout(() => { const i = $('#pf-name'); if (i) i.focus(); }, 30);
          if (ui.screen === 'login') setTimeout(() => { const i = $('#mail-code') || $('#code-in'); if (i) i.focus(); }, 30);
        }
      } else { titleEl.dataset.last = ''; }
      const introEl = $('#intro');
      introEl.hidden = ui.intro == null;
      if (ui.intro != null) introEl.innerHTML = intro(ui.intro);
      const st0 = GL.online ? GL.online.state() : { rows: [] };
      const viewRow = ui.viewPlayer ? ((st0.rows || []).find(x => x.id === ui.viewPlayer) || (ui.npcRow && ui.npcRow.id === ui.viewPlayer ? ui.npcRow : null)) : null;
      $('#pcard').hidden = !viewRow;
      if (viewRow) {
        const h = playerCard(viewRow, ui.viewPlayer === st0.uid, ui);
        if ($('#pcard').dataset.last !== h) { $('#pcard').innerHTML = h; $('#pcard').dataset.last = h; }
      } else $('#pcard').dataset.last = '';
      if (!run) {
        $('#track').innerHTML = '';
        ['#crew', '#syn', '#crew-label', '#restart', '#sheet', '#traits', '#peek', '#peek-btn'].forEach(sel => { $(sel).hidden = true; });
        const html = hq(ui.profile, ui.hqTab || 'profil', ui);
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
      // Kurzblick ins Hauptquartier mitten im Run: Run bleibt unangetastet im Hintergrund bestehen
      $('#peek-btn').hidden = GL.run.isFinished(run);
      $('#peek').hidden = !ui.peek;
      if (ui.peek) {
        $('#peek').innerHTML = `<div class="peek-bar"><b>Hauptquartier (Kurzblick)</b>
            <button class="btn mini peek-back" data-act="peek-close">← Zurück zum Run</button></div>
          <div class="peek-body">${hq(ui.profile, ui.hqTab || 'profil', ui)}</div>`;
      }
      $('#restart').hidden = false;
      $('#track').innerHTML = header(run);
      const rail = run.crew.length && !['over', 'win', 'starter'].includes(run.phase) ? traitRail(run) : '';
      $('#traits').hidden = !rail;
      if ($('#traits').innerHTML !== rail) $('#traits').innerHTML = rail;
      // Szenenwechsel: beim Erreichen einer neuen Insel kurz ihren Namen einblenden
      const isl = GL.run.island(run);
      if (run.phase === 'course' && run.step % GL.config.stepsPerIsland === 0 && ui.shownIsland !== isl.id + run.seed) {
        ui.shownIsland = isl.id + run.seed;
        const bs = GL.data.islands[GL.run.islandIndex(run)];
        showScene(bs.alt && run.altOpen ? { id: isl.id, name: bs.name + ' oder ' + bs.alt.name, tagline: 'Zwei Routen. Du entscheidest, wohin die Reise geht.' } : isl, GL.run.islandIndex(run));
      }
      const stopKey = run.seed + ':' + run.step;
      if (run.phase === 'map' && ui.shownStop !== stopKey) {
        ui.shownStop = stopKey;
        const r = GL.run.rowIdx(run);
        const last = r === GL.config.chapterSteps - 1;
        const here = GL.run.chapterIsland(run);
        // Nur die wichtigen Momente einblenden: Ankunft auf einer Insel und der Endkampf
        if (r === 0 && here) showStop(here.name, 'Ankunft auf');
        else if (last) showStop(GL.run.stopName(run), GL.run.chapterIdx(run) === 0 ? 'Endstation: Bösewicht' : 'Endstation: Boss des Meeres');
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
        ${autoCheck(ui.profile, 'mini')}

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
      const canTrain = ['map', 'prep', 'recruit', 'fruit', 'treasure', 'course', 'event'].includes(run.phase);
      const html = (canTrain ? trainPanel(run, ui.profile) : '') + stage(run, anim, ui);
      if (html !== ui.lastStage) {
        $('#stage').innerHTML = html;
        ui.lastStage = html;
        window.__glStageAt = performance.now();
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
