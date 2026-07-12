// 导入游戏常量配置
import GAME from '@/lib/game/constants/game.js';
// 导入基础类
import Base from '@/lib/core';
// 导入游戏事件目录
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * 手柄按键到游戏 Action 的映射表。
 *
 * 逻辑层抽象，不关心具体手柄 index。 定义手柄按钮与游戏语义动作的对应关系。 部分按键的动作会根据游戏模式动态变化。
 *
 * ### 动态映射说明
 *
 * - DPAD_UP（↑）： game-mode / battle-mode 时为 MOVE_UP， playing 时为 ROTATE
 * - BACK 键： game-mode / battle-mode 时为 EXIT， difficulty 时为 BACK， playing 时为 QUIT
 * - ABXY 键： difficulty 时选择难度， playing 时标准游戏操作
 *
 * @constant {Object<string, string>}
 */
const GAMEPAD_ACTION_MAP = {
  // 基础控制按键
  A: 'TOGGLE_MUSIC',
  B: 'DROP',
  X: 'RESTART',
  Y: 'TOGGLE_PAUSE',
  START: 'CONFIRM',
  BACK: 'QUIT',
  RB: 'SWITCH_CONTROLLER',
  RT: 'HOLD',
  // 方向键（DPad）
  DPAD_LEFT: 'MOVE_LEFT',
  DPAD_RIGHT: 'MOVE_RIGHT',
  DPAD_DOWN: 'MOVE_DOWN',
  DPAD_UP: 'ROTATE',
};

/**
 * 游戏等级数组。
 *
 * 用于将数字等级转换为动作名称。 索引 0 对应 LEVEL_ONE，索引 9 对应 LEVEL_TEN。
 *
 * @constant {string[]}
 */
const LEVELS = [
  'ONE', // 第 1 关
  'TWO', // 第 2 关
  'THREE', // 第 3 关
  'FOUR', // 第 4 关
  'FIX', // 第 5 关
  'SIX', // 第 6 关
  'SEVEN', // 第 7 关
  'EIGHT', // 第 8 关
  'NINE', // 第 9 关
  'TEN', // 第 10 关
];

/**
 * 标准 Gamepad（Xbox / 浏览器标准布局）按键索引映射。
 *
 * 参考 W3C Gamepad 标准 mapping。
 *
 * @constant {Object<string, number>}
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
 * 北通（BETOP 20bc:1263）自定义按键索引映射。
 *
 * 注意：
 *
 * - 按键 index 与标准不一致
 * - DPAD 不走 buttons，而走 axis[9]
 *
 * @constant {Object<string, number>}
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
 * ============================================================
 *
 * # 模块：GamepadController 游戏手柄控制器
 *
 * ============================================================
 *
 * 负责处理游戏手柄输入，支持多种手柄型号， 将手柄操作转换为游戏指令。
 *
 * ## 核心功能
 *
 * - 手柄连接管理：监听手柄的连接和断开事件
 * - 多手柄适配：自动识别北通手柄并切换按键映射
 * - 输入处理：处理按钮、摇杆、方向键等各种输入方式
 * - 防抖机制：防止按钮连发和摇杆过度灵敏
 * - 模式适配：根据游戏模式动态调整按键响应动作
 *
 * ## 设计说明
 *
 * - 单手柄模式：简化管理，每次只激活一个手柄
 * - 自动识别：通过手柄 ID 判断型号并切换映射表
 * - 摇杆死区：设置死区阈值避免摇杆漂移引起的误触
 * - 状态防抖：按钮和摇杆都有防抖状态，避免重复触发
 *
 * ## 支持的手柄
 *
 * 1. 标准手柄：Xbox、PS 等符合 W3C 标准的手柄
 * 2. 北通手柄：型号 20bc:1263 的自定义映射适配
 *
 * @augments Base
 * @class GamepadController
 */
