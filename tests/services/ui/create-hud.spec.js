/** @jest-environment jsdom */

import createHud from '@/lib/services/ui/hud/create-hud.js';

jest.mock('@/lib/services/ui/hud/hud-elements.js', () => ({
  score: { textContent: '' },
  lines: { textContent: '' },
  level: { textContent: '' },
  highScore: { textContent: '' },
}));

const HudElements = require('@/lib/services/ui/hud/hud-elements.js');

describe('createHud', () => {
  let hud;

  beforeEach(() => {
    hud = createHud();
    HudElements.score.textContent = '';
    HudElements.lines.textContent = '';
    HudElements.level.textContent = '';
    HudElements.highScore.textContent = '';
  });

  // ========== update + tick：分数和最高分 ==========
  describe('分数动画', () => {
    test('update 只设目标不更新 DOM', () => {
      hud.update({ score: 500, lines: 0, level: 1, highScore: 0 });
      expect(HudElements.score.textContent).toBe('');
    });

    test('tick 开始追赶 score', () => {
      hud.update({ score: 500, lines: 0, level: 1, highScore: 0 });
      hud.tick();
      expect(HudElements.score.textContent).not.toBe('');
    });

    test('score 最终追上 target', () => {
      hud.update({ score: 100, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) hud.tick();
      expect(HudElements.score.textContent).toBe('00100');
    });

    test('highScore 最终追上 target', () => {
      hud.update({ score: 0, lines: 0, level: 1, highScore: 99999 });
      for (let i = 0; i < 200; i++) hud.tick();
      expect(HudElements.highScore.textContent).toBe('99999');
    });

    test('score 不会超过 target', () => {
      hud.update({ score: 50, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) hud.tick();
      expect(Number(HudElements.score.textContent)).toBeLessThanOrEqual(50);
    });

    test('中途更新 target 正确追赶新目标', () => {
      hud.update({ score: 100, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 30; i++) hud.tick();
      hud.update({ score: 500, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) hud.tick();
      expect(HudElements.score.textContent).toBe('00500');
    });

    test('目标值减少时也能向下追赶', () => {
      hud.update({ score: 500, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) hud.tick();
      expect(HudElements.score.textContent).toBe('00500');

      hud.update({ score: 200, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) hud.tick();
      expect(HudElements.score.textContent).toBe('00200');
    });

    test('大数字正确追赶', () => {
      hud.update({ score: 99999, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 300; i++) hud.tick();
      expect(HudElements.score.textContent).toBe('99999');
    });
  });

  // ========== lines / level 即时更新 ==========
  describe('静态数值即时更新', () => {
    test('lines 立即更新', () => {
      hud.update({ score: 0, lines: 5, level: 1, highScore: 0 });
      expect(HudElements.lines.textContent).toBe('05');
    });

    test('lines 相同时不更新', () => {
      hud.update({ score: 0, lines: 5, level: 1, highScore: 0 });
      HudElements.lines.textContent = 'dirty';
      hud.update({ score: 0, lines: 5, level: 1, highScore: 0 });
      expect(HudElements.lines.textContent).toBe('dirty');
    });

    test('level 立即更新', () => {
      hud.update({ score: 0, lines: 0, level: 3, highScore: 0 });
      expect(HudElements.level.textContent).toBe('03');
    });

    test('level 相同时不更新', () => {
      hud.update({ score: 0, lines: 0, level: 3, highScore: 0 });
      HudElements.level.textContent = 'dirty';
      hud.update({ score: 0, lines: 0, level: 3, highScore: 0 });
      expect(HudElements.level.textContent).toBe('dirty');
    });
  });

  // ========== reset ==========
  describe('reset', () => {
    test('清空所有状态和 DOM', () => {
      hud.update({ score: 999, lines: 10, level: 5, highScore: 999 });
      for (let i = 0; i < 200; i++) hud.tick();

      hud.reset();

      expect(HudElements.score.textContent).toBe('00000');
      expect(HudElements.lines.textContent).toBe('00');
      expect(HudElements.level.textContent).toBe('01');
      expect(HudElements.highScore.textContent).toBe('00000');
    });

    test('reset 后可以重新使用', () => {
      hud.update({ score: 500, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) hud.tick();
      hud.reset();
      hud.update({ score: 200, lines: 0, level: 1, highScore: 0 });
      for (let i = 0; i < 200; i++) hud.tick();
      expect(HudElements.score.textContent).toBe('00200');
    });
  });

  // ========== 边界 ==========
  describe('边界情况', () => {
    test('score 为 0 不出现负数', () => {
      hud.update({ score: 0, lines: 0, level: 1, highScore: 0 });
      hud.tick();
      expect(Number(HudElements.score.textContent)).toBeGreaterThanOrEqual(0);
    });
  });
});
