import { SnakeGame } from '../game-logic';
import '@testing-library/jest-dom';

// Mock DOM elements and event listeners
describe('Game UI Integration', () => {
  // Mock DOM elements
  let mockElements;
  let eventListeners = {};
  
  // Mock game instance
  let game;
  
  beforeEach(() => {
    // Reset event listeners
    eventListeners = {};
    
    // Create mock DOM elements
    mockElements = {
      gameBoard: createMockElement('div'),
      scoreElement: createMockElement('div'),
      highScoreElement: createMockElement('div'),
      speedElement: createMockElement('div'),
      gameOverScreen: createMockElement('div'),
      finalScoreElement: createMockElement('div'),
      restartButton: createMockElement('button'),
      settingsButton: createMockElement('button'),
      settingsScreen: createMockElement('div'),
      wallPassToggle: createMockElement('input', { type: 'checkbox' }),
      countdownTimeInput: createMockElement('input', { type: 'number', value: '3' }),
      saveSettingsButton: createMockElement('button'),
      cancelSettingsButton: createMockElement('button'),
      countdownOverlay: createMockElement('div'),
      countdownElement: createMockElement('div')
    };
    
    // Mock document.getElementById
    document.getElementById = jest.fn(id => {
      const elementMap = {
        'game-board': mockElements.gameBoard,
        'score': mockElements.scoreElement,
        'high-score': mockElements.highScoreElement,
        'speed': mockElements.speedElement,
        'game-over': mockElements.gameOverScreen,
        'final-score': mockElements.finalScoreElement,
        'restart-btn': mockElements.restartButton,
        'settings-btn': mockElements.settingsButton,
        'settings-screen': mockElements.settingsScreen,
        'wall-pass': mockElements.wallPassToggle,
        'countdown-time': mockElements.countdownTimeInput,
        'save-btn': mockElements.saveSettingsButton,
        'cancel-btn': mockElements.cancelSettingsButton,
        'countdown-overlay': mockElements.countdownOverlay,
        'countdown': mockElements.countdownElement
      };
      return elementMap[id] || null;
    });
    
    // Mock document.querySelector
    document.querySelector = jest.fn(selector => {
      if (selector === '.food') {
        return createMockElement('div', { className: 'food' });
      }
      return null;
    });
    
    // Mock document.createElement
    document.createElement = jest.fn(tag => {
      return createMockElement(tag);
    });
    
    // Mock document.addEventListener
    document.addEventListener = jest.fn((event, callback) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(callback);
    });
    
    // Create game instance
    game = new SnakeGame();
    
    // Mock setInterval and clearInterval
    global.setInterval = jest.fn(() => 123);
    global.clearInterval = jest.fn();
    
    // Load the game module
    jest.isolateModules(() => {
      require('../game');
    });
  });
  
  test('should initialize game elements on load', () => {
    // Check if game board was initialized
    expect(mockElements.gameBoard.innerHTML).toBe('');
    
    // Check if score elements were initialized
    expect(mockElements.scoreElement.textContent).toBe('0');
    expect(mockElements.highScoreElement.textContent).toBe('0');
    expect(mockElements.speedElement.textContent).toBe('1');
    
    // Check if game over screen is hidden
    expect(mockElements.gameOverScreen.style.display).toBe('none');
  });
  
  test('should handle keyboard input', () => {
    // Simulate keydown events
    const keydownHandlers = eventListeners['keydown'] || [];
    expect(keydownHandlers.length).toBeGreaterThan(0);
    
    // Test arrow up key
    const upEvent = { key: 'ArrowUp' };
    keydownHandlers[0](upEvent);
    // Direction should change in the next game loop
    
    // Test escape key to open settings
    const escEvent = { key: 'Escape' };
    keydownHandlers[0](escEvent);
    expect(mockElements.settingsScreen.style.display).toBe('flex');
  });
  
  test('should toggle settings screen', () => {
    // Get click handlers
    const settingsButtonClick = mockElements.settingsButton.onclick;
    const saveButtonClick = mockElements.saveSettingsButton.onclick;
    const cancelButtonClick = mockElements.cancelSettingsButton.onclick;
    
    // Open settings
    settingsButtonClick();
    expect(mockElements.settingsScreen.style.display).toBe('flex');
    
    // Toggle wall pass setting
    mockElements.wallPassToggle.checked = true;
    
    // Save settings
    saveButtonClick();
    expect(mockElements.settingsScreen.style.display).toBe('none');
    expect(mockElements.countdownOverlay.style.display).toBe('flex');
    
    // Open settings again
    settingsButtonClick();
    
    // Cancel settings
    cancelButtonClick();
    expect(mockElements.settingsScreen.style.display).toBe('none');
    expect(mockElements.countdownOverlay.style.display).toBe('flex');
  });
  
  test('should restart game when restart button is clicked', () => {
    // Set game over state
    mockElements.gameOverScreen.style.display = 'flex';
    
    // Click restart button
    const restartButtonClick = mockElements.restartButton.onclick;
    restartButtonClick();
    
    // Game should be restarted
    expect(mockElements.gameOverScreen.style.display).toBe('none');
    expect(mockElements.scoreElement.textContent).toBe('0');
  });
});

// Helper function to create mock DOM elements
function createMockElement(tag, attributes = {}) {
  const element = {
    tagName: tag.toUpperCase(),
    style: {
      display: 'block'
    },
    className: '',
    innerHTML: '',
    textContent: '',
    appendChild: jest.fn(child => {
      // Simulate appendChild
    }),
    remove: jest.fn(),
    addEventListener: jest.fn((event, callback) => {
      element[`on${event}`] = callback;
    }),
    ...attributes
  };
  return element;
}
