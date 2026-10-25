# 9e Kampftypen erkennbar machen: Skizze (40. Chat, Sonnet, 25.10.)

Felix (25.10.): Kämpfe fühlen sich gleich an, Boss/Raid/Normal sind nicht zu unterscheiden, wenig Entscheidungsgewalt.
Felix per Klick: **zuerst die Kampftypen erkennbar machen**. Alle vier Gefühle treffen zu (sehe nicht, was los ist · kann zu wenig tun · fühlt sich gleich an · meine Wahl bringt wenig). Das hier ist nur die Skizze, **noch nichts gebaut**. Entscheidungen und spürbare Boni kommen danach als eigene Pakete (Punkt 2c).

## Ist-Stand (aus dem Code)
- Kampfarten (`battle.kind`): normal, `elite`, `faction`, `boss`, `raid`, `duel`.
- Optisch heute: **Raid** hat ein eigenes violettes Feld (`.field.raid`), **Boss** nur roten Rahmen (`.arena.bossfight`) und eine kurze Ansage `bossIntro` (`js/ui/arena.js` ~Z. 527, 2,3 s, Kinoleisten plus Namenskarte), eine Boss-Leiste oben (`boss-bar`). **Elite, Fraktion und Normal** laufen auf dem Insel-Feld, ohne eigenen Auftritt. Ton: nur `sting('dramatic')` an Wendepunkten, **kein eigener Klang je Kampfart**.
- Im Kampf selbst: Signatur-Ansage mit Aufladebalken (2c-1), Kapitänsbefehle, Werte-Tafel, Tempo ×1/×2.

## Idee: jede Kampfart bekommt ein eigenes Gesicht
Vier Schalter, je Kampfart anders eingestellt (alles reine Anzeige, keine Spiellogik):
1. **Auftritt (Ansage vor dem Kampf):** Normal: kein Banner, direkt los. Elite: kurzes Wort „Elite“ (≈1 s). Boss: Kinoleisten wie heute, aber mit dem Boss-Sprite groß im Bild. Raid: wie Boss, dazu das Wort „Raid“ und ein Schlag auf den Bildschirm (`fx-shake`). Duell: „Duell“ mit beiden Namen.
2. **Bühne (Feld):** Boss bekommt wie der Raid ein **eigenes Feld**, aber je Meer anders getönt (dunkler Himmel, Boss-Arena am Horizont) statt nur roter Rahmen. Elite: leichter Farbstich und Banner-Fahne. Normal bleibt das Insel-Feld.
3. **Gegner (Größe und Leiste):** Boss/Raid-Gegner größer (z. B. 1,4×) und mit der Boss-Leiste, Elite mit goldenem Rand am Namen, Normale unverändert. Größe nur per CSS-Klasse, kein neues Raster.
4. **Ton:** je Kampfart ein kurzer Stinger beim Auftritt (Elite, Boss, Raid je eigen), vorhandene `GL.sfx.sting`-Töne nutzen, nur wenn passende da sind, sonst Auswahl für Felix.

## Häppchen
**A. Auftritt und Beschriftung (Sonnet reicht).** `bossIntro` zu `kindIntro(run)` ausbauen: eine Tabelle `KIND = { elite, boss, raid, duel, normal }` mit Text, Dauer, Schlag ja/nein. DE/EN, Namen laufen durch die eigene Welt. Nur `arena.js` und CSS.
**B. Bühne und Größe (Opus, Optik).** Boss-Feld je Meer (`isl-…`) und Elite-Look in `style.css`, `fieldUnit` bekommt Klassen für Größe. **Leistung beachten (Lehre aus 9a):** nur `transform`/`opacity`, keine Dauer-Animationen mit `box-shadow` oder `filter`.
**C. Ton (Sonnet, wenn Töne vorhanden).** Stinger je Kampfart. Felix hört Auswahl, dann einbauen.

## Danach (eigene Pakete, noch nicht skizziert)
- **Mehr Entscheidungen:** „Antwort wählen“ (Pause mit Verteidigen/Ulti/Fokus bei einer Boss-Ansage) und eventuell Taktik vor dem Kampf (Aufstellung oder ein Kampfbefehl wählen).
- **Boni spürbar:** Formen, Duos, Stil-Kombos zeigen im Kampf sichtbar ihre Wirkung (Zahl, Effekt, Moment).

## Nicht jetzt
Kein Eingriff in die Kampfrechnung (`battle.js`), keine Balance, kein neuer Spielstand, kein größeres Kampffeld (das ist Punkt 8).

## Offen für Felix
1. Soll **jeder** Boss ein eigenes Feld bekommen (Aufwand je Meer) oder reicht ein gemeinsamer „Boss-Look“ je Meer?
2. Elite: eigener Auftritt (kurzes Wort) oder nur der goldene Rand?
3. Ton: Gibt es einen Wunsch (dumpfe Trommel für Boss, Sirene für Raid), oder soll Claude Vorschläge zum Anhören sammeln?

## Entscheidungen und Stand (41. Chat, Sonnet, 25.10.)
Felix per Klick: **1.** ein gemeinsamer **Boss-Look je Meer** (nicht je Boss ein Feld, gilt für Häppchen B), **2.** Elite bekommt **kurzes Wort plus goldenen Rand**, **3.** Ton: **Claude sammelt Vorschläge zum Anhören** (Häppchen C).

**Korrektur zum Ist-Stand:** Der große Auftritt für Boss, Raid und Bösewicht läuft schon vor dem Kampf in `startFight` (`js/main.js`, `.boss-show`: Figur fährt ins Bild, antippbar, nach 2 s automatisch). `bossIntro` in `arena.js` war toter Code (nirgends aufgerufen) und ist durch `kindIntro` ersetzt. Fast jeder Elite-Knoten trägt ein Kopfgeld-Ziel (`who`, in der Engine `mini`) und läuft deshalb auch durch `startFight`.

**Häppchen A gebaut** auf `feature/kampftypen-auftritt` (nur Anzeige):
- `arena.js`: Tabelle `KIND` und `kindIntro()`: Elite **ohne** Kopfgeld-Ziel bekommt ein kurzes Banner „Starke Gegner / Elite“ (1,1 s, nur `transform`/`opacity`). Normale Kämpfe bleiben ohne Banner. Elite-Arena trägt die Klasse `elitefight`.
- CSS (Block „9e A“ am Ende): goldener Rand und ★ am Namen der Gegner im Elite-Kampf; **Raid:** Schlag aufs Bild (`bs-slam`, per `translate`) beim Einfahren des Raid-Bosses; mit „Weniger Bewegung“ alles aus.
- `main.js`: Kartenzeile der Boss-Show heißt bei Elite „Elite · Kopfgeld-Ziel“ (Bösewicht der Insel, Boss, Raid unverändert). `i18n.js`: zwei neue Texte.
- Das Wort „Raid“ steht schon als „Raid-Boss“ auf der Boss-Show, das Duell hat seinen Auftritt („Begegnung auf See“), beide unverändert.
- Offen: B (Boss-Look je Meer, Elite-Look, Größe, Opus), C (Ton, Vorschläge sammeln).
