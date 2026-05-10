import isString from '@/lib/utils/is-string.js';

describe('isString', () => {
  describe('应该返回 true', () => {
    it('字符串字面量', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
    });

    it('模板字符串', () => {
      expect(isString(`hello`)).toBe(true);
      expect(isString(`${1 + 1}`)).toBe(true);
    });

    it('String 包装对象', () => {
      expect(isString(new String('hello'))).toBe(false);
    });
  });

  describe('应该返回 false', () => {
    it('数字', () => {
      expect(isString(42)).toBe(false);
      expect(isString(0)).toBe(false);
      expect(isString(NaN)).toBe(false);
    });

    it('布尔值', () => {
      expect(isString(true)).toBe(false);
      expect(isString(false)).toBe(false);
    });

    it('null 和 undefined', () => {
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });

    it('对象和数组', () => {
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString({ key: 'value' })).toBe(false);
    });

    it('函数', () => {
      expect(isString(() => {})).toBe(false);
    });

    it('Symbol', () => {
      expect(isString(Symbol('test'))).toBe(false);
    });
  });
});
