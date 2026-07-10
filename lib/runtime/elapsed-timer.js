import Base from '@/lib/core/index.js';
import isElement from '@/lib/utils/types/is-element.js';

/*
 * ============================================================
 * # 模块：ElapsedTimer 计时器
 * ============================================================
 *
 * ## 功能描述
 *
 * 提供计时器功能，支持开始、暂停、重置，
 * 并自动将秒数格式化为 HH:mm:ss 显示在指定容器中。
 * 适用于游戏耗时统计、排行榜计时等场景。
 *
 * ## 双计时器设计
 *
 * 本模块维护两个独立的计时器，分别服务于不同场景：
 *
 * ### 1. 游戏计时（Elapsed Timer）
 *
 * - 记录当前对局的游戏时长
 * - 可暂停/恢复（暂停游戏时计时暂停）
 * - 游戏结束或重置时归零
 * - 用于排行榜数据提交
 *
 * ### 2. 会话计时（Session Timer）
 *
 * - 记录从游戏启动到当前的总时长
 * - 不可暂停，始终运行
 * - 重置游戏时不受影响（继续累加）
 * - 用于统计玩家在游戏中的总停留时间
 *
 * ## 使用示例
 *
 * ```javascript
 * const timer = new ElapsedTimer({
 *   element: document.getElementById('timer-display'),
 *   Player: { name: 'human', index: 0 },
 *   Store: gameStore,
 *   Scheduler: scheduler,
 * });
 *
 * timer.start();   // 开始游戏计时
 * timer.pause();   // 暂停游戏计时
 * timer.reset();   // 重置游戏计时（会话计时不受影响）
 * ```
 *
 * @augments Base
 * @class ElapsedTimer
 */
