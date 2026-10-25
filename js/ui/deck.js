// CREW-START „Das Deck“: vor dem Ablegen die ganze Crew direkt auf dem Schiff aufstellen.
// Himmel mit Kombo-Wimpeln und Kampfwert-Leiste, Deck mit zwei Reihen (vorne / hinten), Steg mit allen eigenen Figuren.
// Der eigene Pirat steht immer an Deck und kostet nichts. Jede andere Figur kostet ihren Kampfwert (GL.run.kw).
// Zustand: ui.deck = { key, slots[6] (ids oder null, Platz 0–2 vorne, 3–5 hinten), sel, filter }
// Engine-Aktion beim Ablegen: { type: 'deck', ids } (siehe run.js, Phase 'starter')
window.GL = window.GL || {};

(function () {
  const N = () => GL.config.maxCrew;
  const byId = (list, id) => list.find(x => x.id === id);
  const crewData = id => byId(GL.data.crew, id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const en = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');

  const cost = ids => ids.reduce((s, id) => s + (id ? GL.run.kw(id) : 0), 0);

  // Zustand anlegen: letzte Aufstellung wiederholen, sonst Starter, solange das Budget reicht
  function state(run, ui) {
    const key = run.seed + ':deck';
    if (ui.deck && ui.deck.key === key) return ui.deck;
    const pool = GL.run.deckPool(run), B = run.deckBudget;
    const slots = new Array(N()).fill(null);
    const last = ui.profile && Array.isArray(ui.profile.lastDeck) ? ui.profile.lastDeck : null;
    if (last && last.includes('self')) {
      last.slice(0, N()).forEach((id, i) => {
        if (id === 'self') slots[i] = 'self';
        else if (id && pool.includes(id) && cost(slots) + GL.run.kw(id) <= B) slots[i] = id;
      });
    }
    if (!slots.includes('self')) {
      const at = slots.indexOf(null);
      slots[at < 0 ? 0 : at] = 'self';
    }
    if (!last) GL.config.starters.forEach(id => {
      const at = slots.indexOf(null);
      if (at >= 0 && pool.includes(id) && !slots.includes(id) && cost(slots) + GL.run.kw(id) <= B) slots[at] = id;
    });
    ui.deck = { key, slots, sel: null, filter: 'all' };
    return ui.deck;
  }

  // Wimpel am Mast: aktive Synergien zuerst, dann die, denen nur wenig fehlt
  function pennants(ids) {
    if (!(GL.effects && GL.effects.status)) return [];
    const list = GL.effects.status(ids.map(crewData).filter(Boolean)).filter(s => s.count > 0);
    const tier = s => s.active ? s.tiers.indexOf(s.active) + 1 : 0;
    list.sort((a, b) => (tier(b) - tier(a)) || ((b.next ? b.count / b.next.n : 0) - (a.next ? a.count / a.next.n : 0)));
    return list.filter(s => s.active || (s.next && s.next.n - s.count <= 1)).slice(0, 4);
  }

  function sprite(d) { return GL.sprites && GL.sprites.render ? GL.sprites.render(d) : ''; }

  function slotHtml(st, i) {
    const id = st.slots[i], d = id && crewData(id), sel = st.sel && st.sel.slot === i;
    const target = (st.sel && st.sel.fig ? ' dk-target' : '') + (d && st.landed === i ? ' dk-land' : '');
    if (!d) {
      return `<button class="dk-slot dk-empty${target}${sel ? ' on' : ''}" data-act="deck-slot" data-i="${i}" aria-label="${en() ? 'Empty spot' : 'Freier Platz'}">
        <span class="dk-plus" aria-hidden="true">+</span><small>${en() ? 'free' : 'frei'}</small></button>`;
    }
    const cap = id === 'self';
    return `<button class="dk-slot${cap ? ' dk-cap' : ''}${sel ? ' on' : ''}${target}" data-act="deck-slot" data-i="${i}" title="${esc(d.name)}${cap ? (en() ? ': your pirate, always aboard' : ': dein Pirat, immer an Bord') : ''}">
      <i class="dk-spr">${sprite(d)}</i>
      <span class="dk-name">${esc(d.name)}</span>
      <span class="dk-kw">${cap ? `<b class="dk-capk">${en() ? 'Captain' : 'Kapitän'}</b>` : `<b>${GL.run.kw(id)}</b> <small>KW</small>`}</span>
    </button>`;
  }


  // Fahrtbrief: warum lohnt sich diese Fahrt? Höchstens 3 Zeilen. Jede Zeile ist ein mögliches Fahrtziel (A4).
  function briefRows(profile) {
    const rows = [];
    // (a) nächste Figur
    const next = GL.meta.nextUnlocks(profile, 1);
    if (next.length) {
      const { u, pr } = next[0];
      const d = crewData(u.unlock);
      const pct = Math.round(100 * pr.have / Math.max(1, pr.need));
      rows.push({ kind: 'fig', id: u.unlock, tip: u.text, html: `<i class="fb-spr">${GL.sprites.render(d)}</i>
        <span class="fb-b"><b>${esc(d.name)}</b><small>${esc(u.text)}</small>
          <span class="fb-bar"><i style="width:${pct}%"></i></span></span>
        <em class="fb-left">${pr.have}/${pr.need}</em>` });
    }
    // (b) offener Auftrag mit dem meisten Fortschritt
    if (GL.meta.featureOpen && GL.meta.featureOpen(profile, 'quests')) {
      const qs = GL.meta.questsEnsure(profile);
      let best = null, bestF = -1;
      for (const q of qs) {
        const pr = GL.meta.questProgress(profile, q);
        if (pr.done) continue;
        const f = pr.have / Math.max(1, pr.need);
        if (f > bestF) { bestF = f; best = { q, pr }; }
      }
      if (best) {
        const def = GL.meta.questDef(best.q);
        const qText = String(def.text || '').replace('{n}', best.q.n.toLocaleString('de-DE'));
        const pct = Math.round(100 * best.pr.have / Math.max(1, best.pr.need));
        rows.push({ kind: 'quest', id: best.q.id, tip: qText, html: `<i class="fb-ico">${def.icon || '?'}</i>
          <span class="fb-b"><b>${en() ? 'Quest' : 'Auftrag'}</b><small>${esc(qText)}</small>
            <span class="fb-bar"><i style="width:${pct}%"></i></span></span>
          <em class="fb-left">${best.pr.have}/${best.pr.need}</em>` });
      }
    }
    // (c) Rang
    const rp = GL.meta.rankProgress(profile);
    if (rp && rp.next && rp.need > rp.have) {
      const left = rp.need - rp.have;
      const pct = Math.round(100 * rp.have / Math.max(1, rp.need));
      const name = esc(rp.next.name);
      rows.push({ kind: 'rank', id: 'rank', tip: en() ? 'Victories and long voyages give rank XP.' : 'Siege und weite Fahrten bringen Rang-EP.', html: `<i class="fb-ico">⚓</i>
        <span class="fb-b"><b>${en() ? 'Rank' : 'Rang'}</b><small>${en() ? `still ${left} rank XP until ${name}` : `noch ${left} Rang-EP bis ${name}`}</small>
          <span class="fb-bar"><i style="width:${pct}%"></i></span></span>
        <em class="fb-left">${left}</em>` });
    }
    return rows.slice(0, 3);
  }
  // Das gewählte Ziel, sonst (ohne Tippen) die oberste Zeile
  function currentGoal(profile, ui) {
    const rows = briefRows(profile);
    const g = ui && ui.briefGoal;
    const hit = g && rows.find(r => r.kind === g.kind && String(r.id) === String(g.id));
    const r = hit || rows[0];
    return r ? { kind: r.kind, id: r.id } : null;
  }
  function briefHtml(profile, ui) {
    if (!profile || !GL.meta) return '';
    const rows = briefRows(profile);
    if (!rows.length) return '';
    const cur = currentGoal(profile, ui);
    const title = en() ? 'Your destination' : 'Dein Fahrtziel';
    return `<div class="fahrtbrief"><span class="fb-kicker">${title}</span>${rows.map(r => {
      const on = cur && cur.kind === r.kind && String(cur.id) === String(r.id);
      return `<div class="fb-row${on ? ' on' : ''}" data-act="goal-set" data-kind="${r.kind}" data-id="${esc(r.id)}" data-tip="${esc(r.tip)}" tabindex="0" role="button" aria-pressed="${on ? 'true' : 'false'}">${r.html}</div>`;
    }).join('')}</div>`;
  }
  // Startstand des gewählten Ziels (beim Ablegen gemerkt)
  function goalStart(profile, g) {
    if (!g || !profile || !GL.meta) return g;
    if (g.kind === 'quest') {
      const q = (profile.quests || []).find(x => x.id === g.id);
      if (q) { const pr = GL.meta.questProgress(profile, q); g.have0 = pr.have; g.need0 = pr.need; }
    } else if (g.kind === 'rank') {
      const rp = GL.meta.rankProgress(profile);
      g.rank0 = GL.meta.rankIndex(profile); g.have0 = rp ? rp.have : 0; g.need0 = rp ? rp.need : 1;
    } else if (g.kind === 'fig') {
      const n = GL.meta.nextUnlocks(profile, 999).find(x => x.u.unlock === g.id);
      if (n) { g.have0 = n.pr.have; g.need0 = n.pr.need; }
    }
    return g;
  }
  // Stand des Ziels jetzt: geschafft heißt in DIESER Fahrt erreicht (Figur freigeschaltet, Auftrag erfüllt, Rangstufe gestiegen)
  function goalStatus(profile, g) {
    if (!g || !profile || !GL.meta) return null;
    if (g.kind === 'fig') {
      const d = crewData(g.id);
      const done = (profile.unlocked || []).includes(g.id);
      const n = done ? null : GL.meta.nextUnlocks(profile, 999).find(x => x.u.unlock === g.id);
      const need = n ? n.pr.need : (g.need0 || 1);
      return { name: d ? d.name : String(g.id), done, have: done ? need : (n ? n.pr.have : (g.have0 || 0)), need };
    }
    if (g.kind === 'quest') {
      const q = (profile.quests || []).find(x => x.id === g.id);
      const pr = q ? GL.meta.questProgress(profile, q) : null;
      return { name: en() ? 'Quest' : 'Auftrag', done: !!(pr && pr.done), have: pr ? pr.have : (g.have0 || 0), need: pr ? pr.need : (g.need0 || 1) };
    }
    if (g.kind === 'rank') {
      const rp = GL.meta.rankProgress(profile);
      const done = GL.meta.rankIndex(profile) > (g.rank0 | 0);
      return { name: en() ? 'Rank' : 'Rang', done, have: done ? 1 : (rp ? rp.have : 0), need: done ? 1 : (rp ? rp.need : 1) };
    }
    return null;
  }

  function stage(run, ui) {
    const st = state(run, ui), B = run.deckBudget, used = cost(st.slots);
    ctx = { run, ui };
    setTimeout(() => { st.landed = null; }, 0);   // Einfeder-Effekt nur bei diesem einen Zeichnen
    const onDeck = st.slots.filter(Boolean);
    const pool = GL.run.deckPool(run);
    const T = GL.data.types;
    const f = st.filter || 'all';
    const shown = pool.filter(id => f === 'all' || crewData(id).type === f);
    const pct = Math.min(100, Math.round(100 * used / Math.max(1, B)));
    const pen = pennants(onDeck);
    const penHtml = pen.length ? pen.map(s => `<span class="dk-pen ${s.active ? 'act' : 'near'}" title="${esc(s.active ? s.active.text : s.next ? s.next.text : '')}"><b>${esc(s.name)}</b> <span>${s.count}${s.next ? `/${s.next.n}` : ''}</span>${s.active && !s.next ? ' <span>✓</span>' : ''}</span>`).join('')
      : `<span class="dk-pen calm">${en() ? 'No combo yet' : 'Noch keine Kombo'}</span>`;
    const chip = (k, name) => `<button class="dk-chip${f === k ? ' on' : ''}" data-act="deck-filter" data-v="${k}">${esc(name)}</button>`;
    const figs = shown.map(id => {
      const d = crewData(id), k = GL.run.kw(id), here = st.slots.includes(id);
      const tooDear = !here && used + k > B && !(st.sel && st.sel.slot != null && st.slots[st.sel.slot] && used - GL.run.kw(st.slots[st.sel.slot]) + k <= B);
      const sel = st.sel && st.sel.fig === id;
      return `<button class="dk-fig${here ? ' here' : ''}${tooDear ? ' dear' : ''}${sel ? ' on' : ''}" data-act="deck-fig" data-v="${esc(id)}"${tooDear ? ' aria-disabled="true"' : ''}
        title="${esc(d.name)} · ${k} KW${GL.data.abilities && GL.data.abilities[id] ? ' · ' + esc(GL.data.abilities[id].name) : ''}">
        <i class="dk-spr">${sprite(d)}</i><span class="dk-name">${esc(d.name)}</span><span class="dk-fkw">${here ? '✓' : k}</span></button>`;
    }).join('');
    const hint = st.sel && st.sel.fig ? (en() ? 'Now tap a spot on deck.' : 'Jetzt einen Platz an Deck antippen.')
      : st.sel && st.sel.slot != null ? (en() ? 'Tap another spot to swap, tap again to send ashore.' : 'Anderen Platz antippen zum Tauschen, nochmal tippen schickt an Land.')
      : (en() ? 'Tap or drag a figure from the jetty aboard.' : 'Figur am Steg antippen oder an Bord ziehen.');
    return `<div class="dk">
      <div class="dk-sky">
        <div class="dk-pens">${penHtml}</div>
        <div class="dk-meter">
          <span class="dk-mk">${en() ? 'Battle value' : 'Kampfwert'}</span>
          <span class="dk-bar" role="img" aria-label="${used} / ${B}"><i style="width:${pct}%"></i></span>
          <span class="dk-mv"><b>${used}</b> / ${B}</span>
        </div>
      </div>
      <div class="dk-deck">
        <span class="dk-row-k">${en() ? 'Front · takes the hits' : 'Vorne · fängt Treffer ab'}</span>
        <div class="dk-row">${[0, 1, 2].map(i => slotHtml(st, i)).join('')}</div>
        <span class="dk-row-k">${en() ? 'Back · stays covered' : 'Hinten · steht geschützt'}</span>
        <div class="dk-row">${[3, 4, 5].map(i => slotHtml(st, i)).join('')}</div>
      </div>
      <div class="dk-steg">
        <div class="dk-steg-h">
          <span class="dk-row-k">${en() ? 'At the jetty' : 'Am Steg'} <small>${pool.length}</small></span>
          <span class="dk-chips">${chip('all', en() ? 'All' : 'Alle')}${Object.keys(T).map(k => chip(k, T[k].name)).join('')}</span>
        </div>
        <div class="dk-figs">${figs}</div>
        ${briefHtml(ui.profile, ui)}
        <div class="dk-foot">
          <span class="dk-hint">${hint}</span>
          <button class="dk-go" data-act="deck-go">${en() ? 'Set sail' : 'Ablegen'} <small>${onDeck.length}/${N()}</small></button>
        </div>
      </div>
    </div>`;
  }

  // Klicks auf dem Deck. Gibt true zurück, wenn neu gezeichnet werden soll.
  function click(type, el, run, ui, act, profile, save) {
    const st = state(run, ui), B = run.deckBudget;
    const fits = (slots) => cost(slots) <= B;
    if (type === 'deck-filter') { st.filter = el.dataset.v || 'all'; return true; }
    if (type === 'deck-fig') {
      const id = el.dataset.v;
      if (!id || id === 'self' || !GL.run.deckPool(run).includes(id)) return false;
      const here = st.slots.indexOf(id);
      if (here >= 0) { st.slots[here] = null; st.sel = null; return true; }   // schon an Deck: zurück an den Steg
      if (el.classList.contains('dear') && !(st.sel && st.sel.slot != null)) return false;   // zu teuer, wie früher „disabled“
      // Ausgewählter Platz an Deck: Figur ersetzt ihn
      if (st.sel && st.sel.slot != null && st.slots[st.sel.slot] !== 'self') {
        const next = st.slots.slice(); next[st.sel.slot] = id;
        if (fits(next)) { st.landed = st.sel.slot; st.slots = next; st.sel = null; return true; }
      }
      // Sonst direkt auf den ersten freien Platz, wenn Budget reicht; bei vollem Deck erst Platz wählen
      const at = st.slots.indexOf(null);
      if (at >= 0) {
        const next = st.slots.slice(); next[at] = id;
        if (fits(next)) { st.landed = at; st.slots = next; st.sel = null; return true; }
      }
      st.sel = st.sel && st.sel.fig === id ? null : { fig: id };
      return true;
    }
    if (type === 'deck-slot') {
      const i = Number(el.dataset.i);
      if (!(i >= 0 && i < N())) return false;
      if (st.sel && st.sel.fig) {
        if (st.slots[i] === 'self') { st.sel = null; return true; }
        const next = st.slots.slice(); next[i] = st.sel.fig;
        if (fits(next)) { st.slots = next; st.landed = i; }
        st.sel = null; return true;
      }
      if (st.sel && st.sel.slot != null) {
        const j = st.sel.slot;
        if (j === i) { if (st.slots[i] !== 'self') st.slots[i] = null; }   // nochmal getippt: an Land
        else [st.slots[i], st.slots[j]] = [st.slots[j], st.slots[i]];      // tauschen (auch auf freie Plätze)
        st.sel = null; return true;
      }
      st.sel = st.slots[i] ? { slot: i } : null;
      return true;
    }

    // 9c C: Ziehen und Ablegen (kommt als unsichtbarer Knopf aus dem Zieh-Code unten)
    if (type === 'deck-drop') {
      const next = dropNext(st, el.dataset.src, el.dataset.to, B);
      if (!next) return false;
      st.slots = next; st.sel = null;
      st.landed = /^s:\d$/.test(el.dataset.to) ? Number(el.dataset.to.slice(2)) : null;
      return true;
    }
    if (type === 'goal-set') {
      const kind = el.dataset.kind, id = el.dataset.id;
      if (!kind || !id) return false;
      ui.briefGoal = { kind, id };
      return true;
    }
    if (type === 'deck-go') {
      const ids = st.slots.filter(Boolean);
      if (profile) { profile.lastDeck = st.slots.slice(); if (save) save(); }
      // Schnappschuss für die Run-Ende-Chips, Fahrtziel (gewählt oder oberste Zeile) samt Startstand merken
      ui.briefStart = {};
      if (profile && GL.meta && GL.meta.nextUnlocks) {
        GL.meta.nextUnlocks(profile, 5).forEach(({ u, pr }) => { ui.briefStart[u.unlock] = pr.have; });
      }
      ui.goalResult = null;
      ui.briefGoal = profile && GL.meta ? goalStart(profile, currentGoal(profile, ui)) : null;
      ui.deck = null;
      // 9c A+B: erst die kurze Ablege-Szene (antippbar), danach wie bisher die Aktion; ohne Szene sofort
      const go = () => act({ type: 'deck', ids });
      if (GL.ablegen && GL.ablegen.play) GL.ablegen.play(ids, run, profile, go); else go();
      return false;
    }
    return false;
  }

  // 9c C: Wohin darf eine gezogene Karte? Gibt die neuen Plätze zurück oder null (nicht erlaubt / nichts zu tun).
  // src: 'f:<id>' (vom Steg) oder 's:<i>' (von Deck), to: 's:<i>' oder 'steg'. Budget wie beim Tippen über cost().
  function dropNext(st, src, to, B) {
    const pool = ctx && ctx.run ? GL.run.deckPool(ctx.run) : [];
    let from = null, id = null;
    if (/^s:\d$/.test(src)) { from = Number(src.slice(2)); id = st.slots[from]; }
    else if (src && src.slice(0, 2) === 'f:') {
      id = src.slice(2);
      if (!id || id === 'self' || !pool.includes(id)) return null;
      const here = st.slots.indexOf(id); if (here >= 0) from = here;   // Karte ist schon an Deck: wie Ziehen von dort
    }
    if (!id) return null;
    const next = st.slots.slice();
    if (to === 'steg') {
      if (from == null || id === 'self') return null;   // der Kapitän bleibt immer an Bord
      next[from] = null; return next;
    }
    if (!/^s:\d$/.test(to)) return null;
    const i = Number(to.slice(2));
    if (!(i >= 0 && i < N()) || i === from) return null;
    if (from != null) { [next[i], next[from]] = [next[from], next[i]]; return next; }   // an Deck tauschen, Kosten bleiben
    if (next[i] === 'self') return null;
    next[i] = id;
    return cost(next) <= B ? next : null;
  }

  // 9c C: Karten ziehen. Maus: ab 5 px Bewegung. Finger: kurz halten (170 ms) oder zur Seite ziehen,
  // senkrechtes Wischen bleibt Scrollen. Tippen geht weiter über data-act wie bisher.
  let ctx = null, drag = null, eatClick = 0;
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function dropTarget(x, y) {
    const hit = document.elementFromPoint(x, y);
    if (!hit || !hit.closest) return null;
    const slot = hit.closest('.dk-slot');
    if (slot) return { el: slot, to: 's:' + slot.dataset.i };
    const steg = hit.closest('.dk-steg');
    return steg ? { el: steg, to: 'steg' } : null;
  }
  function mark(t) {
    if (drag.over && drag.over.el !== (t && t.el)) drag.over.el.classList.remove('dk-drop', 'dk-no');
    drag.over = t;
    if (!t) return;
    const st = ctx && ctx.ui && ctx.ui.deck;
    const ok = st && dropNext(st, drag.src, t.to, ctx.run.deckBudget);
    const pointless = t.to === 'steg' && drag.src.slice(0, 2) === 'f:' && !(st && st.slots.includes(drag.src.slice(2)));
    t.el.classList.toggle('dk-drop', !!ok);
    t.el.classList.toggle('dk-no', !ok && !pointless && (t.to !== 'steg'));
  }
  function lift(e) {
    const r = drag.el.getBoundingClientRect();
    const g = document.createElement('div');
    g.className = 'dk-ghost';
    g.setAttribute('aria-hidden', 'true');
    g.innerHTML = (drag.el.querySelector('.dk-spr') || {}).outerHTML || '';
    const nm = drag.el.querySelector('.dk-name'); if (nm) g.insertAdjacentHTML('beforeend', `<span class="dk-name">${esc(nm.textContent)}</span>`);
    g.style.width = Math.min(r.width, 96) + 'px';
    document.body.appendChild(g);
    drag.ghost = g; drag.gw = g.offsetWidth; drag.gh = g.offsetHeight;
    drag.home = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    drag.el.classList.add('dk-lift');
    document.body.classList.add('dk-dragging');
    drag.on = true;
    clearTimeout(drag.hold);
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (err) {}
    follow(e.clientX, e.clientY);
  }
  function follow(x, y) {
    drag.x = x; drag.y = y;
    drag.ghost.style.transform = `translate3d(${x - drag.gw / 2}px, ${y - drag.gh * 0.75}px, 0) rotate(-4deg) scale(1.08)`;
    mark(dropTarget(x, y));
  }
  function end(commit) {
    const d = drag; drag = null;
    if (!d) return;
    clearTimeout(d.hold);
    if (!d.on) return;
    eatClick = performance.now() + 400;
    document.body.classList.remove('dk-dragging');
    const t = commit ? d.over : null;
    if (t) t.el.classList.remove('dk-drop', 'dk-no');
    const st = ctx && ctx.ui && ctx.ui.deck;
    const ok = t && st && dropNext(st, d.src, t.to, ctx.run.deckBudget);
    if (ok) {
      d.ghost.remove();
      if (navigator.vibrate && t.to !== 'steg') try { navigator.vibrate(14); } catch (err) {}
      const b = document.createElement('button');   // läuft durch den normalen Klick-Weg (main.js), damit neu gezeichnet wird
      b.type = 'button'; b.hidden = true; b.dataset.act = 'deck-drop'; b.dataset.src = d.src; b.dataset.to = t.to; b.dataset.dkDrop = '1';
      (document.querySelector('.dk') || document.body).appendChild(b);
      b.click(); b.remove();
      return;
    }
    // Nicht erlaubt (oder daneben): Platz rüttelt rot, Karte fliegt zurück an ihren Ort
    if (t && t.to !== 'steg' && !reduced()) { t.el.classList.add('dk-shake'); setTimeout(() => t.el.classList.remove('dk-shake'), 420); }
    const g = d.ghost;
    if (reduced()) { g.remove(); d.el.classList.remove('dk-lift'); return; }
    g.classList.add('dk-back');
    g.style.transform = `translate3d(${d.home.x - d.gw / 2}px, ${d.home.y - d.gh / 2}px, 0)`;
    setTimeout(() => { g.remove(); d.el.classList.remove('dk-lift'); }, 260);
  }
  function srcOf(el) {
    if (el.classList.contains('dk-fig')) return el.dataset.v ? 'f:' + el.dataset.v : null;
    if (el.classList.contains('dk-slot') && !el.classList.contains('dk-empty')) return 's:' + el.dataset.i;
    return null;
  }
  if (typeof document !== 'undefined' && !GL.__deckDrag) {
    GL.__deckDrag = true;
    document.addEventListener('pointerdown', e => {
      if (drag) end(false);
      const el = e.target.closest && e.target.closest('.dk .dk-fig, .dk .dk-slot');
      if (!el || (e.button !== undefined && e.button !== 0) || !ctx || !ctx.run || ctx.run.phase !== 'starter') return;
      const src = srcOf(el); if (!src) return;
      drag = { el, src, id: e.pointerId, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, mouse: e.pointerType === 'mouse', on: false, over: null };
      if (!drag.mouse) drag.hold = setTimeout(() => { if (drag && !drag.on) lift({ clientX: drag.x, clientY: drag.y }); }, 170);
    });
    document.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.on) { follow(e.clientX, e.clientY); return; }
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy, dist = Math.hypot(dx, dy);
      drag.x = e.clientX; drag.y = e.clientY;
      if (drag.mouse ? dist >= 5 : (dist >= 8 && Math.abs(dx) > Math.abs(dy) * 1.2)) lift(e);
      else if (!drag.mouse && dist >= 8) end(false);   // senkrecht gewischt: das ist Scrollen
    });
    document.addEventListener('pointerup', e => { if (drag && e.pointerId === drag.id) end(true); });
    document.addEventListener('pointercancel', e => { if (drag && e.pointerId === drag.id) end(false); });
    // Während gezogen wird, darf die Seite nicht scrollen (touch-action allein reicht für „halten, dann ziehen“ nicht)
    document.addEventListener('touchmove', e => { if (drag && drag.on) e.preventDefault(); }, { passive: false });
    document.addEventListener('contextmenu', e => { if (drag) e.preventDefault(); });
    // Der Klick nach einem Ziehen ist kein Tipp
    document.addEventListener('click', e => {
      if (performance.now() < eatClick && !(e.target && e.target.dataset && e.target.dataset.dkDrop)) { e.stopPropagation(); e.preventDefault(); }
    }, true);
  }

  GL.deck = { stage, click, state, goalStatus, dropNext };
})();
