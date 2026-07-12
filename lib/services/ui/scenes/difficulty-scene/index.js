import renderDifficultyScene from '@/lib/services/ui/scenes/difficulty-scene/render-difficulty-scene.js';

/**
 * ============================================================
 *
 * # 难度选择场景渲染入口
 *
 * ============================================================
 *
 * 对 renderDifficultyScene 的简单封装， 作为难度选择界面的统一渲染入口。 当游戏进入难度选择模式时，
 * UI层通过此函数渲染完整的难度选择画面。
 *
 * @function difficultyScene
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const difficultyScene = (canvas, state) => {
  renderDifficultyScene(canvas, state);
};

export default difficultyScene;
