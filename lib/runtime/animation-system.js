import Base from '@/lib/core';
import { AnimationsEvents } from '@/lib/events/event-catalog.js';

/**
 * # AnimationSystem（动画管理系统）
 *
 * 一个轻量级的动画生命周期管理器，负责动画的注册、排序、渲染和清理。 与 Scheduler 配合使用，所有时间驱动逻辑由 Scheduler 负责，
 * AnimationSystem 本身不执行帧更新，只管理动画的队列和渲染顺序。
 *
 * ## 核心特性
 *
 * - **纯容器设计**：不执行 update，全部时间逻辑交给 Scheduler
 * - **延迟注册队列**：新动画在下一帧合并，避免遍历中修改队列
 * - **懒排序缓存**：只在队列变化时重新计算渲染顺序
 * - **自动清理**：动画设置 `_finished = true` 后，系统自动调用 `dispose()` 并移除
 * - **阻塞检测**：支持按名称检测是否存在阻塞性动画
 *
 * ## 动画对象接口
 *
 * 每个动画对象需要实现以下接口：
 *
 * ```typescript
 * interface Animation {
 *   name?: string; // 动画名称，默认 'anonymous'
 *   layer?: number; // 渲染层级，越小越先渲染，默认 0
 *   blocking?: boolean; // 是否为阻塞动画，默认 false
 *   _finished?: boolean; // 标记动画是否结束，由动画自身设置
 *   render(): void; // 渲染动画
 *   dispose?(): void; // 清理资源（取消 Scheduler 任务等），系统移除时自动调用
 * }
 * ```
 *
 * ## 生命周期
 *
 *     register(anim)  →  #pending.push(anim)
 *            ↓
 *     flush()  →  #mergePending()  →  #queue.push(...)
 *            ↓                    →  #removeFinished()
 *            ↓                          ↓
 *            ↓                    anim._finished === true
 *            ↓                          ↓
 *            ↓                    anim.dispose()  →  清理 Scheduler 任务
 *            ↓                          ↓
 *            ↓                    #queue.splice(i, 1)
 *            ↓
 *     render()  →  #sorted（按 layer 排序）→  anim.render()
 *
 * @augments Base
 * @class AnimationSystem
 */
class AnimationSystem extends Base {
  /**
   * ## 当前活跃的动画队列
   *
   * 存储所有正在运行的动画对象。在 `flush()` 中移除已结束的动画。
   *
   * @private
   * @type {object[]}
   */
  #queue = [];

  /**
   * ## 等待注册的动画队列
   *
   * 新注册的动画先加入此队列，在下次 `flush()` 时合并到 `#queue`。 避免在遍历活跃队列时直接修改数组。
   *
   * @private
   * @type {object[]}
   */
  #pending = [];

  /**
   * ## 按 layer 排序后的缓存数组
   *
   * 用于渲染阶段，避免每帧重新排序。只在 `#dirty = true` 时重新计算。
   *
   * @private
   * @type {object[]}
   */
  #sorted = [];

  /**
   * ## 排序缓存是否需要重新计算
   *
   * 当队列发生变化时设为 `true`，下次 `render()` 时触发重新排序。
   *
   * @private
   * @type {boolean}
   */
  #dirty = false;

  /**
   * ## 当前动画总数（调试用）
   *
   * 返回活跃队列和待注册队列中的动画总数。
   *
   * @type {number}
   */
  get size() {
    return this.#queue.length + this.#pending.length;
  }

  /**
   * ## 构造函数
   *
   * 初始化动画管理系统实例。需要手动调用 `subscribe()` 订阅事件。
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 注册动画
   *
   * 将动画对象注册到系统中。新动画不会立即生效，而是在下次 `flush()` 时合并。
   *
   * ### 验证
   *
   * 动画对象必须包含 `render()` 方法，否则抛出错误。
   *
   * ### 默认值
   *
   * - `layer`：默认为 0（最底层）
   * - `blocking`：默认为 false（非阻塞）
   * - `name`：默认为 'anonymous'
   *
   * @param {object} animation - 动画对象，必须包含 `render()` 方法
   * @returns {void}
   * @throws {Error} 如果动画对象不包含 `render()` 方法
   */
  register(animation) {
    if (!animation || typeof animation.render !== 'function') {
      throw new Error('Invalid animation: must implement render()');
    }

    animation.layer ??= 0;
    animation.blocking ??= false;
    animation.name ??= 'anonymous';

    this.#pending.push(animation);
    this.#dirty = true;
  }

