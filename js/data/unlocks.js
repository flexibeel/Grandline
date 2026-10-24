// Dauerhafte Freischaltungen über Runs hinweg.
// when = Bedingung, geprüft nach jeder Aktion:
//   { defeated: 'smoker', times: 2 }   Boss so oft besiegt (über alle Runs)
//   { reached: 2, times: 3 }           Insel Nr. (0 = erste) so oft erreicht
//   { win: true, times: 2 }            so viele Runs gewonnen
//   { winWithout: 'ruffy' }  Run gewonnen, ohne diesen Kapitän
//   { runs: 3 }                        so viele Runs gespielt (egal wie sie enden)
//   { winWith: 'lysop' }               Run gewonnen, diese Figur in der Crew (oder als Kapitän)
//   { winFaction: 'buggy', n: 2 }      Run gewonnen mit mindestens n Figuren dieser Bande
//   { isle: 'arlong-park', times: 3 }  diese Insel so oft angesteuert
//   { kos: 300 }                       insgesamt so viele Gegner besiegt
//   { daily: 3 }                       so viele Tageskarten gespielt
//   { endless: 3 }                     in der Endlos-Fahrt so viele Runden in einem Meer geschafft
//   { alliance: 1 }                    so viele Bündnisse in einem Kampf aktiv gehabt
// unlock = id einer Figur aus crew.js (locked: true). Freigeschaltete Figuren sind
// danach als Kapitän wählbar und tauchen bei der Rekrutierung auf.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.unlocks = [
  { unlock: 'smoker',    when: { defeated: 'smoker', times: 3 },    text: 'Besiege Russ 3-mal.' },
  { unlock: 'arlong',    when: { defeated: 'arlong', times: 3 },    text: 'Besiege Brack 3-mal.' },
  { unlock: 'crocodile', when: { defeated: 'crocodile', times: 2 }, text: 'Besiege Sirokk 2-mal.' },
  { unlock: 'enel',      when: { defeated: 'enel', times: 2 },      text: 'Besiege Zirrus 2-mal.' },
  { unlock: 'rob-lucci', when: { defeated: 'rob-lucci', times: 2 }, text: 'Besiege Agent Krall 2-mal.' },
  { unlock: 'kaku',      when: { defeated: 'kaku', times: 2 },      text: 'Besiege Stelz 2-mal.' },
  { unlock: 'jinbei',    when: { reached: 2, times: 3 },            text: 'Erreiche die Gerichtsinsel 3-mal.' },
  { unlock: 'ace',       when: { win: true, times: 2 },             text: 'Gewinne 2 Runs.' },
  { unlock: 'marco',      when: { epics: 1 },                 text: 'Erwecke eine Zauberfrucht (gewinne einen Raid).' },
  { unlock: 'hancock',    when: { epic: 'gum-gum-epic' },    text: 'Erwecke die Gum-Gum-Frucht (Raid gegen Glanz).' },
  { unlock: 'doflamingo', when: { defeated: 'doflamingo', times: 2 }, text: 'Besiege Rosé 2-mal im Raid.' },
  { unlock: 'whitebeard', when: { raids: 4 },                text: 'Gewinne 4 Raids.' },
  { unlock: 'mihawk',     when: { heat: 3 },                 text: 'Schalte Kopfgeld-Stufe 3 frei.' },
  { unlock: 'shanks',     when: { defeated: 'shanks' },       text: 'Besiege Rotmantel Fenn (seltener Raid).' },
  { unlock: 'law',       when: { winWithout: 'ruffy' },   text: 'Gewinne einen Run mit einem anderen Kapitän als Ruffy.' },

  // ---- Inhalts-Update: neue Banden ----
  // Pomp-Truppe: früh und leicht zu bekommen, damit gleich nach den ersten Runs etwas Neues wartet
  { unlock: 'mohji',   when: { defeated: 'buggy', times: 1 },          text: 'Besiege Pomp in der Gauklerbucht.' },
  { unlock: 'cabaji',  when: { runs: 3 },                              text: 'Spiele 3 Runs.' },
  { unlock: 'alvida',  when: { isle: 'orange-town', times: 3 },        text: 'Steuere 3-mal die Gauklerbucht an.' },
  { unlock: 'buggy',   when: { winFaction: 'buggy', n: 2 },            text: 'Gewinne einen Run mit 2 Figuren der Pomp-Truppe in der Crew.' },
  // Flossenvolk
  { unlock: 'hatchan', when: { defeated: 'hatchan', times: 2 },        text: 'Besiege Okko 2-mal (Kopfgeld-Ziel in Flossenriff).' },
  { unlock: 'chu',     when: { isle: 'arlong-park', times: 3 },        text: 'Steuere 3-mal das Flossenriff an.' },
  { unlock: 'kuroobi', when: { kos: 250 },                             text: 'Besiege insgesamt 250 Gegner.' },
  // Gegenwind
  { unlock: 'koala',   when: { runs: 8 },                              text: 'Spiele 8 Runs.' },
  { unlock: 'ivankov', when: { daily: 3 },                             text: 'Spiele 3 Tageskarten.' },
  { unlock: 'sabo',    when: { winWith: 'ace' },                       text: 'Gewinne einen Run mit Asch in der Crew.' },
  { unlock: 'dragon',  when: { winFaction: 'revolution', n: 3 },       text: 'Gewinne einen Run mit 3 Figuren von Gegenwind.' },
  // Rotmantel-Flotte
  { unlock: 'yasopp',  when: { winWith: 'lysop' },                     text: 'Gewinne einen Run mit Lysop in der Crew.' },
  { unlock: 'roo',     when: { kos: 600 },                             text: 'Besiege insgesamt 600 Gegner.' },
  { unlock: 'beckman', when: { winWith: 'shanks' },                    text: 'Gewinne einen Run mit Fenn in der Crew.' },
  // Bekannte Banden
  { unlock: 'aokiji',  when: { heat: 2 },                              text: 'Schalte Kopfgeld-Stufe 2 frei.' },
  { unlock: 'fukuro',  when: { defeated: 'fukuro', times: 2 },         text: 'Besiege Plapper 2-mal (Messinghafen).' },
  { unlock: 'vista',   when: { winFaction: 'weissbart', n: 2 },        text: 'Gewinne einen Run mit 2 Figuren der Gischt-Flotte.' },
  { unlock: 'kuma',    when: { defeated: 'kuma', times: 2 },           text: 'Besiege Tatz 2-mal (Spiegel-Archipel).' },
  { unlock: 'perona',  when: { defeated: 'perona', times: 2 },         text: 'Besiege Huschel 2-mal (Gruselgarten).' },
  // Die Wildfänge
  { unlock: 'kid',     when: { isle: 'sabaody', times: 2 },            text: 'Erreiche 2-mal den Spiegel-Archipel.' },
  { unlock: 'killer',  when: { winWith: 'kid' },                       text: 'Gewinne einen Run mit Magnus.' },
  { unlock: 'bonney',  when: { reached: 2, times: 6 },                 text: 'Erreiche 6-mal das dritte Meer.' },
  { unlock: 'drake',   when: { kos: 900 },                             text: 'Besiege insgesamt 900 Gegner.' },
  { unlock: 'hawkins', when: { daily: 7 },                             text: 'Spiele 7 Tageskarten.' },
  { unlock: 'apoo',    when: { endless: 3 },                           text: 'Schaffe 3 Runden in einer Endlos-Fahrt.' },
  // Schauerbarken-Bande
  { unlock: 'hody',    when: { defeated: 'hody', times: 2 },           text: 'Besiege Grimmflosse 2-mal (Tiefsee).' },
  { unlock: 'moria',   when: { defeated: 'moria', times: 2 },          text: 'Besiege Graf Dämmerling 2-mal.' },
  { unlock: 'absalom', when: { defeated: 'absalom', times: 2 },        text: 'Besiege Ulf 2-mal (Nebelkap).' },
  { unlock: 'hogback', when: { defeated: 'hogback', times: 2 },        text: 'Besiege Doktor Flick 2-mal (Flicks Labor).' }
];
