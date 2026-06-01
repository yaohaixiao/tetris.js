import generateForPiece from '@/lib/ai/planner/generate-for-piece.js';

/**
 * #@ 生成所有可能的移动
 *
 * 对当前方块和 Hold 方块（如果有），遍历所有旋转状态和水平位置， 模拟硬降后生成候选棋盘，并为每个候选生成对应的动作序列。
 *
 * @function generateMoves
 * @param {object} snapshot - 游戏当前状态信息的快照
 * @param {object} snapshot.board - 棋盘
 * @param {object} snapshot.piece - 当前活动方块
 * @param {object} [snapshot.hold] - Hold 缓存方块（可选）
 * @returns {{ board: number[][]; actions: string[] }[]} 候选移动数组
 */
const generateMoves = (snapshot) => {
  const { board, piece, hold } = snapshot;

  // 1. 当前方块的候选
  const moves = generateForPiece(board, piece, false);

  // 2. Hold 方块的候选（如果有）
  if (hold) {
    const holdPiece = {
      shape: hold.shape,
      position: {
        x:
          Math.floor(board[0].length / 2) -
          Math.floor(hold.shape[0].length / 2),
        y: 0,
      },
    };
    moves.push(...generateForPiece(board, holdPiece, true));
  }

  return moves;
};

export default generateMoves;
