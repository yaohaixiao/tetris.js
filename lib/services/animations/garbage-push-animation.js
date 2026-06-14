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
 * 4. `dispose()` → 取消所有 Scheduler 定时器，清空数据
 *
 * ## 动画对象接口
 *
 * - `layer = 100`：在预警动画(150)之下，棋盘(0)之上
 * - `blocking = true`：闪烁期间暂停游戏逻辑，防止玩家在动画期间操作
 * - `name = 'garbage-push'`：用于 hasBlocking() 精确匹配
 *
 * ## 与 GarbageWarningAnimation 的关系
 *
 *     GarbageWarningAnimation（预警，layer=150）
 *       ↓ 闪烁结束后
 *     GarbagePushAnimation（实际闪烁，layer=100）
 *       ↓ 闪烁结束后
 *     正常游戏（layer=0）
 *
 * 两个动画的 layer 设计确保预警覆盖在闪烁之上。
 *
 * @augments Base
 * @class GarbagePushAnimation
 */
class GarbagePushAnimation extends Base {
  /**
   * ## 构造函数
   *
   * 接收垃圾行数据和游戏依赖，立即启动闪烁动画。
   *
   * ### 参数说明
   *
   * `rows` 是从新棋盘底部截取的垃圾行二维数组：
   *
   * - 外层数组长度 = 垃圾行数量
   * - 内层数组长度 = 棋盘宽度
   * - 值为 0 表示空洞（不需要闪烁）
   * - 值为非 0 表示垃圾方块（需要闪烁）
   *
   * @example
   *   const anim = new GarbagePushAnimation({
   *     Game: gameInstance,
   *     Scheduler: gameInstance.Scheduler,
   *     rows: [
   *       [0, 1, 1, 0, 1, 1, 1, 0, 1, 1], // 第 1 行垃圾（有空隙）
   *       [1, 1, 0, 1, 1, 1, 0, 1, 1, 1], // 第 2 行垃圾
   *     ],
   *   });
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例，提供游戏 ID 和状态
   * @param {object} options.Scheduler - 调度器实例，用于管理闪烁定时器
   * @param {number[][]} options.rows - 垃圾行数据（二维数组，0=空洞，非0=垃圾方块）
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置对象中的所有属性注入实例
    // 完成后 this.Game、this.Scheduler、this.rows 等属性可直接使用
    super(options);

    // 所有依赖就绪后，立即初始化动画
    this.initialize();
  }

  /**
   * ## 初始化动画
   *
   * 设置动画的核心属性（层级、阻塞状态、名称等）， 并启动一个由 Scheduler 管理的闪烁序列。 闪烁序列包含 5 次可见性切换，每次间隔
   * 120ms，总时长 600ms。
   *
   * ### 闪烁逻辑
   *
   * 初始状态 `_visible = true`（显示灰色）， 每次 toggle 切换一次状态，共 5 次：
   *
   *     初始：true（灰色）
   *     toggle 1：false（白色）
   *     toggle 2：true（灰色）
   *     toggle 3：false（白色）
   *     toggle 4：true（灰色）
   *     toggle 5：false（白色）→ 动画结束
   *
   * 动画结束时 `_visible` 为 false（白色）， 与棋盘底色一致，视觉上自然过渡回正常状态。
   *
   * @returns {void}
   */
  initialize() {
    // 从注入的依赖中解构垃圾行数据和调度器
    // rows：垃圾行二维数组，Scheduler：游戏调度器实例
    const { rows, Scheduler } = this;

    /**
     * 渲染层级：100
     *
     * 位于预警动画（layer=150）之下、棋盘（layer=0）之上。 AnimationSystem 根据 layer 值决定渲染顺序，
     * 数值越大越靠上层。
     */
    this.layer = 100;

    /**
     * 阻塞动画标记：true
     *
     * 闪烁期间暂停游戏逻辑，防止垃圾行闪烁时玩家继续操作。 AnimationSystem 通过 hasBlocking() 检查此属性，
     * 如果存在阻塞动画，会暂停游戏循环。
     */
    this.blocking = true;

    /**
     * 动画名称标识：'garbage-push'
     *
     * 用于在 AnimationSystem 中精确识别和查找此动画实例。 例如 hasBlocking('garbage-push')
     * 可以判断是否有垃圾行闪烁正在播放。
     */
    this.name = 'garbage-push';

    /**
     * 动画结束标记：false
     *
     * 当闪烁次数达到上限时设置为 true， AnimationSystem 检测到此标记后会自动调用 dispose() 并移除动画。
     */
    this._finished = false;

    /**
     * 垃圾行数据：二维数组
     *
     * 存储从棋盘底部截取的垃圾行数据：
     *
     * - 外层数组：每一行垃圾
     * - 内层数组：该行中每个格子的值
     * - 0：空洞位置（不参与闪烁，保持棋盘背景色）
     * - 非 0：垃圾方块（需要在灰色和白色之间闪烁）
     *
     * 保存此数据供 render() 方法使用。
     */
    this._rows = rows;

    /**
     * 当前帧可见状态：true
     *
     * - True：本帧应绘制灰色（GRAY）—— 垃圾方块可见
     * - False：本帧应绘制白色（WHITE）—— 垃圾方块隐藏
     *
     * 初始为 true，每次 toggle 调用时取反切换。 动画结束时停留在 false（白色），与棋盘底色一致。
     */
    this._visible = true;

    /**
     * 当前已完成闪烁次数：0
     *
     * 每次 toggle 调用时递增，用于判断是否达到最大闪烁次数。
     */
    this._flashes = 0;

    /**
     * 最大闪烁次数：5
     *
     * 闪烁 5 次后动画结束。 由于初始状态为 true（灰色），5 次切换后停留在 false（白色）。
     */
    this._maxFlashes = 5;

    /**
     * Scheduler 任务 ID 列表
     *
     * 存储 sequence 调用返回的所有定时器 ID， 用于在 dispose() 时批量取消所有尚未执行的任务。
     * 即使动画提前结束，也能确保所有定时器被正确清理。
     */
    this._schedulerIds = [];

    /**
     * 闪烁切换函数（闭包）
     *
     * 每次被 Scheduler 调用时执行以下操作：
     *
     * 1. 切换可见状态（`_visible` 取反）
     *
     *    - True → false：灰色变白色（隐藏）
     *    - False → true：白色变灰色（显示）
     * 2. 闪烁次数计数器 +1
     *
     *    - 记录已完成多少次切换
     * 3. 检查是否达到最大闪烁次数
     *
     *    - 达到时设置 `_finished = true`
     *    - AnimationSystem 会在下次检测时清理此动画
     *
     * 注意：这是一个箭头函数，自动捕获外部 this 上下文， 确保在 Scheduler 回调中 this 指向动画实例。
     */
    const toggle = () => {
      // 切换可见状态：true ↔ false
      this._visible = !this._visible;

      // 闪烁次数递增：记录已完成的切换次数
      this._flashes++;

      // 达到最大闪烁次数时，标记动画已结束
      // AnimationSystem 检测到此标记后会调用 dispose() 清理资源
      if (this._flashes >= this._maxFlashes) {
        this._finished = true;
      }
    };

    /**
     * 启动闪烁序列
     *
     * Scheduler.sequence 接收一个任务数组，按顺序依次执行。 每个任务包含：
     *
     * - Fn：要执行的函数
     * - Delay：距离上一个任务完成后的等待时间（单位：毫秒）
     *
     * 共执行 5 次 toggle，每次间隔 120ms，总耗时 600ms。
     *
     * 为什么是 120ms 而不是 100ms？
     *
     * - 120ms ≈ 8.33 次/秒，闪烁频率适中
     * - 与预警动画的间隔保持一致
     * - 给玩家足够的视觉反馈时间
     *
     * 返回值是所有创建任务的 ID 数组，保存用于后续批量取消。
     */
    const ids = Scheduler.sequence([
      { fn: toggle, delay: 120 }, // 第 1 次闪烁：120ms 后执行
      { fn: toggle, delay: 120 }, // 第 2 次闪烁：再等 120ms 后执行
      { fn: toggle, delay: 120 }, // 第 3 次闪烁：再等 120ms 后执行
      { fn: toggle, delay: 120 }, // 第 4 次闪烁：再等 120ms 后执行
      { fn: toggle, delay: 120 }, // 第 5 次闪烁：再等 120ms 后执行
    ]);

    // 保存所有任务 ID，供 dispose() 方法批量取消
    this._schedulerIds = ids;
  }

