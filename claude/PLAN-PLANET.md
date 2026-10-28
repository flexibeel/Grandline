# Planeten-Idee: Ausbeuten auf Zeit (Konzept v0)

Stand 27.10.2026 (50. Chat). **Nur Skizze, nichts gebaut.** Idee von Felix (27.10., 15:37), nach dem Angel-Test.

## Die Idee in einem Satz
Ein niedliches Pixel-Spiel, in dem du einen kleinen Planeten so schnell wie möglich ausbeutest. Je schneller, desto besser dein Rang und desto mehr Boni für den nächsten Planeten. Die kleinen Bewohner zeigen dir, was du dabei anrichtest.

## Warum (Felix)
„Um der Gesellschaft vor Augen zu halten, wie Kacke wir eigentlich sind.“

## Lehre aus dem Angel-Test (27.10.)
Felix: Angeln ging, war aber langweilig, **immer dasselbe**, **kein Ziel, das zieht**, **Thema reizt nicht**. Daraus für dieses Spiel:
- Alle paar Sekunden eine **echte Entscheidung mit Preis** (schnell, aber kaputt, oder langsam und schonend).
- Ein Ziel, das zieht: **Uhr läuft, Rang, „nochmal schneller“**.
- Thema, das Felix selbst gewählt hat.

## Entscheidungen von Felix (27.10., per Klick)
- **Ton:** niedlich mit bösem Twist. Süße Pixel-Welt und fröhliche Musik, während man sie kaputtmacht.
- **Kern:** bauen plus Entscheidungskarten. Kleiner Pixel-Planet, auf dem man baut, dazu immer wieder Karten („Wald roden für die Mine?“). Handytauglich.
- **Spiegel:** die **Bewohner reagieren**. Die Pixel-Leute sind erst fröhlich, dann besorgt, dann müde, dann weg.
- **Spieler:** allein mit Rangliste (Speedrun gegen die Zeit).

## So könnte sich ein Planet spielen (Vorschlag, nicht entschieden)
1. **Landen:** Ein kleiner, bunter Planet mit Wald, Wiesen, Tieren und einem Dorf voller fröhlicher Bewohner. Oben die Quote („Liefere 1000 Rohstoffe“) und die Uhr.
2. **Bauen:** Wenige Gebäude (z. B. Säge, Mine, Bohrturm, Fabrik). Jedes frisst Landschaft und bringt Rohstoffe.
3. **Karten:** Alle 15–20 Sekunden eine Entscheidung mit zwei Seiten, z. B. „Fluss umleiten: +30 % Tempo, die Fische sind weg“ oder „Dorf umsiedeln: Platz für die Mine“. Die schnelle Seite ist fast immer die schlimmere.
4. **Bewohner:** Sie winken am Anfang, werden besorgt, packen ihre Sachen und sind irgendwann weg. Tiere verschwinden, Farben verblassen, die Musik verliert nach und nach Instrumente. **Das Spiel sagt nie „das ist böse“**, man sieht es nur.
5. **Abflug:** Quote erfüllt, die Rakete startet, Zeit und Rang. Zurück bleibt ein grauer Planet. Boni gehen mit zum nächsten (z. B. schnellerer Bohrer, „Lobbyist“ macht eine Karte billiger).

## Vorschlag für den ersten kleinen Test (wie beim Angeln)
- **Ein Planet**, ca. 5 Minuten, eine Seite als privater Artefakt-Link fürs Handy, Kopie unter `prototyp/planet/`.
- 3 Gebäude, 6–8 Entscheidungskarten, Bewohner in 4 Stufen sichtbar, Quote, Uhr, Abflug-Bildschirm mit Zeit.
- Rangliste vorerst nur im Browser (eigene Bestzeit), keine Datenbank.
- Bauen mit Opus (Pixel-Art, Gefühl).
- Testfragen danach: „Willst du sofort nochmal schneller?“ und „Hat es dich ein bisschen schlecht fühlen lassen?“

