import COLORS from '@/lib/constants/colors.js';
import Base from '@/lib/core';
import { AudioEvents, UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：LevelUpAnimation 升级烟花动画
 *
 * ============================================================
 *
 * 在游戏升级时播放烟花粒子特效，庆祝玩家升级。
 *
 * ## 动画表现
 *
 * - 在棋盘中央上方生成多组烟花粒子
 * - 粒子向外扩散，受重力和空气阻力影响
 * - 粒子逐渐放大并淡出
 * - 每 600ms 生成一组新烟花（3 秒内共 5 组）
 * - 总持续时间为 3 秒
 * - 动画期间阻塞用户输入
 *
 * ## 时间驱动
 *
 * 全部使用 Scheduler 驱动：
 *
 * - 粒子物理更新：每 16ms 固定步长
 * - 烟花生成：每 600ms 生成一组新粒子
 * - 动画结束：3 秒后设置 _finished = true
 *
 * ## 生命周期
 *
 * 1. Constructor → 创建初始粒子，启动三个定时器
 * 2. Scheduler 每 16ms 更新物理，每 600ms 生成烟花
 * 3. 3 秒后 _finished = true
 * 4. AnimationSystem 调用 dispose() → 清理并恢复 BGM
 *
 * @augments Base
 * @class LevelUpAnimation
 */
class LevelUpAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
    this.initialize(options);
  }

  /**
   * ## initialize：初始化动画
   *
   * 设置动画属性，创建初始烟花粒子，启动定时器。
   *
   * @param {object} options - 配置对象
   * @param {number} options.level - 升级后的新等级
   * @returns {void}
   */
  initialize(options) {
    const { level } = options;

    /**
     * 渲染层级（100 = UI 层）。
     *
     * @type {number}
     */
    this.layer = 100;

    /**
     * 是否阻塞用户输入。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * 动画名称标识。
     *
     * @type {string}
     */
    this.name = 'level-up';

    /**
     * 当前等级。
     *
     * @type {number}
     */
    this.level = level;

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * 烟花粒子数组。
     *
     * @type {object[]}
     */
    this.fireworks = this.createFireworks();

    const { Scheduler } = this;

    /**
     * 烟花生成定时器 ID。
     *
     * @type {number}
     */
    this._spawnId = Scheduler.interval(() => {
      this.fireworks.push(...this.createFireworks());
    }, 600);

    /**
     * 粒子物理更新定时器 ID。
     *
     * @type {number}
     */
    this._updateId = Scheduler.interval(() => {
      this.updateFireworks(0.016);
    }, 16);

    /**
     * 动画结束定时器 ID。
     *
     * @type {number}
     */
    this._endId = Scheduler.delay(() => {
      this._finished = true;
    }, 3000);
  }

  /**
   * ## createFireworks：创建一组烟花粒子
   *
   * 在画布中心上方生成 40 个随机方向和速度的粒子。
   *
   * @returns {object[]} 烟花粒子对象数组
   */
  createFireworks() {
    const { UI } = this;
    const { width, height } = UI.Renderer.Canvas.gameBoard;
    const FIREWORK_COLORS = [
      COLORS.TEAL,
      COLORS.YELLOW,
      COLORS.PURPLE,
      COLORS.ORANGE,
      COLORS.GREEN,
      COLORS.RED,
      COLORS.PINK,
    ];
    const particles = [];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 15;

      particles.push({
        x: width / 2,
        y: height / 2 - 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color:
          FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        alpha: 1,
      });
    }

    return particles;
  }

  /**
   * ## updateFireworks：更新所有烟花粒子的物理状态
   *
   * 使用固定时间步长更新粒子的速度、位置、透明度和半径。
   *
   * ### 物理模拟
   *
   * - 空气阻力：速度每帧衰减 2%（×0.98）
   * - 重力：Y 轴速度增加（gravity × delta）
   * - 位置更新：根据速度更新坐标
   * - 淡出：透明度逐渐降低
   * - 膨胀：半径逐渐增大
   *
   * @param {number} delta - 固定时间步长（0.016 秒）
   * @returns {void}
   */
  updateFireworks(delta) {
    const gravity = 0.01;

    for (const p of this.fireworks) {
      // 空气阻力：速度衰减 2%
      p.vx *= 0.98;
      p.vy *= 0.98;

      // 应用重力
      p.vy += gravity * delta;

      // 更新位置
      p.x += p.vx * delta * 0.008;
      p.y += p.vy * delta * 0.008;

      // 透明度逐渐降低（淡出效果）
      p.alpha -= delta * 0.024;
      // 半径逐渐增大（膨胀效果）
      p.radius += delta * 10;
    }

    // 过滤掉已经完全透明的粒子
    this.fireworks = this.fireworks.filter((p) => p.alpha > 0);
  }

  /**
   * ## dispose：清理资源
   *
   * 取消所有 Scheduler 定时器，恢复背景音乐。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;

    if (this._spawnId != null) {
      Scheduler.cancel(this._spawnId);
    }
    if (this._updateId != null) {
      Scheduler.cancel(this._updateId);
    }
    if (this._endId != null) {
      Scheduler.cancel(this._endId);
    }

    // 恢复背景音乐
    const events = AudioEvents();
    this.emit(events.RESUME_BGM, { level: this.level });
  }

  /**
   * ## render：渲染升级动画
   *
   * 将等级和粒子数据传递给 UI 层绘制。
   *
   * @returns {void}
   */
  render() {
    const { Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.RENDER_LEVEL_UP, {
      level: this.level,
      fireworks: this.fireworks,
    });
  }
}

export default LevelUpAnimation;
