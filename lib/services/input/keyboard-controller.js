import GAME from '@/lib/game/constants/game.js';
import Base from '@/lib/core';
import { GameEvents, UIEvents } from '@/lib/events/event-catalog.js';

/**
 * DAS/ARR 配置（单位：帧，60fps 下 1 帧 ≈ 16.67ms）。
 *
 * - DAS（Delayed Auto Shift）：长按后延迟多少帧开始自动移动
 * - ARR（Auto Repeat Rate）：自动移动开始后每隔多少帧移动一次
 *
 * @constant {object}
 */
const DAS_CONFIG = {
  DAS: 10, // 延迟 10 帧（≈167ms）
  ARR: 2, // 之后每 2 帧（≈33ms）移动一次
};

/**
 * 键盘按键到游戏动作的映射表。
 *
 * 将用户按下的物理按键映射为游戏内部的动作指令。 支持小写字母、数字、方向键和特殊键。
 *
 * ### 映射分类
 *
 * - 移动旋转：方向键控制方块的移动、旋转和下落
 * - 游戏控制：S/M/P/R/Q/C 控制游戏状态
 * - 关卡选择：数字键 1-9 和 T 键选择不同等级
 * - 难度选择：E/N/H/X 选择游戏难度
 * - 界面导航：B/Enter/Escape 用于返回、确认和退出
 *
 * ### 动态映射说明
 *
 * 部分按键的动作会根据游戏模式动态变化：
 *
 * - ArrowUp（↑）： game-mode / battle-mode 时为 MOVE_UP， playing 时为 ROTATE
 *
 * @constant {Object<string, string>}
 */
const KEYBOARDS_ACTION_MAP = {
  // 强制退出/返回
  escape: 'EXIT',

  // 方块操作
  arrowleft: 'MOVE_LEFT',
  arrowright: 'MOVE_RIGHT',
  arrowdown: 'MOVE_DOWN',
  arrowup: 'ROTATE',
  ' ': 'DROP',

  // 游戏控制
  s: 'SWITCH_CONTROLLER',
  m: 'TOGGLE_MUSIC',
  p: 'TOGGLE_PAUSED',
  r: 'RESTART',
  q: 'QUIT',

  // 缓存方块
  c: 'HOLD',

  // 关卡选择
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

  // 难度选择
  e: 'EASY',
  n: 'NORMAL',
  h: 'HARD',
  x: 'EXPERT',

  // 界面导航
  b: 'BACK',
  enter: 'CONFIRM',
};

/**
 * ============================================================
 *
 * # 将键盘输入映射为游戏动作
 *
 * ============================================================
 *
 * 接收浏览器键盘事件的 key 属性， 经过规范化和映射后返回对应的游戏动作指令字符串。
 *
 * ## 动态映射逻辑
 *
 * 根据当前游戏模式动态修改 ArrowUp 的行为：
 *
 * - 选择界面：映射为 MOVE_UP（移动光标）
 * - 游戏中：映射为 ROTATE（旋转方块）
 *
 * ## 大小写不敏感
 *
 * 所有按键统一转为小写进行匹配。
 *
 * ## 示例
 *
 * ```javascript
 * resolveKeyboardAction('ArrowLeft'); // 'MOVE_LEFT'
 * resolveKeyboardAction(' '); // 'DROP'
 * resolveKeyboardAction('unknown'); // undefined
 * ```
 *
 * @function resolveKeyboardAction
 * @param {string} key - KeyboardEvent.key 按键标识
 * @param {string} mode - 当前游戏模式
 * @returns {string | void} 对应的游戏动作，无效按键返回 undefined
 */
