// Willkommen zurück: Eine Crew-Figur begrüßt dich mit einer kleinen Sprechblase (wie in den Story-Szenen).
// Höchstens einmal pro Besuch, nie beim allerersten Start. Texte als [Deutsch, Englisch].
window.GL = window.GL || {};

(function () {
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const L = p => (Array.isArray(p) ? (en() ? p[1] : p[0]) : p);
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const H = 3600e3, D = 24 * H;

  // ctx: hour, wday (0 = Sonntag), away (ms), won (seit letztem Gruß gewonnen), lost (nur verloren), name, mate (Stammcrew-Figur)
  // w: Gewicht (höher = eher), when: Bedingung
  const LINES = [
    // Tageszeit
    { who: 'sanji', when: c => c.hour >= 5 && c.hour < 10, de: 'Guten Morgen, {name}! Kaffee steht bereit. Das Meer ist noch müde, wir nicht.', en: 'Good morning, {name}! Coffee is ready. The sea is still sleepy, we are not.' },
    { who: 'nami', when: c => c.hour >= 5 && c.hour < 10, de: 'Schon wach? Sehr gut. Frühe Piraten finden das Gold, bevor Ruffy es isst.', en: 'Up already? Good. Early pirates find the gold before Luffy eats it.' },
    { who: 'robin', when: c => c.hour >= 10 && c.hour < 17, de: 'Ah, {name}. Ich hoffe, dein Tag war freundlich zu dir. Falls nicht: Wir haben Schiffe.', en: 'Ah, {name}. I hope your day was kind to you. If not: we have ships.' },
    { who: 'ruffy', when: c => c.hour >= 11 && c.hour < 14, de: 'Mittag! Weißt du, was das heißt? Genau. Fleisch. Und danach Abenteuer.', en: 'Lunchtime! You know what that means? Exactly. Meat. And then adventure.' },
    { who: 'brook', when: c => c.hour >= 17 && c.hour < 22, de: 'Yohoho, guten Abend! Ich hoffe, du hattest einen angenehmen Tag. Ich hatte keinen Kreislauf, aber gute Laune.', en: 'Yohoho, good evening! I hope you had a pleasant day. I had no circulation, but a good mood.' },
    { who: 'sanji', when: c => c.hour >= 17 && c.hour < 22, de: 'Willkommen zurück. Setz dich, das Abendessen ist gleich fertig. Abenteuer gibt es als Nachtisch.', en: 'Welcome back. Sit down, dinner is almost ready. Adventure is for dessert.' },
    { who: 'zorro', when: c => c.hour >= 22 || c.hour < 5, de: 'Noch wach? … Ich auch. Ich hab nur kurz die Augen ausgeruht. Seit drei Stunden.', en: 'Still up? … Me too. I was just resting my eyes. For three hours.' },
    { who: 'chopper', when: c => c.hour >= 22 || c.hour < 5, de: 'Es ist spät! Als Arzt sage ich: eine Fahrt noch, dann ins Bett. Als Rentier sage ich: zwei.', en: 'It is late! As a doctor I say: one more voyage, then bed. As a reindeer I say: two.' },
    // Wochentag
    { who: 'franky', when: c => c.wday === 1, de: 'Montag! Der Tag, an dem alles quietscht. Außer meinem Schiff. Das ist SUUUPER geölt.', en: 'Monday! The day everything squeaks. Except my ship. It is SUUUPER oiled.' },
    { who: 'nami', when: c => c.wday === 5, de: 'Freitag. Die Woche ist geschafft, die Grand Line noch nicht. Zufall? Ich glaube nicht.', en: 'Friday. The week is done, the Grand Line is not. Coincidence? I think not.' },
    { who: 'ruffy', when: c => c.wday === 0 || c.wday === 6, de: 'Wochenende! Keine Schule, keine Arbeit, nur Meer. Und vielleicht ein kleiner Boss zum Frühstück.', en: 'Weekend! No school, no work, just sea. And maybe a small boss for breakfast.' },
    // Wie lange weg
    { who: 'lysop', w: 3, when: c => c.away > 3 * D, de: 'Da bist du ja! Ich hab in der Zwischenzeit achttausend Seekönige besiegt. Ungefähr. Plus minus achttausend.', en: 'There you are! Meanwhile I defeated eight thousand sea kings. Roughly. Give or take eight thousand.' },
    { who: 'kalle', w: 3, when: c => c.away > 2 * D, de: 'KRAA! Lange nicht gesehen! Die Zeitung hat schon gefragt, ob du verschollen bist. Ich hab „nein“ gekrächzt.', en: 'KRAA! Long time no see! The paper asked if you were lost at sea. I squawked “no”.' },
    { who: 'robin', w: 2, when: c => c.away > D && c.away <= 3 * D, de: 'Ein Tag ohne dich, und Ruffy hat dreimal gefragt, wo du bist. Und zweimal, wo das Essen ist.', en: 'One day without you, and Luffy asked three times where you were. And twice where the food was.' },
    { who: 'chopper', w: 2, when: c => c.away < 2 * H, de: 'Schon wieder da? Hehe, ich hab mich gar nicht gefreut, du Idiot! … Doch, ein bisschen.', en: 'Back already? Hehe, I am not happy at all, you jerk! … Okay, a little.' },
    // Fortschritt
    { who: 'nami', w: 4, when: c => c.won, de: 'Unser Sieger ist zurück! Das Kopfgeld ist gestiegen. Mein Anteil übrigens auch.', en: 'Our champion is back! The bounty went up. My share did too, by the way.' },
    { who: 'ruffy', w: 4, when: c => c.won, de: 'Letztes Mal haben wir gewonnen! Heißt das, heute gibt es doppelt Fleisch? Ich finde, es heißt das.', en: 'We won last time! Does that mean double meat today? I think it does.' },
    { who: 'zorro', w: 4, when: c => c.lost, de: 'Letztes Mal hat es nicht gereicht. Kein Drama. Wir trainieren, wir kommen wieder, wir verlaufen uns vielleicht kurz.', en: 'Last time was not enough. No drama. We train, we come back, we maybe get a little lost.' },
    { who: 'lysop', w: 4, when: c => c.lost, de: 'Die Niederlage? Taktischer Rückzug! Ich hab das genau so geplant. Ungefähr.', en: 'That defeat? Tactical retreat! I planned it exactly like that. Roughly.' },
    { who: 'sanji', w: 3, when: c => c.lost, de: 'Wer verliert, bekommt bei mir trotzdem einen Teller. Mit vollem Bauch segelt es sich besser.', en: 'Losers still get a plate from me. You sail better on a full stomach.' },
    { who: 'mate', w: 3, when: c => !!c.mate, de: 'Ich hab dein Lieblingsplätzchen am Steg freigehalten. Nur damit du es weißt.', en: 'I kept your favourite spot on the dock free. Just so you know.' },
    // Allgemein
    { who: 'ruffy', de: 'Hey, {name}! Ich hoffe, du hattest einen angenehmen Tag. Willkommen zurück. Lass uns ein Abenteuer beginnen!', en: 'Hey, {name}! I hope you had a pleasant day. Welcome back. Let us start an adventure!' },
    { who: 'nami', de: 'Die Karte ist frisch gezeichnet, der Wind ist gut, die Kasse ist leer. Perfekte Bedingungen.', en: 'The map is freshly drawn, the wind is good, the purse is empty. Perfect conditions.' },
    { who: 'franky', de: 'Willkommen an Bord! Ich hab nichts umgebaut. Fast nichts. Der Knopf da war schon immer da.', en: 'Welcome aboard! I did not rebuild anything. Almost nothing. That button was always there.' },
    { who: 'brook', de: 'Schön, dass du da bist! Mir hüpft das Herz. Ich habe keins, aber es hüpft trotzdem. Yohoho!', en: 'So glad you are here! My heart is jumping. I do not have one, but it jumps anyway. Yohoho!' },
    { who: 'robin', de: 'Willkommen zurück. Das Meer hat auf dich gewartet. Geduldig, wie Meere so sind.', en: 'Welcome back. The sea has been waiting for you. Patiently, as seas do.' },
    { who: 'kalle', de: 'KRAA! Neuigkeiten aus aller Welt: {name} ist wieder an Bord! Mehr gibt es heute nicht zu berichten.', en: 'KRAA! News from around the world: {name} is back aboard! That is all the news today.' },
    { who: 'chopper', de: 'Kurzer Gesundheitscheck: Puls gut, Laune gut, Abenteuerlust … sehr gut! Du darfst segeln.', en: 'Quick check-up: pulse good, mood good, thirst for adventure … very good! You may sail.' },
    { who: 'zorro', de: '… Ah. Du. Gut. Dann kann es ja losgehen. Wo ist eigentlich vorne?', en: '… Ah. You. Good. Then we can go. Which way is forward, anyway?' }
  ];

  function who(profile, id) {
    if (id === 'kalle') { const p = (GL.data.pets || []).find(x => x.id === 'moewe'); return p ? { name: en() ? 'Kalle the News Coo' : 'Kalle, die Zeitungsmöwe', spr: GL.sprites.renderShaded({ id: 'pet-moewe', art: p.art }) } : null; }
    const d = (GL.data.crew || []).find(c => c.id === id);
    return d ? { name: d.name, spr: GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d) } : null;
  }

  // Würfeln mit Gewichten (kein Spiel-Zufall, nur Anzeige)
  function pick(profile, ctx) {
    const recent = (profile.greetSeen || []).slice(-6);
    let pool = LINES.filter(l => !l.when || l.when(ctx));
    const fresh = pool.filter(l => !recent.includes(LINES.indexOf(l)));
    if (fresh.length) pool = fresh;
    const tot = pool.reduce((s, l) => s + (l.w || 1), 0);
    let x = Math.random() * tot;
    for (const l of pool) { x -= (l.w || 1); if (x <= 0) return l; }
    return pool[0];
  }

  function context(profile, away) {
    const now = new Date(), st = profile.stats || {}, g = profile.greet || {};
    const runsNew = (st.runs || 0) > (g.runs || 0), winsNew = (st.wins || 0) > (g.wins || 0);
    const squad = GL.meta && GL.meta.squadIds ? GL.meta.squadIds(profile).filter(id => id !== 'self') : [];
    return { hour: now.getHours(), wday: now.getDay(), away: away == null ? 0 : away, won: g.runs != null && winsNew, lost: g.runs != null && runsNew && !winsNew,
      name: profile.nickname || (en() ? 'Captain' : 'Kapitän'), mate: squad[0] || null };
  }

  // Darf jetzt gegrüßt werden? (einmal pro Besuch, nicht beim ersten Mal, nicht nach ganz kurzer Pause)
  function due(profile, away) {
    if (!profile || !profile.nickname || !((profile.stats && profile.stats.runs) >= 1)) return false;
    try { if (sessionStorage.getItem('gl.greeted')) return false; } catch (e) { /* egal */ }
    return away == null || away > 20 * 60e3;
  }

  let cur = null;
  function show(profile, away, onDone) {
    if (cur || document.getElementById('greet')) return false;
    const ctx = context(profile, away);
    let line = pick(profile, ctx);
    let id = line.who === 'mate' ? ctx.mate : line.who;
    let W = id && who(profile, id);
    if (!W) { line = LINES.find(l => l.who === 'ruffy' && !l.when); id = 'ruffy'; W = who(profile, id); }
    if (!W) return false;
    const text = L([line.de, line.en]).replace(/\{name\}/g, ctx.name);
    try { sessionStorage.setItem('gl.greeted', '1'); } catch (e) { /* egal */ }
    profile.greetSeen = (profile.greetSeen || []).concat([LINES.indexOf(line)]).slice(-8);
    profile.greet = { runs: (profile.stats && profile.stats.runs) || 0, wins: (profile.stats && profile.stats.wins) || 0, at: Date.now() };
    const el = document.createElement('div');
    el.id = 'greet'; el.className = 'greet'; el.setAttribute('role', 'dialog');
    el.innerHTML = `<div class="gr-card">
        <span class="gr-face"><i class="gr-hop">${W.spr}</i></span>
        <span class="gr-body"><b class="gr-name">${esc(W.name)}</b><p class="gr-line"></p></span>
        <button class="btn gr-go" data-gr="go">${en() ? 'Cast off!' : 'Leinen los!'}</button>
        <button class="gr-x" data-gr="x" aria-label="${en() ? 'Close' : 'Schließen'}">✕</button>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    const p = el.querySelector('.gr-line');
    let k = 0, typing = null;
    const tick = () => {
      k++; p.textContent = text.slice(0, k);
      const ch = text[k - 1];
      if (ch && /[a-zäöüß0-9]/i.test(ch) && GL.sfx && GL.sfx.voice && k % 2) GL.sfx.voice(id, ch);
      if (k >= text.length) { typing = null; el.classList.add('done'); return; }
      typing = setTimeout(tick, /[.!?…]/.test(ch) ? 70 : /,/.test(ch) ? 40 : 20);
    };
    setTimeout(tick, 380);
    const close = () => {
      if (!cur) return; clearTimeout(typing); cur = null;
      el.classList.remove('in'); el.classList.add('out');
      setTimeout(() => el.remove(), 320);
      if (onDone) onDone();
    };
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-gr]');
      if (b) { e.stopPropagation(); close(); if (b.dataset.gr === 'go') { const s = document.querySelector('[data-act=sail]'); if (s && !s.disabled) setTimeout(() => s.click(), 250); } return; }
      if (typing) { clearTimeout(typing); typing = null; p.textContent = text; el.classList.add('done'); return; }
      close();
    });
    cur = { el, close };
    // Leise wieder gehen, wenn man einfach weiterspielt
    setTimeout(() => { if (cur && cur.el === el) close(); }, 14000);
    return true;
  }

  GL.greet = { due, show, active: () => !!cur, lines: LINES };
})();
