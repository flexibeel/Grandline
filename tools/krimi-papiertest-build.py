#!/usr/bin/env python3
"""Baut die Papiertest-Seiten (krimi/start.html, krimi/fall01-a.html, krimi/fall01-b.html).
Jede Rollenseite enthält NUR die Karten ihrer eigenen Rolle. Die Lösung steckt nur als SHA-256-Wert drin.
Aufruf: python3 tools/krimi-papiertest-build.py
Wichtig: In krimi/ nie eine index.html anlegen (der Service Worker von Grandline würde sie als Spielseite merken)."""
import hashlib, json, os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'krimi')
os.makedirs(out, exist_ok=True)

FALL = 'fall01'
LOESUNG = {'taeter': 'marlene', 'motiv': 'unterschlagung', 'mittel': 'anker'}
sha = lambda s: hashlib.sha256(s.encode('utf-8')).hexdigest()
HASH = {k: sha(f'{FALL}:{k}:{v}') for k, v in LOESUNG.items()}

COMMON = {
    'title': 'Der Abend im Hotel Möwenruh',
    'story': 'Ein Gewitter zieht über die Küste. Im kleinen Hotel Möwenruh wird um 23:38 Uhr der Besitzer Konrad Brandt (63) tot in seinem Büro im ersten Stock gefunden. Er hat eine Kopfverletzung. Die Polizei kommt wegen des Sturms erst am Morgen. Ihr zwei seid die Ermittler vor Ort. Zwischen 22:20 und 22:40 Uhr fiel im ganzen Haus der Strom aus.',
    'suspects': [
        ['Marlene Voss', 'Geschäftsführerin, ihr Büro liegt im Erdgeschoss'],
        ['Dr. Teo Lindner', 'Hotelgast in Zimmer 12'],
        ['Ilse Bachmann', 'Köchin'],
        ['Jonas Reuter', 'Nachtportier am Empfang'],
        ['Paula Brandt', 'Nichte des Opfers, hat ihn gefunden'],
    ],
    'rules': [
        'Ihr habt verschiedene Hinweise. Erzählt euch alles in eigenen Worten, aber zeigt oder lest die Karten nicht vor.',
        'Akten und Protokolle sind verlässlich. Aussagen können gelogen sein. Genau eine Person lügt über ihren Aufenthalt.',
        'Es gibt nur eine Lösung, die zu allen Hinweisen passt.',
    ],
    'choices': {
        'taeter': [['marlene', 'Marlene Voss'], ['lindner', 'Dr. Teo Lindner'], ['ilse', 'Ilse Bachmann'], ['jonas', 'Jonas Reuter'], ['paula', 'Paula Brandt']],
        'motiv': [['unterschlagung', 'Eine Unterschlagung vertuschen'], ['erbe', 'Das Erbe'], ['rache', 'Rache für einen alten Verlust'], ['kuendigung', 'Wut über eine Kündigung']],
        'mittel': [['anker', 'Messing-Anker'], ['briefoeffner', 'Brieföffner'], ['kerzenstaender', 'Kerzenständer'], ['gift', 'Gift im Whisky']],
    },
}

