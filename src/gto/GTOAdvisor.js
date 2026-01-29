import HandStrength from './HandStrength.js';
import EVCalculator from './EVCalculator.js';
import HandEvaluator from '../core/HandEvaluator.js';

export default class GTOAdvisor {
  static getOptimalAction(game, player) {
    const holeCards = player.holeCards;
    const communityCards = game.communityCards;
    const numOpponents = game.getPlayersInHand().length - 1;

    const probabilities = HandStrength.calculateWinProbability(
      holeCards,
      communityCards,
      numOpponents,
      500
    );

    const callAmount = game.currentBet - player.currentBet;
    const potSize = game.pot.getTotalPot();
    const potOdds = EVCalculator.calculatePotOdds(potSize, callAmount);
    const ev = EVCalculator.calculateExpectedValue(
      probabilities.win,
      probabilities.tie,
      potSize,
      callAmount
    );

    const allCards = [...holeCards, ...communityCards];
    const currentHand = allCards.length >= 5 ? HandEvaluator.evaluateHand(allCards) : { name: 'Unknown' };
    const handStrength = HandStrength.getHandStrengthDescription(probabilities.win);

    let recommendation;
    let reasoning;

    if (callAmount === 0) {
      if (probabilities.win >= 0.6) {
        recommendation = 'RAISE';
        reasoning = `Strong hand (${(probabilities.win * 100).toFixed(1)}% to win). Bet for value.`;
      } else {
        recommendation = 'CHECK';
        reasoning = `Medium hand strength. Check to see next card.`;
      }
    } else if (callAmount >= player.chips) {
      if (ev > 0) {
        recommendation = 'CALL (ALL-IN)';
        reasoning = `Positive EV (+${ev.toFixed(0)} chips). Call all-in.`;
      } else {
        recommendation = 'FOLD';
        reasoning = `Negative EV (${ev.toFixed(0)} chips). Not worth going all-in.`;
      }
    } else {
      const shouldCall = EVCalculator.shouldCallBasedOnOdds(probabilities.win, potOdds);

      if (probabilities.win >= 0.7) {
        recommendation = 'RAISE';
        reasoning = `Very strong hand. Raise for value and protection.`;
      } else if (ev > player.chips * 0.1) {
        recommendation = 'RAISE';
        reasoning = `High positive EV. Raise to build pot.`;
      } else if (shouldCall && ev > 0) {
        recommendation = 'CALL';
        reasoning = `Pot odds favor calling (${potOdds.toFixed(1)}:1 odds, ${(probabilities.win * 100).toFixed(1)}% to win).`;
      } else if (!shouldCall && ev < 0) {
        recommendation = 'FOLD';
        reasoning = `Insufficient pot odds. Need ${(EVCalculator.getMinimumWinRate(potOdds) * 100).toFixed(1)}% to call profitably.`;
      } else {
        recommendation = 'CALL';
        reasoning = `Marginal situation. Calling is acceptable.`;
      }
    }

    return {
      winProbability: probabilities.win,
      tieProbability: probabilities.tie,
      potOdds: potOdds === Infinity ? 'N/A' : `${potOdds.toFixed(1)}:1`,
      expectedValue: ev,
      recommendation: recommendation,
      reasoning: reasoning,
      handStrength: handStrength,
      currentHandName: currentHand.name
    };
  }
}
