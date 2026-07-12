import renderMainMenu from '@/lib/services/ui/scenes/main-menu-scene/render-main-menu.js';

/**
 * ============================================================
 *
 * # 主菜单场景入口
 *
 * ============================================================
 *
 * 该函数作为主菜单场景的控制层入口， 用于调度该场景的渲染逻辑。
 *
 * ## 当前职责
 *
 * - 提取 state 中的 level
 * - 交由 renderMainMenu 负责具体 UI 绘制
 *
 * ## 设计目的
 *
 * - 保持 Scene 层作为控制层，而非直接渲染层
 * - 为未来扩展场景逻辑预留空间
 *
 * ## 扩展预留
 *
 * - 菜单动画（fade / slide）
 * - 输入控制（键盘选择 level）
 * - UI 状态管理（hover / select）
 * - 埋点或日志记录
 *
 * @function mainMenuScene
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const mainMenuScene = (canvas, state) => {
  // 转发到主菜单渲染层
  renderMainMenu(canvas, state.level);
};

export default mainMenuScene;
