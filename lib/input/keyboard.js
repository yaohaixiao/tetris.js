import Engine from '@/lib/engine';
import dispatchInput from '@/lib/engine/dispatch-input.js';

const KEYBOARDS_ACTION_MAP = {
  arrowleft: 'MOVE_LEFT',
  arrowright: 'MOVE_RIGHT',
  arrowdown: 'MOVE_DOWN',
  arrowup: 'ROTATE',
  ' ': 'DROP',

  m: 'TOGGLE_MUSIC',
  p: 'TOGGLE_PAUSE',
  r: 'RESTART',
  q: 'QUIT',

  1: 'LEVEL_ONE',
  2: 'LEVEL_TWO',
  3: 'LEVEL_THREE',
  4: 'LEVEL_FOUR',
  5: 'LEVEL_FIVE',
  6: 'LEVEL_SIX',
  7: 'LEVEL_SEVEN',
  8: 'LEVEL_EIGHT',
  9: 'LEVEL_NINE',
  t: 'LEVEL_TEN',

  enter: 'CONFIRM',
};

/**
 * # 将键盘输入映射为游戏动作
 *
 * @function resolveKeyboardAction
 * @param {string} key - KeyboardEvent.key
 * @returns {string | void} 对应游戏动作
 */
const resolveKeyboardAction = (key) => {
  if (!key) {
    return;
  }

  const normalizedKey = key.toLowerCase();

  // 处理方向键等浏览器标准 key
  return KEYBOARDS_ACTION_MAP[normalizedKey];
};

/**
 * # 游戏主键盘事件处理器（统一分发所有按键操作）
 *
 * 根据当前游戏状态，分发到对应逻辑：等级选择、游戏结束、全局快捷键、游戏操控
 *
 * @function onKeydown
 * @param {KeyboardEvent} e - 键盘事件对象
 * @returns {void}
 */
const onKeydown = (e) => {
  const key = e.key.toLowerCase();
  const action = resolveKeyboardAction(key);

  if (!action) {
    return;
  }

  dispatchInput({
    device: 'keyboard',
    action,
    payload: {},
  });
};

/**
 * # 窗口变化大小时
 *
 * 根据新的窗口大小，重新游戏绘制界面
 *
 * @function onResize
 * @returns {void}
 */
const onResize = () => {
  Engine.resize();
};

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

const destroy = () => {
  // 窗口大小变化时自适应画布
  globalThis.removeEventListener('resize', onResize);

  // 监听键盘按下事件，处理所有游戏操作
  document.removeEventListener('keydown', onKeydown);
};

const Keyboard = {
  bindEvents,
  destroy,
};

export default Keyboard;
