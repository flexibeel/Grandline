# Weltbau Welle C, Paket C1: Namensliste der 56 Figuren (zum Lesen)

Stand 24.10.2026. **Entwurf zum Lesen, nichts gebaut.** Für Felix. Danach folgen C2 (Namen einbauen), C3 (Pixel-Probe), C4 (Looks).

## Regeln
- ids, Werte, Synergie-Stufen und Typen bleiben. Nur Name, Beiname, Fähigkeits- und Ulti-Name und Geschichte ändern sich. Spielstände bleiben gültig.
- Eigennamen sind in DE und EN gleich, nur Beinamen und Fähigkeiten werden übersetzt.
- ★ = kommt schon aus Welle B und ist live. Der Name ist **fix**. Der volle Name steht dort mit Beiname davor (Beiname + Eigenname, z. B. Hauptmann Russ). In den Tabellen steht der Eigenname in der Spalte „neu“, der Beiname daneben.
- Namen aus `js/world/neutral.js` sind übernommen, wo sie taugen (Grimm, Hilde, Tessa, Kian, Kalina, Kordo, Mimo, Vina, Jonah, Asch, Lorn, Schwarzgurt als Beiname).
- Die 9 Sturmmöwen (Rafe, Soren, Nela, Lasse, Santo, Pipo, Rubina, Bolzen, Bruno) sind nicht Teil von C1. Sie tauchen nur in Duos auf, mit den Namen aus `neutral.js`.
- Gezählt: **56 Figuren** (65 minus 9 Sturmmöwen), darunter 20 mit ★.

## 1. Fraktionen: 12 Banden werden 8 Fraktionen
Die 12 Banden-ids bleiben (damit Stufen und Bündnisse unverändert laufen). Wo mehrere in eine Fraktion gehen, sind sie Unter-Banden mit eigenem Namen.

| heutige id | heute | geht in Fraktion | neuer Name DE / EN | Geschichte in einem Satz | Leitfarbe | Figuren |
|---|---|---|---|---|---|---|
| strohhut | Strohhutbande | Sturmmöwen | Sturmmöwen / Storm Gulls (keine Änderung, kommt zuletzt) | Die Spielerbande. | Blau-Weiß | 9 (nicht C1) |
| marine | Marine | Kronwacht | Kronwacht / Crown Watch | Die Ordnungsmacht der Krone: streng, pünktlich, mit Keksdose am Gürtel. | Messing-Rot | 6 |
| cp9 | CP9 | Schattenkorps | Schattenkorps / Shadow Corps | Der Geheimdienst der Krone: Anzüge, Aktenmappen und viel Geflüster. | Nachtviolett | 7 |
| baroque | Baroque Works | Barock-Bund | Barock-Bund / Baroque League | Geheimbund der Wilden See, die Agenten heißen nach Wochentagen und lieben Intrigen. | Bordeaux und Gold | 5 |
| revolution | Revolutionsarmee | Barock-Bund (Unter-Bande) | Gegenwind / Headwind | Der Flügel des Bundes, der sich nicht kaufen lässt und der Krone ständig ins Gesicht pustet. | Bordeaux, Akzent Salbei | 4 |
| fischmensch | Arlong-Bande | Flossenvolk | Flossenvolk / Finfolk | Das Volk der Tiefsee mit der Haifisch-Bande am rauen Rand und altem Groll auf alles Trockene. | Türkis | 5 |
| buggy | Buggy-Piraten | Zirkus der Narren | Pomp-Truppe / Pomp Troupe | Wanderndes Gauklervolk, jeder Auftritt endet mit Konfetti und Knall. | Magenta | 4 |
| supernova | Schlimmste Generation | Zirkus der Narren (Unter-Bande) | Die Wildfänge / The Rascals | Junge, laute Aufsteiger mit Masken, Karten und viel zu großen Plänen. | Magenta, Akzent Gelb | 6 |
| weissbart | Weißbart-Bande | Die zwei Flotten | Gischt-Flotte / Spray Fleet | Die große Familienflotte unter Käpt'n Gischt, bei ihr isst jeder mit. | Elfenbein | 4 |
| rothaar | Rothaar-Piraten | Die zwei Flotten | Rotmantel-Flotte / Redcloak Fleet | Die kleine freie Flotte, die ihr Käpt'n Fenn mit einem einzigen Blick ruhigstellt. | Mohnrot | 4 |
| samurai | Samurai der Meere | Freibeuter der Krone | Freibeuter der Krone / Corsairs of the Crown | Von der Krone bezahlte Piraten mit Kaperbrief und schlechtem Gewissen. | Tannengrün | 6 |
| thriller | Thriller-Bark-Piraten | Freibeuter der Krone (Unter-Bande) | Schauerbarken-Bande / Shiverbark Gang | Die höflichen Gespenster der Schauerbarke, bezahlt von Graf Dämmerling. | Tannengrün, Akzent Nebelgrau | 4 |

