/**
 * # 停止当前播放的背景音乐（BGM）
 *
 * 取消 BGM 的调度任务，终止音频播放循环。 同时将 `bgmSchedulerId` 重置为 0。
 *
 * @function stopBGM
 * @param {object} audio - Audio 对象实例
 * @returns {void}
 */
const stopBGM = (audio) => {
  // 取消 BGM 的 interval 调度任务
  audio.Scheduler.cancel(audio.bgmSchedulerId);
  // 重置 ID
  audio.bgmSchedulerId = 0;
};

export default stopBGM;
