// Englisch: Builds (Stile), Synergie-Stufen und „So knackst du ihn“
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  'Wucht': 'Smash', 'Schwertkunst': 'Swordplay', 'Tempo': 'Tempo', 'Bollwerk': 'Bulwark', 'Sturmtrupp': 'Strike Team', 'Lazarett': 'Field Hospital',
  'Große Treffer, knackt Bosse': 'Big hits, cracks bosses', 'Viele kritische Treffer': 'Lots of critical hits', 'Zuerst handeln, oft ausweichen': 'Act first, dodge often',
  'Hält vorne alles aus': 'Tanks everything up front', 'Mehr Schaden für alle Kämpfer': 'More damage for all fighters', 'Heilt jede Runde, lange Kämpfe': 'Heals every round, long fights',
  'Kraft-Figuren +3 Angriff und +10 % gegen Bosse': 'Power characters +3 attack and +10 % vs bosses',
  'Kraft-Figuren +6 Angriff und +25 % gegen Bosse': 'Power characters +6 attack and +25 % vs bosses',
  'Klinge-Figuren +25 % Krit-Chance und etwas härtere Krits': 'Blade characters +25 % crit chance and slightly harder crits',
  'Brecher erleiden 3 weniger Schaden': 'Breakers take 3 less damage',
  'Brecher erleiden 5 weniger Schaden, ganze Crew 1 weniger': 'Breakers take 5 less damage, whole crew 1 less',
  'Bollwerk: Brecher erleiden 8 weniger Schaden, ganze Crew 2 weniger': 'Bulwark: Breakers take 8 less damage, whole crew 2 less',
  'Ganze Crew heilt 4 Leben pro Runde': 'Whole crew heals 4 HP per round', 'Ganze Crew heilt 8 Leben pro Runde': 'Whole crew heals 8 HP per round',
  'Lazarett: ganze Crew heilt 11 Leben pro Runde und erleidet 10 % weniger Schaden': 'Field Hospital: whole crew heals 11 HP per round and takes 10 % less damage',
  'Kraft-Figuren +5 Angriff und +20 % gegen Bosse': 'Power characters +5 attack and +20 % vs bosses',
  'Wucht-Bande: Kraft-Figuren +9 Angriff und +40 % gegen Bosse': 'Smash crew: Power characters +9 attack and +40 % vs bosses',
  'Klinge-Figuren +40 % Krit-Chance und härtere Krits': 'Blade characters +40 % crit chance and harder crits',
  'Schwertkunst: Klinge-Figuren +55 % Krit-Chance, Krits doppelt so hart': 'Swordplay: Blade characters +55 % crit chance, crits twice as hard',
  'Ganze Crew +2 Tempo, Technik-Figuren +2 Angriff und +10 % Ausweichen': 'Whole crew +2 speed, Tech characters +2 attack and +10 % dodge',
  'Ganze Crew +3 Tempo und +6 % Ausweichen, Technik-Figuren +2 Angriff, +20 % Ausweichen, ohne Typnachteil': 'Whole crew +3 speed and +6 % dodge, Tech characters +2 attack, +20 % dodge, no type penalty',
  'Tempo-Bande: ganze Crew +4 Tempo und +15 % Ausweichen, Technik-Figuren +4 Angriff': 'Tempo crew: whole crew +4 speed and +15 % dodge, Tech characters +4 attack',
  'Bollwerk: Brecher erleiden 6 weniger Schaden, ganze Crew 1 weniger': 'Bulwark: Breakers take 6 less damage, whole crew 1 less',
  'Kämpfer +20 % Schaden': 'Fighters +20 % damage', 'Kämpfer +45 % Schaden': 'Fighters +45 % damage', 'Sturmtrupp: Kämpfer +70 % Schaden': 'Strike Team: Fighters +70 % damage',
  'Lazarett: ganze Crew heilt 9 Leben pro Runde und erleidet 10 % weniger Schaden': 'Field Hospital: whole crew heals 9 HP per round and takes 10 % less damage',
  'So knackst du ihn:': 'How to crack him:', 'knackt seine dicke Haut': 'cracks his thick skin', 'heilt gegen seine harten Schläge': 'heals through his heavy blows',
  'fängt ihn vorne ab': 'holds him off up front', 'hält länger durch': 'lasts longer',
  'Noch kein Stil': 'No style yet', 'Probier mal einen Stil': 'Try a style', 'Höchste Stufe erreicht!': 'Top tier reached!', 'Volle Stufe, stark!': 'Full tier, strong!',
  '2 gleiche Kampfstile oder Rollen ergeben einen Stil, z. B. 💥 Wucht, ⚔ Schwertkunst, 💨 Tempo oder 💚 Lazarett.': '2 matching fighting styles or roles make a style, e.g. 💥 Smash, ⚔ Swordplay, 💨 Tempo or 💚 Field Hospital.',
  'Sammle gleiche Kampfstile: 💥 Wucht (Kraft) knackt Bosse, ⚔ Schwertkunst (Klinge) kritet, 💨 Tempo (Technik) weicht aus, 💚 Lazarett (Helfer) heilt.': 'Collect matching styles: 💥 Smash (Power) cracks bosses, ⚔ Swordplay (Blade) crits, 💨 Tempo (Tech) dodges, 💚 Field Hospital (Helper) heals.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^\((Kraft|Klinge|Technik) ×2 Schaden\) ·$/, (m, a) => '(' + ({ Kraft: 'Power', Klinge: 'Blade', Technik: 'Tech' })[a] + ' ×2 damage) ·'],
  [/^Noch (\d+)× (.+) bis: (.+)$/, (m, n, l, x) => n + '× more ' + (GL.data.en[l] || l) + ' until: ' + (GL.data.en[x] || x)],
  [/^Dein Stil: (.+?) (★+)$/, (m, a, s) => 'Your style: ' + (GL.data.en[a] || a) + ' ' + s],
  [/^(Wucht|Schwertkunst|Tempo|Bollwerk|Sturmtrupp|Lazarett) (★+)$/, (m, a, s) => (GL.data.en[a] || a) + ' ' + s],
  [/^(.+)\. Mit (\d+)× (.+) wird er noch stärker\.$/, (m, p, n, l) => (GL.data.en[p] || p) + '. With ' + n + '× ' + (GL.data.en[l] || l) + ' it gets even stronger.'],
  [/^(.+)\. Volle Stufe, stark!$/, (m, p) => (GL.data.en[p] || p) + '. Full tier, strong!']
]);
// Kampf-Herz: Kombos, schwerer Schlag, Kampfbilanz, Wiki „Kampf“
Object.assign(GL.data.en, {
  'Kaperfahrt': 'Raid voyage', 'Kapern': 'Raid', 'Daneben!': 'Missed!', 'Knapp vorbei!': 'Close call!', 'Schwerer Schlag!': 'Heavy blow!', 'holt aus …': 'winds up …',
  'Sturmangriff': 'Charge', 'Tausend Schnitte': 'Thousand Cuts', 'Festung': 'Fortress', 'Zäher Brocken': 'Tough Nut', 'Klingensturm': 'Blade Storm',
  'Ganze Crew +1 Tempo, Kraft-Figuren +10 % Schaden.': 'Whole crew +1 speed, Power characters +10 % damage.',
  'Klinge-Figuren +8 % Krit-Chance und +6 % Ausweichen.': 'Blade characters +8 % crit chance and +6 % dodge.',
  'Ganze Crew +1 Rüstung, Brecher heilen 2 Leben pro Runde.': 'Whole crew +1 armor, Breakers heal 2 HP per round.',
  'Kraft-Figuren heilen 2 Leben pro Runde und erleiden 5 % weniger Schaden.': 'Power characters heal 2 HP per round and take 5 % less damage.',
  'Krits von Kämpfern treffen 25 % härter.': 'Fighter crits hit 25 % harder.',
  'Erst rennen, dann hauen. Die Reihenfolge ist wichtig.': 'Run first, hit second. The order matters.',
  'Schneller schneiden, als der Gegner „Moment mal“ sagen kann.': 'Cut faster than the enemy can say “hang on”.',
  'Niemand kommt rein. Leider auch kein Lieferdienst.': 'Nobody gets in. Sadly, neither does the delivery guy.',
  'Haut zu. Steht wieder auf. Haut wieder zu. Ein Kreislauf.': 'Hits. Gets up. Hits again. The circle of life.',
  'Spitze Sachen. Viele davon. In schneller Folge.': 'Pointy things. Lots of them. In quick succession.',
  'Stil-Kombo': 'Style combo', 'Kombo in Reichweite': 'Combo within reach', 'Stil-Kombos in Reichweite': 'Style combos within reach',
  'Stil-Schaden': 'style damage', 'Schaden': 'damage', 'Krit': 'crit', 'Krits': 'crits', 'geheilt': 'healed',
  'Subtil war gestern.': 'Subtle was yesterday.', 'Präzise. Und ein kleines bisschen gemein.': 'Precise. And a tiny bit mean.',
  'Getroffen werden ist auch nur eine Option.': 'Getting hit is just one option.', 'Pflaster sind auch eine Waffe.': 'Band-aids are a weapon too.',
  'Steht im Weg. Absichtlich.': 'In the way. On purpose.', 'Viel Lärm, viel Schaden, wenig Plan.': 'Lots of noise, lots of damage, little plan.',
  '⚔ Kampf': '⚔ Combat', 'Finde deinen Stil': 'Find your style', 'Stil-Kombos': 'Style combos', 'Der schwere Schlag': 'The heavy blow',
  'Für alle, die Probleme gern direkt lösen.': 'For people who like to solve problems directly.',
  'Lebt vom Glück. Und davon hat sie erstaunlich viel.': 'Lives on luck. And has a surprising amount of it.',
  'Wer nicht getroffen wird, muss auch nicht geheilt werden.': 'If you never get hit, you never need healing.',
  'Eine Wand mit Gefühlen.': 'A wall with feelings.', 'Plan: draufhauen. Plan B: fester draufhauen.': 'Plan: hit it. Plan B: hit it harder.',
  'Langsam, aber die Crew steht am Ende noch.': 'Slow, but the crew is still standing at the end.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^(.+) holt weit aus … Nächste Runde wird es laut\. Ausweichen hilft doppelt\.$/, '$1 winds up … Next round gets loud. Dodging counts double.'],
  [/^(.+) krempelt die Ärmel hoch\. Das ist selten ein gutes Zeichen\. Rüstung zählt jetzt doppelt\.$/, '$1 rolls up their sleeves. Rarely a good sign. Armor counts double now.'],
  [/^(.+) atmet tief ein\. Ein guter Moment, schnell zu sein\.$/, '$1 takes a deep breath. A good moment to be fast.'],
  [/^(.+) duckt sich unter dem schweren Schlag von (.+) weg\. Elegant\. Fast\.$/, '$1 ducks under the heavy blow from $2. Elegant. Almost.'],
  [/^(.+) landet den schweren Schlag: (\d+) Schaden an (.+?)\.( Autsch\.)?$/, (m, a, d, t, x) => a + ' lands the heavy blow: ' + d + ' damage to ' + t + '.' + (x ? ' Ouch.' : '')],
  [/^(\d+) (Stil-Schaden|Schaden)$/, (m, n, w) => n + ' ' + (w === 'Schaden' ? 'damage' : 'style damage')],
  [/^(\d+) (Krit|Krits)$/, (m, n, w) => n + (w === 'Krit' ? ' crit' : ' crits')],
  [/^(\d+)× ausgewichen( \(auch dem großen Schlag!\))?$/, (m, n, x) => 'dodged ' + n + '×' + (x ? ' (even the big one!)' : '')],
  [/^(\d+) geheilt$/, '$1 healed']
]);
// Fork R: Wiederbeleben & Wellen
Object.assign(GL.data.en, {
  'Welle 2! Es kommen noch welche. Es kommen immer noch welche.': 'Wave 2! There are more. There are always more.',
  'Welle 2! Die zweite Reihe will auch mal.': 'Wave 2! The second row wants a turn too.',
  'Welle 2! Jemand hat Verstärkung gerufen. Unhöflich.': 'Wave 2! Somebody called for backup. Rude.',
  'Welle 2! Nachschub, und einer davon hat offensichtlich trainiert.': 'Wave 2! Reinforcements, and one of them has clearly been training.',
  'Welle 2! Ein Anführer kommt mit. Er hat sogar einen Hut.': 'Wave 2! A leader joins in. He even has a hat.',
  'Welle 2! Diesmal mit Chef. Natürlich.': 'Wave 2! With a boss this time. Of course.',
  'Nachschub': 'Reinforcements', 'Welle 2!': 'Wave 2!', 'mit Anführer': 'with a leader', 'Welle 2': 'Wave 2', '2 Wellen': '2 waves',
  'Choppers Medizinkoffer': 'Chopper’s Medical Kit', 'Feldlazarett': 'Field hospital',
  'Niemand musste geflickt werden. Auch schön.': 'Nobody needed patching up. Also nice.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^(\d+) neue Gegner$/, '$1 new enemies'],
  [/^Welle (\d+)!$/, 'Wave $1!'],
  [/^Chopper flickt (.+) zusammen\. „Nicht sterben, das ist ein Befehl vom Arzt!“$/, 'Chopper patches $1 up. “No dying, that is a doctor’s order!”'],
  [/^Das Lazarett holt (.+) zurück aufs Deck\. Mit Pflaster und Ermahnung\.$/, 'The field hospital drags $1 back on deck. With plasters and a lecture.'],
  [/^Die Hito-Hito-Frucht weiß, was zu tun ist: (.+) steht wieder\.$/, 'The Hito-Hito fruit knows what to do: $1 is back up.'],
  [/^(.+) (rappelt sich|rappeln sich) mit (\d+) % Leben wieder auf\.$/, '$1 get back up with $3 % HP.'],
  [/^Nach jedem Sieg stehen Gefallene mit (.+) Leben wieder auf\. Chopper hat sie gebeten, nicht so viel zu sterben\.$/, 'After every win the fallen get back up with $1 HP. Chopper asked them to die less.'],
  [/^Ein Gefallener steht mit (\d+) % Leben wieder auf$/, 'One fallen member gets back up with $1 % HP'],
  [/^(\d+) Gefallene stehen mit (\d+) % Leben wieder auf$/, '$1 fallen get back up with $2 % HP']
]);
// Fork AB: Meta-Statistik im Wiki
(function () {
  const BN = { 'Wucht': 'Smash', 'Schwertkunst': 'Swordplay', 'Tempo': 'Tempo', 'Lazarett': 'Field Hospital', 'Bollwerk': 'Bulwark', 'Sturmtrupp': 'Strike Team' };
  const tn = s => s.replace(/Wucht|Schwertkunst|Lazarett|Bollwerk|Sturmtrupp/g, m => BN[m] || m);
  Object.assign(GL.data.en, {
    'Kampfstile': 'Fighting styles', 'Siegquote': 'Win rate', 'Ø Schaden pro Kampf': 'Avg. damage per fight', 'Kombos': 'Combos', 'Frucht-Familien': 'Fruit families',
    'Siegquote von Crews mit dieser Kombo, die die erste Insel geschafft haben.': 'Win rate of crews with this combo that cleared the first island.',
    'Wer gezielt Früchte einer Familie sammelt. „Steht sie“ = Familienbonus am Ende aktiv.': 'Collecting fruits of one family on purpose. “Formed” = family bonus active at the end.'
  });
  GL.i18nExtraP = (GL.i18nExtraP || []).concat([
    [/^\s*ist gerade vorne, (.+) braucht Geduld\. Am härtesten pro Kampf haut (.+) zu\.$/, (m, a, b) => 'leads right now, ' + tn(a) + ' needs patience. Hardest hitter per fight: ' + tn(b) + '.'],
    [/^Wer sich von Anfang an auf einen Stil festlegt, landet bei (\d+) % bis (\d+) %\. Kein Stil ist Pflicht, Hauptsache, er steht\.$/, 'Committing to one style from the start lands you at $1 % to $2 %. No style is mandatory, as long as it comes together.'],
    [/^Aus (\d+) echten Runs \(14 Tage\), Stil am Ende des Runs\. Aktualisiert sich bei jedem Run\.$/, 'From $1 real runs (14 days), style at the end of the run. Updates with every run.'],
    [/^Aus ([\d.]+) Bot-Runs \(Stand (.+)\)\. Siegquote, wenn der Stil am Ende aktiv war\. Live-Zahlen kommen ab 30 echten Runs \(bisher (\d+)\)\.$/, 'From $1 bot runs (as of $2). Win rate when the style was active at the end. Live numbers start at 30 real runs (so far $3).'],
    [/^steht sie: (\d+) %$/, 'formed: $1 %'],
    [/^(\d+) Runs$/, '$1 runs']
  ]);
})();
// Fork AI1: Formation & Gegner-KI
Object.assign(GL.data.en, {
  'Gefolge schützt': 'Escort guards', 'Schützt den Anführer': 'Guards the leader',
  'Formation\nDas Gefolge steht vorne und schützt den Anführer. Nahkämpfer müssen sich erst durchschlagen. Technik-Figuren schießen über die Köpfe hinweg, verlieren dabei aber etwas Wucht.': 'Formation\nThe escort stands in front and guards the leader. Melee fighters must break through first. Technique fighters shoot over their heads but lose some punch.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^„Für den Boss!“ Das Gefolge von (.+) wird wütend: \+(\d+) % Angriff\.$/, '“For the boss!” $1\'s escort gets angry: +$2 % attack.'],
  [/^(.+) pfeift\. (.+) steht wieder auf und tut so, als wäre nichts gewesen\.$/, '$1 whistles. $2 gets back up and pretends nothing happened.']
]);
Object.assign(GL.data.en, { 'Training wartet': 'Training awaits' });
