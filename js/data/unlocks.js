// Dauerhafte Freischaltungen über Runs hinweg.
// when = Bedingung, geprüft nach jeder Aktion:
//   { defeated: 'smoker', times: 2 }   Boss so oft besiegt (über alle Runs)
//   { reached: 2, times: 3 }           Insel Nr. (0 = erste) so oft erreicht
//   { win: true, times: 2 }            so viele Runs gewonnen
//   { winWithout: 'ruffy' }  Run gewonnen, ohne diesen Kapitän
// unlock = id einer Figur aus crew.js (locked: true). Freigeschaltete Figuren sind
// danach als Kapitän wählbar und tauchen bei der Rekrutierung auf.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.unlocks = [
  { unlock: 'smoker',    when: { defeated: 'smoker', times: 3 },    text: 'Besiege Smoker 3-mal.' },
  { unlock: 'arlong',    when: { defeated: 'arlong', times: 3 },    text: 'Besiege Arlong 3-mal.' },
  { unlock: 'crocodile', when: { defeated: 'crocodile', times: 2 }, text: 'Besiege Crocodile 2-mal.' },
  { unlock: 'enel',      when: { defeated: 'enel', times: 2 },      text: 'Besiege Enel 2-mal.' },
  { unlock: 'rob-lucci', when: { defeated: 'rob-lucci', times: 2 }, text: 'Besiege Rob Lucci 2-mal.' },
  { unlock: 'kaku',      when: { defeated: 'kaku', times: 2 },      text: 'Besiege Kaku 2-mal.' },
  { unlock: 'jinbei',    when: { reached: 2, times: 3 },            text: 'Erreiche Enies Lobby 3-mal.' },
  { unlock: 'ace',       when: { win: true, times: 2 },             text: 'Gewinne 2 Runs.' },
  { unlock: 'law',       when: { winWithout: 'ruffy' },   text: 'Gewinne einen Run mit einem anderen Kapitän als Ruffy.' }
];
