// Englisch für Run, Kampf-Log, Tooltips, Orte und Wetter (ergänzt GL.data.en)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  // Start und Kurs
  'Kapitän wählen': 'Choose captain',
  'Mit ihm oder ihr beginnt deine Reise. Werte und Eigenschaft sind bei jedem Run neu ausgewürfelt.': 'Your journey starts with them. Stats and trait are rerolled every run.',
  'Dein Kapitän bleibt den ganzen Run. Jeder hat eine eigene Fähigkeit, tippe die Karte an und schau sie dir an.': 'Your captain stays for the whole run. Everyone has their own ability; tap a card to take a look.',
  'Wille des Kapitäns': 'Captain’s will',
  'Zu Kampfbeginn bekommt die ganze Crew +1 Angriff': 'At battle start the whole crew gets +1 attack',
  'Welche Insel steuerst du an?': 'Which island will you sail to?',
  'Kurs auf den Boss des Meeres': 'Course for the sea boss',
  'Jede Insel hat ihre eigenen Orte. Am Ende wartet ihr Bösewicht: Sieg bringt Kopfgeld, einen Schatz und eine Verschnaufpause.': 'Every island has its own places. Its villain waits at the end: a win brings bounty, a treasure and a breather.',
  'Auf der großen Insel wartet der Boss dieses Meeres. Wähle den Gegner, gegen den deine Crew die besseren Karten hat.': 'The sea boss waits on the big island. Pick the enemy your crew has the better odds against.',
  'Wähle die nächste Insel. Am Ende jeder Insel wartet ein Bösewicht.': 'Pick the next island. A villain waits at the end of every island.',
  'Kleine Insel → Bösewicht → Große Insel →': 'Small island → villain → big island →',
  'Ankunft auf': 'Arriving at',
  'Endstation: Bösewicht': 'Last stop: villain',
  'Endstation: Boss des Meeres': 'Last stop: sea boss',
  'Tot oder lebendig': 'Dead or alive',
  'schwach gegen': 'weak against',
  'Auf zur Grand Line': 'Off to the Grand Line',
  'Ein kleines Roguelike im Browser: Stell deine Piratencrew zusammen und kämpf dich durch drei Meere voller Inseln aus der Serie bis zum letzten Boss. Jeder Run ist anders, und mit jedem Run wirst du stärker.': 'A small roguelike in your browser: build your pirate crew and fight through three seas full of islands from the series to the final boss. Every run is different, and every run makes you stronger.',

  // Coach-Tipps
  'Deine Route: ⚔ Kampf bringt Gold, die Taverne neue Crew, die Truhe einen Schatz. Rast heilt.': 'Your route: ⚔ fights bring gold, the tavern new crew, the chest a treasure. Rest heals.',
  'Die Aufstellung macht sich selbst: Brecher vorne, Helfer hinten. Achte auf den Kampfstil: Kraft schlägt Technik, Klinge schlägt Kraft, Technik schlägt Klinge.': 'The lineup sets itself: Breakers in front, Helpers in the back. Mind the fighting style: Power beats Tech, Blade beats Power, Tech beats Blade.',
  'Kämpfe laufen von allein. Mit dem Tempo-Knopf unten spulst du vor.': 'Fights play out on their own. Use the speed button below to fast-forward.',
  'Gleiche Banden, Kampfstile und Rollen geben Boni (Leiste oben). „+ Bonus“ zeigt, wer einen freischaltet.': 'Same gangs, styles and roles give bonuses (bar at the top). “+ Bonus” shows who unlocks one.',
  'Jedes Level bringt 2 Statuspunkte. Klicke auf eine Figur oder auf „Punkte verteilen“, um sie auf Leben, Angriff oder Tempo zu setzen.': 'Every level brings 2 stat points. Click a crew member or “Spend points” to put them into HP, attack or speed.',
  ', Helfer hinten. Kraft schlägt Technik, Klinge schlägt Kraft, Technik schlägt Klinge.': ', Helpers in the back. Power beats Tech, Blade beats Power, Tech beats Blade.',
  ', Helfer hinten.': ', Helpers in the back.',
  'Aufstellung passiert automatisch: Brecher vorne, Helfer hinten.': 'Lineup is automatic: Breakers in front, Helpers in the back.',
  'Deine Crew. Vor jedem Kampf stellt sie sich automatisch auf: Brecher vorne, Helfer hinten.': 'Your crew. Before every fight it lines up automatically: Breakers in front, Helpers in the back.',

  // Kampf
  'Sieg! Die Gegner sind besiegt.': 'Victory! The enemies are defeated.',
  'Niederlage. Deine Crew ist gefallen.': 'Defeat. Your crew has fallen.',
  'Der Raid ist gescheitert. Deine Crew entkommt mit letzter Kraft.': 'The raid failed. Your crew escapes with its last strength.',
  'Letzter Wille: Die Crew gibt nicht auf! Ulti-Leisten laden, alle bekommen Mut.': 'Last will: the crew won’t give up! Ulti bars charge, everyone gains courage.',
  'Die Vivre Card bringt die ganze Crew zurück!': 'The Vivre Card brings the whole crew back!',
  'Betäubt!': 'Stunned!', 'Geschwächt!': 'Weakened!', 'Vergiftet!': 'Poisoned!', 'Blutet!': 'Bleeding!', 'Brennt!': 'Burning!', 'Furcht!': 'Fear!', 'Mut!': 'Courage!',
  'Geschwächt weg': 'Weakened gone', 'Gift weg': 'Poison gone', 'Furcht weg': 'Fear gone', 'Blutung weg': 'Bleeding gone', 'Brand weg': 'Burning gone', 'Betäubt weg': 'Stun gone',
  '+ Erschütterung': '+ Concussion', 'Erschütterung': 'Concussion', 'Tiefe Wunde': 'Deep wound', 'Schwachstelle': 'Weak spot', 'Zweiter Atem': 'Second wind',
  'Glück gehabt!': 'Lucky!', 'Glücksfunke': 'Lucky spark', 'Fläche': 'Area',
  'Die Schiffskanone': 'The ship cannon', 'Das Seestein-Netz': 'The seastone net', 'Die Vivre Card': 'The Vivre Card', 'Ein Helfer': 'A helper', 'Wunden, Gift und Feuer': 'Wounds, poison and fire', 'Der Spezialangriff': 'The special attack', 'Der Boss': 'The boss',
  'die ganze Crew': 'the whole crew', 'alle Gegner': 'all enemies', 'die Crew': 'the crew', 'die anderen Gegner': 'the other enemies',
  'Zustände': 'Status effects', 'Tempo ändern': 'Change speed',
  'Gift: Verliert am Rundenende Leben.': 'Poison: loses HP at the end of each round.',
  'Brand: Verliert am Rundenende Leben.': 'Burning: loses HP at the end of each round.',
  'Blutung: Verliert am Rundenende Leben.': 'Bleeding: loses HP at the end of each round.',
  'Betäubt: Setzt die nächste Aktion aus.': 'Stunned: skips the next action.',
  'Geschwächt: Nimmt 25 % mehr Schaden.': 'Weakened: takes 25 % more damage.',
  'Mut: Immun gegen Furcht und Betäubung.': 'Courage: immune to fear and stun.',
  'Kopfgeld-Serie': 'Bounty streak',
  'Fällt jemand, beginnt die Serie neu.': 'If someone falls, the streak starts over.',
  'Gold für die Taverne.': 'Gold for the tavern.',
  'Gibt es für Siege, verfällt am Run-Ende.': 'Earned by winning, expires at the end of the run.',
  'Kopfgeld deines Kapitäns.': 'Your captain’s bounty.',
  'Zählt für deinen Punktestand und die Rangliste \'Höchstes Kopfgeld\'. Bringt sonst nichts im Run.': 'Counts for your score and the “Highest bounty” leaderboard. Does nothing else in the run.',

  // Kampfwetter
  'Kampfwetter': 'Battle weather', 'Nebel': 'Fog', 'Rückenwind': 'Tailwind', 'Gegenwind': 'Headwind', 'Vollmond': 'Full moon', 'Hitzewelle': 'Heat wave', 'Schatzfieber': 'Treasure fever',
  'Alle verfehlen öfter.': 'Everyone misses more often.', 'Deine Crew ist schneller.': 'Your crew is faster.', 'Die Gegner sind schneller.': 'The enemies are faster.',
  'Ulti-Leisten laden schneller.': 'Ulti bars charge faster.', 'Mehr kritische Treffer für alle.': 'More critical hits for everyone.', 'Deine Crew trifft härter.': 'Your crew hits harder.',

  // Rollen und Stile (Tooltips)
  'Kraft: Kampfstil. Stark gegen Technik.': 'Power: fighting style. Strong against Tech.',
  'Klinge: Kampfstil. Stark gegen Kraft.': 'Blade: fighting style. Strong against Power.',
  'Technik: Kampfstil. Stark gegen Klinge.': 'Tech: fighting style. Strong against Blade.',
  'Kämpfer: Rolle. Macht den meisten Schaden.': 'Fighter: role. Deals the most damage.',
  'Brecher: Rolle. Steht vorne und steckt ein.': 'Breaker: role. Stands in front and takes hits.',
  'Helfer: Rolle. Heilt und unterstützt.': 'Helper: role. Heals and supports.',
  'Kämpfer (Schaden)': 'Fighter (damage)', 'Brecher (vorne)': 'Breaker (front)', 'Helfer (Heilung)': 'Helper (healing)',
  'Bildet ein Duo': 'Forms a duo', 'Noch nie besiegt': 'Never defeated', 'Hier warst du noch nie': 'You have never been here',
  'Synergien und Schätze': 'Synergies and treasures',

  // Knoten-Tooltips
  'Taverne: Neue Crewmitglieder mit Gold anheuern.': 'Tavern: hire new crew members with gold.',
  'Marine-Patrouille: Kampf gegen Soldaten und Piraten.': 'Marine patrol: fight against soldiers and pirates.',
  'Schatztruhe: Wähle 1 von 3 Schätzen. Sie wirken den ganzen Run.': 'Treasure chest: pick 1 of 3 treasures. They last the whole run.',
  'Teufelsfrucht: Wähle 1 von 3.': 'Devil fruit: pick 1 of 3.',
  'Rast an Land: Heilt alle um 40 %.': 'Rest on land: heals everyone by 40 %.',

  // Belohnungen und Meldungen
  '🍀 Glücksfund!': '🍀 Lucky find!',
  'Im Profil ausrüsten, alle sehen es in der Rangliste.': 'Equip it in your profile, everyone sees it on the leaderboard.',
  'Liegt in der Truhe. Figur antippen, „Ausrüstung“ wählen.': 'It’s in the chest. Tap a crew member and choose “Gear”.',
  'Liegt jetzt in der Schatzkammer im Hauptquartier.': 'It’s now in the vault at headquarters.',
  'Belohnung im Hauptquartier abholen.': 'Claim the reward at headquarters.',
  'Ab jetzt als Kapitän wählbar und rekrutierbar.': 'Now selectable as captain and recruitable.',
  'Berry für das Hauptquartier': 'Berry for headquarters',
  'Vertrautheit macht Figuren in Stammcrew, Duellen und Landgang stärker.': 'Bond makes characters stronger in the home crew, duels and shore leave.',
  'zum Verschenken': 'to give away',
  'wähle ein Training': 'pick a training', 'Für alle': 'For all', 'Für alle das empfohlene Training wählen': 'Pick the recommended training for everyone',
  'Level-ups automatisch mit dem empfohlenen Training verteilen': 'Spend level-ups automatically on the recommended training',
  'Erwachte Früchte sind stärker als jede normale.': 'Awakened fruits are stronger than any normal one.',
  'Hafengerücht': 'Harbor rumor', 'Als Nächstes freischalten': 'Unlock next',
  'Neuling auf See': 'Rookie at sea', 'Animation': 'Animation',

  // Kopfleiste und Menüs
  'Wiki öffnen': 'Open wiki', 'Wiki: Nachschlagen und Meta': 'Wiki: look things up and meta',
  'Geräusche aus': 'Sound off', 'Geräusche an': 'Sound on', 'Geräusche ausschalten': 'Turn sound off', 'Geräusche einschalten': 'Turn sound on',
  'Räume im Hauptquartier': 'Rooms at headquarters', 'z. B. Felix der Furchtlose': 'e.g. Felix the Fearless',

  // Schätze und Artefakte (fertige Texte)
  'Die ersten 1 gegnerischen Treffer in jedem Kampf werden abgewehrt.': 'The first enemy hit in every fight is blocked.',

  // Orte auf den Inseln
  'Marine-Basis 153': 'Marine Base 153', 'Hafen': 'Harbor', 'Marktgasse': 'Market Lane', 'Verlassene Straßen': 'Empty Streets', 'Tierladen': 'Pet Shop',
  'Kayas Anwesen': 'Kaya’s Mansion', 'Küstenhang': 'Coastal Slope', 'Dorfplatz': 'Village Square', 'Restaurant-Deck': 'Restaurant Deck', 'Offene See': 'Open Sea',
  'Küche': 'Kitchen', 'Hinrichtungsplatz': 'Execution Platform', 'Hafenviertel': 'Harbor District', 'Marktplatz': 'Marketplace', 'Kokos': 'Cocoyasi',
  'Festhalle': 'Party Hall', 'Kakteenhafen': 'Cactus Harbor', 'Willkommensfest': 'Welcome Party', 'Kerzenhaus': 'Candle House', 'Urwald': 'Jungle',
  'Riesenlager': 'Giants’ Camp', 'Schloss auf dem Gipfel': 'Castle on the Summit', 'Schneefeld': 'Snowfield', 'Küstenwald': 'Coastal Forest',
  'Tavernenviertel': 'Tavern Quarter', 'Sandora-Wüste': 'Sandora Desert', 'Weiße See': 'White Sea', 'Davy-Back-Arena': 'Davy Back Arena',
  'Grasebene': 'Grassland', 'Festplatz': 'Fairground', 'Galley-La-Werft': 'Galley-La Dock', 'Kanäle': 'Canals', 'Franky-Haus': 'Franky House',
  'Lokomotive': 'Locomotive', 'Letzter Waggon': 'Last Car', 'Mittelwagen': 'Middle Car', 'Hauptgebäude': 'Main Building', 'Haupttor': 'Main Gate',
  'Gerichtsstadt': 'Court Town', 'Turmspitze': 'Tower Top', 'Gerichtshof': 'Courthouse', 'Treppenhaus': 'Stairwell', 'Dach des Turms': 'Tower Roof',
  'Brücke': 'Bridge', 'Dachgarten': 'Roof Garden', 'Nebelwand': 'Wall of Fog', 'Nebelbank': 'Fog Bank', 'Geisterschiff': 'Ghost Ship',
  'Spukturm': 'Haunted Tower', 'Friedhof': 'Graveyard', 'Zombiewald': 'Zombie Forest', 'Operationssaal': 'Operating Room', 'Kellergang': 'Cellar Passage',
  'Kühlhaus': 'Freezer Room', 'Blasenpark': 'Bubble Park', 'Wurzelpfad': 'Root Path', 'Blasenufer': 'Bubble Shore', 'Thronsaal': 'Throne Room',
  'Schlosshof': 'Castle Courtyard', 'Tanzsaal': 'Ballroom', 'Auktionshaus': 'Auction House', 'Vergnügungspark': 'Amusement Park',

  // Nachträge
  'Erste Insel': 'First island', 'Zweite Insel': 'Second island', 'Dritte Insel': 'Third island',
  'Vertrautheit macht Figuren in Stammcrew, Duellen und Landgang stärker. ·': 'Bond makes characters stronger in the home crew, duels and shore leave. ·',
  'Ein kleines Roguelike im Browser: Stell deine Piratencrew zusammen und kämpf dich durch drei Meere voller Inseln aus der Serie bis zum letzten Boss. Jeder Run ist anders und dauert nur rund 20 Minuten.': 'A small roguelike in your browser: build your pirate crew and fight through three seas full of islands from the series to the final boss. Every run is different and takes only about 20 minutes.',
  'Zu Kampfbeginn bekommt die ganze Crew +{n} Angriff. Wird mit deinem Piratenrang stärker.': 'At battle start the whole crew gets +{n} attack. Grows stronger with your pirate rank.',
  'Zu Kampfbeginn bekommt die ganze Crew +{n} Angriff': 'At battle start the whole crew gets +{n} attack',
  'Konter': 'Counter', 'keiner dabei': 'none in crew',
  'Helfer reinigen am Rundenende (': 'Helpers cleanse at the end of the round (',
  'Helfer reinigen (': 'Helpers cleanse (',
  '), Brecher sind immun (': '), Breakers are immune (',
  '), Heilung über Runden hilft.': '), healing over time helps.',
  '), der Spezialangriff gibt Mut.': '), the special attack gives courage.',
  '), einen robusten Brecher in der Crew haben (steht automatisch vorne), der Spezialangriff gibt Mut.': '), have a sturdy Breaker in the crew (stands in front automatically), the special attack gives courage.',
  '), einen robusten Brecher in der Crew haben (steht automatisch vorne),': '), have a sturdy Breaker in the crew (stands in front automatically),',
  'Brook macht Mut': 'Brook gives courage', ', der Spezialangriff gibt Mut.': ', the special attack gives courage.', '),': '),',
  'Schätze wirken bis zum Ende des Runs. Tippe einen an, dann grün bestätigen.': 'Treasures last until the end of the run. Tap one, then confirm with green.',
  'Eine Teufelsfrucht stärkt deine Crew dauerhaft für diesen Run.': 'A devil fruit strengthens your crew for the rest of this run.',
  'Crew-Großangriff': 'Crew assault', 'Ab hier wird er wütend': 'From here he gets angry', 'Halbes Leben': 'Half HP', 'stärker und schneller': 'stronger and faster',
  'Deine Crew hat weniger als die Hälfte ihres Lebens. Eine Rast macht den nächsten Kampf viel sicherer.': 'Your crew has less than half its HP. A rest makes the next fight much safer.',
  'Dein laufender Run ist gespeichert und geht nach dem Neuladen genau hier weiter.': 'Your current run is saved and continues right here after reloading.',
  'Längste Kopfgeld-Serie: {a} Siege (+{b} Berry)': 'Longest bounty streak: {a} wins (+{b} Berry)',
  'Zu Kampfbeginn: Boss verliert {a} %, Begleiter {b} % Leben. Die Crew wird von allen Zuständen befreit und hat {c} Runden Mut.': 'At battle start: boss loses {a} %, companions {b} % HP. The crew is cleansed of all status effects and has {c} rounds of courage.',
  '{a}/{b} Funde bis Stufe {c}': '{a}/{b} finds to level {c}',
  'Kostenlos und ohne kommerzielle Absicht. Nicht verbunden mit Eiichiro Oda, Shueisha oder Toei Animation.': 'Free and non-commercial. Not affiliated with Eiichiro Oda, Shueisha or Toei Animation.',
  'Inoffizielles Fanprojekt.': 'Unofficial fan project.',
  'Ereignis auf See: Jede Wahl hat ihren Preis, der Hinweis sagt dir, was passiert.': 'Event at sea: every choice has its price; the hint tells you what happens.',
  // Aufträge (Vorlagen, {n} wird eingesetzt)
  'Verursache {n} Schaden': 'Deal {n} damage',
  'Schicke {n} Gegner k.o.': 'Knock out {n} enemies',
  'Lande {n} kritische Treffer': 'Land {n} critical hits',
  'Entfessle {n} Ultis': 'Unleash {n} Ultis',
  'Gewinne {n} Kämpfe': 'Win {n} fights',
  'Besiege {n} Bösewichte oder Kopfgeld-Ziele': 'Defeat {n} villains or bounty targets',
  'Besiege {n}× einen Inselboss': 'Defeat an island boss {n}×',
  'Segle {n} Etappen weit': 'Sail {n} stages',
  'Besiege {n} Gegner mit Kampfstil Kraft': 'Defeat {n} enemies with the Power style',
  'Besiege {n} Gegner mit Kampfstil Klinge': 'Defeat {n} enemies with the Blade style',
  'Besiege {n} Gegner mit Kampfstil Technik': 'Defeat {n} enemies with the Tech style',
  'Gewinne {n}× ein Stammcrew-Duell': 'Win a home crew duel {n}×',
  'Lande einen Treffer mit {n}+ Schaden': 'Land a hit with {n}+ damage',

  // Schätze, Früchte, Training (Vorlagen)
  '+{n} Leben für die ganze Crew': '+{n} HP for the whole crew',
  '+{n} Angriff für die ganze Crew': '+{n} attack for the whole crew',
  '+{n} Tempo für die ganze Crew': '+{n} speed for the whole crew',
  '+{n} Angriff für das erste Crewmitglied': '+{n} attack for the first crew member',
  '+{n} Leben für das erste Crewmitglied': '+{n} HP for the first crew member',
  '+{n} Erfahrung für alle': '+{n} experience for everyone',
  'Crew verliert {n} % Leben': 'Crew loses {n} % HP',
  '+{n} % Schaden gegen Bosse.': '+{n} % damage against bosses.',
  '+{n} % Chance auf doppelten Schaden': '+{n} % chance for double damage',
  'Ganze Crew startet mit +{n} Leben.': 'Whole crew starts with +{n} HP.',
  'Brecher erleiden {n} weniger Schaden.': 'Breakers take {n} less damage.',
  'Bosse beginnen den Kampf mit {n} % weniger Leben.': 'Bosses start the fight with {n} % less HP.',
  'Sehr effektive Treffer machen {n} % mehr Schaden.': 'Super effective hits deal {n} % more damage.',
  'Nach jedem Sieg heilt die Crew zusätzlich {n} %.': 'After every win the crew heals an extra {n} %.',
  'Zu Kampfbeginn erleiden alle Gegner {n} Schaden.': 'At battle start all enemies take {n} damage.',
  'Kraft-Figuren +{a} Angriff, zusätzlich +{b} pro gesammeltem Kopfgeld.': 'Power members +{a} attack, plus +{b} per bounty collected.',
  'Heilung durch Helfer, Chopper und Vivi +{n} %.': 'Healing from Helpers, Chopper and Vivi +{n} %.',
  'Die ersten {n} gegnerischen Treffer in jedem Kampf werden abgewehrt.': 'The first {n} enemy hits in every fight are blocked.',
  'Fällt die ganze Crew, steht sie einmal pro Run mit {n} % Leben wieder auf.': 'If the whole crew falls, it gets back up once per run with {n} % HP.',
  'Ganze Crew +{n} Angriff. Dafür keine normale Heilung nach Siegen, Heil-Schätze wirken weiter.': 'Whole crew +{n} attack. In exchange no normal healing after wins; healing treasures still work.',
  'Ganze Crew +{a} Tempo und +{b} Angriff.': 'Whole crew +{a} speed and +{b} attack.',
  'Klinge-Figuren +{n} Angriff.': 'Blade members +{n} attack.',
  'Kraft-Figuren +{n} Angriff.': 'Power members +{n} attack.',
  'Technik-Figuren +{n} Angriff.': 'Tech members +{n} attack.',
  'Kämpfer +{n} % Krit-Chance.': 'Fighters +{n} % crit chance.',
  'Brecher +{n} Leben.': 'Breakers +{n} HP.',
  'Helfer +{n} Leben.': 'Helpers +{n} HP.',
  'Belohnung: {n} Berry und Proviantfass': 'Reward: {n} Berry and a supply barrel',
  'Noch {n} Entdeckungen bis {m} Berry': '{n} more discoveries to {m} Berry',
  'Noch {n} Entdeckung bis {m} Berry': '{n} more discovery to {m} Berry',
  'Meer {n} von {m}': 'Sea {n} of {m}',
  'Spezialangriff: {n} von {m} geladen. Siege laden auf, Kopfgeldjäger doppelt.': 'Special attack: {n} of {m} charged. Wins charge it, bounty hunters double.',
  'Kopfgeld-Serie: {n} Siege in Folge ohne K.O.': 'Bounty streak: {n} wins in a row without a K.O.',
  'Ab {a} Siegen +{b} Gold pro Sieg, ab {c} +{d}. Am Run-Ende Extra-Berry.': 'From {a} wins +{b} gold per win, from {c} +{d}. Extra Berry at the end of the run.',
  'Eine Goldtruhe: +{n} Gold und seltene Ausrüstung.': 'A golden chest: +{n} gold and rare gear.',
  'Eine Goldtruhe: +{n} Gold.': 'A golden chest: +{n} gold.',
  'Schaffe {n} Runden in einer Endlos-Fahrt.': 'Survive {n} rounds in an endless voyage.',
  'Besiege insgesamt {n} Gegner.': 'Defeat {n} enemies in total.',
  'Schaden gegen den Vordersten ×{n}': 'Damage against the front enemy ×{n}',
  'Lv {n} · wähle ein Training': 'Lv {n} · pick a training'
});
// Daumen-Karten (Routen-Dock, Training)
GL.data.en = Object.assign(GL.data.en || {}, {
  'Nächster Halt': 'Next stop',
  'Kampf, bringt Gold': 'Battle, earns gold',
  'Starker Gegner, dafür ein Schatz': 'Tough foe, but a treasure',
  'Neue Crew anheuern': 'Hire new crew',
  'Teufelsfrucht aussuchen': 'Choose a devil fruit',
  'Schatz für den ganzen Run': 'Treasure for the whole run',
  'Alle heilen 40 %': 'Heal everyone 40 %',
  'Kopfgeld und Erwachen': 'Bounty and awakening',
  'Extrem stark, epische Frucht': 'Extremely strong, epic fruit',
  'Raid': 'Raid', 'Kopfgeld-Ziel': 'Bounty target', 'Bösewicht der Insel': 'Island villain',
  'Kampftraining': 'Combat drill', 'Ausdauer': 'Stamina', 'Sprinttraining': 'Sprint drill', 'Ausgewogen': 'Balanced',
  // Neue Items zur großen Neuauflage
  'Fleischkeule am Knochen': 'Meat on the Bone', 'Rumble-Ball-Dose': 'Rumble Ball Tin', 'Strohsandalen': 'Straw Sandals', 'Kochschürze': 'Chef\'s Apron',
  'Mandarinen-Kiste': 'Tangerine Crate', 'Sunny-Löwenkopf': 'Sunny Lion Head',
  'Kochmesser': 'Chef\'s Knife', 'Perlenkette': 'Pearl Necklace',
  'Ganze Crew heilt sich am Ende jeder Runde um {n}.': 'The whole crew heals {n} at the end of every round.',
  'Ganze Crew heilt sich am Ende jeder Runde um 1.': 'The whole crew heals 1 at the end of every round.', 'Ganze Crew heilt sich am Ende jeder Runde um 2.': 'The whole crew heals 2 at the end of every round.',
  'Zu Kampfbeginn erleiden alle Gegner {a} Schaden, ganze Crew +{b} Tempo.': 'At battle start all enemies take {a} damage, whole crew +{b} speed.'
});
// Schatz-Karten (Fork I)
Object.assign(GL.data.en, { 'Antippen': 'Tap', '✓ Gewählt': '✓ Chosen' });
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^(Gewöhnlich|Selten|Episch|Legendär|Erwacht|Einzigartig) · (Schatz|Teufelsfrucht)$/, (m, r, k) => ({ 'Gewöhnlich': 'Common', 'Selten': 'Rare', 'Episch': 'Epic', 'Legendär': 'Legendary', 'Erwacht': 'Awakened', 'Einzigartig': 'Unique' }[r] + ' · ' + (k === 'Schatz' ? 'Treasure' : 'Devil fruit'))]
]);
// Fork S: Inselwahl-Postkarten
Object.assign(GL.data.en, {
  'gemütlich': 'cozy', 'ordentlich': 'lively', 'ungemütlich': 'rough',
  'Gemütlicher Einstieg': 'Cozy start', 'Ordentlich was los': 'Quite a bit going on', 'Wird ungemütlich': 'Getting rough'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([[/^Insel-Twist dieser Etappe: ([\s\S]+)$/, 'Island twist for this leg: $1']]);
// Fork Y: Kampf-Vorbereitung
Object.assign(GL.data.en, {
  'Typen': 'Types', 'Fähigkeit': 'Ability', 'Spezialangriff': 'Special attack', '✦ Einsetzen': '✦ Use', '✓ Aktiv': '✓ Active', 'lädt': 'charging',
  'Boss': 'Boss', 'Raid': 'Raid', 'Kopfgeld-Ziel': 'Bounty target', 'Bösewicht der Insel': 'Island villain',
  '2 Wellen': '2 waves', 'Erwachte Frucht': 'Awakened fruit', 'Heilung': 'Healing', 'Begegnung auf See': 'Encounter at sea',
  'Helfer reinigen am Rundenende von Zuständen.': 'Helpers cleanse status effects at the end of each round.',
  'Brecher sind immun gegen Angst.': 'Breakers are immune to fear.',
  'Ein robuster Brecher steht automatisch vorne und fängt die Betäubung ab.': 'A sturdy breaker automatically stands in front and takes the stun.',
  'Heilung über mehrere Runden hilft gegen diesen Zustand.': 'Healing over several rounds helps against this status.',
  'Brook macht Mut.': 'Brook boosts courage.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Helfer (\d+)$/, 'Helpers $1'], [/^Brecher (\d+)$/, 'Breakers $1'], [/^(.+)s Crew$/, '$1’s crew']
]);
Object.assign(GL.data.en, {
  '▲ Stark für dich': '▲ Great for you', '◦ Passt': '◦ Fits', '▽ Gerade nicht': '▽ Not right now',
  'Stark für dich': 'Great for you', 'Passt': 'Fits', 'Gerade nicht': 'Not right now',
  'Kein Heiler an Bord, wirkt erst später': 'No healer aboard, pays off later', 'Versicherung für später': 'Insurance for later',
  'Hilft gegen Bösewichte und Bosse': 'Helps against villains and bosses', 'Platz für eine Figur mehr': 'Room for one more crew member',
  'Deine Crew ist voll: Platz für eine Figur mehr': 'Your crew is full: room for one more',
  'Brennen: Das Ziel verliert ein paar Runden lang am Rundenende Leben. Mehrere Brände stapeln sich.': 'Burn: the target loses HP at the end of each round for a few rounds. Burns stack.',
  'Einfrieren: Das Ziel setzt eine Runde aus. Bei Bossen seltener.': 'Freeze: the target skips a round. Less often on bosses.',
  'Austrocknen: Das Ziel nimmt eine Weile mehr Schaden.': 'Dry out: the target takes more damage for a while.',
  'Rückprall: Wer dich trifft, bekommt einen Teil des Schadens zurück.': 'Rebound: whoever hits you gets part of the damage back.',
  'Wut: Mit wenig Leben teilt die Figur deutlich mehr aus.': 'Rage: on low HP the crew member hits much harder.',
  'Wiederaufstehen: Fällt die Figur, kommt sie einmal pro Kampf zurück.': 'Rise again: if they fall, they come back once per fight.',
  'Ausweichen: Angriffe gehen ab und zu komplett daneben.': 'Dodge: attacks sometimes miss completely.',
  'Krit: Treffer machen dann deutlich mehr Schaden.': 'Crit: hits then deal much more damage.',
  'Sehr effektiv: Kraft schlägt Technik, Technik schlägt Klinge, Klinge schlägt Kraft.': 'Super effective: Power beats Technique, Technique beats Blade, Blade beats Power.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Noch keine (.+)-Figur an Bord, wirkt erst später$/, (m, a) => 'No ' + ({ Kraft: 'Power', Klinge: 'Blade', Technik: 'Technique', 'Kämpfer': 'Fighter', Helfer: 'Helper', Brecher: 'Breaker' }[a] || a) + ' crew member aboard yet, pays off later'],
  [/^(\d+) gefallen: hilft sofort$/, '$1 fallen: helps right away'],
  [/^(\d+) von (\d+)$/, '$1 of $2'],
  [/^Wirkt bei$/, 'Works on'], [/^Stärkt deine Heiler$/, 'Boosts your healers'], [/^Wirkt bei der ganzen Crew$/, 'Works on the whole crew'], [/^Ganze Crew$/, 'Whole crew']
]);
Object.assign(GL.data.en, { 'Spezial': 'Special', 'Aktiv': 'Active' });
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^(.+)\n(Boss −\d+ % Leben, Begleiter −\d+ %, Crew 2 Runden mutig\.)(\nLädt: (\d+)\/(\d+) \(Siege laden auf\))?$/, (m, n, e, l, a, b) => n + '\n' + e.replace('Leben', 'HP').replace('Begleiter', 'escorts').replace('Crew 2 Runden mutig.', 'crew brave for 2 rounds.') + (l ? `\nCharging: ${a}/${b} (wins charge it)` : '')]
]);

