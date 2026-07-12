import renderGameOver from '@/lib/services/ui/scenes/game-over-scene/render-game-over.js';

/**
 * ============================================================
 *
 * # 游戏结束场景入口
 *
 * ============================================================
 *
 * 该函数作为 Game Over 场景的控制层入口， 负责调度该场景的渲染逻辑。
 *
 * ## 当前职责
 *
 * - 接收游戏 state
 * - 将 state 传递给 renderGameOver 进行 UI 渲染
 *
 * ## 设计目的
 *
 * - 保持 Scene 层与 Render 层分离
 * - Scene 层只负责组织流程，不负责具体绘制
 * - Render 层负责具体 Canvas UI 输出
 * - 为未来扩展 Game Over 行为预留空间
 *
 * ## 扩展预留
 *
 * - 动画（fade in / shake / zoom）
 * - 输入控制（restart / menu 选择）
 * - 音效触发（game over sound）
 * - 数据统计（score upload / analytics）
 *
 * @function gameOverScene
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const gameOverScene = (canvas, state) => {
  // 转发到 Game Over 渲染层
  renderGameOver(canvas, state);
};

export default gameOverScene;
