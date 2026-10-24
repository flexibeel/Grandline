// Figurenreise (Gesamtplan, Tafel „Figurenreise & Kopfgeld“): Erinnerungsstücke und Story-Formen.
//   Jede Figur hat ein eigenes Erinnerungsstück (Zorros Bandana, Namis Mandarine …).
//   Stücke gibt es im Stil-Dojo im Kontor (Bernstein) und ab und zu im Landgang.
//   Eine Story-Form schaltet frei, wenn der Story-Boss einmal besiegt ist UND genug Stücke da sind.
//   Jede Form: neuer Titel, sichtbares Look-Detail, Leben und Angriff +10 % (config unten).
//
//   item  = Erinnerungsstück: name [de, en], art = 12x12 Pixelbild (Farben aus GL.data.formPal)
//   forms = Formen der Reihe nach: title [de, en], boss = Boss-id (einmal besiegt), need = Stücke,
//           look = Änderungen am Aussehen (wird über den Grund-Look gelegt; facc = Form-Accessoires aus sprites.js (FORM_ACC))
//           boni = zwei Wahl-Boni (hp, atk, spd), eins davon wählt der Spieler im Dojo, jederzeit umstellbar
//   Pilot: die neun Strohhüte, alle mit Look-Details (Teil 2). Weitere Figuren kommen Arc für Arc dazu.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.formConf = {
  bonus: 0.10,          // Leben und Angriff pro Form
  dojoCost: 20,         // Bernstein für eine Dojo-Einheit
  dojoGain: [1, 3, 5],  // Stücke je Ergebnis: schlecht, mittel, gut
  landgangChance: 0.25, // Chance auf ein Stück nach einem gewonnenen Landgang
  boni: { hp: 0.05, atk: 0.05, spd: 1 }   // Wahl-Boni je Form, obendrauf: Leben/Angriff in Prozent, Tempo als Punkte
};

// Tagesstil im Dojo: So = 0 … Sa = 6. 'alle' = jeder Stil
GL.data.dojoDays = ['alle', 'klinge', 'kraft', 'technik', 'klinge', 'kraft', 'alle'];

GL.data.formPal = Object.assign({}, GL.data.huntPal || {}, {
  o: '#e07a2c', O: '#f4a860', q: '#b85a1c', n: '#3f8f4f', N: '#7ac27a',
  k: '#2a2220', d: '#5a4a44', l: '#efe6d6', x: '#ffffff', r: '#c0392b', R: '#e0604a',
  w: '#8a5a30', W: '#c4904f', b: '#2f5a8c', B: '#7ab0dc', s: '#8a96a4', S: '#dfe6ee',
  p: '#d9709a', P: '#f6b8cf', y: '#e8b82a', Y: '#fff0a0', g: '#d9a63c', m: '#b8aca0'
});

