import OPTIONS from '@/lib/constants/options.js';
import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 对战模式选择界面的按键动作映射
 *
 * ============================================================
 *
 * 定义在对战模式选择界面中，各按键对应的游戏动作。
 *
 * ## 支持的按键动作
 *
 * | 按键动作  | 触发方式          | 说明                         |
 * | :-------- | :---------------- | :--------------------------- |
 * | MOVE_DOWN | ↓ / D-Pad 下      | 向下移动选择光标             |
 * | MOVE_UP   | ↑ / D-Pad 上      | 向上移动选择光标             |
 * | BACK      | Back / Q          | 返回单人模式选择界面         |
 * | CONFIRM   | Enter / Start / A | 确认当前选择的模式并启动游戏 |
 *
 * @constant {object} BATTLE_MODE_ACTIONS
 */
const BATTLE_MODE_ACTIONS = {
  /**
   * 向下移动选择光标。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_DOWN: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.UPDATE_BATTLE_INDEX, { action: 'DOWN' });
  },

  /**
   * 向上移动选择光标。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_UP: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.UPDATE_BATTLE_INDEX, { action: 'UP' });
  },

  /**
   * 返回单人模式选择界面。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  BACK: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);
    Game.emit(events.SWITCH_TO_GAME_MODE);
  },

  /**
   * 确认选择并启动对战。
   *
   * 根据当前光标位置获取玩家配置， 更新玩家列表并启动游戏。
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const { Game } = payload;

    if (!Game) {
      return;
    }

    const { Store } = Game;

    // 获取当前光标选中的对战模式对应的玩家配置
    const { players } = OPTIONS.BATTLE_OPTIONS[Store.getBattleIndex()];

    const AE = AudioEvents();
    const EE = EngineEvents();

    // 更新玩家配置
    Game.emit(EE.UPDATE_PLAYERS, { players });

    // 启动游戏
    Game.emit(EE.START);

    // 播放场景切换音效
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  },
};

export default BATTLE_MODE_ACTIONS;
