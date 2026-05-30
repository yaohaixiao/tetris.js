import toggleBGM from '@/lib/services/audio/toggle-bgm';
import playBGM from '@/lib/services/audio/play-bgm';
import stopBGM from '@/lib/services/audio/stop-bgm';
import Scheduler from '@/lib/engine/scheduler';

jest.mock('@/lib/services/audio/play-bgm', () => jest.fn());
jest.mock('@/lib/services/audio/stop-bgm', () => jest.fn());

describe('toggleBGM', () => {
  let audio;

  beforeEach(() => {
    jest.clearAllMocks();

    audio = {
      bgmSchedulerId: 0,
    };
  });

  test('bgmSchedulerId === 0 时启动 BGM', () => {
    toggleBGM(audio, 5);

    expect(playBGM).toHaveBeenCalledWith(audio, 5);
    expect(stopBGM).not.toHaveBeenCalled();
  });

  test('bgmSchedulerId !== 0 时停止 BGM', () => {
    audio.bgmSchedulerId = 123;

    toggleBGM(audio, 5);

    expect(stopBGM).toHaveBeenCalledWith(audio);
    expect(playBGM).not.toHaveBeenCalled();
  });

  test('启动时传递正确的 level 参数', () => {
    toggleBGM(audio, 10);

    expect(playBGM).toHaveBeenCalledWith(audio, 10);
  });

  test('bgmSchedulerId === 0 时表示当前无 BGM 播放', () => {
    expect(audio.bgmSchedulerId).toBe(0);

    toggleBGM(audio, 1);

    expect(playBGM).toHaveBeenCalled();
  });
});
