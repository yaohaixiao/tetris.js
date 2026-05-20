import rotateMatrix from '@/lib/ai/simulator/rotate-matrix.js';

describe('rotateMatrix', () => {
  // ==================== 标准方块旋转 ====================
  describe('标准方块旋转', () => {
    it('T 型方块顺时针旋转 90°', () => {
      const shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([
        [1, 0],
        [1, 1],
        [1, 0],
      ]);
    });

    it('I 型方块顺时针旋转 90°', () => {
      const shape = [[1, 1, 1, 1]];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([[1], [1], [1], [1]]);
    });

    it('O 型方块旋转后形状不变', () => {
      const shape = [
        [1, 1],
        [1, 1],
      ];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([
        [1, 1],
        [1, 1],
      ]);
    });

    it('L 型方块顺时针旋转 90°', () => {
      const shape = [
        [1, 0, 0],
        [1, 1, 1],
      ];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([
        [1, 1],
        [1, 0],
        [1, 0],
      ]);
    });

    it('S 型方块顺时针旋转 90°', () => {
      const shape = [
        [0, 1, 1],
        [1, 1, 0],
      ];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([
        [1, 0],
        [1, 1],
        [0, 1],
      ]);
    });

    it('Z 型方块顺时针旋转 90°', () => {
      const shape = [
        [1, 1, 0],
        [0, 1, 1],
      ];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([
        [0, 1],
        [1, 1],
        [1, 0],
      ]);
    });
  });

  // ==================== 多次旋转 ====================
  describe('多次旋转', () => {
    it('旋转 2 次（180°）', () => {
      const shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      const rotated180 = rotateMatrix(rotateMatrix(shape));

      expect(rotated180).toEqual([
        [1, 1, 1],
        [0, 1, 0],
      ]);
    });

    it('旋转 3 次（270°）', () => {
      const shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      const rotated270 = rotateMatrix(rotateMatrix(rotateMatrix(shape)));

      expect(rotated270).toEqual([
        [0, 1],
        [1, 1],
        [0, 1],
      ]);
    });

    it('旋转 4 次（360°）应该回到原位', () => {
      const shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      const rotated360 = rotateMatrix(
        rotateMatrix(rotateMatrix(rotateMatrix(shape))),
      );

      expect(rotated360).toEqual(shape);
    });

    it('I 型方块旋转 4 次应该回到原位', () => {
      const shape = [[1, 1, 1, 1]];

      const rotated360 = rotateMatrix(
        rotateMatrix(rotateMatrix(rotateMatrix(shape))),
      );

      expect(rotated360).toEqual(shape);
    });
  });

  // ==================== 单格方块 ====================
  describe('单格方块', () => {
    it('1x1 矩阵旋转后不变', () => {
      const shape = [[1]];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([[1]]);
    });

    it('1x1 矩阵旋转多次不变', () => {
      const shape = [[1]];

      const rotated = rotateMatrix(rotateMatrix(rotateMatrix(shape)));

      expect(rotated).toEqual([[1]]);
    });
  });

  // ==================== 长方形矩阵 ====================
  describe('长方形矩阵', () => {
    it('2x3 矩阵旋转后变为 3x2', () => {
      const shape = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      const rotated = rotateMatrix(shape);

      expect(rotated.length).toBe(3);
      expect(rotated[0].length).toBe(2);
      expect(rotated).toEqual([
        [4, 1],
        [5, 2],
        [6, 3],
      ]);
    });

    it('3x1 矩阵旋转后变为 1x3', () => {
      const shape = [[1], [2], [3]];

      const rotated = rotateMatrix(shape);

      expect(rotated.length).toBe(1);
      expect(rotated[0].length).toBe(3);
      expect(rotated).toEqual([[3, 2, 1]]);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('空行矩阵', () => {
      const shape = [[]];

      const rotated = rotateMatrix(shape);

      // 0 列 → 0 行，结果还是 [[]]
      expect(rotated).toEqual([]);
    });

    it('全零矩阵旋转后形状不变（仅维度对调）', () => {
      const shape = [
        [0, 0],
        [0, 0],
      ];

      const rotated = rotateMatrix(shape);

      expect(rotated).toEqual([
        [0, 0],
        [0, 0],
      ]);
    });

    it('原矩阵不被修改', () => {
      const shape = [
        [1, 2],
        [3, 4],
      ];

      const copy = [
        [1, 2],
        [3, 4],
      ];

      rotateMatrix(shape);

      expect(shape).toEqual(copy);
    });

    it('连续多次旋转不应该修改原矩阵', () => {
      const shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      const copy = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      rotateMatrix(shape);
      rotateMatrix(shape);
      rotateMatrix(shape);
      rotateMatrix(shape);

      expect(shape).toEqual(copy);
    });
  });
});
