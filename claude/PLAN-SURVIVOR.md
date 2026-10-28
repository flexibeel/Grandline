# Survivor-Idee: Inselsturm (Konzept v0)

Stand 28.10.2026 (54. Chat, Opus). **Erster schlichter Test gebaut**, Live-Spiel unverändert.

## Wie es dazu kam
- Angeln und Planet B ruhen (beide „geht, zieht aber nicht“). Felix hat danach seine Lieblingsspiele genannt: Pixel-Sandbox, Megabonk, Dwarves: Glory, Death and Loot, Wanderburg, Roguelikes (Pokelike), Cyberpunk, CoD, S4 League, Terrascape, Megaloot, Cossacks, Battlefield Heroes, Metin2.
- Gemeinsame Muster: **Loot und Builds, die stärker machen**, **selbst Action**, **gegen/mit Freunden**, **aufbauen/Armee**. Nichts Cozy oder Satirisches.
- Claudes ehrliche Einschätzung: Ein Survivor à la Megabonk bringt im Verhältnis zum Aufwand den meisten Spaß. Ein Arena-Shooter à la S4 hätte den höchsten Gipfel, lebt aber nur online mit Menschen (großer Brocken, ein Bot-Test sagt wenig).
- Felix' Idee aus dem Gespräch: den Survivor **in Grandline** bringen, weil Figuren, Rollen, Synergien, Formen, Bosse und Fortschritt schon da sind.

## Entscheidungen von Felix (28.10., per Klick)
- **Survivor wird der Kern von Grandline**, falls der Test zieht (jeder Kampf wird Action, die Fahrt bleibt als Karte). Weg 1 (eigener Modus im Hafen) und Weg 2 (nur einzelne Stationen spielbar) wären vorsichtiger gewesen.
- **Erster Test ganz schlicht:** Platzhalter-Grafik, um nur das Grundgefühl zu prüfen.

## Test 1 (gebaut)
- `prototyp/survivor/index.html` auf `feature/neuausrichtung`, privater Link https://claude.ai/artifact/Ly6PKehSwzTQbPjzaEh8Jr. Speicher nur im Browser (`inselsturm.v1`). Nur Deutsch.
- **Steuerung:** Daumen irgendwo aufs Feld und ziehen (schwebender Stick), am PC WASD/Pfeile. Angegriffen wird von selbst.
- **Waffen (je 5 Stufen):** Säbel (Startwaffe, Hieb zum nächsten Gegner), Pistole, Pulverfass, Kreisanker.
- **Verbesserungen (je 5 Stufen):** Schaden, Lauftempo, Feuertempo, Höchstleben, Sammelradius, Heilung pro Sekunde.
- **Crew (höchstens 4, je ★1–★3):** Bulle (Brecher, zieht Gegner auf sich, rammt), Klinge und Funke (Kämpfer, springen hin, Funke lässt brennen), Auge und Möwe (Schützen), Doc (Helfer, heilt).
- **Boni (wie die Rollen-Stufen in Grandline):** Sturmtrupp (2 Kämpfer), Salve (2 Schützen), Bollwerk (Bulle + Doc), Volle Crew (4 Piraten). Die Level-up-Karte zeigt, was ein Pirat aktivieren würde („Aktiviert: Sturmtrupp“ bzw. „Mit Doc: Bollwerk“).
- **Level-up:** 1 von 3, zweimal neu würfeln pro Lauf. In den ersten Leveln ist immer ein neuer Pirat dabei.
- **Ablauf:** Krabben, Matrosen, Brocken. 1:00 Krabbenflut, 2:00 und 3:30 Bootsmann Grimm (Schatztruhe = freie Wahl), 3:00 Brocken-Welle, 4:30 Umzingelt, **5:00 Kapitän Eisenbart** mit Warnflächen (Stampfer-Kreis, Ansturm-Linie, ruft Matrosen; ab halbem Leben schneller und doppelt).
- **Ende:** Zeit, Gegner, Level, Waffen, Crew, Boni, Bestwerte (schnellster Sieg, längstes Überleben, meiste Gegner).
- **Testregler:** dreimal schnell auf die Uhr tippen (+1 Minute, Boss jetzt, Level-up, unverwundbar).
- **Bot-Test** (9 Läufe, einfacher Ausweich-Bot, drei Wahl-Strategien): 6 Siege, 1 Niederlage, 2× Boss nicht geschafft; Sieg meist bei 5:55–6:50, Level 26–34, 1300–1900 Gegner. Crew-lastige und Waffen-lastige Builds liegen nah beieinander.
- Geprüft: Headless 390 px, keine Skriptfehler, kein Querscrollen.

## Testfragen an Felix
1. „Willst du sofort nochmal?“ (Abbruch wie bisher, wenn nicht klar Ja)
2. „Hat sich das Wählen beim Level-up spannend angefühlt, vor allem die Crew und die Boni?“
3. „Fühlt sich das schon nach Grandline an, oder nach etwas ganz anderem?“

