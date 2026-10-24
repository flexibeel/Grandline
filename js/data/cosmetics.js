// Profil-Kosmetik zum Freispielen: Hintergründe, Rahmen, Avatar-Animationen und Titel.
// Sie zeigen sich im Profil und in der Rangliste. Keine Spielvorteile, nur zum Angeben.
//   req = Bedingung (alle müssen erfüllt sein), leer = von Anfang an frei:
//     rank (Piratenrang 1-14), runs, wins, kos, maxHit, bosses (Inselbosse gesamt),
//     hunted (Kopfgeld-Ziele gesamt), raids, artifacts (verschiedene gefunden), reached (0-2: Meer erreicht),
//     islands (verschiedene Inseln besucht), heat (höchste Kopfgeld-Stufe)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.cosmetics = {
  backgrounds: [
    { id: 'meer',       name: 'Ruhige See',        req: {} },
    { id: 'morgen',     name: 'Morgen in Foosha',         req: { rank: 3 } },
    { id: 'wueste',     name: 'Glutwüste',        req: { reached: 1 } },
    { id: 'nacht',      name: 'Sternennacht',      req: { reached: 2 } },
    { id: 'sturm',      name: 'Gewittersturm',     req: { raids: 1 } },
    { id: 'kirsch',     name: 'Kirschblüten',      req: { rank: 6 } },
    { id: 'gold',       name: 'Schatzkammer',      req: { artifacts: 6 } },
    { id: 'legende',    name: 'Legende',           req: { wins: 5 } },
    { id: 'kokos',      name: 'Mandarinenhain',    req: { islands: 4 } },
    { id: 'schnee',     name: 'Frostspitze',       req: { islands: 8 } },
    { id: 'himmel',     name: 'Wolkenhof',        req: { reached: 1, islands: 10 } },
    { id: 'tiefsee',    name: 'Tiefsee',           req: { runs: 25 } },
    { id: 'marine',     name: 'Marine-Basis',      req: { hunted: 15 } },
    { id: 'lava',       name: 'Vulkan',            req: { maxHit: 120 } },
    { id: 'galaxie',    name: 'Sternenmeer',       req: { rank: 16 } },
    { id: 'regenbogen', name: 'Regenbogennebel',   req: { islands: 18 } },
    { id: 'zirkus',     name: 'Zirkuszelt',        req: { hunted: 12, runs: 15 } },
    { id: 'fischinsel', name: 'Tiefsee', req: { bosses: 12, islands: 14 } },
    { id: 'nebel',      name: 'Nebelschiff',       req: { reached: 2, runs: 30 } },
    { id: 'kaiserflagge', name: 'Rote Flagge',     req: { raids: 6, wins: 8 } },
    { id: 'sunny',      name: 'Freundesschiff',    req: { invites: 2 } },
    // Besondere, animierte Piraten-Hintergründe (schwer zu verdienen)
    { id: 'laternen',   name: 'Laternenhafen',     req: { runs: 100 }, rare: true },
    { id: 'kanonen',    name: 'Kanonendonner',     req: { kos: 2000 }, rare: true },
    { id: 'sturmfahrt', name: 'Sturmfahrt',        req: { heat: 4, wins: 6 }, rare: true },
    { id: 'kraken',     name: 'Kraken-Tiefe',      req: { bosses: 25, reached: 2 }, rare: true },
    { id: 'schatzberg', name: 'Goldener Schatzberg', req: { artifacts: 11 }, rare: true },
    { id: 'jollyroger', name: 'Unter schwarzer Flagge', req: { wins: 25 }, rare: true },
    // Marken-Laden (Dungeon-Liga): für Landgang-Marken eintauschen
    { id: 'kartentisch', name: 'Kartentisch',      req: { 'dl_bg-kartentisch': 1 }, rare: true },
    { id: 'laternengrotte', name: 'Laternengrotte', req: { 'dl_bg-laternengrotte': 1 }, rare: true },
    { id: 'wrackbucht', name: 'Wrackbucht',        req: { 'dl_bg-wrackbucht': 1 }, rare: true },
    { id: 'goldkajuete', name: 'Goldene Kajüte',   req: { 'dl_bg-goldkajuete': 1 }, rare: true }
  ],
  frames: [
    { id: 'holz',       name: 'Holz',              req: {} },
    { id: 'tau',        name: 'Schiffstau',        req: { runs: 8 } },
    { id: 'silber',     name: 'Silber',            req: { rank: 6 } },
    { id: 'steckbrief', name: 'Steckbrief',        req: { hunted: 5 } },
    { id: 'gold',       name: 'Gold',              req: { rank: 11 } },
    { id: 'krone',      name: 'Krone',             req: { wins: 6 } },
    { id: 'rottau',     name: 'Rotes Tau',         req: { runs: 10 } },
    { id: 'eisen',      name: 'Eisen',             req: { bosses: 5 } },
    { id: 'rubin',      name: 'Rubin',             req: { hunted: 10 } },
    { id: 'saphir',     name: 'Saphir',            req: { artifacts: 9 } },
    { id: 'smaragd',    name: 'Smaragd',           req: { heat: 2 } },
    { id: 'feuer',      name: 'Feuer',             req: { kos: 500 } },
    { id: 'regenbogen', name: 'Tiefseeriesen-Schuppen', req: { wins: 10 } },
    { id: 'seetang',    name: 'Seetang',           req: { islands: 12, runs: 20 } },
    { id: 'knochen',    name: 'Knochen',           req: { kos: 1200 } },
    { id: 'kaiser',     name: 'Kaiserlich',        req: { rank: 18, wins: 15 } },
    { id: 'freund',     name: 'Bande fürs Leben',  req: { invites: 1 } },
    { id: 'schatzglanz', name: 'Schatzglanz',      req: { wins: 15, artifacts: 9 }, rare: true },
    { id: 'glutkette',  name: 'Glühende Ankerkette', req: { kos: 3000 }, rare: true },
    { id: 'sturmband',  name: 'Sturmband',         req: { raids: 10 }, rare: true },
    { id: 'kompass',    name: 'Kompassrahmen',     req: { 'dl_fr-kompass': 1 }, rare: true },
    { id: 'gewoelbe',   name: 'Gewölberahmen',     req: { 'dl_fr-dungeon': 1 }, rare: true },
    // Kopfgeld-Leiter
    { id: 'kupfer',     name: 'Kupferbeschlag',    req: { heat: 7 } },
    { id: 'kopfgeldglut', name: 'Glühender Steckbrief', req: { heat: 10 }, rare: true },
    { id: 'klinge',     name: 'Klingenrand',       req: { heat: 14 } },
    { id: 'sturmglas',  name: 'Sturmglas',         req: { heat: 17 }, rare: true },
    { id: 'weltende',   name: 'Ende der Welt',     req: { heat: 20 }, rare: true }
  ],
  animations: [
    { id: 'ruhig',      name: 'Ruhig',             req: {} },
    { id: 'wippen',     name: 'Wippen',            req: { runs: 4 } },
    { id: 'huepfen',    name: 'Hüpfen',            req: { kos: 150 } },
    { id: 'drehen',     name: 'Pirouette',         req: { bosses: 3 } },
    { id: 'funkeln',    name: 'Funkeln',           req: { artifacts: 3 } },
    { id: 'flammen',    name: 'Flammen-Aura',      req: { maxHit: 60 } },
    { id: 'schweben',   name: 'Schweben',          req: { islands: 6 } },
    { id: 'puls',       name: 'Herzschlag',        req: { runs: 15 } },
    { id: 'zittern',    name: 'Kampfeslust',       req: { kos: 250 } },
    { id: 'blitz',      name: 'Blitz-Aura',        req: { raids: 3 } },
    { id: 'konfetti',   name: 'Konfetti',          req: { wins: 4 } },
    { id: 'schnee',     name: 'Schneegestöber',    req: { islands: 10, runs: 20 } },
    { id: 'herzen',     name: 'Herzchen',          req: { runs: 40 } },
    { id: 'haki',       name: 'Königs-Haki',       req: { rank: 15, raids: 5 } },
    { id: 'freundesaura', name: 'Freundes-Aura',   req: { invites: 3 } },
    { id: 'glanz',      name: 'Goldglanz',         req: { rank: 8 } },
    { id: 'wellen',     name: 'Meereswind',        req: { rank: 12 } },
    { id: 'kaiseraura', name: 'Kaiser-Aura',       req: { rank: 18 } }
  ],
  titles: [
    { id: 'neuling',    name: 'Neuling auf See',   req: {} },
    { id: 'kaempfer',   name: 'Raufbold',          req: { kos: 200 } },
    { id: 'jaeger',     name: 'Kopfgeldjäger',     req: { hunted: 3 } },
    { id: 'bezwinger',  name: 'Bossbezwinger',     req: { bosses: 6 } },
    { id: 'sammler',    name: 'Sammler',           req: { artifacts: 6 } },
    { id: 'wuchtig',    name: 'Der Wuchtige',      req: { maxHit: 80 } },
    { id: 'legende',    name: 'Legende der Meere', req: { wins: 5 } },
    { id: 'veteran',    name: 'Veteran der Testfahrt', req: { veteran: 1 }, rare: true },
    { id: 'erstsegler', name: 'Erstsegler',        req: { launch: 1 }, rare: true },
    { id: 'matrose',    name: 'Matrose',           req: { runs: 5 } },
    { id: 'rookie',     name: 'Super-Rookie',      req: { rank: 4 } },
    { id: 'entdecker',  name: 'Entdecker',         req: { islands: 6 } },
    { id: 'schatz',     name: 'Schatzjäger',       req: { artifacts: 3 } },
    { id: 'kartograph', name: 'Kartograph',        req: { islands: 12 } },
    { id: 'hitzkopf',   name: 'Hitzkopf',          req: { heat: 3 } },
    { id: 'sturm',      name: 'Sturmbezwinger',    req: { raids: 2 } },
    { id: 'samurai',    name: 'Ein-Schlag-Samurai', req: { maxHit: 120 } },
    { id: 'marinefeind', name: 'Albtraum der Marine', req: { kos: 500 } },
    { id: 'reisender',  name: 'Weltreisender',     req: { islands: 18 } },
    { id: 'unermuedlich', name: 'Unermüdlich',     req: { runs: 50 } },
    { id: 'kaiser',     name: 'Kaiser der Meere',  req: { rank: 21 } },
    { id: 'koenig',     name: 'Piratenkönig',      req: { rank: 22 } },
    { id: 'clown',      name: 'Großer Clown',      req: { hunted: 20 } },
    { id: 'fischfreund', name: 'Freund der Fischmenschen', req: { bosses: 15 } },
    { id: 'revolutionaer', name: 'Revolutionär',   req: { wins: 12 } },
    { id: 'vize',       name: 'Vizekapitän',       req: { rank: 12, runs: 30 } },
    { id: 'gemuetlich', name: 'Gemütlicher Kapitän', req: { runs: 75 } },
    { id: 'schlaeger',  name: 'Faust der Meere',   req: { maxHit: 200 } },
    { id: 'hundert',    name: 'Hundert Inseln',    req: { islands: 24 } },
    { id: 'unbeugsam',  name: 'Unbeugsam',         req: { heat: 5 } },
    { id: 'gastgeber',  name: 'Gastgeber der Grand Line', req: { invites: 1 } },
    { id: 'flottenchef', name: 'Herr der Flotte',  req: { invites: 5 } },
    { id: 'maat',       name: 'Zuverlässiger Maat', req: { quests: 20 } },
    { id: 'duellant',   name: 'Meister der Duelle', req: { duels: 10 } },
    { id: 'kanonier',   name: 'Meisterkanonier',   req: { kos: 2000 } },
    { id: 'admiralsschreck', name: 'Admiralsschreck', req: { raids: 10 } },
    { id: 'schatzkoenig', name: 'Schatzkönig',     req: { artifacts: 11 } },
    { id: 'krakenbaendiger', name: 'Krakenbändiger', req: { bosses: 25 } },
    { id: 'laternenhueter', name: 'Hüter der Hafenlaterne', req: { runs: 100 } },
    { id: 'schwarzeflagge', name: 'Schrecken unter schwarzer Flagge', req: { wins: 25 } },
    { id: 'gesucht',    name: 'Gesucht',           req: { heat: 1 } },
    { id: 'lehrmeister', name: 'Lehrmeister',      req: { masters: 1 } },
    { id: 'fuenfmeister', name: 'Meister von Fünf', req: { masters: 5 } },
    { id: 'grossmeister', name: 'Großmeister der Bande', req: { masters: 15 }, rare: true },
    { id: 'seebaer',    name: 'Seebär',            req: { heat: 6 } },
    { id: 'yonkoanw',   name: 'Yonko-Anwärter',    req: { heat: 8 } },
    { id: 'zehnsprossen', name: 'Schrecken der zehnten Sprosse', req: { heat: 10 }, rare: true },
    { id: 'hafengebuehr', name: 'Zahlt keine Hafengebühr', req: { heat: 11 } },
    { id: 'geizhals',   name: 'Geizhals der Grand Line', req: { heat: 13 } },
    { id: 'kaiserjaeger', name: 'Kaiserjäger',     req: { heat: 15 }, rare: true },
    { id: 'wuestenlaeufer', name: 'Wüstenläufer',  req: { heat: 16 } },
    { id: 'sturmreiter', name: 'Sturmreiter',      req: { heat: 19 } },
    { id: 'weltende',   name: 'Am Ende der Welt gewesen', req: { heat: 20 }, rare: true },
    // Vertrautheit: Titel für eine enge Freundschaft mit einer Figur
    { id: 'b-ruffy',   name: 'Ruffys Fleischpartner', req: { bond_ruffy: 10 } },
    { id: 'b-zorro',   name: 'Zorros Wegweiser',      req: { bond_zorro: 10 } },
    { id: 'b-nami',    name: 'Namis Kassenwart',      req: { bond_nami: 10 } },
    { id: 'b-lysop',   name: 'Lysops Mitlügner',      req: { bond_lysop: 10 } },
    { id: 'b-sanji',   name: 'Sanjis Stammgast',      req: { bond_sanji: 10 } },
    { id: 'b-chopper', name: 'Choppers Lieblingspatient', req: { bond_chopper: 10 } },
    { id: 'b-robin',   name: 'Robins Lesefreund',     req: { bond_robin: 10 } },
    { id: 'b-franky',  name: 'Frankys Mitbauer',      req: { bond_franky: 10 } },
    { id: 'b-brook',   name: 'Brooks Publikum',       req: { bond_brook: 10 } },
    { id: 'b-herz',    name: 'Herz der Crew',         req: { bondFriends: 4 } },
  ],
  // Piratenflagge: kleines Abzeichen am Porträt (Profil, Rangliste)
  flags: [
    { id: 'keine',      name: 'Keine Flagge',      req: {} },
    { id: 'totenkopf',  name: 'Totenkopf',         req: { runs: 1 } },
    { id: 'anker',      name: 'Anker',             req: { rank: 3 } },
    { id: 'stern',      name: 'Stern',             req: { wins: 1 } },
    { id: 'schwerter',  name: 'Gekreuzte Klingen', req: { hunted: 5 } },
    { id: 'sonne',      name: 'Sonne',             req: { islands: 8 } },
    { id: 'blume',      name: 'Blüte',             req: { rank: 7 } },
    { id: 'blitz',      name: 'Blitz',             req: { raids: 1 } },
    { id: 'krone',      name: 'Krone',             req: { bosses: 6 } },
    { id: 'drache',     name: 'Drache',            req: { wins: 8 } },
    { id: 'clownnase',  name: 'Clownsnase',        req: { hunted: 15 } },
    { id: 'narbe',      name: 'Drei Narben',       req: { raids: 4, rank: 12 } },
    { id: 'faust',      name: 'Faust',             req: { kos: 800 } },
    { id: 'freunde',    name: 'Freundschaft',      req: { invites: 1 } },
    { id: 'erstefahrt', name: 'Erste Fahrt',       req: { launch: 1 }, rare: true },
    { id: 'strohhut',   name: 'Strohhut-Totenkopf', req: { wins: 3 } },
    { id: 'kraken',     name: 'Kraken',            req: { runs: 60 } },
    { id: 'schnurrbart', name: 'Weißer Schnurrbart', req: { bosses: 20 } },
    { id: 'leiter',     name: 'Strickleiter',      req: { heat: 5 } },
    { id: 'zaeh',       name: 'Zähes Herz',        req: { heat: 9 } },
    { id: 'kette',      name: 'Ankerkette',        req: { heat: 12 } },
    { id: 'kaiser',     name: 'Vier Kronen',       req: { heat: 15 }, rare: true },
    { id: 'schwarzesonne', name: 'Schwarze Sonne', req: { heat: 20 }, rare: true }
  ]
};

