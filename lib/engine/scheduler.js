/**
 * # Scheduler（任务调度器）
 *
 * 游戏核心的任务调度引擎，替代 `setTimeout`/`setInterval`， 由外部 Game Loop 每帧通过 `tick()` 驱动。
 *
 * ## 核心特性
 *
 * - **绝对时间模型（Absolute Time）**：任务绑定绝对时间戳，不依赖 `tick` 初始化
 * - **有序任务队列（Sorted Queue）**：按 `time + order` 排序，保证执行顺序稳定
 * - **时间漂移修复（Interval Drift Fix）**：Interval 从 `nextTime` 精确计算，避免累积误差
 * - **补帧保护（Catch-up Protection）**：限制单次 `tick` 最大补帧数，防止切后台后卡死
 *
 * ## 任务类型
 *
 * | 类型     | 方法         | 说明                   |
 * | -------- | ------------ | ---------------------- |
 * | delay    | `delay()`    | 一次性延迟任务         |
 * | interval | `interval()` | 周期性重复任务         |
 * | sequence | `sequence()` | 按时间偏移的顺序任务链 |
 *
 * ## 设计理念
 *
 * - **不依赖 RAF**：由外部 `startGameLoop` 驱动，与渲染循环解耦
 * - **稳定排序**：同一时间任务按 `order` 执行，保证音效序列等场景的时序一致
 * - **Lazy Cleanup**：取消任务仅标记 `cancelled`，在 `tick` 末尾统一清理
 *
 * @class Scheduler
 */
class Scheduler {
  /**
   * ## 构造函数
   *
   * 初始化空任务队列、ID 计数器和顺序计数器。
   */
  constructor() {
    /**
     * ## 任务队列
     *
     * 按 `time + order` 升序排列的有序数组。 替代 Map 实现，避免全遍历，保证时间顺序和执行稳定性。
     *
     * @type {object[]}
     */
    this.tasks = [];

    /**
     * ## 下一个任务 ID
     *
     * 自增计数器，每个任务分配唯一 ID。
     *
     * @type {number}
     */
    this.nextId = 1;

    /**
     * ## 顺序计数器
     *
     * 同一时间点的任务按 `order` 升序执行，保证稳定排序。
     *
     * @type {number}
     */
    this.order = 0;

    /**
     * ## 当前逻辑时间
     *
     * 由 `tick(gameTime)` 每帧更新。
     *
     * @type {number}
     */
    this.now = performance.now();

    /**
     * ## 延迟清理标记
     *
     * 有任务被取消时设为 `true`，在下次 `tick` 末尾统一清理。
     *
     * @type {boolean}
     */
    this.dirty = false;

    /**
     * ## 最大补帧数
     *
     * 单次 `tick` 中 Interval 任务的最大补执行次数，防止长时间暂停后瞬间爆帧。
     *
     * @type {number}
     */
    this.maxCatchUp = 5;
  }

  /* ================== 公共 API ================== */

  /**
   * ## 创建延迟任务
   *
   * 替代 `setTimeout`，在当前逻辑时间 + 指定延迟后执行一次回调。
   *
   * @example
   *   const id = scheduler.delay(() => console.log('done'), 100);
   *
   * @param {Function} fn - 回调函数
   * @param {number} [delay=0] - 延迟时间（毫秒）。默认值为 `0`. Default is `0`
   * @returns {number} 任务 ID，可用于 `cancel()`
   */
  delay(fn, delay = 0) {
    const id = this.nextId++;

    this._insertTask({
      id,
      type: 'delay',
      fn,
      time: this.now + delay,
      cancelled: false,
      order: this.order++,
    });

    return id;
  }

  /**
   * ## 创建周期任务
   *
   * 替代 `setInterval`，按指定间隔周期性执行回调。
   *
   * @example
   *   const id = scheduler.interval(() => console.log('tick'), 200);
   *
   * @param {Function} fn - 回调函数
   * @param {number} [interval=1000] - 执行间隔（毫秒）。默认值为 `1000`. Default is `1000`
   * @returns {number} 任务 ID，可用于 `cancel()`
   */
  interval(fn, interval = 1000) {
    const id = this.nextId++;

    this._insertTask({
      id,
      type: 'interval',
      fn,
      interval,
      time: this.now + interval,
      nextTime: this.now + interval,
      cancelled: false,
      order: this.order++,
    });

    return id;
  }

  /**
   * ## 创建任务序列
   *
   * 按时间偏移顺序执行多个任务。每个任务可指定相对于序列起始时间的延迟。 内部使用 `delay()` 实现，直接绑定绝对时间，不依赖 `tick`
   * 初始化。
   *
   * @example
   *   scheduler.sequence([
   *     { fn: () => playNote('C4') },
   *     { fn: () => playNote('E4'), delay: 260 },
   *     { fn: () => playNote('G4'), delay: 260 },
   *   ]);
   *
   * @param {{ fn: Function; delay?: number }[]} list - 任务列表
   * @param {Function} list[].fn - 回调函数
   * @param {number} [list[].delay=0] - 该任务相对于上一个任务的延迟（毫秒）。默认值为 `0`. Default is
   *   `0`
   * @returns {number[]} 所有任务的 ID 数组
   */
  sequence(list) {
    const ids = [];
    let t = 0;

    for (const item of list) {
      const { fn, delay = 0 } = item;
      t += delay;
      ids.push(this.delay(fn, t));
    }

    return ids;
  }

