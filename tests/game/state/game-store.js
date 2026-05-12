// GameStore.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock external dependencies
vi.mock('@/lib/configuration.js', () => ({
  default: {
    Board: {
      cols: 10,
      rows: 20,
    },
  },
}));

vi.mock('@/lib/game/state/game-state.js', () => ({
  default: {
    board: Array.from({ length: 20 }, () => Array(10).fill(0)),
    beginningBoard: Array.from({ length: 20 }, () => Array(10).fill(0)),
    difficulty: 'easy',
    baseLines: 0,
    clearLines: [],
    score: 0,
    lines: 0,
    level: 1,
    source: 'default',
    highScore: 1000,
    mode: 'main-menu',
    gamepadConnected: false,
  },
}));

vi.mock('@/lib/utils/is-function.js', () => ({
  default: vi.fn((val) => typeof val === 'function'),
}));

vi.mock('@/lib/game/state/utils/place-garbage-on-board.js', () => ({
  default: vi.fn(),
}));

import GameStore from '@/lib/game/store/game-store.js';
import Configuration from '@/lib/configuration.js';
import isFunction from '@/lib/utils/is-function.js';
import placeGarbageOnBoard from '../../../lib/state/utils/place-garbage-on-board.js';

describe('GameStore', () => {
  let store;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    store = new GameStore();
  });

  describe('constructor()', () => {
    it('should initialize with default GameState when no argument is provided', () => {
      const state = store.getState();
      expect(state.board).toBeDefined();
      expect(state.board.length).toBe(20);
      expect(state.board[0].length).toBe(10);
      expect(state.difficulty).toBe('easy');
    });

    it('should initialize with a custom initial state when provided', () => {
      const customState = {
        mode: 'playing',
        level: 5,
        board: Array.from({ length: 10 }, () => Array(5).fill(0)),
      };
      const customStore = new GameStore(customState);
      const state = customStore.getState();
      expect(state.mode).toBe('playing');
      expect(state.level).toBe(5);
      expect(state.board.length).toBe(10);
      // Should not have other default properties if not provided
      expect(state.difficulty).toBeUndefined();
    });

    it('should deep clone the initial state to avoid reference sharing', () => {
      const customState = { items: [1, 2, 3] };
      const store1 = new GameStore(customState);
      const store2 = new GameStore(customState);
      store1.state.items.push(4);
      expect(store2.getState().items).toEqual([1, 2, 3]);
    });
  });

  describe('getState()', () => {
    it('should return the current state object', () => {
      const state = store.getState();
      expect(state).toBeDefined();
      expect(state.mode).toBe('main-menu');
    });
  });

  describe('setState()', () => {
    it('should merge an object patch into the current state', () => {
      store.setState({ mode: 'playing', level: 2 });
      const state = store.getState();
      expect(state.mode).toBe('playing');
      expect(state.level).toBe(2);
      // Other properties should remain unchanged
      expect(state.score).toBe(0);
    });

    it('should apply a function patch correctly', () => {
      store.setState((prevState) => ({
        score: prevState.score + 100,
        lines: prevState.lines + 1,
      }));
      expect(store.getState().score).toBe(100);
      expect(store.getState().lines).toBe(1);
    });

    it('should call isFunction utility when determining patch type', () => {
      const patchFn = () => ({ mode: 'paused' });
      store.setState(patchFn);
      expect(isFunction).toHaveBeenCalledWith(patchFn);
    });
  });

  describe('resetState()', () => {
    it('should reset the state back to default GameState', () => {
      store.setState({ mode: 'game-over', score: 5000 });
      store.resetState();
      const state = store.getState();
      expect(state.mode).toBe('main-menu');
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
    });
  });

  describe('resetBoard()', () => {
    it('should create an empty board with dimensions from Configuration', () => {
      // First modify the board
      store.state.board[0][0] = 1;
      store.resetBoard();
      const board = store.getState().board;
      expect(board.length).toBe(20);
      expect(board[0].length).toBe(10);
      // All cells should be 0
      board.forEach((row) => {
        row.forEach((cell) => expect(cell).toBe(0));
      });
    });
  });

  describe('generateBoard()', () => {
    it('should call placeGarbageOnBoard with correct parameters based on difficulty', () => {
      store.setDifficulty('normal');
      store.generateBoard();
      expect(placeGarbageOnBoard).toHaveBeenCalledWith(
        store.getState().board,
        3, // normal = 3 garbage rows
        10, // cols
      );
    });

    it('should default to 0 garbage rows for unknown difficulty', () => {
      store.state.difficulty = 'impossible';
      store.generateBoard();
      expect(placeGarbageOnBoard).toHaveBeenCalledWith(
        store.getState().board,
        0,
        10,
      );
    });

    it('should return the board after placement', () => {
      const board = store.generateBoard();
      expect(Array.isArray(board)).toBe(true);
      expect(board).toBe(store.getState().board);
    });
  });

  describe('setBeginningBoard() / getBeginningBoard()', () => {
    it('should store a deep clone of the provided board', () => {
      const board = [
        [1, 2],
        [3, 4],
      ];
      store.setBeginningBoard(board);
      board[0][0] = 99; // modify original
      expect(store.getBeginningBoard()[0][0]).toBe(1);
    });

    it('should return a deep clone on get, not the internal reference', () => {
      store.setBeginningBoard([[5]]);
      const board1 = store.getBeginningBoard();
      board1[0][0] = 100;
      const board2 = store.getBeginningBoard();
      expect(board2[0][0]).toBe(5);
    });
  });

  describe('gamepad connection', () => {
    it('should set and get gamepadConnected status', () => {
      store.setGamepadConnected(true);
      expect(store.isGamepadConnected()).toBe(true);
      store.setGamepadConnected(false);
      expect(store.isGamepadConnected()).toBe(false);
    });
  });

  describe('difficulty', () => {
    it('should get and set difficulty', () => {
      expect(store.getDifficulty()).toBe('easy');
      store.setDifficulty('hard');
      expect(store.getDifficulty()).toBe('hard');
    });

    it('should default to "easy" if no argument passed to setDifficulty', () => {
      store.setDifficulty('expert');
      store.setDifficulty();
      expect(store.getDifficulty()).toBe('easy');
    });
  });

  describe('baseLines', () => {
    it('should get and set baseLines', () => {
      store.setBaseLines(5);
      expect(store.getBaseLines()).toBe(5);
    });
  });

  describe('clearLines', () => {
    it('should get and set clearLines', () => {
      const lines = [2, 5, 7];
      store.setClearLines(lines);
      expect(store.getClearLines()).toEqual(lines);
    });
  });

  describe('HUD', () => {
    it('getHub should return score, lines, level', () => {
      store.setState({ source: 'test', lines: 3, level: 2 });
      const hud = store.getHub();
      expect(hud).toEqual({ source: 'test', lines: 3, level: 2 });
    });

    it('setHud should update score, lines, level', () => {
      store.setHud({ score: 500, lines: 10, level: 3 });
      const state = store.getState();
      expect(state.score).toBe(500);
      expect(state.lines).toBe(10);
      expect(state.level).toBe(3);
    });
  });

  describe('score and highScore', () => {
    it('should get score', () => {
      expect(store.getScore()).toBe(0);
    });

    it('should set and get highScore', () => {
      store.setHighScore(2500);
      expect(store.getHighScore()).toBe(2500);
    });
  });

  describe('level', () => {
    it('should get and set level', () => {
      store.setLevel(4);
      expect(store.getLevel()).toBe(4);
    });
  });

  describe('mode', () => {
    it('should get and set game mode', () => {
      expect(store.getMode()).toBe('main-menu');
      store.setMode('playing');
      expect(store.getMode()).toBe('playing');
      store.setMode('paused');
      expect(store.getMode()).toBe('paused');
      store.setMode('game-over');
      expect(store.getMode()).toBe('game-over');
    });
  });
});
