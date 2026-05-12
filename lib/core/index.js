import EventBus from '@/lib/core/event-bus';

class Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} [deps={}] - （所有）依赖对象. Default is `{}`
   */
  constructor(deps = {}) {
    this.inject(deps);
  }

  inject(deps = {}) {
    Object.assign(this, deps);
  }

  emit(event, payload) {
    EventBus.emit(event, payload);
  }

  on(event, handler) {
    EventBus.on(event, handler);
  }

  once(event, handler) {
    EventBus.once(event, handler);
  }

  off(event, handler) {
    EventBus.off(event, handler);
  }

  clear() {
    EventBus.clear();
  }
}

export default Base;
