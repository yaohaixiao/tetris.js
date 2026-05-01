import Engine from '@/lib/engine';
import CountdownAnimation from '@/lib/animations/countdown-animation.js';

/**
 * # 启动游戏倒计时动画
 *
 * 用于游戏开始前的倒计时流程（例如 3 → 2 → 1 → GO）
 *
 * 当前设计特点：
 *
 * - 通过 animation system 驱动 UI/流程
 *
 * 使用场景：
 *
 * - 游戏 start 前
 * - 回合开始前（如果扩展到关卡系统）
 */
const startCountdown = () => {
  // 创建倒计时动画并注册到动画系统
  Engine.Animations.register(new CountdownAnimation());
};

export default startCountdown;
