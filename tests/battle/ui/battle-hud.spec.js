/**
 * 测试对战 HUD 控制器的 DOM 元素管理和分数更新功能
 *
 * @file BattleHUD 单元测试
 */

import BattleHUD from '@/lib/battle/ui/battle-hud.js';

// Mock Base 类
jest.mock('@/lib/core/index.js', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
  });
});

describe('BattleHUD', () => {
  // ==================== 测试数据 ====================

  /** 创建模拟的 DOM 元素 */
  const createMockElement = (textContent = '0') => ({
    textContent,
    nodeType: 1,
    tagName: 'SPAN',
  });

  /** 创建模拟的 Game 实例 */
  const createMockGame = (name, index) => ({
    Player: { name, index },
  });

  /** 创建模拟的 BattleStore 实例 */
  const createMockStore = (scores = {}) => ({
    getScore: jest.fn((id) => scores[id] ?? 0),
  });

  // ==================== 测试套件 ====================

  describe('构造函数', () => {
    test('应该正确继承 Base 类', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();

      const hud = new BattleHUD({ games, store });

      expect(hud.games).toEqual(games);
      expect(hud.store).toEqual(store);
    });

    test('应该自动调用 initialize 方法', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();

      const initializeSpy = jest.spyOn(BattleHUD.prototype, 'initialize');

      new BattleHUD({ games, store });

      expect(initializeSpy).toHaveBeenCalledTimes(1);

      initializeSpy.mockRestore();
    });

    test('应该接受空的 games 数组', () => {
      const store = createMockStore();

      const hud = new BattleHUD({ games: [], store });

      expect(hud.games).toEqual([]);
      expect(hud.elements).toEqual({});
    });
  });

  // ==================== initialize 测试 ====================

  describe('initialize', () => {
    test('应该初始化空的 elements 缓存对象', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();

      const hud = new BattleHUD({ games, store });

      expect(hud.elements).toBeDefined();
      expect(typeof hud.elements).toBe('object');
    });

    test('应该根据命名规则生成正确的选择器', () => {
      const mockQuerySelector = jest.fn();
      document.querySelector = mockQuerySelector;

      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();

      new BattleHUD({ games, store });

      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Alice-0-tetris-battle-score',
      );
    });

    test('应该为每个 Game 实例查询对应的 DOM 元素', () => {
      const mockQuerySelector = jest.fn();
      document.querySelector = mockQuerySelector;

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createMockStore();

      new BattleHUD({ games, store });

      expect(mockQuerySelector).toHaveBeenCalledTimes(2);
      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Alice-0-tetris-battle-score',
      );
      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Bob-1-tetris-battle-score',
      );
    });

    test('应该在找到 DOM 元素时缓存元素引用', () => {
      const mockElement = createMockElement('0');
      document.querySelector = jest.fn(() => mockElement);

      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();

      const hud = new BattleHUD({ games, store });

      expect(hud.elements['Alice-0']).toBe(mockElement);
    });

    test('应该在找不到 DOM 元素时缓存 null', () => {
      document.querySelector = jest.fn(() => null);

      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();

      const hud = new BattleHUD({ games, store });

      expect(hud.elements['Alice-0']).toBeNull();
    });

    test('应该处理不同名称和索引的组合', () => {
      const mockQuerySelector = jest.fn();
      document.querySelector = mockQuerySelector;

      const games = [
        createMockGame('Player1', 0),
        createMockGame('Player2', 1),
        createMockGame('Player3', 2),
      ];
      const store = createMockStore();

      new BattleHUD({ games, store });

      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Player1-0-tetris-battle-score',
      );
      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Player2-1-tetris-battle-score',
      );
      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Player3-2-tetris-battle-score',
      );
    });

    test('应该处理相同名称但不同索引的玩家', () => {
      const mockQuerySelector = jest.fn();
      document.querySelector = mockQuerySelector;

      const games = [createMockGame('Player', 0), createMockGame('Player', 1)];
      const store = createMockStore();

      new BattleHUD({ games, store });

      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Player-0-tetris-battle-score',
      );
      expect(mockQuerySelector).toHaveBeenCalledWith(
        '#Player-1-tetris-battle-score',
      );
    });

    test('空 games 数组不应该查询 DOM', () => {
      const mockQuerySelector = jest.fn();
      document.querySelector = mockQuerySelector;

      const store = createMockStore();

      new BattleHUD({ games: [], store });

      expect(mockQuerySelector).not.toHaveBeenCalled();
    });
  });

  // ==================== getEl 测试 ====================

  describe('getEl', () => {
    test('应该返回缓存的 DOM 元素', () => {
      const mockElement = createMockElement('0');
      document.querySelector = jest.fn(() => mockElement);

      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();
      const hud = new BattleHUD({ games, store });

      const result = hud.getEl('Alice-0');

      expect(result).toBe(mockElement);
    });

    test('应该在元素不存在时返回 null', () => {
      document.querySelector = jest.fn(() => null);

      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();
      const hud = new BattleHUD({ games, store });

      const result = hud.getEl('Alice-0');

      expect(result).toBeNull();
    });

    test('应该在 ID 不存在时返回 undefined', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createMockStore();
      const hud = new BattleHUD({ games, store });

      const result = hud.getEl('NonExistent-99');

      expect(result).toBeUndefined();
    });

    test('应该区分不同玩家的元素', () => {
      const mockElement1 = createMockElement('0');
      const mockElement2 = createMockElement('0');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(mockElement1)
        .mockReturnValueOnce(mockElement2);

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createMockStore();
      const hud = new BattleHUD({ games, store });

      expect(hud.getEl('Alice-0')).toBe(mockElement1);
      expect(hud.getEl('Bob-1')).toBe(mockElement2);
    });
  });

  // ==================== updateScores 测试 ====================

  describe('updateScores', () => {
    test('应该更新胜者和败者的分数显示', () => {
      const winnerEl = createMockElement('0');
      const loserEl = createMockElement('0');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(winnerEl)
        .mockReturnValueOnce(loserEl);

      const scores = { 'Alice-0': 3, 'Bob-1': 1 };
      const store = createMockStore(scores);

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      hud.updateScores(winner, loser);

      expect(winnerEl.textContent).toBe(3);
      expect(loserEl.textContent).toBe(1);
    });

    test('应该从 store 获取正确的分数', () => {
      const mockElement = createMockElement('0');
      document.querySelector = jest.fn(() => mockElement);

      const store = createMockStore({ 'Alice-0': 5, 'Bob-1': 2 });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      hud.updateScores(winner, loser);

      expect(store.getScore).toHaveBeenCalledWith('Alice-0');
      expect(store.getScore).toHaveBeenCalledWith('Bob-1');
    });

    test('应该在元素不存在时不更新（不抛错）', () => {
      document.querySelector = jest.fn(() => null);

      const store = createMockStore({ 'Alice-0': 3, 'Bob-1': 1 });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      expect(() => {
        hud.updateScores(winner, loser);
      }).not.toThrow();
    });

    test('应该处理胜者元素存在但败者元素不存在的情况', () => {
      const winnerEl = createMockElement('0');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(winnerEl)
        .mockReturnValueOnce(null);

      const store = createMockStore({ 'Alice-0': 3, 'Bob-1': 1 });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      expect(() => {
        hud.updateScores(winner, loser);
      }).not.toThrow();

      expect(winnerEl.textContent).toBe(3);
    });

    test('应该处理败者元素存在但胜者元素不存在的情况', () => {
      const loserEl = createMockElement('0');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(loserEl);

      const store = createMockStore({ 'Alice-0': 3, 'Bob-1': 1 });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      expect(() => {
        hud.updateScores(winner, loser);
      }).not.toThrow();

      expect(loserEl.textContent).toBe(1);
    });

    test('应该将分数转换为字符串（textContent 自动转换）', () => {
      const winnerEl = createMockElement('');
      const loserEl = createMockElement('');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(winnerEl)
        .mockReturnValueOnce(loserEl);

      const store = createMockStore({ 'Alice-0': 42, 'Bob-1': 7 });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      hud.updateScores(winner, loser);

      expect(winnerEl.textContent).toBe(42);
      expect(loserEl.textContent).toBe(7);
    });

    test('应该处理分数为 0 的情况', () => {
      const winnerEl = createMockElement('10');
      const loserEl = createMockElement('5');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(winnerEl)
        .mockReturnValueOnce(loserEl);

      const store = createMockStore({ 'Alice-0': 0, 'Bob-1': 0 });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      hud.updateScores(winner, loser);

      expect(winnerEl.textContent).toBe(0);
      expect(loserEl.textContent).toBe(0);
    });

    test('应该覆盖原有的 textContent', () => {
      const winnerEl = createMockElement('old-winner-score');
      const loserEl = createMockElement('old-loser-score');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(winnerEl)
        .mockReturnValueOnce(loserEl);

      const store = createMockStore({ 'Alice-0': 99, 'Bob-1': 88 });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      hud.updateScores(winner, loser);

      expect(winnerEl.textContent).toBe(99);
      expect(winnerEl.textContent).not.toBe('old-winner-score');

      expect(loserEl.textContent).toBe(88);
      expect(loserEl.textContent).not.toBe('old-loser-score');
    });

    test('应该支持多次调用更新分数', () => {
      const winnerEl = createMockElement('0');
      const loserEl = createMockElement('0');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(winnerEl)
        .mockReturnValueOnce(loserEl);

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createMockStore();
      const hud = new BattleHUD({ games, store });

      const winner = createMockGame('Alice', 0);
      const loser = createMockGame('Bob', 1);

      // 第一次更新
      store.getScore.mockImplementation((id) => {
        if (id === 'Alice-0') return 1;
        if (id === 'Bob-1') return 0;
        return 0;
      });
      hud.updateScores(winner, loser);
      expect(winnerEl.textContent).toBe(1);
      expect(loserEl.textContent).toBe(0);

      // 第二次更新
      store.getScore.mockImplementation((id) => {
        if (id === 'Alice-0') return 3;
        if (id === 'Bob-1') return 0;
        return 0;
      });
      hud.updateScores(winner, loser);
      expect(winnerEl.textContent).toBe(3);
      expect(loserEl.textContent).toBe(0);
    });

    test('应该处理胜者和败者相同的情况（边界测试）', () => {
      const mockElement = createMockElement('0');
      document.querySelector = jest.fn(() => mockElement);

      const store = createMockStore({ 'Alice-0': 5 });

      const games = [createMockGame('Alice', 0)];
      const hud = new BattleHUD({ games, store });

      const player = createMockGame('Alice', 0);

      hud.updateScores(player, player);

      expect(store.getScore).toHaveBeenCalledWith('Alice-0');
    });
  });

  // ==================== 集成测试 ====================

  describe('集成测试', () => {
    test('完整的初始化到更新流程', () => {
      const winnerEl = createMockElement('');
      const loserEl = createMockElement('');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(winnerEl)
        .mockReturnValueOnce(loserEl);

      const store = createMockStore({ 'Alice-0': 0, 'Bob-1': 0 });
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const hud = new BattleHUD({ games, store });

      expect(hud.elements).toHaveProperty('Alice-0');
      expect(hud.elements).toHaveProperty('Bob-1');
      expect(hud.getEl('Alice-0')).toBe(winnerEl);
      expect(hud.getEl('Bob-1')).toBe(loserEl);

      store.getScore.mockImplementation((id) => {
        if (id === 'Alice-0') return 1;
        if (id === 'Bob-1') return 0;
        return 0;
      });

      hud.updateScores(createMockGame('Alice', 0), createMockGame('Bob', 1));

      expect(winnerEl.textContent).toBe(1);
      expect(loserEl.textContent).toBe(0);

      store.getScore.mockImplementation((id) => {
        if (id === 'Alice-0') return 2;
        if (id === 'Bob-1') return 0;
        return 0;
      });

      hud.updateScores(createMockGame('Alice', 0), createMockGame('Bob', 1));

      expect(winnerEl.textContent).toBe(2);
      expect(loserEl.textContent).toBe(0);
    });

    test('应该支持 3 人对战场景', () => {
      const el1 = createMockElement('0');
      const el2 = createMockElement('0');
      const el3 = createMockElement('0');

      document.querySelector = jest
        .fn()
        .mockReturnValueOnce(el1)
        .mockReturnValueOnce(el2)
        .mockReturnValueOnce(el3);

      const store = createMockStore({
        'Alice-0': 1,
        'Bob-1': 2,
        'Charlie-2': 3,
      });

      const games = [
        createMockGame('Alice', 0),
        createMockGame('Bob', 1),
        createMockGame('Charlie', 2),
      ];
      const hud = new BattleHUD({ games, store });

      expect(hud.getEl('Alice-0')).toBe(el1);
      expect(hud.getEl('Bob-1')).toBe(el2);
      expect(hud.getEl('Charlie-2')).toBe(el3);

      hud.updateScores(createMockGame('Alice', 0), createMockGame('Bob', 1));

      expect(el1.textContent).toBe(1);
      expect(el2.textContent).toBe(2);
      expect(el3.textContent).toBe('0');
    });
  });
});