class GamepadController extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化手柄控制器内部状态
   *
   * @returns {void}
   */
  initialize() {
    /**
     * 当前激活手柄 Index。
     *
     * Null 表示没有任何手柄连接或激活。
     *
     * @type {number | null}
     */
    this.activeGamepadIndex = null;

    /**
     * 摇杆死区（避免漂移）。
     *
     * 当摇杆值小于此阈值时视为 0。 取值范围建议 0.1 ~ 0.2。
     *
     * @type {number}
     */
    this.DEAD_ZONE = 0.15;

    /**
     * 方向触发阈值。
     *
     * 摇杆超过此阈值时触发方向移动。
     *
     * @type {number}
     */
    this.DPAD_THRESHOLD = 0.5;

    /**
     * 按钮防抖状态。
     *
     * Key: 按钮名称，Value: 是否已经触发过。
     *
     * @type {Object<string, boolean>}
     */
    this.buttonStates = {};

    /**
     * 轴防抖状态（避免连续触发）。
     *
     * Key: 动作名称，Value: 是否正在触发中。
     *
     * @type {Object<string, boolean>}
     */
    this.axisStates = {};

    /**
     * 是否已绑定事件。
     *
     * @type {boolean}
     */
    this._eventsBound = false;

    /**
     * DPAD 方向按键的冷却时间（毫秒）。
     *
     * @type {number}
     */
    this.DPAD_COOLDOWN = 180;

    /**
     * DPAD 方向按键上次触发时间。
     *
     * @type {number}
     */
    this.lastDpadTime = 0;

    /**
     * 当前使用的按钮映射表。
     *
     * 根据手柄型号动态切换。
     *
     * @type {Object<string, number>}
     */
    this.curBtnMap = STANDARD_BTN_MAP;

    /**
     * BETOP DPAD（axis9）状态。
     *
     * @type {Object<string, boolean>}
     */
    this.dpadAxisState = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    /**
     * 轴映射（标准 Gamepad）。
     *
     * Axes[0] = 左摇杆 X 轴，axes[1] = 左摇杆 Y 轴。
     *
     * @type {Object<string, number>}
     */
    this.AXIS_MAP = {
      LEFT_STICK_X: 0,
      LEFT_STICK_Y: 1,
    };

    /**
     * 绑定的手柄索引（对战模式专用）。
     *
     * Null 表示自动选择第一个可用手柄。
     *
     * @type {number | null}
     */
    this.boundGamepadIndex = null;
  }

  /**
   * ## setBoundIndex：设置绑定的手柄索引
   *
   * @param {number} index - 手柄索引
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  setBoundIndex(index) {
    this.boundGamepadIndex = index;
    this.activeGamepadIndex = index;
    return this;
  }

  /**
   * ## update：每帧调用
   *
   * 执行流程：
   *
   * 1. 刷新 Gamepad snapshot
   * 2. 检查模式限制
   * 3. 如果有激活的手柄，收集所有输入并派发指令
   *
   * @param {number} now - 当前时间的时间戳（毫秒）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  update(now) {
    const { Store, Player } = this;
    const mode = Store.getMode();

    this._refreshGamepadState();

    // 对战模式 P2 只在 playing 时响应手柄
    if (
      this.boundGamepadIndex !== null &&
      this.boundGamepadIndex > 0 &&
      mode !== 'playing'
    ) {
      return this;
    }

    // 对战模式 AI 玩家不响应按键
    if (mode === 'playing' && Player.name === 'ai') {
      return this;
    }

    // 没有激活的手柄，直接返回
    if (!this.activeGamepad) {
      return this;
    }

    // 收集并处理所有手柄输入
    this._collectCommands(now);

    return this;
  }

  /**
   * ## addEventListeners：绑定 Gamepad 连接事件
   *
   * 通过 _eventsBound 标记避免重复绑定。
   *
   * @returns {GamepadController} 返回自身，支持链式调用
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
   * ## removeEventListeners：销毁事件绑定
   *
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  removeEventListeners() {
    globalThis.removeEventListener('gamepadconnected', this._onConnect);
    globalThis.removeEventListener('gamepaddisconnected', this._onDisconnect);

    this._eventsBound = false;

    return this;
  }

  /**
   * ## _onConnect：手柄连接事件处理
   *
   * @private
   * @param {object} e - 事件对象
   * @param {Gamepad} e.gamepad - 连接的手柄对象
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _onConnect = (e) => {
    const pad = e.gamepad;

    // 如果绑定了指定索引，只响应绑定手柄的连接
    if (this.boundGamepadIndex !== null) {
      if (pad.index !== this.boundGamepadIndex) {
        return this;
      }

      this.activeGamepadIndex = pad.index;
      this.curBtnMap = this._isBetop(pad.id)
        ? BETOP_20BC_1263_BTN_MAP
        : STANDARD_BTN_MAP;

      const { Game } = this;
      const events = GameEvents(Game.id);
      this.emit(events.UPDATE_GAMEPAD_CONNECTED, { connected: true });
      return this;
    }

    // 单手柄模式：已有激活手柄则忽略
    if (this.activeGamepadIndex !== null) {
      return this;
    }

    this.activeGamepadIndex = pad.index;
    this.curBtnMap = this._isBetop(pad.id)
      ? BETOP_20BC_1263_BTN_MAP
      : STANDARD_BTN_MAP;

    const { Game } = this;
    const events = GameEvents(Game.id);
    this.emit(events.UPDATE_GAMEPAD_CONNECTED, { connected: true });

    return this;
  };

  /**
   * ## _onDisconnect：手柄断开事件处理
   *
   * @private
   * @param {object} e - 事件对象
   * @param {Gamepad} e.gamepad - 断开的手柄对象
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _onDisconnect = (e) => {
    if (this.activeGamepadIndex !== e.gamepad.index) {
      return this;
    }

    this.activeGamepadIndex = null;
    this.buttonStates = {};
    this.axisStates = {};

    const { Game } = this;
    const events = GameEvents(Game.id);
    this.emit(events.UPDATE_GAMEPAD_CONNECTED, { connected: false });

    return this;
  };

  /**
   * ## _isBetop：判断是否为北通手柄
   *
   * @param {string} id - 手柄 id 字符串
   * @returns {boolean} 是北通手柄返回 true
   */
  _isBetop(id) {
    return id.includes('20bc') && id.includes('1263');
  }

  /**
   * ## _refreshGamepadState：刷新 Gamepad 状态
   *
   * 必须每帧调用 navigator.getGamepads()， 因为 Gamepad 对象是 snapshot，不是实时引用。
   *
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _refreshGamepadState() {
    const pads = navigator.getGamepads?.() || [];

    // 如果绑定了指定索引，优先使用绑定索引
    if (this.boundGamepadIndex !== null) {
      this.activeGamepadIndex = this.boundGamepadIndex;
      this.activeGamepad = pads[this.boundGamepadIndex] || null;

      if (this.activeGamepad) {
        this.curBtnMap = this._isBetop(this.activeGamepad.id)
          ? BETOP_20BC_1263_BTN_MAP
          : STANDARD_BTN_MAP;
      }

      return this;
    }

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
   * ## _updateActionMap：根据游戏模式更新按键响应动作
   *
   * @private
   * @param {string} mode - 游戏模式
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _updateActionMap(mode) {
    switch (mode) {
      case 'game-mode':
      case 'exit-game': {
        GAMEPAD_ACTION_MAP.DPAD_UP = 'MOVE_UP';
        break;
      }
      case 'battle-mode': {
        GAMEPAD_ACTION_MAP.DPAD_UP = 'MOVE_UP';
        GAMEPAD_ACTION_MAP.BACK = 'EXIT';
        break;
      }
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
        GAMEPAD_ACTION_MAP.BACK = 'QUIT';
        GAMEPAD_ACTION_MAP.DPAD_UP = 'ROTATE';
        break;
      }
    }

    return this;
  }

  /**
   * ## _resolveAction：解析手柄按钮的响应动作名称
   *
   * 特别处理主菜单下的方向键（带冷却防抖）。
   *
   * @private
   * @param {string} action - 原始动作名称
   * @param {string} btnName - 按钮名称
   * @param {boolean} isDPad - 是否为 DPad 方向键
   * @param {string} mode - 游戏当前模式
   * @param {string} level - 游戏当前等级
   * @param {number} now - 当前时间戳（毫秒）
   * @returns {string} 解析后的动作名称，空字符串表示不触发
   */
  _resolveAction(action, btnName, isDPad, mode, level, now) {
    if (!isDPad || mode !== 'main-menu') {
      return action;
    }

    // 防抖：冷却时间内跳过
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
   * ## _handleStandardButtons：处理标准游戏手柄的按钮响应
   *
   * @private
   * @param {object} pad - Gamepad 对象
   * @param {string} mode - 游戏当前模式
   * @param {string} level - 游戏当前级别
   * @param {number} now - 当前时间戳
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStandardButtons(pad, mode, level, now) {
    const isBetop = this._isBetop(pad.id);
    const { Game, Store } = this;
    const { Player } = Game;
    const controller = Store.getController();

    for (const [btnName, action] of Object.entries(GAMEPAD_ACTION_MAP)) {
      const isBlocked =
        !action ||
        ((mode === 'replay' || mode === 'game-over') &&
          btnName !== 'START' &&
          btnName !== 'BACK') ||
        (controller === 'ai' &&
          mode === 'playing' &&
          !GAME.AI_ALLOWED_ACTIONS.includes(action)) ||
        (Game.isVersus() &&
          (btnName === 'X' ||
            (Player.name === 'ai' && (btnName === 'Y' || btnName === 'RT')) ||
            (Player.name === 'human' && btnName === 'RB')));

      const isDPad = btnName.startsWith('DPAD_');

      if (!this._isPressed(btnName)) {
        continue;
      }

      // BETOP 手柄的 DPad 通过轴读取
      if (isBetop && isDPad) {
        continue;
      }

      if (isBlocked) {
        return this;
      }

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

      const events = GameEvents(Game.id);
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action: finalAction,
        payload: { Game },
      });
    }

    return this;
  }

  /**
   * ## _collectCommands：收集所有输入
   *
   * 处理按钮、摇杆、方向键等所有输入源。
   *
   * @private
   * @param {number} now - 当前时间戳（毫秒）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _collectCommands(now) {
    const { Store } = this;
    const state = Store.getState();
    const { mode, level } = state;
    const pad = this.activeGamepad;

    if (!pad) {
      return this;
    }

    this._updateActionMap(mode);
    this._handleStandardButtons(pad, mode, level, now);

    if (mode === 'replay' || mode === 'game-over') {
      return this;
    }

    const x = this._getAxis(this.AXIS_MAP.LEFT_STICK_X);
    const y = this._getAxis(this.AXIS_MAP.LEFT_STICK_Y);

    this._handleStickMove(x, y);

    // BETOP 特殊处理（DPAD 通过 axis9 传递）
    if (this._isBetop(pad.id)) {
      const dpadVal = pad.axes[9] ?? 0;
      this._handleBetopDpad(dpadVal, state);
    }

    return this;
  }

  /**
   * ## _startAxisAction：开始轴动作
   *
   * 仅在未触发时派发，防止重复触发。
   *
   * @param {string} action - 动作名称
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _startAxisAction(action) {
    if (this.axisStates[action]) {
      return this;
    }

    const { Game } = this;
    this.axisStates[action] = true;

    const events = GameEvents(Game.id);
    this.emit(events.DISPATCH_INPUT, {
      device: 'gamepad',
      action,
      payload: { Game },
    });

    return this;
  }

  /**
   * ## _stopAxisAction：停止轴动作
   *
   * @param {string} action - 动作名称
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _stopAxisAction(action) {
    this.axisStates[action] = false;
    return this;
  }

  /**
   * ## _handleStickUp：处理摇杆向上移动
   *
   * @private
   * @param {number} y - Y 轴偏移值
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickUp(y) {
    if (y < -this.DPAD_THRESHOLD) {
      this._startAxisAction('ROTATE');
    } else {
      this._stopAxisAction('ROTATE');
    }
    return this;
  }

  /**
   * ## _handleStickDown：处理摇杆向下移动
   *
   * @private
   * @param {number} y - Y 轴偏移值
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickDown(y) {
    if (y > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_DOWN');
    } else {
      this._stopAxisAction('MOVE_DOWN');
    }
    return this;
  }

  /**
   * ## _handleStickLeft：处理摇杆向左移动
   *
   * @private
   * @param {number} x - X 轴偏移值
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickLeft(x) {
    if (x < -this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_LEFT');
    } else {
      this._stopAxisAction('MOVE_LEFT');
    }
    return this;
  }

  /**
   * ## _handleStickRight：处理摇杆向右移动
   *
   * @private
   * @param {number} x - X 轴偏移值
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickRight(x) {
    if (x > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_RIGHT');
    } else {
      this._stopAxisAction('MOVE_RIGHT');
    }
    return this;
  }

  /**
   * ## _handleStickMove：摇杆移动处理（带防抖）
   *
   * @param {number} x - X 轴偏移值
   * @param {number} y - Y 轴偏移值
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickMove(x, y) {
    this._handleStickUp(y);
    this._handleStickDown(y);
    this._handleStickLeft(x);
    this._handleStickRight(x);

    return this;
  }

  /**
   * ## _getMoveUpAction：获取向上移动的动作
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前关卡等级
   * @returns {string} 动作名称
   */
  _getMoveUpAction(mode, level) {
    const { Game } = this;
    const events = GameEvents(Game.id);
    let action;

    if (mode === 'main-menu') {
      let newLevel = Number(level) + 1;
      if (newLevel >= 10) {
        newLevel = 10;
      }
      this.emit(events.UPDATE_LEVEL, { level: newLevel });
      action = `LEVEL_${LEVELS[newLevel - 1]}`;
    } else {
      action = 'ROTATE';
    }

    return action;
  }

  /**
   * ## _getMoveDownAction：获取向下移动的动作
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前关卡等级
   * @returns {string} 动作名称
   */
  _getMoveDownAction(mode, level) {
    let action;
    const { Game } = this;
    const events = GameEvents(Game.id);

    if (mode === 'main-menu') {
      let newLevel = Number(level) - 1;
      if (newLevel <= 1) {
        newLevel = 1;
      }
      this.emit(events.UPDATE_LEVEL, { level: newLevel });
      action = `LEVEL_${LEVELS[newLevel - 1]}`;
    } else {
      action = 'MOVE_DOWN';
    }

    return action;
  }

  /**
   * ## _handleBetopDpadUp：处理北通手柄方向键上
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前等级
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadUp(mode, level, st) {
    const action = this._getMoveUpAction(mode, level);
    const { Game } = this;

    if (!st.up) {
      const events = GameEvents(Game.id);
      st.up = true;
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action,
        payload: { Game },
      });
    }

    st.down = st.left = st.right = false;
    return this;
  }

  /**
   * ## _handleBetopDpadDown：处理北通手柄方向键下
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前等级
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadDown(mode, level, st) {
    const action = this._getMoveDownAction(mode, level);
    const { Game } = this;

    if (!st.down) {
      const events = GameEvents(Game.id);
      st.down = true;
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action,
        payload: { Game },
      });
    }

    st.up = st.left = st.right = false;
    return this;
  }

  /**
   * ## _handleBetopDpadLeft：处理北通手柄方向键左
   *
   * @private
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadLeft(st) {
    const { Game } = this;

    if (!st.left) {
      const events = GameEvents(Game.id);
      st.left = true;
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: { Game },
      });
    }

    st.up = st.down = st.right = false;
    return this;
  }

  /**
   * ## _handleBetopDpadRight：处理北通手柄方向键右
   *
   * @private
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadRight(st) {
    const { Game } = this;

    if (!st.right) {
      const events = GameEvents(Game.id);
      st.right = true;
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: { Game },
      });
    }

    st.up = st.down = st.left = false;
    return this;
  }

  /**
   * ## _handleBetopDpad：BETOP DPAD（axis9）解析
   *
   * 北通手柄的方向键通过 axis[9] 传递， 不同方向对应固定浮点值。
   *
   * | 方向 | axis[9] 值 | 说明             |
   * | :--- | :--------- | :--------------- |
   * | 上   | -1.00000   | 方向键上被按下   |
   * | 下   | 0.14286    | 方向键下被按下   |
   * | 左   | 0.71429    | 方向键左被按下   |
   * | 右   | -0.42857   | 方向键右被按下   |
   * | 松开 | 其他值     | 没有方向键被按下 |
   *
   * @param {number} val - Axis[9] 的原始值
   * @param {object} state - 游戏状态信息
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpad(val, state) {
    const { mode, level } = state;
    const v = val.toFixed(5);
    const st = this.dpadAxisState;
    const now = Date.now();

    // 冷却期内直接跳过
    if (mode === 'main-menu' && now - this.lastDpadTime < this.DPAD_COOLDOWN) {
      return this;
    }

    switch (v) {
      case '-1.00000': {
        this._handleBetopDpadUp(mode, level, st);
        this.lastDpadTime = now;
        break;
      }
      case '0.14286': {
        this._handleBetopDpadDown(mode, level, st);
        this.lastDpadTime = now;
        break;
      }
      case '0.71429': {
        this._handleBetopDpadLeft(st);
        this.lastDpadTime = now;
        break;
      }
      case '-0.42857': {
        this._handleBetopDpadRight(st);
        this.lastDpadTime = now;
        break;
      }
      default: {
        st.up = st.down = st.left = st.right = false;
        break;
      }
    }

    return this;
  }

  /**
   * ## _getAxis：获取轴值（带 dead zone）
   *
   * 小于死区的值视为 0，避免摇杆漂移导致的误操作。
   *
   * @param {number} index - 轴在 axes 数组中的索引
   * @returns {number} 经过死区过滤后的轴值
   */
  _getAxis(index) {
    if (!this.activeGamepad) {
      return 0;
    }

    const val = this.activeGamepad.axes[index] ?? 0;
    return Math.abs(val) > this.DEAD_ZONE ? val : 0;
  }

  /**
   * ## _isPressed：判断按钮是否"刚按下"（防抖）
   *
   * 检测按钮是否刚被按下（边缘触发）， 配合 buttonStates 实现防抖，防止长按时重复触发。
   *
   * @param {string} btnName - 按钮名称
   * @returns {boolean} 按钮刚被按下返回 true
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
