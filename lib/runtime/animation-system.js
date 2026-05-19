import Base from '@/lib/core';

/**
 * # AnimationSystem（动画管理系统）
 *
 * 一个高性能、可扩展的动画管理系统，用于统一管理游戏中的各种动画特效。
 *
 * ## 核心特性
 *
 * - **生命周期管理**：支持动画的注册、更新、渲染和清理
 * - **延迟注册队列**：新动画在下一帧生效，避免遍历过程中修改队列
 * - **排序缓存**：只在实际需要时重新计算渲染顺序，提升性能
 * - **阻塞检测**：支持按名称检测是否存在阻塞性动画（用于暂停输入/游戏逻辑）
 * - **完全隔离**：update 和 render 阶段分离，确保线程安全
 *
 * ## 动画对象接口
 *
 * 每个动画对象需要实现以下接口：
 *
 * ```typescript
 * interface Animation {
 *   name?: string; // 动画名称，用于调试和阻塞检测（默认 'anonymous'）
 *   layer?: number; // 渲染层级，越小越先渲染（默认 0）
 *   blocking?: boolean; // 是否为阻塞动画（默认 false）
 *   update(delta: number): boolean; // 更新动画，返回 false 表示动画结束
 *   render(): void; // 渲染动画
 * }
 * ```
 *
 * @example
 *   const animSystem = new AnimationSystem({ Game });
 *
 *   // 注册一个动画
 *   animSystem.register({
 *     name: 'fade-in',
 *     layer: 10,
 *     blocking: false,
 *     progress: 0,
 *     update(delta) {
 *       this.progress += delta;
 *       return this.progress < 1; // 进度 < 1 时继续
 *     },
 *     render() {
 *       // 绘制逻辑
 *     },
 *   });
 *
 *   // 在主循环中使用
 *   function gameLoop(delta) {
 *     animSystem.update(delta); // 更新所有动画
 *     animSystem.render(); // 渲染所有动画
 *   }
 *
 * @class AnimationSystem
 */
class AnimationSystem extends Base {
  /**
   * ## 当前活跃的动画队列
   *
   * 存储所有正在运行的动画对象。
   *
   * @type {Animation[]}
   */
  #queue = [];

  /**
   * ## 等待注册的动画队列
   *
   * 新注册的动画先加入此队列，在下次 `update()` 时合并到 `#queue`， 避免在遍历过程中修改活跃队列。
   *
   * @type {Animation[]}
   */
  #pending = [];

  /**
   * ## 按 layer 排序后的缓存数组
   *
   * 用于渲染阶段，避免每帧都重新排序。
   *
   * @type {Animation[]}
   */
  #sorted = [];

  /**
   * ## 排序缓存是否需要重新计算
   *
   * 当队列发生变化时设为 `true`，下次 `render()` 时触发重新排序。
   *
   * @type {boolean}
   */
  #dirty = false;

  /**
   * ## 当前动画总数（调试用）
   *
   * 包含活跃队列和待注册队列中的动画。
   *
   * @type {number}
   */
  get size() {
    return this.#queue.length + this.#pending.length;
  }

  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 注册动画
   *
   * 将动画对象注册到系统中。新动画不会立即生效， 而是在下次 `update()` 时合并到活跃队列，避免遍历中修改数组。
   *
   * @param {Animation} animation - 动画对象，必须包含 `update()` 和 `render()` 方法
   * @returns {void}
   * @throws {Error} 如果动画对象无效则抛出错误
   */
  register(animation) {
    // 验证动画对象的基本契约
    if (
      !animation ||
      typeof animation.update !== 'function' ||
      typeof animation.render !== 'function'
    ) {
      throw new Error(
        'Invalid animation: must implement update() and render()',
      );
    }

    // 为可选属性设置默认值
    animation.layer ??= 0;
    animation.blocking ??= false;
    animation.name ??= 'anonymous';

    // 加入待处理队列，下一帧生效
    this.#pending.push(animation);
    this.#dirty = true;
  }

