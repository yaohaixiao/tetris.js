import Base from '@/lib/core';
import { AnimationsEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：AnimationsRouter 动画系统事件路由器
 *
 * ============================================================
 *
 * 负责处理动画系统相关的事件路由， 将清空事件分发到 AnimationSystem 实例。
 *
 * @augments Base
 * @class AnimationsRouter
 */
class AnimationsRouter extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅动画系统事件
   *
   * 监听 animations:<uuid>:clear 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const events = AnimationsEvents(Game.id);
    this.on(events.CLEAR, this._onClear);
  }

  /**
   * ## unsubscribe：取消订阅动画系统事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = AnimationsEvents(Game.id);
    this.off(events.CLEAR, this._onClear);
  }

  /**
   * ## _onClear：处理清空事件
   *
   * @private
   * @returns {void}
   */
  _onClear = () => {
    const { Animations } = this;
    Animations.clear();
  };
}

export default AnimationsRouter;
