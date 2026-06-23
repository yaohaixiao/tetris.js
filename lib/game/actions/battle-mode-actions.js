import OPTIONS from '@/lib/constants/options.js';
import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # 对战模式选择界面的按键动作映射
 *
 * 定义在对战模式选择界面（Battle Mode Select）中， 各按键对应的游戏动作。与主菜单的 ACTION_MAP 类似，
 * 但仅包含模式选择所需的有限操作。
 *
 * ## 支持的按键动作
 *
 * | 按键动作  | 触发方式          | 说明                         |
 * | --------- | ----------------- | ---------------------------- |
 * | MOVE_DOWN | ↓ / D-Pad 下      | 向下移动选择光标             |
 * | MOVE_UP   | ↑ / D-Pad 上      | 向上移动选择光标             |
 * | BACK      | Back / Q          | 返回单人模式选择界面         |
 * | CONFIRM   | Enter / Start / A | 确认当前选择的模式并启动游戏 |
 *
 * ## 设计说明
 *
 * - 每个 action 都是一个纯函数，接收 payload 参数
 * - Payload 中包含 Game 实例引用，用于发送事件
 * - 不直接操作 Store，而是通过事件系统解耦
 *
 * @constant {object} BATTLE_MODE_ACTIONS
 */
const BATTLE_MODE_ACTIONS = {
  /**
   * ## 向下移动选择光标
   *
   * 在对战模式选择界面中，将选择光标向下移动一位。 发送 UPDATE_BATTLE_INDEX 事件，action 为 'DOWN'。
   *
   * ### 触发按键
   *
   * - 键盘：↓（方向键下）
   * - 手柄：D-Pad 下
   * - 触屏：D-Pad 下按钮
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  MOVE_DOWN: (payload) => {
    // 解构 Game 实例
    const Game = payload?.Game;

    // 防御性检查：Game 实例不存在则直接返回
    if (!Game) {
      return;
    }

    // 获取当前 Game 实例的事件常量（带命名空间隔离）
    const events = GameEvents(Game.id);

    /** 发送光标下移事件。 GameRouter 收到事件后更新 Store 中的 battleIndex， 并通过 UI 事件通知界面重新渲染选择高亮。 */
    Game.emit(events.UPDATE_BATTLE_INDEX, {
      action: 'DOWN',
    });
  },

  /**
   * ## 向上移动选择光标
   *
   * 在对战模式选择界面中，将选择光标向上移动一位。 发送 UPDATE_BATTLE_INDEX 事件，action 为 'UP'。
   *
   * ### 触发按键
   *
   * - 键盘：↑（方向键上）
   * - 手柄：D-Pad 上
   * - 触屏：D-Pad 上按钮
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  MOVE_UP: (payload) => {
    // 解构 Game 实例
    const Game = payload?.Game;

    // 防御性检查：Game 实例不存在则直接返回
    if (!Game) {
      return;
    }

    // 获取当前 Game 实例的事件常量（带命名空间隔离）
    const events = GameEvents(Game.id);

    /** 发送光标上移事件。 GameRouter 收到事件后更新 Store 中的 battleIndex， 并通过 UI 事件通知界面重新渲染选择高亮。 */
    Game.emit(events.UPDATE_BATTLE_INDEX, {
      action: 'UP',
    });
  },

  /**
   * ## 返回单人模式选择界面
   *
   * 从对战模式选择界面返回到单人模式选择界面。 发送 SWITCH_TO_GAME_MODE 事件。
   *
   * ### 触发按键
   *
   * - 键盘：Q / Backspace
   * - 手柄：Back
   * - 触屏：BACK 按钮
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  BACK: (payload) => {
    // 解构 Game 实例
    const Game = payload?.Game;

    // 防御性检查：Game 实例不存在则直接返回
    if (!Game) {
      return;
    }

    // 获取当前 Game 实例的事件常量（带命名空间隔离）
    const events = GameEvents(Game.id);

    /** 发送切换游戏模式事件。 Engine 收到事件后切换到单人模式（Mode = 'single'）。 */
    Game.emit(events.SWITCH_TO_GAME_MODE);
  },

  /**
   * ## 确认选择并启动对战
   *
   * 确认当前光标所在的对战模式选项，更新玩家配置并启动游戏。
   *
   * ### 执行流程
   *
   * 1. 从 Store 读取当前 battleIndex
   * 2. 根据 battleIndex 从 BATTLE_OPTIONS 获取对应的 players 配置
   * 3. 发送 UPDATE_PLAYERS 事件更新玩家列表
   * 4. 发送 START 事件启动游戏
   * 5. 播放场景切换音效
   *
   * ### 触发按键
   *
   * - 键盘：Enter / Space
   * - 手柄：Start / A
   * - 触屏：START 按钮
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  CONFIRM: (payload) => {
    // 解构 Game 实例
    const { Game } = payload;

    // 防御性检查：Game 实例不存在则直接返回
    if (!Game) {
      return;
    }

    // 解构 Game 的 Store
    const { Store } = Game;

    /**
     * 获取当前光标选中的对战模式对应的玩家配置。
     *
     * OPTIONS.BATTLE_OPTIONS 是一个数组，每个元素包含：
     *
     * - Players：玩家名称数组（如 ['human', 'ai'] 或 ['human', 'human']）
     *
     * Store.getBattleIndex() 返回当前光标位置的索引。
     */
    const { players } = OPTIONS.BATTLE_OPTIONS[Store.getBattleIndex()];

    // 获取音频事件常量（全局）
    const AE = AudioEvents();
    // 获取引擎事件常量（全局）
    const EE = EngineEvents();

    /** 1. 更新玩家配置。 Engine 收到事件后更新 Store 中的 Players， 并重新初始化 Game 实例。 */
    Game.emit(EE.UPDATE_PLAYERS, { players });

    /** 2. 启动游戏。 Engine 收到事件后执行 launch 流程， 初始化棋盘、加载最高分、启动游戏循环。 */
    Game.emit(EE.START);

    /** 3. 播放场景切换音效。 与主菜单切换到游戏中相同的音效。 */
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  },
};

export default BATTLE_MODE_ACTIONS;
