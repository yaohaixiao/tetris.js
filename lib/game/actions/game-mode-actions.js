import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';
import OPTIONS from '@/lib/constants/options.js';

/**
 * ============================================================
 *
 * # 游戏模式选择界面的按键动作映射
 *
 * ============================================================
 *
 * 定义在游戏模式选择界面中，各按键对应的游戏动作。 这是游戏启动后的第一个界面，玩家在此选择单人模式或对战模式。
 *
 * ## 支持的按键动作
 *
 * | 按键动作  | 触发方式          | 说明                             |
 * | :-------- | :---------------- | :------------------------------- |
 * | MOVE_DOWN | ↓ / D-Pad 下      | 向下移动选择光标                 |
 * | MOVE_UP   | ↑ / D-Pad 上      | 向上移动选择光标                 |
 * | CONFIRM   | Enter / Start / A | 确认当前选择的模式，进入对应界面 |
 *
 * ## 设计说明
 *
 * - 每个 action 都是纯函数，通过事件系统解耦
 * - 选择单人模式 → 切换到主菜单
 * - 选择对战模式 → 切换到对战模式选择界面
 *
 * @constant {object} GAME_MODE_ACTIONS
 */
const GAME_MODE_ACTIONS = {
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
    Game.emit(events.UPDATE_MODE_INDEX, { action: 'DOWN' });
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
    Game.emit(events.UPDATE_MODE_INDEX, { action: 'UP' });
  },

  /**
   * 确认选择并进入对应模式。
   *
   * 根据当前光标位置选择单人模式或对战模式：
   *
   * - 单人模式：更新玩家配置 → 切换到主菜单
   * - 对战模式：切换到对战模式选择界面
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const { Game } = payload;

    if (!Game) {
      return;
    }

    const { MODE_OPTIONS, BATTLE_OPTIONS } = OPTIONS;
    const { Store, id } = Game;

    // 获取当前光标选中的游戏模式
    const { mode } = MODE_OPTIONS[Store.getModeIndex()];

    // 获取当前对战模式对应的玩家配置
    const { players } = BATTLE_OPTIONS[Store.getBattleIndex()];

    const AE = AudioEvents();
    const GE = GameEvents(id);
    const EE = EngineEvents();

    // 更新游戏模式
    Game.emit(EE.UPDATE_MODE, { mode });

    // 播放场景切换音效
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });

    if (mode === 'versus') {
      // 切换到对战模式选择界面
      Game.emit(GE.SWITCH_TO_BATTLE_MODE);
    } else {
      // 更新玩家列表（单人模式固定为 ['human', 'ai']）
      Game.emit(EE.UPDATE_PLAYERS, { players });
      // 切换到主菜单（等级选择界面）
      Game.emit(GE.SWITCH_TO_MAIN_MENU);
    }
  },
};

export default GAME_MODE_ACTIONS;
