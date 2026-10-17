# Grand Line

Ein One-Piece-Roguelike für den Browser, aufgebaut wie Pokelike.

Inoffizielles Fanprojekt, nicht verbunden mit Eiichiro Oda, Shueisha oder Toei Animation.
Kostenlos und ohne kommerzielle Absicht. Kein Geld damit verdienen (keine Werbung, keine Käufe).

## Spielen

Doppelklick auf `index.html`. Das Spiel öffnet sich im Browser und speichert
deinen Run automatisch, du kannst den Tab also jederzeit schließen.

## Ordner

```
index.html          Die Spielseite
css/style.css       Aussehen (Farben, Schrift, Layout)
js/data/            Inhalte: hier passiert das meiste Erweitern
  config.js         Balancing: Heilung, Gegnerstärke, Punkte, Starter
  types.js          Kampfstile (Kraft, Klinge, Technik) und ihre Synergien
  roles.js          Rollen (Brecher, Kämpfer, Helfer) und ihre Synergien
  factions.js       Banden (Strohhutbande, Marine, CP9, Baroque Works) und ihre Synergien
  abilities.js      Eigene Fähigkeit jeder Figur und jedes Bosses
  traits.js         Zufällige Eigenschaften neuer Crewmitglieder
  crew.js           Crewmitglieder
  enemies.js        Normale Gegner und Bosse
  fruits.js         Teufelsfrüchte
  relics.js         Schätze, die den ganzen Run wirken
  islands.js        Inseln, mögliche Bosse und Texte der Routen
  unlocks.js        Was man wie freischaltet
  upgrades.js       Werft-Ausbauten im Hauptquartier
  gear.js           Ausrüstung für das Lager
  events.js         Ereignisse auf See
  heat.js           Kopfgeld-Stufen (Schwierigkeit)
  ranks.js          Piratenrang (Account-Level) mit Belohnungen
js/engine/          Spiellogik (ohne Grafik)
  rng.js            Zufall mit Seed, damit Runs nachspielbar sind
  meta.js           Dauerhafter Fortschritt: Freischaltungen, Sammelalbum
  loot.js           Seltenheit und ausgewürfelte Werte von Beute
  effects.js        Rechnet Synergien, Schätze und Fähigkeiten zusammen
  battle.js         Kampfsystem
  run.js            Ablauf eines Runs
js/ui/              Darstellung
  sprites.js        Pixel-Figuren und Symbole
  arena.js          Kampf-Arena mit Animationen
  render.js         Bildschirme
  save.js           Speicherstand und Bestwert
js/main.js          Verbindet alles und steuert die Klicks
tools/balance.html  Spielt tausende Runs automatisch und zeigt die Schwierigkeit
```

## Synergien (wie bei Teamfight Tactics)

Jede Figur hat drei Merkmale: Kampfstil, Rolle und Bande. Ab 2, 3 oder 4 Figuren
mit gleichem Merkmal schalten sich Boni frei. Unter der Crew siehst du, welche
Stufen aktiv sind. Beim Rekrutieren steht dabei, was eine Figur freischalten würde.

## Level, Statuspunkte und Beute

- **Leveln:** Crewmitglieder bekommen nach Siegen Erfahrung (Gefallene die Hälfte). Pro Level
  gibt es etwas Leben und 2 Statuspunkte. Klick auf eine Figur öffnet ihren Steckbrief,
  dort verteilst du die Punkte und siehst alle echten Kampfwerte.
- **Zufällige Crew:** Jedes Angebot hat Sterne (bessere Grundwerte), eine Eigenschaft
  (`js/data/traits.js`) und ein Level passend zur Crew.
- **Seltenheit:** Schätze und Teufelsfrüchte werden als Gewöhnlich, Selten, Episch oder
  Legendär gefunden und sind entsprechend stärker (`rarities` in `js/data/config.js`).
  Kopfgeldjäger lassen bessere Beute fallen.

## Hauptquartier

Zwischen den Runs bist du im Hauptquartier:
- **Berry** bekommst du am Ende jedes Runs, je weiter du kommst, desto mehr. Dazu kommen Berry aus Ereignissen.
- **Werft:** dauerhafte Ausbauten (`js/data/upgrades.js`).
- **Händler und Lager:** Ausrüstung kaufen und vor dem Ablegen mitnehmen. Sie wird dabei
  verbraucht (`js/data/gear.js`).

## Kopfgeld-Stufen und Piratenrang

- **Kopfgeld-Stufen** (`js/data/heat.js`): Nach einem Sieg wird die nächste Stufe frei. Im HQ
  wählst du die Stufe vor dem Ablegen. Jede Stufe macht das Spiel schwerer und bringt mehr
  Berry und Punkte. Es gibt 8 Stufen.
- **Piratenrang** (`js/data/ranks.js`): dein Account-Level über alle Runs, von Schiffsjunge bis
  Piratenkönig. Jeder Aufstieg bringt Berry, manche auch Ausrüstung.

## Design

