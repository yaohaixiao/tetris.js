import Sounds from '@/lib/audio/sounds.js';
import renderCountdown from '@/lib/ui/render-countdown.js';
import setGameStateMode from '@/lib/game/state/set-game-state-mode.js';
import beginPlaying from '@/lib/game/core/begin-playing.js';

/**
 * # 创建倒计时动画对象（工厂函数）
 *
 * 用于在游戏开始前显示 3、2、1 的倒计时效果
 *
 * @returns {object} 动画对象，包含 name、layer、blocking、update、render 方法
 */
const CountdownAnimation = () => {
  /**
   * ## 倒计时动画的内部状态
   *
   * @type {object}
   * @property {boolean} show - 是否显示倒计时
   * @property {number} number - 当前倒计时的数字（3、2、1）
   * @property {number} scale - 数字的缩放比例（用于动画效果）
   * @property {number} count - 帧计数器（控制动画节奏）
   * @property {number} acc - 时间累加器（秒），用于精确控制动画速度
   */
  const state = {
    show: true,
    number: 3,
    scale: 4,
    count: 0,
    acc: 0,
  };

  return {
    name: 'countdown', // 动画名称标识
    layer: 100, // 渲染层级（UI 层，显示在最前面）
    blocking: true, // 是否阻塞用户输入（倒计时期间禁止操作）

    /**
     * ## 更新倒计时动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
     */
    update(delta) {
      // 累加时间差
      state.acc += delta;

      /*
       * 控制更新频率：每 0.01 秒更新一次
       * 相当于固定帧率控制，避免数字变化过快
       */
      if (state.acc < 0.01) {
        return true; // 时间不足，跳过本次更新，动画继续
      }

      // 重置时间累加器（准备下一次更新）
      state.acc = 0;

      // 渲染当前帧的倒计时
      renderCountdown(state);

      // 帧计数器递增
      state.count++;
      // 数字缩放逐渐减小（从 4 到 1），产生缩小动画效果
      state.scale = Math.max(1, state.scale - 0.4);

      /*
       * 每 50 帧切换一次倒计时数字
       * 50 帧 * 0.01 秒 = 0.5 秒切换一次，保持合适的倒计时节奏
       */
      if (state.count >= 50) {
        state.count = 0; // 重置帧计数器
        state.number--; // 数字减 1（3 -> 2 -> 1）
        state.scale = 4; // 重置缩放比例，新数字重新开始缩小动画

        // 只要还有数字（1、2、3），就播放倒计时音效
        if (state.number >= 1) {
          Sounds.countdown(); // 播放"滴答"声
        }
      }

      // 检查倒计时是否结束
      if (state.number <= 0) {
        // 退出等级选择/准备状态，切换到游戏进行中模式
        setGameStateMode('playing');
        // 开始正式游戏逻辑（生成方块、启动下落等）
        beginPlaying();
        return false; // 返回 false，告诉动画系统删除此动画
      }

      return true; // 倒计时未结束，动画继续
    },

    // 渲染倒计时动画：将当前状态传递给渲染函数
    render() {
      renderCountdown(state);
    },
  };
};

export default CountdownAnimation;
