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
  { id: 'garp',    name: 'Garp',     type: 'kraft',   role: 'brecher',  faction: 'marine',   hp: 40, atk: 7,  spd: 4,
    look: { hair: '#d8d8d8', skin: '#e8b890', shirt: '#f0f0f0', pants: '#1f3a6a' } },
  { id: 'hina',    name: 'Hina',     type: 'technik', role: 'brecher',  faction: 'marine',   hp: 34, atk: 6,  spd: 5,
    look: { hair: '#e870a0', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#1f3a6a', longHair: true } },
  { id: 'tashigi', name: 'Tashigi',  type: 'klinge',  role: 'helfer',   faction: 'marine',   hp: 22, atk: 6,  spd: 7,
    look: { hair: '#1a1a2a', skin: '#f2c9a0', shirt: '#7aa0d0', pants: '#2a3a5a' } },
  { id: 'koby',    name: 'Koby',     type: 'kraft',   role: 'kaempfer', faction: 'marine',   hp: 26, atk: 8,  spd: 7,
    look: { hair: '#e870a0', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#5a7aa0', hat: 'cap', hatColor: '#f0f0f0' } },

  // CP9
  { id: 'kalifa',  name: 'Kalifa',   type: 'klinge',  role: 'kaempfer', faction: 'cp9',      hp: 24, atk: 8,  spd: 7,
    look: { hair: '#e8d070', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#2a2a2a', longHair: true } },
  { id: 'kumadori',name: 'Kumadori', type: 'technik', role: 'brecher',  faction: 'cp9',      hp: 30, atk: 6,  spd: 5,
    look: { hair: '#d84a2a', skin: '#f0f0f0', shirt: '#e8b030', pants: '#7a3a2a', hat: 'afro' } },
  { id: 'blueno',  name: 'Blueno',   type: 'kraft',   role: 'brecher',  faction: 'cp9',      hp: 36, atk: 6,  spd: 4,
    look: { hair: '#1a1a1a', skin: '#e8c0a0', shirt: '#1a1a1a', pants: '#1a1a1a', hat: 'band', hatColor: '#1a1a1a' } },
  { id: 'jabra',   name: 'Jabra',    type: 'kraft',   role: 'kaempfer', faction: 'cp9',      hp: 28, atk: 8,  spd: 6,
    look: { hair: '#1a1a1a', skin: '#d9a87a', shirt: '#2a2a2a', pants: '#2a2a2a', longHair: true } },

  // Baroque Works
  { id: 'bonclay', name: 'Bon Clay', type: 'technik', role: 'brecher',  faction: 'baroque',  hp: 34, atk: 5,  spd: 5,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#e8789a', pants: '#f0f0f0' } },
  { id: 'mr5',     name: 'Mr. 5',    type: 'kraft',   role: 'kaempfer', faction: 'baroque',  hp: 28, atk: 9,  spd: 6,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#e8d070', pants: '#3a3a3a', hat: 'cap', hatColor: '#3a3a3a' } },
  { id: 'vivi',    name: 'Vivi',     type: 'klinge',  role: 'helfer',   faction: 'baroque',  hp: 24, atk: 6,  spd: 7,
    look: { hair: '#6fc6e0', skin: '#f2c9a0', shirt: '#e8e0f0', pants: '#7a5aa0', longHair: true } },
  { id: 'mr1',     name: 'Mr. 1',    type: 'klinge',  role: 'kaempfer', faction: 'baroque',  hp: 30, atk: 8,  spd: 5,
    look: { hair: '#1a1a1a', skin: '#a8785a', shirt: '#3a3a3a', pants: '#3a3a3a' } },

  // ---- Freischaltbar (locked: true). Bedingungen stehen in unlocks.js ----
  // Danach als Kapitän wählbar und bei der Rekrutierung im Angebot.
  { id: 'smoker',    name: 'Smoker',    type: 'klinge',  role: 'brecher',  faction: 'marine',  hp: 34, atk: 7, spd: 5, locked: true,
    look: { hair: '#dddddd', skin: '#f2c9a0', shirt: '#3a4a3a', pants: '#3a4a3a' } },
  { id: 'arlong',    name: 'Arlong',    type: 'kraft',   role: 'kaempfer', faction: 'fischmensch', hp: 32, atk: 7, spd: 5, locked: true,
    look: { hair: '#1a1a1a', skin: '#6aa0c8', shirt: '#e8d070', pants: '#3a5a3a' } },
  { id: 'crocodile', name: 'Crocodile', type: 'technik', role: 'kaempfer', faction: 'baroque', hp: 30, atk: 7, spd: 6, locked: true,
    look: { hair: '#111111', skin: '#f2c9a0', shirt: '#8a6d2f', pants: '#222222' } },
  { id: 'enel',      name: 'Enel',      type: 'kraft',   role: 'kaempfer',                    hp: 26, atk: 8, spd: 7, locked: true,
    look: { hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#e8b030', pants: '#e8b030', hat: 'band', hatColor: '#e8e8e8' } },
  { id: 'rob-lucci', name: 'Rob Lucci', type: 'kraft',   role: 'kaempfer', faction: 'cp9',     hp: 30, atk: 5, spd: 6, locked: true,
    look: { hair: '#222222', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#222222', hat: 'cap', hatColor: '#222222' } },
  { id: 'kaku',      name: 'Kaku',      type: 'klinge',  role: 'kaempfer', faction: 'cp9',     hp: 28, atk: 8, spd: 7, locked: true,
    look: { hair: '#8a5a2a', skin: '#f2c9a0', shirt: '#222222', pants: '#222222', hat: 'cap', hatColor: '#f0f0f0' } },
  { id: 'jinbei',    name: 'Jinbei',    type: 'kraft',   role: 'brecher',  faction: 'samurai', hp: 40, atk: 7, spd: 4, locked: true,
    look: { hair: '#1a1a1a', skin: '#5a8fc2', shirt: '#e0e0d0', pants: '#2a3a5a' } },
  { id: 'ace',       name: 'Ace',       type: 'kraft',   role: 'kaempfer', faction: 'weissbart', hp: 28, atk: 9, spd: 6, locked: true,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#f2c9a0', pants: '#3a3a3a', hat: 'cap', hatColor: '#e07a2c' } },
  { id: 'law',       name: 'Law',       type: 'klinge',  role: 'helfer',   faction: 'samurai', hp: 26, atk: 7, spd: 6, locked: true,
    look: { hair: '#1a1a1a', skin: '#e8c0a0', shirt: '#222222', pants: '#4a4030', hat: 'cap', hatColor: '#f0f0f0' } },

  // Neue Freischaltungen über Raids und erwachte Früchte
  { id: 'marco',      name: 'Marco',       type: 'technik', role: 'helfer',   faction: 'weissbart', hp: 32, atk: 6,  spd: 7, locked: true,
    look: { hair: '#e8d070', skin: '#f2c9a0', shirt: '#7a4fc4', pants: '#2a3a5a' } },
  { id: 'whitebeard', name: 'Whitebeard',  type: 'kraft',   role: 'brecher',  faction: 'weissbart', hp: 48, atk: 9,  spd: 3, locked: true,
    look: { hair: '#f4f4f4', skin: '#e8b890', shirt: '#f0f0f0', pants: '#4a3a6a', hat: 'band', hatColor: '#2a2a2a' } },
  { id: 'mihawk',     name: 'Mihawk',      type: 'klinge',  role: 'kaempfer', faction: 'samurai',   hp: 30, atk: 11, spd: 6, locked: true,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#3a2a1a', hat: 'cap', hatColor: '#3a2a1a' } },
  { id: 'hancock',    name: 'Hancock',     type: 'technik', role: 'kaempfer', faction: 'samurai',   hp: 28, atk: 9,  spd: 7, locked: true,
    look: { hair: '#1a1a1a', skin: '#f6d2b0', shirt: '#c0304a', pants: '#e8e8e8', longHair: true } },
  { id: 'doflamingo', name: 'Doflamingo',  type: 'klinge',  role: 'kaempfer', faction: 'samurai',   hp: 30, atk: 9,  spd: 7, locked: true,
    look: { hair: '#e8d070', skin: '#f2c9a0', shirt: '#e870a0', pants: '#f0f0f0' } },
  { id: 'shanks',     name: 'Shanks',      type: 'klinge',  role: 'kaempfer', faction: 'rothaar',   hp: 34, atk: 10, spd: 7, locked: true,
    look: { hair: '#c0302a', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#3a3a3a' } },

  // ---- Großes Inhalts-Update: neue Banden und bekannte Gesichter ----
  // Buggy-Piraten
  { id: 'buggy',     name: 'Buggy',       type: 'technik', role: 'kaempfer', faction: 'buggy',      hp: 26, atk: 7,  spd: 6, locked: true,
    look: { hair: '#2f5aa8', skin: '#f6e6da', shirt: '#c0392b', pants: '#3a2a5a', hat: 'tricorn', hatColor: '#e8a030', nose: '#e0302a' } },
  { id: 'alvida',    name: 'Alvida',      type: 'kraft',   role: 'brecher',  faction: 'buggy',      hp: 34, atk: 5,  spd: 4, locked: true,
    look: { hair: '#1a1a1a', skin: '#f6d8c0', shirt: '#e8e8e8', pants: '#c04a6a', hat: 'cap', hatColor: '#e8e0d0', longHair: true } },
  { id: 'cabaji',    name: 'Cabaji',      type: 'klinge',  role: 'kaempfer', faction: 'buggy',      hp: 27, atk: 8,  spd: 7, locked: true,
    look: { hair: '#4a7a3a', skin: '#f2c9a0', shirt: '#e8e8d8', pants: '#3a3a5a', hat: 'band', hatColor: '#c0392b' } },
  { id: 'mohji',     name: 'Mohji',       type: 'kraft',   role: 'helfer',   faction: 'buggy',      hp: 30, atk: 7,  spd: 5, locked: true,
    look: { hair: '#e8e8e8', skin: '#f2c9a0', shirt: '#8a6a3a', pants: '#5a4a3a', hat: 'ears', hatColor: '#f0f0f0' } },
  // Arlong-Bande (Fischmenschen)
  { id: 'hatchan',   name: 'Hatchan',     type: 'klinge',  role: 'kaempfer', faction: 'fischmensch', hp: 32, atk: 7, spd: 5, locked: true,
    look: { hair: '#c0392b', skin: '#e89a8a', shirt: '#e8c040', pants: '#3a5a8a', mask: 'octo' } },
  { id: 'kuroobi',   name: 'Kuroobi',     type: 'kraft',   role: 'brecher',  faction: 'fischmensch', hp: 38, atk: 6, spd: 4, locked: true,
    look: { hair: '#1a1a1a', skin: '#7aa0c0', shirt: '#2a2a2a', pants: '#2a2a2a', hat: 'band', hatColor: '#1a1a1a' } },
  { id: 'chu',       name: 'Chu',         type: 'technik', role: 'kaempfer', faction: 'fischmensch', hp: 25, atk: 9, spd: 7, locked: true,
    look: { hair: '#2a2a2a', skin: '#8ab0c8', shirt: '#e86a3a', pants: '#3a3a5a', nose: '#e86a7a' } },
  { id: 'hody',      name: 'Hody Jones',  type: 'kraft',   role: 'kaempfer', faction: 'fischmensch', hp: 30, atk: 8, spd: 5, locked: true,
    look: { hair: '#1a1a2a', skin: '#7aa0c8', shirt: '#2a2a3a', pants: '#5a4a7a', mask: 'shark' } },
  // Revolutionsarmee
  { id: 'sabo',      name: 'Sabo',        type: 'kraft',   role: 'kaempfer', faction: 'revolution', hp: 30, atk: 9,  spd: 7, locked: true,
    look: { hair: '#f0d070', skin: '#f2c9a0', shirt: '#2a4a8a', pants: '#e8e8e8', hat: 'tophat', hatColor: '#2a2a3a' } },
  { id: 'ivankov',   name: 'Ivankov',     type: 'technik', role: 'helfer',   faction: 'revolution', hp: 36, atk: 6,  spd: 5, locked: true,
    look: { hair: '#7a3a9a', skin: '#f6d8c0', shirt: '#e85a8a', pants: '#2a2a2a', hat: 'afro' } },
  { id: 'koala',     name: 'Koala',       type: 'kraft',   role: 'kaempfer', faction: 'revolution', hp: 28, atk: 8,  spd: 7, locked: true,
    look: { hair: '#e8a060', skin: '#f6d8c0', shirt: '#e8e8e8', pants: '#3a5a8a', hat: 'cap', hatColor: '#e8a040', longHair: true } },
  { id: 'dragon',    name: 'Dragon',      type: 'technik', role: 'kaempfer', faction: 'revolution', hp: 34, atk: 9,  spd: 7, locked: true,
    look: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#2f5a3a', pants: '#2a2a2a', hat: 'hood', hatColor: '#2f5a3a' } },
  // Rothaar-Piraten
  { id: 'beckman',   name: 'Ben Beckman', type: 'technik', role: 'helfer',   faction: 'rothaar',    hp: 30, atk: 8,  spd: 6, locked: true,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#3a3a3a', pants: '#3a3a3a', beard: '#2a2a2a' } },
  { id: 'roo',       name: 'Lucky Roo',   type: 'kraft',   role: 'brecher',  faction: 'rothaar',    hp: 44, atk: 6,  spd: 3, locked: true,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#3a5a3a', hat: 'cap', hatColor: '#e8c040' } },
  { id: 'yasopp',    name: 'Yasopp',      type: 'technik', role: 'kaempfer', faction: 'rothaar',    hp: 22, atk: 9,  spd: 8, locked: true,
    look: { hair: '#e8c070', skin: '#f2c9a0', shirt: '#4a6a3a', pants: '#3a2a1a', hat: 'band', hatColor: '#3a2a1a', longHair: true } },
  // Neue Gesichter für bekannte Banden
  { id: 'aokiji',    name: 'Aokiji',      type: 'technik', role: 'brecher',  faction: 'marine',     hp: 38, atk: 7,  spd: 5, locked: true,
    look: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#e8f0f8', pants: '#e8f0f8', hat: 'band', hatColor: '#7ab0e0' } },
  { id: 'fukuro',    name: 'Fukuro',      type: 'kraft',   role: 'brecher',  faction: 'cp9',        hp: 36, atk: 6,  spd: 5, locked: true,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#2a2a2a', beard: '#3a3a3a' } },
  { id: 'vista',     name: 'Vista',       type: 'klinge',  role: 'kaempfer', faction: 'weissbart',  hp: 30, atk: 9,  spd: 6, locked: true,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#3a3a5a', hat: 'tophat', hatColor: '#2a2a2a', beard: '#1a1a1a' } },
  { id: 'kuma',      name: 'Kuma',        type: 'kraft',   role: 'brecher',  faction: 'samurai',    hp: 46, atk: 7,  spd: 3, locked: true,
    look: { hair: '#2a2a2a', skin: '#c8a080', shirt: '#4a3a2a', pants: '#3a3a3a', mask: 'bear' } },
  { id: 'perona',    name: 'Perona',      type: 'technik', role: 'helfer',   faction: 'thriller',   hp: 22, atk: 6,  spd: 7, locked: true,
    look: { hair: '#e870a0', skin: '#f2d0b8', shirt: '#2a1a2a', pants: '#e870a0', longHair: true, hat: 'cap', hatColor: '#c04a7a' } },

  // Schlimmste Generation (Supernovas von Sabaody)
  { id: 'kid',       name: 'Eustass Kid', type: 'kraft',   role: 'kaempfer', faction: 'supernova', hp: 32, atk: 9, spd: 6, locked: true,
    look: { hair: '#d0302a', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#5a3a2a', hat: 'afro', acc: 'narbe' } },
  { id: 'killer',    name: 'Killer',      type: 'klinge',  role: 'kaempfer', faction: 'supernova', hp: 27, atk: 9, spd: 8, locked: true,
    look: { hair: '#f2d24a', skin: '#f2c9a0', shirt: '#e8a0b0', pants: '#2a3a5a', longHair: true, acc: 'brille' } },
  { id: 'bonney',    name: 'Bonney',      type: 'technik', role: 'helfer',   faction: 'supernova', hp: 28, atk: 6, spd: 7, locked: true,
    look: { hair: '#e870a0', skin: '#f6d8c0', shirt: '#3a3a3a', pants: '#3a6a3a', hat: 'cap', hatColor: '#4a8a4a', longHair: true } },
  { id: 'drake',     name: 'Drake',       type: 'kraft',   role: 'brecher',  faction: 'supernova', hp: 40, atk: 7, spd: 4, locked: true,
    look: { hair: '#c08040', skin: '#e0b088', shirt: '#4a3a2a', pants: '#2a2a2a', hat: 'tricorn', hatColor: '#3a2a1a', acc: 'narbe' } },
  { id: 'hawkins',   name: 'Hawkins',     type: 'technik', role: 'helfer',   faction: 'supernova', hp: 30, atk: 6, spd: 5, locked: true,
    look: { hair: '#f4e8b0', skin: '#f6e0c8', shirt: '#6a3a8a', pants: '#3a2a4a', longHair: true } },
  { id: 'apoo',      name: 'Scratchmen Apoo', type: 'technik', role: 'kaempfer', faction: 'supernova', hp: 26, atk: 8, spd: 7, locked: true,
    look: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#e8c040', pants: '#3a3a5a', hat: 'band', hatColor: '#d0302a', acc: 'ohrring' } },
  // Thriller-Bark-Piraten
  { id: 'moria',     name: 'Gecko Moria', type: 'technik', role: 'brecher',  faction: 'thriller', hp: 44, atk: 7, spd: 3, locked: true,
    look: { hair: '#3a2a4a', skin: '#b8b0c8', shirt: '#2a2030', pants: '#4a2a3a', mask: 'bat' } },
  { id: 'absalom',   name: 'Absalom',     type: 'klinge',  role: 'kaempfer', faction: 'thriller', hp: 28, atk: 8, spd: 7, locked: true,
    look: { hair: '#e8c060', skin: '#f2c9a0', shirt: '#e8e0d0', pants: '#4a3a2a', mask: 'leopard' } },
  { id: 'hogback',   name: 'Dr. Hogback', type: 'technik', role: 'helfer',   faction: 'thriller', hp: 30, atk: 5, spd: 5, locked: true,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#2a2a2a', acc: 'brille' } }
];
