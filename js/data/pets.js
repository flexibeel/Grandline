// Begleiter: kleine Tiere, die man auf bestimmten Inseln findet (nach dem Sieg gegen den
// Bösewicht oder Boss der Insel, mit etwas Glück). Rein zum Liebhaben: sie sitzen im Profil
// auf der Schulter und tanzen im Hafen auf dem Schiff. Kein Einfluss auf Kämpfe.
//
//   isl    = Insel-id aus islands.js, auf der der Begleiter lebt (fehlt bei Sammelbuch-Begleitern)
//   chance = Chance pro Sieg auf dieser Insel
//   art    = Pixelbild (gezeichnet mit Blick nach links), c = Farben
//   say    = kleiner Satz mit Persönlichkeit, hint = Hinweis, solange er fehlt
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.pets = [
  { id: 'moewe', name: 'Zeitungsmöwe', isl: 'shells-town', chance: 0.45,
    say: 'Bringt jeden Morgen die Zeitung. Will dafür einen Keks.', hint: 'Fliegt über den Zollhafen.',
    art: { c: { B: '#3b6fb0', W: '#f6f4ee', K: '#1a1a1a', O: '#f29a2e', G: '#9aa7b4', S: '#8a5a2a' },
      rows: ['............', '....BBBB....', '...BBBBBB...', '...WWWWWW...', '..KWWWWWW...', 'OOWWWWWWWG..', '...WWWWWWGGG', '...WWWWWGGG.', '....WWWWSS..', '.....WWSSS..', '.....O..O...', '....OO.OO...'] } },
  { id: 'hund', name: 'Kleiner Wachhund', isl: 'orange-town', chance: 0.45,
    say: 'Bewacht treu den Laden. Jetzt eben dein Schiff.', hint: 'Wartet vor einem Laden in der Gauklerbucht.',
    art: { c: { W: '#f6f4ee', w: '#d6d2c8', K: '#1a1a1a', N: '#3a2a2a', R: '#c0392b' },
      rows: ['............', '..ww........', '.wWWW.......', 'NWKWWw......', '.WWWWW......', '..RRWW......', '..WWWWW...W.', '..WWWWWW.WW.', '..WWWWWWWW..', '..WW.WWWWW..', '..WW..W..W..', '............'] } },
  { id: 'frosch', name: 'Laubfrosch', isl: 'syrup', chance: 0.45,
    say: 'Quakt immer genau dann, wenn es spannend wird.', hint: 'Sitzt am Küstenhang vom Honigtal.',
    art: { c: { G: '#5cb04a', W: '#ffffff', K: '#1a1a1a', r: '#2f5a24', Y: '#9ad46a' },
      rows: ['............', '..GG....GG..', '.GKWG..GKWG.', '.GWWG..GWWG.', '.GGGGGGGGGG.', 'GGGGGGGGGGGG', 'GGrrrrrrrrGG', '.GGGGGGGGGG.', '.YYGGGGGGYY.', 'YY.GGGGGG.YY', '............'] } },
  { id: 'seestern', name: 'Seestern', isl: 'baratie', chance: 0.45,
    say: 'Klebt am liebsten an der Kombüsentür. Riecht nach Suppe.', hint: 'Hängt am Rumpf vom Suppenkahn.',
    art: { c: { O: '#f08a3a', Y: '#f6c06a', K: '#1a1a1a', y: '#b0502a' },
      rows: ['.....OO.....', '....OOOO....', '....OYYO....', 'OOOOOYYOOOOO', '.OOYYKYKYOO.', '..OOYYYYOO..', '...OYyyYO...', '...OOYYOO...', '..OOO..OOO..', '.OOO....OOO.', '.OO......OO.'] } },
  { id: 'krabbe', name: 'Mandarinenkrabbe', isl: 'arlong-park', chance: 0.45,
    say: 'Knipst Mandarinen vom Baum. Teilt nur mit Freunden.', hint: 'Krabbelt durch die Haine am Flossenriff.',
    art: { c: { C: '#e06a3a', w: '#f6a070', R: '#d0473a', r: '#8a2420', K: '#1a1a1a' },
      rows: ['.CC......CC.', 'CwwC....CwwC', 'CCCC.K.K.CCC', '.CC..K.K..C.', '..C.RRRRR.C.', '..RRRRRRRR..', '.RRRRRRRRRR.', 'RRrRRRRRRrRR', '.RRRRRRRRRR.', '.r.r....r.r.', 'r.r......r.r'] } },
  { id: 'schneehase', name: 'Schneehase', isl: 'drumm', chance: 0.45,
    say: 'Friert nie. Kuschelt trotzdem gern.', hint: 'Hoppelt durch den Schnee der Frostspitze.',
    art: { c: { W: '#f8f8ff', w: '#d8dce8', P: '#f0a0b0', K: '#1a1a1a' },
      rows: ['....WW.W....', '....WP.WW...', '....WP.WP...', '...WWWWW....', '..WKWWWW....', '.PWWWWWW....', '..WWWWWWW...', '..WWWWWWWW..', '...WWWWWWWW.', '...WWWWWWWw.', '..WWW.WWWW..'] } },
  { id: 'minidino', name: 'Mini-Dino', isl: 'little-garden', chance: 0.45,
    say: 'Hält sich für einen Riesen. Niemand sagt ihm was anderes.', hint: 'Versteckt sich im Urwald vom Urwaldkap.',
    art: { c: { G: '#6aa84a', K: '#1a1a1a', W: '#ffffff', Y: '#c8e07a' },
      rows: ['..GGGG......', '.GKGGGG.....', '.GGGGGG.....', '..WWGGG.....', '....GGG.....', '....GGGG..GG', '...GGGGGGGG.', '...GYYGGGG..', '...GYYGGG...', '....G..G....', '...GG.GG....'] } },
  { id: 'papagei', name: 'Südvogel', isl: 'jaya', chance: 0.45,
    say: 'Schaut immer nach Süden. Auch beim Schlafen.', hint: 'Ruft im Küstenwald der Spötterküste.',
    art: { c: { R: '#d8402e', G: '#4aa04a', B: '#3b6fd0', Y: '#e8d070', W: '#ffffff', K: '#1a1a1a', S: '#7a5a3a' },
      rows: ['....RRR.....', '...RRRRR....', '..YRKWRR....', '.YYRRRRR....', '..YRRRRRR...', '....RRGGG...', '....RGGGGB..', '....RGGGGBB.', '.....GGGBBB.', '......GBB.B.', '......BB..B.', '.....SSSSS..'] } },
  { id: 'kaluente', name: 'Fleckschnabel-Ente', isl: 'alabasta', chance: 0.45,
    say: 'Rennt schneller als jedes Kamel. Wenn sie Lust hat.', hint: 'Trinkt an einer Oase in der Glutwüste.',
    art: { c: { W: '#f6eedc', T: '#e8a43a', K: '#1a1a1a', O: '#e8a43a' },
      rows: ['.....T......', '....TT......', '...WWWW.....', '..WKWWW.....', 'OOOWWWW.....', '..OWWW......', '...WWWWWWW..', '..WWWWWWWWW.', '..WWWWWWWWW.', '...WWWWWWW..', '....O...O...', '...OO..OO...'] } },
  { id: 'wolkenfuchs', name: 'Wolkenfuchs', isl: 'skypiea', chance: 0.45,
    say: 'Sein Schwanz ist eine Wolke. Weich wie ein Kissen.', hint: 'Schläft auf den Wolken vom Wolkenhof.',
    art: { c: { W: '#fbf8f0', K: '#1a1a1a', N: '#3a2a2a', C: '#dde8f6' },
      rows: ['..W.W.......', '..WWW.......', '.WKWWW......', 'NWWWWW......', '..WWWW......', '...WWWW..CC.', '...WWWWWCCCC', '...WWWWWCCCC', '...WWWWWWCC.', '...W.W.W.W..'] } },
  { id: 'teleschnecke', name: 'Teleschnecke', isl: 'water-7', chance: 0.45,
    say: 'Puru puru puru … Gacha. Meistens ruft niemand an.', hint: 'Klingelt irgendwo im Messinghafen.',
    art: { c: { G: '#9ad46a', g: '#5c9a42', S: '#c08a4a', s: '#8a5a2a', K: '#1a1a1a', W: '#ffffff' },
      rows: ['.K.K........', '.G.G..SSSS..', '.GGG.SSssSS.', 'GKWG.SsSSsS.', 'GGGG.SsSSsS.', '.GGG.SSssSS.', '.GGGGGSSSSg.', '..gGGGGGGGGg'] } },
  { id: 'taube', name: 'Taube mit Zylinder', isl: 'tower', chance: 0.45,
    say: 'Sehr vornehm. Gurrt nur in ganzen Sätzen.', hint: 'Sitzt auf dem Siegelturm.',
    art: { c: { K: '#1a1a1a', W: '#f6f4ee', Y: '#e8b040', G: '#9aa7b4', O: '#e8805a' },
      rows: ['...KKKK.....', '...KKKK.....', '..KKKKKK....', '...WWWW.....', '..YKWWWW....', '.YYWWWW.....', '...WKKWWW...', '...WWKWWWWG.', '....WWWWWGG.', '.....WWWGG..', '.....O..O...', '....OO.OO...'] } },
  { id: 'geist', name: 'Kleines Gespenst', isl: 'grusel-garten', chance: 0.45,
    say: 'Macht dich ein kleines bisschen traurig. Und dann kichert es.', hint: 'Schwebt durch den Pilzwald.',
    art: { c: { W: '#f2eef8', K: '#3a2a4a', P: '#f08aa8' },
      rows: ['....WWWW....', '...WWWWWW...', '..WWWWWWWW..', '..WKWWWKWW..', '..WKWWWKWW..', '.WWWWPPWWWW.', '.WWWWPPWWWW.', 'WWWWWWWWWWW.', 'WWWWWWWWWWWW', '.WW.WWW.WWW.', '..W..W...W..'] } },
  { id: 'fledermaus', name: 'Schattenfledermaus', isl: 'thriller-schloss', chance: 0.45,
    say: 'Hängt kopfüber im Mast und schnarcht leise.', hint: 'Flattert durch das Spukschloss.',
    art: { c: { A: '#6a4a8a', a: '#4a3060', K: '#f2d24a', W: '#ffffff' },
      rows: ['....A..A....', '....AAAA....', 'A..AKAAKA..A', 'AA.AAAAAA.AA', 'AAAAAWAWAAAA', 'aAAAAAAAAAAa', '.aA.AAAA.Aa.', '.a..AAAA..a.', '.....AA.....'] } },
  { id: 'kugelfisch', name: 'Blasen-Kugelfisch', isl: 'sabaody', chance: 0.45,
    say: 'Bläst sich auf, wenn er sich freut. Also ständig.', hint: 'Schwimmt zwischen den Blasen vom Spiegel-Archipel.',
    art: { c: { Y: '#f2d24a', y: '#fff0b0', K: '#1a1a1a', W: '#ffffff', O: '#e8a43a', M: '#c0502a' },
      rows: ['....YYYY....', '..YYYYYYYY..', '.YKWYYYYYYO.', 'YYYYYYYYYYOO', 'MYYYYYYYYYOO', 'YYYYYYYYYYO.', '.YyyyyyyyY..', '..YYYYYYY...', '....YYY.....'] } },
  { id: 'qualle', name: 'Glitzerqualle', isl: 'korallenhuegel', chance: 0.45,
    say: 'Leuchtet nachts wie eine kleine Laterne.', hint: 'Treibt über der Korallengasse.',
    art: { c: { P: '#e89ad8', p: '#b060b0', w: '#ffffff', K: '#4a2a4a' },
      rows: ['...PPPPPP...', '..PPPPPPPP..', '.PPwPPPPPPP.', '.PPKPPPPKPP.', '.PPPPppPPPP.', '..PPPPPPPP..', '..p.p..p.p..', '..p..p.p..p.', '.p...p..p.p.', '..p.p..p..p.'] } },
  // Sammelbuch-Begleiter: gibt es nur für Fortschritt im Album (GL.data.albumSteps)
  { id: 'schatzkrabbe', name: 'Schatzkrabbe', book: true,
    say: 'Glänzt wie Gold. Ist auch ein bisschen eingebildet.', hint: 'Belohnung im Sammelalbum.',
    art: { c: { C: '#f2c94a', w: '#fff0a0', R: '#e0a82a', r: '#a07018', K: '#1a1a1a' },
      rows: ['.CC......CC.', 'CwwC....CwwC', 'CCCC.K.K.CCC', '.CC..K.K..C.', '..C.RRRRR.C.', '..RRRRRRRR..', '.RRRRwRRRRR.', 'RRrRRRRRRrRR', '.RRRRRRRRRR.', '.r.r....r.r.', 'r.r......r.r'] } },
  { id: 'goldschnecke', name: 'Goldene Teleschnecke', book: true,
    say: 'Hat eine direkte Leitung zum Schatz. Sagt sie.', hint: 'Belohnung im Sammelalbum.',
    art: { c: { G: '#f2d24a', g: '#c9a22a', S: '#e8a43a', s: '#a06a1a', K: '#1a1a1a', W: '#ffffff' },
      rows: ['.K.K........', '.G.G..SSSS..', '.GGG.SSssSS.', 'GKWG.SsSSsS.', 'GGGG.SsSSsS.', '.GGG.SSssSS.', '.GGGGGSSSSg.', '..gGGGGGGGGg'] } },
  { id: 'seekoenig', name: 'Mini-Seekönig', book: true,
    say: 'Der Schrecken der Meere. In klein. Frisst Fischstäbchen.', hint: 'Belohnung im Sammelalbum.',
    art: { c: { S: '#5aa0c8', s: '#3a7098', K: '#1a1a1a', W: '#f6eedc', R: '#d0473a' },
      rows: ['....SSS.....', '...SKSSS....', '..RSSSSS....', '.WWSSSS.....', '.....SSs....', '......SSs...', '.SS....SSs..', 'SSSS....SSs.', '.SSSSSSSSSs.', '...sSSSSSs..'] } },
  // Marken-Laden (Dungeon-Liga): nur für Landgang-Marken
  { id: 'laternenmotte', name: 'Laternenmotte', shop: true,
    say: 'Folgt jedem Licht. Also dir, wenn du gut gelaunt bist.', hint: 'Gibt es im Marken-Laden.',
    art: { c: { Y: '#f6d64a', O: '#f29a2e', W: '#fff6d0', K: '#2a1a10', B: '#c9a86a' },
      rows: ['............', '.WW......WW.', 'WYYW....WYYW', 'WYOYW..WYOYW', '.WYYYKKYYYW.', '..WYYKKYYW..', '...BBKKBB...', '..WYYKKYYW..', '.WYOYKKYOYW.', '.WYYW..WYYW.', '..WW....WW..', '............'] } },
  { id: 'muenzkrabbe', name: 'Münzkrabbe', shop: true,
    say: 'Trägt eine Goldmünze auf dem Rücken und gibt sie nicht her.', hint: 'Gibt es im Marken-Laden.',
    art: { c: { R: '#d0483a', r: '#9a2a22', G: '#f2c94c', g: '#c08a20', K: '#1a1a1a', W: '#ffffff' },
      rows: ['............', '....GGGG....', '...GgGGgG...', '....GGGG....', '.R..RRRR..R.', 'RR.RRRRRR.RR', 'R.RWKRRWKR.R', '..RRRRRRRR..', '..rRRRRRRr..', '.r.r.rr.r.r.', 'r..r....r..r', '............'] } }
];

// Sammelbuch-Stufen: je mehr im Album entdeckt ist, desto mehr gibt es. at = Anteil aller Einträge
GL.data.albumSteps = [
  { at: 0.12, berry: 250 },
  { at: 0.25, pet: 'schatzkrabbe' },
  { at: 0.4, berry: 600 },
  { at: 0.55, pet: 'goldschnecke' },
  { at: 0.7, berry: 1200 },
  { at: 0.85, pet: 'seekoenig' }
];
