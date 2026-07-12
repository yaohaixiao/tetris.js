import renderBattleModeScene from '@/lib/services/ui/scenes/battle-mode-scene/render-battle-mode-scene.js';

/**
 * ============================================================
 *
 * # 对战模式选择场景入口
 *
 * ============================================================
 *
 * 该函数作为对战模式选择场景的控制层入口， 负责调度该场景的渲染逻辑。
 *
 * ## 当前职责
 *
 * - 接收游戏 state
 * - 转发到 renderBattleModeScene 进行 UI 渲染
 *
 * ## 设计目的
 *
 * - 保持 Scene 层与 Render 层分离
 * - 为未来扩展场景逻辑预留空间
 *
 * @function battleModeScene
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const battleModeScene = (canvas, state) => {
  // 转发到对战模式选择渲染层
  renderBattleModeScene(canvas, state);
};

export default battleModeScene;
