/**
 * AI 旋转墙踢系统
 *
 * 实现标准 SRS (Super Rotation System) 墙踢逻辑，让 AI 能够在基础旋转失败时
 * 尝试一系列偏移位置，实现贴墙旋转、钻缝等高级操作。
 */

import collision from '@/lib/ai/utils/collision.js';
import getKickData from '@/lib/game/logic/rotate/get-kick-data.js';
import getShapeByRotation from '@/lib/ai/utils/get-shape-by-rotation.js';

/**
 * AI 专用旋转函数：尝试顺时针旋转并应用墙踢
 *
 * 工作流程：
 *
 * 1. 计算目标旋转状态（顺时针 90°）
 * 2. 获取旋转后的方块形状矩阵
 * 3. 查找当前类型方块的墙踢偏移表
 * 4. 按顺序尝试每个偏移位置，找到第一个不碰撞的位置即成功
 * 5. 所有偏移位置都碰撞则旋转失败
 *
 * @param {object} board - 游戏棋盘矩阵，0 表示空格，非 0 表示已占用
 * @param {object} piece - 当前方块对象
 * @param {string} piece.type - 方块类型: 'I' | 'I5' | 'T' | 'J' | 'L' | 'S' | 'Z' |
 *   'O'
 * @param {number} piece.cx - 当前 X 坐标（列）
 * @param {number} piece.cy - 当前 Y 坐标（行）
 * @param {number} piece.rotationState - 当前旋转状态: 0 | 1 | 2 | 3
 * @returns {object | null} 旋转成功返回 { success: true, newRotation, x, y }，失败返回
 *   null
 */
const tryAiKickRotation = (board, piece) => {
  /* 1. 解构当前方块状态 */
  const { type, cx, cy, rotationState: oldRot } = piece;

  /* 2. 计算目标旋转状态 */
  /* 顺时针旋转：0 -> 1 -> 2 -> 3 -> 0 */
  const newRotation = (oldRot + 1) % 4;

  /* 3. O(1) 获取旋转后的形状矩阵 */
  /* 从预计算的查找表中直接取出对应类型和旋转状态的形状 */
  /* 避免每次旋转都动态计算矩阵旋转，大幅提升 AI 搜索效率 */
  const rotatedShape = getShapeByRotation(type, newRotation);

  /* 4. 获取该方块类型的墙踢偏移表 */
  /*
   * kickTable 结构示例（标准 SRS JLSTZ）：
   * {
   *   0: { 1: [[0,0], [-1,0], [-1,+1], [0,-2], [-1,-2]],  // 0->R 顺时针
   *        3: [[0,0], [+1,0], [+1,+1], [0,-2], [+1,-2]] }  // 0->L 逆时针
   *   1: { 0: [[0,0], [+1,0], [+1,-1], [0,+2], [+1,+2]],  // R->0
   *        2: [[0,0], [+1,0], [+1,-1], [0,+2], [+1,+2]] }  // R->2
   *   ... 以此类推
   * }
   *
   * 注意：不同方块类型有不同的偏移表：
   *   - I 型：5 个测试，偏移量较大（±2 级别）
   *   - JLSTZ 型：5 个测试，偏移量较小（±1 级别）
   *   - O 型：无墙踢（返回 null 或空表）
   */
  const kickTable = getKickData(type);

  /* 5. 无墙踢数据的方块 */
  /* O 型方块旋转后形状不变，不需要墙踢 */
  /* 如果 kickTable 为空，直接返回 null 表示无法旋转（或不需要旋转） */
  if (!kickTable) {
    return null;
  }

  /* 6. 获取特定方向转换的偏移测试序列 */
  /*
   * 关键：必须同时索引 [oldRot] 和 [newRotation]
   *
   * 不同转换方向有不同的偏移序列：
   *   - 0->1（顺时针）和 1->0（逆时针）的偏移虽然值相同但方向相反
   *   - SRS 墙踢表是按 (fromState, toState) 双向存储的
   *
   * 可选链操作符 (?.) 确保即使数据缺失也不会崩溃
   */
  const tests = kickTable[oldRot]?.[newRotation];

  /* 7. 兜底：无偏移数据时尝试原位旋转 */
  /* 理论上所有标准方块都应该有偏移数据，但作为防御性编程保留此逻辑 */
  if (!tests || tests.length === 0) {
    if (!collision(board, rotatedShape, cx, cy)) {
      /* 原位旋转成功（极少发生，但保证健壮性） */
      return { success: true, newRotation, x: cx, y: cy };
    }
    return null;
  }

  /* 8. 按顺序测试每个偏移位置 */
  /*
   * SRS 规定必须按顺序测试，第一个不碰撞的位置即为最终结果
   * 测试顺序通常为：
   *   测试0: 原位 (0, 0)
   *   测试1: 左移一列 (-1, 0)
   *   测试2: 左上对角 (-1, +1)
   *   测试3: 下移两行 (0, -2)
   *   测试4: 左下对角 (-1, -2)
   *
   * 注意：下面遍历使用 for...of 而不是 forEach，
   * 以便找到第一个有效位置后立即 return 退出循环
   */
  for (const [ox, oy] of tests) {
    const offsetX = ox; /* X 轴偏移，正数向右，负数向左 */

    /*
     * Y 轴取反：SRS 标准使用数学坐标系（Y 向上为正），
     * 而游戏棋盘通常使用屏幕坐标系（Y 向下为正）。
     * 因此需要对标准偏移的 Y 值取反。
     *
     * 举例：标准偏移 (0, +1) 在数学坐标中表示向上移动
     *       取反后 (0, -1) 在屏幕坐标中表示向上移动（行号减小）
     *
     * 如果你的 getKickData 返回的数据已经适配了屏幕坐标系，
     * 请将下面这行改为：const offsetY = oy;
     */
    const offsetY = -oy;

    /* 计算新位置并检测碰撞 */
    const newX = cx + offsetX;
    const newY = cy + offsetY;

    if (!collision(board, rotatedShape, newX, newY)) {
      /* 找到有效位置，旋转成功 */
      return {
        success: true,
        newRotation,
        x: newX,
        y: newY,
      };
    }
    /* 当前位置碰撞，继续尝试下一个偏移 */
  }

  /* 9. 所有偏移位置都失败 */
  /* 旋转完全失败，方块保持原位和原旋转状态 */
  return null;
};

export default tryAiKickRotation;
