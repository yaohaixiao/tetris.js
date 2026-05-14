import Engine from '@/lib/engine';
import Audio from '@/lib/services/audio';

/**
 * # 停止当前播放的背景音乐 BGM
 *
 * 清除 BGM 定时器，终止音频播放循环
 *
 * @function stopBGM
 * @returns {void}
 */
const stopBGM = () => {
  Engine.Scheduler.cancel(Audio.bgmSchedulerId);
  Audio.bgmSchedulerId = 0;
};

export default stopBGM;
