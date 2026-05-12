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
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_LEFT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:block:move', {
      ox: -1,
      oy: 0,
    });
  },

  /**
   * ## 向右移动
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_RIGHT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:block:move', {
      ox: 1,
      oy: 0,
    });
  },

  /**
   * ## 向下移动（软降）
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_DOWN: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:block:move', {
      ox: 0,
      oy: 1,
    });
  },

  /**
   * ## 旋转方块
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  ROTATE: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:block:rotate');
  },

  /**
   * ## 硬降（直接落地）
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  DROP: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:block:drop');
  },

  /**
   * ## 暂停 / 继续切换
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  TOGGLE_PAUSED: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:toggle:paused');
  },

  /**
   * ## 重新开始游戏
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  RESTART: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:restart');
  },

  /**
   * ## 强制结束游戏
   *
   * 注意：直接调用 over 属于“全局副作用”
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  QUIT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:over');
  },

  /**
   * ## 背景音乐开关
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  TOGGLE_MUSIC: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    Game.emit('game:toggle:bgm');
  },
};

export default GAME_PLAYING_ACTIONS;
