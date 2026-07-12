import Base from '@/lib/core';
import { AIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：AIRouter AI 事件路由器
 *
 * ============================================================
 *
 * 负责处理所有 AI 相关的事件路由， 将 AI 启动/停止事件分发到 AIController 实例。
 *
 * @augments Base
 * @class AIRouter
 */
class AIRouter extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅 AI 事件
   *
   * 监听 ai:<uuid>:start 和 ai:<uuid>:stop 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const events = AIEvents(Game.id);
    this.on(events.START, this._onStart);
    this.on(events.STOP, this._onStop);
  }

  /**
   * ## unsubscribe：取消订阅 AI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = AIEvents(Game.id);
    this.off(events.START, this._onStart);
    this.off(events.STOP, this._onStop);
  }

  /**
   * ## _onStart：处理 AI 启动事件
   *
   * @private
   * @returns {void}
   */
  _onStart = () => {
    const { AI } = this;
    AI.start();
  };

  /**
   * ## _onStop：处理 AI 停止事件
   *
   * @private
   * @returns {void}
   */
  _onStop = () => {
    const { AI } = this;
    AI.stop();
  };
}

export default AIRouter;
