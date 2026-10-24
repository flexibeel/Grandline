// Englisch: Remix zum großen Neustart (neue Inseln, Gegner, Verhalten, Insel-Twists)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  // Inseln
  'Gecko-Klippen': 'Gecko Cliffs', 'Mondscheinklippe': 'Moonlight Cliff', 'Pendelpfad': 'Pendulum Path', 'Leuchtfeuer': 'Beacon Fire',
  'Steile Klippen über dem Meer. Ein Hypnotiseur lässt hier ganze Dörfer schlafen.': 'Steep cliffs above the sea. A hypnotist puts whole villages to sleep here.',
  'Eisenbucht': 'Iron Bay', 'Rostiges Wrack': 'Rusty Wreck', 'Wrackfeld': 'Wreck Field', 'Ankerfriedhof': 'Anchor Graveyard',
  'Eine Bucht voller Schiffswracks. Ein ausgehungerter Kampfmeister lauert im Rost.': 'A bay full of shipwrecks. A starving combat commander lurks in the rust.',
  'Zwillingskap': 'Twin Cape', 'Leuchtturm am Kap': 'Cape Lighthouse', 'Walbauch': 'Whale Belly', 'Rückwärtsberg': 'Reverse Mountain',
  'Ein Riesenwal rammt seit fünfzig Jahren den Red Line. Am Leuchtturm lauert ein Agent mit Bombenhund.': 'A giant whale has rammed the Red Line for fifty years. At the lighthouse an agent with a bomb dog lies in wait.',
  // Gegner
  'Seekuh Momoo': 'Momoo the Sea Cow', 'Kampfaffe': 'Battle Ape', 'Dämon Gin': 'Gin the Demon', 'Eisenwand Pearl': 'Iron Wall Pearl', 'Mr. 4 & Lassoo': 'Mr. 4 & Lassoo',
  'Leibwache': 'Bodyguard', 'Fängt Treffer ab': 'Draws hits', 'Raufbold': 'Brawler', 'Jagt Starke': 'Hunts the strong', 'Rudelführer': 'Pack Leader', 'Wird wütend': 'Gets angry',
  'Solange er steht, muss deine Crew ihn zuerst schlagen. Scharfschützen zielen trotzdem frei.': 'While he stands, your crew has to hit him first. Snipers still aim freely.',
  'Greift immer dein Crewmitglied mit dem meisten Angriff an.': 'Always attacks your crew member with the most attack.',
  'Für jeden gefallenen Verbündeten bekommt er mehr Angriff. Zuerst oder zuletzt besiegen?': 'Gains attack for every fallen ally. Beat him first or last?',
  // Fähigkeiten
  'Eins, zwei… Jango!': 'One, two… Jango!', 'Hypnose: alle 4 Runden schläft dein vorderstes Crewmitglied ein (setzt 1 Aktion aus).': 'Hypnosis: every 4 rounds your front crew member falls asleep (skips 1 action).',
  'Tonfa-Dämon': 'Tonfa Demon', 'Geht immer auf dein stärkstes Crewmitglied los. Treffer schwächen (30 %: +25 % Schaden, 2 Runden).': 'Always goes for your strongest crew member. Hits weaken (30 %: +25 % damage taken, 2 rounds).',
  'Eisenwand': 'Iron Wall', 'Seine Schilde fangen alles ab: deine Crew muss ihn zuerst schlagen. Erleidet 25 % weniger Schaden.': 'His shields catch everything: your crew has to hit him first. Takes 25 % less damage.',
  'Lassoos Kanonade': 'Lassoo’s Barrage', 'Sein Hund schießt Bomben: Treffer explodieren (35 % Schaden an alle anderen).': 'His dog shoots bombs: hits explode (35 % damage to everyone else).',
  'Ramen-Kenpo': 'Ramen Kenpo', 'Nudeln aus der Nase: Treffer springen auf das nächste Ziel über (40 % Schaden).': 'Noodles from his nose: hits jump to the next target (40 % damage).',
  // Insel-Twists
  'Insel-Twist': 'Island twist', 'Markttag': 'Market Day', 'Mehr Tavernen auf der Karte. Heute ist viel los im Hafen.': 'More taverns on the map. The harbor is busy today.',
  'Steckbrief-Woche': 'Wanted Week', 'Mehr Kopfgeldjäger unterwegs: starke Gegner, dafür mehr Schätze.': 'More bounty hunters around: strong foes, but more treasure.',
  'Schatzinsel': 'Treasure Island', 'Mehr Schatztruhen und Teufelsfrüchte auf der Karte.': 'More treasure chests and devil fruits on the map.',
  'Kronwacht-Razzia': 'Crown Guard Raid', 'Mehr besondere Gegner: Leibwachen, Sanitäter, Raufbolde.': 'More special foes: bodyguards, medics, brawlers.',
  'Stille Bucht': 'Quiet Bay', 'Mehr Rastplätze, alle Gegner sind 1 Tempo langsamer.': 'More resting spots, all foes have 1 less speed.',
  'Sturmflut': 'Storm Surge', 'Alle Gegner sind 1 Tempo schneller, dafür treiben mehr Früchte an.': 'All foes have 1 more speed, but more fruits wash ashore.'
});
// Kampf-Notiz: „X wird wütend: +N Angriff.“
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Insel-Twist: (.+)$/, (m, a) => `Island twist: ${(GL.data.en && GL.data.en[a]) || a}`],
  [/^(.+) wird wütend: \+(\d+) Angriff\.$/, (m, a, n) => `${(GL.data.en && GL.data.en[a]) || a} gets angry: +${n} attack.`]
]);
