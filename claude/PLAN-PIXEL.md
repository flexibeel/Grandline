# Plan: Figuren mit mehr Pixeln und mehr Leben

Stand 23.10.2026. **Nur Plan, nichts gebaut.** Idee von Jan (18. Chat): „Den Figuren ein paar mehr Pixel geben, um ihnen mehr Leben zu geben.“ Vergleichs-Board „Pixelgröße der Figuren“ (Artefakt in Jans Account: claude.ai/artifact/Xz6jUhTonBtBqea21ruKL4) mit dem Leuchtturmwärter in 12 × 14, 16 × 20 und 24 × 30, groß und in Kampfgröße.

## 1. Heute (geprüft im Code)
- Alle 65 Figuren werden in `js/ui/sprites.js` aus ihrem `look` erzeugt: Grundform `BASE` **12 × 14 Pixel**, Farben (Haare, Haut, Hemd, Hose, Hut, Bart, Nase), Hutformen und Masken (`HATS`/Masken: straw, band, cap, afro, hood, tophat, ears, tricorn, croc, shark, leopard, giraffe, bat, cloud, bolt, bear, octo), kleine Zusätze `acc` (brille, blume, narbe) und die Form-Accessoires `FORM_ACC` (30 Stück, höchstens 4 je Figur, `safeLook`).
- Keine Figur ist einzeln gezeichnet. 9 Gegner haben eigene Kunst (`art`), außerdem kann jede Figur ein Bild (`image`) bekommen.
- Im Kampf steht eine Figur 64 × 75 Bildpunkte groß im Feld (`fieldUnit`, `arena.js`), also gut 5 Bildpunkte pro Pixel. Bei 24 × 30 wären es gut 2,5, auf Handys mit hoher Auflösung trotzdem scharf (siehe Board, unterer Streifen).

## 2. Entscheidungen (23.10., Jan per Klick)
1. **Raster 24 × 30** (statt 12 × 14).
2. **Leben:** Blinzeln und Atmen, **Angriffsposen** und **Gefühle im Gesicht** (nicht gewählt: kleine Eigenheiten im Stehen, kann später kommen).
3. **Dunkle Umrisslinie** um jede Figur, wie in der Skizze rechts.
4. **Zeitpunkt: zusammen mit Weltbau-Welle C**, also wenn die 65 Figuren ohnehin neue Looks bekommen. Die neuen Looks entstehen gleich im neuen Raster.

## 3. Wie das ohne 65 Einzelzeichnungen geht
Das System bleibt: Look-Werte plus Teile. Nur die Teile werden neu und größer.
- **Grundkörper 24 × 30** mit Umriss und je einer Schattenfarbe pro Fläche (Haut, Hemd, Hose, automatisch etwas dunkler berechnet).
- **Gesicht als eigene Ebene:** Augen (mit Weiß), Brauen, Mund. Darüber laufen **Blinzeln** (Augen kurz zu) und die **Gefühle**: normal, Freude, Wut, müde, erschrocken. Die Gefühle gelten für alle Figuren, weil das Gesicht ein Teil des Grundkörpers ist. Passt zu Säule 4D „Crew mit Gefühlen“ (`PLAN-FOLGEN.md`): müde Figur sieht müde aus.
- **Atmen:** der Oberkörper hebt sich um einen halben Pixel, ganz ohne neue Zeichnung.
- **Angriffsposen:** 2 bis 3 Bilder pro **Körperhaltung**, nicht pro Figur (Ausholen, Schlag, Getroffen), je für die Kampfstile (z. B. Klinge, Faust, Fernkampf). Waffen kommen als Teil dazu. Hängt zusammen mit Gesamtplan „4 · Waffen & Animationen“.
- **Neu zeichnen:** etwa 17 Hutformen und Masken, 3 kleine Zusätze, 30 Form-Accessoires, dazu Waffen. Ungefähr 55 Teile plus Grundkörper, Gesichter und Posen. Das ist **Felix' Kunst**, gebaut auf Opus.
- **Übergang:** Solange ein Teil im neuen Raster fehlt, zeichnet die Engine die Figur noch im alten 12 × 14. So kann man Teil für Teil umstellen.

