// Story-Szenen: Kapitel-Karte, Bühne mit Figuren, Sprechblase mit Schreibmaschine und Stimmen (wie Stardew)
window.GL = window.GL || {};

(function () {
  let cur = null;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const L = pair => (Array.isArray(pair) ? (en() ? pair[1] : pair[0]) : pair);
  const seenOf = p => ((p.story = p.story || {}).seen = p.story.seen || []);

  function who(profile, id) {
    if (id === 'self') { const s = GL.meta.selfDef(profile) || { name: '', look: {} }; return { name: profile.nickname || (en() ? 'You' : 'Du'), spr: GL.sprites.render({ id: 'self', name: s.name, look: s.look }) }; }
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

  // Kulissen je Bühne: Kisten, Fässer, Palmen, Muscheln, Töpfe mit Dampf, Glühwürmchen
  function props(bg) {
    const P = {
      hafen: '<i class="st-post a"></i><i class="st-post b"></i><i class="st-lamp"></i><i class="st-crate a"></i><i class="st-crate b"></i><i class="st-barrel"></i><i class="st-rope"></i>',
      nacht: '<i class="st-post a"></i><i class="st-post b"></i><i class="st-lamp"></i><i class="st-barrel"></i><i class="st-fly a"></i><i class="st-fly b"></i><i class="st-fly c"></i><i class="st-fly d"></i>',
      schiff: '<i class="st-mast"></i><i class="st-barrel"></i><i class="st-crate a"></i><i class="st-cannon"></i>',
      insel: '<i class="st-palm a"><i></i></i><i class="st-palm b"><i></i></i><i class="st-shell a"></i><i class="st-shell b"></i><i class="st-crab"></i>',
      kueche: '<i class="st-pot"><i class="st-steam"></i></i><i class="st-pot b"><i class="st-steam"></i></i><i class="st-meat"></i><i class="st-crate a"></i>'
    };
    return P[bg] || '';
  }
  // Wer gerade nicht spricht, hüpft ab und zu oder schaut sich um
  function fidget(c) {
    if (!cur || cur !== c) return;
    const idle = [...c.el.querySelectorAll('.st-who:not(.talk)')];
    if (idle.length) {
      const w = idle[Math.floor(Math.random() * idle.length)];
      const k = Math.random() < 0.5 ? 'flip' : 'hop';
      w.classList.remove('flip', 'hop2'); void w.offsetWidth;
      w.classList.add(k === 'flip' ? 'flip' : 'hop2');
      setTimeout(() => w.classList.remove('flip', 'hop2'), 1200);
    }
    c.fidgetT = setTimeout(() => fidget(c), 1400 + Math.random() * 1800);
  }
  function play(profile, id, onDone) {
    const ch = (GL.data.story || []).concat(GL.data.storyLaunch || [], GL.data.crewClips || []).find(c => c.id === id);
    if (!ch || document.getElementById('story')) return;
    const cast = [...new Set(ch.lines.map(l => l[0]))];
    const W = {}; cast.forEach(c => { W[c] = who(profile, c); });
    let auto = false; try { auto = localStorage.getItem('grandline.storyAuto') === '1'; } catch (e) { /* egal */ }
    const el = document.createElement('div');
    el.id = 'story'; el.className = `story bg-${ch.bg || 'hafen'}${ch.home ? ' st-homebg' : ''}`;
    el.setAttribute('role', 'dialog');
    el.innerHTML = `<div class="st-sky"><i class="st-sun"></i><i class="st-cloud a"></i><i class="st-cloud b"></i><i class="st-stars"></i></div>
      ${ch.home && GL.ui && GL.ui.cardStage ? `<div class="st-home">${GL.ui.cardStage({ id: ch.home })}</div>` : ''}<div class="st-sea">${['hafen', 'schiff', 'insel', 'nacht'].includes(ch.bg) ? `<span class="st-ship">${GL.sprites.ship ? GL.sprites.ship((profile.cos && profile.cos.ship) || undefined) : ''}</span>` : ''}</div><div class="st-ground">${props(ch.bg)}</div><i class="st-bird a"></i><i class="st-bird b"></i>
      <div class="st-cast">${cast.map((c, i) => `<span class="st-who" data-w="${esc(c)}" style="--i:${i};--n:${cast.length};--from:${i < cast.length / 2 ? -1 : 1}"><i class="st-emote"></i><i class="st-spr">${W[c].spr}</i><i class="st-shadow"></i></span>`).join('')}</div>
      <div class="st-bar top"></div><div class="st-bar bot"></div>
      <div class="st-title"><small>${ch.kicker ? esc(L(ch.kicker)) : ch.home ? (en() ? 'Crew moment' : 'Crew-Moment') : (en() ? 'Chapter' : 'Kapitel') + ' ' + ch.no}</small><b>${esc(L(ch.title))}</b></div>
      <div class="st-ctl"><button class="st-auto${auto ? ' on' : ''}" data-st="auto">${en() ? 'Auto' : 'Auto'} ▶</button><button class="st-skip" data-st="skip">${en() ? 'Skip' : 'Überspringen'} ⏭</button></div>
      <div class="st-box" data-st="next"><span class="st-face"></span><div class="st-txt"><b class="st-name"></b><p class="st-line"></p></div><i class="st-more">▼</i></div>`;
    document.body.appendChild(el);
    cur = { el, ch, i: -1, typing: null, profile, onDone, W, auto };
    requestAnimationFrame(() => el.classList.add('in'));
    if (GL.sfx) GL.sfx.play('found');
    setTimeout(() => { if (cur && cur.el === el && !el.classList.contains('go')) { el.classList.add('go'); step(); } }, 1150);
    cur.fidgetT = setTimeout(() => fidget(cur), 2500);
    el.addEventListener('click', e => {
      if (!cur) return;
      const b = e.target.closest('[data-st]');
      if (b && b.dataset.st === 'skip') return end();
      if (b && b.dataset.st === 'auto') { cur.auto = !cur.auto; b.classList.toggle('on', cur.auto); try { localStorage.setItem('grandline.storyAuto', cur.auto ? '1' : '0'); } catch (e2) { /* egal */ } if (cur.auto && !cur.typing) cur.autoT = setTimeout(() => { if (cur && cur.auto) step(); }, 900); return; }
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
    clearTimeout(c.autoT);
    const [w, de, eng, emo, fxName] = c.ch.lines[c.i];
    const text = en() ? eng : de;
    c.el.querySelectorAll('.st-who').forEach(s => { s.classList.toggle('talk', s.dataset.w === w); s.classList.remove('hop'); });
    const me = c.el.querySelector(`.st-who[data-w="${CSS.escape(w)}"]`);
    if (me) { void me.offsetWidth; me.classList.add('hop'); const e = me.querySelector('.st-emote'); e.textContent = emo || ''; e.classList.remove('pop'); if (emo) { void e.offsetWidth; e.classList.add('pop'); } }
    fx(c, fxName, me);
    const box = c.el.querySelector('.st-box');
    box.classList.toggle('right', w === 'self');
    box.querySelector('.st-face').innerHTML = c.W[w].spr;
    box.querySelector('.st-name').textContent = c.W[w].name;
    const p = box.querySelector('.st-line'); p.textContent = '';
    box.classList.remove('done');
    let k = 0;
    const speed = 19;
    const tick = () => {
      if (!cur || cur !== c) return;
      k++;
      p.textContent = text.slice(0, k);
      const ch = text[k - 1];
      if (ch && /[a-zäöüß0-9]/i.test(ch) && GL.sfx && GL.sfx.voice) GL.sfx.voice(w, ch);
      if (k >= text.length) { c.typing = null; box.classList.add('done'); if (c.auto) c.autoT = setTimeout(() => { if (cur === c && c.auto) step(); }, 900 + text.length * 18); return; }
      c.typing = setTimeout(tick, /[.!?…]/.test(ch) ? speed * 4 : /,/.test(ch) ? speed * 2 : speed);
    };
    c.full = () => { p.textContent = text; box.classList.add('done'); };
    tick();
  }
  // Kleine Effekte pro Zeile: Wackeln, Kamera, Hüpfen, Blitz, Trommelwirbel
  function fx(c, name, me) {
    if (!name) return;
    const el = c.el, cls = 'fx-' + name;
    el.classList.remove('fx-shake', 'fx-flash', 'fx-dramatic', 'fx-zoom');
    void el.offsetWidth;
    if (name === 'jump') { el.querySelectorAll('.st-who').forEach((s, k) => { s.classList.remove('jumpall'); void s.offsetWidth; s.style.setProperty('--jd', (k * 0.06) + 's'); s.classList.add('jumpall'); }); }
    else if (name === 'zoom' && me) {
      const r = me.getBoundingClientRect(), W = el.clientWidth;
      el.style.setProperty('--zx', ((r.left + r.width / 2) / W * 100).toFixed(1) + '%');
      el.classList.add('fx-zoom'); setTimeout(() => el.classList.remove('fx-zoom'), 1600);
    } else if (name === 'sparkle' && me) {
      for (let k = 0; k < 7; k++) { const sp = document.createElement('i'); sp.className = 'st-spark'; sp.textContent = '✦'; sp.style.left = (Math.random() * 100) + '%'; sp.style.animationDelay = (k * 0.07) + 's'; me.appendChild(sp); setTimeout(() => sp.remove(), 1300); }
    } else el.classList.add(cls);
    if (GL.sfx && GL.sfx.sting) GL.sfx.sting(name);
  }
  function finishType() { const c = cur; clearTimeout(c.typing); c.typing = null; c.full(); }
  function end() {
    const c = cur; if (!c) return;
    clearTimeout(c.typing); clearTimeout(c.fidgetT); clearTimeout(c.autoT);
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

  // Crew-Momente: ein ungesehener Clip mit einer Figur aus Stammcrew oder letztem Run
  function clip(profile, ids) {
    const seen = seenOf(profile);
    const have = new Set(ids || []);
    return (GL.data.crewClips || []).find(c => !seen.includes(c.id) && have.has(c.home) && c.lines.every(l => l[0] === 'self' || l[0] === 'kalle' || have.has(l[0]) || ['ruffy', 'nami', 'zorro', 'lysop', 'sanji', 'chopper', 'robin', 'franky', 'brook'].includes(l[0]))) || null;
  }
  GL.story = { next, play, clip, active: () => !!cur };
})();
