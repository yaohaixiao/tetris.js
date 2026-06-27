import OPTIONS from '@/lib/constants/options.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 退出游戏菜单的按键动作映射
 *
 * 定义在退出游戏菜单界面（exit-game）中，各按键对应的游戏动作。 Single 模式下按 ESC 键触发此菜单。
 *
 * ## 支持的按键动作
 *
 * | 按键动作  | 触发方式          | 说明               |
 * | --------- | ----------------- | ------------------ |
 * | MOVE_DOWN | ↓ / D-Pad 下      | 向下移动选择光标   |
 * | MOVE_UP   | ↑ / D-Pad 上      | 向上移动选择光标   |
 * | CONFIRM   | Enter / Start / A | 确认当前选择的选项 |
 *
 * ## 菜单选项
 *
 * | 索引 | 选项        | 事件    | 说明                        |
 * | ---- | ----------- | ------- | --------------------------- |
 * | 0    | RESUME GAME | RESUME  | 继续游戏，返回 playing 模式 |
 * | 1    | EXIT GAME   | GIVE_UP | 退出游戏，返回模式选择界面  |
 *
 * @constant {object} EXIT_GAME_ACTIONS
 */
const EXIT_GAME_ACTIONS = {
  /**
   * ## 向下移动选择光标
   *
   * 在退出游戏菜单界面中，将选择光标向下移动一位。 发送 UPDATE_EXIT_INDEX 事件，action 为 'DOWN'。
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
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.UPDATE_EXIT_INDEX, {
      action: 'DOWN',
    });
  },

  /**
   * ## 向上移动选择光标
   *
   * 在退出游戏菜单界面中，将选择光标向上移动一位。 发送 UPDATE_EXIT_INDEX 事件，action 为 'UP'。
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
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.UPDATE_EXIT_INDEX, {
      action: 'UP',
    });
  },

  /**
   * ## 确认选择
   *
   * 根据当前光标位置执行对应的操作。
   *
   * ### 执行流程
   *
   * 1. 从 Store 读取当前 exitIndex
   * 2. 从 EXIT_OPTIONS 获取对应的事件类型（RESUME 或 GIVE_UP）
   * 3. 发送对应事件：
   *
   *    - RESUME → _onResume → 恢复 playing 模式
   *    - GIVE_UP → _onGiveUp → engine:exit → 返回模式选择界面
   * 4. 播放场景切换音效
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
    const { Game } = payload;

    if (!Game) {
      return;
    }

    const { Store } = Game;

    // 根据当前光标位置获取对应的事件类型（RESUME 或 GIVE_UP）
    const { event } = OPTIONS.EXIT_OPTIONS[Store.getExitIndex()];

    const GE = GameEvents(Game.id);

    // 发送对应事件：RESUME 恢复游戏，GIVE_UP 退出到模式选择界面
    Game.emit(GE[event], { payload });
  },
};

export default EXIT_GAME_ACTIONS;
