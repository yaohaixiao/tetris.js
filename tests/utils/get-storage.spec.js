/** @jest-environment jsdom */
import getStorage from '@/lib/utils/get-storage';

describe('getStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('获取存在的键值', () => {
    localStorage.setItem('highScore', '99999');
    expect(getStorage('highScore')).toBe('99999');
  });

  test('获取不存在的键返回 null', () => {
    expect(getStorage('nonexistent')).toBe(null);
  });

  test('获取空字符串值', () => {
    localStorage.setItem('empty', '');
    expect(getStorage('empty')).toBe('');
  });

  test('获取数字类型（localStorage 始终返回字符串）', () => {
    localStorage.setItem('score', '0');
    expect(getStorage('score')).toBe('0');
  });
});