GL.data.forms = {
  ruffy: {
    item: { name: ['Fleischkeule', 'Meat on the bone'], text: ['Riecht nach Abenteuer. Und nach Grill.', 'Smells like adventure. And barbecue.'],
      art: ['............', '.........ll.', '........lxxl', '.......lxll.', '...WWWlxl...', '..WWwWWl....', '.WwWWWwW....', '.WWWwWWW....', '.wWWWWWw....', '..wwWWw.....', '...www......', '............'] },
    forms: [
      { title: ['Bezwinger von Flossenriff', 'Conqueror of Fin Reef'], boss: 'arlong', need: 10, look: { facc: ['weste'] }, boni: ['hp', 'atk'] },
      { title: ['Gear Second', 'Gear Second'], boss: 'rob-lucci', need: 25, look: { facc: ['weste', 'dampf'], skin: '#f4b4a4' }, boni: ['atk', 'spd'] }
    ] },
  zorro: {
    item: { name: ['Schwarzes Bandana', 'Black bandana'], text: ['Wird erst zum Kampf um den Arm gebunden.', 'Only tied on for a real fight.'],
      art: ['............', '............', '...kkkkkk...', '..kddddddk..', '.kdk....kdk.', '.kdk....kdk.', '..kddddddkk.', '...kkkkkkdk.', '.........kdk', '........kdk.', '.........k..', '............'] },
    forms: [
      { title: ['Bezwinger des Wüstenreichs', 'Victor of the Desert Kingdom'], boss: 'crocodile', need: 10, look: { facc: ['bauchbinde'] }, boni: ['atk', 'hp'] },
      { title: ['Dämonen-Schwertkämpfer', 'Demon swordsman'], boss: 'rob-lucci', need: 25, look: { facc: ['bauchbinde', 'ohrringe'], shirt: '#3a4a3a' }, boni: ['atk', 'spd'] }
    ] },
  nami: {
    item: { name: ['Mandarine', 'Tangerine'], text: ['Aus Bellemeres Garten. Nicht anfassen!', "From Bell-mère's grove. Hands off!"],
      art: ['............', '......wnN...', '......wNN...', '....oooo....', '..ooOOoooo..', '.ooOOoooooo.', '.oOoooooooo.', '.ooooooooqo.', '.oooooooqqo.', '..oooooqqo..', '...oooqqo...', '............'] },
    forms: [
      { title: ['Befreit von Flossenriff', 'Freed from Fin Reef'], boss: 'arlong', need: 10, look: { shirt: '#f2f2ee', facc: ['tattoo'] }, boni: ['spd', 'hp'] },
      { title: ['Wetterhexe', 'Weather witch'], boss: 'enel', need: 25, look: { shirt: '#f2f2ee', facc: ['tattoo', 'taktstock'] }, boni: ['atk', 'spd'] }
    ] },
  lysop: {
    item: { name: ['Schleuder', 'Slingshot'], text: ['Kabuto ist größer. Die hier war die erste.', 'Kabuto is bigger. This one came first.'],
      art: ['............', '..W.....W...', '..Wr...rW...', '..W.rrr.W...', '..Ww...wW...', '...Ww.wW....', '....WwW.....', '.....W......', '.....W......', '.....w......', '....ww......', '............'] },
    forms: [
      { title: ['Kapitän der Lasse-Bande', 'Captain of the Lasse Gang'], boss: 'arlong', need: 10, look: { facc: ['langnase', 'gurt'] }, boni: ['spd', 'hp'] },
      { title: ['Sogeking', 'Sniper King'], boss: 'rob-lucci', need: 25, look: { shirt: '#5a7a3a', facc: ['maske', 'umhang', 'langnase'] }, boni: ['atk', 'spd'] }
    ] },
  sanji: {
    item: { name: ['Kochlöffel', 'Wooden spoon'], text: ['Wer Hunger hat, bekommt zu essen. Immer.', 'Anyone hungry gets fed. Always.'],
      art: ['............', '........WW..', '.......WwwW.', '.......WwwW.', '........WW..', '.......w....', '......w.....', '.....w......', '....w.......', '...w........', '..w.........', '............'] },
    forms: [
      { title: ['Schwarzbein', 'Black Leg'], boss: 'arlong', need: 10, look: { facc: ['straehne', 'hemd', 'zigarette'] }, boni: ['spd', 'hp'] },
      { title: ['Diable Jambe', 'Diable Jambe'], boss: 'rob-lucci', need: 25, look: { facc: ['straehne', 'hemd', 'zigarette', 'feuerbein'] }, boni: ['atk', 'spd'] }
    ] },
  chopper: {
    item: { name: ['Kirschblüte von Drumm', 'Drum cherry blossom'], text: ['Rot geschneit, für einen Doktor.', 'Snowed down pink, for a doctor.'],
      art: ['............', '.....PP.....', '....PppP....', '.PP..pp..PP.', 'PppPyyyyPppP', '.PPpyYYypPP.', '...pyYYyp...', '..PpyyyypP..', '.PppP..PppP.', '.PPP....PPP.', '............', '............'] },
    forms: [
      { title: ['Arzt von Drumm', 'Doctor of Drum'], boss: 'crocodile', need: 10, look: { facc: ['kreuz', 'arzttasche'] }, boni: ['hp', 'spd'] },
      { title: ['Monster-Punkt', 'Monster Point'], boss: 'rob-lucci', need: 25, look: { skin: '#a8703f', facc: ['geweih', 'fell', 'kreuz'] }, boni: ['hp', 'atk'] }
    ] },
  robin: {
    item: { name: ['Altes Geschichtsbuch', 'Old history book'], text: ['Die Seiten sind voller Fragen.', 'The pages are full of questions.'],
      art: ['............', '..bbbbbbbb..', '..bBBBBBBbl.', '..bBggggBbl.', '..bBBBBBBbl.', '..bBBBBBBbl.', '..bBBBBBBbl.', '..bBBBBBBbl.', '..bBBBBBBbl.', '..bbbbbbbbl.', '...llllllll.', '............'] },
    forms: [
      { title: ['Archäologin der Bücherinsel', 'Archaeologist of Book Island'], boss: 'enel', need: 10, look: { facc: ['haarband', 'buch'] }, boni: ['spd', 'atk'] },
      { title: ['Die leben will', 'She who wants to live'], boss: 'rob-lucci', need: 25, look: { facc: ['haarband', 'extraarme', 'blueten'] }, boni: ['hp', 'atk'] }
    ] },
  franky: {
    item: { name: ['Cola-Flasche', 'Cola bottle'], text: ['Treibstoff. Ganz offiziell.', 'Fuel. Officially.'],
      art: ['.....kk.....', '.....SS.....', '.....SS.....', '....SddS....', '...SddddS...', '...SrrrrS...', '...SrxxrS...', '...SrrrrS...', '...SddddS...', '...SddddS...', '...SSSSSS...', '............'] },
    forms: [
      { title: ['Cyborg von Water 7', 'Cyborg of Water 7'], boss: 'rob-lucci', need: 10, look: { facc: ['sonnenbrille', 'metallarm'] }, boni: ['hp', 'atk'] },
      { title: ['Erbauer der Sunny', 'Builder of the Sunny'], boss: 'moria', need: 25, look: { facc: ['sonnenbrille', 'metallarm', 'brustplatte', 'werkzeug'] }, boni: ['hp', 'spd'] }
    ] },
  brook: {
    item: { name: ['Teetasse', 'Teacup'], text: ['Yohoho! Mit Milch, bitte.', 'Yohoho! With milk, please.'],
      art: ['....m..m....', '.....m..m...', '....m..m....', '............', '..xxxxxxx...', '..xllllllxx.', '..xlggggl.x.', '..xllllllxx.', '...xllllx...', '.mmmmmmmmmm.', '..mmmmmmmm..', '............'] },
    forms: [
      { title: ['Seelenkönig', 'Soul King'], boss: 'moria', need: 10, look: { facc: ['augenhoehlen', 'rippen'] }, boni: ['spd', 'atk'] },
      { title: ['Musikant der Strohhüte', 'Straw Hat musician'], boss: 'kuma', need: 25, look: { facc: ['augenhoehlen', 'rippen', 'geige', 'noten'] }, boni: ['spd', 'hp'] }
    ] }
};
