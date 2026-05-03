import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';

/**
 * # 延迟绘制选择级别界面
 *
 * 等待 "Press Start 2P" 字体加载完成后再绘制初始界面
 *
 * @function lazyRenderScene
 * @param {object} state - 游戏状态.
 * @returns {void}
 */
const lazyRenderScene = (state) => {
  if (document?.fonts?.load) {
    document.fonts.load('40px "Press Start 2P"').then(() => {
      renderScene(state);
    });
  } else {
    setTimeout(() => {
      // 绘制初始的选择界面
      renderScene(state);
    }, 150);
  }
};

export default lazyRenderScene;