const resolveKeyboardAction = (key, mode) => {
  if (!key) {
    return;
  }

  // 统一转换为小写
  const normalizedKey = key.toLowerCase();

  // 根据游戏模式动态调整 ArrowUp 的行为
  if (mode === 'game-mode' || mode === 'battle-mode' || mode === 'exit-game') {
    KEYBOARDS_ACTION_MAP.arrowup = 'MOVE_UP';
  } else if (mode === 'playing') {
    KEYBOARDS_ACTION_MAP.arrowup = 'ROTATE';
  }

  return KEYBOARDS_ACTION_MAP[normalizedKey];
};

/**
 * ============================================================
 *
 * # 模块：KeyboardController 键盘控制器
 *
 * ============================================================
 *
 * 负责监听和处理所有键盘输入事件， 将用户的按键操作转换为游戏动作指令。
 *
 * ## 核心功能
 *
 * - 键盘监听：监听全局 keydown/keyup 事件
 * - 动作映射：将物理按键映射为游戏语义动作
 * - DAS/ARR：长按左右键时延迟后自动重复移动
 * - 输入屏蔽：根据游戏状态智能屏蔽无效按键
 * - 视口适配：监听窗口 resize 事件
 *
 * ## DAS/ARR 机制
 *
 * 当玩家按住左/右方向键不放时：
 *
 * 1. 第一帧：立即移动一次
 * 2. 等待 DAS（10 帧 ≈ 167ms）
 * 3. 之后每 ARR（2 帧 ≈ 33ms）自动移动一次
 *
 * ## 屏蔽规则
 *
 * 以下情况的按键会被屏蔽：
 *
 * 1. 按键没有对应的动作映射
 * 2. 回放模式下按非 Enter 键
 * 3. AI 控制且游戏进行中，按了非允许的操作键
 * 4. 对战模式下特定按键被禁用： R 键始终禁用，AI 玩家禁用 M/P/C， 人类玩家禁用 S，P2 禁用 P， P2 在 playing
 *    模式下所有键盘输入被禁用
 *
 * @augments Base
 * @class KeyboardController
 */
class KeyboardController extends Base {
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
   * ## initialize：初始化 DAS/ARR 状态
   *
   * @returns {void}
   */
  initialize() {
    /**
     * DAS/ARR 状态。
     *
     * | 字段      | 说明                                 |
     * | :-------- | :----------------------------------- |
     * | dasTimer  | DAS 计时器（帧数），-1 表示未触发    |
     * | arrTimer  | ARR 计时器（帧数）                   |
     * | direction | 当前 DAS 方向（-1 左 / 1 右 / 0 无） |
     * | active    | 是否由键盘触发的 DAS                 |
     *
     * @type {object}
     */
    this.dasState = {
      dasTimer: -1,
      arrTimer: 0,
      direction: 0,
      active: false,
    };

    /**
     * 是否禁用键盘输入。
     *
     * 对战模式 P2（Player.index === 1）设为 true， 防止键盘同时控制两个 Game 实例。
     *
     * @type {boolean}
     */
    this.disabled = false;
  }

  /**
   * ## setDisabled：设置键盘禁用状态
   *
   * @param {boolean} disabled - True 禁用，false 启用
   * @returns {KeyboardController} 返回自身，支持链式调用
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    return this;
  }

  /**
   * ## update：每帧更新 DAS/ARR
   *
   * 在游戏主循环中每帧调用， 管理长按方向键时的自动重复移动。
   *
   * @returns {void}
   */
  update() {
    if (this.disabled) {
      return;
    }

    const { dasState, Game } = this;

    if (!dasState.active || dasState.direction === 0) {
      return;
    }

    if (Game.Store.getMode() !== 'playing') {
      return;
    }

    // DAS 阶段：等待延迟
    if (dasState.dasTimer < DAS_CONFIG.DAS) {
      dasState.dasTimer++;
      return;
    }

    // ARR 阶段：自动重复移动
    if (dasState.arrTimer >= DAS_CONFIG.ARR) {
      dasState.arrTimer = 0;
      const events = GameEvents(Game.id);
      this.emit(events.DISPATCH_INPUT, {
        device: 'keyboard',
        action: dasState.direction === -1 ? 'MOVE_LEFT' : 'MOVE_RIGHT',
        payload: { Game },
      });
    } else {
      dasState.arrTimer++;
    }
  }

