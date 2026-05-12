import reset from '@/lib/game/core/reset.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 重新开始游戏
 *
 * 重置所有游戏数据、清空棋盘、生成新方块，并重启游戏主循环与背景音乐
 *
 * @function restart
 * @param context - 执行上下文对象
 * @returns {void}
 */
const restart = (context) => {
  const { Store, options } = context;
  const mode = Store.getMode();

  if (mode !== 'playing') {
    return;
  }

  const level = Store.getLevel();
  const maxLevel = options.Level.max;

  reset(context, 'playing');

  // 生成第一个新方块
  spawn(context);

  // 重启背景音乐
  context.emit('audio:play:bgm', { level, maxLevel });
};

export default restart;
