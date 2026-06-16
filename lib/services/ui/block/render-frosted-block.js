import darken from '@/lib/utils/color/darken.js';
import hexToRgba from '@/lib/utils/color/hex-to-rgba.js';

/**
 * # 绘制毛玻璃质感方块（Frosted Glass Block）
 *
 * 半透明基底 + 顶部高光 + 噪点纹理 + 深色边框，营造磨砂玻璃的朦胧透视感。
 *
 * ## 视觉层次
 *
 * 1. **半透明基底** — 65% 不透明度的主色，让背景网格线透出
 * 2. **基底描边** — 75% 不透明度同色描边，消除基底边缘的锯齿毛边
 * 3. **顶部高光** — 白色到透明的纵向渐变，模拟玻璃表面反光
 * 4. **噪点纹理** — 随机半透明白色微点，模拟磨砂颗粒感
 * 5. **深色边框** — 比主色深 45% 的实色描边，勾勒清晰轮廓
 *
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布的 2D 渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸（包含间隙）
 * @param {number} x - 方块在网格中的列索引
 * @param {number} y - 方块在网格中的行索引
 * @param {string} color - 方块的主色调（十六进制颜色，如 "#FF6B6B"）
 * @returns {void}
 */
const renderFrostedBlock = (canvas, x, y, color) => {
  /*
   * ==================== 解构画布参数 ====================
   */
  const { gameBoardContext: ctx, blockSize } = canvas;

  /*
   * ==================== 计算坐标和尺寸 ====================
   */
  const gap = 1;
  const size = blockSize - gap;
  const px = x * blockSize + gap;
  const py = y * blockSize + gap;

  /*
   * ==================== 第一层：半透明基底 ====================
   *
   * 使用 65% 不透明度的主色填充，比光面玻璃稍低，
   * 让背景网格线更明显，增强毛玻璃的朦胧感。
   */
  ctx.fillStyle = hexToRgba(color, 0.65);
  ctx.fillRect(px, py, size, size);

  /*
   * ==================== 基底描边 ====================
   *
   * 消除半透明填充边缘可能出现的白边/毛边伪影。
   */
  ctx.strokeStyle = hexToRgba(color, 0.75);
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);

  /*
   * ==================== 保存上下文并裁剪 ====================
   */
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, size, size);
  ctx.clip();

  /*
   * ==================== 第二层：顶部淡高光 ====================
   *
   * 毛玻璃的高光范围更小、更淡，模拟粗糙表面的散射效果。
   */
  const topGradient = ctx.createLinearGradient(px, py, px, py + size);
  topGradient.addColorStop(0, hexToRgba('#FFFFFF', 0.15));
  topGradient.addColorStop(0.25, hexToRgba('#FFFFFF', 0));

  ctx.fillStyle = topGradient;
  ctx.fillRect(px, py, size, size);

  /*
   * ==================== 第三层：噪点纹理 ====================
   *
   * 在方块表面散布随机半透明白色微点，模拟磨砂颗粒感。
   * 噪点密度约 30%，每个点 1px，透明度随机 0.03 ~ 0.1。
   * 使用确定性伪随机，避免每帧闪烁。
   */
  const seed = (x * 31 + y * 17 + size * 13) % 1000;

  for (let i = 0; i < size * size * 0.3; i++) {
    const nx = px + ((seed + i * 7) % size);
    const ny = py + ((seed + i * 11) % size);
    const alpha = 0.03 + ((seed + i * 3) % 8) * 0.01;

    ctx.fillStyle = hexToRgba('#FFFFFF', alpha);
    ctx.fillRect(nx, ny, 1, 1);
  }

  /*
   * ==================== 恢复上下文状态 ====================
   */
  ctx.restore();

  /*
   * ==================== 第四层：深色边框 ====================
   *
   * 边框稍粗，强化毛玻璃的边界感。
   */
  ctx.strokeStyle = darken(color, 0.45);
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
};

export default renderFrostedBlock;
