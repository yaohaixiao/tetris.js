/** @jest-environment jsdom */
import setStorage from '@/lib/utils/storage/set-storage.js';

describe('setStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('存储字符串', () => {
    setStorage('highScore', '99999');
    expect(localStorage.getItem('highScore')).toBe('99999');
  });

  test('存储空字符串', () => {
    setStorage('empty', '');
    expect(localStorage.getItem('empty')).toBe('');
  });

  test('存储数字时会转为字符串', () => {
    setStorage('score', 5000);
    expect(localStorage.getItem('score')).toBe('5000');
  });

  test('覆盖已有值', () => {
    localStorage.setItem('key', 'old');
    setStorage('key', 'new');
    expect(localStorage.getItem('key')).toBe('new');
  });
});
