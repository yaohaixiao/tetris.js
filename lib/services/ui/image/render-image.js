/**
 * # 渲染图片（Image Renderer）
 *
 * 在 Canvas 上以正方形方式绘制已加载完成的图片资源。
 *
 * ## 特点
 *
 * - **自动跳过**：如果图片未加载完成（`img.complete === false`），安全跳过
 * - **不污染状态**：使用 `ctx.save()` / `ctx.restore()` 保护画布状态
 * - **统一尺寸**：固定为正方形绘制（`size × size`）
 *
 * @example
 *   const img = getImage(someSvgString);
 *   renderImage(canvas, {
 *     img,
 *     x: 100,
 *     y: 200,
 *     size: 300,
 *   });
 *
 * @function renderImage
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布渲染上下文
 * @param {object} options - 渲染选项
 * @param {HTMLImageElement} options.img - 已加载的图片对象
 * @param {number} options.x - 绘制起点 X 坐标
 * @param {number} options.y - 绘制起点 Y 坐标
 * @param {number} options.size - 绘制尺寸（正方形边长）
 * @returns {void}
 */
const renderImage = (canvas, options) => {
  const { gameBoardContext: ctx } = canvas;
  const { img, x, y, size } = options;

  // 图片未加载完成，跳过渲染（避免空白或报错）
  if (!img.complete) {
    return;
  }

  // 保存当前画布状态，避免影响后续绘制
  ctx.save();

  // 以正方形方式绘制图片
  ctx.drawImage(img, x, y, size, size);

  // 恢复画布状态
  ctx.restore();
};

export default renderImage;
