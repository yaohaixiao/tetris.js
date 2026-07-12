import renderReplay from '@/lib/services/ui/scenes/replay-scene/render-replay.js';

/**
 * ============================================================
 *
 * # 回放场景渲染入口
 *
 * ============================================================
 *
 * 对 renderReplay 的简单封装，作为回放场景的统一渲染入口。 当游戏进入回放模式时，UI 层通过此函数渲染完整的回放画面。
 *
 * @function replayScene
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const replayScene = (canvas, state) => {
  renderReplay(canvas, state);
};

export default replayScene;
