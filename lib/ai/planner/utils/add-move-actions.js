/**
 * # 添加水平移动动作
 *
 * 根据位移距离的正负决定移动方向，将对应数量和方向的移动指令追加到动作数组中。 位移量为 0 时直接返回，不添加任何动作。
 *
 * @param {string[]} actions - 动作数组（会被直接修改，向其中追加移动指令）
 * @param {number} delta - 位移量（正数表示向右移动，负数表示向左移动，0 表示不移动）
 * @returns {void}
 */
const addMoveActions = (actions, delta) => {
  /*
   * ==================== 无需移动 ====================
   *
   * delta 为 0 表示目标位置和当前位置在同一列，直接返回
   */
  if (delta === 0) return;

  /*
   * ==================== 确定移动方向 ====================
   *
   * delta > 0 表示目标在右侧，使用 MOVE_RIGHT
   * delta < 0 表示目标在左侧，使用 MOVE_LEFT
   */
  const moveDirection = delta > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT';

  /*
   * ==================== 计算移动次数 ====================
   *
   * 取 delta 的绝对值作为需要移动的次数
   */
  const moveCount = Math.abs(delta);

  /*
   * ==================== 追加移动指令 ====================
   *
   * 循环 moveCount 次，向动作数组中追加对应方向的移动指令
   */
  for (let i = 0; i < moveCount; i++) {
    actions.push(moveDirection);
  }
};

export default addMoveActions;
