import Sounds from '@/lib/audio/sounds.js';
import Game from '@/lib/game';
import collision from '@/lib/game/logic/collision.js';

/**
 * # 移动当前方块
 *
 * 尝试将当前方块按照指定的偏移量移动（左右/下） 先检测碰撞，无碰撞则执行移动并播放音效
 *
 * @function move
 * @param {number} ox - X 轴偏移量（-1=左, 1=右, 0=不移动）
 * @param {number} oy - Y 轴偏移量（1=下落, 0=不移动）
 * @returns {boolean} 移动成功返回 true，碰撞无法移动返回 false
 */
const move = (ox, oy) => {
  const { store } = Game;
  const state = store.getState();
  let { cx, cy } = state;

  // 无碰撞 → 可以移动
  if (!collision(ox, oy)) {
    cx += ox;
    cy += oy;

    store.setState({
      cx,
      cy,
    });

    // 播放移动音效
    Sounds.move();

    return true;
  }

  // 发生碰撞，无法移动
  return false;
};

export default move;
