import collision from '@/lib/ai/utils/collision.js';
import simulatePlacementInPlace from '@/lib/ai/simulator/simulate-placement-in-place.js';

/**
 * # 模拟方块硬降（零拷贝版）
 *
 * 找到硬降的最终 Y 坐标，但不立即放置方块。 返回一个 `evaluate(callback)` 函数， 调用方需要评分时才真正放置 + 评分 + 回滚。
 *
 * ## 与旧版 simulateDrop 的区别
 *
 * | 版本 | 返回值            | 棋盘处理         |
 * | ---- | ----------------- | ---------------- |
 * | 旧版 | `{ board, y }`    | 每次深拷贝新棋盘 |
 * | 新版 | `{ y, evaluate }` | 原地修改 + 回滚  |
 *
 * @function simulateDrop
 * @param {number[][]} board - 棋盘
 * @param {number[][]} shape - 方块形状矩阵
 * @param {number} startX - 起始 X 坐标
 * @returns {{ y: number; evaluate: Function }} 下落终点和延迟评分函数
 */
const simulateDrop = (board, shape, startX) => {
  // 从顶部开始，逐步下移直到碰撞
  let y = 0;
  while (!collision(board, shape, startX, y + 1)) {
    y++;
  }

  return {
    /** 硬降终点的 Y 坐标 */
    y,
    /**
     * 延迟评分：调用方需要评分时传 callback
     *
     * 内部流程：原地放置方块 → 调 callback 评分 → 回滚棋盘
     *
     * @param {Function} callback - 评分函数，接收放置后的棋盘，返回评分
     * @returns {any} 评分结果
     */
    evaluate: (callback) =>
      simulatePlacementInPlace(board, shape, startX, y, callback),
  };
};

export default simulateDrop;
