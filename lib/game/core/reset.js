import EventBus from '@/lib/core/event-bus/index.js';
import Game from '@/lib/game';
import setBeginningState from '@/lib/game/utils/set-beginning-state.js';

/**
 * # 重置游戏状态
 *
 * 该函数用于将当前游戏从游戏结束（Game Over）状态安全地重置回主菜单状态， 或者从游戏中（Playing）状态强制重新开始游戏。
 *
 * 执行流程：
 *
 * 1. 停止背景音乐
 * 2. 重置游戏主循环/引擎状态
 * 3. 清空游戏棋盘数据
 * 4. 切换游戏模式为 main-menu
 * 5. 重置核心游戏状态数据（score / lines / level / next）
 * 6. 重新渲染 HUD（分数/等级/最高分）
 *
 * @function reset
 * @param {string} [mode='main-menu'] - 希望重置的状态. Default is `'main-menu'`
 * @returns {void}
 */
const reset = (mode = 'main-menu') => {
  const { store } = Game;
  let level = store.getLevel();

  // 1. 停止背景音乐：避免从游戏结束/暂停状态切回菜单时音频继续播放
  EventBus.emit('audio:stop:bgm');

  // 2. 重置动画，
  EventBus.emit('animations:clear');
  EventBus.emit('command:queue:clear');

  // 按R键重新开始，则清理回放数据
  if (mode === 'playing') {
    EventBus.emit('replay:reset');
  }

  // 3. 重置棋盘数据
  store.resetBoard();

  // 结束状态，返回主菜单，重置难度等级
  if (mode === 'main-menu') {
    store.setDifficulty('easy');
    level = 1;
  }

  // 4. 更新状态信息到游戏开始状态
  setBeginningState(mode, level);

  // 5. 更新 HUD UI
  EventBus.emit('ui:update:hud', { state: store.getState() });

  // 6. 重新开始记录回放数据
  EventBus.emit('replay:start:record');
};

export default reset;