ROLES = {
    'a': {
        'who': 'Felix', 'name': 'Akte A',
        'roles': 'Spurensucher und Archivar',
        'blurb': 'Du siehst, was am Tatort liegt und was in den Papieren steht. Was die Verdächtigen sagen und was die Technik aufgezeichnet hat, weiß dein Partner.',
        'groups': [
            ['Spurensucher: der Tatort, das Büro im ersten Stock', [
                ['A1', 'Das Büro', 'Das Büro ist nur mit einer Schlüsselkarte zu öffnen. Der Schreibtisch ist ordentlich. Auf der Schreibunterlage liegt ein Brieföffner, unbenutzt. Der Kerzenständer steht an seinem Platz. Ein Whiskyglas ist halb voll.'],
                ['A2', 'Der leere Platz im Regal', 'Im Regal ist ein sauberes, rechteckiges Stück im Staub. Dort stand etwas Schweres mit Kanten. In einer Schublade liegt ein Hotelprospekt: Darauf ist ein Messing-Anker als Dekostück im Büro zu sehen. Der Anker fehlt.'],
                ['A3', 'Der Anker im Wäschewagen', 'Kurz nach Mitternacht findet die Polizei den Messing-Anker im Wäschewagen im Flur des ersten Stocks. Er ist mit einem Tuch abgewischt, es gibt keine verwertbaren Spuren.'],
                ['A4', 'Der zerrissene Brief', 'Im Papierkorb liegt ein zerrissener Brief: der Entwurf einer Kündigung für Ilse Bachmann. Er ist nicht unterschrieben und trägt das Datum von letzter Woche.'],
            ]],
            ['Archivar: Akten und Papiere', [
                ['A5', 'Bericht des Arztes', 'Der Tod trat zwischen 22:00 und 22:30 Uhr ein, durch einen Schlag mit einem schweren, kantigen Messinggegenstand. Hinweise auf Gift gibt es nicht.'],
                ['A6', 'Die Schlüsselliste', 'Generalschlüssel Gen-1 hat Jonas Reuter. Gen-2 hat Marlene Voss. Gen-3 liegt im Tresor an der Rezeption, das Siegel ist unversehrt.'],
                ['A7', 'Das Kassenbuch', 'In den letzten acht Monaten fehlen 48.000 Euro in bar. Alle Fehlbuchungen tragen das Freigabekürzel von Marlene Voss. Im Kalender des Opfers steht für Freitag, 9:00 Uhr: „Wirtschaftsprüferin Aigner, Kassenbuch“.'],
                ['A8', 'Testament und alte Akte', 'Paula Brandt erbt 70 Prozent des Hotels. In einer Konkursakte von vor zehn Jahren steht Dr. Teo Lindner als Geschädigter: Er hat durch Konrad Brandt 120.000 Euro verloren.'],
            ]],
        ],
    },
    'b': {
        'who': 'dein Kumpel', 'name': 'Akte B',
        'roles': 'Befrager und Techniker',
        'blurb': 'Du hörst die Verdächtigen und liest die Aufzeichnungen. Was am Tatort liegt und was in den Akten steht, weiß dein Partner. Erinnerung: Aussagen können gelogen sein, Protokolle nie.',
        'groups': [
            ['Befrager: Aussagen', [
                ['B1', 'Marlene Voss', '„Von 21:50 bis 22:45 Uhr war ich in meinem Büro im Erdgeschoss und habe die Abrechnungen am Computer gemacht. Meine Schlüsselkarte habe ich nie aus der Hand gegeben. Der Chef war sehr zufrieden mit mir.“'],
                ['B2', 'Jonas Reuter', '„Ich saß die ganze Zeit am Empfang. Um 21:45 Uhr sah ich den Chef die Haupttreppe hochgehen. Danach ist niemand über die Haupttreppe nach oben gegangen.“'],
                ['B3', 'Ilse Bachmann', '„Ich stand in der Küche, der Abendservice lief bis 22:30 Uhr. Den Chef habe ich den ganzen Abend nicht gesehen. Eine Kündigung? Davon weiß ich nichts.“'],
                ['B4', 'Dr. Teo Lindner', '„Ich habe von 22:00 bis 22:30 Uhr in meinem Zimmer 12 telefoniert und dabei aus dem Fenster geschaut. Auf der Terrasse saß Paula mit ihrem Hund. Ja, Konrad hat mir vor zehn Jahren Geld abgenommen. Das ist lange her.“'],
                ['B5', 'Paula Brandt', '„Ich war mit dem Hund auf der Terrasse, bis es kurz nach 22:30 Uhr zu regnen anfing. Dann bin ich in mein Zimmer gegangen. Um 23:38 Uhr wollte ich meinem Onkel gute Nacht sagen und habe ihn gefunden.“'],
            ]],
            ['Techniker: Protokolle und Aufzeichnungen', [
                ['B6', 'Schlüsselkarten-Protokoll der Bürotür', '21:46 Uhr: Karte von Konrad Brandt.\n22:08 Uhr: geöffnet mit Generalschlüssel „Gen-2“.\n22:19 Uhr: geöffnet mit Generalschlüssel „Gen-2“.\n23:38 Uhr: Karte von Paula Brandt.'],
                ['B7', 'Kameras', 'Die Empfangskamera zeigt Jonas Reuter von 21:50 bis 22:20 Uhr durchgehend am Empfang. Um 22:20 fällt sie mit dem Stromausfall aus. Die Terrassenkamera hat einen eigenen Akku und läuft bis 22:28 Uhr: Sie zeigt Paula mit dem Hund von 22:00 bis 22:28 Uhr durchgehend auf der Terrasse.'],
                ['B8', 'Telefon- und Küchenprotokoll', 'Zimmer 12 hat von 22:03 bis 22:26 Uhr ein Gespräch über die Außenleitung geführt. Im Küchensystem hat Ilse Bachmann mit ihrer Anmeldung „Fertig“ gestempelt um 22:06, 22:08, 22:12 und 22:19 Uhr.'],
                ['B9', 'Computer von Marlene Voss', 'Verwaltungsbüro im Erdgeschoss: Letzte Eingabe um 22:02 Uhr, der Bildschirm sperrte sich automatisch. Nächste Eingabe (Passwort) um 22:31 Uhr.'],
                ['B10', 'Grundriss', 'Das Verwaltungsbüro im Erdgeschoss liegt neben einer Personaltreppe. Sie führt direkt in den Flur im ersten Stock und ist vom Empfang aus nicht einzusehen.'],
            ]],
        ],
    },
}

