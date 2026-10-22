// Landgang: kleine Abenteuer zum Durchklicken, am Ende ein echter Bosskampf mit der Stammcrew.
// Läuft komplett außerhalb der Runs (Math.random, eigener Seed für den Kampf, kein Run-RNG).
// Ablauf: Liste -> Einleitung -> 3 Szenen -> Anlauf auf den Boss -> Bosskampf (Kampffeld wie im Duell) -> Beute.
// Jede Szene bringt Beute und einen Vorteil oder einen Nachteil für den Bosskampf.
// GL.dungeon.act(name, data, profile) gibt das HTML für das Fenster zurück (null = schließen),
// GL.dungeon.after() startet nach dem Einfügen die Kampf-Animation.
window.GL = window.GL || {};

(function () {
  const STEPS = 3;            // Szenen vor dem Anlauf (Erkundung); Expedition hat 5
  const DEEP = { steps: 5, hp: 1.22, atk: 1.15, loot: 1.6 };   // Expedition: länger, härter, bessere Beute
  const MAXLVL = 12;
  const NS = () => (cur && cur.nSteps) || STEPS;
  let cur = null;             // laufende Erkundung
  const T = s => (GL.i18n && GL.i18n.t ? GL.i18n.t(s) : s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const D = () => GL.data;
  const today = () => (GL.meta.dayKey ? GL.meta.dayKey() : new Date().toISOString().slice(0, 10));
  // Bosskampf: Leben = Angriff der Crew x Runden, Angriff = Leben der Crew / (Runden x K). Ergibt ca. 9 Runden.
  const BOSS = { rounds: 14, k: 1.55, perSea: 0.08, atkPerSea: 0.05 };
  // Vorteile/Nachteile aus den Szenen
  const FX = {
    bossHp:  { good: true, v: -0.07, txt: 'Boss startet geschwächt' },
    bossHp2: { good: true, v: -0.14, txt: 'Boss stark geschwächt' },
    atk:     { good: true, v: 0.1, txt: 'Crew motiviert: mehr Angriff' },
    heal:    { good: true, v: 0.1, txt: 'Crew gestärkt: mehr Leben' },
    hurt:    { good: false, v: -0.12, txt: 'Crew startet angeschlagen' },
    bossAtk: { good: false, v: 0.08, txt: 'Boss ist gewarnt: mehr Angriff' },
    bossAtk2:{ good: false, v: 0.12, txt: 'Boss ist wütend: mehr Angriff' }
  };
  const goodFx = { b: 'bossHp', s: 'atk', g: 'bossHp', h: 'heal' };
  // FUN: Raum-Bedingung für den ganzen Landgang (gilt im Bosskampf, nutzt die Kampf-Launen der Engine)
  const MODS = [
    { id: 'dark', w: 'nebel', ico: '🌑', name: 'Dunkle Gänge', txt: 'Alle verfehlen öfter. Fackeln sind aus, Ausreden auch.' },
    { id: 'flood', w: 'glitsch', ico: '🌊', name: 'Flut im Gang', txt: 'Nasse Planken: Wer zuerst dran ist, entscheidet das Glück.' },
    { id: 'narrow', w: 'duell', ico: '⛓', name: 'Enge Gänge', txt: 'Kein Platz zum Ausweichen: Die Stärksten beharken sich.' },
    { id: 'powder', w: 'pulver', ico: '🧨', name: 'Pulverkammer', txt: 'In Runde 2 knallt es vorne. Auf beiden Seiten.' },
    { id: 'gold', w: 'jubel', ico: '✨', name: 'Schatzfieber', txt: 'Gold in der Luft: Deine Crew trifft härter.' }
  ];
  // FUN: Türen zwischen den Szenen. Links meist sicher, rechts meist riskant.
  const DOORS = {
    puzzle:   { ico: '❔', name: 'Rätselraum', txt: 'Eine Szene wie gewohnt' },
    rest:     { ico: '✚', name: 'Rastplatz', txt: 'Wunden flicken, Laune heben' },
    treasure: { ico: '🎁', name: 'Schatzkammer', txt: 'Ein Relikt für diesen Landgang' },
    elite:    { ico: '⚔', name: 'Elite-Wache', txt: 'Kampf. Sieg: Relikt und Beute' },
    trap:     { ico: '⚠', name: 'Fallengang', txt: '50:50 – große Beute oder blaue Flecken' }
  };
  // FUN: Landgang-Relikte (gelten bis zum Ende dieses Landgangs)
  const RELICS = [
    { id: 'rum', ico: '🍺', name: 'Rumfass', txt: '+12 % Angriff im Bosskampf', atk: 0.12 },
    { id: 'bandage', ico: '🩹', name: 'Verbandskiste', txt: '+15 % Leben im Bosskampf', hp: 0.15 },
    { id: 'compass', ico: '🧭', name: 'Alter Kompass', txt: '+1 Tempo für alle', spd: 1 },
    { id: 'powder', ico: '🧨', name: 'Pulverhorn', txt: 'Boss startet mit −10 % Leben', bossHp: -0.1 },
    { id: 'mirror', ico: '🪞', name: 'Spiegelschild', txt: 'Boss −8 % Angriff', bossAtk: -0.08 },
    { id: 'coin', ico: '🪙', name: 'Glücksmünze', txt: '+10 % Krit für alle', crit: 0.1 },
    { id: 'lantern', ico: '🏮', name: 'Sturmlaterne', txt: 'Hebt die Raum-Bedingung auf', nomod: true }
  ];
  const relicById = id => RELICS.find(r => r.id === id);
  // NEXT: Endgegner-Mechanik und Kampfplan
  const EN = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const mechOf = d => (D().dungeonMechs || {})[d && d.id] || null;
  function planHtml() {
    const d = cur.d, mm = mechOf(d), P = D().dungeonPlans || {};
    if (!cur.planOpts) {
      const others = Object.keys(P).filter(k => k !== mm.counter).sort(() => Math.random() - 0.5).slice(0, 2);
      cur.planOpts = [mm.counter].concat(others).sort(() => Math.random() - 0.5);
    }
    const m = pick(cur.crew);
    return card(`${scene(d, { boss: true })}
      <div class="dg-head"><span class="fpop-kicker">${esc(T('Kampfplan'))}</span>${dots()}</div>
      <p class="dg-mech big"><i>${mm.ico}</i><span><b>${esc(EN() ? mm.en : mm.name)}</b><small>${esc(EN() ? mm.tEn : mm.txt)}</small></span></p>
      ${bubble(m, EN() ? 'Captain, how do we handle this?' : 'Käpt’n, wie gehen wir das an?')}
      <div class="dg-plans">${cur.planOpts.map(k => `<button class="dg-plan" data-act="dg-plan" data-v="${k}"><i>${P[k].ico}</i><span><b>${esc(EN() ? P[k].en : P[k].name)}</b><small>${esc(EN() ? P[k].tEn : P[k].txt)}</small></span></button>`).join('')}</div>`, 'is-boss');
  }

  // ---------- Profil ----------
  const state = (profile, id) => { profile.dungeons = profile.dungeons || {}; return (profile.dungeons[id] = profile.dungeons[id] || { clears: 0, day: null }); };
  const peek = (profile, id) => (profile.dungeons && profile.dungeons[id]) || { clears: 0, day: null };
  const fresh = (profile, id) => peek(profile, id).day !== today();
  function unlocked(profile, d) {
    const n = d.need || {};
    if (n.wins) return ((profile.stats && profile.stats.wins) || 0) >= n.wins;
    const seen = (profile.seen && profile.seen.islands) || [];
    return (n.isl || []).some(id => seen.includes(id));
  }
  GL.dungeonOpen = profile => (D().dungeons || []).some(d => unlocked(profile, d));
  GL.dungeonCount = profile => (D().dungeons || []).filter(d => unlocked(profile, d)).length;

  // ---------- Crew ----------
  function members(profile) {
    const ids = GL.meta.squadIds ? GL.meta.squadIds(profile) : ['ruffy', 'zorro', 'nami'];
    const list = ids.map(id => {
      if (id === 'self') {
        const s = GL.meta.selfDef ? GL.meta.selfDef(profile) : null;
        return s ? Object.assign({}, s, { id: 'self', name: profile.nickname || s.name || 'Kapitän' }) : null;
      }
      return D().crew.find(c => c.id === id) || null;
    }).filter(Boolean);
    return list.length ? list : ['ruffy', 'zorro', 'nami'].map(x => D().crew.find(c => c.id === x));
  }
  const fits = (m, k) => !!m && (m.type === k || m.role === k || m.faction === k);
  const sprite = m => (m ? `<i class="dg-spr">${GL.sprites.render(m)}</i>` : '');
  const nameOf = m => (m.id === 'self' ? m.name : T(m.name));
  function line(m, ctx) {
    const L = D().dungeonLines[m.id] || D().dungeonLinesRole[m.role] || D().dungeonLinesRole.kaempfer;
    const arr = L[ctx] || (D().dungeonLinesRole[m.role] || {})[ctx] || ['…'];
    return T(pick(arr));
  }
  function bubble(m, txt, cls) {
    if (!m) return '';
    return `<div class="dg-say${cls ? ' ' + cls : ''}">${sprite(m)}<span><b>${esc(nameOf(m))}</b>${esc(txt)}</span></div>`;
  }
  // Wer macht es? Die passende Figur, sonst irgendwer. Chance steigt mit passender Crew.
  function plan(c, crew) {
    const match = crew.filter(m => fits(m, c.k));
    const doer = match.length ? pick(match) : pick(crew);
    const chance = Math.min(0.9, c.p + (match.length ? 0.2 : 0) + 0.05 * Math.min(2, Math.max(0, match.length - 1)));
    return { doer: doer.id, chance };
  }
  const memberById = id => cur.crew.find(m => m.id === id) || cur.crew[0];

  // ---------- Kopfgrafik ----------
  function pix(art, pal) {
    let r = '';
    const rows = art.rows || art, c = art.c || pal;
    const w = Math.max(...rows.map(x => x.length));
    rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (c[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c[ch]}"/>`; }));
    return `<svg viewBox="0 0 ${w} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  }
  const findArt = f => pix(f.art, D().huntPal);
  const hashStr = t => { let h = 0; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  // Stufe eines Ortes: steigt mit jedem gemeisterten Landgang (max 8)
  function landgangLevel(profile, id) { return Math.min(MAXLVL, (peek(profile, id).clears || 0)); }
  function bossOf(d) {
    const X = D();
    return [].concat(X.hunted || [], X.bosses || [], X.crew || [], X.grunts || []).find(x => x.id === d.boss);
  }
  // Aktive Raum-Bedingung (die Sturmlaterne hebt sie auf)
  const modOf = () => (cur && cur.mod && !(cur.relics || []).includes('lantern') ? cur.mod : null);
  function fxChips() {
    if (!cur) return '';
    const m = modOf(), R = (cur.relics || []).map(relicById).filter(Boolean);
    if (!cur.fx.length && !m && !R.length) return '';
    return `<span class="dg-fx">${m ? `<i class="mod" title="${esc(T(m.name) + ': ' + T(m.txt))}">${m.ico}</i>` : ''}${R.map(r => `<i class="rel" title="${esc(T(r.name) + ': ' + T(r.txt))}">${r.ico}</i>`).join('')}${cur.fx.map(k => `<i class="${FX[k].good ? 'up' : 'down'}" title="${esc(T(FX[k].txt))}">${FX[k].good ? '▲' : '▼'}</i>`).join('')}</span>`;
  }
  function scene(d, opts) {
    const o = opts || {};
    const crew = (cur ? cur.crew : []).slice(0, 5).map((m, i) => `<i class="dg-mate m${i}">${GL.sprites.render(m)}</i>`).join('');
    const boss = o.boss ? `<i class="dg-boss">${GL.sprites.render(bossOf(d))}</i>` : '';
    return `<div class="dg-scene${o.boss ? ' boss' : ''}" style="--sky:${d.scene.sky};--ground:${d.scene.ground}">
      <span class="dg-deco">${pix(d.scene.deco)}</span>${boss}
      <span class="dg-crew">${crew}</span>${fxChips()}
    </div>`;
  }
  function dots() {
    const n = NS() + 2;   // Szenen, Anlauf, Kampf
    return `<span class="dg-dots">${Array.from({ length: n }, (_, i) => `<i class="${i < cur.i ? 'done' : i === cur.i ? 'now' : ''}${i >= n - 2 ? ' boss' : ''}"></i>`).join('')}</span>`;
  }
  const card = (inner, cls) => `<div class="fpop-card dg-card${cls ? ' ' + cls : ''}" role="dialog">${inner}</div>`;

  // ---------- Beute ----------
  function give(kind, big) {
    const d = cur.d, s = d.sea || 0, L = cur.loot, full = cur.fresh;
    const berry = n => { const v = Math.max(5, Math.round(n * (full ? 1 : 0.2) * (cur.deep ? DEEP.loot : 1))); L.berry += v; return `+${v} Berry`; };
    if (kind === 'b') return berry((big ? 90 : 22) + (big ? 55 : 14) * s + Math.floor(Math.random() * 12));
    if (kind === 's') { if (!full) return berry(15 + 8 * s); L.shards += 1; return T('+1 Meersplitter'); }
    if (kind === 'h') { L.berry += 5; return '+5 Berry'; }
    if (kind === 'g') {
      if (!full || !GL.cgear) return berry(30 + 15 * s);
      if (!big && Math.random() > 0.45) return berry(30 + 15 * s);
      const ep = (big ? 0.22 : 0.08) + (cur.deep ? 0.15 : 0) + 0.02 * Math.min(10, landgangLevel(cur.profile, d.id));
      const it = GL.cgear.roll({ r: Math.random() < ep ? 2 : 1, name: d.name, seaName: d.name, sea: s + (cur.deep ? 1 : 0) });
      L.gear.push(it);
      return T('Ausrüstung gefunden!');
    }
    return '';
  }

  // KONTOR: schon erkundete Orte mit Bernstein auffrischen (noch einmal volle Beute)
  function amberRow(profile) {
    if (!GL.kontor || !GL.meta.featureOpen(profile, 'kontor')) return '';
    const k = GL.kontor.state(profile), c = GL.kontor.K.refresh;
    const done = (D().dungeons || []).filter(d => unlocked(profile, d) && !fresh(profile, d.id) && !(GL.seekarte && !GL.seekarte.allowed(profile, d.id)));
    if (!done.length) return '';
    return `<div class="dg-amber"><small>🟧 ${k.amber} ${esc(T('Bernstein'))} · ${esc(T('Auffrischen'))} (${c}):</small>${done.map(d => `<button class="btn mini ghost" data-act="dg-amber" data-v="${d.id}"${k.amber >= c ? '' : ' disabled'}>${esc(T(d.name))}</button>`).join('')}</div>`;
  }
  // ---------- Bildschirme ----------
  function listHtml(profile) {
    const crew = members(profile);
    const rows = (D().dungeons || []).map(d => {
      const open0 = unlocked(profile, d), st = peek(profile, d.id), fr = fresh(profile, d.id);
      const hid = open0 && GL.seekarte && !GL.seekarte.allowed(profile, d.id), open = open0 && !hid;   // DUNGEON-SUCHE: erst auf der Seekarte finden
      const has = (profile.dgFinds || []).includes(d.find.id);
      const status = hid ? `🧭 ${esc(T('Noch auf der Seekarte versteckt'))}` : !open ? `🔒 ${esc(T(d.needText))}` : fr ? `<em class="dg-fresh">${esc(T('Heute volle Beute'))}</em>` : esc(T('Schon erkundet: kleine Beute'));
      return `<button class="dg-row${open ? '' : ' locked'}" ${open ? `data-act="dg-start" data-v="${d.id}"` : 'disabled'}>
        <span class="dg-mini" style="--sky:${d.scene.sky};--ground:${d.scene.ground}">${pix(d.scene.deco)}</span>
        <span class="dg-rt"><b>${esc(T(d.name))}</b><small>${status}</small></span>
        <span class="dg-find${has ? '' : ' sil'}" title="${esc(has ? T(d.find.name) : T('Fundstück noch nicht gefunden'))}">${findArt(d.find)}</span>
        ${st.clears ? `<span class="dg-clears" title="${esc(T('Gemeistert'))}">${st.clears}× · ${esc(T('St.'))} ${Math.min(MAXLVL, st.clears) + 1}</span>` : ''}
      </button>`;
    }).join('');
    const nf = (profile.dgFinds || []).length;
    return card(`<span class="fpop-kicker">${esc(T('Landgang'))}</span>
      <h3>${esc(T('Wohin geht es heute?'))}</h3>
      <p class="dg-sub">${esc(T('Kurz erkunden, dann gegen den Boss des Ortes kämpfen. Deine Stammcrew kämpft mit. Die erste Erkundung pro Tag bringt die volle Beute.'))}</p>
      ${GL.dliga ? GL.dliga.panelHtml(profile) : ''}
      <div class="dg-with"><small>${esc(T('Mit dabei'))}</small>${crew.slice(0, 6).map(sprite).join('')}</div>
      <div class="dg-list">${rows}</div>
      ${amberRow(profile)}
      <p class="dg-sub small">${esc(T('Fundstücke'))}: ${nf}/${(D().dungeons || []).length}</p>
      <div class="fpop-btns">${GL.skUi ? `<button class="btn" data-act="sk-open">🧭 ${esc(T('Zur Seekarte'))}</button>` : ''}<button class="btn ghost" data-act="pop-close">${esc(T('Schließen'))}</button></div>`, 'dg-listcard');   // DUNGEON-SUCHE: Knopf zur Seekarte
  }
  // ---------- Werte-Vergleich (Boss gegen dein Team) ----------
  // Kleine Pixel-Symbole (7x7) für die Werte-Kacheln
  const IC = {
    hp:   ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...', '.......'],
    atk:  ['......#', '.....#.', '#...#..', '.#.#...', '..#....', '.#.#...', '#......'],
    spd:  ['...##..', '..##...', '.#####.', '...##..', '..##...', '.##....', '.......'],
    heal: ['..###..', '..###..', '#######', '#######', '#######', '..###..', '..###..'],
    def:  ['#######', '#######', '#######', '.#####.', '.#####.', '..###..', '...#...'],
    aoe:  ['#..#..#', '.#.#.#.', '..###..', '###.###', '..###..', '.#.#.#.', '#..#..#'],
    chain:['##.....', '.##....', '..##...', '...##..', '....##.', '.....##', '......#'],
    single:['...#...', '..###..', '.#####.', '#######', '...#...', '...#...', '...#...'],
    drain:['..#....', '.###...', '#####..', '.###...', '..#.#..', '....##.', '.....#.'],
    thorns:['#..#..#', '.#####.', '#######', '.#####.', '#######', '.#####.', '#..#..#'],
    revive:['..###..', '.#...#.', '.#...#.', '..###..', '...#...', '.#####.', '...#...']
  };
  const ICOL = { hp: '#e05a5a', atk: '#8a5a34', spd: '#3f86b8', heal: '#4f9a5a', def: '#7a6c57', aoe: '#d9783a', chain: '#c9a43a', single: '#8a55c8', drain: '#b0405a', thorns: '#5f7a3a', revive: '#8f6fd1' };
  function ico(k) {
    const rows = IC[k] || IC.single, c = ICOL[k] || '#7a6c57';
    let r = ''; rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch === '#') r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`; }));
    return `<svg class="dg-ico" viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  }
  const TAGNAME = { aoe: 'Flächenschaden', chain: 'Kettenschaden', single: 'Einzelziel', drain: 'Saugt Leben', thorns: 'Stacheln', revive: 'Steht wieder auf' };
  // Teamwerte aus den Stammcrew-Refs
  function teamStats(profile, refs) {
    const me = refs || GL.meta.squadRefs(profile);
    const n = me.length || 1;
    const weakest = me.slice().sort((a, b) => a.max - b.max)[0] || null;
    return {
      n, hp: me.reduce((s, r) => s + r.max, 0), atk: me.reduce((s, r) => s + r.atk, 0),
      spd: Math.round(me.reduce((s, r) => s + r.spd, 0) / n * 10) / 10,
      heal: me.reduce((s, r) => s + ((r.gb && r.gb.regen) || 0), 0),
      armor: me.reduce((s, r) => s + ((r.gb && r.gb.armor) || 0), 0),
      dodge: Math.round(me.reduce((s, r) => s + ((r.gb && r.gb.dodge) || 0), 0) / n * 100),
      weakest
    };
  }
  // Vorschau: Boss-Werte, Team-Werte und ein paar ehrliche Sätze dazu
  function bossPreview(profile, d, deep) {
    const S = fightSetup(profile, d, { deep: !!deep });
    if (!S) return null;
    const tm = teamStats(profile, S.me), b = S.boss, sp = S.special;
    const minHp = S.minions.reduce((s, m) => s + m.max, 0), minAtk = S.minions.reduce((s, m) => s + m.atk, 0);
    const bossHit = b.atk * (sp && sp.kind === 'double' ? 2 : 1);
    const perRound = Math.max(1, bossHit + minAtk + (sp && sp.tag === 'aoe' ? Math.round(b.atk * sp.power) * Math.max(0, tm.n - 1) : 0) - tm.heal - tm.armor * 2);
    const youNeed = Math.ceil((b.max * (sp && sp.kind === 'revive' ? 1 + sp.power : 1) + minHp) / Math.max(1, tm.atk * 1.3));   // 1.3: Krits, Ultis und Teamwork grob eingerechnet
    const heNeeds = Math.ceil(tm.hp / perRound);
    const say = [];
    if (youNeed <= heNeeds * 0.7) say.push(['good', 'Auf dem Papier gewinnt ihr bequem. Papier lügt manchmal.']);
    else if (youNeed <= heNeeds) say.push(['mid', 'Knapp, aber machbar. Gute Laune einpacken.']);
    else say.push(['bad', 'Rechnerisch verliert ihr. Kluge Entscheidungen unterwegs schwächen ihn.']);
    if (sp && sp.tag === 'aoe' && tm.weakest) {
      const hits = Math.max(1, Math.floor(tm.weakest.max / Math.max(1, Math.round(b.atk * sp.power))));
      say.push(hits <= 5 ? ['bad', `Flächenschaden: ${tm.weakest.id === 'self' ? (profile.nickname || 'Du') : T(tm.weakest.name)} hält nur etwa ${hits} Spritzer aus.`] : ['good', 'Dein Team steckt Flächenschaden gut weg.']);
    }
    if (sp && sp.tag === 'drain') say.push(tm.heal ? ['mid', 'Er heilt sich, ihr zum Glück auch.'] : ['bad', 'Er heilt sich, ihr nicht. Mehr Angriff oder Heil-Ausrüstung hilft.']);
    if (sp && sp.tag === 'thorns') say.push(['mid', 'Stacheln: Wer oft zuschlägt, tut sich selbst weh. Wenige harte Schläge sind besser.']);
    if (sp && sp.tag === 'revive') say.push(['mid', 'Er steht einmal wieder auf. Puste für Runde zwei einplanen.']);
    if (sp && sp.tag === 'chain') say.push(['mid', 'Seine Treffer springen weiter. Viel Leben in der ganzen Crew hilft.']);
    if (sp && sp.tag === 'single') say.push(tm.weakest && tm.weakest.max < bossHit * 3 ? ['bad', 'Er schlägt doppelt auf ein Ziel. Wer wenig Leben hat, liegt schnell.'] : ['good', 'Seine Doppelschläge tun weh, aber euer Vordermann hält das aus.']);
    if (b.spd > tm.spd + 0.5) say.push(['mid', 'Er ist schneller als ihr und schlägt zuerst.']);
    else if (tm.spd > b.spd + 0.5) say.push(['good', 'Ihr seid schneller und habt den ersten Schlag.']);
    if (S.minions.length) say.push(['mid', `Mit ${S.minions.length} ${S.minions.length === 1 ? 'Scherge' : 'Schergen'}. Die halten auch mal den Kopf hin.`]);
    return { boss: b, team: tm, special: sp, minions: S.minions, youNeed, heNeeds, say: say.slice(0, 4), lvl: S.lvl };
  }
  function tile(k, v, lbl) { return `<span class="dg-st">${ico(k)}<b>${esc(String(v))}</b><small>${esc(T(lbl))}</small></span>`; }
  function statsHtml(profile, d, deep) {
    const P = bossPreview(profile, d, deep);
    if (!P) return '';
    const b = P.boss, tm = P.team, sp = P.special, def = bossOf(d);
    const verdict = P.youNeed <= P.heNeeds * 0.7 ? 'good' : P.youNeed <= P.heNeeds ? 'mid' : 'bad';
    return `<div class="dg-vs">
      <div class="dg-side foe"><span class="dg-side-h"><i class="dg-side-spr">${GL.sprites.render(def)}</i><b>${esc(T(def.name))}</b>${P.minions.length ? `<em>+${P.minions.length}</em>` : ''}</span>
        <span class="dg-tiles">${tile('hp', b.max, 'Leben')}${tile('atk', b.atk, 'Angriff')}${tile('spd', b.spd, 'Tempo')}</span>
        ${sp ? `<span class="dg-spec">${ico(sp.tag)}<span><b>${esc(T(sp.name))}</b><small>${esc(T(TAGNAME[sp.tag] || ''))} · ${esc(T(sp.text))}</small></span></span>` : ''}
      </div>
      <div class="dg-meter ${verdict}" title="${esc(T('Geschätzte Runden'))}"><span><b>${P.youNeed}</b><small>${esc(T('Runden bis er fällt'))}</small></span><i>vs</i><span><b>${P.heNeeds}</b><small>${esc(T('Runden, die ihr durchhaltet'))}</small></span></div>
      <div class="dg-side mine"><span class="dg-side-h"><b>${esc(T('Dein Team'))}</b><em>${tm.n}</em></span>
        <span class="dg-tiles">${tile('hp', tm.hp, 'Leben')}${tile('atk', tm.atk, 'Schaden/Runde')}${tile('spd', tm.spd, 'Tempo')}${tile('heal', tm.heal, 'Heilung')}${tile('def', tm.armor, 'Rüstung')}</span>
      </div>
      <ul class="dg-say">${P.say.map(([c, s]) => `<li class="${c}"><i></i>${esc(T(s))}</li>`).join('')}</ul>
    </div>`;
  }
  function depthHtml(profile, d) {
    const can = (peek(profile, d.id).clears || 0) >= 1;
    return `<div class="dg-depth" role="group" aria-label="${esc(T('Wie tief?'))}">
      <button class="dg-dep${cur.deep ? '' : ' on'}" data-act="dg-depth" data-v="0"><b>${esc(T('Erkundung'))}</b><small>${STEPS} ${esc(T('Räume'))}</small></button>
      <button class="dg-dep deep${cur.deep ? ' on' : ''}" data-act="dg-depth" data-v="1"${can ? '' : ' disabled'}><b>${esc(T('Expedition'))}</b><small>${can ? `${DEEP.steps} ${esc(T('Räume · härter · bessere Beute'))}` : esc(T('Erst einmal meistern'))}</small></button>
    </div>`;
  }
  function introHtml() {
    const d = cur.d, m = pick(cur.crew);
    return card(`${scene(d)}
      <span class="fpop-kicker">${esc(T('Landgang'))}${cur.fresh ? '' : ' · ' + esc(T('kleine Beute'))}</span>
      <h3>${esc(T(d.name))}</h3>
      ${(() => { const lv = landgangLevel(cur.profile, d.id); return lv ? `<p class="dg-lvl"><b>${esc(T('Stufe'))} ${lv + 1}</b> · ${esc(T('Gegner'))} +${lv * 7} %${lv >= 1 ? ` · ${esc(T('mit Gefolge'))}` : ''}</p>` : ''; })()}
      <p class="dg-text">${esc(T(d.intro))}</p>
      ${mechOf(d) ? (mm => `<p class="dg-mech"><i>${mm.ico}</i><span><b>${esc(EN() ? mm.en : mm.name)}</b><small>${esc(EN() ? mm.tEn : mm.txt)}</small><em>💡 ${esc(EN() ? mm.cEn : mm.crack)}</em></span></p>`)(mechOf(d)) : ''}
      ${cur.mod ? `<p class="dg-mod"><i>${cur.mod.ico}</i><span><b>${esc(T(cur.mod.name))}</b><small>${esc(T(cur.mod.txt))}</small></span></p>` : ''}
      ${depthHtml(cur.profile, d)}
      ${statsHtml(cur.profile, d, cur.deep)}
      ${bubble(m, line(m, 'go'))}
      <!-- Platz für den Gemeinschafts-Landgang (Fork P): GL.coop.dungeonSlot(d, profile) liefert HTML -->
      <div class="dg-coop-slot" data-dg="${esc(d.id)}">${GL.coop && GL.coop.dungeonSlot ? GL.coop.dungeonSlot(d, cur.profile) : ''}</div>
      <div class="fpop-btns"><button class="btn" data-act="dg-go">${esc(T('Los geht’s'))}</button><button class="btn ghost" data-act="${GL.skUi ? 'sk-open' : 'dg-list'}">${esc(T('Zurück'))}</button></div>`);   // DUNGEON-SUCHE
  }
  function choiceBtn(c, i) {
    const p = cur.plans[i], m = memberById(p.doer), f = fits(m, c.k);
    const hint = p.chance >= 0.65 ? ['good', T('gute Chance')] : p.chance >= 0.48 ? ['mid', T('könnte klappen')] : ['risk', T('riskant')];
    return `<button class="dg-choice" data-act="dg-pick" data-i="${i}">
      ${sprite(m)}<span><b>${esc(T(c.l))}</b><small>${esc(nameOf(m))}${f ? ' ★' : ''}</small></span>
      <em class="dg-odds ${hint[0]}">${esc(hint[1])}</em></button>`;
  }
  // Szene oder Anlauf auf den Boss (cur.i === STEPS)
  function stepHtml() {
    const d = cur.d, boss = cur.i >= NS();
    const st = boss ? { t: d.bossText, c: d.bossC } : cur.steps[cur.i];
    if (!cur.plans) cur.plans = st.c.map(c => plan(c, cur.crew));
    const m = boss ? pick(cur.crew) : null;
    return card(`${scene(d, { boss })}
      <div class="dg-head"><span class="fpop-kicker">${boss ? esc(T('Anlauf auf den Boss')) : esc(T(d.name))}</span>${dots()}</div>
      <p class="dg-text">${esc(T(st.t))}</p>
      ${boss ? bubble(m, line(m, 'boss')) : ''}
      <div class="dg-choices">${st.c.map(choiceBtn).join('')}</div>`, boss ? 'is-boss' : '');
  }
  function outcomeHtml() {
    const o = cur.last, m = memberById(o.doer);
    const txt = T(o.ok ? o.c.ok : o.c.no).replace(/\{who\}/g, nameOf(m));
    const fx = FX[o.fx];
    return card(`${scene(cur.d, { boss: o.boss })}
      <div class="dg-head"><span class="fpop-kicker">${o.ok ? esc(T('Geschafft!')) : esc(T('Pech gehabt'))}</span>${dots()}</div>
      <p class="dg-text dg-res ${o.ok ? 'ok' : 'no'}"><i class="dg-badge">${o.ok ? '✓' : '✗'}</i>${esc(txt)}</p>
      <p class="dg-gain">${o.gain ? esc(o.gain) + ' · ' : ''}<span class="${fx.good ? 'up' : 'down'}">${fx.good ? '▲' : '▼'} ${esc(T(fx.txt))}</span></p>
      ${bubble(m, line(m, o.ok ? 'ok' : 'no'))}
      <div class="fpop-btns"><button class="btn" data-act="dg-next">${o.boss ? '⚔ ' + esc(T('Zum Kampf')) : esc(T('Weiter'))}</button></div>`);
  }

  // ---------- FUN: Türen, Elite-Wache, Relikte ----------
  function rollDoors() {
    const safe = ['puzzle', 'puzzle', 'rest', 'treasure'], risky = ['elite', 'elite', 'trap'];
    let a = pick(safe), b = pick(risky);
    if (a === 'treasure' && Math.random() < 0.5) a = 'puzzle';
    return [a, b];
  }
  function doorsHtml() {
    cur.doors = cur.doors && cur.doors.step === cur.i ? cur.doors : { step: cur.i, list: rollDoors() };
    const m = pick(cur.crew);
    const lines = { elite: 'Da drin klappert Rüstung. Viel Rüstung.', trap: 'Der Boden in dem Gang sieht verdächtig sauber aus.', rest: 'Hinter der linken Tür riecht es nach Suppe.', puzzle: 'Links steht „Bitte nicht klopfen“. Also klopfen wir.', treasure: 'Links glitzert etwas. Rechts auch, aber anders.' };
    return card(`${scene(cur.d)}
      <div class="dg-head"><span class="fpop-kicker">${esc(T('Zwei Türen'))}</span>${dots()}</div>
      <div class="dg-doors">${cur.doors.list.map((k, i) => { const D0 = DOORS[k]; return `<button class="dg-door d-${k}" data-act="dg-door" data-i="${i}"><i class="dg-door-ico">${D0.ico}</i><b>${esc(T(D0.name))}</b><small>${esc(T(D0.txt))}</small></button>`; }).join('')}</div>
      ${bubble(m, T(lines[cur.doors.list[1]] || lines.puzzle))}`, 'dg-doorcard');
  }
  function doorPick(i) {
    if (!cur.doors || cur.doors.step !== cur.i) return stepHtml();
    const k = cur.doors.list[i];
    if (!k) return doorsHtml();
    cur.doors.step = -1;
    if (k === 'puzzle') { cur.plans = null; return stepHtml(); }
    const m = pick(cur.crew);
    let txt = '', gain = '', good = true, relics = false;
    if (k === 'rest') {
      const bad = cur.fx.findIndex(x => !FX[x].good);
      if (bad >= 0) { cur.fx.splice(bad, 1); txt = T('Die Crew flickt sich zusammen. Ein Nachteil ist vergessen.'); }
      else { cur.fx.push('heal'); txt = T('Suppe, Pause, ein Lied. Die Crew startet gestärkt in den Bosskampf.'); }
      gain = give('h', false);
    } else if (k === 'treasure') {
      txt = T('Eine Kiste voller Krimskrams. Eins davon ist nützlich. Welches?');
      relics = true;
    } else if (k === 'trap') {
      const helps = cur.crew.some(c => c.type === 'technik' || c.role === 'helfer');
      if (Math.random() < 0.5 + (helps ? 0.15 : 0)) { gain = give('g', false); cur.fx.push('bossHp'); txt = T('Die Falle schnappt ins Leere. Dahinter: ein Vorrat, den der Boss sicher vermissen wird.'); }
      else { cur.fx.push('hurt'); good = false; txt = T('Die Falle schnappt nicht ins Leere. Die Crew humpelt weiter.'); }
    } else if (k === 'elite') {
      const r = eliteFight();
      if (r.win) { gain = give('b', false); txt = T('Die Elite-Wache liegt am Boden.') + ' ' + T('Runden') + ': ' + r.rounds + '. ' + T('Sie hatte etwas dabei.'); relics = true; }
      else { cur.fx.push('hurt'); good = false; txt = T('Die Elite-Wache war zu viel. Rückzug in den nächsten Gang, mit Beulen.'); }
    }
    cur.last = { door: k, step: cur.i };
    if (relics) cur.relicOffer = { step: cur.i, list: RELICS.filter(x => !(cur.relics || []).includes(x.id) && !(x.nomod && !cur.mod)).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.id) };
    return card(`${scene(cur.d)}
      <div class="dg-head"><span class="fpop-kicker">${DOORS[k].ico} ${esc(T(DOORS[k].name))}</span>${dots()}</div>
      <p class="dg-text dg-res ${good ? 'ok' : 'no'}"><i class="dg-badge">${good ? '✓' : '✗'}</i>${esc(txt)}</p>
      ${gain ? `<p class="dg-gain">${esc(gain)}</p>` : ''}
      ${relics ? relicChoiceHtml() : `${bubble(m, line(m, good ? 'ok' : 'no'))}<div class="fpop-btns"><button class="btn" data-act="dg-next">${esc(T('Weiter'))}</button></div>`}`);
  }
  function relicChoiceHtml() {
    const o = cur.relicOffer;
    if (!o || !o.list.length) return `<div class="fpop-btns"><button class="btn" data-act="dg-next">${esc(T('Weiter'))}</button></div>`;
    return `<p class="dg-kick2">${esc(T('Wähle ein Relikt (gilt bis zum Ende dieses Landgangs)'))}</p>
      <div class="dg-relics">${o.list.map(id => { const r = relicById(id); return `<button class="dg-relic" data-act="dg-relic" data-v="${r.id}"><i>${r.ico}</i><b>${esc(T(r.name))}</b><small>${esc(T(r.txt))}</small></button>`; }).join('')}</div>`;
  }
  function relicPick(id) {
    const o = cur.relicOffer;
    if (!o || o.step !== cur.i || !o.list.includes(id)) return null;
    cur.relics = (cur.relics || []).concat(id);
    cur.relicOffer = null;
    const r = relicById(id), m = pick(cur.crew);
    return card(`${scene(cur.d)}
      <div class="dg-head"><span class="fpop-kicker">${esc(T('Relikt eingepackt'))}</span>${dots()}</div>
      <p class="dg-text dg-res ok"><i class="dg-badge">${r.ico}</i><b>${esc(T(r.name))}</b> · ${esc(T(r.txt))}</p>
      ${bubble(m, line(m, 'ok'))}
      <div class="fpop-btns"><button class="btn" data-act="dg-next">${esc(T('Weiter'))}</button></div>`);
  }
  // Elite-Wache: kurzer Kampf ohne Animation (gleiche Kampfregeln wie beim Boss, aber kleiner)
  function eliteFight() {
    const S = fightSetup(cur.profile, cur.d, { fx: cur.fx, deep: cur.deep, relics: cur.relics });
    if (!S) return { win: false, rounds: 0 };
    const X = D(), pool = (X.grunts || []).filter(g => !g.art || g.monster || true);
    const g = pool[Math.floor(Math.random() * pool.length)] || {};
    const e = { id: g.id || 'thug', name: T('Elite-Wache'), type: g.type || 'kraft', hp: Math.round(S.boss.max * 0.3), max: Math.round(S.boss.max * 0.3), atk: Math.max(2, Math.round(S.boss.atk * 0.75)), spd: S.boss.spd, mini: true };
    const run = { rng: ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0) || 1, crew: S.me, relics: [], arts: [], items: [], crit: 0, bounties: 0, captain: S.me[0].id, mod: { atk: 0, hp: 0, spd: 0 } };
    const res = GL.battle.simulate(run, S.me.map(r => Object.assign({}, r)), [e], 'elite', { weather: modOf() ? modOf().w : null });
    return { win: res.win, rounds: res.events.reduce((m, ev) => (ev.k === 'round' && ev.n > m ? ev.n : m), 0) };
  }

  // ---------- Bosskampf ----------
  // Kampf-Aufbau ohne Anzeige (auch für Vorschau und Gemeinschafts-Landgang nutzbar):
  //   fightSetup(profile, d, { fx: [...], deep: bool, lvl: n, me: [Crew-Refs] }) -> { me, boss, minions, special }
  function fightSetup(profile, d, opts) {
    const o = opts || {}, sea = d.sea || 0, fxl = o.fx || [];
    const has = k => fxl.filter(x => x === k).length;
    const RL = (o.relics || []).map(relicById).filter(Boolean);
    const rsum = k => RL.reduce((a, r) => a + (r[k] || 0), 0);
    const me = (o.me || GL.meta.squadRefs(profile)).map(r => {
      const x = Object.assign({}, r);
      if (x.id === 'self') { x.ability = 'rally'; x.power = r.rally || 1; }
      x.max = Math.round(x.max * (1 + FX.heal.v * has('heal') + rsum('hp')));
      x.atk = Math.round(x.atk * (1 + FX.atk.v * has('atk') + rsum('atk')));
      if (rsum('spd')) x.spd = (x.spd || 0) + rsum('spd');
      if (rsum('crit')) x.gb = Object.assign({}, x.gb || {}, { crit: ((x.gb && x.gb.crit) || 0) + rsum('crit') });
      x.hp = Math.max(1, Math.round(x.max * (1 + FX.hurt.v * has('hurt'))));
      return x;
    });
    if (!me.length) return null;
    const def = bossOf(d);
    const sumAtk = me.reduce((s, r) => s + r.atk, 0), sumHp = me.reduce((s, r) => s + r.max, 0);
    const hpCut = 1 + FX.bossHp.v * has('bossHp') + FX.bossHp2.v * has('bossHp2') + rsum('bossHp');
    const atkUp = 1 + FX.bossAtk.v * has('bossAtk') + FX.bossAtk2.v * has('bossAtk2') + rsum('bossAtk');
    const max = Math.round(sumAtk / (1 + FX.atk.v * has('atk') + rsum('atk')) * BOSS.rounds * (1 + BOSS.perSea * sea) * hpCut);
    // Wiederholte Landgänge werden schwerer und abwechslungsreicher: Stufe pro Sieg, ab Stufe 1 Gefolge
    const lvl = o.lvl != null ? o.lvl : landgangLevel(profile, d.id), mult = 1 + 0.07 * lvl;
    const nMin = lvl >= 8 ? 3 : lvl >= 4 ? 2 : lvl >= 1 ? 1 : 0;
    const sp = (D().dungeonSpecials || {})[d.id] || null;
    const spCut = sp ? ({ drain: 0.96, thorns: 0.85, revive: 0.8, single: 0.86 }[sp.tag] || 0.9) : 1;   // Spezialangriff macht ihn gefährlich, dafür etwas weniger Masse
    const dh = o.deep ? DEEP.hp : 1, da = o.deep ? DEEP.atk : 1;
    const boss = { id: def.id, name: def.name, type: def.type, boss: true, hp: Math.round(max * mult * dh * spCut * (1 - 0.12 * Math.min(2, nMin))), max: Math.round(max * mult * dh * spCut * (1 - 0.12 * Math.min(2, nMin))),
      atk: Math.max(3, Math.round(sumHp / (BOSS.rounds * BOSS.k) * (1 + BOSS.atkPerSea * sea) * atkUp * mult * da * (sp && sp.kind === 'double' ? 0.53 : spCut) * (1 - 0.1 * Math.min(2, nMin)))),   // Doppelschläger: zwei Treffer, jeder schwächer
      spd: Math.round(me.reduce((s, r) => s + r.spd, 0) / me.length) + (lvl >= 6 ? 1 : 0) };
    if (sp) { boss.ability = sp.kind; boss.power = sp.power; }
    const X = D(), pool = [].concat((X.hunted || []).filter(h => d.alt && h.island === d.alt), X.grunts || []);
    const minions = Array.from({ length: nMin }, (_, k) => {
      const g = pool[(hashStr(d.id) + lvl * 3 + k * 5) % pool.length];
      const mm = Math.round(boss.max * 0.26), ma = Math.max(2, Math.round(boss.atk * 0.45));
      return { id: g.id, name: g.name, type: g.type, hp: mm, max: mm, atk: ma, spd: Math.max(1, boss.spd - 1), look: g.look };
    });
    return { me, boss, minions, special: sp, lvl, def };
  }
  function buildFight(profile) {
    const d = cur.d, sea = d.sea || 0, X = D();
    const S = fightSetup(profile, d, { fx: cur.fx, deep: cur.deep, relics: cur.relics });
    if (!S) return null;
    const { me, boss, lvl, def } = S;
    let minions = S.minions;
    const mm = mechOf(d);
    if (mm && mm.id === 'drummer') minions = [{ id: 'thug', name: EN() ? 'Drummer' : 'Trommler', type: 'technik', hp: Math.round(boss.max * 0.16), max: Math.round(boss.max * 0.16), atk: Math.max(2, Math.round(boss.atk * 0.3)), spd: Math.max(1, boss.spd - 2), drummer: true }].concat(minions);
    if (mm && mm.id === 'larvae') minions = minions.concat([0, 1].map(k => ({ id: 'thug', name: EN() ? 'Helper' : 'Gehilfe', type: 'klinge', hp: Math.round(boss.max * 0.06), max: Math.round(boss.max * 0.06), atk: Math.max(2, Math.round(boss.atk * 0.2)), spd: boss.spd, larva: true })));
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const run = { rng: seed || 1, crew: me, relics: [], arts: [], items: [], crit: 0, bounties: 0, captain: me[0].id, mod: { atk: 0, hp: 0, spd: 0 } };
    // Startwerte merken, bevor die Simulation die Leben verändert (sonst startet die Anzeige mit dem Endstand)
    const startHp = me.map(r => r.hp), bossMax = boss.max;
    const foes = [boss].concat(minions);
    // C3: Kapitänsbefehle auch im Landgang. Gleicher Seed + gleiche Startwerte = gleicher Verlauf bis zum Befehl.
    const meStart = JSON.stringify(me), foesStart = JSON.stringify(foes);
    const opts = { weather: modOf() ? modOf().w : null, mech: mm ? { id: mm.id, plan: cur.plan || null, countered: cur.plan === mm.counter } : null, turns: true, cmds: [], burst: GL.battle.burstKind ? GL.battle.burstKind(me) : 'strike' };
    const sim = cmds => GL.battle.simulate(Object.assign({}, run, { rng: seed || 1, crew: JSON.parse(meStart) }), JSON.parse(meStart), JSON.parse(foesStart), 'boss', Object.assign({}, opts, { cmds: cmds.slice() }));
    const res = sim([]);
    const per = GL.config.stepsPerIsland || 8;
    const dRun = { step: sea * per, seed: 1, alt: d.alt ? { [sea]: true } : {}, captain: me[0].id,
      crew: me.map(r => Object.assign({}, r, { def: r.id === 'self' ? { id: 'self', name: r.name, look: r.look, type: r.type } : null })),
      battle: { kind: 'boss', events: res.events, shown: false, enemies: [Object.assign({}, boss, { def })].concat(minions.map(m => Object.assign({}, m, { def: X.grunts.find(g => g.id === m.id) || (X.hunted || []).find(h => h.id === m.id) }))), enemyEnd: foes.map(() => 0) } };
    return { res, dRun, me, boss: Object.assign({}, boss, { hp: bossMax, max: bossMax }), minions, lvl, i: 0, fast: false, timer: null, startHp, sim, cmds: [], turn: 0, rc: { rally: 0, guard: 0, burst: 0 }, burst: opts.burst };
  }
  function fightHtml() {
    const f = cur.fight, d = cur.d;
    return card(`<div class="dg-head"><span class="fpop-kicker">⚔ ${esc(T('Bosskampf'))} · ${esc(T(d.name))}</span>${fxChips()}</div>
      <div class="dg-arena">${GL.arena.html(f.dRun, { crewHp: f.startHp, enemyHp: [f.boss.max].concat((f.minions || []).map(m => m.max)), done: false })}</div>
      <div class="dg-live"><span id="dg-log">${esc(T('Der Kampf beginnt!'))}</span><button class="btn mini ghost" data-act="dg-fast">${esc(T('Schneller'))}</button></div>
      ${cmdBar(f)}`, 'dg-fightcard');
  }
  // Kapitänsbefehle im Landgang: dieselben drei Knöpfe wie im Run
  const CMD_IDS = ['rally', 'guard', 'burst'];
  function cmdBar(f) {
    const en = EN(), bk = f.burst || 'strike';
    const BK = { strike: ['💥', en ? 'Broadside' : 'Breitseite'], wall: ['💥', en ? 'Broadside' : 'Breitseite'], mend: ['💚', en ? 'Patch-up' : 'Flickpause'], stun: ['💫', en ? 'Feint' : 'Finte'] }[bk] || ['💥', en ? 'Broadside' : 'Breitseite'];
    const B = [['rally', '📣', en ? 'Charge' : 'Angriff'], ['guard', '🛡', en ? 'Shield wall' : 'Schildwall'], ['burst', BK[0], BK[1]]];
    const C = dgCharge();
    return `<div class="rc-bar dg-rc" role="group" aria-label="${en ? 'Captain orders' : 'Kapitänsbefehle'}">${B.map(([c, i, t]) => {
      const p = Math.min(1, (f.rc[c] || 0) / (C[c] || 6)), full = !f.done && p >= 1;
      return `<button class="rc-btn${full ? ' full' : ''}" data-act="dg-cmd" data-c="${c}"${full ? '' : ' disabled'} style="--p:${p.toFixed(3)}"><i class="rc-ico">${i}</i><b>${esc(t)}</b><span class="rc-fill" aria-hidden="true"></span></button>`;
    }).join('')}</div>`;
  }
  // Landgang-Kämpfe dauern länger als Run-Kämpfe: Befehle laden hier doppelt so lange
  function dgCharge() { const C = (GL.config.runCmds || {}).charge || { rally: 4, guard: 6, burst: 9 }, out = {}; CMD_IDS.forEach(k => { out[k] = (C[k] || 6) * 2; }); return out; }
  function cmdRefresh(f) {
    const C = dgCharge();
    CMD_IDS.forEach(k => {
      const b = document.querySelector(`.dg-rc .rc-btn[data-c="${k}"]`); if (!b) return;
      const p = Math.min(1, (f.rc[k] || 0) / (C[k] || 6));
      b.style.setProperty('--p', p.toFixed(3)); b.classList.toggle('full', p >= 1 && !f.done); b.disabled = !(p >= 1 && !f.done);
    });
  }
  function cmdUse(k) {
    const f = cur && cur.fight, C = dgCharge();
    if (!f || f.done || !CMD_IDS.includes(k) || (f.rc[k] || 0) < (C[k] || 6)) return;
    f.cmds.push({ at: f.turn + 1, cmd: k });
    try { f.res = f.sim(f.cmds); } catch (e) { f.cmds.pop(); return; }
    f.rc[k] = 0; cmdRefresh(f);
    const b = document.querySelector(`.dg-rc .rc-btn[data-c="${k}"]`); if (b) { b.classList.add('used'); setTimeout(() => b.classList.remove('used'), 500); }
  }
  function say(m, txt) {
    const box = document.getElementById('dg-log');
    if (!box) return;
    box.innerHTML = m ? `${sprite(m)}<span><b>${esc(nameOf(m))}</b> ${esc(txt)}</span>` : esc(txt);
    box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  }
  // Kurze Sätze an Wendepunkten: Wut, letzter Akt, K.o., Ulti
  const DRAMA = {
    rage: ['Oh nein, er wird wütend!', 'Jetzt wird es ernst!', 'Vorsicht, er dreht auf!'],
    final: ['Gleich haben wir ihn!', 'Nicht nachlassen!', 'Letzter Akt! Durchhalten!'],
    ko: ['Nein! Steh auf!', 'Das war knapp…', 'Wir schaffen das auch so!'],
    low: ['Das wird knapp!', 'Oh nee… knapp!', 'Halte durch!']
  };
  function playStep() {
    const f = cur && cur.fight;
    if (!f || f.done) return;
    if (!document.getElementById('dg-log')) { f.done = true; endFight(true); return; }   // Fenster geschlossen: still auflösen
    const ev = f.res.events[f.i++];
    if (!ev) { f.done = true; cmdRefresh(f); f.timer = setTimeout(() => endFight(false), 1100); return; }
    if (ev.k === 'turn') { f.turn = ev.t; CMD_IDS.forEach(k => { f.rc[k] = (f.rc[k] || 0) + 1; }); cmdRefresh(f); f.timer = setTimeout(playStep, 0); return; }
    try { GL.arena.play(ev); } catch (e) { /* nur Anzeige */ }
    const crewM = () => pick(cur.crew);
    if (ev.k === 'plan' && ev.plan === 'mech') say(null, (EN() && ev.en) ? ev.en : ev.text);
    else if (ev.k === 'rage' && ev.side === 'enemy') say(crewM(), T(pick(ev.phase === 3 ? DRAMA.final : DRAMA.rage)));
    else if (ev.k === 'ult') say(null, `⚡ ${T(ev.name || '')}!`);
    else if (ev.k === 'hit' && ev.side === 'enemy' && ev.hp === 0) {
      const down = f.me[ev.to]; const left = f.dRun.crew.length;
      f.downs = (f.downs || 0) + 1;
      say(crewM(), T(pick(f.downs >= left - 1 ? DRAMA.low : DRAMA.ko)) + (down ? ` (${down.id === 'self' ? down.name : T(down.name)} k.o.)` : ''));
    }
    const base = ev.k === 'round' ? 120 : ev.k === 'ult' ? 1100 : ev.k === 'rage' || ev.k === 'duo' ? 1300 : ev.k === 'hit' ? 520 + (ev.crit && !ev.miss ? 70 : 0) : 760;
    f.timer = setTimeout(playStep, base * (f.fast ? 0.35 : 1));
  }
  function endFight(silent) {
    const f = cur.fight, win = f.res.win;
    cur.won = win;
    const profile = cur.profile;
    if (win) { give('b', true); give('g', true); if (cur.deep && cur.fresh) give('g', true); }
    else { const s = cur.d.sea || 0; cur.loot.berry = Math.round(cur.loot.berry * 0.5) + Math.round((10 + 5 * s) * (cur.fresh ? 1 : 0.2)); cur.loot.gear = []; }
    const html = finish(profile);
    const box = document.getElementById('fpop');
    if (!silent && box && box.dataset.dg) { box.innerHTML = html; box.scrollTop = 0; }
    if (GL.dungeon.onSave) GL.dungeon.onSave();
  }

  function endHtml() {
    const L = cur.loot, d = cur.d, m = pick(cur.crew);
    const items = [];
    if (L.berry) items.push(`<li>${GL.sprites.coin()}<b>+${L.berry}</b> Berry</li>`);
    if (L.shards) items.push(`<li><i class="dg-shard">🔹</i><b>+${L.shards}</b> ${esc(T('Meersplitter'))}</li>`);
    L.gear.forEach(it => items.push(`<li><i class="dg-gear r${it.r}">⚙</i><b>${esc(GL.cgear && GL.cgear.name ? GL.cgear.name(it) : T('Ausrüstung'))}</b></li>`));
    if (L.snack) items.push(`<li><i class="dg-heart">🍙</i><b>+1</b> ${esc(T('Proviant zum Verschenken'))}</li>`);
        if (L.bond && L.bond.gain) items.push(`<li><i class="dg-heart">♥</i><b>+${L.bond.gain}</b> ${esc(T('Vertrautheit für die Stammcrew'))}${L.bond.ups.length ? ` · ${esc(L.bond.ups.join(', '))} ♥` : ''}</li>`);
    if (L.find) items.push(`<li class="dg-findrow"><span class="dg-find big">${findArt(d.find)}</span><span><b>${esc(T(d.find.name))}</b><small>${esc(T(d.find.text))}</small></span></li>`);
    const def = bossOf(d);
    return card(`${scene(d, { boss: !cur.won })}
      <span class="fpop-kicker">${cur.won ? esc(T('Sieg! Zurück an Bord')) : esc(T('Knapp verloren'))}</span>
      <h3>${cur.won ? esc(T(def.name)) + ' ' + esc(T('besiegt')) : esc(T('Rückzug zum Schiff'))}</h3>
      <ul class="dg-loot">${items.join('') || `<li>${esc(T('Diesmal nur schöne Erinnerungen.'))}</li>`}</ul>
      ${L.find ? `<p class="dg-gain">${esc(T('Neues Fundstück für deine Sammlung!'))}</p>` : ''}
      ${L.dl && GL.dliga ? GL.dliga.resultHtml(L.dl) : ''}
      ${bubble(m, cur.won ? line(m, 'end') : line(m, 'no'))}
      ${cur.won ? '' : `<p class="dg-text small">${esc(T('Tipp: Gute Entscheidungen vorher schwächen den Boss. Passende Figuren haben bessere Chancen.'))}</p>`}
      <div class="fpop-btns"><button class="btn" data-act="dg-start" data-v="${d.id}">${esc(T('Nochmal'))}</button><button class="btn ghost" data-act="${GL.skUi ? 'sk-open' : 'dg-list'}">${esc(T(GL.skUi ? 'Zur Seekarte' : 'Andere Orte'))}</button></div>`);   // DUNGEON-SUCHE
  }

  // ---------- Ablauf ----------
  function start(profile, id) {
    const d = (D().dungeons || []).find(x => x.id === id);
    if (!d || !unlocked(profile, d) || (GL.seekarte && !GL.seekarte.allowed(profile, d.id))) return null;   // DUNGEON-SUCHE
    stop();
    const pool = (d.steps || []).concat(D().dungeonSteps || []);
    const steps = [];
    const own = (d.steps || []).slice();
    if (own.length) steps.push(own.splice(Math.floor(Math.random() * own.length), 1)[0]);
    const rest = pool.filter(s => !steps.includes(s));
    while (steps.length < DEEP.steps && rest.length) steps.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
    cur = { d, steps, i: 0, nSteps: STEPS, deep: false, crew: members(profile), fresh: fresh(profile, d.id), loot: { berry: 0, shards: 0, gear: [], find: null }, fx: [], plans: null, last: null, won: false, profile,
      mod: Math.random() < 0.7 ? pick(MODS) : null, relics: [], doors: null, relicOffer: null };
    return introHtml();
  }
  function choose(i) {
    const boss = cur.i >= NS();
    const st = boss ? { c: cur.d.bossC } : cur.steps[cur.i];
    const c = st.c[i], p = cur.plans && cur.plans[i];
    if (!c || !p || cur.last && cur.last.step === cur.i) return stepHtml();
    const ok = Math.random() < p.chance;
    let gain = '', fx;
    if (ok) { gain = boss ? '' : give(c.r, false); fx = boss ? 'bossHp2' : goodFx[c.r] || 'bossHp'; }
    else fx = boss ? 'bossAtk2' : pick(['hurt', 'bossAtk']);
    cur.fx.push(fx);
    cur.last = { c, ok, doer: p.doer, gain, boss, fx, step: cur.i };
    return outcomeHtml();
  }
  function finish(profile) {
    const d = cur.d, L = cur.loot, st = state(profile, d.id);
    profile.dgFinds = profile.dgFinds || [];
    if (cur.won && cur.fresh && !profile.dgFinds.includes(d.find.id) && Math.random() < 0.3 + 0.1 * Math.min(4, st.clears || 0)) {
      profile.dgFinds.push(d.find.id); L.find = d.find.id;
    }
    profile.berry = (profile.berry || 0) + L.berry;
    profile.shards = (profile.shards || 0) + L.shards;
    if (L.gear.length && GL.cgear) { const B = GL.cgear.bag(profile); L.gear.forEach(it => B.push(it)); profile.gearNew = (profile.gearNew || []).concat(L.gear.map(x => x.uid)); }
    // Dungeon-Liga: bester Lauf pro Ort/Stufe/Tiefe zählt, dazu Marken (js/ui/dliga.js)
    if (cur.won && GL.dliga && cur.fight && cur.fight.res) {
      const res = cur.fight.res, me = cur.fight.me || [];
      const rounds = res.events.reduce((m, e) => (e.k === 'round' && e.n > m ? e.n : m), 0) || 12;
      // Leben am Ende aus den Ereignissen nachrechnen (wie die Kampfanzeige)
      const hp = (cur.fight.startHp || me.map(r => r.hp)).slice();
      res.events.forEach(ev => {
        if (ev.k === 'hit') { if (ev.side === 'enemy' && ev.hp !== undefined) hp[ev.to] = ev.hp; }
        else if (ev.list && ev.side === 'crew') ev.list.forEach(x => { if (x.hp !== undefined && x.to != null) hp[x.to] = x.hp; });
      });
      const maxSum = me.reduce((a, u) => a + (u.max || 0), 0), hpSum = hp.reduce((a, v) => a + Math.max(0, +v || 0), 0);
      try { L.dl = GL.dliga.record(profile, { win: true, id: d.id, sea: d.sea || 0, lvl: cur.fight.lvl || 0, deep: !!cur.deep, rounds, hpFrac: maxSum ? hpSum / maxSum : 0 }); } catch (e) { L.dl = null; }
    }
    if (cur.won) st.clears += 1;
    if (cur.won && cur.fresh) st.day = today();
    profile.counts = profile.counts || {};
    profile.counts.landgang = (profile.counts.landgang || 0) + 1;
    profile.snacks = (profile.snacks || 0) + 1; L.snack = 1;
    // Vertrautheit: die Stammcrew wächst auch beim Landgang zusammen (wie in Duellen und Runs)
    if (GL.meta.squadGainXp && cur.fight && cur.fight.me) {
      const x = GL.meta.squadGainXp(profile, cur.fight.me.map(r => r.id), cur.won);
      L.bond = x;
    }
    cur.done = true;
    return endHtml();
  }
  function stop() { if (cur && cur.fight && cur.fight.timer) clearTimeout(cur.fight.timer); }

  GL.dungeon = {
    dirty: false,
    onSave: null,
    // name = data-act, data = dataset
    act(name, data, profile) {
      this.dirty = false;
      this.pending = null;
      if (name === 'dg-open' || name === 'dg-list') { if (cur && cur.fight && !cur.fight.done) return null; stop(); cur = null; return listHtml(profile); }
      if (name === 'dg-start') return start(profile, data.v) || listHtml(profile);
      if (name === 'dg-amber') { if (GL.kontor && GL.kontor.refreshDungeon(profile, data.v)) this.dirty = true; return listHtml(profile); }
      if (!cur) return listHtml(profile);
      cur.profile = profile;
      if (name === 'dg-depth') { if (cur.i > 0 || cur.fight) return stepHtml(); const deep = data.v === '1' && (peek(profile, cur.d.id).clears || 0) >= 1; cur.deep = deep; cur.nSteps = deep ? DEEP.steps : STEPS; return introHtml(); }
      if (name === 'dg-go') { cur.i = 0; cur.plans = null; return stepHtml(); }
      if (name === 'dg-pick') return choose(Number(data.i));
      if (name === 'dg-fast') { if (cur.fight) { cur.fight.fast = !cur.fight.fast; } return undefined; }
      if (name === 'dg-cmd') { cmdUse(data.c); return undefined; }
      if (name === 'dg-next') {
        if (cur.done) return listHtml(profile);
        if (cur.last && cur.last.boss && mechOf(cur.d) && !cur.plan) return planHtml();
        if (cur.last && cur.last.boss) {
          cur.fight = buildFight(profile);
          if (!cur.fight) return listHtml(profile);
          cur.i = NS() + 1;
          this.pending = 'fight';
          return fightHtml();
        }
        cur.i += 1; cur.plans = null;
        // Zwischen den Szenen: zwei Türen (erste Szene ist immer die eigene des Ortes)
        if (cur.i >= 1 && cur.i < NS()) return doorsHtml();
        return stepHtml();
      }
      if (name === 'dg-plan') {
        const P = D().dungeonPlans || {};
        if (!cur.last || !cur.last.boss || !P[data.v]) return stepHtml();
        cur.plan = data.v;
        cur.fight = buildFight(profile);
        if (!cur.fight) return listHtml(profile);
        cur.i = NS() + 1;
        this.pending = 'fight';
        return fightHtml();
      }
      if (name === 'dg-door') return doorPick(Number(data.i));
      if (name === 'dg-relic') return relicPick(data.v) || stepHtml();
      return null;
    },
    // Nach dem Einfügen ins Fenster: Kampf starten
    after() {
      if (this.pending !== 'fight' || !cur || !cur.fight) return;
      this.pending = null;
      GL.arena.mounted(cur.fight.dRun);
      cur.fight.timer = setTimeout(playStep, 900);
    },
    // Popup wurde geschlossen (z. B. Esc): laufenden Kampf still beenden
    closed() { if (cur && cur.fight && !cur.fight.done) { stop(); cur.fight.done = true; endFight(true); } },
    open: GL.dungeonOpen,
    list: listHtml,
    // Für den Gemeinschafts-Landgang und Tests: Kampfaufbau, Teamwerte, Vorschau
    fightSetup, teamStats, bossPreview, specials: () => D().dungeonSpecials || {},
    _cfg: BOSS,
    _cur: () => cur
  };
})();
