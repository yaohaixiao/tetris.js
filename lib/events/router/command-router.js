import Base from '@/lib/core';
import { CommandEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：CommandRouter 命令队列事件路由器
 *
 * ============================================================
 *
 * 负责处理命令队列相关的事件路由，将清空和入队事件分发到 CommandQueue 实例。
 *
 * ## 核心职责
 *
 * | 职责     | 说明                                              |
 * | :------- | :------------------------------------------------ |
 * | 事件订阅 | 在 subscribe() 中注册命令队列事件的处理器         |
 * | 事件取消 | 在 unsubscribe() 中移除所有已注册的处理器         |
 * | 事件路由 | 将清空/入队事件路由到 CommandQueue 实例           |
 * | 参数转换 | 从事件 payload 中提取参数，调用 CommandQueue 方法 |
 *
 * ## 处理的命令队列事件
 *
 * | 事件名                       | 触发时机       | 处理器      | 说明                         |
 * | :--------------------------- | :------------- | :---------- | :--------------------------- |
 * | command:queue:<uuid>:clear   | 需要清空队列时 | \_onClear   | 清空命令队列中所有待执行命令 |
 * | command:queue:<uuid>:enqueue | 命令入队时     | \_onEnqueue | 将命令加入队列等待执行       |
 *
 * @augments Base
 * @class CommandRouter
 */
class CommandRouter extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅命令队列事件
   *
   * 监听 command:queue:<uuid>:clear 和 command:queue:<uuid>:enqueue 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const uuid = Game.id;
    const events = CommandEvents(uuid);

    this.on(events.CLEAR, this._onClear);
    this.on(events.ENQUEUE, this._onEnqueue);
  }

  /**
   * ## unsubscribe：取消订阅命令队列事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const uuid = Game.id;
    const events = CommandEvents(uuid);

    this.off(events.CLEAR, this._onClear);
    this.off(events.ENQUEUE, this._onEnqueue);
  }

  /*
   * ============================================================
   * 事件处理器
   * ============================================================
   */

  /**
   * ## _onClear：处理清空队列事件
   *
   * 当收到 command:queue:<uuid>:clear 事件时调用，丢弃命令队列中所有未执行的命令。 通常在游戏重置或模式切换时触发。
   *
   * @private
   * @returns {void}
   */
  _onClear = () => {
    const { CommandQueue } = this;
    CommandQueue.clear();
  };

  /**
   * ## _onEnqueue：处理命令入队事件
   *
   * 当收到 command:queue:<uuid>:enqueue 事件时调用， 将命令实例添加到队列末尾，等待后续 flush 时执行。
   *
   * @private
   * @param {object} params - 事件参数
   * @param {object} params.cmd - 要入队的命令实例
   * @returns {void}
   */
  _onEnqueue = ({ cmd }) => {
    const { CommandQueue } = this;
    CommandQueue.enqueue(cmd);
  };
}

export default CommandRouter;
