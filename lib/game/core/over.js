import {
  AudioEvents,
  BattleEvents,
  GameEvents,
  ReplayEvents,
} from '@/lib/events/event-catalog.js';

/*
 * ============================================================
 * # 模块：over 游戏结束处理
 * ============================================================
 *
 * ## 功能描述
 *
 * 处理游戏结束时的核心流程：停止录制、播放音效、触发回放或结束界面。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作 | 说明 |
 * | :--- | :--- | :--- |
 * | 1 | 防重复执行 | 已在 game-over 或 replay 状态则直接返回 |
 * | 2 | 停止录制 | 通知回放系统停止录制玩家操作 |
 * | 3 | 播放音效 | 停止背景音乐，播放 Game Over 音效 |
 * | 4 | 触发回放/结束 | 有回放数据进入回放，否则显示结束界面 |
 *
 * ## 调用时机
 *
 * - 方块堆叠到顶部，无法生成新方块时（`spawn` 中检测出生碰撞）
 * - 由 `Game.over()` 方法调用
 *
 * ## 后续流程
 *
 * ### 单人模式
 *
 * `ReplayController._onGameOver` 会判断是否有回放数据：
 *
 * - **有数据**：准备棋盘进入回放模式
 * - **无数据**：直接进入 game-over 状态，显示最终分数
 *
 * ### 对战模式
 *
 * `BattleController.update(loser)` 会处理后续逻辑：
 *
 * - 更新对战分数（胜者 +1 分）
 * - 判断是否达到整场胜利分数
 * - 整场结束或开始下一局
 *
 * @function over
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const over = (runtime) => {
  const { id, Store } = runtime;
  const mode = Store.getMode();

  /*
   * ============================================================
   * 步骤 1：防重复执行
   * ============================================================
   *
   * 如果已经处于 game-over 或 replay 状态，
   * 不再重复触发结束流程。
   */
  if (mode === 'game-over' || mode === 'replay') {
    return;
  }

  const AE = AudioEvents();
  const RE = ReplayEvents(id);
  const GE = GameEvents(id);
  const BE = BattleEvents();

  /*
   * ============================================================
   * 步骤 2：停止录制
   * ============================================================
   *
   * 通知回放系统停止记录玩家操作。
   */
  runtime.emit(RE.STOP_RECORD);

  /*
   * ============================================================
   * 步骤 3：播放音效
   * ============================================================
   *
   * 停止背景音乐，播放 Game Over 下行旋律。
   */
  runtime.emit(AE.STOP_BGM);
  runtime.emit(AE.PLAY_SOUND, { sound: 'GAME_OVER' });

  /*
   * ============================================================
   * 步骤 4：触发回放或结束界面
   * ============================================================
   *
   * 根据游戏模式分发到不同的处理路径。
   */
  if (runtime.isVersus()) {
    /*
     * -------- 对战模式：触发更新对战分数 --------
     *
     * 由 BattleController 处理后续逻辑：
     *
     * - 更新对战分数（胜者 +1 分）
     * - 判断是否达到整场胜利分数
     * - 整场结束或开始下一局
     */
    runtime.emit(BE.UPDATE_WINNER, {
      loser: runtime,
    });
  } else {
    /*
     * -------- 单人模式：触发回放或结束界面 --------
     *
     * 由 ReplayController 判断后续走向：
     *
     * - 有回放数据 → 准备棋盘进入回放模式
     * - 无回放数据 → 进入 game-over 状态
     */
    runtime.emit(RE.GAME_OVER);
  }
};

export default over;
