import EVCalculator from '../src/gto/EVCalculator.js';

describe('EVCalculator', () => {
  test('calculates pot odds', () => {
    expect(EVCalculator.calculatePotOdds(100, 20)).toBe(5);
    expect(EVCalculator.calculatePotOdds(50, 10)).toBe(5);
  });

  test('calculates expected value', () => {
    const ev = EVCalculator.calculateExpectedValue(0.5, 0, 100, 20);
    expect(ev).toBe(40);
  });

  test('determines if should call based on odds', () => {
    expect(EVCalculator.shouldCallBasedOnOdds(0.5, 1)).toBe(true);
    expect(EVCalculator.shouldCallBasedOnOdds(0.15, 5)).toBe(false);
    expect(EVCalculator.shouldCallBasedOnOdds(0.2, 5)).toBe(true);
  });

  test('calculates minimum win rate', () => {
    expect(EVCalculator.getMinimumWinRate(1)).toBeCloseTo(0.5);
    expect(EVCalculator.getMinimumWinRate(3)).toBeCloseTo(0.25);
  });
});
