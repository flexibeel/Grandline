// Dungeon-Liga (DLIGA): Rang aus Landgängen statt aus PvP-Duellen.
// - Pro Landgang-Ort, Stufe und Tiefe zählt nur der beste Lauf (profile.dlBest[key] = Punkte).
// - Liga-Punkte = Summe aller Bestwerte. Leichte Orte zehnmal machen hebt nicht in die nächste Liga.
// - Jeder gewonnene Landgang bringt Dungeon-Marken (auch Wiederholungen, keine Tageslimits).
//   Marken tauscht man im Marken-Laden gegen Optik, Begleiter, Flaggen und Skillpunkte.
window.GL = window.GL || {};

(function () {
  const T = s => (GL.i18n && GL.i18n.t ? GL.i18n.t(s) : s);
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const num = (v, lo, hi) => { const n = Number(v); return isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : lo; };
  const fmt = n => Number(n || 0).toLocaleString('de-DE');

  const LEAGUES = [
    { id: 'planke', name: 'Planke', en: 'Plank', min: 0, ico: '🪵' },
    { id: 'bronze', name: 'Bronze', en: 'Bronze', min: 300, ico: '🥉' },
    { id: 'silber', name: 'Silber', en: 'Silver', min: 1500, ico: '🥈' },
    { id: 'gold', name: 'Gold', en: 'Gold', min: 5000, ico: '🥇' },
    { id: 'diamant', name: 'Diamant', en: 'Diamond', min: 15000, ico: '💎' },
    { id: 'legende', name: 'Legende', en: 'Legend', min: 40000, ico: '👑' }
  ];
  const league = pts => LEAGUES.filter(l => (pts || 0) >= l.min).pop();
  const next = pts => LEAGUES.find(l => l.min > (pts || 0)) || null;
  const lname = L => (en() ? L.en : L.name);

  // Punkte für einen gewonnenen Lauf
  //   Basis nach Meer (schwerere Orte mehr), mal Stufe, mal Tiefe (Expedition),
  //   Bonus für Schaden pro Runde (schnell gewonnen) und übrig gebliebenes Leben.
  function score(o) {
    const sea = num(o.sea, 0, 5), lvl = num(o.lvl, 0, 20), deep = !!o.deep;
    const base = 100 + 60 * sea;
    const lvlM = 1 + 0.2 * lvl, deepM = deep ? 1.5 : 1;
    const rounds = Math.max(1, Number(o.rounds) || 12);
    const dmgB = Math.max(0, Math.min(1, (12 - rounds) / 8));
    const hpB = Math.max(0, Math.min(1, Number(o.hpFrac) || 0));
    const raw = base * lvlM * deepM;
    const pts = Math.round(raw * (1 + 0.25 * dmgB + 0.35 * hpB));
    return { pts, base: Math.round(raw), dmg: Math.round(raw * 0.25 * dmgB), hp: Math.round(raw * 0.35 * hpB) };
  }
  // Marken pro gewonnenem Lauf (auch beim zehnten Mal)
  const marks = o => Math.max(1, Math.round((2 + num(o.sea, 0, 5)) * (1 + 0.15 * num(o.lvl, 0, 20)) * (o.deep ? 1.5 : 1)));
  const key = (id, lvl, deep) => `${String(id).replace(/[^\w-]/g, '').slice(0, 24)}:${num(lvl, 0, 20)}:${deep ? 1 : 0}`;
  function bests(profile) {
    const b = profile.dlBest && typeof profile.dlBest === 'object' ? profile.dlBest : {};
    const out = {};
    Object.keys(b).slice(0, 600).forEach(k => { if (/^[\w-]{1,24}:\d{1,2}:[01]$/.test(k)) out[k] = num(b[k], 0, 99999); });
    return out;
  }
  const rating = profile => Object.values(bests(profile)).reduce((s, v) => s + v, 0);

  // Ergebnis eines Landgangs verbuchen. Gibt zurück, was sich geändert hat (für die Anzeige).
  function record(profile, o) {
    if (!o || !o.win) return null;
    const sc = score(o), k = key(o.id, o.lvl, o.deep), B = bests(profile);
    const before = rating(profile), old = B[k] || 0;
    if (sc.pts > old) B[k] = sc.pts;
    profile.dlBest = B;
    const after = Object.values(B).reduce((s, v) => s + v, 0);
    profile.dlRating = after;
    const m = marks(o);
    profile.dlMarks = num((profile.dlMarks || 0) + m, 0, 1e7);
    profile.dlMarksTotal = num((profile.dlMarksTotal || 0) + m, 0, 1e8);
    return { pts: sc.pts, parts: sc, old, gain: after - before, rating: after, marks: m, up: league(after).id !== league(before).id ? league(after) : null };
  }

  // ---------- Marken-Laden ----------
  // kind: bg/frame = Visitenkarte, pet = Begleiter, flag = Schiffsflagge, skill = Skillpunkt
  const SHOP = [
    { id: 'bg-kartentisch', kind: 'bg', cos: 'kartentisch', name: 'Kartentisch', en: 'Chart Table', price: 30, text: 'Pergament, Zirkel und ein Kaffeefleck in Form von Alabasta.' },
    { id: 'bg-laternengrotte', kind: 'bg', cos: 'laternengrotte', name: 'Laternengrotte', en: 'Lantern Grotto', price: 45, text: 'Warmes Licht, kalte Steine. Niemand weiß, wer die Laternen anzündet.' },
    { id: 'bg-wrackbucht', kind: 'bg', cos: 'wrackbucht', name: 'Wrackbucht', en: 'Wreck Cove', price: 60, text: 'Schöner Ort. Die Vorbesitzer sind nicht mehr zu sprechen.' },
    { id: 'bg-goldkajuete', kind: 'bg', cos: 'goldkajuete', name: 'Goldene Kajüte', en: 'Golden Cabin', price: 90, text: 'Holzvertäfelung, Goldkante, ein Stuhl, auf dem nur du sitzen darfst.' },
    { id: 'fr-kompass', kind: 'frame', cos: 'kompass', name: 'Kompassrahmen', en: 'Compass Frame', price: 40, text: 'Zeigt immer nach Norden. Also meistens auf dich.' },
    { id: 'fr-dungeon', kind: 'frame', cos: 'gewoelbe', name: 'Gewölberahmen', en: 'Vault Frame', price: 70, text: 'Dunkler Stein, Moos in den Ecken. Riecht nach Abenteuer und Keller.' },
    { id: 'pet-laternenmotte', kind: 'pet', pet: 'laternenmotte', name: 'Laternenmotte', en: 'Lantern Moth', price: 55, text: 'Folgt jedem Licht. Also dir, wenn du gut gelaunt bist.' },
    { id: 'pet-muenzkrabbe', kind: 'pet', pet: 'muenzkrabbe', name: 'Münzkrabbe', en: 'Coin Crab', price: 80, text: 'Trägt eine Goldmünze auf dem Rücken und gibt sie nicht her.' },
    { id: 'flag-marke', kind: 'flag', flag: 'marke', name: 'Markenflagge', en: 'Token Flag', price: 35, text: 'Für Leute, die Landgänge ernst nehmen. Etwas zu ernst.' },
    { id: 'flag-gruft', kind: 'flag', flag: 'gruft', name: 'Gruftflagge', en: 'Crypt Flag', price: 65, text: 'Schwarz-violett. Die Möwen machen einen Bogen darum.' },
    { id: 'skill', kind: 'skill', name: 'Skillpunkt', en: 'Skill point', price: 0, text: 'Ein zusätzlicher Skillpunkt. Wird mit jedem Kauf teurer.' }
  ];
  const owned = profile => (Array.isArray(profile.dlOwned) ? profile.dlOwned : []).filter(id => SHOP.some(s => s.id === id));
  const skillBought = profile => num(profile.dlSkill || 0, 0, 999);
  const skillPrice = profile => 40 + 20 * skillBought(profile);
  const priceOf = (profile, it) => (it.kind === 'skill' ? skillPrice(profile) : it.price);
  function buy(profile, id) {
    const it = SHOP.find(s => s.id === id);
    if (!it) return false;
    const p = priceOf(profile, it), have = num(profile.dlMarks || 0, 0, 1e7);
    if (it.kind !== 'skill' && owned(profile).includes(id)) return false;
    if (have < p) return false;
    profile.dlMarks = have - p;
    if (it.kind === 'skill') { profile.dlSkill = skillBought(profile) + 1; return it; }
    profile.dlOwned = owned(profile).concat(id);
    if (it.kind === 'pet') { profile.pets = Array.isArray(profile.pets) ? profile.pets : []; if (!profile.pets.includes(it.pet)) profile.pets.push(it.pet); }
    return it;
  }

  // ---------- Anzeige ----------
  function chip(pts, withNum) {
    const L = league(pts || 0);
    return `<em class="dl-chip dl-${L.id}" title="${esc(T('Dungeon-Liga'))}: ${esc(lname(L))} · ${fmt(pts || 0)} ${esc(T('Punkte'))}"><i aria-hidden="true">${L.ico}</i>${esc(lname(L))}${withNum ? ` <b>${fmt(pts || 0)}</b>` : ''}</em>`;
  }
  function panelHtml(profile) {
    const pts = rating(profile), L = league(pts), N = next(pts);
    const pct = N ? Math.round(100 * (pts - L.min) / (N.min - L.min)) : 100;
    return `<div class="dl-panel">
      <div class="dl-top">${chip(pts, true)}<span class="dl-marks" title="${esc(T('Dungeon-Marken: im Marken-Laden eintauschen'))}">🎟 <b>${fmt(profile.dlMarks || 0)}</b></span>
        <button class="dl-shopbtn" data-act="dl-shop">🛒 ${esc(T('Marken-Laden'))}</button></div>
      <div class="dl-bar"><i style="width:${pct}%"></i></div>
      <small class="dl-next">${N ? `${esc(T('Noch'))} ${fmt(N.min - pts)} ${esc(T('bis'))} ${N.ico} ${esc(lname(N))}` : esc(T('Höchste Liga. Die Möwen verneigen sich.'))} · ${esc(T('Pro Ort, Stufe und Tiefe zählt dein bester Lauf.'))}</small>
    </div>`;
  }
  function resultHtml(r) {
    if (!r) return '';
    const newBest = r.pts > r.old;
    return `<div class="dl-res${newBest ? ' best' : ''}">
      <span class="dl-res-h">${newBest ? `🏆 ${esc(T('Neuer Bestwert'))}` : esc(T('Kein neuer Bestwert'))} · <b>${fmt(r.pts)}</b> ${esc(T('Punkte'))}</span>
      <span class="dl-res-p"><i title="${esc(T('Basis: Ort, Stufe, Tiefe'))}">⚓ ${fmt(r.parts.base)}</i><i title="${esc(T('Schaden pro Runde'))}">⚔ +${fmt(r.parts.dmg)}</i><i title="${esc(T('Übrig gebliebenes Leben'))}">♥ +${fmt(r.parts.hp)}</i></span>
      <span class="dl-res-g">${newBest ? `${esc(T('Liga'))} +${fmt(r.gain)} → ${chip(r.rating, true)}` : `${esc(T('Bestwert hier'))}: ${fmt(r.old)}`} · 🎟 +${r.marks}</span>
      ${r.up ? `<span class="dl-up">${r.up.ico} ${esc(T('Aufstieg'))}: ${esc(lname(r.up))}!</span>` : ''}
    </div>`;
  }
  function shopArt(it) {
    const bg = id => (GL.data.bgSvg ? GL.data.bgSvg(id) : '');
    if (it.kind === 'bg') return `<span class="dl-sw pbg bg-${it.cos}">${bg(it.cos)}</span>`;
    if (it.kind === 'frame') return `<span class="dl-sw fr fr-${it.cos}"><span class="pbg bg-meer"></span></span>`;
    if (it.kind === 'pet' && GL.ui && GL.ui.petArt) return `<span class="dl-sw pet">${GL.ui.petArt(it.pet)}</span>`;
    if (it.kind === 'flag' && GL.sprites && GL.sprites.ship) return `<span class="dl-sw ship">${GL.sprites.ship({ flag: it.flag })}</span>`;
    return `<span class="dl-sw sk">✦</span>`;
  }
  function shopHtml(profile, msg) {
    const own = owned(profile), have = num(profile.dlMarks || 0, 0, 1e7);
    const rows = SHOP.map(it => {
      const has = it.kind !== 'skill' && own.includes(it.id), p = priceOf(profile, it), can = !has && have >= p;
      return `<button class="dl-it${has ? ' own' : ''}${can ? ' can' : ''}" data-act="dl-buy" data-id="${it.id}"${has || !can ? ' disabled' : ''} title="${esc(T(it.text))}">
        ${shopArt(it)}<span class="dl-it-t"><b>${esc(en() ? it.en : it.name)}</b><small>${esc(T(it.text))}</small></span>
        <em class="dl-pr">${has ? '✓' : `🎟 ${p}`}</em></button>`;
    }).join('');
    return `<div class="fpop-card dl-shop" role="dialog">
      <span class="fpop-kicker">${esc(T('Marken-Laden'))}</span>
      <h3>${esc(T('Für Leute, die gern wiederkommen'))}</h3>
      <p class="dl-sub">🎟 <b>${fmt(have)}</b> ${esc(T('Marken'))} · ${esc(T('Jeder gewonnene Landgang bringt Marken, schwerere mehr. Keine Fristen, kein Stress.'))}</p>
      ${msg ? `<p class="dl-msg">${esc(msg)}</p>` : ''}
      <div class="dl-list">${rows}</div>
      <div class="fpop-btns"><button class="btn ghost" data-act="dg-open">${esc(T('Zum Landgang'))}</button><button class="btn ghost" data-act="pop-close">${esc(T('Schließen'))}</button></div></div>`;
  }

  GL.dliga = { LEAGUES, SHOP, league, next, lname, score, marks, key, bests, rating, record, owned, skillBought, skillPrice, buy, chip, panelHtml, resultHtml, shopHtml, _num: num };
})();