## Update 28.10. (51. Chat): Test gebaut
- Felix per Klick: Test bauen statt weiter grübeln; Ansicht **kleine Kugel** (Frage 1 erledigt).
- `prototyp/planet/index.html`, privater Artefakt-Link im Fahrplan („Letzte Übergabe“). Arbeitstitel im Test: „Planet B“ (Planeten heißen B, C, D …). Boni und Rangliste als einfache Platzhalter-Antwort auf Frage 2 und 3 (6 Boni, Quote wächst je Planet um 45 %, kein Ende).
- Offen: Felix' Urteil nach 2–3 Planeten am Handy.

## Update 28.10. (52. Chat, Sonnet): Urteil zum Test und Entscheidung
Felix hat Planet B am Handy gespielt, per Klick:
- **„Willst du sofort nochmal schneller?“** → *Eher so la la.* Der Sog fehlt.
- **„Hat es dich schlecht fühlen lassen?“** → *Gar nicht.* Der Spiegel wirkt noch nicht.
- **Was fehlte:** mehr Entscheidungen, mehr Tiefe beim Bauen, mehr Antrieb zum Wiederholen. (Nicht angekreuzt: stärkerer Spiegel.)
- **Entscheidung: einmal gezielt umbauen, danach nochmal testen.** Wenn es dann nicht zieht: ruhen lassen (wie Angeln).

**Vorschlag für den Umbau (noch nicht abgesegnet, vor dem Bauen kurz per Klick bestätigen):**
1. **Mehr und härtere Entscheidungen:** 14–16 statt 8 Karten, alle ca. 10 s, jede mit echtem Zielkonflikt. Einige Karten hängen an Zuständen (kommt nur, wenn der See schon leer ist) oder haben Folgekarten (Kette).
2. **Tiefe beim Bauen:** Nachbarschaft zählt (Säge neben Wald, Mine neben Dorf), ein viertes Gebäude, beim Ausbau eine Wahl zwischen zwei Wegen statt nur „besser“.
3. **Sog zum Wiederholen:** Zwischenzeiten wie beim Speedrun (Meilensteine mit Vergleich zur eigenen Bestzeit, „Geist“), Bonus aus 3 wählen statt automatisch, die Wahl wirkt spürbar im nächsten Planeten.
4. **Spiegel nur eine Stellschraube, nicht ausbauen:** Paula bekommt kurze Sätze und eine Folge im Bild pro Karte. Erst sehen, ob 1–3 allein schon ziehen.
- **Kein Ausbau ins Große:** gleiche Größe (ca. 3–5 Minuten pro Planet), weiter nur im Browser, Prototyp `prototyp/planet/`.
- **Abbruchregel:** Dieselben zwei Fragen nochmal. Wenn „nochmal schneller?“ nicht klar *Ja* ist, ruht das Spiel.
- **Modell:** Bauen mit Opus.

