import formatTime from '@/lib/utils/date/format-time.js';

describe('formatTime', () => {
  const date = new Date(2026, 0, 15, 9, 5, 3); // 2026-01-15 09:05:03
  const datePM = new Date(2026, 0, 15, 14, 5, 3); // 2026-01-15 14:05:03 (PM)
  const dateMidnight = new Date(2026, 0, 15, 0, 0, 0); // 午夜
  const dateNoon = new Date(2026, 0, 15, 12, 0, 0); // 正午

  test('默认格式 yyyy-MM-dd HH:mm:ss', () => {
    expect(formatTime(date)).toBe('2026-01-15 09:05:03');
  });

  test('自定义格式 yyyy/MM/dd', () => {
    expect(formatTime(date, 'yyyy/MM/dd')).toBe('2026/01/15');
  });

  test('12小时制 + AM/PM（上午）', () => {
    expect(formatTime(date, 'hh:mm:ss a')).toBe('09:05:03 AM');
  });

  test('12小时制 + AM/PM（下午）', () => {
    expect(formatTime(datePM, 'hh:mm:ss a')).toBe('02:05:03 PM');
  });

  test('12小时制午夜为 12 AM', () => {
    expect(formatTime(dateMidnight, 'hh:mm:ss a')).toBe('12:00:00 AM');
  });

  test('12小时制正午为 12 PM', () => {
    expect(formatTime(dateNoon, 'hh:mm:ss a')).toBe('12:00:00 PM');
  });

  test('格式化中有多个相同占位符', () => {
    // yyyy 出现两次，应该都被替换
    expect(formatTime(date, 'yyyy/MM/yyyy')).toBe('2026/01/2026');
  });

  test('不包含 a 时，小写 a 不替换', () => {
    expect(formatTime(date, 'hh:mm')).toBe('09:05');
  });

  test('混合占位符', () => {
    expect(formatTime(date, 'yyyy年MM月dd日 HH时mm分ss秒')).toBe(
      '2026年01月15日 09时05分03秒',
    );
  });

  test('11 月 12 小时制不会出现 0 点', () => {
    const date11PM = new Date(2026, 0, 15, 23, 30, 45);
    expect(formatTime(date11PM, 'hh:mm:ss a')).toBe('11:30:45 PM');
  });

  test('格式中包含未定义的占位符时原样保留', () => {
    // 'xxx' 不在映射表中，正则匹配不到，原样保留
    expect(formatTime(date, 'yyyy-MM-dd xxx')).toBe('2026-01-15 xxx');
  });

  test('年月日边界：12月31日', () => {
    const yearEnd = new Date(2026, 11, 31, 23, 59, 59);
    expect(formatTime(yearEnd)).toBe('2026-12-31 23:59:59');
  });

  test('年月日边界：1月1日', () => {
    const yearStart = new Date(2026, 0, 1, 0, 0, 0);
    expect(formatTime(yearStart)).toBe('2026-01-01 00:00:00');
  });

  test('format 为空字符串返回空', () => {
    expect(formatTime(date, '')).toBe('');
  });
});
