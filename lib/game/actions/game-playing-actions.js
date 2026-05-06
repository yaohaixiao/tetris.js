import EventBus from '@/lib/core/event-bus';

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
  /** ## 向左移动 */
  MOVE_LEFT: () => {
    EventBus.emit('game:move', {
      ox: -1,
      oy: 0,
    });
  },

  /** ## 向右移动 */
  MOVE_RIGHT: () => {
    EventBus.emit('game:move', {
      ox: 1,
      oy: 0,
    });
  },

  /** ## 向下移动（软降） */
  MOVE_DOWN: () => {
    EventBus.emit('game:move', {
      ox: 0,
      oy: 1,
    });
  },

  /** ## 旋转方块 */
  ROTATE: () => {
    EventBus.emit('game:rotate');
  },

  /** ## 硬降（直接落地） */
  DROP: () => {
    EventBus.emit('game:drop');
  },

  /** ## 暂停 / 继续切换 */
  TOGGLE_PAUSE: () => {
    EventBus.emit('game:toggle:pause');
  },

  /** ## 重新开始游戏 */
  RESTART: () => {
    EventBus.emit('game:restart');
  },

  /**
   * ## 强制结束游戏
   *
   * 注意：直接调用 over 属于“全局副作用”
   */
  QUIT: () => {
    EventBus.emit('game:over');
  },

  /** ## 背景音乐开关 */
  TOGGLE_MUSIC: () => {
    EventBus.emit('game:toggle:bgm');
  },
};

export default GAME_PLAYING_ACTIONS;
