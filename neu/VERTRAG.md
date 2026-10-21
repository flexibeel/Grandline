# Vertrag Neue Welt 21t (Schnittstellen zwischen welt / seekampf / landgang / index)

Drei Leute bauen parallel, jeder NUR an seinen Dateien:
- Welt-Team: `neu/welt.html`, `neu/index.html`
- Seekampf-Team: `neu/seekampf.html`
- Landgang-Team: `neu/landgang.html`
Keine git-Befehle (commit/checkout/stash). Kein Anfassen anderer Dateien.

## Optionen für alle (localStorage)
`gl.neu.opt` = JSON `{ruhig:0|1}`. ruhig=1: kein Kamera-Schütteln, kein Vorlauf, sanfteres Folgen. Jede Seite liest es selbst (try/catch). Gesetzt wird es im Welt-Menü („Ruhige Kamera“).

## Gegen Motion Sickness (gilt für alle 3 Szenen)
- Dither/Pixelmuster nie an `gl_FragCoord` binden, wenn es auf Welt-Flächen liegt (Wasser, Schatten, Sand). Stattdessen Welt-Koordinaten (z. B. `floor(vW*Dichte)`), damit das Muster mit der Welt mitfährt.
- Wasser ruhiger: langsamere Animation, weniger Farbstufen, kleinere Kontraste.
- Kamera: Totzone + weicheres Folgen, Schütteln seltener und schwächer (max ~40 % von heute), bei `ruhig` aus.

## Ausbau (Werft im Heimathafen) und Stufe
Welt übergibt an Kämpfe: `up` = "r.k.s" (Rumpf, Kanonen, Segel, je 0–3) und `tier` (0, 1, 2 … = Nummer der Seekarte).

## Nachricht welt → index (`tell({t:'kampf', ...})`)
- Seekampf: `{art:'see', seed, hp, mhp, bhp, name, look, up, tier}`
  - `look`: 'lila' | 'boss' | 'flink' | 'panzer' (flink/panzer neu)
- Bucht (wie bisher): `{art:'land', seed, name}`
- Höhle/Dungeon (neu): `{art:'hoehle', seed, boss, tier, name}`
  - `boss`: 'marlo' | 'toni' | 'perla'
index baut daraus die URL:
- `seekampf.html?embed=1&seed&hp&mhp&bhp&name&look&up&tier`
- `landgang.html?embed=1&seed` (Bucht, unverändert)
- `landgang.html?embed=1&seed&mode=hoehle&boss&tier&name`

## Nachricht Kampf → index → welt (`{t:'ende', ...}`, kommt in welt als `res`)
- see: `{art:'see', win, hp, ...}` (wie bisher, `hp` = Rest-HP absolut, max = mhp)
- land: wie bisher
- hoehle: `{art:'hoehle', win, gold, mats:{pl,ei,se}, chests, sec, hash}`
  - `gold` und `mats` = was in der Höhle eingesammelt wurde. Bei Niederlage liefert landgang trotzdem die Werte, welt behält davon die Hälfte (abgerundet).
  - `mats`: Planken (pl, für Rumpf), Eisen (ei, für Kanonen), Segeltuch (se, für Segel).

## Werte im Seekampf (Logik, deterministisch, gehören zu den Optionen des Replays)
- Rumpf: max HP = 100 + 25·r (welt schickt mhp und hp passend).
- Kanonen: Schaden ×(1 + 0,15·k).
- Segel: Tempo ×(1 + 0,08·s).
- tier: Gegner-HP ×(1 + 0,4·tier), Gegner-Schaden ×(1 + 0,2·tier).

## Werft-Preise (nur welt)
Stufe n (1..3) kostet `120·n` Gold aus der Hafenkasse (`S.bank`) plus `n` Stück des passenden Materials.

## Look
Planken-Look wie die HUD-Leisten in `welt.html` (#hpBox, .btn usw.): dunkles Holz #2b1d14, Holz #8a5a30/#b07a44, Creme #fbf6ea, Gold #f2c94c, Schrift Pixelify Sans 600. Leisten auf breiten Bildschirmen max. ~420 px breit, zentriert. Texte locker und witzig, alle Namen frei erfunden (keine Anime-/One-Piece-Anklänge).