  /**
   * ## 清理资源
   *
   * 由 AnimationSystem 在检测到 `_finished === true` 后自动调用。 执行以下清理操作：
   *
   * 1. 取消所有尚未执行的 Scheduler 定时器
   * 2. 清空垃圾行数据引用（帮助 GC 回收）
   * 3. 确保 _finished 标记为 true（防御性设置）
   *
   * ### 为什么需要取消定时器？
   *
   * 如果动画在闪烁序列执行完之前就被移除（如回合切换）， 必须取消剩余定时器，否则：
   *
   * - 定时器回调继续执行（访问已销毁的动画实例）
   * - 造成内存泄漏（定时器持有回调引用）
   * - 可能引发错误（访问 undefined 的属性）
   *
   * @returns {void}
   */
  dispose() {
    // 获取调度器实例
    const { Scheduler } = this;

    // 逐个取消所有闪烁定时器
    // 即使某些定时器已经执行完毕，cancel 也不会报错（幂等操作）
    for (const id of this._schedulerIds) {
      Scheduler.cancel(id);
    }

    /**
     * 清空垃圾行数据：
     *
     * 将 _rows 设置为空数组，释放对原始数据的引用， 帮助垃圾回收器及时回收内存。 同时确保后续代码不会意外使用已失效的数据。
     */
    this._rows = [];

    /**
     * 确保 _finished 标记为 true：
     *
     * 防御性设置。正常情况下此时 _finished 已经是 true （闪烁序列完成后设置），但如果是提前清理， 这里确保标记状态一致。
     */
    this._finished = true;
  }

