import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';
import buildActionSequence from '@/lib/ai/planner/build-action-sequence.js';

/**
 * ## 创建单个候选移动（分支复制模型）
 *
 * 模拟硬降获取终点 Y 和放置函数，不立即生成棋盘。 棋盘由 selfPlay 在分支点通过 cloneBoard 拷贝后，调用 placeOn 写入方块。
 *
 * ## 候选对象结构
 *
 * | 字段      | 类型     | 说明                                            |
 * | --------- | -------- | ----------------------------------------------- |
 * | `x`       | number   | 硬降终点的 X 坐标                               |
 * | `y`       | number   | 硬降终点的 Y 坐标                               |
 * | `placeOn` | Function | 放置函数，接收目标棋盘，原地写入方块            |
 * | `actions` | string[] | 动作序列，如 `['ROTATE', 'MOVE_RIGHT', 'DROP']` |
 *
 * @param {object} params - 参数对象
 * @param {number[][]} params.board - 棋盘（只读）
 * @param {number[][]} params.currentShape - 当前旋转后的形状
 * @param {number} params.targetX - 目标水平位置
 * @param {object} params.originalPiece - 原始方块对象 { shape, position }
 * @param {number} params.rotationCount - 旋转次数（0-3）
 * @returns {{ x: number; y: number; placeOn: Function; actions: string[] }}
 *   候选移动对象
 */
const createCandidate = ({
  board,
  currentShape,
  targetX,
  originalPiece,
  rotationCount,
}) => {
  // 模拟硬降，获取终点 Y 和放置函数
  const { y, placeOn } = simulateDrop(board, currentShape, targetX);

  // 生成动作序列：旋转 → 平移 → 硬降
  const actions = buildActionSequence({
    rotationCount,
    targetX,
    originalX: originalPiece.position.x,
  });

  return {
    /** 硬降终点 X 坐标（用于 advanceSnapshot 正确模拟放置位置） */
    x: targetX,
    /** 硬降终点 Y 坐标 */
    y,
    /** 放置函数：在分支棋盘上写入方块 */
    placeOn,
    /** 动作序列 */
    actions,
  };
};

export default createCandidate;
