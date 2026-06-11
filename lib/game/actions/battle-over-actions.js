import { BattleEvents } from '@/lib/events/event-catalog.js';

const BATTLE_OVER_ACTIONS = {
  /**
   * 确认操作（例如：Enter / Space / OK）
   *
   * 作用：
   *
   * - 重置游戏状态
   * - 返回主菜单
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