## Update 28.10. (53. Chat, Opus): Umbau gebaut
Felix per Klick: alle 4 Punkte so bauen, viertes Gebäude **Fabrik**. Gleicher Link wie bisher (Version 2), Datei `prototyp/planet/index.html`. Speicher heißt jetzt `planetb.v2`, alte Bestzeiten fangen neu an.
- **Hausmitteilungen:** 19 Karten (davon 3 Folgekarten: Nachtschicht → Streik, Gutachten verschwinden lassen → Journalistin, Dorf umsiedeln → Enge Container), erste nach 7 s, danach 10 s Pause. Viele kommen nur bei bestimmtem Zustand (See leer, Smog unter 50 %, zu wenig Leute, Fabrik steht …). Jede Seite hat einen eigenen Vorteil, einige kosten Geld (Knopf grau, wenn zu wenig). Ablaufbalken: nach 15 s ohne Antwort entscheidet die Abteilung (schnelle Seite). Reihenfolge je Planet fest, damit man einen Planeten lernen kann. Im Bot-Test 14–16 Karten pro Lauf.
- **Bewohner sind Arbeitskraft:** Leistung hängt an den Leuten (Arbeitskraft 20–100 %). Wer gehen muss, entscheidet vor allem die Stimmung, also die Kartenwahl, weniger der Planetenzustand. Das macht die sanfte Seite zu einer echten Option.
- **Bauen:** Nachbarn links und rechts zählen (Säge +30 % je Wald daneben, Mine +40 % je Dorf daneben, Bohrturm +25 % je Bohrturm daneben, Fabrik +50 % je Säge/Mine/Bohrturm daneben). Gebäude neben Dörfern drücken die Stimmung (außer Säge). **Fabrik** auf Wiese oder Asche. Ausbau mit Wahl: **A** (z. B. Doppelblatt) mehr Leistung, braucht Leute, mehr Dreck, Schornstein im Bild; **B** (z. B. Vollernter) weniger Leistung, läuft ohne Leute, kaum Dreck, etwas teurer, Zahnrad im Bild.
- **Sog:** Geist = eigene Bestzeit auf diesem Planeten (Strich auf dem Quotenbalken, unter der Uhr „Geist −2,3 s“), Zwischenzeiten bei 25/50/75 % mit Ton, Tabelle am Ende. „Nochmal, gegen deinen Geist“. Bonuswahl aus 3 von 10 Boni (stärker als vorher, z. B. Sägen +60 %, Raumplaner: Nachbar-Boni doppelt, Roboter-Leasing, erste Fabrik gratis), unter 3:00 zwei.
- **Paula:** nach jeder Antwort ein kurzer Satz, bei der schnellen Seite kurz erschrocken. Fast jede Entscheidung hinterlässt etwas im Bild (Plakat, Container, Bank-Fahne, Zaun, Hochsitz, Roboter, Lampions, lila See …).
- **Tempo (Bot, spielt fehlerfrei):** Planet B gierig 2:50, schonend 2:44, Planet C gierig 3:12, schonend 3:47. Echte Spieler brauchen etwas länger, unter 3:00 auf B ist also mit Übung drin.
- **Testfragen wie abgemacht:** „Willst du sofort nochmal schneller?“ und „Hat es dich schlecht fühlen lassen?“. Wenn „nochmal schneller?“ nicht klar Ja ist, ruht das Spiel.

## Idee von Felix für später (28.10., 15:06): richtig tief im Verlauf
Im Verlauf (über viele Planeten) soll das Spiel richtig tief werden: **Demokratie und Regierungen, Sozialsystem, Gesundheitssystem** „und und und“. Noch nicht geplant, erst wenn der Kern im Test zieht. Möglicher Weg: jeder neue Planet schaltet ein neues System frei (z. B. Planet D: Wahlen, die Bewohner können dich abwählen; Planet F: Krankenhaus und Gesundheit).

## Offene Fragen (per Klick im nächsten Chat)
1. **Ansicht:** Planet von oben als runde Scheibe, oder Seitenansicht als Streifen (wie Terraria)?
2. **Was geht mit:** Welche Boni nimmt man mit, und wie viele Planeten gibt es?
3. **Ende:** Gibt es irgendwann ein Ende (keine Planeten mehr übrig), oder läuft es endlos?
4. **Name** (Arbeitstitel-Ideen: „Planet B“, „Nächster Halt“, „Quartalsplanet“).
5. **Ort:** eigenes Repo wie bei TrueCrime, oder erst als Prototyp hier?

## Marktcheck (27.10., kurz)
Ganz so gibt es das nicht. Verwandt: Universal Paperclips (Wachstums-Satire, Browser), Against the Storm (Städtebau-Roguelite mit Boni zwischen den Runs), Imagine Earth (Planeten besiedeln, Profit gegen Nachhaltigkeit, eher ernst), Terra Nil (das Gegenteil: Welt reparieren). **Lücke:** Ausbeutung als Speedrun mit Rangliste, niedlich verpackt, mit sichtbaren Folgen.
