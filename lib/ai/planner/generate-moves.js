import generateForPiece from '@/lib/ai/planner/generate-for-piece.js';

/**
 * ============================================================
 *
 * # 生成所有可能的移动（含 Hold 决策支持）
 *
 * ============================================================
 *
 * 对当前方块和 Hold 方块（如果有），遍历所有旋转状态和水平位置， 模拟硬降后生成候选棋盘，并为每个候选生成对应的动作序列。
 *
 * ## Hold 决策
 *
 * 同时生成当前方块和 Hold 方块的候选移动， 让 AI 在评分时自然比较两者的优劣。 如果 Hold 方块的落点评分更高，AI 就会选择执行 Hold
 * 操作。
 *
 * Hold 为空时，使用 snapshot.next（下一个预览块）作为 "Hold 后会得到的方块"生成候选。 这让 AI 在 Hold
 * 槽为空时也能评估是否值得 Hold。
 *
 * ## 候选结构
 *
 * 每个候选移动包含：
 *
 * - Board：硬降后、消行前的棋盘状态
 * - Actions：动作序列数组
 * - Hold 候选的 actions 第一项为 'HOLD'
 *
 * @function generateMoves
 * @param {object} snapshot - 游戏当前状态信息的快照
 * @returns {{ board: number[][]; actions: string[] }[]} 候选移动数组
 */
const generateMoves = (snapshot) => {
  const { board, piece, hold, next } = snapshot;

  // 生成当前方块的候选移动
  const moves = generateForPiece(board, piece, false);

  // 确定 Hold 方块来源：优先 hold 槽，为空时使用 next 预览块
  const holdPieceSource = hold || next;

  // 生成 Hold 方块的候选移动
  if (holdPieceSource) {
    // 将 Hold 方块居中放置在棋盘顶部
    const holdPiece = {
      shape: holdPieceSource.shape,
      position: {
        x:
          Math.floor(board[0].length / 2) -
          Math.floor(holdPieceSource.shape[0].length / 2),
        y: 0,
      },
    };

    // 合并 Hold 候选到移动列表，isHold=true 确保 actions 以 'HOLD' 开头
    moves.push(...generateForPiece(board, holdPiece, true));
  }

  return moves;
};

export default generateMoves;
