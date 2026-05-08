import pause from '@/lib/game/core/pause';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getMode: jest.fn(() => 'playing'),
    setMode: jest.fn(),
  },
}));

describe('pause', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('playing 模式时执行暂停', () => {
    Game.store.getMode.mockReturnValue('playing');

    pause();

    expect(Game.store.setMode).toHaveBeenCalledWith('paused');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:stop:bgm');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:pause');
    expect(EventBus.emit).toHaveBeenCalledWith('effects:start:paused');
  });

  test('paused 模式时不再触发', () => {
    Game.store.getMode.mockReturnValue('paused');

    pause();

    expect(Game.store.setMode).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('game-over 模式时不再触发', () => {
    Game.store.getMode.mockReturnValue('game-over');

    pause();

    expect(Game.store.setMode).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('main-menu 模式时不再触发', () => {
    Game.store.getMode.mockReturnValue('main-menu');

    pause();

    expect(Game.store.setMode).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('replay 模式时不再触发', () => {
    Game.store.getMode.mockReturnValue('replay');

    pause();

    expect(Game.store.setMode).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('事件发射顺序正确', () => {
    Game.store.getMode.mockReturnValue('playing');

    pause();

    expect(EventBus.emit).toHaveBeenNthCalledWith(1, 'audio:stop:bgm');
    expect(EventBus.emit).toHaveBeenNthCalledWith(2, 'audio:sounds:pause');
    expect(EventBus.emit).toHaveBeenNthCalledWith(3, 'effects:start:paused');
  });
});
