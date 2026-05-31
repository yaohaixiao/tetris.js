import countTSpinSlots from '@/lib/ai/utils/count-t-spin-slots.js';

describe('countTSpinSlots', () => {
  const createBoard = () =>
    Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => 0));

  // ==================== 无槽位 ====================
  describe('无槽位', () => {
    it('空棋盘应该返回 0', () => {
      const board = createBoard();

      expect(countTSpinSlots(board)).toBe(0);
    });

    it('平坦表面不应检测为 T 型槽', () => {
      const board = createBoard();
      // 铺满底部一行
      board[19] = Array(10).fill(1);

      expect(countTSpinSlots(board)).toBe(0);
    });

    it('中间有空格但不满足 T 型条件', () => {
      const board = createBoard();
      board[19][4] = 1;
      board[19][5] = 0;
      board[19][6] = 1;

      // 下方没有支撑，不算
      expect(countTSpinSlots(board)).toBe(0);
    });
  });

  // ==================== 单个 T-Spin 槽位 ====================
  describe('单个 T-Spin 槽位', () => {
    it('标准 T 型凹槽应该被检测到', () => {
      const board = createBoard();
      // 底部支撑
      board[18][3] = 1;
      board[18][4] = 1;
      board[18][5] = 1;
      // 左右方块
      board[17][3] = 1;
      board[17][5] = 1;
      // 中间为空 board[17][4] = 0

      // y=17,x=4: 中间空、下方有支撑、左右有方块
      expect(countTSpinSlots(board)).toBe(1);
    });

    it('T 型凹槽在棋盘底部（y=17,x=4）', () => {
      const board = createBoard();
      // 底部支撑（y+1=18，需要 board[18] 有支撑）
      board[18][3] = 1;
      board[18][4] = 1;
      board[18][5] = 1;
      // 左右方块（y=17）
      board[17][3] = 1;
      board[17][5] = 1;
      // 中间为空

      expect(countTSpinSlots(board)).toBe(1);
    });
  });

  // ==================== 多个 T-Spin 槽位 ====================
  describe('多个 T-Spin 槽位', () => {
    it('两个独立凹槽应该都检测到', () => {
      const board = createBoard();

      // 第一个 T 型凹槽在 y=17,x=3
      board[18][2] = 1;
      board[18][3] = 1;
      board[18][4] = 1;
      board[17][2] = 1;
      board[17][4] = 1;

      // 第二个 T 型凹槽在 y=17,x=7
      board[18][6] = 1;
      board[18][7] = 1;
      board[18][8] = 1;
      board[17][6] = 1;
      board[17][8] = 1;

      expect(countTSpinSlots(board)).toBe(2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('最左列不应被检测（x=0 无左侧方块）', () => {
      const board = createBoard();
      board[19][0] = 1;
      board[19][1] = 1;
      board[18][1] = 1;

      // x=0 在最左边，循环从 x=1 开始，不会检测
      expect(countTSpinSlots(board)).toBe(0);
    });

    it('最右列不应被检测（x=9 无右侧方块）', () => {
      const board = createBoard();
      board[19][8] = 1;
      board[19][9] = 1;
      board[18][8] = 1;

      // x=9 在最右边，循环到 x < cols-1，不会检测
      expect(countTSpinSlots(board)).toBe(0);
    });

    it('顶部不应检测（y=0 无上方）', () => {
      const board = createBoard();
      board[1][3] = 1;
      board[1][4] = 1;
      board[1][5] = 1;
      board[0][3] = 1;
      board[0][5] = 1;

      // y=0 在最顶部，循环从 y=1 开始，不会检测
      expect(countTSpinSlots(board)).toBe(0);
    });

    it('下方无支撑不应算作 T 型槽', () => {
      const board = createBoard();
      board[17][3] = 1;
      board[17][5] = 1;
      // board[18][4] = 0 无支撑

      expect(countTSpinSlots(board)).toBe(0);
    });

    it('只有一侧有方块不应算作 T 型槽', () => {
      const board = createBoard();
      board[18][3] = 1;
      board[18][4] = 1;
      board[18][5] = 1;
      board[17][5] = 1;
      // board[17][3] = 0 左侧空

      expect(countTSpinSlots(board)).toBe(0);
    });

    it('中间有方块不应算作 T 型槽', () => {
      const board = createBoard();
      board[18][3] = 1;
      board[18][4] = 1;
      board[18][5] = 1;
      board[17][3] = 1;
      board[17][4] = 1; // 中间被占
      board[17][5] = 1;

      expect(countTSpinSlots(board)).toBe(0);
    });
  });

  // ==================== 模拟真实场景 ====================
  describe('模拟真实场景', () => {
    it('T-Spin Double 设置中的槽位', () => {
      const board = createBoard();
      for (let x = 0; x < 10; x++) {
        board[19][x] = 1;
      }
      board[18][0] = 1;
      board[18][1] = 1;
      board[18][2] = 1;
      board[18][3] = 1;
      board[18][4] = 1;
      board[18][5] = 1;
      board[18][6] = 1;
      board[18][7] = 1;
      board[18][8] = 1;
      board[18][9] = 1;
      // T 型凹槽在 y=17,x=4（board[18][4] 作支撑）
      board[17][3] = 1;
      board[17][5] = 1;
      // board[17][4] = 0（中间空）

      expect(countTSpinSlots(board)).toBe(1);
    });
  });
});
