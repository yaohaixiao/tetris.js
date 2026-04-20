import renderMainMenu from '@/lib/ui/scenes/main-menu-scene/render-main-menu.js';

/**
 * # 延迟绘制选择级别界面
 *
 * 等待 "Press Start 2P" 字体加载完成后再绘制初始界面
 *
 * @function lazyRenderMainMenu
 * @param {object} state - 游戏状态.
 * @returns {void}
 */
const lazyRenderMainMenu = (state) => {
  if (document?.fonts?.load) {
    document.fonts.load('40px "Press Start 2P"').then(() => {
      renderMainMenu(state.level);
    });
  } else {
    setTimeout(() => {
      // 绘制初始的选择界面
      renderMainMenu(state.level);
    }, 150);
  }
};

export default lazyRenderMainMenu;
