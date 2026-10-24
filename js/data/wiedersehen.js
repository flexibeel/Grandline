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
      look: { hat: 'hood', hatColor: '#7a3a9a', shirt: '#c9a23a', pants: '#3a2a4a', hair: '#1a1a1a', skin: '#c98a5a', facc: ['ohrringe'] } }
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
