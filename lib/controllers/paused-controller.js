import Engine from '@/lib/engine';
import PausedAnimation from '@/lib/animations/paused-animation.js';

/**
 * 当前暂停动画实例（单例控制）
 *
 * 设计目的：
 *
 * - 确保同一时间只有一个 paused animation 存在
 */
let animation = null;

/**
 * 启动暂停动画
 *
 * 如果已存在，则不会重复创建
 */
export const startPaused = () => {
  // 避免重复创建动画实例
  if (animation) {
    return;
  }

  // 创建暂停动画实例
  animation = new PausedAnimation();

  // 注册到动画系统
  Engine.Animations.register(animation);
};

/**
 * 停止暂停动画
 *
 * 通过修改 animation.update，使其返回 false， 让 animation system 在下一帧自动移除
 */
export const stopPaused = () => {
  if (!animation) {
    return;
  }

  // 终止动画
  animation.stop();

  // 清空引用
  animation = null;
};
