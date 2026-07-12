import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：LandingFlashAnimation 落地高亮动画
 *
 * ============================================================
 *
 * 方块落地的瞬间，在落地格子上叠加半透明白色高亮， 150ms 后自动消失，提供短暂的视觉反馈。
 *
 * ## 动画表现
 *
 * - 落地瞬间方块格子覆盖 60% 透明度白色
 * - 持续 150ms，不阻塞玩家操作
 * - 不影响棋盘数据，仅渲染层叠加
 *
 * ## 时间驱动
 *
 * - 渲染：每帧由 AnimationSystem 调用 render()
 * - 结束：150ms 后设置 _finished = true
 *
 * ## 生命周期
 *
 * 1. Constructor → 收集落地格子坐标 → 注册 150ms 结束定时器
 * 2. AnimationSystem 每帧调用 render() 绘制白色覆盖
 * 3. 150ms 后 _finished = true → dispose() 清理
 *
 * @augments Base
 * @class LandingFlashAnimation
 */
class LandingFlashAnimation extends Base {
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
   * 根据方块形状和坐标收集所有落地格子的位置， 注册 150ms 结束定时器。
   *
   * @returns {void}
   */
  initialize() {
    const { piece, Scheduler } = this;
    const { shape, cx, cy } = piece;

    /**
     * 渲染层级（150，在棋盘和方块之上）。
     *
     * @type {number}
     */
    this.layer = 150;

    /**
     * 是否阻塞用户输入。
     *
     * @type {boolean}
     */
    this.blocking = false;

    /**
     * 动画名称标识。
     *
     * @type {string}
     */
    this.name = 'landing-flash';

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * 收集落地格子的棋盘坐标。
     *
     * @type {{ x: number; y: number }[]}
     */
    const cells = [];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          cells.push({ x: cx + x, y: cy + y });
        }
      }
    }

    /**
     * 动画状态。
     *
     * @type {{ cells: { x: number; y: number }[] }}
     */
    this.state = { cells };

    /**
     * 结束定时器 ID。
     *
     * @type {number}
     */
    this._endId = Scheduler.delay(() => {
      this._finished = true;
    }, 150);
  }

  /**
   * ## dispose：清理资源
   *
   * 取消结束定时器。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;

    if (this._endId != null) {
      Scheduler.cancel(this._endId);
    }
  }

  /**
   * ## render：渲染动画
   *
   * 每帧由 AnimationSystem 调用， 将落地格子坐标传递给 UI 层绘制白色高亮。
   *
   * @returns {void}
   */
  render() {
    const { state, Game } = this;
    const UE = UIEvents(Game.id);
    this.emit(UE.RENDER_LANDING_FLASH, { state: { cells: state.cells } });
  }
}

export default LandingFlashAnimation;
