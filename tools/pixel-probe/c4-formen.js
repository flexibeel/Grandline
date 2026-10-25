// C4 Sturmmöwen, Board 2: die 18 Story-Formen auf den gewählten B-Looks (Node: node tools/pixel-probe/c4-formen.js <ziel.html>)
// Je Figur zwei Wege A/B, jeweils Form 1 und Form 2 (Form 2 baut auf Form 1 auf). Form-Teile stehen in sprites.js (P24.FACC).
// A = die Idee der heutigen Form, neu gezeichnet und entschärft. B = eigene Idee, passend zum neuen Grund-Look.
// Felix, 25.10.: Lasse A, alle anderen B. Nicht gewählte Teile sind aus sprites.js entfernt (werden hier nicht mehr gezeichnet).
// Bewusst weg: lange Nase, Skelett, Geweih-Rentier, Extra-Arme, Zigarette, Strähne-Koch-Anzug (nur in A als Zitat-Rest sichtbar).
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const M = require('./c4-moewen.js');
const F = {
  ruffy: { t: ['Bezwinger von Flossenriff', 'Zweiter Gang'], rec: 'b',
    a: [{ facc: ['weste'] }, { facc: ['weste', 'glut'], skin: '#f0b8a4' }], am: 'offene blaue Weste, dann Glut und Hitze (rosige Haut)',
    b: [{ facc: ['faustband'] }, { facc: ['faustband', 'wirbel'] }], bm: 'Faustbandagen, dann blaue Wirbel um die Fäuste' },
  zorro: { t: ['Bezwinger des Wüstenreichs', 'Dämonen-Schwertkämpfer'], rec: 'b',
    a: [{ facc: ['bauchbinde'] }, { facc: ['bauchbinde', 'ohrringe'], shirt: '#3a4a3a' }], am: 'rote Bauchbinde, dann Ohrringe und dunkelgrünes Hemd',
    b: [{ facc: ['armtuch'] }, { facc: ['armtuch', 'daemon'], shirt: '#2e2e3a' }], bm: 'schwarzes Tuch am Arm (sein Erinnerungsstück), dann violetter Schimmer und dunkles Hemd' },
  nami: { t: ['Befreit von Flossenriff', 'Wetterhexe'], rec: 'b',
    a: [{ shirt: '#f2f2ee', facc: ['tattoo'] }, { shirt: '#f2f2ee', facc: ['tattoo', 'wetterstab'] }], am: 'ärmellos mit Windrosen-Tattoo, dann Wetterstab mit Wölkchen',
    b: [{ facc: ['kompass'] }, { facc: ['kompass', 'regenwolke'] }], bm: 'Kompass am Gürtel, dann eine eigene kleine Regenwolke mit Blitz' },
  lysop: { t: ['Kapitän der Lasse-Bande', 'Maskenkönig'], rec: 'a',
    a: [{ facc: ['gurt', 'schleuder'] }, { shirt: '#5a7a3a', facc: ['heldenmaske', 'umhang', 'schleuder'] }], am: 'Gurt mit Taschen und Schleuder, dann blaue Heldenmaske und roter Umhang',
    b: [{ hat: 'papierhut', hatColor: '#f2ece0', facc: ['holzschwert'] }, { hat: 'hood', hatColor: '#3a4a3a', facc: ['grossschleuder', 'nebel'] }], bm: 'Papierhut und Holzschwert (Kinderbande), dann grüne Kapuze, große Schleuder, Nebel' },
  sanji: { t: ['Dunkelbein', 'Höllentritt'], rec: 'b',
    a: [{ facc: ['straehne', 'anzug'] }, { facc: ['straehne', 'anzug', 'feuerbein'] }], am: 'Strähne übers Auge und dunkle Weste, dann Flammen am Bein',
    b: [{ facc: ['schuerze', 'schwarzstiefel'] }, { facc: ['schuerze', 'schwarzstiefel', 'wirbeltritt'] }], bm: 'Kochschürze und schwarze Stiefel, dann weiße Tritt-Wirbel' },
  chopper: { t: ['Arzt vom Trommelberg', 'Riesenform'], rec: 'b',
    a: [{ facc: ['kreuz', 'arzttasche'] }, { facc: ['geweih', 'fell', 'kreuz', 'arzttasche'] }], am: 'Kreuz auf der Brust und Arzttasche, dann Geweih-Mütze und Fellkragen',
    b: [{ facc: ['stethoskop'] }, { facc: ['stethoskop', 'trank', 'gruenaura'] }], bm: 'Stethoskop, dann sprudelnder Wundertrank und grüner Schimmer' },
  robin: { t: ['Archäologin der Bücherinsel', 'Die leben will'], rec: 'b',
    a: [{ facc: ['buch', 'lupe'] }, { facc: ['buch', 'lupe', 'bluetenwirbel'] }], am: 'dickes Buch und Lupe, dann Blütenwirbel',
    b: [{ facc: ['pinsel', 'schriftrolle'] }, { facc: ['pinsel', 'schriftrolle', 'ranken'] }], bm: 'Grabungspinsel und Schriftrolle, dann blühende Ranken' },
  franky: { t: ['Cyborg von Wasserstadt', 'Erbauer der Sonnenbrigg'], rec: 'b',
    a: [{ facc: ['stahlarm', 'schluessel'] }, { facc: ['stahlarm', 'schluessel', 'brustplatte', 'werkzeuggurt'] }], am: 'Stahlarm und Schraubenschlüssel, dann Brustplatte und Werkzeuggurt',
    b: [{ facc: ['zahnrad', 'oelkanne'] }, { facc: ['zahnrad', 'werkzeuggurt', 'bauplan', 'hammer'] }], bm: 'Zahnrad-Schulter und Ölkanne, dann Werkzeuggurt, Bauplan und Hammer' },
  brook: { t: ['Klangkönig', 'Musikant der Sturmmöwen'], rec: 'b',
    a: [{ facc: ['knochenkette', 'geisterhauch'] }, { facc: ['knochenkette', 'geisterhauch', 'geige', 'noten'] }], am: 'Knochenkette und Seelenhauch, dann Geige und Noten',
    b: [{ facc: ['buehnenbrille', 'mikro'] }, { facc: ['buehnenbrille', 'akkordeon', 'noten'] }], bm: 'runde Bühnenbrille und Mikrofon, dann Akkordeon und Noten' }
};
module.exports = F;
if (require.main === module) {
  const fac = 'strohhut';
  const fig = (svg, cap) => `<figure>${svg}<figcaption>${cap}</figcaption></figure>`;
  const lk = (id, o) => Object.assign({}, M[id].b, o);
  let h = '';
  Object.keys(F).forEach(id => {
    const f = F[id], v = M[id];
    h += `<section><h2>${v.n} <small>${f.t[0]} · ${f.t[1]} · Empfehlung ${f.rec.toUpperCase()}</small></h2><div class="row">`;
    h += `<div class="var"><b>Grund</b>${fig(P.shaded(v.b, 'normal', fac), 'heute B')}</div>`;
    ['a', 'b'].forEach(k => {
      h += `<div class="var${f.rec === k ? ' rec' : ''}"><b>${k.toUpperCase()}${f.rec === k ? ' ★' : ''}</b>` +
        fig(P.shaded(lk(id, f[k][0]), 'normal', fac), 'Form 1') + fig(P.shaded(lk(id, f[k][1]), 'froh', fac), 'Form 2') + fig(P.shaded(lk(id, f[k][1]), 'sauer', fac), 'Form 2 sauer') +
        `<p>${f[k + 'm']}</p></div>`;
    });
    h += '</div></section>';
  });
  h += '<section><h2>Kampfgröße <small>Form 2, Empfehlung</small></h2><div class="row small">' + Object.keys(F).map(id => fig(P.shaded(lk(id, F[id][F[id].rec][1]), 'normal', fac), M[id].n)).join('') + '</div></section>';
  const css = require('fs').readFileSync(__dirname + '/c4-head.css', 'utf8') + '.var p{width:100%;margin:2px 2px 0;font-size:12px;color:var(--mute);max-width:280px}.var.rec{outline:2px solid var(--acc)}';
  const html = `<title>Sturmmöwen Formen</title><meta name="claude:viewport-fit-sides" content="cover"><style>${css}html:root:root{--acc:#2f6ab0}</style><header><h1>Sturmmöwen: 18 Story-Formen</h1><p>Board 2 von 2: Form 1 und Form 2 je Figur auf dem gewählten Grund-Look, im 24 × 30-Raster. A nimmt die Idee der heutigen Form auf (neu gezeichnet), B ist eine eigene Idee passend zum neuen Look. Form 2 baut auf Form 1 auf. ★ = Empfehlung.</p></header>${h}`;
  require('fs').writeFileSync(process.argv[2] || 'formen.html', html);
}