## 4. Fallen
- **Erkennbarkeit:** Je feiner das Raster, desto leichter erinnert eine Figur an eine bekannte. Jede neue Figur gegen die Weltbau-Regel prüfen (keine Silhouetten oder Farbkombis bekannter Figuren). Beim ersten Vergleichs-Entwurf ist genau das passiert, er wurde verworfen und mit einer eigenen Figur neu gezeichnet.
- **Leistung:** Jede Figur ist heute ein SVG aus vielen kleinen Rechtecken (bei 24 × 30 bis zu 4-mal so viele). Im Kampf mit 12 Figuren prüfen. Falls nötig, Pixel einer Farbe zu Zeilen zusammenfassen oder als Bild zwischenspeichern.
- **Bewegung reduzieren:** Blinzeln, Atmen und Posen respektieren „weniger Bewegung“ am Gerät.
- **Gewählte Looks der Bekannten** (`PLAN-WELT-MERKT.md` Abschnitt 7) sind im alten Raster. Sie werden mit Welle C ins neue Raster übertragen.

## 5. Reihenfolge (wenn Welle C dran ist)
1. Grundkörper, Gesicht mit Gefühlen, Blinzeln, Atmen, Umriss: **Probe mit 3 Figuren** als Board, Felix entscheidet.
2. Hüte, Masken, Zusätze im neuen Raster.
3. Form-Accessoires.
4. Angriffsposen und Waffen pro Kampfstil.
5. Alte 12 × 14-Teile abbauen.

