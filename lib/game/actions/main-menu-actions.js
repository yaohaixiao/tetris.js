import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 主菜单输入动作映射表
 *
 * ============================================================
 *
 * 用于处理主菜单界面（等级选择）中的用户输入。 玩家在此选择 1-10 级和确认进入难度选择界面。
 *
 * ## 支持的按键动作
 *
 * | 按键动作   | 触发方式          | 说明                         |
 * | :--------- | :---------------- | :--------------------------- |
 * | EXIT       | Escape / Back     | 退出主菜单，返回游戏模式选择 |
 * | LEVEL_1-10 | 数字键 1-9 / T    | 选择对应关卡等级             |
 * | CONFIRM    | Enter / Start / A | 确认等级，进入难度选择界面   |
 *
 * @constant {object} MAIN_MENU_ACTIONS
 */
const MAIN_MENU_ACTIONS = {
  /**
   * 退出主菜单。
   *
   * 发送 engine:exit 事件通知 Engine 切换模式， 同时播放场景切换音效。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  EXIT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const AE = AudioEvents();
    const EE = EngineEvents();

    Game.emit(EE.EXIT);
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  },

  /**
   * 选择等级 1。
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
   * 选择等级 2。
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
   * 选择等级 3。
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
   * 选择等级 4。
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
   * 选择等级 5。
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
   * 选择等级 6。
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
   * 选择等级 7。
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
   * 选择等级 8。
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
   * 选择等级 9。
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
   * 选择等级 10（通过 T 键触发）。
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
   * 确认等级选择，进入难度选择界面。
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
