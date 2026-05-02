import dispatchInput from '../engine/dispatch-input.js';

/**
 * # 手柄按键 → 游戏 Action 映射
 *
 * 逻辑层抽象，不关心具体手柄 index
 */
const GAMEPAD_ACTION_MAP = {
  A: 'TOGGLE_MUSIC',
  B: 'DROP',
  X: 'RESTART',
  Y: 'TOGGLE_PAUSE',
  START: 'CONFIRM',
  BACK: 'QUIT',
  DPAD_LEFT: 'MOVE_LEFT',
  DPAD_RIGHT: 'MOVE_RIGHT',
  DPAD_DOWN: 'MOVE_DOWN',
  DPAD_UP: 'ROTATE',
};

/**
 * # 标准 Gamepad（Xbox / 浏览器标准布局）
 *
 * 参考 W3C Gamepad 标准 mapping
 */
const STANDARD_BTN_MAP = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
};

/**
 * # 北通（BETOP 20bc:1263）自定义映射
 *
 * 注意：
 *
 * - 按键 index 与标准不一致
 * - DPAD 不走 buttons，而走 axis[9]
 */
const BETOP_20BC_1263_BTN_MAP = {
  A: 2,
  B: 1,
  X: 3,
  Y: 0,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
};

/**
 * # GamepadController
 *
 * 职责：
 *
 * - 读取浏览器 Gamepad API
 * - 适配不同手柄（标准 / BETOP）
 * - 处理 dead zone / 防抖
 * - 转换为统一 dispatchInput(action)
 *
 * 特点：
 *
 * - 单 active gamepad（简化管理）
 * - 自动识别 BETOP 并切换 mapping
 * - 支持 axis + button 混合输入
 * - 内建防抖（button + axis）
 */
class GamepadController {
  /**
   * ## 当前激活手柄 Index
   *
   * @type {number | null}
   */
  activeGamepadIndex = null;

  /**
   * ## 摇杆死区（避免漂移）
   *
   * @type {number}
   */
  DEAD_ZONE = 0.15;

  /**
   * ## 方向触发阈值
   *
   * @type {number}
   */
  DPAD_THRESHOLD = 0.5;

  constructor() {
    /** ## 轴映射（标准 Gamepad） */
    this.AXIS_MAP = {
      LEFT_STICK_X: 0,
      LEFT_STICK_Y: 1,
    };

    /** ## 当前使用的按钮映射表 */
    this.curBtnMap = STANDARD_BTN_MAP;

    /**
     * ## 按钮防抖状态
     *
     * Key: btnName value: boolean（是否已触发）
     */
    this.buttonStates = {};

    /**
     * ## 轴防抖状态（避免连续触发）
     *
     * Key: action
     */
    this.axisStates = {};

    /** ## 是否已绑定事件 */
    this._eventsBound = false;

    /** ## BETOP DPAD（axis9）状态 */
    this.dpadAxisState = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
  }

  /**
   * ## 每帧调用
   *
   * 流程：
   *
   * 1. 刷新 Gamepad snapshot
   * 2. 如果存在 active gamepad
   * 3. 收集输入 → dispatch
   */
  update() {
    this._refreshGamepadState();

    if (!this.activeGamepad) {
      return;
    }

    this._collectCommands();
  }

  /** ## 绑定 Gamepad 连接事件 */
  bindEvents() {
    if (this._eventsBound) {
      return;
    }

    globalThis.addEventListener('gamepadconnected', this._onConnect);
    globalThis.addEventListener('gamepaddisconnected', this._onDisconnect);

    this._eventsBound = true;
  }

  /** ## 销毁事件绑定 */
  destroy() {
    globalThis.removeEventListener('gamepadconnected', this._onConnect);
    globalThis.removeEventListener('gamepaddisconnected', this._onDisconnect);

    this._eventsBound = false;
  }

  /**
   * ## 手柄连接
   *
   * - 设置 activeGamepad
   * - 自动识别 BETOP 并切换 mapping
   *
   * @param {object} e - 事件对象
   */
  _onConnect = (e) => {
    const pad = e.gamepad;

    if (this.activeGamepadIndex === null) {
      this.activeGamepadIndex = pad.index;

      this.curBtnMap = this._isBetop(pad.id)
        ? BETOP_20BC_1263_BTN_MAP
        : STANDARD_BTN_MAP;
    }
  };

  /**
   * ## 手柄断开
   *
   * - 清空状态
   *
   * @param {object} e - 事件对象
   */
  _onDisconnect = (e) => {
    if (this.activeGamepadIndex === e.gamepad.index) {
      this.activeGamepadIndex = null;
      this.buttonStates = {};
      this.axisStates = {};
    }
  };

  /**
   * ## 判断是否为 BETOP（北通） 手柄
   *
   * @param {string} id - 手柄 id 字符串
   * @returns {boolean} - 返回判断结果，是北通返回 true，否则返回 false
   */
  _isBetop(id) {
    return id.includes('20bc') && id.includes('1263');
  }

