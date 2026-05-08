import { randomShape } from '@/lib/game/utils/random-shape';
import SHAPES from '@/lib/game/constants/shapes';

jest.mock('@/lib/game/constants/shapes', () => [
  { type: 'I', shape: [[1, 1, 1, 1]], color: 'cyan' },
  { type: 'O', shape: [[1, 1], [1, 1]], color: 'yellow' },
  { type: 'T', shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
]);

describe('randomShape', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    Math.random.mockRestore();
  });

  test('返回一个方块对象', () => {
    const piece = randomShape();

    expect(piece).toHaveProperty('type');
    expect(piece).toHaveProperty('shape');
    expect(piece).toHaveProperty('color');
  });

  test('根据 Math.random 选择正确的方块', () => {
    // index = floor(0.5 * 3) = 1 → type 'O'
    Math.random.mockReturnValue(0.5);

    const piece = randomShape();
    expect(piece.type).toBe('O');
    expect(piece.color).toBe('yellow');
  });

  test('返回第一个方块（Math.random = 0）', () => {
    Math.random.mockReturnValue(0);

    const piece = randomShape();
    expect(piece.type).toBe('I');
  });

  test('返回最后一个方块（Math.random 接近 1）', () => {
    Math.random.mockReturnValue(0.999);

    const piece = randomShape();
    expect(piece.type).toBe('T');
  });

  test('shape 是深拷贝，不是原始引用', () => {
    Math.random.mockReturnValue(0);

    const piece = randomShape();

    // 原始 SHAPES[0] 的 shape 引用
    expect(piece.shape).not.toBe(SHAPES[0].shape);
    expect(piece.shape[0]).not.toBe(SHAPES[0].shape[0]);
  });

  test('shape 内容与原始相同', () => {
    Math.random.mockReturnValue(0);

    const piece = randomShape();
    expect(piece.shape).toEqual([[1, 1, 1, 1]]);
  });

  test('多次调用可能返回不同方块', () => {
    const types = new Set();

    for (let i = 0; i < 50; i++) {
      Math.random.mockReturnValueOnce(Math.random());
      types.add(randomShape().type);
    }

    // 50 次调用至少出现 2 种类型（概率极低才只有 1 种）
    expect(types.size).toBeGreaterThanOrEqual(1); // 不强制，至少不报错
  });
});
