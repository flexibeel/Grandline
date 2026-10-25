# 9c Fahrtstart lebendiger: Skizze (40. Chat, Sonnet, 25.10.)

Felix (25.10.): Team aufstellen und Ablegen fühlt sich nach „klick, klick, klick“ an, unauthentisch, undynamisch.
Felix per Klick (25.10.): **alle vier Ideen** gefallen. Das hier ist nur die Skizze, **noch nichts gebaut**, Okay zur Reihenfolge fehlt.

## Heutiger Ablauf (aus dem Code)
1. Hafen, Dock, „Ablegen“ → `sail()` in `js/main.js` (Zeile ~834) legt die Fahrt an (Phase `deck`).
2. Deck-Bildschirm `js/ui/deck.js` (`stage()`, `click()`): Figuren antippen (`deck-fig`), Plätze antippen (`deck-slot`), Fahrtbrief, dann `deck-go` (Zeile ~275) → `act({ type: 'deck', ids })`.
3. Kurswahl `js/ui/inselwahl.js` (Wisch-Karten, 22s).
Alles dazwischen ist heute Umschalten per Tipp, ohne Übergang.

## Vier Häppchen (Reihenfolge-Vorschlag)
**A. Ablege-Szene (Paket 1, zusammen mit B).** Nach „Ablegen“ läuft etwa 2 Sekunden eine kleine Szene: die gewählte Crew steht an Deck, Leinen los, Segel auf, Möwen, Schiff gleitet aus dem Hafen, dann Kurswahl. Antippen überspringt. Bausteine gibt es schon (Story-Szene `st-sea`, `st-ship`, `st-cast`, Schiffs-Sprites aus `GL.sprites.ship`). Neu: `js/ui/ablegen.js` (im `tail`-Bündel), Einhängen in `deck-go` vor `act(...)`. Reine Anzeige, keine Spiellogik, kein Spielstand-Feld, Replay-sicher. Mit „Weniger Bewegung“ am Gerät: nur kurzes Einblenden, keine Fahrt.
**B. Crew ruft beim Ablegen (Paket 1).** Höchstens 3 kurze Sprüche aus der Crew in der Szene, je nach Stimmung (4D Gefühle, `run.herz`: froh, normal, erschöpft). Texte DE/EN als Pool je Stimmung, Namen laufen durch die eigene Welt. Sonnet schreibt die Texte nach dem Muster der A9-Crew-Ereignisse.
**C. Karten einrasten (Paket 2).** Auf dem Deck-Bildschirm Figuren per Ziehen aufs Schiff setzen, Karte folgt dem Finger und federt auf dem Platz ein. **Tippen bleibt als Weg erhalten** (Fallback, Tastatur, Barrierefreiheit). Berührt `deck.js` (Pointer-Ereignisse neben `deck-fig`/`deck-slot`) und CSS. Fallen: Scrollen auf dem Handy (`touch-action`), Budget-Prüfung bleibt `fits()`, nichts am Spielstand ändern.
**D. Kurswahl als Fahrt (Paket 3).** Auf der Inselwahl segelt das Schiff sichtbar, Hintergrund mit Parallax (Wellen, Wolken in zwei Ebenen). **Wichtig wegen 9a:** nur `transform`/`opacity`, kein `left`/`margin`, nichts Dauerndes unter verdecktem Bildschirm, sonst wird das Handy wieder warm. Berührt `inselwahl.js` und CSS.

## Größe und Modell
- A+B: mittel, eine neue Datei plus ein Haken in `deck.js`. Szene und Haken Opus oder gut Sonnet nach dem Story-Muster, Texte Sonnet.
- C: mittel bis kniffelig (Touch-Ziehen), Opus.
- D: klein bis mittel, aber Leistung messen (Headless-Leerlauf wie bei 9a), Opus.

## Nicht jetzt
Kein neuer Spielstand, keine neue Balance, nichts an Kurswahl-Logik, Deck-Budget oder Run-Engine.

## Offen für Felix
1. Reihenfolge so okay (A+B, dann C, dann D)?
2. Wie lang darf die Szene höchstens sein (Vorschlag 2 Sekunden, antippbar)?
3. Soll die Szene bei **jeder** Fahrt laufen oder ab der 2. Fahrt abschaltbar sein (Einstellung)?

## Entscheidungen und Stand (42. Chat, Sonnet, 25.10.)
Felix per Klick, alle wie empfohlen: **1.** Reihenfolge A+B, dann C, dann D. **2.** Szene höchstens **2 Sekunden**, antippbar. **3.** Szene läuft **bei jeder Fahrt**, keine neue Einstellung (wer will, tippt sie weg).

**A+B gebaut** auf `feature/fahrtstart-ablegen` (von `main` 25d, nur Anzeige, nicht live):
- Neu `js/ui/ablegen.js` (im `tail`-Bündel, in `tools/bundles.json` nach `inselwahl.js`): `GL.ablegen.play(ids, run, profile, onDone)`. Dock links, die gewählte Crew in einer Reihe an Deck des eigenen Schiffs (`GL.sprites.ship`), nach 0,45 s Leinen los: Schiff gleitet nach rechts, Dock, Wellen und Wolken ziehen nach links, nach 2 s `onDone`. Antippen, Enter, Leertaste oder Esc überspringt.
- Haken in `js/ui/deck.js` bei `deck-go`: `act({ type: 'deck', ids })` läuft erst nach der Szene (oder sofort, wenn `GL.ablegen` fehlt). Doppeltes Tippen wird abgefangen.
- **B:** Höchstens 3 Crew-Rufe als Sprechblasen (eigener Pirat zuerst, dann zufällige andere, je Satz nur einmal), 4 Sätze je Rolle (eigener Pirat, Kämpfer, Helfer, Brecher), DE/EN direkt in `ablegen.js`. **Abweichung von der Skizze:** Die Stimmung (4D Gefühle) ist beim Start einer Fahrt für alle „normal“ (`run.herz` beginnt leer), darum Rufe je **Rolle** statt je Stimmung. Zufall nur für die Anzeige (`Math.random`), kein Seed.
- CSS-Block „9c A+B“ am Ende von `style.css`, nur `transform`/`opacity`/`translate`, nichts Dauerndes. „Weniger Bewegung“: nur kurzes Einblenden (1,1 s), das Schiff bleibt liegen.
- Geprüft: Testkopie gebündelt, Headless 390 px DE/EN: Szene läuft 2000 ms, Überspringen ruft `onDone` genau einmal, Overlay verschwindet, Blasen überlappen nicht (gestaffelt), echter Haken mit Deck-Run: `act` erst nach ~2 s mit allen Figuren, 0 `pageerror`.
- Offen: am Handy ansehen. Patchnote und `bump-version.py` kommen beim Live-Gang. Danach C (Karten einrasten, Opus), D (Kurswahl als Fahrt, Opus).