  /**
   * ## 更新所有动画
   *
   * 在游戏逻辑循环中调用。执行流程：
   *
   * 1. 合并待注册动画到活跃队列
   * 2. 遍历所有动画并调用 `update(delta)`
   * 3. 自动移除返回 `false` 的已结束动画
   * 4. 处理 `update()` 过程中新注册的动画（补丁合并）
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {void}
   */
  update(delta) {
    // 合并上帧的 pending 队列
    this.#mergePending();

    // 持续处理：如果 update 过程中又注册了新动画，继续合并、继续更新
    let processedCount = 0;

    while (processedCount < this.#queue.length) {
      const anim = this.#queue[processedCount];

      // 调用动画的 update 方法，返回 false 表示动画已结束
      const alive = anim.update(delta);

      if (alive) {
        // 动画继续，前进指针
        processedCount++;
      } else {
        // 动画结束，从队列中移除
        this.#queue.splice(processedCount, 1);
        this.#dirty = true;
        // 不前进 processedCount，因为下一个元素自动移到了当前位置
      }

      // 如果在更新过程中有新动画注册，立刻合并
      if (this.#pending.length > 0) {
        this.#mergePending();
      }
    }
  }

  /**
   * ## 渲染所有动画
   *
   * 在渲染循环中调用。采用懒排序策略： 只在队列发生变化（`#dirty = true`）时才重新排序。
   *
   * ### 渲染顺序
   *
   * `layer` 值越小越先渲染（底层），越大越后渲染（顶层）。 例如：背景动画 layer=0，UI 特效 layer=100。
   *
   * @returns {void}
   */
  render() {
    // 懒排序：仅在 dirty 时才重新排序
    if (this.#dirty) {
      this.#sorted = this.#queue.slice().toSorted((a, b) => a.layer - b.layer);
      this.#dirty = false;
    }

    // 按排序后的顺序逐个渲染
    for (const animation of this.#sorted) {
      animation.render();
    }
  }

  /**
   * ## 检查是否存在阻塞性动画
   *
   * 阻塞动画会暂停用户输入或游戏逻辑（如消行特效、倒计时）。
   *
   * @example
   *   // 检查是否有任何阻塞动画
   *   animSystem.hasBlocking(); // true/false
   *
   *   // 只检查消行和倒计时动画
   *   animSystem.hasBlocking(['clear-lines', 'countdown']);
   *
   * @param {string[]} [names=[]] - 可选，指定要检查的动画名称列表。 为空时检查所有阻塞动画。默认值为 `[]`.
   *   Default is `[]`
   * @returns {boolean} 存在匹配的阻塞动画则返回 `true`
   */
  hasBlocking(names = []) {
    const hasNames = names.length > 0;

    for (const animation of this.#queue) {
      // 跳过非阻塞动画
      if (!animation.blocking) {
        continue;
      }

      // 如果指定了名称，只匹配指定名称的动画
      if (!hasNames || names.includes(animation.name)) {
        return true;
      }
    }

    return false;
  }

  /**
   * ## 清空所有动画
   *
   * 移除系统中的所有动画，重置内部状态。 通常在游戏重置、场景切换或紧急清理时使用。
   *
   * @returns {void}
   */
  clear() {
    this.#queue.length = 0;
    this.#pending.length = 0;
    this.#sorted.length = 0;
    this.#dirty = false;
  }

  /**
   * ## 合并待注册动画到活跃队列
   *
   * 将 `#pending` 中的动画全部移入 `#queue`，并标记排序缓存失效。
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
   * ## 订阅动画系统事件
   *
   * 监听 `animations:<id>:clear` 事件，用于外部触发清空操作。
   *
   * @returns {void}
   */
  subscribe() {
    this.on(`animations:${this.Game.id}:clear`, this._onClear);
  }

  /**
   * ## 取消订阅动画系统事件
   *
   * @returns {void}
   */
  unsubscribe() {
    this.off(`animations:${this.Game.id}:clear`, this._onClear);
  }

  /**
   * ## 处理清空事件
   *
   * @private
   * @returns {void}
   */
  _onClear = () => {
    this.clear();
  };
}

export default AnimationSystem;
