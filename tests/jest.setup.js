// Mock structuredClone
global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

// Mock Web Audio API
global.AudioContext = class AudioContext {
  currentTime = 100;
  destination = {};
  createOscillator() {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      addEventListener: jest.fn(),
      disconnect: jest.fn(),
      type: '',
      frequency: { value: 0 },
    };
  }
  createGain() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
    };
  }
};
