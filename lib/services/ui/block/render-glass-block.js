import darken from '@/lib/utils/darken.js';
import hexToRgba from '@/lib/utils/hex-to-rgba.js';

/**
 * # 绘制玻璃质感方块（Glass Block）
 *
 * 半透明基底 + 顶部高光 + 深色边框，营造彩色玻璃的透视感和立体感。
 *
 * ## 视觉层次
 *
 * 1. **半透明基底** — 70% 不透明度的主色，让背景网格线透出
 * 2. **基底描边** — 80% 不透明度同色描边，消除基底边缘的锯齿毛边
 * 3. **顶部高光** — 白色到透明的纵向渐变，模拟玻璃表面反光
 * 4. **深色边框** — 比主色深 35% 的实色描边，勾勒清晰轮廓
 *
 * ## 坐标计算
 *
 * - `px = x × blockSize + gap` — 像素 X 坐标（跳过左侧间隙）
 * - `py = y × blockSize + gap` — 像素 Y 坐标（跳过上方间隙）
 * - `size = blockSize - gap` — 实际绘制尺寸（扣除单侧间隙，保持方块间 1px 网格线）
 *
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 游戏画布的 2D 渲染上下文
 * @param {number} canvas.blockSize - 单个方块的像素尺寸（包含间隙）
 * @param {number} x - 方块在网格中的列索引
 * @param {number} y - 方块在网格中的行索引
 * @param {string} color - 方块的主色调（十六进制颜色，如 "#FF6B6B"）
 * @returns {void}
 */
const renderGlassBlock = (canvas, x, y, color) => {
  // 解构获取画布上下文和方块尺寸
  const { gameBoardContext: ctx, blockSize } = canvas;

  // 方块之间的间隔间隙（1px），形成网格分离效果
  const gap = 1;
  // 实际绘制的方块大小（扣除间隙，让相邻方块间有 1px 的网格线）
  const size = blockSize - gap;
  // 计算方块在 Canvas 上的像素坐标（加上间隙偏移，让网格线显示在方块左侧和上方）
  const px = x * blockSize + gap;
  const py = y * blockSize + gap;

  /*
   * ==================== 第一层：半透明基底 ====================
   *
   * 使用 70% 不透明度的主色填充，让背景网格线能够隐约透出
   * 这是玻璃质感的核心——不是实心色块，而是能看到背景的透明层
   */
  ctx.fillStyle = hexToRgba(color, 0.7);
  ctx.fillRect(px, py, size, size);

  /*
   * ==================== 基底描边 ====================
   *
   * 消除半透明填充边缘可能出现的白边/毛边伪影
   * 用 80% 不透明度的同色描边覆盖基底边缘，比 fill 稍不透明一点
   * 让边缘和内部过渡自然，不会在后续深色边框内侧留下缝隙
   */
  ctx.strokeStyle = hexToRgba(color, 0.8);
  ctx.lineWidth = 1; // 1px 细线，刚好覆盖边缘像素
  // strokeRect 偏移 0.5px，让 1px 线条居中落在像素边界上，避免模糊
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);

  /*
   * ==================== 保存上下文状态 ====================
   *
   * 保存当前 Canvas 状态（变换、裁剪区域等），后续的 clip 操作不会影响外部绘制
   */
  ctx.save();

  /*
   * 创建矩形裁剪路径，限制后续绘制不会超出方块范围
   * 确保高光渐变只出现在方块内部，不会溢出到网格线上
   */
  ctx.beginPath();
  ctx.rect(px, py, size, size);
  ctx.clip();

  /*
   * ==================== 第二层：顶部淡高光 ====================
   *
   * 纵向线性渐变：从顶部向下 40% 区域，白色逐渐衰减到完全透明
   * 模拟光线从上方照射在玻璃表面的反光效果
   * 高光只覆盖方块上半部分，下半部分保持基底原色
   */
  const topGradient = ctx.createLinearGradient(px, py, px, py + size);
  topGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)'); // 顶部：25% 不透明的白色高光
  topGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)'); // 40% 处：完全透明，高光消失

  ctx.fillStyle = topGradient;
  ctx.fillRect(px, py, size, size);

  /*
   * ==================== 恢复上下文状态 ====================
   *
   * 恢复之前保存的状态，移除 clip 裁剪区域，后续绘制不再受限
   */
  ctx.restore();

  /*
   * ==================== 第三层：深色边框 ====================
   *
   * 比主色深 45% 的实色边框，勾勒出清晰的方块轮廓
   * 深色边框与内部半透明玻璃形成对比，增强立体感和辨识度
   */
  ctx.strokeStyle = darken(color, 0.45); // 将主色亮度降低 45%
  ctx.lineWidth = 2; // 2px 线宽，比默认 1px 稍粗，轮廓更清晰利落

  /*
   * strokeRect 偏移 0.5px（线宽的一半），让线条居中落在像素边界上
   * 尺寸减 1px（线宽），保证边框完全在方块范围内，不侵占相邻网格线
   */
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
};

export default renderGlassBlock;
