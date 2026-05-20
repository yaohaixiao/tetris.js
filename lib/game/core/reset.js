import setBeginningState from '@/lib/game/actions/set-beginning-state.js';

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
 * @param {object} game - 游戏执行上下文
 * @param {string} [mode='main-menu'] - 重置的目标模式。默认值为 `'main-menu'`. Default is
 *   `'main-menu'`
 * @returns {void}
 */
const reset = (game, mode = 'main-menu') => {
  const { id, Store } = game;
  let level = Store.getLevel();

  // 1. 停止背景音乐：避免从游戏结束/暂停状态切回时音频继续播放
  game.emit('audio:stop:bgm');

  // 2. 清除动画和命令队列，确保无残留的动画/输入状态
  game.emit(`animations:${id}:clear`);
  game.emit(`command:queue:${id}:clear`);

  // 3. 重置棋盘数据为空棋盘
  Store.resetBoard();

  // 4. 返回主菜单时，重置难度为 easy，等级为 1
  if (mode === 'main-menu') {
    Store.setDifficulty('easy');
    level = 1;
    // 播放场景切换音效
    game.emit('audio:resume:sound', { sound: 'SWITCH_SCENE' });
  }

  // 5. 设置游戏初始状态（分数归零、行数归零等）
  setBeginningState(game, mode, level);

  // 6. 更新 HUD 显示和 UI 模式
  game.emit(`ui:${id}:update:hud`, { state: Store.getState() });
  game.emit(`ui:${id}:update:mode`, { mode });

  // 7. 停止 AI
  game.emit(`ai:${id}:stop`);

  // 8. 更新 Controller 信息
  Store.setController('human');
  game.emit(`ui:${id}:update:controller`, { controller: 'human' });

  // 9. 重置 Replay 状态
  game.emit(`replay:${id}:reset`);
};

export default reset;
