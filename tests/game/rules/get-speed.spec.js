import getSpeed from '@/lib/game/rules/get-speed.js';
import Game from '@/lib/game/index.js';
import Configuration from '@/lib/configuration.js';

jest.mock('@/lib/game/index.js', () => ({
  store: {
    getLevel: jest.fn(),
  },
}));

jest.mock('@/lib/configuration.js', () => ({
  Level: {
    max: 99,
  },
}));

describe('getSpeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 基础计算 ==========
  test('level 1 返回接近 1000ms', () => {
    Game.store.getLevel.mockReturnValue(1);
    const speed = getSpeed();

    // step = ceil(1000 / floor(99 * 0.7)) = ceil(1000 / 69) = 15
    // speed = max(120, 1000 - (1-1) * 15) = 1000
    expect(speed).toBe(1000);
  });

  test('level 2 返回 985ms', () => {
    Game.store.getLevel.mockReturnValue(2);
    const speed = getSpeed();

    // step = 15, speed = 1000 - 1 * 15 = 985
    expect(speed).toBe(985);
  });

  test('level 10 返回 865ms', () => {
    Game.store.getLevel.mockReturnValue(10);
    const speed = getSpeed();

    // step = 15, speed = 1000 - 9 * 15 = 865
    expect(speed).toBe(865);
  });

  // ========== 边界：最低 120ms ==========
  test('速度不会低于 120ms', () => {
    Game.store.getLevel.mockReturnValue(99);
    const speed = getSpeed();

    expect(speed).toBe(120);
  });

  test('超过最低门槛的 level 也返回 120ms', () => {
    // level = 60 时：1000 - 59 * 15 = 115 → max(120, 115) = 120
    Game.store.getLevel.mockReturnValue(60);
    const speed = getSpeed();
    expect(speed).toBe(120);
  });

  // ========== 单调递减 ==========
  test('等级越高速度越快（数值越小）', () => {
    const speeds = [];

    for (let level = 1; level <= 30; level++) {
      Game.store.getLevel.mockReturnValue(level);
      speeds.push(getSpeed());
    }

    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeLessThanOrEqual(speeds[i - 1]);
    }
  });

  // ========== 边界值 ==========
  test('level 0 的情况（防御性）', () => {
    Game.store.getLevel.mockReturnValue(0);
    const speed = getSpeed();

    // 1000 - (-1) * 15 = 1015 → max(120, 1015) = 1015
    expect(speed).toBe(1015);
  });

  test('level 为负数', () => {
    Game.store.getLevel.mockReturnValue(-5);
    const speed = getSpeed();

    // 1000 - (-6) * 15 = 1090
    expect(speed).toBe(1090);
  });
});