// Teile für den eigenen Piraten (Charakter-Editor)
GL.data.charParts = {
  hair:   ['#1a1a1a', '#6b4a2a', '#c8a040', '#e8d070', '#c0392b', '#3f8f4f', '#2f5aa8', '#e870a0', '#f0f0f0', '#7a4a9a'],
  skin:   ['#f8dcc0', '#f2c9a0', '#d9a87a', '#b07a50', '#7a4a2a', '#6aa0c8'],
  shirt:  ['#d9423a', '#2f6fb0', '#3d6b46', '#e8c25a', '#f0f0f0', '#222222', '#7a4fc4', '#e8862a', '#e870a0'],
  pants:  ['#3b5a8c', '#2a2a2a', '#5a3a2a', '#3a4a3a', '#e8e8e8', '#7a2a2a'],
  hat:    ['', 'straw', 'band', 'cap', 'hood', 'afro', 'tophat', 'tricorn', 'ears'],
  hatColor: ['#e8c25a', '#222222', '#c0392b', '#f0f0f0', '#2f6fb0', '#3d6b46', '#7a4fc4', '#e8862a'],
  beard:  ['', '#1a1a1a', '#6b4a2a', '#c8a040', '#f0f0f0', '#c0392b'],
  nose:   ['', '#e0302a'],
  acc:    ['', 'augenklappe', 'narbe', 'brille', 'ohrring', 'pfeife', 'blume']
};
// Besondere Teile für den eigenen Piraten müssen erst verdient werden (Bedingungen wie bei der Kosmetik)
GL.data.charLocks = {
  'hat:tophat':  { name: 'Zylinder',       req: { wins: 3 } },
  'hat:tricorn': { name: 'Dreispitz',      req: { hunted: 10 } },
  'hat:ears':    { name: 'Tierohren',      req: { runs: 12 } },
  'hat:afro':    { name: 'Locken',         req: { rank: 4 } },
  'beard':       { name: 'Bart',           req: { rank: 6 } },
  'nose':        { name: 'Clownsnase',     req: { hunted: 20 } },
  'acc:augenklappe': { name: 'Augenklappe', req: { hunted: 6 } },
  'acc:narbe':   { name: 'Narbe',          req: { raids: 2 } },
  'acc:brille':  { name: 'Brille',         req: { runs: 6 } },
  'acc:ohrring': { name: 'Ohrring',        req: { wins: 2 } },
  'acc:pfeife':  { name: 'Pfeife',         req: { rank: 8 } },
  'acc:blume':   { name: 'Blume im Haar',  req: { islands: 5 } }
};

