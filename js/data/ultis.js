// Ultimative Fähigkeiten (Ultis): jede Figur lädt im Kampf Energie auf (eigene Treffer, eingesteckte
// Treffer). Bei voller Leiste ersetzt die Ulti den nächsten normalen Angriff.
// Aufbau: { name, text, fx: [Effekte] }. Effekte werden der Reihe nach ausgeführt (js/engine/battle.js):
//   { do: 'strike', mult, target: 'front' | 'weakest' | 'all', pierce }  Schaden = Angriff × mult
//                                                                          pierce: ignoriert Rüstung/Abwehr
//   { do: 'status', key, rounds, value, target: 'front' | 'all' | 'hit' | 'allies' | 'self' }
//                                                                          hit = wer vom strike davor getroffen wurde
//   { do: 'heal', pct, target: 'self' | 'all' | 'lowest' }               Anteil vom Max-Leben
//   { do: 'atk', value, target: 'self' | 'allies' }                      Angriff bis Kampfende
//   { do: 'armor', value, target: 'self' | 'allies' }                    Rüstung bis Kampfende
//   { do: 'cleanse', target: 'allies' }                                   entfernt alle schlechten Zustände
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.ultis = {
  // Strohhutbande
  ruffy:   { name: 'Gum-Gum-Gatling', text: 'Trifft alle Gegner (90 %) und wird +2 Angriff stärker.',
             fx: [{ do: 'strike', mult: 0.9, target: 'all' }, { do: 'atk', value: 2, target: 'self' }] },
  zorro:   { name: 'Santoryu: Oni Giri', text: 'Gewaltiger Hieb auf den Vordersten (260 %), Blutung 3 Runden.',
             fx: [{ do: 'strike', mult: 2.6, target: 'front' }, { do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'hit' }] },
  nami:    { name: 'Thunderbolt Tempo', text: 'Blitz auf alle Gegner (100 %), der Vorderste ist betäubt, alle unter Schock.',
             fx: [{ do: 'strike', mult: 1, target: 'all' }, { do: 'status', key: 'stun', rounds: 1, target: 'front' }, { do: 'status', key: 'shock', rounds: 2, target: 'all' }] },
  lysop:   { name: 'Feuerstern', text: 'Schuss auf den schwächsten Gegner (240 %), setzt ihn in Brand.',
             fx: [{ do: 'strike', mult: 2.4, target: 'weakest' }, { do: 'status', key: 'burning', rounds: 2, value: 3, target: 'hit' }] },
  sanji:   { name: 'Diable Jambe', text: 'Brennender Tritt (200 %), Ziel brennt 2 Runden.',
             fx: [{ do: 'strike', mult: 2, target: 'front' }, { do: 'status', key: 'burning', rounds: 2, value: 3, target: 'hit' }] },
  chopper: { name: 'Monster Point', text: 'Heilt die ganze Crew um 15 % und wird selbst +4 Angriff stärker.',
             fx: [{ do: 'heal', pct: 0.15, target: 'all' }, { do: 'atk', value: 4, target: 'self' }] },
  robin:   { name: 'Cien Fleur: Clutch', text: 'Würgegriff am Vordersten (180 %), betäubt ihn.',
             fx: [{ do: 'strike', mult: 1.8, target: 'front' }, { do: 'status', key: 'stun', rounds: 1, target: 'hit' }] },
  franky:  { name: 'Radikal Beam', text: 'Strahl durch alle Gegner (120 %).',
             fx: [{ do: 'strike', mult: 1.2, target: 'all' }] },
  brook:   { name: 'Seelenlied', text: 'Furcht für alle Gegner (2 Runden), Mut für die Crew.',
             fx: [{ do: 'status', key: 'fear', rounds: 2, target: 'all' }, { do: 'status', key: 'brave', rounds: 2, target: 'allies' }] },

  // Marine
  garp:    { name: 'Faust der Liebe', text: 'Ein einziger, riesiger Schlag (300 %).',
             fx: [{ do: 'strike', mult: 3, target: 'front' }] },
  hina:    { name: 'Fesselkäfig', text: 'Fesselt den Vordersten (Betäubt), alle Gegner geschwächt (2 Runden).',
             fx: [{ do: 'status', key: 'stun', rounds: 1, target: 'front' }, { do: 'status', key: 'weak', rounds: 2, target: 'all' }] },
  tashigi: { name: 'Shigure', text: 'Präziser Schnitt (180 %), die Crew bekommt +1 Angriff.',
             fx: [{ do: 'strike', mult: 1.8, target: 'front' }, { do: 'atk', value: 1, target: 'allies' }] },
  koby:    { name: 'Soru-Stoß', text: 'Blitzschneller Stoß auf den Schwächsten (200 %), heilt sich um 15 %.',
             fx: [{ do: 'strike', mult: 2, target: 'weakest' }, { do: 'heal', pct: 0.15, target: 'self' }] },

  // CP9
  kalifa:  { name: 'Golden Away', text: 'Seifenschaum: alle Gegner 3 Runden geschwächt.',
             fx: [{ do: 'status', key: 'weak', rounds: 3, target: 'all' }] },
  kumadori:{ name: 'Seimei Kikan', text: 'Heilt sich um 40 %.',
             fx: [{ do: 'heal', pct: 0.4, target: 'self' }] },
  blueno:  { name: 'Tekkai Go', text: 'Die ganze Crew erleidet bis Kampfende 2 weniger Schaden.',
             fx: [{ do: 'armor', value: 2, target: 'allies' }] },
  jabra:   { name: 'Wolfsrudel', text: 'Reißender Angriff (220 %), Blutung 3 Runden.',
             fx: [{ do: 'strike', mult: 2.2, target: 'front' }, { do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'hit' }] },

  // Baroque Works
  bonclay: { name: 'Okama Kenpo', text: 'Tänzelnder Tritt (200 %), Ziel in Furcht (2 Runden).',
             fx: [{ do: 'strike', mult: 2, target: 'front' }, { do: 'status', key: 'fear', rounds: 2, target: 'hit' }] },
  mr5:     { name: 'Nose Fancy Cannon', text: 'Explosion auf alle Gegner (110 %).',
             fx: [{ do: 'strike', mult: 1.1, target: 'all' }] },
  vivi:    { name: 'Pfauenfächer', text: 'Heilt die Crew um 18 % und entfernt schlechte Zustände.',
             fx: [{ do: 'heal', pct: 0.18, target: 'all' }, { do: 'cleanse', target: 'allies' }] },
  mr1:     { name: 'Atlas-Klinge', text: 'Klingenhieb (240 %), Blutung 3 Runden.',
             fx: [{ do: 'strike', mult: 2.4, target: 'front' }, { do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'hit' }] },

  // Freischaltbare
  jinbei:  { name: 'Vagabundendrill', text: 'Wasserwelle auf alle (100 %), selbst +2 Rüstung.',
             fx: [{ do: 'strike', mult: 1, target: 'all' }, { do: 'armor', value: 2, target: 'self' }] },
  ace:     { name: 'Hiken', text: 'Feuerfaust auf alle (110 %), alle brennen 2 Runden.',
             fx: [{ do: 'strike', mult: 1.1, target: 'all' }, { do: 'status', key: 'burning', rounds: 2, value: 3, target: 'all' }] },
  law:     { name: 'Gamma Knife', text: 'Schneidet von innen (250 %), ignoriert Rüstung.',
             fx: [{ do: 'strike', mult: 2.5, target: 'front', pierce: true }] },

  marco:      { name: 'Phönix-Regen', text: 'Heilt die Crew um 22 % und entfernt schlechte Zustände.',
                fx: [{ do: 'heal', pct: 0.22, target: 'all' }, { do: 'cleanse', target: 'allies' }] },
  whitebeard: { name: 'Gura-Gura-Schlag', text: 'Erdbeben auf alle (140 %), alle in Furcht.',
                fx: [{ do: 'strike', mult: 1.4, target: 'all' }, { do: 'status', key: 'fear', rounds: 2, target: 'all' }] },
  mihawk:     { name: 'Kokuto: Yoru', text: 'Der stärkste Hieb der Welt (320 %), ignoriert Rüstung.',
                fx: [{ do: 'strike', mult: 3.2, target: 'front', pierce: true }] },
  hancock:    { name: 'Slave Arrow', text: 'Pfeile auf alle (80 %), der Vorderste versteinert.',
                fx: [{ do: 'strike', mult: 0.8, target: 'all' }, { do: 'status', key: 'stun', rounds: 1, target: 'front' }] },
  doflamingo: { name: 'Fadenkäfig', text: 'Fäden durch alle (110 %), alle geschwächt.',
                fx: [{ do: 'strike', mult: 1.1, target: 'all' }, { do: 'status', key: 'weak', rounds: 2, target: 'all' }] },
  shanks:     { name: 'Kamusari', text: 'Haki-Hieb (250 %), dazu Mut für die ganze Crew.',
                fx: [{ do: 'strike', mult: 2.5, target: 'front' }, { do: 'status', key: 'brave', rounds: 2, target: 'allies' }] },
  kizaru:     { name: 'Yasakani no Magatama', text: 'Lichtkugeln auf alle (100 %), alle geblendet.', fx: [{ do: 'strike', mult: 1, target: 'all' }, { do: 'status', key: 'blind', rounds: 1, target: 'all' }] },

  // Bosse und Bösewichte
  smoker:      { name: 'White Blow', text: 'Rauchfaust (200 %), betäubt das Ziel.',
                 fx: [{ do: 'strike', mult: 2, target: 'front' }, { do: 'status', key: 'stun', rounds: 1, target: 'hit' }] },
  arlong:      { name: 'Shark on Darts', text: 'Durchbohrt den Vordersten (230 %), Blutung.',
                 fx: [{ do: 'strike', mult: 2.3, target: 'front' }, { do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'hit' }] },
  crocodile:   { name: 'Desert Spada', text: 'Sandklinge durch alle (100 %).',
                 fx: [{ do: 'strike', mult: 1, target: 'all' }] },
  enel:        { name: 'El Thor', text: 'Gewaltiger Blitz auf alle (90 %), alle unter Schock.',
                 fx: [{ do: 'strike', mult: 0.9, target: 'all' }, { do: 'status', key: 'shock', rounds: 2, target: 'all' }] },
  hody:        { name: 'Yakuzame', text: 'Hai-Sturz auf den Vordersten (240 %), Blutung.',
                 fx: [{ do: 'strike', mult: 2.4, target: 'front' }, { do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'hit' }] },
  vander:      { name: 'Mato-Mato-Hagel', text: 'Markierte Geschosse auf alle (90 %).',
                 fx: [{ do: 'strike', mult: 0.9, target: 'all' }] },
  moria:       { name: 'Brick Bat', text: 'Fledermaus-Schatten auf alle (100 %).',
                 fx: [{ do: 'strike', mult: 1.0, target: 'all' }] },
  kuma:        { name: 'Ursus Shock', text: 'Druckwelle auf alle (110 %).',
                 fx: [{ do: 'strike', mult: 1.1, target: 'all' }] },
  teach:       { name: 'Kurouzu', text: 'Zieht den Vordersten heran (250 %).',
                 fx: [{ do: 'strike', mult: 2.5, target: 'front' }] },
  'rob-lucci': { name: 'Rokuogan', text: 'Schockwelle (220 %) auf den Vordersten.',
                 fx: [{ do: 'strike', mult: 2.2, target: 'front' }] },
  kaku:        { name: 'Amaashi', text: 'Klingenwind auf alle (90 %), alle geschwächt.',
                 fx: [{ do: 'strike', mult: 0.9, target: 'all' }, { do: 'status', key: 'weak', rounds: 2, target: 'all' }] },
  morgan:      { name: 'Axt-Urteil', text: 'Schwerer Axthieb (200 %).', fx: [{ do: 'strike', mult: 2, target: 'front' }] },
  buggy:       { name: 'Muggy Ball', text: 'Kanonenkugel auf alle (80 %).', fx: [{ do: 'strike', mult: 0.8, target: 'all' }] },
  kuro:        { name: 'Nuki Ashi', text: 'Lautlose Klingen auf alle (90 %).', fx: [{ do: 'strike', mult: 0.9, target: 'all' }] },
  krieg:       { name: 'Daisenso', text: 'Explosion (180 %), Gift für alle.',
                 fx: [{ do: 'strike', mult: 1.8, target: 'front' }, { do: 'status', key: 'poison', rounds: 2, value: 2, target: 'all' }] },
  hatchan:     { name: 'Takoyaki-Punch', text: 'Sechs Fäuste (200 %).', fx: [{ do: 'strike', mult: 2, target: 'front' }] },
  wapol:       { name: 'Baku-Baku-Kanone', text: 'Verschlingt und spuckt (180 %), heilt sich.',
                 fx: [{ do: 'strike', mult: 1.8, target: 'front' }, { do: 'heal', pct: 0.15, target: 'self' }] },
  // Inhalts-Update
  sabo:    { name: 'Hiken', text: 'Feuerfaust (240 %), Ziel brennt 3 Runden.',
             fx: [{ do: 'strike', mult: 2.4, target: 'front' }, { do: 'status', key: 'burning', rounds: 3, value: 3, target: 'hit' }] },
  ivankov: { name: 'Death Wink', text: 'Zwinkern mit Sturmkraft (150 %), heilt die Crew um 12 %.',
             fx: [{ do: 'strike', mult: 1.5, target: 'front' }, { do: 'heal', pct: 0.12, target: 'all' }] },
  koala:   { name: 'Gyojin-Karate', text: 'Wasserstoß durch alle Gegner (90 %).', fx: [{ do: 'strike', mult: 0.9, target: 'all' }] },
  dragon:  { name: 'Orkan', text: 'Sturm über alle Gegner (110 %), alle geschwächt (2 Runden).',
             fx: [{ do: 'strike', mult: 1.1, target: 'all' }, { do: 'status', key: 'weak', rounds: 2, target: 'all' }] },
  aokiji:  { name: 'Ice Time', text: 'Friert alle ein: Treffer (80 %), der Vorderste ist betäubt, alle bekommen Frost.',
             fx: [{ do: 'strike', mult: 0.8, target: 'all' }, { do: 'status', key: 'stun', rounds: 1, target: 'front' }, { do: 'status', key: 'frost', rounds: 2, target: 'all' }] },
  yasopp:  { name: 'Augenschuss', text: 'Schuss auf den Schwächsten (260 %).', fx: [{ do: 'strike', mult: 2.6, target: 'weakest' }] },
  beckman: { name: 'Gewehrkolben', text: 'Präziser Schlag (180 %), die Crew bekommt +2 Angriff.',
             fx: [{ do: 'strike', mult: 1.8, target: 'front' }, { do: 'atk', value: 2, target: 'allies' }] },
  roo:     { name: 'Festmahl', text: 'Heilt die ganze Crew um 20 %.', fx: [{ do: 'heal', pct: 0.2, target: 'all' }] },
  alvida:  { name: 'Eisenkeule', text: 'Rutschiger Keulenhieb (200 %), heilt sich um 15 %.',
             fx: [{ do: 'strike', mult: 2, target: 'front' }, { do: 'heal', pct: 0.15, target: 'self' }] },
  cabaji:  { name: 'Feuer-Akrobatik', text: 'Brennende Klingen auf alle (80 %).',
             fx: [{ do: 'strike', mult: 0.8, target: 'all' }, { do: 'status', key: 'burning', rounds: 2, value: 2, target: 'all' }] },
  mohji:   { name: 'Löwenbrüller', text: 'Richie springt (170 %), Ziel in Furcht (2 Runden).',
             fx: [{ do: 'strike', mult: 1.7, target: 'front' }, { do: 'status', key: 'fear', rounds: 2, target: 'hit' }] },
  kuroobi: { name: 'Karate-Welle', text: 'Wasserwelle auf alle (90 %).', fx: [{ do: 'strike', mult: 0.9, target: 'all' }] },
  chu:     { name: 'Wasserkugel', text: 'Durchschlagender Schuss auf den Schwächsten (230 %).', fx: [{ do: 'strike', mult: 2.3, target: 'weakest' }] },
  vista:   { name: 'Blütenmeer', text: 'Zwei Klingen auf alle (100 %).', fx: [{ do: 'strike', mult: 1.0, target: 'all' }] },
  fukuro:  { name: 'Jugon', text: 'Fingerpistole im Wirbel (190 %), heilt sich um 10 %.',
             fx: [{ do: 'strike', mult: 1.9, target: 'front' }, { do: 'heal', pct: 0.1, target: 'self' }] },
  kid:     { name: 'Punk Gibson', text: 'Riesige Metallfaust (240 %).', fx: [{ do: 'strike', mult: 2.4, target: 'front' }] },
  killer:  { name: 'Kamazo', text: 'Wirbelnde Sicheln auf alle (85 %), Blutung 2 Runden.',
             fx: [{ do: 'strike', mult: 0.85, target: 'all' }, { do: 'status', key: 'bleed', rounds: 2, value: 3, target: 'all' }] },
  bonney:  { name: 'Age Twister', text: 'Alle Gegner geschwächt (3 Runden), die Crew heilt 10 %.',
             fx: [{ do: 'status', key: 'weak', rounds: 3, target: 'all' }, { do: 'heal', pct: 0.1, target: 'all' }] },
  drake:   { name: 'Allosaurus-Biss', text: 'Biss (200 %), Ziel blutet 3 Runden.',
             fx: [{ do: 'strike', mult: 2, target: 'front' }, { do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'hit' }] },
  hawkins: { name: 'Fluchpuppe', text: 'Der Schwächste wird verflucht (200 %), die Crew wird mutig.',
             fx: [{ do: 'strike', mult: 2, target: 'weakest' }, { do: 'status', key: 'brave', rounds: 2, target: 'allies' }] },
  apoo:    { name: 'Tonkatsu', text: 'Schallwelle auf alle (95 %).', fx: [{ do: 'strike', mult: 0.95, target: 'all' }] },
  absalom: { name: 'Unsichtbarer Hieb', text: 'Hieb aus dem Nichts auf den Schwächsten (220 %).', fx: [{ do: 'strike', mult: 2.2, target: 'weakest' }] },
  hogback: { name: 'Notoperation', text: 'Heilt die Crew um 18 %.', fx: [{ do: 'heal', pct: 0.18, target: 'all' }] },
  perona:  { name: 'Ghost Rap', text: 'Geister explodieren auf allen Gegnern (85 %), alle in Furcht (1 Runde).',
             fx: [{ do: 'strike', mult: 0.85, target: 'all' }, { do: 'status', key: 'fear', rounds: 1, target: 'all' }] }

};

// Wer keine eigene Ulti hat, bekommt eine nach seiner Rolle (Crew) bzw. einen starken Schlag (Gegner)
GL.data.ultiDefaults = {
  kaempfer: { name: 'Volltreffer', text: 'Wuchtiger Schlag auf den Vordersten (200 %).', fx: [{ do: 'strike', mult: 2, target: 'front' }] },
  brecher:  { name: 'Bollwerk', text: 'Heilt sich um 25 % und erleidet bis Kampfende 2 weniger Schaden.',
              fx: [{ do: 'heal', pct: 0.25, target: 'self' }, { do: 'armor', value: 2, target: 'self' }] },
  helfer:   { name: 'Erste Hilfe', text: 'Heilt die Crew um 15 % und entfernt schlechte Zustände.',
              fx: [{ do: 'heal', pct: 0.15, target: 'all' }, { do: 'cleanse', target: 'allies' }] },
  foe:      { name: 'Wutschlag', text: 'Schwerer Schlag (180 %).', fx: [{ do: 'strike', mult: 1.8, target: 'front' }] }
};
