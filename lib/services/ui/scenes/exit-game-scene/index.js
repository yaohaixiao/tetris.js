import renderExitGameScene from '@/lib/services/ui/scenes/exit-game-scene/render-exit-game-scene.js';

/**
 * ============================================================
 *
 * # 退出游戏菜单场景入口
 *
 * ============================================================
 *
 * 该函数作为退出游戏菜单场景的控制层入口， 负责调度该场景的渲染逻辑。
 *
 * ## 当前职责
 *
 * - 接收游戏 state
 * - 转发到 renderExitGameScene 进行 UI 渲染
 *
 * ## 设计目的
 *
 * - 保持 Scene 层与 Render 层分离
 * - 为未来扩展场景逻辑预留空间
 *
 * @function exitGameScene
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const exitGameScene = (canvas, state) => {
  // 转发到退出游戏菜单渲染层
  renderExitGameScene(canvas, state);
};

export default exitGameScene;
