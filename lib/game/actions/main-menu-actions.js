import EventBus from '@/lib/core/event-bus';

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
   * 通过 EventBus 发布消息，解耦对外部模块的依赖
   */
  LEVEL_ONE: () => {
    EventBus.emit('game:select:level', { level: 1 });
  },

  /** ## 选择难度 2 */
  LEVEL_TWO: () => {
    EventBus.emit('game:select:level', { level: 2 });
  },

  /** ## 选择难度 3 */
  LEVEL_THREE: () => {
    EventBus.emit('game:select:level', { level: 3 });
  },

  /** ## 选择难度 4 */
  LEVEL_FOUR: () => {
    EventBus.emit('game:select:level', { level: 4 });
  },

  /** ## 选择难度 5 */
  LEVEL_FIVE: () => {
    EventBus.emit('game:select:level', { level: 5 });
  },

  /** ## 选择难度 6 */
  LEVEL_SIX: () => {
    EventBus.emit('game:select:level', { level: 6 });
  },

  /** ## 选择难度 7 */
  LEVEL_SEVEN: () => {
    EventBus.emit('game:select:level', { level: 7 });
  },

  /** ## 选择难度 8 */
  LEVEL_EIGHT: () => {
    EventBus.emit('game:select:level', { level: 8 });
  },

  /** ## 选择难度 9 */
  LEVEL_NINE: () => {
    EventBus.emit('game:select:level', { level: 9 });
  },

  /** ## 选择难度 10 */
  LEVEL_TEN: () => {
    EventBus.emit('game:select:level', { level: 10 });
  },

  /** ## 进入难度选择界面 */
  CONFIRM: () => {
    EventBus.emit('ui:update:mode', { mode: 'difficulty' });
    EventBus.emit('game:switch:difficulty');
  },
};

export default MAIN_MENU_ACTIONS;
