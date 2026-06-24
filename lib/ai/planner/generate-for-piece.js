import rotateMatrix from '@/lib/ai/simulator/rotate-matrix.js';
import getValidXPositions from '@/lib/ai/planner/utils/get-valid-x-positions.js';
import createCandidate from '@/lib/ai/planner/create-candidate.js';

/**
 * ## 为指定方块生成所有候选移动
 *
 * 遍历方块的旋转状态和所有合法水平位置，对每个组合：
 *
 * 1. 模拟硬降到底（获取终点 Y 坐标）
 * 2. 生成动作序列（旋转 → 平移 → 硬降）
 * 3. 打包为候选移动对象（支持延迟评分）
 *
 * 纯函数，不修改外部状态。所有评分通过候选对象的 `evaluate` 方法延迟执行。
 *
 * ## 旋转去重优化
 *
 * 部分方块的多个旋转状态形状完全相同，无需重复遍历：
 *
 * | 类型   | 独特旋转数 | 说明                                |
 * | ------ | ---------- | ----------------------------------- |
 * | O      | 1          | 2×2 正方形，四个旋转状态完全一致    |
 * | I / I5 | 2          | 横条和竖条两个方向，其余两两重复    |
 * | 其他   | 4          | J / L / S / Z / T 各有 4 个独特方向 |
 *
 * 此优化将每步决策的候选数减少约 30%，直接提升 AI 搜索速度。
 *
 * ## 候选对象结构
 *
 * 每个候选移动包含：
 *
 * | 字段       | 类型     | 说明                                            |
 * | ---------- | -------- | ----------------------------------------------- |
 * | `y`        | number   | 硬降终点的 Y 坐标                               |
 * | `actions`  | string[] | 动作序列，如 `['ROTATE', 'MOVE_RIGHT', 'DROP']` |
 * | `evaluate` | Function | 延迟评分函数，调用时才放置 + 评分 + 回滚        |
 *
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} pieceData - 方块数据
 * @param {number[][]} pieceData.shape - 方块形状矩阵
 * @param {string} [pieceData.type] - 方块类型标识，用于旋转去重（'O'/'I'/'I5' 等）
 * @param {object} pieceData.position - 方块当前位置 { x, y }
 * @param {boolean} [isHold=false] - 是否来自 Hold 槽，决定动作序列是否以 'HOLD' 开头. Default is
 *   `false`
 * @returns {object[]} 候选移动数组，每个元素包含 evaluate、actions、y
 */
const generateForPiece = (board, pieceData, isHold = false) => {
  const moves = [];
  let currentShape = pieceData.shape;

  /**
   * 旋转去重：根据方块类型确定需要遍历的旋转次数
   *
   * - O 块（2×2 正方形）：4 个旋转状态完全相同，只遍历 1 次
   * - I / I5 块（长条）：横竖两个方向，只遍历 2 次
   * - 其他方块（J/L/S/Z/T）：遍历全部 4 个旋转状态
   *
   * `pieceData.type` 可能为 undefined（兼容旧代码），此时默认为 4。
   */
  const type = pieceData.type || '';
  let uniqueRotations = 4;

  if (type === 'O') {
    uniqueRotations = 1;
  } else if (type === 'I' || type === 'I5') {
    uniqueRotations = 2;
  }

  for (let rotation = 0; rotation < uniqueRotations; rotation++) {
    /**
     * 获取当前旋转状态下所有合法的 X 坐标
     *
     * 合法范围：0 到 (棋盘宽度 - 方块宽度) 例如 T 型方块（宽 3）在 10 列棋盘上可放在 x=0~7（共 8 个位置）
     */
    const validXPositions = getValidXPositions(board, currentShape);

    for (const targetX of validXPositions) {
      // 生成候选：模拟硬降 + 构建动作序列
      const candidate = createCandidate({
        board,
        currentShape,
        targetX,
        originalPiece: pieceData,
        rotationCount: rotation,
      });

      // Hold 候选：动作序列前加上 'HOLD' 标记
      if (isHold) {
        candidate.actions = ['HOLD', ...candidate.actions];
      }

      moves.push(candidate);
    }

    // 为下一次迭代准备旋转后的形状
    currentShape = rotateMatrix(currentShape);
  }

  return moves;
};

export default generateForPiece;
