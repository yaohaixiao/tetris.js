import tryNormalRotation from '@/lib/game/logic/rotate/try-normal-rotation.js';
import collision from '@/lib/game/logic/collision.js';
import applyRotation from '@/lib/game/logic/rotate/apply-rotation.js';
import resetLockDelay from '@/lib/game/logic/rotate/reset-lock-delay.js';

jest.mock('@/lib/game/logic/collision.js', () => jest.fn());
jest.mock('@/lib/game/logic/rotate/apply-rotation.js', () => jest.fn());
jest.mock('@/lib/game/logic/rotate/reset-lock-delay.js', () => jest.fn());

describe('tryNormalRotation', () => {
  let runtime;
  let curr;
  let rotated;
  const newRotation = 1;

  beforeEach(() => {
    jest.clearAllMocks();

    curr = { shape: [[1]], rotation: 0 };
    rotated = [
      [0, 1],
      [1, 0],
    ];

    runtime = {
      Store: { getState: jest.fn(), setState: jest.fn() },
    };
  });

  it('无碰撞时应用旋转（不传 cx/cy）', () => {
    collision.mockReturnValue(false);

    const result = tryNormalRotation(runtime, curr, rotated, newRotation);

    expect(result).toBe(true);
    expect(applyRotation).toHaveBeenCalledWith(
      runtime.Store,
      curr,
      rotated,
      newRotation,
    );
    expect(resetLockDelay).toHaveBeenCalledWith(runtime);
  });

  it('有碰撞时返回 false', () => {
    collision.mockReturnValue(true);

    const result = tryNormalRotation(runtime, curr, rotated, newRotation);

    expect(result).toBe(false);
    expect(applyRotation).not.toHaveBeenCalled();
    expect(resetLockDelay).not.toHaveBeenCalled();
  });

  it('碰撞检测用 (0, 0) 偏移', () => {
    collision.mockReturnValue(false);

    tryNormalRotation(runtime, curr, rotated, newRotation);

    expect(collision).toHaveBeenCalledWith(runtime, 0, 0, rotated);
  });
});
