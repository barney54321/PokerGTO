import GTOAdvisor from '../src/gto/GTOAdvisor.js';
import Game from '../src/core/Game.js';
import Card from '../src/core/Card.js';

describe('GTOAdvisor', () => {
  test('recommends raise with strong hand', () => {
    const game = new Game(2, 500, 5, 10);
    game.startNewHand();
    game.currentBet = 0;

    const player = game.players[0];
    player.holeCards = [new Card('Hearts', 'A'), new Card('Spades', 'A')];
    game.communityCards = [];

    const advice = GTOAdvisor.getOptimalAction(game, player);

    expect(advice.recommendation).toMatch(/RAISE|CHECK/);
    expect(advice.winProbability).toBeGreaterThan(0.5);
    expect(advice.reasoning).toBeDefined();
  });

  test('recommends fold with weak hand and bad odds', () => {
    const game = new Game(2, 500, 5, 10);
    game.startNewHand();
    game.currentBet = 100;
    game.pot.mainPot = 120;

    const player = game.players[0];
    player.holeCards = [new Card('Hearts', '2'), new Card('Clubs', '3')];
    player.currentBet = 0;
    game.communityCards = [
      new Card('Spades', 'K'),
      new Card('Diamonds', 'Q'),
      new Card('Hearts', 'J')
    ];

    const advice = GTOAdvisor.getOptimalAction(game, player);

    expect(['FOLD', 'CALL']).toContain(advice.recommendation);
    expect(advice.handStrength).toBeDefined();
  });

  test('provides complete advice structure', () => {
    const game = new Game(2, 500, 5, 10);
    game.startNewHand();

    const player = game.players[0];
    const advice = GTOAdvisor.getOptimalAction(game, player);

    expect(advice).toHaveProperty('winProbability');
    expect(advice).toHaveProperty('potOdds');
    expect(advice).toHaveProperty('expectedValue');
    expect(advice).toHaveProperty('recommendation');
    expect(advice).toHaveProperty('reasoning');
    expect(advice).toHaveProperty('handStrength');
    expect(advice).toHaveProperty('currentHandName');
  });
});