  /**
   * ## 渲染动画
   *
   * 每帧由 AnimationSystem 调用（通常 60fps）。 负责向 UI 层发送渲染事件，携带垃圾行数据和当前可见状态。
   *
   * ### 渲染流程
   *
   * 1. 检查当前回合是否有效（防止跨回合残留）
   * 2. 检查当前帧是否应该显示（_visible 状态）
   * 3. 向 UI 层发送 RENDER_GARBAGE_PUSH 事件
   *
   * ### 事件数据
   *
   * 发送给 UI 层的数据包含：
   *
   * - `rows`：垃圾行二维数组（用于确定哪些格子需要绘制）
   * - `visible`：当前可见状态（决定绘制颜色）
   *
   *   - True → 灰色（GRAY）
   *   - False → 白色（WHITE）
   *
   * ### UI 层处理
   *
   * UI 层收到事件后会遍历 rows 数组：
   *
   * - 对于值非 0 的格子：根据 visible 绘制灰色或白色
   * - 对于值为 0 的格子：不绘制（保持棋盘背景色）
   *
   * @returns {void}
   */
  render() {
    // 解构渲染所需的全部属性
    const { Game, Battle, _rows, _visible, roundId } = this;

    // 获取当前 Game 实例的 UI 事件常量定义
    // UIEvents(gameId) 返回该游戏对应的 UI 事件名称集合
    const events = UIEvents(Game.id);

    /**
     * ========== 回合有效性检查 ==========
     *
     * 比对动画创建时的 roundId 与 Battle 当前的 roundId：
     *
     * - 一致：动画属于当前回合，正常渲染
     * - 不一致：动画已跨回合残留，强制标记结束
     *
     * 为什么会有跨回合动画？
     *
     * - 正常情况不会，这是防御性检查
     * - 如果回合在新一局开始前异常切换，旧动画会被此检查捕获
     *
     * 注意：标记 _finished 后，AnimationSystem 会在下一帧 检测到并自动调用 dispose() 清理此动画。
     */
    if (roundId !== Battle.getRoundId()) {
      this._finished = true;
      return; // 提前退出，不发送渲染事件
    }

    /**
     * ========== 可见性检查 ==========
     *
     * 如果当前帧不可见（_visible 为 false），跳过渲染事件发送。
     *
     * 这意味着：
     *
     * - UI 层不会收到 RENDER_GARBAGE_PUSH 事件
     * - 垃圾方块保持上一帧的状态（白色/棋盘底色）
     * - 产生"消失"的闪烁效果
     *
     * 只有 _visible 为 true 的帧才会发送事件， 此时 UI 层将垃圾方块绘制为灰色。
     */
    if (!_visible) {
      return;
    }

    /**
     * ========== 发送渲染事件 ==========
     *
     * 通过事件系统通知 UI 层：当前帧需要绘制垃圾行闪烁。
     *
     * 事件携带的数据：
     *
     * - Rows：垃圾行二维数组（[行][列]）
     * - Visible：当前可见状态（true）
     *
     * 注意：这里使用 this.emit() 发送事件， 保持逻辑层和 UI 层的解耦。 UI 层通过监听 RENDER_GARBAGE_PUSH
     * 事件来响应。
     *
     * 注意：只在 _visible 为 true 时发送事件， visible 参数始终为 true。这样设计的原因是：
     *
     * - 不可见帧直接跳过（不发送事件）
     * - UI 层收到事件时总是需要绘制（不需要判断 visible）
     * - 简化 UI 层的逻辑
     *
     * 但这里仍然传递 visible 参数，可能是为了保持接口的完整性， 或者 UI 层有其他用途（如调试日志）。
     */
    this.emit(events.RENDER_GARBAGE_PUSH, { rows: _rows, visible: _visible });
  }
}

export default GarbagePushAnimation;
