// Live-Seekarte (Fork MAP): Antippen der Hafen-Szene öffnet eine kleine Pergament-Karte,
// auf der dein Schiff und die Schiffe der anderen Spieler segeln (oder vor Anker dösen).
//   GL.livemap.html(profile)  → Inhalt fürs Popup
//   GL.livemap.hint()         → kleiner „🗺 Live-Karte“-Knopf für die Ecke der Hafen-Szene
// Nur Anzeige aus vorhandenen Ranglisten-Zeilen (pos/updated, schon durch safeRows), keine Spiellogik.
window.GL = window.GL || {};

(function () {
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const L = (de, e) => (en() ? e : de);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' })[ch]);
  const clean = s => String(s == null ? '' : s).replace(/[<>"'`&\\\u0000-\u001f]/g, '').trim();
  const ageOf = r => { const t = Date.parse(r && r.updated); return isFinite(t) ? Date.now() - t : Infinity; };
  const isOn = r => ageOf(r) < 240000;
  const hash = s => { let h = 7; String(s).split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) | 0; }); return Math.abs(h); };
  const SEA_EN = { 'Paradies': 'Paradise', 'Fischmenscheninsel': 'Fish-Man Island' };

  // Karte: 360 × 250, drei Meere von links nach rechts, die Grand Line als gepunktete Route
  const W = 360, H = 250;
  const REG = [{ x: 8, w: 112 }, { x: 124, w: 112 }, { x: 240, w: 112 }];
  // Feste Inselplätze je Meer (relativ zur Region, 0..1), damit sich die Karte nie bewegt
  const SLOTS = [
    [[.16, .30], [.40, .20], [.70, .30], [.84, .52], [.62, .66], [.34, .58], [.14, .72], [.50, .84]],
    [[.12, .38], [.34, .24], [.58, .32], [.82, .22], [.86, .50], [.60, .58], [.30, .62], [.48, .86]],
    [[.14, .30], [.38, .40], [.62, .26], [.86, .36], [.74, .62], [.40, .66], [.20, .84], [.64, .86]]
  ];
  const ALT_SLOT = [[.50, .86], [.48, .86], [.64, .86]];   // Nebenroute (Fischmenscheninsel, Thriller Bark) unten in der Region
  const HARBOR = { x: 10, y: 226 };                          // Heimathafen unten links

  function seas() {
    return (GL.data.islands || []).slice(0, 3).map((s, i) => {
      const names = (s.small || []).concat(s.big || []).map(x => x.name).slice(0, 8);
      const pts = names.map((n, k) => { const sl = SLOTS[i][k] || SLOTS[i][k % 8]; return { n, x: REG[i].x + sl[0] * REG[i].w, y: 36 + sl[1] * 170 }; });
      const alt = s.alt ? { n: s.alt.name, isl: (s.alt.small || []).concat(s.alt.big || []).map(x => x.name), x: REG[i].x + ALT_SLOT[i][0] * REG[i].w, y: 36 + ALT_SLOT[i][1] * 170 } : null;
      return { i, name: s.name, pts, alt };
    });
  }

  // Wo steht ein Schiff? pos = { sea, isl } (deutsche Namen aus dem Spiel)
  function locate(S, pos) {
    if (!pos || !pos.sea) return null;
    const sea = clean(pos.sea), isl = clean(pos.isl || '');
    for (const s of S) {
      if (s.alt && (s.alt.n === sea || s.alt.isl.includes(isl))) return { x: s.alt.x, y: s.alt.y, sea: s.alt.n, isl: isl || s.alt.n };
      if (s.name === sea || s.pts.some(p => p.n === isl)) {
        const p = s.pts.find(q => q.n === isl);
        return p ? { x: p.x, y: p.y, sea: s.name, isl: p.n } : { x: REG[s.i].x + REG[s.i].w / 2, y: 120, sea: s.name, isl: '' };
      }
    }
    return null;
  }

  // ---------- Pixel-Pergament als SVG ----------
  function px(x, y, w, h, c, extra) { return `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${w}" height="${h}" fill="${c}"${extra || ''}/>`; }
  function islandArt(x, y, seed, big) {
    // kleine Klecks-Insel aus Pixelblöcken: Sand, Grün, ab und zu eine Palme
    const r = seed % 3, s = big ? 1.25 : 1;
    const w = Math.round((12 + r * 2) * s), h = Math.round(6 * s);
    let o = px(x - w / 2 - 1, y - h / 2 + 1, w + 2, h, '#c9a46a');                  // Schatten/Ufer
    o += px(x - w / 2, y - h / 2, w, h - 1, '#e8cf94');                               // Sand
    o += px(x - w / 2 + 2, y - h / 2 - 2, w - 4, h - 2, '#8fae6a');                   // Grün
    o += px(x - w / 2 + 4, y - h / 2 - 4, Math.max(4, w - 9), 2, '#7a9a58');
    if (r === 1) o += px(x + w / 2 - 4, y - h / 2 - 8, 1, 6, '#7a5a3a') + px(x + w / 2 - 6, y - h / 2 - 9, 5, 2, '#6e9a4a');
    return o;
  }
  function waves(seed) {
    let o = '';
    for (let k = 0; k < 16; k++) {
      const x = 14 + ((seed * 37 + k * 71) % 330), y = 30 + ((seed * 13 + k * 53) % 196);
      o += `<path d="M${x} ${y}h3v-1h3v1h3" stroke="#9cbfc4" stroke-width="1" fill="none" opacity=".75"/>`;
    }
    return o;
  }
  function compass(cx, cy) {
    const c = '#6b4a2a';
    return `<g class="lm-compass" shape-rendering="crispEdges">${px(cx - 1, cy - 11, 2, 22, c)}${px(cx - 11, cy - 1, 22, 2, c)}
      ${px(cx - 3, cy - 3, 6, 6, '#e8cf94')}${px(cx - 1, cy - 1, 2, 2, c)}${px(cx - 2, cy - 15, 4, 4, '#b4553a')}
      <text x="${cx}" y="${cy - 17}" text-anchor="middle" class="lm-n">N</text></g>`;
  }
  function serpent(x, y) {
    // Seeungeheuer-Kritzelei: drei Buckel und ein beleidigter Kopf
    const c = '#7a8f6a';
    return `<g class="lm-serp" opacity=".85"><path d="M${x} ${y}q4 -8 8 0M${x + 10} ${y}q4 -8 8 0M${x + 20} ${y}q4 -8 8 0" stroke="${c}" stroke-width="2" fill="none"/>
      ${px(x + 29, y - 9, 6, 5, c)}${px(x + 33, y - 8, 1, 1, '#2a2a1a')}${px(x + 35, y - 6, 2, 1, c)}</g>`;
  }
  function mapSvg(S, mySea) {
    const parts = [];
    // Pergament mit gestuften Pixel-Ecken
    parts.push(`<rect x="2" y="0" width="${W - 4}" height="${H}" fill="#f1dfb4"/><rect x="0" y="2" width="${W}" height="${H - 4}" fill="#f1dfb4"/>`);
    parts.push(`<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="#cfe2dc"/>`);   // Meer
    parts.push(waves(3));
    // Red Line zwischen den Meeren als Felsband, Grand Line als gepunktete Route
    parts.push(`<g shape-rendering="crispEdges">${[1, 2].map(i => px(REG[i].x - 4, 6, 4, H - 12, '#d9c79c') + px(REG[i].x - 3, 6, 2, H - 12, '#c4ad7e')).join('')}</g>`);
    S.forEach(s => {
      const on = s.name === mySea || (s.alt && s.alt.n === mySea);
      parts.push(`<rect class="lm-reg${on ? ' on' : ''}" x="${REG[s.i].x}" y="8" width="${REG[s.i].w}" height="${H - 16}" fill="none"/>`);
      const route = s.pts.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(' ');
      parts.push(`<path d="${route}" stroke="#a7825a" stroke-width="1.4" stroke-dasharray="2 3" fill="none" opacity=".8"/>`);
      s.pts.forEach((p, k) => parts.push(`<g><title>${esc(p.n)}</title>${islandArt(p.x, p.y, hash(p.n), k === s.pts.length - 1)}</g>`));
      if (s.alt) parts.push(`<g><title>${esc(s.alt.n)}</title>${islandArt(s.alt.x, s.alt.y, hash(s.alt.n) + 1, false)}<path d="M${s.alt.x - 9} ${s.alt.y + 7}h18" stroke="#6f9aa0" stroke-width="1" stroke-dasharray="1 2"/></g>`);
      const nm = en() ? (SEA_EN[s.name] || s.name) : s.name;
      parts.push(`<text x="${REG[s.i].x + REG[s.i].w / 2}" y="24" text-anchor="middle" class="lm-sea">${esc(nm)}</text>`);
    });
    parts.push(compass(334, 214));
    parts.push(serpent(176, 232));
    // Heimathafen
    parts.push(`<g shape-rendering="crispEdges">${px(HARBOR.x, HARBOR.y + 8, 110, 5, '#a7825a')}${[0, 36, 72, 106].map(d => px(HARBOR.x + d, HARBOR.y + 13, 3, 6, '#7a5a3a')).join('')}<text x="${HARBOR.x + 108}" y="${HARBOR.y + 6}" text-anchor="end" class="lm-sea lm-port">${esc(L('Hafen', 'Port'))}</text></g>`);
    // Holzrahmen
    parts.push(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#6b4a2a" stroke-width="2"/>`);
    return `<svg class="lm-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" aria-hidden="true">${parts.join('')}</svg>`;
  }

  // ---------- Schiffe ----------
  function shipBtn(o, k) {
    const left = (o.x / W * 100).toFixed(2), top = (o.y / H * 100).toFixed(2);
    const lim = o.anchor ? 6 : 9;
    const tag = o.me ? L('Du', 'You') : (o.name.length > lim ? o.name.slice(0, lim - 1) + '…' : o.name);
    const act = o.me ? '' : ` data-act="lm-view" data-id="${esc(o.id)}"`;
    return `<button class="lm-ship${o.me ? ' me' : ''}${o.on ? ' on' : ''}${o.anchor ? ' anchor' : ''} d${k % 3}"${act} style="left:${left}%;top:${top}%" aria-label="${esc(o.label)}" title="${esc(o.label)}"${o.me ? ' tabindex="-1"' : ''}>
      <span class="lm-hull">${GL.sprites && GL.sprites.ship ? GL.sprites.ship(o.look && typeof o.look === 'object' ? o.look : o.me ? null : { std: 1 }) : '⛵'}</span>
      <span class="lm-tag">${o.on ? '<i class="on-dot"></i>' : o.anchor ? '<i class="lm-anc">⚓</i>' : ''}${esc(tag)}</span></button>`;
  }

  function html(profile) {
    const S = seas();
    const mine = locate(S, GL.livePos);
    const others = GL.social && GL.social._others ? GL.social._others(profile).slice(0, 8) : [];
    const used = {};
    const place = (pt, id) => {
      // mehrere Schiffe am selben Ort leicht versetzt (fächerförmig)
      const key = Math.round(pt.x) + ':' + Math.round(pt.y), n = used[key] = (used[key] || 0) + 1;
      const off = [[0, 0], [36, 8], [-36, 8], [0, 32], [36, -24], [-36, -24], [0, -32], [36, 40]][(n - 1) % 8];
      return { x: Math.max(16, Math.min(W - 16, pt.x + off[0])), y: Math.max(26, Math.min(H - 14, pt.y - 10 + off[1])) };
    };
    const harborPt = n => ({ x: 26 + (n % 3) * 37, y: 214 - Math.floor(n / 3) * 32 });   // am Steg nebeneinander, zweite Reihe dahinter
    let hn = 0;
    const boats = [];
    const myLoc = mine ? place(mine) : harborPt(hn++);
    boats.push(Object.assign({ me: true, on: !!mine, look: profile.ship || null, label: mine ? L('Du · ', 'You · ') + (mine.isl || mine.sea) : L('Du · im Hafen', 'You · in port') }, myLoc));
    let atSea = 0, docked = 0;
    const docks = [];
    others.forEach(r => {
      const name = clean(r.name).slice(0, 24), cn = r.crewName ? clean(r.crewName).slice(0, 20) : '';
      const loc = isOn(r) ? locate(S, r.pos) : null;
      if (loc) atSea++; else docked++;
      if (!loc) { docks.push({ id: r.id, name, cn }); return; }   // vor Anker: als Chip unter der Karte, der Steg ist zu klein
      boats.push(Object.assign({ id: r.id, name, on: true, look: r.ship,
        label: `${name}${cn ? ' · ' + cn : ''} · ⛵ ${loc.isl || loc.sea}` }, place(loc)));
    });
    const mySea = mine ? mine.sea : '';
    const count = others.length
      ? `<p class="lm-count"><b>${atSea}</b> ${L('auf See', 'at sea')} · <b>${docked}</b> ${L('vor Anker', 'at anchor')}</p>`
      : `<p class="lm-empty">${L('Heute segelst du allein. Die Möwen zählen nicht.', 'You sail alone today. The gulls don’t count.')}</p>`;
    return `<div class="fpop-card lm-pop">
      <span class="event-kicker">${L('Live-Seekarte', 'Live sea chart')}</span>
      <h3>${L('Wer segelt wo?', 'Who sails where?')}</h3>
      <div class="lm-map">${mapSvg(S, mySea)}${boats.map(shipBtn).join('')}</div>
      ${count}
      ${docks.length ? `<div class="lm-docks"><span class="lm-dl">⚓ ${L('Am Steg', 'At the pier')}</span>${docks.slice(0, 6).map(d => `<button class="lm-dock" data-act="lm-view" data-id="${esc(d.id)}" title="${esc(d.name + (d.cn ? ' · ' + d.cn : ''))}">${esc(d.name.length > 10 ? d.name.slice(0, 9) + '…' : d.name)}</button>`).join('')}${docks.length > 6 ? `<em>+${docks.length - 6}</em>` : ''}</div>` : ''}
      <p class="lm-legend"><span><i class="on-dot"></i>${L('gerade auf See', 'at sea now')}</span><span>⚓ ${L('vor Anker', 'at anchor')}</span><span class="lm-me-key">${L('Du', 'You')}</span></p>
      <div class="fpop-btns"><button class="btn ghost" data-act="worldmap">🗺 ${L('Mein Fortschritt', 'My progress')}</button><button class="btn" data-act="pop-close">${L('Ahoi', 'Ahoy')}</button></div>
    </div>`;
  }

  function hint() {
    return `<button class="lm-hint" data-act="livemap" aria-label="${L('Live-Seekarte öffnen', 'Open live sea chart')}">🗺 ${L('Live-Karte', 'Live map')}</button>`;
  }

  GL.livemap = { html, hint, _locate: (pos) => locate(seas(), pos) };
})();
