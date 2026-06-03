/**
 * # 清空暂存预览画布
 *
 * 清除 Hold 预览区域的整个画布，为下一次渲染做准备。
 *
 * 每次暂存区内容变化时，需要先清空画布再重新绘制， 避免新旧方块重叠显示。
 *
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} canvas.nextPiece - 预览区域尺寸配置对象
 * @param {number} canvas.nextPiece.width - 预览区域宽度（像素）
 * @param {number} canvas.nextPiece.height - 预览区域高度（像素）
 * @param {CanvasRenderingContext2D} canvas.holdPieceContext - 暂存预览画布的 2D 渲染上下文
 * @returns {void}
 */
const clearHoldPiece = (canvas) => {
  /*
   * ==================== 解构画布参数 ====================
   *
   * 提取暂存预览画布的渲染上下文和区域尺寸
   */
  const { nextPiece, holdPieceContext } = canvas;
  const { width, height } = nextPiece;

  /*
   * ==================== 清空画布 ====================
   *
   * 清除从 (0, 0) 到 (width, height) 的整个预览区域
   */
  holdPieceContext.clearRect(0, 0, width, height);
};

export default clearHoldPiece;
