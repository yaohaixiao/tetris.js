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
 * ## 核心职责
 *
 * | 职责     | 说明                                                 |
 * | :------- | :--------------------------------------------------- |
 * | 事件订阅 | 在 subscribe() 中注册动画系统事件的处理器            |
 * | 事件取消 | 在 unsubscribe() 中移除所有已注册的处理器            |
 * | 事件路由 | 将清空事件路由到 AnimationSystem 实例                |
 * | 参数转换 | 从事件 payload 中提取参数，调用 AnimationSystem 方法 |
 *
 * ## 处理的动画系统事件
 *
 * | 事件名                  | 触发时机       | 处理器    | 说明                     |
 * | :---------------------- | :------------- | :-------- | :----------------------- |
 * | animations:<uuid>:clear | 需要清空动画时 | \_onClear | 清空所有已注册的动画实例 |
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

  /*
   * ============================================================
   * 事件处理器
   * ============================================================
   */

  /**
   * ## _onClear：处理清空事件
   *
   * 当收到 animations:<uuid>:clear 事件时调用， 清空 AnimationSystem 中所有已注册的动画实例，
   * 通常在游戏重置或场景切换时触发。
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