Oben rechts kannst du zwischen hellem und dunklem Design wechseln. Beim ersten Start erscheint
eine kurze Anleitung, die du über „Anleitung“ jederzeit wieder öffnen kannst.

## Ereignisse auf See

Mit 20 % Chance nach einer Etappe passiert etwas, immer mit einer Wahl (`js/data/events.js`).

## Seekarte, Tipps und Kopfgeld
- Pro Insel gibt es eine Seekarte wie bei Pokelike (js/engine/run.js, genChart). Reihen von unten nach oben, Wege nur zu Nachbarn, oben der Inselboss. Raids liegen ab der 2. Insel mit config.raidChance auf der Karte.
- Tipps (js/ui/advice.js): höchstens ein goldenes „Tipp“-Abzeichen pro Bildschirm, nur wenn eine Wahl klar besser ist.
- Buff-Leiste links (wie TFT) ab breiten Bildschirmen: aktive Boni bronze/silber/gold, darunter „Fast geschafft“.
- Kopfgeld: jeder Inselboss erhöht das Kopfgeld des Kapitäns (30/120/400 Mio., mehr auf höheren Kopfgeld-Stufen). Ein Steckbrief fliegt in 3D ins Bild.
- Seltenheit: Werte in vals können eine Liste mit 4 Zahlen sein, eine pro Seltenheit (Gewöhnlich, Selten, Episch, Legendär).

## Kampfmechaniken, Spezialangriff, Kopfgeld-Ziele
- Zustände (GL.data.statuses in abilities.js) halten mehrere Runden: Furcht (-35 % Schaden), Betäubt (Aktion fällt aus), Blutung/Gift/Brand (Schaden pro Runde), Geschwächt (+25 % Schaden), Mut (immun gegen Furcht und Betäubung).
- Fähigkeiten verteilen Zustände über das Feld status: { key, rounds, when: start|hit|every, n, target: all|allies|front|target, chance, value }.
- Konter: Helfer der Crew reinigen am Rundenende je einen schlechten Zustand, Brecher sind immun gegen Furcht, Brook gibt Mut.
- Fähigkeiten zeigen „Fläche“ oder „Einzelziel“.
- Spezialangriff: Siege laden ihn auf (Kopfgeldjäger doppelt, config.specialMax). Gegen Inselbosse und Raids einsetzbar (Taste Q): großer Schaden, reinigt die Crew, 2 Runden Mut. Namen pro Kapitän in GL.data.specials.
- Kopfgeld-Ziele (js/data/hunted.js): Mini-Bosse auf den Kopfgeldjäger-Orten, mindestens eins pro Insel. Ihr Kopfgeld geht an den Kapitän (run.bountyM), dazu ein Schatz.
- Piratenrang: Medaille (Bronze/Silber/Gold/Legende), Belohnungsstraße aller Ränge, +2 % Berry pro Rang.

## Schatzkammer (Meta-Progression)
- Artefakte (js/data/artifacts.js) droppen von Inselbossen (35 %), Raids (immer) und Kopfgeld-Zielen (20 %), siehe config.trophyChance.
- Sie landen sofort dauerhaft in der Schatzkammer im Hauptquartier, auch wenn der Run danach verloren geht.
- Jeder weitere Fund hebt die Stufe: 1, 2, 4, 7, 11 Funde für Stufe 1 bis 5 (config.artLevels).
- Artefakt-Plätze: 1 zu Beginn, je einer mehr ab Rang 5, 9 und 13. Ausgerüstete Artefakte wirken in jedem Run.
- Erwachte Teufelsfrüchte aus Raids stehen ebenfalls in der Schatzkammer.

## Kampf in 3D, Rangliste, Duelle
- Kampffeld im Pokémon-Stil (js/ui/arena.js, fieldHtml): Crew vorne links, Gegner hinten rechts, Plattformen, Boden mit Perspektive. Angriffe je Kampfstil: Kraft = Einschlag, Klinge = Schnitt, Technik = Geschoss. Krits zoomen, K.o.s fallen um, Zustände leuchten als Aura.
- Online-Rangliste (js/ui/online.js): ein Eintrag pro Spieler (scores/<id>) mit Punkten, Schaden, härtestem Treffer, K.o.s, Kopfgeld, Bossen, Siegen, Rang und Artefakten. Kategorien wählbar.
- Duell: gleicher Seed für alle, ohne Werft, Lager und Artefakte (fair). Code teilen, Freund gibt ihn ein. Ergebnisse stehen pro Code in der Rangliste.
- „Spielstand komplett löschen“ unten im Hauptquartier setzt alles zurück (die Online-Einträge bleiben).

## Inseln wie in der Serie
- Jedes Meer hat 4 Stationen plus Inselboss (config.stepsPerIsland = 5), in islands.js unter stops: East Blue mit Shells Town, Orange Town, Syrup, Baratie und Loguetown oder Arlong Park; Paradies mit Whisky Peak, Little Garden, Drumm, Jaya und Alabasta oder Skypiea; Enies Lobby mit Long Ring Long Land, Water 7, Puffing Tom, Enies Lobby und dem Turm des Gerichts.
- villain = Kopfgeld-Ziel dieser Insel (hunted.js). Neu: Axt-Hand Morgan und Nero.
- Profil in der Rangliste: Name eintragen genügt, ein Run ist nicht nötig.

