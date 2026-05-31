import tryKickRotation from '@/lib/game/utils/try-kick-rotation';
import collision from '@/lib/game/logic/collision';
import applyRotation from '@/lib/game/utils/apply-rotation';

jest.mock('@/lib/game/logic/collision', () => jest.fn());
jest.mock('@/lib/game/utils/apply-rotation', () => jest.fn());

describe('tryKickRotation', () => {
  let runtime;
  let curr;
  let rotated;
  const newRotation = 1;
  const tests = [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    curr = { shape: [[1]], rotation: 0 };
    rotated = [
      [0, 1],
      [1, 0],
    ];

    runtime = {
      Store: {
        getState: jest.fn(() => ({ cx: 4, cy: 18 })),
      },
    };
  });

  it('第一个偏移可用时直接应用', () => {
    collision.mockReturnValue(false);

    const result = tryKickRotation(runtime, curr, rotated, newRotation, tests);

    expect(result).toBe(true);
    expect(applyRotation).toHaveBeenCalledWith(
      runtime.Store,
      curr,
      rotated,
      newRotation,
      4,
      18,
    );
  });

  it('遍历所有偏移找到可用位置', () => {
    collision
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const result = tryKickRotation(runtime, curr, rotated, newRotation, tests);

    expect(result).toBe(true);
    // 第三个偏移 [-1, 1]：cx=4-1=3, cy=18-1=17
    expect(applyRotation).toHaveBeenCalledWith(
      runtime.Store,
      curr,
      rotated,
      newRotation,
      3,
      17,
    );
  });

  it('所有偏移都失败时返回 false', () => {
    collision.mockReturnValue(true);

    const result = tryKickRotation(runtime, curr, rotated, newRotation, tests);

    expect(result).toBe(false);
    expect(applyRotation).not.toHaveBeenCalled();
  });

  it('SRS 坐标系转换：oy 取反', () => {
    collision.mockReturnValueOnce(true).mockReturnValueOnce(false);

    const testWithPositiveY = [[0, 2]];
    tryKickRotation(runtime, curr, rotated, newRotation, testWithPositiveY);

    // offsetY = -2, collision 收到 oy = -2
    expect(collision).toHaveBeenCalledWith(runtime, 0, -2, rotated);
  });
});
