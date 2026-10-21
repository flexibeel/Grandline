// Eigene Fähigkeit jeder Figur und jedes Bosses, nach id.
//   mods  = reine Werte (Aufbau wie in types.js)
//   kind  = Sonderfähigkeit, die im Kampfsystem programmiert ist (js/engine/battle.js),
//           value = Stärke. Gleiche kind-Werte kann man für neue Figuren wiederverwenden:
//     ramp          +value Angriff nach jedem eigenen Treffer
//     slow          zu Kampfbeginn verlieren alle Gegner value Tempo
//     sniper        greift immer den Gegner mit den wenigsten Leben an
//     medic         heilt am Rundenende das am schwersten verletzte Crewmitglied um value
//     execute       Gegner unter 25 % Leben: value Chance auf sofortigen Sieg
//     revive        steht einmal pro Kampf mit value Anteil Leben wieder auf
//     thorns        wer diese Figur trifft, erleidet value Schaden
//     rally         zu Kampfbeginn +value Angriff für die ganze Crew
//     burn          Treffer verbrennen alle anderen Gegner (value Anteil vom Schaden)
//     curse         zu Kampfbeginn verliert der stärkste Gegner value Anteil Leben
//     mimic         kopiert zu Kampfbeginn den Angriff des stärksten Crewmitglieds
//     oasis         zu Kampfbeginn heilt die ganze Crew value Leben
//     lifesteal     heilt sich um value Anteil des Schadens
//     chain         Treffer springen auf das nächste Ziel über (value Anteil)
//     double        greift zweimal pro Runde an
//     taunt         Leibwache: die Gegenseite greift zuerst diese Figur an (Scharfschützen ausgenommen)
//     bully         greift immer den Gegner mit dem meisten Angriff an
//     pack          +value Angriff für jeden gefallenen Verbündeten
//
//   status = Zustand, den die Fähigkeit verteilt (hält mehrere Runden, siehe GL.data.statuses):
//     { key, rounds, when: 'start' | 'hit' | 'every', n (bei every: alle n Runden),
//       target: 'all' | 'front' | 'target', chance (bei hit), value (z. B. Schaden pro Runde) }
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.abilities = {
  // Strohhutbande
  ruffy:   { name: 'Gum-Gum-Kraft',      kind: 'ramp', value: 1,      text: 'Wird nach jedem eigenen Treffer um 1 Angriff stärker (für diesen Kampf).' },
  zorro:   { name: 'Drei-Schwerter-Stil', text: '+25 % Chance auf kritische Treffer.', mods: [{ scope: 'char:zorro', crit: 0.25 }] },
  nami:    { name: 'Klima-Taktstock',    kind: 'slow', value: 3,      text: 'Zu Kampfbeginn verlieren alle Gegner 3 Tempo.' },
  lysop:   { name: 'Scharfschütze',      kind: 'sniper',              text: 'Greift immer den Gegner mit den wenigsten Leben an.' },
  sanji:   { name: 'Diable Jambe',       text: '+60 % Schaden gegen Bosse.', mods: [{ scope: 'char:sanji', bossPct: 0.6 }] },
  chopper: { name: 'Rumble Ball',        kind: 'medic', value: 5,     text: 'Heilt am Ende jeder Runde das am schwersten verletzte Crewmitglied um 5.' },
  robin:   { name: 'Clutch',             kind: 'execute', value: 0.35, text: 'Trifft sie einen Gegner unter 25 % Leben, besiegt sie ihn mit 35 % Chance sofort.' },
  franky:  { name: 'Franky-Panzer',      text: 'Erleidet 3 weniger Schaden pro Treffer.', mods: [{ scope: 'char:franky', armor: 3 }] },
  brook:   { name: 'Seelenkönig',        kind: 'revive', value: 0.25, text: 'Steht einmal pro Kampf mit 25 % Leben wieder auf. Seine Musik macht Mut: Crew ist 2 Runden immun gegen Furcht.',
             status: { key: 'brave', rounds: 2, when: 'start', target: 'allies' } },

  // Marine
  garp:    { name: 'Faust der Liebe',    kind: 'thorns', value: 3,    text: 'Wer Garp trifft, erleidet selbst 3 Schaden.' },
  hina:    { name: 'Fessel-Frucht',      kind: 'slow', value: 2,      text: 'Zu Kampfbeginn verlieren alle Gegner 2 Tempo. Ihre Treffer fesseln mit 25 % Chance (Betäubt).',
             status: { key: 'stun', rounds: 1, when: 'hit', target: 'target', chance: 0.25 } },
  tashigi: { name: 'Für Gerechtigkeit',  kind: 'rally', value: 2,     text: 'Zu Kampfbeginn bekommt die ganze Crew +2 Angriff.' },
  koby:    { name: 'Observations-Haki',  text: '+20 % Ausweichen und +1 Tempo.', mods: [{ scope: 'char:koby', dodge: 0.2, spd: 1 }] },

  // CP9
  kalifa:  { name: 'Seifenschaum',       kind: 'curse', value: 0.2,   text: 'Zu Kampfbeginn verliert der stärkste Gegner 20 % seines Lebens.' },
  kumadori:{ name: 'Lebensrückkehr',     kind: 'revive', value: 0.35, text: 'Steht einmal pro Kampf mit 35 % Leben wieder auf.' },
  blueno:  { name: 'Tekkai',             text: 'Erleidet 3 weniger Schaden pro Treffer.', mods: [{ scope: 'char:blueno', armor: 3 }] },
  jabra:   { name: 'Wolfsform',          text: '+25 % Schaden.', mods: [{ scope: 'char:jabra', dmgPct: 0.25 }] },

  // Baroque Works
  bonclay: { name: 'Mane-Mane-Frucht',   kind: 'mimic',               text: 'Kopiert zu Kampfbeginn den Angriff des stärksten Crewmitglieds.' },
  mr5:     { name: 'Bomben-Frucht',      kind: 'burn', value: 0.3,    text: 'Seine Treffer sprengen alle anderen Gegner für 30 % des Schadens.' },
  vivi:    { name: 'Prinzessin',         kind: 'oasis', value: 8,     text: 'Zu Kampfbeginn heilt die ganze Crew 8 Leben.' },
  mr1:     { name: 'Klingenkörper',      text: 'Erleidet 2 weniger Schaden und +15 % Krit-Chance.', mods: [{ scope: 'char:mr1', armor: 2, crit: 0.15 }] },

  // Freischaltbare ohne eigene Boss-Fähigkeit
  jinbei:  { name: 'Fischmenschen-Karate', kind: 'thorns', value: 3, text: 'Wer Jinbei trifft, erleidet selbst 3 Schaden.' },
  ace:     { name: 'Feuerfaust',        kind: 'burn', value: 0.3,    text: 'Trifft alle anderen Gegner für 30 % des Schadens und setzt sie in Brand (2 pro Runde).',
             status: { key: 'burning', rounds: 2, when: 'hit', target: 'target', value: 2 } },
  law:     { name: 'Room',              kind: 'curse', value: 0.2,   text: 'Zu Kampfbeginn verliert der stärkste Gegner 20 % seines Lebens.' },

  // Bosse (gelten auch, wenn man sie freigeschaltet hat und selbst spielt)
  smoker:      { name: 'Rauchkörper',     text: 'Erleidet 20 % weniger Schaden. Alle 3 Runden betäubt sein Rauch den Vordersten.',
                 mods: [{ scope: 'char:smoker', guard: 0.2 }], status: { key: 'stun', rounds: 1, when: 'every', n: 4, target: 'front' } },
  arlong:      { name: 'Haifischzähne',   text: '+30 % Schaden. Seine Bisse lassen bluten (2 Schaden pro Runde, 3 Runden).',
                 mods: [{ scope: 'char:arlong', dmgPct: 0.3 }], status: { key: 'bleed', rounds: 3, when: 'hit', target: 'target', value: 2 } },
  crocodile:   { name: 'Sandsturm',       kind: 'lifesteal', value: 0.5, text: 'Heilt sich um die Hälfte seines Schadens. Zu Kampfbeginn: Furcht für die ganze Crew (2 Runden).',
                 status: { key: 'fear', rounds: 2, when: 'start', target: 'all' } },
  enel:        { name: 'Donnergott',      kind: 'chain', value: 0.5,   text: 'Blitze springen über (50 % Schaden). Alle 3 Runden betäubt er den Vordersten.',
                 status: { key: 'stun', rounds: 1, when: 'every', n: 4, target: 'front' } },
  'rob-lucci': { name: 'Rokushiki',       kind: 'double',              text: 'Greift zweimal pro Runde an. Zu Kampfbeginn: Furcht für die ganze Crew (2 Runden).',
                 status: { key: 'fear', rounds: 2, when: 'start', target: 'all' } },
  kaku:        { name: 'Giraffen-Klinge', text: '30 % Krit-Chance. Seine Treffer schwächen: Ziel nimmt 3 Runden 25 % mehr Schaden.',
                 mods: [{ scope: 'char:kaku', crit: 0.3 }], status: { key: 'weak', rounds: 3, when: 'hit', target: 'target' } },

  // Fischmenscheninsel
  hody:    { name: 'Energie-Steroide',  text: '+20 % Schaden und 20 % Krit-Chance. Seine Bisse lassen bluten (2 Schaden pro Runde, 3 Runden).',
             mods: [{ scope: 'char:hody', dmgPct: 0.2, crit: 0.2 }], status: { key: 'bleed', rounds: 3, when: 'hit', target: 'target', value: 2 } },
  vander:  { name: 'Mato-Mato-Frucht',  kind: 'chain', value: 0.4, text: 'Seine Würfe treffen immer: Sie springen weiter (40 % Schaden). Alle 3 Runden ist der Vorderste markiert (geschwächt).',
             status: { key: 'weak', rounds: 2, when: 'every', n: 3, target: 'front' } },
  hyouzou: { name: 'Gift-Klingen',      text: 'Acht Arme, acht Schwerter: Treffer vergiften (2 pro Runde, 3 Runden).',
             status: { key: 'poison', rounds: 3, when: 'hit', target: 'target', value: 2, chance: 0.6 } },
  zeo:     { name: 'Unsichtbar',        text: 'Weicht 25 % aller Angriffe aus.', mods: [{ scope: 'char:zeo', dodge: 0.25 }] },
  daruma:  { name: 'Zahnreihen',        text: 'Gräbt sich heran und beißt: Treffer lassen bluten (2 pro Runde, 2 Runden).',
             status: { key: 'bleed', rounds: 2, when: 'hit', target: 'target', value: 2 } },
  dosun:   { name: 'Hammerhai-Schädel', text: 'Erleidet 2 weniger Schaden pro Treffer.', mods: [{ scope: 'char:dosun', armor: 2 }] },
  ikaros:  { name: 'Zehn Arme',         kind: 'double', text: 'Greift zweimal pro Runde an.' },

  // Thriller Bark
  moria:   { name: 'Schattenraub',      kind: 'curse', value: 0.18, text: 'Zu Kampfbeginn stiehlt er dem stärksten Gegner 18 % des Lebens. Seine Schatten machen Angst (Furcht, 2 Runden).',
             status: { key: 'fear', rounds: 2, when: 'start', target: 'all' } },
  kuma:    { name: 'Nikyu-Nikyu',       text: 'Erleidet 25 % weniger Schaden. Alle 3 Runden stößt er den Vordersten weg (Betäubt).',
             mods: [{ scope: 'char:kuma', guard: 0.25 }], status: { key: 'stun', rounds: 1, when: 'every', n: 4, target: 'front' } },
  teach:   { name: 'Finsternis',        kind: 'lifesteal', value: 0.4, text: 'Verschlingt Schaden: heilt sich um 40 % davon. Zu Kampfbeginn schwächt er alle (3 Runden).',
             status: { key: 'weak', rounds: 3, when: 'start', target: 'all' } },
  absalom: { name: 'Durchsichtig',      text: 'Weicht 30 % aller Angriffe aus.', mods: [{ scope: 'char:absalom', dodge: 0.3 }] },
  perona:  { name: 'Negative Hollows', text: 'Zu Kampfbeginn: Furcht für die ganze Crew (2 Runden).', status: { key: 'fear', rounds: 2, when: 'start', target: 'all' } },
  hogback: { name: 'Zombie-Chirurg',   kind: 'medic', value: 6, text: 'Flickt am Rundenende den am schwersten verletzten Verbündeten (6 Leben).' },
  duval:   { name: 'Eisenmaske',       text: 'Erleidet 3 weniger Schaden pro Treffer.', mods: [{ scope: 'char:duval', armor: 3 }] },

  // Kopfgeld-Ziele (Mini-Bosse, siehe hunted.js)
  morgan:  { name: 'Axt-Hand',         text: 'Seine Axt trifft hart: Ziel ist 2 Runden geschwächt (+25 % Schaden).',
             status: { key: 'weak', rounds: 2, when: 'hit', target: 'target', chance: 0.5 } },
  nero:    { name: 'Soru',             kind: 'double', text: 'Greift zweimal pro Runde an.' },
  buggy:   { name: 'Bara-Bara-Frucht', text: 'Weicht 25 % aller Angriffe aus, sein Körper zerfällt in Teile.', mods: [{ scope: 'char:buggy', dodge: 0.25 }] },
  kuro:    { name: 'Shakushi',         kind: 'double', text: 'Greift zweimal pro Runde an.' },
  krieg:   { name: 'Giftgas-Bombe',    text: 'Zu Kampfbeginn: Gift für die ganze Crew (2 Schaden pro Runde, 3 Runden).',
             status: { key: 'poison', rounds: 3, when: 'start', target: 'all', value: 2 } },
  mr3:     { name: 'Kerzen-Fessel',    text: 'Alle 2 Runden wird der Vorderste in Wachs gegossen (Betäubt).',
             status: { key: 'stun', rounds: 1, when: 'every', n: 2, target: 'front' } },
  wapol:   { name: 'Baku-Baku-Frucht', kind: 'lifesteal', value: 0.4, text: 'Frisst sich satt: heilt sich um 40 % seines Schadens.' },
  bellamy: { name: 'Spring-Spring',    text: 'Zu Kampfbeginn: Furcht für die ganze Crew (2 Runden).',
             status: { key: 'fear', rounds: 2, when: 'start', target: 'all' } },
  fukuro:  { name: 'Tekkai',           text: 'Erleidet 30 % weniger Schaden.', mods: [{ scope: 'char:fukuro', guard: 0.3 }] },
  spandam: { name: 'Hilferuf',         kind: 'rally', value: 3, text: 'Zu Kampfbeginn bekommen alle Gegner +3 Angriff.' },
  foxy:    { name: 'Noro-Noro-Strahl', text: 'Seine Treffer verlangsamen: Ziel ist 2 Runden geschwächt (+25 % Schaden).',
             status: { key: 'weak', rounds: 2, when: 'hit', target: 'target' } },

  jango:   { name: 'Eins, zwei… Jango!', text: 'Hypnose: alle 4 Runden schläft dein vorderstes Crewmitglied ein (setzt 1 Aktion aus).',
             status: { key: 'stun', rounds: 1, when: 'every', n: 4, target: 'front' } },
  gin:     { name: 'Tonfa-Dämon',      kind: 'bully', text: 'Geht immer auf dein stärkstes Crewmitglied los. Treffer schwächen (30 %: +25 % Schaden, 2 Runden).',
             status: { key: 'weak', rounds: 2, when: 'hit', target: 'target', chance: 0.3 } },
  pearl:   { name: 'Eisenwand',        kind: 'taunt', text: 'Seine Schilde fangen alles ab: deine Crew muss ihn zuerst schlagen. Erleidet 25 % weniger Schaden.',
             mods: [{ scope: 'char:pearl', guard: 0.25 }] },
  chew:    { name: 'Wasserkanone',     kind: 'burn', value: 0.3, text: 'Spuckt Wasser wie andere Leute Kirschkerne: Treffer spritzen (30 % Schaden an alle anderen).' },
  zala:    { name: 'Toge-Toge',        kind: 'thorns', value: 2, text: 'Ganz Stacheln, null Umarmung: wer sie trifft, erleidet 2 Schaden.' },
  mr4:     { name: 'Lassoos Kanonade', kind: 'burn', value: 0.35, text: 'Sein Hund schießt Bomben: Treffer explodieren (35 % Schaden an alle anderen).' },
  wanze:   { name: 'Ramen-Kenpo',      kind: 'chain', value: 0.4, text: 'Nudeln aus der Nase: Treffer springen auf das nächste Ziel über (40 % Schaden).' },
  hatchan: { name: 'Sechs Schwerter', kind: 'chain', value: 0.35, text: 'Sechs Arme, sechs Klingen: Treffer springen über (35 % Schaden).' },
  mr9:     { name: 'Baroque-Hinterhalt', kind: 'rally', value: 2, text: 'Zu Kampfbeginn bekommen alle Gegner +2 Angriff.' },
  mr1:     { name: 'Klingenkörper',   text: 'Sein Körper ist eine Klinge: erleidet 25 % weniger Schaden, +20 % Krit-Chance.',
             mods: [{ scope: 'char:mr1', guard: 0.25, crit: 0.2 }] },
  ohm:     { name: 'Eisenwolke',      text: 'Alle 3 Runden fesselt sein Wolkenzaun den Vordersten (Betäubt).',
             status: { key: 'stun', rounds: 1, when: 'every', n: 4, target: 'front' } },
  blueno:  { name: 'Tekkai-Wand',     text: 'Erleidet 30 % weniger Schaden. Zu Kampfbeginn: Furcht für die ganze Crew (1 Runde).',
             mods: [{ scope: 'char:blueno', guard: 0.3 }], status: { key: 'fear', rounds: 1, when: 'start', target: 'all' } },
  jabra:   { name: 'Wolfs-Frucht',    text: '+30 % Schaden. Seine Krallen lassen bluten (3 Schaden pro Runde, 2 Runden).',
             mods: [{ scope: 'char:jabra', dmgPct: 0.3 }], status: { key: 'bleed', rounds: 2, when: 'hit', target: 'target', value: 3 } },

  // Neue Figuren
  marco:      { name: 'Phönix-Flammen',  kind: 'revive', value: 0.4, text: 'Steht einmal pro Kampf mit 40 % Leben wieder auf.' },
  whitebeard: { name: 'Gura-Gura-Beben', kind: 'burn', value: 0.35, text: 'Seine Treffer erschüttern alle anderen Gegner (35 % des Schadens).' },
  mihawk:     { name: 'Schwarzes Schwert', text: '+30 % Krit-Chance, Krits treffen noch härter.', mods: [{ scope: 'char:mihawk', crit: 0.3, critMult: 0.5 }] },
  hancock:    { name: 'Mero-Mero-Frucht', text: 'Ihre Treffer versteinern mit 20 % Chance (Betäubt).',
                status: { key: 'stun', rounds: 1, when: 'hit', target: 'target', chance: 0.2 } },
  shanks:     { name: 'Königs-Haki',     text: 'Zu Kampfbeginn: Furcht für alle Gegner (2 Runden).',
                status: { key: 'fear', rounds: 2, when: 'start', target: 'all' } },

  // Raid-Bosse
  kizaru:      { name: 'Lichtgeschwindigkeit', kind: 'double', text: 'Greift zweimal pro Runde an. Alle 2 Runden blendet er alle (Furcht, 1 Runde).',
                 status: { key: 'fear', rounds: 1, when: 'every', n: 2, target: 'all' } },
  doflamingo:  { name: 'Fadenkäfig',      kind: 'chain', value: 0.6,   text: 'Fäden springen über (60 % Schaden). Zu Kampfbeginn: Furcht für die ganze Crew (3 Runden).',
                 status: { key: 'fear', rounds: 3, when: 'start', target: 'all' } },

  // ---- Schlimmste Generation ----
  kid:     { name: 'Magnet-Frucht',  kind: 'chain', value: 0.3, text: 'Zieht Metall heran: Treffer springen auf den nächsten Gegner über (30 % Schaden).' },
  killer:  { name: 'Massacre Soldier', text: '+15 % Krit-Chance. Seine Sicheln lassen bluten (3 Schaden pro Runde, 2 Runden).',
             mods: [{ scope: 'char:killer', crit: 0.15 }], status: { key: 'bleed', rounds: 2, when: 'hit', target: 'target', value: 3, chance: 0.4 } },
  bonney:  { name: 'Alters-Frucht',  kind: 'curse', value: 0.18, text: 'Zu Kampfbeginn lässt sie den stärksten Gegner altern: er verliert 18 % seines Lebens.' },
  drake:   { name: 'Dino-Form',      kind: 'thorns', value: 2, text: 'Schuppenpanzer: erleidet 1 weniger Schaden, wer ihn trifft, erleidet 2.',
             mods: [{ scope: 'char:drake', armor: 1 }] },
  hawkins: { name: 'Strohpuppe',     kind: 'revive', value: 0.3, text: 'Die Karten sagen: einmal pro Kampf steht er mit 30 % Leben wieder auf.' },
  apoo:    { name: 'Ton-Ton-Frucht', kind: 'burn', value: 0.25, text: 'Seine Musik trifft alle anderen Gegner mit (25 % Schaden).' },

  // ---- Tiere der Grand Line (Gegner) ----
  boar:       { name: 'Ansturm',      kind: 'ramp', value: 1,  text: 'Wird mit jedem Treffer wütender: +1 Angriff pro Treffer.' },
  crab:       { name: 'Harter Panzer', kind: 'thorns', value: 1, text: 'Wer die Krabbe trifft, piekst sich: 1 Schaden zurück.' },
  gull:       { name: 'Sturzflug',    kind: 'sniper',           text: 'Stürzt sich immer auf dein Crewmitglied mit den wenigsten Leben.' },
  bananacroc: { name: 'Krokobiss',    text: 'Bisse lassen bluten (2 Schaden pro Runde, 2 Runden).',
                status: { key: 'bleed', rounds: 2, when: 'hit', target: 'target', value: 2, chance: 0.45 } },
  wolf:       { name: 'Heulen',       text: 'Sein Heulen macht Angst: Treffer verursachen manchmal Furcht.',
                status: { key: 'fear', rounds: 1, when: 'hit', target: 'target', chance: 0.3 } },
  seaking:    { name: 'Schwanzschlag', kind: 'burn', value: 0.25, text: 'Sein Schwanz trifft auch alle anderen (25 % Schaden).' },
  bat:        { name: 'Blutsauger',   kind: 'lifesteal', value: 0.35, text: 'Heilt sich um 35 % seines Schadens.' },
  // ART3: Inselbewohner
  'mo-skorpion':   { name: 'Giftstachel',  text: 'Sticht giftig: Treffer lassen manchmal bluten (2 Schaden pro Runde, 2 Runden). Freundlich ist er nur zu Sand.',
                     status: { key: 'bleed', rounds: 2, when: 'hit', target: 'target', value: 2, chance: 0.3 } },
  'mo-schneewolf': { name: 'Eisheulen',    text: 'Heult so kalt, dass Treffer manchmal Furcht auslösen. Chopper kennt ihn. Chopper ist nicht begeistert.',
                     status: { key: 'fear', rounds: 1, when: 'hit', target: 'target', chance: 0.25 } },
  'mo-sumpfaffe':  { name: 'Affenwut',     kind: 'ramp', value: 1, text: 'Wird mit jedem Treffer wütender: +1 Angriff pro Treffer. Hat Gründe. Sagt sie nicht.' },
  'mo-wolke':      { name: 'Wolkenspeer',  kind: 'sniper', text: 'Zielt von oben auf dein Crewmitglied mit den wenigsten Leben. Höflich, aber gnadenlos.' },
  'mo-qualle':     { name: 'Nesseln',      kind: 'thorns', value: 1, text: 'Wer sie anfasst, bereut es: 1 Schaden zurück. Sieht trotzdem hübsch aus.' },
  'mo-fischmensch':{ name: 'Fischmenschen-Karate', kind: 'ramp', value: 1, text: 'Jeder Treffer macht ihn schneller warm: +1 Angriff pro Treffer.' },
  'mo-zombie':     { name: 'Schon tot',    kind: 'lifesteal', value: 0.2, text: 'Heilt sich um 20 % seines Schadens. Er hat Schlimmeres überlebt. Technisch gesehen nicht.' },
  'mo-roboter':    { name: 'Panzerplatten', kind: 'thorns', value: 1, text: 'Wer ihn trifft, erleidet 1 Schaden. Quietscht dabei beleidigt.' },

  // ---- Inhalts-Update: neue Crewmitglieder ----
  alvida:  { name: 'Sube-Sube-Frucht', text: 'Glatte Haut: erleidet 2 weniger Schaden und weicht 10 % aus.', mods: [{ scope: 'char:alvida', armor: 2, dodge: 0.1 }] },
  cabaji:  { name: 'Akrobaten-Klinge', text: '+20 % Krit-Chance und +1 Tempo.', mods: [{ scope: 'char:cabaji', crit: 0.2, spd: 1 }] },
  mohji:   { name: 'Richie, fass!',    kind: 'rally', value: 1, text: 'Sein Löwe brüllt: zu Kampfbeginn +1 Angriff für die ganze Crew. Gegner zittern (Furcht, 1 Runde).',
             status: { key: 'fear', rounds: 1, when: 'start', target: 'all' } },
  kuroobi: { name: 'Senbonzuke',       kind: 'thorns', value: 2, text: 'Fischmenschen-Karate: wer ihn trifft, erleidet 2 Schaden. Erleidet selbst 1 weniger.',
             mods: [{ scope: 'char:kuroobi', armor: 1 }] },
  chu:     { name: 'Hundert Wasserpistolen', kind: 'sniper', text: 'Spuckt gezielt: greift immer den Gegner mit den wenigsten Leben an. +10 % Krit-Chance.',
             mods: [{ scope: 'char:chu', crit: 0.1 }] },
  sabo:    { name: 'Drachenklaue',     kind: 'execute', value: 0.4, text: 'Gegner unter 25 % Leben besiegt er mit 40 % Chance sofort. Seine Treffer setzen in Brand.',
             status: { key: 'burning', rounds: 2, when: 'hit', target: 'target', value: 2, chance: 0.3 } },
  ivankov: { name: 'Hormon-Frucht',    kind: 'oasis', value: 10, text: 'Zu Kampfbeginn heilt die ganze Crew 10 Leben und ist 2 Runden mutig.',
             status: { key: 'brave', rounds: 2, when: 'start', target: 'allies' } },
  koala:   { name: 'Fischmenschen-Karate', kind: 'lifesteal', value: 0.3, text: 'Heilt sich um 30 % ihres Schadens.' },
  dragon:  { name: 'Sturm der Revolution', kind: 'slow', value: 3, text: 'Zu Kampfbeginn verlieren alle Gegner 3 Tempo und sind 2 Runden geschwächt.',
             status: { key: 'weak', rounds: 2, when: 'start', target: 'all' } },
  beckman: { name: 'Vizekapitän',      kind: 'rally', value: 2, text: 'Ruhiger Kopf: zu Kampfbeginn +2 Angriff für die ganze Crew.' },
  roo:     { name: 'Grillfleisch',     kind: 'medic', value: 5, text: 'Teilt sein Fleisch: heilt am Rundenende das am schwersten verletzte Crewmitglied um 5.' },
  yasopp:  { name: 'Meisterschütze',   kind: 'sniper', text: 'Trifft immer den schwächsten Gegner. +25 % Krit-Chance.', mods: [{ scope: 'char:yasopp', crit: 0.25 }] },
  aokiji:  { name: 'Ice Age',          kind: 'slow', value: 3, text: 'Zu Kampfbeginn verlieren alle Gegner 3 Tempo. Alle 4 Runden friert er den Vordersten ein (Betäubt).',
             status: { key: 'stun', rounds: 1, when: 'every', n: 4, target: 'front' } },
  vista:   { name: 'Blumenschwert',    text: '+20 % Krit-Chance und härtere Krits.', mods: [{ scope: 'char:vista', crit: 0.2, critMult: 0.3 }] }

};
// Seltener Raid: Shanks nutzt im Raid dieselbe Fähigkeit wie als Crewmitglied (Königs-Haki)

