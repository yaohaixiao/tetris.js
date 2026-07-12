import Base from '@/lib/core';
import { AudioEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：PausedAnimation 暂停动画
 *
 * ============================================================
 *
 * 在游戏暂停时显示暂停界面，并播放每秒一次的滴答提示音。 常驻动画，不会自动结束，需要外部调用 stop() 移除。
 *
 * ## 动画表现
 *
 * - 暂停时显示半透明遮罩和 "PAUSED" 文字
 * - 每秒播放一次滴答音效
 * - 动画层级最高（500），确保遮罩在最上层
 * - 阻塞所有用户输入
 *
 * ## 时间驱动
 *
 * 全部使用 Scheduler 驱动：
 *
 * - 滴答音效：每 1000ms 播放一次
 * - 外部调用 stop() 设置 _finished = true 结束动画
 *
 * ## 生命周期
 *
 * 1. Constructor → 启动滴答定时器
 * 2. Scheduler 每秒播放音效
 * 3. 外部调用 stop() → 设置 _finished = true
 * 4. AnimationSystem 调用 dispose() → 取消定时器
 *
 * @augments Base
 * @class PausedAnimation
 */
class PausedAnimation extends Base {
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
   * ## initialize：初始化暂停动画
   *
   * 启动滴答定时器。
   *
   * @returns {void}
   */
  initialize() {
    /**
     * 渲染层级（500 = 最高层）。
     *
     * @type {number}
     */
    this.layer = 500;

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
    this.name = 'paused';

    /**
     * 是否已结束。
     *
     * 由外部调用 stop() 设置为 true， AnimationSystem 在 flush() 时自动移除。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * 是否处于激活状态。
     *
     * @type {boolean}
     */
    this.active = true;

    // 启动滴答定时器
    this._startTick();
  }

  /**
   * ## _startTick：启动滴答定时器
   *
   * 每 1000ms 播放一次滴答音效。
   *
   * @private
   * @returns {void}
   */
  _startTick() {
    const { Scheduler } = this;
    const events = AudioEvents();

    /**
     * 滴答定时器 ID。
     *
     * @type {number}
     */
    this._tickId = Scheduler.interval(() => {
      this.emit(events.PLAY_SOUND, { sound: 'SECOND_TICK' });
    }, 1000);
  }

  /**
   * ## resume：恢复暂停动画
   *
   * 重新启动滴答定时器。已活跃时忽略。
   *
   * @returns {void}
   */
  resume() {
    if (this.active) return;
    this.active = true;
    this._startTick();
  }

  /**
   * ## stop：暂停结束处理
   *
   * 标记动画结束，AnimationSystem 会在 flush() 时清理。
   *
   * @returns {void}
   */
  stop() {
    this.active = false;
    this._finished = true;
  }

  /**
   * ## dispose：清理资源
   *
   * 取消滴答定时器。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;
    if (this._tickId != null) {
      Scheduler.cancel(this._tickId);
    }
  }

  /**
   * ## render：渲染暂停动画
   *
   * 实际的渲染由 UI 层监听事件完成。
   *
   * @returns {void}
   */
  render() {
    // UI 层通过事件处理渲染
  }
}

export default PausedAnimation;
