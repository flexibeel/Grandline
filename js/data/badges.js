// Abzeichen: kleine Pixel-Symbole neben dem Namen (Rangliste, Visitenkarte). Freischaltbar, mit Augenzwinkern.
//   px = 12x12 Pixelraster, Buchstaben = Farben aus pal, '.' = leer. req wie in cosmetics.js
//   (zusätzlich: duels = Stammcrew-Siege, quests = erledigte Aufträge, prestige = Prestige-Stufe)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.badges = [
  { id: 'keins', name: 'Kein Abzeichen', desc: '', req: {}, px: [], pal: {} },
  { id: 'fleisch', name: 'Immer hungrig', desc: 'Hat schon mehr gegessen als gekämpft.', req: { runs: 5 },
    pal: { k: '#2a1a0e', w: '#f6f1e6', l: '#e89a6a', m: '#a8502e' },
    px: ['............', '.......kkk..', '......kmmmk.', '.....kmllmmk', '....kmlmmmmk', '...kmmmmmmk.', '..kwkmmmmk..', '.kwwk.kkk...', 'kwwk........', 'kwk.........', '.k..........'] },
  { id: 'sake', name: 'Partylöwe', desc: 'Jeder Sieg ist ein Grund zum Feiern.', req: { wins: 1 },
    pal: { k: '#2a1a0e', w: '#f6f1e6', b: '#c99a5a', y: '#fff3d0', r: '#d0403a' },
    px: ['.....kk.....', '....kwwk....', '....kwwk....', '....kkkk....', '...kbbbbk...', '..kbbbbbbk..', '..kbyyyybk..', '..kbyrrybk..', '..kbyyyybk..', '..kbbbbbbk..', '...kkkkkk...'] },
  { id: 'denden', name: 'Puru puru puru', desc: 'Ruft Freunde zum Duell.', req: { duels: 3 },
    pal: { k: '#2a1a0e', s: '#4a9a4e', g: '#a8dc8a', p: '#c79ad8', w: '#ffffff' },
    px: ['............', '....kkkk....', '...kssssk...', '..ksggggsk..', '..ksgssgsk..', '..ksgsggsk..', '.kkssssssk..', 'kppkkkkkkk..', 'kpwpppppppk.', 'kpppppppppk.', '.kkkkkkkkk..'] },
  { id: 'newscoo', name: 'Schlagzeile', desc: 'Steht in jeder Morgenzeitung.', req: { hunted: 5 },
    pal: { k: '#2a1a0e', b: '#3a6fb0', w: '#ffffff', y: '#f0a030', n: '#d8d4cc', l: '#6a6458' },
    px: ['....kkk.....', '...kbbbk....', '..kbwwwbk...', '..kwkwwwkyk.', '..kwwwwwkk..', '.kwwwwwwk...', 'kwwwnnnnk...', 'kwwwnlnnk...', '.kwwnnnnk...', '..kkkkkk....', '...y..y.....'] },
  { id: 'kompass', name: 'Kurs gehalten', desc: 'Verirrt sich nur mit Absicht.', req: { islands: 8 },
    pal: { k: '#2a1a0e', g: '#c08a2e', w: '#f6f1e6', r: '#d0403a', b: '#2f6fb8' },
    px: ['....kkkk....', '..kkggggkk..', '.kgwwwwwwgk.', '.kgwwrwwwgk.', 'kgwwwrrwwwgk', 'kgwwwkwwwwgk', 'kgwwwwbbwwgk', 'kgwwwwwbwwgk', '.kgwwwwwwgk.', '.kgwwwwwwgk.', '..kkggggkk..', '....kkkk....'] },
  { id: 'frucht', name: 'Nichtschwimmer', desc: 'Hat vom Meer endgültig genug.', req: { raids: 1 },
    pal: { k: '#2a1a0e', g: '#4a9a4e', p: '#8a4fd0', q: '#c8a0f0' },
    px: ['......gk....', '.....gk.....', '...kkkkk....', '..kppqppk...', '.kpqpppqpk..', '.kpppqpppk..', '.kqppppqpk..', '.kpppqpppk..', '..kpqppqk...', '...kkkkk....'] },
  { id: 'kanone', name: 'Bumm!', desc: 'Lärm ist auch eine Strategie.', req: { kos: 250 },
    pal: { k: '#2a1a0e', m: '#4a4e58', w: '#a8743a', o: '#f2b632' },
    px: ['..........o.', '.......kkko.', '.....kkmmmk.', '...kkmmmmmk.', '.kkmmmmmmk..', 'kmmmmmmkk...', 'kmmmmkk.....', '.kwwk.......', 'kwkkwk......', 'kwkkwk......', '.kwwk.......'] },
  { id: 'schatz', name: 'Schatzsucher', desc: 'Gräbt auch dort, wo kein X ist.', req: { artifacts: 5 },
    pal: { k: '#2a1a0e', b: '#8a5a34', y: '#f2c94c' },
    px: ['............', '..kkkkkkkk..', '.kbbbbbbbbk.', '.kbbyyyybbk.', '.kkkkkkkkkk.', '.kbbbyybbbk.', '.kbbbykbbbk.', '.kbbbbbbbbk.', '.kkkkkkkkkk.'] },
  { id: 'merry', name: 'Merry-Fan', desc: 'Hat das Schaf nie vergessen.', req: { runs: 25 },
    pal: { k: '#2a1a0e', w: '#ffffff', f: '#f6e2c0', r: '#d0403a' },
    px: ['..kkkkkk....', '.kwwwwwwk...', 'kwwkwwwwwk..', 'kwkwfffwwk..', 'kwwfkfkfwk..', '.kwfffffk...', '..kfffffk...', '...kfrfk....', '....kkk.....'] },
  { id: 'nase', name: 'Kapitän Lysop', desc: 'Hat angeblich 8000 Gefolgsleute.', req: { maxHit: 100 },
    pal: { k: '#2a1a0e', s: '#c88a5a', h: '#2a2a2a', r: '#a03030' },
    px: ['..hhhhh.....', '.hkkkkkh....', '.kssssk.....', '.kskssk.....', '.ksssskkkkk.', '.ksssssssssk', '.ksssskkkkk.', '..ksssk.....', '..krrrk.....', '...kkk......'] },
  { id: 'krone', name: 'Auftragskönig', desc: 'Erledigt Aufträge, bevor sie ausgesprochen sind.', req: { quests: 15 },
    pal: { k: '#2a1a0e', y: '#f2c94c', r: '#d0403a', b: '#3a8fb8' },
    px: ['............', '.k...k...k..', 'kyk.kyk.kyk.', 'kyykyyykyyk.', 'kyyyyyyyyyk.', 'kyryybyyryk.', 'kyyyyyyyyyk.', 'kkkkkkkkkkk.'] },
  { id: 'flamme', name: 'Prestige', desc: 'Hat den Gipfel erreicht und ist einfach weitergesegelt.', req: { prestige: 1 },
    pal: { k: '#2a1a0e', y: '#f2c94c', r: '#d0403a', o: '#ff8a2a', f: '#ffd24a' },
    px: ['....o.f.....', '...ofoffo...', '..offffoff..', '...kkkkk....', '..kyyyyyk...', '..krrrrrk...', 'kkkyyyyykkk.', 'kyyyyyyyyyk.', '.kkkkkkkkk..'] }
];
// Prestige: nach dem letzten Rang zählt jede weitere Etappe Rang-EP auf Prestige-Stufen
GL.data.prestigeXp = 2500;
