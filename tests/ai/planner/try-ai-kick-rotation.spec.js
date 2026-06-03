/**
 * TryAiKickRotation 单元测试 (Jest)
 *
 * 测试覆盖：
 *
 * 1. 开阔场地原位旋转成功（测试0生效）
 * 2. 原位碰撞但偏移1成功（墙踢生效）
 * 3. 所有偏移都失败返回 null
 * 4. O 块无墙踢返回 null
 * 5. KickTable 缺失时的兜底逻辑
 * 6. 旋转后返回正确的 newRotation 和坐标
 * 7. 偏移测试按顺序执行（碰到第一个有效即停止）
 */

import tryAiKickRotation from '@/lib/ai/planner/try-ai-kick-rotation.js';

/* Mock 依赖 */
jest.mock('@/lib/ai/utils/collision.js');
jest.mock('@/lib/game/logic/rotate/get-kick-data.js');
jest.mock('@/lib/ai/utils/get-shape-by-rotation.js');

import collision from '@/lib/ai/utils/collision.js';
import getKickData from '@/lib/game/logic/rotate/get-kick-data.js';
import getShapeByRotation from '@/lib/ai/utils/get-shape-by-rotation.js';

/* 辅助：创建一个标准的方块对象 */
const makePiece = (overrides = {}) => ({
  type: 'T',
  cx: 5,
  cy: 10,
  rotationState: 0,
  ...overrides,
});

/* 辅助：创建一个简单的棋盘 */
const makeBoard = () => {
  const board = Array.from({ length: 20 }, () => Array(10).fill(0));
  return board;
};

/* 辅助：标准 JLSTZ 墙踢数据 (0 -> 1 顺时针) */
const STANDARD_KICK_0_TO_1 = [
  [0, 0],
  [-1, 0],
  [-1, 1],
  [0, -2],
  [-1, -2],
];

/* 模拟旋转后的形状（单测不关心具体形状内容） */
const MOCK_ROTATED_SHAPE = [
  [0, 1, 0],
  [0, 1, 1],
  [0, 1, 0],
];

