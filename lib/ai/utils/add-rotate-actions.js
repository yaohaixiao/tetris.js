/**
 * ## 添加旋转动作
 *
 * @param {string[]} actions - 动作数组（会被修改）
 * @param {number} count - 旋转次数
 */
const addRotateActions = (actions, count) => {
  for (let i = 0; i < count; i++) {
    actions.push('ROTATE');
  }
};

export default addRotateActions;
