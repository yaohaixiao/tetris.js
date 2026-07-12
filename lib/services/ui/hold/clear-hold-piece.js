/**
 * ============================================================
 *
 * # 清空暂存预览画布
 *
 * ============================================================
 *
 * 清除 Hold 预览区域的整个画布，为下一次渲染做准备。 每次暂存区内容变化时，需要先清空画布再重新绘制， 避免新旧方块重叠显示。
 *
 * @function clearHoldPiece
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} canvas.nextPiece - 预览区域尺寸配置对象
 * @param {number} canvas.nextPiece.width - 预览区域宽度
 * @param {number} canvas.nextPiece.height - 预览区域高度
 * @param {CanvasRenderingContext2D} canvas.holdPieceContext 暂存预览画布的 2D 渲染上下文
 * @returns {void}
 */
const clearHoldPiece = (canvas) => {
  const { nextPiece, holdPieceContext } = canvas;
  const { width, height } = nextPiece;

  // 清除整个预览区域
  holdPieceContext.clearRect(0, 0, width, height);
};

export default clearHoldPiece;
