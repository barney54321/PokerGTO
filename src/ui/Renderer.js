export default class Renderer {
  constructor() {
    this.playerPositions = [
      { left: '50%', top: '90%', transform: 'translateX(-50%)' },
      { left: '10%', top: '60%' },
      { left: '10%', top: '20%' },
      { left: '50%', top: '5%', transform: 'translateX(-50%)' },
      { right: '10%', top: '20%' },
      { right: '10%', top: '60%' }
    ];
  }

  renderTable(game) {
    this.renderPlayers(game);
    this.renderCommunityCards(game.communityCards);
    this.renderPot(game.pot.getTotalPot());
    this.renderGameInfo(game);
  }

  renderPlayers(game) {
    const container = document.getElementById('players');
    container.innerHTML = '';

    game.players.forEach((player, index) => {
      if (!player.isActive) return;

      const playerDiv = document.createElement('div');
      playerDiv.className = 'player';
      if (game.currentPlayerIndex === index) playerDiv.classList.add('active');
      if (player.isDealer) playerDiv.classList.add('dealer');

      Object.assign(playerDiv.style, this.playerPositions[index]);

      playerDiv.innerHTML = `
        <div class="player-name">${player.name}</div>
        <div class="player-chips">$${player.chips}</div>
        ${player.currentBet > 0 ? `<div class="player-bet">Bet: $${player.currentBet}</div>` : ''}
        <div class="player-cards">
          ${player.id === 0 && player.holeCards.length > 0 ?
            player.holeCards.map(c => this.createCardHTML(c)).join('') :
            player.holeCards.length > 0 ? '<div class="card back"></div><div class="card back"></div>' : ''}
        </div>
      `;

      container.appendChild(playerDiv);
    });
  }

  renderCommunityCards(cards) {
    const container = document.getElementById('community-cards');
    container.innerHTML = cards.map(c => this.createCardHTML(c)).join('');
  }

  createCardHTML(card) {
    const color = ['Hearts', 'Diamonds'].includes(card.suit) ? 'red' : 'black';
    return `<div class="card ${color}">${card.toString()}</div>`;
  }

  renderPlayerCards(cards) {
    const container = document.getElementById('player-cards');
    container.innerHTML = cards.map(c => this.createCardHTML(c)).join('');
  }

  renderPot(amount) {
    document.getElementById('pot-display').textContent = `Pot: $${amount}`;
    document.getElementById('pot-amount').textContent = amount;
  }

  renderGameInfo(game) {
    document.getElementById('hand-number').textContent = game.handNumber;
    document.getElementById('blinds').textContent = `${game.blinds.small}/${game.blinds.big}`;
  }

  showGTOAdvice(advice) {
    const modal = document.getElementById('gto-modal');
    const content = document.getElementById('gto-content');

    content.innerHTML = `
      <div class="gto-stat"><strong>Current Hand:</strong> ${advice.currentHandName}</div>
      <div class="gto-stat"><strong>Hand Strength:</strong> ${advice.handStrength}</div>
      <div class="gto-stat"><strong>Win Probability:</strong> ${(advice.winProbability * 100).toFixed(1)}%</div>
      <div class="gto-stat"><strong>Tie Probability:</strong> ${(advice.tieProbability * 100).toFixed(1)}%</div>
      <div class="gto-stat"><strong>Pot Odds:</strong> ${advice.potOdds}</div>
      <div class="gto-stat"><strong>Expected Value:</strong> ${advice.expectedValue >= 0 ? '+' : ''}${advice.expectedValue.toFixed(0)} chips</div>
      <div class="gto-recommendation">${advice.recommendation}</div>
      <div class="gto-stat"><em>${advice.reasoning}</em></div>
    `;

    modal.classList.remove('hidden');
  }

  hideGTOModal() {
    document.getElementById('gto-modal').classList.add('hidden');
  }

  updateActionButtons(game, player) {
    const callAmount = game.currentBet - player.currentBet;
    const canCheck = callAmount === 0;

    document.getElementById('check-btn').disabled = !canCheck;
    document.getElementById('call-btn').disabled = canCheck || player.chips === 0;
    document.getElementById('call-btn').textContent = `Call $${callAmount}`;
    document.getElementById('raise-btn').disabled = player.chips <= callAmount;
    document.getElementById('fold-btn').disabled = false;
  }

  log(message) {
    const log = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    log.prepend(entry);

    while (log.children.length > 20) {
      log.removeChild(log.lastChild);
    }
  }

  showGameOver(winner) {
    this.log(`GAME OVER! ${winner.name} wins with $${winner.chips}!`);
    document.getElementById('new-game-btn').classList.remove('hidden');
    document.getElementById('action-buttons').style.display = 'none';
  }

  showHandResult(winners, distribution) {
    winners.forEach(w => {
      this.log(`${w.hand ? w.hand.name : 'Winner'} - Player wins!`);
    });
    document.getElementById('next-hand-btn').classList.remove('hidden');
  }
}
