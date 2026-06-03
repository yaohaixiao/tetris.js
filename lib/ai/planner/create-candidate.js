import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';
import buildActionSequence from '@/lib/ai/planner/build-action-sequence.js';

/**
 * # 创建单个候选移动
 *
 * 对给定的旋转状态和水平位置，模拟方块硬降后的棋盘结果，并生成对应的动作序列。
 *
 * 这是 AI 决策流程中的核心单元：每个候选移动包含一个"模拟结果棋盘"和"达成该结果所需的操作序列"， 后续由评估函数对所有候选移动打分，选出最优解。
 *
 * ## 工作流程
 *
 * 1. 模拟硬降 — 将当前形状放到目标位置，计算落底后的棋盘状态
 * 2. 构建动作序列 — 生成从原始方块到目标位置所需的旋转、移动、硬降指令
 * 3. 返回候选对象 — 将棋盘结果和动作序列打包返回
 *
 * @param {object} options - 参数对象
 * @param {number[][]} options.board - 当前游戏棋盘（二维数组，0 表示空格，其他值表示已占用）
 * @param {number[][]} options.currentShape - 当前旋转后的方块形状（二维矩阵）
 * @param {number} options.targetX - 目标水平位置（方块的目标列索引）
 * @param {object} options.originalPiece - 原始方块对象，包含未旋转前的形状和位置信息
 * @param {number} options.originalPiece.position.x - 原始方块的初始 X 坐标
 * @param {number} options.rotationCount - 旋转次数（0-3 次，每次顺时针旋转 90°）
 * @returns {{ board: number[][]; actions: string[] }}
 *   候选移动对象，包含模拟硬降后的棋盘状态和达成该状态所需的动作序列
 */
const createCandidate = (options) => {
  /*
   * ==================== 解构参数 ====================
   *
   * 从 options 对象中提取所需的棋盘、形状、位置和旋转信息
   */
  const { board, currentShape, targetX, originalPiece, rotationCount } =
    options;

  /*
   * ==================== 模拟硬降 ====================
   *
   * 将当前旋转后的形状放到目标 X 坐标，模拟硬降到底，
   * 返回落底后的新棋盘状态
   */
  const result = simulateDrop(board, currentShape, targetX);

  /*
   * ==================== 构建动作序列 ====================
   *
   * 根据旋转次数和目标位置，生成从原始方块到候选位置所需的操作序列
   * originalX 取原始方块的初始 X 坐标，用于计算水平移动距离
   */
  const actions = buildActionSequence({
    rotationCount,
    targetX,
    originalX: originalPiece.position.x,
  });

  /*
   * ==================== 返回候选对象 ====================
   *
   * 将模拟结果棋盘和动作序列打包返回，供评估函数打分
   */
  return {
    board: result.board,
    actions,
  };
};

export default createCandidate;