CSS = """
:root{--paper:#f6efe0;--paper2:#efe4cc;--ink:#2b2218;--mute:#7a6a54;--line:#d9c9a8;--accent:#8a3b2e;--accent2:#5a2a22;--ok:#2f6b3f;--bad:#9a3326}
@media (prefers-color-scheme:dark){:root{--paper:#1f1a14;--paper2:#2a231b;--ink:#efe6d2;--mute:#b3a58c;--line:#4a3e2e;--accent:#d98a73;--accent2:#f0b09c;--ok:#7fd096;--bad:#f08a7a}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.55 Georgia,'Iowan Old Style','Times New Roman',serif;-webkit-text-size-adjust:100%}
main{max-width:640px;margin:0 auto;padding:16px 16px 80px}
h1{font-size:1.5rem;line-height:1.2;margin:.2rem 0 .3rem}
h2{font-size:1.05rem;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin:1.6rem 0 .6rem;border-bottom:2px solid var(--line);padding-bottom:.3rem}
.kicker{font:700 .72rem/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.tag{display:inline-block;font:700 .8rem system-ui,sans-serif;background:var(--accent);color:#fff;border-radius:999px;padding:3px 10px;margin:.4rem 0}
p{margin:.5rem 0}
.hint{color:var(--mute);font-size:.92rem}
.warn{background:var(--paper2);border-left:4px solid var(--accent);padding:.6rem .8rem;border-radius:4px;font-size:.95rem}
ul.sus{list-style:none;padding:0;margin:.4rem 0}
ul.sus li{padding:.35rem 0;border-bottom:1px dashed var(--line)}
ul.sus b{font-weight:700}
ol.rules{padding-left:1.2rem;margin:.4rem 0}
.card{background:var(--paper2);border:1px solid var(--line);border-radius:10px;padding:.7rem .9rem;margin:.6rem 0;position:relative}
.card.star{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent) inset}
.card .id{font:700 .72rem system-ui,sans-serif;letter-spacing:.1em;color:var(--mute)}
.card h3{margin:.1rem 0 .3rem;font-size:1.05rem;padding-right:3rem}
.card p{white-space:pre-line;margin:.2rem 0}
.starbtn{position:absolute;top:6px;right:6px;width:44px;height:44px;border:0;background:none;font-size:1.5rem;line-height:1;color:var(--mute);cursor:pointer;border-radius:8px}
.card.star .starbtn{color:var(--accent)}
textarea{width:100%;min-height:130px;background:var(--paper2);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:.6rem .8rem;font:16px/1.5 Georgia,serif;resize:vertical}
label{display:block;font:700 .85rem system-ui,sans-serif;margin:.8rem 0 .25rem}
select{width:100%;min-height:46px;font:16px system-ui,sans-serif;background:var(--paper2);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:0 .6rem}
button.go{margin-top:1rem;width:100%;min-height:50px;border:0;border-radius:12px;background:var(--accent);color:#fff;font:700 1rem system-ui,sans-serif;cursor:pointer}
button.go:active{background:var(--accent2)}
#res{margin-top:.9rem;padding:.8rem 1rem;border-radius:10px;font-weight:700;display:none}
#res.ok{display:block;background:rgba(47,107,63,.15);color:var(--ok)}
#res.mid{display:block;background:var(--paper2);color:var(--ink)}
.btnrow{display:grid;gap:.7rem;margin-top:1rem}
a.big{display:block;text-align:center;text-decoration:none;min-height:56px;line-height:56px;border-radius:12px;background:var(--accent);color:#fff;font:700 1.05rem system-ui,sans-serif}
a.big.alt{background:var(--paper2);color:var(--ink);border:2px solid var(--accent)}
footer{margin-top:2rem;color:var(--mute);font-size:.82rem}
"""

BASE_JS = r"""
const S=(k)=>{try{return localStorage.getItem(k)}catch(e){return null}},W=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const KEY='krimi.'+D.fall+'.'+D.role;
let stars=new Set(JSON.parse(S(KEY+'.stars')||'[]'));
document.querySelectorAll('.card').forEach(c=>{
  const id=c.dataset.id; if(stars.has(id))c.classList.add('star');
  c.querySelector('.starbtn').addEventListener('click',()=>{
    c.classList.toggle('star'); c.classList.contains('star')?stars.add(id):stars.delete(id);
    W(KEY+'.stars',JSON.stringify([...stars]));
  });
});
const nt=document.getElementById('notes'); nt.value=S(KEY+'.notes')||''; nt.addEventListener('input',()=>W(KEY+'.notes',nt.value));
async function h(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
document.getElementById('check').addEventListener('click',async()=>{
  const res=document.getElementById('res'); let ok=0;
  for(const k of ['taeter','motiv','mittel']){
    const v=document.getElementById(k).value; if(v && await h(D.fall+':'+k+':'+v)===D.hash[k]) ok++;
  }
  res.className=ok===3?'ok':'mid';
  res.textContent=ok===3?'Richtig, alle drei! Fall gelöst. Sagt mir kurz, wie es für euch war.':ok+' von 3 stimmen. Redet noch mal über eure Hinweise und versucht es wieder.';
});
"""

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def card(c):
    i, t, x = c
    return (f'<div class="card" data-id="{i}"><button class="starbtn" aria-label="Als wichtig markieren" title="Als wichtig markieren">☆</button>'
            f'<div class="id">{i}</div><h3>{esc(t)}</h3><p>{esc(x)}</p></div>')

