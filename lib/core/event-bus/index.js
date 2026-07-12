import isFunction from '@/lib/utils/types/is-function.js';
import isString from '@/lib/utils/types/is-string.js';

/**
 * ============================================================
 *
 * # 简单事件总线
 *
 * ============================================================
 *
 * 用于实现模块间的发布/订阅通信， 是游戏架构中解耦各层的核心机制。
 *
 * ## 设计理念
 *
 * - Game 负责 emit（发生了什么）
 * - Engine 负责 on（怎么表现）
 * - 各模块独立订阅，互不依赖
 *
 * ## 核心方法
 *
 * | 方法                 | 说明                                    |
 * | :------------------- | :-------------------------------------- |
 * | on(event, handler)   | 订阅事件，可多次触发                    |
 * | once(event, handler) | 订阅事件，仅触发一次后自动取消          |
 * | off(event, handler)  | 取消订阅                                |
 * | emit(event, payload) | 触发事件，通知所有订阅者                |
 * | clear()              | 清空所有事件订阅（用于重启/测试/reset） |
 *
 * ## 实现细节
 *
 * - 使用 Map<event, Set<handler>> 存储事件订阅关系
 * - 每个事件对应一个 Set，保证同一 handler 不会重复订阅
 * - Once 通过包装函数实现，触发后自动调用 off 取消订阅
 * - 参数校验：event 必须为字符串，handler 必须为函数
 *
 * @namespace EventBus
 * @property {Map<string, Set<Function>>} events - 事件订阅映射表
 */
const EventBus = {
  /**
   * 事件订阅映射表。
   *
   * Key 为事件名称，Value 为该事件对应的处理函数集合。
   *
   * @type {Map<string, Set<Function>>}
   */
  events: new Map(),

  /**
   * ## on：订阅事件
   *
   * 注册一个处理函数，每当事件触发时都会调用。 相同的 handler 不会重复注册（Set 去重）。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   * @returns {void}
   */
  on(event, handler) {
    if (!isString(event) || !isFunction(handler)) {
      return;
    }

    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event).add(handler);
  },

  /**
   * ## once：一次性订阅事件
   *
   * 注册的处理函数在第一次触发后自动取消订阅。 内部通过创建包装函数实现，触发后在 finally 中调用 off。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   * @returns {void}
   */
  once(event, handler) {
    if (!isString(event) || !isFunction(handler)) {
      return;
    }

    const wrapper = (payload) => {
      try {
        handler(payload);
      } finally {
        // 无论 handler 是否报错，都确保取消订阅
        this.off(event, wrapper);
      }
    };

    this.on(event, wrapper);
  },

  /**
   * ## off：取消订阅
   *
   * 从指定事件的订阅列表中移除处理函数。 如果移除后该事件没有订阅者，会清理该事件条目。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 要移除的处理函数
   * @returns {void}
   */
  off(event, handler) {
    if (!isString(event) || !isFunction(handler)) {
      return;
    }

    const set = this.events.get(event);

    if (!set) {
      return;
    }

    set.delete(handler);

    if (set.size === 0) {
      this.events.delete(event);
    }
  },

  /**
   * ## emit：触发事件
   *
   * 通知指定事件的所有订阅者，依次调用它们的处理函数。
   *
   * @param {string} event - 事件名称
   * @param {object} [payload] - 传递给处理函数的参数对象
   * @returns {void}
   */
  emit(event, payload) {
    const set = this.events.get(event);

    if (!set) {
      return;
    }

    for (const handler of set) {
      if (!isFunction(handler)) {
        continue;
      }

      handler(payload);
    }
  },

  /**
   * ## clear：清空所有事件
   *
   * 移除所有事件和订阅者。
   *
   * @returns {void}
   */
  clear() {
    this.events.clear();
  },
};

export default EventBus;
