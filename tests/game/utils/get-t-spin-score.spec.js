import getTSpinScore from '@/lib/game/utils/get-t-spin-score.js';

describe('getTSpinScore', () => {
  // ==================== T-Spin ====================
  describe('T-Spin', () => {
    it('消除 0 行 → 400', () => {
      expect(getTSpinScore(0, true, false)).toBe(400);
    });

    it('消除 1 行 → 800', () => {
      expect(getTSpinScore(1, true, false)).toBe(800);
    });

    it('消除 2 行 → 1200', () => {
      expect(getTSpinScore(2, true, false)).toBe(1200);
    });

    it('消除 3 行 → 1600', () => {
      expect(getTSpinScore(3, true, false)).toBe(1600);
    });

    it('消除 4 行（超范围）→ 0', () => {
      expect(getTSpinScore(4, true, false)).toBe(0);
    });
  });

  // ==================== T-Spin Mini ====================
  describe('T-Spin Mini', () => {
    it('消除 0 行 → 100', () => {
      expect(getTSpinScore(0, false, true)).toBe(100);
    });

    it('消除 1 行 → 200', () => {
      expect(getTSpinScore(1, false, true)).toBe(200);
    });

    it('消除 2 行 → 400', () => {
      expect(getTSpinScore(2, false, true)).toBe(400);
    });

    it('消除 3 行（超范围）→ 0', () => {
      expect(getTSpinScore(3, false, true)).toBe(0);
    });
  });

  // ==================== 非 T-Spin ====================
  describe('非 T-Spin', () => {
    it('两个都为 false → 0', () => {
      expect(getTSpinScore(2, false, false)).toBe(0);
    });

    it('消除 0 行且非 T-Spin → 0', () => {
      expect(getTSpinScore(0, false, false)).toBe(0);
    });

    it('消除 4 行且非 T-Spin → 0', () => {
      expect(getTSpinScore(4, false, false)).toBe(0);
    });
  });

  // ==================== 优先级 ====================
  describe('优先级', () => {
    it('T-Spin 优先于 T-Spin Mini', () => {
      // 两者都为 true 时，返回 T-Spin 分数
      expect(getTSpinScore(1, true, true)).toBe(800);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('负数消除行数 → 0', () => {
      expect(getTSpinScore(-1, true, false)).toBe(0);
    });

    it('undefined cleared → 0', () => {
      expect(getTSpinScore(undefined, true, false)).toBe(0);
    });

    it('null cleared → 0', () => {
      expect(getTSpinScore(null, true, false)).toBe(0);
    });
  });
});