Dazu 1 **Einzelgänger** ohne Bande (Zirrus). Summe 6+7+9+5+10+8+10+1 = 56.

Zuordnung in einer Zeile: marine → Kronwacht, cp9 → Schattenkorps, baroque + revolution → Barock-Bund, fischmensch → Flossenvolk, buggy + supernova → Zirkus der Narren, weissbart + rothaar → Die zwei Flotten, samurai + thriller → Freibeuter der Krone, strohhut bleibt Sturmmöwen.

**Stufen-Texte in `factions.js`** ändern nur Wörter: „Fischmenschen“ → Flosslinge, „Samurai“ → Freibeuter, „Supernovas“ → Wildfänge, „CP9“ → Schattenkorps, „Haki:“ → Willenskraft:, „Königs-Haki:“ → Machtwort:. Die `scope`-Werte (`faction:fischmensch` usw.) sind interne ids und bleiben.

### Bündnisse (`GL.data.alliances`, damit nichts Altes übrig bleibt)
| Paar | heute | neu DE / EN |
|---|---|---|
| strohhut + revolution | Wille des D. | Wetterfront / Weather Front |
| marine + cp9 | Weltregierung | Kronrat / Crown Council |
| weissbart + rothaar | Treffen der Kaiser | Gipfel der Flotten / Summit of the Fleets |
| buggy + baroque | Impel-Down-Ausbruch | Großer Ausbruch / Great Breakout |
| fischmensch + samurai | Fischmenscheninsel | Tiefsee-Bund / Deep Sea Pact |
| strohhut + samurai | Piratenbündnis | Freibeuter-Pakt / Corsair Pact |
| revolution + marine | Familie Monkey | Familie Dickkopf / Hardhead Family |
| supernova + strohhut | Chaos auf Sabaody | Chaos im Blasenarchipel / Chaos in the Bubble Archipelago |
| thriller + baroque | Schattenspiel | Schattenspiel / Shadow Play (bleibt) |

## 2. Figuren (alle 56)
Spalten: id | heute (Name in `crew.js`) | neu | Beiname DE / EN | Fähigkeit neu DE / EN | Ulti neu DE / EN | Markenzeichen für den Look.

### Kronwacht (6)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| garp | Garp | Grimm | Altadmiral / Old Admiral | Dickschädel / Hardhead | Faust der Liebe / Fist of Love | weißer Schnauzer, Keksdose am Gürtel |
| hina | Hina | Hilde | die Fesselnde / the Binder | Handschellen / Handcuffs | Fesselkäfig / Cuff Cage | rosa Haar, Handschellen am Gürtel |
| tashigi | Tashigi | Tessa | die Schwertsammlerin / the Sword Collector | Recht und Ordnung / Law and Order | Nieselschnitt / Drizzle Cut | dicke Brille, Schwertscheide mit Schleife |
| koby | Koby | Kian | der Rekrut / the Recruit | Vorahnung / Foresight | Huschstoß / Dash Thrust | zu große weiße Kappe, rosa Schopf |
| smoker ★ | Russ | Russ | Hauptmann / Captain | Rauchkörper / Smoke Body | Rauchfaust / Smoke Fist | weißer Bürstenschnitt, graugrüner Mantel, Dampfpfeife |
| aokiji | Aokiji | Reif | der müde Admiral / the Sleepy Admiral | Eiszeit / Ice Age | Frostpause / Frost Break | Schlafmaske auf der Stirn, hellblauer Anzug |

### Schattenkorps (7)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| kalifa | Kalifa | Kalina | die Schreiberin / the Scribe | Seifenschaum / Soap Suds | Schaumbad / Bubble Bath | Brille, goldene Locken, Aktenmappe |
| kumadori | Kumadori | Kordo | der Schminkmeister / the Face Painter | Lebensrückkehr / Life Return | Zweiter Atem / Second Wind | rote Bühnen-Schminke, hohe Haartolle |
| blueno ★ | Riegel | Riegel | Agent / Agent | Eisenkörper / Iron Body | Stahlmantel / Steel Coat | schwarzer Hut mit Band, Schlüsselbund |
| jabra ★ | Wolfram | Wolfram | Agent / Agent | Wolfsgestalt / Wolf Shape | Wolfsrudel / Wolf Pack | schwarze Mähne, Klauenhandschuhe |
| rob-lucci ★ | Agent Krall | Krall | Agent / Agent | Sechs Künste / Six Arts | Stille Welle / Quiet Wave | schwarze Kappe mit kleinen Ohren, weißes Hemd |
| kaku ★ | Stelz | Stelz | Agent / Agent | Langbein-Klinge / Longleg Blade | Klingenwind / Blade Wind | weiße Kappe, extra hohe Stiefel |
| fukuro ★ | Plapper | Plapper | Agent / Agent | Stahlhaut / Steel Skin | Zeigefinger-Wirbel / Pointer Whirl | Reißverschluss am Mund, Bart |

