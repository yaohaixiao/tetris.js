import AudioState from '@/lib/audio/state/audio-state.js';
import loopPlayBGM from '@/lib/audio/loop-play-bgm.js';
import stopBGM from '@/lib/audio/stop-bgm.js';

/**
 * #播放游戏背景音乐 (BGM) 先停止当前可能正在播放的BGM，然后启动新的旋律循环
 *
 * @function playBGM
 * @returns {boolean | undefined} 如果BGM未启用则返回false，否则无返回值
 */
const playBGM = () => {
  // BGM 旋律音符频率数组
  const m = [
    659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659, 587,
    659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587, 659, 784,
    659, 587,
  ];

  // 如果BGM未开启，直接退出并返回false
  if (!AudioState.bgmEnabled) {
    return false;
  }

  // 先停止已存在的BGM，防止重叠播放
  stopBGM();

  // 从第0个音符开始循环播放旋律
  loopPlayBGM(0, m);
};

export default playBGM;
