// Werft: dauerhafte Ausbauten im Hauptquartier, bezahlt mit Berry.
//   costs  = Preis je Stufe (Länge = maximale Stufe)
//   per    = Wirkung pro Stufe, {v} im Text wird durch die Gesamtwirkung ersetzt
//   effect = was die Spiellogik damit macht (js/engine/run.js, Funktion applyStart):
//     hp / atk / spd   Grundwerte der ganzen Crew (auch für neue Mitglieder)
//     restHeal         zusätzliche Heilung bei Rast
//     choices          zusätzliche Auswahl bei Rekrutierung, Früchten und Schätzen
//     luck             Chance, dass Beute mit Kopfgeldjäger-Glück gewürfelt wird
//     xp               zusätzliche Erfahrung
//     berry            zusätzliche Berry am Ende eines Runs
//     slots            zusätzliche Lagerplätze für Ausrüstung
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.upgrades = [
  { id: 'rumpf',     name: 'Verstärkter Rumpf', effect: 'hp',       per: 3,    costs: [120, 260, 450, 700, 1000],
    text: 'Die ganze Crew startet mit +{v} Leben.' },
  { id: 'kanonen',   name: 'Kanonendeck',       effect: 'atk',      per: 1,    costs: [400, 1100],
    text: 'Die ganze Crew hat +{v} Angriff.' },
  { id: 'segel',     name: 'Neue Segel',        effect: 'spd',      per: 1,    costs: [300, 900],
    text: 'Die ganze Crew hat +{v} Tempo.' },
  { id: 'kombuese',  name: 'Kombüse',           effect: 'restHeal', per: 0.15, costs: [150, 350, 650],
    text: 'Rast an Land heilt zusätzlich {v}.' },
  { id: 'ausguck',   name: 'Ausguck',           effect: 'choices',  per: 1,    costs: [1200],
    text: '{v} Auswahl mehr bei Rekrutierung, Früchten und Schätzen.' },
  { id: 'schatzkarte', name: 'Schatzkarten',    effect: 'luck',     per: 0.15, costs: [200, 450, 800],
    text: '{v} Chance auf Beute mit Kopfgeldjäger-Glück.' },
  { id: 'training',  name: 'Trainingsraum',     effect: 'xp',       per: 0.2,  costs: [180, 420, 750],
    text: 'Die Crew bekommt {v} mehr Erfahrung.' },
  { id: 'buero',     name: 'Kopfgeldbüro',      effect: 'berry',    per: 0.15, costs: [100, 300, 600],
    text: 'Am Ende eines Runs gibt es {v} mehr Berry.' },
  { id: 'lager',     name: 'Lagerraum',         effect: 'slots',    per: 1,    costs: [250, 700],
    text: '{v} Lagerplätze mehr für Ausrüstung.' }
];
