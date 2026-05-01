/**
 * # Animation System
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
 * @module AnimationSystem
 * @example
 *   ```javascript
 *   const animSystem = createAnimationSystem();
 *
 *   // 创建动画对象
 *   const fadeIn = {
 *     name: 'fade-in',
 *     layer: 10,
 *     blocking: false,
 *     progress: 0,
 *     update(delta) {
 *       this.progress += delta;
 *       return this.progress < 1; // 返回 false 表示动画结束
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
 * @property {function(string[]): boolean} hasBlocking - 检查阻塞动画是否存在
 * @property {function(): void} clear - 清空所有动画
 * @property {number} size - 当前动画总数（只读）
 */

/**
 * ## 创建一个新的动画系统实例
 *
 * @returns {AnimationSystem} 动画系统 API 对象
 */
const createAnimationSystem = () => {
  /**
   * ## 当前活跃的动画队列
   *
   * @type {Animation[]}
   */
  const queue = [];

  /**
   * ## 等待注册的动画队列（延迟到下一帧生效）
   *
   * @type {Animation[]}
   */
  const pending = [];

  /**
   * ## 按 Layer 排序后的缓存数组，用于高效渲染
   *
   * @type {Animation[]}
   */
  let sorted = [];

  /**
   * ## 排序缓存是否需要重新计算
   *
   * @type {boolean}
   */
  let dirty = false;

  return {
    /**
     * ## 注册动画
     *
     * 将动画对象注册到系统中。为了提高性能，新注册的动画不会立即生效， 而是在下一次 update() 调用时才被合并到活跃队列中。
     *
     * @example
     *   ```javascript
     *   const myAnim = {
     *     name: 'explosion',
     *     layer: 100,
     *     blocking: true,
     *     update(delta) {
     *       // 返回 false 时动画会自动被移除
     *       return this.frameCount++ < 60;
     *     },
     *     render() {
     *       // 每帧绘制动画
     *       drawExplosion();
     *     }
     *   };
     *   system.register(myAnim);
     *   ```;
     *
     * @param {Animation} animation - 动画对象，必须包含 update() 和 render() 方法
     * @throws {Error} 如果动画对象无效（缺少必要方法）则抛出错误
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

      // 为可选属性设置默认值（防止 undefined 导致的异常）
      animation.layer ??= 0; // 默认层为 0（最底层）
      animation.blocking ??= false; // 默认非阻塞
      animation.name ??= 'anonymous'; // 默认名称

      // 加入待处理队列，避免在遍历过程中修改数组
      pending.push(animation);
      dirty = true; // 标记需要重新排序
    },

    /**
     * ## 更新所有动画
     *
     * 在游戏逻辑循环中调用，更新所有活跃动画的状态。 会依次执行以下操作：
     *
     * 1. 将待注册的动画合并到活跃队列
     * 2. 遍历所有动画并调用其 update() 方法
     * 3. 自动移除已结束的动画（update() 返回 false）
     *
     * @example
     *   ```javascript
     *   let lastTime = performance.now();
     *
     *   function update() {
     *     const now = performance.now();
     *     const delta = Math.min(0.033, (now - lastTime) / 1000);
     *     lastTime = now;
     *
     *     system.update(delta);
     *     requestAnimationFrame(update);
     *   }
     *   ```;
     *
     * @param {number} delta - 距离上一帧的时间差（秒），用于平滑动画
     */
    update(delta) {
      /*
       * ===== 步骤1：合并待注册动画 =====
       * 将上一帧注册的动画从 pending 移到 queue
       */
      if (pending.length > 0) {
        queue.push(...pending);
        pending.length = 0; // 清空 pending 数组
      }

      /*
       * ===== 步骤2：更新所有活跃动画 =====
       * 从后向前遍历，以便在删除元素时不影响索引
       */
      for (let i = queue.length - 1; i >= 0; i--) {
        const anim = queue[i];
        const alive = anim.update(delta); // 调用动画更新逻辑

        // 如果动画返回 false，表示动画已结束，需要从队列中移除
        if (!alive) {
          queue.splice(i, 1);
          dirty = true; // 队列变化，需要重新排序
        }
      }

      /*
       * ===== 步骤3：关键补丁 - 再次合并 =====
       * 处理在动画 update() 过程中新注册的动画
       * 这确保了在同一次 update 周期内注册的动画不会丢失
       */
      if (pending.length > 0) {
        queue.push(...pending);
        pending.length = 0;
        dirty = true;
      }
    },

    /**
     * ## 渲染所有动画
     *
     * 在渲染循环中调用，绘制所有动画效果。 采用排序缓存机制，只在必要时重新计算渲染顺序，提升性能。
     *
     * 渲染顺序由动画的 layer 属性决定：
     *
     * - Layer 值越小，越先渲染（在底层）
     * - Layer 值越大，越后渲染（在顶层）
     */
    render() {
      /*
       * ===== 懒排序策略 =====
       * 只有在队列发生变化时才重新排序（dirty = true）
       */
      if (dirty) {
        // 使用 toSorted() 创建新数组，避免修改原数组
        sorted = queue.slice().toSorted((a, b) => a.layer - b.layer);
        dirty = false; // 重置脏标记
      }

      // 按排序后的顺序逐个渲染动画
      for (const animation of sorted) {
        animation.render();
      }
    },

    /**
     * ## 检查是否存在阻塞性动画
     *
     * 用于判断是否需要阻塞用户输入或游戏逻辑。 常用于等待关键动画（如倒计时、升级特效）播放完成。
     *
     * @example
     *   ```javascript
     *   // 检查是否有任何阻塞动画
     *   if (system.hasBlocking()) {
     *     // 禁止用户输入
     *     return;
     *   }
     *
     *   // 只检查特定的阻塞动画
     *   if (system.hasBlocking(['countdown', 'level-up'])) {
     *     // 等待倒计时或升级动画结束
     *   }
     *   ```;
     *
     * @param {string[]} [names=[]] - 可选的动画名称列表。 如果提供，只检查指定名称的动画；
     *   如果为空数组，检查所有阻塞性动画。. Default is `[]`
     * @returns {boolean} 如果存在匹配的阻塞动画则返回 true，否则返回 false
     */
    hasBlocking(names = []) {
      // 判断是否需要过滤特定的动画名称
      const hasNames = Array.isArray(names) && names.length > 0;

      // 遍历所有活跃动画
      for (const animation of queue) {
        // 跳过非阻塞动画
        if (!animation.blocking) continue;

        // 如果指定了名称列表，只检查匹配的动画
        if (!hasNames || names.includes(animation.name)) {
          return true; // 发现匹配的阻塞动画
        }
      }

      return false; // 没有找到阻塞动画
    },

    /**
     * ## 清空所有动画
     *
     * 移除系统中的所有动画，重置内部状态。 通常在游戏重置、场景切换或紧急清理时使用。
     *
     * @example
     *   ```javascript
     *   // 游戏结束时清理所有动画
     *   function onGameOver() {
     *     system.clear();
     *     showGameOverScreen();
     *   }
     *   ```;
     */
    clear() {
      queue.length = 0; // 清空活跃队列
      pending.length = 0; // 清空待处理队列
      sorted.length = 0; // 清空排序缓存
      dirty = false; // 重置脏标记
    },

    /**
     * ## 获取系统中动画的总数量（调试用）
     *
     * @example
     *   ```javascript
     *   console.log(`当前动画数量: ${system.size}`);
     *   if (system.size > 100) {
     *   console.warn('动画数量过多，可能存在内存泄漏');
     *   }
     *   ```
     *
     * @returns {number} 活跃动画和待处理动画的总数
     */
    get size() {
      return queue.length + pending.length;
    },
  };
};

export default createAnimationSystem;
