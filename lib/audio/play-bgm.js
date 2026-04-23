import Engine from '@/lib/engine/engine.js';
import AudioState from '@/lib/audio/state/audio-state.js';
import Musics from '@/lib/audio/constants/musics.js';
import loopPlayBGM from '@/lib/audio/loop-play-bgm.js';
import stopBGM from '@/lib/audio/stop-bgm.js';

/**
 * # 播放游戏背景音乐 (BGM)
 *
 * 先停止当前可能正在播放的BGM，然后启动新的旋律循环
 *
 * @function playBGM
 * @returns {boolean | undefined} 如果BGM未启用则返回false，否则无返回值
 */
const playBGM = () => {
  let music;

  // 如果BGM未开启，直接退出并返回false
  if (!AudioState.bgmEnabled) {
    return false;
  }

  switch (Engine.state.level) {
    case 1:
    case 2: {
      music = Musics.TetrisTheme;
      break;
    }
    case 3:
    case 4: {
      music = Musics.Loginska;
      break;
    }
    case 5:
    case 6: {
      music = Musics.Technotris;
      break;
    }
    case 7:
    case 8: {
      music = Musics.FirstDivision;
      break;
    }
    case 9:
    case 10: {
      music = Musics.Korobeiniki;
      break;
    }
    default: {
      music = Musics.JourneyToWest;
      break;
    }
  }

  const { melody, duration, volume } = music;

  // 先停止已存在的BGM，防止重叠播放
  stopBGM();

  // 从第0个音符开始循环播放旋律
  loopPlayBGM(0, melody, duration, volume);
};

export default playBGM;
