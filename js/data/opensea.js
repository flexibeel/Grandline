// Offene See: frei segeln statt nur Orte anklicken (Routen-Knoten 'sea').
// Pro Insel-Kapitel wird höchstens ein Ort der Karte zur „Offenen See“ (fest aus Seed + Etappe, kein Zufallszug).
// Dort segelt das Schiff über eine kleine Seekarte zum nächsten Halt: unterwegs 3 Funde (optional),
// 2 treibende Sturmwolken (wer drin endet, verliert Leben) und viel Leben auf dem Wasser.
// Regeln: js/engine/opensea.js · Anzeige: js/ui/opensea.js · Englisch: js/data/en-opensea.js
// Texte als [deutsch, englisch]; die Spiel-Logik nutzt nur die ids.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.openSea = {
  cfg: {
    chance: 0.75,        // Anteil der Insel-Kapitel mit einer Offenen See
    finds: 3,            // Funde pro Strecke
    storms: 2,           // Sturmwolken pro Strecke
    stormHurt: 0.15,     // Leben, das ein Sturm der ganzen Crew nimmt (nie unter 1)
    arriveGold: 3,       // Gold bei Ankunft (immer)
    dropBase: 0.12,      // Chance auf Ausrüstung bei Ankunft …
    dropPer: 0.12        // … plus je besuchtem Fund
  },
  // Funde auf dem Wasser. fight = Kampfart für den normalen Kampf (battle/elite), sonst eigener Ablauf in der Engine.
  kinds: {
    pirates:  { w: 3, fight: 'battle', name: ['Piratenschiff', 'Pirate ship'],
      text: ['Fremde Flagge, schlechte Laune. Ein normaler Kampf, bringt Gold.', 'Strange flag, bad mood. A normal fight, pays gold.'] },
    monster:  { w: 2, fight: 'elite', from: 2, name: ['Seeungeheuer', 'Sea monster'],
      text: ['Hat Hunger und angeblich einen Schatz im Bauch. Starker Kampf, danach ein Schatz.', 'Hungry, and rumoured to have treasure in its belly. Tough fight, then a treasure.'] },
    wreck:    { w: 2, name: ['Wrack', 'Wreck'],
      text: ['Ein Schiff, das schlechter navigiert hat als du. Ein Schatz zur Auswahl.', 'A ship that navigated worse than you. Pick a treasure.'] },
    merchant: { w: 2, name: ['Händlerschiff', 'Merchant ship'],
      text: ['Schwimmende Taverne. Heuer gegen Gold, Rabatt gegen Charme. Es gibt keinen Rabatt.', 'A floating tavern. Hire for gold, discounts for charm. There are no discounts.'] },
    isle:     { w: 2, name: ['Kleine Insel', 'Islet'],
      text: ['Zu klein für die Karte, groß genug für Ärger. Ein Ereignis.', 'Too small for the map, big enough for trouble. An event.'] }
  },
  txt: {
    kicker: ['Offene See', 'Open sea'],
    title: ['Kurs auf {d}', 'Heading for {d}'],
    hint: ['Tippe ein Ziel auf der Karte. Symbole sind Funde, Wolken sind Ärger.', 'Tap a spot on the chart. Symbols are finds, clouds are trouble.'],
    hint2: ['Weiter nach rechts, oder direkt zur Insel.', 'Keep heading right, or go straight to the island.'],
    go: ['Hinsegeln', 'Sail there'],
    direct: ['Direkt zur Insel', 'Straight to the island'],
    land: ['Anlegen', 'Make landfall'],
    water: ['Offenes Wasser', 'Open water'],
    waterText: ['Nichts als Wellen. Erholsam, wenn man Wellen mag.', 'Nothing but waves. Relaxing, if you like waves.'],
    dest: ['Ziel', 'Goal'],
    destText: ['Anlegen und weiter wie gewohnt. Ankunft: +{g} Gold, Chance auf Ausrüstung (steigt mit jedem Fund).', 'Land and carry on as usual. Arrival: +{g} gold, chance of gear (rises with every find).'],
    storm: ['Sturmwolke', 'Storm cloud'],
    stormNext: ['Sturm zieht hierher: −{p} % Leben', 'Storm drifts here: −{p} % HP'],
    stormRoute: ['Sturm auf direktem Kurs', 'Storm on the direct course'],
    stormHit: ['Mitten in den Sturm gesegelt. Die Crew ist nass und um {p} % Leben ärmer.', 'Sailed right into the storm. The crew is wet and {p} % HP poorer.'],
    stormMiss: ['Der Sturm zieht knapp vorbei. Nami tut so, als wäre das Absicht gewesen.', 'The storm passes just by. Nami pretends that was the plan.'],
    finds: ['Funde', 'Finds'],
    done: ['erledigt', 'done'],
    help: ['So geht Offene See', 'How the open sea works'],
    helpLines: [
      ['Dein Schiff segelt von links zur Insel rechts. Pro Tipp eine Spalte weiter.', 'Your ship sails from the left to the island on the right. One column per tap.'],
      ['Symbole sind Funde: Kampf, Schatz, Händler oder Ereignis. Alles freiwillig.', 'Symbols are finds: fight, treasure, merchant or event. All optional.'],
      ['Sturmwolken treiben bei jedem Zug weiter. Wo ein ⚡ steht, ist gleich Sturm: −{p} % Leben.', 'Storm clouds drift with every move. Where you see ⚡, a storm arrives: −{p} % HP.'],
      ['Ankunft bringt +{g} Gold und eine Chance auf Ausrüstung. Je mehr Funde, desto besser.', 'Arrival brings +{g} gold and a chance of gear. The more finds, the better.']
    ],
    ok: ['Leinen los', 'Cast off'],
    arriveTitle: ['Land in Sicht', 'Land ho'],
    arriveText: ['{f} Funde, {s} Stürme. Die Möwen sind beeindruckt. Mäßig.', '{f} finds, {s} storms. The gulls are impressed. Moderately.'],
    arriveCalm: ['Ohne Umwege angekommen. Effizient. Langweilig, aber effizient.', 'Arrived without detours. Efficient. Boring, but efficient.']
  }
};

// Routen-Knoten (Titel/Text wie die anderen Orte, wird von js/world/neutral.js mit umgeschrieben)
GL.data.nodes = GL.data.nodes || {};
GL.data.nodes.sea = { title: 'Offene See', text: 'Frei segeln: Funde einsammeln, Stürmen ausweichen.' };

// Sätze für die Wahlkarte in der Reise-Erzählung (routelines.js)
if (GL.data.routeLines && GL.data.routeLines.node) {
  GL.data.routeLines.node.sea = [
    ['Keine Straße, keine Schilder, nur Wasser. Nami hat trotzdem eine Meinung zur Route.', 'No road, no signs, just water. Nami still has opinions about the route.'],
    ['Offene See. Da draußen treibt Zeug herum. Manches davon beißt.', 'Open sea. Stuff drifts around out there. Some of it bites.'],
    ['Ein Umweg übers offene Meer. Mit Glück voller Schätze, mit Pech voller Wolken.', 'A detour across open water. With luck full of treasure, with bad luck full of clouds.']
  ];
}
