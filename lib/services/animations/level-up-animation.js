import FIREWORK_COLORS from '@/lib/services/ui/constants/firework-colors.js';
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
 * - 每 0.6 秒生成一组新烟花（共 3 秒内生成 5 组）
 * - 总持续时间为 3 秒
 * - 动画期间阻塞用户输入
 *
 * ## 生命周期
 *
 * 1. `constructor` → 初始化粒子系统，启动定时生成器
 * 2. `update(delta)` → 更新所有粒子的物理状态
 * 3. `render()` → 渲染粒子和 "LEVEL UP" 文字
 * 4. 3 秒后 → `stop()` → 恢复背景音乐
 *
 * @class LevelUpAnimation
 */
class LevelUpAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
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
   * 设置动画属性，创建初始烟花粒子，启动定时生成器。
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
     * ## 动画总时长（秒）
     *
     * @type {number}
     */
    this.duration = 3;

    /**
     * ## 新烟花生成计时器（秒）
     *
     * @type {number}
     */
    this.spawnTimer = 0;

    /**
     * ## 动画总计时器（秒）
     *
     * @type {number}
     */
    this.timer = 0;

    /**
     * ## 当前等级
     *
     * @type {number}
     */
    this.level = level;

    /**
     * ## 烟花粒子数组
     *
     * @type {object[]}
     */
    this.fireworks = this.createFireworks();

    /**
     * ## 动画是否仍在进行
     *
     * @type {boolean}
     */
    this.active = true;

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
     * ## 动画结束定时器 ID
     *
     * 3 秒后停止动画。
     *
     * @type {number}
     */
    this._endId = Scheduler.delay(() => {
      this.stop();
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
    // 获取游戏画布的宽度和高度
    const { width, height } = UI.Canvas.gameBoard;

    const particles = [];

    // 生成 40 个烟花粒子
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
   * 每帧更新粒子的速度、位置、透明度和半径。
   *
   * ### 物理模拟
   *
   * - **空气阻力**：速度每帧衰减 2%（×0.98）
   * - **重力**：Y 轴速度增加（gravity × delta）
   * - **位置更新**：根据速度更新坐标
   * - **淡出**：透明度逐渐降低
   * - **膨胀**：半径逐渐增大
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {void}
   */
  updateFireworks(delta) {
    // 重力加速度（像素/秒²）
    const gravity = 0.01;

    // 遍历所有烟花粒子
    for (const p of this.fireworks) {
      // 空气阻力：每帧速度衰减 2%
      p.vx *= 0.98;
      p.vy *= 0.98;

      // 应用重力影响（Y 轴速度增加）
      p.vy += gravity * delta;

      // 更新位置（0.008 是速度缩放因子，调整动画节奏）
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
   * ## 更新动画状态
   *
   * 每帧调用，更新所有粒子的物理状态。
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 返回当前是否激活
   */
  update(delta) {
    // 更新粒子物理（位置、速度、透明度等）
    this.updateFireworks(delta);
    // 存活状态由 Scheduler 的 delay 控制
    return this.active;
  }

  /**
   * ## 升级动画结束处理
   *
   * 取消定时器，恢复背景音乐播放。
   *
   * @returns {void}
   */
  stop() {
    const { level, Scheduler } = this;
    const events = AudioEvents();

    this.active = false;

    // 取消烟花生成定时器和动画结束定时器
    Scheduler.cancel(this._spawnId);
    Scheduler.cancel(this._endId);

    // 恢复背景音乐（使用新等级）
    this.emit(events.RESUME_BGM, { level });
  }

  /**
   * ## 渲染升级动画
   *
   * 将等级和粒子数据传递给 UI 层绘制 "LEVEL UP" 文字和烟花效果。
   *
   * @returns {void}
   */
  render() {
    const { level, fireworks, Game } = this;
    const events = UIEvents(Game.id);

    this.emit(events.RENDER_LEVEL_UP, { level, fireworks });
  }
}

export default LevelUpAnimation;
