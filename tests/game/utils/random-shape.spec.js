import randomShape from '@/lib/game/utils/random-shape.js';

jest.mock('@/lib/game/constants/shapes.js', () => [
  { shape: [[1, 1, 1, 1]], colorIndex: 0, type: 'I', rotation: 0 },
  { shape: [[1, 1, 1, 1, 1]], colorIndex: 1, type: 'I5', rotation: 0 },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    colorIndex: 2,
    type: 'O',
    rotation: 0,
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    colorIndex: 3,
    type: 'T',
    rotation: 0,
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    colorIndex: 4,
    type: 'L',
    rotation: 0,
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    colorIndex: 5,
    type: 'J',
    rotation: 0,
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    colorIndex: 6,
    type: 'S',
    rotation: 0,
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    colorIndex: 7,
    type: 'Z',
    rotation: 0,
  },
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
    it('应返回包含 shape、color、type、rotation、colorIndex 的对象', () => {
      const piece = randomShape(1);
      expect(piece).toHaveProperty('shape');
      expect(piece).toHaveProperty('color');
      expect(piece).toHaveProperty('type');
      expect(piece).toHaveProperty('rotation');
      expect(piece).toHaveProperty('colorIndex');
    });

    it('shape 应为数组', () => {
      const piece = randomShape(1);
      expect(Array.isArray(piece.shape)).toBe(true);
    });

    it('color 应为字符串', () => {
      const piece = randomShape(1);
      expect(typeof piece.color).toBe('string');
    });

    it('type 应为字符串', () => {
      const piece = randomShape(1);
      expect(typeof piece.type).toBe('string');
    });

    it('rotation 应为数字', () => {
      const piece = randomShape(1);
      expect(typeof piece.rotation).toBe('number');
    });

    it('colorIndex 应为数字', () => {
      const piece = randomShape(1);
      expect(typeof piece.colorIndex).toBe('number');
    });
  });

  // ==================== shape 深拷贝 ====================
  describe('shape 深拷贝', () => {
    it('shape 不是原引用', () => {
      const piece = randomShape(1);
      const piece2 = randomShape(1);
      expect(piece.shape).not.toBe(piece2.shape);
    });

    it('修改返回的 shape 不应影响原始数据', () => {
      const piece = randomShape(1);
      const originalShape = piece.shape.map(row => [...row]);
      piece.shape[0][0] = 999;
      expect(piece.shape[0][0]).toBe(999);
      // 重新生成应该不受影响
      const newPiece = randomShape(1);
      expect(newPiece.shape[0][0]).not.toBe(999);
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

  // ==================== 类型和颜色索引映射 ====================
  describe('类型和颜色索引映射', () => {
    it('应正确返回 type 和 colorIndex', () => {
      Math.random.mockReturnValue(0);     // SHAPES[0] - I 型
      const piece = randomShape(1);
      expect(piece.type).toBe('I');
      expect(piece.colorIndex).toBe(0);
    });

    it('colorIndex=3 → type=T, palette[3]', () => {
      Math.random.mockReturnValue(0.4);   // SHAPES[3] - T 型
      const piece = randomShape(1);
      expect(piece.type).toBe('T');
      expect(piece.colorIndex).toBe(3);
      expect(piece.color).toBe('#P0_3');
    });

    it('colorIndex=7 → type=Z, palette[7]', () => {
      Math.random.mockReturnValue(0.9);   // SHAPES[7] - Z 型
      const piece = randomShape(1);
      expect(piece.type).toBe('Z');
      expect(piece.colorIndex).toBe(7);
      expect(piece.color).toBe('#P0_7');
    });

    it('I5 类型应正确返回', () => {
      Math.random.mockReturnValue(0.15);  // SHAPES[1] - I5 型
      const piece = randomShape(1);
      expect(piece.type).toBe('I5');
      expect(piece.colorIndex).toBe(1);
    });

    it('O 类型应正确返回', () => {
      Math.random.mockReturnValue(0.25);  // SHAPES[2] - O 型
      const piece = randomShape(1);
      expect(piece.type).toBe('O');
      expect(piece.colorIndex).toBe(2);
    });
  });

  // ==================== rotation 初始值 ====================
  describe('rotation 初始值', () => {
    it('所有方块的初始 rotation 应为 0', () => {
      for (let i = 0; i < 10; i++) {
        Math.random.mockReturnValue(Math.random());
        const piece = randomShape(1);
        expect(piece.rotation).toBe(0);
      }
    });
  });

  // ==================== 随机性测试 ====================
  describe('随机性', () => {
    it('Math.random 被正确调用', () => {
      randomShape(1);
      expect(Math.random).toHaveBeenCalled();
    });

    it('不同随机值应返回不同方块', () => {
      Math.random.mockReturnValueOnce(0.1);  // I5
      Math.random.mockReturnValueOnce(0.5);  // L

      const piece1 = randomShape(1);
      const piece2 = randomShape(1);

      expect(piece1.type).not.toBe(piece2.type);
    });
  });
});