  /**
   * ## 刷新动画队列
   *
   * 在 Scheduler.tick() 之后调用，执行两个操作：
   *
   * 1. 合并待注册动画到活跃队列
   * 2. 移除已结束的动画（调用其 `dispose()` 方法）
   *
   * 替代了原来的 `update(delta)`，不再执行帧更新逻辑。
   *
   * @returns {void}
   */
  flush() {
    this.#mergePending();
    this.#removeFinished();
  }

  /**
   * ## 渲染所有动画
   *
   * 采用懒排序策略：只在队列发生变化时重新排序。 `layer` 值越小越先渲染，越大越后渲染（顶层）。
   *
   * @returns {void}
   */
  render() {
    if (this.#dirty) {
      this.#sorted = this.#queue.slice().toSorted((a, b) => a.layer - b.layer);
      this.#dirty = false;
    }

    for (const animation of this.#sorted) {
      animation.render();
    }
  }

  /**
   * ## 检查是否存在阻塞性动画
   *
   * 阻塞动画会暂停用户输入或游戏逻辑。支持按名称精确匹配。
   *
   * @param {string[]} [names=[]] - 可选，指定要检查的动画名称列表。 为空时检查所有阻塞动画。. Default is
   *   `[]`
   * @returns {boolean} 存在匹配的阻塞动画则返回 `true`
   */
  hasBlocking(names = []) {
    const hasNames = names.length > 0;

    for (const animation of this.#queue) {
      if (animation._finished || !animation.blocking) {
        continue;
      }

      if (!hasNames || names.includes(animation.name)) {
        return true;
      }
    }

    return false;
  }

  /**
   * ## 清空所有动画
   *
   * 移除系统中的所有动画，调用每个动画的 `dispose()` 方法清理资源， 并重置所有内部状态。通常在游戏重置或场景切换时调用。
   *
   * @returns {void}
   */
  clear() {
    for (const anim of this.#queue) {
      if (typeof anim.dispose === 'function') {
        anim.dispose();
      }
    }

    for (const anim of this.#pending) {
      if (typeof anim.dispose === 'function') {
        anim.dispose();
      }
    }

    this.#queue.length = 0;
    this.#pending.length = 0;
    this.#sorted.length = 0;
    this.#dirty = false;
  }

  /**
   * ## 订阅动画系统事件
   *
   * 监听 `animations:<id>:clear` 事件，用于外部触发清空操作。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const events = AnimationsEvents(Game.id);
    this.on(events.CLEAR, this._onClear);
  }

  /**
   * ## 取消订阅动画系统事件
   *
   * 移除对 `animations:<id>:clear` 事件的监听。 在组件销毁时调用，避免内存泄漏。
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = AnimationsEvents(Game.id);
    this.off(events.CLEAR, this._onClear);
  }

  /**
   * ## 处理清空事件
   *
   * 当接收到 `animations:<id>:clear` 事件时的回调。
   *
   * @private
   * @returns {void}
   */
  _onClear = () => {
    this.clear();
  };

  /**
   * ## 合并待注册动画到活跃队列
   *
   * 将 `#pending` 中的动画全部移入 `#queue`，并标记排序缓存失效。 没有待注册动画时直接返回。
   *
   * @private
   * @returns {void}
   */
  #mergePending() {
    if (this.#pending.length === 0) return;
    this.#queue.push(...this.#pending);
    this.#pending.length = 0;
    this.#dirty = true;
  }

  /**
   * ## 移除已结束的动画
   *
   * 遍历活跃队列，对 `_finished` 为 `true` 的动画调用 `dispose()` 后移除。 倒序遍历避免 `splice`
   * 导致索引错位。
   *
   * @private
   * @returns {void}
   */
  #removeFinished() {
    let removed = false;

    for (let i = this.#queue.length - 1; i >= 0; i--) {
      const anim = this.#queue[i];
      if (anim._finished) {
        if (typeof anim.dispose === 'function') {
          anim.dispose();
        }
        this.#queue.splice(i, 1);
        removed = true;
      }
    }

    if (removed) {
      this.#dirty = true;
    }
  }
}

export default AnimationSystem;
