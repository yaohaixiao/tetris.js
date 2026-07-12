import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 难度选择菜单的输入动作映射表
 *
 * ============================================================
 *
 * 用于处理难度选择界面中的用户输入， 包括选择游戏难度（easy/normal/hard/expert）和确认开始游戏。
 *
 * @constant {Object<string, Function>}
 */
const DIFFICULT_ACTIONS = {
  /**
   * 选择难度 EASY。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  EASY: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_DIFFICULTY, { difficulty: 'easy' });
  },

  /**
   * 选择难度 NORMAL。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  NORMAL: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_DIFFICULTY, { difficulty: 'normal' });
  },

  /**
   * 选择难度 HARD。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  HARD: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_DIFFICULTY, { difficulty: 'hard' });
  },

  /**
   * 选择难度 EXPERT。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  EXPERT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.SELECT_DIFFICULTY, { difficulty: 'expert' });
  },

  /**
   * 返回游戏等级选择。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  BACK: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.SWITCH_TO_MAIN_MENU);
  },

  /**
   * 确认开始游戏。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.START);
  },
};

export default DIFFICULT_ACTIONS;
