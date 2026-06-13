import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # GarbagePushAnimation（垃圾行闪烁动画）
 *
 * 垃圾行插入后，垃圾方块在灰色和白色之间交替闪烁。 这是一个**阻塞动画**（blocking=true），闪烁期间暂停游戏逻辑。
 *
 * ## 视觉表现
 *
 * - **可见帧（visible=true）**：垃圾方块绘制为灰色（GRAY）
 * - **隐藏帧（visible=false）**：垃圾方块绘制为白色（WHITE）
 * - **空洞位置**：值为 0 的格子不绘制，保留棋盘背景
 * - **闪烁节奏**：每 120ms 切换一次，共 5 次（600ms）
 *
 * ## 生命周期
 *
 * 1. `initialize()` → 启动闪烁序列（Scheduler.sequence）
 * 2. 每帧 `render()` → 发送 RENDER_GARBAGE_PUSH 事件给 UI，携带 rows 和 visible
 * 3. 5 次闪烁后 `_finished = true` → AnimationSystem 自动调用 dispose() 移除
 * 4. `dispose()` → 取消所有 Scheduler 定时器
 *
 * ## 动画对象接口
 *
 * - `layer = 100`：在预警动画(150)之下，棋盘(0)之上
 * - `blocking = true`：闪烁期间暂停游戏逻辑，防止玩家在动画期间操作
 * - `name = 'garbage-push'`：用于 hasBlocking() 精确匹配
 *
 * @augments Base
 * @class GarbagePushAnimation
 */
class GarbagePushAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Scheduler - 调度器实例
   * @param {number[][]} options.rows - 垃圾行数据（二维数组，0=空洞，非0=垃圾方块）
   */
  constructor(options) {
    // 调用父类构造函数，将配置注入实例
    super(options);

    // 立即初始化动画
    this.initialize();
  }

  /**
   * ## 初始化动画
   *
   * 设置动画属性，启动闪烁序列。 每 120ms 切换一次 visible 状态，共 5 次（总时长 600ms）。
   *
   * @returns {void}
   */
  initialize() {
    // 从注入的依赖中获取垃圾行数据和调度器
    const { rows, Scheduler } = this;

    /** 渲染层级：100，在预警动画(150)之下，棋盘(0)之上 */
    this.layer = 100;

    /** 阻塞动画： 闪烁期间暂停游戏逻辑，防止垃圾行闪烁时玩家继续操作。 */
    this.blocking = true;

    /** 动画名称标识，用于 hasBlocking() 精确匹配 */
    this.name = 'garbage-push';

    /** 动画是否已结束，设为 true 后 AnimationSystem 自动移除 */
    this._finished = false;

    /** 垃圾行数据： 二维数组，外层为行（从顶部到底部），内层为每行的格子值。 0 = 空洞（不闪烁），非 0 = 垃圾方块（需要闪烁）。 */
    this._rows = rows;

    /**
     * 当前帧是否可见：
     *
     * - True = 绘制灰色
     * - False = 绘制白色 初始为 true，每次 toggle 切换。
     */
    this._visible = true;

    /** 当前闪烁次数 */
    this._flashes = 0;

    /** 最大闪烁次数（5 次） */
    this._maxFlashes = 5;

    /** Scheduler 任务 ID 列表，用于 dispose 时批量取消 */
    this._schedulerIds = [];

    /**
     * 闪烁切换函数
     *
     * 每次调用：
     *
     * 1. 切换 _visible 状态（true ↔ false）
     * 2. 闪烁次数 +1
     * 3. 达到最大次数后标记动画结束
     */
    const toggle = () => {
      // 切换可见状态
      this._visible = !this._visible;
      // 闪烁次数递增
      this._flashes++;

      // 达到最大闪烁次数后标记动画结束
      if (this._flashes >= this._maxFlashes) {
        this._finished = true;
      }
    };

    // 启动闪烁序列：每 120ms 切换一次，共 5 次
    const ids = Scheduler.sequence([
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
    ]);

    // 保存任务 ID 列表，供 dispose 时取消
    this._schedulerIds = ids;
  }

  /**
   * ## 清理资源
   *
   * 由 AnimationSystem 在动画标记为 _finished 后自动调用。 取消所有 Scheduler 定时器，释放资源。
   *
   * @returns {void}
   */
  dispose() {
    // 获取调度器实例
    const { Scheduler } = this;

    // 逐个取消所有闪烁定时器
    for (const id of this._schedulerIds) {
      Scheduler.cancel(id);
    }
  }

  /**
   * ## 渲染动画
   *
   * 每帧由 AnimationSystem 调用。 发送 RENDER_GARBAGE_PUSH 事件给 UI 层，携带：
   *
   * - Rows：垃圾行数据（用于确定哪些格子需要绘制）
   * - Visible：当前可见状态（决定绘制灰色还是白色）
   *
   * UI 层收到事件后调用 renderGarbagePush(rows, visible) 执行实际绘制。
   *
   * @returns {void}
   */
  render() {
    // 获取 Game 实例、垃圾行数据和当前可见状态
    const { Game, _rows, _visible } = this;

    // 获取当前 Game 实例的 UI 事件常量
    const events = UIEvents(Game.id);

    /**
     * 发送垃圾行闪烁渲染事件：
     *
     * - Rows：垃圾行二维数组
     * - Visible：当前是否可见
     */
    this.emit(events.RENDER_GARBAGE_PUSH, { rows: _rows, visible: _visible });
  }
}

export default GarbagePushAnimation;
