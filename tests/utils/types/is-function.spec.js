import isFunction from '@/lib/utils/types/is-function.js';

describe('isFunction', () => {
  test('普通函数', () => {
    expect(isFunction(() => {})).toBe(true);
  });

  test('箭头函数', () => {
    expect(isFunction(() => {})).toBe(true);
  });

  test('异步函数', () => {
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
  });

  test('生成器函数', () => {
    function* gen() {}
    expect(isFunction(gen)).toBe(true);
  });

  test('class（也是函数）', () => {
    class Foo {}
    expect(isFunction(Foo)).toBe(true);
  });

  test('内置函数', () => {
    expect(isFunction(Array.isArray)).toBe(true);
    expect(isFunction(setTimeout)).toBe(true);
    expect(isFunction(JSON.parse)).toBe(true);
  });

  test('函数绑定', () => {
    const bound = function () {}.bind(null);
    expect(isFunction(bound)).toBe(true);
  });

  test('null 返回 false', () => {
    expect(isFunction(null)).toBe(false);
  });

  test('undefined 返回 false', () => {
    expect(isFunction(undefined)).toBe(false);
  });

  test('对象字面量返回 false', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction({ a: 1 })).toBe(false);
  });

  test('数组返回 false', () => {
    expect(isFunction([])).toBe(false);
    expect(isFunction([1, 2, 3])).toBe(false);
  });

  test('字符串返回 false', () => {
    expect(isFunction('hello')).toBe(false);
    expect(isFunction('')).toBe(false);
  });

  test('数字返回 false', () => {
    expect(isFunction(0)).toBe(false);
    expect(isFunction(123)).toBe(false);
    expect(isFunction(Number.NaN)).toBe(false);
  });

  test('布尔值返回 false', () => {
    expect(isFunction(true)).toBe(false);
    expect(isFunction(false)).toBe(false);
  });

  test('Symbol 返回 false', () => {
    expect(isFunction(Symbol('test'))).toBe(false);
  });

  test('正则表达式返回 false', () => {
    expect(isFunction(/abc/)).toBe(false);
  });

  test('Date 实例返回 false', () => {
    expect(isFunction(new Date())).toBe(false);
  });

  test('Map / Set 实例返回 false', () => {
    expect(isFunction(new Map())).toBe(false);
    expect(isFunction(new Set())).toBe(false);
  });

  test('Promise 实例返回 false', () => {
    expect(isFunction(new Promise(() => {}))).toBe(false);
  });
});
