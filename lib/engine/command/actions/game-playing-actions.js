import toggleBGM from 'lib/audio/toggle-bgm.js';

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
   * ## 硬降（直接落地）
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  DROP: (_, game) => {
    game.drop();
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
   * ## 重新开始游戏
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  RESTART: (_, game) => {
    game.restart();
  },

  /**
   * ## 强制结束游戏
   *
   * 注意：直接调用 over 属于“全局副作用”
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  QUIT: (_, game) => {
    game.over();
  },

  /**
   * ## 暂停 / 继续切换
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  TOGGLE_PAUSE: (_, game) => {
    game.togglePause();
  },

  /**
   * ## 背景音乐开关
   *
   * @param {object} _ 参数对象
   * @param {object} game - 游戏控制模块
   */
  TOGGLE_MUSIC: (_, game) => {
    const level = game.store.getLevel();
    toggleBGM(level);
  },
};

export default GAME_PLAYING_ACTIONS;
