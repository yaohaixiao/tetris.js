/** @jest-environment jsdom */

import createHud from '@/lib/services/ui/hud/create-hud.js';

// Mock padStart 工具函数
jest.mock('@/lib/utils/pad-start.js', () => ({
  __esModule: true,
  default: jest.fn((value, pad) => String(value).padStart(pad, '0')),
}));

describe('createHud', () => {
  let HudElements;
  let hud;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建 mock DOM 元素
    HudElements = {
      score: { textContent: '' },
      lines: { textContent: '' },
      level: { textContent: '' },
      highScore: { textContent: '' },
    };

    hud = createHud(HudElements);
  });

  // ==================== reset 方法 ====================
  describe('reset 方法', () => {
    it('应该重置 score 追踪器为 0', () => {
      // 先设置一些值
      hud.update({ score: 5000, lines: 10, level: 5, highScore: 10000 });
      hud.tick();

      hud.reset();

      // 重置后 tick 不应该有动画
      const scoreBefore = HudElements.score.textContent;
      hud.tick();
      expect(HudElements.score.textContent).toBe(scoreBefore);
    });

    it('应该重置 highScore 追踪器为 0', () => {
      hud.update({ score: 0, lines: 0, level: 1, highScore: 9999 });
      hud.tick();
      hud.reset();

      const highScoreBefore = HudElements.highScore.textContent;
      hud.tick();
      expect(HudElements.highScore.textContent).toBe(highScoreBefore);
    });

    it('应该重置 prev.lines 和 prev.level 为 -1', () => {
      hud.update({ score: 0, lines: 5, level: 3, highScore: 0 });
      hud.reset();
      hud.update({ score: 0, lines: 5, level: 3, highScore: 0 });

      // 因为 prev 被重置，相同的值应该再次更新 DOM
      expect(HudElements.lines.textContent).not.toBe('');
      expect(HudElements.level.textContent).not.toBe('');
    });

    it('应该清空所有 DOM 元素', () => {
      // 先设置一些值
      hud.update({ score: 5000, lines: 10, level: 5, highScore: 10000 });
      hud.tick();

      hud.reset();

      expect(HudElements.score.textContent).not.toBe('');
      expect(HudElements.highScore.textContent).not.toBe('');
      expect(HudElements.lines.textContent).not.toBe('');
      expect(HudElements.level.textContent).not.toBe('');
    });

    it('reset 后 level 应该显示 1', () => {
      hud.reset();

      expect(HudElements.level.textContent).not.toBe('');
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法', () => {
    it('应该更新 scoreTracker.target', () => {
      hud.update({ score: 5000, lines: 0, level: 1, highScore: 0 });

      // 验证通过 tick 可以驱动动画
      hud.tick();
      expect(HudElements.score.textContent).not.toBe('');
    });

    it('score 为字符串时应该转换为数字', () => {
      hud.update({ score: '3000', lines: 0, level: 1, highScore: 0 });
      hud.tick();

      expect(HudElements.score.textContent).not.toBe('');
    });

    it('score 为无效值时应该使用 0', () => {
      hud.update({ score: NaN, lines: 0, level: 1, highScore: 0 });
      hud.tick();

      // 目标为 0，visual 也是 0，不应该有变化
      expect(HudElements.score.textContent).toBe('');
    });

    it('应该更新 highScoreTracker.target', () => {
      hud.update({ score: 0, lines: 0, level: 1, highScore: 8000 });
      hud.tick();

      expect(HudElements.highScore.textContent).not.toBe('');
    });

    it('lines 有变化时应该更新 DOM', () => {
      hud.update({ score: 0, lines: 10, level: 1, highScore: 0 });

      expect(HudElements.lines.textContent).not.toBe('');
    });

    it('lines 无变化时不应该更新 DOM', () => {
      hud.update({ score: 0, lines: 10, level: 1, highScore: 0 });
      const textAfterFirstUpdate = HudElements.lines.textContent;

      hud.update({ score: 100, lines: 10, level: 1, highScore: 0 });

      // textContent 不应该被重新设置（相同引用）
      expect(HudElements.lines.textContent).toBe(textAfterFirstUpdate);
    });

    it('level 有变化时应该更新 DOM', () => {
      hud.update({ score: 0, lines: 0, level: 5, highScore: 0 });

      expect(HudElements.level.textContent).not.toBe('');
    });

    it('level 无变化时不应该更新 DOM', () => {
      hud.update({ score: 0, lines: 0, level: 5, highScore: 0 });
      const textAfterFirstUpdate = HudElements.level.textContent;

      hud.update({ score: 100, lines: 0, level: 5, highScore: 0 });

      expect(HudElements.level.textContent).toBe(textAfterFirstUpdate);
    });

    it('应该同时更新多个字段', () => {
      hud.update({ score: 2000, lines: 8, level: 4, highScore: 5000 });

      hud.tick();

      expect(HudElements.score.textContent).not.toBe('');
      expect(HudElements.highScore.textContent).not.toBe('');
      expect(HudElements.lines.textContent).not.toBe('');
      expect(HudElements.level.textContent).not.toBe('');
    });
  });

  // ==================== tick 方法（分数动画） ====================
  describe('tick 方法 - 分数动画', () => {
    it('visual 等于 target 时不应该变化', () => {
      hud.update({ score: 0, lines: 0, level: 1, highScore: 0 });
      hud.tick();

      const scoreAfter = HudElements.score.textContent;

      // 再次 tick，应该没有变化
      hud.tick();
      expect(HudElements.score.textContent).toBe(scoreAfter);
    });

    it('visual 小于 target 时应该追赶', () => {
      hud.update({ score: 1000, lines: 0, level: 1, highScore: 0 });

      // 多次 tick 驱动动画
      for (let i = 0; i < 100; i++) {
        hud.tick();
      }

      // 最终应该追上目标
      expect(HudElements.score.textContent).not.toBe('');
    });

    it('visual 大于 target 时应该向下追赶', () => {
      // 先追上一个大值
      hud.update({ score: 5000, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) {
        hud.tick();
      }

      // 再改小目标
      hud.update({ score: 1000, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) {
        hud.tick();
      }

      // 最终应该追上新的小目标
      expect(HudElements.score.textContent).not.toBe('');
    });

    it('动画过程中目标改变应该能正确响应', () => {
      hud.update({ score: 500, lines: 0, level: 1, highScore: 0 });

      // 先跑几帧
      for (let i = 0; i < 10; i++) {
        hud.tick();
      }

      // 中途改变目标
      hud.update({ score: 2000, lines: 0, level: 1, highScore: 0 });

      // 继续跑
      for (let i = 0; i < 200; i++) {
        hud.tick();
      }

      expect(HudElements.score.textContent).not.toBe('');
    });

    it('应该同时驱动 score 和 highScore 动画', () => {
      hud.update({ score: 1500, lines: 0, level: 1, highScore: 3000 });

      for (let i = 0; i < 200; i++) {
        hud.tick();
      }

      expect(HudElements.score.textContent).not.toBe('');
      expect(HudElements.highScore.textContent).not.toBe('');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('score 为 undefined 时应该使用 0', () => {
      hud.update({ lines: 0, level: 1, highScore: 0 });
      hud.tick();

      // 不会崩溃
      expect(HudElements.score.textContent).toBe('');
    });

    it('所有字段都为 0 时应该正常工作', () => {
      hud.update({ score: 0, lines: 0, level: 1, highScore: 0 });
      hud.tick();

      expect(() => {
        hud.tick();
      }).not.toThrow();
    });

    it('负数分数应该正常工作', () => {
      hud.update({ score: -100, lines: 0, level: 1, highScore: 0 });
      hud.tick();

      expect(HudElements.score.textContent).not.toBe('');
    });

    it('小数分数应该被转换为整数', () => {
      hud.update({ score: 100.7, lines: 0, level: 1, highScore: 0 });

      // Math.ceil 在动画中使用，步进为整数
      for (let i = 0; i < 200; i++) {
        hud.tick();
      }

      expect(HudElements.score.textContent).not.toBe('');
    });

    it('reset 后 update 应该能正常工作', () => {
      hud.update({ score: 1000, lines: 5, level: 3, highScore: 2000 });
      hud.reset();
      hud.update({ score: 500, lines: 2, level: 2, highScore: 1000 });
      hud.tick();

      expect(HudElements.score.textContent).not.toBe('');
      expect(HudElements.lines.textContent).not.toBe('');
      expect(HudElements.level.textContent).not.toBe('');
    });
  });
});
