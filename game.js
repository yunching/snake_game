document.addEventListener('DOMContentLoaded', () => {
    // Game constants
    const GRID_SIZE = 20; // Size of each grid cell in pixels
    const BOARD_WIDTH = 500;
    const BOARD_HEIGHT = 500;
    const GRID_WIDTH = BOARD_WIDTH / GRID_SIZE;
    const GRID_HEIGHT = BOARD_HEIGHT / GRID_SIZE;
    const INITIAL_SPEED = 150; // Initial delay in milliseconds
    const MIN_SPEED = 50; // Minimum delay (maximum game speed)
    const SPEED_DECREASE = 5; // How much to decrease delay per food eaten

    // Game elements
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const speedElement = document.getElementById('speed');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-btn');
    
    // Settings elements
    const settingsButton = document.getElementById('settings-btn');
    const settingsScreen = document.getElementById('settings-screen');
    const wallPassToggle = document.getElementById('wall-pass');
    const countdownTimeInput = document.getElementById('countdown-time');
    const saveSettingsButton = document.getElementById('save-btn');
    const cancelSettingsButton = document.getElementById('cancel-btn');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownElement = document.getElementById('countdown');

    // Game state
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = INITIAL_SPEED;
    let speedLevel = 1;
    let gameInterval;
    let gameRunning = false;
    let gamePaused = false;
    
    // Settings state
    let wallPassEnabled = false;
    let countdownTime = 3;
    let originalSettings = {
        wallPassEnabled: false,
        countdownTime: 3
    };

    // Initialize the game
    function initGame() {
        // Clear the board
        gameBoard.innerHTML = '';
        gameOverScreen.style.display = 'none';
        
        // Reset game state
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        gameSpeed = INITIAL_SPEED;
        speedLevel = 1;
        
        // Update display
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        speedElement.textContent = speedLevel;
        
        // Create initial snake
        snake.forEach((part, index) => {
            createSnakePart(part, index === 0);
        });
        
        // Create initial food
        createFood();
        
        // Start game loop
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
        gameRunning = true;
        gamePaused = false;
    }

    // Create a snake part
    function createSnakePart(position, isHead = false) {
        const snakePart = document.createElement('div');
        snakePart.className = isHead ? 'snake-part snake-head' : 'snake-part';
        snakePart.style.width = `${GRID_SIZE}px`;
        snakePart.style.height = `${GRID_SIZE}px`;
        snakePart.style.left = `${position.x * GRID_SIZE}px`;
        snakePart.style.top = `${position.y * GRID_SIZE}px`;
        gameBoard.appendChild(snakePart);
    }

    // Create food
    function createFood() {
        // Remove existing food
        const existingFood = document.querySelector('.food');
        if (existingFood) {
            existingFood.remove();
        }
        
        // Generate random position that's not on the snake
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
        } while (snake.some(part => part.x === foodPosition.x && part.y === foodPosition.y));
        
        food = foodPosition;
        
        // Create food element
        const foodElement = document.createElement('div');
        foodElement.className = 'food';
        foodElement.style.width = `${GRID_SIZE}px`;
        foodElement.style.height = `${GRID_SIZE}px`;
        foodElement.style.left = `${food.x * GRID_SIZE}px`;
        foodElement.style.top = `${food.y * GRID_SIZE}px`;
        gameBoard.appendChild(foodElement);
    }

    // Main game loop
    function gameLoop() {
        if (gamePaused) return;
        
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = { ...snake[0] };
        
        switch (direction) {
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
        if (wallPassEnabled) {
            // Wrap around if wall pass is enabled
            if (head.x < 0) head.x = GRID_WIDTH - 1;
            if (head.x >= GRID_WIDTH) head.x = 0;
            if (head.y < 0) head.y = GRID_HEIGHT - 1;
            if (head.y >= GRID_HEIGHT) head.y = 0;
        } else {
            // Check for wall collisions if wall pass is disabled
            if (
                head.x < 0 || 
                head.x >= GRID_WIDTH || 
                head.y < 0 || 
                head.y >= GRID_HEIGHT
            ) {
                gameOver();
                return;
            }
        }
        
        // Check for self collision
        if (snake.some(part => part.x === head.x && part.y === head.y)) {
            gameOver();
            return;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Increase speed every 5 food items
            if (score % 50 === 0 && gameSpeed > MIN_SPEED) {
                gameSpeed -= SPEED_DECREASE;
                speedLevel++;
                speedElement.textContent = speedLevel;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
            
            // Create new food
            createFood();
        } else {
            // Remove tail
            snake.pop();
        }
        
        // Redraw snake
        gameBoard.innerHTML = '';
        snake.forEach((part, index) => {
            createSnakePart(part, index === 0);
        });
        
        // Redraw food
        const foodElement = document.createElement('div');
        foodElement.className = 'food';
        foodElement.style.width = `${GRID_SIZE}px`;
        foodElement.style.height = `${GRID_SIZE}px`;
        foodElement.style.left = `${food.x * GRID_SIZE}px`;
        foodElement.style.top = `${food.y * GRID_SIZE}px`;
        gameBoard.appendChild(foodElement);
    }

    // Handle game over
    function gameOver() {
        gameRunning = false;
        gamePaused = false;
        clearInterval(gameInterval);
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'flex';
    }
    
    // Pause the game
    function pauseGame() {
        if (!gameRunning || gamePaused) return;
        gamePaused = true;
    }
    
    // Resume the game with countdown
    function resumeGame() {
        if (!gameRunning || !gamePaused) return;
        
        // Show countdown overlay
        countdownOverlay.style.display = 'flex';
        countdownElement.textContent = countdownTime;
        
        let timeLeft = countdownTime;
        
        // Start countdown
        const countdownInterval = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                // End countdown
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                gamePaused = false;
            } else {
                // Update countdown display
                countdownElement.textContent = timeLeft;
            }
        }, 1000);
    }
    
    // Open settings screen
    function openSettings() {
        if (!gameRunning) return;
        
        // Pause the game
        pauseGame();
        
        // Store original settings in case user cancels
        originalSettings = {
            wallPassEnabled: wallPassEnabled,
            countdownTime: countdownTime
        };
        
        // Update settings UI to match current settings
        wallPassToggle.checked = wallPassEnabled;
        countdownTimeInput.value = countdownTime;
        
        // Show settings screen
        settingsScreen.style.display = 'flex';
    }
    
    // Close settings screen and apply changes
    function saveSettings() {
        // Update settings
        wallPassEnabled = wallPassToggle.checked;
        countdownTime = parseInt(countdownTimeInput.value) || 3;
        
        // Validate countdown time
        if (countdownTime < 1) countdownTime = 1;
        if (countdownTime > 10) countdownTime = 10;
        
        // Close settings screen
        settingsScreen.style.display = 'none';
        
        // Resume game with countdown
        resumeGame();
    }
    
    // Close settings screen without applying changes
    function cancelSettings() {
        // Restore original settings
        wallPassEnabled = originalSettings.wallPassEnabled;
        countdownTime = originalSettings.countdownTime;
        
        // Close settings screen
        settingsScreen.style.display = 'none';
        
        // Resume game with countdown
        resumeGame();
    }

    // Handle keyboard input
    document.addEventListener('keydown', (event) => {
        if (!gameRunning) return;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case 'Escape':
                // Toggle settings screen
                if (settingsScreen.style.display === 'flex') {
                    cancelSettings();
                } else {
                    openSettings();
                }
                break;
        }
    });

    // Event listeners for settings
    settingsButton.addEventListener('click', openSettings);
    saveSettingsButton.addEventListener('click', saveSettings);
    cancelSettingsButton.addEventListener('click', cancelSettings);
    
    // Handle restart button
    restartButton.addEventListener('click', initGame);

    // Start the game
    initGame();
});
