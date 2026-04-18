import Sounds from '@/lib/audio/sounds.js';
import GameState from '@/lib/game/state/game-state.js';
import collision from '@/lib/game/logic/collision.js';

/**
 * # 旋转当前方块
 *
 * 对当前方块进行顺时针旋转（矩阵转置 + 反转） 旋转后若发生碰撞，则自动撤销旋转，保证游戏正常运行
 *
 * @function rotate
 * @returns {void}
 */
const rotate = () => {
  const { curr } = GameState;
  // 保存旋转前的形状，用于碰撞后恢复
  const prev = curr.shape;

  // 顺时针旋转矩阵：转置 + 反转行
  curr.shape = prev[0].map((_, i) => prev.map((r) => r[i]).toReversed());

  // 旋转后发生碰撞 → 恢复原状
  if (collision(0, 0)) {
    curr.shape = prev;
  } else {
    // 旋转成功 → 播放音效
    Sounds.rotate();
  }
};

export default rotate;
