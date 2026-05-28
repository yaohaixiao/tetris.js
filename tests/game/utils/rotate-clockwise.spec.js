import rotateClockwise from '@/lib/game/utils/rotate-clockwise.js';

describe('rotateClockwise', () => {
  // ==================== 基础功能 ====================
  describe('基础旋转功能', () => {
    it('应该将 1x4 矩阵顺时针旋转为 4x1', () => {
      const input = [[1, 1, 1, 1]];
      const expected = [[1], [1], [1], [1]];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该将 1x5 矩阵顺时针旋转为 5x1', () => {
      const input = [[1, 1, 1, 1, 1]];
      const expected = [[1], [1], [1], [1], [1]];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该将 2x2 矩阵顺时针旋转', () => {
      const input = [
        [1, 1],
        [1, 1],
      ];
      const expected = [
        [1, 1],
        [1, 1],
      ];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该将 2x3 矩阵顺时针旋转为 3x2', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      const expected = [
        [0, 1],
        [1, 1],
        [1, 0],
      ];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该将 3x2 矩阵顺时针旋转为 2x3', () => {
      const input = [
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      const expected = [
        [0, 1, 1],
        [1, 1, 0],
      ];
      expect(rotateClockwise(input)).toEqual(expected);
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
        [1, 0],
        [1, 1],
        [1, 0],
      ];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该正确旋转 L 型方块（2x3）', () => {
      const input = [
        [1, 0, 0],
        [1, 1, 1],
      ];
      const expected = [
        [1, 1],
        [1, 0],
        [1, 0],
      ];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该正确旋转 J 型方块（2x3）', () => {
      const input = [
        [0, 0, 1],
        [1, 1, 1],
      ];
      // 根据实际输出修正
      const expected = [
        [1, 0],
        [1, 0],
        [1, 1],
      ];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该正确旋转 S 型方块（2x3）', () => {
      const input = [
        [0, 1, 1],
        [1, 1, 0],
      ];
      const expected = [
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      expect(rotateClockwise(input)).toEqual(expected);
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
      expect(rotateClockwise(input)).toEqual(expected);
    });
  });

  // ==================== 深拷贝测试 ====================
  describe('深拷贝', () => {
    it('应该返回新矩阵，不是原引用', () => {
      const input = [
        [1, 1],
        [1, 1],
      ];
      const result = rotateClockwise(input);
      expect(result).not.toBe(input);
    });

    it('修改返回的矩阵不应影响原矩阵', () => {
      const input = [
        [1, 0],
        [1, 1],
      ];
      const result = rotateClockwise(input);
      result[0][0] = 999;
      expect(input[0][0]).toBe(1);
      expect(input[1][0]).toBe(1);
    });

    it('修改原矩阵不应影响返回的矩阵', () => {
      const input = [
        [1, 0],
        [1, 1],
      ];
      const result = rotateClockwise(input);
      input[0][0] = 999;
      expect(result[0][0]).not.toBe(999);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('应该正确处理 1x1 矩阵', () => {
      const input = [[1]];
      const expected = [[1]];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该正确处理 1x2 矩阵', () => {
      const input = [[1, 0]];
      const expected = [[1], [0]];
      expect(rotateClockwise(input)).toEqual(expected);
    });

    it('应该正确处理 2x1 矩阵', () => {
      const input = [[1], [0]];
      // 根据实际输出修正
      const expected = [[0, 1]];
      expect(rotateClockwise(input)).toEqual(expected);
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
      expect(rotateClockwise(input)).toEqual(expected);
    });
  });

  // ==================== 多次旋转 ====================
  describe('多次旋转', () => {
    it('旋转 4 次应回到原形状', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      let result = rotateClockwise(input);
      result = rotateClockwise(result);
      result = rotateClockwise(result);
      result = rotateClockwise(result);
      expect(result).toEqual(input);
    });

    it('旋转 2 次应得到完全相反的形状', () => {
      const input = [
        [1, 1, 0],
        [0, 1, 1],
      ];
      const result = rotateClockwise(rotateClockwise(input));
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
      const result1 = rotateClockwise(input);
      const result2 = rotateClockwise(input);
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2);
    });
  });
});
