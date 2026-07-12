/**
 * ============================================================
 *
 * # 添加水平移动动作
 *
 * ============================================================
 *
 * 根据位移距离的正负决定移动方向，将对应数量和方向的移动指令追加到动作数组中。 位移量为 0 时直接返回，不添加任何动作。
 *
 * @function addMoveActions
 * @param {string[]} actions - 动作数组（会被直接修改）
 * @param {number} delta - 位移量（正=右移，负=左移，0=不动）
 * @returns {void}
 */
const addMoveActions = (actions, delta) => {
  // 无需移动：delta 为 0 表示目标位置和当前位置在同一列
  if (delta === 0) return;

  // 确定移动方向
  const moveDirection = delta > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT';

  // 按位移量追加移动指令
  const moveCount = Math.abs(delta);

  for (let i = 0; i < moveCount; i++) {
    actions.push(moveDirection);
  }
};

export default addMoveActions;
