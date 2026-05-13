/** @jest-environment jsdom */

import generateGarbageRows from '@/lib/state/utils/generate-garbage-rows.js';

// Mock COLORS
jest.mock('@/lib/constants/colors.js', () => ({
  __esModule: true,
  default: {
    RED: '#FF0000',
    GREEN: '#00FF00',
    BLUE: '#0000FF',
    YELLOW: '#FFFF00',
    PURPLE: '#800080',
    TEAL: '#008080',
    ORANGE: '#FFA500',
  },
}));

describe('generateGarbageRows', () => {
  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该生成指定行数的垃圾行', () => {
      const result = generateGarbageRows(3, 10);

      expect(result).toHaveLength(3);
    });

    it('每行应该包含指定列数', () => {
      const result = generateGarbageRows(2, 10);

      result.forEach((row) => {
        expect(row).toHaveLength(10);
      });
    });

    it('每行应该至少有一个空洞', () => {
      const result = generateGarbageRows(5, 10);

      result.forEach((row) => {
        const emptyCount = row.filter((cell) => cell === '').length;
        expect(emptyCount).toBeGreaterThanOrEqual(1);
      });
    });

    it('每行应该至少保留 3 个填满的格子', () => {
      const result = generateGarbageRows(5, 10);

      result.forEach((row) => {
        const filledCount = row.filter((cell) => cell !== '').length;
        expect(filledCount).toBeGreaterThanOrEqual(3);
      });
    });

    it('空洞数应该在 1 到 cols-3 之间', () => {
      const result = generateGarbageRows(10, 10);

      result.forEach((row) => {
        const holes = row.filter((cell) => cell === '').length;
        expect(holes).toBeGreaterThanOrEqual(1);
        expect(holes).toBeLessThanOrEqual(7); // cols - 3 = 7
      });
    });
  });

  // ==================== 颜色使用 ====================
  describe('颜色使用', () => {
    it('填满的格子应该使用颜色映射中的颜色', () => {
      const colorMap = ['#FF0000', '#00FF00', '#0000FF'];
      const result = generateGarbageRows(5, 10, colorMap);

      result.forEach((row) => {
        row.forEach((cell) => {
          if (cell !== '') {
            expect(colorMap).toContain(cell);
          }
        });
      });
    });

    it('未提供颜色映射时应该使用默认颜色', () => {
      const defaultColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#800080', '#008080', '#FFA500'];
      const result = generateGarbageRows(3, 10);

      result.forEach((row) => {
        row.forEach((cell) => {
          if (cell !== '') {
            expect(defaultColors).toContain(cell);
          }
        });
      });
    });

    it('空洞位置应该为空字符串', () => {
      const result = generateGarbageRows(3, 10);

      result.forEach((row) => {
        row.forEach((cell) => {
          if (cell === '') {
            expect(cell).toBe('');
          }
        });
      });
    });
  });

  // ==================== 随机性 ====================
  describe('随机性', () => {
    it('两次生成的结果应该不同（空洞位置随机）', () => {
      const result1 = generateGarbageRows(1, 10);
      const result2 = generateGarbageRows(1, 10);

      // 由于随机性，两次结果很可能不同
      // 但有可能碰巧相同，多次尝试
      let different = false;
      for (let i = 0; i < 10; i++) {
        const r1 = generateGarbageRows(1, 10);
        const r2 = generateGarbageRows(1, 10);
        if (JSON.stringify(r1) !== JSON.stringify(r2)) {
          different = true;
          break;
        }
      }

      expect(different).toBe(true);
    });

    it('多行之间空洞位置应该不同', () => {
      const result = generateGarbageRows(10, 10);

      // 收集所有行的空洞位置
      const holePatterns = result.map((row) => {
        return row
          .map((cell, i) => (cell === '' ? i : -1))
          .filter((i) => i !== -1)
          .join(',');
      });

      // 去重后应该有多于一种模式
      const uniquePatterns = new Set(holePatterns);
      expect(uniquePatterns.size).toBeGreaterThan(1);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('rows 为 0 时应该返回空数组', () => {
      const result = generateGarbageRows(0, 10);

      expect(result).toEqual([]);
    });

    it('cols 较小时空洞数应该是 1', () => {
      // cols = 4，maxHoles = 4 - 3 = 1
      // holes = 1 + Math.floor(random * 1) = 1
      const result = generateGarbageRows(3, 4);

      result.forEach((row) => {
        const holes = row.filter((cell) => cell === '').length;
        expect(holes).toBe(1);
      });
    });

    it('rows 为负数时应该返回空数组', () => {
      const result = generateGarbageRows(-5, 10);

      expect(result).toEqual([]);
    });

    it('cols 为 0 时应该生成全空', () => {
      const result = generateGarbageRows(2, 0);

      result.forEach((row) => {
        expect(row).toHaveLength(0);
      });
    });
  });

  // ==================== 数据结构 ====================
  describe('数据结构', () => {
    it('返回的应该是二维数组', () => {
      const result = generateGarbageRows(3, 10);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((row) => {
        expect(Array.isArray(row)).toBe(true);
      });
    });

    it('每个元素应该是字符串', () => {
      const result = generateGarbageRows(3, 10);

      result.forEach((row) => {
        row.forEach((cell) => {
          expect(typeof cell).toBe('string');
        });
      });
    });

    it('不应该修改传入的颜色映射数组', () => {
      const colorMap = ['#FF0000', '#00FF00'];
      const originalLength = colorMap.length;

      generateGarbageRows(3, 10, colorMap);

      expect(colorMap).toHaveLength(originalLength);
    });
  });
});
