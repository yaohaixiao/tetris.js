import darken from '@/lib/utils/color/darken.js';
import hexToRgba from '@/lib/utils/color/hex-to-rgba.js';

/**
 * ============================================================
 *
 * # 绘制毛玻璃质感方块
 *
 * ============================================================
 *
 * 半透明基底 + 顶部高光 + 噪点纹理 + 深色边框， 营造磨砂玻璃的朦胧透视感。
 *
 * ## 视觉层次
 *
 * 1. 半透明基底 — 65% 不透明度的主色，让背景网格线透出
 * 2. 基底描边 — 75% 不透明度同色描边，消除边缘锯齿
 * 3. 顶部高光 — 白色到透明的纵向渐变，模拟玻璃反光
 * 4. 噪点纹理 — 随机半透明白色微点，模拟磨砂颗粒感
 * 5. 深色边框 — 比主色深 45% 的实色描边，勾勒清晰轮廓
 *
 * @function renderFrostedBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext 游戏画布的 2D 渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块主色调（十六进制）
 * @returns {void}
 */
const renderFrostedBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;

  // 计算坐标和尺寸
  const gap = 1;
  const size = blockSize - gap;
  const px = x * blockSize + gap;
  const py = y * blockSize + gap;

  /*
   * ============================================================
   * 步骤 1：半透明基底 + 基底描边
   * ============================================================
   *
   * 65% 不透明度的主色填充，比光面玻璃稍低，
   * 让背景网格线更明显，增强毛玻璃的朦胧感。
   * 基底描边消除半透明填充边缘的毛边伪影。
   * ============================================================
   */
  ctx.fillStyle = hexToRgba(color, 0.65);
  ctx.fillRect(px, py, size, size);

  ctx.strokeStyle = hexToRgba(color, 0.75);
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);

  /*
   * ============================================================
   * 步骤 2：裁剪区域 + 顶部高光
   * ============================================================
   *
   * 毛玻璃的高光范围更小、更淡，模拟粗糙表面的散射效果。
   * ============================================================
   */
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, size, size);
  ctx.clip();

  const topGradient = ctx.createLinearGradient(px, py, px, py + size);
  topGradient.addColorStop(0, hexToRgba('#FFFFFF', 0.15));
  topGradient.addColorStop(0.25, hexToRgba('#FFFFFF', 0));

  ctx.fillStyle = topGradient;
  ctx.fillRect(px, py, size, size);

  /*
   * ============================================================
   * 步骤 3：噪点纹理
   * ============================================================
   *
   * 在方块表面散布随机半透明白色微点，模拟磨砂颗粒感。
   * 噪点密度约 30%，每个点 1px，透明度随机 0.03 ~ 0.1。
   * 使用确定性伪随机，避免每帧闪烁。
   * ============================================================
   */
  const seed = (x * 31 + y * 17 + size * 13) % 1000;

  for (let i = 0; i < size * size * 0.3; i++) {
    const nx = px + ((seed + i * 7) % size);
    const ny = py + ((seed + i * 11) % size);
    const alpha = 0.03 + ((seed + i * 3) % 8) * 0.01;

    ctx.fillStyle = hexToRgba('#FFFFFF', alpha);
    ctx.fillRect(nx, ny, 1, 1);
  }

  // 恢复上下文，移除裁剪区域
  ctx.restore();

  /*
   * ============================================================
   * 步骤 4：深色边框
   * ============================================================
   *
   * 边框稍粗，强化毛玻璃的边界感。
   * ============================================================
   */
  ctx.strokeStyle = darken(color, 0.45);
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
};

export default renderFrostedBlock;
