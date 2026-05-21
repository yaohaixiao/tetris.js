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
 * 1. 停止背景音乐
 * 2. 清除动画和命令队列
 * 3. 重置棋盘数据
 * 4. 如果返回主菜单，重置难度为 easy、等级为 1
 * 5. 设置游戏初始状态
 * 6. 更新 UI 显示
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

  // 1. 停止背景音乐：避免从游戏结束/暂停状态切回时音频继续播放
  runtime.emit(AUE.STOP_BGM);

  // 2. 清除动画和命令队列，确保无残留的动画/输入状态
  runtime.emit(ANE.CLEAR);
  runtime.emit(CE.CLEAR);

  // 3. 重置棋盘数据为空棋盘
  Store.resetBoard();

  // 4. 返回主菜单时，重置难度为 easy，等级为 1
  if (mode === 'main-menu') {
    Store.setDifficulty('easy');
    level = 1;
    // 播放场景切换音效
    runtime.emit(AUE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  // 5. 设置游戏初始状态（分数归零、行数归零等）
  setBeginningState(runtime, mode, level);

  // 6. 更新 HUD 显示和 UI 模式
  runtime.emit(UE.UPDATE_HUD, { state: Store.getState() });
  runtime.emit(UE.UPDATE_MODE, { mode });

  // 7. 停止 AI
  runtime.emit(AIE.STOP);

  // 8. 更新 Controller 信息
  Store.setController('human');
  runtime.emit(UE.UPDATE_CONTROLLER, { controller: 'human' });

  // 9. 重置 Replay 状态
  runtime.emit(RE.RESET);
};

export default reset;
