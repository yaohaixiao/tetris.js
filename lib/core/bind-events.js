import onResize from '../events/on-resize.js';
import onKeydown from '../events/on-keydown.js';
import onKeyup from '../events/on-keyup.js';

/**
 * # 绑定游戏全局事件
 *
 * 窗口大小自适应、键盘按下、键盘松开事件
 *
 * @function bindEvents
 * @returns {void}
 */
const bindEvents = () => {
  // 窗口大小变化时自适应画布
  globalThis.addEventListener('resize', onResize);

  // 监听键盘按下事件，处理所有游戏操作
  document.addEventListener('keydown', onKeydown);

  // 监听键盘松开事件，用于取消 P 键长按计时
  document.addEventListener('keyup', onKeyup);
};

export default bindEvents;
