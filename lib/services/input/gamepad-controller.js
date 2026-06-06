import GAME from '@/lib/game/constants/game.js';
import Base from '@/lib/core';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 手柄按键 → 游戏 Action 映射
 *
 * 逻辑层抽象，不关心具体手柄 index。 定义手柄按钮与游戏语义动作的对应关系。 注意：部分按键的动作会根据游戏模式动态变化。
 *
 * @constant
 * @type {Object<string, string>}
 */
const GAMEPAD_ACTION_MAP = {
  // 基础控制按键
  A: 'TOGGLE_MUSIC', // 切换音乐（游戏中）
  B: 'DROP', // 方块直接落底
  X: 'RESTART', // 重新开始游戏
  Y: 'TOGGLE_PAUSE', // 暂停/继续游戏
  START: 'CONFIRM', // 确认操作
  BACK: 'QUIT', // 退出游戏
  RB: 'SWITCH_CONTROLLER', // 切换 AI/HUMAN
  RT: 'HOLD', // 缓存方块
  // 方向键（DPad）
  DPAD_LEFT: 'MOVE_LEFT', // 向左移动
  DPAD_RIGHT: 'MOVE_RIGHT', // 向右移动
  DPAD_DOWN: 'MOVE_DOWN', // 向下加速
  DPAD_UP: 'ROTATE', // 旋转方块
};

/**
 * ## 游戏等级数组
 *
 * 用于将数字等级转换为动作名称。 索引 0 对应 LEVEL_ONE，索引 9 对应 LEVEL_TEN。
 *
 * @constant
 * @type {string[]}
 */
const LEVELS = [
  'ONE', // 第 1 关
  'TWO', // 第 2 关
  'THREE', // 第 3 关
  'FOUR', // 第 4 关
  'FIX', // 第 5 关（注意这里是 FIX 不是 FIVE，可能是拼写约定）
  'SIX', // 第 6 关
  'SEVEN', // 第 7 关
  'EIGHT', // 第 8 关
  'NINE', // 第 9 关
  'TEN', // 第 10 关
];

/**
 * # 标准 Gamepad（Xbox / 浏览器标准布局）
 *
 * 参考 W3C Gamepad 标准 mapping。 定义了标准 Xbox/PS 手柄的按键索引映射。
 *
 * @constant
 * @type {Object<string, number>}
 */
const STANDARD_BTN_MAP = {
  A: 0, // A 键 / 交叉键
  B: 1, // B 键 / 圆圈键
  X: 2, // X 键 / 方块键
  Y: 3, // Y 键 / 三角键
  LB: 4, // 左肩键
  RB: 5, // 右肩键
  LT: 6, // 左扳机
  RT: 7, // 右扳机
  BACK: 8, // 返回键
  START: 9, // 开始键
  DPAD_UP: 12, // 方向键上
  DPAD_DOWN: 13, // 方向键下
  DPAD_LEFT: 14, // 方向键左
  DPAD_RIGHT: 15, // 方向键右
};

/**
 * # 北通（BETOP 20bc:1263）自定义映射
 *
 * 注意：
 *
 * - 按键 index 与标准不一致
 * - DPAD 不走 buttons，而走 axis[9]（摇杆轴的特殊值）
 *
 * @constant
 * @type {Object<string, number>}
 */
const BETOP_20BC_1263_BTN_MAP = {
  A: 2, // A 键映射到索引 2
  B: 1, // B 键映射到索引 1
  X: 3, // X 键映射到索引 3
  Y: 0, // Y 键映射到索引 0
  LB: 4, // 左肩键
  RB: 5, // 右肩键
  LT: 6, // 左扳机
  RT: 7, // 右扳机
  BACK: 8, // 返回键
  START: 9, // 开始键
};

