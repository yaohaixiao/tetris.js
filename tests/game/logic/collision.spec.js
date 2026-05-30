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
      cx: 4,
      cy: 0,
      board: emptyBoard,
    };

    mockStore = {
      getState: jest.fn().mockReturnValue(baseState),
    };

    mockContext = {
      Store: mockStore,
      Elements: {
        Canvas: {
          rows: 20,
          cols: 10,
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
      // cx=4, ox=-5 → nx=4+0+(-5)=-1 < 0 → 碰撞
      const result = collision(mockContext, -5, 0);

      expect(result).toBe(true);
    });

    it('方块移出右边界时应该返回 true', () => {
      // cx=4, 方块宽2, ox=5 → nx=4+1+5=10 >= 10 → 碰撞
      const result = collision(mockContext, 5, 0);

      expect(result).toBe(true);
    });

    it('方块掉落出底部时应该返回 true', () => {
      baseState.cy = 18;
      // cy=18, 方块高2, oy=1 → ny=18+1+1=20 >= 20 → 碰撞
      const result = collision(mockContext, 0, 1);

      expect(result).toBe(true);
    });

    it('方块刚好在边界内时应该返回 false', () => {
      baseState.cx = 0;
      // cx=0, ox=0 → nx=0 >= 0 → 未出界
      const result = collision(mockContext, 0, 0);

      expect(result).toBe(false);
    });

    it('方块刚好在右边界内时应该返回 false', () => {
      baseState.cx = 8;
      // cx=8, 方块宽2 → nx 最大=9 < 10 → 未出界
      const result = collision(mockContext, 0, 0);

      expect(result).toBe(false);
    });
  });

  // ==================== 方块重叠碰撞 ====================
  describe('方块重叠碰撞', () => {
    it('与已有方块重叠时应该返回 true', () => {
      baseState.board[3][5] = '#FF0000';

      // ox=1, oy=3 → 方块 shape[1][1]=1 时 ny=0+1+3=4, nx=4+1+1=6
      // 实际重叠位置需要精确计算：
      // shape[0][0]=1 → ny=3, nx=5 → board[3][5] 有方块 → 碰撞
      const result = collision(mockContext, 1, 3);

      expect(result).toBe(true);
    });

    it('没有重叠时应该返回 false', () => {
      baseState.board[3][5] = '#FF0000';

      // ox=3, oy=3 → shape[0][0]: ny=3, nx=7 → board[3][7]=0 → 无碰撞
      const result = collision(mockContext, 3, 3);

      expect(result).toBe(false);
    });

    it('ny < 0 时不检查重叠（只检查边界）', () => {
      baseState.cy = 0;

      // oy=-1 → ny=-1 < 0，hitBlock 条件 ny >= 0 为 false
      // outOfBounds: nx=4 >= 0 < 10 → false
      // 无碰撞
      const result = collision(mockContext, 0, -1);

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

      // ox=1 → nx=7+3+1=11 >= 10 → 出右边界
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
      baseState.cy = 19;

      // cy=19, 方块高2, oy=0 → ny=19+1+0=20 >= 20 → 出底部
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

      // shape[0][0]=0 跳过检查，shape[1][0]=1 时 nx=0, ny=1 在界内 → false
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
      baseState.board[19] = Array.from({ length: 10 }, () => '#FF0000');
      baseState.cy = 17;

      // oy=1 → shape[0][0]: ny=18, shape[1][0]: ny=19
      // ny=19 时 board[19][4] 有方块 → 碰撞
      const result = collision(mockContext, 0, 1);

      expect(result).toBe(true);
    });
  });
});
