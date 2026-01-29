import Card from '../src/core/Card.js';

describe('Card', () => {
  describe('constructor', () => {
    test('creates a valid card', () => {
      const card = new Card('Hearts', 'A');
      expect(card.suit).toBe('Hearts');
      expect(card.rank).toBe('A');
      expect(card.value).toBe(14);
    });

    test('throws error for invalid suit', () => {
      expect(() => new Card('InvalidSuit', 'A')).toThrow('Invalid suit');
    });

    test('throws error for invalid rank', () => {
      expect(() => new Card('Hearts', 'InvalidRank')).toThrow('Invalid rank');
    });

    test('assigns correct values to cards', () => {
      expect(new Card('Hearts', '2').value).toBe(2);
      expect(new Card('Hearts', '10').value).toBe(10);
      expect(new Card('Hearts', 'J').value).toBe(11);
      expect(new Card('Hearts', 'Q').value).toBe(12);
      expect(new Card('Hearts', 'K').value).toBe(13);
      expect(new Card('Hearts', 'A').value).toBe(14);
    });
  });

  describe('toString', () => {
    test('returns formatted card string', () => {
      expect(new Card('Hearts', 'A').toString()).toBe('A♥');
      expect(new Card('Spades', 'K').toString()).toBe('K♠');
      expect(new Card('Diamonds', '10').toString()).toBe('10♦');
      expect(new Card('Clubs', '2').toString()).toBe('2♣');
    });
  });

  describe('equals', () => {
    test('returns true for identical cards', () => {
      const card1 = new Card('Hearts', 'A');
      const card2 = new Card('Hearts', 'A');
      expect(card1.equals(card2)).toBe(true);
    });

    test('returns false for different ranks', () => {
      const card1 = new Card('Hearts', 'A');
      const card2 = new Card('Hearts', 'K');
      expect(card1.equals(card2)).toBe(false);
    });

    test('returns false for different suits', () => {
      const card1 = new Card('Hearts', 'A');
      const card2 = new Card('Spades', 'A');
      expect(card1.equals(card2)).toBe(false);
    });

    test('returns false for null', () => {
      const card = new Card('Hearts', 'A');
      expect(card.equals(null)).toBe(false);
    });
  });

  describe('compare', () => {
    test('returns negative when first card is lower', () => {
      const card1 = new Card('Hearts', '2');
      const card2 = new Card('Spades', 'A');
      expect(Card.compare(card1, card2)).toBeLessThan(0);
    });

    test('returns positive when first card is higher', () => {
      const card1 = new Card('Hearts', 'A');
      const card2 = new Card('Spades', '2');
      expect(Card.compare(card1, card2)).toBeGreaterThan(0);
    });

    test('returns zero when cards have same rank', () => {
      const card1 = new Card('Hearts', 'K');
      const card2 = new Card('Spades', 'K');
      expect(Card.compare(card1, card2)).toBe(0);
    });
  });
});
