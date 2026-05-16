import stopBGM from '@/lib/services/audio/stop-bgm';
import Scheduler from '@/lib/engine/scheduler';

describe('stopBGM', () => {
  let scheduler;
  let audio;
  let bgmId;

  beforeEach(() => {
    scheduler = new Scheduler();

    const fn = jest.fn();
    bgmId = scheduler.interval(fn, 25);

    audio = {
      Scheduler: scheduler,
      bgmSchedulerId: bgmId,
    };
  });

  test('取消 scheduler 中的 BGM 任务', () => {
    jest.spyOn(scheduler, 'cancel');

    stopBGM(audio);

    expect(scheduler.cancel).toHaveBeenCalledWith(bgmId);
  });

  test('将 bgmSchedulerId 重置为 0', () => {
    stopBGM(audio);

    expect(audio.bgmSchedulerId).toBe(0);
  });

  test('cancel 后 tick 不再触发 BGM 回调', () => {
    const fn = jest.fn();

    scheduler.clear();
    const id = scheduler.interval(fn, 25);
    audio.bgmSchedulerId = id;

    // interval 首次 tick 注册 startTime/nextTime
    scheduler.tick(100);
    // 第二次 tick 触发
    scheduler.tick(125);
    expect(fn).toHaveBeenCalledTimes(1);

    stopBGM(audio);

    jest.clearAllMocks();

    // 推进时间
    scheduler.tick(200);
    expect(fn).not.toHaveBeenCalled();
  });
});
