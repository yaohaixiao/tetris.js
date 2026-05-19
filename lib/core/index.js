import EventBus from '@/lib/core/event-bus';

/**
 * # 核心基类
 *
 * 为所有需要事件通信和依赖注入的类提供统一的基础功能。 游戏中的 Game、AIController、ReplayController 等均继承此类。
 *
 * ## 核心功能
 *
 * ### 依赖注入
 *
 * 构造函数接收一个依赖对象，通过 `Object.assign` 将依赖注入到实例上。 这使得子类可以直接通过
 * `this.Scheduler`、`this.Store` 等方式访问依赖。
 *
 * ### 事件代理
 *
 * 封装了 EventBus 的常用方法（`on`、`off`、`once`、`emit`、`clear`）， 子类可以直接通过 `this.emit()`
 * 等方式使用事件系统，无需直接引用 EventBus。
 *
 * @example
 *   class MyController extends Base {
 *     constructor(deps) {
 *       super(deps);
 *       // 依赖已自动注入：this.Game、this.Store 等
 *     }
 *
 *     doSomething() {
 *       // 发送事件
 *       this.emit('custom:event', { data: 123 });
 *     }
 *   }
 *
 * @class Base
 */
class Base {
  /**
   * ## 构造函数
   *
   * 接收依赖对象并注入到实例上。
   *
   * @example
   *   const controller = new MyController({
   *     Game: gameInstance,
   *     Store: gameStore,
   *     Scheduler: schedulerInstance,
   *   });
   *   // controller.Game === gameInstance
   *
   * @param {object} [deps={}] - 依赖对象，其属性会被复制到当前实例。默认值为 `{}`. Default is `{}`
   */
  constructor(deps = {}) {
    this.inject(deps);
  }

  /**
   * ## 依赖注入
   *
   * 将传入对象的属性复制到当前实例上。 使用 `Object.assign` 进行浅拷贝。
   *
   * @param {object} [deps={}] - 依赖对象。默认值为 `{}`. Default is `{}`
   * @returns {void}
   */
  inject(deps = {}) {
    Object.assign(this, deps);
  }

  /**
   * ## 触发事件（EventBus 代理）
   *
   * 通知所有订阅了该事件的处理函数。
   *
   * @param {string} event - 事件名称
   * @param {object} [payload] - 传递给处理函数的参数对象
   * @returns {void}
   */
  emit(event, payload) {
    EventBus.emit(event, payload);
  }

  /**
   * ## 订阅事件（EventBus 代理）
   *
   * 注册一个持续监听的处理函数。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   * @returns {void}
   */
  on(event, handler) {
    EventBus.on(event, handler);
  }

  /**
   * ## 一次性订阅事件（EventBus 代理）
   *
   * 注册的处理函数在首次触发后自动取消订阅。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   * @returns {void}
   */
  once(event, handler) {
    EventBus.once(event, handler);
  }

  /**
   * ## 取消订阅事件（EventBus 代理）
   *
   * 从指定事件的订阅列表中移除处理函数。
   *
   * @param {string} event - 事件名称
   * @param {Function} handler - 要移除的处理函数
   * @returns {void}
   */
  off(event, handler) {
    EventBus.off(event, handler);
  }

  /**
   * ## 清空所有事件（EventBus 代理）
   *
   * 移除全局 EventBus 中的所有事件订阅。 注意：这是全局操作，会影响所有继承 Base 的实例。 通常用于游戏重启或单元测试 teardown。
   *
   * @returns {void}
   */
  clear() {
    EventBus.clear();
  }
}

export default Base;
