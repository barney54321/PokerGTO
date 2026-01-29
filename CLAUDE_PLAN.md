# PokerGT Implementation Plan

## Overview
Build a single-player Texas Hold'em poker game with game theory optimal (GTO) move recommendations, using object-oriented JavaScript for efficient token usage and comprehensive testing.

## Architecture Principles
- **Object-Oriented Design**: Clear class hierarchy with single responsibility
- **Testable**: Each class independently testable with Jest
- **Client-Side Only**: All logic in JavaScript for static hosting
- **Modular**: Separate game logic from UI rendering

---

## Phase 1: Core Poker Engine

### 1.1 Card System
**Files**: `src/core/Card.js`, `src/core/Deck.js`

**Card class**:
- Properties: `suit`, `rank`, `value` (numerical for comparison)
- Methods: `toString()`, `equals()`

**Deck class**:
- Properties: `cards[]`
- Methods: `shuffle()`, `deal()`, `reset()`
- Standard 52-card deck

**Tests**: Verify deck has 52 cards, shuffle randomizes, deal removes cards

### 1.2 Hand Evaluation
**Files**: `src/core/HandEvaluator.js`

**HandEvaluator class** (static methods):
- `evaluateHand(cards[])` → Returns hand rank object
- `compareHands(hand1, hand2)` → Returns winner
- Hand rankings: High Card, Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush
- Use bit manipulation or efficient algorithms for speed

**Tests**: Extensive tests for all hand types and edge cases (ace-low straights, etc.)

---

## Phase 2: Game State Management

### 2.1 Player System
**Files**: `src/core/Player.js`

**Player class**:
- Properties: `id`, `name`, `chips`, `holeCards[]`, `isActive`, `isFolded`, `currentBet`, `isDealer`, `position`
- Methods: `bet(amount)`, `fold()`, `receiveCards(cards)`, `clearHand()`, `canAct()`
- Player types: Human (id=0) and AI (id=1-5)

**Tests**: Verify betting logic, chip management, fold states

### 2.2 Pot Management
**Files**: `src/core/Pot.js`

**Pot class**:
- Properties: `mainPot`, `sidePots[]`, `contributions{}` (player → amount)
- Methods: `addBet(player, amount)`, `createSidePot()`, `distributePot(winners[])`
- Handles all-in scenarios and side pots correctly

**Tests**: Side pot calculations, multiple all-in scenarios

### 2.3 Game Manager
**Files**: `src/core/Game.js`

**Game class**:
- Properties:
  - `players[]`
  - `deck`
  - `communityCards[]`
  - `pot`
  - `currentBet`
  - `dealerPosition`
  - `currentPlayerIndex`
  - `gamePhase` (preflop/flop/turn/river)
  - `blinds` {small: 5, big: 10}
- Methods:
  - `startNewHand()`
  - `dealHoleCards()`
  - `dealFlop()`, `dealTurn()`, `dealRiver()`
  - `nextPlayer()`
  - `processBettingRound()`
  - `determineWinners()`
  - `eliminateBustedPlayers()`
  - `isGameOver()`

**Tests**: Full game flow simulation, betting round logic, winner determination

---

## Phase 3: AI Opponent Logic

### 3.1 Basic AI Player
**Files**: `src/ai/AIPlayer.js`

**AIPlayer class** (extends or uses Player):
- Methods: `decideAction(gameState)` → Returns {action, amount}
- Simple strategy:
  - Calculate hand strength
  - Consider pot odds
  - Position-based aggression (late position more aggressive)
  - Random variance to simulate different player types (tight/aggressive/passive)
- Decision factors: hand strength, pot size, position, opponents remaining

**Tests**: AI makes legal moves, reasonable betting patterns

---

## Phase 4: Game Theory Engine

### 4.1 Hand Strength Calculator
**Files**: `src/gto/HandStrength.js`

**HandStrength class**:
- `calculateWinProbability(holeCards, communityCards, numOpponents)` → percentage
- Use Monte Carlo simulation:
  - Deal random cards to opponents
  - Complete the board with random cards
  - Compare hands
  - Run 10,000+ simulations
  - Return win/tie/loss percentages