def role_page(rk):
    R = ROLES[rk]
    sus = ''.join(f'<li><b>{esc(n)}</b>, {esc(d)}</li>' for n, d in COMMON['suspects'])
    rules = ''.join(f'<li>{esc(r)}</li>' for r in COMMON['rules'])
    groups = ''.join(f'<h2>{esc(g)}</h2>' + ''.join(card(c) for c in cs) for g, cs in R['groups'])
    sel = lambda k, label: (f'<label for="{k}">{label}</label><select id="{k}"><option value="">Bitte wählen</option>'
                            + ''.join(f'<option value="{v}">{esc(n)}</option>' for v, n in COMMON['choices'][k]) + '</select>')
    data = json.dumps({'fall': FALL, 'role': rk, 'hash': HASH}, ensure_ascii=False)
    js = ('const D=' + data + ';' + BASE_JS)
    # Stern-Knopf: gefüllter Stern bei Markierung
    js += "\ndocument.querySelectorAll('.card').forEach(c=>{const b=c.querySelector('.starbtn');const f=()=>b.textContent=c.classList.contains('star')?'★':'☆';f();b.addEventListener('click',f)});"
    return f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Fall 01, {R['name']}</title><style>{CSS}</style></head>
<body><main>
<div class="kicker">Fall 01 · Papiertest · Prototyp</div>
<h1>{esc(COMMON['title'])}</h1>
<span class="tag">{R['name']} · {esc(R['roles'])}</span>
<p class="hint">{esc(R['blurb'])}</p>
<div class="warn">Öffne nur deine eigene Seite. Die Seite des anderen zu lesen verdirbt den Test.</div>
<h2>Was passiert ist</h2><p>{esc(COMMON['story'])}</p>
<h2>Die fünf Verdächtigen</h2><ul class="sus">{sus}</ul>
<h2>Eure Aufgabe</h2><p>Findet gemeinsam heraus: <b>Wer</b> war es? <b>Warum</b>? <b>Womit</b>?</p>
<ol class="rules">{rules}</ol>
{groups}
<h2>Deine Notizen</h2><p class="hint">Bleiben nur auf diesem Gerät. Tipp den Stern an einer Karte an, um sie als wichtig zu markieren.</p>
<textarea id="notes" placeholder="Was fällt dir auf? Was passt nicht zusammen?"></textarea>
<h2>Eure Lösung</h2>
{sel('taeter', 'Wer war es?')}{sel('motiv', 'Warum?')}{sel('mittel', 'Womit?')}
<button class="go" id="check">Lösung prüfen</button><div id="res" role="status"></div>
<footer>Prototyp zum Testen der Spielidee. Es wird nichts online gespeichert.</footer>
</main><script>{js}</script></body></html>
"""

def start_page():
    return f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Krimi-Papiertest</title><style>{CSS}</style></head>
<body><main>
<div class="kicker">Papiertest · Prototyp</div>
<h1>Fall 01: Der Abend im Hotel Möwenruh</h1>
<p>Ein Fall für zwei. Jeder hat eigene Hinweise, nur zusammen kommt ihr auf die Lösung. Redet am Telefon oder im Sprachchat darüber.</p>
<div class="warn"><b>Wichtig:</b> Jeder öffnet nur <b>seine eigene</b> Seite. Schickt dem anderen nur seinen Link.</div>
<div class="btnrow"><a class="big" href="fall01-a.html">Ich bin Ermittler A (Spurensucher, Archivar)</a>
<a class="big alt" href="fall01-b.html">Ich bin Ermittler B (Befrager, Techniker)</a></div>
<footer>Prototyp zum Testen der Spielidee. Es wird nichts online gespeichert.</footer>
</main></body></html>
"""

for rk in ROLES:
    open(os.path.join(out, f'{FALL}-{rk}.html'), 'w', encoding='utf-8').write(role_page(rk))
open(os.path.join(out, 'start.html'), 'w', encoding='utf-8').write(start_page())
print('krimi/: start.html,', ', '.join(f'{FALL}-{k}.html' for k in ROLES))
