import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

const REPLAY_ACTIONS = {
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

    const events = GameEvents(Game.id);

    Game.emit(events.BLOCK_MOVE, {
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

    const events = GameEvents(Game.id);

    Game.emit(events.BLOCK_MOVE, {
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

    const events = GameEvents(Game.id);

    Game.emit(events.BLOCK_MOVE, {
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

    const events = GameEvents(Game.id);

    Game.emit(events.BLOCK_ROTATE);
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

    const events = GameEvents(Game.id);

    Game.emit(events.BLOCK_DROP);
  },

  /**
   * ## 缓存方块
   *
   * @param {object} payload - 命令参数
   */
  HOLD: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.BLOCK_HOLD);
  },

  /**
   * ## 自动下落
   *
   * @param {object} payload - 命令参数
   */
  AUTO_TICK: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.BLOCK_TICK, payload);
  },

  /**
   * 确认操作
   *
   * 作用：
   *
   * - 重置游戏状态
   * - 返回主菜单
   *
   * @param {object} payload - 命令参数
   */
  CONFIRM: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.RESET);
  },

  /**
   * ## 退出主菜单
   *
   * 从等级选择界面退出，返回到游戏模式选择界面。 发送 engine:exit 事件通知 Engine 切换模式， 同时播放场景切换音效。
   *
   * ### 触发按键
   *
   * - 键盘：Escape
   * - 手柄：Back
   * - 触屏：BACK 按钮
   *
   * @param {object} payload - 按键事件传递的参数对象
   * @param {object} payload.Game - 游戏主实例
   * @returns {void}
   */
  EXIT: (payload) => {
    // 解构 Game 实例
    const Game = payload?.Game;

    // 防御性检查：Game 实例不存在则直接返回
    if (!Game) {
      return;
    }

    // 获取音频事件常量（全局）和引擎事件常量（全局）
    const AE = AudioEvents();
    const EE = EngineEvents();

    /** 1. 发送引擎退出事件。 Engine._onExit 收到后重置 Store 并以单人模式重新启动。 */
    Game.emit(EE.EXIT);

    /** 2. 播放场景切换音效。 */
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  },
};

export default REPLAY_ACTIONS;