// Zustände, die mehrere Runden halten. good = Vorteil für den Träger.
GL.data.statuses = {
  fear:  { name: 'Furcht',      icon: '!', good: false, text: '35 % weniger Schaden. Konter: Helfer reinigen am Rundenende, Brecher sind immun.' },
  stun:  { name: 'Betäubt',     icon: 'z', good: false, text: 'Setzt die nächste Aktion aus.' },
  bleed: { name: 'Blutung',     icon: '~', good: false, text: 'Verliert am Rundenende Leben.' },
  poison: { name: 'Gift',       icon: '~', good: false, text: 'Verliert am Rundenende Leben.' },
  burning: { name: 'Brand',     icon: '^', good: false, text: 'Verliert am Rundenende Leben.' },
  weak:  { name: 'Geschwächt',  icon: 'v', good: false, text: 'Nimmt 25 % mehr Schaden.' },
  brave: { name: 'Mut',         icon: '+', good: true,  text: 'Immun gegen Furcht und Betäubung.' },
  // VERTIEFUNG: neue Zustände für Reaktionen (Brand + Gift = Explosion, Frost + Schock = Zersplittern, Brand + Frost = Dampf, Geschwächt + Furcht = Panik)
  frost: { name: 'Frost',       icon: '*', good: false, text: 'Langsamer. Mit Schock: Zersplittern, mit Brand: Dampf.' },
  shock: { name: 'Schock',      icon: '%', good: false, text: 'Springt beim nächsten Treffer auf einen Nachbarn. Mit Frost: Zersplittern.' },
  blind: { name: 'Blind',       icon: 'o', good: false, text: '25 % der Angriffe verfehlen.' }
};

// Spezialangriff des Kapitäns: lädt sich in Kämpfen auf, einsetzbar gegen Inselbosse und Raids
GL.data.specials = {
  ruffy:  'Gum-Gum-Gatling', zorro: 'Santoryu: Oni Giri', nami: 'Thunderbolt Tempo', lysop: 'Feuerstern',
  sanji: 'Diable Jambe', chopper: 'Monster Point', robin: 'Cien Fleur: Clutch', franky: 'Radikal Beam',
  brook: 'Seelenlied', smoker: 'White Blow', crocodile: 'Desert Spada', enel: 'El Thor', 'rob-lucci': 'Rokuogan',
  kaku: 'Amaashi', arlong: 'Shark on Darts', jinbei: 'Vagabundendrill', ace: 'Hiken', law: 'Gamma Knife'
};
