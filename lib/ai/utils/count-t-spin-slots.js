/**
 * ## 统计 T-Spin 槽位数量（简化版）
 *
 * 扫描棋盘，找出 T 块旋转后可能形成 T-Spin 的凹槽位置。 检测模式：中心为空、左右有方块包围、下方有方块支撑。
 *
 * T-Spin 槽位越多，AI 越倾向于继续构造 T-Spin 机会。
 *
 * @param {number[][]} board - 棋盘二维数组
 * @returns {number} T-Spin 潜在槽位数量
 */
const countTSpinSlots = (board) => {
  let slots = 0;

  for (let y = 1; y < board.length - 2; y++) {
    for (let x = 1; x < board[0].length - 1; x++) {
      // 检测 T 型凹槽：中心空、左右有方块、下方有支撑
      if (
        board[y][x] === 0 && // 中间空
        board[y + 1] &&
        board[y + 1][x] !== 0 && // 下方有方块（支撑）
        board[y][x - 1] !== 0 && // 左侧有方块
        board[y][x + 1] !== 0 // 右侧有方块
      ) {
        slots++;
      }
    }
  }

  return slots;
};

export default countTSpinSlots;
