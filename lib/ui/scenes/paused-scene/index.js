import renderPaused from '@/lib/ui/scenes/paused-scene/render-paused.js';

/**
 * # 游戏“暂停”场景入口（Paused Scene Controller）
 *
 * 该函数是暂停场景的统一入口层，用于调度该场景的渲染逻辑。
 *
 * 当前实现仅负责调用 render 层进行绘制，但保留该层结构是为了未来扩展：
 *
 * 可扩展方向包括：
 *
 * - 场景进入 / 退出生命周期（enter / exit）
 * - 暂停状态逻辑控制（暂停计时器、冻结动画等）
 * - Debug / DevTools 信息输出
 * - UI 层叠加（例如快捷键提示、菜单）
 * - 动画过渡效果（fade in/out）
 *
 * 架构意义：
 *
 * - Scene 层作为“控制层”，不直接承担绘制细节
 * - Render 层负责纯 UI 渲染
 * - 保持职责分离，便于后期扩展与维护
 *
 * @function pausedScene
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const pausedScene = (state) => {
  // ======== 暂停场景渲染入口 ========
  renderPaused(state);
};

export default pausedScene;
