import randomShape from '@/lib/game/utils/random-shape.js';

/**
 * # 获取下一个方块
 *
 * 返回当前要使用的方块和新的预览方块。 根据游戏模式（正常 / 回放）采用不同的获取策略。
 *
 * ## 正常模式
 *
 * - **有预览方块**：将预览方块提升为当前方块（深拷贝形状矩阵）
 * - **无预览方块**（游戏开始）：随机生成当前方块
 * - 随机生成新的预览方块
 *
 * ## 回放模式
 *
 * - 从回放系统录制的方块序列中按顺序读取
 * - 确保回放时方块顺序与录制时完全一致
 *
 * ## 为什么深拷贝形状矩阵？
 *
 * 旋转操作会直接修改 `curr.shape`，如果不深拷贝， 会同时污染预览方块（next）的形状数据。
 *
 * @example
 *   const { curr, next } = getNextPiece(game);
 *   // curr = { shape: [[1,1],[1,1]], color: '#5050ff' }
 *   // next = { shape: [[1,0],[1,1],[0,1]], color: '#0cc0df' }
 *
 * @function getNextPiece
 * @param {object} runtime - 游戏运行时对象
 * @returns {{ curr: object | null; next: object }} 当前方块和预览方块
 */
const getNextPiece = (runtime) => {
  const { Replay, Store } = runtime;

  // 回放模式：从录制的方块序列中按顺序读取
  if (Replay.playing) {
    return Replay.getNextPiece();
  }

  // 正常模式
  const state = Store.getState();
  const { next } = state;

  /*
   * 有预览方块 → 提升为当前方块（深拷贝形状矩阵）
   * 无预览方块 → 随机生成（游戏刚开始时）
   */
  const curr = next
    ? {
        ...next,
        // 深拷贝形状矩阵，避免旋转时污染预览方块
        shape: next.shape.map((row) => [...row]),
      }
    : randomShape();

  return {
    curr,
    // 随机生成新的预览方块
    next: randomShape(),
  };
};

export default getNextPiece;
