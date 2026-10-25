// F1 Wiedersehen mit Bekannten (claude/PLAN-WELT-MERKT.md Abschnitt 3 und 6).
// Kommt eine Folge dran, die man schon einmal erlebt hat, läuft statt der drei Teile EIN Wiedersehen,
// passend zum alten Ende (GL.gedaechtnis.kennt). Höchstens ein Wiedersehen pro Fahrt.
// Format je Folge: [{ need: ['ende', ...], erinnert: [de, en], lines, choices }]
//   need     = welche alten Enden diese Szene auslösen (Flag der Teil-3-Variante, 'neutral', oder ein neues Ende aus merk)
//   erinnert = kurze Erinnerungs-Sprechblase über der Szene (was damals war)
//   merk     = an einer Wahl: so heißt das Ende danach (z. B. 'versoehnt'). Ohne merk bleibt das alte Ende.
// Sprecher 'bek:<id>' = Bekannte mit eigenem Gesicht (GL.data.bekannte, Looks aus dem Board „Bekannte der Grand Line“).
window.GL = window.GL || {};
GL.data = GL.data || {};

(function () {
  const C = (l, h, outcome, t, merk) => Object.assign({ label: l, hint: h, outcome, text: t }, merk ? { merk } : {});

  // Gesichter (Plan Abschnitt 7, Jan per Klick 23.10.). klein = im Spiel kleiner zeichnen, geist = durchscheinend
  GL.data.bekannte = {
    korken: { name: ['Kapitän Korken', 'Captain Cork'], klein: true,
      look: { hat: 'band', hatColor: '#e0483b', shirt: '#e8c25a', pants: '#4a3a2a', hair: '#3a2a20', acc: 'brille', skin: '#f2c9a0' } },
    waerter: { name: ['Der Leuchtturmwärter', 'The lighthouse keeper'],
      look: { hat: 'cap', hatColor: '#2f6f9b', shirt: '#d9423a', pants: '#3a3a3a', hair: '#8a8a8a', beard: '#8a8a8a', acc: 'brille', skin: '#f2c9a0' } },
    nebel: { name: ['Der Nebelkapitän', 'The fog captain'], geist: true,
      look: { hat: 'hood', hatColor: '#a9bccf', shirt: '#a9bccf', pants: '#7e93a3', hair: '#ffffff', longHair: true, skin: '#dde9ee' } },
    haendler: { name: ['Der dankbare Händler', 'The grateful merchant'],
      look: { hat: 'hood', hatColor: '#7a3a9a', shirt: '#c9a23a', pants: '#3a2a4a', hair: '#1a1a1a', skin: '#c98a5a', acc: 'ohrring' } }
  };

  const W = {
    // Die Flaschenpost
    post: [
      { need: ['empfang', 'versoehnt'], bg: 'hafen', icon: 'elite',
        erinnert: ['Damals habt ihr Kapitän Korken einen sehr kleinen Kuchen gebacken.', 'Back then you baked Captain Cork a very small cake.'],
        lines: [['B', 'Ein Schiff, so groß wie ein Schuh, hupt freundlich.', 'A ship the size of a shoe honks politely.'],
          ['bek:korken', 'Ihr seid die mit dem Kuchen! Ich hab Verstärkung mitgebracht.', 'You are the cake people! I brought backup.'],
          ['B', 'Drei sehr kleine Matrosen salutieren.', 'Three very small sailors salute.']],
        choices: [C(['Mitsegeln lassen', 'Let them sail along'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff', 'until the island ends: whole crew +1 attack'], { temp: { stat: 'atk', value: 1 } }, ['Die kleinste Flotte der Welt fährt vorneweg. Sehr stolz. Sehr langsam.', 'The smallest fleet in the world leads the way. Very proud. Very slow.']),
          C(['Kuchen backen, wie damals', 'Bake a cake, like old times'], ['Crew heilt 20 %', 'Crew heals 20%'], { heal: 0.2 }, ['Diesmal ein größerer Kuchen. Korken passt fast hinein.', 'A bigger cake this time. Cork almost fits inside.'])] },
      { need: ['becher'], bg: 'hafen', icon: 'elite',
        erinnert: ['Damals habt ihr Kapitän Korkens Flasche als Becher benutzt.', 'Back then you used Captain Cork\'s bottle as a cup.'],
        lines: [['bek:korken', 'IHR! Die Becher-Leute!', 'YOU! The cup people!'],
          ['B', 'Er hat eine winzige Kanone dabei. Sie ist erstaunlich laut.', 'He has a tiny cannon. It is surprisingly loud.'],
          ['A', 'Wir können das erklären. Wir hatten Durst.', 'We can explain. We were thirsty.']],
        choices: [C(['Neue Flasche schenken', 'Gift him a new bottle'], ['-8 Gold, danach ist alles vergeben', '-8 gold, then all is forgiven'], { gold: -8 }, ['Korken zieht ein. Er sagt, die Aussicht ist besser als vorher.', 'Cork moves in. He says the view is better than before.'], 'versoehnt'),
          C(['Flüchten', 'Run for it'], ['bis zum Ende der Insel: Ganze Crew -1 Tempo', 'until the island ends: whole crew -1 speed'], { temp: { stat: 'spd', value: -1 } }, ['Ihr seid entkommen. Ein Kanonenkügelchen steckt noch im Ruder.', 'You got away. A tiny cannonball is still stuck in the rudder.'])] }
    ],
    // Der Leuchtturmwärter
    leuchtturm: [
      { need: ['licht'], bg: 'nacht', icon: 'rest',
        erinnert: ['Damals habt ihr das Licht im Leuchtturm selbst angezündet.', 'Back then you lit the lighthouse lamp yourselves.'],
        lines: [['B', 'Der Turm blinkt uns zu. Dreimal kurz.', 'The tower blinks at us. Three short flashes.'],
          ['bek:waerter', 'Ihr schon wieder! Der Tee ist noch warm. Seit damals.', 'You again! The tea is still warm. Since last time.']],
        choices: [C(['Anlegen auf Tee', 'Stop for tea'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Er hat ein neues Schiff zum Erzählen. Und dann noch eins.', 'He has a new ship to tell you about. And then another.']),
          C(['Zurückblinken', 'Blink back'], ['Schatz', 'treasure'], { relic: 0 }, ['Am Ufer liegt ein Bündel Strandgut. Daran ein Zettel: „Für euch.“', 'A bundle of flotsam waits on the shore. A note: “For you.”'])] },
      { need: ['gerettet'], bg: 'hafen', icon: 'chest',
        erinnert: ['Damals habt ihr mit dem Spiegel ein Händlerschiff vor den Klippen gerettet.', 'Back then you saved a merchant ship from the cliffs with the mirror.'],
        lines: [['B', 'Neben dem Leuchtturm steht jetzt ein Marktstand.', 'There is a market stall next to the lighthouse now.'],
          ['bek:haendler', 'Meine Retter! Für euch gibt es Freundschaftspreise. Nur heute. Eigentlich immer.', 'My rescuers! Friendship prices for you. Today only. Actually always.']],
        choices: [C(['Zuschlagen', 'Buy something'], ['-6 Gold, Schatz', '-6 gold, treasure'], { gold: -6, relic: 0 }, ['Er packt mehr ein, als ihr bezahlt habt, und zwinkert.', 'He wraps up more than you paid for, and winks.']),
          C(['Nur plaudern', 'Just chat'], ['+10 Erfahrung, +4 Gold', '+10 XP, +4 gold'], { xp: 10, gold: 4 }, ['Er schenkt euch eine Münze. „Für schlechte Zeiten.“', 'He gives you a coin. “For bad times.”'])] }
    ],
    // Das Nebelschiff
    geist: [
      { need: ['mutig', 'erloest'], bg: 'nacht', icon: 'chest',
        erinnert: ['Damals habt ihr im Proviantraum nachgesehen, als es klopfte.', 'Back then you checked the pantry when something knocked.'],
        lines: [['B', 'Aus dem Nebel ruft eine dünne Stimme.', 'A thin voice calls out of the fog.'],
          ['bek:nebel', 'Ihr! Ihr hattet keine Angst vor mir. Darf ich euch etwas zeigen?', 'You! You were not afraid of me. May I show you something?']],
        choices: [C(['Folgen', 'Follow him'], ['seltener Schatz, -10 % Leben', 'rare treasure, -10% HP'], { relic: 1, hurt: 0.1 }, ['Es ist ein Geisterschiff. Es ist zugig. Der Schatz ist echt.', 'It is a ghost ship. It is draughty. The treasure is real.']),
          C(['Lieber die Musik hören', 'Just listen to the music'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Er spielt euer Lied von damals. Ihr kennt es noch.', 'He plays your song from back then. You still know it.'])] },
      { need: ['geist'], bg: 'nacht', icon: 'elite',
        erinnert: ['Damals habt ihr das Nebelschiff geentert. Seitdem sind die Arme schwer.', 'Back then you boarded the fog ship. Arms have felt heavy ever since.'],
        lines: [['B', 'Die schweren Arme sind wieder da. Und der Nebel.', 'The heavy arms are back. And the fog.'],
          ['bek:nebel', 'Ihr habt mein Schiff betreten… und nie gegrüßt…', 'You stepped onto my ship… and never said hello…'],
          ['A', 'Hallo?', 'Hello?']],
        choices: [C(['Den Kapitän erlösen', 'Set the captain free'], ['+15 Erfahrung, der Fluch ist weg', '+15 XP, the curse is lifted'], { xp: 15 }, ['Ein ordentliches Hallo, eine Verbeugung. Der Nebel wird heller. Die Arme leichter.', 'A proper hello, a bow. The fog brightens. Arms feel lighter.'], 'erloest'),
          C(['Ignorieren', 'Ignore it'], ['bis zum Ende der Insel: Ganze Crew -1 Angriff', 'until the island ends: whole crew -1 attack'], { temp: { stat: 'atk', value: -1 } }, ['Der Nebel bleibt beleidigt. Die Arme auch.', 'The fog stays offended. So do the arms.'])] }
    ],
    // Das Zaubergewürz
    gewuerz: [
      { need: ['festmahl'], bg: 'kueche', icon: 'rest',
        erinnert: ['Damals habt ihr ein Festmahl mit einer Prise Zaubergewürz gekocht.', 'Back then you cooked a feast with a pinch of magic spice.'],
        lines: [['B', 'Der Händler vom Hafen winkt. Er hat ein neues Glas dabei. Es brummt im Takt.', 'The merchant from the harbour is waving. He brought a new jar. It hums in time.'],
          ['A', 'Ist das die Zunge, die ich damals nicht gespürt habe?', 'Is that the tongue I could not feel back then?']],
        choices: [C(['Wieder ein Festmahl', 'Another feast'], ['Crew heilt 15 %, -3 Gold', 'crew heals 15%, -3 gold'], { heal: 0.15, gold: -3 }, ['Die Küche brummt. Die Crew auch. Alle sind satt und ein bisschen warm.', 'The galley hums. So does the crew. Everyone is full and a little warm.']),
          C(['Nur riechen', 'Just sniff it'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Schon der Duft reicht für eine Geschichte. Die Crew erzählt sie bis Mitternacht.', 'The smell alone is worth a story. The crew tells it until midnight.'])] },
      { need: ['gewuerz'], bg: 'kueche', icon: 'fruit',
        erinnert: ['Damals hat der Kapitän das Gewürz pur gegessen und kurz Feuer gespuckt.', 'Back then the captain ate the spice straight and briefly breathed fire.'],
        lines: [['B', 'Du hast da etwas im Bart. Es glimmt.', 'You have something in your beard. It is glowing.'],
          ['A', 'Das ist nur Erinnerung. Eine sehr scharfe.', 'That is only memory. A very spicy one.']],
        choices: [C(['Nochmal probieren', 'Try it again'], ['40 %: +10 Gold, sonst -8 % Leben', '40%: +10 gold, else -8% HP'], { chance: 0.4, win: { gold: 10 }, lose: { hurt: 0.08 } }, ['Diesmal pustet die Möwe das Feuer aus. Dankbarkeit gibt es keine.', 'This time the gull blows out the fire. No gratitude was given.']),
          C(['Ein Glas Milch holen', 'Fetch a glass of milk'], ['Crew heilt 12 %', 'Crew heals 12%'], { heal: 0.12 }, ['Milch löscht alles. Auch den Stolz.', 'Milk puts out everything. Pride included.'])] }
    ],
    // Die lange Nacht
    party: [
      { need: ['tee'], bg: 'schiff', icon: 'rest',
        erinnert: ['Damals hat der Kräutertee den Kater nach dem Fest einfach weggebügelt.', 'Back then the herbal tea simply ironed out the hangover after the party.'],
        lines: [['B', 'Im Hafen ist schon wieder Fest. Und ich habe den Tee noch.', 'There is a party in the harbour again. And I still have the tea.'],
          ['A', 'Dann feiern wir klug. Das ist neu.', 'Then we party wisely. That is new.']],
        choices: [C(['Klug feiern', 'Party wisely'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Ihr geht um zwei, steht um sieben auf und seid sehr unausstehlich fröhlich.', 'You leave at two, get up at seven and are unbearably cheerful.']),
          C(['Tee verschenken', 'Give the tea away'], ['+7 Gold (Trinkgeld)', '+7 gold (tips)'], { gold: 7 }, ['Ganz Hafen hat morgen einen klaren Kopf. Der Wirt schenkt euch Trinkgeld.', 'The whole harbour has a clear head tomorrow. The innkeeper tips you.'])] },
      { need: ['party'], bg: 'schiff', icon: 'rest',
        erinnert: ['Damals wart ihr am Morgen danach alle verkatert, auch die Möwe.', 'Back then you were all hungover the morning after, even the gull.'],
        lines: [['kalle', 'Kraa… Ist das wieder das Fest? Mein Kopf erinnert sich.', 'Kraa… Is that the party again? My head remembers.'],
          ['B', 'Der Wirt hat deinen Tisch schon repariert. Er sagt, er kennt euch.', 'The innkeeper already fixed your table. He says he knows you.']],
        choices: [C(['Wieder durchfeiern', 'Party all night again'], ['Crew heilt 20 %, -6 % Leben', 'crew heals 20%, -6% HP'], { heal: 0.2, hurt: 0.06 }, ['Es geht besser als beim letzten Mal. Der Tisch hält. Der Stuhl nicht.', 'It goes better than last time. The table holds. The chair does not.']),
          C(['Nur ein Lied', 'Just one song'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Ein Lied wird drei. Dann ist es zwei Uhr. Aber ihr seid zumindest kein Wrack.', 'One song becomes three. Then it is two. But at least you are not wrecks.'])] }
    ],
    // Der verschwundene Kompass
    kompass: [
      { need: ['streit', 'versoehnt'], bg: 'schiff', icon: 'map',
        erinnert: ['Damals habt ihr euch gestritten, wer den Kompass gegessen hat.', 'Back then you argued about who ate the compass.'],
        lines: [['B', 'Der Kompass ist wieder da. Und er zeigt auf dich.', 'The compass is back. And it points at you.'],
          ['A', 'Er zeigt auf alle. Das ist ein Kompass.', 'It points at everyone. That is what compasses do.'],
          ['B', 'Nur wenn man zuhört. Ich wollte mich eigentlich entschuldigen.', 'Only if you listen. I actually wanted to apologise.']],
        choices: [C(['Entschuldigung annehmen', 'Accept the apology'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Eine Umarmung. Wieder unangenehm lang. Aber diesmal freiwillig.', 'A hug. Uncomfortably long again. But voluntary this time.'], 'versoehnt'),
          C(['Weiter schmollen', 'Keep sulking'], ['bis zum Ende der Insel: Ganze Crew -1 Tempo, +10 Erfahrung', 'until the island ends: whole crew -1 speed, +10 XP'], { temp: { stat: 'spd', value: -1 }, xp: 10 }, ['Schmollen macht langsam und erfahren. Beides wegen der Zeit.', 'Sulking makes you slow and experienced. Both because of the time.'])] },
      { need: ['suche'], bg: 'schiff', icon: 'map',
        erinnert: ['Damals habt ihr beim Suchen das ganze Schiff aufgeräumt.', 'Back then you tidied the whole ship while searching.'],
        lines: [['kalle', 'KRAA! Ich hab was im Nest gefunden. Eure Socken. Alle drei.', 'KRAA! I found something in my nest. Your socks. All three.'],
          ['A', 'Wir haben die ganze Welt gefunden, aber nie die Socken.', 'We found the whole world but never the socks.']],
        choices: [C(['Socken zurücknehmen', 'Take the socks back'], ['+8 Erfahrung, +4 Gold', '+8 XP, +4 gold'], { xp: 8, gold: 4 }, ['In einer Socke steckt eine Münze. Kalle schwört, er wüsste von nichts.', 'There is a coin in one sock. Kalle swears he knows nothing.']),
          C(['Kalle behalten lassen', 'Let Kalle keep them'], ['bis zum Ende der Insel: Ganze Crew +1 Tempo', 'until the island ends: whole crew +1 speed'], { temp: { stat: 'spd', value: 1 } }, ['Kalle ist gerührt. Er fliegt vor dem Schiff her und zeigt den Weg.', 'Kalle is moved. He flies ahead of the ship and shows the way.'])] }
    ],
    // Das Steckbrief-Foto
    foto: [
      { need: ['pose'], bg: 'hafen', icon: 'elite',
        erinnert: ['Damals hat sich der Kapitän in Heldenpose fotografieren lassen.', 'Back then the captain struck a heroic pose for the photo.'],
        lines: [['B', 'Ein Kind zeigt auf dich. Es macht deine Pose nach. Sehr schlecht.', 'A child points at you. It copies your pose. Very badly.'],
          ['A', 'Man muss die Hüfte vorschieben. Und den Blick in die Ferne.', 'You have to push your hip out. And gaze into the distance.']],
        choices: [C(['Posen-Unterricht geben', 'Give a posing lesson'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Eine halbe Stunde später posiert der halbe Hafen. Die Kronwacht fotografiert mit.', 'Half an hour later half the harbour is posing. The marines are taking photos too.']),
          C(['Autogramme verkaufen', 'Sell autographs'], ['+8 Gold, -6 % Leben', '+8 gold, -6% HP'], { gold: 8, hurt: 0.06 }, ['Der Andrang ist groß. Das Gedränge auch. Eine Hand kneift.', 'The crowd is huge. So is the crush. Someone pinches.'])] },
      { need: ['grimasse'], bg: 'hafen', icon: 'elite',
        erinnert: ['Damals habt ihr für den Steckbrief eine Grimasse gezogen.', 'Back then you pulled a face for the wanted poster.'],
        lines: [['kalle', 'KRAA! Dein Steckbrief hängt in der Taverne. Neben der Dartscheibe. Mitten drin.', 'KRAA! Your poster hangs in the tavern. Next to the dartboard. Right in the middle.'],
          ['A', 'Mitten im Gesicht oder mitten in der Scheibe?', 'Middle of the face or middle of the board?'],
          ['kalle', 'Ja.', 'Yes.']],
        choices: [C(['Mitspielen', 'Join the game'], ['50 %: +12 Gold, sonst -4 Gold', '50%: +12 gold, else -4 gold'], { chance: 0.5, win: { gold: 12 }, lose: { gold: -4 } }, ['Ihr trefft die Nase. Der Wirt zahlt aus. Die Nase wird signiert.', 'You hit the nose. The innkeeper pays out. The nose gets signed.']),
          C(['Das Bild abhängen', 'Take the poster down'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Es hängt jetzt in eurer Kajüte. Das Gesicht ist genauso schlimm wie damals. Aber es gehört euch.', 'It hangs in your cabin now. The face is just as terrible. But it is yours.'])] }
    ],
    // Die große Wette
    wette: [
      { need: ['eile'], bg: 'hafen', icon: 'chest',
        erinnert: ['Damals habt ihr gegen die Möwe gewonnen, weil ihr die Segel voll gesetzt habt.', 'Back then you beat the gull by setting full sail.'],
        lines: [['kalle', 'KRAA! Revanche! Diesmal fliege ich nicht direkt. Ich fliege schlau.', 'KRAA! Rematch! This time I will not fly straight. I will fly smart.'],
          ['A', 'Schlau ist ein neues Wort für dich.', 'Smart is a new word for you.']],
        choices: [C(['Revanche annehmen', 'Take the rematch'], ['50 %: +20 Gold, sonst -8 % Leben', '50%: +20 gold, else -8% HP'], { chance: 0.5, win: { gold: 20 }, lose: { hurt: 0.08 } }, ['Ihr gewinnt knapp. Kalle behauptet, es sei ein Fehlstart gewesen.', 'You win narrowly. Kalle claims it was a false start.']),
          C(['Unentschieden anbieten', 'Offer a draw'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Kalle nimmt an. Beide behaupten später, sie hätten gewonnen.', 'Kalle accepts. Later both claim they won.'])] },
      { need: ['wette'], bg: 'hafen', icon: 'chest',
        erinnert: ['Damals hat euch die Möwe geschlagen, weil sie nicht um die Insel musste.', 'Back then the gull beat you because she did not have to go around the island.'],
        lines: [['kalle', 'KRAA! Ich bin immer noch Erster. Das ist Tradition.', 'KRAA! I am still first. That is tradition.'],
          ['B', 'Er hat eine Medaille. Er hat sie sich selbst gemacht.', 'He has a medal. He made it himself.']],
        choices: [C(['Noch eine Wette', 'Another bet'], ['45 %: +16 Gold, sonst -4 Gold', '45%: +16 gold, else -4 gold'], { chance: 0.45, win: { gold: 16 }, lose: { gold: -4 } }, ['Diesmal fliegt ihr mit Rückenwind. Kalle fliegt mit Gegenwind. Das hat er sich verdient.', 'This time you fly with a tailwind. Kalle flies into a headwind. He earned it.']),
          C(['Medaille bewundern', 'Admire the medal'], ['Crew heilt 12 %', 'Crew heals 12%'], { heal: 0.12 }, ['Die Medaille ist aus einer Kaffeedose. Kalle ist so stolz, dass ihr nichts sagt.', 'The medal is made from a coffee tin. Kalle is so proud that you say nothing.'])] }
    ],
    // Das Kochduell
    kochduell: [
      { need: ['fies'], bg: 'kueche', icon: 'rest',
        erinnert: ['Damals habt ihr dem Favoriten die Gewürze vertauscht. Es wurde grün.', 'Back then you swapped the favourite\'s spices. It turned green.'],
        lines: [['B', 'Der Favorit steht an Deck. Er hat einen Kochlöffel. Er sieht freundlich aus. Das ist schlimm.', 'The favourite stands on deck. He has a ladle. He looks friendly. That is bad.'],
          ['A', 'Wir haben Gemüse. Wir können das erklären.', 'We have vegetables. We can explain.']],
        choices: [C(['Mit Suppe versöhnen', 'Make peace with soup'], ['-4 Gold, Crew heilt 15 %', '-4 gold, crew heals 15%'], { gold: -4, heal: 0.15 }, ['Er probiert, nickt, weint ein bisschen. Dann ist alles vergeben.', 'He tastes, nods, cries a little. Then all is forgiven.']),
          C(['Weglaufen', 'Run for it'], ['bis zum Ende der Insel: Ganze Crew +1 Tempo, -6 % Leben', 'until the island ends: whole crew +1 speed, -6% HP'], { temp: { stat: 'spd', value: 1 }, hurt: 0.06 }, ['Ein Nudelholz fliegt knapp vorbei. Ihr seid schneller als je zuvor.', 'A rolling pin flies past. You are faster than ever.'])] },
      { need: ['gemuese'], bg: 'kueche', icon: 'chest',
        erinnert: ['Damals habt ihr mit Gemüse gewonnen. Die Jury war Vegetarier.', 'Back then you won with vegetables. The jury was vegetarian.'],
        lines: [['B', 'Die Jury ist wieder da. Sie haben ein Kochbuch geschrieben. Wir sind auf Seite vier.', 'The jury is back. They wrote a cookbook. We are on page four.'],
          ['A', 'Auf Seite vier? Wer ist auf Seite eins?', 'Page four? Who is on page one?'],
          ['B', 'Der Hund.', 'The dog.']],
        choices: [C(['Signierte Ausgabe kaufen', 'Buy a signed copy'], ['-5 Gold, +12 Erfahrung', '-5 gold, +12 XP'], { gold: -5, xp: 12 }, ['Rezepte für alles. Außer für Fleisch. Der Kapitän blättert verzweifelt.', 'Recipes for everything. Except meat. The captain flips through it, desperate.']),
          C(['Gemüse tauschen', 'Trade vegetables'], ['+10 Gold', '+10 gold'], { gold: 10 }, ['Ein Händler zahlt für „das Siegergemüse“. Es ist ein ganz normaler Kohl.', 'A merchant pays for “the winning vegetables”. It is a perfectly normal cabbage.'])] }
    ],
    // Die verfluchte Muschel
    muschel: [
      { need: ['lied'], bg: 'schiff', icon: 'elite',
        erinnert: ['Damals habt ihr mit der Muschel zweistimmig gesungen. Die Perle singt noch.', 'Back then you harmonised with the shell. The pearl is still singing.'],
        lines: [['B', 'Die Perle summt wieder. Sie hat eine neue Melodie. Sie ist besser als unsere.', 'The pearl is humming again. It has a new tune. It is better than ours.'],
          ['A', 'Das nennt man Karriere.', 'That is called a career.']],
        choices: [C(['Zusammen singen', 'Sing together'], ['alle +3 % Krit, +6 Erfahrung', 'all +3% crit, +6 XP'], { crit: 0.03, xp: 6 }, ['Dreistimmig. Der Wal im Hintergrund brummt mit.', 'In three parts. The whale in the background hums along.']),
          C(['Ein Konzert geben', 'Give a concert'], ['+12 Gold', '+12 gold'], { gold: 12 }, ['Eine Möwe sammelt Münzen ein. Das Geld gehört angeblich der Band.', 'A gull collects the coins. The money allegedly belongs to the band.'])] },
      { need: ['muschel'], bg: 'nacht', icon: 'elite',
        erinnert: ['Damals habt ihr die Muschel mitgenommen. Seitdem flüstert sie Rechnungen.', 'Back then you took the shell along. It has been whispering bills ever since.'],
        lines: [['B', 'Die Muschel flüstert schon wieder. Diesmal kein Fluch. Ein Angebot.', 'The shell is whispering again. Not a curse this time. An offer.'],
          ['A', 'Was bietet sie?', 'What does she offer?'],
          ['B', 'Zinsen.', 'Interest.']],
        choices: [C(['Investieren', 'Invest'], ['50 %: +13 Gold, sonst -5 Gold', '50%: +13 gold, else -5 gold'], { chance: 0.5, win: { gold: 13 }, lose: { gold: -5 } }, ['Die Muschel zahlt tatsächlich. Sie wirkt dabei sehr zufrieden.', 'The shell actually pays out. She seems very pleased.']),
          C(['Höflich ablehnen', 'Politely decline'], ['+10 Erfahrung', '+10 XP'], { xp: 10 }, ['Sie flüstert „Dann eben nicht“. Beleidigt, aber höflich.', 'She whispers “suit yourself”. Offended, but polite.'])] }
    ],
    // Das Geisterschiff
    geisterschiff: [
      { need: ['karten'], bg: 'geisterschiff', icon: 'chest',
        erinnert: ['Damals habt ihr den Wärter beim Kartenspiel geschlagen und die Glocke gewonnen.', 'Back then you beat the keeper at cards and won the bell.'],
        lines: [['npc:waerter', 'Die Glocke hat geläutet. Dreimal. Das ist seit 4012 Schiffen nicht passiert.', 'The bell rang. Three times. That has not happened in 4012 ships.'],
          ['A', 'Wir haben nicht hingehört.', 'We were not listening.'],
          ['npc:waerter', 'Eben. Deshalb.', 'Exactly. That is why.']],
        choices: [C(['Revanche spielen', 'Play a rematch'], ['50 %: +16 Gold, sonst -6 Gold', '50%: +16 gold, else -6 gold'], { chance: 0.5, win: { gold: 16 }, lose: { gold: -6 } }, ['Er mischt immer noch sehr langsam. Ihr gewinnt trotzdem knapp. Er nickt anerkennend.', 'He still shuffles very slowly. You win narrowly anyway. He nods in approval.']),
          C(['Der Glocke lauschen', 'Listen to the bell'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Ein Ton wie ein Seufzen. Alle sitzen still. Es ist erstaunlich erholsam.', 'A tone like a sigh. Everyone sits still. It is surprisingly restful.'])] },
      { need: ['frage'], bg: 'geisterschiff', icon: 'elite',
        erinnert: ['Damals habt ihr dem Geister-Kapitän geholfen, den Fehler in der Bilanz zu finden.', 'Back then you helped the ghost captain find the error in his ledger.'],
        lines: [['B', 'Am Horizont treibt ein Schiff. Es leuchtet hellgrün. Und es winkt.', 'A ship drifts on the horizon. It glows bright green. And it is waving.'],
          ['npc:waerter', 'Der Kapitän ist zurück. Er hat nachgerechnet. Bei euch hat er sich verrechnet. Zu euren Gunsten.', 'The captain is back. He recalculated. He made a mistake on your account. In your favour.']],
        choices: [C(['Die Differenz annehmen', 'Accept the difference'], ['+14 Gold', '+14 gold'], { gold: 14 }, ['Ein Beutel, ordentlich beschriftet. Mit Quittung. Für 1836.', 'A pouch, neatly labelled. With a receipt. For 1836.']),
          C(['Zurückgeben', 'Give it back'], ['+14 Erfahrung', '+14 XP'], { xp: 14 }, ['Er weint vor Rührung in Zahlen. Dann stellt er euch einen Beleg über Anstand aus.', 'He weeps with emotion in numbers. Then he issues you a receipt for decency.'])] }
    ]
  };

  // Als Crew-Events eintragen (Anzeige und Auswahl wie bei Folgen-Teilen), Liste je Folge in GL.data.wiedersehen
  const eps = GL.data.crewEpisodes || [];
  const evs = [];
  GL.data.wiedersehen = {};
  Object.keys(W).forEach(epId => {
    const ep = eps.find(e => e.id === epId);
    if (!ep) return;
    GL.data.wiedersehen[epId] = W[epId].map((v, k) => {
      const id = `ws-${epId}-${k + 1}`;
      evs.push(Object.assign({ bg: 'schiff', icon: ep.icon, title: ep.title }, v, { id, ep: epId, part: 1, wieder: true }));
      return { need: v.need, id };
    });
  });
  GL.data.crewEvents = (GL.data.crewEvents || []).concat(evs);
})();
