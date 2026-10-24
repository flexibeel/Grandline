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
  { lvl: 1,  icon: '❤', name: 'Gesuchte Piraten',     text: 'Gegner haben 10 % mehr Leben.',              mod: { enemyHp: 0.1 } },
  { lvl: 2,  icon: '👑', name: 'Wütende Bosse',        text: 'Bosse haben 25 % mehr Angriff.',             mod: { bossAtk: 0.25 } },
  { lvl: 3,  icon: '🍞', name: 'Knappe Vorräte',       text: 'Heilung nach Siegen halbiert.',              mod: { winHeal: -0.5 } },
  { lvl: 4,  icon: '⚔', name: 'Harte Kämpfer',        text: 'Gegner haben 15 % mehr Angriff.',            mod: { enemyAtk: 0.15 } },
  { lvl: 5,  icon: '🎯', name: 'Profi-Jäger',          text: 'Kopfgeldjäger sind deutlich stärker, Gegner +5 % Leben.', mod: { eliteMult: 0.2, enemyHp: 0.05 } },   // GEGNER-WERTE: war 0.25 / 0.1 (Klippe von Stufe 4 auf 5)
  { lvl: 6,  icon: '🌊', name: 'Unruhige See',         text: 'Rast an Land heilt nur halb so viel.',       mod: { restHeal: -0.5 } },
  { lvl: 7,  icon: '🛡', name: 'Gestählte Bosse',      text: 'Bosse haben 25 % mehr Leben.',               mod: { bossHp: 0.25 } },
  { lvl: 8,  icon: '💨', name: 'Yonko-Kopfgeld',       text: 'Bosse haben einen Begleiter mehr, Gegner +1 Tempo.', mod: { bossEscort: 1, enemySpd: 1 } },
  { lvl: 9,  icon: '✚', name: 'Zähes Pack',           text: 'Gegner heilen sich jede Runde ein wenig und haben 6 % mehr Angriff.',   mod: { enemyRegen: 0.03, enemyAtk: 0.06 } },   // GEGNER-WERTE: +6 % Angriff (Treffer-Deckel nimmt Spitzen weg)
  { lvl: 10, icon: '🌀', name: 'Nachschub ohne Ende',  text: 'Gegnerwellen bringen einen Gegner mehr, Gegner +8 % Angriff.', mod: { waveExtra: 1, enemyAtk: 0.08 } },
  { lvl: 11, icon: '🍺', name: 'Teure Häfen',          text: 'Die Taverne verlangt 25 % mehr.',            mod: { shopCost: 0.25 } },
  { lvl: 12, icon: '⛓', name: 'Gepanzerte Kronwacht',    text: 'Gegner haben 1 Rüstung.',                    mod: { enemyArmor: 1 } },
  { lvl: 13, icon: '🪙', name: 'Mageres Kopfgeld',     text: 'Siege bringen 20 % weniger Gold.',           mod: { goldMult: -0.2 } },
  { lvl: 14, icon: '🗡', name: 'Scharfe Klingen',      text: 'Gegner treffen öfter kritisch.',             mod: { enemyCrit: 0.08 } },
  { lvl: 15, icon: '🏴', name: 'Kaiserliches Gefolge', text: 'Bosse: ein Begleiter mehr und 20 % mehr Leben, Kopfgeldjäger etwas stärker.', mod: { bossEscort: 1, bossHp: 0.2, eliteMult: 0.05 } },   // GEGNER-WERTE: Rest von Stufe 5
  { lvl: 16, icon: '🏜', name: 'Ausgedörrt',           text: 'Heilung nach Siegen noch einmal geringer.',  mod: { winHeal: -0.25 } },
  { lvl: 17, icon: '⚡', name: 'Flinke Gegner',        text: 'Gegner +1 Tempo.',                           mod: { enemySpd: 1 } },
  { lvl: 18, icon: '🔩', name: 'Stählerne Haut',       text: 'Gegner +1 Rüstung, +5 % Angriff und heilen sich mehr.',     mod: { enemyArmor: 1, enemyRegen: 0.02, enemyAtk: 0.05 } },
  { lvl: 19, icon: '⛈', name: 'Sturmsaison',          text: 'Gegner +20 % Leben und +12 % Angriff.',      mod: { enemyHp: 0.2, enemyAtk: 0.12 } },
  { lvl: 20, icon: '🌑', name: 'Ende der Welt',        text: 'Alle Gegner +20 % Leben, Bosse +25 % Leben und Angriff, noch mehr Nachschub.', mod: { bossAtk: 0.25, bossHp: 0.25, waveExtra: 1, enemyHp: 0.2 } }
];

// Belohnung beim ersten Sieg auf einer Stufe: Berry sofort, dazu Optik (cosmetics.js, req heat)
GL.data.heatReward = lvl => ({ berry: 150 * lvl + (lvl % 5 === 0 ? 1000 : 0) });
