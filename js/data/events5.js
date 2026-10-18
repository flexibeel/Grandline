// ART3: Szenen mit den neuen Kulissen (art.js: markt_nacht, grotte, vulkan, kirschhafen, geisterschiff, wrackfriedhof)
// und eigenen Nebenfiguren als Sprecher ('npc:<id>', Porträt aus GL.art.npc). Format wie events4.js.
window.GL = window.GL || {};
GL.data = GL.data || {};

(function () {
  const gold = n => run => (run.gold || 0) >= n;
  const sea = n => run => GL.run && GL.run.islandIndex ? GL.run.islandIndex(run) >= n : true;
  const C = (l, h, outcome, t, flag) => Object.assign({ label: l, hint: h, outcome, text: t }, flag ? { flag } : {});

  // Namen der Nebenfiguren (für die Sprechblasen)
  GL.data.npcNames = {
    haendler: ['Händler Ottokar', 'Ottokar the trader'], fischerjunge: ['Fischerjunge Pip', 'Pip the fisher boy'],
    kartograph: ['Der Kartograph', 'The cartographer'], hafenwirtin: ['Wirtin Rosi', 'Rosi the innkeeper'],
    waerter: ['Wärter Gustl', 'Gustl the keeper'], kadettin: ['Kadettin Mira', 'Cadet Mira']
  };

  const more = [
    { id: 'ce5-markt', bg: 'markt_nacht', icon: 'chest', title: ['Markt bei Nacht', 'Night market'], when: gold(10),
      lines: [['npc:haendler', 'Alles muss raus. Auch Dinge, die nie drin waren.', 'Everything must go. Even things that were never in.'],
        ['A', 'Was kostet das Glas mit dem Nebel?', 'How much for the jar of fog?'],
        ['npc:haendler', 'Für Sie das Doppelte. Sie sehen wichtig aus.', 'Double, for you. You look important.']],
      choices: [C(['Das Nebelglas kaufen', 'Buy the jar of fog'], ['-10 Gold, Schatz', '-10 gold, treasure'], { gold: -10, relic: 0 }, ['Im Glas ist tatsächlich Nebel. Und darunter etwas Nützliches.', 'There really is fog in the jar. And something useful underneath.']),
        C(['Nur gucken', 'Just looking'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['Ottokar sieht euch gekränkt nach. Professionell gekränkt.', 'Ottokar watches you leave, offended. Professionally offended.'])] },
    { id: 'ce5-grotte', bg: 'grotte', icon: 'map', title: ['Die blaue Grotte', 'The blue grotto'],
      lines: [['npc:fischerjunge', 'Ich kenn eine Abkürzung. Durch die Grotte. Meistens kommt man wieder raus.', 'I know a shortcut. Through the grotto. Most people come back out.'],
        ['A', 'Meistens reicht mir.', 'Most is fine by me.']],
      choices: [C(['Hindurch', 'Go through'], ['65 %: +14 Gold, sonst -6 % Leben', '65%: +14 gold, else -6% HP'], { chance: 0.65, win: { gold: 14 }, lose: { hurt: 0.06 } }, ['Drinnen glitzert es. Manches davon ist Gold, manches nur nass.', 'Inside, things glitter. Some of it is gold, some of it just wet.']),
        C(['Am Eingang rasten', 'Rest at the entrance'], ['Crew heilt 12 %', 'Crew heals 12%'], { heal: 0.12 }, ['Pip angelt. Er fängt nichts und ist trotzdem zufrieden. Vorbildlich.', 'Pip goes fishing. He catches nothing and is content anyway. Exemplary.'])] },
    { id: 'ce5-vulkan', bg: 'vulkan', icon: 'map', title: ['Der Kartograph am Vulkan', 'The cartographer at the volcano'], when: sea(1),
      lines: [['npc:kartograph', 'Dieser Vulkan fehlt auf allen Karten. Er ist ziemlich beleidigt.', 'This volcano is missing from every map. It is rather offended.'],
        ['B', 'Man merkt es. Er raucht.', 'You can tell. He is fuming.']],
      choices: [C(['Beim Vermessen helfen', 'Help with the survey'], ['Kapitän +1 Statuspunkt, -3 % Leben', 'Captain +1 stat point, -3% HP'], { points: 1, hurt: 0.03 }, ['Der Vulkan ist jetzt auf der Karte. Er raucht weniger. Zufall, sagt der Kartograph.', 'The volcano is on the map now. It smokes less. Coincidence, says the cartographer.']),
        C(['Eier im Lavastrom kochen', 'Boil eggs in the lava'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Sanji ist entsetzt. Die Eier sind perfekt.', 'Sanji is appalled. The eggs are perfect.'])] },
    { id: 'ce5-kirsch', bg: 'kirschhafen', icon: 'rest', title: ['Kirschblüten im Hafen', 'Cherry blossoms in the harbor'],
      lines: [['npc:hafenwirtin', 'Kirschblüten-Saison. Alle sind freundlich. Es ist unheimlich.', 'Cherry blossom season. Everyone is friendly. It is unsettling.'],
        ['A', 'Dann bleiben wir auf einen Tee.', 'Then we stay for tea.']],
      choices: [C(['Tee mit der Wirtin', 'Tea with the innkeeper'], ['Crew heilt 15 %', 'Crew heals 15%'], { heal: 0.15 }, ['Rosi erzählt von jedem Piraten, der hier je seine Rechnung vergessen hat. Es dauert.', 'Rosi tells you about every pirate who ever forgot to pay here. It takes a while.']),
        C(['Eine Runde ausgeben', 'Buy a round'], ['-8 Gold, alle +3 % Krit', '-8 gold, all +3% crit'], { gold: -8, crit: 0.03 }, ['Die Crew stößt an. Danach treffen alle ein bisschen besser. Oder glauben es.', 'The crew raises a glass. Afterwards everyone hits a bit better. Or believes so.'])], when: gold(8) }
  ];

  // Folge: Das Geisterschiff (3 Teile, Teil 3 hängt von Teil 2 ab)
  const EP = [
    { id: 'geisterschiff', icon: 'elite', title: ['Das Geisterschiff', 'The ghost ship'], parts: [
      { bg: 'geisterschiff', icon: 'elite', lines: [['B', 'Da treibt ein Schiff. Niemand an Bord. Aber das Licht brennt.', 'There is a ship drifting. Nobody aboard. But the lantern is lit.'], ['A', 'Dann klopfen wir.', 'Then we knock.']],
        choices: [C(['Entern', 'Board it'], ['+6 Erfahrung', '+6 XP'], { xp: 6 }, ['An Deck steht ein gedeckter Tisch. Für vierzig Leute. Seit vierzig Jahren.', 'On deck there is a table set. For forty people. For forty years.'], 'an_bord'),
          C(['Vorbeisegeln', 'Sail past'], ['Crew heilt 8 %', 'Crew heals 8%'], { heal: 0.08 }, ['Das Licht folgt euch. Höflich, mit Abstand.', 'The light follows you. Politely, at a distance.'], 'vorbei')] },
      { bg: 'wrackfriedhof', icon: 'map', lines: [['npc:waerter', 'Willkommen im Wrackfriedhof. Ich zähle die Schiffe. Ihr seid Nummer 4012.', 'Welcome to the wreck graveyard. I count the ships. You are number 4012.'],
          ['A', 'Und Nummer 4011?', 'And number 4011?'], ['npc:waerter', 'Liegt da drüben. Sehr ruhig.', 'Lies over there. Very quiet.']],
        choices: [C(['Mit dem Wärter Karten spielen', 'Play cards with the keeper'], ['50 %: +14 Gold, sonst -6 Gold', '50%: +14 gold, else -6 gold'], { chance: 0.5, win: { gold: 14 }, lose: { gold: -6 } }, ['Gustl mischt seit Jahrzehnten. Er mischt sehr langsam.', 'Gustl has been shuffling for decades. He shuffles very slowly.'], 'karten'),
          C(['Nach dem Geisterschiff fragen', 'Ask about the ghost ship'], ['+8 Erfahrung', '+8 XP'], { xp: 8 }, ['„Ach, das. Der Kapitän sucht einen Fehler in der Bilanz. Seit vierzig Jahren.“', '“Oh, that one. The captain is looking for an error in the books. For forty years.”'], 'frage')] },
      { variants: [
        { need: 'karten', bg: 'geisterschiff', icon: 'chest', lines: [['npc:waerter', 'Ihr habt gewonnen. Das ist mir seit 1203 Schiffen nicht passiert.', 'You won. That hasn’t happened to me in 1203 ships.'], ['A', 'Was gibt es zu gewinnen?', 'What is the prize?'], ['npc:waerter', 'Die Schiffsglocke. Sie läutet nur, wenn keiner hinhört.', 'The ship’s bell. It only rings when no one is listening.']],
          choices: [C(['Glocke mitnehmen', 'Take the bell'], ['seltener Schatz', 'rare treasure'], { relic: 1 }, ['Nachts läutet es leise an Bord. Niemand hört hin. Alle sind zufrieden.', 'At night something rings softly aboard. No one listens. Everyone is content.'])] },
        { need: 'frage', bg: 'geisterschiff', icon: 'elite', lines: [['B', 'Der Geister-Kapitän sitzt über einem Buch. Er weint leise in Zahlen.', 'The ghost captain sits over a ledger. He weeps quietly in numbers.'], ['A', 'Nami, du bist dran.', 'Nami, you’re up.']],
          choices: [C(['Den Fehler finden', 'Find the error'], ['bis zum Ende der Insel: Ganze Crew +1 Angriff, +8 Gold', 'until the island ends: whole crew +1 attack, +8 gold'], { temp: { stat: 'atk', value: 1 }, gold: 8 }, ['Ein Zahlendreher, 1863 statt 1836. Der Kapitän seufzt erleichtert und löst sich in Nebel auf. Sein Trinkgeld bleibt.', 'A transposed number, 1863 instead of 1836. The captain sighs with relief and dissolves into fog. His tip remains.'])] },
        { bg: 'geisterschiff', icon: 'map', lines: [['B', 'Das Geisterschiff dreht ab. Das Licht winkt.', 'The ghost ship turns away. The light waves.'], ['A', 'Wir winken zurück. Man weiß ja nie.', 'We wave back. You never know.']],
          choices: [C(['Weiter', 'Onwards'], ['+12 Erfahrung', '+12 XP'], { xp: 12 }, ['Am Horizont ein letzter grüner Schimmer. Dann nur noch Meer.', 'One last green glimmer on the horizon. Then only sea.'])] }
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
