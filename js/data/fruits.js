// Teufelsfrüchte. Jede Frucht hat einen Effekt aus dieser Liste
// (die Logik dazu steht in js/engine/run.js, Funktion applyEffect):
//   { type: 'buffAll',   stat: 'atk' | 'hp' | 'spd', value }  ganze Crew
//   { type: 'buffFront', stat: 'atk' | 'hp' | 'spd', value }  erstes lebendes Crewmitglied
//   { type: 'crit',      value }                               Chance auf kritischen Treffer
//   { type: 'healAll' }                                        alle Lebenden voll heilen
//   { type: 'multi', list: [...] }                             mehrere Effekte auf einmal
//
// Werte pro Seltenheit: [Gewöhnlich, Selten, Episch, Legendär] (vals, siehe relics.js).
// awakened: true = erwachte Frucht aus Raids. Feste Werte, bleibt danach freigeschaltet
// und taucht in späteren Runs ab und zu im normalen Angebot auf.
//
// Frucht-Familien (fam): logia, paramecia, zoan. Jede Frucht hat dazu eine Eigenmechanik (mech, Logik in js/engine/fruitfx.js).
// Mehrere Früchte derselben Familie im Run schalten Familien-Boni frei (GL.data.fruitFams).
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.fruits = [
  { id: 'gum-gum',   name: 'Gum-Gum-Frucht',   vals: { v: [1, 2, 3, 5] },    text: '+{v} Angriff für die ganze Crew',
    effect: { type: 'buffAll', stat: 'atk', value: 'v' }, fam: 'paramecia', mech: 'Gummi: Wer dich trifft, kriegt manchmal einen Teil zurück.' },
  { id: 'hana-hana', name: 'Hana-Hana-Frucht', vals: { v: [5, 8, 12, 18] },    text: '+{v} Leben für die ganze Crew',
    effect: { type: 'buffAll', stat: 'hp', value: 'v' }, fam: 'paramecia', mech: 'Extra-Arm: Treffer erwischen manchmal noch einen zweiten Gegner.' },
  { id: 'suna-suna', name: 'Suna-Suna-Frucht', vals: { v: [1, 2, 3, 5] },    text: '+{v} Tempo für die ganze Crew',
    effect: { type: 'buffAll', stat: 'spd', value: 'v' }, fam: 'logia', mech: 'Sand: Treffer trocknen Gegner aus, sie nehmen mehr Schaden.' },
  { id: 'mera-mera', name: 'Mera-Mera-Frucht', vals: { v: [3, 5, 8, 12] },    text: '+{v} Angriff für das erste Crewmitglied',
    effect: { type: 'buffFront', stat: 'atk', value: 'v' }, fam: 'logia', mech: 'Feuer: Treffer setzen Gegner in Brand.' },
  { id: 'zoan',      name: 'Zoan-Frucht',      vals: { p: [0.1, 0.15, 0.22, 0.32] }, text: '+{p} Chance auf doppelten Schaden',
    effect: { type: 'crit', value: 'p' }, fam: 'zoan', mech: 'Wut: Wer unter 40 % Leben fällt, schlägt 30 % härter zu.' },
  { id: 'hie-hie',   name: 'Hie-Hie-Frucht',   vals: { v: [6, 10, 15, 22] }, text: '+{v} Leben für das erste Crewmitglied',
    effect: { type: 'buffFront', stat: 'hp', value: 'v' }, fam: 'logia', mech: 'Eis: Treffer frieren Gegner manchmal eine Runde ein.' },
  { id: 'bara-bara',  name: 'Bara-Bara-Frucht',  vals: { p: [0.05, 0.08, 0.12, 0.18] }, text: '+{p} Chance auf doppelten Schaden',
    effect: { type: 'crit', value: 'p' }, fam: 'paramecia', mech: 'Zerlegen: Die Crew weicht 6 % der Angriffe aus. Der Rest ist Gewöhnungssache.' },
  { id: 'hito-hito',  name: 'Hito-Hito-Frucht',  vals: { v: [4, 7, 10, 15] }, text: '+{v} Leben für die ganze Crew',
    effect: { type: 'buffAll', stat: 'hp', value: 'v' }, fam: 'zoan', mech: 'Doktor: Am Rundenende wird der Verletzteste ein bisschen geflickt.' },
  { id: 'tori-tori',  name: 'Tori-Tori-Frucht (Phönix)', vals: { v: [3, 5, 8, 12] }, text: '+{v} Leben für das erste Crewmitglied',
    effect: { type: 'buffFront', stat: 'hp', value: 'v' }, fam: 'zoan', mech: 'Phönix: Wer als Erstes fällt, steht einmal pro Kampf mit blauer Flamme wieder auf.' },
  { id: 'heal',      name: 'Heil-Frucht',      unique: true,      text: 'Heilt alle lebenden Crewmitglieder voll',
    effect: { type: 'healAll' } },

  // Erwacht (aus Raids)
  { id: 'gum-gum-epic',   name: 'Erwachte Gum-Gum-Frucht',   awakened: true, text: '+4 Angriff und +8 Leben für die ganze Crew',
    effect: { type: 'multi', list: [{ type: 'buffAll', stat: 'atk', value: 4 }, { type: 'buffAll', stat: 'hp', value: 8 }] }, fam: 'paramecia', base: 'gum-gum', mech: 'Gummi: Wer dich trifft, kriegt manchmal einen Teil zurück.' },
  { id: 'mera-mera-epic', name: 'Erwachte Mera-Mera-Frucht', awakened: true, text: '+3 Angriff für die ganze Crew und +20 % Krit-Chance',
    effect: { type: 'multi', list: [{ type: 'buffAll', stat: 'atk', value: 3 }, { type: 'crit', value: 0.2 }] }, fam: 'logia', base: 'mera-mera', mech: 'Feuer: Treffer setzen Gegner in Brand.' },
  { id: 'yami-yami-epic', name: 'Erwachte Finsternis-Frucht', awakened: true, text: '+3 Angriff und +14 Leben für die ganze Crew',
    effect: { type: 'multi', list: [{ type: 'buffAll', stat: 'atk', value: 3 }, { type: 'buffAll', stat: 'hp', value: 14 }] }, fam: 'logia', mech: 'Finsternis: zählt als Logia.' },
  { id: 'haki-epic',      name: 'Erwachtes Königs-Haki',     awakened: true, text: '+2 Angriff, +12 Leben für die ganze Crew und +10 % Krit-Chance',
    effect: { type: 'multi', list: [{ type: 'buffAll', stat: 'atk', value: 2 }, { type: 'buffAll', stat: 'hp', value: 12 }, { type: 'crit', value: 0.1 }] } }
];

