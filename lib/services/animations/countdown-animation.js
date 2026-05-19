import Base from '@/lib/core';

/**
 * # CountdownAnimation（倒计时动画）
 *
 * 在游戏开始前显示 3、2、1 的倒计时效果。
 *
 * ## 动画表现
 *
 * - 数字从 3 递减到 1
 * - 每个数字出现时 scale 从 4 快速缩小到 1（缩放动画）
 * - 每秒切换一个数字
 * - 倒计时期间阻塞用户输入
 *
 * ## 生命周期
 *
 * 1. `constructor` → 初始化状态，启动倒计时计时器
 * 2. `update(delta)` → 更新缩放动画
 * 3. `render()` → 渲染当前倒计时数字
 * 4. 数字变为 0 → 调用 `stop()` → 触发 `game:begin` 开始游戏
 *
 * @class CountdownAnimation
 */
class CountdownAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Scheduler - 任务调度器
   */
  constructor(options) {
    super(options);

    this.initialize();
    this._countdown();
  }

  /**
   * ## 初始化动画状态
   *
   * @returns {void}
   */
  initialize() {
    /**
     * ## 渲染层级
     *
     * 设为 100（UI 层），确保倒计时显示在最前面。
     *
     * @type {number}
     */
    this.layer = 100;

    /**
     * ## 是否阻塞用户输入
     *
     * 倒计时期间禁止玩家操作。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * ## 动画名称标识
     *
     * 用于 `hasBlocking()` 精确匹配。
     *
     * @type {string}
     */
    this.name = 'countdown';

    /**
     * ## 内部状态
     *
     * @type {object}
     * @property {boolean} show - 是否显示倒计时
     * @property {number} number - 当前倒计时数字（3 → 2 → 1）
     * @property {number} scale - 缩放比例（4 → 1，用于弹出动画）
     * @property {number} count - 帧计数器（控制节奏）
     * @property {number} acc - 时间累加器（秒）
     */
    this.state = {
      show: true,
      number: 3,
      scale: 4,
      count: 0,
      acc: 0,
    };

    /**
     * ## 倒计时定时器 ID
     *
     * @type {number}
     */
    this._intervalId = 0;
  }

  /**
   * ## 启动倒计时
   *
   * 播放倒计时音效，每秒切换数字。
   *
   * @private
   * @returns {void}
   */
  _countdown() {
    // 播放第一次倒计时音效
    this.emit('audio:resume:sound', { sound: 'COUNTDOWN' });

    // 每秒执行一次
    this._intervalId = this.Scheduler.interval(() => {
      // 数字递减
      this.state.number -= 1;
      // 重置缩放（新数字从大缩小）
      this.state.scale = 4;

      // 还有剩余数字，继续播放音效
      if (this.state.number >= 1) {
        this.emit('audio:resume:sound', { sound: 'COUNTDOWN' });
      }

      // 倒计时结束
      if (this.state.number <= 0) {
        this.stop();
      }
    }, 1000);
  }

  /**
   * ## 更新动画状态
   *
   * 每帧推进缩放动画（scale 从 4 平滑缩小到 1）。
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 数值大于 0，返回 false，否则返回 true
   */
  update(delta) {
    // 缩放动画：scale 从当前值线性减小到 1，速度 ×40
    this.state.scale = Math.max(1, this.state.scale - delta * 40);
    return this.state.number > 0;
  }

  /**
   * ## 倒计时结束处理
   *
   * 取消计时器，触发游戏正式开始。
   *
   * @returns {void}
   */
  stop() {
    const { Game } = this;

    // 取消倒计时定时器
    this.Scheduler.cancel(this._intervalId);

    // 触发游戏开始（进入 playing 状态，生成方块等）
    this.emit(`game:${Game.id}:begin`);
  }

  /**
   * ## 渲染动画
   *
   * 将当前状态传递给 UI 层绘制倒计时数字。
   *
   * @returns {void}
   */
  render() {
    const { state, Game } = this;
    this.emit(`ui:${Game.id}:render:countdown`, { state });
  }
}

export default CountdownAnimation;
