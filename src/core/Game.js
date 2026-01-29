import Deck from './Deck.js';
import Player from './Player.js';
import Pot from './Pot.js';
import HandEvaluator from './HandEvaluator.js';

export default class Game {
  static PHASES = {
    WAITING: 'waiting',
    PREFLOP: 'preflop',
    FLOP: 'flop',
    TURN: 'turn',
    RIVER: 'river',
    SHOWDOWN: 'showdown'
  };

  constructor(numPlayers = 6, startingChips = 500, smallBlind = 5, bigBlind = 10) {
    this.players = [];
    for (let i = 0; i < numPlayers; i++) {
      const name = i === 0 ? 'You' : `Player ${i + 1}`;
      this.players.push(new Player(i, name, startingChips));
    }

    this.deck = new Deck();
    this.communityCards = [];
    this.pot = new Pot();
    this.currentBet = 0;
    this.dealerPosition = 0;
    this.currentPlayerIndex = 0;
    this.gamePhase = Game.PHASES.WAITING;
    this.blinds = { small: smallBlind, big: bigBlind };
    this.handNumber = 0;
    this.firstToActThisRound = -1;
  }

  startNewHand() {
    this.handNumber++;

    for (const player of this.players) {
      player.resetForNewHand();
    }

    this.deck.reset();
    this.deck.shuffle();
    this.communityCards = [];
    this.pot.reset();
    this.currentBet = 0;

    const activePlayers = this.getActivePlayers();
    if (activePlayers.length < 2) {
      this.gamePhase = Game.PHASES.WAITING;
      return;
    }

    this.dealerPosition = this.getNextActivePlayerIndex(this.dealerPosition);

    for (const player of this.players) {
      player.isDealer = false;
    }
    this.players[this.dealerPosition].isDealer = true;

    this.postBlinds();
    this.dealHoleCards();
    this.gamePhase = Game.PHASES.PREFLOP;
    this.currentPlayerIndex = this.getNextActivePlayerIndex(
      this.getNextActivePlayerIndex(
        this.getNextActivePlayerIndex(this.dealerPosition)
      )
    );
    this.firstToActThisRound = this.currentPlayerIndex;
  }

  postBlinds() {
    const sbPosition = this.getNextActivePlayerIndex(this.dealerPosition);
    const bbPosition = this.getNextActivePlayerIndex(sbPosition);

    const sbPlayer = this.players[sbPosition];
    const bbPlayer = this.players[bbPosition];

    const sbAmount = Math.min(this.blinds.small, sbPlayer.chips);
    const bbAmount = Math.min(this.blinds.big, bbPlayer.chips);

    sbPlayer.bet(sbAmount);
    this.pot.addBet(sbPlayer.id, sbAmount);

    bbPlayer.bet(bbAmount);
    this.pot.addBet(bbPlayer.id, bbAmount);

    this.currentBet = this.blinds.big;
  }

  dealHoleCards() {
    const activePlayers = this.getActivePlayers();
    for (const player of activePlayers) {
      const cards = this.deck.deal(2);
      player.receiveCards(cards);
    }
  }

  dealFlop() {
    this.deck.deal(1);
    const flop = this.deck.deal(3);
    this.communityCards.push(...flop);
    this.gamePhase = Game.PHASES.FLOP;
    this.currentBet = 0;
    this.resetPlayerBets();
    this.currentPlayerIndex = this.getNextActivePlayerIndex(this.dealerPosition);
    this.firstToActThisRound = this.currentPlayerIndex;
  }

  dealTurn() {
    this.deck.deal(1);
    const turn = this.deck.deal(1);
    this.communityCards.push(...turn);
    this.gamePhase = Game.PHASES.TURN;
    this.currentBet = 0;
    this.resetPlayerBets();
    this.currentPlayerIndex = this.getNextActivePlayerIndex(this.dealerPosition);
    this.firstToActThisRound = this.currentPlayerIndex;
  }

  dealRiver() {
    this.deck.deal(1);
    const river = this.deck.deal(1);
    this.communityCards.push(...river);
    this.gamePhase = Game.PHASES.RIVER;
    this.currentBet = 0;
    this.resetPlayerBets();
    this.currentPlayerIndex = this.getNextActivePlayerIndex(this.dealerPosition);
    this.firstToActThisRound = this.currentPlayerIndex;
  }

  resetPlayerBets() {
    for (const player of this.players) {
      player.currentBet = 0;
    }
  }

  getActivePlayers() {
    return this.players.filter(p => p.isActive);
  }

