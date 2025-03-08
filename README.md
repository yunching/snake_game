# Snake Game

A beautiful snake game built with JavaScript and HTML.

## Features

- Modern UI with a dark theme and glowing elements
- Smooth controls using arrow keys or WASD
- Score tracking (current score, high score, and speed level)
- Progressive difficulty - game gets faster as your score increases
- Settings screen with configurable options:
  - Wall-passing feature (snake can pass through walls)
  - Configurable countdown timer when resuming the game
- Game over screen with restart functionality

## How to Play

1. Use the arrow keys or WASD to control the snake
2. Eat the food (orange dots) to grow and increase your score
3. Avoid hitting the walls or yourself (unless wall-passing is enabled)
4. Press ESC or click the gear icon to access settings

## Testing

This project uses Jest for testing. The tests are organized into two categories:

1. **Game Logic Tests**: Tests the core game mechanics independent of the DOM
2. **UI Integration Tests**: Tests the interaction between the game logic and the UI

### Running Tests

To run the tests, follow these steps:

1. Install dependencies:
   ```
   npm install
   ```

2. Run all tests:
   ```
   npm test
   ```

3. Run tests in watch mode (for development):
   ```
   npm run test:watch
   ```

### Test Structure

- `__tests__/game-logic.test.js`: Tests for the core game logic
  - Initialization
  - Direction control
  - Movement and collision detection
  - Food generation and scoring
  - Game state management

- `__tests__/game-ui.test.js`: Tests for UI integration
  - DOM element initialization
  - Keyboard input handling
  - Settings screen functionality
  - Game restart functionality

## Project Structure

- `index.html`: Main HTML file with game structure and styling
- `game.js`: Main game file with DOM manipulation and event handling
- `game-logic.js`: Core game logic separated for testability
- `__tests__/`: Directory containing test files
- `package.json`: NPM package configuration
- `jest.config.js`: Jest configuration
- `babel.config.js`: Babel configuration for transpiling modern JavaScript
- `jest.setup.js`: Jest setup file with test environment configuration
