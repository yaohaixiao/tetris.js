import getShapeByRotation from '@/lib/ai/planner/utils/get-shape-by-rotation.js';
import collision from '@/lib/ai/utils/collision.js';
import getKickData from '@/lib/game/logic/rotate/get-kick-data.js';

/**
 * ============================================================
 *
 * # AI 专用旋转函数：尝试顺时针旋转并应用墙踢
 *
 * ============================================================
 *
 * 对当前方块执行顺时针 90° 旋转， 如果基础旋转位置发生碰撞， 则按 SRS 墙踢表依次尝试偏移位置， 找到第一个合法位置即返回成功。
 *
 * ## 工作流程
 *
 * 1. 计算目标旋转状态（顺时针 90°）
 * 2. 获取旋转后的方块形状矩阵
 * 3. 查找当前类型方块的墙踢偏移表
 * 4. 按顺序尝试每个偏移位置
 * 5. 所有偏移位置都碰撞则旋转失败，返回 null
 *
 * ## 墙踢表结构
 *
 * 不同方块类型有不同的偏移表：
 *
 * - I 型：5 个测试，偏移量较大（±2 级别）
 * - JLSTZ 型：5 个测试，偏移量较小（±1 级别）
 * - O 型：无墙踢（旋转后形状不变，直接返回 null）
 *
 * @function tryAiKickRotation
 * @param {number[][]} board - 游戏棋盘矩阵
 * @param {object} piece - 当前方块对象
 * @param {string} piece.type - 方块类型
 * @param {number} piece.cx - 当前 X 坐标
 * @param {number} piece.cy - 当前 Y 坐标
 * @param {number} piece.rotationState - 当前旋转状态（0-3）
 * @returns {object | null} 旋转成功返回 { success, newRotation, x, y }， 失败返回 null
 */
const tryAiKickRotation = (board, piece) => {
  const { type, cx, cy, rotationState: oldRot } = piece;

  // 计算目标旋转状态：顺时针 0 → 1 → 2 → 3 → 0
  const newRotation = (oldRot + 1) % 4;

  // 从预计算查找表中获取旋转后的形状矩阵
  const rotatedShape = getShapeByRotation(type, newRotation);

  // 获取墙踢偏移表
  const kickTable = getKickData(type);

  // O 型方块旋转后形状不变，不需要墙踢
  if (!kickTable) {
    return null;
  }

  // 获取特定方向转换的偏移测试序列
  const tests = kickTable[oldRot]?.[newRotation];

  // 兜底：无偏移数据时尝试原位旋转
  if (!tests || tests.length === 0) {
    if (!collision(board, rotatedShape, cx, cy)) {
      return { success: true, newRotation, x: cx, y: cy };
    }
    return null;
  }

  // 按 SRS 规定顺序测试每个偏移位置
  for (const [ox, oy] of tests) {
    // SRS 标准 Y 轴向上为正，游戏坐标系 Y 轴向下为正，需取反
    const offsetX = ox;
    const offsetY = -oy;

    const newX = cx + offsetX;
    const newY = cy + offsetY;

    if (!collision(board, rotatedShape, newX, newY)) {
      return {
        success: true,
        newRotation,
        x: newX,
        y: newY,
      };
    }
  }

  // 所有偏移位置都失败
  return null;
};

export default tryAiKickRotation;
