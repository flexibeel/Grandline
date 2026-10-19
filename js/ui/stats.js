// STATS: Woher kommen die Werte? Aufschlüsselung im Steckbrief und die Karte „Wie rechnen die Werte?“ in der Anleitung.
// Rechnet nichts Eigenes: liest GL.effects.setup(..., { trace: true }) und GL.config.caps, damit Anzeige und Kampf gleich bleiben.
window.GL = window.GL || {};

(function () {
  const S = { open: null };   // welcher Wert gerade aufgeklappt ist (gilt für alle Figuren, bis ✕)
  const en = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const L = (de, e) => (en() ? e : de);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const P = v => Math.round(v * 100) + ' %';
  const sgn = (v, f) => (v < 0 ? '−' : '+') + f(Math.abs(v));
  const N = v => String(Math.round(v * 10) / 10).replace('.', en() ? '.' : ',');
  const byId = (list, id) => (list || []).find(x => x.id === id);

  // Werte, die man antippen kann: key, Name, Format, Erklärung
  const DEF = {
    hp:       { de: 'Leben', en: 'HP', ico: '❤' },
    atk:      { de: 'Angriff', en: 'Attack', ico: '⚔' },
    spd:      { de: 'Tempo', en: 'Speed', ico: '➤' },
    crit:     { de: 'Krit-Chance', en: 'Crit chance', ico: '🗡', pct: true },
    critMult: { de: 'Krit-Schaden', en: 'Crit damage', ico: '💢', pct: true },
    armor:    { de: 'Rüstung', en: 'Armor', ico: '🛡' },
    guard:    { de: 'Schutz', en: 'Guard', ico: '🧱', pct: true },
    dodge:    { de: 'Ausweichen', en: 'Dodge', ico: '💨', pct: true },
    dmgPct:   { de: 'Schaden', en: 'Damage', ico: '💥', pct: true, plus: true },
    bossPct:  { de: 'Gegen Bosse', en: 'Vs bosses', ico: '👑', pct: true, plus: true },
    regen:    { de: 'Heilung pro Runde', en: 'Heal per round', ico: '✚' }
  };
  const WHAT = {
    hp:       ['Fällt es auf 0, ist die Figur raus. Bis zum nächsten Sieg jedenfalls.', 'Hits 0 and the character is out. Until the next win, anyway.'],
    atk:      ['Grundlage jedes Treffers: Angriff × Stil-Vorteil × Boni, dann zieht die Rüstung ab.', 'Base of every hit: attack × style edge × bonuses, then armor subtracts.'],
    spd:      ['Wer schneller ist, schlägt zuerst. Manchmal reicht das schon.', 'Faster goes first. Sometimes that is enough.'],
    crit:     ['Chance auf einen Krit. Ein Krit macht Treffer × Krit-Schaden. Gilt auch für Ultis und Konter.', 'Chance to crit. A crit deals hit × crit damage. Also counts for ultis and counters.'],
    critMult: ['So hart sitzt ein Krit. Start ist ×2.', 'How hard a crit lands. Starts at ×2.'],
    armor:    ['Zieht von jedem Treffer fest ab. Mindestens 20 % kommen trotzdem durch.', 'Subtracted from every hit. At least 20 % still gets through.'],
    guard:    ['Zieht einen Anteil vom Schaden ab, noch vor der Rüstung.', 'Cuts a share of damage, before armor.'],
    dodge:    ['Chance, dass ein Treffer ganz danebengeht. Schwere Boss-Schläge: doppelt.', 'Chance a hit misses entirely. Heavy boss blows: doubled.'],
    dmgPct:   ['Mehr Schaden bei jedem eigenen Treffer.', 'More damage on every own hit.'],
    bossPct:  ['Mehr Schaden gegen Bosse und Bösewichte.', 'More damage vs bosses and villains.'],
    regen:    ['Heilt am Ende jeder Runde.', 'Heals at the end of every round.']
  };

  // Kampfwerte mit Herkunft für Figur i (Früchte, die erst im Kampf greifen, kommen dazu)
  function unitOf(run, i) {
    const u = GL.effects.setup(run, run.crew, [], { trace: true }).crew[i];
    if (!u) return null;
    const fx = GL.fruitFx && GL.fruitFx.state ? GL.fruitFx.state(run) : null;
    u.fruit = {};
    if (fx) {
      if (fx.tier.paramecia >= 2) u.fruit.atk = 3;
      if (fx.tier.zoan >= 2) { u.fruit.spd = 1; u.fruit.dmgPct = 0.1; }
      if (fx.has['bara-bara']) u.fruit.dodge = 0.06;
    }
    u.pre = { dodge: u.dodge };
    Object.keys(u.fruit).forEach(k => { u[k] += u.fruit[k]; });
    return u;
  }

  // Grundwerte (Figur, Sterne, Eigenschaft), Hafen/Start, Rest aus Level, Training und Erlebtem
  function baseLines(run, i, k) {
    const m = run.crew[i], d = byId(GL.data.crew, m.id) || {}, C = GL.config;
    const star = (C.stars || []).find(s => s.n === m.stars) || {};
    const tb = (byId(GL.data.traits, m.trait) || {}).base || {};
    const now = k === 'hp' ? m.max : m[k];
    const it = m.item && (run.items || []).find(x => x.uid === m.item);
    const gear = k === 'hp' && it ? (GL.run.itemStats(it).hp || 0) : 0;
    const base = (d[k] || 0) + (k === 'spd' ? 0 : (star[k] || 0)) + (tb[k] || 0);
    const mod = (run.mod && run.mod[k]) || 0;
    const out = [{ ico: '👤', name: L('Grundwert', 'Base'), v: base }];
    if (mod) out.push({ ico: '⚓', name: L('Hafen & Start', 'Harbor & start'), v: mod });
    const rest = now - base - mod - gear;
    if (rest) out.push({ ico: '★', name: L('Level, Training & Würfelglück', 'Levels, training & dice luck'), v: rest });
    if (gear) out.push({ ico: '⚙', name: L('Ausrüstung', 'Gear'), v: gear });
    return out;
  }

  function rows(u, k) {
    const tr = (u.trace && u.trace[k]) || [];
    const out = tr.map(x => ({ ico: x.ico, name: x.name, v: x.v }));
    if (u.fruit && u.fruit[k]) out.push({ ico: '🍈', name: L('Frucht-Familie', 'Fruit family'), v: u.fruit[k] });
    return out;
  }

  // Liefert { lines, total, cap, over } für einen Wert
  function breakdown(run, i, k) {
    const u = unitOf(run, i);
    if (!u) return null;
    const C = GL.config, K = C.caps || {}, d = DEF[k];
    const fmt = v => d.pct ? (k === 'critMult' ? GL.statsUi.mult(v) : P(v)) : N(v);
    const fmtD = v => d.pct ? (k === 'critMult' ? sgn(v, x => P(x)) : sgn(v, P)) : sgn(v, N);
    let lines = [], total, cap = null, over = null, note = null;
    if (k === 'hp' || k === 'atk' || k === 'spd') {
      lines = baseLines(run, i, k).concat(k === 'hp' ? [] : rows(u, k));
      total = k === 'hp' ? run.crew[i].max : u[k];
      if (k !== 'hp') note = L('Im Kampf kommen Befehle, Schwung und Wetter dazu.', 'In battle, orders, momentum and weather add on top.');
    } else if (k === 'crit') {
      lines = [{ ico: '🎲', name: L('Grund-Krit für alle', 'Base crit for all'), v: C.baseCrit || 0 }].concat(rows(u, k));
      const KR = GL.effects.critOf(u);
      total = KR.ch;
      cap = { v: K.crit, txt: L('Deckel', 'Cap') };
      if (KR.over > 0) over = { from: P(KR.over), to: '+' + P(KR.over * (K.critOver || 0)), what: L('Krit-Schaden', 'crit damage') };
      note = L(`Über ${P(K.crit)} zählt jedes Prozent als ${N(K.critOver * 1)} % Krit-Schaden. Nichts verfällt.`, `Above ${P(K.crit)}, every percent counts as ${N(K.critOver * 1)} % crit damage. Nothing is wasted.`);
    } else if (k === 'critMult') {
      lines = [{ ico: '🎲', name: L('Grund-Krit-Schaden', 'Base crit damage'), v: C.critMult }].concat(rows(u, k));
      const raw = u.raw ? u.raw.critMult : u.critMult;
      const KR = GL.effects.critOf(u);
      if (raw > (K.critMultMax || 3)) cap = { v: K.critMultMax || 3, txt: L('Deckel', 'Cap'), cut: true };
      if (KR.over > 0) lines.push({ ico: '🔁', name: L('Überlauf aus Krit-Chance', 'Overflow from crit chance'), v: KR.over * (K.critOver || 0), hot: true });
      total = KR.mult;
      lines[0].abs = true;
    } else if (k === 'dodge') {
      lines = rows(u, k);
      total = Math.min(u.dodge, K.dodge);
      cap = { v: K.dodge, txt: L('Deckel', 'Cap') };
      if (u.dodgeGuard > 0) over = { from: P(Math.max(0, u.pre.dodge - K.dodge)), to: '+' + P(u.dodgeGuard), what: L('Schutz', 'guard') };
      note = L(`Über ${P(K.dodge)} wird jedes Prozent zu ${N(K.dodgeOver * 1)} % Schutz (höchstens ${P(K.dodgeOverMax)}).`, `Above ${P(K.dodge)}, every percent becomes ${N(K.dodgeOver * 1)} % guard (max ${P(K.dodgeOverMax)}).`);
    } else if (k === 'guard') {
      lines = rows(u, k);
      if (u.dodgeGuard > 0) lines.push({ ico: '🔁', name: L('Überlauf aus Ausweichen', 'Overflow from dodge'), v: u.dodgeGuard, hot: true });
      total = u.guard;
      if (u.raw && u.raw.guard + u.dodgeGuard > K.guardMax) cap = { v: K.guardMax, txt: L('Deckel', 'Cap'), cut: true };
    } else {
      lines = rows(u, k);
      total = u[k];
      const raw = u.raw && u.raw[k] != null ? u.raw[k] + ((u.fruit && u.fruit[k]) || 0) : total;
      const capV = k === 'dmgPct' || k === 'bossPct' ? 1 : k === 'regen' ? Math.max(2, Math.round((u.max || 0) * 0.1)) : null;
      if (capV != null && raw > capV) cap = { v: capV, txt: L('Deckel', 'Cap'), cut: true };
      if (k === 'armor') note = L('Rüstung schluckt höchstens 80 % eines Treffers.', 'Armor swallows at most 80 % of a hit.');
    }
    return { u, lines: lines.filter(x => x.v), total, cap, over, note, fmt, fmtD };
  }

  // Der aufgeklappte Kasten unter den Kampfwerten
  function panel(run, i) {
    const k = S.open;
    if (!k || !DEF[k]) return '';
    const b = breakdown(run, i, k);
    if (!b) return '';
    const d = DEF[k];
    const row = x => `<div class="sx-row${x.hot ? ' hot' : ''}"><i class="sx-ico" aria-hidden="true">${x.ico}</i><span class="sx-name">${esc(x.name)}</span><b>${x.abs ? b.fmt(x.v) : b.fmtD(x.v)}</b></div>`;
    return `<div class="sx-box" role="region" aria-label="${esc(L(d.de, d.en))}">
      <div class="sx-head"><i aria-hidden="true">${d.ico}</i><b>${esc(L(d.de, d.en))}</b><span class="sx-q">${L('Woher?', 'Where from?')}</span>
        <button class="sx-x" data-act="stat-why" data-k="${k}" aria-label="${L('Schließen', 'Close')}">✕</button></div>
      <div class="sx-list">${b.lines.length ? b.lines.map(row).join('') : `<div class="sx-row muted"><span class="sx-name">${L('Keine Boni. Ehrliche Arbeit.', 'No bonuses. Honest work.')}</span></div>`}</div>
      <div class="sx-row sx-total"><i class="sx-ico" aria-hidden="true">=</i><span class="sx-name">${L('Im Kampf', 'In battle')}</span><b>${b.fmt(b.total)}</b></div>
      ${b.cap ? `<div class="sx-row sx-cap"><i class="sx-ico" aria-hidden="true">⛔</i><span class="sx-name">${b.cap.txt} ${b.fmt(b.cap.v)}${b.cap.cut ? L(' – darüber wird gekappt', ' – anything above is cut') : ''}</span></div>` : ''}
      ${b.over ? `<div class="sx-row sx-over hot"><i class="sx-ico" aria-hidden="true">🔁</i><span class="sx-name">${L('Überlauf', 'Overflow')} ${b.over.from} → ${b.over.to} ${b.over.what}</span></div>` : ''}
      <p class="sx-what">${esc(L(WHAT[k][0], WHAT[k][1]))}${b.note ? ' ' + esc(b.note) : ''}</p>
    </div>`;
  }

  // Ein Kampfwert im Steckbrief als antippbare Zeile
  function cell(k, label, value) {
    const on = S.open === k;
    return `<button class="st sx-st${on ? ' on' : ''}" data-act="stat-why" data-k="${k}" aria-expanded="${on}"><span>${label}</span><b>${value}</b></button>`;
  }

  // Angezeigte Werte (mit Deckel und Überlauf, wie im Kampf)
  function shown(unit) {
    const KR = GL.effects.critOf(unit);
    return { crit: KR.ch, critOver: KR.over, critMult: KR.mult, dodge: Math.min(unit.dodge, (GL.config.caps || {}).dodge || 0.6), dodgeOver: unit.dodgeGuard > 0 };
  }

  // Anleitung: „Wie rechnen die Werte?“
  function introCard(irow, badge) {
    const C = GL.config, K = C.caps || {};
    const x = v => '×' + String(v).replace('.', en() ? '.' : ',');
    return {
      kicker: L('Für Neugierige', 'For the curious'),
      title: L('Wie rechnen die Werte?', 'How do the stats work?'),
      body: `<div class="in-rows">
        ${irow('⚔', L('Schaden', 'Damage'), L('Angriff × Stil-Vorteil × Boni. Dann zieht die Rüstung ab, 20 % kommen immer durch.', 'Attack × style edge × bonuses. Then armor subtracts; 20 % always gets through.'))}
        ${irow('🗡', L('Krit', 'Crit'), L(`Krit-Chance sagt ob, Krit-Schaden wie hart. Start: ${P(C.baseCrit)} und ${x(C.critMult)}.`, `Crit chance says if, crit damage how hard. Start: ${P(C.baseCrit)} and ${x(C.critMult)}.`))}
        ${irow('⛔', L('Deckel', 'Caps'), L(`Krit höchstens ${P(K.crit)}, Ausweichen ${P(K.dodge)}. Darüber verfällt nichts: Krit wird Krit-Schaden, Ausweichen wird Schutz.`, `Crit at most ${P(K.crit)}, dodge ${P(K.dodge)}. Nothing above is wasted: crit becomes crit damage, dodge becomes guard.`))}
        ${irow((GL.ui && GL.ui.pxIcon && GL.ui.pxIcon('kraft')) || '△', L('Stil-Dreieck', 'Style triangle'), `${badge('kraft')} › ${badge('technik')} › ${badge('klinge')} › ${badge('kraft')} ${L(`${x(C.typeStrong)} Schaden, andersrum ${x(C.typeWeak)}.`, `${x(C.typeStrong)} damage, the other way ${x(C.typeWeak)}.`)}`)}
        ${irow('🔍', L('Nachsehen', 'Look it up'), L('Im Steckbrief einen Wert antippen: Er zeigt, woher jede Zahl kommt.', 'Tap a stat on the wanted poster: it shows where every number comes from.'))}</div>`
    };
  }

  GL.statsUi = {
    toggle(k) { S.open = S.open === k || !DEF[k] ? null : k; },
    close() { S.open = null; },
    isOpen: () => S.open,
    mult: v => '×' + String(Math.round(v * 100) / 100).replace('.', en() ? '.' : ','),
    panel, cell, shown, breakdown, introCard
  };
})();
