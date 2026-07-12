import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：GarbageWarningAnimation 垃圾行预警动画
 *
 * ============================================================
 *
 * 整个棋盘区域红色闪烁，提示即将受到垃圾行攻击。
 *
 * ## 视觉表现
 *
 * - 整个棋盘区域叠加半透明红色
 * - 5 次闪烁（每 120ms 切换一次），共 600ms
 * - 动画结束后自动移除
 *
 * ## 生命周期
 *
 * 1. Initialize() → 启动闪烁序列
 * 2. 每帧 render() → 发送渲染事件给 UI
 * 3. 5 次闪烁后 _finished = true → 自动移除
 * 4. Dispose() → 取消 Scheduler 任务
 *
 * @augments Base
 * @class GarbageWarningAnimation
 */
class GarbageWarningAnimation extends Base {
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
   * ## initialize：初始化动画
   *
   * 设置动画核心属性，启动闪烁序列。 5 次可见性切换，每次间隔 120ms，总时长 600ms。
   *
   * @returns {void}
   */
  initialize() {
    const { Scheduler } = this;

    /**
     * 渲染层级（150，在消行动画之下、棋盘之上）。
     *
     * @type {number}
     */
    this.layer = 150;

    /**
     * 是否阻塞玩家操作。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * 动画名称标识。
     *
     * @type {string}
     */
    this.name = 'garbage-warning';

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * 当前已完成闪烁次数。
     *
     * @type {number}
     */
    this._flashes = 0;

    /**
     * 最大闪烁次数。
     *
     * @type {number}
     */
    this._maxFlashes = 5;

    /**
     * 当前可见性状态。
     *
     * @type {boolean}
     */
    this._visible = true;

    /**
     * Scheduler 任务 ID 列表。
     *
     * @type {number[]}
     */
    this._schedulerIds = [];

    /**
     * 闪烁切换函数。 每次被调用时切换可见状态并递增计数， 达到最大次数后标记动画结束。
     *
     * @returns {void}
     */
    const toggle = () => {
      this._visible = !this._visible;
      this._flashes++;

      if (this._flashes >= this._maxFlashes) {
        this._finished = true;
      }
    };

    // 启动闪烁序列：5 次 toggle，每次间隔 120ms
    const ids = Scheduler.sequence([
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
    ]);

    this._schedulerIds = ids;
  }

  /**
   * ## dispose：清理资源
   *
   * 取消所有 Scheduler 任务。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;
    for (const id of this._schedulerIds) {
      Scheduler.cancel(id);
    }
  }

  /**
   * ## render：渲染动画
   *
   * 每帧由 AnimationSystem 调用。 检查回合有效性和可见性后，发送渲染事件给 UI 层。
   *
   * @returns {void}
   */
  render() {
    const { roundId, Battle, _visible } = this;

    // 回合有效性检查：跨回合残留则强制结束
    if (roundId !== Battle.getRoundId()) {
      this._finished = true;
      return;
    }

    // 不可见帧跳过渲染
    if (!_visible) {
      return;
    }

    const { Game, amount } = this;
    const events = UIEvents(Game.id);
    this.emit(events.RENDER_GARBAGE_WARNING, { amount });
  }
}

export default GarbageWarningAnimation;
