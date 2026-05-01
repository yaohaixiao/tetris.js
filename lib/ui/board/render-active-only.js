import renderBoard from '@/lib/ui/board/render-board.js';
import renderActivePieces from '@/lib/ui/board/render-active-pieces.js';

/**
 * # 渲染“仅当前游戏状态”的核心画面（Active Layer）
 *
 * 用于只绘制当前游戏局部状态，而不包含 UI / 特效层：
 *
 * 包含内容：
 *
 * - 已确认落地的棋盘（board）
 * - 当前正在操作的方块（curr）
 *
 * 不包含内容：
 *
 * - UI 文本（score / level / tips）
 * - 遮罩层（overlay）
 * - 特效层（fireworks 等）
 *
 * @function renderActiveOnly
 * @param {object} state - 游戏状态
 * @returns {void}
 */
const renderActiveOnly = (state) => {
  const { board, curr, cx, cy } = state;

  // 1. 渲染棋盘：绘制已固定的方块（已落地状态）
  if (board) {
    renderBoard(board);
  }

  // 2. 渲染当前活动方块：绘制正在下落/移动的方块
  if (curr) {
    renderActivePieces(curr, cx, cy);
  }
};

export default renderActiveOnly;