## Wenn es zieht: grob der Weg (noch nicht abgestimmt)
1. Echte Grandline-Figuren (24 × 30) mit Lauf-Wippen statt Platzhaltern, dein eigener Pirat als Kapitän.
2. Das Deck wird der Piraten-Pool, Rollen-Stufen, Duos und Banden aus den Daten werden die Boni.
3. Die Fahrt (Kurswahl, Meere, Bosse) bleibt als Karte, jeder Kampf ist eine kurze Survivor-Runde.
4. Später vielleicht Koop mit Freunden.
Technik: eigener Canvas für den Kampf (das DOM schafft keine hunderten Gegner am Handy), Replays und Duelle müssen neu gedacht werden.

## Urteil zu Test 1 und Suche nach dem eigenen System (28.10., 17:30)
- Felix: „Zocken kann man es, aber gibt's so ein Game nicht schon tausend mal? Es muss was Neues rein oder ein eigenes System.“
- Marktcheck: Survivor mit Piratenschiff gibt es (Ocean Survivors), fahrende Festung als Survivor auch (Wanderburg), Extraction-Survivors auch (Hellforged, Survivor Mercs). Neu wird es nur durch eine Kombination, die Grandline hat.
- Vier Kandidaten, **Felix findet alle vier reizvoll** (per Klick), will aber erst weiter reden statt bauen:
  1. **Crew mit eigenem Willen:** Launen, Wünsche mitten in der Runde („Den Brocken krieg ich!“), Duos entstehen durchs Nebeneinander-Kämpfen, Vernachlässigte schmollen oder gehen von Bord, die Nähe des Kapitäns feuert an. (Claudes Favorit, so nicht gefunden.)
  2. **Plündern und rechtzeitig ablegen:** Beute als Ladung, länger bleiben = mehr, aber gefährlicher; wer beim Ablegen fehlt, bleibt zurück.
  3. **Schiff mit Deck-Raster:** Piraten auf Deck-Plätze setzen (nah an Wanderburg/Ocean Survivors).
  4. **Rivalen, die sich erinnern:** Wer dich schlägt, steigt im Kopfgeld und kommt wieder (nur einfache Form, das volle Nemesis-System ist patentiert).
- Claudes Gedanke dazu: Die vier passen als **eine Schleife** zusammen (Schiff = Zuhause mit Deck-Raster, Insel = Survivor mit eigenwilliger Crew, Ende jeder Insel = rechtzeitig ablegen, Rivalen kehren über mehrere Inseln wieder). Aber nicht alles auf einmal bauen: zuerst das testen, was am neuesten und unsichersten ist (Crew mit eigenem Willen).

## Trends, Schmied, Sozialsystem, Questgeber (28.10., 17:36, Felix fragt ehrlich und kritisch)
**Was die beliebten Spiele gerade zeigen (Recherche):**
- **Megabonk** (1 Mio. in ca. 2 Wochen): sofort Spaß, Zahlen explodieren, Bewegung macht selbst Spaß. → Den Kern nicht verkomplizieren.
- **Koop mit Freunden („Friendslop“: PEAK, R.E.P.O., Schedule I)** ist der größte Indie-Trend. → Passt zu S4/BF Heroes, technisch im Browser aber ein großer Brocken, erst später.
- **ARC Raiders** (stark steigend): rausholen oder alles verlieren. → Stützt „Plündern & ablegen“.
- **CloverPit / Balatro:** eine einfache Maschine, viele Gegenstände, die sie verbiegen, eine wachsende Schuld als Druck. → Klares Ziel mit Druck.
- **Hades II, Cult of the Lamb, Moonlighter 2, HAWKER:** Basis zwischen den Runs wächst mit. → Hafen mit Schmied passt.
- **Darkest Dungeon:** Stress und Ausraster der Helden, Helden können für immer verloren gehen. → „Crew mit eigenem Willen“ ist also nicht ganz neu, im Survivor aber schon.
**Schmied à la Metin2:** passt (Felix mag es, langes Ziel, Grandline hat schon Ausrüstung in `gear.js`/`crewgear.js`). Kritik: Zerstören bei Fehlschlag frustriert, Dauer-Stärke macht Runs leicht, Grind verdrängt Entscheidungen. Vorschlag: Ausrüstung der **Crew** schmieden (+1 bis +9 mit sinkender Chance, Fehlschlag = Riss statt Zerstörung), Boni neu würfeln mit Festhalten, nichts gegen Echtgeld. Erst bauen, wenn der Run-Kern zieht.
**Sozial-/Gesundheitssystem:** Planet B hat gezeigt, dass ein Spiegel ohne Spielfolge nicht wirkt. Nicht als Predigt einbauen, sondern als **Piratenkodex** im Hafen: Echte Piraten hatten Beuteanteile, eine Kasse für Verletzte (Roberts: 800 Achterstücke für ein verlorenes Glied) und wählten den Kapitän per Mehrheit ab (Wikipedia „Pirate code“). Im Spiel: Beute teilen, Verletztenkasse und Lazarett zahlen oder sparen (Geld für den Schmied), die Crew stimmt über dich ab. Hängt direkt an „Crew mit eigenem Willen“ und Felix' Idee mit Demokratie.
**Questgeber auf der Karte:** in kleiner Form gut (Aufträge auf der Insel geben dem Survivor eine Richtung, z. B. „Rette den Fischer“, „3 Scheren für die Köchin“), große Questgeber im Hafen zwischen den Runs. Gefahr: Text lesen mitten im Getümmel.
**Größte Gefahr: Funktionswucher.** Deshalb ein Kernsatz, an dem sich alles messen lassen muss, und eine feste Test-Reihenfolge (siehe Antwort im 54. Chat).

