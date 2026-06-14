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
 * - 5 次闪烁（每 120ms 切换一次），共 600ms
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
 * - `blocking = true`：阻塞玩家操作
 * - `name = 'garbage-warning'`：用于 hasBlocking() 精确匹配
 *
 * @augments Base
 * @class GarbageWarningAnimation
 */
class GarbageWarningAnimation extends Base {
  /**
   * ## 构造函数
   *
   * 调用父类构造函数并初始化动画。父类构造函数会完成基础的依赖注入 （如 Game、Scheduler、Battle 等实例的挂载）。
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例，提供游戏全局状态和 ID
   * @param {object} options.Scheduler - 调度器实例，用于管理定时任务
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，完成基础属性注入
    super(options);
    // 立即启动动画的初始化流程
    this.initialize();
  }

  /**
   * ## 初始化动画
   *
   * 设置动画的核心属性（层级、阻塞状态、名称等），并启动一个由 Scheduler 管理的闪烁序列。闪烁序列包含 5 次可见性切换， 每次间隔
   * 120ms，总时长 600ms。
   *
   * @returns {void}
   */
  initialize() {
    // 从实例上解构 Scheduler，方便后续调用
    const { Scheduler } = this;

    /** 渲染层级 设置为 150，位于消行动画（层级 200）之下、棋盘（层级 0）之上。 AnimationSystem 会根据此值决定渲染顺序。 */
    this.layer = 150;

    /**
     * 是否阻塞玩家操作 设置为 true，表示在动画播放期间禁止玩家的输入操作。 AnimationSystem 会通过 hasBlocking()
     * 检查此属性。 注意：文档注释中描述为 false，但实际代码设置为 true。
     */
    this.blocking = true;

    /** 动画名称标识 用于在 AnimationSystem 中精确识别和查找此动画实例。 */
    this.name = 'garbage-warning';

    /**
     * 动画结束标记 当闪烁次数达到上限时设置为 true，AnimationSystem 检测到此标记后会 自动调用 dispose()
     * 并将此动画从活动列表中移除。
     */
    this._finished = false;

    /** 当前已完成闪烁次数计数器 每次可见性切换时递增，用于判断是否达到最大闪烁次数。 */
    this._flashes = 0;

    /** 最大闪烁次数 闪烁 5 次后动画结束。由于每次切换算一次闪烁， 实际视觉表现为 5 次交替显隐。 */
    this._maxFlashes = 5;

    /** 当前可见性状态 true 表示当前帧应显示红色覆盖层，false 表示隐藏。 在 render() 中根据此值决定是否发送渲染事件。 */
    this._visible = true;

    /**
     * Scheduler 任务 ID 列表 存储 sequence 调用返回的所有任务 ID，用于在 dispose() 时批量取消。
     * 即使动画提前结束，也能确保所有定时器被正确清理。
     */
    this._schedulerIds = [];

    /**
     * 闪烁切换函数
     *
     * 每次被 Scheduler 调用时：
     *
     * 1. 切换可见状态（_visible 取反）
     * 2. 闪烁次数计数器 +1
     * 3. 检查是否达到最大闪烁次数，若是则标记动画结束
     *
     * @returns {void}
     */
    const toggle = () => {
      // 切换可见性：true ↔ false
      this._visible = !this._visible;
      // 递增闪烁次数
      this._flashes++;

      /*
       * 达到最大闪烁次数时，标记动画已结束
       * AnimationSystem 会在下次检测时清理此动画
       */
      if (this._flashes >= this._maxFlashes) {
        this._finished = true;
      }
    };

    /**
     * 启动闪烁序列
     *
     * Scheduler.sequence 接收一个任务数组，按顺序依次执行。 每个任务的 delay 表示距离上一个任务完成后的等待时间（ms）。
     * 共执行 5 次 toggle，每次间隔 120ms，总耗时 600ms。
     *
     * 返回值是所有创建任务的 ID 数组，保存用于后续取消。
     */
    const ids = Scheduler.sequence([
      { fn: toggle, delay: 120 }, // 第 1 次闪烁：120ms 后执行
      { fn: toggle, delay: 120 }, // 第 2 次闪烁：再等 120ms 后执行
      { fn: toggle, delay: 120 }, // 第 3 次闪烁：再等 120ms 后执行
      { fn: toggle, delay: 120 }, // 第 4 次闪烁：再等 120ms 后执行
      { fn: toggle, delay: 120 }, // 第 5 次闪烁：再等 120ms 后执行
    ]);

    // 保存任务 ID 列表，供 dispose() 使用
    this._schedulerIds = ids;
  }

  /**
   * ## 清理资源
   *
   * 由 AnimationSystem 在检测到 _finished 为 true 后自动调用。 遍历所有 Scheduler 任务 ID
   * 并逐一取消，防止内存泄漏和 已销毁动画继续执行回调。
   *
   * @returns {void}
   */
  dispose() {
    // 从实例上解构 Scheduler
    const { Scheduler } = this;
    // 遍历并取消所有已注册的定时任务
    for (const id of this._schedulerIds) {
      Scheduler.cancel(id);
    }
  }

  /**
   * ## 渲染动画
   *
   * 在每一帧由 AnimationSystem 调用。负责：
   *
   * 1. 检查当前回合是否仍然有效（防止跨回合残留）
   * 2. 检查当前帧是否应该显示（_visible 状态）
   * 3. 向 UI 层发送渲染事件，触发红色覆盖层绘制
   *
   * @returns {void}
   */
  render() {
    // 解构所需属性
    const { roundId, Battle, _visible } = this;

    /**
     * 回合有效性检查
     *
     * 如果动画所属的 roundId 与 Battle 当前回合的 roundId 不一致， 说明动画已经跨回合残留（理论上不应该发生），
     * 此时强制标记动画结束，由 AnimationSystem 清理。
     */
    if (roundId !== Battle.getRoundId()) {
      this._finished = true;
      return; // 提前退出，不发送渲染事件
    }

    /**
     * 可见性检查
     *
     * 如果当前帧不可见（_visible 为 false），不发送渲染事件。 UI 层在未收到事件时不会绘制红色覆盖层， 从而产生"闪烁"的视觉效果。
     */
    if (!_visible) {
      return;
    }

    // 解构 Game 实例用于获取游戏 ID
    const { Game, amount } = this;
    // 获取当前游戏的 UI 事件定义
    const events = UIEvents(Game.id);

    /**
     * 发送垃圾行警告渲染事件
     *
     * 通过事件系统通知 UI 层：当前帧需要在棋盘上绘制红色半透明覆盖层。 UI 层监听此事件并执行实际的 Canvas/WebGL 绘制操作。
     *
     * 注意：此处使用 this.emit() 而非直接调用 UI 方法， 保持了逻辑层和表现层的解耦。
     */
    this.emit(events.RENDER_GARBAGE_WARNING, { amount });
  }
}

export default GarbageWarningAnimation;
