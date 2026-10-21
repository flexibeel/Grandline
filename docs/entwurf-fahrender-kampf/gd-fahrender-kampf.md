# Fahrender Kampf – Look- und Steuerungs-Vorgabe (Prototyp)

Stand 2026-10-20 · Art-/Game-Design · nur Entwurf, kein Spielcode.
Vorschau-Bilder der Stapel (4 Winkel, 4×): `gd/PLAYER.png`, `gd/ENEMY.png`, `gd/BOSS.png` im selben Scratchpad; Generator `gd/gen.py`.

## 1. Recherche – woran ich mich orientiere

- **Sprite Stacking** ([SpriteStack-Tool](https://gamefromscratch.com/spritestack-3d-pixel-art-tool/), [Sprite-Sandwich-Guide](https://community.flowlab.io/t/sprite-sandwich-a-guide-to-spritestacking/40779), [Pixel Composer: Sprite Stack](https://docs.pixel-composer.com/nodes/3d/2d_operation/filter/sprite_stack.html), [Defold-Forum: Stacking vs 3D](https://forum.defold.com/t/stacking-2d-sprites-vs-3d/67723)): Schichten von unten nach oben zeichnen, jede um den gleichen Winkel gedreht und 1 px nach oben versetzt. Bekannte Fallen: Flimmern beim freien Drehen (Lösung: Winkel vorab rendern und cachen) und „mitdrehendes“ eingebackenes Licht (Lösung: Licht erst nach dem Drehen auftragen, siehe 2.3).
- **Pixel-Wasser** ([Godot Pixel Art Water Shader](https://godotshaders.com/shader/pixel-art-water-shader/), [Foam Edge Water](https://godotshaders.com/shader/foam-edge-water-shader/), [estivalbloom pixel water](https://estivalbloom.itch.io/pixel-water)): wenige flache Töne, kurze helle Wellen-Striche, Schaum als harte Pixel an Kanten, Animation in Stufen statt weich. Ohne Shader nachgebaut mit Kachel-Muster + Schaum-Partikeln.
- **Ein-Daumen-Steuerung** ([Equal Entry zu Vampire Survivors einhändig](https://equalentry.com/?p=174954), [Construct: Touch-Sticks](https://www.construct.net/fr/tutorials/touch-stick-controllers-241), [Simian Survivors Mobile-Devlog](https://subbydoodles.itch.io/simiansurvivors/devlog/782472/mobile-support)): schwebender Stick (setzt sich dort ab, wo der Daumen landet), Totzone, automatisches Feuern, wenige große Knöpfe. Archero-Prinzip: Bewegung und Angriff trennen, damit ein Daumen reicht.
- Hausstil: Palette und Meeresfarben aus `js/ui/art.js` (`P`, `SEA.day`, `boat()`); Schrift `Pixelify Sans` / `var(--px)` aus `css/`.

## 2. Look-Vorgabe

### 2.1 Kamera und Perspektive
- **Draufsicht, Welt steht still, nur das Schiff dreht sich.** Die „Schräge“ entsteht allein durch den Stapel (1 px pro Schicht nach oben). Das ergibt die 3/4-Ansicht ohne Kamera-Mathe. Welt nie mitdrehen, sonst wird einem am Handy schlecht und das Wasser-Raster flimmert.
- Kamera folgt dem Schiff mit **Vorausschau**: Ziel = Schiffsposition + Fahrtrichtung × 28 px, Annäherung `lerp 0.08` pro Frame, Ergebnis **auf ganze interne Pixel runden**. Fährt man nach oben, sitzt das Schiff dadurch bei ca. 60 % der Höhe, vorn ist mehr Meer zu sehen.
- Grundrichtung der Level: **nach oben (Norden)**. Dann sieht man die Segel meist von vorn als breite Tücher (schönster Winkel, siehe `PLAYER.png`, 3. Bild).

### 2.2 Interne Auflösung und Skalierung
```js
const dpr = window.devicePixelRatio || 1;
const devW = Math.round(innerWidth * dpr), devH = Math.round(innerHeight * dpr);
const S = Math.max(2, Math.floor(devW / 180));      // ganzzahliger Faktor
const W = Math.floor(devW / S), H = Math.floor(devH / S); // intern ca. 180–215 × 320–420
canvas.width = W; canvas.height = H;                 // intern zeichnen
canvas.style.width = (W * S / dpr) + 'px';           // ganzzahlig hochskaliert anzeigen
canvas.style.height = (H * S / dpr) + 'px';
canvas.style.imageRendering = 'pixelated'; ctx.imageSmoothingEnabled = false;
```
360 px @3× → S = 6, intern 180 breit. Das Spielerschiff (24 px) ist damit ca. 13 % der Bildbreite: gut lesbar, genug Platz für Gegner. Rest-Pixel am Rand mit Meeresfarbe füllen, nicht strecken.

### 2.3 Sprite-Stapel rendern (wichtig für „sauber“)
1. Beim Start jede Schicht in ein kleines Offscreen-Canvas malen (1 Zeichen = 1 px).
2. **32 Winkel vorab rendern** (alle 11,25°), pro Winkel ein Bild: Schichten i = 0…n-1 gedreht zeichnen, Versatz y − i. Im Spiel nur das passende Cache-Bild ziehen (Physik dreht stufenlos, Bild springt in 32 Stufen; das wirkt bewusst „pixelig“ und flimmert nicht).
3. **Licht nach dem Drehen** (im Cache-Schritt, pro Schicht nach der Rotation): Pixel, deren Nachbar oben links (−1,−1) leer ist, eine Rampenstufe heller; Pixel, deren Nachbar unten rechts (+1,+1) leer ist, eine Stufe dunkler. Dadurch kommt das Licht immer von oben links, egal wohin das Schiff fährt. Stufen-Tabelle:
   ```js
   const LIGHTER = { D:'d', d:'B', B:'b', b:'j', x:'R', R:'r', W:'w', V:'W', Y:'y', T:'t', t:'S', P:'p', p:'q' };
   const DARKER  = { j:'b', b:'B', B:'d', d:'D', r:'R', R:'x', w:'W', W:'V', y:'Y', t:'T', S:'t', q:'p', p:'P' };
   ```
4. **Weißer Treffer-Cache:** zu jedem Winkel eine Silhouette ganz in `#fbf6ea` (für 1 Bild Aufblitzen).
5. **Schaukeln:** ganzes Schiff alle 700 ms 1 px hoch/runter (`steps`, 2 Bilder). Kein Kippen per Rotation.
6. **Untergang (Signatur-Moment):** oberste Schicht zuerst weg, alle 70 ms eine Schicht weniger, Schiff sinkt so sichtbar „ins Wasser“; dazu Blasen und 2–4 Münzen. Geht nur mit Stapeln und sieht nach „boah“ aus.

### 2.4 Palette als Rampen
Abgeleitet aus `js/ui/art.js` (`P`). Neu sind nur **`D`, `j`, `V`, `x`, `T`** (fehlende Rampenstufen mit Hue-Shift: Holz-Schatten Richtung Lila-Braun, Segel-Schatten Richtung Blau-Lila, Rot-Schatten Richtung Weinrot) und die Meeres-Tiefe.
```js
const SHIP_PAL = {
  k: '#2b1d14',                                     // Umriss (nur wo nötig)
  // Holz: hell → dunkel, warm → kühl
  j: '#d9a35c', b: '#b07a44', B: '#8a5a30', d: '#5e3b1d', D: '#3f2628',
  // Segel / Leinen
  w: '#fbf6ea', W: '#d9cfbc', V: '#a9a2b4',
  // Rot (Flagge, Boss-Segel)
  r: '#d8433a', R: '#9a2a22', x: '#5e1f2a',
  // Gold / Licht
  f: '#ffe28a', y: '#f2c94c', Y: '#b8862a', o: '#f08a24',
  // Metall (Kanonen)
  s: '#dfe3ea', S: '#9aa3b2', t: '#5d6575', T: '#363a4e',
  // Lila (Gegner-Segel)
  q: '#c9a8ef', p: '#9b6fd1', P: '#5e3a8a',
};
const SEA_RAMP = {               // aus SEA.day + zwei Stufen
  foam: '#fbf6ea', hi: '#9fd3f0', top: '#3f8fc0', mid: '#357fb0', low: '#2c6e9e', deep: '#21557f',
};
```
Lesbarkeit: Spieler = **weiße Segel + rote Flagge**, Gegner = **lila Segel**, Boss = **rote Segel + Goldreling**. Im Graustufen-Test: Segel hell, Rumpf mittel/dunkel, Meer mittel. Damit das Meer (mittel) sich vom Rumpf trennt, liegt unter jedem Schiff ein Schatten (2.6).

### 2.5 Wasser
- Grundfläche `SEA_RAMP.top`; darauf eine **64×64-Kachel**, welt-fest (scrollt mit der Welt, so spürt man Fahrt): große weiche Flecken `mid`/`low` als Flächen mit 1–2 px Dither-Rand, dazu 10–14 Wellen-Striche `hi` (3–4 px lang, 1 px hoch, wie in `sea()` in art.js).
- **Animation in Stufen:** 4 Kachel-Varianten, Wechsel alle 250 ms, Striche wandern 1 px. Keine weichen Verläufe.
- **Kielwasser:** alle 60 ms zwei Schaum-Pixel links/rechts hinter dem Heck, die schräg auseinander laufen (V-Form). Farbstufen `foam → hi → mid`, dann weg (ca. 1,2 s). Am Bug bei voller Fahrt 1–2 flackernde `foam`-Pixel.
- Ferne Inseln/Felsen als Hindernisse optional, mit `foam`-Ring (1 px, alle 400 ms an/aus).

### 2.6 Schatten
- Unter jedem Schiff ein **gestauchtes Oval in `deep`, Deckkraft 0,45**, um +2/+2 px (nach unten rechts) versetzt, Form = Silhouette der untersten Rumpfschicht im aktuellen Winkel (aus Cache) statt Ellipse, wenn einfach machbar.
- Kanonenkugeln fliegen im Bogen: Kugel um Flughöhe nach oben versetzt zeichnen, darunter 1 px `deep`-Schatten auf dem Wasser. Das verkauft die 3D-Wirkung sofort.

### 2.7 Licht-Ebene
- Zweites Canvas in interner Größe, über das Spiel gelegt. Tageszeit-Tönung mit `globalCompositeOperation = 'multiply'` (Tag: keine, Abend: `#f6d2c0` mit 0,35, Nacht: `#3c4a6a` mit 0,55 – Werte aus art.js `clouds()`).
- Lichtpunkte mit `'screen'`/`'lighter'`: Hecklaterne des Spielers (`f` auf dem Kajütendach), weicher Kreis r = 18 px. **Nur ein Glanzpunkt pro Bild**: im Bosskampf übernimmt der Feuerkorb des Bosses beim Ausholen.
- Die Licht-Ebene darf weich sein (`imageSmoothingEnabled = true` nur dort), die Pixel darunter bleiben scharf.
- Leichte Vignette (Ränder 15 % dunkler) für Fokus auf die Mitte.

### 2.8 Treffer-Gefühl
| Ereignis | Hit-Stop | Blitz | Ruckeln | Sonst |
|---|---|---|---|---|
| eigene Kugel trifft Gegner | – | 1 Bild weiß (Cache) | – | Gegner 1 px zurückgestoßen, Holzsplitter |
| Gegner versenkt | 50 ms | 1 Bild weiß | – | Untergang Schicht für Schicht, Münzen |
| Spieler getroffen | 60 ms | 1 Bild weiß | 1 px, 100 ms | Rumpf-Leiste wackelt, Segment blinkt rot |
| Konter gelungen | 80 ms | ganzer Bildschirm 1 Bild `f` mit 0,4 | 2 px, 150 ms | „Konter!“-Schriftzug, Boss taumelt 1 s |
| Boss versenkt | 120 ms | 2 Bilder weiß | 2 px, 300 ms | lange Untergangs-Sequenz, Goldregen |

Ruckeln immer ganzzahlig und abklingend. Schadenszahlen als Pixelziffern (3×5), steigen in 4 Stufen 8 px hoch, 600 ms; Gold-Ziffern `y` mit `Y`-Schatten.

### 2.9 Partikel
Alles Quadrate auf ganzen Pixeln, Farben nur aus der Palette, max. ca. 150 gleichzeitig.
- **Mündungsfeuer:** 2 Bilder: `f`-Kreuz (5 px) → `o`-Punkt.
- **Pulverrauch:** 2×2 `W`, schrumpft zu 1×1 `V`, treibt 6 px nach hinten (gegen Fahrtrichtung), 500 ms.
- **Fehlschuss:** Wasserspritzer als `+` aus `foam`, 3 Bilder (5 px → 3 px → Ring aus 4 `hi`-Pixeln).
- **Holzsplitter:** 3–5 Pixel `b`/`d`, fliegen 4–8 px, fallen mit Schwerkraft auf die „Wasserebene“ (Schatten-Höhe) und verschwinden mit kleinem `hi`-Spritzer.
- **Münzen:** 2×2 `y` mit 1 px `f`-Glanz, hüpfen 2× und fliegen dann zur Gold-Anzeige oben rechts.

## 3. Sprite-Stapel

Format: pro Schicht ein Array gleich breiter Strings, `.` = leer, Schicht 0 = Kiel, letzte Schicht = Mastspitze/Flagge. Bug zeigt nach **+x**. Drehpunkt = Mitte des Rasters. Palette = `SHIP_PAL` oben.

Kurz zum Aufbau:
- **Spielerschiff „Wellenreiter“** (24×11, 16 Schichten): 3 Rumpfschichten dunkel→hell, Deck mit Plankenfugen, Reling `j`/`b` (oben-links-Seite heller), 3 Kanonen je Seite + Bugspriet, Heckkajüte mit Laterne `f`, zwei bauchige Rahsegel (Bauch nach vorn), rote Flagge. Kanonenplätze liegen auf x = 6, 10, 14 (Reihen 0/10): genau dort setzt der Prototyp seine Kanonen-Bausteine; leere Plätze einfach `t`/`T` weglassen.
- **Gegnerboot „Lilasegler“** (13×7, 10 Schichten): flaches Boot, ein lila Lateinersegel längs zum Rumpf (dadurch andere Silhouette als der Spieler auch von oben), eine Drehbasse vorn.
- **Boss „Krähenbart“** (38×19, 19 Schichten): doppelt so lang wie der Spieler, Goldreling, 5 Kanonen je Seite, hohes Achterkastell mit leuchtenden Heckfenstern und Feuerkorb `o` (Ausholen), drei rote Segel, schwarz-weiße Flagge, goldene Galionsfigur.

Silhouette: alle drei sind als schwarze Fläche in jeder Richtung unterscheidbar (Länge, Segelanordnung quer/längs, Kastell). Vorschau prüfen: `gd/*.png`.

```js
// SHIP_PLAYER: 16 Schichten, 24x11 px, Bug zeigt nach +x, Schicht 0 = Kiel
const SHIP_PLAYER = [
  [ // 0
    '........................',
    '........................',
    '........................',
    '........................',
    '...DDDDDDDDDDD..........',
    '...DDDDDDDDDDDD.........',
    '...DDDDDDDDDDD..........',
    '........................',
    '........................',
    '........................',
    '........................',
  ],
  [ // 1
    '........................',
    '........................',
    '........................',
    '..DDDDDDDDDDDD..........',
    '.DddddddddddddDDD.......',
    '.DdddddddddddddddD......',
    '.DddddddddddddDDD.......',
    '..DDDDDDDDDDDD..........',
    '........................',
    '........................',
    '........................',
  ],
  [ // 2
    '........................',
    '........................',
    '..dddddddddddd..........',
    '.dBBBBBBBBBBBBddd.......',
    'dBBBBBBBBBBBBBBBBdd.....',
    'dBBBBBBBBBBBBBBBBBBdd...',
    'dBBBBBBBBBBBBBBBBdd.....',
    '.dBBBBBBBBBBBBddd.......',
    '..dddddddddddd..........',
    '........................',
    '........................',
  ],
  [ // 3
    '........................',
    '..dddddddddddd..........',
    '.dbbbbbbbbbbbbddd.......',
    'dbbBBbBBBbBBBbbbbdd.....',
    'dbjjbbbbbbbbbbbbbbbdd...',
    'dbbbbbbbbbbbbbbbbbbbbd..',
    'dbbbbbbbbbbbbbbbbbbdd...',
    'dbbBBbBBBbBBBbbbbdd.....',
    '.dbbbbbbbbbbbbddd.......',
    '..dddddddddddd..........',
    '........................',
  ],
  [ // 4
    '......T...T...T.........',
    '..jjjjtjjjtjjjt.........',
    '.j............jjj.......',
    'j................jj.....',
    'j..................jj...',
    'j...B....d.....d.....bBd',
    'b..................bb...',
    'b................bb.....',
    '.b............bbb.......',
    '..bbbbtbbbtbbbt.........',
    '......T...T...T.........',
  ],
  [ // 5
    '........................',
    '........................',
    '.ddddd..................',
    '.dBBBd..................',
    '.dBBBd..................',
    '.dBBBd...d.....d........',
    '.dBBBd..................',
    '.dBBBd..................',
    '.ddddd..................',
    '........................',
    '........................',
  ],
  [ // 6
    '........................',
    '........................',
    '.BBBBB..................',
    '.Bjjjd..................',
    '.Bbbbd..................',
    '.Bbfbd...d.....d........',
    '.Bbbbd..................',
    '.Bbbbd..................',
    '.Bdddd..................',
    '........................',
    '........................',
  ],
  [ // 7
    '........................',
    '........VW..............',
    '........Ww....VW........',
    '........Ww....Ww........',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '........Ww....Ww........',
    '........Ww....VW........',
    '........VW..............',
    '........................',
  ],
  [ // 8
    '........................',
    '........VW..............',
    '........Ww....VW........',
    '........Ww....Ww........',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '........Ww....Ww........',
    '........Ww....VW........',
    '........VW..............',
    '........................',
  ],
  [ // 9
    '........................',
    '........VW..............',
    '........Ww....VW........',
    '........Ww....Ww........',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '........Ww....Ww........',
    '........Ww....VW........',
    '........VW..............',
    '........................',
  ],
  [ // 10
    '........................',
    '........VW..............',
    '........Ww....VW........',
    '........Ww....Ww........',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '........Ww....Ww........',
    '........Ww....VW........',
    '........VW..............',
    '........................',
  ],
  [ // 11
    '........................',
    '........................',
    '........VW..............',
    '........Ww....VW........',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '........Ww....VW........',
    '........VW..............',
    '........................',
    '........................',
  ],
  [ // 12
    '........................',
    '........................',
    '........VW..............',
    '........Ww....VW........',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '.........Ww....Ww.......',
    '........Ww....VW........',
    '........VW..............',
    '........................',
    '........................',
  ],
  [ // 13
    '........................',
    '........................',
    '........................',
    '........VW..............',
    '.........Ww....VW.......',
    '.........Ww....Ww.......',
    '.........Ww....VW.......',
    '........VW..............',
    '........................',
    '........................',
    '........................',
  ],
  [ // 14
    '........................',
    '........................',
    '........................',
    '.........d..............',
    '.........B.....d........',
    '.........B.....B........',
    '.........B.....d........',
    '.........d..............',
    '........................',
    '........................',
    '........................',
  ],
  [ // 15
    '........................',
    '........................',
    '........................',
    '........................',
    '.......r................',
    '......Rrrd..............',
    '......R.................',
    '........................',
    '........................',
    '........................',
    '........................',
  ],
];

// SHIP_ENEMY: 10 Schichten, 13x7 px, Bug zeigt nach +x, Schicht 0 = Kiel
const SHIP_ENEMY = [
  [ // 0
    '.............',
    '.............',
    '.DDDDDDD.....',
    'DDDDDDDDDDD..',
    '.DDDDDDD.....',
    '.............',
    '.............',
  ],
  [ // 1
    '.............',
    '.ddddddd.....',
    'dBBBBBBBddd..',
    'dBBbbBbBBBBd.',
    'dBBBBBBBddd..',
    '.ddddddd.....',
    '.............',
  ],
  [ // 2
    '.........T...',
    '.bbbbbbb.t...',
    'b.......bbb..',
    'B.....d....BB',
    'B.......BBB..',
    '.BBBBBBB.....',
    '.............',
  ],
  [ // 3
    '.............',
    '.............',
    '...qqqqqqp...',
    '...PppdppP...',
    '.............',
    '.............',
    '.............',
  ],
  [ // 4
    '.............',
    '.............',
    '...qqqqqqp...',
    '...PpppppP...',
    '.............',
    '.............',
    '.............',
  ],
  [ // 5
    '.............',
    '.............',
    '....qqqqqp...',
    '....PppppP...',
    '.............',
    '.............',
    '.............',
  ],
  [ // 6
    '.............',
    '.............',
    '.....qqqqp...',
    '.....PpppP...',
    '.............',
    '.............',
    '.............',
  ],
  [ // 7
    '.............',
    '.............',
    '......qqqp...',
    '......PppP...',
    '.............',
    '.............',
    '.............',
  ],
  [ // 8
    '.............',
    '.............',
    '.......qqp...',
    '.......PpP...',
    '.............',
    '.............',
    '.............',
  ],
  [ // 9
    '.............',
    '........r....',
    '.........P...',
    '.........d...',
    '.............',
    '.............',
    '.............',
  ],
];

// SHIP_BOSS: 19 Schichten, 38x19 px, Bug zeigt nach +x, Schicht 0 = Kiel
const SHIP_BOSS = [
  [ // 0
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '...DDDDDDDDDDDDDDDDDDDDDD.............',
    '...DDDDDDDDDDDDDDDDDDDDDDDDD..........',
    '...DDDDDDDDDDDDDDDDDDDDDDDDDDD........',
    '...DDDDDDDDDDDDDDDDDDDDDDDDDDD........',
    '...DDDDDDDDDDDDDDDDDDDDDDDDDDD........',
    '...DDDDDDDDDDDDDDDDDDDDDDDDDDD........',
    '...DDDDDDDDDDDDDDDDDDDDDDDDDDD........',
    '...DDDDDDDDDDDDDDDDDDDDDDDDD..........',
    '...DDDDDDDDDDDDDDDDDDDDDD.............',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 1
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '...xxxxxxxxxxxxxxxxxxxxxx.............',
    '..xDDDDDDDDDDDDDDDDDDDDDDxxx..........',
    '..xDDDDDDDDDDDDDDDDDDDDDDDDDxx........',
    '..xDDDDDDDDDDDDDDDDDDDDDDDDDDDxx......',
    '..xDDDDDDDDDDDDDDDDDDDDDDDDDDDDx......',
    '..xDDDDDDDDDDDDDDDDDDDDDDDDDDDDx......',
    '..xDDDDDDDDDDDDDDDDDDDDDDDDDDDDx......',
    '..xDDDDDDDDDDDDDDDDDDDDDDDDDDDxx......',
    '..xDDDDDDDDDDDDDDDDDDDDDDDDDxx........',
    '..xDDDDDDDDDDDDDDDDDDDDDDxxx..........',
    '...xxxxxxxxxxxxxxxxxxxxxx.............',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 2
    '......................................',
    '......................................',
    '......................................',
    '...DDDDDDDDDDDDDDDDDDDDDD.............',
    '..DddddddddddddddddddddddDDD..........',
    '.DddddddddddddddddddddddddddDD........',
    '.DddddddddddddddddddddddddddddDD......',
    '.DddddddddddddddddddddddddddddddD.....',
    '.DdddddddddddddddddddddddddddddddD....',
    '.DdddddddddddddddddddddddddddddddD....',
    '.DdddddddddddddddddddddddddddddddD....',
    '.DddddddddddddddddddddddddddddddD.....',
    '.DddddddddddddddddddddddddddddDD......',
    '.DddddddddddddddddddddddddddDD........',
    '..DddddddddddddddddddddddDDD..........',
    '...DDDDDDDDDDDDDDDDDDDDDD.............',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 3
    '......................................',
    '......................................',
    '...DDDDDDDDDDDDDDDDDDDDDD.............',
    '..DddddddddddddddddddddddDDD..........',
    '.DddddddddddddddddddddddddddDD........',
    'DdddddddddddddddddddddddddddddDD......',
    'DdddddddddddddddddddddddddddddddD.....',
    'DddddddddddddddddddddddddddddddddD....',
    'DdddddddddddddddddddddddddddddddddD...',
    'DddddddddddddddddddddddddddddddddddD..',
    'DdddddddddddddddddddddddddddddddddD...',
    'DddddddddddddddddddddddddddddddddD....',
    'DdddddddddddddddddddddddddddddddD.....',
    'DdddddddddddddddddddddddddddddDD......',
    '.DddddddddddddddddddddddddddDD........',
    '..DddddddddddddddddddddddDDD..........',
    '...DDDDDDDDDDDDDDDDDDDDDD.............',
    '......................................',
    '......................................',
  ],
  [ // 4
    '......................................',
    '...dddddddddddddddddddddd.............',
    '..dBBBBBBBBBBBBBBBBBBBBBBddd..........',
    '.dBBBBBBBBBBBBBBBBBBBBBBBBBBdd........',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBdd......',
    'dBBBdddBddddBddddBddddBdddBBBBBBd.....',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBd....',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBd...',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBd..',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBd..',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBd..',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBd...',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBd....',
    'dBBBdddBddddBddddBddddBdddBBBBBBd.....',
    'dBBBBBBBBBBBBBBBBBBBBBBBBBBBBBdd......',
    '.dBBBBBBBBBBBBBBBBBBBBBBBBBBdd........',
    '..dBBBBBBBBBBBBBBBBBBBBBBddd..........',
    '...dddddddddddddddddddddd.............',
    '......................................',
  ],
  [ // 5
    '.......T...T...T...T...T..............',
    '...yyyytyyytyyytyyytyyyty.............',
    '..y......................yyy..........',
    '.y..........................yy........',
    'y.............................yy......',
    'y........................y......y.....',
    'y................................y....',
    'y.................................y...',
    'y..................................y..',
    'Y.........D.......D.......D........YyY',
    'Y..................................Y..',
    'Y.................................Y...',
    'Y................................Y....',
    'Y........................Y......Y.....',
    'Y.............................YY......',
    '.Y..........................YY........',
    '..Y......................YYY..........',
    '...YYYYtYYYtYYYtYYYtYYYtY.............',
    '.......T...T...T...T...T..............',
  ],
  [ // 6
    '......................................',
    '......................................',
    '......................................',
    '.ddddddd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..D.......D.......D...........',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.ddddddd..............................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 7
    '......................................',
    '......................................',
    '......................................',
    '.ddddddd..............................',
    '.dBBBBBd..............................',
    '.fBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..D.......D.......D...........',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.dBBBBBd..............................',
    '.fBBBBBd..............................',
    '.dBBBBBd..............................',
    '.ddddddd..............................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 8
    '......................................',
    '......................................',
    '......................................',
    '.yyyyyyy..............................',
    '.ybbbbbY..............................',
    '.yBBBBBY..............................',
    '.yBBBBBY..............................',
    '.yBBBBBY..............................',
    '.yBBBBBY..............................',
    '.yBBoBBY..D.......D.......D...........',
    '.yBBBBBY..............................',
    '.yBBBBBY..............................',
    '.yBBBBBY..............................',
    '.yBBBBBY..............................',
    '.yBBBBBY..............................',
    '.yYYYYYY..............................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 9
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
  ],
  [ // 10
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
  ],
  [ // 11
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
  ],
  [ // 12
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
  ],
  [ // 13
    '......................................',
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr......Rr..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 14
    '......................................',
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr......Rr..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 15
    '......................................',
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr......Rr..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......Rr..........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 16
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '..........xR......xR..................',
    '..........Rr......Rr..................',
    '..........Rr......Rr......xR..........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '...........Rr......Rr......Rr.........',
    '..........Rr......Rr......xR..........',
    '..........Rr......Rr..................',
    '..........xR......xR..................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 17
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '...........d.......d..................',
    '...........d.......d..................',
    '...........d.......d.......d..........',
    '...........d.......d.......d..........',
    '...........d.......d.......d..........',
    '...........d.......d.......d..........',
    '...........d.......d.......d..........',
    '...........d.......d.......d..........',
    '...........d.......d.......d..........',
    '...........d.......d..................',
    '...........d.......d..................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
  ],
  [ // 18
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '................x.....................',
    '...............TxxD...................',
    '...............Ts.....................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
  ],
];

```

Optional für Varianten ohne neue Raster: Gegner-Elite = `p→r`, `q→f`; Nacht-Gegner = Segel `P/p/q` → `T/t/S`.

## 4. Steuerung und HUD (Hochformat, ab 360 px)

### 4.1 Lenken (ein Daumen)
- **Schwebendes Steuerrad:** Daumen irgendwo in die **untere 60 %** setzen (außer auf Knöpfe). Dort erscheint ein kleiner Ring (Ø 80 css px, Holzring `b`/`d`, 50 % Deckkraft). Ziehen gibt die **Wunsch-Richtung** an; Totzone 10 css px.
- Das Schiff **dreht mit Trägheit** zur Wunsch-Richtung (max. ca. 140°/s) und fährt **immer weiter** mit Reisegeschwindigkeit; in scharfen Kurven 20 % langsamer. **Loslassen = Kurs halten**, nicht anhalten. So ist der Daumen frei für die Knöpfe.
- Ringfeedback: kleiner Pfeil am Ringrand zeigt Wunsch-Richtung; auf dem Wasser vor dem Bug 3 blasse `hi`-Punkte als Kurslinie (nur beim Ziehen).
- Kanonen feuern automatisch auf das nächste Ziel in Reichweite ihrer Seite (Breitseite links/rechts, Bugkanone vorn). Das macht Lenken taktisch: Gegner seitlich nehmen.

### 4.2 Knöpfe (unten rechts, im Daumenbogen)
- **Fähigkeit 1 „Breitseite“** und **Fähigkeit 2 „Volle Fahrt“**: runde Knöpfe **64 css px**, 12 px Abstand, unten rechts, 16 px vom Rand + `env(safe-area-inset-bottom)`. Anordnung: F1 unten-rechts, F2 schräg links darüber (Daumenbogen).
- Abklingzeit als **Tortenstück in 8 Stufen** (kein weicher Verlauf), Icon während der Abklingzeit entsättigt; bei „bereit“ 1× kurzes Aufblitzen + 1 px Hüpfer.
- Linkshänder-Option: Knöpfe spiegeln (Einstellung, später).

### 4.3 Konter-Schild
- Erscheint **nur, wenn der Boss ausholt**: großer runder Knopf **88 css px**, **unten Mitte** (über dem Daumenruheplatz, beide Hände erreichen ihn), springt mit kleinem Squash-Pop herein (3 Bilder).
- Um das Schild schließt sich ein **goldener Ring** (`y`) im Takt des Ausholens. Wenn er das Schild berührt, beginnt das **Konter-Fenster (300 ms)**: Schild blitzt 1 Bild `f`, Ring wird weiß.
- Tipp im Fenster → Konter. Zu früh getippt → Schild 1 s gesperrt (grau), damit Dauertippen nichts bringt. Tipp aufs Schild unterbricht nie das Lenken (eigene Fläche).
- Komfort-Option „Leicht“: Fenster 450 ms.

### 4.4 Wie der Boss ausholt (1,2 s, gut lesbar)
1. **0,0 s:** Boss hört auf zu drehen, Pixel-Sprechblase „!“ über dem Kastell (weiß mit `k`-Rand), dumpfer Trommel-Ton.
2. **0,0–0,9 s:** Kanonenreihe der zielenden Seite **glüht nacheinander auf** (`t → o → f`, eine Kanone pro 150 ms), Feuerkorb `o` leuchtet als Glanzpunkt der Licht-Ebene. Boss **lehnt sich weg**: obere Schichten 1 px zur abgewandten Seite versetzt (Ausholen).
3. **Gleichzeitig:** Gefahrenzone auf dem Wasser als **gestreiftes Band** (Dither aus `o` mit 40 %, Rand 1 px `R`), füllt sich von außen nach innen.
4. **0,9–1,2 s:** Konter-Fenster (Ring berührt Schild). Danach Breitseite: Mündungsfeuer, 5 Kugeln.
Gelungener Konter: Kugeln prallen zurück (Smear-Bild, 1 Frame lang gestreckt), Boss taumelt 1 s und nimmt Schaden.

### 4.5 HUD oben (cozy, schlank)
- Als **DOM-Ebene über dem Canvas** (scharfe Schrift, `Pixelify Sans`, `var(--px)`), nicht ins Pixel-Canvas malen. Oben `env(safe-area-inset-top)` + 8 px.
- **Links: Rumpf-Leiste** als Holzplanke: kleines Schiffs-Icon + 10 Segmente (je 10 %), Füllung `b/j`, leer `d`, Rahmen `k`. Treffer: Segment blinkt `r` und fällt ab. Unter 30 % pulsiert die Planke langsam.
- **Rechts: Gold** mit Münz-Icon und Zahl (zählt in Schritten hoch, wenn Münzen ankommen). Daneben **Pause 44×44 css px** (Steuerrad-Icon).
- **Mitte, schmal: Fahrtstrecke** als gepunktete Seekarten-Linie mit Mini-Schiff und Totenkopf am Ende (Boss). Nur 6 px hoch.
- **Bosskampf:** unter dem HUD ein Namensband „Kapitän Krähenbart“ (Pirata One) mit roter Leiste im Goldrahmen; die Strecken-Linie verschwindet solange.
- Sonst nichts: keine Statistiken, keine Menüleisten, keine Texte im Kampf außer Schadenszahlen und „Konter!“. Mindestgröße Schrift 12 css px, Tippflächen ≥ 44 px.

### 4.6 Bildaufteilung 360 × 740 (Beispiel)
```
┌──────────────────────────────┐  0
│ [Rumpf ▮▮▮▮▮▮▯▯]  ··⛵··☠  ◎123 ‖ │  ~40 px HUD
│                              │
│        Gegner kommen von     │
│        oben / Seiten ins Bild │
│                              │
│            ⛵  (≈60 %)        │
│                              │
│   Lenk-Zone (untere 60 %)    │
│                  (F2)         │
│        (SCHILD)       (F1)    │
└──────────────────────────────┘
```

## 5. Abnahme-Check für den Prototyp
1. Schiff in 32 Winkeln: kein Flimmern beim Drehen, Licht immer oben links?
2. Graustufen-Screenshot: Spieler, Gegner, Wasser klar getrennt?
3. Auf 360 px echt: Gegner-Segel (lila) sofort erkennbar, Knöpfe mit dem Daumen ohne Umgreifen?
4. Ausholen des Bosses ohne Ton verständlich?