  /**
   * ## addEventListeners：绑定键盘事件
   *
   * 注册全局事件监听器：resize、keydown、keyup。
   *
   * @returns {KeyboardController} 返回自身，支持链式调用
   */
  addEventListeners() {
    globalThis.addEventListener('resize', this._onResize);
    document.addEventListener('keydown', this._onKeydown);
    document.addEventListener('keyup', this._onKeyup);

    return this;
  }

  /**
   * ## removeEventListeners：解绑键盘事件
   *
   * 移除之前注册的所有事件监听器。
   *
   * @returns {KeyboardController} 返回自身，支持链式调用
   */
  removeEventListeners() {
    globalThis.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._onKeydown);
    document.removeEventListener('keyup', this._onKeyup);

    return this;
  }

  /**
   * ## _isBlocked：判断按键是否被屏蔽
   *
   * 根据当前游戏状态决定是否应该响应该按键。
   *
   * @private
   * @param {string} key - 按键名称（已小写化）
   * @returns {boolean} 被屏蔽返回 true
   */
  _isBlocked(key) {
    const { Store, Game } = this;
    const { Player } = Game;
    const mode = Store.getMode();
    const action = resolveKeyboardAction(key, mode);
    const controller = Store.getController();

    return (
      !action ||
      (mode === 'replay' && key !== 'enter' && key !== 'escape') ||
      (controller === 'ai' &&
        mode === 'playing' &&
        !GAME.AI_ALLOWED_ACTIONS.includes(action)) ||
      (Game.isVersus() &&
        (key === 'r' ||
          (Player.name === 'ai' &&
            (key === 'm' || key === 'p' || key === 'c')) ||
          (Player.name === 'human' &&
            (key === 's' ||
              (key === 'p' && Player.index === 1) ||
              (mode === 'playing' && Player.index === 1)))))
    );
  }

  /**
   * ## _onResize：resize 事件处理
   *
   * 窗口大小改变时发送 RESIZE 事件通知 UI 层。
   *
   * @private
   * @returns {KeyboardController} 返回自身，支持链式调用
   */
  _onResize = () => {
    const { Game } = this;
    const events = UIEvents(Game.id);

    this.emit(events.RESIZE);

    return this;
  };

  /**
   * ## _onKeydown：keydown 事件处理
   *
   * 按下键盘按键时触发。 左右方向键启动 DAS/ARR，所有按键立即执行第一次动作。
   *
   * @private
   * @param {object} e - 键盘事件对象
   * @returns {KeyboardController} 返回自身，支持链式调用
   */
  _onKeydown = (e) => {
    const { Game, Store, Player } = this;
    const key = e.key?.toLowerCase();

    if (!key || this.disabled) {
      return this;
    }

    const action = resolveKeyboardAction(key);

    if (this._isBlocked(key) || !action) {
      return this;
    }

    if (Store.getMode() === 'playing' && Player.name === 'ai') {
      return this;
    }

    // 左右方向键：启动 DAS/ARR
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
    const events = GameEvents(Game.id);
    this.emit(events.DISPATCH_INPUT, {
      device: 'keyboard',
      action,
      payload: { Game },
    });

    return this;
  };

  /**
   * ## _onKeyup：keyup 事件处理
   *
   * 松开左右方向键时停止 DAS/ARR。 只有当松开的按键与当前 DAS 方向匹配时才停止。
   *
   * @private
   * @param {object} e - 键盘事件对象
   * @returns {KeyboardController} 返回自身，支持链式调用
   */
  _onKeyup = (e) => {
    const key = e.key?.toLowerCase();

    // 松开的按键与当前 DAS 方向匹配时停止
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
