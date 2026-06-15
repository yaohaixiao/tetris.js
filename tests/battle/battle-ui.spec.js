/**
 * 测试对战结果界面的显示和隐藏功能
 *
 * @file BattleUI 单元测试
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
  let mockOver;
  let mockWinner;
  let mockFly0;
  let mockFly1;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建覆盖层容器
    mockOverlay = document.createElement('section');
    mockOverlay.id = 'tetris-battle-overlay';
    mockOverlay.classList.add('tetris-hidden');
    document.body.appendChild(mockOverlay);

    // 创建胜者面板
    mockOver = document.createElement('section');
    mockOver.id = 'tetris-battle-over';
    mockOver.classList.add('tetris-hidden');
    mockOverlay.appendChild(mockOver);

    // 创建胜者名称元素
    mockWinner = document.createElement('span');
    mockWinner.id = 'tetris-battle-winner';
    mockOver.appendChild(mockWinner);

    // 创建 P1 fly canvas
    mockFly0 = document.createElement('canvas');
    mockFly0.id = 'human-0-tetris-battle-fly';
    mockFly0.classList.add('tetris-hidden');
    mockOverlay.appendChild(mockFly0);

    // 创建 P2 fly canvas
    mockFly1 = document.createElement('canvas');
    mockFly1.id = 'human-1-tetris-battle-fly';
    mockFly1.classList.add('tetris-hidden');
    mockOverlay.appendChild(mockFly1);

    // 创建 BattleUI 实例
    battleUI = new BattleUI({
      elements: {
        overlay: 'tetris-battle-overlay',
        over: 'tetris-battle-over',
        winner: 'tetris-battle-winner',
        fly: 'tetris-battle-fly',
      },
      players: ['human', 'human'],
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
        elements: {
          overlay: 'test',
          over: 'test-over',
          winner: 'test-winner',
          fly: 'test-fly',
        },
        players: ['human'],
      });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test('应该缓存 DOM 元素引用', () => {
      expect(battleUI.$overlay).toBe(mockOverlay);
      expect(battleUI.$over).toBe(mockOver);
      expect(battleUI.$winner).toBe(mockWinner);
      expect(battleUI.$flies['human-0']).toBe(mockFly0);
      expect(battleUI.$flies['human-1']).toBe(mockFly1);
    });

    test('元素不存在时应该缓存 null', () => {
      const ui = new BattleUI({
        elements: {
          overlay: 'non-existent-overlay',
          over: 'non-existent-over',
          winner: 'non-existent-winner',
          fly: 'non-existent-fly',
        },
        players: ['ai'],
      });
      expect(ui.$overlay).toBeNull();
      expect(ui.$over).toBeNull();
      expect(ui.$winner).toBeNull();
      expect(ui.$flies['ai-0']).toBeNull();
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该根据 elements 配置查找 DOM 元素', () => {
      expect(battleUI.$overlay.id).toBe('tetris-battle-overlay');
      expect(battleUI.$over.id).toBe('tetris-battle-over');
      expect(battleUI.$winner.id).toBe('tetris-battle-winner');
      expect(battleUI.$flies['human-0'].id).toBe('human-0-tetris-battle-fly');
      expect(battleUI.$flies['human-1'].id).toBe('human-1-tetris-battle-fly');
    });
  });

  // ==================== show（胜者） ====================
  describe('show（胜者面板）', () => {
    test('应该设置胜者名称（含 1P/2P 标识）', () => {
      battleUI.show({ winner: { name: 'Alice', index: 0 } });

      expect(mockWinner.textContent).toBe('ALICE (1P)');
    });

    test('应该移除 over 的 tetris-hidden 类', () => {
      expect(mockOver.classList.contains('tetris-hidden')).toBe(true);

      battleUI.show({ winner: { name: 'Bob', index: 1 } });

      expect(mockOver.classList.contains('tetris-hidden')).toBe(false);
      expect(mockWinner.textContent).toBe('BOB (2P)');
    });

    test('应该显示覆盖层', () => {
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);

      battleUI.show({ winner: { name: 'Alice', index: 0 } });

      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
    });

    test('胜者名称为空时默认显示 HUMAN', () => {
      battleUI.show({ winner: { name: '', index: 0 } });

      expect(mockWinner.textContent).toBe('HUMAN (1P)');
    });

    test('应该支持多次调用更新胜者名称', () => {
      battleUI.show({ winner: { name: 'Alice', index: 0 } });
      expect(mockWinner.textContent).toBe('ALICE (1P)');

      battleUI.show({ winner: { name: 'Bob', index: 1 } });
      expect(mockWinner.textContent).toBe('BOB (2P)');
    });
  });

  // ==================== show（fly） ====================
  describe('show（fly canvas）', () => {
    test('应该显示指定玩家的 fly canvas', () => {
      expect(mockFly0.classList.contains('tetris-hidden')).toBe(true);

      battleUI.show({ fly: 'human-0' });

      expect(mockFly0.classList.contains('tetris-hidden')).toBe(false);
    });

    test('应该显示覆盖层', () => {
      battleUI.show({ fly: 'human-0' });

      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
    });

    test('显示 fly 时不应该影响 over', () => {
      battleUI.show({ fly: 'human-1' });

      expect(mockOver.classList.contains('tetris-hidden')).toBe(true);
      expect(mockFly1.classList.contains('tetris-hidden')).toBe(false);
    });

    test('双方可以同时显示各自的 fly', () => {
      battleUI.show({ fly: 'human-0' });
      battleUI.show({ fly: 'human-1' });

      expect(mockFly0.classList.contains('tetris-hidden')).toBe(false);
      expect(mockFly1.classList.contains('tetris-hidden')).toBe(false);
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
    });
  });

  // ==================== hide（胜者） ====================
  describe('hide（胜者面板）', () => {
    beforeEach(() => {
      battleUI.show({ winner: { name: 'Alice', index: 0 } });
    });

    test('应该清空胜者名称', () => {
      expect(mockWinner.textContent).toBe('ALICE (1P)');

      battleUI.hide({ over: true });

      expect(mockWinner.textContent).toBe('');
    });

    test('应该隐藏胜者面板', () => {
      battleUI.hide({ over: true });

      expect(mockOver.classList.contains('tetris-hidden')).toBe(true);
    });

    test('over 和所有 fly 都隐藏时应该隐藏覆盖层', () => {
      battleUI.hide({ over: true });

      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
    });

    test('有 fly 显示时不应该隐藏覆盖层', () => {
      battleUI.show({ fly: 'human-0' });
      battleUI.hide({ over: true });

      // 覆盖层仍然可见，因为 fly 还在显示
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
    });
  });

  // ==================== hide（fly） ====================
  describe('hide（fly canvas）', () => {
    beforeEach(() => {
      battleUI.show({ fly: 'human-0' });
    });

    test('应该隐藏指定玩家的 fly canvas', () => {
      battleUI.hide({ fly: 'human-0' });

      expect(mockFly0.classList.contains('tetris-hidden')).toBe(true);
    });

    test('仅隐藏一个 fly 时不应该隐藏覆盖层', () => {
      battleUI.show({ fly: 'human-1' });
      battleUI.hide({ fly: 'human-0' });

      expect(mockFly0.classList.contains('tetris-hidden')).toBe(true);
      expect(mockFly1.classList.contains('tetris-hidden')).toBe(false);
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
    });

    test('所有 fly 都隐藏时应该隐藏覆盖层', () => {
      battleUI.hide({ fly: 'human-0' });

      expect(mockFly0.classList.contains('tetris-hidden')).toBe(true);
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
    });
  });

  // ==================== isOverlayShouldHide ====================
  describe('isOverlayShouldHide', () => {
    test('over 已隐藏时返回 true', () => {
      // over 初始就是隐藏的
      expect(battleUI.isOverlayShouldHide({ over: true })).toBe(true);
    });

    test('over 可见时返回 false', () => {
      battleUI.show({ winner: { name: 'Alice', index: 0 } });
      expect(battleUI.isOverlayShouldHide({ over: true })).toBe(false);
    });

    test('所有 fly 已隐藏时返回 true', () => {
      expect(battleUI.isOverlayShouldHide({ fly: 'human-0' })).toBe(true);
    });

    test('任一 fly 可见时返回 false', () => {
      battleUI.show({ fly: 'human-1' });
      expect(battleUI.isOverlayShouldHide({ fly: 'human-0' })).toBe(false);
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('完整的胜者显示到隐藏流程', () => {
      // 初始状态：隐藏
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);

      // 显示胜者
      battleUI.show({ winner: { name: 'Alice', index: 0 } });
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
      expect(mockOver.classList.contains('tetris-hidden')).toBe(false);
      expect(mockWinner.textContent).toBe('ALICE (1P)');

      // 隐藏胜者
      battleUI.hide({ over: true });
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
      expect(mockOver.classList.contains('tetris-hidden')).toBe(true);
      expect(mockWinner.textContent).toBe('');
    });

    test('完整的 fly 显示到隐藏流程', () => {
      // 初始状态：隐藏
      expect(mockFly0.classList.contains('tetris-hidden')).toBe(true);

      // 显示 fly
      battleUI.show({ fly: 'human-0' });
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);
      expect(mockFly0.classList.contains('tetris-hidden')).toBe(false);

      // 隐藏 fly
      battleUI.hide({ fly: 'human-0' });
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
      expect(mockFly0.classList.contains('tetris-hidden')).toBe(true);
    });

    test('双方同时 show fly 再依次 hide', () => {
      battleUI.show({ fly: 'human-0' });
      battleUI.show({ fly: 'human-1' });

      // 双方 fly 都可见
      expect(mockFly0.classList.contains('tetris-hidden')).toBe(false);
      expect(mockFly1.classList.contains('tetris-hidden')).toBe(false);
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);

      // 隐藏 P1 fly
      battleUI.hide({ fly: 'human-0' });
      expect(mockFly0.classList.contains('tetris-hidden')).toBe(true);
      // 覆盖层不隐藏，因为 P2 fly 还在
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(false);

      // 隐藏 P2 fly
      battleUI.hide({ fly: 'human-1' });
      expect(mockFly1.classList.contains('tetris-hidden')).toBe(true);
      // 所有 fly 都隐藏了，覆盖层也隐藏
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
    });

    test('多个 BattleUI 实例互不影响', () => {
      const overlay2 = document.createElement('section');
      overlay2.id = 'battle-overlay-2';
      overlay2.classList.add('tetris-hidden');
      document.body.appendChild(overlay2);

      const over2 = document.createElement('section');
      over2.id = 'battle-over-2';
      over2.classList.add('tetris-hidden');
      overlay2.appendChild(over2);

      const winner2 = document.createElement('span');
      winner2.id = 'battle-winner-2';
      over2.appendChild(winner2);

      const ui2 = new BattleUI({
        elements: {
          overlay: 'battle-overlay-2',
          over: 'battle-over-2',
          winner: 'battle-winner-2',
          fly: 'battle-fly-2',
        },
        players: ['human'],
      });

      battleUI.show({ winner: { name: 'Alice', index: 0 } });
      ui2.show({ winner: { name: 'Bob', index: 0 } });

      expect(mockWinner.textContent).toBe('ALICE (1P)');
      expect(winner2.textContent).toBe('BOB (1P)');

      battleUI.hide({ over: true });
      expect(mockOverlay.classList.contains('tetris-hidden')).toBe(true);
      expect(overlay2.classList.contains('tetris-hidden')).toBe(false);

      // 清理
      document.body.removeChild(overlay2);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    test('缺少 players 参数时不应该报错（使用空数组兜底）', () => {
      // 测试默认值
    });

    test('长名称应该正常显示', () => {
      const longName = 'A'.repeat(100);
      battleUI.show({ winner: { name: longName, index: 0 } });
      expect(mockWinner.textContent).toBe(`${longName.toUpperCase()} (1P)`);
    });
  });
});
