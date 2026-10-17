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
  { id: 'hatchan', name: 'Hatchan', type: 'klinge', island: 0, hpX: 1.6, atkX: 0.8, spd: 5, bounty: 12,
    look: { hair: '#c0392b', skin: '#e89a8a', shirt: '#e8c040', pants: '#3a5a8a', hat: 'cap', hatColor: '#e8e8e8' } },
  // Paradies
  { id: 'mr9', name: 'Mr. 9', type: 'technik', island: 1, hpX: 1.6, atkX: 0.85, spd: 7, bounty: 20,
    look: { hair: '#d0d0d0', skin: '#f2c9a0', shirt: '#3a5aa8', pants: '#2a2a2a', hat: 'band', hatColor: '#c0392b' } },
  { id: 'mr1', name: 'Mr. 1', type: 'klinge', island: 1, hpX: 2.2, atkX: 1.05, spd: 6, bounty: 60,
    look: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#2a2a2a', pants: '#2a2a2a' } },
  { id: 'ohm', name: 'Ohm', type: 'klinge', island: 1, hpX: 2.1, atkX: 1.0, spd: 6, bounty: 45,
    look: { hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#5a4a3a', hat: 'band', hatColor: '#e8e8e8' } },
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
  { id: 'blueno', name: 'Blueno', type: 'kraft', island: 2, hpX: 2.6, atkX: 0.95, spd: 5, bounty: 82,
    look: { hair: '#3a2a1a', skin: '#e0b088', shirt: '#2a2a2a', pants: '#2a2a2a', hat: 'band', hatColor: '#2a2a2a' } },
  { id: 'jabra', name: 'Jabra', type: 'kraft', island: 2, hpX: 2.3, atkX: 1.1, spd: 7, bounty: 85,
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#2a2a2a' } },
  { id: 'foxy', name: 'Foxy', type: 'klinge', island: 2, hpX: 2.1, atkX: 1.0, spd: 6, bounty: 90,
    look: { hair: '#c86a2a', skin: '#f2c9a0', shirt: '#2a6a3a', pants: '#2a2a2a', hat: 'band', hatColor: '#2a2a2a' } },
  // Thriller Bark (zweite Route des dritten Meeres)
  { id: 'absalom', name: 'Absalom', type: 'klinge', island: 2, sea: 'thriller-bark', hpX: 1.9, atkX: 0.95, spd: 7, bounty: 70,
    look: { hair: '#e8e0d0', skin: '#e8c8a0', shirt: '#6a3a6a', pants: '#2a2a2a', hat: 'band', hatColor: '#8a5a2a' } },
  { id: 'perona', name: 'Perona', type: 'technik', island: 2, sea: 'thriller-bark', hpX: 1.7, atkX: 0.85, spd: 7, bounty: 72,
    look: { hair: '#e870a0', skin: '#f2d0b8', shirt: '#2a1a2a', pants: '#e870a0' } },
  { id: 'hogback', name: 'Dr. Hogback', type: 'technik', island: 2, sea: 'thriller-bark', hpX: 1.8, atkX: 0.8, spd: 5, bounty: 68,
    look: { hair: '#2a2a2a', skin: '#e8c8a0', shirt: '#f0f0f0', pants: '#5a4a3a' } },
  { id: 'duval', name: 'Duval', type: 'kraft', island: 2, sea: 'thriller-bark', hpX: 2.1, atkX: 0.95, spd: 5, bounty: 66,
    look: { hair: '#e8c040', skin: '#f2c9a0', shirt: '#5a5a6a', pants: '#3a3a4a', hat: 'cap', hatColor: '#8a8a9a' } }
];
