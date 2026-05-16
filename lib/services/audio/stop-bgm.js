/**
 * # 停止当前播放的背景音乐 BGM
 *
 * 清除 BGM 定时器，终止音频播放循环
 *
 * @function stopBGM
 * @param {object} audio - Audio 对象实例
 * @returns {void}
 */
const stopBGM = (audio) => {
  audio.Scheduler.cancel(audio.bgmSchedulerId);
  audio.bgmSchedulerId = 0;
};

export default stopBGM;
