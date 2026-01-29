import Deck from '../core/Deck.js';
import HandEvaluator from '../core/HandEvaluator.js';

export default class HandStrength {
  static calculateWinProbability(holeCards, communityCards, numOpponents, iterations = 1000) {
    let wins = 0;
    let ties = 0;
    let losses = 0;

    const knownCards = [...holeCards, ...communityCards];
    const cardsNeeded = 5 - communityCards.length;

    for (let i = 0; i < iterations; i++) {
      const deck = new Deck();

      for (const card of knownCards) {
        const index = deck.cards.findIndex(c => c.equals(card));
        if (index !== -1) deck.cards.splice(index, 1);
      }

      deck.shuffle();

      const simulatedCommunity = [...communityCards];
      if (cardsNeeded > 0) {
        simulatedCommunity.push(...deck.deal(cardsNeeded));
      }

      const playerHand = HandEvaluator.evaluateHand([...holeCards, ...simulatedCommunity]);

      let playerWins = true;
      let playerTies = false;

      for (let j = 0; j < numOpponents; j++) {
        const opponentHole = deck.deal(2);
        const opponentHand = HandEvaluator.evaluateHand([...opponentHole, ...simulatedCommunity]);

        const comparison = HandEvaluator.compareHands(playerHand, opponentHand);

        if (comparison < 0) {
          playerWins = false;
          break;
        } else if (comparison === 0) {
          playerTies = true;
        }
      }

      if (playerWins && !playerTies) {
        wins++;
      } else if (playerWins && playerTies) {
        ties++;
      } else {
        losses++;
      }
    }

    return {
      win: wins / iterations,
      tie: ties / iterations,
      loss: losses / iterations
    };
  }

  static getHandStrengthDescription(winProbability) {
    if (winProbability >= 0.8) return 'Very Strong';
    if (winProbability >= 0.6) return 'Strong';
    if (winProbability >= 0.4) return 'Medium';
    if (winProbability >= 0.2) return 'Weak';
    return 'Very Weak';
  }
}