  /**
   * ## 刷新 Gamepad 状态
   *
   * - 必须每帧调用 navigator.getGamepads()
   * - 因为 Gamepad 对象是 snapshot，不是实时引用
   */
  _refreshGamepadState() {
    const pads = navigator.getGamepads?.() || [];

    // 自动选择一个可用手柄
    if (this.activeGamepadIndex === null) {
      const firstPad = Array.from(pads).find(Boolean);

      if (firstPad) {
        this.activeGamepadIndex = firstPad.index;

        this.curBtnMap = this._isBetop(firstPad.id)
          ? BETOP_20BC_1263_BTN_MAP
          : STANDARD_BTN_MAP;
      }
    }

    this.activeGamepad =
      this.activeGamepadIndex === null ? null : pads[this.activeGamepadIndex];
  }

  /**
   * ## 收集所有输入
   *
   * - 转换为 Command（通过 dispatchInput）
   */
  _collectCommands() {
    const pad = this.activeGamepad;

    if (!pad) {
      return;
    }

    // 按钮输入（带防抖）
    for (const [btnName, action] of Object.entries(GAMEPAD_ACTION_MAP)) {
      if (this._isPressed(btnName)) {
        // BETOP 的 DPAD 不走 buttons
        if (this._isBetop(pad.id) && btnName.startsWith('DPAD_')) {
          continue;
        }

        dispatchInput({ device: 'gamepad', action, payload: {} });
      }
    }

    // 左摇杆（连续输入 + 防抖）
    const x = this._getAxis(this.AXIS_MAP.LEFT_STICK_X);
    const y = this._getAxis(this.AXIS_MAP.LEFT_STICK_Y);

    this._handleStickMove(x, y);

    // BETOP 特殊处理（DPAD → axis9）
    if (this._isBetop(pad.id)) {
      const dpadVal = pad.axes[9] ?? 0;
      this._handleBetopDpad(dpadVal);
    }
  }

  /**
   * ## 摇杆移动处理（带防抖）
   *
   * @param {number} x - X轴偏移数值
   * @param {number} y - Y轴偏移数值
   */
  _handleStickMove(x, y) {
    // 上
    if (y < -this.DPAD_THRESHOLD) {
      this._startAxisAction('ROTATE');
    } else {
      this._stopAxisAction('ROTATE');
    }

    // 下
    if (y > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_DOWN');
    } else {
      this._stopAxisAction('MOVE_DOWN');
    }

    // 左
    if (x < -this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_LEFT');
    } else {
      this._stopAxisAction('MOVE_LEFT');
    }

    // 右
    if (x > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_RIGHT');
    } else {
      this._stopAxisAction('MOVE_RIGHT');
    }
  }

  /**
   * ## 开始轴动作（触发一次）
   *
   * 仅在未触发时触发 dispatch
   *
   * @param {string} action - 动作名称
   */
  _startAxisAction(action) {
    if (!this.axisStates[action]) {
      this.axisStates[action] = true;
      dispatchInput({ device: 'gamepad', action, payload: {} });
    }
  }

  /**
   * ## 停止轴动作（重置状态）
   *
   * @param {string} action - 动作名称
   */
  _stopAxisAction(action) {
    this.axisStates[action] = false;
  }

  /**
   * ## BETOP DPAD（axis9）解析
   *
   * 不同方向对应固定浮点值
   *
   * @param {number} val -
   */
  _handleBetopDpad(val) {
    const v = val.toFixed(5);
    const st = this.dpadAxisState;

    switch (v) {
      // 上
      case '-1.00000': {
        if (!st.up) {
          st.up = true;
          dispatchInput({ device: 'gamepad', action: 'ROTATE', payload: {} });
        }
        st.down = st.left = st.right = false;
        break;
      }
      // 下
      case '0.14286': {
        if (!st.down) {
          st.down = true;
          dispatchInput({
            device: 'gamepad',
            action: 'MOVE_DOWN',
            payload: {},
          });
        }
        st.up = st.left = st.right = false;
        break;
      }
      // 左
      case '0.71429': {
        if (!st.left) {
          st.left = true;
          dispatchInput({
            device: 'gamepad',
            action: 'MOVE_LEFT',
            payload: {},
          });
        }
        st.up = st.down = st.right = false;
        break;
      }
      // 右
      case '-0.42857': {
        if (!st.right) {
          st.right = true;
          dispatchInput({
            device: 'gamepad',
            action: 'MOVE_RIGHT',
            payload: {},
          });
        }
        st.up = st.down = st.left = false;
        break;
      }
      // 松开手柄充值状态
      default: {
        st.up = st.down = st.left = st.right = false;
        break;
      }
    }
  }

  /**
   * ## 获取轴值（带 dead zone）
   *
   * @param {number} index - 索引值
   * @returns {number} - 返回获取的轴值
   */
  _getAxis(index) {
    if (!this.activeGamepad) {
      return 0;
    }

    const val = this.activeGamepad.axes[index] ?? 0;

    return Math.abs(val) > this.DEAD_ZONE ? val : 0;
  }

  /**
   * ## 判断按钮是否“刚按下”（防抖）
   *
   * @param {string} btnName - 按钮名称
   * @returns {boolean} - 按钮按下返回 true，否则返回 false
   */
  _isPressed(btnName) {
    const idx = this.curBtnMap[btnName];

    if (idx === undefined || !this.activeGamepad) {
      return false;
    }

    const btn = this.activeGamepad.buttons[idx];

    if (!btn) {
      return false;
    }

    const pressed = btn.value > 0.5;

    if (pressed && !this.buttonStates[btnName]) {
      this.buttonStates[btnName] = true;
      return true;
    }

    if (!pressed) {
      this.buttonStates[btnName] = false;
    }

    return false;
  }
}

export default GamepadController;
