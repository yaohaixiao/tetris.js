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
 * 只能在 `playing` 模式下暂停。 以下状态无法暂停：
 *
 * - `game-over`：游戏已结束
 * - `main-menu`：主菜单（等级选择界面）
 * - `difficulty`：难度选择界面
 * - `replay`：回放中
 * - `paused`：已在暂停状态
 *
 * ## 处理流程
 *
 * 1. 检查当前模式是否为 playing
 * 2. 更新 UI 模式为 paused
 * 3. 设置 Store 模式为 paused
 * 4. 停止背景音乐
 * 5. 播放暂停音效
 * 6. 启动暂停动画特效
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

  // 只有 playing 模式可以暂停：游戏结束、菜单界面等状态下禁止暂停
  if (mode !== 'playing') {
    return;
  }

  // 更新 UI 显示为暂停状态
  runtime.emit(UE.UPDATE_MODE, { mode: 'paused' });

  // 更新 Store 中的游戏模式
  Store.setMode('paused');

  // 停止背景音乐
  runtime.emit(AE.STOP_BGM);

  // 播放暂停音效
  runtime.emit(AE.PLAY_SOUND, { sound: 'PAUSED' });

  // 启动暂停动画特效（如画面变暗、暂停图标等）
  runtime.emit(GE.START_PAUSED);
};

export default pause;
