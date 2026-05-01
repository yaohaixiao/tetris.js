import BOARD from '@/lib/ui/constants/board.js';
import Game from '@/lib/game';

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
  const state = Game.store.getState();
  const { curr, cx, cy, board } = state;

  if (!curr) {
    return false;
  }

  // 获取当前方块的形状矩阵
  const s = curr.shape;

  // 遍历方块的每一格进行碰撞判断
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 只判断方块有内容的格子
      if (s[y][x]) {
        // 计算偏移后的实际棋盘坐标
        const nx = cx + x + ox;
        const ny = cy + y + oy;

        // 边界碰撞检测（墙 / 地面）：只要方块任意一格超出棋盘范围，就判定为碰撞
        const outOfBounds = nx < 0 || nx >= COLS || ny >= ROWS;

        // 方块重叠检测（已有方块）：只有当 y 在合法范围内（>=0），才去读取棋盘数据，防止 ny < 0 时访问 board[-1] 造成错误
        const hitBlock = ny >= 0 && ny < ROWS && board[ny][nx];

        if (outOfBounds || hitBlock) {
          return true;
        }
      }
    }
  }

  // 无碰撞
  return false;
};

export default collision;
