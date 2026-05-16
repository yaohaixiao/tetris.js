import reset from '@/lib/game/core/reset.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 重新开始游戏
 *
 * 重置所有游戏数据、清空棋盘、生成新方块，并重启游戏主循环与背景音乐
 *
 * @function restart
 * @param {object} game - 执行上下文对象
 * @returns {void}
 */
const restart = (game) => {
  const { Store } = game;
  const mode = Store.getMode();

  if (mode !== 'playing') {
    return;
  }

  const level = Store.getLevel();

  reset(game, 'playing');

  // 生成第一个新方块
  spawn(game);

  // 重启背景音乐
  game.emit('audio:resume:bgm', { level });
};

export default restart;
