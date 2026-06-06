import Base from '@/lib/core';

/**
 * # 默认触摸按键映射
 *
 * 在 playing 模式之外的其他模式（replay、game-over 等）使用此默认映射。 各模式可通过 `getActionMap()`
 * 覆盖特定按键的行为。
 *
 * @constant {object}
 */
const TOUCH_ACTION_MAP = {
  /** A 键：切换背景音乐 */
  A: 'TOGGLE_MUSIC',
  /** B 键：方块直接落底（硬降） */
  B: 'DROP',
  /** X 键：重新开始游戏 */
  X: 'RESTART',
  /** Y 键：暂停/继续游戏 */
  Y: 'TOGGLE_PAUSED',
  /** Start 键：确认操作 */
  START: 'CONFIRM',
  /** Hold 键：缓存方块 */
  HOLD: 'HOLD',
  /** Back 键：退出游戏 */
  BACK: 'QUIT',
  /** 十字键左：向左移动 */
  DPAD_LEFT: 'MOVE_LEFT',
  /** 十字键右：向右移动 */
  DPAD_RIGHT: 'MOVE_RIGHT',
  /** 十字键下：向下加速（软降） */
  DPAD_DOWN: 'MOVE_DOWN',
  /** 十字键上：旋转方块 */
  DPAD_UP: 'ROTATE',
};

/**
 * # 等级名称映射
 *
 * 主菜单选择等级时，DPAD 上下键切换的等级名称。 索引 0-9 对应 1-10 关。
 *
 * @constant {string[]}
 */
const LEVELS = [
  'ONE', // 第 1 关
  'TWO', // 第 2 关
  'THREE', // 第 3 关
  'FOUR', // 第 4 关
  'FIX', // 第 5 关（FIX 为拼写约定，等同于 FIVE）
  'SIX', // 第 6 关
  'SEVEN', // 第 7 关
  'EIGHT', // 第 8 关
  'NINE', // 第 9 关
  'TEN', // 第 10 关
];

/**
 * # 根据游戏模式获取按键映射
 *
 * 每个模式返回独立的映射对象，避免污染全局常量。
 *
 * @param {string} mode - 当前游戏模式
 * @param {number} level - 当前等级索引（0-9），用于 main-menu 模式
 * @returns {object} 按键到 action 的映射对象
 */
const getActionMap = (mode, level) => {
  switch (mode) {
    /**
     * 主菜单模式：
     *
     * - DPAD 上下键切换等级
     * - Start 键确认并进入难度选择
     */
    case 'main-menu': {
      return {
        DPAD_UP: `LEVEL_${LEVELS[level]}`,
        DPAD_DOWN: `LEVEL_${LEVELS[level]}`,
        START: 'CONFIRM',
      };
    }

    /**
     * 难度选择模式：
     *
     * - A/B/Y/X 分别对应 Easy/Normal/Hard/Expert
     * - Back 返回主菜单
     * - Start 确认难度并开始游戏
     */
    case 'difficulty': {
      return {
        A: 'EASY',
        B: 'NORMAL',
        Y: 'HARD',
        X: 'EXPERT',
        BACK: 'BACK',
        START: 'CONFIRM',
      };
    }

    /**
     * 游戏进行中模式：
     *
     * - A：切换音乐
     * - B：硬降
     * - X：重新开始
     * - Y：暂停/继续
     * - Back：退出游戏
     * - Hold：缓存方块
     * - DPAD：移动和旋转
     */
    case 'playing': {
      return {
        A: 'TOGGLE_MUSIC',
        B: 'DROP',
        X: 'RESTART',
        Y: 'TOGGLE_PAUSED',
        BACK: 'QUIT',
        HOLD: 'HOLD',
        DPAD_UP: 'ROTATE',
        DPAD_DOWN: 'MOVE_DOWN',
        DPAD_LEFT: 'MOVE_LEFT',
        DPAD_RIGHT: 'MOVE_RIGHT',
      };
    }

    /** 其他模式（replay、game-over 等）使用默认映射 */
    default: {
      return TOUCH_ACTION_MAP;
    }
  }
};

/**
 * # TouchController（触摸控制器）
 *
 * 将移动端 GameBoy 风格按钮的点击事件转换为游戏输入命令。 通过事件 `dispatch:input` 将触摸操作注入到命令队列中。
 *
 * ## 按键布局
 *
 *     ┌──────────────┐  ┌─────┐ ┌─────┐
 *     │    DPAD ↑    │  │  Y  │ │  X  │
 *     │ DPAD ← │ →   │  │  B  │ │  A  │
 *     │    DPAD ↓    │  └─────┘ └─────┘
 *     └──────────────┘
 *     ┌──────┐ ┌──────┐ ┌──────┐
 *     │ BACK │ │ HOLD │ │START │
 *     └──────┘ └──────┘ └──────┘
 *
 * ## 模式感知
 *
 * 根据当前游戏模式（main-menu / difficulty / playing）动态切换按键映射， 不同模式下同一按键可触发不同的游戏操作。
 *
 * @augments Base
 * @class TouchController
 */
