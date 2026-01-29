export default class EVCalculator {
  static calculatePotOdds(potSize, callAmount) {
    if (callAmount === 0) return Infinity;
    return potSize / callAmount;
  }

  static calculateExpectedValue(winProbability, tieProbability, potSize, callAmount) {
    const potAfterCall = potSize + callAmount;
    const winEV = winProbability * potAfterCall;
    const tieEV = tieProbability * (potAfterCall / 2);
    const loseEV = (1 - winProbability - tieProbability) * 0;

    return winEV + tieEV + loseEV - callAmount;
  }

  static shouldCallBasedOnOdds(winProbability, potOdds) {
    const requiredWinRate = 1 / (potOdds + 1);
    return winProbability >= requiredWinRate;
  }

  static getMinimumWinRate(potOdds) {
    return 1 / (potOdds + 1);
  }
}
