// Weltkarte „Wie weit bin ich?“ und „Nächstes Ziel“ im Hafen (Fork AA).
//   GL.worldmap.html(profile)     → Fenster mit Pergament-Seekarte: Meere, Inseln (besucht/geschafft/gesperrt), Modi
//   GL.worldmap.goalCard(profile) → kleine Karte mit 1–2 klaren Empfehlungen samt Grund
//   GL.worldmap.goals(profile)    → die Empfehlungen als Daten (für Tests)
// Alles nur aus Profilwerten abgeleitet, keine Spiellogik.
window.GL = window.GL || {};

(function () {
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const L = (de, e) => (en() ? e : de);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const byId = (list, id) => (list || []).find(x => x.id === id) || null;
  const foe = id => byId(GL.data.grunts, id) || byId(GL.data.bosses, id) || byId(GL.data.raids, id) || byId(GL.data.hunted, id) || byId(GL.data.crew, id);
  const icon = id => (GL.art && GL.art.icon ? GL.art.icon(id) : '');
  const counts = p => p.counts || {};
  const isOpen = (p, id) => GL.meta.featureOpen ? GL.meta.featureOpen(p, id) : false;

  // Status eines Meeres: gesperrt, aktuell oder geschafft
  function seaState(p, i) {
    const cleared = GL.meta.seasCleared(p).includes(i);
    const reached = i === 0 || !!counts(p)['reached:' + i] || GL.meta.seasCleared(p).includes(i - 1);
    return cleared ? 'done' : reached ? 'now' : 'lock';
  }
  function seaScene(i) {
    const id = ['ankunft', 'wueste', 'sturm'][i] || 'see';
    return GL.art && GL.art.scene ? GL.art.scene(id, { time: i === 2 ? 'dusk' : 'day' }) : '';
  }

  // ---------- Nächstes Ziel ----------
  function goals(p) {
    const out = [];
    const I = GL.data.islands || [];
    const cleared = GL.meta.seasCleared(p);
    // 1) Fortschritt auf den Meeren
    const cur = I.findIndex((s, i) => !cleared.includes(i));
    if (cur >= 0) {
      const sea = I[cur], prog = GL.meta.chapterProgress(p, cur);
      const left = GL.meta.chapterTargets(cur).filter(id => !(counts(p)['defeated:' + id] > 0));
      const bossLeft = (sea.bosses || []).filter(id => left.includes(id));
      const next = I[cur + 1];
      const target = bossLeft.length && left.length <= bossLeft.length ? bossLeft[0] : left[0];
      const f = target ? foe(target) : null;
      if (f) {
        const isBoss = (sea.bosses || []).includes(target);
        out.push({ k: 'sea', ico: GL.sprites.render(f), act: 'sail',
          title: L(`Besiege ${f.name}`, `Defeat ${f.name}`),
          why: isBoss && next ? L(`Boss im ${sea.name}. Danach ist ${next.name} offen.`, `Boss of ${sea.name}. Beat him and ${next.name} opens up.`)
            : L(`${sea.name}: ${prog.done} von ${prog.total} Bösewichten geschafft.`, `${sea.name}: ${prog.done} of ${prog.total} villains beaten.`) });
      }
    }
    // 2) Kleine Dinge, die sich gerade lohnen
    const extra = [];
    if (GL.cgear && GL.cgear.wishes) { const w = GL.cgear.wishes(p)[0], sg = w && GL.cgear.sigById(w), wh = sg && GL.cgear.sigWhere(sg), bd = sg && (GL.data.bosses || []).find(x => x.id === sg.boss);
      const enN = sg ? (GL.i18n && GL.i18n.t ? GL.i18n.t(sg.name) : sg.name) : '';
      if (wh) extra.unshift({ k: 'wish', ico: '🎯', act: 'atlas-open', title: L(`Jage ${sg.name}`, `Hunt ${enN}`),
        why: L(`Fällt bei ${bd ? bd.name : sg.boss}: ${wh.isl.name} (${wh.sea.name}). Bei der Kurswahl diese Insel nehmen.`, `Dropped by ${bd ? bd.name : sg.boss}: ${wh.isl.name} (${wh.sea.name}). Pick that island when setting course.`) }); }
    if (!p.crewName && ((p.stats && p.stats.runs) || 0) >= 2) extra.push({ k: 'crew', ico: '🏴', act: 'crew-name-open',
      title: L('Gib deiner Bande einen Namen', 'Name your crew'),
      why: L('Steht auf deiner Karte und in der Rangliste. Profil → Kampf → Bande.', 'Shows on your card and in the leaderboard. Profile → Combat → Crew.') });
    const sk = GL.skills && isOpen(p, 'gemuet') ? GL.skills.free(p) : 0;
    if (sk > 0) extra.push({ k: 'skill', ico: '✦', act: 'hq-tab', tab: 'gemuet',
      title: L(`${sk} Skillpunkt${sk === 1 ? '' : 'e'} frei`, `${sk} skill point${sk === 1 ? '' : 's'} free`),
      why: L('Im Skillbaum „Gemütlichkeit“ warten dauerhafte Boni.', 'Permanent bonuses are waiting in the “Coziness” skill tree.') });
    if (GL.cgear && GL.cgear.upgrades && GL.meta.squadUnlocked && GL.meta.squadUnlocked(p)) {
      const n = (GL.meta.squadIds(p) || []).reduce((s, id) => s + Object.keys(GL.cgear.upgrades(p, id) || {}).length, 0);
      if (n > 0) extra.push({ k: 'gear', ico: '▲', act: 'hq-tab', tab: 'stammcrew',
        title: L('Bessere Ausrüstung in der Truhe', 'Better gear in the chest'),
        why: L(n === 1 ? 'Ein Platz deiner Stammcrew kann stärker werden.' : `${n} Plätze deiner Stammcrew können stärker werden.`, `${n} slot${n === 1 ? '' : 's'} of your home crew can get stronger.`) });
    }
    if (isOpen(p, 'endlos') && !p.endlessRec && cleared.length) extra.push({ k: 'endless', ico: '∞', act: 'endless-open',
      title: L('Endlos lohnt sich jetzt', 'Endless pays off now'),
      why: L(`Du hast ${I[cleared[0]].name} geschafft: Runde um Runde härter, dafür 🔹 Meersplitter.`, `You beat ${I[cleared[0]].name}: harder every loop, but you earn 🔹 sea shards.`) });
    if (isOpen(p, 'daily') && GL.daily && !GL.daily.done(p)) extra.push({ k: 'daily', ico: icon('event'), act: 'daily-start',
      title: L('Tageskarte ist offen', 'Daily chart is open'),
      why: L('Eine Fahrt, alle dieselbe Route. Wer kommt am weitesten?', 'One voyage, everyone on the same route. Who gets furthest?') });
    if (isOpen(p, 'landgang') && !Object.values(p.dungeons || {}).some(d => d && d.clears > 0)) extra.push({ k: 'land', ico: icon('landgang'), act: 'dg-open',
      title: L('Erster Landgang', 'First shore leave'),
      why: L('Deine Stammcrew erkundet allein. Gute Ausrüstung als Beute.', 'Your home crew explores on its own. Good gear as loot.') });
    if (!extra.length) {
      const f = GL.meta.featureNext && GL.meta.featureNext(p);
      if (f) extra.push({ k: 'next', ico: '⭐', act: null, title: L(`Ab Rang ${f.lvl}: ${f.name}`, `From rank ${f.lvl}: ${f.name}`),
        why: L('Jede Fahrt bringt Rang-Erfahrung, auch verlorene.', 'Every voyage gives rank XP, even lost ones.') });
    }
    const wishG = extra.filter(g => g.k === 'wish');
    return wishG.concat(out, extra.filter(g => g.k !== 'wish')).slice(0, 2);
  }
  function goalCard(p) {
    if (!p || !p.nickname) return '';
    const G = goals(p);
    if (!G.length) return '';
    return `<div class="wg-card"><div class="wg-head"><span class="wg-k">${L('Nächstes Ziel', 'Next goal')}</span>
        <button class="wg-map" data-act="worldmap" aria-label="${L('Weltkarte', 'World map')}">${GL.art && GL.art.prop ? GL.art.prop('karte') : '🗺'}<span>${L('Weltkarte', 'World map')}</span></button></div>
      ${G.map(g => `<${g.act ? 'button' : 'div'} class="wg-goal wg-${g.k}"${g.act ? ` data-act="${g.act}"${g.tab ? ` data-tab="${g.tab}"` : ''}` : ''}>
        <i class="wg-ico">${g.ico}</i><span class="wg-t"><b>${esc(g.title)}</b><small>${esc(g.why)}</small></span>${g.act ? '<em class="wg-go">›</em>' : ''}</${g.act ? 'button' : 'div'}>`).join('')}
    </div>`;
  }

  // ---------- Weltkarte ----------
  function html(p) {
    const I = GL.data.islands || [];
    const C = counts(p);
    // „Du bist hier“: das am weitesten erreichte, noch offene Meer (nicht das erste)
    let hereIdx = -1; I.forEach((s, i) => { if (seaState(p, i) === 'now') hereIdx = i; });
    const seas = I.map((s, i) => {
      const st = seaState(p, i), prog = GL.meta.chapterProgress(p, i);
      const isles = (s.small || []).concat(s.big || []).map(x => {
        const seen = (C['isle:' + x.id] || 0) > 0;
        const vid = x.boss || x.villain, beat = vid && C['defeated:' + vid] > 0;
        const big = !!x.boss;
        const f = big && (seen || st !== 'lock') ? foe(x.boss) : null;
        const cls = beat ? 'beat' : seen ? 'seen' : st === 'lock' ? 'lock' : 'open';
        return `<span class="wm-isle ${cls}${big ? ' big' : ''}" title="${esc(x.name)}">${f ? `<i class="wm-foe">${GL.sprites.render(f)}</i>` : '<i class="wm-dot"></i>'}<small>${st === 'lock' && !seen ? '???' : esc(x.name)}</small>${beat ? '<em>✓</em>' : ''}</span>`;
      }).join('');
      const alt = s.alt ? `<div class="wm-alt${p.altOpen || p.altOpen1 ? '' : ' lock'}"><i>⤷</i> ${L('Abzweig', 'Branch')}: <b>${esc(s.alt.name)}</b>${p.altOpen || p.altOpen1 ? '' : ' 🔒'}</div>` : '';
      return `<section class="wm-sea ${st}">
        <div class="wm-scene">${seaScene(i)}${i === hereIdx ? `<span class="wm-here">${GL.sprites.ship ? GL.sprites.ship() : '⛵'}<b>${L('Du bist hier', 'You are here')}</b></span>` : ''}${st === 'lock' ? '<span class="wm-fog">🔒</span>' : ''}</div>
        <div class="wm-body">
          <div class="wm-title"><b>${esc(s.name)}</b><span class="wm-st">${st === 'done' ? L('✓ geschafft', '✓ cleared') : st === 'now' ? L('unterwegs', 'sailing') : L('gesperrt', 'locked')}</span></div>
          <div class="wm-bar"><i style="width:${prog.pct}%"></i><small>${prog.done}/${prog.total} ${L('Bösewichte', 'villains')}</small></div>
          <div class="wm-isles">${isles}</div>${alt}
        </div></section>`;
    }).join('<div class="wm-rope" aria-hidden="true"></div>');
    const MODES = [['endlos', '∞', L('Endlos', 'Endless')], ['daily', icon('event'), L('Tageskarte', 'Daily')], ['landgang', icon('landgang'), L('Landgang', 'Shore leave')],
      ['jagd', icon('raid'), 'Raid'], ['gemeinschaft', '🔱', L('Gemeinschaft', 'Together')], ['gemuet', '✦', L('Skillbaum', 'Skill tree')], ['stammcrew', icon('kampf'), L('Stammcrew', 'Home crew')]];
    const modes = MODES.filter(m => (GL.data.features || []).some(f => f.id === m[0])).map(([id, ico, name]) => {
      const f = GL.data.features.find(x => x.id === id), ok = isOpen(p, id);
      return `<span class="wm-mode${ok ? ' ok' : ''}"><i>${ico}</i><b>${esc(name)}</b><small>${ok ? '✓' : '🔒 ' + L('Rang ', 'Rank ') + f.lvl}</small></span>`;
    }).join('');
    return `<div class="fpop-card wm-pop" role="dialog" aria-labelledby="wm-t">
      <span class="fpop-kicker">${L('Weltkarte', 'World map')}</span><h3 id="wm-t">${L('Wie weit bin ich?', 'How far have I come?')}</h3>
      <div class="wm-chart">${seas}</div>
      <div class="wm-modes-h">${L('Freigeschaltet', 'Unlocked')}</div><div class="wm-modes">${modes}</div>
      <div class="fpop-btns"><button class="btn" data-act="pop-close">${L('Leinen los!', 'Cast off!')}</button></div></div>`;
  }

  GL.worldmap = { html, goals, goalCard };
})();