class ElapsedTimer extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置项
   * @param {HTMLElement | string} options.element - 计时器显示容器（DOM 元素或 ID 字符串）
   * @param {object} options.Player - 玩家信息对象
   * @param {string} options.Player.name - 玩家名称
   * @param {number} options.Player.index - 玩家索引
   * @param {object} options.Scheduler - 调度器实例
   * @param {object} options.Store - 游戏状态存储
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，传入配置项
    super(options);

    // 执行初始化
    this.initialize();
  }

  /**
   * ## initialize：初始化计时器实例
   *
   * 绑定 DOM 容器，重置所有内部状态，并启动会话计时器。 会话计时器在构造函数中自动启动，无需外部调用。
   *
   * @returns {void}
   */
  initialize() {
    const { element, Player, Scheduler, Store } = this;
    const { name, index } = Player;

    /**
     * 容器 DOM 元素 计时器会将格式化后的时间字符串渲染到此元素中
     *
     * @type {HTMLElement}
     */
    this.container = isElement(element)
      ? element
      : document.querySelector(`#${name}-${index}-${element}`);

    /**
     * 当前累计的游戏总秒数（可暂停） 从 0 开始，每秒递增 1，暂停游戏时停止累加
     *
     * @type {number}
     */
    this.elapsedSeconds = 0;

    /**
     * 游戏计时器标识符 用于后续清除游戏计时器（暂停或重置时）
     *
     * @type {number | null}
     */
    this.elapsedId = null;

    /**
     * 当前累计的会话总秒数（不可暂停） 从 0 开始，每秒递增 1，始终运行不受暂停影响
     *
     * @type {number}
     */
    this.sessionSeconds = 0;

    /**
     * 会话计时器标识符 用于后续清除会话计时器（应用销毁时）
     *
     * @type {number | null}
     */
    this.sessionId = null;

    /**
     * 游戏计时器当前是否正在运行 true: 正在计时 | false: 已暂停或未启动
     *
     * @type {boolean}
     */
    this.isRunning = false;

    /*
     * ============================================================
     * 步骤 1：启动会话计时器
     * ============================================================
     *
     * 会话计时器从游戏启动开始运行，不受暂停影响，
     * 用于统计玩家在游戏中的总停留时间。
     * 即使游戏重置，会话计时器也不会重置。
     */
    this.sessionId = Scheduler.interval(() => {
      // 会话秒数 +1
      this.sessionSeconds += 1;
      // 同步到 Store，供其他模块读取
      Store.setSessionTime(this.sessionSeconds);
    }, 1000);
  }

  /**
   * ## padZero：数字补零
   *
   * 将单个数字转换为两位数格式，不足两位时在前面补 0。
   *
   * @example
   *   padZero(5); // '05'
   *   padZero(12); // '12'
   *
   * @param {number} num - 需要格式化的数字（0-99）
   * @returns {string} 补零后的两位数字符串
   */
  padZero(num) {
    return num < 10 ? `0${num}` : String(num);
  }

  /**
   * ## formatTime：格式化总秒数
   *
   * 将总秒数转换为 HH:mm:ss 格式。
   *
   * @example
   *   formatTime(0); // '00:00:00'
   *   formatTime(65); // '00:01:05'
   *   formatTime(3665); // '01:01:05'
   *
   * @param {number} seconds - 总秒数（非负整数）
   * @returns {string} 格式化后的时间字符串 HH:mm:ss
   */
  formatTime(seconds) {
    // 计算小时数（1小时 = 3600秒）
    const h = Math.floor(seconds / 3600);
    // 计算分钟数（剩余秒数中取整到分钟）
    const m = Math.floor((seconds % 3600) / 60);
    // 计算秒数（剩余不足1分钟的秒数）
    const s = seconds % 60;
    // 拼接为 HH:mm:ss 格式
    return `${this.padZero(h)}:${this.padZero(m)}:${this.padZero(s)}`;
  }

  /**
   * ## render：更新页面显示
   *
   * 将当前 elapsedSeconds 格式化后渲染到指定的容器 DOM 中。 只更新游戏计时显示，会话计时不显示在 HUD 中。
   *
   * @returns {void}
   */
  render() {
    this.container.textContent = this.formatTime(this.elapsedSeconds);
  }

  /**
   * ## start：开始或继续游戏计时
   *
   * 如果计时器已经在运行，则忽略本次调用。 从暂停状态恢复时，继续累加而非重新开始。
   *
   * @example
   *   timer.start(); // 开始计时，每秒更新一次显示
   *
   * @returns {void}
   */
  start() {
    // 如果已经在运行，直接返回，避免重复启动
    if (this.isRunning) {
      return;
    }

    const { Scheduler, Store } = this;

    // 标记为运行状态
    this.isRunning = true;

    // 启动游戏计时器，每秒执行一次
    this.elapsedId = Scheduler.interval(() => {
      // 游戏秒数 +1
      this.elapsedSeconds += 1;
      // 同步到 Store，供排行榜等模块读取
      Store.setElapsedTime(this.elapsedSeconds);
      // 更新页面显示
      this.render();
    }, 1000);
  }

  /**
   * ## pause：暂停游戏计时
   *
   * 如果计时器已经暂停，则忽略本次调用。 暂停后可以调用 start() 继续计时，秒数从暂停时的值继续累加。
   *
   * @example
   *   timer.pause(); // 暂停计时，显示停留在当前时间
   *
   * @returns {void}
   */
  pause() {
    // 如果已经暂停，直接返回
    if (!this.isRunning) {
      return;
    }

    const { Scheduler } = this;

    // 清除定时器，停止计时
    Scheduler.cancel(this.elapsedId);
    // 清空定时器标识符
    this.elapsedId = null;
    // 标记为暂停状态
    this.isRunning = false;
  }

  /**
   * ## reset：重置游戏计时器
   *
   * 暂停游戏计时并将游戏秒数重置为 0，同时更新显示。
   *
   * ### 与会话计时器的关系
   *
   * - 游戏计时（elapsedSeconds）：重置为 0
   * - 会话计时（sessionSeconds）：保持不变，继续累加
   *
   * 这样设计使得玩家在多次对局中，会话计时可以累计总游戏时长， 而游戏计时只记录当前对局的时长。
   *
   * @example
   *   timer.reset(); // 显示变为 '00:00:00'，计时停止
   *
   * @returns {void}
   */
  reset() {
    const { Store } = this;

    // 先暂停游戏计时（清除定时器）
    this.pause();

    // 游戏秒数归零
    this.elapsedSeconds = 0;
    // 同步到 Store
    Store.setElapsedTime(this.elapsedSeconds);

    // 会话计时保持不变，继续累加
    // 不重置 sessionSeconds，不取消 sessionId

    // 更新显示为 00:00:00
    this.render();
  }

  /**
   * ## destroy：销毁计时器实例
   *
   * 清理所有资源：取消游戏计时器和会话计时器。 在应用销毁或组件卸载时调用，防止内存泄漏。
   *
   * @returns {void}
   */
  destroy() {
    const { Scheduler } = this;

    // 取消游戏计时器
    if (this.elapsedId !== null) {
      Scheduler.cancel(this.elapsedId);
      this.elapsedId = null;
    }

    // 取消会话计时器
    if (this.sessionId !== null) {
      Scheduler.cancel(this.sessionId);
      this.sessionId = null;
    }

    // 重置运行状态
    this.isRunning = false;
  }

  /**
   * ## getElapsedTime：获取格式化后的游戏耗时
   *
   * 获取当前游戏累计总秒数的格式化字符串。
   *
   * @example
   *   const time = timer.getElapsedTime(); // '01:02:05'
   *
   * @returns {string} 格式化后的时间字符串 HH:mm:ss
   */
  getElapsedTime() {
    return this.formatTime(this.elapsedSeconds);
  }

  /**
   * ## getElapsedSeconds：获取游戏耗时的总秒数
   *
   * 获取当前游戏累计的总秒数，用于提交排行榜数据或进行计算。
   *
   * @example
   *   const seconds = timer.getElapsedSeconds(); // 3725
   *
   * @returns {number} 累计总秒数
   */
  getElapsedSeconds() {
    return this.elapsedSeconds;
  }

  /**
   * ## getSessionTime：获取格式化后的会话时长
   *
   * 获取当前会话累计总秒数的格式化字符串。
   *
   * @example
   *   const time = timer.getSessionTime(); // '01:02:05'
   *
   * @returns {string} 格式化后的时间字符串 HH:mm:ss
   */
  getSessionTime() {
    return this.formatTime(this.sessionSeconds);
  }

  /**
   * ## getSessionSeconds：获取会话时长的总秒数
   *
   * 获取当前会话累计的总秒数，用于统计玩家在游戏中的总停留时间。
   *
   * @example
   *   const seconds = timer.getSessionSeconds(); // 3725
   *
   * @returns {number} 累计总秒数
   */
  getSessionSeconds() {
    return this.sessionSeconds;
  }
}

export default ElapsedTimer;
