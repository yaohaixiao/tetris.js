/**
 * # 游戏进行中（Playing State）的输入动作映射表
 *
 * 用于将用户输入（如键盘操作） 映射到具体的游戏行为逻辑。
 *
 * 当前设计：
 *
 * - 直接调用 game logic（move / rotate / drop）
 * - 强耦合 engine.state
 *
 * 适用阶段：
 *
 * - 小型游戏
 * - 原型阶段
 * - 非 replay / AI 系统
 *
 * @constant
 * @type {Object<string, Function>}
 */
const GAME_PLAYING_ACTIONS = {
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
   * ## 重新开始游戏
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  RESTART: (_, { Game }) => {
    Game.restart();
  },

  /**
   * ## 强制结束游戏
   *
   * 注意：直接调用 over 属于“全局副作用”
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  QUIT: (_, { Game }) => {
    Game.over();
  },

  /**
   * ## 暂停 / 继续切换
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   */
  TOGGLE_PAUSE: (_, { Game }) => {
    Game.togglePause();
  },

  /**
   * ## 背景音乐开关
   *
   * @param {object} _ Action payload（当前未使用）
   * @param {object} context - 执行上下文
   * @param {object} context.Game - 游戏控制模块
   * @param {object} context.Audio - 音频控制模块
   */
  TOGGLE_MUSIC: (_, { Game, Audio }) => {
    const level = Game.store.getLevel();
    Audio.toggleBGM(level);
  },
};

export default GAME_PLAYING_ACTIONS;
