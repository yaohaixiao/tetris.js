import GAME from '@/lib/game/constants/game.js';
import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/** DAS/ARR 配置（单位：帧，60fps 下 1 帧 ≈ 16.67ms） */
const DAS_CONFIG = {
  DAS: 10, // 延迟 10 帧（≈167ms）后开始自动移动
  ARR: 2, // 之后每 2 帧（≈33ms）移动一次
};

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

  // ========== 缓存方块 ==========
  c: 'HOLD',

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
    this.initialize();
  }

  /**
   * ## 初始化 DAS/ARR 状态
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
      dasTimer: -1,
      arrTimer: 0,
      direction: 0,
      active: false,
    };
  }

  /**
   * ## 每帧更新 DAS/ARR（由 Engine.tick 驱动）
   *
   * - DAS 阶段：等待 DAS_CONFIG.DAS 帧后开始
   * - ARR 阶段：每 DAS_CONFIG.ARR 帧自动移动一次
   *
   * @returns {void}
   */
  update() {
    const { dasState, Game } = this;

    // 非键盘触发或方向归零，跳过
    if (!dasState.active || dasState.direction === 0) return;
    if (Game.Store.getMode() !== 'playing') return;

    // DAS 阶段：等待延迟
    if (dasState.dasTimer < DAS_CONFIG.DAS) {
      dasState.dasTimer++;
      return;
    }

    // ARR 阶段：每 ARR 帧触发一次
    if (dasState.arrTimer >= DAS_CONFIG.ARR) {
      dasState.arrTimer = 0;
      this.emit('dispatch:input', {
        device: 'keyboard',
        action: dasState.direction === -1 ? 'MOVE_LEFT' : 'MOVE_RIGHT',
        payload: { Game },
      });
    } else {
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
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
   */
  addEventListeners() {
    globalThis.addEventListener('resize', this._onResize);
    document.addEventListener('keydown', this._onKeydown);
    document.addEventListener('keyup', this._onKeyup);

    return this;
  }

  /**
   * ## 解除游戏中键盘操作相关的事件绑定
   *
   * 移除之前注册的所有事件监听器。
   *
   * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
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
   * 屏蔽场景：
   *
   * 1. 按键不在映射表中
   * 2. 回放模式下只允许按 Enter 键
   * 3. AI 控制时，只允许 AI_ALLOWED_ACTIONS 中的操作
   *
   * @private
   * @param {string} key - 按键名称（已小写化）
   * @returns {boolean} 按键被屏蔽返回 true，否则返回 false
   */
  _isBlocked(key) {
    const { Store, Game } = this;
    const action = resolveKeyboardAction(key);
    const mode = Store.getMode();
    const controller = Store.getController();

    return (
      !action ||
      (mode === 'replay' && key !== 'enter') ||
      (controller === 'ai' &&
        mode === 'playing' &&
        !GAME.AI_ALLOWED_ACTIONS.includes(action)) ||
      (Game.isVersus() && key === 'r')
    );
  }

  /**
   * ## resize 事件处理
   *
   * 当浏览器窗口大小改变时触发。
   *
   * @private
   * @returns {KeyboardController} - 返回 KeyboardController，支持链式方法调用
   */
  _onResize = () => {
    const { Game } = this;
    const events = UIEvents(Game.id);

    this.emit(events.RESIZE);

    return this;
  };

  /**
   * ## keydown 事件处理
   *
   * 当用户按下键盘按键时触发。 左右方向键会启动 DAS/ARR 自动重复移动。
   *
   * @private
   * @param {object} e - 键盘事件对象
   * @returns {KeyboardController} - 返回 KeyboardController，支持链式方法调用
   */
  _onKeydown = (e) => {
    const { Game, Store, Player } = this;
    const key = e.key?.toLowerCase();

    if (!key) {
      return this;
    }

    const action = resolveKeyboardAction(key);

    if (this._isBlocked(key) || !action) {
      return this;
    }

    // 对战模式，AI 玩家不响应按键
    if (Store.getMode() === 'playing' && Player.name === 'ai') {
      return this;
    }

    // 左右键：启动 DAS/ARR
    if (key === 'arrowleft') {
      this.dasState.direction = -1;
      this.dasState.dasTimer = 0;
      this.dasState.arrTimer = 0;
      this.dasState.active = true;
    } else if (key === 'arrowright') {
      this.dasState.direction = 1;
      this.dasState.dasTimer = 0;
      this.dasState.arrTimer = 0;
      this.dasState.active = true;
    }

    // 立即执行第一次移动
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
   * 当用户松开键盘按键时触发。 松开左右方向键会停止 DAS/ARR。
   *
   * @private
   * @param {object} e - 键盘事件对象
   * @returns {KeyboardController} - 返回 KeyboardController，支持链式方法调用
   */
  _onKeyup = (e) => {
    const key = e.key?.toLowerCase();

    if (
      (key === 'arrowleft' && this.dasState.direction === -1) ||
      (key === 'arrowright' && this.dasState.direction === 1)
    ) {
      this.dasState.direction = 0;
      this.dasState.dasTimer = -1;
      this.dasState.active = false;
    }

    return this;
  };
}

export default KeyboardController;
