// PIRATIN: Anrede für den eigenen Charakter: Pirat (m), Piratin (w) oder Pirat*in (n, neutral).
// Gespeichert in profile.char.anrede. Alte Spielstände ohne Angabe bleiben „Pirat“.
// Andere Spieler: ihre Anrede kommt mit den Ranglisten-Daten (row.anrede); fehlt sie, neutral.
//
// Neue Formen eintragen: links die bisherige (männliche) Form, rechts [weiblich, neutral].
window.GL = window.GL || {};

(function () {
  const IDS = ['m', 'w', 'n'];
  const norm = a => (IDS.includes(a) ? a : null);
  let cur = 'm';

  // Sätze und Wörter, die den eigenen Charakter anreden oder beschreiben
  const PH = {
    'Pirat': ['Piratin', 'Pirat*in'],
    'Dein Pirat': ['Deine Piratin', 'Dein*e Pirat*in'],
    'Erstelle deinen Piraten': ['Erstelle deine Piratin', 'Erstelle deine*n Pirat*in'],
    'Pirat und Aussehen bearbeiten': ['Piratin und Aussehen bearbeiten', 'Pirat*in und Aussehen bearbeiten'],
    'Kapitän': ['Kapitänin', 'Kapitän*in'],
    '⚓ Dein Pirat ist immer Kapitän': ['⚓ Deine Piratin ist immer Kapitänin', '⚓ Dein*e Pirat*in ist immer Kapitän*in'],
    'Dein Pirat ist als Kapitän spielbar und wird mit jedem Piratenrang stärker.': ['Deine Piratin ist als Kapitänin spielbar und wird mit jedem Piratenrang stärker.', 'Dein*e Pirat*in ist als Kapitän*in spielbar und wird mit jedem Piratenrang stärker.'],
    'Iss im Run eine Teufelsfrucht. Danach kannst du sie hier deinem Piraten geben.': ['Iss im Run eine Teufelsfrucht. Danach kannst du sie hier deiner Piratin geben.', 'Iss im Run eine Teufelsfrucht. Danach kannst du sie hier deiner Figur geben.'],
    'Wirkt, wenn dein Pirat Kapitän ist: wie eine gegessene Frucht am Start. Stufe Gewöhnlich, ab Rang 8 Selten. Erwachte Früchte und die Heil-Frucht gehen nicht.': ['Wirkt, wenn deine Piratin Kapitänin ist: wie eine gegessene Frucht am Start. Stufe Gewöhnlich, ab Rang 8 Selten. Erwachte Früchte und die Heil-Frucht gehen nicht.', 'Wirkt, wenn dein*e Pirat*in Kapitän*in ist: wie eine gegessene Frucht am Start. Stufe Gewöhnlich, ab Rang 8 Selten. Erwachte Früchte und die Heil-Frucht gehen nicht.'],
    'Wirkt, wenn dein Pirat Kapitän ist.': ['Wirkt, wenn deine Piratin Kapitänin ist.', 'Wirkt, wenn dein*e Pirat*in Kapitän*in ist.'],
    'Diesen Piraten mit der Mail sichern': ['Diese Piratin mit der Mail sichern', 'Diese Figur mit der Mail sichern'],
    'Wille des Kapitäns': ['Wille der Kapitänin', 'Wille der Kapitän*in'],
    'Eigener Pirat': ['Eigene Piratin', 'Eigene Figur']
  };

  // Piratenränge nach Index (die Namen in ranks.js sind die männliche Form)
  const RANKS = {
    0: ['Schiffsmädchen', 'Schiffskind'], 1: ['Deckschrubberin', 'Deckschrubber*in'], 2: ['Matrosin', 'Matros*in'],
    3: ['Bootsfrau', 'Bootsmensch'], 4: ['Kanonierin', 'Kanonier*in'], 5: ['Navigatorin', 'Navigator*in'],
    6: ['Erste Maatin', 'Erste*r Maat'], 7: ['Kapitänin', 'Kapitän*in'],
    12: ['Heldin von Paradies', 'Held*in von Paradies'], 13: ['Bezwingerin der CP9', 'Bezwinger*in der CP9'],
    15: ['Vize-Kapitänin der Flotte', 'Vize-Kapitän*in der Flotte'], 16: ['Kommandantin eines Kaisers', 'Kommandant*in eines Kaisers'],
    18: ['Piratin der Neuen Welt', 'Pirat*in der Neuen Welt'], 19: ['Herausforderin der Kaiser', 'Herausforderer*in der Kaiser'],
    20: ['Kaiserin der Meere', 'Kaiser*in der Meere'], 21: ['Piratenkönigin', 'Piratenkönig*in']
  };
  // Titel nach id (cosmetics.js)
  const TITLES = {
    kaempfer: ['Raufboldin', 'Raufbold*in'], jaeger: ['Kopfgeldjägerin', 'Kopfgeldjäger*in'], bezwinger: ['Bossbezwingerin', 'Bossbezwinger*in'],
    sammler: ['Sammlerin', 'Sammler*in'], wuchtig: ['Die Wuchtige', 'Wucht auf zwei Beinen'], matrose: ['Matrosin', 'Matros*in'],
    entdecker: ['Entdeckerin', 'Entdecker*in'], schatz: ['Schatzjägerin', 'Schatzjäger*in'], kartograph: ['Kartographin', 'Kartograph*in'],
    sturm: ['Sturmbezwingerin', 'Sturmbezwinger*in'], reisender: ['Weltreisende', 'Weltreisende*r'], kaiser: ['Kaiserin der Meere', 'Kaiser*in der Meere'],
    koenig: ['Piratenkönigin', 'Piratenkönig*in'], clown: ['Große Clownin', 'Große*r Clown*in'], fischfreund: ['Freundin der Fischmenschen', 'Freund*in der Fischmenschen'],
    revolutionaer: ['Revolutionärin', 'Revolutionär*in'], vize: ['Vizekapitänin', 'Vizekapitän*in'], gemuetlich: ['Gemütliche Kapitänin', 'Gemütliche*r Kapitän*in'],
    gastgeber: ['Gastgeberin der Grand Line', 'Gastgeber*in der Grand Line'], flottenchef: ['Herrin der Flotte', 'Chef*in der Flotte'],
    maat: ['Zuverlässige Maatin', 'Zuverlässige*r Maat'], duellant: ['Meisterin der Duelle', 'Meister*in der Duelle'], kanonier: ['Meisterkanonierin', 'Meisterkanonier*in'],
    schatzkoenig: ['Schatzkönigin', 'Schatzkönig*in'], krakenbaendiger: ['Krakenbändigerin', 'Krakenbändiger*in'], laternenhueter: ['Hüterin der Hafenlaterne', 'Hüter*in der Hafenlaterne'],
    lehrmeister: ['Lehrmeisterin', 'Lehrmeister*in'], fuenfmeister: ['Meisterin von Fünf', 'Meister*in von Fünf'], grossmeister: ['Großmeisterin der Bande', 'Großmeister*in der Bande'],
    seebaer: ['Seebärin', 'Seebär*in'], yonkoanw: ['Yonko-Anwärterin', 'Yonko-Anwärter*in'], kaiserjaeger: ['Kaiserjägerin', 'Kaiserjäger*in'],
    wuestenlaeufer: ['Wüstenläuferin', 'Wüstenläufer*in'], sturmreiter: ['Sturmreiterin', 'Sturmreiter*in'],
    'b-ruffy': ['Ruffys Fleischpartnerin', 'Ruffys Fleischpartner*in'], 'b-zorro': ['Zorros Wegweiserin', 'Zorros Wegweiser*in'],
    'b-nami': ['Namis Kassenwartin', 'Namis Kassenwart*in'], 'b-lysop': ['Lysops Mitlügnerin', 'Lysops Mitlügner*in'],
    'b-chopper': ['Choppers Lieblingspatientin', 'Choppers Lieblingspatient*in'], 'b-robin': ['Robins Lesefreundin', 'Robins Lesefreund*in'],
    'b-franky': ['Frankys Mitbauerin', 'Frankys Mitbauer*in']
  };
  // Englisch: meist gleich wie die männliche Form, nur ein paar Titel unterscheiden sich
  const EN = {
    'Piratin': 'Pirate', 'Pirat*in': 'Pirate', 'Piratenkönigin': 'Pirate Queen', 'Piratenkönig*in': 'Pirate Monarch',
    'Kaiserin der Meere': 'Empress of the seas', 'Kaiser*in der Meere': 'Ruler of the seas', 'Schiffsmädchen': 'Cabin girl', 'Schiffskind': 'Cabin kid',
    'Herrin der Flotte': 'Lady of the fleet', 'Chef*in der Flotte': 'Chief of the fleet', 'Bootsfrau': 'Boatswain', 'Bootsmensch': 'Boatswain',
    'Die Wuchtige': 'The Mighty', 'Wucht auf zwei Beinen': 'The Mighty', 'Heldin von Paradies': 'Heroine of Paradise',
    'Wie sollen wir dich nennen?': 'What should we call you?', 'Anrede': 'Form of address', 'Eigene Figur': 'Own character',
    'Diese Figur mit der Mail sichern': 'Secure this pirate with your email', 'Tipp kurz an, wie wir dich nennen sollen.': 'Tap once to choose how we address you.',
    'Frisur': 'Hairstyle', 'Gesicht': 'Face', 'Kurz': 'Short', 'Lang offen': 'Long', 'Pferdeschwanz': 'Ponytail', 'Zöpfe': 'Braids', 'Dutt': 'Bun',
    'Lockig': 'Curly', 'Undercut': 'Undercut', 'Glatze': 'Bald', 'Ohne': 'None', 'Wimpern': 'Lashes', 'Lidstrich': 'Eyeliner', 'Rouge': 'Blush', 'Sommersprossen': 'Freckles'
  };
  const pick = (m, forms, a) => (a === 'w' ? forms[0] : a === 'n' ? forms[1] : m);
  const wtr = s => (GL.world && GL.world.tr ? GL.world.tr(s) : s);

  GL.anrede = {
    IDS,
    LABEL: { m: 'Pirat', w: 'Piratin', n: 'Pirat*in' },
    norm,
    // Anrede eines Profils (eigener Stand): alte Stände ohne Angabe = Pirat
    of(profile) { return norm(profile && profile.char && profile.char.anrede) || 'm'; },
    // Anrede einer fremden Ranglisten-Zeile: ohne Angabe neutral
    ofRow(row) { return norm(row && row.anrede) || 'n'; },
    cur: () => cur,
    // Satz/Wort für den eigenen Charakter (a weglassen = aktuelle Anrede)
    t(m, a) { const f = PH[m]; return f ? pick(m, f, a || cur) : m; },
    title(id, a) {
      const t = ((GL.data.cosmetics || {}).titles || []).find(x => x.id === id);
      if (!t) return '';
      const m = t._m || t.name, f = TITLES[id];
      return f ? wtr(pick(m, f, a || cur)) : m;
    },
    // Für den eigenen Stand: Rang- und Titelnamen in den Daten umstellen (alle Anzeigen ziehen automatisch mit)
    apply(profile) {
      cur = GL.anrede.of(profile);
      (GL.data.ranks || []).forEach((r, k) => { if (r._m == null) r._m = r.name; r.name = RANKS[k] ? wtr(pick(r._m, RANKS[k], cur)) : r._m; });
      (((GL.data.cosmetics || {}).titles) || []).forEach(t => { if (t._m == null) t._m = t.name; t.name = TITLES[t.id] ? wtr(pick(t._m, TITLES[t.id], cur)) : t._m; });
      if (GL.data.crew) { const s = GL.data.crew.find(c => c.id === 'self'); if (s) s.anrede = cur; }
      if (GL.data.abilities && GL.data.abilities.self) GL.data.abilities.self.name = GL.anrede.t('Wille des Kapitäns', cur);
    },
    // Frauen unter den Kapitänen/Crew (für die Startauswahl: mindestens eine, wenn verfügbar)
    women: ['nami', 'robin', 'hina', 'tashigi', 'kalifa', 'vivi', 'hancock', 'alvida', 'koala', 'perona', 'bonney'],
    // Englisch: neue deutsche Formen auf dieselbe Übersetzung wie die männliche Form legen
    enSync() {
      if (!GL.i18n || GL.i18n.lang() !== 'en' || !GL.data.en) return;
      const X = GL.data.en, t = GL.i18n.t;
      Object.keys(EN).forEach(k => { if (X[k] == null) X[k] = EN[k]; });
      const both = (m, forms) => { const e = t(m); if (e !== m) forms.forEach(f => { if (X[f] == null) X[f] = e; }); };
      Object.keys(PH).forEach(m => both(m, PH[m]));
      (GL.data.ranks || []).forEach((r, k) => { if (RANKS[k]) both(r._m || r.name, RANKS[k]); });
      (((GL.data.cosmetics || {}).titles) || []).forEach(x => { if (TITLES[x.id]) both(x._m || x.name, TITLES[x.id]); });
      GL.i18nExtraP = (GL.i18nExtraP || []).concat([
        [/^(.+)\. Wirkt, wenn (?:deine Piratin Kapitänin|dein\*e Pirat\*in Kapitän\*in) ist\.$/, (m0, x) => t(x) + '. Works when your pirate is captain.']
      ]);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => GL.anrede.enSync()); else setTimeout(() => GL.anrede.enSync(), 0);
})();
