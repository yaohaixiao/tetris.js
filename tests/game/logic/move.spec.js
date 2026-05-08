import move from '@/lib/game/logic/move';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import collision from '@/lib/game/logic/collision';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getState: jest.fn(),
    setState: jest.fn(),
  },
}));

jest.mock('@/lib/game/logic/collision', () => jest.fn());

describe('move', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('无碰撞时移动成功并更新坐标', () => {
    collision.mockReturnValue(false);
    Game.store.getState.mockReturnValue({ cx: 4, cy: 5 });

    const result = move(1, 0);

    expect(result).toBe(true);
    expect(Game.store.setState).toHaveBeenCalledWith({ cx: 5, cy: 5 });
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:move');
  });

  test('向下移动成功', () => {
    collision.mockReturnValue(false);
    Game.store.getState.mockReturnValue({ cx: 4, cy: 3 });

    const result = move(0, 1);

    expect(result).toBe(true);
    expect(Game.store.setState).toHaveBeenCalledWith({ cx: 4, cy: 4 });
  });

  test('向左移动成功', () => {
    collision.mockReturnValue(false);
    Game.store.getState.mockReturnValue({ cx: 5, cy: 5 });

    const result = move(-1, 0);

    expect(result).toBe(true);
    expect(Game.store.setState).toHaveBeenCalledWith({ cx: 4, cy: 5 });
  });

  test('碰撞时返回 false 不更新坐标', () => {
    collision.mockReturnValue(true);
    Game.store.getState.mockReturnValue({ cx: 4, cy: 5 });

    const result = move(1, 0);

    expect(result).toBe(false);
    expect(Game.store.setState).not.toHaveBeenCalled();
    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('碰撞时不播音效', () => {
    collision.mockReturnValue(true);

    move(1, 0);

    expect(EventBus.emit).not.toHaveBeenCalled();
  });

  test('碰撞检测传入正确的偏移量', () => {
    collision.mockReturnValue(false);

    move(-1, 1);

    expect(collision).toHaveBeenCalledWith(-1, 1);
  });
});
