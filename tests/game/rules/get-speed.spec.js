import getSpeed from '@/lib/game/rules/get-speed.js';

// Mock GAME 常量，包含 MAX_LEVEL 和 SPEED_STEPS
jest.mock('@/lib/game/constants/game.js', () => ({
  __esModule: true,
  default: {
    MAX_LEVEL: 256,
    SPEED_STEPS: {
      EASY: 0.6,
      NORMAL: 0.4,
      HARD: 0.2,
      EXPERT: 0.1,
    },
  },
}));

describe('getSpeed', () => {
  let mockContext;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getLevel: jest.fn(),
      getDifficulty: jest.fn(),
    };

    mockContext = { Store: mockStore };
  });

  // ==================== 基本功能 ====================

  describe('基本功能', () => {
    it('应该调用 Store.getLevel', () => {
      mockStore.getLevel.mockReturnValue(1);
      mockStore.getDifficulty.mockReturnValue('easy');

      getSpeed(mockContext);

      expect(mockStore.getLevel).toHaveBeenCalled();
    });

    it('应该调用 Store.getDifficulty', () => {
      mockStore.getLevel.mockReturnValue(1);
      mockStore.getDifficulty.mockReturnValue('easy');

      getSpeed(mockContext);

      expect(mockStore.getDifficulty).toHaveBeenCalled();
    });

    it('应该返回数字', () => {
      mockStore.getLevel.mockReturnValue(1);
      mockStore.getDifficulty.mockReturnValue('easy');

      expect(typeof getSpeed(mockContext)).toBe('number');
    });
  });

  // ==================== EASY 难度速度曲线（step = 7） ====================

  describe('EASY 难度（step = 7）', () => {
    beforeEach(() => {
      mockStore.getDifficulty.mockReturnValue('easy');
    });

    // step = ceil(1000 / floor(256 × 0.6))
    //      = ceil(1000 / 153)
    //      = ceil(6.53...)
    //      = 7

    it('等级 1 = 1000ms', () => {
      mockStore.getLevel.mockReturnValue(1);
      expect(getSpeed(mockContext)).toBe(1000);
    });

    it('等级 2 比等级 1 快 7ms', () => {
      mockStore.getLevel.mockReturnValue(1);
      const s1 = getSpeed(mockContext);
      mockStore.getLevel.mockReturnValue(2);
      const s2 = getSpeed(mockContext);
      expect(s1 - s2).toBe(7);
    });

    it('等级 50 = 657ms', () => {
      mockStore.getLevel.mockReturnValue(50);
      // 1000 - 49×7 = 1000 - 343 = 657
      expect(getSpeed(mockContext)).toBe(657);
    });

    it('等级 100 = 307ms', () => {
      mockStore.getLevel.mockReturnValue(100);
      // 1000 - 99×7 = 1000 - 693 = 307
      expect(getSpeed(mockContext)).toBe(307);
    });

    it('等级 126 = 125ms', () => {
      mockStore.getLevel.mockReturnValue(126);
      // 1000 - 125×7 = 1000 - 875 = 125
      expect(getSpeed(mockContext)).toBe(125);
    });

    it('等级 127 = 120ms（触底）', () => {
      mockStore.getLevel.mockReturnValue(127);
      // 1000 - 126×7 = 1000 - 882 = 118 → max(120, 118) = 120
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

  // ==================== NORMAL 难度速度曲线（step = 10） ====================

  describe('NORMAL 难度（step = 10）', () => {
    beforeEach(() => {
      mockStore.getDifficulty.mockReturnValue('normal');
    });

    // step = ceil(1000 / floor(256 × 0.4))
    //      = ceil(1000 / 102)
    //      = ceil(9.80...)
    //      = 10

    it('等级 1 = 1000ms', () => {
      mockStore.getLevel.mockReturnValue(1);
      expect(getSpeed(mockContext)).toBe(1000);
    });

    it('等级 50 = 510ms', () => {
      mockStore.getLevel.mockReturnValue(50);
      // 1000 - 49×10 = 1000 - 490 = 510
      expect(getSpeed(mockContext)).toBe(510);
    });

    it('约 89 级触底 120ms', () => {
      mockStore.getLevel.mockReturnValue(89);
      // 1000 - 88×10 = 1000 - 880 = 120
      expect(getSpeed(mockContext)).toBe(120);

      mockStore.getLevel.mockReturnValue(90);
      // 1000 - 89×10 = 1000 - 890 = 110 → max(120, 110) = 120
      expect(getSpeed(mockContext)).toBe(120);
    });
  });

  // ==================== HARD 难度速度曲线（step = 20） ====================

  describe('HARD 难度（step = 20）', () => {
    beforeEach(() => {
      mockStore.getDifficulty.mockReturnValue('hard');
    });

    // step = ceil(1000 / floor(256 × 0.2))
    //      = ceil(1000 / 51)
    //      = ceil(19.60...)
    //      = 20

    it('等级 1 = 1000ms', () => {
      mockStore.getLevel.mockReturnValue(1);
      expect(getSpeed(mockContext)).toBe(1000);
    });

    it('等级 20 = 620ms', () => {
      mockStore.getLevel.mockReturnValue(20);
      // 1000 - 19×20 = 1000 - 380 = 620
      expect(getSpeed(mockContext)).toBe(620);
    });

    it('约 45 级触底 120ms', () => {
      mockStore.getLevel.mockReturnValue(45);
      // 1000 - 44×20 = 1000 - 880 = 120
      expect(getSpeed(mockContext)).toBe(120);

      mockStore.getLevel.mockReturnValue(46);
      // 1000 - 45×20 = 1000 - 900 = 100 → max(120, 100) = 120
      expect(getSpeed(mockContext)).toBe(120);
    });
  });

  // ==================== EXPERT 难度速度曲线（step = 40） ====================

  describe('EXPERT 难度（step = 40）', () => {
    beforeEach(() => {
      mockStore.getDifficulty.mockReturnValue('expert');
    });

    // step = ceil(1000 / floor(256 × 0.1))
    //      = ceil(1000 / 25)
    //      = 40

    it('等级 1 = 1000ms', () => {
      mockStore.getLevel.mockReturnValue(1);
      expect(getSpeed(mockContext)).toBe(1000);
    });

    it('等级 10 = 640ms', () => {
      mockStore.getLevel.mockReturnValue(10);
      // 1000 - 9×40 = 1000 - 360 = 640
      expect(getSpeed(mockContext)).toBe(640);
    });

    it('约 23 级触底 120ms', () => {
      mockStore.getLevel.mockReturnValue(23);
      // 1000 - 22×40 = 1000 - 880 = 120
      expect(getSpeed(mockContext)).toBe(120);

      mockStore.getLevel.mockReturnValue(24);
      // 1000 - 23×40 = 1000 - 920 = 80 → max(120, 80) = 120
      expect(getSpeed(mockContext)).toBe(120);
    });
  });

  // ==================== 难度对比 ====================

  describe('难度对比', () => {
    it('同等级下 EASY 最慢，EXPERT 最快', () => {
      // 等级 20，四个难度的速度对比
      mockStore.getLevel.mockReturnValue(20);

      mockStore.getDifficulty.mockReturnValue('easy');
      const easySpeed = getSpeed(mockContext);

      mockStore.getDifficulty.mockReturnValue('normal');
      const normalSpeed = getSpeed(mockContext);

      mockStore.getDifficulty.mockReturnValue('hard');
      const hardSpeed = getSpeed(mockContext);

      mockStore.getDifficulty.mockReturnValue('expert');
      const expertSpeed = getSpeed(mockContext);

      // EASY 间隔最大（最慢），EXPERT 间隔最小（最快）
      expect(easySpeed).toBeGreaterThan(normalSpeed);
      expect(normalSpeed).toBeGreaterThan(hardSpeed);
      expect(hardSpeed).toBeGreaterThan(expertSpeed);
    });

    it('EASY 触底最晚，EXPERT 触底最早', () => {
      // EASY 约 127 级触底
      mockStore.getDifficulty.mockReturnValue('easy');
      mockStore.getLevel.mockReturnValue(126);
      expect(getSpeed(mockContext)).toBe(125);
      mockStore.getLevel.mockReturnValue(127);
      expect(getSpeed(mockContext)).toBe(120);

      // EXPERT 约 23 级触底
      mockStore.getDifficulty.mockReturnValue('expert');
      mockStore.getLevel.mockReturnValue(22);
      expect(getSpeed(mockContext)).toBe(160);
      mockStore.getLevel.mockReturnValue(23);
      expect(getSpeed(mockContext)).toBe(120);
    });
  });

  // ==================== 边界情况 ====================

  describe('边界情况', () => {
    it('等级 0 = 1007ms（EASY）', () => {
      mockStore.getLevel.mockReturnValue(0);
      mockStore.getDifficulty.mockReturnValue('easy');
      // 1000 - (-1)×7 = 1007
      expect(getSpeed(mockContext)).toBe(1007);
    });

    it('不跌破 120ms（任意难度）', () => {
      const difficulties = ['easy', 'normal', 'hard', 'expert'];

      difficulties.forEach((difficulty) => {
        mockStore.getDifficulty.mockReturnValue(difficulty);
        mockStore.getLevel.mockReturnValue(999);
        expect(getSpeed(mockContext)).toBeGreaterThanOrEqual(120);
      });
    });

    it('难度大小写不敏感', () => {
      mockStore.getLevel.mockReturnValue(1);

      // 小写
      mockStore.getDifficulty.mockReturnValue('easy');
      const lower = getSpeed(mockContext);

      // 大写
      mockStore.getDifficulty.mockReturnValue('EASY');
      const upper = getSpeed(mockContext);

      expect(lower).toBe(upper);
    });

    it('返回整数', () => {
      mockStore.getLevel.mockReturnValue(50);
      mockStore.getDifficulty.mockReturnValue('easy');

      const speed = getSpeed(mockContext);
      expect(Number.isInteger(speed)).toBe(true);
    });
  });
});
