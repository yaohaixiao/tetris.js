import dispatchCommand from '@/lib/engine/dispatch-command.js';

// Mock 所有动作模块
jest.mock('@/lib/game/actions/main-menu-actions.js', () => ({
  __esModule: true,
  default: {
    start: jest.fn(),
    settings: jest.fn(),
  },
}));
jest.mock('@/lib/game/actions/difficulty-actions.js', () => ({
  __esModule: true,
  default: {
    select: jest.fn(),
  },
}));
jest.mock('@/lib/game/actions/game-playing-actions.js', () => ({
  __esModule: true,
  default: {
    move: jest.fn(),
    rotate: jest.fn(),
    drop: jest.fn(),
    pause: jest.fn(),
  },
}));
jest.mock('@/lib/game/actions/paused-actions.js', () => ({
  __esModule: true,
  default: {
    resume: jest.fn(),
    quit: jest.fn(),
  },
}));
jest.mock('@/lib/game/actions/game-over-actions.js', () => ({
  __esModule: true,
  default: {
    restart: jest.fn(),
    mainMenu: jest.fn(),
  },
}));
jest.mock('@/lib/game/actions/replay-actions.js', () => ({
  __esModule: true,
  default: {
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
  },
}));

import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import DIFFICULTY_ACTIONS from '@/lib/game/actions/difficulty-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';
import REPLAY_ACTIONS from '@/lib/game/actions/replay-actions.js';

