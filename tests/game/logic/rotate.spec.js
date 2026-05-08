import rotate from '@/lib/game/logic/rotate';
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

describe('rotate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== T 方块旋转 ==========
  test('T 方块顺时针旋转', () => {
    const T_PIECE = {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: 'purple',
    };

    Game.store.getState.mockReturnValue({ curr: T_PIECE });
    collision.mockReturnValue(false);

    rotate();

    const call = Game.store.setState.mock.calls[0][0];
    expect(call.curr.shape).toEqual([
      [1, 0],
      [1, 1],
      [1, 0],
    ]);
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:rotate');
  });

  // ========== I 方块旋转 ==========
  test('I 方块顺时针旋转', () => {
    const I_PIECE = {
      shape: [[1, 1, 1, 1]],
      color: 'cyan',
    };

    Game.store.getState.mockReturnValue({ curr: I_PIECE });
    collision.mockReturnValue(false);

    rotate();

    const call = Game.store.setState.mock.calls[0][0];
    expect(call.curr.shape).toEqual([[1], [1], [1], [1]]);
  });

  // ========== O 方块旋转（不变） ==========
  test('O 方块旋转后形状不变', () => {
    const O_PIECE = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: 'yellow',
    };

    Game.store.getState.mockReturnValue({ curr: O_PIECE });
    collision.mockReturnValue(false);

    rotate();

    const call = Game.store.setState.mock.calls[0][0];
    expect(call.curr.shape).toEqual([
      [1, 1],
      [1, 1],
    ]);
  });

  // ========== 碰撞后回退 ==========
  test('旋转后发生碰撞则恢复原状', () => {
    const T_PIECE = {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: 'purple',
    };

    Game.store.getState.mockReturnValue({ curr: T_PIECE });

    // 第一次调用 collision 返回 true（触发回退）
    collision.mockReturnValue(true);

    rotate();

    const setStateCalls = Game.store.setState.mock.calls;

    // 最后一次 setState 应该恢复原状
    const lastCall = setStateCalls[setStateCalls.length - 1][0];
    expect(lastCall.curr.shape).toEqual([
      [0, 1, 0],
      [1, 1, 1],
    ]);
  });

  test('碰撞回退后不播音效', () => {
    const T_PIECE = {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: 'purple',
    };

    Game.store.getState.mockReturnValue({ curr: T_PIECE });
    collision.mockReturnValue(true);

    rotate();

    // 只检查最后没有发射 rotate 音效
    const rotateCalls = EventBus.emit.mock.calls.filter(
      (call) => call[0] === 'audio:sounds:rotate',
    );
    expect(rotateCalls.length).toBe(0);
  });

  // ========== curr 为 null ==========
  test('curr 为 null 时不操作', () => {
    Game.store.getState.mockReturnValue({ curr: null });

    rotate();

    expect(Game.store.setState).not.toHaveBeenCalled();
  });

  test('curr 为 undefined 时不操作', () => {
    Game.store.getState.mockReturnValue({});

    rotate();

    expect(Game.store.setState).not.toHaveBeenCalled();
  });
});
