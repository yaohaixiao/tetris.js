import clearLines from '@/lib/game/logic/clear-lines';
import Game from '@/lib/game';
import findFullLines from '@/lib/game/logic/find-full-lines';
import EventBus from '@/lib/core/event-bus';

jest.mock('@/lib/game', () => ({
  store: {
    setClearLines: jest.fn(),
  },
}));

jest.mock('@/lib/game/logic/find-full-lines', () => jest.fn());

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('clearLines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('找到满行时执行消除', () => {
    findFullLines.mockReturnValue([17, 18, 19]);

    clearLines();

    expect(Game.store.setClearLines).toHaveBeenCalledWith([17, 18, 19]);
    expect(EventBus.emit).toHaveBeenCalledWith('effects:start:clear:lines', {
      linesToClear: [17, 18, 19],
    });
  });

  test('找到 1 行满行', () => {
    findFullLines.mockReturnValue([19]);

    clearLines();

    expect(Game.store.setClearLines).toHaveBeenCalledWith([19]);
    expect(EventBus.emit).toHaveBeenCalledWith('effects:start:clear:lines', {
      linesToClear: [19],
    });
  });

  test('找到 4 行满行', () => {
    findFullLines.mockReturnValue([16, 17, 18, 19]);

    clearLines();

    expect(Game.store.setClearLines).toHaveBeenCalledWith([16, 17, 18, 19]);
  });

  test('没有满行时不执行', () => {
    findFullLines.mockReturnValue([]);

    clearLines();

    expect(Game.store.setClearLines).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });
});
