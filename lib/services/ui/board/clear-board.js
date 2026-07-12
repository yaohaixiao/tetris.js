/**
 * ============================================================
 *
 * # 清空整个游戏画布
 *
 * ============================================================
 *
 * 清除主棋盘 Canvas 上的所有绘制内容， 为重新绘制棋盘做准备。通常在每帧渲染开始时调用。
 *
 * @function clearBoard
 * @param {object} canvas - Canvas 画布管理器对象
 * @returns {void}
 */
export function clearBoard(canvas) {
  const { gameBoard, gameBoardContext } = canvas;
  const { width, height } = gameBoard;

  // 清空整个画布区域，为重新绘制棋盘做准备
  gameBoardContext.clearRect(0, 0, width, height);
}

export default clearBoard;
