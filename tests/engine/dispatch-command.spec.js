import dispatchCommand from '@/lib/engine/dispatch-command.js';

// Mock 所有动作模块
jest.mock('@/lib/game/actions/main-menu-actions.js', () => ({
  __esModule: true,
  default: { start: jest.fn(), settings: jest.fn() },
}));
jest.mock('@/lib/game/actions/difficulty-actions.js', () => ({
  __esModule: true,
  default: { select: jest.fn() },
}));
jest.mock('@/lib/game/actions/game-playing-actions.js', () => ({
  __esModule: true,
  default: { move: jest.fn(), rotate: jest.fn() },
}));
jest.mock('@/lib/game/actions/paused-actions.js', () => ({
  __esModule: true,
  default: { resume: jest.fn() },
}));
jest.mock('@/lib/game/actions/game-over-actions.js', () => ({
  __esModule: true,
  default: { restart: jest.fn() },
}));
jest.mock('@/lib/game/actions/replay-actions.js', () => ({
  __esModule: true,
  default: { play: jest.fn() },
}));

import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';

describe('dispatchCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该根据 mode 路由到对应 action 集合并执行 handler', () => {
    const payload = { direction: 'left' };

    dispatchCommand({ action: 'move', payload }, { mode: 'playing' });

    expect(GAME_PLAYING_ACTIONS.move).toHaveBeenCalledWith(payload);
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

  it('mode 对应的 actions 不存在时应该静默忽略', () => {
    expect(() => {
      dispatchCommand(
        { action: 'start', payload: {} },
        { mode: 'unknown-mode' },
      );
    }).not.toThrow();

    expect(MAIN_MENU_ACTIONS.start).not.toHaveBeenCalled();
  });

  it('cmd 没有 action 字段时应该安全处理', () => {
    expect(() => {
      dispatchCommand({ payload: {} }, { mode: 'playing' });
    }).not.toThrow();
  });

  it('应该与其他 mode 互不干扰', () => {
    dispatchCommand({ action: 'restart', payload: {} }, { mode: 'game-over' });

    expect(GAME_OVER_ACTIONS.restart).toHaveBeenCalled();
    expect(MAIN_MENU_ACTIONS.start).not.toHaveBeenCalled();
  });
});
