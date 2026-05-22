import Base from '@/lib/core';
import { AnimationsEvents } from '@/lib/events/event-catalog.js';

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
 * ## 使用示例
 *
 * @example
 *   const animSystem = new AnimationSystem({ Game });
 *
 *   // 注册一个淡入淡出动画
 *   animSystem.register({
 *   name: 'fade-in',
 *   layer: 10,
 *   blocking: false,
 *   progress: 0,
 *   update(delta) {
 *   this.progress += delta;
 *   return this.progress < 1; // 进度 < 1 时继续
 *   },
 *   render() {
 *   // 根据 progress 绘制透明效果
 *   ctx.globalAlpha = this.progress;
 *   ctx.drawImage(...);
 *   ctx.globalAlpha = 1;
 *   },
 *   });
 *
 *   // 在主循环中使用
 *   function gameLoop(delta) {
 *   animSystem.update(delta); // 更新所有动画
 *   animSystem.render();      // 渲染所有动画
 *   }
 *
 * @augments Base
 * @class AnimationSystem
 */
class AnimationSystem extends Base {
  /**
   * ## 当前活跃的动画队列
   *
   * 存储所有正在运行的动画对象。 该队列会在 `update()` 过程中动态变化（移除已结束的动画）。
   *
   * @private
   * @type {object[]}
   */
  #queue = [];

  /**
   * ## 等待注册的动画队列
   *
   * 新注册的动画先加入此队列，在下次 `update()` 时合并到 `#queue`。
   * 这种延迟注册机制避免在遍历活跃队列时直接修改数组，防止迭代器失效问题。
   *
   * @private
   * @type {object[]}
   */
  #pending = [];

  /**
   * ## 按 layer 排序后的缓存数组
   *
   * 用于渲染阶段，避免每帧都重新进行排序操作。 只在队列发生变化（`#dirty = true`）时才重新计算。
   *
   * @private
   * @type {object[]}
   */
  #sorted = [];

  /**
   * ## 排序缓存是否需要重新计算
   *
   * 当队列发生变化时（添加动画、移除动画）设为 `true`， 下次 `render()` 时会触发重新排序。 这是一种典型的懒加载（Lazy
   * Loading）优化策略。
   *
   * @private
   * @type {boolean}
   */
  #dirty = false;

  /**
   * ## 当前动画总数（调试用）
   *
   * 返回系统中所有动画的数量，包括：
   *
   * - 活跃队列（`#queue`）中的动画
   * - 待注册队列（`#pending`）中的动画
   *
   * 主要用于调试和监控目的。
   *
   * @type {number}
   */
  get size() {
    return this.#queue.length + this.#pending.length;
  }

