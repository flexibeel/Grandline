// DUNGEON-SUCHE: Anzeige der Seekarte der Gerüchte (Fenster im Hauptquartier).
//   GL.skUi.act(type, data, profile) → HTML für das Fenster (null = schließen). main.js ruft das für data-act="sk-…" auf.
// Eigene Welt statt Routen-Streifen: frei in alle Richtungen segeln, Gebiete mit eigener Farbe und Deko,
// Nebel als leeres Pergament (die Karte zeichnet sich beim Segeln), Boss-Verstecke ragen als Silhouette mit Totenkopf-Flagge auf.
// Regeln: js/engine/seekarte.js · Texte: js/data/seekarte.js
window.GL = window.GL || {};

(function () {
  const en = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const L = v => (Array.isArray(v) ? v[en() ? 1 : 0] : v);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' })[ch]);
  const D = () => GL.data.seekarte;
  const T = k => L(D().txt[k]);
  const S = () => GL.seekarte;
  const tr = s => (GL.i18n && GL.i18n.t ? GL.i18n.t(s) : s);
  let sel = null;            // angetipptes Feld { c, r } (nur Anzeige)
  let lastTrip = null;       // für die Schiffs-Animation

  // ---------- Pixel-Kunst ----------
  const PAL = { k: '#2b1d14', w: '#fbf6ea', W: '#d9cfbc', y: '#f2c94c', Y: '#b8862a', b: '#b07a44', B: '#8a5a30', d: '#5e3b1d',
    g: '#5aa24a', G: '#2f6a2e', l: '#8fd06a', s: '#9aa3b2', S: '#5d6575', u: '#9fd3f0', U: '#5fa8c8', a: '#d8efe6', c: '#f3e2bd', C: '#d6bd8a',
    r: '#d8433a', f: '#ffe28a', K: '#1d1a1e', i: '#eaf6fb', I: '#a9d3e6', p: '#4f8a3a', P: '#2f5f3a', o: '#c98b4a', m: '#7a7f88' };
  function grid(rows, cls, pal) {
    const P = Object.assign({}, PAL, pal || {});
    let o = '';
    rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch !== '.' && P[ch]) o += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${P[ch]}"/>`; } });
    return `<svg class="${cls || ''}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
  }
  const ART = {
    bottle: ['....kk....', '....oo....', '...kuuk...', '..kuuuuk..', '..kuwwuk..', '..kucCuk..', '..kuCcuk..', '..kuuuuk..', '...kkkk...', 'aa.aa..aa.'],
    wreck: ['.......d..', '......dw..', '.....d.ww.', '....d.....', '.kkkdkk.k.', 'kbbbbbbkyk', '.kdddddkk.', 'aakkkkkaaa'],
    crate: ['..........', '.kkkkkkkk.', '.kbBbbBbk.', '.kBkbbkBk.', '.kbbkkbbk.', '.kBkbbkBk.', '.kkkkkkkk.', 'aaaaaaaaaa'],
    storm: ['....kkkk....', '..kkSSSSkk..', '.kSssssSSSk.', 'kSssssssssSk', 'kSSSSSSSSSSk', '.kkkkfkkkkk.', '..u..ff.u...', '.u..ff..u.u.', '...f...u....'],
    flag: ['dKKKKKK', 'dKwwwKK', 'dKwKwKK', 'dKKwKKK', 'dKwKwKK', 'dKKKKKK', 'd......', 'd......', 'd......'],
    harbour: ['......r.......', '......rr......', '.....d........', '...kkdkk......', '..krrrrrrk....', '..kcwcwcck....', '..kcckccck....', 'bbbbbbbbbbbbb.', '.d..d..d..d...', 'aaaaaaaaaaaaaa'],
    palm: ['..pp.pp...', '.p.Pp..p..', '....d.....', '....d.....', '...cdcc...', '.cccccccc.', 'aaaaaaaaaa'],
    cactus: ['....g.....', '.g..g.....', '.g.gg.g...', '.gggg.g...', '...gggg...', '.CccccccC.', 'aaaaaaaaaa'],
    berg: ['....i.....', '...iiI....', '..iiiII...', '.iiiiIII..', 'iiIiiiIIi.', 'aIIIIIIIIa', 'a.a..a.a..'],
    kelp: ['.p....p...', '.pP..pP...', '..p..p..p.', '.Pp..pP.p.', '.p..pp.pP.', 'UpUUPpUUpU', 'UUUUUUUUUU'],
    rock: ['..........', '...mm.....', '..msmm....', '.mssmmm.m.', 'mmsmmmmmsm', 'aaaaaaaaaa'],
    gull: ['k...k', '.k.k.', '..k..']
  };
  const art = (id, cls, pal) => grid(ART[id], cls, pal);
  function pix(a) {
    const rows = a.rows, c = a.c;
    let r = '';
    rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (c[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c[ch]}"/>`; }));
    return `<svg viewBox="0 0 ${Math.max(...rows.map(x => x.length))} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  }
  function bossOf(d) {
    const X = GL.data;
    return [].concat(X.hunted || [], X.bosses || [], X.crew || [], X.grunts || []).find(x => x.id === d.boss) || null;
  }

  // Hintergrund: Gebiete als Farbflächen mit Wellen, Grenzlinien gepunktet. Fest (einmal gebaut).
  let bgCache = null;
  function seaBg() {
    if (bgCache) return bgCache;
    const C = D().cfg, U = 8, W = C.cols * U, H = C.rows * U;
    const R = (x, y, w, h, c, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${op ? ` opacity="${op}"` : ''}/>`;
    let o = '', wv = '';
    let h = 12345;
    const rnd = () => { h = Math.imul(h ^ (h >>> 13), 1103515245) + 12345 >>> 0; return (h >>> 8) / 16777216; };
    for (let r = 0; r < C.rows; r++) for (let c = 0; c < C.cols; c++) {
      const g = S().region(c, r), alt = (c + r) % 2;
      o += R(c * U, r * U, U, U, g.sea[alt]);
      for (let i = 0; i < 2; i++) { const x = c * U + Math.floor(rnd() * 6), y = r * U + 1 + Math.floor(rnd() * 6); wv += R(x, y, 2, 1, '#ffffff', '.35'); }
      // Grenze zum Nachbargebiet
      const me = (D().map[r] || '')[c];
      if (c + 1 < C.cols && (D().map[r] || '')[c + 1] !== me) for (let y = 0; y < U; y += 2) o += R(c * U + U - 0.5, r * U + y, 0.6, 1, '#fbf6ea', '.55');
      if (r + 1 < C.rows && (D().map[r + 1] || '')[c] !== me) for (let x = 0; x < U; x += 2) o += R(c * U + x, r * U + U - 0.5, 1, 0.6, '#fbf6ea', '.55');
    }
    // Tiefsee: dunkle Schatten, Frost: Eisschollen, Sandmeer: Sandbänke
    for (let r = 0; r < C.rows; r++) for (let c = 0; c < C.cols; c++) {
      const id = S().region(c, r).id, x = c * U, y = r * U;
      if (id === 'tief' && (c + r) % 2) o += R(x + 2, y + 3, 4, 2, '#1f4f6a', '.6');
      if (id === 'frost' && (c * 3 + r) % 4 === 0) o += R(x + 1, y + 5, 3, 1, '#eaf6fb', '.85');
      if (id === 'sand' && (c + r * 2) % 3 === 0) o += R(x + 3, y + 2, 3, 1, '#e8cf94', '.8');
      if (id === 'nebel' && (c + r) % 3 === 0) o += R(x, y + 4, 6, 1, '#cfd8d8', '.35');
    }
    // Kompassrose oben rechts im Nebelmeer (Deko)
    const cx = W - 6, cy = 6;
    o += R(cx - 4, cy, 9, 1, '#f3e2bd', '.7') + R(cx, cy - 4, 1, 9, '#f3e2bd', '.7') + R(cx, cy - 4, 1, 2, '#d8433a');
    bgCache = `<svg class="sk-bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true">${o}<g class="sk-wv">${wv}</g></svg>`;
    return bgCache;
  }
  // Nebel: leeres Pergament mit Schraffur. Jedes nicht erkundete Feld ein Stück.
  function fogLayer(s) {
    const C = D().cfg;
    let o = '';
    for (let r = 0; r < C.rows; r++) for (let c = 0; c < C.cols; c++) {
      if (S().clear(s, c, r)) continue;
      o += `<rect x="${c}" y="${r}" width="1.01" height="1.01" fill="url(#skfog)"/>`;
    }
    return `<svg class="sk-fog" viewBox="0 0 ${C.cols} ${C.rows}" preserveAspectRatio="none" aria-hidden="true">
      <defs><pattern id="skfog" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#efe2c2"/><path d="M0 .25h1M0 .75h1" stroke="#e2d1a8" stroke-width=".06"/><path d="M.2 0l-.2 .2M.7 0l-.7 .7M1 .3l-.7 .7M1 .8l-.2 .2" stroke="#d9c494" stroke-width=".04"/></pattern></defs>${o}</svg>`;
  }

  const pos = (c, r) => { const C = D().cfg; return `left:${((c + 0.5) / C.cols * 100).toFixed(3)}%;top:${((r + 0.5) / C.rows * 100).toFixed(3)}%`; };

  // ---------- Bühne ----------
  function html(profile) {
    const s = S().state(profile), t = s.trip, C = D().cfg;
    const reach = S().reach(profile);
    const isReach = (c, r) => reach.some(p => p[0] === c && p[1] === r);
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let o = seaBg();
    // Deko-Inseln (nur wo erkundet)
    (D().isles || []).forEach(([c, r, k]) => { o += `<span class="sk-isle${S().clear(s, c, r) ? '' : ' fogged'}" style="${pos(c, r)}">${art(k)}</span>`; });
    // Treibgut (nur sichtbar, wo der Nebel weg ist oder in Reichweite)
    t.finds.forEach(f => {
      if (f.done) return;
      const vis = S().clear(s, f.c, f.r) || S().dist([f.c, f.r], t.ship) <= C.reach;
      if (!vis) return;
      o += `<button class="sk-find k-${f.k}${isReach(f.c, f.r) ? ' can' : ''}${sel && sel.c === f.c && sel.r === f.r ? ' on' : ''}" data-act="sk-tap" data-c="${f.c}" data-r="${f.r}" style="${pos(f.c, f.r)}" aria-label="${esc(L(D().kinds[f.k].name))}">${art(f.k === 'storm' ? 'storm' : f.k)}</button>`;
    });
    o += fogLayer(s);
    // Hafen
    const [hc, hr] = C.home;
    o += `<button class="sk-harbour${t.ship[0] === hc && t.ship[1] === hr ? ' here' : ''}" data-act="sk-tap" data-c="${hc}" data-r="${hr}" style="${pos(hc, hr)}" aria-label="${esc(T('harbour'))}">${art('harbour')}</button>`;
    // Erreichbare Felder (Daumen-Ziele)
    reach.forEach(([c, r]) => {
      if (t.finds.some(f => f.c === c && f.r === r && !f.done)) return;
      if (c === hc && r === hr) return;
      o += `<button class="sk-cell${sel && sel.c === c && sel.r === r ? ' on' : ''}" data-act="sk-tap" data-c="${c}" data-r="${r}" style="${pos(c, r)}" aria-label="${esc(T('water'))}"><i></i></button>`;
    });
    // Landgang-Orte als Landmarken
    S().dgs().forEach(d => {
      const [c, r] = S().spot(d.id), st = S().status(profile, d);
      const near = S().dist([c, r], t.ship) <= C.see;
      const seen = s.seen.includes(d.id);
      const b = bossOf(d);
      if (st === 'found') {
        o += `<button class="sk-lair found${sel && sel.c === c && sel.r === r ? ' on' : ''}" data-act="sk-tap" data-c="${c}" data-r="${r}" style="${pos(c, r)}" aria-label="${esc(tr(d.name))}">
          <span class="sk-lair-isle" style="--sky:${d.scene.sky};--ground:${d.scene.ground}">${pix(d.scene.deco)}</span>
          <span class="sk-flag">${art('flag')}</span>${b ? `<span class="sk-boss">${GL.sprites.render(b)}</span>` : ''}
          <b class="sk-name">${esc(tr(d.name))}</b></button>`;
      } else if (seen || near) {
        o += `<button class="sk-lair ${st === 'locked' ? 'locked' : 'looming'}${seen ? ' seen' : ''}${sel && sel.c === c && sel.r === r ? ' on' : ''}" data-act="sk-tap" data-c="${c}" data-r="${r}" style="${pos(c, r)}" aria-label="${esc(T('looming'))}">
          <span class="sk-lair-isle sil">${pix(d.scene.deco)}</span><span class="sk-flag">${art('flag')}</span>${st === 'locked' ? '<i class="sk-lock">🔒</i>' : '<i class="sk-q">?</i>'}</button>`;
      }
    });
    // Kielwasser vom letzten Feld
    if (t.prev) {
      const C2 = (c, r) => [((c + 0.5) / C.cols * 100).toFixed(2), ((r + 0.5) / C.rows * 100).toFixed(2)];
      const a = C2(t.prev[0], t.prev[1]), b2 = C2(t.ship[0], t.ship[1]);
      o += `<svg class="sk-wake" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="${a[0]}" y1="${a[1]}" x2="${b2[0]}" y2="${b2[1]}"/></svg>`;
    }
    // Leben auf dem Wasser
    o += `<span class="sk-life sk-gull a">${art('gull')}</span><span class="sk-life sk-gull b">${art('gull')}</span>`;
    // Schiff (gleitet vom letzten Feld)
    const animate = !reduce && t.prev && lastTrip !== JSON.stringify([t.n, t.ship]);
    lastTrip = JSON.stringify([t.n, t.ship]);
    o += `<span class="sk-ship" style="${pos(t.ship[0], t.ship[1])}"${animate ? ` data-from="${pos(t.prev[0], t.prev[1])}"` : ''} aria-hidden="true"><i class="sk-foam"></i>${GL.sprites.ship()}</span>`;
    if (animate) requestAnimationFrame(mount);

    const reg = S().region(t.ship[0], t.ship[1]);
    const pips = Array.from({ length: C.prov }, (_, i) => `<i class="${i < t.prov ? 'on' : ''}"></i>`).join('');
    const comp = t.comp ? `<span class="sk-comp c-${t.comp}" title="${esc(T('compass'))}"><i>🧭</i>${esc(T(t.comp))}</span>` : '';
    const nFound = S().foundCount(profile), nAll = S().dgs().length;
    return `<div class="fpop-card sk-card" role="dialog" aria-labelledby="sk-t">
      <button class="pop-x" data-act="pop-close" aria-label="Schließen"><span>✕</span></button>
      <div class="sk-head"><span class="sk-kick">${esc(T('kicker'))}</span>
        <h3 id="sk-t">${esc(L(reg.name))}</h3>
        <button class="sk-help" data-act="sk-help" aria-label="${esc(T('help'))}">?</button></div>
      <div class="sk-bar"><span class="sk-prov" title="${esc(T('prov'))}"><small>🍙 ${esc(T('prov'))}</small><span class="sk-pips">${pips}</span></span>${comp}<span class="sk-count" title="${esc(T('charted'))}">⚑ ${nFound}/${nAll}</span></div>
      <div class="sk-frame"><div class="sk-map">${o}</div></div>
      ${panel(profile)}
      <div class="sk-btns">${t.ship[0] === hc && t.ship[1] === hr
        ? `<button class="btn sk-tav" data-act="sk-tavern"${t.tav ? ' disabled' : ''}>🍺 ${esc(T('tavern'))}</button>`
        : `<button class="btn${t.prov <= 0 ? '' : ' ghost'} sk-home" data-act="sk-home">⚓ ${esc(T('home'))}</button>`}
        <button class="btn ghost sk-list" data-act="dg-list">☰ ${esc(T('list'))}</button></div>
    </div>`;
  }
  // FLIP: Schiff startet auf dem alten Feld und gleitet ins neue
  function mount() {
    document.querySelectorAll('.sk-map [data-from]:not([data-moved])').forEach(el => {
      el.dataset.moved = '1';
      const to = el.getAttribute('style');
      el.setAttribute('style', el.dataset.from + ';transition:none');
      void el.offsetWidth;
      el.setAttribute('style', to);
    });
  }

  // Info-Leiste unter der Karte: Auswahl > letzte Nachricht > Hinweis
  function panel(profile) {
    const s = profile.sk, t = s.trip, C = D().cfg;
    if (sel) {
      const { c, r } = sel;
      const d = S().dgs().find(x => { const p = S().spot(x.id); return p[0] === c && p[1] === r; });
      if (d) return lairPanel(profile, d);
      if (c === C.home[0] && r === C.home[1]) return box(art('harbour'), T('harbour'), T('homeText'), S().canReach(profile, c, r) ? go(c, r, T('home')) : '');
      const f = t.finds.find(x => x.c === c && x.r === r && !x.done);
      const can = S().canReach(profile, c, r);
      const away = S().dist([c, r], t.ship);
      const far = !can && away > C.reach ? `<span class="sk-away">${esc(T('away').replace('{n}', Math.ceil((away - C.reach) / C.reach) + 1))}</span>` : '';
      if (f) return box(art(f.k === 'storm' ? 'storm' : f.k), L(D().kinds[f.k].name), L(D().kinds[f.k].text), can ? go(c, r) : far);
      if (!S().clear(s, c, r)) return box('', T('fog'), T('fogText'), can ? go(c, r) : far);
      const g = S().region(c, r);
      return box(art(g.deco), L(g.name), L(g.text), can ? go(c, r) : far);
    }
    const m = t.msg;
    if (m) {
      if (m.k === 'found') { const d = S().dg(m.id); return d ? box(`<span class="sk-pi-isle" style="--sky:${d.scene.sky};--ground:${d.scene.ground}">${pix(d.scene.deco)}</span>`, T('found'), T('foundText').replace('{p}', tr(d.name)), `<button class="btn sk-go" data-act="dg-start" data-v="${d.id}">⚓ ${esc(T('land'))}</button>`, 'good') : ''; }
      if (m.k === 'find') return box(art(m.f.k === 'storm' ? 'storm' : m.f.k), L(D().kinds[m.f.k].name), m.f.lines.join(' '), '', m.f.k === 'storm' ? 'bad' : 'msg');
      if (m.k === 'event') { const E = D().events[m.e.id]; return box(`<i class="sk-ev e-${m.e.id}">${{ delfine: '🐬', strudel: '🌀', moewe: '🐦', seekoenig: '🐉', flaute: '🃏' }[m.e.id] || '🌊'}</i>`, L(E.name), m.e.lines.join(' '), '', 'msg'); }
      if (m.k === 'tavern') return box('<i class="sk-ev">🍺</i>', T('tavernName'), m.text, '', 'msg');
      if (m.k === 'home') return box(art('harbour'), T('harbour'), T('homeText'), '', 'msg');
      if (m.k === 'out') return box('<i class="sk-ev">🍙</i>', T('prov'), T('provOut'), '', 'bad');
    }
    if (t.prov <= 0) return box('<i class="sk-ev">🍙</i>', T('prov'), T('provOut'), '', 'bad');
    const hid = S().hidden(profile).length;
    const sub = !hid ? (S().foundCount(profile) >= S().dgs().length ? T('allFound') : T('moreLater')) : T('unknown').replace('{n}', hid);
    const tut = !s.found.length && hid ? T('hintTut') : T('hint');
    return `<div class="sk-panel hint"><span class="sk-pt"><small class="sk-hint">${esc(tut)}</small><small class="sk-sub">${esc(sub)}</small></span></div>`;
  }
  const go = (c, r, label) => `<button class="btn sk-go" data-act="sk-go" data-c="${c}" data-r="${r}">${esc(label || T('go'))}</button>`;
  function box(icon, name, text, extra, cls) {
    return `<div class="sk-panel ${cls || 'sel'}">${sel ? '<button class="sk-x" data-act="sk-x" aria-label="Schließen">✕</button>' : ''}
      ${icon ? `<span class="sk-pi">${icon}</span>` : ''}<span class="sk-pt"><b>${esc(name)}</b><small>${esc(text)}</small></span>${extra || ''}</div>`;
  }
  // Boss-Versteck: aus der Ferne Silhouette, gefunden mit Boss, Stufe und Beute
  function lairPanel(profile, d) {
    const st = S().status(profile, d), b = bossOf(d), s = profile.sk;
    if (st === 'locked') return box(`<span class="sk-pi-isle sil">${pix(d.scene.deco)}</span>`, T('locked'), T('lockedText').replace('{n}', tr(d.needText)), '', 'sel lock');
    if (st === 'hidden') return box(`<span class="sk-pi-isle sil">${pix(d.scene.deco)}</span>`, T('looming'), T('loomingText'), '', 'sel');
    const P = profile.dungeons && profile.dungeons[d.id] || { clears: 0 };
    const lvl = Math.min(12, P.clears || 0);
    const ep = Math.round((0.22 + 0.02 * Math.min(10, lvl)) * 100);
    const has = (profile.dgFinds || []).includes(d.find.id);
    const chips = [`⚙ ${T('lootGear').replace(/ \(.*\)$/, '')}`, `✦ ${T('epic').replace('{p}', ep)}`, `🔹 ${T('lootShards')}`, `${has ? '✓' : '?'} ${T('lootFind')}: ${has ? tr(d.find.name) : '???'}`];
    return `<div class="sk-panel lair"><button class="sk-x" data-act="sk-x" aria-label="Schließen">✕</button>
      <span class="sk-pi boss">${b ? GL.sprites.render(b) : ''}</span>
      <span class="sk-pt"><small class="sk-lk">☠ ${esc(T('lair'))} · ${esc(T('level'))} ${lvl + 1}${P.clears ? ' · ' + esc(T('clears').replace('{n}', P.clears)) : ''}</small>
        <b>${esc(tr(d.name))}</b><small>${esc(T('waits').replace('{b}', b ? tr(b.name) : '?'))}</small>
        <span class="sk-chips">${chips.map(x => `<em>${esc(x)}</em>`).join('')}</span></span>
      <button class="btn sk-go" data-act="dg-start" data-v="${d.id}">⚓ ${esc(T('land'))}</button></div>`;
  }

  function helpHtml() {
    const ico = [GL.sprites.ship(), '<svg viewBox="0 0 2 2"><rect width="2" height="2" fill="#efe2c2"/></svg>', art('bottle'), art('flag')];
    return `<div class="fpop-card sk-help-pop"><span class="fpop-kicker">${esc(T('kicker'))}</span><h3>${esc(T('help'))}</h3>
      <ul class="sk-hl">${D().txt.helpLines.map((l, i) => `<li><i>${ico[i]}</i><span>${esc(L(l))}</span></li>`).join('')}</ul>
      <div class="fpop-btns"><button class="btn" data-act="sk-open">${esc(T('ok'))}</button></div></div>`;
  }

  function act(type, data, profile) {
    if (!GL.seekarte || !profile) return null;
    const c = Number(data.c), r = Number(data.r);
    if (type === 'sk-open') { sel = null; return html(profile); }
    if (type === 'sk-help') return helpHtml();
    if (type === 'sk-x') { sel = null; return html(profile); }
    if (type === 'sk-home') { sel = null; S().home(profile); return html(profile); }
    if (type === 'sk-tavern') {
      sel = null;
      const res = S().tavern(profile);
      if (res.none) profile.sk.trip.msg = { k: 'tavern', text: T('tavernNone') };
      else if (res.already) profile.sk.trip.msg = { k: 'tavern', text: T('tavernDone') };
      return html(profile);
    }
    if (type === 'sk-go') { sel = null; S().move(profile, c, r); return html(profile); }
    if (type === 'sk-tap') {
      const s = profile.sk, t = s.trip;
      const isSpot = S().blocked(c, r) || (c === D().cfg.home[0] && r === D().cfg.home[1]);
      const f = t.finds.find(x => x.c === c && x.r === r && !x.done);
      // freies, bekanntes Wasser in Reichweite: sofort segeln (wenig Tippen)
      if (!isSpot && !f && S().canReach(profile, c, r)) { sel = null; S().move(profile, c, r); return html(profile); }
      // zweiter Tipp auf dasselbe Ziel: segeln
      if (sel && sel.c === c && sel.r === r && S().canReach(profile, c, r)) { sel = null; S().move(profile, c, r); return html(profile); }
      sel = { c, r };
      return html(profile);
    }
    return null;
  }

  // Kachel „Landgang“ im Hafen zählt gefundene Orte (die Freischaltung des Features bleibt bei GL.dungeonOpen)
  if (GL.dungeonCount) { const base = GL.dungeonCount; GL.dungeonCount = p => (GL.seekarte && p ? (GL.seekarte.migrate(p), GL.seekarte.foundCount(p)) : base(p)); }

  GL.skUi = { act, html, reset: () => { sel = null; } };
})();
