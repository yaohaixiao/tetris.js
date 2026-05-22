import COLORS from '@/lib/constants/colors.js';
import Base from '@/lib/core';
import { AudioEvents, UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # LevelUpAnimation（升级烟花动画）
 *
 * 在游戏升级时播放烟花粒子特效，庆祝玩家升级。
 *
 * ## 动画表现
 *
 * - 在棋盘中央上方生成多组烟花粒子
 * - 粒子向外扩散，受重力和空气阻力影响
 * - 粒子逐渐放大并淡出
 * - 每 600ms 生成一组新烟花（共 3 秒内生成 5 组）
 * - 总持续时间为 3 秒
 * - 动画期间阻塞用户输入
 *
 * ## 时间驱动
 *
 * 全部使用 Scheduler 驱动，不使用 `update(delta)`：
 *
 * - 粒子物理更新：每 16ms 固定步长更新所有粒子
 * - 烟花生成：每 600ms 生成一组新粒子
 * - 动画结束：3 秒后设置 `_finished = true`
 *
 * ## 生命周期
 *
 * 1. `constructor` → `initialize()` → 创建初始粒子，启动三个 Scheduler 定时器
 * 2. Scheduler 每 16ms 更新物理，每 600ms 生成新烟花
 * 3. 3 秒后 `_finished = true`
 * 4. AnimationSystem 调用 `dispose()` → 取消所有定时器 → 恢复背景音乐
 *
 * @augments Base
 * @class LevelUpAnimation
 */
class LevelUpAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.UI - UI 渲染模块
   * @param {object} options.Scheduler - 任务调度器
   * @param {number} options.level - 升级后的新等级
   */
  constructor(options) {
    super(options);
    this.initialize(options);
  }

  /**
   * ## 初始化动画
   *
   * 设置动画属性，创建初始烟花粒子，启动三个 Scheduler 定时器。
   *
   * @param {object} options - 配置对象
   * @param {number} options.level - 升级后的新等级
   * @returns {void}
   */
  initialize(options) {
    const { level } = options;

    /**
     * ## 渲染层级
     *
     * 设为 100（UI 层），确保烟花显示在游戏界面上方。
     *
     * @type {number}
     */
    this.layer = 100;

    /**
     * ## 是否阻塞用户输入
     *
     * 升级动画期间禁止玩家操作。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * ## 动画名称标识
     *
     * 用于 `hasBlocking()` 精确匹配。
     *
     * @type {string}
     */
    this.name = 'level-up';

    /**
     * ## 当前等级
     *
     * @type {number}
     */
    this.level = level;

    /**
     * ## 是否已结束
     *
     * 设为 `true` 后，AnimationSystem 会在 `flush()` 时自动移除。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * ## 烟花粒子数组
     *
     * @type {object[]}
     */
    this.fireworks = this.createFireworks();

    const { Scheduler } = this;

    /**
     * ## 烟花生成定时器 ID
     *
     * 每 600ms 生成一组新烟花。
     *
     * @type {number}
     */
    this._spawnId = Scheduler.interval(() => {
      this.fireworks.push(...this.createFireworks());
    }, 600);

    /**
     * ## 粒子物理更新定时器 ID
     *
     * 每 16ms 以固定步长（0.016 秒）更新所有粒子的物理状态。
     *
     * @type {number}
     */
    this._updateId = Scheduler.interval(() => {
      this.updateFireworks(0.016);
    }, 16);

    /**
     * ## 动画结束定时器 ID
     *
     * 3 秒后标记动画结束。
     *
     * @type {number}
     */
    this._endId = Scheduler.delay(() => {
      this._finished = true;
    }, 3000);
  }

  /**
   * ## 创建一组烟花粒子
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
      // 随机角度（0 到 2π 弧度）
      const angle = Math.random() * Math.PI * 2;
      // 随机速度（5 到 20 像素/秒）
      const speed = 5 + Math.random() * 15;

      particles.push({
        /** ## 初始 X 坐标：画布水平中心 */
        x: width / 2,
        /** ## 初始 Y 坐标：画布中心上方 60 像素 */
        y: height / 2 - 60,
        /** ## X 轴速度分量 */
        vx: Math.cos(angle) * speed,
        /** ## Y 轴速度分量 */
        vy: Math.sin(angle) * speed,
        /** ## 粒子半径（3-7 像素随机） */
        radius: 3 + Math.random() * 4,
        /** ## 随机颜色 */
        color:
          FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        /** ## 初始透明度（完全不透明） */
        alpha: 1,
      });
    }

    return particles;
  }

  /**
   * ## 更新所有烟花粒子的物理状态
   *
   * 使用固定时间步长更新粒子的速度、位置、透明度和半径。
   *
   * ### 物理模拟
   *
   * - **空气阻力**：速度每帧衰减 2%（×0.98）
   * - **重力**：Y 轴速度增加（gravity × delta）
   * - **位置更新**：根据速度更新坐标
   * - **淡出**：透明度逐渐降低
   * - **膨胀**：半径逐渐增大
   *
   * ### 固定步长
   *
   * 由于 Scheduler 以固定 16ms 间隔驱动，传入固定的 delta = 0.016， 粒子运动在不同帧率下保持一致。
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

      // 更新位置（0.008 为速度缩放因子，调整动画节奏）
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
   * ## 清理资源
   *
   * 由 AnimationSystem 在移除动画时自动调用。 取消所有 Scheduler 定时器，恢复背景音乐。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;

    // 取消烟花生成定时器
    if (this._spawnId != null) {
      Scheduler.cancel(this._spawnId);
    }
    // 取消粒子物理更新定时器
    if (this._updateId != null) {
      Scheduler.cancel(this._updateId);
    }
    // 取消动画结束定时器
    if (this._endId != null) {
      Scheduler.cancel(this._endId);
    }

    // 恢复背景音乐（使用新等级）
    const events = AudioEvents();

    this.emit(events.RESUME_BGM, { level: this.level });
  }

  /**
   * ## 渲染升级动画
   *
   * 将等级和粒子数据传递给 UI 层绘制 "LEVEL UP" 文字和烟花效果。
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
