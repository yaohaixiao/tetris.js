/**
 * 测试游戏界面绘制函数
 *
 * @file DrawInterface 单元测试
 */

/** @jest-environment jsdom */

import drawInterface from '@/lib/engine/draw-interface.js';

describe('drawInterface', () => {
  /**
   * 创建新的配置对象（避免测试间共享状态）。
   *
   * 每次调用返回全新的配置对象，通过 overrides 参数覆盖默认值。
   * 默认配置包含完整的 Elements 结构（Canvas、Hud、Controls、Battle）。
   *
   * @param {object} [overrides={}] - 要覆盖的配置项
   * @param {string} [overrides.Mode] - 游戏模式（"single" | "versus"）
   * @param {string[]} [overrides.Players] - 玩家名称数组
   * @returns {object} 完整的配置对象
   */
  const createConfig = (overrides = {}) => ({
    // 默认单人模式
    Mode: 'single',
    // 默认玩家列表（包含一个额外的用于 pop 的玩家）
    Players: ['Player1', 'Player1_extra'],
    Elements: {
      // 对战模式专属元素 ID 配置
      Battle: {
        overlay: 'tetris-battle-overlay',
        over: 'tetris-battle-over',
        winner: 'tetris-battle-winner',
        fly: 'tetris-battle-fly',
      },
      // 根容器元素 ID
      Container: 'tetris-container',
      // Canvas 元素 ID 配置
      Canvas: {
        cols: 10,
        rows: 20,
        board: 'tetris-game-board',
        next: 'tetris-next-piece',
        hold: 'tetri-hold-piece',
      },
      // HUD 数据显示元素 ID 配置
      Hud: {
        controller: 'tetris-controller',
        score: 'tetris-score',
        lines: 'tetris-lines',
        level: 'tetris-level',
        combo: 'tetris-combo',
        highScore: 'tetris-high-score',
      },
      // 控制按钮元素 ID 配置
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
    // 合并调用方传入的覆盖配置
    ...overrides,
  });

  /**
   * 每个测试用例执行前：
   * 在 document.body 中创建根容器 #tetris-container，
   * 模拟真实的 DOM 环境。
   */
  beforeEach(() => {
    document.body.innerHTML = '<div id="tetris-container"></div>';
  });

  /**
   * 每个测试用例执行后：
   * 清空 document.body，避免测试间 DOM 残留干扰。
   */
  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ==================== 容器验证 ====================
  describe('容器', () => {
    /**
     * 验证 drawInterface 能将生成的 HTML 注入到指定容器中。
     * 容器不应为空。
     */
    it('应该将 HTML 注入到指定容器中', () => {
      const config = createConfig({ Mode: 'single' });
      drawInterface(config);

      const container = document.querySelector('#tetris-container');
      expect(container).not.toBeNull();
      expect(container.innerHTML).not.toBe('');
    });

    /**
     * 验证容器不存在时 drawInterface 抛出错误。
     * 因为 document.querySelector 返回 null，后续操作会失败。
     */
    it('容器不存在时应该报错', () => {
      document.body.innerHTML = '';
      const config = createConfig();
      expect(() => drawInterface(config)).toThrow();
    });
  });

  // ==================== 单人模式 ====================
  describe('single 模式', () => {
    /**
     * 每个测试用例执行前：
     * 使用单人模式配置调用 drawInterface 生成界面。
     * Players 包含 2 个元素，single 模式会 pop 掉最后一个。
     */
    beforeEach(() => {
      const config = createConfig({
        Mode: 'single',
        Players: ['Player1', 'Player2'],
      });
      drawInterface(config);
    });

    /**
     * 单人模式只应生成一个 .tetris-player 元素。
     */
    it('应该只生成一个玩家界面', () => {
      const players = document.querySelectorAll('.tetris-player');
      expect(players.length).toBe(1);
    });

    /**
     * 单人模式不应生成对战覆盖层（#tetris-battle-overlay）。
     */
    it('不应该生成对战覆盖层', () => {
      const overlay = document.querySelector('#tetris-battle-overlay');
      expect(overlay).toBeNull();
    });

    /**
     * 单人模式不应生成对战记分牌（.tetris-battle-score）。
     */
    it('不应该生成对战记分牌', () => {
      const scores = document.querySelectorAll('.tetris-battle-score');
      expect(scores.length).toBe(0);
    });

    /**
     * 验证所有 HUD 数据显示元素（分数、行数、等级、连击、最高分、控制者）
     * 都使用正确的 ID 格式生成。
     */
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

    /**
     * 验证棋盘 Canvas 正确生成，包括标签名和 data-mode 属性。
     */
    it('应该生成棋盘 Canvas', () => {
      const board = document.querySelector('#Player1-0-tetris-game-board');
      expect(board).not.toBeNull();
      expect(board.tagName).toBe('CANVAS');
      expect(board.dataset.mode).toBe('main-menu');
    });

    /**
     * 验证预览方块 Canvas 正确生成，包含正确的 CSS 类名。
     */
    it('应该生成预览方块 Canvas', () => {
      const next = document.querySelector('#Player1-0-tetris-next-piece');
      expect(next).not.toBeNull();
      expect(next.tagName).toBe('CANVAS');
      expect(next.classList.contains('tetris-next-piece')).toBe(true);
    });

    /**
     * 验证缓存方块 Canvas 正确生成，包含正确的 CSS 类名。
     */
    it('应该生成缓存方块 Canvas', () => {
      const hold = document.querySelector('#Player1-0-tetri-hold-piece');
      expect(hold).not.toBeNull();
      expect(hold.tagName).toBe('CANVAS');
      expect(hold.classList.contains('tetris-hold-piece')).toBe(true);
    });

    /**
     * 验证所有 12 个 GAME BOY 风格控制按钮都正确生成：
     * BACK、HOLD、START、D-PAD（↑↓←→）、ABXY。
     */
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

    /**
     * 验证每个控制按钮的 data-key 属性值正确，
     * 用于输入事件到游戏命令的映射。
     */
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

    /**
     * 验证 drawInterface 不会修改传入的原始 Players 数组。
     * 函数内部使用扩展运算符创建副本后再 pop。
     */
    it('不应该修改原始 Players 数组', () => {
      const originalPlayers = ['Player1', 'Player2'];
      const config = createConfig({ Players: originalPlayers, Mode: 'single' });
      drawInterface(config);
      expect(originalPlayers).toEqual(['Player1', 'Player2']);
    });
  });

  // ==================== 对战模式 ====================
  describe('versus 模式', () => {
    /**
     * 每个测试用例执行前：
     * 使用对战模式配置调用 drawInterface 生成两个玩家的界面。
     */
    beforeEach(() => {
      const config = createConfig({
        Mode: 'versus',
        Players: ['human', 'human'],
      });
      drawInterface(config);
    });

    /**
     * 对战模式应生成两个 .tetris-player 元素（P1 和 P2）。
     */
    it('应该生成两个玩家界面', () => {
      const players = document.querySelectorAll('.tetris-player');
      expect(players.length).toBe(2);
    });

    /**
     * 对战模式应生成覆盖层容器，默认隐藏（tetris-hidden 类）。
     */
    it('应该生成对战覆盖层', () => {
      const overlay = document.querySelector('#tetris-battle-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay.classList.contains('tetris-hidden')).toBe(true);
    });

    /**
     * 覆盖层内应包含 "BATTLE OVER" 标题。
     */
    it('对战覆盖层应该包含标题', () => {
      const title = document.querySelector('.tetris-battle-title');
      expect(title).not.toBeNull();
      expect(title.textContent).toBe('BATTLE OVER');
    });

    /**
     * 覆盖层内应包含胜者名称显示元素，默认文本为 "HUMAN"。
     */
    it('对战覆盖层应该包含胜者显示元素', () => {
      const winner = document.querySelector('#tetris-battle-winner');
      expect(winner).not.toBeNull();
      expect(winner.textContent).toBe('HUMAN');
    });

    /**
     * 覆盖层内应包含重赛提示 "ENTER TO REMATCH"。
     * 注意：现在使用 class 选择器而非 id。
     */
    it('对战覆盖层应该包含重赛提示', () => {
      const rematch = document.querySelector('.tetris-battle-rematch');
      expect(rematch).not.toBeNull();
      expect(rematch.textContent).toBe('ENTER TO REMATCH');
    });

    /**
     * 对战模式应为每位玩家生成一个记分牌。
     */
    it('应该生成两个对战记分牌', () => {
      const scores = document.querySelectorAll('.tetris-battle-score');
      expect(scores.length).toBe(2);
    });

    /**
     * 记分牌应显示正确的玩家编号：P1 = 1P，P2 = 2P。
     */
    it('记分牌应该显示正确的玩家编号', () => {
      const scoreLabels = document.querySelectorAll('.tetris-battle-player');
      expect(scoreLabels[0].textContent).toBe('1P');
      expect(scoreLabels[1].textContent).toBe('2P');
    });

    /**
     * 记分牌内应包含记分 span 元素，ID 格式为 {player}-{index}-tetris-battle-score。
     */
    it('记分牌应该包含记分 span', () => {
      expect(
        document.querySelector('#human-0-tetris-battle-score'),
      ).not.toBeNull();
      expect(
        document.querySelector('#human-1-tetris-battle-score'),
      ).not.toBeNull();
    });

    /**
     * 记分牌初始值应为 "0"。
     */
    it('记分牌初始值应该为 0', () => {
      expect(
        document.querySelector('#human-0-tetris-battle-score').textContent,
      ).toBe('0');
      expect(
        document.querySelector('#human-1-tetris-battle-score').textContent,
      ).toBe('0');
    });

    /**
     * P1 和 P2 的棋盘 Canvas 应为不同的 DOM 元素。
     */
    it('P1 和 P2 界面应该独立', () => {
      const p1Board = document.querySelector('#human-0-tetris-game-board');
      const p2Board = document.querySelector('#human-1-tetris-game-board');
      expect(p1Board).not.toBeNull();
      expect(p2Board).not.toBeNull();
      expect(p1Board).not.toBe(p2Board);
    });

    /**
     * P1 和 P2 的控制按钮应为不同的 DOM 元素。
     */
    it('P1 和 P2 的控制按钮应该独立', () => {
      expect(document.querySelector('#human-0-tetris-btn-a')).not.toBeNull();
      expect(document.querySelector('#human-1-tetris-btn-a')).not.toBeNull();
    });
  });

  // ==================== AI 对战模式 ====================
  describe('HUMAN vs AI 模式', () => {
    /**
     * 每个测试用例执行前：
     * 使用 human vs ai 对战配置生成界面。
     */
    beforeEach(() => {
      const config = createConfig({
        Mode: 'versus',
        Players: ['human', 'ai'],
      });
      drawInterface(config);
    });

    /**
     * 验证玩家名称正确反映在生成的元素 ID 中。
     * P1 使用 human-0 前缀，P2 使用 ai-1 前缀。
     */
    it('应该使用正确的玩家名称生成 ID', () => {
      expect(
        document.querySelector('#human-0-tetris-game-board'),
      ).not.toBeNull();
      expect(document.querySelector('#ai-1-tetris-game-board')).not.toBeNull();
    });

    /**
     * 验证记分牌的 ID 也使用正确的玩家名称。
     */
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
    /**
     * 验证所有元素的 ID 遵循 {name}-{index}-{elementId} 格式。
     * 使用 Alice 和 Bob 作为玩家名称测试。
     */
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

    /**
     * 验证相同名称不同索引的玩家生成不同的元素 ID。
     */
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
    /**
     * 每个测试用例执行前：
     * 使用单人模式生成界面。
     */
    beforeEach(() => {
      const config = createConfig({
        Mode: 'single',
        Players: ['Player1', 'Player2'],
      });
      drawInterface(config);
    });

    /**
     * 分数初始显示应为 "00000"（5 位数字）。
     */
    it('分数初始值应该为 00000', () => {
      expect(
        document.querySelector('#Player1-0-tetris-score').textContent,
      ).toBe('00000');
    });

    /**
     * 行数初始显示应为 "00"。
     */
    it('行数初始值应该为 00', () => {
      expect(
        document.querySelector('#Player1-0-tetris-lines').textContent,
      ).toBe('00');
    });

    /**
     * 等级初始显示应为 "01"。
     */
    it('等级初始值应该为 01', () => {
      expect(
        document.querySelector('#Player1-0-tetris-level').textContent,
      ).toBe('01');
    });

    /**
     * 连击初始显示应为 "00"。
     */
    it('连击初始值应该为 00', () => {
      expect(
        document.querySelector('#Player1-0-tetris-combo').textContent,
      ).toBe('00');
    });

    /**
     * 最高分初始显示应为 "00000"。
     */
    it('最高分初始值应该为 00000', () => {
      expect(
        document.querySelector('#Player1-0-tetris-high-score').textContent,
      ).toBe('00000');
    });

    /**
     * 控制者标识初始显示应为 "Human"。
     */
    it('控制者标识初始值应该为 Human', () => {
      expect(
        document.querySelector('#Player1-0-tetris-controller').textContent,
      ).toBe('Human');
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    /**
     * 空 Players 数组不应生成任何玩家界面。
     */
    it('空 Players 数组不应该生成界面', () => {
      const config = createConfig({ Players: [], Mode: 'single' });
      drawInterface(config);

      const players = document.querySelectorAll('.tetris-player');
      expect(players.length).toBe(0);
    });

    /**
     * 大量玩家时（如 4 个）应正确生成所有界面和记分牌。
     */
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

    /**
     * 重复调用 drawInterface 应覆盖之前的内容，
     * 旧的元素不应残留。
     */
    it('重复调用应该覆盖之前的内容', () => {
      // 第一次调用生成 First 玩家的界面
      const config1 = createConfig({
        Players: ['First', 'Extra'],
        Mode: 'single',
      });
      drawInterface(config1);
      expect(
        document.querySelector('#First-0-tetris-game-board'),
      ).not.toBeNull();

      // 第二次调用生成 Second 玩家的界面，First 应被清除
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
