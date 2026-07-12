import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 回放动作映射表
 *
 * ============================================================
 *
 * 将回放中录制的动作名称映射到对应的游戏操作。 每个动作通过事件系统发送到 Game 实例执行。
 *
 * @constant {object} REPLAY_ACTIONS
 */
const REPLAY_ACTIONS = {
  /**
   * 向左移动。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_LEFT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.BLOCK_MOVE, { ox: -1, oy: 0 });
  },

  /**
   * 向右移动。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_RIGHT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.BLOCK_MOVE, { ox: 1, oy: 0 });
  },

  /**
   * 向下移动（软降）。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_DOWN: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.BLOCK_MOVE, { ox: 0, oy: 1 });
  },

  /**
   * 旋转方块。
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
   * 硬降（直接落地）。
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
   * 缓存方块。
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
   * 自动下落。
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
   * 确认操作（重置游戏状态，返回主菜单）。
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
   * 退出主菜单。
   *
   * 发送 engine:exit 事件通知 Engine 切换模式， 同时播放场景切换音效。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  EXIT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const AE = AudioEvents();
    const EE = EngineEvents();

    Game.emit(EE.EXIT);
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  },
};

export default REPLAY_ACTIONS;
