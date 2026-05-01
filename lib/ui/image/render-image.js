import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 渲染图片（Image Renderer）
 *
 * 在 canvas 上绘制已加载完成的图片资源。
 *
 * 特点：
 *
 * - 自动跳过未加载完成的图片
 * - 不污染外部 canvas 状态
 * - 统一尺寸绘制（square render）
 *
 * @param {HTMLImageElement} img - 图片对象
 * @param {number} x - 绘制起点 X 坐标
 * @param {number} y - 绘制起点 Y 坐标
 * @param {number} size - 绘制宽高（正方形）
 */
const renderImage = (img, x, y, size) => {
  const { gameBoardContext: ctx } = Canvas;

  // 如果图片未加载完成，跳过渲染
  if (!img.complete) {
    return;
  }

  // 保存画布状态，避免影响后续绘制
  ctx.save();

  // 绘制图片（固定为正方形）
  ctx.drawImage(img, x, y, size, size);

  // 恢复画布状态
  ctx.restore();
};

export default renderImage;
