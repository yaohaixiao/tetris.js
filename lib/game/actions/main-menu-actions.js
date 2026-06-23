import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # 主菜单（Main Menu State）输入动作映射表
 *
 * 用于处理主菜单界面（等级选择）中的用户输入。 主菜单是游戏启动后的等级选择界面，玩家在此选择 1-10 级 和确认进入难度选择界面。
 *
 * ## 支持的按键动作
 *
 * | 按键动作   | 触发方式          | 说明                         |
 * | ---------- | ----------------- | ---------------------------- |
 * | EXIT       | Escape / Back     | 退出主菜单，返回游戏模式选择 |
 * | LEVEL_1-10 | 数字键 1-9 / T    | 选择对应关卡等级             |
 * | CONFIRM    | Enter / Start / A | 确认等级，进入难度选择界面   |
 *
 * ## 设计特点
 *
 * - 每个 LEVEL_N 都是独立函数，直接发送 SELECT_LEVEL 事件
 * - 不直接修改 Store，通过事件系统解耦
 * - 每个 action 都包含防御性检查（Game 实例不存在则跳过）
 *
 * @constant {object} MAIN_MENU_ACTIONS
 */
const MAIN_MENU_ACTIONS = {
  /**
   * ## 退出主菜单
   *
   * 从等级选择界面退出，返回到游戏模式选择界面。 发送 engine:exit 事件通知 Engine 切换模式， 同时播放场景切换音效。
   *
   * ### 触发按键
   *
   * - 键盘：Escape
   * - 手柄：Back
   * - 触屏：BACK 按钮
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  EXIT: (payload) => {
    // 解构 Game 实例
    const Game = payload?.Game;

    // 防御性检查：Game 实例不存在则直接返回
    if (!Game) {
      return;
    }

    // 获取音频事件常量（全局）和引擎事件常量（全局）
    const AE = AudioEvents();
    const EE = EngineEvents();

    /** 1. 发送引擎退出事件。 Engine._onExit 收到后重置 Store 并以单人模式重新启动。 */
    Game.emit(EE.EXIT);

    /** 2. 播放场景切换音效。 */
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  },

  /**
   * ## 选择难度 1
   *
   * 发送 SELECT_LEVEL 事件，通知 GameRouter 更新等级为 1。
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_ONE: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 1 });
  },

  /**
   * ## 选择难度 2
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_TWO: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 2 });
  },

  /**
   * ## 选择难度 3
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_THREE: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 3 });
  },

  /**
   * ## 选择难度 4
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_FOUR: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 4 });
  },

  /**
   * ## 选择难度 5
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_FIVE: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 5 });
  },

  /**
   * ## 选择难度 6
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_SIX: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 6 });
  },

  /**
   * ## 选择难度 7
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_SEVEN: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 7 });
  },

  /**
   * ## 选择难度 8
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_EIGHT: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 8 });
  },

  /**
   * ## 选择难度 9
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_NINE: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 9 });
  },

  /**
   * ## 选择难度 10
   *
   * 通过 T 键触发。
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  LEVEL_TEN: (payload) => {
    const Game = payload?.Game;
    if (!Game) return;
    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_LEVEL, { level: 10 });
  },

  /**
   * ## 确认等级选择，进入难度选择界面
   *
   * 发送 SWITCH_TO_DIFFICULTY 事件， GameRouter
   * 收到后切换到难度选择界面（easy/normal/hard/expert）。
   *
   * ### 触发按键
   *
   * - 键盘：Enter
   * - 手柄：Start / A
   * - 触屏：START 按钮
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  CONFIRM: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    // 获取当前 Game 实例的事件常量
    const events = GameEvents(Game.id);

    // 发送切换到难度选择界面的事件
    Game.emit(events.SWITCH_TO_DIFFICULTY);
  },
};

export default MAIN_MENU_ACTIONS;
