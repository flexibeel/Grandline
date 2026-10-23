# Nach jedem Update ausführen: hängt die aktuelle Version (aus js/data/patchnotes.js) an alle
# Skripte/CSS in index.html und schreibt version.json. So laden Browser die neue Version sofort.
import re, json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v = re.search(r"v: '([^']+)'", open(os.path.join(root, 'js/data/patchnotes.js')).read()).group(1)
p = os.path.join(root, 'index.html'); s = open(p).read()
s = re.sub(r'(src="js/[^"?]+\.js)(\?v=[^"]*)?"', lambda m: m.group(1) + '?v=' + v + '"', s)
s = re.sub(r'(href="css/style\.css)(\?v=[^"]*)?"', lambda m: m.group(1) + '?v=' + v + '"', s)
open(p, 'w').write(s)
t = re.search(r"title: '([^']*)'", open(os.path.join(root, 'js/data/patchnotes.js')).read())
blk = open(os.path.join(root, 'js/data/patchnotes.js')).read().split('items: [', 1)[1].split(']', 1)[0]
items = [x.replace("\\'", "'") for x in re.findall(r"'((?:[^'\\]|\\.)*)'", blk)]
json.dump({'v': v, 'title': t.group(1) if t else '', 'items': items[:3]}, open(os.path.join(root, 'version.json'), 'w'), ensure_ascii=False)
print('Version', v)
# JS bündeln und CSS verkleinern (siehe tools/bundle.py)
import sys; sys.path.insert(0, os.path.join(root, 'tools'))
import bundle; bundle.build(v)
# Offline-Modus: Version und Dateiliste in den Service Worker (sw.js) eintragen. Im Zweig bleibt sw.js eine Vorlage mit Platzhaltern.
# Die URLs kommen aus der fertigen index.html und müssen zeichengleich zu dem sein, was die Seite lädt, sonst trifft der Zwischenspeicher nicht.
swp = os.path.join(root, 'sw.js')
if os.path.exists(swp):
    html = open(p).read()
    files = ['./', 'index.html']
    files += re.findall(r'(?:src|href)="((?:js/build/[^"]+\.js|css/style\.min\.css)\?v=[^"]*)"', html)
    files += ['manifest.webmanifest', 'legal.html']
    files += sorted('img/' + f for f in os.listdir(os.path.join(root, 'img')) if f.lower().endswith(('.png', '.jpg', '.svg', '.webp', '.ico')))
    sw = open(swp, encoding='utf-8').read()
    sw, n1 = re.subn(r"const V = '[^']*';", "const V = '%s';" % v, sw)
    sw, n2 = re.subn(r"const FILES = \[/\*FILES\*/.*?/\*END\*/\];", lambda m: "const FILES = [/*FILES*/%s/*END*/];" % ','.join(json.dumps(f) for f in files), sw, flags=re.S)
    if n1 != 1 or n2 != 1:
        sys.exit('sw.js: Platzhalter für Version oder Dateiliste nicht gefunden')
    open(swp, 'w', encoding='utf-8').write(sw)
    print('sw.js: Version', v, '·', len(files), 'Dateien')
