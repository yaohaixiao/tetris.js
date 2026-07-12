import renderActiveOnly from '@/lib/services/ui/board/render-active-only.js';
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import renderHoldPiece from '@/lib/services/ui/hold/render-hold-piece.js';

/**
 * ============================================================
 *
 * # 渲染游戏进行中场景
 *
 * ============================================================
 *
 * 组合当前游戏帧中需要渲染的核心元素， 包括活动方块与棋盘的合成画面，以及下一个方块的预览。
 *
 * ## 设计职责
 *
 * - 仅负责调度：不处理具体绘制逻辑，由子模块负责
 * - 保持结构清晰：渲染层可拆分、可扩展
 * - 单一职责：每个子模块只负责自己的渲染任务
 *
 * ## 调用链
 *
 *     renderPlaying(canvas, state)
 *       → renderActiveOnly(canvas, state)   // 棋盘 + 活动方块
 *       → renderNextPiece(canvas, state)    // 预览方块
 *       → renderHoldPiece(canvas, state)    // 缓存方块
 *
 * @function renderPlaying
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderPlaying = (canvas, state) => {
  // 渲染当前棋盘 + 活动方块
  renderActiveOnly(canvas, state);

  // 渲染下一个方块预览区域
  renderNextPiece(canvas, state);

  // 渲染缓存方块预览区域
  renderHoldPiece(canvas, state);
};

export default renderPlaying;