  getPlayersInHand() {
    return this.players.filter(p => p.isActive && !p.isFolded);
  }

  getNextActivePlayerIndex(fromIndex) {
    let index = (fromIndex + 1) % this.players.length;
    while (!this.players[index].isActive) {
      index = (index + 1) % this.players.length;
      if (index === fromIndex) {
        return fromIndex;
      }
    }
    return index;
  }

  playerAction(playerId, action, amount = 0) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.canAct()) {
      throw new Error('Player cannot act');
    }

    if (action === 'fold') {
      player.fold();
    } else if (action === 'check') {
      if (this.currentBet > player.currentBet) {
        throw new Error('Cannot check when there is a bet to call');
      }
    } else if (action === 'call') {
      const callAmount = Math.min(this.currentBet - player.currentBet, player.chips);
      player.bet(callAmount);
      this.pot.addBet(player.id, callAmount);
    } else if (action === 'raise') {
      const totalBet = this.currentBet + amount;
      const raiseAmount = totalBet - player.currentBet;

      if (raiseAmount > player.chips) {
        throw new Error('Insufficient chips to raise');
      }

      player.bet(raiseAmount);
      this.pot.addBet(player.id, raiseAmount);
      this.currentBet = totalBet;
    }

    return this.advanceToNextPlayer();
  }

  advanceToNextPlayer() {
    const playersInHand = this.getPlayersInHand();

    if (playersInHand.length === 1) {
      return this.endHand();
    }

    const playersWhoCanAct = playersInHand.filter(p => p.canAct());
    const allPlayersMatchedBet = playersInHand.every(
      p => p.currentBet === this.currentBet || !p.canAct()
    );

    const nextPlayerIndex = this.getNextPlayerWhoCanAct();
    const actionReturnedToFirst = nextPlayerIndex === this.firstToActThisRound;
    const firstPlayerCanStillAct = this.players[this.firstToActThisRound].canAct() &&
                                     !this.players[this.firstToActThisRound].isFolded;

    if (playersWhoCanAct.length === 0 || (allPlayersMatchedBet && (actionReturnedToFirst || !firstPlayerCanStillAct))) {
      return this.advancePhase();
    }

    this.currentPlayerIndex = nextPlayerIndex;
    return { phase: this.gamePhase, currentPlayer: this.currentPlayerIndex };
  }

  getNextPlayerWhoCanAct() {
    let index = this.currentPlayerIndex;
    do {
      index = this.getNextActivePlayerIndex(index);
      if (this.players[index].canAct() && !this.players[index].isFolded) {
        return index;
      }
    } while (index !== this.currentPlayerIndex);

    return this.currentPlayerIndex;
  }

  advancePhase() {
    if (this.gamePhase === Game.PHASES.PREFLOP) {
      this.dealFlop();
    } else if (this.gamePhase === Game.PHASES.FLOP) {
      this.dealTurn();
    } else if (this.gamePhase === Game.PHASES.TURN) {
      this.dealRiver();
    } else if (this.gamePhase === Game.PHASES.RIVER) {
      return this.endHand();
    }

    return { phase: this.gamePhase, currentPlayer: this.currentPlayerIndex };
  }

  endHand() {
    this.gamePhase = Game.PHASES.SHOWDOWN;
    const winners = this.determineWinners();

    this.pot.createSidePots(this.players);
    const distribution = this.pot.distributePot(winners, this.players);

    return {
      phase: Game.PHASES.SHOWDOWN,
      winners: winners,
      distribution: distribution
    };
  }

  determineWinners() {
    const playersInHand = this.getPlayersInHand();

    if (playersInHand.length === 1) {
      return [{ playerId: playersInHand[0].id, hand: null }];
    }

    const evaluations = playersInHand.map(player => {
      const allCards = [...player.holeCards, ...this.communityCards];
      const hand = HandEvaluator.evaluateHand(allCards);
      return { playerId: player.id, hand: hand };
    });

    evaluations.sort((a, b) => HandEvaluator.compareHands(b.hand, a.hand));

    const winners = [evaluations[0]];
    for (let i = 1; i < evaluations.length; i++) {
      if (HandEvaluator.compareHands(evaluations[i].hand, evaluations[0].hand) === 0) {
        winners.push(evaluations[i]);
      } else {
        break;
      }
    }

    return winners;
  }

  isGameOver() {
    return this.getActivePlayers().length <= 1;
  }

  getWinner() {
    const activePlayers = this.getActivePlayers();
    return activePlayers.length === 1 ? activePlayers[0] : null;
  }
}
