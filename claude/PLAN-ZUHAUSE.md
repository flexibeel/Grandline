# 9f Mein Zuhause: Skizze (46. Chat, Sonnet, 25.10.)

Felix (25.10.): Der Ort, an dem man sich nach jedem Run neu ordnet (Kontor, Schiff, Profil), soll sich mehr nach „mein Zuhause“ anfühlen und sich gestalten lassen.
Felix per Klick (46. Chat): **alle vier Richtungen** (Kajüte, Profilkarte, Schiff, lebendiger Hafen), **nur Kosmetik**, keine Werte. Das hier ist nur die Skizze, **noch nichts gebaut**.

## Ist-Stand (aus dem Code, Stand `main` 25h)
Vieles zum „Gestalten“ gibt es schon, es fehlt vor allem **ein Ort**, an dem man es sieht und einrichtet.
- **Profil-Editor** (`render.js` ~Z. 4246 bis 4320): Hintergründe (31), Rahmen (27), Titel (63), Flaggen (23) und Abzeichen (13), alle aus `js/data/cosmetics.js` und `badges.js`, freigeschaltet über `req` (Rang, Läufe, Kopfgeld-Stufe, Bindungen), `GL.meta.cosmeticUnlocked`.
- **Schiff anpassen** (`js/data/shipparts.js`, `profile.ship`, Klick `ship-pick`): Segel, Rumpf, Flagge, Galionsfigur (4 Gruppen), nur Optik, wird im Hauptquartier, auf dem Startbild, auf der Seekarte und online (`online.js` ~Z. 709) gezeigt.
- **Werft-Upgrades** sichtbar am Schiff (`profile.upgrades`, 22k), **Begleiter** (`profile.pets`), **Vitrine** im Kontor (Raritäten, Raid-Funde), **Stil-Dojo**, **Stammcrew**.
- Hafen und Kontor sind seit 24c Gebäude (Kontor, Taverne, Dock, Tafel), die Räume stehen in `ROOM_GROUPS` (`render.js` ~Z. 4872).
- **Nicht da (nach Durchsicht, bitte beim Bauen noch einmal prüfen):** ein Schiffsname, eine Kajüte, ausgestellte Fundstücke auf der Profilkarte, ein Hafen, der auf Fortschritt oder Tageszeit reagiert.

## Vorschlag: vier Häppchen, klein anfangen
**A. Schiffsname und Profilkarte als Schaufenster (Sonnet).**
Neu `profile.shipName` (kurz, höchstens ~16 Zeichen) und `profile.showcase` (bis zu 3 ausgestellte Fundstücke aus der Vitrine). Die Profilkarte zeigt Schiff, Name, Titel, Rahmen und die drei Stücke. Online sichtbar: **der Name braucht denselben Textfilter wie der Pirat** (nachsehen, was `online.js` dort schon tut), sonst nur lokal.
**B. Die Kajüte (Opus, Pixel-Art).**
Ein neuer Raum im Kontor (`ROOM_GROUPS.kontor`, Segment `kajuete`): eine kleine Pixel-Kajüte im Querschnitt mit fünf Plätzen: **Fenster** (Ausblick = ein freigeschalteter Hintergrund), **Wand** (Wandbild oder Flagge), **Boden** (Teppich), **Tisch** (eine Kleinigkeit) und **Platz für den Begleiter** (ein Tier aus `profile.pets` liegt oder sitzt dort). Zum Start rund 12 Einrichtungsstücke, vieles aus vorhandenen Dingen (Hintergründe, Flaggen, Fundstücke), dazu wenige neue, freigeschaltet wie Kosmetik (`req`). Speicher: **ein neues Feld `profile.cabin = { window, wall, floor, table }`**, `migrate()` füllt Standardwerte (kein Neustart nötig).
**C. Der Hafen lebt mit (Opus, Leistung beachten).**
Reine Anzeige im Hafenbild: **Tageszeit nach der Uhr des Geräts** (Morgen, Tag, Abend, Nacht), **Wimpel und Laternen nach Piratenrang**, ein paar **Gäste aus der Stammcrew** am Steg. Lehre aus 9a: nur `transform` und `opacity`, keine Dauer-Animationen mit `box-shadow` oder `filter`, am Handy nichts Dauerndes.
**D. Besuch (später, nur wenn A bis C gefallen).** Die Kajüte und das Schaufenster eines Freundes ansehen (Freundesliste `friends.js`). Braucht Online-Speicher, deshalb eigenes Okay.

## Regeln für alle Häppchen
- Nur Kosmetik, **keine Spielwerte, keine Kampfrechnung**. Neue Stücke immer mit DE/EN und Eintrag in `neutral.js`.
- Neue Profil-Felder nur mit `migrate()`-Standardwert, keine Löschung, **kein zweiter Neustart**. Replay-sicher, weil nichts davon im Run steckt.
- Zuerst ansehen und mit Felix abstimmen, dann bauen (Pixel-Art ist Felix' Kunst, Looks als Vorschau zeigen).

## Offen für Felix
1. **Reihenfolge:** A zuerst (klein, sofort sichtbar), dann B (die Kajüte), dann C? Oder die Kajüte vor allem anderen?
2. **Kajüte:** Querschnitt wie ein Puppenhaus (Empfehlung) oder Blick von oben?
3. **Schiffsname:** nur für dich sichtbar, oder auch für andere (Rangliste, Freunde)? Das bringt den Textfilter ins Spiel.

## Entscheidungen (46. Chat, 25.10.)
Felix per Klick, alle wie empfohlen: **1.** Reihenfolge **A, dann B, dann C** (D später). **2.** Kajüte als **Querschnitt wie ein Puppenhaus**. **3.** Schiffsname **nur für den Spieler sichtbar** (kein Textfilter, nicht in `online.js`, nicht in Rangliste oder Freundesliste).
Damit ist Häppchen A freigegeben: `profile.shipName` und `profile.showcase` (bis zu 3 Vitrinen-Stücke), nur lokal, `migrate()` mit Standardwert, Profilkarte zeigt Schiff, Name, Titel, Rahmen und die ausgestellten Stücke. Sonnet reicht. Zweig `feature/zuhause-schaufenster` von `main`.
