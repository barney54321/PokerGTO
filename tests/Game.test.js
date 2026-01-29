import Game from '../src/core/Game.js';
import Card from '../src/core/Card.js';

describe('Game', () => {
  describe('constructor', () => {
    test('creates game with specified number of players', () => {
      const game = new Game(6, 500, 5, 10);

      expect(game.players.length).toBe(6);
      expect(game.players[0].name).toBe('You');
      expect(game.players[1].name).toBe('Player 2');
      expect(game.players[0].chips).toBe(500);
    });

    test('initializes game state', () => {
      const game = new Game();

      expect(game.communityCards).toEqual([]);
      expect(game.currentBet).toBe(0);
      expect(game.gamePhase).toBe(Game.PHASES.WAITING);
      expect(game.blinds).toEqual({ small: 5, big: 10 });
    });
  });

  describe('startNewHand', () => {
    test('resets player hands and deck', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      expect(game.deck.cardsRemaining()).toBe(46);
      expect(game.communityCards).toEqual([]);
      expect(game.gamePhase).toBe(Game.PHASES.PREFLOP);
    });

    test('posts blinds correctly', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      const totalBets = game.players.map(p => p.totalBetThisHand);
      const totalPot = totalBets.reduce((sum, bet) => sum + bet, 0);

      expect(totalPot).toBe(15);
      expect(game.currentBet).toBe(10);
      expect(totalBets.filter(bet => bet === 5).length).toBe(1);
      expect(totalBets.filter(bet => bet === 10).length).toBe(1);
    });

    test('deals hole cards to active players', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      for (const player of game.players) {
        expect(player.holeCards.length).toBe(2);
      }
    });

    test('sets dealer position', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      expect(game.players[game.dealerPosition].isDealer).toBe(true);
    });

    test('does not start hand with less than 2 players', () => {
      const game = new Game(2, 500, 5, 10);
      game.players[1].eliminate();
      game.startNewHand();

      expect(game.gamePhase).toBe(Game.PHASES.WAITING);
    });

    test('rotates dealer button on subsequent hands', () => {
      const game = new Game(3, 500, 5, 10);

      game.startNewHand();
      const firstDealer = game.dealerPosition;

      game.startNewHand();
      const secondDealer = game.dealerPosition;

      expect(secondDealer).not.toBe(firstDealer);
    });
  });

  describe('dealing community cards', () => {
    test('dealFlop adds 3 cards and burns 1', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      const cardsBeforeFlop = game.deck.cardsRemaining();
      game.dealFlop();

      expect(game.communityCards.length).toBe(3);
      expect(game.deck.cardsRemaining()).toBe(cardsBeforeFlop - 4);
      expect(game.gamePhase).toBe(Game.PHASES.FLOP);
    });

    test('dealTurn adds 1 card and burns 1', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();
      game.dealFlop();

      const cardsBeforeTurn = game.deck.cardsRemaining();
      game.dealTurn();

      expect(game.communityCards.length).toBe(4);
      expect(game.deck.cardsRemaining()).toBe(cardsBeforeTurn - 2);
      expect(game.gamePhase).toBe(Game.PHASES.TURN);
    });

    test('dealRiver adds 1 card and burns 1', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();
      game.dealFlop();
      game.dealTurn();

      const cardsBeforeRiver = game.deck.cardsRemaining();
      game.dealRiver();

      expect(game.communityCards.length).toBe(5);
      expect(game.deck.cardsRemaining()).toBe(cardsBeforeRiver - 2);
      expect(game.gamePhase).toBe(Game.PHASES.RIVER);
    });

    test('resets current bet after dealing new street', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();
      game.currentBet = 50;

      game.dealFlop();
      expect(game.currentBet).toBe(0);
    });
  });

  describe('playerAction', () => {
    test('fold removes player from hand', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      const player = game.players[0];
      game.playerAction(player.id, 'fold');

      expect(player.isFolded).toBe(true);
    });

    test('check is valid when no bet to call', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();
      game.currentBet = 0;

      const player = game.players[0];
      player.currentBet = 0;

      expect(() => game.playerAction(player.id, 'check')).not.toThrow();
    });

    test('check throws error when there is a bet', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      const player = game.players[0];
      expect(() => game.playerAction(player.id, 'check')).toThrow();
    });

    test('call matches current bet', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      const player = game.players[game.currentPlayerIndex];
      const chipsBefore = player.chips;
      const currentBetBefore = player.currentBet;
      const gameBetBefore = game.currentBet;

      game.playerAction(player.id, 'call');

      expect(player.currentBet).toBe(gameBetBefore);
      expect(player.chips).toBe(chipsBefore - (gameBetBefore - currentBetBefore));
    });

    test('raise increases current bet', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      const player = game.players[0];
      game.playerAction(player.id, 'raise', 20);

      expect(game.currentBet).toBe(30);
    });

    test('throw error when player cannot act', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      const player = game.players[0];
      player.fold();

      expect(() => game.playerAction(player.id, 'call')).toThrow('Player cannot act');
    });

    test('throw error when insufficient chips to raise', () => {
      const game = new Game(2, 100, 5, 10);
      game.startNewHand();

      const player = game.players[0];
      expect(() => game.playerAction(player.id, 'raise', 1000)).toThrow('Insufficient chips');
    });
  });

  describe('advanceToNextPlayer', () => {
    test('advances phase when all players match bet', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      let currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'call');

      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'call');

      currentPlayer = game.players[game.currentPlayerIndex];
      const result = game.playerAction(currentPlayer.id, 'check');

      expect(result.phase).toBe(Game.PHASES.FLOP);
    });

    test('ends hand when only one player remains', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      game.playerAction(0, 'fold');

      expect(game.gamePhase).toBe(Game.PHASES.SHOWDOWN);
    });
  });

  describe('determineWinners', () => {
    test('returns single winner with best hand', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      game.players[0].holeCards = [
        new Card('Hearts', 'A'),
        new Card('Spades', 'A')
      ];
      game.players[1].holeCards = [
        new Card('Hearts', 'K'),
        new Card('Spades', 'K')
      ];
      game.communityCards = [
        new Card('Diamonds', '2'),
        new Card('Clubs', '3'),
        new Card('Hearts', '4'),
        new Card('Spades', '5'),
        new Card('Diamonds', '7')
      ];

      const winners = game.determineWinners();

      expect(winners.length).toBe(1);
      expect(winners[0].playerId).toBe(0);
    });

    test('returns multiple winners on tie', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      game.players[0].holeCards = [
        new Card('Hearts', 'A'),
        new Card('Spades', 'K')
      ];
      game.players[1].holeCards = [
        new Card('Diamonds', 'A'),
        new Card('Clubs', 'K')
      ];
      game.communityCards = [
        new Card('Hearts', 'Q'),
        new Card('Spades', 'J'),
        new Card('Diamonds', '10'),
        new Card('Clubs', '9'),
        new Card('Hearts', '8')
      ];

      const winners = game.determineWinners();

      expect(winners.length).toBe(2);
    });

    test('returns last player when everyone else folded', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      game.players[0].fold();
      game.players[1].fold();

      const winners = game.determineWinners();

      expect(winners.length).toBe(1);
      expect(winners[0].playerId).toBe(2);
    });
  });

  describe('endHand', () => {
    test('distributes pot to winner', () => {
      const game = new Game(2, 500, 5, 10);
      game.startNewHand();

      const winner = game.players[0];
      const chipsBefore = winner.chips;

      game.players[0].holeCards = [
        new Card('Hearts', 'A'),
        new Card('Spades', 'A')
      ];
      game.players[1].holeCards = [
        new Card('Hearts', 'K'),
        new Card('Spades', 'K')
      ];
      game.communityCards = [
        new Card('Diamonds', '2'),
        new Card('Clubs', '3'),
        new Card('Hearts', '4'),
        new Card('Spades', '5'),
        new Card('Diamonds', '7')
      ];

      const result = game.endHand();

      expect(result.phase).toBe(Game.PHASES.SHOWDOWN);
      expect(result.winners.length).toBe(1);
      expect(winner.chips).toBeGreaterThan(chipsBefore);
    });
  });

  describe('game flow', () => {
    test('completes full hand from preflop to showdown', () => {
      const game = new Game(3, 500, 5, 10);
      game.startNewHand();

      expect(game.gamePhase).toBe(Game.PHASES.PREFLOP);

      let currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'fold');
      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'call');
      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'check');
      expect(game.gamePhase).toBe(Game.PHASES.FLOP);

      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'check');
      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'check');
      expect(game.gamePhase).toBe(Game.PHASES.TURN);

      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'check');
      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'check');
      expect(game.gamePhase).toBe(Game.PHASES.RIVER);

      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'check');
      currentPlayer = game.players[game.currentPlayerIndex];
      game.playerAction(currentPlayer.id, 'check');
      expect(game.gamePhase).toBe(Game.PHASES.SHOWDOWN);
    });
  });

  describe('isGameOver', () => {
    test('returns true when only one player remains', () => {
      const game = new Game(2, 500, 5, 10);
      game.players[1].eliminate();

      expect(game.isGameOver()).toBe(true);
    });

    test('returns false when multiple players remain', () => {
      const game = new Game(3, 500, 5, 10);

      expect(game.isGameOver()).toBe(false);
    });
  });

  describe('getWinner', () => {
    test('returns winner when game is over', () => {
      const game = new Game(2, 500, 5, 10);
      game.players[1].eliminate();

      const winner = game.getWinner();

      expect(winner).toBe(game.players[0]);
    });

    test('returns null when game is not over', () => {
      const game = new Game(2, 500, 5, 10);

      expect(game.getWinner()).toBeNull();
    });
  });
});
