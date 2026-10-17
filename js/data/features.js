// Freischaltungen im Hauptquartier: Neue Spieler sehen erst wenig, mit jedem Piratenrang (Level) kommt etwas dazu.
//   lvl   = ab diesem Level (Rang 1 = Level 1)
//   or    = alternativ freigeschaltet, wenn diese Bedingung schon erfüllt ist (profile => bool)
//   tab   = HQ-Reiter, den die Freischaltung öffnet
//   art   = kleines Bild im Pop-up (siehe featureArt in render.js)
//   steps = zwei, drei kurze Sätze „So geht's“
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.features = [
  { id: 'quests',    lvl: 2, name: 'Aufträge',       art: 'scroll', text: 'Kleine Aufgaben für zwischendurch. Jeden Tag kommen neue.',
    steps: ['Steht oben im Hauptquartier', 'Erledigt sich nebenbei beim Spielen', 'Abholen bringt Berry und Rang-EP'] },
  { id: 'schmiede',  lvl: 3, tab: 'schmiede', name: 'Die Schmiede', art: 'anvil', text: 'Ausrüstung aus deinen Runs landet hier. Du kannst sie verbessern und mit auf See nehmen.',
    steps: ['Ausrüstung findest du in Runs', 'Mit Berry eine Stufe höher schmieden', 'Antippen = beim nächsten Run dabei'] },
  { id: 'lager',     lvl: 4, tab: 'lager', name: 'Das Lager', art: 'crate', text: 'Proviant und Hilfsmittel, die jeden Run etwas leichter machen.',
    steps: ['Beim Händler kaufen', 'Im Lager einpacken', 'Wirkt ab dem nächsten Run'] },
  { id: 'haendler',  lvl: 4, tab: 'haendler', name: 'Der Händler', art: 'stall', text: 'Hier gibst du Berry für Proviant und Hilfsmittel aus.',
    steps: ['Berry gibt es für jeden Run', 'Gekauftes liegt im Lager'] },
  { id: 'kammer',    lvl: 5, tab: 'kammer', name: 'Die Schatzkammer', art: 'chest', text: 'Artefakte von Bossen und Raids. Jedes wird stärker, je öfter du es findest.',
    steps: ['Bosse lassen manchmal Artefakte fallen', 'Bis zu drei kommen mit auf See'],
    or: p => (p.artifacts && Object.keys(p.artifacts).length > 0) || Object.keys(p.vault || {}).length > 0 },
  { id: 'daily',     lvl: 2, name: 'Tageskarte', art: 'scroll', text: 'Jeden Tag eine neue Karte. Alle starten gleich, ohne Ausbauten, egal welcher Rang. Ab dann entscheiden deine Wahl und das Glück.',
    steps: ['Jederzeit unter „Leinen los“ starten', 'Ein Versuch pro Tag', 'Punkte landen in der Tages-Rangliste'],
    or: p => p.stats && p.stats.runs >= 1 },
  { id: 'rangliste', lvl: 2, tab: 'rangliste', name: 'Die Rangliste', art: 'podium', text: 'Ab jetzt stehst du sichtbar neben den anderen Piraten. Tipp auf einen Namen, um seine Karte zu sehen.',
    steps: ['Jeder Run zählt für deinen Rang', 'Tipp auf Spieler für ihre Visitenkarte'] },
  { id: 'jagd',      lvl: 6, tab: 'lager', name: 'Raid-Jagd', art: 'chest', text: 'Wähle vor dem Ablegen einen Raid-Boss als Ziel. Jeder hat zwei seltene Beutestücke für deine Vitrine.',
    steps: ['Ziel unter „Leinen los“ wählen', 'Ab dem zweiten Meer wartet der Raid', 'Beute landet in der Vitrine im Lager'] },
  { id: 'route',     lvl: 8, name: 'Neue Route: Thriller Bark', art: 'flag', text: 'Im dritten Meer kannst du jetzt zwischen zwei Routen wählen: Enies Lobby oder Thriller Bark mit neuen Bossen.',
    steps: ['Beim Kurs setzen im dritten Meer', 'Eine Insel aus jeder Route steht zur Wahl', 'Neue Gegner, neues Kopfgeld'] },
  { id: 'stammcrew', lvl: 5, tab: 'stammcrew', name: 'Deine Stammcrew', art: 'flag', text: 'Deine feste Crew für Duelle gegen andere Spieler. Bosse lassen ab jetzt Ausrüstung für sie fallen: Waffen, Kleidung und Schmuck mit zufälligen Werten.',
    steps: ['Vier Figuren fest aufstellen', 'Ausrüstung von Bossen anlegen', 'Gegner ähnlicher Stärke herausfordern'],
    or: p => p.stats && p.stats.wins > 0 }
];

