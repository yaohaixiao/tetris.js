/**
 * ## 添加水平移动动作
 *
 * 根据位移距离的正负决定向左还是向右移动。
 *
 * @param {string[]} actions - 动作数组（会被修改）
 * @param {number} delta - 位移量（正数向右，负数向左）
 */
const addMoveActions = (actions, delta) => {
  if (delta === 0) return;

  const moveDirection = delta > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT';
  const moveCount = Math.abs(delta);

  for (let i = 0; i < moveCount; i++) {
    actions.push(moveDirection);
  }
};

export default addMoveActions;
