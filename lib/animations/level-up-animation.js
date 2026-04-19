import Canvas from '@/lib/ui/core/canvas.js';
import FIREWORK_COLORS from '@/lib/ui/constants/firework-colors.js';
import renderLevelUp from '@/lib/ui/effects/render-level-up.js';

/**
 * # 升级动画类
 *
 * 负责管理游戏升级时的烟花特效动画，在指定时长内生成并更新烟花粒子效果
 */
class LevelUpAnimation {
  /**
   * ## 创建升级动画实例
   *
   * @param {object} options - 配置选项
   * @param {Function} options.onComplete - 动画完成时的回调函数
   * @param {object} options.state - 动画完成时的回调函数
   */
  constructor({ onComplete, state }) {
    // 初始化烟花粒子系统
    this.fireworks = this.createFireworks();
    this.onComplete = onComplete; // 动画完成回调

    this.name = 'level-up'; // 动画名称标识
    this.timer = 0; // 动画总计时器（秒）
    this.duration = 3; // 动画总时长（秒）
    this.spawnTimer = 0; // 新烟花生成计时器（秒）
    this.layer = 100; // 渲染层级（数值越大越靠前，100足够显示在最上层）
    this.blocking = true; // 是否阻塞用户输入（升级动画期间禁止操作）

    this.state = state;
  }

  /**
   * ## 创建一组烟花粒子
   *
   * 在画布中心上方位置生成随机方向和速度的粒子
   *
   * @returns {object[]} 烟花粒子对象数组
   */
  createFireworks() {
    const { width, height } = Canvas.gameBoard; // 获取游戏画布的宽度和高度

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
   * ## 更新动画状态
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
   */
  update(delta) {
    // 累加动画总时间
    this.timer += delta;
    // 累加烟花生成计时器
    this.spawnTimer += delta;

    // 更新所有烟花粒子的物理状态
    this.updateFireworks(delta);

    // 每0.6秒生成一组新的烟花（持续产生烟花效果）
    if (this.spawnTimer > 0.6) {
      // 添加新生成的烟花粒子到现有粒子数组中
      this.fireworks.push(...this.createFireworks());
      this.spawnTimer = 0; // 重置生成计时器
    }

    // 检查动画是否达到总时长
    if (this.timer >= this.duration) {
      // 触发完成回调（如果提供了回调函数）
      this.onComplete?.();
      // 返回false告诉动画系统删除此动画实例
      return false;
    }

    // 返回true表示动画仍在进行中
    return true;
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
      /*
       * 注意：这里使用了位运算符 &，可能是笔误，通常应该是 *
       * 原代码：p.y += (p.vy * delta) & 0.008;
       * 修正建议：p.y += p.vy * delta * 0.008;
       */
      p.y += p.vy * delta * 0.008; // 假设原意是乘法，保持与X轴一致

      // 透明度逐渐降低（淡出效果）
      p.alpha -= delta * 0.024;
      // 半径逐渐增大（膨胀效果）
      p.radius += delta * 10;
    }

    // 过滤掉已经完全透明的粒子（alpha <= 0）
    this.fireworks = this.fireworks.filter((p) => p.alpha > 0);
  }

  /**
   * ## 渲染升级动画
   *
   * 调用专门渲染函数显示"LEVEL UP"文字和烟花效果
   */
  render() {
    renderLevelUp(
      {
        show: true, // 显示升级文字
        fireworks: this.fireworks, // 传递烟花粒子数据
      },
      this.state,
    );
  }
}

export default LevelUpAnimation;
