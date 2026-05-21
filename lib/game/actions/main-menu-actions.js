import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 主菜单（Main Menu State）输入动作映射表
 *
 * 用于处理主菜单界面中的用户输入，例如：
 *
 * - 选择游戏难度（Level 1 ~ 10）
 * - 开始游戏确认
 *
 * 当前设计特点：
 *
 * - 直接修改 game.state
 * - 每个 level 独立函数
 *
 * 适用于：
 *
 * - 菜单 UI 状态机
 *
 * @constant
 * @type {Object<string, Function>}
 */
const MAIN_MENU_ACTIONS = {
  /**
   * ## 选择难度 1
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_ONE: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 1 });
  },

  /**
   * ## 选择难度 2
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_TWO: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 2 });
  },

  /**
   * ## 选择难度 3
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_THREE: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 3 });
  },

  /**
   * ## 选择难度 4
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_FOUR: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 4 });
  },

  /**
   * ## 选择难度 5
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_FIVE: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 5 });
  },

  /**
   * ## 选择难度 6
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_SIX: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 6 });
  },

  /**
   * ## 选择难度 7
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_SEVEN: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 7 });
  },

  /**
   * ## 选择难度 8
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_EIGHT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 8 });
  },

  /**
   * ## 选择难度 9
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_NINE: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 9 });
  },

  /**
   * ## 选择难度 10
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  LEVEL_TEN: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SELECT_LEVEL, { level: 10 });
  },

  /**
   * ## 进入难度选择界面
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.SWITCH_TO_DIFFICULTY);
  },
};

export default MAIN_MENU_ACTIONS;
