import Engine from '@/lib/engine';

/**
 * # 停止游戏主循环（Game Loop）
 *
 * 作用：
 *
 * - 取消当前的 requestAnimationFrame 循环
 * - 清理引擎时间相关状态
 *
 * 使用场景：
 *
 * - 暂停游戏
 * - 游戏结束（Game Over）
 * - 切换到主菜单
 * - 进入非运行状态（如 loading / replay 切换）
 *
 * @function stopGameLoop
 * @returns {void}
 */
const stopGameLoop = () => {
  // 1. 如果没有正在运行的 RAF，直接退出
  if (!Engine.rafId) {
    return;
  }

  // 2. 取消浏览器帧循环
  cancelAnimationFrame(Engine.rafId);

  // 3. 清理 RAF 标识
  Engine.rafId = null;

  // 4. 重置时间状态（避免恢复时出现跳帧/加速）
  Engine.timestamp = 0; // 上一帧时间戳
  Engine.accumulator = 0; // 累积时间（用于固定步长更新）
};

export default stopGameLoop;
