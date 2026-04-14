import move from '../game/move.js';
import rotate from '../game/rotate.js';
import drop from '../game/drop.js';

/**
 * # 处理游戏进行中的方向操控按键
 *
 * 方向键移动/旋转、空格快速下落
 *
 * @function executeDirectionControlCommands
 * @param {string} key - 原始按键名称
 * @returns {void}
 */
const executeDirectionControlCommands = (key) => {
  // 游戏操控映射
  const controls = {
    ArrowLeft: () => move(-1, 0), // 左移
    ArrowRight: () => move(1, 0), // 右移
    ArrowDown: () => move(0, 1), // 下移
    ArrowUp: rotate, // 旋转方块
    ' ': drop, // 空格：直接落地
  };
  const action = controls[key];

  if (action) {
    action();
  }
};

export default executeDirectionControlCommands;
