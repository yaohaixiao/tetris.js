import Base from '@/lib/core';
import GAME from '@/lib/game/constants/game.js';

const KEYBOARDS_ACTION_MAP = {
  arrowleft: 'MOVE_LEFT',
  arrowright: 'MOVE_RIGHT',
  arrowdown: 'MOVE_DOWN',
  arrowup: 'ROTATE',
  ' ': 'DROP',

  s: 'SWITCH_CONTROLLER',
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

class KeyboardController extends Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 绑定游戏中键盘操作相关的事件
   *
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  addEventListeners() {
    globalThis.addEventListener('resize', this._onResize);
    document.addEventListener('keydown', this._onKeydown);

    return this;
  }

  /**
   * ## 解除游戏中键盘操作相关的事件绑定
   *
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  removeEventListeners() {
    globalThis.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._onKeydown);

    return this;
  }

  /**
   * ## 判断按键是否被屏蔽
   *
   * @private
   * @param {string} key - 按键名称
   * @returns {boolean} - 按键被屏蔽，返回 true，否则返回 false
   */
  _isBlocked(key) {
    const { Store } = this;
    const action = resolveKeyboardAction(key);
    const mode = Store.getMode();
    const controller = Store.getController();

    /*
     * 按键无效的场景：
     *
     * 1. 无法获取 action 指令名称
     * 2. 回放状态，按了非 enter 键
     * 3. AI 控制时，action 指令不是 SWITCH_CONTROLLER
     */
    return (
      !action ||
      (mode === 'replay' && key !== 'enter') ||
      (controller === 'ai' &&
        mode === 'playing' &&
        !GAME.AI_ALLOWED_ACTIONS.includes(action))
    );
  }

  /**
   * ## resize 事件的功能函数
   *
   * @private
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  _onResize = () => {
    this.emit(`ui:${this.Game.id}:resize`);

    return this;
  };

  /**
   * ## keydown 事件的功能函数
   *
   * @private
   * @param {Event} e - 事件对象
   * @param {string} e.key - 事件名称
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  _onKeydown = (e) => {
    const { Game } = this;
    const key = e.key?.toLowerCase();

    if (!key) {
      return this;
    }

    const action = resolveKeyboardAction(key);

    if (this._isBlocked(key)) {
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

export default KeyboardController;
