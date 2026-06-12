/**
 * 测试游戏界面绘制函数
 *
 * @file DrawInterface 单元测试
 */

/** @jest-environment jsdom */

import drawInterface from '@/lib/engine/draw-interface.js';

describe('drawInterface', () => {
  /** 创建新的配置对象（避免测试间共享状态） */
  const createConfig = (overrides = {}) => ({
    Mode: 'single',
    Players: ['Player1', 'Player1_extra'],
    Elements: {
      Battle: {
        overlay: 'tetris-battle-overlay',
        winner: 'tetris-battle-winner',
      },
      Container: 'tetris-container',
      Canvas: {
        cols: 10,
        rows: 20,
        board: 'tetris-game-board',
        next: 'tetris-next-piece',
        hold: 'tetri-hold-piece',
      },
      Hud: {
        controller: 'tetris-controller',
        score: 'tetris-score',
        lines: 'tetris-lines',
        level: 'tetris-level',
        combo: 'tetris-combo',
        highScore: 'tetris-high-score',
      },
      Controls: {
        back: 'tetris-btn-back',
        hold: 'tetris-btn-hold',
        start: 'tetris-btn-start',
        up: 'tetris-dpad-up',
        down: 'tetris-dpad-down',
        left: 'tetris-dpad-left',
        right: 'tetris-dpad-right',
        a: 'tetris-btn-a',
        b: 'tetris-btn-b',
        x: 'tetris-btn-x',
        y: 'tetris-btn-y',
      },
    },
    ...overrides,
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="tetris-container"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ==================== 容器验证 ====================
  describe('容器', () => {
    it('应该将 HTML 注入到指定容器中', () => {
      const config = createConfig({ Mode: 'single' }); // ★ 不覆盖 Players，使用默认的 2 个
      drawInterface(config);

      const container = document.querySelector('#tetris-container');
      expect(container).not.toBeNull();
      expect(container.innerHTML).not.toBe('');
    });

    it('容器不存在时应该报错', () => {
      document.body.innerHTML = '';
      const config = createConfig();
      expect(() => drawInterface(config)).toThrow();
    });
  });

  // ==================== 单人模式 ====================
  describe('single 模式', () => {
    beforeEach(() => {
      const config = createConfig({
        Mode: 'single',
        Players: ['Player1', 'Player2'],
      });
      drawInterface(config);
    });

    it('应该只生成一个玩家界面', () => {
      const players = document.querySelectorAll('.tetris-player');
      expect(players.length).toBe(1);
    });

    it('不应该生成对战覆盖层', () => {
      const overlay = document.querySelector('#tetris-battle-overlay');
      expect(overlay).toBeNull();
    });

    it('不应该生成对战记分牌', () => {
      const scores = document.querySelectorAll('.tetris-battle-score');
      expect(scores.length).toBe(0);
    });

    it('应该生成完整的 HUD 元素', () => {
      expect(document.querySelector('#Player1-0-tetris-score')).not.toBeNull();
      expect(document.querySelector('#Player1-0-tetris-lines')).not.toBeNull();
      expect(document.querySelector('#Player1-0-tetris-level')).not.toBeNull();
      expect(document.querySelector('#Player1-0-tetris-combo')).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-high-score'),
      ).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-controller'),
      ).not.toBeNull();
    });

    it('应该生成棋盘 Canvas', () => {
      const board = document.querySelector('#Player1-0-tetris-game-board');
      expect(board).not.toBeNull();
      expect(board.tagName).toBe('CANVAS');
      expect(board.dataset.mode).toBe('main-menu');
    });

    it('应该生成预览方块 Canvas', () => {
      const next = document.querySelector('#Player1-0-tetris-next-piece');
      expect(next).not.toBeNull();
      expect(next.tagName).toBe('CANVAS');
      expect(next.classList.contains('tetris-next-piece')).toBe(true);
    });

    it('应该生成缓存方块 Canvas', () => {
      const hold = document.querySelector('#Player1-0-tetri-hold-piece');
      expect(hold).not.toBeNull();
      expect(hold.tagName).toBe('CANVAS');
      expect(hold.classList.contains('tetris-hold-piece')).toBe(true);
    });

    it('应该生成所有控制按钮', () => {
      expect(
        document.querySelector('#Player1-0-tetris-btn-back'),
      ).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-btn-hold'),
      ).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-btn-start'),
      ).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-dpad-up'),
      ).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-dpad-down'),
      ).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-dpad-left'),
      ).not.toBeNull();
      expect(
        document.querySelector('#Player1-0-tetris-dpad-right'),
      ).not.toBeNull();
      expect(document.querySelector('#Player1-0-tetris-btn-a')).not.toBeNull();
      expect(document.querySelector('#Player1-0-tetris-btn-b')).not.toBeNull();
      expect(document.querySelector('#Player1-0-tetris-btn-x')).not.toBeNull();
      expect(document.querySelector('#Player1-0-tetris-btn-y')).not.toBeNull();
    });

    it('控制按钮应该有正确的 data-key 属性', () => {
      expect(
        document.querySelector('#Player1-0-tetris-btn-back').dataset.key,
      ).toBe('back');
      expect(
        document.querySelector('#Player1-0-tetris-btn-hold').dataset.key,
      ).toBe('hold');
      expect(
        document.querySelector('#Player1-0-tetris-btn-start').dataset.key,
      ).toBe('start');
      expect(
        document.querySelector('#Player1-0-tetris-dpad-up').dataset.key,
      ).toBe('dpad_up');
      expect(
        document.querySelector('#Player1-0-tetris-dpad-down').dataset.key,
      ).toBe('dpad_down');
      expect(
        document.querySelector('#Player1-0-tetris-dpad-left').dataset.key,
      ).toBe('dpad_left');
      expect(
        document.querySelector('#Player1-0-tetris-dpad-right').dataset.key,
      ).toBe('dpad_right');
      expect(
        document.querySelector('#Player1-0-tetris-btn-a').dataset.key,
      ).toBe('a');
      expect(
        document.querySelector('#Player1-0-tetris-btn-b').dataset.key,
      ).toBe('b');
      expect(
        document.querySelector('#Player1-0-tetris-btn-x').dataset.key,
      ).toBe('x');
      expect(
        document.querySelector('#Player1-0-tetris-btn-y').dataset.key,
      ).toBe('y');
    });

    it('不应该修改原始 Players 数组', () => {
      const originalPlayers = ['Player1', 'Player2'];
      const config = createConfig({ Players: originalPlayers, Mode: 'single' });
      drawInterface(config);
      expect(originalPlayers).toEqual(['Player1', 'Player2']);
    });
  });

  // ==================== 对战模式 ====================
  describe('versus 模式', () => {
    beforeEach(() => {
      const config = createConfig({
        Mode: 'versus',
        Players: ['human', 'human'],
      });
      drawInterface(config);
    });

    it('应该生成两个玩家界面', () => {
      const players = document.querySelectorAll('.tetris-player');
      expect(players.length).toBe(2);
    });

    it('应该生成对战覆盖层', () => {
      const overlay = document.querySelector('#tetris-battle-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay.classList.contains('tetris-hidden')).toBe(true);
    });

    it('对战覆盖层应该包含标题', () => {
      const title = document.querySelector('.tetris-battle-title');
      expect(title).not.toBeNull();
      expect(title.textContent).toBe('BATTLE OVER');
    });

    it('对战覆盖层应该包含胜者显示元素', () => {
      const winner = document.querySelector('#tetris-battle-winner');
      expect(winner).not.toBeNull();
      expect(winner.textContent).toBe('HUMAN');
    });

    it('对战覆盖层应该包含重赛提示', () => {
      const rematch = document.querySelector('#tetris-battle-rematch');
      expect(rematch).not.toBeNull();
      expect(rematch.textContent).toBe('ENTER TO REMATCH');
    });

    it('应该生成两个对战记分牌', () => {
      const scores = document.querySelectorAll('.tetris-battle-score');
      expect(scores.length).toBe(2);
    });

    it('记分牌应该显示正确的玩家编号', () => {
      const scoreLabels = document.querySelectorAll('.tetris-battle-player');
      expect(scoreLabels[0].textContent).toBe('1P');
      expect(scoreLabels[1].textContent).toBe('2P');
    });

    it('记分牌应该包含记分 span', () => {
      expect(
        document.querySelector('#human-0-tetris-battle-score'),
      ).not.toBeNull();
      expect(
        document.querySelector('#human-1-tetris-battle-score'),
      ).not.toBeNull();
    });

    it('记分牌初始值应该为 0', () => {
      expect(
        document.querySelector('#human-0-tetris-battle-score').textContent,
      ).toBe('0');
      expect(
        document.querySelector('#human-1-tetris-battle-score').textContent,
      ).toBe('0');
    });

    it('P1 和 P2 界面应该独立', () => {
      const p1Board = document.querySelector('#human-0-tetris-game-board');
      const p2Board = document.querySelector('#human-1-tetris-game-board');
      expect(p1Board).not.toBeNull();
      expect(p2Board).not.toBeNull();
      expect(p1Board).not.toBe(p2Board);
    });

    it('P1 和 P2 的控制按钮应该独立', () => {
      expect(document.querySelector('#human-0-tetris-btn-a')).not.toBeNull();
      expect(document.querySelector('#human-1-tetris-btn-a')).not.toBeNull();
    });
  });

  // ==================== AI 对战模式 ====================
  describe('HUMAN vs AI 模式', () => {
    beforeEach(() => {
      const config = createConfig({
        Mode: 'versus',
        Players: ['human', 'ai'],
      });
      drawInterface(config);
    });

    it('应该使用正确的玩家名称生成 ID', () => {
      expect(
        document.querySelector('#human-0-tetris-game-board'),
      ).not.toBeNull();
      expect(document.querySelector('#ai-1-tetris-game-board')).not.toBeNull();
    });

    it('记分牌应该使用正确的玩家名称', () => {
      expect(
        document.querySelector('#human-0-tetris-battle-score'),
      ).not.toBeNull();
      expect(
        document.querySelector('#ai-1-tetris-battle-score'),
      ).not.toBeNull();
    });
  });

  // ==================== 元素 ID 命名规则 ====================
  describe('元素 ID 命名规则', () => {
    it('应该遵循 {name}-{index}-{elementId} 格式', () => {
      const config = createConfig({
        Players: ['Alice', 'Bob'],
        Mode: 'versus',
      });
      drawInterface(config);

      expect(
        document.querySelector('#Alice-0-tetris-game-board'),
      ).not.toBeNull();
      expect(document.querySelector('#Alice-0-tetris-score')).not.toBeNull();
      expect(document.querySelector('#Alice-0-tetris-btn-a')).not.toBeNull();

      expect(document.querySelector('#Bob-1-tetris-game-board')).not.toBeNull();
      expect(document.querySelector('#Bob-1-tetris-score')).not.toBeNull();
      expect(document.querySelector('#Bob-1-tetris-btn-a')).not.toBeNull();
    });

    it('相同名称不同索引应该生成不同 ID', () => {
      const config = createConfig({
        Players: ['Player', 'Player'],
        Mode: 'versus',
      });
      drawInterface(config);

      const p1 = document.querySelector('#Player-0-tetris-game-board');
      const p2 = document.querySelector('#Player-1-tetris-game-board');
      expect(p1).not.toBeNull();
      expect(p2).not.toBeNull();
      expect(p1).not.toBe(p2);
    });
  });

  // ==================== HUD 默认值 ====================
  describe('HUD 默认值', () => {
    beforeEach(() => {
      const config = createConfig({
        Mode: 'single',
        Players: ['Player1', 'Player2'],
      });
      drawInterface(config);
    });

    it('分数初始值应该为 00000', () => {
      expect(
        document.querySelector('#Player1-0-tetris-score').textContent,
      ).toBe('00000');
    });

    it('行数初始值应该为 00', () => {
      expect(
        document.querySelector('#Player1-0-tetris-lines').textContent,
      ).toBe('00');
    });

    it('等级初始值应该为 01', () => {
      expect(
        document.querySelector('#Player1-0-tetris-level').textContent,
      ).toBe('01');
    });

    it('连击初始值应该为 00', () => {
      expect(
        document.querySelector('#Player1-0-tetris-combo').textContent,
      ).toBe('00');
    });

    it('最高分初始值应该为 00000', () => {
      expect(
        document.querySelector('#Player1-0-tetris-high-score').textContent,
      ).toBe('00000');
    });

    it('控制者标识初始值应该为 Human', () => {
      expect(
        document.querySelector('#Player1-0-tetris-controller').textContent,
      ).toBe('Human');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('空 Players 数组不应该生成界面', () => {
      const config = createConfig({ Players: [], Mode: 'single' });
      drawInterface(config);

      const players = document.querySelectorAll('.tetris-player');
      expect(players.length).toBe(0);
    });

    it('大量玩家时应该正确生成所有界面', () => {
      const config = createConfig({
        Players: ['P1', 'P2', 'P3', 'P4'],
        Mode: 'versus',
      });
      drawInterface(config);

      const players = document.querySelectorAll('.tetris-player');
      expect(players.length).toBe(4);

      const scores = document.querySelectorAll('.tetris-battle-score');
      expect(scores.length).toBe(4);
    });

    it('重复调用应该覆盖之前的内容', () => {
      const config1 = createConfig({
        Players: ['First', 'Extra'],
        Mode: 'single',
      });
      drawInterface(config1);
      expect(
        document.querySelector('#First-0-tetris-game-board'),
      ).not.toBeNull();

      const config2 = createConfig({
        Players: ['Second', 'Extra'],
        Mode: 'single',
      });
      drawInterface(config2);
      expect(document.querySelector('#First-0-tetris-game-board')).toBeNull();
      expect(
        document.querySelector('#Second-0-tetris-game-board'),
      ).not.toBeNull();
    });
  });
});
