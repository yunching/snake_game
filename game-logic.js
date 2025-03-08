/**
 * Snake Game Logic Module
 * Contains the core game logic separated from DOM manipulation for testability
 */
export class SnakeGame {
  constructor(config = {}) {
    // Game board dimensions
    this.gridWidth = config.gridWidth || 25;
    this.gridHeight = config.gridHeight || 25;
    
    // Game settings
    this.wallPassEnabled = config.wallPassEnabled || false;
    this.countdownTime = config.countdownTime || 3;
    
    // Initialize game state
    this.reset();
  }
  
  /**
   * Reset the game to initial state
   */
  reset() {
    // Snake initial position (middle of the board)
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    
    // Initial direction
    this.direction = 'right';
    this.nextDirection = 'right';
    
    // Score and game state
    this.score = 0;
    this.gameOver = false;
    this.gamePaused = false;
    
    // Generate initial food
    this.generateFood();
  }
  
  /**
   * Generate food at a random position not occupied by the snake
   */
  generateFood() {
    let foodPosition;
    do {
      foodPosition = {
        x: Math.floor(Math.random() * this.gridWidth),
        y: Math.floor(Math.random() * this.gridHeight)
      };
    } while (this.isPositionOccupied(foodPosition));
    
    this.food = foodPosition;
    return this.food;
  }
  
  /**
   * Check if a position is occupied by the snake
   */
  isPositionOccupied(position) {
    return this.snake.some(part => part.x === position.x && part.y === position.y);
  }
  
  /**
   * Set the next direction of the snake
   */
  setDirection(newDirection) {
    // Prevent 180-degree turns
    if (
      (this.direction === 'up' && newDirection === 'down') ||
      (this.direction === 'down' && newDirection === 'up') ||
      (this.direction === 'left' && newDirection === 'right') ||
      (this.direction === 'right' && newDirection === 'left')
    ) {
      return false;
    }
    
    this.nextDirection = newDirection;
    return true;
  }
  
  /**
   * Toggle wall-passing feature
   */
  toggleWallPass(enabled) {
    this.wallPassEnabled = enabled;
  }
  
  /**
   * Set countdown time
   */
  setCountdownTime(seconds) {
    this.countdownTime = Math.max(1, Math.min(10, seconds));
  }
  
  /**
   * Pause the game
   */
  pause() {
    this.gamePaused = true;
  }
  
  /**
   * Resume the game
   */
  resume() {
    this.gamePaused = false;
  }
  
  /**
   * Update game state for one step
   * Returns an object with the updated state
   */
  update() {
    if (this.gameOver || this.gamePaused) {
      return {
        snake: this.snake,
        food: this.food,
        score: this.score,
        gameOver: this.gameOver
      };
    }
    
    // Update direction
    this.direction = this.nextDirection;
    
    // Calculate new head position
    const head = { ...this.snake[0] };
    
    switch (this.direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }
    
    // Handle wall collision based on settings
    if (this.wallPassEnabled) {
      // Wrap around if wall pass is enabled
      if (head.x < 0) head.x = this.gridWidth - 1;
      if (head.x >= this.gridWidth) head.x = 0;
      if (head.y < 0) head.y = this.gridHeight - 1;
      if (head.y >= this.gridHeight) head.y = 0;
    } else {
      // Check for wall collisions if wall pass is disabled
      if (
        head.x < 0 || 
        head.x >= this.gridWidth || 
        head.y < 0 || 
        head.y >= this.gridHeight
      ) {
        this.gameOver = true;
        return {
          snake: this.snake,
          food: this.food,
          score: this.score,
          gameOver: this.gameOver
        };
      }
    }
    
    // Check for self collision
    if (this.snake.some(part => part.x === head.x && part.y === head.y)) {
      this.gameOver = true;
      return {
        snake: this.snake,
        food: this.food,
        score: this.score,
        gameOver: this.gameOver
      };
    }
    
    // Add new head
    this.snake.unshift(head);
    
    // Check if food is eaten
    let foodEaten = false;
    if (head.x === this.food.x && head.y === this.food.y) {
      // Increase score
      this.score += 10;
      foodEaten = true;
      
      // Generate new food
      this.generateFood();
    } else {
      // Remove tail if no food eaten
      this.snake.pop();
    }
    
    return {
      snake: this.snake,
      food: this.food,
      score: this.score,
      gameOver: this.gameOver,
      foodEaten
    };
  }
  
  /**
   * Get current game state
   */
  getState() {
    return {
      snake: this.snake,
      food: this.food,
      direction: this.direction,
      nextDirection: this.nextDirection,
      score: this.score,
      gameOver: this.gameOver,
      gamePaused: this.gamePaused,
      wallPassEnabled: this.wallPassEnabled,
      countdownTime: this.countdownTime
    };
  }
}