  /**
   * ## 构造函数
   *
   * 初始化动画管理系统实例。 注意：构造函数不会自动订阅事件，需要手动调用 `subscribe()`。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例，用于事件通信
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 注册动画
   *
   * 将动画对象注册到系统中。新动画不会立即生效， 而是在下次 `update()` 时合并到活跃队列，避免遍历中修改数组。
   *
   * ### 动画对象验证
   *
   * 系统会严格验证动画对象是否包含必需的方法（`update` 和 `render`）， 如果验证失败会抛出错误，确保系统稳定性。
   *
   * ### 默认值设置
   *
   * - `layer`：默认为 0（最底层）
   * - `blocking`：默认为 false（非阻塞动画）
   * - `name`：默认为 'anonymous'（匿名动画）
   *
   * @example
   *   // 注册一个简单的移动动画
   *   animSystem.register({
   *     name: 'move-right',
   *     layer: 5,
   *     blocking: false,
   *     x: 0,
   *     targetX: 100,
   *     speed: 50,
   *     update(delta) {
   *       this.x += this.speed * delta;
   *       return this.x < this.targetX;
   *     },
   *     render() {
   *       drawSprite(this.x, 0);
   *     },
   *   });
   *
   * @param {object} animation - 动画对象，必须包含 `update()` 和 `render()` 方法
   * @returns {void}
   * @throws {Error} 如果动画对象无效则抛出错误
   */
  register(animation) {
    // 验证动画对象的基本契约：必须包含 update 和 render 方法
    if (
      !animation ||
      typeof animation.update !== 'function' ||
      typeof animation.render !== 'function'
    ) {
      throw new Error(
        'Invalid animation: must implement update() and render()',
      );
    }

    // 为可选属性设置默认值，确保动画对象有完整的属性
    animation.layer ??= 0; // 渲染层级，默认最底层
    animation.blocking ??= false; // 是否阻塞输入，默认非阻塞
    animation.name ??= 'anonymous'; // 动画名称，默认匿名

    // 加入待处理队列，下一帧生效（避免在遍历过程中修改队列）
    this.#pending.push(animation);
    // 标记排序缓存已失效，下次渲染时需要重新排序
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
   * 4. 处理 `update()` 过程中新注册的动画（增量合并）
   *
   * ### 安全更新机制
   *
   * 使用 while 循环和游标方式遍历，支持在更新过程中安全地移除动画。 当动画返回 `false` 时立即从队列中移除，并保持游标位置不变。
   *
   * ### 增量注册支持
   *
   * 如果在某个动画的 `update()` 方法中注册了新动画，系统会立即合并这些新动画， 确保它们在同一帧内也能被更新（如果注册时已遍历到的位置之后）。
   *
   * @example
   *   // 在游戏循环中调用
   *   let lastTime = performance.now();
   *   function animate(currentTime) {
   *     const delta = (currentTime - lastTime) / 1000;
   *     animSystem.update(delta);
   *     lastTime = currentTime;
   *     requestAnimationFrame(animate);
   *   }
   *
   * @param {number} delta - 距离上一帧的时间差（秒），用于基于时间的动画计算
   * @returns {void}
   */
  update(delta) {
    // 首先合并上一帧中等待注册的动画队列
    this.#mergePending();

    /*
     * 持续处理：如果 update 过程中又注册了新动画，继续合并、继续更新
     * 这样可以保证新注册的动画在本帧内也能被处理（如果注册位置合适）
     */
    let processedCount = 0;

    while (processedCount < this.#queue.length) {
      const anim = this.#queue[processedCount];

      // 调用动画的 update 方法，返回 false 表示动画已结束
      const alive = anim.update(delta);

      if (alive) {
        // 动画继续存活，前进游标处理下一个动画
        processedCount++;
      } else {
        /**
         * 动画已结束，从队列中移除：
         *
         * 使用 splice 移除当前元素，processedCount 不增加 因为下一个元素会自动移到当前位置
         */
        this.#queue.splice(processedCount, 1);
        // 标记排序缓存需要重新计算
        this.#dirty = true;
        // 不前进 processedCount，因为下一个元素自动移到了当前位置
      }

      /*
       * 如果在更新过程中有新动画注册，立刻合并到活跃队列
       * 这样可以确保新动画也能在本帧被更新（如果注册时间早于当前游标）
       */
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
   * 这种分层渲染机制确保正确的视觉叠加效果：
   *
   * - 底层动画（如背景云彩）先绘制
   * - 中层动画（如游戏特效）后绘制
   * - 顶层动画（如 UI 提示）最后绘制
   *
   * ### 性能优化
   *
   * 排序操作的时间复杂度为 O(n log n)，通过懒排序策略， 只有在队列实际发生变化时才重新排序，避免每帧都进行不必要的排序。
   *
   * @example
   *   // 在游戏循环中调用
   *   function render() {
   *     ctx.clearRect(0, 0, width, height);
   *     // 绘制游戏基础内容...
   *     animSystem.render(); // 绘制所有动画层
   *   }
   *
   * @returns {void}
   */
  render() {
    // 懒排序：仅在 dirty 标记为 true 时才重新排序
    if (this.#dirty) {
      // 使用 toSorted 创建新数组进行排序，保持原队列不变，按 layer 升序排列：layer 越小越先渲染
      this.#sorted = this.#queue.slice().toSorted((a, b) => a.layer - b.layer);
      // 重置 dirty 标记
      this.#dirty = false;
    }

    // 按排序后的顺序逐个渲染动画
    for (const animation of this.#sorted) {
      animation.render();
    }
  }

  /**
   * ## 检查是否存在阻塞性动画
   *
   * 阻塞动画会暂停用户输入或游戏逻辑（如消行特效、倒计时、过场动画等）。 此方法用于判断是否应该阻塞用户交互或游戏进程。
   *
   * ### 使用场景
   *
   * - **输入阻塞**：存在阻塞动画时，忽略用户输入，防止操作冲突
   * - **游戏逻辑阻塞**：等待特效播放完成后再继续游戏逻辑
   * - **流程控制**：按动画名称精确控制哪些动画会阻塞特定功能
   *
   * @example
   *   // 检查是否有任何阻塞动画
   *   if (animSystem.hasBlocking()) {
   *     return; // 有阻塞动画，暂停处理输入
   *   }
   *
   *   // 只检查消行和倒计时动画
   *   if (animSystem.hasBlocking(['clear-lines', 'countdown'])) {
   *     return; // 特效播放中，等待完成
   *   }
   *
   * @param {string[]} [names=[]] - 可选，指定要检查的动画名称列表。 为空时检查所有阻塞动画。默认值为 `[]`.
   *   Default is `[]`
   * @returns {boolean} 存在匹配的阻塞动画则返回 `true`，否则返回 `false`
   */
  hasBlocking(names = []) {
    const hasNames = names.length > 0;

    // 遍历当前活跃动画队列
    for (const animation of this.#queue) {
      // 跳过非阻塞动画
      if (!animation.blocking) {
        continue;
      }

      // 如果指定了名称列表，只匹配指定名称的动画，否则（未指定名称）匹配所有阻塞动画
      if (!hasNames || names.includes(animation.name)) {
        return true; // 找到匹配的阻塞动画
      }
    }

    return false; // 未找到匹配的阻塞动画
  }

  /**
   * ## 清空所有动画
   *
   * 移除系统中的所有动画，重置内部状态。 通常在游戏重置、场景切换或紧急清理时使用。
   *
   * ### 清空范围
   *
   * - 清空活跃队列（`#queue`）
   * - 清空待注册队列（`#pending`）
   * - 清空排序缓存（`#sorted`）
   * - 重置 dirty 标记
   *
   * @example
   *   // 游戏重置时清空所有动画
   *   function resetGame() {
   *     animSystem.clear();
   *     // 其他重置逻辑...
   *   }
   *
   * @returns {void}
   */
  clear() {
    // 清空所有队列和缓存
    this.#queue.length = 0; // 清空活跃动画队列
    this.#pending.length = 0; // 清空待注册队列
    this.#sorted.length = 0; // 清空排序缓存
    this.#dirty = false; // 重置 dirty 标记
  }

  /**
   * ## 合并待注册动画到活跃队列
   *
   * 将 `#pending` 中的动画全部移入 `#queue`，并标记排序缓存失效。 这是一个批量操作，一次性转移所有等待注册的动画。
   *
   * ### 设计原因
   *
   * 使用延迟队列而非直接注册的原因：
   *
   * 1. **遍历安全**：避免在遍历 `#queue` 时直接修改数组
   * 2. **批量操作**：减少多次转移的开销
   * 3. **性能优化**：只在必要时（update 开始时）进行一次合并
   *
   * @private
   * @returns {void}
   */
  #mergePending() {
    // 没有待注册动画时直接返回
    if (this.#pending.length === 0) return;

    // 批量转移所有待注册动画到活跃队列
    this.#queue.push(...this.#pending);
    // 清空待注册队列
    this.#pending.length = 0;
    // 标记排序缓存需要重新计算（因为队列发生了变化）
    this.#dirty = true;
  }

  /**
   * ## 订阅动画系统事件
   *
   * 监听 `animations:<id>:clear` 事件，用于外部触发清空操作。
   *
   * ### 事件说明
   *
   * - 事件名称：`animations:{gameId}:clear`
   * - 触发时机：外部需要清空所有动画时（如游戏重置）
   * - 响应动作：调用 `clear()` 方法清空所有动画
   *
   * @example
   *   // 初始化时订阅事件
   *   animSystem.subscribe();
   *
   *   // 外部触发清空
   *   eventBus.emit('animations:game1:clear');
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const events = AnimationsEvents(Game.id);
    // 监听清空事件
    this.on(events.CLEAR, this._onClear);
  }

  /**
   * ## 取消订阅动画系统事件
   *
   * 移除对 `animations:<id>:clear` 事件的监听。 在组件销毁或不需要响应清空事件时调用，避免内存泄漏。
   *
   * @example
   *   // 销毁前取消订阅
   *   function destroy() {
   *     animSystem.unsubscribe();
   *     animSystem.clear();
   *   }
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = AnimationsEvents(Game.id);
    // 移除清空事件监听
    this.off(events.CLEAR, this._onClear);
  }

  /**
   * ## 处理清空事件
   *
   * 当接收到 `animations:<id>:clear` 事件时的回调函数。 执行清空所有动画的操作。
   *
   * @private
   * @returns {void}
   */
  _onClear = () => {
    this.clear();
  };
}

export default AnimationSystem;
