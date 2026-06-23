import GAME from '@/lib/game/constants/game.js';
import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * DAS/ARR 配置（单位：帧，60fps 下 1 帧 ≈ 16.67ms）
 *
 * - DAS（Delayed Auto Shift）：长按方向键后，延迟多少帧开始自动移动
 * - ARR（Auto Repeat Rate）：自动移动开始后，每隔多少帧移动一次
 *
 * @constant {object}
 */
const DAS_CONFIG = {
  DAS: 10, // 延迟 10 帧（≈167ms）后开始自动移动
  ARR: 2, // 之后每 2 帧（≈33ms）移动一次
};

/**
 * ## 键盘按键到游戏动作的映射表
 *
 * 将用户按下的物理按键映射为游戏内部的动作指令。 支持小写字母、数字、方向键和特殊键（空格、回车等）。
 *
 * ### 映射分类
 *
 * - **移动旋转**：方向键控制方块的移动、旋转和下落
 * - **游戏控制**：S/M/P/R/Q/C 控制游戏状态（切换模式、音乐、暂停、重开、退出、缓存）
 * - **关卡选择**：数字键 1-9 和 T 键选择不同等级
 * - **难度选择**：E/N/H/X 选择游戏难度（简单、普通、困难、专家）
 * - **界面导航**：B/Enter/Escape 用于返回、确认和退出操作
 *
 * ### 动态映射说明
 *
 * 部分按键的动作会根据游戏模式动态变化：
 *
 * - **ArrowUp（↑）**：
 *
 *   - `game-mode` / `battle-mode`：向上移动选择光标（MOVE_UP）
 *   - `playing`：旋转方块（ROTATE）
 *
 * @constant
 * @type {Object<string, string>}
 */
const KEYBOARDS_ACTION_MAP = {
  // 强制退出/返回
  escape: 'EXIT',

  // ========== 方块操作 ==========
  arrowleft: 'MOVE_LEFT', // 向左移动方块
  arrowright: 'MOVE_RIGHT', // 向右移动方块
  arrowdown: 'MOVE_DOWN', // 向下加速移动（软降）
  arrowup: 'ROTATE', // 旋转方块（或在菜单中向上移动光标）
  ' ': 'DROP', // 空格键：方块直接落底（硬降）

  // ========== 游戏控制 ==========
  s: 'SWITCH_CONTROLLER', // 切换控制器（玩家 ↔ AI）
  m: 'TOGGLE_MUSIC', // 切换音乐开关
  p: 'TOGGLE_PAUSED', // 暂停/继续游戏
  r: 'RESTART', // 重新开始游戏
  q: 'QUIT', // 退出游戏

  // ========== 缓存方块 ==========
  c: 'HOLD', // 将当前方块存入 Hold 区

  // ========== 关卡选择 ==========
  1: 'LEVEL_ONE', // 第 1 关
  2: 'LEVEL_TWO', // 第 2 关
  3: 'LEVEL_THREE', // 第 3 关
  4: 'LEVEL_FOUR', // 第 4 关
  5: 'LEVEL_FIVE', // 第 5 关
  6: 'LEVEL_SIX', // 第 6 关
  7: 'LEVEL_SEVEN', // 第 7 关
  8: 'LEVEL_EIGHT', // 第 8 关
  9: 'LEVEL_NINE', // 第 9 关
  t: 'LEVEL_TEN', // T 键：第 10 关

  // ========== 难度选择 ==========
  e: 'EASY', // 简单难度
  n: 'NORMAL', // 普通难度
  h: 'HARD', // 困难难度
  x: 'EXPERT', // 专家难度

  // ========== 界面导航 ==========
  b: 'BACK', // 返回上一级
  enter: 'CONFIRM', // 确认操作
};

/**
 * ## 将键盘输入映射为游戏动作
 *
 * 接收浏览器键盘事件的 key 属性，经过规范化和映射后， 返回对应的游戏动作指令字符串。
 *
 * ### 动态映射逻辑
 *
 * 根据当前游戏模式，动态修改方向键上（ArrowUp）的行为：
 *
 * - `game-mode` / `battle-mode`（选择界面）：映射为 MOVE_UP（向上移动光标）
 * - `playing`（游戏中）：映射为 ROTATE（旋转方块）
 *
 * ### 大小写不敏感
 *
 * 所有按键统一转为小写进行匹配，用户按 'A' 或 'a' 效果相同。
 *
 * @example
 *   resolveKeyboardAction('ArrowLeft'); // 返回 'MOVE_LEFT'
 *   resolveKeyboardAction(' '); // 返回 'DROP'
 *   resolveKeyboardAction('unknown'); // 返回 undefined
 *
 * @function resolveKeyboardAction
 * @param {string} key - KeyboardEvent.key，浏览器提供的按键标识
 * @param {string} mode - 当前游戏模式，用于动态调整映射
 * @returns {string | void} 对应游戏动作，如果按键无效则返回 undefined
 */
