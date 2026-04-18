import Canvas from '@/lib/ui/canvas.js';

/**
 * # 清空整个画布
 *
 * 为重新绘制棋盘做准备
 *
 * @function clearBoard
 * @returns {void}
 */
export function clearBoard() {
  const { gameBoard, gameBoardContext } = Canvas;
  const { width, height } = gameBoard;

  // 清空整个画布，为重新绘制棋盘做准备
  gameBoardContext.clearRect(0, 0, width, height);
}

export default clearBoard;
