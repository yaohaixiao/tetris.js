import collision from '@/lib/ai/utils/collision.js';

/**
 * # 模拟方块硬降（分支复制模型）
 *
 * 找到硬降的最终 Y 坐标，但不在此处放置方块。 返回终点 Y 和 `placeOn(targetBoard)` 函数，
 * 由调用方（selfPlay）在分支棋盘上执行放置。
 *
 * ## 为什么不在本函数内放置方块？
 *
 * SelfPlay 采用分支复制模型——每个候选移动都在原始棋盘的 独立副本上操作。本函数只计算"下落终点在哪"， 实际写入由 selfPlay
 * 在分支棋盘上调用 placeOn 完成。
 *
 * ## 分支复制模型
 *
 *     原始棋盘（只读）
 *       ├── 候选A → cloneBoard → placeOn → 消行 → 评分
 *       ├── 候选B → cloneBoard → placeOn → 消行 → 评分
 *       └── 候选C → cloneBoard → placeOn → 消行 → 评分
 *
 * 每个分支的棋盘完全隔离，无需回滚，消除了共享可变状态 在递归树搜索中的回滚顺序错位风险。
 *
 * @function simulateDrop
 * @param {number[][]} board - 棋盘（只读，不修改）
 * @param {number[][]} shape - 方块形状矩阵，1 为实心，0 为空
 * @param {number} startX - 起始 X 坐标（列偏移）
 * @returns {{ y: number; placeOn: Function }} 下落终点和放置函数
 */
const simulateDrop = (board, shape, startX) => {
  // 从顶部开始，逐步下移直到碰撞
  let y = 0;
  while (!collision(board, shape, startX, y + 1)) {
    y++;
  }

  /**
   * ## 在指定棋盘上原地放置方块
   *
   * 由 selfPlay 在分支棋盘（cloneBoard 的副本）上调用。 直接修改传入的棋盘，不产生新副本。
   *
   * @param {number[][]} targetBoard - 分支棋盘（已通过 cloneBoard 隔离）
   * @returns {number[][]} 放置方块后的同一棋盘引用
   */
  const placeOn = (targetBoard) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[0].length; col++) {
        // 跳过空格子（值为 0 或 falsy 的格子不参与放置）
        if (!shape[row][col]) continue;

        // 计算该格子在棋盘上的绝对坐标
        const by = y + row;
        const bx = startX + col;

        // 边界保护：只写入棋盘范围内的位置
        if (by >= 0 && by < targetBoard.length) {
          targetBoard[by][bx] = 1;
        }
      }
    }
    return targetBoard;
  };

  return {
    /** 硬降终点的 Y 坐标 */
    y,
    /** 放置函数：在分支棋盘上写入方块 */
    placeOn,
  };
};

export default simulateDrop;
