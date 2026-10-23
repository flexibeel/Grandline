// EIGENE WELT (Plug-and-Play): ersetzt alle One-Piece-Namen durch eigene.
// Die Spiel-Logik und alle ids bleiben gleich, Spielstände bleiben gültig.
//
// Einschalten:  in js/data/config.js  world: 'neutral'
// Testen:       index.html?welt=neutral   (zurück mit ?welt=onepiece)
//
// Eigene Namen eintragen: einfach rechts den Text ändern. Längere Begriffe zuerst
// ersetzen ist automatisch (z. B. "Gum-Gum-Frucht" vor "Gum-Gum").
// Ersetzt werden alle Texte in den Daten (Namen, Beschreibungen) und die Texte der Oberfläche.
window.GL = window.GL || {};

GL.worlds = GL.worlds || {};
GL.worlds.neutral = {
  title: 'The Great Line',
  footer: 'Ein Indie-Spiel. Alle Figuren, Namen und Orte sind frei erfunden.',
  map: {
    // ---------- Spiel und Welt ----------
    'Grand Line': 'Great Line',
    'One-Piece-Fanprojekt': 'Indie-Spiel',
    'One Piece': 'Großer Schatz',
    'Kostenlos, ohne Werbung, nicht verbunden mit Eiichiro Oda, Shueisha oder Toei Animation.': 'Kostenlos und ohne Werbung. Alle Figuren, Namen und Orte sind frei erfunden.',
    'Inoffizielles Fanprojekt, kostenlos und ohne kommerzielle Absicht. One Piece gehört seinen Rechteinhabern.': 'Ein kostenloses Indie-Spiel ohne Werbung. Alle Figuren, Namen und Orte sind frei erfunden.',
    'Tori-Tori-Frucht (Phönix)': 'Phönix-Frucht', 'Hie-Hie-Frucht': 'Frost-Frucht', 'Hito-Hito-Frucht': 'Menschen-Frucht',
    'Paramecia': 'Wunder', 'Logia': 'Element', 'Zoan': 'Tiergestalt',
    'Inoffizielles Fanprojekt': 'Indie-Spiel',
    'Fanprojekt': 'Indie-Spiel',
    'Berry': 'Taler',
    '฿': 'Taler',
    'Teufelsfrüchte': 'Zauberfrüchte',
    'Teufelsfrucht': 'Zauberfrucht',
    'Piratenkönig': 'König der Freibeuter',
    'Samurai der Meere': 'Freibeuter der Krone',
    'Kommandant eines Kaisers': 'Kommandant einer Herrscherin',
    'Kaiser der Meere': 'Herrscher der Meere',
    'Supernova': 'Sturmvogel',
    'Weltregierung': 'Kronrat',
    'Haki': 'Willenskraft',
    'Seestein': 'Bannstein',
    'Seekönig': 'Seeungeheuer',
    'Teleschnecke': 'Funkmuschel',
    // ---------- Meere und Inseln ----------
    'East Blue': 'Ostmeer',
    'Paradies': 'Wilde See',
    'Enies Lobby': 'Gerichtsinsel',
    'Shells Town': 'Muschelstadt',
    'Orange Town': 'Orangenhafen',
    'Syrup': 'Sirupdorf',
    'Baratie': 'Schwimmende Küche',
    'Loguetown': 'Galgenstadt',
    'Arlong Park': 'Haifischbucht',
    'Whisky Peak': 'Whiskeyspitze',
    'Little Garden': 'Urzeitinsel',
    'Drumm': 'Trommelberg',
    'Jaya': 'Goldküste',
    'Alabasta': 'Wüstenreich',
    'Skypiea': 'Wolkeninsel',
    'Long Ring Long Land': 'Langringland',
    'Water 7': 'Wasserstadt',
    'Seezug Puffing Tom': 'Dampfzug',
    'Turm des Gerichts': 'Turm des Urteils',
    // ---------- Banden ----------
    'Strohhutbande': 'Sturmmöwen',
    'Strohhut': 'Sturmmöwe',
    'Baroque Works': 'Barock-Bund',
    'CP9': 'Schattenkorps',
    // ---------- Crew ----------
    'Ruffys': 'Rafes', 'Ruffy': 'Rafe',
    'Zorros': 'Sorens', 'Namis': 'Nelas', 'Lysops': 'Lasses', 'Sanjis': 'Santos', 'Choppers': 'Pipos', 'Robins': 'Rubinas', 'Frankys': 'Bolzens', 'Brooks': 'Brunos', 'Vivis': 'Vinas', 'Jinbeis': 'Jonahs', 'Aces': 'Aschs',
    'Zorro': 'Soren', 'Nami': 'Nela', 'Lysop': 'Lasse', 'Sanji': 'Santo', 'Chopper': 'Pipo',
    // Figurenreise (js/data/forms.js)
    'Schwarzbein': 'Dunkelbein', 'Black Leg': 'Dark Leg', 'Seelenkönig': 'Klangkönig', 'Soul King': 'Sound King', 'Monster-Punkt': 'Riesenform', 'Drum': 'Trommelberg', 'Yohoho': 'Johoho',
    'Gear Second': 'Zweiter Gang', 'Sogeking': 'Maskenkönig', 'Sniper King': 'Mask King', 'Ohara': 'Bücherinsel', 'Strohhüte': 'Sturmmöwen', 'Straw Hat': 'Storm Gull',
    'Bellemeres': 'Bellas', 'Bell-mère': 'Bella', 'Kabuto': 'Donnerschleuder', 'Usopp': 'Lasse',
    'Robin': 'Rubina', 'Franky': 'Bolzen', 'Brook': 'Bruno', 'Garp': 'Grimm', 'Hina': 'Hilde',
    'Tashigi': 'Tessa', 'Koby': 'Kian', 'Kalifa': 'Kalina', 'Kumadori': 'Kordo', 'Blueno': 'Blaun',
    'Jabra': 'Jago', 'Bon Clay': 'Mimo', 'Mr. 5': 'Herr Fünf', 'Mr. 1': 'Herr Eins', 'Mr. 3': 'Herr Drei',
    'Vivi': 'Vina', 'Jinbei': 'Jonah', 'Ace': 'Asch', 'Law': 'Lorn',
    // ---------- Bosse und Kopfgeld-Ziele ----------
    'Smokers': 'Ruß’', 'Smoker': 'Ruß', 'Arlongs': 'Hairos', 'Arlong': 'Hairo',
    'Crocodiles': 'Sahirs', 'Crocodile': 'Sahir', 'Enels': 'Tonars', 'Enel': 'Tonar',
    'Rob Lucci': 'Lux Varo', 'Luccis': 'Lux’', 'Lucci': 'Lux', 'Kakus': 'Kalos', 'Kaku': 'Kalo',
    'Admiral Kizaru': 'Admiral Glanz', 'Kizarus': 'Glanz’', 'Kizaru': 'Glanz',
    'Doflamingos': 'Dorians', 'Doflamingo': 'Dorian',
    'Jangos': 'Jonkos', 'Jango': 'Jonko', 'Kuroobi': 'Schwarzgurt',
    'Buggys': 'Bunkos', 'Buggy': 'Bunko', 'Kuro': 'Kral', 'Don Kriegs': 'Kapitän Kregs', 'Don Krieg': 'Kapitän Kreg',
    'Axt-Hand Morgan': 'Axt-Hand Morten', 'Morgan': 'Morten',
    'Wapols': 'Wansts', 'Wapol': 'Wanst', 'Bellamy': 'Bello', 'Fukuro': 'Fugo', 'Spandam': 'Spanner',
    'Foxy': 'Fuchs', 'Nero': 'Neri',
    // ---------- Früchte ----------
    'Gum-Gum': 'Gummi', 'Hana-Hana': 'Blüten', 'Suna-Suna': 'Sand', 'Mera-Mera': 'Flammen',
    'Zoan-Frucht': 'Tierfrucht', 'Mane-Mane-Frucht': 'Spiegelfrucht', 'Bara-Bara-Frucht': 'Zerlegefrucht',
    'Baku-Baku-Frucht': 'Fressfrucht',
    // ---------- Schätze und Fähigkeiten ----------
    'Vivre Card': 'Lebenskarte', 'Log Port': 'Kompassperle', 'Impact Dial': 'Stoßmuschel', 'Dial': 'Muschel',
    'Wado Ichimonji': 'Ehrenklinge', 'Sunny-Bauplan': 'Bauplan der Sonnenbrigg', 'Sunny': 'Sonnenbrigg',
    'Rumble Ball': 'Kraftpille', 'Rokushiki': 'Sechs Künste', 'Room': 'Raumkuppel', 'Soru': 'Blitzschritt',
    'Tekkai': 'Eisenkörper', 'Noro-Noro-Strahl': 'Lahmstrahl', 'Shakushi': 'Katzenkrallen',
    'Santoryu: Oni Giri': 'Dreiklingen-Hieb', 'Gatling': 'Trommelfeuer', 'Thunderbolt Tempo': 'Donnerschlag',
    'Diable Jambe': 'Höllentritt', 'Cien Fleur: Clutch': 'Hundert Hände', 'Radikal Beam': 'Kanonenstrahl',
    'White Blow': 'Rauchschlag', 'Desert Spada': 'Sandklinge', 'El Thor': 'Himmelsblitz', 'Rokuogan': 'Königsstoß',
    'Amaashi': 'Windbein', 'Shark on Darts': 'Haipfeil', 'Hiken': 'Feuerfaust', 'Gamma Knife': 'Strahlenmesser',
    'Monster Point': 'Riesenform', 'Fischmenschen-Karate': 'Wellen-Karate', 'Fischmenschen': 'Meervolk',
    // ---------- Ergänzungen A3 (fehlende sichtbare Namen) ----------
    'Marco': 'Marlo',
    'Whitebeard': 'Weißbart',
    'Mihawk': 'Falkenauge',
    'Hancock': 'Schlangenprinzessin',
    'Shanks': 'Rotbart',
    'Alvida': 'Alma',
    'Cabaji': 'Cavi',
    'Mohji': 'Mokko',
    'Hatchan': 'Achtarm',
    'Chu': 'Schu',
    'Hody Jones': 'Hadro',
    'Sabo': 'Silvo',
    'Ivankov': 'Ilvo',
    'Ben Beckman': 'Benno',
    'Lucky Roo': 'Lukka',
    'Yasopp': 'Jesko',
    'Aokiji': 'Eisadmiral',
    'Kuma': 'Bär',
    'Perona': 'Geistermädchen',
    'Eustass Kid': 'Karrek',
    'Bonney': 'Bessa',
    'Hawkins': 'Holt',
    'Scratchmen Apoo': 'Apoo',
    'Gecko Moria': 'Morvan',
    'Absalom': 'Unsichtbarer',
    'Dr. Hogback': 'Dr. Hagen',
    'Thriller Bark': 'Geisterschiff',
    'Sabaody Archipel': 'Blasenarchipel',
    'Marineford': 'Marinenhafen',
    'Impel Down': 'Tiefkerker',
    'Dressrosa': 'Rosenreich',
    'Wano': 'Kirschreich',
    'Gum-Gum-Frucht': 'Gummi-Frucht',
    'Hana-Hana-Frucht': 'Blüten-Frucht',
    'Suna-Suna-Frucht': 'Sand-Frucht',
    'Mera-Mera-Frucht': 'Flammen-Frucht',
    'Ope-Ope-Frucht': 'Raum-Frucht',
    'Goro-Goro-Frucht': 'Donner-Frucht',
    'Yami-Yami-Frucht': 'Finsternis-Frucht',
    'Magu-Magu-Frucht': 'Magma-Frucht',
    'Pika-Pika-Frucht': 'Licht-Frucht',
    'Gura-Gura-Frucht': 'Beben-Frucht',
  }
};

