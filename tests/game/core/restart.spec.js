import restart from '@/lib/game/core/restart';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import reset from '@/lib/game/core/reset';
import spawn from '@/lib/game/logic/spawn';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getMode: jest.fn(() => 'playing'),
    getLevel: jest.fn(() => 1),
  },
}));

jest.mock('@/lib/game/core/reset', () => jest.fn());
jest.mock('@/lib/game/logic/spawn', () => jest.fn());

describe('restart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Game.store.getMode.mockReturnValue('playing');
    Game.store.getLevel.mockReturnValue(5);
  });

  test('playing 模式时执行重新开始', () => {
    restart();

    expect(reset).toHaveBeenCalledWith('playing');
    expect(spawn).toHaveBeenCalled();
    expect(EventBus.emit).toHaveBeenCalledWith('audio:play:bgm', { level: 5 });
  });

  test('main-menu 模式时不执行', () => {
    Game.store.getMode.mockReturnValue('main-menu');

    restart();

    expect(reset).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('paused 模式时不执行', () => {
    Game.store.getMode.mockReturnValue('paused');

    restart();

    expect(reset).not.toHaveBeenCalled();
  });

  test('game-over 模式时不执行', () => {
    Game.store.getMode.mockReturnValue('game-over');

    restart();

    expect(reset).not.toHaveBeenCalled();
  });

  test('replay 模式时不执行', () => {
    Game.store.getMode.mockReturnValue('replay');

    restart();

    expect(reset).not.toHaveBeenCalled();
  });
});