const resolveKeyboardAction = (key, mode) => {
  // 空键值直接返回，避免无效处理
  if (!key) {
    return;
  }

  // 统一转换为小写，实现大小写不敏感的匹配
  const normalizedKey = key.toLowerCase();

  /**
   * 根据游戏模式动态调整方向键上的行为：
   *
   * - 选择界面（game-mode / battle-mode）：↑ 用于移动光标
   * - 游戏中（playing）：↑ 用于旋转方块
   *
   * 其他模式下保持默认映射（ROTATE）。
   */
  if (mode === 'game-mode' || mode === 'battle-mode') {
    KEYBOARDS_ACTION_MAP.arrowup = 'MOVE_UP';
  } else if (mode === 'playing') {
    KEYBOARDS_ACTION_MAP.arrowup = 'ROTATE';
  }

  // 从映射表中查找对应的动作指令
  return KEYBOARDS_ACTION_MAP[normalizedKey];
};

/**
 * # KeyboardController（键盘控制器）
 *
 * 负责监听和处理所有键盘输入事件，将用户的按键操作转换为游戏动作指令。
 *
 * ## 核心功能
 *
 * - **键盘监听**：监听全局 keydown/keyup 事件，捕获用户按键
 * - **动作映射**：将物理按键映射为游戏语义动作（移动、旋转、暂停等）
 * - **DAS/ARR**：长按左右键时，延迟后自动重复移动（高速下落阶段必备）
 * - **输入屏蔽**：根据游戏状态（模式、控制器类型）智能屏蔽无效按键
 * - **视口适配**：监听窗口 resize 事件，通知游戏画布重新适配
 *
 * ## 设计说明
 *
 * - **事件委托**：通过 EventBus 派发 `dispatch:input` 事件，解耦输入处理与游戏逻辑
 * - **链式调用**：事件绑定方法返回 this，支持链式调用
 * - **状态感知**：根据 Store 中的游戏模式和控制方式动态决定按键是否响应
 *
 * ## DAS/ARR 机制
 *
 * 当玩家按住左/右方向键不放时：
 *
 * 1. 第一帧：立即移动一次
 * 2. 等待 DAS（10 帧 ≈ 167ms）
 * 3. 之后每 ARR（2 帧 ≈ 33ms）自动移动一次
 *
 * 这实现了"按住方向键连续移动"的效果，让玩家在高速下落时也能快速调整方块位置。
 *
 * ## 屏蔽规则
 *
 * 以下情况下的按键会被屏蔽（不产生游戏动作）：
 *
 * 1. 按键没有对应的动作映射
 * 2. 回放模式下按非 Enter 键（回放时只能按确认键）
 * 3. AI 控制且游戏进行中，按了 AI 不允许的操作键
 * 4. 对战模式下某些特定按键被禁用：
 *
 *    - R 键（重新开始）始终禁用
 *    - AI 玩家禁用 M（音乐）、P（暂停）、C（缓存）
 *    - 人类玩家禁用 S（切换控制器）
 *    - P2（index=1）禁用 P（暂停）
 *    - P2 在 playing 模式下所有键盘输入被禁用
 *
 * @augments Base
 * @class KeyboardController
 */
class KeyboardController extends Base {
  /**
   * ## 构造函数
   *
   * 创建键盘控制器实例。 注意：构造函数不会自动绑定事件，需要手动调用 `addEventListeners()`。
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置注入实例
    super(options);
    // 初始化 DAS/ARR 状态
    this.initialize();
  }

  /**
   * ## 初始化 DAS/ARR 状态
   *
   * 设置 DAS/ARR 的初始状态和键盘禁用标记。
   *
   * @returns {void}
   */
  initialize() {
    /**
     * ## DAS/ARR 状态
     *
     * | 字段      | 说明                                 |
     * | --------- | ------------------------------------ |
     * | dasTimer  | DAS 计时器（帧数），-1 表示未触发    |
     * | arrTimer  | ARR 计时器（帧数）                   |
     * | direction | 当前 DAS 方向（-1 左 / 1 右 / 0 无） |
     * | active    | 是否由键盘触发的 DAS                 |
     */
    this.dasState = {
      dasTimer: -1, // -1 = DAS 未激活
      arrTimer: 0, // ARR 计时器从 0 开始
      direction: 0, // 0 = 无方向
      active: false, // 初始未激活
    };

    /**
     * ## 是否禁用键盘输入
     *
     * 对战模式 P2（Player.index === 1）设为 true， 防止键盘同时控制两个 Game 实例。
     *
     * @type {boolean}
     */
    this.disabled = false;
  }

