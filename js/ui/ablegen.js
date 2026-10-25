// 9c A+B: Ablege-Szene. Nach „Ablegen“ im Deck steht die gewählte Crew an Deck, höchstens drei rufen etwas,
// Leinen los, das Schiff gleitet aus dem Hafen, dann geht es mit der Kurswahl weiter.
// Reine Anzeige: keine Spiellogik, kein Spielstand-Feld, Replay-sicher (act() läuft erst danach, wie bisher).
// Dauer rund 2 s, Antippen (oder Enter/Leertaste/Esc) überspringt. „Weniger Bewegung“: kurzes Einblenden, das Schiff bleibt liegen.
// Nur transform/opacity/translate, nichts Dauerndes (Lehre aus 9a, das Handy soll kühl bleiben).
// Hinweis: Die Stimmung (4D Gefühle) ist beim Start einer Fahrt für alle „normal“ (run.herz beginnt leer), deshalb gibt es die Rufe je Rolle.
window.GL = window.GL || {};

(function () {
  const en = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const rnd = n => Math.floor(Math.random() * n);

  // Rufe je Rolle, [Deutsch, Englisch]. Der eigene Pirat ruft immer zuerst.
  const CALLS = {
    self: [
      ['Leinen los! Kurs auf Abenteuer!', 'Cast off! Course for adventure!'],
      ['Alle an Bord? Dann los!', 'Everyone aboard? Then off we go!'],
      ['Das wird unsere beste Fahrt!', 'This will be our best voyage!'],
      ['Wind in die Segel, Crew!', 'Wind in our sails, crew!']
    ],
    kaempfer: [
      ['Endlich! Ich hab Lust auf Ärger!', 'Finally! I\'m itching for trouble!'],
      ['Wer zuerst? Ich zuerst!', 'Who\'s first? Me first!'],
      ['Gebt mir einen Gegner. Irgendeinen!', 'Give me an opponent. Any opponent!'],
      ['Ich hab Kampfgeist. Und Hunger.', 'I\'ve got fighting spirit. And hunger.']
    ],
    helfer: [
      ['Der Verbandskasten ist dabei. Zweimal.', 'First aid kit is packed. Twice.'],
      ['Passt auf euch auf, ja?', 'Look after yourselves, okay?'],
      ['Ich hab Proviant eingepackt. Viel.', 'I packed snacks. Lots.'],
      ['Hoffentlich bleibt das Wetter schön.', 'Hope the weather stays nice.']
    ],
    brecher: [
      ['Das Deck steht. Ich auch.', 'The deck holds. So do I.'],
      ['Lasst sie nur kommen.', 'Let them come.'],
      ['Ich geh vorne. Immer.', 'I take the front. Always.'],
      ['Schwerer Anker, leichtes Herz.', 'Heavy anchor, light heart.']
    ]
  };

  function who(profile, id) {
    if (id === 'self') {
      const s = (GL.meta && GL.meta.selfDef && profile ? GL.meta.selfDef(profile) : null) || { name: '', look: {} };
      return { id, role: 'self', name: (profile && profile.nickname) || (en() ? 'You' : 'Du'), spr: GL.sprites.render({ id: 'self', name: s.name, look: s.look }) };
    }
    const d = GL.data.crew.find(c => c.id === id);
    if (!d) return null;
    return { id, role: d.role || 'kaempfer', name: d.name, spr: GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d) };
  }

  // Höchstens drei Rufer: der eigene Pirat zuerst, dann zufällige andere, jeder Satz nur einmal
  function callers(crew) {
    const me = crew.filter(w => w.id === 'self'), rest = crew.filter(w => w.id !== 'self');
    for (let i = rest.length - 1; i > 0; i--) { const j = rnd(i + 1); [rest[i], rest[j]] = [rest[j], rest[i]]; }
    const used = new Set(), out = new Map();
    me.concat(rest).slice(0, 3).forEach(w => {
      const pool = CALLS[w.role] || CALLS.kaempfer;
      const free = pool.filter(p => !used.has(p));
      const p = (free.length ? free : pool)[rnd((free.length ? free : pool).length)];
      used.add(p); out.set(w.id, p);
    });
    return out;
  }

  function play(ids, run, profile, onDone) {
    if (document.getElementById('ablegen')) return;   // läuft schon: doppeltes Tippen nicht durchreichen
    const crew = (ids || []).map(id => who(profile, id)).filter(Boolean);
    if (!crew.length || !GL.sprites || !GL.sprites.render) { onDone(); return; }
    const k = en() ? 1 : 0, still = calm();
    const say = callers(crew), order = [...say.keys()];
    const ship = GL.sprites.ship ? GL.sprites.ship((profile && profile.cos && profile.cos.ship) || undefined) : '';
    const el = document.createElement('div');
    el.id = 'ablegen'; el.className = 'ablegen' + (still ? ' calm' : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', en() ? 'Setting sail' : 'Ablegen');
    el.innerHTML = `<i class="abl-cloud a"></i><i class="abl-cloud b"></i><div class="abl-sea"></div><div class="abl-dock"></div>
      <div class="abl-ship"><div class="abl-boat">${ship}<div class="abl-crew">${crew.map(w => {
        const n = order.indexOf(w.id);
        const line = say.get(w.id);
        return `<span class="abl-who" data-w="${esc(w.id)}"><i class="abl-spr">${w.spr}</i>${line ? `<i class="abl-say" style="--d:${(0.25 + n * 0.45).toFixed(2)}s;--lift:${n * 38}px">${esc(line[k])}</i>` : ''}</span>`;
      }).join('')}</div></div></div>
      <div class="abl-hint">${en() ? 'Tap to skip' : 'Antippen zum Überspringen'}</div>`;
    document.body.appendChild(el);

    let done = false;
    const timers = [];
    const finish = () => {
      if (done) return; done = true;
      timers.forEach(clearTimeout);
      document.removeEventListener('keydown', onKey, true);
      try { onDone(); } finally {
        el.classList.remove('in');
        setTimeout(() => el.remove(), 320);
      }
    };
    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); }
    }
    el.addEventListener('click', finish);
    document.addEventListener('keydown', onKey, true);
    if (GL.sfx && GL.sfx.play) GL.sfx.play('tap');
    requestAnimationFrame(() => {
      el.classList.add('in');
      el.querySelectorAll('.abl-say').forEach(s => s.classList.add('on'));
      if (!still) timers.push(setTimeout(() => el.classList.add('go'), 450));
    });
    timers.push(setTimeout(finish, still ? 1100 : 2000));
  }

  GL.ablegen = { play, calls: CALLS };
})();
