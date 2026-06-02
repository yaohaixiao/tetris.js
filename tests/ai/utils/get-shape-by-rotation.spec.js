/**
 * getShapeByRotation 单元测试 (Jest)
 *
 * 测试覆盖：
 * 1. 所有方块类型在所有旋转状态下的矩阵尺寸正确
 * 2. 每个矩阵中填充单元格数量正确
 * 3. O 块四个状态完全一致
 * 4. I 块四个状态各不相同
 * 5. 连续顺时针旋转回到原位（状态一致性）
 * 6. 无效输入边界情况
 */

import getShapeByRotation from '@/lib/ai/utils/get-shape-by-rotation.js';

/* 预期填充数量：每个方块类型在单个旋转状态下的 1 的总数 */
const EXPECTED_CELL_COUNT = {
  I: 4,
  I5: 5,
  T: 4,
  J: 4,
  L: 4,
  S: 4,
  Z: 4,
  O: 4,
};

/* 预期矩阵尺寸：[行数, 列数] */
const EXPECTED_SIZE = {
  I: [4, 4],
  I5: [5, 5],
  T: [3, 3],
  J: [3, 3],
  L: [3, 3],
  S: [3, 3],
  Z: [3, 3],
  O: [2, 2],
};

const ALL_TYPES = ['I', 'I5', 'T', 'J', 'L', 'S', 'Z', 'O'];
const ALL_STATES = [0, 1, 2, 3];

/* 辅助函数：统计矩阵中 1 的数量 */
const countCells = (matrix) => {
  let count = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) count++;
    }
  }
  return count;
};

/* 辅助函数：比较两个矩阵是否完全相等 */
const matrixEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let r = 0; r < a.length; r++) {
    if (a[r].length !== b[r].length) return false;
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
};

/* ==================== 测试套件 ==================== */

describe('getShapeByRotation', () => {
  /* 测试 1：矩阵尺寸正确 */
  describe('矩阵尺寸', () => {
    for (const type of ALL_TYPES) {
      const [expectedRows, expectedCols] = EXPECTED_SIZE[type];
      for (const state of ALL_STATES) {
        test(`${type} state ${state} 应为 ${expectedRows}x${expectedCols}`, () => {
          const shape = getShapeByRotation(type, state);
          expect(shape.length).toBe(expectedRows);
          for (let r = 0; r < shape.length; r++) {
            expect(shape[r].length).toBe(expectedCols);
          }
        });
      }
    }
  });

  /* 测试 2：填充单元格数量正确 */
  describe('填充单元格数量', () => {
    for (const type of ALL_TYPES) {
      const expected = EXPECTED_CELL_COUNT[type];
      for (const state of ALL_STATES) {
        test(`${type} state ${state} 应有 ${expected} 个填充格`, () => {
          const shape = getShapeByRotation(type, state);
          expect(countCells(shape)).toBe(expected);
        });
      }
    }
  });

  /* 测试 3：O 块四个状态完全一致 */
  describe('O 块旋转不变', () => {
    test('四个旋转状态应完全一致', () => {
      const state0 = getShapeByRotation('O', 0);
      for (const state of [1, 2, 3]) {
        const shape = getShapeByRotation('O', state);
        expect(matrixEqual(state0, shape)).toBe(true);
      }
    });
  });

  /* 测试 4：I 块四个状态各不相同 */
  describe('I 块旋转变化', () => {
    test('四个旋转状态应各不相同', () => {
      const shapes = ALL_STATES.map((s) => getShapeByRotation('I', s));
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          expect(matrixEqual(shapes[i], shapes[j])).toBe(false);
        }
      }
    });
  });

  /* 测试 5：T 块连续顺时针旋转回到原位 */
  describe('T 块完整旋转周期', () => {
    test('state 0 与 state 1 应不同', () => {
      const state0 = getShapeByRotation('T', 0);
      const state1 = getShapeByRotation('T', 1);
      expect(matrixEqual(state0, state1)).toBe(false);
    });

    test('state 0 与 state 2 应不同', () => {
      const state0 = getShapeByRotation('T', 0);
      const state2 = getShapeByRotation('T', 2);
      expect(matrixEqual(state0, state2)).toBe(false);
    });

    test('state 3 顺时针旋转后应回到 state 0', () => {
      const state0 = getShapeByRotation('T', 0);
      const state3Rotated = getShapeByRotation('T', (3 + 1) % 4);
      expect(matrixEqual(state0, state3Rotated)).toBe(true);
    });
  });

  /* 测试 6：所有方块连续旋转 4 次回到原位 */
  describe('所有方块完整旋转周期', () => {
    for (const type of ['I', 'I5', 'T', 'J', 'L', 'S', 'Z']) {
      test(`${type} 块连续顺时针旋转 4 次应回到原位`, () => {
        const state0 = getShapeByRotation(type, 0);
        const stateBack = getShapeByRotation(type, 4 % 4);
        expect(matrixEqual(state0, stateBack)).toBe(true);
      });
    }
  });

  /* 测试 7：无效输入边界情况 */
  describe('无效输入', () => {
    test('无效方块类型应返回 undefined', () => {
      expect(getShapeByRotation('X', 0)).toBeUndefined();
    });

    test('无效旋转状态应返回 undefined', () => {
      expect(getShapeByRotation('T', 4)).toBeUndefined();
      expect(getShapeByRotation('T', -1)).toBeUndefined();
      expect(getShapeByRotation('T', 999)).toBeUndefined();
    });

    test('空字符串类型应返回 undefined', () => {
      expect(getShapeByRotation('', 0)).toBeUndefined();
    });
  });

  /* 测试 8：返回值内容一致 */
  describe('返回值一致性', () => {
    test('多次调用同一类型同一状态返回值应内容相等', () => {
      const shape1 = getShapeByRotation('T', 0);
      const shape2 = getShapeByRotation('T', 0);
      expect(shape1).toEqual(shape2);
    });
  });
});
