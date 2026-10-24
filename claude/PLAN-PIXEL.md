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
- **Offen: Felix' Wahl** (siehe Fahrplan „Letzte Übergabe“).
