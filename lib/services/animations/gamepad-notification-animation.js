import Base from '@/lib/core';
import { AudioEvents, UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：GamepadNotificationAnimation 手柄通知动画
 *
 * ============================================================
 *
 * 手柄连接或断开时，在棋盘上闪烁显示通知文字。 同时播放六段同步音效。
 *
 * ## 视觉表现
 *
 * - 文字闪烁 6 次（每 200ms 切换一次），共 1200ms
 * - 动画结束后自动移除
 *
 * ## 生命周期
 *
 * 1. Initialize() → 启动闪烁序列 + 播放音效
 * 2. 每帧 render() → 发送渲染事件给 UI
 * 3. 6 次闪烁后 _finished = true → 自动移除
 * 4. Dispose() → 取消 Scheduler 任务
 *
 * @augments Base
 * @class GamepadNotificationAnimation
 */
class GamepadNotificationAnimation extends Base {
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
   * 启动闪烁序列（6 次切换，每次间隔 200ms）， 播放同步音效。
   *
   * @returns {void}
   */
  initialize() {
    const { Scheduler } = this;

    /**
     * 渲染层级（160，在预警动画之上）。
     *
     * @type {number}
     */
    this.layer = 160;

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
    this.name = 'gamepad-notification';

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * 当前可见性状态。
     *
     * @type {boolean}
     */
    this._visible = true;

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
    this._maxFlashes = 6;

    /**
     * Scheduler 任务 ID 列表。
     *
     * @type {number[]}
     */
    this._schedulerIds = [];

    // 闪烁切换函数
    const toggle = () => {
      this._visible = !this._visible;
      this._flashes++;

      if (this._flashes >= this._maxFlashes) {
        this._finished = true;
      }
    };

    // 启动闪烁序列：6 次 toggle，每次间隔 200ms
    const ids = Scheduler.sequence([
      { fn: toggle, delay: 200 },
      { fn: toggle, delay: 200 },
      { fn: toggle, delay: 200 },
      { fn: toggle, delay: 200 },
      { fn: toggle, delay: 200 },
      { fn: toggle, delay: 200 },
    ]);

    this._schedulerIds = ids;

    // 播放手柄通知音效
    const events = AudioEvents();
    this.emit(events.PLAY_SOUND, { sound: 'GAMEPAD_NOTIFY' });
  }

  /**
   * ## dispose：清理资源
   *
   * 取消所有 Scheduler 定时器。
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
   * 每帧由 AnimationSystem 调用。 可见帧发送渲染事件给 UI 层，不可见帧跳过。
   *
   * @returns {void}
   */
  render() {
    const { Game, _visible, connected } = this;

    // 不可见帧跳过渲染
    if (!_visible) {
      return;
    }

    // 发送手柄通知渲染事件
    const events = UIEvents(Game.id);
    this.emit(events.RENDER_GAMEPAD_NOTIFICATION, { connected });
  }
}

export default GamepadNotificationAnimation;
