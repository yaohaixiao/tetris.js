/**
 * @file BattleUI 单元测试
 * @description 测试对战结果界面的显示和隐藏功能
 */

import BattleUI from '@/lib/battle/battle-ui.js';

// Mock Base 类
jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
  });
});

describe('BattleUI', () => {
  let battleUI;
  let mockOverlay;
  let mockWinner;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建真实的 DOM 元素
    mockOverlay = document.createElement('div');
    mockOverlay.id = 'tetris-battle-overlay';
    mockOverlay.classList.add('tetris-hidden');
    document.body.appendChild(mockOverlay);

    mockWinner = document.createElement('span');
    mockWinner.id = 'tetris-battle-winner';
    mockOverlay.appendChild(mockWinner);

    // 创建 BattleUI 实例
    battleUI = new BattleUI({
      elements: {
        overlay: 'tetris-battle-overlay',
        winner: 'tetris-battle-winner',
      },
    });
  });

  afterEach(() => {
    // 清理 DOM
    if (mockOverlay.parentNode) {
      mockOverlay.parentNode.removeChild(mockOverlay);
    }
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    test('应该正确创建 BattleUI 实例', () => {
      expect(battleUI).toBeDefined();
      expect(battleUI).toBeInstanceOf(BattleUI);
    });

    test('应该自动调用 initialize 方法', () => {
      const spy = jest.spyOn(BattleUI.prototype, 'initialize');
      new BattleUI({
        elements: { overlay: 'test', winner: 'test' },
      });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test('应该缓存 DOM 元素引用', () => {
      expect(battleUI.$overlay).toBe(mockOverlay);
      expect(battleUI.$winner).toBe(mockWinner);
    });

    test('元素不存在时应该缓存 null', () => {
      const ui = new BattleUI({
        elements: {
          overlay: 'non-existent-overlay',
          winner: 'non-existent-winner',
        },
      });
      expect(ui.$overlay).toBeNull();
      expect(ui.$winner).toBeNull();
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该根据 elements 配置查找 DOM 元素', () => {
      expect(battleUI.$overlay.id).toBe('tetris-battle-overlay');
      expect(battleUI.$winner.id).toBe('tetris-battle-winner');
    });
  });

  // ==================== show ====================
  describe('show', () => {
    test('应该设置胜者名称', () => {
      battleUI.show('Alice');

      expect(mockWinner.textContent).toBe('Alice');
    });

    test('应该移除 tetris-hidden 类', () => {
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);

      battleUI.show('Bob');

      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
    });

    test('应该支持多次调用更新胜者名称', () => {
      battleUI.show('Alice');
      expect(mockWinner.textContent).toBe('Alice');

      battleUI.show('Bob');
      expect(mockWinner.textContent).toBe('Bob');
    });

    test('应该支持空字符串名称', () => {
      battleUI.show('');
      expect(mockWinner.textContent).toBe('');
    });

    test('应该支持特殊字符名称', () => {
      battleUI.show('Player-1!');
      expect(mockWinner.textContent).toBe('Player-1!');
    });

    test('$overlay 为 null 时不应该报错', () => {
      const ui = new BattleUI({
        elements: { overlay: 'nonexistent', winner: 'test' },
      });
      expect(() => ui.show('Alice')).toThrow();
    });
  });

  // ==================== hide ====================
  describe('hide', () => {
    beforeEach(() => {
      battleUI.show('Alice');
    });

    test('应该清空胜者名称', () => {
      expect(mockWinner.textContent).toBe('Alice');

      battleUI.hide();

      expect(mockWinner.textContent).toBe('');
    });

    test('应该添加 tetris-hidden 类', () => {
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);

      battleUI.hide();

      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
    });

    test('应该可以多次调用', () => {
      battleUI.hide();
      battleUI.hide();

      expect(mockWinner.textContent).toBe('');
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
    });

    test('hide 后再 show 应该正常工作', () => {
      battleUI.hide();
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
      expect(mockWinner.textContent).toBe('');

      battleUI.show('Charlie');
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
      expect(mockWinner.textContent).toBe('Charlie');
    });

    test('连续 show/hide 切换', () => {
      battleUI.hide();
      battleUI.show('P1');
      battleUI.hide();
      battleUI.show('P2');

      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
      expect(mockWinner.textContent).toBe('P2');
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整的显示到隐藏流程', () => {
      // 初始状态：隐藏
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
      expect(mockWinner.textContent).toBe('');

      // 显示胜者
      battleUI.show('Alice');
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
      expect(mockWinner.textContent).toBe('Alice');

      // 隐藏
      battleUI.hide();
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
      expect(mockWinner.textContent).toBe('');
    });

    test('多个 BattleUI 实例互不影响', () => {
      const overlay2 = document.createElement('div');
      overlay2.id = 'battle-overlay-2';
      overlay2.classList.add('tetris-hidden');
      document.body.appendChild(overlay2);

      const winner2 = document.createElement('span');
      winner2.id = 'battle-winner-2';
      overlay2.appendChild(winner2);

      const ui2 = new BattleUI({
        elements: { overlay: 'battle-overlay-2', winner: 'battle-winner-2' },
      });

      battleUI.show('Alice');
      ui2.show('Bob');

      expect(mockWinner.textContent).toBe('Alice');
      expect(winner2.textContent).toBe('Bob');

      battleUI.hide();
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
      expect(overlay2.classList.contains('tetris-hidden')).toBe(false);

      // 清理
      document.body.removeChild(overlay2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    test('空字符串 elements 会抛出选择器错误', () => {
      expect(() => {
        new BattleUI({
          elements: { overlay: '', winner: '' },
        });
      }).toThrow();
    });

    test('长名称应该正常显示', () => {
      const longName = 'A'.repeat(100);
      battleUI.show(longName);
      expect(mockWinner.textContent).toBe(longName);
    });

    test('包含 HTML 标签的名称应该作为纯文本显示', () => {
      battleUI.show('<b>Alice</b>');
      expect(mockWinner.textContent).toBe('<b>Alice</b>');
      expect(mockWinner.innerHTML).toBe('&lt;b&gt;Alice&lt;/b&gt;');
    });
  });
});
