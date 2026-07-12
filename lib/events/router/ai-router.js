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
 * ## 核心职责
 *
 * | 职责     | 说明                                            |
 * | :------- | :---------------------------------------------- |
 * | 事件订阅 | 在 subscribe() 中注册 AI 事件的处理器           |
 * | 事件取消 | 在 unsubscribe() 中移除所有已注册的处理器       |
 * | 事件路由 | 将 AI 启动/停止事件路由到 AIController 实例     |
 * | 参数转换 | 从事件 payload 中提取参数，调用 AI 实例对应方法 |
 *
 * ## 处理的 AI 事件
 *
 * | 事件名          | 触发时机      | 处理器    | 说明             |
 * | :-------------- | :------------ | :-------- | :--------------- |
 * | ai:<uuid>:start | AI 开始决策时 | \_onStart | 启动 AI 决策循环 |
 * | ai:<uuid>:stop  | AI 停止决策时 | \_onStop  | 停止 AI 决策循环 |
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

  /*
   * ============================================================
   * 事件处理器
   * ============================================================
   */

  /**
   * ## _onStart：处理 AI 启动事件
   *
   * 当收到 ai:<uuid>:start 事件时调用， 启动 AIController 的决策循环。
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
   * 当收到 ai:<uuid>:stop 事件时调用， 停止 AIController 的决策循环。
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
