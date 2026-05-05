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
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_ONE: (_, { Game }) => {
    Game.selectLevel(1);
  },

  /**
   * ## 选择难度 2
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_TWO: (_, { Game }) => {
    Game.selectLevel(2);
  },

  /**
   * ## 选择难度 3
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_THREE: (_, { Game }) => {
    Game.selectLevel(3);
  },

  /**
   * ## 选择难度 4
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_FOUR: (_, { Game }) => {
    Game.selectLevel(4);
  },

  /**
   * ## 选择难度 5
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_FIVE: (_, { Game }) => {
    Game.selectLevel(5);
  },

  /**
   * ## 选择难度 6
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_SIX: (_, { Game }) => {
    Game.selectLevel(6);
  },

  /**
   * ## 选择难度 7
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_SEVEN: (_, { Game }) => {
    Game.selectLevel(7);
  },

  /**
   * ## 选择难度 8
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_EIGHT: (_, { Game }) => {
    Game.selectLevel(8);
  },

  /**
   * ## 选择难度 9
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_NINE: (_, { Game }) => {
    Game.selectLevel(9);
  },

  /**
   * ## 选择难度 10
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  LEVEL_TEN: (_, { Game }) => {
    Game.selectLevel(10);
  },

  /**
   * ## 进入难度选择界面
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  CONFIRM: (_, { Game }) => {
    Game.switchToDifficulty();
  },
};

export default MAIN_MENU_ACTIONS;
