import EventBus from '@/lib/core/event-bus';
import isString from '@/lib/utils/is-string.js';
import hasOwn from '@/lib/utils/has-own.js';
import isObject from '@/lib/utils/is-object.js';
import extend from '@/lib/utils/extend.js';

class Base {
  constructor(options) {
    if (options) {
      this.initialize(options);
    }
  }

  initialize(options) {
    this.props = options;
  }

  prop(prop, value) {
    const { props } = this;

    if (isString(prop)) {
      // 只能扩展 attrs 中已有的属性
      if (value && hasOwn(props, prop)) {
        // 更新单个配置信息
        props[prop] = value;
      }

      // 只传递 prop 参数，则返回对应的属性值
      return props[prop];
    }

    if (isObject(prop)) {
      // 批量更新配置信息
      extend(props, prop);
    } else if (arguments.length === 0) {
      // 不传递参数，直接返回整个
      return props;
    }
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
