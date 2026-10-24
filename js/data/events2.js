// Zwischen-Events mit der Crew: kurze Mini-Szene (2–3 Zeilen), dann eine Entscheidung.
// Pro Insel-Kapitel kommt eins sicher vor dem Bösewicht, dazu gelegentlich zwischendurch.
//   bg     = Bühne (wie bei der Story): hafen, nacht, schiff, insel, kueche
//   lines  = [Sprecher, Deutsch, Englisch]   Sprecher: 'A' (Kapitän), 'B' (jemand aus der Crew), 'kalle' (Zeitungsmöwe)
//            {A} / {B} im Text = Name der Figur
//   choices: wie bei events.js, zusätzlich { buffAll: { stat: 'atk'|'hp'|'spd', value } } und { crit: 0.05 }
//   Texte als [Deutsch, Englisch]
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.crewEvents = [
  { id: 'ce-frucht', bg: 'insel', icon: 'fruit', title: ['Eine Frucht am Strand', 'A fruit on the beach'],
    lines: [
      ['B', 'Da liegt eine Frucht mit Spiralen. Einfach so. Am Strand.', 'There is a fruit with swirls. Just lying there. On the beach.'],
      ['A', 'Das ist entweder eine Teufelsfrucht oder sehr schlechtes Obst.', 'That is either a devil fruit or very bad produce.']
    ],
    choices: [
      { label: ['Mitnehmen', 'Take it'], hint: ['-12 Gold Finderlohn-Steuer, Teufelsfrucht wählen', '-12 gold finder’s tax, pick a devil fruit'], outcome: { gold: -12, pick: 'fruit' }, text: ['Ihr packt sie vorsichtig ein. Niemand beißt rein. Noch nicht.', 'You pack it carefully. Nobody bites. Not yet.'] },
      { label: ['Verkaufen', 'Sell it'], hint: ['+12 Gold', '+12 gold'], outcome: { gold: 12 }, text: ['Ein Händler zahlt erstaunlich gut für erstaunlich schlechtes Obst.', 'A merchant pays surprisingly well for surprisingly bad fruit.'] }
    ] },
  { id: 'ce-lazarett', bg: 'hafen', icon: 'rest', title: ['Feldlazarett', 'Field hospital'],
    lines: [
      ['B', 'Am Kai steht ein Zelt mit rotem Kreuz. Und eine Schlange. Eine lange Schlange.', 'There is a tent with a red cross at the pier. And a queue. A long queue.'],
      ['A', 'Wer bei uns liegt, steht wieder auf. Notfalls mit Verband bis zur Nase.', 'Whoever is down gets back up. With bandages up to the nose if need be.']
    ],
    choices: [
      { label: ['Anstellen', 'Join the queue'], hint: ['-10 Gold, Gefallene mit 50 % zurück', '-10 gold, fallen back with 50%'], outcome: { gold: -10, revive: 0.5 }, text: ['Der Arzt fragt nicht, wie das passiert ist. Er hat das Schiff gesehen.', 'The doctor does not ask how it happened. He has seen the ship.'] },
      { label: ['Selbst verarzten', 'Patch up yourselves'], hint: ['Gefallene mit 20 % zurück, Crew heilt 10 %', 'Fallen back with 20%, crew heals 10%'], outcome: { revive: 0.2, heal: 0.1 }, text: ['Viel Pflaster, wenig Ahnung. Erstaunlich wirksam.', 'Lots of plasters, little clue. Surprisingly effective.'] }
    ] },
  { id: 'ce-koch', bg: 'kueche', icon: 'rest', title: ['Kochwettstreit', 'Cook-off'],
    lines: [
      ['B', 'Ich koche heute. Ich habe ein Rezept. Es hat nur drei Flecken.', 'I am cooking today. I have a recipe. It only has three stains.'],
      ['A', 'Was ist das Schlimmste, was passieren kann?', 'What is the worst that could happen?']
    ],
    choices: [
      { label: ['Probieren', 'Taste it'], hint: ['50 %: alle +4 Leben, sonst -12 % Leben · 😊 froh', '50%: all +4 HP, else -12% HP · 😊 happy'], outcome: { chance: 0.5, win: { buffAll: { stat: 'hp', value: 4 } }, lose: { hurt: 0.12 } }, herz: { b: 'froh' }, text: ['Das Essen ist vorbei. Die Erinnerung bleibt, und jemand grinst noch stundenlang.', 'The meal is over. The memory remains, and someone keeps grinning for hours.'] },
      { label: ['Höflich ablehnen', 'Politely decline'], hint: ['Crew heilt 15 %', 'Crew heals 15%'], outcome: { heal: 0.15 }, text: ['Ihr esst Zwieback. Sicher ist sicher.', 'You eat hardtack. Better safe than sorry.'] }
    ] },
  { id: 'ce-marine', bg: 'schiff', icon: 'elite', title: ['Marine-Kontrolle', 'Marine checkpoint'],
    lines: [
      ['kalle', 'KRAA! Marine-Kontrolle voraus! Bitte Flaggen und Ausreden bereithalten!', 'KRAA! Marine checkpoint ahead! Please have flags and excuses ready!'],
      ['A', 'Wir sind ein ganz normales Fischerboot. Mit Totenkopf.', 'We are a completely normal fishing boat. With a skull.']
    ],
    choices: [
      { label: ['Durchbrechen', 'Break through'], hint: ['-12 % Leben, +14 Erfahrung', '-12% HP, +14 XP'], outcome: { hurt: 0.12, xp: 14 }, text: ['Die Marine schreibt einen sehr langen Bericht über euch.', 'The Marines write a very long report about you.'] },
      { label: ['Bestechen', 'Bribe'], hint: ['-8 Gold, nichts passiert', '-8 gold, nothing happens'], outcome: { gold: -8 }, text: ['Der Soldat zählt nach, nickt und hat euch nie gesehen.', 'The soldier counts twice, nods and never saw you.'] },
      { label: ['Verstecken', 'Hide'], hint: ['50 %: +20 Berry, sonst -15 % Leben', '50%: +20 Berry, else -15% HP'], outcome: { chance: 0.5, win: { berry: 20 }, lose: { hurt: 0.15 } }, text: ['Das Fass war kleiner als gedacht.', 'The barrel was smaller than expected.'] }
    ] },
  { id: 'ce-nebel', bg: 'nacht', icon: 'map', title: ['Dichter Nebel', 'Thick fog'],
    lines: [
      ['B', 'Ich sehe nichts. Ich sehe wirklich gar nichts.', 'I see nothing. I really see nothing at all.'],
      ['A', 'Dann segeln wir nach Gefühl. Mein Gefühl sagt: Essen ist links.', 'Then we sail by feel. My feeling says: food is to the left.']
    ],
    choices: [
      { label: ['Nach Gefühl', 'By feel'], hint: ['50 %: alle +1 Tempo, sonst -10 % Leben', '50%: all +1 speed, else -10% HP'], outcome: { chance: 0.5, win: { buffAll: { stat: 'spd', value: 1 } }, lose: { hurt: 0.1 } }, text: ['Links war tatsächlich schneller. Essen gab es keins.', 'Left was actually faster. There was no food.'] },
      { label: ['Anker werfen', 'Drop anchor'], hint: ['Crew heilt 20 %', 'Crew heals 20%'], outcome: { heal: 0.2 }, text: ['Ihr wartet. Jemand erzählt Gruselgeschichten. Alle schlafen trotzdem gut.', 'You wait. Someone tells ghost stories. Everyone still sleeps well.'] }
    ] },
  { id: 'ce-rivale', bg: 'hafen', icon: 'battle', title: ['Ein Rivale', 'A rival'],
    lines: [
      ['B', 'Der Typ da drüben behauptet, er sei stärker als wir.', 'That guy over there claims he is stronger than us.'],
      ['A', 'Hat er Fleisch dabei? Dann reden wir.', 'Does he have meat on him? Then we talk.']
    ],
    choices: [
      { label: ['Kräftemessen', 'Arm wrestle'], hint: ['45 %: alle +1 Angriff, sonst -15 % Leben · 😊 froh', '45%: all +1 attack, else -15% HP · 😊 happy'], outcome: { chance: 0.45, win: { buffAll: { stat: 'atk', value: 1 } }, lose: { hurt: 0.15 } }, herz: { b: 'froh' }, text: ['Der Tisch hat es nicht überlebt. Jemand schon, und grinst immer noch.', 'The table did not survive. Someone did, and is still grinning.'] },
      { label: ['Wettessen', 'Eating contest'], hint: ['+16 Erfahrung', '+16 XP'], outcome: { xp: 16 }, text: ['Niemand hat gewonnen. Alle haben verloren. Besonders der Wirt.', 'Nobody won. Everybody lost. Especially the innkeeper.'] }
    ] },
  { id: 'ce-karte', bg: 'schiff', icon: 'chest', title: ['Eine halbe Schatzkarte', 'Half a treasure map'],
    lines: [
      ['B', 'Eine Schatzkarte! Die Hälfte fehlt. Die wichtige Hälfte.', 'A treasure map! Half is missing. The important half.'],
      ['A', 'Dann graben wir eben überall. Wie schwer kann das sein?', 'Then we just dig everywhere. How hard can it be?']
    ],
    choices: [
      { label: ['Überall graben', 'Dig everywhere'], hint: ['35 %: seltener Schatz, sonst -15 % Leben', '35%: rare treasure, else -15% HP'], outcome: { chance: 0.35, win: { relic: 1 }, lose: { hurt: 0.15 } }, text: ['Ihr habt viel Sand bewegt. Sehr viel Sand.', 'You moved a lot of sand. A lot.'] },
      { label: ['Karte verkaufen', 'Sell the map'], hint: ['+25 Berry', '+25 Berry'], outcome: { berry: 25 }, text: ['Ein anderer Narr kauft sie. Gute Reise, anderer Narr.', 'Another fool buys it. Safe travels, other fool.'] }
    ] },
  { id: 'ce-training', bg: 'insel', icon: 'battle', title: ['Morgentraining', 'Morning drill'],
    lines: [
      ['B', 'Tausend Liegestütze vor dem Frühstück. Wer macht mit?', 'A thousand push-ups before breakfast. Who is in?'],
      ['A', 'Gibt es danach Frühstück? Dann zwei.', 'Is there breakfast after? Then two.']
    ],
    choices: [
      { label: ['Mittrainieren', 'Join in'], hint: ['Kapitän +1 Statuspunkt, -10 % Leben · 😮‍💨 erschöpft', 'Captain +1 stat point, -10% HP · 😮‍💨 tired'], outcome: { points: 1, hurt: 0.1 }, herz: { b: 'muede' }, text: ['Muskelkater: vorhanden. Moral: erstaunlich gut. Jemand kann danach kaum noch die Arme heben.', 'Sore muscles: present. Morale: surprisingly good. Someone can barely lift their arms afterwards.'] },
      { label: ['Zuschauen', 'Watch'], hint: ['+10 Erfahrung', '+10 XP'], outcome: { xp: 10 }, text: ['Zuschauen ist auch eine Art Training. Sagt die Wissenschaft. Vielleicht.', 'Watching is also a kind of training. Science says so. Probably.'] }
    ] },
  { id: 'ce-haendler', bg: 'hafen', icon: 'recruit', title: ['Ein Händler mit Haken', 'A merchant with a catch'],
    lines: [
      ['B', 'Der Händler sagt, alles ist heute halb so teuer.', 'The merchant says everything is half price today.'],
      ['A', 'Und der Haken?', 'And the catch?'],
      ['B', 'Er hat einen Haken. Also, an der Hand.', 'He has a hook. On his hand, I mean.']
    ],
    choices: [
      { label: ['Kaufen', 'Buy'], hint: ['-20 Gold, Schatz wählen', '-20 gold, pick a treasure'], outcome: { gold: -20, pick: 'treasure' }, text: ['Ihr kauft. Er zwinkert. Das war vermutlich ein gutes Zeichen.', 'You buy. He winks. That was probably a good sign.'] },
      { label: ['Weitergehen', 'Walk on'], hint: ['Nichts passiert', 'Nothing happens'], outcome: {}, text: ['Ihr geht weiter. Der Haken winkt euch nach.', 'You walk on. The hook waves goodbye.'] }
    ] },
  { id: 'ce-sturmwarnung', bg: 'schiff', icon: 'map', title: ['Sturmwarnung', 'Storm warning'],
    lines: [
      ['kalle', 'KRAA! Sturm im Anmarsch! Die Wettervorhersage: nass!', 'KRAA! Storm incoming! The forecast: wet!'],
      ['B', 'Wir könnten den Wind nutzen. Oder wir könnten überleben.', 'We could use the wind. Or we could survive.']
    ],
    choices: [
      { label: ['Wind nutzen', 'Ride the wind'], hint: ['+12 Erfahrung, -12 % Leben', '+12 XP, -12% HP'], outcome: { xp: 12, hurt: 0.12 }, text: ['Ihr fliegt fast. Das Schiff fliegt fast auch auseinander.', 'You almost fly. The ship almost flies apart too.'] },
      { label: ['Segel einholen', 'Reef the sails'], hint: ['Crew heilt 10 %', 'Crew heals 10%'], outcome: { heal: 0.1 }, text: ['Ihr wartet unter Deck. Jemand spielt Karten und verliert.', 'You wait below deck. Someone plays cards and loses.'] }
    ] },
  { id: 'ce-schiffbruch', bg: 'insel', icon: 'recruit', title: ['Ein Schiffbrüchiger', 'A castaway'],
    lines: [
      ['B', 'Da winkt jemand von einer sehr kleinen Insel.', 'Someone is waving from a very small island.'],
      ['A', 'Vielleicht will er in die Crew. Oder er hat Hunger. Beides ist sympathisch.', 'Maybe he wants to join. Or he is hungry. Both are relatable.']
    ],
    choices: [
      { label: ['Aufnehmen', 'Take him in'], hint: ['Kapitän +2 Statuspunkte (er kennt Tricks)', 'Captain +2 stat points (he knows tricks)'], outcome: { points: 2 }, text: ['Er bringt euch drei Kampftricks bei und steigt an der nächsten Insel wieder aus. Mit eurem Proviant.', 'He teaches you three fighting tricks and gets off at the next island. With your supplies.'] },
      { label: ['Proviant dalassen', 'Leave supplies'], hint: ['+12 Erfahrung', '+12 XP'], outcome: { xp: 12 }, text: ['Er winkt euch nach. Ihr fühlt euch wie gute Menschen. Mit Kopfgeld.', 'He waves you off. You feel like good people. With a bounty.'] }
    ] },
  { id: 'ce-wette', bg: 'nacht', icon: 'chest', title: ['Eine kleine Wette', 'A small bet'],
    lines: [
      ['B', 'Ich wette, ich treffe die Flasche da hinten.', 'I bet I can hit that bottle over there.'],
      ['A', 'Ich wette, du triffst das Schiff.', 'I bet you hit the ship.']
    ],
    choices: [
      { label: ['Wette annehmen', 'Take the bet'], hint: ['50 %: +18 Gold, sonst -8 Gold · 😊 froh', '50%: +18 gold, else -8 gold · 😊 happy'], outcome: { chance: 0.5, win: { gold: 18 }, lose: { gold: -8 } }, herz: { b: 'froh' }, text: ['Die Flasche ist heil. Das Schiff auch. Gerade so. Jemand strahlt trotzdem.', 'The bottle is fine. So is the ship. Barely. Someone is still beaming.'] },
      { label: ['Zielübungen', 'Target practice'], hint: ['Alle +4 % Krit', 'All +4% crit'], outcome: { crit: 0.04 }, text: ['Nach drei Stunden trifft jeder die Flasche. Die Flasche nimmt es persönlich.', 'After three hours everyone hits the bottle. The bottle takes it personally.'] }
    ] },
  { id: 'ce-lied', bg: 'nacht', icon: 'rest', title: ['Abend an Deck', 'Evening on deck'],
    lines: [
      ['B', 'Singen wir? Ich kenne genau ein Lied. Drei Strophen davon.', 'Shall we sing? I know exactly one song. Three verses of it.'],
      ['A', 'Dann singen wir die drei Strophen. Sehr laut.', 'Then we sing those three verses. Very loudly.']
    ],
    choices: [
      { label: ['Mitsingen', 'Sing along'], hint: ['Crew heilt 20 % · 😊 froh', 'Crew heals 20% · 😊 happy'], outcome: { heal: 0.2 }, herz: { b: 'froh' }, text: ['Die Möwen haben sich beschwert. Die Crew fühlt sich großartig, und jemand summt den ganzen Abend vor sich hin.', 'The seagulls complained. The crew feels great, and someone hums the whole evening.'] },
      { label: ['Sterne lesen', 'Read the stars'], hint: ['+10 Erfahrung, +10 Berry', '+10 XP, +10 Berry'], outcome: { xp: 10, berry: 10 }, text: ['Ihr findet ein Sternbild, das wie ein Steak aussieht. Navigation gelungen.', 'You find a constellation that looks like a steak. Navigation complete.'] }
    ] },
  { id: 'ce-kanone', bg: 'schiff', icon: 'battle', title: ['Eine alte Kanone', 'An old cannon'],
    lines: [
      ['B', 'Im Laderaum steht eine Kanone, von der niemand etwas weiß.', 'There is a cannon in the hold nobody knows about.'],
      ['A', 'Dann wissen wir es jetzt. Was macht der rote Knopf?', 'Well, now we do. What does the red button do?']
    ],
    choices: [
      { label: ['Reparieren', 'Repair it'], hint: ['-18 Gold, alle +1 Angriff', '-18 gold, all +1 attack'], outcome: { gold: -18, buffAll: { stat: 'atk', value: 1 } }, text: ['Sie funktioniert. Der rote Knopf bleibt ein Geheimnis.', 'It works. The red button remains a mystery.'] },
      { label: ['Als Altmetall verkaufen', 'Sell for scrap'], hint: ['+14 Gold', '+14 gold'], outcome: { gold: 14 }, text: ['Der Schrotthändler weint ein bisschen vor Freude.', 'The scrap dealer cries a little from joy.'] }
    ] },
  { id: 'ce-flaute', bg: 'insel', icon: 'map', title: ['Totale Flaute', 'Dead calm'],
    lines: [
      ['B', 'Kein Wind. Seit Stunden. Ich zähle Wellen. Es gibt keine.', 'No wind. For hours. I am counting waves. There are none.'],
      ['A', 'Dann rudern wir! Oder wir angeln. Angeln klingt besser.', 'Then we row! Or we fish. Fishing sounds better.']
    ],
    choices: [
      { label: ['Rudern', 'Row'], hint: ['+16 Erfahrung, -8 % Leben · 😮‍💨 erschöpft', '+16 XP, -8% HP · 😮‍💨 tired'], outcome: { xp: 16, hurt: 0.08 }, herz: { b: 'muede' }, text: ['Ihr seid schneller angekommen und habt jetzt Arme wie Fässer. Jemand schnauft noch die ganze Nacht.', 'You arrived sooner and now have arms like barrels. Someone is still panting all night.'] },
      { label: ['Angeln', 'Fish'], hint: ['Alle +3 Leben', 'All +3 HP'], outcome: { buffAll: { stat: 'hp', value: 3 } }, text: ['Ein Fisch, so groß wie das Beiboot. Abendessen für drei Tage.', 'A fish as big as the dinghy. Dinner for three days.'] }
    ] },
  { id: 'ce-steckbrief', bg: 'hafen', icon: 'elite', title: ['Neue Steckbriefe', 'New wanted posters'],
    lines: [
      ['B', '{A}, dein Steckbrief hängt aus! Das Foto ist… mutig.', '{A}, your wanted poster is up! The photo is… bold.'],
      ['A', 'Ich sehe gut aus. Ich sehe immer gut aus.', 'I look good. I always look good.']
    ],
    choices: [
      { label: ['Stolz posieren', 'Pose proudly'], hint: ['+12 Erfahrung · 😊 froh', '+12 XP · 😊 happy'], outcome: { xp: 12 }, herz: { b: 'froh' }, text: ['Ein Kind will ein Autogramm. Die Mutter ruft die Marine. Ein guter Tag, und jemand posiert noch lange weiter.', 'A kid wants an autograph. The mother calls the Marines. A good day, and someone keeps posing for ages.'] },
      { label: ['Plakate einsammeln', 'Collect the posters'], hint: ['+20 Berry', '+20 Berry'], outcome: { berry: 20 }, text: ['Sammler zahlen erstaunlich viel für dein Gesicht.', 'Collectors pay surprisingly well for your face.'] }
    ] },
  { id: 'ce-meerjungfrau', bg: 'insel', icon: 'chest', title: ['Ein Lied aus dem Wasser', 'A song from the water'],
    lines: [
      ['B', 'Hört ihr das? Aus dem Wasser singt jemand.', 'Do you hear that? Someone is singing from the water.'],
      ['A', 'Das ist entweder romantisch oder ein Seekönig mit Talent.', 'That is either romantic or a sea king with talent.']
    ],
    choices: [
      { label: ['Nachsehen', 'Take a look'], hint: ['35 %: epischer Schatz, sonst -25 % Leben', '35%: epic treasure, else -25% HP'], outcome: { chance: 0.35, win: { relic: 2 }, lose: { hurt: 0.25 } }, text: ['Es war ein Seekönig. Mit Talent. Und Zähnen.', 'It was a sea king. With talent. And teeth.'] },
      { label: ['Zuhören und weiter', 'Listen and sail on'], hint: ['Crew heilt 15 % · 😊 froh', 'Crew heals 15% · 😊 happy'], outcome: { heal: 0.15 }, herz: { b: 'froh' }, text: ['Ein schönes Lied. Ihr summt es noch Tage später, und jemand lächelt dabei die ganze Zeit.', 'A lovely song. You hum it for days, and someone smiles the whole time.'] }
    ] }
];
