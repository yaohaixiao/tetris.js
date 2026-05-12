import Base from '@/lib/core';

const KEYBOARDS_ACTION_MAP = {
  arrowleft: 'MOVE_LEFT',
  arrowright: 'MOVE_RIGHT',
  arrowdown: 'MOVE_DOWN',
  arrowup: 'ROTATE',
  ' ': 'DROP',

  m: 'TOGGLE_MUSIC',
  p: 'TOGGLE_PAUSED',
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

class Keyboard extends Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} deps - 依赖模块
   */
  constructor(deps) {
    super(deps);
  }

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

  /**
   * ## resize 事件的功能函数
   *
   * @private
   * @returns {Keyboard} - 返回 Keyboard 对象，可链式调用
   */
  _onResize = () => {
    this.UI.emit('ui:resize');

    return this;
  };

  /**
   * ## keydown 事件的功能函数
   *
   * @private
   * @param {Event} e - 事件对象
   * @param {string} e.key - 事件名称
   * @returns {Keyboard} - 返回 Keyboard 对象，可链式调用
   */
  _onKeydown = (e) => {
    const { Game, Store } = this;
    const key = e.key.toLowerCase();
    const action = resolveKeyboardAction(key);
    const mode = Store.getMode();

    if (!action || (mode === 'replay' && key !== 'enter')) {
      return this;
    }

    this.emit('dispatch:input', {
      device: 'keyboard',
      action,
      payload: {
        Game,
      },
    });

    return this;
  };
}

export default Keyboard;
