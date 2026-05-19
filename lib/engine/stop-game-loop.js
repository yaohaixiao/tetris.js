import Engine from '@/lib/engine';

/**
 * # 停止游戏主循环（Game Loop）
 *
 * 取消当前的 requestAnimationFrame 循环并清理引擎的时间状态。
 *
 * ## 使用场景
 *
 * | 场景               | 说明                                     |
 * | ------------------ | ---------------------------------------- |
 * | **暂停游戏**       | 玩家按暂停键时停止循环                   |
 * | **游戏结束**       | Game Over 后停止所有更新                 |
 * | **切换到主菜单**   | 离开游戏画面时停止循环                   |
 * | **进入非运行状态** | loading、replay 切换等需要暂停渲染的场景 |
 * | **重新启动前**     | `restartGameLoop` 中先停止再启动         |
 *
 * ## 清理内容
 *
 * 1. 取消 requestAnimationFrame 回调
 * 2. 清除 rafId 标识
 * 3. 重置 `lastTickTime`（上一帧时间戳）
 * 4. 重置 `fixedAccumulator`（逻辑更新时间累积器）
 *
 * 重置时间状态是为了避免恢复时出现跳帧或加速的异常行为。
 *
 * @function stopGameLoop
 * @returns {void}
 */
const stopGameLoop = () => {
  // 1. 如果没有正在运行的 RAF，直接退出
  if (!Engine.rafId) {
    return;
  }

  // 2. 取消浏览器帧循环回调
  cancelAnimationFrame(Engine.rafId);

  // 3. 清除 RAF 标识，标记循环已停止
  Engine.rafId = 0;

  // 4. 重置时间状态，避免恢复时出现跳帧/加速
  Engine.lastTickTime = 0; // 上一帧时间戳清零
  Engine.fixedAccumulator = 0; // 累积时间清零（用于固定步长更新）
};

export default stopGameLoop;
