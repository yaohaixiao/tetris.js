/**
 * # 添加旋转动作
 *
 * 按指定次数向动作数组中追加旋转指令。 旋转次数为 0 时循环不执行，不添加任何动作。
 *
 * @param {string[]} actions - 动作数组（会被直接修改，向其中追加旋转指令）
 * @param {number} count - 旋转次数（0-3 次，每次顺时针旋转 90°）
 * @returns {void}
 */
const addRotateActions = (actions, count) => {
  /*
   * ==================== 追加旋转指令 ====================
   *
   * 循环 count 次，每次向动作数组中追加一个 'ROTATE' 指令
   */
  for (let i = 0; i < count; i++) {
    actions.push('ROTATE');
  }
};

export default addRotateActions;
