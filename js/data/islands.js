// Inseln in der Reihenfolge, in der sie besucht werden.
// bosses = mögliche Bosse (ids aus GL.data.bosses). Pro Run wird einer ausgelost,
// damit nicht immer dieselbe Crew den ersten Boss am besten kontert.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.islands = [
  { id: 'east-blue',   name: 'East Blue',   bosses: ['smoker', 'arlong'],
    tagline: 'Das ruhigste der vier Meere. Hier beginnt jede Legende.',
    // Stationen wie in der Serie: eine Reihe der Seekarte pro Insel, villain = Kopfgeld-Ziel dort
    stops: [
      { name: 'Shells Town',  villain: 'morgan' },
      { name: 'Orange Town',  villain: 'buggy' },
      { name: 'Syrup',        villain: 'kuro' },
      { name: 'Baratie',      villain: 'krieg' }
    ],
    bossStops: { smoker: 'Loguetown', arlong: 'Arlong Park' } },
  { id: 'paradies',    name: 'Paradies',    bosses: ['crocodile', 'enel'],
    tagline: 'Die erste Hälfte der Grand Line. Wüsten, Himmelsinseln und Verrat.',
    stops: [
      { name: 'Whisky Peak',  villain: null },
      { name: 'Little Garden', villain: 'mr3' },
      { name: 'Drumm',        villain: 'wapol' },
      { name: 'Jaya',         villain: 'bellamy' }
    ],
    bossStops: { crocodile: 'Alabasta', enel: 'Skypiea' } },
  { id: 'enies-lobby', name: 'Enies Lobby', bosses: ['rob-lucci', 'kaku'],
    tagline: 'Die Justizinsel der Weltregierung. Ab hier gibt es kein Zurück.',
    stops: [
      { name: 'Long Ring Long Land', villain: 'foxy' },
      { name: 'Water 7',      villain: 'fukuro' },
      { name: 'Seezug Puffing Tom', villain: 'nero' },
      { name: 'Enies Lobby',  villain: 'spandam' }
    ],
    bossStops: { 'rob-lucci': 'Turm des Gerichts', kaku: 'Turm des Gerichts' } }
];

// Texte für die Routen-Knoten auf der Karte
GL.data.nodes = {
  battle:   { title: 'Marine-Patrouille',  text: 'Kampf gegen Soldaten und Piraten.' },
  elite:    { title: 'Kopfgeldjäger',      text: 'Starker Gegner, dafür gibt es einen Schatz.' },
  recruit:  { title: 'Neues Crewmitglied', text: 'Wähle 1 von 3.' },
  fruit:    { title: 'Teufelsfrucht',      text: 'Wähle 1 von 3.' },
  treasure: { title: 'Schatztruhe',        text: 'Wähle 1 von 3 Schätzen. Sie wirken den ganzen Run.' },
  rest:     { title: 'Rast an Land',       text: 'Heilt alle um 40 %.' },
  boss:     { title: 'Inselboss',          text: 'Besiege ihn für Kopfgeld und Erwachen.' },
  raid:     { title: 'Raid',               text: 'Extrem starker Gegner. Sieg: epische Teufelsfrucht für immer. Niederlage beendet den Run nicht.' }
};
