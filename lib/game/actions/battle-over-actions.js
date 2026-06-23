import {
  AudioEvents,
  BattleEvents,
  EngineEvents,
} from '@/lib/events/event-catalog.js';

const BATTLE_OVER_ACTIONS = {
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

    const events = BattleEvents();

    Game.emit(events.RESET, { from: Game });
  },
};

export default BATTLE_OVER_ACTIONS;
