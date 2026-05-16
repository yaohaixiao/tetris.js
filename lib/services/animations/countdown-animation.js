import Base from '@/lib/core';

/**
 * # CountdownAnimation
 *
 * 倒计时动画类，用于在游戏开始前显示 3、2、1 的倒计时效果。
 *
 * ## 职责
 *
 * - 控制倒计时数字（3 → 2 → 1）
 * - 管理缩放动画（scale 由大到小）
 * - 控制动画节奏（基于时间累加器）
 * - 在结束时触发游戏开始
 *
 * ## 生命周期
 *
 * 1. 创建实例
 * 2. 每帧调用 update(delta)
 * 3. 渲染由 render() 执行
 * 4. 倒计时结束后调用 stop() 并销毁
 */
class CountdownAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);

    this.initialize();
    this._countdown();
  }

  initialize() {
    /**
     * ## 渲染层级（UI 层，显示在最前面）
     *
     * @type {number}
     */
    this.layer = 100;

    /**
     * ## 是否阻塞用户输入
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * ## 动画名称标识
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
     * @property {number} scale - 缩放比例（用于动画效果）
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

    this._intervalId = 0;
  }

  _countdown() {
    this.emit('audio:resume:sound', { sound: 'COUNTDOWN' });

    this._intervalId = this.Scheduler.interval(() => {
      this.state.number -= 1;
      this.state.scale = 4;

      if (this.state.number >= 1) {
        this.emit('audio:resume:sound', { sound: 'COUNTDOWN' });
      }

      if (this.state.number <= 0) {
        this.stop();
      }
    }, 1000);
  }

  /**
   * ## 更新动画状态
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 是否继续存活（true=继续，false=结束）
   */
  update(delta) {
    // 只负责缩放动画（帧驱动）
    this.state.scale = Math.max(1, this.state.scale - delta * 40);
    return this.state.number > 0;
  }

  /**
   * ## 倒计时结束处理
   *
   * - 切换游戏状态为 playing
   * - 启动游戏主逻辑
   */
  stop() {
    const { Game } = this;

    this.Scheduler.cancel(this._intervalId);
    // 启动游戏逻辑（生成方块等）
    this.emit(`game:${Game.id}:begin`);
  }

  /**
   * ## 渲染动画
   *
   * 将当前 state 传递给渲染函数
   */
  render() {
    const { state, Game } = this;
    this.emit(`ui:${Game.id}:render:countdown`, { state });
  }
}

export default CountdownAnimation;