### Barock-Bund (9: 5 Barock-Bund, 4 Gegenwind)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| bonclay | Bon Clay | Mimo | der Tänzer / the Dancer | Spiegeltanz / Mirror Dance | Pirouetten-Tritt / Pirouette Kick | rosa Federboa, Ballettschuhe |
| mr5 | Mr. 5 | Herr Freitag / Mister Friday | der Sprengmeister / the Blaster | Knallkörper / Firecracker | Niesbombe / Sneeze Bomb | schwarze Kappe, gelbe Weste, Rußflecken |
| vivi | Vivi | Vina | die Wüstenprinzessin / the Desert Princess | Oasen-Segen / Oasis Blessing | Fächerwind / Fan Breeze | himmelblaue Zöpfe, Wüstenschleier |
| mr1 ★ | Herr Sonntag | Herr Sonntag / Mister Sunday | der Klingenmann / the Blade Man | Klingenkörper / Blade Body | Sonntagsschnitt / Sunday Cut | grauer Anzug, Klingen statt Fingernägel |
| crocodile ★ | Sirokk | Sirokk | Sandbaron / Sand Baron | Sandsturm / Sandstorm | Sandklinge / Sand Blade | Pelzkragen, Sandglas am Gürtel, Narbe quer im Gesicht |
| sabo | Sabo | Jorin | der Flammenerbe / the Flame Heir | Flammenklaue / Flame Claw | Brandzeichen / Brand Mark | Zylinder mit Schutzbrille, blauer Gehrock, Narbe am Auge |
| ivankov | Ivankov | Lila | Königin des Kabaretts / Queen of the Cabaret | Wundertropfen / Wonder Drops | Wirbel-Zwinkern / Whirl Wink | riesige lila Haarwolke, Federkragen, Lippenstift |
| koala | Koala | Tilda | die Unauffällige / the Inconspicuous | Strömungs-Karate / Current Karate | Gezeitenstoß / Tide Thrust | orange Haare, Kappe, Notizbuch |
| dragon | Dragon | Rian | der Kapuzenmann / the Hooded One | Windwende / Wind Turn | Orkan / Hurricane | grüne Kapuze, Tattoo im Gesicht |

### Flossenvolk (5)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| arlong ★ | Brack | Brack | Zackenmaul / Sawjaw | Haifischzähne / Shark Teeth | Haipfeil / Shark Dart | lange Sägenase, gelbes Hemd, Zahnkette |
| hatchan ★ | Okko | Okko | Acht-Arm / Eight-Arm | Acht Klingen / Eight Blades | Tintenfaust / Ink Fist | Tintenfisch-Maske, gelbes Hemd, viele Ärmel |
| kuroobi | Kuroobi | Torn | Schwarzgurt / Black Belt | Stachelgarde / Spike Guard | Gürtelwelle / Belt Wave | schwarzer Gürtel, Kampfhandschuhe, Rückenflosse |
| chu | Chu | Prill | der Wasserschütze / the Water Gunner | Spritzsalve / Spray Salvo | Wasserkugel / Water Bullet | dicke Kussmund-Lippen, oranges Hemd, Schnorchel |
| hody ★ | Grimmflosse | Grimmflosse / Grimfin | - | Zorn-Schub / Rage Surge | Haisturz / Shark Dive | Haimaske, dunkler Mantel, rote Pillenflasche |