// Erste Funde: einmal kurz erklären, was man da gerade bekommen hat (wann es zählt: has(profile))
GL.data.firsts = [
  { id: 'first-trophy', kicker: 'Neu', art: 'chest', tab: 'stammcrew', name: 'Deine Raid-Beute kann jetzt kämpfen',
    text: 'Jedes Stück aus deiner Vitrine ist jetzt auch eine Trophäe für deine Stammcrew: mit eigener Spezialfähigkeit und zufälligen Zusatzwerten. Keine zwei sind gleich. Die Vitrine bleibt, wie sie ist.',
    steps: ['Stammcrew öffnen', 'Beim Platz „Trophäe“ einer Figur tippen', 'Fähigkeit wählen, die zu ihr passt'],
    has: p => (p.gearBag || []).some(x => x.t) },
  { id: 'first-gear', kicker: 'Erster Fund', art: 'anvil', tab: 'stammcrew', name: 'Ausrüstung für deine Stammcrew!',
    text: 'Bosse lassen Waffen, Kleidung und Schmuck fallen. Jedes Teil hat eigene, zufällige Werte. Je seltener, desto mehr: gewöhnlich, selten, episch, legendär. Leg sie deiner Stammcrew an, damit sie in Duellen stärker ist.',
    steps: ['Stammcrew öffnen', 'Auf einen leeren Platz bei einer Figur tippen', 'Teil wählen, fertig. Freunde sehen es auf deiner Karte'],
    has: p => (p.gearBag || []).length > 0 },
  { id: 'first-loot', kicker: 'Erster Fund', art: 'chest', tab: 'lager', name: 'Dein erstes Raid-Beutestück!',
    text: 'Raid-Beute ist selten und gehört dir für immer. Sie liegt in deiner Vitrine im Lager. Bis zu drei Stücke kannst du ausstellen, die sehen alle auf deiner Karte in der Rangliste.',
    steps: ['Lager öffnen, ganz unten ist die Vitrine', '„Ausstellen“ antippen', 'Freunde sehen es auf deiner Karte'],
    has: p => Object.keys(p.loot || {}).length > 0 },
  { id: 'first-epic', kicker: 'Erster Fund', art: 'anvil', tab: 'schmiede', name: 'Episch! Besondere Ausrüstung',
    text: 'Epische und legendäre Ausrüstung ist deutlich stärker als normale. Heb sie gut auf: In der Schmiede verbesserst du sie und nimmst sie mit auf See.',
    steps: ['Liegt jetzt in der Schmiede', 'Mit Berry eine Stufe höher schmieden', 'Antippen = beim nächsten Run dabei'],
    has: p => (p.chest || []).some(it => it.r >= 2) },
  { id: 'first-artifact', kicker: 'Erster Fund', art: 'chest', tab: 'kammer', name: 'Ein Artefakt!',
    text: 'Artefakte lassen Bosse und Raids fallen. Findest du dasselbe noch einmal, wird es stärker.',
    steps: ['Liegt in der Schatzkammer', 'Bis zu drei kommen mit auf See'],
    has: p => Object.keys(p.vault || {}).length > 0 }
];
