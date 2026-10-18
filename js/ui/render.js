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

  // ---------- Pixel-Symbole: Banden, Kampfstile, Rollen ----------
  const ICON_ART = {
    // Banden
    strohhut:  { c: { Y: '#f2d24a', y: '#c9a22a', R: '#d0574a' }, rows: ['..........', '...YYYY...', '..YYYYYY..', '..RRRRRR..', 'YYYYYYYYYY', '.yyyyyyyy.', '..........', '..........', '..........', '..........'] },
    marine:    { c: { B: '#4f7fa8', b: '#2f5a84', W: '#e8eef4' }, rows: ['....BB....', '...B..B...', '....BB....', '..BBBBBB..', '....BB....', '....BB....', 'B...BB...B', 'BB..BB..BB', '.BBBBBBBB.', '...BBBB...'] },
    cp9:       { c: { W: '#eeeae2', K: '#2a2420', G: '#9a93ab' }, rows: ['..GGGGGG..', '.GWWWWWWG.', 'GWWWWWWWWG', 'GWKKWWKKWG', 'GWKKWWKKWG', 'GWWWWWWWWG', '.GWWKKWWG.', '.GWWWWWWG.', '..GGWWGG..', '....GG....'] },
    weissbart: { c: { W: '#f4f0e8', P: '#7b5ab0', K: '#4a3a2a' }, rows: ['..........', '..........', '..........', 'W........W', 'WW......WW', '.WWW..WWW.', '..WWWWWW..', '...WWWW...', '..........', '..........'] },
    samurai:   { c: { S: '#d0d6de', K: '#3a2a20', T: '#5a9a96' }, rows: ['S........S', '.S......S.', '..S....S..', '...S..S...', '....SS....', '....SS....', '...K..K...', '..K....K..', '.T......T.', 'T........T'] },
    baroque:   { c: { G: '#e0b040', g: '#a07a20' }, rows: ['....GG....', '....GG....', '...GGGG...', 'GGGGGGGGGG', '.GGGGGGGG.', '..GGGGGG..', '..GGggGG..', '.GGG..GGG.', '.GG....GG.', '..........'] },
    buggy:     { c: { R: '#e0302a', r: '#a81e1a', W: '#ffd0c8', B: '#2f5aa8' }, rows: ['..B....B..', '.BBB..BBB.', '...RRRR...', '..RWWRRR..', '.RRWRRRRR.', '.RRRRRRRR.', '.rRRRRRRr.', '..rRRRRr..', '...rrrr...', '..........'] },
    fischmensch: { c: { F: '#6f8fb0', f: '#4a6a8a', W: '#4fa8d8', w: '#2f7ab0' }, rows: ['....F.....', '...FF.....', '...FFF....', '..FFfF....', '..FFffF...', '.FFFffFF..', 'WWWWWWWWWW', '.ww..ww..w', 'w..ww..ww.', '..........'] },
    revolution: { c: { K: '#5a3a20', G: '#3a7a4a', g: '#2a5a36', W: '#eef0e8' }, rows: ['K.........', 'KGGGGGG...', 'KGGGGGGGG.', 'KGGWWGGGG.', 'KGWWWWGGG.', 'KGGWWGGgg.', 'KGGGGgg...', 'K.........', 'K.........', 'KK........'] },
    supernova: { c: { Y: '#f2d24a', O: '#e07a2c', R: '#c0302a' }, rows: ['....Y.....', '....Y.....', '.Y..O..Y..', '..YOROY...', 'YYORRROYY.', '..YOROY...', '.Y..O..Y..', '....Y.....', '....Y.....', '..........'] },
    thriller:  { c: { P: '#5a3a7a', p: '#3a2a4a', W: '#e8e0f0', R: '#e0483b' }, rows: ['..........', 'P........P', 'PP......PP', 'PPP.PP.PPP', 'PPPPPPPPPP', '.PPWPPWPP.', '..PPPPPP..', '...PRRP...', '....pp....', '..........'] },
    rothaar:   { c: { R: '#c0302a', r: '#8a1e1a', S: '#f2c9a0', K: '#2a1a10', c: '#a8402a' }, rows: ['....R.....', '..R.RR.R..', '..RRRRRR..', '.RRRRRRRR.', 'RRrRRRRrRR', 'RRSSSSScRR', 'RSSKSSKcSR', '.SSSSSScS.', '..SSSSSS..', '...SSSS...'] },
    // Kampfstile
    kraft:     { c: { R: '#d98a72', r: '#a8573f' }, rows: ['..........', '..RR.RR...', '.RRRRRRR..', '.RRRRRRRR.', '.RRRRRRRR.', '.rRRRRRRR.', '..rRRRRR..', '...rrrr...', '..........', '..........'] },
    klinge:    { c: { S: '#7fa98a', K: '#3f6b4a', W: '#e8f2ea' }, rows: ['........WS', '.......WS.', '......WS..', '.....WS...', '....WS....', '.K.WS.....', '..KS......', '..KK......', '.K..K.....', 'K.........'] },
    technik:   { c: { B: '#7fa3c9', b: '#4f739a' }, rows: ['....BB....', '.B.BBBB.B.', '..BBBBBB..', '.BBb..bBB.', 'BBB....BBB', 'BBB....BBB', '.BBb..bBB.', '..BBBBBB..', '.B.BBBB.B.', '....BB....'] },
    // Rollen
    brecher:   { c: { S: '#9aa7b4', s: '#5a6a7a', W: '#e8eef4' }, rows: ['.SSSSSSSS.', 'SWWWWWWWWS', 'SWSSSSSSWS', 'SWSSSSSSWS', 'SWSSSSSSWS', '.SWSSSSWS.', '.SWSSSSWS.', '..SWSSWS..', '...SWWS...', '....SS....'] },
    kaempfer:  { c: { S: '#c9a95a', K: '#6b4a2a' }, rows: ['S........S', '.S......S.', '..S....S..', '...S..S...', '....SS....', '....SS....', '...S..S...', '..K....K..', '.K......K.', 'K........K'] },
    helfer:    { c: { G: '#5aaa6a', W: '#e8f4ea' }, rows: ['...GGGG...', '...GWWG...', '...GWWG...', 'GGGGWWGGGG', 'GWWWWWWWWG', 'GWWWWWWWWG', 'GGGGWWGGGG', '...GWWG...', '...GWWG...', '...GGGG...'] }
  };
  const iconCache = {};
  function pxIcon(id, cls) {
    const a = ICON_ART[id];
    if (!a) return '';
    if (!iconCache[id]) {
      let r = '';
      a.rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (a.c[ch]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${a.c[ch]}"/>`; }));
      iconCache[id] = `<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
    }
    const F = GL.data.factions[id], T = GL.data.types[id], Rl = (GL.data.roles || {})[id];
    const tip = F ? `${F.name}: Bande. Mehrere Figuren derselben Bande geben einen Set-Bonus.` : T ? `${T.name}: Kampfstil. Stark gegen ${(GL.data.types[T.strong] || {}).name || '?'}.` : Rl ? `${Rl.name}: Rolle. ${{ brecher: 'Steht vorne und steckt ein.', kaempfer: 'Macht den meisten Schaden.', helfer: 'Heilt und unterstützt.' }[id] || ''}` : '';
    return `<i class="px-ico ${cls || ''}" data-tip="${esc(tip)}" tabindex="0">${iconCache[id]}</i>`;
  }
  // Pixel-Grabstein für besiegte Crewmitglieder (mit kleinem Strohhut-Kreuz und Gras)
  const PX_GRAVE = (() => {
    const rows = ['...KKKK...', '..KSSSSK..', '.KSSWSSSK.', '.KSWWWSSK.', '.KSSWSSsK.', '.KSSWSSsK.', '.KSSSSSsK.', '.KSSSSSsK.', '.KsssssssK', 'GGKKKKKKGG', 'gGGgGGgGGg'];
    const c = { K: '#3a2a20', S: '#b8b4ac', s: '#8a857c', W: '#efe9dc', G: '#6fae5a', g: '#4a8a3e' };
    let r = '';
    rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (c[ch]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c[ch]}"/>`; }));
    return `<svg class="px-grave" viewBox="0 0 10 11" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  })();
  const PX_FLAME = (() => {
    const rows = ['....Y.....', '...YY..Y..', '...YOY.YY.', '..YOOYYOY.', '..YOROOOY.', '.YORRROOY.', '.YORRRROY.', '.YOORRROY.', '..YOOOOY..', '...YYYY...'];
    const c = { Y: '#f2d24a', O: '#f29a2e', R: '#e0483b' };
    let r = ''; rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (c[ch]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c[ch]}"/>`; }));
    return `<svg class="px-flame" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  })();
  const pxArt = (rows, c, vb) => { let r = ''; rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (c[ch]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c[ch]}"/>`; })); return `<svg viewBox="0 0 ${vb[0]} ${vb[1]}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`; };
  const PX_CHEST = open => pxArt(open
    ? ['.YY.Y..YY.', '..YYYYYY..', 'KKKKKKKKKK', 'KBBBBBBBBK', 'KbbbbbbbbK', 'KKKKGGKKKK', 'KBBBGGBBBK', 'KBBBBBBBBK', 'KbbbbbbbbK', 'KKKKKKKKKK']
    : ['..........', '.KKKKKKKK.', 'KBBBBBBBBK', 'KbbbbbbbbK', 'KKKKGGKKKK', 'KBBBGGBBBK', 'KBBBBBBBBK', 'KBBBBBBBBK', 'KbbbbbbbbK', 'KKKKKKKKKK'],
    { K: '#3a2416', B: '#a8693a', b: '#7a4a24', G: '#f2d24a', Y: '#f2d24a' }, [10, 10]);
  const PX_STAR = pxArt(['....Y.....', '...YYY....', 'YYYYYYYYY.', '.YYYOYYY..', '..YYYYY...', '..YYOYY...', '.YYY.YYY..', '.YY...YY..', 'Y.......Y.', '..........'], { Y: '#f2c94c', O: '#e0a020' }, [10, 10]);
  // Kleine Pixel-Icons für wichtige Knöpfe (10×10, eigene Palette mit dunkler Kontur oder 'C' = Knopf-Textfarbe)
  const PXI_ART = {
    chart: [['..........', '........K.', '.......KGK', '....K..KGK', '...KBK.KGK', '...KBK.KGK', 'K..KBK.KGK', 'KRKKBK.KGK', 'KRKKBKKKGK', 'KKKKKKKKKK'], { K: '#3a2416', R: '#e0483b', B: '#4f8fe0', G: '#5aa04a' }],
    sticker: [['....K.....', '...KYK....', '...KYK....', 'KKKKYYKKKK', 'KYYYYYYYYK', '.KYYYYYYK.', '..KYYYYK..', '.KYYKKYYK.', '.KYK..KYK.', '.KK....KK.'], { K: '#6b4a10', Y: '#f2c94c' }],
    book: [['..........', '.KKKK.KKKK', 'KWWWWKWWWW', 'KWssWKWssW', 'KWWWWKWWWW', 'KWssWKWssW', 'KWWWWKWWWW', 'KRRRRKRRRR', '.KKKK.KKKK', '..........'], { K: '#3a2416', W: '#fffaf0', s: '#b8a890', R: '#a8693a' }],
    dice: [['.KKKKKKKK.', 'KWWWWWWWWK', 'KWKKWWWWWK', 'KWKKWWWWWK', 'KWWWKKWWWK', 'KWWWKKWWWK', 'KWWWWWKKWK', 'KWWWWWKKWK', 'KssssssssK', '.KKKKKKKK.'], { K: '#3a2416', W: '#fffaf0', s: '#d8c8b0' }],
    ship: [['....R.....', '....KWW...', '...WKWWs..', '..WWKWWWs.', '..WWKWWWs.', '....K.....', 'KBBBBBBBBK', '.KbbbbbbK.', '..KKKKKK..', 'w.ww..ww.w'], { K: '#3a2416', W: '#fffaf0', s: '#d8c8b0', R: '#e0483b', B: '#c07a3a', b: '#8a4f24', w: '#7fc4e8' }],
    swords: [['W........W', '.W......W.', '..W....W..', '...W..W...', '....WW....', '....WW....', '...G..G...', '..G....G..', '.K......K.', 'K........K'], { W: '#eef3f8', G: '#f2c94c', K: '#6b4a2a' }],
    coin: [['...KKKK...', '..KYYYYK..', '.KYYWYYOK.', 'KYYWYYYYOK', 'KYYYYYYYOK', 'KYYYYYYYOK', 'KYYYYYYOOK', '.KYYYYOOK.', '..KOOOOK..', '...KKKK...'], { K: '#7a4a14', Y: '#f2d24a', O: '#d99a20', W: '#fff6c8' }],
    anchor: [['....CC....', '...C..C...', '....CC....', '..CCCCCC..', '....CC....', '....CC....', 'C...CC...C', 'CC..CC..CC', '.CC.CC.CC.', '..CCCCCC..'], {}],
    heart: [['..........', '.KK...KK..', 'KRRK.KRRK.', 'KRWRKRRRK.', 'KRRRRRRRK.', '.KRRRRRK..', '..KRRRK...', '...KRK....', '....K.....', '..........'], { K: '#5a1c1c', R: '#e0483b', W: '#ffd0c8' }],
    bolt: [['.....KKK..', '....KYYK..', '...KYYK...', '..KYYKKKK.', '.KYYYYYYK.', '.KKKKYYK..', '....KYK...', '...KYK....', '...KK.....', '..K.......'], { K: '#6b4a14', Y: '#f2d24a' }],
    scale: [['....KK....', '.KKKKKKKK.', '.K..KK..K.', 'K.K.KK.K.K', 'K.K.KK.K.K', 'KYYKKKKYYK', '.KK.KK.KK.', '....KK....', '..KKKKKK..', '..KBBBBK..'], { K: '#5a3a1c', Y: '#f2d24a', B: '#a8693a' }],
    loop: [['...CCCC.C.', '.CCCCCCCC.', '.CC...CCC.', 'CC...CCCC.', 'CC........', 'CC......CC', '.CC....CC.', '.CCCCCCCC.', '...CCCC...', '..........'], {}]
  };
  const pxiCache = {};
  // Händler-Waren: eigene Pixel-Bilder statt der einheitlichen Truhe
  const GEAR_ART = {
    bordkanone: [['..........', '..........', '......KKK.', '.KKKKKKSSK', 'KSSSSSSSSK', 'KSSSSSSSKK', '.KKKKKKK..', '..KWWK....', '.KWBBWK...', '..KWWK....'], { K: '#2a2a32', S: '#5a5a66', W: '#8a5a2a', B: '#c9a24a' }],
    proviant: [['..........', '..KKKKKK..', '.KBBBBBBK.', '.KMMMMMMK.', '.KBBBBBBK.', '.KBBBBBBK.', '.KMMMMMMK.', '.KBBBBBBK.', '..KKKKKK..', '..........'], { K: '#4a2e16', B: '#b07a3c', M: '#7a7a84' }],
    logport: [['..........', '...KKKK...', '..KLLLLK..', '.KLWLLLLK.', '.KLLLRLLK.', '.KLLLLLLK.', '..KLLLLK..', '.KBBBBBBK.', 'KBBBBBBBBK', '.KKKKKKKK.'], { K: '#2a3a4a', L: '#bfe6f6', W: '#ffffff', R: '#e0483b', B: '#a8693a' }],
    steckbrief: [['.KKKKKKKK.', '.KPPPPPPK.', '.KPKKKKPK.', '.KPPPPPPK.', '.KPPFFPPK.', '.KPFFFFPK.', '.KPPFFPPK.', '.KPKKKKPK.', '.KPPPPPPK.', '.KKKKKKKK.'], { K: '#6b4422', P: '#f3e2b4', F: '#8a6a4a' }],
    muenze: [['..........', '...KKKK...', '..KGGGGK..', '.KGYGGYGK.', '.KGGVVGGK.', '.KGGVVGGK.', '.KGYGGYGK.', '..KGGGGK..', '...KKKK...', '..........'], { K: '#8a5a10', G: '#f2c94c', Y: '#fff2a8', V: '#4f9a4a' }],
    trainbuch: [['..........', '.KKKKKKKK.', '.KRRRRRRK.', '.KRWWWWRK.', '.KRRRRRRK.', '.KRSKKSRK.', '.KRSSSSRK.', '.KRSKKSRK.', '.KKKKKKKK.', '..........'], { K: '#3a2416', R: '#c2412f', W: '#fff2d0', S: '#5a5a66' }],
    fruchtkorb: [['..........', '...G..G...', '..PPGOOO..', '.PPPPOOOO.', '.PPPPOOOO.', 'KBBBBBBBBK', 'KBWBWBWBBK', '.KBBBBBBK.', '..KBWBWK..', '...KKKK...'], { K: '#4a2e16', B: '#c08a4a', W: '#8a5a2a', P: '#9b7ac8', O: '#f39a2a', G: '#4f9a4a' }],
    kriegskasse: [['..........', '...Y.Y.Y..', '..YGYGYGY.', '.KKKKKKKK.', 'KBBBBBBBBK', 'KKKKGGKKKK', 'KBBBGGBBBK', 'KBBBBBBBBK', 'KKKKKKKKKK', '..........'], { K: '#4a2e16', B: '#b07a3c', G: '#c99a2e', Y: '#f2d24a' }],
    kampfgeist: [['....R.....', '...RR..R..', '..RRYR.RR.', '..RYYRRRR.', '.RRYYYYRR.', '.RYYWWYYR.', '.RYWWWWYR.', '.RRYWWYRR.', '..RRRRRR..', '..........'], { R: '#e0483b', Y: '#f2a02a', W: '#fff2a8' }],
    schleifstein: [['........S.', '.......SW.', '......SW..', '.....SW...', '....SW....', '..KKSKKKK.', '.KGGGGGGGK', '.KGgGgGgGK', '.KKKKKKKKK', '..........'], { K: '#3a3a44', S: '#9aa4b0', W: '#eef2f6', G: '#8a8f9a', g: '#6a6f7a' }],
    rumfass: [['..........', '......KK..', '......KGK.', '..KKKKKGK.', '.KBBBBKGK.', '.KMMMMKKK.', '.KBBBBBBK.', '.KMMMMMMK.', '..KKKKKK..', '..........'], { K: '#3a2416', B: '#a8693a', M: '#6a6a74', G: '#5aa04a' }]
  };
  const gearArtCache = {};
  function gearIco(id) {
    const a = GEAR_ART[id];
    if (!a) return GL.sprites.icon('relic', id);
    if (!gearArtCache[id]) {
      let r = '';
      a[0].forEach((row, y) => row.split('').forEach((ch, x) => { const f = a[1][ch]; if (f) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${f}"/>`; }));
      gearArtCache[id] = `<svg class="icon gear-art" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
    }
    return gearArtCache[id];
  }
  function pxIco(name) {
    if (name === 'chest') return `<i class="pxi pxi-chest">${PX_CHEST(false)}</i>`;
    if (name === 'fire') return `<i class="pxi pxi-fire">${PX_FLAME}</i>`;
    const a = PXI_ART[name];
    if (!a) return '';
    if (!pxiCache[name]) {
      let r = '';
      a[0].forEach((row, y) => row.split('').forEach((ch, x) => { const f = ch === 'C' ? 'currentColor' : a[1][ch]; if (f) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${f}"/>`; }));
      pxiCache[name] = `<i class="pxi pxi-${name}"><svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${r}</svg></i>`;
    }
    return pxiCache[name];
  }
  function weekPop(profile) {
    const w = GL.meta.weekly(profile);
    const row = t => `<div class="wk-task${t.done ? ' done' : ''}"><i>${t.done ? '✓' : ''}</i><span><b>${esc(t.text)}</b><span class="goal-bar"><i style="width:${Math.round(100 * t.have / t.need)}%"></i></span></span><em>${t.have}/${t.need}</em></div>`;
    return `<div class="fpop-card week-pop"><div class="wk-head"><span class="event-kicker">Wochen-Herausforderung</span><b>${w.id.split('-W')[1]}. Woche</b></div>
      <p class="hint">Drei Aufgaben, jede Woche neu. Alle geschafft: <b>episches Ausrüstungsteil, 150 Berry, 3 Meersplitter</b>.</p>
      <div class="wk-tasks">${w.tasks.map(row).join('')}</div>
      <div class="fpop-btns">${w.done && !w.claimed ? '<button class="btn" data-act="week-claim">Belohnung abholen</button>' : `<button class="btn ghost" data-act="pop-close">${w.claimed ? 'Diese Woche geschafft ✓' : 'Schließen'}</button>`}</div></div>`;
  }
  // Kleine Pixel-Pfeile für Vergleiche (besser/schlechter)
  const PX_UP = '<svg viewBox="0 0 5 3" aria-hidden="true"><rect x="2" y="0" width="1" height="1"/><rect x="1" y="1" width="3" height="1"/><rect x="0" y="2" width="5" height="1"/></svg>';
  const PX_DOWN = '<svg viewBox="0 0 5 3" aria-hidden="true"><rect x="0" y="0" width="5" height="1"/><rect x="1" y="1" width="3" height="1"/><rect x="2" y="2" width="1" height="1"/></svg>';
  // Passt die Figur zur Crew? (schaltet einen Bonus frei)
  function fitTag(run, d) {
    const before = GL.effects.status(run.crew), after = GL.effects.status(run.crew.concat([{ id: d.id, type: d.type, role: d.role, faction: d.faction }]));
    const gain = after.find((x, i) => x.active && x.active !== before[i].active);
    if (gain) return `<i class="fit-tag" title="Schaltet frei: ${esc(gain.name)}">+ Bonus</i>`;
    if (GL.effects.duosWith(run.crew, d.id).length) return `<i class="fit-tag duo" title="Bildet ein Duo">♥ Duo</i>`;
    // Bande wächst: wie viele fehlen dann noch bis zur nächsten Stufe?
    const near = after.find((x, i) => x.kind === 'faction' && before[i].count > 0 && x.count > before[i].count && x.next);
    if (near) return `<i class="fit-tag near" title="${esc(near.name)}: ${near.count}/${near.next.n}">${pxIcon(near.key)}${near.count}/${near.next.n}</i>`;
    return '';
  }
  function cmpArrow(a, b) {
    const r = (a - b) / Math.max(1, b);
    const k = r >= 0.2 ? 'uu' : r >= 0.05 ? 'u' : r <= -0.2 ? 'dd' : r <= -0.05 ? 'd' : 'e';
    return k === 'e' ? '<i class="pa pa-eq">=</i>' : `<i class="pa ${k[0] === 'u' ? 'pa-up' : 'pa-dn'}">${k.split('').map(() => k[0] === 'u' ? PX_UP : PX_DOWN).join('')}</i>`;
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

  // Sterne zusammenlegen: passendes Crewmitglied zum Doppel-Angebot
  function mergeTwin(run, o) {
    if (!o || !o.dup) return null;
    return run.crew.find(u => u.id === o.id && (u.stars || 1) === (o.stars || 1) && (o.stars || 1) < 3) || null;
  }
  const PX_STAR_UP = '<svg class="px-starup" viewBox="0 0 9 9" width="12" height="12" shape-rendering="crispEdges" aria-hidden="true"><path fill="#ffd34a" d="M4 0h1v2h2v1h2v1H8v1H7v1h1v2H7V7H5V6H4v1H2v1H1V6h1V5H1V4H0V3h2V2h2z"/><path fill="#b8860b" d="M4 6h1v1H4zM2 7h1v1H2zM6 7h1v1H6z"/></svg>';

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
    const rows = ITEM_PIX[it.id] || (GL.data.items.find(x => x.id === it.id) || {}).px;
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
  // Crew-Kachel im Puzzle-Stil: Bild, Wappen, Leben als Balken, Werte nur als Tendenz (Pfeile im Vergleich
  // zum Crew-Schnitt). Genaue Zahlen per Hover/Finger-Halten, alles Weitere per Antippen im Steckbrief.
  function crewCard(u, i, hp, avg) {
    const d = crewData(u.id);
    const dead = hp <= 0;
    const A = avg || { atk: u.atk, max: u.max, spd: u.spd };
    const t = u.trait ? trait(u.trait) : null;
    const tip = `${d.name} · Lv ${u.lvl}\nLeben ${hp}/${u.max} · Angriff ${u.atk} · Tempo ${u.spd}${t ? '\n' + t.name + ': ' + t.text : ''}\nPfeile: im Vergleich zum Schnitt deiner Crew. Antippen für den Steckbrief.`;
    const st = (ico, lbl, v, a) => `<span class="pz-st" aria-label="${lbl} ${v}"><i>${ico}</i>${cmpArrow(v, a)}</span>`;
    return `<div class="u member pz${dead ? ' dead' : ''} role-bg-${d.role || ''}" role="button" tabindex="0" data-act="sheet" data-i="${i}" data-tip="${esc(tip)}" aria-label="Steckbrief von ${d.name}">
      <span class="pz-top">${d.faction ? pxIcon(d.faction) : ''}${pxIcon(d.type)}${pxIcon(d.role)}<em class="pz-lv">${u.lvl}</em></span>
      <b class="av">${GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d)}</b>
      ${dead ? `<span class="down-mark">${PX_GRAVE}<b>K.O.</b></span>` : ''}
      <span class="u-name">${esc(d.name)}</span>
      <span class="pz-stars">${stars(u.stars)}</span>
      <div class="bar"><i style="width:${Math.max(0, 100 * hp / u.max)}%"></i></div>
      <span class="pz-stats">${st('⚔', 'Angriff', u.atk, A.atk)}${st('♥', 'Leben', u.max, A.max)}${st('➤', 'Tempo', u.spd, A.spd)}</span>
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
      ${u.hp <= 0 ? `<span class="down-mark">${PX_GRAVE}<b>K.O.</b></span>` : ''}
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
  // ---------- Tiefe der Figuren: Spielweise, wann die Fähigkeit wirkt, warum sie sich lohnt ----------
  const styleOf = id => (GL.data.styles || {})[id] || '';
  const SHE = ['nami', 'robin', 'hina', 'tashigi', 'kalifa', 'vivi', 'hancock', 'alvida', 'koala', 'perona', 'bonney'];
  // Wann greift die Fähigkeit? Kurzes Schild statt langer Erklärung
  function abWhen(a) {
    if (!a) return '';
    const K = { ramp: 'bei jedem Treffer', slow: 'zum Kampfstart', rally: 'zum Kampfstart', curse: 'zum Kampfstart', mimic: 'zum Kampfstart', oasis: 'zum Kampfstart',
      medic: 'jede Runde', execute: 'beim Treffer', revive: 'einmal pro Kampf', thorns: 'wenn getroffen', burn: 'bei jedem Treffer', chain: 'bei jedem Treffer',
      lifesteal: 'bei jedem Treffer', double: 'jede Runde', sniper: 'immer' };
    if (a.kind && K[a.kind]) return K[a.kind];
    if (a.status) return a.status.when === 'start' ? 'zum Kampfstart' : a.status.when === 'hit' ? 'beim Treffer' : a.status.when === 'every' ? `alle ${a.status.n || 3} Runden` : '';
    return 'immer aktiv';
  }
  // Duo-Partner und Kampfstil-Vorteil, automatisch aus den Daten
  function goodWith(id) {
    return (GL.data.duos || []).filter(x => x.a === id || x.b === id).map(x => crewData(x.a === id ? x.b : x.a)).filter(Boolean);
  }
  // Bis zu zwei Gründe, warum sich die Figur JETZT für diese Crew lohnt
  function whyNow(run, d, m) {
    const out = [];
    const before = GL.effects.status(run.crew), probe = { id: d.id, type: d.type, role: d.role, faction: d.faction };
    const after = GL.effects.status(run.crew.concat([probe]));
    after.forEach((s, i) => { if (s.active && s.active !== before[i].active) out.push({ ico: pxIcon(s.key), t: `Aktiviert ${s.name} ${s.count}: ${s.active.text}` }); });
    GL.effects.duosWith(run.crew, d.id).forEach(x => out.push({ ico: '<i class="why-heart">♥</i>', t: `Duo ${x.name}: ${x.text}` }));
    const alive = run.crew.filter(u => u.hp > 0);
    const roles = new Set(alive.map(u => (crewData(u.id) || {}).role));
    if (d.role === 'helfer' && !roles.has('helfer')) out.push({ ico: pxIcon('helfer'), t: 'Deine Crew hat noch keinen Helfer. Mit Heilung hält sie länger durch.' });
    if (d.role === 'brecher' && !roles.has('brecher')) out.push({ ico: pxIcon('brecher'), t: 'Noch steht kein Brecher vorne, der die Schläge abfängt.' });
    const boss = GL.run.boss ? GL.run.boss(run) : null;
    if (boss && GL.data.types[d.type] && GL.data.types[d.type].strong === boss.type) out.push({ ico: pxIcon(d.type), t: `Stark gegen ${boss.name}, den Boss dieses Meeres (${GL.data.types[boss.type].name}).` });
    const bestAtk = Math.max(0, ...alive.map(u => u.atk));
    if (m && m.atk > bestAtk && alive.length) out.push({ ico: '<i class="why-sword">⚔</i>', t: `Höchster Angriff an Bord (${m.atk}).` });
    return out.slice(0, 2);
  }
  // Fähigkeit und Ulti als kleine, lebendige Blöcke
  function abilityBlock(d) {
    const a = ability(d.id), u = ultiOf(d.id, d.role);
    const st = styleOf(d.id), mates = goodWith(d.id).slice(0, 3);
    return `${st ? `<p class="tv-style">„${esc(st)}“</p>` : ''}
      ${a ? `<div class="tv-abx ty-${d.type}"><span class="abx-k">Fähigkeit</span><b>${esc(a.name)}</b><em class="abx-when">${esc(abWhen(a))}</em><small>${esc(a.text)}</small></div>` : ''}
      ${u ? `<div class="tv-abx ult"><span class="abx-k">Ulti</span><b>${esc(u.name)}</b><em class="abx-when">wenn die Leiste voll ist</em><small>${esc(u.text)}</small></div>` : ''}
      ${mates.length ? `<p class="tv-mates"><span>Gut mit</span>${mates.map(c => `<i title="${esc(c.name)}">${GL.sprites.render(c)}</i>`).join('')}<small>${mates.map(c => esc(c.name)).join(', ')}</small></p>` : ''}`;
  }

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
  const FAC_SHORT = { strohhut: 'Strohhut', marine: 'Marine', cp9: 'CP9', baroque: 'Baroque', weissbart: 'Weißbart', samurai: 'Samurai', buggy: 'Buggy', fischmensch: 'Arlong', revolution: 'Revolution', rothaar: 'Rothaar', supernova: 'Supernova', thriller: 'Thriller Bark' };
  // Figurenkarte: Rahmen in der Farbe der Bande, oben das Banden-Band, unten klare Werte-Leiste
  // Erster Satz, ohne Klammern, höchstens ~56 Zeichen
  function shortText(t) {
    if (GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en') t = GL.i18n.t(String(t || ''));
    let s = String(t || '').replace(/\s*\([^)]*\)/g, '').split(/(?<=[.!])\s/)[0].replace(/[.!]$/, '');
    return s.length > 74 ? s.slice(0, 72).replace(/\s+\S*$/, '') + '…' : s;
  }
  // Kleine lebendige Bühne hinter jeder Figur: Thema nach Bande, sonst nach Kampfstil
  const CARD_THEME = { strohhut: 'beach', marine: 'navy', cp9: 'city', baroque: 'desert', weissbart: 'whale', samurai: 'dusk', buggy: 'circus', fischmensch: 'reef', revolution: 'wind', rothaar: 'sunset', supernova: 'bubble', thriller: 'grave' };
  const TYPE_THEME = { kraft: 'beach', klinge: 'bamboo', technik: 'town' };
  // Eigene Kulisse für die Strohhüte und ein paar Ikonen: Heimat oder Lieblingsort
  const CHAR_THEME = { ruffy: 'foosha', zorro: 'dojo', nami: 'orchard', lysop: 'syrup', sanji: 'baratie', chopper: 'snow', robin: 'ruins', franky: 'dock', brook: 'mist', enel: 'sky', ace: 'whale', shanks: 'sunset', vivi: 'desert', mihawk: 'dusk' };
  function cardDelay(id) { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return -((h % 23) / 10).toFixed(1); }
  function cardStage(d, forceTh) {
    const th = forceTh || CHAR_THEME[d.id] || CARD_THEME[d.faction] || TYPE_THEME[d.type] || 'beach';
    const props = {
      beach: '<i class="cs-ship"></i><i class="cs-palm"></i>',
      navy: '<i class="cs-flag"></i><i class="cs-post"></i>',
      city: '<i class="cs-moon"></i><i class="cs-house a"></i><i class="cs-house b"></i>',
      desert: '<i class="cs-dune"></i><i class="cs-cactus"></i>',
      whale: '<i class="cs-ship big"></i>',
      dusk: '<i class="cs-cliff"></i><i class="cs-bird"></i>',
      circus: '<i class="cs-tent"></i>',
      reef: '<i class="cs-coral a"></i><i class="cs-coral b"></i><i class="cs-bub a"></i><i class="cs-bub b"></i>',
      wind: '<i class="cs-hill"></i><i class="cs-leaf a"></i><i class="cs-leaf b"></i>',
      sunset: '<i class="cs-ship"></i>',
      bubble: '<i class="cs-bub a"></i><i class="cs-bub b"></i><i class="cs-bub c"></i>',
      grave: '<i class="cs-moon"></i><i class="cs-stone"></i><i class="cs-tree"></i>',
      bamboo: '<i class="cs-bam a"></i><i class="cs-bam b"></i><i class="cs-bam c"></i>',
      town: '<i class="cs-house a"></i><i class="cs-house b"></i><i class="cs-lamp"></i>',
      foosha: '<i class="cs-hill"></i><i class="cs-mill"><i class="cs-blades"></i></i><i class="cs-hatsign"></i>',
      dojo: '<i class="cs-wall"></i><i class="cs-rack"></i><i class="cs-dummy"></i>',
      orchard: '<i class="cs-mtree a"></i><i class="cs-mtree b"></i><i class="cs-mtree c"></i>',
      syrup: '<i class="cs-hill"></i><i class="cs-fence"></i><i class="cs-target"></i>',
      baratie: '<i class="cs-fishboat"></i><i class="cs-pot"><i class="cs-steam"></i></i>',
      snow: '<i class="cs-peak"></i><i class="cs-flake a"></i><i class="cs-flake b"></i><i class="cs-flake c"></i>',
      ruins: '<i class="cs-pillar a"></i><i class="cs-pillar b"></i><i class="cs-glyph"></i><i class="cs-moon"></i>',
      dock: '<i class="cs-crane"></i><i class="cs-cola"></i>',
      mist: '<i class="cs-moon"></i><i class="cs-ghostship"></i><i class="cs-fog a"></i><i class="cs-fog b"></i>',
      sky: '<i class="cs-bell"></i><i class="cs-puff a"></i><i class="cs-puff b"></i>'
    }[th] || '';
    return `<span class="c3-stage cs-${th}" aria-hidden="true"><i class="cs-cloud"></i><i class="cs-cloud b"></i><i class="cs-sea"></i>${props}<i class="cs-ground"></i><i class="cs-spark"></i></span>`;
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
        <span class="c3-head"><span class="c3-fac${!fac && d.crewName ? ' own' : ''}">${fac ? pxIcon(d.faction, 'sm') + esc(FAC_SHORT[d.faction] || fac.name) : d.crewName ? '<i class="c3-jolly" aria-hidden="true"></i>' + esc(d.crewName) : 'Ohne Bande'}</span>${o.stars ? stars(o.stars) : ''}</span>
        ${cardStage(d)}
        <span class="c3-sprite" style="--cd:${cardDelay(d.id)}s"><i class="c3-shadow" aria-hidden="true"></i>${GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d)}</span>
        ${o.lvl ? `<em class="c3-lv">Lv ${o.lvl}</em>` : ''}
      </span>
      <span class="c3-name">${d.name}</span>
      <span class="c3-sub"><span class="c3-tag"><i class="c3-dot t-${d.type}"></i>${T ? esc(T.name) : ''}</span><span class="c3-tag">${R ? (ROLE_ICON[d.role] || '') + ' ' + esc(R.name) : ''}</span></span>
      ${o.style && styleOf(d.id) ? `<span class="c3-style">${esc(styleOf(d.id))}</span>` : ''}
      <span class="c3-ab">
        ${a ? `<span title="${esc(a.text)}"><b>${a.name}</b> ${esc(shortText(a.text))}</span>` : ''}
        ${t ? `<span class="c3-trait" title="${esc(t.text)}"><b>${t.name}</b> ${esc(shortText(t.text))}</span>` : ''}
        ${d.self && d.fruit ? (sf => sf ? `<span class="c3-fruit" title="${esc(sf.text)}"><i>${GL.sprites.icon('fruit', sf.id)}</i><b>${esc(sf.name)}</b> ${esc(shortText(sf.text))}</span>` : '')(GL.data.fruits.some(f => f.id === d.fruit.id) ? GL.loot.fruit(d.fruit) : null) : ''}
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
  // Was bringt eine Frucht deiner Crew gerade konkret? (z. B. „+43 Leben für 2 Verletzte“ oder „Crew ist gesund“)
  function lootBenefit(run, item) {
    const e = item && item.effect; if (!run || !e) return null;
    const alive = run.crew.filter(u => u.hp > 0), front = alive[0];
    const STN = { atk: 'Angriff', hp: 'Leben', spd: 'Tempo' };
    const one = x => {
      if (x.type === 'healAll') {
        const miss = alive.reduce((s, u) => s + (u.max - u.hp), 0), n = alive.filter(u => u.hp < u.max).length;
        return miss > 0 ? { t: `+${miss} Leben für ${n} ${n === 1 ? 'Verletzten' : 'Verletzte'}`, good: miss >= 20 } : { t: 'Deine Crew ist gerade gesund', good: false, meh: true };
      }
      if (x.type === 'buffAll') return null;   // steht schon im Kartentext
      if (x.type === 'buffFront') return front ? { t: `+${x.value} ${STN[x.stat] || x.stat} für ${crewData(front.id).name} (vorne)`, good: true } : null;
      if (x.type === 'crit') return null;
      return null;
    };
    const L = (e.type === 'multi' ? e.list.map(one) : [one(e)]).filter(Boolean);
    return L.length ? { t: L.map(x => x.t).join(' · '), meh: L.every(x => x.meh), good: L.some(x => x.good) } : null;
  }
  // Leben der Crew als kleine Leiste über der Auswahl
  function crewHpStrip(run) {
    return `<div class="hp-strip">${run.crew.map(u => { const d = crewData(u.id), p = Math.max(0, Math.round(100 * u.hp / u.max));
      return `<span class="hs-u${u.hp <= 0 ? ' ko' : ''}" data-tip="${esc(d.name)}: ${u.hp}/${u.max} Leben"><i>${GL.sprites.render(d)}</i><b class="hs-bar"><s class="${p > 50 ? 'hi' : p > 20 ? 'mid' : 'lo'}" style="width:${p}%"></s></b></span>`; }).join('')}</div>`;
  }
  function lootCardFace(item, kind, ben) {
    const rid = item.awakened ? 'awakened' : item.rarity >= 0 ? GL.config.rarities[item.rarity].id : 'unique';
    const label = item.awakened ? 'Erwacht' : item.rarity >= 0 ? GL.loot.rarityName(item.rarity) : 'Einzigartig';
    return `<span class="card-face loot-face frame-${rid}">
      <span class="card-rarity rar rar-${rid}">${label}</span>
      <span class="card-art art-loot">${GL.sprites.icon(kind, item.id, item.awakened)}</span>
      <span class="card-name">${item.name}</span>
      <span class="card-type">${kind === 'fruit' ? 'Teufelsfrucht' : 'Schatz'}</span>
      <span class="card-text">${item.text}</span>
      ${ben ? `<span class="card-ben${ben.meh ? ' meh' : ben.good ? ' good' : ''}">${ben.meh ? '◦' : '▲'} ${esc(ben.t)}</span>` : ''}
    </span>`;
  }

  // Schatz-Karten: Beute schwebt über einem Pixel-Podest mit Lichtstrahlen in der Seltenheitsfarbe,
  // Name auf einem Holzschild, Effekt auf Pergament und ein 3D-„Nehmen“-Schild. Gleiche Auswahl-Logik wie vorher.
  const TC_COL = { common: ['#a8753c', '#6b4424', '#d9b36a'], rare: ['#3f86b8', '#24557a', '#9fd3f0'], epic: ['#8a55c8', '#55307f', '#d4b4f5'], legendary: ['#e0a030', '#9a6a14', '#ffe08a'], awakened: ['#d9483a', '#8a2a20', '#ffb39a'], unique: ['#2f9a8a', '#1d6158', '#a8ece0'] };
  function tcPedestal(rid) {
    const [band, dark, hi] = TC_COL[rid] || TC_COL.common;
    const r = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    return `<svg class="tc-chest tc-ped" viewBox="0 0 20 16" shape-rendering="crispEdges" aria-hidden="true">${
      r(2, 6, 16, 2, hi) + r(1, 7, 18, 2, band) + r(1, 9, 18, 1, dark) + r(5, 10, 10, 3, '#b07a44') + r(5, 10, 10, 1, '#d9a868') + r(5, 12, 10, 1, '#5e3b1d') + r(3, 13, 14, 3, '#8a5a30') + r(3, 13, 14, 1, '#b07a44') + r(3, 15, 14, 1, '#5e3b1d')}</svg>`;
  }
  // Teufelsfrucht: Familie, Eigenheit und was sie mit deinen anderen Früchten macht (Fork M)
  function fruitFamLine(item) {
    const fd = (GL.data.fruits || []).find(f => f.id === item.id);
    const FAM = GL.data.fruitFams || {};
    if (!fd || !fd.fam || !FAM[fd.fam]) return '';
    let run = null; try { run = GL.save.loadRun(); } catch (e) { /* egal */ }
    const ids = [...new Set((run && run.eaten) || [])];
    const have = ids.filter(id => { const f = GL.data.fruits.find(x => x.id === id); return f && f.fam === fd.fam; });
    const n = have.length + (have.includes(item.id) ? 0 : 1);
    const T = FAM[fd.fam].tiers;
    const hit = T.filter(x => x.n === n)[0];
    const max = T[T.length - 1].n;
    return `<span class="fr-fam fam-${fd.fam}"><b>${FAM[fd.fam].icon} ${esc(FAM[fd.fam].name)} ${Math.min(n, max)}/${max}</b>${fd.mech ? `<small>${esc(fd.mech)}</small>` : ''}${hit ? `<em>Neu: ${esc(hit.text)}</em>` : ''}</span>`;
  }
  function treasureFace(item, kind, ben) {
    const rid = item.awakened ? 'awakened' : item.rarity >= 0 ? GL.config.rarities[item.rarity].id : 'unique';
    const label = item.awakened ? 'Erwacht' : item.rarity >= 0 ? GL.loot.rarityName(item.rarity) : 'Einzigartig';
    return `<span class="tc-face tc-${rid}">
      <span class="tc-stage"><i class="tc-rays"></i><i class="tc-glow"></i>${tcPedestal(rid)}
        <span class="tc-item">${GL.sprites.icon(kind, item.id, item.awakened)}</span>
        <i class="tc-sp a">✦</i><i class="tc-sp b">✦</i><i class="tc-sp c">✧</i></span>
      <span class="tc-info">
        <span class="tc-rib">${label} · ${kind === 'fruit' ? 'Teufelsfrucht' : 'Schatz'}</span>
        <span class="tc-sign">${item.name}</span>
        <span class="tc-text">${item.text}</span>
        ${kind === 'fruit' ? fruitFamLine(item) : ''}
        ${ben ? `<span class="card-ben tc-ben${ben.meh ? ' meh' : ben.good ? ' good' : ''}">${ben.meh ? '◦' : '▲'} ${esc(ben.t)}</span>` : ''}
        <span class="tc-take"><span class="tc-take-a">Antippen</span><span class="tc-take-b">✓ Gewählt</span></span>
      </span>
    </span>`;
  }

  function cardButton(i, face, cls, tip) {
    const isTip = tip && tip.index === i;
    const r = window.__glRunRef;
    const picked = GL.pickSel && r && GL.pickSel.key === r.seed + ':' + r.step + ':' + r.phase && GL.pickSel.i === i;
    const anyPicked = GL.pickSel && r && GL.pickSel.key === r.seed + ':' + r.step + ':' + r.phase;
    return `<button class="opt card${cls ? ' ' + cls : ''}${isTip ? ' is-tip' : ''}${picked ? ' picked' : anyPicked ? ' unpicked' : ''}" data-act="pick" data-i="${i}">
      ${i < 9 ? `<kbd class="key">${i + 1}</kbd>` : ''}${isTip ? '<span class="tip-badge">Tipp</span>' : ''}${face}${picked ? '<span class="pick-ok">✓</span>' : ''}</button>`;
  }

  // Nach dem ersten Tipp auf eine Karte: großer Bestätigen-Knopf unten (zweiter Tipp auf die Karte geht auch)
  function pickDock(run, items) {
    const key = run.seed + ':' + run.step + ':' + run.phase;
    const skip = `<button class="pick-skip" data-act="loot-skip">Überspringen · +${GL.config.skipGold || 10} ${GL.sprites.coin()}</button>`;
    if (!(GL.pickSel && GL.pickSel.key === key && items[GL.pickSel.i])) return `<p class="hint pick-hint">Antippen zum Auswählen, dann bestätigen.</p><p class="pick-skip-row">${skip}</p>`;
    const it = items[GL.pickSel.i];
    const chk = '<svg class="px-chk" viewBox="0 0 7 6" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M6 0h1v1h-1zM5 1h1v1h-1zM6 1h1v1h-1zM0 2h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM0 3h1v1h-1zM1 3h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM1 4h1v1h-1zM2 4h1v1h-1zM3 4h1v1h-1zM2 5h1v1h-1z"/></svg>';
    return `<div class="dock pick-dock"><button class="btn" data-act="pick" data-i="${GL.pickSel.i}">${run.phase === 'treasure' ? pxIco('chest') : chk} ${esc(it.name || 'Auswahl')} nehmen</button></div><p class="pick-skip-row">${skip}</p>`;
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
      lvl: m.lvl, stars: offer.stars, trait: offer.trait, gold: d.locked, style: /(^|\s)cap(\s|$)/.test(extraCls || ''),
      extra: withPreview ? unlockPreview(run, d) : ''
    }), extraCls, tip);
  }

  // ---------- Kopfzeile ----------

  function header(run) {
    const total = GL.run.totalSteps();
    const per = GL.config.stepsPerIsland;
    // Reiseleiste: Tau mit Etappen-Knoten, Inseln als kleine Inseln, Meeresende als Flagge, das Schiff zeigt, wo du bist
    const cs = GL.config.chapterSteps, at = Math.min(run.step, total - 1);
    const px = i => ((i + 0.5) / total * 100).toFixed(2);
    const marks = Array.from({ length: total }, (_, i) => {
      const st = i < run.step ? 'done' : i === run.step ? 'now' : '';
      const kind = i % per === per - 1 ? 'sea' : i % cs === cs - 1 ? 'isl' : 'dot';
      return `<i class="vy-m ${kind} ${st}" style="left:${px(i)}%"></i>`;
    }).join('');
    const bars = `<span class="voy" aria-label="Etappe ${run.step + 1} von ${total}"><span class="vy-rope"><i class="vy-fill" style="width:${px(at)}%"></i></span>${marks}<span class="vy-ship" style="left:${px(at)}%">${GL.sprites.ship()}</span></span>`;
    const here = GL.run.chapterIsland(run);
    const island = here && run.phase !== 'course' ? here.name : GL.run.island(run).name;
    const pos = Math.min(GL.run.rowIdx(run) + 1, GL.config.chapterSteps);
    return `${bars}<span class="track-loc">${island} · <b class="stop-name">${run.phase === 'course' ? 'Kurs setzen' : run.phase === 'starter' ? 'Kapitän wählen' : GL.run.stopName(run)}</b>${run.phase === 'course' || run.phase === 'starter' ? '' : ` <small class="muted">(${pos}/${GL.config.chapterSteps})</small>`}</span>
      <span class="head-chips">
        <em class="gold-chip" data-tip="Gold für die Taverne.\nGibt es für Siege, verfällt am Run-Ende.">${GL.sprites.coin()} <b>${run.gold || 0}</b></em>
        <em class="bounty-chip" id="bounty-chip" data-tip="Kopfgeld deines Kapitäns.\nZählt für deinen Punktestand und die Rangliste 'Höchstes Kopfgeld'. Bringt sonst nichts im Run.">${GL.sprites.icon('node', 'elite')} <b>${fmtBounty(run.bountyM || 0)}</b></em>${run.mood && GL.config.moods ? (m => m ? `<em class="mood-chip" data-tip="${esc('Laune der See: ' + m.name + '\n' + m.text)}">${m.icon}<b>${esc(m.name)}</b></em>` : '')(GL.config.moods.find(x => x.id === run.mood)) : ''}${GL.run.twist && !GL.run.isFinished(run) ? (tw => tw ? `<em class="mood-chip twist-chip" data-tip="${esc('Insel-Twist: ' + tw.name + '\n' + tw.text)}">${tw.icon}<b>${esc(tw.name)}</b></em>` : '')(GL.run.twist(run)) : ''}${(bd => bd ? `<em class="mood-chip build-chip b-${bd.key}" data-tip="${esc('Dein Stil: ' + bd.name + ' (' + bd.count + '× ' + bd.label + ')\n' + bd.pitch + '\n' + bd.tiers.map(x => (bd.count >= x.n ? '✓ ' : '· ') + x.n + ': ' + x.text).join('\n') + comboTip(run.crew))}">${bd.icon}<b>${esc(bd.name)}</b><small>${'★'.repeat(bd.tier)}</small>${GL.effects.combos && GL.effects.combos(run.crew).length ? '<i class="combo-dot" aria-hidden="true">✦</i>' : ''}</em>` : '')(GL.effects.build ? GL.effects.build(run.crew) : null)}${run.epi && run.epi.part && !GL.run.isFinished(run) ? (ep => ep ? `<em class="mood-chip ep-chip" data-tip="${esc((GL.i18n && GL.i18n.lang() === 'en' ? 'Episode on this island: ' + ep.title[1] + '\nYour choices pay off before the villain.' : 'Folge auf dieser Insel: ' + ep.title[0] + '\nDeine Entscheidungen zahlen sich vor dem Bösewicht aus.'))}">📜<b>${esc(GL.i18n && GL.i18n.lang() === 'en' ? ep.title[1] : ep.title[0])} (${Math.min(3, run.epi.part)}/3)</b></em>` : '')((GL.data.crewEpisodes || []).find(e => e.id === run.epi.id)) : ''}${(run.streak || 0) >= 2 ? `<em class="streak-chip${run.streak >= 6 ? ' hot' : run.streak >= 3 ? ' warm' : ''}" data-tip="Kopfgeld-Serie: ${run.streak} Siege in Folge ohne K.O.\nAb 3 Siegen +1 Gold pro Sieg, ab 6 +2. Am Run-Ende Extra-Berry.\nFällt jemand, beginnt die Serie neu.">${PX_FLAME}<b>${run.streak}</b></em>` : ''}
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
        const tm = s.kind === 'faction' && GL.data.teamMoves && GL.data.teamMoves[s.key];
        const text = s.active.text + (s.next ? `<span class="muted"> Ab ${s.next.n}: ${s.next.text}</span>` : '')
          + (tm ? `<span class="syn-team${s.next ? '' : ' on'}">${s.next ? `Ab ${s.tiers[s.tiers.length - 1].n}` : 'Aktiv'}: Team-Fähigkeit <b>${esc(tm.name)}</b></span>` : '');
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
      parts.push('einen robusten Brecher in der Crew haben (steht automatisch vorne)');
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
  let seenRef = null, profRef = null;
  const isNewFoe = id => !!(seenRef && id && !(seenRef.bosses || []).includes(id));
  const isNewIsl = isl => !!(seenRef && isl && !(seenRef.islands || []).includes(isl.id) && !(seenRef.bosses || []).includes(isl.villain || isl.boss));
  const newChip = '<span class="new-chip" title="Noch nie besiegt">Neu</span>';

  function seaChart(run, boss, tip) {
    const ch = run.chart;
    if (!ch) return '';
    const N = GL.data.nodes;
    const rows = ch.rows;
    const pos = GL.run.rowIdx(run);
    // Kompakt: am Handy enger, und schon gesegelte Reihen fallen weg (nur die letzte bleibt als Ankerpunkt)
    const phone = typeof window !== 'undefined' && window.innerWidth < 560;
    const ROW = phone ? 74 : 92, TOP = phone ? 52 : 58, BOTTOM = pos === 0 ? (phone ? 64 : 80) : (phone ? 30 : 40);
    const o = Math.max(0, pos - 1);
    const H = TOP + (rows.length - 1 - o) * ROW + BOTTOM;
    // kleine, feste Verschiebung pro Ort, damit die Karte nicht wie ein Raster aussieht
    const jit = (r, i) => { const h = Math.sin((run.seed % 997) * 12.9898 + r * 78.233 + i * 37.719) * 43758.5453; return (h - Math.floor(h) - 0.5) * 7; };
    const X = (r, i) => (rows[r].length === 1 ? 58 : 20 + (i + 1) / (rows[r].length + 1) * 78 + jit(r, i));   // links Platz für die Inselnamen
    const Y = r => TOP + (rows.length - 1 - r) * ROW;
    const startX = 58, startY = H - (phone ? 22 : 26);
    const reach = new Map();
    run.optCols.forEach((c, k) => reach.set(c, k));
    const onPath = (r, i) => r < pos && ch.path[r] === i;

    // Wege
    let lines = '';
    const line = (x1, y1, x2, y2, cls) => { lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`; };
    if (o === 0 && pos === 0) rows[0].forEach((_, i) => line(startX, startY, X(0, i), Y(0), 'can'));
    rows.forEach((row, r) => r >= o && row.forEach((n, i) => n.next.forEach(j => {
      let cls = 'off';
      if (onPath(r, i) && onPath(r + 1, j)) cls = 'done';
      else if (r === pos - 1 && ch.at === i && reach.has(j)) cls = 'can';
      else if (r >= pos) cls = 'future';
      line(X(r, i), Y(r), X(r + 1, j), Y(r + 1), cls);
    })));

    // Orte
    let nodes = '';
    rows.forEach((row, r) => r >= o && row.forEach((n, i) => {
      if (r < pos && !onPath(r, i)) return;   // verpasste Orte der letzten Reihe nicht mehr zeigen
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
      if (r < o) return '';
      const name = GL.run.stopName(run, r);
      const state = r < pos ? 'done' : r === pos ? 'now' : '';
      return `<span class="sc-stop ${state}" style="top:${Y(r)}px">${name}</span>`;
    }).join('');
    return `<div class="sea-chart v2 isl-${GL.run.island(run).id}" style="height:${H}px">
      ${labels}
      <svg class="sc-lines" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
      ${pos === 0 ? `<span class="sc-start" style="left:${startX}%;top:${startY}px">Start</span>` : ''}
      ${o > 0 ? `<span class="sc-past">⚓ ${o} ${o === 1 ? 'Etappe' : 'Etappen'} gesegelt</span>` : ''}
      ${nodes}
      <span class="sc-ship" style="left:${shipX}%;top:${shipY}px" aria-hidden="true">${GL.sprites.ship()}</span>
    </div>`;
  }

  // Große Daumen-Karten unter der Seekarte: eine Karte pro erreichbarem Ort (gleiche Aktion wie die Kartenpunkte)
  const DOCK_TXT = { battle: 'Kampf, bringt Gold', elite: 'Starker Gegner, dafür ein Schatz', recruit: 'Neue Crew anheuern', fruit: 'Teufelsfrucht aussuchen',
    treasure: 'Schatz für den ganzen Run', rest: 'Alle heilen 40 %', boss: 'Kopfgeld und Erwachen', raid: 'Extrem stark, epische Frucht' };
  function routeDock(run, boss, tip) {
    const ch = run.chart;
    if (!ch || !run.optCols || !run.optCols.length) return '';
    const N = GL.data.nodes, pos = GL.run.rowIdx(run), row = ch.rows[pos] || [];
    const cards = run.optCols.map((col, k) => {
      const n = row[col];
      if (!n) return '';
      const isBoss = n.t === 'boss';
      const hunted = n.t === 'elite' && n.who ? enemyData(n.who) : null;
      const foe = isBoss ? boss : hunted;
      const isTip = tip && tip.index === k;
      const icon = foe ? GL.sprites.render(foe) : GL.sprites.icon('node', n.t);
      const name = isBoss ? boss.name : hunted ? hunted.name : N[n.t].title;
      const sub = isBoss ? N.boss.title : n.gate && hunted ? 'Bösewicht der Insel' : hunted ? 'Kopfgeld-Ziel' : DOCK_TXT[n.t] || N[n.t].text;
      return `<button class="rd-card n-${n.t}${foe ? ' rd-foe' : ''}${n.gate || isBoss ? ' rd-big' : ''}${isTip ? ' is-tip' : ''}" data-act="node" data-i="${k}" style="--d:${k * 0.05}s">
        ${isTip ? '<span class="tip-badge">Tipp</span>' : ''}${k < 9 ? `<kbd class="key">${k + 1}</kbd>` : ''}
        <span class="rd-ico">${icon}</span>
        <span class="rd-txt"><b>${esc(name)}</b><small>${esc(sub)}</small>${hunted ? `<em class="mn-bounty">${hunted.bounty} Mio. ฿</em>` : ''}${dangerTag(run, n.t)}</span>
      </button>`;
    }).join('');
    return `<div class="route-dock" role="group" aria-label="Nächster Halt"><span class="rd-kick">Nächster Halt</span><div class="rd-grid rd-n${run.optCols.length}">${cards}</div></div>`;
  }

  // ---------- Reise-Erzählung (statt Knotenkarte): Bühne, eine Figur beschreibt die Lage, Wahlkarten als kleine Szenen ----------
  // Alles fest aus Seed + Etappe gewählt (kein Zufallszug), gleiche Aktionen wie die Karte (data-act="node").
  const JR_LBL = { battle: ['Kampf', 'Fight'], elite: ['Kopfgeld', 'Bounty'], recruit: ['Taverne', 'Tavern'], fruit: ['Frucht', 'Fruit'], treasure: ['Schatz', 'Treasure'],
    rest: ['Rast', 'Rest'], boss: ['Boss', 'Boss'], raid: ['Raid', 'Raid'], gate: ['Bösewicht', 'Villain'] };
  function jrHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function journeyView(run, boss, tip) {
    const ch = run.chart, R = GL.data.routeLines;
    if (!ch || !run.optCols || !run.optCols.length || !R) return routeDock(run, boss, tip);
    const en = !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
    const L = v => (Array.isArray(v) ? v[en ? 1 : 0] : v);
    const pos = GL.run.rowIdx(run), row = ch.rows[pos] || [];
    const key = (run.seed || 0) + ':' + GL.run.chapterIdx(run) + ':' + pos;
    const pick = (list, salt) => list && list.length ? list[jrHash(key + ':' + salt) % list.length] : null;
    const here = GL.run.chapterIsland(run);
    // Sprecher: eine Figur aus der Crew, die etwas zu sagen hat (sonst Kalle die Zeitungsmöwe)
    const talkers = (run.crew || []).filter(u => R.intro[u.id]);
    const sp = talkers.length ? talkers[jrHash(key + ':who') % talkers.length] : null;
    const spId = sp ? sp.id : 'kalle';
    const spDef = sp ? (crewData(sp.id) || sp) : { id: 'kalle', name: 'Kalle' };
    const opts = run.optCols.map((col, k) => ({ k, n: row[col] })).filter(o => o.n);
    const foeOf = n => n.t === 'boss' ? boss : n.t === 'elite' && n.who ? enemyData(n.who) : null;
    const bigFoe = opts.map(o => foeOf(o.n)).find((f, i) => f && (opts[i].n.t === 'boss' || opts[i].n.gate));
    let line = bigFoe && jrHash(key + ':near') % 2 === 0 ? pick(R.near, 'near') : null;
    if (!line && here && R.isle[here.id] && pos === 0) line = pick(R.isle[here.id], 'isle');
    if (!line) line = pick(R.intro[spId] || R.intro.kalle, 'intro');
    const lineTxt = L(line || ['', '']).replace(/\{foe\}/g, bigFoe ? bigFoe.name : '');
    const spr = u => GL.sprites.render(u && u.id !== 'self' ? (crewData(u.id) || u) : u);
    // Grafik-Bibliothek (falls vorhanden): Szenen und Knoten-Icons, sonst eigene Pixel-Bühne
    const art = (fn, id) => { try { return GL.art && GL.art[fn] ? GL.art[fn](id, { run }) || '' : ''; } catch (e) { return ''; } };
    const kalleArt = '<svg viewBox="0 0 12 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="3" y="2" width="6" height="4" fill="#f4f1ea"/><rect x="2" y="3" width="1" height="2" fill="#f4f1ea"/><rect x="9" y="3" width="2" height="1" fill="#e8a53a"/><rect x="7" y="3" width="1" height="1" fill="#2a2a2a"/><rect x="4" y="1" width="3" height="1" fill="#5a6b8a"/><rect x="3" y="6" width="1" height="2" fill="#e8a53a"/><rect x="6" y="6" width="1" height="2" fill="#e8a53a"/><rect x="1" y="4" width="2" height="1" fill="#c9c4b8"/></svg>';
    const face = sp ? spr(sp) : kalleArt;
    const crewOnDeck = (run.crew || []).slice(0, 4).map((u, i) => `<i class="jr-mate" style="--i:${i}">${spr(u)}</i>`).join('');
    const seaCls = 'jr-sea-' + ((GL.run.island(run) || {}).id || 'east-blue');
    const cards = opts.map(({ k, n }) => {
      const isBoss = n.t === 'boss';
      const foe = foeOf(n);
      const kind = isBoss ? 'boss' : n.gate ? 'gate' : n.t;
      const isTip = tip && tip.index === k;
      let txt = L(pick(R.node[kind] || R.node[n.t] || R.node.battle, 'n' + k + kind) || ['', '']);
      if (foe) txt = txt.replace(/\{foe\}/g, foe.name);
      const icon = foe ? GL.sprites.render(foe) : (art('icon', n.t) || GL.sprites.icon('node', n.t));
      const lbl = L(JR_LBL[kind] || JR_LBL.battle);
      return `<button class="jr-card n-${n.t}${foe ? ' jr-foe' : ''}${isBoss || n.gate ? ' jr-big' : ''}${isTip ? ' is-tip' : ''}" data-act="node" data-i="${k}" style="--d:${0.12 + k * 0.08}s">
        ${isTip ? `<span class="tip-badge">${en ? 'Tip' : 'Tipp'}</span>` : ''}${k < 9 ? `<kbd class="key">${k + 1}</kbd>` : ''}
        <span class="jr-ico">${icon}</span>
        <span class="jr-txt"><span class="jr-lbl">${esc(lbl)}${foe ? ` · ${esc(foe.name)}` : ''}${foe && foe.bounty && !isBoss ? ` <em>${foe.bounty} Mio. ฿</em>` : ''}</span><b>${esc(txt)}</b>${dangerTag(run, n.t)}</span>
      </button>`;
    }).join('');
    return `<div class="journey ${seaCls}">
      <div class="jr-stage" aria-hidden="true">${(s => s ? `<span class="jr-art">${s}</span>` : '')(art('scene', (here && here.id) || ((GL.run.island(run) || {}).id)))}<i class="jr-sun"></i><i class="jr-cloud a"></i><i class="jr-cloud b"></i>
        ${here ? `<span class="jr-isle"><i></i></span>` : ''}
        <span class="jr-ship">${GL.sprites.ship ? GL.sprites.ship() : ''}</span><span class="jr-deck">${crewOnDeck}</span><i class="jr-wave a"></i><i class="jr-wave b"></i></div>
      <div class="jr-say"><span class="jr-face">${face}</span><span class="jr-bubble"><b>${esc(spDef.name || 'Kalle')}</b><span class="jr-line">${esc(lineTxt)}</span></span></div>
      <div class="jr-opts jr-n${opts.length}" role="group" aria-label="${en ? 'Where to?' : 'Wohin?'}">${cards}</div>
    </div>`;
  }

  // ---------- Buff-Leiste links (wie bei TFT) ----------
  // Zeigt alle Synergien, die die Crew gerade hat: aktive oben, angefangene darunter.
  function traitRail(run) {
    const list = GL.effects.status(run.crew).filter(s => s.count > 0);
    const famRows = GL.fruitFx ? GL.fruitFx.families(run).map(f => `<div class="tr tr-fruit${f.active ? ' on' : ' tr-off'}" tabindex="0" data-tip="${esc(f.name + ' (Teufelsfrüchte)\n' + f.text + '\n' + f.tiers.map(x => (f.count >= x.n ? '✓ ' : '· ') + x.n + ': ' + x.text).join('\n'))}">
        <span class="tr-icon"><span class="tr-hex">${f.icon}</span></span>
        <span class="tr-body"><b>${esc(f.name)}</b><span class="tr-steps">${f.tiers.map(x => `<i class="${f.count >= x.n ? 'on' : ''}">${x.n}</i>`).join('<b>›</b>')}</span></span>
        <span class="tr-count">${f.count}${f.next ? `<small>/${f.next.n}</small>` : ''}</span>
        <span class="tr-text">${f.active ? esc(f.active.text) : ''}${f.next ? `<em>Ab ${f.next.n}: ${esc(f.next.text)}</em>` : ''}</span>
      </div>`).join('') : '';
    if (!list.length && !GL.effects.duos(run.crew).length && !famRows) return '';
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
      const icon = ICON_ART[s.key] ? `<span class="tr-hex px">${pxIcon(s.key)}</span>` : `<span class="tr-hex">${s.name.slice(0, 2)}</span>`;
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
    const allyRows = GL.effects.alliances(run.crew).map(a => `<div class="tr tr-ally" tabindex="0" data-tip="${esc('Bündnis: ' + a.name + '\n' + a.text)}">
        <span class="tr-icon"><span class="tr-hex px">${pxIcon(a.a)}</span></span>
        <span class="tr-body"><b>${esc(a.name)}</b><span class="tr-steps">Bündnis</span></span>
        <span class="tr-text">${esc(a.text)}</span>
      </div>`).join('');
    const near = GL.effects.alliancesNear(run.crew).slice(0, 3).map(a => {
      const F = GL.data.factions, miss = GL.effects.status(run.crew).find(s => s.kind === 'faction' && s.key === a.a && s.active) ? a.b : a.a;
      return `<div class="tr tr-off tr-ally-near" tabindex="0"><span class="tr-icon"><span class="tr-hex px">${pxIcon(miss)}</span></span>
        <span class="tr-body"><b>${esc(a.name)}</b><span class="tr-steps">Bündnis</span></span>
        <span class="tr-text"><em>Fehlt: Set-Bonus ${esc(F[miss].name)}. ${esc(a.text)}</em></span></div>`;
    }).join('');
    const comboRows = (GL.effects.combos ? GL.effects.combos(run.crew) : []).map(c => `<div class="tr tr-combo" tabindex="0" data-tip="${esc('Stil-Kombo: ' + c.name + '\n' + c.text + '\n„' + c.joke + '“')}">
        <span class="tr-icon"><span class="tr-hex">${c.icon}</span></span>
        <span class="tr-body"><b>${esc(c.name)}</b><span class="tr-steps">Stil-Kombo</span></span>
        <span class="tr-text">${esc(c.text)}</span>
      </div>`).join('');
    const comboNear = (GL.effects.combosNear ? GL.effects.combosNear(run.crew) : []).slice(0, 2).map(c => `<div class="tr tr-off tr-combo-near" tabindex="0" data-tip="${esc('Stil-Kombo: ' + c.name + '\n' + c.text)}">
        <span class="tr-icon"><span class="tr-hex">${c.icon}</span></span>
        <span class="tr-body"><b>${esc(c.name)}</b><span class="tr-steps">Kombo in Reichweite</span></span>
        <span class="tr-text">${esc(c.text)}</span>
      </div>`).join('');
    return `<div class="tr-head">Aktive Boni</div>${active.map(row).join('') + comboRows + allyRows + duoRows + famRows || '<p class="tr-empty">Noch keine. Gleiche Banden, Stile oder Rollen schalten Boni frei.</p>'}
      ${rest.length ? `<div class="tr-head sub">Fast geschafft</div>${rest.map(row).join('')}` : ''}
      ${near ? `<div class="tr-head sub">Bündnisse in Reichweite</div>${near}` : ''}
      ${comboNear ? `<div class="tr-head sub">Stil-Kombos in Reichweite</div>${comboNear}` : ''}`;
  }
  // Handy: kompakte Leiste wie bei TFT. Ein Abzeichen pro Bonus mit Stufe, Tippen öffnet alle Details.
  function synBar(run, add) {
    const crew = run.crew;
    const before = GL.effects.status(crew);
    const st = add ? GL.effects.status(crew.concat([{ id: add.id, type: add.type, role: add.role, faction: add.faction }])) : before;
    const list = st.map((s, k) => Object.assign({}, s, { was: before[k] })).filter(s => s.count > 0);
    const duos = GL.effects.duos(crew), allies = GL.effects.alliances(crew);
    if (!list.length) return '';
    const tierIdx = s => s.active ? s.tiers.indexOf(s.active) : -1;
    list.sort((a, b) => ((b.count > b.was.count) - (a.count > a.was.count)) || (!!b.active - !!a.active) || (tierIdx(b) - tierIdx(a)) || (b.count - a.count));
    const lv = s => !s.active ? 'off' : tierIdx(s) === s.tiers.length - 1 ? 'gold' : tierIdx(s) >= 1 ? 'silver' : 'bronze';
    const chip = s => {
      const up = s.count > s.was.count, fresh = up && s.active && s.active !== s.was.active;
      return `<span class="sb-c sb-${lv(s)}${s.kind === 'faction' ? ' sb-set' : ''}${up ? ' sb-up' : ''}${fresh ? ' sb-new' : ''}">
        <i class="sb-ic">${ICON_ART[s.key] ? pxIcon(s.key) : esc(s.name.slice(0, 2))}</i><b>${s.count}</b>${s.next ? `<small>/${s.next.n}</small>` : ''}${up ? '<em class="sb-plus">+1</em>' : ''}</span>`;
    };
    const on = list.filter(s => s.active || s.count > s.was.count), off = list.filter(s => !s.active && !(s.count > s.was.count));
    const newDuos = add ? GL.effects.duosWith(crew, add.id) : [];
    return `<button class="sb${add ? ' sb-preview' : ''}" data-act="syn-open" aria-label="Alle Boni anzeigen">
      <span class="sb-row">${on.map(chip).join('')}${allies.length ? `<span class="sb-c sb-ally"><i class="sb-ic">⚑</i><b>${allies.length}</b></span>` : ''}${duos.length || newDuos.length ? `<span class="sb-c sb-duo${newDuos.length ? ' sb-up sb-new' : ''}"><i class="sb-ic">♥</i><b>${duos.length + newDuos.length}</b>${newDuos.length ? '<em class="sb-plus">Duo!</em>' : ''}</span>` : ''}${off.length ? `<span class="sb-sep"></span>${off.slice(0, 4).map(chip).join('')}` : ''}</span>
      <span class="sb-more">${add ? 'Mit ' + esc(add.name.split(' ')[0]) : 'Boni'} ▸</span></button>`;
  }
  function synPop(run) {
    return `<div class="fpop-card syn-pop">
      <span class="event-kicker">Deine Boni</span>
      <p class="hint">Gleiche Banden, Kampfstile und Rollen in der Crew schalten Boni frei. Zwei aktive Banden-Boni können zusätzlich ein <b>Bündnis</b> bilden.</p>
      <div class="syn-pop-list">${traitRail(run)}</div>
      <div class="fpop-btns"><button class="btn ghost" data-act="wiki-open" data-v="boni">Alle Banden im Wiki</button><button class="btn" data-act="pop-close">Alles klar</button></div></div>`;
  }

  // ---------- Kampftexte ----------

  function targetName(run, side, to) {
    const u = side === 'crew' ? run.crew[to] : run.battle.enemies[to];
    return u ? unitName(u) : '';
  }

  // Name einer Figur im Kampf, auch für fremde Crews (Begegnung auf See, Duelle)
  function unitName(u) {
    if (!u) return '';
    const d = u.def || anyData(u.id) || crewData(u.id);
    return u.name && u.id === 'rival' ? u.name : (d && d.name) || u.name || 'Pirat';
  }

  const SPECIAL = {
    'mera-mera': 'Die Mera-Mera-Frucht', 'suna-suna': 'Die Suna-Suna-Frucht', 'hie-hie': 'Die Hie-Hie-Frucht', 'hana-hana': 'Ein Extra-Arm',
    'gum-gum': 'Gummi', 'hito-hito': 'Der Doktor', 'tori-tori': 'Die Phönix-Flamme',
    kanone: 'Die Schiffskanone',
    seestein: 'Das Seestein-Netz',
    vivre: 'Die Vivre Card',
    helfer: 'Ein Helfer',
    bleed: 'Wunden, Gift und Feuer',
    special: 'Der Spezialangriff'
  };

  let windupN = -1;
  function battleText(run, ev) {
    if (ev.k === 'note') return ev.text;
    if (ev.k === 'round') return '';
    if (ev.k === 'special') return `Spezialangriff: ${ev.name}!`;
    if (ev.k === 'ult') return `${anyData(ev.by) ? anyData(ev.by).name : ''} entfesselt die Ulti: ${ev.name}!${ev.tier === 'perfect' ? ' Perfekt, alles stärker!' : ev.bonus ? ` Bonus: ${ev.bonus}.` : ''}`;
    if (ev.k === 'counter') return `Konter! ${targetName(run, 'enemy', ev.from)} schlägt sofort zurück: ${ev.dmg} Schaden an ${targetName(run, 'crew', ev.to)}.`;
    if (ev.k === 'weather') return `Kampfwetter: ${ev.name}. ${ev.text}`;
    if (ev.k === 'rage' && ev.phase === 3) return `Endphase! ${anyData(ev.by) ? anyData(ev.by).name : 'Der Boss'} setzt alles auf eine Karte.`;
    if (ev.k === 'rage') return `${anyData(ev.by) ? anyData(ev.by).name : 'Der Boss'} wird wütend: stärker und schneller!`;
    if (ev.k === 'will') return 'Letzter Wille: Die Crew gibt nicht auf! Ulti-Leisten laden, alle bekommen Mut.';
    if (ev.k === 'windup') {
      const n = anyData(ev.by) ? anyData(ev.by).name : 'Der Boss';
      const L = [`${n} holt weit aus … Nächste Runde wird es laut. Ausweichen hilft doppelt.`,
        `${n} krempelt die Ärmel hoch. Das ist selten ein gutes Zeichen. Rüstung zählt jetzt doppelt.`,
        `${n} atmet tief ein. Ein guter Moment, schnell zu sein.`];
      windupN = (windupN + 1) % L.length; return L[windupN];
    }
    if (ev.k === 'skip') return `${targetName(run, ev.side, ev.to)} ist betäubt und setzt aus.`;
    if (ev.k === 'immune') return `${targetName(run, ev.side, ev.to)} lässt sich nicht beeindrucken (${GL.data.statuses[ev.key].name} abgewehrt).`;
    if (ev.k === 'cleanse') return `${anyData(ev.by) ? anyData(ev.by).name : 'Ein Helfer'} befreit ${targetName(run, ev.side, ev.to)} von ${GL.data.statuses[ev.key].name}.`;
    if (ev.k === 'status') {
      if (!ev.list.length) return '';
      const s = GL.data.statuses[ev.list[0].key];
      const names = ev.list.map(x => targetName(run, ev.side, x.to));
      const who = names.length > 2 ? (ev.side === 'crew' ? 'die ganze Crew' : 'alle Gegner') : names.join(' und ');
      const src = ev.by === 'special' ? 'Der Spezialangriff' : SPECIAL[ev.by] || (anyData(ev.by) ? anyData(ev.by).name : '');
      return `${src}: ${who} ${names.length > 1 ? 'haben' : 'hat'} ${s.name} (${ev.list[0].rounds} ${ev.list[0].rounds === 1 ? 'Runde' : 'Runden'}).`;
    }

    if (ev.k === 'hit') {
      const attacker = ev.side === 'crew'
        ? crewData(run.crew[ev.from].id).name
        : unitName(run.battle.enemies[ev.from]);
      const target = targetName(run, ev.side === 'crew' ? 'enemy' : 'crew', ev.to);
      if (ev.blocked) return `${attacker} greift ${target} an, aber der Impact Dial wehrt ab.`;
      if (ev.miss && ev.heavy) return `${target} duckt sich unter dem schweren Schlag von ${attacker} weg. Elegant. Fast.`;
      if (ev.miss) return `${target} weicht ${attacker} aus.`;
      if (ev.heavy) return `${attacker} landet den schweren Schlag: ${ev.dmg} Schaden an ${target}.${ev.hp <= 0 ? ' Autsch.' : ''}`;
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
    if (ev.k === 'wave') {
      const elite = (ev.list || []).some(x => run.battle && run.battle.enemies[x.to] && run.battle.enemies[x.to].elite2);
      const L = elite ? ['Welle 2! Nachschub, und einer davon hat offensichtlich trainiert.', 'Welle 2! Ein Anführer kommt mit. Er hat sogar einen Hut.', 'Welle 2! Diesmal mit Chef. Natürlich.']
        : ['Welle 2! Es kommen noch welche. Es kommen immer noch welche.', 'Welle 2! Die zweite Reihe will auch mal.', 'Welle 2! Jemand hat Verstärkung gerufen. Unhöflich.'];
      return L[(run.step || 0) % L.length];
    }
    if (ev.k === 'revive' && ev.by === 'doc') {
      const who = targetName(run, 'crew', ev.list[0].to);
      return ev.doc === 'chopper' ? `Chopper flickt ${who} zusammen. „Nicht sterben, das ist ein Befehl vom Arzt!“`
        : ev.doc === 'lazarett' ? `Das Lazarett holt ${who} zurück aufs Deck. Mit Pflaster und Ermahnung.`
        : `Die Hito-Hito-Frucht weiß, was zu tun ist: ${who} steht wieder.`;
    }
    if (ev.k === 'revive') {
      if (ev.by === 'tori-tori') return `${targetName(run, 'crew', ev.list[0].to)} steht in blauer Phönix-Flamme wieder auf!`;
      return ev.by === 'vivre'
        ? 'Die Vivre Card bringt die ganze Crew zurück!'
        : `${actor} steht wieder auf${skill}!`;
    }
    return '';
  }

  // Auswertung nach dem Kampf: Schaden pro Figur, Erfahrung, Level-ups
  // Großer Daumen-Knopf im Kampf: erst Turbo, dann bis zum Ende springen
  function ffButton(anim) {
    const turbo = (anim.speed || 2) >= 4;
    const ready = !anim.t0 || Date.now() - anim.t0 >= 1500;
    const ch = n => `<svg class="ff-px" viewBox="0 0 ${n * 5} 7" shape-rendering="crispEdges" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<path transform="translate(${k * 5} 0)" d="M0 0h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1z"/>`).join('')}${turbo ? `<rect x="${n * 5 - 1}" y="0" width="1" height="7"/>` : ''}</svg>`;
    return `<button class="fbar-ff${turbo ? ' end' : ''}${turbo && !ready ? ' wait' : ''}" data-act="ff" aria-label="${turbo ? 'Zum Ergebnis springen' : 'Turbo'}"><b>${turbo ? 'Ende' : 'Turbo'}</b><small>${turbo ? 'zum Ergebnis' : 'schneller'}</small><i class="ff-ico">${ch(turbo ? 2 : 2)}</i></button>`;
  }
  function speedLabel(n) {
    // Pixel-Vorspulpfeile: je schneller, desto mehr Pfeile leuchten
    const chev = on => `<svg class="spd-ch${on ? ' on' : ''}" viewBox="0 0 4 7" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1z"/></svg>`;
    return `<span class="spd-arrows s${n}" aria-hidden="true">${[1, 2, 3, 4].map(k => chev(k <= n)).join('')}</span><b class="spd-x">×${n}</b><small class="spd-name">${['', 'Gemütlich', 'Zügig', 'Schnell', 'Turbo'][n]}</small>`;
  }
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
    const bd = GL.effects.build ? GL.effects.build(run.crew) : null;
    // Kampfbilanz: was dein Stil in diesem Kampf geleistet hat
    let crits = 0, dodges = 0, healed = 0, heavyDodged = 0;
    b.events.forEach(ev => {
      if (ev.k === 'hit' && ev.side === 'crew' && ev.crit) crits++;
      if (ev.k === 'hit' && ev.side === 'enemy' && ev.miss) { dodges++; if (ev.heavy) heavyDodged++; }
      if (ev.k === 'heal' && ev.side === 'crew') healed += (ev.list || []).reduce((s, x) => s + (x.amount || 0), 0);
    });
    const styleDmg = bd ? run.crew.reduce((s, u, i) => s + ((bd.kind === 'type' ? u.type : u.role) === bd.key ? dealt[i] : 0), 0) : 0;
    const TQ = { kraft: 'Subtil war gestern.', klinge: 'Präzise. Und ein kleines bisschen gemein.', technik: 'Getroffen werden ist auch nur eine Option.',
      helfer: 'Pflaster sind auch eine Waffe.', brecher: 'Steht im Weg. Absichtlich.', kaempfer: 'Viel Lärm, viel Schaden, wenig Plan.' };
    const chip = (on, ico, txt) => `<span class="tally${on ? ' on' : ''}"><i>${ico}</i>${txt}</span>`;
    const tally = b.win ? `<div class="sum-tally">${[
      chip(bd && (bd.key === 'kraft' || bd.key === 'kaempfer'), '💥', `${styleDmg || dealt.reduce((a, x) => a + x, 0)} ${bd && styleDmg ? 'Stil-Schaden' : 'Schaden'}`),
      crits ? chip(bd && bd.key === 'klinge', '⚔', `${crits} ${crits === 1 ? 'Krit' : 'Krits'}`) : '',
      dodges ? chip(bd && bd.key === 'technik', '💨', `${dodges}× ausgewichen${heavyDodged ? ' (auch dem großen Schlag!)' : ''}`) : '',
      healed ? chip(bd && (bd.key === 'helfer' || bd.key === 'brecher'), '💚', `${healed} geheilt`) : ''
    ].join('')}${bd && TQ[bd.key] ? `<em class="tally-q">${TQ[bd.key]}</em>` : ''}</div>` : '';
    const cb = GL.effects.combos ? GL.effects.combos(run.crew) : [];
    const comboLine = cb.length ? `<div class="sum-combo">${cb.map(c => `<span title="${esc(c.text)}"><i>${c.icon}</i><b>${esc(c.name)}</b></span>`).join('')}</div>` : '';
    const bl = bd ? `<div class="sum-build b-${bd.key}"><i>${bd.icon}</i><span><b>${esc(bd.name)} ${'★'.repeat(bd.tier)}</b><small>${bd.next ? `Noch ${bd.next.n - bd.count}× ${esc(bd.label)} bis: ${esc(bd.next.text)}` : 'Höchste Stufe erreicht!'}</small></span></div>`
      : `<div class="sum-build none"><i>✦</i><span><b>Noch kein Stil</b><small>2 gleiche Kampfstile oder Rollen ergeben einen Stil, z. B. 💥 Wucht, ⚔ Schwertkunst, 💨 Tempo oder 💚 Lazarett.</small></span></div>`;
    // Gefallene rappeln sich nach dem Sieg wieder auf (Medizinkoffer mehr)
    const down = b.win ? run.crew.filter(u => u.hp <= 0) : [];
    const rvP = Math.max(GL.config.reviveAfterWin || 0, (GL.effects.flags(run).reviveWin || 0));
    const revLine = down.length && rvP > 0 ? `<div class="sum-revive"><i>✚</i><span>${down.map(u => esc(unitName(u))).join(', ')} ${down.length === 1 ? 'rappelt sich' : 'rappeln sich'} mit ${Math.round(rvP * 100)} % Leben wieder auf.</span></div>` : '';
    return `<div class="summary">${rows}</div>${g}${bl}${comboLine}${revLine}${tally}`;
  }
  // Tooltip-Zeilen für aktive und fast erreichte Stil-Kombos
  function comboTip(crew) {
    if (!GL.effects.combos) return '';
    const on = GL.effects.combos(crew), near = GL.effects.combosNear(crew).slice(0, 2);
    return (on.length ? '\n\nKombo: ' + on.map(c => c.name + ' (' + c.text + ')').join('\n') : '') +
      (near.length ? '\n\nFast: ' + near.map(c => c.name).join(', ') : '');
  }

  // „So knackst du ihn“: welcher Build gegen diesen Bösewicht besonders gut ist
  function crackHint(boss) {
    const T = GL.data.types, Ro = GL.data.roles;
    const counter = Object.keys(T).find(k => T[k].strong === boss.type);
    const A = ability(boss.id) || {};
    const tanky = A.kind === 'lifesteal' || (A.mods || []).some(m => m.guard || m.armor) || (boss.hp || 0) > (boss.atk || 1) * 9;
    const heavy = ['double', 'burn', 'chain', 'execute', 'ramp', 'sniper'].includes(A.kind) || (boss.atk || 0) * 7 >= (boss.hp || 0);
    let second = tanky ? { icon: T.kraft.icon, name: T.kraft.build, why: 'knackt seine dicke Haut' }
      : heavy ? { icon: Ro.helfer.icon, name: Ro.helfer.build, why: 'heilt gegen seine harten Schläge' }
      : { icon: Ro.brecher.icon, name: Ro.brecher.build, why: 'fängt ihn vorne ab' };
    if (second.name === T[counter].build) second = { icon: Ro.helfer.icon, name: Ro.helfer.build, why: 'hält länger durch' };
    return { counter, html: `<span class="crack"><b>So knackst du ihn:</b> <i>${T[counter].icon} <span>${esc(T[counter].build)}</span></i> <span>(${esc(T[counter].name)} ×2 Schaden) ·</span> <i>${second.icon} <span>${esc(second.name)}</span></i> <span>${esc(second.why)}</span></span>` };
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
          ${d.self && d.crewName ? `<small class="poster-crew"><i class="c3-jolly" aria-hidden="true"></i>${esc(d.crewName)}</small>` : ''}
          <div>${stars(u.stars)} <em class="lv">Lv ${u.lvl}</em></div>
          <div class="xpbar big"><i style="width:${Math.min(100, 100 * u.xp / need)}%"></i></div>
          <small>${u.xp} / ${need} EP bis Level ${u.lvl + 1}</small>
        </div>
        <button class="sheet-nav" data-act="sheet" data-i="${(i + 1) % run.crew.length}" aria-label="Nächste Figur">›</button>
      </div>
      <div class="sheet-tags">${badge(u.type)} <span>${tags(d)}</span> ${traitChip(u.trait)}</div>
      <p class="sheet-abil">${abilityLine(u.id)}${d.self && d.fruit && GL.data.fruits.some(f => f.id === d.fruit.id) ? (f => `<span class="abil sf-abil"><i>${GL.sprites.icon('fruit', f.id)}</i><b>${esc(f.name)}:</b> ${esc(f.text)}</span>`)(GL.loot.fruit(d.fruit)) : ''}${ultiLine(u.id, u.role)}<span class="abil"><b>Eigenschaft ${t.name}:</b> ${t.text}</span></p>

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
          ? `<button class="btn ghost danger-btn${askDismiss(i) ? ' ask' : ''}" data-act="dismiss" data-i="${i}">${askDismiss(i) ? `Wirklich entlassen? Nochmal tippen (+${GL.run.sellValue(u)} Gold)` : `Entlassen (+${GL.run.sellValue(u)} Gold)`}</button>` : ''}
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
    const L2 = v => Array.isArray(v) ? v[GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en' ? 1 : 0] : v;
    return `<div class="notice"><b>${L2(n.title)}</b> <span>${L2(n.text)}</span>
      ${n.lines.length ? `<ul>${n.lines.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}</div>`;
  }

  // ---------- Hauptbereich je nach Phase ----------

  function stage(run, anim, ui) {
    return phaseStage(run, anim, ui);
  }

  // Zwischen-Event mit der Crew: kleine Bühne, 2–3 Sprechzeilen, dann große Wahlkarten
  const CE_ICON = { fruit: () => GL.sprites.icon('node', 'fruit'), rest: () => GL.sprites.icon('node', 'rest'), elite: () => GL.sprites.icon('node', 'elite'), map: () => pxIco('ship'), battle: () => GL.sprites.icon('node', 'battle'), chest: () => pxIco('chest'), recruit: () => GL.sprites.icon('node', 'recruit') };
  function crewEventStage(run) {
    const ev = byId(GL.data.crewEvents || [], run.event.id);
    if (!ev) return '';
    const en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
    const L2 = v => Array.isArray(v) ? v[en ? 1 : 0] : v;
    const [aId, bId] = run.event.cast || [];
    const gull = (GL.data.pets || []).find(x => x.id === 'moewe');
    const fig = key => {
      if (key === 'B' && bId === 'kalle') key = 'kalle';
      if (key === 'kalle') return { name: en ? 'Kalle the News Coo' : 'Kalle, die Zeitungsmöwe', spr: gull ? GL.sprites.render({ id: 'pet-moewe', art: gull.art }) : '' };
      const d = crewData(key === 'A' ? aId : key === 'B' ? bId : key) || {};   // auch feste Sprecher wie 'zorro' (events3.js)
      return { name: d.name || '?', spr: d.id ? GL.sprites.render(d) : '' };
    };
    const A = fig('A'), B = fig('B');
    const fill = s => esc(s).replace(/\{A\}/g, esc(A.name)).replace(/\{B\}/g, esc(B.name));
    const cast = [...new Set(ev.lines.map(l => l[0]))];
    const lines = ev.lines.map((l, k) => { const f = fig(l[0]); const side = cast.indexOf(l[0]) % 2 ? 'r' : 'l';
      return `<div class="ce-line ${side}" style="--k:${k}"><i class="ce-face">${f.spr}</i><span class="ce-bub"><b>${esc(f.name)}</b>${fill(en ? l[2] : l[1])}</span></div>`; }).join('');
    const ico = (CE_ICON[ev.icon] || CE_ICON.map)();
    const opts = ev.choices.map((c, i) => `<button class="opt ce-opt" data-act="pick" data-i="${i}">${i < 9 ? `<kbd class="key">${i + 1}</kbd>` : ''}
        <span class="ce-opt-b"><b>${esc(L2(c.label))}</b><small>${esc(L2(c.hint))}</small></span><i class="ce-go" aria-hidden="true">›</i></button>`).join('');
    return `<div class="event ce-event">
      <div class="ce-head"><i class="ce-ico">${ico}</i><span><small>${ev.ep ? `📜 ${en ? 'Episode' : 'Folge'} · ${en ? 'part' : 'Teil'} ${ev.part}/3` : (en ? 'On the way' : 'Unterwegs')}</small><h2>${esc(L2(ev.title))}</h2></span></div>
      <div class="ce-stage bg-${ev.bg || 'insel'}"><span class="ce-cast">${cast.map(k => `<i class="ce-who">${fig(k).spr}</i>`).join('')}</span></div>
      <div class="ce-lines">${lines}</div>
      <div class="ce-opts">${opts}</div>
    </div>`;
  }

  function phaseStage(run, anim, ui) {
    const N = GL.data.nodes;
    switch (run.phase) {
      case 'event': {
        if (run.event.crew) return crewEventStage(run);
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
        // Freigeschaltet (rotieren durch die Auswahl) und wirklich noch gesperrt: klar getrennt, nichts doppelt
        const owned = (ui.profile && ui.profile.unlocked) || [];
        const locked = GL.data.unlocks.filter(u => !owned.includes(u.unlock) && !offered.includes(u.unlock));
        const resting = GL.data.unlocks.filter(u => owned.includes(u.unlock) && !offered.includes(u.unlock));
        const restHtml = resting.length ? `<div class="capq-rest"><span class="capq-h">⚓ Ebenfalls in deiner Crew <small>${resting.length}</small></span>
          <div class="capq-row">${resting.map(u => { const d = crewData(u.unlock); return `<span class="capq-mini" title="${esc(d.name)}: kommt in einem anderen Run zur Wahl"><i>${GL.sprites.render(d)}</i><b>${esc(d.name)}</b></span>`; }).join('')}</div>
          <small class="capq-note">Sie wechseln sich mit den Kapitänen oben ab. Nächster Run, neues Glück.</small></div>` : '';
        const lockedHtml = locked.length ? `<details class="locked-wrap capq-lock"><summary>🔒 Noch gesperrt <small>${locked.length}</small></summary><div class="capq-grid">${locked.map(u => {
          const d = crewData(u.unlock);
          const pr = ui.profile ? GL.meta.progress(ui.profile, u) : { have: 0, need: 1 };
          const pct = pr.need > 0 ? Math.min(100, Math.round(100 * pr.have / pr.need)) : 0;
          return `<div class="capq-tile"><i class="capq-sil">${GL.sprites.render(d)}<em>🔒</em></i>
            <span><b>${esc(d.name)}</b><small>${u.text}</small>${pr.need > 1 ? `<i class="capq-bar"><i style="width:${pct}%"></i></i><small class="capq-n">${pr.have}/${pr.need}</small>` : ''}</span></div>`;
        }).join('')}</div></details>` : '';
        // Viele Kapitäne: nach Kampfstil/Rolle filtern statt alle auf einmal zu zeigen
        const f = ui.capFilter || 'all';
        const T = GL.data.types, Rl = GL.data.roles;
        const all = run.pool.map((o, i) => ({ o, i, d: crewData(o.id) }));
        const shown = all.filter(x => f === 'all' || x.d.type === f || x.d.role === f);
        const cnt = k => all.filter(x => x.d.type === k || x.d.role === k).length;
        const chip = (k, name) => `<button class="lb-cat${f === k ? ' on' : ''}" data-act="cap-filter" data-v="${k}">${name}${k !== 'all' ? ` <small>${cnt(k)}</small>` : ''}</button>`;
        const filters = all.length > 4 ? `<div class="lb-cats cap-filter">${chip('all', 'Alle')}${Object.keys(T).map(k => chip(k, T[k].name)).join('')}${Object.keys(Rl).map(k => chip(k, (ROLE_ICON[k] || '') + ' ' + Rl[k].name)).join('')}</div>` : '';
        // Du bist immer Kapitän: oben deine Karte, darunter der Erste Maat (einmal wählen, kein Neu-Würfeln)
        if (run.mateMode) {
          const me = crewData('self') || {}, pf = ui.profile;
          const gr = pf && GL.meta.selfGrowth ? GL.meta.selfGrowth(pf) : null;
          const fr = run.start && run.start.self && run.start.self.fruit ? byId(GL.data.fruits, run.start.self.fruit.id) : null;
          const restMate = restHtml.replace('⚓ Ebenfalls in deiner Crew', '⚓ Warten am Steg').replace('Sie wechseln sich mit den Kapitänen oben ab. Nächster Run, neues Glück.', 'Nächstes Mal stehen andere als Maat bereit. Der Steg ist geduldig.').replace(/kommt in einem anderen Run zur Wahl/g, 'wartet auf die nächste Fahrt');
          return `<div class="capv-me">
              <span class="capv-spr">${GL.sprites.render(me)}<i class="capv-hat">⚓</i></span>
              <span class="capv-txt"><small class="capv-k">Kapitän</small><b>${esc(me.name || 'Du')}</b>
                <span class="capv-tags">${me.crewName ? `<em class="capv-tag">⚑ ${esc(me.crewName)}</em>` : ''}${fr ? `<em class="capv-tag fr">${esc(fr.name)}</em>` : ''}<em class="capv-tag">♥ ${me.hp} · ⚔ ${me.atk} · ➶ ${me.spd}</em></span>
                ${gr ? `<small class="capv-grow">Rang ${gr.rank}${gr.bond ? ` · Vertraut ${gr.bond}` : ''} → +${gr.hp} Leben, +${gr.atk} Angriff${gr.spd ? `, +${gr.spd} Tempo` : ''}</small>` : ''}</span>
            </div>
            <h2 class="capv-h">Wähle deinen Ersten Maat</h2>
            <p class="hint">Der Maat kommt sofort an Bord. Seine Heuer ist dein Startgold, er ist es wert. Meistens.</p>
            <div class="cards">${run.pool.map((o, i) => offerButton(run, o, i, 'cap mate' + (crewData(o.id).locked ? ' unlocked-cap' : '') + (run.buddy === o.id ? ' buddy-cap' : ''), false)).join('')}</div>${run.buddy && run.pool.some(o => o.id === run.buddy) ? `<p class="hint buddy-hint">♥ ${esc(crewData(run.buddy).name)} ist dein Vertrauter und steht extra zur Wahl.</p>` : ''}${restMate}${lockedHtml}`;
        }
        return `<h2>Wähle deinen Kapitän</h2>
          <p class="hint">Mit ihm oder ihr beginnt deine Reise. Werte und Eigenschaft sind bei jedem Run neu ausgewürfelt.</p>
          ${filters}
          <div class="cards">${shown.map(x =>
            offerButton(run, x.o, x.i, 'cap' + (x.d.locked ? ' unlocked-cap' : '') + (run.buddy === x.o.id ? ' buddy-cap' : ''), false)).join('')}</div>${run.buddy && run.pool.some(o => o.id === run.buddy) ? `<p class="hint buddy-hint">♥ ${esc(crewData(run.buddy).name)} ist dein Vertrauter und steht extra zur Wahl.</p>` : ''}${restHtml}${lockedHtml}`;
      }

      case 'course': {
        // Kurs setzen: welche Insel steuert die Crew als Nächstes an?
        const sea = GL.run.island(run);
        const ch = GL.run.chapterIdx(run);
        const baseSea = GL.data.islands[GL.run.islandIndex(run)];
        const twoRoutes = ch === 0 && GL.data.altOpen(run, GL.run.islandIndex(run));
        const findIsl = id => (ch === 0 ? sea.small : sea.big).find(x => x.id === id) || (twoRoutes ? baseSea.alt.small.find(x => x.id === id) || baseSea.small.find(x => x.id === id) : null);
        const opts = (run.courseOpts || []).map(findIsl).filter(Boolean);
        // Inselwahl als kleine Postkarten: Pixel-Kulisse oben mit Bösewicht, darunter Route und Gegner-Info
        const ISL_THEME = { 'shells-town': 'navy', 'orange-town': 'circus', 'syrup': 'syrup', 'baratie': 'baratie', 'gecko-klippen': 'dusk', 'eisenbucht': 'dock',
          'loguetown': 'town', 'arlong-park': 'reef', 'whisky-peak': 'city', 'little-garden': 'bamboo', 'drumm': 'snow', 'jaya': 'beach', 'zwillingskap': 'whale',
          'alabasta': 'desert', 'skypiea': 'sky', 'tiefsee': 'reef', 'korallenhuegel': 'reef', 'fischmenschen-viertel': 'reef', 'meerwald': 'reef', 'gyoncorde': 'reef', 'ryugu': 'bubble',
          'long-ring': 'wind', 'water-7': 'dock', 'puffing-tom': 'beach', 'enies-gate': 'navy', 'tower': 'navy', 'tor': 'navy',
          'florian': 'grave', 'grusel-garten': 'grave', 'hogback-labor': 'grave', 'mangroven': 'grave', 'thriller-schloss': 'grave', 'sabaody': 'bubble' };
        const foeOf = isl => enemyData(ch === 0 ? isl.villain : isl.boss);
        const bounties = opts.map(isl => (foeOf(isl) || {}).bounty || 0);
        const rankOf = b => bounties.filter(x => x < b).length;   // 0 = leichteste Wahl
        const cards = opts.map((isl, i) => {
          const route = twoRoutes ? (baseSea.alt.small.includes(isl) ? baseSea.alt.name : baseSea.name) : '';
          const foe = foeOf(isl);
          const info = bossInfo(foe);
          const bounty = foe.bounty ? `${foe.bounty} Mio. ฿` : '';
          const th = ISL_THEME[isl.id] || 'beach';
          const lvl = opts.length > 1 ? Math.min(2, Math.round(2 * rankOf(foe.bounty || 0) / (opts.length - 1))) : 1;
          const danger = `<span class="co-danger d${lvl}" title="${['Gemütlicher Einstieg', 'Ordentlich was los', 'Wird ungemütlich'][lvl]}">${[0, 1, 2].map(k => `<i class="${k <= lvl ? 'on' : ''}"></i>`).join('')}<small>${['gemütlich', 'ordentlich', 'ungemütlich'][lvl]}</small></span>`;
          const pet = (() => { const pt = (GL.data.pets || []).find(p => p.isl === isl.id); const pr = profRef; return pt && pr && !(pr.pets || []).includes(pt.id) ? `<span class="co-petchip"><i class="pet-sil">${petArt(pt.id)}</i>Begleiter?</span>` : ''; })();
          return `<button class="opt course-opt co2" data-act="pick" data-i="${i}">
            ${i < 9 ? `<kbd class="key">${i + 1}</kbd>` : ''}
            <span class="co-scene">${cardStage({ id: 'isl-' + isl.id }, th)}
              <span class="co-boss"><i class="co-boss-sh" aria-hidden="true"></i>${GL.sprites.render(foe)}</span>
              <span class="co-chips">${route ? `<span class="co-routechip">${esc(route)}</span>` : ''}${isNewIsl(isl) ? '<span class="new-chip co-new" title="Hier warst du noch nie">Neue Insel</span>' : ''}${pet}</span>
              <b class="co-name">${isl.name}</b></span>
            <span class="co-body">
              <small class="co-text">${isl.text}</small>
              <span class="co-route">${isl.places.map(p => `<i>${p}</i>`).join('<em>›</em>')}<em>›</em><i class="co-lair">${isl.lair}</i></span>
              <span class="co-foe2"><span><small>${ch === 0 ? 'Bösewicht der Insel' : 'Boss des Meeres'}</small><b>${foe.name} ${badge(foe.type)}${isNewFoe(foe.id) ? newChip : ''}</b>
                <small>schwach gegen ${badge(info.counter)}${bounty ? ` · ${bounty}` : ''}</small></span>${danger}</span>
              ${crackHint(foe).html}
            </span>
          </button>`;
        }).join('');
        // Zum ersten Mal in diesem Meer: kleiner Freudenmoment
        const seaIds = baseSea.small.concat(baseSea.big, baseSea.alt ? baseSea.alt.small.concat(baseSea.alt.big) : []).map(x => x.id);
        const freshSea = ch === 0 && GL.run.islandIndex(run) > 0 && seenRef && !seaIds.some(x => (seenRef.islands || []).includes(x));
        const seaBanner = freshSea ? `<div class="new-sea"><i class="ns-star">★</i><span><small>Neues Meer entdeckt</small><b>${esc(twoRoutes ? baseSea.name + ' oder ' + baseSea.alt.name : baseSea.name)}</b><em>${esc(baseSea.tagline || '')}</em></span><i class="ns-star">★</i></div>` : '';
        return `${noticeBox(run)}${seaBanner}<span class="event-kicker">${twoRoutes ? (GL.run.islandIndex(run) === 1 ? 'Zweites Meer' : 'Drittes Meer') + ' · Zwei Routen' : sea.name + ' · ' + (ch === 0 ? 'Erste Insel' : 'Zweite Insel')}</span>
          <h2>${ch === 0 ? 'Welche Insel steuerst du an?' : 'Kurs auf den Boss des Meeres'}</h2>
          ${GL.run.twist ? (tw => tw ? `<span class="co-twist" data-tip="${esc('Insel-Twist dieser Etappe: ' + tw.name + '\n' + tw.text)}">${tw.icon || '🎲'} <b>${esc(tw.name)}</b><small>${esc(tw.text)}</small></span>` : '')(GL.run.twist(run)) : ''}
          <p class="hint course-hint">${ch === 0 ? 'Jede Insel hat ihre eigenen Orte. Am Ende wartet ihr Bösewicht: Sieg bringt Kopfgeld, einen Schatz und eine Verschnaufpause.'
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
          : `<div class="lbl">${gateFoe ? 'Bösewicht der Insel' : 'Boss des Meeres'}: ${foe.name} ${badge(foe.type)} schwach gegen ${badge(info.counter)}</div>${crackHint(foe).html}`;
        const tip = GL.advice.map(run);
        return `${noticeBox(run)}<h2>${here ? here.name : 'Wähle deine Route'}</h2>${preview}${journeyView(run, boss, tip)}<details class="jr-map"><summary>🗺 ${GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en' ? 'Map' : 'Karte'}</summary>${seaChart(run, boss, tip)}</details>${tipLine(tip)}`;
      }

      case 'recruit': {
        // Taverne kompakt: Angebote als Kästchen nebeneinander, Antippen zeigt Vergleich und „Anheuern“, darunter direkt die Crew
        const lim = GL.run.crewLimit(run);
        const full = run.crew.length >= lim;
        const gold = run.gold || 0;
        const tip = GL.advice.recruit(run);
        // Handy: Details erst nach Antippen, als Blatt von unten (kein langes Scrollen). PC: wie gehabt mit Tipp vorausgewählt
        const phone = typeof window !== 'undefined' && window.innerWidth < 700;
        const sel = ui.tvSel != null && ui.tvSel >= 0 && run.pool[ui.tvSel] ? ui.tvSel : (phone || ui.tvSel === -1 ? null : (tip ? tip.index : null));
        const pw = u => u.max * 0.5 + u.atk * 4 + u.spd * 2;
        const others = run.crew.filter(u => u.id !== run.captain);
        // Besiegte zuerst ersetzen, sonst die schwächste Figur
        const autoWeak = (others.length ? others : run.crew).slice().sort((a, b) => ((a.hp <= 0) ? -1e6 : pw(a)) - ((b.hp <= 0) ? -1e6 : pw(b)))[0];
        // Tauschziel: selbst gewählt (Figur unten antippen) oder automatisch die schwächste
        const tt = ui.tvTarget && ui.tvTarget.key === run.seed + ':' + run.step ? run.crew.find(u => u.id === ui.tvTarget.id) : null;
        const picked = tt && tt.id !== run.captain ? tt : null;
        const weak = picked || autoWeak;
        const downN = run.crew.filter(u => u.hp <= 0).length;
        const cmp = (a, b) => { if (!b) return ''; const r = (a - b) / Math.max(1, b); return r >= 0.2 ? 'uu' : r >= 0.05 ? 'u' : r <= -0.2 ? 'dd' : r <= -0.05 ? 'd' : 'e'; };
        const arrow = k => k === 'e' || !k ? '<i class="pa pa-eq">=</i>' : `<i class="pa ${k[0] === 'u' ? 'pa-up' : 'pa-dn'}">${k.split('').map(() => k[0] === 'u' ? PX_UP : PX_DOWN).join('')}</i>`;
        const tiles = run.pool.map((o, i) => {
          const d = crewData(o.id), m = GL.run.previewMember(run, o);
          const price = GL.run.offerPrice(run, o);
          const twin = mergeTwin(run, o);
          const can = !o.sold && (!full || twin) && gold >= price;
          const overall = weak && full && !twin ? cmp(pw(m), pw(weak)) : null;
          return `<button class="tv-off pxf${o.sold ? ' sold' : can ? '' : ' cant'}${sel === i ? ' sel' : ''}${(o.stars || 1) >= 3 ? ' s3' : ''}${twin && !o.sold ? ' dup' : ''}${tip && tip.index === i && !o.sold ? ' rec' : ''}" data-act="tv-sel" data-i="${i}">
            ${twin && !o.sold ? `<span class="tv-rec tv-dup">${PX_STAR_UP}Aufwerten</span>` : run.buddy === o.id && !o.sold ? '<span class="tv-rec tv-buddy">♥ Vertrauter</span>' : tip && tip.index === i && !o.sold ? '<span class="tv-rec">Tipp</span>' : ''}
            <span class="tv-stars">${stars(o.stars || 1)}</span>
            <i class="tv-spr">${GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d)}</i>
            <b class="tv-name">${esc(d.name)}</b>
            <span class="tv-tags">${d.faction ? pxIcon(d.faction) : ''}${pxIcon(d.type)}${pxIcon(d.role)}</span>
            <small class="tv-sub">${d.faction ? esc(FAC_SHORT[d.faction] || '') + ' · ' : ''}Lv ${m.lvl}${profRef && GL.meta.bond(profRef, d.id) ? ` <em class="tv-bond" title="Vertraut: kennt deine Crew aus früheren Fahrten">♥${GL.meta.bond(profRef, d.id)}</em>` : ''}</small>
            <span class="tv-cmp">${overall ? arrow(overall) : ''}${fitTag(run, d)}</span>
            <span class="tv-price${can || o.sold ? '' : ' no'}">${o.sold ? 'Gekauft' : `${GL.sprites.coin()} ${price}`}</span>
          </button>`;
        }).join('');
        let detail = '';
        if (sel != null && run.pool[sel]) {
          const o = run.pool[sel], d = crewData(o.id), m = GL.run.previewMember(run, o);
          const twin = mergeTwin(run, o);
          const price = GL.run.offerPrice(run, o), can = !o.sold && (!full || twin) && gold >= price;
          const a = ability(d.id), t = o.trait ? trait(o.trait) : null, u = ultiOf(d.id, d.role);
          const row = (lbl, ico, v, w) => `<span class="tv-st"><i>${ico}</i>${lbl} <b>${v}</b>${w != null && full ? arrow(cmp(v, w)) : ''}</span>`;
          detail = `${phone ? '<div class="tv-sheet-bg" data-act="tv-sel" data-i="-1"></div>' : ''}<div class="tv-detail pxf${phone ? ' tv-sheet' : ''}">${phone ? '<button class="tv-sheet-x" data-act="tv-sel" data-i="-1" aria-label="Schließen">✕</button>' : ''}
            <div class="tv-d-head"><b>${esc(d.name)}</b>${d.faction ? `<span class="tv-fac">${pxIcon(d.faction)}${esc(GL.data.factions[d.faction].name)}</span>` : ''}<span class="tv-fac">${pxIcon(d.type)}${esc(GL.data.types[d.type].name)}</span><span class="tv-fac">${pxIcon(d.role)}${esc((GL.data.roles[d.role] || {}).name || '')}</span>
              <small>${weak && full ? (picked ? `Pfeile: Vergleich mit deinem Tauschziel (${esc(crewData(weak.id).name)})` : `Pfeile: Vergleich mit deiner schwächsten Figur (${esc(crewData(weak.id).name)})`) : `Noch ${lim - run.crew.length} ${lim - run.crew.length === 1 ? 'Platz' : 'Plätze'} frei: jede Figur macht deine Crew stärker`}</small></div>
            <div class="tv-stats">${row('Leben', '♥', m.max, weak && weak.max)}${row('Angriff', '⚔', m.atk, weak && weak.atk)}${row('Tempo', '➤', m.spd, weak && weak.spd)}</div>
            ${(() => { const why = o.sold ? [] : whyNow(run, d, m); return why.length ? `<div class="tv-why"><span class="why-k">Darum lohnt ${SHE.includes(d.id) ? 'sie' : 'er'} sich jetzt</span>${why.map(w => `<span class="why-row">${w.ico}<span>${esc(w.t)}</span></span>`).join('')}</div>` : ''; })()}
            ${abilityBlock(d)}
            ${t ? `<p class="tv-ab tv-trait"><span class="abx-k">Eigenschaft</span><b>${esc(t.name)}</b> ${esc(t.text)}</p>` : ''}
            ${twin && !o.sold ? (() => { const M = GL.config.merge, to = (twin.stars || 1) + 1; return `<div class="tv-merge pxf"><span class="mg-pair"><i>${GL.sprites.render(d)}</i><b class="mg-st">${'★'.repeat(twin.stars || 1)}</b><span class="mg-plus">+</span><i>${GL.sprites.render(d)}</i><b class="mg-st">${'★'.repeat(twin.stars || 1)}</b><span class="mg-arrow">➜</span><i class="mg-out">${GL.sprites.render(d)}</i><b class="mg-st mg-to">${'★'.repeat(to)}</b></span>
              <p><b>Zusammenlegen:</b> ${esc(d.name)} ist schon in deiner Crew. Zwei gleiche werden zu einer stärkeren Figur mit ${to} Sternen: +${Math.round(twin.max * M.hp)} Leben, +${Math.max(M.atkMin, Math.round(twin.atk * M.atk))} Angriff, volle Heilung. Braucht keinen freien Platz.</p>${!full ? '<small class="mg-tip">Tipp: Du hast noch freie Plätze. Eine neue Figur bringt meist mehr, Zusammenlegen lohnt sich vor allem bei voller Crew.</small>' : ''}</div>`; })() : ''}
            ${twin && !o.sold
              ? `<button class="btn tv-buy tv-mergebtn" data-act="pick" data-i="${sel}"${can ? '' : ' disabled'}>${gold < price ? `Zu wenig Gold (${price})` : `${PX_STAR_UP}Zusammenlegen für ${price} Gold`}</button>`
              : full && !o.sold && weak && weak.id !== run.captain
              ? (() => { const back = GL.run.sellValue(weak), net = Math.max(0, price - back), wn = esc(crewData(weak.id).name), ok = gold + back >= price;
                  const dl = (lbl, ico, a, b) => { const df = b - a; return `<span class="sw-row"><i>${ico}</i><span class="sw-l">${lbl}</span><span class="sw-a">${weak.hp <= 0 && lbl === 'Leben' ? 0 : a}</span><span class="sw-ar">➜</span><b class="sw-b">${b}</b><em class="sw-d ${df > 0 ? 'up' : df < 0 ? 'dn' : 'eq'}">${df > 0 ? '+' : ''}${df === 0 ? '±0' : df}</em></span>`; };
                  const better = weak.hp <= 0 || pw(m) >= pw(weak) * 1.05, worse = weak.hp > 0 && pw(m) < pw(weak) * 0.95;
                  return `<div class="tv-swapbox pxf ${better ? 'good' : worse ? 'bad' : 'even'}">
                    <div class="sw-head"><span class="tv-swap-out">${GL.sprites.render(crewData(weak.id))}${weak.hp <= 0 ? PX_GRAVE : ''}</span><span class="tv-swap-arrow">➜</span><span class="tv-swap-in">${GL.sprites.render(d)}</span>
                      <span class="sw-verdict">${weak.hp <= 0 ? `${wn} ist K.O.: ein Tausch bringt wieder volle Kraft` : better ? `Stärker als ${wn}` : worse ? `Schwächer als ${wn}` : `Etwa gleich stark wie ${wn}`}</span></div>
                    <div class="sw-rows">${dl('Leben', '♥', weak.max, m.max)}${dl('Angriff', '⚔', weak.atk, m.atk)}${dl('Tempo', '➤', weak.spd, m.spd)}</div>
                    <small class="sw-hint">Andere Figur tauschen? Tipp sie unten in deiner Crew an.</small>
                    <div class="sw-cost"><span>Preis ${price}</span><span>− ${back} für ${wn}</span><b>= ${net} Gold</b></div></div>
                  <button class="btn tv-buy tv-swap${weak.hp <= 0 ? ' down' : ''}" data-act="tv-swap" data-i="${sel}" data-j="${run.crew.indexOf(weak)}"${ok ? '' : ' disabled'}>
                  <span>${ok ? `${pxIco('coin')}Tauschen für ${net} Gold` : `Zu wenig Gold (${net})`}</span></button>`; })()
              : `<button class="btn tv-buy" data-act="pick" data-i="${sel}"${can ? '' : ' disabled'}>${o.sold ? 'Schon angeheuert' : full ? 'Schiff voll: erst jemanden entlassen' : gold < price ? `Zu wenig Gold (${price})` : `${pxIco('coin')}Anheuern für ${price} Gold`}</button>`}
          </div>`;
        }
        const roll = GL.run.rerollCost(run);
        const crewRow = run.crew.map((u, i) => {
          const d = crewData(u.id), cap = u.id === run.captain;
          const down = u.hp <= 0;
          return `<span class="tv-mem pxf${weak && full && u === weak ? ' weak' : ''}${down ? ' down' : ''}${ui.mergeFx === u.id ? ' merged' : ''}">${full && !cap ? `<button class="tv-pickt" data-act="tv-target" data-i="${i}" title="Als Tauschziel wählen">${GL.sprites.render(d)}</button>` : `<i>${GL.sprites.render(d)}</i>`}${full && weak === u ? '<span class="tv-out-tag">raus?</span>' : ''}${down ? `<span class="down-mark">${PX_GRAVE}<b>K.O.</b></span>` : ''}${(u.stars || 1) > 1 ? `<span class="tv-mstars">${'★'.repeat(u.stars)}</span>` : ''}<small>${esc(d.name)}</small><em>${down ? 'Besiegt' : 'Lv ' + u.lvl}</em>
            ${cap ? '<span class="tv-cap">Kapitän</span>' : askDismiss(i) ? `<button class="tv-x ask" data-act="dismiss" data-i="${i}">Wirklich? +${GL.run.sellValue(u)}</button>` : `<button class="tv-x${down ? ' hot' : ''}" data-act="dismiss" data-i="${i}" title="Entlassen (+${GL.run.sellValue(u)} Gold)">✕ ${GL.run.sellValue(u)}</button>`}</span>`;
        }).join('');
        const harbor = run.harbor ? `<div class="harbor-box pxf"><span class="event-kicker">${run.loop ? `Zwischenhafen · Runde ${run.loop + 1}` : 'Endlos-Fahrt · Hafen'}</span>
            <b>${run.loop ? 'Kurz durchatmen, dann wird es härter.' : 'Stell deine Crew zusammen, dann legst du ab.'}</b>
            <small>Aufstellung passiert automatisch: Brecher vorne, Helfer hinten.</small></div>` : '';
        return `${harbor}<div class="tavern">
            <div class="tv-head"><h2>${run.harbor ? 'Hafentaverne' : 'Taverne'}</h2><span class="gold">${GL.sprites.coin()} <b>${gold}</b></span></div>
            ${run.shopFree ? '<p class="tv-free">Der erste Kauf ist gratis.</p>' : ''}
            <div class="tv-syn">${synBar(run, sel != null && run.pool[sel] && !run.pool[sel].sold ? crewData(run.pool[sel].id) : null)}</div>
            <div class="tv-grid">${tiles}</div>
            ${detail}
            <div class="tv-crew-head"><span>Deine Crew ${run.crew.length}/${lim}</span>${downN ? `<span class="down-chip">${PX_GRAVE} ${downN} besiegt: austauschen oder bei einer Rast heilen</span>` : weak && full ? (picked ? '<small><span class="weak-key"></span> = dein Tauschziel. Andere Figur antippen zum Wechseln</small>' : '<small><span class="weak-key"></span> = schwächste Figur. Tipp eine andere an, um sie zu tauschen</small>') : ''}</div>
            <div class="tv-crew">${crewRow}</div>
            <div class="tv-actions">
              <button class="btn ghost" data-act="reroll"${gold < roll ? ' disabled' : ''}>${pxIco('dice')}Neu würfeln · ${roll} ${keyHint('R')}</button>
              <div class="dock"><button class="btn" data-act="leave">${pxIco('ship')}${run.harbor ? 'Ablegen: nächste Runde' : 'Weitersegeln'} ${keyHint('Leertaste')}</button></div>
            </div>
          </div>`;
      }

      case 'fruit': {
        const items = run.pool.map(it => GL.loot.fruit(it));
        const tip = GL.advice.loot(run, items, 'fruit');
        return `${crewHpStrip(run)}<h2>Welche Frucht isst du?</h2>
          <p class="hint">Je seltener die Frucht, desto stärker ihr Effekt.</p>
          <div class="cards loot">${items.map((f, i) => {
          const rid = f.awakened ? 'awakened' : f.rarity >= 0 ? GL.config.rarities[f.rarity].id : 'unique';
          return cardButton(i, treasureFace(f, 'fruit', lootBenefit(run, f)), `loot-opt tc-opt lr-${rid}`, tip);
        }).join('')}</div>${tipLine(tip)}${pickDock(run, items)}`;
      }

      case 'treasure': {
        const items = run.pool.map(it => GL.loot.relic(it));
        const tip = GL.advice.loot(run, items, 'relic');
        return `${crewHpStrip(run)}<h2>Welchen Schatz nimmst du mit?</h2>
          <p class="hint">Schätze wirken bis zum Ende des Runs. Je seltener, desto stärker.</p>
          <div class="cards loot">${items.map((r, i) => {
            const rid = r.rarity >= 0 ? GL.config.rarities[r.rarity].id : 'unique';
            return cardButton(i, treasureFace(r, 'relic'), `loot-opt tc-opt lr-${rid}`, tip);
          }).join('')}</div>${tipLine(tip)}${pickDock(run, items)}`;
      }

      case 'prep': {
        const foes = run.pending.enemies;
        const boss = foes.find(e => e.boss || e.mini);
        const front = foes[0];
        const mult = (a, d) => GL.battle.typeMult(a, d);
        const fmtMult = m => (m === 1 ? '' : '×' + String(m).replace('.', ','));
        const firstAlive = run.crew.findIndex(u => u.hp > 0);
        // Kompakte Vorschau: kleine Figuren nebeneinander statt langer Liste. Aufstellung ist automatisch.
        const crewRows = run.crew.map((u, i) => {
          const d = crewData(u.id);
          const atk = mult(u.type, front.type);
          const isFront = i === firstAlive;
          const tag = atk > 1 ? `<em class="pv-m good">${fmtMult(atk)}</em>` : atk < 1 ? `<em class="pv-m bad">${fmtMult(atk)}</em>` : '';
          return `<div class="pv-u role-bg-${d.role || ''}${u.hp <= 0 ? ' down' : ''}${isFront ? ' is-front' : ''}" tabindex="0"
              data-tip="${esc(`${d.name} · ${d.role ? GL.data.roles[d.role].name : ''}\nLeben ${u.hp}/${u.max} · Angriff ${u.atk} · Tempo ${u.spd}${atk !== 1 ? `\nSchaden gegen den Vordersten ${fmtMult(atk)}` : ''}`)}">
            ${isFront ? '<i class="pv-front" aria-hidden="true"></i>' : ''}
            <span class="pv-s">${GL.sprites.render(d)}</span>${tag}
            <i class="pv-hp"><b style="width:${Math.max(0, 100 * u.hp / u.max)}%"></b></i>
            <small>${esc(d.name.split(' ')[0])}</small>
          </div>`;
        }).join('');
        const foeRows = foes.map((e, i) => {
          const d = GL.data.foeDef(e) || enemyData(e.id);
          const fk = e.kind && GL.data.foeKind(e.kind);
          return `${e.wave === 2 && !(foes[i - 1] && foes[i - 1].wave === 2) ? '<span class="pv-wsep" aria-hidden="true">Welle 2</span>' : ''}<div class="pv-u foe${e.boss ? ' boss' : ''}${fk ? ' special' : ''}${e.wave === 2 ? ' w2' : ''}${e.elite2 ? ' elite2' : ''}${i === 0 ? ' is-front' : ''}" tabindex="0"
              data-tip="${esc(`${d.name}\n${e.hp} Leben · ${e.atk} Angriff${fk ? '\n' + fk.text : ''}${!fk && !e.boss && ability(e.id) ? '\n' + ability(e.id).name + ': ' + ability(e.id).text : ''}`)}">
            ${i === 0 ? '<i class="pv-front" aria-hidden="true"></i>' : ''}
            <span class="pv-s">${GL.sprites.render(d)}</span>
            ${fk ? `<em class="pv-m fk fk-${fk.key}">${fk.tag}</em>` : !e.boss && !e.mini && ability(e.id) && d.art ? `<em class="pv-m fk">${esc(ability(e.id).name)}</em>` : ''}
            <i class="pv-hp"><b style="width:100%"></b></i>
            <small>${e.hp} ♥</small>
          </div>`;
        }).join('');
        const huntedT = boss && boss.mini ? enemyData(boss.id) : null;
        const rivalBox = run.pending.rival ? `<div class="rival-box"><span class="event-kicker">Begegnung auf See</span>
          <b>${esc(run.pending.rival.name)}s Crew kreuzt deinen Kurs!</b>
          <small>Die echte Stammcrew eines Mitspielers, auf dein Level angepasst. Sieg bringt Extra-Gold.</small></div>` : '';
        return `${rivalBox}<h2>${run.pending.rival ? 'Aufstellung' : run.pending.kind === 'raid' ? 'Raid: ' + enemyData(boss.id).name : run.pending.kind === 'boss' ? 'Bosskampf: Aufstellung' : huntedT ? (run.pending.gate ? 'Bösewicht der Insel: ' : 'Kopfgeld-Ziel: ') + huntedT.name : 'Aufstellung'}</h2>
          ${huntedT ? `<p class="hint">Auf ${huntedT.name} sind <b>${huntedT.bounty} Mio. ฿</b> ausgesetzt. Sieg: Das Kopfgeld geht an deinen Kapitän, dazu ein Schatz.</p>` : ''}
          ${run.pending.kind === 'raid' ? `<p class="hint">Gewinnst du, gehört dir eine erwachte Teufelsfrucht für immer. Verlierst du, entkommt deine Crew mit wenig Leben.</p>` : ''}
          <div class="pv isl-${GL.run.island(run).id}${run.pending.kind === 'raid' ? ' raid' : ''}">
            <div class="pv-side"><span class="pv-label">Deine Crew ${dangerTag(run, run.pending.kind)}</span><div class="pv-row">${crewRows}</div></div>
            <div class="pv-vs" aria-hidden="true">VS</div>
            <div class="pv-side"><span class="pv-label">Gegner${foes.some(e => e.wave === 2) ? ' <em class="pv-waves">2 Wellen</em>' : ''}</span><div class="pv-row">${foeRows}</div></div>
          </div>
          <p class="hint form-hint">Aufstellung automatisch: <b>Brecher vorne</b>, Helfer hinten. ${typeChart()}</p>
          ${boss && ability(boss.id) && !run.pending.rival ? `<p class="hint boss-mech"><b>${unitName(boss)}, ${ability(boss.id).name}:</b> ${abilityTag(ability(boss.id))} ${ability(boss.id).text}</p>` : ''}
          ${boss && ability(boss.id) && ability(boss.id).status ? counterHint(run, ability(boss.id).status.key) : ''}
          ${specialPanel(run)}
          <div class="dock"><button class="btn" data-act="fight">${pxIco('swords')}Kampf starten ${keyHint('Leertaste')}</button></div>`;
      }

      case 'battle': {
        const b = run.battle;
        const done = !anim || anim.done;
        let log, controls;
        // Feste Daumen-Leiste: links Tempo, rechts ein großer Knopf (⏩ Turbo → ⏭ Ende → Weiter), immer am selben Platz
        const sp = done ? 0 : (anim.speed || 2);
        const seg = [1, 2, 3, 4].map(n => `<button class="fbar-sp${sp === n ? ' on' : ''}" data-act="speed" data-v="${n}" aria-label="Tempo ${n}" title="${['', 'Gemütlich', 'Zügig', 'Schnell', 'Turbo'][n]}"${done ? ' disabled' : ''}>${'▸'.repeat(n === 4 ? 3 : n)}${n === 4 ? '<i>⚡</i>' : ''}</button>`).join('');
        if (done) {
          log = b.win ? 'Sieg! Die Gegner sind besiegt.'
            : b.kind === 'raid' ? 'Der Raid ist gescheitert. Deine Crew entkommt mit letzter Kraft.'
            : 'Niederlage. Deine Crew ist gefallen.';
          controls = `<div class="fbar fbar3 is-done"><div class="fbar-seg" role="group" aria-label="Tempo">${seg}</div>${sfxBtn('fc-sfx')}<button class="fbar-ff go" data-act="continue"><b>Weiter</b><small>zur Route</small><i class="ff-ico"><svg class="ff-px" viewBox="0 0 5 7" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1z"/></svg></i></button></div>`;
        } else {
          log = anim.log;
          controls = `<div class="fbar fbar3"><div class="fbar-seg" role="group" aria-label="Tempo">${seg}</div>${sfxBtn('fc-sfx')}${ffButton(anim)}</div>`;
        }
        const title = b.kind === 'raid' ? 'Raid' : b.kind === 'boss' ? 'Bosskampf' : run.pending && run.pending.rival ? 'Begegnung: ' + esc(run.pending.rival.name) : 'Kampf';
        const sty = GL.effects.build ? GL.effects.build(run.crew) : null;
        return `<div class="battle-head"><h2>${title}</h2>${sty ? `<span class="bh-style b-${sty.key}" title="${esc(sty.pitch)}">${sty.icon}<b>${esc(sty.name)}</b><small>${'★'.repeat(sty.tier)}</small></span>` : ''}${done ? `<span class="result ${b.win ? 'win' : 'lose'}">${b.win ? 'Sieg' : 'Niederlage'}</span>` : ''}</div>
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
          ? `<div class="berry-gain">${GL.sprites.coin()} <b>+${ui.lastBerry}</b> Berry für das Hauptquartier${(run.bestStreak || 0) >= 3 ? `<small class="streak-note">${PX_FLAME} Längste Kopfgeld-Serie: ${run.bestStreak} Siege (+${(run.bestStreak - 2) * 3} Berry)</small>` : ''}</div>` : '';
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
        // Beute als kleine 3D-Kacheln (Icon groß, Rahmen in Seltenheitsfarbe, Name darunter), nacheinander eingeblendet
        const lootTile = (rid, art, name, i, tip) => `<span class="loot-tile lt-${rid}" style="--d:${i}"${tip ? ` data-tip="${esc(tip)}"` : ''}><i class="lt-art">${art}</i><small>${esc(name)}</small></span>`;
        const itemSum = newItems.length ? `<div class="trophy-sum items-sum loot-sum"><span class="event-kicker">Neue Ausrüstung für die Schmiede</span>
          <span class="loot-grid">${newItems.map((x, i) => lootTile(GL.config.rarities[x.r].id, itemIcon(x), itemName(x), i, GL.config.rarities[x.r].name)).join('')}</span></div>` : '';
        const cgNew = ui.profile && ui.lastBerry != null && GL.cgear ? (ui.profile.lastGear || []).map(uid => GL.cgear.bag(ui.profile).find(x => x.uid === uid)).filter(Boolean) : [];
        const cgHtml = cgNew.length ? `<div class="trophy-sum cg-sum loot-sum"><span class="event-kicker">Beute für deine Stammcrew</span>
          <span class="loot-grid">${cgNew.map((it, i) => lootTile(GL.cgear.RID[it.r], cgArt(it), GL.cgear.name(it), i)).join('')}</span></div>` : '';
        const shardHtml = run.endlessSea != null && ui.lastBerry != null ? `<div class="trophy-sum"><span class="event-kicker">Endlos-Fahrt · ${esc((GL.data.islands[run.endlessSea] || {}).name || '')}</span>
          <span>${run.loop || 0} ${run.loop === 1 ? 'Runde' : 'Runden'} geschafft${ui.profile && ui.profile.lastShards ? ` · <b>+${ui.profile.lastShards} 🔹 Meersplitter</b> zum Neu-Würfeln von Ausrüstung` : ''}</span></div>` : '';
        const tro = (run.trophies || []).map(id => (GL.data.artifacts || []).find(a => a.id === id)).filter(Boolean);
        const troHtml = tro.length ? `<div class="trophy-sum tro-sum loot-sum"><span class="event-kicker">Neu in der Schatzkammer</span>
          <span class="loot-grid">${tro.map((a, i) => lootTile('trophy', artIcon(a), a.name, i, a.text.replace('{v}', '…'))).join('')}</span></div>` : '';
        const duelHtml = run.daily ? `<div class="duel-sum"><span class="event-kicker">Tageskarte</span><span>Dein Ergebnis heute: <b>${GL.run.score(run).toLocaleString('de-DE')}</b> Punkte. Vergleiche dich in der Rangliste unter „Tageskarte“.</span></div>` : run.duel ? `<div class="duel-sum"><span class="event-kicker">Wettfahrt ${run.duel}</span>
          <span>Dein Ergebnis: <b>${GL.run.score(run).toLocaleString('de-DE')}</b> Punkte. Schick deinem Freund den Code <b>${run.duel}</b>, er spielt denselben Run.</span>
          <button class="btn mini ghost" data-act="duel-copy" data-id="${run.duel}">Code teilen</button></div>` : '';
        // Endlos-Modus: nach einem Sieg (nicht bei Tageskarte/Wettfahrt) weitersegeln
        const canEndless = false;   // Endlos ist jetzt ein eigener Modus im Hauptquartier
        const endlessHtml = canEndless ? `<div class="endless-box"><span class="event-kicker">Endlos-Modus</span>
          <b>Die Grand Line ist bezwungen${run.loop ? ` – zum ${run.loop + 1}. Mal` : ''}!</b>
          <span>Weitersegeln? Deine Crew bleibt, die Gegner werden mit jeder Runde stärker. Alles bisher Erreichte ist schon gutgeschrieben.</span></div>` : '';
        const goals = ui.profile && ui.lastBerry != null ? goalList(ui.profile, 3) : '';
        // Verbindung zur Stammcrew: wer mitgesegelt ist, ist vertrauter geworden
        const bond = ui.lastBond && ui.lastBond.length ? `<div class="trophy-sum bond-sum"><span class="event-kicker">Deine Crew wächst zusammen</span>
          <span class="bond-row">${ui.lastBond.map(b => `<span class="bond-u${b.up ? ' up' : ''}" data-tip="${esc(b.name)}: +${b.gain} Vertrautheit${b.lvl ? ` · Vertraut ${b.lvl}` : ''}"><i>${GL.sprites.render(b.id === 'self' ? avatarOf(ui.profile) : crewData(b.id))}</i><small>+${b.gain}</small>${b.up ? `<em>♥ ${b.lvl}</em>` : ''}</span>`).join('')}</span>
          <small class="bond-note">Vertrautheit macht Figuren in Stammcrew, Duellen und Landgang stärker.${ui.profile.lastSnacks ? ` · <b>+${ui.profile.lastSnacks} 🍙 Proviant</b> zum Verschenken` : ''}</small>
          ${(() => { const who = ui.lastBond[0]; const foe = run.battle && run.battle.enemies && run.battle.enemies[0]; const fd = foe ? (enemyData(foe.id) || crewData(foe.id)) : null;
            const t = lifeLine(ui.profile, who.id, run.phase === 'win' ? 'win' : 'lose', { boss: fd ? fd.name : 'den Boss' });
            const d = who.id === 'self' ? avatarOf(ui.profile) : crewData(who.id);
            return t && d ? `<p class="bond-say"><i>${GL.sprites.render(d)}</i><span><b>${esc(d.name)}</b>${esc(t)}</span></p>` : ''; })()}</div>` : '';
        const bdE = GL.effects.build ? GL.effects.build(run.crew) : null;
        const buildEnd = bdE ? `<div class="sum-build b-${bdE.key}"><i>${bdE.icon}</i><span><b>Dein Stil: ${esc(bdE.name)} ${'★'.repeat(bdE.tier)}</b><small>${esc(bdE.pitch)}. ${bdE.next ? `Mit ${bdE.next.n}× ${esc(bdE.label)} wird er noch stärker.` : 'Volle Stufe, stark!'}</small></span></div>`
          : `<div class="sum-build none"><i>✦</i><span><b>Probier mal einen Stil</b><small>Sammle gleiche Kampfstile: 💥 Wucht (Kraft) knackt Bosse, ⚔ Schwertkunst (Klinge) kritet, 💨 Tempo (Technik) weicht aus, 💚 Lazarett (Helfer) heilt.</small></span></div>`;
        return `${head}${buildEnd}${duelHtml}${endlessHtml}${record}${berry}${bond}${shardHtml}${cgHtml}${troHtml}${itemSum}${rankHtml}${heatUp}${goals}<div class="end-actions dock">${canEndless ? `<button class="btn" data-act="endless">${pxIco('ship')}Weitersegeln</button>` : ''}<button class="btn${canEndless ? ' ghost' : ''}" data-act="again">${pxIco('loop')}${run.daily ? 'Neuer Run' : run.duel ? 'Normaler Run' : 'Nochmal!'} ${keyHint('Leertaste')}</button>
          <button class="btn ghost" data-act="hq">${pxIco('anchor')}Hauptquartier ${keyHint('H')}</button></div>`;
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
    { id: 'endless',   name: 'Endlos',            get: x => x.endlessRec ? (x.endlessRec.sea + 1) * 1000 + x.endlessRec.loops : (x.endlessLoops || 0), show: x => x.endlessRec ? x.endlessRec.loops : (x.endlessLoops || 0), unit: 'Runden Endlos-Fahrt', sub: x => x.endlessRec ? (GL.data.islands[x.endlessRec.sea] || {}).name : '' },
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
  // ---------- Crew-Ausrüstung (Stammcrew) ----------
  const CG_COL = ['#9a8f80', '#4f86c6', '#9a5bd0', '#e0a030'];
  const CG_ICON = { waffe: '⚔', kleid: '🧥', schmuck: '💍', trophae: '🏆' };
  const CG_ART = {
    sword:   ['........AB', '.......AB.', '......AB..', '.....AB...', '....AB....', '.C.AB.....', '..CB......', '..CC......', '.C..C.....', 'C.........'],
    gun:     ['..........', '..........', 'AAAAAAAAB.', 'BBBBBBAAB.', '.....CCAB.', '.....C.BB.', '......CBB.', '.......BB.', '..........', '..........'],
    trident: ['A...A...A.', 'A...A...A.', 'AA..A..AA.', '.AAAAAAA..', '....B.....', '....B.....', '....B.....', '....B.....', '....B.....', '....B.....'],
    coat:    ['..AA..AA..', '.AAACCAAA.', 'AAAACCAAAA', 'AAAACCAAAA', '.AAACCAAA.', '.AAACCAAA.', '.AAACCAAA.', '.AAACCAAA.', '.AAACCAAA.', '.BBB..BBB.'],
    bandana: ['..........', '...AAAA...', '..AAAAAA..', '.AACAACAA.', '.AAAAAAAA.', 'BBBBBBBBBB', '........AA', '.......A.A', '..........', '..........'],
    ring:    ['....CC....', '...CAAC...', '....AA....', '..AA..AA..', '.A......A.', '.A......A.', '.A......A.', '..AA..AA..', '....AA....', '..........'],
    compass: ['...AAAA...', '..ABBBBA..', '.AB.C..BA.', '.AB.CC.BA.', '.AB.C..BA.', '.AB.....BA', '.AB....BA.', '..ABBBBA..', '...AAAA...', '..........']
  };
  function cgArt(it) {
    if (it.t) { const l = (GL.data.huntLoot || []).find(x => x.id === it.t); if (l) return lootArt(l).replace('<svg ', '<svg class="cg-art" '); }
    const b = GL.cgear.base(it.b) || {};
    const rows = CG_ART[b.art] || CG_ART.ring;
    const col = { A: CG_COL[it.r] || CG_COL[0], B: '#5a4632', C: '#f2e3b8' };
    let r = '';
    rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch !== '.') r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col[ch]}"/>`; }));
    return `<svg viewBox="0 0 10 10" class="cg-art" aria-hidden="true">${r}</svg>`;
  }
  // Kleines Teil (Platz, Tasche, Visitenkarte)
  function cgChip(it, act, extra) {
    return `<button class="cg-chip cr-${GL.cgear.RID[it.r]}" data-act="${act}" ${extra || ''} title="${esc(GL.cgear.name(it))}">${cgArt(it)}</button>`;
  }
  // Ausführliche Karte (im Fenster)
  function cgCard(it, foot) {
    const f = GL.cgear.from(it);
    return `<div class="cg-card cr-${GL.cgear.RID[it.r]}">
      <div class="cg-card-top">${cgArt(it)}<span><b>${esc(GL.cgear.name(it))}</b><small>${GL.cgear.RNAME[it.r]} · ${esc((GL.data.crewGear.slots.find(s => s.id === GL.cgear.slotOf(it)) || {}).name || '')}${it.t ? ' · bleibt auch in der Vitrine' : ''}</small></span><em class="cg-pow">⚔ ${GL.cgear.power(it)}</em></div>
      <ul class="cg-lines">${GL.cgear.lines(it).map(l => `<li class="${l.main ? 'main' : ''}">${esc(l.text)}</li>`).join('')}</ul>
      <p class="cg-from">Gefunden: ${esc(f.who)}${f.where ? ' · ' + esc(f.where) : ''}${f.loop ? ` · Endlos ${f.loop}` : ''}<br><small>${esc(f.when)}</small></p>
      ${foot || ''}
    </div>`;
  }
  function gearPanel(profile, refs) {
    if (!GL.cgear) return '';
    const bag = GL.cgear.bag(profile), W = GL.cgear.worn(profile);
    const fresh = profile.gearNew || [];
    const rows = refs.map(r => `<div class="cg-row"><i class="cg-who">${squadSprite(r)}</i><b>${esc(r.name)}</b>
      <span class="cg-slots">${GL.data.crewGear.slots.map(sl => {
        const it = bag.find(x => x.uid === (W[r.id] || {})[sl.id]);
        return it ? `<span class="cg-slotw">${cgChip(it, 'cg-slot', `data-id="${esc(r.id)}" data-slot="${sl.id}"`)}<small>${sl.name}</small></span>`
          : `<span class="cg-slotw"><button class="cg-chip empty" data-act="cg-slot" data-id="${esc(r.id)}" data-slot="${sl.id}" title="${sl.name} anlegen">+</button><small>${sl.name}</small></span>`;
      }).join('')}</span></div>`).join('');
    const list = bag.slice().sort((a, b) => b.r - a.r || GL.cgear.power(b) - GL.cgear.power(a));
    return `<div class="cg-panel">
      <div class="cg-head"><b>Ausrüstung</b><small>${bag.length}/${GL.data.crewGear.bagMax} in der Tasche · 🔹 ${profile.shards || 0}</small></div>
      ${bag.length ? '<p class="cg-hint">Teil auf einen passenden Platz ziehen oder den Platz antippen.</p>' : ''}
      ${rows}
      ${list.length ? `<div class="cg-bag">${GL.data.crewGear.slots.map(sl => { const grp = list.filter(it => GL.cgear.slotOf(it) === sl.id); return grp.length ? `<div class="cg-grp"><small class="cg-grp-t">${CG_ICON[sl.id]} ${sl.id === 'trophae' ? 'Trophäen' : sl.id === 'waffe' ? 'Waffen' : sl.name} <em>${grp.length}</em></small><div class="cg-grp-items">${grp.map(it => { const by = GL.cgear.wornBy(profile, it.uid), w = gearWearer(profile, by); return `<span class="cg-bagit${fresh.includes(it.uid) ? ' new' : ''}${by ? ' worn' : ''}">${cgChip(it, 'cg-item', `data-uid="${it.uid}"`)}${w ? `<i class="cg-face" title="Angelegt bei ${esc(w.name)}">${w.spr}</i>` : ''}</span>`; }).join('')}</div></div>` : ''; }).join('')}</div>`
        : '<p class="hint">Noch leer. Bosse und Raids lassen ab jetzt Waffen, Kleidung und Schmuck fallen, im Endlos-Modus öfter und besser.</p>'}
    </div>`;
  }
  // Kleiner grüner Pixel-Pfeil nach oben (bessere Ausrüstung verfügbar)
  const PX_UPG = '<svg class="px-up" viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><rect x="3" y="0" width="1" height="1" fill="#1f6b33"/><rect x="2" y="1" width="3" height="1" fill="#2f9a4a"/><rect x="1" y="2" width="5" height="1" fill="#3fb85c"/><rect x="0" y="3" width="7" height="1" fill="#1f6b33"/><rect x="2" y="3" width="3" height="4" fill="#3fb85c"/><rect x="2" y="6" width="3" height="1" fill="#1f6b33"/></svg>';
  // Wer trägt dieses Teil? (Mini-Figur + Name)
  function gearWearer(profile, by) {
    if (!by) return null;
    const ref = (GL.meta.squadRefs(profile) || []).find(r => r.id === by);
    const name = by === 'self' ? (profile.nickname || 'Du') : (crewData(by) || {}).name || (ref && ref.name) || '';
    const spr = ref ? squadSprite(ref) : crewData(by) ? GL.sprites.render(crewData(by)) : '';
    return { name, spr };
  }
  function wornTag(profile, by, here) {
    const w = gearWearer(profile, by);
    return w ? `<span class="cg-worn${here ? ' here' : ''}"><i>${w.spr}</i><span>${here ? 'Gerade angelegt bei' : 'Angelegt bei'} <b>${esc(w.name)}</b></span></span>` : '<span class="cg-worn free">Frei in der Tasche</span>';
  }
  // Fenster: Teil für einen Platz wählen
  function gearPick(profile, crewId, slot) {
    const bag = GL.cgear.bag(profile), W = GL.cgear.worn(profile);
    const cur = bag.find(x => x.uid === (W[crewId] || {})[slot]);
    const opts = bag.filter(x => GL.cgear.slotOf(x) === slot && x !== cur).sort((a, b) => GL.cgear.power(b) - GL.cgear.power(a));
    const sl = GL.data.crewGear.slots.find(s => s.id === slot) || {};
    const who = crewId === 'self' ? (profile.nickname || 'Du') : (crewData(crewId) || {}).name;
    return `<div class="fpop-card cg-pop" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">${esc(sl.name || '')} für ${esc(who || '')}</span>
      ${cur ? cgCard(cur, `${wornTag(profile, crewId, true)}<button class="btn mini ghost" data-act="cg-off" data-id="${esc(crewId)}" data-slot="${slot}">Ablegen</button>`) : '<h3 id="fpop-t">Noch nichts angelegt</h3>'}
      ${opts.length ? `<div class="cg-list">${opts.map(it => { const by = GL.cgear.wornBy(profile, it.uid), w = gearWearer(profile, by);
        const dp = cur ? GL.cgear.power(it) - GL.cgear.power(cur) : null;
        const delta = dp == null ? '' : `<span class="cg-delta ${dp > 0 ? 'up' : dp < 0 ? 'dn' : 'eq'}">${dp > 0 ? '+' : ''}${dp} ⚔ zum jetzigen</span>`;
        return `<div class="cg-opt${by ? ' taken' : ''}">${cgCard(it, `<div class="cg-optfoot">${wornTag(profile, by)}${delta}</div><button class="btn mini${by ? ' ghost' : ''}" data-act="cg-on" data-id="${esc(crewId)}" data-uid="${it.uid}">${by ? `Von ${esc(w.name)} nehmen` : 'Anlegen'}</button>${by ? `<small class="cg-warn">${esc(w.name)} hat danach nichts mehr auf diesem Platz.</small>` : ''}`)}</div>`; }).join('')}</div>`
        : `<p class="hint">Keine passenden Teile in der Tasche. Bosse lassen ${esc(sl.name || 'Ausrüstung')} fallen.</p>`}
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Schließen</button></div>
    </div>`;
  }
  // Fenster: ein Teil ansehen (eigenes: zerlegen; fremdes: nur ansehen)
  function gearView(it, own, profile) {
    const by = own && GL.cgear.wornBy(profile, it.uid);
    const C = GL.data.crewGear, cost = C.rerollCost[it.r] || 1, sh = profile.shards || 0;
    const extra = Object.keys(it.a || {}).filter(k => k !== it.m).length;
    const rr = own && extra ? `<button class="btn mini" data-act="cg-reroll" data-uid="${it.uid}"${sh < cost ? ' disabled' : ''}>🔹 Werte neu würfeln (${cost})</button>` : '';
    const foot = own ? `<div class="cg-foot">${rr}${by ? wornTag(profile, by)
      : `<button class="btn mini ghost danger-btn" data-act="cg-scrap" data-uid="${it.uid}">Zerlegen (+${C.scrap[it.r]} Berry${C.shardScrap[it.r] ? `, +${C.shardScrap[it.r]} 🔹` : ''}${(C.snackScrap || [])[it.r] ? `, +${C.snackScrap[it.r]} 🍙` : ''})</button>`}</div>
      <small class="cg-shards">🔹 ${sh} Meersplitter · gibt es in der Endlos-Fahrt und beim Zerlegen seltener Teile</small>` : '';
    return `<div class="fpop-card cg-pop" role="dialog"><span class="fpop-kicker">Ausrüstung</span>${cgCard(it, foot)}
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Schließen</button></div></div>`;
  }
  // Gegner-Vorschau vor einem Duell: wer, welche Crew, Stärke und Chance
  function matchPop(row, profile, chance) {
    const mineR = GL.meta.squadRefs(profile), foeR = row.squad || [];
    const mine = GL.meta.squadPower(mineR), theirs = row.squadPower || GL.meta.squadPower(foeR);
    const ch = chance >= 65 ? 'gut' : chance >= 40 ? 'offen' : 'schwer';
    const pw = r => r.max * 0.5 + r.atk * 4 + r.spd * 2;
    // Kompakt: zwei Reihen kleiner Figuren, Platz gegen Platz. Pfeil = wer auf dem Platz stärker ist. Details per Hover/Finger halten.
    const tile = (r, o, foe) => {
      if (!r) return '<span class="mp-u empty"></span>';
      const gear = (r.gear || []).map(g => GL.cgear.name(g)).join(', ');
      const tip = `${r.name}${r.lvl ? ' · Lv ' + r.lvl : ''}\nLeben ${r.max} · Angriff ${r.atk} · Tempo ${r.spd}${gear ? '\nAusrüstung: ' + gear : ''}`;
      return `<span class="mp-u${foe ? ' foe' : ''}" data-tip="${esc(tip)}" tabindex="0"><i>${squadSprite(r)}</i>${o && !foe ? `<span class="mp-cmp">${cmpArrow(pw(r), pw(o))}</span>` : ''}${(r.gear || []).length ? `<em class="mp-gn cr-${GL.cgear.RID[Math.max(...r.gear.map(g => g.r))]}">${r.gear.length}</em>` : ''}<small>${esc(String(r.name).split(' ')[0])}</small></span>`;
    };
    const n = Math.max(mineR.length, foeR.length);
    const idx = Array.from({ length: n }, (_, i) => i);
    return `<div class="fpop-card match-pop" role="dialog" aria-labelledby="fpop-t">
      <div class="mp-head"><span class="fpop-kicker">Gegner gefunden</span>
        <h3 id="fpop-t">${esc(row.name || 'Pirat')}</h3>${row.squadRating ? leagueChip(row.squadRating, true) : ''}</div>
      <div class="mp-teams">
        <span class="mp-lbl">Du <b>⚔ ${mine}</b></span><div class="mp-row">${idx.map(i => tile(mineR[i], foeR[i], false)).join('')}</div>
        <span class="mp-lbl foe">${esc(String(row.name || 'Gegner').slice(0, 14))} <b>⚔ ${theirs}</b></span><div class="mp-row">${idx.map(i => tile(foeR[i], null, true)).join('')}</div>
      </div>
      <div class="mp-chance ch-${ch}"><span>Siegchance</span><b>${chance} %</b><i style="width:${chance}%"></i></div>
      <div class="mp-btns"><button class="btn" data-act="squad-attack">⚔ Angreifen</button><button class="btn ghost" data-act="squad-match">Anderer</button><button class="btn ghost mp-x" data-act="pop-close" aria-label="Abbrechen">✕</button></div>
    </div>`;
  }
  function squadSection(profile, uiRef) {
    if (!GL.meta.squadUnlocked(profile)) {
      return `<section class="hq-sec squad-sec squad-locked">
        <div class="sl-art">${squadMini(GL.meta.squadRefs(profile))}</div>
        <b>🔒 Stammcrew & Crew-Liga</b>
        <p class="hint">Dein Endgame: Stell eine feste Crew auf, die dich auch offline verteidigt. Fordere andere Crews heraus, steig von der Planken- bis zur Legenden-Liga auf und zeig in der Rangliste, wer die stärkste Crew hat.</p>
        <small class="muted">Freigeschaltet nach deinem ersten gewonnenen Run oder ab Rang 5.</small>
      </section>`;
    }
    const refs = GL.meta.squadRefs(profile);
    const pool = GL.meta.squadPool(profile);
    const ids = GL.meta.squadIds(profile);
    const N = GL.meta.squadSize;
    const pw = r => r.max * 0.5 + r.atk * 4 + r.spd * 2;
    const weakest = refs.length >= N ? refs.slice().sort((a, b) => pw(a) - pw(b))[0] : null;
    const refOf = id => GL.meta.squadRefs(Object.assign({}, profile, { squad: [id] }))[0];
    const dOf = id => id === 'self' ? avatarOf(profile) : crewData(id);
    const pick = uiRef && uiRef.sqPick && pool.includes(uiRef.sqPick) ? uiRef.sqPick : null;
    const flt = (uiRef && uiRef.sqFilter) || 'all';
    const W = GL.cgear ? GL.cgear.worn(profile) : {}, bag = GL.cgear ? GL.cgear.bag(profile) : [];
    const SL = GL.data.crewGear ? GL.data.crewGear.slots : [];
    // Bühne: vier Karten auf dem Deck. Antippen = Ankleiden, Ziehen = Reihenfolge, Karte aus der Sammlung draufziehen = einsetzen
    const deck = Array.from({ length: N }, (_, k) => {
      const r = refs[k];
      if (!r) return `<div class="sqd-card empty${pick ? ' target' : ''}" data-act="sq-place" data-k="${k}" data-sqslot="${k}"><span class="sqd-plus">+</span><small>${pick ? 'Hier einsetzen' : 'Karte hierher ziehen'}</small></div>`;
      const d = dOf(r.id), xp = (profile.squadXp || {})[r.id] || 0, bond = GL.meta.squadBonus(xp);
      const UP = GL.cgear && GL.cgear.upgrades ? GL.cgear.upgrades(profile, r.id) : {}, upN = Object.keys(UP).length;
      const slots = SL.map(sl => { const it = bag.find(x => x.uid === (W[r.id] || {})[sl.id]);
        return (it ? `<span class="sqd-g cr-${GL.cgear.RID[it.r]}${UP[sl.id] ? ' can-up' : ''}" title="${esc(GL.cgear.name(it))}">${cgArt(it)}</span>` : `<span class="sqd-g none${UP[sl.id] ? ' can-up' : ''}" title="${esc(sl.name)}">${CG_ICON[sl.id]}</span>`); }).join('');
      return `<div class="sqd-card${pick ? ' target' : ''}${k === 0 ? ' front' : ''}" data-sqslot="${k}" data-sqid="${esc(r.id)}">
        <button class="sqd-main" data-act="${pick ? 'sq-place' : 'dress'}" data-k="${k}" data-id="${esc(r.id)}">
          <span class="sqd-pos">${k === 0 ? 'Vorne' : k + 1}</span>
          <span class="sqd-lv">Lv ${r.lvl}</span>${upN && !pick ? `<span class="up-badge" title="${upN} ${upN === 1 ? 'Platz' : 'Plätze'} mit besserer Ausrüstung in der Truhe">${PX_UPG}<b>${upN}</b></span>` : ''}
          <i class="sqd-spr">${squadSprite(r)}</i>
          <b class="sqd-name">${esc(d.name)}</b>
          <span class="sqd-st"><em>♥${r.max}</em><em>⚔${r.atk}</em><em>➤${r.spd}</em></span>
          <span class="sqd-gear">${slots}</span>
          ${pick ? `<span class="sqd-swap">Tauschen</span>` : `<span class="sqd-dress">${pxIco('anchor')}Ankleiden</span>`}
        </button>
        ${bond ? `<button class="sqd-bond" data-act="crew-card" data-id="${esc(r.id)}" title="Steckbrief">♥${bond}</button>` : ''}
        ${refs.length > 1 && !pick ? `<button class="sqd-x" data-act="squad-toggle" data-id="${esc(r.id)}" aria-label="Aus der Stammcrew nehmen">✕</button>` : ''}
      </div>`;
    }).join('');
    // Sammlung: alle Karten, die du aufstellen kannst. Sortiert nach Stärke, Filter nach Kampfstil
    const cards = pool.map(id => ({ id, d: dOf(id), r: refOf(id), on: ids.includes(id) })).filter(x => x.d && x.r);
    const typeOf = x => x.id === 'self' ? profile.char.type : x.d.type;
    const shown = cards.filter(x => flt === 'all' || typeOf(x) === flt).sort((a, b) => (b.on - a.on) || pw(b.r) - pw(a.r));
    const delta = x => { if (x.on || !weakest) return ''; const df = Math.round(pw(x.r) - pw(weakest)); return df === 0 ? '' : `<em class="sqc-d ${df > 0 ? 'up' : 'dn'}" title="Im Vergleich zur schwächsten Figur deiner Stammcrew">${df > 0 ? '▲' : '▼'}${Math.abs(df)}</em>`; };
    const types = ['all'].concat(Object.keys(GL.data.types));
    const filt = `<div class="sqc-filter" role="tablist">${types.map(t => `<button class="sqc-f${flt === t ? ' on' : ''}" data-act="sq-filter" data-v="${t}">${t === 'all' ? 'Alle' : `${pxIcon(t)}${esc(GL.data.types[t].name)}`}</button>`).join('')}</div>`;
    const LIM = 12, all = uiRef && uiRef.sqAll, cut = !all && shown.length > LIM + 2;
    const coll = (cut ? shown.slice(0, LIM) : shown).map(x => `<button class="sqc${x.on ? ' on' : ''}${pick === x.id ? ' picked' : ''}${weakest && weakest.id === x.id ? ' weak' : ''}" data-act="sq-pick" data-id="${esc(x.id)}" data-sqcard="${esc(x.id)}">
        ${x.on ? '<span class="sqc-on">Dabei</span>' : delta(x)}${x.on && GL.cgear && GL.cgear.upgrades ? (n => n ? `<span class="up-badge sm" title="Bessere Ausrüstung in der Truhe">${PX_UPG}<b>${n}</b></span>` : '')(Object.keys(GL.cgear.upgrades(profile, x.id)).length) : ''}
        <i class="sqc-spr">${GL.sprites.render(x.d)}</i><b>${esc(x.d.name)}</b>
        <span class="sqc-ty">${pxIcon(typeOf(x))}<small>♥${x.r.max} ⚔${x.r.atk}</small></span></button>`).join('') + (cut ? `<button class="sqc-more" data-act="sq-all">Alle ${shown.length} Karten zeigen</button>` : '');
    const w = profile.squadW || 0, l = profile.squadL || 0;
    const r0 = profile.squadRating == null ? 1000 : profile.squadRating, nx = GL.meta.leagues.find(x => x.min > r0);
    const pd = pick ? dOf(pick) : null;
    return `<section class="hq-sec squad-sec sq2">
      <div class="squad-head">
        <div><span class="event-kicker">Deine Stammcrew</span>
          <b class="squad-power">⚔ ${GL.meta.squadPower(refs)} Stärke</b>
          <small>Level ${GL.meta.squadLevel(profile)} · ${w} Siege, ${l} Niederlagen</small></div>
        <div class="sq-league">${leagueChip(r0, true)}<small>${nx ? `noch ${nx.min - r0} bis ${nx.name}` : 'höchste Liga'}</small></div>
      </div>
      <div class="sqd-deck${pick ? ' picking' : ''}">${deck}</div>
      ${pick ? `<div class="sq-pickbar"><i>${GL.sprites.render(pd)}</i><span><b>${esc(pd.name)}</b> einsetzen: tipp oben auf einen Platz</span><button class="btn mini ghost" data-act="sq-pick" data-id="${esc(pick)}">Abbrechen</button></div>`
        : `<p class="sq-tip">Karte antippen zum Ankleiden. Aus der Sammlung eine Karte auf einen Platz ziehen oder antippen. <b>Vorne</b> steht, wer zuerst getroffen wird.</p>`}
      <button class="btn squad-match" data-act="squad-match">${pxIco('swords')}Gegner suchen <small>ähnliche Stärke</small></button>
      ${GL.cgear && GL.cgear.upgrades && refs.some(x => Object.keys(GL.cgear.upgrades(profile, x.id)).length) ? `<div class="sq-best-hint">${PX_UPG}<b>${refs.reduce((n, x) => n + Object.keys(GL.cgear.upgrades(profile, x.id)).length, 0)} Verbesserungen in der Truhe</b><small>Grüne Pfeile zeigen, wer etwas Besseres tragen kann. Antippen zum Ankleiden.</small></div>` : ''}
      ${GL.cgear ? `<button class="sq-chest" data-act="dress" data-id="${esc((refs[0] || {}).id || 'self')}"><i class="sq-chest-ico">${pxIco('chest')}</i><span><b>Truhe & Ankleiden</b><small>${bag.length}/${GL.data.crewGear.bagMax} Teile · 🔹 ${profile.shards || 0}${(profile.gearNew || []).length ? ` · <em class="sq-new">${profile.gearNew.length} neu</em>` : ''}</small></span><span class="sq-chest-go">›</span></button>` : ''}
      <div class="sqc-head"><b>Deine Karten</b><small>${cards.length} Figuren · ${ids.length}/${N} dabei</small></div>
      ${filt}
      <div class="sqc-grid">${coll}</div>
      <p class="hint">Freunde fordern deine Stammcrew in der Rangliste heraus, auch wenn du offline bist. Wer in einem Run, Duell oder Landgang dabei ist, wird vertrauter und bekommt Extra-Level (♥). ▲/▼ zeigt, wie viel stärker oder schwächer eine Karte als deine schwächste Figur wäre.</p>
    </section>`;
  }
  // Flaschenpost: Freund wählen
  function bottlePick(profile, it) {
    const fr = (profile.friends || []).map(c => ({ c, r: GL.friends && GL.friends.rowOf(c) })).filter(x => x.r && x.r.id);
    return `<div class="bp-box"><b>🍾 Flaschenpost: ${esc(GL.cgear.name(it))} an …</b>
      ${fr.length ? `<div class="bp-list">${fr.map(x => `<button class="bp-f" data-act="bottle-to" data-uid="${it.uid}" data-to="${esc(x.r.id)}" data-name="${esc(x.r.name || 'Freund')}"><i>${x.r.look ? GL.sprites.render({ id: 'self', name: x.r.name, look: x.r.look }) : ''}</i><span>${esc(x.r.name || 'Freund')}</span></button>`).join('')}</div>
        <small>Das Teil verlässt deine Truhe und kommt beim nächsten Öffnen bei deinem Freund an. Bis zu 5 Flaschen am Tag.</small>`
        : '<small>Noch keine Freunde in deiner Liste. Freunde fügst du im Kapitänsbuch unter „♥ Freunde“ hinzu.</small>'}
      <button class="btn mini ghost" data-act="bottle" data-uid="">Abbrechen</button></div>`;
  }
  // Logbuch: alle Story-Kapitel, gesehene zum Nochmal-Ansehen, das nächste mit Hinweis
  function storyBook(profile) {
    const en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
    const seen = (profile.story && profile.story.seen) || [];
    let nextShown = false;
    const rows = (GL.data.story || []).map(c => {
      const done = seen.includes(c.id);
      const t = en ? c.title[1] : c.title[0];
      if (done) return `<button class="stb-row done" data-act="story-play" data-id="${c.id}"><em class="stb-no">${c.no}</em><span><b>${esc(t)}</b><small>${en ? 'Watch again' : 'Nochmal ansehen'}</small></span><i class="stb-go">▶</i></button>`;
      if (!nextShown) { nextShown = true; const ready = c.when(profile); return `<div class="stb-row next${ready ? ' ready' : ''}"><em class="stb-no">${c.no}</em><span><b>${esc(t)}</b><small>${ready ? (en ? 'Comes on your next visit to the harbor' : 'Kommt beim nächsten Besuch im Hafen') : (en ? 'Unlocks: ' : 'Kommt: ') + esc(en ? c.need[1] : c.need[0])}</small></span><i class="stb-go">${ready ? '✨' : '🔒'}</i></div>`; }
      return `<div class="stb-row locked"><em class="stb-no">${c.no}</em><span><b>???</b><small>${en ? 'Later' : 'Später'}</small></span><i class="stb-go">🔒</i></div>`;
    }).join('');
    return `<div class="fpop-card story-book" role="dialog"><span class="fpop-kicker">${en ? 'Story' : 'Story'}</span><h3 id="fpop-t">${en ? 'The Recipe from the End of the World' : 'Das Rezept vom Ende der Welt'}</h3>
      <p class="hint">${en ? 'Little scenes with your crew. A new chapter comes with your progress.' : 'Kleine Szenen mit deiner Crew. Mit deinem Fortschritt kommt ein neues Kapitel.'}</p>
      <div class="stb-list">${rows}</div>
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">${en ? 'Close' : 'Schließen'}</button></div></div>`;
  }
  // Vergleich zweier Teile Wert für Wert (neu gegen angelegt)
  function gearCompare(sel, cur, st0) {
    const A = GL.data.crewGear.affixes, keys = [...new Set(Object.keys(sel.a || {}).concat(Object.keys((cur && cur.a) || {})))];
    const fmt = (k, v) => A[k] ? A[k].fmt(v) : `${v}`;
    const rows = keys.map(k => {
      const a = (sel.a || {})[k] || 0, b = ((cur && cur.a) || {})[k] || 0, d = a - b;
      const pct = ['crit', 'dodge', 'dmgPct'].includes(k);
      const ds = d === 0 ? '' : `${d > 0 ? '+' : '−'}${pct ? Math.round(Math.abs(d) * 100) + ' %' : Math.abs(d)}`;
      return `<span class="gc-row ${d > 0 ? 'up' : d < 0 ? 'dn' : 'eq'}"><span>${a ? esc(fmt(k, a)) : `<s>${esc(A[k] ? A[k].name : k)}</s>`}</span>${cur ? `<em>${ds ? (d > 0 ? '▲ ' : '▼ ') + ds : '='}</em>` : ''}</span>`;
    }).join('');
    const dp = cur ? GL.cgear.power(sel) - GL.cgear.power(cur) : null;
    return `<div class="gc">${cur || !st0 ? rows : ''}${dp != null ? `<span class="gc-sum ${dp > 0 ? 'up' : dp < 0 ? 'dn' : 'eq'}">${dp > 0 ? 'Stärker' : dp < 0 ? 'Schwächer' : 'Gleich stark'} als das jetzige <b>${dp > 0 ? '+' : ''}${dp} ⚔</b></span>` : '<span class="gc-sum up">Platz ist noch frei</span>'}</div>`;
  }
  // Hinweis beim Darüberfahren (PC): Name, Werte und Vergleich mit dem angelegten Teil der gewählten Figur
  function gearTip(profile, uid, crewId) {
    const bag = GL.cgear.bag(profile), it = bag.find(x => x.uid === uid); if (!it) return '';
    const W = GL.cgear.worn(profile), sid = GL.cgear.slotOf(it);
    const cur = crewId ? bag.find(x => x.uid === (W[crewId] || {})[sid]) : null;
    const mine = cur && cur.uid === it.uid;
    const who = crewId === 'self' ? (profile.nickname || 'Du') : (crewData(crewId) || {}).name || '';
    return `<div class="gtip cr-${GL.cgear.RID[it.r]}"><b>${esc(GL.cgear.name(it))}</b><small>${GL.cgear.RNAME[it.r]} · ⚔ ${GL.cgear.power(it)}</small>
      ${mine ? `<span class="gc-sum eq">Trägt ${esc(who)} gerade</span>${gearCompare(it, null).replace('<span class="gc-sum up">Platz ist noch frei</span>', '')}` : gearCompare(it, cur)}${crewId && !mine ? `<small class="gtip-who">Vergleich für ${esc(who)}</small>` : ''}</div>`;
  }
  // Ankleidemenü: Figur in der Mitte, vier Plätze drumherum, Truhe darunter
  function dressRoom(profile, st) {
    const refs = GL.meta.squadRefs(profile);
    const id = refs.some(r => r.id === st.id) ? st.id : (refs[0] || {}).id;
    const r = refs.find(x => x.id === id); if (!r) return '';
    const d = id === 'self' ? avatarOf(profile) : crewData(id);
    const W = GL.cgear.worn(profile), bag = GL.cgear.bag(profile), SL = GL.data.crewGear.slots;
    const fresh = profile.gearNew || [];
    const slotSel = st.slot || null;
    const curOf = sid => bag.find(x => x.uid === (W[id] || {})[sid]);
    const sel = st.uid ? bag.find(x => x.uid === st.uid) : (slotSel ? curOf(slotSel) : null);
    const UP = GL.cgear.upgrades ? GL.cgear.upgrades(profile, id) : {}, upN = Object.keys(UP).length;
    const slotBtn = sl => { const it = curOf(sl.id), u = UP[sl.id];
      return `<button class="dr-slot${slotSel === sl.id ? ' on' : ''}${it ? ' cr-' + GL.cgear.RID[it.r] : ' empty'}${u ? ' can-up' : ''}" data-act="dr-slot" data-slot="${sl.id}" data-cgslot="${sl.id}" data-id="${esc(id)}"${u ? ` title="Besser in der Truhe: ${esc(GL.cgear.name(u.it))} (+${u.delta} ⚔)"` : ''}>
        <i class="dr-art">${it ? cgArt(it) : `<span class="dr-ph">${CG_ICON[sl.id]}</span>`}</i><small>${esc(sl.name)}</small>${it ? `<em class="dr-pow">⚔${GL.cgear.power(it)}</em>` : ''}${u ? `<em class="dr-upchip">▲ +${u.delta}</em>` : ''}</button>`; };
    const tabUp = x => { const n = GL.cgear.upgrades ? Object.keys(GL.cgear.upgrades(profile, x.id)).length : 0; return n ? `<em class="dr-tabup" title="${n} Verbesserungen">▲${n}</em>` : ''; };
    const tabs = refs.map(x => `<button class="dr-tab${x.id === id ? ' on' : ''}" data-act="dress" data-id="${esc(x.id)}"><i>${squadSprite(x)}</i><small>${esc(String(x.name).split(' ')[0])}</small>${tabUp(x)}</button>`).join('');
    const g = r.gb || {};
    const extra = [g.crit ? `Krit ${Math.round(g.crit * 100)} %` : '', g.dodge ? `Ausweichen ${Math.round(g.dodge * 100)} %` : '', g.armor ? `Rüstung ${g.armor}` : '', g.dmgPct ? `Schaden +${Math.round(g.dmgPct * 100)} %` : ''].filter(Boolean);
    // Detail: ausgewähltes Teil mit Vergleich zum jetzigen auf dem Platz
    let detail = '';
    if (sel) {
      const sid = GL.cgear.slotOf(sel), cur = curOf(sid), mine = cur && cur.uid === sel.uid;
      const by = GL.cgear.wornBy(profile, sel.uid), w = gearWearer(profile, by);
      const dp = cur && !mine ? GL.cgear.power(sel) - GL.cgear.power(cur) : null;
      const C = GL.data.crewGear, cost = C.rerollCost[sel.r] || 1, sh = profile.shards || 0;
      const canRe = Object.keys(sel.a || {}).filter(k => k !== sel.m).length > 0;
      const btns = mine
        ? `<button class="btn mini ghost" data-act="dr-off" data-id="${esc(id)}" data-slot="${sid}">Abnehmen</button>`
        : `<button class="btn mini" data-act="dr-on" data-id="${esc(id)}" data-uid="${sel.uid}">${by ? `Von ${esc(w.name)} nehmen` : `${pxIco('anchor')}Anlegen`}</button>`;
      const su = mine && UP[sid] ? UP[sid] : null;   // Platz angetippt, in der Truhe liegt etwas Besseres
      detail = `${su ? `<div class="dr-hintbar up"><span>${PX_UPG}<b>Besser in der Truhe:</b> ${esc(GL.cgear.name(su.it))} <em>+${su.delta} ⚔</em></span><button class="btn mini" data-act="dr-on" data-id="${esc(id)}" data-uid="${su.it.uid}">${pxIco('anchor')}Anlegen</button></div>` : ''}<div class="dr-detail">${cgCard(sel, `<div class="cg-optfoot">${wornTag(profile, by, mine)}</div>${mine ? '' : gearCompare(sel, cur, true)}
        ${!by && st.send === sel.uid ? bottlePick(profile, sel) : ''}
        <div class="dr-btns">${btns}${!by && st.send !== sel.uid ? `<button class="btn mini ghost" data-act="bottle" data-uid="${sel.uid}">🍾 Verschicken</button>` : ''}${canRe ? `<button class="btn mini ghost" data-act="cg-reroll" data-uid="${sel.uid}"${sh < cost ? ' disabled' : ''}>🔹 Neu würfeln (${cost})</button>` : ''}${by ? '' : `<button class="btn mini ghost danger-btn" data-act="cg-scrap" data-uid="${sel.uid}">Zerlegen (+${C.scrap[sel.r]} Berry${C.shardScrap[sel.r] ? `, +${C.shardScrap[sel.r]} 🔹` : ''}${(C.snackScrap || [])[sel.r] ? `, +${C.snackScrap[sel.r]} 🍙` : ''})</button>`}</div>`)}</div>`;
    } else if (slotSel) {
      const u = UP[slotSel];
      detail = u ? `<div class="dr-hintbar up"><span>${PX_UPG}<b>Besser in der Truhe:</b> ${esc(GL.cgear.name(u.it))} <em>+${u.delta} ⚔</em></span><button class="btn mini" data-act="dr-on" data-id="${esc(id)}" data-uid="${u.it.uid}">${pxIco('anchor')}Anlegen</button></div>`
        : `<p class="dr-empty">${curOf(slotSel) ? 'Hier trägt die Figur schon das Beste, was frei in der Truhe liegt.' : `Noch nichts auf „${esc((SL.find(x => x.id === slotSel) || {}).name || '')}“. Bosse und Raids lassen passende Teile fallen.`}</p>`;
    } else {
      detail = upN
        ? `<div class="dr-hintbar up"><span>${PX_UPG}<b>${upN} ${upN === 1 ? 'Platz' : 'Plätze'}</b> mit besserer Ausrüstung: ${SL.filter(s => UP[s.id]).map(s => esc(s.name)).join(', ')}</span><small class="dr-hint-tip">Tippe einen grünen Platz an</small></div>`
        : `<p class="dr-empty">Alles bestens: ${esc(d.name)} trägt das Stärkste aus der Truhe. Tipp einen Platz oder ein Teil an, um zu vergleichen.</p>`;
    }
    const bestUid = slotSel && UP[slotSel] ? UP[slotSel].it.uid : null;
    const list = bag.filter(x => !slotSel || GL.cgear.slotOf(x) === slotSel).sort((a, b) => slotSel ? (GL.cgear.power(b) - GL.cgear.power(a)) : (b.r - a.r || GL.cgear.power(b) - GL.cgear.power(a)));
    const better = it => { const c = curOf(GL.cgear.slotOf(it)); return !GL.cgear.wornBy(profile, it.uid) && (!c || GL.cgear.power(it) > GL.cgear.power(c)); };
    const chest = list.length ? list.map(it => { const by = GL.cgear.wornBy(profile, it.uid), w = gearWearer(profile, by);
      return `<span class="cg-bagit dr-it${fresh.includes(it.uid) ? ' new' : ''}${by ? ' worn' : ''}${sel && sel.uid === it.uid ? ' on' : ''}${bestUid === it.uid ? ' best' : ''}">${cgChip(it, 'dr-item', `data-uid="${it.uid}" data-id="${esc(id)}"`)}${w ? `<i class="cg-face" title="Angelegt bei ${esc(w.name)}">${w.spr}</i>` : better(it) ? '<i class="dr-up" title="Besser als das jetzige">▲</i>' : ''}</span>`; }).join('')
      : `<p class="hint">${slotSel ? 'Keine passenden Teile in der Truhe.' : 'Die Truhe ist leer. Bosse und Raids lassen Waffen, Kleidung und Schmuck fallen.'}</p>`;
    const fl = `<div class="dr-filter"><button class="sqc-f${!slotSel ? ' on' : ''}" data-act="dr-slot" data-slot="" data-id="${esc(id)}">Alle <em>${bag.length}</em></button>${SL.map(sl => { const n = bag.filter(x => GL.cgear.slotOf(x) === sl.id).length; return `<button class="sqc-f${slotSel === sl.id ? ' on' : ''}${UP[sl.id] ? ' can-up' : ''}" data-act="dr-slot" data-slot="${sl.id}" data-id="${esc(id)}">${CG_ICON[sl.id]} <em>${n}</em>${UP[sl.id] ? '<i class="f-up">▲</i>' : ''}</button>`; }).join('')}</div>`;
    return `<div class="fpop-card dress-pop" role="dialog" aria-labelledby="fpop-t">
      <button class="dr-x" data-act="pop-close" aria-label="Schließen">✕</button>
      <span class="fpop-kicker">Ankleiden</span>
      <div class="dr-tabs">${tabs}</div>
      <div class="dr-stage">
        <div class="dr-col">${SL.slice(0, 2).map(slotBtn).join('')}</div>
        <div class="dr-hero"><span class="dr-glow"></span><i class="dr-spr">${squadSprite(r)}</i><span class="dr-ped"></span>
          <b id="fpop-t">${esc(d.name)} <small class="dr-lv">Lv ${r.lvl}</small></b><span class="dr-stats"><em>♥ ${r.max}</em><em>⚔ ${r.atk}</em><em>➤ ${r.spd}</em></span>${extra.length ? `<small class="dr-extra">${extra.join(' · ')}</small>` : ''}</div>
        <div class="dr-col">${SL.slice(2).map(slotBtn).join('')}</div>
      </div>
      ${detail}
      <div class="dr-chest"><div class="dr-chest-h"><b>${pxIco('chest')}Truhe</b><small>${bag.length}/${GL.data.crewGear.bagMax} · 🔹 ${profile.shards || 0}</small></div>${fl}<div class="dr-grid">${chest}</div></div>
    </div>`;
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
  // Visitenkarte: Artefakte und Funde nur als Symbol-Kacheln, Details im Tooltip (PC: darüberfahren, Handy: antippen)
  function vaultTile(v) {
    const art = (GL.data.artifacts || []).find(a => a.id === v.id);
    if (!art) return '';
    const tip = `${art.name} · Stufe ${v.lvl}\n${fmtArt(art, GL.run.artValue(art, v.lvl || 1))}`;
    return `<span class="pc2-ic" data-tip="${esc(tip)}" tabindex="0">${artIcon(art)}<em class="pc2-lv">${v.lvl}</em></span>`;
  }
  function chestTile(it) {
    const d = (GL.data.items || []).find(x => x.id === it.id) || {};
    const R = GL.config.rarities[Math.max(0, it.r)] || {};
    const tip = `${d.name || it.id}${it.lvl ? ' +' + it.lvl : ''} · ${R.name || ''}${itemStatText(it) ? '\n' + itemStatText(it) : ''}`;
    return `<span class="pc2-ic ir-${R.id || ''}" data-tip="${esc(tip)}" tabindex="0">${itemIcon(it)}${it.lvl ? `<em class="pc2-lv">+${it.lvl}</em>` : ''}</span>`;
  }
  // Stammcrew eines anderen Spielers: Mini-Karten mit Ausrüstung (Seltenheitsfarbe, Tooltip beim Darüberfahren, Antippen öffnet die Karte)
  function squadMinis(x) {
    return `<div class="pc2-crew">${(x.squad || []).map((r, i) => `<div class="pc2-m">
      <span class="pc2-m-spr">${squadSprite(r)}</span><b>${esc(String(r.name || '').split(' ')[0])}</b><small>Lv ${r.lvl || 1}</small>
      <span class="pc2-m-st"><em>♥${r.max || 0}</em><em>⚔${r.atk || 0}</em></span>
      <span class="pc2-gear">${(r.gear || []).length ? r.gear.map((g, k) => cgChip(g, 'cg-peek', `data-row="${esc(x.id)}" data-i="${i}" data-k="${k}"`)).join('') : '<small class="pc2-nog">ohne Ausrüstung</small>'}</span>
    </div>`).join('')}</div>`;
  }
  // Tooltip für ein Ausrüstungsteil eines anderen Spielers (gleicher Stil wie der Vergleich in der eigenen Truhe)
  function gearTipItem(it) {
    if (!it || !GL.cgear) return '';
    let lines = []; try { lines = GL.cgear.lines(it); } catch (e) { lines = []; }
    return `<div class="gtip cr-${GL.cgear.RID[it.r] || ''}"><b>${esc(GL.cgear.name(it))}</b><small>${GL.cgear.RNAME[it.r] || ''} · ⚔ ${GL.cgear.power(it)}</small>
      <div class="gc">${lines.map(l => `<span class="gc-row${l.main ? ' up' : ''}"><span>${esc(l.text)}</span></span>`).join('')}</div></div>`;
  }
  function playerCard(x, isMe, ui) {
    const sf = ui && ui.squadFight && ui.squadFight.id === x.id ? ui.squadFight : null;
    const res = sf ? sf.res : null;
    // Während der Kampf läuft: Kampffeld (einmal erzeugt, damit die Animation nicht neu startet)
    if (sf && sf.playing) {
      if (!sf.html) sf.html = `<div class="pcard-bg duel-bg"><div class="pcard duel-play" data-act="noop">
          <div class="duel-vs"><b>Du</b><span>VS</span><b>${esc(x.name || 'Gegner')}</b></div>
          ${GL.arena.html(sf.dRun, { crewHp: sf.dRun.crew.map(u => u.max), enemyHp: sf.dRun.battle.enemies.map(u => u.max), done: false })}
          <div class="duel-bar"><span id="duel-log">Der Kampf beginnt!</span><button class="btn mini ghost" data-act="duel-skip">Schneller</button></div>
        </div></div>`;
      return sf.html;
    }
    const meOn = GL.meta.squadUnlocked(ui && ui.profile ? ui.profile : {});
    const sq = (x.squadOn || x.npc) && (x.squad || []).length
      ? `<div class="pcard-sec"><b>Stammcrew ${leagueChip(x.squadRating, true)} ${x.squadPower ? `<small>⚔ ${x.squadPower} Stärke</small>` : ''}</b>${squadMinis(x)}
          ${isMe ? '' : meOn ? `<button class="btn pcard-duel" data-act="squad-fight" data-id="${esc(x.id)}">⚔ ${res ? 'Nochmal herausfordern' : 'Herausfordern'}</button>` : '<small class="muted">Herausfordern geht nach deinem ersten gewonnenen Run oder ab Rang 5.</small>'}</div>`
      : '';
    if (res) return `<div class="pcard-bg" data-act="lb-view-close"><div class="pcard" data-act="noop">
        <button class="link pcard-close" data-act="lb-view-close">✕</button>
        ${duelReport(res, x.name || 'Gegner')}
        ${sf && sf.ratingDelta != null ? `<p class="duel-rating">Crew-Rating ${sf.ratingDelta >= 0 ? '+' : ''}${sf.ratingDelta} → ${leagueChip(ui.profile.squadRating, true)}</p>` : ''}
        ${sf && sf.xp ? `<p class="duel-xp">Stammcrew-EP: +${sf.xp.gain} für jede Figur${sf.xp.ups.length ? ` · <b>Level-up: ${sf.xp.ups.map(esc).join(', ')}</b>` : ''}</p>` : ''}
        <div class="duel-actions"><button class="btn" data-act="squad-match">⚔ Nächster Gegner</button><button class="btn ghost" data-act="squad-fight" data-id="${esc(x.id)}">Nochmal</button>
          <button class="btn ghost" data-act="squad-back">Zur Visitenkarte</button></div>
      </div></div>`;
    return playerCardBody(x, isMe, sq);
  }
  // Visitenkarte: großer Kopf mit Porträt, Segelkumpan-Knopf, Werte-Kacheln mit Symbolen, dann Sammlungen und Stammcrew
  function kumpanState(x, isMe) {
    if (isMe || !x || !x.id || x.npc || !GL.friends) return { show: false };
    const c = GL.friends.norm(GL.friends.code(x.id));
    const mine = (profRef && profRef.friends) || [];
    return { show: c.length === 6, code: c, friend: mine.includes(c) };
  }
  function playerCardBody(x, isMe, sq) {
    const fmt = n => Number(n || 0).toLocaleString('de-DE');
    const cap = crewData(x.captain || (x.best && x.best.captain));
    const k = kumpanState(x, isMe);
    const tile = (ico, v, lbl, cls, sub) => `<div class="pc2-t${cls ? ' ' + cls : ''}"><i class="pc2-i">${ico}</i><b>${v}</b><span>${lbl}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
    const lg = Number(x.landgang || 0), lo = Number(x.landOrte || 0);
    const kumpan = !k.show ? '' : k.friend
      ? `<div class="pc2-kumpan is"><span class="pc2-kb">♥ Segelkumpan</span><small>Ihr seid zusammen unterwegs. Entfernen geht in deiner Freundesliste.</small></div>`
      : `<button class="pc2-kumpan-btn" data-act="kumpan-add" data-id="${esc(x.id)}"><span class="pc2-kico">⚓</span><span><b>Als Segelkumpan anheuern</b><small>${esc(x.name || 'Pirat')} landet in deiner Freundesliste und bekommt Bescheid</small></span></button>`;
    return `<div class="pcard-bg" data-act="lb-view-close">
      <div class="pcard pc2" data-act="noop">
        <button class="pop-x pc2-x" data-act="lb-view-close" aria-label="Schließen"><span>✕</span></button>
        <div class="pc2-head">
          <span class="pc2-por">${x.look ? portrait(x.look, x.cos, 'lg') : cap ? GL.sprites.render(cap) : ''}</span>
          <div class="pc2-id">
            <b class="pc2-name">${medal(GL.meta.rankIndex({ rankXp: x.rankXp || 0 }), 'small')} ${esc(x.name || 'Unbekannter Pirat')}${onDot(x)} ${badgeIcon(x.cos, true)}${isMe ? ' <em class="pc2-you">du</em>' : ''}</b>
            <small class="pc2-sub">${x.cos && x.cos.title ? `<em class="pc2-title">${esc(titleName(x.cos.title))}</em>` : ''}${esc(x.rank || '')}</small>
            ${x.crewName ? `<span class="pc2-crew"><i class="c3-jolly" aria-hidden="true"></i>${esc(x.crewName)}</span>` : ''}
            <span class="pc2-chips">${x.squadOn || x.squadRating ? leagueChip(x.squadRating, true) : ''}${lg ? `<em class="pc2-chip land">🏝 ${fmt(lg)} Landgänge</em>` : ''}${x.pets ? `<em class="pc2-chip">🐾 ${fmt(x.pets)}</em>` : ''}</span>
            ${x.cos && x.cos.star ? '<span class="admin-tag big">★ Entwickler · hat dieses Spiel gebaut</span>' : ''}
          </div>
        </div>
        ${kumpan}
        <div class="pc2-grid">
          ${tile('🏆', fmt(x.score), 'Bestwert', 'gold')}
          ${tile('★', fmt(x.wins), 'Siege')}
          ${tile('⚓', fmt(x.runs), 'Runs')}
          ${tile('⚡', fmt(x.maxHit), 'Härtester Treffer')}
          ${tile('✊', fmt(x.kos), 'K.o.s')}
          ${tile('💰', fmt(x.topBounty), 'Mio. ฿ Kopfgeld')}
          ${tile('🏝', fmt(lg), 'Landgänge gemeistert', 'land', lo ? `${fmt(lo)} ${lo === 1 ? 'Ort' : 'Orte'}` : '')}
          ${tile('🗺', fmt(x.seasDone || 0), 'Meere geschafft')}
          ${tile('🧭', fmt(x.captains || 0), 'Kapitäne frei')}
        </div>
        ${(x.showcase || []).length ? `<div class="pcard-sec pc2-sec showcase"><b>✦ Vitrine</b><div class="vc-row">${x.showcase.map(id => { const l = lootDef(id); return l ? `<span class="sc-item lr-${l.r}">${lootArt(l)}<small>${esc(l.name)}</small></span>` : ''; }).join('')}</div></div>` : ''}
        ${(x.vaultTop || []).length || (x.chestTop || []).length ? `<div class="pc2-duo">
          ${(x.vaultTop || []).length ? `<div class="pcard-sec pc2-sec"><b>✦ Artefakte</b><div class="pc2-icons">${x.vaultTop.map(vaultTile).join('')}</div></div>` : ''}
          ${(x.chestTop || []).length ? `<div class="pcard-sec pc2-sec"><b>✦ Seltene Funde</b><div class="pc2-icons">${x.chestTop.map(chestTile).join('')}</div></div>` : ''}
        </div>` : ''}
        ${sq ? sq.replace('class="pcard-sec"', 'class="pcard-sec pc2-sec pc2-squad"') : ''}
      </div>
    </div>`;
  }
  // Bestätigung nach dem Anheuern: beide Porträts, ein Seil dazwischen
  function kumpanPop(profile, row) {
    const me = profile && profile.char ? portrait(profile.char.look, profile.cos, 'lg') : '';
    const them = row && row.look ? portrait(row.look, row.cos, 'lg') : '';
    return `<div class="fpop-card kumpan-pop" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">Neuer Segelkumpan</span>
      <div class="kp-duo"><span class="kp-p">${me}</span><span class="kp-rope"><i>⚓</i></span><span class="kp-p">${them}</span></div>
      <h3 id="fpop-t">Ahoi! ${esc((row && row.name) || 'Pirat')} ist jetzt dein Segelkumpan.</h3>
      <p>Ihr seht euch in der Freundesliste, wer gerade online ist, und könnt euch Flaschenpost schicken. ${esc((row && row.name) || 'Pirat')} bekommt Bescheid und kann dich zurück anheuern.</p>
      <div class="fpop-btns"><button class="btn" data-act="pop-close">Leinen los!</button><button class="btn ghost" data-act="friends-open">♥ Freundesliste</button></div>
    </div>`;
  }
  // Nachricht: jemand hat dich angeheuert, mit Knopf zum Zurück-Anheuern
  function kumpanInPop(profile, list) {
    const first = list[0];
    const known = c => ((profile && profile.friends) || []).includes(c);
    return `<div class="fpop-card kumpan-pop kp-in" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">Post vom Hafen</span>
      <div class="kp-bell">🔔</div>
      <h3 id="fpop-t">${list.length === 1 ? `${esc(first.name)} hat dich als Segelkumpan angeheuert!` : `${list.length} Piraten haben dich als Segelkumpan angeheuert!`}</h3>
      <p>Zurück anheuern? Dann seid ihr gegenseitig in der Freundesliste.</p>
      <div class="kp-list">${list.map(x => `<div class="kp-row"><b>${esc(x.name)}</b><small>${esc(GL.friends ? GL.friends.fmt(x.code) : x.code)}</small>${known(x.code) ? '<span class="pc2-kb">♥ Schon dabei</span>' : `<button class="btn mini" data-act="kumpan-back" data-code="${esc(x.code)}" data-name="${esc(x.name)}">⚓ Zurück anheuern</button>`}</div>`).join('')}</div>
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Später</button></div>
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
    // Rangliste ab dem Live-Start: wer seit dem Start noch nicht gesegelt ist, taucht bei Fahrt-Wertungen erst nach der ersten Fahrt auf
    rows = rows.filter(x => !x.preSeason || (Number(cat.get(x)) || 0) > 0);
    if (GL.season && GL.season.started()) info = '⛵ Seit dem Live-Start: Bestwerte und Zähler starten bei null, es zählen nur Fahrten ab dem 18.10., 18 Uhr. ' + info;
    const MAIN = ['score', 'daily', 'endless', 'squadRating', 'rankXp', 'topBounty'];
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
        <span class="lb-who"><b>${medal(GL.meta.rankIndex({ rankXp: x.rankXp || 0 }), 'tiny')} ${esc(x.name || 'Unbekannter Pirat')}${x.crewName ? `<small class="lb-crewname" title="Bande">${esc(x.crewName)}</small>` : ''}${onDot(x)} ${badgeIcon(x.cos)}${x.id === st.uid ? ' <em>du</em>' : ''}${x.cos && x.cos.star ? ' <em class="admin-tag" title="Der Entwickler dieses Spiels. Unbesiegbar (fast).">★ Entwickler</em>' : ''}${(x.showcase || []).length ? `<span class="lb-show">${x.showcase.map(lootChip).join('')}</span>` : ''}</b>
          ${isDaily ? dailyLine(x.duels[dailyCodeShown]) : isCrew && x.squadOn && (x.squad || []).length ? `<span class="lb-crew">${squadMini(x.squad)}${leagueChip(x.squadRating)}</span>` : journey(x)}</span>
        <span class="lb-score"><b>${fmt(value)}</b><small>${unit}</small></span>
      </li>`;
    };
    const dayTabs = isDaily ? `<div class="lb-cats day-tabs"><button class="lb-cat${ui.dailyDay !== 'y' ? ' on' : ''}" data-act="daily-day" data-id="t">Heute</button><button class="lb-cat${ui.dailyDay === 'y' ? ' on' : ''}" data-act="daily-day" data-id="y">Gestern</button>
      <small class="muted">Alle spielen dieselbe Route. Belohnung für die Plätze gibt es am nächsten Tag.</small></div>` : '';
    const table = isDaily && !rows.length ? `${dayTabs}<p class="muted">${ui.dailyDay === 'y' ? 'Gestern hat niemand die Tageskarte gespielt.' : 'Heute noch keine Ergebnisse. Sei der Erste!'}</p>` : rows.length
      ? `${dayTabs}<ol class="lb-list">${rows.map((x, k) => row(x, k, cat.show ? cat.show(x) : cat.get(x), cat.sub && cat.sub(x) ? cat.unit + " · " + cat.sub(x) : cat.unit,
          `${x.wins || 0} / ${x.runs || 0} Siege`)).join('')}</ol>`
      : (st.status === 'ready' ? emptyState(pxIco('swords'), 'Die Rangliste wartet auf dich', 'Noch keine Einträge. Beende einen Run und schreib deinen Namen als Erste:r ins Logbuch!') : '');

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
  function forgeSection(profile, uiRef) {
    // Schmiede kompakt wie eine App: Regal oben, Truhe als kleine Kacheln mit Filter, ein Detailfeld für das gewählte Teil, Amboss zum Aufklappen
    const chest = (profile.chest || []).slice().sort((a, b) => b.r - a.r || (b.lvl || 0) - (a.lvl || 0));
    const slots = GL.meta.itemSlots(profile);
    const load = profile.itemLoadout || [];
    const used = load.length;
    const fmt = n => n.toLocaleString('de-DE');
    const R = GL.config.rarities, MAXL = GL.config.items.maxLevel;
    const rid = it => R[Math.max(0, it.r)].id;
    const lvPips = it => `<span class="fg-pips" title="Stufe ${it.lvl || 0} von ${MAXL}">${Array.from({ length: MAXL }, (_, k) => `<i class="${k < (it.lvl || 0) ? 'on' : ''}"></i>`).join('')}</span>`;
    const nameOnly = it => esc(((GL.data.items.find(x => x.id === it.id) || {}).name) || it.id);
    // Regal: belegte Plätze groß, freie gestrichelt, nächster Platz als Schloss
    const nextRank = [5, 10, 15, 20].find(k => k > GL.meta.rankIndex(profile));
    const shelfItems = load.map(uid => chest.find(x => x.uid === uid)).filter(Boolean);
    const shelf = Array.from({ length: slots }, (_, k) => {
      const it = shelfItems[k];
      return it ? `<button class="fk-slot full ir-${rid(it)}" data-act="forge-sel" data-id="${it.uid}" title="${nameOnly(it)}">
          <span class="fk-ico">${itemIcon(it)}</span><b>${nameOnly(it)}${it.lvl ? ` <em>+${it.lvl}</em>` : ''}</b></button>`
        : `<span class="fk-slot empty"><span class="fk-ico">+</span><small>frei</small></span>`;
    }).join('') + (nextRank != null && slots < GL.config.items.takeBase + 4 ? `<span class="fk-slot locked"><span class="fk-ico">🔒</span><small>ab Rang ${nextRank + 1}</small></span>` : '');
    // Truhe: kleine Kacheln ohne Knöpfe, Filter nach Seltenheit, ein Detailfeld für das gewählte Teil
    const flt = uiRef && uiRef.forgeFlt != null && uiRef.forgeFlt !== '' ? Number(uiRef.forgeFlt) : null;
    const shown = flt == null ? chest : chest.filter(x => x.r === flt);
    const sel = uiRef && uiRef.forgeSel ? chest.find(x => x.uid === uiRef.forgeSel) : null;
    const tile = it => {
      const on = load.includes(it.uid);
      return `<button class="fk-tile ir-${rid(it)}${on ? ' on' : ''}${sel && sel.uid === it.uid ? ' sel' : ''}" data-act="forge-sel" data-id="${it.uid}">
        ${on ? '<span class="fk-on">Dabei</span>' : ''}
        <span class="fk-ico">${itemIcon(it)}</span>
        <b class="fk-name">${nameOnly(it)}${it.lvl ? ` <em>+${it.lvl}</em>` : ''}</b>
        <small class="fk-stat">${itemStatText(it)}</small>
      </button>`;
    };
    const chips = `<div class="fk-filter" role="tablist"><button class="fk-chip${flt == null ? ' on' : ''}" data-act="forge-flt" data-v="">Alle <em>${chest.length}</em></button>${R.map((rr, r) => ({ r, n: chest.filter(x => x.r === r).length })).reverse().filter(x => x.n).map(x => `<button class="fk-chip ir-${R[x.r].id}${flt === x.r ? ' on' : ''}" data-act="forge-flt" data-v="${x.r}"><i class="fk-dot"></i>${esc(R[x.r].name)} <em>${x.n}</em></button>`).join('')}</div>`;
    const bag = `<div class="fk-grid">${shown.map(tile).join('')}</div>`;
    let detail = '';
    if (sel) {
      const on = load.includes(sel.uid), cost = GL.meta.forgeCost(sel), melt = 8 * (sel.r + 1) + 10 * (sel.lvl || 0);
      const armed = uiRef && uiRef.scrapArmed === sel.uid;
      detail = `<div class="fk-sheet-bg" data-act="forge-sel" data-id=""></div><div class="fk-detail pxf ir-${rid(sel)}">
        <button class="fk-x" data-act="forge-sel" data-id="" aria-label="Schließen">✕</button>
        <span class="fk-big">${itemIcon(sel)}</span>
        <span class="fk-info"><b>${nameOnly(sel)}${sel.lvl ? ` <em>+${sel.lvl}</em>` : ''}</b>${rarityPill(sel.r)}${lvPips(sel)}<small>${itemStatText(sel)}</small></span>
        <span class="fk-acts">
          <button class="btn fk-take${on ? ' on' : ''}" data-act="toggle-item" data-id="${sel.uid}"${!on && used >= slots ? ' disabled' : ''}>${on ? '✓ Kommt mit' : used >= slots ? 'Regal voll' : 'Mitnehmen'}</button>
          ${cost != null ? `<button class="btn ghost fk-forge" data-act="forge" data-id="${sel.uid}"${profile.berry < cost ? ' disabled' : ''}>⚒ Schmieden <i>${GL.sprites.coin()}</i>${fmt(cost)}</button>` : '<span class="fk-max">Höchste Stufe</span>'}
          <button class="btn ghost fk-melt${armed ? ' armed' : ''}" data-act="scrap" data-id="${sel.uid}">${armed ? `Wirklich? +${melt}` : `🔥 Einschmelzen +${melt}`}</button>
        </span></div>`;
    }
    // Amboss: 3 gleiche → 1 bessere, kompakt zum Aufklappen (offen, sobald etwas bereit ist)
    let anyReady = false;
    const fuse = R.slice(0, -1).map((rr, r) => {
      const n = GL.meta.fusable(profile, r).length;
      const cost = GL.meta.fuseCost(r);
      const ok = n >= 3 && profile.berry >= cost;
      if (ok) anyReady = true;
      const pips = [0, 1, 2].map(k => `<i class="fu-pip${k < n ? ' have' : ''}" style="--c:${RAR_COL[r]}"></i>`).join('');
      return `<div class="fk-fu${ok ? ' ready' : ''}${n ? '' : ' none'}">
        <span class="fu-in">${pips}</span><span class="fu-arrow">➜</span><span class="fu-out" style="--c:${RAR_COL[r + 1]}">?</span>
        <span class="fk-fu-t">${rarityPill(r)}<small>${n >= 3 ? `${n} bereit` : `${n} von 3`}</small></span>
        <button class="btn mini fk-fu-go${ok ? ' hot' : ' ghost'}" data-act="fuse" data-r="${r}"${ok ? '' : ' disabled'}>⚒ <i>${GL.sprites.coin()}</i>${cost}</button>
      </div>`;
    }).join('');
    return `<section class="hq-sec forge3">
      <div class="fk-shelf">
        <div class="fk-head"><b>${pxIco('chest')}Fürs nächste Abenteuer</b><span class="fk-count">${used}/${slots}</span><small class="fk-note">Im Run im Steckbrief einer Figur anlegen</small></div>
        <div class="fk-shelf-row">${shelf}</div>
      </div>
      ${detail}
      ${chest.length ? `<div class="fk-bag"><div class="fk-head"><b>Truhe</b><span class="fk-count">${chest.length}</span><span class="fk-berry"><i>${GL.sprites.coin()}</i>${fmt(profile.berry || 0)}</span></div>${chips}${bag}${sel ? '' : '<small class="fk-hint">Teil antippen: mitnehmen, schmieden oder einschmelzen.</small>'}</div>`
        : '<p class="fk-empty pxf">Noch leer. Besiege Kopfgeld-Ziele und Bosse, dann füllt sich die Truhe.</p>'}
      <details class="fk-anvil"${anyReady ? ' open' : ''}>
        <summary><b>⚒ Amboss</b><small>3 gleiche Teile (nicht dabei) → 1 besseres</small>${anyReady ? '<em class="fk-ready">bereit!</em>' : ''}</summary>
        <div class="fk-fu-grid">${fuse}</div>
      </details>
    </section>`;
  }

  // ---------- Lager: Ausrüstung für den nächsten Run als Kacheln, darunter die Vitrine ----------
  function lagerSection(profile, slots) {
    const owned = GL.data.gear.filter(g => profile.gear[g.id] > 0);
    const used = profile.loadout.length;
    const pips = Array.from({ length: slots }, (_, k) => `<i class="lg-pip${k < used ? ' on' : ''}"></i>`).join('');
    const tiles = owned.map(g => {
      const on = profile.loadout.includes(g.id);
      const full = !on && used >= slots;
      return `<button class="lg-tile${on ? ' on' : ''}${full ? ' full' : ''}" data-act="toggle-gear" data-id="${g.id}"${full ? ' disabled' : ''}>
        ${on ? '<span class="fk-on">Dabei</span>' : ''}<em class="lg-n">×${profile.gear[g.id]}</em>
        <span class="lg-ico">${gearIco(g.id)}</span>
        <b>${esc(g.name)}</b><small>${esc(g.text)}</small>
        <span class="lg-btn">${on ? '✓ Kommt mit' : full ? 'Plätze voll' : 'Mitnehmen'}</span></button>`;
    }).join('');
    return `<section class="hq-sec lager2">
      <div class="lg-head pxf"><span class="lg-title"><b>${pxIco('chest')}Für den nächsten Run</b><small>wird im Run verbraucht</small></span><span class="lg-slots">${pips}<b>${used}/${slots}</b></span></div>
      ${owned.length ? `<div class="lg-grid">${tiles}</div>` : '<p class="fk-empty pxf">Das Lager ist leer. Beim Händler im Hafen bekommst du Ausrüstung für deine Runs.</p>'}
      ${vitrine(profile)}
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
    // Kompakt: oben die Plätze mit den aktiven Artefakten, darunter alle als Kacheln (antippen = ausrüsten)
    const used = profile.artLoadout.length;
    const active = Array.from({ length: slotsA }, (_, k) => {
      const a = A.find(x => x.id === profile.artLoadout[k]);
      if (!a) return `<span class="vk-slot empty"><span class="vk-ico">+</span><small>frei</small></span>`;
      const lv = GL.meta.artLevel(profile, a.id);
      return `<button class="vk-slot full" data-act="toggle-art" data-id="${a.id}" title="Antippen: ablegen"><span class="vk-ico">${artIcon(a)}</span><span class="vk-t"><b>${esc(a.name)}</b><small>${esc(fmtArt(a, GL.run.artValue(a, lv)))}</small></span><em class="vk-lv">${lv}</em></button>`;
    }).join('') + (nextSlotRank != null ? `<span class="vk-slot locked"><span class="vk-ico">🔒</span><small>ab Rang ${nextSlotRank + 1}</small></span>` : '');
    const tile = art => {
      const n = profile.vault[art.id] || 0;
      if (!n) return `<div class="vk-tile locked" data-tip="Fundort: ${esc(artSource(art))}"><span class="vk-ico vk-myst">${pxIco('chest')}<i class="vk-q">?</i></span><b>???</b><small>${esc(artSource(art).split(',')[0])}</small></div>`;
      const lvl = GL.meta.artLevelFor(n), on = profile.artLoadout.includes(art.id), full = !on && used >= slotsA;
      const pipsA = [1, 2, 3, 4, 5].map(k => `<i class="${k <= lvl ? 'on' : ''}"></i>`).join('');
      const nx = lvl < 5 ? `Stufe ${lvl + 1} bei ${GL.config.artLevels[lvl]} Funden (${n}): ${fmtArt(art, GL.run.artValue(art, lvl + 1))}` : 'Höchste Stufe erreicht';
      return `<button class="vk-tile lv${lvl}${on ? ' on' : ''}${full ? ' full' : ''}" data-act="toggle-art" data-id="${art.id}"${full ? ' disabled' : ''} data-tip="${esc(nx + ' · Fundort: ' + artSource(art))}">
        ${on ? '<span class="fk-on">Dabei</span>' : ''}<span class="vk-ico">${artIcon(art)}</span><span class="art-lv">${pipsA}</span>
        <b>${esc(art.name)}</b><small>${esc(fmtArt(art, GL.run.artValue(art, lvl)))}</small></button>`;
    };
    const fr = GL.data.fruits.filter(f => f.awakened).map(f => {
      const have = profile.epics.includes(f.id), raid = GL.data.raids.find(x => x.reward === f.id);
      return `<div class="vk-tile fruit${have ? ' have' : ' locked'}"><span class="vk-ico${have ? '' : ' vk-myst'}">${have ? GL.sprites.icon('fruit', f.id, true) : GL.sprites.icon('fruit', f.id, true) + '<i class="vk-q">?</i>'}</span><b>${have ? esc(f.name) : '???'}</b><small>${have ? esc(f.text) : `Raid: ${esc(raid ? raid.name : '?')}`}</small></div>`;
    }).join('');
    return `<section class="hq-sec vault2">
      <div class="vk-head pxf"><div class="lg-title"><b>✦ Aktiv im nächsten Run</b><small>${used}/${slotsA} Plätze · Artefakte bleiben für immer, jeder Fund hebt die Stufe</small></div><div class="vk-slots">${active}</div></div>
      <div class="vk-sub"><b>Artefakte</b><small>${found} von ${A.length} gefunden</small></div>
      <div class="vk-grid">${A.map(tile).join('')}</div>
      <div class="vk-sub"><b>Erwachte Teufelsfrüchte</b><small>tauchen danach in Frucht-Angeboten auf</small></div>
      <div class="vk-grid">${fr}</div>
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
      ${isGuest(profile) ? `<p class="guest-warn"><b>Du spielst als Gast.</b> Schreib dir diesen Code auf oder verknüpfe unten eine E-Mail, sonst ist dein Stand bei einem neuen Gerät weg. Gäste, die 60 Tage nicht spielen, werden aus der Rangliste gelöscht.</p>` : ''}
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
  // ---------- Begleiter ----------
  const petDef = id => (GL.data.pets || []).find(p => p.id === id);
  function petArt(id) { const p = petDef(id); return p ? GL.sprites.renderShaded({ id: 'pet-' + p.id, art: p.art }) : ''; }
  function islName(id) {
    for (const s of GL.data.islands) for (const S of [s, s.alt].filter(Boolean)) {
      const i = S.small.concat(S.big).find(x => x.id === id); if (i) return i.name;
    }
    return '';
  }
  // Fenster, wenn ein Begleiter an Bord springt
  function petPop(id, profile) {
    const p = petDef(id); if (!p) return '';
    const on = profile && profile.cos && profile.cos.pet === id;
    return `<div class="fpop-card pet-pop" role="dialog">
      <span class="fpop-kicker">Neuer Begleiter</span>
      <div class="pet-hop big">${petArt(id)}</div>
      <h3>${esc(p.name)}</h3>
      <p class="pet-say">„${esc(p.say)}“</p>
      <div class="fpop-btns">
        ${on ? '' : `<button class="btn" data-act="pet-set" data-v="${p.id}">Mitnehmen</button>`}
        <button class="btn ghost" data-act="pop-close">${on ? 'Schön' : 'Später'}</button>
      </div>
      <small class="pet-note">Begleiter sitzen auf deiner Schulter und tanzen im Hafen auf dem Schiff. Alle findest du im Album.</small>
    </div>`;
  }
  // Zwei schlanke Zeilen im Hafen: ein Gerücht (Begleiter) und die nächste Sammelbuch-Belohnung
  function hookLines(profile) {
    const r = petRumor(profile), st = GL.meta.albumStep(profile);
    const FEM = ['moewe', 'krabbe', 'kaluente', 'teleschnecke', 'taube', 'fledermaus', 'qualle', 'goldschnecke', 'schatzkrabbe'];
    const nm = r ? r.name.replace(/^(Kleine[rs]?) /, m => m.toLowerCase()) : '';
    const rumor = r ? `<button class="hook-row" data-act="album" data-tab="pets">
        <i class="hook-ico pet-sil">${petArt(r.id)}</i>
        <span><small>Hafengerücht</small><b>Auf ${esc(islName(r.isl))} soll ${FEM.includes(r.id) ? 'eine' : 'ein'} ${esc(nm)} leben</b></span></button>` : '';
    const nx = st.next;
    const rew = nx ? (nx.pet ? `${esc(petDef(nx.pet).name)}` : `${nx.berry} Berry`) : '';
    const book = nx ? `<button class="hook-row" data-act="album" data-tab="pets">
        <i class="hook-ico">${nx.pet ? `<span class="pet-sil">${petArt(nx.pet)}</span>` : GL.sprites.coin()}</i>
        <span><small>Sammelalbum · Stufe ${st.reached + 1}</small><b>Noch ${st.left} ${st.left === 1 ? 'Entdeckung' : 'Entdeckungen'} bis ${rew}</b>
        <i class="hook-bar"><i style="width:${Math.round(100 * st.ac.have / Math.max(1, st.need))}%"></i></i></span></button>` : '';
    return rumor || book ? `<div class="hook-box pxf">${rumor}${book}</div>` : '';
  }
  // Crew-Leben: ein Satz einer Figur (Hafen, Sieg, Niederlage). Wechselt alle 10 Minuten bzw. pro Run
  function lifeLine(profile, id, kind, vars) {
    const d = id === 'self' ? { role: profile.char && profile.char.role } : crewData(id) || {};
    const L = GL.data.lifeOf ? GL.data.lifeOf(id, d.role) : null;
    const list = (L && L[kind]) || [];
    if (!list.length) return '';
    const k = Math.floor(Date.now() / 600000) + id.length;
    let t = list[k % list.length];
    Object.keys(vars || {}).forEach(x => { t = t.replace('{' + x + '}', vars[x]); });
    return t.replace(/\{[a-z]+\}/g, 'ihn');
  }
  // Steckbrief einer Figur: Vertrautheit, Lieblingsessen, Spielweise, gemeinsame Erinnerungen, Ausrüstung
  function crewCard(profile, id) {
    const d = id === 'self' ? avatarOf(profile) : crewData(id);
    if (!d) return '';
    const role = id === 'self' ? profile.char && profile.char.role : d.role;
    const L = GL.data.lifeOf ? GL.data.lifeOf(id, role) : {};
    const xp = (profile.squadXp || {})[id] || 0, lv = GL.meta.squadBonus(xp), nx = GL.meta.squadNext(xp);
    const cs = (profile.charStats || {})[id] || {};
    const n = x => (x || 0).toLocaleString('de-DE');
    const mem = [
      cs.runs ? `<li><b>${n(cs.runs)}</b> ${cs.runs === 1 ? 'Fahrt' : 'Fahrten'} zusammen${cs.wins ? `, <b>${n(cs.wins)}</b> davon gewonnen` : ''}</li>` : '',
      cs.fights ? `<li><b>${n(cs.fights)}</b> Kämpfe Seite an Seite</li>` : '',
      cs.kos ? `<li><b>${n(cs.kos)}</b> Gegner umgehauen</li>` : '',
      cs.best ? `<li>Härtester Treffer: <b>${n(cs.best)}</b></li>` : ''
    ].filter(Boolean);
    const inSquad = GL.meta.squadIds(profile).includes(id);
    const gear = GL.cgear && GL.cgear.wornList ? GL.cgear.wornList(profile, id) : [];
    const style = GL.data.styles && GL.data.styles[id];
    const say = lifeLine(profile, id, 'hafen');
    return `<div class="fpop-card crew-card" role="dialog">
      <span class="fpop-kicker">Steckbrief</span>
      <div class="cc-top"><i class="cc-spr pet-hop">${GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d)}</i>
        <span><h3>${esc(d.name)}${(profile.crewNick || {})[id] ? ` <small class="cc-nickshow">„${esc(profile.crewNick[id])}“</small>` : ''}</h3>
          <span class="cc-bond">${'♥'.repeat(Math.min(5, Math.ceil(lv / 2)))}${'♡'.repeat(Math.max(0, 5 - Math.ceil(lv / 2)))} <small>Vertraut ${lv}${nx ? ` · noch ${nx.need - nx.have} bis ${lv + 1}` : ' · ganz eng'}</small></span>
          ${inSquad ? '<em class="cc-tag">In deiner Stammcrew</em>' : ''}</span></div>
      ${say ? `<p class="cc-say">„${esc(say)}“</p>` : ''}
      <dl class="cc-facts"><dt>Lieblingsessen</dt><dd>${esc(L.food || 'Alles, was es gibt')}</dd>${style ? `<dt>Spielweise</dt><dd>${esc(style)}</dd>` : ''}</dl>
      <div class="cc-mem"><span class="cc-k">Eure Erinnerungen</span>${mem.length ? `<ul>${mem.join('')}</ul>` : '<p class="cc-none">Noch keine gemeinsamen Fahrten. Nimm sie mal mit!</p>'}</div>
      ${(() => {
        const M = GL.data.momentsOf ? GL.data.momentsOf(id, role) : [];
        const seen = profile.momSeen || {};
        const care = `<div class="cc-care"><span class="cc-k">Kümmern</span>
          <div class="cc-row"><span class="cc-snack">🍙 <b>${profile.snacks || 0}</b> Proviant</span>
            <button class="btn mini" data-act="crew-gift" data-id="${id}"${profile.snacks > 0 ? '' : ' disabled'}>${esc(L.food ? 'Lieblingsessen schenken' : 'Essen schenken')}</button></div>
          <small class="cc-hint">Proviant gibt es nach jedem Run (Sieg doppelt) und jedem Landgang. Ein Geschenk bringt Vertrautheit.</small>
          <div class="cc-row cc-nickrow"><input class="cc-nick" id="cc-nick" maxlength="16" placeholder="Spitzname" value="${esc((profile.crewNick || {})[id] || '')}" aria-label="Spitzname"><button class="btn mini ghost" data-act="crew-nick" data-id="${id}">Speichern</button></div></div>`;
        const mom = M.length ? `<div class="cc-mom"><span class="cc-k">Gemeinsame Momente</span>${M.map((m, k) => lv >= m.lvl
            ? `<button class="cc-mbtn${seen[id + ':' + k] ? '' : ' fresh'}" data-act="moment" data-id="${id}" data-i="${k}">♥ ${esc(m.title)}</button>`
            : `<span class="cc-mbtn locked">🔒 ab Vertraut ${m.lvl}</span>`).join('')}</div>` : '';
        return care + mom;
      })()}
      ${(() => {
        const fr = GL.meta.friendsOf ? GL.meta.friendsOf(profile, id, 3) : [];
        const duo = o => (GL.data.duos || []).find(x => (x.a === id && x.b === o) || (x.b === id && x.a === o));
        const t = (GL.data.cosmetics.titles || []).find(x => x.req && x.req['bond_' + id]);
        const frH = fr.length ? `<div class="cc-friends"><span class="cc-k">Beste Freunde in der Crew</span>${fr.map(f => { const fd = f.id === 'self' ? avatarOf(profile) : crewData(f.id); const du = duo(f.id);
            return fd ? `<span class="cc-fr"><i>${GL.sprites.render(fd)}</i><b>${esc(fd.name)}</b><em>${'♥'.repeat(Math.min(5, Math.ceil(f.lvl / 2)))}</em>${du ? `<small>Duo: ${esc(du.name)}</small>` : ''}</span>` : ''; }).join('')}</div>` : '';
        const tH = t ? `<p class="cc-title">${lv >= 10 ? '🏅 Titel freigeschaltet' : '🏅 Bei Vertraut 10'}: <b>„${esc(t.name)}“</b></p>` : '';
        return frH + tH;
      })()}
      ${GL.cgear && GL.meta.squadIds(profile).includes(id) ? `<div class="cc-gear2"><span class="cc-k">Trägt</span><div class="ccg-row">${GL.data.crewGear.slots.map(sl => { const it = gear.find(g => GL.cgear.slotOf(g) === sl.id);
        return it ? `<button class="ccg cr-${GL.cgear.RID[it.r]}" data-act="dress" data-id="${esc(id)}" title="${esc(GL.cgear.name(it))}"><i>${cgArt(it)}</i><b>${esc(GL.cgear.name(it))}</b><small>${esc(GL.cgear.lines(it).slice(0, 1).map(l => l.text).join(''))}</small></button>`
          : `<button class="ccg empty" data-act="dress" data-id="${esc(id)}"><i>${CG_ICON[sl.id]}</i><b>${esc(sl.name)}</b><small>frei</small></button>`; }).join('')}</div>
        <button class="btn mini ghost ccg-go" data-act="dress" data-id="${esc(id)}">${pxIco('anchor')}Ankleiden</button></div>` : ''}
      <small class="cc-note">Vertrautheit wächst, wenn ${esc(d.name)} in Runs, Duellen oder beim Landgang dabei ist.</small>
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Schließen</button></div>
    </div>`;
  }
  // Vertrauter: ein Stammcrew-Mitglied, das im Run als Kapitän zur Wahl steht und in der ersten Taverne wartet
  function buddyOk(profile) { return GL.meta.squadUnlocked(profile); }
  function buddyChip(profile) {
    if (!buddyOk(profile)) return '';
    const id = profile.buddy && GL.meta.squadIds(profile).includes(profile.buddy) ? profile.buddy : null;
    const d = id ? crewData(id) : null;
    return `<button class="buddy-chip" data-act="buddy-open"><span class="sb-lbl">Vertrauter</span>${d ? `<i>${GL.sprites.render(d)}</i><b>${esc(d.name)}</b>` : '<b class="muted">keiner</b>'}<em>▾</em></button>`;
  }
  function buddyPop(profile) {
    const ids = GL.meta.squadIds(profile).filter(id => id !== 'self' && crewData(id));
    const cur = profile.buddy;
    return `<div class="fpop-card buddy-pop" role="dialog"><span class="fpop-kicker">Vertrauter</span><h3>Wer kommt mit?</h3>
      <p>Dein Vertrauter steht im Run extra als Kapitän zur Wahl und wartet in der ersten Taverne auf dich. Kämpfen tut er wie immer, aber er wird mit jeder Fahrt vertrauter.</p>
      <div class="buddy-list">${ids.map(id => { const d = crewData(id), lv = GL.meta.bond(profile, id);
        return `<button class="buddy-opt${cur === id ? ' on' : ''}" data-act="buddy-set" data-v="${id}"><i>${GL.sprites.render(d)}</i><b>${esc(d.name)}</b><small>♥ ${lv}</small></button>`; }).join('')}
        <button class="buddy-opt${!cur ? ' on' : ''}" data-act="buddy-set" data-v=""><i class="buddy-none">✕</i><b>Keiner</b><small>wie bisher</small></button></div>
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Fertig</button></div></div>`;
  }
  // Gemeinsamer Moment: kleine Szene mit Sprechblasen, nacheinander eingeblendet
  function momentPop(profile, id, k) {
    const d = id === 'self' ? avatarOf(profile) : crewData(id);
    const role = id === 'self' ? profile.char && profile.char.role : d && d.role;
    const m = (GL.data.momentsOf ? GL.data.momentsOf(id, role) : [])[k];
    if (!d || !m) return '';
    const me = avatarOf(profile);
    const nick = (profile.crewNick || {})[id];
    const lines = m.lines.map(([who, t], i) => {
      const it = who === 'it', sp = it ? d : me;
      return `<div class="mo-line ${it ? 'left' : 'right'}" style="animation-delay:${0.25 + i * 0.9}s"><i class="mo-spr">${GL.sprites.render(sp)}</i><span><b>${esc(it ? (nick || d.name) : (profile.nickname || 'Du'))}</b>${esc(t)}</span></div>`;
    }).join('');
    return `<div class="fpop-card moment-card" role="dialog"><span class="fpop-kicker">Gemeinsamer Moment</span><h3>${esc(m.title)}</h3>
      <div class="mo-lines">${lines}</div>
      <div class="fpop-btns"><button class="btn" data-act="crew-card" data-id="${id}">Zurück zum Steckbrief</button></div></div>`;
  }
  // Hafengerücht: zeigt auf einen Begleiter, der noch fehlt (wechselt jeden Tag)
  function petRumor(profile) {
    const miss = (GL.data.pets || []).filter(p => p.isl && !(profile.pets || []).includes(p.id));
    if (!miss.length) return null;
    const day = Math.floor(Date.now() / 864e5);
    return miss[day % miss.length];
  }
  // Kleines Porträt mit Hintergrund, Rahmen und Animation (Profil, Rangliste, Startbildschirm)
  function portrait(look, cos, size) {
    const c = Object.assign({ bg: 'meer', frame: 'holz', anim: 'ruhig', flag: 'keine' }, cos || {});
    // Flagge und besondere Hintergründe als Pixel-Bild (cosmetics.js), sonst wie bisher per CSS
    const fArt = c.flag && c.flag !== 'keine' && GL.data.flagSvg ? GL.data.flagSvg(c.flag) : '';
    const flag = c.flag && c.flag !== 'keine' ? `<i class="pflag fl-${c.flag}${fArt ? ' art' : ''}" aria-hidden="true">${fArt}</i>` : '';
    const bArt = GL.data.bgSvg ? GL.data.bgSvg(c.bg) : '';
    const star = c.star ? ' star-power' : '';
    return `<span class="portrait bg-${c.bg} fr-${c.frame} an-${c.anim}${star}${bArt ? ' has-art' : ''}${size ? ' ' + size : ''}"><i class="pbg" aria-hidden="true">${bArt}</i>${GL.sprites.render({ id: 'self', look: look || DEFAULT_LOOK })}${c.pet && petDef(c.pet) ? `<i class="ppet" aria-hidden="true">${petArt(c.pet)}</i>` : ''}${flag}${c.star ? '<i class="star-tag" aria-hidden="true">★</i>' : ''}</span>`;
  }
  // Easter Egg: nur der Entwickler (Account westerholt.felix…) darf den Regenbogen-Stern einschalten
  // Nächste Freischaltungen mit Fortschrittsbalken („Noch 1× … → Figur“)
  function goalList(profile, n) {
    const L = GL.meta.nextUnlocks(profile, n);
    if (!L.length) return '';
    return `<div class="goal-box pxf"><span class="event-kicker">Als Nächstes freischalten</span>${L.map(({ u, pr }) => {
      const d = crewData(u.unlock), left = pr.need - pr.have;
      const fac = d.faction ? GL.data.factions[d.faction] : null;
      return `<div class="goal-row" data-tip="${esc(d.name + (fac ? ' · ' + fac.name : '') + '\n' + u.text)}" tabindex="0">
        <i class="goal-spr">${GL.sprites.render(d)}</i>
        <span class="goal-b"><b>${esc(d.name)}${fac ? ` <small>${pxIcon(d.faction)}${esc(fac.name)}</small>` : ''}</b>
          <small>${esc(u.text)}</small>
          <span class="goal-bar"><i style="width:${Math.round(100 * pr.have / Math.max(1, pr.need))}%"></i></span></span>
        <em class="goal-left">${pr.need > 1 ? `${pr.have}/${pr.need}` : left > 0 ? 'offen' : '✓'}</em></div>`;
    }).join('')}</div>`;
  }

  // ---------- Wiki: einfach erklärt, mit kleinen Bildern. Plus Meta-Liste (was ist gerade stark) ----------
  const WIKI_TABS = [['basis', 'Grundlagen'], ['stile', '⚔ Kampf'], ['boni', 'Boni'], ['bosse', 'Bosse'], ['routen', 'Routen'], ['meta', 'Meta'], ['pinnwand', '📌 Pinnwand']];
  // Wer war schon auf dieser Route? Freunde zuerst (mit Bild), dazu die Zahl aller Piraten in der Rangliste
  function routeVisitors(profile, ids) {
    const st = GL.online ? GL.online.state() : { rows: [] };
    const rows = (st.rows || []).filter(r => r.id !== st.uid && (r.isles || []).some(x => ids.includes(x)));
    const fr = new Set((profile && profile.friends) || []);
    const friends = GL.friends ? rows.filter(r => fr.has(GL.friends.norm(GL.friends.code(r.id)))) : [];
    return { n: rows.length, friends: friends.slice(0, 4) };
  }
  // Pinnwand: Zettel mit Sternen, Namen und Datum, leicht schief angepinnt (Daten kommen per GL.ui.pinData)
  let pinData = null;
  function pinboardHtml() {
    const list = pinData;
    const head = `<section class="wk-sec pb-head"><h3>📌 Pinnwand der Crew</h3><p>Was andere Piraten über Grand Line sagen. Eigenen Zettel anpinnen: über „★ Feedback“ unten im Hafen, Häkchen bei „Pinnwand“ setzen.</p><button class="btn mini" data-act="fb-open">✍ Zettel schreiben</button></section>`;
    if (list == null) return head + '<p class="pb-wait">Zettel werden geholt …</p>';
    if (!list.length) return head + emptyPin();
    const cols = ['#fff6a8', '#ffd6e0', '#cdeffd', '#d8f5c8', '#ffe2b8'];
    const d = t => { const x = new Date(t); return isFinite(x) ? `${x.getDate()}.${x.getMonth() + 1}.` : ''; };
    return head + `<div class="pb-wall">${list.map((n, k) => `<div class="pb-note" style="--c:${cols[(n.id || k) % cols.length]};--r:${((n.id || k) * 37 % 7) - 3}deg"><i class="pb-pin"></i>
      <span class="pb-stars">${'★'.repeat(n.stars)}<i>${'★'.repeat(5 - n.stars)}</i></span><p>${esc(n.text)}</p><small>— ${esc(GL.safeName ? GL.safeName(n.name) : n.name)}${d(n.at) ? ' · ' + d(n.at) : ''}</small></div>`).join('')}</div>`;
  }
  const emptyPin = () => '<p class="pb-wait">Noch hängt hier kein Zettel. Sei der Erste!</p>';
  // Seekarte: alle Meere untereinander, zweite Routen zweigen zur Seite ab. Das Schiff zeigt, wie weit du kamst
  function seaMap(profile, compact) {
    const c = (profile && profile.counts) || {};
    const far = [0, 1, 2].filter(i => c['reached:' + i]).length - 1;
    const seen = (profile && profile.seen && profile.seen.islands) || [];
    const ord = ['Erstes', 'Zweites', 'Drittes'];
    const node = (S, i, alt) => {
      const isl = S.small.concat(S.big), been = isl.some(x => seen.includes(x.id));
      const feat = alt ? (GL.data.features || []).find(f => f.id === S.feature) : null;
      const open = !alt || (profile && feat && GL.meta.featureOpen(profile, feat.id));
      const bosses = (S.bosses || []).map(id => enemyData(id)).filter(Boolean);
      const how = alt ? (open ? `Im ${ord[i]} Meer beim Kurs setzen wählen` : `🔒 ab Rang ${feat ? feat.lvl : '?'}`) : `${ord[i]} Meer`;
      return `<div class="sm-node${alt ? ' alt' : ''}${been ? ' been' : ''}${open ? '' : ' locked'}">
        ${!alt && far === i ? '<i class="sm-ship" title="So weit bist du gekommen">⛵</i>' : ''}
        <b>${esc(S.name)}</b><small>${esc(how)}</small>
        ${compact ? '' : `<span class="sm-bosses">${bosses.map(bb => `<i>${GL.sprites.render(bb)}</i>`).join('')}</span>`}
        ${been ? '<em class="sm-been">✓</em>' : ''}</div>`;
    };
    return `<div class="sea-map${compact ? ' compact' : ''}"><span class="sm-compass" aria-hidden="true">✦</span>
      ${GL.data.islands.map((S, i) => `<div class="sm-row">${node(S, i, false)}${S.alt ? `<span class="sm-fork" aria-hidden="true"></span>${node(S.alt, i, true)}` : ''}</div>${i < GL.data.islands.length - 1 ? '<span class="sm-path" aria-hidden="true"></span>' : ''}`).join('')}
      <p class="sm-note">Jeder Run startet im East Blue. Zweite Routen erscheinen im jeweiligen Meer beim Kurs setzen: Dann steht eine Insel aus jeder Route zur Wahl.</p></div>`;
  }
  // Wiki: alle Meere und Routen mit Inseln, Bösewichten, Bossen, Begleitern und Landgängen
  function routesWiki(profile) {
    const seen = (profile && profile.seen && profile.seen.islands) || [];
    const pets = (profile && profile.pets) || [];
    const DG = GL.data.dungeons || [];
    const sec = (S, i, alt) => {
      const isl = S.small.concat(S.big), ids = isl.map(x => x.id);
      const been = ids.some(x => seen.includes(x));
      const feat = alt ? (GL.data.features || []).find(f => f.id === (S.feature || (i === 2 ? 'route' : 'route2'))) : null;
      const open = !alt || (profile && feat && GL.meta.featureOpen(profile, feat.id));
      const foes = isl.map(x => x.villain || x.boss).filter(Boolean).map(id => enemyData(id)).filter(Boolean);
      const pts = (GL.data.pets || []).filter(p => ids.includes(p.isl));
      const dgs = DG.filter(d => d.need && (d.need.isl || []).some(x => ids.includes(x)));
      const v = routeVisitors(profile, ids);
      return `<div class="wk-route${been ? ' been' : ''}${open ? '' : ' locked'}">
        <div class="wr-head"><b>${esc(S.name)}</b>${alt ? '<em class="wr-alt">Zweite Route</em>' : `<em class="wr-sea">${i + 1}. Meer</em>`}${been ? '<em class="wr-been">✓ befahren</em>' : ''}</div>
        <small class="wr-tag">${esc(S.tagline || '')}${alt && feat ? ` · ${open ? 'offen' : `ab Rang ${feat.lvl}`}` : ''}</small>
        <div class="wr-isl">${isl.map(x => `<span class="wr-chip${seen.includes(x.id) ? ' on' : ''}">${esc(x.name)}</span>`).join('')}</div>
        <div class="wr-foes">${foes.map(f => `<i class="wk-spr" data-tip="${esc(f.name)}">${GL.sprites.render(f)}</i>`).join('')}</div>
        ${pts.length ? `<div class="wr-line"><span class="wr-k">Begleiter</span>${pts.map(p => `<i class="wr-pet${pets.includes(p.id) ? '' : ' pet-sil'}" data-tip="${esc(pets.includes(p.id) ? p.name : '??? · ' + p.hint)}">${petArt(p.id)}</i>`).join('')}</div>` : ''}
        ${dgs.length ? `<div class="wr-line"><span class="wr-k">Landgang</span>${dgs.map(d => `<span class="wr-chip">${esc(d.name)}</span>`).join('')}</div>` : ''}
        ${v.n ? `<div class="wr-line wr-who"><span class="wr-k">Schon hier</span>${v.friends.map(r => `<span class="wr-fr"><i class="fr-av">${portrait(r.look || {}, r.cos || {}, 'xs')}</i>${esc(r.name)}</span>`).join('')}<small>${v.n} ${v.n === 1 ? 'Pirat' : 'Piraten'} aus der Rangliste</small></div>` : ''}
      </div>`;
    };
    return `<section class="wk-sec"><h3>Seekarte</h3>${seaMap(profile)}</section><section class="wk-sec"><h3>Routen der Grand Line</h3><p>Jedes Meer hat seine Inseln, Bösewichte und Bosse. Manche Meere haben eine zweite Route, die du mit dem Piratenrang freischaltest. Auf vielen Inseln wartet ein Begleiter und ein Landgang.</p>
      ${GL.data.islands.map((S, i) => sec(S, i, false) + (S.alt ? sec(S.alt, i, true) : '')).join('')}</section>
      <section class="wk-sec"><h3>Landgang</h3><p>Kurze Abenteuer auf Inseln, die du schon kennst (im Hafen unter „Landgang“). Erst ein paar schnelle Entscheidungen, deine Stammcrew redet mit. Passt eine Figur zur Aufgabe (★), klappt es öfter. Gute Entscheidungen schwächen den Boss, Pech macht es knapp. Am Ende kämpft deine Stammcrew gegen den Boss des Ortes.</p>
        <p>Jederzeit wiederholbar. Die erste Erkundung pro Ort und Tag bringt volle Beute: Berry, Meersplitter, Ausrüstung (mit Glück episch) und ein seltenes Fundstück.</p>
        <div class="wr-line">${DG.map(d => `<span class="wr-chip${profile && profile.dungeons && profile.dungeons[d.id] ? ' on' : ''}">${esc(d.name)}</span>`).join('')}</div></section>
      <section class="wk-sec"><h3>Tageskarte</h3><p>Einmal am Tag: Alle starten mit derselben Karte, egal welcher Rang. Dafür gibt es Berry, Rang-EP und eine Tagesbeute für deine Crew. Bei einem Sieg ist sie sicher episch, mit Glück legendär.</p></section>`;
  }
  const STRAT_NAME = { kraft: 'Kraft-Team', klinge: 'Klingen-Team', technik: 'Technik-Team', mix: 'Bunte Mischung', brecher: 'Viele Brecher', kaempfer: 'Viele Kämpfer', helfer: 'Viele Helfer', greedy: 'Boni sammeln', strohhut: 'Strohhutbande', marine: 'Marine', cp9: 'CP9', baroque: 'Baroque Works' };
  const stratName = id => id.startsWith('f_') ? (GL.data.factions[id.slice(2)] || {}).name || id : STRAT_NAME[id] || id;
  function wikiPop(tab, profile) {
    const t = tab || 'basis';
    const T = GL.data.types, Rl = GL.data.roles, F = GL.data.factions;
    const known = id => !GL.data.crew.find(c => c.id === id && c.locked) || (profile && profile.unlocked.includes(id)) || GL.devAll;
    const mini = (d, dim) => `<i class="wk-spr${dim ? ' dim' : ''}" data-tip="${esc(d.name)}">${GL.sprites.render(d)}</i>`;
    const tabs = `<div class="wk-tabs">${WIKI_TABS.map(([id, name]) => `<button class="wk-tab${t === id ? ' on' : ''}" data-act="wiki-tab" data-v="${id}">${name}${id === 'meta' ? ' <i class="wk-new">neu</i>' : ''}</button>`).join('')}</div>`;
    let body = '';
    if (t === 'basis') {
      const m = GL.battle && GL.battle.typeMult ? GL.battle.typeMult('kraft', 'technik') : 1.5;
      body = `<section class="wk-sec"><h3>Kampfstile</h3><p>Wie Schere, Stein, Papier: Wer im Vorteil ist, macht <b>×${String(m).replace('.', ',')}</b> Schaden.</p>
          <div class="wk-tri">${Object.keys(T).map(k => `<div class="wk-card">${pxIcon(k, 'lg')}<b>${T[k].name}</b><small>schlägt ${pxIcon(T[k].strong)} ${T[T[k].strong].name}</small></div>`).join('')}</div></section>
        <section class="wk-sec"><h3>Rollen</h3><div class="wk-tri">${Object.keys(Rl).map(k => `<div class="wk-card">${pxIcon(k, 'lg')}<b>${Rl[k].name}</b><small>${{ brecher: 'Steht vorne, steckt ein', kaempfer: 'Macht den Schaden', helfer: 'Heilt und stärkt' }[k] || ''}</small></div>`).join('')}</div>
          <p>Vor jedem Kampf stellt sich die Crew <b>automatisch</b> auf: Brecher vorne, Kämpfer in der Mitte, Helfer hinten.</p></section>
        <section class="wk-sec"><h3>So läuft ein Run</h3><ol class="wk-steps">
          <li><b>Kapitän wählen.</b> Er bleibt den ganzen Run.</li>
          <li><b>Route segeln.</b> Kämpfe, Taverne, Schätze, Früchte, Rast.</li>
          <li><b>Crew bauen.</b> Gleiche Banden, Stile und Rollen schalten Boni frei.</li>
          <li><b>Boss besiegen.</b> Pro Meer ein Bösewicht und ein Boss. Drei Meere bis zum Ziel.</li></ol></section>
        <section class="wk-sec"><h3>Zustände im Kampf</h3><div class="wk-list">${Object.keys(GL.data.statuses).map(k => { const x = GL.data.statuses[k]; return `<div class="wk-row"><i class="wk-st ${x.good ? 'good' : 'bad'}">${esc(x.icon)}</i><span><b>${esc(x.name)}</b><small>${esc(x.text)}</small></span></div>`; }).join('')}</div></section>
        <section class="wk-sec"><h3>Ultis</h3><p>Jede Figur lädt im Kampf ihre Ulti-Leiste. Ist sie voll, kommt die Spezialattacke. Kapitäne und Ausrüstung können mit Energie starten.</p></section>`;
    } else if (t === 'stile') {
      // Kampfstile, Kombos und der schwere Schlag der Bosse
      const B = Object.keys(T).map(k => ['type', k, T[k]]).concat(Object.keys(Rl).map(k => ['role', k, Rl[k]])).filter(x => x[2].build);
      const how = { kraft: 'Für alle, die Probleme gern direkt lösen.', klinge: 'Lebt vom Glück. Und davon hat sie erstaunlich viel.', technik: 'Wer nicht getroffen wird, muss auch nicht geheilt werden.',
        brecher: 'Eine Wand mit Gefühlen.', kaempfer: 'Plan: draufhauen. Plan B: fester draufhauen.', helfer: 'Langsam, aber die Crew steht am Ende noch.' };
      const EN = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
      body = `<section class="wk-sec"><h3>Finde deinen Stil</h3><p>${EN ? 'Collect at least <b>2 characters</b> with the same fighting style or role and your crew gets a <b>style</b>. The more, the stronger (★ › ★★ › ★★★). The top of your run shows which style you are playing.' : 'Sammle mindestens <b>2 Figuren</b> mit demselben Kampfstil oder derselben Rolle, und deine Crew bekommt einen <b>Stil</b>. Je mehr, desto stärker (★ › ★★ › ★★★). Oben im Run steht, welchen Stil du gerade spielst.'}</p>
        <div class="wk-styles">${B.map(([kind, k, x]) => `<div class="wk-style b-${k}"><div class="wk-style-h"><i>${x.icon}</i><span><b>${esc(x.build)}</b><small>${esc(x.name)} · ${esc(x.pitch)}</small></span></div>
          <p class="wk-style-q">${esc(how[k] || '')}</p><div class="wk-tiers">${x.tiers.map(tt => `<span><b>${tt.n}</b> ${esc(tt.text)}</span>`).join('')}</div></div>`).join('')}</div></section>
        <section class="wk-sec"><h3>Stil-Kombos</h3><p>${EN ? 'Run <b>two styles</b> at once and you get a small extra bonus on top.' : 'Laufen <b>zwei Stile</b> gleichzeitig, gibt es einen kleinen Extra-Bonus obendrauf.'}</p>
        <div class="wk-list">${(GL.data.combos || []).map(c => `<div class="wk-row"><span class="wk-combo-ico">${c.icon}</span><span><b>${esc(c.name)}</b><small>${esc(c.text)}</small><em class="wk-joke">„${esc(c.joke)}“</em></span></div>`).join('')}</div></section>
        <section class="wk-sec"><h3>Der schwere Schlag</h3><p>${EN ? 'Bosses <b>wind up</b> before they really hit. When you see “winds up …”, next round brings a blow with almost double force. What helps: <b>💨 dodge</b> counts double, <b>🛡 armor</b> counts double. Or just knock them over first.' : 'Bosse <b>holen aus</b>, bevor sie richtig zuschlagen. Siehst du „holt aus …“, kommt in der nächsten Runde ein Schlag mit fast doppelter Wucht. Dagegen hilft: <b>💨 Ausweichen</b> zählt doppelt, <b>🛡 Rüstung</b> zählt doppelt. Oder einfach vorher umfallen lassen.'}</p>
        <p>${EN ? 'Every boss shows <b>“How to crack him”</b> on the map: which style works especially well against him.' : 'Jeder Boss zeigt auf der Karte <b>„So knackst du ihn“</b>, also welcher Stil gegen ihn besonders gut ist.'}</p></section>`;
    } else if (t === 'boni') {
      const tiers = x => `<div class="wk-tiers">${x.tiers.map(tt => `<span><b>${tt.n}</b> ${esc(tt.text)}</span>`).join('')}</div>`;
      body = `<section class="wk-sec"><h3>Banden</h3><p>Mehrere Figuren derselben Bande geben einen <b>Set-Bonus</b>. Die Stufen stehen daneben.</p>
        ${Object.keys(F).map(k => { const mem = GL.data.crew.filter(c => c.faction === k); return `<div class="wk-fac">
          <div class="wk-fac-h">${pxIcon(k, 'lg')}<b>${esc(F[k].name)}</b><span class="wk-mem">${mem.map(d => mini(d, !known(d.id))).join('')}</span></div>${tiers(F[k])}${GL.data.teamMoves && GL.data.teamMoves[k] ? `<p class="wk-team">⚡ Volle Bande (${F[k].tiers[F[k].tiers.length - 1].n}): Team-Fähigkeit <b>${esc(GL.data.teamMoves[k].name)}</b>. ${esc(GL.data.teamMoves[k].text)}</p>` : ''}</div>`; }).join('')}</section>
        <section class="wk-sec"><h3>Team-Balken</h3><p>Ist eine Bande voll, erscheint im Kampf der <b>Team-Balken</b>. Jede Ulti deiner Crew füllt ein Stück (er bleibt über die Kämpfe eines Runs erhalten). Nach ${GL.data.teamNeed || 3} Ultis zündet die Team-Fähigkeit der Bande.</p></section>
        <section class="wk-sec"><h3>Bündnisse</h3><p>Sind die Set-Boni <b>zweier</b> Banden gleichzeitig aktiv, gibt es einen Extra-Bonus.</p>
        <div class="wk-list">${(GL.data.alliances || []).map(a => `<div class="wk-row"><span class="wk-pair">${pxIcon(a.a)}<em>+</em>${pxIcon(a.b)}</span><span><b>${esc(a.name)}</b><small>${esc(F[a.a].name)} + ${esc(F[a.b].name)}: ${esc(a.text)}</small></span></div>`).join('')}</div></section>
        <section class="wk-sec"><h3>Kampfstile & Rollen</h3>${Object.keys(T).concat(Object.keys(Rl)).map(k => { const x = T[k] || Rl[k]; return `<div class="wk-fac"><div class="wk-fac-h">${pxIcon(k, 'lg')}<b>${esc(x.name)}</b></div>${tiers(x)}</div>`; }).join('')}</section>
        <section class="wk-sec"><h3>Duos</h3><p>Zwei bestimmte Figuren zusammen stärken sich. ${GL.data.duos.length} Duos gibt es, zum Beispiel:</p>
        <div class="wk-list">${GL.data.duos.slice(-8).map(d => { const A = crewData(d.a), B = crewData(d.b); return `<div class="wk-row"><span class="wk-pair">${mini(A, !known(A.id))}${mini(B, !known(B.id))}</span><span><b>${esc(d.name)}</b><small>${esc(d.text)}</small></span></div>`; }).join('')}</div></section>`;
    } else if (t === 'bosse') {
      const list = GL.data.bosses.concat(GL.data.raids || []);
      body = `<section class="wk-sec"><h3>Bosse und wie man sie knackt</h3><p>Nimm Figuren mit dem Kampfstil, gegen den der Boss schwach ist.</p>
        <div class="wk-list">${list.map(b => { const info = bossInfo(b); const ab = ability(b.id); const beat = (profile && profile.counts && profile.counts['defeated:' + b.id]) || 0;
          return `<div class="wk-boss${b.raid ? ' raid' : ''}"><i class="wk-bspr">${GL.sprites.render(b)}</i>
            <span class="wk-bb"><b>${esc(b.name)}</b> ${badge(b.type)}${b.raid ? ' <em class="wk-raid">Raid</em>' : ''}
            <small>Schwach gegen ${pxIcon(info.counter)} <b>${esc(T[info.counter].name)}</b>${beat ? ` · ${beat}-mal besiegt` : ''}</small>
            ${ab ? `<small>${esc(ab.name)}: ${esc(ab.text)}</small>` : ''}</span></div>`; }).join('')}</div></section>`;
    } else if (t === 'routen') {
      body = routesWiki(profile);
    } else if (t === 'pinnwand') {
      body = pinboardHtml();
    } else {
      // Live: was nutzen die besten Spieler gerade?
      const st = GL.online ? GL.online.state() : { rows: [] };
      const teams = (st.rows || []).filter(r => r.best && Array.isArray(r.best.team) && r.best.team.length).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 40);
      const cnt = {}, fcnt = {}, caps = {};
      teams.forEach(r => {
        const ids = r.best.team.map(x => x.id).filter(id => id !== 'self');
        ids.forEach(id => { cnt[id] = (cnt[id] || 0) + 1; });
        const crew = ids.map(id => crewData(id)).filter(Boolean).map(d => ({ id: d.id, type: d.type, role: d.role, faction: d.faction }));
        GL.effects.status(crew).filter(s => s.kind === 'faction' && s.active).forEach(s => { fcnt[s.key] = (fcnt[s.key] || 0) + 1; });
        const c = r.best.captain; if (c) { caps[c] = caps[c] || { n: 0, sc: 0 }; caps[c].n++; caps[c].sc += r.score || 0; }
      });
      const topC = Object.keys(cnt).filter(id => crewData(id)).sort((a, b) => cnt[b] - cnt[a]).slice(0, 8);
      const topF = Object.keys(fcnt).sort((a, b) => fcnt[b] - fcnt[a]).slice(0, 4);
      const live = teams.length >= 3 ? `<section class="wk-sec"><h3>Bei den besten Spielern gerade beliebt</h3><p>Aus den Bestwert-Crews der Top ${teams.length} der Rangliste.</p>
          <div class="wk-meta-row">${topC.map(id => `<span class="wk-mc">${mini(crewData(id))}<b>${esc(crewData(id).name)}</b><small>${cnt[id]}× dabei</small></span>`).join('')}</div>
          ${topF.length ? `<div class="wk-list">${topF.map(f => `<div class="wk-row"><span class="wk-pair">${pxIcon(f)}</span><span><b>${esc(F[f].name)}</b><small>Set-Bonus aktiv in ${fcnt[f]} von ${teams.length} Top-Crews</small></span><span class="wk-bar"><i style="width:${Math.round(100 * fcnt[f] / teams.length)}%"></i></span></div>`).join('')}</div>` : ''}</section>`
        : `<section class="wk-sec"><h3>Bei den besten Spielern</h3><p class="muted">Sobald genug Spieler online sind, siehst du hier, welche Figuren die Top-Crews nutzen.</p></section>`;
      // Live aus echten Runs: jeder abgeschlossene Run aller Spieler (letzte 14 Tage)
      const cutD = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
      const runs = [].concat(...(st.rows || []).map(r => Array.isArray(r.runLog) ? r.runLog : [])).filter(x => x && Array.isArray(x.t) && (!x.d || x.d >= cutD));
      const total = GL.run.totalSteps ? GL.run.totalSteps() : 18;
      const agg = {};
      runs.forEach(x => x.t.filter(id => id !== 'self').forEach(id => { const a = agg[id] || (agg[id] = { n: 0, w: 0, s: 0 }); a.n++; a.w += x.w ? 1 : 0; a.s += Math.min(1, (x.s || 0) / total); }));
      const minN = runs.length >= 60 ? 6 : 3;
      const realTop = Object.keys(agg).filter(id => crewData(id) && agg[id].n >= minN).map(id => ({ id, n: agg[id].n, w: agg[id].w / agg[id].n, s: agg[id].s / agg[id].n }))
        .sort((a, b) => (b.w * 2 + b.s) - (a.w * 2 + a.s)).slice(0, 8);
      const realWin = runs.length ? runs.filter(x => x.w).length / runs.length : 0;
      const real = runs.length >= 10 ? `<section class="wk-sec"><h3>Aus echten Runs <i class="wk-new">live</i></h3><p>${runs.length} abgeschlossene Runs aller Spieler (14 Tage), ${Math.round(realWin * 100)} % davon gewonnen. Aktualisiert sich bei jedem Run.</p>
          <div class="wk-meta-row">${realTop.map(x => `<span class="wk-mc">${mini(crewData(x.id), !known(x.id))}<b>${esc(crewData(x.id).name)}</b><small>${Math.round(x.w * 100)} % Siege</small><small class="wk-sub">${x.n} Runs · Ø ${Math.round(x.s * 100)} % Strecke</small></span>`).join('')}</div></section>`
        : `<section class="wk-sec"><h3>Aus echten Runs <i class="wk-new">live</i></h3><p class="muted">Sammelt gerade: Jeder abgeschlossene Run fließt hier ein (bisher ${runs.length}). Ab 10 Runs gibt es die ersten Zahlen.</p></section>`;
      const M = GL.data.metaSim;
      const pct = v => Math.round(v * 100) + ' %';
      const sim = M ? `<section class="wk-sec"><h3>Aus der Simulation</h3><p>Bots haben ${M.runs.toLocaleString('de-DE')} Runs gespielt, alle Figuren frei (Stand ${esc(M.date.split('-').reverse().join('.'))}). Siegquote im Schnitt: ${pct(M.winAll)}.</p>
          <h4>Stärkste Strategien</h4><div class="wk-list">${M.strategies.filter((x, k, a) => a.findIndex(y => stratName(y.id) === stratName(x.id)) === k).slice(0, 6).map((x, k) => `<div class="wk-row"><span class="wk-rank">${k + 1}</span><span><b>${esc(stratName(x.id))}</b></span><span class="wk-bar"><i style="width:${Math.round(100 * x.win / M.strategies[0].win)}%"></i></span><em class="wk-pct">${pct(x.win)}</em></div>`).join('')}</div>
          <h4>Figuren, die oft gewinnen</h4><div class="wk-meta-row">${M.chars.slice(0, 8).map(x => crewData(x.id) ? `<span class="wk-mc">${mini(crewData(x.id), !known(x.id))}<b>${esc(crewData(x.id).name)}</b><small>${pct(x.win)} Siege</small></span>` : '').join('')}</div>
          ${M.alliances && M.alliances.length ? `<h4>Bündnisse</h4><div class="wk-list">${M.alliances.slice(0, 4).map(x => `<div class="wk-row"><span><b>${esc(x.name)}</b><small>${x.n} Runs, ${pct(x.win)} Siege</small></span></div>`).join('')}</div>` : ''}
          <p class="muted">Nur zum Nachschlagen: Jede Crew kann gewinnen. Die Liste wird mit Updates neu berechnet.</p></section>` : '';
      body = real + live + powerupMeta(runs, M) + sim;
    }
    return `<div class="fpop-card wiki-pop"><div class="wk-head"><span class="event-kicker">Wiki</span><b>Nachschlagen</b></div>${tabs}<div class="wk-body">${body}</div>
      <div class="fpop-btns"><button class="btn" data-act="pop-close">Schließen</button></div></div>`;
  }

  // Meta im Wiki: welche Power-ups (Schätze, Früchte, Artefakte) gerade stark sind.
  // Live aus echten Runs (runLog-Felder r/f/a), sobald genug da sind, sonst aus der Bot-Simulation.
  function powerupMeta(runs, M) {
    const KINDS = [
      { k: 'r', sim: 'relics', title: 'Schätze', data: GL.data.relics, ico: id => GL.sprites.icon('relic', id) },
      { k: 'f', sim: 'fruits', title: 'Teufelsfrüchte', data: GL.data.fruits, ico: id => GL.sprites.icon('fruit', id, (byId(GL.data.fruits, id) || {}).awakened) },
      { k: 'a', sim: 'arts', title: 'Artefakte', data: GL.data.artifacts, ico: id => { const a = byId(GL.data.artifacts, id); return a ? artIcon(a) : ''; } }
    ];
    const withPu = runs.filter(x => Array.isArray(x.r));
    const liveOn = withPu.length >= 40;
    const liveWin = liveOn ? withPu.filter(x => x.w).length / withPu.length : 0;
    const P = M && M.powerups;
    const lists = KINDS.map(K => {
      let rows = [];
      if (liveOn) {
        const agg = {};
        withPu.forEach(x => (x[K.k] || []).filter((id, i, a) => a.indexOf(id) === i).forEach(id => { const o = agg[id] || (agg[id] = { n: 0, w: 0 }); o.n++; o.w += x.w ? 1 : 0; }));
        rows = Object.keys(agg).filter(id => agg[id].n >= 5 && byId(K.data, id)).map(id => ({ id, lift: agg[id].w / agg[id].n - liveWin, n: agg[id].n }));
      } else if (P && P[K.sim]) rows = P[K.sim].filter(x => byId(K.data, x.id)).map(x => ({ id: x.id, lift: x.lift, n: x.n }));
      rows.sort((a, b) => b.lift - a.lift);
      if (!rows.length) return '';
      const top = rows.slice(0, 5), low = rows.length > 6 ? rows[rows.length - 1] : null;
      const chip = (x, weak) => {
        const d = byId(K.data, x.id); const v = Math.round(x.lift * 100);
        return `<span class="pu-chip${weak ? ' weak' : ''}" data-tip="${esc(d.name)}${d.text ? ': ' + esc(String(d.text).replace(/\{\w+\}/g, '…')) : ''}"><i class="pu-ico">${K.ico(x.id)}</i><b>${esc(d.name)}</b><em class="pu-lift ${v > 0 ? 'up' : v < 0 ? 'down' : ''}">${v > 0 ? '+' : ''}${v} %</em></span>`;
      };
      return `<h4>${K.title}</h4><div class="pu-row">${top.map(x => chip(x)).join('')}${low && low.lift < 0 ? chip(low, true) : ''}</div>`;
    }).join('');
    if (!lists) return '';
    const note = liveOn ? `Aus ${withPu.length} echten Runs (14 Tage): So viel öfter gewinnt man, wenn man es dabei hat.`
      : `Aus ${(P.runs || 0).toLocaleString('de-DE')} Bot-Runs, bei denen zufällig gewählt wurde: So viel öfter gewinnt man damit. Live-Zahlen kommen, sobald genug echte Runs da sind.`;
    return `<section class="wk-sec wk-pu"><h3>Starke Power-ups${liveOn ? ' <i class="wk-new">live</i>' : ''}</h3><p>${note}</p>${lists}<p class="muted">Grau = gerade am schwächsten. Jeder Schatz hat seine Crew, die ihn liebt.</p></section>`;
  }

  // ---------- Freunde: Code, QR, Einladen, Liste ----------
  // Leere Bereiche: kleines Bild, ein freundlicher Satz, was als Nächstes zu tun ist
  function emptyState(ico, title, text) {
    return `<div class="empty-st"><i class="es-ico">${ico}</i><b>${esc(title)}</b><small>${esc(text)}</small></div>`;
  }
  function friendsPop(profile) {
    const F = GL.friends, me = F ? F.mine() : '';
    const st = GL.online ? GL.online.state() : { rows: [] };
    const list = (profile.friends || []).map(c => ({ c, r: F.rowOf(c) }));
    const inv = (profile.invites || []).length;
    const goal = (n, txt, done) => `<span class="fr-goal${done ? ' done' : ''}"><b>${n}</b><small>${txt}</small></span>`;
    const row = x => x.r ? `<div class="fr-row">${onDot(x.r)}<button class="fr-who" data-act="friend-view" data-id="${esc(x.r.id)}"><i class="fr-av">${portrait(x.r.look || {}, x.r.cos || {}, 'xs')}</i><span><b>${esc(x.r.name)}</b><small>${esc(x.r.rank || '')} · ${(x.r.score || 0).toLocaleString('de-DE')} Punkte</small></span></button><button class="link fr-del" data-act="friend-del" data-id="${esc(x.c)}" aria-label="Entfernen">✕</button></div>`
      : `<div class="fr-row off"><span class="fr-who"><i class="fr-av">?</i><span><b>${esc(F.fmt(x.c))}</b><small>noch nicht in der Rangliste</small></span></span><button class="link fr-del" data-act="friend-del" data-id="${esc(x.c)}" aria-label="Entfernen">✕</button></div>`;
    return `<div class="fpop-card friends-pop">
      <div class="wk-head"><span class="event-kicker">Freunde</span><b>Deine Crew an Land</b></div>
      ${me ? `<div class="fr-me">
        <div class="fr-qr" id="fr-qr"><span class="fr-qr-wait">QR lädt …</span></div>
        <div class="fr-me-r"><small>Dein Freundescode</small><button class="fr-code" data-act="friend-copy" title="Kopieren">${esc(me)}</button>
          <span class="fr-btns"><button class="btn fr-share" data-act="friend-share">Link teilen</button><button class="btn ghost fr-stk" data-act="sticker">Sticker</button></span>
          <small class="muted">QR scannen oder Link öffnen.</small></div></div>
      <div class="fr-gift"><span class="event-kicker">Danke fürs Einladen</span>
        <div class="fr-goals">${goal(1, 'Legendäres Teil + Rahmen, Flagge, Titel', inv >= 1)}${goal(2, 'Hintergrund Freundesschiff', inv >= 2)}${goal(3, 'Freundes-Aura', inv >= 3)}${goal(5, 'Titel Herr der Flotte', inv >= 5)}</div>
        <small class="muted">Zählt nach dem ersten Run deines Freundes, jeder bringt ein legendäres Teil. Bisher: <b>${inv}</b>. Er bekommt 150 Berry.</small></div>`
        : `<p class="hint">Freunde gibt es, sobald du online bist (nach deinem ersten Run).</p>`}
      <div class="fr-add"><input id="fr-code" maxlength="8" placeholder="Code eines Freundes" autocomplete="off"><button class="btn" data-act="friend-add">Hinzufügen</button></div>
      <div class="post-box"><div class="post-head"><b>📬 Postfach</b><button class="btn mini" data-act="post-check">Post abholen</button></div>
        ${(profile.post || []).length ? `<div class="post-list">${(profile.post || []).slice(0, 6).map(p => `<span class="post-it ${p.d}"><i>${p.d === 'in' ? '🍾' : '⛵'}</i><span><b class="cr-${(GL.cgear.RID || [])[p.r] || ''}">${esc(p.name)}</b><small>${GL.i18n && GL.i18n.lang() === 'en' ? (p.d === 'in' ? 'from' : 'to') : (p.d === 'in' ? 'von' : 'an')} ${esc(p.who)}</small></span></span>`).join('')}</div>`
          : '<small class="muted">Noch keine Flaschenpost. Verschicken geht so: Stammcrew → Figur antippen → Teil aus der Truhe wählen → „🍾 Flaschenpost“. Beim Freund kommt sie an, sobald er das Spiel öffnet, und landet in seiner Truhe.</small>'}</div>
      <div class="fr-list">${list.length ? list.map(row).join('') : emptyState(GL.sprites.ship(), 'Noch allein auf See', 'Gib deinen Code weiter oder trag oben einen ein. Zusammen segelt es sich schöner, und ihr könnt euch Flaschenpost schicken.')}</div>
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Schließen</button></div></div>`;
  }
  function invitePop(got, profile) {
    return `<div class="fpop-card invite-pop"><span class="event-kicker">Danke fürs Teilen!</span>
      <h3>${got.map(g => esc(g.name)).join(', ')} ${got.length > 1 ? 'sind' : 'ist'} an Bord</h3>
      <p>Weil du ${got.length > 1 ? 'sie' : 'ihn'} eingeladen hast, bekommst du:</p>
      <div class="inv-items">${got.filter(g => g.item).map(g => `<span class="trophy-chip cr-legendary">${cgArt(g.item)} ${esc(GL.cgear.name(g.item))}</span>`).join('')}</div>
      <p class="hint">Dazu exklusive Profil-Teile, die man nur durchs Einladen bekommt. Schau im Kapitänsbuch.</p>
      <div class="fpop-btns"><button class="btn" data-act="pop-close">Super!</button></div></div>`;
  }
  const askDismiss = i => !!(GL.uiConfirm && GL.uiConfirm.i === i && Date.now() < GL.uiConfirm.until);
  // Tageszeit nach der Uhr des Spielers: Morgen, Tag, Abendrot, Nacht
  function timeOfDay() {
    const h = new Date().getHours();
    return h >= 5 && h < 10 ? { id: 'morning', hi: 'Guten Morgen' } : h < 17 ? { id: 'day', hi: 'Ahoi' } : h < 21 ? { id: 'dusk', hi: 'Guten Abend' } : { id: 'night', hi: 'Noch wach' };
  }
  // Persönliche Begrüßung im Hafen, wechselt je Besuch
  function greeting(profile, t) {
    const n = (profile.nickname || 'Kapitän').split(' ')[0];
    const lines = {
      morning: [`${t.hi}, ${n}! Die Crew hat Kaffee gekocht.`, `${t.hi}, ${n}! Frischer Wind in den Segeln.`, `${t.hi}, ${n}! Die Möwen sind schon wach.`],
      day: [`${t.hi}, ${n}! Die Grand Line ruft.`, `${t.hi}, ${n}! Perfektes Wetter zum Segeln.`, `${t.hi}, ${n}! Das Schiff ist startklar.`],
      dusk: [`${t.hi}, ${n}! Noch eine Fahrt vorm Essen?`, `${t.hi}, ${n}! Das Abendrot färbt das Meer.`, `${t.hi}, ${n}! Die Laternen sind an.`],
      night: [`${t.hi}, ${n}? Eine Nachtfahrt geht immer.`, `${t.hi}, ${n}? Die Crew schnarcht schon.`, `${t.hi}, ${n}? Die Sterne zeigen den Weg.`]
    }[t.id];
    const k = Math.floor(Date.now() / 36e5) % lines.length;
    return lines[k];
  }
  // Erste Runs: kleine Hinweis-Sprechblase pro neuem Bildschirm, einmal, ohne Fenster
  const COACH = {
    starter: 'Dein Kapitän bleibt den ganzen Run. Jeder hat eine eigene Fähigkeit, tippe die Karte an und schau sie dir an.',
    course: 'Wähle die nächste Insel. Am Ende jeder Insel wartet ein Bösewicht.',
    map: 'Deine Route: ⚔ Kampf bringt Gold, die Taverne neue Crew, die Truhe einen Schatz. Rast heilt.',
    recruit: 'Gleiche Banden, Kampfstile und Rollen geben Boni (Leiste oben). „+ Bonus“ zeigt, wer einen freischaltet.',
    prep: 'Die Aufstellung macht sich selbst: Brecher vorne, Helfer hinten. Achte auf den Kampfstil: Kraft schlägt Technik, Klinge schlägt Kraft, Technik schlägt Klinge.',
    battle: 'Kämpfe laufen von allein. Mit dem Tempo-Knopf unten spulst du vor.',
    treasure: 'Schätze wirken bis zum Ende des Runs. Tippe einen an, dann grün bestätigen.',
    fruit: 'Eine Teufelsfrucht stärkt deine Crew dauerhaft für diesen Run.',
    event: 'Ereignis auf See: Jede Wahl hat ihren Preis, der Hinweis sagt dir, was passiert.'
  };
  function coach(run, profile) {
    if (!profile || (profile.stats.runs || 0) >= 2 || !COACH[run.phase]) return '';
    const seen = profile.coachSeen || [];
    if (seen.includes(run.phase)) return '';
    return `<div class="coach"><i class="coach-ico">${PX_STAR}</i><span>${esc(COACH[run.phase])}</span><button class="coach-x" data-act="coach-ok" data-v="${run.phase}" aria-label="Verstanden">✓</button></div>`;
  }
  // Pixel-Notenschlüssel als Musik-Schalter (an/aus)
  function musicBtn(cls) {
    const on = GL.music && GL.music.isOn();
    const note = `<svg viewBox="0 0 8 9" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 0h5v2h-4v4h-1v1h-2v-1h-1v-1h1v-1h2zM7 2h1v4h-1v1h-2v-1h-1v-1h1v-1h2z"/></svg>`;
    return `<button class="mu-btn${on ? ' on' : ''}${cls ? ' ' + cls : ''}" data-act="music" aria-label="Musik ${on ? 'aus' : 'an'}schalten" title="Musik ${on ? 'aus' : 'an'}">${note}${on ? '' : '<i class="mu-off"></i>'}</button>`;
  }
  // Geräusche an/aus (Lautsprecher), neben der Musik
  function sfxBtn(cls) {
    const on = GL.sfx && GL.sfx.isOn();
    const spk = `<svg viewBox="0 0 9 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 2h2l2-2h1v8h-1l-2-2h-2z"/>${on ? '<path d="M6 2h1v1h-1zM7 3h1v2h-1zM6 5h1v1h-1z"/>' : ''}</svg>`;
    return `<button class="mu-btn sfx-btn${on ? ' on' : ''}${cls ? ' ' + cls : ''}" data-act="sfx" aria-label="Geräusche ${on ? 'aus' : 'an'}schalten" title="Geräusche ${on ? 'aus' : 'an'}">${spk}${on ? '' : '<i class="mu-off"></i>'}</button>`;
  }
  function isAdmin() {
    const st = GL.online ? GL.online.state() : {};
    return !!(st.email && /^westerhol[dt]\.felix@gmail\.com$/i.test(st.email));
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
  // Echtes Zweitkonto: wechseln oder ganz neu anlegen (nur Entwickler, im Zweitkonto immer sichtbar)
  function acctBox() {
    const A = GL.accounts; if (!A) return '';
    const inTest = A.cur() === 'test';
    if (!isAdmin() && !inTest) return '';
    const other = A.name(inTest ? 'main' : 'test');
    return `<div class="admin-box acct-box"><span class="admin-ico" aria-hidden="true">👥</span>
      <span><b>${inTest ? 'Du bist im Zweitkonto' : 'Echtes Zweitkonto'}</b><small>${inTest
        ? `Ein richtiger Online-Pirat mit eigener Anmeldung. Hier kannst du eine andere E-Mail verknüpfen. Zurück zum Hauptkonto${other ? ' (' + esc(other) + ')' : ''} geht jederzeit, nichts geht verloren.`
        : `Ein zweiter, richtiger Online-Pirat (Rangliste, Freunde, E-Mail) in diesem Browser. Dein Hauptkonto bleibt sicher weggelegt.${other ? ' Zweitkonto: ' + esc(other) + '.' : ''}`}</small></span>
      <span class="acct-btns">${inTest
        ? `<button class="btn mini" data-act="acct-switch" data-to="main">Zum Hauptkonto</button><button class="btn mini ghost" data-act="acct-fresh">Neu anlegen</button>`
        : `<button class="btn mini${A.hasTest() ? '' : ' ghost'}" data-act="${A.hasTest() ? 'acct-switch' : 'acct-fresh'}" data-to="test">${A.hasTest() ? 'Wechseln' : 'Anlegen'}</button>${A.hasTest() ? '<button class="btn mini ghost" data-act="acct-fresh">Neu anlegen</button>' : ''}`}</span></div>`;
  }
  function adminBox(profile) {
    if (!isAdmin()) return acctBox();
    const on = !!(profile.cos && profile.cos.star);
    return `<div class="admin-box"><span class="portrait sm star-power demo">${GL.sprites.render({ id: 'self', look: lookOf(profile) })}</span>
      <span><b>Entwickler-Modus</b><small>Regenbogen-Stern wie in Mario Kart. Alle sehen ihn in der Rangliste. Nur du kannst ihn einschalten.</small></span>
      <button class="btn mini${on ? '' : ' ghost'}" data-act="admin-star">${on ? '★ An' : 'Aus'}</button></div>
      ${acctBox()}
      <div class="admin-box"><span class="admin-ico" aria-hidden="true">🧪</span>
      <span><b>Als neuer Spieler testen</b><small>Startet einen frischen Piraten in einem freien Spielstand. Dein Hauptpirat bleibt unberührt. Zurück über „Spielstände“.</small></span>
      <button class="btn mini ghost" data-act="slot-fresh">Starten</button></div>
      <div class="admin-box"><span class="admin-ico" aria-hidden="true">💡</span>
      <span><b>Tester-Modus</b><small>Nach jedem Run kommt wieder ein Tipp-Fenster, jeder dritte Run fragt nach einer Bewertung. So siehst du alles wie ein neuer Spieler.</small></span>
      <button class="btn mini${profile.testerPops ? '' : ' ghost'}" data-act="admin-tester">${profile.testerPops ? 'An' : 'Aus'}</button></div>`;
  }
  // Gast: online, aber ohne verknüpfte E-Mail
  function isGuest(profile) { const st = GL.online ? GL.online.state() : {}; return !!(profile.nickname && st.uid && !st.email); }
  function profileChip(profile) {
    const rp = GL.meta.rankProgress(profile);
    const pct = rp.next ? Math.min(100, 100 * rp.have / rp.need) : 100;
    return `<button class="pf-chip" data-act="profile-edit" title="Profil bearbeiten">
      ${portrait(lookOf(profile), cosOf(profile), 'sm')}
      <span class="pf-txt"><b>${esc(profile.nickname || 'Neuer Pirat')}${isGuest(profile) ? ' <em class="guest-tag" data-tip="Du spielst als Gast. Merk dir deinen Spielercode (Kapitänsbuch) oder verknüpfe eine E-Mail. Gäste, die 60 Tage nicht spielen, fliegen aus der Rangliste.">Gast</em>' : ''}</b>
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
    const now = Date.now();
    const day = (st.rows || []).filter(x => x.updated && now - Date.parse(x.updated) < 864e5).length;
    const live = (st.rows || []).filter(x => isOnline(x)).length;
    const pulse = day ? `<div class="ts-pulse" title="Spieler, die gerade spielen und in den letzten 24 Stunden aktiv waren"><i class="tp-dot"></i><b>${live}</b> gerade auf See <span>·</span> <b>${day}</b> heute an Bord</div>`
      : st.status === 'connecting' ? `<div class="ts-pulse wait"><i class="tp-dot"></i>Funk zur Flotte <span class="tp-dots"><i></i><i></i><i></i></span></div>` : '';
    return `<div class="ts-inner">
      <div class="ts-top">${profile.nickname ? profileChip(profile) : '<span></span>'}<span class="ts-tbtn"><button class="mu-btn lang-btn" data-act="lang" aria-label="Sprache wechseln" title="Deutsch / English">${GL.i18n && GL.i18n.lang() === 'en' ? 'DE' : 'EN'}</button><button class="mu-btn wk-btn${profile.wikiSeen ? '' : ' fresh'}" data-act="wiki-open" aria-label="Wiki" title="Wiki: Nachschlagen und Meta">${GL.ui.wikiIcon}</button>${musicBtn()}${sfxBtn()}</span></div>
      <div class="ts-logo"><b>${esc(W)}</b><small>Ein Piraten-Roguelike</small></div>
      <div class="ts-scene" aria-hidden="true">
        <div class="ts-sun"></div>
        <div class="ts-ship">${GL.sprites.ship()}</div>
        <div class="ts-sea"></div>
        <div class="ts-crew">${crew}</div>
      </div>
      <div class="ts-menu">
        ${GL.season ? GL.season.banner(profile) : ''}${pulse}
        <button class="btn ts-play" data-act="title-play">${run ? 'Weiterspielen' : profile.nickname ? 'Spielen' : 'Neues Spiel'} ${keyHint('Leertaste')}</button>
        <div class="ts-row">
          ${GL.meta.featureOpen(profile, 'rangliste') ? `<button class="btn ghost" data-act="title-go" data-tab="rangliste">Rangliste</button>` : `<button class="btn ghost locked" data-act="title-go" data-tab="rangliste" title="Ab Rang 2">Rangliste <small>ab Rang 2</small></button>`}
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
  // Dein Schiff: Teile, die man im Laufe der Zeit freischaltet
  function shipBlock(profile, vals) {
    const P = GL.data.shipParts, cur = Object.assign({ sail: 'weiss', hull: 'eiche', flag: 'schwarz', deco: 'keine' }, profile.ship || {});
    const grp = (k, label) => `<div class="ship-grp"><span class="lbl">${label}</span><div class="cos-grid">${P[k].map(it => {
      const ok = GL.meta.cosmeticUnlocked(profile, it, vals);
      return `<button class="cos ship-opt${cur[k] === it.id ? ' on' : ''}${ok ? '' : ' locked'}" data-act="ship-pick" data-k="${k}" data-v="${it.id}"${ok ? '' : ' disabled'} title="${esc(it.name)}${ok ? '' : ': ' + GL.meta.reqText(it)}">
        <span class="ship-prev">${GL.sprites.ship(Object.assign({}, cur, { [k]: it.id }))}</span><small>${ok ? esc(it.name) : '🔒 ' + GL.meta.reqText(it)}</small></button>`;
    }).join('')}</div></div>`;
    return `<div class="cos-all ship-all"><span class="event-kicker">Dein Schiff</span>
      <div class="ship-big">${GL.sprites.ship(cur)}</div>
      <p class="hint">Dein Schiff segelt im Hauptquartier und auf der Seekarte. Neue Teile schaltest du mit Rängen, Siegen und Funden frei.</p>
      ${grp('sail', 'Segel')}${grp('hull', 'Rumpf')}${grp('flag', 'Flagge')}${grp('deco', 'Galionsfigur')}</div>`;
  }
  // Eigene Teufelsfrucht: Frucht auf den Piraten ziehen oder antippen
  function selfFruitBlock(profile) {
    const list = GL.meta.selfFruits(profile), cur = GL.meta.selfFruit(profile);
    const def = cur ? GL.loot.fruit(cur) : null;
    const look = profile.char ? profile.char.look : null;
    const slot = `<div class="sf-stage">
        <span class="sf-pirate">${look ? GL.sprites.render({ id: 'self', look }) : ''}<i class="sf-shadow"></i></span>
        <button class="sf-slot${cur ? ' full' : ''}" data-act="self-fruit" data-v="${cur ? cur.id : ''}" data-sfslot="1" aria-label="${cur ? 'Frucht ablegen' : 'Fruchtplatz'}">
          ${cur ? `<i class="sf-ico">${GL.sprites.icon('fruit', cur.id)}</i>` : '<i class="sf-q">?</i>'}
          ${cur ? '<em class="sf-x" aria-hidden="true">✕</em>' : ''}
        </button>
        <span class="sf-info">${def ? `<b>${esc(def.name)}</b><small>${esc(def.text)}</small><em class="sf-r r${def.rarity}">${esc(GL.loot.rarityName(def.rarity))}</em>` : `<b>Noch keine Frucht</b><small>Zieh eine Frucht auf den Platz oder tipp sie an.</small>`}</span>
      </div>`;
    const tiles = list.length ? `<div class="sf-list">${list.map(f => `<button class="sf-fruit${cur && cur.id === f.id ? ' on' : ''}" data-act="self-fruit" data-v="${f.id}" title="${esc(f.name)}">
        <i class="sf-ico">${GL.sprites.icon('fruit', f.id)}</i><small>${esc(f.name.replace(/-Frucht$/, ''))}</small></button>`).join('')}</div>`
      : `<p class="pe-note sf-empty">Iss im Run eine Teufelsfrucht. Danach kannst du sie hier deinem Piraten geben.</p>`;
    return `<div class="sf-wrap">${slot}${tiles}<p class="pe-note">Wirkt, wenn dein Pirat Kapitän ist: wie eine gegessene Frucht am Start. Stufe Gewöhnlich, ab Rang 8 Selten. Erwachte Früchte und die Heil-Frucht gehen nicht.</p></div>`;
  }
  // Eigener Bandenname: nur für dich und dein Team, kein Set-Bonus
  function flagArt(profile) {
    const f = profile.cos && profile.cos.flag;
    return GL.data.flagSvg ? GL.data.flagSvg(f && f !== 'keine' ? f : 'totenkopf') : '<i class="c3-jolly big" aria-hidden="true"></i>';
  }
  function crewNameBlock(profile, ui) {
    const n = GL.meta.crewName(profile);
    return `<div class="cn-wrap">
      <div class="cn-flag"><span class="cn-jolly">${flagArt(profile)}</span>
        <span class="cn-banner"><small>Deine Bande</small><b>${n ? esc(n) : 'Noch ohne Namen'}</b></span></div>
      <div class="cn-row"><input id="pf-crew" class="pe-name cn-inp" maxlength="20" autocomplete="off" placeholder="z. B. Mandarinen-Piraten" aria-label="Bandenname" value="${esc(n || '')}">
        <button class="btn cn-go" data-act="crew-name">Taufen</button></div>
      ${ui.crewError ? `<p class="login-err">${esc(ui.crewError)}</p>` : ''}
      <p class="pe-note">Der Name steht auf deiner Kapitänskarte, im Steckbrief und auf deiner Spielerkarte in der Rangliste. Er gilt nur für deine eigene Crew.</p>
    </div>`;
  }
  function profileScreen(profile, ui) {
    const d = ui.draft;
    const P = GL.data.charParts;
    const vals = GL.meta.progressValues(profile);
    const tab = ui.editTab || 'look';
    const L0 = d.char.look;
    // Gesperrte Teile zeigen ein Schloss und die Bedingung
    const lockOf = key => { const L = (GL.data.charLocks || {})[key]; return L && !GL.meta.cosmeticUnlocked(profile, L, vals) ? L : null; };
    const PART = { hair: 'Haare', skin: 'Haut', shirt: 'Oberteil', pants: 'Hose', hatColor: 'Hutfarbe', beard: 'Bart', nose: 'Nase' };
    // Farbfelder als runde 3D-Knöpfe
    const sw = (part, list, optional) => {
      const L = optional ? lockOf(part) : null;
      return `<div class="pe-row"><span class="pe-lbl">${PART[part]}</span>${L ? `<small class="pe-lock">🔒 ${esc(GL.meta.reqText(L))}</small>` : `<div class="pe-sw">${list.map(c => `<button class="pe-c${(L0[part] || '') === c ? ' on' : ''}${c ? '' : ' none'}" style="--c:${c || 'transparent'}" data-act="char-part" data-part="${part}" data-v="${c}" aria-label="${c || 'ohne'}">${c ? '' : '✕'}</button>`).join('')}</div>`}</div>`;
    };
    // Teile als kleine Kacheln mit Mini-Vorschau der Figur
    const HATS = { '': 'Ohne', straw: 'Strohhut', band: 'Kopftuch', cap: 'Mütze', hood: 'Kapuze', afro: 'Locken', tophat: 'Zylinder', tricorn: 'Dreispitz', ears: 'Tierohren' };
    const ACCS = { '': 'Ohne', augenklappe: 'Augenklappe', narbe: 'Narbe', brille: 'Brille', ohrring: 'Ohrring', pfeife: 'Pfeife', blume: 'Blume' };
    const tiles = (act, key, list, names) => `<div class="pe-tiles">${list.map(id => {
      const L = id ? lockOf(key + ':' + id) : null, on = (L0[key] || '') === id;
      const look = Object.assign({}, L0, { [key]: id || undefined });
      return `<button class="pe-tile${on ? ' on' : ''}${L ? ' locked' : ''}" data-act="${act}" data-v="${id}"${L ? ` disabled title="${esc(GL.meta.reqText(L))}"` : ''}>
        <i class="pe-mini">${GL.sprites.render({ id: 'self', look })}</i><small>${L ? '🔒 ' : ''}${esc(names[id] || id)}</small></button>`;
    }).join('')}</div>`;
    // Kosmetik als Kacheln
    const cosGrid = (kind, cls) => `<div class="pe-cos">${(kind === 'badges' ? GL.data.badges : GL.data.cosmetics[kind]).map(it => {
      const ok = GL.meta.cosmeticUnlocked(profile, it, vals);
      const on = d.cos[cls] === it.id;
      const prev = kind === 'titles' ? `<b class="cos-title">${esc(it.name)}</b>` : kind === 'badges' ? `<span class="badge-prev">${badgeSvg(it.id) || '–'}</span>`
        : portrait(L0, Object.assign({}, d.cos, { [cls]: it.id }), 'xs');
      return `<button class="pe-ct${on ? ' on' : ''}${ok ? '' : ' locked'}${it.rare ? ' rare-item' : ''}${kind === 'titles' ? ' ttl' : ''}" data-act="cos-pick" data-kind="${cls}" data-v="${it.id}"${ok ? '' : ' disabled'} title="${esc(it.name)}${ok ? '' : ': ' + GL.meta.reqText(it)}">
        ${prev}${kind === 'titles' ? '' : `<small>${esc(it.name)}</small>`}${ok ? '' : `<em class="pe-req">🔒 ${esc(GL.meta.reqText(it))}</em>`}</button>`;
    }).join('')}</div>`;
    const def = GL.meta.selfDef(Object.assign({}, profile, { nickname: d.name || 'Pirat', char: d.char }));
    const TABS = [['look', 'Aussehen', pxIco('anchor')], ['kampf', 'Kampf', pxIco('swords')], ['stil', 'Stil', pxIco('chest')], ['titel', 'Titel & Flagge', pxIco('coin')]]
      .concat(profile.nickname ? [['schiff', 'Schiff', pxIco('ship')], ['konto', 'Konto', pxIco('loop')]] : []);
    const subs = (k, list) => { const cur = ui.editSub && list.some(x => x[0] === ui.editSub) ? ui.editSub : list[0][0];
      return { cur, html: `<div class="pe-subs">${list.map(([id, n]) => `<button class="sqc-f${cur === id ? ' on' : ''}" data-act="pf-tab" data-v="${k}" data-s="${id}">${n}</button>`).join('')}</div>` }; };
    let body = '';
    if (tab === 'look') {
      const s = subs('look', [['farbe', 'Farben'], ['hut', 'Hut'], ['extra', 'Extras']]);
      body = s.html + (s.cur === 'farbe' ? `${sw('hair', P.hair)}${sw('skin', P.skin)}${sw('shirt', P.shirt)}${sw('pants', P.pants)}`
        : s.cur === 'hut' ? `${tiles('char-hat', 'hat', P.hat, HATS)}${L0.hat ? sw('hatColor', P.hatColor) : ''}`
        : `${P.acc ? tiles('char-acc', 'acc', P.acc, ACCS) : ''}${P.beard ? sw('beard', P.beard, true) : ''}${P.nose ? sw('nose', P.nose, true) : ''}`);
    } else if (tab === 'kampf') {
      const big = (act, cur, list, src) => `<div class="pe-big">${list.map(id => { const x = src[id] || {}; const t = (x.tiers || [])[0];
        return `<button class="pe-bt${cur === id ? ' on' : ''}" data-act="${act}" data-v="${id}"><i>${pxIcon(id, 'lg')}</i><b>${esc(x.name || id)}</b>${act === 'char-type' && x.strong ? `<small>stark gegen ${esc((src[x.strong] || {}).name || '')}</small>` : t ? `<small>${esc(t.text)}</small>` : ''}</button>`; }).join('')}</div>`;
      const s = subs('kampf', [['stil', 'Kampfstil'], ['frucht', 'Teufelsfrucht'], ['bande', 'Bande']]);
      const gw = GL.meta.selfGrowth ? GL.meta.selfGrowth(profile) : null;
      const growLine = gw ? `<div class="capv-growbox"><b>⚓ Dein Pirat ist immer Kapitän</b><small>Rang ${gw.rank}${gw.bond ? ` · Vertraut ${gw.bond}` : ''} → +${gw.hp} Leben, +${gw.atk} Angriff${gw.spd ? `, +${gw.spd} Tempo` : ''}. Wächst mit jedem Rang und mit der Vertrautheit deiner Crew.</small></div>` : '';
      body = s.html + (s.cur === 'frucht' ? selfFruitBlock(profile) : s.cur === 'bande' ? crewNameBlock(profile, ui) : growLine + `<span class="pe-h">Kampfstil</span>${big('char-type', d.char.type, ['kraft', 'klinge', 'technik'], GL.data.types)}
        <span class="pe-h">Rolle</span>${big('char-role', d.char.role, ['kaempfer', 'brecher', 'helfer'], GL.data.roles)}
        <p class="pe-note">Dein Pirat ist als Kapitän spielbar und wird mit jedem Piratenrang stärker.</p>`);
    } else if (tab === 'stil') {
      const s = subs('stil', [['bg', 'Hintergrund'], ['frame', 'Rahmen'], ['anim', 'Animation']]);
      body = s.html + cosGrid({ bg: 'backgrounds', frame: 'frames', anim: 'animations' }[s.cur], s.cur);
    } else if (tab === 'titel') {
      const s = subs('titel', [['title', 'Titel'], ['flag', 'Flagge'], ['badge', 'Abzeichen']]);
      body = s.html + cosGrid({ title: 'titles', flag: 'flags', badge: 'badges' }[s.cur], s.cur) + '<p class="pe-note">Alles hier sehen andere in der Rangliste. 🔒 zeigt, was dir noch fehlt.</p>';
    } else if (tab === 'schiff') {
      body = shipBlock(profile, vals);
    } else if (tab === 'konto') {
      body = accountLine() + dangerZone(ui);
    }
    return `<div class="ts-inner pf-screen pf2 wide">
      <div class="pf-card">
        <div class="pe-head">
          <div class="pe-port">${portrait(L0, d.cos, 'xl')}</div>
          <div class="pe-id">
            <span class="event-kicker">${profile.nickname ? 'Dein Pirat' : 'Erstelle deinen Piraten'}</span>
            <input id="pf-name" class="pe-name" maxlength="24" autocomplete="off" placeholder="Piratenname" aria-label="Piratenname" value="${esc(d.name || '')}">${ui.nameError ? `<p class="login-err">${esc(ui.nameError)}</p>` : ''}
            <small class="pe-ttl">${esc(titleName(d.cos.title))}</small>
            <div class="pe-stats"><span>❤ ${def.hp}</span><span>⚔ ${def.atk}</span><span>➤ ${def.spd}</span><span class="pe-ty">${pxIcon(d.char.type)}${pxIcon(d.char.role)}</span></div>
          </div>
        </div>
        <nav class="pe-tabs n${TABS.length}" role="tablist">${TABS.map(([id, n, ic]) => `<button class="pe-tab${tab === id ? ' on' : ''}" data-act="pf-tab" data-v="${id}" role="tab" aria-selected="${tab === id}">${ic}<span>${n}</span></button>`).join('')}</nav>
        <div class="pe-body">${body}</div>
        <div class="pf-actions pe-actions">
          ${profile.nickname ? '<button class="btn ghost" data-act="title-back">Zurück</button>' : ''}
          <button class="btn" data-act="profile-save">${profile.nickname ? 'Speichern' : 'Profil erstellen'} ${keyHint('Enter')}</button>
        </div>
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
      const rew = [r.reward.berry ? `${GL.sprites.coin()} ${r.reward.berry}` : '', r.reward.gear ? `${gearIco(r.reward.gear)} ${byId(GL.data.gear, r.reward.gear).name}` : '']
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
    GL.data.islands.forEach(isl => { if (isl.alt && GL.meta.featureOpen(profile, isl.alt.feature || 'route')) seas.push([isl.alt, isl.alt]); });
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
  // Endlos-Fahrt: eigener Modus, freigeschaltet mit dem ersten besiegten Meeres-Boss (und Rang 4)
  // Kleiner Punkt am Reiter, wenn dort etwas Sinnvolles wartet (leistbarer Ausbau, neue Ausrüstung …)
  // Alle Arten abzulegen auf einen Blick: Endlos-Fahrt, Tageskarte, Raid-Ziel (jeweils ein kleines Schild, Details im Fenster)
  function actionDock(profile) {
    const tiles = [];
    const seas = GL.meta.seasCleared(profile);
    if (GL.meta.featureOpen(profile, 'endlos')) {
      const rec = profile.endlessRec;
      tiles.push(`<button class="ad-tile" data-act="endless-open"><i class="ad-ico">∞</i><b>Endlos</b><small>${rec ? `${rec.loops} Runden` : 'Wie weit?'}</small></button>`);
    } else if (seas.length || GL.meta.level(profile) >= 3) {
      tiles.push(`<button class="ad-tile locked" data-act="endless-open"><i class="ad-ico">∞</i><b>Endlos</b><small>🔒 ${!seas.length ? 'Boss East Blue' : 'Rang 4'}</small></button>`);
    }
    if (GL.meta.featureOpen(profile, 'daily')) {
      const dd = GL.daily.done(profile);
      tiles.push(`<button class="ad-tile${dd ? ' done' : ' hot'}" data-act="${dd ? 'daily-info' : 'daily-start'}"><i class="ad-ico">${featureArt('scroll')}</i><b>Tageskarte</b><small>${dd ? '✓ gespielt' : 'Heute offen'}</small></button>`);
    }
    if (GL.meta.featureOpen(profile, 'landgang')) {
      const nOpen = GL.dungeonCount ? GL.dungeonCount(profile) : 0;
      tiles.push(`<button class="ad-tile" data-act="dg-open"><i class="ad-ico">${featureArt('compass')}</i><b>Landgang</b><small>${nOpen} ${nOpen === 1 ? 'Ort' : 'Orte'}</small></button>`);
    }
    if (GL.meta.featureOpen(profile, 'jagd')) {
      const t = profile.hunt && GL.data.raids.find(r => r.id === profile.hunt);
      tiles.push(`<button class="ad-tile" data-act="hunt-open"><i class="ad-ico">${t ? GL.sprites.render(t) : '🎯'}</i><b>Raid</b><small>${t ? esc(t.name.replace(/^Admiral |^Rothaar /, '')) : 'kein Ziel'}</small></button>`);
    }
    return tiles.length ? `<div class="action-dock">${tiles.join('')}</div>` : '';
  }
  function endlessPop(profile) {
    const open = GL.meta.featureOpen(profile, 'endlos'), seas = GL.meta.seasCleared(profile);
    return `<div class="fpop-card" role="dialog" aria-labelledby="fpop-t"><span class="fpop-kicker">Besondere Fahrt</span>
      <h3 id="fpop-t">∞ Endlos-Fahrt</h3>
      <p>Wähle ein Meer, das du geschafft hast, und segle es Runde um Runde. Jede Runde wird härter, tiefere Meere zählen mehr und bringen 🔹 Meersplitter.</p>
      ${open ? endlessSeas(profile, seas) : `<p class="wb-note">🔒 Noch gesperrt: ${!seas.length ? 'Besiege den Boss im East Blue' : ''}${!seas.length && GL.meta.level(profile) < 4 ? ' und erreiche ' : ''}${GL.meta.level(profile) < 4 ? 'Rang 4' : ''}.</p>`}
      <p class="wb-note">Neue Kapitäne gibt es nur auf den normalen Routen.</p>
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Schließen</button></div></div>`;
  }
  function huntPop(profile) {
    return `<div class="fpop-card" role="dialog" aria-labelledby="fpop-t"><span class="fpop-kicker">Raid-Jagd</span>
      <h3 id="fpop-t">Welchen Raid-Boss jagst du?</h3>${huntPicker(profile)}
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Fertig</button></div></div>`;
  }
  function dailyPop(profile) {
    return `<div class="fpop-card" role="dialog"><span class="fpop-kicker">Tageskarte</span>${dailyCard(profile)}
      <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Schließen</button></div></div>`;
  }
  function tabAlert(profile, id) {
    if (id === 'werft') return GL.data.upgrades.some(u => { const c = GL.meta.upgradeCost(profile, u.id); return c != null && profile.berry >= c; });
    if (id === 'stammcrew') return !!(GL.cgear && (profile.gearNew || []).length);
    if (id === 'gemuet') return !!(GL.skills && GL.skills.free(profile) > 0 && GL.skills.all().some(n => !GL.skills.blocker(profile, n.id)));
    if (id === 'schmiede') return GL.config.rarities.slice(0, -1).some((x, r) => GL.meta.fusable(profile, r).length >= 3 && profile.berry >= GL.meta.fuseCost(r));
    if (id === 'crew') return ROOM_GROUPS.crew.some(x => GL.meta.featureOpen(profile, x) && tabAlert(profile, x));
    if (id === 'auftraege') return GL.meta.featureOpen(profile, 'quests') && GL.meta.questsEnsure(profile).some(q => GL.meta.questProgress(profile, q).done);
    return false;
  }
  function endlessRow(profile) {
    const seas = GL.meta.seasCleared(profile);
    if (!GL.meta.featureOpen(profile, 'endlos')) {
      if (!seas.length && GL.meta.level(profile) < 3) return '';   // ganz am Anfang noch nicht zeigen
      const lvlOk = GL.meta.level(profile) >= 4;
      return `<div class="endless-row locked"><span class="er-ico" aria-hidden="true">∞</span><span><b>Endlos-Fahrt</b><small>${!seas.length ? 'Besiege den Boss im East Blue' : ''}${!seas.length && !lvlOk ? ' und erreiche ' : ''}${!lvlOk ? 'Rang 4' : ''}, dann geht es los.</small></span><em>🔒</em></div>`;
    }
    return `<div class="endless-row"><span class="er-ico" aria-hidden="true">∞</span><span><b>Endlos-Fahrt</b><small>Ein geschafftes Meer immer wieder, jede Runde härter. Neue Kapitäne gibt es nur auf den normalen Routen.</small></span></div>
      ${endlessSeas(profile, seas)}`;
  }
  function endlessSeas(profile, seas) {
    const rec = profile.endlessSeaBest || {};
    return `<div class="endless-seas">${GL.data.islands.map((isl, i) => seas.includes(i)
        ? `<button class="es-sea" data-act="endless-start" data-i="${i}"><b>${esc(isl.name)}</b><small>${rec[i] ? `Rekord: ${rec[i]} ${rec[i] === 1 ? 'Runde' : 'Runden'}` : 'Noch kein Rekord'}</small><em>${i === 0 ? 'Einstieg' : `Punkte ×${i + 1}`}</em></button>`
        : `<span class="es-sea off"><b>${esc(isl.name)}</b><small>Boss noch nicht besiegt</small></span>`).join('')}</div>`;
  }
  function dailyCard(profile) {
    if (!GL.meta.featureOpen(profile, 'daily')) return '';
    const day = GL.daily.today(), dd = GL.daily.done(profile), done = !!dd;
    const dScore = dd ? dd.score : null;
    return `<div class="daily-card${done ? ' done' : ''}">
      <span class="dc-ico" aria-hidden="true">${featureArt('scroll')}</span>
      <span class="dc-txt"><b>Tageskarte${(profile.dailyStreak || 0) > 1 && profile.daily && (profile.daily.d === day || profile.daily.d === yesterday()) ? ` <em class="dc-streak">${profile.dailyStreak} Tage in Folge</em>` : ''}</b><small>${done ? (dScore != null ? `Heute: ${Number(dScore).toLocaleString('de-DE')} Punkte. Morgen gibt es eine neue.` : 'Heute schon gestartet. Morgen gibt es eine neue.') : '<i class="dc-open">Heute noch offen</i> Alle starten gleich, egal welcher Rang. Ein Versuch. Tagesbeute: ein Ausrüstungsstück, bei einem Sieg sicher episch.'}</small></span>
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
      : `<div class="hunt-info muted">Raid-Boss antippen, um ihn im nächsten Run zu jagen.</div>`;
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
    compass: ['....kkkk....', '..kkWWWWkk..', '.kWWppppWWk.', '.kWpprrppWk.', 'kWppprrpppWk', 'kWpppkkpppWk', 'kWpppkkpppWk', 'kWpppbbpppWk', '.kWppbbppWk.', '.kWWppppWWk.', '..kkWWWWkk..', '....kkkk....'],
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
    // Neuigkeiten als Zeitleiste: jede Version eine Karte, neueste offen, Punkte mit kleinen Symbolen
    const ico = t => /story|szene|kapitel/i.test(t) ? '📖' : /kampf|boss|ulti|team-balken|überspring/i.test(t) ? '⚔' : /crew|stammcrew|figur|vertraut|steckbrief/i.test(t) ? '♥' : /englisch|english/i.test(t) ? '🌍' : /sicher/i.test(t) ? '🛡' : /schmiede|ausrüstung|truhe|zerleg|amboss/i.test(t) ? '⚒' : /karte|route|insel|reise|seekarte/i.test(t) ? '🗺' : /flaschenpost|freund/i.test(t) ? '🍾' : /profil|aussehen|titel|flagge/i.test(t) ? '🎨' : /fix|behoben|repariert|wieder richtig/i.test(t) ? '🔧' : '✦';
    const list = (GL.patchNotes || []).slice(0, 8);
    return `<div class="fpop-card notes-card nt2" role="dialog" aria-labelledby="nt-t">
      <span class="fpop-kicker">Logbuch der Entwicklung</span>
      <h3 id="nt-t">Was ist neu?</h3>
      ${GL.data.news ? '<button class="nt-replay" data-act="news-replay">✨ Die Neuigkeiten-Tour nochmal ansehen</button>' : ''}
      <div class="nt-time">${list.map((n, k) => `<details class="nt-up${k === 0 ? ' latest' : ''}"${k < 2 ? ' open' : ''}>
        <summary><i class="nt-pin"></i><span class="nt-h"><b>${esc(n.title)}</b><small>${esc(n.date)}${k === 0 ? ' · <em>Neueste</em>' : ''}</small></span><i class="nt-chev">▾</i></summary>
        <ul>${n.items.map(i => `<li><i class="nt-ico">${ico(i)}</i><span>${esc(i)}</span></li>`).join('')}</ul></details>`).join('')}</div>
      <div class="fpop-btns"><button class="btn" data-act="notes-close">Schön, danke!</button></div>
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
      <label class="fb-pin"><input type="checkbox" id="fb-pin"> <span>📌 Auf die Pinnwand im Wiki hängen (mit deinem Piratennamen)</span></label>
      <div class="fpop-btns"><button class="btn" data-act="fb-send"${s ? '' : ' disabled'}>Senden</button><button class="btn ghost" data-act="fb-later">Später</button></div>
      <small class="fb-note">Ohne Häkchen anonym. Hilft, das Spiel besser zu machen.</small>
    </div>`;
  }
  function updatePop(j, inRun) {
    return `<div class="fpop-card" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">Update verfügbar</span>
      <div class="fpop-art">${featureArt('flag')}</div>
      <h3 id="fpop-t">${esc(j.title || 'Neue Version')}</h3>
      ${(j.items || []).length ? `<ol class="fpop-steps">${j.items.slice(0, 3).map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
      <p class="wb-note">${inRun ? 'Dein laufender Run ist gespeichert und geht nach dem Neuladen genau hier weiter.' : 'Dein Spielstand bleibt erhalten.'}</p>
      <div class="fpop-btns"><button class="btn" data-act="reload">Neues Update testen</button><button class="btn ghost" data-act="pop-close">${inRun ? 'Run weiterspielen' : 'Später'}</button></div>
    </div>`;
  }
  // Neuigkeiten zum Durchwischen: ein Slide pro Neuerung, am Ende die Wahl Weiterspielen / Story nochmal / Neu anfangen
  function newsPop(profile, idx) {
    const N = GL.data.news; if (!N) return '';
    const en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
    const L = a => (Array.isArray(a) ? (en ? a[1] : a[0]) : a);
    const slides = N.slides.concat([{ choice: true }]);
    const i = Math.max(0, Math.min(slides.length - 1, idx || 0));
    // Kleine Bühne pro Karte: Schiff im Hintergrund, Figuren nebeneinander, Sterne oder Team-Balken als Deko
    const artOf = a => {
      const back = a.ship ? `<span class="nw-ship">${GL.sprites.ship()}</span>` : '';
      const crew = a.crew ? `<span class="nw-cast">${[].concat(a.crew).map((id, k) => `<i class="nw-c" style="--k:${k}">${GL.sprites.render(crewData(id) || byId(GL.data.hunted || [], id) || {})}${a.stars ? `<em class="nw-st">${'★'.repeat(k + 2)}</em>` : ''}</i>`).join('')}</span>` : '';
      const me = a.self ? `<span class="nw-cast"><i class="nw-c big">${GL.sprites.render(avatarOf(profile))}</i></span>` : '';
      const bar = a.bar ? '<span class="nw-bar"><i></i><i></i><i class="half"></i></span>' : '';
      const main = a.emoji ? `<span class="nw-emoji">${a.emoji}</span>` : a.fa ? featureArt(a.fa) : (!a.crew && !a.self && a.ship ? '' : '');
      return back + crew + me + main + bar;
    };
    const body = slides.map((sl, k) => sl.choice
      ? `<div class="nw-slide nw-choice${k === i ? ' on' : ''}" data-k="${k}"><div class="nw-art tone-gold"><span class="nw-emoji">🧭</span></div>
          <span class="nw-kick">${en ? 'Your choice' : 'Deine Wahl'}</span><h3>${en ? 'How do you want to continue?' : 'Wie willst du weiterspielen?'}</h3>
          <div class="nw-opts">
            <button class="nw-opt main" data-act="news-done"><b>⚓ ${en ? 'Keep playing' : 'Weiterspielen'}</b><small>${en ? 'Your progress stays. New things unlock step by step.' : 'Dein Fortschritt bleibt. Neues kommt nach und nach.'}</small></button>
            <button class="nw-opt" data-act="news-story"><b>📖 ${en ? 'Replay the story from chapter 1' : 'Story von Kapitel 1 erleben'}</b><small>${en ? 'Progress stays, the scenes start again from the beginning.' : 'Fortschritt bleibt, die Szenen starten nochmal von vorn.'}</small></button>
            <button class="nw-opt danger" data-act="acc-reset"><b>🌱 ${en ? 'Start completely fresh' : 'Ganz neu anfangen'}</b><small>${en ? 'Experience everything as a newcomer. Name and look stay, progress is reset. You will be asked again.' : 'Alles als Neuling erleben. Name und Aussehen bleiben, der Fortschritt startet bei null. Wir fragen nochmal nach.'}</small></button>
          </div></div>`
      : `<div class="nw-slide${k === i ? ' on' : ''}" data-k="${k}"><div class="nw-art tone-${sl.tone || 'sea'}"><span class="nw-sparkle a">✦</span><span class="nw-sparkle b">✦</span>${artOf(sl.art || {})}</div>
          <span class="nw-kick">${esc(L(sl.kicker))}</span><h3>${esc(L(sl.title))}</h3><p>${esc(L(sl.text))}</p></div>`).join('');
    const dots = slides.map((_, k) => `<button class="nw-dot${k === i ? ' on' : ''}" data-act="news-go" data-i="${k}" aria-label="${k + 1}"></button>`).join('');
    return `<div class="fpop-card news-pop" role="dialog" aria-labelledby="fpop-t" data-noclose="1">
      <div class="nw-top"><span class="fpop-kicker" id="fpop-t">${en ? 'What is new' : 'Neu in Grand Line'}</span><button class="nw-skip" data-act="news-go" data-i="${slides.length - 1}">${en ? 'Skip' : 'Überspringen'} ›</button></div>
      <div class="nw-track" style="--i:${i}">${body}</div>
      <div class="nw-nav"><button class="nw-arrow" data-act="news-go" data-i="${i - 1}"${i === 0 ? ' disabled' : ''} aria-label="Zurück">‹</button><span class="nw-dots">${dots}</span><button class="nw-arrow next" data-act="news-go" data-i="${i + 1}"${i === slides.length - 1 ? ' disabled' : ''} aria-label="Weiter">›</button></div>
    </div>`;
  }
  function welcomePop(profile, fromV) {
    const news = GL.patchNotes.filter(n => !fromV || n.v > fromV).slice(0, 3);
    return `<div class="fpop-card" role="dialog" aria-labelledby="fpop-t">
      <span class="fpop-kicker">Willkommen zurück</span>
      <div class="fpop-art">${featureArt('flag')}</div>
      <h3 id="fpop-t">Schön, dass du wieder da bist, ${esc(profile.nickname || 'Pirat')}!</h3>
      ${news.length ? `<p>Seit deinem letzten Besuch ist einiges neu:</p><ol class="fpop-steps">${news.map(n => `<li>${esc(n.title)}</li>`).join('')}</ol>` : ''}
      <p class="wb-note">Grand Line ist noch in Entwicklung, Spielstände können irgendwann zurückgesetzt werden. Lust, alles Neue von vorn zu erleben? Dann fang frisch an.</p>
      <div class="fpop-btns"><button class="btn" data-act="wb-close">Weiterspielen</button><button class="btn ghost" data-act="acc-reset">Neu anfangen</button></div>
      <p class="wb-links"><button class="link" data-act="notes-open">Alle Neuigkeiten</button> · <button class="link" data-act="fb-open">★ Spiel bewerten</button></p>
    </div>`;
  }
  function featurePop(f, more) {
    // Neue Route: großer Moment mit Bossen, Begleitern und wer schon dort war
    const R = GL.data.islands.map(x => x.alt).find(x => x && x.feature === f.id);
    const prof = profRef || {};
    const wow = R ? (() => {
      const isl = R.small.concat(R.big), ids = isl.map(x => x.id);
      const bosses = (R.bosses || []).map(id => enemyData(id)).filter(Boolean);
      const pts = (GL.data.pets || []).filter(p => ids.includes(p.isl));
      const v = routeVisitors(prof, ids);
      const seaIdx = GL.data.islands.findIndex(x => x.alt === R);
      return `<div class="wow-route"><p class="wow-how"><b>So kommst du hin:</b> Segle im Run bis ins ${['erste', 'zweite', 'dritte'][seaIdx] || ''} Meer (${esc(GL.data.islands[seaIdx].name)}). Beim Kurs setzen steht dann eine Insel von ${esc(R.name)} zur Wahl.</p>
        <div class="wow-bosses">${bosses.map(b => `<span><i>${GL.sprites.render(b)}</i><small>${esc(b.name)}</small></span>`).join('')}</div>
        <p class="wow-line">${isl.length} Inseln${pts.length ? ` · ${pts.length} Begleiter <span class="wow-pets">${pts.map(p => `<i class="pet-sil">${petArt(p.id)}</i>`).join('')}</span>` : ''}</p>
        ${v.friends.length ? `<p class="wow-line">Schon dort: ${v.friends.map(r => `<b>${esc(r.name)}</b>`).join(', ')}</p>` : v.n ? `<p class="wow-line">${v.n} ${v.n === 1 ? 'Pirat war' : 'Piraten waren'} schon dort. Jetzt du!</p>` : `<p class="wow-line">Noch kaum jemand war dort. Sei unter den Ersten!</p>`}
      </div>`;
    })() : '';
    return `<div class="fpop-card${R ? ' fpop-wow' : ''}" role="dialog" aria-labelledby="fpop-t">
      ${R ? '<i class="wow-burst" aria-hidden="true"></i>' : ''}
      <span class="fpop-kicker">${esc(R ? 'Neue Route entdeckt!' : (f.kicker || 'Neu freigeschaltet'))}</span>
      <div class="fpop-art">${featureArt(f.art)}</div>
      <h3 id="fpop-t">${esc(f.name)}</h3>
      <p>${esc(f.text)}</p>${wow}
      ${f.steps && f.steps.length ? `<ol class="fpop-steps">${f.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
      ${more && more.length ? `<p class="fpop-more">Auch neu: ${more.map(m => `<span>${featureArt(m.art)}${esc(m.name.replace(/^(Der|Die|Das|Deine) /, ''))}</span>`).join('')}</p>` : ''}
      <div class="fpop-btns">${R ? `<button class="btn" data-act="fpop-map" data-id="${f.id}">🗺 Seekarte</button>` : ''}${f.tab ? `<button class="btn" data-act="fpop-go" data-id="${f.id}">Ansehen</button>` : ''}<button class="btn ghost" data-act="fpop-close" data-id="${f.id}">${f.tab ? 'Später' : 'Alles klar'}</button></div>
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

  // Auftrags-Symbole als Pixel-Icons (statt Emoji)
  function questIco(d) {
    const k = d.kind;
    if (k === 'ko_kraft' || k === 'ko_klinge' || k === 'ko_technik') return pxIcon(k.slice(3), 'sm') || '';
    const M = { dmg: () => pxIco('fire'), maxHit: () => pxIco('fire'), kos: () => GL.sprites.icon('node', 'battle'), crits: () => pxIco('bolt'), ults: () => pxIco('bolt'),
      won: () => pxIco('swords'), hunted: () => GL.sprites.icon('node', 'elite'), bosses: () => GL.sprites.icon('node', 'elite'), steps: () => pxIco('ship'), duels: () => pxIco('swords') };
    return M[k] ? M[k]() : '';
  }
  function questBoard(profile) {
    if (!GL.meta.featureOpen(profile, 'quests')) return '';
    const qs = GL.meta.questsEnsure(profile);
    const cards = qs.map(q => {
      const d = GL.meta.questDef(q);
      const p = GL.meta.questProgress(profile, q);
      return `<div class="quest${p.done ? ' done' : ''}">
        <span class="q-ico">${questIco(d) || d.icon}</span>
        <span class="q-body"><b>${esc(d.text.replace('{n}', q.n.toLocaleString('de-DE')))}</b>
          <span class="q-bar"><i style="width:${Math.round(100 * p.have / p.need)}%"></i><em>${p.have.toLocaleString('de-DE')} / ${p.need.toLocaleString('de-DE')}</em></span>
          <small class="q-rew">${GL.sprites.coin()} ${q.berry} · ✦ ${q.xp} EP</small></span>
        ${p.done ? `<button class="btn mini q-claim" data-act="quest-claim" data-id="${q.id}">Abholen</button>`
          : profile.questReroll > 0 ? `<button class="link q-re" data-act="quest-reroll" data-id="${q.id}" title="Einmal am Tag gratis neu würfeln">↻</button>` : ''}
      </div>`;
    }).join('');
    return `<section class="quests"><div class="q-head"><b>Aufträge</b><small>Abgeholt? Sofort kommt ein neuer. Jeden Tag frische.</small></div>${cards}</section>`;
  }

  // Hauptquartier als Hafen: oben Ablegen, darunter Holzschilder zu den Räumen. Ein Raum füllt die Seite, mit „Zurück zum Hafen“.
  const ROOMS = [
    { id: 'auftraege', name: 'Aufträge', art: 'scroll', sub: p => { const qs = GL.meta.questsEnsure(p); const done = qs.filter(q => GL.meta.questProgress(p, q).done).length; return done ? `${done} abholen!` : `${qs.length} offen`; } },
    { id: 'stammcrew', name: 'Stammcrew', art: 'flag', sub: p => GL.meta.squadUnlocked(p) ? `⚔ ${GL.meta.squadPower(GL.meta.squadRefs(p))}` : '' },
    { id: 'rangliste', name: 'Rangliste', art: 'podium', sub: () => '' },
    { id: 'gemeinschaft', name: 'Gemeinschaft', art: 'trident', sub: p => GL.coop ? `${GL.coop.boss().short} · ${GL.coop.triesLeft(p)}/3` : '' },
    { id: 'werft', name: 'Werft', art: 'ship', sub: () => 'Ausbauten' },
    { id: 'gemuet', name: 'Gemütlichkeit', art: 'flag', sub: p => GL.skills ? (GL.skills.free(p) ? `✦ ${GL.skills.free(p)} frei` : 'Skilltree') : '' },
    { id: 'schmiede', name: 'Schmiede', art: 'anvil', sub: p => `${(p.itemLoadout || []).length}/${GL.meta.itemSlots(p)} dabei` },
    { id: 'kammer', name: 'Schatzkammer', art: 'chest', sub: p => `${p.artLoadout.length}/${GL.meta.artSlots(p)} dabei` },
    { id: 'lager', name: 'Lager', art: 'crate', sub: p => `${p.loadout.length}/${GL.meta.slots(p)} dabei` },
    { id: 'haendler', name: 'Händler', art: 'stall', sub: () => 'Proviant' },
    { id: 'profil', name: 'Kapitänsbuch', art: 'scroll', sub: () => 'Rang, Code, Konto' }
  ];
  const roomArt = a => a === 'ship' ? GL.sprites.ship() : featureArt(a);
  function hubTiles(profile, tab) {
    const open = ROOMS.filter(r => GL.meta.featureOpen(profile, r.id));
    return `<nav class="hub" aria-label="Räume im Hauptquartier"><span class="hub-lbl">Im Hafen</span><div class="hub-grid">${open.map(r =>
      `<button class="hub-tile" data-act="hq-tab" data-tab="${r.id}"><i class="hub-art">${roomArt(r.art)}</i><b>${r.name}</b>${r.sub(profile) ? `<small>${r.sub(profile)}</small>` : ''}${tabAlert(profile, r.id) ? '<i class="tab-dot" title="Hier gibt es etwas zu tun"></i>' : ''}</button>`).join('')}</div></nav>`;
  }
  // Räume, die zusammengehören: oben als Umschalter (wie Tabs in einer App)
  const ROOM_GROUPS = { crew: ['stammcrew', 'schmiede', 'lager', 'kammer'], hafen: ['werft', 'gemuet', 'haendler'] };
  const SEG_NAME = { stammcrew: 'Crew', schmiede: 'Schmiede', lager: 'Lager', kammer: 'Kammer', werft: 'Werft', gemuet: 'Skills', haendler: 'Händler' };
  const groupOf = id => Object.keys(ROOM_GROUPS).find(g => ROOM_GROUPS[g].includes(id)) || null;
  // Erster offener Raum der Crew-Gruppe (für den Crew-Knopf unten)
  function crewRoom(profile, last) {
    const open = ROOM_GROUPS.crew.filter(x => GL.meta.featureOpen(profile, x));
    return open.includes(last) ? last : open[0] || null;
  }
  function roomHead(profile, tab) {
    const r = ROOMS.find(x => x.id === tab) || ROOMS[ROOMS.length - 1];
    const g = groupOf(r.id);
    const seg = g ? ROOM_GROUPS[g].filter(x => GL.meta.featureOpen(profile, x)).map(x => ROOMS.find(y => y.id === x)).filter(Boolean) : [];
    const segHtml = seg.length > 1 ? `<div class="room-seg seg-${seg.length}" role="tablist">${seg.map(x => `<button class="seg-btn${x.id === r.id ? ' on' : ''}" data-act="hq-tab" data-tab="${x.id}" role="tab" aria-selected="${x.id === r.id}"><i class="seg-ico">${roomArt(x.art)}</i><span>${SEG_NAME[x.id] || x.name}</span>${tabAlert(profile, x.id) ? '<i class="tab-dot"></i>' : ''}</button>`).join('')}</div>` : '';
    return `<div class="room-head app-bar"><button class="room-back" data-act="hq-home" aria-label="Zurück zum Hafen">‹ <span>Hafen</span></button><span class="room-title"><i class="hub-art sm">${roomArt(r.art)}</i>${r.name}</span><span class="room-berry" title="Berry">${GL.sprites.coin()}<b>${Number(profile.berry || 0).toLocaleString('de-DE')}</b></span><button class="room-x" data-act="hq-home" aria-label="Schließen" title="Schließen (Esc)">✕</button></div>
      ${segHtml}`;
  }
  // ---------- Gemütlichkeit: Skilltree ----------
  // Eigene kleine Pixel-Bilder für die Knoten (10×10)
  const SK_ART = {
    bed:    [['..........', '..........', 'KK........', 'KWWKKKKKKK', 'KWWRRRRRRK', 'KKKRrRrRRK', 'KBBBBBBBBK', 'KbbbbbbbbK', 'K.K....K.K', '..........'], { K: '#3a2416', W: '#fffaf0', R: '#e0483b', r: '#f29a8a', B: '#a8693a', b: '#7a4a24' }],
    pot:    [['...w..w...', '..w..w....', '...w..w...', '.KKKKKKKK.', 'KGGGGGGGGK', 'KgGGGGGGgK', 'KgGGGGGGgK', '.KgggggK..', '..KKKKKK..', '.O.O.O.O..'], { K: '#2a2a2e', G: '#6d6d78', g: '#4a4a52', w: '#d8e4ee', O: '#f29a2e' }],
    scope:  [['..........', 'KK........', 'KYK.......', '.KBK......', '..KBBK....', '...KBBBK..', '....KBBBK.', '.....KBBYK', '......KKGK', '........KK'], { K: '#3a2416', B: '#a8693a', Y: '#f2d24a', G: '#9fd4f0' }],
    cannon: [['..........', '.......w.w', '..KKKKKK.w', '.KGGGGGGK.', 'KGgGGGGGGK', 'KGGGGGGGgK', '.KKgggggK.', '.KBBK.KBK.', 'KBbbK.KbBK', '.KK....KK.'], { K: '#22222a', G: '#5a5a66', g: '#3a3a44', B: '#a8693a', b: '#7a4a24', w: '#cfd6de' }],
    figure: [['....KK....', '...KYYK...', '..KYWYYK..', '..KYYYYK..', '...KYYK...', '.KKYYYYKK.', 'KYYYYYYYYK', '.KKYYYYKK.', '...KYYK...', '...KKKK...'], { K: '#6b4a14', Y: '#f2c94c', W: '#fff4c0' }],
    book:   [['..........', '.KKKK.KKKK', 'KWWWWKWWWW', 'KWssWKWssW', 'KWWWWKWWWW', 'KWssWKWssW', 'KWWWWKWWWW', 'KRRRRKRRRR', '.KKKK.KKKK', '..........'], { K: '#3a2416', W: '#fffaf0', s: '#b8a890', R: '#a8693a' }],
    flag:   [['K.........', 'KRRRRRR...', 'KRRWWRRR..', 'KRWKKWRR..', 'KRRWWRRR..', 'KRRRRRR...', 'K.........', 'K.........', 'K.........', 'KK........'], { K: '#3a2416', R: '#2a2a2e', W: '#fffaf0' }],
    scroll: [['.KKKKKKKK.', 'KWWWWWWWWK', '.KWWWWWWK.', '.KWssssWK.', '.KWWWWWWK.', '.KWsssWWK.', '.KWWWWWWK.', '.KWssssWK.', 'KWWWWWWWWK', '.KKKKKKKK.'], { K: '#7a4a24', W: '#f6e7c8', s: '#b8a080' }],
    map:    [['KKKKKKKKKK', 'KWWWWWWWWK', 'KWWsWWWWWK', 'KWWWsWWWWK', 'KWWWWsWRWK', 'KWWWWWRWRK', 'KWWWWWWRWK', 'KWWWWWRWRK', 'KWWWWWWWWK', 'KKKKKKKKKK'], { K: '#7a4a24', W: '#f6e7c8', s: '#b8a080', R: '#e0483b' }]
  };
  const skArtCache = {};
  function skArt(art) {
    if (art === 'fire') return PX_FLAME;
    if (art === 'chest') return PX_CHEST(false);
    if (PXI_ART[art]) return pxIco(art);
    const a = SK_ART[art];
    if (!a) return pxIco('anchor');
    if (!skArtCache[art]) {
      let r = '';
      a[0].forEach((row, y) => row.split('').forEach((ch, x) => { const f = a[1][ch]; if (f) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${f}"/>`; }));
      skArtCache[art] = `<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
    }
    return skArtCache[art];
  }
  function skillSection(profile, uiRef) {
    const S = GL.skills, T = GL.data.skilltree;
    if (!S || !T) return '';
    const free = S.free(profile), src = S.sources(profile);
    const sel = uiRef && uiRef.skSel && S.find(uiRef.skSel) ? uiRef.skSel : null;
    const node = (n, extra) => {
      const has = S.has(profile, n.id), why = S.blocker(profile, n.id), can = !why;
      const st = has ? 'got' : can ? 'can' : 'lock';
      return `<button class="sk-node ${st}${sel === n.id ? ' sel' : ''}${extra || ''}" data-act="sk-sel" data-id="${n.id}" aria-label="${esc(n.name)}"><i class="sk-ico">${extra === ' tal' ? '' : skArt(n.art)}</i>${n.cost > 1 ? `<em class="sk-cost">${n.cost}</em>` : ''}${has ? '<em class="sk-ok">✓</em>' : ''}<small>${esc(n.name)}</small></button>`;
    };
    const paths = T.paths.map(p => {
      const got = p.nodes.filter(n => S.has(profile, n.id)).length;
      const ship = p.id === 'schiff' ? `<span class="sk-ship${got ? ' g' + got : ''}">${GL.sprites.ship()}${p.nodes.filter(n => S.has(profile, n.id)).map((n, i) => `<i class="sk-part p${i}">${skArt(n.art)}</i>`).join('')}</span>` : '';
      return `<div class="sk-path sk-${p.id}">
        <div class="sk-ph"><b><i>${p.icon}</i>${esc(p.name)}</b><small>${got}/${p.nodes.length}</small></div>${ship}
        <div class="sk-trail">${p.nodes.map(n => node(n)).join('')}</div></div>`;
    }).join('');
    const tal = T.talents.map(n => {
      const d = GL.data.crew.find(c => c.id === n.who);
      const has = S.has(profile, n.id), why = S.blocker(profile, n.id);
      const st = has ? 'got' : !why ? 'can' : 'lock';
      return `<button class="sk-tal ${st}${sel === n.id ? ' sel' : ''}" data-act="sk-sel" data-id="${n.id}" aria-label="${esc(n.name)}"><span class="sk-face">${d ? GL.sprites.render(d) : ''}</span>${has ? '<em class="sk-ok">✓</em>' : st === 'lock' ? '<em class="sk-lk">🔒</em>' : ''}<small>${esc(d ? d.name : n.who)}</small></button>`;
    }).join('');
    let info = `<div class="sk-info empty"><span>Tipp auf einen Knoten, um zu sehen, was er bringt.</span></div>`;
    if (sel) {
      const n = S.find(sel), has = S.has(profile, sel), why = S.blocker(profile, sel);
      const d = n.who ? GL.data.crew.find(c => c.id === n.who) : null;
      info = `<div class="sk-info"><i class="sk-big">${d ? GL.sprites.render(d) : skArt(n.art)}</i>
        <span class="sk-it"><small>${n.path === 'talent' ? 'Talent' : esc((T.paths.find(p => p.id === n.path) || {}).name || '')}${(n.cost || 1) > 1 ? ' · ' + n.cost + ' Punkte' : ''}</small><b>${esc(n.name)}</b><span>${esc(n.text)}</span></span>
        ${has ? '<span class="sk-done">✓ Gelernt</span>' : why ? `<span class="sk-why">🔒 ${esc(why)}</span>` : `<button class="btn sk-learn" data-act="sk-learn" data-id="${n.id}">Lernen ✦</button>`}</div>`;
    }
    const chip = (ico, n, lbl, tip) => `<span class="sk-src" data-tip="${esc(tip)}"><i>${ico}</i><b>${n}</b><small>${lbl}</small></span>`;
    return `<section class="hq-sec sk-room">
      <div class="sk-top">
        <div class="sk-pts${free ? ' has' : ''}"><b>${free}</b><span>✦ Skillpunkte frei</span></div>
        <div class="sk-srcs">${chip('⭐', src.rank, 'Rang', '1 Punkt pro Piratenrang')}${chip('⛵', src.runs, 'Fahrten', '1 Punkt alle 6 Fahrten')}${chip('🏝', src.land, 'Landgang', '1 Punkt alle 3 Landgänge')}${chip('♥', src.bond, 'Vertraut', '1 Punkt alle 5 Vertraut-Stufen deiner Stammcrew')}</div>
      </div>
      ${info}
      <div class="sk-tree">${paths}</div>
      <div class="sk-tal-h"><b>✨ Talente</b><small>Ab Vertraut 2 mit der Figur</small></div>
      <div class="sk-tals">${tal}</div>
      <div class="sk-foot"><small>Gilt für alle kommenden Fahrten. Umskillen ist kostenlos.</small>${S.learned(profile).length ? `<button class="btn mini ghost" data-act="sk-reset">${uiRef && uiRef.skArmed ? 'Sicher? Nochmal tippen' : '↺ Umskillen'}</button>` : ''}</div>
    </section>`;
  }
  function roomFoot() { return `<div class="room-foot"><button class="btn ghost" data-act="hq-home">‹ Zurück zum Hafen</button></div>`; }
  function hq(profile, tab, uiRef) {
    if (!GL.meta.featureOpen(profile, tab)) tab = 'profil';
    const room = !!(uiRef && uiRef.hqRoom && GL.meta.featureOpen(profile, uiRef.hqRoom));
    const best = GL.save.best();
    const slots = GL.meta.slots(profile);
    const fmt = n => n.toLocaleString('de-DE');

    const upgrades = GL.data.upgrades.map(u => {
      const lvl = profile.upgrades[u.id] || 0;
      const cost = GL.meta.upgradeCost(profile, u.id);
      const pips = u.costs.map((_, k) => `<i class="${k < lvl ? 'on' : ''}"></i>`).join('');
      const now = lvl ? fmtUpgrade(u, lvl * u.per) : 'Noch nicht gebaut.';
      const next = cost != null ? `Nächste Stufe: ${fmtUpgrade(u, (lvl + 1) * u.per)}` : 'Voll ausgebaut.';
      const can = cost != null && profile.berry >= cost;
      // Kompakte Werft-Kachel: Bild, Name, Stufen-Pips, was die nächste Stufe bringt, Preis
      const WF_ICO = { rumpf: () => pxIco('anchor'), kanonen: () => GL.sprites.icon('relic', 'bordkanone'), segel: () => pxIco('ship'), kombuese: () => GL.sprites.icon('node', 'rest'),
        ausguck: () => GL.sprites.icon('node', 'recruit'), schatzkarte: () => pxIco('chest'), training: () => GL.sprites.icon('node', 'battle'), buero: () => GL.sprites.icon('node', 'elite'), lager: () => GL.sprites.icon('relic', 'proviant') };
      return `<div class="wf-tile${cost == null ? ' maxed' : ''}${can ? ' can-buy' : ''}">
        <div class="wf-top"><i class="wf-ico">${(WF_ICO[u.id] || (() => pxIco('anchor')))()}</i><span class="wf-name"><b>${u.name}</b><span class="lvpips">${pips}</span></span></div>
        ${lvl ? `<small class="wf-now"><em>Jetzt</em> ${now}</small>` : ''}
        <small class="wf-next">${cost != null ? `<em>${lvl ? 'Dann' : 'Bringt'}</em> ${fmtUpgrade(u, (lvl + 1) * u.per)}` : '✓ Voll ausgebaut'}</small>
        ${cost != null ? `<button class="btn mini buy wf-buy" data-act="buy-upgrade" data-id="${u.id}"${profile.berry < cost ? ' disabled' : ''}>${GL.sprites.coin()} ${fmt(cost)}</button>` : ''}
      </div>`;
    }).join('');

    const owned = GL.data.gear.filter(g => profile.gear[g.id] > 0);
    const storage = owned.length ? owned.map(g => {
      const on = profile.loadout.includes(g.id);
      const full = !on && profile.loadout.length >= slots;
      return `<div class="hq-item${on ? ' on' : ''}">
        <i>${gearIco(g.id)}</i>
        <span><b>${g.name}</b> <small>×${profile.gear[g.id]}</small><small>${g.text}</small></span>
        <button class="btn mini${on ? '' : ' ghost'}" data-act="toggle-gear" data-id="${g.id}"${full ? ' disabled' : ''}>${on ? 'Kommt mit' : 'Mitnehmen'}</button>
      </div>`;
    }).join('') : '<p class="muted">Das Lager ist leer. Beim Händler bekommst du Ausrüstung für deine Runs.</p>';

    const shop = GL.data.gear.map(g => `<div class="wf-tile shop${profile.berry >= g.cost ? ' can-buy' : ''}">
        <div class="wf-top"><i class="wf-ico">${gearIco(g.id)}</i><span class="wf-name"><b>${g.name}</b>${profile.gear[g.id] ? `<em class="wf-own">×${profile.gear[g.id]} <span>im Lager</span></em>` : ''}</span></div>
        <small class="wf-next">${g.text}</small>
        <button class="btn mini buy wf-buy" data-act="buy-gear" data-id="${g.id}"${profile.berry < g.cost ? ' disabled' : ''}>${GL.sprites.coin()} ${fmt(g.cost)}</button>
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
    const board = profile.loadout.map(id => { const g = byId(GL.data.gear, id); return g ? `<span class="sb-chip" data-tip="${esc(g.name)}: ${esc(g.text)}">${gearIco(g.id)}</span>` : ''; })
      .concat(profile.artLoadout.map(id => { const a = GL.data.artifacts.find(x => x.id === id); return a ? `<span class="sb-chip art" data-tip="${esc(a.name)}">${artIcon(a)}</span>` : ''; }))
      .concat(GL.meta.takeItems(profile).map(x => `<span class="sb-chip" data-tip="${esc(itemName(x))}">${itemIcon(x)}</span>`)).filter(Boolean);
    return `<div class="hq">
      <div class="hq-bar">
        ${profileChip(profile)}
        <div class="berry">${GL.sprites.coin()} <b>${fmt(profile.berry)}</b> <small>Berry</small></div>
      </div>

      ${room ? '' : `<div class="hq-sail game">
        ${(() => { const t = timeOfDay(); const crew = (GL.meta.squadUnlocked(profile) ? GL.meta.squadIds(profile) : ['self'].concat(GL.config.starters.slice(0, 2))).slice(0, 4);
          const talk = crew[Math.floor(Date.now() / 600000) % Math.max(1, crew.length)];
          const fig = id => { const d = id === 'self' ? avatarOf(profile) : crewData(id); if (!d) return '';
            const say = id === talk ? lifeLine(profile, id, 'hafen') : '';
            return `<button class="ss-mate" data-act="crew-card" data-id="${id}" aria-label="${esc(d.name)}">${say ? `<span class="ss-say">${esc(say)}</span>` : ''}${GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d)}</button>`; };
          return `<div class="sail-stage tod-${t.id}" aria-hidden="true">
          <div class="ss-sun"></div>${t.id === 'night' ? '<div class="ss-stars"></div>' : ''}<div class="ss-cloud c1"></div><div class="ss-cloud c2"></div>
          <div class="ss-sea"></div><div class="ss-ship">${GL.sprites.ship()}${(() => {
            // Begleiter tanzen an Deck (der aktive steht bei der Crew am Steg)
            const act = cosOf(profile).pet;
            const deck = (profile.pets || []).filter(id => id !== act && petDef(id)).slice(-4);
            return deck.length ? `<span class="ss-deck">${deck.map((id, k) => `<i class="ss-pet d${k}">${petArt(id)}</i>`).join('')}</span>` : '';
          })()}</div>
          <div class="ss-dock"><span class="ss-lamp"></span>${crew.map(fig).join('')}${(() => { const a = cosOf(profile).pet; return a && petDef(a) ? `<i class="ss-mate ss-buddy">${petArt(a)}</i>` : ''; })()}</div>
          <span class="ss-title">${uiRef && uiRef.peek ? 'Dein Run läuft noch' : esc(greeting(profile, t))}</span>
        </div>`; })()}
        ${atSeaBox()}${uiRef && uiRef.peek ? '' : (GL.season ? GL.season.banner(profile) : '')}
        ${uiRef && uiRef.peek ? `<small class="sail-note">Oben links geht es zurück zum Run.</small>` : `
        <div class="sail-row">
          <button class="btn sail" data-act="sail">${pxIco('ship')}Leinen los! ${keyHint('Leertaste')}</button>
        </div>
        ${actionDock(profile)}
        <div class="sail-meta">${heatBox}${board.length ? `<span class="sail-board"><span class="sb-lbl">An Bord</span>${board.join('')}</span>` : ''}${buddyChip(profile)}</div>`}
      </div>`}

      ${room ? roomHead(profile, tab) : hubTiles(profile, tab)}
      ${room ? '' : featureNextLine(profile)}
      ${room || (uiRef && uiRef.peek) ? '' : goalList(profile, 2).replace('goal-box pxf', 'goal-box pxf hq-goals')}
      ${room || (uiRef && uiRef.peek) ? '' : hookLines(profile)}

      ${!room ? '' : `
      ${tab === 'werft' ? `<section class="hq-sec">
        <p class="hint">Bau dein Schiff aus. Jede Stufe gilt für alle kommenden Runs.</p>
        <div class="wf-grid">${upgrades}</div></section>` : ''}

      ${tab === 'profil' ? `<section class="hq-sec">
        <div class="pf-quick"><button class="btn ghost" data-act="album" data-tab="stats">${pxIco('chart')}<span>Statistik</span></button><button class="btn ghost" data-act="sticker">${pxIco('sticker')}<span>Sticker</span></button><button class="btn ghost" data-act="friends-open">${pxIco('heart')}<span>Freunde</span></button><button class="btn ghost" data-act="story-book">${pxIco('book')}<span>Story</span></button></div>
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
      ${tab === 'auftraege' ? questBoard(profile) : ''}
      ${tab === 'stammcrew' ? squadSection(profile, uiRef) : ''}
      ${tab === 'kammer' ? vaultSection(profile) : ''}
      ${tab === 'schmiede' ? forgeSection(profile, uiRef) : ''}
      ${tab === 'rangliste' ? leaderboard(profile, uiRef) : ''}
      ${tab === 'gemuet' ? skillSection(profile, uiRef) : ''}
      ${tab === 'gemeinschaft' && GL.coop ? GL.coop.section(profile, uiRef) : ''}
      ${tab === 'lager' ? lagerSection(profile, slots) : ''}

      ${tab === 'haendler' ? `<section class="hq-sec">
        <p class="hint">Kleine Helfer für den nächsten Run. Was du kaufst, wartet im Lager auf dich.</p>
        <div class="wf-grid">${shop}</div></section>` : ''}
      ${roomFoot()}`}
    </div>`;
  }

  // ---------- Sammelalbum ----------
  const ALBUM_TABS = [
    { id: 'crew', name: 'Figuren' },
    { id: 'bosses', name: 'Bosse' },
    { id: 'fruits', name: 'Früchte' },
    { id: 'relics', name: 'Schätze' },
    { id: 'pets', name: 'Begleiter' }
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
          return { known, html: `<div class="acard-card" data-act="acard-open" role="button" tabindex="0"><span class="no">#${String(idx + 1).padStart(3, '0')}</span>${crewCardFace(d, { atk: d.atk, max: d.hp, spd: d.spd }, { gold: d.locked, style: true })}</div>` };
        }
        return { known, html: albumCard(known, GL.sprites.render(d), d.name, sub, d.locked ? 'gold-book' : '', idx + 1) };
      }),
      bosses: GL.data.bosses.concat(GL.data.raids, GL.data.hunted || []).map(d => {
        const n = profile.counts['defeated:' + d.id] || 0;
        const known = n > 0;
        return { known, html: albumCard(known, GL.sprites.render(d), d.name,
          known ? `${n}-mal besiegt` : (d.raid ? 'Raid-Boss' : d.bounty ? `Kopfgeld ${d.bounty} Mio. ฿` : 'Noch nicht besiegt'), (d.raid ? 'epic' : d.bounty ? 'rare' : '') + ' k-boss') };
      }),
      fruits: GL.data.fruits.map(f => {
        const known = seen.fruits.includes(f.id) || (f.awakened && profile.epics.includes(f.id));
        const text = GL.loot.make(f, f.vals ? 1 : -1).text + (f.vals ? ' (Seltene Stufe)' : '');
        return { known, html: albumCard(known, GL.sprites.icon('fruit', f.id, f.awakened), f.name,
          known ? text : (f.awakened ? 'Erwacht, nur aus Raids' : 'Noch nicht gegessen'), (f.awakened ? 'epic' : '') + ' k-fruit') };
      }),
      relics: GL.data.relics.map(r => {
        const known = seen.relics.includes(r.id);
        const text = GL.loot.make(r, r.vals ? 1 : -1).text + (r.vals ? ' (Seltene Stufe)' : '');
        return { known, html: albumCard(known, known ? GL.sprites.icon('relic', r.id) : (pxIco('chest') || GL.sprites.icon('relic', r.id)), r.name, known ? text : 'Noch nicht gefunden', 'k-relic') };
      }),
      pets: (GL.data.pets || []).map(p => {
        const known = (profile.pets || []).includes(p.id), on = cosOf(profile).pet === p.id;
        const where = p.isl ? `Lebt auf ${islName(p.isl)}. Besiege dort Bösewicht oder Boss, mit etwas Glück kommt das Tier an Bord.` : p.hint;
        return { known, html: `<div class="acard pet-card${known ? '' : ' unknown'}${on ? ' on' : ''}${p.book ? ' gold-book' : ''}">
          <div class="acard-art"><span class="pet-hop${known ? '' : ' pet-sil'}">${petArt(p.id)}</span></div>
          <b>${known ? esc(p.name) : '???'}</b>
          <small>${known ? `„${esc(p.say)}“` : esc(where)}</small>
          ${known ? `<button class="btn mini${on ? '' : ' ghost'}" data-act="pet-set" data-v="${on ? '' : p.id}">${on ? '✓ Dabei' : 'Mitnehmen'}</button>` : ''}
        </div>` };
      })
    };
    const all = Object.values(lists).flat();
    const total = all.filter(x => x.known).length;
    const tabs = `<button class="atab${tab === 'stats' ? ' on' : ''}" data-act="album-tab" data-tab="stats">Statistik</button>` + ALBUM_TABS.map(t => {
      const l = lists[t.id];
      return `<button class="atab${t.id === tab ? ' on' : ''}" data-act="album-tab" data-tab="${t.id}">${t.name}
        <small>${l.filter(x => x.known).length}/${l.length}</small></button>`;
    }).join('');
    return `<div class="album-inner">
      <div class="album-head">
        <div><h2>Album & Statistik</h2>
          <p class="hint">${total} von ${all.length} entdeckt. ${profile.stats.runs} ${profile.stats.runs === 1 ? 'Run' : 'Runs'} gespielt, ${profile.stats.wins} gewonnen.</p></div>
        <button class="btn ghost" data-act="album-close">Schließen</button>
      </div>
      ${albumSteps(profile)}
      <div class="atabs" role="tablist">${tabs}</div>
      ${tab === 'stats' ? statsView(profile, lists) : `<div class="agrid">${lists[tab].map(x => x.html).join('')}</div>`}
    </div>`;
  }
  // Sammelbuch-Stufen: Pfad mit Belohnungen, die erreichte Stufe leuchtet
  function albumSteps(profile) {
    const S = GL.data.albumSteps || [], st = GL.meta.albumStep(profile), ac = st.ac;
    const nodes = S.map((x, i) => {
      const done = i < st.reached, need = Math.ceil(x.at * ac.total);
      const ico = x.pet ? `<span class="${done ? 'pet-hop' : 'pet-sil'}">${petArt(x.pet)}</span>` : GL.sprites.coin();
      const tip = `Stufe ${i + 1}: ${need} Entdeckungen · ${x.pet ? 'Begleiter ' + petDef(x.pet).name : x.berry + ' Berry'}`;
      return `<i class="as-node${done ? ' done' : ''}${i === st.reached ? ' next' : ''}" data-tip="${esc(tip)}" tabindex="0">${ico}<em>${need}</em></i>`;
    }).join('<span class="as-line"></span>');
    return `<div class="album-steps pxf">
      <div class="as-head"><b>Sammelbuch</b><small>${st.next ? `Noch ${st.left} bis Stufe ${st.reached + 1}` : 'Alle Stufen geschafft!'}</small></div>
      <div class="as-path">${nodes}</div>
    </div>`;
  }
  // Statistik: eigene Werte, Fortschritt beim Sammeln, beste Figuren
  const uiStats = {};
  function statsView(profile, lists) {
    const v = GL.meta.progressValues(profile), R = profile.records || {}, L = profile.life || {};
    const best = GL.save.best();
    const n = x => (x || 0).toLocaleString('de-DE');
    const big = (val, lbl, ico) => `<div class="stv-n"><i class="stv-ico">${ico}</i><b class="num">${val}</b><small>${lbl}</small></div>`;
    const bar = (lbl, have, need) => `<div class="stv-bar"><span>${lbl}</span><i><b style="width:${Math.round(100 * have / Math.max(1, need))}%"></b></i><em class="num">${have}<small>/${need}</small></em></div>`;
    const SI = { runs: pxIco('anchor'), wins: PX_STAR, best: GL.sprites.coin(), kos: GL.sprites.icon('node', 'battle'), hit: pxIco('fire') || '⚡', dmg: pxIco('swords'), boss: GL.sprites.icon('node', 'elite'), raid: GL.sprites.icon('node', 'raid'), isl: pxIco('ship') };
    const cosAll = Object.values(GL.data.cosmetics).flat(), cosHave = cosAll.filter(it => GL.meta.cosmeticUnlocked(profile, it, v)).length;
    const caps = GL.data.crew.filter(c => !c.self);
    const capHave = caps.filter(c => !c.locked || profile.unlocked.includes(c.id)).length;
    const known = l => l.filter(x => x.known).length;
    const CS = profile.charStats || {};
    const top = Object.keys(CS).filter(id => id === 'self' || crewData(id)).sort((a, b) => CS[b].dmg - CS[a].dmg).slice(0, 12);
    const who = id => id === 'self' ? avatarOf(profile) : crewData(id);
    return `<div class="stv">
      <div class="stv-grid">
        ${big(n(profile.stats.runs), 'Runs', SI.runs)}${big(n(profile.stats.wins), 'Siege', SI.wins)}${big(n(best ? best.score : 0), 'Bestwert', SI.best)}
        ${big(n(Math.max(R.kos || 0, L.kos || 0)), 'K.o.s', SI.kos)}${big(n(R.maxHit), 'Härtester Treffer', SI.hit)}${big(n(Math.max(R.dmg || 0, L.dmg || 0)), 'Schaden gesamt', SI.dmg)}
        ${big(n(v.bosses), 'Inselbosse', SI.boss)}${big(n(v.raids), 'Raids', SI.raid)}${big(n(v.islands), 'Inseln', SI.isl)}
      </div>
      <h3 class="stv-h">Gesammelt</h3>
      ${bar('Kapitäne frei', capHave, caps.length)}${bar('Figuren getroffen', known(lists.crew), lists.crew.length)}${bar('Gegner besiegt', known(lists.bosses), lists.bosses.length)}
      ${bar('Früchte', known(lists.fruits), lists.fruits.length)}${bar('Schätze', known(lists.relics), lists.relics.length)}${bar('Profil-Teile', cosHave, cosAll.length)}
      <h3 class="stv-h">Deine Figuren</h3>
      ${top.length ? (() => {
        const sk = (uiStats.sort || 'dmg');
        const val = (x, k) => k === 'wins' ? (x.runs ? x.wins / x.runs : 0) : (x[k] || 0);
        const sorted = top.slice().sort((a, b) => val(CS[b], sk) - val(CS[a], sk));
        const chips = [['dmg', 'Schaden'], ['wins', 'Siege'], ['runs', 'Runs'], ['kos', 'K.o.s']].map(([k, l]) => `<button class="sqc-f${sk === k ? ' on' : ''}" data-act="stv-sort" data-v="${k}">${l}</button>`).join('');
        const card = (id, i) => { const x = CS[id], d = who(id), wr = x.runs ? Math.round(100 * x.wins / x.runs) : 0;
          return `<div class="fig-card${i < 3 ? ' top t' + (i + 1) : ''}" data-tip="${esc(d.name + '\nBester Treffer: ' + n(x.best) + ' · Kämpfe: ' + n(x.fights))}">
            ${i < 3 ? `<span class="fig-medal">${i + 1}</span>` : ''}
            <i class="fig-por">${GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d)}</i>
            <span class="fig-body"><b>${esc(d.name)}</b>
              <span class="fig-pills"><em title="Runs">${SI.runs}<span class="num">${n(x.runs)}</span></em><em title="Schaden">${SI.dmg}<span class="num">${n(x.dmg)}</span></em><em title="K.o.s">${SI.kos}<span class="num">${n(x.kos)}</span></em></span>
              <span class="fig-wr"><i><b style="width:${wr}%"></b></i><small><span class="num">${wr} %</span> <span>Siege</span></small></span></span></div>`; };
        return `<div class="fig-sort">${chips}</div><div class="fig-grid">${sorted.map(card).join('')}</div>`; })()
        : emptyState(GL.sprites.ship(), 'Noch keine Werte', 'Ab deinem nächsten Run sammeln sich hier die Werte jeder Figur.')}
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
  // Einführung für Neue: drei kurze Karten mit Bildern statt Textwänden
  const irow = (ico, t, sub) => `<div class="in-row"><i class="in-ico">${ico}</i><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span></div>`;
  const INTRO = [
    {
      kicker: 'Willkommen an Bord',
      title: 'Auf zur Grand Line',
      body: `<p class="in-lead">Crew sammeln, Inseln erobern, den Boss umhauen. Ein Run dauert etwa 20 Minuten. Scheitern gehört dazu: Mit jeder Fahrt wirst du stärker.</p>
        <div class="intro-note"><b>Inoffizielles Fanprojekt.</b> Kostenlos, ohne Werbung, nicht verbunden mit Eiichiro Oda, Shueisha oder Toei Animation.</div>`
    },
    {
      kicker: 'So läuft ein Run',
      title: 'Wählen, kämpfen, weitersegeln',
      body: `<div class="in-rows">
        ${irow(pxIco('anchor'), 'Kapitän wählen', 'Er oder sie bleibt den ganzen Run.')}
        ${irow(GL.sprites.icon('node', 'recruit'), 'Route wählen', 'Kampf, Taverne, Schatz, Frucht oder Rast.')}
        ${irow(pxIco('swords'), 'Kämpfe laufen allein', 'Du planst, deine Crew prügelt.')}
        ${irow(GL.sprites.icon('node', 'elite'), 'Boss besiegen', 'Am Ende jeder Insel wartet ein Bösewicht.')}</div>`
    },
    {
      kicker: 'Stark werden',
      title: 'Kombos und dein Hafen',
      body: `<div class="in-rows">
        ${irow(`${badge('kraft')}`, 'Kampfstile', `${badge('kraft')} schlägt ${badge('technik')} schlägt ${badge('klinge')} schlägt ${badge('kraft')}`)}
        ${irow(pxIcon('strohhut'), 'Gleiche Banden = Boni', 'Volle Bande? Dann gibt es sogar eine Team-Fähigkeit.')}
        ${irow(GL.sprites.coin(), 'Berry für den Hafen', 'Schiff ausbauen, Ausrüstung, deine Stammcrew.')}</div>
        <p class="kbd-only in-kbd"><kbd class="key inline">Leertaste</kbd> geht weiter, <kbd class="key inline">1</kbd>–<kbd class="key inline">9</kbd> wählt.</p>`
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
    { c: 'atk', ico: '⚔', px: 'swords', name: 'Kampftraining', fx: p => `+${p * GL.config.point.atk} Angriff` },
    { c: 'hp',  ico: '❤', px: 'heart', name: 'Ausdauer',      fx: p => `+${p * GL.config.point.hp} Leben` },
    { c: 'spd', ico: '⚡', px: 'bolt', name: 'Sprinttraining', fx: p => `+${p * GL.config.point.spd} Tempo` },
    { c: 'mix', ico: '⚖', px: 'scale', name: 'Ausgewogen',     fx: p => `+${Math.ceil(p / 2) * GL.config.point.hp} Leben, +${Math.floor(p / 2) * GL.config.point.atk} Angriff` }
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
        <button class="link" data-act="train-auto" title="Für alle das empfohlene Training wählen">Für alle</button></div>
      <div class="train-opts">${TRAIN.map(t => `<button class="train-opt${rec && rec.stat === t.c ? ' rec' : ''}" data-act="train" data-i="${i}" data-c="${t.c}">
        ${rec && rec.stat === t.c ? '<span class="tip-badge">Tipp</span>' : ''}<i class="to-ico">${(t.px === 'swords' && GL.art ? GL.art.icon('kampf') : '') || pxIco(t.px) || t.ico}</i><b>${t.name}</b><small>${t.fx(u.points)}</small></button>`).join('')}</div>
      <div class="train-auto-row">${autoCheck(profile)}<small>Automatisch verteilen</small></div>
    </div>`;
  }

  GL.ui = {
    ffButton,
    gearTipItem,
    kumpanPop,
    kumpanInPop,
    dressRoom,
    setPins: l => { pinData = l; },
    newsPop,
    setStatsSort: k => { uiStats.sort = k; },
    storyBook,
    cgArtOf: it => cgArt(it),
    gearTip,
    pxIcon,
    introSteps: INTRO.length,
    weekPop,
    // Kleines Freunde-Symbol (zwei Pixel-Köpfe) für die Ecke oben
    friendsIcon: '<svg viewBox="0 0 11 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 0h3v1h1v2h-1v1h-3v-1h-1v-2h1zM1 5h5v1h1v2h-7v-2h1zM7 1h2v1h1v2h-1v1h-2zM8 5h2v1h1v2h-3v-2h-1z"/></svg>',
    stickerInfo(profile) {
      const rp = GL.meta.rankProgress(profile);
      return { svg: GL.sprites.renderShaded(avatarOf(profile)), name: profile.nickname || 'Pirat', sub: (titleName(cosOf(profile).title) || rp.rank.name) + ' · ' + rp.rank.name };
    },
    stickerPop(url) {
      return `<div class="fpop-card sticker-pop"><span class="event-kicker">Dein Sticker</span>
        <img class="st-prev" src="${url}" alt="Sticker mit deinem Piraten">
        <p class="hint">Kopieren und in WhatsApp einfügen, oder teilen und als Sticker speichern.</p>
        <div class="st-btns"><button class="btn" data-act="sticker-copy">Kopieren</button><button class="btn ghost" data-act="sticker-share">Teilen</button><button class="btn ghost" data-act="sticker-save">Speichern</button></div>
        <div class="fpop-btns"><button class="btn ghost" data-act="pop-close">Schließen</button></div></div>`;
    },
    friendsPop, invitePop,
    wikiIcon: '<svg viewBox="0 0 9 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 1h3v1h1v5h-1v-1h-3zM5 2h1v-1h3v5h-3v1h-1z"/><path fill="#c9a46a" d="M1 2h2v3h-2zM6 2h2v3h-2z"/></svg>',
    wikiPop,
    goalList,
    musicBtn,
    synPop,
    bountyPoster,
    trophyPop,
    featurePop,
    feedbackPop,
    installPop,
    notesPop,
    duelPop,
    toggleMail() { mailShown = !mailShown; },

    render(run, anim, ui) {
      GL.devAll = isAdmin();
      window.__glRunRef = run;
      const titleEl = $('#title');
      titleEl.hidden = !ui.screen;
      document.body.classList.toggle('on-title', !!ui.screen);
      seenRef = ui.profile && ui.profile.seen; profRef = ui.profile || null;
      document.body.classList.toggle('in-room', !run && !ui.screen && !!ui.hqRoom && !!ui.profile && GL.meta.featureOpen(ui.profile, ui.hqRoom));
      // Feste Leiste unten (nur im Hauptquartier): Hafen, Aufträge, Stammcrew, Rangliste, Kapitänsbuch
      const tb = document.getElementById('tabbar');
      if (tb) {
        const showTb = !run && !ui.screen && ui.profile && ui.profile.nickname;
        tb.hidden = !showTb;
        document.body.classList.toggle('has-tabbar', !!showTb);
        if (showTb) {
          const P = ui.profile, cur0 = ui.hqRoom || 'hafen', cur = groupOf(cur0) === 'crew' ? 'crew' : cur0;
          const cr = crewRoom(P, ui.crewLast);
          const items = [['hafen', 'Hafen', 'flag'], ['auftraege', 'Aufträge', 'scroll'], ['crew', 'Crew', 'flag2'], ['rangliste', 'Rangliste', 'podium'], ['profil', 'Kapitän', 'self']]
            .filter(([id]) => id === 'hafen' || id === 'profil' || (id === 'crew' ? !!cr : GL.meta.featureOpen(P, id)));
          const ico = a => a === 'self' ? GL.sprites.render({ id: 'self', look: lookOf(P) }) : a === 'flag' ? GL.sprites.ship() : featureArt(a === 'flag2' ? 'flag' : a);
          const html = items.map(([id, name, art]) => `<button class="tb-btn${cur === id ? ' on' : ''}" data-act="${id === 'hafen' ? 'hq-home' : 'hq-tab'}" data-tab="${id === 'crew' ? cr : id}"><i class="tb-ico">${ico(art)}</i><span>${name}</span>${id !== 'hafen' && tabAlert(P, id) ? '<i class="tab-dot"></i>' : ''}</button>`).join('');
          if (tb.dataset.last !== html) { tb.innerHTML = html; tb.dataset.last = html; }
        }
      }
      GL.sprites.myShip = (ui.profile && ui.profile.ship) || null;
      const nb = document.getElementById('notes-btn');
      if (nb && ui.profile) nb.innerHTML = 'Neuigkeiten' + (ui.profile.notesSeen !== GL.version ? ' <i class="new-dot"></i>' : '');
      document.body.classList.toggle('streamer', streamOn());
      document.body.classList.toggle('is-app', !!fsApp());
      document.body.classList.toggle('in-run', !!run && !ui.screen);
      // Auswahl-Bildschirme (Taverne, Früchte, Schätze, Ereignisse) als Fenster über dem Run: kein Scrollen durch Crew und Boni
      document.body.classList.toggle('choice-open', !!run && !ui.screen && ['recruit', 'fruit', 'treasure', 'awaken', 'event'].includes(run.phase));
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
        ['#crew', '#syn', '#crew-label', '#restart', '#sheet', '#traits', '#synbar', '#peek', '#peek-btn', '#pause-btn'].forEach(sel => { $(sel).hidden = true; });
        const html = hq(ui.profile, ui.hqTab || 'profil', ui);
        if (html !== ui.lastStage) {
          $('#stage').innerHTML = html; ui.lastStage = html;
          const h0 = document.getElementById('sheet-host'); if (h0) h0.replaceChildren();
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
      if ($('#pause-btn')) $('#pause-btn').hidden = GL.run.isFinished(run);
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
      const sbar = rail ? synBar(run) : '';
      $('#synbar').hidden = !sbar;
      if ($('#synbar').innerHTML !== sbar) $('#synbar').innerHTML = sbar;
      // Szenenwechsel: beim Erreichen einer neuen Insel kurz ihren Namen einblenden
      const isl = GL.run.island(run);
      if (run.phase === 'course' && run.step % GL.config.stepsPerIsland === 0 && ui.shownIsland !== isl.id + run.seed) {
        ui.shownIsland = isl.id + run.seed; ui.sceneAt = Date.now();
        const bs = GL.data.islands[GL.run.islandIndex(run)];
        showScene(GL.data.altOpen(run, GL.run.islandIndex(run)) ? { id: isl.id, name: bs.name + ' oder ' + bs.alt.name, tagline: 'Zwei Routen. Du entscheidest, wohin die Reise geht.' } : isl, GL.run.islandIndex(run));
      }
      const stopKey = run.seed + ':' + run.step;
      if (run.phase === 'map' && ui.shownStop !== stopKey) {
        ui.shownStop = stopKey;
        const r = GL.run.rowIdx(run);
        const last = r === GL.config.chapterSteps - 1;
        const here = GL.run.chapterIsland(run);
        // Nur die wichtigen Momente einblenden: Ankunft auf einer Insel und der Endkampf
        if (r === 0 && here && !(ui.sceneAt && Date.now() - ui.sceneAt < 5000)) showStop(here.name, 'Ankunft auf');
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
      const downN = run.crew.filter(u => u.hp <= 0).length;
      $('#crew-label').innerHTML = `<span class="nowrap">Deine Crew ${run.crew.length ? `<small>${run.crew.length}/${GL.run.crewLimit(run)}</small>` : ''}</span>${downN ? `<span class="down-chip sm">${PX_GRAVE} ${downN} K.O.</span>` : ''}
        <span class="nowrap charge-wrap">Spezial ${chargePips(run)}</span>
        ${autoCheck(ui.profile, 'mini')}

        <button class="link" data-act="crew-toggle" aria-expanded="${!!ui.crewOpen}">${ui.crewOpen ? 'Kompakt' : 'Details'}</button>`;
      $('#crew').classList.toggle('compact', !ui.crewOpen);
      $('#crew').title = 'Deine Crew. Vor jedem Kampf stellt sie sich automatisch auf: Brecher vorne, Helfer hinten.';
      $('#crew').innerHTML = ui.crewOpen
        ? (() => { const n = Math.max(1, run.crew.length), avg = { atk: run.crew.reduce((a, u) => a + u.atk, 0) / n, max: run.crew.reduce((a, u) => a + u.max, 0) / n, spd: run.crew.reduce((a, u) => a + u.spd, 0) / n };
            return run.crew.map((u, i) => crewCard(u, i, inBattle ? anim.crewHp[i] : u.hp, avg)).join(''); })()
        : run.crew.map((u, i) => miniCard(u, i).replace('class="crewmini', `class="crewmini${i === run.crew.findIndex(x => x.hp > 0) ? ' is-front' : ''}`)).join('') + `<div class="chips">${synergyChips(run)}${GL.effects.relicList(run).length ? `<span class="chip relic-chip">${GL.effects.relicList(run).length} ${GL.effects.relicList(run).length === 1 ? 'Schatz' : 'Schätze'}</span>` : ''}</div>`;
      const open = $('#syn details') && $('#syn details').open;
      if (ui.crewOpen) $('#syn').innerHTML = synergyPanel(run);
      if (open && $('#syn details')) $('#syn details').open = true;

      // Hauptbereich nur neu aufbauen, wenn sich etwas geändert hat (sonst starten Animationen neu)
      const canTrain = ['map', 'prep', 'recruit', 'fruit', 'treasure', 'course', 'event'].includes(run.phase);
      const html = coach(run, ui.profile) + (canTrain ? trainPanel(run, ui.profile) : '') + stage(run, anim, ui);
      if (html !== ui.lastStage) {
        $('#stage').innerHTML = html;
        ui.lastStage = html;
        window.__glStageAt = performance.now();
        // Taverne am Handy: Detail-Blatt an den Seitenrand hängen (sonst hält es ein verschobener Rahmen fest)
        let host = document.getElementById('sheet-host');
        if (!host) { host = document.createElement('div'); host.id = 'sheet-host'; document.body.appendChild(host); }
        const sh = $('#stage .tv-sheet'), shBg = $('#stage .tv-sheet-bg');
        host.replaceChildren(...[shBg, sh].filter(Boolean));
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
    battleText,
    speedLabel,
    welcomePop,
    petPop,
    crewCard,
    momentPop,
    buddyPop,
    musicBtn,
    sfxBtn,
    endlessPop,
    huntPop,
    dailyPop,
    matchPop,
    updatePop,
    gearPick,
    gearView,
    cgChip
  };
})();
