import isFunction from '@/lib/utils/is-function.js';
import isString from '@/lib/utils/is-string.js';

/**
 * # 简单事件总线（Event Bus）
 *
 * 用于实现模块间的发布/订阅通信，是游戏架构中解耦各层的核心机制。
 *
 * ## 设计理念
 *
 * - **Game 负责 emit**（发生了什么）
 * - **Engine 负责 on**（怎么表现）
 * - **各模块独立订阅**，互不依赖
 *
 * ## 核心方法
 *
 * | 方法                   | 说明                                    |
 * | ---------------------- | --------------------------------------- |
 * | `on(event, handler)`   | 订阅事件，可多次触发                    |
 * | `once(event, handler)` | 订阅事件，仅触发一次后自动取消          |
 * | `off(event, handler)`  | 取消订阅                                |
 * | `emit(event, payload)` | 触发事件，通知所有订阅者                |
 * | `clear()`              | 清空所有事件订阅（用于重启/测试/reset） |
 *
 * ## 实现细节
 *
 * - 使用 `Map<event, Set<handler>>` 存储事件订阅关系
 * - 每个事件对应一个 `Set`，保证同一 handler 不会重复订阅
 * - `once` 通过包装函数实现，触发后自动调用 `off` 取消订阅
 * - 参数校验：event 必须为字符串，handler 必须为函数
 *
 * @example
 *   // 订阅事件
 *   EventBus.on('game:start', (data) => console.log('游戏开始', data));
 *
 *   // 触发事件
 *   EventBus.emit('game:start', { level: 1 });
 *
 *   // 一次性订阅
 *   EventBus.once('game:over', (data) => console.log('仅触发一次'));
 *
 * @namespace EventBus
 * @property {Map<string, Set<Function>>} events - 事件订阅映射表
 */
const EventBus = {
  /**
   * ## 事件订阅映射表
   *
   * Key 为事件名称，Value 为该事件对应的处理函数集合。
   *
   * @type {Map<string, Set<Function>>}
   */
  events: new Map(),

  /**
   * ## 订阅事件
   *
   * 注册一个处理函数，每当事件触发时都会调用。 如果事件不存在，会自动创建。 相同的 handler 不会重复注册（Set 去重）。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数，接收 `payload` 作为参数
   * @returns {void}
   */
  on(event, handler) {
    // 参数校验
    if (!isString(event) || !isFunction(handler)) {
      return;
    }

    // 事件不存在则创建
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    // 将 handler 加入对应事件的 Set 中
    this.events.get(event).add(handler);
  },

  /**
   * ## 订阅事件，仅触发一次
   *
   * 注册的处理函数在第一次触发后自动取消订阅。 内部通过创建包装函数实现，触发后在 `finally` 中调用 `off`。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数，接收 `payload` 作为参数
   * @returns {void}
   */
  once(event, handler) {
    // 参数校验
    if (!isString(event) || !isFunction(handler)) {
      return;
    }

    /**
     * 包装函数：执行 handler 后自动取消订阅
     *
     * @param {object} payload - 事件参数
     */
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
   * ## 取消订阅
   *
   * 从指定事件的订阅列表中移除处理函数。 如果移除后该事件没有订阅者，会清理该事件条目。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 要移除的处理函数
   * @returns {void}
   */
  off(event, handler) {
    // 参数校验
    if (!isString(event) || !isFunction(handler)) {
      return;
    }

    const set = this.events.get(event);

    // 事件不存在，直接返回
    if (!set) {
      return;
    }

    // 从 Set 中删除 handler
    set.delete(handler);

    // 如果没有订阅者了，清理事件条目
    if (set.size === 0) {
      this.events.delete(event);
    }
  },

  /**
   * ## 触发事件
   *
   * 通知指定事件的所有订阅者，依次调用它们的处理函数。 如果事件没有订阅者，不做任何操作。
   *
   * @param {string} event - 事件名称
   * @param {object} [payload] - 传递给处理函数的参数对象
   * @returns {void}
   */
  emit(event, payload) {
    const set = this.events.get(event);

    // 没有订阅者，直接返回
    if (!set) {
      return;
    }

    // 遍历所有 handler 并调用
    for (const handler of set) {
      // 二次校验，防止非法 handler 混入
      if (!isFunction(handler)) {
        continue;
      }

      handler(payload);
    }
  },

  /**
   * ## 清空所有事件
   *
   * 移除所有事件和订阅者。 用于游戏重启、单元测试 reset、或完全重置状态时调用。
   *
   * @returns {void}
   */
  clear() {
    this.events.clear();
  },
};

export default EventBus;
