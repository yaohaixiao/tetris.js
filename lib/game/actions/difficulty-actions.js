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
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  EASY: (_, { Game }) => {
    Game.selectDifficulty('easy');
  },

  /**
   * ## 选择难度 normal
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  NORMAL: (_, { Game }) => {
    Game.selectDifficulty('normal');
  },

  /**
   * ## 选择难度 hard
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  HARD: (_, { Game }) => {
    Game.selectDifficulty('hard');
  },

  /**
   * ## 选择难度 expert
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  EXPERT: (_, { Game }) => {
    Game.selectDifficulty('expert');
  },

  /**
   * ## 确认开始游戏
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  CONFIRM: (_, { Game }) => {
    Game.start();
  },
};

export default DIFFICULT_ACTIONS;
