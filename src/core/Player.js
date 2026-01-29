export default class Player {
  constructor(id, name, chips) {
    this.id = id;
    this.name = name;
    this.chips = chips;
    this.holeCards = [];
    this.isActive = true;
    this.isFolded = false;
    this.currentBet = 0;
    this.isDealer = false;
    this.position = null;
    this.totalBetThisHand = 0;
  }

  bet(amount) {
    if (amount < 0) {
      throw new Error('Bet amount cannot be negative');
    }

    if (amount > this.chips) {
      throw new Error(`Insufficient chips: has ${this.chips}, trying to bet ${amount}`);
    }

    this.chips -= amount;
    this.currentBet += amount;
    this.totalBetThisHand += amount;

    return amount;
  }

  fold() {
    this.isFolded = true;
  }

  receiveCards(cards) {
    this.holeCards.push(...cards);
  }

  clearHand() {
    this.holeCards = [];
    this.isFolded = false;
    this.currentBet = 0;
    this.totalBetThisHand = 0;
  }

  canAct() {
    return this.isActive && !this.isFolded && this.chips > 0;
  }

  isAllIn() {
    return this.chips === 0 && !this.isFolded && this.isActive;
  }

  winChips(amount) {
    this.chips += amount;
  }

  eliminate() {
    this.isActive = false;
  }

  resetForNewHand() {
    this.clearHand();
    if (this.chips === 0) {
      this.eliminate();
    }
  }
}
