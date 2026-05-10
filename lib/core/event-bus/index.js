import isFunction from '@/lib/utils/is-function.js';
import isString from '@/lib/utils/is-string.js';

/**
 * # 简单事件总线（Event Bus）
 *
 * 用于 Game → Engine 解耦：
 *
 * - Game 只负责 emit（发生了什么）
 * - Engine 负责 on（怎么表现）
 */
const EventBus = {
  events: new Map(),

  /**
   * ## 订阅事件
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
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
   * ## 订阅事件，仅触发一次
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  once(event, handler) {
    if (!isString(event) || !isFunction(handler)) {
      return;
    }

    const wrapper = (payload) => {
      try {
        handler(payload);
      } finally {
        this.off(event, wrapper);
      }
    };

    this.on(event, wrapper);
  },

  /**
   * ## 取消订阅
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
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
   * ## 触发事件
   *
   * @param {string} event - 事件名称
   * @param {object} [payload] - 参数对象
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

  /** ## 清空所有事件（用于重启 / 测试 / reset） */
  clear() {
    this.events.clear();
  },
};

export default EventBus;
