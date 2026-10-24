// Noch mehr Zwischen-Events (dazu js/data/events2.js) und kleine „Folgen“ über eine ganze Insel.
//   Sprecher in lines: 'A' (Kapitän), 'B' (jemand aus der Crew), 'kalle' (Zeitungsmöwe) oder eine Crew-ID ('zorro' …),
//   dann sollte when(run) prüfen, ob die Figur an Bord ist.
//   when(run)  = optional, nur dann kann das Event kommen
//   outcome.temp = { stat: 'atk'|'spd'|'hp', value }  gilt bis zum Ende des Insel-Kapitels (also auch im Kampf gegen den Bösewicht)
//   choice.flag  = merkt sich die Entscheidung für den nächsten Teil einer Folge
// Folgen (GL.data.crewEpisodes): Teil 1 direkt nach dem Ablegen, Teil 2 unterwegs, Teil 3 vor dem Bösewicht.
//   Teil 3 hat Varianten (need = Flag aus Teil 1/2), die erste passende gilt, sonst die ohne need.
window.GL = window.GL || {};
GL.data = GL.data || {};

(function () {
  const on = id => run => (run.crew || []).some(u => u.id === id && u.hp > 0);
  const gold = n => run => (run.gold || 0) >= n;
  const C = (l, h, outcome, t, flag) => Object.assign({ label: l, hint: h, outcome, text: t }, flag ? { flag } : {});

  const more = [
    // ---------- Wetter & Meer ----------
    { id: 'ce3-regen', bg: 'schiff', icon: 'rest', title: ['Platzregen', 'Downpour'],
      lines: [['B', 'Es regnet seitwärts. Ich wusste nicht, dass das geht.', 'It is raining sideways. I did not know that was allowed.'], ['A', 'Gute Gelegenheit, die Wäsche zu machen.', 'Good chance to do the laundry.']],
      choices: [C(['Wasser sammeln', 'Collect water'], ['Crew heilt 20 %', 'Crew heals 20%'], { heal: 0.2 }, ['Frisches Trinkwasser. Und sehr saubere Socken.', 'Fresh drinking water. And very clean socks.']),
        C(['Im Regen trainieren', 'Train in the rain'], ['+14 Erfahrung, -8 % Leben', '+14 XP, -8% HP'], { xp: 14, hurt: 0.08 }, ['Dramatisch sah es aus. Erkältet sind trotzdem alle.', 'It looked dramatic. Everyone still caught a cold.'])] },
    { id: 'ce3-flaute2', bg: 'schiff', icon: 'map', title: ['Spiegelglattes Meer', 'Glassy sea'],
      lines: [['B', 'Kein Wind. Keine Welle. Nicht mal ein Fisch, der sich bewegt.', 'No wind. No wave. Not even a fish moving.'], ['A', 'Dann rudern wir. Oder wir warten. Ich bin für Essen.', 'Then we row. Or we wait. I vote for food.']],
      choices: [C(['Rudern', 'Row'], ['Alle +3 Leben (Muskeln)', 'All +3 HP (muscles)'], { buffAll: { stat: 'hp', value: 3 } }, ['Drei Stunden später: Arme wie Anker. Ziel: weiterhin weit weg.', 'Three hours later: arms like anchors. Destination: still far.']),
        C(['Angeln', 'Fish'], ['+12 Gold', '+12 gold'], { gold: 12 }, ['Ein Fisch, ein Stiefel, eine Geldbörse. Zwei davon sind nützlich.', 'One fish, one boot, one wallet. Two of those are useful.'])] },
    { id: 'ce3-regenbogen', bg: 'insel', icon: 'chest', title: ['Ein doppelter Regenbogen', 'A double rainbow'],
      lines: [['B', 'Am Ende eines Regenbogens liegt ein Schatz. Sagt man.', 'At the end of a rainbow lies a treasure. They say.'], ['A', 'Wir haben zwei. Also zwei Schätze. Rechnen kann ich.', 'We have two. So two treasures. I can do maths.']],
      choices: [C(['Hinterher!', 'After it!'], ['40 %: Schatz, sonst -10 % Leben', '40%: treasure, else -10% HP'], { chance: 0.4, win: { relic: 0 }, lose: { hurt: 0.1 } }, ['Regenbögen haben kein Ende. Das weiß jetzt die ganze Crew.', 'Rainbows have no end. The whole crew knows that now.']),
        C(['Bewundern', 'Admire it'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Manchmal ist der Schatz die Aussicht. Und das Nickerchen danach.', 'Sometimes the treasure is the view. And the nap afterwards.'])] },
    { id: 'ce3-strudel', bg: 'schiff', icon: 'elite', title: ['Ein Strudel', 'A whirlpool'],
      lines: [['kalle', 'KRAA! Strudel steuerbord! Und backbord! Und überhaupt!', 'KRAA! Whirlpool starboard! And port! And generally!'], ['A', 'Mittendurch. Dann sind wir schneller da.', 'Straight through. That way we get there faster.']],
      choices: [C(['Mittendurch', 'Straight through'], ['50 %: alle +1 Tempo, sonst -15 % Leben', '50%: all +1 speed, else -15% HP'], { chance: 0.5, win: { buffAll: { stat: 'spd', value: 1 } }, lose: { hurt: 0.15 } }, ['Die Crew dreht sich noch, als sie längst angekommen ist.', 'The crew is still spinning long after arriving.']),
        C(['Außen herum', 'Go around'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Langweilig, aber trocken. Die Möwe ist beleidigt.', 'Boring, but dry. The gull is offended.'])] },
    { id: 'ce3-mondnacht', bg: 'nacht', icon: 'rest', title: ['Vollmond', 'Full moon'],
      lines: [['B', 'Bei Vollmond werden Seemänner seltsam, sagt man.', 'Sailors get strange at full moon, they say.'], ['A', 'Wir sind schon seltsam. Kein Unterschied.', 'We are already strange. No difference.']],
      choices: [C(['Mondscheinfest', 'Moonlight party'], ['Crew heilt 15 %, +8 Gold Trinkgeld', 'Crew heals 15%, +8 gold tips'], { heal: 0.15, gold: 8 }, ['Ein vorbeifahrendes Schiff wirft Münzen. Vermutlich, damit ihr aufhört zu singen.', 'A passing ship throws coins. Presumably so you stop singing.']),
        C(['Wache halten', 'Keep watch'], ['Alle +3 % Krit', 'All +3% crit'], { crit: 0.03 }, ['Ihr seht im Dunkeln jetzt erstaunlich gut. Und erstaunlich müde aus.', 'You now see surprisingly well in the dark. And look surprisingly tired.'])] },

    // ---------- Tiere ----------
    { id: 'ce3-krabbe', bg: 'insel', icon: 'battle', title: ['Eine sehr große Krabbe', 'A very large crab'],
      lines: [['B', 'Die Krabbe guckt mich an.', 'The crab is looking at me.'], ['A', 'Sie guckt uns alle an. Wie ein Buffet.', 'It is looking at all of us. Like a buffet.']],
      choices: [C(['Kämpfen', 'Fight it'], ['+16 Erfahrung, -12 % Leben', '+16 XP, -12% HP'], { xp: 16, hurt: 0.12 }, ['Die Krabbe verliert. Das Abendessen gewinnt.', 'The crab loses. Dinner wins.']),
        C(['Respektvoll zurückweichen', 'Back away respectfully'], ['nichts passiert, +6 Gold gefunden', 'nothing happens, +6 gold found'], { gold: 6 }, ['Beim Rückwärtsgehen findet ihr Münzen. Die Krabbe hat sie gesammelt. Jetzt nicht mehr.', 'Walking backwards you find coins. The crab collected them. Not anymore.'])] },
    { id: 'ce3-papagei', bg: 'hafen', icon: 'recruit', title: ['Ein redender Papagei', 'A talking parrot'],
      lines: [['B', 'Der Papagei sagt ständig „Bösewicht hat Bauchweh“.', 'The parrot keeps saying “villain has a tummy ache”.'], ['A', 'Das ist entweder ein Hinweis oder ein sehr persönlicher Papagei.', 'That is either a clue or a very personal parrot.']],
      choices: [C(['Mitnehmen', 'Take him along'], ['Alle +1 Angriff', 'All +1 attack'], { buffAll: { stat: 'atk', value: 1 } }, ['Er verrät jede Schwäche. Leider auch eure.', 'He reveals every weakness. Unfortunately yours too.']),
        C(['Kekse geben', 'Give him biscuits'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Er fliegt satt davon und ruft „Danke, Idioten“. Liebevoll, vermutlich.', 'He flies off full, shouting “thanks, idiots”. Lovingly, presumably.'])] },
    { id: 'ce3-wal', bg: 'schiff', icon: 'map', title: ['Ein freundlicher Wal', 'A friendly whale'],
      lines: [['B', 'Ein Wal schwimmt neben uns. Er lächelt. Wale lächeln nicht.', 'A whale is swimming next to us. He is smiling. Whales do not smile.'], ['A', 'Der schon. Hallo, Wal!', 'This one does. Hello, whale!']],
      choices: [C(['Mitschwimmen lassen', 'Let him tag along'], ['Alle +1 Tempo', 'All +1 speed'], { buffAll: { stat: 'spd', value: 1 } }, ['Er zieht euch ein Stück. Wale sind die besten Taxis.', 'He tows you a bit. Whales are the best taxis.']),
        C(['Ein Lied singen', 'Sing him a song'], ['Crew heilt 20 %', 'Crew heals 20%'], { heal: 0.2 }, ['Er singt zurück. Es dauert drei Stunden. Es ist wunderschön.', 'He sings back. It takes three hours. It is beautiful.'])] },
    { id: 'ce3-moewenstreik', bg: 'hafen', icon: 'chest', title: ['Die Möwen streiken', 'The gulls are on strike'],
      lines: [['kalle', 'KRAA! Generalstreik! Keine Zeitung, bis wir mehr Fisch kriegen!', 'KRAA! General strike! No paper until we get more fish!'], ['A', 'Kalle. Du bist doch eine Möwe.', 'Kalle. You are a gull.'], ['kalle', 'Eben drum.', 'Exactly.']],
      choices: [C(['Fisch spenden', 'Donate fish'], ['-5 Gold, +18 Erfahrung (Neuigkeiten!)', '-5 gold, +18 XP (news!)'], { gold: -5, xp: 18 }, ['Die Zeitung kommt wieder. Mit eurem Foto auf Seite drei. Unvorteilhaft.', 'The paper is back. With your photo on page three. Unflattering.']),
        C(['Streikbrecher sein', 'Break the strike'], ['+12 Berry, -10 % Leben (Möwen picken)', '+12 Berry, -10% HP (gulls peck)'], { berry: 12, hurt: 0.1 }, ['Ihr verkauft die Zeitung selbst. Die Möwen merken sich eure Gesichter.', 'You sell the paper yourselves. The gulls remember your faces.'])] },
    { id: 'ce3-affen', bg: 'insel', icon: 'battle', title: ['Affen klauen Proviant', 'Monkeys steal supplies'],
      lines: [['B', 'Die Affen haben unsere Vorräte! Und meinen Hut!', 'The monkeys have our supplies! And my hat!'], ['A', 'Hinterher! Aber zuerst der Hut.', 'After them! But the hat first.']],
      choices: [C(['Jagen', 'Chase them'], ['50 %: +18 Gold, sonst -12 % Leben', '50%: +18 gold, else -12% HP'], { chance: 0.5, win: { gold: 18 }, lose: { hurt: 0.12 } }, ['Die Affen hatten auch fremde Vorräte. Die gehören jetzt euch.', 'The monkeys also had other people’s supplies. Those are yours now.']),
        C(['Bananen tauschen', 'Trade bananas'], ['-6 Gold, Crew heilt 15 %', '-6 gold, crew heals 15%'], { gold: -6, heal: 0.15 }, ['Ein fairer Handel. Der Hut bleibt beim Oberaffen. Er steht ihm.', 'A fair trade. The hat stays with the head monkey. It suits him.'])] },

    // ---------- Händler & Glück ----------
    { id: 'ce3-wahrsagerin', bg: 'hafen', icon: 'chest', title: ['Eine Wahrsagerin', 'A fortune teller'],
      lines: [['B', 'Sie sagt, sie sieht unsere Zukunft. Für fünf Gold.', 'She says she sees our future. For five gold.'], ['A', 'Sieht sie auch, ob es Mittagessen gibt?', 'Does she also see whether there is lunch?']],
      choices: [C(['Bezahlen', 'Pay her'], ['-5 Gold, alle +4 % Krit', '-5 gold, all +4% crit'], { gold: -5, crit: 0.04 }, ['„Ihr werdet kämpfen und manchmal treffen.“ Erschreckend genau.', '“You will fight and sometimes hit.” Frighteningly accurate.']),
        C(['Selbst wahrsagen', 'Tell her fortune'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Ihr sagt ihr einen Kunden voraus. Er geht gerade. Ihr wart es.', 'You predict a customer for her. He is just leaving. It was you.'])], when: gold(5) },
    { id: 'ce3-wuerfel', bg: 'hafen', icon: 'chest', title: ['Ein Würfelspiel', 'A dice game'],
      lines: [['B', 'Der Mann sagt, seine Würfel sind ganz normal.', 'The man says his dice are completely normal.'], ['A', 'Warum haben die dann nur Sechsen?', 'Then why do they only have sixes?']],
      choices: [C(['Mitspielen', 'Play along'], ['45 %: +25 Gold, sonst -12 Gold', '45%: +25 gold, else -12 gold'], { chance: 0.45, win: { gold: 25 }, lose: { gold: -12 } }, ['Ihr spielt mit seinen Würfeln. Das war vorhersehbar.', 'You play with his dice. That was predictable.']),
        C(['Würfel tauschen', 'Swap the dice'], ['+14 Gold', '+14 gold'], { gold: 14 }, ['Mit euren Würfeln verliert er plötzlich. Er ist sehr überrascht.', 'With your dice he suddenly loses. He is very surprised.'])], when: gold(12) },
    { id: 'ce3-ramsch', bg: 'hafen', icon: 'recruit', title: ['Der Ramschladen', 'The junk shop'],
      lines: [['B', 'Alles kostet ein Gold. Auch der Ladenbesitzer, sagt er.', 'Everything costs one gold. Including the owner, he says.'], ['A', 'Wir nehmen alles, was nicht beißt.', 'We take everything that does not bite.']],
      choices: [C(['Wühlen', 'Rummage'], ['-6 Gold, 50 %: seltener Schatz, sonst Gerümpel', '-6 gold, 50%: rare treasure, else junk'], { gold: -6, chance: 0.5, win: { relic: 1 }, lose: { berry: 5 } }, ['Zwischen Socken und Kerzen liegt etwas, das leuchtet. Oder es ist eine Kerze.', 'Between socks and candles lies something glowing. Or it is a candle.']),
        C(['Weitergehen', 'Walk on'], ['nichts passiert', 'nothing happens'], {}, ['Klug. Der Laden schaut euch traurig hinterher.', 'Wise. The shop watches you leave, sadly.'])], when: gold(6) },
    { id: 'ce3-versicherung', bg: 'hafen', icon: 'elite', title: ['Ein Versicherungsvertreter', 'An insurance agent'],
      lines: [['B', 'Er verkauft Versicherungen gegen Tiefseeriesen.', 'He sells insurance against deep giants.'], ['A', 'Was zahlt die, wenn wir gefressen werden?', 'What does it pay if we get eaten?'], ['B', 'Er sagt: „Ihr merkt dann eh nichts mehr.“', 'He says: “You won’t notice anyway.”']],
      choices: [C(['Abschließen', 'Sign up'], ['-6 Gold, alle +4 Leben', '-6 gold, all +4 HP'], { gold: -6, buffAll: { stat: 'hp', value: 4 } }, ['Das Kleingedruckte ist länger als das Schiff. Aber ihr fühlt euch sicherer.', 'The fine print is longer than the ship. But you feel safer.']),
        C(['Rauswerfen', 'Throw him out'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Er fliegt weit. Versichert war er nicht.', 'He flies far. He was not insured.'])], when: gold(10) },
    { id: 'ce3-fundbuero', bg: 'hafen', icon: 'chest', title: ['Das Fundbüro', 'The lost and found'],
      lines: [['B', 'Hier liegen Sachen, die Piraten verloren haben.', 'This is where things pirates lost end up.'], ['A', 'Haben die auch meine Lust auf Gemüse?', 'Do they have my appetite for vegetables?']],
      choices: [C(['Etwas abholen', 'Claim something'], ['Kapitän +1 Statuspunkt', 'Captain +1 stat point'], { points: 1 }, ['Ein Handbuch „Kämpfen für Fortgeschrittene“. Mit Notizen am Rand.', 'A handbook “Fighting for advanced users”. With notes in the margin.']),
        C(['Etwas abgeben', 'Hand something in'], ['+18 Berry Finderlohn', '+18 Berry finder’s fee'], { berry: 18 }, ['Ihr gebt einen Stiefel ab. Der Besitzer zahlt überraschend gut.', 'You hand in a boot. The owner pays surprisingly well.'])] },
    { id: 'ce3-lotterie', bg: 'hafen', icon: 'chest', title: ['Die Hafenlotterie', 'The harbour lottery'],
      lines: [['kalle', 'KRAA! Lose! Hauptgewinn: ein Schiff! Trostpreis: ein kleineres Schiff!', 'KRAA! Tickets! Grand prize: a ship! Consolation: a smaller ship!'], ['A', 'Wir haben schon ein Schiff. Aber zwei sind besser.', 'We already have a ship. But two are better.']],
      choices: [C(['Los kaufen', 'Buy a ticket'], ['-4 Gold, 25 %: +40 Berry', '-4 gold, 25%: +40 Berry'], { gold: -4, chance: 0.25, win: { berry: 40 }, lose: {} }, ['Der Trostpreis war ein Schiff in einer Flasche. Immerhin.', 'The consolation prize was a ship in a bottle. Still counts.']),
        C(['Die Möwe bestechen', 'Bribe the gull'], ['-10 Gold, +22 Berry', '-10 gold, +22 Berry'], { gold: -10, berry: 22 }, ['Kalle zieht das Gewinnerlos. Zufällig eures. Kalle ist sehr zufällig.', 'Kalle draws the winning ticket. Coincidentally yours. Kalle is very coincidental.'])], when: gold(10) },

    // ---------- Marine & Kopfgeld ----------
    { id: 'ce3-rekrut', bg: 'hafen', icon: 'elite', title: ['Ein Marine-Rekrut', 'A marine recruit'],
      lines: [['B', 'Der kleine Marine da will uns verhaften. Er zittert.', 'That little marine wants to arrest us. He is shaking.'], ['A', 'Hast du Hunger? Wir haben Fleisch.', 'Are you hungry? We have meat.']],
      choices: [C(['Mit ihm essen', 'Eat with him'], ['+12 Erfahrung, Crew heilt 10 %', '+12 XP, crew heals 10%'], { xp: 12, heal: 0.1 }, ['Er erzählt alles über die Patrouillen. Dann merkt er, was er getan hat.', 'He tells you everything about the patrols. Then he realises what he did.']),
        C(['Ihn trainieren', 'Train him'], ['Alle +3 % Krit', 'All +3% crit'], { crit: 0.03 }, ['Er wird ein guter Marine. Und ihr bessere Piraten. Alle verlieren ein bisschen.', 'He becomes a good marine. And you better pirates. Everyone loses a little.'])] },
    { id: 'ce3-jaeger', bg: 'insel', icon: 'battle', title: ['Kopfgeldjäger im Gebüsch', 'Bounty hunters in the bushes'],
      lines: [['B', 'Da raschelt was. Mit Waffen.', 'Something is rustling. With weapons.'], ['A', 'Sag ihnen, wir sind teurer als sie denken.', 'Tell them we are more expensive than they think.']],
      choices: [C(['Angreifen', 'Attack'], ['+18 Erfahrung, -15 % Leben', '+18 XP, -15% HP'], { xp: 18, hurt: 0.15 }, ['Sie hatten euren Steckbrief dabei. Er ist jetzt etwas verknittert.', 'They had your wanted poster. It is a bit crumpled now.']),
        C(['Sich als jemand anders ausgeben', 'Pretend to be someone else'], ['50 %: +20 Gold, sonst -12 % Leben', '50%: +20 gold, else -12% HP'], { chance: 0.5, win: { gold: 20 }, lose: { hurt: 0.12 } }, ['Ihr seid „ganz normale Touristen“. Mit Schwertern. Und Kanone.', 'You are “completely normal tourists”. With swords. And a cannon.'])] },
    { id: 'ce3-steckbrieffehler', bg: 'hafen', icon: 'elite', title: ['Ein Fehler im Steckbrief', 'A typo on the poster'],
      lines: [['B', 'Auf deinem Steckbrief steht 3 Berry.', 'Your wanted poster says 3 Berry.'], ['A', 'DREI?', 'THREE?'], ['B', 'Es fehlen ein paar Nullen. Oder Respekt.', 'A few zeros are missing. Or respect.']],
      choices: [C(['Beschweren', 'Complain'], ['+14 Erfahrung, -8 % Leben', '+14 XP, -8% HP'], { xp: 14, hurt: 0.08 }, ['Die Marine korrigiert den Fehler. Mit einer Verfolgungsjagd.', 'The marines fix the typo. With a chase.']),
        C(['Ausnutzen', 'Take advantage'], ['+20 Gold (niemand jagt dich)', '+20 gold (nobody hunts you)'], { gold: 20 }, ['Für 3 Berry steht niemand früh auf. Ihr kauft in Ruhe ein.', 'Nobody gets up early for 3 Berry. You shop in peace.'])] },

    // ---------- Crew & Figuren ----------
    { id: 'ce3-zorro', bg: 'insel', icon: 'map', title: ['Zorro holt Wasser', 'Zoro fetches water'], when: on('zorro'),
      lines: [['zorro', 'Ich hol schnell Wasser. Der Fluss ist da vorne.', 'I will quickly get water. The river is right there.'], ['A', 'Zorro. Das ist das Meer. Und du gehst in den Wald.', 'Zoro. That is the sea. And you are walking into the forest.']],
      choices: [C(['Suchen gehen', 'Go look for him'], ['+12 Erfahrung, -8 % Leben', '+12 XP, -8% HP'], { xp: 12, hurt: 0.08 }, ['Ihr findet ihn auf einem Berg. Mit einem Eimer. Ohne Wasser.', 'You find him on a mountain. With a bucket. Without water.']),
        C(['Warten', 'Wait'], ['Alle +1 Angriff (er trainiert unterwegs)', 'All +1 attack (he trains on the way)'], { buffAll: { stat: 'atk', value: 1 } }, ['Er kommt nach zwei Tagen zurück. Stärker. Und von der anderen Seite.', 'He returns two days later. Stronger. And from the other side.'])] },
    { id: 'ce3-lysop', bg: 'schiff', icon: 'battle', title: ['Lysops Heldentat', 'Usopp’s heroic deed'], when: on('lysop'),
      lines: [['lysop', 'Ich habe gestern Nacht einen Tiefseeriesen mit einem Löffel besiegt.', 'Last night I defeated a deep giant with a spoon.'], ['A', 'Echt? Mit welchem Löffel?', 'Really? With which spoon?'], ['lysop', 'Mit… dem Suppenlöffel. Dem großen.', 'With… the soup spoon. The big one.']],
      choices: [C(['Ihm glauben', 'Believe him'], ['Alle +4 % Krit (Mut steckt an)', 'All +4% crit (courage is contagious)'], { crit: 0.04 }, ['Die Crew ist so beeindruckt, dass sie selbst mutiger wird. Der Löffel ist verbogen.', 'The crew is so impressed it gets braver itself. The spoon is bent.']),
        C(['Beweise verlangen', 'Ask for proof'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Er zeigt eine Schuppe. Es ist ein Kartoffelchip.', 'He shows a scale. It is a potato chip.'])] },
    { id: 'ce3-brook', bg: 'nacht', icon: 'rest', title: ['Eine Gruselgeschichte', 'A ghost story'], when: on('brook'),
      lines: [['brook', 'Es war eine dunkle Nacht. Ein Skelett spielte Geige…', 'It was a dark night. A skeleton played the violin…'], ['B', 'Brook. Das bist du.', 'Brook. That is you.'], ['brook', 'Yohoho! Darum ist es ja so gruselig!', 'Yohoho! That is what makes it so scary!']],
      choices: [C(['Weiterhören', 'Keep listening'], ['Crew heilt 15 %, +8 Erfahrung', 'Crew heals 15%, +8 XP'], { heal: 0.15, xp: 8 }, ['Niemand schläft. Aber alle haben gelacht.', 'Nobody sleeps. But everyone laughed.']),
        C(['Um ein Lied bitten', 'Ask for a song'], ['Alle +1 Tempo', 'All +1 speed'], { buffAll: { stat: 'spd', value: 1 } }, ['Ein schneller Shanty. Die Crew tanzt bis zum Morgen und rudert dann im Takt.', 'A fast shanty. The crew dances till dawn and then rows in rhythm.'])] },
    { id: 'ce3-franky', bg: 'schiff', icon: 'elite', title: ['Frankys neue Erfindung', 'Franky’s new invention'], when: on('franky'),
      lines: [['franky', 'SUUUPER! Eine Kanone, die Cola schießt!', 'SUUUPER! A cannon that fires cola!'], ['A', 'Warum?', 'Why?'], ['franky', 'Warum nicht?!', 'Why not?!']],
      choices: [C(['Ausprobieren', 'Try it'], ['50 %: alle +1 Angriff, sonst -10 % Leben', '50%: all +1 attack, else -10% HP'], { chance: 0.5, win: { buffAll: { stat: 'atk', value: 1 } }, lose: { hurt: 0.1 } }, ['Das Deck ist klebrig. Für immer.', 'The deck is sticky. Forever.']),
        C(['Lieber trinken', 'Drink it instead'], ['Crew heilt 20 %', 'Crew heals 20%'], { heal: 0.2 }, ['Franky ist enttäuscht, aber durstig. Alle anderen auch.', 'Franky is disappointed, but thirsty. Everyone else too.'])] },
    { id: 'ce3-robin', bg: 'insel', icon: 'map', title: ['Robin findet eine Inschrift', 'Robin finds an inscription'], when: on('robin'),
      lines: [['robin', 'Hier steht: „Wer dies liest, hat zu viel Zeit.“', 'It says: “Whoever reads this has too much time.”'], ['A', 'Was steht da noch?', 'What else does it say?'], ['robin', '„…und sollte links graben.“ Fufu.', '“…and should dig to the left.” Fufu.']],
      choices: [C(['Links graben', 'Dig left'], ['seltener Schatz', 'rare treasure'], { relic: 1 }, ['Links lag tatsächlich etwas. Rechts lag auch etwas. Es war ein Stein.', 'There really was something on the left. On the right too. It was a rock.']),
        C(['Weiterlesen', 'Keep reading'], ['Kapitän +2 Statuspunkte', 'Captain +2 stat points'], { points: 2 }, ['Robin liest bis Sonnenuntergang vor. Alle haben etwas gelernt. Hauptsächlich Geduld.', 'Robin reads until sunset. Everyone learned something. Mostly patience.'])] },
    { id: 'ce3-chopper', bg: 'kueche', icon: 'rest', title: ['Chopper mischt Medizin', 'Chopper mixes medicine'], when: on('chopper'),
      lines: [['chopper', 'Ich hab einen neuen Trank! Er heilt fast alles.', 'I made a new potion! It heals almost everything.'], ['A', 'Fast?', 'Almost?'], ['chopper', 'Er schmeckt nach Socken. Das heilt er nicht.', 'It tastes like socks. That it does not heal.']],
      choices: [C(['Trinken', 'Drink it'], ['Crew heilt 30 %', 'Crew heals 30%'], { heal: 0.3 }, ['Alle sind gesund. Und schweigen sehr lange.', 'Everyone is healthy. And silent for a long time.']),
        C(['Für später aufheben', 'Save it for later'], ['Alle +4 Leben', 'All +4 HP'], { buffAll: { stat: 'hp', value: 4 } }, ['Allein der Geruch macht zäher.', 'The smell alone makes you tougher.'])] },
    { id: 'ce3-nami', bg: 'hafen', icon: 'chest', title: ['Nami verhandelt', 'Nami negotiates'], when: on('nami'),
      lines: [['nami', 'Der Händler will 50 Gold. Ich biete 5.', 'The merchant wants 50 gold. I offer 5.'], ['B', 'Und er?', 'And him?'], ['nami', 'Er weint gerade. Das heißt ja.', 'He is crying right now. That means yes.']],
      choices: [C(['Nami machen lassen', 'Let Nami handle it'], ['+20 Gold', '+20 gold'], { gold: 20 }, ['Ihr verlasst den Laden mit Ware UND seinem Geld. Niemand weiß, wie.', 'You leave the shop with the goods AND his money. Nobody knows how.']),
        C(['Fair zahlen', 'Pay fairly'], ['-8 Gold, Schatz wählen', '-8 gold, pick a treasure'], { gold: -8, pick: 'treasure' }, ['Nami spricht zwei Tage nicht mit euch. Der Händler schenkt euch noch etwas.', 'Nami does not talk to you for two days. The merchant gives you something extra.'])] },
    { id: 'ce3-sanji', bg: 'kueche', icon: 'rest', title: ['Sanji kocht für Fremde', 'Sanji cooks for strangers'], when: on('sanji'),
      lines: [['sanji', 'Da hinten hungert eine ganze Fischerfamilie.', 'A whole fishing family is starving over there.'], ['A', 'Dann koch! Ich helfe essen.', 'Then cook! I will help eat.']],
      choices: [C(['Großes Festmahl', 'Big feast'], ['-6 Gold, Crew heilt 25 %, +10 Erfahrung', '-6 gold, crew heals 25%, +10 XP'], { gold: -6, heal: 0.25, xp: 10 }, ['Die Familie schenkt euch ihren besten Fang. Ruffy hat ihn schon gegessen.', 'The family gives you their best catch. Luffy has already eaten it.']),
        C(['Rezept beibringen', 'Teach a recipe'], ['Alle +3 Leben', 'All +3 HP'], { buffAll: { stat: 'hp', value: 3 } }, ['Hilfe zur Selbsthilfe. Mit sehr viel Butter.', 'Help for self-help. With a lot of butter.'])] },
    { id: 'ce3-streit', bg: 'schiff', icon: 'battle', title: ['Streit um die Hängematte', 'Hammock dispute'],
      lines: [['B', 'Das ist MEINE Hängematte.', 'That is MY hammock.'], ['A', 'Da steht dein Name nicht drauf.', 'Your name is not on it.'], ['B', 'Doch. Ganz klein. Unten.', 'It is. Very small. Underneath.']],
      choices: [C(['Ausfechten', 'Fight it out'], ['+14 Erfahrung, -10 % Leben', '+14 XP, -10% HP'], { xp: 14, hurt: 0.1 }, ['Die Hängematte hat den Streit nicht überlebt. Problem gelöst.', 'The hammock did not survive the dispute. Problem solved.']),
        C(['Zweite Hängematte bauen', 'Build a second hammock'], ['-6 Gold, Crew heilt 15 %', '-6 gold, crew heals 15%'], { gold: -6, heal: 0.15 }, ['Jetzt streiten sich alle um die neue. Sie ist bequemer.', 'Now everyone fights over the new one. It is comfier.'])] },
    { id: 'ce3-geburtstag', bg: 'kueche', icon: 'rest', title: ['Ein Geburtstag', 'A birthday'],
      lines: [['B', 'Heute ist mein Geburtstag. Glaube ich. Ich hab den Kalender verloren.', 'Today is my birthday. I think. I lost the calendar.'], ['A', 'Dann feiern wir! Sicher ist sicher.', 'Then we celebrate! Better safe than sorry.']],
      choices: [C(['Kuchen!', 'Cake!'], ['Crew heilt 20 %, -5 Gold', 'Crew heals 20%, -5 gold'], { heal: 0.2, gold: -5 }, ['Der Kuchen hat 47 Kerzen. Niemand weiß, warum. Er brennt hervorragend.', 'The cake has 47 candles. Nobody knows why. It burns excellently.']),
        C(['Geschenk basteln', 'Craft a present'], ['Kapitän +1 Statuspunkt', 'Captain +1 stat point'], { points: 1 }, ['Ein Holzschwert. Es hält genau einen Kampf. Wie geplant.', 'A wooden sword. It lasts exactly one fight. As planned.'])] },
    { id: 'ce3-tagebuch', bg: 'nacht', icon: 'map', title: ['Das Logbuch', 'The logbook'],
      lines: [['B', 'Wer hat ins Logbuch „Heute: Fleisch“ geschrieben? Vierzig Mal?', 'Who wrote “Today: meat” in the logbook? Forty times?'], ['A', 'Das war ein guter Monat.', 'That was a good month.']],
      choices: [C(['Ordentlich führen', 'Keep it properly'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Ab jetzt steht da „Heute: Fleisch, Wetter gut“. Fortschritt.', 'From now on it says “Today: meat, weather fine”. Progress.']),
        C(['Als Roman verkaufen', 'Sell it as a novel'], ['+20 Berry', '+20 Berry'], { berry: 20 }, ['Ein Verlag findet es „minimalistisch“. Zweite Auflage geplant.', 'A publisher calls it “minimalist”. Second edition planned.'])] },
    { id: 'ce3-training2', bg: 'schiff', icon: 'battle', title: ['Trainingsmontag', 'Training Monday'],
      lines: [['B', 'Heute wird trainiert. Alle. Ohne Ausreden.', 'Today we train. Everyone. No excuses.'], ['A', 'Ich habe eine Ausrede. Sie heißt Hunger.', 'I have an excuse. It is called hunger.']],
      choices: [C(['Kraft', 'Strength'], ['Alle +1 Angriff, -8 % Leben', 'All +1 attack, -8% HP'], { buffAll: { stat: 'atk', value: 1 }, hurt: 0.08 }, ['Die Hanteln sind jetzt kleiner. Die Muskeln nicht.', 'The dumbbells are smaller now. The muscles are not.']),
        C(['Ausdauer', 'Endurance'], ['Alle +4 Leben', 'All +4 HP'], { buffAll: { stat: 'hp', value: 4 } }, ['Zwanzig Runden ums Deck. Das Deck ist kurz. Es waren sehr viele Runden.', 'Twenty laps around the deck. The deck is short. It was a lot of laps.']),
        C(['Ausweichen üben', 'Dodge practice'], ['Alle +3 % Krit', 'All +3% crit'], { crit: 0.03 }, ['Man wirft Kartoffeln aufeinander. Man trifft. Man lernt.', 'You throw potatoes at each other. You hit. You learn.'])] },

    // ---------- Inseln & Bewohner ----------
    { id: 'ce3-dorffest', bg: 'hafen', icon: 'rest', title: ['Ein Dorffest', 'A village fair'],
      lines: [['B', 'Die Leute feiern das Fest der großen Rübe.', 'The locals are celebrating the festival of the great turnip.'], ['A', 'Gibt es auch Fleisch zur Rübe?', 'Is there meat with the turnip?']],
      choices: [C(['Mitfeiern', 'Join in'], ['Crew heilt 20 %', 'Crew heals 20%'], { heal: 0.2 }, ['Die Rübe war enttäuschend. Die Leute nicht.', 'The turnip was disappointing. The people were not.']),
        C(['Rübenwettziehen', 'Turnip tug-of-war'], ['50 %: +20 Gold, sonst -10 % Leben', '50%: +20 gold, else -10% HP'], { chance: 0.5, win: { gold: 20 }, lose: { hurt: 0.1 } }, ['Die Rübe hat sich gewehrt. Ernsthaft.', 'The turnip fought back. Seriously.'])] },
    { id: 'ce3-einsiedler', bg: 'insel', icon: 'recruit', title: ['Ein alter Einsiedler', 'An old hermit'],
      lines: [['B', 'Der alte Mann sagt, er wartet seit 40 Jahren auf Besuch.', 'The old man says he has been waiting 40 years for visitors.'], ['A', 'Und jetzt sind wir da!', 'And now we are here!'], ['B', 'Er sagt, er hatte auf jemand anderen gehofft.', 'He says he was hoping for someone else.']],
      choices: [C(['Zuhören', 'Listen to him'], ['Kapitän +2 Statuspunkte', 'Captain +2 stat points'], { points: 2 }, ['Vierzig Jahre Kampferfahrung in vier Stunden. Ihr seid erschöpft. Er auch.', 'Forty years of combat experience in four hours. You are exhausted. So is he.']),
        C(['Tee trinken', 'Have tea'], ['Crew heilt 20 %', 'Crew heals 20%'], { heal: 0.2 }, ['Der Tee ist 40 Jahre alt. Er wirkt trotzdem.', 'The tea is 40 years old. It still works.'])] },
    { id: 'ce3-kinder', bg: 'hafen', icon: 'recruit', title: ['Kinder wollen Piraten sein', 'Kids want to be pirates'],
      lines: [['B', 'Die Kinder fragen, ob wir echte Piraten sind.', 'The kids ask if we are real pirates.'], ['A', 'Die echtesten! Wollt ihr was sehen?', 'The realest! Want to see something?']],
      choices: [C(['Vorführung', 'Show off'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Großer Applaus. Kleiner Brand. Großer Applaus für den Brand.', 'Big applause. Small fire. Big applause for the fire.']),
        C(['Süßigkeiten verteilen', 'Hand out sweets'], ['-6 Gold, alle +3 % Krit (gute Laune)', '-6 gold, all +3% crit (good mood)'], { gold: -6, crit: 0.03 }, ['Die Kinder malen eure Flagge an jede Wand. Die Marine ist nicht begeistert.', 'The kids paint your flag on every wall. The marines are not thrilled.'])] },
    { id: 'ce3-raetsel', bg: 'insel', icon: 'map', title: ['Das Rätseltor', 'The riddle gate'],
      lines: [['B', 'Am Tor steht: „Was hat Zähne, aber beißt nicht?“', 'The gate says: “What has teeth but does not bite?”'], ['A', 'Sanji, wenn er nicht kocht.', 'Sanji, when he is not cooking.'], ['B', 'Es ist ein Kamm. Das Tor ist trotzdem aufgegangen.', 'It is a comb. The gate opened anyway.']],
      choices: [C(['Durch das Tor', 'Through the gate'], ['seltener Schatz, -10 % Leben', 'rare treasure, -10% HP'], { relic: 1, hurt: 0.1 }, ['Hinter dem Tor war noch ein Tor. Und eine Falle. Und ein Schatz. In dieser Reihenfolge.', 'Behind the gate was another gate. And a trap. And a treasure. In that order.']),
        C(['Das Tor mitnehmen', 'Take the gate'], ['+22 Berry', '+22 Berry'], { berry: 22 }, ['Ein Sammler zahlt gut für sprechende Tore. Es hat ihn auch geärgert.', 'A collector pays well for talking gates. It annoyed him too.'])] },
    { id: 'ce3-quelle', bg: 'insel', icon: 'rest', title: ['Eine heiße Quelle', 'A hot spring'],
      lines: [['B', 'Eine heiße Quelle! Mitten im Dschungel!', 'A hot spring! In the middle of the jungle!'], ['A', 'Gibt es da auch Krokodile?', 'Are there crocodiles too?'], ['B', 'Nur ein kleines. Es entspannt auch.', 'Only a small one. It is relaxing too.']],
      choices: [C(['Baden', 'Bathe'], ['Crew heilt 30 %', 'Crew heals 30%'], { heal: 0.3 }, ['Das Krokodil und ihr seid jetzt befreundet. Es hat keine Wahl.', 'The crocodile and you are friends now. It has no choice.']),
        C(['Eier kochen', 'Boil eggs'], ['+10 Gold (Verkauf), Crew heilt 10 %', '+10 gold (sold), crew heals 10%'], { gold: 10, heal: 0.1 }, ['Die perfekten Eier. Die Insel hat jetzt einen Laden.', 'The perfect eggs. The island now has a shop.'])] },
    { id: 'ce3-pilze', bg: 'insel', icon: 'fruit', title: ['Leuchtende Pilze', 'Glowing mushrooms'],
      lines: [['B', 'Die Pilze leuchten. Das ist entweder sehr gut oder sehr schlecht.', 'The mushrooms glow. That is either very good or very bad.'], ['A', 'Probieren wir einen. Zur Wissenschaft.', 'Let us try one. For science.']],
      choices: [C(['Probieren', 'Try one'], ['50 %: alle +1 Angriff, sonst -15 % Leben', '50%: all +1 attack, else -15% HP'], { chance: 0.5, win: { buffAll: { stat: 'atk', value: 1 } }, lose: { hurt: 0.15 } }, ['Ihr leuchtet jetzt auch ein bisschen. Praktisch bei Nacht.', 'Now you glow a bit too. Handy at night.']),
        C(['Als Lampe benutzen', 'Use as lamps'], ['+10 Erfahrung, +6 Gold', '+10 XP, +6 gold'], { xp: 10, gold: 6 }, ['Die beste Beleuchtung, die das Schiff je hatte.', 'The best lighting the ship ever had.'])] },
    { id: 'ce3-wahlplakat', bg: 'hafen', icon: 'elite', title: ['Bürgermeisterwahl', 'Mayor election'],
      lines: [['B', 'Die Insel wählt einen Bürgermeister. Du stehst auf dem Stimmzettel.', 'The island is electing a mayor. You are on the ballot.'], ['A', 'Was macht ein Bürgermeister?', 'What does a mayor do?'], ['B', 'Er isst beim Festbankett zuerst.', 'He eats first at the banquet.']],
      choices: [C(['Kandidieren', 'Run for it'], ['Crew heilt 20 %, +10 Gold', 'Crew heals 20%, +10 gold'], { heal: 0.2, gold: 10 }, ['Ihr gewinnt erdrutschartig und tretet nach dem Bankett sofort zurück.', 'You win by a landslide and resign right after the banquet.']),
        C(['Den Gegner unterstützen', 'Back the opponent'], ['+16 Erfahrung', '+16 XP'], { xp: 16 }, ['Er gewinnt. Er ist ein Hund. Er ist ein guter Bürgermeister.', 'He wins. He is a dog. He is a good mayor.'])] },

    // ---------- Fundstücke & Aberglaube ----------
    { id: 'ce3-fass', bg: 'schiff', icon: 'chest', title: ['Ein treibendes Fass', 'A drifting barrel'],
      lines: [['B', 'Ein Fass! Mit der Aufschrift „Nicht öffnen“.', 'A barrel! Labelled “Do not open”.'], ['A', 'Dann wissen wir ja, was zu tun ist.', 'Then we know what to do.']],
      choices: [C(['Öffnen', 'Open it'], ['40 %: Schatz, sonst -15 % Leben (es knallt)', '40%: treasure, else -15% HP (it goes bang)'], { chance: 0.4, win: { relic: 0 }, lose: { hurt: 0.15 } }, ['Die Aufschrift war ernst gemeint. Oder ein Witz. Schwer zu sagen nach dem Knall.', 'The label was serious. Or a joke. Hard to tell after the bang.']),
        C(['Zurückwerfen', 'Throw it back'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Irgendwo öffnet es jemand anderes. Ihr hört es in der Ferne.', 'Somewhere someone else opens it. You hear it in the distance.'])] },
    { id: 'ce3-schwarzekatze', bg: 'hafen', icon: 'battle', title: ['Eine schwarze Katze', 'A black cat'],
      lines: [['B', 'Eine schwarze Katze ist von links über das Deck gelaufen.', 'A black cat crossed the deck from the left.'], ['A', 'Ist das schlecht?', 'Is that bad?'], ['B', 'Von rechts wäre schlimmer. Glaube ich.', 'From the right would be worse. I think.']],
      choices: [C(['Füttern (Glück!)', 'Feed it (luck!)'], ['-4 Gold, alle +4 % Krit', '-4 gold, all +4% crit'], { gold: -4, crit: 0.04 }, ['Die Katze bleibt. Sie heißt jetzt Kapitän. Niemand widerspricht.', 'The cat stays. Its name is now Captain. Nobody objects.']),
        C(['Ignorieren', 'Ignore it'], ['50 %: nichts, sonst -10 % Leben', '50%: nothing, else -10% HP'], { chance: 0.5, win: {}, lose: { hurt: 0.1 } }, ['Aberglaube ist Unsinn. Sagt der Mann mit dem verstauchten Knöchel.', 'Superstition is nonsense. Says the man with the sprained ankle.'])] },
    { id: 'ce3-muenze', bg: 'insel', icon: 'chest', title: ['Eine verfluchte Münze', 'A cursed coin'],
      lines: [['B', 'Die Münze ist verflucht, sagt der Verkäufer. Darum ist sie billig.', 'The coin is cursed, says the seller. That is why it is cheap.'], ['A', 'Eine billige Münze. Was für ein Angebot.', 'A cheap coin. What a deal.']],
      choices: [C(['Kaufen', 'Buy it'], ['-3 Gold, 50 %: +30 Berry, sonst -12 % Leben', '-3 gold, 50%: +30 Berry, else -12% HP'], { gold: -3, chance: 0.5, win: { berry: 30 }, lose: { hurt: 0.12 } }, ['Der Fluch ist: Sie ist zwei Münzen wert. Furchtbar.', 'The curse is: it is worth two coins. Terrible.']),
        C(['Den Verkäufer verfluchen', 'Curse the seller'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Er läuft weg. Mit der Münze. Vielleicht wirkt der Fluch doch.', 'He runs off. With the coin. Maybe the curse works after all.'])], when: gold(5) },
    { id: 'ce3-flaschenschiff', bg: 'kueche', icon: 'chest', title: ['Ein Schiff in der Flasche', 'A ship in a bottle'],
      lines: [['B', 'In der Flasche ist ein Schiff. Und darauf eine winzige Crew.', 'There is a ship in the bottle. And a tiny crew on it.'], ['A', 'Die winken!', 'They are waving!']],
      choices: [C(['Freilassen', 'Set them free'], ['Kapitän +1 Statuspunkt, +8 Erfahrung', 'Captain +1 stat point, +8 XP'], { points: 1, xp: 8 }, ['Sie bedanken sich mit einem winzigen Kampftrick. Er funktioniert erstaunlich groß.', 'They thank you with a tiny combat trick. It works surprisingly big.']),
        C(['Ins Regal stellen', 'Put it on the shelf'], ['+18 Berry (Deko-Wert)', '+18 Berry (deco value)'], { berry: 18 }, ['Sie winken jeden Morgen. Es ist ein bisschen unheimlich.', 'They wave every morning. It is a little creepy.'])] },
    { id: 'ce3-kanonenkugel', bg: 'schiff', icon: 'elite', title: ['Eine verirrte Kanonenkugel', 'A stray cannonball'],
      lines: [['kalle', 'KRAA! Kanonenkugel im Anflug! Wahrscheinlich nicht persönlich gemeint!', 'KRAA! Cannonball incoming! Probably not personal!'], ['A', 'Ich fang sie!', 'I will catch it!']],
      choices: [C(['Fangen', 'Catch it'], ['+16 Erfahrung, -10 % Leben', '+16 XP, -10% HP'], { xp: 16, hurt: 0.1 }, ['Gefangen. Zurückgeworfen. Ein Schiff am Horizont ist jetzt etwas kleiner.', 'Caught. Thrown back. A ship on the horizon is now slightly smaller.']),
        C(['Ducken', 'Duck'], ['+10 Gold (Kugel verkaufen)', '+10 gold (sell the ball)'], { gold: 10 }, ['Die Kugel landet im Proviant. Gut für den Schrotthändler, schlecht für die Kekse.', 'The ball lands in the supplies. Good for the scrap dealer, bad for the biscuits.'])] },
    { id: 'ce3-sternschnuppe', bg: 'nacht', icon: 'fruit', title: ['Eine Sternschnuppe', 'A shooting star'],
      lines: [['B', 'Eine Sternschnuppe! Wünsch dir was!', 'A shooting star! Make a wish!'], ['A', 'Ich wünsche mir… eine Sternschnuppe zum Essen.', 'I wish for… a shooting star to eat.']],
      choices: [C(['Fleisch wünschen', 'Wish for meat'], ['Crew heilt 25 %', 'Crew heals 25%'], { heal: 0.25 }, ['Am nächsten Morgen treibt ein Proviantfass vorbei. Wünsche funktionieren.', 'Next morning a supply barrel drifts by. Wishes work.']),
        C(['Kraft wünschen', 'Wish for strength'], ['20 %: Teufelsfrucht wählen, sonst +10 Erfahrung', '20%: pick a devil fruit, else +10 XP'], { chance: 0.2, win: { pick: 'fruit' }, lose: { xp: 10 } }, ['Der Himmel hat zugehört. Ob er verstanden hat, bleibt offen.', 'The sky listened. Whether it understood remains open.'])] }
  ];

  // ---------- Folgen: drei Teile pro Insel ----------
  const EP = [
    { id: 'post', icon: 'map', title: ['Die Flaschenpost', 'The message in a bottle'], parts: [
      { bg: 'schiff', icon: 'map', lines: [['B', 'Eine Flaschenpost: „Hilfe, ich stecke in einer Flasche fest.“', 'A message in a bottle: “Help, I am stuck in a bottle.”'], ['A', 'In dieser Flasche? Die ist leer.', 'In this bottle? It is empty.']],
        choices: [C(['Antwort zurückschicken', 'Send a reply'], ['+6 Erfahrung, merkt sich die Antwort', '+6 XP, the reply is remembered'], { xp: 6 }, ['Ihr schreibt: „Welche Flasche?“ Höflich, aber bestimmt.', 'You write: “Which bottle?” Polite but firm.'], 'antwort'),
          C(['Flasche als Becher benutzen', 'Use it as a cup'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Praktisch. Etwas salzig.', 'Handy. Slightly salty.'], 'becher')] },
      { bg: 'nacht', icon: 'map', lines: [['kalle', 'KRAA! Noch eine Flasche! Diesmal mit Absender!', 'KRAA! Another bottle! This time with a sender!'], ['B', '„Kapitän Korken, kleinstes Schiff der Welt. Ich komme vorbei.“', '“Captain Cork, smallest ship in the world. I am coming over.”']],
        choices: [C(['Einen Empfang vorbereiten', 'Prepare a welcome'], ['+4 Erfahrung', '+4 XP'], { xp: 4 }, ['Ihr backt einen sehr kleinen Kuchen.', 'You bake a very small cake.'], 'empfang'),
          C(['Weiter segeln', 'Keep sailing'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Wer klein ist, holt euch schon ein.', 'Small people catch up eventually.'])] },
      { variants: [
        { need: 'empfang', bg: 'hafen', icon: 'elite', lines: [['B', 'Ein Schiff, so groß wie ein Schuh, legt an.', 'A ship the size of a shoe docks.'], ['A', 'Kapitän Korken! Willkommen! Kuchen?', 'Captain Cork! Welcome! Cake?']],
          choices: [C(['Gemeinsam gegen den Bösewicht', 'Face the villain together'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff', 'until the island ends: whole crew +1 attack'], { temp: { stat: 'atk', value: 1 } }, ['Korken feuert seine Kanone. Sie ist winzig. Die Moral ist riesig.', 'Cork fires his cannon. It is tiny. Morale is huge.'])] },
        { need: 'becher', bg: 'hafen', icon: 'elite', lines: [['B', 'Ein winziger Kapitän steht auf dem Deck und brüllt.', 'A tiny captain stands on deck and yells.'], ['A', 'Was sagt er?', 'What is he saying?'], ['B', '„IHR HABT AUS MEINEM HAUS GETRUNKEN!“', '“YOU DRANK FROM MY HOUSE!”']],
          choices: [C(['Entschuldigen', 'Apologise'], ['-10 Gold Schadenersatz', '-10 gold in damages'], { gold: -10 }, ['Er nimmt das Geld und eine neue Flasche. Alle sind zufrieden.', 'He takes the money and a new bottle. Everyone is happy.']),
            C(['So tun, als wäre nichts', 'Pretend nothing happened'], ['bis zum Ende der Insel: Ganze Crew -1 Tempo (er sabotiert das Ruder)', 'until the island ends: whole crew -1 speed (he sabotages the rudder)'], { temp: { stat: 'spd', value: -1 } }, ['Ab jetzt steuert das Schiff ganz leicht nach links. Sehr leicht. Sehr nervig.', 'From now on the ship pulls slightly left. Very slightly. Very annoyingly.'])] },
        { bg: 'hafen', icon: 'map', lines: [['B', 'Kapitän Korken ist da. Er wollte nur Hallo sagen.', 'Captain Cork has arrived. He just wanted to say hello.'], ['A', 'Hallo, Korken!', 'Hello, Cork!']],
          choices: [C(['Hallo sagen', 'Say hello'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Er segelt zufrieden weiter. Kleine Dinge, große Freude.', 'He sails on, content. Small things, big joy.'])] }
      ] }
    ] },
    { id: 'gewuerz', icon: 'rest', title: ['Das Teufelsgewürz', 'The devil spice'], parts: [
      { bg: 'hafen', icon: 'rest', lines: [['B', 'Ein Händler verkauft „Teufelsgewürz“. Angeblich macht es stark.', 'A merchant sells “devil spice”. Supposedly it makes you strong.'], ['A', 'Kann man es essen?', 'Can you eat it?'], ['B', 'Man sollte nicht.', 'You should not.']],
        choices: [C(['Kaufen', 'Buy it'], ['-4 Gold', '-4 gold'], { gold: -4 }, ['Das Glas brummt leise. Gewürze sollten nicht brummen.', 'The jar hums quietly. Spices should not hum.'], 'gewuerz'),
          C(['Nicht kaufen', 'Do not buy'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Vernünftig. Ungewohnt, aber vernünftig.', 'Sensible. Unusual, but sensible.'])] },
      { bg: 'kueche', icon: 'rest', lines: [['B', 'Ich möchte heute ein Festmahl kochen. Ein richtiges.', 'I want to cook a feast today. A real one.'], ['A', 'Mit allem?', 'With everything?'], ['B', 'Mit allem, was wir haben. Also auch mit dem Glas, das brummt.', 'With everything we have. Including the humming jar.']],
        choices: [C(['Festmahl!', 'Feast!'], ['+4 Erfahrung (Küchendienst)', '+4 XP (kitchen duty)'], { xp: 4 }, ['Die Küche duftet. Und brummt.', 'The galley smells wonderful. And hums.'], 'festmahl'),
          C(['Lieber Zwieback', 'Hardtack instead'], ['Crew heilt 10 %', 'Crew heals 10%'], { heal: 0.1 }, ['Zwieback. Der treue Freund des Seemanns.', 'Hardtack. The sailor’s loyal friend.'])] },
      { variants: [
        { need: 'festmahl', bg: 'kueche', icon: 'rest', lines: [['B', 'Das Festmahl ist fertig. Mit einer Prise Teufelsgewürz.', 'The feast is ready. With a pinch of devil spice.'], ['A', 'Ich spüre meine Zunge nicht. Ich spüre ALLES.', 'I cannot feel my tongue. I feel EVERYTHING.']],
          choices: [C(['Aufessen', 'Eat it all'], ['bis zum Ende der Insel: Ganze Crew +4 Leben, Crew heilt 15 %', 'until the island ends: whole crew +4 HP, crew heals 15%'], { temp: { stat: 'hp', value: 4 }, heal: 0.15 }, ['Der Bösewicht wird sich wundern. Die Crew dampft leicht.', 'The villain will be surprised. The crew is steaming slightly.'])] },
        { need: 'gewuerz', bg: 'kueche', icon: 'fruit', lines: [['B', 'Jemand hat das Gewürz pur gegessen.', 'Someone ate the spice straight.'], ['A', 'Ich hatte Hunger!', 'I was hungry!']],
          choices: [C(['Löschen', 'Put out the fire'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff, -10 % Leben', 'until the island ends: whole crew +1 attack, -10% HP'], { temp: { stat: 'atk', value: 1 }, hurt: 0.1 }, ['Der Kapitän speit kurz Feuer. Er ist sehr stolz darauf.', 'The captain briefly breathes fire. He is very proud of it.'])] },
        { bg: 'kueche', icon: 'rest', lines: [['B', 'Ein ganz normales Abendessen. Ohne Brummen.', 'A completely normal dinner. No humming.'], ['A', 'Langweilig. Lecker. Langweilig lecker.', 'Boring. Tasty. Boringly tasty.']],
          choices: [C(['Genießen', 'Enjoy'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Manchmal ist normal genau richtig.', 'Sometimes normal is just right.'])] }
      ] }
    ] },
    { id: 'party', icon: 'rest', title: ['Die lange Nacht', 'The long night'], parts: [
      { bg: 'hafen', icon: 'rest', lines: [['B', 'Im Hafen ist Fest. Bis morgen früh, sagen sie.', 'There is a party in the harbour. Until morning, they say.'], ['A', 'Wir sind Piraten. Wir feiern bis übermorgen.', 'We are pirates. We party until the day after.']],
        choices: [C(['Durchfeiern', 'Party all night'], ['Crew heilt 20 %', 'Crew heals 20%'], { heal: 0.2 }, ['Es wird getanzt, gesungen und ein Tisch geht zu Bruch. Planmäßig.', 'There is dancing, singing and one broken table. As planned.'], 'party'),
          C(['Früh schlafen', 'Early night'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Ausgeschlafen und ein bisschen neidisch.', 'Well rested and a little envious.'])] },
      { bg: 'schiff', icon: 'rest', lines: [['B', 'Mein Kopf ist ein Amboss. Und jemand schlägt drauf.', 'My head is an anvil. And someone is hitting it.'], ['A', 'Das ist das Ruder. Du liegst drunter.', 'That is the rudder. You are lying under it.']],
        choices: [C(['Kräutertee', 'Herbal tea'], ['-3 Gold', '-3 gold'], { gold: -3 }, ['Bitter. Wirkt. Bitter.', 'Bitter. Works. Bitter.'], 'tee'),
          C(['Salzwasser-Kur', 'Salt water cure'], ['-8 % Leben', '-8% HP'], { hurt: 0.08 }, ['Hilft gar nicht, aber jetzt sind alle wach.', 'Does not help at all, but now everyone is awake.'])] },
      { variants: [
        { need: 'tee', bg: 'schiff', icon: 'battle', lines: [['B', 'Der Tee hat gewirkt. Ich fühl mich wie neu.', 'The tea worked. I feel brand new.'], ['A', 'Dann los! Der Bösewicht wartet.', 'Then let’s go! The villain is waiting.']],
          choices: [C(['Ausgeschlafen angreifen', 'Attack well rested'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff', 'until the island ends: whole crew +1 attack'], { temp: { stat: 'atk', value: 1 } }, ['Gute Laune ist eine Waffe. Eine gefährliche.', 'Good mood is a weapon. A dangerous one.'])] },
        { need: 'party', bg: 'schiff', icon: 'battle', lines: [['B', 'Die Crew ist verkatert. Alle. Auch die Möwe.', 'The crew is hungover. All of them. Even the gull.'], ['kalle', 'Kraa… leiser bitte.', 'Kraa… quieter please.']],
          choices: [C(['Trotzdem weiter', 'Carry on anyway'], ['bis zum Ende der Insel: Ganze Crew -1 Tempo, +14 Erfahrung', 'until the island ends: whole crew -1 speed, +14 XP'], { temp: { stat: 'spd', value: -1 }, xp: 14 }, ['Langsam, aber mit Geschichten. Gute Geschichten.', 'Slow, but with stories. Good stories.']),
            C(['Ausschlafen', 'Sleep it off'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Der Bösewicht wartet. Er ist es gewohnt.', 'The villain waits. He is used to it.'])] },
        { bg: 'schiff', icon: 'battle', lines: [['B', 'Ausgeruht wie nie. Wir haben wirklich nichts verpasst.', 'Rested like never before. We really did not miss anything.'], ['A', 'Die anderen erzählen das Gegenteil.', 'The others tell a different story.']],
          choices: [C(['Weiter', 'Onwards'], ['Kapitän +1 Statuspunkt', 'Captain +1 stat point'], { points: 1 }, ['Vernunft hat auch ihre Belohnung. Eine kleine.', 'Reason has its rewards too. A small one.'])] }
      ] }
    ] },
    { id: 'geist', icon: 'elite', title: ['Das Nebelschiff', 'The fog ship'], parts: [
      { bg: 'nacht', icon: 'elite', lines: [['B', 'Ein Schiff im Nebel. Ohne Licht. Ohne Crew. Mit Musik.', 'A ship in the fog. No lights. No crew. With music.'], ['A', 'Das klingt nach einer Party!', 'That sounds like a party!']],
        choices: [C(['Entern', 'Board it'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['An Deck steht ein Kerzenständer. Er sagt „Willkommen“.', 'There is a candlestick on deck. It says “welcome”.'], 'geist'),
          C(['Wegsegeln', 'Sail away'], ['Crew heilt 10 %', 'Crew heals 10%'], { heal: 0.1 }, ['Die Musik folgt euch noch eine Weile.', 'The music follows you for a while.'])] },
      { bg: 'nacht', icon: 'elite', lines: [['B', 'Es klopft. Von innen. Aus dem Proviantraum.', 'Something is knocking. From inside. In the pantry.'], ['A', 'Vielleicht hat das Fleisch Hunger.', 'Maybe the meat is hungry.']],
        choices: [C(['Nachsehen', 'Look'], ['-8 % Leben', '-8% HP'], { hurt: 0.08 }, ['Es war ein sehr dünner Mann. Er war sehr freundlich. Und dann weg.', 'It was a very thin man. He was very friendly. And then gone.'], 'mutig'),
          C(['Unter die Decke', 'Under the blanket'], ['Crew heilt 10 %', 'Crew heals 10%'], { heal: 0.1 }, ['Die Decke schützt vor allem. Wissenschaftlich bewiesen.', 'Blankets protect from everything. Scientifically proven.'])] },
      { variants: [
        { need: 'mutig', bg: 'nacht', icon: 'chest', lines: [['B', 'Der dünne Mann ist wieder da. Er war der Kapitän des Nebelschiffs.', 'The thin man is back. He was the captain of the fog ship.'], ['A', 'Und? Hast du Fleisch?', 'And? Do you have meat?']],
          choices: [C(['Sein Geschenk annehmen', 'Accept his gift'], ['seltener Schatz', 'rare treasure'], { relic: 1 }, ['Er verschwindet im Nebel. Der Schatz bleibt. Ein guter Tausch.', 'He vanishes into the fog. The treasure stays. A fine trade.'])] },
        { need: 'geist', bg: 'nacht', icon: 'elite', lines: [['B', 'Seit dem Nebelschiff fühlen sich meine Arme schwer an.', 'Since the fog ship my arms feel heavy.'], ['A', 'Vielleicht ein Fluch. Oder Muskelkater.', 'Maybe a curse. Or sore muscles.']],
          choices: [C(['Fluch annehmen', 'Accept the curse'], ['bis zum Ende der Insel: Ganze Crew -1 Angriff, dafür +6 % Krit', 'until the island ends: whole crew -1 attack, but +6% crit'], { temp: { stat: 'atk', value: -1 }, crit: 0.06 }, ['Schwächer, aber unheimlich treffsicher. Typisch Fluch.', 'Weaker, but eerily accurate. Typical curse.']),
            C(['Mit Salz wegspülen', 'Wash it off with salt'], ['-8 Gold', '-8 gold'], { gold: -8 }, ['Teures Salz. Wirkt aber.', 'Expensive salt. Works though.'])] },
        { bg: 'nacht', icon: 'map', lines: [['B', 'Der Nebel ist weg. Das Schiff auch.', 'The fog is gone. So is the ship.'], ['A', 'Schade. Die Musik war gut.', 'Shame. The music was good.']],
          choices: [C(['Nachsummen', 'Hum along'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Die Melodie bleibt. Für Tage. Für Wochen.', 'The tune stays. For days. For weeks.'])] }
      ] }
    ] },
    { id: 'kompass', icon: 'map', title: ['Der verschwundene Log Port', 'The missing log pose'], parts: [
      { bg: 'schiff', icon: 'map', lines: [['B', 'Der Log Port ist weg. Einfach weg.', 'The log pose is gone. Just gone.'], ['A', 'Hat ihn jemand gegessen?', 'Did someone eat it?'], ['B', 'Das war meine erste Vermutung. Ja.', 'That was my first guess. Yes.']],
        choices: [C(['Gründlich suchen', 'Search thoroughly'], ['-6 % Leben (Kisten fallen)', '-6% HP (crates fall)'], { hurt: 0.06 }, ['Ihr findet drei Socken, eine Gabel und Zorros Schwert-Pflegeöl.', 'You find three socks, a fork and Zoro’s sword oil.'], 'suche'),
          C(['Jemanden beschuldigen', 'Blame someone'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Die Stimmung an Bord ist jetzt etwas frostig.', 'The mood on board is now a little frosty.'], 'streit')] },
      { bg: 'schiff', icon: 'map', lines: [['kalle', 'KRAA! Ich hab da was Glänzendes im Nest!', 'KRAA! I have something shiny in my nest!'], ['A', 'Kalle!', 'Kalle!'], ['kalle', 'Finderlohn?', 'Finder’s fee?']],
        choices: [C(['Finderlohn zahlen', 'Pay the fee'], ['-3 Gold', '-3 gold'], { gold: -3 }, ['Kalle gibt ihn zurück. Mit Möwenspuren.', 'Kalle returns it. With gull marks.'], 'bezahlt'),
          C(['Verhandeln', 'Negotiate'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Kalle bekommt einen Fisch. Das ist sein Lieblingspreis.', 'Kalle gets a fish. That is his favourite price.'])] },
      { variants: [
        { need: 'streit', bg: 'schiff', icon: 'battle', lines: [['B', 'Ich rede immer noch nicht mit dir.', 'I am still not talking to you.'], ['A', 'Du redest doch gerade.', 'You are talking right now.'], ['B', '…Mist.', '…Damn.']],
          choices: [C(['Entschuldigen', 'Apologise'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Versöhnt. Mit Umarmung. Unangenehm lang.', 'Reconciled. With a hug. Uncomfortably long.']),
            C(['Schmollen lassen', 'Let them sulk'], ['bis zum Ende der Insel: Ganze Crew -1 Tempo', 'until the island ends: whole crew -1 speed'], { temp: { stat: 'spd', value: -1 } }, ['Beleidigte Leute rudern langsamer. Wissenschaftlich bewiesen.', 'Offended people row slower. Scientifically proven.'])] },
        { need: 'suche', bg: 'schiff', icon: 'map', lines: [['B', 'Beim Suchen haben wir das ganze Schiff aufgeräumt.', 'While searching we tidied the whole ship.'], ['A', 'Das Schiff ist schneller ohne Gerümpel!', 'The ship is faster without the junk!']],
          choices: [C(['Volle Fahrt', 'Full speed'], ['bis zum Ende der Insel: Ganze Crew +1 Tempo', 'until the island ends: whole crew +1 speed'], { temp: { stat: 'spd', value: 1 } }, ['Ordnung ist das halbe Segeln. Wer hätte das gedacht.', 'Tidiness is half of sailing. Who knew.'])] },
        { bg: 'schiff', icon: 'map', lines: [['B', 'Log Port wieder da, Kurs stimmt.', 'Log pose back, course is right.'], ['A', 'Dann weiter zum Bösewicht!', 'Then on to the villain!']],
          choices: [C(['Los', 'Go'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Ein ganz normaler Tag auf See. Selten genug.', 'A completely normal day at sea. Rare enough.'])] }
      ] }
    ] },
    { id: 'foto', icon: 'elite', title: ['Das Steckbrief-Foto', 'The wanted poster photo'], parts: [
      { bg: 'hafen', icon: 'elite', lines: [['B', 'Ein Marine-Fotograf will ein neues Foto für deinen Steckbrief.', 'A marine photographer wants a new photo for your wanted poster.'], ['A', 'Darf ich lächeln?', 'May I smile?']],
        choices: [C(['Heldenpose', 'Heroic pose'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Sehr eindrucksvoll. Sehr erkennbar.', 'Very impressive. Very recognisable.'], 'pose'),
          C(['Grimasse', 'Pull a face'], ['+8 Berry', '+8 Berry'], { berry: 8 }, ['Der Fotograf verlangt Geld zurück. Ihr gebt ihm Gesichtscreme.', 'The photographer wants a refund. You give him face cream.'], 'grimasse')] },
      { bg: 'hafen', icon: 'elite', lines: [['kalle', 'KRAA! Die neuen Steckbriefe sind gedruckt!', 'KRAA! The new posters are printed!'], ['B', 'Man erkennt dich… sehr deutlich. Oder gar nicht.', 'You are… very clearly recognisable. Or not at all.']],
        choices: [C(['Plakate signieren', 'Sign the posters'], ['+10 Gold', '+10 gold'], { gold: 10 }, ['Signierte Steckbriefe verkaufen sich gut. Bei Kopfgeldjägern.', 'Signed posters sell well. To bounty hunters.']),
          C(['Plakate abreißen', 'Tear them down'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Ihr reißt alle ab. Bis auf die an der Marine-Basis.', 'You tear them all down. Except the ones at the marine base.'])] },
      { variants: [
        { need: 'pose', bg: 'insel', icon: 'battle', lines: [['B', 'Kopfgeldjäger! Sie haben dich an der Pose erkannt.', 'Bounty hunters! They recognised you by the pose.'], ['A', 'Dann posiere ich eben weiter. Im Kampf.', 'Then I will keep posing. In battle.']],
          choices: [C(['Ruhm verpflichtet', 'Fame obliges'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff, -10 % Leben', 'until the island ends: whole crew +1 attack, -10% HP'], { temp: { stat: 'atk', value: 1 }, hurt: 0.1 }, ['Sie hatten keine Chance. Das Foto auch nicht.', 'They had no chance. Neither did the photo.'])] },
        { need: 'grimasse', bg: 'hafen', icon: 'chest', lines: [['B', 'Niemand erkennt dich. Nicht mal die Marine.', 'Nobody recognises you. Not even the marines.'], ['A', 'Endlich in Ruhe einkaufen!', 'Finally, shopping in peace!']],
          choices: [C(['Einkaufsbummel', 'Shopping trip'], ['+20 Berry, Crew heilt 15 %', '+20 Berry, crew heals 15%'], { berry: 20, heal: 0.15 }, ['Ihr bekommt sogar Rabatt. „Für den Herrn mit dem lustigen Gesicht.“', 'You even get a discount. “For the gentleman with the funny face.”'])] },
        { bg: 'hafen', icon: 'elite', lines: [['B', 'Das Foto ist … okay.', 'The photo is… okay.'], ['A', 'Okay ist gut. Okay ist ehrlich.', 'Okay is good. Okay is honest.']],
          choices: [C(['Weiter', 'Onwards'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Ein durchschnittlicher Steckbrief für einen überdurchschnittlichen Piraten.', 'An average poster for an above-average pirate.'])] }
      ] }
    ] },
    { id: 'wette', icon: 'chest', title: ['Die große Wette', 'The big bet'], parts: [
      { bg: 'hafen', icon: 'chest', lines: [['kalle', 'KRAA! Ich wette, ihr seid nicht vor mir an der nächsten Bucht!', 'KRAA! I bet you won’t reach the next bay before me!'], ['A', 'Gegen eine Möwe? Angenommen!', 'Against a gull? You’re on!']],
        choices: [C(['Wette annehmen', 'Take the bet'], ['Einsatz: -5 Gold', 'Stake: -5 gold'], { gold: -5 }, ['Kalle fliegt los. Er schummelt schon beim Start.', 'Kalle takes off. He is cheating from the start.'], 'wette'),
          C(['Ablehnen', 'Decline'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Kalle nennt euch Feiglinge. Mit Flügelgeste.', 'Kalle calls you cowards. With a wing gesture.'])] },
      { bg: 'schiff', icon: 'map', lines: [['B', 'Gegenwind! Wenn wir die Segel voll setzen, reißen sie vielleicht.', 'Headwind! If we set full sail, they might rip.'], ['A', 'Vielleicht heißt: vielleicht nicht!', 'Might means: might not!']],
        choices: [C(['Volle Segel', 'Full sail'], ['-10 % Leben', '-10% HP'], { hurt: 0.1 }, ['Das Schiff fliegt fast. Die Segel halten. Gerade so.', 'The ship almost flies. The sails hold. Barely.'], 'eile'),
          C(['Vorsichtig', 'Careful'], ['Crew heilt 10 %', 'Crew heals 10%'], { heal: 0.1 }, ['Langsam, aber alle Teile des Schiffs sind noch dran.', 'Slow, but all parts of the ship are still attached.'])] },
      { variants: [
        { need: 'eile', bg: 'hafen', icon: 'chest', lines: [['kalle', 'KRAA?! Ihr seid VOR mir da? Das ist unmöglich!', 'KRAA?! You got here BEFORE me? Impossible!'], ['A', 'Wir hatten Rückenwind. Also, Gegenwind. Egal!', 'We had tailwind. I mean headwind. Whatever!']],
          choices: [C(['Gewinn einstreichen', 'Collect the winnings'], ['+30 Berry, bis zum Ende der Insel: Ganze Crew +1 Tempo', '+30 Berry, until the island ends: whole crew +1 speed'], { berry: 30, temp: { stat: 'spd', value: 1 } }, ['Die Crew ist im Siegesrausch. Und sehr schnell.', 'The crew is on a winning streak. And very fast.'])] },
        { need: 'wette', bg: 'hafen', icon: 'chest', lines: [['kalle', 'KRAA! Erster! Natürlich. Ich bin eine Möwe.', 'KRAA! First! Of course. I am a gull.'], ['A', 'Du bist direkt geflogen! Wir mussten um eine Insel!', 'You flew straight! We had to go around an island!']],
          choices: [C(['Fair verlieren', 'Lose gracefully'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Kalle kauft von eurem Einsatz Fisch. Für alle. Fast fair.', 'Kalle buys fish with your stake. For everyone. Almost fair.'])] },
        { bg: 'hafen', icon: 'map', lines: [['kalle', 'Feiglinge sind auch Leute. Hier, Neuigkeiten.', 'Cowards are people too. Here, news.'], ['A', 'Danke, Kalle.', 'Thanks, Kalle.']],
          choices: [C(['Lesen', 'Read'], ['+10 Erfahrung, +6 Gold', '+10 XP, +6 gold'], { xp: 10, gold: 6 }, ['In der Zeitung steht, dass ihr Feiglinge seid. Mit Foto.', 'The paper says you are cowards. With a photo.'])] }
      ] }
    ] }
  ];

  // Folgen-Teile als eigene Einträge, damit Anzeige und Auswahl wie bei normalen Zwischen-Events laufen
  const parts = [];
  EP.forEach(ep => ep.parts.forEach((p, k) => {
    const base = { bg: 'schiff', icon: ep.icon, title: ep.title, ep: ep.id, part: k + 1 };
    if (p.variants) p.variants.forEach((v, j) => parts.push(Object.assign({}, base, v, { id: `ep-${ep.id}-${k + 1}-${v.need || 'x'}` })));
    else parts.push(Object.assign({}, base, p, { id: `ep-${ep.id}-${k + 1}` }));
  }));
  GL.data.crewEpisodes = EP.map(ep => ({ id: ep.id, title: ep.title, icon: ep.icon,
    third: (ep.parts[2].variants || []).map(v => ({ need: v.need || null, id: `ep-${ep.id}-3-${v.need || 'x'}` })) }));
  GL.data.crewEvents = (GL.data.crewEvents || []).concat(more, parts);
})();
