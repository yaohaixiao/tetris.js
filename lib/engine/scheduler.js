/**
 * # 任务调度器（Scheduler）
 *
 * 一个轻量级的、由外部游戏循环驱动的任务调度系统， 替代传统的 `setTimeout` / `setInterval`，实现确定性的任务管理。
 *
 * ## 设计特点
 *
 * - **无内部 RAF**：不依赖 requestAnimationFrame，完全由外部 Game Loop 驱动
 * - **统一时间源**：使用 `performance.now()` 作为时间基准
 * - **安全迭代**：任务可在执行过程中安全地添加/取消
 * - **延迟清理**：取消的任务不会立即删除，而是标记后批量清理（lazy cleanup）
 *
 * ## 任务类型
 *
 * | 类型       | 说明                       | 替代            |
 * | ---------- | -------------------------- | --------------- |
 * | `delay`    | 一次性延迟执行             | setTimeout      |
 * | `interval` | 周期性重复执行             | setInterval     |
 * | `sequence` | 按时间偏移顺序执行多个任务 | 组合 setTimeout |
 *
 * ## 使用场景
 *
 * - **游戏主循环**：每帧调用 `tick()` 执行到期的任务
 * - **AI 决策循环**：通过 `delay` 控制 AI 思考和动作的节奏
 * - **音效序列**：通过 `sequence` 按时间偏移播放和弦音效
 * - **动画系统**：通过 `interval` 驱动帧动画
 *
 * @class Scheduler
 */
class Scheduler {
  /**
   * ## 构造函数
   *
   * 初始化空的任务映射表和 ID 计数器。
   */
  constructor() {
    /**
     * ## 任务映射表
     *
     * 使用 Map 存储所有任务，key 为任务 ID，value 为任务对象。
     *
     * @type {Map<number, object>}
     */
    this.tasks = new Map();

    /**
     * ## 下一个任务 ID
     *
     * 自增计数器，确保每个任务有唯一 ID。
     *
     * @default 1
     * @type {number}
     */
    this.nextId = 1;

    /**
     * ## 脏标记
     *
     * 当有任务被标记为取消时设为 true， 下一次 tick 时触发批量清理。
     *
     * @default false
     * @type {boolean}
     */
    this.dirty = false;
  }

  /**
   * ## 驱动调度器
   *
   * 由外部 Game Loop 每帧调用，传入当前游戏时间。 遍历所有任务，执行到期的任务，并清理已取消的任务。
   *
   * ### 执行逻辑
   *
   * 1. 如果任务表为空，直接返回
   * 2. 遍历所有任务：
   *
   *    - 已取消的任务：标记 dirty，跳过
   *    - Delay 任务：首次设置 startTime，到期后执行并删除
   *    - Interval 任务：首次设置 startTime 和 nextTime，到期后执行并更新 nextTime
   * 3. 如果 dirty 为 true，批量删除已取消的任务
   *
   * @param {number} [gameTime=performance.now()] - 当前游戏时间戳（毫秒）。默认值为
   *   `performance.now()`. Default is `performance.now()`
   * @returns {void}
   */
  tick(gameTime = performance.now()) {
    // 没有任务，直接退出
    if (this.tasks.size === 0) {
      return;
    }

    this._executeDueTasks(gameTime);
    this._cleanupCancelledTasks();
  }

