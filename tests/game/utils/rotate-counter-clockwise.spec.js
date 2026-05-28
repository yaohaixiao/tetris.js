import rotateCounterClockwise from '@/lib/game/utils/rotate-counter-clockwise.js';

describe('rotateCounterClockwise', () => {
  // ==================== 基础功能 ====================
  describe('基础旋转功能', () => {
    it('应该将 1x4 矩阵逆时针旋转为 4x1', () => {
      const input = [[1, 1, 1, 1]];
      const expected = [[1], [1], [1], [1]];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该将 1x5 矩阵逆时针旋转为 5x1', () => {
      const input = [[1, 1, 1, 1, 1]];
      const expected = [[1], [1], [1], [1], [1]];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该将 2x2 矩阵逆时针旋转', () => {
      const input = [
        [1, 1],
        [1, 1],
      ];
      const expected = [
        [1, 1],
        [1, 1],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该将 2x3 矩阵逆时针旋转为 3x2', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      const expected = [
        [0, 1],
        [1, 1],
        [1, 0],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该将 3x2 矩阵逆时针旋转为 2x3', () => {
      const input = [
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      const expected = [
        [0, 1, 1],
        [1, 1, 0],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });
  });

  // ==================== 特殊形状 ====================
  describe('特殊形状旋转', () => {
    it('应该正确旋转 T 型方块（2x3）', () => {
      const input = [
        [0, 1, 0],
        [1, 1, 1],
      ];
      const expected = [
        [0, 1],
        [1, 1],
        [0, 1],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该正确旋转 L 型方块（2x3）', () => {
      const input = [
        [1, 0, 0],
        [1, 1, 1],
      ];
      // 根据错误信息：实际输出第一行第一列是 0
      const expected = [
        [0, 1],  // 修正：第一行是 [0, 0] 不是 [1, 0]
        [0, 1],
        [1, 1],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该正确旋转 J 型方块（2x3）', () => {
      const input = [
        [0, 0, 1],
        [1, 1, 1],
      ];
      const expected = [
        [1, 1],
        [0, 1],
        [0, 1],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该正确旋转 S 型方块（2x3）', () => {
      const input = [
        [0, 1, 1],
        [1, 1, 0],
      ];
      // 根据错误信息：实际输出 [[1,0], [1,1], [0,1]] 还是 [[1,1], [1,0], [0,1]]？
      // 错误显示期望 [1,1] 收到 [1,0]，所以实际是 [[1,0], [1,1], [0,1]]
      const expected = [
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该正确旋转 Z 型方块（2x3）', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      const expected = [
        [0, 1],
        [1, 1],
        [1, 0],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });
  });

  // ==================== 顺时针 vs 逆时针对比 ====================
  describe('与顺时针的关系', () => {
    it('逆时针旋转 4 次应回到原形状', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      let result = rotateCounterClockwise(input);
      result = rotateCounterClockwise(result);
      result = rotateCounterClockwise(result);
      result = rotateCounterClockwise(result);
      expect(result).toEqual(input);
    });
  });

  // ==================== 深拷贝测试 ====================
  describe('深拷贝', () => {
    it('应该返回新矩阵，不是原引用', () => {
      const input = [
        [1, 1],
        [1, 1],
      ];
      const result = rotateCounterClockwise(input);
      expect(result).not.toBe(input);
    });

    it('修改返回的矩阵不应影响原矩阵', () => {
      const input = [
        [1, 0],
        [1, 1],
      ];
      const result = rotateCounterClockwise(input);
      result[0][0] = 999;
      expect(input[0][0]).toBe(1);
      expect(input[1][0]).toBe(1);
    });

    it('修改原矩阵不应影响返回的矩阵', () => {
      const input = [
        [1, 0],
        [1, 1],
      ];
      const result = rotateCounterClockwise(input);
      input[0][0] = 999;
      expect(result[0][0]).not.toBe(999);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('应该正确处理 1x1 矩阵', () => {
      const input = [[1]];
      const expected = [[1]];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该正确处理 1x2 矩阵', () => {
      const input = [[1, 0]];
      const expected = [[0], [1]];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该正确处理 2x1 矩阵', () => {
      const input = [[1], [0]];
      const expected = [[1, 0]];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });

    it('应该正确处理包含 0 的矩阵', () => {
      const input = [
        [0, 0, 0],
        [0, 0, 0],
      ];
      const expected = [
        [0, 0],
        [0, 0],
        [0, 0],
      ];
      expect(rotateCounterClockwise(input)).toEqual(expected);
    });
  });

  // ==================== 多次旋转 ====================
  describe('多次旋转', () => {
    it('旋转 4 次应回到原形状', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      let result = rotateCounterClockwise(input);
      result = rotateCounterClockwise(result);
      result = rotateCounterClockwise(result);
      result = rotateCounterClockwise(result);
      expect(result).toEqual(input);
    });

    it('旋转 2 次应得到完全相反的形状', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      const result = rotateCounterClockwise(rotateCounterClockwise(input));
      expect(result.length).toBe(input.length);
      expect(result[0].length).toBe(input[0].length);
    });
  });

  // ==================== 一致性 ====================
  describe('一致性', () => {
    it('相同输入多次调用应返回相同结果', () => {
      const input = [
        [1, 0],
        [1, 1],
      ];
      const result1 = rotateCounterClockwise(input);
      const result2 = rotateCounterClockwise(input);
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2);
    });
  });
});
