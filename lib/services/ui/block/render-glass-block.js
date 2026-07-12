import COLORS from '@/lib/constants/colors.js';
import darken from '@/lib/utils/color/darken.js';
import hexToRgba from '@/lib/utils/color/hex-to-rgba.js';

/**
 * ============================================================
 *
 * # 绘制玻璃质感方块
 *
 * ============================================================
 *
 * 半透明基底 + 顶部高光 + 深色边框， 营造彩色玻璃的透视感和立体感。
 *
 * ## 视觉层次
 *
 * 1. 半透明基底 — 70% 不透明度的主色，让背景网格线透出
 * 2. 基底描边 — 80% 不透明度同色描边，消除边缘锯齿
 * 3. 顶部高光 — 白色到透明的纵向渐变，模拟玻璃反光
 * 4. 深色边框 — 比主色深 45% 的实色描边，勾勒清晰轮廓
 *
 * ## 坐标计算
 *
 * - Px = x × blockSize + gap
 * - Py = y × blockSize + gap
 * - Size = blockSize - gap
 *
 * @function renderGlassBlock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext 游戏画布的 2D 渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} x - 列索引
 * @param {number} y - 行索引
 * @param {string} color - 方块主色调（十六进制）
 * @returns {void}
 */
const renderGlassBlock = (canvas, x, y, color) => {
  const { gameBoardContext: ctx, blockSize } = canvas;
  const { WHITE } = COLORS;

  // 计算坐标和尺寸
  const gap = 1;
  const size = blockSize - gap;
  const px = x * blockSize + gap;
  const py = y * blockSize + gap;

  /*
   * ============================================================
   * 步骤 1：半透明基底
   * ============================================================
   *
   * 70% 不透明度的主色填充，让背景网格线能够隐约透出。
   * ============================================================
   */
  ctx.fillStyle = hexToRgba(color, 0.65);
  ctx.fillRect(px, py, size, size);

  /*
   * ============================================================
   * 步骤 2：裁剪区域 + 顶部高光
   * ============================================================
   *
   * 创建矩形裁剪路径，确保高光渐变只出现在方块内部。
   * 白色到透明的纵向渐变，模拟玻璃表面反光。
   * ============================================================
   */
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, size, size);
  ctx.clip();

  const topGradient = ctx.createLinearGradient(px, py, px, py + size);
  topGradient.addColorStop(0, hexToRgba(WHITE, 0.25));
  topGradient.addColorStop(0.4, hexToRgba(WHITE, 0));

  ctx.fillStyle = topGradient;
  ctx.fillRect(px, py, size, size);

  // 恢复上下文，移除裁剪区域
  ctx.restore();

  /*
   * ============================================================
   * 步骤 3：深色边框
   * ============================================================
   *
   * 比主色深 35% 的实色边框，勾勒出清晰的方块轮廓。
   * ============================================================
   */
  ctx.strokeStyle = darken(color, 0.35);
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
};

export default renderGlassBlock;
