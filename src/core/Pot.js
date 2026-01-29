export default class Pot {
  constructor() {
    this.mainPot = 0;
    this.sidePots = [];
    this.contributions = {};
  }

  addBet(playerId, amount) {
    if (!this.contributions[playerId]) {
      this.contributions[playerId] = 0;
    }
    this.contributions[playerId] += amount;
    this.mainPot += amount;
  }

  createSidePots(players) {
    const activePlayers = players.filter(p => !p.isFolded && p.totalBetThisHand > 0);

    if (activePlayers.length === 0) {
      return;
    }

    const allInPlayers = activePlayers
      .filter(p => p.isAllIn())
      .sort((a, b) => a.totalBetThisHand - b.totalBetThisHand);

    if (allInPlayers.length === 0) {
      return;
    }

    this.sidePots = [];
    let lastAllInAmount = 0;

    for (const allInPlayer of allInPlayers) {
      const cap = allInPlayer.totalBetThisHand;
      if (cap <= lastAllInAmount) continue;

      const eligiblePlayers = activePlayers
        .filter(p => p.totalBetThisHand >= cap || p.isAllIn())
        .map(p => p.id);

      let potAmount = 0;
      for (const player of activePlayers) {
        if (player.totalBetThisHand >= cap) {
          potAmount += cap - lastAllInAmount;
        } else if (player.isAllIn()) {
          potAmount += player.totalBetThisHand - lastAllInAmount;
        }
      }

      if (potAmount > 0) {
        this.sidePots.push({
          amount: potAmount,
          eligiblePlayers: eligiblePlayers
        });
      }

      lastAllInAmount = cap;
    }

    let remainingPot = 0;
    for (const player of activePlayers) {
      if (player.totalBetThisHand > lastAllInAmount) {
        remainingPot += player.totalBetThisHand - lastAllInAmount;
      }
    }

    if (remainingPot > 0) {
      this.sidePots.push({
        amount: remainingPot,
        eligiblePlayers: activePlayers.map(p => p.id)
      });
    }
  }

  distributePot(winners, players) {
    const results = [];

    if (this.sidePots.length === 0) {
      const share = Math.floor(this.mainPot / winners.length);
      for (const winner of winners) {
        const player = players.find(p => p.id === winner.playerId);
        player.winChips(share);
        results.push({
          playerId: winner.playerId,
          amount: share,
          potType: 'main'
        });
      }
      this.reset();
      return results;
    }

    for (const sidePot of this.sidePots) {
      const eligibleWinners = winners.filter(w =>
        sidePot.eligiblePlayers.includes(w.playerId)
      );

      if (eligibleWinners.length === 0) continue;

      const share = Math.floor(sidePot.amount / eligibleWinners.length);
      for (const winner of eligibleWinners) {
        const player = players.find(p => p.id === winner.playerId);
        player.winChips(share);
        results.push({
          playerId: winner.playerId,
          amount: share,
          potType: 'side'
        });
      }
    }

    this.reset();
    return results;
  }

  getTotalPot() {
    if (this.sidePots.length === 0) {
      return this.mainPot;
    }
    return this.sidePots.reduce((sum, pot) => sum + pot.amount, 0);
  }

  reset() {
    this.mainPot = 0;
    this.sidePots = [];
    this.contributions = {};
  }
}
