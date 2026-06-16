import darken from '@/lib/utils/color/darken.js';
import lighten from '@/lib/utils/color/lighten.js';

/**
 * # 绘制立体风格方块（Shaded Block）
 *
 * 通过 4 色几何分块模拟立体光照效果：
 *
 * - 左高光面（主色）
 * - 右阴影面（微暗）
 * - 上半亮色条
 * - 下半暗色条
 *
 * ## 视觉原理
 *
 * 将方块沿对角线分割为 4 个区域，分别填充不同明度的颜色， 产生"左上光源、右下阴影"的立体感。
 *
 *      ┌─────────┐
 *      │ \ 上亮 / │
 *      │左 \  / 右│
 *      │高  \/  阴│
 *      │光  /\  影│
 *      │   /  \  │
 *      │  / 下暗\ │
 *      └─────────┘
 *
 * ## 4 色方案
 *
 * | 区域   | 颜色   | 计算                 | 说明           |
 * | ------ | ------ | -------------------- | -------------- |
 * | 底部   | darker | darken(color, 0.22)  | 最暗，下半矩形 |
 * | 顶部   | light  | lighten(color, 0.08) | 微亮，上半矩形 |
 * | 左三角 | base   | color                | 主色本身       |
 * | 右三角 | dark   | darken(color, 0.12)  | 微暗           |
 *
 * @function renderShadedBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块主色（十六进制，如 `#ffa500`）
 * @returns {void}
 */
const renderShadedBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;

  // 方块左上角像素坐标
  const px = x * blockSize;
  const py = y * blockSize;
  const w = blockSize;
  const h = blockSize;

  // 4 色方案（和参考代码一致）
  const base = color; // 主色：用于左高光三角
  const light = lighten(color, 0.08); // 微亮：顶部细条
  const dark = darken(color, 0.12); // 微暗：右侧阴影三角
  const darker = darken(color, 0.22); // 较暗：底部阴影矩形

  /**
   * 1. 底部暗色
   *
   * 整个下半矩形填充最暗色，作为底部阴影区域。
   */
  ctx.fillStyle = darker;
  ctx.fillRect(px, py + h / 2, w, h / 2);

  /**
   * 2. 顶部亮色
   *
   * 整个上半矩形填充微亮色，作为顶部受光区域。
   */
  ctx.fillStyle = light;
  ctx.fillRect(px, py, w, h / 2);

  /**
   * 3. 左高光三角
   *
   * 从左上角 → 中心点 → 左下角， 填充主色本身，作为高光面。
   */
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(px, py); // 左上角
  ctx.lineTo(px + w / 2, py + h / 2); // 中心点
  ctx.lineTo(px, py + h); // 左下角
  ctx.fill();

  /**
   * 4. 右阴影三角
   *
   * 从右上角 → 中心点 → 右下角， 填充微暗色，作为背光阴影面。
   */
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(px + w, py); // 右上角
  ctx.lineTo(px + w / 2, py + h / 2); // 中心点
  ctx.lineTo(px + w, py + h); // 右下角
  ctx.fill();
};

export default renderShadedBlock;
