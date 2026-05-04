const REPLAY_ACTIONS = {
  /**
   * ## 向左移动
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  MOVE_LEFT: (_, { Game }) => {
    Game.move(-1, 0);
  },

  /**
   * ## 向右移动
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  MOVE_RIGHT: (_, { Game }) => {
    Game.move(1, 0);
  },

  /**
   * ## 向下移动（软降）
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  MOVE_DOWN: (_, { Game }) => {
    Game.move(0, 1);
  },

  /**
   * ## 旋转方块
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  ROTATE: (_, { Game }) => {
    Game.rotate();
  },

  /**
   * ## 硬降（直接落地）
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  DROP: (_, { Game }) => {
    Game.drop();
  },

  /**
   * ## 自动下落
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  AUTO_TICK: (_, { Game }) => {
    Game.tick();
  },

  /**
   * 确认操作（例如：Enter / Space / OK）
   *
   * 作用：
   *
   * - 重置游戏状态
   * - 返回主菜单
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  CONFIRM: (_, { Game }) => {
    // 回到主菜单状态
    Game.reset();
  },
};

export default REPLAY_ACTIONS;
