import setBeginningState from '@/lib/game/actions/set-beginning-state.js';

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
 * @param context - 执行上下文对象
 * @param {string} [mode='main-menu'] - 希望重置的状态. Default is `'main-menu'`
 * @returns {void}
 */
const reset = (context, mode = 'main-menu') => {
  const { id, Store } = context;
  let level = Store.getLevel();

  // 1. 停止背景音乐：避免从游戏结束/暂停状态切回菜单时音频继续播放
  context.emit('audio:stop:bgm');

  // 2. 重置动画，
  context.emit(`animations:${id}:clear`);
  context.emit(`command:queue:${id}:clear`);

  // 3. 重置棋盘数据
  Store.resetBoard();

  // 结束状态，返回主菜单，重置难度等级
  if (mode === 'main-menu') {
    Store.setDifficulty('easy');
    level = 1;
    context.emit('audio:play:sound', { sound: 'SWITCH_SCENE' });
  }

  // 4. 更新状态信息到游戏开始状态
  setBeginningState(context, mode, level);

  // 5. 更新 UI
  context.emit(`ui:${id}:update:hud`, { state: Store.getState() });
  context.emit(`ui:${id}:update:mode`, { mode });
};

export default reset;
