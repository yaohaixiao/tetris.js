/** @jest-environment jsdom */
import getScreenWidth from '@/lib/utils/dom/get-screen-width.js';

describe('getScreenWidth', () => {
  /**
   * 设置 screen 的 mock 值。 screen.width 和 screen.availWidth 是只读属性，无法直接赋值， 需要通过
   * Object.defineProperty 来覆盖。
   */
  const setScreen = (width, availWidth) => {
    Object.defineProperty(screen, 'width', {
      value: width,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(screen, 'availWidth', {
      value: availWidth,
      writable: true,
      configurable: true,
    });
  };

  // ==================== 基本功能 ====================

  describe('基本功能', () => {
    it('应该返回数字', () => {
      setScreen(1920, 1920);
      expect(typeof getScreenWidth()).toBe('number');
    });

    it('应该返回 screen.width 和 screen.availWidth 中的较大值', () => {
      setScreen(1920, 1280);
      expect(getScreenWidth()).toBe(1920);
    });

    it('availWidth 更大时应该返回 availWidth', () => {
      setScreen(1280, 1920);
      expect(getScreenWidth()).toBe(1920);
    });
  });

  // ==================== 边界情况 ====================

  describe('边界情况', () => {
    it('两者相等时应返回该值', () => {
      setScreen(1024, 1024);
      expect(getScreenWidth()).toBe(1024);
    });

    it('screen.width 为 0 时应返回 availWidth', () => {
      setScreen(0, 800);
      expect(getScreenWidth()).toBe(800);
    });

    it('screen.availWidth 为 0 时应返回 screen.width', () => {
      setScreen(800, 0);
      expect(getScreenWidth()).toBe(800);
    });

    it('两者都为 0 时应返回 0', () => {
      setScreen(0, 0);
      expect(getScreenWidth()).toBe(0);
    });

    it('应该处理小屏幕尺寸', () => {
      setScreen(375, 320);
      expect(getScreenWidth()).toBe(375);
    });

    it('应该处理大屏幕尺寸', () => {
      setScreen(3840, 2560);
      expect(getScreenWidth()).toBe(3840);
    });
  });
});
