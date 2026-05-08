import toggleBGM from '@/lib/services/audio/toggle-bgm';
import AudioState from '@/lib/services/audio/state/audio-state';
import Sounds from '@/lib/services/audio/sounds';
import playBGM from '@/lib/services/audio/play-bgm';
import stopBGM from '@/lib/services/audio/stop-bgm';

jest.mock('@/lib/services/audio/state/audio-state', () => ({
  bgmEnabled: true,
}));

jest.mock('@/lib/services/audio/sounds', () => ({
  bgmToggle: jest.fn(),
}));

jest.mock('@/lib/services/audio/play-bgm', () => jest.fn());
jest.mock('@/lib/services/audio/stop-bgm', () => jest.fn());

describe('toggleBGM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('从开启切换到关闭', () => {
    AudioState.bgmEnabled = true;

    toggleBGM(5);

    expect(AudioState.bgmEnabled).toBe(false);
    expect(Sounds.bgmToggle).toHaveBeenCalled();
    expect(stopBGM).toHaveBeenCalled();
    expect(playBGM).not.toHaveBeenCalled();
  });

  test('从关闭切换到开启', () => {
    AudioState.bgmEnabled = false;

    toggleBGM(3);

    expect(AudioState.bgmEnabled).toBe(true);
    expect(Sounds.bgmToggle).toHaveBeenCalled();
    expect(playBGM).toHaveBeenCalledWith(3);
    expect(stopBGM).not.toHaveBeenCalled();
  });

  test('切换两次回到原状态', () => {
    AudioState.bgmEnabled = true;

    toggleBGM(1); // → false
    toggleBGM(1); // → true

    expect(AudioState.bgmEnabled).toBe(true);
    expect(Sounds.bgmToggle).toHaveBeenCalledTimes(2);
    expect(stopBGM).toHaveBeenCalledTimes(1);
    expect(playBGM).toHaveBeenCalledTimes(1);
  });

  test('始终播放切换音效', () => {
    AudioState.bgmEnabled = true;
    toggleBGM(1);
    expect(Sounds.bgmToggle).toHaveBeenCalledTimes(1);

    AudioState.bgmEnabled = false;
    toggleBGM(1);
    expect(Sounds.bgmToggle).toHaveBeenCalledTimes(2);
  });
});
