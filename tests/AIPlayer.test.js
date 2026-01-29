import AIPlayer from '../src/ai/AIPlayer.js';
import Game from '../src/core/Game.js';

describe('AIPlayer', () => {
  test('creates AI with personality', () => {
    const ai = new AIPlayer('TIGHT');
    expect(ai.personality).toBeDefined();
    expect(ai.personality.raiseThreshold).toBe(0.7);
  });

  test('decides to fold with weak hand', () => {
    const ai = new AIPlayer('NORMAL');
    const game = new Game(3, 500, 5, 10);
    game.startNewHand();
    game.currentBet = 50;

    const player = game.players[0];
    player.currentBet = 0;

    const decision = ai.decideAction(player, game, 0.1);
    expect(decision.action).toBe('fold');
  });

  test('decides to raise with strong hand', () => {
    const ai = new AIPlayer('NORMAL');
    const game = new Game(3, 500, 5, 10);
    game.startNewHand();

    const player = game.players[0];
    const decision = ai.decideAction(player, game, 0.9);

    expect(['raise', 'call', 'check']).toContain(decision.action);
  });

  test('checks when possible with medium hand', () => {
    const ai = new AIPlayer('NORMAL');
    const game = new Game(3, 500, 5, 10);
    game.startNewHand();
    game.currentBet = 0;

    const player = game.players[0];
    player.currentBet = 0;

    const decision = ai.decideAction(player, game, 0.5);
    expect(['check', 'raise']).toContain(decision.action);
  });
});
