// Kopfgeld-Ziele: Mini-Bosse auf den Kopfgeldjäger-Orten der Seekarte.
// Wer sie besiegt, kassiert ihr Kopfgeld (in Mio. Berry) und einen Schatz.
// island = Index der Insel (0 = East Blue). hpX/atkX = Faktor auf die normalen Gegnerwerte
// der Etappe (sie wachsen also mit). Fähigkeiten stehen in abilities.js.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.hunted = [
  // East Blue
  { id: 'morgan', name: 'Axt-Hand Morgan', type: 'kraft', island: 0, hpX: 1.4, atkX: 0.75, spd: 4, bounty: 10,
    look: { hair: '#c8a040', skin: '#e0b088', shirt: '#f0f0f0', pants: '#2f4a7a', hat: 'cap', hatColor: '#f0f0f0' } },
  { id: 'buggy', name: 'Buggy', type: 'technik', island: 0, hpX: 1.6, atkX: 0.85, spd: 5, bounty: 15,
    look: { hair: '#2f5aa8', skin: '#f2c9a0', shirt: '#c0392b', pants: '#3a2a5a', hat: 'cap', hatColor: '#e8a030' } },
  { id: 'kuro', name: 'Kuro', type: 'klinge', island: 0, hpX: 1.35, atkX: 0.7, spd: 8, bounty: 16,
    look: { hair: '#222222', skin: '#f2c9a0', shirt: '#1a1a1a', pants: '#1a1a1a' } },
  { id: 'krieg', name: 'Don Krieg', type: 'kraft', island: 0, hpX: 1.8, atkX: 0.8, spd: 4, bounty: 17,
    look: { hair: '#2a2a2a', skin: '#e0b088', shirt: '#c8a040', pants: '#5a5a5a' } },
  // Paradies
  { id: 'mr3', name: 'Mr. 3', type: 'technik', island: 1, hpX: 1.9, atkX: 0.9, spd: 6, bounty: 24,
    look: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#2a2a5a' } },
  { id: 'wapol', name: 'Wapol', type: 'kraft', island: 1, hpX: 2.4, atkX: 1.0, spd: 4, bounty: 32,
    look: { hair: '#c0392b', skin: '#f2c9a0', shirt: '#4a7a3a', pants: '#2a2a2a', hat: 'cap', hatColor: '#d0d0d0' } },
  { id: 'bellamy', name: 'Bellamy', type: 'kraft', island: 1, hpX: 2.0, atkX: 1.05, spd: 7, bounty: 55,
    look: { hair: '#e8d070', skin: '#e0b088', shirt: '#e0e0e0', pants: '#2a3a5a' } },
  // Enies Lobby
  { id: 'fukuro', name: 'Fukuro', type: 'kraft', island: 2, hpX: 2.5, atkX: 0.9, spd: 5, bounty: 70,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#2a2a2a' } },
  { id: 'nero', name: 'Nero', type: 'technik', island: 2, hpX: 1.9, atkX: 0.95, spd: 8, bounty: 75,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#2a2a2a', hat: 'cap', hatColor: '#c8c8c8' } },
  { id: 'spandam', name: 'Spandam', type: 'technik', island: 2, hpX: 1.8, atkX: 0.85, spd: 6, bounty: 80,
    look: { hair: '#7a4a9a', skin: '#f2c9a0', shirt: '#5a3a7a', pants: '#2a2a2a', hat: 'band', hatColor: '#c8c8c8' } },
  { id: 'foxy', name: 'Foxy', type: 'klinge', island: 2, hpX: 2.1, atkX: 1.0, spd: 6, bounty: 90,
    look: { hair: '#c86a2a', skin: '#f2c9a0', shirt: '#2a6a3a', pants: '#2a2a2a', hat: 'band', hatColor: '#2a2a2a' } }
];
