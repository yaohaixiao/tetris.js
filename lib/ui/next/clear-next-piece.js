import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 清空“下一个方块预览画布”
 *
 * 用于重置 next piece 预览区域的绘制内容， 在每次重新渲染预览方块前调用，避免残留图形。
 *
 * 特点：
 *
 * - 只作用于 nextPiece 画布
 * - 不影响主游戏画布
 * - 纯副作用函数（无返回值）
 *
 * @function clearNextPiece
 * @returns {void}
 */
const clearNextPiece = () => {
  const { nextPiece, nextPieceContext } = Canvas;
  const { width, height } = nextPiece;

  // ======== 清空预览画布区域 ========
  nextPieceContext.clearRect(0, 0, width, height);
};

export default clearNextPiece;
