import rotateMatrix from '@/lib/ai/simulator/rotate-matrix.js';
import getValidXPositions from '../utils/get-valid-x-positions.js';
import createCandidate from '@/lib/ai/planner/create-candidate.js';

/**
 * ## 为指定方块生成所有候选移动
 *
 * 遍历 4 个旋转状态和所有合法水平位置，为每个组合生成候选移动。 纯函数，不修改外部状态。
 *
 * @param {object} board - 棋盘
 * @param {object} pieceData - 方块数据 { shape, position }
 * @param {boolean} [isHold=false] - 是否来自 Hold，决定是否加 HOLD 动作. Default is `false`
 * @returns {object[]} 候选移动数组
 */
const generateForPiece = (board, pieceData, isHold = false) => {
  const moves = [];
  let currentShape = pieceData.shape;

  for (let rotation = 0; rotation < 4; rotation++) {
    const validXPositions = getValidXPositions(board, currentShape);

    for (const targetX of validXPositions) {
      const candidate = createCandidate({
        board,
        currentShape,
        targetX,
        originalPiece: pieceData,
        rotationCount: rotation,
      });

      if (isHold) {
        candidate.actions = ['HOLD', ...candidate.actions];
      }

      moves.push(candidate);
    }

    currentShape = rotateMatrix(currentShape);
  }

  return moves;
};

export default generateForPiece;
