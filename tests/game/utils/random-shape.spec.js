import randomShape from '@/lib/game/utils/random-shape.js';

jest.mock('@/lib/game/utils/refill-bag', () => ({
  __esModule: true,
  default: () => [
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
  ],
  _reset: jest.fn(),
}));

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
  // 模拟 runtime 对象，每个 Game 实例维护独立的 bag
  const makeRuntime = () => ({ bag: [] });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('返回值结构', () => {
    it('应返回 shape、color、type、rotation、colorIndex', () => {
      const piece = randomShape(makeRuntime(), 1);
      expect(piece).toHaveProperty('shape');
      expect(piece).toHaveProperty('color');
      expect(piece).toHaveProperty('type');
      expect(piece).toHaveProperty('rotation');
      expect(piece).toHaveProperty('colorIndex');
    });
  });

  describe('shape 深拷贝', () => {
    it('shape 不是原引用', () => {
      const piece1 = randomShape(makeRuntime(), 1);
      const piece2 = randomShape(makeRuntime(), 1);
      expect(piece1.shape).not.toBe(piece2.shape);
    });
  });

  describe('等级配色', () => {
    it('level 1 → palette 0', () => {
      const piece = randomShape(makeRuntime(), 1);
      expect(piece.color).toBe(`#P0_${piece.colorIndex}`);
    });

    it('level 33 → palette 1', () => {
      const piece = randomShape(makeRuntime(), 33);
      expect(piece.color).toBe(`#P1_${piece.colorIndex}`);
    });

    it('level 225 → palette 7', () => {
      const piece = randomShape(makeRuntime(), 225);
      expect(piece.color).toBe(`#P7_${piece.colorIndex}`);
    });

    it('level 256 → palette 7', () => {
      const piece = randomShape(makeRuntime(), 256);
      expect(piece.color).toBe(`#P7_${piece.colorIndex}`);
    });

    it('level 999 → palette 7（不越界）', () => {
      const piece = randomShape(makeRuntime(), 999);
      expect(piece.color).toBe(`#P7_${piece.colorIndex}`);
    });
  });

  describe('bag 独立', () => {
    it('每个 runtime 使用独立的 bag', () => {
      const rt1 = makeRuntime();
      const rt2 = makeRuntime();

      // 只从 rt1 取方块，rt2 不动
      randomShape(rt1, 1);

      // rt1 的 bag 被消费了，rt2 的 bag 仍然是初始空数组
      expect(rt1.bag.length).toBe(7);
      expect(rt2.bag.length).toBe(0);
    });
  });
});
