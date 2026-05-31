import getWellBonus from '@/lib/ai/utils/get-well-bonus.js';

describe('getWellBonus', () => {
  // ==================== 无井 ====================
  describe('无井', () => {
    it('所有列高度相同应返回 0', () => {
      expect(getWellBonus([5, 5, 5, 5, 5])).toBe(0);
    });

    it('高度差不足 3 不应算井', () => {
      // 中间列低 2，不到阈值
      expect(getWellBonus([5, 3, 5])).toBe(0);
    });

    it('只有两列不应报错', () => {
      expect(getWellBonus([5, 5])).toBe(0);
    });

    it('空棋盘应返回 0', () => {
      expect(getWellBonus([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
    });
  });

  // ==================== 单个井 ====================
  describe('单个井', () => {
    it('中间列比两侧低 3 格应计为井', () => {
      // 深 4 × 0.8 = 3.2
      expect(getWellBonus([5, 1, 5])).toBeCloseTo(3.2, 2);
    });

    it('中间列比两侧低 5 格', () => {
      // 深 5 × 0.8 = 4.0
      expect(getWellBonus([5, 0, 5])).toBeCloseTo(4.0, 2);
    });

    it('两侧高度不同，取较矮的一侧算深度', () => {
      // min(8, 5) - 1 = 4, 4 × 0.8 = 3.2
      expect(getWellBonus([8, 1, 5])).toBeCloseTo(3.2, 2);
    });
  });

  // ==================== 多个井 ====================
  describe('多个井', () => {
    it('两个独立的井应累加', () => {
      // x=2: 深 4 × 0.8 = 3.2
      // x=6: 深 4 × 0.8 = 3.2
      // 总共 6.4
      expect(getWellBonus([5, 5, 1, 5, 5, 5, 1, 5, 5])).toBeCloseTo(6.4, 2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('最左列（x=0）不应检测', () => {
      // x=0 比 x=1 低很多，但不检测
      expect(getWellBonus([0, 5, 5, 5, 5])).toBe(0);
    });

    it('最右列（x=cols-1）不应检测', () => {
      expect(getWellBonus([5, 5, 5, 5, 0])).toBe(0);
    });

    it('相邻列也是井不互相干扰', () => {
      // x=2: min(5,1)-0=1，不够阈值 3
      // x=3: min(0,5)-1=-1，cur 不小于两侧
      expect(getWellBonus([5, 5, 0, 1, 5])).toBe(0);
    });
  });
});