### Zirkus der Narren (10: 4 Pomp-Truppe, 6 Wildfänge)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| buggy ★ | Pomp | Pomp | Gaukler / Juggler | Zerleg-Trick / Split Trick | Konfetti-Kanone / Confetti Cannon | rote Nase, blaue Haare, Dreispitz mit Gold |
| alvida | Alvida | Hanne | die Glitschige / the Slippery | Glitschhaut / Slippery Skin | Rutsch-Keule / Slide Club | rosa Hose, Sonnenhut, große Keule |
| cabaji | Cabaji | Jockel | der Akrobat / the Acrobat | Akrobaten-Klinge / Acrobat Blade | Feuerakrobatik / Fire Acrobatics | rotes Kopftuch, Einrad, Jonglier-Messer |
| mohji | Mohji | Poldi | der Dompteur / the Tamer | Leo, fass! / Leo, sic 'em! | Löwenbrüller / Lion's Roar | weißer Haarkranz, Mähnenkragen, Peitsche |
| kid | Eustass Kid | Magnus | der Magnet / the Magnet | Magnetkraft / Magnet Pull | Schrottfaust / Scrap Fist | Fliegerbrille auf wilder roter Mähne, Metallarm |
| killer | Killer | Simon | Sichelträger / Scythe Bearer | Sichel-Tanz / Sickle Dance | Sichelsturm / Sickle Storm | gesichtslose Maske, blonde Mähne, zwei Sicheln |
| bonney | Bonney | Lotta | die Gefräßige / the Glutton | Zeitenwandel / Age Shift | Zeitstrudel / Time Twist | rosa Haar, grüne Mütze, riesige Fleischkeule |
| drake | Drake | Gregor | der Dino-Käpt'n / the Dino Captain | Dino-Form / Dino Form | Saurierbiss / Saurian Bite | Dreispitz, Schuppenmantel, Narbe |
| hawkins | Hawkins | Olin | der Kartenleger / the Card Reader | Puppenwechsel / Doll Swap | Fluchpuppe / Curse Doll | Kartenfächer, lila Mantel, blonde Locken, Strohpuppe |
| apoo | Scratchmen Apoo | Rondo | der Taktgeber / the Bandleader | Taktgefühl / Sense of Rhythm | Paukenwelle / Drum Wave | rotes Stirnband, Ohrring, Mundharmonika |

### Die zwei Flotten (8: 4 Gischt-Flotte, 4 Rotmantel-Flotte)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| ace | Ace | Asch | der Glühende / the Glowing | Glutfaust / Ember Fist | Glutball / Ember Ball | oranger Hut mit Lachgesicht, Sommersprossen |
| marco | Marco | Falk | die Blauflamme / the Blue Flame | Blaue Flammen / Blue Flames | Funkenregen / Spark Rain | lila Hemd, blaue Flammenfedern an den Armen |
| whitebeard | Whitebeard | Gischt | der Alte / the Old One | Bebenfaust / Quake Fist | Wellenbrecher / Wave Breaker | riesiger weißer Mondschnauzer, Stirnband, Mantel |
| vista | Vista | Veit | der Gärtner / the Gardener | Blütenklinge / Blossom Blade | Blütenmeer / Sea of Blossoms | Zylinder, gezwirbelter Schnurrbart, zwei Schwerter |
| shanks ★ | Fenn | Fenn | Rotmantel / Redcloak | Herrscherwille / Ruler's Will | Roter Schnitt / Red Slash | langer roter Mantel, zerzauster Schopf |
| beckman | Ben Beckman | Lenz | der Vize / the First Mate | Ruhiger Kopf / Cool Head | Gewehrkolben / Rifle Butt | dunkler Mantel, Bartstoppeln, Gewehr über der Schulter |
| roo | Lucky Roo | Brotz | der Bratmeister / the Roastmaster | Grillfleisch / Grilled Meat | Festmahl / Feast | Fleischkeule in der Hand, gelbe Kappe, Latzhose |
| yasopp | Yasopp | Piet | der Treffsichere / the Dead Eye | Meisterschütze / Master Marksman | Augenschuss / Eye Shot | Stirnband, langer Zopf, riesiges Zielrohr |

### Freibeuter der Krone (10: 6 Freibeuter, 4 Schauerbarken-Bande)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| jinbei | Jinbei | Jonah | der Steuermann / the Helmsman | Wellen-Karate / Wave Karate | Strudelwirbel / Whirlpool Spin | blaue Haut, Matrosenschal, kleines Steuerrad |
| law | Law | Lorn | der Chirurg / the Surgeon | Raumkuppel / Dome | Strahlenmesser / Ray Scalpel | weiße Fellmütze mit Flecken, Tattoos an den Händen, langes Schwert |
| mihawk | Mihawk | Silas | die Nachtklinge / the Night Blade | Schwarze Klinge / Black Blade | Mitternachtshieb / Midnight Strike | breiter Hut mit Feder, Schnurrbart, riesiges schwarzes Schwert |
| hancock | Hancock | Mira | die Unwiderstehliche / the Irresistible | Herzklopfen / Heart Flutter | Amorpfeile / Cupid Arrows | lange schwarze Haare, rotes Kleid, Schlangen-Armreif |
| doflamingo ★ | Rosé | Rosé | Fadenkönig / Thread King | Fadennetz / Thread Net | Fadenkäfig / Thread Cage | rosa Federmantel, Sonnenbrille, blonde Haare |
| kuma ★ | Tatz | Tatz | der stille Bär / the Silent Bear | Pfotenpolster / Paw Pads | Prankenwelle / Paw Wave | Bärenohren, Pfotenhandschuhe, kleines Buch |
| perona ★ | Huschel | Huschel | Fräulein / Miss | Trübsinn-Geister / Gloom Ghosts | Geisterreigen / Ghost Round | rosa Zöpfe, Schirm, Gruselkleid, Teddy |
| moria ★ | Graf Dämmerling | Dämmerling | Graf / Count | Schattenraub / Shadow Snatch | Fledermauswolke / Bat Cloud | Fledermausmaske, langer Umhang, riesige Gestalt |
| absalom ★ | Ulf | Ulf | Unsichtbar / Invisible | Durchsichtig / See-Through | Unsichtbarer Hieb / Invisible Strike | Leopardenmaske, blonder Schopf |
| hogback ★ | Doktor Flick | Flick | Doktor / Doctor | Zombie-Chirurg / Zombie Surgeon | Notoperation / Emergency Surgery | runde Brille, Arztkittel, Nadel und Faden |

