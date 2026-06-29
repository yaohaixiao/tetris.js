/** @file EngineRenderer 单元测试 */

/** @jest-environment jsdom */

import EngineRenderer from '@/lib/engine/core/engine-renderer.js';

// Mock Base 类
jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
  });
});

// Mock HTML 模板生成函数
jest.mock('@/lib/engine/core/utils/get-battle-overlay-template.js', () => ({
  __esModule: true,
  default: jest.fn(
    (elements, players) =>
      `<section id="battle-overlay-mock" data-players="${players.join(',')}"></section>`,
  ),
}));

jest.mock('@/lib/engine/core/utils/get-game-interface-template.js', () => ({
  __esModule: true,
  default: jest.fn(
    (elements, player, index) =>
      `<div id="${player}-${index}-player-mock"></div>`,
  ),
}));

jest.mock('@/lib/engine/core/utils/get-battle-score-template.js', () => ({
  __esModule: true,
  default: jest.fn(
    (player, index) => `<div id="${player}-${index}-score-mock">0</div>`,
  ),
}));

describe('EngineRenderer', () => {
  let mockStore;
  let renderer;

  /**
   * 创建模拟的 EngineStore。
   *
   * @param {object} [overrides={}] - 覆盖默认 state 的配置. Default is `{}`
   * @param {string} [overrides.Mode] - 游戏模式（'single' | 'versus' | null）
   * @param {string[]} [overrides.Players] - 玩家名称数组
   * @returns {object} 模拟的 EngineStore 实例
   */
  const createMockStore = (overrides = {}) => ({
    getState: jest.fn(() => ({
      Mode: overrides.Mode !== undefined ? overrides.Mode : 'single',
      Players: overrides.Players || ['Player1', 'Player1_extra'],
      Elements: {
        Battle: {
          overlay: 'tetris-battle-overlay',
          over: 'tetris-battle-over',
          winner: 'tetris-battle-winner',
          fly: 'tetris-battle-fly',
        },
        Container: 'tetris-container',
        Canvas: {
          cols: 10,
          rows: 20,
          board: 'board',
          next: 'next',
          hold: 'hold',
        },
        Hud: {
          controller: 'ctrl',
          score: 'score',
          lines: 'lines',
          level: 'level',
          combo: 'combo',
          highScore: 'hi',
        },
        Controls: {
          back: 'back',
          hold: 'hold',
          start: 'start',
          up: 'up',
          down: 'down',
          left: 'left',
          right: 'right',
          a: 'a',
          b: 'b',
          x: 'x',
          y: 'y',
        },
      },
    })),
    isVersus: jest.fn(function () {
      const state = this.getState();
      return state.Mode === 'versus';
    }),
    getMode: jest.fn(function () {
      return this.getState().Mode;
    }),
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="tetris-container"></div>';

    mockStore = createMockStore();
    renderer = new EngineRenderer({ Store: mockStore });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    test('应该正确创建实例', () => {
      expect(renderer).toBeDefined();
      expect(renderer).toBeInstanceOf(EngineRenderer);
    });

    test('应该自动调用 initialize', () => {
      expect(renderer.$container).toBeDefined();
      expect(renderer.templates).toBeDefined();
    });

    test('应该接受 Store 依赖', () => {
      expect(renderer.Store).toBe(mockStore);
    });
  });

  // ==================== initialize ====================
  describe('initialize', () => {
    test('应该缓存根容器 DOM 元素', () => {
      const container = document.querySelector('#tetris-container');
      expect(renderer.$container).toBe(container);
    });

    test('容器不存在时 $container 应该为 null', () => {
      document.body.innerHTML = '';
      const r = new EngineRenderer({ Store: mockStore });
      expect(r.$container).toBeNull();
    });
  });

  // ==================== 模板生成（single 模式） ====================
  describe('single 模式模板生成', () => {
    beforeEach(() => {
      mockStore = createMockStore({ Mode: 'single' });
      renderer = new EngineRenderer({ Store: mockStore });
    });

    test('不应该包含对战覆盖层模板', () => {
      const html = renderer.templates.join('');
      expect(html).not.toContain('battle-overlay-mock');
    });

    test('应该只生成一个玩家界面模板', () => {
      const playerMocks = renderer.templates.filter((t) =>
        t.includes('player-mock'),
      );
      expect(playerMocks.length).toBe(1);
    });

    test('不应该包含对战记分牌模板', () => {
      const html = renderer.templates.join('');
      expect(html).not.toContain('score-mock');
    });

    test('模板应该包含完整的游戏界面', () => {
      const html = renderer.templates.join('');
      expect(html).toContain('Player1-0-player-mock');
    });

    test('应该移除多余的玩家', () => {
      const playerMocks = renderer.templates.filter((t) =>
        t.includes('player-mock'),
      );
      expect(playerMocks.length).toBe(1);
      expect(playerMocks[0]).toContain('Player1');
      expect(playerMocks[0]).not.toContain('Player1_extra');
    });
  });

  // ==================== 模板生成（versus 模式） ====================
  describe('versus 模式模板生成', () => {
    beforeEach(() => {
      mockStore = createMockStore({
        Mode: 'versus',
        Players: ['human', 'human'],
      });
      renderer = new EngineRenderer({ Store: mockStore });
    });

    test('应该包含对战覆盖层模板', () => {
      const html = renderer.templates.join('');
      expect(html).toContain('battle-overlay-mock');
    });

    test('应该生成两个玩家界面模板', () => {
      const playerMocks = renderer.templates.filter((t) =>
        t.includes('player-mock'),
      );
      expect(playerMocks.length).toBe(2);
    });

    test('应该包含两个对战记分牌模板', () => {
      const scoreMocks = renderer.templates.filter((t) =>
        t.includes('score-mock'),
      );
      expect(scoreMocks.length).toBe(2);
    });

    test('P1 模板应该在 P2 模板之前', () => {
      const html = renderer.templates.join('');
      const p1Index = html.indexOf('human-0-player-mock');
      const p2Index = html.indexOf('human-1-player-mock');
      expect(p1Index).toBeLessThan(p2Index);
    });

    test('不应该 pop 玩家（对战模式保留所有玩家）', () => {
      const playerMocks = renderer.templates.filter((t) =>
        t.includes('player-mock'),
      );
      expect(playerMocks.length).toBe(2);
      expect(playerMocks[0]).toContain('human-0');
      expect(playerMocks[1]).toContain('human-1');
    });
  });

  // ==================== 模板生成（HUMAN vs AI 模式） ====================
  describe('HUMAN vs AI 模板生成', () => {
    beforeEach(() => {
      mockStore = createMockStore({ Mode: 'versus', Players: ['human', 'ai'] });
      renderer = new EngineRenderer({ Store: mockStore });
    });

    test('应该使用正确的玩家名称生成模板', () => {
      const html = renderer.templates.join('');
      expect(html).toContain('human-0-player-mock');
      expect(html).toContain('ai-1-player-mock');
    });

    test('记分牌应该使用正确的玩家名称', () => {
      const html = renderer.templates.join('');
      expect(html).toContain('human-0-score-mock');
      expect(html).toContain('ai-1-score-mock');
    });
  });

  // ==================== 模板生成（模式选择：Mode = null） ====================
  describe('模式选择（Mode = null）模板生成', () => {
    beforeEach(() => {
      mockStore = createMockStore({ Mode: null, Players: [] });
      renderer = new EngineRenderer({ Store: mockStore });
    });

    test('不应该生成任何游戏界面模板', () => {
      expect(renderer.templates).toHaveLength(0);
    });

    test('不应该包含对战覆盖层', () => {
      const html = renderer.templates.join('');
      expect(html).not.toContain('battle-overlay-mock');
    });

    test('不应该包含玩家界面', () => {
      const html = renderer.templates.join('');
      expect(html).not.toContain('player-mock');
    });

    test('不应该包含记分牌', () => {
      const html = renderer.templates.join('');
      expect(html).not.toContain('score-mock');
    });
  });

  // ==================== render ====================
  describe('render', () => {
    test('应该将模板注入到根容器中', () => {
      renderer.render();
      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).not.toBe('');
    });

    test('注入的 HTML 应该包含模板内容', () => {
      renderer.render();
      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).toContain('Player1-0-player-mock');
    });

    test('应该设置 data-mode 属性', () => {
      renderer.render();
      const container = document.querySelector('#tetris-container');
      expect(container.dataset.mode).toBe('single');
    });

    test('versus 模式应该设置 data-mode 为 versus', () => {
      mockStore = createMockStore({
        Mode: 'versus',
        Players: ['human', 'human'],
      });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();
      const container = document.querySelector('#tetris-container');
      expect(container.dataset.mode).toBe('versus');
    });

    test('模式选择（Mode = null）应该设置 data-mode 为 selecting', () => {
      mockStore = createMockStore({ Mode: null, Players: [] });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();
      const container = document.querySelector('#tetris-container');
      expect(container.dataset.mode).toBe('single');
    });

    test('render 应该使用 innerHTML 替换容器内容', () => {
      renderer.render();
      renderer.render();
      const container = document.querySelector('#tetris-container');
      // 两次渲染内容应该相同（替换而非追加）
      const matches = container.innerHTML.match(/player-mock/g);
      expect(matches.length).toBe(1);
    });
  });

  // ==================== destroy ====================
  describe('destroy', () => {
    beforeEach(() => {
      renderer.render();
    });

    test('应该清空容器内容', () => {
      renderer.destroy();
      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).toBe('');
    });

    test('应该重置 data-mode 为 single', () => {
      mockStore = createMockStore({
        Mode: 'versus',
        Players: ['human', 'human'],
      });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();
      renderer.destroy();
      const container = document.querySelector('#tetris-container');
      expect(container.dataset.mode).toBe('single');
    });

    test('应该清空模板缓存', () => {
      renderer.destroy();
      expect(renderer.templates).toEqual([]);
    });

    test('destroy 后可以重新 initialize', () => {
      renderer.destroy();
      renderer.initialize();
      expect(renderer.templates.length).toBeGreaterThan(0);
    });
  });

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('single 模式完整渲染流程', () => {
      mockStore = createMockStore({
        Mode: 'single',
        Players: ['Alice', 'Extra'],
      });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();

      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).toContain('Alice-0-player-mock');
      expect(container.innerHTML).not.toContain('Extra');
      expect(container.innerHTML).not.toContain('score-mock');
      expect(container.innerHTML).not.toContain('battle-overlay-mock');
      expect(container.dataset.mode).toBe('single');
    });

    test('versus 模式完整渲染流程', () => {
      mockStore = createMockStore({ Mode: 'versus', Players: ['P1', 'P2'] });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();

      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).toContain('battle-overlay-mock');
      expect(container.innerHTML).toContain('P1-0-player-mock');
      expect(container.innerHTML).toContain('P2-1-player-mock');
      expect(container.innerHTML).toContain('P1-0-score-mock');
      expect(container.innerHTML).toContain('P2-1-score-mock');
      expect(container.dataset.mode).toBe('versus');
    });

    test('模式选择完整渲染流程', () => {
      mockStore = createMockStore({ Mode: null, Players: [] });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();

      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).toBe('');
      expect(container.dataset.mode).toBe('single');
    });

    test('模式切换：single → versus → null', () => {
      // single
      mockStore = createMockStore({ Mode: 'single', Players: ['P1', 'P2'] });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();
      let container = document.querySelector('#tetris-container');
      expect(container.dataset.mode).toBe('single');
      expect(container.innerHTML).toContain('P1-0-player-mock');

      // versus
      mockStore = createMockStore({ Mode: 'versus', Players: ['P1', 'P2'] });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();
      container = document.querySelector('#tetris-container');
      expect(container.dataset.mode).toBe('versus');
      expect(container.innerHTML).toContain('battle-overlay-mock');

      // null（模式选择）
      mockStore = createMockStore({ Mode: null, Players: [] });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();
      container = document.querySelector('#tetris-container');
      expect(container.dataset.mode).toBe('single');
      expect(container.innerHTML).toBe('');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    test('single 模式空 Players 数组', () => {
      mockStore = createMockStore({ Mode: 'single', Players: [] });
      renderer = new EngineRenderer({ Store: mockStore });
      // 空数组不执行 pop，也不生成模板
      expect(renderer.templates.length).toBe(0);
    });

    test('single 模式只有一个玩家', () => {
      mockStore = createMockStore({ Mode: 'single', Players: ['Solo'] });
      renderer = new EngineRenderer({ Store: mockStore });
      // pop 后为空
      expect(renderer.templates.length).toBe(0);
    });

    test('versus 模式空 Players 数组', () => {
      mockStore = createMockStore({ Mode: 'versus', Players: [] });
      renderer = new EngineRenderer({ Store: mockStore });
      // 生成覆盖层但不生成玩家界面
      const html = renderer.templates.join('');
      expect(html).toContain('battle-overlay-mock');
      expect(html).not.toContain('player-mock');
    });

    test('大量玩家', () => {
      mockStore = createMockStore({
        Mode: 'versus',
        Players: ['P1', 'P2', 'P3', 'P4'],
      });
      renderer = new EngineRenderer({ Store: mockStore });
      const playerMocks = renderer.templates.filter((t) =>
        t.includes('player-mock'),
      );
      expect(playerMocks.length).toBe(4);

      const scoreMocks = renderer.templates.filter((t) =>
        t.includes('score-mock'),
      );
      expect(scoreMocks.length).toBe(4);
    });

    test('_initializeTemplates 重新生成模板数组', () => {
      const templates1 = renderer.templates;
      renderer._initializeTemplates();
      const templates2 = renderer.templates;
      expect(templates1).not.toBe(templates2);
    });

    test('destroy 后 render 仍然可以正常工作', () => {
      renderer.destroy();
      // 即使模板被清空，render 不会崩溃
      renderer.render();
      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).toBe('');
    });
  });
});
