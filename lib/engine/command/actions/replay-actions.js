const REPLAY_ACTIONS = {
  /**
   * ## 向左移动
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  MOVE_LEFT: (_, game) => {
    game.move(-1, 0);
  },

  /**
   * ## 向右移动
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  MOVE_RIGHT: (_, game) => {
    game.move(1, 0);
  },

  /**
   * ## 向下移动（软降）
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  MOVE_DOWN: (_, game) => {
    game.move(0, 1);
  },

  /**
   * ## 旋转方块
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  ROTATE: (_, game) => {
    game.rotate();
  },

  /**
   * ## 硬降（直接落地）
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  DROP: (_, game) => {
    game.drop();
  },

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

export default REPLAY_ACTIONS;