## 6. C3 Probe (24.10., 31. Chat, Opus)
Board **„Pixel-Probe 24 × 30“** (Design-Artefakt in Felix' Account: claude.ai/artifact/WmFDNV3btfZC5Xb7H8VcNQ), Figuren Rafe, Soren, Nela mit den heutigen Look-Werten. Drei Tafeln: alt 12 × 14 gegen neu (atmet und blinzelt), 5 Gefühle, Kampfgröße 64 × 75.
- Code: `tools/pixel-probe/px24.js` (nicht im Spiel eingebunden, läuft im Browser als `PX24` und in Node). Linke Körperhälfte wird gespiegelt, Gesicht als Ebene nur auf Haut, Licht oben links, Schatten je Fläche automatisch (Rand unten/rechts 20–32 % dunkler, zweite Reihe 9 %), Schlagschatten unter Haar/Hut/Kinn, Umriss in der dunkleren Nachbarfarbe wie `pixelsOf`.
- Gesicht: Augen 2 × 3 (Lichtpunkt, Pupille, Iris), Brauen, Mund. Gefühle: normal, froh (Lächeln + Wangen), sauer (schräge Brauen, Mund runter), müde (Lider halb zu, Schweißtropfen), erschrocken (große weiße Augen, offener Mund). Blinzeln: Strich unten, Atmen: Oberkörper bis Gürtel 1 Pixel tiefer.
- Leistung: Pixel einer Farbe werden zeilenweise zusammengefasst, eine Figur hat so 260–340 Rechtecke (heute ca. 150 je Bild, mit Angriffsbild doppelt). Also kein Problem im Kampf.
- Nicht in der Probe: Angriffsposen (Schritt 4), weitere Hüte und Masken (Schritt 2). Hut, Stirnband und lange Haare sind nur für diese drei neu gezeichnet. Die Looks selbst (Strohhut usw.) sind noch die alten und werden in C4 eigenständig.
- **Entschieden (Felix per Klick, 24.10.):** Grundkörper so, alle 5 Gefühle so, Umriss und Schatten so, Augen 2 × 3 so. `px24.js` ist damit die Vorlage für den Umbau von `sprites.js` in C4.

## 7. C4 Looks pro Fraktion (24.10., 32. Chat, Opus)
**Entschieden (Felix per Klick, 24.10.):**
1. **Leitfarbe als Abzeichen:** Jede Figur behält eigene Farben, dazu ein festes Fraktions-Detail in Leitfarbe (Schärpe, Kragen oder Abzeichen, je Fraktion eins). Leitfarben siehe `WELTBAU-C.md` Abschnitt 1.
2. **Reihenfolge:** zuerst **C4a Malwerk** (`px24.js` als Zeichner in `sprites.js`, gleiche Schnittstelle `render`/`renderShaded`/Gefühle, Rückfall auf 12 × 14 solange ein Teil fehlt, Angriffsbild Vorbeugen, alle heutigen Hüte, Masken und Zusätze neu), dann **Kronwacht** als erstes Fraktions-Board. Danach je Fraktion ein Board, Felix klickt ab, dann in `crew.js`. Sturmmöwen und ihre 30 Form-Teile zuletzt.
3. **Nah am Original:** Für jede kritische Figur zwei eigene Varianten aufs Board, Felix wählt per Klick (z. B. Lorn, Asch, Rosé, Simon). Die vier rosa Schöpfe (Hilde, Kian, Lotta, Huschel) über Frisur und Hut unterscheiden.

### 7a. C4a Malwerk (32. Chat, gebaut)
- `js/ui/sprites.js`: Block `P24` (aus `px24.js`), `render`/`renderShaded` nehmen ihn, wenn `P24.ok(look)`; sonst das alte 12 × 14 (heute nur bei Form-Teilen `facc`, also Story-Formen der Sturmmöwen). viewBox `-2 -1 28 32` (gleiches Seitenverhältnis wie alt). Blinzeln nur im Kampffeld (CSS-Block „C4a“ am Ende von `style.css`), Atmen und Angriffsbild wie bisher über `sp-u`/`sp-a`.
- Neu gezeichnet: alle 8 Hüte, 9 Masken, 6 Zusätze, Bart, Nase, lange Haare. Neu für C4: Hüte `zweispitz`, `grosskappe`, `zipfel`, `ohrenschuetzer`; Frisuren `look.hairStyle` (glatze, buerste, dutt, zopf, bob, stachel); Markenzeichen `look.x` (bis 4: mantel, schal, keksdose, handschellen, kette, schwertruecken, dreigriffe, pflaster, dampf, kessel, eiszapfen, schnauzer); Farben `look.coat`, `look.scarf`; Fraktions-Abzeichen `BADGE[faction]` (für die Kronwacht zwei Vorschläge `marine_schaerpe`/`marine_abzeichen`, aktiv erst nach Felix' Wahl).
- Geprüft: alle 65 Figuren und 14 Gegner zeichnen im neuen Raster, Headless 390 px (unbündelte Testkopie): Story-Szene, Kampf, Crew-Liste, 0 `pageerror`.
- Board **„Kronwacht 24 × 30“** (Design-Artefakt in Felix' Account: claude.ai/artifact/PfzNGzQXANpP2WVH2JiYJb): je Figur A/B mit froh/sauer/müde, Abzeichen-Vergleich, Kampfgröße. Varianten-Looks in `tools/pixel-probe/c4-kronwacht.js`.

### 7b. Kronwacht entschieden (25.10., 33. Chat, Opus)
Felix per Klick, alles wie empfohlen: **Schärpe** als Abzeichen (`BADGE.marine`), Grimm A (Glatze, Mantel), Hilde B (weinroter Zopf), Tessa B (Petrol-Bob, drei Griffe), Kian B (türkise Stacheln), Russ B (Kessel), Reif A (Zipfelmütze, Schal). Eingetragen in `crew.js`, geprüft per Node (alle sechs im 24 × 30-Raster mit Schärpe). Nächstes Fraktions-Board: Schattenkorps (Nachtviolett).

### 7c. Schattenkorps entschieden (25.10., 33. Chat, Opus)
Board **„Schattenkorps 24 × 30“** (Artefakt in Felix' Account: claude.ai/artifact/16AdS18sgbjqUJz592RWen), Varianten in `tools/pixel-probe/c4-schattenkorps.js`. Neu im Malwerk: Hüte `melone`, `ohrenkappe`; Frisuren `locken`, `tolle`; Markenzeichen `mappe`, `schaum`, `schminke`, `faecher`, `schluessel`, `klauen`, `stiefel`, `reissverschluss`, `mundpflaster`; Abzeichen `cp9_krawatte`/`cp9_nadel`.
Felix per Klick, alles wie empfohlen: **Krawatte** (`BADGE.cp9`), Kalina B (Kupfer-Bob, Seifenblasen), Kordo B (violette Tolle, Fächer), Riegel A (Melone, Schlüssel), Wolfram B (graue Stacheln, Klauen), Krall B (violette Öhrchen-Kappe, Mantel), Stelz B (Zopf, Schwert, Stiefel), Plapper B (Glatze, Pflasterkreuz). Eingetragen in `crew.js`, alle 65 Figuren per Node gezeichnet. Nächstes Board: Barock-Bund (9, mit Gegenwind).

### 7d. Barock-Bund entschieden (25.10., 33. Chat, Opus)
Board **„Barock-Bund 24 × 30“** (Artefakt in Felix' Account: claude.ai/artifact/UUsyrynUhm6V8T27j79omE), Varianten in `tools/pixel-probe/c4-barock.js`. Neu im Malwerk: Frisur `zoepfe`; Markenzeichen `boa`, `spitzenschuhe`, `russ`, `schleier`, `klingen`, `pelz`, `sanduhr`, `narbequer`, `schutzbrille`, `federkragen`, `lippen`, `notizbuch`, `tattoo`, `windwirbel`; Abzeichen Halsschleife/Gürtel, je für `baroque` (Gold) und `revolution` (Salbei).
Felix per Klick, alles wie empfohlen: **Halsschleife** (`BADGE.baroque`/`BADGE.revolution`), Mimo B, Herr Freitag B, Vina A, Herr Sonntag B, Sirokk B, Jorin B, Lila B, Tilda B, Rian B. Eingetragen in `crew.js`. Geprüft: alle 65 per Node, Testkopie gebündelt und im Headless-Browser 390 px `?welt=neutral` geladen, 0 `pageerror`. Nächstes Board: Flossenvolk (5, Türkis).

### 7e. Flossenvolk entschieden (25.10., 33. Chat, Opus)
Board **„Flossenvolk 24 × 30“** (Artefakt in Felix' Account: claude.ai/artifact/5sM8TSkbXQnd9Tqf8TtpQz), Varianten in `tools/pixel-probe/c4-flossen.js`, Board-Inhalt ab jetzt über `tools/pixel-probe/c4-board.js`. Neu im Malwerk: `saegenase`, `zahnkette`, `haizaehne`, `aermel`, `tinte`, `schwarzgurt`, `handschuhe`, `flosse`, `schnorchel`, `flasche`; Abzeichen `fischmensch_muschel`/`fischmensch_armband`.
Felix per Klick, alles wie empfohlen: **Muschel-Anhänger** (`BADGE.fischmensch`), alle fünf Variante B (Brack ohne Sägenase mit Haizähnen, Okko ohne Maske, Torn im weißen Kampfanzug, Prill mit Taucherbrille, Grimmflosse ohne Maske). Eingetragen in `crew.js`. Nächstes Board: Zirkus der Narren (10: 4 Pomp-Truppe, 6 Wildfänge, Magenta).

### 7f. Zirkus der Narren entschieden (25.10., 34. Chat, Opus)
Board **„Zirkus der Narren 24 × 30“** (Artefakt in Felix' Account: claude.ai/artifact/YBnh3JsxieVws7cDtu54eM), Varianten in `tools/pixel-probe/c4-zirkus.js` (schreibt die ganze Board-Seite, Stil in `c4-head.css`). Neu im Malwerk: Hüte `narrenkappe`, `sonnenhut`; Frisur `kranz`; Markenzeichen `baelle`, `konfetti`, `keule`, `messer`, `fackel`, `peitsche`, `metallarm`, `magnet`, `sicheln`, `fleischkeule`, `schwanz`, `karten`, `puppe`, `mundharmonika`, `trommel`, `domino`; Abzeichen `buggy_kragen`/`buggy_raute` (Magenta mit Creme) und `supernova_kragen`/`supernova_raute` (Magenta mit Gelb).
Felix per Klick, alles wie empfohlen: **Rüschenkragen** (`BADGE.buggy`/`BADGE.supernova`), alle zehn Variante B: Pomp (Narrenkappe, Jonglierbälle, rote Nase), Hanne (Locken, Sonnenhut, Keule, Seifenblasen), Jockel (Tolle, Messer, Fackel), Poldi (Zirkusdirektor: Zylinder, roter Mantel, Schnauzer, Peitsche), Magnus (Bürste, Fliegerbrille, Metallarm, Magnet), Simon (Kapuze, Augenmaske, Sicheln), Lotta (apricot Zöpfe, grüne Öhrchen-Kappe, Fleischkeule), Gregor (Bart, Schuppenmantel, Dino-Schwanz, Zahnkette), Olin (schwarzer Bob, Petrol-Mantel, Karten, Strohpuppe), Rondo (Zöpfe, Kopfhörer in Magenta, Trommel). Eingetragen in `crew.js`, alle 65 per Node gezeichnet. Nächstes Board: Die zwei Flotten (8: 4 Gischt-Flotte Elfenbein, 4 Rotmantel-Flotte Mohnrot).

### 7g. Die zwei Flotten entschieden (25.10., 35. Chat, Opus)
Board **„Die zwei Flotten 24 × 30“** (Artefakt in Felix' Account: claude.ai/artifact/3HcgoLCiVuy8oiEVrTbXwp), Varianten in `tools/pixel-probe/c4-flotten.js`. Beide Varianten bewusst weg von den Vorbildern (kein Hut mit Gesicht, kein Mondschnauzer, kein roter Schopf). Neu im Malwerk: Hut `kochmuetze`; Markenzeichen `glut`, `blauflamme`, `feder`, `blueten`, `gewehr`, `latz`, `pfanne`, `armbrust`, `zielglas`, `zielrohr`, `anker`; Abzeichen `weissbart_tuch`/`weissbart_wimpel` (Elfenbein mit Marineblau) und `rothaar_tuch`/`rothaar_wimpel` (Mohnrot mit Creme).
Felix per Klick, alles wie empfohlen: **Halstuch** (`BADGE.weissbart`/`BADGE.rothaar`), alle acht Variante B: Asch (aschgraue Bürste, Lederhemd, Ruß, Handschuhe, Glut), Falk (dunkler Zopf, Feder, Mantel, blaue Flammen), Gischt (grauer Haarkranz, Vollbart, Kapitänsmütze, Pfeife, Anker), Veit (Bob, Blume, zwei Klingen, Blüten), Fenn ★ (silberne Tolle, Mohnrot-Mantel, Schwert, Ohrring), Lenz (schwarze Locken, Brille, Notizbuch, Gewehr), Brotz (Kochmütze, roter Bart, Latzhose, Pfanne), Piet (Bob, Zielglas, Armbrust). Eingetragen in `crew.js`, alle 65 per Node gezeichnet. Nächstes Board: Freibeuter der Krone (10: 6 Freibeuter Tannengrün, 4 Schauerbarke mit Nebelgrau).

### 7h. Freibeuter der Krone entschieden (25.10., 36. Chat, Opus)
Board **„Freibeuter der Krone 24 × 30“** (Artefakt in Felix' Account: claude.ai/artifact/JKqFmgsmoDnb25KFCAZdzc), Varianten in `tools/pixel-probe/c4-freibeuter.js`. B-Varianten bewusst weg von den Vorbildern (keine Fleckenmütze, kein Federhut, kein Federmantel mit Sonnenbrille, keine Bären-, Fledermaus- oder Leopardenmaske). Neu im Malwerk: Hüte `fellmuetze`, `federhut`; Markenzeichen `steuerrad`, `grossschwert`, `schlange`, `herzen`, `bogen`, `sonnenbrille`, `faden`, `pfoten`, `schirm`, `teddy`, `geister`, `fledermaus`, `stehkragen`, `nadel` (Schlange und Schirm in `look.scarf`); Abzeichen `samurai_siegel`/`samurai_klappe` (Tannengrün mit Gold) und `thriller_siegel`/`thriller_klappe` (Tannengrün mit Nebelgrau).
Felix per Klick, alles wie empfohlen: **Kaperbrief-Siegel** (`BADGE.samurai`/`BADGE.thriller`), alle zehn Variante B: Jonah (Petrol-Haut, Zopf, Bart, Schwarzgurt, Flosse, Steuerrad), Lorn (dunkle Tolle, weißes Hemd, Petrol-Mantel, Handschuhe, Schwert, Ohrring), Silas (Nachtblau-Kapuze, silberner Zopf, Narbe, Schal, Großschwert), Mira (Dutt, Blume, Herzen, Bogen), Rosé ★ (Zylinder, lila-graues Haar, Rosé-Mantel, Blume, Fäden), Tatz ★ (Öhrchen-Kappe, Brille, Schal, Pfotenhandschuhe), Huschel ★ (lavendel Bob, Geister, schwarzer Schirm), Dämmerling ★ (violette Tolle, Stehkragen, Mantel, Fledermäuse), Ulf ★ (blonde Locken, Narbe, Schal, Handschuhe), Flick ★ (OP-Haube, Schutzbrille, OP-Grün, Nadel). Eingetragen in `crew.js`, alle 65 per Node gezeichnet, alle zehn mit Siegel. Nächstes: Einzelgänger Zirrus (1), dann Sturmmöwen mit ihren Form-Teilen zuletzt.

### 7i. Einzelgänger Zirrus entschieden (25.10., 37. Chat, Opus)
Board **„Zirrus 24 × 30“** (Artefakt in Felix' Account: claude.ai/artifact/H7uWFu7aciNzZ3SS7fYs8Q), drei Varianten in `tools/pixel-probe/c4-zirrus.js` (alle ohne Trommelring, Stirnband, lange Ohrläppchen; kein Abzeichen, da ohne Bande). Neu im Malwerk: Markenzeichen `blitzstab`, `wolke`, `wolkenkragen`, `blitze`.
Felix per Klick, wie empfohlen: **B Schönwetterwolke** (himmelblauer Dutt, weißes Hemd, blauer Mantel, Wolkenkragen, kleine Blitze). Eingetragen in `crew.js`, alle 65 per Node gezeichnet. Nächstes: Sturmmöwen mit ihren Form-Teilen.
