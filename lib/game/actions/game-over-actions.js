import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # Game Over 状态的输入动作映射表
 *
 * ============================================================
 *
 * 用于定义在 Game Over 界面中， 用户输入（如确认键）对应的行为逻辑。
 *
 * @constant {Object<string, Function>}
 */
const GAME_OVER_ACTIONS = {
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
   * 确认操作（重置游戏状态，返回主菜单）。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.RESET);
  },
};

export default GAME_OVER_ACTIONS;
