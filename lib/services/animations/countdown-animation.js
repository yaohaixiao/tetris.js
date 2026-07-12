import Base from '@/lib/core';
import {
  AudioEvents,
  GameEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：CountdownAnimation 倒计时动画
 *
 * ============================================================
 *
 * 在游戏开始前显示 3、2、1 的倒计时效果。
 *
 * ## 动画表现
 *
 * - 数字从 3 递减到 1
 * - 每个数字出现时 scale 从 4 快速缩小到 1
 * - 每秒切换一个数字
 * - 倒计时期间阻塞用户输入
 *
 * ## 时间驱动
 *
 * - 缩放动画：每 16ms 递减 scale，直到等于 1
 * - 数字切换：每 1000ms 切换数字并重置 scale
 * - 动画结束：设置 _finished = true
 *
 * ## 生命周期
 *
 * 1. Constructor → 启动 Scheduler 定时器
 * 2. Scheduler 每 16ms 更新缩放，每 1000ms 切换数字
 * 3. Number <= 0 → 设置 _finished = true
 * 4. Dispose() → 取消定时器 → 触发 game:begin
 *
 * @augments Base
 * @class CountdownAnimation
 */
class CountdownAnimation extends Base {
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
   * ## initialize：初始化动画状态
   *
   * 创建缩放和倒计时两个 Scheduler 定时器。
   *
   * @returns {void}
   */
  initialize() {
    /**
     * 渲染层级（100 = UI 层）。
     *
     * @type {number}
     */
    this.layer = 100;

    /**
     * 是否阻塞用户输入。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * 动画名称标识。
     *
     * @type {string}
     */
    this.name = 'countdown';

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * 动画状态。
     *
     * @type {object}
     * @property {boolean} show - 是否显示倒计时
     * @property {number} number - 当前倒计时数字
     * @property {number} scale - 缩放比例
     */
    this.state = {
      show: true,
      number: 3,
      scale: 4,
    };

    const { Scheduler } = this;
    const events = AudioEvents();

    // 播放第一次倒计时音效
    this.emit(events.PLAY_SOUND, { sound: 'COUNTDOWN' });

    /**
     * 缩放动画定时器 ID。
     *
     * @type {number}
     */
    this._scaleId = Scheduler.interval(() => {
      this.state.scale = Math.max(1, this.state.scale - 0.016 * 40);
    }, 16);

    /**
     * 倒计时切换定时器 ID。
     *
     * @type {number}
     */
    this._countdownId = Scheduler.interval(() => {
      this.state.number -= 1;
      this.state.scale = 4;

      // 还有剩余数字，播放倒计时音效
      if (this.state.number >= 1) {
        this.emit(events.PLAY_SOUND, { sound: 'COUNTDOWN' });
      }

      // 倒计时结束
      if (this.state.number <= 0) {
        this._finished = true;
      }
    }, 1000);
  }

  /**
   * ## dispose：清理资源
   *
   * 取消所有 Scheduler 定时器，触发游戏开始事件。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;

    if (this._scaleId != null) {
      Scheduler.cancel(this._scaleId);
    }

    if (this._countdownId != null) {
      Scheduler.cancel(this._countdownId);
    }

    // 触发游戏开始
    const { Game } = this;
    const events = GameEvents(Game.id);
    this.emit(events.BEGIN);
  }

  /**
   * ## render：渲染动画
   *
   * 将当前状态传递给 UI 层绘制倒计时数字。
   *
   * @returns {void}
   */
  render() {
    const { Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.RENDER_COUNTDOWN, { state: this.state });
  }
}

export default CountdownAnimation;
