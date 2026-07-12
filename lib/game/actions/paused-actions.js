import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 暂停状态的输入动作映射表
 *
 * ============================================================
 *
 * 用于处理游戏暂停时的输入逻辑， 当前仅支持"继续 / 取消暂停"操作。
 *
 * @constant {Object<string, Function>}
 */
const PAUSED_ACTIONS = {
  /**
   * 切换暂停状态（继续游戏）。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  TOGGLE_PAUSED: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.TOGGLE_PAUSED);
  },
};

export default PAUSED_ACTIONS;