## Eigene Welt statt One Piece (Plug-and-Play)
- js/world/neutral.js ersetzt alle One-Piece-Namen (Figuren, Inseln, Früchte, Attacken, Berry, Titel) durch eigene. Ids und Spielstände bleiben gleich.
- Einschalten: in js/data/config.js `world: 'neutral'`. Zum Ausprobieren: index.html?welt=neutral (zurück: ?welt=onepiece).
- Eigene Namen: in neutral.js rechts den Text ändern. Eine weitere Welt: GL.worlds.meinewelt = { title, footer, map } nach demselben Muster.

## Taverne (Shop) und Gold
- Crewmitglieder kosten Gold (config.shop). Gold gibt es für Siege (Kampf 10, Kopfgeldjäger 16, Boss/Raid 28) plus Zinsen: je 10 gespartes Gold 1, höchstens 3.
- In der Taverne: kaufen (auch mehrere), neu würfeln (wird pro Besuch teurer), entlassen (gibt die Hälfte zurück), weitersegeln. Der Kapitän bleibt immer.
- Entlassen geht auch im Steckbrief außerhalb von Kämpfen. Tasten: R = neu würfeln, Leertaste = weitersegeln.

## Online-Rangliste mit eigener Datenbank
- In js/data/config.js unter `online` die Supabase-Adresse (url) und den öffentlichen Schlüssel (key) eintragen. Dann kann sich jeder mit dem Link eintragen (anonyme Anmeldung).
- Ohne Eintrag läuft die Rangliste über die geteilte Claude-Seite.

## Tastenkürzel

1 bis 9 wählt eine Option, Enter oder Leertaste startet den Kampf oder geht weiter,
F macht den Kampf schneller, S überspringt ihn und Esc schließt Fenster.

## Dauerhafter Fortschritt

- **Freischaltbare Kapitäne:** Wer Bosse oft genug besiegt, kann sie danach als Kapitän
  wählen und rekrutieren (Smoker, Crocodile, Lucci usw.). Jinbei, Ace und Law gibt es für
  besondere Erfolge. Bedingungen in `js/data/unlocks.js`.
- **Raids:** Ab der zweiten Insel taucht manchmal ein Raid auf. Wer gewinnt, schaltet eine
  epische Teufelsfrucht dauerhaft frei. Verlieren beendet den Run nicht.
- **Sammelalbum:** Oben rechts. Zeigt alle entdeckten Figuren, Bosse, Früchte und Schätze.
- Der Fortschritt wird im Browser gespeichert (`grandline.profile`). Wer die Browserdaten
  löscht, fängt von vorne an.

## Kampfstile

Jede Figur hat einen Kampfstil: Kraft schlägt Technik, Technik schlägt Klinge,
Klinge schlägt Kraft. Gegen einen schwächeren Stil gibt es doppelten Schaden,
gegen einen stärkeren nur halben. Festgelegt in `js/data/types.js`, die Faktoren
in `js/data/config.js`.

## Typische Änderungen

**Neue Figur:** In `js/data/crew.js` einen Eintrag kopieren, neue `id` vergeben,
Kampfstil, Rolle, Bande, Werte und Farben anpassen. Dann in `js/data/abilities.js`
eine Fähigkeit mit derselben `id` eintragen. Dort stehen oben alle Fähigkeitsarten,
die man wiederverwenden kann (z. B. `ramp`, `medic`, `revive`).

**Neuer Schatz:** In `js/data/relics.js` einen Eintrag kopieren. Werte wie Angriff
oder Rüstung gehen über `mods`, Sonderregeln über `flags` (oben in der Datei erklärt).

**Neue Teufelsfrucht:** In `js/data/fruits.js` einen Eintrag kopieren. Für ganz
neue Effekte muss in `js/engine/run.js` (Funktion `applyEffect`) Logik dazu.

**Neue Insel:** Boss in `js/data/enemies.js` anlegen, dann die Insel in
`js/data/islands.js` eintragen.

**Schwierigkeit:** Zahlen in `js/data/config.js` oder bei den Bossen ändern,
danach `tools/balance.html` öffnen und vergleichen. Der Test spielt zufällig,
echte Spieler schneiden deutlich besser ab.

## Für später vorbereitet

- Jeder Run speichert Seed und alle Entscheidungen (`run.seed`, `run.actions`).
  Mit `GL.run.replay(seed, actions)` lässt er sich exakt nachspielen. So kann ein
  Server später prüfen, ob ein Ranglisten-Eintrag echt ist.
- Die Spiellogik in `js/engine/` hat keinen Bezug zur Seite und läuft auch auf einem Server.
- Figuren können statt Pixel-Sprite ein Bild bekommen: Feld `image: 'img/ruffy.png'`.
