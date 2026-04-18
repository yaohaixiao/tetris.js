import BOARD from '@/lib/ui/constants/board.js';
import GameState from '@/lib/game/state/game-state.js';

/**
 * # 碰撞检测
 *
 * 检测当前方块在指定偏移位置后，是否与边界或已有方块发生碰撞 用于移动、旋转前的合法性判断
 *
 * @function collision
 * @param {number} ox - X 轴偏移量
 * @param {number} oy - Y 轴偏移量
 * @returns {boolean} 发生碰撞返回 true，无碰撞返回 false
 */
const collision = (ox, oy) => {
  const { ROWS, COLS } = BOARD;

  if (!GameState.curr) {
    return false;
  }

  // 获取当前方块的形状矩阵
  const s = GameState.curr.shape;

  // 遍历方块的每一格进行碰撞判断
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 只判断方块有内容的格子
      if (s[y][x]) {
        // 计算偏移后的实际棋盘坐标
        const nx = GameState.cx + x + ox;
        const ny = GameState.cy + y + oy;

        /*
         * 碰撞判断条件：
         * 1. 超出左边界  2. 超出右边界
         * 3. 超出底部边界 4. 与已有方块重叠
         */
        if (
          nx < 0 ||
          nx >= COLS ||
          ny >= ROWS ||
          (ny >= 0 && GameState.board[ny][nx])
        ) {
          return true;
        }
      }
    }
  }

  // 无碰撞
  return false;
};

export default collision;
