# Weltbau Welle B: Gegner und Bosse (Namensliste zum Lesen)

Stand 24.10.2026, Vorschlag von Claude. **Noch nichts gebaut.** Felix liest, streicht, ändert, dann baut Claude nach dieser Liste.
Entschieden per Klick (Felix/Jan, 24.10.): **Name überall neu** (auch wo ein Gegner anheuerbare Figur ist, Look kommt erst mit Welle C) · **erst Liste, dann bauen** · **Raid-Bosse gehören zur Krone** (Kronwacht-Admirale, Rotmantel als freier Rivale) · **Fußvolk kommt mit rein**.
Regeln: ids, Werte, Looks und Fähigkeiten bleiben, nur Name und Text ändern sich. Eigennamen gleich in DE und EN, nur Beinamen werden übersetzt. ★ = ist auch anheuerbare Figur (`crew.js`), heißt dort dann genauso.

## Bosse (`GL.data.bosses`) und Signaturen (`bossSigs`)
| id | heute | neu DE / EN | Fraktion | Signatur neu DE / EN |
|---|---|---|---|---|
| smoker ★ | Smoker | Hauptmann Russ / Captain Russ | Kronwacht | Rußwolke / Soot Cloud |
| arlong ★ | Arlong | Zackenmaul Brack / Sawjaw Brack | Flossenvolk | Sägezahn-Sturm (bleibt) |
| crocodile ★ | Crocodile | Sandbaron Sirokk / Sand Baron Sirokk | Freibeuter der Krone | Sandgrab / Sand Grave |
| enel ★ | Enel | Himmelsherr Zirrus / Sky Lord Zirrus | Einzelgänger | Wolkenbruch / Cloudburst |
| rob-lucci ★ | Rob Lucci | Agent Krall | Schattenkorps | Krallenhieb / Talon Strike |
| kaku ★ | Kaku | Agent Stelz | Schattenkorps | Sturmschnitt (bleibt) |
| hody ★ | Hody Jones | Grimmflosse / Grimfin | Flossenvolk | Wutpille / Rage Pill |
| vander | Vander Decken IX | Kapitän Ankerlos / Captain Anchorless | Flossenvolk | Zielmarke (bleibt) |
| moria ★ | Gecko Moria | Graf Dämmerling / Count Dusk | Freibeuter der Krone | Dämmerklau / Dusk Snatch |
| kuma ★ | Bartholomew Kuma | Tatz, der stille Bär / Tatz, the Silent Bear | Freibeuter der Krone | Bärenblase / Bear Bubble |

## Raid-Bosse (`GL.data.raids`)
| id | heute | neu DE / EN | Fraktion | Signatur neu DE / EN |
|---|---|---|---|---|
| kizaru | Admiral Kizaru | Großadmiral Glanz / Grand Admiral Glanz | Kronwacht | Funkentritte / Spark Kicks |
| doflamingo ★ | Doflamingo | Fadenkönig Rosé / Thread King Rosé | Freibeuter der Krone | Fadennetz / Thread Net |
| teach | Blackbeard | Käpt'n Schlund, der Nimmersatt / Captain Schlund, the Bottomless | eine der zwei Flotten | Großer Happen / Big Gulp |
| shanks ★ | Rothaar Shanks | Rotmantel Fenn / Redcloak Fenn | die andere Flotte (frei) | Strenger Blick / Stern Gaze |

