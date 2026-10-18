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
        text: 'Ein Marine-Kapitän regiert die Stadt mit eiserner Axt.', places: ['Hafen', 'Marktgasse'], bias: ['battle'] },
      { id: 'orange-town', name: 'Orange Town', villain: 'buggy', lair: 'Zirkuszelt',
        text: 'Die Stadt ist leer, der Clown und seine Bande haben sie besetzt.', places: ['Verlassene Straßen', 'Tierladen'], bias: ['recruit'] },
      { id: 'syrup', name: 'Syrup', villain: 'kuro', lair: 'Kayas Anwesen',
        text: 'Ein friedliches Dorf. Doch der Butler plant etwas Finsteres.', places: ['Küstenhang', 'Dorfplatz'], bias: ['rest'] },
      { id: 'baratie', name: 'Baratie', villain: 'krieg', lair: 'Restaurant-Deck',
        text: 'Ein schwimmendes Restaurant. Ein ausgehungerter Pirat will es kapern.', places: ['Offene See', 'Küche'], bias: ['rest', 'fruit'] },
      // Remix (Großer Neustart): zwei neue Inseln im East Blue
      { id: 'gecko-klippen', name: 'Gecko-Klippen', villain: 'jango', lair: 'Mondscheinklippe',
        text: 'Steile Klippen über dem Meer. Ein Hypnotiseur lässt hier ganze Dörfer schlafen.', places: ['Pendelpfad', 'Leuchtfeuer'], bias: ['fruit', 'rest'] },
      { id: 'eisenbucht', name: 'Eisenbucht', villain: 'gin', lair: 'Rostiges Wrack',
        text: 'Eine Bucht voller Schiffswracks. Ein ausgehungerter Kampfmeister lauert im Rost.', places: ['Wrackfeld', 'Ankerfriedhof'], bias: ['elite', 'battle'] }
    ],
    big: [
      { id: 'loguetown', name: 'Loguetown', boss: 'smoker', lair: 'Hinrichtungsplatz', villains: ['buggy', 'pearl', 'morgan'], bias: ['recruit'],
        text: 'Die Stadt des Anfangs und des Endes. Ein Marine-Jäger wartet.', places: ['Hafenviertel', 'Marktplatz'] },
      { id: 'arlong-park', name: 'Arlong Park', boss: 'arlong', lair: 'Arlong Park', villains: ['hatchan', 'pearl', 'chew'], bias: ['battle'],
        text: 'Fischmenschen haben die Inselgruppe unterworfen.', places: ['Kokos', 'Mandarinenhain'] }
    ] },

  { id: 'paradies', name: 'Paradies', bosses: ['crocodile', 'enel'],
    tagline: 'Die erste Hälfte der Grand Line. Wüsten, Himmelsinseln und Verrat.',
    small: [
      { id: 'whisky-peak', name: 'Whisky Peak', villain: 'mr9', lair: 'Festhalle',
        text: 'Die Bewohner feiern jeden Piraten. Zu freundlich, um wahr zu sein.', places: ['Kakteenhafen', 'Willkommensfest'], bias: ['recruit'] },
      { id: 'little-garden', name: 'Little Garden', villain: 'mr3', lair: 'Kerzenhaus',
        text: 'Ein Urzeit-Dschungel, auf dem zwei Riesen seit hundert Jahren kämpfen.', places: ['Urwald', 'Riesenlager'], bias: ['fruit'] },
      { id: 'drumm', name: 'Drumm', villain: 'wapol', lair: 'Schloss auf dem Gipfel',
        text: 'Eine Winterinsel ohne Ärzte. Der alte König will zurück.', places: ['Schneefeld', 'Bighorn'], bias: ['rest'] },
      { id: 'jaya', name: 'Jaya', villain: 'bellamy', lair: 'Mock Town',
        text: 'Eine Stadt der Spötter, die nicht an Träume glauben.', places: ['Küstenwald', 'Tavernenviertel'], bias: ['treasure'] },
      // Remix: der Eingang zur Grand Line als eigene Insel
      { id: 'zwillingskap', name: 'Zwillingskap', villain: 'mr4', lair: 'Leuchtturm am Kap',
        text: 'Ein Riesenwal rammt seit fünfzig Jahren den Red Line. Am Leuchtturm lauert ein Agent mit Bombenhund.', places: ['Walbauch', 'Rückwärtsberg'], bias: ['fruit', 'rest'] }
    ],
    big: [
      { id: 'alabasta', name: 'Alabasta', boss: 'crocodile', lair: 'Alubarna', villains: ['mr1', 'mr4', 'zala'], bias: ['treasure'],
        text: 'Ein Wüstenkönigreich am Rand des Bürgerkriegs.', places: ['Sandora-Wüste', 'Rainbase'] },
      { id: 'skypiea', name: 'Skypiea', boss: 'enel', lair: 'Upper Yard', villains: ['ohm'], bias: ['fruit'],
        text: 'Eine Insel über den Wolken, beherrscht von einem selbsternannten Gott.', places: ['Weiße See', 'Angel Beach'] }
    ],
    // Zweite Route für das zweite Meer (ab Rang 12, feature 'route2'): zehntausend Meter unter dem Meer
    alt: { id: 'fischmenschen', name: 'Fischmenscheninsel', feature: 'route2', bosses: ['hody', 'vander'],
      tagline: 'Zehntausend Meter tief, unter einer Blase aus Licht. Nicht jeder hier mag Menschen.',
      small: [
        { id: 'tiefsee', name: 'Tiefsee', villain: 'hyouzou', lair: 'Wrack im Dunkeln',
          text: 'Je tiefer das Schiff sinkt, desto dunkler wird es. Ein Schwertkämpfer wartet im Wrack.', places: ['Laternenfische', 'Sinkende Blase'] },
        { id: 'korallenhuegel', name: 'Korallenhügel', villain: 'zeo', lair: 'Korallentor',
          text: 'Bunte Korallen und Meerjungfrauen-Cafés. Irgendwer ist hier unsichtbar.', places: ['Blasenstraße', 'Meerjungfrauen-Café'] },
        { id: 'fischmenschen-viertel', name: 'Fischmenschen-Viertel', villain: 'daruma', lair: 'Verlassene Gasse',
          text: 'Ein vergessenes Viertel am Rand der Insel. Hier gräbt sich einer durch den Boden.', places: ['Muschelmarkt', 'Alte Brunnen'] },
        { id: 'meerwald', name: 'Meereswald', villain: 'dosun', lair: 'Lichtung der Wurzeln',
          text: 'Ein stiller Wald aus Licht und Seetang. Ein Hammerhai bewacht den Weg.', places: ['Wurzelgrab', 'Schiffsfriedhof'] }
      ],
      big: [
        { id: 'gyoncorde', name: 'Gyoncorde-Platz', boss: 'hody', lair: 'Platz vor dem Palast', villains: ['ikaros', 'dosun'],
          text: 'Der große Platz der Insel. Ein Hai mit Hass im Herzen will alles übernehmen.', places: ['Fischmenschen-Straße', 'Tribünen'] },
        { id: 'ryugu', name: 'Ryugu-Palast', boss: 'vander', lair: 'Über dem Palast', villains: ['ikaros', 'zeo'],
          text: 'Der Palast des Königs in einer Riesenblase. Über ihm schwebt ein ganzes Schiff.', places: ['Muschelhalle', 'Palastgarten'] }
      ] } },

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
      { id: 'tower', name: 'Turm des Gerichts', boss: 'rob-lucci', lair: 'Turmspitze', villains: ['jabra', 'wanze', 'blueno'],
        text: 'Der stärkste Agent der Weltregierung erwartet euch.', places: ['Gerichtshof', 'Treppenhaus'] },
      { id: 'tor', name: 'Tor der Gerechtigkeit', boss: 'kaku', lair: 'Dach des Turms', villains: ['blueno', 'wanze', 'jabra'],
        text: 'Der Weg zum Tor führt über die Dächer, bewacht von der Giraffe.', places: ['Brücke', 'Dachgarten'] }
    ],
    // Zweite Route für das dritte Meer (ab Rang 8, siehe features.js): Beim Kurs setzen steht dann
    // eine Insel aus jeder Route zur Wahl. Die Wahl entscheidet, welches Meer man befährt.
    alt: { id: 'thriller-bark', name: 'Thriller Bark', feature: 'route', bosses: ['moria', 'kuma'],
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
// Insel-Twists (Großer Neustart): jedes Insel-Kapitel bekommt aus dem Seed eine kleine Sonderregel,
// damit sich kein Run wie der letzte anfühlt. Ohne Zufallszug (Replays bleiben gleich), siehe GL.run.twist.
//   types = zusätzliche Orte im Kartentopf, foeSpd = Tempo der Gegner, foeKinds = Extra-Chance auf besondere Gegner
GL.data.twists = [
  { id: 'markttag',   icon: '🏮', name: 'Markttag',        text: 'Mehr Tavernen auf der Karte. Heute ist viel los im Hafen.', types: ['recruit', 'recruit'] },
  { id: 'kopfgeld',   icon: '📜', name: 'Steckbrief-Woche', text: 'Mehr Kopfgeldjäger unterwegs: starke Gegner, dafür mehr Schätze.', types: ['elite', 'elite'] },
  { id: 'schatzinsel', icon: '💎', name: 'Schatzinsel',    text: 'Mehr Schatztruhen und Teufelsfrüchte auf der Karte.', types: ['treasure', 'fruit'] },
  { id: 'patrouille', icon: '⚓', name: 'Marine-Razzia',    text: 'Mehr besondere Gegner: Leibwachen, Sanitäter, Raufbolde.', types: ['battle'], foeKinds: 0.18 },
  { id: 'ruhig',      icon: '🌙', name: 'Stille Bucht',     text: 'Mehr Rastplätze, alle Gegner sind 1 Tempo langsamer.', types: ['rest'], foeSpd: -1 },
  { id: 'sturm',      icon: '🌊', name: 'Sturmflut',        text: 'Alle Gegner sind 1 Tempo schneller, dafür treiben mehr Früchte an.', types: ['fruit', 'fruit'], foeSpd: 1, weather: 'storm' },
  // Wetter und Lage (Lage & Wetter): goldX = mehr/weniger Gold nach Siegen, restAdd = Rast heilt mehr/weniger, foeHp = Gegner-Leben
  { id: 'regen',      icon: '🌧', name: 'Dauerregen',       text: 'Rutschiges Deck: Gegner 1 Tempo langsamer. Die Decken sind nass, Rast heilt weniger.', foeSpd: -1, restAdd: -0.1, weather: 'rain',
    en: ['Endless rain', 'Slippery deck: enemies 1 speed slower. The blankets are wet, resting heals less.'] },
  { id: 'nebel',      icon: '🌫', name: 'Dichter Nebel',    text: 'Im Nebel findet man Dinge. Und Dinge finden einen: mehr Schätze, mehr besondere Gegner.', types: ['treasure'], foeKinds: 0.12, weather: 'fog',
    en: ['Thick fog', 'In the fog you find things. And things find you: more treasure, more special enemies.'] },
  { id: 'hitze',      icon: '☀', name: 'Hitzewelle',       text: 'Alle schwitzen, die Gegner am meisten: 8 % weniger Leben. Dafür gibt es weniger Gold, keiner will arbeiten.', foeHp: -0.08, goldX: -0.2,
    en: ['Heatwave', 'Everyone sweats, enemies most of all: 8% less health. Less gold, though, nobody wants to work.'] },
  { id: 'vollmond',   icon: '🌕', name: 'Vollmond',         text: 'Die Gegner sind gereizt (+8 % Leben), mehr Kopfgeldjäger. Wer gewinnt, kassiert 25 % mehr Gold.', foeHp: 0.08, goldX: 0.25, types: ['elite'], time: 'night',
    en: ['Full moon', 'Enemies are grumpy (+8% health), more bounty hunters. Winners earn 25% more gold.'] },
  { id: 'marktfest',  icon: '🎪', name: 'Marktfest',        text: 'Überall Stände: mehr Tavernen und 20 % mehr Gold nach Siegen. Die Taschendiebe sind auch da.', types: ['recruit'], goldX: 0.2,
    en: ['Market fair', 'Stalls everywhere: more taverns and 20% more gold after wins. The pickpockets came too.'] },
  { id: 'schnee',     icon: '❄', name: 'Schneegestöber',   text: 'Alle frieren: Gegner 1 Tempo langsamer, aber dick eingepackt (+6 % Leben).', foeSpd: -1, foeHp: 0.06, weather: 'snow',
    en: ['Snow flurry', 'Everyone is freezing: enemies 1 speed slower, but well wrapped up (+6% health).'] },
  { id: 'gewitter',   icon: '⛈', name: 'Gewitter',         text: 'Blitze über dem Meer: Gegner 1 Tempo schneller, aber die Beute glänzt (+30 % Gold).', foeSpd: 1, goldX: 0.3, weather: 'storm',
    en: ['Thunderstorm', 'Lightning over the sea: enemies 1 speed faster, but the loot shines (+30% gold).'] },
  { id: 'moewen',     icon: '🐦', name: 'Möwenplage',       text: 'Die Möwen klauen Kleingeld (−15 % Gold), lassen aber Früchte fallen. Kalle bestreitet alles.', goldX: -0.15, types: ['fruit'],
    en: ['Gull plague', 'Gulls steal small change (−15% gold) but drop fruit. Kalle denies everything.'] },
  { id: 'abendrot',   icon: '🌅', name: 'Abendrot',         text: 'Ein schöner Abend. Rast heilt mehr, und keiner hat Lust auf Streit.', restAdd: 0.12, types: ['rest'], time: 'dusk',
    en: ['Red sky at night', 'A lovely evening. Resting heals more and nobody fancies a fight.'] },
  null, null, null
];
// Daten eines Meeres im Run (berücksichtigt die gewählte Route)
GL.data.seaOf = (run, idx) => { const S = GL.data.islands[idx]; return S && S.alt && run && run.alt && run.alt[idx] ? S.alt : S; };
// Ist die zweite Route dieses Meeres im Run offen? Meer 2 (Thriller Bark) = run.altOpen, Meer 1 (Fischmenscheninsel) = run.altOpen1.
// Alte Spielstände kennen altOpen1 nicht -> false, damit ihre Würfe gleich bleiben.
GL.data.altOpen = (run, idx) => { const S = GL.data.islands[idx]; if (!S || !S.alt || !run) return false; return S.alt.feature === 'route2' ? !!run.altOpen1 : !!run.altOpen; };

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
