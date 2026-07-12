import {
  AudioEvents,
  BattleEvents,
  EngineEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 对战结束界面的输入动作映射表
 *
 * ============================================================
 *
 * 用于处理对战结束界面（battle-over）中的用户输入。
 *
 * @constant {Object<string, Function>}
 */
const BATTLE_OVER_ACTIONS = {
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
    const { Game } = payload;

    if (!Game) {
      return;
    }

    const events = BattleEvents();
    Game.emit(events.RESET, { from: Game });
  },
};

export default BATTLE_OVER_ACTIONS;
