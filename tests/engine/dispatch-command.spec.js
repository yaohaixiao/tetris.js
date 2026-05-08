import dispatchCommand from '@/lib/engine/dispatch-command';
import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions';

// Mock 各 action 模块
jest.mock('@/lib/game/actions/main-menu-actions', () => ({
  START_GAME: jest.fn(),
  QUIT: jest.fn(),
}));

jest.mock('@/lib/game/actions/difficulty-actions', () => ({
  EASY: jest.fn(),
  NORMAL: jest.fn(),
}));

jest.mock('@/lib/game/actions/game-playing-actions', () => ({
  MOVE_LEFT: jest.fn(),
  MOVE_RIGHT: jest.fn(),
  DROP: jest.fn(),
  TOGGLE_PAUSE: jest.fn(),
}));

jest.mock('@/lib/game/actions/paused-actions', () => ({
  RESUME: jest.fn(),
  QUIT: jest.fn(),
}));

jest.mock('@/lib/game/actions/game-over-actions', () => ({
  RESTART: jest.fn(),
  QUIT: jest.fn(),
}));

jest.mock('@/lib/game/actions/replay-actions', () => ({
  CONFIRM: jest.fn(),
  QUIT: jest.fn(),
}));

describe('dispatchCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 路由分发 ==========
  test('main-menu 模式下路由到 MAIN_MENU_ACTIONS', () => {
    dispatchCommand({ action: 'START_GAME', payload: {} }, 'main-menu');
    expect(MAIN_MENU_ACTIONS.START_GAME).toHaveBeenCalledWith({});
  });

  test('playing 模式下路由到 GAME_PLAYING_ACTIONS', () => {
    const GAME_PLAYING_ACTIONS = require('@/lib/game/actions/game-playing-actions');
    dispatchCommand({ action: 'MOVE_LEFT', payload: { direction: 'left' } }, 'playing');
    expect(GAME_PLAYING_ACTIONS.MOVE_LEFT).toHaveBeenCalledWith({ direction: 'left' });
  });

  test('paused 模式下路由到 PAUSED_ACTIONS', () => {
    dispatchCommand({ action: 'RESUME', payload: {} }, 'paused');
    expect(PAUSED_ACTIONS.RESUME).toHaveBeenCalledWith({});
  });

  test('game-over 模式下路由到 GAME_OVER_ACTIONS', () => {
    const GAME_OVER_ACTIONS = require('@/lib/game/actions/game-over-actions');
    dispatchCommand({ action: 'QUIT', payload: {} }, 'game-over');
    expect(GAME_OVER_ACTIONS.QUIT).toHaveBeenCalledWith({});
  });

  test('replay 模式下路由到 REPLAY_ACTIONS', () => {
    const REPLAY_ACTIONS = require('@/lib/game/actions/replay-actions');
    dispatchCommand({ action: 'CONFIRM', payload: {} }, 'replay');
    expect(REPLAY_ACTIONS.CONFIRM).toHaveBeenCalledWith({});
  });

  // ========== 边界情况 ==========
  test('未定义的 mode 不报错', () => {
    expect(() =>
      dispatchCommand({ action: 'MOVE_LEFT', payload: {} }, 'nonexistent')
    ).not.toThrow();
  });

  test('mode 对应的 actions 中没有该 action 时不报错', () => {
    expect(() =>
      dispatchCommand({ action: 'NONEXISTENT', payload: {} }, 'main-menu')
    ).not.toThrow();
  });

  test('空 payload 也能正常传递', () => {
    dispatchCommand({ action: 'START_GAME' }, 'main-menu');
    expect(MAIN_MENU_ACTIONS.START_GAME).toHaveBeenCalledWith(undefined);
  });

  test('带复杂 payload 正确传递', () => {
    const GAME_PLAYING_ACTIONS = require('@/lib/game/actions/game-playing-actions');
    const payload = { level: 5, piece: 'T', rotation: 2 };

    dispatchCommand({ action: 'DROP', payload }, 'playing');
    expect(GAME_PLAYING_ACTIONS.DROP).toHaveBeenCalledWith(payload);
  });

  // ========== handler 执行次数 ==========
  test('每次调用只执行一次 handler', () => {
    dispatchCommand({ action: 'START_GAME', payload: {} }, 'main-menu');
    dispatchCommand({ action: 'START_GAME', payload: {} }, 'main-menu');
    dispatchCommand({ action: 'START_GAME', payload: {} }, 'main-menu');

    expect(MAIN_MENU_ACTIONS.START_GAME).toHaveBeenCalledTimes(3);
  });
});
