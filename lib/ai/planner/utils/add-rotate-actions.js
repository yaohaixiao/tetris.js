/**
 * ============================================================
 *
 * # 添加旋转动作
 *
 * ============================================================
 *
 * 按指定次数向动作数组中追加旋转指令。 旋转次数为 0 时循环不执行，不添加任何动作。
 *
 * @function addRotateActions
 * @param {string[]} actions - 动作数组（会被直接修改）
 * @param {number} count - 旋转次数（0-3 次，每次顺时针 90°）
 * @returns {void}
 */
const addRotateActions = (actions, count) => {
  // 按次数追加旋转指令
  for (let i = 0; i < count; i++) {
    actions.push('ROTATE');
  }
};

export default addRotateActions;
