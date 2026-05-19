import Engine from '@/lib/engine';
import startGameLoop from '@/lib/engine/start-game-loop.js';

/**
 * # 重启游戏主循环
 *
 * 停止当前的游戏循环并立即启动新的循环。 通常在以下场景调用：
 *
 * - **消行升级**：等级提升后下落速度改变，需要以新的速度重启循环
 * - **游戏重新开始**：重置游戏后需要全新的循环
 * - **从暂停恢复**：部分实现中使用 restart 代替 start 来重置时间基准
 *
 * ## 与 Engine.start() 的区别
 *
 * | 方法               | 行为                       |
 * | ------------------ | -------------------------- |
 * | `Engine.start()`   | 直接启动循环，不清除旧循环 |
 * | `Engine.restart()` | 先停止旧循环，再启动新循环 |
 *
 * 在需要确保**只有一个循环在运行**的场景下，应使用 restart。
 *
 * @function restartGameLoop
 * @returns {void}
 */
const restartGameLoop = () => {
  // 清除之前的游戏循环，防止多个 requestAnimationFrame 同时运行
  Engine.stop();

  // 以新的时间基准启动游戏循环
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default restartGameLoop;
