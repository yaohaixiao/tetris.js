// tests/game/utils/refill-bag.spec.js

import refillBag from '@/lib/game/utils/refill-bag';

jest.mock('@/lib/game/constants/shapes.js', () => [
  { shape: [[1, 1, 1, 1]], colorIndex: 0, type: 'I' },
  { shape: [[1, 1, 1, 1, 1]], colorIndex: 1, type: 'I5' },
  { shape: [[1, 1], [1, 1]], colorIndex: 2, type: 'O' },
  { shape: [[0, 1, 0], [1, 1, 1]], colorIndex: 3, type: 'T' },
  { shape: [[1, 0, 0], [1, 1, 1]], colorIndex: 4, type: 'L' },
  { shape: [[0, 0, 1], [1, 1, 1]], colorIndex: 5, type: 'J' },
  { shape: [[0, 1, 1], [1, 1, 0]], colorIndex: 6, type: 'S' },
  { shape: [[1, 1, 0], [0, 1, 1]], colorIndex: 7, type: 'Z' },
]);

describe('refillBag', () => {
  beforeEach(() => {
    refillBag._reset();
  });

  it('返回长度为 8 的数组', () => {
    const bag = refillBag();
    expect(bag).toHaveLength(8);
  });

  it('包含所有 8 种方块类型', () => {
    const bag = refillBag();
    const types = bag.map(p => p.type).sort();
    expect(types).toEqual(['I', 'I5', 'J', 'L', 'O', 'S', 'T', 'Z']);
  });

  it('首个袋子不以 S(6)、Z(7)、T(3) 开头', () => {
    for (let i = 0; i < 20; i++) {
      refillBag._reset();
      const bag = refillBag();
      expect([3, 6, 7]).not.toContain(bag[0].colorIndex);
    }
  });
});
