export default class HandEvaluator {
  static HAND_RANKS = {
    HIGH_CARD: 1,
    PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
  };

  static evaluateHand(cards) {
    if (!cards || cards.length < 5) {
      throw new Error('Must provide at least 5 cards');
    }

    const sortedCards = [...cards].sort((a, b) => b.value - a.value);

    const flushSuit = this._getFlushSuit(sortedCards);
    const straightValue = this._getStraightValue(sortedCards);
    const groups = this._groupByRank(sortedCards);

    if (flushSuit && straightValue === 14) {
      return {
        rank: this.HAND_RANKS.ROYAL_FLUSH,
        name: 'Royal Flush',
        values: [14]
      };
    }

    if (flushSuit && straightValue) {
      return {
        rank: this.HAND_RANKS.STRAIGHT_FLUSH,
        name: 'Straight Flush',
        values: [straightValue]
      };
    }

    if (groups[4]) {
      return {
        rank: this.HAND_RANKS.FOUR_OF_A_KIND,
        name: 'Four of a Kind',
        values: [groups[4][0], groups[1] ? groups[1][0] : sortedCards.find(c => c.value !== groups[4][0]).value]
      };
    }

    if (groups[3] && (groups[2] || (groups[3].length >= 2))) {
      const trip = groups[3][0];
      const pair = groups[2] ? groups[2][0] : groups[3][1];
      return {
        rank: this.HAND_RANKS.FULL_HOUSE,
        name: 'Full House',
        values: [trip, pair]
      };
    }

    if (flushSuit) {
      const flushCards = sortedCards.filter(c => c.suit === flushSuit);
      const topFive = flushCards.slice(0, 5).map(c => c.value);
      return {
        rank: this.HAND_RANKS.FLUSH,
        name: 'Flush',
        values: topFive
      };
    }

    if (straightValue) {
      return {
        rank: this.HAND_RANKS.STRAIGHT,
        name: 'Straight',
        values: [straightValue]
      };
    }

    if (groups[3]) {
      const kickers = sortedCards
        .filter(c => c.value !== groups[3][0])
        .slice(0, 2)
        .map(c => c.value);
      return {
        rank: this.HAND_RANKS.THREE_OF_A_KIND,
        name: 'Three of a Kind',
        values: [groups[3][0], ...kickers]
      };
    }

    if (groups[2] && groups[2].length >= 2) {
      const pairs = groups[2].slice(0, 2);
      const kicker = sortedCards
        .find(c => c.value !== pairs[0] && c.value !== pairs[1]);
      return {
        rank: this.HAND_RANKS.TWO_PAIR,
        name: 'Two Pair',
        values: [pairs[0], pairs[1], kicker ? kicker.value : 0]
      };
    }

    if (groups[2]) {
      const kickers = sortedCards
        .filter(c => c.value !== groups[2][0])
        .slice(0, 3)
        .map(c => c.value);
      return {
        rank: this.HAND_RANKS.PAIR,
        name: 'Pair',
        values: [groups[2][0], ...kickers]
      };
    }

    return {
      rank: this.HAND_RANKS.HIGH_CARD,
      name: 'High Card',
      values: sortedCards.slice(0, 5).map(c => c.value)
    };
  }

  static compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank;
    }

    for (let i = 0; i < Math.max(hand1.values.length, hand2.values.length); i++) {
      const val1 = hand1.values[i] || 0;
      const val2 = hand2.values[i] || 0;

      if (val1 !== val2) {
        return val1 - val2;
      }
    }

    return 0;
  }

  static _getFlushSuit(cards) {
    const suits = {};
    for (const card of cards) {
      suits[card.suit] = (suits[card.suit] || 0) + 1;
      if (suits[card.suit] >= 5) {
        return card.suit;
      }
    }
    return null;
  }

  static _getStraightValue(cards) {
    const uniqueValues = [...new Set(cards.map(c => c.value))].sort((a, b) => b - a);

    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      let isStraight = true;
      for (let j = 0; j < 4; j++) {
        if (uniqueValues[i + j] - uniqueValues[i + j + 1] !== 1) {
          isStraight = false;
          break;
        }
      }
      if (isStraight) {
        return uniqueValues[i];
      }
    }

    if (uniqueValues.includes(14) && uniqueValues.includes(5) &&
        uniqueValues.includes(4) && uniqueValues.includes(3) &&
        uniqueValues.includes(2)) {
      return 5;
    }

    return null;
  }

  static _groupByRank(cards) {
    const rankCounts = {};
    for (const card of cards) {
      rankCounts[card.value] = (rankCounts[card.value] || 0) + 1;
    }

    const groups = {};
    for (const [value, count] of Object.entries(rankCounts)) {
      if (!groups[count]) {
        groups[count] = [];
      }
      groups[count].push(parseInt(value));
    }

    for (const count in groups) {
      groups[count].sort((a, b) => b - a);
    }

    return groups;
  }
}