// UX1: Aufgeräumt (Run-Ende, Chips, Hinweise)
Object.assign(GL.data.en, {
  'Daran bist du gescheitert': 'What sank you',
  'Nächstes Mal:': 'Next time:',
  'zwei gleiche Kampfstile sammeln, dann zündet ein Stil-Bonus': 'collect two of the same fighting style and a style bonus kicks in',
  '▾ Zeigen': '▾ Show',
  '▴ Einklappen': '▴ Fold',
  'Bösewicht:': 'Villain:',
  'Boss:': 'Boss:',
  'Profil-Belohnungen in diesem Run': 'profile rewards this run',
  'Liegt in der Truhe. Auspacken im Hafen.': 'It’s in the chest. Unpack it in the harbor.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Beinahe: (.+) hatte nur noch (\d+) % Leben\.$/, 'So close: $1 had only $2 % health left.'],
  [/^(.+) stand am Ende noch mit (\d+) % Leben da\.$/, '$1 was still standing with $2 % health.'],
  [/^Endstation: (.+)\.$/, 'Last stop: $1.'],
  [/^Der Heiler hat (.+) (\d+)× geflickt\. Nächstes Mal: Heiler zuerst\.$/, 'The healer patched up $1 $2×. Next time: healer first.'],
  [/^(\d+) schwere Schläge eingesteckt\. Ausweichen und Rüstung helfen doppelt\.$/, 'Took $1 heavy blows. Dodge and armor count double.'],
  [/^(.+) hat Verstärkung gepfiffen\. Mehr Schaden, bevor er wütend wird\.$/, '$1 whistled for backup. More damage before he gets angry.'],
  [/^noch (\d+) (.+)-(?:Figur|Figuren) für (.+)$/, (m, n, r, b) => { const T = t => (GL.i18n && GL.i18n.t ? GL.i18n.t(t) : t); const bb = b.replace(/^(.+?)( ★+)?$/, (x, nm, st) => T(nm) + (st || '')); return `${n} more ${T(r)} ${+n === 1 ? 'member' : 'members'} for ${bb}`; }],
  [/^noch (\d+) Rang-EP bis (.+)$/, '$1 more rank XP until $2'],
  [/^(.+) hat dir etwas geschickt$/, '$1 sent you something'],
  [/^(\d+) Flaschen angespült$/, '$1 bottles washed ashore']
]);
// Fork SQD: Duell-Taktik und Zusammenhalt-Eigenschaften
Object.assign(GL.data.en, {
  'Taktik': 'Tactic', 'Sturm': 'Storm', 'Mauer': 'Wall', 'List': 'Cunning', '▲ kontert': '▲ counters', '▽ gekontert': '▽ countered',
  'Gegner: ausgewogen': 'Foe: balanced',
  'Mehr Angriff, dünnere Haut. Überrennt Listige, bevor sie ausweichen.': 'More attack, thinner skin. Runs over the cunning before they can dodge.',
  'Mehr Leben, Brecher ganz besonders. Stürmer laufen sich daran die Nase platt.': 'More health, breakers most of all. Stormers flatten their noses on it.',
  'Ausweichen und Krit, dafür weniger Leben. Mauern sind langsam, Listige nicht.': 'Dodge and crit, less health. Walls are slow, the cunning are not.',
  'Ausgewogen: ein bisschen von allem, nichts davon auffällig. Tippen zum Wählen.': 'Balanced: a bit of everything, none of it remarkable. Tap to choose.',
  'Ab Vertraut 6:': 'From bond 6:'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^(.{1,12}): (⚔|🛡|🎭) (Sturm|Mauer|List)$/, (m, n, i, t) => `${n}: ${i} ${({ Sturm: 'Storm', Mauer: 'Wall', List: 'Cunning' })[t]}`],
  [/^(Dickes Fell|Eingespielt|Erste Hilfe)( I{1,3})?$/, (m, t, r) => ({ 'Dickes Fell': 'Thick skin', 'Eingespielt': 'In sync', 'Erste Hilfe': 'First aid' })[t] + (r || '')],
  [/^(Dickes Fell|Eingespielt|Erste Hilfe)\.$/, (m, t) => ({ 'Dickes Fell': 'Thick skin', 'Eingespielt': 'In sync', 'Erste Hilfe': 'First aid' })[t] + '.'],
  [/^\+(\d+) Rüstung im Duell\. Hat schon Schlimmeres eingesteckt, meistens von Freunden\.$/, '+$1 armor in duels. Has taken worse, mostly from friends.'],
  [/^\+(\d+) % Krit im Duell\. Weiß, wann die anderen zuschlagen, und schlägt einfach mit\.$/, '+$1 % crit in duels. Knows when the others strike and simply joins in.'],
  [/^Flickt im Duell (\d+) Leben pro Runde\. Pflaster aus der eigenen Tasche, Rechnung folgt nie\.$/, 'Patches $1 health per round in duels. Plasters from their own pocket, the bill never comes.'],
  [/^Ab Vertraut (\d+): Stufe (I{1,3})\.$/, 'From bond $1: tier $2.']
]);
