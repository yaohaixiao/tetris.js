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
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event).add(handler);
  },

  /**
   * ## 取消订阅
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  off(event, handler) {
    const set = this.events.get(event);
    if (!set) return;

    set.delete(handler);

    if (set.size === 0) {
      this.events.delete(event);
    }
  },

  /**
   * ## 触发事件
   *
   * @param {string} event - 事件名称
   * @param {object} payload - 参数对象
   */
  emit(event, payload) {
    const set = this.events.get(event);
    if (!set) return;

    for (const handler of set) {
      handler(payload);
    }
  },

  /** ## 清空所有事件（用于重启 / 测试 / reset） */
  clear() {
    this.events.clear();
  },
};

export default EventBus;
