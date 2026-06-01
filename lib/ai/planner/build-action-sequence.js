import addRotateActions from '@/lib/ai/utils/add-rotate-actions.js';
import addMoveActions from '@/lib/ai/utils/add-move-actions.js';

/**
 * ## 构建动作序列
 *
 * 按照执行顺序生成动作数组：先旋转，再移动，最后硬降。
 *
 * @param {object} params - 参数对象
 * @param {number} params.rotationCount - 需要旋转的次数（0-3）
 * @param {number} params.targetX - 目标 X 坐标
 * @param {number} params.originalX - 原始 X 坐标
 * @returns {string[]} 动作序列数组
 */
const buildActionSequence = ({ rotationCount, targetX, originalX }) => {
  const actions = [];

  // 1. 添加旋转动作
  addRotateActions(actions, rotationCount);

  // 2. 添加水平移动动作
  addMoveActions(actions, targetX - originalX);

  // 3. 添加硬降动作
  actions.push('DROP');

  return actions;
};

export default buildActionSequence;
