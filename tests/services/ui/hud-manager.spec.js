/** @jest-environment jsdom */

import HudManager from '@/lib/services/ui/hud/hud-manager.js';

// Mock padStart 工具函数
jest.mock('@/lib/utils/pad-start.js', () => ({
  __esModule: true,
  default: jest.fn((value, pad) => {
    const str = String(value);
    return str.length < pad ? '0'.repeat(pad - str.length) + str : str;
  }),
}));

// Mock HudElements
jest.mock('@/lib/services/ui/hud/hud-elements.js', () => ({
  __esModule: true,
  default: jest.fn((options) => ({
    score: { textContent: '' },
    highScore: { textContent: '' },
    lines: { textContent: '' },
    level: { textContent: '' },
    controller: { textContent: '' },
  })),
}));

import HudElements from '@/lib/services/ui/hud/hud-elements.js';

describe('HudManager', () => {
  let hud;
  let elements;

  beforeEach(() => {
    jest.clearAllMocks();

    hud = new HudManager({
      score: 'score',
      highScore: 'highScore',
      lines: 'lines',
      level: 'level',
      controller: 'controller',
    });

    elements = hud.elements;
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 HudManager 实例', () => {
      expect(hud).toBeDefined();
      expect(hud).toBeInstanceOf(HudManager);
    });

    it('应该调用 HudElements 创建 DOM 元素', () => {
      expect(HudElements).toHaveBeenCalledWith({
        score: 'score',
        highScore: 'highScore',
        lines: 'lines',
        level: 'level',
        controller: 'controller',
      });
    });

    it('应该初始化分数追踪器为 0', () => {
      expect(hud.scoreTracker).toEqual({ visual: 0, target: 0 });
    });

    it('应该初始化最高分追踪器为 0', () => {
      expect(hud.highScoreTracker).toEqual({ visual: 0, target: 0 });
    });

    it('应该初始化 prev 缓存', () => {
      expect(hud.prev).toEqual({ lines: -1, level: -1 });
    });
  });

  // ==================== update ====================
  describe('update 方法', () => {
    it('应该更新分数追踪器的目标值', () => {
      hud.update({ score: 500, lines: 0, level: 1 });

      expect(hud.scoreTracker.target).toBe(500);
    });

    it('应该更新最高分追踪器的目标值', () => {
      hud.update({ highScore: 9999, lines: 0, level: 1 });

      expect(hud.highScoreTracker.target).toBe(9999);
    });

    it('应该将非数字分数转为 0', () => {
      hud.update({ score: null, lines: 0, level: 1 });

      expect(hud.scoreTracker.target).toBe(0);
    });

    it('应该更新行数的 DOM 显示', () => {
      hud.update({ score: 0, lines: 5, level: 1 });

      expect(elements.lines.textContent).toBe('05');
    });

    it('行数未变化时不应该更新 DOM', () => {
      hud.update({ score: 0, lines: 5, level: 1 });
      const prevText = elements.lines.textContent;

      hud.update({ score: 100, lines: 5, level: 1 });

      expect(elements.lines.textContent).toBe(prevText);
    });

    it('应该更新等级的 DOM 显示', () => {
      hud.update({ score: 0, lines: 0, level: 3 });

      expect(elements.level.textContent).toBe('03');
    });

    it('等级未变化时不应该更新 DOM', () => {
      hud.update({ score: 0, lines: 0, level: 3 });
      const prevText = elements.level.textContent;

      hud.update({ score: 100, lines: 0, level: 3 });

      expect(elements.level.textContent).toBe(prevText);
    });

    it('应该同时更新多个字段', () => {
      hud.update({ score: 1000, highScore: 5000, lines: 10, level: 5 });

      expect(hud.scoreTracker.target).toBe(1000);
      expect(hud.highScoreTracker.target).toBe(5000);
      expect(elements.lines.textContent).toBe('10');
      expect(elements.level.textContent).toBe('05');
    });
  });

  // ==================== updateController ====================
  describe('updateController 方法', () => {
    it('应该将 human 转为大写 HUMAN', () => {
      hud.updateController('human');

      expect(elements.controller.textContent).toBe('HUMAN');
    });

    it('应该将 ai 转为大写 AI', () => {
      hud.updateController('ai');

      expect(elements.controller.textContent).toBe('AI');
    });
  });

  // ==================== tick ====================
  describe('tick 方法', () => {
    it('应该驱动分数动画追赶目标值', () => {
      hud.scoreTracker.target = 100;
      hud.scoreTracker.visual = 0;

      hud.tick();

      expect(hud.scoreTracker.visual).toBeGreaterThan(0);
      expect(hud.scoreTracker.visual).toBeLessThanOrEqual(100);
    });

    it('应该驱动最高分动画追赶目标值', () => {
      hud.highScoreTracker.target = 500;
      hud.highScoreTracker.visual = 0;

      hud.tick();

      expect(hud.highScoreTracker.visual).toBeGreaterThan(0);
      expect(hud.highScoreTracker.visual).toBeLessThanOrEqual(500);
    });

    it('visual 等于 target 时不应该继续追赶', () => {
      hud.scoreTracker.target = 100;
      hud.scoreTracker.visual = 100;
      const prevVisual = hud.scoreTracker.visual;

      hud.tick();

      expect(hud.scoreTracker.visual).toBe(prevVisual);
    });

    it('多次 tick 应该最终到达目标值', () => {
      hud.scoreTracker.target = 100;
      hud.scoreTracker.visual = 0;

      for (let i = 0; i < 100; i++) {
        hud.tick();
      }

      expect(hud.scoreTracker.visual).toBe(100);
    });

    it('应该更新分数 DOM 显示', () => {
      hud.scoreTracker.target = 1000;
      hud.scoreTracker.visual = 0;

      hud.tick();

      expect(elements.score.textContent).not.toBe('');
    });
  });

  // ==================== reset ====================
  describe('reset 方法', () => {
    it('应该重置分数追踪器', () => {
      hud.scoreTracker.visual = 500;
      hud.scoreTracker.target = 1000;

      hud.reset();

      expect(hud.scoreTracker).toEqual({ visual: 0, target: 0 });
    });

    it('应该重置最高分追踪器', () => {
      hud.highScoreTracker.visual = 500;
      hud.highScoreTracker.target = 1000;

      hud.reset();

      expect(hud.highScoreTracker).toEqual({ visual: 0, target: 0 });
    });

    it('应该重置 prev 缓存', () => {
      hud.prev.lines = 5;
      hud.prev.level = 3;

      hud.reset();

      expect(hud.prev).toEqual({ lines: -1, level: -1 });
    });

    it('应该清空分数 DOM 显示', () => {
      elements.score.textContent = '05000';

      hud.reset();

      expect(elements.score.textContent).toBe('00000');
    });

    it('应该清空最高分 DOM 显示', () => {
      elements.highScore.textContent = '09999';

      hud.reset();

      expect(elements.highScore.textContent).toBe('00000');
    });

    it('应该清空行数 DOM 显示', () => {
      elements.lines.textContent = '15';

      hud.reset();

      expect(elements.lines.textContent).toBe('00');
    });

    it('应该重置等级 DOM 显示为 01', () => {
      elements.level.textContent = '10';

      hud.reset();

      expect(elements.level.textContent).toBe('01');
    });
  });

  // ==================== 多实例隔离 ====================
  describe('多实例隔离', () => {
    it('两个实例应该互不影响', () => {
      const hud1 = new HudManager({
        score: 'score1',
        highScore: 'hs1',
        lines: 'lines1',
        level: 'level1',
        controller: 'ctrl1',
      });
      const hud2 = new HudManager({
        score: 'score2',
        highScore: 'hs2',
        lines: 'lines2',
        level: 'level2',
        controller: 'ctrl2',
      });

      hud1.update({ score: 100, highScore: 200, lines: 5, level: 3 });
      hud2.update({ score: 999, highScore: 888, lines: 10, level: 8 });

      expect(hud1.scoreTracker.target).toBe(100);
      expect(hud2.scoreTracker.target).toBe(999);

      expect(hud1.highScoreTracker.target).toBe(200);
      expect(hud2.highScoreTracker.target).toBe(888);
    });

    it('两个实例的 tick 应该独立运行', () => {
      const hud1 = new HudManager({
        score: 's1',
        highScore: 'h1',
        lines: 'l1',
        level: 'lv1',
        controller: 'c1',
      });
      const hud2 = new HudManager({
        score: 's2',
        highScore: 'h2',
        lines: 'l2',
        level: 'lv2',
        controller: 'c2',
      });

      hud1.scoreTracker.target = 100;
      hud2.scoreTracker.target = 999;

      hud1.tick();
      hud2.tick();

      // 两个实例的 visual 应该不同（因为追赶的步进相同但目标不同）
      expect(hud1.scoreTracker.visual).not.toBe(hud2.scoreTracker.visual);
    });
  });
});
