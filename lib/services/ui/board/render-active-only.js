import renderBoard from '@/lib/services/ui/board/render-board.js';
import renderActivePieces from '@/lib/services/ui/board/render-active-pieces.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # 渲染"仅当前游戏状态"的核心画面（Active Layer）
 *
 * 只绘制当前游戏的核心元素，不包含任何 UI 或特效层。 这是最底层的游戏渲染，用于叠加其他视觉层之前的基础画面。
 *
 * ## 包含内容
 *
 * - **已落地的棋盘**（board）：所有已锁定的方块
 * - **Ghost 预览**（半透明投影，level ≤ 9 时显示）
 * - **当前活动方块**（curr）：正在下落或移动的方块
 *
 * ## 不包含内容
 *
 * - UI 文本（分数、等级、提示等）
 * - 遮罩层（overlay）
 * - 特效层（烟花、消行闪烁等）
 * - 场景背景
 *
 * ## 使用场景
 *
 * - `renderPlaying`：游戏进行中的基础画面
 * - `renderPaused`：暂停时作为背景保留
 * - `renderGameOver`：游戏结束时冻结的最终画面
 *
 * @function renderActiveOnly
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderActiveOnly = (canvas, state) => {
  const { board, curr, cx, cy, level } = state;

  // 1. 渲染棋盘：绘制已固定的方块（已落地状态）
  if (board) {
    renderBoard(canvas, board);
  }

  // 2. Ghost 预览（仅在 9 关及以下显示）
  if (curr && level <= 9) {
    const events = GameEvents(canvas.uuid);
    canvas.emit(events.GET_GHOST_POSITION, { curr, cy });
  }

  // 3. 渲染当前活动方块：绘制正在下落/移动的方块
  if (curr) {
    renderActivePieces(canvas, curr, cx, cy);
  }
};

export default renderActiveOnly;
