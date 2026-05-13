import placeGarbageOnBoard from '@/lib/state/utils/place-garbage-on-board.js';
import generateGarbageRows from '@/lib/state/utils/generate-garbage-rows.js';

// Mock generateGarbageRows
jest.mock('@/lib/state/utils/generate-garbage-rows.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('placeGarbageOnBoard', () => {
  let board;
  const cols = 10;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建一个 20 行 × 10 列的空棋盘
    board = Array.from({ length: 20 }, () => Array.from({ length: cols }, () => ''));
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该调用 generateGarbageRows 生成垃圾行', () => {
      generateGarbageRows.mockReturnValue([
        ['#FF0000', '', '', '#00FF00', '', '', '', '', '', ''],
      ]);

      placeGarbageOnBoard(board, 1, cols);

      expect(generateGarbageRows).toHaveBeenCalledWith(1, cols);
    });

    it('应该将垃圾行写入棋盘底部', () => {
      const garbageRow = ['#FF0000', '', '', '#00FF00', '', '', '', '', '', ''];
      generateGarbageRows.mockReturnValue([garbageRow]);

      placeGarbageOnBoard(board, 1, cols);

      // 最后一行（索引 19）应该等于垃圾行
      expect(board[19]).toEqual(garbageRow);
    });

    it('多行垃圾时应该从底部往上放置', () => {
      const garbageRows = [
        ['#FF0000', '', '', '', '', '', '', '', '', ''],
        ['#00FF00', '', '', '', '', '', '', '', '', ''],
        ['#0000FF', '', '', '', '', '', '', '', '', ''],
      ];
      generateGarbageRows.mockReturnValue(garbageRows);

      placeGarbageOnBoard(board, 3, cols);

      // 底部 3 行应该是垃圾行
      expect(board[17]).toEqual(garbageRows[0]);
      expect(board[18]).toEqual(garbageRows[1]);
      expect(board[19]).toEqual(garbageRows[2]);
    });

    it('垃圾行应该是 board 行的副本而不是引用', () => {
      const garbageRow = ['#FF0000', '', '', '', '', '', '', '', '', ''];
      generateGarbageRows.mockReturnValue([garbageRow]);

      placeGarbageOnBoard(board, 1, cols);

      // 修改原始 garbageRow 不应该影响 board
      garbageRow[0] = '#000000';
      expect(board[19][0]).toBe('#FF0000');
    });
  });

  // ==================== 垃圾行数量为零或负数 ====================
  describe('垃圾行数量为零或负数', () => {
    it('garbageRowCount 为 0 时不应该修改棋盘', () => {
      const boardCopy = board.map((row) => [...row]);

      placeGarbageOnBoard(board, 0, cols);

      expect(board).toEqual(boardCopy);
      expect(generateGarbageRows).not.toHaveBeenCalled();
    });

    it('garbageRowCount 为负数时不应该修改棋盘', () => {
      const boardCopy = board.map((row) => [...row]);

      placeGarbageOnBoard(board, -5, cols);

      expect(board).toEqual(boardCopy);
      expect(generateGarbageRows).not.toHaveBeenCalled();
    });
  });

  // ==================== 垃圾行超出棋盘范围 ====================
  describe('垃圾行超出棋盘范围', () => {
    it('垃圾行数量大于棋盘行数时应该处理越界', () => {
      const garbageRows = Array.from({ length: 30 }, (_, i) =>
        Array.from({ length: cols }, () => `color-${i}`),
      );
      generateGarbageRows.mockReturnValue(garbageRows);

      // 不应该抛出错误
      expect(() => {
        placeGarbageOnBoard(board, 30, cols);
      }).not.toThrow();
    });

    it('垃圾行部分超出时应该只写入有效范围内的行', () => {
      // startRow = 20 - 25 = -5
      // 只有 garbageRows[5] 到 garbageRows[24] 在范围内
      const garbageRows = Array.from({ length: 25 }, (_, i) =>
        Array.from({ length: cols }, () => `row-${i}`),
      );
      generateGarbageRows.mockReturnValue(garbageRows);

      placeGarbageOnBoard(board, 25, cols);

      // 验证从 board[0] 开始有数据
      expect(board[0]).toEqual(garbageRows[5]);
      expect(board[19]).toEqual(garbageRows[24]);
    });
  });

  // ==================== 垃圾行覆盖已有数据 ====================
  describe('垃圾行覆盖已有数据', () => {
    it('应该覆盖已有的棋盘数据', () => {
      // 先在底部放一些数据
      board[19] = Array.from({ length: cols }, () => 'old-data');

      const garbageRow = Array.from({ length: cols }, () => 'new-data');
      generateGarbageRows.mockReturnValue([garbageRow]);

      placeGarbageOnBoard(board, 1, cols);

      expect(board[19]).toEqual(garbageRow);
    });

    it('不应该影响未被覆盖的行', () => {
      // 在顶部放一些数据
      board[0] = Array.from({ length: cols }, () => 'top-data');

      const garbageRow = Array.from({ length: cols }, () => 'garbage');
      generateGarbageRows.mockReturnValue([garbageRow]);

      placeGarbageOnBoard(board, 1, cols);

      // 顶部数据保持不变
      expect(board[0]).toEqual(Array.from({ length: cols }, () => 'top-data'));
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('棋盘为空数组时不应崩溃', () => {
      const emptyBoard = [];

      placeGarbageOnBoard(emptyBoard, 1, cols);

      // 不应该调用 generateGarbageRows（rows = 0，startRow 为负）
      expect(generateGarbageRows).toHaveBeenCalled();
    });

    it('棋盘只有一行时应该正确放置', () => {
      const singleRowBoard = [Array.from({ length: cols }, () => '')];
      const garbageRow = Array.from({ length: cols }, () => '#FF0000');
      generateGarbageRows.mockReturnValue([garbageRow]);

      placeGarbageOnBoard(singleRowBoard, 1, cols);

      // startRow = 1 - 1 = 0，在范围内
      expect(singleRowBoard[0]).toEqual(garbageRow);
    });

    it('cols 为 0 时应该生成空行', () => {
      generateGarbageRows.mockReturnValue([[]]);

      placeGarbageOnBoard(board, 1, 0);

      expect(generateGarbageRows).toHaveBeenCalledWith(1, 0);
    });

    it('垃圾行刚好填满整个棋盘', () => {
      const garbageRows = Array.from({ length: 20 }, (_, i) =>
        Array.from({ length: cols }, () => `row-${i}`),
      );
      generateGarbageRows.mockReturnValue(garbageRows);

      placeGarbageOnBoard(board, 20, cols);

      // 所有行都应该被覆盖
      for (let i = 0; i < 20; i++) {
        expect(board[i]).toEqual(garbageRows[i]);
      }
    });
  });

  // ==================== 直接修改验证 ====================
  describe('直接修改验证', () => {
    it('应该直接修改传入的 board 数组', () => {
      const garbageRow = ['#FF0000', '', '', '', '', '', '', '', '', ''];
      generateGarbageRows.mockReturnValue([garbageRow]);

      const result = placeGarbageOnBoard(board, 1, cols);

      // 函数不返回值
      expect(result).toBeUndefined();
      // board 本身被修改
      expect(board[19]).toEqual(garbageRow);
    });

    it('多次调用应该正确叠加', () => {
      const garbageRow1 = Array.from({ length: cols }, () => 'first');
      const garbageRow2 = Array.from({ length: cols }, () => 'second');

      generateGarbageRows.mockReturnValueOnce([garbageRow1]);
      placeGarbageOnBoard(board, 1, cols);

      generateGarbageRows.mockReturnValueOnce([garbageRow2]);
      placeGarbageOnBoard(board, 1, cols);

      // 最后一次调用覆盖了同一个位置
      expect(board[19]).toEqual(garbageRow2);
    });
  });
});
