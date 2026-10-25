// C4: Board-Inhalt aus Varianten bauen (gemeinsam für die Fraktions-Boards ab Flossenvolk)
// V: { id: { n, f, m, a, b } }, badges: [[schlüssel, Name], ...], show: 'a'|'b' für die Kampfgröße
module.exports = function board(P, V, badges, show, demo) {
  const fig = (svg, cap) => `<figure>${svg}<figcaption>${cap}</figcaption></figure>`;
  const B = v => v.f + '_' + badges[0][0];
  let h = '';
  Object.keys(V).forEach(id => {
    const v = V[id];
    h += `<section><h2>${v.n} <small>${v.m}</small></h2><div class="row">`;
    ['a', 'b'].forEach(k => { h += `<div class="var"><b>${k.toUpperCase()}</b>` + ['normal', 'froh', 'sauer', 'muede'].map(md => fig(P.shaded(v[k], md, B(v)), md)).join('') + '</div>'; });
    h += '</div></section>';
  });
  h += '<section><h2>Abzeichen</h2><div class="row">';
  badges.forEach(([b, n]) => { h += `<div class="var"><b>${n}</b>` + demo.map(([id, k]) => fig(P.shaded(V[id][k], 'normal', V[id].f + '_' + b), V[id].n)).join('') + '</div>'; });
  h += `</div></section><section><h2>Kampfgröße <small>${show.toUpperCase()}</small></h2><div class="row small">` + Object.keys(V).map(id => fig(P.shaded(V[id][show], 'normal', B(V[id])), V[id].n)).join('') + '</div></section>';
  return h;
};
