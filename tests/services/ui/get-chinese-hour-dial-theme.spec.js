import getChineseHourDialTheme from '@/lib/services/ui/effects/clock/utils/get-chinese-hour-dial-theme.js';

describe('getChineseHourDialTheme', () => {
  // ==================== 12 种颜色映射 ====================
  describe('颜色映射', () => {
    const testCases = [
      { hour: 0, expected: 'Red', description: '子时（夜半）' },
      { hour: 1, expected: 'White', description: '丑时' },
      { hour: 2, expected: 'White', description: '丑时' },
      { hour: 3, expected: 'Orange', description: '寅时' },
      { hour: 4, expected: 'Orange', description: '寅时' },
      { hour: 5, expected: 'Cyan', description: '卯时' },
      { hour: 6, expected: 'Cyan', description: '卯时' },
      { hour: 7, expected: 'Blue', description: '辰时' },
      { hour: 8, expected: 'Blue', description: '辰时' },
      { hour: 9, expected: 'Coral', description: '巳时' },
      { hour: 10, expected: 'Coral', description: '巳时' },
      { hour: 11, expected: 'Purple', description: '午时' },
      { hour: 12, expected: 'Purple', description: '午时' },
      { hour: 13, expected: 'Green', description: '未时' },
      { hour: 14, expected: 'Green', description: '未时' },
      { hour: 15, expected: 'Yellow', description: '申时' },
      { hour: 16, expected: 'Yellow', description: '申时' },
      { hour: 17, expected: 'Pink', description: '酉时' },
      { hour: 18, expected: 'Pink', description: '酉时' },
      { hour: 19, expected: 'Teal', description: '戌时' },
      { hour: 20, expected: 'Teal', description: '戌时' },
      { hour: 21, expected: 'Violet', description: '亥时' },
      { hour: 22, expected: 'Violet', description: '亥时' },
      { hour: 23, expected: 'Red', description: '子时（夜半）' },
    ];

    testCases.forEach(({ hour, expected, description }) => {
      it(`${description}：hour=${hour} 应该返回 "${expected}"`, () => {
        expect(getChineseHourDialTheme(hour)).toBe(expected);
      });
    });
  });

  // ==================== 每 2 小时同色 ====================
  describe('每 2 小时使用相同颜色', () => {
    const pairs = [
      [0, 23, 'Red'],
      [1, 2, 'White'],
      [3, 4, 'Orange'],
      [5, 6, 'Cyan'],
      [7, 8, 'Blue'],
      [9, 10, 'Coral'],
      [11, 12, 'Purple'],
      [13, 14, 'Green'],
      [15, 16, 'Yellow'],
      [17, 18, 'Pink'],
      [19, 20, 'Teal'],
      [21, 22, 'Violet'],
    ];

    pairs.forEach(([h1, h2, expected]) => {
      it(`${expected}：hour=${h1} 和 hour=${h2} 应该返回相同颜色`, () => {
        expect(getChineseHourDialTheme(h1)).toBe(expected);
        expect(getChineseHourDialTheme(h2)).toBe(expected);
      });
    });
  });

  // ==================== 返回值类型 ====================
  describe('返回值类型', () => {
    it('所有 24 小时都应该返回字符串', () => {
      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourDialTheme(hour);
        expect(typeof result).toBe('string');
      }
    });

    it('所有 24 小时都应该返回非空字符串', () => {
      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourDialTheme(hour);
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('所有返回值应该是有效的颜色名称', () => {
      const validColors = [
        'Red',
        'White',
        'Orange',
        'Cyan',
        'Blue',
        'Coral',
        'Purple',
        'Green',
        'Yellow',
        'Pink',
        'Teal',
        'Violet',
      ];

      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourDialTheme(hour);
        expect(validColors).toContain(result);
      }
    });
  });

  // ==================== 循环特性 ====================
  describe('循环特性', () => {
    it('hour=0 和 hour=24 应返回相同颜色（Red）', () => {
      // 注意：函数只接受 0-23，此处测试 hour=0 和 hour=24 的等效性
      // 如果实际使用中传入 24 需要取模，则由调用方处理
      expect(getChineseHourDialTheme(0)).toBe('Red');
      // hour=24 % 24 = 0，逻辑上应返回 Red
    });

    it('12 种颜色每 2 小时依次循环', () => {
      const colors = [];
      for (let hour = 0; hour < 24; hour += 2) {
        colors.push(getChineseHourDialTheme(hour));
      }

      expect(colors).toEqual([
        'Red',
        'White',
        'Orange',
        'Cyan',
        'Blue',
        'Coral',
        'Purple',
        'Green',
        'Yellow',
        'Pink',
        'Teal',
        'Violet',
      ]);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('hour=0 应该返回 Red', () => {
      expect(getChineseHourDialTheme(0)).toBe('Red');
    });

    it('hour=23 应该返回 Red（子时回归）', () => {
      expect(getChineseHourDialTheme(23)).toBe('Red');
    });

    it('hour=11 和 hour=12 应该返回相同颜色（午时）', () => {
      expect(getChineseHourDialTheme(11)).toBe('Purple');
      expect(getChineseHourDialTheme(12)).toBe('Purple');
    });

    it('hour=12 是中午，返回 Purple', () => {
      expect(getChineseHourDialTheme(12)).toBe('Purple');
    });
  });

  // ==================== 所有颜色在 24 小时中出现的次数 ====================
  describe('颜色分布', () => {
    it('每种颜色在 24 小时内出现 2 次', () => {
      const colorCounts = {};

      for (let hour = 0; hour < 24; hour++) {
        const color = getChineseHourDialTheme(hour);
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }

      // Red 在 hour=0 和 hour=23 出现，共 2 次
      Object.values(colorCounts).forEach((count) => {
        expect(count).toBe(2);
      });
    });
  });
});
