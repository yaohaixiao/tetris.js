import getChineseHourAnimal from '@/lib/services/ui/image/utils/get-chinese-hour-animal.js';

describe('getChineseHourAnimal', () => {
  // ==================== 12 生肖动物映射 ====================
  describe('生肖动物映射', () => {
    const testCases = [
      { hour: 0, expected: 'rat', description: '子时（鼠）' },
      { hour: 1, expected: 'ox', description: '丑时（牛）' },
      { hour: 2, expected: 'ox', description: '丑时（牛）' },
      { hour: 3, expected: 'tiger', description: '寅时（虎）' },
      { hour: 4, expected: 'tiger', description: '寅时（虎）' },
      { hour: 5, expected: 'rabbit', description: '卯时（兔）' },
      { hour: 6, expected: 'rabbit', description: '卯时（兔）' },
      { hour: 7, expected: 'dragon', description: '辰时（龙）' },
      { hour: 8, expected: 'dragon', description: '辰时（龙）' },
      { hour: 9, expected: 'snake', description: '巳时（蛇）' },
      { hour: 10, expected: 'snake', description: '巳时（蛇）' },
      { hour: 11, expected: 'horse', description: '午时（马）' },
      { hour: 12, expected: 'horse', description: '午时（马）' },
      { hour: 13, expected: 'goat', description: '未时（羊）' },
      { hour: 14, expected: 'goat', description: '未时（羊）' },
      { hour: 15, expected: 'monkey', description: '申时（猴）' },
      { hour: 16, expected: 'monkey', description: '申时（猴）' },
      { hour: 17, expected: 'rooster', description: '酉时（鸡）' },
      { hour: 18, expected: 'rooster', description: '酉时（鸡）' },
      { hour: 19, expected: 'dog', description: '戌时（狗）' },
      { hour: 20, expected: 'dog', description: '戌时（狗）' },
      { hour: 21, expected: 'pig', description: '亥时（猪）' },
      { hour: 22, expected: 'pig', description: '亥时（猪）' },
      { hour: 23, expected: 'rat', description: '子时（鼠）' },
    ];

    testCases.forEach(({ hour, expected, description }) => {
      it(`${description}：hour=${hour} 应该返回 "${expected}"`, () => {
        expect(getChineseHourAnimal(hour)).toBe(expected);
      });
    });
  });

  // ==================== 每 2 小时同动物 ====================
  describe('每 2 小时使用相同动物', () => {
    const pairs = [
      [0, 23, 'rat'],
      [1, 2, 'ox'],
      [3, 4, 'tiger'],
      [5, 6, 'rabbit'],
      [7, 8, 'dragon'],
      [9, 10, 'snake'],
      [11, 12, 'horse'],
      [13, 14, 'goat'],
      [15, 16, 'monkey'],
      [17, 18, 'rooster'],
      [19, 20, 'dog'],
      [21, 22, 'pig'],
    ];

    pairs.forEach(([h1, h2, expected]) => {
      it(`${expected}：hour=${h1} 和 hour=${h2} 应该返回相同动物`, () => {
        expect(getChineseHourAnimal(h1)).toBe(expected);
        expect(getChineseHourAnimal(h2)).toBe(expected);
      });
    });
  });

  // ==================== 返回值类型 ====================
  describe('返回值类型', () => {
    it('所有 24 小时都应该返回字符串', () => {
      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourAnimal(hour);
        expect(typeof result).toBe('string');
      }
    });

    it('所有 24 小时都应该返回非空字符串', () => {
      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourAnimal(hour);
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('所有返回值应该是有效的生肖动物名称', () => {
      const validAnimals = [
        'rat',
        'ox',
        'tiger',
        'rabbit',
        'dragon',
        'snake',
        'horse',
        'goat',
        'monkey',
        'rooster',
        'dog',
        'pig',
      ];

      for (let hour = 0; hour < 24; hour++) {
        const result = getChineseHourAnimal(hour);
        expect(validAnimals).toContain(result);
      }
    });
  });

  // ==================== 12 生肖依次循环 ====================
  describe('12 生肖依次循环', () => {
    it('每 2 小时依次出现 12 个不同的生肖动物', () => {
      const animals = [];
      for (let hour = 0; hour < 24; hour += 2) {
        animals.push(getChineseHourAnimal(hour));
      }

      expect(animals).toEqual([
        'rat',
        'ox',
        'tiger',
        'rabbit',
        'dragon',
        'snake',
        'horse',
        'goat',
        'monkey',
        'rooster',
        'dog',
        'pig',
      ]);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('hour=0 应该返回 rat（子时鼠）', () => {
      expect(getChineseHourAnimal(0)).toBe('rat');
    });

    it('hour=23 应该返回 rat（子时回归）', () => {
      expect(getChineseHourAnimal(23)).toBe('rat');
    });

    it('hour=11 和 hour=12 应该返回 horse（午时马）', () => {
      expect(getChineseHourAnimal(11)).toBe('horse');
      expect(getChineseHourAnimal(12)).toBe('horse');
    });

    it('hour=12 中午应该返回 horse', () => {
      expect(getChineseHourAnimal(12)).toBe('horse');
    });
  });

  // ==================== 每个动物出现次数 ====================
  describe('动物分布', () => {
    it('每种生肖动物在 24 小时内出现 2 次', () => {
      const animalCounts = {};

      for (let hour = 0; hour < 24; hour++) {
        const animal = getChineseHourAnimal(hour);
        animalCounts[animal] = (animalCounts[animal] || 0) + 1;
      }

      // rat 在 hour=0 和 hour=23 出现，共 2 次
      Object.values(animalCounts).forEach((count) => {
        expect(count).toBe(2);
      });
    });
  });
});
