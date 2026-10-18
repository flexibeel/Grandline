// Noch mehr Zwischen-Events und drei weitere Folgen (Format wie js/data/events3.js).
//   Sprecher: 'A' (Kapitän), 'B' (jemand aus der Crew), 'kalle' oder eine Crew-ID (dann prüft when(run), ob sie an Bord ist).
//   Effekte nur über vorhandene applyOutcome-Typen: gold, heal, hurt, xp, points, berry, crit, buffAll, temp, relic, chance/win/lose.
window.GL = window.GL || {};
GL.data = GL.data || {};

(function () {
  const on = id => run => (run.crew || []).some(u => u.id === id && u.hp > 0);
  const gold = n => run => (run.gold || 0) >= n;
  const C = (l, h, outcome, t, flag) => Object.assign({ label: l, hint: h, outcome, text: t }, flag ? { flag } : {});

  const more = [
    { id: 'ce4-flaschenkind', bg: 'hafen', icon: 'map', title: ['Ein Kind mit Schatzkarte', 'A kid with a treasure map'],
      lines: [['B', 'Ein Kind verkauft Schatzkarten. Selbst gemalt. Mit Buntstift.', 'A kid is selling treasure maps. Hand-drawn. In crayon.'], ['A', 'Die Insel hat ein Gesicht. Das ist ein gutes Zeichen.', 'The island has a face. That is a good sign.']],
      choices: [C(['Karte kaufen', 'Buy the map'], ['-6 Gold, 50 %: Schatz', '-6 gold, 50%: treasure'], { gold: -6, chance: 0.5, win: { relic: 0 }, lose: { xp: 6 } }, ['Das X war ein Kaugummi. Darunter lag trotzdem etwas.', 'The X was chewing gum. Something was still underneath.']),
        C(['Ein Bild zurückmalen', 'Draw one back'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Das Kind gibt euch zwei von fünf Sternen. Ehrlich ist es.', 'The kid gives you two stars out of five. Honest, at least.'])] },
    { id: 'ce4-zollamt', bg: 'hafen', icon: 'elite', title: ['Das Zollamt', 'Customs'],
      lines: [['B', 'Hier steht: „Piraten zahlen doppelt.“', 'It says here: “Pirates pay double.”'], ['A', 'Wir sind keine Piraten. Wir sind … Gäste mit Flagge.', 'We are not pirates. We are… guests with a flag.']],
      choices: [C(['Brav zahlen', 'Pay politely'], ['-8 Gold, Kapitän +1 Statuspunkt', '-8 gold, captain +1 stat point'], { gold: -8, points: 1 }, ['Der Beamte ist so überrascht, dass er euch einen Stempel schenkt. Er ist schwer.', 'The clerk is so surprised he gives you a stamp. It is heavy.']),
        C(['Durchschleichen', 'Sneak through'], ['55 %: +12 Gold, sonst -10 % Leben', '55%: +12 gold, else -10% HP'], { chance: 0.55, win: { gold: 12 }, lose: { hurt: 0.1 } }, ['Unter dem Schlagbaum durch. Mit Würde. Fast.', 'Under the barrier. With dignity. Almost.'])], when: gold(8) },
    { id: 'ce4-zorro-tuer', bg: 'insel', icon: 'map', title: ['Zorro sucht die Toilette', 'Zoro looks for the toilet'],
      lines: [['zorro', 'Ich bin gleich wieder da.', 'I’ll be right back.'], ['A', 'Das sagt er seit zwei Inseln.', 'He has been saying that for two islands.']],
      choices: [C(['Suchtrupp losschicken', 'Send a search party'], ['+12 Erfahrung, -6 % Leben', '+12 XP, -6% HP'], { xp: 12, hurt: 0.06 }, ['Ihr findet ihn auf einem Baum. Er sagt, das war die Abkürzung.', 'You find him in a tree. He says it was the shortcut.']),
        C(['Warten und Tee trinken', 'Wait and drink tea'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Er kommt von der anderen Seite zurück. Mit einem Wildschwein. Fragen unerwünscht.', 'He comes back from the other side. With a boar. No questions.'])], when: on('zorro') },
    { id: 'ce4-nami-zinsen', bg: 'schiff', icon: 'chest', title: ['Namis Zinsrechnung', 'Nami’s interest maths'],
      lines: [['nami', 'Ihr schuldet mir noch Geld. Mit Zinsen.', 'You still owe me money. With interest.'], ['A', 'Wie viel?', 'How much?'], ['nami', 'Mehr als gestern.', 'More than yesterday.']],
      choices: [C(['Zahlen', 'Pay'], ['-10 Gold, alle +4 % Krit (Nami gut gelaunt)', '-10 gold, all +4% crit (Nami in a good mood)'], { gold: -10, crit: 0.04 }, ['Nami summt. Das Wetter wird sofort besser.', 'Nami hums. The weather improves at once.']),
        C(['Ausreden finden', 'Make excuses'], ['+8 Erfahrung, -8 % Leben', '+8 XP, -8% HP'], { xp: 8, hurt: 0.08 }, ['Die Ausrede war kreativ. Die Beule auch.', 'The excuse was creative. So is the bump.'])], when: run => on('nami')(run) && gold(10)(run) },
    { id: 'ce4-sanji-markt', bg: 'kueche', icon: 'rest', title: ['Sanji auf dem Fischmarkt', 'Sanji at the fish market'],
      lines: [['sanji', 'Dieser Thunfisch hat eine Seele. Ich spüre es.', 'This tuna has a soul. I can feel it.'], ['A', 'Hat er auch Geschmack?', 'Does it also have flavour?']],
      choices: [C(['Festmahl kochen', 'Cook a feast'], ['-6 Gold, Crew heilt 30 %', '-6 gold, crew heals 30%'], { gold: -6, heal: 0.3 }, ['Die Seele schmeckt nach Zitrone. Alle weinen ein bisschen.', 'The soul tastes of lemon. Everyone cries a little.']),
        C(['Vorräte für später', 'Supplies for later'], ['alle +3 Leben', 'all +3 HP'], { buffAll: { stat: 'hp', value: 3 } }, ['Eingelegt, getrocknet, beschriftet. Sanji hat Etiketten.', 'Pickled, dried, labelled. Sanji has labels.'])], when: on('sanji') },
    { id: 'ce4-brook-oper', bg: 'nacht', icon: 'rest', title: ['Brooks Mitternachtsoper', 'Brook’s midnight opera'],
      lines: [['brook', 'Ich habe eine Oper geschrieben. Sie dauert sieben Stunden.', 'I have written an opera. It lasts seven hours.'], ['A', 'Gibt es eine Pause?', 'Is there an intermission?'], ['brook', 'Ich habe keine Blase. Also nein.', 'I have no bladder. So no.']],
      choices: [C(['Ganz zuhören', 'Listen to all of it'], ['Kapitän +1 Statuspunkt, +10 Erfahrung', 'captain +1 stat point, +10 XP'], { points: 1, xp: 10 }, ['Im dritten Akt wird geweint. Im siebten geschlafen.', 'In act three there are tears. In act seven, sleep.']),
        C(['Nur die Ouvertüre', 'Only the overture'], ['Crew heilt 12 %', 'Crew heals 12%'], { heal: 0.12 }, ['Brook ist nicht beleidigt. Er hat ja auch keine Gefühle. Doch, hat er.', 'Brook is not offended. He has no feelings, after all. Yes he does.'])], when: on('brook') },
    { id: 'ce4-chopper-arzt', bg: 'hafen', icon: 'rest', title: ['Choppers Sprechstunde', 'Chopper’s office hours'],
      lines: [['chopper', 'Ich habe eine Praxis eröffnet! Für einen Nachmittag.', 'I opened a practice! For one afternoon.'], ['B', 'Die Schlange reicht bis zum Hafen.', 'The queue reaches the harbour.']],
      choices: [C(['Erst die Crew', 'Crew first'], ['Crew heilt 25 %', 'Crew heals 25%'], { heal: 0.25 }, ['Pflaster für alle. Auch für die, die nur Hunger hatten.', 'Plasters for everyone. Even for those who were just hungry.']),
        C(['Die Stadt behandeln', 'Treat the town'], ['+16 Gold, +6 Erfahrung', '+16 gold, +6 XP'], { gold: 16, xp: 6 }, ['Der Bürgermeister zahlt in Münzen und Kuchen. Chopper nimmt den Kuchen.', 'The mayor pays in coins and cake. Chopper takes the cake.'])], when: on('chopper') },
    { id: 'ce4-robin-ruine', bg: 'insel', icon: 'map', title: ['Robin liest eine Wand', 'Robin reads a wall'],
      lines: [['robin', 'Diese Inschrift ist tausend Jahre alt. Sie warnt vor … dem Mittagessen.', 'This inscription is a thousand years old. It warns against… lunch.'], ['A', 'Unsinn. Mittagessen ist nie gefährlich.', 'Nonsense. Lunch is never dangerous.']],
      choices: [C(['Weiterlesen', 'Keep reading'], ['+18 Erfahrung', '+18 XP'], { xp: 18 }, ['Der Rest der Inschrift ist ein Rezept. Ein sehr altes.', 'The rest of the inscription is a recipe. A very old one.']),
        C(['Hinter der Wand graben', 'Dig behind the wall'], ['50 %: Schatz, sonst -10 % Leben', '50%: treasure, else -10% HP'], { chance: 0.5, win: { relic: 0 }, lose: { hurt: 0.1 } }, ['Die Wand war tragend. Lernt man so.', 'The wall was load-bearing. You live and learn.'])], when: on('robin') },
    { id: 'ce4-franky-kanone', bg: 'schiff', icon: 'battle', title: ['Frankys neuer Knopf', 'Franky’s new button'],
      lines: [['franky', 'Ich habe einen Knopf eingebaut. Ich weiß nicht mehr, was er macht.', 'I built in a button. I forgot what it does.'], ['A', 'Drücken!', 'Press it!']],
      choices: [C(['Drücken', 'Press it'], ['50 %: alle +1 Angriff, sonst -10 % Leben', '50%: all +1 attack, else -10% HP'], { chance: 0.5, win: { buffAll: { stat: 'atk', value: 1 } }, lose: { hurt: 0.1 } }, ['Es war eine Kanone. Oder ein Toaster. Es hat geknallt.', 'It was a cannon. Or a toaster. It went bang.']),
        C(['Lieber beschriften', 'Label it instead'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['„NICHT DRÜCKEN“. Ruffy hat es trotzdem gelesen. Und gedrückt.', '“DO NOT PRESS”. Luffy read it anyway. And pressed.'])], when: on('franky') },
    { id: 'ce4-lysop-held', bg: 'insel', icon: 'battle', title: ['Lysops Heldentat', 'Usopp’s heroic deed'],
      lines: [['lysop', 'Ich habe eben eine ganze Armee vertrieben! Alleine!', 'I just drove off an entire army! Alone!'], ['B', 'Es war ein Hase.', 'It was a rabbit.'], ['lysop', 'Ein Armee-Hase.', 'An army rabbit.']],
      choices: [C(['Applaudieren', 'Applaud'], ['alle +3 % Krit (Moral)', 'all +3% crit (morale)'], { crit: 0.03 }, ['Lysop steht drei Zentimeter größer. Den Rest des Tages.', 'Usopp stands three centimetres taller. For the rest of the day.']),
        C(['Den Hasen fragen', 'Ask the rabbit'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Der Hase sagt nichts. Aber er nickt. Lysop nickt zurück.', 'The rabbit says nothing. But it nods. Usopp nods back.'])], when: on('lysop') },
    { id: 'ce4-flohmarkt', bg: 'hafen', icon: 'chest', title: ['Flohmarkt am Kai', 'Flea market on the quay'],
      lines: [['B', 'Ein Stand verkauft „echte Schwerter berühmter Piraten“.', 'A stall sells “real swords of famous pirates”.'], ['A', 'Das hier ist ein Löffel.', 'This one is a spoon.'], ['B', 'Ein berühmter Löffel.', 'A famous spoon.']],
      choices: [C(['Wühlen', 'Rummage'], ['-5 Gold, 40 %: Schatz, sonst +6 Erfahrung', '-5 gold, 40%: treasure, else +6 XP'], { gold: -5, chance: 0.4, win: { relic: 0 }, lose: { xp: 6 } }, ['Ganz unten, unter den Löffeln: etwas Echtes.', 'At the very bottom, under the spoons: something real.']),
        C(['Eigenen Kram verkaufen', 'Sell your own junk'], ['+10 Gold', '+10 gold'], { gold: 10 }, ['Jemand kauft eure alten Socken. Ihr fragt nicht, wofür.', 'Someone buys your old socks. You do not ask what for.'])], when: gold(5) },
    { id: 'ce4-sternschnuppe', bg: 'nacht', icon: 'rest', title: ['Sternschnuppen', 'Shooting stars'],
      lines: [['B', 'Sternschnuppen! Wünscht euch was!', 'Shooting stars! Make a wish!'], ['A', 'Ich wünsche mir Fleisch.', 'I wish for meat.'], ['B', 'Laut sagen bringt Unglück.', 'Saying it out loud brings bad luck.']],
      choices: [C(['Still wünschen', 'Wish quietly'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Am nächsten Morgen liegt ein Schinken an Deck. Niemand gibt es zu.', 'Next morning there is a ham on deck. Nobody admits it.']),
        C(['Sterne zählen', 'Count stars'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Bei 412 schläft die halbe Crew. Bei 413 der Rest.', 'At 412 half the crew is asleep. At 413 the rest.'])] },
    { id: 'ce4-meerjungfrau', bg: 'schiff', icon: 'recruit', title: ['Eine Meerjungfrau fragt nach dem Weg', 'A mermaid asks for directions'],
      lines: [['B', 'Sie sucht die Fischmenscheninsel.', 'She is looking for Fishman Island.'], ['A', 'Wir auch! Irgendwann. Unten, glaube ich.', 'So are we! Eventually. Down, I think.']],
      choices: [C(['Karte zeigen', 'Show the map'], ['alle +1 Tempo', 'all +1 speed'], { buffAll: { stat: 'spd', value: 1 } }, ['Sie zeigt euch eine Strömung. Das Schiff gleitet.', 'She shows you a current. The ship glides.']),
        C(['Ein Stück begleiten', 'Escort her a bit'], ['+14 Gold', '+14 gold'], { gold: 14 }, ['Sie bedankt sich mit Perlen. Und einem sehr lauten Lied.', 'She thanks you with pearls. And a very loud song.'])] },
    { id: 'ce4-leere-insel', bg: 'insel', icon: 'map', title: ['Eine Insel, die zu klein ist', 'An island that is too small'],
      lines: [['B', 'Eine Palme. Ein Stein. Ein Mann.', 'One palm. One rock. One man.'], ['A', 'Hallo, Mann!', 'Hello, man!'], ['B', 'Er sagt, er wartet seit zwölf Jahren auf ein Schiff. Aber nicht auf unseres.', 'He says he has waited twelve years for a ship. Just not ours.']],
      choices: [C(['Mitnehmen anbieten', 'Offer a ride'], ['Kapitän +1 Statuspunkt', 'captain +1 stat point'], { points: 1 }, ['Er lehnt ab und schenkt euch seinen besten Ratschlag: „Nicht hier stranden.“', 'He declines and gives you his best advice: “Don’t get stranded here.”']),
        C(['Kokosnüsse tauschen', 'Trade coconuts'], ['Crew heilt 12 %, +4 Gold', 'Crew heals 12%, +4 gold'], { heal: 0.12, gold: 4 }, ['Er hat genau eine Kokosnuss. Ihr bekommt sie. Er weint ein bisschen.', 'He has exactly one coconut. You get it. He cries a little.'])] },
    { id: 'ce4-kopfgeld-rabatt', bg: 'hafen', icon: 'elite', title: ['Ein Kopfgeldjäger im Ruhestand', 'A retired bounty hunter'],
      lines: [['B', 'Der alte Mann sagt, er hätte dich früher gefangen.', 'The old man says he would have caught you back in the day.'], ['A', 'Früher war ich drei.', 'Back in the day I was three.']],
      choices: [C(['Tipps anhören', 'Listen to tips'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff', 'until the island ends: whole crew +1 attack'], { temp: { stat: 'atk', value: 1 } }, ['„Immer zuerst die Hinterleute.“ Er zwinkert. Er hat ein Glasauge.', '“Always the back row first.” He winks. He has a glass eye.']),
        C(['Ein Bier ausgeben', 'Buy him a drink'], ['-4 Gold, +14 Erfahrung', '-4 gold, +14 XP'], { gold: -4, xp: 14 }, ['Die Geschichten werden mit jedem Glas wilder. Zwei davon waren wahr.', 'The stories get wilder with every glass. Two of them were true.'])], when: gold(4) }
  ];

  const EP = [
    { id: 'kochduell', icon: 'rest', title: ['Das Kochduell von Loguetown', 'The Loguetown cook-off'], parts: [
      { bg: 'kueche', icon: 'rest', lines: [['B', 'Ein Kochwettbewerb! Preis: ein goldener Kochlöffel.', 'A cooking contest! Prize: a golden ladle.'], ['A', 'Wir melden uns an. Ich esse, ihr kocht.', 'We sign up. I eat, you cook.']],
        choices: [C(['Mit Fleisch antreten', 'Compete with meat'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Die Jury notiert: „Mutig. Viel. Roh?“', 'The jury notes: “Bold. Lots. Raw?”'], 'fleisch'),
          C(['Mit Gemüse antreten', 'Compete with vegetables'], ['Crew heilt 10 %', 'Crew heals 10%'], { heal: 0.1 }, ['Ruffy spricht nicht mehr mit euch. Die Jury schon.', 'Luffy is not speaking to you. The jury is.'], 'gemuese')] },
      { bg: 'kueche', icon: 'rest', lines: [['B', 'Der Favorit hat Salz in unseren Zucker getan.', 'The favourite put salt in our sugar.'], ['A', 'Dann wird es eben ein salziger Kuchen. Mutig ist gut.', 'Then it is a salty cake. Bold is good.']],
        choices: [C(['Sabotage zurückgeben', 'Sabotage back'], ['+8 Gold', '+8 gold'], { gold: 8 }, ['Ihr vertauscht seine Gewürze. Er kocht jetzt etwas Neues. Es ist grün.', 'You swap his spices. He is now cooking something new. It is green.'], 'fies'),
          C(['Fair bleiben', 'Play fair'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Der salzige Kuchen ist … interessant. Die Jury nickt langsam.', 'The salty cake is… interesting. The jury nods slowly.'])] },
      { variants: [
        { need: 'fies', bg: 'kueche', icon: 'battle', lines: [['B', 'Der Favorit hat es gemerkt. Er hat ein Nudelholz.', 'The favourite noticed. He has a rolling pin.'], ['A', 'Wir haben einen Bösewicht vor uns. Das hier ist Aufwärmen.', 'We have a villain ahead. This is a warm-up.']],
          choices: [C(['Wegrennen mit Pokal', 'Run with the trophy'], ['bis zum Ende der Insel: Ganze Crew +1 Tempo, -8 % Leben', 'until the island ends: whole crew +1 speed, -8% HP'], { temp: { stat: 'spd', value: 1 }, hurt: 0.08 }, ['Der Löffel ist nicht aus Gold. Aber ihr seid sehr schnell.', 'The ladle is not gold. But you are very fast.'])] },
        { need: 'gemuese', bg: 'kueche', icon: 'chest', lines: [['B', 'Gewonnen! Mit Gemüse! Die Jury war Vegetarier.', 'We won! With vegetables! The jury was vegetarian.'], ['A', 'Ich habe nie wieder Hunger. Das ist gelogen.', 'I will never be hungry again. That is a lie.']],
          choices: [C(['Siegermahl', 'Victory meal'], ['bis zum Ende der Insel: Ganze Crew +4 Leben, +10 Gold', 'until the island ends: whole crew +4 HP, +10 gold'], { temp: { stat: 'hp', value: 4 }, gold: 10 }, ['Gemüse macht stark. Ruffy schweigt dazu.', 'Vegetables make you strong. Luffy says nothing.'])] },
        { bg: 'kueche', icon: 'rest', lines: [['B', 'Platz drei. Hinter einer Großmutter und einem Hund.', 'Third place. Behind a grandmother and a dog.'], ['A', 'Der Hund hat geschummelt.', 'The dog cheated.']],
          choices: [C(['Trostpreis', 'Consolation prize'], ['Crew heilt 15 %, +10 Erfahrung', 'Crew heals 15%, +10 XP'], { heal: 0.15, xp: 10 }, ['Der Trostpreis ist Suppe. Gute Suppe.', 'The consolation prize is soup. Good soup.'])] }
      ] }
    ] },
    { id: 'muschel', icon: 'elite', title: ['Die verfluchte Muschel', 'The cursed shell'], parts: [
      { bg: 'insel', icon: 'elite', lines: [['B', 'Diese Muschel flüstert.', 'This shell whispers.'], ['A', 'Was sagt sie?', 'What does it say?'], ['B', '„Nimm mich mit.“ Sehr höflich für einen Fluch.', '“Take me with you.” Very polite for a curse.']],
        choices: [C(['Mitnehmen', 'Take it'], ['+10 Gold', '+10 gold'], { gold: 10 }, ['Sie fühlt sich warm an. Das ist bei Muscheln ungewöhnlich.', 'It feels warm. That is unusual for shells.'], 'muschel'),
          C(['Liegen lassen', 'Leave it'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Die Muschel flüstert beleidigt weiter.', 'The shell keeps whispering, offended.'])] },
      { bg: 'nacht', icon: 'elite', lines: [['B', 'Jemand hat die ganze Nacht gesungen. Es war niemand von uns.', 'Someone sang all night. It was none of us.'], ['A', 'Vielleicht die Muschel. Oder Brook.', 'Maybe the shell. Or Brook.']],
        choices: [C(['Ins Meer werfen', 'Throw it into the sea'], ['Crew heilt 12 %', 'Crew heals 12%'], { heal: 0.12 }, ['Platsch. Das Singen hört auf. Fast enttäuschend.', 'Splash. The singing stops. Almost disappointing.'], 'weg'),
          C(['Mitsingen', 'Sing along'], ['alle +3 % Krit', 'all +3% crit'], { crit: 0.03 }, ['Die Muschel kann zweistimmig. Ihr jetzt auch.', 'The shell can harmonise. Now so can you.'], 'lied')] },
      { variants: [
        { need: 'lied', bg: 'schiff', icon: 'chest', lines: [['B', 'Die Muschel hat sich geöffnet. Da ist eine Perle drin. Sie singt auch.', 'The shell has opened. There is a pearl inside. It sings too.'], ['A', 'Wir sind jetzt eine Band.', 'We are a band now.']],
          choices: [C(['Die Perle behalten', 'Keep the pearl'], ['seltener Schatz', 'rare treasure'], { relic: 1 }, ['Der Fluch war nur Einsamkeit. Und Talent.', 'The curse was just loneliness. And talent.'])] },
        { need: 'muschel', bg: 'nacht', icon: 'elite', lines: [['B', 'Die Muschel ist schwerer geworden. Und sie flüstert jetzt Rechnungen.', 'The shell got heavier. And now it whispers bills.'], ['A', 'Vielleicht gehört sie Nami.', 'Maybe it belongs to Nami.']],
          choices: [C(['Fluch tragen', 'Bear the curse'], ['bis zum Ende der Insel: Ganze Crew -1 Tempo, +12 Gold', 'until the island ends: whole crew -1 speed, +12 gold'], { temp: { stat: 'spd', value: -1 }, gold: 12 }, ['Schwer, aber lukrativ. Typisch Fluch.', 'Heavy, but lucrative. Typical curse.'])] },
        { bg: 'schiff', icon: 'map', lines: [['B', 'Keine Muschel, kein Fluch, kein Gesang.', 'No shell, no curse, no singing.'], ['A', 'Ich vermisse sie ein bisschen.', 'I miss it a little.']],
          choices: [C(['Weiter', 'Onwards'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Abends summt trotzdem jemand. Niemand gibt es zu.', 'In the evening someone hums anyway. Nobody admits it.'])] }
      ] }
    ] },
    { id: 'leuchtturm', icon: 'map', title: ['Der Leuchtturmwärter', 'The lighthouse keeper'], parts: [
      { bg: 'nacht', icon: 'map', lines: [['B', 'Der Leuchtturm ist aus. Und der Wärter schläft.', 'The lighthouse is dark. And the keeper is asleep.'], ['A', 'Dann wecken wir ihn. Laut.', 'Then we wake him. Loudly.']],
        choices: [C(['Wecken', 'Wake him'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['Er wacht auf, sieht euch und schläft sofort wieder ein. Ein Profi.', 'He wakes, sees you and falls asleep again at once. A professional.'], 'geweckt'),
          C(['Selbst anzünden', 'Light it yourselves'], ['-6 % Leben', '-6% HP'], { hurt: 0.06 }, ['Die Treppe hat 300 Stufen. Die Lampe einen Wackelkontakt.', 'The stairs have 300 steps. The lamp a loose contact.'], 'licht')] },
      { bg: 'nacht', icon: 'map', lines: [['B', 'Ein Schiff im Dunkeln steuert auf die Klippen zu!', 'A ship in the dark is heading for the cliffs!'], ['A', 'Dann Licht! Oder sehr laut rufen!', 'Then light! Or shout very loudly!']],
        choices: [C(['Spiegel drehen', 'Turn the mirror'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Das Schiff dreht ab. An Bord jubelt jemand. Oder er schimpft.', 'The ship turns away. Someone on board cheers. Or swears.'], 'gerettet'),
          C(['Rufen', 'Shout'], ['50 %: +12 Gold, sonst -8 % Leben', '50%: +12 gold, else -8% HP'], { chance: 0.5, win: { gold: 12 }, lose: { hurt: 0.08 } }, ['Ruffy ruft so laut, dass die Klippe erschrickt.', 'Luffy shouts so loudly the cliff gets a fright.'])] },
      { variants: [
        { need: 'gerettet', bg: 'hafen', icon: 'chest', lines: [['B', 'Das gerettete Schiff gehört einem Händler. Er will sich bedanken.', 'The rescued ship belongs to a merchant. He wants to say thanks.'], ['A', 'Mit Fleisch?', 'With meat?'], ['B', 'Mit Waffen.', 'With weapons.']],
          choices: [C(['Dank annehmen', 'Accept the thanks'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff, +10 Gold', 'until the island ends: whole crew +1 attack, +10 gold'], { temp: { stat: 'atk', value: 1 }, gold: 10 }, ['Gute Klingen. Und ein Gutschein für Fleisch. Er hat zugehört.', 'Good blades. And a meat voucher. He listened.'])] },
        { need: 'licht', bg: 'nacht', icon: 'rest', lines: [['B', 'Der Wärter ist aufgewacht und bietet uns Tee an. Er ist gerührt.', 'The keeper woke up and offers us tea. He is touched.'], ['A', 'Tee ist fast so gut wie Fleisch.', 'Tea is almost as good as meat.']],
          choices: [C(['Tee trinken', 'Drink tea'], ['Crew heilt 20 %, Kapitän +1 Statuspunkt', 'Crew heals 20%, captain +1 stat point'], { heal: 0.2, points: 1 }, ['Er erzählt von jedem Schiff, das er je gesehen hat. Es waren viele.', 'He tells you about every ship he ever saw. There were many.'])] },
        { bg: 'nacht', icon: 'map', lines: [['B', 'Der Leuchtturm brennt wieder. Alles ruhig.', 'The lighthouse burns again. All quiet.'], ['A', 'Gute Nacht, Leuchtturm.', 'Good night, lighthouse.']],
          choices: [C(['Weiter', 'Onwards'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Das Licht folgt euch noch lange über das Wasser.', 'The light follows you across the water for a long time.'])] }
      ] }
    ] }
  ];

  const parts = [];
  EP.forEach(ep => ep.parts.forEach((p, k) => {
    const base = { bg: 'schiff', icon: ep.icon, title: ep.title, ep: ep.id, part: k + 1 };
    if (p.variants) p.variants.forEach(v => parts.push(Object.assign({}, base, v, { id: `ep-${ep.id}-${k + 1}-${v.need || 'x'}` })));
    else parts.push(Object.assign({}, base, p, { id: `ep-${ep.id}-${k + 1}` }));
  }));
  GL.data.crewEpisodes = (GL.data.crewEpisodes || []).concat(EP.map(ep => ({ id: ep.id, title: ep.title, icon: ep.icon,
    third: (ep.parts[2].variants || []).map(v => ({ need: v.need || null, id: `ep-${ep.id}-3-${v.need || 'x'}` })) })));
  GL.data.crewEvents = (GL.data.crewEvents || []).concat(more, parts);
})();