  /**
   * ## 设置键盘禁用状态
   *
   * 对战模式下，P2 的键盘在 playing 状态时被禁用， 只能使用手柄操作。
   *
   * @param {boolean} disabled - True 禁用，false 启用
   * @returns {KeyboardController} 返回自身，支持链式调用
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    return this;
  }

  /**
   * ## 每帧更新 DAS/ARR（由 Engine.tick 驱动）
   *
   * 在游戏主循环中每帧调用，管理长按方向键时的自动重复移动。
   *
   * ### 工作流程
   *
   * - **DAS 阶段**：等待 DAS_CONFIG.DAS（10 帧）后开始
   * - **ARR 阶段**：每 DAS_CONFIG.ARR（2 帧）自动移动一次
   * - 仅在 playing 模式下生效
   * - 键盘禁用时跳过
   *
   * @returns {void}
   */
  update() {
    // 键盘禁用时跳过
    if (this.disabled) {
      return;
    }

    const { dasState, Game } = this;

    // 非键盘触发或方向归零，跳过
    if (!dasState.active || dasState.direction === 0) {
      return;
    }

    // 非 playing 模式不触发自动移动
    if (Game.Store.getMode() !== 'playing') {
      return;
    }

    /** DAS 阶段：等待延迟。 按住方向键后，前 DAS_CONFIG.DAS 帧不自动移动， 给玩家短暂的反应时间。 */
    if (dasState.dasTimer < DAS_CONFIG.DAS) {
      dasState.dasTimer++;
      return;
    }

    /** ARR 阶段：自动重复移动。 DAS 延迟结束后，每 ARR 帧自动发送一次移动指令。 */
    if (dasState.arrTimer >= DAS_CONFIG.ARR) {
      // 重置 ARR 计时器
      dasState.arrTimer = 0;
      // 发送自动移动指令
      this.emit('dispatch:input', {
        device: 'keyboard',
        action: dasState.direction === -1 ? 'MOVE_LEFT' : 'MOVE_RIGHT',
        payload: { Game },
      });
    } else {
      // ARR 计时器递增
      dasState.arrTimer++;
    }
  }

  /**
   * ## 绑定游戏中键盘操作相关的事件
   *
   * 注册全局事件监听器：
   *
   * - `resize`：监听窗口大小变化，用于调整游戏画布尺寸
   * - `keydown`：监听键盘按下，处理游戏操作输入
   * - `keyup`：监听键盘松开，用于停止 DAS/ARR
   *
   * @returns {KeyboardController} 返回 KeyboardController 对象，可链式调用
   */
  addEventListeners() {
    // 窗口尺寸变化 → 画布自适应
    globalThis.addEventListener('resize', this._onResize);
    // 键盘按下 → 游戏操作
    document.addEventListener('keydown', this._onKeydown);
    // 键盘松开 → 停止 DAS/ARR
    document.addEventListener('keyup', this._onKeyup);

    return this;
  }

  /**
   * ## 解除游戏中键盘操作相关的事件绑定
   *
   * 移除之前注册的所有事件监听器。 在 Engine.destroy() 或模式切换时调用。
   *
   * @returns {KeyboardController} 返回 KeyboardController 对象，可链式调用
   */
  removeEventListeners() {
    globalThis.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._onKeydown);
    document.removeEventListener('keyup', this._onKeyup);

