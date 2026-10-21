// Sprache: Deutsch (Standard) oder Englisch. Übersetzt die fertige Seite über ein Wörterbuch,
// ohne die Spiellogik anzufassen. Etappe 1: Menüs, Knöpfe, Überschriften, Werte, Banden.
// Fehlt ein Eintrag, bleibt der deutsche Text stehen.
window.GL = window.GL || {};

(function () {
  const KEY = 'grandline.lang';
  let lang = 'de';
  try { lang = localStorage.getItem(KEY) || (/^de/i.test(navigator.language || 'de') ? 'de' : 'en'); } catch (e) {}
  const D = {
    // Allgemein
    'Schließen': 'Close', 'Später': 'Later', 'Tipp': 'Tip', 'Rangliste': 'Leaderboard', 'Tageskarte': 'Daily run', 'Siege': 'Wins', 'Runs': 'Runs',
    'Ausrüstung': 'Gear', 'Gegner': 'Enemies', 'Bestwert': 'Best score', 'Härtester Treffer': 'Hardest hit', 'Artefakte': 'Artifacts', 'Schaden': 'Damage',
    'Boss des Meeres': 'Sea boss', 'Angriff': 'Attack', 'Leben': 'HP', 'Tempo': 'Speed', 'Punkte': 'Points', 'Bündnis': 'Alliance', 'Kapitän': 'Captain',
    'Kopieren': 'Copy', 'Weiterspielen': 'Continue', 'Abmelden': 'Log out', 'Endlos': 'Endless', 'Teilen': 'Share', 'Neuigkeiten': 'News', 'Aufträge': 'Quests',
    'Speichern': 'Save', 'Hat nicht geklappt': 'That did not work', 'Runde': 'Round', 'Runden': 'Rounds', 'Bösewicht der Insel': 'Island villain',
    'Schaden gesamt': 'Total damage', 'Legendär': 'Legendary', 'Episch': 'Epic', 'Selten': 'Rare', 'Gewöhnlich': 'Common', 'Schätze': 'Treasures', 'Erwacht': 'Awakened',
    'Set-Bonus': 'Set bonus', 'Duo': 'Duo', 'Start': 'Start', 'Alles klar': 'Got it', 'Ablegen': 'Set sail', 'Noch gesperrt': 'Still locked',
    'Neu freigeschaltet': 'Newly unlocked', 'Der Kampf beginnt!': 'The fight begins!', 'Schneller': 'Faster', 'Vitrine': 'Showcase', 'Annehmen': 'Accept',
    'Bündnisse': 'Alliances', 'Raid': 'Raid', 'Freunde': 'Friends', 'Sticker': 'Sticker', 'Starten': 'Start', 'Anleitung': 'How to play', 'Anmelden': 'Log in',
    'Angemeldet': 'Logged in', 'Fertig': 'Done', 'Zurück': 'Back', 'Berry': 'Berry', 'Kapitäne': 'Captains', 'Statistik': 'Stats', 'Neu starten': 'Restart',
    'Rüstung': 'Armor', 'Schatz': 'Treasure', 'Boni': 'Bonuses', 'Aufstellung': 'Lineup', 'Niederlage': 'Defeat', 'Sieg': 'Victory', 'Inselbosse': 'Island bosses',
    'Bosse': 'Bosses', 'Spielen': 'Play', 'Flagge': 'Flag', 'Hintergrund': 'Background', 'Rahmen': 'Frame', 'Animation': 'Animation', 'Titel': 'Title',
    'Abzeichen': 'Badge', 'Früchte': 'Fruits', 'Crew': 'Crew', 'Konter': 'Counter', 'Neu': 'New', 'neu': 'new', 'Aktive Boni': 'Active bonuses', 'Noch keine': 'None yet',
    'Fast geschafft': 'Almost there', 'Bündnisse in Reichweite': 'Alliances in reach', 'Deine Boni': 'Your bonuses', 'Alle Banden im Wiki': 'All crews in the wiki',
    'Steckbrief': 'Wanted poster', 'Nichts angelegt.': 'Nothing equipped.', 'Kampf': 'Fight', 'Bosskampf': 'Boss fight', 'Weiter': 'Next',
    'Kampf starten': 'Start fight', 'Weitersegeln': 'Sail on', 'Nochmal!': 'Again!', 'Hauptquartier': 'Headquarters', 'Run aufgeben': 'Give up run',
    'Neu laden': 'Reload', '↻ Neu laden': '↻ Reload', 'Vollbild': 'Fullscreen', 'Details': 'Details', 'Kompakt': 'Compact', 'Spezial': 'Special', 'Auto': 'Auto',
    'Deine Crew': 'Your crew', 'Gekauft': 'Bought', '+ Bonus': '+ Bonus', '♥ Duo': '♥ Duo', 'Kampf, Taverne, Schatz, Teufelsfrucht oder Rast.': 'Fight, tavern, treasure, devil fruit or rest.',
    // Spielablauf
    'Wähle deinen Kapitän': 'Choose your captain', 'Ereignis auf See': 'Event at sea', 'Neue Insel': 'New island', 'Taverne': 'Tavern', 'Hafentaverne': 'Harbor tavern',
    'Der erste Kauf ist gratis.': 'Your first hire is free.', 'Welche Frucht isst du?': 'Which fruit do you eat?', 'Je seltener die Frucht, desto stärker ihr Effekt.': 'The rarer the fruit, the stronger its effect.',
    'Welchen Schatz nimmst du mit?': 'Which treasure do you take?', 'Schätze wirken bis zum Ende des Runs. Je seltener, desto stärker.': 'Treasures last until the end of the run. The rarer, the stronger.',
    'Begegnung auf See': 'Encounter at sea', 'Antippen zum Auswählen, dann bestätigen.': 'Tap to select, then confirm.', 'Aufstellung automatisch:': 'Automatic lineup:',
    'Brecher vorne': 'Breakers in front', 'Die Grand Line gehört dir': 'The Grand Line is yours', 'Die Crew ist untergegangen': 'Your crew went down',
    'Rang-Aufstieg!': 'Rank up!', 'Piratenrang:': 'Pirate rank:', 'Neue Ausrüstung für die Schmiede': 'New gear for the forge', 'Beute für deine Stammcrew': 'Loot for your squad',
    'Neu in der Schatzkammer': 'New in the treasury', 'Code teilen': 'Share code', 'Als Nächstes freischalten': 'Unlock next', 'Gegner gefunden': 'Opponent found',
    'Siegchance': 'Win chance', '⚔ Angreifen': '⚔ Attack', 'Anderer': 'Another', 'Deine Stammcrew': 'Your squad', '⚔ Gegner suchen': '⚔ Find opponent', 'ähnliche Stärke': 'similar strength',
    'Neu würfeln': 'Reroll', 'Kopfgeld-Ziel': 'Bounty target', 'Gefahr gering': 'Low danger', 'Gefahr mittel': 'Medium danger', 'Gefahr hoch': 'High danger', 'GEFAHR HOCH': 'HIGH DANGER',
    'Tippen zum Starten': 'Tap to start', 'Raid-Boss': 'Raid boss', 'Wille des Kapitäns!': 'Captain’s will!', 'Ausgewichen': 'Dodged', 'Geblockt': 'Blocked', 'Betäubt': 'Stunned',
    'Wut!': 'Rage!', 'Fast geschafft!': 'Almost done!', 'Konter!': 'Counter!', 'Letzter Wille': 'Last will', 'Die Crew gibt nicht auf!': 'The crew won’t give up!',
    'Gemütlich': 'Relaxed', 'Zügig': 'Brisk', 'Schnell': 'Fast', 'Turbo': 'Turbo', 'Besiegt': 'Defeated', 'Mit': 'With',
    // Hauptquartier
    'Im Hafen': 'At the harbor', '‹ Hafen': '‹ Harbor', '‹ Zurück zum Hafen': '‹ Back to harbor', 'Stammcrew': 'Squad', 'Werft': 'Shipyard', 'Schmiede': 'Forge',
    'Schatzkammer': 'Treasury', 'Lager': 'Storage', 'Händler': 'Merchant', 'Kapitänsbuch': 'Captain’s log', 'Rang, Code, Konto': 'Rank, code, account', 'Ausbauten': 'Upgrades', 'Proviant': 'Supplies',
    '⚓ Leinen los!': '⚓ Cast off!', 'Leinen los!': 'Cast off!', 'Die Grand Line ruft!': 'The Grand Line calls!', 'Dein Run läuft noch': 'Your run is still going', 'Raid-Ziel': 'Raid target', 'Heute offen': 'Open today',
    '✓ gespielt': '✓ played', 'Wie weit?': 'How far?', 'Einladen': 'Invite', 'Leistbar': 'Affordable', 'An Bord': 'On board', '📊 Statistik': '📊 Stats', '♥ Freunde': '♥ Friends',
    'Pirat und Aussehen bearbeiten': 'Edit pirate and look', '★ Feedback': '★ Feedback', 'Rechtliches': 'Legal', 'Abholen': 'Claim', 'Ansehen': 'View',
    'Dauerhafte Ausbauten für dein Schiff. Sie gelten für jeden zukünftigen Run.': 'Permanent upgrades for your ship. They apply to every future run.',
    'Oben links geht es zurück zum Run.': 'Top left takes you back to the run.', 'Hafen': 'Harbor', 'Kapitän ': 'Captain ',
    // Profil
    'Dein Pirat': 'Your pirate', 'Erstelle deinen Piraten': 'Create your pirate', 'Piratenname': 'Pirate name', 'Kampfstil': 'Fighting style', 'Rolle': 'Role', 'Aussehen': 'Look',
    'Hut': 'Hat', 'Haare': 'Hair', 'Haut': 'Skin', 'Oberteil': 'Shirt', 'Hose': 'Pants', 'Hutfarbe': 'Hat color', 'Bart': 'Beard', 'Nase': 'Nose', 'Ohne': 'None',
    'Strohhut': 'Straw hat', 'Kopftuch': 'Bandana', 'Mütze': 'Cap', 'Kapuze': 'Hood', 'Locken': 'Curls', 'Zylinder': 'Top hat', 'Dreispitz': 'Tricorn', 'Tierohren': 'Animal ears',
    'Profil erstellen': 'Create profile', 'Profil speichern': 'Save profile', 'Spielbar als Kapitän. Wird mit jedem Piratenrang stärker.': 'Playable as captain. Gets stronger with every pirate rank.',
    'Alles hier sehen andere in der Rangliste. 🔒 zeigt, was dir noch fehlt.': 'Others see all of this on the leaderboard. 🔒 shows what you still need.',
    'Konto': 'Account', 'Du spielst als Gast.': 'You are playing as a guest.', 'Gast': 'Guest', 'Spielstände': 'Save slots', 'Streamer-Modus': 'Streamer mode',
    'Fortschritt zurücksetzen': 'Reset progress', 'Account löschen': 'Delete account', 'Kapitel-Fortschritt': 'Chapter progress',
    // Titelbild
    'Neues Spiel': 'New game', 'Neue Welt testen': 'Try the New World', 'Ein Piraten-Roguelike': 'A pirate roguelike', 'Sammelalbum': 'Album', 'gerade auf See': 'at sea now', 'heute an Bord': 'aboard today',
    'Funk zur Flotte': 'Contacting the fleet', 'ab Rang 2': 'from rank 2', 'Rangliste ab Rang 2': 'Leaderboard from rank 2',
    // Werte, Stile, Rollen, Banden
    'Kraft': 'Power', 'Klinge': 'Blade', 'Technik': 'Tech', 'Brecher': 'Breaker', 'Kämpfer': 'Fighter', 'Helfer': 'Support',
    'Strohhutbande': 'Straw Hat Pirates', 'Marine': 'Marines', 'CP9': 'CP9', 'Weißbart-Bande': 'Whitebeard Pirates', 'Samurai der Meere': 'Warlords of the Sea',
    'Baroque Works': 'Baroque Works', 'Buggy-Piraten': 'Buggy Pirates', 'Arlong-Bande': 'Arlong Pirates', 'Revolutionsarmee': 'Revolutionary Army', 'Rothaar-Piraten': 'Red Hair Pirates',
    'Furcht': 'Fear', 'Blutung': 'Bleed', 'Gift': 'Poison', 'Brand': 'Burn', 'Geschwächt': 'Weakened', 'Mut': 'Courage',
    // Wiki
    'Wiki': 'Wiki', 'Nachschlagen': 'Look things up', 'Grundlagen': 'Basics', 'Meta': 'Meta', 'Kampfstile': 'Fighting styles', 'Rollen': 'Roles', 'So läuft ein Run': 'How a run works',
    'Zustände im Kampf': 'Status effects', 'Ultis': 'Ultimates', 'Banden': 'Crews', 'Duos': 'Duos', 'Kampfstile & Rollen': 'Styles & roles',
    'Bosse und wie man sie knackt': 'Bosses and how to beat them', 'Aus der Simulation': 'From the simulation', 'Stärkste Strategien': 'Strongest strategies',
    'Starke Power-ups': 'Strong power-ups', 'Teufelsfrüchte': 'Devil fruits', 'Grau = gerade am schwächsten. Jeder Schatz hat seine Crew, die ihn liebt.': 'Grey = weakest right now. Every treasure has a crew that loves it.',
    'Figuren, die oft gewinnen': 'Characters that win often', 'Aus echten Runs': 'From real runs', 'live': 'live', 'Bei den besten Spielern': 'Among top players',
    'Bei den besten Spielern gerade beliebt': 'Popular with top players right now',
    // Freunde, Sticker, Statistik
    'Deine Crew an Land': 'Your crew on land', 'Dein Freundescode': 'Your friend code', 'Link teilen': 'Share link', 'QR scannen oder Link öffnen.': 'Scan the QR or open the link.',
    'Danke fürs Einladen': 'Thanks for inviting', 'Hinzufügen': 'Add', 'Noch keine Freunde in der Liste.': 'No friends in your list yet.', 'Danke fürs Teilen!': 'Thanks for sharing!',
    'Super!': 'Great!', 'Dein Sticker': 'Your sticker', 'Album & Statistik': 'Album & stats', 'Gesammelt': 'Collected', 'Deine Figuren': 'Your characters', 'Figur': 'Character',
    'Figuren': 'Characters', 'Kapitäne frei': 'Captains unlocked', 'Figuren getroffen': 'Characters met', 'Gegner besiegt': 'Enemies defeated', 'Profil-Teile': 'Profile items',
    'K.o.s': 'KOs', 'Raids': 'Raids', 'Inseln': 'Islands', 'Was ist neu?': 'What’s new?', 'Schön': 'Nice', 'Verstanden': 'Got it', 'Senden': 'Send',
    'Neuling auf See': 'Rookie at sea', 'Raufbold': 'Brawler', 'Kopfgeldjäger': 'Bounty hunter', 'Bossbezwinger': 'Boss slayer', 'Sammler': 'Collector', 'Der Wuchtige': 'The Mighty',
    'Legende der Meere': 'Legend of the seas', 'Matrose': 'Sailor', 'Super-Rookie': 'Super rookie', 'Entdecker': 'Explorer', 'Schatzjäger': 'Treasure hunter', 'Kartograph': 'Cartographer',
    'Hitzkopf': 'Hothead', 'Sturmbezwinger': 'Storm tamer', 'Ein-Schlag-Samurai': 'One-strike samurai', 'Albtraum der Marine': 'Navy’s nightmare', 'Weltreisender': 'World traveler',
    'Unermüdlich': 'Tireless', 'Kaiser der Meere': 'Emperor of the seas', 'Piratenkönig': 'Pirate King', 'Großer Clown': 'Great clown', 'Revolutionär': 'Revolutionary',
    'Vizekapitän': 'First mate', 'Gemütlicher Kapitän': 'Cozy captain', 'Faust der Meere': 'Fist of the seas', 'Hundert Inseln': 'Hundred islands', 'Unbeugsam': 'Unbreakable',
    'Gastgeber der Grand Line': 'Host of the Grand Line', 'Herr der Flotte': 'Lord of the fleet', 'Schiffsjunge': 'Cabin boy',
    // Figurennamen wie im englischen Original
    'Ruffy': 'Luffy', 'Zorro': 'Zoro', 'Lysop': 'Usopp', 'Bon Clay': 'Bon Clay', 'Whitebeard': 'Whitebeard', 'Rob Lucci': 'Rob Lucci', 'Hancock': 'Hancock',
    'Vollbild': 'Fullscreen', '⛶ Vollbild': '⛶ Fullscreen', 'Vollbild beenden': 'Exit fullscreen', '🔒 Kopfgeld-Stufen': '🔒 Bounty tiers', 'Kopfgeld-Stufen': 'Bounty tiers', 'Weiterspielen': 'Continue', 'Rechtliches & Datenschutz': 'Legal & privacy',
    'Inoffizielles Fanprojekt, kostenlos und ohne kommerzielle Absicht. One Piece gehört seinen Rechteinhabern.': 'Unofficial fan project, free and non-commercial. One Piece belongs to its rights holders.',
    'Willkommen zurück': 'Welcome back', 'Neu anfangen': 'Start over', 'Alle Neuigkeiten': 'All news', '★ Spiel bewerten': '★ Rate the game', 'Update verfügbar': 'Update available'
  };
  // Ausrüstungsnamen (Stammcrew): Eigenschaft + Grundteil
  const GEAR_ADJ = { Wuchtig: 'Mighty', Zäh: 'Sturdy', Flink: 'Swift', Scharf: 'Keen', Schattig: 'Shadowy', Gehärtet: 'Hardened', Wild: 'Wild' };
  const GEAR_BASE = { Kochmesser: 'Chef’s Knife', Perlenkette: 'Pearl Necklace', Säbel: 'Sabre', Entermesser: 'Cutlass', Muskete: 'Musket', Dreizack: 'Trident', Kapitänsmantel: 'Captain’s Coat', Lederweste: 'Leather Vest', Kopftuch: 'Bandana', Goldring: 'Gold Ring', Kompass: 'Compass', Amulett: 'Amulet' };
  // Muster mit Zahlen
  const P = [
    [/^Anheuern für (\d+) Gold$/, 'Hire for $1 gold'],
    [/^Tipp: Du hast noch freie Plätze\. Eine neue Figur bringt meist mehr, Zusammenlegen lohnt sich vor allem bei voller Crew\.$/, 'Tip: you still have free slots. A new member usually brings more; merging pays off most with a full crew.'],
    [/^Pfeile: Vergleich mit deinem Tauschziel \((.+)\)$/, 'Arrows: compared with your swap target ($1)'],
    [/^(\d+) Orte?$/, (m, n) => n + (n === '1' ? ' place' : ' places')],
    [/^(\d+)\/(\d+) Teile$/, '$1/$2 items'], [/^(\d+) Figuren$/, '$1 characters'], [/^(\d+)\/(\d+) dabei$/, '$1/$2 in crew'], [/^Alle (\d+) Karten zeigen$/, 'Show all $1 cards'],
    [/^Noch nichts auf „(.+)“\. Wähl unten ein Teil aus der Truhe oder zieh es auf den Platz\.$/, 'Nothing on “$1” yet. Pick an item from the chest below or drag it onto the slot.'],
    [/^Krit (\d+) %$/, 'Crit $1 %'], [/^Ausweichen (\d+) %$/, 'Dodge $1 %'], [/^Rüstung (\d+)$/, 'Armor $1'], [/^Schaden \+(\d+) %$/, 'Damage +$1 %'],
    [/^🔹 Neu würfeln \((\d+)\)$/, '🔹 Reroll ($1)'], [/^(\d+) neu$/, '$1 new'],
    [/^Zerlegen \(\+(\d+) Berry(, \+(\d+) 🔹)?(, \+(\d+) 🍙)?\)$/, (m, b, x, sh, y, sn) => `Scrap (+${b} Berry${sh ? `, +${sh} 🔹` : ''}${sn ? `, +${sn} 🍙` : ''})`],
    [/^(Wuchtig|Zäh|Flink|Scharf|Schattig|Gehärtet|Wild)(?:er|e|es) (Säbel|Entermesser|Muskete|Dreizack|Kapitänsmantel|Lederweste|Kopftuch|Goldring|Kompass|Amulett|Kochmesser|Perlenkette)( \+\d+)?$/, (m, a, b, n) => `${GEAR_ADJ[a]} ${GEAR_BASE[b]}${n || ''}`],
    [/^(Säbel|Entermesser|Muskete|Dreizack|Kapitänsmantel|Lederweste|Kopftuch|Goldring|Kompass|Amulett|Kochmesser|Perlenkette)( \+\d+)?$/, (m, b, n) => `${GEAR_BASE[b]}${n || ''}`],
    [/^(Säbel|Entermesser|Muskete|Dreizack|Kapitänsmantel|Lederweste|Kopftuch|Goldring|Kompass|Amulett|Kochmesser|Perlenkette) von (.+)$/, (m, b, w) => `${GEAR_BASE[b]} of ${w}`],
    [/^Team-Fähigkeit · (.+)$/, 'Team move · $1'],
    [/^Vergleich für (.+)$/, 'Compared for $1'], [/^Trägt (.+) gerade$/, '$1 is wearing it'],
    [/^Flaschenpost von (.+)$/, 'Message in a bottle from $1'], [/^🍾 Flaschenpost: (.+) an …$/, '🍾 Bottle: send $1 to …'], [/^(.+) schwimmt zu (.+)\.$/, '$1 is floating to $2.'],
    [/^(.+) hat dir etwas geschickt!$/, '$1 sent you something!'], [/^(\d+) Flaschen sind angespült!$/, '$1 bottles washed ashore!'], [/^von (.+)$/, 'from $1'],
    // ---- Kampf-Log (fork i18n) ----
    [/^(.+?) trifft (.+?) für (\d+)( \(kritisch!\))?\.( Sehr effektiv!| Wenig effektiv\.)?(?: (.+) (ist|sind) besiegt\.)?$/, (m, a, t, n, c, e, ko, v) =>
      `${ACT(a)} hits ${NM(t)} for ${n}${c ? ' (critical!)' : ''}.${e ? (e.includes('Sehr') ? ' Super effective!' : ' Not very effective.') : ''}${ko ? ` ${NM(ko)} ${v === 'ist' ? 'is' : 'are'} defeated.` : ''}`],
    [/^(.+) greift (.+) an, aber der Impact Dial wehrt ab\.$/, (m, a, b) => `${NM(a)} attacks ${NM(b)}, but the Impact Dial blocks it.`],
    [/^(.+) weicht (.+) aus\.$/, (m, a, b) => `${NM(a)} dodges ${NM(b)}.`],
    [/^(.*) entfesselt die Ulti: (.+?)!( Perfekt, alles stärker!| Bonus: (.+)\.)?$/, (m, a, u, x, b) => `${NM(a)} unleashes the Ulti: ${tr(u)}!${x ? (b ? ` Bonus: ${tr(b)}.` : ' Perfect, everything stronger!') : ''}`],
    [/^Konter! (.+) schlägt sofort zurück: (\d+) Schaden an (.+)\.$/, (m, a, n, b) => `Counter! ${NM(a)} strikes back at once: ${n} damage to ${NM(b)}.`],
    [/^Kampfwetter: (.+?)\. (.+)$/, (m, a, b) => `Battle weather: ${tr(a)}. ${tr(b)}`],
    [/^Endphase! (.+) setzt alles auf eine Karte\.$/, (m, a) => `Final phase! ${NM(a)} goes all in.`],
    [/^(.+) wird wütend: stärker und schneller!$/, (m, a) => `${NM(a)} gets angry: stronger and faster!`],
    [/^(.+) ist betäubt und setzt aus\.$/, (m, a) => `${NM(a)} is stunned and skips a turn.`],
    [/^(.+) lässt sich nicht beeindrucken \((.+) abgewehrt\)\.$/, (m, a, s) => `${NM(a)} is not impressed (${tr(s)} blocked).`],
    [/^(.+) befreit (.+) von (.+)\.$/, (m, a, b, s) => `${NM(a)} frees ${NM(b)} from ${tr(s)}.`],
    [/^(.*): (.+) (hat|haben) (.+) \((\d+) (Runde|Runden)\)\.$/, (m, a, b, h, s, n) => `${NM(a)}: ${NM(b)} ${h === 'hat' ? 'gets' : 'get'} ${tr(s)} (${n} ${n === '1' ? 'round' : 'rounds'}).`],
    [/^(.+?) heilt (.+) um (\d+)\.$/, (m, a, b, n) => `${ACT(a)} heals ${NM(b)} by ${n}.`],
    [/^(.+) steht wieder auf(?: \((.+)\))?!$/, (m, a, s) => `${NM(a)} gets back up${s ? ' (' + tr(s) + ')' : ''}!`],
    [/^Spezialangriff: (.+)!$/, (m, a) => `Special attack: ${tr(a)}!`],
    [/^(.+) bremst alle Gegner aus: -(\d+) Tempo\.$/, (m, a, n) => `${NM(a)} slows all enemies: -${n} speed.`],
    [/^(.+) feuert alle an: \+(\d+) Angriff\.$/, (m, a, n) => `${NM(a)} cheers everyone on: +${n} attack.`],
    [/^(.+) verwandelt sich und hat jetzt (\d+) Angriff\.$/, (m, a, n) => `${NM(a)} transforms and now has ${n} attack.`],
    [/^(.+): (alle|selbst) \+(\d+) (Angriff|Rüstung)\.$/, (m, a, w, n, s) => `${NM(a)}: ${w === 'alle' ? 'everyone' : 'self'} +${n} ${s === 'Angriff' ? 'attack' : 'armor'}.`],
    [/^Die Schiffskanone trifft alle Gegner für (\d+)\.$/, 'The ship cannon hits all enemies for $1.'],
    // ---- Run, Meldungen, Tooltips ----
    [/^Auf (.+) sind$/, (m, a) => `${NM(a)} has`],
    [/^ausgesetzt\. Sieg: Das Kopfgeld geht an deinen Kapitän, dazu ein Schatz\.$/, 'on their head. Win: the bounty goes to your captain, plus a treasure.'],
    [/^für (.+)$/, (m, a) => `for ${NM(a)}`],
    [/^Neu für dein Profil: (Hintergrund|Rahmen|Animation|Titel|Flagge|Abzeichen) „(.+)“$/, (m, k, n) => `New for your profile: ${({ Hintergrund: 'background', Rahmen: 'frame', Animation: 'animation', Titel: 'title', Flagge: 'flag', Abzeichen: 'badge' })[k]} “${tr(n)}”`],
    [/^Automatisch angelegt bei (.+)\. Antippen einer Figur hängt um\.$/, (m, a) => `Auto-equipped on ${NM(a)}. Tap a crew member to move it.`],
    [/^(Gewöhnlich|Selten|Episch|Legendär) und damit stärker als die anderen Angebote\.$/, (m, r) => `${tr(r)}, so stronger than the other offers.`],
    [/^(Gewöhnlich|Selten|Episch|Legendär|Einzigartig): (.+)$/, (m, r, n) => `${tr(r)}: ${tr(n)}`],
    [/^(.+) hat trainiert!$/, (m, a) => `${NM(a)} trained!`],
    [/^danach noch (\d+) weitere?$/, 'then $1 more'],
    [/^(\d+) Schatz$/, '$1 treasure'], [/^(\d+) Schätze$/, '$1 treasures'],
    [/^Auftrag erfüllt: (\S+) (.+)$/, (m, i, q) => `Quest done: ${i} ${tr(q)}`],
    [/^(.+) \((\d+)\/(\d+)\)$/, (m, a, x, y) => { const t = tr(a); return t === a ? m : `${t} (${x}/${y})`; }],
    [/^(.+): Bande\. Mehrere Figuren derselben Bande geben einen Set-Bonus\.$/, (m, a) => `${tr(a)}: gang. Several members of the same gang give a set bonus.`],
    [/^(.+) \(Set-Bonus\)$/, (m, a) => `${tr(a)} (set bonus)`],
    [/^· (\d+): (.+)$/, (m, n, t) => { const x = tr(t); return x === t ? m : `· ${n}: ${x}`; }],
    [/^Ab (\d+): (.+)$/, (m, n, t) => { const x = tr(t); return x === t ? m : `From ${n}: ${x}`; }],
    [/^(.+): (Kämpfer|Brecher|Helfer), Level (\d+), (\d+)\/(\d+) Leben(?:, (\d+) Statuspunkte offen)?$/, (m, a, r, l, h, mx, p) => `${NM(a)}: ${tr(r)}, level ${l}, ${h}/${mx} HP${p ? `, ${p} stat points open` : ''}`],
    [/^Angriff (\d+)$/, 'Attack $1'], [/^Tempo (\d+)$/, 'Speed $1'], [/^HP (\d+)\/(\d+)$/, 'HP $1/$2'],
    [/^(\d+) Leben$/, '$1 HP'], [/^(\d+) Angriff$/, '$1 attack'], [/^(\d+) Tempo$/, '$1 speed'],
    [/^Leben (\d+), Angriff (\d+), Tempo (\d+)$/, 'HP $1, attack $2, speed $3'],
    [/^(.+) · Lv (\d+)$/, (m, a, n) => `${({ Strohhut: 'Straw Hats', Weißbart: 'Whitebeard', Rothaar: 'Red Hair', Marine: 'Marines', Samurai: 'Warlords' })[a] || tr(a)} · Lv ${n}`],
    [/^Lv (\d+) · wähle ein Training(?: · danach noch (\d+) weitere?)?$/, (m, l, n) => `Lv ${l} · pick a training${n ? ` · then ${n} more` : ''}`],
    [/^Auf (.+) soll (?:ein|eine) (.+) leben$/, (m, i, p) => `A ${tr(p)} is said to live on ${tr(i)}`],
    [/^Schaltet frei: (.+)$/, (m, a) => `Unlocks: ${tr(a)}`],
    [/^Kopfgeld-Ziel: (.+?) \((.+?)\): ([^:]+): (.+)$/, (m, a, b, n, t) => `Bounty target: ${NM(a)} (${b}): ${tr(n)}: ${tr(t)}`],
    [/^Bösewicht der Insel: (.+?) \((.+?)\): ([^:]+): (.+)$/, (m, a, b, n, t) => `Island villain: ${NM(a)} (${b}): ${tr(n)}: ${tr(t)}`],
    [/^Inselboss: (.+?): (.+?) kämpft mit (\S+), schwach gegen (\S+)\. ([^:]+): (.+)$/, (m, a, b, s1, s2, n, t) => `Island boss: ${NM(a)}: ${NM(b)} fights with ${tr(s1)}, weak against ${tr(s2)}. ${tr(n)}: ${tr(t)}`],
    [/^Schatz gefunden: (.+) \((.+)\)$/, (m, a, r) => `Treasure found: ${tr(a)} (${tr(r)})`],
    [/^(.+) wird wütend!$/, (m, a) => `${NM(a)} gets angry!`],
    [/^(.+) setzt alles auf eine Karte!$/, (m, a) => `${NM(a)} goes all in!`],
    [/^([^,:]+), ([^,:]+):$/, (m, a, b) => `${NM(a)}, ${tr(b)}:`],
    [/^Inoffizielles Fanprojekt\. Nicht verbunden mit Eiichiro Oda, Shueisha oder Toei Animation\.\s+One Piece und alle Figuren gehören ihren Rechteinhabern\. Kostenlos und ohne kommerzielle Absicht\.$/, 'Unofficial fan project. Not affiliated with Eiichiro Oda, Shueisha or Toei Animation. One Piece and all characters belong to their rights holders. Free and non-commercial.'],
    [/^Tauschen für (\d+) Gold$/, 'Swap for $1 gold'],
    [/^Zu wenig Gold \((\d+)\)$/, 'Not enough gold ($1)'],
    [/^Stärker als (.+)$/, 'Stronger than $1'], [/^Schwächer als (.+)$/, 'Weaker than $1'], [/^Etwa gleich stark wie (.+)$/, 'About as strong as $1'],
    [/^(.+) ist K\.O\.: ein Tausch bringt wieder volle Kraft$/, '$1 is K.O.: a swap brings back full strength'],
    [/^Preis (\d+)$/, 'Price $1'], [/^− (\d+) für (.+)$/, '− $1 for $2'], [/^= (\d+) Gold$/, '= $1 gold'],
    [/^Zusammenlegen für (\d+) Gold$/, 'Merge for $1 gold'],
    [/^(.+) ist schon in deiner Crew\. Zwei gleiche werden zu einer stärkeren Figur mit (\d) Sternen: \+(\d+) Leben, \+(\d+) Angriff, volle Heilung\. Braucht keinen freien Platz\.$/, '$1 is already in your crew. Two of the same become one stronger $2-star member: +$3 HP, +$4 attack, fully healed. Needs no free slot.'],
    [/^(★+) (.+) zusammengelegt!$/, '$1 $2 merged!'],
    [/^\+(\d+) Leben, \+(\d+) Angriff, voll geheilt\.$/, '+$1 HP, +$2 attack, fully healed.'],
    [/^([+-]?\d+) ⚔ zum jetzigen$/, '$1 ⚔ vs. current'],
    [/^Von (.+) nehmen$/, 'Take from $1'],
    [/^(.+) hat danach nichts mehr auf diesem Platz\.$/, '$1 will have nothing in this slot afterwards.'],
    [/^Neu würfeln · (\d+)$/, 'Reroll · $1'],
    [/^Aus ([\d.]+) Bot-Runs, bei denen zufällig gewählt wurde: So viel öfter gewinnt man damit\. Live-Zahlen kommen, sobald genug echte Runs da sind\.$/, 'From $1 bot runs with random picks: how much more often you win with it. Live numbers arrive once there are enough real runs.'],
    [/^Aus (\d+) echten Runs \(14 Tage\): So viel öfter gewinnt man, wenn man es dabei hat\.$/, 'From $1 real runs (14 days): how much more often you win when you have it.'],
    [/^Überspringen · \+(\d+)\s*$/, 'Skip · +$1 '],
    [/^Auf (.+) soll eine? (.+) leben$/, (m, isl, nm) => { const X = GL.data.en || {}, k = nm.charAt(0).toUpperCase() + nm.slice(1); return `Rumor says a ${X[k] || nm} lives on ${isl}`; }],
    [/^Noch (\d+) Entdeckungen? bis (.+)$/, (m, n, x) => `${n} more ${n === '1' ? 'discovery' : 'discoveries'} until ${(GL.data.en || {})[x] || x}`],
    [/^Noch (\d+) bis Stufe (\d+)$/, '$1 more until tier $2'],
    [/^Einmal pro Run, alle mit (\d+) % Leben$/, 'Once per run, everyone at $1 % HP'],
    [/^Nur noch (.+) steht!$/, 'Only $1 is still standing!'],
    [/^(.+) ist online$/, '$1 is online'],
    [/^Im (Ersten|Zweiten|Dritten) Meer beim Kurs setzen wählen$/, (m, n) => `Pick it when setting course in the ${({ Ersten: 'first', Zweiten: 'second', Dritten: 'third' })[n]} sea`],
    [/^🔒 ab Rang (\d+)$/, '🔒 from rank $1'],
    [/^ab Rang (\d+)$/, 'from rank $1'],
    [/^(\d+) bereit$/, '$1 ready'],
    [/^\+[\d.]+(?: %)? (?:Angriff|Leben|Tempo|Krit|Rüstung|Schaden|Heilung\/Runde)(?:, \+[\d.]+(?: %)? (?:Angriff|Leben|Tempo|Krit|Rüstung|Schaden|Heilung\/Runde))*$/, m => m.replace(/Heilung\/Runde/g, 'heal/round').replace(/Angriff/g, 'attack').replace(/Leben/g, 'HP').replace(/Tempo/g, 'speed').replace(/Krit/g, 'crit').replace(/Rüstung/g, 'armor').replace(/Schaden/g, 'damage')],
    [/^(\d+) von 3$/, '$1 of 3'],
    [/^Einschmelzen für (\d+) Berry$/, 'Melt down for $1 berry'],
    [/^🔥 Einschmelzen \+(\d+)$/, '🔥 Melt down +$1'], [/^(\d+)\/(\d+) Plätze$/, '$1/$2 slots'], [/^(\d+) von (\d+) gefunden$/, '$1 of $2 found'],
    [/^Stufe (\d+) bei (\d+) Funden \((\d+)\): (.+)$/, 'Level $1 at $2 finds ($3): $4'],
    [/^Stufe (\d+) von (\d+)$/, 'Level $1 of $2'],
    [/^Segle im Run bis ins (erste|zweite|dritte) Meer \((.+)\)\. Beim Kurs setzen steht dann eine Insel von (.+) zur Wahl\.$/, (m, n, sea, r) => `Sail to the ${({ erste: 'first', zweite: 'second', dritte: 'third' })[n]} sea (${sea}) in a run. When setting course, an island of ${r} is offered.`],
    [/^Vertraut (\d+) · noch (\d+) bis (\d+)$/, 'Bond $1 · $2 more to $3'],
    [/^Vertraut (\d+) · ganz eng$/, 'Bond $1 · best friends'],
    [/^🔒 ab Vertraut (\d+)$/, '🔒 at bond $1'],
    [/^Duo: (.+)$/, (m, t) => 'Duo: ' + ((GL.data.en || {})[t] || t)],
    [/^(▲|◦) (.+)$/, (m, a, t) => a + ' ' + t.replace(/\+(\d+) Leben für (\d+) (Verletzten|Verletzte)/, (x, n, k) => `+${n} HP for ${k} injured`).replace(/\+(\d+) (Angriff|Leben|Tempo) für alle (\d+)/, (x, n, st, c) => `+${n} ${({ Angriff: 'Attack', Leben: 'HP', Tempo: 'Speed' })[st]} for all ${c}`).replace(/\+(\d+) (Angriff|Leben|Tempo) für (.+) \(vorne\)/, (x, n, st, w) => `+${n} ${({ Angriff: 'Attack', Leben: 'HP', Tempo: 'Speed' })[st]} for ${w} (front)`).replace(/\+(\d+) % Krit für alle/, '+$1 % crit for all').replace('Deine Crew ist gerade gesund', 'Your crew is healthy right now')],
    [/^(.+): (\d+)\/(\d+) Leben$/, '$1: $2/$3 HP'],
    [/^♥ (.+) ist dein Vertrauter und steht extra zur Wahl\.$/, '♥ $1 is your companion and an extra choice.'],
    [/^Vertraut (\d+) mit (.+)$/, 'Bond $1 with $2'],
    [/^(\d+) Figuren mit Vertraut 6$/, '$1 characters at bond 6'],
    [/^♥ (.+)$/, (m, t) => '♥ ' + ((GL.data.en || {})[t] || t)],
    [/^(.+) freut sich ♥$/, '$1 is happy ♥'],
    [/^Vertraut (\d+)!(.*)$/, (m, n, r) => 'Bond ' + n + '!' + (r ? ' A new moment together is waiting.' : '')],
    [/^♥ Neuer Moment mit (.+)$/, '♥ New moment with $1'],
    [/^(\d+) (Fahrt|Fahrten) zusammen, (\d+) davon gewonnen$/, '$1 voyages together, $3 won'],
    [/^(\d+) (Fahrt|Fahrten) zusammen$/, '$1 voyages together'],
    [/^(\d+) Kämpfe Seite an Seite$/, '$1 fights side by side'],
    [/^(\d+) Gegner umgehauen$/, '$1 enemies knocked out'],
    [/^Härtester Treffer: (\d+)$/, 'Hardest hit: $1'],
    [/^Vertrautheit wächst, wenn (.+) in Runs, Duellen oder beim Landgang dabei ist\.$/, (m, a) => 'Bond grows when ' + NM(a) + ' joins runs, duels or shore leave.'],
    [/^Nächstes Mal schaffen wir (.+)\.$/, (m, a) => 'Next time we’ll beat ' + NM(a) + '.'],
    [/^(.+)\? Den hau ich beim nächsten Mal um!$/, (m, a) => NM(a) + '? I’ll knock him down next time!'],
    [/^(.+)… das nächste Mal schneide ich ihn\.$/, (m, a) => NM(a) + '… next time I’ll cut him.'],
    [/^(.+) schuldet mir jetzt was\. Viel\.$/, (m, a) => NM(a) + ' owes me now. A lot.'],
    [/^(.+) hatte nur Glück\. Wirklich!$/, (m, a) => NM(a) + ' just got lucky. Really!'],
    [/^(.+)… und das vor den Damen\. Unverzeihlich\.$/, (m, a) => NM(a) + '… in front of the ladies. Unforgivable.'],
    [/^Wir haben viel über (.+) gelernt\.$/, (m, a) => 'We learned a lot about ' + NM(a) + '.'],
    [/^Gegen (.+) brauchen wir einen besseren Plan\.$/, (m, a) => 'Against ' + NM(a) + ' we need a better plan.'],
    [/^(.+) kriegt beim nächsten Mal eine Kopfnuss\.$/, (m, a) => NM(a) + ' gets a knuckle sandwich next time.'],
    [/^Das verzeihe ich (.+) nie\.$/, (m, a) => 'I will never forgive ' + NM(a) + '.'],
    [/^Beim nächsten Mal mach ich (.+) platt\.$/, (m, a) => 'Next time I flatten ' + NM(a) + '.'],
    [/^(.+) hat hart zugeschlagen\. Ich halte mehr aus\.$/, (m, a) => NM(a) + ' hit hard. I can take more.'],
    [/^(\d+) Piraten? aus der Rangliste$/, '$1 pirates from the leaderboard'],
    [/^(\d+) Piraten? waren? schon dort\. Jetzt du!$/, '$1 pirates have been there. Your turn!'],
    [/^Schon dort: (.+)$/, 'Already there: $1'],
    [/^(\d+) Inseln$/, '$1 islands'],
    [/^(\d+)\. Meer$/, 'Sea $1'],
    [/^Sammelalbum · Stufe (\d+)$/, 'Collection album · Tier $1'],
    [/^Lebt auf (.+)\. Besiege dort Bösewicht oder Boss, mit etwas Glück kommt das Tier an Bord\.$/, (m, a) => 'Lives on ' + tr(a) + '. Beat the villain or boss there and with a bit of luck it hops aboard.'],
    [/^Stufe (\d+): (\d+) Entdeckungen · Begleiter (.+)$/, 'Tier $1: $2 discoveries · Companion $3'],
    [/^Stufe (\d+): (\d+) Entdeckungen · (\d+) Berry$/, 'Tier $1: $2 discoveries · $3 Berry'],
    [/^\+(\d+) Berry fürs fleißige Entdecken\.$/, '+$1 Berry for all that exploring.'],
    [/^Deine Crew (\d+)\/(\d+)$/, 'Your crew $1/$2'],
    [/^(\d+) besiegt: austauschen oder bei einer Rast heilen$/, '$1 down: swap them or heal at a rest'],
    [/^(\d+) K\.O\.$/, '$1 KO'],
    [/^Tauschen gegen (.+) · (\d+) Gold$/, 'Swap for $1 · $2 gold'],
    [/^(.+) nehmen$/, 'Take $1'],
    [/^Mit (.+) ▸$/, 'With $1 ▸'],
    [/^Lv (\d+)$/, 'Lv $1'],
    [/^Rang (\d+)$/, 'Rank $1'],
    [/^Rang (\d+) /, 'Rank $1 '],
    [/^(\d+)-mal besiegt$/, 'defeated $1×'],
    [/^\+(\d+) Berry für das Hauptquartier$/, '+$1 Berry for headquarters'],
    [/^(\d+) Punkte\.$/, '$1 points.'],
    [/^Neuer Bestwert: (\d+) Punkte\.$/, 'New best: $1 points.'],
    [/^Leben (\d+)\/(\d+)$/, 'HP $1/$2'],
    [/^Du bist bis (.+) gekommen\.$/, 'You made it to $1.'],
    [/^Noch (\d+) Plätze frei: jede Figur macht deine Crew stärker$/, '$1 slots free: every character makes your crew stronger'],
    [/^(\d+) offen$/, '$1 open'],
    [/^(\d+) abholen!$/, '$1 to claim!'],
    [/^(\d+) an Bord$/, '$1 aboard'],
    [/^Kopfgeld-Ziel: (.+)$/, 'Bounty target: $1'],
    [/^Bösewicht der Insel: (.+)$/, 'Island villain: $1'],
    [/^Raid: (.+)$/, 'Raid: $1'],
    [/^Runde (\d+)$/, 'Round $1'],
    [/^„(.+)“$/, (m, a) => '“' + tr(a) + '”'],
    [/^Darum lohnt (er|sie) sich jetzt$/, 'Why recruit now'],
    [/^Aktiviert (.+) (\d+): (.+)$/, (m, a, n, t) => 'Activates ' + tr(a) + ' ' + n + ': ' + tr(t)],
    [/^Duo (.+?): (.+)$/, (m, a, t) => 'Duo ' + tr(a) + ': ' + tr(t)],
    [/^Stark gegen (.+), den Boss dieses Meeres \((.+)\)\.$/, (m, a, b) => 'Strong against ' + tr(a) + ', this sea’s boss (' + tr(b) + ').'],
    [/^Höchster Angriff an Bord \((\d+)\)\.$/, 'Highest attack on board ($1).'],
    [/^alle (\d+) Runden$/, 'every $1 rounds'],
    [/^Wirklich\? \+(\d+)$/, 'Sure? +$1'],
    [/^Entlassen \(\+(\d+) Gold\)$/, 'Dismiss (+$1 gold)'],
    [/^(Guten Morgen|Ahoi|Guten Abend|Noch wach), (.+?)([!?]) (.+)$/, (m, hi, n, p, rest) => {
      const H = { 'Guten Morgen': 'Good morning', 'Ahoi': 'Ahoy', 'Guten Abend': 'Good evening', 'Noch wach': 'Still up' };
      const L = { 'Die Crew hat Kaffee gekocht.': 'The crew made coffee.', 'Frischer Wind in den Segeln.': 'Fresh wind in the sails.', 'Die Möwen sind schon wach.': 'The gulls are already up.',
        'Die Grand Line ruft.': 'The Grand Line is calling.', 'Perfektes Wetter zum Segeln.': 'Perfect sailing weather.', 'Das Schiff ist startklar.': 'The ship is ready.',
        'Noch eine Fahrt vorm Essen?': 'One more voyage before dinner?', 'Das Abendrot färbt das Meer.': 'The sunset paints the sea.', 'Die Laternen sind an.': 'The lanterns are lit.',
        'Eine Nachtfahrt geht immer.': 'There is always time for a night voyage.', 'Die Crew schnarcht schon.': 'The crew is already snoring.', 'Die Sterne zeigen den Weg.': 'The stars show the way.' };
      return `${H[hi]}, ${tr(n)}${p} ${L[rest] || rest}`; }],
    [/^(\d+) von (\d+) entdeckt\. (\d+) Runs? gespielt, (\d+) gewonnen\.$/, '$1 of $2 discovered. $3 runs played, $4 won.'],
    [/^🏅 Titel freigeschaltet:?$/, '🏅 Title unlocked:'],
    [/^🏅 Bei Vertraut 10:?$/, '🏅 At bond 10:'],
    // ---- Allgemeine Rückfälle ganz am Ende (greifen nur, wenn wirklich etwas übersetzt wurde) ----
    [/^🔒 (.+)$/, (m, a) => { const r = REQ(a); return r ? '🔒 ' + r : m; }],
    [/^(\d+ .+|Rang \d+.*|Vertraut \d+ mit .+)$/, m => REQ(m) || m],
    [/^✦ (.+)$/, (m, a) => '✦ ' + tr(a)],
    [/^([^!]+)!$/, (m, a) => { const t = tr(a); return t === a ? m : t + '!'; }],
    [/^(\d+) von (\d+) Sternen$/, '$1 of $2 stars'],
    [/^(\d+) Schaden$/, '$1 damage'],
    [/^(\d+) dabei$/, '$1 in crew'],
    [/^([^:]+): (.+)$/, (m, a, b) => { const r = REQ(b); if (r) return `${tr(a)}: ${r}`; const ta = tr(a), tb = tr(b); return tb !== b && !/[äöüßÄÖÜ]/.test(ta) ? `${ta}: ${tb}` : m; }]
  ];
  const cache = new Map();
  // Vorlagen mit Platzhaltern ({n}, {v}, {a} …) aus dem Wörterbuch: "Ganze Crew startet mit +{v} Leben." passt auf "+3"
  let TPL = null, tplN = -1;
  function fromTemplate(core) {
    const X = (GL.data && GL.data.en) || {};
    const keys = Object.keys(X);
    if (!TPL || tplN !== keys.length) {
      tplN = keys.length;
      TPL = keys.concat(Object.keys(D)).filter(k => /\{[a-z]\}/.test(k)).map(k => {
        const names = [];
        const src = k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{([a-z])\\?\}/g, (m, n) => { names.push(n); return '([+\\-−]?[\\d.,…]+(?: %)?)'; });
        try { return { re: new RegExp('^' + src + '$'), names, en: X[k] != null ? X[k] : D[k] }; } catch (e) { return null; }
      }).filter(Boolean);
    }
    for (const t of TPL) {
      const m = core.match(t.re);
      if (m) { let o = t.en; t.names.forEach((n, i) => { o = o.split('{' + n + '}').join(m[i + 1]); }); return o; }
    }
    return null;
  }
  // Namen in Sätzen (Kampf-Log): "Hatchan und Riesenkrabbe" -> "Hatchan and Giant crab"
  const NM = s => String(s).split(' und ').map(x => tr(x.trim())).join(' and ');
  // Akteur mit Fähigkeit in Klammern: "Cabaji (Feuer-Akrobatik)"
  const ACT = s => { const m = String(s).match(/^(.+) \((.+)\)$/); return m ? NM(m[1]) + ' (' + tr(m[2]) + ')' : NM(s); };
  // Freischalt-Bedingungen (Kosmetik, Titel): "12 Inselbosse besiegt, 15 Runs"
  const REQL = { 'Runs': 'runs', 'Siege': 'wins', 'K.o.s': 'K.O.s', 'Schaden mit einem Schlag': 'damage in one hit', 'Inselbosse besiegt': 'island bosses defeated',
    'Kopfgeld-Ziele besiegt': 'bounty targets defeated', 'Raids gewonnen': 'raids won', 'Artefakte gefunden': 'artifacts found', 'Meer erreicht': 'sea reached',
    'verschiedene Inseln besucht': 'different islands visited', 'Stammcrew-Duelle gewonnen': 'home crew duels won', 'Aufträge erledigt': 'quests done',
    'Prestige-Stufe': 'prestige level', 'Freund eingeladen': 'friend(s) invited' };
  function REQ(s) {
    const out = String(s).split(', ').map(x => {
      let m;
      if (x === 'frei') return 'free';
      if ((m = x.match(/^Rang (\d+)$/))) return 'Rank ' + m[1];
      if ((m = x.match(/^Kopfgeld-Stufe (\d+)$/))) return 'Bounty tier ' + m[1];
      if ((m = x.match(/^Vertraut (\d+) mit (.+)$/))) return 'Bond ' + m[1] + ' with ' + tr(m[2]);
      if ((m = x.match(/^(\d+) Figuren mit Vertraut (\d+)$/))) return m[1] + ' members at bond ' + m[2];
      if ((m = x.match(/^(.+) erreichen$/))) return 'reach ' + tr(m[1]);
      if ((m = x.match(/^(\d+) (.+)$/)) && REQL[m[2]]) return m[1] + ' ' + REQL[m[2]];
      return null;
    });
    return out.some(x => x == null) ? null : out.join(', ');
  }
  function tr(text) {
    if (lang === 'de' || !text) return text;
    if (cache.has(text)) return cache.get(text);
    const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0], core = text.trim();
    let out = null;
    const X = GL.data && GL.data.en;
    if (D[core] != null) out = D[core];
    else if (X && X[core] != null) out = X[core];
    else for (const [re, rep] of P) { if (re.test(core)) { const o = core.replace(re, rep); if (o !== core) { out = o; break; } } }
    if (out == null) for (const [re, rep] of (GL.i18nExtraP || [])) { if (re.test(core)) { const o = core.replace(re, rep); if (o !== core) { out = o; break; } } }
    if (out == null) out = fromTemplate(core);
    if (out == null && core.includes(' · ')) { const parts = core.split(' · '); const t = parts.map(x => tr(x)); if (t.some((x, i) => x !== parts[i])) out = t.join(' · '); }
    const res = out == null ? text : lead + out + trail;
    if (cache.size < 5000) cache.set(text, res);
    return res;
  }
  const ATTRS = ['data-tip', 'title', 'placeholder', 'aria-label'];
  function trAttr(el) {
    ATTRS.forEach(a => { const v = el.getAttribute && el.getAttribute(a); if (v) { const n = v.split('\n').map(tr).join('\n'); if (n !== v) el.setAttribute(a, n); } });
  }
  function walk(root) {
    if (lang === 'de' || !root) return;
    if (root.nodeType === 3) { const n = tr(root.nodeValue); if (n !== root.nodeValue) root.nodeValue = n; return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|INPUT|TEXTAREA|svg)$/i.test(root.nodeName)) return;
    trAttr(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: n => (n.nodeType === 1 && /^(SCRIPT|STYLE|svg)$/i.test(n.nodeName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) { const t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; } else trAttr(n);
    }
  }
  let obs = null;
  function start() {
    if (lang === 'de' || obs || !document.body) return;
    document.documentElement.lang = 'en';
    walk(document.body);
    obs = new MutationObserver(list => list.forEach(m => {
      if (m.type === 'childList') m.addedNodes.forEach(walk);
      else if (m.type === 'characterData') walk(m.target);
      else if (m.type === 'attributes') trAttr(m.target);
    }));
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  GL.i18n = {
    lang: () => lang,
    t: tr,
    set(l) { lang = l === 'en' ? 'en' : 'de'; try { localStorage.setItem(KEY, lang); } catch (e) {} location.reload(); },
    start
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
