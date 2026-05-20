import createSandboxGame from '@/lib/ai/sandbox/create-sandbox-game.js';

describe('createSandboxGame', () => {
  const createSnapshot = () => ({
    controller: 'ai',
    board: Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    ),
    level: 1,
    score: 0,
    lines: 0,
    cur: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: '#00c8ff',
    },
    next: null,
    piece: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      position: { x: 3, y: 0 },
    },
    mode: 'playing',
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该返回一个包含 Store 属性的对象', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);

      expect(sandbox).toHaveProperty('Store');
    });

    it('Store 应该包含 getState 和 setState 方法', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);

      expect(typeof sandbox.Store.getState).toBe('function');
      expect(typeof sandbox.Store.setState).toBe('function');
    });

    it('getState 应该返回与快照相同的数据', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);
      const state = sandbox.Store.getState();

      expect(state.board).toEqual(snapshot.board);
      expect(state.score).toBe(snapshot.score);
      expect(state.level).toBe(snapshot.level);
      expect(state.mode).toBe(snapshot.mode);
    });
  });

  // ==================== 状态隔离 ====================
  describe('状态隔离', () => {
    it('修改沙箱状态不应影响原始快照', () => {
      const snapshot = createSnapshot();
      const originalScore = snapshot.score;
      const sandbox = createSandboxGame(snapshot);

      sandbox.Store.setState({ score: 999 });

      expect(sandbox.Store.getState().score).toBe(999);
      expect(snapshot.score).toBe(originalScore);
    });

    it('修改沙箱棋盘不应影响原始快照', () => {
      const snapshot = createSnapshot();
      const originalBoard = snapshot.board.map((row) => [...row]);
      const sandbox = createSandboxGame(snapshot);

      sandbox.Store.getState().board[0][0] = 99;

      expect(snapshot.board).toEqual(originalBoard);
    });

    it('多个沙箱应该相互独立', () => {
      const snapshot = createSnapshot();
      const sandbox1 = createSandboxGame(snapshot);
      const sandbox2 = createSandboxGame(snapshot);

      sandbox1.Store.setState({ score: 100 });
      sandbox2.Store.setState({ score: 200 });

      expect(sandbox1.Store.getState().score).toBe(100);
      expect(sandbox2.Store.getState().score).toBe(200);
    });
  });

  // ==================== setState 行为 ====================
  describe('setState 行为', () => {
    it('setState 应该合并更新状态（浅合并）', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);

      sandbox.Store.setState({ score: 500 });

      const state = sandbox.Store.getState();
      expect(state.score).toBe(500);
      // 其他字段应保持不变
      expect(state.level).toBe(1);
      expect(state.mode).toBe('playing');
    });

    it('setState 应该支持同时更新多个字段', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);

      sandbox.Store.setState({ score: 500, level: 3, lines: 10 });

      const state = sandbox.Store.getState();
      expect(state.score).toBe(500);
      expect(state.level).toBe(3);
      expect(state.lines).toBe(10);
    });

    it('setState 应该支持更新棋盘', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);
      const newBoard = Array.from({ length: 20 }, () => Array(10).fill(1));

      sandbox.Store.setState({ board: newBoard });

      expect(sandbox.Store.getState().board).toEqual(newBoard);
    });
  });

  // ==================== getState 行为 ====================
  describe('getState 行为', () => {
    it('getState 应该返回内部状态引用', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);

      const state1 = sandbox.Store.getState();
      const state2 = sandbox.Store.getState();

      expect(state1).toBe(state2);
    });

    it('通过 getState 修改状态应该反映在后续 getState 中', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);

      sandbox.Store.getState().score = 777;

      expect(sandbox.Store.getState().score).toBe(777);
    });
  });

  // ==================== 数据完整性 ====================
  describe('数据完整性', () => {
    it('应该保留快照中的所有字段', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);
      const state = sandbox.Store.getState();

      expect(state).toHaveProperty('controller');
      expect(state).toHaveProperty('board');
      expect(state).toHaveProperty('level');
      expect(state).toHaveProperty('score');
      expect(state).toHaveProperty('lines');
      expect(state).toHaveProperty('cur');
      expect(state).toHaveProperty('next');
      expect(state).toHaveProperty('piece');
      expect(state).toHaveProperty('mode');
    });

    it('嵌套对象应该被正确保留', () => {
      const snapshot = createSnapshot();
      const sandbox = createSandboxGame(snapshot);
      const state = sandbox.Store.getState();

      expect(state.piece).toHaveProperty('shape');
      expect(state.piece).toHaveProperty('position');
      expect(state.piece.position).toHaveProperty('x');
      expect(state.piece.position).toHaveProperty('y');
    });
  });
});
