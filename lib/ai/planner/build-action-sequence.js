import addRotateActions from '@/lib/ai/utils/add-rotate-actions.js';
import addMoveActions from '@/lib/ai/utils/add-move-actions.js';

/**
 * # 构建动作序列
 *
 * 按照标准执行顺序生成俄罗斯方块的动作数组：先旋转调整朝向，再水平移动到目标列，最后执行硬降。
 *
 * ## 执行顺序
 *
 * 1. 旋转动作 — 将方块旋转到指定朝向
 * 2. 水平移动 — 将方块移动到目标 X 坐标
 * 3. 硬降 — 将方块直接落到底部
 *
 * @param {object} params - 参数对象
 * @param {number} params.rotationCount - 需要旋转的次数（0-3 次，每次顺时针旋转 90°）
 * @param {number} params.targetX - 目标 X 坐标（方块最终所在的列索引）
 * @param {number} params.originalX - 原始 X 坐标（方块当前的列索引）
 * @returns {string[]} 动作序列数组，如 ['ROTATE', 'ROTATE', 'MOVE_LEFT', 'DROP']
 */
const buildActionSequence = ({ rotationCount, targetX, originalX }) => {
  const actions = [];

  /*
   * ==================== 添加旋转动作 ====================
   *
   * 根据 rotationCount 向动作序列中添加对应次数的旋转指令
   */
  addRotateActions(actions, rotationCount);

  /*
   * ==================== 添加水平移动动作 ====================
   *
   * 根据目标坐标与原始坐标的差值，生成对应方向的水平移动指令
   * targetX - originalX > 0 表示向右移动，< 0 表示向左移动
   */
  addMoveActions(actions, targetX - originalX);

  /*
   * ==================== 添加硬降动作 ====================
   *
   * 所有旋转和移动完成后，执行硬降将方块直接落到底部
   */
  actions.push('DROP');

  return actions;
};

export default buildActionSequence;