  /**
   * ## 取消任务
   *
   * 通过任务 ID 标记任务为取消状态。 取消的任务不会立即删除，而是在下一次 `tick()` 时批量清理。
   *
   * @param {number} id - 要取消的任务 ID
   * @returns {void}
   */
  cancel(id) {
    const task = this.tasks.find((t) => t.id === id);

    if (!task) return;

    task.cancelled = true;
    this.dirty = true;
  }

  /**
   * ## 清空所有任务
   *
   * 立即删除所有任务并清除脏标记。 通常在游戏重启或模式切换时调用。
   *
   * @returns {void}
   */
  clear() {
    this.tasks.length = 0;
    this.dirty = false;
  }

  /**
   * ## 驱动调度器
   *
   * 由外部 Game Loop 每帧调用，传入当前游戏时间。 遍历到期任务并执行，最后清理已取消的任务。
   *
   * @param {number} [gameTime=performance.now()] - 当前游戏时间戳（毫秒）。默认值为
   *   `performance.now()`. Default is `performance.now()`
   * @returns {void}
   */
  tick(gameTime = performance.now()) {
    this.now = gameTime;

    if (this.tasks.length === 0) return;

    this._executeDueTasks(gameTime);
    this._cleanup();
  }

  /**
   * ## 获取任务数量
   *
   * Debug 辅助方法，用于测试和调试。
   *
   * @returns {number} 当前任务队列中的任务数量
   */
  size() {
    return this.tasks.length;
  }

  /* ================== 核心引擎（私有） ================== */

  /**
   * ## 插入任务并保持队列有序
   *
   * 使用插入排序将任务按 `time + order` 升序排列。 同一时间点的任务按 `order` 保证执行顺序稳定。
   *
   * @private
   * @param {object} task - 任务对象
   * @returns {void}
   */
  _insertTask(task) {
    const { tasks } = this;
    let i = tasks.length;

    /**
     * 插入排序：从队尾向前找到正确位置
     *
     * 排序规则：
     *
     * 1. `time` 小的在前
     * 2. `time` 相同时 `order` 小的在前
     */
    while (i > 0) {
      const prev = tasks[i - 1];

      if (
        prev.time < task.time ||
        (prev.time === task.time && prev.order <= task.order)
      ) {
        break;
      }

      tasks[i] = tasks[i - 1];
      i--;
    }

    tasks[i] = task;
  }

  /**
   * ## 执行所有到期任务
   *
   * 从队头依次取出 `time <= gameTime` 的任务，按类型分发处理。
   *
   * @private
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _executeDueTasks(gameTime) {
    let catchUpTaskCount = 0;

    while (this.tasks.length > 0 && this.tasks[0].time <= gameTime) {
      const task = this.tasks.shift();

      if (task.cancelled) continue;

      if (task.type === 'delay') {
        this._runDelayTask(task);
      } else if (task.type === 'interval') {
        this._runIntervalTask(task, gameTime);
      }

      // 安全阀：防止极端情况下无限循环
      if (++catchUpTaskCount > this.maxCatchUp * 10) break;
    }
  }

  /**
   * ## 执行 Delay 任务
   *
   * 一次性任务，执行后即结束。
   *
   * @private
   * @param {object} task - 延迟任务对象
   * @returns {void}
   */
  _runDelayTask(task) {
    task.fn(task);
  }

  /**
   * ## 执行 Interval 任务
   *
   * 周期任务，执行后更新 `nextTime` 并重新插入队列。 包含补帧保护：长时间暂停后最多补 `maxCatchUp` 次， 超过后重置
   * `nextTime` 为当前时间，防止瞬间爆帧。
   *
   * @private
   * @param {object} task - 周期任务对象
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _runIntervalTask(task, gameTime) {
    let catchUp = 0;

    /** 补帧循环： 如果 `nextTime` 落后于当前时间，连续补执行， 最多 `maxCatchUp` 次，防止长时间暂停后爆炸。 */
    while (
      task.nextTime <= gameTime &&
      !task.cancelled &&
      catchUp < this.maxCatchUp
    ) {
      catchUp++;
      task.fn(task);
      task.nextTime += task.interval;
    }

    /** 达到补帧上限：重置 nextTime 为当前时间， 放弃追赶，避免瞬间执行大量回调。 */
    if (catchUp >= this.maxCatchUp) {
      task.nextTime = gameTime + task.interval;
    }

    // 未取消则重新插入队列等待下次触发
    if (!task.cancelled) {
      // 同步 time
      task.time = task.nextTime;
      this._insertTask(task);
    }
  }

  /**
   * ## 批量清理已取消的任务
   *
   * 延迟清理机制：有脏标记时才执行清理。 过滤掉所有 `cancelled === true` 的任务。
   *
   * @private
   * @returns {void}
   */
  _cleanup() {
    if (!this.dirty) return;

    this.tasks = this.tasks.filter((t) => !t.cancelled);
    this.dirty = false;
  }
}

export default Scheduler;
