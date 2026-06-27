// 导入游戏常量配置
import GAME from '@/lib/game/constants/game.js';
// 导入基础类
import Base from '@/lib/core';
// 导入游戏事件目录
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 手柄按键 → 游戏 Action 映射
 *
 * 逻辑层抽象，不关心具体手柄 index。 定义手柄按钮与游戏语义动作的对应关系。 注意：部分按键的动作会根据游戏模式动态变化。
 *
 * ### 动态映射说明
 *
 * - **DPAD_UP（↑）**：
 *
 *   - `game-mode` / `battle-mode`：向上移动选择光标（MOVE_UP）
 *   - `playing`：旋转方块（ROTATE）
 * - **BACK 键**：
 *
 *   - `game-mode` / `battle-mode`：退出（EXIT）
 *   - `difficulty`：返回（BACK）
 *   - `playing`：退出游戏（QUIT）
 * - **ABXY 键**：
 *
 *   - `difficulty`：选择难度（EASY/NORMAL/HARD/EXPERT）
 *   - `playing`：标准游戏操作
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
  RB: 'SWITCH_CONTROLLER', // 切换 AI/HUMAN 控制器
  RT: 'HOLD', // 缓存方块
  // 方向键（DPad）
  DPAD_LEFT: 'MOVE_LEFT', // 向左移动
  DPAD_RIGHT: 'MOVE_RIGHT', // 向右移动
  DPAD_DOWN: 'MOVE_DOWN', // 向下加速
  DPAD_UP: 'ROTATE', // 旋转方块（或在菜单中向上移动光标）
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
  A: 0, // A 键 / 交叉键 → buttons[0]
  B: 1, // B 键 / 圆圈键 → buttons[1]
  X: 2, // X 键 / 方块键 → buttons[2]
  Y: 3, // Y 键 / 三角键 → buttons[3]
  LB: 4, // 左肩键 → buttons[4]
  RB: 5, // 右肩键 → buttons[5]
  LT: 6, // 左扳机 → buttons[6]
  RT: 7, // 右扳机 → buttons[7]
  BACK: 8, // 返回键 → buttons[8]
  START: 9, // 开始键 → buttons[9]
  DPAD_UP: 12, // 方向键上 → buttons[12]
  DPAD_DOWN: 13, // 方向键下 → buttons[13]
  DPAD_LEFT: 14, // 方向键左 → buttons[14]
  DPAD_RIGHT: 15, // 方向键右 → buttons[15]
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
  // 注意：北通手柄的 DPAD 不走 buttons，而是通过 axis[9] 的值来判断
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
    // 调用父类 Base 的构造函数，将配置注入实例
    // Base 会将 options 中的属性（如 Game、Store）挂载到 this 上
    super(options);
    // 初始化内部状态变量（如激活手柄索引、防抖状态等）
    this.initialize();
  }

  /**
   * ## 初始化手柄控制器内部状态
   *
   * 设置所有内部状态变量的初始值，包括：
   *
   * - 激活手柄索引
   * - 防抖状态
   * - 摇杆阈值
   * - 按钮映射表
   *
   * @returns {void}
   */
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
     * 当摇杆值小于此阈值时视为 0（不触发移动）。 防止手柄摇杆硬件老化导致的漂移误触发。 取值范围建议 0.1 ~ 0.2，这里设置为 0.15。
     *
     * @type {number}
     */
    this.DEAD_ZONE = 0.15;

    /**
     * ## 方向触发阈值
     *
     * 摇杆超过此阈值时触发方向移动。 用于区分轻微移动和有意移动。 比 DEAD_ZONE 大，确保只在用户明确推动摇杆时才触发。
     *
     * @type {number}
     */
    this.DPAD_THRESHOLD = 0.5;

    /**
     * ## 按钮防抖状态
     *
     * Key: 按钮名称（如 'A', 'B'） Value: boolean - 是否已经触发过
     *
     * 用于防止按钮长按时重复触发指令。 按下时设为 true，松开时设为 false。 这样长按只会触发一次动作，不会连续触发。
     *
     * @type {Object<string, boolean>}
     */
    this.buttonStates = {};

    /**
     * ## 轴防抖状态（避免连续触发）
     *
     * Key: 动作名称（如 'MOVE_LEFT'） Value: boolean - 是否正在触发中
     *
     * 用于摇杆连续移动时的防抖控制。 触发时设为 true，摇杆回中时设为 false。 防止摇杆持续推动时重复发送相同指令。
     *
     * @type {Object<string, boolean>}
     */
    this.axisStates = {};

    /**
     * ## 是否已绑定事件
     *
     * 标记是否已经添加了游戏手柄连接/断开的事件监听。 避免重复绑定导致多次触发回调。
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
     * 用于计算冷却时间是否已过。 存储时间戳（毫秒），配合 DPAD_COOLDOWN 使用。
     *
     * @type {number}
     */
    this.lastDpadTime = 0;

    /**
     * ## 当前使用的按钮映射表
     *
     * 根据手柄型号动态切换：
     *
     * - 标准手柄使用 STANDARD_BTN_MAP
     * - 北通手柄使用 BETOP_20BC_1263_BTN_MAP
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
      up: false, // 上方向是否激活
      down: false, // 下方向是否激活
      left: false, // 左方向是否激活
      right: false, // 右方向是否激活
    };

    /**
     * ## 轴映射（标准 Gamepad）
     *
     * 定义左摇杆 X/Y 轴在 axes 数组中的索引位置。 axes[0] 是左摇杆 X 轴（左右移动） axes[1] 是左摇杆 Y 轴（上下移动）
     *
     * @type {Object<string, number>}
     */
    this.AXIS_MAP = {
      LEFT_STICK_X: 0, // 左摇杆 X 轴 → axes[0]
      LEFT_STICK_Y: 1, // 左摇杆 Y 轴 → axes[1]
    };

    /**
     * ## 绑定的手柄索引（对战模式专用）
     *
     * Null 表示自动选择第一个可用手柄。 数字表示固定使用指定索引的手柄。 对战模式下 P2 会绑定到 index=1 的手柄。
     *
     * @type {number | null}
     */
    this.boundGamepadIndex = null;
  }

  /**
   * ## 设置绑定的手柄索引
   *
   * 对战模式下，P2 调用此方法绑定到 index=1 的手柄。 同时设置 activeGamepadIndex，跳过自动选择逻辑。
   *
   * @param {number} index - 手柄索引（通常是 0 或 1）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  setBoundIndex(index) {
    this.boundGamepadIndex = index;
    this.activeGamepadIndex = index;
    return this;
  }

  /**
   * ## 每帧调用
   *
   * 这是主要的更新循环，每帧调用一次。
   *
   * 执行流程：
   *
   * 1. 刷新 Gamepad snapshot（获取最新的手柄状态）
   * 2. 检查模式限制：
   *
   *    - 对战 P2 只在 playing 响应
   *    - AI 不响应手柄输入
   * 3. 如果有激活的手柄，收集所有输入并派发指令
   *
   * @param {number} now - 当前时间的时间戳（毫秒）
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  update(now) {
    const { Store, Player } = this;
    const mode = Store.getMode();

    // 获取最新的手柄状态快照（navigator.getGamepads() 返回的是快照，需要每帧刷新）
    this._refreshGamepadState();

    /** 对战模式 P2 只在 playing 时响应手柄。 在菜单选择界面，P2 不能用手柄操作（由 P1 控制）。 */
    if (
      this.boundGamepadIndex !== null && // 如果有绑定的手柄索引
      this.boundGamepadIndex > 0 && // 且绑定的不是第一个手柄（即 P2）
      mode !== 'playing' // 且不在游戏进行中
    ) {
      return this; // 直接返回，不处理手柄输入
    }

    // 对战模式，AI 玩家不响应按键
    if (mode === 'playing' && Player.name === 'ai') {
      return this;
    }

    // 没有激活的手柄，直接返回
    if (!this.activeGamepad) {
      return this;
    }

    // 收集并处理所有手柄输入（按钮、摇杆、方向键）
    this._collectCommands(now);

    return this;
  }

  /**
   * ## 绑定 Gamepad 连接事件
   *
   * 注册游戏手柄的连接和断开事件监听器。 支持链式调用，可多次调用但只会绑定一次（通过 _eventsBound 标记）。
   *
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
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

    // 标记已绑定
    this._eventsBound = true;

    return this;
  }

  /**
   * ## 销毁事件绑定
   *
   * 移除手柄事件的监听器，清理内部状态。 在组件卸载或不需要手柄控制时调用。
   *
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  removeEventListeners() {
    // 移除事件监听器
    globalThis.removeEventListener('gamepadconnected', this._onConnect);
    globalThis.removeEventListener('gamepaddisconnected', this._onDisconnect);

    // 标记未绑定
    this._eventsBound = false;

    return this;
  }

  /**
   * ## 手柄连接事件处理
   *
   * 当检测到新的手柄连接时触发。
   *
   * 处理流程：
   *
   * 1. 如果绑定了指定索引，只响应绑定手柄的连接
   * 2. 如果已有激活手柄，忽略新连接（单手柄模式）
   * 3. 自动识别 BETOP 并切换 mapping
   * 4. 发送手柄连接状态更新事件
   *
   * @private
   * @param {object} e - 事件对象
   * @param {Gamepad} e.gamepad - 连接的手柄对象
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _onConnect = (e) => {
    const pad = e.gamepad;

    // 如果绑定了指定索引，只响应绑定手柄的连接
    if (this.boundGamepadIndex !== null) {
      // 如果不是绑定的手柄，忽略
      if (pad.index !== this.boundGamepadIndex) {
        return this;
      }

      // 设置激活手柄
      this.activeGamepadIndex = pad.index;
      // 根据手柄型号选择映射表
      this.curBtnMap = this._isBetop(pad.id)
        ? BETOP_20BC_1263_BTN_MAP // 北通手柄使用自定义映射
        : STANDARD_BTN_MAP; // 标准手柄使用标准映射

      const { Game } = this;
      const events = GameEvents(Game.id);
      // 发送手柄连接状态更新事件
      this.emit(events.UPDATE_GAMEPAD_CONNECTED, { connected: true });
      return this;
    }

    // 已经有激活的手柄，忽略新连接的手柄（单手柄模式）
    if (this.activeGamepadIndex !== null) {
      return this;
    }

    // 记录激活的手柄索引
    this.activeGamepadIndex = pad.index;

    // 根据手柄 ID 选择合适的按键映射表
    this.curBtnMap = this._isBetop(pad.id)
      ? BETOP_20BC_1263_BTN_MAP // 北通手柄需要特殊处理
      : STANDARD_BTN_MAP; // 标准手柄使用标准映射

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
   * 当激活的手柄断开连接时触发。
   *
   * 处理步骤：
   *
   * - 清空激活手柄的状态
   * - 重置所有防抖状态
   * - 发送断开状态更新事件
   *
   * @private
   * @param {object} e - 事件对象
   * @param {Gamepad} e.gamepad - 断开的手柄对象
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _onDisconnect = (e) => {
    // 只处理当前激活的手柄断开的情况
    if (this.activeGamepadIndex !== e.gamepad.index) {
      return this;
    }

    // 清空激活手柄信息
    this.activeGamepadIndex = null;
    // 重置所有防抖状态（按钮和摇杆）
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
   * 通过手柄 ID 字符串进行识别。 北通特定型号 20bc:1263 需要特殊处理。 因为它的按键映射和 DPAD 实现与标准手柄不同。
   *
   * @param {string} id - 手柄 id 字符串（如 'Xbox 360 Controller' 或 '20bc:1263'）
   * @returns {boolean} 是北通手柄返回 true，否则返回 false
   */
  _isBetop(id) {
    // 检查手柄 ID 是否包含北通的特征字符串
    return id.includes('20bc') && id.includes('1263');
  }

  /**
   * ## 刷新 Gamepad 状态
   *
   * 必须每帧调用 navigator.getGamepads()，因为 Gamepad 对象是 snapshot，不是实时引用。
   * 如果不在每帧刷新，获取到的永远是同一个状态快照。
   *
   * 处理逻辑：
   *
   * - 如果绑定了指定索引，优先使用绑定索引
   * - 如果没有激活手柄，自动选择第一个可用的手柄
   *
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _refreshGamepadState() {
    // 获取所有已连接的手柄快照
    // navigator.getGamepads() 返回一个 GamepadList，包含所有连接的手柄
    const pads = navigator.getGamepads?.() || [];

    // 如果绑定了指定索引，优先使用绑定索引
    if (this.boundGamepadIndex !== null) {
      this.activeGamepadIndex = this.boundGamepadIndex;
      // 获取绑定的手柄对象（可能为 null，如果手柄未连接）
      this.activeGamepad = pads[this.boundGamepadIndex] || null;

      // 如果绑定的手柄存在，更新映射表
      if (this.activeGamepad) {
        this.curBtnMap = this._isBetop(this.activeGamepad.id)
          ? BETOP_20BC_1263_BTN_MAP
          : STANDARD_BTN_MAP;
      }

      return this;
    }

    // 自动选择一个可用手柄（如果没有激活的手柄）
    if (this.activeGamepadIndex === null) {
      // Array.from 将 GamepadList 转换为数组，find(Boolean) 找到第一个非 null 的手柄
      const firstPad = Array.from(pads).find(Boolean);

      if (firstPad) {
        // 设置激活手柄索引
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
   * 不同游戏模式下，同一个手柄按键可以有不同的功能。 这是手柄控制器的核心功能之一，实现了按键的上下文感知。
   *
   * ### 模式映射
   *
   * - `game-mode` / `battle-mode`：DPAD_UP 用于移动光标，BACK 用于退出
   * - `difficulty`：ABXY 用于选择难度，BACK 用于返回
   * - `playing`：标准游戏操作，DPAD_UP 用于旋转方块
   *
   * @private
   * @param {string} mode - 游戏模式（'game-mode', 'battle-mode', 'difficulty',
   *   'playing' 等）
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _updateActionMap(mode) {
    switch (mode) {
      case 'game-mode':
      case 'exit-game': {
        // 选择界面：↑ 用于移动光标（在菜单选项中上下移动）
        GAMEPAD_ACTION_MAP.DPAD_UP = 'MOVE_UP';
        break;
      }
      case 'battle-mode': {
        // 对战模式选择界面：↑ 用于移动光标
        GAMEPAD_ACTION_MAP.DPAD_UP = 'MOVE_UP';
        // BACK 键用于退出对战模式
        GAMEPAD_ACTION_MAP.BACK = 'EXIT';
        break;
      }
      case 'difficulty': {
        // 难度选择界面：ABXY 映射到难度等级
        GAMEPAD_ACTION_MAP.A = 'EASY'; // A 键选择简单
        GAMEPAD_ACTION_MAP.B = 'NORMAL'; // B 键选择普通
        GAMEPAD_ACTION_MAP.Y = 'HARD'; // Y 键选择困难
        GAMEPAD_ACTION_MAP.X = 'EXPERT'; // X 键选择专家
        GAMEPAD_ACTION_MAP.BACK = 'BACK'; // BACK 键返回上一级
        break;
      }
      case 'playing': {
        // 游戏中：标准游戏操作
        GAMEPAD_ACTION_MAP.A = 'TOGGLE_MUSIC'; // A 键切换音乐
        GAMEPAD_ACTION_MAP.B = 'DROP'; // B 键方块直接落底
        GAMEPAD_ACTION_MAP.X = 'RESTART'; // X 键重新开始
        GAMEPAD_ACTION_MAP.Y = 'TOGGLE_PAUSE'; // Y 键暂停/继续
        GAMEPAD_ACTION_MAP.BACK = 'QUIT'; // BACK 键退出游戏
        GAMEPAD_ACTION_MAP.DPAD_UP = 'ROTATE'; // ↑ 旋转方块
        break;
      }
      // 其他模式保持默认映射（不修改）
    }

    return this;
  }

  /**
   * ## 解析手柄按钮的响应动作名称
   *
   * 根据游戏模式、当前等级等信息，确定按钮按下后应该触发的具体动作。 特别处理主菜单下的方向键（用于选择关卡，带冷却防抖）。
   *
   * @private
   * @param {string} action - 原始按键执行动作名称
   * @param {string} btnName - 按钮名称（如 'DPAD_UP'）
   * @param {boolean} isDPad - 是否为 DPad 方向键
   * @param {string} mode - 游戏当前模式
   * @param {string} level - 游戏当前等级（1-10）
   * @param {number} now - 当前时间的时间戳（毫秒）
   * @returns {string} 解析后的按键执行动作名称，空字符串表示不触发动作
   */
  _resolveAction(action, btnName, isDPad, mode, level, now) {
    // 非 DPad 或非主菜单模式 → 直接返回原始动作
    if (!isDPad || mode !== 'main-menu') {
      return action;
    }

    // 防抖：仅在等级选择界面降低按钮的灵敏度
    // 检查是否在冷却时间内，避免快速按下时跳跃多个等级
    if (now - this.lastDpadTime < this.DPAD_COOLDOWN) {
      return ''; // 返回空字符串表示不触发动作
    }

    // 更新上次触发时间
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
   * ### 屏蔽条件（哪些情况下不处理按钮输入）
   *
   * 1. 无法获取 action 指令名称
   * 2. 回放或游戏结束状态，按了非 START 键（只有确认键可用）
   * 3. AI 控制时，按了 AI 不允许的操作
   * 4. 对战模式特殊限制：
   *
   *    - X 键（重新开始）始终禁用
   *    - AI 玩家禁用 Y（暂停）和 RT（缓存）
   *    - 人类玩家禁用 RB（切换控制器）
   *
   * @private
   * @param {object} pad - Gamepad 对象
   * @param {string} mode - 游戏当前模式
   * @param {string} level - 游戏当前级别
   * @param {number} now - 当前时间的时间戳
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _handleStandardButtons(pad, mode, level, now) {
    const isBetop = this._isBetop(pad.id);
    const { Game, Store } = this;
    const { Player } = Game;
    const controller = Store.getController();

    // 遍历所有按钮映射（A, B, X, Y, START, BACK 等）
    for (const [btnName, action] of Object.entries(GAMEPAD_ACTION_MAP)) {
      /**
       * 判断按键是否应该被屏蔽（忽略）
       *
       * 屏蔽条件：
       *
       * 1. 无法获取 action 指令名称（action 为空）
       * 2. 回放或游戏结束状态，按了非 START 键（只有 START 确认键可用）
       * 3. AI 控制时，按了 AI 不允许的操作（只能按切换控制器键）
       * 4. 对战模式特殊限制：
       *
       *    - X 键（重新开始）始终禁用
       *    - AI 玩家禁用 Y（暂停）和 RT（缓存方块）
       *    - 人类玩家禁用 RB（切换控制器）
       */
      const isBlocked =
        !action || // 没有对应的动作
        ((mode === 'replay' || mode === 'game-over') && // 回放或游戏结束
          btnName !== 'START' && // 且不是 START 键
          btnName !== 'BACK') || // 且不是 BACK 键（允许返回）
        (controller === 'ai' && // AI 控制时
          mode === 'playing' && // 在游戏中
          !GAME.AI_ALLOWED_ACTIONS.includes(action)) || // 且不是 AI 允许的动作
        (Game.isVersus() && // 对战模式
          (btnName === 'X' || // X 键始终禁用（不能重新开始）
            (Player.name === 'ai' && (btnName === 'Y' || btnName === 'RT')) || // AI 禁用暂停和缓存
            (Player.name === 'human' && btnName === 'RB'))); // 人类禁用切换控制器

      // 判断是否为 DPad 方向键（按钮名以 'DPAD_' 开头）
      const isDPad = btnName.startsWith('DPAD_');

      // 按钮未被按下，跳过
      if (!this._isPressed(btnName)) {
        continue;
      }

      // BETOP 手柄的 DPad 特殊处理（通过轴读取），跳过按钮方式
      // 北通手柄的 DPAD 不走 buttons，而是通过 axis[9] 来判断
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

      // 解析后没有有效的 action（可能因为冷却时间未到），跳过
      if (!finalAction) {
        continue;
      }

      const events = GameEvents(Game.id);

      // 派发输入事件，通知游戏逻辑层有手柄输入
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad', // 输入设备类型：手柄
        action: finalAction, // 具体动作
        payload: { Game }, // 附带游戏实例
      });
    }

    return this;
  }

  /**
   * ## 收集所有输入
   *
   * 处理按钮、摇杆、方向键等所有输入源。 转换为统一的 dispatchInput 指令。
   *
   * ### 处理流程
   *
   * 1. 根据当前游戏模式更新按键映射
   * 2. 处理标准按钮输入（ABXY、START、BACK 等）
   * 3. 非回放/非结束时处理摇杆和 DPAD
   * 4. 北通手柄特殊处理（DPAD 通过 axis9 传递）
   *
   * @private
   * @param {number} now - 当前时间的时间戳（毫秒）
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
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
    // 例如：游戏中 DPAD_UP 是旋转，菜单中是移动光标
    this._updateActionMap(mode);

    // 处理标准按钮输入（ABXY、START、BACK 等）
    this._handleStandardButtons(pad, mode, level, now);

    // 回放模式或者游戏结束不处理摇杆和 DPAD
    // 这些模式下只需要按钮操作（如 START 确认）
    if (mode === 'replay' || mode === 'game-over') {
      return this;
    }

    // 读取左摇杆的 X 和 Y 轴值
    const x = this._getAxis(this.AXIS_MAP.LEFT_STICK_X);
    const y = this._getAxis(this.AXIS_MAP.LEFT_STICK_Y);

    // 处理摇杆移动（连续输入 + 防抖）
    this._handleStickMove(x, y);

    // BETOP 特殊处理（DPAD 通过 axis9 传递）
    // 北通手柄的 DPAD 不走标准 buttons，而是通过 axis[9] 的值来表示方向
    if (this._isBetop(pad.id)) {
      const dpadVal = pad.axes[9] ?? 0; // 获取 axis[9] 的值，默认为 0
      this._handleBetopDpad(dpadVal, state);
    }

    return this;
  }

  /**
   * ## 开始轴动作（触发一次）
   *
   * 仅在未触发时触发 dispatch，防止重复触发。 用于摇杆移动等连续输入场景。
   *
   * 例如：用户持续推左摇杆，只会在第一次超过阈值时触发一次 MOVE_LEFT， 后续持续推动不会重复触发。
   *
   * @param {string} action - 动作名称（如 'MOVE_LEFT'）
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _startAxisAction(action) {
    // 该动作已在触发中，跳过（防抖）
    if (this.axisStates[action]) {
      return this;
    }

    const { Game } = this;

    // 标记为已触发
    this.axisStates[action] = true;

    const events = GameEvents(Game.id);

    // 派发输入事件
    this.emit(events.DISPATCH_INPUT, {
      device: 'gamepad',
      action,
      payload: { Game },
    });

    return this;
  }

  /**
   * ## 停止轴动作（重置状态）
   *
   * 当摇杆回到死区范围内时调用。 重置轴状态，下次推动摇杆时可以再次触发动作。
   *
   * @param {string} action - 动作名称
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _stopAxisAction(action) {
    this.axisStates[action] = false;
    return this;
  }

  /**
   * ## 处理摇杆向上移动
   *
   * Y 轴负值表示向上推动摇杆。
   *
   * @private
   * @param {number} y - Y轴偏移值（-1 到 1，-1 表示推到底部）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickUp(y) {
    if (y < -this.DPAD_THRESHOLD) {
      // Y 轴负值超过阈值（向上推）
      this._startAxisAction('ROTATE'); // 向上触发旋转方块
    } else {
      this._stopAxisAction('ROTATE'); // 摇杆回中，停止旋转
    }
    return this;
  }

  /**
   * ## 处理摇杆向下移动
   *
   * Y 轴正值表示向下推动摇杆。
   *
   * @private
   * @param {number} y - Y轴偏移值（-1 到 1，1 表示推到底部）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickDown(y) {
    if (y > this.DPAD_THRESHOLD) {
      // Y 轴正值超过阈值（向下推）
      this._startAxisAction('MOVE_DOWN'); // 向下触发加速下落
    } else {
      this._stopAxisAction('MOVE_DOWN'); // 摇杆回中，停止加速
    }
    return this;
  }

  /**
   * ## 处理摇杆向左移动
   *
   * X 轴负值表示向左推动摇杆。
   *
   * @private
   * @param {number} x - X轴偏移值（-1 到 1，-1 表示推到底部）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickLeft(x) {
    if (x < -this.DPAD_THRESHOLD) {
      // X 轴负值超过阈值（向左推）
      this._startAxisAction('MOVE_LEFT'); // 向左触发方块左移
    } else {
      this._stopAxisAction('MOVE_LEFT'); // 摇杆回中，停止左移
    }
    return this;
  }

  /**
   * ## 处理摇杆向右移动
   *
   * X 轴正值表示向右推动摇杆。
   *
   * @private
   * @param {number} x - X轴偏移值（-1 到 1，1 表示推到底部）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleStickRight(x) {
    if (x > this.DPAD_THRESHOLD) {
      // X 轴正值超过阈值（向右推）
      this._startAxisAction('MOVE_RIGHT'); // 向右触发方块右移
    } else {
      this._stopAxisAction('MOVE_RIGHT'); // 摇杆回中，停止右移
    }
    return this;
  }

  /**
   * ## 摇杆移动处理（带防抖）
   *
   * 处理左摇杆的四个方向移动，并触发相应的游戏动作。 四个方向独立处理，互不影响。
   *
   * @param {number} x - X轴偏移值（-1 到 1），负值为左，正值为右
   * @param {number} y - Y轴偏移值（-1 到 1），负值为上，正值为下
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _handleStickMove(x, y) {
    // 上方向（旋转方块）
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
   * 在主菜单模式下用于增加关卡等级，在游戏模式下用于旋转方块。 实现了按键的上下文感知功能。
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前关卡等级
   * @returns {string} 动作名称（如 'LEVEL_TWO' 或 'ROTATE'）
   */
  _getMoveUpAction(mode, level) {
    const { Game } = this;
    const events = GameEvents(Game.id);
    let action;

    if (mode === 'main-menu') {
      // 主菜单：增加关卡等级
      let newLevel = Number(level) + 1;

      // 最高第 10 关，不能超过
      if (newLevel >= 10) {
        newLevel = 10;
      }

      // 更新等级（通过事件通知游戏状态管理）
      this.emit(events.UPDATE_LEVEL, { level: newLevel });
      // 返回对应的等级动作名称
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
   * 在主菜单模式下用于减少关卡等级，在游戏模式下用于加速下落。 实现了按键的上下文感知功能。
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前关卡等级
   * @returns {string} 动作名称（如 'LEVEL_ONE' 或 'MOVE_DOWN'）
   */
  _getMoveDownAction(mode, level) {
    let action;
    const { Game } = this;
    const events = GameEvents(Game.id);

    if (mode === 'main-menu') {
      // 主菜单：减少关卡等级
      let newLevel = Number(level) - 1;

      // 最低第 1 关，不能低于
      if (newLevel <= 1) {
        newLevel = 1;
      }

      // 更新等级（通过事件通知游戏状态管理）
      this.emit(events.UPDATE_LEVEL, { level: newLevel });
      // 返回对应的等级动作名称
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
   * 北通手柄的 DPAD 通过 axis[9] 传递，需要特殊处理。 使用防抖状态避免重复触发。
   *
   * @private
   * @param {string} mode - 游戏模式
   * @param {string | number} level - 当前等级
   * @param {object} st - 方向键状态对象（dpadAxisState）
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadUp(mode, level, st) {
    const action = this._getMoveUpAction(mode, level);
    const { Game } = this;

    // 如果上方向还未触发
    if (!st.up) {
      const events = GameEvents(Game.id);
      st.up = true; // 标记已触发
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action,
        payload: { Game },
      });
    }

    // 其他方向状态重置（确保同一时间只有一个方向被激活）
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
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadDown(mode, level, st) {
    const action = this._getMoveDownAction(mode, level);
    const { Game } = this;

    // 如果下方向还未触发
    if (!st.down) {
      const events = GameEvents(Game.id);
      st.down = true; // 标记已触发
      this.emit(events.DISPATCH_INPUT, {
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
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadLeft(st) {
    const { Game } = this;

    // 如果左方向还未触发
    if (!st.left) {
      const events = GameEvents(Game.id);
      st.left = true; // 标记已触发
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action: 'MOVE_LEFT', // 左移方块
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
   * @returns {GamepadController} 返回自身，支持链式调用
   */
  _handleBetopDpadRight(st) {
    const { Game } = this;

    // 如果右方向还未触发
    if (!st.right) {
      const events = GameEvents(Game.id);
      st.right = true; // 标记已触发
      this.emit(events.DISPATCH_INPUT, {
        device: 'gamepad',
        action: 'MOVE_RIGHT', // 右移方块
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
   * ### 方向对应值
   *
   * | 方向 | axis[9] 值 | 说明             |
   * | ---- | ---------- | ---------------- |
   * | 上   | -1.00000   | 方向键上被按下   |
   * | 下   | 0.14286    | 方向键下被按下   |
   * | 左   | 0.71429    | 方向键左被按下   |
   * | 右   | -0.42857   | 方向键右被按下   |
   * | 松开 | 其他值     | 没有方向键被按下 |
   *
   * @param {number} val - Axis[9] 的原始值
   * @param {object} state - 游戏状态信息（包含 mode 和 level）
   * @returns {GamepadController} 返回 GamepadController 对象，可链式调用
   */
  _handleBetopDpad(val, state) {
    const { mode, level } = state;
    // 保留5位小数进行精确匹配（因为浮点数可能有微小误差）
    const v = val.toFixed(5);
    const st = this.dpadAxisState;
    const now = Date.now();

    // 冷却期内直接跳过，仅在等级选择界面降低按钮的灵敏度
    if (mode === 'main-menu' && now - this.lastDpadTime < this.DPAD_COOLDOWN) {
      return this;
    }

    // 根据 axis[9] 的具体值判断方向
    switch (v) {
      // 上方向
      case '-1.00000': {
        this._handleBetopDpadUp(mode, level, st);
        this.lastDpadTime = now; // 更新最后触发时间
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
      // axis[9] 为其他值表示没有方向键被按下
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
   * 读取指定轴的数值，并应用死区过滤。 小于死区的值视为 0，避免摇杆漂移导致的误操作。
   *
   * 死区的作用：摇杆在中心位置时，由于硬件精度问题， 可能会有非常小的非零值，死区过滤可以忽略这些微小抖动。
   *
   * @param {number} index - 轴在 axes 数组中的索引
   * @returns {number} 经过死区过滤后的轴值（范围 -1 到 1，死区范围内返回 0）
   */
  _getAxis(index) {
    // 没有激活的手柄，返回 0
    if (!this.activeGamepad) {
      return 0;
    }

    // 读取轴值，默认为 0（使用空值合并运算符，如果 axes[index] 为 undefined 或 null 则返回 0）
    const val = this.activeGamepad.axes[index] ?? 0;

    // 应用死区：小于死区的值归零
    // Math.abs(val) 获取绝对值，大于 DEAD_ZONE 才返回原值，否则返回 0
    return Math.abs(val) > this.DEAD_ZONE ? val : 0;
  }

  /**
   * ## 判断按钮是否"刚按下"（防抖）
   *
   * 检测按钮是否刚被按下（边缘触发），而不是持续按下的状态。 配合 buttonStates 实现防抖，防止长按时重复触发。
   *
   * ### 工作原理
   *
   * 1. 按钮按下（value > 0.5）且之前未触发 → 返回 true，标记已触发
   * 2. 按钮按下但之前已触发 → 返回 false（长按中，忽略）
   * 3. 按钮松开（value <= 0.5）→ 重置状态，下次按下可再次触发
   *
   * ### 为什么使用 0.5 作为阈值？
   *
   * 手柄按钮的 value 通常是 0.0（未按下）到 1.0（完全按下）的模拟值， 0.5 是一个合理的中间值，可以判断按钮是否被按下。
   *
   * @param {string} btnName - 按钮名称（如 'A'、'START'）
   * @returns {boolean} 按钮刚被按下返回 true，否则返回 false
   */
  _isPressed(btnName) {
    // 获取按钮在映射表中的索引
    // 例如：标准手柄的 A 键映射到索引 0
    const idx = this.curBtnMap[btnName];

    // 无效索引或没有激活手柄，返回 false
    if (idx === undefined || !this.activeGamepad) {
      return false;
    }

    // 获取按钮对象
    const btn = this.activeGamepad.buttons[idx];

    // 按钮不存在，返回 false
    if (!btn) {
      return false;
    }

    // 按钮是否被按下（值大于 0.5 表示按下）
    const pressed = btn.value > 0.5;

    // 按下且之前未触发 → 触发事件
    if (pressed && !this.buttonStates[btnName]) {
      this.buttonStates[btnName] = true; // 标记已触发
      return true; // 返回 true 表示刚按下
    }

    // 松开按钮 → 重置状态
    if (!pressed) {
      this.buttonStates[btnName] = false; // 重置防抖状态
    }

    return false; // 长按中或未按下
  }
}

export default GamepadController;
