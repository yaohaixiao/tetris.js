import generateForPiece from '@/lib/ai/planner/generate-for-piece.js';

/**
 * # 生成所有可能的移动（含 Hold 决策支持）
 *
 * 对当前方块和 Hold 方块（如果有），遍历所有旋转状态和水平位置， 模拟硬降后生成候选棋盘，并为每个候选生成对应的动作序列。
 *
 * ## Hold 决策
 *
 * 同时生成当前方块和 Hold 方块的候选移动，让 AI 在评分时 自然比较两者的优劣。如果 Hold 方块的落点评分更高，AI 就会选择 Hold。
 *
 * **Hold 为空时**：使用 `snapshot.next`（下一个预览块）作为 "Hold 后会得到的方块"生成候选。这让 AI 在 Hold
 * 槽为空时 也能评估"Hold 一下把 next 换出来值不值得"。
 *
 * ## 候选结构
 *
 * 每个候选移动包含：
 *
 * - `board`：硬降后、消行前的棋盘状态
 * - `actions`：动作序列数组，如 `['ROTATE', 'MOVE_LEFT', 'DROP']`
 * - Hold 候选的 `actions` 第一项为 `'HOLD'`
 *
 * @function generateMoves
 * @param {object} snapshot - 游戏当前状态信息的快照
 * @param {number[][]} snapshot.board - 棋盘二维数组
 * @param {object} snapshot.piece - 当前活动方块 `{ shape, position: { x, y } }`
 * @param {object} [snapshot.hold] - Hold 缓存方块（可选），结构与 piece 相同
 * @param {object} [snapshot.next] - 下一个预览方块（可选），Hold 为空时用作备选
 * @returns {{ board: number[][]; actions: string[] }[]} 候选移动数组
 */
const generateMoves = (snapshot) => {
  const { board, piece, hold, next } = snapshot;

  // 1. 当前方块的候选：遍历 4 个旋转状态 × 合法水平位置
  const moves = generateForPiece(board, piece, false);

  /**
   * 2. Hold 候选
   *
   * 优先使用 hold 槽中的方块。如果 hold 为空，则使用 next（下一个预览块） 作为"Hold 后会得到的方块"。这让 AI 在 Hold
   * 槽为空时也能评估 "Hold 一下把 next 换出来值不值得"。
   *
   * 候选的动作序列以 'HOLD' 开头，让 AI 在执行时知道需要先切换方块。
   */
  const holdPieceSource = hold || next;

  if (holdPieceSource) {
    // 构建 Hold 方块的 piece 数据（居中放置）
    const holdPiece = {
      shape: holdPieceSource.shape,
      position: {
        x:
          Math.floor(board[0].length / 2) -
          Math.floor(holdPieceSource.shape[0].length / 2),
        y: 0,
      },
    };
    // 生成 Hold 方块的候选，isHold=true 会在动作序列前加 'HOLD'
    moves.push(...generateForPiece(board, holdPiece, true));
  }

  return moves;
};

export default generateMoves;
