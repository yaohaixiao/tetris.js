import randomShape from '@/lib/game/utils/random-shape.js';

jest.mock('@/lib/game/constants/shapes.js', () => [
  { shape: [[1, 1, 1, 1]], colorIndex: 0 },
  { shape: [[1, 1, 1, 1, 1]], colorIndex: 1 },
  { shape: [[1, 1], [1, 1]], colorIndex: 2 },
  { shape: [[0, 1, 0], [1, 1, 1]], colorIndex: 3 },
  { shape: [[1, 0, 0], [1, 1, 1]], colorIndex: 4 },
  { shape: [[0, 0, 1], [1, 1, 1]], colorIndex: 5 },
  { shape: [[0, 1, 1], [1, 1, 0]], colorIndex: 6 },
  { shape: [[1, 1, 0], [0, 1, 1]], colorIndex: 7 },
]);

jest.mock('@/lib/game/constants/color-palettes.js', () => [
  ['#P0_0', '#P0_1', '#P0_2', '#P0_3', '#P0_4', '#P0_5', '#P0_6', '#P0_7'],
  ['#P1_0', '#P1_1', '#P1_2', '#P1_3', '#P1_4', '#P1_5', '#P1_6', '#P1_7'],
  ['#P2_0', '#P2_1', '#P2_2', '#P2_3', '#P2_4', '#P2_5', '#P2_6', '#P2_7'],
  ['#P3_0', '#P3_1', '#P3_2', '#P3_3', '#P3_4', '#P3_5', '#P3_6', '#P3_7'],
  ['#P4_0', '#P4_1', '#P4_2', '#P4_3', '#P4_4', '#P4_5', '#P4_6', '#P4_7'],
  ['#P5_0', '#P5_1', '#P5_2', '#P5_3', '#P5_4', '#P5_5', '#P5_6', '#P5_7'],
  ['#P6_0', '#P6_1', '#P6_2', '#P6_3', '#P6_4', '#P6_5', '#P6_6', '#P6_7'],
  ['#P7_0', '#P7_1', '#P7_2', '#P7_3', '#P7_4', '#P7_5', '#P7_6', '#P7_7'],
]);

describe('randomShape', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== 返回值结构 ====================
  describe('返回值结构', () => {
    it('应返回包含 shape 和 color 的对象', () => {
      const piece = randomShape(1);
      expect(piece).toHaveProperty('shape');
      expect(piece).toHaveProperty('color');
    });

    it('不应包含 colorIndex', () => {
      const piece = randomShape(1);
      expect(piece).not.toHaveProperty('colorIndex');
    });
  });

  // ==================== shape 深拷贝 ====================
  describe('shape 深拷贝', () => {
    it('shape 不是原引用', () => {
      const piece = randomShape(1);
      const piece2 = randomShape(1);
      expect(piece.shape).not.toBe(piece2.shape);
    });
  });

  // ==================== 默认 level ====================
  describe('默认 level', () => {
    it('不传 level 时默认 1，使用第 1 套配色', () => {
      const piece = randomShape();
      expect(piece.color).toBe('#P0_0');
    });
  });

  // ==================== 等级配色 ====================
  describe('等级配色', () => {
    it('level 1 → palette 0', () => {
      expect(randomShape(1).color).toBe('#P0_0');
    });

    it('level 32 → palette 0（区间末尾）', () => {
      expect(randomShape(32).color).toBe('#P0_0');
    });

    it('level 33 → palette 1', () => {
      expect(randomShape(33).color).toBe('#P1_0');
    });

    it('level 64 → palette 1', () => {
      expect(randomShape(64).color).toBe('#P1_0');
    });

    it('level 65 → palette 2', () => {
      expect(randomShape(65).color).toBe('#P2_0');
    });

    it('level 225 → palette 7', () => {
      expect(randomShape(225).color).toBe('#P7_0');
    });

    it('level 256 → palette 7', () => {
      expect(randomShape(256).color).toBe('#P7_0');
    });

    it('level 999 → palette 7（不越界）', () => {
      expect(randomShape(999).color).toBe('#P7_0');
    });
  });

  // ==================== colorIndex 映射 ====================
  describe('colorIndex 映射', () => {
    it('colorIndex=3 → palette[3]', () => {
      Math.random.mockReturnValue(0.4); // SHAPES[3]
      expect(randomShape(1).color).toBe('#P0_3');
    });

    it('colorIndex=7 → palette[7]', () => {
      Math.random.mockReturnValue(0.9); // SHAPES[7]
      expect(randomShape(1).color).toBe('#P0_7');
    });
  });
});
