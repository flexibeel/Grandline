# Skizze: Endless aus Biomen und Wetter (Vorschlag)

Stand 23.10.2026. Entwurf von Claude (Sonnet) zu Fahrplan Punkt 3a. **Nichts gebaut.** Grundlage sind die Klick-Antworten von Jan/Felix: Biom = die fünf Meere, Wetter bleibt Zufall im Kampf, Inseln wachsen über mehr Stationen, Wochen-Rhythmus später. Meernamen wie im Weltbau (`claude/WELTBAU.md`).

## 1. Was es heute gibt (geprüft im Code)
- Endlos läuft über `run.loop` (jede Runde Gegner +45 % Leben, +30 % Angriff, Tempo bis +3, dazu Zusätze `affixes`) und `run.endlessSea` (Endlos-Fahrt pro geschafftem Meer, `config.endless`).
- Eine Insel hat `stepsPerIsland` = 8 Etappen (2 Kapitel mit je 4). Die Zahl steckt an mehreren Stellen in `run.js` (Z. ~31 bis 44, ~343).
- Wetter gibt es doppelt: **Insel-Twists** (`GL.data.twists` in `islands.js`, z. B. Markttag, Dauerregen, Nebel; pro Insel-Kapitel aus dem Seed, ohne Zufallszug, also Replay-sicher) und **Kampf-Wetter** (`config.weather`, 10 Stück, `weatherChance` 0,4, Zufall in `battle.js` ~Z. 374).
- **Biome gibt es nicht.** Ein Meer ist heute nur Inselliste, Look und Bosse.

## 2. Vorschlag: Ein Biom = Look + Wetter-Mischung + eine Meer-Regel
Die Regel ändert pro Meer **einen** Hebel, den es schon gibt. Alle Werte sind Stellschrauben in `config.js`, Messung mit `tools/balance.html`.

| Meer | Meer-Regel | Hebel im Code |
|---|---|---|
| Ostmeer | „Markttreiben“: mehr Tavernen und Läden auf der Karte, Gegner kommen öfter zu mehreren | `nodeTypes`, Gegnerzahl |
| Wilde See | „Das Wetter ist eine Figur“: Wetterchance 0,4 auf 0,6, Wind, Sturm und Hitze häufiger | `weatherChance`, gewichtete Liste |
| Gerichtsinsel | „Für alles ein Formular“: mehr Elite-Kämpfe, dafür bessere Beute | `nodeTypes`, Beute |
| Gruselmeer | „Höfliche Geister“: Nebel häufiger, Gegner weichen öfter aus, Rastplätze häufiger | Wetter `nebel`, `affixes` |
| Spiegel-Archipel | „Alle an einem Ort“: gemischte Gegner aus allen Meeren, höchste Beute | Gegnerpool |

**Reihenfolge der Meere in Endlos:** wie bisher nach geschafftem Meer, danach von vorn mit Schleife (`run.loop` +1). Die Meer-Regel gilt in jeder Schleife, die Gegner werden weiter stärker.

## 3. Wetter bleibt Zufall, aber mit mehr Auswahl
- Die zehn bisherigen bleiben. Pro Meer bekommt ein Teil davon ein höheres Gewicht (Tabelle oben), die Wetterchance selbst steigt nur in der Wilden See.
- **Vier neue Kampf-Wetter** (Vorschlag, Namen frei änderbar):
  - **Flaute:** Alle sind langsamer (Tempo −1 für beide Seiten). Mit vorhandenen Schlüsseln `crewSpd` und `foeSpd` baubar.
  - **Salzgischt:** Wer zuerst getroffen wird, verfehlt in der nächsten Runde öfter. Neuer Schlüssel nötig.
  - **Glitzerregen:** Beide Seiten heilen am Rundenende ein wenig. Neuer Schlüssel nötig.
  - **Strömungswirbel:** In Runde 3 tauschen zwei zufällige Gegner den Platz (passt zur Strömungs-Idee der Welt). Neuer Schlüssel nötig.
- Die Anzeige steht schon (`weather`-Ereignis, Chip im Kampf, Kulisse in `art.js`). Neue Wetter brauchen nur Name, Text, Icon und einen Kulissen-Eintrag.

## 4. Wachsende Inseln: mehr Stationen mit der Tiefe
- Heute 8 Etappen pro Insel. **Nicht** `stepsPerIsland` ändern, das ist zu verdrahtet (Risiko für Replays und Spielstände).
- Vorschlag: In Endlos bekommt die **Karte einer Insel** (`genChart`) zusätzliche Reihen, +1 je zwei Schleifen, höchstens +3. Jede Reihe bringt Beute (`loopGold` wächst mit). So wächst die Insel spürbar, ohne die Zählung der Etappen zu ändern.
- **Muss beim Bauen geprüft werden:** ob zusätzliche Reihen die Zählung von `run.step` und die Replays unberührt lassen. Falls nicht, Fallback: statt Reihen mehr Orte pro Reihe.

## 5. Häppchen (Reihenfolge)
1. **E1 Meer-Regeln und Biom-Look**, Stellschrauben in `config.js`, Anzeige in der Kurswahl („Biom: Wilde See, Wetter häufiger“). **M, Opus.**
2. **E2 Wetter-Gewichtung und vier neue Wetter**, Kulissen, Texte DE/EN, neutrale Namen. **S bis M, Opus** (neue Schlüssel in `battle.js`).
3. **E3 Wachsende Karten**, erst Prüfung auf Replay-Sicherheit. **M, Opus, Risiko.**
4. **Messung** mit `tools/balance.html`: Siegquote und Tiefe vorher und nachher je Meer, keine Meer-Regel darf ein Meer klar leichter oder schwerer machen als die anderen.

## 6. Offene Fragen (nächste Klick-Runde)
1. Passen die fünf Meer-Regeln oder soll eine anders sein?
2. Welche der vier neuen Wetter sollen rein, welche nicht?
3. Soll das Biom in der Kurswahl sichtbar sein (Chip, Szene) oder nur im Kampf spürbar?
4. Soll Endlos mit E1 und E2 zuerst live, E3 später, oder alles zusammen im Sammel-Update?