## Stand 28.10., 17:45
- **Schmied à la Metin2 ist raus** (Felix: nicht überladen).
- Reihenfolge abgesegnet (1 Crew-Wille, 2 Ablegen, 3 Hafen/Kodex, 4 Rivalen/Questgeber, 5 Koop), **der Kernsatz aber noch nicht**: Felix hat „Crew-Wille als Kern“ und „Schiff auf Pump: plündern, Beute an Bord, Rate zahlen“ (Trend-Mix aus CloverPit-Schuld, Megabonk-Getümmel, ARC-Raiders-Rückweg) beide mit Nein beantwortet, ohne Begründung. Nächster Schritt: herausfinden, was ihn stört, bevor etwas gebaut wird.

## Wer spielt es (28.10., 17:42–17:50, Felix)
- Freunde sind meist **ADHS-Spieler**, zocken gerade **World of Warcraft** („also cozy“).
- Per Klick: **PC und Handy**; Gruppe **5 oder mehr, aber auch allein** („Megabonk zockt man allein, aber über die Bestenliste“); **gemeinsamer Hafen, Runden allein** (Koop später); Richtung „WoW-Dungeon in 10 Minuten mit Rollen“: **Nein**.
- Felix fragt: **Muss es die Piratenwelt sein, oder gibt es Besseres?**
- Folgerung: Sozial heißt hier **asynchron** (Bestenliste, gemeinsamer Hafen, Spuren der Freunde), nicht Live-Koop. Das ist billiger und passt zu Grandlines vorhandener Tagesfahrt/Rangliste.

## Neue Richtung: „echte Welt“ (28.10., ca. 17:55)
- „Teuer“ erklärt: Live-Koop kostet wenig Geld (grob 40.000 Supabase-Nachrichten pro 10-Min-Runde zu fünft; Free 2 Mio./Monat, Pro 25 $ mit 5 Mio.), aber viel Bauaufwand (Schätzung 4–8 Chats). **Spuren der Freunde** (Felix' Wahl, per Klick): ein paar KB pro Runde, praktisch kostenlos, ca. 1–2 Chats.
- Welten vorgeschlagen: Ameisenvolk (Claudes Favorit: Schwärme, Duftspuren, Pflege von Verletzten wie bei Matabele-Ameisen), Waschbärenbande, Spielzeug, Supermarkt am Black Friday, Spukhaus, Piraten.
- **Felix feiert den Supermarkt-Gedanken: „echte“ Welt mit verschiedenen Maps** (Stadt, Supermarkt, Naturschutzgebiet …).
- Marktcheck: Büro-/Mindestlohn-Survivors gibt es schon (Don't Forget to Smile, Tech Survivor mit Moral statt Leben), Supermarkt-Roguelike auch (Aisle Survive). Eigen wäre: **jede Map spiegelt ein System des Alltags mit eigener Regel** (Amt, Krankenhaus, Wohnungsmarkt, Natur, Bahn), Alltagshumor aus dem deutschsprachigen Raum, Spuren der Freunde als Post-its/Notizen.
- Leitplanke: Gegner sind **Dinge des Systems** (Formulare, Prospekte, Wartenummern, Mieterhöhungen, Bagger), nicht Gruppen von Menschen.

## Entscheidungen 28.10., ca. 18 Uhr (Felix, per Klick)
- **Erste Map: Supermarkt am Black Friday.** Spieler: **eigene Figur bauen**. Ton: **albern mit Biss**.
- Bauaufwand ist okay („hab das Abo … ich will ja ein geiles Game“). **Online und Koop kommen, wenn das Spiel steht.**
- Vorschlag Test 2 liegt vor (Figur bauen, Supermarkt mit Regalgängen, Gegner als Dinge: Prospekte, Einkaufswagen, Rabatt-Schilder, Kassenbon-Schlangen; Waffen: Preisauszeichner, Wischmopp, Durchsage, Korbwurf; alle 60 s „PREISSTURZ!“; Boss „Der Mega-Deal“ nach 5 Min; Spuren der eigenen früheren Runden als Post-its, ohne Server). Felix will vor dem Bauen **noch reden**.
