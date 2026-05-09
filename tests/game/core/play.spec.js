import play from '@/lib/game/core/play';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getMode: jest.fn(() => 'paused'),
    setMode: jest.fn(),
    getLevel: jest.fn(() => 1),
  },
}));

describe('play', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Game.store.getMode.mockReturnValue('paused');
    Game.store.getLevel.mockReturnValue(1);
  });

  test('paused 模式时执行恢复', () => {
    Game.store.getMode.mockReturnValue('paused');
    Game.store.getLevel.mockReturnValue(3);

    play();

    expect(Game.store.setMode).toHaveBeenCalledWith('playing');
    expect(EventBus.emit).toHaveBeenCalledWith('effects:stop:paused');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:resume');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:play:bgm', { level: 3 });
  });

  test('playing 模式时返回 false', () => {
    Game.store.getMode.mockReturnValue('playing');

    const result = play();

    expect(result).toBe(false);
    expect(Game.store.setMode).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('game-over 模式时返回 false', () => {
    Game.store.getMode.mockReturnValue('game-over');

    const result = play();

    expect(result).toBe(false);
  });

  test('main-menu 模式时返回 false', () => {
    Game.store.getMode.mockReturnValue('main-menu');

    const result = play();

    expect(result).toBe(false);
  });

  test('replay 模式时返回 false', () => {
    Game.store.getMode.mockReturnValue('replay');

    const result = play();

    expect(result).toBe(false);
  });

  test('继续时发射所有事件', () => {
    Game.store.getMode.mockReturnValue('paused');
    Game.store.getLevel.mockReturnValue(5);

    play();

    expect(EventBus.emit).toHaveBeenCalledWith('ui:update:mode', {
      mode: 'playing',
    });
    expect(EventBus.emit).toHaveBeenCalledWith('effects:stop:paused');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:resume');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:play:bgm', { level: 5 });
  });
});
