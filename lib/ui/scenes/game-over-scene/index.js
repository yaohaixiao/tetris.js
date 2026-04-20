import renderGameOver from '@/lib/ui/scenes/game-over-scene/render-game-over.js';

/**
 * # 游戏结束场景入口（Game Over Scene Controller）
 *
 * 该函数作为 Game Over 场景的控制层入口， 负责调度该场景的渲染逻辑。
 *
 * 当前职责：
 *
 * - 接收游戏 state
 * - 将 state 传递给 renderGameOver 进行 UI 渲染
 *
 * 架构意义：
 *
 * - 保持 Scene 层与 Render 层分离
 * - Scene 层只负责“组织流程”，不负责具体绘制
 * - Render 层负责具体 Canvas UI 输出
 *
 * 设计目的：
 *
 * - 为未来扩展 Game Over 行为预留空间
 *
 * 可扩展方向：
 *
 * - 动画（fade in / shake / zoom）
 * - 输入控制（restart / menu 选择）
 * - 音效触发（game over sound）
 * - 数据统计（score upload / analytics）
 *
 * @function gameOverScene
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const gameOverScene = (state) => {
  // ======== Game Over 渲染入口 ========
  renderGameOver(state);

  /*
   * ======== 未来扩展区域 ========
   * 示例：
   * playGameOverSound();
   * handleRestartInput(state);
   * animateGameOver(state);
   */
};

export default gameOverScene;
