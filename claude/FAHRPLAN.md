# Fahrplan: Stand, Warteschlange, Übergabe

**Jeder neue Chat liest zuerst diese Datei** (und `CLAUDE.md`), nicht den ganzen Code.
**Am Ende jedes Chats** wird sie aktualisiert und mitgepusht: Was ist fertig, was liegt auf welchem Zweig, was kommt als Nächstes.
Felix und Jan arbeiten mit verschiedenen Claude-Accounts. Diese Datei ist das gemeinsame Gedächtnis, deshalb gehört hier alles rein, was der nächste Chat wissen muss.

Stand: 22.10.2026 (nachmittags)

## Wer macht was
- **Felix:** entscheidet, was gebaut wird und was live geht („schalte live“), Kunst und Look.
- **Jan:** _(bitte ergänzen)_
- **Claude:** setzt um, immer auf eigenem Zweig, pflegt diese Datei.

## Grundsatz-Entscheidung (21.10.)
- **Weitergebaut wird das 2D-Pixel-Spiel** (`index.html`, `js/`). Das 3D-System „Neue Welt“ (`neu/`) ist seit 22f entfernt und archiviert (`archiv/neue-welt`), `/neu/` leitet nur noch aufs Spiel um.
- Alte Zweige, die `neu/...` ändern, sind 3D-Arbeit und werden **nicht** weitergeführt. Ideen daraus werden bei Bedarf im 2D-Spiel neu gebaut.

## Live
- `main` = **22j „Endlos mit Biss“** (thegreatline.de), enthält Kampf-Update (22h), Kontor Teil 1 (22i), Endlos-Tiefe (22j)

## Wartet auf „schalte live“
- _(nichts)_

## Offene Zweige (nicht live, nicht in 22j)
| Zweig | Stand | Rückstand zu main |
|---|---|---|
| `feature/upgrades-am-schiff` | **3D (neu/), tot.** Nicht weiterbauen | 18 Commits |
| `fix/seekampf-pc` | Feuersturm-Tipp verdeckt Konter-Knopf nicht mehr | 9 |
| `feature/uebergabe` | **3D, tot.** alte Übergabe-Notiz (Neue Welt, Werft) | 21 |
| `feature/kaperfahrt` | Kurzmodus im Hafen (Deck als Spielbrett, W20) | 33 |
| `feature/konter-tippen` | Konter per Ring-Fenster | 33 |
| `feature/fahrender-kampf-entwurf` | Entwurf, Richtungen und Sprites | 33 |
| `feature/gamedesigner` | Pixel-Handwerk-Regeln | 43 |
| `feature/sichtbarkeit` | anonyme Besucherzählung, Tabelle fehlt noch | 43 |
| `feature/piratin` | WIP Frisuren/Anrede, unfertig | 61 |

Hinweis: Fehlt ein Zweig hier, ist er schon in `main` enthalten. Felix entscheidet, welche Zweige weiterleben und welche ins Archiv gehen.

## Warteschlange (Felix wählt die Reihenfolge)
1. Upgrades sichtbar am Schiff im 2D-Spiel (Vorschlag liegt bei Felix, siehe Übergabe)
2. Rumpf-Upgrade auch im Landgang
3. Mehr Gold-Ziele (4. Stufe oder Kosmetik wie eine Flagge)
4. Aus der Ideenwerkstatt („Ja, machen wir“): Piratin fertig, Look-Inventur, Kampfszenen lebendiger, Kämpfer-Auswahl entschlacken, Performance

Die große Ideenliste ist das Claude-Doc **„Grand Line: Ideenwerkstatt“** im Account von Felix. Von anderen Accounts aus ist es nicht lesbar. Was dort beschlossen wird, kommt als Punkt in diese Warteschlange.

## Letzte Übergabe
_Hier schreibt der letzte Chat in 3 bis 5 Zeilen, wo er aufgehört hat._
- 22.10. (Jan, 2. Chat): `release/22j` live geschaltet. Festgestellt: `feature/upgrades-am-schiff` war 3D, daher tot. Vorschlag für Schiffs-Upgrades im 2D-Spiel gemacht: Werft-Stufen (`js/data/upgrades.js`: rumpf/kanonen/segel) zeichnen Pixel ins Schiff in `GL.sprites.ship` (`js/ui/sprites.js`, 16×12-Raster `SHIP`). Wartet auf Zusage, noch kein Zweig.
- 22.10. (Jan): Fahrplan und Startnachricht-Regel angelegt (siehe `CLAUDE.md`). Nichts am Spiel geändert. Nächster Chat: `release/22j` live, dann Upgrades sichtbar am Schiff.
