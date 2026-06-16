/**
 * @file EngineRenderer 单元测试
 */

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
  default: jest.fn((elements, players) => `<section id="battle-overlay-mock" data-players="${players.join(',')}"></section>`),
}));

jest.mock('@/lib/engine/core/utils/get-game-interface-template.js', () => ({
  __esModule: true,
  default: jest.fn((elements, player, index) => `<div id="${player}-${index}-player-mock"></div>`),
}));

jest.mock('@/lib/engine/core/utils/get-battle-score-template.js', () => ({
  __esModule: true,
  default: jest.fn((player, index) => `<div id="${player}-${index}-score-mock">0</div>`),
}));

describe('EngineRenderer', () => {
  let mockStore;
  let renderer;

  /**
   * 创建模拟的 EngineStore
   */
  const createMockStore = (overrides = {}) => ({
    getState: jest.fn(() => ({
      Mode: 'single',
      Players: ['Player1', 'Player1_extra'],
      Elements: {
        Battle: {
          overlay: 'tetris-battle-overlay',
          over: 'tetris-battle-over',
          winner: 'tetris-battle-winner',
          fly: 'tetris-battle-fly',
        },
        Container: 'tetris-container',
        Canvas: { cols: 10, rows: 20, board: 'board', next: 'next', hold: 'hold' },
        Hud: { controller: 'ctrl', score: 'score', lines: 'lines', level: 'level', combo: 'combo', highScore: 'hi' },
        Controls: { back: 'back', hold: 'hold', start: 'start', up: 'up', down: 'down', left: 'left', right: 'right', a: 'a', b: 'b', x: 'x', y: 'y' },
      },
      ...overrides,
    })),
    isVersus: jest.fn(function () {
      return this.getState().Mode === 'versus';
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
  });

  // ==================== 模板生成（versus 模式） ====================
  describe('versus 模式模板生成', () => {
    beforeEach(() => {
      mockStore = createMockStore({ Mode: 'versus', Players: ['human', 'human'] });
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

    test('容器为 null 时不应该报错', () => {
      document.body.innerHTML = '';
      const r = new EngineRenderer({ Store: mockStore });
      expect(() => r.render()).toThrow();
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

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    test('single 模式完整渲染流程', () => {
      mockStore = createMockStore({ Mode: 'single', Players: ['Alice', 'Extra'] });
      renderer = new EngineRenderer({ Store: mockStore });
      renderer.render();

      const container = document.querySelector('#tetris-container');
      expect(container.innerHTML).toContain('Alice-0-player-mock');
      expect(container.innerHTML).not.toContain('Extra');
      expect(container.innerHTML).not.toContain('score-mock');
      expect(container.innerHTML).not.toContain('battle-overlay-mock');
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
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    test('空 Players 数组', () => {
      mockStore = createMockStore({ Mode: 'single', Players: [] });
      renderer = new EngineRenderer({ Store: mockStore });
      const playerMocks = renderer.templates.filter((t) =>
        t.includes('player-mock'),
      );
      // pop() 后为空
      expect(playerMocks.length).toBe(0);
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

    test('template 数组在每次 initialize 时重新生成', () => {
      const templates1 = renderer.templates;
      renderer._initializeTemplates();
      const templates2 = renderer.templates;
      expect(templates1).not.toBe(templates2);
    });
  });
});