### Einzelgänger (1)
| id | heute | neu | Beiname DE / EN | Fähigkeit DE / EN | Ulti DE / EN | Markenzeichen |
|---|---|---|---|---|---|---|
| enel ★ | Zirrus | Zirrus | Himmelsherr / Sky Lord | Donnergott / Thunder God | Himmelsblitz / Sky Bolt | weißes Haar, goldene Kleidung, Trommelring im Rücken |

**Summe: 6 + 7 + 9 + 5 + 10 + 8 + 10 + 1 = 56 Figuren.** Davon 20 ★ (smoker, blueno, jabra, rob-lucci, kaku, fukuro, mr1, crocodile, arlong, hatchan, hody, buggy, shanks, doflamingo, kuma, perona, moria, absalom, hogback, enel).

## 3. Team-Aktionen (`teammoves.js`)
| Bande | heute | neu DE / EN |
|---|---|---|
| strohhut | Strohhut-Sturm | Möwensturm / Gull Storm |
| marine | Buster Call | Kronen-Salve / Crown Volley |
| cp9 | Rokuogan | Letzter Auftrag / Final Assignment |
| weissbart | Für die Familie | Für die Familie / For the Family (bleibt) |
| samurai | Sieben Klingen | Kaperbrief / Letter of Marque |
| baroque | Geheimauftrag | Geheimauftrag / Secret Assignment (bleibt) |
| buggy | Buggy-Kanone | Großes Finale / Grand Finale |
| fischmensch | Fischmenschen-Karate | Tiefsee-Wucht / Deep Sea Force |
| revolution | Revolutionswind | Wetterumschwung / Weather Turn |
| rothaar | Königs-Haki | Machtwort / Word of Power |
| supernova | Neue Ära | Wildfang-Wirbel / Rascal Rush |
| thriller | Schattenarmee | Spuk-Parade / Haunt Parade |

## 4. Duos (`duos.js`, 58 Stück)
Text mit den neuen Namen, EN wird in C2 wie bisher übersetzt. „bleibt“ = Name ist schon neutral. Sturmmöwen-Namen wie in `neutral.js`.

