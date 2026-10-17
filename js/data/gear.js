// Ausrüstung: kauft man beim Händler im Hauptquartier und nimmt sie im Lager
// mit in einen Run. Sie wird dabei verbraucht.
//   grant = was die Ausrüstung zu Beginn des Runs bewirkt:
//     { relic: 'kanone', r: 0 }   Schatz (r = Seltenheit, siehe config.rarities)
//     { hp: 10 }                  ganze Crew mehr Leben
//     { luck: 1 }                 ganze Run lang Beute mit Kopfgeldjäger-Glück
//     { points: 3 }               Kapitän startet mit Statuspunkten
//     { fruit: 'gum-gum', r: 1 }  Teufelsfrucht wird zu Beginn gegessen
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.gear = [
  { id: 'bordkanone', name: 'Bordkanone',          cost: 60,  grant: { relic: 'kanone', r: 0 },
    text: 'Startet mit dem Schatz Schiffskanone (Gewöhnlich).' },
  { id: 'proviant',   name: 'Proviantfass',        cost: 40,  grant: { hp: 10 },
    text: 'Die ganze Crew hat in diesem Run +10 Leben.' },
  { id: 'logport',    name: 'Ersatz-Log-Port',     cost: 70,  grant: { relic: 'logport', r: 0 },
    text: 'Startet mit dem Schatz Log Port (Gewöhnlich).' },
  { id: 'steckbrief', name: 'Steckbrief-Sammlung', cost: 80,  grant: { relic: 'steckbrief', r: 0 },
    text: 'Startet mit dem Schatz Kopfgeld-Steckbrief (Gewöhnlich).' },
  { id: 'muenze',     name: 'Glücksmünze',         cost: 90,  grant: { luck: 1 },
    text: 'Alle Beute in diesem Run wird mit Kopfgeldjäger-Glück gewürfelt.' },
  { id: 'trainbuch',  name: 'Trainingsbuch',       cost: 50,  grant: { points: 3 },
    text: 'Dein Kapitän startet mit 3 Statuspunkten.' },
  { id: 'fruchtkorb', name: 'Fruchtkorb',          cost: 110, grant: { fruit: 'gum-gum', r: 1 },
    text: 'Zu Beginn isst die Crew eine Gum-Gum-Frucht (Selten).' }
];
