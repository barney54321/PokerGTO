export default class AIPlayer {
  static PERSONALITIES = {
    TIGHT: { raiseThreshold: 0.7, callThreshold: 0.5, bluffChance: 0.05 },
    NORMAL: { raiseThreshold: 0.6, callThreshold: 0.4, bluffChance: 0.1 },
    LOOSE: { raiseThreshold: 0.5, callThreshold: 0.3, bluffChance: 0.15 }
  };

  constructor(personality = 'NORMAL') {
    this.personality = AIPlayer.PERSONALITIES[personality];
  }

  decideAction(player, game, handStrength) {
    const potOdds = game.currentBet > 0 ? game.pot.getTotalPot() / game.currentBet : 0;
    const callAmount = game.currentBet - player.currentBet;
    const canCheck = callAmount === 0;

    if (player.chips === 0) {
      return { action: 'check' };
    }

    if (callAmount >= player.chips) {
      if (handStrength >= this.personality.callThreshold) {
        return { action: 'call' };
      }
      return { action: 'fold' };
    }

    const random = Math.random();
    const isBluff = random < this.personality.bluffChance;

    if (handStrength >= this.personality.raiseThreshold || isBluff) {
      const raiseAmount = Math.min(
        Math.floor(game.pot.getTotalPot() * 0.5),
        player.chips - callAmount
      );
      if (raiseAmount > 0) {
        return { action: 'raise', amount: raiseAmount };
      }
    }

    if (handStrength >= this.personality.callThreshold) {
      if (canCheck) {
        return { action: 'check' };
      }
      return { action: 'call' };
    }

    if (canCheck) {
      return { action: 'check' };
    }

    return { action: 'fold' };
  }
}
