import getSpeed from '@/lib/game/rules/get-speed.js';

describe('getSpeed', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getLevel: jest.fn(),
    };

    mockContext = {
      Store: mockStore,
      Level: {
        max: 15,
      },
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该调用 Store.getLevel 获取当前等级', () => {
      mockStore.getLevel.mockReturnValue(1);

      getSpeed(mockContext);

      expect(mockStore.getLevel).toHaveBeenCalled();
    });

    it('应该返回数字类型', () => {
      mockStore.getLevel.mockReturnValue(1);

      const result = getSpeed(mockContext);

      expect(typeof result).toBe('number');
    });
  });

  // ==================== 速度计算 ====================
  describe('速度计算', () => {
    it('等级 1 时应该返回 1000ms', () => {
      mockStore.getLevel.mockReturnValue(1);

      const result = getSpeed(mockContext);

      expect(result).toBe(1000);
    });

    it('等级 2 时速度应该比等级 1 快', () => {
      mockStore.getLevel.mockReturnValue(1);
      const speed1 = getSpeed(mockContext);

      mockStore.getLevel.mockReturnValue(2);
      const speed2 = getSpeed(mockContext);

      expect(speed2).toBeLessThan(speed1);
    });

    it('等级越高速度应该越快（值越小）', () => {
      const speeds = [];

      for (let level = 1; level <= 10; level++) {
        mockStore.getLevel.mockReturnValue(level);
        speeds.push(getSpeed(mockContext));
      }

      for (let i = 1; i < speeds.length; i++) {
        expect(speeds[i]).toBeLessThanOrEqual(speeds[i - 1]);
      }
    });

    it('等级递增速度应该平滑递减', () => {
      mockStore.getLevel.mockReturnValue(1);
      const speed1 = getSpeed(mockContext);

      mockStore.getLevel.mockReturnValue(2);
      const speed2 = getSpeed(mockContext);

      const step = Math.ceil(1000 / Math.floor(15 * 0.7));
      expect(speed1 - speed2).toBe(step);
    });
  });

  // ==================== 最低速度限制 ====================
  describe('最低速度限制', () => {
    it('速度不应该低于 120ms', () => {
      mockStore.getLevel.mockReturnValue(99);

      const result = getSpeed(mockContext);

      expect(result).toBeGreaterThanOrEqual(120);
    });

    it('刚好等于 120 时应该返回 120', () => {
      const max = 15;
      const step = Math.ceil(1000 / Math.floor(max * 0.7));
      const targetLevel = Math.floor(880 / step) + 1;

      mockStore.getLevel.mockReturnValue(targetLevel);

      const result = getSpeed(mockContext);

      expect(result).toBeGreaterThanOrEqual(120);
    });
  });

  // ==================== 不同 max 配置 ====================
  describe('不同 max 配置', () => {
    it('max = 10 时 step 应该不同', () => {
      mockContext.Level.max = 10;
      mockStore.getLevel.mockReturnValue(1);

      const result = getSpeed(mockContext);

      expect(result).toBe(1000);
    });

    it('max = 20 时 step 应该不同', () => {
      mockContext.Level.max = 20;
      mockStore.getLevel.mockReturnValue(1);

      const result = getSpeed(mockContext);

      expect(result).toBe(1000);
    });

    it('不同 max 配置下升级速度递减应该不同', () => {
      mockContext.Level.max = 10;
      mockStore.getLevel.mockReturnValue(1);
      const speed1 = getSpeed(mockContext);

      mockStore.getLevel.mockReturnValue(2);
      const speed2 = getSpeed(mockContext);

      expect(speed1 - speed2).toBe(143);

      mockContext.Level.max = 20;
      mockStore.getLevel.mockReturnValue(1);
      const speed3 = getSpeed(mockContext);

      mockStore.getLevel.mockReturnValue(2);
      const speed4 = getSpeed(mockContext);

      expect(speed3 - speed4).toBe(72);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('level 为 0 时应该正常计算', () => {
      mockStore.getLevel.mockReturnValue(0);

      const result = getSpeed(mockContext);

      expect(result).toBeGreaterThanOrEqual(120);
    });

    it('level 为负数时应该不低于 120', () => {
      mockStore.getLevel.mockReturnValue(-5);

      const result = getSpeed(mockContext);

      expect(result).toBeGreaterThanOrEqual(120);
    });

    it('max 为 1 时不应该除零', () => {
      mockContext.Level.max = 1;
      mockStore.getLevel.mockReturnValue(1);

      expect(() => {
        getSpeed(mockContext);
      }).not.toThrow();
    });

    it('max 很大时应该正常计算', () => {
      mockContext.Level.max = 99;
      mockStore.getLevel.mockReturnValue(50);

      const result = getSpeed(mockContext);

      expect(result).toBeGreaterThanOrEqual(120);
    });
  });
});
