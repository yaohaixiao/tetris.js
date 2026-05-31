import calculateLevel from '@/lib/game/utils/calculate-level.js';

describe('calculateLevel', () => {
  const MAX_LEVEL = 256;

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('0 行时等级为 1', () => {
      const result = calculateLevel(0, MAX_LEVEL);
      expect(result.level).toBe(1);
    });

    it('9 行时等级仍为 1', () => {
      const result = calculateLevel(9, MAX_LEVEL);
      expect(result.level).toBe(1);
    });

    it('10 行时升级到 2', () => {
      const result = calculateLevel(10, MAX_LEVEL);
      expect(result.level).toBe(2);
    });

    it('应该返回当前升级步长', () => {
      const result = calculateLevel(0, MAX_LEVEL);
      expect(result).toHaveProperty('levelUpSteps');
      expect(typeof result.levelUpSteps).toBe('number');
    });
  });

  // ==================== 升级步长 ====================
  describe('升级步长', () => {
    it('等级 1 时升级步长为 10', () => {
      const result = calculateLevel(0, MAX_LEVEL);
      expect(result.levelUpSteps).toBe(10);
    });

    it('等级 2 时升级步长为 12', () => {
      const result = calculateLevel(10, MAX_LEVEL);
      expect(result.levelUpSteps).toBe(12);
    });

    it('等级 3 时升级步长为 14', () => {
      const result = calculateLevel(22, MAX_LEVEL);
      expect(result.levelUpSteps).toBe(14);
    });

    it('步长封顶为 60', () => {
      const result = calculateLevel(1000, MAX_LEVEL);
      expect(result.levelUpSteps).toBe(60);
    });
  });

  // ==================== 连续升级 ====================
  describe('连续升级', () => {
    it('累计 22 行时等级为 3', () => {
      const result = calculateLevel(22, MAX_LEVEL);
      expect(result.level).toBe(3);
    });

    it('累计 36 行时等级为 4', () => {
      const result = calculateLevel(36, MAX_LEVEL);
      expect(result.level).toBe(4);
    });

    it('累计 50 行时等级为 4', () => {
      const result = calculateLevel(50, MAX_LEVEL);
      expect(result.level).toBe(4);
    });

    it('累计 52 行时等级为 5', () => {
      const result = calculateLevel(52, MAX_LEVEL);
      expect(result.level).toBe(5);
    });

    it('累计 910 行时等级为 27（步长封顶后）', () => {
      const result = calculateLevel(910, MAX_LEVEL);
      expect(result.level).toBe(27);
      expect(result.levelUpSteps).toBe(60);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('刚好达到升级阈值时应该升级', () => {
      expect(calculateLevel(10, MAX_LEVEL).level).toBe(2);
      expect(calculateLevel(22, MAX_LEVEL).level).toBe(3);
      expect(calculateLevel(36, MAX_LEVEL).level).toBe(4);
      expect(calculateLevel(52, MAX_LEVEL).level).toBe(5);
    });

    it('差 1 行未达到阈值时不应升级', () => {
      expect(calculateLevel(9, MAX_LEVEL).level).toBe(1);
      expect(calculateLevel(21, MAX_LEVEL).level).toBe(2);
      expect(calculateLevel(35, MAX_LEVEL).level).toBe(3);
      expect(calculateLevel(51, MAX_LEVEL).level).toBe(4);
    });

    it('达到 maxLevel 时不再升级', () => {
      const result = calculateLevel(999999, 15);
      expect(result.level).toBe(15);
    });

    it('maxLevel 为 1 时等级保持 1', () => {
      const result = calculateLevel(100, 1);
      expect(result.level).toBe(1);
    });
  });

  // ==================== 返回值结构 ====================
  describe('返回值结构', () => {
    it('应该返回包含 level 和 levelUpSteps 的对象', () => {
      const result = calculateLevel(50, MAX_LEVEL);

      expect(result).toEqual({
        level: expect.any(Number),
        levelUpSteps: expect.any(Number),
      });
    });

    it('level 应该 >= 1', () => {
      for (const lines of [0, 5, 10, 100, 1000]) {
        const result = calculateLevel(lines, MAX_LEVEL);
        expect(result.level).toBeGreaterThanOrEqual(1);
      }
    });

    it('level 应该 <= maxLevel', () => {
      const maxLevel = 20;
      const result = calculateLevel(99999, maxLevel);
      expect(result.level).toBeLessThanOrEqual(maxLevel);
    });
  });

  // ==================== 典型值验证 ====================
  describe('典型值验证', () => {
    it.each([
      [0, 1, 10],
      [10, 2, 12],
      [22, 3, 14],
      [36, 4, 16],
      [52, 5, 18],
      [70, 6, 20],
      [90, 7, 22],
      [112, 8, 24],
      [136, 9, 26],
      [162, 10, 28],
      [910, 27, 60],
    ])('累计 %i 行 → 等级 %i，步长 %i', (totalLines, expectedLevel, expectedSteps) => {
      const result = calculateLevel(totalLines, MAX_LEVEL);
      expect(result.level).toBe(expectedLevel);
      expect(result.levelUpSteps).toBe(expectedSteps);
    });
  });
});
