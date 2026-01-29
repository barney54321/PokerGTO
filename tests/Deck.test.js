import Deck from '../src/core/Deck.js';
import Card from '../src/core/Card.js';

describe('Deck', () => {
  describe('constructor', () => {
    test('creates a deck with 52 cards', () => {
      const deck = new Deck();
      expect(deck.cards.length).toBe(52);
    });

    test('creates all unique cards', () => {
      const deck = new Deck();
      const cardStrings = deck.cards.map(card => card.toString());
      const uniqueCards = new Set(cardStrings);
      expect(uniqueCards.size).toBe(52);
    });

    test('creates 4 suits of 13 cards each', () => {
      const deck = new Deck();
      const suitCounts = {};

      deck.cards.forEach(card => {
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      });

      expect(Object.keys(suitCounts).length).toBe(4);
      Object.values(suitCounts).forEach(count => {
        expect(count).toBe(13);
      });
    });
  });

  describe('reset', () => {
    test('resets deck to 52 cards', () => {
      const deck = new Deck();
      deck.deal(10);
      expect(deck.cards.length).toBe(42);

      deck.reset();
      expect(deck.cards.length).toBe(52);
    });

    test('creates fresh cards after reset', () => {
      const deck = new Deck();
      const firstCard = deck.cards[0];
      deck.reset();
      const newFirstCard = deck.cards[0];

      expect(firstCard.equals(newFirstCard)).toBe(true);
      expect(firstCard).not.toBe(newFirstCard);
    });
  });

  describe('shuffle', () => {
    test('maintains deck size after shuffle', () => {
      const deck = new Deck();
      deck.shuffle();
      expect(deck.cards.length).toBe(52);
    });

    test('randomizes card order', () => {
      const deck1 = new Deck();
      const deck2 = new Deck();

      deck1.shuffle();

      const deck1Strings = deck1.cards.map(c => c.toString()).join(',');
      const deck2Strings = deck2.cards.map(c => c.toString()).join(',');

      expect(deck1Strings).not.toBe(deck2Strings);
    });

    test('contains all original cards after shuffle', () => {
      const deck = new Deck();
      const originalCards = deck.cards.map(c => c.toString()).sort();

      deck.shuffle();
      const shuffledCards = deck.cards.map(c => c.toString()).sort();

      expect(shuffledCards).toEqual(originalCards);
    });
  });

  describe('deal', () => {
    test('deals one card by default', () => {
      const deck = new Deck();
      const dealtCards = deck.deal();

      expect(dealtCards.length).toBe(1);
      expect(dealtCards[0]).toBeInstanceOf(Card);
      expect(deck.cards.length).toBe(51);
    });

    test('deals multiple cards', () => {
      const deck = new Deck();
      const dealtCards = deck.deal(5);

      expect(dealtCards.length).toBe(5);
      expect(deck.cards.length).toBe(47);
    });

    test('removes dealt cards from deck', () => {
      const deck = new Deck();
      const firstCard = deck.cards[0];
      const dealtCards = deck.deal(1);

      expect(dealtCards[0].equals(firstCard)).toBe(true);
      expect(deck.cards.find(c => c.equals(firstCard))).toBeUndefined();
    });

    test('throws error when dealing more cards than available', () => {
      const deck = new Deck();
      deck.deal(50);

      expect(() => deck.deal(10)).toThrow('Cannot deal 10 cards, only 2 remaining');
    });

    test('deals cards in order from top', () => {
      const deck = new Deck();
      const topThree = deck.cards.slice(0, 3);
      const dealt = deck.deal(3);

      expect(dealt[0].equals(topThree[0])).toBe(true);
      expect(dealt[1].equals(topThree[1])).toBe(true);
      expect(dealt[2].equals(topThree[2])).toBe(true);
    });
  });

  describe('cardsRemaining', () => {
    test('returns 52 for new deck', () => {
      const deck = new Deck();
      expect(deck.cardsRemaining()).toBe(52);
    });

    test('returns correct count after dealing', () => {
      const deck = new Deck();
      deck.deal(10);
      expect(deck.cardsRemaining()).toBe(42);
    });

    test('returns 0 when deck is empty', () => {
      const deck = new Deck();
      deck.deal(52);
      expect(deck.cardsRemaining()).toBe(0);
    });
  });
});
