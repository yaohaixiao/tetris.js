import startGame from '@/lib/game/core/start-game.js';
import selectLevel from '@/lib/game/actions/select-level.js';

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
  /** ## 选择难度 1 */
  LEVEL_ONE: () => {
    selectLevel(1);
  },

  LEVEL_TWO: () => {
    selectLevel(2);
  },

  LEVEL_THREE: () => {
    selectLevel(3);
  },

  LEVEL_FOUR: () => {
    selectLevel(4);
  },

  LEVEL_FIVE: () => {
    selectLevel(5);
  },

  LEVEL_SIX: () => {
    selectLevel(6);
  },

  LEVEL_SEVEN: () => {
    selectLevel(7);
  },

  LEVEL_EIGHT: () => {
    selectLevel(8);
  },

  LEVEL_NINE: () => {
    selectLevel(9);
  },

  LEVEL_TEN: () => {
    selectLevel(10);
  },

  /**
   * ## 确认开始游戏
   *
   * @param {object} _ 参数对象
   * @param {object} engine - 游戏引擎（实例）
   */
  CONFIRM: (_, engine) => {
    startGame(engine.state);
  },
};

export default MAIN_MENU_ACTIONS;