describe('dispatchCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== mode: main-menu ====================
  describe('main-menu 模式', () => {
    it('应该路由到 MAIN_MENU_ACTIONS 并调用对应 handler', () => {
      const payload = { option: 'new-game' };

      dispatchCommand({ action: 'start', payload }, { mode: 'main-menu' });

      expect(MAIN_MENU_ACTIONS.start).toHaveBeenCalledWith(payload);
    });

    it('应该支持 settings action', () => {
      const payload = { volume: 80 };

      dispatchCommand({ action: 'settings', payload }, { mode: 'main-menu' });

      expect(MAIN_MENU_ACTIONS.settings).toHaveBeenCalledWith(payload);
    });

    it('handler 不存在时应该静默忽略', () => {
      expect(() => {
        dispatchCommand(
          { action: 'nonexistent', payload: {} },
          { mode: 'main-menu' },
        );
      }).not.toThrow();

      expect(MAIN_MENU_ACTIONS.start).not.toHaveBeenCalled();
      expect(MAIN_MENU_ACTIONS.settings).not.toHaveBeenCalled();
    });
  });

  // ==================== mode: difficulty ====================
  describe('difficulty 模式', () => {
    it('应该路由到 DIFFICULTY_ACTIONS 并调用 select', () => {
      const payload = { level: 'hard' };

      dispatchCommand({ action: 'select', payload }, { mode: 'difficulty' });

      expect(DIFFICULTY_ACTIONS.select).toHaveBeenCalledWith(payload);
    });

    it('handler 不存在时应该静默忽略', () => {
      expect(() => {
        dispatchCommand(
          { action: 'unknown', payload: {} },
          { mode: 'difficulty' },
        );
      }).not.toThrow();

      expect(DIFFICULTY_ACTIONS.select).not.toHaveBeenCalled();
    });
  });

  // ==================== mode: playing ====================
  describe('playing 模式', () => {
    it('应该路由到 GAME_PLAYING_ACTIONS 并调用 move', () => {
      const payload = { direction: 'left' };

      dispatchCommand({ action: 'move', payload }, { mode: 'playing' });

      expect(GAME_PLAYING_ACTIONS.move).toHaveBeenCalledWith(payload);
    });

    it('应该支持 rotate action', () => {
      const payload = { direction: 'cw' };

      dispatchCommand({ action: 'rotate', payload }, { mode: 'playing' });

      expect(GAME_PLAYING_ACTIONS.rotate).toHaveBeenCalledWith(payload);
    });

    it('应该支持 drop action', () => {
      const payload = { hard: true };

      dispatchCommand({ action: 'drop', payload }, { mode: 'playing' });

      expect(GAME_PLAYING_ACTIONS.drop).toHaveBeenCalledWith(payload);
    });

    it('应该支持 pause action', () => {
      dispatchCommand({ action: 'pause', payload: {} }, { mode: 'playing' });

      expect(GAME_PLAYING_ACTIONS.pause).toHaveBeenCalledWith({});
    });

    it('handler 不存在时应该静默忽略', () => {
      expect(() => {
        dispatchCommand(
          { action: 'nonexistent', payload: {} },
          { mode: 'playing' },
        );
      }).not.toThrow();

      expect(GAME_PLAYING_ACTIONS.move).not.toHaveBeenCalled();
      expect(GAME_PLAYING_ACTIONS.rotate).not.toHaveBeenCalled();
    });
  });

  // ==================== mode: paused ====================
  describe('paused 模式', () => {
    it('应该路由到 PAUSED_ACTIONS 并调用 resume', () => {
      const payload = { timestamp: 12345 };

      dispatchCommand({ action: 'resume', payload }, { mode: 'paused' });

      expect(PAUSED_ACTIONS.resume).toHaveBeenCalledWith(payload);
    });

    it('应该支持 quit action', () => {
      dispatchCommand({ action: 'quit', payload: {} }, { mode: 'paused' });

      expect(PAUSED_ACTIONS.quit).toHaveBeenCalledWith({});
    });

    it('handler 不存在时应该静默忽略', () => {
      expect(() => {
        dispatchCommand({ action: 'unknown', payload: {} }, { mode: 'paused' });
      }).not.toThrow();

      expect(PAUSED_ACTIONS.resume).not.toHaveBeenCalled();
    });
  });

  // ==================== mode: game-over ====================
  describe('game-over 模式', () => {
    it('应该路由到 GAME_OVER_ACTIONS 并调用 restart', () => {
      const payload = { score: 9999 };

      dispatchCommand({ action: 'restart', payload }, { mode: 'game-over' });

      expect(GAME_OVER_ACTIONS.restart).toHaveBeenCalledWith(payload);
    });

    it('应该支持 mainMenu action', () => {
      dispatchCommand(
        { action: 'mainMenu', payload: {} },
        { mode: 'game-over' },
      );

      expect(GAME_OVER_ACTIONS.mainMenu).toHaveBeenCalledWith({});
    });

    it('handler 不存在时应该静默忽略', () => {
      expect(() => {
        dispatchCommand(
          { action: 'unknown', payload: {} },
          { mode: 'game-over' },
        );
      }).not.toThrow();

      expect(GAME_OVER_ACTIONS.restart).not.toHaveBeenCalled();
    });
  });

  // ==================== mode: replay ====================
  describe('replay 模式', () => {
    it('应该路由到 REPLAY_ACTIONS 并调用 play', () => {
      const payload = { speed: 2 };

      dispatchCommand({ action: 'play', payload }, { mode: 'replay' });

      expect(REPLAY_ACTIONS.play).toHaveBeenCalledWith(payload);
    });

    it('应该支持 pause action', () => {
      dispatchCommand({ action: 'pause', payload: {} }, { mode: 'replay' });

      expect(REPLAY_ACTIONS.pause).toHaveBeenCalledWith({});
    });

    it('应该支持 stop action', () => {
      dispatchCommand({ action: 'stop', payload: {} }, { mode: 'replay' });

      expect(REPLAY_ACTIONS.stop).toHaveBeenCalledWith({});
    });

    it('handler 不存在时应该静默忽略', () => {
      expect(() => {
        dispatchCommand({ action: 'unknown', payload: {} }, { mode: 'replay' });
      }).not.toThrow();

      expect(REPLAY_ACTIONS.play).not.toHaveBeenCalled();
    });
  });

  // ==================== 未知 mode ====================
  describe('未知 mode', () => {
    it('mode 对应的 actions 不存在时应该静默忽略', () => {
      expect(() => {
        dispatchCommand(
          { action: 'start', payload: {} },
          { mode: 'unknown-mode' },
        );
      }).not.toThrow();

      expect(MAIN_MENU_ACTIONS.start).not.toHaveBeenCalled();
    });

    it('不应该影响其他 mode 的 actions', () => {
      dispatchCommand(
        { action: 'start', payload: {} },
        { mode: 'unknown-mode' },
      );

      // 验证所有已知模块都没被调用
      expect(MAIN_MENU_ACTIONS.start).not.toHaveBeenCalled();
      expect(GAME_PLAYING_ACTIONS.move).not.toHaveBeenCalled();
      expect(PAUSED_ACTIONS.resume).not.toHaveBeenCalled();
      expect(GAME_OVER_ACTIONS.restart).not.toHaveBeenCalled();
      expect(REPLAY_ACTIONS.play).not.toHaveBeenCalled();
    });
  });

  // ==================== 模式隔离 ====================
  describe('模式隔离', () => {
    it('同一个 action 名称在不同 mode 下应该路由到不同的 handler', () => {
      dispatchCommand(
        { action: 'pause', payload: { source: 'playing' } },
        { mode: 'playing' },
      );

      dispatchCommand(
        { action: 'pause', payload: { source: 'replay' } },
        { mode: 'replay' },
      );

      expect(GAME_PLAYING_ACTIONS.pause).toHaveBeenCalledWith({
        source: 'playing',
      });
      expect(REPLAY_ACTIONS.pause).toHaveBeenCalledWith({
        source: 'replay',
      });
    });

    it('不同 mode 之间的 actions 应该互不干扰', () => {
      dispatchCommand({ action: 'start', payload: {} }, { mode: 'main-menu' });
      dispatchCommand({ action: 'move', payload: {} }, { mode: 'playing' });
      dispatchCommand(
        { action: 'restart', payload: {} },
        { mode: 'game-over' },
      );

      expect(MAIN_MENU_ACTIONS.start).toHaveBeenCalledTimes(1);
      expect(GAME_PLAYING_ACTIONS.move).toHaveBeenCalledTimes(1);
      expect(GAME_OVER_ACTIONS.restart).toHaveBeenCalledTimes(1);

      // 其他 mode 的 actions 不应该被调用
      expect(DIFFICULTY_ACTIONS.select).not.toHaveBeenCalled();
      expect(PAUSED_ACTIONS.resume).not.toHaveBeenCalled();
      expect(REPLAY_ACTIONS.play).not.toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('cmd 没有 action 字段时应该安全处理', () => {
      expect(() => {
        dispatchCommand({ payload: {} }, { mode: 'playing' });
      }).not.toThrow();

      expect(GAME_PLAYING_ACTIONS.move).not.toHaveBeenCalled();
    });

    it('cmd 为 undefined 时应该抛错（源码未做防御处理）', () => {
      expect(() => {
        dispatchCommand(undefined, { mode: 'playing' });
      }).toThrow();
    });

    it('cmd 为 null 时应该抛错（源码未做防御处理）', () => {
      expect(() => {
        dispatchCommand(null, { mode: 'playing' });
      }).toThrow();
    });

    it('context 没有 mode 字段时应该安全处理', () => {
      expect(() => {
        dispatchCommand({ action: 'move', payload: {} }, {});
      }).not.toThrow();

      expect(GAME_PLAYING_ACTIONS.move).not.toHaveBeenCalled();
    });

    it('context 为 undefined 时应该抛错（源码未做防御处理）', () => {
      expect(() => {
        dispatchCommand({ action: 'move', payload: {} }, undefined);
      }).toThrow();
    });

    it('payload 为 undefined 时应该传递 undefined 给 handler', () => {
      dispatchCommand({ action: 'move' }, { mode: 'playing' });

      expect(GAME_PLAYING_ACTIONS.move).toHaveBeenCalledWith(undefined);
    });

    it('payload 为 null 时应该传递 null 给 handler', () => {
      dispatchCommand({ action: 'move', payload: null }, { mode: 'playing' });

      expect(GAME_PLAYING_ACTIONS.move).toHaveBeenCalledWith(null);
    });
  });
});
