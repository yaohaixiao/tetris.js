import COLORS from '@/lib/constants/colors.js';
import Base from '@/lib/core';
import hexToRgba from '@/lib/utils/color/hex-to-rgba.js';

/**
 * ============================================================
 *
 * # 模块：GarbageFlyAnimation 垃圾行粒子飞行动画
 *
 * ============================================================
 *
 * 在垃圾行预警之前播放， 粒子从攻击方棋盘飞向受攻击方棋盘。 使用独立的 #tetris-battle-fly canvas。
 *
 * ## 视觉表现
 *
 * - 至少 12 个粒子从攻击方棋盘飞向受攻击方棋盘中心
 * - 粒子带有渐隐效果，越接近终点越透明
 * - 持续 400ms，每 16ms 更新一帧
 *
 * ## 生命周期
 *
 * 1. Initialize() → 初始化粒子、启动更新循环
 * 2. 每帧 render() → 在 fly canvas 上绘制粒子
 * 3. 400ms 后 _finished = true → 自动移除
 * 4. Dispose() → 取消定时器、清空 canvas
 *
 * @augments Base
 * @class GarbageFlyAnimation
 */
class GarbageFlyAnimation extends Base {
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
   * 获取双方棋盘位置，初始化粒子，启动帧更新循环。
   *
   * @returns {void}
   */
  initialize() {
    const { Battle, from, to, amount = 0, fly = 0 } = this;
    const { Scheduler } = to;

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
    this.name = 'garbage-fly';

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * Scheduler 任务 ID。
     *
     * @type {number | null}
     */
    this._schedulerId = null;

    // 获取 fly canvas 和渲染上下文
    this.$fly = Battle.getOverlayFly(fly);
    this.ctx = this.$fly.getContext('2d');

    // 获取双方棋盘的 DOM 元素和位置
    const fromCanvas = from.getCanvas();
    const toCanvas = to.getCanvas();
    const fromRect = fromCanvas.getBoundingClientRect();
    const toRect = toCanvas.getBoundingClientRect();

    // 获取 overlay 位置作为坐标系参考
    const overlayRect = this.$fly.parentElement.getBoundingClientRect();

    // 同步 canvas 绘图分辨率与 CSS 显示尺寸
    this.$fly.width = overlayRect.width;
    this.$fly.height = overlayRect.height;

    // 坐标系偏移量
    this._offsetX = overlayRect.left;
    this._offsetY = overlayRect.top;

    // 粒子终点：受攻击方棋盘中心
    this._toX = toRect.left + toRect.width / 2;
    this._toY = toRect.top + toRect.height / 2;

    // 当前进度（0=起点，1=终点）
    this._progress = 0;

    // 每帧进度增量
    this._step = 0.04;

    // 初始化粒子
    this._particles = [];
    const count = 12 + amount;
    const fromCenterX = fromRect.left + fromRect.width / 2;

    for (let i = 0; i < count; i++) {
      const fromY = fromRect.top + (fromRect.height / (count - 1 || 1)) * i;
      const fromX = fromCenterX + (Math.random() - 0.5) * fromRect.width * 0.6;

      this._particles.push({
        fromX,
        fromY,
        speed: 0.6 + Math.random() * 0.8,
        size: 3 + Math.random() * 2,
        color: COLORS.WHITE,
      });
    }

    // 帧更新函数
    const update = () => {
      this._progress = Math.min(this._progress + this._step, 1);

      if (this._progress >= 1) {
        this._finished = true;
        return;
      }

      this._schedulerId = Scheduler.delay(update, 16);
    };

    // 启动第一帧
    this._schedulerId = Scheduler.delay(update, 16);
  }

  /**
   * ## dispose：清理资源
   *
   * 取消 Scheduler 定时器，清空 fly canvas。
   *
   * @returns {void}
   */
  dispose() {
    const { to } = this;
    const { Scheduler } = to;

    if (this._schedulerId) {
      Scheduler.cancel(this._schedulerId);
      this._schedulerId = null;
    }

    if (this.ctx && this.$fly) {
      this.ctx.clearRect(0, 0, this.$fly.width, this.$fly.height);
    }
  }

  /**
   * ## render：渲染动画
   *
   * 每帧由 AnimationSystem 调用， 在 fly canvas 上绘制所有粒子的当前位置。
   *
   * @returns {void}
   */
  render() {
    const { roundId, Battle, ctx } = this;

    // 回合有效性检查
    if (roundId !== Battle.getRoundId()) {
      this._finished = true;
      return;
    }

    // 清空上一帧内容
    ctx.clearRect(0, 0, this.$fly.width, this.$fly.height);

    // 绘制所有粒子
    for (const particle of this._particles) {
      const p = Math.min(this._progress * particle.speed, 1);

      // 坐标转换到 fly canvas 坐标系
      const fromCanvasX = particle.fromX - this._offsetX;
      const fromCanvasY = particle.fromY - this._offsetY;
      const toCanvasX = this._toX - this._offsetX;
      const toCanvasY = this._toY - this._offsetY;

      const x = fromCanvasX + (toCanvasX - fromCanvasX) * p;
      const y = fromCanvasY + (toCanvasY - fromCanvasY) * p;

      // 透明度：越接近终点越透明
      const alpha = (1 - p) * 0.8;

      ctx.save();
      ctx.fillStyle = hexToRgba(particle.color, alpha);
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

export default GarbageFlyAnimation;
