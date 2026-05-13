import collision from '@/lib/game/logic/collision.js';

describe('collision', () => {
  let mockContext;
  let mockStore;
  let baseState;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建 20行 × 10列 的空棋盘
    const emptyBoard = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    );

    baseState = {
      curr: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FFA500',
      },
      cx: 4,  // 方块左上角 X 坐标
      cy: 0,  // 方块左上角 Y 坐标
      board: emptyBoard,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(baseState),
    };

    mockContext = {
      Store: mockStore,
      options: {
        Elements: {
          Main: {
            rows: 20,
            cols: 10,
          },
        },
      },
    };
  });

  // ==================== 无碰撞情况 ====================
  describe('无碰撞情况', () => {
    it('方块在棋盘内部时应该返回 false', () => {
      const result = collision(mockContext, 0, 0);

      expect(result).toBe(false);
    });

    it('方块在安全范围内移动时应该返回 false', () => {
      const result = collision(mockContext, 1, 0);

      expect(result).toBe(false);
    });

    it('方块可以正常下落时应该返回 false', () => {
      const result = collision(mockContext, 0, 1);

      expect(result).toBe(false);
    });
  });

  // ==================== 边界碰撞 ====================
  describe('边界碰撞', () => {
    it('方块移出左边界时应该返回 true', () => {
      // cx = 4，ox = -5 → nx = -1，超出左边界
      const result = collision(mockContext, -5, 0);

      expect(result).toBe(true);
    });

    it('方块移出右边界时应该返回 true', () => {
      // cx = 4，方块宽 2，ox = 5 → nx = 9，nx + 1 = 10 = cols，超出右边界
      const result = collision(mockContext, 5, 0);

      expect(result).toBe(true);
    });

    it('方块掉落出底部时应该返回 true', () => {
      // cy = 18，方块高 2，oy = 1 → ny = 19，ny + 1 = 20 = rows，超出底部
      baseState.cy = 18;

      const result = collision(mockContext, 0, 1);

      expect(result).toBe(true);
    });

    it('方块刚好在边界内时应该返回 false', () => {
      // cx = 0，ox = 0 → nx = 0，刚好在左边界
      baseState.cx = 0;

      const result = collision(mockContext, 0, 0);

      expect(result).toBe(false);
    });

    it('方块刚好在右边界内时应该返回 false', () => {
      // cx = 8，方块宽 2，nx = 8 ~ 9，刚好在右边界内
      baseState.cx = 8;

      const result = collision(mockContext, 0, 0);

      expect(result).toBe(false);
    });
  });

  // ==================== 方块重叠碰撞 ====================
  describe('方块重叠碰撞', () => {
    it('与已有方块重叠时应该返回 true', () => {
      // 在棋盘上放置一个方块
      baseState.board[3][5] = '#FF0000';

      // 偏移后方块会占据 board[3][5]
      const result = collision(mockContext, 1, 3);

      expect(result).toBe(true);
    });

    it('没有重叠时应该返回 false', () => {
      // 在棋盘上放置方块，但偏移后不重叠
      baseState.board[3][5] = '#FF0000';

      // 偏移到其他位置
      const result = collision(mockContext, 3, 3);

      expect(result).toBe(false);
    });

    it('ny < 0 时不应该访问 board[-1]', () => {
      baseState.cy = 0;

      // ny = 0 + 0 + (-1) = -1，此时不应读取 board[-1]
      const result = collision(mockContext, 0, -1);

      // 没有越出左右边界，ny < 0 不检查碰撞，应返回 false
      expect(result).toBe(false);
    });
  });

  // ==================== 当前方块为 null ====================
  describe('当前方块为 null', () => {
    it('curr 为 null 时应该返回 false', () => {
      baseState.curr = null;

      const result = collision(mockContext, 0, 0);

      expect(result).toBe(false);
    });

    it('curr 为 null 时不应该遍历 shape', () => {
      baseState.curr = null;

      expect(() => {
        collision(mockContext, 0, 0);
      }).not.toThrow();
    });
  });

  // ==================== 不同形状方块 ====================
  describe('不同形状方块', () => {
    it('I 型方块（1×4）碰撞检测', () => {
      baseState.curr = {
        shape: [[1, 1, 1, 1]],
        color: '#008080',
      };
      baseState.cx = 7;
      baseState.cy = 0;

      // 向右移 1 格，第四个格子会超出右边界（7 + 3 + 1 = 11 >= 10）
      const result = collision(mockContext, 1, 0);

      expect(result).toBe(true);
    });

    it('T 型方块碰撞检测', () => {
      baseState.curr = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: '#FFFF00',
      };
      baseState.cx = 4;
      baseState.cy = 19;

      // T 型方块高 2 行，cy = 19 时第二行 ny = 20 = rows，出界
      const result = collision(mockContext, 0, 0);

      expect(result).toBe(true);
    });

    it('方块中值为 0 的格子不应该触发碰撞', () => {
      baseState.curr = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: '#FFFF00',
      };
      baseState.cx = 0;
      baseState.cy = 0;

      // 即使 cx=0 靠近左边界，(0,0) 位置 shape[0][0]=0，不应该触发碰撞
      const result = collision(mockContext, 0, 0);

      expect(result).toBe(false);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('ox 和 oy 为 0 时应该正常检测', () => {
      const result = collision(mockContext, 0, 0);

      expect(typeof result).toBe('boolean');
    });

    it('ox 为负数时应该正常检测', () => {
      const result = collision(mockContext, -2, 0);

      expect(typeof result).toBe('boolean');
    });

    it('oy 为负数时应该正常检测', () => {
      const result = collision(mockContext, 0, -2);

      expect(typeof result).toBe('boolean');
    });

    it('棋盘底部有方块时下落应检测碰撞', () => {
      // 在底部放一行方块
      baseState.board[19] = Array.from({ length: 10 }, () => '#FF0000');
      baseState.cy = 17;

      // 方块高 2 行，oy=1 时 ny=18，第二行 ny=19 和已有方块重叠
      const result = collision(mockContext, 0, 1);

      expect(result).toBe(true);
    });
  });
});
