/**
 * ============================================================
 *
 * # 清空下一个方块预览画布
 *
 * ============================================================
 *
 * 重置预览区域的绘制内容， 在每次重新渲染预览方块前调用，避免残留图形。
 *
 * ## 特点
 *
 * - 只作用于 nextPiece 画布
 * - 不影响主游戏画布
 * - 纯副作用函数（无返回值）
 *
 * @function clearNextPiece
 * @param {object} canvas - Canvas 画布管理器对象
 * @returns {void}
 */
const clearNextPiece = (canvas) => {
  const { nextPiece, nextPieceContext } = canvas;
  const { width, height } = nextPiece;

  // 清空预览画布的整个区域
  nextPieceContext.clearRect(0, 0, width, height);
};

export default clearNextPiece;