| Paar | heute | neu DE / EN | Text neu (DE) |
|---|---|---|---|
| ruffy + ace | Brüder | Brüder / Brothers (bleibt) | Rafe und Asch: beide +15 % Schaden. |
| ruffy + zorro | Kapitän & Vize | Kapitän & Vize / Captain & First Mate (bleibt) | Rafe und Soren: beide +12 % Krit-Chance. |
| zorro + sanji | Streithähne | bleibt / Squabblers | Soren und Santo wollen sich übertrumpfen: beide +20 % Schaden. |
| zorro + mihawk | Lehrmeister | bleibt / Mentor | Soren lernt von Silas: +20 % Krit-Chance und härtere Krits. |
| nami + lysop | Angsthasen | bleibt / Scaredy-Cats | Nela und Lasse: beide +15 % Ausweichen. |
| sanji + nami | Mellorine | Santos Schwärmerei / Santo's Crush | Santo kämpft für Nela: +20 % Schaden, +1 Tempo. |
| robin + franky | Super-Paar | bleibt / Super Pair | Rubina und Bolzen: beide erleiden 2 weniger Schaden. |
| chopper + brook | Bordkapelle | bleibt / Ship's Band | Pipo und Bruno: beide heilen 2 Leben pro Runde. |
| garp + koby | Harte Schule | bleibt / School of Hard Knocks | Kian trainiert bei Grimm: +4 Angriff. |
| smoker + tashigi | Jagdpartner | bleibt / Hunting Partners | Russ und Tessa: beide +2 Tempo. |
| rob-lucci + kaku | CP9-Elite | Schattenkorps-Elite / Shadow Corps Elite | Krall und Stelz: beide +10 % Krit-Chance. |
| crocodile + mr1 | Der Baron & Herr Sonntag | bleibt / The Baron & Mister Sunday | Sirokk und Herr Sonntag: beide +15 % Schaden. |
| bonclay + ruffy | Freundschaft | bleibt / Friendship | Mimo steht zu Rafe: +3 Angriff und 2 weniger Schaden. |
| jinbei + ruffy | Steuermann | bleibt / Helmsman | Jonah hält Rafe den Rücken frei: Jonah 3 weniger Schaden, Rafe heilt 2 pro Runde. |
| law + ruffy | Allianz | bleibt / Alliance | Lorn und Rafe: beide +1 Tempo und +10 % Schaden. |
| whitebeard + marco | Vater & Sohn | bleibt / Father & Son | Gischt erleidet 3 weniger Schaden, Falk heilt 3 pro Runde. |
| whitebeard + ace | Familie | bleibt / Family | Asch kämpft für seinen Käpt'n: +20 % Schaden. |
| hancock + ruffy | Liebesblick | bleibt / Loving Gaze | Mira kämpft für Rafe: +25 % Schaden. |
| shanks + ruffy | Der Strohhut | Vorbild / Role Model | Rafe will Fenn beeindrucken: +3 Angriff, +10 % Krit-Chance. |
| shanks + mihawk | Alte Rivalen | bleibt / Old Rivals | Fenn und Silas: beide +15 % Krit-Chance. |
| vivi + ruffy | Versprechen | bleibt / Promise | Vina und Rafe: beide heilen 2 Leben pro Runde. |
| buggy + shanks | Rogers Schiffsjungen | Schiffsjungen des Königs / The King's Cabin Boys | Pomp und Fenn: alte Rivalen, beide +15 % Schaden. |
| buggy + alvida | Pomp-Allianz | bleibt / Pomp Alliance | Pomp und Hanne: beide erleiden 2 weniger Schaden. |
| buggy + crocodile | Kreuz-Gilde | Sand-Zirkus / Sand Circus | Pomp und Sirokk: Sirokk +20 % Schaden, Pomp +2 Tempo. |
| arlong + hatchan | Flossenriff | bleibt / Fin Reef | Brack und Okko: beide +3 Angriff. |
| arlong + nami | Alte Rechnung | bleibt / Old Score | Nela kämpft gegen ihre Vergangenheit: +25 % Schaden. |
| hody + arlong | Neue Fischmenschen-Piraten | Neue Flossen-Piraten / New Fin Pirates | Grimmflosse und Brack: beide +15 % Schaden. |
| jinbei + hody | Alter Groll | bleibt / Old Grudge | Jonah stellt sich Grimmflosse: Jonah erleidet 3 weniger Schaden. |
| jinbei + arlong | Sonnenpiraten | Alte Besatzung / Old Crew | Jonah und Brack: beide erleiden 2 weniger Schaden. |
| kuroobi + chu | Offiziere | bleibt / Officers | Torn und Prill: beide +1 Tempo und +10 % Krit-Chance. |
| sabo + ace | Feuerbrüder | bleibt / Fire Brothers | Jorin erbt die Flamme: Jorin und Asch +15 % Schaden. |
| sabo + ruffy | Brüder (Sabo) | Brüder (Jorin) / Brothers (Jorin) | Jorin und Rafe: beide +12 % Krit-Chance und +1 Tempo. |
| sabo + koala | Einsatzteam | bleibt / Task Force | Jorin und Tilda: beide heilen 2 pro Runde. |
| dragon + ruffy | Vater und Sohn | Wie der Vater / Like Father | Rafe hat den Willen seines Vaters Rian: +4 Angriff. |
| dragon + garp | Familie Monkey D. | Familie Dickkopf / Hardhead Family | Grimm und Rian: beide erleiden 2 weniger Schaden. |
| ivankov + bonclay | Okama-Weg | Kabarett-Weg / Cabaret Way | Lila und Mimo: beide heilen 3 pro Runde. |
| ivankov + ruffy | Impel Down | Der Ausbruch / The Breakout | Lila hat Rafe gerettet: Rafe heilt 3 pro Runde. |
| yasopp + lysop | Vater und Sohn (Schützen) | Zwei Treffsichere / Two Dead Eyes | Piet und Lasse: beide +15 % Krit-Chance, härtere Krits. |
| beckman + shanks | Rechte Hand | bleibt / Right Hand | Lenz und Fenn: beide +10 % Schaden, Fenn erleidet 2 weniger. |
| roo + sanji | Grillmeister | bleibt / Grill Masters | Brotz und Santo kochen um die Wette: beide heilen 2 pro Runde. |
| aokiji + garp | Admiral & Held | bleibt / Admiral & Hero | Reif und Grimm: beide erleiden 2 weniger Schaden. |
| aokiji + robin | Ohara | Bücherinsel / Book Island | Reif ließ Rubina ziehen: Rubina +20 % Ausweichen. |
| vista + marco | Kommandanten | bleibt / Commanders | Veit und Falk: beide +12 % Krit-Chance. |
| vista + mihawk | Schwertduell | bleibt / Sword Duel | Veit misst sich mit Silas: Veit +25 % Schaden. |
| perona + mihawk | Kuraigana | Nachtinsel / Night Isle | Huschel und Silas: Huschel heilt 3 pro Runde, Silas +10 % Schaden. |
| perona + zorro | Unfreiwillige Lehre | bleibt / Unwilling Lesson | Soren ist immun gegen Huschels Geister: +2 Angriff, erleidet 1 weniger. |
| kuma + ivankov | Alte Kameraden | bleibt / Old Comrades | Tatz und Lila: Tatz erleidet 3 weniger Schaden. |
| fukuro + rob-lucci | Plappermaul | bleibt / Chatterbox | Plapper und Krall: Krall +10 % Krit-Chance, Plapper +2 Tempo. |
| mohji + cabaji | Clown-Handlanger | bleibt / Clown Henchmen | Poldi und Jockel: beide +2 Angriff. |
| kid + killer | Kid-Piraten | Magnus-Bande / Magnus Gang | Magnus und Simon: beide +12 % Schaden. |
| kid + law | Neue Allianz | bleibt / New Alliance | Magnus und Lorn: beide +1 Tempo und +8 % Krit-Chance. |
| kid + ruffy | Rivalen | bleibt / Rivals | Rafe und Magnus wollen den anderen übertreffen: beide +3 Angriff. |
| bonney + ruffy | Fressduell | bleibt / Eating Contest | Lotta und Rafe: beide heilen 3 pro Runde. |
| drake + koby | Geheimauftrag | Undercover / Undercover | Gregor schützt Kian: Kian +15 % Ausweichen, Gregor 2 weniger Schaden. |
| hawkins + apoo | Alte Abmachung | bleibt / Old Deal | Olin und Rondo: beide +1 Tempo. |
| moria + perona | Thriller Bark | Schauerbarke / Shiverbark | Dämmerling und Huschel: beide heilen 2 pro Runde. |
| absalom + hogback | Zombie-Werkstatt | bleibt / Zombie Workshop | Ulf +15 % Schaden, Flick heilt besser (+2 pro Runde). |
| moria + brook | Gestohlener Schatten | bleibt / Stolen Shadow | Bruno holt sich seinen Schatten zurück: +20 % Ausweichen. |

