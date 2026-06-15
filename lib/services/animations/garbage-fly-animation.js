import COLORS from '@/lib/constants/colors.js';
import Base from '@/lib/core';
import hexToRgba from '@/lib/utils/hex-to-rgba.js';

/**
 * # FlyAnimation（垃圾行粒子飞行动画）
 *
 * 在垃圾行预警之前播放，粒子从攻击方棋盘飞向受攻击方棋盘。 使用独立的 #tetris-battle-fly canvas，覆盖整个游戏区域。
 *
 * ## 视觉表现
 *
 * - 至少 12 个粒子从攻击方棋盘不同位置飞向受攻击方棋盘中心
 * - 粒子带有渐隐效果，越接近终点越透明
 * - 持续 400ms，每 16ms 更新一帧（约 25 帧）
 *
 * ## 生命周期
 *
 * 1. `initialize()` → 初始化粒子、启动 Scheduler.delay 更新循环
 * 2. 每帧 `render()` → 在 fly canvas 上绘制粒子当前位置
 * 3. 400ms 后 `_finished = true` → AnimationSystem 自动移除
 * 4. `dispose()` → 取消 Scheduler 任务、清空 canvas
 *
 * ## 动画对象接口
 *
 * - `layer = 160`：在 GarbageWarningAnimation(150) 之上
 * - `blocking = true`：飞行期间暂停游戏逻辑
 * - `name = 'garbage-fly'`：用于 hasBlocking() 精确匹配
 *
 * @augments Base
 * @class GarbageFlyAnimation
 */
class GarbageFlyAnimation extends Base {
  /**
   * ## 构造函数
   *
   * 调用父类构造函数并初始化动画。
   *
   * @param {object} options - 配置对象
   * @param {object} options.Scheduler - 调度器实例
   * @param {object} options.Battle - BattleController 实例
   * @param {number} options.roundId - 当前回合 ID
   * @param {object} options.from - 攻击方的 Game 实例
   * @param {object} options.to - 受攻击方的 Game 实例
   * @param {number} [options.amount=0] - 垃圾行数量，影响粒子总数. Default is `0`
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化动画
   *
   * 获取双方棋盘位置，初始化粒子，启动帧更新循环。
   *
   * @returns {void}
   */
  initialize() {
    const { Battle, from, to, amount = 0, fly = 0 } = this;
    const { Scheduler } = to;

    /** 渲染层级：160，在 GarbageWarningAnimation(150) 之上 */
    this.layer = 160;

    /** 阻塞动画：飞行期间暂停游戏逻辑 */
    this.blocking = true;

    /** 动画名称标识 */
    this.name = 'garbage-fly';

    /** 动画是否已结束 */
    this._finished = false;

    /** Scheduler 任务 ID，用于 dispose 时取消 */
    this._schedulerId = null;

    /**
     * 获取 fly canvas 和渲染上下文。 #tetris-battle-fly 是 #tetris-battle-overlay 的子元素，
     * CSS 已设置 width: 100%; height: 100% 覆盖整个游戏区域。
     */
    this.$fly = Battle.getOverlayFly(fly);
    this.ctx = this.$fly.getContext('2d');

    /** 获取双方棋盘的 DOM 元素。 getCanvas() 返回 gameBoard canvas 的 DOM 节点。 */
    const fromCanvas = from.getCanvas();
    const toCanvas = to.getCanvas();

    /** 获取双方棋盘在页面中的位置和尺寸。 getBoundingClientRect() 返回相对于视口的坐标。 */
    const fromRect = fromCanvas.getBoundingClientRect();
    const toRect = toCanvas.getBoundingClientRect();

    /**
     * 获取 overlay 的位置作为 fly canvas 的坐标系参考。 fly canvas 的父元素就是
     * #tetris-battle-overlay， CSS 已设置覆盖整个游戏区域。
     */
    const overlayRect = this.$fly.parentElement.getBoundingClientRect();

    /** 同步 canvas 绘图分辨率与 CSS 显示尺寸。 不设置会导致坐标系与显示区域不匹配。 */
    this.$fly.width = overlayRect.width;
    this.$fly.height = overlayRect.height;

    /** 保存坐标系偏移量。 视口坐标减去此偏移量 = fly canvas 内的坐标。 */
    this._offsetX = overlayRect.left;
    this._offsetY = overlayRect.top;

    /** 粒子终点：受攻击方棋盘中心（视口坐标） */
    this._toX = toRect.left + toRect.width / 2;
    this._toY = toRect.top + toRect.height / 2;

    /** 当前进度：0 到 1，0=起点，1=终点。 每次帧更新递增 _step，render 时用于计算粒子位置。 */
    this._progress = 0;

    /** 每帧进度增量。 400ms 总时长 / 16ms 每帧 ≈ 25 帧，每帧约 0.04。 */
    this._step = 0.04;

    /** 粒子数组 */
    this._particles = [];

    /** 粒子总数：基础 12 个 + 垃圾行数量。 垃圾行越多，粒子越多，攻击感越强。 */
    const count = 12 + amount;

    /** 攻击方棋盘中心 X 坐标。 粒子从中心向左右随机散开出发。 */
    const fromCenterX = fromRect.left + fromRect.width / 2;

    /**
     * 初始化粒子。 每个粒子从攻击方棋盘的不同位置出发， 均匀分布在攻击方棋盘高度内，水平方向在中心左右随机散开， 飞向受攻击方棋盘中心。
     *
     * 不同高度 + 不同水平偏移 + 不同速度，形成"流星群"效果。
     */
    for (let i = 0; i < count; i++) {
      // 粒子起始 Y 在攻击方棋盘内均匀分布
      const fromY = fromRect.top + (fromRect.height / (count - 1 || 1)) * i;

      /** 粒子起始 X 在攻击方棋盘中心左右随机偏移。 偏移范围为中心左右各 30% 棋盘宽度。 */
      const fromX = fromCenterX + (Math.random() - 0.5) * fromRect.width * 0.6;

      this._particles.push({
        // 粒子起始 X：攻击方棋盘中心左右散开
        fromX,
        // 粒子起始 Y：攻击方棋盘内均匀分布的高度
        fromY,
        // 速度系数：0.6-1.4，快慢差异明显
        speed: 0.6 + Math.random() * 0.8,
        // 粒子半径：3-5px
        size: 3 + Math.random() * 2,
        // 颜色：白色
        color: COLORS.WHITE,
      });
    }

    /**
     * 帧更新函数（箭头函数保持 this 绑定）。
     *
     * 每 16ms 调用一次，递增进度。 进度达到 1 时标记动画结束。
     */
    const update = () => {
      this._progress = Math.min(this._progress + this._step, 1);

      if (this._progress >= 1) {
        this._finished = true;
        return;
      }

      // 继续下一帧
      this._schedulerId = Scheduler.delay(update, 16);
    };

    // 启动第一帧
    this._schedulerId = Scheduler.delay(update, 16);
  }

