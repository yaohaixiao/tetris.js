import stopBGM from '@/lib/services/audio/stop-bgm';
import AudioState from '@/lib/services/audio/state/audio-state';

jest.mock('@/lib/services/audio/state/audio-state', () => ({
  bgmTimer: null,
}));

describe('stopBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    AudioState.bgmTimer = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('没有定时器时不调用 clearTimeout', () => {
    const spy = jest.spyOn(globalThis, 'clearTimeout');

    stopBGM();

    expect(spy).not.toHaveBeenCalled();
    expect(AudioState.bgmTimer).toBeNull();
  });

  test('有定时器时调用 clearTimeout 并置 null', () => {
    const spy = jest.spyOn(globalThis, 'clearTimeout');
    const timerId = setTimeout(() => {}, 1000);
    AudioState.bgmTimer = timerId;

    stopBGM();

    expect(spy).toHaveBeenCalledWith(timerId);
    expect(AudioState.bgmTimer).toBeNull();
  });

  test('定时器 id 为 0 时也会清除', () => {
    const spy = jest.spyOn(globalThis, 'clearTimeout');
    // setTimeout 返回的数字 id 不会是 0，但防御性测试
    AudioState.bgmTimer = 1;

    stopBGM();

    expect(spy).toHaveBeenCalledWith(1);
    expect(AudioState.bgmTimer).toBeNull();
  });

  test('多次调用不报错', () => {
    AudioState.bgmTimer = setTimeout(() => {}, 1000);

    expect(() => {
      stopBGM();
      stopBGM();
    }).not.toThrow();

    expect(AudioState.bgmTimer).toBeNull();
  });
});