/**
 * # GamepadController（游戏手柄控制器）
 *
 * 负责处理游戏手柄输入，支持多种手柄型号，将手柄操作转换为游戏指令。
 *
 * ## 核心功能
 *
 * - **手柄连接管理**：监听手柄的连接和断开事件
 * - **多手柄适配**：自动识别北通手柄并切换按键映射
 * - **输入处理**：处理按钮、摇杆、方向键等各种输入方式
 * - **防抖机制**：防止按钮连发和摇杆过度灵敏
 * - **模式适配**：根据游戏模式动态调整按键响应动作
 *
 * ## 设计说明
 *
 * - **单手柄模式**：简化管理，每次只激活一个手柄
 * - **自动识别**：通过手柄 ID 判断型号并切换映射表
 * - **摇杆死区**：设置死区阈值避免摇杆漂移引起的误触
 * - **状态防抖**：按钮和摇杆都有防抖状态，避免重复触发
 *
 * ## 支持的手柄
 *
 * 1. **标准手柄**：Xbox、PS 等符合 W3C 标准的手柄
 * 2. **北通手柄**：型号 20bc:1263 的自定义映射适配
 *
 * @augments Base
 * @class GamepadController
 */
class GamepadController extends Base {
  /**
   * ## 构造函数
   *
   * 初始化手柄控制器的所有内部状态。
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  initialize() {
    /**
     * ## 当前激活手柄 Index
     *
     * 记录当前正在使用的手柄索引。 null 表示没有任何手柄连接或激活。
     *
     * @type {number | null}
     */
    this.activeGamepadIndex = null;

    /**
     * ## 摇杆死区（避免漂移）
     *
     * 当摇杆值小于此阈值时视为 0（不触发移动）。 防止手柄漂移导致的自动移动。
     *
     * @type {number}
     */
    this.DEAD_ZONE = 0.15;

    /**
     * ## 方向触发阈值
     *
     * 摇杆超过此阈值时触发方向移动。 用于区分轻微移动和有意移动。
     *
     * @type {number}
     */
    this.DPAD_THRESHOLD = 0.5;

    /**
     * ## 按钮防抖状态
     *
     * Key: 按钮名称（如 'A', 'B'） Value: boolean - 是否已经触发过
     *
     * 用于防止按钮长按时重复触发指令。
     *
     * @type {Object<string, boolean>}
     */
    this.buttonStates = {};

    /**
     * ## 轴防抖状态（避免连续触发）
     *
     * Key: 动作名称（如 'MOVE_LEFT'） Value: boolean - 是否正在触发中
     *
     * 用于摇杆连续移动时的防抖控制。
     *
     * @type {Object<string, boolean>}
     */
    this.axisStates = {};

    /**
     * ## 是否已绑定事件
     *
     * 标记是否已经添加了游戏手柄连接/断开的事件监听。 避免重复绑定。
     *
     * @type {boolean}
     */
    this._eventsBound = false;

    /**
     * ## DPAD 方向按键的冷却时间（毫秒）
     *
     * 在菜单界面使用时，限制方向键的响应频率。 避免快速滚动菜单时选项跳跃过快。
     *
     * @type {number}
     */
    this.DPAD_COOLDOWN = 180;

    /**
     * ## DPAD 方向按键上次触发时间
     *
     * 用于计算冷却时间是否已过。
     *
     * @type {number}
     */
    this.lastDpadTime = 0;

    /**
     * ## 当前使用的按钮映射表
     *
     * 根据手柄型号动态切换（标准映射或北通映射）。
     *
     * @type {Object<string, number>}
     */
    this.curBtnMap = STANDARD_BTN_MAP;

