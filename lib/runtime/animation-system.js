/**
 * # AnimationSystem
 *
 * 一个高性能、可扩展的动画管理系统。
 *
 * 核心特性：
 *
 * - 生命周期管理：支持动画的注册、更新、渲染和清理
 * - 延迟注册队列：新动画在下一帧生效，避免遍历过程中修改队列
 * - 排序缓存：只在实际需要时重新计算渲染顺序，提升性能
 * - 阻塞检测：支持按名称检测是否存在阻塞性动画
 * - 完全隔离：update 和 render 阶段分离，确保线程安全
 *
 * @example
 *   ```javascript
 *   const animSystem = new AnimationSystem();
 *
 *   const fadeIn = {
 *     name: 'fade-in',
 *     layer: 10,
 *     blocking: false,
 *     progress: 0,
 *     update(delta) {
 *       this.progress += delta;
 *       return this.progress < 1;
 *     },
 *     render() {
 *       // 渲染逻辑
 *     }
 *   };
 *
 *   animSystem.register(fadeIn);
 *
 *   function gameLoop(delta) {
 *     animSystem.update(delta);
 *     animSystem.render();
 *   }
 *   ```;
 */

/**
 * 动画对象的标准接口定义
 *
 * @typedef {object} Animation
 * @property {string} [name] - 动画名称，用于调试和阻塞检测（默认：'anonymous'）
 * @property {number} [layer] - 渲染层级，数值越小越先渲染（在底层）（默认：0）
 * @property {boolean} [blocking] - 是否为阻塞动画，会影响 hasBlocking() 的返回值（默认：false）
 * @property {Function} update - 更新动画状态的方法
 * @property {Function} render - 渲染动画的方法
 * @param {number} delta - 距离上一帧的时间差（秒）
 * @returns {boolean} - 返回 true 表示动画继续，返回 false 表示动画结束
 * @returns {void}
 */

/**
 * 动画系统的 API 接口
 *
 * @typedef {object} AnimationSystem
 * @property {function(Animation): void} register - 注册一个新动画
 * @property {function(number): void} update - 更新所有动画状态
 * @property {function(): void} render - 渲染所有动画
 * @property {function(string[]=): boolean} hasBlocking - 要检查的动画类型（可选）
 * @property {function(): void} clear - 清空所有动画
 * @property {number} size - 当前动画总数（只读）
 */
class AnimationSystem {
  /** 当前活跃的动画队列 @type {Animation[]} */
  #queue = [];

  /** 等待注册的动画队列（延迟到下一帧生效） @type {Animation[]} */
  #pending = [];

  /** 按 layer 排序后的缓存数组 @type {Animation[]} */
  #sorted = [];

  /** 排序缓存是否需要重新计算 @type {boolean} */
  #dirty = false;

  /**
   * 当前活跃动画 + 待处理动画的总数（调试用）。
   *
   * @returns {number} - 返回当前活跃动画 + 待处理动画的总数
   */
  get size() {
    return this.#queue.length + this.#pending.length;
  }

  /**
   * ## 注册动画
   *
   * 将动画对象注册到系统中。新动画在下次 update() 时合并到活跃队列， 避免在遍历过程中修改数组。
   *
   * @param {Animation} animation - 动画对象，必须包含 update() 和 render() 方法
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
   * 2. 遍历所有动画并调用 update()
   * 3. 自动移除返回 false 的已结束动画
   * 4. 处理 update() 过程中新注册的动画（补丁合并）
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   */
  update(delta) {
    // 合并上帧的 pending
    this.#mergePending();

    // 持续处理：如果 update 过程中又注册了新动画，继续合并、继续更新
    let processedCount = 0;

    while (processedCount < this.#queue.length) {
      const anim = this.#queue[processedCount];

      const alive = anim.update(delta);

      if (alive) {
        processedCount++;
      } else {
        this.#queue.splice(processedCount, 1);
        this.#dirty = true;
        // 不前进 processedCount，因为下一个元素移到了当前位置
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
   * 在渲染循环中调用。采用懒排序策略，只在队列变化时重新排序。 渲染顺序：layer 越小越先渲染（底层），越大越后渲染（顶层）。
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
   * 用于判断是否需要阻塞用户输入或游戏逻辑。
   *
   * @param {string[]} [names=[]] - 可选，指定要检查的动画名称列表。 为空时检查所有阻塞动画。. Default is
   *   `[]`
   * @returns {boolean} 存在匹配的阻塞动画则返回 true
   */
  hasBlocking(names = []) {
    const hasNames = names.length > 0;

    for (const animation of this.#queue) {
      // 跳过非阻塞动画
      if (!animation.blocking) continue;

      // 如果指定了名称，只匹配指定名称
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
   */
  clear() {
    this.#queue.length = 0;
    this.#pending.length = 0;
    this.#sorted.length = 0;
    this.#dirty = false;
  }

  /**
   * 将待注册动画合并到活跃队列。
   *
   * @private
   */
  #mergePending() {
    if (this.#pending.length === 0) return;

    this.#queue.push(...this.#pending);
    this.#pending.length = 0;
    this.#dirty = true;
  }
}

export default AnimationSystem;
