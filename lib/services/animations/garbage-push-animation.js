import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：GarbagePushAnimation 垃圾行闪烁动画
 *
 * ============================================================
 *
 * 垃圾行插入后，垃圾方块在灰色和白色之间交替闪烁。 阻塞动画（blocking=true），闪烁期间暂停游戏逻辑。
 *
 * ## 视觉表现
 *
 * - 可见帧（visible=true）：垃圾方块绘制为灰色
 * - 隐藏帧（visible=false）：垃圾方块绘制为白色
 * - 空洞位置：值为 0 的格子不绘制
 * - 闪烁节奏：每 120ms 切换一次，共 5 次（600ms）
 *
 * ## 生命周期
 *
 * 1. Initialize() → 启动闪烁序列
 * 2. 每帧 render() → 发送渲染事件给 UI
 * 3. 5 次闪烁后 _finished = true → 自动移除
 * 4. Dispose() → 取消所有定时器，清空数据
 *
 * ## 与 GarbageWarningAnimation 的关系
 *
 * GarbageWarningAnimation（预警，layer=150） ↓ 闪烁结束后
 * GarbagePushAnimation（实际闪烁，layer=100） ↓ 闪烁结束后 正常游戏（layer=0）
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
   * @param {object} options - 配置对象
   * @param {number[][]} options.rows - 垃圾行数据
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化动画
   *
   * 启动闪烁序列：5 次可见性切换，每次间隔 120ms。
   *
   * 初始 _visible = true（灰色）， 5 次切换后停留在 false（白色），与棋盘底色一致。
   *
   * @returns {void}
   */
  initialize() {
    const { rows, Scheduler } = this;

    /**
     * 渲染层级（100，在预警动画之下、棋盘之上）。
     *
     * @type {number}
     */
    this.layer = 100;

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
    this.name = 'garbage-push';

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * 垃圾行数据。
     *
     * @type {number[][]}
     */
    this._rows = rows;

    /**
     * 当前帧可见状态。
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
    this._maxFlashes = 5;

    /**
     * Scheduler 任务 ID 列表。
     *
     * @type {number[]}
     */
    this._schedulerIds = [];

    /**
     * 闪烁切换函数。 每次切换可见状态并递增计数， 达到最大次数后标记动画结束。
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
   * 取消所有 Scheduler 定时器，清空垃圾行数据。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;

    for (const id of this._schedulerIds) {
      Scheduler.cancel(id);
    }

    this._rows = [];
    this._finished = true;
  }

  /**
   * ## render：渲染动画
   *
   * 每帧由 AnimationSystem 调用。 检查回合有效性和可见性后，发送渲染事件给 UI 层。
   *
   * @returns {void}
   */
  render() {
    const { Game, Battle, _rows, _visible, roundId } = this;
    const events = UIEvents(Game.id);

    // 回合有效性检查：跨回合残留则强制结束
    if (roundId !== Battle.getRoundId()) {
      this._finished = true;
      return;
    }

    // 不可见帧跳过渲染
    if (!_visible) {
      return;
    }

    // 发送渲染事件
    this.emit(events.RENDER_GARBAGE_PUSH, { rows: _rows, visible: _visible });
  }
}

export default GarbagePushAnimation;
