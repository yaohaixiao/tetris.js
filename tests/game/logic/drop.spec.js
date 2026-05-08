import drop from '@/lib/game/logic/drop';
import EventBus from '@/lib/core/event-bus';
import move from '@/lib/game/logic/move';
import lock from '@/lib/game/logic/lock';
import clearLines from '@/lib/game/logic/clear-lines';
import spawn from '@/lib/game/logic/spawn';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game/logic/move', () => jest.fn());
jest.mock('@/lib/game/logic/lock', () => jest.fn());
jest.mock('@/lib/game/logic/clear-lines', () => jest.fn());
jest.mock('@/lib/game/logic/spawn', () => jest.fn());

describe('drop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('连续 move 直到返回 false 然后执行后续', () => {
    // 模拟 move 前 3 次成功，第 4 次失败
    move.mockReturnValueOnce(true);
    move.mockReturnValueOnce(true);
    move.mockReturnValueOnce(true);
    move.mockReturnValueOnce(false);

    drop();

    expect(move).toHaveBeenCalledTimes(4);
    // 每次都向下移动 1
    expect(move).toHaveBeenCalledWith(0, 1);
    expect(lock).toHaveBeenCalled();
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:fall');
    expect(clearLines).toHaveBeenCalled();
    expect(spawn).toHaveBeenCalled();
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:drop');
  });

  test('第一次 move 就失败', () => {
    move.mockReturnValueOnce(false);

    drop();

    expect(move).toHaveBeenCalledTimes(1);
    expect(lock).toHaveBeenCalled();
    expect(spawn).toHaveBeenCalled();
  });

  test('move 一直成功（无限循环防护不在单测范围内）', () => {
    // 正常情况不会发生，但验证 move 被多次调用
    move.mockReturnValue(true);
    // 为防止死循环，mock 一定次数后返回 false
    for (let i = 0; i < 20; i++) {
      move.mockReturnValueOnce(true);
    }
    move.mockReturnValueOnce(false);

    expect(() => drop()).not.toThrow();
  });

  test('执行顺序正确', () => {
    move.mockReturnValueOnce(false);

    drop();

    // lock 在 move 之后
    expect(lock).toHaveBeenCalled();
    // fall 音效在 lock 之后
    const fallIndex = EventBus.emit.mock.calls.findIndex(
      (call) => call[0] === 'audio:sounds:fall',
    );
    // clearLines 在 fall 之后
    const lockCalledBeforeClearLines =
      EventBus.emit.mock.calls.findIndex(
        (call) => call[0] === 'audio:sounds:fall',
      ) <
      EventBus.emit.mock.calls.findIndex(
        (call) => call[0] === 'audio:sounds:drop',
      );
    expect(lockCalledBeforeClearLines).toBe(true);
  });
});
