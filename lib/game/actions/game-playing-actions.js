import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 游戏进行中的输入动作映射表
 *
 * ============================================================
 *
 * 将玩家的键盘/手柄/触屏输入映射到对应的游戏事件。 每个 action 通过 GameEvents 发送事件到 GameRouter，
 * 由GameRouter 路由到 Game 实例的对应方法执行。
 *
 * ## 事件驱动架构
 *
 * 玩家输入 → GAME_PLAYING_ACTIONS[action](payload) → Game.emit(events.XXX, params)
 * → GameRouter._onXxx → Game.xxx()
 *
 * ## 支持的按键动作
 *
 * | 按键动作          | 触发方式     | 说明                            |
 * | :---------------- | :----------- | :------------------------------ |
 * | EXIT              | ESC          | 对战模式认输 / 单人模式退出菜单 |
 * | MOVE_LEFT         | ← / D-Pad 左 | 向左移动方块                    |
 * | MOVE_RIGHT        | → / D-Pad 右 | 向右移动方块                    |
 * | MOVE_DOWN         | ↓ / D-Pad 下 | 向下加速下落（软降）            |
 * | ROTATE            | ↑ / D-Pad 上 | 旋转方块                        |
 * | DROP              | 空格         | 硬降（直接落底）                |
 * | HOLD              | C            | 缓存方块到 Hold 区              |
 * | TOGGLE_PAUSED     | P / Y        | 暂停 / 继续切换                 |
 * | RESTART           | R            | 重新开始游戏                    |
 * | QUIT              | Q            | 强制结束游戏                    |
 * | TOGGLE_MUSIC      | M            | 背景音乐开关                    |
 * | SWITCH_CONTROLLER | S            | 切换控制者（human ↔ ai）        |
 *
 * ### EXIT 的特殊处理
 *
 * EXIT 根据游戏模式有不同的行为：
 *
 * - 对战模式：发送 SURRENDER 事件，触发认输流程
 * - 单人模式：发送 EXIT 事件，显示退出菜单
 *
 * @constant {object} GAME_PLAYING_ACTIONS
 */
const GAME_PLAYING_ACTIONS = {
  /**
   * 退出 / 认输。
   *
   * 对战模式下发送 SURRENDER 事件触发认输流程， 单人模式下发送 EXIT 事件显示退出菜单。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  EXIT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    if (Game.isVersus()) {
      // 对战模式：认输
      Game.emit(events.SURRENDER);
    } else {
      // 单人模式：退出到菜单
      Game.emit(events.EXIT);
    }
  },

  /**
   * 向左移动方块。
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
   * 向右移动方块。
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
   * 向下加速下落（软降）。
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
   * 尝试顺时针旋转当前方块，包含 SRS 墙踢检测。 O 块旋转后形状不变，跳过旋转。
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
   * 硬降（Hard Drop）。
   *
   * 将方块瞬间落到底部，触发锁定、消行检测和新方块生成。
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
   * 缓存方块（Hold）。
   *
   * 将当前活动方块存入 Hold 区，或与 Hold 区方块交换。 每个方块在一局游戏中只能被 Hold 一次。
   *
   * @param {object} payload - 按键事件传递的参数对象
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
   * 暂停 / 继续切换。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  TOGGLE_PAUSED: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.TOGGLE_PAUSED);
  },

  /**
   * 重新开始游戏。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  RESTART: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.RESTART);
  },

  /**
   * 强制结束游戏。
   *
   * 直接触发游戏结束流程，跳过正常消行/得分逻辑。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  QUIT: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.OVER);
  },

  /**
   * 背景音乐开关。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  TOGGLE_MUSIC: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.TOGGLE_BGM);
  },

  /**
   * 切换控制者（human ↔ ai）。
   *
   * 在单人模式下切换玩家控制和 AI 控制。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  SWITCH_CONTROLLER: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.SWITCH_CONTROLLER);
  },
};

export default GAME_PLAYING_ACTIONS;
