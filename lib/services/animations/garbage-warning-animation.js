import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # GarbageWarningAnimation（垃圾行预警动画）
 *
 * 整个棋盘区域红色闪烁，提示即将受到垃圾行攻击。
 *
 * ## 视觉表现
 *
 * - 整个棋盘区域叠加半透明红色
 * - 5 次闪烁（每 100ms 切换一次），共 500ms
 * - 动画结束后自动移除
 *
 * ## 生命周期
 *
 * 1. `initialize()` → 启动闪烁序列（Scheduler.sequence）
 * 2. 每帧 `render()` → 发送 RENDER_GARBAGE_WARNING 事件给 UI
 * 3. 5 次闪烁后 `_finished = true` → AnimationSystem 自动移除
 * 4. `dispose()` → 取消 Scheduler 任务
 *
 * ## 动画对象接口
 *
 * - `layer = 150`：在消行动画(200)之下，棋盘(0)之上
 * - `blocking = false`：不阻塞玩家操作
 * - `name = 'garbage-warning'`：用于 hasBlocking() 精确匹配
 *
 * @augments Base
 * @class GarbageWarningAnimation
 */
class GarbageWarningAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Scheduler - 调度器实例
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化动画
   *
   * 设置动画属性，启动闪烁序列。
   *
   * @returns {void}
   */
  initialize() {
    const { Scheduler } = this;

    /** 渲染层级：150，在消行动画之下、棋盘之上 */
    this.layer = 150;

    /** 不阻塞玩家操作 */
    this.blocking = true;

    /** 动画名称标识 */
    this.name = 'garbage-warning';

    /** 动画是否已结束 */
    this._finished = false;

    /** 当前闪烁次数 */
    this._flashes = 0;

    /** 最大闪烁次数（5 次） */
    this._maxFlashes = 5;

    /** 当前是否可见（true=显示红色, false=隐藏） */
    this._visible = true;

    /** Scheduler 任务 ID 列表，用于 dispose 时批量取消 */
    this._schedulerIds = [];

    /**
     * 闪烁切换函数
     *
     * 每次调用切换可见状态，闪烁次数 +1。 达到最大次数后标记动画结束。
     */
    const toggle = () => {
      this._visible = !this._visible;
      this._flashes++;

      if (this._flashes >= this._maxFlashes) {
        this._finished = true;
      }
    };

    // 每 100ms 切换一次，共 5 次
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
   * ## 清理资源
   *
   * 由 AnimationSystem 在移除动画时自动调用。 取消所有 Scheduler 定时器。
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
   * ## 渲染动画
   *
   * 仅在可见帧发送渲染事件给 UI 层。 UI 层收到事件后在棋盘上绘制红色半透明覆盖。
   *
   * @returns {void}
   */
  render() {
    if (!this._visible) return;

    const { Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.RENDER_GARBAGE_WARNING);
  }
}

export default GarbageWarningAnimation;