**Tests**: Known scenarios (AA vs random, pocket pairs, etc.)

### 4.2 Expected Value Calculator
**Files**: `src/gto/EVCalculator.js`

**EVCalculator class**:
- `calculatePotOdds(potSize, callAmount)` → ratio
- `calculateExpectedValue(winProbability, potSize, callAmount)` → EV
- `shouldCallBasedOnOdds(winProb, potOdds)` → boolean

**Tests**: EV calculations for various scenarios

### 4.3 GTO Advisor
**Files**: `src/gto/GTOAdvisor.js`

**GTOAdvisor class**:
- `getOptimalAction(gameState, player)` → Advice object
- Returns:
  ```javascript
  {
    winProbability: 0.45,
    potOdds: "3:1",
    expectedValue: 25,
    recommendation: "CALL",
    reasoning: "You have 45% chance to win, pot odds favor calling",
    handStrength: "Middle Pair",
    rangeAnalysis: "2-3 opponents likely have better hands"
  }
  ```
- Factors:
  - Current hand strength
  - Win probability vs remaining opponents
  - Pot odds and implied odds
  - Position
  - Stack sizes
  - Betting patterns (simplified)

**Tests**: Verify recommendations for known GTO scenarios

---

## Phase 5: User Interface

### 5.1 HTML Structure
**Files**: `index.html`

Elements:
- Poker table (centered)
- 6 player positions (arranged in ellipse)
- Community cards display
- Pot size display
- Player info boxes (name, chips, current bet)
- Action buttons (Fold, Check/Call, Raise, GT Button)
- Raise amount input
- Game log/status text

### 5.2 UI Renderer
**Files**: `src/ui/Renderer.js`

**Renderer class**:
- `renderTable(gameState)`
- `renderPlayers(players[])`
- `renderCommunityCards(cards[])`
- `renderPlayerCards(cards[])`
- `renderPot(amount)`
- `showGTOAdvice(advice)`
- `updateActionButtons(availableActions[])`
- `animateAction(player, action)` (optional, for polish)

### 5.3 Controller
**Files**: `src/ui/Controller.js`

**Controller class**:
- Handles button clicks
- Validates user input
- Calls game methods
- Updates UI via Renderer
- Implements "skip through opponent actions" feature (auto-advance with visual feedback)

**Files**: `src/ui/styles.css`
- Poker table styling
- Card representations (Unicode symbols or images)
- Responsive layout
- Modal for GTO advice

---

## Phase 6: Integration & Testing

### 6.1 Test Suite Structure
**Files**: `tests/*.test.js`

Test files:
- `Card.test.js`
- `Deck.test.js`
- `HandEvaluator.test.js`
- `Player.test.js`
- `Pot.test.js`
- `Game.test.js`
- `AIPlayer.test.js`
- `HandStrength.test.js`
- `EVCalculator.test.js`
- `GTOAdvisor.test.js`

Use Jest with coverage reporting.

### 6.2 Main Application Entry
**Files**: `src/main.js`

Initialize game:
```javascript
import Game from './core/Game.js';
import Controller from './ui/Controller.js';
import Renderer from './ui/Renderer.js';

const game = new Game();
const renderer = new Renderer();
const controller = new Controller(game, renderer);

controller.startGame();
```

---

## File Structure
```
PokerGT/
├── index.html
├── README.md
├── CLAUDE_PLAN.md
├── package.json
├── jest.config.js
├── src/
│   ├── main.js
│   ├── core/
│   │   ├── Card.js
│   │   ├── Deck.js
│   │   ├── HandEvaluator.js
│   │   ├── Player.js
│   │   ├── Pot.js
│   │   └── Game.js
│   ├── ai/
│   │   └── AIPlayer.js
│   ├── gto/
│   │   ├── HandStrength.js
│   │   ├── EVCalculator.js
│   │   └── GTOAdvisor.js
│   └── ui/
│       ├── Renderer.js
│       ├── Controller.js
│       └── styles.css
└── tests/
    ├── Card.test.js
    ├── Deck.test.js
    ├── HandEvaluator.test.js
    ├── Player.test.js
    ├── Pot.test.js
    ├── Game.test.js
    ├── AIPlayer.test.js
    ├── HandStrength.test.js
    ├── EVCalculator.test.js
    └── GTOAdvisor.test.js
```

