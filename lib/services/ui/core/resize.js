/**
 * # 自适应画布尺寸（Resize）
 *
 * 根据当前窗口尺寸重新计算并设置游戏棋盘和预览画布的大小， 同时更新方块尺寸和字体大小等全局参数。
 *
 * ## 计算逻辑
 *
 * ### 主画布
 *
 * - **高度基准**：窗口高度的 90%
 * - **方块尺寸**：高度基准 ÷ 行数（向下取整）
 * - **画布宽度**：方块尺寸 × 列数
 * - **画布高度**：方块尺寸 × 行数
 * - **字体大小**：画布高度 × 3.2%
 *
 * ### 预览画布
 *
 * - **尺寸限制**：取窗口宽度 10% 和高度 18% 中的较小值
 * - **形状**：正方形
 *
 * @function resize
 * @param {object} canvas - Canvas 画布管理器对象
 * @returns {void}
 */
const resize = (canvas) => {
  const { gameBoard, nextPiece, rows, cols } = canvas;
  const { innerWidth, innerHeight } = globalThis;
  let blockSize;
  let nextSize;

  // 针对
  if (innerWidth >= 480) {
    /**
     * ======== 1. 计算主画布高度基准 ========
     *
     * 使用窗口高度的 90% 作为游戏区域高度， 确保整体布局在可视区域内。
     */
    const h = innerHeight * 0.9;

    /**
     * ======== 2. 计算单个方块尺寸 ========
     *
     * 根据总行数将高度均分，得到每个方块的像素大小。 向下取整避免浮点数导致的模糊。
     */
    blockSize = Math.floor(h / rows);

    /**
     * ======== 3. 设置预览画布尺寸 ========
     *
     * 使用窗口宽高的较小值作为限制：
     *
     * - 最大不超过宽度的 10%
     * - 最大不超过高度的 18%
     */
    nextSize = Math.min(innerWidth * 0.1, innerHeight * 0.18);
  } else {
    // 1. 计算主画布宽度基准
    const width = innerWidth * 0.64;

    // 2. 计算单个方块尺寸
    blockSize = Math.min(
      Math.floor(width / cols),
      Math.floor((innerHeight * 0.68) / rows),
    );

    // 3. 计算预览区（可选：单独逻辑）大小
    nextSize = blockSize * 5;
  }
  /**
   * ======== 计算基础字体大小 ========
   *
   * 基于画布高度按比例缩放（3.2%）， 用于统一 UI 文本尺寸。
   */
  const fontSize = Math.floor(blockSize * rows * 0.032);

  canvas.blockSize = blockSize;
  gameBoard.width = blockSize * cols;
  gameBoard.height = blockSize * rows;
  canvas.fontSize = fontSize;

  nextPiece.width = nextSize;
  nextPiece.height = nextSize;
};

export default resize;
