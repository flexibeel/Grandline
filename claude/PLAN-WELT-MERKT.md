# Plan 4A: Die Welt merkt sich das

Stand 23.10.2026. **Nur Plan, nichts gebaut.** Vertiefung von Säule 4A aus `claude/PLAN-FOLGEN.md` (Jan per Klick: diese Säule zuerst). Baut auf dem Weltgedächtnis F0 auf (`profile.world`, Kopie in `run.start`, Logbuch in der Seekarte).

## 1. Was es schon gibt: Folgen mit drei Teilen (geprüft im Code)
- `GL.data.crewEpisodes` in `js/data/events3.js` (7 Folgen) und `js/data/events4.js` (3 Folgen). Pro Insel-Kapitel läuft eine Folge: **Teil 1** direkt nach dem Ablegen, **Teil 2** unterwegs, **Teil 3** vor dem Bösewicht.
- Eine Wahl in Teil 1 oder 2 setzt ein `flag` (`run.epi.flags`, `run.js` ~Z. 736 bis 744 und ~1297). Teil 3 hat Varianten mit `need`: Je nach Flag kommt ein anderes Ende.
- Die zehn Folgen: Die Flaschenpost (Kapitän Korken), Das Teufelsgewürz, Die lange Nacht, Das Nebelschiff, Der verschwundene Kompass, Das Steckbrief-Foto, Die große Wette, Das Kochduell, Die verfluchte Muschel, Der Leuchtturmwärter.
- **Das ist schon „kurze Folgen“ in einer Fahrt.** Es fehlt nur der lange Teil: Nach der Fahrt ist alles vergessen.

## 2. Die Idee in einem Satz
**Bekannte kommen wieder.** Wer in einer Fahrt eine Folge erlebt hat, trifft die Figur in einer späteren Fahrt erneut, und sie erinnert sich, wie es damals ausging. Dazu bekommen **Orte** nach dem Bösewicht eine Entscheidung, die bleibt.

## 3. Teil A: Wiedersehen mit Bekannten
**Merken:** Am Ende von Teil 3 steht fest, welches Ende kam (das `need` der Variante, sonst „neutral“). Das kommt in eine Liste der Fahrt (Vorschlag `run.epiDone`, wird aus dem Seed berechnet, also Replay-sicher) und nach `finishRun` ins Profil: `profile.world.bekannte[folgenId] = { ende, mal, wo }` (`wo` = Insel, für die Markierung im Logbuch der Seekarte).

**Wiedersehen:** Kommt dieselbe Folge in einer späteren Fahrt wieder dran, startet sie nicht von vorn, sondern mit einem **Wiedersehen-Teil 1**, der vom alten Ende abhängt. Wichtig für Replays: Die Auswahl der Folge bleibt genau wie heute (gleicher Zufallszug), nur Text und Wahlen tauschen sich je nach `run.start.world`.

**Drei Beispiele** (Ton wie im Spiel, Werte nur mit vorhandenen Ergebnis-Arten):

**Kapitän Korken (Die Flaschenpost)**
- Ende „empfang“ (ihr habt Kuchen gebacken): *Ein Schiff, so groß wie ein Schuh, hupt freundlich. „Ihr seid die mit dem Kuchen! Ich hab Verstärkung mitgebracht.“ Drei sehr kleine Matrosen salutieren.* Wahl: „Mitsegeln lassen“ → bis zum Ende der Insel ganze Crew +1 Angriff; „Kuchen backen, wie damals“ → Crew heilt 20 %.
- Ende „becher“ (Flasche als Becher benutzt): *„IHR! Die Becher-Leute!“ Korken hat eine winzige Kanone dabei. Sie ist erstaunlich laut.* Wahl: „Neue Flasche schenken“ → −8 Gold, danach Versöhnung (das Gedächtnis wechselt auf „versöhnt“); „Flüchten“ → bis zum Ende der Insel −1 Tempo.
- **Lang:** Mit „empfang“ oder „versöhnt“ taucht Korken als **Gast in der Taverne** auf (Gesprächssatz, später vielleicht Figur), mit „becher“ hängt ein **Steckbrief von euch** in seinem Hafen.

**Der Leuchtturmwärter**
- Ende „licht“ (ihr habt das Licht wieder angezündet): *Der Turm blinkt euch zu, dreimal kurz. Der Wärter winkt mit der Teekanne.* Wahl: „Anlegen auf Tee“ → +12 Erfahrung; „Zurückblinken“ → seltener Schatz (er hat Strandgut gesammelt, „für euch“).
- Ende „gerettet“ (ihr habt das Händlerschiff gerettet): *Der Händler von damals hat einen Stand neben dem Leuchtturm. „Für meine Retter: Freundschaftspreis.“* Wahl: Einkauf mit Rabatt (**neue Ergebnis-Art** `rabatt`, siehe 5).
- **Lang:** In der Seekarte leuchtet ein kleiner Turm, der Weg dorthin bleibt dauerhaft aufgedeckt.

