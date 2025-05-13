/**
 * Jest setup file for SpinCube tests
 */

// Mock browser environment
global.document = {
  createElement: jest.fn().mockImplementation((tag) => {
    if (tag === "canvas") {
      return {
        getContext: jest.fn().mockImplementation((contextType) => {
          if (contextType === "2d") {
            return {
              fillStyle: "",
              fillRect: jest.fn(),
              shadowColor: "",
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              font: "",
              textAlign: "",
              textBaseline: "",
              fillText: jest.fn(),
              strokeStyle: "",
              lineWidth: 0,
              strokeText: jest.fn(),
              createLinearGradient: jest.fn().mockImplementation(() => ({
                addColorStop: jest.fn(),
              })),
            };
          }
          return {};
        }),
        width: 0,
        height: 0,
      };
    }
    return {};
  }),
  body: {
    appendChild: jest.fn(),
  },
};

// Mock window
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: jest.fn(),
};

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 0));

// Mock console methods
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock Math.random to be deterministic for tests
const originalRandom = Math.random;
global.Math.random = jest.fn(() => 0.5);

// Restore original Math.random after tests
afterAll(() => {
  global.Math.random = originalRandom;
});
