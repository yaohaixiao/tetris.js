/**
 * # AI 旋转墙踢系统
 *
 * 实现标准 SRS（Super Rotation System）墙踢逻辑，让 AI 能够在基础旋转失败时 尝试一系列偏移位置，实现贴墙旋转、钻缝等高级操作。
 */

import collision from '@/lib/ai/utils/collision.js';
import getKickData from '@/lib/game/logic/rotate/get-kick-data.js';
import getShapeByRotation from '@/lib/ai/utils/get-shape-by-rotation.js';

/**
 * # AI 专用旋转函数：尝试顺时针旋转并应用墙踢
 *
 * 对当前方块执行顺时针 90° 旋转，如果基础旋转位置发生碰撞， 则按 SRS 墙踢表依次尝试偏移位置，找到第一个合法位置即返回成功。
 *
 * ## 工作流程
 *
 * 1. 计算目标旋转状态（顺时针 90°）
 * 2. 获取旋转后的方块形状矩阵
 * 3. 查找当前类型方块的墙踢偏移表
 * 4. 按顺序尝试每个偏移位置，找到第一个不碰撞的位置即成功
 * 5. 所有偏移位置都碰撞则旋转失败，返回 null
 *
 * ## 墙踢表结构
 *
 * 不同方块类型有不同的偏移表：
 *
 * - **I 型**：5 个测试，偏移量较大（±2 级别）
 * - **JLSTZ 型**：5 个测试，偏移量较小（±1 级别）
 * - **O 型**：无墙踢（旋转后形状不变，直接返回 null）
 *
 * @param {number[][]} board - 游戏棋盘矩阵，0 表示空格，非 0 表示已占用
 * @param {object} piece - 当前方块对象
 * @param {string} piece.type - 方块类型：'I' | 'I5' | 'T' | 'J' | 'L' | 'S' | 'Z' |
 *   'O'
 * @param {number} piece.cx - 当前 X 坐标（列索引）
 * @param {number} piece.cy - 当前 Y 坐标（行索引）
 * @param {number} piece.rotationState - 当前旋转状态：0 | 1 | 2 | 3
 * @returns {object | null} 旋转成功返回 { success: true, newRotation, x, y }，失败返回
 *   null
 */
const tryAiKickRotation = (board, piece) => {
  /*
   * ==================== 解构当前方块状态 ====================
   *
   * 提取方块的类型、坐标和当前旋转状态
   */
  const { type, cx, cy, rotationState: oldRot } = piece;

  /*
   * ==================== 计算目标旋转状态 ====================
   *
   * 顺时针旋转：0 → 1 → 2 → 3 → 0
   * 使用模运算保证状态在 0~3 之间循环
   */
  const newRotation = (oldRot + 1) % 4;

  /*
   * ==================== 获取旋转后的形状矩阵 ====================
   *
   * O(1) 从预计算的查找表中直接取出对应类型和旋转状态的形状，
   * 避免每次旋转都动态计算矩阵旋转，大幅提升 AI 搜索效率
   */
  const rotatedShape = getShapeByRotation(type, newRotation);

  /*
   * ==================== 获取墙踢偏移表 ====================
   *
   * kickTable 结构示例（标准 SRS JLSTZ）：
   * {
   *   0: { 1: [[0,0], [-1,0], [-1,+1], [0,-2], [-1,-2]],  // 0→R 顺时针
   *        3: [[0,0], [+1,0], [+1,+1], [0,-2], [+1,-2]] }  // 0→L 逆时针
   *   1: { 0: [[0,0], [+1,0], [+1,-1], [0,+2], [+1,+2]],  // R→0
   *        2: [[0,0], [+1,0], [+1,-1], [0,+2], [+1,+2]] }  // R→2
   *   ... 以此类推
   * }
   */
  const kickTable = getKickData(type);

  /*
   * ==================== 处理无墙踢数据的方块 ====================
   *
   * O 型方块旋转后形状不变，不需要墙踢。
   * 如果 kickTable 为空，直接返回 null 表示无法旋转（或不需要旋转）
   */
  if (!kickTable) {
    return null;
  }

  /*
   * ==================== 获取特定方向转换的偏移测试序列 ====================
   *
   * 必须同时索引 [oldRot] 和 [newRotation]，因为不同转换方向有不同的偏移序列。
   * 可选链操作符 (?.) 确保即使数据缺失也不会崩溃。
   */
  const tests = kickTable[oldRot]?.[newRotation];

  /*
   * ==================== 兜底：无偏移数据时尝试原位旋转 ====================
   *
   * 理论上所有标准方块都应该有偏移数据，但作为防御性编程保留此逻辑。
   * 如果原位不碰撞则返回成功，否则返回 null。
   */
  if (!tests || tests.length === 0) {
    if (!collision(board, rotatedShape, cx, cy)) {
      return { success: true, newRotation, x: cx, y: cy };
    }
    return null;
  }

  /*
   * ==================== 按顺序测试每个偏移位置 ====================
   *
   * SRS 规定必须按顺序测试，第一个不碰撞的位置即为最终结果。
   *
   * 测试顺序通常为：
   *   测试 0: 原位 (0, 0)
   *   测试 1: 左移一列 (-1, 0)
   *   测试 2: 左上对角 (-1, +1)
   *   测试 3: 下移两行 (0, -2)
   *   测试 4: 左下对角 (-1, -2)
   *
   * 使用 for...of 遍历，找到第一个有效位置后立即 return 退出循环
   */
  for (const [ox, oy] of tests) {
    /*
     * X 轴偏移：正数向右，负数向左
     */
    const offsetX = ox;

    /*
     * Y 轴取反：SRS 标准使用数学坐标系（Y 向上为正），
     * 而游戏棋盘通常使用屏幕坐标系（Y 向下为正）。
     * 因此需要对标准偏移的 Y 值取反。
     *
     * 举例：标准偏移 (0, +1) 在数学坐标中表示向上移动
     *       取反后 (0, -1) 在屏幕坐标中表示向上移动（行号减小）
     *
     * 如果 getKickData 返回的数据已经适配了屏幕坐标系，
     * 请将下面这行改为：const offsetY = oy;
     */
    const offsetY = -oy;

    /*
     * ==================== 计算新位置并检测碰撞 ====================
     *
     * 将偏移量应用到当前坐标，检查旋转后的形状是否与棋盘或边界碰撞
     */
    const newX = cx + offsetX;
    const newY = cy + offsetY;

    if (!collision(board, rotatedShape, newX, newY)) {
      /*
       * 找到有效位置，旋转成功
       */
      return {
        success: true,
        newRotation,
        x: newX,
        y: newY,
      };
    }
  }

  /*
   * ==================== 所有偏移位置都失败 ====================
   *
   * 旋转完全失败，方块保持原位和原旋转状态
   */
  return null;
};

export default tryAiKickRotation;
