import getSpeed from '@/lib/game/rules/get-speed.js';

jest.mock('@/lib/game/constants/game.js', () => ({
  __esModule: true,
  default: { MAX_LEVEL: 256 },
}));

describe('getSpeed', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getLevel: jest.fn(),
    };

    mockContext = { Store: mockStore };
  });

  describe('基本功能', () => {
    it('应该调用 Store.getLevel', () => {
      mockStore.getLevel.mockReturnValue(1);
      getSpeed(mockContext);
      expect(mockStore.getLevel).toHaveBeenCalled();
    });

    it('应该返回数字', () => {
      mockStore.getLevel.mockReturnValue(1);
      expect(typeof getSpeed(mockContext)).toBe('number');
    });
  });

  describe('速度曲线（MAX_LEVEL=256, 0.6）', () => {
    // step = ceil(1000 / floor(256 * 0.6))
    //      = ceil(1000 / 153)
    //      = ceil(6.53...)
    //      = 7

    it('step = 7', () => {
      mockStore.getLevel.mockReturnValue(1);
      const s1 = getSpeed(mockContext);
      mockStore.getLevel.mockReturnValue(2);
      const s2 = getSpeed(mockContext);
      expect(s1 - s2).toBe(7);
    });

    it('等级 1 = 1000ms', () => {
      mockStore.getLevel.mockReturnValue(1);
      expect(getSpeed(mockContext)).toBe(1000);
    });

    it('等级 50 = 657ms', () => {
      mockStore.getLevel.mockReturnValue(50);
      // 1000 - 49*7 = 1000 - 343 = 657
      expect(getSpeed(mockContext)).toBe(657);
    });

    it('等级 100 = 307ms', () => {
      mockStore.getLevel.mockReturnValue(100);
      // 1000 - 99*7 = 1000 - 693 = 307
      expect(getSpeed(mockContext)).toBe(307);
    });

    it('等级 126 = 125ms', () => {
      mockStore.getLevel.mockReturnValue(126);
      // 1000 - 125*7 = 1000 - 875 = 125
      expect(getSpeed(mockContext)).toBe(125);
    });

    it('等级 127 = 120ms（触底）', () => {
      mockStore.getLevel.mockReturnValue(127);
      // 1000 - 126*7 = 1000 - 882 = 118 → max(120, 118) = 120
      expect(getSpeed(mockContext)).toBe(120);
    });

    it('等级 200 = 120ms', () => {
      mockStore.getLevel.mockReturnValue(200);
      expect(getSpeed(mockContext)).toBe(120);
    });

    it('等级 256 = 120ms', () => {
      mockStore.getLevel.mockReturnValue(256);
      expect(getSpeed(mockContext)).toBe(120);
    });

    it('等级越高间隔越小', () => {
      mockStore.getLevel.mockReturnValue(1);
      const s1 = getSpeed(mockContext);
      mockStore.getLevel.mockReturnValue(50);
      const s50 = getSpeed(mockContext);
      mockStore.getLevel.mockReturnValue(100);
      const s100 = getSpeed(mockContext);

      expect(s50).toBeLessThan(s1);
      expect(s100).toBeLessThan(s50);
    });
  });

  describe('边界', () => {
    it('等级 0 = 1007ms', () => {
      mockStore.getLevel.mockReturnValue(0);
      // 1000 - (-1)*7 = 1007
      expect(getSpeed(mockContext)).toBe(1007);
    });

    it('不跌破 120ms', () => {
      mockStore.getLevel.mockReturnValue(999);
      expect(getSpeed(mockContext)).toBeGreaterThanOrEqual(120);
    });
  });
});
