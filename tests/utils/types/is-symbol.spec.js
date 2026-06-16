import isSymbol from '@/lib/utils/types/is-symbol.js';

describe('isSymbol', () => {
  describe('应该返回 true', () => {
    it('Symbol() 创建', () => {
      expect(isSymbol(Symbol())).toBe(true);
    });

    it('Symbol 带描述', () => {
      expect(isSymbol(Symbol('test'))).toBe(true);
    });

    it('Symbol.iterator 等内置 Symbol', () => {
      expect(isSymbol(Symbol.iterator)).toBe(true);
      expect(isSymbol(Symbol.asyncIterator)).toBe(true);
    });

    it('Symbol.for() 创建', () => {
      expect(isSymbol(Symbol.for('foo'))).toBe(true);
    });
  });

  describe('应该返回 false', () => {
    it('字符串', () => {
      expect(isSymbol('symbol')).toBe(false);
      expect(isSymbol('')).toBe(false);
    });

    it('数字', () => {
      expect(isSymbol(42)).toBe(false);
      expect(isSymbol(0)).toBe(false);
      expect(isSymbol(NaN)).toBe(false);
    });

    it('布尔值', () => {
      expect(isSymbol(true)).toBe(false);
      expect(isSymbol(false)).toBe(false);
    });

    it('null 和 undefined', () => {
      expect(isSymbol(null)).toBe(false);
      expect(isSymbol(undefined)).toBe(false);
    });

    it('对象和数组', () => {
      expect(isSymbol({})).toBe(false);
      expect(isSymbol([])).toBe(false);
    });

    it('函数', () => {
      expect(isSymbol(() => {})).toBe(false);
    });
  });
});
