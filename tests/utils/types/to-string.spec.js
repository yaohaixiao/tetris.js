import toString from '@/lib/utils/types/to-string.js';

describe('toString', () => {
  it('应该返回 "[object String]" 对于字符串', () => {
    expect(toString('hello')).toBe('[object String]');
    expect(toString('')).toBe('[object String]');
  });

  it('应该返回 "[object Number]" 对于数字', () => {
    expect(toString(42)).toBe('[object Number]');
    expect(toString(0)).toBe('[object Number]');
    expect(toString(NaN)).toBe('[object Number]');
  });

  it('应该返回 "[object Boolean]" 对于布尔值', () => {
    expect(toString(true)).toBe('[object Boolean]');
    expect(toString(false)).toBe('[object Boolean]');
  });

  it('应该返回 "[object Array]" 对于数组', () => {
    expect(toString([])).toBe('[object Array]');
    expect(toString([1, 2, 3])).toBe('[object Array]');
  });

  it('应该返回 "[object Object]" 对于普通对象', () => {
    expect(toString({})).toBe('[object Object]');
    expect(toString({ a: 1 })).toBe('[object Object]');
  });

  it('应该返回 "[object Function]" 对于函数', () => {
    expect(toString(() => {})).toBe('[object Function]');
    expect(toString(function () {})).toBe('[object Function]');
  });

  it('应该返回 "[object Symbol]" 对于 Symbol', () => {
    expect(toString(Symbol('test'))).toBe('[object Symbol]');
    expect(toString(Symbol())).toBe('[object Symbol]');
  });

  it('应该返回 "[object Null]" 对于 null', () => {
    expect(toString(null)).toBe('[object Null]');
  });

  it('应该返回 "[object Undefined]" 对于 undefined', () => {
    expect(toString(undefined)).toBe('[object Undefined]');
  });

  it('应该返回 "[object Date]" 对于日期对象', () => {
    expect(toString(new Date())).toBe('[object Date]');
  });

  it('应该返回 "[object RegExp]" 对于正则表达式', () => {
    expect(toString(/abc/)).toBe('[object RegExp]');
    expect(toString(new RegExp('abc'))).toBe('[object RegExp]');
  });
});