---

## Implementation Order

### Sprint 1: Core Foundation
1. Card and Deck classes with tests
2. HandEvaluator with comprehensive tests
3. Player class with tests

### Sprint 2: Game Logic
4. Pot management with tests
5. Game class with basic flow
6. Full game simulation tests

### Sprint 3: Intelligence
7. Basic AI player logic
8. Hand strength calculator (Monte Carlo)
9. EV calculator

### Sprint 4: GTO System
10. GTO Advisor with recommendation engine
11. Integration tests for GTO advice
12. Validate against known poker scenarios

### Sprint 5: User Interface
13. HTML structure
14. CSS styling
15. Renderer class
16. Controller class
17. Event handling

### Sprint 6: Polish & Testing
18. End-to-end testing
19. Bug fixes
20. UI/UX improvements
21. Performance optimization (if Monte Carlo is slow)

---

## Key Technical Decisions

### Hand Evaluation Algorithm
Use a lookup table approach or bit manipulation for fast hand evaluation:
- Convert cards to bitmask representation
- Use prime number product for rank detection
- O(1) lookup time for hand comparison

### Monte Carlo Simulation
For win probability calculation:
- Run 10,000+ iterations for accuracy
- Can be reduced to 1,000 for faster feedback during development
- Consider Web Worker for non-blocking calculation (advanced optimization)

### GTO Simplifications
Full GTO solver is complex; our simplified approach:
- Use win probability as primary metric
- Apply basic pot odds calculations
- Consider position and stack sizes
- Don't model opponent ranges deeply (simplified for AI)
- Focus on mathematically correct decisions based on win%

### Testing Strategy
- Unit tests: 90%+ coverage for core logic
- Integration tests: Full game scenarios
- Manual testing: UI interactions
- No E2E framework needed (simple static site)

---

## Development Setup

### Dependencies
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

### NPM Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Running the Game
Simply open `index.html` in a browser (or use a local server like `python -m http.server`).

---

## Potential Challenges & Solutions

### Challenge 1: Hand Evaluation Speed
**Solution**: Implement efficient lookup tables, use proven algorithms like Cactus Kev's evaluator

### Challenge 2: Monte Carlo Performance
**Solution**: Start with 1,000 iterations, optimize later. Consider memoization for identical scenarios.

### Challenge 3: Accurate GTO Advice
**Solution**: Research basic poker strategy, focus on mathematically sound pot odds and equity calculations rather than exploitative play.

### Challenge 4: AI Realism
**Solution**: Add randomness to AI decisions, vary player "personalities" (tight/loose, passive/aggressive).

### Challenge 5: Side Pot Complexity
**Solution**: Implement side pot logic carefully with extensive tests for all-in scenarios.

---

## Resources for GTO Research

1. **Poker hand equity**: Calculate % of time hand wins vs random hands
2. **Pot odds**: Ratio of current pot size to cost of a contemplated call
3. **Expected value**: EV = (Win% × PotAfterWin) - (Loss% × CallCost)
4. **Position importance**: Later position = more aggressive play
5. **Basic GTO principles**:
   - Fold if EV < 0
   - Call if pot odds > win probability needed
   - Raise with strong hands and some bluffs (balanced strategy)

---

## Success Criteria

- [ ] Game playable from start to finish
- [ ] All poker rules correctly implemented
- [ ] Hand evaluation 100% accurate
- [ ] AI makes reasonable decisions
- [ ] GTO button provides mathematically sound advice
- [ ] Win probability calculation within 5% of actual odds
- [ ] All core classes have 90%+ test coverage
- [ ] UI is functional and usable
- [ ] No server required (runs as static files)

---

## Estimated Token Efficiency

By using OOP with comprehensive tests:
- **Write once**: Classes are self-contained and well-defined
- **Test independently**: Catch bugs early with unit tests
- **Fewer iterations**: Less back-and-forth debugging
- **Clear structure**: Easy to understand and modify
- **Modular development**: Can implement and test one class at a time

This approach minimizes token usage by reducing debugging cycles and enabling incremental, verified development.
