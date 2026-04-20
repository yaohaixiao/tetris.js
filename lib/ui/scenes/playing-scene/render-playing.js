import renderActiveOnly from '@/lib/ui/board/render-active-only.js';
import renderNextPiece from '@/lib/ui/next/render-next-piece.js';

/**
 * # 渲染“游戏进行中”场景
 *
 * 该函数负责组合当前游戏帧中需要渲染的核心元素：
 *
 * - 当前活动方块（active piece + board）
 * - 下一个方块预览（next piece）
 *
 * 设计职责：
 *
 * - 仅负责调度各个子渲染模块
 * - 不处理具体绘制逻辑（由子模块负责）
 * - 保持渲染层结构清晰、可拆分
 *
 * 调用链示例：
 *
 * ```js
 * Scenes['playing'](state)
 *   → renderPlaying(state)
 *     → renderActiveOnly(state)
 *     → renderNextPiece(state)
 * ```
 *
 * // 可扩展： // @property {Object} board // @property {Object} activePiece //
 *
 * @function renderPlaying
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderPlaying = (state) => {
  // ======== 渲染当前棋盘 + 活动方块 ========
  renderActiveOnly(state);

  // ======== 渲染“下一个方块”预览 ========
  renderNextPiece(state);
};

export default renderPlaying;