  /**
   * ## 清理资源
   *
   * 由 AnimationSystem 在动画结束后自动调用。 取消 Scheduler 定时器，清空 canvas。
   *
   * @returns {void}
   */
  dispose() {
    const { to } = this;
    const { Scheduler } = to;

    // 取消帧更新定时器
    if (this._schedulerId) {
      Scheduler.cancel(this._schedulerId);
      this._schedulerId = null;
    }

    // 清空 fly canvas
    if (this.ctx && this.$fly) {
      this.ctx.clearRect(0, 0, this.$fly.width, this.$fly.height);
    }
  }

  /**
   * ## 渲染动画
   *
   * 每帧由 AnimationSystem 调用。 在 fly canvas 上绘制所有粒子的当前位置。
   *
   * @returns {void}
   */
  render() {
    const { roundId, Battle, ctx } = this;

    // 回合有效性检查：跨回合残留则强制结束
    if (roundId !== Battle.getRoundId()) {
      this._finished = true;
      return;
    }

    // 清空上一帧内容
    ctx.clearRect(0, 0, this.$fly.width, this.$fly.height);

    /**
     * 绘制所有粒子。
     *
     * 每个粒子从攻击方棋盘的不同位置出发， 根据自身 speed 系数计算实际进度， 形成有层次的"流星群"视觉效果。
     */
    for (const particle of this._particles) {
      // 粒子实际进度 = 全局进度 × 速度系数，上限为 1
      const p = Math.min(this._progress * particle.speed, 1);

      /**
       * 粒子当前位置（线性插值）： 从各自的起点到共同终点，按进度 p 插值。 坐标需要减去 overlay 偏移量转换到 fly canvas
       * 坐标系。
       */
      const fromCanvasX = particle.fromX - this._offsetX;
      const fromCanvasY = particle.fromY - this._offsetY;
      const toCanvasX = this._toX - this._offsetX;
      const toCanvasY = this._toY - this._offsetY;

      const x = fromCanvasX + (toCanvasX - fromCanvasX) * p;
      const y = fromCanvasY + (toCanvasY - fromCanvasY) * p;

      /** 粒子透明度：越接近终点越透明。 起点 alpha ≈ 0.8，终点 alpha ≈ 0。 */
      const alpha = (1 - p) * 0.8;

      // 绘制粒子
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
