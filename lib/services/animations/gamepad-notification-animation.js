import Base from '@/lib/core';
import { AudioEvents, UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # GamepadNotificationAnimation（手柄通知动画）
 *
 * 手柄连接或断开时，在棋盘上闪烁显示通知文字。 同时播放六段同步音效。
 *
 * ## 视觉表现
 *
 * - 文字闪烁 6 次（每 200ms 切换一次显/隐），共 1200ms
 * - 动画结束后自动移除
 *
 * ## 生命周期
 *
 * 1. `initialize()` → 启动闪烁序列（Scheduler.sequence）+ 播放音效
 * 2. 每帧 `render()` → 发送 RENDER_GAMEPAD_NOTIFICATION 事件给 UI
 * 3. 6 次闪烁后 `_finished = true` → AnimationSystem 自动移除
 * 4. `dispose()` → 取消 Scheduler 任务
 *
 * ## 动画对象接口
 *
 * - `layer = 160`：在预警动画(150)之上
 * - `blocking = true`：通知期间阻塞玩家操作
 * - `name = 'gamepad-notification'`：用于 hasBlocking() 精确匹配
 *
 * @augments Base
 * @class GamepadNotificationAnimation
 */
class GamepadNotificationAnimation extends Base {
  /**
   * ## 构造函数
   *
   * 调用父类构造函数并初始化动画。父类构造函数会完成基础的依赖注入 （如 Game、Scheduler 等实例的挂载）。
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例，提供游戏全局状态和 ID
   * @param {object} options.Scheduler - 调度器实例，用于管理定时任务
   * @param {boolean} options.connected - 手柄是否已连接
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
   * 设置动画的核心属性，启动闪烁序列，播放同步音效。 闪烁序列包含 6 次可见性切换，每次间隔 200ms，总时长 1200ms。
   *
   * @returns {void}
   */
  initialize() {
    // 从实例上解构 Scheduler，方便后续调用
    const { Scheduler } = this;

    /** 渲染层级：160。 位于预警动画（layer=150）之上。 AnimationSystem 根据此值决定渲染顺序。 */
    this.layer = 160;

    /** 阻塞动画：通知期间暂停游戏逻辑。 AnimationSystem 会通过 hasBlocking() 检查此属性。 */
    this.blocking = true;

    /** 动画名称标识，用于在 AnimationSystem 中精确识别和查找 */
    this.name = 'gamepad-notification';

    /** 动画结束标记。 当闪烁次数达到上限时设置为 true， AnimationSystem 检测到此标记后会自动调用 dispose() 并移除动画。 */
    this._finished = false;

    /** 当前可见性状态。 true 表示当前帧应显示通知文字，false 表示隐藏。 初始为 true，每次 toggle 调用时取反切换。 */
    this._visible = true;

    /** 当前已完成闪烁次数计数器，每次可见性切换时递增 */
    this._flashes = 0;

    /** 最大闪烁次数：6 次 */
    this._maxFlashes = 6;

    /** Scheduler 任务 ID 列表。 存储 sequence 调用返回的所有任务 ID， 用于在 dispose() 时批量取消。 */
    this._schedulerIds = [];

    /**
     * 闪烁切换函数（箭头函数保持 this 绑定）。
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

      // 达到最大闪烁次数时，标记动画已结束
      if (this._flashes >= this._maxFlashes) {
        this._finished = true;
      }
    };

    /**
     * 启动闪烁序列。
     *
     * Scheduler.sequence 接收一个任务数组，按顺序依次执行。 每个任务的 delay 表示距离上一个任务完成后的等待时间（ms）。
     * 共执行 6 次 toggle，每次间隔 200ms，总耗时 1200ms。
     *
     * 时间线：
     *
     * | 时间   | 可见性 | 说明        |
     * | ------ | ------ | ----------- |
     * | 0ms    | true   | 初始可见    |
     * | 200ms  | false  | 第 1 次切换 |
     * | 400ms  | true   | 第 2 次切换 |
     * | 600ms  | false  | 第 3 次切换 |
     * | 800ms  | true   | 第 4 次切换 |
     * | 1000ms | false  | 第 5 次切换 |
     * | 1200ms | —      | 动画结束    |
     *
     * 与 GAMEPAD_NOTIFY 音效的 6 段短音完全同步。
     */
    const ids = Scheduler.sequence([
      { fn: toggle, delay: 200 }, // 第 1 次闪烁：200ms 后执行
      { fn: toggle, delay: 200 }, // 第 2 次闪烁：再等 200ms 后执行
      { fn: toggle, delay: 200 }, // 第 3 次闪烁：再等 200ms 后执行
      { fn: toggle, delay: 200 }, // 第 4 次闪烁：再等 200ms 后执行
      { fn: toggle, delay: 200 }, // 第 5 次闪烁：再等 200ms 后执行
      { fn: toggle, delay: 200 }, // 第 6 次闪烁：再等 200ms 后执行
    ]);

    // 保存任务 ID 列表，供 dispose() 使用
    this._schedulerIds = ids;

    /**
     * 播放手柄通知音效。
     *
     * GAMEPAD_NOTIFY 音效包含 6 段短音（C5 和 D5 交替）， 每 200ms 一声，与闪烁动画完全同步。
     * 使用全局音频事件（AudioEvents），音效全局播放。
     */
    const events = AudioEvents();
    this.emit(events.PLAY_SOUND, { sound: 'GAMEPAD_NOTIFY' });
  }

  /**
   * ## 清理资源
   *
   * 由 AnimationSystem 在检测到 _finished 为 true 后自动调用。 遍历所有 Scheduler 任务 ID 并逐一取消，
   * 防止内存泄漏和已销毁动画继续执行回调。
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
   * 1. 检查当前帧是否应该显示（_visible 状态）
   * 2. 向 UI 层发送渲染事件，触发通知文字绘制
   *
   * @returns {void}
   */
  render() {
    // 解构所需属性
    const { Game, _visible, connected } = this;

    /**
     * 可见性检查。
     *
     * 如果当前帧不可见（_visible 为 false），不发送渲染事件。 UI 层在未收到事件时不会绘制通知文字， 从而产生"闪烁"的视觉效果。
     */
    if (!_visible) {
      return;
    }

    // 获取当前游戏的 UI 事件定义
    const events = UIEvents(Game.id);

    /**
     * 发送手柄通知渲染事件。
     *
     * 通过事件系统通知 UI 层：当前帧需要绘制通知文字。 携带 connected 参数，UI 层根据此值决定显示 "CONNECTED"（绿色）还是
     * "DISCONNECTED"（橙色）。
     */
    this.emit(events.RENDER_GAMEPAD_NOTIFICATION, { connected });
  }
}

export default GamepadNotificationAnimation;
