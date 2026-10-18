// Crew-Momente: kleine Mini-Clips mit einer Figur an ihrer Heimat-Kulisse (wie die Story-Szenen, nur kürzer).
//   home  = Figur, deren Kulisse gezeigt wird (gleiche Themen wie die Charakter-Karten)
//   lines = [Sprecher, Deutsch, Englisch, Emote?, Effekt?]
// Höchstens einer pro Hafenbesuch, nur mit Figuren aus Stammcrew oder letztem Run.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.crewClips = [
  { id: 'cm-zorro-dojo', home: 'zorro', title: ['Zorro trainiert', 'Zoro trains'], lines: [
    ['zorro', 'Tausend Schwertstreiche vor dem Frühstück. Das hält den Geist klar.', 'A thousand sword strikes before breakfast. Keeps the mind clear.'],
    ['self', 'Zorro, das ist nicht dein Dojo. Das ist eine Bäckerei.', 'Zoro, this is not your dojo. It is a bakery.', '💦'],
    ['zorro', '…Dann trainiere ich eben mit Brötchen.', '…Then I will train with bread rolls.', '', 'boing']
  ] },
  { id: 'cm-sanji-baratie', home: 'sanji', title: ['Zurück in der Baratie', 'Back at the Baratie'], lines: [
    ['sanji', 'Jeder, der hier hungrig reinkommt, geht satt raus. Das ist das Gesetz der Küche.', 'Whoever comes in hungry leaves full. That is the law of the kitchen.', '♪'],
    ['ruffy', 'Ich bin hungrig reingekommen. Dreimal.', 'I came in hungry. Three times.', '🍖'],
    ['sanji', 'Ich weiß. Ich hab die Rechnung.', 'I know. I have the bill.', '💢', 'shake']
  ] },
  { id: 'cm-nami-orchard', home: 'nami', title: ['Mandarinenernte', 'Tangerine harvest'], lines: [
    ['nami', 'Jede Mandarine ist gezählt. Jede.', 'Every tangerine is counted. Every single one.', '💰'],
    ['lysop', 'Auch die, die runtergefallen ist und die ich zufällig gerettet habe?', 'Even the one that fell down and that I happened to rescue?', '💦'],
    ['nami', 'Die ganz besonders. Das macht 2.000 Berry.', 'That one especially. That is 2,000 Berry.', '', 'zoom']
  ] },
  { id: 'cm-lysop-syrup', home: 'lysop', title: ['Zielübungen in Syrup', 'Target practice in Syrup'], lines: [
    ['lysop', 'Mitten ins Schwarze. Aus achthundert Metern. Mit verbundenen Augen.', 'Bullseye. From eight hundred meters. Blindfolded.', '✨'],
    ['self', 'Die Zielscheibe steht einen Meter vor dir.', 'The target is one meter in front of you.'],
    ['lysop', 'Ich hab eben Rücksicht auf die Zuschauer genommen.', 'I was being considerate of the audience.', '💦', 'boing']
  ] },
  { id: 'cm-chopper-snow', home: 'chopper', title: ['Schnee auf Drumm', 'Snow on Drum'], lines: [
    ['chopper', 'Hier hab ich Medizin gelernt. Und wie man im Schnee unsichtbar wird.', 'This is where I learned medicine. And how to vanish in the snow.', '♪'],
    ['self', 'Chopper, man sieht deine Nase.', 'Chopper, we can see your nose.'],
    ['chopper', 'Sag sowas nicht, du Idiot! … Ist sie wirklich so blau?', 'Don’t say that, you jerk! … Is it really that blue?', '♥', 'jump']
  ] },
  { id: 'cm-robin-ruins', home: 'robin', title: ['Robin liest Steine', 'Robin reads stones'], lines: [
    ['robin', 'Diese Inschrift ist achthundert Jahre alt. Sie erzählt von einer Crew, die nie aufgab.', 'This inscription is eight hundred years old. It tells of a crew that never gave up.'],
    ['franky', 'Und wie endet sie?', 'And how does it end?'],
    ['robin', 'Mit einer Einkaufsliste. Fufu. Sogar Legenden brauchen Brot.', 'With a shopping list. Fufu. Even legends need bread.', '', 'sparkle']
  ] },
  { id: 'cm-franky-dock', home: 'franky', title: ['Frankys Werft', 'Franky’s shipyard'], lines: [
    ['franky', 'SUUUPER! Ich hab den Kran verbessert. Er kann jetzt auch Cola zapfen.', 'SUUUPER! I upgraded the crane. It can tap cola now.', '✨', 'shake'],
    ['nami', 'Kann er auch Kisten heben?', 'Can it still lift crates?'],
    ['franky', '…Das war Version eins.', '…That was version one.', '💦']
  ] },
  { id: 'cm-brook-mist', home: 'brook', title: ['Ein Lied im Nebel', 'A song in the fog'], lines: [
    ['brook', 'Yohoho! Im Nebel klingt die Geige so schön schaurig.', 'Yohoho! The violin sounds so lovely and eerie in the fog.', '♪', 'sparkle'],
    ['chopper', 'Brook, da hinten bewegt sich was!', 'Brook, something is moving back there!', '!', 'zoom'],
    ['brook', 'Keine Sorge. Das ist nur mein Spiegelbild. Ich hab nämlich keins. Yohoho!', 'No worries. That is just my reflection. I don’t have one, you see. Yohoho!', '💦', 'boing']
  ] },
  { id: 'cm-ruffy-foosha', home: 'ruffy', title: ['Heimat Foosha', 'Home in Foosha'], lines: [
    ['ruffy', 'Hier hat alles angefangen. Die Windmühle, die Kneipe, das Fleisch.', 'This is where it all began. The windmill, the bar, the meat.', '🍖'],
    ['self', 'Und der Traum, König der Piraten zu werden?', 'And the dream to become King of the Pirates?'],
    ['ruffy', 'Der auch. Aber zuerst das Fleisch.', 'That too. But first the meat.', '♥', 'jump']
  ] },
  { id: 'cm-zorro-lost', home: 'zorro', need: 'zorro', title: ['Kurz zum Steg', 'Just to the pier'], lines: [
    ['zorro', 'Ich geh nur kurz zum Steg.', 'Just heading to the pier.'],
    ['nami', 'Der Steg ist hinter dir.', 'The pier is behind you.', '💢'],
    ['zorro', 'Ich weiß. Ich nehm den Panoramaweg.', 'I know. I am taking the scenic route.']
  ] },
  { id: 'cm-vivi-desert', home: 'vivi', title: ['Wüstenwind', 'Desert wind'], lines: [
    ['vivi', 'In Alabasta sagt man: Wer Durst teilt, teilt auch das Wasser.', 'In Alabasta they say: whoever shares thirst shares the water too.'],
    ['ruffy', 'Und wer Hunger teilt?', 'And whoever shares hunger?'],
    ['vivi', 'Der teilt nicht mit dir. Das hab ich gelernt.', 'Does not share with you. I learned that.', '', 'boing']
  ] },
  { id: 'cm-ace-whale', home: 'ace', title: ['Feuerfaust an Deck', 'Fire Fist on deck'], lines: [
    ['ace', 'Ich halte nur kurz Wache. Wenn ich einschlafe, weck mich.', 'I am only keeping watch for a bit. If I fall asleep, wake me.'],
    ['self', 'Ace? … Ace?', 'Ace? … Ace?'],
    ['ace', 'Zz… Bin wach. Total wach. Wo war ich?', 'Zz… I’m awake. Totally awake. Where was I?', 'Zz', 'boing']
  ] },
  { id: 'cm-sanji-hearts', home: 'sanji', title: ['Sanji kocht für alle', 'Sanji cooks for everyone'], lines: [
    ['sanji', 'Heute gibt es Fischsuppe. Mit Liebe gewürzt.', 'Today: fish soup. Seasoned with love.', '♥'],
    ['zorro', 'Schmeckt nach Pfeffer.', 'Tastes like pepper.'],
    ['sanji', 'Die Liebe ist für die anderen. Du kriegst Pfeffer.', 'The love is for the others. You get pepper.', '💢', 'shake']
  ] },
  { id: 'cm-nami-map', home: 'nami', title: ['Die neue Karte', 'The new map'], lines: [
    ['nami', 'Drei Nächte hab ich an dieser Karte gezeichnet.', 'I spent three nights drawing this map.'],
    ['ruffy', 'Da ist ein Fleck drauf. Sieht aus wie ein Fleischknochen.', 'There is a stain on it. Looks like a meat bone.', '!'],
    ['nami', 'DAS ist eine Insel. Und du gehst heute leer aus.', 'THAT is an island. And you get nothing tonight.', '💢', 'zoom']
  ] }
];
