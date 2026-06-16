import GameStore from '@/lib/state/game-store.js';
import placeGarbageOnBoard from '@/lib/state/utils/place-garbage-on-board.js';

// Mock 依赖
jest.mock('@/lib/state/utils/place-garbage-on-board.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/utils/types/is-function.js', () => ({
  __esModule: true,
  default: jest.fn((val) => typeof val === 'function'),
}));

describe('GameStore', () => {
  let store;
  let mockGameState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGameState = {
      beginningBoard: [],
      board: Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0),
      ),
      curr: null,
      cx: 0,
      cy: 0,
      next: null,
      score: 0,
      lines: 0,
      level: 1,
      highScore: 0,
      baseLines: 0,
      clearLines: [],
      difficulty: 'easy',
      mode: 'main-menu',
      gamepadConnected: false,
      controller: 'human',
    };

    store = new GameStore({
      GameState: mockGameState,
      cols: 10,
      rows: 20,
    });
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 GameStore 实例', () => {
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(GameStore);
    });

    it('应该深拷贝初始状态', () => {
      // 修改原始对象不应该影响 store
      mockGameState.score = 999;
      expect(store.getState().score).toBe(0);
    });

    it('defaults 应该是初始状态的深拷贝', () => {
      store.state.score = 500;
      expect(store.defaults.score).toBe(0);
    });

    it('应该存储 options', () => {
      expect(store.options).toEqual({ cols: 10, rows: 20 });
    });
  });

  // ==================== getState ====================
  describe('getState 方法', () => {
    it('应该返回当前状态', () => {
      const state = store.getState();

      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
      expect(state.mode).toBe('main-menu');
    });

    it('返回的应该是 state 引用', () => {
      const state = store.getState();

      expect(state).toBe(store.state);
    });
  });

  // ==================== setState ====================
  describe('setState 方法', () => {
    it('应该支持对象 patch 更新', () => {
      store.setState({ score: 100, level: 5 });

      expect(store.getState().score).toBe(100);
      expect(store.getState().level).toBe(5);
    });

    it('patch 更新应该保持其他字段不变', () => {
      const before = store.getState().mode;

      store.setState({ score: 200 });

      expect(store.getState().score).toBe(200);
      expect(store.getState().mode).toBe(before);
    });

    it('应该支持函数 patch 更新', () => {
      store.setState((prev) => ({
        score: prev.score + 50,
        level: prev.level + 1,
      }));

      expect(store.getState().score).toBe(50);
      expect(store.getState().level).toBe(2);
    });

    it('函数 patch 应该接收当前 state 作为参数', () => {
      const fn = jest.fn((prev) => ({ score: prev.score + 100 }));

      store.setState(fn);

      expect(fn).toHaveBeenCalledWith(expect.objectContaining({ score: 0 }));
    });
  });

  // ==================== resetState ====================
  describe('resetState 方法', () => {
    it('应该重置状态为初始值', () => {
      store.setState({ score: 5000, level: 10, mode: 'playing' });
      store.resetState();

      expect(store.getState().score).toBe(0);
      expect(store.getState().level).toBe(1);
      expect(store.getState().mode).toBe('main-menu');
    });

    it('重置后 defaults 不应该被修改', () => {
      const originalDefaultsScore = store.defaults.score;

      store.setState({ score: 5000 });
      store.resetState();

      expect(store.defaults.score).toBe(originalDefaultsScore);
    });

    it('resetState 后所有字段应该恢复初始值', () => {
      store.setMode('playing');
      store.setLevel(10);
      store.setHighScore(5000);
      store.setState({ score: 3000 });
      store.setController('ai'); // 新增：先改为 ai

      store.resetState();

      const state = store.getState();
      expect(state.mode).toBe('main-menu');
      expect(state.level).toBe(1);
      expect(state.highScore).toBe(0);
      expect(state.score).toBe(0);
      expect(state.controller).toBe('human'); // 新增：验证重置为 human
    });
  });

  // ==================== resetBoard ====================
  describe('resetBoard 方法', () => {
    it('应该生成指定行数和列数的空棋盘', () => {
      store.state.board = [['modified']];

      store.resetBoard();

      const board = store.getState().board;
      expect(board).toHaveLength(20);
      board.forEach((row) => {
        expect(row).toHaveLength(10);
        row.forEach((cell) => {
          expect(cell).toBe(0);
        });
      });
    });

    it('应该完全替换旧棋盘', () => {
      const oldBoard = store.getState().board;
      store.resetBoard();

      expect(store.getState().board).not.toBe(oldBoard);
    });
  });

  // ==================== generateBoard ====================
  describe('generateBoard 方法', () => {
    it('easy 难度不应该生成垃圾行', () => {
      store.state.difficulty = 'easy';

      store.generateBoard();

      expect(placeGarbageOnBoard).toHaveBeenCalledWith(
        expect.any(Array),
        0,
        10,
      );
    });

    it('normal 难度应该生成 3 行垃圾', () => {
      store.state.difficulty = 'normal';

      store.generateBoard();

      expect(placeGarbageOnBoard).toHaveBeenCalledWith(
        expect.any(Array),
        3,
        10,
      );
    });

    it('hard 难度应该生成 6 行垃圾', () => {
      store.state.difficulty = 'hard';

      store.generateBoard();

      expect(placeGarbageOnBoard).toHaveBeenCalledWith(
        expect.any(Array),
        6,
        10,
      );
    });

    it('expert 难度应该生成 9 行垃圾', () => {
      store.state.difficulty = 'expert';

      store.generateBoard();

      expect(placeGarbageOnBoard).toHaveBeenCalledWith(
        expect.any(Array),
        9,
        10,
      );
    });

    it('未知难度应该生成 0 行垃圾', () => {
      store.state.difficulty = 'unknown';

      store.generateBoard();

      expect(placeGarbageOnBoard).toHaveBeenCalledWith(
        expect.any(Array),
        0,
        10,
      );
    });

    it('应该返回 board', () => {
      const result = store.generateBoard();

      expect(result).toBe(store.getState().board);
    });
  });

  // ==================== setBeginningBoard / getBeginningBoard ====================
  describe('beginningBoard', () => {
    it('应该深拷贝设置初始棋盘', () => {
      const board = [
        ['#FF0000', ''],
        ['', '#00FF00'],
      ];

      store.setBeginningBoard(board);

      // 修改原始数组
      board[0][0] = 'modified';

      expect(store.getBeginningBoard()[0][0]).toBe('#FF0000');
    });

    it('getBeginningBoard 应该返回深拷贝', () => {
      const board = [['#FF0000']];
      store.setBeginningBoard(board);

      const copy = store.getBeginningBoard();

      // 修改副本不应该影响 store
      copy[0][0] = 'modified';
      expect(store.getState().beginningBoard[0][0]).toBe('#FF0000');
    });

    it('初始 beginningBoard 应该为空数组', () => {
      expect(store.getBeginningBoard()).toEqual([]);
    });
  });

  // ==================== GamepadConnected ====================
  describe('Gamepad 连接状态', () => {
    it('应该设置手柄连接状态', () => {
      store.setGamepadConnected(true);
      expect(store.isGamepadConnected()).toBe(true);

      store.setGamepadConnected(false);
      expect(store.isGamepadConnected()).toBe(false);
    });

    it('初始状态应该为 false', () => {
      expect(store.isGamepadConnected()).toBe(false);
    });
  });

  // ==================== Difficulty ====================
  describe('难度等级', () => {
    it('应该获取和设置难度', () => {
      store.setDifficulty('hard');
      expect(store.getDifficulty()).toBe('hard');
    });

    it('不传参数时应该默认使用 easy', () => {
      store.setDifficulty('hard');
      store.setDifficulty();

      expect(store.getDifficulty()).toBe('easy');
    });
  });

  // ==================== BaseLines ====================
  describe('基础行数', () => {
    it('应该获取和设置 baseLines', () => {
      store.setBaseLines(100);
      expect(store.getBaseLines()).toBe(100);
    });

    it('初始 baseLines 应该为 0', () => {
      expect(store.getBaseLines()).toBe(0);
    });
  });

  // ==================== ClearLines ====================
  describe('消除行', () => {
    it('应该获取和设置 clearLines', () => {
      store.setClearLines([3, 7, 12]);
      expect(store.getClearLines()).toEqual([3, 7, 12]);
    });

    it('初始 clearLines 应该为空数组', () => {
      expect(store.getClearLines()).toEqual([]);
    });
  });

  // ==================== HUD ====================
  describe('HUD 数据', () => {
    it('getHub 应该返回 score, lines, level', () => {
      store.setState({ score: 500, lines: 10, level: 3 });

      const hud = store.getHub();

      expect(hud).toEqual({
        source: undefined,
        lines: 10,
        level: 3,
      });
    });

    it('setHud 应该更新 score, lines, level', () => {
      store.setHud({ score: 1000, lines: 20, level: 5 });

      expect(store.getScore()).toBe(1000);
      expect(store.getState().lines).toBe(20);
      expect(store.getLevel()).toBe(5);
    });
  });

  // ==================== Score ====================
  describe('分数', () => {
    it('应该获取当前分数', () => {
      store.setState({ score: 500 });
      expect(store.getScore()).toBe(500);
    });

    it('初始分数应该为 0', () => {
      expect(store.getScore()).toBe(0);
    });
  });

  // ==================== HighScore ====================
  describe('最高分', () => {
    it('应该获取和设置最高分', () => {
      store.setHighScore(9999);
      expect(store.getHighScore()).toBe(9999);
    });

    it('初始最高分应该为 0', () => {
      expect(store.getHighScore()).toBe(0);
    });
  });

  // ==================== Level ====================
  describe('等级', () => {
    it('应该获取和设置等级', () => {
      store.setLevel(8);
      expect(store.getLevel()).toBe(8);
    });

    it('初始等级应该为 1', () => {
      expect(store.getLevel()).toBe(1);
    });
  });

  // ==================== Mode ====================
  describe('游戏模式', () => {
    it('应该获取和设置模式', () => {
      store.setMode('playing');
      expect(store.getMode()).toBe('playing');

      store.setMode('paused');
      expect(store.getMode()).toBe('paused');
    });

    it('初始模式应该为 main-menu', () => {
      expect(store.getMode()).toBe('main-menu');
    });
  });

  // ==================== 完整性 ====================
  describe('完整性', () => {
    it('多次 setState 应该正确累计', () => {
      store.setState({ score: 100 });
      store.setState((prev) => ({ score: prev.score + 50, level: 3 }));
      store.setState({ mode: 'playing' });

      expect(store.getState().score).toBe(150);
      expect(store.getState().level).toBe(3);
      expect(store.getState().mode).toBe('playing');
    });

    it('resetState 后所有字段应该恢复初始值', () => {
      store.setMode('playing');
      store.setLevel(10);
      store.setHighScore(5000);
      store.setState({ score: 3000 });

      store.resetState();

      const state = store.getState();
      expect(state.mode).toBe('main-menu');
      expect(state.level).toBe(1);
      expect(state.highScore).toBe(0);
      expect(state.score).toBe(0);
    });
  });

  // ==================== Controller ====================
  describe('控制者身份', () => {
    it('初始控制者应该为 human', () => {
      expect(store.getController()).toBe('human');
    });

    it('应该获取和设置控制者身份', () => {
      store.setController('ai');
      expect(store.getController()).toBe('ai');

      store.setController('human');
      expect(store.getController()).toBe('human');
    });

    it('resetState 应该重置控制者为 human', () => {
      store.setController('ai');
      store.resetState();

      expect(store.getController()).toBe('human');
    });

    it('getState 返回的 state 应该包含 controller 字段', () => {
      store.setController('ai');

      const state = store.getState();
      expect(state.controller).toBe('ai');
    });
  });
});
