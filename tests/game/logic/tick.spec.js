import tick from '@/lib/game/logic/tick';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import move from '@/lib/game/logic/move';
import lock from '@/lib/game/logic/lock';
import clearLines from '@/lib/game/logic/clear-lines';
import spawn from '@/lib/game/logic/spawn';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getMode: jest.fn(() => 'playing'),
  },
}));

jest.mock('@/lib/game/logic/move', () => jest.fn());
jest.mock('@/lib/game/logic/lock', () => jest.fn());
jest.mock('@/lib/game/logic/clear-lines', () => jest.fn());
jest.mock('@/lib/game/logic/spawn', () => jest.fn());

describe('tick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== mode 拦截 ==========
  test('main-menu 模式时不执行', () => {
    Game.store.getMode.mockReturnValue('main-menu');
    tick(false);

    expect(EventBus.emit).not.toHaveBeenCalled();
    expect(move).not.toHaveBeenCalled();
  });

  test('game-over 模式时不执行', () => {
    Game.store.getMode.mockReturnValue('game-over');
    tick(false);

    expect(move).not.toHaveBeenCalled();
  });

  test('paused 模式时不执行', () => {
    Game.store.getMode.mockReturnValue('paused');
    tick(false);

    expect(move).not.toHaveBeenCalled();
  });

  test('isBlocked = true 时不执行', () => {
    Game.store.getMode.mockReturnValue('playing');
    tick(true);

    expect(move).not.toHaveBeenCalled();
  });

  // ========== playing 模式 ==========
  test('playing 时发射 AUTO_TICK', () => {
    Game.store.getMode.mockReturnValue('playing');
    move.mockReturnValue(true);

    tick(false);

    expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: {},
    });
  });

  test('replay 模式下不发射 AUTO_TICK', () => {
    Game.store.getMode.mockReturnValue('replay');
    move.mockReturnValue(true);

    tick(false);

    expect(EventBus.emit).not.toHaveBeenCalledWith(
      'dispatch:input',
      expect.any(Object),
    );
  });

  // ========== move 成功 ==========
  test('move 成功时不执行 lock/spawn', () => {
    Game.store.getMode.mockReturnValue('playing');
    move.mockReturnValue(true);

    tick(false);

    expect(lock).not.toHaveBeenCalled();
    expect(clearLines).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
  });

  // ========== move 失败 ==========
  test('move 失败时执行 lock → fall → clearLines → spawn', () => {
    Game.store.getMode.mockReturnValue('playing');
    move.mockReturnValue(false);

    tick(false);

    expect(lock).toHaveBeenCalled();
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:fall');
    expect(clearLines).toHaveBeenCalled();
    expect(spawn).toHaveBeenCalled();
  });

  test('move 失败时顺序正确', () => {
    Game.store.getMode.mockReturnValue('playing');
    move.mockReturnValue(false);

    tick(false);

    // lock 被调过
    expect(lock).toHaveBeenCalled();
    // fall 音效被发过
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:fall');
    // 两者都被调过
    expect(lock).toHaveBeenCalled();
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:fall');
  });

  test('replay 模式下 move 失败也执行 lock/spawn', () => {
    Game.store.getMode.mockReturnValue('replay');
    move.mockReturnValue(false);

    tick(false);

    expect(lock).toHaveBeenCalled();
    expect(spawn).toHaveBeenCalled();
  });
});
