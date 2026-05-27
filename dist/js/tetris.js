var tetris = (() => {
  // lib/configuration.js
  var Configuration = {
    Elements: {
      Main: {
        cols: 10,
        rows: 20,
        board: "tetris-game-board",
        next: "tetris-next-piece"
      },
      Hud: {
        controller: "tetris-controller",
        score: "tetris-score",
        lines: "tetris-lines",
        level: "tetris-level",
        highScore: "tetris-high-score"
      },
      Controls: {
        back: "tetris-btn-back",
        start: "tetris-btn-start",
        up: "tetris-dpad-up",
        down: "tetris-dpad-down",
        left: "tetris-dpad-left",
        right: "tetris-dpad-right",
        a: "tetris-btn-a",
        b: "tetris-btn-b",
        x: "tetris-btn-x",
        y: "tetris-btn-y"
      }
    }
  };
  var configuration_default = Configuration;

  // lib/engine/scheduler.js
  var Scheduler = class {
    /**
     * ## 构造函数
     *
     * 初始化空任务队列、ID 计数器和顺序计数器。
     */
    constructor() {
      this.tasks = [];
      this.nextId = 1;
      this.order = 0;
      this.now = performance.now();
      this.dirty = false;
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
        type: "delay",
        fn,
        time: this.now + delay,
        cancelled: false,
        order: this.order++
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
    interval(fn, interval = 1e3) {
      const id = this.nextId++;
      this._insertTask({
        id,
        type: "interval",
        fn,
        interval,
        time: this.now + interval,
        nextTime: this.now + interval,
        cancelled: false,
        order: this.order++
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
      if (!task) {
        return;
      }
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
      while (i > 0) {
        const prev = tasks[i - 1];
        if (prev.time < task.time || prev.time === task.time && prev.order <= task.order) {
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
      while (this.tasks.length > 0 && this.tasks[0].time <= gameTime) {
        const task = this.tasks.shift();
        if (task.cancelled) continue;
        if (task.type === "delay") {
          this._runDelayTask(task);
        } else if (task.type === "interval") {
          this._runIntervalTask(task, gameTime);
        }
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
      while (task.nextTime <= gameTime && !task.cancelled && catchUp < this.maxCatchUp) {
        catchUp++;
        task.fn(task);
        task.nextTime += task.interval;
      }
      if (catchUp >= this.maxCatchUp) {
        task.nextTime = gameTime + task.interval;
      }
      if (!task.cancelled) {
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
  };
  var scheduler_default = Scheduler;

  // lib/utils/is-function.js
  var isFunction = (val) => {
    if (val == null || typeof val !== "function" && typeof val !== "object") {
      return false;
    }
    return (
      // 处理某些特殊环境下 typeof 误判为 object 的函数（极少数情况）
      typeof val === "function" || Object.prototype.toString.call(val) === "[object Function]"
    );
  };
  var is_function_default = isFunction;

  // lib/utils/is-string.js
  var isString = (str) => typeof str === "string";
  var is_string_default = isString;

  // lib/core/event-bus/index.js
  var EventBus = {
    /**
     * ## 事件订阅映射表
     *
     * Key 为事件名称，Value 为该事件对应的处理函数集合。
     *
     * @type {Map<string, Set<Function>>}
     */
    events: /* @__PURE__ */ new Map(),
    /**
     * ## 订阅事件
     *
     * 注册一个处理函数，每当事件触发时都会调用。 如果事件不存在，会自动创建。 相同的 handler 不会重复注册（Set 去重）。
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 处理函数，接收 `payload` 作为参数
     * @returns {void}
     */
    on(event, handler) {
      if (!is_string_default(event) || !is_function_default(handler)) {
        return;
      }
      if (!this.events.has(event)) {
        this.events.set(event, /* @__PURE__ */ new Set());
      }
      this.events.get(event).add(handler);
    },
    /**
     * ## 订阅事件，仅触发一次
     *
     * 注册的处理函数在第一次触发后自动取消订阅。 内部通过创建包装函数实现，触发后在 `finally` 中调用 `off`。
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 处理函数，接收 `payload` 作为参数
     * @returns {void}
     */
    once(event, handler) {
      if (!is_string_default(event) || !is_function_default(handler)) {
        return;
      }
      const wrapper = (payload) => {
        try {
          handler(payload);
        } finally {
          this.off(event, wrapper);
        }
      };
      this.on(event, wrapper);
    },
    /**
     * ## 取消订阅
     *
     * 从指定事件的订阅列表中移除处理函数。 如果移除后该事件没有订阅者，会清理该事件条目。
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 要移除的处理函数
     * @returns {void}
     */
    off(event, handler) {
      if (!is_string_default(event) || !is_function_default(handler)) {
        return;
      }
      const set = this.events.get(event);
      if (!set) {
        return;
      }
      set.delete(handler);
      if (set.size === 0) {
        this.events.delete(event);
      }
    },
    /**
     * ## 触发事件
     *
     * 通知指定事件的所有订阅者，依次调用它们的处理函数。 如果事件没有订阅者，不做任何操作。
     *
     * @param {string} event - 事件名称
     * @param {object} [payload] - 传递给处理函数的参数对象
     * @returns {void}
     */
    emit(event, payload) {
      const set = this.events.get(event);
      if (!set) {
        return;
      }
      for (const handler of set) {
        if (!is_function_default(handler)) {
          continue;
        }
        handler(payload);
      }
    },
    /**
     * ## 清空所有事件
     *
     * 移除所有事件和订阅者。 用于游戏重启、单元测试 reset、或完全重置状态时调用。
     *
     * @returns {void}
     */
    clear() {
      this.events.clear();
    }
  };
  var event_bus_default = EventBus;

  // lib/core/index.js
  var Base = class {
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
      event_bus_default.emit(event, payload);
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
      event_bus_default.on(event, handler);
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
      event_bus_default.once(event, handler);
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
      event_bus_default.off(event, handler);
    }
    /**
     * ## 清空所有事件（EventBus 代理）
     *
     * 移除全局 EventBus 中的所有事件订阅。 注意：这是全局操作，会影响所有继承 Base 的实例。 通常用于游戏重启或单元测试 teardown。
     *
     * @returns {void}
     */
    clear() {
      event_bus_default.clear();
    }
  };
  var core_default = Base;

  // lib/services/audio/constants/motifs.js
  var MOTIFS = {
    /** ## 普通消行（1-3 行）：标准参数 */
    combo: {
      shift: 0,
      speed: 1,
      volume: 1
    },
    /** ## 俄罗斯方块（4 行）：音调提高，加速，音量增大 */
    tetris: {
      shift: 2,
      speed: 1.2,
      volume: 1.1
    },
    /** ## 全清（Perfect Clear）：音调大幅提高，稍慢，音量最大 */
    perfect: {
      shift: 5,
      speed: 0.9,
      volume: 1.3
    }
  };
  var motifs_default = MOTIFS;

  // lib/services/audio/constants/clear/chord-sets.js
  var CHORD_SETS = [
    // 0: 1-16 关 — 大三和弦（明亮）
    [
      [440, 554, 659],
      // A4 + C#5 + E5
      [587, 740, 880],
      // D5 + F#5 + A5
      [523, 622, 784],
      // C5 + Eb5 + G5
      [659, 784, 988],
      // E5 + G5 + B5
      [440, 659, 880]
      // A4 + E5 + A5
    ],
    // 1: 17-32 关 — 大二和弦（温暖，升调）
    [
      [494, 622, 740],
      // B4 + Eb5 + F#5
      [659, 831, 988],
      // E5 + Ab5 + B5
      [587, 698, 880],
      // D5 + F5 + A5
      [740, 880, 1109],
      // F#5 + A5 + C#6
      [494, 740, 988]
      // B4 + F#5 + B5
    ],
    // 2: 33-48 关 — 小三和弦（蓝调，降调）
    [
      [440, 523, 659],
      // A4 + C5 + E5
      [587, 698, 880],
      // D5 + F5 + A5
      [523, 659, 784],
      // C5 + E5 + G5
      [659, 784, 988],
      // E5 + G5 + B5
      [440, 659, 880]
      // A4 + E5 + A5
    ],
    // 3: 49-64 关 — 挂留和弦（紧张）
    [
      [440, 587, 659],
      // A4 + D5 + E5
      [587, 740, 880],
      // D5 + F#5 + A5
      [523, 622, 784],
      // C5 + Eb5 + G5
      [659, 784, 988],
      // E5 + G5 + B5
      [440, 659, 880]
      // A4 + E5 + A5
    ],
    // 4: 65-80 关 — 纯五度（空灵）
    [
      [440, 659, 0],
      // A4 + E5（两音）
      [587, 880, 0],
      // D5 + A5（两音）
      [523, 784, 0],
      // C5 + G5（两音）
      [659, 988, 0],
      // E5 + B5（两音）
      [440, 880, 0]
      // A4 + A5（八度）
    ],
    // 5: 81-96 关 — 大七和弦（爵士）
    [
      [440, 554, 659, 831],
      // A4 + C#5 + E5 + Ab5
      [587, 740, 880, 1109],
      // D5 + F#5 + A5 + C#6
      [523, 622, 784, 988],
      // C5 + Eb5 + G5 + B5
      [659, 784, 988, 1245],
      // E5 + G5 + B5 + Eb6
      [440, 659, 880, 1109]
      // A4 + E5 + A5 + C#6
    ],
    // 6: 97-112 关 — 小七和弦（忧郁）
    [
      [440, 523, 659, 784],
      // A4 + C5 + E5 + G5
      [587, 698, 880, 1047],
      // D5 + F5 + A5 + C6
      [523, 622, 784, 932],
      // C5 + Eb5 + G5 + Bb5
      [659, 784, 988, 1175],
      // E5 + G5 + B5 + D6
      [440, 659, 880, 1047]
      // A4 + E5 + A5 + C6
    ],
    // 7: 113-128 关 — 增三和弦（梦幻）
    [
      [440, 554, 670],
      // A4 + C#5 + E#5（≈F5）
      [587, 740, 900],
      // D5 + F#5 + A#5（≈Bb5）
      [523, 659, 800],
      // C5 + E5 + G#5（≈Ab5）
      [659, 831, 1e3],
      // E5 + Ab5 + C6
      [440, 659, 840]
      // A4 + E5 + A#5（≈Bb5）
    ],
    // 8: 129-144 关 — 减三和弦（不安）
    [
      [440, 523, 622],
      // A4 + C5 + Eb5
      [587, 698, 831],
      // D5 + F5 + Ab5
      [523, 622, 740],
      // C5 + Eb5 + F#5
      [659, 784, 932],
      // E5 + G5 + Bb5
      [440, 622, 831]
      // A4 + Eb5 + Ab5
    ],
    // 9: 145-160 关 — 挂四和弦（悬疑）
    [
      [440, 587, 698],
      // A4 + D5 + F5
      [587, 784, 932],
      // D5 + G5 + Bb5
      [523, 698, 880],
      // C5 + F5 + A5
      [659, 880, 1047],
      // E5 + A5 + C6
      [440, 698, 932]
      // A4 + F5 + Bb5
    ],
    // 10: 161-176 关 — 大六和弦（复古）
    [
      [440, 554, 659, 740],
      // A4 + C#5 + E5 + F#5
      [587, 740, 880, 988],
      // D5 + F#5 + A5 + B5
      [523, 622, 784, 880],
      // C5 + Eb5 + G5 + A5
      [659, 784, 988, 1109],
      // E5 + G5 + B5 + C#6
      [440, 659, 880, 988]
      // A4 + E5 + A5 + B5
    ],
    // 11: 177-192 关 — 小六和弦（神秘）
    [
      [440, 523, 659, 740],
      // A4 + C5 + E5 + F#5
      [587, 698, 880, 988],
      // D5 + F5 + A5 + B5
      [523, 622, 784, 880],
      // C5 + Eb5 + G5 + A5
      [659, 784, 988, 1109],
      // E5 + G5 + B5 + C#6
      [440, 659, 880, 988]
      // A4 + E5 + A5 + B5
    ],
    // 12: 193-208 关 — 属七和弦（推动感）
    [
      [440, 554, 659, 784],
      // A4 + C#5 + E5 + G5
      [587, 740, 880, 1047],
      // D5 + F#5 + A5 + C6
      [523, 622, 784, 932],
      // C5 + Eb5 + G5 + Bb5
      [659, 784, 988, 1175],
      // E5 + G5 + B5 + D6
      [440, 659, 880, 1047]
      // A4 + E5 + A5 + C6
    ],
    // 13: 209-224 关 — 大九和弦（宽广）
    [
      [440, 554, 659, 831, 988],
      // A4 + C#5 + E5 + Ab5 + B5
      [587, 740, 880, 1109, 1319],
      // D5 + F#5 + A5 + C#6 + E6
      [523, 622, 784, 988, 1175],
      // C5 + Eb5 + G5 + B5 + D6
      [659, 784, 988, 1245, 1480],
      // E5 + G5 + B5 + Eb6 + F#6
      [440, 659, 880, 1109, 1319]
      // A4 + E5 + A5 + C#6 + E6
    ],
    // 14: 225-240 关 — 小九和弦（深邃）
    [
      [440, 523, 659, 784, 932],
      // A4 + C5 + E5 + G5 + Bb5
      [587, 698, 880, 1047, 1245],
      // D5 + F5 + A5 + C6 + Eb6
      [523, 622, 784, 932, 1109],
      // C5 + Eb5 + G5 + Bb5 + C#6
      [659, 784, 988, 1175, 1397],
      // E5 + G5 + B5 + D6 + F6
      [440, 659, 880, 1047, 1245]
      // A4 + E5 + A5 + C6 + Eb6
    ],
    // 15: 241-256 关 — 加音和弦（辉煌）
    [
      [440, 554, 659, 784, 880],
      // A4 + C#5 + E5 + G5 + A5
      [587, 740, 880, 1047, 1175],
      // D5 + F#5 + A5 + C6 + D6
      [523, 622, 784, 932, 1047],
      // C5 + Eb5 + G5 + Bb5 + C6
      [659, 784, 988, 1175, 1319],
      // E5 + G5 + B5 + D6 + E6
      [440, 659, 880, 1109, 1319]
      // A4 + E5 + A5 + C#6 + E6
    ]
  ];
  var chord_sets_default = CHORD_SETS;

  // lib/services/audio/constants/clear/param-sets.js
  var PARAM_SETS = [
    { volMul: 1, spdMul: 1, wave: "square" },
    // 0: 1-16 关
    { volMul: 0.95, spdMul: 1.05, wave: "square" },
    // 1: 17-32 关
    { volMul: 0.9, spdMul: 1.1, wave: "triangle" },
    // 2: 33-48 关
    { volMul: 0.85, spdMul: 1.15, wave: "triangle" },
    // 3: 49-64 关
    { volMul: 0.8, spdMul: 1.2, wave: "sine" },
    // 4: 65-80 关
    { volMul: 0.85, spdMul: 1.1, wave: "square" },
    // 5: 81-96 关
    { volMul: 0.8, spdMul: 1.15, wave: "triangle" },
    // 6: 97-112 关
    { volMul: 0.75, spdMul: 1.2, wave: "sine" },
    // 7: 113-128 关
    { volMul: 0.7, spdMul: 1.25, wave: "square" },
    // 8: 129-144 关
    { volMul: 0.65, spdMul: 1.3, wave: "triangle" },
    // 9: 145-160 关
    { volMul: 0.7, spdMul: 1.2, wave: "square" },
    // 10: 161-176 关
    { volMul: 0.65, spdMul: 1.25, wave: "sine" },
    // 11: 177-192 关
    { volMul: 0.6, spdMul: 1.3, wave: "square" },
    // 12: 193-208 关
    { volMul: 0.55, spdMul: 1.35, wave: "triangle" },
    // 13: 209-224 关
    { volMul: 0.5, spdMul: 1.4, wave: "sine" },
    // 14: 225-240 关
    { volMul: 0.5, spdMul: 1.5, wave: "square" }
    // 15: 241-256 关
  ];
  var param_sets_default = PARAM_SETS;

  // lib/services/audio/play-tone.js
  var playTone = (audio, freq, dur, options = {}) => {
    if (!freq || dur <= 0) {
      return;
    }
    const { Context } = audio;
    const {
      // 音量峰值
      volume = 0.15,
      // 默认方波
      wave = "square",
      // 默认连奏，音符唱满时值
      gate = 1,
      // 运音包络
      articulation = {},
      // 默认立即开始
      startTime = Context.currentTime
    } = options;
    const osc = Context.createOscillator();
    const gain = Context.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, startTime);
    const step = dur / 1e3;
    const noteLen = step * gate;
    const {
      attackTime = 3e-3,
      // 起音时间，3ms 快速起音
      releaseTime = 0.02,
      // 释音时间，20ms 平滑收尾
      sustainRatio = 0.9
      // 延音比，保持 90% 峰值音量进入衰减段
    } = articulation;
    const t0 = startTime;
    const t1 = t0 + attackTime;
    const t2 = t0 + Math.max(noteLen - releaseTime, attackTime);
    const t3 = t0 + noteLen;
    gain.gain.setValueAtTime(1e-4, t0);
    gain.gain.linearRampToValueAtTime(volume, t1);
    gain.gain.linearRampToValueAtTime(volume * sustainRatio, t2);
    gain.gain.exponentialRampToValueAtTime(1e-4, t3);
    osc.connect(gain);
    gain.connect(Context.destination);
    osc.start(t0);
    osc.stop(t3 + 0.05);
    osc.addEventListener("ended", () => {
      osc.disconnect();
      gain.disconnect();
    });
  };
  var play_tone_default = playTone;

  // lib/services/audio/sounds.js
  var getMotif = (lines, isPerfectClear = false) => {
    if (isPerfectClear) {
      return "perfect";
    }
    if (lines === 4) {
      return "tetris";
    }
    return "combo";
  };
  var Sounds = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
    }
    /**
     * ## 等级选择音效
     *
     * 三角波柔和音效，520Hz，80ms。
     *
     * @returns {void}
     */
    LEVEL_CHANGED = () => {
      play_tone_default(this, 520, 80, { volume: 0.2, wave: "triangle" });
    };
    /**
     * ## 主菜单/难度选择场景切换音效
     *
     * 三角波音效，620Hz，80ms。
     *
     * @returns {void}
     */
    SWITCH_SCENE = () => {
      play_tone_default(this, 620, 80, { volume: 0.2, wave: "triangle" });
    };
    /**
     * ## 难度选择音效
     *
     * 三角波音效，880Hz，80ms。
     *
     * @returns {void}
     */
    DIFFICULTY_CHANGED = () => {
      play_tone_default(this, 880, 80, { volume: 0.2, wave: "triangle" });
    };
    /**
     * ## 等级开始音效
     *
     * 三角波音效，1319Hz，160ms。
     *
     * @returns {void}
     */
    GAME_STARTED = () => {
      play_tone_default(this, 1319, 160, { volume: 0.22, wave: "triangle" });
    };
    /**
     * ## 开始倒计时音效
     *
     * 正弦波音效，784Hz，180ms，音量较大。
     *
     * @returns {void}
     */
    COUNTDOWN = () => {
      play_tone_default(this, 784, 180, { volume: 0.4, wave: "sine" });
    };
    /**
     * ## 方块移动音效
     *
     * 330Hz，60ms，默认方波。
     *
     * @returns {void}
     */
    MOVE = () => play_tone_default(this, 330, 60);
    /**
     * ## 方块旋转音效
     *
     * 440Hz，60ms，默认方波。
     *
     * @returns {void}
     */
    ROTATE = () => play_tone_default(this, 440, 60);
    /**
     * ## 方块快速下落音效
     *
     * 220Hz，100ms，默认方波。
     *
     * @returns {void}
     */
    DROP = () => play_tone_default(this, 220, 100);
    /**
     * ## 方块落地音效
     *
     * 180Hz，200ms，默认方波。
     *
     * @returns {void}
     */
    FALL = () => play_tone_default(this, 180, 200);
    // 在 Sounds 类中 CLEAR 方法的注释：
    /**
     * ## 消行动效音（16 套和弦 + 动机系统）
     *
     * 根据消除行数、当前等级和是否全清，选择不同的和弦方案和配器参数， 使用 Scheduler.sequence 按时间偏移依次触发三个音轨。
     *
     * ### 等级配色
     *
     * 每 16 关从 `CHORD_SETS` 和 `PARAM_SETS` 中各选一套， 共 16 套（256 / 16），与 BGM 同步切换。
     *
     * ### 动机系统
     *
     * | 条件                  | 动机类型  | shift | speed | volume |
     * | --------------------- | --------- | ----- | ----- | ------ |
     * | 全清（Perfect Clear） | `perfect` | +4    | ×2.0  | ×1.5   |
     * | 消除 4 行（Tetris）   | `tetris`  | +2    | ×1.5  | ×1.2   |
     * | 消除 1-3 行           | `combo`   | 0     | ×1.0  | ×1.0   |
     *
     * ### 音轨结构
     *
     * 每个和弦由 3-5 个音符组成，通过三个音轨按时间偏移播放：
     *
     * - 音轨 0：160ms 后开始，speed=260ms，volume=0.32
     * - 音轨 1：320ms 后开始，speed=300ms，volume=0.30
     * - 音轨 2：480ms 后开始，speed=380ms，volume=0.25
     *
     * 各参数再乘以动机的倍率和配器参数的倍率。
     *
     * @param {number} [lines=1] - 消除行数（1-5）。默认值为 `1`. Default is `1`
     * @param {number} [level=1] - 当前等级，用于选择和弦和配器方案。默认值为 `1`. Default is `1`
     * @param {boolean} [isPerfectClear=false] - 是否全清。默认值为 `false`. Default is
     *   `false`
     * @returns {void}
     */
    CLEAR = (lines = 1, level = 1, isPerfectClear = false) => {
      const setIndex = Math.min(Math.floor((level - 1) / 16), 15);
      const frequencies = chord_sets_default[setIndex];
      const params = param_sets_default[setIndex];
      const speeds = [260, 300, 380];
      const volumes = [0.32, 0.3, 0.25];
      const timeouts = [160, 320, 480];
      const motif = getMotif(lines, isPerfectClear);
      const cfg = motifs_default[motif];
      const index = Math.min(lines, frequencies.length - 1);
      const baseChord = frequencies[index].filter((f) => f > 0);
      const chord = baseChord.map((freq) => freq + cfg.shift * 12);
      const queue = [];
      const { Context, Scheduler: Scheduler2 } = this;
      for (const [i, freq] of chord.entries()) {
        queue.push({
          fn: () => {
            const now = Context.currentTime;
            play_tone_default(this, freq, speeds[i] * cfg.speed * params.spdMul, {
              volume: volumes[i] * cfg.volume * params.volMul,
              wave: params.wave,
              startTime: now + timeouts[i] / 1e3
            });
          }
        });
      }
      Scheduler2.sequence(queue);
    };
    /**
     * ## 升级庆祝音效
     *
     * 演奏上行音阶（C5 → E6），营造升级的成就感和喜悦情绪。 通过 Scheduler.sequence 按精确时间偏移依次触发。
     *
     * @returns {void}
     */
    LEVEL_UP = () => {
      const { Context, Scheduler: Scheduler2 } = this;
      const now = Context.currentTime;
      Scheduler2.sequence([
        { fn: () => play_tone_default(this, 523, 220) },
        { fn: () => play_tone_default(this, 587, 220, { startTime: now + 0.26 }) },
        { fn: () => play_tone_default(this, 659, 240, { startTime: now + 0.52 }) },
        {
          delay: 260,
          fn: () => play_tone_default(this, 784, 260, { startTime: now + 0.78 })
        },
        { fn: () => play_tone_default(this, 880, 280, { startTime: now + 1.06 }) },
        { fn: () => play_tone_default(this, 1047, 320, { startTime: now + 1.36 }) },
        { fn: () => play_tone_default(this, 1175, 360, { startTime: now + 1.7 }) },
        { fn: () => play_tone_default(this, 1319, 480, { startTime: now + 2.08 }) }
      ]);
    };
    /**
     * ## 暂停游戏音效
     *
     * 300Hz，150ms。
     *
     * @returns {void}
     */
    PAUSED = () => play_tone_default(this, 300, 150);
    /**
     * ## 秒针走动音效
     *
     * 三角波，880Hz，50ms，低音量。暂停时每秒播放一次。
     *
     * @returns {void}
     */
    SECOND_TICK = () => {
      play_tone_default(this, 880, 50, { volume: 0.085, wave: "triangle" });
    };
    /**
     * ## 恢复游戏音效
     *
     * 400Hz，150ms。
     *
     * @returns {void}
     */
    RESUME = () => play_tone_default(this, 400, 150);
    /**
     * ## 游戏结束音效（悲伤旋律）
     *
     * 下行旋律（E4 → D4 → C4），营造游戏结束的失落感。
     *
     * @returns {void}
     */
    GAME_OVER = () => {
      const { Context, Scheduler: Scheduler2 } = this;
      const now = Context.currentTime;
      Scheduler2.sequence([
        { fn: () => play_tone_default(this, 330, 200) },
        { fn: () => play_tone_default(this, 294, 300, { startTime: now + 0.21 }) },
        { fn: () => play_tone_default(this, 262, 500, { startTime: now + 0.52 }) }
      ]);
    };
    /**
     * ## 背景音乐开关音效
     *
     * 440Hz，100ms。
     *
     * @returns {void}
     */
    BGM_TOGGLED = () => play_tone_default(this, 440, 100);
  };
  var sounds_default = Sounds;

  // lib/game/constants/game.js
  var AI_ALLOWED_ACTIONS = [
    "SWITCH_CONTROLLER",
    "TOGGLE_MUSIC",
    "TOGGLE_PAUSED",
    "RESTART",
    "QUIT"
  ];
  var CLEAR_LINE_SCORES = [0, 100, 300, 500, 800, 1200];
  var FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;
  var MAX_LEVEL = 256;
  var GAME = {
    CLEAR_LINE_SCORES,
    FONT_FAMILY,
    AI_ALLOWED_ACTIONS,
    MAX_LEVEL
  };
  var game_default = GAME;

  // lib/services/audio/constants/bgm/tetris-theme.js
  var TetrisTheme = {
    /** ## 音乐名称 */
    name: "TetrisTheme",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz）
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== A 段：经典律动（长-短-短）=====
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 1.2 },
      { freq: 494, dur: 0.4 },
      { freq: 494, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      // ===== A' 段：高音区 =====
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 494, dur: 1.2 },
      { freq: 494, dur: 0.4 },
      { freq: 494, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      // ===== B 段：下行区 =====
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 415, dur: 1.2 },
      { freq: 415, dur: 0.4 },
      { freq: 415, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      // ===== 结尾收束 =====
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 1.2 },
      { freq: 494, dur: 1.2 },
      { freq: 494, dur: 0.4 },
      { freq: 494, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 }
    ],
    /** ## 每个音符的基准时长（ms） */
    duration: 220,
    /** ## 音量（0-1） */
    volume: 0.11,
    /** ## 波形类型：方波（经典 8-bit 音色） */
    wave: "square",
    /** ## 连奏/断奏比例（0.6，明显断奏颗粒感） */
    gate: 0.6
  };
  var tetris_theme_default = TetrisTheme;

  // lib/services/audio/constants/bgm/spring-festival.js
  var SpringFestival = {
    /** ## 音乐名称 */
    name: "Spring Festival",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz），0 表示休止符
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== 第一句：秧歌调 =====
      { freq: 523, dur: 0.6 },
      // 啦 (C5)
      { freq: 587, dur: 0.3 },
      // 啦 (D5)
      { freq: 659, dur: 0.9 },
      // 啦～ (E5)
      { freq: 659, dur: 0.6 },
      // 啦
      { freq: 784, dur: 0.3 },
      // 啦
      { freq: 880, dur: 1.2 },
      // 啦～ (A5)
      { freq: 880, dur: 0.6 },
      // 啦
      { freq: 784, dur: 0.3 },
      // 啦
      { freq: 659, dur: 0.9 },
      // 啦～
      { freq: 587, dur: 0.6 },
      // 啦
      { freq: 523, dur: 1.5 },
      // 啦～
      // ===== 第二句：欢腾段落 =====
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.3 },
      { freq: 587, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      // ===== 第三句：再现秧歌，更热烈 =====
      { freq: 523, dur: 0.4 },
      { freq: 587, dur: 0.2 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.2 },
      { freq: 880, dur: 0.8 },
      { freq: 1047, dur: 0.4 },
      // 拔高 (C6)
      { freq: 880, dur: 0.2 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 2 },
      // 收束
      // ===== 第四句：锣鼓模仿 =====
      { freq: 659, dur: 0.2 },
      { freq: 659, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      // 休止符模仿锣鼓间隙
      { freq: 659, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      { freq: 784, dur: 0.2 },
      { freq: 784, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      { freq: 784, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      { freq: 659, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 0.8 },
      { freq: 0, dur: 1 }
      // 段落呼吸
    ],
    /** ## 每个音符的基准时长（ms），较快节奏 */
    duration: 280,
    /** ## 音量（0-1） */
    volume: 0.11,
    /** ## 波形类型：方波（模拟唢呐/秧歌的热闹感） */
    wave: "square",
    /** ## 连奏/断奏比例（0.7，轻断奏，颗粒分明） */
    gate: 0.7,
    /** ## 运音包络 */
    articulation: {
      /** ## 起音时间（3ms，快速起音） */
      attackTime: 3e-3,
      /** ## 释音时间（20ms） */
      releaseTime: 0.02,
      /** ## 延音比（0.5，较低，音符跳跃） */
      sustainRatio: 0.5
    }
  };
  var spring_festival_default = SpringFestival;

  // lib/services/audio/constants/bgm/first-division.js
  var FirstDivision = {
    /** ## 音乐名称 */
    name: "FirstDivision",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz）
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== 主动机（进行曲感）=====
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // ===== 重复推进 =====
      { freq: 659, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 698, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      // ===== 第二句（上行）=====
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 698, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      // ===== 强化段（军乐推进）=====
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      // ===== 高潮（稳定推进）=====
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 988, dur: 1.2 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // ===== 回落（收束）=====
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      // ===== 循环点 =====
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.6 }
    ],
    /** ## 每个音符的基准时长（ms） */
    duration: 180,
    /** ## 音量（0-1） */
    volume: 0.13,
    /** ## 波形类型：方波（经典 8-bit 音色） */
    wave: "square"
  };
  var first_division_default = FirstDivision;

  // lib/services/audio/constants/bgm/gong-xi-fa-cai.js
  var GongXiFaCai = {
    /** ## 音乐名称 */
    name: "Gong Xi Fa Cai",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz），0 表示休止符
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== 恭喜发财 恭喜发财 =====
      { freq: 523, dur: 0.5 },
      // 恭 (C5)
      { freq: 587, dur: 0.5 },
      // 喜 (D5)
      { freq: 659, dur: 0.8 },
      // 发 (E5)
      { freq: 659, dur: 0.8 },
      // 财～
      { freq: 784, dur: 0.5 },
      // 恭
      { freq: 880, dur: 0.5 },
      // 喜
      { freq: 784, dur: 0.8 },
      // 发
      { freq: 659, dur: 1.5 },
      // 财～
      { freq: 587, dur: 0.5 },
      // 恭
      { freq: 659, dur: 0.5 },
      // 喜
      { freq: 784, dur: 0.8 },
      // 发
      { freq: 784, dur: 0.8 },
      // 财～
      { freq: 880, dur: 0.5 },
      // 恭
      { freq: 1047, dur: 0.5 },
      // 喜 (C6)
      { freq: 880, dur: 0.8 },
      // 发
      { freq: 784, dur: 1.5 },
      // 财～
      // ===== 我恭喜你发财 我恭喜你精彩 =====
      { freq: 659, dur: 0.3 },
      // 我
      { freq: 784, dur: 0.3 },
      // 恭
      { freq: 880, dur: 0.5 },
      // 喜
      { freq: 880, dur: 0.3 },
      // 你
      { freq: 784, dur: 0.3 },
      // 发
      { freq: 659, dur: 1 },
      // 财～
      { freq: 587, dur: 0.3 },
      // 我
      { freq: 659, dur: 0.3 },
      // 恭
      { freq: 784, dur: 0.5 },
      // 喜
      { freq: 784, dur: 0.3 },
      // 你
      { freq: 659, dur: 0.3 },
      // 精
      { freq: 587, dur: 1 },
      // 彩～
      // ===== 最好的请过来 不好的请走开 =====
      { freq: 523, dur: 0.4 },
      // 最
      { freq: 587, dur: 0.4 },
      // 好
      { freq: 659, dur: 0.4 },
      // 的
      { freq: 784, dur: 0.4 },
      // 请
      { freq: 880, dur: 0.4 },
      // 过
      { freq: 784, dur: 0.8 },
      // 来～
      { freq: 659, dur: 0.4 },
      // 不
      { freq: 587, dur: 0.4 },
      // 好
      { freq: 659, dur: 0.4 },
      // 的
      { freq: 784, dur: 0.4 },
      // 请
      { freq: 659, dur: 0.4 },
      // 走
      { freq: 523, dur: 1.2 },
      // 开～
      // ===== 礼多人不怪 =====
      { freq: 587, dur: 0.4 },
      // 礼
      { freq: 659, dur: 0.4 },
      // 多
      { freq: 784, dur: 0.4 },
      // 人
      { freq: 659, dur: 0.4 },
      // 不
      { freq: 587, dur: 0.8 },
      // 怪～
      { freq: 523, dur: 1.5 },
      // （收）
      // ===== 间奏过渡 =====
      { freq: 0, dur: 0.8 },
      // ===== 恭喜发财 循环再现 =====
      { freq: 523, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.4 },
      { freq: 1047, dur: 0.4 },
      { freq: 880, dur: 0.6 },
      { freq: 784, dur: 1.2 },
      // ===== 收尾高音 =====
      { freq: 880, dur: 0.5 },
      { freq: 1047, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 659, dur: 2 },
      { freq: 0, dur: 1.5 }
      // 段落呼吸
    ],
    /** ## 每个音符的基准时长（ms） */
    duration: 260,
    /** ## 音量（0-1） */
    volume: 0.13,
    /** ## 波形类型：方波 */
    wave: "square",
    /** ## 连奏/断奏比例（0.8，较连奏） */
    gate: 0.8,
    /** ## 运音包络 */
    articulation: {
      /** ## 起音时间（3ms，快速起音） */
      attackTime: 3e-3,
      /** ## 释音时间（20ms，平滑收尾） */
      releaseTime: 0.02,
      /** ## 延音比（0.6，中高延音） */
      sustainRatio: 0.6
    }
  };
  var gong_xi_fa_cai_default = GongXiFaCai;

  // lib/services/audio/constants/bgm/loginska.js
  var Loginska = {
    /** ## 音乐名称 */
    name: "Loginska",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz）
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== A 段：沉稳推进 =====
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      // ===== B 段：上行高潮 =====
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 880, dur: 0.6 },
      { freq: 988, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      // ===== C 段：急促下行收束 =====
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 }
    ],
    /** ## 每个音符的基准时长（ms） */
    duration: 180,
    /** ## 音量（0-1），略低于其他曲目 */
    volume: 0.11,
    /** ## 波形类型：方波（经典 8-bit 音色） */
    wave: "square"
  };
  var loginska_default = Loginska;

  // lib/services/audio/constants/bgm/beyond-the-wall.js
  var BeyondTheWall = {
    /** ## 音乐名称 */
    name: "BeyondTheWall",
    /**
     * ## 分段 Gate 配置（可选）
     *
     * 控制不同段落的连奏/断奏比例：
     *
     * - Gate 值越大越连奏，越小越断奏
     *
     * @type {object}
     */
    config: {
      gate: {
        intro: 0.92,
        // 前奏：较连奏
        main: 0.93,
        // 主旋律：很连奏
        drive: 0.96,
        // 推进段：最连奏
        dnb: 0.88,
        // DnB：较断奏
        outro: 0.91
        // 回落：较连奏
      }
    },
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz），0 表示休止符
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== 前奏：胡笳感脉冲 =====
      { freq: 330, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 392, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 330, dur: 0.6 },
      { freq: 392, dur: 0.6 },
      { freq: 330, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 392, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 440, dur: 1.8 },
      { freq: 0, dur: 0.3 },
      // ===== 主旋律：苍凉开场 =====
      { freq: 440, dur: 1.2 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 0, dur: 0.2 },
      { freq: 523, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 392, dur: 0.6 },
      { freq: 330, dur: 1.2 },
      { freq: 392, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 1.2 },
      { freq: 523, dur: 0.6 },
      { freq: 659, dur: 1.8 },
      { freq: 0, dur: 0.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 440, dur: 0.6 },
      { freq: 392, dur: 1.2 },
      { freq: 330, dur: 1.2 },
      { freq: 0, dur: 0.3 },
      // ===== 推进段：马蹄 =====
      { freq: 392, dur: 0.6 },
      { freq: 440, dur: 0.3 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 523, dur: 0.6 },
      { freq: 440, dur: 0.3 },
      { freq: 392, dur: 0.6 },
      { freq: 440, dur: 0.3 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 659, dur: 1.2 },
      { freq: 0, dur: 0.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      // ===== 高潮：边塞号角 =====
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 1.8 },
      { freq: 0, dur: 0.25 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 440, dur: 0.6 },
      { freq: 0, dur: 0.2 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.8 },
      // ===== DnB 段：破碎节奏 + 空拍 =====
      { freq: 440, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 440, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 440, dur: 0.4 },
      { freq: 392, dur: 0.4 },
      { freq: 330, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 392, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 392, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 440, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      // ===== 回落：大漠孤烟 =====
      { freq: 659, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 440, dur: 0.6 },
      { freq: 392, dur: 1.2 },
      { freq: 330, dur: 1.2 },
      { freq: 0, dur: 0.3 },
      { freq: 392, dur: 1.2 },
      { freq: 330, dur: 0.6 },
      { freq: 294, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 330, dur: 0.6 },
      { freq: 392, dur: 1.8 },
      // ===== 循环衔接（更"远"） =====
      { freq: 330, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 392, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 330, dur: 0.6 },
      { freq: 392, dur: 0.6 },
      { freq: 440, dur: 1.8 }
    ],
    /** ## 每个音符的基准时长（ms） */
    duration: 130,
    /** ## 音量（0-1） */
    volume: 0.12,
    /** ## 波形类型：三角波（音色柔和） */
    wave: "square"
  };
  var beyond_the_wall_default = BeyondTheWall;

  // lib/services/audio/constants/bgm/technotris.js
  var Technotris = {
    /** ## 音乐名称 */
    name: "Technotris",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz）
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== Intro（电子重复）=====
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      // ===== 主旋律 A =====
      { freq: 659, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // ===== 电子重复变体 =====
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      // ===== 上行推进 =====
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 988, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      // ===== 高潮 =====
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 988, dur: 0.8 },
      { freq: 1175, dur: 1.2 },
      { freq: 988, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      // ===== Break =====
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // ===== Drop =====
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 988, dur: 0.6 },
      { freq: 988, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      // ===== Ending =====
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 1.6 }
    ],
    /** ## 每个音符的基准时长（ms） */
    duration: 180,
    /** ## 音量（0-1） */
    volume: 0.13,
    /** ## 波形类型：方波（电子音色） */
    wave: "square"
  };
  var technotris_default = Technotris;

  // lib/services/audio/constants/bgm/golden-snake-dance.js
  var GoldenSnakeDance = {
    /** ## 音乐名称 */
    name: "Golden Snake Dance",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz），0 表示休止符
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== 核心主题：赛龙舟 =====
      { freq: 659, dur: 0.3 },
      // 啦 (E5)
      { freq: 587, dur: 0.3 },
      // 啦 (D5)
      { freq: 523, dur: 0.3 },
      // 啦 (C5)
      { freq: 587, dur: 0.3 },
      // 啦
      { freq: 659, dur: 0.6 },
      // 啦～
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 523, dur: 0.3 },
      { freq: 440, dur: 0.3 },
      // 啦 (A4)
      { freq: 523, dur: 0.3 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 587, dur: 0.3 },
      { freq: 587, dur: 0.6 },
      // ===== 对答段落：锣鼓模仿 =====
      { freq: 784, dur: 0.2 },
      // 锵 (G5)
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 659, dur: 0.4 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 880, dur: 0.2 },
      // 锵 (A5)
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 659, dur: 0.4 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 880, dur: 0.2 },
      // 锵
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 659, dur: 0.2 },
      // 锵
      { freq: 587, dur: 0.4 },
      // 咚
      { freq: 587, dur: 0.2 },
      // 咚
      { freq: 587, dur: 0.2 },
      // 咚
      { freq: 784, dur: 0.2 },
      { freq: 659, dur: 0.2 },
      { freq: 587, dur: 0.2 },
      { freq: 523, dur: 0.6 },
      // 咚～
      { freq: 523, dur: 0.3 },
      { freq: 523, dur: 0.3 },
      // ===== 主题再现，上行递进 =====
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      // 拔高
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 1047, dur: 0.6 },
      // 更高 (C6)
      { freq: 1047, dur: 0.3 },
      { freq: 1047, dur: 0.3 },
      { freq: 1047, dur: 0.6 },
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 880, dur: 0.6 },
      // ===== 热烈对答，加速感 =====
      { freq: 784, dur: 0.15 },
      { freq: 880, dur: 0.15 },
      { freq: 784, dur: 0.15 },
      { freq: 659, dur: 0.15 },
      { freq: 587, dur: 0.15 },
      { freq: 659, dur: 0.15 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.15 },
      { freq: 880, dur: 0.15 },
      { freq: 784, dur: 0.15 },
      { freq: 1047, dur: 0.15 },
      { freq: 880, dur: 0.15 },
      { freq: 784, dur: 0.15 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.4 },
      // ===== 收束 =====
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 523, dur: 1.5 },
      { freq: 0, dur: 1 }
      // 段落呼吸
    ],
    /** ## 每个音符的基准时长（ms），较快节奏 */
    duration: 200,
    /** ## 音量（0-1） */
    volume: 0.12,
    /** ## 波形类型：方波（模拟唢呐/弹拨乐） */
    wave: "square",
    /**
     * ## 连奏/断奏比例
     *
     * 0.6 表示明显断奏，模仿弹拨乐颗粒感
     */
    gate: 0.6,
    /**
     * ## 运音包络
     *
     * 控制音符的起音、释音和延音比例。
     */
    articulation: {
      /** ## 起音时间（2ms，快速起音） */
      attackTime: 2e-3,
      /** ## 释音时间（15ms，快速收尾） */
      releaseTime: 0.015,
      /** ## 延音比（0.4，低延音使音符跳跃） */
      sustainRatio: 0.4
    }
  };
  var golden_snake_dance_default = GoldenSnakeDance;

  // lib/services/audio/constants/bgm/korobeiniki.js
  var Korobeiniki = {
    /** ## 音乐名称 */
    name: "Korobeiniki",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz）
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== A 段（经典开头）=====
      { freq: 659, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // ===== A' 段（变体）=====
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // ===== B 段（推进）=====
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // ===== C 段（高潮）=====
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      // ===== D 段（变化）=====
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 1.2 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // ===== E 段（回落）=====
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      { freq: 587, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 1.2 },
      // ===== F 段（再现+收束）=====
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // ===== 结尾（循环点）=====
      { freq: 523, dur: 1.2 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 1.6 }
    ],
    /** ## 每个音符的基准时长（ms） */
    duration: 140,
    /** ## 音量（0-1） */
    volume: 0.12,
    /** ## 波形类型：方波（经典 8-bit 音色） */
    wave: "square"
  };
  var korobeiniki_default = Korobeiniki;

  // lib/services/audio/constants/bgm/ascension.js
  var Ascension = {
    name: "Ascension",
    melody: [
      // ===== 序章（黎明）=====
      { freq: 262, dur: 3 },
      { freq: 330, dur: 2 },
      { freq: 392, dur: 3 },
      { freq: 330, dur: 1 },
      { freq: 392, dur: 1 },
      { freq: 523, dur: 4 },
      // ===== 升华（逐级上行）=====
      { freq: 523, dur: 1 },
      { freq: 587, dur: 1 },
      { freq: 659, dur: 2 },
      { freq: 587, dur: 1 },
      { freq: 523, dur: 1 },
      { freq: 659, dur: 1 },
      { freq: 784, dur: 2 },
      { freq: 659, dur: 1 },
      { freq: 587, dur: 1 },
      { freq: 523, dur: 2 },
      // ===== 天梯攀登 =====
      { freq: 784, dur: 1 },
      { freq: 880, dur: 1 },
      { freq: 988, dur: 2 },
      { freq: 880, dur: 1 },
      { freq: 784, dur: 1 },
      { freq: 988, dur: 1 },
      { freq: 1175, dur: 2 },
      { freq: 988, dur: 1 },
      { freq: 880, dur: 1 },
      { freq: 784, dur: 1 },
      { freq: 659, dur: 1 },
      { freq: 523, dur: 2 },
      // ===== 云层之上（高音区）=====
      { freq: 1175, dur: 0.5 },
      { freq: 1319, dur: 0.5 },
      { freq: 1568, dur: 1 },
      { freq: 1319, dur: 0.5 },
      { freq: 1175, dur: 0.5 },
      { freq: 988, dur: 1 },
      { freq: 1175, dur: 2 },
      { freq: 0, dur: 1 },
      { freq: 1568, dur: 0.5 },
      { freq: 1319, dur: 0.5 },
      { freq: 1175, dur: 1 },
      { freq: 988, dur: 1 },
      { freq: 880, dur: 2 },
      // ===== 循环之门 =====
      { freq: 784, dur: 1 },
      { freq: 880, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 1175, dur: 1 },
      { freq: 1319, dur: 0.5 },
      { freq: 1175, dur: 0.5 },
      { freq: 988, dur: 1 },
      { freq: 880, dur: 1 },
      { freq: 784, dur: 1 },
      { freq: 659, dur: 1 },
      { freq: 523, dur: 2 },
      // ===== 循环衔接（回到起点）=====
      { freq: 440, dur: 1 },
      { freq: 392, dur: 1 },
      { freq: 330, dur: 1 },
      { freq: 262, dur: 1 },
      { freq: 330, dur: 1 },
      { freq: 392, dur: 1 },
      { freq: 262, dur: 3 },
      { freq: 0, dur: 1 },
      { freq: 262, dur: 2 }
    ],
    duration: 200,
    volume: 0.11,
    wave: "triangle",
    gate: 1
  };
  var ascension_default = Ascension;

  // lib/services/audio/constants/bgm/neon-nights.js
  var NeonNights = {
    name: "NeonNights",
    melody: [
      // ===== 引子（低音铺垫）=====
      { freq: 220, dur: 1 },
      { freq: 277, dur: 1 },
      { freq: 330, dur: 1 },
      { freq: 277, dur: 0.5 },
      { freq: 220, dur: 0.5 },
      { freq: 330, dur: 1 },
      { freq: 370, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 277, dur: 0.5 },
      { freq: 220, dur: 0.5 },
      // ===== 主动机（霓虹闪烁）=====
      { freq: 440, dur: 0.5 },
      { freq: 554, dur: 0.5 },
      { freq: 659, dur: 1 },
      { freq: 554, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      { freq: 370, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      { freq: 554, dur: 0.5 },
      { freq: 659, dur: 1 },
      { freq: 0, dur: 0.25 },
      { freq: 659, dur: 0.25 },
      { freq: 740, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 554, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      // ===== 上行推进 =====
      { freq: 554, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 740, dur: 0.5 },
      { freq: 831, dur: 0.5 },
      { freq: 880, dur: 1 },
      { freq: 831, dur: 0.5 },
      { freq: 740, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 554, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      { freq: 554, dur: 0.5 },
      { freq: 659, dur: 1 },
      // ===== 间奏（律动切分）=====
      { freq: 330, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 330, dur: 0.25 },
      { freq: 370, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 370, dur: 0.25 },
      { freq: 440, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 370, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 277, dur: 0.5 },
      { freq: 330, dur: 1 },
      // ===== 高潮（全开合成器）=====
      { freq: 440, dur: 0.25 },
      { freq: 554, dur: 0.25 },
      { freq: 659, dur: 0.25 },
      { freq: 740, dur: 0.25 },
      { freq: 880, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 740, dur: 0.25 },
      { freq: 659, dur: 0.25 },
      { freq: 554, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 659, dur: 0.5 },
      { freq: 554, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      { freq: 370, dur: 0.5 },
      { freq: 440, dur: 1 },
      // ===== 回落 =====
      { freq: 370, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 277, dur: 0.5 },
      { freq: 220, dur: 1 },
      { freq: 277, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 277, dur: 0.5 },
      { freq: 220, dur: 1 },
      { freq: 0, dur: 0.5 },
      // ===== 循环衔接 =====
      { freq: 220, dur: 0.5 },
      { freq: 277, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 370, dur: 0.5 },
      { freq: 440, dur: 1 },
      { freq: 370, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 277, dur: 0.5 },
      { freq: 220, dur: 1.5 }
    ],
    duration: 160,
    volume: 0.12,
    wave: "triangle",
    gate: 0.85
  };
  var neon_nights_default = NeonNights;

  // lib/services/audio/constants/bgm/frozen-peaks.js
  var FrozenPeaks = {
    name: "FrozenPeaks",
    melody: [
      // ===== 引子（高远冰峰）=====
      { freq: 880, dur: 2 },
      { freq: 0, dur: 0.5 },
      { freq: 784, dur: 1.5 },
      { freq: 0, dur: 0.5 },
      { freq: 988, dur: 2 },
      { freq: 0, dur: 0.5 },
      { freq: 880, dur: 1 },
      { freq: 784, dur: 0.5 },
      { freq: 698, dur: 1 },
      // ===== 主动机（雪花飘落）=====
      { freq: 659, dur: 0.75 },
      { freq: 698, dur: 0.25 },
      { freq: 784, dur: 1 },
      { freq: 698, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 587, dur: 0.5 },
      { freq: 523, dur: 1 },
      { freq: 0, dur: 0.25 },
      { freq: 587, dur: 0.25 },
      { freq: 659, dur: 0.75 },
      { freq: 698, dur: 0.25 },
      { freq: 784, dur: 1 },
      // ===== 上行探索 =====
      { freq: 784, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 988, dur: 1 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 1175, dur: 1.5 },
      { freq: 0, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 698, dur: 1 },
      // ===== 暴风雪（密集音符）=====
      { freq: 659, dur: 0.25 },
      { freq: 698, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 988, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 698, dur: 0.25 },
      { freq: 784, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 1175, dur: 1 },
      { freq: 0, dur: 0.25 },
      { freq: 1175, dur: 0.25 },
      { freq: 988, dur: 0.5 },
      { freq: 880, dur: 1 },
      // ===== 平静（风雪渐歇）=====
      { freq: 784, dur: 1.5 },
      { freq: 0, dur: 0.5 },
      { freq: 698, dur: 1 },
      { freq: 659, dur: 1 },
      { freq: 587, dur: 1.5 },
      { freq: 523, dur: 1 },
      { freq: 587, dur: 0.5 },
      { freq: 659, dur: 1 },
      { freq: 0, dur: 0.5 },
      // ===== 循环点（冰峰再现）=====
      { freq: 880, dur: 1.5 },
      { freq: 0, dur: 0.5 },
      { freq: 784, dur: 1 },
      { freq: 698, dur: 0.5 },
      { freq: 587, dur: 0.5 },
      { freq: 523, dur: 2 }
    ],
    duration: 200,
    volume: 0.11,
    wave: "sine",
    gate: 1
  };
  var frozen_peaks_default = FrozenPeaks;

  // lib/services/audio/constants/bgm/cyber-rush.js
  var CyberRush = {
    name: "CyberRush",
    melody: [
      // ===== 警报引子 =====
      { freq: 440, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 587, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 587, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 659, dur: 0.5 },
      { freq: 0, dur: 0.5 },
      // ===== 主动机（高速脉冲）=====
      { freq: 330, dur: 0.25 },
      { freq: 370, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 370, dur: 0.25 },
      { freq: 330, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 554, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 370, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 554, dur: 0.25 },
      { freq: 659, dur: 0.5 },
      // ===== 加速段 =====
      { freq: 440, dur: 0.125 },
      { freq: 494, dur: 0.125 },
      { freq: 554, dur: 0.125 },
      { freq: 587, dur: 0.125 },
      { freq: 659, dur: 0.25 },
      { freq: 587, dur: 0.25 },
      { freq: 554, dur: 0.125 },
      { freq: 494, dur: 0.125 },
      { freq: 440, dur: 0.125 },
      { freq: 554, dur: 0.125 },
      { freq: 659, dur: 0.25 },
      { freq: 740, dur: 0.25 },
      { freq: 659, dur: 0.25 },
      { freq: 554, dur: 0.25 },
      // ===== 间奏（故障效果）=====
      { freq: 220, dur: 0.125 },
      { freq: 0, dur: 0.125 },
      { freq: 330, dur: 0.125 },
      { freq: 0, dur: 0.125 },
      { freq: 220, dur: 0.125 },
      { freq: 330, dur: 0.125 },
      { freq: 0, dur: 0.125 },
      { freq: 440, dur: 0.125 },
      { freq: 0, dur: 0.125 },
      { freq: 330, dur: 0.125 },
      { freq: 0, dur: 0.125 },
      { freq: 440, dur: 0.125 },
      { freq: 554, dur: 0.25 },
      { freq: 659, dur: 0.5 },
      // ===== 冲刺高潮 =====
      { freq: 659, dur: 0.25 },
      { freq: 740, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 988, dur: 0.5 },
      { freq: 880, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 740, dur: 0.25 },
      { freq: 659, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 988, dur: 0.5 },
      { freq: 1175, dur: 0.5 },
      { freq: 988, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      // ===== 回落 =====
      { freq: 740, dur: 0.25 },
      { freq: 659, dur: 0.25 },
      { freq: 554, dur: 0.25 },
      { freq: 440, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 554, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 370, dur: 0.25 },
      { freq: 330, dur: 0.5 },
      // ===== 循环衔接 =====
      { freq: 330, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 587, dur: 0.5 },
      { freq: 0, dur: 0.5 },
      { freq: 440, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 0.25 },
      { freq: 0, dur: 0.25 },
      { freq: 659, dur: 0.5 },
      { freq: 0, dur: 1 }
    ],
    duration: 120,
    volume: 0.1,
    wave: "sawtooth",
    gate: 0.6
  };
  var cyber_rush_default = CyberRush;

  // lib/services/audio/constants/bgm/starlight.js
  var Starlight = {
    name: "Starlight",
    melody: [
      // ===== 引子（深空低吟）=====
      { freq: 330, dur: 2 },
      { freq: 0, dur: 1 },
      { freq: 440, dur: 3 },
      { freq: 0, dur: 1 },
      { freq: 392, dur: 2 },
      { freq: 330, dur: 2 },
      // ===== 星星闪烁 =====
      { freq: 523, dur: 0.5 },
      { freq: 0, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 0, dur: 0.5 },
      { freq: 784, dur: 1 },
      { freq: 659, dur: 0.5 },
      { freq: 523, dur: 0.5 },
      { freq: 440, dur: 1 },
      { freq: 0, dur: 0.5 },
      { freq: 587, dur: 0.5 },
      { freq: 698, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 880, dur: 1.5 },
      // ===== 星座巡游 =====
      { freq: 784, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 988, dur: 1 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 698, dur: 1 },
      { freq: 587, dur: 0.5 },
      { freq: 523, dur: 0.5 },
      { freq: 440, dur: 1.5 },
      { freq: 0, dur: 0.5 },
      // ===== 银河漩涡 =====
      { freq: 659, dur: 0.25 },
      { freq: 698, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 988, dur: 0.25 },
      { freq: 1109, dur: 0.25 },
      { freq: 1175, dur: 0.25 },
      { freq: 1319, dur: 0.25 },
      { freq: 1175, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 1 },
      { freq: 0, dur: 0.5 },
      // ===== 归航 =====
      { freq: 698, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 587, dur: 0.5 },
      { freq: 523, dur: 1 },
      { freq: 440, dur: 0.5 },
      { freq: 392, dur: 0.5 },
      { freq: 330, dur: 1.5 },
      { freq: 0, dur: 0.5 },
      { freq: 440, dur: 1 },
      { freq: 523, dur: 1 },
      { freq: 440, dur: 1.5 },
      // ===== 循环点（重回深空）=====
      { freq: 330, dur: 2 },
      { freq: 0, dur: 1 },
      { freq: 392, dur: 1.5 },
      { freq: 330, dur: 1 },
      { freq: 0, dur: 0.5 },
      { freq: 330, dur: 2 }
    ],
    duration: 180,
    volume: 0.1,
    wave: "sine",
    gate: 1
  };
  var starlight_default = Starlight;

  // lib/services/audio/constants/bgm/final-push.js
  var FinalPush = {
    name: "FinalPush",
    melody: [
      // ===== 战鼓引子 =====
      { freq: 220, dur: 0.5 },
      { freq: 220, dur: 0.5 },
      { freq: 220, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 220, dur: 0.25 },
      { freq: 330, dur: 0.5 },
      { freq: 0, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 330, dur: 0.25 },
      { freq: 440, dur: 1 },
      // ===== 冲锋号角 =====
      { freq: 523, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 784, dur: 1 },
      { freq: 0, dur: 0.25 },
      { freq: 784, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 523, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      { freq: 523, dur: 1 },
      { freq: 0, dur: 0.25 },
      { freq: 587, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 784, dur: 1 },
      // ===== 推进阵线 =====
      { freq: 784, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 988, dur: 0.5 },
      { freq: 1109, dur: 0.5 },
      { freq: 1175, dur: 1 },
      { freq: 0, dur: 0.25 },
      { freq: 988, dur: 0.25 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 659, dur: 1 },
      // ===== 间奏（重整旗鼓）=====
      { freq: 440, dur: 0.5 },
      { freq: 494, dur: 0.5 },
      { freq: 523, dur: 0.5 },
      { freq: 494, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      { freq: 392, dur: 0.5 },
      { freq: 330, dur: 1 },
      { freq: 0, dur: 0.5 },
      { freq: 392, dur: 0.5 },
      { freq: 440, dur: 0.5 },
      { freq: 494, dur: 0.5 },
      { freq: 523, dur: 1 },
      // ===== 总攻高潮 =====
      { freq: 659, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 988, dur: 0.25 },
      { freq: 1175, dur: 0.5 },
      { freq: 1319, dur: 0.5 },
      { freq: 1175, dur: 0.25 },
      { freq: 988, dur: 0.25 },
      { freq: 880, dur: 0.25 },
      { freq: 784, dur: 0.25 },
      { freq: 880, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 1175, dur: 0.5 },
      { freq: 1319, dur: 1 },
      // ===== 胜利在望 =====
      { freq: 1175, dur: 0.5 },
      { freq: 988, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 659, dur: 1 },
      { freq: 784, dur: 0.5 },
      { freq: 659, dur: 0.5 },
      { freq: 523, dur: 1 },
      // ===== 循环（再度冲锋）=====
      { freq: 440, dur: 0.5 },
      { freq: 392, dur: 0.5 },
      { freq: 330, dur: 0.5 },
      { freq: 220, dur: 0.5 },
      { freq: 220, dur: 0.5 },
      { freq: 220, dur: 0.5 },
      { freq: 0, dur: 0.25 },
      { freq: 220, dur: 0.25 },
      { freq: 330, dur: 0.5 },
      { freq: 440, dur: 1.5 }
    ],
    duration: 140,
    volume: 0.11,
    wave: "square",
    gate: 0.8
  };
  var final_push_default = FinalPush;

  // lib/services/audio/constants/bgm/journey-to-west.js
  var JourneyToWest = {
    /** ## 音乐名称 */
    name: "JourneyToWest",
    /**
     * ## 旋律数据
     *
     * 每个音符包含：
     *
     * - `freq`：频率（Hz），0 表示休止符
     * - `dur`：时长系数（乘以 duration 得到实际时长）
     *
     * @type {{ freq: number; dur: number }[]}
     */
    melody: [
      // ===== 前奏：标志性的"丢丢丢丢" =====
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.6 },
      // 休止
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 2.4 },
      // ===== 主旋律（附点节奏 3-1-1）=====
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 0.9 },
      { freq: 440, dur: 2.7 },
      { freq: 523, dur: 3.6 },
      { freq: 587, dur: 3.6 },
      { freq: 587, dur: 0.9 },
      { freq: 587, dur: 2.7 },
      { freq: 659, dur: 4.5 },
      // ===== 冲上云霄 =====
      { freq: 880, dur: 3.6 },
      { freq: 880, dur: 0.9 },
      { freq: 880, dur: 2.7 },
      { freq: 784, dur: 3.6 },
      { freq: 659, dur: 3.6 },
      { freq: 659, dur: 0.9 },
      { freq: 659, dur: 2.7 },
      { freq: 659, dur: 4.5 },
      // ===== 转折 =====
      { freq: 587, dur: 3.6 },
      { freq: 587, dur: 0.9 },
      { freq: 587, dur: 2.7 },
      { freq: 523, dur: 3.6 },
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 0.9 },
      { freq: 440, dur: 2.7 },
      { freq: 440, dur: 4.5 },
      // ===== 燃段 =====
      { freq: 587, dur: 2.7 },
      { freq: 587, dur: 1.8 },
      { freq: 659, dur: 2.7 },
      { freq: 784, dur: 3.6 },
      { freq: 784, dur: 1.8 },
      { freq: 784, dur: 1.8 },
      { freq: 880, dur: 3.6 },
      { freq: 988, dur: 2.7 },
      { freq: 988, dur: 1.8 },
      { freq: 988, dur: 2.7 },
      { freq: 880, dur: 3.6 },
      { freq: 784, dur: 2.7 },
      { freq: 784, dur: 1.8 },
      { freq: 784, dur: 3.6 },
      // ===== 回响：超高音 =====
      { freq: 1175, dur: 1.4 },
      { freq: 1175, dur: 1.4 },
      { freq: 0, dur: 0.9 },
      { freq: 1175, dur: 1.4 },
      { freq: 1175, dur: 1.4 },
      { freq: 0, dur: 0.9 },
      { freq: 880, dur: 2.7 },
      { freq: 880, dur: 2.7 },
      // ===== 结尾 =====
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 1.8 },
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 1.8 },
      { freq: 440, dur: 5.4 }
    ],
    /** ## 每个音符的基准时长（ms），较慢节奏 */
    duration: 110,
    /** ## 音量（0-1），比其他曲目更响亮 */
    volume: 0.12,
    /** ## 波形类型：方波（经典 8-bit 音色） */
    wave: "square"
  };
  var journey_to_west_default = JourneyToWest;

  // lib/services/audio/constants/musics.js
  var Musics = [
    /**
     * ## 背景音乐：TetrisTheme
     *
     * @type {Music}
     */
    tetris_theme_default,
    /**
     * ## 背景音乐：SpringFestival
     *
     * @type {Music}
     */
    spring_festival_default,
    /**
     * ## 背景音乐：FirstDivision
     *
     * @type {Music}
     */
    first_division_default,
    /**
     * ## 背景音乐：GongXiFaCai
     *
     * @type {Music}
     */
    gong_xi_fa_cai_default,
    /**
     * ## 背景音乐：Loginska
     *
     * @type {Music}
     */
    loginska_default,
    /**
     * ## 背景音乐：BeyondTheWall
     *
     * @type {Music}
     */
    beyond_the_wall_default,
    /**
     * ## 背景音乐：Technotris
     *
     * @type {Music}
     */
    technotris_default,
    /**
     * ## 背景音乐：GoldenSnakeDance
     *
     * @type {Music}
     */
    golden_snake_dance_default,
    /**
     * ## 背景音乐：Korobeiniki
     *
     * @type {Music}
     */
    korobeiniki_default,
    /**
     * ## 背景音乐：Ascension
     *
     * @type {Music}
     */
    ascension_default,
    /**
     * ## 背景音乐：NeonNights
     *
     * @type {Music}
     */
    neon_nights_default,
    /**
     * ## 背景音乐：FrozenPeaks
     *
     * @type {Music}
     */
    frozen_peaks_default,
    /**
     * ## 背景音乐：CyberRush
     *
     * @type {Music}
     */
    cyber_rush_default,
    /**
     * ## 背景音乐：Starlight
     *
     * @type {Music}
     */
    starlight_default,
    /**
     * ## 背景音乐：FinalPush
     *
     * @type {Music}
     */
    final_push_default,
    /**
     * ## 背景音乐：JourneyToWest
     *
     * @type {Music}
     */
    journey_to_west_default
  ];
  var musics_default = Musics;

  // lib/services/audio/loop-play-bgm.js
  var SCHEDULE_AHEAD_TIME = 0.12;
  var LOOKAHEAD = 25;
  var loopPlayBGM = (audio, melody, options = {}) => {
    const {
      duration = 110,
      volume = 0.05,
      wave = "square",
      gate = 1,
      articulation = {}
    } = options;
    if (duration <= 0 || !melody?.length) {
      return;
    }
    const { Scheduler: Scheduler2, Context } = audio;
    if (Context.state === "suspended") {
      Context.resume();
    }
    let currentNoteIndex = 0;
    let nextNoteTime = Context.currentTime;
    const scheduleNote = (note, time) => {
      const stepDur = note.dur * duration;
      if (note.freq > 0) {
        play_tone_default(audio, note.freq, stepDur, {
          volume,
          wave,
          gate,
          articulation,
          startTime: time
        });
      }
    };
    const scheduler = () => {
      const audioNow = Context.currentTime;
      const limit = audioNow + SCHEDULE_AHEAD_TIME;
      while (nextNoteTime < limit) {
        const note = melody[currentNoteIndex];
        scheduleNote(note, nextNoteTime);
        const stepDur = note.dur * duration;
        nextNoteTime += stepDur / 1e3;
        currentNoteIndex = (currentNoteIndex + 1) % melody.length;
      }
    };
    audio.bgmSchedulerId = Scheduler2.interval(scheduler, LOOKAHEAD);
  };
  var loop_play_bgm_default = loopPlayBGM;

  // lib/services/audio/play-bgm.js
  var getMusicByLevel = (audio, level) => {
    const { length } = musics_default;
    const { MAX_LEVEL: MAX_LEVEL2 } = game_default;
    const step = Math.floor(MAX_LEVEL2 / length);
    const index = Math.min(Math.floor((level - 1) / step), length - 1);
    return musics_default[index];
  };
  var playBGM = (audio, level = 1) => {
    const music = getMusicByLevel(audio, level);
    const { melody, duration, volume, wave, gate, articulation } = music;
    loop_play_bgm_default(audio, melody, {
      duration,
      volume,
      wave,
      gate,
      articulation
    });
  };
  var play_bgm_default = playBGM;

  // lib/services/audio/stop-bgm.js
  var stopBGM = (audio) => {
    audio.Scheduler.cancel(audio.bgmSchedulerId);
    audio.bgmSchedulerId = 0;
  };
  var stop_bgm_default = stopBGM;

  // lib/services/audio/toggle-bgm.js
  var toggleBGM = (audio, level) => {
    if (audio.bgmSchedulerId === 0) {
      play_bgm_default(audio, level);
    } else {
      stop_bgm_default(audio);
    }
  };
  var toggle_bgm_default = toggleBGM;

  // lib/events/event-catalog.js
  var AnimationsEvents = (uuid) => ({
    CLEAR: `animations:${uuid}:clear`
  });
  var AudioEvents = () => ({
    /* ---------- 背景音乐 ---------- */
    RESUME_BGM: "audio:resume:bgm",
    STOP_BGM: "audio:stop:bgm",
    TOGGLE_BGM: "audio:toggle:bgm",
    /* ---------- 游戏音效 ---------- */
    PLAY_SOUND: "audio:play:sound"
  });
  var AIEvents = (uuid) => ({
    START: `ai:${uuid}:start`,
    STOP: `ai:${uuid}:stop`
  });
  var CommandEvents = (uuid) => ({
    CLEAR: `command:queue:${uuid}:clear`,
    ENQUEUE: `command:queue:${uuid}:enqueue`
  });
  var GameEvents = (uuid) => ({
    /* ---------- 状态更新 ---------- */
    UPDATE_STATE: `game:${uuid}:update:state`,
    UPDATE_MODE: `game:${uuid}:update:mode`,
    UPDATE_LEVEL: `game:${uuid}:update:level`,
    UPDATE_GAMEPAD_CONNECTED: `game:${uuid}:update:gamepad:connected`,
    /* ---------- HUD 更新 ---------- */
    SWITCH_CONTROLLER: `game:${uuid}:swtich:controller`,
    UPDATE_HUD: `game:${uuid}:update:hud`,
    SAVE_HIGH_SCORE: `game:${uuid}:save:high:score`,
    /* ---------- 场景更新 ---------- */
    SELECT_LEVEL: `game:${uuid}:select:level`,
    SWITCH_TO_DIFFICULTY: `game:${uuid}:switch:difficulty`,
    SELECT_DIFFICULTY: `game:${uuid}:select:difficulty`,
    SWITCH_TO_MAIN_MENU: `game:${uuid}:switch:to:main:menu`,
    /* ---------- 核心流程 ---------- */
    BEGIN: `game:${uuid}:begin`,
    START: `game:${uuid}:start`,
    TOGGLE_PAUSED: `game:${uuid}:toggle:paused`,
    RESET: `game:${uuid}:reset`,
    RESTART: `game:${uuid}:restart`,
    OVER: `game:${uuid}:over`,
    /* ---------- 方块操作 ---------- */
    BLOCK_MOVE: `game:${uuid}:block:move`,
    BLOCK_ROTATE: `game:${uuid}:block:rotate`,
    BLOCK_DROP: `game:${uuid}:block:drop`,
    BLOCK_TICK: `game:${uuid}:block:tick`,
    BLOCK_SPAWN: `game:${uuid}:block:spawn`,
    /* ---------- 动画特效 ---------- */
    START_COUNTDOWN: `game:${uuid}:start:countdown`,
    START_PAUSED: `game:${uuid}:start:paused`,
    STOP_PAUSED: `game:${uuid}:stop:paused`,
    START_CLEAR_LINES: `game:${uuid}:start:clear:lines`,
    START_CLEAR_SCORE: `game:${uuid}:start:clear:score`,
    START_LEVEL_UP: `game:${uuid}:start:level:up`,
    START_LANDING_FLASH: `game:${uuid}:start:landing:flash`,
    /* ---------- 背景音乐 ---------- */
    TOGGLE_BGM: `game:${uuid}:toggle:bgm`,
    /* ---------- 回放准备 ---------- */
    REPLAY_PREPARE: `game:${uuid}:replay:prepare`
  });
  var ReplayEvents = (uuid) => ({
    /* ---------- 记录操作 ---------- */
    START_RECORD: `replay:${uuid}:start:record`,
    STOP_RECORD: `replay:${uuid}:stop:record`,
    ADD_RECORD: `replay:${uuid}:add:record`,
    ADD_PIECE: `replay:${uuid}:add:piece`,
    /* ---------- 回放操作 ---------- */
    START_PLAY: `replay:${uuid}:start:play`,
    RESET: `replay:${uuid}:reset`,
    /* ---------- 流程控制 ---------- */
    GAME_OVER: `replay:${uuid}:game:over`,
    STOP_CLEAR_LINES: `replay:${uuid}:stop:clear:lines`
  });
  var UIEvents = (uuid) => ({
    /* ---------- HUD 绘制 ---------- */
    UPDATE_MODE: `ui:${uuid}:update:mode`,
    UPDATE_CONTROLLER: `ui:${uuid}:update:controller`,
    UPDATE_HUD: `ui:${uuid}:update:hud`,
    /* ---------- 画布绘制 ---------- */
    RESIZE: `ui:${uuid}:resize`,
    /* ---------- 动画特效 ---------- */
    RENDER_NEXT_PIECE: `ui:${uuid}:render:next:piece`,
    RENDER_COUNTDOWN: `ui:${uuid}:render:countdown`,
    RENDER_CLEAR_LINES: `ui:${uuid}:render:clear:lines`,
    RENDER_CLEAR_SCORE: `ui:${uuid}:render:clear:score`,
    RENDER_LEVEL_UP: `ui:${uuid}:render:level:up`,
    RENDER_LANDING_FLASH: `ui:${uuid}:render:landing:flash`
  });

  // lib/services/audio/index.js
  var Audio = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Scheduler - 任务调度器
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    /**
     * ## 初始化音频系统
     *
     * 创建 AudioContext 和 Sounds 实例。
     *
     * @param {object} options - 配置对象
     * @returns {void}
     */
    initialize(options) {
      const Context = new AudioContext();
      this.Context = Context;
      this.Sounds = new sounds_default({
        ...options,
        Context
      });
      this.bgmSchedulerId = 0;
    }
    /**
     * ## 播放背景音乐
     *
     * @param {number} level - 当前游戏等级（影响曲目选择）
     * @returns {void}
     */
    playBGM(level) {
      play_bgm_default(this, level);
    }
    /**
     * ## 停止背景音乐
     *
     * @returns {void}
     */
    stopBGM() {
      stop_bgm_default(this);
    }
    /**
     * ## 切换背景音乐
     *
     * @param {number} level - 当前游戏等级
     * @returns {void}
     */
    toggleBGM(level) {
      toggle_bgm_default(this, level);
    }
    /**
     * ## 订阅音频事件
     *
     * 绑定背景音乐和音效相关的事件监听。
     *
     * @returns {void}
     */
    subscribe() {
      const events = AudioEvents();
      this.on(events.RESUME_BGM, this._onPlayBGM);
      this.on(events.STOP_BGM, this._onStopBGM);
      this.on(events.TOGGLE_BGM, this._onToggleBGM);
      this.on(events.PLAY_SOUND, this._onPlaySound);
    }
    /**
     * ## 取消订阅音频事件
     *
     * @returns {void}
     */
    unsubscribe() {
      const events = AudioEvents();
      this.off(events.RESUME_BGM, this._onPlayBGM);
      this.off(events.STOP_BGM, this._onStopBGM);
      this.off(events.TOGGLE_BGM, this._onToggleBGM);
      this.off(events.PLAY_SOUND, this._onPlaySound);
    }
    /**
     * ## 处理播放背景音乐事件
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {number} payload.level - 游戏等级
     * @returns {void}
     */
    _onPlayBGM = ({ level }) => {
      this.playBGM(level);
    };
    /**
     * ## 处理停止背景音乐事件
     *
     * @private
     * @returns {void}
     */
    _onStopBGM = () => {
      this.stopBGM();
    };
    /**
     * ## 处理切换背景音乐事件
     *
     * 先播放切换音效，再执行切换逻辑。
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {number} payload.level - 游戏等级
     * @returns {void}
     */
    _onToggleBGM = ({ level }) => {
      this.emit("audio:resume:sound", { sound: "BGM_TOGGLED" });
      this.toggleBGM(level);
    };
    /**
     * ## 处理播放音效事件
     *
     * 根据 sound 名称从 Sounds 集合中找到对应的音效函数并执行。
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {string} payload.sound - 音效名称（如 MOVE、ROTATE、CLEAR 等）
     * @param {number} [payload.lines] - 消除行数（消行音效专用）
     * @param {number} [payload.level] - 当前等级（消行音效专用）
     * @returns {void}
     */
    _onPlaySound = ({ sound, lines, level }) => {
      const { Sounds: Sounds2 } = this;
      const handler = Sounds2[sound];
      if (is_function_default(handler)) {
        handler(lines, level);
      }
    };
  };
  var audio_default = Audio;

  // lib/events/router/game-router.js
  var GameRouter = class extends core_default {
    /**
     * ## 构造函数
     *
     * 依赖由父类 `Base` 通过 `inject()` 注入。 Router 需要的依赖包括 Game、Store、各子模块等。
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
    }
    /**
     * ## 订阅所有游戏事件
     *
     * 绑定核心流程、方块操作、动画特效等所有 `game:*` 事件。 同时触发各子模块的 subscribe。
     *
     * @returns {void}
     */
    subscribe() {
      const { Animations, AI, CommandQueue: CommandQueue2, Game: Game2, Replay, UI: UI2 } = this;
      const events = GameEvents(Game2.id);
      this.on(events.UPDATE_STATE, this._onUpdateState);
      this.on(events.UPDATE_MODE, this._onUpdateMode);
      this.on(events.UPDATE_LEVEL, this._onUpdateLevel);
      this.on(events.UPDATE_GAMEPAD_CONNECTED, this._onUpdateGamepadConnected);
      this.on(events.SWITCH_CONTROLLER, this._onSwitchController);
      this.on(events.UPDATE_HUD, this._onUpdateHud);
      this.on(events.SAVE_HIGH_SCORE, this._onSaveHighScore);
      this.on(events.SELECT_LEVEL, this._onSelectLevel);
      this.on(events.SWITCH_TO_DIFFICULTY, this._onSwitchToDifficulty);
      this.on(events.SELECT_DIFFICULTY, this._onSelectDifficulty);
      this.on(events.SWITCH_TO_MAIN_MENU, this._onSwitchToMainMenu);
      this.on(events.BEGIN, this._onGameBegin);
      this.on(events.START, this._onGameStart);
      this.on(events.TOGGLE_PAUSED, this._onTogglePaused);
      this.on(events.RESTART, this._onGameRestart);
      this.on(events.RESET, this._onGameReset);
      this.on(events.OVER, this._onGameOver);
      this.on(events.BLOCK_MOVE, this._onBlockMove);
      this.on(events.BLOCK_ROTATE, this._onBlockRotate);
      this.on(events.BLOCK_DROP, this._onBlockDrop);
      this.on(events.BLOCK_TICK, this._onBlockTick);
      this.on(events.BLOCK_SPAWN, this._onBlockSpawn);
      this.on(events.START_COUNTDOWN, this._onStartCountdown);
      this.on(events.START_PAUSED, this._onStartPaused);
      this.on(events.STOP_PAUSED, this._onStopPaused);
      this.on(events.START_CLEAR_LINES, this._onStartClearLines);
      this.on(events.START_CLEAR_SCORE, this._onStartClearScore);
      this.on(events.START_LEVEL_UP, this._onStartLevelUp);
      this.on(events.START_LANDING_FLASH, this._onStartLandingFlash);
      this.on(events.TOGGLE_BGM, this._onToggleBGM);
      this.on(events.REPLAY_PREPARE, this._onReplayPrepare);
      AI.subscribe();
      Animations.subscribe();
      CommandQueue2.subscribe();
      Replay.subscribe();
      UI2.subscribe();
    }
    /**
     * ## 取消订阅所有游戏事件
     *
     * 同时触发各子模块的 unsubscribe。
     *
     * @returns {void}
     */
    unsubscribe() {
      const { Animations, AI, CommandQueue: CommandQueue2, Game: Game2, Replay, UI: UI2 } = this;
      const events = GameEvents(Game2.id);
      this.off(events.UPDATE_STATE, this._onUpdateState);
      this.off(events.UPDATE_MODE, this._onUpdateMode);
      this.off(events.UPDATE_LEVEL, this._onUpdateLevel);
      this.off(events.UPDATE_GAMEPAD_CONNECTED, this._onUpdateGamepadConnected);
      this.off(events.SWITCH_CONTROLLER, this._onSwitchController);
      this.off(events.UPDATE_HUD, this._onUpdateHud);
      this.off(events.SAVE_HIGH_SCORE, this._onSaveHighScore);
      this.off(events.SELECT_LEVEL, this._onSelectLevel);
      this.off(events.SWITCH_TO_DIFFICULTY, this._onSwitchToDifficulty);
      this.off(events.SELECT_DIFFICULTY, this._onSelectDifficulty);
      this.off(events.SWITCH_TO_MAIN_MENU, this._onSwitchToMainMenu);
      this.off(events.BEGIN, this._onGameBegin);
      this.off(events.START, this._onGameStart);
      this.off(events.TOGGLE_PAUSED, this._onTogglePaused);
      this.off(events.RESTART, this._onGameRestart);
      this.off(events.RESET, this._onGameReset);
      this.off(events.OVER, this._onGameOver);
      this.off(events.BLOCK_MOVE, this._onBlockMove);
      this.off(events.BLOCK_ROTATE, this._onBlockRotate);
      this.off(events.BLOCK_DROP, this._onBlockDrop);
      this.off(events.BLOCK_TICK, this._onBlockTick);
      this.off(events.BLOCK_SPAWN, this._onBlockSpawn);
      this.off(events.START_COUNTDOWN, this._onStartCountdown);
      this.off(events.START_PAUSED, this._onStartPaused);
      this.off(events.STOP_PAUSED, this._onStopPaused);
      this.off(events.START_CLEAR_LINES, this._onStartClearLines);
      this.off(events.START_CLEAR_SCORE, this._onStartClearScore);
      this.off(events.START_LEVEL_UP, this._onStartLevelUp);
      this.off(events.START_LANDING_FLASH, this._onStartLandingFlash);
      this.off(events.TOGGLE_BGM, this._onToggleBGM);
      this.off(events.REPLAY_PREPARE, this._onReplayPrepare);
      AI.unsubscribe();
      Animations.unsubscribe();
      CommandQueue2.unsubscribe();
      Replay.unsubscribe();
      UI2.unsubscribe();
    }
    // ==================== 事件处理器（私有） ====================
    /**
     * ## 切换控制者（human ↔ ai）
     *
     * 读取当前控制者身份，取反后更新 Store， 并发送相应的 AI 启停事件和 UI 更新事件。
     *
     * @private
     * @returns {void}
     */
    _onSwitchController = () => {
      const { Store, Game: Game2 } = this;
      const uuid = Game2.id;
      const controller = Store.getController() === "human" ? "ai" : "human";
      const AE = AIEvents(uuid);
      const UE = UIEvents(uuid);
      Store.setController(controller);
      if (controller === "ai") {
        this.emit(AE.START);
      } else {
        this.emit(AE.STOP);
      }
      this.emit(UE.UPDATE_CONTROLLER, { controller });
    };
    /**
     * ## 更新 Store 状态
     *
     * @private
     * @param {object} options - 参数对象
     * @param {Function} options.stateHandler - 状态更新函数
     * @returns {void}
     */
    _onUpdateState = (options) => {
      const { Store } = this;
      const { stateHandler } = options;
      Store.setState(stateHandler);
    };
    /**
     * ## 更新游戏模式
     *
     * 同时通知 UI 层更新 mode 显示。
     *
     * @private
     * @param {object} options - 参数对象
     * @param {string} options.mode - 游戏模式
     * @returns {void}
     */
    _onUpdateMode = (options) => {
      const { Store, Game: Game2 } = this;
      const { mode } = options;
      const events = UIEvents(Game2.id);
      this.emit(events.UPDATE_MODE, { mode });
      Store.setMode(mode);
    };
    /**
     * ## 更新等级
     *
     * @private
     * @param {object} options - 参数对象
     * @param {number} options.level - 等级值
     * @returns {void}
     */
    _onUpdateLevel = (options) => {
      const { Store } = this;
      const { level } = options;
      Store.setLevel(level);
    };
    /**
     * ## 刷新 HUD 显示
     *
     * 读取当前 Store 状态，通知 UI 层更新分数、等级、行数等。
     *
     * @private
     * @returns {void}
     */
    _onUpdateHud = () => {
      const { Store, Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.emit(events.UPDATE_HUD, { state: Store.getState() });
    };
    /**
     * ## 保存最高分
     *
     * 将当前分数与历史最高分比较，如果更高则持久化存储。
     *
     * @private
     * @returns {void}
     */
    _onSaveHighScore = () => {
      const { Store, Game: Game2 } = this;
      Game2.saveHighScore(Store.getScore());
    };
    /**
     * ## 选择等级
     *
     * @private
     * @param {object} options - 参数对象
     * @param {number} options.level - 等级值
     * @returns {void}
     */
    _onSelectLevel = (options) => {
      const { Store, Game: Game2 } = this;
      const { level } = options;
      const events = UIEvents(Game2.id);
      Game2.selectLevel(level);
      this.emit(events.UPDATE_HUD, { state: Store.getState() });
    };
    /**
     * ## 切换到难度选择界面
     *
     * @private
     * @returns {void}
     */
    _onSwitchToDifficulty = () => {
      const { Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.emit(events.UPDATE_MODE, { mode: "difficulty" });
      Game2.switchToDifficulty();
    };
    /**
     * ## 选择难度
     *
     * @private
     * @param {object} options - 参数对象
     * @param {string} options.difficulty - 难度等级（easy / normal / hard / expert）
     * @returns {void}
     */
    _onSelectDifficulty = (options) => {
      const { Game: Game2 } = this;
      const { difficulty } = options;
      Game2.selectDifficulty(difficulty);
    };
    /**
     * ## 切换到主菜单
     *
     * @private
     * @returns {void}
     */
    _onSwitchToMainMenu = () => {
      const { Game: Game2 } = this;
      Game2.switchToMainMenu();
    };
    /**
     * ## 开始游戏流程
     *
     * 从主菜单/难度选择进入游戏， 初始化棋盘、生成方块、播放音效和背景音乐。
     *
     * @private
     * @returns {void}
     */
    _onGameBegin = () => {
      const { Game: Game2 } = this;
      Game2.begin();
    };
    /**
     * ## 进入倒计时
     *
     * 从等级选择界面进入 3-2-1 倒计时。 如果当前是 AI 控制，发送 AI 启动事件。
     *
     * @private
     * @returns {void}
     */
    _onGameStart = () => {
      const { Store, Game: Game2 } = this;
      const events = AIEvents(Game2.id);
      Game2.start();
      if (Store.getController() === "ai") {
        this.emit(events.START);
      }
    };
    /**
     * ## 暂停/继续切换
     *
     * 根据切换后的模式自动管理 AI 的启停。
     *
     * @private
     * @returns {void}
     */
    _onTogglePaused = () => {
      const { Store, Game: Game2 } = this;
      const events = AIEvents(Game2.id);
      Game2.togglePause();
      if (Store.getController() === "ai") {
        const { mode } = Store.getState();
        if (mode === "paused") {
          this.emit(events.STOP);
        } else if (mode === "playing") {
          this.emit(events.START);
        }
      }
    };
    /**
     * ## 重置游戏
     *
     * @private
     * @returns {void}
     */
    _onGameReset = () => {
      const { Game: Game2 } = this;
      Game2.reset();
    };
    /**
     * ## 重新开始游戏
     *
     * @private
     * @returns {void}
     */
    _onGameRestart = () => {
      const { Game: Game2 } = this;
      Game2.restart();
    };
    /**
     * ## 游戏结束
     *
     * @private
     * @returns {void}
     */
    _onGameOver = () => {
      const { Game: Game2 } = this;
      Game2.over();
    };
    /**
     * ## 生成新方块
     *
     * @private
     * @returns {void}
     */
    _onBlockSpawn = () => {
      const { Game: Game2 } = this;
      Game2.spawn();
    };
    /**
     * ## 移动方块
     *
     * @private
     * @param {object} options - 参数对象
     * @param {number} options.ox - X 轴偏移（负值左移，正值右移）
     * @param {number} options.oy - Y 轴偏移（正值下移）
     * @returns {void}
     */
    _onBlockMove = (options) => {
      const { Game: Game2 } = this;
      const { ox, oy } = options;
      Game2.move(ox, oy);
    };
    /**
     * ## 旋转方块
     *
     * @private
     * @returns {void}
     */
    _onBlockRotate = () => {
      const { Game: Game2 } = this;
      Game2.rotate();
    };
    /**
     * ## 硬降方块
     *
     * 将方块瞬间落到底部。
     *
     * @private
     * @returns {void}
     */
    _onBlockDrop = () => {
      const { Game: Game2 } = this;
      Game2.drop();
    };
    /**
     * ## 游戏逻辑帧
     *
     * 处理自动下落、锁定、消行等逻辑。
     *
     * @private
     * @param {object} options - 参数对象
     * @param {boolean} options.isBlocked - 是否被动画阻塞
     * @returns {void}
     */
    _onBlockTick = (options) => {
      const { Game: Game2 } = this;
      const { isBlocked } = options;
      Game2.tick(isBlocked);
    };
    /**
     * ## 背景音乐切换
     *
     * @private
     * @returns {void}
     */
    _onToggleBGM = () => {
      const { Store } = this;
      const events = AudioEvents();
      this.emit(events.TOGGLE_BGM, {
        level: Store.getLevel()
      });
    };
    /**
     * ## 回放准备棋盘
     *
     * 重置棋盘为初始状态，设置回放模式，开始回放。
     *
     * @private
     * @returns {void}
     */
    _onReplayPrepare = () => {
      const { Store, Game: Game2 } = this;
      const uuid = Game2.id;
      const UE = UIEvents(uuid);
      const RE = ReplayEvents(uuid);
      const GE = GameEvents(uuid);
      Store.resetBoard();
      Store.setState({
        board: Store.getBeginningBoard(),
        score: 0,
        lines: 0,
        level: 1
      });
      this.emit(UE.UPDATE_MODE, { mode: "replay" });
      Store.setMode("replay");
      this.emit(UE.UPDATE_HUD, { state: Store.getState() });
      this.emit(RE.START_PLAY);
      this.emit(GE.BLOCK_SPAWN);
    };
    /**
     * ## 更新手柄连接状态
     *
     * @private
     * @param {object} options - 参数对象
     * @param {boolean} options.connected - 是否已连接
     * @returns {void}
     */
    _onUpdateGamepadConnected = (options) => {
      const { Store } = this;
      const { connected } = options;
      Store.setGamepadConnected(connected);
    };
    /**
     * ## 开始倒计时动画
     *
     * @private
     * @returns {void}
     */
    _onStartCountdown = () => {
      const { Game: Game2 } = this;
      Game2.startCountdown();
    };
    /**
     * ## 开始暂停动画
     *
     * @private
     * @returns {void}
     */
    _onStartPaused = () => {
      const { Game: Game2 } = this;
      Game2.startPaused();
    };
    /**
     * ## 停止暂停动画
     *
     * @private
     * @returns {void}
     */
    _onStopPaused = () => {
      const { Game: Game2 } = this;
      Game2.stopPaused();
    };
    /**
     * ## 开始消行动画
     *
     * @private
     * @param {object} options - 参数对象
     * @param {number[]} options.linesToClear - 待消除的行号数组
     * @returns {void}
     */
    _onStartClearLines = (options) => {
      const { Game: Game2 } = this;
      const { linesToClear } = options;
      Game2.startClearLines(linesToClear);
    };
    /**
     * ## 开始消除得分动画
     *
     * 在消除行的位置显示上浮渐隐的得分数字。
     *
     * @private
     * @param {object} options - 参数对象
     * @param {number} options.score - 本次消除得分
     * @param {number[]} options.lines - 消除的行号数组
     * @returns {void}
     */
    _onStartClearScore = (options) => {
      const { Game: Game2 } = this;
      Game2.startClearScore(options);
    };
    /**
     * ## 开始升级动画
     *
     * 播放烟花粒子特效庆祝升级。
     *
     * @private
     * @param {object} options - 参数对象
     * @param {number} options.level - 新等级
     * @returns {void}
     */
    _onStartLevelUp = (options) => {
      const { Game: Game2 } = this;
      const { level } = options;
      Game2.startLevelUp(level);
    };
    /**
     * ## 开始落地高亮动画
     *
     * 方块落地的瞬间在落地格子上显示半透明白色闪烁。
     *
     * @private
     * @param {object} options - 参数对象
     * @param {object} options.piece - 刚落地的方块信息
     * @param {number[][]} options.piece.shape - 方块形状矩阵
     * @param {number} options.piece.cx - 方块 X 坐标
     * @param {number} options.piece.cy - 方块 Y 坐标
     * @returns {void}
     */
    _onStartLandingFlash = (options) => {
      const { Game: Game2 } = this;
      const { piece } = options;
      Game2.startLandingFlash(piece);
    };
  };
  var game_router_default = GameRouter;

  // lib/state/game-state.js
  var GameState = {
    /** ## 当前控制者身份：human / ai */
    controller: "human",
    /** ## 游戏初始化时的棋盘数据（用于回放） */
    beginningBoard: [],
    /** ## 游戏棋盘（20×10），存储颜色值字符串 */
    board: [],
    /** ## 当前活动方块 */
    curr: null,
    /** ## 当前方块 X 坐标（列） */
    cx: 0,
    /** ## 当前方块 Y 坐标（行） */
    cy: 0,
    /** ## 下一个预览方块 */
    next: null,
    /** ## 当前得分 */
    score: 0,
    /** ## 累计消除行数 */
    lines: 0,
    /** ## 当前等级 */
    level: 1,
    /** ## 历史最高分 */
    highScore: 0,
    /** ## 升级基准行数 */
    baseLines: 0,
    /** ## 升级消减行数 */
    levelUpSteps: 10,
    /** ## 当前待消除行号 */
    clearLines: [],
    /** ## 游戏难度 */
    difficulty: "easy",
    /**
     * ## 游戏模式
     *
     * - `main-menu`：等级选择（主菜单）
     * - `playing`：游戏中
     * - `paused`：游戏暂停
     * - `game-over`：游戏结束
     */
    mode: "main-menu",
    /** ## 手柄连接状态 */
    gamepadConnected: false
  };
  var game_state_default = GameState;

  // lib/constants/colors.js
  var TEAL = "#00c8ff";
  var RGBA_TEAL = "rgba(0, 200, 255, 0.3)";
  var YELLOW = "#f1fa04";
  var RGBA_YELLOW = "rgba(255, 255, 0, 0.3)";
  var PURPLE = "#d31ac1";
  var RGBA_PURPLE = "rgba(211, 26, 193, 0.3)";
  var BLUE = "#5050ff";
  var RGBA_BLUE = "rgba(80, 80, 255, 0.3)";
  var ORANGE = "#ffa500";
  var RGBA_ORANGE = "rgba(255, 127, 0, 0.3)";
  var GREEN = "#0afa04";
  var DARK_GREEN = "#5c9d31";
  var RGBA_GREEN = "rgba(0, 255, 0, 0.3)";
  var RED = "#ff3b30";
  var RGBA_RED = "rgba(255, 59, 48, 0.3)";
  var CORAL = "#e64a19";
  var RGBA_CORAL = "rgba(230, 74, 25, 0.3)";
  var BLACK = "#444";
  var RGBA_BLACK = "rgba(0, 0, 0, 0.3)";
  var WHITE = "#fff";
  var RGBA_WHITE = "rgba(255, 255, 255, 0.3)";
  var PINK = "#ff4fa3";
  var RGBA_PINK = "rgba(255, 79, 163, 0.3)";
  var VIOLET = "#7b34eb";
  var RGBA_VIOLET = "rgba(123, 52, 235, 0.3)";
  var CYAN = "#0cc0df";
  var RGBA_CYAN = "rgba(12, 192, 223, 0.3)";
  var WARM_TEAL = "#ff6b6b";
  var WARM_GREEN = "#ffa502";
  var WARM_ORANGE = "#ffd700";
  var WARM_YELLOW = "#ff7f50";
  var WARM_BLUE = "#ff4757";
  var WARM_PINK = "#ff6348";
  var WARM_RED = "#e74c3c";
  var WARM_VIOLET = "#f39c12";
  var COOL_TEAL = "#00d2d3";
  var COOL_GREEN = "#1dd1a1";
  var COOL_ORANGE = "#54a0ff";
  var COOL_YELLOW = "#5f27cd";
  var COOL_BLUE = "#01a3a4";
  var COOL_PINK = "#0abde3";
  var COOL_RED = "#48dbfb";
  var COOL_VIOLET = "#2e86de";
  var CANDY_TEAL = "#f368e0";
  var CANDY_GREEN = "#ff9ff3";
  var CANDY_ORANGE = "#feca57";
  var CANDY_YELLOW = "#ff9f43";
  var CANDY_BLUE = "#ee5a24";
  var CANDY_PINK = "#f78fb3";
  var CANDY_RED = "#cf6a87";
  var CANDY_VIOLET = "#e056a0";
  var FOREST_TEAL = "#26de81";
  var FOREST_GREEN = "#20bf6b";
  var FOREST_ORANGE = "#2bcbba";
  var FOREST_YELLOW = "#0fb9b1";
  var FOREST_BLUE = "#45aaf2";
  var FOREST_PINK = "#4b7bec";
  var FOREST_RED = "#a55eea";
  var FOREST_VIOLET = "#8854d0";
  var SUNSET_TEAL = "#ff6b35";
  var SUNSET_GREEN = "#f7c59f";
  var SUNSET_ORANGE = "#e08e45";
  var SUNSET_YELLOW = "#d4a373";
  var SUNSET_BLUE = "#cc8b5c";
  var SUNSET_PINK = "#b56576";
  var SUNSET_RED = "#a45c5c";
  var SUNSET_VIOLET = "#8b5e3c";
  var NEON_TEAL = "#ff00ff";
  var NEON_GREEN = "#00ffff";
  var NEON_ORANGE = "#ffff00";
  var NEON_YELLOW = "#ff0080";
  var NEON_BLUE = "#00ff80";
  var NEON_PINK = "#8000ff";
  var NEON_RED = "#ff8000";
  var NEON_VIOLET = "#0080ff";
  var JEWEL_TEAL = "#00d2d3";
  var JEWEL_GREEN = "#2ed573";
  var JEWEL_ORANGE = "#ffa502";
  var JEWEL_YELLOW = "#ff6348";
  var JEWEL_BLUE = "#1e90ff";
  var JEWEL_PINK = "#ff6b81";
  var JEWEL_RED = "#ff4757";
  var JEWEL_VIOLET = "#7b68ee";
  var COLORS = {
    // 基础
    TEAL,
    RGBA_TEAL,
    YELLOW,
    RGBA_YELLOW,
    PURPLE,
    RGBA_PURPLE,
    BLUE,
    RGBA_BLUE,
    ORANGE,
    RGBA_ORANGE,
    GREEN,
    DARK_GREEN,
    RGBA_GREEN,
    RED,
    RGBA_RED,
    CORAL,
    RGBA_CORAL,
    BLACK,
    RGBA_BLACK,
    WHITE,
    RGBA_WHITE,
    PINK,
    RGBA_PINK,
    VIOLET,
    RGBA_VIOLET,
    CYAN,
    RGBA_CYAN,
    // WARM
    WARM_TEAL,
    WARM_GREEN,
    WARM_ORANGE,
    WARM_YELLOW,
    WARM_BLUE,
    WARM_PINK,
    WARM_RED,
    WARM_VIOLET,
    // COOL
    COOL_TEAL,
    COOL_GREEN,
    COOL_ORANGE,
    COOL_YELLOW,
    COOL_BLUE,
    COOL_PINK,
    COOL_RED,
    COOL_VIOLET,
    // CANDY
    CANDY_TEAL,
    CANDY_GREEN,
    CANDY_ORANGE,
    CANDY_YELLOW,
    CANDY_BLUE,
    CANDY_PINK,
    CANDY_RED,
    CANDY_VIOLET,
    // FOREST
    FOREST_TEAL,
    FOREST_GREEN,
    FOREST_ORANGE,
    FOREST_YELLOW,
    FOREST_BLUE,
    FOREST_PINK,
    FOREST_RED,
    FOREST_VIOLET,
    // SUNSET
    SUNSET_TEAL,
    SUNSET_GREEN,
    SUNSET_ORANGE,
    SUNSET_YELLOW,
    SUNSET_BLUE,
    SUNSET_PINK,
    SUNSET_RED,
    SUNSET_VIOLET,
    // NEON
    NEON_TEAL,
    NEON_GREEN,
    NEON_ORANGE,
    NEON_YELLOW,
    NEON_BLUE,
    NEON_PINK,
    NEON_RED,
    NEON_VIOLET,
    // JEWEL
    JEWEL_TEAL,
    JEWEL_GREEN,
    JEWEL_ORANGE,
    JEWEL_YELLOW,
    JEWEL_BLUE,
    JEWEL_PINK,
    JEWEL_RED,
    JEWEL_VIOLET
  };
  var colors_default = COLORS;

  // lib/state/utils/generate-garbage-rows.js
  var { RED: RED2, GREEN: GREEN2, BLUE: BLUE2, YELLOW: YELLOW2, PURPLE: PURPLE2, TEAL: TEAL2, ORANGE: ORANGE2 } = colors_default;
  var DEFAULT_COLOR_MAP = [RED2, GREEN2, BLUE2, YELLOW2, PURPLE2, TEAL2, ORANGE2];
  var generateGarbageRows = (rows, cols, colorMap) => {
    const colors = colorMap || DEFAULT_COLOR_MAP;
    const garbage = [];
    for (let i = 0; i < rows; i += 1) {
      const row = Array.from({ length: cols }).fill("");
      for (let col = 0; col < cols; col += 1) {
        row[col] = colors[Math.floor(Math.random() * colors.length)];
      }
      const maxHoles = cols - 3;
      const holes = 1 + Math.floor(Math.random() * maxHoles);
      const holePositions = /* @__PURE__ */ new Set();
      while (holePositions.size < holes) {
        holePositions.add(Math.floor(Math.random() * cols));
      }
      for (const pos of holePositions) {
        row[pos] = "";
      }
      garbage.push(row);
    }
    return garbage;
  };
  var generate_garbage_rows_default = generateGarbageRows;

  // lib/state/utils/place-garbage-on-board.js
  var placeGarbageOnBoard = (board, garbageRowCount, cols) => {
    const rows = board.length;
    if (garbageRowCount <= 0) return;
    const garbageRows = generate_garbage_rows_default(garbageRowCount, cols);
    const startRow = rows - garbageRowCount;
    for (let i = 0; i < garbageRows.length; i++) {
      if (startRow + i >= 0) {
        board[startRow + i] = [...garbageRows[i]];
      }
    }
  };
  var place_garbage_on_board_default = placeGarbageOnBoard;

  // lib/state/game-store.js
  var GameStore = class {
    /**
     * ## 构造函数
     *
     * 初始化内部状态，使用深拷贝保证与外部状态隔离。
     *
     * @param {object} options - 配置选项
     */
    constructor(options) {
      this.initialize(options);
    }
    /**
     * ## 初始化 Store
     *
     * 保存默认状态（用于重置）和棋盘尺寸配置。
     *
     * @param {object} options - 配置选项
     * @returns {void}
     */
    initialize(options) {
      const { GameState: GameState2, cols, rows } = options;
      this.defaults = structuredClone(GameState2);
      this.options = { cols, rows };
      this.state = structuredClone(GameState2);
    }
    /**
     * ## 获取完整 state
     *
     * @returns {object} 当前游戏状态对象
     */
    getState() {
      return this.state;
    }
    /**
     * ## 更新 state（支持 patch 或函数）
     *
     * 支持两种更新模式：
     *
     * 1. **对象 patch**：`setState({ score: 100 })`
     * 2. **函数式更新**：`setState((prev) => ({ score: prev.score + 50 }))`
     *
     * @param {object | Function} patch - 状态更新内容或函数
     * @returns {void}
     */
    setState(patch) {
      this.state = {
        ...this.state,
        ...is_function_default(patch) ? patch(this.state) : patch
      };
    }
    /**
     * ## 重置状态为初始值
     *
     * 使用深拷贝恢复，确保与原默认状态完全隔离。
     *
     * @returns {void}
     */
    resetState() {
      this.state = structuredClone(this.defaults);
    }
    /**
     * ## 获取当前棋盘
     *
     * @returns {string[][]} 棋盘二维数组
     */
    getBoard() {
      return this.state.board;
    }
    /**
     * ## 重置棋盘
     *
     * 根据配置的 rows 和 cols 生成全空的棋盘。
     *
     * @returns {void}
     */
    resetBoard() {
      const { cols, rows } = this.options;
      this.state.board = Array.from(
        { length: rows },
        () => Array.from({ length: cols }).fill(0)
      );
    }
    /**
     * ## 生成游戏初始化的 board 数据
     *
     * 根据当前难度（difficulty）在棋盘底部生成对应数量的垃圾行。
     *
     * | 难度   | 垃圾行数 |
     * | ------ | -------- |
     * | easy   | 0        |
     * | normal | 3        |
     * | hard   | 6        |
     * | expert | 9        |
     *
     * @returns {string[][]} 生成的棋盘数据
     */
    generateBoard() {
      const DIFFICULTY_GARBAGE_ROWS = {
        easy: 0,
        normal: 3,
        hard: 6,
        expert: 9
      };
      const { board, difficulty } = this.state;
      const cols = board[0].length;
      const garbageRows = DIFFICULTY_GARBAGE_ROWS[difficulty] || 0;
      place_garbage_on_board_default(board, garbageRows, cols);
      return board;
    }
    /**
     * ## 设置初始棋盘（深拷贝）
     *
     * 用于保存游戏开始时的棋盘状态，供回放使用。
     *
     * @param {string[][]} board - 游戏棋盘数据
     * @returns {void}
     */
    setBeginningBoard(board) {
      this.state.beginningBoard = structuredClone(board);
    }
    /**
     * ## 获取初始棋盘（深拷贝副本）
     *
     * @returns {string[][]} 初始棋盘数据的深拷贝
     */
    getBeginningBoard() {
      return structuredClone(this.state.beginningBoard);
    }
    /**
     * ## 获取当前控制者身份
     *
     * @returns {string} 控制者身份：`human` 或 `ai`
     */
    getController() {
      return this.state.controller;
    }
    /**
     * ## 设置当前控制者身份
     *
     * @param {string} controller - 控制者身份：`human` 或 `ai`
     * @returns {void}
     */
    setController(controller) {
      this.state.controller = controller;
    }
    /**
     * ## 设置游戏手柄连接状态
     *
     * @param {boolean} connected - 游戏手柄是否已连接
     * @returns {void}
     */
    setGamepadConnected(connected) {
      this.state.gamepadConnected = connected;
    }
    /**
     * ## 获取手柄连接状态
     *
     * @returns {boolean} 已连接返回 true，否则返回 false
     */
    isGamepadConnected() {
      return this.state.gamepadConnected;
    }
    /**
     * ## 获取游戏难度等级
     *
     * @returns {string} 难度等级：easy / normal / hard / expert
     */
    getDifficulty() {
      return this.state.difficulty;
    }
    /**
     * ## 设置游戏难度等级
     *
     * @param {string} [difficulty='easy'] - 难度等级（easy / normal / hard / expert）.
     *   Default is `'easy'`
     * @returns {void}
     */
    setDifficulty(difficulty = "easy") {
      this.state.difficulty = difficulty;
    }
    /**
     * ## 获取基准行数
     *
     * 基准行数用于计算等级提升：(baseLines + lines) / 10 + 1 = level
     *
     * @returns {number} 基准行数
     */
    getBaseLines() {
      return this.state.baseLines;
    }
    /**
     * ## 设置基准行数
     *
     * @param {number} lines - 基准行数值
     * @returns {void}
     */
    setBaseLines(lines) {
      this.state.baseLines = lines;
    }
    /**
     * ## 获取当前待消除的行号数组
     *
     * @returns {number[]} 待消除的行号
     */
    getClearLines() {
      return this.state.clearLines;
    }
    /**
     * ## 设置当前待消除的行号
     *
     * @param {number[]} lines - 消除行号数组
     * @returns {void}
     */
    setClearLines(lines) {
      this.state.clearLines = lines;
    }
    /**
     * ## 获取 HUD 数据
     *
     * 返回 UI 渲染所需的核心显示数据。
     *
     * @returns {{ source: string; lines: number; level: number }} HUD 数据
     */
    getHub() {
      const { source, lines, level } = this.state;
      return { source, lines, level };
    }
    /**
     * ## 设置 HUD 数据
     *
     * @param {object} hud - HUD 数据对象
     * @param {number} hud.score - 当前得分
     * @param {number} hud.lines - 当前消除行数
     * @param {number} hud.level - 当前等级
     * @returns {void}
     */
    setHud(hud) {
      const { score, lines, level } = hud;
      this.state.score = score;
      this.state.lines = lines;
      this.state.level = level;
    }
    /**
     * ## 获取当前分数
     *
     * @returns {number} 当前得分
     */
    getScore() {
      return this.state.score;
    }
    /**
     * ## 设置最高分
     *
     * @param {number} highScore - 历史最高分
     * @returns {void}
     */
    setHighScore(highScore) {
      this.state.highScore = highScore;
    }
    /**
     * ## 获取最高分
     *
     * @returns {number} 历史最高分
     */
    getHighScore() {
      return this.state.highScore;
    }
    /**
     * ## 获取当前等级
     *
     * @returns {number} 游戏等级
     */
    getLevel() {
      return this.state.level;
    }
    /**
     * ## 设置当前等级
     *
     * @param {number} level - 游戏等级值
     * @returns {void}
     */
    setLevel(level) {
      this.state.level = level;
    }
    /**
     * ## 获取游戏模式
     *
     * @returns {string} 当前模式：main-menu / difficulty / playing / paused /
     *   game-over / replay
     */
    getMode() {
      return this.state.mode;
    }
    /**
     * ## 设置游戏模式
     *
     * @param {string} mode - 游戏模式
     * @returns {void}
     */
    setMode(mode) {
      this.state.mode = mode;
    }
  };
  var game_store_default = GameStore;

  // lib/core/command/command-queue.js
  var CommandQueue = class extends core_default {
    /**
     * ## 构造函数
     *
     * 初始化空队列。
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Game - 游戏主实例
     */
    constructor(options) {
      super(options);
      this.queue = [];
    }
    /**
     * ## 入队一个 Command
     *
     * 将命令添加到队列末尾，等待后续 flush 时执行。
     *
     * @param {object} command - 要入队的命令实例
     * @returns {void}
     */
    enqueue(command) {
      this.queue.push(command);
    }
    /**
     * ## 执行并清空队列中的所有 Command
     *
     * 按入队顺序（FIFO）逐个执行命令，执行完毕后队列为空。 当前实现为一次性执行全部命令，不做时间分帧控制。
     *
     * @returns {void}
     */
    flush() {
      const { queue } = this;
      while (queue.length > 0) {
        const cmd = queue.shift();
        cmd.execute();
      }
    }
    /**
     * ## 清空队列
     *
     * 丢弃所有未执行的命令。通常在游戏重置或切换模式时调用。
     *
     * @returns {void}
     */
    clear() {
      this.queue.length = 0;
    }
    /**
     * ## 订阅命令队列事件
     *
     * 绑定 `command:queue:<uuid>:enqueue` 和 `command:queue:<uuid>:clear` 事件。
     *
     * @returns {void}
     */
    subscribe() {
      const { Game: Game2 } = this;
      const uuid = Game2.id;
      const events = CommandEvents(uuid);
      this.on(events.CLEAR, this._onClear);
      this.on(events.ENQUEUE, this._onEnqueue);
    }
    /**
     * ## 取消订阅命令队列事件
     *
     * @returns {void}
     */
    unsubscribe() {
      const { Game: Game2 } = this;
      const uuid = Game2.id;
      const events = CommandEvents(uuid);
      this.off(events.CLEAR, this._onClear);
      this.off(events.ENQUEUE, this._onEnqueue);
    }
    /**
     * ## 处理清空队列事件
     *
     * @private
     * @returns {void}
     */
    _onClear = () => {
      this.clear();
    };
    /**
     * ## 处理命令入队事件
     *
     * @private
     * @param {object} params - 事件参数
     * @param {object} params.cmd - 要入队的命令实例
     * @returns {void}
     */
    _onEnqueue = ({ cmd }) => {
      this.enqueue(cmd);
    };
  };
  var command_queue_default = CommandQueue;

  // lib/runtime/animation-system.js
  var AnimationSystem = class extends core_default {
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
      if (!animation || typeof animation.render !== "function") {
        throw new Error("Invalid animation: must implement render()");
      }
      animation.layer ??= 0;
      animation.blocking ??= false;
      animation.name ??= "anonymous";
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
        if (typeof anim.dispose === "function") {
          anim.dispose();
        }
      }
      for (const anim of this.#pending) {
        if (typeof anim.dispose === "function") {
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
      const { Game: Game2 } = this;
      const events = AnimationsEvents(Game2.id);
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
      const { Game: Game2 } = this;
      const events = AnimationsEvents(Game2.id);
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
          if (typeof anim.dispose === "function") {
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
  };
  var animation_system_default = AnimationSystem;

  // lib/services/ui/core/canvas.js
  var Canvas = class {
    /**
     * ## 构造函数
     *
     * 通过 DOM ID 获取 Canvas 元素并初始化渲染上下文。
     *
     * @param {object} options - 配置选项
     * @param {string} options.board - 主棋盘 Canvas 的 DOM ID
     * @param {string} options.next - 预览方块 Canvas 的 DOM ID
     * @param {number} options.cols - 棋盘列数
     * @param {number} options.rows - 棋盘行数
     */
    constructor(options) {
      this.initialize(options);
    }
    initialize(options) {
      const { board, next, cols, rows } = options;
      this.rows = rows;
      this.cols = cols;
      this.gameBoard = document.querySelector(`#${board}`);
      this.gameBoardContext = this.gameBoard.getContext("2d");
      this.nextPiece = document.querySelector(`#${next}`);
      this.nextPieceContext = this.nextPiece.getContext("2d");
      this.fontSize = 0;
      this.blockSize = 0;
    }
  };
  var canvas_default = Canvas;

  // lib/utils/pad-start.js
  var padStart = (n, len) => {
    const num = Number(n);
    if (!Number.isFinite(num)) {
      return "";
    }
    const targetLen = Math.max(0, Math.floor(len));
    const sign = num < 0 ? "-" : "";
    const absStr = Math.abs(num).toString();
    return sign + absStr.padStart(targetLen, "0");
  };
  var pad_start_default = padStart;

  // lib/services/ui/hud/hud-elements.js
  var HudElements = (options) => {
    const { controller, score, lines, level, highScore } = options;
    return {
      /** @type {HTMLElement | null} 分数显示元素 */
      controller: document.querySelector(`#${controller}`),
      /** @type {HTMLElement | null} 分数显示元素 */
      score: document.querySelector(`#${score}`),
      /** @type {HTMLElement | null} 行数显示元素 */
      lines: document.querySelector(`#${lines}`),
      /** @type {HTMLElement | null} 等级显示元素 */
      level: document.querySelector(`#${level}`),
      /** @type {HTMLElement | null} 最高分显示元素 */
      highScore: document.querySelector(`#${highScore}`)
    };
  };
  var hud_elements_default = HudElements;

  // lib/services/ui/hud/hud-manager.js
  var setText = (el, value, pad = 0) => el.textContent = pad ? pad_start_default(value, pad) : String(value);
  var animationScore = (tracker, element, padding) => {
    if (tracker.visual === tracker.target) {
      return;
    }
    const diff = tracker.target - tracker.visual;
    const step = Math.ceil(Math.abs(diff) * 0.1);
    if (diff > 0) {
      tracker.visual += step;
      if (tracker.visual > tracker.target) {
        tracker.visual = tracker.target;
      }
    } else {
      tracker.visual -= step;
      if (tracker.visual < tracker.target) {
        tracker.visual = tracker.target;
      }
    }
    setText(element, tracker.visual, padding);
  };
  var HudManager = class {
    /**
     * ## 创建 HUD 实例
     *
     * @param {object} options - HUD 各 DOM 元素的配置信息
     * @param {string} options.score - 分数显示元素名称
     * @param {string} options.highScore - 最高分显示元素名称
     * @param {string} options.lines - 消除行数显示元素名称
     * @param {string} options.level - 等级显示元素名称
     * @param {string} options.controller - 控制者标识显示元素名称
     */
    constructor(options) {
      this.elements = hud_elements_default(options);
      this.scoreTracker = { visual: 0, target: 0 };
      this.highScoreTracker = { visual: 0, target: 0 };
      this.prev = { lines: -1, level: -1 };
    }
    /**
     * ## 更新 HUD 目标值
     *
     * 分数和最高分只更新 target（由 `tick()` 驱动动画）， 行数和等级立即更新 DOM。
     *
     * @param {object} state - 游戏状态
     * @param {number} state.score - 当前分数
     * @param {number} state.highScore - 最高分
     * @param {number} state.lines - 消除行数
     * @param {number} state.level - 当前等级
     * @returns {void}
     */
    update(state) {
      const { elements, scoreTracker, highScoreTracker, prev } = this;
      scoreTracker.target = Number(state.score) || 0;
      highScoreTracker.target = Number(state.highScore) || 0;
      if (state.lines !== prev.lines) {
        setText(elements.lines, state.lines, 2);
        prev.lines = state.lines;
      }
      if (state.level !== prev.level) {
        setText(elements.level, state.level, 2);
        prev.level = state.level;
      }
    }
    /**
     * ## 更新控制者标识
     *
     * @param {string} controller - 控制者身份（'human' 或 'ai'），会转为大写显示
     * @returns {void}
     */
    updateController(controller) {
      setText(this.elements.controller, controller.toUpperCase());
    }
    /**
     * ## 每帧驱动动画
     *
     * 在游戏主循环中调用，更新分数和最高分的平滑动画。
     *
     * @returns {void}
     */
    tick() {
      const { elements, scoreTracker, highScoreTracker } = this;
      animationScore(scoreTracker, elements.score, 5);
      animationScore(highScoreTracker, elements.highScore, 5);
    }
    /**
     * ## 重置 HUD 为初始状态
     *
     * 清空所有追踪器和 DOM 显示，通常在返回主菜单或游戏重置时调用。
     *
     * @returns {void}
     */
    reset() {
      const { elements, scoreTracker, highScoreTracker, prev } = this;
      scoreTracker.visual = 0;
      scoreTracker.target = 0;
      highScoreTracker.visual = 0;
      highScoreTracker.target = 0;
      prev.lines = -1;
      prev.level = -1;
      setText(elements.score, 0, 5);
      setText(elements.highScore, 0, 5);
      setText(elements.lines, 0, 2);
      setText(elements.level, 1, 2);
    }
  };
  var hud_manager_default = HudManager;

  // lib/services/ui/board/clear-board.js
  function clearBoard(canvas) {
    const { gameBoard, gameBoardContext } = canvas;
    const { width, height } = gameBoard;
    gameBoardContext.clearRect(0, 0, width, height);
  }
  var clear_board_default = clearBoard;

  // lib/services/ui/text/render-text.js
  var renderText = (canvas, options) => {
    const {
      text,
      x,
      y,
      color,
      strokeColor,
      size = 1,
      center = true,
      baseline = "alphabetic",
      stroke = false,
      lineWidth = 2,
      alpha = 1
    } = options;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const { gameBoardContext: ctx, fontSize } = canvas;
    ctx.save();
    if (alpha < 1) {
      ctx.globalAlpha = alpha;
    }
    if (center) {
      ctx.textAlign = "center";
    }
    ctx.textBaseline = baseline;
    ctx.font = `${fontSize * size}px ${FONT_FAMILY2}`;
    if (stroke) {
      ctx.strokeStyle = strokeColor || color;
      ctx.lineWidth = lineWidth;
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    if (alpha < 1) {
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };
  var render_text_default = renderText;

  // lib/services/ui/text/render-tetris-text.js
  var renderTetrisText = (canvas) => {
    const { GREEN: GREEN5 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "TETRIS.JS",
      x: width / 2,
      y: height * 0.1,
      color: GREEN5,
      size: 1.1
    });
  };
  var render_tetris_text_default = renderTetrisText;

  // lib/services/ui/text/render-level-text.js
  var renderLevelText = (canvas) => {
    const { GREEN: GREEN5 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "LEVEL",
      x: width / 2,
      y: height * 0.35,
      color: GREEN5,
      size: 1,
      center: true
    });
  };
  var render_level_text_default = renderLevelText;

  // lib/services/ui/text/render-level-number.js
  var renderLevelNumber = (canvas, level, y) => {
    const { GREEN: GREEN5 } = colors_default;
    const { gameBoard } = canvas;
    const { width } = gameBoard;
    render_text_default(canvas, {
      text: String(level),
      x: width / 2,
      y,
      color: GREEN5,
      size: 3,
      center: true
    });
  };
  var render_level_number_default = renderLevelNumber;

  // lib/services/ui/text/render-level-shortcut.js
  var renderLevelShortcut = (canvas) => {
    const { WHITE: WHITE3 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "1-9 or T KEY",
      x: width / 2,
      y: height * 0.58,
      color: WHITE3,
      size: 1,
      center: true
    });
  };
  var render_level_shortcut_default = renderLevelShortcut;

  // lib/services/ui/text/render-enter-continue-text.js
  var renderEnterContinueText = (canvas) => {
    const { TEAL: TEAL5, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "ENTER CONTINUE",
      x: width / 2,
      y: height * 0.74,
      color: TEAL5,
      strokeColor: BLACK2,
      size: 1,
      center: true,
      stroke: true
    });
  };
  var render_enter_continue_text_default = renderEnterContinueText;

  // lib/services/ui/overlay/render-overlay.js
  var renderOverlay = (canvas, color) => {
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const { gameBoard, gameBoardContext: ctx } = canvas;
    const { width, height } = gameBoard;
    ctx.save();
    ctx.fillStyle = color || RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };
  var render_overlay_default = renderOverlay;

  // lib/services/ui/constants/scenes-background.js
  var { RGBA_WHITE: RGBA_WHITE2 } = colors_default;
  var ScenesBackground = {
    /** 主菜单 / 倒计时：彩色 "TETRIS" 字样 */
    tetris: `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 512 512"><path d="M16.568 367.165h68.409v68.409H16.568z" style="fill:#f9d84e"/><path d="M16.568 418.472h68.409v17.102H16.568z" style="fill:#ffc20d"/><path d="M16.568 367.165H33.67v68.409H16.568z" style="fill:#ffc20d"/><path d="M84.977 367.165h68.409v68.409H84.977z" style="fill:#f9d84e"/><path d="M84.977 418.472h68.409v17.102H84.977z" style="fill:#ffc20d"/><path d="M84.977 367.165h17.102v68.409H84.977z" style="fill:#ffc20d"/><path d="M84.977 298.756h68.409v68.409H84.977z" style="fill:#f9d84e"/><path d="M84.977 350.063h68.409v17.102H84.977z" style="fill:#ffc20d"/><path d="M84.977 298.756h17.102v68.409H84.977z" style="fill:#ffc20d"/><path d="M16.568 298.756h68.409v68.409H16.568z" style="fill:#f9d84e"/><path d="M16.568 350.063h68.409v17.102H16.568z" style="fill:#ffc20d"/><path d="M16.568 298.756H33.67v68.409H16.568z" style="fill:#ffc20d"/><path d="M16.568 435.574h68.409v68.409H16.568z" style="fill:#b169bf"/><path d="M16.568 435.574H33.67v68.409H16.568z" style="fill:#844a8f"/><path d="M16.568 486.881h68.409v17.102H16.568z" style="fill:#844a8f"/><path d="M16.568 486.881H33.67v17.102H16.568z" style="fill:#844a8f"/><path d="M84.977 435.574h68.409v68.409H84.977z" style="fill:#b169bf"/><path d="M84.977 435.574h17.102v68.409H84.977z" style="fill:#844a8f"/><path d="M84.977 486.881h68.409v17.102H84.977z" style="fill:#844a8f"/><path d="M84.977 486.881h17.102v17.102H84.977z" style="fill:#844a8f"/><path d="M153.386 435.574h68.409v68.409h-68.409z" style="fill:#b169bf"/><path d="M153.386 435.574h17.102v68.409h-17.102z" style="fill:#844a8f"/><path d="M153.386 486.881h68.409v17.102h-68.409z" style="fill:#844a8f"/><path d="M153.386 486.881h17.102v17.102h-17.102z" style="fill:#844a8f"/><path d="M221.795 435.574h68.409v68.409h-68.409z" style="fill:#b169bf"/><path d="M221.795 435.574h17.102v68.409h-17.102z" style="fill:#844a8f"/><path d="M221.795 486.881h68.409v17.102h-68.409z" style="fill:#844a8f"/><path d="M221.795 486.881h17.102v17.102h-17.102z" style="fill:#844a8f"/><path d="M221.795 367.165h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M221.795 418.472h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M221.795 367.165h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M290.205 367.165h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M290.205 418.472h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M290.205 367.165h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M290.205 435.574h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M290.205 486.881h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M290.205 435.574h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M358.614 435.574h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M358.614 486.881h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M358.614 435.574h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M256 8.017h68.409v68.409H256z" style="fill:#fd5e95"/><path d="M256 59.324h68.409v17.102H256z" style="fill:#d14d7b"/><path d="M256 8.017h17.102v68.409H256z" style="fill:#d14d7b"/><path d="M324.409 8.017h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M324.409 59.324h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M324.409 8.017h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M324.409 76.426h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M324.409 127.733h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M324.409 76.426h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M392.818 76.426h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M392.818 127.733h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M392.818 76.426h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M358.614 367.165h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M358.614 418.472h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M358.614 367.165h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M427.023 367.165h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M427.023 418.472h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M427.023 367.165h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M427.023 435.574h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M427.023 486.881h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M427.023 435.574h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M358.614 298.756h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M358.614 350.063h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M358.614 298.756h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M153.386 127.733h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M153.386 179.04h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M153.386 127.733h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M153.386 196.142h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M153.386 247.449h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M153.386 196.142h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M221.795 196.142h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M221.795 247.449h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M221.795 196.142h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M153.386 264.551h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M153.386 315.858h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M153.386 264.551h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M256 84.443h60.392v60.392a8.016 8.016 0 0 0 8.017 8.017h136.818a8.016 8.016 0 0 0 8.017-8.017V76.426a8.016 8.016 0 0 0-8.017-8.017h-60.392V8.017A8.016 8.016 0 0 0 392.818 0H256a8.017 8.017 0 0 0-8.017 8.017v68.409A8.017 8.017 0 0 0 256 84.443m76.426 0h52.376v52.376h-52.376zm120.785 52.375h-52.376V84.443h52.376zm-68.409-68.409h-52.376V16.033h52.376zM264.017 16.033h52.376v52.376h-52.376zM495.432 359.148H435.04v-60.392a8.016 8.016 0 0 0-8.017-8.017h-68.409a8.016 8.016 0 0 0-8.017 8.017v60.392h-9.086a8.016 8.016 0 0 0-8.017 8.017 8.016 8.016 0 0 0 8.017 8.017h9.086v52.376h-52.376v-52.376h9.086a8.016 8.016 0 0 0 8.017-8.017 8.016 8.016 0 0 0-8.017-8.017h-85.511a8.017 8.017 0 0 0-8.017 8.017v60.392h-52.376v-86.58h60.392a8.017 8.017 0 0 0 8.017-8.017v-60.392h60.392a8.016 8.016 0 0 0 8.017-8.017v-68.409a8.016 8.016 0 0 0-8.017-8.017h-60.392v-60.392a8.017 8.017 0 0 0-8.017-8.017h-68.409a8.017 8.017 0 0 0-8.017 8.017v17.102a8.017 8.017 0 0 0 8.017 8.017 8.017 8.017 0 0 0 8.017-8.017v-9.086h52.376v52.376h-52.376v-9.086a8.017 8.017 0 0 0-8.017-8.017 8.017 8.017 0 0 0-8.017 8.017v111.699H67.875c-4.427 0-8.017 3.588-8.017 8.017s3.589 8.017 8.017 8.017h9.086v52.376H24.585v-52.376h9.086c4.427 0 8.017-3.588 8.017-8.017s-3.589-8.017-8.017-8.017H16.568a8.017 8.017 0 0 0-8.017 8.017v205.228A8.017 8.017 0 0 0 16.568 512h478.864a8.016 8.016 0 0 0 8.017-8.017V367.165a8.016 8.016 0 0 0-8.017-8.017m-8.017 68.409H435.04v-52.376h52.376zM366.63 375.182h52.376v52.376H366.63zm0-68.41h52.376v52.376H366.63zm-136.818 68.41h52.376v52.376h-52.376zm-136.818 0h52.376v52.376H92.994zm120.785-50.238h-52.376v-52.376h52.376zm68.409-68.41h-52.376v-52.376h52.376zm-68.409-52.375v52.376h-52.376v-52.376zM145.37 359.148H92.994v-52.376h52.376zm-68.41 16.034v52.376H24.585v-52.376zm-52.375 68.409H76.96v52.376H24.585zm68.409 0h52.376v52.376H92.994zm68.409 0h52.376v52.376h-52.376zm68.409 0h52.376v52.376h-52.376zm68.409 0h52.376v52.376h-52.376zm68.409 0h52.376v52.376H366.63zm120.785 52.376H435.04v-52.376h52.376z"/></svg>`,
    /** 倒计时场景：游戏手柄图标 */
    gamepad: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 48 48"><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M19 30v3a7 7 0 0 1-7 7v0a7 7 0 0 1-7-7V19M29 30v3a7 7 0 0 0 7 7v0a7 7 0 0 0 7-7V19"/><rect width="38" height="22" x="5" y="8" fill="#2f88ff" stroke="#000" stroke-width="4" rx="11"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M21 19h-8M17 15v8"/><rect width="4" height="4" x="32" y="15" fill="#fff" rx="2"/><rect width="4" height="4" x="28" y="20" fill="#fff" rx="2"/></svg>`,
    /** Playing 场景（14-24h）：塔楼剪影 */
    tower: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="800" height="800" viewBox="0 0 512 512"><path d="M341.512 495.967h-11.975l-33.221-71.978c6.644-8.584 10.613-19.341 10.613-31.012 0-18.862-10.346-35.341-25.653-44.095v-134.14c15.308-8.754 25.653-25.234 25.653-44.095 0-25.268-18.556-46.278-42.756-50.133v-11.736c9.93-3.354 17.102-12.752 17.102-23.8s-7.172-20.446-17.102-23.8V8.017a8.017 8.017 0 0 0-16.034 0v53.16c-9.93 3.354-17.102 12.752-17.102 23.8s7.172 20.446 17.102 23.8v11.736c-24.2 3.855-42.756 24.866-42.756 50.133 0 18.862 10.346 35.341 25.653 44.095V348.88c-15.308 8.754-25.653 25.234-25.653 44.095 0 11.555 3.888 22.215 10.414 30.757l-33.337 72.234h-11.975a8.017 8.017 0 0 0-8.017 8.017 8.017 8.017 0 0 0 8.017 8.017h171.026a8.017 8.017 0 0 0 8.017-8.017 8.014 8.014 0 0 0-8.016-8.016m-94.44-410.99c0-5.01 4.076-9.086 9.086-9.086s9.086 4.076 9.086 9.086-4.076 9.086-9.086 9.086-9.086-4.076-9.086-9.086m-24.485 94.597a34.7 34.7 0 0 1-1.168-8.927c0-19.155 15.584-34.739 34.739-34.739s34.739 15.584 34.739 34.739a34.6 34.6 0 0 1-1.168 8.927zm24.485 128.267V289.67h18.171v18.171zm18.171 16.034v19.16a51 51 0 0 0-9.086-.831 51 51 0 0 0-9.086.831v-19.16zm-18.171-50.238v-18.171h18.171v18.171zm0-34.205v-18.844a51 51 0 0 0 9.086.831 51 51 0 0 0 9.086-.831v18.844zm9.085-34.046c-9.366 0-17.87-3.732-24.124-9.778h48.249c-6.255 6.046-14.76 9.778-24.125 9.778m.001 152.852c16.412 0 30.192 11.444 33.806 26.767h-67.611c3.613-15.324 17.393-26.767 33.805-26.767m-25.12 137.729h-30.919l28.008-60.684c.947.63 1.921 1.223 2.911 1.789zm34.205 0h-18.171v-18.171h18.171zm0-34.205h-18.171v-18.844a51 51 0 0 0 9.086.831 51 51 0 0 0 9.086-.831v18.844zm-9.085-34.046c-16.524 0-30.381-11.601-33.879-27.084h67.757c-3.497 15.483-17.354 27.084-33.878 27.084m25.119 68.251v-58.895a50 50 0 0 0 2.667-1.633l27.936 60.528z"/></svg>`,
    /** Playing 场景（0-8h）：宝塔剪影 */
    pagoda: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 286.154 286.154"><path d="M230.769 258.462h-23.077V230.77h9.231c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.269-8.788 4.602-8.82 4.638-.323-.069-8.548-2.091-24.263-25.662l-1.371-2.054H180V180h13.846c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.302-8.917 4.606-8.917 4.629-.226-.037-7.818-1.491-19.431-20.852l-1.348-2.238h-2.612v-9.231h23.077c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.302-8.917 4.606-8.917 4.629-.226-.037-7.818-1.491-19.431-20.852l-1.348-2.238h-2.612v-9.231h23.077c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.302-8.917 4.606-8.917 4.629-.226-.037-7.818-1.491-19.431-20.852l-1.348-2.238h-2.612v-9.231h18.461c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 3.475-5.82 4.338-8.215 4.551-5.035-2.695-27-15.115-42.554-33.923V0h-9.231v12.166c-15.554 18.808-37.514 31.223-42.549 33.923-2.409-.212-8.22-1.08-8.22-4.551h-9.231c0 10.952 12.078 13.846 18.462 13.846h18.461v9.231h-2.612l-1.343 2.238c-11.667 19.445-19.274 20.83-19.107 20.839-.226-.005-9.245-.286-9.245-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h23.077v9.231h-2.612l-1.343 2.238c-11.668 19.445-19.274 20.829-19.108 20.838-.226-.005-9.245-.286-9.245-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h23.077v9.231h-2.612l-1.343 2.238c-11.668 19.445-19.274 20.829-19.108 20.838-.226-.005-9.245-.286-9.245-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h13.846v13.846h-11.7l-1.371 2.054c-15.812 23.718-24.042 25.615-23.848 25.638-.305-.009-9.235-.309-9.235-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h9.231v27.692H55.385v18.462H4.615v9.231h258.462v-9.231h-32.308zm-43.989-55.386c5.806 8.498 10.763 14.364 14.912 18.462h-23.455l-9.231-18.462zm11.682 27.694v27.692h-23.077V230.77zm-80.225-9.231 9.231-18.462h31.218l9.231 18.462zm47.917 9.23v27.692H120v-27.692zm-18.461-36.923v-9.231h-9.231v9.231h-23.077V180h55.385v13.846zm-34.03-147.692c8.686-5.792 19.809-14.303 29.414-25.145 9.605 10.842 20.728 19.352 29.414 25.145zM138.461 60v4.615h-13.846v-9.23h36.923v9.231h-13.846V60zm-30.983 27.692c3.153-3.304 6.67-7.749 10.491-13.846h50.215c3.822 6.097 7.338 10.542 10.486 13.846zm30.983 13.847v4.615h-13.846v-9.231h36.923v9.231h-13.846v-4.615zm-30.983 27.692c3.153-3.305 6.67-7.749 10.491-13.846h50.215c3.822 6.097 7.338 10.542 10.486 13.846zm30.983 13.847v4.615h-13.846v-9.231h36.923v9.231h-13.846v-4.615zm-20.492 13.845h50.215c3.822 6.097 7.338 10.542 10.486 13.846h-71.192c3.153-3.304 6.67-7.749 10.491-13.846m-18.595 46.154h17.774l-9.231 18.462H84.462c4.149-4.099 9.106-9.965 14.912-18.462m11.395 27.692v27.692H87.692v-27.692zm110.769 46.154H64.615v-9.231h156.923z"/><path d="M129.231 240h9.231v9.231h-9.231zM92.308 240h9.231v9.231h-9.231zM184.615 240h9.231v9.231h-9.231zM147.692 240h9.231v9.231h-9.231zM272.308 276.923h9.231v9.231h-9.231z"/></svg>`,
    /** Playing 场景（8-14h）：寺庙剪影 */
    temple: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 286.154 286.154"><path d="M263.077 258.462V240h-27.692v-55.385h23.077l1.265-9.051c-.305-.092-30.388-8.885-56.649-30.097v-11.622h46.154l1.117-9.092c-.351-.088-34.735-8.894-61.117-30.069V83.077h18.462l1.874-8.834c-.388-.175-37.68-17.026-56.022-41.751l7.288-11.575.471-.997c.258-.762 2.363-7.606-1.805-13.38C156.443 2.294 151.085 0 143.589 0h-.512c-7.495.097-12.849 2.294-15.905 6.54-4.163 5.774-2.058 12.618-1.805 13.38l7.532 12.175c-18.235 24.942-55.925 41.972-56.317 42.148l1.878 8.834h18.462v11.608c-26.331 21.129-60.771 29.982-61.122 30.069l1.122 9.092h46.154v11.622c-26.202 21.162-56.345 30.009-56.654 30.097l1.269 9.051h23.077V240H23.077v18.462H0v27.692h286.154v-27.692zM134.658 11.94c1.237-1.712 4.311-2.672 8.677-2.709 4.334.037 7.403.983 8.649 2.677 1.145 1.546.84 3.798.655 4.703l-6.983 11.082h-4.643l-6.983-11.095c-.193-.896-.488-3.103.628-4.658m6.222 24.983h4.389c11.598 16.205 30.143 29.022 43.671 36.923H97.214c13.523-7.901 32.072-20.718 43.666-36.923M180 83.077v9.231h-73.846v-9.231zM63.974 124.615c12.009-5.155 26.409-12.692 39.217-23.077h79.768c12.808 10.385 27.212 17.922 39.217 23.077zm129.872 9.231v9.231h-27.692v-9.231zm-36.923 0v9.231h-32.308v-9.231zm-41.538 0v9.231H92.308v-9.231zm-26.04 18.462h107.46c12.748 10.385 26.225 17.922 37.209 23.077H52.14c10.985-5.156 24.462-12.693 37.205-23.077m127.578 41.538v-9.231h9.231v9.231zm9.231 9.231V240h-9.231v-36.923zm-32.308 9.231V240h-4.615v-36.923h18.462V240h-4.616v-27.692zm-4.615-18.462v-9.231h18.462v9.231zm-18.462 0v-9.231H180v9.231zm9.231 9.231V240h-9.231v-36.923zm-64.615 0V240h-9.231v-36.923zm-9.231-9.231v-9.231h9.231v9.231zm9.23 55.385h55.385v9.231h-55.385zm13.847-36.923V240h-4.615v-36.923h36.923V240h-4.615v-27.692zm18.461 9.23V240h-9.231v-18.462zm13.846-27.692h-36.923v-9.231h36.923zm-78.461 18.462V240h-4.615v-36.923h18.462V240h-4.615v-27.692zm-4.615-18.462v-9.231h18.461v9.231zm-18.462 0v-9.231h9.231v9.231zm9.231 9.231V240H60v-36.923zm-36.923 46.154h73.847v9.231H32.308zm64.615 27.692H9.231v-9.231h87.692zm83.077 0h-73.846v-9.231H180zm0-27.692h73.846v9.231H180zm96.923 27.692h-87.692v-9.231h87.692z"/><path d="M96.923 110.769h9.231V120h-9.231zM115.385 110.769h9.231V120h-9.231zM133.846 110.769h9.231V120h-9.231zM189.231 161.538h9.231v9.231h-9.231zM124.615 60h9.231v9.231h-9.231z"/></svg>`,
    /** 暂停场景：咖啡杯图标 */
    coffee: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="800" height="800" viewBox="0 0 32 32"><path d="M24.6 25h.9c2.5 0 4.5-2 4.5-4.5 0-2.3-1.8-4.2-4-4.4V15c0-.6-.4-1-1-1H7c-.6 0-1 .4-1 1v5c0 3.3 1.6 6.2 4 8H5c-.6 0-1 .4-1 1s.4 1 1 1h22c.6 0 1-.4 1-1s-.4-1-1-1h-5c1.1-.8 2-1.8 2.6-3m3.4-4.5c0 1.4-1.1 2.5-2.5 2.5.3-.9.5-2 .5-3v-1.9c1.1.2 2 1.2 2 2.4M24 16v2.4c-1.1.5-4.1 1.4-7.6-.3s-6.6-.8-8.4.1V16zM8 20.5c1-.7 4-2.3 7.5-.6 1.8.9 3.5 1.1 5 1.1 1.4 0 2.6-.3 3.5-.5-.1 1-.3 2-.7 2.8-.1.1-.2.3-.2.4-1.4 2.5-4 4.2-7 4.2-4.3.1-7.8-3.2-8.1-7.4m3-9.5h3c.3 0 .5.2.5.5v.5c0 .6.4 1 1 1s1-.4 1-1v-.5c0-1.4-1.1-2.5-2.5-2.5h-3c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h9.5c1.7 0 3-1.3 3-3s-1.3-3-3-3h-10c-.6 0-1 .4-1 1s.4 1 1 1h10c.6 0 1 .4 1 1s-.4 1-1 1H11C9.6 6 8.5 7.1 8.5 8.5S9.6 11 11 11"/></svg>`,
    /** 游戏结束场景：笑脸表情 */
    happy: `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="800" height="800" viewBox="0 0 512.003 512.003"><circle cx="256.001" cy="256.001" r="256.001" style="fill:#fddf6d"/><path d="M310.859 474.208c-141.385 0-256-114.615-256-256 0-75.537 32.722-143.422 84.757-190.281C56.738 70.303 0 156.525 0 256c0 141.385 114.615 256 256 256 65.849 0 125.883-24.87 171.243-65.718-34.918 17.853-74.473 27.926-116.384 27.926" style="fill:#fcc56b"/><path d="M245.899 187.172c-5.752 0-10.414-4.663-10.414-10.414 0-13.433-10.928-24.362-24.362-24.362s-24.362 10.93-24.362 24.362c0 5.752-4.663 10.414-10.414 10.414-5.752 0-10.414-4.663-10.414-10.414 0-24.918 20.273-45.19 45.19-45.19s45.19 20.272 45.19 45.19c.001 5.751-4.662 10.414-10.414 10.414M421.798 187.172c-5.752 0-10.414-4.663-10.414-10.414 0-13.433-10.928-24.362-24.362-24.362s-24.362 10.93-24.362 24.362c0 5.752-4.663 10.414-10.414 10.414s-10.414-4.663-10.414-10.414c0-24.918 20.273-45.19 45.19-45.19s45.19 20.272 45.19 45.19c.001 5.751-4.662 10.414-10.414 10.414" style="fill:#7f184c"/><path d="M293.248 443.08c-74.004 0-133.995-59.991-133.995-133.995h267.991c-.001 74.003-59.993 133.995-133.996 133.995" style="fill:#fff"/><path d="M172.426 367.092a134 134 0 0 0 12.472 20.829h216.699a134 134 0 0 0 12.472-20.829z" style="fill:#e6e6e6"/><path d="M145.987 240.152c-19.011 0-34.423 15.412-34.423 34.423h68.848c-.002-19.011-15.414-34.423-34.425-34.423M446.251 240.152c-19.011 0-34.423 15.412-34.423 34.423h68.848c0-19.011-15.412-34.423-34.425-34.423" style="fill:#f9a880"/><ellipse cx="292.913" cy="73.351" rx="29.854" ry="53.46" style="fill:#fceb88" transform="rotate(-74.199 292.913 73.351)"/></svg>`
  };
  var scenes_background_default = ScenesBackground;

  // lib/services/ui/image/image-manager.js
  var ImagesCache = /* @__PURE__ */ new Map();
  var toDataURI = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  var getImage = (svg) => {
    const cached = ImagesCache.get(svg);
    if (cached) {
      return cached;
    }
    const img = new Image();
    img.src = toDataURI(svg);
    ImagesCache.set(svg, img);
    return img;
  };
  var clearImagesCache = () => {
    ImagesCache.clear();
  };
  var preloadImages = (images) => {
    const svgs = Object.values(images);
    clearImagesCache();
    for (const svg of svgs) {
      getImage(svg);
    }
  };

  // lib/services/ui/image/render-image.js
  var renderImage = (canvas, options) => {
    const { gameBoardContext: ctx } = canvas;
    const { img, x, y, size } = options;
    if (!img.complete) {
      return;
    }
    ctx.save();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  };
  var render_image_default = renderImage;

  // lib/services/ui/image/render-scene-background.js
  var renderSceneBackground = (canvas, scene) => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const hours = (/* @__PURE__ */ new Date()).getHours();
    let icon;
    let img;
    let size;
    let x;
    let y;
    switch (scene) {
      /** 主菜单 / 倒计时场景：使用 Tetris 图标 */
      case "main-menu":
      case "countdown": {
        img = getImage(scenes_background_default.tetris);
        size = width;
        x = width / 2 - size / 2;
        y = height - size;
        break;
      }
      /** 游戏进行中场景：根据时间切换主题背景 */
      case "playing": {
        if (hours >= 0 && hours <= 8) {
          icon = "pagoda";
          size = width * 1.4;
        } else if (hours > 8 && hours <= 14) {
          icon = "temple";
          size = width * 1.1;
        } else {
          icon = "tower";
          size = width * 1.6;
        }
        img = getImage(scenes_background_default[icon]);
        x = width / 2 - size / 2;
        y = height - size;
        break;
      }
      /** 暂停场景：使用咖啡杯图标 */
      case "paused": {
        img = getImage(scenes_background_default.coffee);
        size = width * 0.76;
        x = width / 2 - size / 2;
        y = height - size * 0.94;
        break;
      }
      /** 游戏结束场景：使用笑脸图标 */
      case "game-over": {
        img = getImage(scenes_background_default.happy);
        size = Math.floor(width * 0.42);
        x = width / 2 - size / 2;
        y = height / 2 - size * 1.35;
        break;
      }
    }
    render_image_default(canvas, { img, x, y, size });
  };
  var render_scene_background_default = renderSceneBackground;

  // lib/services/ui/scenes/main-menu-scene/render-main-menu.js
  var renderMainMenu = (canvas, level) => {
    const { gameBoard } = canvas;
    const { height } = gameBoard;
    clear_board_default(canvas);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "main-menu");
    render_tetris_text_default(canvas);
    render_level_text_default(canvas);
    render_level_number_default(canvas, level, height * 0.5);
    render_level_shortcut_default(canvas);
    render_enter_continue_text_default(canvas);
  };
  var render_main_menu_default = renderMainMenu;

  // lib/services/ui/scenes/main-menu-scene/index.js
  var mainMenuScene = (canvas, state) => {
    render_main_menu_default(canvas, state.level);
  };
  var main_menu_scene_default = mainMenuScene;

  // lib/services/ui/text/render-difficulty-text.js
  var renderDifficultText = (canvas) => {
    const { GREEN: GREEN5 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "DIFFICULTY",
      x: width / 2,
      y: height * 0.35,
      color: GREEN5,
      size: 1,
      center: true
    });
  };
  var render_difficulty_text_default = renderDifficultText;

  // lib/services/ui/text/render-difficult-words.js
  var renderDifficultyWords = (canvas, difficulty, y) => {
    const { GREEN: GREEN5 } = colors_default;
    const { gameBoard } = canvas;
    const { width } = gameBoard;
    render_text_default(canvas, {
      text: difficulty.toUpperCase(),
      x: width / 2,
      y,
      color: GREEN5,
      size: 2.2,
      center: true
    });
  };
  var render_difficult_words_default = renderDifficultyWords;

  // lib/services/ui/text/render-difficulty-shortcut.js
  var renderDifficultyShortcut = (canvas, state) => {
    const { WHITE: WHITE3 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    let text = "E/N/H/X KEY";
    if (state.gamepadConnected) {
      text = "A/B/Y/X KEY";
    }
    render_text_default(canvas, {
      text,
      x: width / 2,
      y: height * 0.58,
      color: WHITE3,
      size: 1,
      center: true
    });
  };
  var render_difficulty_shortcut_default = renderDifficultyShortcut;

  // lib/services/ui/text/render-enter-start-text.js
  var renderEnterStartText = (canvas) => {
    const { TEAL: TEAL5, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "ENTER START",
      x: width / 2,
      y: height * 0.74,
      color: TEAL5,
      strokeColor: BLACK2,
      size: 1.15,
      center: true,
      stroke: true
    });
  };
  var render_enter_start_text_default = renderEnterStartText;

  // lib/services/ui/scenes/difficulty-scene/render-difficulty-scene.js
  var renderDifficultyScene = (canvas, state) => {
    const { gameBoard } = canvas;
    const { height } = gameBoard;
    clear_board_default(canvas);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "main-menu");
    render_tetris_text_default(canvas);
    render_difficulty_text_default(canvas);
    render_difficult_words_default(canvas, state.difficulty, height * 0.5);
    render_difficulty_shortcut_default(canvas, state);
    render_enter_start_text_default(canvas);
  };
  var render_difficulty_scene_default = renderDifficultyScene;

  // lib/services/ui/scenes/difficulty-scene/index.js
  var difficultyScene = (canvas, state) => {
    render_difficulty_scene_default(canvas, state);
  };
  var difficulty_scene_default = difficultyScene;

  // lib/services/ui/text/render-paused-text.js
  var renderPausedText = (canvas) => {
    const { YELLOW: YELLOW5, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "PAUSED",
      x: width / 2,
      y: height / 1.4,
      color: YELLOW5,
      strokeColor: BLACK2,
      size: 1.6,
      center: true,
      stroke: true
    });
  };
  var render_paused_text_default = renderPausedText;

  // lib/services/ui/effects/clock/constants/clock-themes.js
  var {
    CORAL: CORAL2,
    RGBA_CORAL: RGBA_CORAL2,
    WHITE: WHITE2,
    RGBA_WHITE: RGBA_WHITE3,
    PURPLE: PURPLE3,
    RGBA_PURPLE: RGBA_PURPLE2,
    TEAL: TEAL3,
    RGBA_TEAL: RGBA_TEAL2,
    PINK: PINK2,
    RGBA_PINK: RGBA_PINK2,
    ORANGE: ORANGE3,
    RGBA_ORANGE: RGBA_ORANGE2,
    GREEN: GREEN3,
    RGBA_GREEN: RGBA_GREEN2,
    BLUE: BLUE3,
    RGBA_BLUE: RGBA_BLUE2,
    YELLOW: YELLOW3,
    RGBA_YELLOW: RGBA_YELLOW2,
    RED: RED3,
    RGBA_RED: RGBA_RED2,
    VIOLET: VIOLET2,
    RGBA_VIOLET: RGBA_VIOLET2,
    CYAN: CYAN2,
    RGBA_CYAN: RGBA_CYAN2
  } = colors_default;
  var ClockThemes = {
    /** 戌时 (19-20) */
    Teal: { stroke: TEAL3, face: RGBA_TEAL2, secondHand: GREEN3 },
    /** 亥时 (21-22) */
    Violet: { stroke: VIOLET2, face: RGBA_VIOLET2, secondHand: TEAL3 },
    /** 申时 (15-16) */
    Yellow: { stroke: YELLOW3, face: RGBA_YELLOW2, secondHand: PINK2 },
    /** 酉时 (17-18) */
    Pink: { stroke: PINK2, face: RGBA_PINK2, secondHand: YELLOW3 },
    /** 午时 (11-12) */
    Purple: { stroke: PURPLE3, face: RGBA_PURPLE2, secondHand: GREEN3 },
    /** 未时 (13-14) */
    Green: { stroke: GREEN3, face: RGBA_GREEN2, secondHand: CYAN2 },
    /** 辰时 (7-8) */
    Blue: { stroke: BLUE3, face: RGBA_BLUE2, secondHand: CORAL2 },
    /** 巳时 (9-10) */
    Coral: { stroke: CORAL2, face: RGBA_CORAL2, secondHand: BLUE3 },
    /** 寅时 (3-4) */
    Orange: { stroke: ORANGE3, face: RGBA_ORANGE2, secondHand: CYAN2 },
    /** 卯时 (5-6) */
    Cyan: { stroke: CYAN2, face: RGBA_CYAN2, secondHand: ORANGE3 },
    /** 丑时 (1-2) */
    White: { stroke: WHITE2, face: RGBA_WHITE3, secondHand: RED3 },
    /** 子时 (23, 0) */
    Red: { stroke: RED3, face: RGBA_RED2, secondHand: WHITE2 }
  };
  var clock_themes_default = ClockThemes;

  // lib/utils/format-time.js
  var formatTime = (date, format = "yyyy-MM-dd HH:mm:ss") => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const toSymbol = () => hours >= 12 ? "PM" : "AM";
    const hasSymbol = format.includes("a");
    const hour12 = hours % 12 || 12;
    const symbols = {
      yyyy: year,
      MM: pad_start_default(month, 2),
      dd: pad_start_default(day, 2),
      HH: pad_start_default(hours, 2),
      hh: pad_start_default(hour12, 2),
      mm: pad_start_default(minutes, 2),
      ss: pad_start_default(seconds, 2),
      a: hasSymbol ? toSymbol() : ""
    };
    let time = format;
    for (const key of Object.keys(symbols)) {
      time = time.replaceAll(new RegExp(key, "g"), symbols[key]);
    }
    return time;
  };
  var format_time_default = formatTime;

  // lib/services/ui/effects/clock/utils/get-chinese-hour-dial-theme.js
  var getChineseHourDialTheme = (hour) => {
    const map = [
      "Red",
      "White",
      "White",
      "Orange",
      "Orange",
      "Cyan",
      "Cyan",
      "Blue",
      "Blue",
      "Coral",
      "Coral",
      "Purple",
      "Purple",
      "Green",
      "Green",
      "Yellow",
      "Yellow",
      "Pink",
      "Pink",
      "Teal",
      "Teal",
      "Violet",
      "Violet",
      "Red"
    ];
    return map[hour];
  };
  var get_chinese_hour_dial_theme_default = getChineseHourDialTheme;

  // lib/services/ui/effects/render-digital-clock.js
  var renderDigitalClock = (canvas, time, format = "HH:mm:ss") => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const targetTime = time || /* @__PURE__ */ new Date();
    const text = format_time_default(targetTime, format);
    const theme = clock_themes_default[get_chinese_hour_dial_theme_default(targetTime.getHours())];
    render_text_default(canvas, {
      text,
      x: width / 2,
      y: height / 4.15,
      color: theme?.secondHand || colors_default.GREEN,
      size: 0.94,
      center: true
    });
  };
  var render_digital_clock_default = renderDigitalClock;

  // lib/services/ui/effects/clock/utils/get-clock-angles.js
  var getClockAngles = (time) => {
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const hAng = (h % 12 + m / 60 + s / 3600) * (2 * Math.PI / 12);
    const mAng = (m + s / 60) * (2 * Math.PI / 60);
    const sAng = s * (2 * Math.PI / 60);
    return {
      hAng,
      mAng,
      sAng
    };
  };
  var get_clock_angles_default = getClockAngles;

  // lib/services/ui/constants/chinese-hour-animals.js
  var { RGBA_WHITE: RGBA_WHITE4 } = colors_default;
  var ChineseHourAnimals = {
    /** 子时 (23:00-01:00)：鼠 */
    rat: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="m210.432 1012.898-43.574-31.69C273.812 834.156 352.175 810.01 590.686 808.502c21.397-31.26 16.25-56.266 9.378-89.708-3.557-17.138-7.222-34.843-7.222-54.434 0-68.958 25.33-104.636 63.407-136.973l34.897 41.04c-29.453 25.062-44.41 46.781-44.41 95.933 0 14.094 2.938 28.403 6.064 43.547 5.901 28.51 12.8 62.033-1.132 99.463 166.373-10.24 264.543-96.903 264.543-236.194 0-152.845-88.63-247.808-231.29-247.808-83.644 0-153.303 29.696-174.188 39.613a225 225 0 0 1-20.533 31.34l-41.742-34.116 20.884 17.058-20.91-16.977c.35-.458 36.62-45.999 36.62-97.55 0-34.815-8.946-60.765-26.57-77.069-17.515-16.249-44.786-24.603-81.219-24.953v162.654h-53.895V109.784l24.873-1.914c64.7-4.931 114.095 7.896 146.863 38.239 29.103 26.947 43.843 66.182 43.843 116.628 0 11.102-1.131 21.908-3.072 32.202 37.269-12.584 89.843-25.465 149.046-25.465 173.245 0 285.184 118.433 285.184 301.702 0 140.747-92.618 291.14-352.552 291.14-258.668 0-311.943 19.698-407.121 150.582m19.106-256.836c-12.046 0-24.388-.566-37.026-1.643l-22.097-1.86-2.425-22.016c-.243-2.398-6.306-58.098-6.306-99.516 0-103.586 21.45-178.904 53.895-259.046V107.79h53.895v274.783l-2.021 4.904c-32.014 78.282-51.874 146.324-51.874 243.55 0 22.879 2.102 51.443 3.826 70.98 99.679 2.802 172.814-35.409 222.451-116.494l48.02 24.091c-11.237 28.133-11.372 51.578-.377 67.854 9.701 14.282 28.645 23.175 49.448 23.175v53.894c-39.02 0-74.186-17.515-94.073-46.888a100.2 100.2 0 0 1-12.423-25.546c-53.22 49.179-121.128 73.943-202.913 73.97m150.42-230.588c0-34.223-13.231-44.463-29.642-44.463s-29.642 10.24-29.642 44.463c0 34.25 13.23 44.463 29.642 44.463s29.642-10.213 29.642-44.463"/></svg>`,
    /** 丑时 (01:00-03:00)：牛 */
    ox: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 -0.5 1025 1025"><path d="M1025.347 635.58v280.63h-53.894v-71.033c-16.33-18.405-69.821-70.413-161.685-86.07v157.104h-53.894V754.526h-107.79v215.58H594.19V700.631h161.685c100.998 0 172.57 38.67 215.579 71.868V656.761c-33.685-43.628-51.712-137.458-53.706-279.498H701.979c-76.935 0-127.219-26.22-175.805-51.55a1556 1556 0 0 0-26.84-13.743c-26.839 26.004-66.209 44.92-115.738 55.511 24.441 22.986 60.874 52.116 106.469 72.839l-22.313 49.044c-76.584-34.816-129.59-88.926-150.824-113.125-10.644.62-21.477 1.024-32.687 1.024a473.7 473.7 0 0 1-123.365-15.953L67.853 547.624l68.582 53.868c31.447-21.935 101.456-62.545 188.28-62.545v53.895c-95.986 0-170.36 62.491-171.088 63.138l-16.788 14.282L0 562.904l109.73-219.81C46.43 314.449 1.347 267.372 1.347 199.869c0-110.053 120.24-145.974 161.685-145.974v53.894c-14.12 0-107.79 17.166-107.79 92.08 0 90.597 136.947 123.5 228.999 123.5 67.907 0 122.422-12.99 157.696-35.625-42.712-14.336-95.097-23.12-169.337-18.324l-3.504-53.787c95.88-6.117 160.149 8.515 211.43 28.834 3.718-9.028 5.874-18.648 5.874-28.888 0-48.856-57.83-76.288-58.395-76.558l22.393-49.017c3.665 1.644 89.897 41.823 89.897 125.575 0 18.567-3.423 35.84-9.998 51.631 7.06 3.584 13.986 7.168 20.777 10.698 46.78 24.415 87.174 45.46 150.905 45.46h269.474v26.948c0 214.69 35.22 266.59 45.999 277.37zm-729.384 25.143-98.79 118.541L283.972 917.1l45.595-28.726-65.913-104.69 37.053-44.437c57.937 45.945 138.374 69.174 239.589 69.174v-53.895c-99.894 0-175.077-24.549-223.475-72.946z"/></svg>`,
    /** 寅时 (03:00-05:00)：虎 */
    tiger: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M673.684 1024c-114.769 0-188.82-33.334-254.167-62.787-53.626-24.145-99.975-45.002-161.28-45.002-40.448 0-83.591 23.255-103.64 45.163l-39.747-36.433c27.648-30.154 84.318-62.625 143.387-62.625 68.392 0 119.862 21.288 172.92 45.056V673.684c0-35.166-17.542-64.108-30.638-80.815-15.199 9.836-32.068 18.89-50.742 26.947l-21.342-49.475C469.8 509.413 485.053 377.317 485.053 323.368V221.642a598 598 0 0 0-80.842-6.063h-26.948v-80.842c0-12.1-14.848-26.948-26.947-26.948-9.378 0-18.836.593-26.948 1.348v160.337h-53.894v-57.802c-136.03 102.912-158.45 266.886-161.307 295.882 9.135 9.108 38.993 25.06 71.976 38.67l38.104-59.366 12.45-1.59c90.516-11.614 146.566-93.076 146.566-161.9h53.895c0 88.334-68.797 192.243-180.87 213.343l-48.398 75.398-20.292-7.437C53.895 557.757 53.895 523.318 53.895 512c0-50.041 37.025-254.733 215.579-365.622V62.491l22.528-3.746c1.185-.188 29.48-4.85 58.314-4.85 41.553 0 80.842 39.289 80.842 80.842v27.513C679.855 172.813 1024 327.545 1024 646.737 1024 832.189 892.982 1024 673.684 1024m-13.473-323.368c-36.514 0-67.369 49.367-67.369 107.79 0 85.746 68.096 145.084 89.465 161.549 91.54-2.534 164.38-45.488 213.828-107.655H700.632V808.42H930.87c8.92-17.273 16.357-35.355 22.285-53.895H713.27l-6.467-17.65c-.512-1.294-14.363-36.244-46.592-36.244m-175.158 230.48c33.926 14.067 70.52 26.597 114.607 33.47-30.235-36.272-60.713-89.358-60.713-156.16 0-90.652 53.275-161.685 121.264-161.685 44.76 0 73.835 28.78 88.683 53.895h217.007c2.776-17.867 4.204-35.921 4.204-53.895 0-38.94-5.659-74.752-15.926-107.628L827.473 665.79l-38.104-38.104 142.633-142.632a368 368 0 0 0-57.775-81.597L719.683 557.999l-38.103-38.103 153.573-153.573a538 538 0 0 0-82.594-56.752L611.894 450.21l-38.104-38.104 128.135-128.135a794.7 794.7 0 0 0-162.978-52.924v92.321c0 50.15-11.102 156.7-95.932 236.329 18.378 23.417 42.038 63.407 42.038 113.987zM215.579 431.158v-53.895c39.774 0 53.895-29.022 53.895-53.895h53.894c0 53.572-37.025 107.79-107.79 107.79"/></svg>`,
    /** 卯时 (05:00-07:00)：兔 */
    rabbit: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M862.316 720.896c0 36.621-4.123 69.39-24.253 110.35l-68.365 138.86H485.053V916.21h48.37c-25.546-36.137-48.37-82.702-48.37-134.737 0-59.42 24.171-113.314 63.218-152.36l38.104 38.103a161.1 161.1 0 0 0-47.428 114.257c0 54.784 35.382 104.043 63.515 134.737h133.713l53.49-108.76c15.711-31.852 18.756-55.835 18.756-86.555 0-80.977-63.434-150.097-178.607-195.503-17.543 8.138-38.292 13.554-63.92 13.554h-80.841c-13.96 0-43.925 15.98-57.29 40.017l-47.104-26.166c20.749-37.349 67.584-67.745 104.394-67.745h80.842c37.268 0 57.478-15.441 79.09-36.46-19.617-112.398-95.232-179.12-159.932-179.12h-107.79a21.3 21.3 0 0 0-5.955 2.022 684 684 0 0 0-69.12-77.474c-35.84-34.223-61.764-58.934-94.909-79.44a42.44 42.44 0 0 0-21.8-6.792 22.82 22.82 0 0 0-17.381 7.195c-10.914 11.426-6.063 28.241 1.428 39.182 21.989 32.121 47.912 56.859 83.752 91.109 20.615 19.672 49.26 43.17 77.393 63.084C281.007 367.4 215.58 484.433 215.58 592.842c0 74.483 24.792 124.066 51.065 176.586 27.89 55.781 56.724 113.476 56.724 200.677h-53.894c0-74.482-24.792-124.065-51.066-176.586-27.89-55.78-56.724-113.475-56.724-200.677 0-90.866 42.227-197.686 93.454-274.486a804 804 0 0 1-39.047-34.115c-38.238-36.487-65.86-62.841-91.055-99.625-24.441-35.759-22.798-78.686 4.069-106.819 26.3-27.567 70.898-31.043 106.523-9 37.942 23.444 65.563 49.798 103.774 86.258 9.97 9.513 33.038 32.31 56.94 60.55h68.635c-27.621-37.78-60.416-72.73-88.522-99.543-28.834-27.54-54.73-52.116-84.534-74.024L326.306.296c31.232 23.23 57.802 48.533 87.31 76.72 53.84 51.388 94.45 100.594 121.747 146.836 82.837 26.65 150.043 116.87 165.026 230.75l1.725 13.177-9.405 9.405a820 820 0 0 1-11.803 11.587c156.322 72.408 181.41 174.727 181.41 232.125m-552.852 33.63c3.934 8.058 7.895 16.088 11.991 24.145 27.433 54.3 55.808 110.457 55.808 191.434h53.895c0-93.696-34.062-161.226-61.52-215.579zm597.908 53.895c-3.423 9.405-7.815 19.806-13.77 31.96L829.79 970.105h60.066l52.143-105.957c10.78-21.935 17.516-40.017 21.908-55.727zM514.695 390.737c0-34.223-13.231-44.463-29.642-44.463s-29.642 10.24-29.642 44.463c0 34.25 13.23 44.463 29.642 44.463s29.642-10.213 29.642-44.463"/></svg>`,
    /** 辰时 (07:00-09:00)：龙 */
    dragon: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M552.421 1024c-69.767 0-113.826-13.959-156.402-27.46-54.488-17.273-110.808-35.004-232.422-26.516l-3.826-53.733c131.719-9.458 195.934 10.968 252.524 28.888 42.226 13.366 78.686 24.926 140.126 24.926 92.753 0 148.21-57.937 148.21-113.96 0-16.95-5.524-101.619-114.634-101.619-64.97 0-112.747 23.337-163.328 48.02-57.344 28.026-122.368 59.77-218.381 59.77C85.908 862.316 0 787.294 0 683.897c0-95.77 80.788-198.844 258.183-198.844 86.69 0 155.917 24.818 229.214 51.092 45.81 16.41 92.564 33.172 145.489 44.167 9-7.034 13.85-16.277 13.85-26.76 0-37.187-37.672-74.859-74.131-111.265L569.317 439l38.104-38.104 3.26 3.288c42.173 42.091 89.95 89.842 89.95 149.369 0 12.719-2.802 24.926-7.976 36.11a595 595 0 0 0 61.871 3.18c62.437 0 107.79-34.008 107.79-80.843 0-58.853-52.87-110.269-108.84-164.702l-8.058-7.842c-19.025 16.438-38.077 35.49-59.419 56.832l-38.103-38.104C722.7 283.352 782.794 223.286 916.21 216.253V55.619c-63.408 7.788-120.994 39.424-121.668 39.802l-15.818 8.811-14.12-11.344c-32.903-26.436-54.892-38.993-90.92-38.993-41.419 0-74.349 25.87-109.192 53.302-26.624 20.91-54.137 42.55-86.85 53.194l-8.3 1.293h-69.094L294.723 267.21l-38.103-38.13 67.395-67.396h-162.33V107.79h303.103c22.232-8.272 43.709-25.168 66.399-42.98C569.829 34.438 613.619 0 673.684 0c48.91 0 81.408 17.947 110.889 40.098C813.703 26.3 877.73 0 943.158 0h26.947v323.368h-53.894v-53.167c-54.165 3.1-92.915 15.845-127.003 36.676l1.832 1.778C852.588 368.505 916.21 430.376 916.21 512c0 60.928-43.708 109.945-107.789 127.623v61.009h53.895v-53.895h53.895v53.895h53.894v53.894h-53.894v53.895h-53.895v-53.895H808.42c-29.723 0-53.895-24.171-53.895-53.894v-53.895c-118.326 0-207.063-31.798-285.318-59.877-68.77-24.63-133.713-47.913-211.025-47.913-141.124 0-204.288 72.785-204.288 144.95 0 73.324 61.844 124.524 150.393 124.524 11.91 0 23.229-.539 34.035-1.536 10.132-10.563 31.15-36.244 31.15-67.719 0-33.118-43.088-70.98-58.152-81.596l30.936-44.14c8.3 5.794 81.111 58.664 81.111 125.736 0 19.43-4.527 37.053-10.994 52.305 30.774-10.051 58.314-23.498 86.663-37.349 53.84-26.274 109.54-53.49 186.96-53.49 116.413 0 168.53 78.093 168.53 155.513 0 82.513-75.615 167.855-202.106 167.855m-21.18-623.104-38.104-38.104 137.89-137.89 38.103 38.104zM404.48 382.545l-38.104-38.104 152.98-152.98 38.104 38.104zM686.484 163.92c15.495-9.755 43.332-31.448 43.332-31.448-25.735-27.81-49.557-33.334-67.369-29.076-19.24 4.608-37.753 24.603-37.753 24.603s42.253 22.447 61.79 35.92"/></svg>`,
    /** 巳时 (09:00-11:00)：蛇 */
    snake: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M671.528 788.857c44.329 11.965 89.627 19.564 136.893 19.564 89.169 0 161.684-60.443 161.684-134.737S897.59 538.947 808.421 538.947c-19.079 0-37.026 1.51-54.218 4.016-.755-101.403-38.211-172.356-79.414-219.648l-1.105.053a1750 1750 0 0 1-79.036-1.751c45.702 35.867 108.705 107.87 105.984 232.367 0 .431-.081.808-.108 1.24-34.924 10.994-66.156 26.731-95.097 45.19a163 163 0 0 0-15.846-42.388c-21.557-39.64-60.065-66.775-97.36-93.022C433.098 423.344 377.263 384 377.263 296.42c0-130.29 108.275-188.632 215.58-188.632 64.134 0 132.715 12.046 214.365 37.808-4.877 34.654-27.109 63.784-106.576 69.039v-52.952h-53.895v53.68c-63.273-1.025-104.529-5.201-104.987-5.255l-5.578 53.598c2.236.242 56.185 5.767 137.512 5.767 125.17 0 188.632-48.128 188.632-143.064v-19.429l-18.432-6.144c-96.095-32.013-175.859-46.942-251.042-46.942-158.666 0-269.474 99.732-269.474 242.526 0 115.55 76.423 169.391 137.836 212.615 33.684 23.713 65.51 46.107 81.004 74.698 9.54 17.543 13.285 33.415 12.342 47.75 21.154 9.109 42.119 17.84 62.949 25.978 53.652-37.268 112.478-64.62 190.922-64.62 59.446 0 107.79 36.271 107.79 80.842s-48.344 80.842-107.79 80.842c-105.472 0-203.237-42.388-297.768-83.429-94.801-41.094-184.347-79.953-281.412-79.953-106.523.027-175.346 53.572-175.346 136.435 0 79.064 67.099 136.434 159.555 136.434 142.174 0 230.427-66.883 306.796-129.886 31.42 13.42 62.787 26.058 94.45 37.134-47.077 49.637-110.969 82.566-186.61 91.27l5.066 53.626c93.453-7.007 143.144 9.35 195.719 26.543 46.457 15.225 94.127 30.855 169.822 30.855 19.995 0 41.957-1.078 66.344-3.558l-5.416-53.625c-105.283 10.78-158.1-6.548-213.935-24.872-22.15-7.276-44.625-14.633-70.306-20.345a334.9 334.9 0 0 0 96.148-82.298M213.45 810.12c-50.877 0-105.66-25.843-105.66-82.54 0-60.847 62.733-82.54 121.451-82.54 77.851 0 154.732 30.289 235.25 64.943-66.263 52.925-139.721 100.137-251.04 100.137"/></svg>`,
    /** 午时 (11:00-13:00)：马 */
    horse: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M1024 0v404.21c0 33.334 0 134.737-92.08 134.737h-13.823l-78.363-109.056c-22.744 49.907-40.34 103.047-53.49 162.951h115.092c35.974 0 68.77 32.795 68.77 68.797 0 60.631-69.39 154.3-77.313 164.756l-43.008-32.472c25.681-34.061 66.426-100.11 66.426-132.284 0-5.983-8.92-14.902-14.902-14.902H775.976c-14.848 89.384-21.45 193.832-21.45 323.368h-53.894c0-283.971 31.097-453.605 110.888-605.049l20.318-38.535L944.64 483.517c14.444-4.42 25.465-20.938 25.465-79.306V0zM862.316 161.684h53.895V0h-53.895v80.842c-17.381-14.956-38.185-26.947-80.842-26.947H646.737v53.894h134.737c37.672 0 80.842 40.907 80.842 53.895m-107.79 0H538.947v53.895h161.685zm-453.632 604.86 99.786 149.667h64.755l-95.043-142.552 128.485-126.922h167.855a1213 1213 0 0 1 9.431-53.895H476.78zm109.973-184.4-37.862-38.32-132.419 130.803c-66.856-103.531-78.902-144.815-78.902-205.312 0-70.736 37.78-145.947 107.79-145.947h323.368l53.895-53.894H269.474c-6.71 0-13.258.566-19.699 1.482-14.848-21.504-45.137-55.377-89.142-55.377C65.967 215.579 0 349.292 0 469.315c0 70.171 16.141 136.65 49.233 202.672L6.198 723.833l41.472 34.412 66.129-79.737-8.704-16.034c-21.99-40.34-51.2-104.26-51.2-193.159 0-100.864 52.87-199.841 106.738-199.841 13.231 0 25.816 9.89 35.436 20.534-53.194 31.96-88.28 98.492-88.28 179.307 0 78.202 19.699 130.938 93.643 243.982l-55.296 54.622 134.763 202.186h64.755L215.606 775.033z"/></svg>`,
    /** 未时 (13:00-15:00)：羊 */
    goat: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M608.256 144.734c-52.493-29.157-102.157-36.945-123.203-36.945V53.895c32.579 0 91.27 11.452 149.369 43.735 75.29 41.823 130.695 94.532 171.385 150.879-49.933 39.504-108.706 74.86-159.07 74.86h-107.79v-53.895h107.79c20.507 0 48.424-11.21 80.438-31.286a471 471 0 0 0-118.919-93.454m224.418 197.498c-16.384 0-29.642 10.24-29.642 44.463 0 34.25 13.23 44.463 29.642 44.463s29.642-10.213 29.642-44.463c0-34.223-13.231-44.463-29.642-44.463M1024 619.789c0-272.68-122.934-497.34-337.246-616.394L660.588 50.5c253.736 140.962 304.1 389.902 309.06 542.343H885.14c-17.92-35.624-45.352-69.12-87.013-101.996l-16.788-13.285-16.734 13.393c-66.13 52.898-134.63 127.084-187.312 209.678H102.966l-8.273-20.319c64.35-63.3 66.991-77.204 66.991-195.26v-53.895h485.053v-53.895H161.684c0-80.384 14.31-110.026 66.587-137.916l-25.384-47.536c-79.522 42.416-95.098 100.11-95.098 185.452v107.79c0 107.6 0 107.6-63.65 169.283L31.07 667.001l79.549 195.315h58.206l-43.897-107.79h103.478l43.897 107.79h58.206l-43.897-107.79h259.476c-37.106 70.414-61.035 144.627-61.035 215.58h53.894c0-68.69 27.271-144.061 68.959-215.58h79.252c7.41 0 13.474 6.063 13.474 13.474v94.316h53.894V768c0-37.16-30.208-67.368-67.368-67.368h-44.652c40.771-58.018 89.438-111.428 138.914-153.627 60.092 53.032 80.896 108.22 80.896 207.521h53.895c0-38.912-2.75-74.482-11.103-107.79H1024z"/></svg>`,
    /** 申时 (15:00-17:00)：猴 */
    monkey: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M538.947 1024h-53.894c0-32.795 25.87-87.417 77.446-103.316-33.9-39.532-77.446-98.25-77.446-139.21 0-44.571 36.27-80.842 80.842-80.842h80.842v53.894h-80.842a26.947 26.947 0 0 0-26.948 26.948c0 19.725 36.676 77.473 92.133 134.737h88.603c20.21-14.148 88.738-71.465 88.738-198.603 0-108.382-93.238-202.967-168.152-278.986-49.502-50.203-88.576-89.842-98.735-128.62-11.749-44.732-21.585-112.586-26.327-148.318H377.263c-45.137 0-89.519 8.435-121.802 53.895h175.697v53.895c-97.28 0-107.79 113.07-107.79 161.684v53.895h53.895v161.684h-53.895v-107.79h-26.947c-170.253 0-188.632-94.235-188.632-134.736 0-31.044 35.22-72.327 55.728-93.723 2.694-14.687 5.847-28.35 9.431-41.014h-11.264v-53.895h31.529c46.43-94.585 124.011-107.79 184.05-107.79h185.64l2.803 23.795c.135 1.05 12.72 106.658 27.945 164.756 6.494 24.873 44.624 63.515 84.965 104.448 81.866 83.025 183.7 186.341 183.7 316.82 0 92.376-31.124 155.029-61.898 194.426 104.502-19.887 169.687-109.03 169.687-238.35 0-91.405-42.82-154.381-84.237-215.255-38.077-55.97-77.447-113.853-77.447-188.955 0-119.35 87.094-161.685 161.684-161.685v53.895c-32.417 0-107.79 10.51-107.79 107.79 0 58.502 31.556 104.933 68.097 158.639C974.282 492.598 1024 565.679 1024 673.684c0 177.287-108.301 296.421-269.474 296.421H592.842c-37.672 0-53.895 40.906-53.895 53.895M229.214 269.474a385 385 0 0 0-14.012 58.34l-1.402 8.49-6.09 6.116c-22.878 22.932-44.813 52.601-46.026 62.276 0 56.805 53.76 75.264 107.79 79.387v-52.925c0-58.691 13.473-119.62 46.51-161.684zM323.368 1024h-53.894c0-32.795 25.87-87.417 77.446-103.316-33.9-39.532-77.446-98.25-77.446-139.21 0-44.571 36.27-80.842 80.842-80.842h45.164a188.85 188.85 0 0 1 170.415-107.79h134.737v53.895H565.895c-74.294 0-134.737 60.443-134.737 134.737v26.516l-53.895.377v-26.893c0-9.162.647-18.136 1.913-26.948h-28.86c-14.848 0-26.948 12.073-26.948 26.948 0 19.725 36.676 77.473 92.133 134.737h15.657v53.894h-53.895c-37.672 0-53.895 40.906-53.895 53.895"/></svg>`,
    /** 酉时 (17:00-19:00)：鸡 */
    rooster: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M673.684 354.358c-16.384 0-29.642-10.213-29.642-44.463 0-34.223 13.231-44.463 29.642-44.463s29.642 10.24 29.642 44.463c0 34.25-13.258 44.463-29.642 44.463M540.106 970.105l-50.58-107.79h156.052l50.607 107.79h59.554l-51.604-109.918C811.52 846.82 916.21 764.55 916.21 646.737c0-53.033-11.911-95.42-24.523-140.315-14.443-51.389-29.372-104.529-29.372-183.054V107.79C862.316 48.344 813.972 0 754.526 0a107.924 107.924 0 0 0-107.79 106.173 101 101 0 0 0-24.117-3.315 88.71 88.71 0 0 0-88.603 88.603c0 20.669 5.228 39.72 10.671 53.922l-99.49 59.688 93.75 14.47v57.722c0 14.417-5.901 21.693-33.36 49.152l-11.13 11.13C398.228 326.52 324.985 269.473 215.741 269.473 96.768 269.474 0 366.242 0 485.214v161.523h53.895V485.214A162.01 162.01 0 0 1 215.74 323.368c82.081 0 140.422 36.245 240.64 152.253l-38.616 38.616c-49.96-52.952-94.666-83.08-158.181-83.08a151.983 151.983 0 0 0-151.795 151.795v171.574h53.895V582.952a98.01 98.01 0 0 1 97.9-97.9c46.323 0 79.63 20.912 137.027 86.017l18.971 21.53 128.081-128.08c28.537-28.538 49.18-49.152 49.18-87.256v-97.927l23.309-14.12-13.663-23.04c-.161-.243-14.578-24.9-14.578-50.688 0-19.133 15.575-34.708 34.708-34.708 5.093 0 26.786 3.18 39.559 18.647l26.327 46.026 39.775-24.09-20.373-49.368c-3.152-7.545-7.275-30.478-7.275-40.206 0-29.722 24.171-53.894 53.894-53.894s53.895 24.172 53.895 53.894v215.58c0 85.935 16.68 145.3 31.367 197.631 12.1 43.008 22.528 80.142 22.528 125.737 0 95.286-99.41 161.684-188.632 161.684H464.222l-68.42-145.704c-20.56-43.763-57.693-69.875-99.354-69.875a80.977 80.977 0 0 0-80.87 80.87v188.604h53.896V673.71c0-14.875 12.1-26.974 26.974-26.974 20.534 0 38.966 14.147 50.553 38.858l133.578 284.51z"/></svg>`,
    /** 戌时 (19:00-21:00)：狗 */
    dog: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M326.063 282.947c0 34.25-13.231 44.464-29.642 44.464s-29.642-10.214-29.642-44.464c0-34.223 13.231-44.463 29.642-44.463s29.642 10.24 29.642 44.463m-56.59 147.349v311.646L190.276 916.21h59.204l73.89-162.574V377.263H296.42c-119.404 0-172.733-53.383-185.506-107.79h35.625c51.092 0 68.58-15.764 120.535-62.544 12.773-11.507 28.08-25.277 47.024-41.742l18.35-15.952-69.658-99.14-44.086 30.99 41.768 59.472c-11.183 9.863-20.884 18.594-29.48 26.328-50.257 45.272-54.757 48.694-84.453 48.694H53.895v26.947c0 88.711 66.91 178.15 215.579 187.77M486.185 268.88c2.29 71.734 28.7 136.327 75.049 182.919 57.479 57.829 141.204 87.147 248.859 87.147 18.593 0 36.19-1.158 52.628-3.449 3.746 111.266 33.63 170.334 51.496 196.015l-38.507 84.723c-93.535-74.186-186.934-115.604-498.446-115.604v53.894c34.277 0 65.698.512 94.64 1.51l-97.308 214.07H433.8l96.013-211.241c66.183 4.338 117.006 11.83 157.912 22.016L626.23 916.21h59.176l54.165-119.135c47.616 18.405 79.737 42.092 113.125 69.74l-46.943 103.29h59.204l113.07-248.779-13.823-13.204c-.485-.458-45.65-47.59-47.94-185.263C985.17 498.553 1024 447.81 1024 377.263c0-95.205-66.506-161.684-161.684-161.684v53.895c65.482 0 107.79 42.307 107.79 107.79 0 89.087-87.014 107.789-160.014 107.789-92.753 0-163.625-23.984-210.648-71.276-30.316-30.505-45.891-65.833-53.356-98.735 11.21 6.952 22.933 13.339 35.275 19.186l23.04-48.72C512.296 241.852 455.41 156.86 385.159 41.525l-46.026 28.052c49.448 81.246 92.968 148.507 147.051 199.303"/></svg>`,
    /** 亥时 (21:00-23:00)：猪 */
    pig: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M808.421 700.632v53.894c-196.446 0-323.368 84.642-323.368 215.58h-53.895c0-163.706 148.076-269.474 377.263-269.474m-323.368 107.79v-53.896c-158.343 0-245.599 0-319.65-49.367l-6.79-4.527h-77.77c-21.694 0-26.625-14.821-26.948-26.948v-82.62C138.05 579.88 215.579 516.15 215.579 404.21V215.579h-53.895v161.684h-26.947C67.773 377.263 0 414.29 0 485.053h53.895c0-42.631 52.87-53.895 80.842-53.895h24.63c-12.234 73.755-74.213 107.79-132.42 107.79H0v134.736c0 32.499 21.53 80.842 80.842 80.842h61.683c32.687 20.507 67.126 33.146 105.957 41.014a232.9 232.9 0 0 0-32.903 120.67h53.895c0-41.93 14.012-80.303 39.424-112.505 49.987 4.447 107.062 4.716 176.155 4.716M412.106 466l-88.738 88.738V431.158h-53.894V684.84L450.21 504.104zm-88.738-304.317h-53.894v190.033a770 770 0 0 1 53.894-49.098zm323.369-53.895c-72.623 0-146.81 23.337-215.58 58.638v-58.638h-53.894v154.14c81.57-56.536 178.068-100.245 269.474-100.245 148.588 0 269.474 120.886 269.474 269.474v235.655L809.58 862.316h61.359l99.166-181.76V431.158c0-178.31-145.057-323.369-323.368-323.369"/></svg>`
  };
  var chinese_hour_animals_default = ChineseHourAnimals;

  // lib/services/ui/image/utils/get-chinese-hour-animal.js
  var getChineseHourAnimal = (hour) => {
    const map = [
      "rat",
      // 0  子时（鼠）
      "ox",
      // 1  丑时（牛）
      "ox",
      // 2  丑时（牛）
      "tiger",
      // 3  寅时（虎）
      "tiger",
      // 4  寅时（虎）
      "rabbit",
      // 5  卯时（兔）
      "rabbit",
      // 6  卯时（兔）
      "dragon",
      // 7  辰时（龙）
      "dragon",
      // 8  辰时（龙）
      "snake",
      // 9  巳时（蛇）
      "snake",
      // 10 巳时（蛇）
      "horse",
      // 11 午时（马）
      "horse",
      // 12 午时（马）
      "goat",
      // 13 未时（羊）
      "goat",
      // 14 未时（羊）
      "monkey",
      // 15 申时（猴）
      "monkey",
      // 16 申时（猴）
      "rooster",
      // 17 酉时（鸡）
      "rooster",
      // 18 酉时（鸡）
      "dog",
      // 19 戌时（狗）
      "dog",
      // 20 戌时（狗）
      "pig",
      // 21 亥时（猪）
      "pig",
      // 22 亥时（猪）
      "rat"
      // 23 子时（鼠，回归）
    ];
    return map[hour];
  };
  var get_chinese_hour_animal_default = getChineseHourAnimal;

  // lib/services/ui/image/render-chinese-hour-animal.js
  var renderChineseHourAnimal = (canvas) => {
    const { gameBoard } = canvas;
    const { width } = gameBoard;
    const time = /* @__PURE__ */ new Date();
    const hour = time.getHours();
    const index = hour - 1;
    const animal = get_chinese_hour_animal_default(Math.max(index, 0));
    const img = getImage(chinese_hour_animals_default[animal]);
    const size = Math.floor(width * 0.38);
    const x = -size / 2;
    const y = -size / 2;
    render_image_default(canvas, { img, x, y, size });
  };
  var render_chinese_hour_animal_default = renderChineseHourAnimal;

  // lib/services/ui/effects/clock/render-clock-dial.js
  var renderClockDial = (canvas, radius, theme) => {
    const { gameBoardContext: ctx } = canvas;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = theme.face;
    ctx.fill();
    ctx.lineWidth = Math.floor(radius * 0.2);
    ctx.strokeStyle = theme.stroke;
    ctx.stroke();
    ctx.restore();
  };
  var render_clock_dial_default = renderClockDial;

  // lib/services/ui/effects/clock/render-clock-ticks.js
  var renderClockTicks = (canvas, radius, theme) => {
    const { gameBoardContext: ctx } = canvas;
    const dotRadius = Math.floor(radius * 0.06);
    const dotDistance = radius - Math.floor(radius * 0.25);
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 6);
      ctx.beginPath();
      ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = theme.stroke;
      ctx.fill();
      ctx.restore();
    }
  };
  var render_clock_ticks_default = renderClockTicks;

  // lib/services/ui/effects/clock/render-clock-hands.js
  var renderClockHands = (canvas, radius, angles, theme) => {
    const { gameBoardContext: ctx } = canvas;
    const { hAng, mAng, sAng } = angles;
    ctx.save();
    ctx.rotate(hAng);
    ctx.lineWidth = 5;
    ctx.strokeStyle = theme.stroke;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.4);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(mAng);
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.stroke;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.65);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(sAng);
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.secondHand;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.75);
    ctx.stroke();
    ctx.restore();
  };
  var render_clock_hands_default = renderClockHands;

  // lib/services/ui/effects/clock/render-clock-center.js
  var renderClockCenter = (canvas, radius, theme) => {
    const { gameBoardContext: ctx } = canvas;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = theme.secondHand;
    ctx.arc(0, 0, Math.floor(radius * 0.05), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  var render_clock_center_default = renderClockCenter;

  // lib/services/ui/effects/clock/render-analog-clock.js
  var renderAnalogClock = (canvas, time) => {
    const { gameBoard, gameBoardContext: ctx } = canvas;
    const { width, height } = gameBoard;
    const centerX = width / 2;
    const centerY = height / 2.2;
    const radius = Math.floor(width * 0.3);
    const displayTime = time || /* @__PURE__ */ new Date();
    const hours = displayTime.getHours();
    const angles = get_clock_angles_default(displayTime);
    const theme = clock_themes_default[get_chinese_hour_dial_theme_default(hours)];
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.lineCap = "round";
    render_clock_dial_default(canvas, radius, theme);
    render_chinese_hour_animal_default(canvas);
    render_clock_ticks_default(canvas, radius, theme);
    render_clock_hands_default(canvas, radius, angles, theme);
    render_clock_center_default(canvas, radius, theme);
    ctx.restore();
  };
  var render_analog_clock_default = renderAnalogClock;

  // lib/services/ui/board/render-block.js
  var renderBlock = (canvas, x, y, color) => {
    const { gameBoardContext: ctx, blockSize } = canvas;
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const gap = 1;
    const size = blockSize - gap * 2;
    const px = x * blockSize + gap;
    const py = y * blockSize + gap;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);
    ctx.strokeStyle = RGBA_BLACK2;
    ctx.strokeRect(px, py, size, size);
  };
  var render_block_default = renderBlock;

  // lib/services/ui/constants/chinese-hour-characters.js
  var { RGBA_TEAL: RGBA_TEAL3 } = colors_default;
  var ChineseHourCharacters = {
    /** 子时 (23:00-01:00) */
    zi: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M538.947 700.632v-215.58h269.474v-53.894H538.947v-39.586c26.544-18.081 94.586-65.05 177.853-127.488l-16.168-48.505H323.368v53.895h295.317a4221 4221 0 0 1-121.64 85.369l-11.992 8.003v68.312H242.526v53.895h242.527v215.579c0 48.343-13.851 53.894-134.737 53.894v53.895c105.39 0 188.631 0 188.631-107.79"/></svg>`,
    /** 丑时 (01:00-03:00) */
    chou: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M808.421 700.632H648.866c13.985-172.814 43.115-357.43 70.817-385.16l-19.051-45.998H323.368v53.894h107.17c-1.94 45.757-8.192 103.963-15.764 161.685h-91.406v53.894h83.968c-9.862 68.447-20.264 130.13-25.734 161.685H215.579v53.894H808.42zM461.878 538.947h149.8a3314 3314 0 0 0-16.842 161.685H436.36c6.036-35.248 16.114-95.637 25.519-161.685m22.609-215.579h171.735c-15.198 41.122-27.405 100.595-36.89 161.685H469.207c7.383-57.506 13.42-115.362 15.279-161.685"/></svg>`,
    /** 寅时 (03:00-05:00) */
    yin: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M712.677 811.25l-107.79-53.894-24.117 48.209 107.79 53.894zm-269.474-5.658-24.118-48.21-107.789 53.895 24.118 48.21zm257.429-374.434H538.947v-53.895h107.79v-53.895H377.263v53.895h107.79v53.895H323.368v323.368h53.895v-53.894h269.474v53.894h53.895zM538.947 592.842h107.79v53.895h-107.79zm-161.684 0h107.79v53.895h-107.79zm161.684-107.79h107.79v53.895h-107.79zm-161.684 0h107.79v53.895h-107.79zM754.526 215.58H531.43l-20.803-62.41-51.12 17.058 15.118 45.352h-205.15v107.79h53.894v-53.895h377.264v53.894h53.894z"/></svg>`,
    /** 卯时 (05:00-07:00) */
    mao: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M592.842 323.368h107.79v323.369c-20.48 0-39.936-11.264-40.017-11.318l-27.73 46.215c3.208 1.94 32.661 18.998 67.747 18.998 30.747 0 53.894-23.148 53.894-53.895V269.474H538.947V808.42h53.895zm-107.79 242.527V323.368h-53.894v196.905l-107.79 40.42V316.767l169.095-48.316-14.82-51.82-208.17 59.473v304.801l-36.405 13.663 18.917 50.472 178.742-67.018c-5.04 69.928-55.27 106.981-165.134 122.934l7.734 53.329c52.386-7.626 211.726-30.747 211.726-188.39"/></svg>`,
    /** 辰时 (07:00-09:00) */
    chen: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M471.983 777.62l-40.825-23.094V485.053h-66.075c-14.47 110.646-44.355 197.066-102.696 260.742l-39.748-36.432c83.887-91.487 100.73-246.461 100.73-466.837V215.58h377.263v53.895h-323.45c-.404 58.26-2.21 112.128-6.36 161.684h329.81v53.895H578.479a481.2 481.2 0 0 0 76.827 119.7l66.48-39.855 27.728 46.214-54.46 32.688c29.507 24.953 63.757 45.675 102.804 58.098l-16.303 51.362C647.33 710.548 558.78 586.186 520.003 485.053h-34.95V706.91l68.985-41.39 27.729 46.214zm174.754-400.357h-215.58v-53.895h215.58z"/></svg>`,
    /** 巳时 (09:00-11:00) */
    si: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M728.064 692.763l-52.116-13.797c-18.729 70.898-24.522 75.56-56.159 75.56H377.263V485.053h269.474v53.894h53.895V215.58H323.368v538.947c0 29.723 24.172 53.895 53.895 53.895H619.79c77.69 0 91.19-51.065 108.275-115.658m-350.8-423.29h269.473v161.685H377.263z"/></svg>`,
    /** 午时 (11:00-13:00) */
    wu: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512m-431.158 26.947h269.474v-53.894H538.947V323.368h161.685v-53.894h-289.63c12.045-33.28 20.156-69.794 20.156-107.79h-53.895c0 121.964-105.364 233.391-106.415 234.496l38.858 37.35c2.883-3.019 43.817-46.135 77.393-110.162h97.954v161.685H215.579v53.894h269.474v323.369h53.894z"/></svg>`,
    /** 未时 (13:00-15:00) */
    wei: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512m-431.158 50.203c52.305 70.925 136.974 152.145 232.53 190.383l19.994-50.041c-109.271-43.709-202.806-152.63-238.78-217.492h255.73v-53.895H538.947v-53.895h215.58v-53.895h-215.58V161.684h-53.894v161.684h-215.58v53.895h215.58v53.895H215.579v53.895h255.757C435.362 549.915 341.8 658.836 232.53 702.545l20.022 50.041c95.528-38.238 180.197-119.485 232.502-190.383V808.42h53.894z"/></svg>`,
    /** 申时 (15:00-17:00) */
    shen: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M538.947 646.737h161.685v53.895h53.894V269.474H538.947v-107.79h-53.894v107.79h-215.58v431.158h53.895v-53.895h161.685v215.579h53.894zm0-161.684h161.685v107.79H538.947zm-215.579 0h161.685v107.79H323.368zm215.58-161.685h161.684v107.79H538.947zm-215.58 0h161.685v107.79H323.368z"/></svg>`,
    /** 酉时 (17:00-19:00) */
    you: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M754.526 323.368H592.842v-26.947h161.684v-53.895H269.474v53.895h161.684v26.947H269.474v485.053h53.894v-53.895h377.264v53.895h53.894zM323.368 646.737h377.264v53.895H323.368zm0-269.474h107.79c0 103.316-72.785 107.655-81.085 107.79l.243 53.894c46.592 0 134.737-33.792 134.737-161.684h53.894v107.79c0 29.723 24.172 53.894 53.895 53.894h107.79v53.895H323.368zm377.264 0v107.79h-107.79v-107.79zm-215.58-80.842h53.895v26.947h-53.894z"/></svg>`,
    /** 戌时 (19:00-21:00) */
    xu: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M594.513 662.393c33.684 44.544 75.21 74.698 124.74 90.813l11.425 3.719 10.402-6.01c40.124-23.174 67.341-128.35 67.341-158.073h-53.895c0 22.07-19.132 80.87-33.71 103.505-34.817-14.606-64.54-39.262-89.25-74.132 48.316-55.27 92.079-117.33 120.535-179.9l-49.044-22.286C679.289 472.279 643.315 524.746 603 572.685c-24.01-50.93-41.148-115.927-51.658-195.395h149.289v-53.895h-155.19a1848 1848 0 0 1-6.495-161.71h-53.894c0 58.206 2.155 112.073 6.494 161.683H323.368v26.948c0 216.549-13.177 263.545-100.702 359.047l39.747 36.432c63.327-69.093 92.807-118.272 105.715-206.848h116.925v-53.894h-111.32a1742 1742 0 0 0 3.45-107.79H497.34c12.611 98.25 35.031 177.476 67.395 238.188-61.979 65.536-128.054 117.976-173.299 142.282l25.52 47.481c47.589-25.573 114.095-77.446 177.556-142.82m125.17-411.971-80.842-80.842-38.103 38.103 80.842 80.842z"/></svg>`,
    /** 亥时 (21:00-23:00) */
    hai: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="m309.976 804.756-27.136-46.592c103.073-60.012 183.026-132.473 241.475-219.244h-174l-13.473-50.283c58.88-33.981 99.436-117.572 118.703-165.296H242.526v-53.894h538.948v53.894h-268.18c-12.396 34.089-42.47 106.604-90.436 161.685h134.01a680.6 680.6 0 0 0 46.349-107.709l51.092 17.058c-58.422 175.265-171.035 309.49-344.333 410.381m192.35-2.937-34.52-41.364c88.415-73.728 154.517-158.774 202.106-259.908l48.801 22.96a797.4 797.4 0 0 1-82.35 137.781c32.74 15.01 83.455 44.868 137.646 101.592l-38.939 37.268c-57.236-59.877-109.325-85.558-133.766-95.178a851 851 0 0 1-98.978 96.849m48.613-536.872-80.842-53.895 29.884-44.84 80.843 53.894zM512 53.895c-252.605 0-458.105 205.5-458.105 458.105S259.395 970.105 512 970.105c9.081 0 17.974-.835 26.947-1.374v-53.895c-8.946.62-17.866 1.375-26.947 1.375-222.882 0-404.21-181.33-404.21-404.211S289.117 107.79 512 107.79 916.21 289.117 916.21 512c0 195.207-139.075 358.508-323.368 396.045v54.461c214.097-38.346 377.263-225.55 377.263-450.533 0-252.578-205.5-458.078-458.105-458.078"/></svg>`
  };
  var chinese_hour_characters_default = ChineseHourCharacters;

  // lib/services/ui/image/utils/get-chinese-hour-character.js
  var getChineseHourCharacter = (hour) => {
    const map = [
      "zi",
      // 0  子时
      "chou",
      // 1  丑时
      "chou",
      // 2  丑时
      "yin",
      // 3  寅时
      "yin",
      // 4  寅时
      "mao",
      // 5  卯时
      "mao",
      // 6  卯时
      "chen",
      // 7  辰时
      "chen",
      // 8  辰时
      "si",
      // 9  巳时
      "si",
      // 10 巳时
      "wu",
      // 11 午时
      "wu",
      // 12 午时
      "wei",
      // 13 未时
      "wei",
      // 14 未时
      "shen",
      // 15 申时
      "shen",
      // 16 申时
      "you",
      // 17 酉时
      "you",
      // 18 酉时
      "xu",
      // 19 戌时
      "xu",
      // 20 戌时
      "hai",
      // 21 亥时
      "hai",
      // 22 亥时
      "zi"
      // 23 子时（回归）
    ];
    return map[hour];
  };
  var get_chinese_hour_character_default = getChineseHourCharacter;

  // lib/services/ui/image/render-chinese-hour-character.js
  var LAYOUT_STRATEGIES = {
    /**
     * ## 深夜 0-3 点：右侧偏大
     *
     * @param {number} width - 宽度值
     * @param {number} height - 高度值
     * @returns {object} - 返回 Strategy 对象信息
     */
    night_0_3: (width, height) => ({
      size: Math.floor(width * 0.48),
      x: width - Math.floor(width * 0.48) * 0.7,
      y: height / 2 - Math.floor(width * 0.48) * 1.4
    }),
    /**
     * ## 清晨 4-7 点：右侧偏中
     *
     * @param {number} width - 宽度值
     * @param {number} height - 高度值
     * @returns {object} - 返回 Strategy 对象信息
     */
    morning_4_7: (width, height) => {
      const size = Math.floor(width * 0.52);
      return {
        size,
        x: width - size * 1.1,
        y: height / 2 - size * 1.7
      };
    },
    /**
     * ## 上午 8-11 点：右侧较大
     *
     * @param {number} width - 宽度值
     * @param {number} height - 高度值
     * @returns {object} - 返回 Strategy 对象信息
     */
    morning_8_11: (width, height) => {
      const size = Math.floor(width * 0.58);
      return {
        size,
        x: width - size * 1.2,
        y: height / 2 - size * 1.75
      };
    },
    /**
     * ## 中午 12-14 点：居中最大
     *
     * @param {number} width - 宽度值
     * @returns {object} - 返回 Strategy 对象信息
     */
    noon_12_14: (width) => {
      const size = Math.floor(width * 0.68);
      return {
        size,
        x: width / 2 - size / 2,
        y: -size * 0.1
      };
    },
    /**
     * ## 下午 14-16 点：左侧较大
     *
     * @param {number} width - 宽度值
     * @param {number} height - 高度值
     * @returns {object} - 返回 Strategy 对象信息
     */
    afternoon_14_16: (width, height) => {
      const size = Math.floor(width * 0.58);
      return {
        size,
        x: size * 0.2,
        y: height / 2 - size * 1.75
      };
    },
    /**
     * ## 傍晚 17-19 点：左侧偏中
     *
     * @param {number} width - 宽度值
     * @param {number} height - 高度值
     * @returns {object} - 返回 Strategy 对象信息
     */
    evening_17_19: (width, height) => {
      const size = Math.floor(width * 0.52);
      return {
        size,
        x: size * 0.1,
        y: height / 2 - size * 1.7
      };
    },
    /**
     * ## 夜晚 20-23 点：左侧偏小
     *
     * @param {number} width - 宽度值
     * @param {number} height - 高度值
     * @returns {object} - 返回 Strategy 对象信息
     */
    night_20_23: (width, height) => {
      const size = Math.floor(width * 0.48);
      return {
        size,
        x: -size * 0.3,
        y: height / 2 - size * 1.4
      };
    }
  };
  var getStrategyKey = (hour) => {
    if (hour <= 3) {
      return "night_0_3";
    }
    if (hour <= 7) {
      return "morning_4_7";
    }
    if (hour <= 11) {
      return "morning_8_11";
    }
    if (hour <= 14) {
      return "noon_12_14";
    }
    if (hour <= 16) {
      return "afternoon_14_16";
    }
    if (hour <= 19) {
      return "evening_17_19";
    }
    return "night_20_23";
  };
  var renderChineseHourCharacter = (canvas) => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const hour = (/* @__PURE__ */ new Date()).getHours();
    const character = get_chinese_hour_character_default(hour);
    const img = getImage(chinese_hour_characters_default[character]);
    const key = getStrategyKey(hour);
    const strategy = LAYOUT_STRATEGIES[key];
    const { size, x, y } = strategy(width, height);
    render_image_default(canvas, { img, x, y, size });
  };
  var render_chinese_hour_character_default = renderChineseHourCharacter;

  // lib/services/ui/board/render-board.js
  var renderBoard = (canvas, board) => {
    const { rows, cols } = canvas;
    clear_board_default(canvas);
    render_chinese_hour_character_default(canvas);
    render_scene_background_default(canvas, "playing");
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (board[y][x]) {
          render_block_default(canvas, x, y, board[y][x]);
        }
      }
    }
  };
  var render_board_default = renderBoard;

  // lib/services/ui/board/render-active-pieces.js
  var renderActivePieces = (canvas, curr, cx, cy) => {
    const { shape, color } = curr;
    const { length } = shape;
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          render_block_default(canvas, cx + x, cy + y, color);
        }
      }
    }
    return true;
  };
  var render_active_pieces_default = renderActivePieces;

  // lib/services/ui/board/render-active-only.js
  var renderActiveOnly = (canvas, state) => {
    const { board, curr, cx, cy } = state;
    if (board) {
      render_board_default(canvas, board);
    }
    if (curr) {
      render_active_pieces_default(canvas, curr, cx, cy);
    }
  };
  var render_active_only_default = renderActiveOnly;

  // lib/services/ui/scenes/paused-scene/render-paused.js
  var renderPaused = (canvas, state) => {
    clear_board_default(canvas);
    render_active_only_default(canvas, state);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "paused");
    render_tetris_text_default(canvas);
    render_digital_clock_default(canvas);
    render_analog_clock_default(canvas);
    render_paused_text_default(canvas);
  };
  var render_paused_default = renderPaused;

  // lib/services/ui/scenes/paused-scene/index.js
  var pausedScene = (canvas, state) => {
    render_paused_default(canvas, state);
  };
  var paused_scene_default = pausedScene;

  // lib/services/ui/text/render-game-text.js
  var renderGameText = (canvas) => {
    const { RED: RED5, YELLOW: YELLOW5 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "GAME",
      x: width / 2,
      y: height / 1.8,
      color: RED5,
      strokeColor: YELLOW5,
      size: 2.3,
      center: true,
      stroke: true
    });
  };
  var render_game_text_default = renderGameText;

  // lib/services/ui/text/render-over-text.js
  var renderOverText = (canvas) => {
    const { RED: RED5, YELLOW: YELLOW5 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "OVER",
      x: width / 2,
      y: height / 1.6,
      color: RED5,
      strokeColor: YELLOW5,
      size: 2.3,
      center: true,
      stroke: true
    });
  };
  var render_over_text_default = renderOverText;

  // lib/services/ui/scenes/game-over-scene/render-game-over.js
  var renderGameOver = (canvas, state) => {
    clear_board_default(canvas);
    render_active_only_default(canvas, state);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "game-over");
    render_tetris_text_default(canvas);
    render_game_text_default(canvas);
    render_over_text_default(canvas);
    render_enter_start_text_default(canvas);
  };
  var render_game_over_default = renderGameOver;

  // lib/services/ui/scenes/game-over-scene/index.js
  var gameOverScene = (canvas, state) => {
    render_game_over_default(canvas, state);
  };
  var game_over_scene_default = gameOverScene;

  // lib/services/ui/next/clear-next-piece.js
  var clearNextPiece = (canvas) => {
    const { nextPiece, nextPieceContext } = canvas;
    const { width, height } = nextPiece;
    nextPieceContext.clearRect(0, 0, width, height);
  };
  var clear_next_piece_default = clearNextPiece;

  // lib/services/ui/next/render-next-piece.js
  var renderNextPiece = (canvas, state) => {
    const { next } = state;
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const { nextPiece, nextPieceContext: ctx } = canvas;
    const { width, height } = nextPiece;
    if (!next) {
      return;
    }
    const { shape } = next;
    const blockSize = Math.ceil(width / 6);
    const ox = Math.floor((width - shape[0].length * blockSize) / 2);
    const oy = Math.floor((height - shape.length * blockSize) / 2);
    clear_next_piece_default(canvas);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) {
          continue;
        }
        const gap = 1;
        const size = blockSize - gap;
        const px = ox + x * blockSize + gap;
        const py = oy + y * blockSize + gap;
        ctx.fillStyle = next.color;
        ctx.fillRect(px, py, size, size);
        ctx.strokeStyle = RGBA_BLACK2;
        ctx.strokeRect(px, py, size, size);
      }
    }
  };
  var render_next_piece_default = renderNextPiece;

  // lib/services/ui/scenes/playing-scene/render-playing.js
  var renderPlaying = (canvas, state) => {
    render_active_only_default(canvas, state);
    render_next_piece_default(canvas, state);
  };
  var render_playing_default = renderPlaying;

  // lib/services/ui/scenes/playing-scene/index.js
  var playingScene = (canvas, state) => {
    render_playing_default(canvas, state);
  };
  var playing_scene_default = playingScene;

  // lib/services/ui/scenes/replay-scene/render-replay.js
  var renderReplay = (canvas, state) => {
    clear_board_default(canvas);
    render_playing_default(canvas, state);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "game-over");
    render_tetris_text_default(canvas);
    render_game_text_default(canvas);
    render_over_text_default(canvas);
    render_enter_start_text_default(canvas);
  };
  var render_replay_default = renderReplay;

  // lib/services/ui/scenes/replay-scene/index.js
  var replayScene = (canvas, state) => {
    render_replay_default(canvas, state);
  };
  var replay_scene_default = replayScene;

  // lib/services/ui/scenes/index.js
  var Scenes = {
    /**
     * ## 主菜单场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    "main-menu": (canvas, state) => {
      main_menu_scene_default(canvas, state);
    },
    /**
     * ## 难度选择
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    difficulty: (canvas, state) => {
      difficulty_scene_default(canvas, state);
    },
    /**
     * ## 游戏进行中场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    playing: (canvas, state) => {
      playing_scene_default(canvas, state);
    },
    /**
     * ## 暂停场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    paused: (canvas, state) => {
      paused_scene_default(canvas, state);
    },
    /**
     * ## 游戏结束场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    "game-over": (canvas, state) => {
      game_over_scene_default(canvas, state);
    },
    /**
     * ## 游戏回放场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    replay: (canvas, state) => {
      replay_scene_default(canvas, state);
    }
  };
  var scenes_default = Scenes;

  // lib/services/ui/scene-manager/render-scene.js
  var renderScene = (canvas, state) => {
    const { mode } = state;
    const scene = scenes_default[mode];
    if (!scene) {
      return;
    }
    scene(canvas, state);
  };
  var render_scene_default = renderScene;

  // lib/services/ui/scene-manager/lazy-render-scene.js
  var lazyRenderScene = (canvas, state) => {
    if (document?.fonts?.load) {
      document.fonts.load('40px "Press Start 2P"').then(() => {
        render_scene_default(canvas, state);
      });
    } else {
      setTimeout(() => {
        render_scene_default(canvas, state);
      }, 150);
    }
  };
  var lazy_render_scene_default = lazyRenderScene;

  // lib/services/ui/core/resize.js
  var resize = (canvas) => {
    const { gameBoard, nextPiece, rows, cols } = canvas;
    const { innerWidth, innerHeight } = globalThis;
    let blockSize;
    let nextSize;
    if (innerWidth >= 480) {
      const h = innerHeight * 0.9;
      blockSize = Math.floor(h / rows);
      nextSize = Math.min(innerWidth * 0.1, innerHeight * 0.18);
    } else {
      const width = innerWidth * 0.64;
      blockSize = Math.min(
        Math.floor(width / cols),
        Math.floor(innerHeight * 0.68 / rows)
      );
      nextSize = blockSize * 5;
    }
    const fontSize = Math.floor(blockSize * rows * 0.032);
    canvas.blockSize = blockSize;
    gameBoard.width = blockSize * cols;
    gameBoard.height = blockSize * rows;
    canvas.fontSize = fontSize;
    nextPiece.width = nextSize;
    nextPiece.height = nextSize;
  };
  var resize_default = resize;

  // lib/services/ui/board/render-clear-lines.js
  var renderClearLines = (canvas, state) => {
    const { gameBoardContext: ctx, cols } = canvas;
    for (const line of state.lines) {
      ctx.save();
      ctx.globalAlpha = line.alpha;
      for (let x = 0; x < cols; x++) {
        render_block_default(canvas, x, line.y, line.color);
      }
      ctx.restore();
    }
  };
  var render_clear_lines_default = renderClearLines;

  // lib/services/ui/effects/render-clear-score.js
  var renderClearScore = (canvas, scoreData) => {
    const { WHITE: WHITE3 } = colors_default;
    const { gameBoard, blockSize } = canvas;
    const { width } = gameBoard;
    const { score, y: rowY, alpha, offsetY } = scoreData;
    if (alpha <= 0) {
      return;
    }
    const x = width / 2;
    const y = rowY * blockSize + blockSize / 2 - offsetY;
    render_text_default(canvas, {
      text: String(score),
      x,
      y,
      color: WHITE3,
      size: 0.75,
      center: true,
      alpha
    });
  };
  var render_clear_score_default = renderClearScore;

  // lib/services/ui/text/render-countdown-text.js
  var renderCountdownText = (canvas, count, scale = 1) => {
    const { YELLOW: YELLOW5, BLACK: BLACK2 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const { gameBoard, gameBoardContext: ctx, fontSize } = canvas;
    const { width, height } = gameBoard;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.font = `${fontSize * 3.25}px ${FONT_FAMILY2}`;
    ctx.fillStyle = YELLOW5;
    ctx.strokeStyle = BLACK2;
    ctx.lineWidth = 6;
    const text = String(count);
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };
  var render_countdown_text_default = renderCountdownText;

  // lib/services/ui/text/render-get-ready-text.js
  var renderGetReadyText = (canvas) => {
    const { GREEN: GREEN5, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "GET READY!",
      x: width / 2,
      y: height / 1.46,
      color: GREEN5,
      stroke: true,
      strokeColor: BLACK2,
      // 固定字号
      size: 1.1,
      center: true,
      // 对齐方式与你原逻辑一致
      baseline: "top"
    });
  };
  var render_get_ready_text_default = renderGetReadyText;

  // lib/services/ui/image/render-gamepad.js
  var renderGamepad = (canvas) => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const img = getImage(scenes_background_default.gamepad);
    const size = Math.floor(width * 0.54);
    const x = width / 2 - size / 2;
    const y = height / 2 - size * 1.2;
    render_image_default(canvas, { img, x, y, size });
  };
  var render_gamepad_default = renderGamepad;

  // lib/services/ui/effects/render-countdown.js
  var renderCountdown = (canvas, state) => {
    const { number, scale } = state;
    clear_board_default(canvas);
    render_overlay_default(canvas);
    render_tetris_text_default(canvas);
    render_scene_background_default(canvas, "countdown");
    render_gamepad_default(canvas);
    render_get_ready_text_default(canvas);
    render_countdown_text_default(canvas, number, scale);
  };
  var render_countdown_default = renderCountdown;

  // lib/services/ui/effects/render-fireworks.js
  var renderFireworks = (canvas, fireworks) => {
    const { gameBoardContext: ctx } = canvas;
    for (const fire of fireworks) {
      ctx.globalAlpha = fire.alpha;
      ctx.fillStyle = fire.color;
      ctx.beginPath();
      ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
      ctx.fill();
      fire.x += fire.vx;
      fire.y += fire.vy;
      fire.alpha -= 0.024;
    }
    ctx.globalAlpha = 1;
  };
  var render_fireworks_default = renderFireworks;

  // lib/services/ui/text/render-level-up-text.js
  var renderLevelUpText = (canvas) => {
    const { GREEN: GREEN5 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "LEVEL UP",
      x: width / 2,
      y: height / 2.5,
      color: GREEN5,
      size: 1.2,
      center: true
    });
  };
  var render_level_up_text_default = renderLevelUpText;

  // lib/services/ui/text/render-congrats-text.js
  var renderCongratsText = (canvas) => {
    const { YELLOW: YELLOW5, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "CONGRATS!",
      x: width / 2,
      y: height / 1.6,
      color: YELLOW5,
      // 黄色填充
      stroke: true,
      // 启用描边
      strokeColor: BLACK2,
      // 黑色描边
      lineWidth: 3,
      // 描边宽度 3px
      size: 1.3,
      // 字体大小系数
      center: true
      // 水平居中
    });
  };
  var render_congrats_text_default = renderCongratsText;

  // lib/services/ui/effects/render-level-up.js
  function renderLevelUp(canvas, level, fireworks) {
    const { gameBoard } = canvas;
    const { height } = gameBoard;
    render_overlay_default(canvas);
    render_tetris_text_default(canvas);
    render_level_up_text_default(canvas);
    render_level_number_default(canvas, level, height / 1.85);
    render_congrats_text_default(canvas);
    render_fireworks_default(canvas, fireworks);
  }
  var render_level_up_default = renderLevelUp;

  // lib/services/ui/effects/render-landing-flash.js
  var renderLandingFlash = (canvas, flashData) => {
    if (!flashData) {
      return;
    }
    const { WHITE: WHITE3 } = colors_default;
    const { gameBoardContext: ctx, blockSize } = canvas;
    const { cells } = flashData;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = WHITE3;
    for (const { x, y } of cells) {
      ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
    ctx.globalAlpha = 1;
  };
  var render_landing_flash_default = renderLandingFlash;

  // lib/services/ui/core/canvas-renderer.js
  var CanvasRenderer = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    /**
     * ## 初始化渲染器
     *
     * 创建 HudManager 和 Canvas 实例。
     *
     * @param {object} options - 配置对象
     * @param {object} options.Elements - UI 元素配置
     * @param {object} options.Elements.Hud - HUD DOM 元素配置
     * @param {object} options.Elements.Main - 主画布配置（board、next、cols、rows）
     * @returns {void}
     */
    initialize(options) {
      const { Elements } = options;
      const { Hud, Main } = Elements;
      this.Hud = new hud_manager_default(Hud);
      this.Canvas = new canvas_default(Main);
    }
    // ==================== 状态更新方法 ====================
    /**
     * ## 更新游戏模式标识
     *
     * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。
     *
     * @param {string} mode - 游戏模式（main-menu / playing / paused / game-over /
     *   replay）
     * @returns {void}
     */
    updateMode(mode) {
      this.Canvas.gameBoard.dataset.mode = mode;
    }
    /**
     * ## 更新控制者标识
     *
     * 在 HUD 上显示当前控制者身份（HUMAN 或 AI）。
     *
     * @param {string} controller - 当前控制者（'human' 或 'ai'），会转为大写显示
     * @returns {void}
     */
    updateController(controller) {
      this.Hud.updateController(controller);
    }
    /**
     * ## 更新 HUD 显示
     *
     * 从 Store 读取最新状态（分数、行数、等级、最高分），更新 HUD 的数字显示。 主菜单模式下会先重置 HUD 为初始值。
     *
     * @returns {void}
     */
    updateHud() {
      const { Store } = this;
      const state = Store.getState();
      const { mode, score, lines, level, highScore, needReset = false } = state;
      if (mode === "main-menu" || needReset) {
        this.Hud.reset();
      }
      this.Hud.update({ score, lines, level, highScore });
    }
    /**
     * ## 更新 HUD 动画
     *
     * 每帧调用，驱动 HUD 数字（分数、最高分）的平滑过渡动画。
     *
     * @returns {void}
     */
    tickHud() {
      this.Hud.tick();
    }
    // ==================== 场景渲染方法 ====================
    /**
     * ## 延迟渲染场景
     *
     * 等待像素字体 "Press Start 2P" 加载完成后渲染主菜单场景。
     *
     * @returns {void}
     */
    lazyRender() {
      const { Store } = this;
      lazy_render_scene_default(this.Canvas, Store.getState());
    }
    /**
     * ## 渲染游戏场景
     *
     * 每帧调用，根据当前游戏模式（mode）路由到对应场景渲染函数。
     *
     * @returns {void}
     */
    render() {
      const { Store } = this;
      render_scene_default(this.Canvas, Store.getState());
    }
    /**
     * ## 画布自适应
     *
     * 根据窗口尺寸调整棋盘和预览画布的大小。 重新计算 `blockSize` 和 `fontSize` 等全局参数。
     *
     * @returns {void}
     */
    resize() {
      resize_default(this.Canvas);
    }
    // ==================== 动画特效方法 ====================
    /**
     * ## 渲染下一个方块预览
     *
     * 在预览画布中居中绘制下一个方块的形状。
     *
     * @returns {void}
     */
    renderNextPiece() {
      const { Canvas: Canvas2, Store } = this;
      render_next_piece_default(Canvas2, Store.getState());
    }
    /**
     * ## 渲染倒计时特效
     *
     * 在游戏开始前显示 3、2、1 的倒计时数字和缩放动画。
     *
     * @param {object} state - 倒计时动画状态
     * @param {number} state.number - 当前倒计时数字（3/2/1）
     * @param {number} state.scale - 数字缩放比例
     * @returns {void}
     */
    renderCountdown(state) {
      render_countdown_default(this.Canvas, state);
    }
    /**
     * ## 渲染消行闪烁特效
     *
     * 在消除满行时，将待消除的行以白色高亮闪烁。 闪烁由 `ClearLinesAnimation` 控制，本方法只负责绘制。
     *
     * @param {object} state - 消行动画状态（含 lines 数组）
     * @returns {void}
     */
    renderClearLines(state) {
      render_clear_lines_default(this.Canvas, state);
    }
    /**
     * ## 渲染消除得分弹出动画
     *
     * 在消除行的位置绘制上浮渐隐的得分数字。 动画由 `ClearScoreAnimation` 控制，本方法只负责绘制。
     *
     * @param {object} state - 得分动画状态
     * @param {number} state.score - 本次消除得分
     * @param {number} state.y - 消除行号
     * @param {number} state.alpha - 当前透明度
     * @param {number} state.offsetY - Y 轴上浮偏移量
     * @returns {void}
     */
    renderClearScore(state) {
      render_clear_score_default(this.Canvas, state);
    }
    /**
     * ## 渲染升级烟花特效
     *
     * 在玩家升级时显示烟花粒子动画和 "LEVEL UP" 文字。
     *
     * @param {number} level - 升级后的新等级
     * @param {object[]} fireworks - 烟花粒子数组
     * @returns {void}
     */
    renderLevelUp(level, fireworks) {
      render_level_up_default(this.Canvas, level, fireworks);
    }
    /**
     * ## 渲染落地高亮特效
     *
     * 方块落地的瞬间在落地格子上显示半透明白色覆盖。 动画由 `LandingFlashAnimation` 控制，本方法只负责绘制。
     *
     * @param {object} flashData - 高亮数据
     * @param {{ x: number; y: number }[]} flashData.cells - 需要高亮的格子坐标数组
     * @returns {void}
     */
    renderLandingFlash(flashData) {
      render_landing_flash_default(this.Canvas, flashData);
    }
  };
  var canvas_renderer_default = CanvasRenderer;

  // lib/events/router/ui-router.js
  var UIRouter = class extends core_default {
    /**
     * ## 构造函数
     *
     * 创建 UIRouter 实例。 注意：构造函数不会自动订阅事件，需要手动调用 `subscribe()`。
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Game - 游戏主实例
     * @param {object} options.UI - UI 实例，负责实际的渲染工作
     */
    constructor(options) {
      super(options);
    }
    /**
     * ## 订阅 UI 事件
     *
     * 绑定所有 UI 相关的渲染事件。 在游戏初始化或 UI 系统启动时调用。
     *
     * ### 监听的事件分类
     *
     * 1. **HUD 绘制事件**：模式更新、控制者更新、抬头显示更新
     * 2. **画布绘制事件**：窗口大小调整、画布重绘
     * 3. **动画特效事件**：预览方块、倒计时、消行、得分、升级、落地高亮等
     *
     * @returns {void}
     */
    subscribe() {
      const { Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.on(events.UPDATE_MODE, this._onUpdateMode);
      this.on(events.UPDATE_HUD, this._onUpdateHud);
      this.on(events.UPDATE_CONTROLLER, this._onUpdateController);
      this.on(events.RESIZE, this._onResize);
      this.on(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
      this.on(events.RENDER_COUNTDOWN, this._onRenderCountdown);
      this.on(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
      this.on(events.RENDER_CLEAR_SCORE, this._onRenderClearScore);
      this.on(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
      this.on(events.RENDER_LANDING_FLASH, this._onRenderLandingFlash);
    }
    /**
     * ## 取消订阅 UI 事件
     *
     * 移除所有已注册的 UI 事件监听器。 在组件销毁或 UI 系统关闭时调用，避免内存泄漏。
     *
     * @returns {void}
     */
    unsubscribe() {
      const { Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.off(events.UPDATE_MODE, this._onUpdateMode);
      this.off(events.UPDATE_HUD, this._onUpdateHud);
      this.off(events.UPDATE_CONTROLLER, this._onUpdateController);
      this.off(events.RESIZE, this._onResize);
      this.off(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
      this.off(events.RENDER_COUNTDOWN, this._onRenderCountdown);
      this.off(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
      this.off(events.RENDER_CLEAR_SCORE, this._onRenderClearScore);
      this.off(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
      this.off(events.RENDER_LANDING_FLASH, this._onRenderLandingFlash);
    }
    // ==================== 事件处理器（私有） ====================
    /**
     * ## 处理模式更新事件
     *
     * 当游戏模式发生变化时触发（如从主菜单切换到游戏中）。 通知 UI 更新当前显示的模式，切换不同的界面布局。
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {string} payload.mode - 游戏模式
     *
     *   - `main-menu`: 主菜单界面
     *   - `difficulty`: 难度选择界面
     *   - `playing`: 游戏中界面
     *   - `replay`: 回放界面
     *   - `game-over`: 游戏结束界面
     *
     * @returns {void}
     */
    _onUpdateMode = ({ mode }) => {
      const { UI: UI2 } = this;
      UI2.updateMode(mode);
    };
    /**
     * ## 处理控制者更新事件
     *
     * 当游戏控制器类型发生变化时触发（玩家控制 ↔ AI 控制）。 通知 UI 更新控制器显示标识。
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {string} payload.controller - 控制者身份
     *
     *   - `human`: 玩家手动控制
     *   - `ai`: AI 自动控制
     *
     * @returns {void}
     */
    _onUpdateController = ({ controller }) => {
      const { UI: UI2 } = this;
      UI2.updateController(controller);
    };
    /**
     * ## 处理 HUD 更新事件
     *
     * 当游戏数据发生变化时触发（如分数增加、等级提升等）。 通知 UI 刷新抬头显示（Heads-Up Display）的所有数据。
     *
     * ### 更新的数据包括
     *
     * - 当前得分
     * - 历史最高分
     * - 当前等级
     * - 消除行数
     * - 游戏难度
     *
     * @private
     * @returns {void}
     */
    _onUpdateHud = () => {
      const { UI: UI2 } = this;
      UI2.updateHud();
    };
    /**
     * ## 处理画布自适应事件
     *
     * 当浏览器窗口大小发生变化时触发。 通知 UI 重新计算画布尺寸并调整游戏区域的布局。
     *
     * ### 自适应内容
     *
     * - 主游戏画布的尺寸
     * - 预览方块的显示区域
     * - UI 元素的相对位置
     * - 字体大小的缩放
     *
     * @private
     * @returns {void}
     */
    _onResize = () => {
      const { UI: UI2 } = this;
      UI2.resize();
    };
    /**
     * ## 处理渲染预览方块事件
     *
     * 当预览方块发生变化时触发。 通知 UI 重新渲染下一个方块的预览图像。
     *
     * 预览方块通常显示在主游戏区域的右侧或上方， 让玩家提前了解下一个方块的形状。
     *
     * @private
     * @returns {void}
     */
    _onRenderNextPiece = () => {
      const { UI: UI2 } = this;
      UI2.renderNextPiece();
    };
    /**
     * ## 处理渲染倒计时事件
     *
     * 当游戏开始倒计时特效运行时触发。 通知 UI 根据当前倒计时状态渲染数字和视觉效果。
     *
     * ### 倒计时流程
     *
     * - 显示 "3" → "2" → "1"
     * - 每个数字持续约 1 秒
     * - 配合缩放和透明度动画效果
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {object} payload.state - 倒计时动画状态
     * @returns {void}
     */
    _onRenderCountdown = (payload) => {
      const { UI: UI2 } = this;
      const { state } = payload;
      UI2.renderCountdown(state);
    };
    /**
     * ## 处理渲染消行闪烁事件
     *
     * 当消除行特效动画运行时触发。 通知 UI 根据消行动画状态渲染闪烁效果。
     *
     * ### 消行动画效果
     *
     * - 被消除的行会闪烁白色
     * - 闪烁 6 个阶段（显→隐→显→隐→显→隐），共 720ms
     * - 闪烁后行消失，上方行下落
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {object} payload.state - 消行动画状态（含 lines 数组）
     * @returns {void}
     */
    _onRenderClearLines = (payload) => {
      const { UI: UI2 } = this;
      const { state } = payload;
      UI2.renderClearLines(state);
    };
    /**
     * ## 处理渲染消除得分事件
     *
     * 当消除得分动画运行时触发。 通知 UI 在消除行位置绘制上浮渐隐的得分数字。
     *
     * ### 动画效果
     *
     * - 得分数字从消除行位置持续上浮
     * - 透明度从 1 逐渐衰减到 0
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {object} payload.state - 得分动画状态（含 score、y、alpha、offsetY）
     * @returns {void}
     */
    _onRenderClearScore = (payload) => {
      const { UI: UI2 } = this;
      const { state } = payload;
      UI2.renderClearScore(state);
    };
    /**
     * ## 处理渲染升级烟花事件
     *
     * 当等级提升特效动画运行时触发。 通知 UI 根据等级和烟花粒子数组渲染庆祝效果。
     *
     * ### 升级特效效果
     *
     * - 屏幕中央显示 "LEVEL UP!" 文字
     * - 彩色烟花粒子从中心向外扩散
     * - 粒子有重力、速度和生命周期
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {number} payload.level - 新等级
     * @param {object[]} payload.fireworks - 烟花粒子数组
     * @returns {void}
     */
    _onRenderLevelUp = (payload) => {
      const { UI: UI2 } = this;
      const { level, fireworks } = payload;
      UI2.renderLevelUp(level, fireworks);
    };
    /**
     * ## 处理渲染落地高亮事件
     *
     * 方块落地的瞬间在落地格子上显示半透明白色高亮。
     *
     * ### 动画效果
     *
     * - 落地格子上覆盖 60% 透明度白色
     * - 持续 150ms 后消失
     *
     * @private
     * @param {object} payload - 事件参数
     * @param {object} payload.state - 高亮动画状态（含 cells 数组）
     * @returns {void}
     */
    _onRenderLandingFlash = (payload) => {
      const { UI: UI2 } = this;
      const { state } = payload;
      UI2.renderLandingFlash(state);
    };
  };
  var ui_router_default = UIRouter;

  // lib/services/ui/index.js
  var UI = class extends core_default {
    /**
     * ## 构造函数
     *
     * 接收依赖配置，创建 Renderer 和 Router 实例。
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    /**
     * ## 初始化 UI
     *
     * 创建 CanvasRenderer 和 UIRouter 实例。 CanvasRenderer 持有 Canvas 和 Hud，负责所有实际渲染。
     * UIRouter 监听 `ui:*` 事件并路由到 UI 方法。
     *
     * @param {object} options - 配置对象
     * @param {object} options.Game - 游戏主实例
     * @returns {void}
     */
    initialize(options) {
      const { Game: Game2 } = this;
      this.Renderer = new canvas_renderer_default(options);
      this.Router = new ui_router_default({
        UI: this,
        Game: Game2
      });
    }
    // ==================== 状态更新方法 ====================
    /**
     * ## 更新游戏模式标识
     *
     * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。 通过 `ui:<id>:update:mode` 事件触发。
     *
     * @param {string} mode - 游戏模式（main-menu / playing / paused / game-over /
     *   replay）
     * @returns {void}
     */
    updateMode(mode) {
      this.Renderer.updateMode(mode);
    }
    /**
     * ## 更新控制者标识
     *
     * 在 HUD 上显示当前控制者身份（HUMAN 或 AI）。 通过 `ui:<id>:update:controller` 事件触发。
     *
     * @param {string} controller - 当前控制者（'human' 或 'ai'）
     * @returns {void}
     */
    updateController(controller) {
      this.Renderer.updateController(controller);
    }
    /**
     * ## 更新 HUD 显示
     *
     * 从 Store 读取最新状态（分数、行数、等级、最高分）， 更新 HUD 的数字显示。主菜单模式下会先重置 HUD。 通过
     * `ui:<id>:update:hud` 事件触发。
     *
     * @returns {void}
     */
    updateHud() {
      this.Renderer.updateHud();
    }
    /**
     * ## 更新 HUD 动画
     *
     * 每帧调用，驱动 HUD 数字（分数、最高分）的平滑过渡动画。 在游戏主循环 `startGameLoop` 中每帧调用。
     *
     * @returns {void}
     */
    tickHud() {
      this.Renderer.tickHud();
    }
    // ==================== 场景渲染方法 ====================
    /**
     * ## 延迟渲染场景
     *
     * 等待像素字体 "Press Start 2P" 加载完成后渲染主菜单场景。 在 Engine 初始化时调用一次。
     *
     * @returns {void}
     */
    lazyRender() {
      this.Renderer.lazyRender();
    }
    /**
     * ## 渲染游戏场景
     *
     * 每帧调用，绘制棋盘和当前活动方块。 在游戏主循环 `startGameLoop` 中每帧调用。
     *
     * @returns {void}
     */
    render() {
      this.Renderer.render();
    }
    /**
     * ## 画布自适应
     *
     * 根据窗口尺寸调整棋盘大小。 通过 `ui:<id>:resize` 事件触发。
     *
     * @returns {void}
     */
    resize() {
      this.Renderer.resize();
    }
    // ==================== 动画特效方法 ====================
    /**
     * ## 渲染下一个方块预览
     *
     * 在预览画布中绘制下一个方块的形状。 通过 `ui:<id>:render:next:piece` 事件触发。
     *
     * @returns {void}
     */
    renderNextPiece() {
      this.Renderer.renderNextPiece();
    }
    /**
     * ## 渲染倒计时特效
     *
     * 在游戏开始前显示 3、2、1 的倒计时数字和缩放动画。 通过 `ui:<id>:render:countdown` 事件触发。
     *
     * @param {object} state - 倒计时动画状态
     * @param {number} state.number - 当前倒计时数字（3/2/1）
     * @param {number} state.scale - 数字缩放比例
     * @returns {void}
     */
    renderCountdown(state) {
      this.Renderer.renderCountdown(state);
    }
    /**
     * ## 渲染消行闪烁特效
     *
     * 在消除满行时，将待消除的行以白色高亮闪烁 3 次。 通过 `ui:<id>:render:clear` 事件触发。
     *
     * @param {object} state - 消行动画状态
     * @param {{ y: number; alpha: number }[]} state.lines - 待消除行的动画数据
     * @returns {void}
     */
    renderClearLines(state) {
      this.Renderer.renderClearLines(state);
    }
    renderClearScore(state) {
      this.Renderer.renderClearScore(state);
    }
    /**
     * ## 渲染升级烟花特效
     *
     * 在玩家升级时显示烟花粒子动画和 "LEVEL UP" 文字。 通过 `ui:<id>:render:level:up` 事件触发。
     *
     * @param {number} level - 升级后的新等级
     * @param {object[]} fireworks - 烟花粒子数组
     * @returns {void}
     */
    renderLevelUp(level, fireworks) {
      this.Renderer.renderLevelUp(level, fireworks);
    }
    renderLandingFlash(flashData) {
      this.Renderer.renderLandingFlash(flashData);
    }
    // ==================== 事件订阅管理 ====================
    /**
     * ## 订阅 UI 事件
     *
     * 委托给 UIRouter 绑定所有 `ui:*` 事件监听。 在 `Game.subscribe()` 中调用。
     *
     * @returns {void}
     */
    subscribe() {
      this.Router.subscribe();
    }
    /**
     * ## 取消订阅 UI 事件
     *
     * 委托给 UIRouter 解绑所有 `ui:*` 事件监听。 在 `Game.unsubscribe()` 中调用。
     *
     * @returns {void}
     */
    unsubscribe() {
      this.Router.unsubscribe();
    }
  };
  var ui_default = UI;

  // lib/services/input/keyboard-controller.js
  var KEYBOARDS_ACTION_MAP = {
    // ========== 方块操作 ==========
    arrowleft: "MOVE_LEFT",
    // 向左移动方块
    arrowright: "MOVE_RIGHT",
    // 向右移动方块
    arrowdown: "MOVE_DOWN",
    // 向下加速移动
    arrowup: "ROTATE",
    // 旋转方块
    " ": "DROP",
    // 空格键：方块直接落底
    // ========== 游戏控制 ==========
    s: "SWITCH_CONTROLLER",
    // 切换控制器（玩家/AI）
    m: "TOGGLE_MUSIC",
    // 切换音乐开关
    p: "TOGGLE_PAUSED",
    // 暂停/继续游戏
    r: "RESTART",
    // 重新开始游戏
    q: "QUIT",
    // 退出游戏
    // ========== 关卡选择 ==========
    1: "LEVEL_ONE",
    // 第1关
    2: "LEVEL_TWO",
    // 第2关
    3: "LEVEL_THREE",
    // 第3关
    4: "LEVEL_FOUR",
    // 第4关
    5: "LEVEL_FIVE",
    // 第5关
    6: "LEVEL_SIX",
    // 第6关
    7: "LEVEL_SEVEN",
    // 第7关
    8: "LEVEL_EIGHT",
    // 第8关
    9: "LEVEL_NINE",
    // 第9关
    t: "LEVEL_TEN",
    // T键：第10关
    // ========== 难度选择 ==========
    e: "EASY",
    // 简单难度
    n: "NORMAL",
    // 普通难度
    h: "HARD",
    // 困难难度
    x: "EXPERT",
    // 专家难度
    // ========== 界面导航 ==========
    b: "BACK",
    // 返回上一级
    enter: "CONFIRM"
    // 确认操作
  };
  var resolveKeyboardAction = (key) => {
    if (!key) {
      return;
    }
    const normalizedKey = key.toLowerCase();
    return KEYBOARDS_ACTION_MAP[normalizedKey];
  };
  var KeyboardController = class extends core_default {
    /**
     * ## 构造函数
     *
     * 创建键盘控制器实例。 注意：构造函数不会自动绑定事件，需要手动调用 `addEventListeners()`。
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Game - 游戏主实例
     * @param {object} options.Store - 游戏状态存储
     */
    constructor(options) {
      super(options);
    }
    /**
     * ## 绑定游戏中键盘操作相关的事件
     *
     * 注册全局事件监听器：
     *
     * - `resize`：监听窗口大小变化，用于调整游戏画布尺寸
     * - `keydown`：监听键盘按键，处理游戏操作输入
     *
     * 使用箭头函数绑定方法，确保 `this` 指向当前实例。
     *
     * @example
     *   const keyboard = new KeyboardController(options);
     *   keyboard.addEventListeners(); // 开始监听键盘输入
     *
     * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
     */
    addEventListeners() {
      globalThis.addEventListener("resize", this._onResize);
      document.addEventListener("keydown", this._onKeydown);
      return this;
    }
    /**
     * ## 解除游戏中键盘操作相关的事件绑定
     *
     * 移除之前注册的所有事件监听器。 在组件销毁或不需要键盘控制时调用，避免内存泄漏。
     *
     * @example
     *   keyboard.removeEventListeners(); // 停止监听键盘输入
     *
     * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
     */
    removeEventListeners() {
      globalThis.removeEventListener("resize", this._onResize);
      document.removeEventListener("keydown", this._onKeydown);
      return this;
    }
    /**
     * ## 判断按键是否被屏蔽
     *
     * 根据当前游戏状态决定是否应该响应该按键。 这是输入系统的核心安全机制，防止在不适当时刻执行无效操作。
     *
     * 屏蔽场景详解：
     *
     * 1. **无效映射**：按键不在映射表中，无法转换为游戏动作
     * 2. **回放限制**：回放模式下只允许按确认键（Enter），防止干扰回放过程
     * 3. **AI 限制**：AI 控制时，玩家只能按 S 键切换控制器，其他操作由 AI 负责
     *
     * @private
     * @param {string} key - 按键名称（已小写化）
     * @returns {boolean} - 按键被屏蔽返回 true，否则返回 false
     */
    _isBlocked(key) {
      const { Store } = this;
      const action = resolveKeyboardAction(key);
      const mode = Store.getMode();
      const controller = Store.getController();
      return !action || // 场景1：无效按键
      mode === "replay" && key !== "enter" || // 场景2：回放模式限制
      controller === "ai" && // 场景3：AI 控制限制
      mode === "playing" && !game_default.AI_ALLOWED_ACTIONS.includes(action);
    }
    /**
     * ## resize 事件的功能函数
     *
     * 当浏览器窗口大小改变时触发。 通过 EventBus 发送 RESIZE 事件，通知游戏画布重新计算尺寸和布局。
     *
     * @private
     * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
     */
    _onResize = () => {
      const { Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.emit(events.RESIZE);
      return this;
    };
    /**
     * ## keydown 事件的功能函数
     *
     * 当用户按下键盘按键时触发。 执行流程：
     *
     * 1. 获取并规范化按键名称
     * 2. 将按键映射为游戏动作指令
     * 3. 检查按键是否应该被屏蔽
     * 4. 通过 EventBus 派发输入事件
     *
     * @private
     * @param {Event} e - 键盘事件对象
     * @param {string} e.key - 按下的键名（如 'ArrowLeft'、' '、'a'）
     * @returns {KeyboardController} - 返回 KeyboardController 对象，可链式调用
     */
    _onKeydown = (e) => {
      const { Game: Game2 } = this;
      const key = e.key?.toLowerCase();
      if (!key) {
        return this;
      }
      const action = resolveKeyboardAction(key);
      if (this._isBlocked(key)) {
        return this;
      }
      this.emit("dispatch:input", {
        device: "keyboard",
        // 输入设备类型
        action,
        // 游戏动作指令
        payload: {
          Game: Game2
          // 传递游戏实例，供后续处理使用
        }
      });
      return this;
    };
  };
  var keyboard_controller_default = KeyboardController;

  // lib/services/input/gamepad-controller.js
  var GAMEPAD_ACTION_MAP = {
    // 基础控制按键
    A: "TOGGLE_MUSIC",
    // 切换音乐（游戏中）
    B: "DROP",
    // 方块直接落底
    X: "RESTART",
    // 重新开始游戏
    Y: "TOGGLE_PAUSE",
    // 暂停/继续游戏
    START: "CONFIRM",
    // 确认操作
    BACK: "QUIT",
    // 退出游戏
    // 方向键（DPad）
    DPAD_LEFT: "MOVE_LEFT",
    // 向左移动
    DPAD_RIGHT: "MOVE_RIGHT",
    // 向右移动
    DPAD_DOWN: "MOVE_DOWN",
    // 向下加速
    DPAD_UP: "ROTATE"
    // 旋转方块
  };
  var LEVELS = [
    "ONE",
    // 第 1 关
    "TWO",
    // 第 2 关
    "THREE",
    // 第 3 关
    "FOUR",
    // 第 4 关
    "FIX",
    // 第 5 关（注意这里是 FIX 不是 FIVE，可能是拼写约定）
    "SIX",
    // 第 6 关
    "SEVEN",
    // 第 7 关
    "EIGHT",
    // 第 8 关
    "NINE",
    // 第 9 关
    "TEN"
    // 第 10 关
  ];
  var STANDARD_BTN_MAP = {
    A: 0,
    // A 键 / 交叉键
    B: 1,
    // B 键 / 圆圈键
    X: 2,
    // X 键 / 方块键
    Y: 3,
    // Y 键 / 三角键
    LB: 4,
    // 左肩键
    RB: 5,
    // 右肩键
    LT: 6,
    // 左扳机
    RT: 7,
    // 右扳机
    BACK: 8,
    // 返回键
    START: 9,
    // 开始键
    DPAD_UP: 12,
    // 方向键上
    DPAD_DOWN: 13,
    // 方向键下
    DPAD_LEFT: 14,
    // 方向键左
    DPAD_RIGHT: 15
    // 方向键右
  };
  var BETOP_20BC_1263_BTN_MAP = {
    A: 2,
    // A 键映射到索引 2
    B: 1,
    // B 键映射到索引 1
    X: 3,
    // X 键映射到索引 3
    Y: 0,
    // Y 键映射到索引 0
    LB: 4,
    // 左肩键
    RB: 5,
    // 右肩键
    LT: 6,
    // 左扳机
    RT: 7,
    // 右扳机
    BACK: 8,
    // 返回键
    START: 9
    // 开始键
  };
  var GamepadController = class extends core_default {
    /**
     * ## 构造函数
     *
     * 初始化手柄控制器的所有内部状态。
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Game - 游戏主实例
     * @param {object} options.Store - 游戏状态存储
     */
    constructor(options) {
      super(options);
      this.activeGamepadIndex = null;
      this.DEAD_ZONE = 0.15;
      this.DPAD_THRESHOLD = 0.5;
      this.buttonStates = {};
      this.axisStates = {};
      this._eventsBound = false;
      this.DPAD_COOLDOWN = 180;
      this.lastDpadTime = 0;
      this.curBtnMap = STANDARD_BTN_MAP;
      this.dpadAxisState = {
        up: false,
        down: false,
        left: false,
        right: false
      };
      this.AXIS_MAP = {
        LEFT_STICK_X: 0,
        // 左摇杆 X 轴
        LEFT_STICK_Y: 1
        // 左摇杆 Y 轴
      };
    }
    /**
     * ## 每帧调用
     *
     * 执行流程：
     *
     * 1. 刷新 Gamepad snapshot（获取最新的手柄状态）
     * 2. 如果存在 active gamepad
     * 3. 收集所有输入并派发指令
     *
     * @param {number} now - 当前时间的时间戳（毫秒）
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    update(now) {
      this._refreshGamepadState();
      if (!this.activeGamepad) {
        return this;
      }
      this._collectCommands(now);
      return this;
    }
    /**
     * ## 绑定 Gamepad 连接事件
     *
     * 注册游戏手柄的连接和断开事件监听器。 支持链式调用，可多次调用但只会绑定一次。
     *
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    addEventListeners() {
      if (this._eventsBound) {
        return this;
      }
      globalThis.addEventListener("gamepadconnected", this._onConnect);
      globalThis.addEventListener("gamepaddisconnected", this._onDisconnect);
      this._eventsBound = true;
      return this;
    }
    /**
     * ## 销毁事件绑定
     *
     * 移除手柄事件的监听器，清理内部状态。 在组件卸载或不需要手柄控制时调用。
     *
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    removeEventListeners() {
      globalThis.removeEventListener("gamepadconnected", this._onConnect);
      globalThis.removeEventListener("gamepaddisconnected", this._onDisconnect);
      this._eventsBound = false;
      return this;
    }
    /**
     * ## 手柄连接事件处理
     *
     * - 设置 activeGamepad 为当前连接的手柄
     * - 自动识别 BETOP 并切换 mapping
     * - 发送手柄连接状态更新事件
     *
     * @private
     * @param {object} e - 事件对象
     * @param {Gamepad} e.gamepad - 连接的手柄对象
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _onConnect = (e) => {
      const pad = e.gamepad;
      if (this.activeGamepadIndex !== null) {
        return this;
      }
      this.activeGamepadIndex = pad.index;
      this.curBtnMap = this._isBetop(pad.id) ? BETOP_20BC_1263_BTN_MAP : STANDARD_BTN_MAP;
      const { Game: Game2 } = this;
      const events = GameEvents(Game2.id);
      this.emit(events.UPDATE_GAMEPAD_CONNECTED, {
        connected: true
      });
      return this;
    };
    /**
     * ## 手柄断开事件处理
     *
     * - 清空激活手柄的状态
     * - 重置所有防抖状态
     *
     * @private
     * @param {object} e - 事件对象
     * @param {Gamepad} e.gamepad - 断开的手柄对象
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _onDisconnect = (e) => {
      if (this.activeGamepadIndex !== e.gamepad.index) {
        return this;
      }
      this.activeGamepadIndex = null;
      this.buttonStates = {};
      this.axisStates = {};
      const { Game: Game2 } = this;
      const events = GameEvents(Game2.id);
      this.emit(events.UPDATE_GAMEPAD_CONNECTED, {
        connected: false
      });
      return this;
    };
    /**
     * ## 判断是否为 BETOP（北通）手柄
     *
     * 通过手柄 ID 字符串进行识别。 北通特定型号 20bc:1263 需要特殊处理。
     *
     * @param {string} id - 手柄 id 字符串（如 'Xbox 360 Controller'）
     * @returns {boolean} - 是北通手柄返回 true，否则返回 false
     */
    _isBetop(id) {
      return id.includes("20bc") && id.includes("1263");
    }
    /**
     * ## 刷新 Gamepad 状态
     *
     * - 必须每帧调用 navigator.getGamepads()
     * - 因为 Gamepad 对象是 snapshot，不是实时引用
     * - 如果没有激活手柄，自动选择第一个可用的手柄
     *
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _refreshGamepadState() {
      const pads = navigator.getGamepads?.() || [];
      if (this.activeGamepadIndex === null) {
        const firstPad = Array.from(pads).find(Boolean);
        if (firstPad) {
          this.activeGamepadIndex = firstPad.index;
          this.curBtnMap = this._isBetop(firstPad.id) ? BETOP_20BC_1263_BTN_MAP : STANDARD_BTN_MAP;
        }
      }
      this.activeGamepad = this.activeGamepadIndex === null ? null : pads[this.activeGamepadIndex];
      return this;
    }
    /**
     * ## 根据游戏当前模式更新按键的响应动作
     *
     * 不同游戏模式下，同一个手柄按键可以有不同的功能。 例如：在难度选择界面，ABXY 键用于选择难度。
     *
     * @private
     * @param {string} mode - 游戏模式（playing、replay、main-menu、difficulty 等）
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _updateActionMap(mode) {
      switch (mode) {
        case "difficulty": {
          GAMEPAD_ACTION_MAP.A = "EASY";
          GAMEPAD_ACTION_MAP.B = "NORMAL";
          GAMEPAD_ACTION_MAP.Y = "HARD";
          GAMEPAD_ACTION_MAP.X = "EXPERT";
          GAMEPAD_ACTION_MAP.BACK = "BACK";
          break;
        }
        case "playing": {
          GAMEPAD_ACTION_MAP.A = "TOGGLE_MUSIC";
          GAMEPAD_ACTION_MAP.B = "DROP";
          GAMEPAD_ACTION_MAP.X = "RESTART";
          GAMEPAD_ACTION_MAP.Y = "TOGGLE_PAUSE";
          GAMEPAD_ACTION_MAP.BACK = "QUIT";
          GAMEPAD_ACTION_MAP.RB = "SWITCH_CONTROLLER";
          break;
        }
      }
      return this;
    }
    /**
     * ## 解析手柄按钮的响应动作名称
     *
     * 根据游戏模式、当前等级等信息，确定按钮按下后应该触发的具体动作。 特别处理主菜单下的方向键（用于选择关卡）。
     *
     * @private
     * @param {string} action - 原始按键执行动作名称
     * @param {string} btnName - 按钮名称（如 'DPAD_UP'）
     * @param {boolean} isDPad - 是否为 DPad 方向键
     * @param {string} mode - 游戏当前模式
     * @param {string} level - 游戏当前等级（1-10）
     * @param {number} now - 当前时间的时间戳（毫秒）
     * @returns {string} - 解析后的按键执行动作名称，空字符串表示不触发动作
     */
    _resolveAction(action, btnName, isDPad, mode, level, now) {
      if (!isDPad || mode !== "main-menu") {
        return action;
      }
      if (now - this.lastDpadTime < this.DPAD_COOLDOWN) {
        return "";
      }
      this.lastDpadTime = now;
      if (btnName === "DPAD_UP") {
        return this._getMoveUpAction(mode, level);
      }
      if (btnName === "DPAD_DOWN") {
        return this._getMoveDownAction(mode, level);
      }
      return action;
    }
    /**
     * ## 处理标准游戏手柄的按钮响应
     *
     * 遍历所有按钮映射，检查哪些按钮被按下，并派发相应的指令。
     *
     * @private
     * @param {object} pad - Gamepad 对象
     * @param {string} mode - 游戏当前模式
     * @param {string} level - 游戏当前级别
     * @param {number} now - 当前时间的时间戳
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _handleStandardButtons(pad, mode, level, now) {
      const isBetop = this._isBetop(pad.id);
      const { Game: Game2, Store } = this;
      const controller = Store.getController();
      for (const [btnName, action] of Object.entries(GAMEPAD_ACTION_MAP)) {
        const isBlocked = !action || (mode === "replay" || mode === "game-over") && btnName !== "START" || controller === "ai" && mode === "playing" && !game_default.AI_ALLOWED_ACTIONS.includes(action);
        const isDPad = btnName.startsWith("DPAD_");
        if (!this._isPressed(btnName)) {
          continue;
        }
        if (isBetop && isDPad) {
          continue;
        }
        if (isBlocked) {
          return this;
        }
        const finalAction = this._resolveAction(
          action,
          btnName,
          isDPad,
          mode,
          level,
          now
        );
        if (!finalAction) {
          continue;
        }
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action: finalAction,
          payload: { Game: Game2 }
        });
      }
      return this;
    }
    /**
     * ## 收集所有输入
     *
     * 处理按钮、摇杆、方向键等所有输入源。 转换为统一的 dispatchInput 指令。
     *
     * @private
     * @param {number} now - 当前时间的时间戳（毫秒）
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _collectCommands(now) {
      const { Store } = this;
      const state = Store.getState();
      const { mode, level } = state;
      const pad = this.activeGamepad;
      if (!pad) {
        return this;
      }
      this._updateActionMap(mode);
      this._handleStandardButtons(pad, mode, level, now);
      if (mode === "replay" || mode === "game-over") {
        return this;
      }
      const x = this._getAxis(this.AXIS_MAP.LEFT_STICK_X);
      const y = this._getAxis(this.AXIS_MAP.LEFT_STICK_Y);
      this._handleStickMove(x, y);
      if (this._isBetop(pad.id)) {
        const dpadVal = pad.axes[9] ?? 0;
        this._handleBetopDpad(dpadVal, state);
      }
      return this;
    }
    /**
     * ## 开始轴动作（触发一次）
     *
     * 仅在未触发时触发 dispatch，防止重复触发。 用于摇杆移动等连续输入场景。
     *
     * @param {string} action - 动作名称（如 'MOVE_LEFT'）
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _startAxisAction(action) {
      if (this.axisStates[action]) {
        return this;
      }
      const { Game: Game2 } = this;
      this.axisStates[action] = true;
      this.emit(`dispatch:input`, {
        device: "gamepad",
        action,
        payload: { Game: Game2 }
      });
      return this;
    }
    /**
     * ## 停止轴动作（重置状态）
     *
     * 当摇杆回到死区范围内时调用。
     *
     * @param {string} action - 动作名称
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _stopAxisAction(action) {
      this.axisStates[action] = false;
      return this;
    }
    /**
     * ## 处理摇杆向上移动
     *
     * @private
     * @param {number} y - Y轴偏移值（-1 到 1）
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleStickUp(y) {
      if (y < -this.DPAD_THRESHOLD) {
        this._startAxisAction("ROTATE");
      } else {
        this._stopAxisAction("ROTATE");
      }
      return this;
    }
    /**
     * ## 处理摇杆向下移动
     *
     * @private
     * @param {number} y - Y轴偏移值（-1 到 1）
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleStickDown(y) {
      if (y > this.DPAD_THRESHOLD) {
        this._startAxisAction("MOVE_DOWN");
      } else {
        this._stopAxisAction("MOVE_DOWN");
      }
      return this;
    }
    /**
     * ## 处理摇杆向左移动
     *
     * @private
     * @param {number} x - X轴偏移值（-1 到 1）
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleStickLeft(x) {
      if (x < -this.DPAD_THRESHOLD) {
        this._startAxisAction("MOVE_LEFT");
      } else {
        this._stopAxisAction("MOVE_LEFT");
      }
      return this;
    }
    /**
     * ## 处理摇杆向右移动
     *
     * @private
     * @param {number} x - X轴偏移值（-1 到 1）
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleStickRight(x) {
      if (x > this.DPAD_THRESHOLD) {
        this._startAxisAction("MOVE_RIGHT");
      } else {
        this._stopAxisAction("MOVE_RIGHT");
      }
      return this;
    }
    /**
     * ## 摇杆移动处理（带防抖）
     *
     * 处理左摇杆的四个方向移动，并触发相应的游戏动作。
     *
     * @param {number} x - X轴偏移值（-1 到 1），负值为左，正值为右
     * @param {number} y - Y轴偏移值（-1 到 1），负值为上，正值为下
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _handleStickMove(x, y) {
      this._handleStickUp(y);
      this._handleStickDown(y);
      this._handleStickLeft(x);
      this._handleStickRight(x);
      return this;
    }
    /**
     * ## 获取向上移动的动作
     *
     * 在主菜单模式下用于增加关卡等级， 在游戏模式下用于旋转方块。
     *
     * @private
     * @param {string} mode - 游戏模式
     * @param {string | number} level - 当前关卡等级
     * @returns {string} - 动作名称
     */
    _getMoveUpAction(mode, level) {
      const { Game: Game2 } = this;
      const events = GameEvents(Game2.id);
      let action;
      if (mode === "main-menu") {
        let newLevel = Number(level) + 1;
        if (newLevel >= 10) {
          newLevel = 10;
        }
        this.emit(events.UPDATE_LEVEL, { level: newLevel });
        action = `LEVEL_${LEVELS[newLevel - 1]}`;
      } else {
        action = "ROTATE";
      }
      return action;
    }
    /**
     * ## 获取向下移动的动作
     *
     * 在主菜单模式下用于减少关卡等级， 在游戏模式下用于加速下落。
     *
     * @private
     * @param {string} mode - 游戏模式
     * @param {string | number} level - 当前关卡等级
     * @returns {string} - 动作名称
     */
    _getMoveDownAction(mode, level) {
      let action;
      const { Game: Game2 } = this;
      const events = GameEvents(Game2.id);
      if (mode === "main-menu") {
        let newLevel = Number(level) - 1;
        if (newLevel <= 1) {
          newLevel = 1;
        }
        this.emit(events.UPDATE_LEVEL, { level: newLevel });
        action = `LEVEL_${LEVELS[newLevel - 1]}`;
      } else {
        action = "MOVE_DOWN";
      }
      return action;
    }
    /**
     * ## 处理北通手柄方向键上
     *
     * @private
     * @param {string} mode - 游戏模式
     * @param {string | number} level - 当前等级
     * @param {object} st - 方向键状态对象
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleBetopDpadUp(mode, level, st) {
      const action = this._getMoveUpAction(mode, level);
      const { Game: Game2 } = this;
      if (!st.up) {
        st.up = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action,
          payload: { Game: Game2 }
        });
      }
      st.down = st.left = st.right = false;
      return this;
    }
    /**
     * ## 处理北通手柄方向键下
     *
     * @private
     * @param {string} mode - 游戏模式
     * @param {string | number} level - 当前等级
     * @param {object} st - 方向键状态对象
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleBetopDpadDown(mode, level, st) {
      const action = this._getMoveDownAction(mode, level);
      const { Game: Game2 } = this;
      if (!st.down) {
        st.down = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action,
          payload: { Game: Game2 }
        });
      }
      st.up = st.left = st.right = false;
      return this;
    }
    /**
     * ## 处理北通手柄方向键左
     *
     * @private
     * @param {object} st - 方向键状态对象
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleBetopDpadLeft(st) {
      const { Game: Game2 } = this;
      if (!st.left) {
        st.left = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action: "MOVE_LEFT",
          payload: { Game: Game2 }
        });
      }
      st.up = st.down = st.right = false;
      return this;
    }
    /**
     * ## 处理北通手柄方向键右
     *
     * @private
     * @param {object} st - 方向键状态对象
     * @returns {GamepadController} - 返回自身，支持链式调用
     */
    _handleBetopDpadRight(st) {
      const { Game: Game2 } = this;
      if (!st.right) {
        st.right = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action: "MOVE_RIGHT",
          payload: { Game: Game2 }
        });
      }
      st.up = st.down = st.left = false;
      return this;
    }
    /**
     * ## BETOP DPAD（axis9）解析
     *
     * 北通手柄的方向键通过 axis[9] 传递，不同方向对应固定浮点值。 根据这些特定值判断用户按下了哪个方向键。
     *
     * @param {number} val - Axis[9] 的原始值
     * @param {object} state - 游戏状态信息（包含 mode 和 level）
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _handleBetopDpad(val, state) {
      const { mode, level } = state;
      const v = val.toFixed(5);
      const st = this.dpadAxisState;
      const now = Date.now();
      if (mode === "main-menu" && now - this.lastDpadTime < this.DPAD_COOLDOWN) {
        return this;
      }
      switch (v) {
        // 上方向
        case "-1.00000": {
          this._handleBetopDpadUp(mode, level, st);
          this.lastDpadTime = now;
          break;
        }
        // 下方向
        case "0.14286": {
          this._handleBetopDpadDown(mode, level, st);
          this.lastDpadTime = now;
          break;
        }
        // 左方向
        case "0.71429": {
          this._handleBetopDpadLeft(st);
          this.lastDpadTime = now;
          break;
        }
        // 右方向
        case "-0.42857": {
          this._handleBetopDpadRight(st);
          this.lastDpadTime = now;
          break;
        }
        // 松开手柄，重置所有方向状态
        default: {
          st.up = st.down = st.left = st.right = false;
          break;
        }
      }
      return this;
    }
    /**
     * ## 获取轴值（带 dead zone）
     *
     * 读取指定轴的数值，并应用死区过滤。 小于死区的值视为 0，避免摇杆漂移。
     *
     * @param {number} index - 轴在 axes 数组中的索引
     * @returns {number} - 经过死区过滤后的轴值（范围 -1 到 1）
     */
    _getAxis(index) {
      if (!this.activeGamepad) {
        return 0;
      }
      const val = this.activeGamepad.axes[index] ?? 0;
      return Math.abs(val) > this.DEAD_ZONE ? val : 0;
    }
    /**
     * ## 判断按钮是否“刚按下”（防抖）
     *
     * 检测按钮是否刚被按下（边缘触发），而不是持续按下的状态。 配合 buttonStates 实现防抖，防止长按时重复触发。
     *
     * @param {string} btnName - 按钮名称（如 'A'、'START'）
     * @returns {boolean} - 按钮刚被按下返回 true，否则返回 false
     */
    _isPressed(btnName) {
      const idx = this.curBtnMap[btnName];
      if (idx === void 0 || !this.activeGamepad) {
        return false;
      }
      const btn = this.activeGamepad.buttons[idx];
      if (!btn) {
        return false;
      }
      const pressed = btn.value > 0.5;
      if (pressed && !this.buttonStates[btnName]) {
        this.buttonStates[btnName] = true;
        return true;
      }
      if (!pressed) {
        this.buttonStates[btnName] = false;
      }
      return false;
    }
  };
  var gamepad_controller_default = GamepadController;

  // lib/ai/core/ai-difficulty.js
  var AIDifficulty = {
    /**
     * ## 简单难度（EASY）
     *
     * - 只看当前方块（lookahead=1），不做深层推演
     * - 25% 概率随机选择非最优解，模拟人类失误
     * - 评估权重较轻，允许堆高和留空洞
     * - 决策延迟 580ms，给玩家充足的操作时间
     *
     * ### 权重设计
     *
     * | 指标          | 权重  | 说明                                     |
     * | ------------- | ----- | ---------------------------------------- |
     * | holes         | -0.45 | 轻度惩罚空洞，偶尔漏填无妨               |
     * | height        | -0.35 | 允许堆高，不主动压高度                   |
     * | bumpiness     | -0.12 | 轻微惩罚不平整                           |
     * | completeLines | 2     | 消 1 行奖 2 分，4 行奖 32 分，不刻意追求 |
     */
    EASY: {
      /** 前瞻深度：只看当前方块 */
      lookahead: 1,
      /** 随机噪声：25% 概率随机选择 */
      noise: 0.25,
      /** 评估权重（轻惩罚） */
      weights: {
        holes: -0.45,
        height: -0.35,
        bumpiness: -0.12,
        completeLines: 2
      },
      /** 决策延迟（毫秒） */
      delay: 580
    },
    /**
     * ## 普通难度（NORMAL）
     *
     * - 多看一步（lookahead=2），有一定前瞻能力
     * - 10% 概率随机选择，偶尔失误
     * - 评估权重适中，开始重视空洞
     * - 决策延迟 480ms，中等响应速度
     *
     * ### 权重设计
     *
     * | 指标          | 权重  | 说明                                   |
     * | ------------- | ----- | -------------------------------------- |
     * | holes         | -0.75 | 明显惩罚空洞，减少留洞                 |
     * | height        | -0.45 | 适度控制高度                           |
     * | bumpiness     | -0.18 | 惩罚不平整，保持表面平整               |
     * | completeLines | 3     | 消 1 行奖 3 分，4 行奖 48 分，鼓励消行 |
     */
    NORMAL: {
      /** 前瞻深度：多看一步 */
      lookahead: 2,
      /** 随机噪声：10% 概率随机选择 */
      noise: 0.1,
      /** 评估权重（中等惩罚） */
      weights: {
        holes: -0.75,
        height: -0.45,
        bumpiness: -0.18,
        completeLines: 3
      },
      /** 决策延迟（毫秒） */
      delay: 480
    },
    /**
     * ## 困难难度（HARD）
     *
     * - 多看两步（lookahead=3），深度推演
     * - Beam Search 剪枝宽度 5，平衡性能与智能
     * - 0% 噪声，始终选择最优解，不犯错
     * - 评估权重严格，强力惩罚空洞和高度
     * - 决策延迟 280ms，较快响应
     *
     * ### 权重设计
     *
     * | 指标          | 权重  | 说明                                          |
     * | ------------- | ----- | --------------------------------------------- |
     * | holes         | -0.9  | 重罚空洞，几乎不留洞                          |
     * | height        | -0.95 | **强力压高度**，AI 极度恐高                   |
     * | bumpiness     | -0.2  | 保持表面平整                                  |
     * | completeLines | 6     | 消 1 行奖 6 分，4 行奖 96 分，高度追求 Tetris |
     *
     * 高度惩罚 -0.95 配合消行奖励 6（平方后 4 行 = 96 分）， AI 会为了凑满行而主动压低堆叠，同时追求一次性消除多行。
     */
    HARD: {
      /** 前瞻深度：多看两步 */
      lookahead: 3,
      /** Beam Search 剪枝宽度 */
      beam: 5,
      /** 随机噪声：不犯错 */
      noise: 0,
      /** 评估权重（重惩罚） */
      weights: {
        holes: -0.9,
        height: -0.95,
        bumpiness: -0.2,
        completeLines: 6
      },
      /** 决策延迟（毫秒） */
      delay: 280
    },
    /**
     * ## 专家难度（EXPERT）
     *
     * - 和困难难度相同的推理能力（lookahead=3, noise=0）
     * - Beam Search 剪枝宽度 3，保证流畅性
     * - 评估权重最严格，对高度和空洞零容忍
     * - 决策延迟仅为 150ms，给玩家极短的反应窗口
     * - 接近游戏的最低下落速度（120ms），但保留 30ms 呼吸感
     *
     * ### 权重设计
     *
     * | 指标          | 权重  | 说明                                           |
     * | ------------- | ----- | ---------------------------------------------- |
     * | holes         | -1.0  | 最重空洞惩罚，绝不留洞                         |
     * | height        | -1.25 | **极限压高度**，AI 视堆高为最大威胁            |
     * | bumpiness     | -0.2  | 保持表面平整                                   |
     * | completeLines | 7     | 消 1 行奖 7 分，4 行奖 112 分，极限追求 Tetris |
     *
     * 高度惩罚 -1.25 是四个难度中的最大值， 配合消行奖励 7（平方后 4 行 = 112 分）， AI 在极度恐高的同时会疯狂追求一次性多行消除。
     */
    EXPERT: {
      /** 前瞻深度：多看两步 */
      lookahead: 3,
      /** 随机噪声：不犯错 */
      noise: 0,
      /** Beam Search 剪枝宽度 */
      beam: 3,
      /** 评估权重（最重惩罚） */
      weights: {
        holes: -1,
        height: -1.25,
        bumpiness: -0.2,
        completeLines: 8
      },
      /** 决策延迟（毫秒）：极快，保留 30ms 呼吸感 */
      delay: 150
    }
  };
  var ai_difficulty_default = AIDifficulty;

  // lib/ai/snapshot/create-snapshot.js
  var createSnapshot = (state) => structuredClone({
    // 控制者身份
    controller: state.controller,
    // 棋盘状态
    board: state.board,
    // 游戏进度
    level: state.level,
    score: state.score,
    lines: state.lines,
    // 原始方块对象（保留完整信息，方便后续扩展）
    cur: state.curr,
    next: state.next,
    // AI 决策专用的方块信息：从 state.curr 和 state.cx/cy 中提取并结构化
    piece: state.curr ? {
      shape: state.curr.shape,
      position: {
        x: state.cx,
        y: state.cy
      }
    } : null,
    // 游戏模式
    mode: state.mode
  });
  var create_snapshot_default = createSnapshot;

  // lib/ai/simulator/rotate-matrix.js
  var rotateMatrix = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const next = Array.from(
      { length: cols },
      () => Array.from({ length: rows }).fill(0)
    );
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        next[x][rows - y - 1] = matrix[y][x];
      }
    }
    return next;
  };
  var rotate_matrix_default = rotateMatrix;

  // lib/ai/utils/collision.js
  var collision = (board, shape, offsetX, offsetY) => {
    for (let y = 0; y < shape.length; y += 1) {
      for (let x = 0; x < shape[y].length; x += 1) {
        if (!shape[y][x]) {
          continue;
        }
        const bx = offsetX + x;
        const by = offsetY + y;
        if (bx < 0 || bx >= board[0].length || by >= board.length) {
          return true;
        }
        if (by >= 0 && board[by][bx]) {
          return true;
        }
      }
    }
    return false;
  };
  var collision_default = collision;

  // lib/ai/utils/clone-board.js
  var cloneBoard = (board) => board.map((row) => [...row]);
  var clone_board_default = cloneBoard;

  // lib/ai/simulator/simulate-placement.js
  var simulatePlacement = (board, shape, offsetX, offsetY) => {
    const next = clone_board_default(board);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        if (!shape[y][x]) continue;
        const bx = x + offsetX;
        const by = y + offsetY;
        if (by >= 0 && by < next.length) {
          next[by][bx] = 1;
        }
      }
    }
    return next;
  };
  var simulate_placement_default = simulatePlacement;

  // lib/ai/simulator/simulate-drop.js
  var simulateDrop = (board, shape, startX) => {
    let y = 0;
    while (!collision_default(board, shape, startX, y + 1)) {
      y += 1;
    }
    const nextBoard = simulate_placement_default(board, shape, startX, y);
    return {
      board: nextBoard,
      y
    };
  };
  var simulate_drop_default = simulateDrop;

  // lib/ai/planner/generate-moves.js
  var getValidXPositions = (board, shape) => {
    const boardWidth = board[0].length;
    const shapeWidth = shape[0].length;
    const maxX = boardWidth - shapeWidth;
    const positions = [];
    for (let x = 0; x <= maxX; x++) {
      positions.push(x);
    }
    return positions;
  };
  var addRotateActions = (actions, count) => {
    for (let i = 0; i < count; i++) {
      actions.push("ROTATE");
    }
  };
  var addMoveActions = (actions, delta) => {
    if (delta === 0) return;
    const moveDirection = delta > 0 ? "MOVE_RIGHT" : "MOVE_LEFT";
    const moveCount = Math.abs(delta);
    for (let i = 0; i < moveCount; i++) {
      actions.push(moveDirection);
    }
  };
  var buildActionSequence = ({ rotationCount, targetX, originalX }) => {
    const actions = [];
    addRotateActions(actions, rotationCount);
    addMoveActions(actions, targetX - originalX);
    actions.push("DROP");
    return actions;
  };
  var createCandidate = ({
    board,
    currentShape,
    targetX,
    originalPiece,
    rotationCount
  }) => {
    const result = simulate_drop_default(board, currentShape, targetX);
    const actions = buildActionSequence({
      rotationCount,
      targetX,
      originalX: originalPiece.position.x
    });
    return {
      board: result.board,
      actions
    };
  };
  var generateMoves = (snapshot) => {
    const { board, piece } = snapshot;
    const moves = [];
    let currentShape = piece.shape;
    for (let rotation = 0; rotation < 4; rotation++) {
      const validXPositions = getValidXPositions(board, currentShape);
      for (const targetX of validXPositions) {
        const candidate = createCandidate({
          board,
          currentShape,
          targetX,
          originalPiece: piece,
          rotationCount: rotation
        });
        moves.push(candidate);
      }
      currentShape = rotate_matrix_default(currentShape);
    }
    return moves;
  };
  var generate_moves_default = generateMoves;

  // lib/ai/utils/get-column-height.js
  var getColumnHeight = (board, x) => {
    for (let y = 0; y < board.length; y++) {
      if (board[y][x]) {
        return board.length - y;
      }
    }
    return 0;
  };
  var get_column_height_default = getColumnHeight;

  // lib/ai/utils/count-holes.js
  var countHoles = (board) => {
    let holes = 0;
    for (let x = 0; x < board[0].length; x++) {
      let blockFound = false;
      for (const row of board) {
        if (row[x]) {
          blockFound = true;
        } else if (blockFound) {
          holes += 1;
        }
      }
    }
    return holes;
  };
  var count_holes_default = countHoles;

  // lib/ai/simulator/evaluate-board.js
  var evaluateBoard = (board, weights) => {
    const heights = [];
    const w = {
      height: -0.51,
      holes: -0.35,
      bumpiness: -0.18,
      completeLines: 1.5,
      // 自定义权重覆盖默认值
      ...weights
    };
    for (let x = 0; x < board[0].length; x++) {
      heights.push(get_column_height_default(board, x));
    }
    const aggregateHeight = heights.reduce((a, b) => a + b, 0);
    let bumpiness = 0;
    for (let i = 0; i < heights.length - 1; i++) {
      bumpiness += Math.abs(heights[i] - heights[i + 1]);
    }
    const holes = count_holes_default(board);
    let completeLines = 0;
    for (const row of board) {
      if (row.every((cell) => cell !== 0)) {
        completeLines += 1;
      }
    }
    return aggregateHeight * w.height + holes * w.holes + bumpiness * w.bumpiness + Math.pow(completeLines, 2) * w.completeLines;
  };
  var evaluate_board_default = evaluateBoard;

  // lib/game/constants/shapes.js
  var SHAPES = [
    /**
     * ## I 型方块（标准长条）
     *
     * 形状：1 行 4 列 colorIndex: 0（TEAL 系）
     */
    { shape: [[1, 1, 1, 1]], colorIndex: 0 },
    /**
     * ## I 型方块（加长版）
     *
     * 形状：1 行 5 列 colorIndex: 1（GREEN 系）
     */
    { shape: [[1, 1, 1, 1, 1]], colorIndex: 1 },
    /**
     * ## O 型方块（正方形）
     *
     * 形状：2×2 实心方块，旋转后形状不变 colorIndex: 2（ORANGE 系）
     */
    {
      shape: [
        [1, 1],
        [1, 1]
      ],
      colorIndex: 2
    },
    /**
     * ## T 型方块
     *
     * 形状：第一行中间一个，第二行三个 colorIndex: 3（YELLOW 系）
     */
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      colorIndex: 3
    },
    /**
     * ## L 型方块
     *
     * 形状：第一行左侧一个，第二行三个 colorIndex: 4（BLUE 系）
     */
    {
      shape: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      colorIndex: 4
    },
    /**
     * ## J 型方块（反 L 型）
     *
     * 形状：第一行右侧一个，第二行三个 colorIndex: 5（PINK 系）
     */
    {
      shape: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      colorIndex: 5
    },
    /**
     * ## S 型方块（右斜）
     *
     * 形状：第一行右侧两个，第二行左侧两个 colorIndex: 6（RED 系）
     */
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      colorIndex: 6
    },
    /**
     * ## Z 型方块（左斜）
     *
     * 形状：第一行左侧两个，第二行右侧两个 colorIndex: 7（VIOLET 系）
     */
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      colorIndex: 7
    }
  ];
  var shapes_default = SHAPES;

  // lib/game/constants/color-palettes.js
  var {
    TEAL: TEAL4,
    GREEN: GREEN4,
    ORANGE: ORANGE4,
    YELLOW: YELLOW4,
    BLUE: BLUE4,
    PINK: PINK3,
    RED: RED4,
    VIOLET: VIOLET3,
    WARM_TEAL: WARM_TEAL2,
    WARM_GREEN: WARM_GREEN2,
    WARM_ORANGE: WARM_ORANGE2,
    WARM_YELLOW: WARM_YELLOW2,
    WARM_BLUE: WARM_BLUE2,
    WARM_PINK: WARM_PINK2,
    WARM_RED: WARM_RED2,
    WARM_VIOLET: WARM_VIOLET2,
    COOL_TEAL: COOL_TEAL2,
    COOL_GREEN: COOL_GREEN2,
    COOL_ORANGE: COOL_ORANGE2,
    COOL_YELLOW: COOL_YELLOW2,
    COOL_BLUE: COOL_BLUE2,
    COOL_PINK: COOL_PINK2,
    COOL_RED: COOL_RED2,
    COOL_VIOLET: COOL_VIOLET2,
    CANDY_TEAL: CANDY_TEAL2,
    CANDY_GREEN: CANDY_GREEN2,
    CANDY_ORANGE: CANDY_ORANGE2,
    CANDY_YELLOW: CANDY_YELLOW2,
    CANDY_BLUE: CANDY_BLUE2,
    CANDY_PINK: CANDY_PINK2,
    CANDY_RED: CANDY_RED2,
    CANDY_VIOLET: CANDY_VIOLET2,
    FOREST_TEAL: FOREST_TEAL2,
    FOREST_GREEN: FOREST_GREEN2,
    FOREST_ORANGE: FOREST_ORANGE2,
    FOREST_YELLOW: FOREST_YELLOW2,
    FOREST_BLUE: FOREST_BLUE2,
    FOREST_PINK: FOREST_PINK2,
    FOREST_RED: FOREST_RED2,
    FOREST_VIOLET: FOREST_VIOLET2,
    SUNSET_TEAL: SUNSET_TEAL2,
    SUNSET_GREEN: SUNSET_GREEN2,
    SUNSET_ORANGE: SUNSET_ORANGE2,
    SUNSET_YELLOW: SUNSET_YELLOW2,
    SUNSET_BLUE: SUNSET_BLUE2,
    SUNSET_PINK: SUNSET_PINK2,
    SUNSET_RED: SUNSET_RED2,
    SUNSET_VIOLET: SUNSET_VIOLET2,
    NEON_TEAL: NEON_TEAL2,
    NEON_GREEN: NEON_GREEN2,
    NEON_ORANGE: NEON_ORANGE2,
    NEON_YELLOW: NEON_YELLOW2,
    NEON_BLUE: NEON_BLUE2,
    NEON_PINK: NEON_PINK2,
    NEON_RED: NEON_RED2,
    NEON_VIOLET: NEON_VIOLET2,
    JEWEL_TEAL: JEWEL_TEAL2,
    JEWEL_GREEN: JEWEL_GREEN2,
    JEWEL_ORANGE: JEWEL_ORANGE2,
    JEWEL_YELLOW: JEWEL_YELLOW2,
    JEWEL_BLUE: JEWEL_BLUE2,
    JEWEL_PINK: JEWEL_PINK2,
    JEWEL_RED: JEWEL_RED2,
    JEWEL_VIOLET: JEWEL_VIOLET2
  } = colors_default;
  var PALETTES = [
    [TEAL4, GREEN4, ORANGE4, YELLOW4, BLUE4, PINK3, RED4, VIOLET3],
    [
      WARM_TEAL2,
      WARM_GREEN2,
      WARM_ORANGE2,
      WARM_YELLOW2,
      WARM_BLUE2,
      WARM_PINK2,
      WARM_RED2,
      WARM_VIOLET2
    ],
    [
      COOL_TEAL2,
      COOL_GREEN2,
      COOL_ORANGE2,
      COOL_YELLOW2,
      COOL_BLUE2,
      COOL_PINK2,
      COOL_RED2,
      COOL_VIOLET2
    ],
    [
      CANDY_TEAL2,
      CANDY_GREEN2,
      CANDY_ORANGE2,
      CANDY_YELLOW2,
      CANDY_BLUE2,
      CANDY_PINK2,
      CANDY_RED2,
      CANDY_VIOLET2
    ],
    [
      FOREST_TEAL2,
      FOREST_GREEN2,
      FOREST_ORANGE2,
      FOREST_YELLOW2,
      FOREST_BLUE2,
      FOREST_PINK2,
      FOREST_RED2,
      FOREST_VIOLET2
    ],
    [
      SUNSET_TEAL2,
      SUNSET_GREEN2,
      SUNSET_ORANGE2,
      SUNSET_YELLOW2,
      SUNSET_BLUE2,
      SUNSET_PINK2,
      SUNSET_RED2,
      SUNSET_VIOLET2
    ],
    [
      NEON_TEAL2,
      NEON_GREEN2,
      NEON_ORANGE2,
      NEON_YELLOW2,
      NEON_BLUE2,
      NEON_PINK2,
      NEON_RED2,
      NEON_VIOLET2
    ],
    [
      JEWEL_TEAL2,
      JEWEL_GREEN2,
      JEWEL_ORANGE2,
      JEWEL_YELLOW2,
      JEWEL_BLUE2,
      JEWEL_PINK2,
      JEWEL_RED2,
      JEWEL_VIOLET2
    ]
  ];
  var color_palettes_default = PALETTES;

  // lib/game/utils/random-shape.js
  var randomShape = (level = 1) => {
    const index = Math.floor(Math.random() * shapes_default.length);
    const piece = shapes_default[index];
    const paletteIndex = Math.min(
      Math.floor((level - 1) / 32),
      color_palettes_default.length - 1
    );
    const palette = color_palettes_default[paletteIndex];
    return {
      shape: piece.shape.map((row) => [...row]),
      color: palette[piece.colorIndex]
    };
  };
  var random_shape_default = randomShape;

  // lib/ai/utils/clear-full-lines.js
  var clearFullLines = (board) => {
    const result = board.filter((row) => !row.every((cell) => cell !== 0));
    while (result.length < board.length) {
      result.unshift(Array.from({ length: board[0].length }).fill(0));
    }
    return result;
  };
  var clear_full_lines_default = clearFullLines;

  // lib/ai/simulator/advance-snapshot.js
  var advanceSnapshot = (snapshot, move2) => {
    const board = simulate_placement_default(
      snapshot.board,
      snapshot.piece.shape,
      snapshot.piece.position.x,
      move2.y
      // simulateDrop 返回的最终 Y 坐标
    );
    const clearedBoard = clear_full_lines_default(board);
    const nextPiece = snapshot.next || random_shape_default();
    const newPiece = {
      shape: nextPiece.shape,
      position: {
        x: Math.floor(10 / 2) - Math.floor(nextPiece.shape[0].length / 2),
        y: 0
        // 从顶部开始
      }
    };
    return {
      ...snapshot,
      // 保留原始快照中的其他字段
      board: clearedBoard,
      // 更新为清理后的棋盘
      piece: newPiece,
      // 新活动方块
      cur: nextPiece,
      // 新活动方块的原始对象
      next: random_shape_default()
      // 再随机生成下一个预览方块
    };
  };
  var advance_snapshot_default = advanceSnapshot;

  // lib/ai/planner/self-play.js
  var selfPlay = (snapshot, weights, depth = 1, beam = 5) => {
    const moves = generate_moves_default(snapshot);
    if (moves.length === 0) return null;
    if (depth > 1 && moves.length > beam) {
      const scored = moves.map((move2) => ({
        move: move2,
        score: evaluate_board_default(move2.board, weights)
      }));
      scored.sort((a, b) => b.score - a.score);
      moves.length = 0;
      moves.push(...scored.slice(0, beam).map((s) => s.move));
    }
    let best = null;
    let bestScore = -Infinity;
    for (const move2 of moves) {
      let score;
      if (depth <= 1) {
        score = evaluate_board_default(move2.board, weights);
      } else {
        const nextSnapshot = advance_snapshot_default(snapshot, move2);
        const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam);
        score = nextBest ? evaluate_board_default(nextBest.board, weights) : evaluate_board_default(move2.board, weights);
      }
      if (score > bestScore) {
        bestScore = score;
        best = move2;
      }
    }
    return best;
  };
  var self_play_default = selfPlay;

  // lib/ai/ai-controller.js
  var AIController = class extends core_default {
    /**
     * ## 构造函数
     *
     * 初始化 AI 控制器的默认状态。
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Game - 游戏主实例
     * @param {object} options.Store - 游戏状态存储
     * @param {object} options.Scheduler - 调度器
     * @param {object} options.Animations - 动画系统
     */
    constructor(options) {
      super(options);
      this.enabled = false;
      this.actions = [];
      this.aiSchedulerId = 0;
    }
    /**
     * ## 启动 AI
     *
     * 设置 enabled 标志并立即开始第一次循环。
     *
     * @returns {void}
     */
    start() {
      this.enabled = true;
      this.loop();
    }
    /**
     * ## 停止 AI
     *
     * 清除 enabled 标志、清空待执行动作、取消调度任务。
     *
     * @returns {void}
     */
    stop() {
      const { Scheduler: Scheduler2 } = this;
      this.enabled = false;
      this.actions = [];
      Scheduler2.cancel(this.aiSchedulerId);
      this.aiSchedulerId = 0;
    }
    /**
     * ## AI 主循环
     *
     * 每帧（由调度器触发）执行以下逻辑：
     *
     * 1. 检查是否启用
     * 2. 检查游戏状态（必须为 playing 且无动画阻塞）
     * 3. 如果没有待执行动作，调用 `think()` 生成新的动作计划
     * 4. 从队列中取出一个动作，通过 `dispatch:input` 发送给 Game
     * 5. 根据当前难度配置的 delay 调度下一次循环
     *
     * @returns {void}
     */
    loop = () => {
      if (!this.enabled) {
        return;
      }
      const { Game: Game2, Animations, Scheduler: Scheduler2 } = this;
      const state = Game2.Store.getState();
      if (state.mode !== "playing" || Animations.hasBlocking()) {
        this.aiSchedulerId = Scheduler2.delay(this.loop, 100);
        return;
      }
      const difficulty = this.getDifficultyConfig();
      if (this.actions.length === 0) {
        const best = this.think(state);
        if (best) {
          this.actions = [...best.actions];
        }
      }
      const action = this.actions.shift();
      if (action) {
        this.emit("dispatch:input", {
          device: "ai",
          action,
          payload: {
            Game: Game2
          }
        });
      }
      this.aiSchedulerId = Scheduler2.delay(this.loop, difficulty.delay);
    };
    /**
     * ## AI 决策
     *
     * 分析当前游戏状态，计算最佳动作序列。
     *
     * ### 决策算法选择
     *
     * | 难度   | 算法                          | 说明                            |
     * | ------ | ----------------------------- | ------------------------------- |
     * | EASY   | selfPlay (lookahead=1)        | 只看当前方块，轻度启发式评估    |
     * | NORMAL | selfPlay (lookahead=1)        | 同上，但权重更严格              |
     * | HARD   | selfPlay (lookahead=2 + beam) | 前瞻搜索 + 束搜索剪枝           |
     * | EXPERT | MCTS (iterations=300)         | 蒙特卡洛树搜索，随机模拟 300 次 |
     *
     * ### 流程
     *
     * 1. 根据当前难度等级读取配置（lookahead、weights、beam 等）
     * 2. 从真实游戏状态创建快照（深拷贝，隔离 AI 模拟）
     * 3. 调用对应的决策算法
     * 4. 返回最佳移动对象（{ board, actions, y }）
     *
     * @param {object} state - 游戏状态对象（Store.getState() 的返回值）
     * @param {string[][]} state.board - 棋盘二维数组（颜色字符串格式）
     * @param {object} state.curr - 当前活动方块对象（含 shape、color）
     * @param {number} state.cx - 当前方块的 X 坐标（列索引）
     * @param {number} state.cy - 当前方块的 Y 坐标（行索引）
     * @returns {object | null} 最佳移动对象 `{ board, actions, y }`，无法决策时返回 null
     */
    think(state) {
      const difficulty = this.getDifficultyConfig();
      const { lookahead, weights, beam } = difficulty;
      const snapshot = create_snapshot_default(state);
      return self_play_default(snapshot, weights, lookahead, beam);
    }
    /**
     * ## 获取当前难度的完整配置
     *
     * 从 Store 读取当前选择的难度等级（easy/normal/hard/expert）， 映射到对应的 `AIDifficulty` 配置对象。
     *
     * @returns {object} 难度配置对象，包含 lookahead、noise、weights、delay、beam 等字段
     */
    getDifficultyConfig() {
      const { Game: Game2 } = this;
      const difficulty = Game2.Store.getDifficulty();
      const map = {
        easy: ai_difficulty_default.EASY,
        normal: ai_difficulty_default.NORMAL,
        hard: ai_difficulty_default.HARD,
        expert: ai_difficulty_default.EXPERT
      };
      return map[difficulty] || ai_difficulty_default.NORMAL;
    }
    /**
     * ## 订阅 AI 事件
     *
     * 监听 `ai:<uuid>:start` 和 `ai:<uuid>:stop` 事件。
     *
     * @returns {void}
     */
    subscribe() {
      const { Game: Game2 } = this;
      const uuid = Game2.id;
      const events = AIEvents(uuid);
      this.on(events.START, this._onStart);
      this.on(events.STOP, this._onStop);
    }
    /**
     * ## 取消订阅 AI 事件
     *
     * @returns {void}
     */
    unsubscribe() {
      const { Game: Game2 } = this;
      const uuid = Game2.id;
      const events = AIEvents(uuid);
      this.off(events.START, this._onStart);
      this.off(events.STOP, this._onStop);
    }
    /**
     * ## 处理 AI 启动事件
     *
     * @private
     * @returns {void}
     */
    _onStart = () => {
      this.start();
    };
    /**
     * ## 处理 AI 停止事件
     *
     * @private
     * @returns {void}
     */
    _onStop = () => {
      this.stop();
    };
  };
  var ai_controller_default = AIController;

  // lib/services/input/touch-controller.js
  var TOUCH_ACTION_MAP = {
    /** A 键：切换背景音乐 */
    A: "TOGGLE_MUSIC",
    /** B 键：方块直接落底（硬降） */
    B: "DROP",
    /** X 键：重新开始游戏 */
    X: "RESTART",
    /** Y 键：暂停/继续游戏 */
    Y: "TOGGLE_PAUSED",
    /** Start 键：确认操作 */
    START: "CONFIRM",
    /** Back 键：退出游戏 */
    BACK: "QUIT",
    /** 十字键左：向左移动 */
    DPAD_LEFT: "MOVE_LEFT",
    /** 十字键右：向右移动 */
    DPAD_RIGHT: "MOVE_RIGHT",
    /** 十字键下：向下加速（软降） */
    DPAD_DOWN: "MOVE_DOWN",
    /** 十字键上：旋转方块 */
    DPAD_UP: "ROTATE"
  };
  var LEVELS2 = [
    "ONE",
    // 第 1 关
    "TWO",
    // 第 2 关
    "THREE",
    // 第 3 关
    "FOUR",
    // 第 4 关
    "FIX",
    // 第 5 关（FIX 为拼写约定，等同于 FIVE）
    "SIX",
    // 第 6 关
    "SEVEN",
    // 第 7 关
    "EIGHT",
    // 第 8 关
    "NINE",
    // 第 9 关
    "TEN"
    // 第 10 关
  ];
  var getActionMap = (mode, level) => {
    switch (mode) {
      /**
       * 主菜单模式：
       *
       * - DPAD 上下键切换等级
       * - Start 键确认并进入难度选择
       */
      case "main-menu": {
        return {
          DPAD_UP: `LEVEL_${LEVELS2[level]}`,
          DPAD_DOWN: `LEVEL_${LEVELS2[level]}`,
          START: "CONFIRM"
        };
      }
      /**
       * 难度选择模式：
       *
       * - A/B/Y/X 分别对应 Easy/Normal/Hard/Expert
       * - Back 返回主菜单
       * - Start 确认难度并开始游戏
       */
      case "difficulty": {
        return {
          A: "EASY",
          B: "NORMAL",
          Y: "HARD",
          X: "EXPERT",
          BACK: "BACK",
          START: "CONFIRM"
        };
      }
      /**
       * 游戏进行中模式：
       *
       * - A：切换音乐
       * - B：硬降
       * - X：重新开始
       * - Y：暂停/继续
       * - Back：退出游戏
       * - DPAD：移动和旋转
       */
      case "playing": {
        return {
          A: "TOGGLE_MUSIC",
          B: "DROP",
          X: "RESTART",
          Y: "TOGGLE_PAUSED",
          BACK: "QUIT",
          DPAD_UP: "ROTATE",
          DPAD_DOWN: "MOVE_DOWN",
          DPAD_LEFT: "MOVE_LEFT",
          DPAD_RIGHT: "MOVE_RIGHT"
        };
      }
      /** 其他模式（replay、game-over 等）使用默认映射 */
      default: {
        return TOUCH_ACTION_MAP;
      }
    }
  };
  var TouchController = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置对象
     * @param {object} options.Controls - DOM 元素 ID 配置
     * @param {object} options.Store - 游戏状态存储
     * @param {object} options.Game - 游戏主实例
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    /**
     * ## 初始化触摸控制器
     *
     * 获取所有按钮 DOM 元素的引用，绑定事件监听器。
     *
     * @returns {void}
     */
    initialize() {
      const { Controls } = this;
      this.level = 0;
      this.$back = document.querySelector(`#${Controls.back}`);
      this.$start = document.querySelector(`#${Controls.start}`);
      this.$up = document.querySelector(`#${Controls.up}`);
      this.$down = document.querySelector(`#${Controls.down}`);
      this.$left = document.querySelector(`#${Controls.left}`);
      this.$right = document.querySelector(`#${Controls.right}`);
      this.$a = document.querySelector(`#${Controls.a}`);
      this.$b = document.querySelector(`#${Controls.b}`);
      this.$x = document.querySelector(`#${Controls.x}`);
      this.$y = document.querySelector(`#${Controls.y}`);
      this.addEventsListeners();
    }
    /**
     * ## 分发触摸事件为游戏输入
     *
     * 根据当前游戏模式获取按键映射，将触摸按键转换为游戏 action， 通过 `dispatch:input` 事件注入到命令队列中。
     *
     * @param {string} key - 触摸按键标识（如 'A', 'DPAD_UP' 等）
     * @returns {void}
     */
    dispatchTouch(key) {
      const { Store, Game: Game2 } = this;
      const mode = Store.getMode();
      if (mode === "main-menu") {
        if (key === "DPAD_UP") {
          this.level = Math.min(this.level + 1, 9);
        } else if (key === "DPAD_DOWN") {
          this.level = Math.max(this.level - 1, 0);
        }
      }
      const actionMap = getActionMap(mode, this.level);
      const action = actionMap[key];
      if (action) {
        this.emit("dispatch:input", {
          /** 输入设备类型：触摸屏 */
          device: "touch",
          /** 游戏动作指令 */
          action,
          /** 传递给命令处理器的参数 */
          payload: { Game: Game2 }
        });
      }
    }
    /**
     * ## 绑定所有按钮的点击事件
     *
     * 为 DPAD（4 个方向）、ABXY（4 个按钮）、Start、Back 共 10 个按钮 绑定 click 事件监听器。
     *
     * @returns {void}
     */
    addEventsListeners() {
      this.$back.addEventListener("click", this._onControlTouch);
      this.$start.addEventListener("click", this._onControlTouch);
      this.$up.addEventListener("click", this._onControlTouch);
      this.$down.addEventListener("click", this._onControlTouch);
      this.$left.addEventListener("click", this._onControlTouch);
      this.$right.addEventListener("click", this._onControlTouch);
      this.$a.addEventListener("click", this._onControlTouch);
      this.$b.addEventListener("click", this._onControlTouch);
      this.$x.addEventListener("click", this._onControlTouch);
      this.$y.addEventListener("click", this._onControlTouch);
    }
    /**
     * ## 移除所有按钮的点击事件
     *
     * 在组件销毁或切换输入模式时调用，防止内存泄漏。
     *
     * @returns {void}
     */
    removeEventListeners() {
      this.$back.removeEventListener("click", this._onControlTouch);
      this.$start.removeEventListener("click", this._onControlTouch);
      this.$up.removeEventListener("click", this._onControlTouch);
      this.$down.removeEventListener("click", this._onControlTouch);
      this.$left.removeEventListener("click", this._onControlTouch);
      this.$right.removeEventListener("click", this._onControlTouch);
      this.$a.removeEventListener("click", this._onControlTouch);
      this.$b.removeEventListener("click", this._onControlTouch);
      this.$x.removeEventListener("click", this._onControlTouch);
      this.$y.removeEventListener("click", this._onControlTouch);
    }
    /**
     * ## 处理按钮点击事件
     *
     * 从被点击元素的 `data-key` 属性中读取按键标识， 转为大写后调用 `dispatchTouch()` 分发。
     *
     * @private
     * @param {Event} evt - 点击事件对象
     * @returns {void}
     */
    _onControlTouch = (evt) => {
      const $element = evt.target;
      const { key } = $element.dataset;
      this.dispatchTouch(key.toUpperCase());
    };
  };
  var touch_controller_default = TouchController;

  // lib/events/router/replay-router.js
  var ReplayRouter = class extends core_default {
    /**
     * ## 构造函数
     *
     * 创建 ReplayRouter 实例。 注意：构造函数不会自动订阅事件，需要手动调用 `subscribe()`。
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Game - 游戏主实例
     * @param {object} options.Replay - ReplayController 实例
     */
    constructor(options) {
      super(options);
    }
    /**
     * ## 绑定所有事件监听
     *
     * 在游戏初始化时调用一次。 注册所有回放系统需要监听的游戏事件。
     *
     * ### 监听的事件分类
     *
     * 1. **录制操作事件**：开始录制、停止录制、添加记录、添加方块
     * 2. **回放操作事件**：开始回放、重置回放
     * 3. **流程控制事件**：游戏结束、消行完成
     *
     * @returns {void}
     */
    subscribe() {
      const { Game: Game2 } = this;
      const events = ReplayEvents(Game2.id);
      this.on(events.START_RECORD, this._onStartRecord);
      this.on(events.STOP_RECORD, this._onStopRecord);
      this.on(events.ADD_RECORD, this._onAddRecord);
      this.on(events.ADD_PIECE, this._onAddPiece);
      this.on(events.START_PLAY, this._onStartPlay);
      this.on(events.RESET, this._onReset);
      this.on(events.GAME_OVER, this._onGameOver);
      this.on(events.STOP_CLEAR_LINES, this._onStopClearLines);
    }
    /**
     * ## 取消绑定所有事件监听
     *
     * 移除所有已注册的事件监听器。 在组件销毁或不需要响应回放事件时调用，避免内存泄漏。
     *
     * @returns {void}
     */
    unsubscribe() {
      const { Game: Game2 } = this;
      const events = ReplayEvents(Game2.id);
      this.off(events.START_RECORD, this._onStartRecord);
      this.off(events.STOP_RECORD, this._onStopRecord);
      this.off(events.ADD_RECORD, this._onAddRecord);
      this.off(events.ADD_PIECE, this._onAddPiece);
      this.off(events.START_PLAY, this._onStartPlay);
      this.off(events.RESET, this._onReset);
      this.off(events.GAME_OVER, this._onGameOver);
      this.off(events.STOP_CLEAR_LINES, this._onStopClearLines);
    }
    /**
     * ## 开始录制
     *
     * 当接收到 `START_RECORD` 事件时触发。 调用 ReplayController 的 `startRecord()`
     * 方法开始录制游戏过程。
     *
     * @private
     * @returns {void}
     */
    _onStartRecord = () => {
      const { Replay } = this;
      Replay.startRecord();
    };
    /**
     * ## 停止录制
     *
     * 当接收到 `STOP_RECORD` 事件时触发。 调用 ReplayController 的 `stopRecord()` 方法停止录制游戏过程。
     *
     * @private
     * @returns {void}
     */
    _onStopRecord = () => {
      const { Replay } = this;
      Replay.stopRecord();
    };
    /**
     * ## 录制一条 command
     *
     * 当接收到 `ADD_RECORD` 事件时触发。 只在 recording 状态下写入，非录制状态自动忽略。
     *
     * @private
     * @param {object} record - 录制数据对象
     * @param {number} record.ms - 从录制开始到该命令的时间偏移（毫秒）
     * @param {object} record.cmd - Command 命令对象
     * @returns {void}
     */
    _onAddRecord = (record) => {
      const { Replay } = this;
      Replay.addRecord(record);
    };
    /**
     * ## 录制一个方块
     *
     * 当接收到 `ADD_PIECE` 事件时触发。 只在 recording 状态下写入，使用深拷贝避免引用污染。
     *
     * @private
     * @param {object} piece - 方块数据对象（包含形状、颜色、位置等信息）
     * @returns {void}
     */
    _onAddPiece = (piece) => {
      const { Replay } = this;
      Replay.addPiece(piece);
    };
    /**
     * ## 开始回放
     *
     * 当接收到 `START_PLAY` 事件时触发。 调用 ReplayController 的 `startPlay()` 方法开始回放游戏过程。
     *
     * @private
     * @returns {void}
     */
    _onStartPlay = () => {
      const { Replay } = this;
      Replay.startPlay();
    };
    /**
     * ## 重置回放系统
     *
     * 当接收到 `RESET` 事件时触发。 调用 ReplayController 的 `reset()` 方法停止录制/回放并清除所有数据。
     *
     * @private
     * @returns {void}
     */
    _onReset = () => {
      const { Replay } = this;
      Replay.reset();
    };
    /**
     * ## 游戏结束时的处理
     *
     * 当接收到 `GAME_OVER` 事件时触发。
     *
     * ### 处理逻辑
     *
     * - **有回放数据**：准备棋盘进入回放模式
     *
     *   - 停止 AI 控制
     *   - 触发 `REPLAY_PREPARE` 事件，传递下一个方块信息
     * - **无回放数据**：直接进入 game-over 状态
     *
     *   - 触发 UI 模式更新事件
     *   - 触发游戏模式更新事件
     *
     * 这种设计允许玩家在游戏结束后立即回放刚刚的游戏过程。
     *
     * @private
     * @returns {void}
     */
    _onGameOver = () => {
      const { Replay, Game: Game2 } = this;
      const uuid = Game2.id;
      const AE = AIEvents(uuid);
      const GE = GameEvents(uuid);
      const UE = UIEvents(uuid);
      if (Replay.hasData) {
        this.emit(AE.STOP);
        this.emit(GE.REPLAY_PREPARE, {
          nextPiece: Replay.getNextPiece()
        });
      } else {
        this.emit(UE.UPDATE_MODE, { mode: "game-over" });
        this.emit(GE.UPDATE_MODE, { mode: "game-over" });
      }
    };
    /**
     * ## 消行时的处理
     *
     * 当接收到 `STOP_CLEAR_LINES` 事件时触发。
     *
     * ### 处理逻辑
     *
     * 回放中不触发升级提示音/动画；录制或正常游戏中升级时触发。 这种设计确保：
     *
     * - 回放时不会重复播放升级特效（这些特效已在录制时播放过）
     * - 正常游戏和录制过程中仍然有完整的视听反馈
     *
     * ### 触发效果
     *
     * 1. 暂停当前背景音乐（BGM）
     * 2. 播放升级音效
     * 3. 触发升级特效动画
     *
     * @private
     * @param {object} param - 参数对象
     * @param {boolean} param.isLevelUp - 是否升级（消除的行数达到升级条件）
     * @param {number} param.level - 当前等级（升级后的新等级）
     * @returns {void}
     */
    _onStopClearLines = ({ isLevelUp, level }) => {
      const { Game: Game2, Replay } = this;
      if (!isLevelUp || Replay.playing) {
        return;
      }
      const AE = AudioEvents();
      const GE = GameEvents(Game2.id);
      this.emit(AE.STOP_BGM);
      this.emit(AE.PLAY_SOUND, { sound: "LEVEL_UP" });
      this.emit(GE.START_LEVEL_UP, { level });
    };
  };
  var replay_router_default = ReplayRouter;

  // lib/runtime/replay-controller.js
  var ReplayController = class extends core_default {
    /**
     * ## 是否有录制的回放数据
     *
     * @returns {boolean} 有回放数据返回 true，否则返回 false
     */
    get hasData() {
      return this.data.length > 0;
    }
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     * @param {object} options.Game - 游戏主实例
     * @param {object} options.Store - 游戏状态存储
     * @param {object} options.Scheduler - 任务调度器
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    /**
     * ## 初始化所有内部状态
     *
     * 重置录制/回放相关的所有标志和数据， 并创建 ReplayRouter 实例处理事件路由。
     *
     * @returns {void}
     */
    initialize() {
      this.recording = false;
      this.playing = false;
      this.data = [];
      this.cursor = 0;
      this.pieceSequence = [];
      this.pieceIndex = 0;
      this.playElapsed = 0;
      this.startTime = 0;
      this.timestamp = 0;
      const { Game: Game2 } = this;
      this.Router = new replay_router_default({
        Replay: this,
        Game: Game2
      });
    }
    /**
     * ## 获取下一个方块
     *
     * 在回放模式下，从录制的方块序列中按顺序读取。 确保回放时的方块顺序与录制时完全一致。
     *
     * @returns {{ curr: object | null; next: object | null }} 当前方块和下一个预览方块
     */
    getNextPiece() {
      if (!this.playing) {
        return { curr: null, next: null };
      }
      const piece = this.pieceSequence[this.pieceIndex++];
      if (!piece) {
        return { curr: null, next: null };
      }
      const next = this.pieceSequence[this.pieceIndex] || null;
      return { curr: piece, next };
    }
    /**
     * ## 同步回放逻辑时钟
     *
     * 计算当前 wall-clock 时间与 startTime 的差值作为回放进度。 如果检测到时间跳跃过大（标签页切后台），限制单次跳跃上限为 1 秒，
     * 防止切回后瞬间执行大量 command 导致爆帧。
     *
     * @param {object} ctx - 执行上下文对象
     * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
     * @param {boolean} ctx.isBlocked - 是否处于暂停/阻塞状态
     * @returns {void}
     */
    syncPlayElapsed({ timestamp, isBlocked }) {
      if (!this.playing || isBlocked) return;
      const prev = this.playElapsed;
      const now = timestamp - this.startTime;
      const delta = now - prev;
      if (delta > 1e3) {
        this.startTime += delta - 1e3;
        this.playElapsed = prev + 1e3;
      } else {
        this.playElapsed = now;
      }
    }
    /**
     * ## 每帧调用，驱动回放逻辑
     *
     * 执行流程：
     *
     * 1. 更新当前 timestamp
     * 2. 检查是否处于回放状态
     * 3. 检查回放是否完毕（所有 command 已执行）
     * 4. 如有需要，快进跳过长时间等待（标签页切回后）
     * 5. 将所有逻辑时间已到的 command 逐条注入 EventBus
     *
     * @param {object} ctx - 执行上下文对象
     * @param {number} ctx.speed - 当前下落间隔（毫秒），用于快进阈值计算
     * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
     * @returns {void}
     */
    update({ speed, timestamp }) {
      const { Store, Game: Game2, data } = this;
      const mode = Store.getMode();
      this.timestamp = timestamp;
      if (!this.playing || mode !== "replay") {
        return;
      }
      const events = GameEvents(Game2.id);
      if (data.length > 0 && this.cursor >= data.length) {
        this.stopPlay();
        this.emit(events.UPDATE_MODE, { mode: "game-over" });
        return;
      }
      const next = data[this.cursor];
      if (next) {
        const interval = speed ?? 1e3;
        const gap = next.ms - this.playElapsed;
        if (gap > interval * 2) {
          const skip = Math.min(gap - interval, 1e3);
          this.playElapsed += skip;
          this.startTime = timestamp - this.playElapsed;
        }
      }
      while (this.playing && this.cursor < data.length && data[this.cursor].ms <= this.playElapsed) {
        const { cmd } = data[this.cursor];
        this.emit(`dispatch:command`, cmd);
        this.cursor++;
      }
    }
    /**
     * ## 开始录制
     *
     * 开启 recording 标志，清空旧数据和方块序列， 将 startTime 设置为当前 timestamp。
     *
     * @returns {void}
     */
    startRecord() {
      this.recording = true;
      this.data = [];
      this.pieceSequence = [];
      this.pieceIndex = 0;
      this.playElapsed = 0;
      this.startTime = this.timestamp;
    }
    /**
     * ## 停止录制
     *
     * @returns {void}
     */
    stopRecord() {
      this.recording = false;
    }
    /**
     * ## 开始回放
     *
     * 开启 playing 标志，重置 cursor 和 pieceIndex， 将 startTime 设置为当前 timestamp。
     *
     * @returns {void}
     */
    startPlay() {
      this.playing = true;
      this.cursor = 0;
      this.pieceIndex = 0;
      this.startTime = this.timestamp;
    }
    /**
     * ## 停止回放
     *
     * @returns {void}
     */
    stopPlay() {
      this.playing = false;
    }
    /**
     * ## 添加一条录制记录
     *
     * 只在 recording 状态下写入数据。
     *
     * @param {object} record - 录制数据 `{ ms, cmd }`
     * @returns {void}
     */
    addRecord(record) {
      if (!this.recording) {
        return;
      }
      this.data.push(record);
    }
    /**
     * ## 添加一个方块到序列
     *
     * 只在 recording 状态下写入，使用深拷贝避免引用污染。
     *
     * @param {object} piece - 方块数据
     * @returns {void}
     */
    addPiece(piece) {
      if (!this.recording) {
        return;
      }
      this.pieceSequence.push(structuredClone(piece));
    }
    /**
     * ## 清除所有数据，重置标志位
     *
     * 注意：不清除事件绑定，仅重置录制/回放相关状态。
     *
     * @returns {void}
     */
    clear() {
      this.recording = false;
      this.playing = false;
      this.cursor = 0;
      this.data = [];
      this.pieceSequence = [];
      this.pieceIndex = 0;
      this.startTime = 0;
    }
    /**
     * ## 停止录制/回放并清除所有数据
     *
     * 等同于 `stopRecord()` + `stopPlay()` + `clear()`。 通过 `replay:<id>:reset` 事件触发。
     *
     * @returns {void}
     */
    reset() {
      this.stopRecord();
      this.stopPlay();
      this.clear();
    }
    /**
     * ## 绑定所有事件监听
     *
     * 委托给 ReplayRouter 处理。
     *
     * @returns {void}
     */
    subscribe() {
      this.Router.subscribe();
    }
    /**
     * ## 取消绑定所有事件监听
     *
     * 委托给 ReplayRouter 处理。
     *
     * @returns {void}
     */
    unsubscribe() {
      this.Router.unsubscribe();
    }
    /**
     * ## 销毁实例
     *
     * 停止所有录制/回放、清除数据、解绑所有事件。 主要用于 AI 对战切换对手或完全卸载 replay 模块。
     *
     * @returns {void}
     */
    destroy() {
      this.reset();
      this.unsubscribe();
    }
  };
  var replay_controller_default = ReplayController;

  // lib/services/animations/countdown-animation.js
  var CountdownAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置对象
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    /**
     * ## 初始化动画状态
     *
     * 设置动画属性，创建缩放和倒计时两个 Scheduler 定时器。
     *
     * @returns {void}
     */
    initialize() {
      this.layer = 100;
      this.blocking = true;
      this.name = "countdown";
      this._finished = false;
      this.state = {
        show: true,
        number: 3,
        scale: 4
      };
      const { Scheduler: Scheduler2 } = this;
      const events = AudioEvents();
      this.emit(events.PLAY_SOUND, { sound: "COUNTDOWN" });
      this._scaleId = Scheduler2.interval(() => {
        this.state.scale = Math.max(1, this.state.scale - 0.016 * 40);
      }, 16);
      this._countdownId = Scheduler2.interval(() => {
        this.state.number -= 1;
        this.state.scale = 4;
        if (this.state.number >= 1) {
          this.emit(events.PLAY_SOUND, { sound: "COUNTDOWN" });
        }
        if (this.state.number <= 0) {
          this._finished = true;
        }
      }, 1e3);
    }
    /**
     * ## 清理资源
     *
     * 由 AnimationSystem 在移除动画时自动调用。 取消所有 Scheduler 定时器，并触发游戏开始事件。
     *
     * @returns {void}
     */
    dispose() {
      const { Scheduler: Scheduler2 } = this;
      if (this._scaleId != null) Scheduler2.cancel(this._scaleId);
      if (this._countdownId != null) Scheduler2.cancel(this._countdownId);
      const { Game: Game2 } = this;
      const events = GameEvents(Game2.id);
      this.emit(events.BEGIN);
    }
    /**
     * ## 渲染动画
     *
     * 将当前状态传递给 UI 层绘制倒计时数字。
     *
     * @returns {void}
     */
    render() {
      const { Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.emit(events.RENDER_COUNTDOWN, { state: this.state });
    }
  };
  var countdown_animation_default = CountdownAnimation;

  // lib/services/animations/paused-animation.js
  var PausedAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * 初始化暂停动画，启动滴答定时器。
     *
     * @param {object} options - 配置对象
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    initialize() {
      this.layer = 500;
      this.blocking = true;
      this.name = "paused";
      this._finished = false;
      this.active = true;
      this._startTick();
    }
    /**
     * ## 启动滴答定时器
     *
     * 每 1000ms 播放一次滴答音效，提醒玩家游戏仍在暂停中。
     *
     * @private
     * @returns {void}
     */
    _startTick() {
      const { Scheduler: Scheduler2 } = this;
      const events = AudioEvents();
      this._tickId = Scheduler2.interval(() => {
        this.emit(events.PLAY_SOUND, { sound: "SECOND_TICK" });
      }, 1e3);
    }
    /**
     * ## 恢复暂停动画
     *
     * 将活跃状态设为 `true`，重新启动滴答定时器。 如果已经处于活跃状态则忽略。
     *
     * @returns {void}
     */
    resume() {
      if (this.active) return;
      this.active = true;
      this._startTick();
    }
    /**
     * ## 暂停结束处理
     *
     * 将活跃状态设为 `false`，标记动画结束。 AnimationSystem 会在 `flush()` 时自动调用 `dispose()` 清理。
     *
     * @returns {void}
     */
    stop() {
      this.active = false;
      this._finished = true;
    }
    /**
     * ## 清理资源
     *
     * 由 AnimationSystem 在移除动画时自动调用。 取消滴答定时器。
     *
     * @returns {void}
     */
    dispose() {
      const { Scheduler: Scheduler2 } = this;
      if (this._tickId != null) {
        Scheduler2.cancel(this._tickId);
      }
    }
    /**
     * ## 渲染暂停动画
     *
     * 实际的渲染由 UI 层监听事件完成，此方法为空实现。
     *
     * @returns {void}
     */
    render() {
    }
  };
  var paused_animation_default = PausedAnimation;

  // lib/game/actions/apply-clear-lines.js
  var createEmptyRow = (cols) => Array.from({ length: cols }).fill(0);
  var calculateLevel = (totalLines, maxLevel) => {
    let level = 1;
    let required = 10;
    let consumed = 0;
    while (level < maxLevel && totalLines >= consumed + required) {
      consumed += required;
      level++;
      required = Math.min(required + 2, 60);
    }
    return {
      level,
      levelUpSteps: required
    };
  };
  var applyClearLines = (runtime) => {
    const { MAX_LEVEL: MAX_LEVEL2, CLEAR_LINE_SCORES: CLEAR_LINE_SCORES2 } = game_default;
    const { Elements, Store } = runtime;
    const state = Store.getState();
    const { cols } = Elements.Main;
    const lines = [...state.clearLines || []].toSorted((a, b) => b - a);
    const cleared = lines.length;
    const board = structuredClone(state.board);
    for (const y of lines) {
      board.splice(y, 1);
    }
    for (let i = 0; i < cleared; i++) {
      board.unshift(createEmptyRow(cols));
    }
    const nextLines = state.lines + cleared;
    const totalLines = state.baseLines + nextLines;
    const { level: newLevel, levelUpSteps } = calculateLevel(
      totalLines,
      MAX_LEVEL2
    );
    const levelUp = newLevel > state.level;
    const baseScore = CLEAR_LINE_SCORES2[cleared] || 0;
    const clearScore = baseScore * newLevel;
    return {
      /**
       * 状态更新函数
       *
       * @param {object} prev - 之前的游戏状态信息
       * @returns {object} - 返回计算消除行后的游戏状态信息
       */
      stateHandler: (prev) => ({
        ...prev,
        /** 清空待消除行 */
        clearLines: [],
        /** 更新棋盘 */
        board,
        /** 更新累计消除行数 */
        lines: nextLines,
        /** 更新等级 */
        level: newLevel,
        /** 更新升级步长 */
        levelUpSteps,
        /** 更新总分 */
        score: prev.score + clearScore,
        /** 本次消除得分 */
        clearScore
      }),
      /** 是否升级 */
      levelUp,
      /** 当前等级 */
      level: newLevel,
      /** 当前升级步长 */
      levelUpSteps,
      /** 是否达到最大等级 */
      isMaxOut: newLevel >= MAX_LEVEL2,
      /** 本次消除得分 */
      clearScore,
      /** 消除行数 */
      cleared
    };
  };
  var apply_clear_lines_default = applyClearLines;

  // lib/services/animations/clear-lines-animation.js
  var ClearLinesAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置对象
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    /**
     * ## 初始化动画
     *
     * 设置动画属性，为每行创建独立的透明度状态， 调用 `applyClearLines` 获取本次消除得分供分数动画使用，
     * 启动闪烁序列、分数动画和结束定时器，播放消行音效。
     *
     * @param {object} options - 配置对象
     * @param {number[]} options.lines - 待消除的行号数组
     * @returns {void}
     */
    initialize(options) {
      const { lines } = options;
      this.layer = 200;
      this.blocking = true;
      this.name = "clear-lines";
      this._finished = false;
      this._schedulerIds = [];
      this.lines = lines.map((y) => ({ y, alpha: 1 }));
      const { Scheduler: Scheduler2, Game: Game2, Store } = this;
      const GE = GameEvents(Game2.id);
      const AE = AudioEvents();
      const { clearScore } = apply_clear_lines_default(Game2);
      const toggle = () => {
        for (const line of this.lines) {
          line.alpha = line.alpha === 1 ? 0 : 1;
        }
      };
      const ids = Scheduler2.sequence([
        {
          fn: () => {
            this.emit(GE.START_CLEAR_SCORE, {
              score: clearScore,
              lines: this.lines.map((l) => l.y)
            });
          },
          delay: 50
        },
        { fn: toggle, delay: 120 },
        { fn: toggle, delay: 120 },
        { fn: toggle, delay: 120 },
        { fn: toggle, delay: 120 },
        { fn: toggle, delay: 120 }
      ]);
      this._schedulerIds.push(...ids);
      const endId = Scheduler2.delay(() => {
        this._finished = true;
      }, 720);
      this._schedulerIds.push(endId);
      this.emit(AE.PLAY_SOUND, {
        sound: "CLEAR",
        lines: lines.length - 1,
        level: Store.getLevel()
      });
    }
    /**
     * ## 清理资源并执行收尾逻辑
     *
     * 由 AnimationSystem 在移除动画时自动调用。 取消所有 Scheduler 定时器，重新调用 `applyClearLines`
     * 获取最终消除结果， 依次执行升级逻辑、更新状态、保存最高分、刷新 HUD。
     *
     * `applyClearLines` 是纯函数，此处再次调用结果与 `initialize` 中一致。
     *
     * @returns {void}
     */
    dispose() {
      const { Scheduler: Scheduler2, Game: Game2 } = this;
      for (const id of this._schedulerIds) {
        Scheduler2.cancel(id);
      }
      const uuid = Game2.id;
      const result = apply_clear_lines_default(Game2);
      const { level, levelUp } = result;
      const GE = GameEvents(uuid);
      const RE = ReplayEvents(uuid);
      Scheduler2.sequence([
        {
          fn: () => {
            this.emit(RE.STOP_CLEAR_LINES, { isLevelUp: levelUp, level });
          }
        },
        {
          fn: () => {
            this.emit(GE.UPDATE_STATE, {
              stateHandler: result.stateHandler
            });
          }
        },
        {
          fn: () => {
            this.emit(GE.SAVE_HIGH_SCORE);
          }
        },
        {
          fn: () => {
            this.emit(GE.UPDATE_HUD);
          }
        }
      ]);
    }
    /**
     * ## 渲染动画
     *
     * 将当前闪烁状态传递给 UI 层进行绘制。
     *
     * @returns {void}
     */
    render() {
      const { Game: Game2 } = this;
      const UE = UIEvents(Game2.id);
      this.emit(UE.RENDER_CLEAR_LINES, { state: { lines: this.lines } });
    }
  };
  var clear_lines_animation_default = ClearLinesAnimation;

  // lib/services/animations/clear-score-animation.js
  var ClearScoreAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置对象
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    /**
     * ## 初始化动画
     *
     * 设置动画属性和初始状态，启动状态更新定时器。
     *
     * @returns {void}
     */
    initialize() {
      const { scoreData, Scheduler: Scheduler2 } = this;
      const { score, lines } = scoreData;
      this.layer = 300;
      this.blocking = false;
      this.name = "clear-score";
      this._finished = false;
      this.state = {
        score,
        y: lines[lines.length - 1],
        alpha: 1,
        offsetY: 0
      };
      this._updateId = Scheduler2.interval(() => {
        this._update();
      }, 16);
    }
    /**
     * ## 更新动画状态
     *
     * 每 16ms 调用一次，以固定步长更新透明度和上浮偏移。 当透明度降为 0 时标记动画结束。
     *
     * @returns {void}
     */
    _update() {
      this.state.alpha -= 0.0196;
      this.state.offsetY += 0.34;
      if (this.state.alpha <= 0) {
        this._finished = true;
      }
    }
    /**
     * ## 清理资源
     *
     * 由 AnimationSystem 在移除动画时自动调用。取消状态更新定时器。
     *
     * @returns {void}
     */
    dispose() {
      const { Scheduler: Scheduler2 } = this;
      Scheduler2.cancel(this._updateId);
    }
    /**
     * ## 渲染动画
     *
     * 每帧由 AnimationSystem 调用。将当前状态传递给 UI 层绘制上浮渐隐的得分数字。
     *
     * @returns {void}
     */
    render() {
      const { state, Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.emit(events.RENDER_CLEAR_SCORE, { state: { ...state } });
    }
  };
  var clear_score_animation_default = ClearScoreAnimation;

  // lib/services/animations/level-up-animation.js
  var LevelUpAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置对象
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    /**
     * ## 初始化动画
     *
     * 设置动画属性，创建初始烟花粒子，启动三个 Scheduler 定时器。
     *
     * @param {object} options - 配置对象
     * @param {number} options.level - 升级后的新等级
     * @returns {void}
     */
    initialize(options) {
      const { level } = options;
      this.layer = 100;
      this.blocking = true;
      this.name = "level-up";
      this.level = level;
      this._finished = false;
      this.fireworks = this.createFireworks();
      const { Scheduler: Scheduler2 } = this;
      this._spawnId = Scheduler2.interval(() => {
        this.fireworks.push(...this.createFireworks());
      }, 600);
      this._updateId = Scheduler2.interval(() => {
        this.updateFireworks(0.016);
      }, 16);
      this._endId = Scheduler2.delay(() => {
        this._finished = true;
      }, 3e3);
    }
    /**
     * ## 创建一组烟花粒子
     *
     * 在画布中心上方生成 40 个随机方向和速度的粒子。
     *
     * @returns {object[]} 烟花粒子对象数组
     */
    createFireworks() {
      const { UI: UI2 } = this;
      const { width, height } = UI2.Renderer.Canvas.gameBoard;
      const FIREWORK_COLORS = [
        colors_default.TEAL,
        colors_default.YELLOW,
        colors_default.PURPLE,
        colors_default.ORANGE,
        colors_default.GREEN,
        colors_default.RED,
        colors_default.PINK
      ];
      const particles = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 15;
        particles.push({
          /** ## 初始 X 坐标：画布水平中心 */
          x: width / 2,
          /** ## 初始 Y 坐标：画布中心上方 60 像素 */
          y: height / 2 - 60,
          /** ## X 轴速度分量 */
          vx: Math.cos(angle) * speed,
          /** ## Y 轴速度分量 */
          vy: Math.sin(angle) * speed,
          /** ## 粒子半径（3-7 像素随机） */
          radius: 3 + Math.random() * 4,
          /** ## 随机颜色 */
          color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
          /** ## 初始透明度（完全不透明） */
          alpha: 1
        });
      }
      return particles;
    }
    /**
     * ## 更新所有烟花粒子的物理状态
     *
     * 使用固定时间步长更新粒子的速度、位置、透明度和半径。
     *
     * ### 物理模拟
     *
     * - **空气阻力**：速度每帧衰减 2%（×0.98）
     * - **重力**：Y 轴速度增加（gravity × delta）
     * - **位置更新**：根据速度更新坐标
     * - **淡出**：透明度逐渐降低
     * - **膨胀**：半径逐渐增大
     *
     * ### 固定步长
     *
     * 由于 Scheduler 以固定 16ms 间隔驱动，传入固定的 delta = 0.016， 粒子运动在不同帧率下保持一致。
     *
     * @param {number} delta - 固定时间步长（0.016 秒）
     * @returns {void}
     */
    updateFireworks(delta) {
      const gravity = 0.01;
      for (const p of this.fireworks) {
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += gravity * delta;
        p.x += p.vx * delta * 8e-3;
        p.y += p.vy * delta * 8e-3;
        p.alpha -= delta * 0.024;
        p.radius += delta * 10;
      }
      this.fireworks = this.fireworks.filter((p) => p.alpha > 0);
    }
    /**
     * ## 清理资源
     *
     * 由 AnimationSystem 在移除动画时自动调用。 取消所有 Scheduler 定时器，恢复背景音乐。
     *
     * @returns {void}
     */
    dispose() {
      const { Scheduler: Scheduler2 } = this;
      if (this._spawnId != null) {
        Scheduler2.cancel(this._spawnId);
      }
      if (this._updateId != null) {
        Scheduler2.cancel(this._updateId);
      }
      if (this._endId != null) {
        Scheduler2.cancel(this._endId);
      }
      const events = AudioEvents();
      this.emit(events.RESUME_BGM, { level: this.level });
    }
    /**
     * ## 渲染升级动画
     *
     * 将等级和粒子数据传递给 UI 层绘制 "LEVEL UP" 文字和烟花效果。
     *
     * @returns {void}
     */
    render() {
      const { Game: Game2 } = this;
      const events = UIEvents(Game2.id);
      this.emit(events.RENDER_LEVEL_UP, {
        level: this.level,
        fireworks: this.fireworks
      });
    }
  };
  var level_up_animation_default = LevelUpAnimation;

  // lib/services/animations/landing-flash-animation.js
  var LandingFlashAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @param {object} options - 配置对象
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    /**
     * ## 初始化动画
     *
     * 根据方块形状和坐标收集所有落地格子的位置， 注册 150ms 结束定时器。
     *
     * @returns {void}
     */
    initialize() {
      const { piece, Scheduler: Scheduler2 } = this;
      const { shape, cx, cy } = piece;
      this.layer = 150;
      this.blocking = false;
      this.name = "landing-flash";
      this._finished = false;
      const cells = [];
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            cells.push({ x: cx + x, y: cy + y });
          }
        }
      }
      this.state = { cells };
      this._endId = Scheduler2.delay(() => {
        this._finished = true;
      }, 150);
    }
    /**
     * ## 清理资源
     *
     * 由 AnimationSystem 在移除动画时自动调用。取消结束定时器。
     *
     * @returns {void}
     */
    dispose() {
      const { Scheduler: Scheduler2 } = this;
      if (this._endId != null) {
        Scheduler2.cancel(this._endId);
      }
    }
    /**
     * ## 渲染动画
     *
     * 每帧由 AnimationSystem 调用。将落地格子坐标传递给 UI 层绘制白色高亮。
     *
     * @returns {void}
     */
    render() {
      const { state, Game: Game2 } = this;
      const UE = UIEvents(Game2.id);
      this.emit(UE.RENDER_LANDING_FLASH, { state: { cells: state.cells } });
    }
  };
  var landing_flash_animation_default = LandingFlashAnimation;

  // lib/game/utils/get-next-piece.js
  var getNextPiece = (runtime) => {
    const { Replay, Store } = runtime;
    if (Replay.playing) {
      return Replay.getNextPiece();
    }
    const state = Store.getState();
    const { next, level } = state;
    const curr = next ? {
      ...next,
      // 深拷贝形状矩阵，避免旋转时污染预览方块
      shape: next.shape.map((row) => [...row])
    } : random_shape_default(level);
    return {
      curr,
      // 随机生成新的预览方块（根据等级匹配配色方案）
      next: random_shape_default(level)
    };
  };
  var get_next_piece_default = getNextPiece;

  // lib/game/logic/collision.js
  var collision2 = (runtime, ox, oy) => {
    const { Elements, Store } = runtime;
    const { rows, cols } = Elements.Main;
    const state = Store.getState();
    const { curr, cx, cy, board } = state;
    if (!curr) {
      return false;
    }
    const s = curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          const nx = cx + x + ox;
          const ny = cy + y + oy;
          const outOfBounds = nx < 0 || nx >= cols || ny >= rows;
          const hitBlock = ny >= 0 && ny < rows && board[ny][nx];
          if (outOfBounds || hitBlock) {
            return true;
          }
        }
      }
    }
    return false;
  };
  var collision_default2 = collision2;

  // lib/game/core/over.js
  var over = (runtime) => {
    const { id, Store } = runtime;
    const mode = Store.getMode();
    if (mode === "game-over" || mode === "replay") {
      return;
    }
    const AE = AudioEvents();
    const RE = ReplayEvents(id);
    runtime.emit(RE.STOP_RECORD);
    runtime.emit(AE.STOP_BGM);
    runtime.emit(AE.PLAY_SOUND, { sound: "GAME_OVER" });
    runtime.emit(RE.GAME_OVER);
  };
  var over_default = over;

  // lib/game/logic/spawn.js
  var spawn = (runtime) => {
    const { id, Elements, Store } = runtime;
    const { cols } = Elements.Main;
    const { curr, next } = get_next_piece_default(runtime);
    if (!curr) {
      return;
    }
    Store.setState({
      curr,
      next,
      cx: Math.floor(cols / 2) - Math.floor(curr.shape[0].length / 2),
      cy: 0
    });
    const state = Store.getState();
    if (collision_default2(runtime, 0, 0)) {
      over_default(runtime);
      return;
    }
    const UE = UIEvents(id);
    const RE = ReplayEvents(id);
    runtime.emit(UE.RENDER_NEXT_PIECE, { state });
    runtime.emit(RE.ADD_PIECE, state.curr);
  };
  var spawn_default = spawn;

  // lib/game/actions/set-beginning-state.js
  var setBeginningState = (runtime, mode, level = 1) => {
    const { Store, id } = runtime;
    const events = UIEvents(id);
    runtime.emit(events.UPDATE_MODE, { mode });
    Store.setState({
      mode,
      score: 0,
      // 分数归零
      lines: 0,
      // 消除行数归零
      level,
      // 设置初始等级
      next: null
      // 清空预览方块
    });
    if (mode === "playing") {
      Store.setBeginningBoard(Store.generateBoard());
    }
  };
  var set_beginning_state_default = setBeginningState;

  // lib/game/core/begin.js
  var begin = (runtime) => {
    const { Store, id, Scheduler: Scheduler2 } = runtime;
    const AE = AudioEvents();
    const RE = ReplayEvents(id);
    const UE = UIEvents(id);
    const $level = document.querySelector("#level");
    const level = Store.getLevel();
    if ($level) {
      $level.textContent = pad_start_default(Store.getLevel(), 2);
    }
    runtime.emit(RE.START_RECORD);
    Store.resetBoard();
    set_beginning_state_default(runtime, "playing", level);
    runtime.emit(UE.UPDATE_HUD);
    spawn_default(runtime);
    runtime.emit(AE.PLAY_SOUND, { sound: "GAME_STARTED" });
    Scheduler2.delay(() => {
      runtime.emit(AE.RESUME_BGM, { level });
    }, 250);
  };
  var begin_default = begin;

  // lib/game/core/start.js
  var start = (runtime) => {
    const { id, Store } = runtime;
    const level = Store.getLevel();
    const lines = (level - 1) * 10;
    Store.setBaseLines(lines);
    const GE = GameEvents(id);
    runtime.emit(GE.START_COUNTDOWN);
  };
  var start_default = start;

  // lib/game/core/pause.js
  var pause = (runtime) => {
    const { id, Store } = runtime;
    const mode = Store.getMode();
    const AE = AudioEvents();
    const GE = GameEvents(id);
    const UE = UIEvents(id);
    if (mode !== "playing") {
      return;
    }
    runtime.emit(UE.UPDATE_MODE, { mode: "paused" });
    Store.setMode("paused");
    runtime.emit(AE.STOP_BGM);
    runtime.emit(AE.PLAY_SOUND, { sound: "PAUSED" });
    runtime.emit(GE.START_PAUSED);
  };
  var pause_default = pause;

  // lib/game/core/resume.js
  var resume = (runtime) => {
    const { id, Store } = runtime;
    const mode = Store.getMode();
    if (mode !== "paused") {
      return;
    }
    const level = Store.getLevel();
    const AE = AudioEvents();
    const GE = GameEvents(id);
    const UE = UIEvents(id);
    runtime.emit(UE.UPDATE_MODE, { mode: "playing" });
    Store.setMode("playing");
    runtime.emit(GE.STOP_PAUSED);
    runtime.emit(AE.PLAY_SOUND, { sound: "RESUME" });
    runtime.emit(AE.RESUME_BGM, { level });
  };
  var resume_default = resume;

  // lib/game/core/toggle-pause.js
  var togglePause = (runtime) => {
    const mode = runtime.Store.getMode();
    if (mode === "main-menu" || mode === "replay" || mode === "game-over") {
      return;
    }
    if (mode === "playing") {
      pause_default(runtime);
    } else {
      resume_default(runtime);
    }
  };
  var toggle_pause_default = togglePause;

  // lib/game/core/reset.js
  var reset = (runtime, mode = "main-menu") => {
    const { id, Store } = runtime;
    const AUE = AudioEvents();
    const AIE = AIEvents(id);
    const ANE = AnimationsEvents(id);
    const CE = CommandEvents(id);
    const RE = ReplayEvents(id);
    const UE = UIEvents(id);
    let level = Store.getLevel();
    runtime.emit(AUE.STOP_BGM);
    runtime.emit(ANE.CLEAR);
    runtime.emit(CE.CLEAR);
    Store.resetBoard();
    if (mode === "main-menu") {
      Store.setDifficulty("easy");
      level = 1;
      runtime.emit(AUE.PLAY_SOUND, { sound: "SWITCH_SCENE" });
    }
    set_beginning_state_default(runtime, mode, level);
    runtime.emit(UE.UPDATE_HUD, { state: Store.getState() });
    runtime.emit(UE.UPDATE_MODE, { mode });
    runtime.emit(AIE.STOP);
    Store.setController("human");
    runtime.emit(UE.UPDATE_CONTROLLER, { controller: "human" });
    runtime.emit(RE.RESET);
  };
  var reset_default = reset;

  // lib/game/core/restart.js
  var restart = (runtime) => {
    const { Store } = runtime;
    const mode = Store.getMode();
    if (mode !== "playing") {
      return;
    }
    const level = Store.getLevel();
    reset_default(runtime, "playing");
    spawn_default(runtime);
    const AE = AudioEvents();
    runtime.emit(AE.RESUME_BGM, { level });
  };
  var restart_default = restart;

  // lib/game/logic/move.js
  var move = (runtime, ox, oy) => {
    const { Store } = runtime;
    const state = Store.getState();
    const AE = AudioEvents();
    let { cx, cy } = state;
    if (!collision_default2(runtime, ox, oy)) {
      cx += ox;
      cy += oy;
      Store.setState({ cx, cy });
      runtime.emit(AE.PLAY_SOUND, { sound: "MOVE" });
      return true;
    }
    return false;
  };
  var move_default = move;

  // lib/game/logic/rotate.js
  var rotate = (runtime) => {
    const { Store } = runtime;
    const state = Store.getState();
    const { curr } = state;
    if (!curr) {
      return;
    }
    const currentShape = structuredClone(curr);
    const prev = curr.shape;
    currentShape.shape = prev[0].map(
      (_, i) => prev.map((r) => r[i]).toReversed()
    );
    Store.setState({ curr: currentShape });
    const AE = AudioEvents();
    if (collision_default2(runtime, 0, 0)) {
      currentShape.shape = prev;
      Store.setState({ curr: currentShape });
    } else {
      runtime.emit(AE.PLAY_SOUND, { sound: "ROTATE" });
    }
  };
  var rotate_default = rotate;

  // lib/game/logic/lock.js
  var lock = (runtime) => {
    const { Store } = runtime;
    const state = Store.getState();
    const { curr } = state;
    const s = curr.shape;
    const board = structuredClone(state.board);
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          board[state.cy + y][state.cx + x] = curr.color;
          Store.setState({ board });
        }
      }
    }
  };
  var lock_default = lock;

  // lib/game/logic/find-full-lines.js
  var findFullLines = (runtime) => {
    const { Elements, Store } = runtime;
    const state = Store.getState();
    const { rows } = Elements.Main;
    const linesToClear = [];
    for (let y = rows - 1; y >= 0; y--) {
      const isLineFull = state.board[y].every((cell) => !!cell);
      if (isLineFull) {
        linesToClear.push(y);
      }
    }
    return linesToClear;
  };
  var find_full_lines_default = findFullLines;

  // lib/game/logic/clear-lines.js
  var clearLines = (runtime) => {
    const { id, Store } = runtime;
    const linesToClear = find_full_lines_default(runtime);
    if (linesToClear.length === 0) {
      return;
    }
    Store.setClearLines(linesToClear);
    const GE = GameEvents(id);
    runtime.emit(GE.START_CLEAR_LINES, { linesToClear });
  };
  var clear_lines_default = clearLines;

  // lib/game/logic/tick.js
  var tick = (runtime, isBlocked) => {
    const mode = runtime.Store.getMode();
    if (mode !== "playing" && mode !== "replay" || isBlocked) {
      return;
    }
    if (mode === "playing") {
      runtime.emit("dispatch:input", {
        device: "replay",
        action: "AUTO_TICK",
        payload: {
          Game: runtime
        }
      });
    }
    const AE = AudioEvents();
    const GE = GameEvents(runtime.id);
    const { curr, cx, cy } = runtime.Store.getState();
    if (!move_default(runtime, 0, 1)) {
      lock_default(runtime);
      runtime.emit(GE.START_LANDING_FLASH, {
        piece: { shape: curr.shape, cx, cy }
      });
      runtime.emit(AE.PLAY_SOUND, { sound: "FALL" });
      clear_lines_default(runtime);
      spawn_default(runtime);
    }
  };
  var tick_default = tick;

  // lib/game/logic/drop.js
  var drop = (runtime) => {
    while (true) {
      if (!move_default(runtime, 0, 1)) {
        break;
      }
    }
    const AE = AudioEvents();
    const GE = GameEvents(runtime.id);
    const { curr, cx, cy } = runtime.Store.getState();
    lock_default(runtime);
    runtime.emit(GE.START_LANDING_FLASH, {
      piece: { shape: curr.shape, cx, cy }
    });
    runtime.emit(AE.PLAY_SOUND, { sound: "FALL" });
    clear_lines_default(runtime);
    spawn_default(runtime);
    runtime.emit(AE.PLAY_SOUND, { sound: "DROP" });
  };
  var drop_default = drop;

  // lib/game/rules/get-speed.js
  var getSpeed = (runtime) => {
    const { MAX_LEVEL: MAX_LEVEL2 } = game_default;
    const { Store } = runtime;
    const level = Store.getLevel();
    const step = Math.ceil(1e3 / Math.floor(MAX_LEVEL2 * 0.6));
    return Math.max(120, 1e3 - (level - 1) * step);
  };
  var get_speed_default = getSpeed;

  // lib/utils/get-storage.js
  var getStorage = (key) => localStorage.getItem(key);
  var get_storage_default = getStorage;

  // lib/utils/set-storage.js
  var setStorage = (key, value) => {
    localStorage.setItem(key, value);
  };
  var set_storage_default = setStorage;

  // lib/game/index.js
  var Game = class extends core_default {
    /**
     * ## 构造函数
     *
     * 接收依赖配置，调用 `initialize()` 创建所有子系统。 构造函数本身不进行复杂初始化，所有子系统的创建都在 `initialize()`
     * 中完成。
     *
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    /**
     * ## 初始化所有子系统
     *
     * 创建 Store、Animations、UI、输入设备、AI、回放等模块， 并注入它们之间的依赖关系。
     * 这是整个游戏系统的"组装工厂"，将所有模块组合成一个完整的游戏实例。
     *
     * ### 初始化顺序
     *
     * 1. 创建 Store（状态存储）— 最基础的模块，其他模块依赖它
     * 2. 设置游戏 ID — 用于事件命名空间隔离
     * 3. 创建 Animations（动画系统）— 依赖 Game 实例
     * 4. 创建 AI（AI 控制器）— 依赖 Store、Scheduler、Animations
     * 5. 创建 CommandQueue（命令队列）— 依赖 Game 实例
     * 6. 创建 UI（界面渲染）— 依赖 Store、Elements
     * 7. 创建输入设备（键盘、手柄）— 依赖 Game、Store
     * 8. 创建 Replay（回放系统）— 依赖 Game、Store、Scheduler
     * 9. 创建 Router（事件路由器）— 依赖所有子系统
     *
     * @returns {void}
     */
    initialize() {
      const { Elements, Scheduler: Scheduler2 } = this;
      const { Controls } = Elements;
      const Store = new game_store_default({
        ...Elements.Main,
        GameState: game_state_default
      });
      this.id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      this.effect = null;
      this.Store = Store;
      this.Animations = new animation_system_default({ Game: this });
      this.CommandQueue = new command_queue_default({ Game: this });
      this.AI = new ai_controller_default({
        Game: this,
        Store,
        Scheduler: Scheduler2,
        Animations: this.Animations
      });
      this.UI = new ui_default({ Game: this, Store, Elements });
      this.Keyboard = new keyboard_controller_default({ Game: this, Store });
      this.Gamepad = new gamepad_controller_default({ Game: this, Store });
      this.Touch = new touch_controller_default({ Game: this, Store, Controls });
      this.Replay = new replay_controller_default({
        Game: this,
        Store,
        Scheduler: Scheduler2
      });
      this.Router = new game_router_default({
        Animations: this.Animations,
        AI: this.AI,
        CommandQueue: this.CommandQueue,
        Game: this,
        Replay: this.Replay,
        Store,
        UI: this.UI
      });
    }
    // ==================== 场景控制 ====================
    /**
     * ## 选择等级
     *
     * 设置游戏等级，等级越高方块下落速度越快。 等级变更时会播放音效反馈。
     *
     * @param {number} level - 等级数值
     * @returns {void}
     */
    selectLevel(level) {
      const AE = AudioEvents();
      this.Store.setLevel(level);
      this.emit(AE.PLAY_SOUND, { sound: "LEVEL_CHANGED" });
    }
    /**
     * ## 切换到难度选择界面
     *
     * 将游戏模式切换为难度选择界面，并播放场景切换音效。
     *
     * @returns {void}
     */
    switchToDifficulty() {
      const AE = AudioEvents();
      this.Store.setMode("difficulty");
      this.emit(AE.PLAY_SOUND, { sound: "SWITCH_SCENE" });
    }
    /**
     * ## 选择难度
     *
     * 设置游戏难度等级，难度影响初始棋盘和 AI 行为等。
     *
     * @param {string} difficulty - 难度等级（`easy` / `normal` / `hard` / `expert`）
     * @returns {void}
     */
    selectDifficulty(difficulty) {
      const AE = AudioEvents();
      this.Store.setDifficulty(difficulty);
      this.emit(AE.PLAY_SOUND, { sound: "DIFFICULTY_CHANGED" });
    }
    /**
     * ## 切换到主菜单
     *
     * 将游戏模式切换回主菜单界面。
     *
     * @returns {void}
     */
    switchToMainMenu() {
      const AE = AudioEvents();
      const UE = UIEvents(this.id);
      this.emit(UE.UPDATE_MODE, { mode: "main-menu" });
      this.Store.setMode("main-menu");
      this.emit(AE.PLAY_SOUND, { sound: "SWITCH_SCENE" });
    }
    // ==================== 存档管理 ====================
    /**
     * ## 加载最高分
     *
     * 从 localStorage 读取历史最高分并写入 Store。
     *
     * @returns {void}
     */
    loadHighScore() {
      const highScore = Number.parseInt(get_storage_default("tetris-high-score"), 10) || 0;
      this.Store.setHighScore(highScore);
    }
    /**
     * ## 保存最高分
     *
     * 仅当当前得分超过历史最高分时才执行保存。
     *
     * @param {number} score - 当前得分
     * @returns {void}
     */
    saveHighScore(score) {
      const { Store } = this;
      if (score > Store.getHighScore()) {
        Store.setHighScore(score);
        set_storage_default("tetris-high-score", score.toString());
      }
    }
    // ==================== 核心流程代理方法 ====================
    /**
     * ## 开始游戏准备
     *
     * @returns {void}
     */
    begin() {
      begin_default(this);
    }
    /**
     * ## 启动游戏（进入倒计时）
     *
     * @returns {void}
     */
    start() {
      start_default(this);
    }
    /**
     * ## 切换暂停状态
     *
     * @returns {void}
     */
    togglePause() {
      toggle_pause_default(this);
    }
    /**
     * ## 重置游戏
     *
     * @returns {void}
     */
    reset() {
      reset_default(this);
    }
    /**
     * ## 重新开始游戏
     *
     * @returns {void}
     */
    restart() {
      restart_default(this);
    }
    /**
     * ## 游戏结束
     *
     * @returns {void}
     */
    over() {
      over_default(this);
    }
    /**
     * ## 生成新方块
     *
     * @returns {void}
     */
    spawn() {
      spawn_default(this);
    }
    // ==================== 方块操作代理方法 ====================
    /**
     * ## 移动当前方块
     *
     * @param {number} x - X 轴偏移（负数左移，正数右移）
     * @param {number} y - Y 轴偏移（负数上移，正数下移）
     * @returns {boolean} 是否移动成功
     */
    move(x, y) {
      return move_default(this, x, y);
    }
    /**
     * ## 旋转当前方块
     *
     * @returns {void}
     */
    rotate() {
      rotate_default(this);
    }
    /**
     * ## 游戏逻辑帧
     *
     * @param {boolean} isBlocked - 是否被动画阻塞
     * @returns {void}
     */
    tick(isBlocked) {
      tick_default(this, isBlocked);
    }
    /**
     * ## 方块快速落底（硬降）
     *
     * @returns {void}
     */
    drop() {
      drop_default(this);
    }
    // ==================== 游戏指令代理方法 ====================
    /**
     * ## 执行消行逻辑
     *
     * @returns {object} 消行后的更新数据
     */
    applyClearLines() {
      return apply_clear_lines_default(this);
    }
    /**
     * ## 设置游戏初始状态
     *
     * @param {string} mode - 游戏模式
     * @param {number} [level=1] - 初始等级。默认值为 `1`. Default is `1`
     * @returns {void}
     */
    setBeginningState(mode, level = 1) {
      set_beginning_state_default(this, mode, level);
    }
    /**
     * ## 获取当前等级的下落速度
     *
     * @returns {number} 下落间隔（毫秒）
     */
    getSpeed() {
      return get_speed_default(this);
    }
    // ==================== 动画特效控制 ====================
    /**
     * ## 开始倒计时动画
     *
     * @returns {void}
     */
    startCountdown() {
      const { Scheduler: Scheduler2 } = this;
      this.Animations.register(new countdown_animation_default({ Scheduler: Scheduler2, Game: this }));
    }
    /**
     * ## 开始暂停动画
     *
     * @returns {void}
     */
    startPaused() {
      const { Scheduler: Scheduler2 } = this;
      this.effect = new paused_animation_default({ Scheduler: Scheduler2 });
      this.Animations.register(this.effect);
      this.effect.resume();
    }
    /**
     * ## 停止暂停动画
     *
     * @returns {void}
     */
    stopPaused() {
      if (!this.effect) return;
      this.effect.stop();
      this.effect = null;
    }
    /**
     * ## 开始消行闪烁动画
     *
     * @param {number[]} linesToClear - 待消除的行号数组
     * @returns {void}
     */
    startClearLines(linesToClear) {
      const { Scheduler: Scheduler2, Store } = this;
      this.Animations.register(
        new clear_lines_animation_default({
          Game: this,
          Store,
          Scheduler: Scheduler2,
          lines: linesToClear
        })
      );
    }
    /**
     * ## 开始消除得分动画
     *
     * @param {object} scoreData - 得分数据
     * @param {number} scoreData.score - 本次消除得分
     * @param {number[]} scoreData.lines - 消除的行号数组
     * @returns {void}
     */
    startClearScore(scoreData) {
      const { Scheduler: Scheduler2 } = this;
      this.Animations.register(
        new clear_score_animation_default({
          Game: this,
          scoreData,
          Scheduler: Scheduler2
        })
      );
    }
    /**
     * ## 开始升级烟花动画
     *
     * @param {number} level - 新等级
     * @returns {void}
     */
    startLevelUp(level) {
      const { Scheduler: Scheduler2, UI: UI2 } = this;
      this.Animations.register(
        new level_up_animation_default({
          Game: this,
          UI: UI2,
          level,
          Scheduler: Scheduler2
        })
      );
    }
    /**
     * ## 开始落地高亮动画
     *
     * @param {object} piece - 刚落地的方块信息
     * @param {number[][]} piece.shape - 方块形状矩阵
     * @param {number} piece.cx - 方块 X 坐标
     * @param {number} piece.cy - 方块 Y 坐标
     * @returns {void}
     */
    startLandingFlash(piece) {
      const { Scheduler: Scheduler2 } = this;
      this.Animations.register(
        new landing_flash_animation_default({
          Game: this,
          piece,
          Scheduler: Scheduler2
        })
      );
    }
    // ==================== 事件订阅 / 取消订阅 ====================
    /**
     * ## 添加输入设备事件监听
     *
     * 启动键盘和手柄的输入事件监听。
     *
     * @returns {void}
     */
    addEventListeners() {
      this.Keyboard.addEventListeners();
      this.Gamepad.addEventListeners();
      this.Touch.addEventsListeners();
    }
    /**
     * ## 移除输入设备事件监听
     *
     * 停止键盘和手柄的输入事件监听。
     *
     * @returns {void}
     */
    removeEventListeners() {
      this.Keyboard.removeEventListeners();
      this.Gamepad.removeEventListeners();
      this.Touch.removeEventListeners();
    }
    /**
     * ## 订阅所有游戏事件
     *
     * 绑定核心流程、方块操作、动画特效、输入设备等所有事件。 同时触发各子模块的 subscribe 方法。
     *
     * @returns {void}
     */
    subscribe() {
      this.Router.subscribe();
    }
    /**
     * ## 取消订阅所有游戏事件
     *
     * 移除所有事件监听器。 在游戏销毁或需要完全停止时调用。
     *
     * @returns {void}
     */
    unsubscribe() {
      this.Router.unsubscribe();
    }
  };
  var game_default2 = Game;

  // lib/core/command/command.js
  var Command = class extends core_default {
    /**
     * ## 创建一个命令实例
     *
     * 通过父类 `Base` 的构造函数注入 payload 中的依赖， 然后调用 `initialize()` 设置命令的核心属性。
     *
     * @example
     *   // AI 发送左移命令
     *   const cmd = new Command('MOVE_LEFT', { Game: gameInstance });
     *
     *   // 键盘发送硬降命令
     *   const cmd = new Command('DROP', { Game: gameInstance });
     *
     * @param {string} action - 命令类型（如 MOVE_LEFT、ROTATE、DROP 等）
     * @param {object} [payload={}] - 命令携带的额外参数（如 Game 实例引用等）。默认值为 `{}`. Default
     *   is `{}`
     */
    constructor(action, payload) {
      super(payload);
      this.initialize(action, payload);
    }
    /**
     * ## 初始化命令的核心属性
     *
     * @param {string} action - 命令类型（如 MOVE_LEFT、ROTATE、DROP 等）
     * @param {object} [payload={}] - 命令携带的额外参数（如 Game 实例引用等）. Default is `{}`
     * @returns {void}
     */
    initialize(action, payload = {}) {
      this.action = action;
      this.payload = payload;
    }
    /**
     * ## 执行命令
     *
     * 将命令通过 `dispatch:command` 事件交给统一的 dispatch 系统处理。 Command
     * 本身不执行业务逻辑，只负责通知调度系统"有一个操作需要执行"。
     *
     * ### 执行流程
     *
     * 1. Command 通过 EventBus 发送 `dispatch:command` 事件
     * 2. Engine 层监听该事件，调用 `dispatchCommand` 函数
     * 3. `dispatchCommand` 根据当前游戏模式（mode）路由到对应的 action handler
     * 4. Action handler 执行业务逻辑（如移动方块、暂停游戏等）
     *
     * @example
     *   const cmd = new Command('ROTATE', { Game: game });
     *   cmd.execute(); // 触发一次旋转操作
     *
     * @returns {void}
     */
    execute() {
      const { action, payload } = this;
      this.emit("dispatch:command", {
        action,
        payload
      });
    }
  };
  var command_default = Command;

  // lib/engine/dispatch-input.js
  var dispatchInput = (input, context) => {
    const { action, payload } = input;
    const { isBlocked, ms } = context;
    if (isBlocked || !action) {
      return;
    }
    const { Game: Game2 } = payload;
    const cmd = new command_default(action, payload);
    const uuid = Game2.id;
    const CE = CommandEvents(uuid);
    const RE = ReplayEvents(uuid);
    Game2.emit(CE.ENQUEUE, { cmd });
    Game2.emit(RE.ADD_RECORD, {
      ms,
      cmd
    });
  };
  var dispatch_input_default = dispatchInput;

  // lib/game/actions/main-menu-actions.js
  var MAIN_MENU_ACTIONS = {
    /**
     * ## 选择难度 1
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_ONE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 1 });
    },
    /**
     * ## 选择难度 2
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_TWO: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 2 });
    },
    /**
     * ## 选择难度 3
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_THREE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 3 });
    },
    /**
     * ## 选择难度 4
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_FOUR: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 4 });
    },
    /**
     * ## 选择难度 5
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_FIVE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 5 });
    },
    /**
     * ## 选择难度 6
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_SIX: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 6 });
    },
    /**
     * ## 选择难度 7
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_SEVEN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 7 });
    },
    /**
     * ## 选择难度 8
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_EIGHT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 8 });
    },
    /**
     * ## 选择难度 9
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_NINE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 9 });
    },
    /**
     * ## 选择难度 10
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_TEN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_LEVEL, { level: 10 });
    },
    /**
     * ## 进入难度选择界面
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SWITCH_TO_DIFFICULTY);
    }
  };
  var main_menu_actions_default = MAIN_MENU_ACTIONS;

  // lib/game/actions/difficulty-actions.js
  var DIFFICULT_ACTIONS = {
    /**
     * ## 选择难度 easy
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    EASY: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_DIFFICULTY, {
        difficulty: "easy"
      });
    },
    /**
     * ## 选择难度 normal
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    NORMAL: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_DIFFICULTY, { difficulty: "normal" });
    },
    /**
     * ## 选择难度 hard
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    HARD: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_DIFFICULTY, { difficulty: "hard" });
    },
    /**
     * ## 选择难度 expert
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    EXPERT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SELECT_DIFFICULTY, { difficulty: "expert" });
    },
    /**
     * ## 返回游戏等级选择
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    BACK: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SWITCH_TO_MAIN_MENU);
    },
    /**
     * ## 确认开始游戏
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.START);
    }
  };
  var difficulty_actions_default = DIFFICULT_ACTIONS;

  // lib/game/actions/game-playing-actions.js
  var GAME_PLAYING_ACTIONS = {
    /**
     * ## 向左移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_LEFT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_MOVE, {
        ox: -1,
        oy: 0
      });
    },
    /**
     * ## 向右移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_RIGHT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_MOVE, {
        ox: 1,
        oy: 0
      });
    },
    /**
     * ## 向下移动（软降）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_DOWN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_MOVE, {
        ox: 0,
        oy: 1
      });
    },
    /**
     * ## 旋转方块
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    ROTATE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_ROTATE);
    },
    /**
     * ## 硬降（直接落地）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    DROP: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_DROP);
    },
    /**
     * ## 暂停 / 继续切换
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    TOGGLE_PAUSED: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.TOGGLE_PAUSED);
    },
    /**
     * ## 重新开始游戏
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    RESTART: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.RESTART);
    },
    /**
     * ## 强制结束游戏
     *
     * 注意：直接调用 over 属于“全局副作用”
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    QUIT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.OVER);
    },
    /**
     * ## 背景音乐开关
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    TOGGLE_MUSIC: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.TOGGLE_BGM);
    },
    /**
     * ## 切换当前游戏控制者：human/ai 相互切换
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    SWITCH_CONTROLLER: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.SWITCH_CONTROLLER);
    }
  };
  var game_playing_actions_default = GAME_PLAYING_ACTIONS;

  // lib/game/actions/paused-actions.js
  var PAUSED_ACTIONS = {
    /**
     * ## 切换暂停状态
     *
     * 继续游戏 / 重新进入游戏循环）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    TOGGLE_PAUSED: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.TOGGLE_PAUSED);
    }
  };
  var paused_actions_default = PAUSED_ACTIONS;

  // lib/game/actions/game-over-actions.js
  var GAME_OVER_ACTIONS = {
    /**
     * 确认操作（例如：Enter / Space / OK）
     *
     * 作用：
     *
     * - 重置游戏状态
     * - 返回主菜单
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.RESET);
    }
  };
  var game_over_actions_default = GAME_OVER_ACTIONS;

  // lib/game/actions/replay-actions.js
  var REPLAY_ACTIONS = {
    /**
     * ## 向左移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_LEFT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_MOVE, {
        ox: -1,
        oy: 0
      });
    },
    /**
     * ## 向右移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_RIGHT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_MOVE, {
        ox: 1,
        oy: 0
      });
    },
    /**
     * ## 向下移动（软降）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_DOWN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_MOVE, {
        ox: 0,
        oy: 1
      });
    },
    /**
     * ## 旋转方块
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    ROTATE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_ROTATE);
    },
    /**
     * ## 硬降（直接落地）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    DROP: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_DROP);
    },
    /**
     * ## 自动下落
     *
     * @param {object} payload - 命令参数
     */
    AUTO_TICK: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.BLOCK_TICK, payload);
    },
    /**
     * 确认操作
     *
     * 作用：
     *
     * - 重置游戏状态
     * - 返回主菜单
     *
     * @param {object} payload - 命令参数
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      const events = GameEvents(Game2.id);
      Game2.emit(events.RESET);
    }
  };
  var replay_actions_default = REPLAY_ACTIONS;

  // lib/engine/dispatch-command.js
  var ACTIONS_MAP = {
    "main-menu": main_menu_actions_default,
    difficulty: difficulty_actions_default,
    playing: game_playing_actions_default,
    paused: paused_actions_default,
    replay: replay_actions_default,
    "game-over": game_over_actions_default
  };
  var dispatchCommand = (cmd, { mode }) => {
    const { action, payload } = cmd;
    const actions = ACTIONS_MAP[mode];
    if (!actions) {
      return;
    }
    const handler = actions[action];
    handler?.(payload);
  };
  var dispatch_command_default = dispatchCommand;

  // lib/engine/index.js
  var Engine = {
    /**
     * ## requestAnimationFrame 的 ID
     *
     * 用于取消游戏循环。
     *
     * @type {number | null}
     */
    rafId: null,
    /**
     * ## 时间累积器
     *
     * 用于固定时间步长（fixed update / tick）， 累积每帧的 delta time，当超过阈值时执行一次游戏逻辑更新。
     *
     * @default 0
     * @type {number}
     */
    fixedAccumulator: 0,
    /**
     * ## 上一帧的时间戳
     *
     * 用于计算 delta time 和回放时间。
     *
     * @default 0
     * @type {number}
     */
    lastTickTime: 0,
    /**
     * ## 游戏配置
     *
     * 从 configuration.js 导入的全局配置对象。
     *
     * @type {object}
     */
    Configuration: configuration_default,
    /**
     * ## 任务调度器实例
     *
     * 管理 delay / interval 等定时任务。
     *
     * @default null
     * @type {Scheduler | null}
     */
    Scheduler: null,
    /**
     * ## 音频系统实例
     *
     * 管理背景音乐和音效的播放。
     *
     * @default null
     * @type {Audio | null}
     */
    Audio: null,
    /**
     * ## 游戏主控实例
     *
     * 管理游戏状态、输入、UI、回放等所有子系统。
     *
     * @default null
     * @type {Game | null}
     */
    Game: null,
    /**
     * ## 初始化引擎
     *
     * 创建 Scheduler、Audio、Game 等核心实例， 并注入相互依赖关系。
     *
     * @param {object} options - 初始化配置选项
     * @param {object} options.Elements - UI 元素配置
     * @param {object} options.Level - 等级配置
     * @returns {void}
     */
    initialize: (options) => {
      Engine.Scheduler = new scheduler_default();
      const normalizedOptions = {
        ...options,
        Scheduler: Engine.Scheduler,
        isAIPlayer: true
      };
      Engine.Audio = new audio_default(normalizedOptions);
      Engine.Game = new game_default2(normalizedOptions);
    },
    /**
     * ## 初始化游戏
     *
     * 执行完整的游戏初始化流程：
     *
     * 1. 初始化棋盘数据
     * 2. 加载最高分存档
     * 3. 设置初始模式为 main-menu
     * 4. 更新 DOM 节点 data-mode 属性
     * 5. 适配画布尺寸
     * 6. 初始化 HUD 显示
     * 7. 延迟渲染主菜单 UI（等待字体加载等）
     * 8. 订阅各模块事件
     * 9. 绑定输入设备（Keyboard/Gamepad）的事件处理器
     * 10. 启动游戏主循环
     *
     * @returns {void}
     */
    launch: () => {
      Engine.initialize(Engine.Configuration);
      const { Game: Game2 } = Engine;
      const { Store, UI: UI2 } = Game2;
      Store.resetBoard();
      Game2.loadHighScore();
      Game2.setBeginningState("main-menu");
      UI2.updateMode("main-menu");
      UI2.resize();
      UI2.updateHud();
      UI2.updateController(Store.getController());
      UI2.lazyRender();
      Engine.subscribe();
      Game2.addEventListeners();
      Engine.start();
    },
    /**
     * # 带速度控制的游戏主循环（Game Loop）
     *
     * 使用 `requestAnimationFrame` 驱动的核心渲染循环， 控制游戏的下落节奏、输入处理、渲染和动画更新。
     *
     * ## 帧循环流程
     *
     * 每一帧按以下顺序执行：
     *
     * | 步骤 | 操作                     | 说明                                         |
     * | ---- | ------------------------ | -------------------------------------------- |
     * | 1    | 防止死亡螺旋             | 限制 delta 上限为 1000ms，防止切后台回来卡死 |
     * | 2    | Scheduler.tick()         | 驱动调度器，执行到期的定时任务               |
     * | 3    | Replay.syncPlayElapsed() | 同步回放逻辑时钟                             |
     * | 4    | Replay.update()          | 更新回放系统，注入待重放的命令               |
     * | 5    | Gamepad.update()         | 更新手柄输入状态                             |
     * | 6    | CommandQueue.flush()     | 执行命令队列中的所有待执行命令               |
     * | 7    | Game.tick()              | 执行游戏逻辑（下落/碰撞/消行）               |
     * | 8    | Animations.flush()       | 合并/清理动画队列                            |
     * | 9    | UI.tickHud()             | 更新 HUD 动画                                |
     * | 10   | UI.render()              | 渲染游戏界面                                 |
     * | 11   | Animations.render()      | 叠加渲染动画特效                             |
     * | 12   | requestAnimationFrame()  | 请求下一帧                                   |
     *
     * ## 固定时间步长
     *
     * 游戏逻辑（下落）不是每帧都执行，而是根据当前等级的速度 （`Game.getSpeed()`）来控制执行频率：
     *
     * - 低等级时速度慢，下落间隔大（约 1000ms）
     * - 高等级时速度快，下落间隔小（最低 120ms）
     *
     * 这确保了游戏难度与等级挂钩，同时避免了帧率波动对游戏速度的影响。
     *
     * ## 回放特殊处理
     *
     * 当 `Replay.playing` 为 true 时，跳过游戏逻辑 tick， 因为回放系统会通过注入 command 来驱动游戏状态。
     *
     * @param {number} timestamp - RequestAnimationFrame 传入的当前时间戳（毫秒）
     * @returns {void}
     */
    tick: (timestamp) => {
      if (!Engine.lastTickTime) {
        Engine.lastTickTime = timestamp;
        Engine.fixedAccumulator = timestamp;
      }
      const { Game: Game2, Scheduler: Scheduler2 } = Engine;
      const { UI: UI2, Replay, Gamepad, Animations, CommandQueue: CommandQueue2 } = Game2;
      const isBlocked = Animations.hasBlocking();
      const stepDelta = timestamp - Engine.fixedAccumulator;
      Engine.lastTickTime = timestamp;
      Scheduler2.tick(timestamp);
      Replay.syncPlayElapsed({
        timestamp: Engine.lastTickTime,
        isBlocked
      });
      Replay.update({
        speed: Game2.getSpeed(),
        timestamp: Engine.lastTickTime
      });
      Gamepad.update(timestamp);
      CommandQueue2.flush();
      if ((!Engine.fixedAccumulator || stepDelta > Game2.getSpeed()) && !Replay.playing) {
        Game2.tick(isBlocked);
        Engine.fixedAccumulator = timestamp;
      }
      Animations.flush();
      UI2.tickHud();
      UI2.render();
      Animations.render();
      Engine.rafId = requestAnimationFrame(Engine.tick);
    },
    /**
     * ## 订阅各模块事件
     *
     * 依次订阅 Engine 自身、Audio 音频系统、Game 游戏主控的事件。 在 launch 时调用一次。
     *
     * @returns {void}
     */
    subscribe: () => {
      const { Game: Game2, Audio: Audio2 } = Engine;
      Engine._subscribe();
      Audio2.subscribe();
      Game2.subscribe();
    },
    /**
     * ## 取消订阅各模块事件
     *
     * 取消所有已订阅的事件，在 destroy 时调用。
     *
     * @returns {void}
     */
    unsubscribe: () => {
      const { Game: Game2, Audio: Audio2 } = Engine;
      Engine._unsubscribe();
      Audio2.unsubscribe();
      Game2.unsubscribe();
    },
    /**
     * ## Engine 内部事件订阅
     *
     * 订阅 `dispatch:command` 和 `dispatch:input` 两个核心事件， 它们是整个输入系统的入口。
     *
     * @private
     * @returns {void}
     */
    _subscribe: () => {
      const { Game: Game2 } = Engine;
      Game2.on(`dispatch:command`, Engine._onDispatchCommand);
      Game2.on(`dispatch:input`, Engine._onDispatchInput);
    },
    /**
     * ## Engine 内部事件取消订阅
     *
     * 取消 `dispatch:command` 和 `dispatch:input` 事件的监听。
     *
     * @private
     * @returns {void}
     */
    _unsubscribe: () => {
      const { Game: Game2 } = Engine;
      Game2.off(`dispatch:command`, Engine._onDispatchCommand);
      Game2.off(`dispatch:input`, Engine._onDispatchInput);
    },
    /**
     * ## 命令分发处理器
     *
     * 处理回放系统的命令执行，注入动画阻塞状态后交由 dispatchCommand 处理。
     *
     * @private
     * @param {object} cmd - 命令对象
     * @param {object} cmd.payload - 命令负载
     * @returns {void}
     */
    _onDispatchCommand: (cmd) => {
      const { Game: Game2 } = Engine;
      const { Animations, Store } = Game2;
      const mode = Store.getMode();
      const isBlocked = Animations.hasBlocking([
        "clear-lines",
        "countdown",
        "level-up"
      ]);
      const { payload } = cmd;
      payload.isBlocked = isBlocked;
      dispatch_command_default(cmd, { mode });
    },
    /**
     * ## 输入分发处理器
     *
     * 处理键盘、手柄、AI 等实时输入，注入动画阻塞状态和回放时间戳后交由 dispatchInput 处理。
     *
     * @private
     * @param {object} input - 输入对象
     * @returns {void}
     */
    _onDispatchInput: (input) => {
      const { Game: Game2 } = Engine;
      const { Animations, Replay } = Game2;
      const isBlocked = Animations.hasBlocking([
        "clear-lines",
        "countdown",
        "level-up"
      ]);
      const ms = Engine.lastTickTime - Replay.startTime;
      dispatch_input_default(input, { isBlocked, ms });
    },
    /**
     * ## 启动游戏主循环
     *
     * 使用 requestAnimationFrame 启动渲染循环。
     *
     * @returns {void}
     */
    start: () => {
      Engine.rafId = requestAnimationFrame(Engine.tick);
    },
    /**
     * ## 停止游戏循环
     *
     * 取消 requestAnimationFrame 回调。
     *
     * @returns {void}
     */
    stop: () => {
      if (!Engine.rafId) {
        return;
      }
      cancelAnimationFrame(Engine.rafId);
      Engine.rafId = 0;
      Engine.lastTickTime = 0;
      Engine.fixedAccumulator = 0;
    },
    /**
     * ## 重启游戏循环
     *
     * 停止当前循环后重新启动，用于从暂停恢复或标签页切回。
     *
     * @returns {void}
     */
    restart: () => {
      Engine.stop();
      Engine.start();
    },
    /**
     * ## 销毁引擎
     *
     * 清理所有资源，停止循环，取消订阅，移除事件监听，清空子模块引用。
     *
     * @returns {void}
     */
    destroy: () => {
      const { Game: Game2 } = Engine;
      Engine.stop();
      Engine.unsubscribe();
      Game2?.removeEventListeners?.();
      Engine.Audio = null;
      Engine.Game = null;
      Engine.Scheduler = null;
    }
  };
  var engine_default = Engine;

  // lib/main.js
  var main = () => {
    preloadImages(scenes_background_default);
    engine_default.launch();
  };
  var main_default = main;

  // lib/tetris.js
  main_default();
})();
