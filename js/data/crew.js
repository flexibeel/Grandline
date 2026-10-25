// Alle Figuren, die sich deiner Crew anschließen können.
//
// Neue Figur hinzufügen: einen Eintrag kopieren, eine neue id vergeben
// (klein, ohne Leerzeichen) und Werte anpassen.
//   type    = Kampfstil: 'kraft' | 'klinge' | 'technik' (siehe types.js)
//   role    = Rolle: 'brecher' | 'kaempfer' | 'helfer' (siehe roles.js)
//   faction = Bande: 'strohhut' | 'marine' | 'cp9' | 'baroque' (siehe factions.js)
//   hp  = Leben, atk = Angriff, spd = Tempo (wer schneller ist, greift zuerst an)
//   Fähigkeit: Eintrag mit derselben id in abilities.js
//   look = Aussehen des Pixel-Sprites (siehe js/ui/sprites.js)
//     hair, skin, shirt, pants: Farben
//     hat: 'straw' | 'band' | 'cap' | 'afro' | 'hood' (optional), hatColor: Farbe dazu
//     longHair: true für lange Haare
//   locked: true = muss erst freigeschaltet werden (siehe unlocks.js)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.crew = [
  // Strohhutbande
  { id: 'ruffy',   name: 'Ruffy',    type: 'kraft',   role: 'kaempfer', faction: 'strohhut', hp: 34, atk: 8,  spd: 6,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#d9423a', pants: '#3b5a8c', hat: 'straw', hatColor: '#e8c25a' } },
  { id: 'zorro',   name: 'Zorro',    type: 'klinge',  role: 'kaempfer', faction: 'strohhut', hp: 30, atk: 10, spd: 5,
    look: { hair: '#3f8f4f', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#2f3a2f', hat: 'band', hatColor: '#222222' } },
  { id: 'nami',    name: 'Nami',     type: 'technik', role: 'helfer',   faction: 'strohhut', hp: 27, atk: 7,  spd: 8,
    look: { hair: '#e07a2c', skin: '#f2c9a0', shirt: '#2f9bc2', pants: '#e8dcb0', longHair: true } },
  { id: 'lysop',   name: 'Lysop',    type: 'technik', role: 'kaempfer', faction: 'strohhut', hp: 20, atk: 8,  spd: 7,
    look: { hair: '#222222', skin: '#d9a87a', shirt: '#c9a23a', pants: '#6b4a2a', hat: 'afro' } },
  { id: 'sanji',   name: 'Sanji',    type: 'kraft',   role: 'kaempfer', faction: 'strohhut', hp: 26, atk: 9,  spd: 7,
    look: { hair: '#e8c95a', skin: '#f2c9a0', shirt: '#222222', pants: '#222222' } },
  { id: 'chopper', name: 'Chopper',  type: 'technik', role: 'helfer',   faction: 'strohhut', hp: 28, atk: 5,  spd: 6,
    look: { hair: '#6b4a2a', skin: '#c08a5a', shirt: '#d9709a', pants: '#d9709a', hat: 'cap', hatColor: '#d9709a' } },
  { id: 'robin',   name: 'Robin',    type: 'technik', role: 'helfer',   faction: 'strohhut', hp: 24, atk: 8,  spd: 6,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#6b4fa0', pants: '#3a2a5a', longHair: true } },
  { id: 'franky',  name: 'Franky',   type: 'kraft',   role: 'brecher',  faction: 'strohhut', hp: 38, atk: 7,  spd: 3,
    look: { hair: '#3fa0e0', skin: '#d9a87a', shirt: '#e8c93a', pants: '#2f86c9' } },
  { id: 'brook',   name: 'Brook',    type: 'klinge',  role: 'kaempfer', faction: 'strohhut', hp: 18, atk: 8,  spd: 8,
    look: { hair: '#2a2a2a', skin: '#f0f0f0', shirt: '#1a1a1a', pants: '#1a1a1a', hat: 'afro' } },

  // Marine
  { id: 'garp',    name: 'Grimm',     type: 'kraft',   role: 'brecher',  faction: 'marine',   hp: 40, atk: 7,  spd: 4,
    look: { hairStyle: 'glatze', hair: '#e8e8e8', skin: '#e8b890', shirt: '#f0f0f0', pants: '#1f3a6a', coat: '#24406e', x: ['mantel', 'keksdose', 'schnauzer'] } },
  { id: 'hina',    name: 'Hilde',     type: 'technik', role: 'brecher',  faction: 'marine',   hp: 34, atk: 6,  spd: 5,
    look: { hairStyle: 'zopf', hair: '#8a2f4a', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#1f3a6a', x: ['kette', 'handschellen'] } },
  { id: 'tashigi', name: 'Tessa',  type: 'klinge',  role: 'helfer',   faction: 'marine',   hp: 22, atk: 6,  spd: 7,
    look: { hairStyle: 'bob', hair: '#2f6a6a', skin: '#f2c9a0', shirt: '#e8d8b0', pants: '#2a3a5a', acc: 'brille', x: ['dreigriffe'] } },
  { id: 'koby',    name: 'Kian',     type: 'kraft',   role: 'kaempfer', faction: 'marine',   hp: 26, atk: 8,  spd: 7,
    look: { hairStyle: 'stachel', hair: '#5fbfa0', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#5a7aa0', hat: 'grosskappe', hatColor: '#f4f4f4' } },

  // CP9
  { id: 'kalifa',  name: 'Kalina',   type: 'klinge',  role: 'kaempfer', faction: 'cp9',      hp: 24, atk: 8,  spd: 7,
    look: { hairStyle: 'bob', hair: '#c86a3a', skin: '#f2c9a0', shirt: '#3a3048', pants: '#2a2a2a', acc: 'brille', x: ['mappe', 'schaum'] } },
  { id: 'kumadori',name: 'Kordo', type: 'technik', role: 'brecher',  faction: 'cp9',      hp: 30, atk: 6,  spd: 5,
    look: { hairStyle: 'tolle', hair: '#5a3a8a', skin: '#f0e6d8', shirt: '#3a3048', pants: '#2a2a2a', x: ['schminke', 'faecher'] } },
  { id: 'blueno',  name: 'Riegel',   type: 'kraft',   role: 'brecher',  faction: 'cp9',      hp: 36, atk: 6,  spd: 4,
    look: { hair: '#1a1a1a', skin: '#e8c0a0', shirt: '#1a1a1a', pants: '#1a1a1a', hat: 'melone', hatColor: '#5a4632', x: ['schluessel'] } },
  { id: 'jabra',   name: 'Wolfram',    type: 'kraft',   role: 'kaempfer', faction: 'cp9',      hp: 28, atk: 8,  spd: 6,
    look: { hairStyle: 'stachel', hair: '#6a6a72', skin: '#d9a87a', shirt: '#3a3048', pants: '#2a2a2a', longHair: true, x: ['klauen'] } },

  // Baroque Works
  { id: 'bonclay', name: 'Mimo', type: 'technik', role: 'brecher',  faction: 'baroque',  hp: 34, atk: 5,  spd: 5,
    look: { hairStyle: 'dutt', hair: '#3a2a5a', skin: '#f2c9a0', shirt: '#f0e8f0', pants: '#e8789a', scarf: '#e85a8a', x: ['boa', 'spitzenschuhe'] } },
  { id: 'mr5',     name: 'Herr Freitag',    type: 'kraft',   role: 'kaempfer', faction: 'baroque',  hp: 28, atk: 9,  spd: 6,
    look: { hairStyle: 'buerste', hair: '#3a3a3a', skin: '#f2c9a0', shirt: '#e8e0d0', pants: '#3a3a3a', acc: 'brille', coat: '#d8a030', x: ['mantel', 'russ', 'dampf'] } },
  { id: 'vivi',    name: 'Vina',     type: 'klinge',  role: 'helfer',   faction: 'baroque',  hp: 24, atk: 6,  spd: 7,
    look: { hairStyle: 'zoepfe', hair: '#6fc6e0', skin: '#f2c9a0', shirt: '#e8e0f0', pants: '#7a5aa0', x: ['schleier'] } },
  { id: 'mr1',     name: 'Herr Sonntag',    type: 'klinge',  role: 'kaempfer', faction: 'baroque',  hp: 30, atk: 8,  spd: 5,
    look: { hairStyle: 'buerste', hair: '#e8e8e8', skin: '#e8c0a0', shirt: '#4a4a52', pants: '#4a4a52', coat: '#6a6a72', x: ['mantel', 'klingen'] } },

  // ---- Freischaltbar (locked: true). Bedingungen stehen in unlocks.js ----
  // Danach als Kapitän wählbar und bei der Rekrutierung im Angebot.
  { id: 'smoker',    name: 'Russ',    type: 'klinge',  role: 'brecher',  faction: 'marine',  hp: 34, atk: 7, spd: 5, locked: true,
    look: { hairStyle: 'buerste', hair: '#3a3a3a', skin: '#f2c9a0', shirt: '#5a6a58', pants: '#3a4a3a', x: ['kessel', 'dampf'] } },
  { id: 'arlong',    name: 'Brack',    type: 'kraft',   role: 'kaempfer', faction: 'fischmensch', hp: 32, atk: 7, spd: 5, locked: true,
    look: { hairStyle: 'buerste', hair: '#3a6a7a', skin: '#5a8ab8', shirt: '#e8a040', pants: '#2a3a4a', x: ['zahnkette', 'haizaehne', 'flosse'] } },
  { id: 'crocodile', name: 'Sirokk', type: 'technik', role: 'kaempfer', faction: 'baroque', hp: 30, atk: 7, spd: 6, locked: true,
    look: { hairStyle: 'buerste', hair: '#c8a060', skin: '#d9a87a', shirt: '#2a2a2a', pants: '#222222', coat: '#7a1f35', scarf: '#e8d8b0', acc: 'narbe', x: ['mantel', 'pelz', 'sanduhr'] } },
  { id: 'enel',      name: 'Zirrus',      type: 'kraft',   role: 'kaempfer',                    hp: 26, atk: 8, spd: 7, locked: true,
    look: { hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#e8b030', pants: '#e8b030', hat: 'band', hatColor: '#e8e8e8' } },
  { id: 'rob-lucci', name: 'Agent Krall', type: 'kraft',   role: 'kaempfer', faction: 'cp9',     hp: 30, atk: 5, spd: 6, locked: true,
    look: { hairStyle: 'bob', hair: '#222222', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#2e2a3a', hat: 'ohrenkappe', hatColor: '#3a3048', coat: '#2a2a2a', x: ['mantel'] } },
  { id: 'kaku',      name: 'Stelz',      type: 'klinge',  role: 'kaempfer', faction: 'cp9',     hp: 28, atk: 8, spd: 7, locked: true,
    look: { hairStyle: 'zopf', hair: '#c8703a', skin: '#f2c9a0', shirt: '#2e2a3a', pants: '#222222', hat: 'cap', hatColor: '#e8e0d0', x: ['stiefel', 'schwertruecken'] } },
  { id: 'jinbei',    name: 'Jonah',    type: 'kraft',   role: 'brecher',  faction: 'samurai', hp: 40, atk: 7, spd: 4, locked: true,
    look: { hair: '#1a1a1a', skin: '#5a8fc2', shirt: '#e0e0d0', pants: '#2a3a5a' } },
  { id: 'ace',       name: 'Asch',       type: 'kraft',   role: 'kaempfer', faction: 'weissbart', hp: 28, atk: 9, spd: 6, locked: true,
    look: { hairStyle: 'buerste', hair: '#b8b4ac', skin: '#e8b890', shirt: '#7a4a2a', pants: '#3a3a3a', x: ['russ', 'handschuhe', 'glut'] } },
  { id: 'law',       name: 'Lorn',       type: 'klinge',  role: 'helfer',   faction: 'samurai', hp: 26, atk: 7, spd: 6, locked: true,
    look: { hair: '#1a1a1a', skin: '#e8c0a0', shirt: '#222222', pants: '#4a4030', hat: 'cap', hatColor: '#f0f0f0' } },

  // Neue Freischaltungen über Raids und erwachte Früchte
  { id: 'marco',      name: 'Falk',       type: 'technik', role: 'helfer',   faction: 'weissbart', hp: 32, atk: 6,  spd: 7, locked: true,
    look: { hairStyle: 'zopf', hair: '#2a2a3a', skin: '#d8a878', shirt: '#5a6a8a', pants: '#3a3a3a', coat: '#2a3a5a', x: ['mantel', 'feder', 'blauflamme'] } },
  { id: 'whitebeard', name: 'Gischt',  type: 'kraft',   role: 'brecher',  faction: 'weissbart', hp: 48, atk: 9,  spd: 3, locked: true,
    look: { hairStyle: 'kranz', hair: '#c8c8c0', skin: '#e0b088', beard: '#c8c8c0', shirt: '#4a7a8a', pants: '#2a2a3a', hat: 'cap', hatColor: '#2a3a5a', acc: 'pfeife', x: ['anker'] } },
  { id: 'mihawk',     name: 'Silas',      type: 'klinge',  role: 'kaempfer', faction: 'samurai',   hp: 30, atk: 11, spd: 6, locked: true,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#3a2a1a', hat: 'cap', hatColor: '#3a2a1a' } },
  { id: 'hancock',    name: 'Mira',     type: 'technik', role: 'kaempfer', faction: 'samurai',   hp: 28, atk: 9,  spd: 7, locked: true,
    look: { hair: '#1a1a1a', skin: '#f6d2b0', shirt: '#c0304a', pants: '#e8e8e8', longHair: true } },
  { id: 'doflamingo', name: 'Rosé',  type: 'klinge',  role: 'kaempfer', faction: 'samurai',   hp: 30, atk: 9,  spd: 7, locked: true,
    look: { hair: '#e8d070', skin: '#f2c9a0', shirt: '#e870a0', pants: '#f0f0f0' } },
  { id: 'shanks',     name: 'Fenn',      type: 'klinge',  role: 'kaempfer', faction: 'rothaar',   hp: 34, atk: 10, spd: 7, locked: true,
    look: { hairStyle: 'tolle', hair: '#c8ccd0', skin: '#e8c0a0', shirt: '#3a3a44', pants: '#2a2a2a', coat: '#c8302c', acc: 'ohrring', x: ['mantel', 'schwertruecken'] } },

  // ---- Großes Inhalts-Update: neue Banden und bekannte Gesichter ----
  // Buggy-Piraten
  { id: 'buggy',     name: 'Pomp',       type: 'technik', role: 'kaempfer', faction: 'buggy',      hp: 26, atk: 7,  spd: 6, locked: true,
    look: { hairStyle: 'buerste', hair: '#e07a2c', skin: '#f6e6da', shirt: '#f4f0e0', pants: '#3a2a5a', hat: 'narrenkappe', hatColor: '#c2318a', nose: '#e0302a', x: ['baelle', 'konfetti'] } },
  { id: 'alvida',    name: 'Hanne',      type: 'kraft',   role: 'brecher',  faction: 'buggy',      hp: 34, atk: 5,  spd: 4, locked: true,
    look: { hairStyle: 'locken', hair: '#c0603a', skin: '#f0c8a8', shirt: '#4a9a8a', pants: '#e87aa0', hat: 'sonnenhut', hatColor: '#f4f0e0', x: ['keule', 'schaum'] } },
  { id: 'cabaji',    name: 'Jockel',      type: 'klinge',  role: 'kaempfer', faction: 'buggy',      hp: 27, atk: 8,  spd: 7, locked: true,
    look: { hairStyle: 'tolle', hair: '#2a2a3a', skin: '#e8b890', shirt: '#f2d24a', pants: '#3a2a5a', x: ['messer', 'fackel'] } },
  { id: 'mohji',     name: 'Poldi',       type: 'kraft',   role: 'helfer',   faction: 'buggy',      hp: 30, atk: 7,  spd: 5, locked: true,
    look: { hairStyle: 'kranz', hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#f4f0e0', pants: '#2a2a2a', hat: 'tophat', hatColor: '#2a2a2a', coat: '#b8343a', x: ['mantel', 'schnauzer', 'peitsche'] } },
  // Arlong-Bande (Fischmenschen)
  { id: 'hatchan',   name: 'Okko',     type: 'klinge',  role: 'kaempfer', faction: 'fischmensch', hp: 32, atk: 7, spd: 5, locked: true,
    look: { hairStyle: 'dutt', hair: '#7a3a8a', skin: '#c87aa0', shirt: '#e8c040', pants: '#3a5a8a', x: ['aermel', 'tinte'] } },
  { id: 'kuroobi',   name: 'Torn',     type: 'kraft',   role: 'brecher',  faction: 'fischmensch', hp: 38, atk: 6, spd: 4, locked: true,
    look: { hairStyle: 'glatze', hair: '#1a1a1a', skin: '#6ab0a8', shirt: '#f0f0f0', pants: '#f0f0f0', x: ['schwarzgurt', 'handschuhe', 'flosse'] } },
  { id: 'chu',       name: 'Prill',         type: 'technik', role: 'kaempfer', faction: 'fischmensch', hp: 25, atk: 9, spd: 7, locked: true,
    look: { hairStyle: 'glatze', hair: '#2a2a2a', skin: '#7ac0b0', shirt: '#e8a040', pants: '#3a3a5a', acc: 'brille', x: ['lippen', 'schnorchel'] } },
  { id: 'hody',      name: 'Grimmflosse',  type: 'kraft',   role: 'kaempfer', faction: 'fischmensch', hp: 30, atk: 8, spd: 5, locked: true,
    look: { hairStyle: 'stachel', hair: '#2a3a5a', skin: '#5a8ab8', shirt: '#2a2a3a', pants: '#3a2a4a', coat: '#3a2a4a', x: ['mantel', 'flasche', 'flosse', 'haizaehne'] } },
  // Revolutionsarmee
  { id: 'sabo',      name: 'Jorin',        type: 'kraft',   role: 'kaempfer', faction: 'revolution', hp: 30, atk: 9,  spd: 7, locked: true,
    look: { hair: '#3a2a20', skin: '#f2c9a0', shirt: '#e8e0d0', pants: '#3a3a3a', hat: 'tophat', hatColor: '#7a1f35', coat: '#2f5a4a', x: ['mantel', 'schutzbrille'] } },
  { id: 'ivankov',   name: 'Lila',     type: 'technik', role: 'helfer',   faction: 'revolution', hp: 36, atk: 6,  spd: 5, locked: true,
    look: { hair: '#ece4f4', skin: '#f6d8c0', shirt: '#7a1f35', pants: '#2a2a2a', hat: 'afro', scarf: '#d9a640', x: ['federkragen', 'lippen'] } },
  { id: 'koala',     name: 'Tilda',       type: 'kraft',   role: 'kaempfer', faction: 'revolution', hp: 28, atk: 8,  spd: 7, locked: true,
    look: { hairStyle: 'zoepfe', hair: '#d87a3a', skin: '#f6d8c0', shirt: '#e8e8e8', pants: '#3a5a8a', hat: 'cap', hatColor: '#8fb08a', x: ['notizbuch'] } },
  { id: 'dragon',    name: 'Rian',      type: 'technik', role: 'kaempfer', faction: 'revolution', hp: 34, atk: 9,  spd: 7, locked: true,
    look: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#3a4a3a', pants: '#2a2a2a', hat: 'hood', hatColor: '#5a6a50', scarf: '#7a1f35', x: ['schal', 'windwirbel'] } },
  // Rothaar-Piraten
  { id: 'beckman',   name: 'Lenz', type: 'technik', role: 'helfer',   faction: 'rothaar',    hp: 30, atk: 8,  spd: 6, locked: true,
    look: { hairStyle: 'locken', hair: '#1a1a1a', skin: '#c89a70', shirt: '#6a5a4a', pants: '#3a3a3a', acc: 'brille', x: ['notizbuch', 'gewehr'] } },
  { id: 'roo',       name: 'Brotz',   type: 'kraft',   role: 'brecher',  faction: 'rothaar',    hp: 44, atk: 6,  spd: 3, locked: true,
    look: { hair: '#a0502a', skin: '#e8b890', beard: '#a0502a', shirt: '#8a4a3a', pants: '#3a3a3a', hat: 'kochmuetze', hatColor: '#f4f0e8', x: ['latz', 'pfanne'] } },
  { id: 'yasopp',    name: 'Piet',      type: 'technik', role: 'kaempfer', faction: 'rothaar',    hp: 22, atk: 9,  spd: 8, locked: true,
    look: { hairStyle: 'bob', hair: '#3a2a2a', skin: '#d8a878', shirt: '#4a5a6a', pants: '#3a3a2a', x: ['zielglas', 'armbrust'] } },
  // Neue Gesichter für bekannte Banden
  { id: 'aokiji',    name: 'Reif',      type: 'technik', role: 'brecher',  faction: 'marine',     hp: 38, atk: 7,  spd: 5, locked: true,
    look: { hair: '#2a2a3a', skin: '#c89a70', shirt: '#e8f0f8', pants: '#a8c8e0', hat: 'zipfel', hatColor: '#8ac0e8', scarf: '#5a90c8', x: ['schal'] } },
  { id: 'fukuro',    name: 'Plapper',      type: 'kraft',   role: 'brecher',  faction: 'cp9',        hp: 36, atk: 6,  spd: 5, locked: true,
    look: { hairStyle: 'glatze', hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#3a3048', pants: '#2a2a2a', beard: '#5a4a3a', x: ['mundpflaster'] } },
  { id: 'vista',     name: 'Veit',       type: 'klinge',  role: 'kaempfer', faction: 'weissbart',  hp: 30, atk: 9,  spd: 6, locked: true,
    look: { hairStyle: 'bob', hair: '#a05a3a', skin: '#f0d0b0', shirt: '#6a8a4a', pants: '#3a3a3a', acc: 'blume', x: ['klingen', 'blueten'] } },
  { id: 'kuma',      name: 'Tatz',        type: 'kraft',   role: 'brecher',  faction: 'samurai',    hp: 46, atk: 7,  spd: 3, locked: true,
    look: { hair: '#2a2a2a', skin: '#c8a080', shirt: '#4a3a2a', pants: '#3a3a3a', mask: 'bear' } },
  { id: 'perona',    name: 'Huschel',      type: 'technik', role: 'helfer',   faction: 'thriller',   hp: 22, atk: 6,  spd: 7, locked: true,
    look: { hair: '#e870a0', skin: '#f2d0b8', shirt: '#2a1a2a', pants: '#e870a0', longHair: true, hat: 'cap', hatColor: '#c04a7a' } },

  // Schlimmste Generation (Supernovas von Sabaody)
  { id: 'kid',       name: 'Magnus', type: 'kraft',   role: 'kaempfer', faction: 'supernova', hp: 32, atk: 9, spd: 6, locked: true,
    look: { hairStyle: 'buerste', hair: '#3a4a6a', skin: '#e8c0a0', shirt: '#6a6a7a', pants: '#2a2a2a', x: ['schutzbrille', 'metallarm', 'magnet'] } },
  { id: 'killer',    name: 'Simon',      type: 'klinge',  role: 'kaempfer', faction: 'supernova', hp: 27, atk: 9, spd: 8, locked: true,
    look: { hair: '#3a2a3a', skin: '#e8c0a0', shirt: '#3a3a3a', pants: '#2a2a3a', hat: 'hood', hatColor: '#4a2a4a', x: ['domino', 'sicheln'] } },
  { id: 'bonney',    name: 'Lotta',      type: 'technik', role: 'helfer',   faction: 'supernova', hp: 28, atk: 6, spd: 7, locked: true,
    look: { hairStyle: 'zoepfe', hair: '#e8904a', skin: '#f6d8c0', shirt: '#f4f0e0', pants: '#3a6a8a', hat: 'ohrenkappe', hatColor: '#4a8a4a', x: ['fleischkeule', 'pflaster'] } },
  { id: 'drake',     name: 'Gregor',       type: 'kraft',   role: 'brecher',  faction: 'supernova', hp: 40, atk: 7, spd: 4, locked: true,
    look: { hairStyle: 'buerste', hair: '#5a3a2a', skin: '#d8a878', shirt: '#e8dcb0', pants: '#3a4a3a', beard: '#5a3a2a', coat: '#4a7a4a', x: ['mantel', 'schwanz', 'zahnkette'] } },
  { id: 'hawkins',   name: 'Olin',     type: 'technik', role: 'helfer',   faction: 'supernova', hp: 30, atk: 6, spd: 5, locked: true,
    look: { hairStyle: 'bob', hair: '#2a2a3a', skin: '#f0d8c0', shirt: '#e8e0d0', pants: '#3a2a4a', coat: '#2a6a6a', x: ['mantel', 'karten', 'puppe'] } },
  { id: 'apoo',      name: 'Rondo', type: 'technik', role: 'kaempfer', faction: 'supernova', hp: 26, atk: 8, spd: 7, locked: true,
    look: { hairStyle: 'zoepfe', hair: '#2a2a2a', skin: '#a87a58', shirt: '#4a8ac0', pants: '#3a3a5a', hat: 'ohrenschuetzer', hatColor: '#c2318a', x: ['trommel'] } },
  // Thriller-Bark-Piraten
  { id: 'moria',     name: 'Graf Dämmerling', type: 'technik', role: 'brecher',  faction: 'thriller', hp: 44, atk: 7, spd: 3, locked: true,
    look: { hair: '#3a2a4a', skin: '#b8b0c8', shirt: '#2a2030', pants: '#4a2a3a', mask: 'bat' } },
  { id: 'absalom',   name: 'Ulf',     type: 'klinge',  role: 'kaempfer', faction: 'thriller', hp: 28, atk: 8, spd: 7, locked: true,
    look: { hair: '#e8c060', skin: '#f2c9a0', shirt: '#e8e0d0', pants: '#4a3a2a', mask: 'leopard' } },
  { id: 'hogback',   name: 'Doktor Flick', type: 'technik', role: 'helfer',   faction: 'thriller', hp: 30, atk: 5, spd: 5, locked: true,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#2a2a2a', acc: 'brille' } }
];
