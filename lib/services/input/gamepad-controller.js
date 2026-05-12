import Base from '@/lib/core';

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

const LEVELS = [
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIX',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
];

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
class GamepadController extends Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} deps - 依赖模块
   */
  constructor(deps) {
    super(deps);

    /**
     * ## 当前激活手柄 Index
     *
     * @type {number | null}
     */
    this.activeGamepadIndex = null;

    /**
     * ## 摇杆死区（避免漂移）
     *
     * @type {number}
     */
    this.DEAD_ZONE = 0.15;

    /**
     * ## 方向触发阈值
     *
     * @type {number}
     */
    this.DPAD_THRESHOLD = 0.5;

    /**
     * ## 按钮防抖状态
     *
     * Key: btnName value: boolean（是否已触发）
     *
     * @type {object}
     */
    this.buttonStates = {};

    /**
     * ## 轴防抖状态（避免连续触发）
     *
     * Key: action
     *
     * @type {object}
     */
    this.axisStates = {};

    /**
     * ## 是否已绑定事件
     *
     * @type {boolean}
     */
    this._eventsBound = false;

    /**
     * ## DPAD 方向按键的冷却时间
     *
     * @type {number}
     */
    this.DPAD_COOLDOWN = 180;

    /**
     * ## DPAD 方向按键上次触发时间
     *
     * @type {number}
     */
    this.lastDpadTime = 0;

    /**
     * ## 当前使用的按钮映射表
     *
     * @type {object}
     */
    this.curBtnMap = STANDARD_BTN_MAP;

    /**
     * ## BETOP DPAD（axis9）状态
     *
     * @type {object}
     */
    this.dpadAxisState = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    /**
     * ## 轴映射（标准 Gamepad）
     *
     * @type {object}
     */
    this.AXIS_MAP = {
      LEFT_STICK_X: 0,
      LEFT_STICK_Y: 1,
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
   *
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  update() {
    this._refreshGamepadState();

    if (!this.activeGamepad) {
      return this;
    }

    this._collectCommands();

    return this;
  }

  /**
   * ## 绑定 Gamepad 连接事件
   *
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  addEventListeners() {
    if (this._eventsBound) {
      return this;
    }

    globalThis.addEventListener('gamepadconnected', this._onConnect);
    globalThis.addEventListener('gamepaddisconnected', this._onDisconnect);

    this._eventsBound = true;

    return this;
  }

  /**
   * ## 销毁事件绑定
   *
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  removeEventListeners() {
    globalThis.removeEventListener('gamepadconnected', this._onConnect);
    globalThis.removeEventListener('gamepaddisconnected', this._onDisconnect);

    this._eventsBound = false;

    return this;
  }

  /**
   * ## 手柄连接
   *
   * - 设置 activeGamepad
   * - 自动识别 BETOP 并切换 mapping
   *
   * @param {object} e - 事件对象
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _onConnect = (e) => {
    const pad = e.gamepad;

    if (this.activeGamepadIndex !== null) {
      return this;
    }

    this.activeGamepadIndex = pad.index;

    this.curBtnMap = this._isBetop(pad.id)
      ? BETOP_20BC_1263_BTN_MAP
      : STANDARD_BTN_MAP;

    this.Game.emit('game:update:gamepad:connected', { connected: true });

    return this;
  };

  /**
   * ## 手柄断开
   *
   * - 清空状态
   *
   * @private
   * @param {object} e - 事件对象
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _onDisconnect = (e) => {
    if (this.activeGamepadIndex !== e.gamepad.index) {
      return this;
    }

    this.activeGamepadIndex = null;
    this.buttonStates = {};
    this.axisStates = {};

    this.Game.emit('game:update:gamepad:connected', {
      connected: false,
    });

    return this;
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
   *
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
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

    return this;
  }

  /**
   * ## 根据游戏当前模式更新按键的响应动作
   *
   * @private
   * @param {string} mode - 游戏模式
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _updateActionMap(mode) {
    switch (mode) {
      case 'difficulty': {
        GAMEPAD_ACTION_MAP.A = 'EASY';
        GAMEPAD_ACTION_MAP.B = 'NORMAL';
        GAMEPAD_ACTION_MAP.Y = 'HARD';
        GAMEPAD_ACTION_MAP.X = 'EXPERT';
        GAMEPAD_ACTION_MAP.BACK = 'BACK';
        break;
      }
      case 'playing': {
        GAMEPAD_ACTION_MAP.A = 'TOGGLE_MUSIC';
        GAMEPAD_ACTION_MAP.B = 'DROP';
        GAMEPAD_ACTION_MAP.X = 'RESTART';
        GAMEPAD_ACTION_MAP.Y = 'TOGGLE_PAUSE';
        break;
      }
    }

    return this;
  }

  /**
   * ## 解析手柄按钮的响应动作名称
   *
   * @private
   * @param {string} action - 按键执行动作名称
   * @param {string} btnName - 按键名称
   * @param {boolean} isDPad - 是否为 DPad 方向键
   * @param {string} mode - 游戏当前模式
   * @param {string} level - 游戏当前等级
   * @param {number} now - 当前时间的时间戳
   * @returns {string} - 返回解析后的按键执行动作名称
   */
  _resolveAction(action, btnName, isDPad, mode, level, now) {
    // 非 DPad 或非 main-menu → 直接返回
    if (!isDPad || mode !== 'main-menu') {
      return action;
    }

    // 防抖，仅在等级选择界面降低按钮的灵敏度
    if (now - this.lastDpadTime < this.DPAD_COOLDOWN) {
      return '';
    }

    this.lastDpadTime = now;

    if (btnName === 'DPAD_UP') {
      return this._getMoveUpAction(mode, level);
    }

    if (btnName === 'DPAD_DOWN') {
      return this._getMoveDownAction(mode, level);
    }

    return action;
  }

  /**
   * ## 处理标准游戏手柄的按钮响应
   *
   * @private
   * @param {object} pad - Gamepad 对象
   * @param {string} mode - 游戏当前模式
   * @param {string} level - 游戏当前级别
   * @param {number} now - 当前时间的时间戳
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _handleStandardButtons(pad, mode, level, now) {
    const isBetop = this._isBetop(pad.id);
    const isBlockedMode = mode === 'replay' || mode === 'game-over';
    const { Game } = this;

    for (const [btnName, action] of Object.entries(GAMEPAD_ACTION_MAP)) {
      const isDPad = btnName.startsWith('DPAD_');

      // 未按下
      if (!this._isPressed(btnName)) {
        continue;
      }

      // BETOP + DPAD 特殊跳过
      if (isBetop && isDPad) {
        continue;
      }

      // 回放 / 结束状态，只允许 START
      if (isBlockedMode && btnName !== 'START') {
        return this;
      }

      // 解析最终 action
      const finalAction = this._resolveAction(
        action,
        btnName,
        isDPad,
        mode,
        level,
        now,
      );

      if (!finalAction) {
        continue;
      }

      this.emit('dispatch:input', {
        device: 'gamepad',
        action: finalAction,
        payload: { Game },
      });
    }

    return this;
  }

  /**
   * ## 收集所有输入
   *
   * - 转换为 Command（通过 dispatchInput）
   *
   * @private
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _collectCommands() {
    const state = this.Store.getState();
    const { mode, level } = state;
    const pad = this.activeGamepad;
    const now = Date.now();

    // 无法获取游戏手柄，则不处理手柄设备的输入响应
    if (!pad) {
      return this;
    }

    this._updateActionMap(mode);

    this._handleStandardButtons(pad, mode, level, now);

    // 回放模式或者游戏结束不处理摇杆和 DPAD
    if (mode === 'replay' || mode === 'game-over') {
      return this;
    }

    // 左摇杆（连续输入 + 防抖）
    const x = this._getAxis(this.AXIS_MAP.LEFT_STICK_X);
    const y = this._getAxis(this.AXIS_MAP.LEFT_STICK_Y);

    this._handleStickMove(x, y);

    // BETOP 特殊处理（DPAD → axis9）
    if (this._isBetop(pad.id)) {
      const dpadVal = pad.axes[9] ?? 0;
      this._handleBetopDpad(dpadVal, state);
    }

    return this;
  }

  /**
   * ## 开始轴动作（触发一次）
   *
   * 仅在未触发时触发 dispatch
   *
   * @param {string} action - 动作名称
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _startAxisAction(action) {
    if (this.axisStates[action]) {
      return this;
    }

    const { Game } = this;

    this.axisStates[action] = true;

    this.emit('dispatch:input', {
      device: 'gamepad',
      action,
      payload: { Game },
    });

    return this;
  }

  /**
   * ## 停止轴动作（重置状态）
   *
   * @param {string} action - 动作名称
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _stopAxisAction(action) {
    this.axisStates[action] = false;

    return this;
  }

  _handleStickUp(y) {
    if (y < -this.DPAD_THRESHOLD) {
      this._startAxisAction('ROTATE');
    } else {
      this._stopAxisAction('ROTATE');
    }

    return this;
  }

  _handleStickDown(y) {
    if (y > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_DOWN');
    } else {
      this._stopAxisAction('MOVE_DOWN');
    }

    return this;
  }

  _handleStickLeft(x) {
    if (x < -this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_LEFT');
    } else {
      this._stopAxisAction('MOVE_LEFT');
    }

    return this;
  }

  _handleStickRight(x) {
    if (x > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_RIGHT');
    } else {
      this._stopAxisAction('MOVE_RIGHT');
    }

    return this;
  }

  /**
   * ## 摇杆移动处理（带防抖）
   *
   * @param {number} x - X轴偏移数值
   * @param {number} y - Y轴偏移数值
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _handleStickMove(x, y) {
    // 上
    this._handleStickUp(y);

    // 下
    this._handleStickDown(y);

    // 左
    this._handleStickLeft(x);

    // 右
    this._handleStickRight(x);

    return this;
  }

  _getMoveUpAction(mode, level) {
    let action;

    if (mode === 'main-menu') {
      level += 1;

      if (level >= 10) {
        level = 10;
      }

      this.Game.emit('game:update:level', { level });
      action = `LEVEL_${LEVELS[level - 1]}`;
    } else {
      action = 'ROTATE';
    }

    return action;
  }

  _getMoveDownAction(mode, level) {
    let action;

    if (mode === 'main-menu') {
      level -= 1;

      if (level <= 1) {
        level = 1;
      }

      this.Game.emit('game:update:level', { level });
      action = `LEVEL_${LEVELS[level - 1]}`;
    } else {
      action = 'MOVE_DOWN';
    }

    return action;
  }

  _handleBetopDpadUp(mode, level, st) {
    const action = this._getMoveUpAction(mode, level);
    const { Game } = this;

    if (!st.up) {
      st.up = true;

      this.emit('dispatch:input', {
        device: 'gamepad',
        action,
        payload: { Game },
      });
    }

    st.down = st.left = st.right = false;

    return this;
  }

  _handleBetopDpadDown(mode, level, st) {
    const action = this._getMoveDownAction(mode, level);
    const { Game } = this;

    if (!st.down) {
      st.down = true;

      this.emit('dispatch:input', {
        device: 'gamepad',
        action,
        payload: { Game },
      });
    }

    st.up = st.left = st.right = false;

    return this;
  }

  _handleBetopDpadLeft(st) {
    const { Game } = this;

    if (!st.left) {
      st.left = true;

      this.emit('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: { Game },
      });
    }

    st.up = st.down = st.right = false;

    return this;
  }

  _handleBetopDpadRight(st) {
    const { Game } = this;

    if (!st.right) {
      st.right = true;

      this.emit('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: { Game },
      });
    }

    st.up = st.down = st.left = false;

    return this;
  }

  /**
   * ## BETOP DPAD（axis9）解析
   *
   * 不同方向对应固定浮点值
   *
   * @param {number} val - 按键的值
   * @param {object} state - 游戏状态信息
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _handleBetopDpad(val, state) {
    const { mode, level } = state;
    const v = val.toFixed(5);
    const st = this.dpadAxisState;

    const now = Date.now();

    // 冷却期内直接跳过，仅在等级选择界面降低按钮的灵敏度
    if (mode === 'main-menu' && now - this.lastDpadTime < this.DPAD_COOLDOWN) {
      return this;
    }

    switch (v) {
      // 上
      case '-1.00000': {
        this._handleBetopDpadUp(mode, level, st);
        this.lastDpadTime = now;
        break;
      }
      // 下
      case '0.14286': {
        this._handleBetopDpadDown(mode, level, st);
        this.lastDpadTime = now;
        break;
      }
      // 左
      case '0.71429': {
        this._handleBetopDpadLeft(st);
        this.lastDpadTime = now;
        break;
      }
      // 右
      case '-0.42857': {
        this._handleBetopDpadRight(st);
        this.lastDpadTime = now;
        break;
      }
      // 松开手柄充值状态
      default: {
        st.up = st.down = st.left = st.right = false;
        break;
      }
    }

    return this;
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
