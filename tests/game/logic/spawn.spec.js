import spawn from '@/lib/game/logic/spawn';
import Configuration from '@/lib/configuration';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import getNextPiece from '@/lib/game/utils/get-next-piece';
import collision from '@/lib/game/logic/collision';
import over from '@/lib/game/core/over';

jest.mock('@/lib/configuration', () => ({
  Board: {
    rows: 20,
    cols: 10,
  },
}));

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

jest.mock('@/lib/game/utils/get-next-piece', () => jest.fn());
jest.mock('@/lib/game/logic/collision', () => jest.fn());
jest.mock('@/lib/game/core/over', () => jest.fn());

describe('spawn', () => {
  const O_PIECE = {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'yellow',
    type: 'O',
  };

  const I_PIECE = {
    shape: [[1, 1, 1, 1]],
    color: 'cyan',
    type: 'I',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== 正常生成 ==========
  test('正常生成 O 方块', () => {
    getNextPiece.mockReturnValue({
      curr: O_PIECE,
      next: I_PIECE,
    });
    collision.mockReturnValue(false);
    Game.store.getState.mockReturnValue({
      curr: O_PIECE,
      next: I_PIECE,
    });

    spawn();

    expect(Game.store.setState).toHaveBeenCalledWith({
      curr: O_PIECE,
      next: I_PIECE,
      cx: expect.any(Number),
      cy: 0,
    });
  });

  test('O 方块居中计算正确', () => {
    getNextPiece.mockReturnValue({
      curr: O_PIECE,
      next: I_PIECE,
    });
    collision.mockReturnValue(false);

    spawn();

    const call = Game.store.setState.mock.calls[0][0];
    // cols/2 - shape[0].length/2 = 5 - 1 = 4
    expect(call.cx).toBe(4);
  });

  test('I 方块居中计算正确', () => {
    getNextPiece.mockReturnValue({
      curr: I_PIECE,
      next: O_PIECE,
    });
    collision.mockReturnValue(false);

    spawn();

    const call = Game.store.setState.mock.calls[0][0];
    // 5 - floor(4/2) = 5 - 2 = 3
    expect(call.cx).toBe(3);
  });

  // ========== 发射事件 ==========
  test('发射渲染下一个方块事件', () => {
    getNextPiece.mockReturnValue({
      curr: O_PIECE,
      next: I_PIECE,
    });
    collision.mockReturnValue(false);
    Game.store.getState.mockReturnValue({ curr: O_PIECE });

    spawn();

    expect(EventBus.emit).toHaveBeenCalledWith('ui:render:next:piece', {
      state: expect.any(Object),
    });
  });

  test('发射 replay:add:piece 事件', () => {
    getNextPiece.mockReturnValue({
      curr: O_PIECE,
      next: I_PIECE,
    });
    collision.mockReturnValue(false);
    Game.store.getState.mockReturnValue({ curr: O_PIECE });

    spawn();

    expect(EventBus.emit).toHaveBeenCalledWith('replay:add:piece', O_PIECE);
  });

  // ========== 出生碰撞 ==========
  test('出生点碰撞时游戏结束', () => {
    getNextPiece.mockReturnValue({
      curr: O_PIECE,
      next: I_PIECE,
    });
    collision.mockReturnValue(true);

    spawn();

    expect(over).toHaveBeenCalled();
    // 不渲染也不记录
    expect(EventBus.emit).not.toHaveBeenCalledWith(
      'ui:render:next:piece',
      expect.any(Object)
    );
    expect(EventBus.emit).not.toHaveBeenCalledWith(
      'replay:add:piece',
      expect.any(Object)
    );
  });

  // ========== curr 为 null ==========
  test('curr 为 null 时直接返回', () => {
    getNextPiece.mockReturnValue({
      curr: null,
      next: null,
    });

    spawn();

    expect(Game.store.setState).not.toHaveBeenCalled();
    expect(collision).not.toHaveBeenCalled();
  });
});