// Frucht-Familien: ab 2 bzw. 3 verschiedenen Früchten derselben Familie im Run
GL.data.fruitFams = {
  logia:     { name: 'Logia',     icon: '🔥', text: 'Elemente: Brand, Austrocknen, Einfrieren.',
    tiers: [{ n: 2, text: 'Elementar-Effekte doppelt so oft und 1 Runde länger.' }, { n: 3, text: 'Gegner mit Zustand nehmen 30 % mehr Schaden.' }] },
  paramecia: { name: 'Paramecia', icon: '🌀', text: 'Tricks: Rückprall, Extra-Arme, Zerlegen.',
    tiers: [{ n: 2, text: 'Paramecia-Tricks doppelt so oft.' }, { n: 3, text: 'Ganze Crew +3 Angriff im Kampf.' }] },
  zoan:      { name: 'Zoan',      icon: '🐾', text: 'Tierkräfte: Wut, Doktor, Phönix.',
    tiers: [{ n: 2, text: 'Tierkräfte 75 % stärker.' }, { n: 3, text: 'Wut schon unter 60 % Leben, ganze Crew +1 Tempo und +10 % Schaden.' }] }
};

// Frucht-Wege (großes Update): Findet man eine Frucht im Run ein zweites Mal, wählt man einen von zwei Wegen.
// Er verändert ihre Eigenheit bis zum Run-Ende (Logik in js/engine/fruitfx.js, Wahl in run.fpath).
GL.data.fruitPaths = {
  'mera-mera': [{ id: 'a', name: 'Flächenbrand', text: 'Brand springt auf einen zweiten Gegner über.' },
                { id: 'b', name: 'Glut', text: 'Brand hält eine Runde länger und brennt heißer.' }],
  'hie-hie':   [{ id: 'a', name: 'Spröde', text: 'Eingefrorene Gegner nehmen 25 % mehr Schaden.' },
                { id: 'b', name: 'Eiswand', text: 'Dein Vorderster startet jeden Kampf mit +2 Rüstung.' }],
  'suna-suna': [{ id: 'a', name: 'Ausdörren', text: 'Austrocknen kommt doppelt so oft.' },
                { id: 'b', name: 'Sandsturm', text: 'Die ganze Crew weicht 5 % der Angriffe aus.' }],
  'gum-gum':   [{ id: 'a', name: 'Mehr Federung', text: 'Rückprall wirft doppelt so viel Schaden zurück.' },
                { id: 'b', name: 'Gummi-Sprung', text: 'Rückprall kommt doppelt so oft.' }],
  'hana-hana': [{ id: 'a', name: 'Noch ein Arm', text: 'Extra-Arme erwischen einen dritten Gegner.' },
                { id: 'b', name: 'Festhalten', text: 'Wen ein Extra-Arm trifft, der setzt manchmal eine Runde aus.' }],
  'zoan':      [{ id: 'a', name: 'Berserker', text: 'Wut schon ab 60 % Leben.' },
                { id: 'b', name: 'Raserei', text: 'In Wut schlägt die Crew doppelt so stark zu.' }],
  'bara-bara': [{ id: 'a', name: 'Glitschig', text: 'Ausweichen steigt auf 10 %.' },
                { id: 'b', name: 'Flink', text: 'Die ganze Crew bekommt +1 Tempo.' }],
  'hito-hito': [{ id: 'a', name: 'Notarzt', text: 'Der Verletzteste wird doppelt so stark geflickt.' },
                { id: 'b', name: 'Rundumversorgung', text: 'Alle Verletzten werden am Rundenende ein bisschen geflickt.' }],
  'tori-tori': [{ id: 'a', name: 'Zwei Flammen', text: 'Die ersten zwei Gefallenen stehen wieder auf.' },
                { id: 'b', name: 'Blaues Feuer', text: 'Wer wieder aufsteht, heilt die ganze Crew ein wenig.' }]
};
