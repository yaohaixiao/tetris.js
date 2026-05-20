import collision from '@/lib/ai/utils/collision.js';

describe('collision', () => {
  // 创建一个标准的 20x10 空棋盘
  const createBoard = () =>
    Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => 0));

  // 标准的 T 型方块形状
  const T_SHAPE = [
    [0, 1, 0],
    [1, 1, 1],
  ];

  // I 型方块形状
  const I_SHAPE = [[1, 1, 1, 1]];

  // O 型方块形状
  const O_SHAPE = [
    [1, 1],
    [1, 1],
  ];

  // ==================== 无碰撞场景 ====================
  describe('无碰撞', () => {
    it('空棋盘中央放置方块应该无碰撞', () => {
      const board = createBoard();

      expect(collision(board, T_SHAPE, 3, 10)).toBe(false);
    });

    it('方块紧贴底部应该无碰撞', () => {
      const board = createBoard();
      // T_SHAPE 高度为 2，放在 y=18 时底部在 19，刚好在棋盘内
      expect(collision(board, T_SHAPE, 0, 18)).toBe(false);
    });

    it('方块紧贴右边界应该无碰撞', () => {
      const board = createBoard();
      // T_SHAPE 宽度为 3，放在 x=7 时最右在 9，刚好在棋盘内
      expect(collision(board, T_SHAPE, 7, 0)).toBe(false);
    });

    it('方块紧贴左边界应该无碰撞', () => {
      const board = createBoard();

      expect(collision(board, T_SHAPE, 0, 0)).toBe(false);
    });

    it('方块在已有方块上方但未接触应该无碰撞', () => {
      const board = createBoard();
      board[19][3] = 1; // 底部有一个方块

      // T_SHAPE 放在 y=17 时，底部在 18，与 board[19] 不接触
      expect(collision(board, T_SHAPE, 2, 17)).toBe(false);
    });
  });

  // ==================== 边界碰撞 ====================
  describe('边界碰撞', () => {
    it('方块超出左边界应该碰撞', () => {
      const board = createBoard();

      expect(collision(board, T_SHAPE, -1, 0)).toBe(true);
    });

    it('方块超出右边界应该碰撞', () => {
      const board = createBoard();
      // T_SHAPE 宽度为 3，放在 x=8 时最右在 10，超出列数
      expect(collision(board, T_SHAPE, 8, 0)).toBe(true);
    });

    it('方块超出底部应该碰撞', () => {
      const board = createBoard();
      // T_SHAPE 高度为 2，放在 y=19 时底部在 20，超出棋盘
      expect(collision(board, T_SHAPE, 0, 19)).toBe(true);
    });

    it('I 型方块超出右边界应该碰撞', () => {
      const board = createBoard();
      // I_SHAPE 宽度为 4，放在 x=7 时最右在 10，超出
      expect(collision(board, I_SHAPE, 7, 0)).toBe(true);
    });

    it('方块部分在顶部上方不算碰撞', () => {
      const board = createBoard();
      // T_SHAPE 放在 y=-1 时，顶部一行在棋盘外，但底部一行在 y=0
      // by >= 0 的检查确保不会访问负数索引
      expect(collision(board, T_SHAPE, 0, -1)).toBe(false);
    });
  });

  // ==================== 方块碰撞 ====================
  describe('方块碰撞', () => {
    it('方块与已有方块重叠应该碰撞', () => {
      const board = createBoard();
      board[10][3] = 1; // 在目标位置放一个方块

      // T_SHAPE 放在 (2, 9)，它的 [1][1] 格子会落在 (3, 10)
      expect(collision(board, T_SHAPE, 2, 9)).toBe(true);
    });

    it('方块底部接触到已有方块应该碰撞', () => {
      const board = createBoard();
      board[12][4] = 1; // 在 y=12 处有方块

      // T_SHAPE 高度为 2，放在 y=11 时底部在 y=12，会碰撞
      expect(collision(board, T_SHAPE, 3, 11)).toBe(true);
    });

    it('方块侧面接触到已有方块应该碰撞', () => {
      const board = createBoard();
      board[5][3] = 1;

      // T_SHAPE 放在 (3, 5)，它的 [0][0] 如果是 1 会落在 (3, 5)
      // 但 T_SHAPE 的 [0][0] 是 0，所以换个形状测试
      // 用 O_SHAPE 测试侧面碰撞
      expect(collision(board, O_SHAPE, 3, 5)).toBe(true);
    });

    it('多个已有方块时应该正确检测碰撞', () => {
      const board = createBoard();
      board[8][5] = 1;
      board[8][6] = 1;
      board[9][5] = 1;
      board[9][6] = 1;

      // O_SHAPE 放在 (4, 7)，会与上方方块重叠
      expect(collision(board, O_SHAPE, 4, 7)).toBe(true);
    });

    it('方块与底部方块之间有空隙应该无碰撞', () => {
      const board = createBoard();
      board[19][0] = 1; // 最底部有方块

      // T_SHAPE 放在 y=16，底部在 y=17，与 y=19 有空隙
      expect(collision(board, T_SHAPE, 0, 16)).toBe(false);
    });
  });

  // ==================== 形状边界 ====================
  describe('形状边界', () => {
    it('形状中空单元格不参与碰撞检测', () => {
      const board = createBoard();
      // 在 T_SHAPE 的空单元格位置放置方块
      board[10][2] = 1; // T_SHAPE[0][0] 是 0，这个位置不应该碰撞

      expect(collision(board, T_SHAPE, 2, 10)).toBe(false);
    });

    it('形状中实心单元格在边界外应该碰撞', () => {
      const board = createBoard();
      // O_SHAPE 放在 x=9 时，第二列在 x=10，超出边界
      expect(collision(board, O_SHAPE, 9, 0)).toBe(true);
    });

    it('空形状（全零）应该无碰撞', () => {
      const board = createBoard();
      const emptyShape = [
        [0, 0],
        [0, 0],
      ];

      expect(collision(board, emptyShape, 0, 0)).toBe(false);
    });

    it('单格方块在边界处', () => {
      const board = createBoard();
      const singleBlock = [[1]];

      // 刚好在边界内
      expect(collision(board, singleBlock, 9, 19)).toBe(false);

      // 超出右边界
      expect(collision(board, singleBlock, 10, 0)).toBe(true);

      // 超出底部
      expect(collision(board, singleBlock, 0, 20)).toBe(true);
    });
  });

  // ==================== 棋盘状态 ====================
  describe('棋盘状态', () => {
    it('棋盘已有方块密集分布时应该正确检测', () => {
      const board = createBoard();
      // 填满底部 3 行
      for (let y = 17; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          board[y][x] = 1;
        }
      }

      // 在填满区域上方放置应该无碰撞
      expect(collision(board, T_SHAPE, 3, 15)).toBe(false);

      // 放在填满区域上应该碰撞
      expect(collision(board, T_SHAPE, 3, 16)).toBe(true);
    });

    it('棋盘有零星方块时应该正确检测', () => {
      const board = createBoard();
      board[5][5] = 1;
      board[10][2] = 1;
      board[15][8] = 1;

      // 不重叠的位置
      expect(collision(board, T_SHAPE, 0, 0)).toBe(false);
      expect(collision(board, T_SHAPE, 6, 12)).toBe(false);

      // 重叠的位置
      expect(collision(board, T_SHAPE, 4, 4)).toBe(true);
    });

    it('棋盘列数为 0 的边界情况', () => {
      const board = Array.from({ length: 20 }, () => []);

      // 任何 x >= 0 都会超出列数
      expect(collision(board, T_SHAPE, 0, 0)).toBe(true);
    });
  });
});
