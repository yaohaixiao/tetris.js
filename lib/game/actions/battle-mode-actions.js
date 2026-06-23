import OPTIONS from '@/lib/constants/options.js';
import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';

const BATTLE_MODE_ACTIONS = {
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

    Game.emit(events.UPDATE_BATTLE_INDEX, {
      action: 'DOWN',
    });
  },

  /**
   * ## 旋转方块
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  MOVE_UP: (payload) => {
    const Game = payload?.Game;

    if (!Game) {
      return;
    }

    const events = GameEvents(Game.id);

    Game.emit(events.UPDATE_BATTLE_INDEX, {
      action: 'UP',
    });
  },

  /**
   * ## 旋转方块
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
   * 确认操作（例如：Enter / Space / OK）
   *
   * 作用：
   *
   * - 重置游戏状态
   * - 返回主菜单
   *
   * @param {object} payload - 按键事件传递的参数对象
   */
  CONFIRM: (payload) => {
    const { Game } = payload;

    if (!Game) {
      return;
    }

    const { Store } = Game;
    const { players } = OPTIONS.BATTLE_OPTIONS[Store.getBattleIndex()];
    const AE = AudioEvents();
    const EE = EngineEvents();

    Game.emit(EE.UPDATE_PLAYERS, { players });
    Game.emit(EE.START);
    Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  },
};

export default BATTLE_MODE_ACTIONS;
