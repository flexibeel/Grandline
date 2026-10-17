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
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.fruits = [
  { id: 'gum-gum',   name: 'Gum-Gum-Frucht',   vals: { v: [1, 2, 3, 5] },    text: '+{v} Angriff für die ganze Crew',
    effect: { type: 'buffAll', stat: 'atk', value: 'v' } },
  { id: 'hana-hana', name: 'Hana-Hana-Frucht', vals: { v: [5, 8, 12, 18] },    text: '+{v} Leben für die ganze Crew',
    effect: { type: 'buffAll', stat: 'hp', value: 'v' } },
  { id: 'suna-suna', name: 'Suna-Suna-Frucht', vals: { v: [1, 2, 3, 5] },    text: '+{v} Tempo für die ganze Crew',
    effect: { type: 'buffAll', stat: 'spd', value: 'v' } },
  { id: 'mera-mera', name: 'Mera-Mera-Frucht', vals: { v: [3, 5, 8, 12] },    text: '+{v} Angriff für das erste Crewmitglied',
    effect: { type: 'buffFront', stat: 'atk', value: 'v' } },
  { id: 'zoan',      name: 'Zoan-Frucht',      vals: { p: [0.1, 0.15, 0.22, 0.32] }, text: '+{p} Chance auf doppelten Schaden',
    effect: { type: 'crit', value: 'p' } },
  { id: 'heal',      name: 'Heil-Frucht',      unique: true,      text: 'Heilt alle lebenden Crewmitglieder voll',
    effect: { type: 'healAll' } },

  // Erwacht (aus Raids)
  { id: 'gum-gum-epic',   name: 'Erwachte Gum-Gum-Frucht',   awakened: true, text: '+4 Angriff und +8 Leben für die ganze Crew',
    effect: { type: 'multi', list: [{ type: 'buffAll', stat: 'atk', value: 4 }, { type: 'buffAll', stat: 'hp', value: 8 }] } },
  { id: 'mera-mera-epic', name: 'Erwachte Mera-Mera-Frucht', awakened: true, text: '+3 Angriff für die ganze Crew und +20 % Krit-Chance',
    effect: { type: 'multi', list: [{ type: 'buffAll', stat: 'atk', value: 3 }, { type: 'crit', value: 0.2 }] } },
  { id: 'haki-epic',      name: 'Erwachtes Königs-Haki',     awakened: true, text: '+2 Angriff, +12 Leben für die ganze Crew und +10 % Krit-Chance',
    effect: { type: 'multi', list: [{ type: 'buffAll', stat: 'atk', value: 2 }, { type: 'buffAll', stat: 'hp', value: 12 }, { type: 'crit', value: 0.1 }] } }
];
