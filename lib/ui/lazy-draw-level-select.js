import GameState from '../state/game-state.js';
import drawLevelSelect from './draw-level-select.js';

/**
 * # 延迟绘制选择级别界面
 *
 * 等待 "Press Start 2P" 字体加载完成后再绘制初始界面
 *
 * @function lazyDrawLevelSelect
 * @returns {void}
 */
const lazyDrawLevelSelect = () => {
  if (document?.fonts?.load) {
    document.fonts.load('40px "Press Start 2P"').then(() => {
      drawLevelSelect(GameState.level);
    });
  } else {
    setTimeout(() => {
      // 绘制初始的选择界面
      drawLevelSelect(GameState.level);
    }, 150);
  }
};

export default lazyDrawLevelSelect;
