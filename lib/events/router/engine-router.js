import Base from '@/lib/core';
import { EngineEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：EngineRouter 引擎事件路由器
 *
 * ============================================================
 *
 * 负责订阅和分发引擎级别的全局事件， 包括模式切换、玩家配置更新、启动和退出。
 *
 * @augments Base
 * @class EngineRouter
 */
class EngineRouter extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅引擎事件
   *
   * 订阅全局 engine:* 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const events = EngineEvents();

    this.on(events.UPDATE_MODE, this._onUpdateMode);
    this.on(events.UPDATE_PLAYERS, this._onUpdatePlayers);
    this.on(events.START, this._onStart);
    this.on(events.EXIT, this._onExit);
  }

  /**
   * ## unsubscribe：取消订阅引擎事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const events = EngineEvents();

    this.off(events.UPDATE_MODE, this._onUpdateMode);
    this.off(events.UPDATE_PLAYERS, this._onUpdatePlayers);
    this.off(events.START, this._onStart);
    this.off(events.EXIT, this._onExit);
  }

  /*
   * ============================================================
   * 事件处理器
   * ============================================================
   */

  /**
   * ## _onUpdateMode：处理模式更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.mode - 游戏模式
   * @returns {void}
   */
  _onUpdateMode = (payload) => {
    const { Engine } = this;
    Engine.Store.setMode(payload.mode);
  };

  /**
   * ## _onUpdatePlayers：处理玩家配置更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string[]} payload.players - 玩家名称数组
   * @returns {void}
   */
  _onUpdatePlayers = (payload) => {
    const { Engine } = this;
    Engine.Store.setPlayers(payload.players);
  };

  /**
   * ## _onStart：处理启动事件（模式切换重启动）
   *
   * 销毁当前所有子系统，使用新的配置重新启动引擎。 退出模式时强制切换为单人模式。
   *
   * @private
   * @param {object} [options={}] - 事件参数. Default is `{}`
   * @param {boolean} [options.isRelaunch=true] - 是否为模式切换重启动. Default is `true`
   * @returns {void}
   */
  _onStart = (options = {}) => {
    const { Engine } = this;
    const { isRelaunch = true } = options;

    // 深拷贝当前 Store 状态
    const cloned = structuredClone({
      ...Engine.Store.getState(),
      isRelaunch,
    });

    // 退出模式时强制切换为单人模式
    if (!isRelaunch) {
      cloned.Mode = 'single';
    }

    // 销毁并重新启动
    Engine.destroy();
    Engine.launch(cloned);
  };

  /**
   * ## _onExit：处理退出事件
   *
   * 从对战模式退出到单人模式选择界面。
   *
   * @private
   * @returns {void}
   */
  _onExit = () => {
    const { Engine } = this;

    // 重置 Store 状态到默认值
    Engine.Store.reset();

    // 以单人模式重新启动
    this._onStart({ isRelaunch: false, Mode: 'single' });
  };
}

export default EngineRouter;
