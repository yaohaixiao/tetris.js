import EventBus from '@/lib/core/event-bus';

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

  e: 'EASY',
  n: 'NORMAL',
  h: 'HARD',
  x: 'EXPERT',

  b: 'BACK',
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

class Keyboard {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} state - 游戏状态信息
   */
  constructor(state) {
    this.state = state;
  }

  /**
   * ## resize 事件的功能函数
   *
   * @private
   * @returns {Keyboard} - 返回 Keyboard 对象，可链式调用
   */
  _onResize = () => {
    EventBus.emit('resize');

    return this;
  };

  /**
   * ## keydown 事件的功能函数
   *
   * @private
   * @param {Event} e - 事件对象
   * @returns {Keyboard} - 返回 Keyboard 对象，可链式调用
   */
  _onKeydown = (e) => {
    const key = e.key.toLowerCase();
    const action = resolveKeyboardAction(key);
    const { mode } = this.state;

    if (!action || (mode === 'replay' && key !== 'enter')) {
      return this;
    }

    EventBus.emit('dispatch:input', {
      device: 'keyboard',
      action,
      payload: {},
    });

    return this;
  };

  /**
   * ## 绑定游戏中键盘操作相关的事件
   *
   * @returns {Keyboard} - 返回 Keyboard 对象，可链式调用
   */
  addEventListeners() {
    globalThis.addEventListener('resize', this._onResize);
    document.addEventListener('keydown', this._onKeydown);

    return this;
  }

  /**
   * ## 解除游戏中键盘操作相关的事件绑定
   *
   * @returns {Keyboard} - 返回 Keyboard 对象，可链式调用
   */
  removeEventListeners() {
    globalThis.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._onKeydown);

    return this;
  }
}

export default Keyboard;
