import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # ClearScoreAnimation（消除得分动画）
 *
 * 在消除行位置显示上浮渐隐的得分数字。
 *
 * ## 动画表现
 *
 * - 得分数字从消除行位置持续上浮
 * - 透明度从 1 逐渐衰减到 0，营造淡出效果
 * - 不阻塞用户输入，纯粹视觉反馈
 *
 * ## 时间驱动
 *
 * 全部使用 Scheduler 驱动，不使用 `update(delta)`：
 *
 * - 状态更新：每 16ms 固定步长更新透明度和上浮偏移
 * - 动画结束：alpha <= 0 时设置 `_finished = true`
 *
 * ## 生命周期
 *
 * 1. `constructor` → `initialize()` → 记录得分数据，启动 Scheduler 定时器
 * 2. Scheduler 每 16ms 更新状态
 * 3. `alpha <= 0` → 设置 `_finished = true`
 * 4. AnimationSystem 调用 `dispose()` → 取消定时器
 *
 * @augments Base
 * @class ClearScoreAnimation
 */
class ClearScoreAnimation extends Base {
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
    const { scoreData, Scheduler } = this;
    const { score, lines } = scoreData;

    /**
     * ## 渲染层级
     *
     * 设为 300，在消行闪烁层（200）之上，确保分数可见。
     *
     * @type {number}
     */
    this.layer = 300;

    /**
     * ## 是否阻塞用户输入
     *
     * 分数动画不阻塞操作。
     *
     * @type {boolean}
     */
    this.blocking = false;

    /**
     * ## 动画名称标识
     *
     * @type {string}
     */
    this.name = 'clear-score';

    /**
     * ## 是否已结束
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * ## 动画状态
     *
     * | 属性    | 类型   | 说明                        |
     * | ------- | ------ | --------------------------- |
     * | score   | number | 本次消除得分                |
     * | y       | number | 消除行号，UI 层换算像素坐标 |
     * | alpha   | number | 当前透明度（1 → 0 渐隐）    |
     * | offsetY | number | Y 轴上浮偏移量（逐帧递增）  |
     *
     * @type {{ score: number; y: number; alpha: number; offsetY: number }}
     */
    this.state = {
      score,
      y: lines[lines.length - 1],
      alpha: 1,
      offsetY: 0,
    };

    /**
     * ## 状态更新定时器 ID
     *
     * 每 16ms 以固定步长更新透明度和上浮偏移。
     *
     * @type {number}
     */
    this._updateId = Scheduler.interval(() => {
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
    const { Scheduler } = this;

    Scheduler.cancel(this._updateId);
  }

  /**
   * ## 渲染动画
   *
   * 每帧由 AnimationSystem 调用。将当前状态传递给 UI 层绘制上浮渐隐的得分数字。
   *
   * @returns {void}
   */
  render() {
    const { state, Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.RENDER_CLEAR_SCORE, { state: { ...state } });
  }
}

export default ClearScoreAnimation;
