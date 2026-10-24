// Raid-Jagd: Ab einem bestimmten Rang kann man vor dem Ablegen einen Raid-Boss als Ziel wählen.
// Jeder Raid-Boss hat zwei Beutestücke (episch und legendär), die nur bei einem Sieg gegen ihn fallen.
// Beute ist reine Sammlung: Sie liegt in der Vitrine im Lager und bis zu drei Stücke sind auf der Visitenkarte zu sehen.
//   art = 12x12 Pixelbild, Farben aus pal
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.huntPal = { k: '#3a2c20', d: '#6a5a4a', m: '#a89a88', l: '#e8e0d4', w: '#9a6a3a', W: '#c4904f', g: '#d9a63c', G: '#f6dc8a',
  y: '#f2d24a', Y: '#fff2a8', r: '#b83a2e', R: '#e0604a', p: '#e870a0', P: '#f8b4cf', b: '#3a6a9a', B: '#9ac8e8', s: '#7a7f88', S: '#d0d6de', x: '#ffffff' };

GL.data.huntLoot = [
  { id: 'licht-splitter', raid: 'kizaru', r: 2, name: 'Lichtsplitter', text: 'Ein Splitter, der nie aufhört zu leuchten.',
    art: ['............', '.....YY.....', '....YyyY....', '...YyxxyY...', '..YyxYYxyY..', '..YyYyyYyY..', '..YyxYYxyY..', '...YyxxyY...', '....YyyY....', '.....YY.....', '............', '............'] },
  { id: 'yasakani', raid: 'kizaru', r: 3, name: 'Funkeljuwel', text: 'Wer es hält, sieht die Welt in Lichtgeschwindigkeit.',
    art: ['............', '....GGGG....', '..GGyyyyGG..', '.GyyYxxYyyG.', '.GyYxxxxYyG.', 'GyyxxYYxxyyG', 'GyyxxYYxxyyG', '.GyYxxxxYyG.', '.GyyYxxYyyG.', '..GGyyyyGG..', '....GGGG....', '............'] },
  { id: 'faden-spule', raid: 'doflamingo', r: 2, name: 'Faden-Spule', text: 'Feiner als Seide, stärker als Stahl.',
    art: ['............', '...wwwwww...', '...WWWWWW...', '....PpPp....', '....pPpP....', '....PpPp....', '....pPpP....', '....PpPp....', '...WWWWWW...', '...wwwwww...', '.........P..', '..........P.'] },
  { id: 'federmantel', raid: 'doflamingo', r: 3, name: 'Rosa Federmantel', text: 'Hihihi. Er raschelt bei jedem Schritt.',
    art: ['............', '..PPP..PPP..', '.PpppPPpppP.', 'PppPpppPpppP', 'PpPPpkkpPPpP', 'PppPpkkpPppP', '.PpPpkkpPpP.', '.PppPkkPppP.', '..PpPkkPpP..', '..PPpkkpPP..', '...PPkkPP...', '............'] },
  { id: 'schatten-splitter', raid: 'teach', r: 2, name: 'Schwarzer Splitter', text: 'Er schluckt das Licht um sich herum.',
    art: ['............', '.....kk.....', '....kddk....', '...kdkkdk...', '..kdkkkkdk..', '..kdkmmkdk..', '..kdkkkkdk..', '...kdkkdk...', '....kddk....', '.....kk.....', '............', '............'] },
  { id: 'blackbeard-flagge', raid: 'teach', r: 3, name: 'Flagge mit drei Schädeln', text: 'Wer sie hisst, will alles: Schätze, Früchte, die ganze See.',
    art: ['.k..........', '.kkkkkkkkkk.', '.kklklklkkk.', '.kkxkxkxkkk.', '.kkkkkkkkkk.', '.kkkrkkrkkk.', '.kkkkrrkkkk.', '.kkkkkkkkkk.', '.k..........', '.k..........', '.k..........', 'kkk.........'] },
  { id: 'strohhut-band', raid: 'shanks', r: 2, name: 'Rotes Hutband', text: 'Ein Versprechen, das um die Welt segelt.',
    art: ['............', '............', '....GGGG....', '...GGGGGG...', '..GGGGGGGG..', '..rrrrrrrr..', '.GGGGGGGGGG.', 'GGGGGGGGGGGG', '.GGGGGGGGGG.', '............', '............', '............'] },
  { id: 'gryphon', raid: 'shanks', r: 3, name: 'Säbel Sturmfeder', text: 'Die Klinge eines Kaisers. Schwer, ruhig, unbesiegt.',
    art: ['..........Sx', '.........SxS', '........SxS.', '.......SxS..', '......SxS...', '.....SxS....', '..g.SxS.....', '..ggxS......', '...gg.......', '..kgGg......', '.kk..g......', 'kk..........'] }
];
GL.data.huntFor = raidId => GL.data.huntLoot.filter(x => x.raid === raidId);
