// Figurenreise und Stil-Dojo (Regeln: js/engine/forms.js, Daten: js/data/forms.js)
//   GL.formsUi.section(profile)  Abschnitt im Kontor: Dojo des Tages + Reise aller Figuren
//   Dojo-Minispiel: drei Schläge im Takt. Ein Zeiger pendelt, im hellen Feld tippen. Das Feld wird jede Runde schmaler.
//   3 Treffer = gut, 2 = mittel, sonst schlecht. Mit dem Ergebnis kommen 5 / 3 / 1 Erinnerungsstücke.
//   Aufsteigen öffnet einen eigenen Moment: alte Figur, Blitz, neue Form mit Titel.
window.GL = window.GL || {};

(function () {
  const EN = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const L = a => (Array.isArray(a) ? (EN() ? a[1] : a[0]) : String(a == null ? '' : a));
  const T = s => (GL.i18n && GL.i18n.t ? GL.i18n.t(s) : s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const crew = id => (GL.data.crew || []).find(c => c.id === id);
  const STYLE = { kraft: ['Kraft', 'Power'], klinge: ['Klinge', 'Blade'], technik: ['Technik', 'Technique'], alle: ['alle Stile', 'every style'] };
  const DAYS = [['So', 'Sun'], ['Mo', 'Mon'], ['Di', 'Tue'], ['Mi', 'Wed'], ['Do', 'Thu'], ['Fr', 'Fri'], ['Sa', 'Sat']];

  function pix(art) {
    const P = GL.data.formPal || {};
    let r = '';
    art.forEach((row, y) => row.split('').forEach((ch, x) => { if (P[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${P[ch]}"/>`; }));
    return `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  }
  const item = id => (GL.data.forms[id] || {}).item || { name: ['?', '?'], art: [] };
  const itemIco = id => `<i class="fr-ico">${pix(item(id).art)}</i>`;
  const sprite = d => `<i class="fr-spr">${GL.sprites.render(d)}</i>`;

  // ---------- Abschnitt im Kontor ----------
  function section(profile) {
    if (!GL.forms) return '';
    const F = GL.forms, C = F.conf(), st = F.dayStyle(), en = EN();
    const figs = F.dojoFigs(profile), am = F.amber(profile);
    const week = (GL.data.dojoDays || []).map((s, i) => `<span class="fr-day${i === new Date().getDay() ? ' on' : ''}"><b>${L(DAYS[i])}</b>${esc(L(STYLE[s] || STYLE.alle))}</span>`);
    week.push(week.shift());   // Woche ab Montag
    const ids = Object.keys(GL.data.forms || {}).filter(id => F.known(profile, id) && crew(id));
    const cards = ids.map(id => {
      const d = crew(id), l = F.level(profile, id), nx = F.next(profile, id), t = F.title(profile, id), n = F.mem(profile, id);
      const bar = nx ? Math.min(100, Math.round(100 * n / nx.f.need)) : 100;
      const goal = nx ? `<span class="fr-need${nx.bossOk ? ' ok' : ''}">${nx.bossOk ? '✓' : '🔒'} ${esc(en ? 'Beat' : 'Besiege')} ${esc(T(F.bossName(nx.f.boss)))}</span>` : `<span class="fr-need ok">★ ${en ? 'Final form for now' : 'Vorerst letzte Form'}</span>`;
      return `<div class="fr-card${nx && nx.ok ? ' ready' : ''}">
        <div class="fr-top">${sprite(d)}<span class="fr-name"><b>${esc(T(d.name))}</b><small>${t ? esc(L(t)) : (en ? 'Story start' : 'Story-Anfang')}</small></span><span class="fr-lv" title="${en ? 'Form' : 'Form'}">${'◆'.repeat(l)}${'◇'.repeat(Math.max(0, (GL.data.forms[id].forms || []).length - l))}</span></div>
        ${nx ? `<div class="fr-next"><small>${en ? 'Next' : 'Als Nächstes'}: <b>${esc(L(nx.f.title))}</b></small>
          <div class="fr-bar">${itemIco(id)}<span class="fr-track"><i style="width:${bar}%"></i></span><b>${n}/${nx.f.need}</b></div>${goal}</div>` : goal}
        ${nx && nx.ok ? `<button class="btn fr-upbtn" data-act="fr-up" data-id="${id}">✦ ${en ? 'Rise up' : 'Aufsteigen'}</button>` : ''}
      </div>`;
    }).join('');
    return `<section class="hq-sec fr-sec">
      <h4 class="stb-sec">${en ? 'Style dojo' : 'Stil-Dojo'} <small>${en ? 'today' : 'heute'}: ${esc(L(STYLE[st]))}</small></h4>
      <div class="fr-dojo">
        <div class="fr-week">${week.join('')}</div>
        <p class="hint">${en ? `Train one figure of today's style. Three strikes in rhythm, every hit brings mementos for its next story form.` : `Trainiere eine Figur des Tagesstils. Drei Schläge im Takt, jeder Treffer bringt Erinnerungsstücke für ihre nächste Story-Form.`}</p>
        <div class="fr-picks">${figs.length ? figs.map(id => `<button class="fr-pick" data-act="fr-dojo" data-id="${id}"${am >= C.dojoCost ? '' : ' disabled'}>${sprite(crew(id))}<b>${esc(T(crew(id).name))}</b><small>${itemIco(id)} ${F.mem(profile, id)}</small></button>`).join('')
          : `<p class="hint">${en ? 'Nobody of this style on board yet. Tomorrow is another style.' : 'Noch niemand dieses Stils an Bord. Morgen ist ein anderer Stil dran.'}</p>`}</div>
        <p class="hint small">${en ? `One session: ${C.dojoCost} 🟧 amber (you have ${am}).` : `Eine Einheit: ${C.dojoCost} 🟧 Bernstein (du hast ${am}).`}</p>
      </div>
      <h4 class="stb-sec">${en ? 'Character journey' : 'Figurenreise'} <small>${en ? 'story forms' : 'Story-Formen'}</small></h4>
      <p class="hint">${en ? `Beat the story boss once and collect enough mementos: the figure rises to its next form. New title, new look, +${Math.round(C.bonus * 100)} % health and attack.` : `Story-Boss einmal besiegen und genug Erinnerungsstücke sammeln: Die Figur steigt in ihre nächste Form auf. Neuer Titel, neuer Look, +${Math.round(C.bonus * 100)} % Leben und Angriff.`}</p>
      <div class="fr-grid">${cards}</div>
    </section>`;
  }

  // ---------- Dojo-Minispiel ----------
  const ROUNDS = [{ w: 0.30, ms: 1300 }, { w: 0.22, ms: 1050 }, { w: 0.15, ms: 850 }];
  let G = null, raf = 0;
  const card = (inner, cls) => `<div class="fpop-card fr-pop${cls ? ' ' + cls : ''}" role="dialog">${inner}</div>`;

  function zoneOf(i) {
    const w = ROUNDS[i].w, c = 0.25 + Math.random() * 0.5;
    return { a: Math.max(0.04, c - w / 2), b: Math.min(0.96, c + w / 2) };
  }
  function dojoStart(profile, id) {
    if (!GL.forms || !GL.forms.dojoFigs(profile).includes(id) || !GL.forms.dojoPay(profile)) return null;
    stop();
    G = { id, i: 0, hits: [], zone: zoneOf(0), t0: performance.now(), locked: false, done: false };
    return playHtml();
  }
  // Zeiger pendelt hin und her (Dreieck), Position 0..1
  const pos = () => { const R = ROUNDS[G.i], ph = ((performance.now() - G.t0) % (2 * R.ms)) / R.ms; return ph <= 1 ? ph : 2 - ph; };
  function playHtml() {
    const d = crew(G.id), en = EN();
    const dots = ROUNDS.map((_, i) => `<i class="${i < G.hits.length ? (G.hits[i] ? 'hit' : 'miss') : i === G.i ? 'cur' : ''}"></i>`).join('');
    return card(`<span class="fpop-kicker">${en ? 'Style dojo' : 'Stil-Dojo'} · ${esc(T(d.name))}</span>
      <h3>${en ? 'Strike in rhythm!' : 'Schlag im Takt!'}</h3>
      <div class="fr-stage"><i class="fr-dummy">${GL.sprites.render({ id: 'dojo-dummy', look: { hair: '#8a5a30', skin: '#c4904f', shirt: '#a87a48', pants: '#8a5a30', hat: 'cap', hatColor: '#6a4424' } })}</i>${sprite(d)}<b class="fr-say" id="fr-say"></b></div>
      <div class="fr-meter" id="fr-meter"><span class="fr-zone" style="left:${G.zone.a * 100}%;width:${(G.zone.b - G.zone.a) * 100}%"></span><span class="fr-needle" id="fr-needle"></span></div>
      <div class="fr-dots">${dots}</div>
      <div class="fpop-btns"><button class="btn fr-hit" data-act="fr-hit">${en ? 'Strike!' : 'Schlag!'}</button></div>
      <p class="hint small">${en ? 'Tap when the pointer is in the bright field. Space works too.' : 'Tippe, wenn der Zeiger im hellen Feld ist. Leertaste geht auch.'}</p>`);
  }
  function loop() {
    cancelAnimationFrame(raf);
    const tick = () => {
      if (!G || G.done) return;
      const n = document.getElementById('fr-needle');
      if (!n) { stop(); return; }
      if (!G.locked) n.style.left = (pos() * 100) + '%';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  // Ein Schlag. Gibt { html } zurück, wenn das Fenster neu gezeichnet werden soll
  function hit(profile) {
    if (!G || G.done || G.locked) return null;
    const p = pos(), ok = p >= G.zone.a && p <= G.zone.b;
    G.hits.push(ok);
    G.locked = true;
    if (GL.sfx) GL.sfx.play(ok ? 'crit' : 'miss');
    const say = document.getElementById('fr-say'), st = document.querySelector('.fr-stage');
    if (say) { say.textContent = ok ? (EN() ? 'Hit!' : 'Treffer!') : (EN() ? 'Missed!' : 'Daneben!'); say.className = 'fr-say ' + (ok ? 'ok' : 'no'); }
    if (st) { st.classList.remove('strike', 'whiff'); void st.offsetWidth; st.classList.add(ok ? 'strike' : 'whiff'); }
    return new Promise(res => setTimeout(() => {
      if (!G) return res(null);
      if (G.hits.length < ROUNDS.length) {
        G.i = G.hits.length; G.zone = zoneOf(G.i); G.t0 = performance.now(); G.locked = false;
        return res(playHtml());
      }
      G.done = true;
      const n = G.hits.filter(Boolean).length, grade = n >= 3 ? 2 : n === 2 ? 1 : 0;
      G.grade = grade; G.gain = GL.forms.dojoReward(profile, G.id, grade);
      if (GL.sfx) GL.sfx.play(grade === 2 ? 'level' : 'found');
      res(endHtml(profile));
    }, 650));
  }
  function endHtml(profile) {
    const d = crew(G.id), en = EN(), nx = GL.forms.next(profile, G.id), it = item(G.id);
    const head = (en ? ['Keep practising', 'Not bad at all', 'Perfect rhythm!'] : ['Weiter üben', 'Gar nicht schlecht', 'Perfekter Takt!'])[G.grade];
    return card(`<span class="fpop-kicker">${en ? 'Style dojo' : 'Stil-Dojo'} · ${G.hits.filter(Boolean).length}/3</span>
      <h3>${head}</h3>
      <div class="fr-gain">${itemIco(G.id)}<span><b>+${G.gain} ${esc(L(it.name))}</b><small>${esc(L(it.text || ''))}</small></span></div>
      ${nx ? `<p class="hint">${esc(T(d.name))}: ${GL.forms.mem(profile, G.id)}/${nx.f.need} ${en ? 'for' : 'für'} „${esc(L(nx.f.title))}“${nx.bossOk ? '' : ` · ${en ? 'still need to beat' : 'noch zu besiegen'}: ${esc(T(GL.forms.bossName(nx.f.boss)))}`}</p>` : ''}
      <div class="fpop-btns">${nx && nx.ok ? `<button class="btn" data-act="fr-up" data-id="${G.id}">✦ ${en ? 'Rise up now' : 'Jetzt aufsteigen'}</button>` : ''}<button class="btn ghost" data-act="fr-close">${en ? 'Back to the counting house' : 'Zurück ins Kontor'}</button></div>`);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  // ---------- Aufstiegs-Moment ----------
  function upHtml(profile, id) {
    const d = crew(id), before = GL.forms.level(profile, id);
    const oldTitle = GL.forms.title(profile, id);
    const oldSpr = GL.sprites.render(d);   // vor dem Aufstieg zeichnen
    const f = GL.forms.up(profile, id);
    if (!f) return null;
    const en = EN(), C = GL.forms.conf();
    if (GL.sfx) GL.sfx.play('level');
    return card(`<span class="fpop-kicker">${en ? 'Story form' : 'Story-Form'} ${before + 1}</span>
      <div class="fr-rise"><i class="fr-old">${oldSpr}</i><i class="fr-flash"></i><i class="fr-new">${GL.sprites.render(d)}</i><span class="fr-sparks">${'<b></b>'.repeat(8)}</span></div>
      <h3 class="fr-title">${esc(T(d.name))}, ${esc(L(f.title))}</h3>
      <p class="hint">${oldTitle ? `${en ? 'Was' : 'Bisher'}: ${esc(L(oldTitle))} · ` : ''}+${Math.round(C.bonus * 100)} % ${en ? 'health and attack in every run' : 'Leben und Angriff in jedem Run'}</p>
      <div class="fpop-btns"><button class="btn" data-act="fr-close">${en ? 'Onward!' : 'Weiter geht’s!'}</button></div>`, 'rise');
  }

  // Zeile in der Landgang-Beute
  function lootRow(id) {
    const d = crew(id), it = item(id);
    return `<li class="dg-findrow">${`<span class="dg-find big">${pix(it.art)}</span>`}<span><b>+1 ${esc(L(it.name))}</b><small>${EN() ? 'Memento for' : 'Erinnerungsstück für'} ${esc(T(d ? d.name : id))}</small></span></li>`;
  }

  GL.formsUi = { section, dojoStart, hit, upHtml, lootRow, loop, stop, active: () => !!(G && !G.done) };
})();
