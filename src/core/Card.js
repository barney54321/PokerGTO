export default class Card {
  static SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  static RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  static SUIT_SYMBOLS = {
    'Hearts': '♥',
    'Diamonds': '♦',
    'Clubs': '♣',
    'Spades': '♠'
  };

  constructor(suit, rank) {
    if (!Card.SUITS.includes(suit)) {
      throw new Error(`Invalid suit: ${suit}`);
    }
    if (!Card.RANKS.includes(rank)) {
      throw new Error(`Invalid rank: ${rank}`);
    }

    this.suit = suit;
    this.rank = rank;
    this.value = Card.RANKS.indexOf(rank) + 2;
  }

  toString() {
    return `${this.rank}${Card.SUIT_SYMBOLS[this.suit]}`;
  }

  equals(otherCard) {
    if (!otherCard) return false;
    return this.suit === otherCard.suit && this.rank === otherCard.rank;
  }

  static compare(card1, card2) {
    return card1.value - card2.value;
  }
}
