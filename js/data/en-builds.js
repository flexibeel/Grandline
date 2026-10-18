// Englisch: Builds (Stile), Synergie-Stufen und „So knackst du ihn“
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  'Wucht': 'Smash', 'Schwertkunst': 'Swordplay', 'Tempo': 'Tempo', 'Bollwerk': 'Bulwark', 'Sturmtrupp': 'Strike Team', 'Lazarett': 'Field Hospital',
  'Große Treffer, knackt Bosse': 'Big hits, cracks bosses', 'Viele kritische Treffer': 'Lots of critical hits', 'Zuerst handeln, oft ausweichen': 'Act first, dodge often',
  'Hält vorne alles aus': 'Tanks everything up front', 'Mehr Schaden für alle Kämpfer': 'More damage for all fighters', 'Heilt jede Runde, lange Kämpfe': 'Heals every round, long fights',
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