describe('tryAiKickRotation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    /* 默认：getShapeByRotation 返回一个固定形状 */
    getShapeByRotation.mockReturnValue(MOCK_ROTATED_SHAPE);
  });

  /* ==================== 基础功能 ==================== */

  describe('基础旋转', () => {
    test('开阔场地原位旋转成功，返回新位置和旋转状态', () => {
      const board = makeBoard();
      const piece = makePiece({ type: 'T', cx: 5, cy: 10, rotationState: 0 });

      /* collision 返回 false 表示不碰撞 */
      collision.mockReturnValue(false);
      /* 提供标准墙踢数据 */
      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      const result = tryAiKickRotation(board, piece);

      expect(result).not.toBeNull();
      expect(result.success).toBe(true);
      expect(result.newRotation).toBe(1);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
    });

    test('计算正确的目标旋转状态 0 -> 1', () => {
      const board = makeBoard();
      const piece = makePiece({ rotationState: 0 });

      collision.mockReturnValue(false);
      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      const result = tryAiKickRotation(board, piece);
      expect(result.newRotation).toBe(1);
    });

    test('计算正确的目标旋转状态 3 -> 0（循环）', () => {
      const board = makeBoard();
      const piece = makePiece({ rotationState: 3 });

      collision.mockReturnValue(false);
      getKickData.mockReturnValue({
        3: { 0: [[0, 0]] },
      });

      const result = tryAiKickRotation(board, piece);
      expect(result.newRotation).toBe(0);
    });
  });

  /* ==================== 墙踢逻辑 ==================== */

  describe('墙踢偏移', () => {
    test('原位碰撞但第一个偏移成功时使用偏移位置', () => {
      const board = makeBoard();
      const piece = makePiece({ cx: 5, cy: 10 });

      /*
       * collision 被调用多次：
       * 第 1 次 (0,0) 返回 true 表示碰撞
       * 第 2 次 (-1,0) 返回 false 表示不碰撞
       */
      collision.mockReturnValueOnce(true).mockReturnValueOnce(false);

      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      const result = tryAiKickRotation(board, piece);

      expect(result).not.toBeNull();
      expect(result.x).toBe(4); /* 5 + (-1) = 4 */
      expect(result.y).toBe(10); /* 10 + (-0) = 10 */
    });

    test('前两个偏移碰撞但第三个偏移成功', () => {
      const board = makeBoard();
      const piece = makePiece({ cx: 5, cy: 10 });

      collision
        .mockReturnValueOnce(true) /* (0, 0) 碰撞 */
        .mockReturnValueOnce(true) /* (-1, 0) 碰撞 */
        .mockReturnValueOnce(false); /* (-1, 1) 不碰撞 */

      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      const result = tryAiKickRotation(board, piece);

      expect(result).not.toBeNull();
      /* Y 轴取反：标准偏移 +1 -> 屏幕坐标 -1 */
      expect(result.x).toBe(4); /* 5 + (-1) = 4 */
      expect(result.y).toBe(9); /* 10 + (-(+1)) = 10 - 1 = 9 */
    });

    test('所有偏移都碰撞时返回 null', () => {
      const board = makeBoard();
      const piece = makePiece();

      /* 所有 5 个测试都碰撞 */
      collision.mockReturnValue(true);

      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      const result = tryAiKickRotation(board, piece);
      expect(result).toBeNull();
    });
  });

  /* ==================== 偏移测试顺序 ==================== */

  describe('偏移测试顺序', () => {
    test('碰到第一个有效位置后立即返回，不继续测试后续偏移', () => {
      const board = makeBoard();
      const piece = makePiece();

      collision.mockReturnValue(false);

      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      tryAiKickRotation(board, piece);

      /* 因为原位 (0,0) 就不碰撞，应该只调用了 1 次 collision */
      expect(collision).toHaveBeenCalledTimes(1);
      expect(collision).toHaveBeenCalledWith(
        board,
        MOCK_ROTATED_SHAPE,
        5 /* cx + 0 */,
        10 /* cy - 0 */,
      );
    });
  });

  /* ==================== Y 轴取反 ==================== */

  describe('Y 轴取反逻辑', () => {
    test('标准偏移中正 Y 值被取反为负', () => {
      const board = makeBoard();
      const piece = makePiece({ cx: 5, cy: 10 });

      collision
        .mockReturnValueOnce(true) /* (0, 0) */
        .mockReturnValueOnce(true) /* (-1, 0) */
        .mockReturnValueOnce(false); /* (-1, +1) -> (-1, -1) */

      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      const result = tryAiKickRotation(board, piece);

      /* 标准偏移 (-1, +1) 取反后 Y = 10 + (-1) = 9 */
      expect(result.y).toBe(9);
    });

    test('标准偏移中负 Y 值被取反为正', () => {
      const board = makeBoard();
      const piece = makePiece({ cx: 5, cy: 10 });

      collision
        .mockReturnValueOnce(true) /* (0, 0) */
        .mockReturnValueOnce(true) /* (-1, 0) */
        .mockReturnValueOnce(true) /* (-1, +1) */
        .mockReturnValueOnce(false); /* (0, -2) -> (0, +2) */

      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      const result = tryAiKickRotation(board, piece);

      /* 标准偏移 (0, -2) 取反后 Y = 10 + 2 = 12 */
      expect(result.y).toBe(12);
    });
  });

  /* ==================== O 块和缺失数据 ==================== */

  describe('特殊方块类型', () => {
    test('O 块无墙踢数据返回 null', () => {
      const board = makeBoard();
      const piece = makePiece({ type: 'O' });

      getKickData.mockReturnValue(null);

      const result = tryAiKickRotation(board, piece);
      expect(result).toBeNull();
    });

    test('kickTable 存在但缺少特定转换方向时尝试原位旋转', () => {
      const board = makeBoard();
      const piece = makePiece();

      /* 只有 0->3 的数据，没有 0->1 */
      getKickData.mockReturnValue({
        0: { 3: [[0, 0]] },
      });
      collision.mockReturnValue(false);

      const result = tryAiKickRotation(board, piece);

      expect(result).not.toBeNull();
      expect(result.newRotation).toBe(1);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
    });

    test('兜底逻辑中原位碰撞时返回 null', () => {
      const board = makeBoard();
      const piece = makePiece();

      getKickData.mockReturnValue({
        0: { 3: [[0, 0]] },
      });
      collision.mockReturnValue(true);

      const result = tryAiKickRotation(board, piece);
      expect(result).toBeNull();
    });
  });

  /* ==================== 传入参数验证 ==================== */

  describe('参数传递', () => {
    test('getShapeByRotation 使用正确的类型和新旋转状态', () => {
      const board = makeBoard();
      const piece = makePiece({ type: 'I', rotationState: 2 });

      collision.mockReturnValue(false);
      getKickData.mockReturnValue({
        2: { 3: [[0, 0]] },
      });

      tryAiKickRotation(board, piece);

      expect(getShapeByRotation).toHaveBeenCalledWith('I', 3);
    });

    test('collision 每次调用传入正确的棋盘和形状', () => {
      const board = makeBoard();
      const piece = makePiece({ cx: 3, cy: 15 });

      collision.mockReturnValue(false);
      getKickData.mockReturnValue({
        0: { 1: STANDARD_KICK_0_TO_1 },
      });

      tryAiKickRotation(board, piece);

      expect(collision).toHaveBeenCalledWith(
        board,
        MOCK_ROTATED_SHAPE,
        3 /* cx + 0 */,
        15 /* cy - 0 */,
      );
    });
  });

  /* ==================== 返回值结构 ==================== */

  describe('返回值结构', () => {
    test('成功时返回包含 success, newRotation, x, y 的对象', () => {
      const board = makeBoard();
      const piece = makePiece();

      collision.mockReturnValue(false);
      getKickData.mockReturnValue({
        0: { 1: [[5, 3]] },
      });

      const result = tryAiKickRotation(board, piece);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('newRotation');
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
    });

    test('失败时返回 null', () => {
      const board = makeBoard();
      const piece = makePiece();

      collision.mockReturnValue(true);
      getKickData.mockReturnValue({
        0: { 1: [[0, 0]] },
      });

      const result = tryAiKickRotation(board, piece);
      expect(result).toBeNull();
    });
  });

  /* ==================== 边界情况 ==================== */

  describe('边界情况', () => {
    test('偏移量为空数组时走兜底逻辑', () => {
      const board = makeBoard();
      const piece = makePiece();

      getKickData.mockReturnValue({
        0: { 1: [] },
      });
      collision.mockReturnValue(false);

      const result = tryAiKickRotation(board, piece);

      expect(result).not.toBeNull();
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
    });

    test('大偏移量计算不出界', () => {
      const board = makeBoard();
      const piece = makePiece({ cx: 0, cy: 0 });

      collision.mockReturnValue(false);

      /* 偏移 (-2, +3) -> 实际坐标 (-2, -3) */
      getKickData.mockReturnValue({
        0: { 1: [[-2, 3]] },
      });

      const result = tryAiKickRotation(board, piece);

      expect(result.x).toBe(-2);
      expect(result.y).toBe(-3);
    });
  });
});
