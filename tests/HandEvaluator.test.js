import HandEvaluator from '../src/core/HandEvaluator.js';
import Card from '../src/core/Card.js';

describe('HandEvaluator', () => {
  const makeCards = (cardStrings) => {
    return cardStrings.map(str => {
      const rank = str.slice(0, -1);
      const suitMap = { 'H': 'Hearts', 'D': 'Diamonds', 'C': 'Clubs', 'S': 'Spades' };
      const suit = suitMap[str.slice(-1)];
      return new Card(suit, rank);
    });
  };

  describe('evaluateHand', () => {
    test('throws error for less than 5 cards', () => {
      const cards = makeCards(['AH', 'KH', 'QH']);
      expect(() => HandEvaluator.evaluateHand(cards)).toThrow('Must provide at least 5 cards');
    });

    test('identifies Royal Flush', () => {
      const cards = makeCards(['AH', 'KH', 'QH', 'JH', '10H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.ROYAL_FLUSH);
      expect(result.name).toBe('Royal Flush');
      expect(result.values).toEqual([14]);
    });

    test('identifies Straight Flush', () => {
      const cards = makeCards(['9H', '8H', '7H', '6H', '5H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.STRAIGHT_FLUSH);
      expect(result.name).toBe('Straight Flush');
      expect(result.values).toEqual([9]);
    });

    test('identifies Straight Flush with 7 cards', () => {
      const cards = makeCards(['9H', '8H', '7H', '6H', '5H', '2C', '3D']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.STRAIGHT_FLUSH);
      expect(result.name).toBe('Straight Flush');
    });

    test('identifies Four of a Kind', () => {
      const cards = makeCards(['KH', 'KD', 'KC', 'KS', '5H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.FOUR_OF_A_KIND);
      expect(result.name).toBe('Four of a Kind');
      expect(result.values[0]).toBe(13);
      expect(result.values[1]).toBe(5);
    });

    test('identifies Full House', () => {
      const cards = makeCards(['KH', 'KD', 'KC', '5S', '5H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.FULL_HOUSE);
      expect(result.name).toBe('Full House');
      expect(result.values).toEqual([13, 5]);
    });

    test('identifies Full House with 7 cards (multiple three of a kinds)', () => {
      const cards = makeCards(['KH', 'KD', 'KC', '5S', '5H', '5D', '2C']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.FULL_HOUSE);
      expect(result.values).toEqual([13, 5]);
    });

    test('identifies Flush', () => {
      const cards = makeCards(['AH', 'JH', '9H', '6H', '3H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.FLUSH);
      expect(result.name).toBe('Flush');
      expect(result.values).toEqual([14, 11, 9, 6, 3]);
    });

    test('identifies Flush with 7 cards', () => {
      const cards = makeCards(['AH', 'JH', '9H', '6H', '3H', '2H', 'KC']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.FLUSH);
      expect(result.values).toEqual([14, 11, 9, 6, 3]);
    });

    test('identifies Straight', () => {
      const cards = makeCards(['9H', '8D', '7C', '6S', '5H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.STRAIGHT);
      expect(result.name).toBe('Straight');
      expect(result.values).toEqual([9]);
    });

    test('identifies Ace-low Straight (wheel)', () => {
      const cards = makeCards(['AH', '5D', '4C', '3S', '2H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.STRAIGHT);
      expect(result.values).toEqual([5]);
    });

    test('identifies Straight with 7 cards', () => {
      const cards = makeCards(['9H', '8D', '7C', '6S', '5H', '2D', 'KC']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.STRAIGHT);
    });

    test('identifies Three of a Kind', () => {
      const cards = makeCards(['KH', 'KD', 'KC', '9S', '5H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.THREE_OF_A_KIND);
      expect(result.name).toBe('Three of a Kind');
      expect(result.values).toEqual([13, 9, 5]);
    });

    test('identifies Two Pair', () => {
      const cards = makeCards(['KH', 'KD', '5C', '5S', '9H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.TWO_PAIR);
      expect(result.name).toBe('Two Pair');
      expect(result.values).toEqual([13, 5, 9]);
    });

    test('identifies Two Pair with 7 cards (3 pairs)', () => {
      const cards = makeCards(['KH', 'KD', '5C', '5S', '9H', '9D', '2C']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.TWO_PAIR);
      expect(result.values[0]).toBe(13);
      expect(result.values[1]).toBe(9);
    });

    test('identifies Pair', () => {
      const cards = makeCards(['KH', 'KD', '9C', '7S', '5H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.PAIR);
      expect(result.name).toBe('Pair');
      expect(result.values).toEqual([13, 9, 7, 5]);
    });

    test('identifies High Card', () => {
      const cards = makeCards(['AH', 'JD', '9C', '7S', '5H']);
      const result = HandEvaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandEvaluator.HAND_RANKS.HIGH_CARD);
      expect(result.name).toBe('High Card');
      expect(result.values).toEqual([14, 11, 9, 7, 5]);
    });
  });

  describe('compareHands', () => {
    test('higher ranked hand wins', () => {
      const flush = HandEvaluator.evaluateHand(makeCards(['AH', 'JH', '9H', '6H', '3H']));
      const straight = HandEvaluator.evaluateHand(makeCards(['9D', '8C', '7S', '6H', '5D']));

      expect(HandEvaluator.compareHands(flush, straight)).toBeGreaterThan(0);
      expect(HandEvaluator.compareHands(straight, flush)).toBeLessThan(0);
    });

    test('same rank compares by values', () => {
      const acePair = HandEvaluator.evaluateHand(makeCards(['AH', 'AD', 'KC', 'QS', 'JH']));
      const kingPair = HandEvaluator.evaluateHand(makeCards(['KH', 'KD', 'QC', 'JS', '10H']));

      expect(HandEvaluator.compareHands(acePair, kingPair)).toBeGreaterThan(0);
      expect(HandEvaluator.compareHands(kingPair, acePair)).toBeLessThan(0);
    });

    test('identical hands return 0', () => {
      const hand1 = HandEvaluator.evaluateHand(makeCards(['AH', 'AD', 'KC', 'QS', 'JH']));
      const hand2 = HandEvaluator.evaluateHand(makeCards(['AS', 'AC', 'KD', 'QH', 'JD']));

      expect(HandEvaluator.compareHands(hand1, hand2)).toBe(0);
    });

    test('compares kickers for same pair', () => {
      const hand1 = HandEvaluator.evaluateHand(makeCards(['KH', 'KD', 'AC', 'QS', 'JH']));
      const hand2 = HandEvaluator.evaluateHand(makeCards(['KS', 'KC', 'AD', 'QH', '10D']));

      expect(HandEvaluator.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

    test('compares two pair correctly', () => {
      const hand1 = HandEvaluator.evaluateHand(makeCards(['AH', 'AD', 'KC', 'KS', 'QH']));
      const hand2 = HandEvaluator.evaluateHand(makeCards(['AS', 'AC', 'QD', 'QH', 'KD']));

      expect(HandEvaluator.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

    test('compares straight flush by high card', () => {
      const hand1 = HandEvaluator.evaluateHand(makeCards(['9H', '8H', '7H', '6H', '5H']));
      const hand2 = HandEvaluator.evaluateHand(makeCards(['8D', '7D', '6D', '5D', '4D']));

      expect(HandEvaluator.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });
  });
});
