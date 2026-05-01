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
 * - 直接修改 engine.state
 * - 每个 level 独立函数（存在重复代码）
 *
 * 适用于：
 *
 * - 菜单 UI 状态机
 * - 非 gameplay 状态逻辑
 *
 * @constant
 * @type {Object<string, Function>}
 */
const MAIN_MENU_ACTIONS = {
  /**
   * ## 选择难度 1
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_ONE: (_, game) => {
    game.selectLevel(1);
  },

  /**
   * ## 选择难度 2
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_TWO: (_, game) => {
    game.selectLevel(2);
  },

  /**
   * ## 选择难度 3
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_THREE: (_, game) => {
    game.selectLevel(3);
  },

  /**
   * ## 选择难度 4
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_FOUR: (_, game) => {
    game.selectLevel(4);
  },

  /**
   * ## 选择难度 5
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_FIVE: (_, game) => {
    game.selectLevel(5);
  },

  /**
   * ## 选择难度 6
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_SIX: (_, game) => {
    game.selectLevel(6);
  },

  /**
   * ## 选择难度 7
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_SEVEN: (_, game) => {
    game.selectLevel(7);
  },

  /**
   * ## 选择难度 8
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_EIGHT: (_, game) => {
    game.selectLevel(8);
  },

  /**
   * ## 选择难度 9
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_NINE: (_, game) => {
    game.selectLevel(9);
  },

  /**
   * ## 选择难度 10
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  LEVEL_TEN: (_, game) => {
    game.selectLevel(10);
  },

  /**
   * ## 确认开始游戏
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  CONFIRM: (_, game) => {
    game.start();
  },
};

export default MAIN_MENU_ACTIONS;
