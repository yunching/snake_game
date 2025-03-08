import { SnakeGame } from '../game-logic';

describe('SnakeGame', () => {
  let game;

  beforeEach(() => {
    // Create a new game instance before each test
    game = new SnakeGame({
      gridWidth: 20,
      gridHeight: 20
    });
  });

  describe('initialization', () => {
    test('should initialize with default settings', () => {
      const state = game.getState();
      
      // Check initial snake position
      expect(state.snake).toHaveLength(3);
      expect(state.snake[0]).toEqual({ x: 10, y: 10 }); // Head
      expect(state.snake[1]).toEqual({ x: 9, y: 10 });
      expect(state.snake[2]).toEqual({ x: 8, y: 10 });
      
      // Check initial direction
      expect(state.direction).toBe('right');
      expect(state.nextDirection).toBe('right');
      
      // Check initial game state
      expect(state.score).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.gamePaused).toBe(false);
      
      // Check default settings
      expect(state.wallPassEnabled).toBe(false);
      expect(state.countdownTime).toBe(3);
      
      // Check that food exists and is not on the snake
      expect(state.food).toBeDefined();
      expect(game.isPositionOccupied(state.food)).toBe(false);
    });
    
    test('should initialize with custom settings', () => {
      const customGame = new SnakeGame({
        gridWidth: 30,
        gridHeight: 30,
        wallPassEnabled: true,
        countdownTime: 5
      });
      
      const state = customGame.getState();
      expect(state.wallPassEnabled).toBe(true);
      expect(state.countdownTime).toBe(5);
    });
  });

  describe('direction control', () => {
    test('should change direction when valid', () => {
      expect(game.setDirection('up')).toBe(true);
      expect(game.getState().nextDirection).toBe('up');
    });
    
    test('should not allow 180-degree turns', () => {
      // Initial direction is 'right'
      expect(game.setDirection('left')).toBe(false);
      expect(game.getState().nextDirection).toBe('right');
      
      // Change to up, then try down
      game.setDirection('up');
      expect(game.setDirection('down')).toBe(false);
      expect(game.getState().nextDirection).toBe('up');
    });
  });

  describe('movement and collision', () => {
    test('should move snake in the current direction', () => {
      const initialHead = { ...game.getState().snake[0] };
      game.update();
      const newHead = game.getState().snake[0];
      
      // Moving right, so x should increase by 1
      expect(newHead.x).toBe(initialHead.x + 1);
      expect(newHead.y).toBe(initialHead.y);
    });
    
    test('should detect wall collision when wall pass is disabled', () => {
      // Move snake to the edge
      game.snake = [
        { x: 19, y: 10 }, // Head at right edge
        { x: 18, y: 10 },
        { x: 17, y: 10 }
      ];
      
      // Update should cause game over due to wall collision
      game.update();
      expect(game.getState().gameOver).toBe(true);
    });
    
    test('should wrap around when wall pass is enabled', () => {
      // Enable wall pass
      game.toggleWallPass(true);
      
      // Move snake to the edge
      game.snake = [
        { x: 19, y: 10 }, // Head at right edge
        { x: 18, y: 10 },
        { x: 17, y: 10 }
      ];
      
      // Update should wrap around to the left edge
      game.update();
      expect(game.getState().snake[0]).toEqual({ x: 0, y: 10 });
      expect(game.getState().gameOver).toBe(false);
    });
    
    test('should detect self collision', () => {
      // Create a snake that will collide with itself
      game.snake = [
        { x: 10, y: 10 }, // Head
        { x: 11, y: 10 },
        { x: 12, y: 10 },
        { x: 13, y: 10 },
        { x: 14, y: 10 },
        { x: 14, y: 11 },
        { x: 13, y: 11 },
        { x: 12, y: 11 },
        { x: 11, y: 11 },
        { x: 10, y: 11 }  // Tail
      ];
      
      // Set direction to down to cause collision
      game.setDirection('down');
      game.direction = 'down';
      
      // Update should cause game over due to self collision
      game.update();
      expect(game.getState().gameOver).toBe(true);
    });
  });

  describe('food and scoring', () => {
    test('should increase score and snake length when food is eaten', () => {
      // Position snake head right before food
      const foodPosition = { ...game.food };
      game.snake = [
        { x: foodPosition.x - 1, y: foodPosition.y }, // Head one position to the left of food
        { x: foodPosition.x - 2, y: foodPosition.y },
        { x: foodPosition.x - 3, y: foodPosition.y }
      ];
      
      const initialLength = game.snake.length;
      const initialScore = game.score;
      
      // Update should cause food to be eaten
      const result = game.update();
      
      expect(result.foodEaten).toBe(true);
      expect(game.score).toBe(initialScore + 10);
      expect(game.snake.length).toBe(initialLength + 1);
      
      // Food should have moved to a new position
      expect(game.food).not.toEqual(foodPosition);
    });
    
    test('should generate food in a valid position', () => {
      // Fill most of the board with snake
      const longSnake = [];
      for (let i = 0; i < 300; i++) {
        longSnake.push({ x: i % 20, y: Math.floor(i / 20) });
      }
      game.snake = longSnake;
      
      // Generate food
      const food = game.generateFood();
      
      // Food should not be on the snake
      expect(game.isPositionOccupied(food)).toBe(false);
    });
  });

  describe('game state management', () => {
    test('should pause and resume the game', () => {
      game.pause();
      expect(game.getState().gamePaused).toBe(true);
      
      // Snake should not move when paused
      const initialSnake = [...game.snake];
      game.update();
      expect(game.snake).toEqual(initialSnake);
      
      game.resume();
      expect(game.getState().gamePaused).toBe(false);
      
      // Snake should move when resumed
      game.update();
      expect(game.snake).not.toEqual(initialSnake);
    });
    
    test('should reset the game state', () => {
      // Change game state
      game.score = 50;
      game.snake = [{ x: 5, y: 5 }];
      game.gameOver = true;
      
      // Reset game
      game.reset();
      
      // Check that state is reset
      const state = game.getState();
      expect(state.score).toBe(0);
      expect(state.snake).toHaveLength(3);
      expect(state.gameOver).toBe(false);
    });
    
    test('should update settings', () => {
      game.toggleWallPass(true);
      expect(game.getState().wallPassEnabled).toBe(true);
      
      game.setCountdownTime(7);
      expect(game.getState().countdownTime).toBe(7);
      
      // Test bounds checking
      game.setCountdownTime(15);
      expect(game.getState().countdownTime).toBe(10); // Should be capped at 10
      
      game.setCountdownTime(-5);
      expect(game.getState().countdownTime).toBe(1); // Should be at least 1
    });
  });
});
