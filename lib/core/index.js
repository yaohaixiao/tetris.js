import EventBus from '@/lib/core/event-bus';
import isString from '@/lib/utils/is-string.js';
import hasOwn from '@/lib/utils/has-own.js';
import isObject from '@/lib/utils/is-object.js';
import extend from '@/lib/utils/extend.js';

class Base {
  /**
   * ## 构造函数
   *
   * @class
   */
  constructor() {
    /**
     * # 依赖模块
     *
     * @type {{ Game: null }}
     */
    this.deps = {
      Store: null,
      Game: null,
    };
  }

  initialize(deps) {
    this.dep(deps);
  }

  dep(dep, value) {
    const { deps } = this;

    if (isString(dep)) {
      // 只能扩展 attrs 中已有的属性
      if (value && hasOwn(deps, dep)) {
        // 更新单个配置信息
        deps[dep] = value;
      }

      // 只传递 prop 参数，则返回对应的属性值
      return deps[dep];
    }

    if (isObject(dep)) {
      // 批量更新配置信息
      extend(deps, dep);
    } else if (arguments.length === 0) {
      // 不传递参数，直接返回整个
      return deps;
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
