import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import {
  AudioEvents,
  AIEvents,
  AnimationsEvents,
  CommandEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # 重置游戏状态
 *
 * 将游戏从当前状态安全地重置回主菜单或重新开始游戏。
 *
 * ## 使用场景
 *
 * | mode        | 说明                                    |
 * | ----------- | --------------------------------------- |
 * | `main-menu` | Game Over 后返回主菜单，难度重置为 easy |
 * | `playing`   | 游戏中强制重新开始，保留当前等级和难度  |
 *
 * ## 执行流程
 *
 * | 步骤 | 操作           | 说明                          |
 * | ---- | -------------- | ----------------------------- |
 * | 1    | 停止背景音乐   | 避免状态切换时音频继续播放    |
 * | 2    | 清除动画和命令 | 确保无残留的动画/输入状态     |
 * | 3    | 重置棋盘数据   | 清空棋盘为初始状态            |
 * | 4    | 重置难度和等级 | 返回主菜单时难度→easy，等级→1 |
 * | 5    | 设置初始状态   | 分数归零、行数归零等          |
 * | 6    | 更新 UI 显示   | 刷新 HUD 和模式显示           |
 * | 7    | 停止 AI        | 切换回人类控制                |
 * | 8    | 重置控制器     | 控制器设为 human              |
 * | 9    | 重置回放       | 清除录制/回放数据             |
 *
 * ## 调用时机
 *
 * - Game Over 后返回主菜单
 * - 游戏中按 R 键强制重新开始
 * - 回放结束后返回主菜单
 *
 * @function reset
 * @param {object} runtime - 游戏运行时对象
 * @param {string} [mode='main-menu'] - 重置的目标模式。默认值为 `'main-menu'`. Default is
 *   `'main-menu'`
 * @returns {void}
 */
const reset = (runtime, mode = 'main-menu') => {
  const { id, Store } = runtime;
  const AUE = AudioEvents();
  const AIE = AIEvents(id);
  const ANE = AnimationsEvents(id);
  const CE = CommandEvents(id);
  const RE = ReplayEvents(id);
  const UE = UIEvents(id);

  let level = Store.getLevel();

  /**
   * ======== 步骤 1：停止背景音乐 ========
   *
   * 避免从游戏结束/暂停状态切回时音频继续播放。
   */
  runtime.emit(AUE.STOP_BGM);

  /**
   * ======== 步骤 2：清除动画和命令队列 ========
   *
   * 确保无残留的动画特效或待执行的输入命令。
   */
  runtime.emit(ANE.CLEAR);
  runtime.emit(CE.CLEAR);

  /**
   * ======== 步骤 3：重置棋盘数据 ========
   *
   * 清空棋盘恢复为空棋盘状态。
   */
  Store.resetBoard();

  /**
   * ======== 步骤 4：重置难度和等级 ========
   *
   * 返回主菜单时重置难度为 easy、等级为 1。 重新开始游戏时保留当前的难度和等级设置。
   */
  if (mode === 'main-menu') {
    Store.setDifficulty('easy');
    level = 1;
    // 播放场景切换音效
    runtime.emit(AUE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  /**
   * ======== 步骤 5：设置游戏初始状态 ========
   *
   * 分数归零、行数归零、清除当前方块等。
   */
  setBeginningState(runtime, mode, level);

  /**
   * ======== 步骤 6：更新 UI 显示 ========
   *
   * 刷新 HUD 数据并更新界面模式。
   */
  runtime.emit(UE.UPDATE_HUD, { state: Store.getState() });
  runtime.emit(UE.UPDATE_MODE, { mode });

  /**
   * ======== 步骤 7：停止 AI ========
   *
   * 如果 AI 正在控制，停止 AI 决策循环。
   */
  runtime.emit(AIE.STOP);

  /**
   * ======== 步骤 8：重置控制器 ========
   *
   * 控制器切换回人类玩家。
   */
  Store.setController('human');
  runtime.emit(UE.UPDATE_CONTROLLER, { controller: 'human' });

  /**
   * ======== 步骤 9：重置回放 ========
   *
   * 清除所有录制/回放数据，重置状态标志位。
   */
  runtime.emit(RE.RESET);
};

export default reset;
