import start from '@/lib/game/core/start';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getLevel: jest.fn(() => 1),
    setBaseLines: jest.fn(),
  },
}));

describe('start', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('level 1 时设置 baseLines = 0', () => {
    Game.store.getLevel.mockReturnValue(1);

    start();

    expect(Game.store.setBaseLines).toHaveBeenCalledWith(0);
    expect(EventBus.emit).toHaveBeenCalledWith('effects:start:countdown');
  });

  test('level 5 时设置 baseLines = 40', () => {
    Game.store.getLevel.mockReturnValue(5);

    start();

    expect(Game.store.setBaseLines).toHaveBeenCalledWith(40);
  });

  test('level 10 时设置 baseLines = 90', () => {
    Game.store.getLevel.mockReturnValue(10);

    start();

    expect(Game.store.setBaseLines).toHaveBeenCalledWith(90);
  });

  test('level 1 时 baseLines 为 0', () => {
    Game.store.getLevel.mockReturnValue(1);

    start();

    expect(Game.store.setBaseLines).toHaveBeenCalledWith(0);
  });

  test('触发倒计时事件', () => {
    start();

    expect(EventBus.emit).toHaveBeenCalledWith('effects:start:countdown');
  });
});
