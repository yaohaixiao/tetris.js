import over from '@/lib/game/core/over';
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
  },
}));

describe('over', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('playing 模式时触发完整结束流程', () => {
    Game.store.getMode.mockReturnValue('playing');

    over();

    expect(EventBus.emit).toHaveBeenCalledWith('replay:stop:record');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:stop:bgm');
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:game:over');
    expect(EventBus.emit).toHaveBeenCalledWith('replay:game:over');
  });

  test('paused 模式也可以触发', () => {
    Game.store.getMode.mockReturnValue('paused');

    over();

    expect(EventBus.emit).toHaveBeenCalledWith('replay:stop:record');
  });

  test('已经 game-over 时不再触发', () => {
    Game.store.getMode.mockReturnValue('game-over');

    over();

    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('replay 模式下不触发', () => {
    Game.store.getMode.mockReturnValue('replay');

    over();

    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('事件发射顺序正确', () => {
    Game.store.getMode.mockReturnValue('playing');

    over();

    expect(EventBus.emit).toHaveBeenNthCalledWith(1, 'replay:stop:record');
    expect(EventBus.emit).toHaveBeenNthCalledWith(2, 'audio:stop:bgm');
    expect(EventBus.emit).toHaveBeenNthCalledWith(3, 'audio:sounds:game:over');
    expect(EventBus.emit).toHaveBeenNthCalledWith(4, 'replay:game:over');
  });
});
