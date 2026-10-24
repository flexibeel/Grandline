#!/usr/bin/env python3
"""Weltbau-Prüfung: sucht Originalnamen in den Spieldaten.

Aufruf:  python3 tools/weltbau-check.py            (alle Wellen)
         python3 tools/weltbau-check.py A          (nur Welle A: Meere, Inseln, Orte)

Gibt pro Fund Datei, Zeile und Begriff aus. Code-Kommentare und js/world/neutral.js
(die alte Ersetzungsliste) werden übersprungen. Neue Wellen ergänzen ihre Liste unten.
"""
import re, sys, glob

WELLEN = {
    'A': [  # Meere, Inseln, Orte (auch übersetzte Formen)
        'East Blue', 'Paradies', 'Red Line', 'Enies Lobby', 'Thriller Bark', 'Sabaody',
        'Fischmenscheninsel', 'Fish-Man Island', 'Shells Town', 'Orange Town', 'Syrup', 'Baratie',
        'Loguetown', 'Arlong Park', 'Whisky Peak', 'Little Garden', 'Drumm', 'Drum Island', 'Jaya',
        'Alabasta', 'Skypiea', 'Long Ring', 'Water 7', 'Puffing Tom', 'Impel Down', 'Shandora',
        'Mock Town', 'Alubarna', 'Rainbase', 'Upper Yard', 'Angel Beach', 'Gyoncorde', 'Ryugu',
        'Mangrove 13', 'Florian', 'Galley-La', 'Kokos', 'Cocoyasi', 'Bighorn', 'Sandora', 'Foosha',
        'Gecko', 'Zwillingskap', 'Twin Cape', 'Rückwärtsberg', 'Reverse Mountain', 'Davy Back',
        'Davy-Back', 'Muschelstadt', 'Orangenhafen', 'Sirupdorf', 'Whiskeyspitze', 'Trommelberg',
        'Langringland', 'Wasserstadt', 'Tor der Gerechtigkeit', 'Gates of Justice', 'Turm des Gerichts',
        'Tower of Justice', 'Korallenhügel', 'Meereswald',
    ],
    'B': [  # Gegner, Bosse, Signaturen, Fußvolk (auch übersetzte Formen)
        'Smoker', 'Arlong', 'Crocodile', 'Enel', 'Rob Lucci', 'Lucci', 'Kaku', 'Hody', 'Vander Decken', 'Gecko Moria', 'Moria',
        'Bartholomew', 'Kuma', 'Kizaru', 'Doflamingo', 'Blackbeard', 'Shanks', 'Morgan', 'Buggy', 'Kuro', 'Don Krieg', 'Hatchan',
        'Jango', 'Dämon Gin', 'Eisenwand Pearl', 'Iron Wall Pearl', 'Chew', 'Mr. 0', 'Mr. 1', 'Mr. 3', 'Mr. 4', 'Mr. 9', 'Lassoo',
        'Doublefinger', 'Ohm', 'Wapol', 'Bellamy', 'Hyouzou', 'Zeo', 'Daruma', 'Dosun', 'Ikaros', 'Fukuro', 'Nero', 'Spandam',
        'Blueno', 'Jabra', 'Foxy', 'Absalom', 'Perona', 'Hogback', 'Duval', 'Marinesoldat', 'Seekönig', 'Sea King', 'Sea king',
        'Momoo', 'Bananen-Krokodil', 'Bananawani',
        # Signaturen
        'Weißer Rauch', 'White Smoke', 'Wüstensarg', 'Desert Coffin', 'Energie-Steroide',
        'Energy Steroids', 'Ursus', 'Vogelkäfig', 'Birdcage',
        'Schwarzes Loch', 'Black Hole', 'Königshaki',
    ],
}

# Was zu einer späteren Welle gehört und hier noch stehen darf (Welle C: Fraktionen, Figuren-Fähigkeiten).
SPAETER = {
    'B': {'dateien': ('factions.js', 'teammoves.js', 'ultis.js', 'abilities.js'),
          'danach': ('-Piraten', ' Pirates', '-Bande', '-Kanone'),
          'zeilen': ('FAC_SHORT',)},
}

def main():
    welle = sys.argv[1].upper() if len(sys.argv) > 1 else None
    namen = WELLEN[welle] if welle else [n for v in WELLEN.values() for n in v]
    welle_von = {n: w for w, v in WELLEN.items() for n in v}
    L = 'A-Za-zÄÖÜäöüß0-9'
    rx = re.compile('(?<![' + L + '])(' + '|'.join(re.escape(n) for n in sorted(namen, key=len, reverse=True)) + ')(?![' + L + '])')
    dateien = sorted(f for f in glob.glob('js/**/*.js', recursive=True)
                     if '/build/' not in f and not f.endswith('world/neutral.js'))
    funde = {}
    for f in dateien:
        for nr, zeile in enumerate(open(f, encoding='utf8'), 1):
            code = '' if zeile.lstrip().startswith('//') else zeile
            for m in rx.finditer(code):
                sp = SPAETER.get(welle_von[m.group(1)])
                if sp and (f.endswith(sp['dateien']) or code[m.end():].startswith(sp['danach'])
                           or any(z in code for z in sp['zeilen'])):
                    continue   # gehört zu einer späteren Welle
                funde.setdefault(f, []).append((nr, m.group(1)))
    gesamt = 0
    for f, liste in funde.items():
        begriffe = {}
        for nr, b in liste:
            begriffe.setdefault(b, []).append(nr)
        print(f)
        for b, nrs in sorted(begriffe.items()):
            print('   %-22s Zeile %s' % (b, ', '.join(map(str, nrs[:8])) + (' …' if len(nrs) > 8 else '')))
        gesamt += len(liste)
    print('\n%d Funde in %d Dateien' % (gesamt, len(funde)))

if __name__ == '__main__':
    main()
