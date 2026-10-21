// KAPERFAHRT: eigener kurzer Modus (Daten: js/data/kaperfahrt.js, Bilder: js/data/kfart.js).
// Läuft als Vollbild-Ebene über dem Hafen und speichert nur in profile.kf { name, deck, hold, flags, trips, wins, best }.
// Ablauf: Hafen (Deck einrichten) → 4 Stationen (Gerücht / Gefecht / Rast / Boss) → Beute 1 aus 3 → zurück in den Hafen.
// Gefechte laufen in Echtzeit (Ladebalken), einmal pro Rammstoß gibt es Konter-Tippen mit dem Ring.
window.GL = window.GL || {};

(function () {
  const EN = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const L = x => (Array.isArray(x) ? x[EN() ? 1 : 0] : x);
  const T = (de, en) => (EN() ? en : de);
  const D = () => GL.data.kaperfahrt;
  const IT = id => D().items[id];
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  let profile = null, onSave = null, onClose = null, root = null;
  let K = null;            // profile.kf
  let S = { scr: 'hafen', sel: null, from: null };
  let R = null, F = null, EV = null;

  // ---------- Bilder ----------
  function art(id) {
    const A = GL.kfArt && GL.kfArt.parts && GL.kfArt.parts[id];
    if (A) return GL.art.raw('kf:' + id, A.rows, A.w, A.rows.length, GL.kfArt.pal, 'kf-art' + (A.w > 16 ? ' w2' : ''));
    if (/^npc:/.test(id)) return GL.art.npc(id.slice(4));
    return GL.art.prop(id) || GL.art.icon(id) || '';
  }
  const rarTag = r => `<span class="kf-rar" style="background:${D().rar[r][2]}">${esc(L(D().rar[r]).toString())}</span>`;
  const rarName = r => (EN() ? D().rar[r][1] : D().rar[r][0]);

  // ---------- Speicher ----------
  function ensure() {
    const p = profile;
    let k = p.kf;
    if (!k || !Array.isArray(k.deck)) {
      let u = 1;
      const st = D().start;
      k = p.kf = { name: T('Möwenschreck', 'Gullfright'), uid: 1, deck: st.deck.map(([id, r, c]) => ({ uid: u++, id, r, c })), hold: st.hold.map(id => ({ uid: u++, id, r: -1, c: -1 })), flags: {}, trips: 0, wins: 0, best: 0 };
      k.uid = u;
    }
    // Aufräumen: unbekannte Teile raus, kaputte Positionen in den Laderaum
    k.deck = k.deck.filter(x => x && IT(x.id));
    k.hold = (k.hold || []).filter(x => x && IT(x.id)).slice(0, D().hold);
    k.flags = k.flags || {};
    const bad = k.deck.filter(x => !(x.r >= 0 && x.r < D().rows && x.c >= 0 && x.c + IT(x.id).w <= D().cols));
    bad.forEach(x => { k.deck = k.deck.filter(y => y !== x); x.r = -1; x.c = -1; if (k.hold.length < D().hold) k.hold.push(x); });
    K = k;
  }
  const save = () => { if (onSave) try { onSave(); } catch (e) { /* Speichern ist Komfort */ } };
  const mk = id => ({ uid: K.uid++, id, r: -1, c: -1 });

  // ---------- Deck-Logik ----------
  const cellsOf = it => Array.from({ length: IT(it.id).w }, (_, i) => [it.r, it.c + i]);
  function occ(except) { const m = {}; K.deck.forEach(it => { if (it.uid !== except) cellsOf(it).forEach(([r, c]) => { m[r + ',' + c] = it.uid; }); }); return m; }
  function fits(id, r, c, except) { const o = occ(except); for (let i = 0; i < IT(id).w; i++) { if (c + i >= D().cols || o[r + ',' + (c + i)]) return false; } return true; }
  function neighbors(it) {
    const mine = new Set(cellsOf(it).map(x => x.join(','))), out = [];
    K.deck.forEach(o => { if (o.uid !== it.uid && cellsOf(o).some(([r, c]) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(x => mine.has(x.join(','))))) out.push(o); });
    return out;
  }
  function bonus(it) {
    const nb = neighbors(it), d = IT(it.id), notes = [];
    let spd = 1, crit = d.crit || 0, sh = 0;
    const n = id => nb.filter(o => o.id === id).length;
    if ((it.id === 'kanone' || it.id === 'donner') && n('fass')) { spd += 0.35 * n('fass'); notes.push(T(`Pulverfass daneben: lädt ${35 * n('fass')} % schneller`, `Powder keg next to it: loads ${35 * n('fass')}% faster`)); }
    if (d.cd && n('kombuese') && it.id !== 'kombuese') { spd += 0.1; notes.push(T('Kombüse daneben: satte Crew, 10 % schneller', 'Galley next to it: fed crew, 10% faster')); }
    if (d.dmg && n('ausguck')) { crit += 0.25; notes.push(T('Ausguck daneben: 25 % kritische Treffer', 'Spyglass next to it: 25% critical hits')); }
    if (it.id === 'planke' && n('planke')) { sh = 3 * n('planke'); notes.push(T(`Planken stützen sich: +${sh} Schild`, `Planks support each other: +${sh} shield`)); }
    if (it.id === 'fass') { const c = nb.filter(o => o.id === 'kanone' || o.id === 'donner').length; notes.push(c ? T(`Treibt ${c} ${c === 1 ? 'Geschütz' : 'Geschütze'} an`, `Powers ${c} ${c === 1 ? 'gun' : 'guns'}`) : T('Noch keine Kanone daneben', 'No cannon next to it yet')); }
    if (it.id === 'ausguck') { const c = nb.filter(o => IT(o.id).dmg).length; notes.push(c ? T(`Zielt für ${c} ${c === 1 ? 'Waffe' : 'Waffen'}`, `Aims for ${c} ${c === 1 ? 'weapon' : 'weapons'}`) : T('Noch keine Waffe daneben', 'No weapon next to it yet')); }
    return { spd, crit, sh, notes };
  }
  const onDeck = id => K.deck.some(x => x.id === id);
  const find = u => K.deck.concat(K.hold).find(x => x.uid === u);

  // ---------- Bausteine ----------
  function tile(it, o) {
    o = o || {};
    const d = IT(it.id);
    const pos = o.grid ? ` style="grid-row:${it.r + 1};grid-column:${it.c + 1} / span ${d.w}"` : '';
    const tag = o.act ? 'button' : 'span';
    return `<${tag} class="kf-tile${d.w === 2 ? ' w2' : ''}${o.sel ? ' sel' : ''}${o.nb ? ' nb' : ''}${o.off ? ' off' : ''}" data-r="${d.rar}" data-uid="${it.uid}"${pos}${o.act ? ` data-kf="${o.act}"` : ''} aria-label="${esc(L(d.n))}"><i class="kf-pic">${art(it.id)}</i><span class="kf-nm">${esc(L(d.n))}</span>${o.bar ? '<span class="kf-bar"><i></i></span>' : ''}</${tag}>`;
  }
  function deckHtml(edit, fight) {
    const sel = edit && S.sel ? find(S.sel) : null;
    const nbs = sel && sel.r >= 0 ? neighbors(sel).map(x => x.uid) : [];
    const o = occ();
    let cells = '';
    for (let r = 0; r < D().rows; r++) for (let c = 0; c < D().cols; c++) if (!o[r + ',' + c]) {
      const can = sel && fits(sel.id, r, c, sel.uid);
      cells += edit ? `<button class="kf-cell${can ? ' can' : ''}" style="grid-row:${r + 1};grid-column:${c + 1}" data-kf="cell" data-r="${r}" data-c="${c}" aria-label="${T('Freies Feld', 'Empty slot')}"></button>`
        : `<span class="kf-cell" style="grid-row:${r + 1};grid-column:${c + 1}"></span>`;
    }
    const tiles = K.deck.map(it => tile(it, { grid: true, act: edit ? 'pick' : null, sel: sel && sel.uid === it.uid, nb: nbs.includes(it.uid), bar: fight && IT(it.id).cd, off: fight && R && R.cold && it.id === 'kombuese' })).join('');
    return `<div class="kf-ship"><div class="kf-deck">${cells}${tiles}</div></div>`;
  }
  function holdHtml() {
    return Array.from({ length: D().hold }, (_, i) => K.hold[i] ? tile(K.hold[i], { act: 'pick', sel: S.sel === K.hold[i].uid }) : `<button class="kf-cell" data-kf="holdslot" aria-label="${T('Leerer Platz im Laderaum', 'Empty hold slot')}"></button>`).join('');
  }
  function infoHtml() {
    const sel = S.sel ? find(S.sel) : null;
    if (!sel) return `<span class="kf-lbl">${T('Tipp', 'Tip')}</span><div>${T('Tippe ein Teil an, dann ein leuchtendes Feld. Was nebeneinander steht, hilft sich. Im Laderaum wirkt nichts.', 'Tap a part, then a glowing slot. Parts next to each other help each other. Nothing works from the hold.')}</div>`;
    const d = IT(sel.id), b = sel.r >= 0 ? bonus(sel) : { notes: [] };
    return `<div class="kf-nmb">${esc(L(d.n))} ${rarTag(d.rar)}</div><div>${esc(L(d.txt))}</div>${b.notes.map(n => `<div class="kf-note">${esc(n)}</div>`).join('')}
      <div class="kf-row">${sel.r >= 0 ? `<button class="btn mini ghost" data-kf="tohold">${T('In den Laderaum', 'To the hold')}</button>` : `<span class="kf-sub">${T('Tippe ein leuchtendes Feld auf dem Deck.', 'Tap a glowing slot on the deck.')}</span>`}</div>`;
  }
  function chips() {
    if (!R) return `<span class="kf-chip">${T('Fahrten', 'Voyages')} <b>${K.trips}</b></span>`;
    return `<span class="kf-chip">${T('Rumpf', 'Hull')} <b>${Math.max(0, Math.round(R.hull))}/${R.max}</b></span><span class="kf-chip">Gold <b>${R.gold}</b></span>`;
  }
  function frame(title, body, back) {
    root.innerHTML = `<div class="kf-in">
      <div class="kf-bar-top">${back !== false ? `<button class="room-back kf-back" data-kf="close" aria-label="${T('Zurück zum Hafen', 'Back to harbour')}">‹ <span>${T('Hafen', 'Harbour')}</span></button>` : '<span></span>'}<b class="kf-title">${title}</b><span class="kf-chips">${chips()}</span></div>
      ${body}</div>`;
  }

  // ---------- Hafen ----------
  function hafen() {
    S.scr = 'hafen';
    frame(T('Kaperfahrt', 'Raid voyage'), `<div class="kf-stack">
      <div class="kf-hero"><input id="kf-name" value="${esc(K.name)}" maxlength="22" aria-label="${T('Name deines Schiffs', 'Your ship’s name')}"><span class="kf-sub">${T('Richte dein Deck ein, leg ab, komm mit Beute zurück.', 'Set up your deck, set sail, come back with loot.')}</span></div>
      ${deckHtml(true)}
      <div class="kf-info">${infoHtml()}</div>
      <div><div class="kf-lbl">${T('Laderaum', 'Hold')}</div><div class="kf-hold">${holdHtml()}</div></div>
      <button class="btn big kf-go" data-kf="go">${T('Ablegen', 'Set sail')}</button>
      <p class="kf-sub kf-c">${T('4 Stationen · etwa 3 Minuten · Beute bleibt am Schiff', '4 stops · about 3 minutes · loot stays on your ship')}</p>
    </div>`);
    const nm = root.querySelector('#kf-name');
    if (nm) nm.addEventListener('change', () => { K.name = (GL.nameFilter && GL.nameFilter.clean ? GL.nameFilter.clean(nm.value) : nm.value).trim().slice(0, 22) || T('Möwenschreck', 'Gullfright'); save(); });
  }
  function arrange() {
    S.scr = 'arrange';
    const back = S.from === 'route';
    frame(T('Deck umstellen', 'Rearrange deck'), `<div class="kf-stack">
      ${deckHtml(true)}
      <div class="kf-info">${infoHtml()}</div>
      <div><div class="kf-lbl">${T('Laderaum', 'Hold')}</div><div class="kf-hold">${holdHtml()}</div></div>
      <button class="btn big" data-kf="${back ? 'back' : R.step >= 3 ? 'endnow' : 'next'}">${back ? T('Fertig', 'Done') : T('Weitersegeln', 'Sail on')}</button></div>`, false);
  }
  const redraw = () => (S.scr === 'arrange' ? arrange() : hafen());
  function pick(u) { S.sel = S.sel === u ? null : u; redraw(); }
  function placeAt(r, c) {
    const it = find(S.sel);
    if (!it || !fits(it.id, r, c, it.uid)) return;
    if (it.r < 0) { K.hold = K.hold.filter(x => x !== it); K.deck.push(it); }
    it.r = r; it.c = c; save(); redraw();
  }
  function toHold() {
    const it = K.deck.find(x => x.uid === S.sel);
    if (!it || K.hold.length >= D().hold) return;
    K.deck = K.deck.filter(x => x !== it); it.r = -1; it.c = -1; K.hold.push(it); save(); redraw();
  }

  // ---------- Route ----------
  function startTrip() {
    R = { step: 0, hull: D().hull, max: D().hull, gold: 0, karma: 0, moral: 0, cold: 0, boost: 0, bossCut: 0, loot: [], t0: Date.now(), seen: new Set(), parN: 0, parOk: 0 };
    S.sel = null; route();
  }
  function track() {
    return `<div class="kf-track" aria-label="${T('Station', 'Stop')} ${R.step + 1}/4">${D().route.map((_, i) => `${i ? '<span class="ln"></span>' : ''}<span class="dot${i < R.step ? ' done' : i === R.step ? ' now' : ''}${i === 3 ? ' boss' : ''}"></span>`).join('')}</div>`;
  }
  function route() {
    S.scr = 'route';
    const opts = D().route[R.step].map(k => {
      if (k === 'event') return `<button class="kf-opt" data-kf="opt" data-k="event"><i class="ic">${GL.art.icon('event')}</i><span><b>${T('Gerücht', 'Rumour')}</b><small>${T('Irgendwas treibt im Wasser. Eine Karte, zwei Entscheidungen, vielleicht ein Würfel.', 'Something drifts in the water. One card, two choices, maybe a die.')}</small></span></button>`;
      if (k === 'rest') return `<button class="kf-opt rest" data-kf="opt" data-k="rest"><i class="ic">${GL.art.icon('rast')}</i><span><b>${T('Bucht zum Ankern', 'Sheltered bay')}</b><small>${T('Die Crew flickt den Rumpf: +15. Langweilig, aber nass ist schlimmer.', 'The crew patches the hull: +15. Boring, but wet is worse.')}</small></span></button>`;
      const f = D().foes[k === 'boss' ? 'witwe' : k.split(':')[1]];
      return `<button class="kf-opt ${k === 'boss' ? 'boss' : 'fight'}" data-kf="opt" data-k="${k}"><i class="ic">${GL.art.icon(k === 'boss' ? 'boss' : 'kampf')}</i><span><b>${esc(L(f.n))}</b><small>${esc(L(f.who))}. ${T('Sieg bringt Gold und Beute.', 'Victory brings gold and loot.')}</small></span></button>`;
    }).join('');
    frame(esc(K.name), `<div class="kf-stack">${track()}
      <div><div class="kf-h">${R.step === 3 ? T('Die Nebelbank lichtet sich', 'The fog lifts') : T('Wohin segelst du?', 'Where to?')}</div><p class="kf-sub">${T('Station', 'Stop')} ${R.step + 1} ${T('von', 'of')} 4</p></div>
      <div class="kf-stack">${opts}</div>
      <button class="btn mini ghost kf-l" data-kf="arrange">${T('Deck umstellen', 'Rearrange deck')}</button></div>`, false);
  }
  function choose(k) {
    if (k === 'event') return eventCard();
    if (k === 'rest') { R.hull = Math.min(R.max, R.hull + 15); return next(); }
    startFight(k === 'boss' ? 'witwe' : k.split(':')[1]);
  }
  function next() { S.sel = null; R.step++; if (R.step >= D().route.length) return end(true); route(); }

  // ---------- Gerücht ----------
  function eventCard() {
    S.scr = 'event';
    const CB = D().callbacks;
    const cb = Object.keys(K.flags).find(f => K.flags[f] && CB[f] && !R.seen.has(CB[f].id));
    let e = cb ? CB[cb] : null;
    if (!e) { const pool = D().events.filter(x => !R.seen.has(x.id)); e = pool[Math.floor(Math.random() * pool.length)]; }
    R.seen.add(e.id); EV = { e, done: false };
    const par = onDeck('papagei');
    const ch = (k, side) => {
      const c = e[k], poor = c.cost && R.gold < c.cost;
      return `<button class="btn kf-choice${k === 'b' ? ' ghost' : ''}" data-kf="ans" data-k="${k}"${poor ? ' disabled' : ''}><span>${esc(L(c.l))}${c.cost ? ` · ${c.cost} Gold` : ''}</span>
        <small>${c.roll ? T(`Probe W20 ab ${c.roll.dc}`, `Roll d20, need ${c.roll.dc}`) : side}</small>${par ? `<em class="kf-parrot">Kiko: „${esc(L(c.hint))}!“</em>` : ''}</button>`;
    };
    frame(T('Gerücht', 'Rumour'), `<div class="kf-stack">${track()}
      <div class="kf-card" id="kf-card"><span class="tilt l">${esc(L(e.a.l))}</span><span class="tilt r">${esc(L(e.b.l))}</span>
        <div class="kf-who"><i class="face">${art(e.art)}</i><div><div class="kf-eb">${cb ? T('Kennt dich noch', 'Remembers you') : T('Begegnung', 'Encounter')}</div><div class="kf-h">${esc(L(e.who))}</div></div></div>
        <p class="kf-txt">${esc(L(e.t))}</p></div>
      <div class="kf-choices">${ch('a', T('nach links wischen', 'swipe left'))}${ch('b', T('nach rechts wischen', 'swipe right'))}</div>
      <div id="kf-res"></div></div>`, false);
    swipe(root.querySelector('#kf-card'));
  }
  function swipe(card) {
    let x0 = null, dx = 0;
    card.addEventListener('pointerdown', e => { if (EV.done) return; x0 = e.clientX; dx = 0; card.classList.add('drag'); try { card.setPointerCapture(e.pointerId); } catch (er) { /* egal */ } });
    card.addEventListener('pointermove', e => {
      if (x0 == null) return; dx = e.clientX - x0;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      card.querySelector('.tilt.l').style.opacity = dx < -30 ? 1 : 0; card.querySelector('.tilt.r').style.opacity = dx > 30 ? 1 : 0;
    });
    const up = () => {
      if (x0 == null) return; x0 = null; card.classList.remove('drag'); card.style.transform = '';
      card.querySelectorAll('.tilt').forEach(t => { t.style.opacity = 0; });
      if (Math.abs(dx) > 80) { const k = dx < 0 ? 'a' : 'b', c = EV.e[k]; if (!(c.cost && R.gold < c.cost)) answer(k); }
    };
    card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
  }
  function answer(k) {
    if (!EV || EV.done) return; EV.done = true;
    const c = EV.e[k];
    root.querySelectorAll('.kf-choice').forEach(b => { b.disabled = true; });
    if (c.cost) R.gold -= c.cost;
    const res = root.querySelector('#kf-res');
    if (!c.roll) { apply(c.res.fx); res.innerHTML = outcome(L(c.res.t)); return; }
    const mods = [];
    if (c.roll.spaeh && onDeck('ausguck')) mods.push([T('Ausguck', 'Spyglass'), 3]);
    if (onDeck('muenze')) mods.push([T('Glücksmünze', 'Lucky coin'), 2]);
    if (R.karma) { mods.push(['Karma', R.karma]); R.karma = 0; }
    const roll = 1 + Math.floor(Math.random() * 20), sum = roll + mods.reduce((a, m) => a + m[1], 0), ok = roll === 20 || (roll !== 1 && sum >= c.roll.dc);
    res.innerHTML = `<div class="kf-dice"><div class="kf-die roll" id="kf-die">?</div><div class="kf-calc" id="kf-calc">${T('Würfelt …', 'Rolling …')}</div></div>`;
    if (GL.sfx) GL.sfx.play('tap');
    const die = root.querySelector('#kf-die');
    let n = 0;
    const iv = setInterval(() => { if (!die.isConnected) return clearInterval(iv); die.textContent = 1 + Math.floor(Math.random() * 20); if (++n > 8) { clearInterval(iv); fin(); } }, 70);
    function fin() {
      die.textContent = roll; die.classList.remove('roll'); die.classList.add(ok ? 'ok' : 'no');
      if (GL.sfx) GL.sfx.play(ok ? 'coin' : 'miss');
      root.querySelector('#kf-calc').innerHTML = `${roll}${mods.map(m => ` + ${m[1]} ${esc(m[0])}`).join('')} = <b>${sum}</b> · ${T('gebraucht', 'needed')} ${c.roll.dc}<br><b class="${ok ? 'ok' : 'no'}">${roll === 20 ? T('Natürliche 20!', 'Natural 20!') : roll === 1 ? T('Natürliche 1 …', 'Natural 1 …') : ok ? T('Geschafft', 'Success') : T('Daneben', 'Failed')}</b>`;
      const o = ok ? c.ok : c.no; apply(o.fx);
      res.insertAdjacentHTML('beforeend', outcome(L(o.t)));
    }
  }
  const outcome = txt => `<div class="kf-stack kf-out"><p>${esc(txt)}</p><button class="btn big" data-kf="next">${T('Weitersegeln', 'Sail on')}</button></div>`;
  function apply(fx) {
    if (fx.gold) R.gold += fx.gold;
    if (fx.hull) R.hull = Math.max(1, Math.min(R.max, R.hull + fx.hull));
    if (fx.boost) R.boost += fx.boost;
    if (fx.karma) R.karma += fx.karma;
    if (fx.moral) R.moral += fx.moral;
    if (fx.cold) R.cold = 1;
    if (fx.bossCut) R.bossCut += fx.bossCut;
    if (fx.flag) K.flags[fx.flag] = 1;
    if (fx.unflag) delete K.flags[fx.unflag];
    if (fx.item) gain(fx.item);
    save();
    const c = root.querySelector('.kf-chips'); if (c) c.innerHTML = chips();
  }
  function gain(id) { if (K.hold.length >= D().hold) K.hold.shift(); K.hold.push(mk(id)); R.loot.push(id); save(); }

  // ---------- Gefecht ----------
  const $ = s => root.querySelector(s);
  function startFight(key) {
    S.scr = 'fight';
    const d = D().foes[key];
    const mine = K.deck.filter(it => IT(it.id).cd).map(it => { const b = bonus(it); return { uid: it.uid, def: IT(it.id), id: it.id, ch: 0, spd: Math.max(0.3, b.spd + R.moral), crit: b.crit, shB: b.sh, off: R.cold && it.id === 'kombuese' }; });
    const foeItems = d.items.map((id, i) => ({ uid: 'f' + i, id, def: IT(id), ch: Math.random() * 1.6, spd: 1, crit: 0, pow: d.pow }));
    F = { key, d, t: 0, over: false, paused: false, storm: 0, ramNext: d.ram.first, warned: false,
      me: { hull: R.hull, max: R.max, sh: 0, burn: 0, bAcc: 0, items: mine, kiko: onDeck('papagei') },
      foe: { hull: d.hull - (d.boss ? R.bossCut : 0), max: d.hull, sh: 0, burn: 0, bAcc: 0, items: foeItems, stun: 0 } };
    R.moral = 0;
    frame(T('Gefecht', 'Battle'), `<div class="kf-fight" id="kf-fight">
      <div class="kf-side foe" id="kf-foe"><div class="hd"><i class="kf-flag">${d.art === 'witwe_flagge' ? art('witwe_flagge') : (GL.sprites && GL.sprites.ship ? GL.sprites.ship() : '')}</i><b>${esc(L(d.n))}</b><span>${esc(L(d.who))}</span></div>
        <div class="kf-hp" id="kf-hpF"><i></i><em></em><s></s></div>
        <div class="kf-foerow">${foeItems.map(x => tile(x, { bar: true })).join('')}</div></div>
      <div class="kf-sea"><span class="msg" id="kf-msg"></span></div>
      <div class="kf-side me" id="kf-me"><div class="hd"><b>${esc(K.name)}</b><span id="kf-clock"></span></div>
        ${deckHtml(false, true)}
        <div class="kf-hp" id="kf-hpM"><i></i><em></em><s></s></div></div></div>`, false);
    msg(d.boss ? T('Die Witwe dreht bei!', 'The Widow turns to face you!') : T('Klar zum Gefecht!', 'Battle stations!'));
    draw();
    F.iv = setInterval(tick, 100);
  }
  function msg(t, ms) { const m = $('#kf-msg'); if (!m) return; m.textContent = t; clearTimeout(msg.tm); if (t) msg.tm = setTimeout(() => { if (m.isConnected) m.textContent = ''; }, ms || 1400); }
  function center(el) { const f = $('#kf-fight').getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2 - f.left), y: Math.round(r.top + r.height / 2 - f.top) }; }
  function float(el, text, cls) {
    const host = $('#kf-fight'); if (!el || !host) return;
    const p = center(el), n = document.createElement('span');
    n.className = 'kf-fl ' + (cls || ''); n.textContent = text; n.style.left = (p.x + Math.round(Math.random() * 24 - 12)) + 'px'; n.style.top = p.y + 'px';
    host.appendChild(n); setTimeout(() => n.remove(), 1000);
  }
  function shoot(a0, b0, big) {
    const host = $('#kf-fight'); if (!a0 || !b0 || !host) return;
    const a = center(a0), b = center(b0), s = document.createElement('span');
    s.className = 'kf-shot' + (big ? ' big' : ''); s.style.left = a.x + 'px'; s.style.top = a.y + 'px';
    host.appendChild(s); requestAnimationFrame(() => { s.style.transform = `translate(${b.x - a.x}px, ${b.y - a.y}px)`; });
    setTimeout(() => s.remove(), 300);
  }
  const tileEl = u => root.querySelector(`#kf-fight .kf-tile[data-uid="${u}"]`);
  function hit(side, dmg, cls) {
    const a = Math.min(side.sh, dmg); side.sh -= a; side.hull -= dmg - a;
    float(side === F.me ? $('#kf-hpM') : $('#kf-hpF'), a && dmg - a <= 0 ? T(`${dmg} geblockt`, `${dmg} blocked`) : '−' + dmg, cls);
  }
  function fire(src, tgt, it) {
    const d = it.def, mine = src === F.me, pow = it.pow || 1, el = tileEl(it.uid);
    if (el) { el.classList.remove('fire'); void el.offsetWidth; el.classList.add('fire'); }
    if (d.dmg) {
      if (!mine && F.me.kiko) { F.me.kiko = false; float($('#kf-hpM'), T('Kiko kreischt! Daneben', 'Kiko screeches! Miss'), 'sh'); return; }
      const crit = Math.random() < (it.crit || 0), dmg = Math.max(1, Math.round(d.dmg * pow * (crit ? 2 : 1)));
      shoot(el, mine ? $('#kf-hpF') : $('#kf-hpM'), d.dmg >= 10);
      if (GL.sfx) GL.sfx.play(crit ? 'crit' : 'hit');
      setTimeout(() => { if (F && !F.over) {
        hit(tgt, dmg, crit ? 'crit' : '');
        if (d.burn) tgt.burn += d.burn;
        if (d.slow) tgt.items.forEach(x => { x.ch = Math.max(0, x.ch - d.slow); });
      } }, 260);
      if (crit && it.id === 'donner') { it.ch = d.cd - 0.3; setTimeout(() => float(el, T('Nochmal!', 'Again!'), 'crit'), 200); }
    }
    if (d.sh) { const v = Math.round((d.sh + (it.shB || 0)) * pow); src.sh += v; float(mine ? $('#kf-hpM') : $('#kf-hpF'), `+${v} ${T('Schild', 'shield')}`, 'sh'); }
    if (d.heal) { const v = Math.round(d.heal * pow); src.hull = Math.min(src.max, src.hull + v); float(mine ? $('#kf-hpM') : $('#kf-hpF'), '+' + v, 'heal'); }
  }
  function tick() {
    if (!F || F.over || F.paused) return;
    if (!root || !root.isConnected || !$('#kf-fight')) { clearInterval(F.iv); return; }
    const dt = 0.1, ST = D().storm; F.t += dt;
    [[F.me, F.foe], [F.foe, F.me]].forEach(([s, o]) => {
      if (s === F.foe && s.stun > 0) return;
      s.items.forEach(it => { if (it.off) return; it.ch += dt * it.spd; if (it.ch >= it.def.cd) { it.ch -= it.def.cd; fire(s, o, it); } });
    });
    F.foe.stun = Math.max(0, F.foe.stun - dt);
    const fe = $('#kf-foe'); if (fe) fe.classList.toggle('wind', F.warned && F.foe.stun <= 0);
    [F.me, F.foe].forEach(s => { if (s.burn > 0) { s.burn -= dt; s.bAcc += dt; if (s.bAcc >= 1) { s.bAcc -= 1; hit(s, 1, 'big'); } } });
    if (F.t >= ST) { F.storm += dt; if (F.storm >= 1) { F.storm -= 1; const v = 1 + Math.floor((F.t - ST) / 4); hit(F.me, v, 'big'); hit(F.foe, v, 'big'); if (F.t < ST + 1.2) msg(T('Ein Sturm zieht auf!', 'A storm is coming!'), 1600); } }
    if (F.foe.stun <= 0 && !F.warned && F.t >= F.ramNext - 1.4) { F.warned = true; msg(F.d.boss ? T('Die Witwe holt zum Rammstoß aus!', 'The Widow winds up to ram!') : T('Sie holen zum Rammstoß aus!', 'They wind up to ram!'), 1400); if (GL.sfx) GL.sfx.play('status'); }
    if (F.t >= F.ramNext) { if (F.foe.stun > 0) F.ramNext += 1; else ring(); }
    draw();
    if (F.foe.hull <= 0 || F.me.hull <= 0) finish();
  }
  function draw() {
    const bar = (sel, s) => { const el = $(sel); if (!el) return; el.querySelector('i').style.width = (Math.max(0, s.hull) / s.max * 100) + '%'; el.querySelector('em').style.width = Math.min(100, s.sh / s.max * 100) + '%'; el.querySelector('s').textContent = `${Math.max(0, Math.ceil(s.hull))}${s.sh ? ` + ${Math.round(s.sh)}` : ''}`; };
    bar('#kf-hpM', F.me); bar('#kf-hpF', F.foe);
    F.me.items.concat(F.foe.items).forEach(it => { const el = tileEl(it.uid); const b = el && el.querySelector('.kf-bar i'); if (b) b.style.width = Math.min(100, it.ch / it.def.cd * 100) + '%'; });
    const c = $('#kf-clock'), ST = D().storm; if (c) c.innerHTML = F.t < ST ? T(`Sturm in ${Math.ceil(ST - F.t)} s`, `Storm in ${Math.ceil(ST - F.t)} s`) : `<b class="kf-storm">${T('Sturm!', 'Storm!')}</b>`;
  }
  // Konter-Tippen: wie im Run, Ring schließt sich in 0,9 s. Perfekt ±0,11 s, gut ±0,26 s.
  function ring() {
    F.paused = true; F.warned = false;
    const fe = $('#kf-foe'); if (fe) fe.classList.remove('wind');
    const host = $('#kf-fight'), ship = $('#kf-me .kf-ship'), p = center(ship);
    const w = document.createElement('div'); w.className = 'kf-ringwin';
    w.innerHTML = `<span class="ring" style="left:${p.x}px;top:${p.y}px"><i></i></span>${R.parN < 2 ? `<b>${T('Tippen, wenn sich der Ring schließt!', 'Tap when the ring closes!')}</b>` : ''}`;
    host.appendChild(w);
    const t0 = performance.now(); let over = false;
    const done = dt => {
      if (over) return; over = true; clearTimeout(tm); document.removeEventListener('keydown', key, true);
      w.classList.add('done'); setTimeout(() => w.remove(), 350);
      if (!F || F.over) return;
      const ad = dt == null ? null : Math.abs(dt), q = ad == null ? 0 : ad <= 110 ? 2 : ad <= 260 ? 1 : 0;
      if (dt != null) R.parN++;
      if (q) R.parOk++;
      const dmg = Math.round(F.d.ram.dmg * (q === 2 ? 0 : q === 1 ? 0.35 : 1));
      if (q === 2) { float(ship, T('Perfekte Parade!', 'Perfect parry!'), 'par'); F.foe.stun = 2.5; msg(T('Sie taumeln! Ladebalken stehen still', 'They stagger! Charge bars freeze'), 1800); if (GL.sfx) GL.sfx.play('crit'); }
      else if (q === 1) { float(ship, T('Abgefangen!', 'Caught it!'), 'heal'); hit(F.me, dmg, ''); if (GL.sfx) GL.sfx.play('block'); }
      else { if (dt != null) float(ship, T('Zu früh!', 'Too early!'), 'big'); hit(F.me, dmg, 'big'); host.classList.remove('shake'); void host.offsetWidth; host.classList.add('shake'); if (GL.sfx) GL.sfx.play('ko'); }
      F.ramNext = F.t + F.d.ram.every; F.paused = false;
    };
    const tap = e => { e.preventDefault(); e.stopPropagation(); done(performance.now() - t0 - 900); };
    const key = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(performance.now() - t0 - 900); } };
    w.addEventListener('pointerdown', tap); document.addEventListener('keydown', key, true);
    const tm = setTimeout(() => done(null), 900 + 260);
  }
  function finish() {
    F.over = true; clearInterval(F.iv); draw();
    const win = F.foe.hull <= 0 && F.me.hull > 0;
    msg(win ? (F.d.boss ? T('Die Witwe sinkt!', 'The Widow sinks!') : T('Versenkt!', 'Sunk!')) : T('Leck geschlagen …', 'Holed …'), 2000);
    if (GL.sfx) GL.sfx.play(win ? 'win' : 'lose');
    setTimeout(() => {
      if (!root || !root.isConnected) return;
      if (!win) return end(false);
      R.hull = Math.min(R.max, F.me.hull + 10);
      const g = F.d.gold + (onDeck('muenze') ? 5 : 0); R.gold += g;
      loot(!!F.d.boss, g);
    }, 1100);
  }

  // ---------- Beute ----------
  function roll3(boss) {
    const out = [], have = new Set(), all = Object.keys(D().items).map(id => Object.assign({ id }, IT(id)));
    for (let i = 0; i < 3; i++) {
      const r = Math.random();
      let rar = Math.min(3, (r < 0.55 ? 0 : r < 0.85 ? 1 : r < 0.97 ? 2 : 3) + R.boost + (boss ? 2 : 0));
      if (boss && i === 0 && Math.random() < 0.6) rar = 3;
      let pool = all.filter(x => x.rar === rar && !have.has(x.id));
      while (!pool.length && rar > 0) { rar--; pool = all.filter(x => x.rar === rar && !have.has(x.id)); }
      const it = pool[Math.floor(Math.random() * pool.length)]; have.add(it.id); out.push(it);
    }
    R.boost = 0;
    return out.sort((a, b) => b.rar - a.rar);
  }
  function loot(boss, g) {
    S.scr = 'loot';
    const Lt = roll3(boss);
    frame(T('Beute', 'Loot'), `<div class="kf-stack">
      <div class="kf-banner">${boss ? T('Die Witwe ist versenkt!', 'The Widow is sunk!') : T('Versenkt!', 'Sunk!')} +${g} Gold, ${T('die Crew flickt +10 Rumpf.', 'the crew patches +10 hull.')}</div>
      <div><div class="kf-h">${T('Nimm ein Teil mit', 'Take one part')}</div><p class="kf-sub">${T('Es kommt in den Laderaum. Danach kannst du umstellen.', 'It goes into the hold. You can rearrange next.')}</p></div>
      <div class="kf-loots">${Lt.map(x => `<button class="kf-loot${x.rar === 3 ? ' leg' : ''}" data-kf="take" data-id="${x.id}"><i class="kf-pic">${art(x.id)}</i><b>${esc(L(x.n))}</b>${rarTag(x.rar)}<small>${esc(L(x.txt))}</small></button>`).join('')}</div></div>`, false);
    if (Lt.some(x => x.rar === 3) && GL.sfx) GL.sfx.play('win');
  }
  function take(id) { S.from = null; gain(id); S.sel = K.hold[K.hold.length - 1].uid; if (R.step >= 3) return end(true); arrange(); }

  // ---------- Ende ----------
  function end(win) {
    S.scr = 'end'; S.sel = null;
    K.trips++; if (win) K.wins++;
    const s = Math.round((Date.now() - R.t0) / 1000);
    if (win && (!K.best || s < K.best)) K.best = s;
    save();
    const loot = R.loot.map((id, i) => tile({ uid: 'l' + i, id }, {})).join('');
    const pars = R.parN ? T(` Paraden: ${R.parOk}/${R.parN}.`, ` Parries: ${R.parOk}/${R.parN}.`) : '';
    frame(win ? T('Kaperfahrt geschafft', 'Voyage complete') : T('Leck geschlagen', 'Holed'), `<div class="kf-stack">
      <div class="kf-banner">${win ? T(`${esc(K.name)} kehrt nach ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} Minuten heim.`, `${esc(K.name)} returns home after ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} minutes.`) : T(`${esc(K.name)} schleppt sich in den Hafen. Die Beute bleibt an Bord.`, `${esc(K.name)} limps back to harbour. The loot stays on board.`)}${pars}</div>
      <div><div class="kf-lbl">${T('Mitgebracht', 'Brought home')}</div>${loot ? `<div class="kf-lootlist">${loot}</div>` : `<p class="kf-sub">${T('Diesmal nichts. Der Fischer winkt trotzdem.', 'Nothing this time. The fisherman waves anyway.')}</p>`}</div>
      <button class="btn big" data-kf="home">${T('Zurück an Deck', 'Back on deck')}</button></div>`, false);
    R = null;
  }

  // ---------- Klicks ----------
  function onClick(e) {
    const b = e.target.closest('[data-kf]'); if (!b || b.disabled) return;
    const a = b.dataset.kf;
    if (a === 'pick') pick(Number(b.dataset.uid));
    else if (a === 'cell') { if (S.sel) placeAt(Number(b.dataset.r), Number(b.dataset.c)); }
    else if (a === 'holdslot') { if (S.sel) toHold(); }
    else if (a === 'tohold') toHold();
    else if (a === 'go') startTrip();
    else if (a === 'opt') choose(b.dataset.k);
    else if (a === 'ans') answer(b.dataset.k);
    else if (a === 'next') next();
    else if (a === 'arrange') { S.from = 'route'; arrange(); }
    else if (a === 'back') { S.sel = null; S.from = null; route(); }
    else if (a === 'take') take(b.dataset.id);
    else if (a === 'endnow') end(true);
    else if (a === 'home') hafen();
    else if (a === 'close') close();
  }
  function close() {
    if (F && F.iv) clearInterval(F.iv);
    F = null; R = null;
    if (root) root.remove();
    root = null; document.body.classList.remove('kf-open');
    if (onClose) onClose();
  }

  GL.kf = {
    // p = Profil, opts.save() speichert das Profil, opts.close() zeichnet den Hafen neu
    open(p, opts) {
      if (!GL.data.kaperfahrt || !GL.kfArt) return;
      profile = p; onSave = opts && opts.save; onClose = opts && opts.close;
      ensure();
      if (root) root.remove();
      root = document.createElement('div');
      root.id = 'kf'; root.className = 'kf'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', T('Kaperfahrt', 'Raid voyage'));
      root.addEventListener('click', onClick);
      document.body.appendChild(root); document.body.classList.add('kf-open');
      S = { scr: 'hafen', sel: null, from: null }; R = null; F = null;
      hafen();
      root.scrollTop = 0;
    },
    // Kurztext für die Hafen-Kachel
    sub(p) { const k = p && p.kf; return k && k.trips ? `${k.trips}× ${T('gefahren', 'sailed')}` : T('Neu!', 'New!'); },
    isOpen: () => !!root
  };
})();
