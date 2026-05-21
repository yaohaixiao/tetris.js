import { AudioEvents, ReplayEvents } from '@/lib/events/event-catalog.js';

/**
 * # 游戏结束处理
 *
 * 处理游戏结束时的核心流程：停止录制、播放音效、触发回放或结束界面。
 *
 * ## 处理流程
 *
 * 1. **防重复执行**：如果已经在 game-over 或 replay 状态，直接返回
 * 2. **停止录制**：通知回放系统停止录制玩家操作
 * 3. **播放音效**：停止背景音乐，播放 Game Over 音效
 * 4. **触发回放或结束**：
 *
 *    - 如果有回放数据，ReplayController 会准备棋盘并开始回放
 *    - 如果没有回放数据，直接显示 Game Over 界面
 *
 * ## 调用时机
 *
 * - 方块堆叠到顶部，无法生成新方块时
 * - 由 `Game.over()` 方法调用
 *
 * @function over
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const over = (runtime) => {
  const { id, Store } = runtime;
  const mode = Store.getMode();

  // 防止重复执行：已经在 game-over 或 replay 状态时直接返回
  if (mode === 'game-over' || mode === 'replay') {
    return;
  }

  const AE = AudioEvents();
  const RE = ReplayEvents(id);

  // 1. 停止录制玩家操作（回放系统）
  runtime.emit(RE.STOP_RECORD);

  // 2. 停止背景音乐，播放游戏结束音效
  runtime.emit(AE.STOP_BGM);
  runtime.emit(AE.PLAY_SOUND, { sound: 'GAME_OVER' });

  /*
   * 3. 触发回放或结束界面
   *
   * ReplayController._onGameOver 会判断是否有回放数据：
   *
   * - 有数据 → 准备棋盘进入回放模式
   * - 无数据 → 直接进入 game-over 状态
   */
  runtime.emit(RE.GAME_OVER);
};

export default over;
