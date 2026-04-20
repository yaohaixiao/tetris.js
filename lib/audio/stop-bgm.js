import AudioState from '@/lib/audio/state/audio-state.js';

/**
 * # 停止当前播放的背景音乐 BGM
 *
 * 清除 BGM 定时器，终止音频播放循环
 *
 * @function stopBGM
 * @returns {void}
 */
const stopBGM = () => {
  // 如果存在 BGM 定时器，清除定时器停止播放
  if (AudioState.bgmTimer) {
    clearTimeout(AudioState.bgmTimer);
  }

  // 重置定时器变量为 null
  AudioState.bgmTimer = null;
};

export default stopBGM;
