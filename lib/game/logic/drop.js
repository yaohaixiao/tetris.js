import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 快速下落（硬降）
 *
 * 方块瞬间直接落到底部，自动锁定、消行、生成新方块 相比普通下落，直接触达最底部，是玩家常用操作
 *
 * @function drop
 * @param context - 执行上下文对象
 * @returns {void}
 */
const drop = (context) => {
  // 循环向下移动，直到无法移动（触底/碰撞）
  while (true) {
    if (!move(context, 0, 1)) {
      break;
    }
  }

  // 锁定方块到棋盘
  lock(context);
  // 播放落地音效
  context.emit('audio:play:sound', { sound: 'FALL' });
  // 执行消行逻辑（包含闪烁3次特效）
  clearLines(context);
  // 生成新方块
  spawn(context);
  // 播放快速下落完成音效
  context.emit('audio:play:sound', { sound: 'DROP' });
};

export default drop;
