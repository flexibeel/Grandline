// Englisch: Teufelsfrucht-Familien und Eigenheiten (Fork M)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  'Hie-Hie-Frucht': 'Ice-Ice Fruit', 'Bara-Bara-Frucht': 'Chop-Chop Fruit', 'Hito-Hito-Frucht': 'Human-Human Fruit', 'Tori-Tori-Frucht (Phönix)': 'Bird-Bird Fruit (Phoenix)',
  '+{n} Leben für das erste Crewmitglied': '+{n} HP for the first crew member',
  'Gummi: Wer dich trifft, kriegt manchmal einen Teil zurück.': 'Rubber: whoever hits you sometimes gets some of it back.',
  'Extra-Arm: Treffer erwischen manchmal noch einen zweiten Gegner.': 'Extra arm: hits sometimes catch a second enemy too.',
  'Sand: Treffer trocknen Gegner aus, sie nehmen mehr Schaden.': 'Sand: hits dry enemies out, they take more damage.',
  'Feuer: Treffer setzen Gegner in Brand.': 'Fire: hits set enemies ablaze.',
  'Wut: Wer unter 40 % Leben fällt, schlägt 30 % härter zu.': 'Rage: anyone below 40 % HP hits harder.',
  'Eis: Treffer frieren Gegner manchmal eine Runde ein.': 'Ice: hits sometimes freeze enemies for a round.',
  'Zerlegen: Die Crew weicht 6 % der Angriffe aus. Der Rest ist Gewöhnungssache.': 'Chop: the crew dodges 6 % of attacks. The rest is a matter of getting used to it.',
  'Doktor: Am Rundenende wird der Verletzteste ein bisschen geflickt.': 'Doctor: at round end the most hurt gets patched up a little.',
  'Phönix: Wer als Erstes fällt, steht einmal pro Kampf mit blauer Flamme wieder auf.': 'Phoenix: the first to fall rises again in blue flame, once per battle.',
  'Finsternis: zählt als Logia.': 'Darkness: counts as Logia.',
  'Elemente: Brand, Austrocknen, Einfrieren.': 'Elements: burn, dry out, freeze.',
  'Tricks: Rückprall, Extra-Arme, Zerlegen.': 'Tricks: bounce back, extra arms, chopping.',
  'Tierkräfte: Wut, Doktor, Phönix.': 'Beast powers: rage, doctor, phoenix.',
  'Elementar-Effekte doppelt so oft und 1 Runde länger.': 'Elemental effects twice as often and 1 round longer.',
  'Gegner mit Zustand nehmen 30 % mehr Schaden.': 'Enemies with a status take 30 % more damage.',
  'Paramecia-Tricks doppelt so oft.': 'Paramecia tricks twice as often.',
  'Ganze Crew +3 Angriff im Kampf.': 'Whole crew +3 attack in battle.',
  'Tierkräfte 75 % stärker.': 'Beast powers 75 % stronger.',
  'Wut schon unter 60 % Leben, ganze Crew +1 Tempo und +10 % Schaden.': 'Rage already below 60 % HP, whole crew +1 speed and +10 % damage.',
  'Die Mera-Mera-Frucht': 'The Flame-Flame Fruit', 'Die Suna-Suna-Frucht': 'The Sand-Sand Fruit', 'Die Hie-Hie-Frucht': 'The Ice-Ice Fruit', 'Ein Extra-Arm': 'An extra arm',
  'Gummi': 'Rubber', 'Der Doktor': 'The doctor', 'Die Phönix-Flamme': 'The phoenix flame'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Neu: (.+)$/, (m, a) => 'New: ' + ((GL.data.en || {})[a] || a)],
  [/^(.+) steht in blauer Phönix-Flamme wieder auf!$/, '$1 rises again in blue phoenix flame!'],
  [/^(Logia|Paramecia|Zoan) \((Teufelsfrüchte)\)/, '$1 (devil fruits)']
]);
