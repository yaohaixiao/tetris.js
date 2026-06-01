import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';
import buildActionSequence from '@/lib/ai/planner/build-action-sequence.js';

/**
 * ## 创建单个候选移动
 *
 * 对给定的旋转状态和水平位置，模拟硬降并生成动作序列。
 *
 * @param {object} params - 参数对象
 * @param {number[][]} params.board - 游戏棋盘
 * @param {number[][]} params.currentShape - 当前旋转后的形状
 * @param {number} params.targetX - 目标水平位置
 * @param {object} params.originalPiece - 原始方块对象
 * @param {number} params.rotationCount - 旋转次数（0-3）
 * @returns {{ board: number[][]; actions: string[] }} 候选移动对象
 */
const createCandidate = ({
  board,
  currentShape,
  targetX,
  originalPiece,
  rotationCount,
}) => {
  // 模拟硬降，获取结果棋盘
  const result = simulateDrop(board, currentShape, targetX);

  // 生成动作序列
  const actions = buildActionSequence({
    rotationCount,
    targetX,
    originalX: originalPiece.position.x,
  });

  return {
    board: result.board,
    actions,
  };
};

export default createCandidate;
