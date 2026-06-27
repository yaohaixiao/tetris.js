import isNumber from '@/lib/utils/is-number.js';

describe('isNumber', () => {
  /* ========== 基础数字类型测试 ========== */

  describe('应该正确识别有效的数字', () => {
    test('正整数', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(999999)).toBe(true);
    });

    test('负整数', () => {
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(-0)).toBe(true);
      expect(isNumber(-999999)).toBe(true);
    });

    test('浮点数', () => {
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(-3.14)).toBe(true);
      expect(isNumber(0.0001)).toBe(true);
    });

    test('科学计数法', () => {
      expect(isNumber(1e5)).toBe(true);
      expect(isNumber(1e-5)).toBe(true);
      expect(isNumber(-1e5)).toBe(true);
    });

    test('最大/最小安全整数', () => {
      expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
    });
  });

  /* ========== 无效数字类型测试 ========== */

  describe('应该排除无效的数字', () => {
    test('NaN', () => {
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber(Number.NaN)).toBe(false);
    });

    test('Infinity', () => {
      expect(isNumber(Infinity)).toBe(false);
      expect(isNumber(-Infinity)).toBe(false);
      expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(false);
    });
  });

  /* ========== 非数字类型测试 ========== */

  describe('应该正确识别非数字类型', () => {
    test('字符串', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber('3.14')).toBe(false);
      expect(isNumber('abc')).toBe(false);
      expect(isNumber('')).toBe(false);
      expect(isNumber(' ')).toBe(false);
    });

    test('布尔值', () => {
      expect(isNumber(true)).toBe(false);
      expect(isNumber(false)).toBe(false);
    });

    test('null 和 undefined', () => {
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });

    test('对象', () => {
      expect(isNumber({})).toBe(false);
      expect(isNumber({ value: 123 })).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber([1, 2, 3])).toBe(false);
      expect(isNumber(new Number(123))).toBe(false); // Number 对象，不是原始类型
    });

    test('函数', () => {
      expect(isNumber(() => {})).toBe(false);
      expect(isNumber(function () {})).toBe(false);
    });

    test('Symbol', () => {
      expect(isNumber(Symbol('test'))).toBe(false);
      expect(isNumber(Symbol.iterator)).toBe(false);
    });

    test('日期对象', () => {
      expect(isNumber(new Date())).toBe(false);
    });

    test('正则表达式', () => {
      expect(isNumber(/regex/)).toBe(false);
    });
  });

  /* ========== 边界值测试 ========== */

  describe('应该正确处理边界值', () => {
    test('Number 相关常量', () => {
      expect(isNumber(Number.EPSILON)).toBe(true);
      expect(isNumber(Number.MAX_VALUE)).toBe(true);
      expect(isNumber(Number.MIN_VALUE)).toBe(true);
    });

    test('0 和 -0', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-0)).toBe(true);
      expect(Object.is(isNumber(-0), isNumber(0))).toBe(true);
    });
  });

  /* ========== 类型严格性测试 ========== */

  describe('应该严格区分数字类型', () => {
    test('不会进行隐式类型转换', () => {
      expect(isNumber('123')).toBe(false); // 字符串不转换
      expect(isNumber(true)).toBe(false); // 布尔不转换
      expect(isNumber(null)).toBe(false); // null 不转换
      expect(isNumber(undefined)).toBe(false); // undefined 不转换
    });

    test('区分数字对象和数字原始类型', () => {
      expect(isNumber(new Number(123))).toBe(false); // Number 对象
      expect(isNumber(Number(123))).toBe(true); // 数字原始类型
    });
  });

  /* ========== 性能测试 ========== */

  describe('性能测试', () => {
    test('大数据量测试（10000 次调用）', () => {
      const values = [
        123, -456, 3.14, NaN, Infinity, '123', true, null, undefined, {},
        [], () => {}, Symbol('test'), 0, -0, 1e5, -1e-5,
      ];

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        values.forEach((v) => isNumber(v));
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // 应该在 100ms 内完成
    });
  });
});
