import Game from '../core/Game.js';
import AIPlayer from '../ai/AIPlayer.js';
import GTOAdvisor from '../gto/GTOAdvisor.js';
import HandStrength from '../gto/HandStrength.js';

export default class Controller {
  constructor(renderer) {
    this.renderer = renderer;
    this.game = null;
    this.ai = new AIPlayer('NORMAL');
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('fold-btn').addEventListener('click', () => this.playerAction('fold'));
    document.getElementById('check-btn').addEventListener('click', () => this.playerAction('check'));
    document.getElementById('call-btn').addEventListener('click', () => this.playerAction('call'));
    document.getElementById('raise-btn').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('raise-amount').value) || 0;
      this.playerAction('raise', amount);
    });
    document.getElementById('gt-btn').addEventListener('click', () => this.showGTOAdvice());
    document.getElementById('new-game-btn').addEventListener('click', () => this.startGame());
    document.getElementById('next-hand-btn').addEventListener('click', () => this.startNewHand());
    document.querySelector('.close').addEventListener('click', () => this.renderer.hideGTOModal());
  }

  startGame() {
    this.game = new Game(6, 500, 5, 10);
    document.getElementById('new-game-btn').classList.add('hidden');
    document.getElementById('action-buttons').style.display = 'flex';
    this.renderer.log('New game started!');
    this.startNewHand();
  }

  startNewHand() {
    if (this.game.isGameOver()) {
      const winner = this.game.getWinner();
      this.renderer.showGameOver(winner);
      return;
    }

    document.getElementById('next-hand-btn').classList.add('hidden');
    this.game.startNewHand();
    this.renderer.renderTable(this.game);
    this.renderer.renderPlayerCards(this.game.players[0].holeCards);
    this.renderer.log(`Hand #${this.game.handNumber} started. Blinds: ${this.game.blinds.small}/${this.game.blinds.big}`);

    this.processAITurns();
  }

  playerAction(action, amount = 0) {
    const player = this.game.players[0];

    if (this.game.currentPlayerIndex !== 0) {
      this.renderer.log('Not your turn!');
      return;
    }

    try {
      this.renderer.log(`You ${action}${amount > 0 ? ' $' + amount : ''}`);
      const result = this.game.playerAction(player.id, action, amount);

      this.renderer.renderTable(this.game);

      if (result.phase === 'showdown') {
        this.handleShowdown(result);
      } else {
        this.processAITurns();
      }
    } catch (error) {
      this.renderer.log(`Error: ${error.message}`);
    }
  }

  processAITurns() {
    setTimeout(() => {
      while (this.game.currentPlayerIndex !== 0 && this.game.gamePhase !== 'showdown') {
        const currentPlayer = this.game.players[this.game.currentPlayerIndex];

        const probabilities = HandStrength.calculateWinProbability(
          currentPlayer.holeCards,
          this.game.communityCards,
          this.game.getPlayersInHand().length - 1,
          200
        );

        const decision = this.ai.decideAction(currentPlayer, this.game, probabilities.win);

        this.renderer.log(`${currentPlayer.name} ${decision.action}${decision.amount ? ' $' + decision.amount : ''}`);

        const result = this.game.playerAction(currentPlayer.id, decision.action, decision.amount || 0);

        this.renderer.renderTable(this.game);

        if (result.phase === 'showdown') {
          this.handleShowdown(result);
          return;
        }
      }

      if (this.game.currentPlayerIndex === 0) {
        this.renderer.updateActionButtons(this.game, this.game.players[0]);
      }
    }, 500);
  }

  handleShowdown(result) {
    this.renderer.renderTable(this.game);
    this.renderer.showHandResult(result.winners, result.distribution);

    result.winners.forEach(w => {
      const player = this.game.players.find(p => p.id === w.playerId);
      this.renderer.log(`${player.name} wins with ${w.hand ? w.hand.name : 'best hand'}!`);
    });
  }

  showGTOAdvice() {
    const player = this.game.players[0];
    const advice = GTOAdvisor.getOptimalAction(this.game, player);
    this.renderer.showGTOAdvice(advice);
  }
}