  /**
   * ## 执行到期任务
   *
   * 遍历所有任务，初始化并执行到期的任务。
   *
   * @private
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _executeDueTasks(gameTime) {
    for (const task of this.tasks.values()) {
      if (task.cancelled) {
        this.dirty = true;
        continue;
      }

      this._processTask(task, gameTime);
    }
  }

  /**
   * ## 处理单个任务
   *
   * 根据任务类型进行初始化、判断和执行。
   *
   * @private
   * @param {object} task - 任务对象
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _processTask(task, gameTime) {
    switch (task.type) {
      case 'delay': {
        this._processDelayTask(task, gameTime);
        break;
      }
      case 'interval': {
        this._processIntervalTask(task, gameTime);
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * ## 处理延迟任务
   *
   * 首次设置 startTime，到期后执行并删除。
   *
   * @private
   * @param {object} task - 延迟任务对象
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _processDelayTask(task, gameTime) {
    if (task.startTime === undefined) {
      task.startTime = gameTime;
    }

    if (gameTime - task.startTime < task.delay) {
      return;
    }

    task.fn();
    this.tasks.delete(task.id);
  }

  /**
   * ## 处理周期任务
   *
   * 首次设置 startTime 和 nextTime，到期后执行并更新 nextTime。
   *
   * @private
   * @param {object} task - 周期任务对象
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _processIntervalTask(task, gameTime) {
    if (task.startTime === undefined) {
      task.startTime = gameTime;
      task.nextTime = gameTime + task.interval;
    }

    if (gameTime < task.nextTime) {
      return;
    }

    task.fn();
    task.nextTime = gameTime + task.interval;
  }

  /**
   * ## 批量清理已取消的任务
   *
   * 延迟清理机制：有脏标记时才执行清理。
   *
   * @private
   * @returns {void}
   */
  _cleanupCancelledTasks() {
    if (!this.dirty) {
      return;
    }

    for (const [id, task] of this.tasks) {
      if (task.cancelled) {
        this.tasks.delete(id);
      }
    }

    this.dirty = false;
  }

  /**
   * ## 创建延迟任务
   *
   * 替代 `setTimeout`，在指定延迟后执行一次回调函数。
   *
   * @example
   *   // 100ms 后执行
   *   const id = scheduler.delay(() => console.log('done'), 100);
   *
   * @param {Function} fn - 要执行的回调函数
   * @param {number} delay - 延迟时间（毫秒）。默认值为 `0`
   * @returns {number} 任务 ID，可用于后续取消
   */
  delay(fn, delay = 0) {
    const id = this.nextId++;

    this.tasks.set(id, {
      id,
      type: 'delay',
      delay,
      fn,
      cancelled: false,
    });

    return id;
  }

  /**
   * ## 创建周期任务
   *
   * 替代 `setInterval`，按指定间隔周期性执行回调函数。
   *
   * @example
   *   // 每 200ms 执行一次
   *   const id = scheduler.interval(() => console.log('tick'), 200);
   *
   * @param {Function} fn - 要执行的回调函数
   * @param {number} interval - 执行间隔（毫秒）。默认值为 `1000`
   * @returns {number} 任务 ID，可用于后续取消
   */
  interval(fn, interval = 1000) {
    const id = this.nextId++;

    this.tasks.set(id, {
      id,
      type: 'interval',
      interval,
      fn,
      cancelled: false,
    });

    return id;
  }

  /**
   * ## 创建任务序列
   *
   * 按时间偏移顺序执行多个任务。 每个任务可以指定相对于序列起始时间的延迟。
   *
   * @example
   *   // 立即播放音符 1，260ms 后播放音符 2，520ms 后播放音符 3
   *   scheduler.sequence([
   *     { fn: () => playNote('C4') },
   *     { fn: () => playNote('E4'), delay: 260 },
   *     { fn: () => playNote('G4'), delay: 260 },
   *   ]);
   *
   * @param {{ fn: Function; delay?: number }[]} list - 任务列表
   * @param {Function} list[].fn - 要执行的回调函数
   * @param {number} [list[].delay=0] - 该任务相对于上一个任务的延迟（毫秒）. Default is `0`
   * @returns {number[]} 所有任务的 ID 数组
   */
  sequence(list) {
    const ids = [];
    // 累积时间偏移
    let t = 0;

    for (const item of list) {
      const { delay = 0, fn } = item;

      // 累加延迟，实现顺序执行
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
    const task = this.tasks.get(id);

    // 任务不存在，直接返回
    if (!task) {
      return;
    }

    // 标记为取消，并设置脏标记
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
    this.tasks.clear();
    this.dirty = false;
  }

  /**
   * ## 获取任务数量
   *
   * Debug 辅助方法，用于测试和调试。
   *
   * @returns {number} 当前任务表中的任务数量
   */
  size() {
    return this.tasks.size;
  }
}

export default Scheduler;
