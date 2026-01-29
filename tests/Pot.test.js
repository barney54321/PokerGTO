import Pot from '../src/core/Pot.js';
import Player from '../src/core/Player.js';

describe('Pot', () => {
  describe('constructor', () => {
    test('creates empty pot', () => {
      const pot = new Pot();
      expect(pot.mainPot).toBe(0);
      expect(pot.sidePots).toEqual([]);
      expect(pot.contributions).toEqual({});
    });
  });

  describe('addBet', () => {
    test('adds bet to main pot', () => {
      const pot = new Pot();
      pot.addBet(1, 100);

      expect(pot.mainPot).toBe(100);
      expect(pot.contributions[1]).toBe(100);
    });

    test('accumulates multiple bets from same player', () => {
      const pot = new Pot();
      pot.addBet(1, 50);
      pot.addBet(1, 50);

      expect(pot.mainPot).toBe(100);
      expect(pot.contributions[1]).toBe(100);
    });

    test('tracks bets from multiple players', () => {
      const pot = new Pot();
      pot.addBet(1, 100);
      pot.addBet(2, 200);
      pot.addBet(3, 150);

      expect(pot.mainPot).toBe(450);
      expect(pot.contributions[1]).toBe(100);
      expect(pot.contributions[2]).toBe(200);
      expect(pot.contributions[3]).toBe(150);
    });
  });

  describe('createSidePots', () => {
    test('no side pots when no all-ins', () => {
      const pot = new Pot();
      const players = [
        Object.assign(new Player(1, 'Alice', 400), { totalBetThisHand: 100 }),
        Object.assign(new Player(2, 'Bob', 400), { totalBetThisHand: 100 })
      ];

      pot.createSidePots(players);
      expect(pot.sidePots).toEqual([]);
    });

    test('creates single side pot with one all-in', () => {
      const pot = new Pot();
      const p1 = new Player(1, 'Alice', 50);
      const p2 = new Player(2, 'Bob', 400);

      p1.bet(50);
      p2.bet(50);

      pot.createSidePots([p1, p2]);

      expect(pot.sidePots.length).toBe(1);
      expect(pot.sidePots[0].amount).toBe(100);
      expect(pot.sidePots[0].eligiblePlayers).toContain(1);
      expect(pot.sidePots[0].eligiblePlayers).toContain(2);
    });

    test('creates multiple side pots with multiple all-ins', () => {
      const pot = new Pot();
      const p1 = new Player(1, 'Alice', 50);
      const p2 = new Player(2, 'Bob', 100);
      const p3 = new Player(3, 'Charlie', 500);

      p1.bet(50);
      p2.bet(100);
      p3.bet(100);

      pot.createSidePots([p1, p2, p3]);

      expect(pot.sidePots.length).toBe(2);

      expect(pot.sidePots[0].amount).toBe(150);
      expect(pot.sidePots[0].eligiblePlayers).toContain(1);
      expect(pot.sidePots[0].eligiblePlayers).toContain(2);
      expect(pot.sidePots[0].eligiblePlayers).toContain(3);

      expect(pot.sidePots[1].amount).toBe(100);
      expect(pot.sidePots[1].eligiblePlayers).toContain(2);
      expect(pot.sidePots[1].eligiblePlayers).toContain(3);
    });

    test('excludes folded players from side pots', () => {
      const pot = new Pot();
      const p1 = new Player(1, 'Alice', 50);
      const p2 = new Player(2, 'Bob', 100);
      const p3 = new Player(3, 'Charlie', 500);

      p1.bet(50);
      p2.bet(100);
      p2.fold();
      p3.bet(100);

      pot.createSidePots([p1, p2, p3]);

      expect(pot.sidePots.length).toBe(2);
      expect(pot.sidePots[0].amount).toBe(100);
      expect(pot.sidePots[0].eligiblePlayers).toContain(1);
      expect(pot.sidePots[0].eligiblePlayers).toContain(3);
      expect(pot.sidePots[0].eligiblePlayers).not.toContain(2);
      expect(pot.sidePots[1].amount).toBe(50);
      expect(pot.sidePots[1].eligiblePlayers).toContain(3);
    });
  });

  describe('distributePot', () => {
    test('distributes main pot to single winner', () => {
      const pot = new Pot();
      pot.mainPot = 200;

      const p1 = new Player(1, 'Alice', 500);
      const p2 = new Player(2, 'Bob', 500);

      const results = pot.distributePot([{ playerId: 1 }], [p1, p2]);

      expect(p1.chips).toBe(700);
      expect(results.length).toBe(1);
      expect(results[0].playerId).toBe(1);
      expect(results[0].amount).toBe(200);
      expect(pot.mainPot).toBe(0);
    });

    test('splits main pot between multiple winners', () => {
      const pot = new Pot();
      pot.mainPot = 300;

      const p1 = new Player(1, 'Alice', 500);
      const p2 = new Player(2, 'Bob', 500);

      const results = pot.distributePot([{ playerId: 1 }, { playerId: 2 }], [p1, p2]);

      expect(p1.chips).toBe(650);
      expect(p2.chips).toBe(650);
      expect(results.length).toBe(2);
    });

    test('distributes side pots correctly', () => {
      const pot = new Pot();
      const p1 = new Player(1, 'Alice', 0);
      const p2 = new Player(2, 'Bob', 0);
      const p3 = new Player(3, 'Charlie', 0);

      p1.totalBetThisHand = 50;
      p2.totalBetThisHand = 100;
      p3.totalBetThisHand = 100;

      pot.sidePots = [
        { amount: 150, eligiblePlayers: [1, 2, 3] },
        { amount: 100, eligiblePlayers: [2, 3] }
      ];

      const results = pot.distributePot([{ playerId: 2 }], [p1, p2, p3]);

      expect(p2.chips).toBe(250);
      expect(results.length).toBe(2);
    });

    test('distributes side pots to eligible winner only', () => {
      const pot = new Pot();
      const p1 = new Player(1, 'Alice', 0);
      const p2 = new Player(2, 'Bob', 0);
      const p3 = new Player(3, 'Charlie', 0);

      pot.sidePots = [
        { amount: 150, eligiblePlayers: [1, 2, 3] },
        { amount: 100, eligiblePlayers: [2, 3] }
      ];

      const results = pot.distributePot([{ playerId: 1 }], [p1, p2, p3]);

      expect(p1.chips).toBe(150);
      expect(p2.chips).toBe(0);
      expect(results.length).toBe(1);
    });
  });

  describe('getTotalPot', () => {
    test('returns main pot when no side pots', () => {
      const pot = new Pot();
      pot.mainPot = 500;

      expect(pot.getTotalPot()).toBe(500);
    });

    test('returns sum of side pots when they exist', () => {
      const pot = new Pot();
      pot.sidePots = [
        { amount: 150, eligiblePlayers: [1, 2, 3] },
        { amount: 100, eligiblePlayers: [2, 3] }
      ];

      expect(pot.getTotalPot()).toBe(250);
    });
  });

  describe('reset', () => {
    test('clears all pot state', () => {
      const pot = new Pot();
      pot.mainPot = 500;
      pot.sidePots = [{ amount: 100, eligiblePlayers: [1, 2] }];
      pot.contributions = { 1: 200, 2: 300 };

      pot.reset();

      expect(pot.mainPot).toBe(0);
      expect(pot.sidePots).toEqual([]);
      expect(pot.contributions).toEqual({});
    });
  });
});
