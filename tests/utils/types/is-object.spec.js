import isObject from '@/lib/utils/types/is-object.js';

describe('isObject', () => {
  describe('应该返回 true', () => {
    it('普通对象', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('数组', () => {
      expect(isObject([])).toBe(true);
      expect(isObject([1, 2, 3])).toBe(true);
    });

    it('Date 对象', () => {
      expect(isObject(new Date())).toBe(true);
    });

    it('RegExp 对象', () => {
      expect(isObject(/abc/)).toBe(true);
    });

    it('函数', () => {
      expect(isObject(() => {})).toBe(true);
      expect(isObject(function () {})).toBe(true);
    });

    it('包装对象', () => {
      expect(isObject(new String('hello'))).toBe(true);
      expect(isObject(new Number(42))).toBe(true);
    });
  });

  describe('应该返回 false', () => {
    it('null', () => {
      expect(isObject(null)).toBe(false);
    });

    it('undefined', () => {
      expect(isObject(undefined)).toBe(false);
    });

    it('基本类型', () => {
      expect(isObject(42)).toBe(false);
      expect(isObject('hello')).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(Symbol())).toBe(false);
    });
  });
});
