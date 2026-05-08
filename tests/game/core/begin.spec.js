/**
 * @jest-environment jsdom
 */

import begin from '@/lib/game/core/begin';
import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import spawn from '@/lib/game/logic/spawn';
import setBeginningState from '@/lib/game/actions/set-beginning-state';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/game', () => ({
  store: {
    getLevel: jest.fn(() => 1),
    resetBoard: jest.fn(),
  },
}));

jest.mock('@/lib/game/logic/spawn', () => jest.fn());
jest.mock('@/lib/game/actions/set-beginning-state', () => jest.fn());

describe('begin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Game.store.getLevel.mockReturnValue(1);
    document.body.innerHTML = '<div id="level"></div>';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('更新等级 UI', () => {
    Game.store.getLevel.mockReturnValue(5);

    begin();

    const $level = document.querySelector('#level');
    expect($level.textContent).toBe('05');
  });

  test('没有 #level 元素不报错', () => {
    document.body.innerHTML = '';
    expect(() => begin()).not.toThrow();
  });

  test('发射 replay:start:record', () => {
    begin();
    expect(EventBus.emit).toHaveBeenCalledWith('replay:start:record');
  });

  test('重置棋盘并设置开始状态', () => {
    Game.store.getLevel.mockReturnValue(3);
    begin();

    expect(Game.store.resetBoard).toHaveBeenCalled();
    expect(setBeginningState).toHaveBeenCalledWith('playing', 3);
  });

  test('调用 spawn 生成初始方块', () => {
    begin();
    expect(spawn).toHaveBeenCalled();
  });

  test('播放开始音效', () => {
    begin();
    expect(EventBus.emit).toHaveBeenCalledWith('audio:sounds:level:start');
  });

  test('延迟 250ms 播放 BGM', () => {
    begin();

    expect(EventBus.emit).not.toHaveBeenCalledWith(
      'audio:play:bgm',
      expect.any(Object)
    );

    jest.advanceTimersByTime(250);

    expect(EventBus.emit).toHaveBeenCalledWith('audio:play:bgm', { level: 1 });
  });
});
