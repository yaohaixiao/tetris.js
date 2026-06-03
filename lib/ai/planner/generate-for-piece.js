import rotateMatrix from '@/lib/ai/simulator/rotate-matrix.js';
import getValidXPositions from '../utils/get-valid-x-positions.js';
import createCandidate from '@/lib/ai/planner/create-candidate.js';

/**
 * # 为指定方块生成所有候选移动
 *
 * 遍历方块的 4 个旋转状态，对每个旋转状态枚举所有合法的水平位置， 为每个组合生成一个候选移动对象。
 *
 * 纯函数，不修改外部状态。所有候选移动交给评估函数统一打分， 选出最优解作为 AI 的下一步操作。
 *
 * ## 生成流程
 *
 * 1. 从原始形状开始，旋转 0~3 次
 * 2. 每次旋转后，计算当前形状在棋盘上的所有合法 X 坐标
 * 3. 对每个合法 X 坐标，创建候选移动对象
 * 4. 如果方块来自 Hold，在动作序列前追加 HOLD 指令
 *
 * @param {number[][]} board - 当前游戏棋盘（二维数组，0 表示空格，其他值表示已占用）
 * @param {object} pieceData - 方块数据对象
 * @param {number[][]} pieceData.shape - 方块的形状矩阵
 * @param {object} pieceData.position - 方块的初始位置
 * @param {number} pieceData.position.x - 方块的初始 X 坐标
 * @param {boolean} [isHold=false] - 是否来自 Hold 队列，为 true 时会在动作序列前追加 HOLD 指令.
 *   Default is `false`
 * @returns {object[]} 候选移动数组，每个元素包含 board（模拟棋盘）和 actions（动作序列）
 */
const generateForPiece = (board, pieceData, isHold = false) => {
  const moves = [];
  let currentShape = pieceData.shape;

  /*
   * ==================== 遍历 4 个旋转状态 ====================
   *
   * 从原始形状开始，每次循环后旋转 90°，
   * 对每个旋转状态生成所有合法水平位置的候选移动
   */
  for (let rotation = 0; rotation < 4; rotation++) {
    /*
     * ==================== 获取合法 X 坐标 ====================
     *
     * 计算当前旋转形状在棋盘上可以放置的所有水平位置
     */
    const validXPositions = getValidXPositions(board, currentShape);

    /*
     * ==================== 遍历所有合法位置 ====================
     *
     * 对每个合法 X 坐标生成一个候选移动对象
     */
    for (const targetX of validXPositions) {
      const candidate = createCandidate({
        board,
        currentShape,
        targetX,
        originalPiece: pieceData,
        rotationCount: rotation,
      });

      /*
       * ==================== 处理 Hold 来源 ====================
       *
       * 如果方块来自 Hold 队列，在动作序列最前面插入 HOLD 指令
       */
      if (isHold) {
        candidate.actions = ['HOLD', ...candidate.actions];
      }

      moves.push(candidate);
    }

    /*
     * ==================== 旋转形状 ====================
     *
     * 为下一次循环准备旋转后的形状
     */
    currentShape = rotateMatrix(currentShape);
  }

  return moves;
};

export default generateForPiece;