## Gejagte (`GL.data.hunted`)
**Ostmeer:** morgan Axt-Hand Morgan → Beil-Bodo / Hatchet Bodo (Kronwacht) · buggy ★ Buggy → Gaukler Pomp / Pomp the Juggler (Zirkus der Narren) · kuro Kuro → Diener Fingerling / Fingerling the Butler · krieg Don Krieg → Don Bollwerk / Don Bulwark · hatchan ★ Hatchan → Acht-Arm Okko / Eight-Arm Okko (Flossenvolk) · jango Jango → Pendel-Pit / Pendulum Pit · gin Dämon Gin → Knüppel-Kalle / Cudgel Kalle · pearl Eisenwand Pearl → Topfdeckel-Tom / Potlid Tom · chew Chew → Spuckfisch Plitsch / Spitfish Plitsch.
**Wilde See (Barock-Bund, Agenten nach Wochentagen):** mr1 ★ Mr. 1 → Herr Sonntag / Mister Sunday · mr3 Mr. 3 → Herr Mittwoch / Mister Wednesday · mr4 Mr. 4 & Lassoo → Herr Donnerstag & Bello / Mister Thursday & Bello · mr9 Mr. 9 → Herr Montag / Mister Monday · zala Miss Doublefinger → Fräulein Samstag / Miss Saturday · ohm Ohm → Priester Funk / Priest Funk · wapol Wapol → König Mampf / King Munch · bellamy Bellamy → Sprungfeder Bax / Springheel Bax.
**Tiefsee (Flossenvolk):** hyouzou Hyouzou → Tintenklinge Rako / Inkblade Rako · zeo Zeo → Tarnfisch Lumi / Camo-fish Lumi · daruma Daruma → Buddelhai Mops / Digger Shark Mops · dosun Dosun → Hammerhai Bumm / Hammerhead Bumm · ikaros Ikaros Much → Kalmar Zehnfuß / Tenfoot the Squid.
**Gerichtsinsel (Schattenkorps):** fukuro ★ Fukuro → Agent Plapper / Agent Chatter · nero Nero → Agent Stichel / Agent Needle · spandam Spandam → Oberamtmann Wichtig / Chief Clerk Wichtig · blueno ★ Blueno → Agent Riegel / Agent Bolt · jabra ★ Jabra → Agent Wolfram · wanze Wanze → Agent Nudel / Agent Noodle · foxy Foxy → Käpt'n Schummel / Captain Fiddle.
**Gruselmeer:** absalom ★ Absalom → Unsichtbar-Ulf / Invisible Ulf · perona ★ Perona → Fräulein Huschel / Miss Hush · hogback ★ Dr. Hogback → Doktor Flick / Doctor Patch · duval Duval → Masken-Moritz / Masked Moritz.

## Fußvolk (`GL.data.grunts`)
marine Marinesoldat → Kronwächter / Crown Guard · seaking Seekönig → Tiefseeriese / Deep Giant · momoo Seekuh Momoo → Seekuh Muhli / Sea Cow Muhli · bananacroc Bananen-Krokodil → Gelbkamm-Krokodil / Yellowcrest Croc · mo-fischmensch Fischmensch → Flossling / Finling. Alle übrigen (Pirat, Söldner, Schläger, Tiere, Sanitäter usw.) sind schon allgemein und bleiben.

## Was beim Bauen mitläuft
- Die Namen stehen auch in Texten anderer Dateien (Story, Freischaltungen, Duos, Verliese, Neuigkeiten, Artefakte, Englisch-Dateien `en*.js`). Das Prüfskript `tools/weltbau-check.py` bekommt Liste B und muss am Ende 0 Funde melden.
- „Seekönig“ und „Fischmensch“ stecken in vielen Texten (Tiere, Kosmetik, Fraktion der Figuren). In Welle B nur dort, wo der Gegner gemeint ist, der Rest (Figuren-Fraktion) gehört zu Welle C.
- Beinamen der Figuren in `crew.js` (★) bekommen den neuen Namen, Look und Fähigkeitsnamen der Figur bleiben bis Welle C.
- Prüfung: Prüfskript, `node --check`, Replays unverändert (nur Texte), Kampf am Handy einmal in DE/EN mit Signatur-Ansage.

## Fragen an Felix (beim Lesen)
1. Passen die Wochentags-Agenten für den Barock-Bund?
2. Welche Namen streichen oder ändern? Einfach in dieser Datei markieren oder im Chat sagen.
