# Bündelt die Skripte aus tools/bundles.json zu js/build/<name>.min.js und css/style.css zu css/style.min.css.
# Wird von bump-version.py aufgerufen. Neue <script src="js/..."> zwischen den BUNDLE-Markern in index.html
# werden automatisch hinten an die passende Liste angehängt.
# Jede Datei läuft in einem eigenen try/catch: Ein Fehler in einer Datei stoppt (wie vorher) nur diese Datei.
# Ohne terser bzw. lightningcss (npm i -g terser lightningcss-cli) wird nur zusammengefügt, nicht verkleinert.
import json, os, re, shutil, subprocess, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda *p: os.path.join(root, *p)


def build(v):
    lists = json.load(open(J('tools/bundles.json')))
    html = open(J('index.html')).read()
    os.makedirs(J('js/build'), exist_ok=True)
    terser = shutil.which('terser')
    for name, files in lists.items():
        m = re.search(r'<!-- BUNDLE %s[^>]*-->(.*?)<!-- /BUNDLE -->' % name, html, re.S)
        if not m:
            sys.exit('Marker <!-- BUNDLE %s --> fehlt in index.html' % name)
        for f in re.findall(r'src="(js/[^"?]+\.js)', m.group(1)):
            if not f.startswith('js/build/') and f not in files:
                files.append(f)
                print('neu im Bündel', name + ':', f)
        parts = []
        for f in files:
            src = open(J(f), encoding='utf-8').read()
            parts.append('// ---- %s\ntry {\n%s\n} catch (e) { console.error(%s, e); }\n' % (f, src, json.dumps(f)))
        out = 'js/build/%s.js' % name
        open(J(out), 'w', encoding='utf-8').write(''.join(parts))
        mini = 'js/build/%s.min.js' % name
        if terser:
            subprocess.run([terser, J(out), '-c', 'passes=1', '-m', '--comments', 'false', '-o', J(mini),
                            '--source-map', 'url=%s.min.js.map' % name], check=True)
            os.remove(J(out))
        else:
            os.replace(J(out), J(mini))
        tag = '<script src="%s?v=%s"></script>' % (mini, v)
        if name == 'en':
            tag = tag.replace('</script>', '<\\/script>')
        html = html[:m.start()] + m.group(0)[:m.group(0).index('-->') + 3] + tag + '<!-- /BUNDLE -->' + html[m.end():]
    json.dump(lists, open(J('tools/bundles.json'), 'w'), indent=1)
    # CSS
    lc = shutil.which('lightningcss')
    if lc:
        subprocess.run([lc, '--minify', '--targets', 'safari >= 14, chrome >= 90, firefox >= 90',
                        J('css/style.css'), '-o', J('css/style.min.css')], check=True)
    else:
        shutil.copy(J('css/style.css'), J('css/style.min.css'))
    html = re.sub(r'href="css/style(\.min)?\.css(\?v=[^"]*)?"', 'href="css/style.min.css?v=%s"' % v, html)
    open(J('index.html'), 'w').write(html)
    kb = lambda p: os.path.getsize(J(p)) // 1024
    print('Bündel:', ', '.join('%s %d KB' % (n, kb('js/build/%s.min.js' % n)) for n in lists), '| CSS %d KB' % kb('css/style.min.css'))


if __name__ == '__main__':
    v = re.search(r"v: '([^']+)'", open(J('js/data/patchnotes.js')).read()).group(1)
    build(v)