Hinweis: In `duoquips.js` (Sprüche zu den Duos) stand bei der Suche kein Markenbegriff, aber die Namen darin (Ruffy, Zorro …) laufen heute über `neutral.js` und gehören in C2 mit.

## 5. Kombos (`combos.js`)
Alle fünf sind schon frei von Markennamen, nur EN wird ergänzt. Keine Änderung am deutschen Text nötig.

| id | heute | neu DE / EN |
|---|---|---|
| sturmangriff | Sturmangriff | bleibt / Rush Attack |
| schnitte | Tausend Schnitte | bleibt / Thousand Cuts |
| festung | Festung | bleibt / Fortress |
| brocken | Zäher Brocken | bleibt / Tough Nut |
| klingensturm | Klingensturm | bleibt / Blade Storm |

## 6. Weitere Begriffe
| Begriff | heute | neu DE / EN | Ort |
|---|---|---|---|
| Fischmensch (Volk) | Fischmensch, Meervolk (neutral.js) | Flossling, Plural Flosslinge / Finling. Volk: Flossenvolk / Finfolk. „Meervolk“ fällt weg. | factions, crew, abilities, unlocks |
| Fischmenschen-Karate | Fischmenschen-Karate | Wellen-Karate / Wave Karate (neutral.js). Bei Koala Strömungs-Karate, beim Fußvolk Flossling gleich Wellen-Karate. | abilities, teammoves |
| Fischmenscheninsel | Fischmenscheninsel | Tiefsee, Bündnis: Tiefsee-Bund | unlocks (hody), alliances |
| Königs-Haki | Königs-Haki | Fähigkeit Herrscherwille / Ruler's Will, Team-Aktion Machtwort / Word of Power | abilities, teammoves, factions |
| Haki, Observations-Haki | Haki | Willenskraft (neutral.js), Koby: Vorahnung / Foresight | factions, abilities |
| Haki des Kaisers (Ausrüstung `gryphon`) | Haki des Kaisers | Aura des Herrschers / Ruler's Aura | crewgear.js |
| Calm Belt (Ko-op-Boss) | Tiefseeriese der Calm Belt | Tiefseeriese der Stillen Zone / Deep Giant of the Hush | coop.js, en-coop.js |
| Teufelsfrucht | Teufelsfrucht | Zauberfrucht (schon live), Teufelsgewürz → Zaubergewürz / magic spice | unlocks.js, wiedersehen.js |
| Frucht-Namen in Fähigkeiten | Mane-Mane, Bomben, Mero-Mero, Sube-Sube, Magnet, Alters, Ton-Ton … | alle in der Figurenliste oben ersetzt | abilities |
| Berry | Berry | Taler (neutral.js), steckt noch in crewlife.js, crewclips.js, crewgear.js | Texte |
| Alabasta | Alabasta | Wüstenreich (Welle A), steckt noch in crewlife.js, crewclips.js, crewquips.js, forms.js | Texte |
| Ohara | Ohara | Bücherinsel (neutral.js), steckt in forms.js und im Duo aokiji + robin | Texte |
| Sabaody | Sabaody | Blasenarchipel, steckt in unlocks.js (Tatz) und im Bündnis | Texte |
| Marine | Marine | Kronwacht („Die Marine fotografiert mit“ in wiedersehen.js, Bandenname in factions.js, `FAC_SHORT` in render.js) | Texte, render.js |
| Lysop-Bande | Kapitän der Lysop-Bande (forms.js) | Kapitän der Lasse-Bande / Captain of the Lasse Gang | forms.js |
| Supernova | Supernova → Sturmvogel (neutral.js) | Wildfang, Plural Wildfänge. „Sturmvogel“ ist zu nah an Sturmmöwe und fällt weg. | factions, neutral.js |
| Kürzel in render.js | `FAC_SHORT`: Strohhut, Marine, CP9, Baroque, Weißbart, Samurai, Buggy, Arlong, Revolution | Sturmmöwen, Kronwacht, Schatten, Barock, Gischt, Freibeuter, Pomp, Flossen, Gegenwind (Rothaar → Rotmantel, Thriller → Schauer, Supernova → Wildfang) | render.js:493 |
| Bandennamen in Unlock-Texten | Buggy-Piraten, Weißbart-Bande, Schlimmste Generation, Thriller Bark, Revolutionsarmee, Rothaar-Piraten | Pomp-Truppe, Gischt-Flotte, Die Wildfänge, Schauerbarke, Gegenwind, Rotmantel-Flotte | unlocks.js |