class TouchController extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   * @param {object} options.Controls - DOM 元素 ID 配置
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Game - 游戏主实例
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化触摸控制器
   *
   * 获取所有按钮 DOM 元素的引用，绑定事件监听器。
   *
   * @returns {void}
   */
  initialize() {
    const { Controls, Player } = this;
    const { name, index } = Player;

    /**
     * ## 当前选择的等级索引（0-9）
     *
     * 在 main-menu 模式下通过 DPAD 上下键调整。
     *
     * @type {number}
     */
    this.level = 0;

    /** @type {HTMLElement} Back 返回按钮 */
    this.$back = document.querySelector(`#${name}-${index}-${Controls.back}`);
    /** @type {HTMLElement} Hold 缓存按钮 */
    this.$hold = document.querySelector(`#${name}-${index}-${Controls.hold}`);
    /** @type {HTMLElement} Start 开始按钮 */
    this.$start = document.querySelector(`#${name}-${index}-${Controls.start}`);

    /** @type {HTMLElement} DPAD 上键 */
    this.$up = document.querySelector(`#${name}-${index}-${Controls.up}`);
    /** @type {HTMLElement} DPAD 下键 */
    this.$down = document.querySelector(`#${name}-${index}-${Controls.down}`);
    /** @type {HTMLElement} DPAD 左键 */
    this.$left = document.querySelector(`#${name}-${index}-${Controls.left}`);
    /** @type {HTMLElement} DPAD 右键 */
    this.$right = document.querySelector(`#${name}-${index}-${Controls.right}`);

    /** @type {HTMLElement} A 按钮（红色） */
    this.$a = document.querySelector(`#${name}-${index}-${Controls.a}`);
    /** @type {HTMLElement} B 按钮（蓝色） */
    this.$b = document.querySelector(`#${name}-${index}-${Controls.b}`);
    /** @type {HTMLElement} X 按钮（红色） */
    this.$x = document.querySelector(`#${name}-${index}-${Controls.x}`);
    /** @type {HTMLElement} Y 按钮（蓝色） */
    this.$y = document.querySelector(`#${name}-${index}-${Controls.y}`);

    this.addEventsListeners();
  }

  /**
   * ## 分发触摸事件为游戏输入
   *
   * 根据当前游戏模式获取按键映射，将触摸按键转换为游戏 action， 通过 `dispatch:input` 事件注入到命令队列中。
   *
   * @param {string} key - 触摸按键标识（如 'A', 'DPAD_UP' 等）
   * @returns {void}
   */
  dispatchTouch(key) {
    const { Store, Game } = this;
    const mode = Store.getMode();

    /**
     * Main-menu 模式下 DPAD 上下键调整等级
     *
     * 等级范围 0-9，对应 LEVELS 数组的 1-10 关。
     */
    if (mode === 'main-menu') {
      if (key === 'DPAD_UP') {
        this.level = Math.min(this.level + 1, 9);
      } else if (key === 'DPAD_DOWN') {
        this.level = Math.max(this.level - 1, 0);
      }
    }

    // 根据当前模式和等级获取按键映射
    const actionMap = getActionMap(mode, this.level);
    const action = actionMap[key];

    // 有对应 action 时才发送事件
    if (action) {
      this.emit('dispatch:input', {
        /** 输入设备类型：触摸屏 */
        device: 'touch',
        /** 游戏动作指令 */
        action,
        /** 传递给命令处理器的参数 */
        payload: { Game },
      });
    }
  }

  /**
   * ## 绑定所有按钮的点击事件
   *
   * 为 DPAD（4 个方向）、ABXY（4 个按钮）、Start、Back 共 10 个按钮 绑定 click 事件监听器。
   *
   * @returns {void}
   */
  addEventsListeners() {
    this.$back.addEventListener('click', this._onControlTouch);
    this.$hold.addEventListener('click', this._onControlTouch);
    this.$start.addEventListener('click', this._onControlTouch);

    this.$up.addEventListener('click', this._onControlTouch);
    this.$down.addEventListener('click', this._onControlTouch);
    this.$left.addEventListener('click', this._onControlTouch);
    this.$right.addEventListener('click', this._onControlTouch);

    this.$a.addEventListener('click', this._onControlTouch);
    this.$b.addEventListener('click', this._onControlTouch);
    this.$x.addEventListener('click', this._onControlTouch);
    this.$y.addEventListener('click', this._onControlTouch);
  }

  /**
   * ## 移除所有按钮的点击事件
   *
   * 在组件销毁或切换输入模式时调用，防止内存泄漏。
   *
   * @returns {void}
   */
  removeEventListeners() {
    this.$back.removeEventListener('click', this._onControlTouch);
    this.$hold.removeEventListener('click', this._onControlTouch);
    this.$start.removeEventListener('click', this._onControlTouch);

    this.$up.removeEventListener('click', this._onControlTouch);
    this.$down.removeEventListener('click', this._onControlTouch);
    this.$left.removeEventListener('click', this._onControlTouch);
    this.$right.removeEventListener('click', this._onControlTouch);

    this.$a.removeEventListener('click', this._onControlTouch);
    this.$b.removeEventListener('click', this._onControlTouch);
    this.$x.removeEventListener('click', this._onControlTouch);
    this.$y.removeEventListener('click', this._onControlTouch);
  }

  /**
   * ## 处理按钮点击事件
   *
   * 从被点击元素的 `data-key` 属性中读取按键标识， 转为大写后调用 `dispatchTouch()` 分发。
   *
   * @private
   * @param {Event} evt - 点击事件对象
   * @returns {void}
   */
  _onControlTouch = (evt) => {
    const $element = evt.target;
    const { key } = $element.dataset;

    this.dispatchTouch(key.toUpperCase());
  };
}

export default TouchController;