    return this;
  }

  /**
   * ## 判断按键是否被屏蔽
   *
   * 根据当前游戏状态决定是否应该响应该按键。
   *
   * ### 屏蔽场景
   *
   * 1. **按键不在映射表中**：无对应动作
   * 2. **回放模式**：只允许按 Enter 键确认
   * 3. **AI 控制 + 游戏中**：只允许 AI_ALLOWED_ACTIONS 中的操作
   * 4. **对战模式特殊限制**：
   *
   *    - R 键（重新开始）始终禁用
   *    - AI 玩家禁用 M（音乐）、P（暂停）、C（缓存）
   *    - 人类玩家禁用 S（切换控制器）
   *    - P2（index=1）禁用 P（暂停）
   *    - P2 在 playing 模式下所有键盘输入被禁用
   *
   * @private
   * @param {string} key - 按键名称（已小写化）
   * @returns {boolean} 按键被屏蔽返回 true，否则返回 false
   */
  _isBlocked(key) {
    const { Store, Game } = this;
    const { Player } = Game;
    const mode = Store.getMode();
    // 解析按键对应的动作（根据当前模式动态映射）
    const action = resolveKeyboardAction(key, mode);
    const controller = Store.getController();

    return (
      // 1. 无对应动作
      !action ||
      // 2. 回放模式只允许 Enter
      (mode === 'replay' && key !== 'enter' && key !== 'escape') ||
      // 3. AI 控制时只允许指定操作
      (controller === 'ai' &&
        mode === 'playing' &&
        !GAME.AI_ALLOWED_ACTIONS.includes(action)) ||
      // 4. 对战模式特殊限制
      (Game.isVersus() &&
        (key === 'r' || // 禁止重新开始
          // AI 玩家限制
          (Player.name === 'ai' &&
            (key === 'm' || key === 'p' || key === 'c')) ||
          // 人类玩家限制
          (Player.name === 'human' &&
            (key === 's' || // 不能切换控制器
              (key === 'p' && Player.index === 1) || // P2 不能暂停
              (mode === 'playing' && Player.index === 1))))) // P2 playing 时全禁用
    );
  }

  /**
   * ## resize 事件处理
   *
   * 当浏览器窗口大小改变时触发。 发送 RESIZE 事件通知 UI 层重新计算画布尺寸。
   *
   * @private
   * @returns {KeyboardController} 返回 KeyboardController，支持链式方法调用
   */
  _onResize = () => {
    // 解构 Game 实例
    const { Game } = this;
    // 获取当前 Game 实例的 UI 事件常量
    const events = UIEvents(Game.id);

    // 发送画布自适应事件
    this.emit(events.RESIZE);

    return this;
  };

  /**
   * ## keydown 事件处理
   *
   * 当用户按下键盘按键时触发。
   *
   * ### 处理流程
   *
   * 1. 键盘禁用时跳过
   * 2. 按键被屏蔽时跳过
   * 3. AI 玩家在 playing 模式时跳过
   * 4. 左右方向键启动 DAS/ARR 自动重复移动
   * 5. 所有按键立即执行第一次动作
   *
   * @private
   * @param {object} e - 键盘事件对象
   * @returns {KeyboardController} 返回 KeyboardController，支持链式方法调用
   */
  _onKeydown = (e) => {
    const { Game, Store, Player } = this;
    // 获取按键标识并转为小写
    const key = e.key?.toLowerCase();

    // 键盘禁用或无按键时跳过
    if (!key || this.disabled) {
      return this;
    }

    // 解析按键对应的动作
    const action = resolveKeyboardAction(key);

    // 按键被屏蔽时跳过
    if (this._isBlocked(key) || !action) {
      return this;
    }

    /** 对战模式，AI 玩家在 playing 时跳过。 注意：这里重复检查了 AI 玩家条件， 与 _isBlocked 中的检查形成双重保护。 */
    if (Store.getMode() === 'playing' && Player.name === 'ai') {
      return this;
    }

    /**
     * 左右方向键：启动 DAS/ARR 自动重复移动。
     *
     * 按下左/右键时：
     *
     * - 设置移动方向
     * - 重置 DAS/ARR 计时器
     * - 标记为键盘触发
     *
     * 第一帧的移动在下方立即执行。
     */
    if (key === 'arrowleft') {
      this.dasState.direction = -1; // 向左
      this.dasState.dasTimer = 0; // 开始 DAS 计时
      this.dasState.arrTimer = 0; // 重置 ARR 计时
      this.dasState.active = true; // 标记为键盘触发
    } else if (key === 'arrowright') {
      this.dasState.direction = 1; // 向右
      this.dasState.dasTimer = 0; // 开始 DAS 计时
      this.dasState.arrTimer = 0; // 重置 ARR 计时
      this.dasState.active = true; // 标记为键盘触发
    }

    /** 立即执行第一次移动。 无论是否是方向键，第一次按键立即响应，不需要等待 DAS 延迟。 */
    this.emit('dispatch:input', {
      device: 'keyboard',
      action,
      payload: { Game },
    });

    return this;
  };

  /**
   * ## keyup 事件处理
   *
   * 当用户松开键盘按键时触发。 松开左右方向键会停止 DAS/ARR 自动重复移动。
   *
   * ### 防止误停止
   *
   * 只有当松开的按键与当前 DAS 方向匹配时才停止。 例如：按住左键期间按下右键，松开左键不会停止 DAS（因为方向已变为右）。
   *
   * @private
   * @param {object} e - 键盘事件对象
   * @returns {KeyboardController} 返回 KeyboardController，支持链式方法调用
   */
  _onKeyup = (e) => {
    // 获取按键标识并转为小写
    const key = e.key?.toLowerCase();

    /**
     * 检查松开的按键是否与当前 DAS 方向匹配：
     *
     * - 松开左键（arrowleft）且当前 DAS 方向为左（-1）→ 停止 DAS
     * - 松开右键（arrowright）且当前 DAS 方向为右（1）→ 停止 DAS
     * - 其他情况：忽略
     */
    if (
      (key === 'arrowleft' && this.dasState.direction === -1) ||
      (key === 'arrowright' && this.dasState.direction === 1)
    ) {
      // 停止 DAS：清除方向和计时器
      this.dasState.direction = 0;
      this.dasState.dasTimer = -1;
      this.dasState.active = false;
    }

    return this;
  };
}

export default KeyboardController;
