import onResize from '../input/on-resize.js';
import onKeydown from '../input/on-keydown.js';

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
};

export default bindEvents;
