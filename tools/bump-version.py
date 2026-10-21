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
