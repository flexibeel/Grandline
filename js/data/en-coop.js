// Englisch: Gemeinschafts-Fahrt (Koop gegen den Welt-Boss)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  'Gemeinschaft': 'Fellowship', 'Gemeinschafts-Fahrt': 'Fellowship voyage', 'Welt-Boss der Woche': 'World boss of the week',
  'Eure Flotte': 'Your fleet', 'Kumpan holen': 'Bring a buddy', 'Deine Stammcrew': 'Your home crew', 'Segelkumpan': 'Sailing buddy',
  '♥ Segelkumpane': '♥ Sailing buddies', '⚓ Gast-Crews aus der Rangliste': '⚓ Guest crews from the leaderboard', 'wechseln täglich': 'change daily',
  '💌 Kumpels einladen': '💌 Invite buddies', 'Fertig': 'Done', '⚓ Gemeinsam angreifen': '⚓ Attack together',
  'Für heute ist die Flotte erschöpft. Morgen wieder.': 'The fleet is exhausted for today. Back tomorrow.',
  ' · Beute heute schon geholt': ' · loot already taken today', ' · Beute beim ersten Versuch': ' · loot on the first try',
  'Die Crews deiner Kumpane kämpfen mit ihrer gespeicherten Stammcrew mit. Sie müssen dafür nicht online sein, nur wach genug, um nicht über Bord zu fallen.': 'Your buddies fight with their saved home crew. They do not need to be online, just awake enough not to fall overboard.',
  'Die Gemeinschafts-Fahrt öffnet sich mit deiner Stammcrew.': 'The fellowship voyage opens with your home crew.',
  'Noch keine Segelkumpane mit Stammcrew. Lade welche ein, oder nimm Gast-Crews aus der Rangliste.': 'No sailing buddies with a home crew yet. Invite some, or take guest crews from the leaderboard.',
  'Die Flotte setzt die Segel …': 'The fleet sets sail …', 'Zurück in den Hafen': 'Back to the harbor',
  'Beute gibt es einmal am Tag. Ruhm gibt es immer.': 'Loot once a day. Glory always.',
  'Flotte voll': 'Fleet full', 'Mehr als vier Crews passen nicht auf die Karte. Wir haben es versucht.': 'More than four crews do not fit on the map. We tried.',
  'Tiefseeriese der Stillen Zone': 'Deep Giant of the Hush', 'Riesenkrake Surume': 'Giant Kraken Surume', 'Eisberg-Riese Oars': 'Iceberg Giant Oars',
  'Tiefseeriese': 'Deep Giant', 'Riesenkrake': 'Giant kraken', 'Riese': 'Giant',
  'Schwanzschlag': 'Tail slap', 'Acht Arme, acht Meinungen': 'Eight arms, eight opinions', 'Eisige Haut': 'Icy skin',
  'Sein Schwanz trifft alle in der Reihe mit. Groß, nass, schlecht gelaunt.': 'His tail hits the whole line. Big, wet, grumpy.',
  'Greift zweimal pro Runde an. Hat acht Arme und benutzt trotzdem nur zwei. Typisch.': 'Attacks twice per round. Has eight arms and still only uses two. Typical.',
  'Wer ihn trifft, friert sich die Finger ab (3 Schaden zurück). Langsam, aber das reicht ihm.': 'Hitting him freezes your fingers (3 damage back). Slow, but that is enough for him.',
  '💡 Viel Leben und Heilung halten länger durch. Bollwerk vorne hilft.': '💡 Lots of health and healing last longer. A bulwark up front helps.',
  '💡 Tempo und Ausweichen lohnen sich: Wer zuerst handelt, trifft öfter.': '💡 Tempo and dodging pay off: whoever acts first hits more often.',
  '💡 Wucht mit wenigen großen Treffern statt vieler kleiner. Heiler gegen die Kälte.': '💡 Might with a few big hits instead of many small ones. Healers against the cold.',
  'Deine Stammcrew und bis zu drei Crews deiner Segelkumpane gegen den Welt-Boss der Woche. Wer mehr Schaden macht, darf angeben.': 'Your home crew and up to three crews of your sailing buddies against the world boss of the week. Whoever deals more damage gets to brag.',
  'Im Hafen unter „Gemeinschaft“': 'In the harbor under “Fellowship”', 'Bis zu 3 Kumpane oder Gast-Crews dazuholen': 'Bring up to 3 buddies or guest crews', 'Drei Versuche am Tag, Beute beim ersten': 'Three tries a day, loot on the first'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^(\d+)\/4 Crews · je (\d+) Stärkste$/, '$1/4 crews · $2 strongest each'],
  [/^([\d.]+) Leben$/, '$1 health'],
  [/^Noch (\d+) Versuche? heute(.*)$/, (m, n, rest) => 'Still ' + n + (n === '1' ? ' try' : ' tries') + ' today' + rest.replace(' · Beute heute schon geholt', ' · loot already taken today').replace(' · Beute beim ersten Versuch', ' · loot on the first try')],
  [/^Euer Bestwert diese Woche: ([\d.]+) Schaden(.*)$/, (m, a, b) => 'Your best this week: ' + a + ' damage' + b.replace('besiegt!', 'defeated!')],
  [/^⭐ Beste Crew: (.+) mit ([\d.]+) Schaden$/, '⭐ Best crew: $1 with $2 damage'],
  [/^(.+) holt aus!$/, '$1 winds up!'], [/^(.+) trifft ins Schwarze\.$/, '$1 hits the bullseye.'], [/^Volltreffer von (.+)!$/, 'Direct hit by $1!'],
  [/^(.+) schlägt zu, der Boss schaut beleidigt\.$/, '$1 strikes, the boss looks offended.'], [/^(.+) findet eine Lücke\.$/, '$1 finds a gap.']
]);
Object.assign(GL.data.en, {
  'Nächste Woche überlegt er sich das zweimal.': 'Next week he will think twice.',
  'Er wackelt schon. Morgen fällt er.': 'He is wobbling. Tomorrow he falls.',
  'Ordentlich angekratzt. Er tut so, als hätte er nichts gemerkt.': 'Properly scratched. He pretends not to have noticed.',
  'Er hat es kaum bemerkt. Wir nennen es Aufwärmen.': 'He barely noticed. We call it a warm-up.',
  'Gemeinsam angreifen': 'Attack together'
});
GL.i18nExtraP = GL.i18nExtraP.concat([
  [/^(.+) ist besiegt!$/, '$1 is defeated!'], [/^([\d.]+) Schaden$/, '$1 damage'], [/^\((\d+) %\)\. (.*)$/, '($1 %). $2'],
  [/^🎁 Beute: (.+) liegt in der Truhe$/, '🎁 Loot: $1 is in the chest']
]);