## 7. Offene Fragen für Felix (höchstens 4)
1. **Gegenwind (Revolution) im Barock-Bund?** Es gibt nur 8 Fraktionen, die Rebellen mussten irgendwo hin. Empfehlung: ja, als Untergrund-Flügel des Bundes. Alternative: eigene 9. Fraktion Gegenwind (dann hat der Spieler 9 Leitfarben).
2. **Wildfänge (Supernova) im Zirkus der Narren?** Masken, Karten und Mundharmonika passen zum Schminke-Chaos. Empfehlung: ja. Alternative: bei den Freibeutern der Krone (dort wären es dann 16 Figuren).
3. **Welche Flotte gehört Käpt'n Schlund (Welle B)?** Empfehlung: die Gischt-Flotte, er war dort Küchenjunge und hat sich satt gegessen. Die Rotmantel-Flotte bleibt frei.
4. **Sirokk (Bande baroque) und Dämmerling (Bande thriller) sind in Welle B „Freibeuter der Krone“.** Die Synergie hängt an der Bande, nicht an der Geschichte. Empfehlung: Synergie bleibt wie sie ist, im Text steht „früher Barock-Bund“ bzw. „heuert die Schauerbarke für die Krone“.

## 8. Auffälligkeiten beim Lesen
- Okko heißt in Welle B „Acht-Arm“, die Fähigkeit spricht aber von sechs Armen und sechs Schwertern. Vorschlag: in C2 den Text auf acht ändern (Werte bleiben, `kind: chain` bleibt).
- In `crew.js` heißen Riegel und Wolfram schon so (Welle B), `neutral.js` kennt noch Blaun und Jago. Die Welle-B-Namen gewinnen, die alten Einträge können später raus.
- `neutral.js` nennt Mr. 5 „Herr Fünf“. Neu: **Herr Freitag**, passend zu Sonntag, Mittwoch, Montag.
- Garp heißt in `neutral.js` Grimm. Das klingt nach Märchenbrüdern, passt aber zum Altadmiral mit Keksdose und bleibt.
- Mehrere Figuren haben rosa Haare (Hilde, Kian, Lotta, Huschel). Im Look in C4 über Frisur und Hut unterscheiden.
- Doppelte Fähigkeits- oder Ulti-Namen im Original (z. B. Hiken bei Ace und Sabo, Tekkai bei Riegel und Plapper) sind aufgelöst, jede Figur hat jetzt einen eigenen Namen.
- Prüfskript: `tools/weltbau-check.py` bekommt für C2 eine Liste C aus den „heute“-Spalten oben.
