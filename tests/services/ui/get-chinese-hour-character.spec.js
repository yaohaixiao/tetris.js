import getChineseHourCharacter from '@/lib/services/ui/image/utils/get-chinese-hour-character.js';

describe('getChineseHourCharacter', () => {
  // ==================== 12 时辰字符映射 ====================
  describe('时辰字符映射', () => {
    const testCases = [
      { hour: 0, expected: 'zi', description: '子时（夜半）' },
      { hour: 1, expected: 'chou', description: '丑时' },
      { hour: 2, expected: 'chou', description: '丑时' },
      { hour: 3, expected: 'yin', description: '寅时' },
      { hour: 4, expected: 'yin', description: '寅时' },
      { hour: 5, expected: 'mao', description: '卯时' },
      { hour: 6, expected: 'mao', description: '卯时' },
      { hour: 7, expected: 'chen', description: '辰时' },
      { hour: 8, expected: 'chen', description: '辰时' },
      { hour: 9, expected: 'si', description: '巳时' },
      { hour: 10, expected: 'si', description: '巳时' },
      { hour: 11, expected: 'wu', description: '午时' },
      { hour: 12, expected: 'wu', description: '午时' },
      { hour: 13, expected: 'wei', description: '未时' },
      { hour: 14, expected: 'wei', description: '未时' },
      { hour: 15, expected: 'shen', description: '申时' },
      { hour: 16, expected: 'shen', description: '申时' },
      { hour: 17, expected: 'you', description: '酉时' },
      { hour: 18, expected: 'you', description: '酉时' },
      { hour: 19, expected: 'xu', description: '戌时' },
      { hour: 20, expected: 'xu', description: '戌时' },
      { hour: 21, expected: 'hai', description: '亥时' },
      { hour: 22, expected: 'hai', description: '亥时' },
      { hour: 23, expected: 'zi', description: '子时（夜半）' },
    ];

    testCases.forEach(({ hour, expected, description }) => {
      it(`${description}：hour=${hour} 应该返回 "${expected}"`, () => {
        expect(getChineseHourCharacter(hour)).toBe(expected);
      });
    });
  });

  // ==================== 每 2 小时同字符 ====================
  describe('每 2 小时使用相同字符', () => {
    const pairs = [
      [0, 23, 'zi'],
      [1, 2, 'chou'],
      [3, 4, 'yin'],
      [5, 6, 'mao'],
      [7, 8, 'chen'],
      [9, 10, 'si'],
      [11, 12, 'wu'],
      [13, 14, 'wei'],
      [15, 16, 'shen'],
      [17, 18, 'you'],
      [19, 20, 'xu'],
      [21, 22, 'hai'],
    ];

    pairs.forEach(([h1, h2, expected]) => {
      it(`${expected}：hour=${h1} 和 hour=${h2} 应该返回相同字符`, () => {
        expect(getChineseHourCharacter(h1)).toBe(expected);
        expect(getChineseHourCharacter(h2)).toBe(expected);
      });
    });
  });

  // ==================== 返回值类型 ====================
  describe('返回值类型', () => {
    it('所有 24 小时都应该返回字符串', () => {
      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourCharacter(hour);
        expect(typeof result).toBe('string');
      }
    });

    it('所有 24 小时都应该返回非空字符串', () => {
      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourCharacter(hour);
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('所有返回值应该是有效的时辰字符', () => {
      const validChars = [
        'zi',
        'chou',
        'yin',
        'mao',
        'chen',
        'si',
        'wu',
        'wei',
        'shen',
        'you',
        'xu',
        'hai',
      ];

      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourCharacter(hour);
        expect(validChars).toContain(result);
      }
    });
  });

  // ==================== 12 字符依次循环 ====================
  describe('12 字符依次循环', () => {
    it('每 2 小时依次出现 12 个不同的时辰字符', () => {
      const chars = [];
      for (let hour = 0; hour < 24; hour += 2) {
        chars.push(getChineseHourCharacter(hour));
      }

      expect(chars).toEqual([
        'zi',
        'chou',
        'yin',
        'mao',
        'chen',
        'si',
        'wu',
        'wei',
        'shen',
        'you',
        'xu',
        'hai',
      ]);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('hour=0 应该返回 zi（子时开始）', () => {
      expect(getChineseHourCharacter(0)).toBe('zi');
    });

    it('hour=23 应该返回 zi（子时回归）', () => {
      expect(getChineseHourCharacter(23)).toBe('zi');
    });

    it('hour=11 和 hour=12 应该返回 wu（午时）', () => {
      expect(getChineseHourCharacter(11)).toBe('wu');
      expect(getChineseHourCharacter(12)).toBe('wu');
    });

    it('hour=12 中午应该返回 wu', () => {
      expect(getChineseHourCharacter(12)).toBe('wu');
    });
  });

  // ==================== 每个字符出现次数 ====================
  describe('字符分布', () => {
    it('每种时辰字符在 24 小时内出现 2 次', () => {
      const charCounts = {};

      for (let hour = 0; hour < 24; hour++) {
        const char = getChineseHourCharacter(hour);
        charCounts[char] = (charCounts[char] || 0) + 1;
      }

      // zi 在 hour=0 和 hour=23 出现，共 2 次
      Object.values(charCounts).forEach((count) => {
        expect(count).toBe(2);
      });
    });
  });
});