    /**
     * ## BETOP DPAD（axis9）状态
     *
     * 北通手柄的方向键通过 axis[9] 的值来表示。 记录当前各个方向的状态，避免重复触发。
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
     * ## 轴映射（标准 Gamepad）
     *
     * 定义左摇杆 X/Y 轴在 axes 数组中的索引位置。
     *
     * @type {Object<string, number>}
     */
    this.AXIS_MAP = {
      LEFT_STICK_X: 0, // 左摇杆 X 轴
      LEFT_STICK_Y: 1, // 左摇杆 Y 轴
    };
  }

  /**
   * ## 每帧调用
   *
   * 执行流程：
   *
   * 1. 刷新 Gamepad snapshot（获取最新的手柄状态）
   * 2. 如果存在 active gamepad
   * 3. 收集所有输入并派发指令
   *
   * @param {number} now - 当前时间的时间戳（毫秒）
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  update(now) {
    const { Store, Player } = this;

    // 获取最新的手柄状态快照
    this._refreshGamepadState();

    // 对战模式，AI 玩家不响应按键
    if (Store.getMode() === 'playing' && Player.name === 'ai') {
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
   * ## 绑定 Gamepad 连接事件
   *
   * 注册游戏手柄的连接和断开事件监听器。 支持链式调用，可多次调用但只会绑定一次。
   *
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  addEventListeners() {
    // 避免重复绑定事件
    if (this._eventsBound) {
      return this;
    }

    // 监听手柄连接事件
    globalThis.addEventListener('gamepadconnected', this._onConnect);
    // 监听手柄断开事件
    globalThis.addEventListener('gamepaddisconnected', this._onDisconnect);

    this._eventsBound = true;

    return this;
  }

  /**
   * ## 销毁事件绑定
   *
   * 移除手柄事件的监听器，清理内部状态。 在组件卸载或不需要手柄控制时调用。
   *
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  removeEventListeners() {
    // 移除事件监听器
    globalThis.removeEventListener('gamepadconnected', this._onConnect);
    globalThis.removeEventListener('gamepaddisconnected', this._onDisconnect);

    this._eventsBound = false;

    return this;
  }

  /**
   * ## 手柄连接事件处理
   *
   * - 设置 activeGamepad 为当前连接的手柄
   * - 自动识别 BETOP 并切换 mapping
   * - 发送手柄连接状态更新事件
   *
   * @private
   * @param {object} e - 事件对象
   * @param {Gamepad} e.gamepad - 连接的手柄对象
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _onConnect = (e) => {
    const pad = e.gamepad;

    // 已经有激活的手柄，忽略新连接的手柄（单手柄模式）
    if (this.activeGamepadIndex !== null) {
      return this;
    }

    // 记录激活的手柄索引
    this.activeGamepadIndex = pad.index;

    // 根据手柄 ID 选择合适的按键映射表
    this.curBtnMap = this._isBetop(pad.id)
      ? BETOP_20BC_1263_BTN_MAP
      : STANDARD_BTN_MAP;

    const { Game } = this;
    const events = GameEvents(Game.id);

    // 发送手柄连接状态更新事件
    this.emit(events.UPDATE_GAMEPAD_CONNECTED, {
      connected: true,
    });

    return this;
  };

  /**
   * ## 手柄断开事件处理
   *
   * - 清空激活手柄的状态
   * - 重置所有防抖状态
   *
   * @private
   * @param {object} e - 事件对象
   * @param {Gamepad} e.gamepad - 断开的手柄对象
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _onDisconnect = (e) => {
    // 只处理当前激活的手柄断开的情况
    if (this.activeGamepadIndex !== e.gamepad.index) {
      return this;
    }

    // 清空激活手柄信息
    this.activeGamepadIndex = null;
    // 重置所有防抖状态
    this.buttonStates = {};
    this.axisStates = {};

    const { Game } = this;
    const events = GameEvents(Game.id);

    // 发送手柄断开状态更新事件
    this.emit(events.UPDATE_GAMEPAD_CONNECTED, {
      connected: false,
    });

    return this;
  };

  /**
   * ## 判断是否为 BETOP（北通）手柄
   *
   * 通过手柄 ID 字符串进行识别。 北通特定型号 20bc:1263 需要特殊处理。
   *
   * @param {string} id - 手柄 id 字符串（如 'Xbox 360 Controller'）
   * @returns {boolean} - 是北通手柄返回 true，否则返回 false
   */
  _isBetop(id) {
    return id.includes('20bc') && id.includes('1263');
  }

  /**
   * ## 刷新 Gamepad 状态
   *
   * - 必须每帧调用 navigator.getGamepads()
   * - 因为 Gamepad 对象是 snapshot，不是实时引用
   * - 如果没有激活手柄，自动选择第一个可用的手柄
   *
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _refreshGamepadState() {
    // 获取所有已连接的手柄快照
    const pads = navigator.getGamepads?.() || [];

    // 自动选择一个可用手柄（如果没有激活的手柄）
    if (this.activeGamepadIndex === null) {
      const firstPad = Array.from(pads).find(Boolean);

      if (firstPad) {
        this.activeGamepadIndex = firstPad.index;
        // 设置对应的按键映射表
        this.curBtnMap = this._isBetop(firstPad.id)
          ? BETOP_20BC_1263_BTN_MAP
          : STANDARD_BTN_MAP;
      }
    }

    // 更新当前激活的手柄对象引用
    this.activeGamepad =
      this.activeGamepadIndex === null ? null : pads[this.activeGamepadIndex];

    return this;
  }

  /**
   * ## 根据游戏当前模式更新按键的响应动作
   *
   * 不同游戏模式下，同一个手柄按键可以有不同的功能。 例如：在难度选择界面，ABXY 键用于选择难度。
   *
   * @private
   * @param {string} mode - 游戏模式（playing、replay、main-menu、difficulty 等）
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _updateActionMap(mode) {
    switch (mode) {
      case 'difficulty': {
        // 难度选择界面：ABXY 映射到难度等级
        GAMEPAD_ACTION_MAP.A = 'EASY'; // 简单
        GAMEPAD_ACTION_MAP.B = 'NORMAL'; // 普通
        GAMEPAD_ACTION_MAP.Y = 'HARD'; // 困难
        GAMEPAD_ACTION_MAP.X = 'EXPERT'; // 专家
        GAMEPAD_ACTION_MAP.BACK = 'BACK'; // 返回
        break;
      }
      case 'playing': {
        // 游戏中：标准游戏操作
        GAMEPAD_ACTION_MAP.A = 'TOGGLE_MUSIC'; // 切换音乐
        GAMEPAD_ACTION_MAP.B = 'DROP'; // 掉落
        GAMEPAD_ACTION_MAP.X = 'RESTART'; // 重开
        GAMEPAD_ACTION_MAP.Y = 'TOGGLE_PAUSE'; // 暂停
        GAMEPAD_ACTION_MAP.BACK = 'QUIT'; // 退出
        break;
      }
      // 其他模式保持默认映射
    }

    return this;
  }

  /**
   * ## 解析手柄按钮的响应动作名称
   *
   * 根据游戏模式、当前等级等信息，确定按钮按下后应该触发的具体动作。 特别处理主菜单下的方向键（用于选择关卡）。
   *
   * @private
   * @param {string} action - 原始按键执行动作名称
   * @param {string} btnName - 按钮名称（如 'DPAD_UP'）
   * @param {boolean} isDPad - 是否为 DPad 方向键
   * @param {string} mode - 游戏当前模式
   * @param {string} level - 游戏当前等级（1-10）
   * @param {number} now - 当前时间的时间戳（毫秒）
   * @returns {string} - 解析后的按键执行动作名称，空字符串表示不触发动作
   */
  _resolveAction(action, btnName, isDPad, mode, level, now) {
    // 非 DPad 或非主菜单模式 → 直接返回原始动作
    if (!isDPad || mode !== 'main-menu') {
      return action;
    }

    // 防抖：仅在等级选择界面降低按钮的灵敏度，避免快速按下时跳跃多个等级
    if (now - this.lastDpadTime < this.DPAD_COOLDOWN) {
      return '';
    }

    this.lastDpadTime = now;

    // 方向键上：增加关卡等级
    if (btnName === 'DPAD_UP') {
      return this._getMoveUpAction(mode, level);
    }

    // 方向键下：降低关卡等级
    if (btnName === 'DPAD_DOWN') {
      return this._getMoveDownAction(mode, level);
    }

    return action;
  }

  /**
   * ## 处理标准游戏手柄的按钮响应
   *
   * 遍历所有按钮映射，检查哪些按钮被按下，并派发相应的指令。
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
    const { Game, Store } = this;
    const controller = Store.getController();

    // 遍历所有按钮映射
    for (const [btnName, action] of Object.entries(GAMEPAD_ACTION_MAP)) {
      /*
       * 按键无效的场景（屏蔽条件）：
       *
       * 1. 无法获取 action 指令名称
       * 2. 回放或游戏结束状态，按了非 START 键（只有确认键可用）
       * 3. AI 控制时，按了 AI 不允许的操作（只能按切换控制器键）
       */
      const isBlocked =
        !action ||
        ((mode === 'replay' || mode === 'game-over') && btnName !== 'START') ||
        (controller === 'ai' &&
          mode === 'playing' &&
          !GAME.AI_ALLOWED_ACTIONS.includes(action)) ||
        (Game.isVersus() && btnName === 'X');
      const isDPad = btnName.startsWith('DPAD_');

      // 按钮未被按下，跳过
      if (!this._isPressed(btnName)) {
        continue;
      }

      // BETOP 手柄的 DPad 特殊处理（通过轴读取），跳过按钮方式
      if (isBetop && isDPad) {
        continue;
      }

      // 屏蔽的按键，不处理
      if (isBlocked) {
        return this;
      }

      // 解析最终的 action（考虑主菜单等级选择等场景）
      const finalAction = this._resolveAction(
        action,
        btnName,
        isDPad,
        mode,
        level,
        now,
      );

      // 解析后没有有效的 action，跳过
      if (!finalAction) {
        continue;
      }

      // 派发输入事件
      this.emit(`dispatch:input`, {
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
   * 处理按钮、摇杆、方向键等所有输入源。 转换为统一的 dispatchInput 指令。
   *
   * @private
   * @param {number} now - 当前时间的时间戳（毫秒）
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _collectCommands(now) {
    const { Store } = this;
    const state = Store.getState();
    const { mode, level } = state;
    const pad = this.activeGamepad;

    // 无法获取游戏手柄，则不处理手柄设备的输入响应
    if (!pad) {
      return this;
    }

    // 根据当前游戏模式更新按键映射
    this._updateActionMap(mode);

    // 处理标准按钮输入
    this._handleStandardButtons(pad, mode, level, now);

    // 回放模式或者游戏结束不处理摇杆和 DPAD
    if (mode === 'replay' || mode === 'game-over') {
      return this;
    }

    // 读取左摇杆的 X 和 Y 轴值
    const x = this._getAxis(this.AXIS_MAP.LEFT_STICK_X);
    const y = this._getAxis(this.AXIS_MAP.LEFT_STICK_Y);

    // 处理摇杆移动（连续输入 + 防抖）
    this._handleStickMove(x, y);

    // BETOP 特殊处理（DPAD 通过 axis9 传递）
    if (this._isBetop(pad.id)) {
      const dpadVal = pad.axes[9] ?? 0;
      this._handleBetopDpad(dpadVal, state);
    }

    return this;
  }

  /**
   * ## 开始轴动作（触发一次）
   *
   * 仅在未触发时触发 dispatch，防止重复触发。 用于摇杆移动等连续输入场景。
   *
   * @param {string} action - 动作名称（如 'MOVE_LEFT'）
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _startAxisAction(action) {
    // 该动作已在触发中，跳过
    if (this.axisStates[action]) {
      return this;
    }

    const { Game } = this;

    // 标记为已触发
    this.axisStates[action] = true;

    // 派发输入事件
    this.emit(`dispatch:input`, {
      device: 'gamepad',
      action,
      payload: { Game },
    });

    return this;
  }

  /**
   * ## 停止轴动作（重置状态）
   *
   * 当摇杆回到死区范围内时调用。
   *
   * @param {string} action - 动作名称
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _stopAxisAction(action) {
    this.axisStates[action] = false;
    return this;
  }

  /**
   * ## 处理摇杆向上移动
   *
   * @private
   * @param {number} y - Y轴偏移值（-1 到 1）
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleStickUp(y) {
    if (y < -this.DPAD_THRESHOLD) {
      this._startAxisAction('ROTATE'); // 向上触发旋转
    } else {
      this._stopAxisAction('ROTATE');
    }
    return this;
  }

  /**
   * ## 处理摇杆向下移动
   *
   * @private
   * @param {number} y - Y轴偏移值（-1 到 1）
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleStickDown(y) {
    if (y > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_DOWN'); // 向下触发加速下落
    } else {
      this._stopAxisAction('MOVE_DOWN');
    }
    return this;
  }

  /**
   * ## 处理摇杆向左移动
   *
   * @private
   * @param {number} x - X轴偏移值（-1 到 1）
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleStickLeft(x) {
    if (x < -this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_LEFT'); // 向左触发左移
    } else {
      this._stopAxisAction('MOVE_LEFT');
    }
    return this;
  }

  /**
   * ## 处理摇杆向右移动
   *
   * @private
   * @param {number} x - X轴偏移值（-1 到 1）
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleStickRight(x) {
    if (x > this.DPAD_THRESHOLD) {
      this._startAxisAction('MOVE_RIGHT'); // 向右触发右移
    } else {
      this._stopAxisAction('MOVE_RIGHT');
    }
    return this;
  }

  /**
   * ## 摇杆移动处理（带防抖）
   *
   * 处理左摇杆的四个方向移动，并触发相应的游戏动作。
   *
   * @param {number} x - X轴偏移值（-1 到 1），负值为左，正值为右
   * @param {number} y - Y轴偏移值（-1 到 1），负值为上，正值为下
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _handleStickMove(x, y) {
    // 上方向（旋转）
    this._handleStickUp(y);
    // 下方向（加速下落）
    this._handleStickDown(y);
    // 左方向（左移）
    this._handleStickLeft(x);
    // 右方向（右移）
    this._handleStickRight(x);

    return this;
  }

  /**
   * ## 获取向上移动的动作
   *
   * 在主菜单模式下用于增加关卡等级， 在游戏模式下用于旋转方块。
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前关卡等级
   * @returns {string} - 动作名称
   */
  _getMoveUpAction(mode, level) {
    const { Game } = this;
    const events = GameEvents(Game.id);
    let action;

    if (mode === 'main-menu') {
      // 主菜单：增加关卡等级
      let newLevel = Number(level) + 1;

      // 最高第 10 关
      if (newLevel >= 10) {
        newLevel = 10;
      }

      // 更新等级
      this.emit(events.UPDATE_LEVEL, { level: newLevel });
      action = `LEVEL_${LEVELS[newLevel - 1]}`;
    } else {
      // 游戏中：旋转方块
      action = 'ROTATE';
    }

    return action;
  }

  /**
   * ## 获取向下移动的动作
   *
   * 在主菜单模式下用于减少关卡等级， 在游戏模式下用于加速下落。
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前关卡等级
   * @returns {string} - 动作名称
   */
  _getMoveDownAction(mode, level) {
    let action;
    const { Game } = this;
    const events = GameEvents(Game.id);

    if (mode === 'main-menu') {
      // 主菜单：减少关卡等级
      let newLevel = Number(level) - 1;

      // 最低第 1 关
      if (newLevel <= 1) {
        newLevel = 1;
      }

      // 更新等级
      this.emit(events.UPDATE_LEVEL, { level: newLevel });
      action = `LEVEL_${LEVELS[newLevel - 1]}`;
    } else {
      // 游戏中：加速下落
      action = 'MOVE_DOWN';
    }

    return action;
  }

  /**
   * ## 处理北通手柄方向键上
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前等级
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleBetopDpadUp(mode, level, st) {
    const action = this._getMoveUpAction(mode, level);
    const { Game } = this;

    if (!st.up) {
      st.up = true;
      this.emit(`dispatch:input`, {
        device: 'gamepad',
        action,
        payload: { Game },
      });
    }

    // 其他方向状态重置
    st.down = st.left = st.right = false;

    return this;
  }

  /**
   * ## 处理北通手柄方向键下
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前等级
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleBetopDpadDown(mode, level, st) {
    const action = this._getMoveDownAction(mode, level);
    const { Game } = this;

    if (!st.down) {
      st.down = true;
      this.emit(`dispatch:input`, {
        device: 'gamepad',
        action,
        payload: { Game },
      });
    }

    // 其他方向状态重置
    st.up = st.left = st.right = false;

    return this;
  }

  /**
   * ## 处理北通手柄方向键左
   *
   * @private
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleBetopDpadLeft(st) {
    const { Game } = this;

    if (!st.left) {
      st.left = true;
      this.emit(`dispatch:input`, {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: { Game },
      });
    }

    // 其他方向状态重置
    st.up = st.down = st.right = false;

    return this;
  }

  /**
   * ## 处理北通手柄方向键右
   *
   * @private
   * @param {object} st - 方向键状态对象
   * @returns {GamepadController} - 返回自身，支持链式调用
   */
  _handleBetopDpadRight(st) {
    const { Game } = this;

    if (!st.right) {
      st.right = true;
      this.emit(`dispatch:input`, {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: { Game },
      });
    }

    // 其他方向状态重置
    st.up = st.down = st.left = false;

    return this;
  }

  /**
   * ## BETOP DPAD（axis9）解析
   *
   * 北通手柄的方向键通过 axis[9] 传递，不同方向对应固定浮点值。 根据这些特定值判断用户按下了哪个方向键。
   *
   * @param {number} val - Axis[9] 的原始值
   * @param {object} state - 游戏状态信息（包含 mode 和 level）
   * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
   */
  _handleBetopDpad(val, state) {
    const { mode, level } = state;
    const v = val.toFixed(5); // 保留5位小数进行精确匹配
    const st = this.dpadAxisState;
    const now = Date.now();

    // 冷却期内直接跳过，仅在等级选择界面降低按钮的灵敏度
    if (mode === 'main-menu' && now - this.lastDpadTime < this.DPAD_COOLDOWN) {
      return this;
    }

    switch (v) {
      // 上方向
      case '-1.00000': {
        this._handleBetopDpadUp(mode, level, st);
        this.lastDpadTime = now;
        break;
      }
      // 下方向
      case '0.14286': {
        this._handleBetopDpadDown(mode, level, st);
        this.lastDpadTime = now;
        break;
      }
      // 左方向
      case '0.71429': {
        this._handleBetopDpadLeft(st);
        this.lastDpadTime = now;
        break;
      }
      // 右方向
      case '-0.42857': {
        this._handleBetopDpadRight(st);
        this.lastDpadTime = now;
        break;
      }
      // 松开手柄，重置所有方向状态
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
   * 读取指定轴的数值，并应用死区过滤。 小于死区的值视为 0，避免摇杆漂移。
   *
   * @param {number} index - 轴在 axes 数组中的索引
   * @returns {number} - 经过死区过滤后的轴值（范围 -1 到 1）
   */
  _getAxis(index) {
    // 没有激活的手柄，返回 0
    if (!this.activeGamepad) {
      return 0;
    }

    // 读取轴值，默认为 0
    const val = this.activeGamepad.axes[index] ?? 0;

    // 应用死区：小于死区的值归零
    return Math.abs(val) > this.DEAD_ZONE ? val : 0;
  }

  /**
   * ## 判断按钮是否“刚按下”（防抖）
   *
   * 检测按钮是否刚被按下（边缘触发），而不是持续按下的状态。 配合 buttonStates 实现防抖，防止长按时重复触发。
   *
   * @param {string} btnName - 按钮名称（如 'A'、'START'）
   * @returns {boolean} - 按钮刚被按下返回 true，否则返回 false
   */
  _isPressed(btnName) {
    // 获取按钮在映射表中的索引
    const idx = this.curBtnMap[btnName];

    // 无效索引或没有激活手柄
    if (idx === undefined || !this.activeGamepad) {
      return false;
    }

    const btn = this.activeGamepad.buttons[idx];

    if (!btn) {
      return false;
    }

    // 按钮是否被按下（值大于 0.5）
    const pressed = btn.value > 0.5;

    // 按下且之前未触发 → 触发事件
    if (pressed && !this.buttonStates[btnName]) {
      this.buttonStates[btnName] = true;
      return true;
    }

    // 松开按钮 → 重置状态
    if (!pressed) {
      this.buttonStates[btnName] = false;
    }

    return false;
  }
}

export default GamepadController;
