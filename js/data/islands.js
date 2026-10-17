// Meere in der Reihenfolge, in der sie besucht werden. Jedes Meer besteht aus zwei Insel-Kapiteln
// wie in der Serie: erst eine kleine Insel (am Ende wartet ihr Bösewicht), dann eine große Insel
// (am Ende wartet der Boss des Meeres). Vor jedem Kapitel wählt man den Kurs: welche Insel als Nächstes?
//
//   small: kleine Inseln, pro Run werden 2 davon zur Wahl gestellt
//          villain = Bösewicht am Ende (id aus hunted.js), places = Orte auf der Insel (eine Reihe pro Ort)
//   big:   große Inseln, boss = id aus enemies.js (GL.data.bosses), beide stehen zur Wahl
//   villains = Kopfgeld-Ziele, die auf dieser Insel unterwegs sein können
//   lair = Name des letzten Orts (Kampf gegen den Bösewicht bzw. Boss)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.islands = [
  { id: 'east-blue', name: 'East Blue', bosses: ['smoker', 'arlong'],
    tagline: 'Das ruhigste der vier Meere. Hier beginnt jede Legende.',
    small: [
      { id: 'shells-town', name: 'Shells Town', villain: 'morgan', lair: 'Marine-Basis 153',
        text: 'Ein Marine-Kapitän regiert die Stadt mit eiserner Axt.', places: ['Hafen', 'Marktgasse'] },
      { id: 'orange-town', name: 'Orange Town', villain: 'buggy', lair: 'Zirkuszelt',
        text: 'Die Stadt ist leer, der Clown und seine Bande haben sie besetzt.', places: ['Verlassene Straßen', 'Tierladen'] },
      { id: 'syrup', name: 'Syrup', villain: 'kuro', lair: 'Kayas Anwesen',
        text: 'Ein friedliches Dorf. Doch der Butler plant etwas Finsteres.', places: ['Küstenhang', 'Dorfplatz'] },
      { id: 'baratie', name: 'Baratie', villain: 'krieg', lair: 'Restaurant-Deck',
        text: 'Ein schwimmendes Restaurant. Ein ausgehungerter Pirat will es kapern.', places: ['Offene See', 'Küche'] }
    ],
    big: [
      { id: 'loguetown', name: 'Loguetown', boss: 'smoker', lair: 'Hinrichtungsplatz', villains: ['buggy', 'morgan'],
        text: 'Die Stadt des Anfangs und des Endes. Ein Marine-Jäger wartet.', places: ['Hafenviertel', 'Marktplatz'] },
      { id: 'arlong-park', name: 'Arlong Park', boss: 'arlong', lair: 'Arlong Park', villains: ['hatchan'],
        text: 'Fischmenschen haben die Inselgruppe unterworfen.', places: ['Kokos', 'Mandarinenhain'] }
    ] },

  { id: 'paradies', name: 'Paradies', bosses: ['crocodile', 'enel'],
    tagline: 'Die erste Hälfte der Grand Line. Wüsten, Himmelsinseln und Verrat.',
    small: [
      { id: 'whisky-peak', name: 'Whisky Peak', villain: 'mr9', lair: 'Festhalle',
        text: 'Die Bewohner feiern jeden Piraten. Zu freundlich, um wahr zu sein.', places: ['Kakteenhafen', 'Willkommensfest'] },
      { id: 'little-garden', name: 'Little Garden', villain: 'mr3', lair: 'Kerzenhaus',
        text: 'Ein Urzeit-Dschungel, auf dem zwei Riesen seit hundert Jahren kämpfen.', places: ['Urwald', 'Riesenlager'] },
      { id: 'drumm', name: 'Drumm', villain: 'wapol', lair: 'Schloss auf dem Gipfel',
        text: 'Eine Winterinsel ohne Ärzte. Der alte König will zurück.', places: ['Schneefeld', 'Bighorn'] },
      { id: 'jaya', name: 'Jaya', villain: 'bellamy', lair: 'Mock Town',
        text: 'Eine Stadt der Spötter, die nicht an Träume glauben.', places: ['Küstenwald', 'Tavernenviertel'] }
    ],
    big: [
      { id: 'alabasta', name: 'Alabasta', boss: 'crocodile', lair: 'Alubarna', villains: ['mr1'],
        text: 'Ein Wüstenkönigreich am Rand des Bürgerkriegs.', places: ['Sandora-Wüste', 'Rainbase'] },
      { id: 'skypiea', name: 'Skypiea', boss: 'enel', lair: 'Upper Yard', villains: ['ohm'],
        text: 'Eine Insel über den Wolken, beherrscht von einem selbsternannten Gott.', places: ['Weiße See', 'Angel Beach'] }
    ] },

  { id: 'enies-lobby', name: 'Enies Lobby', bosses: ['rob-lucci', 'kaku'],
    tagline: 'Die Justizinsel der Weltregierung. Ab hier gibt es kein Zurück.',
    small: [
      { id: 'long-ring', name: 'Long Ring Long Land', villain: 'foxy', lair: 'Davy-Back-Arena',
        text: 'Ein langgestrecktes Land. Ein Pirat fordert zum Crew-Wettkampf.', places: ['Grasebene', 'Festplatz'] },
      { id: 'water-7', name: 'Water 7', villain: 'fukuro', lair: 'Galley-La-Werft',
        text: 'Die Stadt der Schiffsbauer. Hinter den Kulissen lauern Agenten.', places: ['Kanäle', 'Franky-Haus'] },
      { id: 'puffing-tom', name: 'Puffing Tom', villain: 'nero', lair: 'Lokomotive',
        text: 'Ein Seezug durch den Sturm, voller Marinesoldaten.', places: ['Letzter Waggon', 'Mittelwagen'] },
      { id: 'enies-gate', name: 'Enies Lobby Vorplatz', villain: 'spandam', lair: 'Hauptgebäude',
        text: 'Das Haupttor der Justizinsel. Hier gibt der Chef der CP9 die Befehle.', places: ['Haupttor', 'Gerichtsstadt'] }
    ],
    big: [
      { id: 'tower', name: 'Turm des Gerichts', boss: 'rob-lucci', lair: 'Turmspitze', villains: ['jabra', 'blueno'],
        text: 'Der stärkste Agent der Weltregierung erwartet euch.', places: ['Gerichtshof', 'Treppenhaus'] },
      { id: 'tor', name: 'Tor der Gerechtigkeit', boss: 'kaku', lair: 'Dach des Turms', villains: ['blueno', 'jabra'],
        text: 'Der Weg zum Tor führt über die Dächer, bewacht von der Giraffe.', places: ['Brücke', 'Dachgarten'] }
    ],
    // Zweite Route für das dritte Meer (ab Rang 8, siehe features.js): Beim Kurs setzen steht dann
    // eine Insel aus jeder Route zur Wahl. Die Wahl entscheidet, welches Meer man befährt.
    alt: { id: 'thriller-bark', name: 'Thriller Bark', bosses: ['moria', 'kuma'],
      tagline: 'Nebel, Zombies und ein Schatten-Dieb. Danach wartet der Archipel vor der Neuen Welt.',
      small: [
        { id: 'florian', name: 'Florian-Dreieck', villain: 'absalom', lair: 'Nebelwand',
          text: 'Ein ewiger Nebel. Wer hier verschwindet, taucht nie wieder auf.', places: ['Nebelbank', 'Geisterschiff'] },
        { id: 'grusel-garten', name: 'Gruselgarten', villain: 'perona', lair: 'Spukturm',
          text: 'Kleine Geister schweben durch die Bäume. Sie machen jeden mutlos.', places: ['Friedhof', 'Zombiewald'] },
        { id: 'hogback-labor', name: 'Hogbacks Labor', villain: 'hogback', lair: 'Operationssaal',
          text: 'Ein berühmter Arzt flickt hier Zombies zusammen. Sie stehen immer wieder auf.', places: ['Kellergang', 'Kühlhaus'] },
        { id: 'mangroven', name: 'Mangroven', villain: 'duval', lair: 'Blasenpark',
          text: 'Seifenblasen steigen aus den Wurzeln. Eine Bande mit Eisenmaske lauert.', places: ['Wurzelpfad', 'Blasenufer'] }
      ],
      big: [
        { id: 'thriller-schloss', name: 'Thriller Bark', boss: 'moria', lair: 'Thronsaal', villains: ['absalom', 'hogback'],
          text: 'Ein riesiges Geisterschiff. Sein Herr stiehlt Schatten.', places: ['Schlosshof', 'Tanzsaal'] },
        { id: 'sabaody', name: 'Sabaody Archipel', boss: 'kuma', lair: 'Mangrove 13', villains: ['duval', 'perona'],
          text: 'Das Tor zur Neuen Welt. Ein stiller Riese räumt den Weg frei.', places: ['Auktionshaus', 'Vergnügungspark'] }
      ] } }
];
// Daten eines Meeres im Run (berücksichtigt die gewählte Route)
GL.data.seaOf = (run, idx) => { const S = GL.data.islands[idx]; return S && S.alt && run && run.alt && run.alt[idx] ? S.alt : S; };

// Texte für die Routen-Knoten auf der Karte
GL.data.nodes = {
  battle:   { title: 'Marine-Patrouille',  text: 'Kampf gegen Soldaten und Piraten.' },
  elite:    { title: 'Kopfgeldjäger',      text: 'Starker Gegner, dafür gibt es einen Schatz.' },
  recruit:  { title: 'Taverne',            text: 'Neue Crewmitglieder mit Gold anheuern.' },
  fruit:    { title: 'Teufelsfrucht',      text: 'Wähle 1 von 3.' },
  treasure: { title: 'Schatztruhe',        text: 'Wähle 1 von 3 Schätzen. Sie wirken den ganzen Run.' },
  rest:     { title: 'Rast an Land',       text: 'Heilt alle um 40 %.' },
  boss:     { title: 'Inselboss',          text: 'Besiege ihn für Kopfgeld und Erwachen.' },
  raid:     { title: 'Raid',               text: 'Extrem starker Gegner. Sieg: epische Teufelsfrucht für immer. Niederlage beendet den Run nicht.' }
};
