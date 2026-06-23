import {
  AudioEvents,
  EngineEvents,
  GameEvents,
} from '@/lib/events/event-catalog.js';
import OPTIONS from '@/lib/constants/options.js';

const GAME_MODE_ACTIONS = {
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

    Game.emit(events.UPDATE_MODE_INDEX, {
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

    Game.emit(events.UPDATE_MODE_INDEX, {
      action: 'UP',
    });
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

    const { MODE_OPTIONS, BATTLE_OPTIONS } = OPTIONS;
    const { Store, id } = Game;
    const { mode } = MODE_OPTIONS[Store.getModeIndex()];
    const { players } = BATTLE_OPTIONS[Store.getBattleIndex()];
    const AE = AudioEvents();
    const GE = GameEvents(id);
    const EE = EngineEvents();

    Game.emit(EE.UPDATE_MODE, { mode });

    if (mode === 'versus') {
      Game.emit(GE.SWITCH_TO_BATTLE_MODE);
    } else {
      Game.emit(EE.UPDATE_PLAYERS, { players });
      Game.emit(EE.START);
      Game.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
    }
  },
};

export default GAME_MODE_ACTIONS;
