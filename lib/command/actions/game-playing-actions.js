import move from '@/lib/game/logic/move.js';
import rotate from '@/lib/game/logic/rotate.js';
import drop from '@/lib/game/logic/drop.js';
import restartGame from '@/lib/game/core/restart-game.js';
import gameOver from '@/lib/game/core/game-over.js';
import togglePause from '@/lib/game/core/toggle-pause.js';
import toggleBGM from '@/lib/audio/toggle-bgm.js';

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
   * @param {object} engine - 游戏引擎（实例）
   */
  MOVE_LEFT: (_, engine) => {
    move(-1, 0, engine.state);
  },

  /**
   * ## 向右移动
   *
   * @param {object} _ 参数对象
   * @param {object} engine - 游戏引擎（实例）
   */
  MOVE_RIGHT: (_, engine) => {
    move(1, 0, engine.state);
  },

  /**
   * ## 向下移动（软降）
   *
   * @param {object} _ 参数对象
   * @param {object} engine - 游戏引擎（实例）
   */
  MOVE_DOWN: (_, engine) => {
    move(0, 1, engine.state);
  },

  /**
   * ## 硬降（直接落地）
   *
   * @param {object} _ 参数对象
   * @param {object} engine - 游戏引擎（实例）
   */
  DROP: (_, engine) => {
    drop(engine.state);
  },

  /**
   * ## 旋转方块
   *
   * @param {object} _ 参数对象
   * @param {object} engine - 游戏引擎（实例）
   */
  ROTATE: (_, engine) => {
    rotate(engine.state);
  },

  /**
   * ## 重新开始游戏
   *
   * @param {object} _ 参数对象
   * @param {object} engine - 游戏引擎（实例）
   */
  RESTART: (_, engine) => {
    restartGame(engine.state);
  },

  /**
   * ## 强制结束游戏
   *
   * 注意：直接调用 gameOver 属于“全局副作用”
   */
  QUIT: () => {
    gameOver();
  },

  /** ## 暂停 / 继续切换 */
  TOGGLE_PAUSE: () => {
    togglePause();
  },

  /** ## 背景音乐开关 */
  TOGGLE_MUSIC: () => {
    toggleBGM();
  },
};

export default GAME_PLAYING_ACTIONS;
