# Nach jedem Update ausführen: hängt die aktuelle Version (aus js/data/patchnotes.js) an alle
# Skripte/CSS in index.html und schreibt version.json. So laden Browser die neue Version sofort.
import re, json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v = re.search(r"v: '([^']+)'", open(os.path.join(root, 'js/data/patchnotes.js')).read()).group(1)
p = os.path.join(root, 'index.html'); s = open(p).read()
s = re.sub(r'(src="js/[^"?]+\.js)(\?v=[^"]*)?"', lambda m: m.group(1) + '?v=' + v + '"', s)
s = re.sub(r'(href="css/style\.css)(\?v=[^"]*)?"', lambda m: m.group(1) + '?v=' + v + '"', s)
open(p, 'w').write(s)
json.dump({'v': v}, open(os.path.join(root, 'version.json'), 'w'))
print('Version', v)
