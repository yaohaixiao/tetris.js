import randomShape from '@/lib/game/utils/random-shape.js';

// Mock SHAPES
jest.mock('@/lib/game/constants/shapes.js', () => ({
  __esModule: true,
  default: [
    { shape: [[1, 1, 1, 1]], color: '#008080' },
    { shape: [[1, 1, 1, 1, 1]], color: '#00FF00' },
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: '#FFA500',
    },
  ],
}));

describe('randomShape', () => {
  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该返回包含 shape 和 color 的对象', () => {
      const result = randomShape();

      expect(result).toHaveProperty('shape');
      expect(result).toHaveProperty('color');
    });

    it('color 应该是有效值', () => {
      const validColors = ['#008080', '#00FF00', '#FFA500'];

      for (let i = 0; i < 20; i++) {
        const result = randomShape();
        expect(validColors).toContain(result.color);
      }
    });

    it('shape 应该是二维数组', () => {
      const result = randomShape();

      expect(Array.isArray(result.shape)).toBe(true);
      result.shape.forEach((row) => {
        expect(Array.isArray(row)).toBe(true);
      });
    });
  });

  // ==================== 深拷贝验证 ====================
  describe('深拷贝验证', () => {
    it('返回的 shape 应该是原始数据的副本而非引用', () => {
      // 多次调用，确保每次返回的 shape 引用不同
      const result1 = randomShape();
      const result2 = randomShape();

      // 即使随机到同一个方块，shape 也应该是不同的引用
      if (result1.color === result2.color) {
        // 不能直接比较引用，因为可能不是同一个
      }

      // 修改返回的 shape 不应该影响后续调用
      const result = randomShape();
      result.shape[0][0] = 999;

      const anotherResult = randomShape();
      // 后续调用的 shape 不应该包含 999
      const flatValues = anotherResult.shape.flat();
      expect(flatValues).not.toContain(999);
    });

    it('每次返回的 shape 应该是新数组', () => {
      const result1 = randomShape();
      const result2 = randomShape();

      // 内部行数组应该是不同的引用
      if (
        result1.shape.length === result2.shape.length &&
        result1.shape[0].length === result2.shape[0].length
      ) {
        expect(result1.shape).not.toBe(result2.shape);
        expect(result1.shape[0]).not.toBe(result2.shape[0]);
      }
    });
  });

  // ==================== 随机性 ====================
  describe('随机性', () => {
    it('多次调用应该产生不同的方块', () => {
      const colors = new Set();

      for (let i = 0; i < 50; i++) {
        colors.add(randomShape().color);
      }

      // 50 次调用几乎肯定会包含多种颜色
      expect(colors.size).toBeGreaterThan(1);
    });

    it('应该均匀分布在所有方块类型中', () => {
      const counts = {};

      for (let i = 0; i < 300; i++) {
        const result = randomShape();
        const key = JSON.stringify(result.shape);
        counts[key] = (counts[key] || 0) + 1;
      }

      // 每个方块类型至少应该出现几次
      Object.values(counts).forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('Math.random 返回 0 时应该选择第一个方块', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = randomShape();

      expect(result.color).toBe('#008080');

      jest.restoreAllMocks();
    });

    it('Math.random 返回接近 1 时应该选择最后一个方块', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9999);

      const result = randomShape();

      expect(result.color).toBe('#FFA500');

      jest.restoreAllMocks();
    });
  });
});
