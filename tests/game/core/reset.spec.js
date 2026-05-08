import reset from '@/lib/game/core/reset';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import setBeginningState from '@/lib/game/actions/set-beginning-state';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getLevel: jest.fn(() => 1),
    getState: jest.fn(() => ({ mode: 'main-menu', score: 0, level: 1 })),
    resetBoard: jest.fn(),
    setState: jest.fn(),
    setDifficulty: jest.fn(),
  },
}));

jest.mock('@/lib/game/actions/set-beginning-state', () => jest.fn());

describe('reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Game.store.getLevel.mockReturnValue(5);
    Game.store.getState.mockReturnValue({ mode: 'main-menu', score: 0, level: 1 });
  });

  // ========== 默认 mode = main-menu ==========
  test('默认重置到 main-menu', () => {
    reset();

    expect(EventBus.emit).toHaveBeenCalledWith('audio:stop:bgm');
    expect(EventBus.emit).toHaveBeenCalledWith('animations:clear');
    expect(EventBus.emit).toHaveBeenCalledWith('command:queue:clear');
    expect(Game.store.resetBoard).toHaveBeenCalled();
    expect(Game.store.setDifficulty).toHaveBeenCalledWith('easy');
    expect(setBeginningState).toHaveBeenCalledWith('main-menu', 1);
    expect(EventBus.emit).toHaveBeenCalledWith('ui:update:hud', {
      state: expect.any(Object),
    });
    expect(EventBus.emit).toHaveBeenCalledWith('replay:start:record');
  });

  test('重置到 main-menu 时重置难度和等级', () => {
    Game.store.getLevel.mockReturnValue(10);

    reset('main-menu');

    expect(Game.store.setDifficulty).toHaveBeenCalledWith('easy');
    expect(setBeginningState).toHaveBeenCalledWith('main-menu', 1);
  });

  // ========== mode = playing ==========
  test('重置到 playing 时保留难度和等级', () => {
    Game.store.getLevel.mockReturnValue(8);

    reset('playing');

    // 不重置难度
    expect(Game.store.setDifficulty).not.toHaveBeenCalled();
    // 保持原有等级
    expect(setBeginningState).toHaveBeenCalledWith('playing', 8);
  });

  test('重置到 playing 时清理回放数据', () => {
    reset('playing');

    expect(EventBus.emit).toHaveBeenCalledWith('replay:reset');
  });

  test('重置到 main-menu 不清理回放数据', () => {
    reset('main-menu');

    expect(EventBus.emit).not.toHaveBeenCalledWith('replay:reset');
  });

  // ========== 事件发射顺序 ==========
  test('事件发射顺序正确', () => {
    reset();

    expect(EventBus.emit).toHaveBeenNthCalledWith(1, 'audio:stop:bgm');
    expect(EventBus.emit).toHaveBeenNthCalledWith(2, 'animations:clear');
    expect(EventBus.emit).toHaveBeenNthCalledWith(3, 'command:queue:clear');
    // 第 4 个是 ui:update:hud
    expect(EventBus.emit).toHaveBeenNthCalledWith(5, 'replay:start:record');
  });

  // ========== 自定义 mode（非 main-menu 非 playing）==========
  test('自定义 mode 不重置难度', () => {
    Game.store.getLevel.mockReturnValue(4);

    reset('custom-mode');

    expect(Game.store.setDifficulty).not.toHaveBeenCalled();
    expect(setBeginningState).toHaveBeenCalledWith('custom-mode', 4);
  });
});
