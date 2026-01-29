# PokerGT

A single-player web-based Texas Hold'em poker game with Game Theory Optimal (GTO) strategy recommendations.

## Features

- **Full Texas Hold'em Implementation**: Play against 5 AI opponents with realistic poker gameplay
- **GTO Advisor**: Click the "GT" button during your turn to see optimal move recommendations based on:
  - Win probability (Monte Carlo simulation)
  - Pot odds and expected value
  - Hand strength analysis
  - Strategic reasoning
- **AI Opponents**: Opponents make decisions based on hand strength, pot odds, and personality types
- **Clean Interface**: Simple, functional UI showing all game state clearly

## How to Play

**Option 1: Using HTTP Server (Recommended)**
```bash
npm install
npm run serve
# Open http://localhost:8080 in browser
```

**Option 2: Direct File**
Open `index.html` in a browser that supports ES6 modules from file:// protocol (some browsers block this)

**Playing the Game:**
1. Click "New Game" to start
2. Use action buttons (Fold, Check, Call, Raise) to play
3. Click "GT Advice" anytime to see optimal strategy recommendations
4. Game continues until only one player remains

## Game Rules

- **Starting Setup**: 6 players, 500 chips each, 5/10 blinds
- **Deck**: Standard 52-card deck, reshuffled each hand
- **Betting Rounds**: Preflop, Flop, Turn, River
- **Winning**: Eliminate all opponents by winning their chips

## Technical Details

### Architecture
- **Object-Oriented Design**: Modular classes for easy testing and maintenance
- **Client-Side Only**: All logic runs in the browser (static hosting compatible)
- **Comprehensive Testing**: 135 Jest tests covering all core functionality

### Project Structure
```
src/
  core/       - Card, Deck, HandEvaluator, Player, Game, Pot
  ai/         - AI player decision making
  gto/        - Hand strength calculator, EV calculator, GTO advisor
  ui/         - Renderer, Controller, styles
tests/        - Jest unit tests
```

### Running Tests

**Unit Tests:**
```bash
npm install
npm test
```

**E2E Tests (Playwright):**
```bash
npm install
npx playwright test
```

### GTO Algorithm

The GTO advisor uses:
1. **Monte Carlo Simulation**: Runs 500+ random simulations to calculate win probability
2. **Expected Value**: Compares pot odds to win probability
3. **Strategic Recommendations**: Suggests fold/call/raise with detailed reasoning

## Development

Built with:
- Vanilla JavaScript (ES6 modules)
- Jest for testing
- No external dependencies for game logic

## License

MIT
