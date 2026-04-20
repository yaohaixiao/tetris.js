import Sounds from '@/lib/audio/sounds.js';
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
 * @param {object} state - 游戏状态.
 * @returns {void}
 */
const drop = (state) => {
  // 循环向下移动，直到无法移动（触底/碰撞）
  while (true) {
    if (!move(0, 1, state)) {
      break;
    }
  }

  // 锁定方块到棋盘
  lock(state);
  // 播放落地音效
  Sounds.fall();

  // 消行处理（含闪烁3次特效）
  clearLines(state);

  // 生成新方块
  spawn(state);
  // 播放快速下落完成音效
  Sounds.drop();
};

export default drop;
