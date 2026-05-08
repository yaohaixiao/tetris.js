import createGameStore from '@/lib/game/store/create-game-store';
import Configuration from '@/lib/configuration';
import GameState from '@/lib/game/state/game-state';

jest.mock('@/lib/configuration', () => ({
  Board: {
    rows: 20,
    cols: 10,
  },
}));

jest.mock('@/lib/game/state/game-state', () => ({
  mode: 'main-menu',
  score: 0,
  lines: 0,
  level: 1,
  highScore: 0,
  baseLines: 0,
  difficulty: 'easy',
  board: [],
  beginningBoard: [],
  clearLines: [],
  next: null,
  gamepadConnected: false,
}));

jest.mock('@/lib/game/state/utils/place-garbage-on-board', () => jest.fn());

describe('createGameStore', () => {
  let store;

  beforeEach(() => {
    store = createGameStore();
  });

  // ========== 初始化 ==========
  describe('初始化', () => {
    test('getState 返回初始状态', () => {
      const state = store.getState();
      expect(state.mode).toBe('main-menu');
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
    });

    test('可传入自定义初始状态', () => {
      const customStore = createGameStore({
        mode: 'playing',
        score: 100,
        level: 5,
      });

      expect(customStore.getState().mode).toBe('playing');
      expect(customStore.getState().score).toBe(100);
      expect(customStore.getState().level).toBe(5);
    });
  });

  // ========== setState ==========
  describe('setState', () => {
    test('对象 patch 更新', () => {
      store.setState({ score: 500, lines: 2 });
      const state = store.getState();
      expect(state.score).toBe(500);
      expect(state.lines).toBe(2);
      // 其他字段保留
      expect(state.level).toBe(1);
    });

    test('函数 patch 更新', () => {
      store.setState((prev) => ({ score: prev.score + 100 }));
      expect(store.getState().score).toBe(100);
    });
  });

  // ========== resetState ==========
  describe('resetState', () => {
    test('重置到初始状态', () => {
      store.setState({ score: 999, level: 10 });
      store.resetState();
      const state = store.getState();
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
    });
  });

  // ========== resetBoard ==========
  describe('resetBoard', () => {
    test('生成 20×10 的空棋盘', () => {
      store.resetBoard();
      const board = store.getState().board;
      expect(board).toHaveLength(20);
      expect(board[0]).toHaveLength(10);
      expect(board[19].every((cell) => cell === 0)).toBe(true);
    });
  });

  // ========== mode ==========
  describe('mode', () => {
    test('getMode / setMode', () => {
      expect(store.getMode()).toBe('main-menu');
      store.setMode('playing');
      expect(store.getMode()).toBe('playing');
    });
  });

  // ========== level ==========
  describe('level', () => {
    test('getLevel / setLevel', () => {
      expect(store.getLevel()).toBe(1);
      store.setLevel(5);
      expect(store.getLevel()).toBe(5);
    });
  });

  // ========== score ==========
  describe('score', () => {
    test('getScore', () => {
      store.setState({ score: 300 });
      expect(store.getScore()).toBe(300);
    });
  });

  // ========== highScore ==========
  describe('highScore', () => {
    test('getHighScore / setHighScore', () => {
      store.setHighScore(5000);
      expect(store.getHighScore()).toBe(5000);
    });
  });

  // ========== difficulty ==========
  describe('difficulty', () => {
    test('getDifficulty / setDifficulty', () => {
      expect(store.getDifficulty()).toBe('easy');
      store.setDifficulty('hard');
      expect(store.getDifficulty()).toBe('hard');
    });
  });

  // ========== baseLines ==========
  describe('baseLines', () => {
    test('getBaseLines / setBaseLines', () => {
      store.setBaseLines(10);
      expect(store.getBaseLines()).toBe(10);
    });
  });

  // ========== clearLines ==========
  describe('clearLines', () => {
    test('getClearLines / setClearLines', () => {
      store.setClearLines([5, 10, 15]);
      expect(store.getClearLines()).toEqual([5, 10, 15]);
    });
  });

  // ========== HUD ==========
  describe('HUD', () => {
    test('getHub 返回核心数据', () => {
      store.setState({ score: 200, lines: 3, level: 2 });
      const hud = store.getHub();
      expect(hud.lines).toBe(3);
      expect(hud.level).toBe(2);
    });

    test('setHud 更新 score/lines/level', () => {
      store.setHud({ score: 400, lines: 5, level: 3 });
      expect(store.getScore()).toBe(400);
      expect(store.getState().lines).toBe(5);
      expect(store.getLevel()).toBe(3);
    });
  });

  // ========== board & beginningBoard ==========
  describe('board', () => {
    test('setBeginningBoard / getBeginningBoard 深拷贝', () => {
      const board = [[1, 2, 3]];
      store.setBeginningBoard(board);
      const result = store.getBeginningBoard();
      expect(result).toEqual(board);
      expect(result).not.toBe(board); // 不同引用
    });
  });

  // ========== gamepad ==========
  describe('gamepad', () => {
    test('setGamepadConnected / isGamepadConnected', () => {
      expect(store.isGamepadConnected()).toBe(false);
      store.setGamepadConnected(true);
      expect(store.isGamepadConnected()).toBe(true);
    });
  });

  // ========== generateBoard ==========
  describe('generateBoard', () => {
    test('调用 placeGarbageOnBoard 并返回 board', () => {
      const placeGarbageOnBoard = require('@/lib/game/state/utils/place-garbage-on-board');
      const mockBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
      store.setState({ board: mockBoard, difficulty: 'normal' });

      const result = store.generateBoard();

      expect(placeGarbageOnBoard).toHaveBeenCalledWith(mockBoard, 3, 10);
      expect(result).toBe(mockBoard);
    });
  });
});
