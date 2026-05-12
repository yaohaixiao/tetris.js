/**
 * # 清空整个画布
 *
 * 为重新绘制棋盘做准备
 *
 * @function clearBoard
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
export function clearBoard(canvas) {
  const { gameBoard, gameBoardContext } = canvas;
  const { width, height } = gameBoard;

  // 清空整个画布，为重新绘制棋盘做准备
  gameBoardContext.clearRect(0, 0, width, height);
}

export default clearBoard;
