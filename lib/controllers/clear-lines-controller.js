import { registerAnimation } from '@/lib/animations/animations-system.js';
import ClearLinesAnimation from '@/lib/animations/clear-lines-animation.js';

/**
 * # 启动“消行动画流程”
 *
 * 用于在消除多行时触发视觉动画效果， 并将动画注册到全局 animation system 中执行。
 *
 * 当前设计特点：
 *
 * - 直接依赖 Engine.state（全局单例）
 * - 直接注册动画系统（side effect）
 *
 * 使用场景：
 *
 * - 消行检测后
 * - Score 更新前/后视觉反馈
 *
 * @param {number[]} lines - 被消除的行索引数组
 * @param {object} state - 游戏状态信息
 */
const startClearLines = (lines, state) => {
  // 创建消行动画实例，并绑定当前 game state
  const animation = new ClearLinesAnimation(lines, state);

  // 注册到动画系统执行队列
  registerAnimation(animation);
};

export default startClearLines;
