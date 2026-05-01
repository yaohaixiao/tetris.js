/**
 * # Game Over 状态下的输入/动作映射表
 *
 * 用于定义在 Game Over 界面中， 用户输入（如确认键）对应的行为逻辑。
 *
 * 设计模式：
 *
 * - Key/Action Map（状态驱动输入系统）
 * - 由 InputRouter 或 StateMachine 调用
 *
 * @constant
 * @type {Object<string, Function>}
 */
const GAME_OVER_ACTIONS = {
  /**
   * 确认操作（例如：Enter / Space / OK）
   *
   * 作用：
   *
   * - 重置游戏状态
   * - 返回主菜单
   *
   * @param {object} _ - Action payload（当前未使用）
   * @param {object} game - 游戏控制模块
   */
  CONFIRM: (_, game) => {
    // 回到主菜单状态
    game.reset();
  },
};

export default GAME_OVER_ACTIONS;
