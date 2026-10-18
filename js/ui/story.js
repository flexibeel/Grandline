// Story-Szenen: Kapitel-Karte, Bühne mit Figuren, Sprechblase mit Schreibmaschine und Stimmen (wie Stardew)
window.GL = window.GL || {};

(function () {
  let cur = null;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const L = pair => (Array.isArray(pair) ? (en() ? pair[1] : pair[0]) : pair);
  const seenOf = p => ((p.story = p.story || {}).seen = p.story.seen || []);

  function who(profile, id) {
    if (id === 'self') { const s = GL.meta.selfDef(profile); return { name: profile.nickname || (en() ? 'You' : 'Du'), spr: GL.sprites.render({ id: 'self', name: s.name, look: s.look }) }; }
    if (id === 'kalle') { const p = (GL.data.pets || []).find(x => x.id === 'moewe'); return { name: en() ? 'Kalle the News Coo' : 'Kalle, die Zeitungsmöwe', spr: p ? GL.sprites.renderShaded({ id: 'pet-moewe', art: p.art }) : '' }; }
    const d = GL.data.crew.find(c => c.id === id);
    return d ? { name: d.name, spr: GL.sprites.renderShaded ? GL.sprites.renderShaded(d) : GL.sprites.render(d) } : { name: id, spr: '' };
  }

  // Nächstes freigeschaltetes, noch nicht gesehenes Kapitel (immer der Reihe nach)
  function next(profile) {
    const seen = seenOf(profile);
    for (const c of GL.data.story || []) {
      if (seen.includes(c.id)) continue;
      return c.when(profile) ? c : null;
    }
    return null;
  }

  function play(profile, id, onDone) {
    const ch = (GL.data.story || []).find(c => c.id === id);
    if (!ch || document.getElementById('story')) return;
    const cast = [...new Set(ch.lines.map(l => l[0]))];
    const W = {}; cast.forEach(c => { W[c] = who(profile, c); });
    const el = document.createElement('div');
    el.id = 'story'; el.className = `story bg-${ch.bg}`;
    el.setAttribute('role', 'dialog');
    el.innerHTML = `<div class="st-sky"><i class="st-sun"></i><i class="st-cloud a"></i><i class="st-cloud b"></i><i class="st-stars"></i></div>
      <div class="st-sea">${['hafen', 'schiff', 'insel', 'nacht'].includes(ch.bg) ? `<span class="st-ship">${GL.sprites.ship ? GL.sprites.ship((profile.cos && profile.cos.ship) || undefined) : ''}</span>` : ''}</div><div class="st-ground">${ch.bg === 'hafen' || ch.bg === 'nacht' ? '<i class="st-post a"></i><i class="st-post b"></i><i class="st-lamp"></i>' : ch.bg === 'kueche' ? '<i class="st-pot"></i>' : ''}</div>
      <div class="st-cast">${cast.map((c, i) => `<span class="st-who" data-w="${esc(c)}" style="--i:${i};--n:${cast.length}"><i class="st-emote"></i><i class="st-spr">${W[c].spr}</i><i class="st-shadow"></i></span>`).join('')}</div>
      <div class="st-bar top"></div><div class="st-bar bot"></div>
      <div class="st-title"><small>${en() ? 'Chapter' : 'Kapitel'} ${ch.no}</small><b>${esc(L(ch.title))}</b></div>
      <button class="st-skip" data-st="skip">${en() ? 'Skip' : 'Überspringen'} ⏭</button>
      <div class="st-box" data-st="next"><span class="st-face"></span><div class="st-txt"><b class="st-name"></b><p class="st-line"></p></div><i class="st-more">▼</i></div>`;
    document.body.appendChild(el);
    cur = { el, ch, i: -1, typing: null, profile, onDone, W };
    requestAnimationFrame(() => el.classList.add('in'));
    if (GL.sfx) GL.sfx.play('found');
    setTimeout(() => { if (cur && cur.el === el) { el.classList.add('go'); step(); } }, 1700);
    el.addEventListener('click', e => {
      if (!cur) return;
      const b = e.target.closest('[data-st]');
      if (b && b.dataset.st === 'skip') return end();
      if (!el.classList.contains('go')) { el.classList.add('go'); return step(); }
      tap();
    });
  }
  function tap() {
    if (!cur) return;
    if (cur.typing) { finishType(); return; }
    step();
  }
  function step() {
    const c = cur; if (!c) return;
    c.i++;
    if (c.i >= c.ch.lines.length) return end();
    const [w, de, eng, emo] = c.ch.lines[c.i];
    const text = en() ? eng : de;
    c.el.querySelectorAll('.st-who').forEach(s => { s.classList.toggle('talk', s.dataset.w === w); s.classList.remove('hop'); });
    const me = c.el.querySelector(`.st-who[data-w="${CSS.escape(w)}"]`);
    if (me) { void me.offsetWidth; me.classList.add('hop'); const e = me.querySelector('.st-emote'); e.textContent = emo || ''; e.classList.remove('pop'); if (emo) { void e.offsetWidth; e.classList.add('pop'); } }
    const box = c.el.querySelector('.st-box');
    box.classList.toggle('right', w === 'self');
    box.querySelector('.st-face').innerHTML = c.W[w].spr;
    box.querySelector('.st-name').textContent = c.W[w].name;
    const p = box.querySelector('.st-line'); p.textContent = '';
    box.classList.remove('done');
    let k = 0;
    const speed = 26;
    const tick = () => {
      if (!cur || cur !== c) return;
      k++;
      p.textContent = text.slice(0, k);
      const ch = text[k - 1];
      if (ch && /[a-zäöüß0-9]/i.test(ch) && GL.sfx && GL.sfx.voice) GL.sfx.voice(w, ch);
      if (k >= text.length) { c.typing = null; box.classList.add('done'); return; }
      c.typing = setTimeout(tick, /[.,!?…]/.test(ch) ? speed * 5 : speed);
    };
    c.full = () => { p.textContent = text; box.classList.add('done'); };
    tick();
  }
  function finishType() { const c = cur; clearTimeout(c.typing); c.typing = null; c.full(); }
  function end() {
    const c = cur; if (!c) return;
    clearTimeout(c.typing);
    const seen = seenOf(c.profile); if (!seen.includes(c.ch.id)) seen.push(c.ch.id);
    cur = null;
    c.el.classList.add('out');
    setTimeout(() => c.el.remove(), 450);
    if (c.onDone) c.onDone(c.ch);
  }
  document.addEventListener('keydown', e => {
    if (!cur) return;
    if (e.key === 'Escape') { e.preventDefault(); end(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!cur.el.classList.contains('go')) { cur.el.classList.add('go'); step(); } else tap(); }
  }, true);

  GL.story = { next, play, active: () => !!cur };
})();
