import renderPaused from '@/lib/services/ui/scenes/paused-scene/render-paused.js';

/**
 * ============================================================
 *
 * # 游戏暂停场景入口
 *
 * ============================================================
 *
 * 该函数是暂停场景的统一入口层， 用于调度该场景的渲染逻辑。
 *
 * ## 扩展预留
 *
 * - 场景进入 / 退出生命周期（enter / exit）
 * - 暂停状态逻辑控制（暂停计时器、冻结动画等）
 * - Debug / DevTools 信息输出
 * - UI 层叠加（快捷键提示、菜单）
 * - 动画过渡效果（fade in/out）
 *
 * ## 设计目的
 *
 * - Scene 层作为控制层，不直接承担绘制细节
 * - Render 层负责纯 UI 渲染
 * - 保持职责分离，便于后期扩展与维护
 *
 * @function pausedScene
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const pausedScene = (canvas, state) => {
  // 转发到暂停场景渲染层
  renderPaused(canvas, state);
};

export default pausedScene;
