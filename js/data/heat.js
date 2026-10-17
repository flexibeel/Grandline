// Kopfgeld-Stufen: Schwierigkeit, die man nach einem Sieg freischaltet (wie Ascension/Heat).
// Jede Stufe enthält alle vorherigen. Pro Stufe gibt es mehr Berry und Punkte (config.heatBonus).
//   mod = was sich ändert (wird aufaddiert):
//     enemyHp, enemyAtk   Leben/Angriff aller Gegner (0.1 = +10 %)
//     bossAtk, bossHp     Angriff/Leben der Bosse
//     enemySpd            Tempo aller Gegner
//     eliteMult           Kopfgeldjäger zusätzlich stärker
//     bossEscort          zusätzliche Begleiter beim Boss
//     winHeal, restHeal   Heilung nach Siegen bzw. bei Rast (-0.5 = halb so viel)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.heat = [
  { lvl: 1, name: 'Gesuchte Piraten',     text: 'Gegner haben 10 % mehr Leben.',              mod: { enemyHp: 0.1 } },
  { lvl: 2, name: 'Wütende Bosse',        text: 'Bosse haben 25 % mehr Angriff.',             mod: { bossAtk: 0.25 } },
  { lvl: 3, name: 'Knappe Vorräte',       text: 'Heilung nach Siegen halbiert.',              mod: { winHeal: -0.5 } },
  { lvl: 4, name: 'Harte Kämpfer',        text: 'Gegner haben 15 % mehr Angriff.',            mod: { enemyAtk: 0.15 } },
  { lvl: 5, name: 'Profi-Jäger',          text: 'Kopfgeldjäger sind deutlich stärker, Gegner +10 % Leben.', mod: { eliteMult: 0.25, enemyHp: 0.1 } },
  { lvl: 6, name: 'Unruhige See',         text: 'Rast an Land heilt nur halb so viel.',       mod: { restHeal: -0.5 } },
  { lvl: 7, name: 'Gestählte Bosse',      text: 'Bosse haben 25 % mehr Leben.',               mod: { bossHp: 0.25 } },
  { lvl: 8, name: 'Yonko-Kopfgeld',       text: 'Bosse haben einen Begleiter mehr, Gegner +1 Tempo.', mod: { bossEscort: 1, enemySpd: 1 } }
];
