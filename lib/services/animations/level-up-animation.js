import FIREWORK_COLORS from '@/lib/services/ui/constants/firework-colors.js';
import Base from '@/lib/core';

/**
 * # 升级动画类
 *
 * 负责管理游戏升级时的烟花特效动画，在指定时长内生成并更新烟花粒子效果
 */
class LevelUpAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);

    this.initialize(options);
  }

  initialize(options) {
    const { level } = options;

    /**
     * ## 渲染层级（UI 层，显示在最前面）
     *
     * @type {number}
     */
    this.layer = 100;

    /**
     * ## 是否阻塞用户输入
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * ## 动画名称标识
     *
     * @type {string}
     */
    this.name = 'level-up';

    // 动画总时长（秒）
    this.duration = 3;

    // 新烟花生成计时器（秒）
    this.spawnTimer = 0;

    // 动画总计时器（秒）
    this.timer = 0;

    this.level = level;

    // 初始化烟花粒子系统
    this.fireworks = this.createFireworks();

    this.active = true;

    const { Scheduler } = this;

    // 每 0.6 秒生成一组新烟花
    this._spawnId = Scheduler.interval(() => {
      this.fireworks.push(...this.createFireworks());
    }, 600);

    // 3 秒后结束动画
    this._endId = Scheduler.delay(() => {
      this.stop();
    }, 3000);
  }

  /**
   * ## 创建一组烟花粒子
   *
   * 在画布中心上方位置生成随机方向和速度的粒子
   *
   * @returns {object[]} 烟花粒子对象数组
   */
  createFireworks() {
    const { UI } = this;
    // 获取游戏画布的宽度和高度
    const { width, height } = UI.Canvas.gameBoard;

    const particles = [];

    // 生成40个烟花粒子
    for (let i = 0; i < 40; i++) {
      // 随机角度（0 到 2π 弧度）
      const angle = Math.random() * Math.PI * 2;
      // 随机速度（5 到 20 像素/秒）
      const speed = 5 + Math.random() * 15;

      particles.push({
        x: width / 2, // 初始X坐标：画布中心
        y: height / 2 - 60, // 初始Y坐标：画布中心上方60像素
        vx: Math.cos(angle) * speed, // X轴速度分量
        vy: Math.sin(angle) * speed, // Y轴速度分量
        radius: 3 + Math.random() * 4, // 粒子半径（3-7像素）
        color:
          FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)], // 随机颜色
        alpha: 1, // 初始完全不透明
      });
    }

    return particles;
  }

  /**
   * ## 更新所有烟花粒子的物理状态
   *
   * 包括：速度衰减、重力影响、位置更新、透明度衰减、半径增大
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   */
  updateFireworks(delta) {
    const gravity = 0.01; // 重力加速度（像素/秒²）

    // 遍历所有烟花粒子
    for (const p of this.fireworks) {
      // 空气阻力：每帧速度衰减2%（乘以0.98）
      p.vx *= 0.98;
      p.vy *= 0.98;

      // 应用重力影响（Y轴速度增加）
      p.vy += gravity * delta;

      // 更新位置（delta * 0.008 是速度缩放因子，调整动画速度）
      p.x += p.vx * delta * 0.008;
      p.y += p.vy * delta * 0.008;

      // 透明度逐渐降低（淡出效果）
      p.alpha -= delta * 0.024;
      // 半径逐渐增大（膨胀效果）
      p.radius += delta * 10;
    }

    // 过滤掉已经完全透明的粒子（alpha <= 0）
    this.fireworks = this.fireworks.filter((p) => p.alpha > 0);
  }

  /**
   * ## 更新动画状态
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
   */
  update(delta) {
    // 只负责粒子物理（帧驱动）
    this.updateFireworks(delta);
    // 存活与否由 Scheduler 的 delay 控制
    return this.active;
  }

  /**
   * ## 升级动画结束处理
   *
   * 继续播放背景音乐
   */
  stop() {
    const { level, Scheduler } = this;

    this.active = false;

    Scheduler.cancel(this._spawnId);
    Scheduler.cancel(this._endId);

    this.emit('audio:resume:bgm', { level });
  }

  /**
   * ## 渲染升级动画
   *
   * 调用专门渲染函数显示"LEVEL UP"文字和烟花效果
   */
  render() {
    const { level, fireworks, Game } = this;

    this.emit(`ui:${Game.id}:render:level:up`, { level, fireworks });
  }
}

export default LevelUpAnimation;
