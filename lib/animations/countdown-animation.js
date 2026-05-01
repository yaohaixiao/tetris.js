import Engine from '@/lib/engine';
import Sounds from '@/lib/audio/sounds.js';
import renderCountdown from '@/lib/ui/effects/render-countdown.js';

/**
 * # CountdownAnimation
 *
 * 倒计时动画类，用于在游戏开始前显示 3、2、1 的倒计时效果。
 *
 * ## 职责
 *
 * - 控制倒计时数字（3 → 2 → 1）
 * - 管理缩放动画（scale 由大到小）
 * - 控制动画节奏（基于时间累加器）
 * - 在结束时触发游戏开始
 *
 * ## 生命周期
 *
 * 1. 创建实例
 * 2. 每帧调用 update(delta)
 * 3. 渲染由 render() 执行
 * 4. 倒计时结束后调用 stop() 并销毁
 */
class CountdownAnimation {
  /**
   * ## 渲染层级（UI 层，显示在最前面）
   *
   * @type {number}
   */
  layer = 100;

  /**
   * ## 是否阻塞用户输入
   *
   * @type {boolean}
   */
  blocking = true;

  /**
   * ## 动画名称标识
   *
   * @type {string}
   */
  name = 'countdown';

  constructor() {
    /**
     * ## 内部状态
     *
     * @type {object}
     * @property {boolean} show - 是否显示倒计时
     * @property {number} number - 当前倒计时数字（3 → 2 → 1）
     * @property {number} scale - 缩放比例（用于动画效果）
     * @property {number} count - 帧计数器（控制节奏）
     * @property {number} acc - 时间累加器（秒）
     */
    this.state = {
      show: true,
      number: 3,
      scale: 4,
      count: 0,
      acc: 0,
    };
  }

  /**
   * ## 更新动画状态
   *
   * 每帧调用：
   *
   * - 控制更新节奏（基于 acc）
   * - 更新缩放动画
   * - 控制数字切换
   * - 判断动画是否结束
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 是否继续存活（true=继续，false=结束）
   */
  update(delta) {
    const { state } = this;

    // 累加时间
    state.acc += delta;

    /** 控制更新频率： 每 0.01 秒更新一次 */
    if (state.acc < 0.01) {
      return true;
    }

    // 重置累加器
    state.acc = 0;

    // 帧计数递增
    state.count++;

    /** 缩放动画：逐渐缩小（最小为 1） */
    state.scale = Math.max(1, state.scale - 0.4);

    /** 每 50 帧切换一次数字（约 0.5 秒） */
    if (state.count >= 50) {
      state.count = 0;
      state.number -= 1;
      state.scale = 4;

      // 播放倒计时音效
      if (state.number >= 1) {
        Sounds.countdown();
      }
    }

    /** 判断是否结束 */
    if (state.number <= 0) {
      this.stop();
      return false;
    }

    return true;
  }

  /**
   * ## 倒计时结束处理
   *
   * - 切换游戏状态为 playing
   * - 启动游戏主逻辑
   */
  stop() {
    const { Game } = Engine;

    // 切换为游戏进行中
    Game.store.setMode('playing');

    // 启动游戏逻辑（生成方块等）
    Game.begin();
  }

  /**
   * ## 渲染动画
   *
   * 将当前 state 传递给渲染函数
   */
  render() {
    renderCountdown(this.state);
  }
}

export default CountdownAnimation;
