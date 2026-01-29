import Player from '../src/core/Player.js';
import Card from '../src/core/Card.js';

describe('Player', () => {
  describe('constructor', () => {
    test('creates a player with correct initial state', () => {
      const player = new Player(1, 'Alice', 500);

      expect(player.id).toBe(1);
      expect(player.name).toBe('Alice');
      expect(player.chips).toBe(500);
      expect(player.holeCards).toEqual([]);
      expect(player.isActive).toBe(true);
      expect(player.isFolded).toBe(false);
      expect(player.currentBet).toBe(0);
      expect(player.isDealer).toBe(false);
      expect(player.position).toBeNull();
      expect(player.totalBetThisHand).toBe(0);
    });
  });

  describe('bet', () => {
    test('deducts chips and updates current bet', () => {
      const player = new Player(1, 'Alice', 500);
      const betAmount = player.bet(100);

      expect(betAmount).toBe(100);
      expect(player.chips).toBe(400);
      expect(player.currentBet).toBe(100);
      expect(player.totalBetThisHand).toBe(100);
    });

    test('accumulates multiple bets in current bet', () => {
      const player = new Player(1, 'Alice', 500);

      player.bet(50);
      player.bet(30);

      expect(player.chips).toBe(420);
      expect(player.currentBet).toBe(80);
      expect(player.totalBetThisHand).toBe(80);
    });

    test('allows betting all chips (all-in)', () => {
      const player = new Player(1, 'Alice', 100);
      player.bet(100);

      expect(player.chips).toBe(0);
      expect(player.currentBet).toBe(100);
    });

    test('throws error for negative bet', () => {
      const player = new Player(1, 'Alice', 500);
      expect(() => player.bet(-10)).toThrow('Bet amount cannot be negative');
    });

    test('throws error for insufficient chips', () => {
      const player = new Player(1, 'Alice', 100);
      expect(() => player.bet(150)).toThrow('Insufficient chips');
    });
  });

  describe('fold', () => {
    test('sets isFolded to true', () => {
      const player = new Player(1, 'Alice', 500);
      player.fold();

      expect(player.isFolded).toBe(true);
    });
  });

  describe('receiveCards', () => {
    test('adds cards to hole cards', () => {
      const player = new Player(1, 'Alice', 500);
      const cards = [new Card('Hearts', 'A'), new Card('Spades', 'K')];

      player.receiveCards(cards);

      expect(player.holeCards.length).toBe(2);
      expect(player.holeCards[0].equals(cards[0])).toBe(true);
      expect(player.holeCards[1].equals(cards[1])).toBe(true);
    });

    test('appends to existing cards', () => {
      const player = new Player(1, 'Alice', 500);
      const cards1 = [new Card('Hearts', 'A')];
      const cards2 = [new Card('Spades', 'K')];

      player.receiveCards(cards1);
      player.receiveCards(cards2);

      expect(player.holeCards.length).toBe(2);
    });
  });

  describe('clearHand', () => {
    test('resets hand state', () => {
      const player = new Player(1, 'Alice', 500);
      player.receiveCards([new Card('Hearts', 'A'), new Card('Spades', 'K')]);
      player.bet(100);
      player.fold();

      player.clearHand();

      expect(player.holeCards).toEqual([]);
      expect(player.isFolded).toBe(false);
      expect(player.currentBet).toBe(0);
      expect(player.totalBetThisHand).toBe(0);
    });

    test('does not reset chips', () => {
      const player = new Player(1, 'Alice', 500);
      player.bet(100);
      player.clearHand();

      expect(player.chips).toBe(400);
    });
  });

  describe('canAct', () => {
    test('returns true for active player with chips who has not folded', () => {
      const player = new Player(1, 'Alice', 500);
      expect(player.canAct()).toBe(true);
    });

    test('returns false if player is not active', () => {
      const player = new Player(1, 'Alice', 500);
      player.isActive = false;
      expect(player.canAct()).toBe(false);
    });

    test('returns false if player has folded', () => {
      const player = new Player(1, 'Alice', 500);
      player.fold();
      expect(player.canAct()).toBe(false);
    });

    test('returns false if player has no chips', () => {
      const player = new Player(1, 'Alice', 100);
      player.bet(100);
      expect(player.canAct()).toBe(false);
    });
  });

  describe('isAllIn', () => {
    test('returns true when player has no chips but is active and not folded', () => {
      const player = new Player(1, 'Alice', 100);
      player.bet(100);

      expect(player.isAllIn()).toBe(true);
    });

    test('returns false when player has chips', () => {
      const player = new Player(1, 'Alice', 100);
      expect(player.isAllIn()).toBe(false);
    });

    test('returns false when player has folded', () => {
      const player = new Player(1, 'Alice', 100);
      player.bet(100);
      player.fold();

      expect(player.isAllIn()).toBe(false);
    });

    test('returns false when player is not active', () => {
      const player = new Player(1, 'Alice', 100);
      player.bet(100);
      player.isActive = false;

      expect(player.isAllIn()).toBe(false);
    });
  });

  describe('winChips', () => {
    test('adds chips to player stack', () => {
      const player = new Player(1, 'Alice', 500);
      player.winChips(200);

      expect(player.chips).toBe(700);
    });

    test('works after betting', () => {
      const player = new Player(1, 'Alice', 500);
      player.bet(100);
      player.winChips(300);

      expect(player.chips).toBe(700);
    });
  });

  describe('eliminate', () => {
    test('sets isActive to false', () => {
      const player = new Player(1, 'Alice', 500);
      player.eliminate();

      expect(player.isActive).toBe(false);
    });
  });

  describe('resetForNewHand', () => {
    test('clears hand state', () => {
      const player = new Player(1, 'Alice', 500);
      player.receiveCards([new Card('Hearts', 'A')]);
      player.bet(50);

      player.resetForNewHand();

      expect(player.holeCards).toEqual([]);
      expect(player.currentBet).toBe(0);
      expect(player.isFolded).toBe(false);
    });

    test('eliminates player if they have no chips', () => {
      const player = new Player(1, 'Alice', 50);
      player.bet(50);

      player.resetForNewHand();

      expect(player.isActive).toBe(false);
    });

    test('keeps player active if they have chips', () => {
      const player = new Player(1, 'Alice', 500);
      player.bet(50);

      player.resetForNewHand();

      expect(player.isActive).toBe(true);
    });
  });
});
