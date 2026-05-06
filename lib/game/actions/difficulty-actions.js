import EventBus from '@/lib/core/event-bus';

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
  /** ## 选择难度 easy */
  EASY: () => {
    EventBus.emit('game:select:difficulty', { difficulty: 'easy' });
  },

  /** ## 选择难度 normal */
  NORMAL: () => {
    EventBus.emit('game:select:difficulty', { difficulty: 'normal' });
  },

  /** ## 选择难度 hard */
  HARD: () => {
    EventBus.emit('game:select:difficulty', { difficulty: 'hard' });
  },

  /** ## 选择难度 expert */
  EXPERT: () => {
    EventBus.emit('game:select:difficulty', { difficulty: 'expert' });
  },

  /** ## 返回游戏等级选择 */
  BACK: () => {
    EventBus.emit('game:switch:to:main:menu');
  },

  /** ## 确认开始游戏 */
  CONFIRM: () => {
    EventBus.emit('game:start');
  },
};

export default DIFFICULT_ACTIONS;
