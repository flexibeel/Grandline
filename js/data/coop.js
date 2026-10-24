// Gemeinschafts-Fahrt: bis zu 4 Stammcrews (du + 3 Kumpane) gegen einen Welt-Boss.
// Asynchron: die Crews deiner Kumpane kommen aus ihren Ranglisten-Einträgen (gespeicherte Stammcrew).
// Jede Woche ein anderer Boss. Ergebnis: Schaden je Team. Beute einmal am Tag.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.coop = {
  triesPerDay: 3,        // Versuche pro Tag
  perTeam: 3,            // so viele Figuren bringt jede Crew mit (die stärksten)
  bosses: [
    { id: 'coop-seeking', name: 'Tiefseeriese der Calm Belt', short: 'Tiefseeriese', type: 'klinge', hp: 2200, atk: 16, spd: 5,
      ability: 'burn', power: 0.3, abilityName: 'Schwanzschlag',
      text: 'Sein Schwanz trifft alle in der Reihe mit. Groß, nass, schlecht gelaunt.',
      tip: 'Viel Leben und Heilung halten länger durch. Bollwerk vorne hilft.',
      bg: 'sea',
      art: { c: { P: '#6a8ac0', p: '#3a5a8a', E: '#f2d24a', T: '#f4f0e0', b: '#e8d0a0', W: '#4f9ccf', w: '#2f6f9f' },
        rows: ['................', '.....PPPP.......', '...PPPPPPPP.....', '..PPEPPPPPPP....', '.PPPPPPPPPPPp...', 'TPTPTPPPPPPPp...', '.......PPPPPp...', 'TPTPTPPPPPPPp...', '.PPPPPPPPPPpp...', '....bPPPPPpp....', '....bPPPPpp.....', '....bPPPpp......', 'WWWWWbPPPpWWWWWW', 'wWWWWWWWWWWWWWWw'] } },
    { id: 'coop-krake', name: 'Riesenkrake Surume', short: 'Riesenkrake', type: 'technik', hp: 6000, atk: 21, spd: 7,
      ability: 'double', power: 0, abilityName: 'Acht Arme, acht Meinungen',
      text: 'Greift zweimal pro Runde an. Hat acht Arme und benutzt trotzdem nur zwei. Typisch.',
      tip: 'Tempo und Ausweichen lohnen sich: Wer zuerst handelt, trifft öfter.',
      bg: 'deep',
      art: { c: { K: '#c0507a', k: '#8a2f55', E: '#fff2b0', N: '#1a1a1a', S: '#f0a0c0', W: '#3f7fae', w: '#2a5a80' },
        rows: ['................', '.....KKKKKK.....', '....KKKKKKKK....', '...KKSKKKKSKK...', '...KENKKKKENK...', '...KKKKKKKKKK...', '....KKKKKKKK....', '....kKkKKkKk....', '...KK.KK.KK.KK..', '..KK..K..K..KK..', '.KK..KK..KK..KK.', '.K...K....K...K.', 'WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww'] } },
    { id: 'coop-riese', name: 'Eisberg-Riese Oars', short: 'Riese', type: 'kraft', hp: 3600, atk: 27, spd: 3,
      ability: 'thorns', power: 3, abilityName: 'Eisige Haut',
      text: 'Wer ihn trifft, friert sich die Finger ab (3 Schaden zurück). Langsam, aber das reicht ihm.',
      tip: 'Wucht mit wenigen großen Treffern statt vieler kleiner. Heiler gegen die Kälte.',
      bg: 'snow',
      art: { c: { S: '#e9c8a0', s: '#c9a07a', H: '#4a3a2a', B: '#5a7ab0', b: '#3a5a8a', I: '#dff0fa', i: '#a8cfe8', E: '#1a1a1a', R: '#c0392b' },
        rows: ['.....HHHHHH.....', '....HSSSSSSH....', '....SESSSSES....', '....SSSRRSSS....', '.....SSSSSS.....', '..BBBBBBBBBBBB..', '.SBBBBBBBBBBBBS.', '.SS.BBBBBBBB.SS.', '.SS.BBBBBBBB.SS.', '.ss.bbbbbbbb.ss.', '....bbb..bbb....', '....bbb..bbb....', 'IIIIIIIIIIIIIIII', 'iiiiiiiiiiiiiiii'] } }
  ]
};