// ---------- Anwenden ----------
(function () {
  const pick = () => {
    try {
      const q = new URLSearchParams(location.search).get('welt');
      if (q) { localStorage.setItem('grandline.world', q); return q; }
      return localStorage.getItem('grandline.world') || (GL.config && GL.config.world) || 'onepiece';
    } catch (e) { return (GL.config && GL.config.world) || 'onepiece'; }
  };
  const id = pick();
  const W = GL.worlds[id];
  GL.worldId = W ? id : 'onepiece';
  if (!W) return;

  const keys = Object.keys(W.map).sort((a, b) => b.length - a.length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Nur ganze Wörter ersetzen (sonst würde z. B. "Dial" auch in "Dialog" ersetzt)
  const L = 'A-Za-zÄÖÜäöüß0-9';
  const re = new RegExp('(?<![' + L + '])(?:' + keys.map(esc).join('|') + ')(?![' + L + '])', 'g');
  const tr = s => (typeof s === 'string' && re.test(s) ? (re.lastIndex = 0, s.replace(re, m => W.map[m])) : (re.lastIndex = 0, s));
  GL.world = { tr, title: W.title };

  // Alle Texte in den Daten umschreiben (ids bleiben unverändert)
  const walk = (o, key) => {
    if (Array.isArray(o)) return o.map(x => walk(x, key));
    if (o && typeof o === 'object') { Object.keys(o).forEach(k => { o[k] = walk(o[k], k); }); return o; }
    if (typeof o === 'string' && key !== 'id' && key !== 'unlock' && key !== 'reward' && key !== 'who') return tr(o);
    return o;
  };
  ['crew', 'factions', 'types', 'roles', 'abilities', 'traits', 'grunts', 'bosses', 'raids', 'hunted', 'fruits', 'relics',
   'islands', 'nodes', 'unlocks', 'upgrades', 'gear', 'events', 'heat', 'ranks', 'artifacts', 'specials', 'statuses']
    .forEach(k => { if (GL.data[k]) walk(GL.data[k]); });

  // Texte der Oberfläche: nach jedem Zeichnen sichtbare Texte und Titel umschreiben
  function fixDom(root) {
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = it.nextNode())) { const t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
    root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(el => {
      ['title', 'placeholder', 'aria-label'].forEach(a => { const v = el.getAttribute(a); if (v) { const t = tr(v); if (t !== v) el.setAttribute(a, t); } });
    });
  }
  const start = () => {
    document.title = W.title;
    const h1 = document.querySelector('header h1');
    if (h1) h1.textContent = W.title;
    const foot = document.querySelector('footer.fan');
    if (foot) foot.textContent = W.footer;
    fixDom(document.body);
    new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(nd => {
      if (nd.nodeType === 3) { const t = tr(nd.nodeValue); if (t !== nd.nodeValue) nd.nodeValue = t; }
      else if (nd.nodeType === 1) fixDom(nd);
    }))).observe(document.body, { childList: true, subtree: true, characterData: false });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
