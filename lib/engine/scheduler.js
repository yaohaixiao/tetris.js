import Audio from '@/lib/services/audio';

/**
 * ## Scheduler (Game-Loop Driven Version)
 *
 * - No RAF inside
 * - Driven by external game loop
 * - Safe iteration
 * - Cancel-safe
 */
class Scheduler {
  /**
   * ## 构造函数
   *
   * @class
   */
  constructor() {
    this.tasks = new Map();
    this.nextId = 1;
    this.dirty = false;
  }

  /**
   * ## 外部 Game Loop 调用
   *
   * @param {number} [gameTime=performance.now()] - 游戏循环时间. Default is
   *   `performance.now()`
   * @param {number} [audioTime=Audio.Context.currentTime] - 游戏循环时间. Default is
   *   `Audio.Context.currentTime`
   * @returns {void}
   */
  tick(gameTime = performance.now(), audioTime = Audio.Context.currentTime) {
    if (this.tasks.size === 0) {
      return;
    }

    for (const task of this.tasks.values()) {
      if (task.cancelled) {
        this.dirty = true;
        continue;
      }

      switch (task.type) {
        case 'delayAt': {
          if (audioTime < task.audioTime) {
            continue;
          }

          task.fn();

          this.tasks.delete(task.id);
          break;
        }
        case 'delay': {
          if (gameTime < task.time) {
            continue;
          }

          task.fn();

          this.tasks.delete(task.id);
          break;
        }
        case 'interval': {
          if (gameTime < task.nextTime) {
            continue;
          }

          task.fn();

          task.nextTime = gameTime + task.interval;
          break;
        }
      }
    }

    // lazy cleanup
    if (this.dirty) {
      for (const [id, task] of this.tasks) {
        if (!task.cancelled) {
          continue;
        }

        this.tasks.delete(id);
      }

      this.dirty = false;
    }
  }

  /**
   * ## 基于 AudioContext 时间调度一次任务
   *
   * @param {Function} fn - 任务函数
   * @param {number} audioTime - Audio 播放时间
   * @returns {number} - 返回任务 id
   */
  delayAt(fn, audioTime) {
    const id = this.nextId++;

    this.tasks.set(id, {
      id,
      type: 'delayAt',
      audioTime,
      fn,
      cancelled: false,
    });

    return id;
  }

  /**
   * ## 延迟任务（setTimeout replacement）
   *
   * @param {Function} fn - 执行任务的处理函数
   * @param {number} delay - 执行任务的时间延迟
   * @returns {number} - 返回任务 id
   */
  delay(fn, delay = 0) {
    const id = this.nextId++;

    this.tasks.set(id, {
      id,
      type: 'delay',
      time: performance.now() + delay,
      fn,
      cancelled: false,
    });

    return id;
  }

  /**
   * ## 周期任务（setInterval replacement）
   *
   * @param {Function} fn - 执行任务的处理函数
   * @param {number} interval - 执行任务的时间间隔
   * @returns {number} - 返回任务 id
   */
  interval(fn, interval = 1000) {
    const id = this.nextId++;

    this.tasks.set(id, {
      id,
      type: 'interval',
      interval,
      nextTime: performance.now() + interval,
      fn,
      cancelled: false,
    });

    return id;
  }

  /**
   * ## 任务列队
   *
   * - 执行列队中的一系列任务
   *
   * @param {Array} list - 任务列表数据
   * @returns {Array} - 列队任务的 id 值数组
   */
  sequence(list) {
    const ids = [];
    let t = 0;

    for (const item of list) {
      const { delay = 0, fn } = item;

      t += delay;

      ids.push(this.delay(fn, t));
    }

    return ids;
  }

  /**
   * ## 取消任务
   *
   * 通过任务 id 取消任务
   *
   * @param {number} id - 任务 id
   */
  cancel(id) {
    const task = this.tasks.get(id);

    if (!task) {
      return;
    }

    task.cancelled = true;
    this.dirty = true;
  }

  /**
   * ## 清空所有任务
   *
   * - 清空任务
   * - 恢复 dirty
   */
  clear() {
    this.tasks.clear();
    this.dirty = false;
  }

  /**
   * ## Debug helper
   *
   * 帮助测试用
   *
   * @returns {number} - 返回任务数量
   */
  size() {
    return this.tasks.size;
  }
}

export default Scheduler;
