import AudioState from '@/lib/audio/state/audio-state.js';
import Musics from '@/lib/audio/constants/musics.js';
import loopPlayBGM from '@/lib/audio/loop-play-bgm.js';
import stopBGM from '@/lib/audio/stop-bgm.js';

const {
  TetrisTheme,
  Loginska,
  Technotris,
  FirstDivision,
  Korobeiniki,
  JourneyToWest,
} = Musics;

const LEVEL_MUSIC_MAP = [
  TetrisTheme,
  TetrisTheme,
  TetrisTheme,
  Loginska,
  Loginska,
  Loginska,
  Technotris,
  Technotris,
  Technotris,
  FirstDivision,
  FirstDivision,
  FirstDivision,
  Korobeiniki,
  Korobeiniki,
  Korobeiniki,
];

const getMusicByLevel = (level) => {
  const index = level - 1;
  return LEVEL_MUSIC_MAP[index] ?? JourneyToWest;
};

/**
 * # 播放游戏背景音乐 (BGM)
 *
 * 先停止当前可能正在播放的BGM，然后启动新的旋律循环
 *
 * @function playBGM
 * @param {number} [level=1] - 当前等级. Default is `1`
 * @returns {void}
 */
const playBGM = (level = 1) => {
  // 如果BGM未开启，直接退出并返回false
  if (!AudioState.bgmEnabled) {
    return;
  }

  const music = getMusicByLevel(level);
  const { melody, duration, volume } = music;

  // 先停止已存在的BGM，防止重叠播放
  stopBGM();

  // 从第0个音符开始循环播放旋律
  loopPlayBGM(0, melody, duration, volume);
};

export default playBGM;
