/**
 * # 难度选择菜单（Difficulty State）输入动作映射表
 *
 * 用于处理用户输入，例如：
 *
 * - 选择游戏难度（easy,normal,hard,expert）
 * - 开始游戏确认
 *
 * 当前设计特点：
 *
 * - 直接修改 game.state
 * - 每个 “难度” 独立函数
 *
 * 适用于：
 *
 * - 菜单 UI 状态机
 *
 * @constant
 * @type {Object<string, Function>}
 */
const DIFFICULT_ACTIONS = {
  /**
   * ## 选择难度 easy
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  EASY: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit(`game:${Game.id}:select:difficulty`, { difficulty: 'easy' });
  },

  /**
   * ## 选择难度 normal
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  NORMAL: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit(`game:${Game.id}:select:difficulty`, { difficulty: 'normal' });
  },

  /**
   * ## 选择难度 hard
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  HARD: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit(`game:${Game.id}:select:difficulty`, { difficulty: 'hard' });
  },

  /**
   * ## 选择难度 expert
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  EXPERT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit(`game:${Game.id}:select:difficulty`, { difficulty: 'expert' });
  },

  /**
   * ## 返回游戏等级选择
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  BACK: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit(`game:${Game.id}:switch:to:main:menu`);
  },

  /**
   * ## 确认开始游戏
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit(`game:${Game.id}:start`);
  },
};

export default DIFFICULT_ACTIONS;
