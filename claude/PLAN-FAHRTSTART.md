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
