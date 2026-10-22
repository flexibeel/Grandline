# Fahrplan: Stand, Warteschlange, Übergabe

**Jeder neue Chat liest zuerst diese Datei** (und `CLAUDE.md`), nicht den ganzen Code.
**Am Ende jedes Chats** wird sie aktualisiert und mitgepusht: Was ist fertig, was liegt auf welchem Zweig, was kommt als Nächstes.
Felix und Jan arbeiten mit verschiedenen Claude-Accounts. Diese Datei ist das gemeinsame Gedächtnis, deshalb gehört hier alles rein, was der nächste Chat wissen muss.

Stand: 22.10.2026

## Wer macht was
- **Felix:** entscheidet, was gebaut wird und was live geht („schalte live“), Kunst und Look.
- **Jan:** _(bitte ergänzen)_
- **Claude:** setzt um, immer auf eigenem Zweig, pflegt diese Datei.

## Live
- `main` = **22g „Ulti auf Zuruf“** (thegreatline.de)

## Wartet auf „schalte live“
- `release/22j`: fertig gebündelt, enthält
  - `feature/kampf-update` (22h): Ultis seltener und stärker, Heiler unter 50 %, Frost/Schock/Blind
  - `feature/kontor` (22i): Kontor im Hafen, Teil 1 (Bernstein, Entladen nach jedem Run)
  - `feature/endless-tiefe` (22j): Gegner-Zusätze in der Endlos-Tiefe

## Offene Zweige (nicht live, nicht in 22j)
| Zweig | Stand | Rückstand zu main |
|---|---|---|
| `feature/upgrades-am-schiff` | Landgang: Kanonen/Segel wirken | 18 Commits |
| `fix/seekampf-pc` | Feuersturm-Tipp verdeckt Konter-Knopf nicht mehr | 9 |
| `feature/uebergabe` | alte Übergabe-Notiz (Neue Welt, Werft) + `neu/`-Dateien | 21 |
| `feature/kaperfahrt` | Kurzmodus im Hafen (Deck als Spielbrett, W20) | 33 |
| `feature/konter-tippen` | Konter per Ring-Fenster | 33 |
| `feature/fahrender-kampf-entwurf` | Entwurf, Richtungen und Sprites | 33 |
| `feature/gamedesigner` | Pixel-Handwerk-Regeln | 43 |
| `feature/sichtbarkeit` | anonyme Besucherzählung, Tabelle fehlt noch | 43 |
| `feature/piratin` | WIP Frisuren/Anrede, unfertig | 61 |

Hinweis: Fehlt ein Zweig hier, ist er schon in `main` enthalten. Felix entscheidet, welche Zweige weiterleben und welche ins Archiv gehen.

## Warteschlange (Felix wählt die Reihenfolge)
1. `release/22j` live schalten
2. Upgrades sichtbar am Schiff (größeres Segel, mehr Kanonen, Flicken am Rumpf)
3. Rumpf-Upgrade auch im Landgang
4. Mehr Gold-Ziele (4. Stufe oder Kosmetik wie eine Flagge)
5. Aus der Ideenwerkstatt („Ja, machen wir“): Piratin fertig, Look-Inventur, Kampfszenen lebendiger, Kämpfer-Auswahl entschlacken, Performance

Die große Ideenliste ist das Claude-Doc **„Grand Line: Ideenwerkstatt“** im Account von Felix. Von anderen Accounts aus ist es nicht lesbar. Was dort beschlossen wird, kommt als Punkt in diese Warteschlange.

## Letzte Übergabe
_Hier schreibt der letzte Chat in 3 bis 5 Zeilen, wo er aufgehört hat._
- 22.10. (Jan): Fahrplan und Startnachricht-Regel angelegt (siehe `CLAUDE.md`). Nichts am Spiel geändert. Nächster Chat: `release/22j` live, dann Upgrades sichtbar am Schiff.
