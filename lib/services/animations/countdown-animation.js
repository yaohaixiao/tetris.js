import Base from '@/lib/core';
import {
  AudioEvents,
  GameEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # CountdownAnimation（倒计时动画）
 *
 * 在游戏开始前显示 3、2、1 的倒计时效果。
 *
 * ## 动画表现
 *
 * - 数字从 3 递减到 1
 * - 每个数字出现时 scale 从 4 快速缩小到 1（弹出动画）
 * - 每秒切换一个数字
 * - 倒计时期间阻塞用户输入
 *
 * ## 时间驱动
 *
 * 全部使用 Scheduler 驱动，不使用 `update(delta)`：
 *
 * - 缩放动画：每 16ms 递减 scale，直到等于 1
 * - 数字切换：每 1000ms 切换数字并重置 scale
 * - 动画结束：设置 `_finished = true`，AnimationSystem 自动调用 `dispose()` 清理
 *
 * ## 生命周期
 *
 * 1. `constructor` → `initialize()` → 启动 Scheduler 定时器
 * 2. Scheduler 每 16ms 更新缩放，每 1000ms 切换数字
 * 3. `number <= 0` → 设置 `_finished = true`
 * 4. AnimationSystem 调用 `dispose()` → 取消定时器 → 触发 `game:begin`
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
   * ## 初始化动画状态
   *
   * 设置动画属性，创建缩放和倒计时两个 Scheduler 定时器。
   *
   * @returns {void}
   */
  initialize() {
    /**
     * ## 渲染层级
     *
     * 设为 100（UI 层），确保倒计时显示在前景。
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
     * ## 是否已结束
     *
     * 设为 `true` 后，AnimationSystem 会在 `flush()` 时自动移除。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * ## 动画状态
     *
     * @type {object}
     * @property {boolean} show - 是否显示倒计时
     * @property {number} number - 当前倒计时数字（3 → 2 → 1）
     * @property {number} scale - 缩放比例（4 → 1，用于弹出动画）
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
     * ## 缩放动画定时器 ID
     *
     * 每 16ms 将 scale 减小 0.64（0.016 × 40），直到最小值为 1。
     *
     * @type {number}
     */
    this._scaleId = Scheduler.interval(() => {
      this.state.scale = Math.max(1, this.state.scale - 0.016 * 40);
    }, 16);

    /**
     * ## 倒计时切换定时器 ID
     *
     * 每 1000ms 切换数字并重置缩放比例。 当数字减到 0 时，设置 `_finished = true` 结束动画。
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

      // 倒计时结束，标记动画完成
      if (this.state.number <= 0) {
        this._finished = true;
      }
    }, 1000);
  }

  /**
   * ## 清理资源
   *
   * 由 AnimationSystem 在移除动画时自动调用。 取消所有 Scheduler 定时器，并触发游戏开始事件。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;

    // 取消缩放动画定时器
    if (this._scaleId != null) {
      Scheduler.cancel(this._scaleId);
    }

    // 取消倒计时切换定时器
    if (this._countdownId != null) {
      Scheduler.cancel(this._countdownId);
    }

    // 触发游戏开始（进入 playing 状态，生成方块等）
    const { Game } = this;
    const events = GameEvents(Game.id);
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
    const { Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.RENDER_COUNTDOWN, { state: this.state });
  }
}

export default CountdownAnimation;
