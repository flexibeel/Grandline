# Entwurf: Fahrender Kampf (Stand 21.10.2026, nur Entwurf, kein Spielcode)

Felix möchte die Kämpfe weg von den „Kästen“ bringen. Favorit: **Richtung D, fahrender Kampf** wie Wanderburg.
Das Schiff segelt in Echtzeit, Kanonen feuern allein, man lenkt mit einem Daumen und zündet 1–2 Fähigkeiten.
Holt der Boss aus, erscheint das Konter-Schild.

## Dateien
- `kampf-richtungen.html`: Vergleich der vier Richtungen (A Bühne, B Schiff gegen Schiff, C kurz und knackig, D fahrend) plus Notizen zu anderen Spielen. Im Browser öffnen.
- `gd-fahrender-kampf.md`: Look- und Steuerungs-Vorgabe des Gamedesigners (Kamera, Auflösung, Palette, Wasser, Treffer-Gefühl, HUD, Boss-Ausholen, Konter-Fenster).
- `PLAYER.png`, `ENEMY.png`, `BOSS.png`: Sprite-Stapel in 4 Winkeln. `stacks.js` und `gen.py` erzeugen sie.

## Felix' Urteil
Noch **zu schlecht animiert und zu wenig 3D**. Die Standbilder sind nur grobe Skizzen. Es muss viel ansprechender und räumlicher werden.

## Nächster Schritt (noch nicht begonnen)
Der Gamedesigner soll nochmal gründlich recherchieren und für zwei Wege je eine **bewegte Probe-Szene** bauen,
damit Felix vergleichen kann:
1. **Echtes Low-Poly-3D mit Pixel-Filter** (t3ssel8r-Stil, three.js): kleine Renderauflösung, Kanten-Outlines, Toon-Licht, Pixel-Wasser mit Schaum.
2. **Besseres Sprite Stacking**: mehr Schichten, größere Schiffe, Neigung in Kurven, Wellen-Schaukeln.

Inhalt jeder Probe: Schiff fährt eine Kurve, ein Gegnerboot, Kanonenschuss mit Rauch, Kielwasser, Abendlicht, Hochformat.
Erst danach die Entscheidung und dann ein spielbarer Prototyp. Konter-Tippen und neues Anmelden warten bis dahin.
