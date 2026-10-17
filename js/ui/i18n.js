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
    '⚓ Leinen los!': '⚓ Cast off!', 'Die Grand Line ruft!': 'The Grand Line calls!', 'Dein Run läuft noch': 'Your run is still going', 'Raid-Ziel': 'Raid target', 'Heute offen': 'Open today',
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
    'Neues Spiel': 'New game', 'Ein Piraten-Roguelike': 'A pirate roguelike', 'Sammelalbum': 'Album', 'gerade auf See': 'at sea now', 'heute an Bord': 'aboard today',
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
    'Vollbild': 'Fullscreen', 'Weiterspielen': 'Continue', 'Rechtliches & Datenschutz': 'Legal & privacy',
    'Inoffizielles Fanprojekt, kostenlos und ohne kommerzielle Absicht. One Piece gehört seinen Rechteinhabern.': 'Unofficial fan project, free and non-commercial. One Piece belongs to its rights holders.',
    'Willkommen zurück': 'Welcome back', 'Neu anfangen': 'Start over', 'Alle Neuigkeiten': 'All news', '★ Spiel bewerten': '★ Rate the game', 'Update verfügbar': 'Update available'
  };
  // Muster mit Zahlen
  const P = [
    [/^Anheuern für (\d+) Gold$/, 'Hire for $1 gold'],
    [/^Neu würfeln · (\d+)$/, 'Reroll · $1'],
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
    [/^Wirklich\? \+(\d+)$/, 'Sure? +$1'],
    [/^Entlassen \(\+(\d+) Gold\)$/, 'Dismiss (+$1 gold)']
  ];
  const cache = new Map();
  function tr(text) {
    if (lang === 'de' || !text) return text;
    if (cache.has(text)) return cache.get(text);
    const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0], core = text.trim();
    let out = null;
    const X = GL.data && GL.data.en;
    if (D[core] != null) out = D[core];
    else if (X && X[core] != null) out = X[core];
    else for (const [re, rep] of P) { if (re.test(core)) { out = core.replace(re, rep); break; } }
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
