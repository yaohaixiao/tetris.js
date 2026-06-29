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
  /**
   * 创建模拟的 runtime 对象。
   *
   * randomShape 现在通过 runtime.updateBag() 更新袋子内容，
   * 不再直接赋值 runtime.bag。因此 runtime 必须提供 updateBag 方法。
   *
   * @returns {object} 模拟的 runtime 对象，包含 bag 数组和 updateBag 方法
   */
  const makeRuntime = () => ({
    bag: [],
    updateBag: function (newBag) {
      this.bag = newBag;
    },
  });

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

      // rt1 的 bag 被消费了 1 个（从 7 个中取走 1 个，剩余 7 个是因为
      // randomShape 首次调用时 bag 为空，先 refill 7 个再取走 1 个）
      expect(rt1.bag.length).toBe(7);
      // rt2 的 bag 仍然是初始空数组
      expect(rt2.bag.length).toBe(0);
    });

    it('多次调用后 bag 正确消费', () => {
      const rt = makeRuntime();

      // 首次调用：bag 为空 → refill 7 个 → 取走 1 个 → 剩余 7（mock refill 返回 8 个）
      randomShape(rt, 1);
      expect(rt.bag.length).toBe(7);

      // 再次调用：bag 非空 → 直接取走 1 个 → 剩余 6
      randomShape(rt, 1);
      expect(rt.bag.length).toBe(6);
    });
  });

  describe('updateBag 被调用', () => {
    it('bag 为空时应调用 updateBag', () => {
      const rt = makeRuntime();
      const updateBagSpy = jest.spyOn(rt, 'updateBag');

      randomShape(rt, 1);
      expect(updateBagSpy).toHaveBeenCalledTimes(1);
    });

    it('bag 非空时不应调用 updateBag', () => {
      const rt = makeRuntime();
      // 先调用一次让 bag 非空
      randomShape(rt, 1);

      const updateBagSpy = jest.spyOn(rt, 'updateBag');
      randomShape(rt, 1);
      expect(updateBagSpy).not.toHaveBeenCalled();
    });
  });
});
