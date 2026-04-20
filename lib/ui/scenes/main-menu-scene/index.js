import renderMainMenu from '@/lib/ui/scenes/main-menu-scene/render-main-menu.js';

/**
 * # 主菜单场景入口（Main Menu Scene Controller）
 *
 * 该函数作为主菜单场景的控制层入口，用于调度该场景的渲染逻辑。
 *
 * 当前职责：
 *
 * - 提取 state 中的 level
 * - 交由 renderMainMenu 负责具体 UI 绘制
 *
 * 设计目的：
 *
 * - 保持 Scene 层作为“控制层”，而不是直接渲染层
 * - 为未来扩展场景逻辑预留空间（例如输入处理 / 动画 / 状态切换）
 *
 * 可扩展方向：
 *
 * - 菜单动画（fade / slide）
 * - 输入控制（键盘选择 level）
 * - UI 状态管理（hover / select）
 * - 埋点或日志记录
 *
 * @function mainMenuScene
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const mainMenuScene = (state) => {
  // ======== 主菜单渲染入口 ========
  renderMainMenu(state.level);
};

export default mainMenuScene;
