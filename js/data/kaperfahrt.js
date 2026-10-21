// KAPERFAHRT: kurzer Modus für zwischendurch (etwa 3 Minuten). Das Schiffsdeck ist das Spielbrett:
// Teile haben Ladezeiten und wirken auf ihre Nachbarn. Texte immer [de, en].
// Bilder der Teile: js/data/kfart.js (GL.kfArt.parts), gezeichnet nach den Pixel-Regeln des Gamedesigners.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.kaperfahrt = {
  cols: 5, rows: 3, hold: 6, hull: 50, storm: 25,
  rar: [['Gewöhnlich', 'Common', '#8d8d99'], ['Selten', 'Rare', '#4f86b8'], ['Episch', 'Epic', '#8a5ab0'], ['Legendär', 'Legendary', '#e0a020']],

  // cd = Ladezeit in Sekunden. Teile ohne cd wirken nur auf Nachbarn.
  items: {
    kanone: { n: ['Kanone', 'Cannon'], w: 1, rar: 0, cd: 3.2, dmg: 6, txt: ['Feuert alle 3,2 s: 6 Schaden.', 'Fires every 3.2 s: 6 damage.'] },
    fass: { n: ['Pulverfass', 'Powder keg'], w: 1, rar: 0, txt: ['Kanonen und Büchsen daneben laden 35 % schneller.', 'Cannons and guns next to it load 35% faster.'] },
    planke: { n: ['Planken', 'Planks'], w: 1, rar: 0, cd: 4, sh: 6, txt: ['Alle 4 s: 6 Schild. Liegen Planken nebeneinander, gibt jede 3 mehr.', 'Every 4 s: 6 shield. Planks next to planks give 3 more each.'] },
    kombuese: { n: ['Kombüse', 'Galley'], w: 2, rar: 1, cd: 5, heal: 6, txt: ['Alle 5 s: heilt 6 Rumpf. Teile daneben laden 10 % schneller, satte Crew.', 'Every 5 s: repairs 6 hull. Parts next to it load 10% faster. Fed crew.'] },
    harpune: { n: ['Harpune', 'Harpoon'], w: 2, rar: 1, cd: 4.4, dmg: 8, slow: 0.7, txt: ['8 Schaden. Wirft alle gegnerischen Ladebalken um 0,7 s zurück.', '8 damage. Knocks every enemy charge bar back by 0.7 s.'] },
    ausguck: { n: ['Ausguck', 'Spyglass'], w: 1, rar: 1, txt: ['Waffen daneben treffen zu 25 % kritisch (doppelt). Bei Gerüchten +3 auf Späh-Proben.', 'Weapons next to it crit 25% of the time (double). +3 on scouting rolls.'] },
    brand: { n: ['Brandbombe', 'Fire bomb'], w: 1, rar: 1, cd: 5.5, dmg: 3, burn: 5, txt: ['3 Schaden und 5 s Feuer an Bord, 1 Schaden pro Sekunde.', '3 damage and 5 s of fire on deck, 1 damage per second.'] },
    kette: { n: ['Kettenkugel', 'Chain shot'], w: 1, rar: 1, cd: 2.6, dmg: 3, txt: ['Schnell und lästig: alle 2,6 s 3 Schaden.', 'Quick and annoying: 3 damage every 2.6 s.'] },
    muenze: { n: ['Glücksmünze', 'Lucky coin'], w: 1, rar: 2, txt: ['+2 auf jede Würfelprobe. Nach jedem Sieg 5 Gold extra.', '+2 on every roll. 5 extra gold after each win.'] },
    papagei: { n: ['Papagei Kiko', 'Kiko the parrot'], w: 1, rar: 2, txt: ['Plappert bei Gerüchten aus, wohin eine Wahl führt. Kreischt im Gefecht: Der erste gegnerische Schuss geht daneben.', 'Blabs where a choice leads. Screeches in battle: the first enemy shot misses.'] },
    donner: { n: ['Donnerbüchse „Klabauter“', 'Thunder gun “Klabauter”'], w: 2, rar: 3, cd: 5, dmg: 15, crit: 0.2, txt: ['Legendär. 15 Schaden. Trifft sie kritisch, feuert sie sofort noch einmal.', 'Legendary. 15 damage. On a critical hit she fires again right away.'] }
  },
  start: { deck: [['kanone', 0, 0], ['fass', 0, 1], ['kanone', 0, 2], ['planke', 1, 0], ['kombuese', 2, 1]], hold: ['planke'] },

  // Gegnerschiffe. Später: echte Decks anderer Spieler (Geisterschiffe).
  foes: {
    auster: { n: ['Die Rostige Auster', 'The Rusty Oyster'], who: ['Geisterschiff von Möwenmax · Rang 3', 'Ghost ship of Gullmax · rank 3'], hull: 34, pow: 0.65, items: ['kanone', 'kanone', 'planke', 'brand'], ram: { first: 6, every: 8, dmg: 7 }, gold: 12, art: 'segel' },
    zoll: { n: ['Zollkutter „Pfennig“', 'Customs cutter “Penny”'], who: ['Geisterschiff von Kapitänin Kroll · Rang 5', 'Ghost ship of Captain Kroll · rank 5'], hull: 44, pow: 0.8, items: ['kanone', 'kette', 'harpune', 'planke'], ram: { first: 5, every: 8, dmg: 9 }, gold: 14, art: 'segel' },
    witwe: { n: ['Die Witwe der Nebelbank', 'The Widow of the Fogbank'], who: ['Bosskapitänin · Kopfgeld 1.200', 'Boss captain · bounty 1,200'], hull: 74, pow: 0.75, items: ['kanone', 'kanone', 'harpune', 'brand', 'planke'], ram: { first: 5, every: 7, dmg: 14 }, gold: 30, boss: true, art: 'witwe_flagge' }
  },
  route: [['event', 'fight:auster'], ['event', 'fight:zoll'], ['event', 'rest'], ['boss']],

  // Gerüchte: zwei Antworten, manchmal eine W20-Probe. fx: gold, hull, boost (bessere Beute), karma (+ auf nächste Probe),
  // moral (Ladetempo im nächsten Gefecht), cold (Kombüse aus), bossCut, flag/unflag (bleibt im Profil), item
  events: [
    { id: 'flasche', art: 'flaschenpost', who: ['Flaschenpost', 'Message in a bottle'],
      t: ['Eine Flasche stößt an den Rumpf. Darin eine halb aufgeweichte Karte und ein Zettel: „Nicht dem Papagei zeigen.“', 'A bottle knocks against the hull. Inside: a soggy map and a note saying “Do not show the parrot.”'],
      a: { l: ['Karte entziffern', 'Read the map'], roll: { dc: 11, spaeh: true }, hint: ['Bessere Beute, wenn es klappt', 'Better loot if it works'],
        ok: { t: ['Ein Kreuz, ein Riff, ein Pfeil. Die nächste Beute wird besser.', 'An X, a reef, an arrow. Your next loot will be better.'], fx: { boost: 1 } },
        no: { t: ['Du hältst die Karte zwei Stunden lang falsch herum. Die Crew sagt nichts. Die Crew denkt viel.', 'You hold the map upside down for two hours. The crew says nothing. The crew thinks a lot.'], fx: {} } },
      b: { l: ['Zurück ins Meer', 'Back into the sea'], hint: ['Karma für die nächste Probe', 'Karma for the next roll'],
        res: { t: ['Irgendwer anders freut sich. Das Meer merkt sich so was: +2 auf die nächste Probe.', 'Someone else will be happy. The sea remembers: +2 on your next roll.'], fx: { karma: 2 } } } },
    { id: 'fischer', art: 'npc:fischerjunge', who: ['Der singende Fischer', 'The singing fisherman'],
      t: ['Auf einem Floß sitzt ein alter Fischer und singt. Falsch. Sehr laut. Er winkt: „Ein Duett, Käpt’n?“', 'An old fisherman sits on a raft and sings. Badly. Very loudly. He waves: “A duet, captain?”'],
      a: { l: ['Mitsingen', 'Sing along'], roll: { dc: 12 }, hint: ['Er wird sich erinnern', 'He will remember'],
        ok: { t: ['Ihr trefft sogar zweimal denselben Ton. Gerührt schenkt er dir seine alte Kettenkugel.', 'You even hit the same note twice. Moved, he gives you his old chain shot.'], fx: { item: 'kette' } },
        no: { t: ['Er weint. Vor Rührung oder Schmerz, schwer zu sagen. Er rudert davon und schaut sich nicht um.', 'He cries. From emotion or pain, hard to say. He rows away without looking back.'], fx: { flag: 'fischer' } } },
      b: { l: ['Fisch kaufen', 'Buy fish'], cost: 6, hint: ['Rumpf wird geflickt', 'Hull gets patched'],
        res: { t: ['Die Crew isst. Die Crew flickt. +12 Rumpf.', 'The crew eats. The crew patches. +12 hull.'], fx: { hull: 12 } } } },
    { id: 'nebel', art: 'leuchtturm', who: ['Die Nebelbank', 'The fogbank'],
      t: ['Vor euch eine Wand aus Nebel. Irgendwo darin bimmelt eine Glocke, langsam, als würde jemand warten.', 'Ahead lies a wall of fog. Somewhere inside a bell rings, slowly, as if someone were waiting.'],
      a: { l: ['Mitten hindurch', 'Straight through'], roll: { dc: 13, spaeh: true }, hint: ['Der Boss! Oder eine Boje.', 'The boss! Or a buoy.'],
        ok: { t: ['Die Glocke hängt am Heck der Witwe. Ihr zerschneidet ihr Ruder: Sie startet mit 15 Rumpf weniger.', 'The bell hangs from the Widow’s stern. You cut her rudder: she starts with 15 less hull.'], fx: { bossCut: 15 } },
        no: { t: ['Ihr rammt eine Boje. Die Boje gewinnt. −8 Rumpf.', 'You ram a buoy. The buoy wins. −8 hull.'], fx: { hull: -8 } } },
      b: { l: ['Außen herum', 'Go around'], hint: ['Sicher und trocken', 'Safe and dry'],
        res: { t: ['Länger, aber trocken. Unterwegs fischt der Smutje 4 Gold aus dem Wasser. Fragt nicht.', 'Longer, but dry. On the way the cook fishes 4 gold out of the water. Don’t ask.'], fx: { gold: 4 } } } },
    { id: 'smutje', art: 'topf', who: ['Smutje Bolle', 'Bolle the cook'],
      t: ['„Immer nur Zwieback!“ Smutje Bolle steht mit verschränkten Armen vor der Kombüse. Die Crew nickt hinter ihm.', '“Hardtack again!” Bolle the cook stands in front of the galley, arms crossed. The crew nods behind him.'],
      a: { l: ['Extra-Ration', 'Extra ration'], cost: 5, hint: ['Alle laden schneller', 'Everything loads faster'],
        res: { t: ['Es gibt Pfannkuchen. Echte. Im nächsten Gefecht lädt alles 15 % schneller.', 'Pancakes. Real ones. In the next battle everything loads 15% faster.'], fx: { moral: 0.15 } } },
      b: { l: ['Eine Rede halten', 'Give a speech'], roll: { dc: 10 }, hint: ['Wenn du gut redest', 'If you talk well'],
        ok: { t: ['Du redest von Freiheit, Wind und Zwieback als Lebensgefühl. Applaus. Alles lädt 10 % schneller.', 'You speak of freedom, wind and hardtack as a way of life. Applause. Everything loads 10% faster.'], fx: { moral: 0.1 } },
        no: { t: ['Mitten in der Rede gähnt jemand. Laut. Die Kombüse bleibt im nächsten Gefecht kalt.', 'Halfway through, someone yawns. Loudly. The galley stays cold in the next battle.'], fx: { cold: 1 } } } },
    { id: 'kiste', art: 'kiste', who: ['Treibgut', 'Flotsam'],
      t: ['Eine Kiste treibt vorbei, mit Seetang verschnürt. Sie klappert. Kisten klappern nie wegen etwas Langweiligem.', 'A crate drifts by, tied up with seaweed. It rattles. Crates never rattle for boring reasons.'],
      a: { l: ['Rausfischen', 'Fish it out'], roll: { dc: 9 }, hint: ['Gold oder Zähne', 'Gold or teeth'],
        ok: { t: ['Drin: 12 Gold und ein Zettel „Für schlechte Zeiten“. Jetzt sind gute.', 'Inside: 12 gold and a note, “For bad times.” Now they’re good.'], fx: { gold: 12 } },
        no: { t: ['Die Kiste schnappt zu. Sie war eine Mimik-Kiste. −5 Rumpf, aber ihr habt eine Geschichte.', 'The crate snaps shut. It was a mimic. −5 hull, but you have a story now.'], fx: { hull: -5 } } },
      b: { l: ['Vorbeiziehen lassen', 'Let it drift'], hint: ['Nichts passiert', 'Nothing happens'],
        res: { t: ['Sie klappert davon. Die Crew wird noch Jahre darüber reden.', 'It rattles away. The crew will talk about it for years.'], fx: {} } } },
    { id: 'moewe', art: 'moewe', who: ['Die Möwe mit Hut', 'The gull in a hat'],
      t: ['Eine Möwe landet auf der Reling. Sie trägt einen winzigen Dreispitz und schaut dich an, als schuldest du ihr Geld.', 'A gull lands on the railing. It wears a tiny tricorn and looks at you as if you owe it money.'],
      a: { l: ['Ihr 3 Gold geben', 'Give it 3 gold'], cost: 3, hint: ['Sie kennt Wege', 'It knows the way'],
        res: { t: ['Sie nimmt das Gold, nickt und fliegt voraus. Die nächste Beute wird besser.', 'It takes the gold, nods and flies ahead. Your next loot will be better.'], fx: { boost: 1 } } },
      b: { l: ['Den Hut klauen', 'Steal the hat'], roll: { dc: 14 }, hint: ['Frech, aber lohnend', 'Cheeky but worth it'],
        ok: { t: ['Der Hut gehört jetzt dir. Darunter: eine Glücksmünze. Die Möwe ist sehr enttäuscht von dir.', 'The hat is yours. Under it: a lucky coin. The gull is very disappointed in you.'], fx: { item: 'muenze' } },
        no: { t: ['Die Möwe gewinnt. Natürlich. −4 Rumpf und etwas Würde.', 'The gull wins. Of course. −4 hull and some dignity.'], fx: { hull: -4 } } } }
  ],
  // Rückkehrer: Figuren merken sich, was auf früheren Fahrten passiert ist (flag im Profil)
  callbacks: {
    fischer: { id: 'fischer2', art: 'npc:fischerjunge', who: ['Der Fischer, schon wieder', 'The fisherman, again'],
      t: ['Das Floß ist zurück. Der Fischer räuspert sich und sieht dich an: „Ich hab geübt. Seit letztem Mal.“', 'The raft is back. The fisherman clears his throat: “I practised. Since last time.”'],
      a: { l: ['Diesmal richtig mitsingen', 'Sing properly this time'], roll: { dc: 8 }, hint: ['Wiedergutmachung', 'Making amends'],
        ok: { t: ['Es klingt fast schön. Er schenkt dir seinen Papagei, der ihn sowieso nur auslacht.', 'It almost sounds nice. He gives you his parrot, which only ever laughs at him anyway.'], fx: { item: 'papagei', unflag: 'fischer' } },
        no: { t: ['Er übt weiter. Ihr segelt schneller weiter.', 'He keeps practising. You sail on faster.'], fx: {} } },
      b: { l: ['Ohren zuhalten', 'Cover your ears'], hint: ['Er singt trotzdem', 'He sings anyway'],
        res: { t: ['Er singt trotzdem. Für dich. Im nächsten Gefecht lädt alles 5 % langsamer, vor Schreck.', 'He sings anyway. For you. Everything loads 5% slower next battle, out of shock.'], fx: { moral: -0.05, unflag: 'fischer' } } } }
  }
};
