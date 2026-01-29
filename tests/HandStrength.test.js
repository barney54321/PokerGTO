import HandStrength from '../src/gto/HandStrength.js';
import Card from '../src/core/Card.js';

describe('HandStrength', () => {
  test('calculates win probability for strong hand', () => {
    const holeCards = [new Card('Hearts', 'A'), new Card('Spades', 'A')];
    const communityCards = [];

    const result = HandStrength.calculateWinProbability(holeCards, communityCards, 1, 100);

    expect(result.win + result.tie + result.loss).toBeCloseTo(1, 1);
    expect(result.win).toBeGreaterThan(0.5);
  });

  test('calculates win probability with community cards', () => {
    const holeCards = [new Card('Hearts', 'A'), new Card('Spades', 'K')];
    const communityCards = [
      new Card('Diamonds', 'A'),
      new Card('Clubs', 'K'),
      new Card('Hearts', 'Q')
    ];

    const result = HandStrength.calculateWinProbability(holeCards, communityCards, 1, 50);

    expect(result.win).toBeGreaterThan(0.7);
  });

  test('describes hand strength correctly', () => {
    expect(HandStrength.getHandStrengthDescription(0.9)).toBe('Very Strong');
    expect(HandStrength.getHandStrengthDescription(0.7)).toBe('Strong');
    expect(HandStrength.getHandStrengthDescription(0.5)).toBe('Medium');
    expect(HandStrength.getHandStrengthDescription(0.3)).toBe('Weak');
    expect(HandStrength.getHandStrengthDescription(0.1)).toBe('Very Weak');
  });
});
