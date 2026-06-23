import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';
import OPTIONS from '@/lib/constants/options.js';

/**
 * # 游戏模式选择界面的按键动作映射
 *
 * 定义在游戏模式选择界面（Game Mode Select）中， 各按键对应的游戏动作。这是游戏启动后的第一个界面， 玩家在此选择单人模式或对战模式。
 *
 * ## 支持的按键动作
 *
 * | 按键动作  | 触发方式          | 说明                             |
 * | --------- | ----------------- | -------------------------------- |
 * | MOVE_DOWN | ↓ / D-Pad 下      | 向下移动选择光标                 |
 * | MOVE_UP   | ↑ / D-Pad 上      | 向上移动选择光标                 |
 * | CONFIRM   | Enter / Start / A | 确认当前选择的模式，进入对应界面 |
 *
 * ## 设计说明
 *
 * - 每个 action 都是一个纯函数，接收 payload 参数
 * - Payload 中包含 Game 实例引用，用于发送事件
 * - 不直接操作 Store，而是通过事件系统解耦
 * - 选择单人模式 → 切换到主菜单
 * - 选择对战模式 → 切换到对战模式选择界面
 *
 * @constant {object} GAME_MODE_ACTIONS
 */
const GAME_MODE_ACTIONS = {
  /**
   * ## 向下移动选择光标
   *
   * 在游戏模式选择界面中，将选择光标向下移动一位。 发送 UPDATE_MODE_INDEX 事件，action 为 'DOWN'。
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

    /** 发送光标下移事件。 GameRouter 收到事件后更新 Store 中的 modeIndex， 并通过 UI 事件通知界面重新渲染选择高亮。 */
    Game.emit(events.UPDATE_MODE_INDEX, {
      action: 'DOWN',
    });
  },

  /**
   * ## 向上移动选择光标
   *
   * 在游戏模式选择界面中，将选择光标向上移动一位。 发送 UPDATE_MODE_INDEX 事件，action 为 'UP'。
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

    /** 发送光标上移事件。 GameRouter 收到事件后更新 Store 中的 modeIndex， 并通过 UI 事件通知界面重新渲染选择高亮。 */
    Game.emit(events.UPDATE_MODE_INDEX, {
      action: 'UP',
    });
  },

  /**
   * ## 确认选择并进入对应模式
   *
   * 确认当前光标所在的游戏模式，根据选择进入不同流程：
   *
   * - **单人模式（single）**：更新玩家配置 → 切换到主菜单
   * - **对战模式（versus）**：切换到对战模式选择界面
   *
   * ### 执行流程（单人模式）
   *
   * 1. 从 Store 读取当前 modeIndex
   * 2. 从 MODE_OPTIONS 获取对应的 mode
   * 3. 发送 UPDATE_MODE 事件更新游戏模式
   * 4. 发送 UPDATE_PLAYERS 事件更新玩家列表
   * 5. 发送 SWITCH_TO_MAIN_MENU 事件切换到主菜单
   * 6. 播放场景切换音效
   *
   * ### 执行流程（对战模式）
   *
   * 1. 从 Store 读取当前 modeIndex
   * 2. 从 MODE_OPTIONS 获取对应的 mode
   * 3. 发送 UPDATE_MODE 事件更新游戏模式
   * 4. 发送 SWITCH_TO_BATTLE_MODE 事件切换到对战模式选择
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

    // 解构配置常量和 Game 的 Store
    const { MODE_OPTIONS, BATTLE_OPTIONS } = OPTIONS;
    const { Store, id } = Game;

    /**
     * 获取当前光标选中的游戏模式。
     *
     * MODE_OPTIONS 是一个数组，每个元素包含：
     *
     * - Mode：游戏模式（'single' | 'versus'）
     *
     * Store.getModeIndex() 返回当前光标位置的索引。
     */
    const { mode } = MODE_OPTIONS[Store.getModeIndex()];

    /**
     * 获取当前对战模式对应的玩家配置。
     *
     * BATTLE_OPTIONS 是一个数组，每个元素包含：
     *
     * - Players：玩家名称数组（如 ['human', 'ai'] 或 ['human', 'human']）
     *
     * Store.getBattleIndex() 返回当前光标位置的索引。
     */
    const { players } = BATTLE_OPTIONS[Store.getBattleIndex()];

    // 获取各事件常量
    const AE = AudioEvents();
    const GE = GameEvents(id);
    const EE = EngineEvents();

    /** 1. 更新游戏模式。 Engine 收到事件后更新 Store 中的 Mode（'single' | 'versus'）。 */
    Game.emit(EE.UPDATE_MODE, { mode });

    /** 2. 播放场景切换音效。 与菜单切换相同的音效。 */
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });

    /**
     * 3. 根据模式进入不同流程。
     *
     * - Versus：进入对战模式选择界面（选择 HUMAN vs AI 或 HUMAN vs HUMAN）
     * - Single：更新玩家配置并切换到主菜单（选择等级和难度）
     */
    if (mode === 'versus') {
      // 切换到对战模式选择界面
      Game.emit(GE.SWITCH_TO_BATTLE_MODE);
    } else {
      // 更新玩家列表（单人模式固定为 ['human', 'ai']）
      Game.emit(EE.UPDATE_PLAYERS, { players });
      // 切换到主菜单（等级选择界面）
      Game.emit(GE.SWITCH_TO_MAIN_MENU);
    }
  },
};

export default GAME_MODE_ACTIONS;
