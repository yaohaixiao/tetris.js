import {
  AudioEvents,
  GameEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # 游戏暂停
 *
 * 将游戏从 playing 状态切换到 paused 状态， 停止背景音乐、播放暂停音效、显示暂停特效。
 *
 * ## 限制条件
 *
 * 只能在 `playing` 模式下暂停。以下状态无法暂停：
 *
 * - `game-over`：游戏已结束
 * - `main-menu`：主菜单（等级选择界面）
 * - `difficulty`：难度选择界面
 * - `replay`：回放中
 * - `paused`：已在暂停状态
 *
 * ## 处理流程
 *
 * | 步骤 | 操作         | 说明                       |
 * | ---- | ------------ | -------------------------- |
 * | 1    | 模式检查     | 非 playing 模式则直接返回  |
 * | 2    | 更新 UI 模式 | 通知 UI 切换为暂停界面     |
 * | 3    | 更新 Store   | 将游戏模式设为 paused      |
 * | 4    | 停止背景音乐 | 暂停 BGM 播放              |
 * | 5    | 播放暂停音效 | 播放 PAUSED 音效           |
 * | 6    | 启动暂停动画 | 显示暂停特效（画面变暗等） |
 *
 * ## 调用时机
 *
 * - 玩家按 P 键（键盘）
 * - 玩家按 Y 键（手柄）
 * - AI 执行 TOGGLE_PAUSED 命令
 *
 * @function pause
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const pause = (runtime) => {
  const { id, Store } = runtime;
  const mode = Store.getMode();
  const AE = AudioEvents();
  const GE = GameEvents(id);
  const UE = UIEvents(id);

  /**
   * ======== 步骤 1：模式检查 ========
   *
   * 只有 playing 模式可以暂停。 游戏结束、菜单界面等状态下禁止暂停。
   */
  if (mode !== 'playing') {
    return;
  }

  /**
   * ======== 步骤 2：更新 UI 模式 ========
   *
   * 通知 UI 层切换到暂停界面显示。
   */
  runtime.emit(UE.UPDATE_MODE, { mode: 'paused' });

  /**
   * ======== 步骤 3：更新 Store 模式 ========
   *
   * 将游戏状态切换为 paused，暂停下落和输入处理。
   */
  Store.setMode('paused');

  /** ======== 步骤 4：停止背景音乐 ======== */
  runtime.emit(AE.STOP_BGM);

  /** ======== 步骤 5：播放暂停音效 ======== */
  runtime.emit(AE.PLAY_SOUND, { sound: 'PAUSED' });

  /**
   * ======== 步骤 6：启动暂停动画 ========
   *
   * 显示暂停特效（如画面变暗、暂停图标、每秒滴答音效等）。
   */
  runtime.emit(GE.START_PAUSED);
};

export default pause;
