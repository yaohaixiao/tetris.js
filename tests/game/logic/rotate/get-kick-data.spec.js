/**
 * 测试根据方块类型获取对应墙踢数据的功能
 *
 * @file GetKickData 单元测试
 */

import getKickData from '@/lib/game/logic/rotate/get-kick-data.js';
import {
  KICK_I,
  KICK_I5,
  KICK_JLSZT,
} from '@/lib/game/constants/srs-kick-data.js';

// Mock SRS Kick Data
jest.mock('@/lib/game/constants/srs-kick-data.js', () => ({
  KICK_I: [
    [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  ],
  KICK_I5: [
    [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, 1],
      [1, -2],
    ],
    [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, -1],
      [-1, 2],
    ],
  ],
  KICK_JLSZT: [
    [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  ],
}));

describe('getKickData', () => {
  // ==================== I 型方块 ====================
  describe('I 型方块', () => {
    it('应该返回 KICK_I 数据', () => {
      const result = getKickData('I');
      expect(result).toBe(KICK_I);
    });

    it('返回的数据应该是三维数组', () => {
      const result = getKickData('I');
      expect(Array.isArray(result)).toBe(true);
      expect(Array.isArray(result[0])).toBe(true);
      expect(Array.isArray(result[0][0])).toBe(true);
    });

    it('返回的数据应该与 KICK_I 引用相同', () => {
      const result = getKickData('I');
      expect(result).toBe(KICK_I);
    });
  });

  // ==================== I5 型方块 ====================
  describe('I5 型方块', () => {
    it('应该返回 KICK_I5 数据', () => {
      const result = getKickData('I5');
      expect(result).toBe(KICK_I5);
    });

    it('I5 与 I 的墙踢数据应该不同', () => {
      expect(getKickData('I5')).not.toBe(getKickData('I'));
    });

    it('返回的数据应该是三维数组', () => {
      const result = getKickData('I5');
      expect(Array.isArray(result)).toBe(true);
      expect(Array.isArray(result[0])).toBe(true);
      expect(Array.isArray(result[0][0])).toBe(true);
    });
  });

  // ==================== O 型方块 ====================
  describe('O 型方块', () => {
    it('应该返回 null（O 型旋转后形状不变）', () => {
      const result = getKickData('O');
      expect(result).toBeNull();
    });

    it('O 型不应该有墙踢数据', () => {
      const result = getKickData('O');
      expect(result).toBeNull();
    });
  });

  // ==================== J/L/S/Z/T 型方块 ====================
  describe('J/L/S/Z/T 型方块', () => {
    const standardTypes = ['J', 'L', 'S', 'Z', 'T'];

    standardTypes.forEach((type) => {
      it(`${type} 型应该返回 KICK_JLSZT 数据`, () => {
        const result = getKickData(type);
        expect(result).toBe(KICK_JLSZT);
      });
    });

    it('所有 J/L/S/Z/T 应该共享同一份墙踢数据', () => {
      standardTypes.forEach((type) => {
        expect(getKickData(type)).toBe(KICK_JLSZT);
      });
    });

    standardTypes.forEach((type) => {
      it(`${type} 型返回的数据应该是三维数组`, () => {
        const result = getKickData(type);
        expect(Array.isArray(result)).toBe(true);
        expect(Array.isArray(result[0])).toBe(true);
        expect(Array.isArray(result[0][0])).toBe(true);
      });
    });
  });

  // ==================== 未知类型 ====================
  describe('未知/无效类型', () => {
    it('未知类型应该返回 KICK_JLSZT（默认值）', () => {
      const result = getKickData('UNKNOWN');
      expect(result).toBe(KICK_JLSZT);
    });

    it('空字符串应该返回 KICK_JLSZT', () => {
      const result = getKickData('');
      expect(result).toBe(KICK_JLSZT);
    });

    it('null 应该返回 KICK_JLSZT', () => {
      const result = getKickData(null);
      expect(result).toBe(KICK_JLSZT);
    });

    it('undefined 应该返回 KICK_JLSZT', () => {
      const result = getKickData(undefined);
      expect(result).toBe(KICK_JLSZT);
    });

    it('数字类型应该返回 KICK_JLSZT', () => {
      const result = getKickData(123);
      expect(result).toBe(KICK_JLSZT);
    });

    it('大小写敏感的匹配（小写 i 应该走默认分支）', () => {
      const result = getKickData('i');
      expect(result).toBe(KICK_JLSZT); // 不是 KICK_I
    });

    it('特殊字符应该返回 KICK_JLSZT', () => {
      const result = getKickData('!@#$');
      expect(result).toBe(KICK_JLSZT);
    });
  });

  // ==================== 所有有效类型对照验证 ====================
  describe('所有有效类型对照验证', () => {
    it('应该为每种类型返回正确的数据', () => {
      const expectedMap = {
        I: KICK_I,
        I5: KICK_I5,
        O: null,
        J: KICK_JLSZT,
        L: KICK_JLSZT,
        S: KICK_JLSZT,
        Z: KICK_JLSZT,
        T: KICK_JLSZT,
      };

      Object.entries(expectedMap).forEach(([type, expected]) => {
        const result = getKickData(type);
        if (expected === null) {
          expect(result).toBeNull();
        } else {
          expect(result).toBe(expected);
        }
      });
    });
  });

  // ==================== 数据完整性 ====================
  describe('数据完整性', () => {
    it('KICK_I 应该包含正确的偏移数据', () => {
      const data = getKickData('I');
      expect(data).toBe(KICK_I);
      // 验证数据结构
      expect(data.length).toBeGreaterThan(0);
      data.forEach((rotationGroup) => {
        expect(Array.isArray(rotationGroup)).toBe(true);
        rotationGroup.forEach((offset) => {
          expect(Array.isArray(offset)).toBe(true);
          expect(offset.length).toBe(2); // [dx, dy]
          expect(typeof offset[0]).toBe('number');
          expect(typeof offset[1]).toBe('number');
        });
      });
    });

    it('KICK_I5 应该包含正确的偏移数据', () => {
      const data = getKickData('I5');
      expect(data).toBe(KICK_I5);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((rotationGroup) => {
        expect(Array.isArray(rotationGroup)).toBe(true);
        rotationGroup.forEach((offset) => {
          expect(Array.isArray(offset)).toBe(true);
          expect(offset.length).toBe(2);
        });
      });
    });

    it('KICK_JLSZT 应该包含正确的偏移数据', () => {
      const data = getKickData('J');
      expect(data).toBe(KICK_JLSZT);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((rotationGroup) => {
        expect(Array.isArray(rotationGroup)).toBe(true);
        rotationGroup.forEach((offset) => {
          expect(Array.isArray(offset)).toBe(true);
          expect(offset.length).toBe(2);
        });
      });
    });
  });

  // ==================== 性能/稳定性 ====================
  describe('性能和稳定性', () => {
    it('多次调用应该返回相同引用（缓存测试）', () => {
      const result1 = getKickData('I');
      const result2 = getKickData('I');
      const result3 = getKickData('I');

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('不应该抛出异常', () => {
      const types = [
        'I',
        'I5',
        'O',
        'J',
        'L',
        'S',
        'Z',
        'T',
        '',
        null,
        undefined,
        'unknown',
      ];
      types.forEach((type) => {
        expect(() => getKickData(type)).not.toThrow();
      });
    });

    it('应该快速返回结果', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        getKickData('I');
        getKickData('I5');
        getKickData('O');
        getKickData('J');
        getKickData('T');
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // 1000 次调用应在 50ms 内完成
    });
  });
});
