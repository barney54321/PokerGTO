import Card from './Card.js';

export default class Deck {
  constructor() {
    this.reset();
  }

  reset() {
    this.cards = [];
    for (const suit of Card.SUITS) {
      for (const rank of Card.RANKS) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count = 1) {
    if (count > this.cards.length) {
      throw new Error(`Cannot deal ${count} cards, only ${this.cards.length} remaining`);
    }
    return this.cards.splice(0, count);
  }

  cardsRemaining() {
    return this.cards.length;
  }
}
