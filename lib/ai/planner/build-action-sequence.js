import addRotateActions from '@/lib/ai/planner/utils/add-rotate-actions.js';
import addMoveActions from '@/lib/ai/planner/utils/add-move-actions.js';

/**
 * ============================================================
 *
 * # 构建动作序列
 *
 * ============================================================
 *
 * 按照标准执行顺序生成俄罗斯方块的动作数组： 先旋转调整朝向，再水平移动到目标列，最后执行硬降。
 *
 * ## 执行顺序
 *
 * 1. 旋转动作 — 将方块旋转到指定朝向
 * 2. 水平移动 — 将方块移动到目标 X 坐标
 * 3. 硬降 — 将方块直接落到底部
 *
 * @function buildActionSequence
 * @param {object} params - 参数对象
 * @param {number} params.rotationCount - 需要旋转的次数（0-3）
 * @param {number} params.targetX - 目标 X 坐标
 * @param {number} params.originalX - 原始 X 坐标
 * @returns {string[]} 动作序列数组，如 ['ROTATE', 'MOVE_LEFT', 'DROP']
 */
const buildActionSequence = ({ rotationCount, targetX, originalX }) => {
  const actions = [];

  // 步骤 1：添加旋转动作
  addRotateActions(actions, rotationCount);

  // 步骤 2：添加水平移动动作
  addMoveActions(actions, targetX - originalX);

  // 步骤 3：添加硬降动作
  actions.push('DROP');

  return actions;
};

export default buildActionSequence;
