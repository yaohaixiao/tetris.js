import GameState from '@/lib/game/state/game-state.js';
import renderMainMenu from '@/lib/ui/render-main-menu.js';

/**
 * # 延迟绘制选择级别界面
 *
 * 等待 "Press Start 2P" 字体加载完成后再绘制初始界面
 *
 * @function lazyRenderMainMenu
 * @returns {void}
 */
const lazyRenderMainMenu = () => {
  if (document?.fonts?.load) {
    document.fonts.load('40px "Press Start 2P"').then(() => {
      renderMainMenu(GameState.level);
    });
  } else {
    setTimeout(() => {
      // 绘制初始的选择界面
      renderMainMenu(GameState.level);
    }, 150);
  }
};

export default lazyRenderMainMenu;
