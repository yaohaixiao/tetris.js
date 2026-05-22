import GAME from '@/lib/game/constants/game.js';
import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ## 键盘按键到游戏动作的映射表
 *
 * 将用户按下的物理按键映射为游戏内部的动作指令。 支持小写字母、数字、方向键和特殊键（空格、回车等）。
 *
 * 映射分类：
 *
 * - **移动旋转**：方向键控制方块的移动、旋转和下落
 * - **游戏控制**：S/M/P/R/Q 控制游戏状态（切换模式、音乐、暂停、重开、退出）
 * - **关卡选择**：数字键 1-9 和 T 键选择不同难度等级
 * - **难度选择**：E/N/H/X 选择游戏难度（简单、普通、困难、专家）
 * - **界面导航**：B/Enter 用于返回和确认操作
 *
 * @constant
 * @type {Object<string, string>}
 */
const KEYBOARDS_ACTION_MAP = {
  // ========== 方块操作 ==========
  arrowleft: 'MOVE_LEFT', // 向左移动方块
  arrowright: 'MOVE_RIGHT', // 向右移动方块
  arrowdown: 'MOVE_DOWN', // 向下加速移动
  arrowup: 'ROTATE', // 旋转方块
  ' ': 'DROP', // 空格键：方块直接落底

  // ========== 游戏控制 ==========
  s: 'SWITCH_CONTROLLER', // 切换控制器（玩家/AI）
  m: 'TOGGLE_MUSIC', // 切换音乐开关
  p: 'TOGGLE_PAUSED', // 暂停/继续游戏
  r: 'RESTART', // 重新开始游戏
  q: 'QUIT', // 退出游戏

  // ========== 关卡选择 ==========
  1: 'LEVEL_ONE', // 第1关
  2: 'LEVEL_TWO', // 第2关
  3: 'LEVEL_THREE', // 第3关
  4: 'LEVEL_FOUR', // 第4关
  5: 'LEVEL_FIVE', // 第5关
  6: 'LEVEL_SIX', // 第6关
  7: 'LEVEL_SEVEN', // 第7关
  8: 'LEVEL_EIGHT', // 第8关
  9: 'LEVEL_NINE', // 第9关
  t: 'LEVEL_TEN', // T键：第10关

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
 * @example
 *   resolveKeyboardAction('ArrowLeft'); // 返回 'MOVE_LEFT'
 *   resolveKeyboardAction(' '); // 返回 'DROP'
 *   resolveKeyboardAction('unknown'); // 返回 undefined
 *
 * @function resolveKeyboardAction
 * @param {string} key - KeyboardEvent.key，浏览器提供的按键标识
 * @returns {string | void} 对应游戏动作，如果按键无效则返回 undefined
 */
const resolveKeyboardAction = (key) => {
  // 空键值直接返回，避免无效处理
  if (!key) {
    return;
  }

  // 统一转换为小写，实现大小写不敏感的匹配
  const normalizedKey = key.toLowerCase();

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
 * - **键盘监听**：监听全局 keydown 事件，捕获用户按键
 * - **动作映射**：将物理按键映射为游戏语义动作（移动、旋转、暂停等）
 * - **输入屏蔽**：根据游戏状态（模式、控制器类型）智能屏蔽无效按键
 * - **视口适配**：监听窗口 resize 事件，通知游戏画布重新适配
 *
 * ## 设计说明
 *
 * - **事件委托**：通过 EventBus 派发 `dispatch:input` 事件，解耦输入处理与游戏逻辑
 * - **链式调用**：事件绑定方法返回 this，支持链式调用
 * - **状态感知**：根据 Store 中的游戏模式和控制方式动态决定按键是否响应
 *
 * ## 屏蔽规则
 *
 * 以下情况下的按键会被屏蔽（不产生游戏动作）：
 *
 * 1. 按键没有对应的动作映射
 * 2. 回放模式下按非 Enter 键（回放时只能按确认键）
 * 3. AI 控制且游戏进行中，按了 AI 不允许的操作键
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
    super(options);
    // 事件绑定在外部手动调用，保持初始化的灵活性
  }

  /**
   * ## 绑定游戏中键盘操作相关的事件
   *
   * 注册全局事件监听器：
   *
   * - `resize`：监听窗口大小变化，用于调整游戏画布尺寸
   * - `keydown`：监听键盘按键，处理游戏操作输入
   *
   * 使用箭头函数绑定方法，确保 `this` 指向当前实例。
   *
   * @example
   *   const keyboard = new KeyboardController(options);
   *   keyboard.addEventListeners(); // 开始监听键盘输入
   *
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  addEventListeners() {
    // 监听窗口大小变化，使用箭头函数保持 this 上下文
    globalThis.addEventListener('resize', this._onResize);
    // 监听键盘按下事件
    document.addEventListener('keydown', this._onKeydown);

    return this;
  }

  /**
   * ## 解除游戏中键盘操作相关的事件绑定
   *
   * 移除之前注册的所有事件监听器。 在组件销毁或不需要键盘控制时调用，避免内存泄漏。
   *
   * @example
   *   keyboard.removeEventListeners(); // 停止监听键盘输入
   *
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  removeEventListeners() {
    // 移除窗口大小变化监听
    globalThis.removeEventListener('resize', this._onResize);
    // 移除键盘按下监听
    document.removeEventListener('keydown', this._onKeydown);

    return this;
  }

  /**
   * ## 判断按键是否被屏蔽
   *
   * 根据当前游戏状态决定是否应该响应该按键。 这是输入系统的核心安全机制，防止在不适当时刻执行无效操作。
   *
   * 屏蔽场景详解：
   *
   * 1. **无效映射**：按键不在映射表中，无法转换为游戏动作
   * 2. **回放限制**：回放模式下只允许按确认键（Enter），防止干扰回放过程
   * 3. **AI 限制**：AI 控制时，玩家只能按 S 键切换控制器，其他操作由 AI 负责
   *
   * @private
   * @param {string} key - 按键名称（已小写化）
   * @returns {boolean} - 按键被屏蔽返回 true，否则返回 false
   */
  _isBlocked(key) {
    const { Store } = this;
    // 获取按键对应的动作指令
    const action = resolveKeyboardAction(key);
    // 获取当前游戏模式（playing、replay、game-over、menu 等）
    const mode = Store.getMode();
    // 获取当前控制器类型（player 或 ai）
    const controller = Store.getController();

    /*
     * 按键无效的场景判断：
     *
     * 1. 无法获取 action 指令名称：按键不在映射表中
     * 2. 回放状态，按了非 enter 键：回放时不允许操作，只有确认键用于结束回放
     * 3. AI 控制时，按了 AI 不允许的操作：AI 模式下玩家只能切换回手动控制
     */
    return (
      !action || // 场景1：无效按键
      (mode === 'replay' && key !== 'enter') || // 场景2：回放模式限制
      (controller === 'ai' && // 场景3：AI 控制限制
        mode === 'playing' &&
        !GAME.AI_ALLOWED_ACTIONS.includes(action))
    );
  }

  /**
   * ## resize 事件的功能函数
   *
   * 当浏览器窗口大小改变时触发。 通过 EventBus 发送 RESIZE 事件，通知游戏画布重新计算尺寸和布局。
   *
   * @private
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  _onResize = () => {
    const { Game } = this;
    // 获取当前游戏实例的 UI 事件标识
    const events = UIEvents(Game.id);
    // 派发窗口大小改变事件，通知游戏界面适配新尺寸
    this.emit(events.RESIZE);

    return this;
  };

  /**
   * ## keydown 事件的功能函数
   *
   * 当用户按下键盘按键时触发。 执行流程：
   *
   * 1. 获取并规范化按键名称
   * 2. 将按键映射为游戏动作指令
   * 3. 检查按键是否应该被屏蔽
   * 4. 通过 EventBus 派发输入事件
   *
   * @private
   * @param {Event} e - 键盘事件对象
   * @param {string} e.key - 按下的键名（如 'ArrowLeft'、' '、'a'）
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  _onKeydown = (e) => {
    const { Game } = this;
    // 获取按键名称并转换为小写，便于统一匹配
    const key = e.key?.toLowerCase();

    // 空键值直接返回，避免无效处理
    if (!key) {
      return this;
    }

    // 将物理按键映射为游戏语义动作
    const action = resolveKeyboardAction(key);

    // 检查该按键在当前游戏状态下是否应该被屏蔽
    if (this._isBlocked(key)) {
      return this; // 屏蔽按键，不产生任何效果
    }

    // 派发输入事件到全局事件总线，下游的 CommandDispatcher 会接收并处理该事件
    this.emit('dispatch:input', {
      device: 'keyboard', // 输入设备类型
      action, // 游戏动作指令
      payload: {
        Game, // 传递游戏实例，供后续处理使用
      },
    });

    return this;
  };
}

export default KeyboardController;
