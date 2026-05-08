import padStart from '@/lib/utils/pad-start.js';

describe('padStart', () => {
  test('数字小于目标长度时补零', () => {
    expect(padStart(5, 2)).toBe('05');
    expect(padStart(7, 4)).toBe('0007');
    expect(padStart(12, 2)).toBe('12');
  });

  test('数字大于等于目标长度时不补零', () => {
    expect(padStart(123, 2)).toBe('123');
    expect(padStart(100, 3)).toBe('100');
  });

  test('零值', () => {
    expect(padStart(0, 2)).toBe('00');
    expect(padStart(0, 5)).toBe('00000');
    expect(padStart(0, 0)).toBe('0');
  });

  test('字符串数字也可以处理', () => {
    expect(padStart('5', 2)).toBe('05');
    expect(padStart('12', 2)).toBe('12');
  });

  test('负数：符号保留，数值部分补零', () => {
    expect(padStart(-3, 3)).toBe('-003');
    expect(padStart(-3, 2)).toBe('-03');
    expect(padStart(-10, 4)).toBe('-0010');
  });

  test('目标长度为 0 时返回原数字字符串', () => {
    expect(padStart(5, 0)).toBe('5');
    expect(padStart(-7, 0)).toBe('-7');
  });

  test('目标长度为负数时兜底为 0', () => {
    expect(padStart(5, -1)).toBe('5');
    expect(padStart(5, -100)).toBe('5');
  });

  test('目标长度为小数时取整', () => {
    expect(padStart(5, 3.7)).toBe('005');
  });

  test('非法数字返回空字符串', () => {
    expect(padStart(Number.NaN, 2)).toBe('');
    expect(padStart(Infinity, 2)).toBe('');
    expect(padStart(-Infinity, 2)).toBe('');
    expect(padStart('abc', 2)).toBe('');
  });

  test('undefined 和 null 兜底', () => {
    expect(padStart(undefined, 2)).toBe('');
    expect(padStart(null, 2)).toBe('00'); // Number(null) = 0
  });

  test('边界：大数字', () => {
    expect(padStart(9999, 4)).toBe('9999');
    expect(padStart(9999, 6)).toBe('009999');
  });
});