// ---------- Pixel-Bilder für Flaggen und besondere Hintergründe ----------
// Flaggen: 13x11 Pixel. "." = Tuch, Buchstaben = Farben aus FC. cloth = Tuchfarbe.
(function () {
  const FC = { W: '#f4efe2', S: '#c9ced8', G: '#f2c94c', Y: '#f6d64a', R: '#e0302a', N: '#e0302a', H: '#e8c25a', P: '#c08ae0', B: '#4f8fe0', D: '#9a6a20' };
  const SKULL = ['.....WWW.....', '....WWWWW....', '....W.W.W....', '....WWWWW....', '.....W.W.....'];
  const BONES = ['..W.......W..', '...WW...WW...', '.....WWW.....', '...WW...WW...', '..W.......W..'];
  const F = {
    totenkopf: { cloth: '#18181f', rows: ['.............'].concat(SKULL, BONES) },
    strohhut:  { cloth: '#18181f', rows: ['....HHHHH....', '..HHRRRRRHH..', '....WWWWW....', '....W.W.W....', '....WWWWW....', '.....W.W.....', '...WW...WW...', '.....WWW.....', '...WW...WW...', '..W.......W..', '.............'] },
    clownnase: { cloth: '#18181f', rows: ['.............', '.....WWW.....', '....WWWWW....', '....W.W.W....', '....WWNWW....', '.....W.W.....'].concat(BONES) },
    narbe:     { cloth: '#18181f', rows: ['.............', '.....WRWR.R..', '....WWWRWR.R.', '....W.W.R.R.R', '....WWWWW....', '.....W.W.....', '..S.......S..', '...SS...SS...', '.....SSS.....', '...SS...SS...', '..S.......S..'] },
    schnurrbart: { cloth: '#18181f', rows: ['.............', '.....WWW.....', '....WWWWW....', '....W.W.W....', '....WWWWW....', '.WWWWW.WWWWW.', 'W...W.W.W...W', '...WW...WW...', '.....WWW.....', '...WW...WW...', '..W.......W..'] },
    anker:     { cloth: '#244f7a', rows: ['.............', '......W......', '.....W.W.....', '......W......', '....WWWWW....', '......W......', '......W......', '..W...W...W..', '..WW..W..WW..', '...WWWWWWW...', '.....WWW.....'] },
    stern:     { cloth: '#1b2230', rows: ['.............', '.............', '......G......', '.....GGG.....', '..GGGGGGGGG..', '...GGGGGGG...', '....GGGGG....', '....GG.GG....', '...GG...GG...', '..G.......G..', '.............'] },
    schwerter: { cloth: '#7a2620', rows: ['S...........S', '.S.........S.', '..S.......S..', '...S.....S...', '....S...S....', '.....S.S.....', '......S......', '.....S.S.....', '....S...S....', '..GGG...GGG..', '...G.....G...'] },
    sonne:     { cloth: '#d8662a', rows: ['.............', '......Y......', '..Y...Y...Y..', '...Y.YYY.Y...', '....YYYYY....', '.YYYYYYYYYYY.', '....YYYYY....', '...Y.YYY.Y...', '..Y...Y...Y..', '......Y......', '.............'] },
    blume:     { cloth: '#c4467e', rows: ['.............', '......W......', '.....WWW.....', '..WW.WWW.WW..', '.WWWWYYYWWWW.', '..WWWYYYWWW..', '.WWWWYYYWWWW.', '..WW.WWW.WW..', '.....WWW.....', '......W......', '.............'] },
    blitz:     { cloth: '#33244f', rows: ['.............', '......YYYY...', '.....YYYY....', '....YYYY.....', '...YYYYYYY...', '......YYY....', '.....YYY.....', '....YYY......', '...YY........', '..Y..........', '.............'] },
    krone:     { cloth: '#4f2890', rows: ['.............', '.............', '..G...G...G..', '..GG.GGG.GG..', '..GGGGGGGGG..', '..GRGGBGGRG..', '..GGGGGGGGG..', '..DDDDDDDDD..', '.............', '.............', '.............'] },
    drache:    { cloth: '#25704d', rows: ['.............', '........WWWW.', '.......WW.WWW', '.......WW....', '..WWW...WW...', '.WW.WW...WW..', 'WW...WW..WW..', '......WWWW...', '.............', '..W.W.W.W.W..', '.............'] },
    faust:     { cloth: '#5a3c26', rows: ['.............', '.............', '...WWWWWWW...', '..WW.W.W.WW..', '..WWWWWWWWW..', '..WWWWWWWWW..', '..WW.WWWWWW..', '...WWWWWWW...', '....WWWWW....', '....WWWWW....', '.............'] },
    freunde:   { cloth: '#b04470', rows: ['.............', '..YYY...YYY..', '.YYYYY.YYYYY.', '.YYYYYYYYYYY.', '.YYYYYYYYYYY.', '..YYYYYYYYY..', '...YYYYYYY...', '....YYYYY....', '.....YYY.....', '......Y......', '.............'] },
    erstefahrt: { cloth: '#1f3f6e', rows: ['......Y......', '.....YYY.....', '..Y..YYY..Y..', '......Y......', '...YYYYYYY...', '...Y..W..Y...', '.....WWW.....', '....WWWWW....', '..DDDDDDDDD..', '.W.W.W.W.W.W.', 'W.W.W.W.W.W.W'] },
    leiter:    { cloth: '#5a3c26', rows: ['.............', '...D.....D...', '...DDDDDDD...', '...D.....D...', '...D.....D...', '...DDDDDDD...', '...D.....D...', '...D.....D...', '...DDDDDDD...', '...D.....D...', '.............'] },
    zaeh:      { cloth: '#2a1a24', rows: ['.............', '..RRR...RRR..', '.RRRRR.RRRRR.', '.RRRRRWRRRRR.', '.RRRRWWWRRRR.', '..RRRRWRRRR..', '...RRRRRRR...', '....RRRRR....', '.....RRR.....', '......R......', '.............'] },
    kette:     { cloth: '#2c3440', rows: ['.............', '..SSS........', '..S.S........', '..SSSSS......', '....S.S......', '....SSSSS....', '......S.S....', '......SSSSS..', '........S.S..', '........SSS..', '.............'] },
    kaiser:    { cloth: '#3a1f12', rows: ['.............', '.G.G.G..G.G.G', '.GGGGG..GGGGG', '.GGGGG..GGGGG', '.............', '.............', '.G.G.G..G.G.G', '.GGGGG..GGGGG', '.GGGGG..GGGGG', '.............', '.............'] },
    schwarzesonne: { cloth: '#7a2620', rows: ['......Y......', '..Y...Y...Y..', '...Y.....Y...', '.....WWW.....', '.Y..WSSSW..Y.', 'YY..WSSSW..YY', '.Y..WSSSW..Y.', '.....WWW.....', '...Y.....Y...', '..Y...Y...Y..', '......Y......'] },
    kraken:    { cloth: '#1d2a4a', rows: ['.............', '....PPPPP....', '...PPPPPPP...', '...PWPPPWP...', '...PPPPPPP...', '..P.P.P.P.P..', '.P..P.P.P..P.', '.P.P..P..P.P.', '..P...P...P..', '......P......', '.............'] }
  };
  const fcache = {};
  GL.data.flagSvg = function (id) {
    if (fcache[id] !== undefined) return fcache[id];
    const f = F[id];
    if (!f) return (fcache[id] = '');
    let r = `<rect width="13" height="11" fill="${f.cloth}"/><rect y="10" width="13" height="1" fill="rgba(0,0,0,.25)"/>`;
    f.rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (FC[ch]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${FC[ch]}"/>`; }));
    return (fcache[id] = `<svg viewBox="0 0 13 11" shape-rendering="crispEdges" preserveAspectRatio="none" aria-hidden="true">${r}</svg>`);
  };

  // Hintergründe als kleine Pixel-Szenen (24x24). Teile mit Klasse bewegen sich per CSS.
  function scene(draw) {
    const groups = { '': [] };
    const r = (x, y, w, h, c, cls) => { (groups[cls || ''] = groups[cls || ''] || []).push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`); };
    const bands = list => list.forEach(([y0, y1, c]) => r(0, y0, 24, y1 - y0, c));
    draw(r, bands);
    let out = groups[''].join('');
    Object.keys(groups).forEach(k => { if (k) out += `<g class="ca ${k}">${groups[k].join('')}</g>`; });
    return `<svg viewBox="0 0 24 24" shape-rendering="crispEdges" preserveAspectRatio="none" aria-hidden="true">${out}</svg>`;
  }
  const star = (r, x, y, cls, c) => { r(x, y, 1, 1, '#ffffff', cls); r(x - 1, y, 1, 1, c || '#fff2b0', cls); r(x + 1, y, 1, 1, c || '#fff2b0', cls); r(x, y - 1, 1, 1, c || '#fff2b0', cls); r(x, y + 1, 1, 1, c || '#fff2b0', cls); };
  const S = {
    // Sonnenaufgang über dem Windmühlendorf
    morgen: (r, b) => {
      b([[0, 4, '#6a74b0'], [4, 7, '#b882a6'], [7, 10, '#ee9e7a'], [10, 13, '#f7c08a'], [13, 15, '#f8dca4'], [15, 24, '#4f8cc0']]);
      r(9, 13, 6, 2, '#ffe08a'); r(10, 12, 4, 1, '#ffe08a');
      r(8, 16, 8, 1, '#ffd890'); r(10, 18, 5, 1, '#f8cc80'); r(11, 20, 3, 1, '#e8b870');
      r(0, 17, 7, 7, '#5f9e4a'); r(0, 16, 5, 1, '#5f9e4a'); r(7, 19, 2, 5, '#4f8a3e');
      r(1, 9, 3, 8, '#efe4d0'); r(1, 9, 1, 8, '#d8ccb6'); r(1, 8, 3, 1, '#8a4a2a'); r(2, 7, 1, 1, '#8a4a2a'); r(2, 13, 1, 3, '#6a4a30');
      r(2, 3, 1, 9, '#7a5a3a', 'ca-spin'); r(-2, 7, 9, 1, '#7a5a3a', 'ca-spin'); r(-2, 6, 2, 1, '#f4ece0', 'ca-spin'); r(3, 3, 1, 3, '#f4ece0', 'ca-spin');
    },
    // Wüste mit Palast von Alubarna, wehender Sand
    wueste: (r, b) => {
      b([[0, 6, '#f6d4a0'], [6, 12, '#f8e0b4'], [12, 24, '#e6b872']]);
      r(17, 2, 4, 4, '#fff0c0'); r(18, 1, 2, 1, '#fff0c0');
      r(18, 9, 5, 4, '#f2e2c4'); r(19, 8, 3, 1, '#f2e2c4'); r(20, 7, 1, 1, '#e8c25a'); r(17, 13, 7, 4, '#e8d4b0'); r(16, 11, 1, 6, '#e8d4b0'); r(16, 10, 1, 1, '#c88a4a'); r(19, 14, 1, 2, '#b88a5a'); r(21, 14, 1, 2, '#b88a5a');
      r(0, 15, 9, 3, '#eec37e'); r(0, 18, 24, 6, '#d8a460'); r(5, 17, 14, 2, '#e0ae6a'); r(0, 21, 24, 1, '#c8924e'); r(10, 23, 14, 1, '#c08848');
      r(2, 12, 2, 1, '#f8e8c8', 'ca-drift'); r(6, 15, 3, 1, '#f8e8c8', 'ca-drift'); r(14, 19, 2, 1, '#f8e8c8', 'ca-drift'); r(20, 21, 3, 1, '#f8e8c8', 'ca-drift');
    },
    // Drumm: Zylinder-Berge mit Schloss, Schneefall
    schnee: (r, b) => {
      b([[0, 8, '#8fb0d4'], [8, 14, '#a8c4e0'], [14, 20, '#c4d8ea'], [20, 24, '#f4f8fb']]);
      r(16, 6, 7, 15, '#e6eef5'); r(21, 6, 2, 15, '#bccbd9'); r(16, 6, 7, 1, '#ffffff');
      r(17, 3, 4, 3, '#8a8aa6'); r(18, 2, 1, 1, '#8a8aa6'); r(20, 2, 1, 1, '#8a8aa6'); r(18, 4, 1, 1, '#f2d24a');
      r(0, 11, 5, 10, '#d8e4ee'); r(3, 11, 2, 10, '#b4c4d4'); r(0, 11, 5, 1, '#ffffff');
      r(0, 20, 24, 4, '#f4f8fb'); r(6, 19, 9, 1, '#f4f8fb');
      [[3, 2], [9, 5], [13, 1], [7, 10], [1, 7], [12, 14], [23, 12], [5, 16]].forEach(([x, y]) => r(x, y, 1, 1, '#ffffff', 'ca-snow'));
      [[6, 3], [11, 8], [2, 13], [14, 4], [8, 17], [22, 2]].forEach(([x, y]) => r(x, y, 1, 1, '#ffffff', 'ca-snow2'));
    },
    // Skypiea: Wolkenmeer, Bohnenranke, goldene Glocke
    himmel: (r, b) => {
      b([[0, 6, '#5ab4ec'], [6, 12, '#86ccf4'], [12, 16, '#b4e0fa'], [16, 24, '#ffffff']]);
      r(0, 15, 6, 2, '#ffffff'); r(9, 14, 7, 2, '#ffffff'); r(18, 15, 6, 1, '#ffffff'); r(0, 19, 24, 1, '#e4f0fb'); r(0, 22, 24, 1, '#e4f0fb');
      r(2, 3, 2, 13, '#4f9a4a'); r(1, 6, 1, 2, '#6aba5a'); r(4, 9, 2, 1, '#6aba5a'); r(0, 12, 2, 1, '#6aba5a');
      r(19, 3, 3, 3, '#e8b830'); r(18, 5, 5, 1, '#e8b830'); r(20, 2, 1, 1, '#a07a20'); r(20, 6, 1, 1, '#a07a20');
      star(r, 22, 3, 'ca-tw1');
      r(6, 4, 4, 1, '#ffffff', 'ca-drift'); r(7, 3, 2, 1, '#ffffff', 'ca-drift'); r(13, 8, 5, 1, '#ffffff', 'ca-drift'); r(14, 7, 2, 1, '#ffffff', 'ca-drift');
    },
    // Regenbogennebel: Regenbogen im Nebel über stiller See
    regenbogen: (r, b) => {
      b([[0, 8, '#4c4f80'], [8, 14, '#6a7aa0'], [14, 17, '#8aa4b8'], [17, 24, '#355a78']]);
      const cols = ['#e0483b', '#f29a2e', '#f2c94c', '#4fb05a', '#4f8fe0', '#8a5ad0'];
      cols.forEach((c, k) => { for (let x = 0; x < 24; x++) { const y = Math.round(3 + k + (x - 11.5) * (x - 11.5) / 26); if (y < 17) r(x, y, 1, 1, c); } });
      r(0, 17, 24, 1, '#9ab8c8'); r(3, 19, 6, 1, '#5a7a98'); r(14, 21, 7, 1, '#5a7a98');
      r(-4, 12, 12, 2, 'rgba(240,240,255,.45)', 'ca-fog'); r(12, 15, 14, 2, 'rgba(240,240,255,.4)', 'ca-fog'); r(4, 9, 8, 1, 'rgba(240,240,255,.35)', 'ca-fog');
    },
    // Laternenkette über dem Nachthafen
    laternen: (r, b) => {
      b([[0, 6, '#121a36'], [6, 12, '#18244a'], [12, 17, '#1e2e58'], [17, 24, '#10283e']]);
      [[3, 1], [9, 2], [14, 1], [20, 3], [6, 11], [17, 12], [1, 14]].forEach(([x, y]) => r(x, y, 1, 1, '#fff6d0'));
      r(19, 6, 3, 3, '#f6eecc'); r(20, 5, 1, 1, '#f6eecc'); r(22, 7, 1, 1, '#f6eecc');
      [[0, 3], [1, 3], [2, 4], [3, 4], [4, 4], [5, 5], [6, 5], [7, 5], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 5], [16, 5], [17, 5], [18, 4], [19, 4], [20, 4], [21, 3], [22, 3], [23, 3]].forEach(([x, y]) => r(x, y, 1, 1, '#3a2a20'));
      const lamp = (x, y, cls) => { r(x, y, 2, 3, '#d8402a', cls); r(x, y + 1, 2, 1, '#ffb050', cls); r(x, y - 1, 2, 1, '#2a1a10'); };
      lamp(2, 5, 'ca-flick'); lamp(7, 7, 'ca-flick2'); lamp(16, 7, 'ca-flick'); lamp(21, 5, 'ca-flick2');
      r(0, 17, 24, 1, '#244a68'); r(0, 20, 3, 4, '#4a3020'); r(21, 20, 3, 4, '#4a3020'); r(0, 19, 3, 1, '#6a4a30'); r(21, 19, 3, 1, '#6a4a30');
      r(2, 18, 2, 1, '#f2903a', 'ca-flick'); r(2, 21, 1, 1, '#c8702a', 'ca-flick'); r(21, 18, 2, 1, '#f2903a', 'ca-flick2'); r(22, 22, 1, 1, '#c8702a', 'ca-flick2');
    },
    // Kanonendonner im Abendrot: Mündungsfeuer, Rauch, Wasserfontäne
    kanonen: (r, b) => {
      b([[0, 5, '#3a2a5a'], [5, 9, '#7a3458'], [9, 13, '#d0583a'], [13, 17, '#f2a050'], [17, 24, '#24445e']]);
      r(10, 15, 5, 2, '#ffd27a'); r(11, 14, 3, 1, '#ffd27a'); r(9, 18, 7, 1, '#e88a4a'); r(11, 20, 3, 1, '#c86a3a');
      r(0, 16, 5, 4, '#3a2418'); r(0, 15, 5, 1, '#5a3a24'); r(0, 18, 5, 1, '#2a1810'); r(3, 14, 3, 2, '#1c1c22'); r(5, 14, 1, 1, '#3c3c48');
      r(6, 14, 2, 2, '#ff9030', 'ca-flash'); r(8, 14, 1, 2, '#ffd060', 'ca-flash'); r(6, 13, 1, 1, '#ffd060', 'ca-flash');
      r(0, 10, 4, 3, '#d8d2cc', 'ca-puff'); r(1, 9, 3, 1, '#eae6e0', 'ca-puff'); r(0, 13, 2, 1, '#b8b2ac', 'ca-puff');
      r(1, 5, 3, 2, '#c8c2bc', 'ca-puff2'); r(2, 4, 2, 1, '#e0dcd6', 'ca-puff2');
      r(19, 14, 5, 3, '#e8e8ee'); r(20, 13, 4, 1, '#e8e8ee'); r(19, 15, 5, 1, '#4f8fe0'); r(21, 6, 1, 7, '#5a4a40'); r(20, 7, 4, 5, '#f4f4f8'); r(20, 9, 4, 1, '#4f8fe0'); r(22, 5, 2, 1, '#4f8fe0');
      r(17, 14, 1, 3, '#cfe8f5', 'ca-splash'); r(16, 15, 1, 2, '#a8d0e8', 'ca-splash'); r(18, 15, 1, 2, '#a8d0e8', 'ca-splash');
    },
    // Sturmfahrt: Regen, Blitz, Wellenkämme
    sturmfahrt: (r, b) => {
      b([[0, 5, '#2c3150'], [5, 11, '#22273e'], [11, 17, '#1c2034'], [17, 24, '#163048']]);
      r(0, 0, 8, 3, '#3c425e'); r(2, 3, 5, 1, '#3c425e'); r(13, 0, 11, 2, '#3c425e'); r(15, 2, 7, 2, '#363c58');
      r(0, 0, 24, 24, 'rgba(255,255,230,.35)', 'ca-flashall');
      [[22, 3], [21, 4], [21, 5], [20, 6], [21, 7], [22, 8], [21, 9], [21, 10]].forEach(([x, y]) => r(x, y, 1, 1, '#fff27a', 'ca-bolt'));
      for (let k = 0; k < 14; k++) { const x = (k * 7) % 26 - 1, y = (k * 5) % 16; r(x, y, 1, 2, 'rgba(190,210,250,.55)', 'ca-rain'); }
      for (let x = -12; x < 36; x += 6) { r(x, 17, 3, 1, '#cfe0ee', 'ca-wave'); r(x + 1, 16, 1, 1, '#ffffff', 'ca-wave'); r(x + 3, 20, 3, 1, '#9fbad0', 'ca-wave2'); }
      r(0, 22, 24, 2, '#10263a');
    },
    // Kraken-Tiefe: Tentakel, Luftblasen, leuchtende Augen
    kraken: (r, b) => {
      b([[0, 6, '#12325a'], [6, 12, '#0e2a4c'], [12, 18, '#0a2140'], [18, 24, '#071830']]);
      [[5, 0], [6, 3], [7, 6]].forEach(([x, y]) => r(x, y, 2, 3, 'rgba(150,210,255,.10)'));
      [[15, 0], [16, 3], [17, 6]].forEach(([x, y]) => r(x, y, 2, 3, 'rgba(150,210,255,.08)'));
      r(0, 22, 24, 2, '#0e1c24'); r(5, 21, 3, 1, '#0e1c24'); r(15, 21, 4, 1, '#0e1c24');
      const T = '#8a44b0', D = '#5e2a80', Su = '#f0a8d8';
      r(0, 17, 4, 7, T, 'ca-sway'); r(1, 13, 3, 4, T, 'ca-sway'); r(2, 10, 2, 3, T, 'ca-sway'); r(3, 8, 2, 2, T, 'ca-sway'); r(5, 7, 1, 1, T, 'ca-sway'); r(6, 8, 1, 1, T, 'ca-sway');
      r(3, 17, 1, 7, D, 'ca-sway'); r(3, 20, 1, 1, Su, 'ca-sway'); r(3, 15, 1, 1, Su, 'ca-sway'); r(3, 11, 1, 1, Su, 'ca-sway');
      r(20, 16, 4, 8, T, 'ca-sway2'); r(20, 12, 3, 4, T, 'ca-sway2'); r(20, 9, 2, 3, T, 'ca-sway2'); r(19, 7, 2, 2, T, 'ca-sway2'); r(18, 6, 1, 1, T, 'ca-sway2'); r(17, 7, 1, 1, T, 'ca-sway2');
      r(20, 16, 1, 8, D, 'ca-sway2'); r(20, 19, 1, 1, Su, 'ca-sway2'); r(20, 14, 1, 1, Su, 'ca-sway2'); r(20, 10, 1, 1, Su, 'ca-sway2');
      r(9, 22, 2, 1, '#f6d64a', 'ca-blink'); r(13, 22, 2, 1, '#f6d64a', 'ca-blink');
      r(8, 18, 1, 1, '#bfe8ff', 'ca-rise'); r(15, 20, 1, 1, '#bfe8ff', 'ca-rise'); r(12, 21, 1, 1, '#bfe8ff', 'ca-rise2'); r(6, 14, 1, 1, '#bfe8ff', 'ca-rise2'); r(18, 17, 1, 1, '#bfe8ff', 'ca-rise');
    },
    // Goldener Schatzberg in der Höhle, funkelnd
    schatzberg: (r, b) => {
      b([[0, 8, '#22161a'], [8, 16, '#2e1e1e'], [16, 24, '#3a2620']]);
      [[2, 0, 2, 2], [3, 2, 1, 1], [9, 0, 2, 1], [16, 0, 3, 2], [17, 2, 1, 2], [21, 0, 2, 2]].forEach(([x, y, w, h]) => r(x, y, w, h, '#140c0e'));
      r(3, 7, 18, 12, 'rgba(242,190,70,.10)');
      r(0, 20, 24, 4, '#e2a92a'); r(1, 18, 22, 2, '#e8b432'); r(4, 16, 16, 2, '#eebe3c'); r(7, 14, 10, 2, '#f2c94c');
      [[2, 19], [6, 17], [9, 15], [14, 15], [18, 17], [21, 19], [4, 21], [12, 22], [19, 22], [16, 20], [8, 20]].forEach(([x, y]) => r(x, y, 1, 1, '#fff2a0'));
      [[1, 22], [5, 23], [10, 21], [15, 23], [20, 21], [23, 23]].forEach(([x, y]) => r(x, y, 1, 1, '#b07a18'));
      r(4, 19, 1, 1, '#e0302a'); r(19, 21, 1, 1, '#4f8fe0'); r(7, 22, 1, 1, '#3fb06a'); r(17, 18, 1, 1, '#c060e0');
      r(19, 14, 5, 4, '#8a5a2a'); r(19, 15, 5, 1, '#f2c94c'); r(21, 16, 1, 1, '#f2c94c'); r(19, 12, 5, 2, '#6a4220'); r(20, 13, 3, 1, '#ffe680');
      r(0, 16, 3, 2, '#f2c94c'); r(0, 15, 1, 1, '#f2c94c'); r(2, 15, 1, 1, '#f2c94c'); r(1, 16, 1, 1, '#e0302a');
      star(r, 2, 11, 'ca-tw1'); star(r, 21, 9, 'ca-tw2'); star(r, 3, 21, 'ca-tw3'); star(r, 21, 21, 'ca-tw1');
    },
    // Unter schwarzer Flagge: wehende Jolly-Roger-Flagge über dem Deck
    jollyroger: (r, b) => {
      b([[0, 5, '#1e1028'], [5, 10, '#4a1a30'], [10, 15, '#8a2a2e'], [15, 20, '#c04a2a'], [20, 24, '#5a3a24']]);
      [[2, 2], [7, 1], [11, 3], [5, 6]].forEach(([x, y]) => r(x, y, 1, 1, '#ffe6d0'));
      r(4, 14, 4, 2, '#f08a3a'); r(5, 13, 2, 1, '#f08a3a');
      r(23, 0, 1, 20, '#4a3020');
      r(15, 0, 8, 7, '#141418', 'ca-flag'); r(15, 7, 3, 1, '#141418', 'ca-flag'); r(20, 7, 3, 1, '#141418', 'ca-flag');
      r(18, 1, 3, 1, '#f4efe2', 'ca-flag'); r(17, 2, 5, 1, '#f4efe2', 'ca-flag'); r(17, 3, 1, 1, '#f4efe2', 'ca-flag'); r(19, 3, 1, 1, '#f4efe2', 'ca-flag'); r(21, 3, 1, 1, '#f4efe2', 'ca-flag'); r(18, 4, 3, 1, '#f4efe2', 'ca-flag');
      r(16, 5, 1, 1, '#f4efe2', 'ca-flag'); r(22, 5, 1, 1, '#f4efe2', 'ca-flag'); r(17, 5, 1, 1, '#141418', 'ca-flag'); r(18, 5, 3, 1, '#141418', 'ca-flag'); r(19, 5, 1, 1, '#f4efe2', 'ca-flag'); r(16, 6, 1, 1, '#f4efe2', 'ca-flag'); r(22, 6, 1, 1, '#f4efe2', 'ca-flag');
      for (let x = 0; x < 24; x += 4) r(x, 20, 1, 4, '#3e2818');
      r(0, 20, 24, 1, '#7a5434'); r(0, 22, 24, 1, '#4a3020');
      [[1, 8], [2, 10], [3, 12], [4, 14], [5, 16], [6, 18]].forEach(([x, y]) => r(x, y, 1, 1, '#2a1418'));
    }
  };
  // Marken-Laden: Kartentisch, Laternengrotte, Wrackbucht, Goldene Kajüte
  Object.assign(S, {
    kartentisch: (r, b) => {
      b([[0, 24, '#6a4428']]);
      for (let y = 2; y < 24; y += 5) r(0, y, 24, 1, '#5a3820');
      r(2, 3, 20, 17, '#e8d6a8'); r(2, 3, 20, 1, '#f4e6c0'); r(21, 3, 1, 17, '#c8b080'); r(2, 19, 20, 1, '#c8b080');
      r(5, 6, 4, 3, '#c9a86a'); r(6, 5, 2, 1, '#c9a86a'); r(12, 10, 5, 3, '#c9a86a'); r(13, 13, 3, 1, '#c9a86a'); r(6, 14, 3, 2, '#c9a86a');
      [[8, 9], [9, 10], [10, 10], [11, 11]].forEach(([x, y]) => r(x, y, 1, 1, '#b0402a'));
      r(17, 6, 3, 3, '#8a6a3a'); r(18, 7, 1, 1, '#e8d6a8'); r(18, 5, 1, 1, '#b0402a', 'ca-tw1');
      r(14, 15, 4, 3, 'rgba(120,70,30,.35)'); r(15, 14, 2, 1, 'rgba(120,70,30,.35)');
      r(3, 20, 3, 3, '#3a3a44'); r(4, 21, 1, 1, '#f2c94c'); r(19, 20, 4, 2, '#8a2a2a'); r(19, 20, 4, 1, '#b04040');
    },
    laternengrotte: (r, b) => {
      b([[0, 6, '#1a1a24'], [6, 14, '#22222e'], [14, 20, '#2a2a36'], [20, 24, '#163042']]);
      [[0, 0, 5, 3], [6, 0, 3, 2], [13, 0, 4, 3], [19, 0, 5, 2], [2, 3, 2, 2], [15, 3, 1, 2]].forEach(([x, y, w, h]) => r(x, y, w, h, '#0e0e16'));
      r(0, 17, 6, 3, '#34343e'); r(17, 16, 7, 4, '#34343e'); r(0, 16, 4, 1, '#44444e'); r(18, 15, 5, 1, '#44444e');
      const lamp = (x, y, cls) => { r(x, y, 2, 2, '#f2a03a', cls); r(x, y + 2, 2, 1, '#8a4a20'); r(x - 1, y - 1, 4, 4, 'rgba(242,170,70,.18)', cls); };
      lamp(3, 13, 'ca-flick'); lamp(19, 12, 'ca-flick2'); lamp(11, 6, 'ca-flick');
      r(0, 20, 24, 1, '#2a5a78'); r(4, 21, 3, 1, '#f2a03a', 'ca-flick'); r(18, 22, 3, 1, '#f2a03a', 'ca-flick2'); r(10, 23, 2, 1, '#3a6a88');
    },
    wrackbucht: (r, b) => {
      b([[0, 7, '#8ab8d8'], [7, 12, '#b4d4e8'], [12, 17, '#3f86b0'], [17, 24, '#e6cf96']]);
      r(16, 2, 4, 4, '#fff4c8'); r(17, 1, 2, 1, '#fff4c8');
      r(2, 10, 9, 4, '#5a3a24'); r(3, 9, 7, 1, '#6a4a2c'); r(1, 12, 2, 2, '#5a3a24'); r(6, 4, 1, 6, '#4a3020'); r(7, 5, 3, 2, '#d8ccb0'); r(7, 7, 2, 1, '#c8bca0');
      r(3, 11, 1, 1, '#2a1a10'); r(8, 12, 1, 1, '#2a1a10');
      r(0, 14, 24, 1, '#cfe8f5', 'ca-wave'); r(0, 16, 24, 1, '#a8d0e8', 'ca-wave2');
      r(0, 17, 24, 7, '#e6cf96'); r(14, 19, 3, 2, '#8a6a3a'); r(14, 19, 3, 1, '#a8844a'); r(15, 18, 1, 1, '#f2c94c', 'ca-tw2');
      r(20, 20, 2, 1, '#f0a0a0'); r(4, 21, 1, 1, '#f4efe2'); r(9, 22, 2, 1, '#c8b080');
    },
    goldkajuete: (r, b) => {
      b([[0, 24, '#5a3220']]);
      for (let x = 0; x < 24; x += 4) r(x, 0, 1, 18, '#4a2818');
      r(0, 0, 24, 1, '#d8a83a'); r(0, 17, 24, 1, '#d8a83a'); r(0, 18, 24, 6, '#3a2014');
      r(8, 3, 8, 7, '#2a4a6a'); r(8, 3, 8, 1, '#d8a83a'); r(8, 9, 8, 1, '#d8a83a'); r(8, 3, 1, 7, '#d8a83a'); r(15, 3, 1, 7, '#d8a83a'); r(11, 4, 1, 5, '#d8a83a');
      r(10, 5, 1, 1, '#fff6d0', 'ca-tw1'); r(13, 6, 1, 1, '#fff6d0', 'ca-tw2');
      r(3, 11, 4, 7, '#8a2a2a'); r(3, 10, 4, 1, '#d8a83a'); r(2, 14, 1, 4, '#6a1a1a'); r(7, 14, 1, 4, '#6a1a1a');
      r(17, 13, 6, 1, '#d8a83a'); r(18, 14, 1, 4, '#8a5a2a'); r(21, 14, 1, 4, '#8a5a2a'); r(18, 12, 2, 1, '#f2c94c'); r(20, 11, 1, 2, '#e8e0d0'); r(20, 10, 1, 1, '#f2a03a', 'ca-flick');
    }
  });
  const bcache = {};
  GL.data.bgSvg = function (id) {
    if (bcache[id] !== undefined) return bcache[id];
    return (bcache[id] = S[id] ? scene(S[id]) : '');
  };
})();