**Das Nebelschiff**
- Ende „mutig“ (ihr habt beim Nebelschiff nachgesehen, statt es zu entern): *Aus dem Nebel ruft eine dünne Stimme: „Ihr! Ihr hattet keine Angst vor mir. Darf ich euch etwas zeigen?“* Wahl: „Folgen“ → seltener Schatz, −10 % Leben (es ist ein Geisterschiff, es ist zugig).
- Ende „geist“ (ihr habt das Nebelschiff geentert, seitdem sind die Arme schwer): *Die schweren Arme sind wieder da. Jemand an Bord murmelt im Schlaf „Nebel, Nebel“.* Wahl: „Den Kapitän suchen und erlösen“ → Fluch weg, das Gedächtnis wechselt auf „erlöst“, +15 Erfahrung; „Ignorieren“ → bis zum Ende der Insel −1 Angriff.
- **Lang:** Mit „erlöst“ erscheint im Gruselmeer ein **freundliches Geisterschiff** als neuer Ort auf der Seekarte (passt zum Weltbau: „die Geister sind höflich“).

**Für alle zehn Folgen:** je ein Wiedersehen-Teil mit 2 Varianten, also etwa 20 kleine Szenen. Texte nach Muster, gut für Sonnet oder Grok, Anzeige und Gedächtnis für Opus.

## 4. Teil B: Orte nach dem Bösewicht
**Neue Entscheidung:** Ist der Bösewicht einer Insel besiegt, fragt die Insel: **Was jetzt?** Heute folgt direkt die Beute. Neu: eine kurze Szene mit 2 bis 3 Wahlen, die bleiben.
- **Befreien:** *„Die Leute kommen aus ihren Häusern. Jemand hängt eure Flagge auf.“* Kurz: weniger Berry jetzt. Lang: Der Ort mag dich (Markierung ♥ in der Seekarte), beim nächsten Besuch ist der Laden billiger und ein Gerücht führt zu einem neuen Ort.
- **Plündern:** *„Die Kasse des Bösewichts ist schwer. Die Leute schauen schweigend zu.“* Kurz: deutlich mehr Berry. Lang: Der Ort ist misstrauisch, der Laden teurer, und die Kronwacht hört davon (später Ruf, Säule 4B).
- **Weiterziehen:** Nichts Besonderes, für Eilige.
- Wiederkehr: Der Besuch derselben Insel in einer späteren Fahrt beginnt mit einem Satz der Leute („Die Befreier sind zurück!“ oder „Versteckt das Silber!“). Das ist das „später erinnert“.
- Speicher: `profile.world.orte[inselId] = { tat, mal }`. Die Inselwahl-Karte (Wisch-Karten aus 22s) zeigt ein kleines Zeichen, wenn der Ort dich kennt.

## 5. Was neu gebaut werden müsste (für die spätere Bau-Phase)
- `profile.world` mit `bekannte` und `orte`, Kopie in `run.start.world`, Schreiben nach `finishRun`, Cloud-Sync (F0).
- `run.epiDone` und Wiedersehen-Varianten in `crewEpisodes` (z. B. Feld `again: [{ need, … }]` je Folge), Auswahl über `run.start.world`.
- Neue Szene nach dem Bösewicht (Phase im Run, ähnlich einem Zwischen-Event).
- Neue Ergebnis-Art `rabatt` (Laden-Preis in dieser Fahrt), sonst nur vorhandene Arten.
- Seekarte: Markierungen ♥, Steckbrief, Turm, Geisterschiff aus dem Gedächtnis (Logbuch).
- Siegel „⚓ Das wird man sich merken“ an Wahlen, die ins Gedächtnis schreiben.
- Eigene Welt: Folgen-Texte enthalten noch Vorlagen-Namen (z. B. „Log Port“, „Loguetown“), beim Bauen durch `neutral.js` prüfen bzw. mit Weltbau-Welle A neu benennen.

## 6. Offene Fragen (nächste Klick-Runde)
1. Wie oft kommt ein Bekannter wieder: höchstens ein Wiedersehen pro Fahrt, oder öfter?
2. Bleibt es bei einem Wiedersehen, oder darf eine Folge über viele Fahrten weiterwachsen (Teil 4, 5 …, z. B. Korken wird Crew-Mitglied)?
3. Die Entscheidung nach dem Bösewicht: drei Wahlen wie oben, oder anders?
4. Welche Bekannten bekommen zuerst ein Gesicht (Vorschau-Board mit Looks zum Abklicken)?
