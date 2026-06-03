import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';
import buildActionSequence from '@/lib/ai/planner/build-action-sequence.js';

/**
 * ## 创建单个候选移动（零拷贝版）
 *
 * 模拟硬降获取终点 Y 坐标，但不立即生成棋盘。 候选的 `evaluate` 方法在真正评分时才放置 + 评分 + 回滚。
 *
 * ## 候选结构
 *
 * | 字段       | 类型     | 说明                                           |
 * | ---------- | -------- | ---------------------------------------------- |
 * | `y`        | number   | 硬降终点的 Y 坐标                              |
 * | `actions`  | string[] | 动作序列，如 `['ROTATE', 'MOVE_LEFT', 'DROP']` |
 * | `evaluate` | Function | 延迟评分函数，接收 callback 返回评分           |
 *
 * @param {object} params - 参数对象
 * @param {number[][]} params.board - 游戏棋盘
 * @param {number[][]} params.currentShape - 当前旋转后的形状
 * @param {number} params.targetX - 目标水平位置
 * @param {object} params.originalPiece - 原始方块对象
 * @param {number} params.rotationCount - 旋转次数（0-3）
 * @returns {{ evaluate: Function; actions: string[]; y: number }} 候选移动对象
 */
const createCandidate = ({
  board,
  currentShape,
  targetX,
  originalPiece,
  rotationCount,
}) => {
  // 模拟硬降，获取终点 Y 和延迟评分函数
  const result = simulateDrop(board, currentShape, targetX);

  // 生成动作序列：旋转 → 平移 → 硬降
  const actions = buildActionSequence({
    rotationCount,
    targetX,
    originalX: originalPiece.position.x,
  });

  return {
    /** 硬降终点 Y 坐标 */
    y: result.y,
    /** 动作序列 */
    actions,
    /**
     * 延迟评分：只在真正需要评分时才放置 + 评分 + 回滚
     *
     * @param {Function} callback - 评分函数，接收放置后的棋盘，返回评分
     * @returns {any} 评分结果
     */
    evaluate: (callback) => result.evaluate(callback),
  };
};

export default createCandidate;
