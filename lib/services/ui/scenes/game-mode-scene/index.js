import renderGameModeScene from './render-game-mode-scene.js';

/**
 * ============================================================
 *
 * # 游戏模式选择场景入口
 *
 * ============================================================
 *
 * 该函数作为游戏模式选择场景的控制层入口， 负责调度该场景的渲染逻辑。
 *
 * ## 当前职责
 *
 * - 接收游戏 state
 * - 转发到 renderGameModeScene 进行 UI 渲染
 *
 * ## 设计目的
 *
 * - 保持 Scene 层与 Render 层分离
 * - 为未来扩展场景逻辑预留空间
 *
 * @function gameModeScene
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const gameModeScene = (canvas, state) => {
  // 转发到游戏模式选择渲染层
  renderGameModeScene(canvas, state);
};

export default gameModeScene;
