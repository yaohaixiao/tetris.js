import Engine from '@/lib/engine/engine.js';
import { registerAnimation } from '@/lib/animations/animations-system.js';
import GravityFallAnimation from '@/lib/animations/gravity-fall-animation.js';

/**
 * # 启动重力下落动画
 *
 * 该函数用于触发“重力结算动画流程”，例如：
 *
 * - 方块消行后产生空洞
 * - 上方方块进行下落补位
 *
 * 与直接修改 board 不同，该流程通过动画系统执行：
 *
 * 1. 创建 GravityFallAnimation 实例
 * 2. 将其注册到动画队列
 * 3. 由动画系统逐帧驱动执行与渲染
 *
 * @function startGravityFall
 * @returns {void}
 */
const startGravityFall = () => {
  /** 当前游戏状态（包含棋盘、分数、等级等） 由全局 Engine 统一管理 */
  const { state } = Engine;

  /**
   * 创建重力下落动画实例
   *
   * 该动画负责：
   *
   * - 计算方块下落路径
   * - 生成每个方块的 from/to 位置
   * - 在动画期间控制视觉渲染
   * - 在结束后更新 board 状态
   */
  const animation = new GravityFallAnimation(state);

  /**
   * ## 将动画注册到全局动画系统
   *
   * 动画系统负责：
   *
   * - Update(delta)
   * - Render()
   * - 生命周期管理（开始 / 结束 / 移除）
   */
  registerAnimation(animation);
};

export default startGravityFall;
