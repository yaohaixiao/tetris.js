import OPTIONS from '@/lib/constants/options.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 退出游戏菜单的按键动作映射
 *
 * ============================================================
 *
 * 定义在退出游戏菜单界面（exit-game）中，各按键对应的游戏动作。 Single 模式下按 ESC 键触发此菜单。
 *
 * ## 支持的按键动作
 *
 * | 按键动作  | 触发方式          | 说明               |
 * | :-------- | :---------------- | :----------------- |
 * | MOVE_DOWN | ↓ / D-Pad 下      | 向下移动选择光标   |
 * | MOVE_UP   | ↑ / D-Pad 上      | 向上移动选择光标   |
 * | CONFIRM   | Enter / Start / A | 确认当前选择的选项 |
 *
 * ## 菜单选项
 *
 * | 索引 | 选项        | 事件    | 说明                        |
 * | :--- | :---------- | :------ | :-------------------------- |
 * | 0    | RESUME GAME | RESUME  | 继续游戏，返回 playing 模式 |
 * | 1    | EXIT GAME   | GIVE_UP | 退出游戏，返回模式选择界面  |
 *
 * @constant {object} EXIT_GAME_ACTIONS
 */
const EXIT_GAME_ACTIONS = {
  /**
   * 向下移动选择光标。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_DOWN: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.UPDATE_EXIT_INDEX, { action: 'DOWN' });
  },

  /**
   * 向上移动选择光标。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_UP: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.UPDATE_EXIT_INDEX, { action: 'UP' });
  },

  /**
   * 确认选择。
   *
   * 根据当前光标位置执行对应操作：
   *
   * - RESUME：恢复 playing 模式
   * - GIVE_UP：退出到模式选择界面
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const { Game } = payload;

    if (!Game) {
      return;
    }

    const { Store } = Game;

    // 根据当前光标位置获取对应的事件类型（RESUME 或 GIVE_UP）
    const { event } = OPTIONS.EXIT_OPTIONS[Store.getExitIndex()];

    const GE = GameEvents(Game.id);
    Game.emit(GE[event], { payload });
  },
};

export default EXIT_GAME_ACTIONS;
